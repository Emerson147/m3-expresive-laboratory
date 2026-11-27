import { SaleLedgerRecord } from '../sales/sales-ledger.models';
import { CreateFinanceExpenseDto, FinanceExpenseRecord } from './finance.models';

export interface FinanceSnapshotPayload {
  readonly sales: readonly SaleLedgerRecord[];
  readonly expenses: readonly FinanceExpenseRecord[];
}

/**
 * Clean Architecture Domain Port for Financial Analytics, P&L Computation, and Expense Ledger mutations.
 */
export abstract class FinancePort {
  abstract loadFinancialData(): Promise<FinanceSnapshotPayload>;

  abstract createExpense(
    dto: CreateFinanceExpenseDto,
    simulateError?: boolean
  ): Promise<FinanceExpenseRecord>;

  abstract deleteExpense(id: string, simulateError?: boolean): Promise<void>;

  abstract restoreExpense(expense: FinanceExpenseRecord, simulateError?: boolean): Promise<void>;
}
