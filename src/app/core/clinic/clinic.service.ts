import { Injectable, computed, signal } from '@angular/core';
import {
  BedStatus,
  ClinicKpiSummary,
  EmergencyBed,
  PatientTriageRecord,
  TriageFilter,
  TriageLevel
} from './clinic.models';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private readonly initialPatients: PatientTriageRecord[] = [
    {
      id: 'pt-1',
      ticketCode: 'TR-089',
      fullName: 'Carlos Méndez',
      age: 58,
      gender: 'M',
      triageLevel: 'resuscitation',
      chiefComplaint: 'Dolor precordial opresivo con irradiación a mandíbula y diaforesis',
      admissionTime: '17:15',
      waitingMinutes: 2,
      vitals: {
        heartRate: 124,
        bloodPressureSys: 175,
        bloodPressureDia: 105,
        oxygenSat: 90,
        temperature: 36.8,
        painScale: 9
      },
      bedAssignedId: 'ST-01',
      status: 'in_observation',
      allergies: ['Penicilina', 'Sulfas'],
      notes: 'Protocolo de síndrome coronario agudo iniciado. EKG tomado a los 4 min.'
    },
    {
      id: 'pt-2',
      ticketCode: 'TR-091',
      fullName: 'Lucía Morales',
      age: 34,
      gender: 'F',
      triageLevel: 'emergency',
      chiefComplaint: 'Disnea súbita y estridor laríngeo post ingesta alimentaria',
      admissionTime: '17:28',
      waitingMinutes: 8,
      vitals: {
        heartRate: 116,
        bloodPressureSys: 96,
        bloodPressureDia: 60,
        oxygenSat: 92,
        temperature: 37.1,
        painScale: 7
      },
      status: 'waiting_bed',
      allergies: ['Mariscos', 'AINEs'],
      notes: 'Sospecha anafilaxia grado III. Adrenalina IM lista en triage.'
    },
    {
      id: 'pt-3',
      ticketCode: 'TR-094',
      fullName: 'Roberto Albarracín',
      age: 71,
      gender: 'M',
      triageLevel: 'emergency',
      chiefComplaint: 'Déficit neurológico focal agudo: asimetría facial y disartria severa',
      admissionTime: '17:35',
      waitingMinutes: 12,
      vitals: {
        heartRate: 88,
        bloodPressureSys: 185,
        bloodPressureDia: 110,
        oxygenSat: 96,
        temperature: 36.5,
        painScale: 3
      },
      bedAssignedId: 'ST-02',
      status: 'in_observation',
      allergies: [],
      notes: 'Código ACV activado. Ventana de 2.5 horas para trombolisis.'
    },
    {
      id: 'pt-4',
      ticketCode: 'TR-098',
      fullName: 'Valentina Ríos',
      age: 27,
      gender: 'F',
      triageLevel: 'urgent',
      chiefComplaint: 'Dolor fosa ilíaca derecha continuo de 14h de evolución, Blumberg (+)',
      admissionTime: '17:42',
      waitingMinutes: 24,
      vitals: {
        heartRate: 98,
        bloodPressureSys: 115,
        bloodPressureDia: 75,
        oxygenSat: 98,
        temperature: 38.5,
        painScale: 8
      },
      bedAssignedId: 'OB-01',
      status: 'in_observation',
      allergies: ['Látex'],
      notes: 'Interconsulta con cirugía general solicitada. Ecografía abdominal en curso.'
    },
    {
      id: 'pt-5',
      ticketCode: 'TR-101',
      fullName: 'Martín Gómez',
      age: 45,
      gender: 'M',
      triageLevel: 'urgent',
      chiefComplaint: 'Traumatismo cerrado de tobillo con gran deformidad articular e impotencia funcional',
      admissionTime: '17:50',
      waitingMinutes: 32,
      vitals: {
        heartRate: 84,
        bloodPressureSys: 132,
        bloodPressureDia: 82,
        oxygenSat: 99,
        temperature: 36.9,
        painScale: 7
      },
      status: 'waiting_bed',
      allergies: [],
      notes: 'Inmovilización provisoria colocada. Rx de tobillo solicitada.'
    },
    {
      id: 'pt-6',
      ticketCode: 'TR-103',
      fullName: 'Elena Castro',
      age: 22,
      gender: 'F',
      triageLevel: 'standard',
      chiefComplaint: 'Cefalea pulsátil holocraneana de 24h sin signos meníngeos ni focalidad',
      admissionTime: '18:02',
      waitingMinutes: 44,
      vitals: {
        heartRate: 72,
        bloodPressureSys: 110,
        bloodPressureDia: 70,
        oxygenSat: 99,
        temperature: 36.6,
        painScale: 4
      },
      status: 'waiting_bed',
      allergies: [],
      notes: 'Migraña común previa. Se indica hidratación y analgesia oral.'
    },
    {
      id: 'pt-7',
      ticketCode: 'TR-105',
      fullName: 'Joaquín Paredes',
      age: 39,
      gender: 'M',
      triageLevel: 'non_urgent',
      chiefComplaint: 'Solicitud de certificado médico y control de tratamiento hipertensivo',
      admissionTime: '18:10',
      waitingMinutes: 52,
      vitals: {
        heartRate: 68,
        bloodPressureSys: 128,
        bloodPressureDia: 82,
        oxygenSat: 99,
        temperature: 36.5,
        painScale: 0
      },
      status: 'waiting_bed',
      allergies: [],
      notes: 'Paciente hemodinámicamente estable, sin criterios de riesgo agudo.'
    }
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

  // Primary Signals
  readonly patients = signal<PatientTriageRecord[]>(this.initialPatients);
  readonly beds = signal<EmergencyBed[]>(this.initialBeds);
  readonly activeFilter = signal<TriageFilter>('all');
  readonly searchQuery = signal<string>('');
  readonly selectedPatient = signal<PatientTriageRecord | null>(this.initialPatients[0]);

  // Computed: KPI Summary
  readonly kpiSummary = computed<ClinicKpiSummary>(() => {
    const list = this.patients().filter(p => p.status !== 'discharged');
    const totalActive = list.length;
    const critical = list.filter(p => p.triageLevel === 'resuscitation' || p.triageLevel === 'emergency').length;
    const urgent = list.filter(p => p.triageLevel === 'urgent').length;
    
    const waitSum = list.reduce((acc, p) => acc + p.waitingMinutes, 0);
    const avgWait = totalActive > 0 ? Math.round(waitSum / totalActive) : 0;

    const allBeds = this.beds();
    const occupied = allBeds.filter(b => b.status === 'occupied').length;
    const totalBeds = allBeds.length;
    const occRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

    const stBeds = allBeds.filter(b => b.area === 'shock_trauma');
    const stOccupied = stBeds.filter(b => b.status === 'occupied').length;
    const stRate = `${stOccupied}/${stBeds.length}`;

    return {
      totalActivePatients: totalActive,
      criticalCases: critical,
      urgentCases: urgent,
      avgWaitMinutes: avgWait,
      occupiedBeds: occupied,
      totalBeds: totalBeds,
      bedOccupancyPercent: occRate,
      shockTraumaOccupancy: stRate
    };
  });

  // Computed: Filtered Patients
  readonly filteredPatients = computed<PatientTriageRecord[]>(() => {
    const list = this.patients().filter(p => p.status !== 'discharged');
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return list.filter(p => {
      // Filter category
      let matchesFilter = true;
      if (filter === 'critical') {
        matchesFilter = p.triageLevel === 'resuscitation' || p.triageLevel === 'emergency';
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
        (p.bedAssignedId && p.bedAssignedId.toLowerCase().includes(query))
      );
    });
  });

  // Action methods
  setFilter(filter: TriageFilter): void {
    this.runWithTransition(() => {
      this.activeFilter.set(filter);
    });
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  selectPatient(patient: PatientTriageRecord | null): void {
    this.selectedPatient.set(patient);
  }

  admitPatient(payload: {
    fullName: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    triageLevel: TriageLevel;
    chiefComplaint: string;
    vitals: {
      heartRate: number;
      bloodPressureSys: number;
      bloodPressureDia: number;
      oxygenSat: number;
      temperature: number;
      painScale: number;
    };
    allergies?: string[];
    notes?: string;
  }): PatientTriageRecord {
    const nextTicketNum = 106 + this.patients().length - this.initialPatients.length;
    const ticketCode = `TR-${nextTicketNum.toString().padStart(3, '0')}`;
    const now = new Date();
    const admissionTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRecord: PatientTriageRecord = {
      id: `pt-${Date.now()}`,
      ticketCode,
      fullName: payload.fullName,
      age: payload.age,
      gender: payload.gender,
      triageLevel: payload.triageLevel,
      chiefComplaint: payload.chiefComplaint,
      admissionTime,
      waitingMinutes: 1,
      vitals: payload.vitals,
      status: 'waiting_bed',
      allergies: payload.allergies ?? [],
      notes: payload.notes ?? ''
    };

    this.runWithTransition(() => {
      this.patients.update(prev => [newRecord, ...prev]);
      this.selectedPatient.set(newRecord);
    });

    return newRecord;
  }

  updateTriageLevel(patientId: string, level: TriageLevel): void {
    this.runWithTransition(() => {
      this.patients.update(prev =>
        prev.map(p => (p.id === patientId ? { ...p, triageLevel: level } : p))
      );
      if (this.selectedPatient()?.id === patientId) {
        this.selectedPatient.update(p => (p ? { ...p, triageLevel: level } : null));
      }
    });
  }

  assignBed(patientId: string, bedId: string): void {
    const targetPatient = this.patients().find(p => p.id === patientId);
    if (!targetPatient) return;

    this.runWithTransition(() => {
      // 1. Unassign previous bed if held
      const prevBedId = targetPatient.bedAssignedId;
      if (prevBedId) {
        this.beds.update(beds =>
          beds.map(b => (b.id === prevBedId ? { ...b, status: 'cleaning', patientId: null, patientName: undefined } : b))
        );
      }

      // 2. Assign new bed
      this.beds.update(beds =>
        beds.map(b =>
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

      // 3. Update patient
      this.patients.update(prev =>
        prev.map(p =>
          p.id === patientId ? { ...p, bedAssignedId: bedId, status: 'in_observation' } : p
        )
      );

      if (this.selectedPatient()?.id === patientId) {
        this.selectedPatient.update(p => (p ? { ...p, bedAssignedId: bedId, status: 'in_observation' } : null));
      }
    });
  }

  dischargePatient(patientId: string): void {
    const targetPatient = this.patients().find(p => p.id === patientId);
    if (!targetPatient) return;

    this.runWithTransition(() => {
      // Release bed to cleaning
      if (targetPatient.bedAssignedId) {
        const bedId = targetPatient.bedAssignedId;
        this.beds.update(beds =>
          beds.map(b => (b.id === bedId ? { ...b, status: 'cleaning', patientId: null, patientName: undefined } : b))
        );
      }

      // Update patient status to discharged
      this.patients.update(prev =>
        prev.map(p =>
          p.id === patientId ? { ...p, status: 'discharged', bedAssignedId: undefined } : p
        )
      );

      if (this.selectedPatient()?.id === patientId) {
        const remaining = this.patients().filter(p => p.status !== 'discharged' && p.id !== patientId);
        this.selectedPatient.set(remaining.length > 0 ? remaining[0] : null);
      }
    });
  }

  setBedStatus(bedId: string, status: BedStatus): void {
    this.runWithTransition(() => {
      this.beds.update(beds =>
        beds.map(b => {
          if (b.id === bedId) {
            return {
              ...b,
              status,
              ...(status !== 'occupied' ? { patientId: null, patientName: undefined } : {})
            };
          }
          return b;
        })
      );
    });
  }

  private runWithTransition(fn: () => void): void {
    const doc = document as unknown as { startViewTransition?: (callback: () => void) => void };
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(fn);
    } else {
      fn();
    }
  }
}
