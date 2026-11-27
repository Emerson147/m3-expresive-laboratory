import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FinancePnlSummary } from '../../../core/finance/finance.models';
import { M3CardComponent } from '../../../shared/components/card/card.component';

/**
 * Four-card OKLCH analytical KPI strip separating accounting net revenue (ex-IGV),
 * recipe COGS, operating expenses, and true net profit with explicit non-color state cues.
 */
@Component({
  selector: 'app-finance-kpi-strip',
  standalone: true,
  imports: [M3CardComponent],
  host: { class: 'block shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">Ingreso Neto (sin IGV)</span>
          <span class="w-8 h-8 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">payments</span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          S/ {{ summary().netRevenueExTax.toFixed(2) }}
        </div>
        <div class="text-label-sm text-muted">
          Cobrado en caja (c/IGV): S/ {{ summary().grossCollectedWithTax.toFixed(2) }}
        </div>
      </m3-card>

      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">Costo Insumos (COGS)</span>
          <span class="w-8 h-8 rounded-m3-md bg-secondary-box text-on-secondary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">coffee_maker</span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          S/ {{ summary().totalCogs.toFixed(2) }}
        </div>
        <div class="text-label-sm text-muted">
          Margen bruto: {{ summary().grossMarginPercent.toFixed(1) }}% ({{ cogsPercent() }}% costo)
        </div>
      </m3-card>

      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">Gastos Operativos</span>
          <span class="w-8 h-8 rounded-m3-md bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">receipt</span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          S/ {{ summary().totalOpEx.toFixed(2) }}
        </div>
        <div class="text-label-sm text-muted">
          Fijos S/ {{ summary().fixedOpEx.toFixed(2) }} · Var. S/ {{ summary().variableOpEx.toFixed(2) }}
        </div>
      </m3-card>

      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">Utilidad Neta Real</span>
          <span
            [class]="summary().isProfitable
              ? 'w-8 h-8 rounded-m3-md bg-success-box text-on-success-box grid place-items-center shrink-0'
              : 'w-8 h-8 rounded-m3-md bg-error-box text-on-error-box grid place-items-center shrink-0'">
            <span class="material-symbols-rounded text-base" aria-hidden="true">
              {{ summary().isProfitable ? 'trending_up' : 'trending_down' }}
            </span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          {{ formattedNetProfit() }}
        </div>
        <div class="flex items-center gap-1.5 text-label-sm">
          <span
            [class]="summary().isProfitable
              ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-[10px] font-bold'
              : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full bg-error-box text-on-error-box text-[10px] font-bold'">
            <span class="material-symbols-rounded text-xs" aria-hidden="true">
              {{ summary().isProfitable ? 'check_circle' : 'warning' }}
            </span>
            <span>{{ summary().isProfitable ? 'Superávit' : 'Déficit' }}</span>
          </span>
          <span class="text-muted font-mono tabular-nums">
            Margen {{ summary().netMarginPercent.toFixed(1) }}% · {{ periodLabel() }}
          </span>
        </div>
      </m3-card>
    </div>
  `
})
export class FinanceKpiStripComponent {
  readonly summary = input.required<FinancePnlSummary>();
  readonly periodLabel = input<string>('Últimos 30 días');

  readonly cogsPercent = computed(() => {
    const rev = this.summary().netRevenueExTax;
    return rev > 0 ? ((this.summary().totalCogs / rev) * 100).toFixed(1) : '0.0';
  });

  readonly formattedNetProfit = computed(() => {
    const val = this.summary().netProfit;
    const abs = Math.abs(val).toFixed(2);
    return val >= 0 ? `+S/ ${abs}` : `-S/ ${abs}`;
  });
}
