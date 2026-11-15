import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, signal, computed, inject, NgZone, PLATFORM_ID, ApplicationRef, DestroyRef } from '@angular/core';
import { StageOverlayService } from '../dialog/stage-overlay.service';
import {
  ActiveCorridorSummary,
  AssignRouteDto,
  CorridorVehicleMarker,
  CorridorWaypoint,
  LiveTelemetryEvent,
  TelemetryExportPayload,
  TelemetryFilter,
  TelemetryFilterCounts,
  TelemetryKpiSummary,
  Vehicle
} from './telemetry.models';

export const TELEMETRY_REFRESH_INTERVAL_MS = 2000;
export const TELEMETRY_DOCKED_RESERVE_COUNT = 6;

const CORRIDOR_SEG_1: readonly [readonly [number, number], readonly [number, number], readonly [number, number], readonly [number, number]] = [
  [20, 100],
  [70, 120],
  [100, 30],
  [160, 50]
];

const CORRIDOR_SEG_2: readonly [readonly [number, number], readonly [number, number], readonly [number, number], readonly [number, number]] = [
  [160, 50],
  [220, 70],
  [260, 110],
  [300, 40]
];

function evalCubicBezierPoint(
  u: number,
  pts: readonly [readonly [number, number], readonly [number, number], readonly [number, number], readonly [number, number]]
): { x: number; y: number } {
  const [p0, p1, p2, p3] = pts;
  const inv = 1 - u;
  const inv2 = inv * inv;
  const u2 = u * u;
  const b0 = inv2 * inv;
  const b1 = 3 * inv2 * u;
  const b2 = 3 * inv * u2;
  const b3 = u2 * u;
  return {
    x: Math.round((b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0]) * 10) / 10,
    y: Math.round((b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1]) * 10) / 10
  };
}

export function matchesTelemetryFilter(vehicle: Vehicle, filter: TelemetryFilter): boolean {
  switch (filter) {
    case 'in_transit':
      return vehicle.status === 'optimal' || vehicle.status === 'in_transit';
    case 'risk_sla':
      return vehicle.status === 'delayed' || vehicle.status === 'critical';
    case 'cold_chain':
      return vehicle.status === 'cold_chain_warning' || vehicle.cargoTempC < 0;
    case 'all':
    default:
      return true;
  }
}

export function evaluateCorridorSplinePoint(progressPercent: number): { x: number; y: number } {
  const clamped = Math.min(100, Math.max(0, Number(progressPercent) || 0));
  const t = clamped / 100;
  return t <= 0.5
    ? evalCubicBezierPoint(t * 2, CORRIDOR_SEG_1)
    : evalCubicBezierPoint((t - 0.5) * 2, CORRIDOR_SEG_2);
}

function estimateEtaMinutes(progressPercent: number): number {
  const remaining = Math.max(0, 100 - Math.min(100, Math.max(0, progressPercent)));
  return Math.max(1, Math.round(remaining * 0.65));
}

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'TRK-884',
    plate: 'AXC-117',
    driver: 'Lucía Paredes',
    origin: 'Terminal Pucusana',
    destination: 'CD Callao Muelle Sur',
    corridor: 'Corredor Panamericana Sur',
    etaMinutes: 28,
    speedKmh: 68,
    cargoTempC: -18.4,
    progressPercent: 68,
    status: 'optimal',
    lastPingTime: '23:45:28',
    telemetry: {
      engineRpm: 1850,
      fuelLevelPercent: 74,
      batteryVolts: 27.8,
      tirePressurePsi: 110,
      cabinTempC: 21.0,
      cargoTempC: -18.4
    }
  },
  {
    id: 'TRK-912',
    plate: 'BQK-402',
    driver: 'R. Paredes',
    origin: 'Planta Huachipa',
    destination: 'Puerto Callao Terminal',
    corridor: 'Corredor Carretera Central',
    etaMinutes: 39,
    speedKmh: 28,
    cargoTempC: -16.9,
    progressPercent: 28,
    status: 'delayed',
    lastPingTime: '23:45:15',
    telemetry: {
      engineRpm: 1200,
      fuelLevelPercent: 62,
      batteryVolts: 27.2,
      tirePressurePsi: 108,
      cabinTempC: 22.4,
      cargoTempC: -16.9
    }
  },
  {
    id: 'TRK-108',
    plate: 'C0P-221',
    driver: 'A. Rojas',
    origin: 'Terminal Lurín',
    destination: 'Hub Distribución Norte',
    corridor: 'Corredor Vía de Evitamiento',
    etaMinutes: 46,
    speedKmh: 34,
    cargoTempC: 21.8,
    progressPercent: 89,
    status: 'delayed',
    lastPingTime: '23:45:02',
    telemetry: {
      engineRpm: 1400,
      fuelLevelPercent: 41,
      batteryVolts: 26.9,
      tirePressurePsi: 105,
      cabinTempC: 23.1,
      cargoTempC: 21.8
    }
  },
  {
    id: 'TRK-419',
    plate: 'D3L-985',
    driver: 'Jorge Ramos',
    origin: 'Chilca Centro',
    destination: 'CD Lurín Farmacéutico',
    corridor: 'Corredor Panamericana Sur',
    etaMinutes: 14,
    speedKmh: 72,
    cargoTempC: -21.2,
    progressPercent: 92,
    status: 'optimal',
    lastPingTime: '23:44:50',
    telemetry: {
      engineRpm: 1950,
      fuelLevelPercent: 88,
      batteryVolts: 28.1,
      tirePressurePsi: 112,
      cabinTempC: 20.5,
      cargoTempC: -21.2
    }
  },
  {
    id: 'TRK-305',
    plate: 'BTR-640',
    driver: 'Ana Villanueva',
    origin: 'Aeropuerto Jorge Chávez',
    destination: 'Aduana Huachipa',
    corridor: 'Corredor Gambetta',
    etaMinutes: 52,
    speedKmh: 45,
    cargoTempC: -14.2,
    progressPercent: 44,
    status: 'cold_chain_warning',
    lastPingTime: '23:44:31',
    telemetry: {
      engineRpm: 1600,
      fuelLevelPercent: 53,
      batteryVolts: 27.4,
      tirePressurePsi: 109,
      cabinTempC: 22.0,
      cargoTempC: -14.2
    }
  },
  {
    id: 'TRK-720',
    plate: 'F2M-358',
    driver: 'Rosa Huamán',
    origin: 'Parque Industrial Ancón',
    destination: 'Muelle Norte Terminal',
    corridor: 'Corredor Panamericana Norte',
    etaMinutes: 18,
    speedKmh: 64,
    cargoTempC: 19.5,
    progressPercent: 77,
    status: 'optimal',
    lastPingTime: '23:44:10',
    telemetry: {
      engineRpm: 1750,
      fuelLevelPercent: 69,
      batteryVolts: 27.6,
      tirePressurePsi: 111,
      cabinTempC: 21.5,
      cargoTempC: 19.5
    }
  }
];

const INITIAL_EVENTS: LiveTelemetryEvent[] = [
  {
    id: 'EVT-101',
    timestamp: '23:45:28',
    vehicleId: 'TRK-108',
    message: 'Inspección técnica confirmada (84% completado). Telemetría CAN-BUS OK.',
    type: 'success'
  },
  {
    id: 'EVT-102',
    timestamp: '23:43:54',
    vehicleId: 'TRK-419',
    message: 'Ingreso a geocerca final Chilca (98.5% completado).',
    type: 'info'
  },
  {
    id: 'EVT-103',
    timestamp: '23:41:40',
    vehicleId: 'TRK-912',
    message: 'Alerta SLA: Velocidad < 30 km/h en Corredor Carretera Central.',
    type: 'warning'
  },
  {
    id: 'EVT-104',
    timestamp: '23:38:15',
    vehicleId: 'TRK-884',
    message: 'Telemetría térmica verificada a -18.4°C sin desviación.',
    type: 'success'
  },
  {
    id: 'EVT-105',
    timestamp: '23:34:02',
    vehicleId: 'TRK-305',
    message: 'Advertencia Cadena de Frío: Temperatura subió a -14.2°C.',
    type: 'error'
  }
];

const INITIAL_WAYPOINTS: CorridorWaypoint[] = [
  { id: 'WP-1', name: 'Hub Callao', xPercent: 12, yPercent: 68, isPassed: true, activeVehicles: [] },
  { id: 'WP-2', name: 'Trk-912', xPercent: 32, yPercent: 38, isPassed: true, activeVehicles: ['TRK-912'] },
  { id: 'WP-3', name: 'Trk-884 (Activo)', xPercent: 54, yPercent: 24, isPassed: true, activeVehicles: ['TRK-884'] },
  { id: 'WP-4', name: 'Trk-108', xPercent: 78, yPercent: 46, isPassed: false, activeVehicles: ['TRK-108'] },
  { id: 'WP-5', name: 'Planta Sur', xPercent: 92, yPercent: 32, isPassed: false, activeVehicles: [] }
];

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly stageOverlay = inject(StageOverlayService);

  readonly refreshIntervalMs = TELEMETRY_REFRESH_INTERVAL_MS;
  readonly refreshIntervalSeconds = TELEMETRY_REFRESH_INTERVAL_MS / 1000;

  readonly vehicles = signal<Vehicle[]>(INITIAL_VEHICLES);
  readonly selectedVehicleId = signal<string>('TRK-884');
  readonly currentFilter = signal<TelemetryFilter>('all');
  readonly liveEvents = signal<LiveTelemetryEvent[]>(INITIAL_EVENTS);
  readonly waypoints = signal<CorridorWaypoint[]>(INITIAL_WAYPOINTS);
  readonly isLiveTelemetryActive = signal<boolean>(true);
  readonly isFleetFlipActive = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Modal inspection state
  readonly inspectedVehicle = signal<Vehicle | null>(null);
  readonly isInspectModalOpen = signal<boolean>(false);
  readonly activeInspectTrigger = signal<string | null>(null);

  // Modal route assignment state
  readonly isAssignModalOpen = signal<boolean>(false);
  readonly activeAssignTrigger = signal<string | null>(null);
  readonly isModalTransitioning = signal<boolean>(false);

  readonly selectedVehicle = computed(() => {
    return this.vehicles().find(v => v.id === this.selectedVehicleId()) ?? this.vehicles()[0];
  });

  readonly filteredVehicles = computed(() => {
    const filter = this.currentFilter();
    return this.vehicles().filter(v => matchesTelemetryFilter(v, filter));
  });

  readonly filterCounts = computed<TelemetryFilterCounts>(() => {
    const list = this.vehicles();
    return {
      all: list.length,
      in_transit: list.filter(v => matchesTelemetryFilter(v, 'in_transit')).length,
      risk_sla: list.filter(v => matchesTelemetryFilter(v, 'risk_sla')).length,
      cold_chain: list.filter(v => matchesTelemetryFilter(v, 'cold_chain')).length
    };
  });

  readonly kpiSummary = computed<TelemetryKpiSummary>(() => {
    const list = this.vehicles();
    const activeCount = list.length;
    const totalCount = activeCount + TELEMETRY_DOCKED_RESERVE_COUNT;
    const optimal = list.filter(v => v.status === 'optimal').length;
    const delayed = list.filter(v => v.status === 'delayed' || v.status === 'critical').length;
    const coldOptimal = list.filter(v => v.status !== 'cold_chain_warning').length;
    const coldUnits = list.filter(v => v.cargoTempC < 0);
    const coldChainAvgTempC = coldUnits.length > 0
      ? Math.round((coldUnits.reduce((acc, v) => acc + v.cargoTempC, 0) / coldUnits.length) * 10) / 10
      : 0;
    const avgSpeed = Math.round(list.reduce((acc, v) => acc + v.speedKmh, 0) / (activeCount || 1));

    return {
      slaRate: Math.round((optimal / (activeCount || 1)) * 1000) / 10,
      activeFleetCount: activeCount,
      totalFleetCount: totalCount,
      idleFleetCount: TELEMETRY_DOCKED_RESERVE_COUNT,
      fleetUtilizationPercent: Math.round((activeCount / (totalCount || 1)) * 1000) / 10,
      coldChainHealth: Math.round((coldOptimal / (activeCount || 1)) * 1000) / 10,
      coldChainAvgTempC,
      coldChainMonitoredCount: coldUnits.length,
      delayedCount: delayed,
      averageSpeedKmh: avgSpeed
    };
  });

  readonly corridorMarkers = computed<CorridorVehicleMarker[]>(() => {
    const selectedId = this.selectedVehicle().id;
    return this.filteredVehicles().map(v => {
      const point = evaluateCorridorSplinePoint(v.progressPercent);
      return {
        vehicleId: v.id,
        plate: v.plate,
        status: v.status,
        progressPercent: v.progressPercent,
        x: point.x,
        y: point.y,
        isSelected: v.id === selectedId
      };
    });
  });

  readonly activeCorridorSummary = computed<ActiveCorridorSummary>(() => {
    const selected = this.selectedVehicle();
    return {
      corridorName: selected.corridor,
      origin: selected.origin,
      destination: selected.destination,
      vehicleId: selected.id,
      progressPercent: selected.progressPercent,
      averageSpeedKmh: this.kpiSummary().averageSpeedKmh,
      etaMinutes: selected.etaMinutes
    };
  });

  constructor() {
    this.startLiveSimulation();
  }

  selectVehicle(id: string): void {
    this.selectedVehicleId.set(id);
  }

  setVehicleProgress(vehicleId: string, progressPercent: number): void {
    const clamped = Math.round(Math.min(100, Math.max(0, Number(progressPercent) || 0)) * 10) / 10;
    const ping = this.formatCurrentTimestamp();
    this.vehicles.update(list =>
      list.map(v => {
        if (v.id !== vehicleId) return v;
        return {
          ...v,
          progressPercent: clamped,
          etaMinutes: estimateEtaMinutes(clamped),
          lastPingTime: ping
        };
      })
    );

    const activeInspected = this.inspectedVehicle();
    if (activeInspected?.id === vehicleId) {
      this.inspectedVehicle.set({
        ...activeInspected,
        progressPercent: clamped,
        etaMinutes: estimateEtaMinutes(clamped),
        lastPingTime: ping
      });
    }
  }

  setFilter(filter: TelemetryFilter): void {
    if (this.currentFilter() === filter) return;
    this.isFleetFlipActive.set(true);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.currentFilter.set(filter);
      },
      () => {
        this.isFleetFlipActive.set(false);
      }
    );
  }

  toggleLiveTelemetry(): void {
    this.isLiveTelemetryActive.update(v => !v);
  }

  openInspectModal(vehicle: Vehicle, triggerId?: string): void {
    const trigger = triggerId || ('inspect-' + vehicle.id);
    this.activeInspectTrigger.set(trigger);
    this.inspectedVehicle.set(vehicle);
    this.isModalTransitioning.set(true);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isInspectModalOpen.set(true);
        this.stageOverlay.setOverlayOpen(true);
      },
      () => {
        this.isModalTransitioning.set(false);
      }
    );
  }

  closeInspectModal(): void {
    this.isModalTransitioning.set(true);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isInspectModalOpen.set(false);
        this.stageOverlay.setOverlayOpen(this.isAssignModalOpen());
      },
      () => {
        this.activeInspectTrigger.set(null);
        this.inspectedVehicle.set(null);
        this.isModalTransitioning.set(false);
      },
      { isExiting: true }
    );
  }

  openAssignModal(triggerId = 'assign-route'): void {
    this.activeAssignTrigger.set(triggerId);
    this.isModalTransitioning.set(true);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isAssignModalOpen.set(true);
        this.stageOverlay.setOverlayOpen(true);
      },
      () => {
        this.isModalTransitioning.set(false);
      }
    );
  }

  closeAssignModal(): void {
    this.isModalTransitioning.set(true);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isAssignModalOpen.set(false);
        this.stageOverlay.setOverlayOpen(this.isInspectModalOpen());
      },
      () => {
        this.activeAssignTrigger.set(null);
        this.isModalTransitioning.set(false);
      },
      { isExiting: true }
    );
  }

  assignNewRoute(data: AssignRouteDto): void {
    const ping = this.formatCurrentTimestamp();
    this.vehicles.update(list =>
      list.map(v => {
        if (v.id === data.vehicleId) {
          return {
            ...v,
            corridor: data.corridor,
            destination: data.destination,
            driver: data.driver,
            status: 'optimal',
            progressPercent: 8,
            etaMinutes: estimateEtaMinutes(8),
            lastPingTime: ping
          };
        }
        return v;
      })
    );

    this.selectedVehicleId.set(data.vehicleId);

    this.liveEvents.update(evts => [
      {
        id: `EVT-${Date.now()}`,
        timestamp: ping,
        vehicleId: data.vehicleId,
        message: `Ruta asignada: ${data.corridor} → ${data.destination}. Operador: ${data.driver}. (${data.cargoType}).`,
        type: 'success'
      },
      ...evts
    ]);

    this.toastMessage.set(`Ruta confirmada para ${data.vehicleId} hacia ${data.destination}.`);
    this.closeAssignModal();
  }

  buildTelemetryExportPayload(vehicle: Vehicle): TelemetryExportPayload {
    return {
      exportedAt: new Date().toISOString(),
      telemetryActive: this.isLiveTelemetryActive(),
      refreshIntervalMs: this.refreshIntervalMs,
      vehicle,
      kpiSnapshot: this.kpiSummary(),
      recentEvents: this.liveEvents().filter(evt => evt.vehicleId === vehicle.id)
    };
  }

  exportVehicleTelemetry(vehicle: Vehicle): TelemetryExportPayload {
    const payload = this.buildTelemetryExportPayload(vehicle);
    const ping = this.formatCurrentTimestamp();

    if (
      isPlatformBrowser(this.platformId) &&
      typeof URL !== 'undefined' &&
      typeof URL.createObjectURL === 'function'
    ) {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const link = this.document.createElement('a');
      link.href = blobUrl;
      link.download = `telemetry-${vehicle.id.toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    }

    this.liveEvents.update(evts => [
      {
        id: `EVT-${Date.now()}`,
        timestamp: ping,
        vehicleId: vehicle.id,
        message: `Diagnóstico CAN-BUS exportado (${vehicle.telemetry.engineRpm} RPM, ${vehicle.telemetry.cargoTempC}°C).`,
        type: 'info'
      },
      ...evts
    ]);

    this.toastMessage.set(`Telemetría CAN-BUS de ${vehicle.id} exportada en JSON.`);
    return payload;
  }

  dismissToast(): void {
    this.toastMessage.set(null);
  }

  private formatCurrentTimestamp(): string {
    return new Date().toLocaleTimeString('es-PE', { hour12: false });
  }

  private startLiveSimulation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      const timerId = setInterval(() => {
        if (!this.isLiveTelemetryActive()) return;

        this.ngZone.run(() => {
          const ping = this.formatCurrentTimestamp();
          // Gently advance progress on unselected vehicles in the fleet
          this.vehicles.update(list => {
            const selId = this.selectedVehicleId();
            return list.map(v => {
              if (v.id === selId) {
                return v; // Preserved for interactive user scrubber
              }
              if (v.status === 'delayed') {
                return {
                  ...v,
                  speedKmh: Math.max(20, Math.min(45, v.speedKmh + (Math.random() > 0.5 ? 2 : -2))),
                  lastPingTime: ping
                };
              }
              const rawNext = v.progressPercent >= 95 ? 12 : v.progressPercent + 0.2;
              const roundedProg = Math.round(rawNext * 10) / 10;
              return {
                ...v,
                progressPercent: roundedProg,
                etaMinutes: estimateEtaMinutes(roundedProg),
                speedKmh: Math.max(55, Math.min(85, v.speedKmh + (Math.random() > 0.5 ? 1 : -1))),
                lastPingTime: ping
              };
            });
          });
        });
      }, TELEMETRY_REFRESH_INTERVAL_MS);

      this.destroyRef.onDestroy(() => clearInterval(timerId));
    });
  }
}
