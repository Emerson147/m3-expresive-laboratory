import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Vehicle } from '../../../core/telemetry/telemetry.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

@Component({
  selector: 'app-telemetry-focus-card',
  standalone: true,
  imports: [M3LinearProgressComponent, M3ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-label="Telemetría del despacho seleccionado"
      class="bg-surface-low rounded-m3-xl p-5 sm:p-6 space-y-5 shrink-0">

      <!-- Selected Dispatch Identity + Interactive Route Scrubber -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="min-w-0 space-y-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="w-9 h-9 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">waves</span>
            </span>
            <h2 class="text-title-md-emphasized text-main">
              Telemetría de Progreso del Despacho
            </h2>
            <span class="text-label-md-emphasized font-mono tabular-nums px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box">
              {{ vehicle().id }}
            </span>
          </div>

          <p class="text-body-sm text-muted truncate">
            {{ vehicle().origin }} &rarr; {{ vehicle().destination }} • Operador: {{ vehicle().driver }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div class="flex items-center gap-2.5 bg-surface px-3.5 py-2 rounded-m3-full">
            <label for="tel-dispatch-progress-slider" class="text-label-md text-muted font-mono">
              Avance:
            </label>
            <input
              id="tel-dispatch-progress-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              [value]="vehicle().progressPercent"
              (input)="onProgressInput($event)"
              [style.--tel-range-progress.%]="vehicle().progressPercent"
              aria-label="Ajustar progreso de entrega del despacho seleccionado"
              class="tel-range-input w-24 sm:w-32" />
            <span class="text-label-lg-emphasized font-mono tabular-nums text-main w-12 text-right">
              {{ vehicle().progressPercent }}%
            </span>
          </div>

          <m3-button
            [id]="'trigger-focus-inspect-' + vehicle().id"
            variant="tonal"
            size="sm"
            icon="sensors"
            [morph]="true"
            [invisible]="isInspectModalOpen() && activeInspectTrigger() === ('focus-inspect-' + vehicle().id)"
            [viewTransitionName]="!isInspectModalOpen() && activeInspectTrigger() === ('focus-inspect-' + vehicle().id) ? 'dialog-transform' : null"
            (action)="inspect.emit(vehicle())">
            CAN-BUS
          </m3-button>
        </div>
      </div>

      <!-- Canonical Living Wavy Dispatch Indicator (only active rAF loop in main pane) -->
      <div class="py-1.5">
        <m3-linear-progress
          [value]="vehicle().progressPercent"
          [wavy]="true"
          [paused]="!isLiveTelemetryActive()"
          size="lg"
          color="primary"
          [ariaLabel]="'Progreso de entrega de ' + vehicle().id" />
      </div>

      <!-- Real Live CAN-BUS Sensor Readings -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="px-3.5 py-3 rounded-m3-lg bg-surface space-y-0.5">
          <span class="text-label-sm text-muted block">Motor</span>
          <span class="text-title-sm-emphasized font-mono tabular-nums text-main">
            {{ vehicle().telemetry.engineRpm }} RPM
          </span>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface space-y-0.5">
          <span class="text-label-sm text-muted block">Combustible</span>
          <span class="text-title-sm-emphasized font-mono tabular-nums text-main">
            {{ vehicle().telemetry.fuelLevelPercent }}%
          </span>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface space-y-0.5">
          <span class="text-label-sm text-muted block">Batería</span>
          <span class="text-title-sm-emphasized font-mono tabular-nums text-main">
            {{ vehicle().telemetry.batteryVolts }} V
          </span>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface space-y-0.5">
          <span class="text-label-sm text-muted block">Neumáticos</span>
          <span class="text-title-sm-emphasized font-mono tabular-nums text-main">
            {{ vehicle().telemetry.tirePressurePsi }} PSI
          </span>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface space-y-0.5">
          <span class="text-label-sm text-muted block">Carga Térmica</span>
          <span
            class="text-title-sm-emphasized font-mono tabular-nums"
            [class]="vehicle().telemetry.cargoTempC < 0 ? 'text-tertiary' : 'text-main'">
            {{ vehicle().telemetry.cargoTempC }}°C
          </span>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface space-y-0.5">
          <span class="text-label-sm text-muted block">ETA Estimado</span>
          <span class="text-title-sm-emphasized font-mono tabular-nums text-primary">
            {{ vehicle().etaMinutes }} min
          </span>
        </div>
      </div>
    </section>
  `
})
export class TelemetryFocusCardComponent {
  readonly vehicle = input.required<Vehicle>();
  readonly isLiveTelemetryActive = input.required<boolean>();
  readonly activeInspectTrigger = input<string | null>(null);
  readonly isInspectModalOpen = input<boolean>(false);

  readonly progressChange = output<number>();
  readonly inspect = output<Vehicle>();

  onProgressInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.progressChange.emit(val);
  }
}
