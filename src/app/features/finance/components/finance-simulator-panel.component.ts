import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  FinancePnlSummary,
  FinanceSimulatedSummary,
  FinanceSimulationConfig
} from '../../../core/finance/finance.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CircularProgressComponent } from '../../../shared/components/progress';
import { M3SliderComponent } from '../../../shared/components/slider/slider.component';

/**
 * Sticky right-side Decision Workbench: Break-Even Coverage Gauge + What-If Margin Simulator.
 */
@Component({
  selector: 'app-finance-simulator-panel',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3CardComponent,
    M3CircularProgressComponent,
    M3SliderComponent
  ],
  host: { class: 'block space-y-6' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- 1. Break-Even (Punto de Equilibrio) -->
    <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="text-label-sm-emphasized uppercase tracking-wider text-primary block">
            Punto de Equilibrio
          </span>
          <h2 class="text-title-md-emphasized text-main mt-0.5">
            Meta de Cobertura
          </h2>
          <p class="text-body-sm text-muted">
            Venta mínima (sin IGV) necesaria para quedar en S/ 0.00 en {{ periodLabel() }}
          </p>
        </div>

        <div class="relative shrink-0 grid place-items-center w-16 h-16">
          <m3-circular-progress
            [value]="cappedBreakEven()"
            [wavy]="false"
            size="lg"
            [diameter]="64"
            [color]="summary().isProfitable ? 'primary' : 'error'"
            [ariaLabel]="'Cobertura de punto de equilibrio ' + summary().breakEvenCoveragePercent + ' por ciento'" />
          <span
            aria-hidden="true"
            class="absolute inset-0 grid place-items-center pointer-events-none text-[11px] font-mono font-extrabold text-main tabular-nums">
            {{ summary().breakEvenCoveragePercent }}%
          </span>
        </div>
      </div>

      <div class="p-3 rounded-m3-lg bg-surface space-y-1.5 border border-outline-sub">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">Equilibrio requerido</span>
          <span class="font-mono font-bold text-main tabular-nums">
            S/ {{ summary().breakEvenRevenue.toFixed(2) }}
          </span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">Diferencia actual</span>
          <span
            class="font-mono font-bold tabular-nums inline-flex items-center gap-1"
            [class.text-primary]="gapFromBreakEven() >= 0"
            [class.text-error]="gapFromBreakEven() < 0">
            <span class="material-symbols-rounded text-sm" aria-hidden="true">
              {{ gapFromBreakEven() >= 0 ? 'arrow_upward' : 'arrow_downward' }}
            </span>
            <span>
              {{ gapFromBreakEven() >= 0 ? '+S/ ' : '-S/ ' }}{{ MathAbs(gapFromBreakEven()).toFixed(2) }}
            </span>
          </span>
        </div>
      </div>
    </m3-card>

    <!-- 2. Simulador What-If con M3 Sliders -->
    <m3-card variant="outlined" padding="md" shape="xl" customClass="space-y-4">
      <div class="flex items-center justify-between gap-2 border-b border-outline-sub pb-3">
        <div>
          <span class="text-label-sm-emphasized uppercase tracking-wider text-primary block">
            Escenario What-If
          </span>
          <h2 class="text-title-md-emphasized text-main">
            Simulador de Márgenes
          </h2>
        </div>

        <m3-button
          variant="text"
          size="xs"
          icon="restart_alt"
          [disabled]="!simulated().isModified"
          (action)="reset.emit()">
          Restablecer
        </m3-button>
      </div>

      <div class="space-y-4">
        <m3-slider
          customId="fin-sim-price-slider"
          label="Ajuste de Precios"
          unit="%"
          size="xs"
          [min]="-15"
          [max]="25"
          [step]="1"
          [value]="simulation().priceDeltaPercent"
          (valueChange)="simulationPatch.emit({ priceDeltaPercent: $event })" />

        <m3-slider
          customId="fin-sim-cogs-slider"
          label="Costo de Insumos (COGS)"
          unit="%"
          size="xs"
          [min]="-15"
          [max]="30"
          [step]="1"
          [value]="simulation().cogsDeltaPercent"
          (valueChange)="simulationPatch.emit({ cogsDeltaPercent: $event })" />

        <m3-slider
          customId="fin-sim-opex-slider"
          label="Gastos Operativos (OpEx)"
          unit="%"
          size="xs"
          [min]="-25"
          [max]="30"
          [step]="1"
          [value]="simulation().opexDeltaPercent"
          (valueChange)="simulationPatch.emit({ opexDeltaPercent: $event })" />
      </div>

      <!-- Resultado Proyectado -->
      <div
        [class]="simulated().isProjectedProfitable
          ? 'p-3.5 rounded-m3-xl bg-primary-box/45 border border-primary/20 space-y-2.5'
          : 'p-3.5 rounded-m3-xl bg-error-box/45 border border-error/25 space-y-2.5'">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
            Utilidad Proyectada
          </span>
          <span class="text-xs font-mono font-bold tabular-nums text-main">
            {{ simulated().profitDelta >= 0 ? '+S/ ' : '-S/ ' }}{{ MathAbs(simulated().profitDelta).toFixed(2) }} vs real
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2">
          <span class="text-headline-sm-emphasized font-mono font-extrabold tabular-nums text-main">
            {{ simulated().projectedNetProfit >= 0 ? '+S/ ' : '-S/ ' }}{{ MathAbs(simulated().projectedNetProfit).toFixed(2) }}
          </span>
          <span class="text-xs font-mono font-bold text-primary tabular-nums">
            Margen {{ simulated().projectedNetMarginPercent.toFixed(1) }}%
          </span>
        </div>

        <div class="pt-2 border-t border-outline-sub/60 grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums text-muted">
          <div>
            Ingreso sim.: <strong class="text-main">S/ {{ simulated().projectedRevenue.toFixed(2) }}</strong>
          </div>
          <div class="text-end">
            Equilibrio: <strong class="text-main">S/ {{ simulated().projectedBreakEven.toFixed(2) }}</strong>
          </div>
        </div>
      </div>
    </m3-card>
  `
})
export class FinanceSimulatorPanelComponent {
  readonly summary = input.required<FinancePnlSummary>();
  readonly simulation = input.required<FinanceSimulationConfig>();
  readonly simulated = input.required<FinanceSimulatedSummary>();
  readonly periodLabel = input<string>('Últimos 30 días');

  readonly simulationPatch = output<Partial<FinanceSimulationConfig>>();
  readonly reset = output<void>();

  readonly cappedBreakEven = computed(() =>
    Math.min(100, Math.max(0, this.summary().breakEvenCoveragePercent))
  );

  readonly gapFromBreakEven = computed(() =>
    this.summary().netRevenueExTax - this.summary().breakEvenRevenue
  );

  MathAbs(n: number): number {
    return Math.abs(n);
  }
}
