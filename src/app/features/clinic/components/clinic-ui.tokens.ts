import {
  BedArea,
  BedStatus,
  DischargeDisposition,
  EmergencyCodeType,
  News2RiskLevel,
  PatientVitals,
  TriageLevel
} from '../../../core/clinic/clinic.models';

export interface TriageLevelMeta {
  shortCode: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  label: string;
  fullLabel: string;
  targetWaitLabel: string;
  icon: string;
  badgeClass: string;
  dotClass: string;
}

export const TRIAGE_LEVEL_META: Record<TriageLevel, TriageLevelMeta> = {
  resuscitation: {
    shortCode: 'N1',
    label: 'Resucitación',
    fullLabel: 'N1 · Resucitación',
    targetWaitLabel: 'Inmediato (0 min)',
    icon: 'emergency',
    badgeClass: 'bg-error-box text-on-error-box',
    dotClass: 'bg-error'
  },
  emergency: {
    shortCode: 'N2',
    label: 'Emergencia',
    fullLabel: 'N2 · Emergencia',
    targetWaitLabel: '≤ 10 min',
    icon: 'priority_high',
    badgeClass: 'clinic-mts-n2',
    dotClass: 'clinic-mts-n2-dot'
  },
  urgent: {
    shortCode: 'N3',
    label: 'Urgente',
    fullLabel: 'N3 · Urgente',
    targetWaitLabel: '≤ 60 min',
    icon: 'pace',
    badgeClass: 'bg-warning-box text-on-warning-box',
    dotClass: 'bg-warning'
  },
  standard: {
    shortCode: 'N4',
    label: 'Poco Urgente',
    fullLabel: 'N4 · Poco Urgente',
    targetWaitLabel: '≤ 120 min',
    icon: 'check_circle',
    badgeClass: 'bg-success-box text-on-success-box',
    dotClass: 'bg-success'
  },
  non_urgent: {
    shortCode: 'N5',
    label: 'No Urgente',
    fullLabel: 'N5 · No Urgente',
    targetWaitLabel: '≤ 240 min',
    icon: 'schedule',
    badgeClass: 'bg-sec-box text-on-sec-box',
    dotClass: 'bg-secondary'
  }
};

export const TRIAGE_LEVEL_ORDER: readonly TriageLevel[] = [
  'resuscitation',
  'emergency',
  'urgent',
  'standard',
  'non_urgent'
];

export interface News2RiskMeta {
  label: string;
  pillClass: string;
  alertClass: string;
}

export const NEWS2_RISK_META: Record<News2RiskLevel, News2RiskMeta> = {
  high: {
    label: 'Riesgo Crítico',
    pillClass: 'bg-error text-on-error',
    alertClass: 'bg-error-box text-on-error-box'
  },
  medium: {
    label: 'Riesgo Medio',
    pillClass: 'bg-warning-box text-on-warning-box',
    alertClass: 'bg-warning-box text-on-warning-box'
  },
  low_medium: {
    label: 'Leve-Moderado',
    pillClass: 'bg-primary-box text-on-primary-box',
    alertClass: 'bg-primary-box text-on-primary-box'
  },
  low: {
    label: 'Riesgo Bajo',
    pillClass: 'bg-surface-high text-muted',
    alertClass: 'bg-surface-high text-muted'
  }
};

export interface BedStatusMeta {
  label: string;
  icon: string;
  badgeClass: string;
}

export const BED_STATUS_META: Record<BedStatus, BedStatusMeta> = {
  occupied: {
    label: 'Ocupada',
    icon: 'bed',
    badgeClass: 'bg-sec-box text-on-sec-box'
  },
  cleaning: {
    label: 'Desinfección',
    icon: 'cleaning_services',
    badgeClass: 'bg-warning-box text-on-warning-box'
  },
  available: {
    label: 'Disponible',
    icon: 'check_circle',
    badgeClass: 'bg-success-box text-on-success-box'
  }
};

export interface BedAreaMeta {
  area: BedArea;
  title: string;
  subtitle: string;
  icon: string;
  iconBoxClass: string;
  emptyPlaceholder: string;
}

export const BED_AREA_META: readonly BedAreaMeta[] = [
  {
    area: 'shock_trauma',
    title: 'Shock Trauma Bay',
    subtitle: 'Alta complejidad y reanimación',
    icon: 'emergency',
    iconBoxClass: 'bg-error-box text-on-error-box',
    emptyPlaceholder: 'Lista para ingreso crítico'
  },
  {
    area: 'observation',
    title: 'Observación Rápida',
    subtitle: 'Monitorización continua e hidratación',
    icon: 'monitor_heart',
    iconBoxClass: 'bg-primary-box text-on-primary-box',
    emptyPlaceholder: 'Disponible para ingreso'
  },
  {
    area: 'procedure',
    title: 'Tópico & Procedimientos',
    subtitle: 'Suturas, curaciones e inmovilización',
    icon: 'healing',
    iconBoxClass: 'bg-tertiary-box text-on-tertiary-box',
    emptyPlaceholder: 'Disponible para atención'
  }
];

export type VitalSeverity = 'normal' | 'warning' | 'critical';

export interface VitalDisplayTile {
  key: 'heartRate' | 'bloodPressure' | 'oxygenSat' | 'temperature';
  label: string;
  referenceRange: string;
  displayValue: string;
  unit: string;
  icon: string;
  severity: VitalSeverity;
  statusLabel: string;
}

export function evaluatePatientVitals(vitals: PatientVitals): readonly VitalDisplayTile[] {
  const hrSeverity: VitalSeverity =
    vitals.heartRate <= 40 || vitals.heartRate >= 131
      ? 'critical'
      : vitals.heartRate < 60 || vitals.heartRate > 100
        ? 'warning'
        : 'normal';

  const bpSeverity: VitalSeverity =
    vitals.bloodPressureSys <= 90 || vitals.bloodPressureSys >= 200
      ? 'critical'
      : vitals.bloodPressureSys < 100 || vitals.bloodPressureSys >= 140
        ? 'warning'
        : 'normal';

  const spo2Severity: VitalSeverity =
    vitals.oxygenSat <= 91 ? 'critical' : vitals.oxygenSat <= 94 ? 'warning' : 'normal';

  const tempSeverity: VitalSeverity =
    vitals.temperature <= 35.0 || vitals.temperature >= 39.1
      ? 'critical'
      : vitals.temperature < 36.1 || vitals.temperature >= 38.1
        ? 'warning'
        : 'normal';

  return [
    {
      key: 'heartRate',
      label: 'Frec. Cardíaca',
      referenceRange: '60–100 bpm',
      displayValue: String(vitals.heartRate),
      unit: 'bpm',
      icon: 'favorite',
      severity: hrSeverity,
      statusLabel: hrSeverity === 'normal' ? 'Normal' : 'Alterada'
    },
    {
      key: 'bloodPressure',
      label: 'Presión Arterial',
      referenceRange: '100–139 mmHg',
      displayValue: `${vitals.bloodPressureSys}/${vitals.bloodPressureDia}`,
      unit: 'mmHg',
      icon: 'blood_pressure',
      severity: bpSeverity,
      statusLabel: bpSeverity === 'normal' ? 'Normal' : 'Alterada'
    },
    {
      key: 'oxygenSat',
      label: 'Saturación SpO2',
      referenceRange: '≥ 95%',
      displayValue: `${vitals.oxygenSat}%`,
      unit: '',
      icon: 'spo2',
      severity: spo2Severity,
      statusLabel: spo2Severity === 'normal' ? 'Óptima' : 'Hipoxemia'
    },
    {
      key: 'temperature',
      label: 'Temperatura',
      referenceRange: '36.1–38.0 °C',
      displayValue: `${vitals.temperature}°C`,
      unit: '',
      icon: 'thermostat',
      severity: tempSeverity,
      statusLabel: tempSeverity === 'normal' ? 'Afebril' : 'Fuera de rango'
    }
  ];
}

export interface EmergencyCodeOption {
  type: EmergencyCodeType | null;
  shortLabel: string;
  windowLabel: string;
}

export const EMERGENCY_CODE_OPTIONS: readonly EmergencyCodeOption[] = [
  { type: null, shortLabel: 'Sin código', windowLabel: 'Atención regular' },
  { type: 'code_stemi', shortLabel: 'Código Infarto', windowLabel: '90 min' },
  { type: 'code_stroke', shortLabel: 'Código Ictus', windowLabel: '45 min' },
  { type: 'code_sepsis', shortLabel: 'Código Sepsis', windowLabel: '60 min' },
  { type: 'code_trauma', shortLabel: 'Trauma Mayor', windowLabel: '60 min' }
];

export interface DischargeDispositionMeta {
  id: DischargeDisposition;
  label: string;
  description: string;
  icon: string;
  badgeClass: string;
}

export const DISCHARGE_DISPOSITION_META: readonly DischargeDispositionMeta[] = [
  {
    id: 'home',
    label: 'Alta a Domicilio',
    description: 'Paciente estabilizado con indicaciones y signos de alarma.',
    icon: 'home',
    badgeClass: 'bg-success-box text-on-success-box'
  },
  {
    id: 'ward',
    label: 'Hospitalización',
    description: 'Pase a piso clínico o unidad de medicina interna.',
    icon: 'local_hospital',
    badgeClass: 'bg-primary-box text-on-primary-box'
  },
  {
    id: 'icu',
    label: 'Traslado a UCI',
    description: 'Derivación a cuidados intensivos para soporte avanzado.',
    icon: 'monitor_heart',
    badgeClass: 'bg-error-box text-on-error-box'
  }
];
