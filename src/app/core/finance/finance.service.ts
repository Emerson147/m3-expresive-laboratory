import { Injectable, computed, inject, signal } from '@angular/core';
import {
  SaleLedgerRecord,
  matchesPeriodWindow
} from '../sales/sales-ledger.models';
import {
  CreateFinanceExpenseDto,
  FINANCE_PERIOD_PRORATE_FACTOR,
  FINANCE_PRODUCT_CATEGORY_META,
  FinanceCategoryPerformance,
  FinanceExpenseFilter,
  FinanceExpenseRecord,
  FinancePeriodFilter,
  FinancePnlSummary,
  FinanceProductCategory,
  FinanceSimulatedSummary,
  FinanceSimulationConfig,
  FinanceToastPayload
} from './finance.models';
import {
  resolveFinanceProductCategory,
  resolveFinanceUnitCost
} from './finance-local.adapter';
import { FinancePort } from './finance.port';

export const DEFAULT_FINANCE_SIMULATION: FinanceSimulationConfig = {
  priceDeltaPercent: 0,
  cogsDeltaPercent: 0,
  opexDeltaPercent: 0
};

export function roundMoney(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function effectiveExpenseForPeriod(
  expense: FinanceExpenseRecord,
  period: FinancePeriodFilter
): number {
  if (expense.recurrence === 'monthly-fixed') {
    return roundMoney(expense.amount * FINANCE_PERIOD_PRORATE_FACTOR[period]);
  }
  return roundMoney(expense.amount);
}

/**
 * Computes pure P&L accounting metrics for a selected period window:
 * separates SUNAT 18% IGV tax liability from ex-tax net revenue, sums SKU ingredient COGS,
 * prorates monthly fixed overhead vs in-period variable expenses, and computes Break-Even.
 */
export function computeFinancePnlSummary(
  sales: readonly SaleLedgerRecord[],
  expenses: readonly FinanceExpenseRecord[],
  period: FinancePeriodFilter,
  now: Date = new Date()
): FinancePnlSummary {
  const scopedSales = sales.filter((s) => matchesPeriodWindow(s.dateIso, period, now));
  const activeSales = scopedSales.filter((s) => s.status !== 'voided');
  const voidedSalesCount = scopedSales.length - activeSales.length;

  let grossCollectedWithTax = 0;
  let igvLiability = 0;
  let netRevenueExTax = 0;
  let totalCogs = 0;

  const categoryBuckets = new Map<
    FinanceProductCategory,
    { unitsSold: number; revenueExTax: number; cogs: number }
  >([
    ['coffee', { unitsSold: 0, revenueExTax: 0, cogs: 0 }],
    ['sandwiches', { unitsSold: 0, revenueExTax: 0, cogs: 0 }],
    ['pastries', { unitsSold: 0, revenueExTax: 0, cogs: 0 }],
    ['drinks', { unitsSold: 0, revenueExTax: 0, cogs: 0 }]
  ]);

  for (const sale of activeSales) {
    grossCollectedWithTax += sale.total;
    igvLiability += sale.tax;
    netRevenueExTax += sale.subtotal;

    const grossItemsTotal = sale.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const netScale = grossItemsTotal > 0 ? sale.subtotal / grossItemsTotal : 0;

    for (const item of sale.items) {
      const cat = resolveFinanceProductCategory(item.sku);
      const itemNetRev = item.lineTotal * netScale;
      const itemCost = resolveFinanceUnitCost(item.sku, item.unitPrice) * item.quantity;
      totalCogs += itemCost;

      const bucket = categoryBuckets.get(cat)!;
      bucket.unitsSold += item.quantity;
      bucket.revenueExTax += itemNetRev;
      bucket.cogs += itemCost;
    }
  }

  let fixedOpEx = 0;
  let variableOpEx = 0;

  for (const exp of expenses) {
    if (exp.recurrence === 'monthly-fixed') {
      fixedOpEx += effectiveExpenseForPeriod(exp, period);
    } else if (matchesPeriodWindow(exp.dateIso, period, now)) {
      variableOpEx += exp.amount;
    }
  }

  grossCollectedWithTax = roundMoney(grossCollectedWithTax);
  igvLiability = roundMoney(igvLiability);
  netRevenueExTax = roundMoney(netRevenueExTax);
  totalCogs = roundMoney(totalCogs);
  fixedOpEx = roundMoney(fixedOpEx);
  variableOpEx = roundMoney(variableOpEx);

  const totalOpEx = roundMoney(fixedOpEx + variableOpEx);
  const grossProfit = roundMoney(netRevenueExTax - totalCogs);
  const netProfit = roundMoney(grossProfit - totalOpEx);
  const grossMarginPercent =
    netRevenueExTax > 0 ? roundMoney((grossProfit / netRevenueExTax) * 100) : 0;
  const netMarginPercent =
    netRevenueExTax > 0 ? roundMoney((netProfit / netRevenueExTax) * 100) : 0;

  const contributionRatio = netRevenueExTax > 0 ? (netRevenueExTax - totalCogs) / netRevenueExTax : 0;
  const breakEvenRevenue =
    contributionRatio > 0 ? roundMoney(totalOpEx / contributionRatio) : 0;
  const breakEvenCoveragePercent =
    breakEvenRevenue > 0
      ? Math.round((netRevenueExTax / breakEvenRevenue) * 100)
      : netRevenueExTax > 0
        ? 100
        : 0;

  const categories: FinanceCategoryPerformance[] = (
    Object.keys(FINANCE_PRODUCT_CATEGORY_META) as FinanceProductCategory[]
  )
    .map((cat) => {
      const meta = FINANCE_PRODUCT_CATEGORY_META[cat];
      const bucket = categoryBuckets.get(cat)!;
      const revenueExTax = roundMoney(bucket.revenueExTax);
      const cogs = roundMoney(bucket.cogs);
      const catProfit = roundMoney(revenueExTax - cogs);
      const marginPercent = revenueExTax > 0 ? roundMoney((catProfit / revenueExTax) * 100) : 0;
      const revenueSharePercent =
        netRevenueExTax > 0 ? Math.round((revenueExTax / netRevenueExTax) * 100) : 0;

      return {
        category: cat,
        label: meta.label,
        icon: meta.icon,
        unitsSold: bucket.unitsSold,
        revenueExTax,
        cogs,
        grossProfit: catProfit,
        marginPercent,
        revenueSharePercent
      };
    })
    .sort((a, b) => b.grossProfit - a.grossProfit);

  return {
    activeSalesCount: activeSales.length,
    voidedSalesCount,
    grossCollectedWithTax,
    igvLiability,
    netRevenueExTax,
    totalCogs,
    grossProfit,
    grossMarginPercent,
    fixedOpEx,
    variableOpEx,
    totalOpEx,
    netProfit,
    netMarginPercent,
    breakEvenRevenue,
    breakEvenCoveragePercent,
    isProfitable: netProfit >= 0,
    categories
  };
}

/**
 * Pure What-If Simulator projection against actual P&L baseline.
 */
export function computeSimulatedPnl(
  summary: FinancePnlSummary,
  sim: FinanceSimulationConfig
): FinanceSimulatedSummary {
  const isModified =
    sim.priceDeltaPercent !== 0 ||
    sim.cogsDeltaPercent !== 0 ||
    sim.opexDeltaPercent !== 0;

  const projectedRevenue = roundMoney(summary.netRevenueExTax * (1 + sim.priceDeltaPercent / 100));
  const projectedCogs = roundMoney(summary.totalCogs * (1 + sim.cogsDeltaPercent / 100));
  const projectedOpEx = roundMoney(summary.totalOpEx * (1 + sim.opexDeltaPercent / 100));
  const projectedGrossProfit = roundMoney(projectedRevenue - projectedCogs);
  const projectedNetProfit = roundMoney(projectedGrossProfit - projectedOpEx);
  const projectedNetMarginPercent =
    projectedRevenue > 0 ? roundMoney((projectedNetProfit / projectedRevenue) * 100) : 0;

  const contribRatio = projectedRevenue > 0 ? (projectedRevenue - projectedCogs) / projectedRevenue : 0;
  const projectedBreakEven =
    contribRatio > 0 ? roundMoney(projectedOpEx / contribRatio) : 0;

  return {
    projectedRevenue,
    projectedCogs,
    projectedGrossProfit,
    projectedOpEx,
    projectedNetProfit,
    projectedNetMarginPercent,
    projectedBreakEven,
    profitDelta: roundMoney(projectedNetProfit - summary.netProfit),
    isProjectedProfitable: projectedNetProfit >= 0,
    isModified
  };
}

/**
 * Feature-scoped reactive Signal Store for the Financial & P&L Analytics module.
 */
@Injectable()
export class FinanceService {
  private readonly port = inject(FinancePort);

  readonly salesRecords = signal<readonly SaleLedgerRecord[]>([]);
  readonly expenses = signal<readonly FinanceExpenseRecord[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly simulateError = signal<boolean>(false);

  readonly periodFilter = signal<FinancePeriodFilter>('month');
  readonly expenseFilter = signal<FinanceExpenseFilter>('all');
  readonly simulation = signal<FinanceSimulationConfig>(DEFAULT_FINANCE_SIMULATION);
  readonly toastRequest = signal<FinanceToastPayload | null>(null);

  readonly pnlSummary = computed<FinancePnlSummary>(() =>
    computeFinancePnlSummary(this.salesRecords(), this.expenses(), this.periodFilter())
  );

  readonly simulatedSummary = computed<FinanceSimulatedSummary>(() =>
    computeSimulatedPnl(this.pnlSummary(), this.simulation())
  );

  readonly visibleExpenses = computed<readonly FinanceExpenseRecord[]>(() => {
    const period = this.periodFilter();
    const filter = this.expenseFilter();
    const now = new Date();

    return this.expenses()
      .filter((exp) => {
        const inPeriod =
          exp.recurrence === 'monthly-fixed' || matchesPeriodWindow(exp.dateIso, period, now);
        if (!inPeriod) return false;
        if (filter !== 'all' && exp.recurrence !== filter) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.recurrence !== b.recurrence) {
          return a.recurrence === 'variable-event' ? -1 : 1;
        }
        return new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime();
      });
  });

  async loadFinancialData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const payload = await this.port.loadFinancialData();
      this.salesRecords.set(payload.sales);
      this.expenses.set(payload.expenses);
    } finally {
      this.isLoading.set(false);
    }
  }

  setPeriodFilter(period: FinancePeriodFilter): void {
    this.periodFilter.set(period);
  }

  setExpenseFilter(filter: FinanceExpenseFilter): void {
    this.expenseFilter.set(filter);
  }

  updateSimulation(patch: Partial<FinanceSimulationConfig>): void {
    this.simulation.update((current) => ({ ...current, ...patch }));
  }

  resetSimulation(): void {
    this.simulation.set(DEFAULT_FINANCE_SIMULATION);
  }

  proratedAmountFor(expense: FinanceExpenseRecord): number {
    return effectiveExpenseForPeriod(expense, this.periodFilter());
  }

  async addExpense(dto: CreateFinanceExpenseDto): Promise<boolean> {
    const snapshot = this.expenses();
    const tempId = `temp-exp-${Date.now()}`;
    const optimistic: FinanceExpenseRecord = {
      id: tempId,
      title: dto.title.trim(),
      category: dto.category,
      recurrence: dto.recurrence,
      amount: roundMoney(dto.amount),
      dateIso: new Date().toISOString(),
      receiptRef: dto.receiptRef?.trim() || undefined,
      syncing: true
    };

    this.expenses.set([optimistic, ...snapshot]);

    try {
      const persisted = await this.port.createExpense(dto, this.simulateError());
      this.expenses.update((list) =>
        list.map((item) => (item.id === tempId ? persisted : item))
      );
      this.toastRequest.set({
        message: `Gasto "${persisted.title}" (S/ ${persisted.amount.toFixed(2)}) registrado`
      });
      return true;
    } catch {
      this.expenses.set(snapshot);
      this.toastRequest.set({
        message: 'No se pudo registrar el gasto: cambio revertido',
        actionLabel: 'Reintentar',
        onAction: () => {
          void this.addExpense(dto);
        }
      });
      return false;
    }
  }

  async removeExpense(expense: FinanceExpenseRecord): Promise<void> {
    const snapshot = this.expenses();
    this.expenses.set(snapshot.filter((item) => item.id !== expense.id));

    try {
      await this.port.deleteExpense(expense.id, this.simulateError());
      this.toastRequest.set({
        message: `Egreso "${expense.title}" eliminado`,
        actionLabel: 'Deshacer',
        onAction: () => {
          void this.undoDelete(snapshot, expense);
        }
      });
    } catch {
      this.expenses.set(snapshot);
      this.toastRequest.set({
        message: `No se pudo eliminar "${expense.title}": cambio revertido`
      });
    }
  }

  private async undoDelete(
    snapshot: readonly FinanceExpenseRecord[],
    expense: FinanceExpenseRecord
  ): Promise<void> {
    this.expenses.set(snapshot);
    try {
      await this.port.restoreExpense(expense, false);
    } catch {
      // Snapshot state preserved locally if offline undo sync fails
    }
  }
}
