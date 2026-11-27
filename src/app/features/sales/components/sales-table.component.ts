import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import {
  SaleLedgerRecord,
  SaleLedgerStatus,
  SaleSortField,
  SalesPaymentFilter,
  SalesStatusFilter,
  SalesVoucherFilter,
  SortDirection
} from '../../../core/sales/sales-ledger.models';
import { PaymentMethod, VoucherType } from '../../../core/pos/pos.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const STATUS_BADGE: Record<SaleLedgerStatus, { label: string; css: string }> = {
  reconciled: { label: 'Conciliado', css: 'bg-success-box text-on-success-box' },
  pending: { label: 'Pendiente', css: 'bg-warning-box text-on-warning-box' },
  voided: { label: 'Anulado', css: 'bg-error-box text-on-error-box' }
};

const PAYMENT_META: Record<PaymentMethod, { label: string; icon: string }> = {
  yape: { label: 'Yape', icon: 'qr_code_2' },
  card: { label: 'Tarjeta', icon: 'credit_card' },
  cash: { label: 'Efectivo', icon: 'payments' }
};

const VOUCHER_LABEL: Record<VoucherType, string> = {
  factura: 'Factura',
  boleta: 'Boleta',
  ticket: 'Ticket'
};

/**
 * Enterprise Sales Ledger Data Table with ARIA sortable headers (`aria-sort`),
 * master tri-state `<m3-checkbox [indeterminate]>`, contextual bulk bar,
 * M3 filter chips + `.m3-select-field`, and responsive mobile card stack (`< md`).
 */
@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [
    DatePipe,
    M3ButtonComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3ChipComponent,
    M3TextFieldComponent
  ],
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    app-sales-table .sales-table-scroll {
      container: sales-table / inline-size;
      max-inline-size: 100%;
      overflow-x: auto;
    }

    app-sales-table .sales-date-part + .sales-date-part::before {
      content: ' ';
    }

    @container sales-table (inline-size < 780px) {
      app-sales-table .sales-table th,
      app-sales-table .sales-table td {
        padding-inline: 0.375rem;
        padding-block: 0.5rem;
      }

      app-sales-table .sales-col-check {
        inline-size: 2.25rem;
      }

      app-sales-table .sales-voucher-sub {
        max-inline-size: 7.75rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      app-sales-table .sales-date-part {
        display: block;
        line-height: 1.2;
      }

      app-sales-table .sales-date-part + .sales-date-part {
        font-size: 0.625rem;
        opacity: 0.8;
      }

      app-sales-table .sales-date-part + .sales-date-part::before {
        content: none;
      }

      app-sales-table .sales-client-cell {
        max-inline-size: 7.25rem;
      }

      app-sales-table .sales-hide-narrow {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      app-sales-table .sales-table-scroll .sales-reconcile-btn.m3-btn {
        padding-inline: 0.5rem;
      }

      app-sales-table .sales-table-scroll .sales-inspect-btn.m3-btn {
        inline-size: 28px;
        block-size: 28px;
        padding: 0;
        gap: 0;
        justify-content: center;
      }
    }
  `],
  template: `
    <m3-card variant="outlined" padding="md" shape="xl" customClass="space-y-4">
      <!-- TOOLBAR: BUSCADOR + CHIPS DE ESTADO + SELECTORES -->
      <div class="space-y-3">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <div class="lg:col-span-6">
            <m3-text-field
              label="Buscar comprobante, cliente, DNI/RUC o código Yape"
              placeholder="Ej: F001-000841, Valeria, YP-948..."
              variant="outlined"
              icon="search"
              [clearable]="true"
              [value]="searchQuery()"
              (valueChange)="searchChange.emit($event)" />
          </div>

          <div class="lg:col-span-3 space-y-1">
            <label for="sales-payment-select" class="text-label-sm-emphasized text-muted block">
              Medio de pago
            </label>
            <select
              id="sales-payment-select"
              class="m3-select-field w-full"
              [value]="paymentFilter()"
              (change)="onPaymentSelect($event)">
              <option value="all">Todos los medios</option>
              <option value="yape">Yape / Plin QR</option>
              <option value="card">Tarjeta POS</option>
              <option value="cash">Efectivo</option>
            </select>
          </div>

          <div class="lg:col-span-3 space-y-1">
            <label for="sales-voucher-select" class="text-label-sm-emphasized text-muted block">
              Comprobante
            </label>
            <select
              id="sales-voucher-select"
              class="m3-select-field w-full"
              [value]="voucherFilter()"
              (change)="onVoucherSelect($event)">
              <option value="all">Todos los tipos</option>
              <option value="factura">Factura (F001)</option>
              <option value="boleta">Boleta (B001)</option>
              <option value="ticket">Ticket (T001)</option>
            </select>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar ventas por estado">
            <m3-chip type="filter" [selected]="statusFilter() === 'all'" (action)="statusFilterChange.emit('all')">
              Todos
            </m3-chip>
            <m3-chip type="filter" [selected]="statusFilter() === 'pending'" (action)="statusFilterChange.emit('pending')">
              Pendientes
            </m3-chip>
            <m3-chip type="filter" [selected]="statusFilter() === 'reconciled'" (action)="statusFilterChange.emit('reconciled')">
              Conciliados
            </m3-chip>
            <m3-chip type="filter" [selected]="statusFilter() === 'voided'" (action)="statusFilterChange.emit('voided')">
              Anulados
            </m3-chip>
          </div>

          @if (searchQuery() || statusFilter() !== 'all' || paymentFilter() !== 'all' || voucherFilter() !== 'all') {
            <m3-button variant="text" size="xs" icon="filter_alt_off" (action)="resetFilters.emit()">
              Limpiar filtros
            </m3-button>
          }
        </div>
      </div>

      <!-- CONTEXTUAL BULK ACTION BAR -->
      @if (selectedVisibleCount() > 0) {
        <div
          class="p-3 rounded-m3-lg bg-primary-box/55 border border-primary/25 flex flex-wrap items-center justify-between gap-3 m3-anim-item-in"
          role="region"
          aria-label="Acciones masivas de selección">
          <div class="flex items-center gap-2 text-xs font-bold text-main">
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">checklist</span>
            <span>{{ selectedVisibleCount() }} comprobante(s) seleccionados</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <m3-button
              variant="tonal"
              size="xs"
              icon="task_alt"
              [disabled]="selectedReconcilableCount() === 0"
              (action)="bulkReconcile.emit()">
              Conciliar seleccionados ({{ selectedReconcilableCount() }})
            </m3-button>
            <m3-button variant="text" size="xs" (action)="clearSelection.emit()">
              Deseleccionar
            </m3-button>
          </div>
        </div>
      }

      <!-- SKELETON / ERROR / EMPTY / TABLE+CARDS -->
      @if (isLoading()) {
        <div class="space-y-2.5" aria-label="Cargando historial de ventas">
          <div class="h-12 w-full rounded-m3-md m3-skeleton m3-skeleton-shimmer"></div>
          <div class="h-12 w-full rounded-m3-md m3-skeleton m3-skeleton-shimmer"></div>
          <div class="h-12 w-full rounded-m3-md m3-skeleton m3-skeleton-shimmer"></div>
          <div class="h-12 w-full rounded-m3-md m3-skeleton m3-skeleton-shimmer"></div>
        </div>
      } @else if (records().length === 0) {
        <div class="p-8 text-center rounded-m3-lg bg-surface-low border border-outline-sub space-y-2.5">
          <span class="material-symbols-rounded text-3xl text-muted" aria-hidden="true">receipt_long</span>
          <p class="text-sm font-bold text-main">No hay comprobantes con los filtros actuales.</p>
          <m3-button variant="tonal" size="sm" icon="restart_alt" (action)="resetFilters.emit()">
            Mostrar todo el historial
          </m3-button>
        </div>
      } @else {
        <!-- VISTA MÓVIL (< md): CARDS RESPONSIVE SIN SCROLL HORIZONTAL -->
        <div class="md:hidden space-y-2.5" aria-label="Listado móvil de comprobantes">
          <div class="px-3 py-2 rounded-m3-md bg-surface-low border border-outline-sub flex items-center justify-between gap-2">
            <m3-checkbox
              label="Seleccionar todos"
              [checked]="isAllSelected()"
              [indeterminate]="isSomeSelected()"
              (changed)="toggleAll.emit()" />

            <button
              type="button"
              (click)="sortChange.emit('total')"
              class="touch-target-48 px-2.5 py-1 rounded-m3-full bg-surface text-xs font-bold text-primary flex items-center gap-1 cursor-pointer">
              <span>Orden: {{ sortField() === 'total' ? 'Monto' : 'Fecha' }}</span>
              <span class="material-symbols-rounded text-sm" aria-hidden="true">
                {{ sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
              </span>
            </button>
          </div>

          @for (row of records(); track row.id) {
            <m3-card
              variant="filled"
              [surface]="selectedRecordId() === row.id ? 'high' : 'low'"
              [interactive]="false"
              padding="sm"
              shape="lg"
              [customClass]="selectedRecordId() === row.id ? 'ring-2 ring-primary space-y-2.5' : 'space-y-2.5'">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-2 min-w-0">
                  <m3-checkbox
                    [ariaLabel]="'Seleccionar ' + row.saleId"
                    [checked]="isRowSelected(row.id)"
                    (changed)="toggleRow.emit(row.id)" />
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-1.5">
                      <span class="text-xs font-mono font-bold text-primary">{{ row.saleId }}</span>
                      @if (row.fromLivePos) {
                        <span class="px-1.5 py-0.5 rounded-m3-full bg-primary text-on-primary text-[9px] font-bold uppercase">
                          POS Vivo
                        </span>
                      }
                    </div>
                    <div class="text-xs font-bold text-main truncate">{{ row.customerName }}</div>
                    <div class="text-[11px] text-muted font-mono">
                      {{ row.dateIso | date: 'dd/MM HH:mm' }} · {{ paymentMeta(row.paymentMethod).label }}
                    </div>
                  </div>
                </div>

                <div class="text-end shrink-0 space-y-1">
                  <div class="text-sm font-mono font-extrabold text-main tabular-nums">
                    S/ {{ row.total.toFixed(2) }}
                  </div>
                  <span [class]="'inline-block px-2 py-0.5 rounded-m3-full text-[10px] font-bold ' + statusMeta(row.status).css">
                    {{ row.syncing ? 'Sincronizando...' : statusMeta(row.status).label }}
                  </span>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-outline-sub/60">
                @if (row.status !== 'voided') {
                  <m3-button
                    variant="outlined"
                    size="xs"
                    [icon]="row.status === 'reconciled' ? 'undo' : 'check'"
                    [disabled]="!!row.syncing"
                    (action)="toggleReconcile.emit(row)">
                    {{ row.status === 'reconciled' ? 'Reabrir' : 'Conciliar' }}
                  </m3-button>
                }
                <m3-button
                  variant="tonal"
                  size="xs"
                  icon="visibility"
                  (action)="inspectRow.emit(row)">
                  Detalle
                </m3-button>
              </div>
            </m3-card>
          }
        </div>

        <!-- VISTA ESCRITORIO/TABLET (>= md): DATA TABLE ENTERPRISE SEMÁNTICA -->
        <div
          tabindex="0"
          role="region"
          aria-label="Tabla de comprobantes y conciliación"
          class="sales-table-scroll hidden md:block m3-scrollbar rounded-m3-lg border border-outline-sub">
          <table class="sales-table w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-surface-low border-b border-outline-sub text-label-sm-emphasized uppercase tracking-wider text-muted">
                <th scope="col" class="sales-col-check py-2.5 px-3 w-12">
                  <m3-checkbox
                    ariaLabel="Seleccionar todos los comprobantes visibles"
                    [checked]="isAllSelected()"
                    [indeterminate]="isSomeSelected()"
                    (changed)="toggleAll.emit()" />
                </th>
                <th scope="col" class="py-2.5 px-3" [attr.aria-sort]="ariaSortFor('saleId')">
                  <button
                    type="button"
                    (click)="sortChange.emit('saleId')"
                    class="focus-ring-m3 touch-target-48 inline-flex items-center gap-1 font-bold uppercase cursor-pointer hover:text-main">
                    <span>Comprobante</span>
                    <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ sortIconFor('saleId') }}</span>
                  </button>
                </th>
                <th scope="col" class="py-2.5 px-3" [attr.aria-sort]="ariaSortFor('date')">
                  <button
                    type="button"
                    (click)="sortChange.emit('date')"
                    class="focus-ring-m3 touch-target-48 inline-flex items-center gap-1 font-bold uppercase cursor-pointer hover:text-main">
                    <span>Fecha</span>
                    <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ sortIconFor('date') }}</span>
                  </button>
                </th>
                <th scope="col" class="py-2.5 px-3">Cliente</th>
                <th scope="col" class="py-2.5 px-3">Pago</th>
                <th scope="col" class="py-2.5 px-3 text-end" [attr.aria-sort]="ariaSortFor('total')">
                  <button
                    type="button"
                    (click)="sortChange.emit('total')"
                    class="focus-ring-m3 touch-target-48 inline-flex items-center gap-1 font-bold uppercase cursor-pointer hover:text-main ms-auto">
                    <span>Total</span>
                    <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ sortIconFor('total') }}</span>
                  </button>
                </th>
                <th scope="col" class="py-2.5 px-3" [attr.aria-sort]="ariaSortFor('status')">
                  <button
                    type="button"
                    (click)="sortChange.emit('status')"
                    class="focus-ring-m3 touch-target-48 inline-flex items-center gap-1 font-bold uppercase cursor-pointer hover:text-main">
                    <span>Estado</span>
                    <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ sortIconFor('status') }}</span>
                  </button>
                </th>
                <th scope="col" class="py-2.5 px-3 text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              @for (row of records(); track row.id) {
                <tr
                  [class]="selectedRecordId() === row.id
                    ? 'bg-primary-box/30 border-b border-outline-sub transition-colors'
                    : 'hover:bg-surface-low border-b border-outline-sub/70 transition-colors'">
                  <td class="sales-col-check py-2 px-3">
                    <m3-checkbox
                      [ariaLabel]="'Seleccionar ' + row.saleId"
                      [checked]="isRowSelected(row.id)"
                      (changed)="toggleRow.emit(row.id)" />
                  </td>
                  <td class="py-2 px-3 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono font-bold text-primary">{{ row.saleId }}</span>
                      @if (row.fromLivePos) {
                        <span class="px-1.5 py-0.5 rounded-m3-full bg-primary text-on-primary text-[9px] font-bold">
                          POS
                        </span>
                      }
                    </div>
                    <div class="sales-voucher-sub text-[10px] text-muted">{{ voucherLabel(row.voucherType) }} · {{ row.orderCode }}</div>
                  </td>
                  <td class="py-2 px-3 font-mono text-muted whitespace-nowrap tabular-nums">
                    <span class="sales-date-part">{{ row.dateIso | date: 'dd/MM' }}</span><span class="sales-date-part">{{ row.dateIso | date: 'HH:mm' }}</span>
                  </td>
                  <td class="py-2 px-3">
                    <div class="sales-client-cell max-w-[200px] min-w-0" [title]="row.customerName + ' · ' + row.customerDoc">
                      <div class="font-semibold text-main truncate">{{ row.customerName }}</div>
                      <div class="text-[10px] font-mono text-muted truncate">{{ row.customerDoc }}</div>
                    </div>
                  </td>
                  <td class="py-2 px-3 whitespace-nowrap">
                    <span
                      class="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-sm bg-surface-high text-main font-medium"
                      [title]="paymentMeta(row.paymentMethod).label">
                      <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">
                        {{ paymentMeta(row.paymentMethod).icon }}
                      </span>
                      <span class="sales-hide-narrow">{{ paymentMeta(row.paymentMethod).label }}</span>
                    </span>
                  </td>
                  <td class="py-2 px-3 text-end font-mono font-bold text-main tabular-nums whitespace-nowrap">
                    S/ {{ row.total.toFixed(2) }}
                  </td>
                  <td class="py-2 px-3 whitespace-nowrap">
                    <span [class]="'px-2 py-0.5 rounded-m3-full text-[10px] font-bold ' + statusMeta(row.status).css">
                      {{ row.syncing ? 'Sincronizando...' : statusMeta(row.status).label }}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-end whitespace-nowrap">
                    <div class="inline-flex items-center gap-1">
                      @if (row.status !== 'voided') {
                        <m3-button
                          variant="text"
                          size="xs"
                          customClass="sales-reconcile-btn"
                          [icon]="row.status === 'reconciled' ? 'undo' : 'check'"
                          [disabled]="!!row.syncing"
                          (action)="toggleReconcile.emit(row)">
                          {{ row.status === 'reconciled' ? 'Reabrir' : 'Conciliar' }}
                        </m3-button>
                      }
                      <m3-button
                        variant="tonal"
                        size="xs"
                        icon="visibility"
                        customClass="sales-inspect-btn relative"
                        [attr.title]="'Ver detalle de ' + row.saleId"
                        [ariaLabel]="'Ver detalle de ' + row.saleId"
                        (action)="inspectRow.emit(row)">
                        <span class="sales-hide-narrow">Ver</span>
                      </m3-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </m3-card>
  `
})
export class SalesTableComponent {
  readonly records = input.required<readonly SaleLedgerRecord[]>();
  readonly selectedIds = input.required<ReadonlySet<string>>();
  readonly selectedRecordId = input<string | null>(null);
  readonly isAllSelected = input<boolean>(false);
  readonly isSomeSelected = input<boolean>(false);
  readonly selectedVisibleCount = input<number>(0);
  readonly selectedReconcilableCount = input<number>(0);
  readonly isLoading = input<boolean>(false);

  readonly searchQuery = input<string>('');
  readonly statusFilter = input<SalesStatusFilter>('all');
  readonly paymentFilter = input<SalesPaymentFilter>('all');
  readonly voucherFilter = input<SalesVoucherFilter>('all');
  readonly sortField = input<SaleSortField>('date');
  readonly sortDirection = input<SortDirection>('desc');

  readonly searchChange = output<string>();
  readonly statusFilterChange = output<SalesStatusFilter>();
  readonly paymentFilterChange = output<SalesPaymentFilter>();
  readonly voucherFilterChange = output<SalesVoucherFilter>();
  readonly sortChange = output<SaleSortField>();
  readonly toggleRow = output<string>();
  readonly toggleAll = output<void>();
  readonly clearSelection = output<void>();
  readonly bulkReconcile = output<void>();
  readonly toggleReconcile = output<SaleLedgerRecord>();
  readonly inspectRow = output<SaleLedgerRecord>();
  readonly resetFilters = output<void>();

  isRowSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  statusMeta(status: SaleLedgerStatus): { label: string; css: string } {
    return STATUS_BADGE[status];
  }

  paymentMeta(method: PaymentMethod): { label: string; icon: string } {
    return PAYMENT_META[method];
  }

  voucherLabel(voucher: VoucherType): string {
    return VOUCHER_LABEL[voucher];
  }

  ariaSortFor(field: SaleSortField): 'ascending' | 'descending' | 'none' {
    if (this.sortField() !== field) return 'none';
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  sortIconFor(field: SaleSortField): string {
    if (this.sortField() !== field) return 'swap_vert';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  onPaymentSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as SalesPaymentFilter;
    this.paymentFilterChange.emit(val);
  }

  onVoucherSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as SalesVoucherFilter;
    this.voucherFilterChange.emit(val);
  }
}
