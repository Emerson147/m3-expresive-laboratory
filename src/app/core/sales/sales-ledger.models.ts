import { PaymentMethod, VoucherType } from '../pos/pos.service';

export type SaleLedgerStatus = 'reconciled' | 'pending' | 'voided';
export type SalesPeriodFilter = 'today' | 'week' | 'month';

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

export function matchesPeriodWindow(dateIso: string, period: SalesPeriodFilter, now: Date = new Date()): boolean {
  const dt = new Date(dateIso);
  if (period === 'today') {
    return (
      dt.getFullYear() === now.getFullYear() &&
      dt.getMonth() === now.getMonth() &&
      dt.getDate() === now.getDate()
    );
  }
  const dayMs = 86_400_000;
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const daysBack = period === 'week' ? 7 : 30;
  return dt.getTime() >= startToday - (daysBack - 1) * dayMs;
}

export function shiftMinutesAgoTodayIso(minutesAgo: number): string {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const candidate = Math.max(startOfDay + 60_000, now.getTime() - minutesAgo * 60_000);
  return new Date(Math.min(now.getTime(), candidate)).toISOString();
}

export function shiftDaysAgoIso(daysAgo: number, hour = 14, minute = 20): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, minute, 0, 0).toISOString();
}
export type SalesStatusFilter = 'all' | SaleLedgerStatus;
export type SalesPaymentFilter = 'all' | PaymentMethod;
export type SalesVoucherFilter = 'all' | VoucherType;
export type SaleSortField = 'date' | 'total' | 'saleId' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SaleLineSummary {
  readonly sku: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
}

export interface SaleLedgerRecord {
  readonly id: string;
  readonly saleId: string;
  readonly orderCode: string;
  readonly dateIso: string;
  readonly voucherType: VoucherType;
  readonly customerName: string;
  readonly customerDoc: string;
  readonly channel: 'dine-in' | 'takeaway' | 'delivery';
  readonly tableNumber?: string;
  readonly paymentMethod: PaymentMethod;
  readonly yapeCode?: string;
  readonly items: readonly SaleLineSummary[];
  readonly subtotal: number;
  readonly tax: number;
  readonly discount: number;
  readonly total: number;
  readonly status: SaleLedgerStatus;
  readonly cashier: string;
  readonly voidReason?: string;
  readonly syncing?: boolean;
  readonly fromLivePos?: boolean;
}

export interface PaymentBreakdownRow {
  readonly method: PaymentMethod;
  readonly label: string;
  readonly count: number;
  readonly total: number;
  readonly sharePercent: number;
}

export interface SalesFiscalSummary {
  readonly totalNetRevenue: number;
  readonly totalTaxCollected: number;
  readonly totalDiscounts: number;
  readonly activeCount: number;
  readonly reconciledCount: number;
  readonly pendingCount: number;
  readonly voidedCount: number;
  readonly paymentBreakdown: readonly PaymentBreakdownRow[];
}
