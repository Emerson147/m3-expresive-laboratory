export type TriageLevel = 'resuscitation' | 'emergency' | 'urgent' | 'standard' | 'non_urgent';

export type PatientStatus = 
  | 'triage_pending' 
  | 'waiting_bed' 
  | 'in_observation' 
  | 'discharged' 
  | 'transferred_icu';

export type BedArea = 'shock_trauma' | 'observation' | 'procedure';
export type BedStatus = 'available' | 'occupied' | 'cleaning';

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
  avgWaitMinutes: number;
  occupiedBeds: number;
  totalBeds: number;
  bedOccupancyPercent: number;
  shockTraumaOccupancy: string;
}
