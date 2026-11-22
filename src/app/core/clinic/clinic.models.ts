export type TriageLevel = 'resuscitation' | 'emergency' | 'urgent' | 'standard' | 'non_urgent';

export type PatientStatus =
  | 'triage_pending'
  | 'waiting_bed'
  | 'in_observation'
  | 'discharged'
  | 'transferred_icu';

export type BedArea = 'shock_trauma' | 'observation' | 'procedure';
export type BedStatus = 'available' | 'occupied' | 'cleaning';
export type BedFilterStatus = 'all' | BedStatus;

export type News2RiskLevel = 'low' | 'low_medium' | 'medium' | 'high';
export type ConsciousnessLevel = 'A' | 'C' | 'V' | 'P' | 'U';

export interface News2Assessment {
  score: number;
  riskLevel: News2RiskLevel;
  recommendation: string;
  triggers: string[];
}

export type EmergencyCodeType =
  | 'code_stemi'
  | 'code_stroke'
  | 'code_sepsis'
  | 'code_trauma'
  | 'code_anaphylaxis';

export interface ProtocolStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface EmergencyCode {
  type: EmergencyCodeType;
  title: string;
  windowLabel: string;
  targetMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  protocolAction: string;
  steps: ProtocolStep[];
}

export interface EmergencyCodePreset {
  type: EmergencyCodeType;
  title: string;
  windowLabel: string;
  targetMinutes: number;
  protocolAction: string;
  defaultSteps: readonly string[];
}

export const EMERGENCY_CODE_PRESETS: Record<EmergencyCodeType, EmergencyCodePreset> = {
  code_stemi: {
    type: 'code_stemi',
    title: 'Código Infarto (STEMI)',
    windowLabel: 'Ventana Puerta-Balón',
    targetMinutes: 90,
    protocolAction: 'Hemodinamia notificada. Angioplastia primaria y doble antiagregación activadas.',
    defaultSteps: [
      'EKG 12 derivaciones interpretado (< 10 min)',
      'Doble antiagregación + Troponina seriada',
      'Sala de Hemodinamia activada para ICP'
    ]
  },
  code_stroke: {
    type: 'code_stroke',
    title: 'Código Ictus (ACV)',
    windowLabel: 'Ventana Trombólisis IV',
    targetMinutes: 45,
    protocolAction: 'TAC cerebral STAT y valoración neurológica activadas.',
    defaultSteps: [
      'Escala NIHSS basal + Glicemia capilar',
      'TAC encéfalo sin contraste prioritaria STAT',
      'Validar criterios y bolo rtPA intravenoso'
    ]
  },
  code_sepsis: {
    type: 'code_sepsis',
    title: 'Código Sepsis / Shock',
    windowLabel: 'Bundle Hora-1',
    targetMinutes: 60,
    protocolAction: 'Cultivos, lactato, cristaloides 30 mL/kg y antimicrobiano de amplio espectro iniciados.',
    defaultSteps: [
      'Lactato sérico + 2 sets de hemocultivos',
      'Antimicrobiano amplio espectro IV (< 60 min)',
      'Carga cristaloides 30 mL/kg si lactato ≥ 4 o PAM < 65'
    ]
  },
  code_trauma: {
    type: 'code_trauma',
    title: 'Código Trauma Mayor',
    windowLabel: 'Hora Dorada ATLS',
    targetMinutes: 60,
    protocolAction: 'Equipo quirúrgico y banco de sangre en alerta para estabilización inmediata.',
    defaultSteps: [
      'Control vía aérea C-Spine + ABCDE primario',
      'Protocolo ECO FAST + Tipo y Pruebas cruzadas',
      'Alerta quirúrgica y reserva hemocomponentes'
    ]
  },
  code_anaphylaxis: {
    type: 'code_anaphylaxis',
    title: 'Código Anafilaxia Grado III',
    windowLabel: 'Estabilización Vía Aérea',
    targetMinutes: 15,
    protocolAction: 'Adrenalina IM 0.5 mg, oxigenoterapia de alto flujo y vigilancia de vía aérea.',
    defaultSteps: [
      'Adrenalina IM 0.5 mg cara anterolateral muslo',
      'Oxígeno alto flujo + acceso venoso permeable',
      'Nebulización broncodilatadora + corticoide IV'
    ]
  }
};

export const TRIAGE_SLA_MINUTES: Record<TriageLevel, number> = {
  resuscitation: 0,
  emergency: 10,
  urgent: 60,
  standard: 120,
  non_urgent: 240
};

export type DischargeDisposition = 'home' | 'ward' | 'icu';

export interface PatientVitals {
  heartRate: number;            // bpm
  respRate?: number;            // rpm (NEWS2)
  bloodPressureSys: number;     // mmHg
  bloodPressureDia: number;     // mmHg
  oxygenSat: number;            // %
  supplementalO2?: boolean;     // O2 suplementario (NEWS2 +2)
  temperature: number;          // °C
  consciousness?: ConsciousnessLevel; // ACVPU (NEWS2)
  painScale: number;            // 0-10 EVA
}

export interface VitalReadingSnapshot {
  id: string;
  timestamp: string;
  news2Score: number;
  riskLevel: News2RiskLevel;
  vitals: PatientVitals;
  note?: string;
}

export interface ClinicalNoteEntry {
  id: string;
  timestamp: string;
  author: string;
  text: string;
  kind: 'evolution' | 'order' | 'alert';
}

export interface EmergencyBed {
  id: string;
  name: string;
  area: BedArea;
  status: BedStatus;
  patientId: string | null;
  patientName?: string;
  equipment: string[];
}

export interface PatientTriageRecord {
  id: string;
  ticketCode: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  triageLevel: TriageLevel;
  chiefComplaint: string;
  admissionTime: string;
  admissionSequence: number;
  waitingMinutes: number;
  vitals: PatientVitals;
  vitalsHistory: VitalReadingSnapshot[];
  news2: News2Assessment;
  activeCode?: EmergencyCode;
  bedAssignedId?: string;
  status: PatientStatus;
  allergies: string[];
  notes?: string;
  clinicalLog: ClinicalNoteEntry[];
}

export interface DischargeRecord {
  id: string;
  patientId: string;
  ticketCode: string;
  fullName: string;
  age: number;
  triageLevel: TriageLevel;
  disposition: DischargeDisposition;
  dischargedAt: string;
  previousBedId?: string;
  notes?: string;
}

export type TriageFilter =
  | 'all'
  | 'critical'
  | 'codes'
  | 'sla_breach'
  | 'urgent'
  | 'standard'
  | 'in_bed'
  | 'waiting';

export type TriageSortMode = 'clinical' | 'sla_wait' | 'recent';

export type ClinicDesktopView = 'triage' | 'boxes';

export interface ClinicKpiSummary {
  totalActivePatients: number;
  criticalCases: number;
  urgentCases: number;
  highRiskNews2Count: number;
  activeCodesCount: number;
  slaBreachCount: number;
  slaCompliancePercent: number;
  avgWaitMinutes: number;
  occupiedBeds: number;
  availableBeds: number;
  cleaningBeds: number;
  totalBeds: number;
  bedOccupancyPercent: number;
  shockTraumaOccupancy: string;
  availableShockTraumaBeds: number;
}

export interface AdmitPatientDto {
  fullName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  triageLevel: TriageLevel;
  chiefComplaint: string;
  vitals: PatientVitals;
  activeCodeType?: EmergencyCodeType | null;
  allergies?: string[];
  notes?: string;
}

export interface UrgentBedCandidate {
  bed: EmergencyBed;
  isPrimaryShockTrauma: boolean;
}
