import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SalesFiscalSummary } from '../../../core/sales/sales-ledger.models';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

/**
 * Lazy-loaded Shift Closing & Payment Breakdown component rendered exclusively
 * inside an `@defer` boundary in `SalesComponent` to keep analytical rendering off initial paint.
 */
@Component({
  selector: 'app-sales-fiscal-defer-panel',
  standalone: true,
  imports: [M3CardComponent, M3LinearProgressComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-outline-sub pb-3">
        <div>
          <span class="px-2.5 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-[10px] font-bold uppercase tracking-wider">
            Cuadre de Caja • {{ periodLabel() }}
          </span>
          <h3 class="text-title-md-emphasized text-main mt-1">
            Consolidado por Medio de Pago y Cuadre Fiscal SUNAT
          </h3>
        </div>
        <span class="text-xs font-mono text-primary font-bold tabular-nums">
          Venta Neta ({{ periodLabel() }}): S/ {{ summary().totalNetRevenue.toFixed(2) }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (row of summary().paymentBreakdown; track row.method) {
          <m3-card variant="filled" surface="surface" padding="sm" shape="lg" customClass="space-y-2 border border-outline-sub">
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="font-bold text-main">{{ row.label }}</span>
              <span class="font-mono font-bold text-primary tabular-nums">{{ row.sharePercent }}%</span>
            </div>

            <div class="text-title-sm-emphasized font-mono font-extrabold text-main tabular-nums">
              S/ {{ row.total.toFixed(2) }}
            </div>

            <m3-linear-progress
              [value]="row.sharePercent"
              [wavy]="false"
              color="primary"
              size="md"
              [ariaLabel]="'Participación de ' + row.label" />

            <div class="text-[11px] text-muted font-mono">
              {{ row.count }} comprobante(s) validados
            </div>
          </m3-card>
        }
      </div>
    </m3-card>
  `
})
export class SalesFiscalDeferPanelComponent {
  readonly summary = input.required<SalesFiscalSummary>();
  readonly periodLabel = input<string>('Últimos 30 días');
}
