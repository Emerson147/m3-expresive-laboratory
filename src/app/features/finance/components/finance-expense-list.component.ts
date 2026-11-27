import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  FINANCE_EXPENSE_CATEGORY_META,
  FinanceExpenseCategory,
  FinanceExpenseFilter,
  FinanceExpenseRecord,
  FinancePeriodFilter
} from '../../../core/finance/finance.models';
import { effectiveExpenseForPeriod } from '../../../core/finance/finance.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';

/**
 * Operating Expense (OpEx) Ledger Card showing prorated monthly overhead vs period variable expenses.
 */
@Component({
  selector: 'app-finance-expense-list',
  standalone: true,
  imports: [DatePipe, M3ButtonComponent, M3CardComponent, M3ChipComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="md" shape="xl" customClass="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-outline-sub pb-3">
        <div>
          <h2 class="text-title-md-emphasized text-main">
            Gastos Operativos del Período (OpEx)
          </h2>
          <p class="text-body-sm text-muted">
            Costos fijos prorrateados a {{ periodLabel() }} más egresos puntuales registrados
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar gastos por tipo">
          <m3-chip
            type="filter"
            [selected]="expenseFilter() === 'all'"
            (action)="filterChange.emit('all')">
            Todos
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="expenseFilter() === 'monthly-fixed'"
            (action)="filterChange.emit('monthly-fixed')">
            Fijos
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="expenseFilter() === 'variable-event'"
            (action)="filterChange.emit('variable-event')">
            Variables
          </m3-chip>
        </div>
      </div>

      @if (expenses().length === 0) {
        <div class="p-6 text-center rounded-m3-lg bg-surface-low border border-outline-sub space-y-2">
          <span class="material-symbols-rounded text-2xl text-muted" aria-hidden="true">receipt</span>
          <p class="text-xs font-semibold text-main">No hay gastos en esta vista para el período.</p>
        </div>
      } @else {
        <ul class="space-y-2.5">
          @for (item of expenses(); track item.id) {
            <li class="p-3 rounded-m3-lg bg-surface-low flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-9 h-9 rounded-m3-md bg-surface-high text-primary grid place-items-center shrink-0">
                  <span class="material-symbols-rounded text-lg" aria-hidden="true">
                    {{ categoryMeta(item.category).icon }}
                  </span>
                </span>

                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-bold text-main truncate">{{ item.title }}</span>
                    <span
                      [class]="item.recurrence === 'monthly-fixed'
                        ? 'px-2 py-0.5 rounded-m3-full bg-secondary-box text-on-secondary-box text-[10px] font-bold'
                        : 'px-2 py-0.5 rounded-m3-full bg-surface-high text-main text-[10px] font-bold'">
                      {{ item.recurrence === 'monthly-fixed' ? 'Fijo prorrateado' : 'Variable' }}
                    </span>
                  </div>
                  <div class="text-[11px] text-muted font-mono truncate">
                    {{ categoryMeta(item.category).label }}
                    · {{ item.dateIso | date: 'dd/MM' }}
                    @if (item.receiptRef) {
                      · {{ item.receiptRef }}
                    }
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0 ms-auto">
                <div class="text-end font-mono tabular-nums">
                  <div class="text-xs font-extrabold text-main">
                    -S/ {{ proratedAmount(item).toFixed(2) }}
                  </div>
                  @if (item.recurrence === 'monthly-fixed' && periodFilter() !== 'month') {
                    <div class="text-[10px] text-muted">
                      Base S/ {{ item.amount.toFixed(2) }}/mes
                    </div>
                  }
                </div>

                <m3-button
                  variant="text"
                  size="xs"
                  icon="delete_outline"
                  [iconOnly]="true"
                  [ariaLabel]="'Eliminar gasto ' + item.title"
                  [disabled]="!!item.syncing"
                  (action)="deleteExpense.emit(item)" />
              </div>
            </li>
          }
        </ul>
      }
    </m3-card>
  `
})
export class FinanceExpenseListComponent {
  readonly expenses = input.required<readonly FinanceExpenseRecord[]>();
  readonly periodFilter = input<FinancePeriodFilter>('month');
  readonly periodLabel = input<string>('Últimos 30 días');
  readonly expenseFilter = input<FinanceExpenseFilter>('all');

  readonly filterChange = output<FinanceExpenseFilter>();
  readonly deleteExpense = output<FinanceExpenseRecord>();

  categoryMeta(cat: FinanceExpenseCategory): { readonly label: string; readonly icon: string } {
    return FINANCE_EXPENSE_CATEGORY_META[cat];
  }

  proratedAmount(item: FinanceExpenseRecord): number {
    return effectiveExpenseForPeriod(item, this.periodFilter());
  }
}
