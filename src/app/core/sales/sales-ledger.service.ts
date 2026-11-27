import { Injectable, computed, inject, signal } from '@angular/core';
import { PaymentMethod } from '../pos/pos.service';
import {
  PaymentBreakdownRow,
  SaleLedgerRecord,
  SaleLedgerStatus,
  SaleSortField,
  SalesFiscalSummary,
  SalesPaymentFilter,
  SalesStatusFilter,
  SalesVoucherFilter,
  SortDirection
} from './sales-ledger.models';
import { SalesLedgerPort } from './sales-ledger.port';

export interface SalesToastPayload {
  readonly message: string;
  readonly actionLabel?: string | null;
  readonly onAction?: () => void;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  yape: 'Yape / Plin QR',
  card: 'Tarjeta POS',
  cash: 'Efectivo'
};

const STATUS_RANK: Record<SaleLedgerStatus, number> = {
  pending: 0,
  reconciled: 1,
  voided: 2
};

/**
 * Feature-scoped reactive Signal Store for the Sales History & Audit module.
 * Coordinates sorting, filtering, tri-state selection, fiscal computations, and Optimistic UI
 * backed exclusively by the abstract `SalesLedgerPort`.
 */
@Injectable()
export class SalesLedgerService {
  private readonly port = inject(SalesLedgerPort);

  readonly records = signal<readonly SaleLedgerRecord[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly netError = signal<string | null>(null);
  readonly simulateError503 = signal<boolean>(false);

  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<SalesStatusFilter>('all');
  readonly paymentFilter = signal<SalesPaymentFilter>('all');
  readonly voucherFilter = signal<SalesVoucherFilter>('all');
  readonly sortField = signal<SaleSortField>('date');
  readonly sortDirection = signal<SortDirection>('desc');

  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly selectedSaleId = signal<string | null>(null);
  readonly toastRequest = signal<SalesToastPayload | null>(null);

  readonly filteredRecords = computed<readonly SaleLedgerRecord[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const payment = this.paymentFilter();
    const voucher = this.voucherFilter();

    return this.records().filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (payment !== 'all' && row.paymentMethod !== payment) return false;
      if (voucher !== 'all' && row.voucherType !== voucher) return false;
      if (!query) return true;

      const haystack = `${row.saleId} ${row.orderCode} ${row.customerName} ${row.customerDoc} ${row.yapeCode ?? ''} ${row.cashier}`.toLowerCase();
      return haystack.includes(query);
    });
  });

  readonly sortedRecords = computed<readonly SaleLedgerRecord[]>(() => {
    const field = this.sortField();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    const list = [...this.filteredRecords()];

    return list.sort((a, b) => {
      if (field === 'total') return (a.total - b.total) * dir;
      if (field === 'saleId') return a.saleId.localeCompare(b.saleId) * dir;
      if (field === 'status') return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * dir;
      return (new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()) * dir;
    });
  });

  readonly selectedRecord = computed<SaleLedgerRecord | null>(() => {
    const list = this.sortedRecords();
    if (list.length === 0) return null;
    const explicitId = this.selectedSaleId();
    return list.find((r) => r.id === explicitId) ?? list[0];
  });

  readonly selectedVisibleCount = computed(() => {
    const selected = this.selectedIds();
    return this.sortedRecords().filter((row) => selected.has(row.id)).length;
  });

  readonly isAllVisibleSelected = computed(() => {
    const total = this.sortedRecords().length;
    return total > 0 && this.selectedVisibleCount() === total;
  });

  readonly isSomeVisibleSelected = computed(() => {
    const count = this.selectedVisibleCount();
    return count > 0 && count < this.sortedRecords().length;
  });

  readonly selectedReconcilableIds = computed<readonly string[]>(() => {
    const selected = this.selectedIds();
    return this.records()
      .filter((row) => selected.has(row.id) && row.status === 'pending')
      .map((row) => row.id);
  });

  readonly fiscalSummary = computed<SalesFiscalSummary>(() => {
    const all = this.records();
    const active = all.filter((r) => r.status !== 'voided');

    let totalNetRevenue = 0;
    let totalTaxCollected = 0;
    let totalDiscounts = 0;
    let reconciledCount = 0;
    let pendingCount = 0;
    let voidedCount = 0;

    const buckets = new Map<PaymentMethod, { count: number; total: number }>([
      ['yape', { count: 0, total: 0 }],
      ['card', { count: 0, total: 0 }],
      ['cash', { count: 0, total: 0 }]
    ]);

    for (const row of all) {
      if (row.status === 'reconciled') reconciledCount++;
      else if (row.status === 'pending') pendingCount++;
      else voidedCount++;

      if (row.status === 'voided') continue;

      totalNetRevenue += row.total;
      totalTaxCollected += row.tax;
      totalDiscounts += row.discount;

      const cur = buckets.get(row.paymentMethod)!;
      buckets.set(row.paymentMethod, {
        count: cur.count + 1,
        total: cur.total + row.total
      });
    }

    const round2 = (n: number): number => Number(n.toFixed(2));
    const safeTotal = Math.max(0.01, totalNetRevenue);

    const paymentBreakdown: PaymentBreakdownRow[] = (['yape', 'card', 'cash'] as const).map(
      (method) => {
        const entry = buckets.get(method)!;
        return {
          method,
          label: PAYMENT_LABELS[method],
          count: entry.count,
          total: round2(entry.total),
          sharePercent: Math.round((entry.total / safeTotal) * 100)
        };
      }
    );

    return {
      totalNetRevenue: round2(totalNetRevenue),
      totalTaxCollected: round2(totalTaxCollected),
      totalDiscounts: round2(totalDiscounts),
      activeCount: active.length,
      reconciledCount,
      pendingCount,
      voidedCount,
      paymentBreakdown
    };
  });

  async loadInitialSales(): Promise<void> {
    this.isLoading.set(true);
    this.netError.set(null);
    try {
      const loaded = await this.port.loadSales();
      this.records.set(loaded);
      if (loaded.length > 0 && !this.selectedSaleId()) {
        this.selectedSaleId.set(loaded[0].id);
      }
    } catch {
      this.netError.set('No se pudieron cargar los comprobantes desde SalesLedgerPort.');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleSort(field: SaleSortField): void {
    if (this.sortField() === field) {
      this.sortDirection.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    this.sortField.set(field);
    this.sortDirection.set(field === 'saleId' || field === 'status' ? 'asc' : 'desc');
  }

  selectRowForDetail(id: string): void {
    this.selectedSaleId.set(id);
  }

  toggleRowSelection(id: string): void {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAllVisibleSelection(): void {
    const visible = this.sortedRecords();
    const allSelected = this.isAllVisibleSelected();
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const row of visible) next.delete(row.id);
      } else {
        for (const row of visible) next.add(row.id);
      }
      return next;
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.paymentFilter.set('all');
    this.voucherFilter.set('all');
  }

  async toggleReconcile(record: SaleLedgerRecord): Promise<void> {
    if (record.status === 'voided' || record.syncing) return;
    const nextStatus: SaleLedgerStatus = record.status === 'reconciled' ? 'pending' : 'reconciled';
    const snapshot = this.records().map((r) => ({ ...r, syncing: false }));
    const simulateFail = this.simulateError503();

    this.records.update((list) =>
      list.map((r) => (r.id === record.id ? { ...r, status: nextStatus, syncing: true } : r))
    );

    try {
      await this.port.updateSaleStatus(record.id, nextStatus, simulateFail);
      this.records.update((list) =>
        list.map((r) => (r.id === record.id ? { ...r, syncing: false } : r))
      );
      this.toastRequest.set({
        message: `${record.saleId} marcado como ${nextStatus === 'reconciled' ? 'Conciliado' : 'Pendiente'}`,
        actionLabel: 'Deshacer',
        onAction: () => {
          this.records.set(snapshot);
        }
      });
    } catch {
      this.records.set(snapshot);
      this.toastRequest.set({
        message: `Error 503 al actualizar ${record.saleId}: Rollback aplicado`,
        actionLabel: 'Reintentar',
        onAction: () => {
          void this.toggleReconcile(record);
        }
      });
    }
  }

  async bulkReconcilePending(targetIds?: readonly string[]): Promise<void> {
    const ids =
      targetIds ??
      (this.selectedReconcilableIds().length > 0
        ? this.selectedReconcilableIds()
        : this.records()
            .filter((r) => r.status === 'pending')
            .map((r) => r.id));

    if (ids.length === 0) {
      this.toastRequest.set({ message: 'No hay comprobantes pendientes por conciliar' });
      return;
    }

    const idSet = new Set(ids);
    const snapshot = this.records().map((r) => ({ ...r, syncing: false }));
    const simulateFail = this.simulateError503();

    this.records.update((list) =>
      list.map((r) => (idSet.has(r.id) ? { ...r, status: 'reconciled', syncing: true } : r))
    );

    try {
      await this.port.bulkReconcile(ids, simulateFail);
      this.records.update((list) =>
        list.map((r) => (idSet.has(r.id) ? { ...r, syncing: false } : r))
      );
      this.clearSelection();
      this.toastRequest.set({
        message: `${ids.length} comprobante(s) conciliados correctamente`,
        actionLabel: 'Deshacer',
        onAction: () => {
          this.records.set(snapshot);
        }
      });
    } catch {
      this.records.set(snapshot);
      this.toastRequest.set({
        message: 'Error 503 en conciliación masiva: se restauró el estado previo',
        actionLabel: 'Reintentar',
        onAction: () => {
          void this.bulkReconcilePending(ids);
        }
      });
    }
  }

  async voidSale(record: SaleLedgerRecord, reason: string): Promise<boolean> {
    const cleanReason = reason.trim();
    if (record.status === 'voided' || cleanReason.length < 5) return false;

    const snapshot = this.records().map((r) => ({ ...r, syncing: false }));
    const simulateFail = this.simulateError503();

    this.records.update((list) =>
      list.map((r) =>
        r.id === record.id
          ? { ...r, status: 'voided', voidReason: cleanReason, syncing: true }
          : r
      )
    );

    try {
      await this.port.updateSaleStatus(record.id, 'voided', simulateFail, cleanReason);
      this.records.update((list) =>
        list.map((r) => (r.id === record.id ? { ...r, syncing: false } : r))
      );
      this.toastRequest.set({
        message: `Nota de crédito emitida para ${record.saleId}`,
        actionLabel: 'Deshacer',
        onAction: () => {
          this.records.set(snapshot);
        }
      });
      return true;
    } catch {
      this.records.set(snapshot);
      this.toastRequest.set({
        message: `Error 503 al anular ${record.saleId}: Rollback aplicado`,
        actionLabel: 'Reintentar',
        onAction: () => {
          void this.voidSale(record, cleanReason);
        }
      });
      return false;
    }
  }

  buildCsvExport(): string {
    const escapeCsv = (val: string | number): string => `"${String(val).replaceAll('"', '""')}"`;
    const headers = ['Comprobante', 'Orden', 'Fecha', 'Cliente', 'Documento', 'Pago', 'Subtotal', 'IGV', 'Total', 'Estado'];
    const lines = this.sortedRecords().map((r) =>
      [
        r.saleId,
        r.orderCode,
        r.dateIso,
        r.customerName,
        r.customerDoc,
        PAYMENT_LABELS[r.paymentMethod],
        r.subtotal.toFixed(2),
        r.tax.toFixed(2),
        r.total.toFixed(2),
        r.status
      ]
        .map(escapeCsv)
        .join(',')
    );
    return [headers.join(','), ...lines].join('\n');
  }
}
