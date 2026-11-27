import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinancePeriodFilter } from '../../../core/finance/finance.models';
import {
  SALES_PERIOD_OPTIONS,
  getSalesPeriodSummaryLabel
} from '../../../core/sales/sales-ledger.models';
import { M3ButtonAnchorComponent, M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';

/**
 * Command Header for Finanzas & Rentabilidad (P&L).
 * Reuses canonical M3 period chips and enforces a single primary Filled CTA.
 */
@Component({
  selector: 'app-finance-header',
  standalone: true,
  imports: [RouterLink, M3ButtonAnchorComponent, M3ButtonComponent, M3ChipComponent],
  host: { class: 'block shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-surface-low rounded-m3-xl px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-4">
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-2xl" aria-hidden="true">monitoring</span>
          </div>

          <div class="min-w-0">
            <span class="text-label-sm-emphasized uppercase tracking-wider text-primary block">
              Control Económico &amp; Margen Real
            </span>
            <h1 class="text-title-lg-emphasized sm:text-headline-sm-emphasized text-main truncate mt-0.5">
              Finanzas &amp; Rentabilidad (P&amp;L)
            </h1>
            <p class="text-body-sm text-muted truncate">
              Base imponible sin IGV · {{ periodSummaryLabel() }} · {{ activeSalesCount() }} ventas activas
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center touch-gap-8 shrink-0">
          <a
            m3-button
            variant="tonal"
            size="sm"
            icon="receipt_long"
            routerLink="/sales">
            Ver Ventas
          </a>

          <m3-button
            variant="filled"
            size="md"
            icon="add_card"
            [invisible]="isDialogOriginInvisible()"
            [viewTransitionName]="isDialogOriginActive() ? 'dialog-transform' : null"
            (action)="openAddExpense.emit()">
            Registrar Gasto
          </m3-button>
        </div>
      </div>

      <div class="border-t border-outline-sub pt-3 flex flex-wrap items-center justify-between gap-3">
        <div
          class="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrar estado de resultados por período">
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

        <span class="text-label-sm text-muted font-mono tabular-nums">
          IGV 18% recaudado (SUNAT): S/ {{ igvLiability().toFixed(2) }}
        </span>
      </div>
    </header>
  `
})
export class FinanceHeaderComponent {
  readonly periodOptions = SALES_PERIOD_OPTIONS;

  readonly periodFilter = input<FinancePeriodFilter>('month');
  readonly activeSalesCount = input<number>(0);
  readonly igvLiability = input<number>(0);
  readonly isDialogOriginActive = input<boolean>(false);
  readonly isDialogOriginInvisible = input<boolean>(false);

  readonly periodSummaryLabel = computed(() => getSalesPeriodSummaryLabel(this.periodFilter()));

  readonly periodChange = output<FinancePeriodFilter>();
  readonly openAddExpense = output<void>();
}
