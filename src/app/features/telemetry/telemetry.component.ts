import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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
import {
  TelemetryAssignModalComponent,
  TelemetryCargoProtocol
} from './components/telemetry-assign-modal.component';
import { TelemetryCorridorPanelComponent } from './components/telemetry-corridor-panel.component';
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
    TelemetryHeaderComponent,
    TelemetryKpiStripComponent,
    TelemetryFocusCardComponent,
    TelemetryFleetPanelComponent,
    TelemetryCorridorPanelComponent,
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
        ? 'tel-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 space-y-5 m3-scrollbar'
        : 'tel-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-20 space-y-5 lg:space-y-6 m3-scrollbar'">

      <!-- 1. Mission Control Command Rail -->
      <app-telemetry-header
        [currentHue]="themeService.currentHue()"
        [isDarkMode]="themeService.isDarkMode()"
        [themes]="themeService.themes"
        [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
        [refreshIntervalSeconds]="telemetryService.refreshIntervalSeconds"
        [isAssignOriginActive]="!telemetryService.isAssignModalOpen() && telemetryService.activeAssignTrigger() === 'assign-route'"
        [isAssignOriginInvisible]="telemetryService.isAssignModalOpen() && telemetryService.activeAssignTrigger() === 'assign-route'"
        (hueChange)="onHueChange($event)"
        (toggleTheme)="themeService.toggleThemeMode($event)"
        (toggleLiveTelemetry)="telemetryService.toggleLiveTelemetry()"
        (assignRoute)="onAssignRouteClick()" />

      <!-- 2. Analytical Mission Control KPI Strip -->
      <app-telemetry-kpi-strip [kpi]="telemetryService.kpiSummary()" />

      <!-- 3. Split-Pane View Switcher (< lg) -->
      <div
        role="tablist"
        aria-label="Secciones de telemetría operativa"
        class="lg:hidden grid grid-cols-2 gap-1 p-1.5 rounded-m3-full bg-surface-low shadow-m3-level1 shrink-0">
        <button
          #fleetTabBtn
          type="button"
          role="tab"
          id="tel-tab-fleet"
          aria-controls="tel-panel-fleet"
          [attr.aria-selected]="mobilePane() === 'fleet'"
          [attr.tabindex]="mobilePane() === 'fleet' ? 0 : -1"
          (click)="mobilePane.set('fleet')"
          (keydown)="onMobileTabKeydown($event, 'fleet')"
          class="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-m3-full text-label-lg-emphasized cursor-pointer m3-transition-fast focus-ring-m3"
          [class.bg-primary]="mobilePane() === 'fleet'"
          [class.text-on-primary]="mobilePane() === 'fleet'"
          [class.shadow-m3-level1]="mobilePane() === 'fleet'"
          [class.text-muted]="mobilePane() !== 'fleet'"
          [class.hover:text-main]="mobilePane() !== 'fleet'"
          [class.hover:bg-surface-high]="mobilePane() !== 'fleet'">
          <span class="material-symbols-rounded text-lg" aria-hidden="true">local_shipping</span>
          <span class="truncate">Flota &amp; Unidad</span>
          <span class="text-label-sm font-mono tabular-nums opacity-85">
            ({{ telemetryService.filteredVehicles().length }})
          </span>
        </button>

        <button
          #corridorTabBtn
          type="button"
          role="tab"
          id="tel-tab-corridor"
          aria-controls="tel-panel-corridor"
          [attr.aria-selected]="mobilePane() === 'corridor'"
          [attr.tabindex]="mobilePane() === 'corridor' ? 0 : -1"
          (click)="mobilePane.set('corridor')"
          (keydown)="onMobileTabKeydown($event, 'corridor')"
          class="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-m3-full text-label-lg-emphasized cursor-pointer m3-transition-fast focus-ring-m3"
          [class.bg-primary]="mobilePane() === 'corridor'"
          [class.text-on-primary]="mobilePane() === 'corridor'"
          [class.shadow-m3-level1]="mobilePane() === 'corridor'"
          [class.text-muted]="mobilePane() !== 'corridor'"
          [class.hover:text-main]="mobilePane() !== 'corridor'"
          [class.hover:bg-surface-high]="mobilePane() !== 'corridor'">
          <span class="material-symbols-rounded text-lg" aria-hidden="true">route</span>
          <span class="truncate">Corredor &amp; Alertas</span>
          <span class="text-label-sm font-mono tabular-nums opacity-85">
            ({{ telemetryService.liveEvents().length }})
          </span>
        </button>
      </div>

      <!-- 4. Airy Asymmetric Mission Control Bento (8/4 Split Panes) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div
          id="tel-panel-fleet"
          [class]="(mobilePane() === 'fleet' ? 'flex' : 'hidden') + ' lg:flex flex-col gap-5 lg:gap-6 lg:col-span-8 min-w-0'">
          <app-telemetry-focus-card
            [vehicle]="telemetryService.selectedVehicle()"
            [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
            [activeInspectTrigger]="telemetryService.activeInspectTrigger()"
            [isInspectModalOpen]="telemetryService.isInspectModalOpen()"
            (progressChange)="onProgressManualChange($event)"
            (inspect)="onInspectVehicle($event, 'focus-inspect-' + $event.id)" />

          <app-telemetry-fleet-panel
            [vehicles]="telemetryService.filteredVehicles()"
            [selectedVehicleId]="telemetryService.selectedVehicleId()"
            [currentFilter]="telemetryService.currentFilter()"
            [filterCounts]="telemetryService.filterCounts()"
            [isFleetFlipActive]="telemetryService.isFleetFlipActive()"
            [activeInspectTrigger]="telemetryService.activeInspectTrigger()"
            [isInspectModalOpen]="telemetryService.isInspectModalOpen()"
            (filterChange)="telemetryService.setFilter($event)"
            (selectVehicle)="telemetryService.selectVehicle($event)"
            (inspectVehicle)="onInspectVehicle($event, 'inspect-' + $event.id)" />
        </div>

        <div
          id="tel-panel-corridor"
          [class]="(mobilePane() === 'corridor' ? 'flex' : 'hidden') + ' lg:flex flex-col lg:col-span-4 min-w-0'">
          <app-telemetry-corridor-panel
            [corridorSummary]="telemetryService.activeCorridorSummary()"
            [markers]="telemetryService.corridorMarkers()"
            [events]="telemetryService.liveEvents()"
            [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
            [isInspectModalOpen]="telemetryService.isInspectModalOpen()"
            [activeInspectTrigger]="telemetryService.activeInspectTrigger()"
            (selectVehicle)="telemetryService.selectVehicle($event)"
            (inspectCorridor)="onInspectCorridorClick()" />
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
      @if (telemetryService.isInspectModalOpen() && telemetryService.inspectedVehicle(); as inspected) {
        <app-telemetry-inspect-modal
          [vehicle]="inspected"
          [events]="telemetryService.liveEvents()"
          [isLiveTelemetryActive]="telemetryService.isLiveTelemetryActive()"
          [isDialogTransitionActive]="telemetryService.isModalTransitioning()"
          (close)="closeInspectModal()"
          (exportTelemetry)="onExportTelemetry($event)" />
      }

      @if (telemetryService.isAssignModalOpen()) {
        <app-telemetry-assign-modal
          [vehicles]="telemetryService.vehicles()"
          [(vehicleId)]="assignFormVehicleId"
          [(corridor)]="assignFormCorridor"
          [(destination)]="assignFormDestination"
          [(driver)]="assignFormDriver"
          [(cargoType)]="assignFormCargoType"
          [isDialogTransitionActive]="telemetryService.isModalTransitioning()"
          (close)="closeAssignModal()"
          (submitRoute)="onSubmitAssignRoute()" />
      }
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
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly telemetryModalsTemplate = viewChild<TemplateRef<unknown>>('telemetryModalsTemplate');
  private readonly fleetTabBtn = viewChild<ElementRef<HTMLButtonElement>>('fleetTabBtn');
  private readonly corridorTabBtn = viewChild<ElementRef<HTMLButtonElement>>('corridorTabBtn');

  private returnFocusEl: HTMLElement | null = null;
  private wasModalOpen = false;

  readonly mobilePane = signal<'fleet' | 'corridor'>('fleet');

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
    () => this.telemetryService.isInspectModalOpen() || this.telemetryService.isAssignModalOpen()
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
      this.stageOverlay.setOverlayOpen(open);
      if (open) {
        if (!this.wasModalOpen && !this.returnFocusEl) {
          this.captureReturnFocus();
        }
        this.wasModalOpen = true;
      } else if (this.wasModalOpen) {
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
    if (this.telemetryService.isInspectModalOpen()) {
      event?.preventDefault();
      this.closeInspectModal();
    } else if (this.telemetryService.isAssignModalOpen()) {
      event?.preventDefault();
      this.closeAssignModal();
    } else if (this.telemetryService.toastMessage()) {
      this.telemetryService.dismissToast();
    }
  }

  onMobileTabKeydown(event: KeyboardEvent, currentPane: 'fleet' | 'corridor'): void {
    let nextPane: 'fleet' | 'corridor' | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      nextPane = currentPane === 'fleet' ? 'corridor' : 'fleet';
    } else if (event.key === 'Home') {
      nextPane = 'fleet';
    } else if (event.key === 'End') {
      nextPane = 'corridor';
    }
    if (!nextPane) return;

    event.preventDefault();
    this.mobilePane.set(nextPane);
    queueMicrotask(() => {
      const targetBtn =
        nextPane === 'fleet' ? this.fleetTabBtn()?.nativeElement : this.corridorTabBtn()?.nativeElement;
      targetBtn?.focus();
    });
  }

  onHueChange(hue: number): void {
    this.themeService.setThemeHue(Number(hue));
  }

  onProgressManualChange(val: number): void {
    const sel = this.telemetryService.selectedVehicle();
    if (!sel) return;
    this.telemetryService.setVehicleProgress(sel.id, Number(val));
  }

  onInspectVehicle(vehicle: Vehicle, triggerId: string): void {
    this.captureReturnFocus();
    this.telemetryService.openInspectModal(vehicle, triggerId);
  }

  onInspectCorridorClick(): void {
    this.captureReturnFocus();
    this.telemetryService.openInspectModal(this.telemetryService.selectedVehicle(), 'corridor-inspect');
  }

  closeInspectModal(): void {
    this.telemetryService.closeInspectModal();
  }

  onExportTelemetry(vehicle: Vehicle): void {
    this.telemetryService.exportVehicleTelemetry(vehicle);
    this.telemetryService.closeInspectModal();
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
