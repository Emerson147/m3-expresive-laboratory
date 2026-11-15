import { TestBed } from '@angular/core/testing';
import {
  TELEMETRY_DOCKED_RESERVE_COUNT,
  TELEMETRY_REFRESH_INTERVAL_MS,
  TelemetryService,
  evaluateCorridorSplinePoint
} from './telemetry.service';
import { TelemetryFilter } from './telemetry.models';

describe('TelemetryService', () => {
  let service: TelemetryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelemetryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial vehicles loaded', () => {
    expect(service.vehicles().length).toBeGreaterThan(0);
    expect(service.selectedVehicleId()).toBe('TRK-884');
  });

  it('should filter vehicles correctly', () => {
    service.setFilter('risk_sla');
    const delayed = service.filteredVehicles();
    expect(delayed.every(v => v.status === 'delayed' || v.status === 'critical')).toBe(true);

    service.setFilter('all');
    expect(service.filteredVehicles().length).toBe(service.vehicles().length);
  });

  it('should compute KPI summary accurately', () => {
    const kpis = service.kpiSummary();
    expect(kpis.activeFleetCount).toBe(6);
    expect(kpis.slaRate).toBeGreaterThan(0);
    expect(kpis.coldChainHealth).toBeGreaterThan(0);
  });

  it('should manage inspect modal state', () => {
    const vehicle = service.vehicles()[0];
    service.openInspectModal(vehicle);
    expect(service.isInspectModalOpen()).toBe(true);
    expect(service.inspectedVehicle()?.id).toBe(vehicle.id);

    service.closeInspectModal();
    expect(service.isInspectModalOpen()).toBe(false);
    expect(service.inspectedVehicle()).toBeNull();
  });

  it('should manage route assignment modal and dispatch new routes', () => {
    service.openAssignModal('assign-route');
    expect(service.isAssignModalOpen()).toBe(true);
    expect(service.activeAssignTrigger()).toBe('assign-route');

    service.assignNewRoute({
      vehicleId: 'TRK-912',
      corridor: 'Corredor Panamericana Sur',
      destination: 'Terminal Pucusana Km 58',
      driver: 'R. Paredes',
      cargoType: 'Cadena de Frío (-18°C)'
    });

    expect(service.isAssignModalOpen()).toBe(false);
    const updated = service.vehicles().find(v => v.id === 'TRK-912');
    expect(updated?.destination).toBe('Terminal Pucusana Km 58');
    expect(updated?.status).toBe('optimal');

    const latestEvent = service.liveEvents()[0];
    expect(latestEvent.vehicleId).toBe('TRK-912');
    expect(latestEvent.message).toContain('Ruta asignada');
  });

  it('should compute filterCounts matching filteredVehicles and update dynamically after route assignment', () => {
    const expectedInitial = {
      all: 6,
      in_transit: 3,
      risk_sla: 2,
      cold_chain: 4
    };
    expect(service.filterCounts()).toEqual(expectedInitial);

    const filters: TelemetryFilter[] = ['all', 'in_transit', 'risk_sla', 'cold_chain'];
    for (const filter of filters) {
      service.setFilter(filter);
      expect(service.filteredVehicles().length).toBe(service.filterCounts()[filter]);
    }

    service.setFilter('all');
    service.assignNewRoute({
      vehicleId: 'TRK-912',
      corridor: 'Corredor Panamericana Sur',
      destination: 'Terminal Pucusana Km 58',
      driver: 'R. Paredes',
      cargoType: 'Cadena de Frío (-18°C)'
    });

    expect(service.filterCounts()).toEqual({
      all: 6,
      in_transit: 4,
      risk_sla: 1,
      cold_chain: 4
    });
  });

  it('should compute derived fleet utilization and cold-chain KPI metrics', () => {
    const kpis = service.kpiSummary();
    expect(kpis.idleFleetCount).toBe(TELEMETRY_DOCKED_RESERVE_COUNT);
    expect(kpis.idleFleetCount).toBe(6);
    expect(kpis.totalFleetCount).toBe(12);
    expect(kpis.fleetUtilizationPercent).toBe(50);
    expect(kpis.coldChainMonitoredCount).toBe(4);
    expect(kpis.coldChainAvgTempC).toBe(-17.7);
  });

  it('should evaluate cubic-Bezier corridor spline points and update markers and corridor summary', () => {
    expect(evaluateCorridorSplinePoint(0)).toEqual({ x: 20, y: 100 });
    expect(evaluateCorridorSplinePoint(50)).toEqual({ x: 160, y: 50 });
    expect(evaluateCorridorSplinePoint(100)).toEqual({ x: 300, y: 40 });
    expect(evaluateCorridorSplinePoint(-25)).toEqual({ x: 20, y: 100 });
    expect(evaluateCorridorSplinePoint(150)).toEqual({ x: 300, y: 40 });

    service.selectVehicle('TRK-912');
    const summary = service.activeCorridorSummary();
    expect(summary.vehicleId).toBe('TRK-912');

    const selectedMarker = service.corridorMarkers().find(m => m.vehicleId === 'TRK-912');
    expect(selectedMarker?.isSelected).toBe(true);
    expect(service.corridorMarkers().filter(m => m.isSelected).length).toBe(1);

    service.setFilter('risk_sla');
    expect(service.corridorMarkers().length).toBe(service.filterCounts().risk_sla);
  });

  it('should clamp progress, recalculate etaMinutes, and sync inspectedVehicle via setVehicleProgress', () => {
    const initial = service.vehicles().find(v => v.id === 'TRK-884')!;
    service.openInspectModal(initial);

    service.setVehicleProgress('TRK-884', 90);
    const updated = service.vehicles().find(v => v.id === 'TRK-884')!;
    expect(updated.progressPercent).toBe(90);
    expect(updated.etaMinutes).toBeLessThan(initial.etaMinutes);
    expect(service.inspectedVehicle()?.progressPercent).toBe(90);
    expect(service.inspectedVehicle()?.etaMinutes).toBe(updated.etaMinutes);

    service.setVehicleProgress('TRK-884', -40);
    expect(service.vehicles().find(v => v.id === 'TRK-884')?.progressPercent).toBe(0);

    service.setVehicleProgress('TRK-884', 180);
    expect(service.vehicles().find(v => v.id === 'TRK-884')?.progressPercent).toBe(100);
    expect(service.inspectedVehicle()?.progressPercent).toBe(100);

    service.closeInspectModal();
  });

  it('should build and export telemetry payload, record an info event, and manage toastMessage', () => {
    const target = service.vehicles().find(v => v.id === 'TRK-884')!;
    const previewPayload = service.buildTelemetryExportPayload(target);
    expect(previewPayload.vehicle.id).toBe('TRK-884');
    expect(previewPayload.refreshIntervalMs).toBe(TELEMETRY_REFRESH_INTERVAL_MS);
    expect(previewPayload.recentEvents.every(e => e.vehicleId === 'TRK-884')).toBe(true);
    expect(previewPayload.kpiSnapshot).toEqual(service.kpiSummary());

    const initialEventCount = service.liveEvents().length;
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      const exportedPayload = service.exportVehicleTelemetry(target);
      expect(exportedPayload.vehicle.id).toBe('TRK-884');
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    } finally {
      anchorClickSpy.mockRestore();
    }
    expect(service.liveEvents().length).toBe(initialEventCount + 1);
    expect(service.liveEvents()[0].type).toBe('info');
    expect(service.liveEvents()[0].vehicleId).toBe('TRK-884');
    expect(service.liveEvents()[0].message).toContain('Diagnóstico CAN-BUS exportado');
    expect(service.toastMessage()).toBe('Telemetría CAN-BUS de TRK-884 exportada en JSON.');

    service.dismissToast();
    expect(service.toastMessage()).toBeNull();
  });

  it('should toggle live telemetry and reset isFleetFlipActive synchronously after filter change', () => {
    const initialLive = service.isLiveTelemetryActive();
    service.toggleLiveTelemetry();
    expect(service.isLiveTelemetryActive()).toBe(!initialLive);
    service.toggleLiveTelemetry();
    expect(service.isLiveTelemetryActive()).toBe(initialLive);

    service.setFilter('cold_chain');
    expect(service.currentFilter()).toBe('cold_chain');
    expect(service.isFleetFlipActive()).toBe(false);
  });
});
