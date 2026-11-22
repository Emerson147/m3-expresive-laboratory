import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KanbanKpiSummary } from '../../../core/kanban/kanban.models';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

@Component({
  selector: 'app-kanban-kpi-strip',
  standalone: true,
  imports: [M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Indicadores operativos de cocina" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 shrink-0">
      <!-- KPI 1: Active Orders & WIP State -->
      <div class="kds-kpi-card bg-surface-low px-5 py-4 sm:py-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md-emphasized text-muted uppercase tracking-wide">Comandas Activas</span>
          <span class="w-8 h-8 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">receipt_long</span>
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-1.5">
            <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
              {{ kpi().totalActive }}
            </span>
            <span class="text-label-md text-muted">en flujo</span>
          </div>

          <span
            [class]="'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full ' + (kpi().wipExceededColumns > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-surface-high text-muted')">
            {{ kpi().wipExceededColumns > 0 ? kpi().wipExceededColumns + ' WIP alto' : 'Flujo estable' }}
          </span>
        </div>

        <div class="flex items-center justify-between text-label-sm text-muted pt-0.5">
          <span>Listas para despacho</span>
          <span class="font-mono tabular-nums font-semibold text-main">{{ kpi().readyCount }}</span>
        </div>
      </div>

      <!-- KPI 2: Avg Prep Time vs On-Time Ratio -->
      <div class="kds-kpi-card bg-surface-low px-5 py-4 sm:py-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md-emphasized text-muted uppercase tracking-wide">Tiempo Promedio</span>
          <span class="w-8 h-8 rounded-m3-lg bg-sec-box text-on-sec-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">timer</span>
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-1.5">
            <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
              {{ kpi().avgPrepTimeMin }}m
            </span>
            <span class="text-label-md text-muted font-mono tabular-nums">meta &le; 15m</span>
          </div>

          <span
            [class]="'text-label-sm-emphasized px-2 py-0.5 rounded-m3-full font-mono tabular-nums ' + (kpi().onTimeRatePercent >= 80 ? 'bg-success-box text-on-success-box' : 'bg-warning-box text-on-warning-box')">
            {{ kpi().onTimeRatePercent }}% SLA
          </span>
        </div>

        <m3-linear-progress
          [value]="kpi().onTimeRatePercent"
          [wavy]="false"
          size="sm"
          [color]="kpi().onTimeRatePercent >= 80 ? 'primary' : 'secondary'"
          ariaLabel="Porcentaje de comandas dentro del tiempo meta SLA" />
      </div>

      <!-- KPI 3: SLA Breaches (OKLCH Error Role) -->
      <div
        [class]="'kds-kpi-card px-5 py-4 sm:py-5 flex flex-col justify-between gap-3 ' + (kpi().slaBreachCount > 0 ? 'bg-error-box/45' : 'bg-surface-low')">
        <div class="flex items-center justify-between gap-2">
          <span
            [class]="'text-label-md-emphasized uppercase tracking-wide ' + (kpi().slaBreachCount > 0 ? 'text-error' : 'text-muted')">
            Alertas SLA
          </span>
          <span
            [class]="'w-8 h-8 rounded-m3-lg grid place-items-center shrink-0 ' + (kpi().slaBreachCount > 0 ? 'bg-error-box text-on-error-box' : 'bg-success-box text-on-success-box')">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">
              {{ kpi().slaBreachCount > 0 ? 'warning' : 'verified' }}
            </span>
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-1.5">
            <span
              [class]="'text-headline-sm-emphasized font-mono tabular-nums ' + (kpi().slaBreachCount > 0 ? 'text-error' : 'text-main')">
              {{ kpi().slaBreachCount }}
            </span>
            <span
              [class]="'text-label-md ' + (kpi().slaBreachCount > 0 ? 'text-error font-semibold' : 'text-muted')">
              {{ kpi().slaBreachCount > 0 ? 'con retraso' : 'al día' }}
            </span>
          </div>

          <span
            [class]="'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full ' + (kpi().slaBreachCount > 0 ? 'bg-error-box text-on-error-box' : 'bg-success-box text-on-success-box')">
            {{ kpi().slaBreachCount > 0 ? 'Atención' : 'Óptimo' }}
          </span>
        </div>

        <div class="flex items-center justify-between text-label-sm text-muted pt-0.5">
          <span>Umbral crítico</span>
          <span class="font-mono tabular-nums font-medium">100% meta</span>
        </div>
      </div>

      <!-- KPI 4: Hourly Throughput -->
      <div class="kds-kpi-card bg-surface-low px-5 py-4 sm:py-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-md-emphasized text-muted uppercase tracking-wide">Despacho / Hora</span>
          <span class="w-8 h-8 rounded-m3-lg bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">speed</span>
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-1.5">
            <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
              {{ kpi().throughputPerHour }}
            </span>
            <span class="text-label-md text-muted">tickets/h</span>
          </div>

          <span class="text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full bg-tertiary-box text-on-tertiary-box font-mono tabular-nums">
            {{ kpi().readyCount }} listas
          </span>
        </div>

        <div class="flex items-center justify-between text-label-sm text-muted pt-0.5">
          <span>Cumplimiento turno</span>
          <span class="font-mono tabular-nums font-semibold text-main">{{ kpi().onTimeRatePercent }}%</span>
        </div>
      </div>
    </section>
  `
})
export class KanbanKpiStripComponent {
  readonly kpi = input.required<KanbanKpiSummary>();
}
