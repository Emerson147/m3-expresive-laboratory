import { TestBed } from '@angular/core/testing';
import { TelemetryService } from './telemetry.service';

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
});
