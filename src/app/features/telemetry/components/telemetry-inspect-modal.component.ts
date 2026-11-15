import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import { LiveTelemetryEvent, Vehicle, VehicleStatus } from '../../../core/telemetry/telemetry.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

@Component({
  selector: 'app-telemetry-inspect-modal',
  standalone: true,
  imports: [M3ButtonComponent, M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
      class="fixed inset-0 z-40 bg-scrim cursor-pointer"></div>

    <div
      id="telemetry-inspect-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tel-inspect-title"
      [style.view-transition-name]="isDialogTransitionActive() ? 'dialog-transform' : null"
      [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
      [class.shadow-m3-level3]="!isDialogTransitionActive()"
      class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-2xl h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box">

      <!-- Fixed Tonal Modal Header (Divider-Free) -->
      <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
        <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-2xl" aria-hidden="true">sensors</span>
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-0.5">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized font-mono tabular-nums">
                  {{ vehicle().id }}
                </span>
                <span
                  [class]="statusBadgeClass()"
                  class="px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized">
                  {{ statusLabel() }}
                </span>
              </div>

              <h2
                #modalHeading
                id="tel-inspect-title"
                tabindex="-1"
                class="text-title-lg-emphasized text-main outline-none leading-tight">
                Diagnóstico CAN-BUS
              </h2>

              <p class="text-body-sm text-muted truncate mt-0.5">
                Placa {{ vehicle().plate }} • Operador: {{ vehicle().driver }} • {{ vehicle().corridor }}
              </p>
            </div>
          </div>

          <m3-button
            [iconOnly]="true"
            variant="text"
            size="sm"
            icon="close"
            ariaLabel="Cerrar diagnóstico CAN-BUS"
            (action)="close.emit()" />
        </header>
      </div>

      <!-- Inner Scrollable Body (Preserves Outer 28px Corner Radii) -->
      <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar px-5 sm:px-6 py-2 space-y-5">
        <!-- Dispatch Wave Progress Summary -->
        <section aria-label="Resumen de despacho de unidad" class="p-4 rounded-m3-xl bg-surface space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-2 text-label-md font-mono tabular-nums">
            <span class="text-muted font-sans">
              {{ vehicle().origin }} &rarr; {{ vehicle().destination }}
            </span>
            <span class="font-bold text-main">
              {{ vehicle().progressPercent }}% • ETA {{ vehicle().etaMinutes }}m
            </span>
          </div>

          <m3-linear-progress
            [value]="vehicle().progressPercent"
            [wavy]="true"
            [paused]="!isLiveTelemetryActive()"
            size="md"
            color="primary"
            [ariaLabel]="'Progreso de despacho de ' + vehicle().id" />

          <div class="flex items-center justify-between text-label-sm font-mono tabular-nums text-muted pt-0.5">
            <span>Velocidad actual: {{ vehicle().speedKmh }} km/h</span>
            <span>Último ping: {{ vehicle().lastPingTime }}</span>
          </div>
        </section>

        <!-- 6 Live CAN-BUS Sensor Tiles -->
        <section aria-label="Lecturas de sensores CAN-BUS" class="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono tabular-nums">
          <div class="p-3.5 rounded-m3-lg bg-surface space-y-1">
            <span class="text-label-sm text-muted block font-sans">Régimen Motor</span>
            <span class="text-title-md-emphasized text-main">{{ vehicle().telemetry.engineRpm }} RPM</span>
          </div>

          <div class="p-3.5 rounded-m3-lg bg-surface space-y-1">
            <span class="text-label-sm text-muted block font-sans">Nivel Combustible</span>
            <span class="text-title-md-emphasized text-main">{{ vehicle().telemetry.fuelLevelPercent }}%</span>
          </div>

          <div class="p-3.5 rounded-m3-lg bg-surface space-y-1">
            <span class="text-label-sm text-muted block font-sans">Voltaje Batería</span>
            <span class="text-title-md-emphasized text-main">{{ vehicle().telemetry.batteryVolts }} V</span>
          </div>

          <div class="p-3.5 rounded-m3-lg bg-surface space-y-1">
            <span class="text-label-sm text-muted block font-sans">Presión Neumáticos</span>
            <span class="text-title-md-emphasized text-main">{{ vehicle().telemetry.tirePressurePsi }} PSI</span>
          </div>

          <div class="p-3.5 rounded-m3-lg bg-surface space-y-1">
            <span class="text-label-sm text-muted block font-sans">Temp. Cabina</span>
            <span class="text-title-md-emphasized text-main">{{ vehicle().telemetry.cabinTempC }}°C</span>
          </div>

          <div class="p-3.5 rounded-m3-lg bg-surface space-y-1">
            <span class="text-label-sm text-muted block font-sans">Temp. Carga</span>
            <span
              class="text-title-md-emphasized"
              [class]="vehicle().telemetry.cargoTempC < 0 ? 'text-tertiary' : 'text-main'">
              {{ vehicle().telemetry.cargoTempC }}°C
            </span>
          </div>
        </section>

        <!-- Unit Timeline Context -->
        @if (unitEvents().length > 0) {
          <section aria-label="Últimos eventos de la unidad" class="space-y-2.5">
            <h3 class="text-label-md-emphasized uppercase tracking-wider text-muted px-0.5">
              Bitácora Reciente ({{ vehicle().id }})
            </h3>
            <ul class="list-none m-0 p-0 space-y-2">
              @for (evt of unitEvents(); track evt.id) {
                <li class="p-3 rounded-m3-lg bg-surface flex items-start justify-between gap-3">
                  <span class="text-body-sm text-main leading-snug">{{ evt.message }}</span>
                  <time class="text-label-sm font-mono tabular-nums text-muted shrink-0">{{ evt.timestamp }}</time>
                </li>
              }
            </ul>
          </section>
        }
      </div>

      <!-- Fixed Divider-Free Action Footer -->
      <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
        <m3-button variant="text" (action)="close.emit()">
          Cerrar
        </m3-button>
        <m3-button variant="filled" icon="download" (action)="exportTelemetry.emit(vehicle())">
          Exportar Telemetría
        </m3-button>
      </footer>
    </div>
  `
})
export class TelemetryInspectModalComponent {
  readonly stageOverlay = inject(StageOverlayService);

  readonly vehicle = input.required<Vehicle>();
  readonly events = input<LiveTelemetryEvent[]>([]);
  readonly isLiveTelemetryActive = input.required<boolean>();
  readonly isDialogTransitionActive = input<boolean>(false);

  readonly close = output<void>();
  readonly exportTelemetry = output<Vehicle>();

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly unitEvents = computed(() => {
    const targetId = this.vehicle().id;
    return this.events().filter(evt => evt.vehicleId === targetId).slice(0, 4);
  });

  readonly statusBadgeClass = computed(() => {
    const status: VehicleStatus = this.vehicle().status;
    switch (status) {
      case 'optimal':
      case 'in_transit':
        return 'bg-success-box text-on-success-box';
      case 'delayed':
      case 'cold_chain_warning':
        return 'bg-warning-box text-on-warning-box';
      case 'critical':
        return 'bg-error-box text-on-error-box';
      default:
        return 'bg-surface-high text-main';
    }
  });

  readonly statusLabel = computed(() => {
    switch (this.vehicle().status) {
      case 'optimal':
        return 'Óptimo';
      case 'in_transit':
        return 'En Ruta';
      case 'delayed':
        return 'Riesgo SLA';
      case 'critical':
        return 'Crítico';
      case 'cold_chain_warning':
        return 'Alerta Térmica';
      default:
        return 'En Ruta';
    }
  });

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });
  }
}
