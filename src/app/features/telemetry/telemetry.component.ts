import { NgTemplateOutlet } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { Vehicle } from '../../core/telemetry/telemetry.models';
import { TelemetryService } from '../../core/telemetry/telemetry.service';
import { ThemeService } from '../../core/theme/theme.service';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TabItem, M3TabsComponent } from '../../shared/components/tabs/tabs.component';
import {
  TelemetryAssignModalComponent,
  TelemetryCargoProtocol
} from './components/telemetry-assign-modal.component';
import { TelemetryCorridorPanelComponent } from './components/telemetry-corridor-panel.component';
import { TelemetryCorridorTheaterDialogComponent } from './components/telemetry-corridor-theater-dialog.component';
import { TelemetryEventsPanelComponent } from './components/telemetry-events-panel.component';
import { TELEMETRY_EXPRESSIVE_STYLES } from './components/telemetry-expressive.styles';
import { TelemetryFleetPanelComponent } from './components/telemetry-fleet-panel.component';
import { TelemetryFocusCardComponent } from './components/telemetry-focus-card.component';
import { TelemetryHeaderComponent } from './components/telemetry-header.component';
import { TelemetryInspectModalComponent } from './components/telemetry-inspect-modal.component';
import { TelemetryKpiStripComponent } from './components/telemetry-kpi-strip.component';

@Component({
  selector: 'app-telemetry',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    M3SnackbarComponent,
    M3TabsComponent,
    TelemetryHeaderComponent,
    TelemetryKpiStripComponent,
    TelemetryFocusCardComponent,
    TelemetryFleetPanelComponent,
    TelemetryCorridorPanelComponent,
    TelemetryCorridorTheaterDialogComponent,
    TelemetryEventsPanelComponent,
    TelemetryInspectModalComponent,
    TelemetryAssignModalComponent
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [TELEMETRY_EXPRESSIVE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface text-main select-none'
  },
  template: `
    <div
      [class]="adaptiveLayout.isCompact()
        ? 'tel-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 gap-4 m3-scrollbar'
        : 'tel-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-16 gap-5 lg:gap-6 m3-scrollbar'">

      <!-- 1. Mission Control Command Rail -->
      <app-telemetry-header
        [currentHue]="themeService.currentHue()"
        [isDarkMode]="themeService.isDarkMode()"
        [themes]="themeService.themes"
        [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
        [refreshIntervalSeconds]="telemetryService.refreshIntervalSeconds"
        [isAssignOriginActive]="telemetryService.assignMorphOwner() === 'trigger'"
        [isAssignOriginInvisible]="telemetryService.isAssignModalOpen() && telemetryService.activeAssignTrigger() === 'assign-route'"
        (hueChange)="onHueChange($event)"
        (toggleTheme)="themeService.toggleThemeMode($event)"
        (toggleLiveTelemetry)="telemetryService.toggleLiveTelemetry()"
        (assignRoute)="onAssignRouteClick()" />

      <!-- 2. Analytical Mission Control KPI Strip -->
      <app-telemetry-kpi-strip [kpi]="telemetryService.kpiSummary()" />

      <!-- 3. Split-Pane View Switcher (< lg): Canonical M3 Secondary Tabs -->
      <div class="lg:hidden shrink-0 rounded-m3-lg overflow-hidden bg-surface">
        <m3-tabs
          variant="secondary"
          idPrefix="tel-tab"
          ariaLabel="Secciones de telemetría operativa"
          [tabs]="mobileTabs()"
          [value]="mobilePane()"
          (tabChange)="onMobileTabChange($event)" />
      </div>

      <!-- 4. Rebalanced 2-Band Mission Control Bento ([7 Focus + 5 Corridor] over [8 Fleet + 4 Events]) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        <div
          id="tel-panel-fleet"
          [class]="(mobilePane() === 'fleet' ? 'flex' : 'hidden') + ' lg:contents flex-col gap-5 min-w-0'">
          <app-telemetry-focus-card
            class="lg:order-1 lg:col-span-7"
            [vehicle]="telemetryService.selectedVehicle()"
            [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
            [pauseWavy]="hasAnyModalOpen() || corridorMorphOwner() !== null || telemetryService.isModalTransitioning()"
            (progressChange)="onProgressManualChange($event)" />

          <app-telemetry-fleet-panel
            class="lg:order-3 lg:col-span-8 lg:self-start"
            [vehicles]="telemetryService.filteredVehicles()"
            [selectedVehicleId]="telemetryService.selectedVehicleId()"
            [currentFilter]="telemetryService.currentFilter()"
            [filterCounts]="telemetryService.filterCounts()"
            [isFleetFlipActive]="telemetryService.isFleetFlipActive()"
            [activeInspectTrigger]="telemetryService.activeInspectTrigger()"
            [isInspectModalOpen]="telemetryService.isInspectModalOpen()"
            [inspectMorphOwner]="telemetryService.inspectMorphOwner()"
            (filterChange)="telemetryService.setFilter($event)"
            (selectVehicle)="telemetryService.selectVehicle($event)"
            (inspectVehicle)="onInspectVehicle($event, 'inspect-' + $event.id)" />
        </div>

        <div
          id="tel-panel-corridor"
          [class]="(mobilePane() === 'corridor' ? 'flex' : 'hidden') + ' lg:contents flex-col gap-5 min-w-0'">
          <app-telemetry-corridor-panel
            class="lg:order-2 lg:col-span-5"
            [corridorSummary]="telemetryService.activeCorridorSummary()"
            [markers]="telemetryService.corridorMarkers()"
            [waypoints]="telemetryService.waypoints()"
            [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
            [isHiddenForMorph]="isCorridorTheaterOpen()"
            [heroViewTransitionName]="corridorMorphOwner() === 'card' ? 'hero-transform' : null"
            (selectVehicle)="telemetryService.selectVehicle($event)"
            (expandCorridor)="openCorridorTheater()" />

          <app-telemetry-events-panel
            class="lg:order-4 lg:col-span-4 lg:self-start"
            [events]="telemetryService.liveEvents()"
            [selectedVehicleId]="telemetryService.selectedVehicleId()"
            [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
            (selectVehicle)="telemetryService.selectVehicle($event)" />
        </div>
      </div>
    </div>

    <!-- Transient Toast Notification (Top-Layer Popover / Fallback) -->
    <m3-snackbar
      [open]="telemetryService.toastMessage() !== null"
      [message]="telemetryService.toastMessage() ?? ''"
      [durationMs]="4000"
      (dismissed)="telemetryService.dismissToast()" />

    <!-- External Portal Template (Renders Outside #app-stage When Hosted in App Root) -->
    <ng-template #telemetryModalsTemplate>
      <app-telemetry-corridor-theater-dialog
        [open]="isCorridorTheaterOpen()"
        [viewTransitionName]="corridorMorphOwner() === 'theater' ? 'hero-transform' : null"
        [corridorSummary]="telemetryService.activeCorridorSummary()"
        [selectedVehicle]="telemetryService.selectedVehicle()"
        [vehicles]="telemetryService.vehicles()"
        [markers]="telemetryService.corridorMarkers()"
        [waypoints]="telemetryService.waypoints()"
        [events]="telemetryService.liveEvents()"
        [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
        (selectVehicle)="telemetryService.selectVehicle($event)"
        (closeRequested)="closeCorridorTheater()" />

      <app-telemetry-inspect-modal
        [open]="telemetryService.isInspectModalOpen()"
        [vehicle]="telemetryService.inspectedVehicle() ?? telemetryService.selectedVehicle()"
        [events]="telemetryService.liveEvents()"
        [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
        [viewTransitionName]="telemetryService.inspectMorphOwner() === 'modal' ? 'dialog-transform' : null"
        (close)="closeInspectModal()"
        (exportTelemetry)="onExportTelemetry($event)" />

      <app-telemetry-assign-modal
        [open]="telemetryService.isAssignModalOpen()"
        [vehicles]="telemetryService.vehicles()"
        [(vehicleId)]="assignFormVehicleId"
        [(corridor)]="assignFormCorridor"
        [(destination)]="assignFormDestination"
        [(driver)]="assignFormDriver"
        [(cargoType)]="assignFormCargoType"
        [viewTransitionName]="telemetryService.assignMorphOwner() === 'modal' ? 'dialog-transform' : null"
        (close)="closeAssignModal()"
        (submitRoute)="onSubmitAssignRoute()" />
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="telemetryModalsTemplate" />
    }
  `
})
export class TelemetryComponent {
  readonly telemetryService = inject(TelemetryService);
  readonly themeService = inject(ThemeService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);
  readonly stageOverlay = inject(StageOverlayService);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly telemetryModalsTemplate = viewChild<TemplateRef<unknown>>('telemetryModalsTemplate');

  private returnFocusEl: HTMLElement | null = null;
  private wasModalOpen = false;

  readonly mobilePane = signal<'fleet' | 'corridor'>('fleet');
  readonly isCorridorTheaterOpen = signal<boolean>(false);
  readonly corridorMorphOwner = signal<'card' | 'theater' | null>(null);

  readonly mobileTabs = computed<M3TabItem[]>(() => [
    {
      id: 'fleet',
      label: 'Flota & Unidad',
      icon: 'local_shipping',
      badge: this.telemetryService.filteredVehicles().length,
      panelId: 'tel-panel-fleet'
    },
    {
      id: 'corridor',
      label: 'Corredor & Alertas',
      icon: 'route',
      badge: this.telemetryService.liveEvents().length,
      panelId: 'tel-panel-corridor'
    }
  ]);

  private readonly _assignFormVehicleId = signal<string>('TRK-884');
  private readonly _assignFormCorridor = signal<string>('Corredor Panamericana Sur');
  private readonly _assignFormDestination = signal<string>('CD Callao Muelle Sur');
  private readonly _assignFormDriver = signal<string>('Lucía Paredes');
  private readonly _assignFormCargoType = signal<TelemetryCargoProtocol>('cold_chain');

  get assignFormVehicleId(): string {
    return this._assignFormVehicleId();
  }
  set assignFormVehicleId(value: string) {
    this._assignFormVehicleId.set(value);
  }

  get assignFormCorridor(): string {
    return this._assignFormCorridor();
  }
  set assignFormCorridor(value: string) {
    this._assignFormCorridor.set(value);
  }

  get assignFormDestination(): string {
    return this._assignFormDestination();
  }
  set assignFormDestination(value: string) {
    this._assignFormDestination.set(value);
  }

  get assignFormDriver(): string {
    return this._assignFormDriver();
  }
  set assignFormDriver(value: string) {
    this._assignFormDriver.set(value);
  }

  get assignFormCargoType(): TelemetryCargoProtocol {
    return this._assignFormCargoType();
  }
  set assignFormCargoType(value: TelemetryCargoProtocol) {
    this._assignFormCargoType.set(value);
  }

  readonly hasAnyModalOpen = computed(
    () =>
      this.telemetryService.isInspectModalOpen() ||
      this.telemetryService.isAssignModalOpen() ||
      this.isCorridorTheaterOpen()
  );

  constructor() {
    effect(() => {
      const tpl = this.telemetryModalsTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    effect(() => {
      const open = this.hasAnyModalOpen();
      const transitioning = this.corridorMorphOwner() !== null || this.telemetryService.isModalTransitioning();
      this.stageOverlay.setOverlayOpen(open);
      if (open) {
        if (!this.wasModalOpen && !this.returnFocusEl) {
          this.captureReturnFocus();
        }
        this.wasModalOpen = true;
      } else if (this.wasModalOpen && !transitioning) {
        this.wasModalOpen = false;
        this.restoreFocusIfIdle();
      }
    });

    this.destroyRef.onDestroy(() => {
      const tpl = this.telemetryModalsTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event?: Event): void {
    if (this.isCorridorTheaterOpen()) {
      event?.preventDefault();
      this.closeCorridorTheater();
    } else if (this.telemetryService.isInspectModalOpen()) {
      event?.preventDefault();
      this.closeInspectModal();
    } else if (this.telemetryService.isAssignModalOpen()) {
      event?.preventDefault();
      this.closeAssignModal();
    } else if (this.telemetryService.toastMessage()) {
      this.telemetryService.dismissToast();
    }
  }

  onMobileTabChange(tabId: string): void {
    if (tabId === 'fleet' || tabId === 'corridor') {
      this.mobilePane.set(tabId);
    }
  }

  onHueChange(hue: number): void {
    this.themeService.setThemeHue(Number(hue));
  }

  onProgressManualChange(val: number): void {
    const sel = this.telemetryService.selectedVehicle();
    if (!sel) return;
    this.telemetryService.setVehicleProgress(sel.id, Number(val));
  }

  openCorridorTheater(): void {
    if (this.hasAnyModalOpen() || this.corridorMorphOwner() !== null) return;

    this.captureReturnFocus();
    this.corridorMorphOwner.set('card');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isCorridorTheaterOpen.set(true);
        this.stageOverlay.setOverlayOpen(true);
        this.corridorMorphOwner.set('theater');
      },
      () => {
        this.corridorMorphOwner.set(null);
      },
      { rootClass: 'vt-hero' }
    );
  }

  closeCorridorTheater(): void {
    if (!this.isCorridorTheaterOpen()) return;

    this.corridorMorphOwner.set('theater');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isCorridorTheaterOpen.set(false);
        this.stageOverlay.setOverlayOpen(this.telemetryService.isInspectModalOpen() || this.telemetryService.isAssignModalOpen());
        this.corridorMorphOwner.set('card');
      },
      () => {
        this.corridorMorphOwner.set(null);
        this.restoreFocusIfIdle();
      },
      { isExiting: true, rootClass: 'vt-hero' }
    );
  }

  onInspectVehicle(vehicle: Vehicle, triggerId: string): void {
    this.captureReturnFocus();
    this.telemetryService.openInspectModal(vehicle, triggerId);
  }

  closeInspectModal(): void {
    if (!this.telemetryService.isInspectModalOpen()) return;
    this.telemetryService.closeInspectModal();
  }

  onExportTelemetry(vehicle: Vehicle): void {
    this.telemetryService.exportVehicleTelemetry(vehicle);
    this.closeInspectModal();
  }

  onAssignRouteClick(): void {
    this.captureReturnFocus();
    const sel = this.telemetryService.selectedVehicle();
    if (sel) {
      this.assignFormVehicleId = sel.id;
      this.assignFormCorridor = sel.corridor;
      this.assignFormDestination = sel.destination;
      this.assignFormDriver = sel.driver;
      this.assignFormCargoType = sel.cargoTempC < 0 ? 'cold_chain' : 'dry';
    }
    this.telemetryService.openAssignModal('assign-route');
  }

  closeAssignModal(): void {
    if (!this.telemetryService.isAssignModalOpen()) return;
    this.telemetryService.closeAssignModal();
  }

  onSubmitAssignRoute(): void {
    const cargoLabel =
      this.assignFormCargoType === 'cold_chain'
        ? 'Cadena de Frío (-18°C)'
        : this.assignFormCargoType === 'pharma'
          ? 'Insumos Médicos (2-8°C)'
          : 'Carga Seca General';

    this.telemetryService.assignNewRoute({
      vehicleId: this.assignFormVehicleId,
      corridor: this.assignFormCorridor,
      destination: this.assignFormDestination.trim(),
      driver: this.assignFormDriver.trim(),
      cargoType: cargoLabel
    });
  }

  private captureReturnFocus(): void {
    if (!this.hasAnyModalOpen() && typeof document !== 'undefined') {
      const active = document.activeElement;
      this.returnFocusEl = active instanceof HTMLElement ? active : null;
    }
  }

  private restoreFocusIfIdle(): void {
    if (this.hasAnyModalOpen() || !this.returnFocusEl) return;
    const target = this.returnFocusEl;
    this.returnFocusEl = null;
    queueMicrotask(() => {
      if (!this.hasAnyModalOpen() && target.isConnected) {
        target.focus();
      }
    });
  }
}
