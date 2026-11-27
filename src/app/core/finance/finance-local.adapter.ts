import { InjectionToken, Injectable, inject } from '@angular/core';
import {
  shiftDaysAgoIso,
  shiftMinutesAgoTodayIso
} from '../sales/sales-ledger.models';
import { SalesLedgerLocalAdapter } from '../sales/sales-ledger-local.adapter';
import {
  CreateFinanceExpenseDto,
  FinanceExpenseRecord,
  FinanceProductCategory
} from './finance.models';
import { FinancePort, FinanceSnapshotPayload } from './finance.port';

export const FINANCE_LATENCY_MS = new InjectionToken<number>('FINANCE_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 65
});

export const FINANCE_SKU_UNIT_COSTS: Readonly<Record<string, number>> = {
  'COF-001': 2.15,
  'COF-002': 3.30,
  'COF-003': 3.85,
  'COF-004': 3.90,
  'SND-001': 7.20,
  'SND-002': 5.95,
  'SND-003': 7.60,
  'PST-001': 3.25,
  'PST-002': 3.70,
  'PST-003': 5.20,
  'DRK-001': 2.40,
  'DRK-002': 4.55
};

const SKU_PREFIX_META: Record<string, { readonly category: FinanceProductCategory; readonly costRatio: number }> = {
  COF: { category: 'coffee', costRatio: 0.28 },
  SND: { category: 'sandwiches', costRatio: 0.39 },
  PST: { category: 'pastries', costRatio: 0.35 },
  DRK: { category: 'drinks', costRatio: 0.31 }
};

export function resolveFinanceProductCategory(sku: string): FinanceProductCategory {
  const prefix = sku.slice(0, 3).toUpperCase();
  return SKU_PREFIX_META[prefix]?.category ?? 'coffee';
}

export function resolveFinanceUnitCost(sku: string, unitPrice: number): number {
  if (sku in FINANCE_SKU_UNIT_COSTS) {
    return FINANCE_SKU_UNIT_COSTS[sku];
  }
  const prefix = sku.slice(0, 3).toUpperCase();
  const ratio = SKU_PREFIX_META[prefix]?.costRatio ?? 0.34;
  return Number(((unitPrice / 1.18) * ratio).toFixed(2));
}

function buildSeededExpenses(): readonly FinanceExpenseRecord[] {
  return [
    // Gastos fijos mensuales (prorrateados según período Hoy / 7 días / 30 días)
    {
      id: 'exp-fixed-rent',
      title: 'Alquiler módulo cafetería (asignado)',
      category: 'rent',
      recurrence: 'monthly-fixed',
      amount: 60.0,
      dateIso: shiftDaysAgoIso(25, 9, 0),
      receiptRef: 'CTR-LOC-04'
    },
    {
      id: 'exp-fixed-payroll',
      title: 'Planilla barista & turno caja',
      category: 'payroll',
      recurrence: 'monthly-fixed',
      amount: 45.0,
      dateIso: shiftDaysAgoIso(20, 9, 30),
      receiptRef: 'PL-2026-11'
    },
    {
      id: 'exp-fixed-utilities',
      title: 'Energía, agua potable & fibra POS',
      category: 'utilities',
      recurrence: 'monthly-fixed',
      amount: 15.0,
      dateIso: shiftDaysAgoIso(18, 10, 0),
      receiptRef: 'S001-88412'
    },
    // Egresos variables registrados en fecha puntual
    {
      id: 'exp-var-ice-milk',
      title: 'Reposición de hielo & leche orgánica',
      category: 'supplies',
      recurrence: 'variable-event',
      amount: 24.5,
      dateIso: shiftMinutesAgoTodayIso(85),
      receiptRef: 'B004-001982'
    },
    {
      id: 'exp-var-pos-fees',
      title: 'Comisiones pasarela tarjeta & Yape',
      category: 'utilities',
      recurrence: 'variable-event',
      amount: 4.5,
      dateIso: shiftMinutesAgoTodayIso(35),
      receiptRef: 'LIQ-POS-2711'
    },
    {
      id: 'exp-var-ads',
      title: 'Campaña promocional combo almuerzo',
      category: 'marketing',
      recurrence: 'variable-event',
      amount: 36.0,
      dateIso: shiftDaysAgoIso(3, 12, 15),
      receiptRef: 'F099-000341'
    },
    {
      id: 'exp-var-packaging',
      title: 'Vasos compostables & bolsas kraft',
      category: 'supplies',
      recurrence: 'variable-event',
      amount: 22.0,
      dateIso: shiftDaysAgoIso(14, 11, 0),
      receiptRef: 'F002-000814'
    }
  ];
}

/**
 * Local Finance Adapter composing real POS/Sales revenue streams with cafe SKU COGS and operating expenses.
 */
@Injectable({
  providedIn: 'root'
})
export class FinanceLocalAdapter extends FinancePort {
  private readonly salesAdapter = inject(SalesLedgerLocalAdapter);
  private readonly latencyMs = inject(FINANCE_LATENCY_MS);
  private expenseCounter = 1;

  override async loadFinancialData(): Promise<FinanceSnapshotPayload> {
    const sales = await this.salesAdapter.loadSales();
    return this.delay({
      sales,
      expenses: buildSeededExpenses()
    });
  }

  override async createExpense(
    dto: CreateFinanceExpenseDto,
    simulateError = false
  ): Promise<FinanceExpenseRecord> {
    await this.delay(undefined);
    if (simulateError) {
      throw new Error('No se pudo registrar el egreso en el libro contable');
    }
    return {
      id: `exp-custom-${this.expenseCounter++}`,
      title: dto.title.trim(),
      category: dto.category,
      recurrence: dto.recurrence,
      amount: Number(dto.amount.toFixed(2)),
      dateIso: new Date().toISOString(),
      receiptRef: dto.receiptRef?.trim() || undefined
    };
  }

  override async deleteExpense(_id: string, simulateError = false): Promise<void> {
    await this.delay(undefined);
    if (simulateError) {
      throw new Error('No se pudo eliminar el egreso');
    }
  }

  override async restoreExpense(_expense: FinanceExpenseRecord, simulateError = false): Promise<void> {
    await this.delay(undefined);
    if (simulateError) {
      throw new Error('No se pudo restaurar el egreso');
    }
  }

  private delay<T>(value: T): Promise<T> {
    if (this.latencyMs <= 0) {
      return Promise.resolve(value);
    }
    return new Promise((resolve) => setTimeout(() => resolve(value), this.latencyMs));
  }
}
