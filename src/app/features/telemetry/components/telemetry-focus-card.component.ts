import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Vehicle } from '../../../core/telemetry/telemetry.models';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { M3SliderComponent } from '../../../shared/components/slider/slider.component';

@Component({
  selector: 'app-telemetry-focus-card',
  standalone: true,
  imports: [M3LinearProgressComponent, M3SliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full min-w-0'
  },
  template: `
    <section
      aria-label="Telemetría del despacho seleccionado"
      class="bg-surface-low rounded-m3-xl p-5 sm:p-6 flex flex-col justify-between gap-5 h-full">

      <!-- Selected Dispatch Identity + Canonical M3 Interactive Route Scrubber -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="min-w-0 space-y-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="w-9 h-9 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">waves</span>
            </span>
            <h2 class="text-title-md-emphasized text-main">
              Telemetría de Progreso
            </h2>
            <span class="text-label-md-emphasized font-mono tabular-nums px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box">
              {{ vehicle().id }}
            </span>
          </div>

          <p class="text-body-sm text-muted truncate">
            {{ vehicle().origin }} &rarr; {{ vehicle().destination }} • {{ vehicle().driver }}
          </p>
        </div>

        <div class="flex items-center gap-2.5 bg-surface px-3.5 py-1 rounded-m3-full min-h-[48px] overflow-visible self-start sm:self-auto shrink-0">
          <label for="tel-dispatch-progress-slider" class="text-label-md text-muted font-mono shrink-0">
            Avance
          </label>
          <div class="w-32 sm:w-40 shrink-0">
            <m3-slider
              customId="tel-dispatch-progress-slider"
              size="xs"
              [min]="0"
              [max]="100"
              [step]="1"
              unit="%"
              ariaLabel="Ajustar progreso de entrega del despacho seleccionado"
              [value]="vehicle().progressPercent"
              (valueChange)="progressChange.emit($event)" />
          </div>
          <span class="text-label-lg-emphasized font-mono tabular-nums text-main w-11 text-right shrink-0">
            {{ vehicle().progressPercent }}%
          </span>
        </div>
      </div>

      <!-- Canonical Living Wavy Dispatch Indicator (Single Active Wavy rAF Loop in Workbench) -->
      <div class="space-y-1.5 py-1">
        <m3-linear-progress
          [value]="vehicle().progressPercent"
          [wavy]="true"
          [paused]="!isLiveTelemetryActive() || pauseWavy()"
          size="lg"
          color="primary"
          [ariaLabel]="'Progreso de entrega de ' + vehicle().id" />
        <div class="flex items-center justify-between text-label-sm font-mono tabular-nums text-muted">
          <span>Velocidad actual: {{ vehicle().speedKmh }} km/h</span>
          <span>Último ping: {{ vehicle().lastPingTime }}</span>
        </div>
      </div>

      <!-- Rich Instrumental CAN-BUS Telemetry Tiles -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="px-3.5 py-3 rounded-m3-lg bg-surface flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-label-sm text-muted">Motor</span>
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">speed</span>
          </div>
          <div>
            <span class="text-title-sm-emphasized font-mono tabular-nums text-main block">
              {{ vehicle().telemetry.engineRpm }} RPM
            </span>
            <span class="text-label-sm text-muted">Banda operativa</span>
          </div>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-label-sm text-muted">Combustible</span>
            <span
              [class]="'material-symbols-rounded text-base ' +
                (vehicle().telemetry.fuelLevelPercent < 45 ? 'text-warning' : 'text-success')"
              aria-hidden="true">
              local_gas_station
            </span>
          </div>
          <div class="space-y-1.5">
            <span class="text-title-sm-emphasized font-mono tabular-nums text-main block">
              {{ vehicle().telemetry.fuelLevelPercent }}%
            </span>
            <div class="h-1.5 w-full rounded-m3-full bg-surface-high overflow-hidden" aria-hidden="true">
              <div
                [class]="'h-full rounded-m3-full transition-all ' +
                  (vehicle().telemetry.fuelLevelPercent < 45 ? 'bg-warning' : 'bg-primary')"
                [style.width.%]="vehicle().telemetry.fuelLevelPercent">
              </div>
            </div>
          </div>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-label-sm text-muted">Batería</span>
            <span class="material-symbols-rounded text-base text-success" aria-hidden="true">battery_charging_full</span>
          </div>
          <div>
            <span class="text-title-sm-emphasized font-mono tabular-nums text-main block">
              {{ vehicle().telemetry.batteryVolts }} V
            </span>
            <span class="text-label-sm text-success font-medium">Alternador OK</span>
          </div>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-label-sm text-muted">Neumáticos</span>
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">tire_repair</span>
          </div>
          <div>
            <span class="text-title-sm-emphasized font-mono tabular-nums text-main block">
              {{ vehicle().telemetry.tirePressurePsi }} PSI
            </span>
            <span class="text-label-sm text-muted">Presión nominal</span>
          </div>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-label-sm text-muted">Carga Térmica</span>
            <span
              [class]="'material-symbols-rounded text-base ' +
                (isColdWarning() ? 'text-warning' : vehicle().telemetry.cargoTempC < 0 ? 'text-tertiary' : 'text-muted')"
              aria-hidden="true">
              {{ vehicle().telemetry.cargoTempC < 0 ? 'ac_unit' : 'thermostat' }}
            </span>
          </div>
          <div>
            <span
              [class]="'text-title-sm-emphasized font-mono tabular-nums block ' +
                (isColdWarning() ? 'text-warning' : vehicle().telemetry.cargoTempC < 0 ? 'text-tertiary' : 'text-main')">
              {{ vehicle().telemetry.cargoTempC }}°C
            </span>
            <span
              [class]="'text-label-sm ' + (isColdWarning() ? 'text-warning font-medium' : 'text-muted')">
              {{ thermalStateLabel() }}
            </span>
          </div>
        </div>

        <div class="px-3.5 py-3 rounded-m3-lg bg-surface flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-label-sm text-muted">ETA Estimado</span>
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">schedule</span>
          </div>
          <div>
            <span class="text-title-sm-emphasized font-mono tabular-nums text-primary block">
              {{ vehicle().etaMinutes }} min
            </span>
            <span class="text-label-sm text-muted">Arribo a destino</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TelemetryFocusCardComponent {
  readonly vehicle = input.required<Vehicle>();
  readonly isLiveTelemetryActive = input.required<boolean>();
  readonly pauseWavy = input<boolean>(false);

  readonly progressChange = output<number>();

  readonly isColdWarning = computed(() => {
    const v = this.vehicle();
    return v.status === 'cold_chain_warning' || (v.telemetry.cargoTempC < 0 && v.telemetry.cargoTempC > -16);
  });

  readonly thermalStateLabel = computed(() => {
    const temp = this.vehicle().telemetry.cargoTempC;
    if (temp >= 0) return 'Carga seca';
    return temp <= -16 ? 'Frío estable' : 'Sobre umbral';
  });
}
