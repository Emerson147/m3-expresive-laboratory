import { SalesPeriodFilter } from '../sales/sales-ledger.models';

export type FinancePeriodFilter = SalesPeriodFilter;
export type FinanceExpenseCategory =
  | 'payroll'
  | 'rent'
  | 'utilities'
  | 'marketing'
  | 'maintenance'
  | 'supplies';
export type FinanceExpenseRecurrence = 'monthly-fixed' | 'variable-event';
export type FinanceExpenseFilter = 'all' | FinanceExpenseRecurrence;
export type FinanceProductCategory = 'coffee' | 'sandwiches' | 'pastries' | 'drinks';

export interface FinanceExpenseRecord {
  readonly id: string;
  readonly title: string;
  readonly category: FinanceExpenseCategory;
  readonly recurrence: FinanceExpenseRecurrence;
  readonly amount: number;
  readonly dateIso: string;
  readonly receiptRef?: string;
  readonly syncing?: boolean;
}

export interface CreateFinanceExpenseDto {
  readonly title: string;
  readonly category: FinanceExpenseCategory;
  readonly recurrence: FinanceExpenseRecurrence;
  readonly amount: number;
  readonly receiptRef?: string;
}

export interface FinanceSimulationConfig {
  readonly priceDeltaPercent: number;
  readonly cogsDeltaPercent: number;
  readonly opexDeltaPercent: number;
}

export interface FinanceCategoryPerformance {
  readonly category: FinanceProductCategory;
  readonly label: string;
  readonly icon: string;
  readonly unitsSold: number;
  readonly revenueExTax: number;
  readonly cogs: number;
  readonly grossProfit: number;
  readonly marginPercent: number;
  readonly revenueSharePercent: number;
}

export interface FinancePnlSummary {
  readonly activeSalesCount: number;
  readonly voidedSalesCount: number;
  readonly grossCollectedWithTax: number;
  readonly igvLiability: number;
  readonly netRevenueExTax: number;
  readonly totalCogs: number;
  readonly grossProfit: number;
  readonly grossMarginPercent: number;
  readonly fixedOpEx: number;
  readonly variableOpEx: number;
  readonly totalOpEx: number;
  readonly netProfit: number;
  readonly netMarginPercent: number;
  readonly breakEvenRevenue: number;
  readonly breakEvenCoveragePercent: number;
  readonly isProfitable: boolean;
  readonly categories: readonly FinanceCategoryPerformance[];
}

export interface FinanceSimulatedSummary {
  readonly projectedRevenue: number;
  readonly projectedCogs: number;
  readonly projectedGrossProfit: number;
  readonly projectedOpEx: number;
  readonly projectedNetProfit: number;
  readonly projectedNetMarginPercent: number;
  readonly projectedBreakEven: number;
  readonly profitDelta: number;
  readonly isProjectedProfitable: boolean;
  readonly isModified: boolean;
}

export interface FinanceToastPayload {
  readonly message: string;
  readonly actionLabel?: string | null;
  readonly onAction?: () => void;
}

export const FINANCE_EXPENSE_CATEGORY_META: Record<
  FinanceExpenseCategory,
  { readonly label: string; readonly icon: string }
> = {
  payroll: { label: 'Planilla & Turnos', icon: 'groups' },
  rent: { label: 'Alquiler Local', icon: 'storefront' },
  utilities: { label: 'Servicios & Pasarela', icon: 'bolt' },
  marketing: { label: 'Marketing & Delivery', icon: 'campaign' },
  maintenance: { label: 'Mantenimiento', icon: 'build' },
  supplies: { label: 'Insumos & Empaques', icon: 'inventory' }
};

export const FINANCE_PRODUCT_CATEGORY_META: Record<
  FinanceProductCategory,
  { readonly label: string; readonly icon: string }
> = {
  coffee: { label: 'Cafetería', icon: 'local_cafe' },
  sandwiches: { label: 'Sandwiches', icon: 'lunch_dining' },
  pastries: { label: 'Pastelería', icon: 'cookie' },
  drinks: { label: 'Bebidas', icon: 'glass_cup' }
};

export const FINANCE_PERIOD_PRORATE_FACTOR: Record<FinancePeriodFilter, number> = {
  today: 1 / 30,
  week: 7 / 30,
  month: 1
};
