import { PaymentMethod, VoucherType } from '../pos/pos.service';

export type SaleLedgerStatus = 'reconciled' | 'pending' | 'voided';
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
