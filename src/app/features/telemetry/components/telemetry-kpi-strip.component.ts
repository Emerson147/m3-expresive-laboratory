import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TelemetryKpiSummary } from '../../../core/telemetry/telemetry.models';
import { M3CircularProgressComponent, M3LinearProgressComponent } from '../../../shared/components/progress';

@Component({
  selector: 'app-telemetry-kpi-strip',
  standalone: true,
  imports: [M3LinearProgressComponent, M3CircularProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Indicadores operativos de flota" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
      <!-- KPI 1: SLA Rate -->
      <div class="rounded-m3-xl tel-kpi-card bg-surface-low px-5 py-4 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md-emphasized text-muted uppercase tracking-wide">Cumplimiento SLA</span>
          <span class="w-8 h-8 rounded-m3-lg bg-success-box text-on-success-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">verified</span>
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
              {{ kpi().slaRate }}%
            </span>
            <span
              [class]="'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full ' +
                (kpi().slaRate >= 92 ? 'bg-success-box text-on-success-box' : 'bg-warning-box text-on-warning-box')">
              {{ kpi().slaRate >= 92 ? 'En meta' : 'Bajo meta' }}
            </span>
          </div>

          <m3-linear-progress
            [value]="kpi().slaRate"
            [wavy]="false"
            size="sm"
            [color]="kpi().slaRate >= 92 ? 'primary' : 'secondary'"
            ariaLabel="Ratio de cumplimiento SLA" />

          <div class="flex justify-between gap-2 text-label-sm text-muted font-mono tabular-nums">
            <span>{{ optimalFleetCount() }} de {{ kpi().activeFleetCount }} óptimas</span>
            <span>Meta: 92%</span>
          </div>
        </div>
      </div>

      <!-- KPI 2: Active Fleet & Capacity Utilization (Aligned Baseline Rhythm) -->
      <div class="rounded-m3-xl tel-kpi-card bg-surface-low px-5 py-4 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md-emphasized text-muted uppercase tracking-wide">Flota en Ruta</span>
          <span class="w-8 h-8 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">local_shipping</span>
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-baseline gap-1.5 min-w-0">
              <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
                {{ kpi().activeFleetCount }}
              </span>
              <span class="text-label-lg text-muted font-mono tabular-nums">
                / {{ kpi().totalFleetCount }} u.
              </span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <m3-circular-progress
                [value]="kpi().fleetUtilizationPercent"
                [wavy]="false"
                size="sm"
                color="primary"
                ariaLabel="Porcentaje de ocupación de flota" />
              <span class="text-label-sm-emphasized font-mono tabular-nums px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box">
                {{ kpi().fleetUtilizationPercent }}% uso
              </span>
            </div>
          </div>

          <m3-linear-progress
            [value]="kpi().fleetUtilizationPercent"
            [wavy]="false"
            size="sm"
            color="primary"
            ariaLabel="Capacidad operativa en ruta" />

          <div class="flex justify-between gap-2 text-label-sm text-muted font-mono tabular-nums">
            <span>{{ kpi().idleFleetCount }} en reserva</span>
            <span>Activa: {{ kpi().activeFleetCount }}</span>
          </div>
        </div>
      </div>

      <!-- KPI 3: Cold Chain Sensor Health -->
      <div class="rounded-m3-xl tel-kpi-card bg-surface-low px-5 py-4 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md-emphasized text-muted uppercase tracking-wide">Cadena de Frío</span>
          <span
            [class]="'w-8 h-8 rounded-m3-lg grid place-items-center shrink-0 ' +
              (kpi().coldChainHealth >= 85 ? 'bg-tertiary-box text-on-tertiary-box' : 'bg-warning-box text-on-warning-box')">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">ac_unit</span>
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
              {{ kpi().coldChainHealth }}%
            </span>
            <span
              [class]="'text-label-sm-emphasized font-mono tabular-nums px-2.5 py-0.5 rounded-m3-full ' +
                (kpi().coldChainAvgTempC <= -16 ? 'bg-tertiary-box text-on-tertiary-box' : 'bg-warning-box text-on-warning-box')">
              {{ kpi().coldChainAvgTempC }}°C prom.
            </span>
          </div>

          <m3-linear-progress
            [value]="kpi().coldChainHealth"
            [wavy]="false"
            size="sm"
            [color]="kpi().coldChainHealth >= 85 ? 'tertiary' : 'secondary'"
            ariaLabel="Estado de cadena de frío" />

          <div class="flex justify-between gap-2 text-label-sm text-muted font-mono tabular-nums">
            <span>{{ kpi().coldChainMonitoredCount }} térmicas</span>
            <span>Umbral &le; -16°C</span>
          </div>
        </div>
      </div>

      <!-- KPI 4: Delay Risk & Corridor Speed -->
      <div class="rounded-m3-xl tel-kpi-card bg-surface-low px-5 py-4 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md-emphasized text-muted uppercase tracking-wide">Riesgo de Demora</span>
          <span
            [class]="'w-8 h-8 rounded-m3-lg grid place-items-center shrink-0 ' +
              (kpi().delayedCount > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-success-box text-on-success-box')">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">
              {{ kpi().delayedCount > 0 ? 'warning' : 'check_circle' }}
            </span>
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex items-baseline justify-between gap-2">
            <span
              [class]="'text-headline-sm-emphasized font-mono tabular-nums ' +
                (kpi().delayedCount > 0 ? 'text-warning' : 'text-success')">
              {{ kpi().delayedCount }}
            </span>
            <span
              [class]="'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full ' +
                (kpi().delayedCount > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-success-box text-on-success-box')">
              {{ kpi().delayedCount === 1 ? '1 unidad demorada' : kpi().delayedCount + ' unidades demoradas' }}
            </span>
          </div>

          <m3-linear-progress
            [value]="delayedRatio()"
            [wavy]="false"
            size="sm"
            [color]="kpi().delayedCount > 0 ? 'error' : 'primary'"
            ariaLabel="Porcentaje de unidades con demora SLA" />

          <div class="flex justify-between gap-2 text-label-sm text-muted font-mono tabular-nums">
            <span>Riesgo de ruta</span>
            <span>Vel. media: {{ kpi().averageSpeedKmh }} km/h</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class TelemetryKpiStripComponent {
  readonly kpi = input.required<TelemetryKpiSummary>();

  readonly optimalFleetCount = computed(() =>
    Math.max(0, Math.round((this.kpi().slaRate / 100) * this.kpi().activeFleetCount))
  );

  readonly delayedRatio = computed(() => {
    const active = this.kpi().activeFleetCount;
    if (active <= 0) return 0;
    return Math.round((this.kpi().delayedCount / active) * 1000) / 10;
  });
}
