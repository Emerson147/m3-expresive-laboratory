import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SalesFiscalSummary } from '../../../core/sales/sales-ledger.models';
import { M3CardComponent } from '../../../shared/components/card/card.component';

/**
 * Analytical 4-card KPI ribbon showing live net sales, 18% IGV, reconciliation queue, and voided count.
 */
@Component({
  selector: 'app-sales-kpi-strip',
  standalone: true,
  imports: [M3CardComponent],
  host: { class: 'block shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-label="Indicadores fiscales de ventas"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">Venta Neta Activa</span>
          <span class="w-8 h-8 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">payments</span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          S/ {{ summary().totalNetRevenue.toFixed(2) }}
        </div>
        <div class="text-label-sm text-muted">
          {{ summary().activeCount }} comprobantes válidos emitidos
        </div>
      </m3-card>

      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">IGV 18% Declarado</span>
          <span class="w-8 h-8 rounded-m3-md bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">account_balance</span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          S/ {{ summary().totalTaxCollected.toFixed(2) }}
        </div>
        <div class="text-label-sm text-muted">
          Descuentos aplicados: S/ {{ summary().totalDiscounts.toFixed(2) }}
        </div>
      </m3-card>

      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">Cola por Conciliar</span>
          <span
            [class]="summary().pendingCount > 0
              ? 'w-8 h-8 rounded-m3-md bg-warning-box text-on-warning-box grid place-items-center shrink-0'
              : 'w-8 h-8 rounded-m3-md bg-success-box text-on-success-box grid place-items-center shrink-0'">
            <span class="material-symbols-rounded text-base" aria-hidden="true">
              {{ summary().pendingCount > 0 ? 'pending_actions' : 'verified' }}
            </span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          {{ summary().pendingCount }}
        </div>
        <div class="text-label-sm text-muted">
          {{ summary().reconciledCount }} conciliados con cierre diario
        </div>
      </m3-card>

      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">Notas de Crédito</span>
          <span class="w-8 h-8 rounded-m3-md bg-error-box text-on-error-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">assignment_return</span>
          </span>
        </div>
        <div class="text-headline-sm-emphasized font-mono tabular-nums text-main">
          {{ summary().voidedCount }}
        </div>
        <div class="text-label-sm text-muted">
          Comprobantes anulados en auditoría
        </div>
      </m3-card>
    </section>
  `
})
export class SalesKpiStripComponent {
  readonly summary = input.required<SalesFiscalSummary>();
}
