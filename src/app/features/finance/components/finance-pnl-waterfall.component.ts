import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FinancePnlSummary } from '../../../core/finance/finance.models';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

/**
 * Analytical P&L Waterfall Cascade & Category Profitability cards.
 * Uses deterministic `<m3-linear-progress [wavy]="false">` indicators and semantic text pairings.
 */
@Component({
  selector: 'app-finance-pnl-waterfall',
  standalone: true,
  imports: [M3CardComponent, M3LinearProgressComponent],
  host: { class: 'block space-y-6' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Cascada P&L (De Venta Bruta a Utilidad Neta) -->
    <m3-card variant="outlined" padding="md" shape="xl" customClass="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-outline-sub pb-3">
        <div>
          <h2 class="text-title-md-emphasized text-main">
            Cascada de Resultados (P&amp;L)
          </h2>
          <p class="text-body-sm text-muted">
            Descuento automático de IGV (18% SUNAT), costo de receta y gastos operativos · {{ periodLabel() }}
          </p>
        </div>

        <span class="px-2.5 py-1 rounded-m3-full bg-surface-high text-xs font-mono font-bold text-main tabular-nums">
          Margen Bruto {{ summary().grossMarginPercent.toFixed(1) }}%
        </span>
      </div>

      <figure aria-labelledby="pnl-waterfall-caption" class="space-y-3">
        <figcaption id="pnl-waterfall-caption" class="sr-only">
          Desglose de resultados para {{ periodLabel() }}: ingreso neto sin IGV {{ summary().netRevenueExTax.toFixed(2) }} soles, costo de insumos {{ summary().totalCogs.toFixed(2) }} soles, gastos operativos {{ summary().totalOpEx.toFixed(2) }} soles y utilidad neta {{ summary().netProfit.toFixed(2) }} soles.
        </figcaption>

        <!-- Paso 1: Ingreso Neto Base -->
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-2 text-xs">
            <span class="font-bold text-main inline-flex items-center gap-1.5">
              <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">account_balance_wallet</span>
              <span>1. Ingreso Neto del Negocio (sin 18% IGV)</span>
            </span>
            <span class="font-mono font-bold text-main tabular-nums">S/ {{ summary().netRevenueExTax.toFixed(2) }}</span>
          </div>
          <m3-linear-progress
            [value]="summary().netRevenueExTax > 0 ? 100 : 0"
            [wavy]="false"
            color="primary"
            size="md"
            [showStop]="false"
            ariaLabel="Base de ingreso neto 100 por ciento" />
        </div>

        <!-- Paso 2: Costo de Receta (COGS) -->
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-2 text-xs">
            <span class="font-medium text-muted inline-flex items-center gap-1.5">
              <span class="material-symbols-rounded text-base text-secondary" aria-hidden="true">remove_circle_outline</span>
              <span>2. Costo de Insumos Vendidos (COGS)</span>
            </span>
            <span class="font-mono font-bold text-main tabular-nums">
              -S/ {{ summary().totalCogs.toFixed(2) }} ({{ cogsShare() }}%)
            </span>
          </div>
          <m3-linear-progress
            [value]="cogsShare()"
            [wavy]="false"
            color="secondary"
            size="md"
            [ariaLabel]="'Costo de insumos ' + cogsShare() + ' por ciento del ingreso neto'" />
        </div>

        <!-- Paso 3: Gastos Operativos (OpEx) -->
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-2 text-xs">
            <span class="font-medium text-muted inline-flex items-center gap-1.5">
              <span class="material-symbols-rounded text-base text-tertiary" aria-hidden="true">remove_circle_outline</span>
              <span>3. Gastos Operativos del Período (OpEx)</span>
            </span>
            <span class="font-mono font-bold text-main tabular-nums">
              -S/ {{ summary().totalOpEx.toFixed(2) }} ({{ opexShare() }}%)
            </span>
          </div>
          <m3-linear-progress
            [value]="opexShare()"
            [wavy]="false"
            color="tertiary"
            size="md"
            [ariaLabel]="'Gastos operativos ' + opexShare() + ' por ciento del ingreso neto'" />
        </div>

        <!-- Resultado Final -->
        <div
          [class]="summary().isProfitable
            ? 'p-3 rounded-m3-lg bg-success-box/45 border border-outline-sub flex flex-wrap items-center justify-between gap-2'
            : 'p-3 rounded-m3-lg bg-error-box/45 border border-error/30 flex flex-wrap items-center justify-between gap-2'">
          <div class="flex items-center gap-2 text-xs font-bold text-main">
            <span
              class="material-symbols-rounded text-base"
              [class.text-error]="!summary().isProfitable"
              [class.text-primary]="summary().isProfitable"
              aria-hidden="true">
              {{ summary().isProfitable ? 'verified' : 'error' }}
            </span>
            <span>4. Resultado Neto de {{ periodLabel() }} (después de insumos y gastos)</span>
          </div>
          <span class="text-title-sm-emphasized font-mono font-extrabold tabular-nums text-main">
            {{ summary().netProfit >= 0 ? '+S/ ' : '-S/ ' }}{{ MathAbs(summary().netProfit).toFixed(2) }}
            ({{ summary().netMarginPercent.toFixed(1) }}%)
          </span>
        </div>
      </figure>
    </m3-card>

    <!-- Rentabilidad por Categoría del Catálogo -->
    <m3-card variant="outlined" padding="md" shape="xl" customClass="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-outline-sub pb-3">
        <div>
          <h2 class="text-title-md-emphasized text-main">
            Margen por Línea de Producto
          </h2>
          <p class="text-body-sm text-muted">
            Rentabilidad real calculada SKU por SKU desde Punto de Venta e Historial
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        @for (cat of summary().categories; track cat.category) {
          <m3-card variant="filled" surface="low" padding="sm" shape="lg" customClass="space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-8 h-8 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">{{ cat.icon }}</span>
                </span>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-main truncate">{{ cat.label }}</div>
                  <div class="text-[11px] text-muted font-mono tabular-nums">
                    {{ cat.unitsSold }} unds · {{ cat.revenueSharePercent }}% ventas
                  </div>
                </div>
              </div>

              <span class="px-2 py-0.5 rounded-m3-full bg-surface-high text-[11px] font-mono font-bold text-primary tabular-nums">
                {{ cat.marginPercent.toFixed(1) }}% margen
              </span>
            </div>

            <m3-linear-progress
              [value]="cat.marginPercent"
              [wavy]="false"
              color="primary"
              size="sm"
              [ariaLabel]="'Margen bruto de ' + cat.label + ' igual a ' + cat.marginPercent.toFixed(1) + ' por ciento'" />

            <div class="grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums pt-1">
              <div>
                <span class="text-muted block">Ingreso</span>
                <span class="font-bold text-main">S/ {{ cat.revenueExTax.toFixed(2) }}</span>
              </div>
              <div>
                <span class="text-muted block">Costo</span>
                <span class="font-bold text-main">S/ {{ cat.cogs.toFixed(2) }}</span>
              </div>
              <div class="text-end">
                <span class="text-muted block">Utilidad</span>
                <span class="font-bold text-primary">+S/ {{ cat.grossProfit.toFixed(2) }}</span>
              </div>
            </div>
          </m3-card>
        }
      </div>
    </m3-card>
  `
})
export class FinancePnlWaterfallComponent {
  readonly summary = input.required<FinancePnlSummary>();
  readonly periodLabel = input<string>('Últimos 30 días');

  readonly cogsShare = computed(() => {
    const rev = this.summary().netRevenueExTax;
    if (rev <= 0) return 0;
    return Math.min(100, Math.round((this.summary().totalCogs / rev) * 100));
  });

  readonly opexShare = computed(() => {
    const rev = this.summary().netRevenueExTax;
    if (rev <= 0) return 0;
    return Math.min(100, Math.round((this.summary().totalOpEx / rev) * 100));
  });

  MathAbs(n: number): number {
    return Math.abs(n);
  }
}
