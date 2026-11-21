import { DOCUMENT } from '@angular/common';
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

  it('should render the Mission Control bento workbench, real refresh interval, and 4 balanced OKLCH KPIs', () => {
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

    // Fleet list flows without cramped inner scrollbox; M3 slider drives Focus progress
    const fleetList = el.querySelector('app-telemetry-fleet-panel ul') as HTMLUListElement | null;
    expect(fleetList?.classList.contains('overflow-y-auto')).toBe(false);

    const progressSlider = el.querySelector('app-telemetry-focus-card m3-slider input#tel-dispatch-progress-slider') as HTMLInputElement;
    expect(progressSlider).toBeTruthy();
    progressSlider.value = '82';
    progressSlider.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(telemetryService.selectedVehicle().progressPercent).toBe(82);
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

  it('should update seed hue when OKLCH calibration slider changes', () => {
    const el = fixture.nativeElement as HTMLElement;
    const themeService = TestBed.inject(ThemeService);
    const hueSlider = el.querySelector('app-telemetry-header m3-slider input[type="range"]') as HTMLInputElement;
    expect(hueSlider).toBeTruthy();

    hueSlider.value = '180';
    hueSlider.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(themeService.currentHue()).toBe(180);
  });

  it('should select vehicles from fleet cards, reactive corridor SVG nodes, and actionable event log', () => {
    const el = fixture.nativeElement as HTMLElement;
    component.telemetryService.selectVehicle('TRK-912');
    fixture.detectChanges();
    expect(component.telemetryService.selectedVehicleId()).toBe('TRK-912');

    // Corridor renders anti-overlapping vehicle pills inside .tel-corridor-node
    const trk419Marker = Array.from(el.querySelectorAll('app-telemetry-corridor-panel .tel-corridor-node')).find(
      node => node.getAttribute('aria-label')?.includes('TRK-419')
    ) as SVGGElement | undefined;
    expect(trk419Marker).toBeTruthy();

    trk419Marker?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(telemetryService.selectedVehicleId()).toBe('TRK-419');

    // Clicking an event focuses the associated vehicle and supports scope filtering
    const evtBtn = Array.from(el.querySelectorAll('app-telemetry-events-panel .tel-event-card')).find(btn =>
      btn.textContent?.includes('TRK-305')
    ) as HTMLButtonElement | undefined;
    expect(evtBtn).toBeTruthy();
    evtBtn?.click();
    fixture.detectChanges();
    expect(telemetryService.selectedVehicleId()).toBe('TRK-305');

    const soloScopeBtn = Array.from(el.querySelectorAll('app-telemetry-events-panel [role="group"] button')).find(btn =>
      btn.textContent?.includes('Solo TRK-305')
    ) as HTMLButtonElement | undefined;
    soloScopeBtn?.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-telemetry-events-panel .tel-event-card').length).toBe(1);
  });

  it('should open native <m3-dialog> Inspect modal exclusively from Fleet Inspeccionar, export JSON, and restore focus', async () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[id^="trigger-focus-inspect-"]')).toBeNull();
    expect(el.querySelector('#trigger-corridor-inspect')).toBeNull();

    const fleetInspectBtn = el.querySelector('#inspect-trigger-TRK-884 button') as HTMLButtonElement;
    expect(fleetInspectBtn).toBeTruthy();
    fleetInspectBtn.focus();

    fleetInspectBtn.click();
    fixture.detectChanges();

    expect(telemetryService.isInspectModalOpen()).toBe(true);
    expect(telemetryService.activeInspectTrigger()).toBe('inspect-TRK-884');
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    const inspectDialog = el.querySelector('app-telemetry-inspect-modal dialog.m3-dialog.tel-inspect-dialog[open]') as HTMLDialogElement;
    expect(inspectDialog).toBeTruthy();
    expect(inspectDialog.textContent).toContain('Propulsión & Energía');
    expect(inspectDialog.textContent).toContain('Integridad Térmica');

    const exportBtn = Array.from(inspectDialog.querySelectorAll('button')).find(btn =>
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
    expect(document.activeElement).toBe(fleetInspectBtn);

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

  it('should validate native <m3-dialog> Assign Route fields cleanly, reset stale errors on reopen, and update filter counts', () => {
    const el = fixture.nativeElement as HTMLElement;
    telemetryService.selectVehicle('TRK-912');
    fixture.detectChanges();

    const initialCounts = telemetryService.filterCounts();
    component.onAssignRouteClick();
    fixture.detectChanges();

    expect(telemetryService.isAssignModalOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);
    expect(component.assignFormVehicleId).toBe('TRK-912');

    const assignDialog = el.querySelector('app-telemetry-assign-modal dialog.m3-dialog.tel-assign-dialog[open]') as HTMLDialogElement;
    expect(assignDialog).toBeTruthy();

    // Clear destination and submit invalid form
    const destInput = assignDialog.querySelector('#tel-assign-destination') as HTMLInputElement;
    expect(destInput).toBeTruthy();
    destInput.value = '';
    destInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = assignDialog.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).toBeTruthy();
    submitBtn.click();
    fixture.detectChanges();

    expect(telemetryService.isAssignModalOpen()).toBe(true);
    expect(assignDialog.textContent).toContain('El destino final es obligatorio.');

    // Closing and reopening clears stale validation errors
    component.closeAssignModal();
    fixture.detectChanges();
    component.onAssignRouteClick();
    fixture.detectChanges();
    const reopenedDialog = el.querySelector('app-telemetry-assign-modal dialog.m3-dialog.tel-assign-dialog[open]') as HTMLDialogElement;
    expect(reopenedDialog.textContent).not.toContain('El destino final es obligatorio.');

    // Provide valid destination and choose Pharma protocol via connected <m3-button-group>
    const freshDestInput = reopenedDialog.querySelector('#tel-assign-destination') as HTMLInputElement;
    freshDestInput.value = 'Terminal San Bartolo';
    freshDestInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const pharmaBtn = Array.from(reopenedDialog.querySelectorAll('m3-button-group button')).find(
      btn => btn.textContent?.includes('Farma (2-8°C)')
    ) as HTMLButtonElement | undefined;
    expect(pharmaBtn).toBeTruthy();
    pharmaBtn?.click();
    fixture.detectChanges();
    expect(component.assignFormCargoType).toBe('pharma');

    (reopenedDialog.querySelector('button[type="submit"]') as HTMLButtonElement).click();
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

  it('supports < lg split-pane switching via canonical <m3-tabs> keyboard navigation', () => {
    const el = fixture.nativeElement as HTMLElement;
    const fleetTab = el.querySelector('#tel-tab-fleet') as HTMLButtonElement;
    const corridorTab = el.querySelector('#tel-tab-corridor') as HTMLButtonElement;
    const fleetPanel = el.querySelector('#tel-panel-fleet') as HTMLElement;
    const corridorPanel = el.querySelector('#tel-panel-corridor') as HTMLElement;

    expect(fleetTab).toBeTruthy();
    expect(corridorTab).toBeTruthy();
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

  it('expands Corredor Activo into fullscreen geospatial breakdown via single-owner hero-transform Container Transform', async () => {
    const el = fixture.nativeElement as HTMLElement;
    const doc = TestBed.inject(DOCUMENT) as Document & {
      startViewTransition?: (cb?: () => void) => ViewTransition;
    };

    const originalStartVt = doc.startViewTransition;
    const pendingResolvers: Array<() => void> = [];
    const snapshots: Array<{ beforeHero: number; afterHero: number }> = [];

    doc.startViewTransition = vi.fn((cb?: () => void) => {
      const beforeHero = el.querySelectorAll('[style*="view-transition-name: hero-transform"]').length;
      cb?.();
      fixture.detectChanges();
      const afterHero = el.querySelectorAll('[style*="view-transition-name: hero-transform"]').length;
      snapshots.push({ beforeHero, afterHero });
      return {
        finished: new Promise<void>(resolve => pendingResolvers.push(resolve))
      } as unknown as ViewTransition;
    });

    try {
      const corridorSection = el.querySelector('app-telemetry-corridor-panel section') as HTMLElement;
      const expandBtn = el.querySelector('#trigger-corridor-expand button') as HTMLButtonElement;
      expect(corridorSection).toBeTruthy();
      expect(expandBtn).toBeTruthy();
      expandBtn.focus();

      expandBtn.click();
      fixture.detectChanges();

      expect(snapshots[0]).toEqual({ beforeHero: 1, afterHero: 1 });
      expect(corridorSection.classList.contains('invisible')).toBe(true);
      expect(stageOverlay.isOverlayOpen()).toBe(true);

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();

      const theaterDialog = el.querySelector('app-telemetry-corridor-theater-dialog dialog.m3-dialog.m3-dialog-fullscreen[open]') as HTMLDialogElement;
      expect(theaterDialog).toBeTruthy();
      expect(theaterDialog.textContent).toContain('Batería');
      expect(theaterDialog.textContent).toContain('Neumáticos');
      const footerDiagBtn = Array.from(theaterDialog.querySelectorAll('[dialog-actions] button')).find(btn =>
        btn.textContent?.includes('Diagnóstico CAN-BUS')
      );
      expect(footerDiagBtn).toBeUndefined();

      // Clicking a truck inside the fullscreen convoy selector focuses it on the enlarged map
      const convoyTrk912 = Array.from(theaterDialog.querySelectorAll('.tel-theater-convoy-btn')).find(btn =>
        btn.textContent?.includes('TRK-912')
      ) as HTMLButtonElement | undefined;
      expect(convoyTrk912).toBeTruthy();
      convoyTrk912?.click();
      fixture.detectChanges();
      expect(telemetryService.selectedVehicleId()).toBe('TRK-912');

      // Contract returns cleanly via hero-transform and clears origin invisibility
      component.closeCorridorTheater();
      fixture.detectChanges();
      expect(snapshots[1]).toEqual({ beforeHero: 1, afterHero: 1 });

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.isCorridorTheaterOpen()).toBe(false);
      expect(corridorSection.classList.contains('invisible')).toBe(false);
      expect(stageOverlay.isOverlayOpen()).toBe(false);
    } finally {
      doc.startViewTransition = originalStartVt;
    }
  });
});
