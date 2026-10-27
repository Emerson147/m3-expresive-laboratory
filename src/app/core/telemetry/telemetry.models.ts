export type VehicleStatus = 'optimal' | 'in_transit' | 'delayed' | 'critical' | 'cold_chain_warning';

export interface CanBusTelemetry {
  engineRpm: number;
  fuelLevelPercent: number;
  batteryVolts: number;
  tirePressurePsi: number;
  cabinTempC: number;
  cargoTempC: number;
}

export interface Vehicle {
  id: string; // e.g., 'TRK-884'
  plate: string; // e.g., 'AXC-117'
  driver: string;
  origin: string;
  destination: string;
  corridor: string;
  etaMinutes: number;
  speedKmh: number;
  cargoTempC: number;
  progressPercent: number;
  status: VehicleStatus;
  lastPingTime: string;
  telemetry: CanBusTelemetry;
}

export type TelemetryFilter = 'all' | 'in_transit' | 'risk_sla' | 'cold_chain';

export interface LiveTelemetryEvent {
  id: string;
  timestamp: string;
  vehicleId: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface CorridorWaypoint {
  id: string;
  name: string;
  xPercent: number; // 0 - 100 on visual SVG path
  yPercent: number;
  isPassed: boolean;
  activeVehicles: string[];
}

export interface TelemetryKpiSummary {
  slaRate: number; // 78.4%
  activeFleetCount: number; // 42
  totalFleetCount: number; // 48
  coldChainHealth: number; // 98.5%
  delayedCount: number; // 2
  averageSpeedKmh: number; // 64.8
}
