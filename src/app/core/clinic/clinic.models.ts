export type TriageLevel = 'resuscitation' | 'emergency' | 'urgent' | 'standard' | 'non_urgent';

export type PatientStatus = 
  | 'triage_pending' 
  | 'waiting_bed' 
  | 'in_observation' 
  | 'discharged' 
  | 'transferred_icu';

export type BedArea = 'shock_trauma' | 'observation' | 'procedure';
export type BedStatus = 'available' | 'occupied' | 'cleaning';

export type News2RiskLevel = 'low' | 'low_medium' | 'medium' | 'high';

export interface News2Assessment {
  score: number;
  riskLevel: News2RiskLevel;
  recommendation: string;
  triggers: string[];
}

export interface EmergencyCode {
  type: 'code_stemi' | 'code_stroke' | 'code_sepsis' | 'code_trauma';
  title: string;
  windowLabel: string;
  targetMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  protocolAction: string;
}

export interface PatientVitals {
  heartRate: number;        // bpm
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  oxygenSat: number;        // %
  temperature: number;      // °C
  painScale: number;        // 0-10 EVA
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
  waitingMinutes: number;
  vitals: PatientVitals;
  news2: News2Assessment;
  activeCode?: EmergencyCode;
  bedAssignedId?: string;
  status: PatientStatus;
  allergies?: string[];
  notes?: string;
}

export type TriageFilter = 'all' | 'critical' | 'urgent' | 'standard' | 'in_bed' | 'waiting';

export interface ClinicKpiSummary {
  totalActivePatients: number;
  criticalCases: number;     // Resuscitation + Emergency
  urgentCases: number;       // Urgent
  highRiskNews2Count: number; // NEWS2 >= 7
  avgWaitMinutes: number;
  occupiedBeds: number;
  totalBeds: number;
  bedOccupancyPercent: number;
  shockTraumaOccupancy: string;
  availableShockTraumaBeds: number;
}
