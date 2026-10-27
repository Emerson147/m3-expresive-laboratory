import { Injectable, signal, computed, inject, NgZone, PLATFORM_ID, ApplicationRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  Vehicle, 
  TelemetryFilter, 
  LiveTelemetryEvent, 
  CorridorWaypoint, 
  TelemetryKpiSummary 
} from './telemetry.models';

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

  readonly vehicles = signal<Vehicle[]>(INITIAL_VEHICLES);
  readonly selectedVehicleId = signal<string>('TRK-884');
  readonly currentFilter = signal<TelemetryFilter>('all');
  readonly liveEvents = signal<LiveTelemetryEvent[]>(INITIAL_EVENTS);
  readonly waypoints = signal<CorridorWaypoint[]>(INITIAL_WAYPOINTS);
  readonly isLiveTelemetryActive = signal<boolean>(true);

  // Modal inspection state (Container Transform & Stage Recess depth)
  readonly inspectedVehicle = signal<Vehicle | null>(null);
  readonly isInspectModalOpen = signal<boolean>(false);
  readonly activeInspectTrigger = signal<string | null>(null);

  // Modal route assignment state (Container Transform)
  readonly isAssignModalOpen = signal<boolean>(false);
  readonly activeAssignTrigger = signal<string | null>(null);

  // Computed views
  readonly selectedVehicle = computed(() => {
    return this.vehicles().find(v => v.id === this.selectedVehicleId()) ?? this.vehicles()[0];
  });

  readonly filteredVehicles = computed(() => {
    const filter = this.currentFilter();
    const all = this.vehicles();
    switch (filter) {
      case 'in_transit':
        return all.filter(v => v.status === 'optimal' || v.status === 'in_transit');
      case 'risk_sla':
        return all.filter(v => v.status === 'delayed' || v.status === 'critical');
      case 'cold_chain':
        return all.filter(v => v.status === 'cold_chain_warning' || v.cargoTempC < 0);
      case 'all':
      default:
        return all;
    }
  });

  readonly kpiSummary = computed<TelemetryKpiSummary>(() => {
    const list = this.vehicles();
    const total = list.length;
    const optimal = list.filter(v => v.status === 'optimal').length;
    const delayed = list.filter(v => v.status === 'delayed' || v.status === 'critical').length;
    const coldOptimal = list.filter(v => v.status !== 'cold_chain_warning').length;
    const avgSpeed = Math.round(list.reduce((acc, v) => acc + v.speedKmh, 0) / (total || 1));

    return {
      slaRate: Math.round((optimal / (total || 1)) * 1000) / 10,
      activeFleetCount: total,
      totalFleetCount: total + 6,
      coldChainHealth: Math.round((coldOptimal / (total || 1)) * 1000) / 10,
      delayedCount: delayed,
      averageSpeedKmh: avgSpeed
    };
  });

  constructor() {
    this.startLiveSimulation();
  }

  selectVehicle(id: string): void {
    this.selectedVehicleId.set(id);
  }

  setFilter(filter: TelemetryFilter): void {
    if (this.currentFilter() === filter) return;
    this.runViewTransition(() => {
      this.currentFilter.set(filter);
    });
  }

  toggleLiveTelemetry(): void {
    this.isLiveTelemetryActive.update(v => !v);
  }

  openInspectModal(vehicle: Vehicle, triggerId?: string): void {
    const trigger = triggerId || ('inspect-' + vehicle.id);
    this.activeInspectTrigger.set(trigger);
    this.inspectedVehicle.set(vehicle);

    // Synchronize DOM so trigger element gets view-transition-name before snapshot
    this.appRef.tick();

    this.runViewTransition(
      () => this.isInspectModalOpen.set(true)
    );
  }

  closeInspectModal(): void {
    this.appRef.tick();

    this.runViewTransition(
      () => this.isInspectModalOpen.set(false),
      () => {
        this.activeInspectTrigger.set(null);
        this.inspectedVehicle.set(null);
      }
    );
  }

  openAssignModal(triggerId = 'assign-route'): void {
    this.activeAssignTrigger.set(triggerId);

    // Synchronize DOM so trigger button gets view-transition-name before snapshot
    this.appRef.tick();

    this.runViewTransition(
      () => this.isAssignModalOpen.set(true)
    );
  }

  closeAssignModal(): void {
    this.appRef.tick();

    this.runViewTransition(
      () => this.isAssignModalOpen.set(false),
      () => this.activeAssignTrigger.set(null)
    );
  }

  assignNewRoute(data: {
    vehicleId: string;
    corridor: string;
    destination: string;
    driver: string;
    cargoType: string;
  }): void {
    this.vehicles.update(list => {
      return list.map(v => {
        if (v.id === data.vehicleId) {
          return {
            ...v,
            corridor: data.corridor,
            destination: data.destination,
            driver: data.driver,
            status: 'optimal',
            progressPercent: 8,
            etaMinutes: 38
          };
        }
        return v;
      });
    });

    this.selectedVehicleId.set(data.vehicleId);

    const nowTime = new Date().toLocaleTimeString('es-PE', { hour12: false });
    this.liveEvents.update(evts => [
      {
        id: `EVT-${Date.now()}`,
        timestamp: nowTime,
        vehicleId: data.vehicleId,
        message: `Ruta asignada: ${data.corridor} → ${data.destination}. Operador: ${data.driver}. (${data.cargoType}).`,
        type: 'success'
      },
      ...evts
    ]);

    this.closeAssignModal();
  }

  private runViewTransition(update: () => void, cleanup?: () => void): void {
    const doc = typeof document !== 'undefined' ? (document as any) : null;
    if (doc && typeof doc.startViewTransition === 'function') {
      const transition = doc.startViewTransition(() => {
        update();
        this.appRef.tick();
      });
      transition.finished.finally(() => {
        cleanup?.();
        this.appRef.tick();
      });
    } else {
      update();
      cleanup?.();
    }
  }

  private startLiveSimulation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        if (!this.isLiveTelemetryActive()) return;

        this.ngZone.run(() => {
          // Gently advance progress on unselected vehicles in the fleet
          this.vehicles.update(list => {
            const selId = this.selectedVehicleId();
            return list.map(v => {
              if (v.id === selId) {
                return v; // Preserved for user interactive slider calibration
              }
              if (v.status === 'delayed') {
                return {
                  ...v,
                  speedKmh: Math.max(20, Math.min(45, v.speedKmh + (Math.random() > 0.5 ? 2 : -2)))
                };
              }
              const nextProg = v.progressPercent >= 95 ? 12 : v.progressPercent + 0.2;
              return {
                ...v,
                progressPercent: Math.round(nextProg * 10) / 10,
                speedKmh: Math.max(55, Math.min(85, v.speedKmh + (Math.random() > 0.5 ? 1 : -1)))
              };
            });
          });
        });
      }, 2000);
    });
  }
}
