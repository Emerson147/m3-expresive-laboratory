import { SaleLedgerRecord, SaleLedgerStatus } from './sales-ledger.models';

/**
 * Clean Architecture Domain Port for Sales History & Fiscal Ledger operations.
 * Feature components depend strictly on this abstract contract, never on concrete storage/HTTP.
 */
export abstract class SalesLedgerPort {
  abstract loadSales(): Promise<readonly SaleLedgerRecord[]>;

  abstract updateSaleStatus(
    id: string,
    nextStatus: SaleLedgerStatus,
    simulateError: boolean,
    reason?: string
  ): Promise<void>;

  abstract bulkReconcile(ids: readonly string[], simulateError: boolean): Promise<void>;
}
