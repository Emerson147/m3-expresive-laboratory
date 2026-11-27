import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SalesPeriodFilter } from '../../../core/sales/sales-ledger.models';
import { M3ButtonAnchorComponent, M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';

export interface SalesPeriodOption {
  readonly value: SalesPeriodFilter;
  readonly label: string;
  readonly summaryLabel: string;
}

export const SALES_PERIOD_OPTIONS: readonly SalesPeriodOption[] = [
  { value: 'today', label: 'Hoy', summaryLabel: 'Hoy' },
  { value: 'week', label: '7 días', summaryLabel: 'Últimos 7 días' },
  { value: 'month', label: '30 días', summaryLabel: 'Últimos 30 días' }
];

export function getSalesPeriodSummaryLabel(period: SalesPeriodFilter): string {
  return SALES_PERIOD_OPTIONS.find((opt) => opt.value === period)?.summaryLabel ?? 'Últimos 30 días';
}

/**
 * Command header for the Sales History & Audit workbench.
 * Keeps a single primary Filled CTA alongside tonal/outlined support controls and Daily/Weekly/Monthly period filtering.
 */
@Component({
  selector: 'app-sales-header',
  standalone: true,
  imports: [RouterLink, M3ButtonAnchorComponent, M3ButtonComponent, M3ChipComponent],
  host: { class: 'block shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-surface-low rounded-m3-xl px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-4">
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-2xl" aria-hidden="true">receipt_long</span>
          </div>

          <div class="min-w-0">
            <span class="text-label-sm-emphasized uppercase tracking-wider text-primary block">
              Caja, Facturación &amp; Auditoría
            </span>
            <h1 class="text-title-lg-emphasized sm:text-headline-sm-emphasized text-main truncate mt-0.5">
              Historial de Ventas &amp; Comprobantes
            </h1>
            <p class="text-body-sm text-muted truncate">
              CAJA-01 · {{ periodSummaryLabel() }} · {{ totalCount() }} comprobantes · {{ pendingCount() }} por conciliar
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center touch-gap-8 shrink-0">
          <a
            m3-button
            variant="tonal"
            size="sm"
            icon="point_of_sale"
            routerLink="/pos">
            Ir a POS
          </a>

          <m3-button
            variant="outlined"
            size="sm"
            icon="download"
            (action)="exportCsv.emit()">
            Exportar CSV
          </m3-button>

          <m3-button
            variant="filled"
            size="md"
            icon="task_alt"
            [disabled]="pendingCount() === 0 && selectedReconcilableCount() === 0"
            (action)="reconcileAction.emit()">
            {{
              selectedReconcilableCount() > 0
                ? 'Conciliar Lote (' + selectedReconcilableCount() + ')'
                : 'Conciliar Pendientes (' + pendingCount() + ')'
            }}
          </m3-button>
        </div>
      </div>

      <div class="border-t border-outline-sub pt-3 flex flex-wrap items-center justify-between gap-3">
        <div
          class="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrar ventas por período">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted mr-1">
            Período
          </span>
          @for (opt of periodOptions; track opt.value) {
            <m3-chip
              type="filter"
              [selected]="periodFilter() === opt.value"
              (action)="periodChange.emit(opt.value)">
              {{ opt.label }}
            </m3-chip>
          }
        </div>

        <span class="text-label-sm text-muted">
          Mostrando comprobantes y cuadre de caja: {{ periodSummaryLabel() }}
        </span>
      </div>
    </header>
  `
})
export class SalesHeaderComponent {
  readonly periodOptions = SALES_PERIOD_OPTIONS;

  readonly totalCount = input<number>(0);
  readonly pendingCount = input<number>(0);
  readonly selectedReconcilableCount = input<number>(0);
  readonly periodFilter = input<SalesPeriodFilter>('month');

  readonly periodSummaryLabel = computed(() => getSalesPeriodSummaryLabel(this.periodFilter()));

  readonly exportCsv = output<void>();
  readonly reconcileAction = output<void>();
  readonly periodChange = output<SalesPeriodFilter>();
}
