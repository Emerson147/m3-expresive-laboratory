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

export type TelemetryFilterCounts = Record<TelemetryFilter, number>;

export type TelemetryCargoProtocol = 'cold_chain' | 'dry' | 'pharma';

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

export interface CorridorVehicleMarker {
  vehicleId: string;
  plate: string;
  status: VehicleStatus;
  progressPercent: number;
  x: number;
  y: number;
  isSelected: boolean;
}

export interface ActiveCorridorSummary {
  corridorName: string;
  origin: string;
  destination: string;
  vehicleId: string;
  progressPercent: number;
  averageSpeedKmh: number;
  etaMinutes: number;
}

export interface TelemetryKpiSummary {
  slaRate: number;
  activeFleetCount: number;
  totalFleetCount: number;
  idleFleetCount: number;
  fleetUtilizationPercent: number;
  coldChainHealth: number;
  coldChainAvgTempC: number;
  coldChainMonitoredCount: number;
  delayedCount: number;
  averageSpeedKmh: number;
}

export interface AssignRouteDto {
  vehicleId: string;
  corridor: string;
  destination: string;
  driver: string;
  cargoType: string;
}

export interface TelemetryExportPayload {
  exportedAt: string;
  telemetryActive: boolean;
  refreshIntervalMs: number;
  vehicle: Vehicle;
  kpiSnapshot: TelemetryKpiSummary;
  recentEvents: LiveTelemetryEvent[];
}
