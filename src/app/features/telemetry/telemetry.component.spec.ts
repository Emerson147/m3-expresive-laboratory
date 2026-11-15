import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { TelemetryService } from '../../core/telemetry/telemetry.service';
import { ThemeService } from '../../core/theme/theme.service';
import { TelemetryComponent } from './telemetry.component';

describe('TelemetryComponent', () => {
  let component: TelemetryComponent;
  let fixture: ComponentFixture<TelemetryComponent>;
  let telemetryService: TelemetryService;
  let stageOverlay: StageOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelemetryComponent],
      providers: [TelemetryService, ThemeService, StageOverlayService]
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryComponent);
    component = fixture.componentInstance;
    telemetryService = TestBed.inject(TelemetryService);
    stageOverlay = TestBed.inject(StageOverlayService);
    fixture.detectChanges();
  });

  it('should create the telemetry component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the airy Mission Control workbench, real refresh interval, and 4 tonal OKLCH KPIs', () => {
    const el = fixture.nativeElement as HTMLElement;
    const workbench = el.querySelector('.tel-workbench') as HTMLElement | null;
    expect(workbench).toBeTruthy();
    expect(workbench?.classList.contains('overflow-y-auto')).toBe(true);
    expect(workbench?.classList.contains('lg:overflow-hidden')).toBe(false);

    const title = el.querySelector('h1');
    expect(title?.textContent).toContain('Panel de Monitoreo de Despachos y Flotas');
    expect(el.textContent).toContain('Sincronía cada 2s');

    const kpiCards = el.querySelectorAll('app-telemetry-kpi-strip .tel-kpi-card');
    expect(kpiCards.length).toBe(4);
    kpiCards.forEach(card => {
      expect(card.classList.contains('rounded-m3-xl')).toBe(true);
    });
  });

  it('should keep a single live wavy progress indicator on focus card while keeping KPIs and fleet bars flat', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-telemetry-focus-card .m3-linear-wavy-svg').length).toBe(1);
    expect(el.querySelectorAll('app-telemetry-kpi-strip .m3-linear-wavy-svg').length).toBe(0);
    expect(el.querySelectorAll('app-telemetry-fleet-panel .m3-linear-wavy-svg').length).toBe(0);

    const liveSwitch = el.querySelector('app-telemetry-header m3-switch button[role="switch"]') as HTMLButtonElement;
    expect(liveSwitch).toBeTruthy();
    expect(liveSwitch.getAttribute('aria-checked')).toBe('true');

    liveSwitch.click();
    fixture.detectChanges();

    expect(telemetryService.isLiveTelemetryActive()).toBe(false);
    expect(liveSwitch.getAttribute('aria-checked')).toBe('false');
    expect(el.textContent).toContain('En pausa');
  });

  it('should update seed hue when slider moves', () => {
    const themeService = TestBed.inject(ThemeService);
    component.onHueChange(180);
    expect(themeService.currentHue()).toBe(180);
  });

  it('should select vehicles from fleet cards or reactive corridor SVG nodes', () => {
    const el = fixture.nativeElement as HTMLElement;
    component.telemetryService.selectVehicle('TRK-912');
    fixture.detectChanges();
    expect(component.telemetryService.selectedVehicleId()).toBe('TRK-912');

    const trk419Marker = Array.from(el.querySelectorAll('app-telemetry-corridor-panel .tel-corridor-node')).find(
      node => node.getAttribute('aria-label')?.includes('TRK-419')
    ) as SVGGElement | undefined;
    expect(trk419Marker).toBeTruthy();

    trk419Marker?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(telemetryService.selectedVehicleId()).toBe('TRK-419');
  });

  it('should assign unique dialog-transform triggers, portal Inspect modal, export JSON telemetry, and restore focus', async () => {
    const el = fixture.nativeElement as HTMLElement;
    const focusInspectBtn = el.querySelector('#trigger-focus-inspect-TRK-884 button') as HTMLButtonElement;
    expect(focusInspectBtn).toBeTruthy();
    focusInspectBtn.focus();

    focusInspectBtn.click();
    fixture.detectChanges();

    expect(telemetryService.isInspectModalOpen()).toBe(true);
    expect(telemetryService.activeInspectTrigger()).toBe('focus-inspect-TRK-884');
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    const inspectDialog = el.querySelector('#telemetry-inspect-dialog[role="dialog"][aria-modal="true"]');
    expect(inspectDialog).toBeTruthy();

    const exportBtn = Array.from(inspectDialog!.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Exportar Telemetría')
    ) as HTMLButtonElement | undefined;
    expect(exportBtn).toBeTruthy();

    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      exportBtn?.click();
      fixture.detectChanges();
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    } finally {
      anchorClickSpy.mockRestore();
    }

    expect(telemetryService.isInspectModalOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
    expect(telemetryService.toastMessage()).toContain('TRK-884');

    await Promise.resolve();
    expect(document.activeElement).toBe(focusInspectBtn);

    // Verify Escape dismissal also closes and resets overlay state
    const vehicle = telemetryService.vehicles()[0];
    telemetryService.openInspectModal(vehicle, 'inspect-' + vehicle.id);
    fixture.detectChanges();
    expect(telemetryService.isInspectModalOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    component.onEscapePress();
    fixture.detectChanges();
    expect(telemetryService.isInspectModalOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
  });

  it('should validate Assign Route fields after submission, allow button-group cargo toggle, and update dynamic filter counts', () => {
    const el = fixture.nativeElement as HTMLElement;
    telemetryService.selectVehicle('TRK-912');
    fixture.detectChanges();

    const initialCounts = telemetryService.filterCounts();
    component.onAssignRouteClick();
    fixture.detectChanges();

    expect(telemetryService.isAssignModalOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);
    expect(component.assignFormVehicleId).toBe('TRK-912');

    // Clear destination via the rendered M3 filled text field and submit invalid form
    const destInput = el.querySelector('#tel-assign-destination') as HTMLInputElement;
    expect(destInput).toBeTruthy();
    destInput.value = '';
    destInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = el.querySelector('#telemetry-assign-dialog button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).toBeTruthy();
    submitBtn.click();
    fixture.detectChanges();

    expect(telemetryService.isAssignModalOpen()).toBe(true);
    expect(el.textContent).toContain('El destino final es obligatorio.');

    // Provide valid destination and choose Pharma protocol via <m3-button-group>
    destInput.value = 'Terminal San Bartolo';
    destInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const pharmaBtn = Array.from(el.querySelectorAll('#telemetry-assign-dialog m3-button-group button')).find(
      btn => btn.textContent?.includes('Farma (2-8°C)')
    ) as HTMLButtonElement | undefined;
    expect(pharmaBtn).toBeTruthy();
    pharmaBtn?.click();
    fixture.detectChanges();
    expect(component.assignFormCargoType).toBe('pharma');

    submitBtn.click();
    fixture.detectChanges();

    expect(telemetryService.isAssignModalOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);

    const updated = telemetryService.vehicles().find(v => v.id === 'TRK-912');
    expect(updated?.destination).toBe('Terminal San Bartolo');
    expect(updated?.status).toBe('optimal');

    // Verify dynamic reactive counts on filter chips updated without reloads
    expect(telemetryService.filterCounts().in_transit).toBe(initialCounts.in_transit + 1);
    expect(telemetryService.filterCounts().risk_sla).toBe(initialCounts.risk_sla - 1);
  });

  it('supports < lg split-pane WAI-ARIA tablist keyboard navigation', () => {
    const el = fixture.nativeElement as HTMLElement;
    const fleetTab = el.querySelector('#tel-tab-fleet') as HTMLButtonElement;
    const corridorTab = el.querySelector('#tel-tab-corridor') as HTMLButtonElement;
    const fleetPanel = el.querySelector('#tel-panel-fleet') as HTMLElement;
    const corridorPanel = el.querySelector('#tel-panel-corridor') as HTMLElement;

    expect(fleetTab.getAttribute('aria-selected')).toBe('true');
    expect(corridorTab.getAttribute('aria-selected')).toBe('false');
    expect(fleetPanel.classList.contains('hidden')).toBe(false);
    expect(corridorPanel.classList.contains('hidden')).toBe(true);

    fleetTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(component.mobilePane()).toBe('corridor');
    expect(corridorTab.getAttribute('aria-selected')).toBe('true');
    expect(fleetPanel.classList.contains('hidden')).toBe(true);
    expect(corridorPanel.classList.contains('hidden')).toBe(false);

    corridorTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(component.mobilePane()).toBe('fleet');

    fleetTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(component.mobilePane()).toBe('corridor');
  });
});
