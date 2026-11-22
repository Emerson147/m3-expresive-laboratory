import { ApplicationRef, DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StageOverlayService } from '../dialog/stage-overlay.service';
import {
  AdmitPatientDto,
  BedFilterStatus,
  BedStatus,
  ClinicKpiSummary,
  ClinicalNoteEntry,
  DischargeDisposition,
  DischargeRecord,
  EMERGENCY_CODE_PRESETS,
  EmergencyBed,
  EmergencyCode,
  EmergencyCodeType,
  News2Assessment,
  News2RiskLevel,
  PatientTriageRecord,
  PatientVitals,
  TRIAGE_SLA_MINUTES,
  TriageFilter,
  TriageLevel,
  TriageSortMode,
  UrgentBedCandidate,
  VitalReadingSnapshot
} from './clinic.models';

const TRIAGE_PRIORITY_RANK: Record<TriageLevel, number> = {
  resuscitation: 0,
  emergency: 1,
  urgent: 2,
  standard: 3,
  non_urgent: 4
};

const DISPOSITION_NOTIFICATION_LABEL: Record<DischargeDisposition, string> = {
  home: 'Alta médica registrada',
  ward: 'Pase a hospitalización registrado',
  icu: 'Traslado a UCI registrado'
};

interface ClinicUndoSnapshot {
  patients: PatientTriageRecord[];
  beds: EmergencyBed[];
  dischargeHistory: DischargeRecord[];
  selectedPatientId: string | null;
  description: string;
}

function clonePatients(list: readonly PatientTriageRecord[]): PatientTriageRecord[] {
  return list.map((p) => ({
    ...p,
    vitals: { ...p.vitals },
    vitalsHistory: p.vitalsHistory.map((h) => ({ ...h, vitals: { ...h.vitals } })),
    news2: { ...p.news2, triggers: [...p.news2.triggers] },
    activeCode: p.activeCode
      ? { ...p.activeCode, steps: p.activeCode.steps.map((s) => ({ ...s })) }
      : undefined,
    allergies: [...p.allergies],
    clinicalLog: p.clinicalLog.map((n) => ({ ...n }))
  }));
}

function cloneBeds(list: readonly EmergencyBed[]): EmergencyBed[] {
  return list.map((b) => ({ ...b, equipment: [...b.equipment] }));
}

function buildEmergencyCode(type: EmergencyCodeType, elapsedMinutes = 0): EmergencyCode {
  const preset = EMERGENCY_CODE_PRESETS[type];
  return {
    type: preset.type,
    title: preset.title,
    windowLabel: preset.windowLabel,
    targetMinutes: preset.targetMinutes,
    elapsedMinutes,
    remainingMinutes: Math.max(0, preset.targetMinutes - elapsedMinutes),
    protocolAction: preset.protocolAction,
    steps: preset.defaultSteps.map((label, idx) => ({
      id: `${type}-step-${idx + 1}`,
      label,
      completed: elapsedMinutes > 0 && idx === 0
    }))
  };
}

function formatCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function isPatientSlaBreached(patient: PatientTriageRecord): boolean {
  if (patient.bedAssignedId) return false;
  const target = TRIAGE_SLA_MINUTES[patient.triageLevel];
  return target === 0 ? patient.waitingMinutes > 2 : patient.waitingMinutes > target;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private readonly appRef = inject(ApplicationRef);
  private readonly stageOverlay = inject(StageOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private liveTimerId: ReturnType<typeof setInterval> | null = null;
  private undoSnapshot: ClinicUndoSnapshot | null = null;
  private admissionSeq = 8;

  /**
   * Computes the full Royal College of Physicians NEWS2 clinical score (/20).
   */
  static computeNews2(vitals: PatientVitals): News2Assessment {
    let score = 0;
    let hasSingleExtremeParam = false;
    const triggers: string[] = [];

    const respRate = vitals.respRate ?? 16;
    const supplementalO2 = vitals.supplementalO2 ?? false;
    const consciousness = vitals.consciousness ?? 'A';

    // 1. Respiration rate
    if (respRate <= 8) {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(`Bradipnea Severa (${respRate} rpm ≤ 8)`);
    } else if (respRate <= 11) {
      score += 1;
    } else if (respRate >= 25) {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(`Taquipnea Severa (${respRate} rpm ≥ 25)`);
    } else if (respRate >= 21) {
      score += 2;
      triggers.push(`Taquipnea Moderada (${respRate} rpm)`);
    }

    // 2. Oxygen Saturation (SpO2 Scale 1)
    if (vitals.oxygenSat <= 91) {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(`Hipoxemia Severa (SpO₂ ${vitals.oxygenSat}% ≤ 91%)`);
    } else if (vitals.oxygenSat <= 93) {
      score += 2;
      triggers.push(`Hipoxemia Moderada (SpO₂ ${vitals.oxygenSat}%)`);
    } else if (vitals.oxygenSat <= 95) {
      score += 1;
    }

    // 3. Supplemental Oxygen
    if (supplementalO2) {
      score += 2;
      triggers.push('Oxígeno Suplementario Activo (+2)');
    }

    // 4. Systolic Blood Pressure
    if (vitals.bloodPressureSys <= 90) {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(`Hipotensión Severa / Shock (PAS ${vitals.bloodPressureSys} mmHg)`);
    } else if (vitals.bloodPressureSys <= 100) {
      score += 2;
      triggers.push(`Hipotensión Moderada (PAS ${vitals.bloodPressureSys} mmHg)`);
    } else if (vitals.bloodPressureSys <= 110) {
      score += 1;
    } else if (vitals.bloodPressureSys >= 220) {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(`Crisis Hipertensiva Extrema (PAS ${vitals.bloodPressureSys} mmHg)`);
    }

    // 5. Heart Rate (Pulse)
    if (vitals.heartRate <= 40 || vitals.heartRate >= 131) {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(
        vitals.heartRate <= 40
          ? `Bradicardia Extrema (${vitals.heartRate} bpm)`
          : `Taquicardia Extrema (${vitals.heartRate} bpm)`
      );
    } else if (vitals.heartRate >= 111 && vitals.heartRate <= 130) {
      score += 2;
      triggers.push(`Taquicardia Severa (${vitals.heartRate} bpm)`);
    } else if (
      (vitals.heartRate >= 41 && vitals.heartRate <= 50) ||
      (vitals.heartRate >= 91 && vitals.heartRate <= 110)
    ) {
      score += 1;
    }

    // 6. Consciousness (ACVPU)
    if (consciousness !== 'A') {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(`Alteración Conciencia ACVPU: ${consciousness}`);
    }

    // 7. Temperature
    if (vitals.temperature <= 35.0) {
      score += 3;
      hasSingleExtremeParam = true;
      triggers.push(`Hipotermia Severa (${vitals.temperature}°C ≤ 35.0)`);
    } else if (vitals.temperature >= 39.1) {
      score += 2;
      triggers.push(`Fiebre Alta (${vitals.temperature}°C ≥ 39.1)`);
    } else if (
      (vitals.temperature >= 35.1 && vitals.temperature <= 36.0) ||
      (vitals.temperature >= 38.1 && vitals.temperature <= 39.0)
    ) {
      score += 1;
    }

    let riskLevel: News2RiskLevel = 'low';
    let recommendation = 'Riesgo clínico bajo. Control de enfermería programado.';

    if (score >= 7 || hasSingleExtremeParam) {
      riskLevel = 'high';
      recommendation =
        score >= 7
          ? 'Riesgo clínico crítico (score ≥ 7). Respuesta médica inmediata y monitorización continua.'
          : 'Alerta crítica por parámetro único extremo (+3). Valoración médica prioritaria inmediata.';
    } else if (score >= 5) {
      riskLevel = 'medium';
      recommendation = 'Riesgo clínico medio. Evaluación médica urgente y reevaluación cada 30–60 min.';
    } else if (score >= 3) {
      riskLevel = 'low_medium';
      recommendation = 'Riesgo clínico leve-moderado. Alerta de enfermería y control cada 60 min.';
    }

    return { score, riskLevel, recommendation, triggers };
  }

  private buildInitialPatient(
    seed: Omit<PatientTriageRecord, 'news2' | 'vitalsHistory' | 'clinicalLog'> & {
      initialNotesLog?: ClinicalNoteEntry[];
    }
  ): PatientTriageRecord {
    const news2 = ClinicService.computeNews2(seed.vitals);
    const snapshot: VitalReadingSnapshot = {
      id: `vs-${seed.id}-0`,
      timestamp: seed.admissionTime,
      news2Score: news2.score,
      riskLevel: news2.riskLevel,
      vitals: { ...seed.vitals },
      note: 'Toma inicial de ingreso en triaje'
    };

    const clinicalLog: ClinicalNoteEntry[] =
      seed.initialNotesLog ??
      (seed.notes
        ? [
            {
              id: `note-${seed.id}-0`,
              timestamp: seed.admissionTime,
              author: 'Triaje Guardia',
              text: seed.notes,
              kind: seed.activeCode ? 'alert' : 'evolution'
            }
          ]
        : []);

    return {
      ...seed,
      news2,
      vitalsHistory: [snapshot],
      clinicalLog
    };
  }

  private readonly initialPatients: PatientTriageRecord[] = [
    this.buildInitialPatient({
      id: 'pt-1',
      ticketCode: 'TR-089',
      fullName: 'Carlos Méndez',
      age: 58,
      gender: 'M',
      triageLevel: 'resuscitation',
      chiefComplaint: 'Dolor precordial opresivo con irradiación a mandíbula y diaforesis',
      admissionTime: '17:15',
      admissionSequence: 1,
      waitingMinutes: 2,
      vitals: {
        heartRate: 124,
        respRate: 24,
        bloodPressureSys: 175,
        bloodPressureDia: 105,
        oxygenSat: 90,
        supplementalO2: true,
        temperature: 36.8,
        consciousness: 'A',
        painScale: 9
      },
      activeCode: buildEmergencyCode('code_stemi', 32),
      bedAssignedId: 'ST-01',
      status: 'in_observation',
      allergies: ['Penicilina', 'Sulfas'],
      notes:
        'Protocolo coronario agudo iniciado. EKG a los 4 min con supradesnivel ST en DII-DIII-aVF.'
    }),
    this.buildInitialPatient({
      id: 'pt-2',
      ticketCode: 'TR-091',
      fullName: 'Lucía Morales',
      age: 34,
      gender: 'F',
      triageLevel: 'emergency',
      chiefComplaint: 'Disnea súbita y estridor laríngeo post ingesta alimentaria',
      admissionTime: '17:28',
      admissionSequence: 2,
      waitingMinutes: 8,
      vitals: {
        heartRate: 116,
        respRate: 26,
        bloodPressureSys: 96,
        bloodPressureDia: 60,
        oxygenSat: 92,
        supplementalO2: true,
        temperature: 37.1,
        consciousness: 'A',
        painScale: 7
      },
      activeCode: buildEmergencyCode('code_anaphylaxis', 8),
      status: 'waiting_bed',
      allergies: ['Mariscos', 'AINEs'],
      notes: 'Edema de úvula incipiente. Se requiere asignación prioritaria a Shock Trauma.'
    }),
    this.buildInitialPatient({
      id: 'pt-3',
      ticketCode: 'TR-094',
      fullName: 'Roberto Albarracín',
      age: 71,
      gender: 'M',
      triageLevel: 'emergency',
      chiefComplaint: 'Déficit neurológico focal agudo: asimetría facial y disartria severa',
      admissionTime: '17:35',
      admissionSequence: 3,
      waitingMinutes: 12,
      vitals: {
        heartRate: 88,
        respRate: 18,
        bloodPressureSys: 185,
        bloodPressureDia: 110,
        oxygenSat: 96,
        supplementalO2: false,
        temperature: 36.5,
        consciousness: 'V',
        painScale: 3
      },
      activeCode: buildEmergencyCode('code_stroke', 22),
      bedAssignedId: 'ST-02',
      status: 'in_observation',
      allergies: [],
      notes: 'NIHSS inicial estimado en 14. Ventana terapéutica de 4.5 horas desde inicio.'
    }),
    this.buildInitialPatient({
      id: 'pt-4',
      ticketCode: 'TR-098',
      fullName: 'Valentina Ríos',
      age: 27,
      gender: 'F',
      triageLevel: 'urgent',
      chiefComplaint: 'Dolor fosa ilíaca derecha continuo de 14h de evolución, Blumberg (+)',
      admissionTime: '17:42',
      admissionSequence: 4,
      waitingMinutes: 24,
      vitals: {
        heartRate: 98,
        respRate: 19,
        bloodPressureSys: 115,
        bloodPressureDia: 75,
        oxygenSat: 98,
        supplementalO2: false,
        temperature: 38.5,
        consciousness: 'A',
        painScale: 8
      },
      bedAssignedId: 'OB-01',
      status: 'in_observation',
      allergies: ['Látex'],
      notes: 'Interconsulta con cirugía general solicitada. Ecografía abdominal en curso.'
    }),
    this.buildInitialPatient({
      id: 'pt-5',
      ticketCode: 'TR-101',
      fullName: 'Martín Gómez',
      age: 45,
      gender: 'M',
      triageLevel: 'urgent',
      chiefComplaint: 'Traumatismo cerrado de tobillo con gran deformidad articular',
      admissionTime: '17:50',
      admissionSequence: 5,
      waitingMinutes: 64,
      vitals: {
        heartRate: 84,
        respRate: 17,
        bloodPressureSys: 132,
        bloodPressureDia: 82,
        oxygenSat: 99,
        supplementalO2: false,
        temperature: 36.9,
        consciousness: 'A',
        painScale: 7
      },
      status: 'waiting_bed',
      allergies: [],
      notes: 'Inmovilización provisoria colocada. Rx de tobillo solicitada.'
    }),
    this.buildInitialPatient({
      id: 'pt-6',
      ticketCode: 'TR-103',
      fullName: 'Elena Castro',
      age: 22,
      gender: 'F',
      triageLevel: 'standard',
      chiefComplaint: 'Cefalea pulsátil holocraneana de 24h sin signos meníngeos ni focalidad',
      admissionTime: '18:02',
      admissionSequence: 6,
      waitingMinutes: 44,
      vitals: {
        heartRate: 72,
        respRate: 15,
        bloodPressureSys: 110,
        bloodPressureDia: 70,
        oxygenSat: 99,
        supplementalO2: false,
        temperature: 36.6,
        consciousness: 'A',
        painScale: 4
      },
      status: 'waiting_bed',
      allergies: [],
      notes: 'Migraña común previa. Se indica hidratación y analgesia oral.'
    }),
    this.buildInitialPatient({
      id: 'pt-7',
      ticketCode: 'TR-105',
      fullName: 'Joaquín Paredes',
      age: 39,
      gender: 'M',
      triageLevel: 'non_urgent',
      chiefComplaint: 'Solicitud de certificado médico y control de tratamiento hipertensivo',
      admissionTime: '18:10',
      admissionSequence: 7,
      waitingMinutes: 52,
      vitals: {
        heartRate: 68,
        respRate: 14,
        bloodPressureSys: 128,
        bloodPressureDia: 82,
        oxygenSat: 99,
        supplementalO2: false,
        temperature: 36.5,
        consciousness: 'A',
        painScale: 0
      },
      status: 'waiting_bed',
      allergies: [],
      notes: 'Paciente hemodinámicamente estable, sin criterios de riesgo agudo.'
    })
  ];

  private readonly initialBeds: EmergencyBed[] = [
    {
      id: 'ST-01',
      name: 'Shock Trauma 01',
      area: 'shock_trauma',
      status: 'occupied',
      patientId: 'pt-1',
      patientName: 'Carlos Méndez (TR-089)',
      equipment: ['Monitor Invasivo', 'Desfibrilador', 'Ventilador']
    },
    {
      id: 'ST-02',
      name: 'Shock Trauma 02',
      area: 'shock_trauma',
      status: 'occupied',
      patientId: 'pt-3',
      patientName: 'Roberto Albarracín (TR-094)',
      equipment: ['Monitor Multiparámetro', 'Aspiración Central', 'Bomba Infusión']
    },
    {
      id: 'OB-01',
      name: 'Observación 01',
      area: 'observation',
      status: 'occupied',
      patientId: 'pt-4',
      patientName: 'Valentina Ríos (TR-098)',
      equipment: ['Monitor Signos Vitales', 'Oxígeno de Pared']
    },
    {
      id: 'OB-02',
      name: 'Observación 02',
      area: 'observation',
      status: 'available',
      patientId: null,
      equipment: ['Monitor Signos Vitales', 'Oxígeno de Pared']
    },
    {
      id: 'OB-03',
      name: 'Observación 03',
      area: 'observation',
      status: 'cleaning',
      patientId: null,
      equipment: ['Monitor Signos Vitales']
    },
    {
      id: 'OB-04',
      name: 'Observación 04',
      area: 'observation',
      status: 'available',
      patientId: null,
      equipment: ['Monitor Signos Vitales']
    },
    {
      id: 'PR-01',
      name: 'Procedimientos 01',
      area: 'procedure',
      status: 'available',
      patientId: null,
      equipment: ['Lámpara Quirúrgica', 'Carro de Curación']
    },
    {
      id: 'PR-02',
      name: 'Procedimientos 02',
      area: 'procedure',
      status: 'available',
      patientId: null,
      equipment: ['Equipo Férulas y Yeso']
    }
  ];

  // Primary State Signals
  readonly patients = signal<PatientTriageRecord[]>(this.initialPatients);
  readonly beds = signal<EmergencyBed[]>(this.initialBeds);
  readonly dischargeHistory = signal<DischargeRecord[]>([]);
  readonly activeFilter = signal<TriageFilter>('all');
  readonly sortMode = signal<TriageSortMode>('clinical');
  readonly bedFilterStatus = signal<BedFilterStatus>('all');
  readonly searchQuery = signal<string>('');
  readonly isLiveMonitoring = signal<boolean>(false);
  readonly canUndoLastAction = signal<boolean>(false);

  private readonly _selectedPatientId = signal<string | null>(this.initialPatients[0].id);

  // Native Top-Layer Modal State with Strict Single-Owner dialog-transform Coordination
  readonly isAdmissionDialogOpen = signal<boolean>(false);
  readonly chartModalPatientId = signal<string | null>(null);
  readonly dischargeModalPatientId = signal<string | null>(null);
  readonly vitalsModalPatientId = signal<string | null>(null);
  readonly isHistoryDialogOpen = signal<boolean>(false);

  readonly isChartDialogOpen = computed<boolean>(() => this.chartModalPatientId() !== null);
  readonly isDischargeDialogOpen = computed<boolean>(() => this.dischargeModalPatientId() !== null);
  readonly isVitalsDialogOpen = computed<boolean>(() => this.vitalsModalPatientId() !== null);
  readonly isAnyDialogOpen = computed<boolean>(
    () =>
      this.isAdmissionDialogOpen() ||
      this.isChartDialogOpen() ||
      this.isDischargeDialogOpen() ||
      this.isVitalsDialogOpen() ||
      this.isHistoryDialogOpen()
  );

  readonly activeDialogTrigger = signal<string | null>(null);
  readonly dialogMorphOwner = signal<'trigger' | 'modal' | null>(null);
  readonly isDialogTransitioning = computed<boolean>(() => this.dialogMorphOwner() !== null);

  // Snackbar Toast & Accessible Announcer
  readonly toastMessage = signal<string | null>(null);
  readonly liveAnnouncement = signal<string>('');

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.liveTimerId !== null) {
        clearInterval(this.liveTimerId);
        this.liveTimerId = null;
      }
    });
  }

  // Derived collections
  readonly activePatients = computed<PatientTriageRecord[]>(() =>
    this.patients().filter((p) => p.status !== 'discharged' && p.status !== 'transferred_icu')
  );

  readonly chartDialogPatient = computed<PatientTriageRecord | null>(() => {
    const id = this.chartModalPatientId();
    return id ? this.activePatients().find((p) => p.id === id) ?? null : null;
  });

  readonly dischargeDialogPatient = computed<PatientTriageRecord | null>(() => {
    const id = this.dischargeModalPatientId();
    return id ? this.activePatients().find((p) => p.id === id) ?? null : null;
  });

  readonly vitalsDialogPatient = computed<PatientTriageRecord | null>(() => {
    const id = this.vitalsModalPatientId();
    return id ? this.activePatients().find((p) => p.id === id) ?? null : null;
  });

  readonly selectedPatient = computed<PatientTriageRecord | null>(() => {
    const id = this._selectedPatientId();
    if (!id) return null;
    return this.activePatients().find((p) => p.id === id) ?? null;
  });

  readonly availableBeds = computed<EmergencyBed[]>(() =>
    this.beds().filter((b) => b.status === 'available')
  );

  readonly inBedCount = computed<number>(
    () => this.activePatients().filter((p) => !!p.bedAssignedId).length
  );

  readonly waitingCount = computed<number>(
    () => this.activePatients().filter((p) => !p.bedAssignedId).length
  );

  readonly activeCodesCount = computed<number>(
    () => this.activePatients().filter((p) => !!p.activeCode).length
  );

  readonly slaBreachCount = computed<number>(
    () => this.activePatients().filter((p) => isPatientSlaBreached(p)).length
  );

  readonly nextUrgentAvailableBed = computed<UrgentBedCandidate | null>(() => {
    const stAvailable = this.beds().find((b) => b.area === 'shock_trauma' && b.status === 'available');
    if (stAvailable) {
      return { bed: stAvailable, isPrimaryShockTrauma: true };
    }
    const fallbackAvailable = this.beds().find((b) => b.status === 'available');
    if (fallbackAvailable) {
      return { bed: fallbackAvailable, isPrimaryShockTrauma: false };
    }
    return null;
  });

  readonly kpiSummary = computed<ClinicKpiSummary>(() => {
    const list = this.activePatients();
    const totalActive = list.length;
    const critical = list.filter(
      (p) => p.triageLevel === 'resuscitation' || p.triageLevel === 'emergency'
    ).length;
    const urgent = list.filter((p) => p.triageLevel === 'urgent').length;
    const highRiskNews2 = list.filter((p) => p.news2.riskLevel === 'high').length;
    const activeCodesCount = list.filter((p) => !!p.activeCode).length;
    const slaBreachCount = list.filter((p) => isPatientSlaBreached(p)).length;
    const slaCompliancePercent =
      totalActive > 0 ? Math.round(((totalActive - slaBreachCount) / totalActive) * 100) : 100;

    const waitSum = list.reduce((acc, p) => acc + p.waitingMinutes, 0);
    const avgWait = totalActive > 0 ? Math.round(waitSum / totalActive) : 0;

    const allBeds = this.beds();
    const occupied = allBeds.filter((b) => b.status === 'occupied').length;
    const available = allBeds.filter((b) => b.status === 'available').length;
    const cleaning = allBeds.filter((b) => b.status === 'cleaning').length;
    const totalBeds = allBeds.length;
    const occRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

    const stBeds = allBeds.filter((b) => b.area === 'shock_trauma');
    const stOccupied = stBeds.filter((b) => b.status === 'occupied').length;
    const stAvailable = stBeds.filter((b) => b.status === 'available').length;

    return {
      totalActivePatients: totalActive,
      criticalCases: critical,
      urgentCases: urgent,
      highRiskNews2Count: highRiskNews2,
      activeCodesCount,
      slaBreachCount,
      slaCompliancePercent,
      avgWaitMinutes: avgWait,
      occupiedBeds: occupied,
      availableBeds: available,
      cleaningBeds: cleaning,
      totalBeds,
      bedOccupancyPercent: occRate,
      shockTraumaOccupancy: `${stOccupied}/${stBeds.length}`,
      availableShockTraumaBeds: stAvailable
    };
  });

  readonly filteredPatients = computed<PatientTriageRecord[]>(() => {
    const list = this.activePatients();
    const filter = this.activeFilter();
    const sort = this.sortMode();
    const query = this.searchQuery().trim().toLowerCase();

    const filtered = list.filter((p) => {
      let matchesFilter = true;
      if (filter === 'critical') {
        matchesFilter = p.triageLevel === 'resuscitation' || p.triageLevel === 'emergency';
      } else if (filter === 'codes') {
        matchesFilter = !!p.activeCode;
      } else if (filter === 'sla_breach') {
        matchesFilter = isPatientSlaBreached(p);
      } else if (filter === 'urgent') {
        matchesFilter = p.triageLevel === 'urgent';
      } else if (filter === 'standard') {
        matchesFilter = p.triageLevel === 'standard' || p.triageLevel === 'non_urgent';
      } else if (filter === 'in_bed') {
        matchesFilter = !!p.bedAssignedId;
      } else if (filter === 'waiting') {
        matchesFilter = !p.bedAssignedId;
      }

      if (!matchesFilter) return false;
      if (!query) return true;

      return (
        p.fullName.toLowerCase().includes(query) ||
        p.ticketCode.toLowerCase().includes(query) ||
        p.chiefComplaint.toLowerCase().includes(query) ||
        p.allergies.some((a) => a.toLowerCase().includes(query)) ||
        (p.bedAssignedId && p.bedAssignedId.toLowerCase().includes(query)) ||
        (p.activeCode && p.activeCode.title.toLowerCase().includes(query))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'recent') {
        return b.admissionSequence - a.admissionSequence;
      }
      if (sort === 'sla_wait') {
        const breachDiff = Number(isPatientSlaBreached(b)) - Number(isPatientSlaBreached(a));
        if (breachDiff !== 0) return breachDiff;
        const aRatio = a.waitingMinutes / Math.max(1, TRIAGE_SLA_MINUTES[a.triageLevel]);
        const bRatio = b.waitingMinutes / Math.max(1, TRIAGE_SLA_MINUTES[b.triageLevel]);
        if (bRatio !== aRatio) return bRatio - aRatio;
        return b.waitingMinutes - a.waitingMinutes;
      }
      // Clinical priority sort: N1 -> N5, Active Code, Higher NEWS2, Longer Wait
      const levelDiff = TRIAGE_PRIORITY_RANK[a.triageLevel] - TRIAGE_PRIORITY_RANK[b.triageLevel];
      if (levelDiff !== 0) return levelDiff;
      const codeDiff = Number(!!b.activeCode) - Number(!!a.activeCode);
      if (codeDiff !== 0) return codeDiff;
      const newsDiff = b.news2.score - a.news2.score;
      if (newsDiff !== 0) return newsDiff;
      return b.waitingMinutes - a.waitingMinutes;
    });
  });

  // Filters, Sorting & Selection
  setFilter(filter: TriageFilter): void {
    this.runClinicTransition(() => {
      this.activeFilter.set(filter);
    });
    this.announce(`Filtro clínico: ${filter}. ${this.filteredPatients().length} pacientes visibles.`);
  }

  setSortMode(mode: TriageSortMode): void {
    this.runClinicTransition(() => {
      this.sortMode.set(mode);
    });
    const label =
      mode === 'clinical' ? 'Prioridad clínica' : mode === 'sla_wait' ? 'Vencimiento SLA' : 'Ingreso reciente';
    this.announce(`Cola ordenada por ${label}.`);
  }

  setBedFilterStatus(status: BedFilterStatus): void {
    this.bedFilterStatus.set(status);
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  selectPatient(patientOrId: PatientTriageRecord | string | null): void {
    if (!patientOrId) {
      this._selectedPatientId.set(null);
      return;
    }
    const id = typeof patientOrId === 'string' ? patientOrId : patientOrId.id;
    this._selectedPatientId.set(id);
  }

  // Live Guard Simulation
  toggleLiveMonitoring(): void {
    const next = !this.isLiveMonitoring();
    this.isLiveMonitoring.set(next);

    if (next) {
      if (isPlatformBrowser(this.platformId) && this.liveTimerId === null) {
        this.liveTimerId = setInterval(() => {
          this.advanceGuardMinutes(1);
        }, 10000);
      }
      this.notify('Monitor de guardia en vivo activado.');
    } else {
      if (this.liveTimerId !== null) {
        clearInterval(this.liveTimerId);
        this.liveTimerId = null;
      }
      this.notify('Monitor de guardia en vivo pausado.');
    }
  }

  advanceGuardMinutes(delta = 1): void {
    if (delta <= 0) return;
    this.patients.update((list) =>
      list.map((p) => {
        if (p.status === 'discharged' || p.status === 'transferred_icu') return p;
        const waitingMinutes = p.waitingMinutes + delta;
        const activeCode = p.activeCode
          ? {
              ...p.activeCode,
              elapsedMinutes: p.activeCode.elapsedMinutes + delta,
              remainingMinutes: Math.max(0, p.activeCode.targetMinutes - (p.activeCode.elapsedMinutes + delta))
            }
          : undefined;
        return { ...p, waitingMinutes, activeCode };
      })
    );
  }

  // Dialog Open/Close with Strict Single-Owner Transitions
  openChartDialog(patientId: string, triggerId = 'clinic-detail-expand-btn'): void {
    const exists = this.activePatients().some((p) => p.id === patientId);
    if (!exists) return;
    this._selectedPatientId.set(patientId);
    this.openPortaledModal(triggerId, () => {
      this.isAdmissionDialogOpen.set(false);
      this.dischargeModalPatientId.set(null);
      this.vitalsModalPatientId.set(null);
      this.isHistoryDialogOpen.set(false);
      this.chartModalPatientId.set(patientId);
    });
  }

  closeChartDialog(): void {
    if (!this.chartModalPatientId()) return;
    this.closePortaledModal(() => {
      this.chartModalPatientId.set(null);
    });
  }

  openAdmissionDialog(triggerId = 'clinic-header-admit-btn'): void {
    this.openPortaledModal(triggerId, () => {
      this.chartModalPatientId.set(null);
      this.dischargeModalPatientId.set(null);
      this.vitalsModalPatientId.set(null);
      this.isHistoryDialogOpen.set(false);
      this.isAdmissionDialogOpen.set(true);
    });
  }

  closeAdmissionDialog(): void {
    if (!this.isAdmissionDialogOpen()) return;
    this.closePortaledModal(() => {
      this.isAdmissionDialogOpen.set(false);
    });
  }

  openDischargeDialog(patientId: string, triggerId: string | null = 'clinic-detail-discharge-btn'): void {
    const exists = this.activePatients().some((p) => p.id === patientId);
    if (!exists) return;
    this.openPortaledModal(triggerId, () => {
      this.isAdmissionDialogOpen.set(false);
      this.chartModalPatientId.set(null);
      this.vitalsModalPatientId.set(null);
      this.isHistoryDialogOpen.set(false);
      this.dischargeModalPatientId.set(patientId);
    });
  }

  closeDischargeDialog(): void {
    if (!this.dischargeModalPatientId()) return;
    this.closePortaledModal(() => {
      this.dischargeModalPatientId.set(null);
    });
  }

  openVitalsDialog(patientId: string, triggerId: string | null = 'clinic-detail-reeval-btn'): void {
    const exists = this.activePatients().some((p) => p.id === patientId);
    if (!exists) return;
    this.openPortaledModal(triggerId, () => {
      this.isAdmissionDialogOpen.set(false);
      this.chartModalPatientId.set(null);
      this.dischargeModalPatientId.set(null);
      this.isHistoryDialogOpen.set(false);
      this.vitalsModalPatientId.set(patientId);
    });
  }

  closeVitalsDialog(): void {
    if (!this.vitalsModalPatientId()) return;
    this.closePortaledModal(() => {
      this.vitalsModalPatientId.set(null);
    });
  }

  openHistoryDialog(triggerId = 'clinic-header-history-btn'): void {
    this.openPortaledModal(triggerId, () => {
      this.isAdmissionDialogOpen.set(false);
      this.chartModalPatientId.set(null);
      this.dischargeModalPatientId.set(null);
      this.vitalsModalPatientId.set(null);
      this.isHistoryDialogOpen.set(true);
    });
  }

  closeHistoryDialog(): void {
    if (!this.isHistoryDialogOpen()) return;
    this.closePortaledModal(() => {
      this.isHistoryDialogOpen.set(false);
    });
  }

  closeActiveDialog(): void {
    if (this.isDischargeDialogOpen()) {
      this.closeDischargeDialog();
    } else if (this.isVitalsDialogOpen()) {
      this.closeVitalsDialog();
    } else if (this.isChartDialogOpen()) {
      this.closeChartDialog();
    } else if (this.isAdmissionDialogOpen()) {
      this.closeAdmissionDialog();
    } else if (this.isHistoryDialogOpen()) {
      this.closeHistoryDialog();
    }
  }

  // Clinical Actions
  admitPatient(payload: AdmitPatientDto): PatientTriageRecord {
    const nextTicketNum = 106 + this.patients().length - this.initialPatients.length;
    const ticketCode = `TR-${nextTicketNum.toString().padStart(3, '0')}`;
    const admissionTime = formatCurrentTime();
    const news2 = ClinicService.computeNews2(payload.vitals);
    const activeCode = payload.activeCodeType
      ? buildEmergencyCode(payload.activeCodeType, 0)
      : undefined;
    const cleanNotes = payload.notes?.trim() ?? '';

    const newRecord = this.buildInitialPatient({
      id: `pt-${Date.now()}-${this.admissionSeq}`,
      ticketCode,
      fullName: payload.fullName.trim(),
      age: payload.age,
      gender: payload.gender,
      triageLevel: payload.triageLevel,
      chiefComplaint: payload.chiefComplaint.trim(),
      admissionTime,
      admissionSequence: this.admissionSeq++,
      waitingMinutes: 1,
      vitals: { ...payload.vitals },
      ...(activeCode ? { activeCode } : {}),
      status: 'waiting_bed',
      allergies: payload.allergies ?? [],
      notes: cleanNotes
    });

    const commitAdmission = () => {
      this.patients.update((prev) => [newRecord, ...prev]);
      this._selectedPatientId.set(newRecord.id);
    };

    if (this.isAdmissionDialogOpen()) {
      this.closePortaledModal(() => {
        commitAdmission();
        this.isAdmissionDialogOpen.set(false);
      });
    } else {
      this.runClinicTransition(commitAdmission);
    }

    this.notify(`Paciente ${newRecord.fullName} ingresado (${ticketCode} · NEWS2 ${news2.score}).`);
    return newRecord;
  }

  updatePatientVitals(patientId: string, vitals: PatientVitals, note?: string): void {
    const target = this.patients().find((p) => p.id === patientId);
    if (!target) return;

    const updatedNews2 = ClinicService.computeNews2(vitals);
    const timestamp = formatCurrentTime();
    const cleanNote = note?.trim();

    const commitVitals = () => {
      this.patients.update((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          const nextSnapshot = {
            id: `vs-${patientId}-${Date.now()}`,
            timestamp,
            news2Score: updatedNews2.score,
            riskLevel: updatedNews2.riskLevel,
            vitals: { ...vitals },
            ...(cleanNote ? { note: cleanNote } : {})
          };
          const updatedLog: ClinicalNoteEntry[] = cleanNote
            ? [
                {
                  id: `note-${Date.now()}`,
                  timestamp,
                  author: 'Reevaluación Enfermería',
                  text: cleanNote,
                  kind: updatedNews2.riskLevel === 'high' ? 'alert' : 'evolution'
                },
                ...p.clinicalLog
              ]
            : p.clinicalLog;

          return {
            ...p,
            vitals: { ...vitals },
            news2: updatedNews2,
            vitalsHistory: [nextSnapshot, ...p.vitalsHistory].slice(0, 6),
            clinicalLog: updatedLog
          };
        })
      );
    };

    if (this.vitalsModalPatientId() === patientId) {
      this.closePortaledModal(() => {
        commitVitals();
        this.vitalsModalPatientId.set(null);
      });
    } else {
      this.runClinicTransition(commitVitals);
    }

    const riskSuffix = updatedNews2.riskLevel === 'high' ? ' · Alerta riesgo crítico' : '';
    this.notify(`Signos actualizados para ${target.fullName} (NEWS2 ${updatedNews2.score}${riskSuffix}).`);
  }

  updateTriageLevel(patientId: string, level: TriageLevel): void {
    const target = this.patients().find((p) => p.id === patientId);
    if (!target || target.triageLevel === level) return;

    this.captureUndoSnapshot(`Reclasificación de ${target.fullName} revertida.`);
    this.runClinicTransition(() => {
      this.patients.update((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, triageLevel: level } : p))
      );
    });
    this.notify(`Prioridad actualizada para ${target.fullName}.`, true);
  }

  toggleProtocolStep(patientId: string, stepId: string): void {
    let toggledLabel = '';
    let completed = false;
    this.patients.update((prev) =>
      prev.map((p) => {
        if (p.id !== patientId || !p.activeCode) return p;
        const steps = p.activeCode.steps.map((s) => {
          if (s.id !== stepId) return s;
          toggledLabel = s.label;
          completed = !s.completed;
          return { ...s, completed };
        });
        return { ...p, activeCode: { ...p.activeCode, steps } };
      })
    );
    if (toggledLabel) {
      this.announce(`${toggledLabel}: ${completed ? 'completado' : 'pendiente'}.`);
    }
  }

  activateEmergencyCode(patientId: string, codeType: EmergencyCodeType | null): void {
    const target = this.patients().find((p) => p.id === patientId);
    if (!target) return;

    this.runClinicTransition(() => {
      this.patients.update((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          if (!codeType) {
            return { ...p, activeCode: undefined };
          }
          const code = buildEmergencyCode(codeType, 0);
          const entry: ClinicalNoteEntry = {
            id: `note-code-${Date.now()}`,
            timestamp: formatCurrentTime(),
            author: 'Protocolo Guardia',
            text: `Activado ${code.title}: ${code.protocolAction}`,
            kind: 'alert'
          };
          return {
            ...p,
            activeCode: code,
            clinicalLog: [entry, ...p.clinicalLog]
          };
        })
      );
    });

    if (codeType) {
      this.notify(`${EMERGENCY_CODE_PRESETS[codeType].title} activado para ${target.fullName}.`);
    } else {
      this.notify(`Código clínico cerrado para ${target.fullName}.`);
    }
  }

  addClinicalNote(
    patientId: string,
    text: string,
    kind: ClinicalNoteEntry['kind'] = 'evolution'
  ): void {
    const clean = text.trim();
    const target = this.patients().find((p) => p.id === patientId);
    if (!clean || !target) return;

    const entry: ClinicalNoteEntry = {
      id: `note-${Date.now()}`,
      timestamp: formatCurrentTime(),
      author: kind === 'order' ? 'Indicación Médica' : 'Evolución Guardia',
      text: clean,
      kind
    };

    this.patients.update((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              notes: clean,
              clinicalLog: [entry, ...p.clinicalLog]
            }
          : p
      )
    );
    this.notify(`Registro clínico añadido en ficha de ${target.fullName}.`);
  }

  addAllergy(patientId: string, allergy: string): void {
    const clean = allergy.trim();
    const target = this.patients().find((p) => p.id === patientId);
    if (!clean || !target) return;
    if (target.allergies.some((a) => a.toLowerCase() === clean.toLowerCase())) return;

    this.patients.update((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, allergies: [...p.allergies, clean] } : p))
    );
    this.notify(`Alergia "${clean}" registrada en ${target.fullName}.`);
  }

  removeAllergy(patientId: string, allergy: string): void {
    this.patients.update((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, allergies: p.allergies.filter((item) => item !== allergy) }
          : p
      )
    );
    this.announce(`Alergia "${allergy}" retirada.`);
  }

  assignBed(patientId: string, bedId: string): void {
    const targetPatient = this.patients().find((p) => p.id === patientId);
    const targetBed = this.beds().find((b) => b.id === bedId);
    if (!targetPatient || !targetBed) return;

    this.captureUndoSnapshot(`Asignación de box ${bedId} revertida.`);

    this.runClinicTransition(() => {
      const prevBedId = targetPatient.bedAssignedId;
      if (prevBedId && prevBedId !== bedId) {
        this.beds.update((beds) =>
          beds.map((b) =>
            b.id === prevBedId
              ? { ...b, status: 'cleaning', patientId: null, patientName: undefined }
              : b
          )
        );
      }

      this.beds.update((beds) =>
        beds.map((b) =>
          b.id === bedId
            ? {
                ...b,
                status: 'occupied',
                patientId: targetPatient.id,
                patientName: `${targetPatient.fullName} (${targetPatient.ticketCode})`
              }
            : b
        )
      );

      this.patients.update((prev) =>
        prev.map((p) =>
          p.id === patientId ? { ...p, bedAssignedId: bedId, status: 'in_observation' } : p
        )
      );
    });

    this.notify(`${targetPatient.fullName} asignado a box ${bedId}.`, true);
  }

  assignImmediateShockTrauma(patientId: string): boolean {
    const candidate = this.nextUrgentAvailableBed();
    if (!candidate) {
      this.notify('No hay camas libres en este momento. Habilita o libera un box primero.');
      return false;
    }

    this.assignBed(patientId, candidate.bed.id);
    return true;
  }

  dischargePatient(
    patientId: string,
    disposition: DischargeDisposition = 'home',
    notes?: string
  ): void {
    const targetPatient = this.patients().find((p) => p.id === patientId);
    if (!targetPatient) return;

    const nextStatus = disposition === 'icu' ? 'transferred_icu' : 'discharged';
    const cleanNote = notes?.trim();
    const dischargedAt = formatCurrentTime();
    const previousBedId = targetPatient.bedAssignedId;

    this.captureUndoSnapshot(`Egreso de ${targetPatient.fullName} revertido.`);

    const commitDischarge = () => {
      if (previousBedId) {
        this.beds.update((beds) =>
          beds.map((b) =>
            b.id === previousBedId
              ? { ...b, status: 'cleaning', patientId: null, patientName: undefined }
              : b
          )
        );
      }

      this.patients.update((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                status: nextStatus,
                bedAssignedId: undefined,
                ...(cleanNote ? { notes: p.notes ? `${p.notes}\nEgreso: ${cleanNote}` : cleanNote } : {})
              }
            : p
        )
      );

      const historyItem: DischargeRecord = {
        id: `dis-${Date.now()}`,
        patientId: targetPatient.id,
        ticketCode: targetPatient.ticketCode,
        fullName: targetPatient.fullName,
        age: targetPatient.age,
        triageLevel: targetPatient.triageLevel,
        disposition,
        dischargedAt,
        previousBedId,
        ...(cleanNote ? { notes: cleanNote } : {})
      };
      this.dischargeHistory.update((prev) => [historyItem, ...prev]);

      if (this._selectedPatientId() === patientId) {
        const remaining = this.activePatients();
        this._selectedPatientId.set(remaining.length > 0 ? remaining[0].id : null);
      }
    };

    if (this.dischargeModalPatientId() === patientId) {
      this.closePortaledModal(() => {
        commitDischarge();
        this.dischargeModalPatientId.set(null);
      });
    } else {
      this.runClinicTransition(commitDischarge);
    }

    this.notify(`${DISPOSITION_NOTIFICATION_LABEL[disposition]} para ${targetPatient.fullName}.`, true);
  }

  setBedStatus(bedId: string, status: BedStatus): void {
    const targetBed = this.beds().find((b) => b.id === bedId);
    if (!targetBed) return;

    this.captureUndoSnapshot(`Estado previo del box ${bedId} restaurado.`);

    this.runClinicTransition(() => {
      if (status !== 'occupied' && targetBed.patientId) {
        const patientId = targetBed.patientId;
        this.patients.update((prev) =>
          prev.map((p) =>
            p.id === patientId && p.bedAssignedId === bedId
              ? { ...p, bedAssignedId: undefined, status: 'waiting_bed' }
              : p
          )
        );
      }

      this.beds.update((beds) =>
        beds.map((b) =>
          b.id === bedId
            ? {
                ...b,
                status,
                ...(status !== 'occupied' ? { patientId: null, patientName: undefined } : {})
              }
            : b
        )
      );
    });

    const label =
      status === 'available' ? 'habilitado' : status === 'cleaning' ? 'en desinfección' : 'ocupado';
    this.notify(`Box ${bedId} marcado como ${label}.`, true);
  }

  undoLastAction(): void {
    const snapshot = this.undoSnapshot;
    if (!snapshot) return;

    this.undoSnapshot = null;
    this.canUndoLastAction.set(false);
    this.runClinicTransition(() => {
      this.patients.set(snapshot.patients);
      this.beds.set(snapshot.beds);
      this.dischargeHistory.set(snapshot.dischargeHistory);
      this._selectedPatientId.set(snapshot.selectedPatientId);
    });
    this.notify(snapshot.description, false);
  }

  notify(message: string, undoable = false): void {
    if (!undoable) {
      this.canUndoLastAction.set(false);
    }
    this.toastMessage.set(message);
    this.announce(message);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
    this.canUndoLastAction.set(false);
  }

  private captureUndoSnapshot(description: string): void {
    this.undoSnapshot = {
      patients: clonePatients(this.patients()),
      beds: cloneBeds(this.beds()),
      dischargeHistory: this.dischargeHistory().map((d) => ({ ...d })),
      selectedPatientId: this._selectedPatientId(),
      description
    };
    this.canUndoLastAction.set(true);
  }

  private announce(message: string): void {
    this.liveAnnouncement.set('');
    queueMicrotask(() => this.liveAnnouncement.set(message));
  }

  private openPortaledModal(triggerId: string | null, applyOpenState: () => void): void {
    if (this.isAnyDialogOpen() || !triggerId) {
      this.activeDialogTrigger.set(null);
      this.dialogMorphOwner.set(null);
      applyOpenState();
      this.stageOverlay.setOverlayOpen(true);
      return;
    }

    this.activeDialogTrigger.set(triggerId);
    this.dialogMorphOwner.set('trigger');
    if (this.stageOverlay.hasViewTransitions()) {
      this.appRef.tick();
    }
    this.stageOverlay.runViewTransition(
      () => {
        applyOpenState();
        this.dialogMorphOwner.set('modal');
        this.stageOverlay.setOverlayOpen(true);
      },
      () => {
        this.dialogMorphOwner.set(null);
      }
    );
  }

  private closePortaledModal(applyCloseState: () => void): void {
    const hasOrigin = !!this.activeDialogTrigger();
    if (!hasOrigin) {
      this.dialogMorphOwner.set(null);
      applyCloseState();
      const stillOpen = this.isAnyDialogOpen();
      this.stageOverlay.setOverlayOpen(stillOpen);
      return;
    }

    this.dialogMorphOwner.set('modal');
    if (this.stageOverlay.hasViewTransitions()) {
      this.appRef.tick();
    }
    this.stageOverlay.runViewTransition(
      () => {
        applyCloseState();
        const stillOpen = this.isAnyDialogOpen();
        this.dialogMorphOwner.set(stillOpen ? null : 'trigger');
        this.stageOverlay.setOverlayOpen(stillOpen);
      },
      () => {
        this.dialogMorphOwner.set(null);
        if (!this.isAnyDialogOpen()) {
          this.activeDialogTrigger.set(null);
        }
      },
      { isExiting: true }
    );
  }

  private runClinicTransition(update: () => void, cleanup?: () => void): void {
    if (this.isAnyDialogOpen()) {
      update();
      cleanup?.();
      return;
    }
    this.stageOverlay.runViewTransition(update, cleanup, { rootClass: 'vt-clinic-swap' });
  }
}
