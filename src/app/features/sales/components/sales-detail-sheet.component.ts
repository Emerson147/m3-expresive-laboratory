import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SaleLedgerRecord } from '../../../core/sales/sales-ledger.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';

/**
 * List-Detail Side Pane displaying itemized voucher breakdown, IGV 18%, payment reference,
 * optimistic reconcile/reopen control, receipt clipboard export, and credit-note dialog trigger.
 */
@Component({
  selector: 'app-sales-detail-sheet',
  standalone: true,
  imports: [DatePipe, M3ButtonComponent, M3CardComponent],
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (record(); as sale) {
      <m3-card variant="filled" surface="low" padding="md" shape="xl" customClass="space-y-4">
        <div class="flex items-start justify-between gap-3 pb-3 border-b border-outline-sub">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[11px] font-mono font-bold">
                {{ sale.saleId }}
              </span>
              <span class="text-xs font-mono text-muted">{{ sale.orderCode }}</span>
            </div>
            <h2 class="text-title-md-emphasized text-main truncate">{{ sale.customerName }}</h2>
            <p class="text-xs text-muted font-mono">
              {{ sale.customerDoc }} · {{ sale.dateIso | date: 'dd/MM/yyyy HH:mm' }}
            </p>
          </div>

          <m3-button
            variant="text"
            size="xs"
            icon="content_copy"
            ariaLabel="Copiar resumen del comprobante"
            (action)="copyReceipt.emit(sale)">
            Copiar
          </m3-button>
        </div>

        @if (sale.status === 'voided' && sale.voidReason) {
          <div class="p-3 rounded-m3-lg bg-error-box/45 border border-error/35 text-xs text-main space-y-1" role="note">
            <div class="font-bold text-error flex items-center gap-1.5">
              <span class="material-symbols-rounded text-base" aria-hidden="true">cancel</span>
              Nota de Crédito Emitida
            </div>
            <p class="text-muted leading-snug">{{ sale.voidReason }}</p>
          </div>
        }

        <!-- Desglose de ítems -->
        <div class="space-y-2">
          <div class="text-label-sm-emphasized uppercase tracking-wider text-muted">
            Detalle de Consumo ({{ sale.items.length }})
          </div>
          <div class="rounded-m3-lg bg-surface-box border border-outline-sub divide-y divide-outline-sub/60">
            @for (line of sale.items; track line.sku) {
              <div class="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <div class="font-semibold text-main truncate">{{ line.name }}</div>
                  <div class="text-[10px] font-mono text-muted">
                    {{ line.sku }} · {{ line.quantity }} × S/ {{ line.unitPrice.toFixed(2) }}
                  </div>
                </div>
                <span class="font-mono font-bold text-main tabular-nums shrink-0">
                  S/ {{ line.lineTotal.toFixed(2) }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Totales fiscales -->
        <div class="p-3.5 rounded-m3-lg bg-surface-box border border-outline-sub space-y-1.5 text-xs font-mono tabular-nums">
          <div class="flex justify-between text-muted">
            <span>Op. Gravada</span>
            <span>S/ {{ sale.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-muted">
            <span>IGV (18%)</span>
            <span>S/ {{ sale.tax.toFixed(2) }}</span>
          </div>
          @if (sale.discount > 0) {
            <div class="flex justify-between text-success">
              <span>Descuento</span>
              <span>-S/ {{ sale.discount.toFixed(2) }}</span>
            </div>
          }
          <div class="flex justify-between pt-2 border-t border-outline-sub text-sm font-extrabold text-main">
            <span>Total Comprobante</span>
            <span>S/ {{ sale.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Metadatos operativos -->
        <div class="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub">
            <span class="text-[10px] text-muted block">Cajero / Canal</span>
            <span class="font-semibold text-main truncate block">{{ sale.cashier }}</span>
          </div>
          <div class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub">
            <span class="text-[10px] text-muted block">Referencia Pago</span>
            <span class="font-mono font-semibold text-main truncate block">
              {{ sale.yapeCode ?? sale.tableNumber ?? sale.channel }}
            </span>
          </div>
        </div>

        <!-- Acciones del comprobante -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-sub">
          @if (sale.status !== 'voided') {
            <m3-button
              variant="outlined"
              size="sm"
              icon="receipt_long"
              [invisible]="isVoidOriginInvisible()"
              [viewTransitionName]="isVoidOriginActive() ? 'dialog-transform' : null"
              (action)="requestVoid.emit(sale)">
              Emitir Nota Crédito
            </m3-button>

            <m3-button
              variant="tonal"
              size="sm"
              [icon]="sale.status === 'reconciled' ? 'undo' : 'verified'"
              [disabled]="!!sale.syncing"
              (action)="toggleReconcile.emit(sale)">
              {{ sale.status === 'reconciled' ? 'Marcar Pendiente' : 'Conciliar Venta' }}
            </m3-button>
          } @else {
            <span class="text-xs font-medium text-muted">
              Comprobante cerrado por Nota de Crédito.
            </span>
          }
        </div>
      </m3-card>
    } @else {
      <m3-card variant="outlined" padding="lg" shape="xl" customClass="text-center space-y-2">
        <span class="material-symbols-rounded text-3xl text-muted" aria-hidden="true">receipt</span>
        <p class="text-sm font-bold text-main">Selecciona un comprobante para inspeccionar</p>
        <p class="text-xs text-muted">El desglose fiscal y acciones aparecerán en este panel.</p>
      </m3-card>
    }
  `
})
export class SalesDetailSheetComponent {
  readonly record = input<SaleLedgerRecord | null>(null);
  readonly isVoidOriginActive = input<boolean>(false);
  readonly isVoidOriginInvisible = input<boolean>(false);

  readonly copyReceipt = output<SaleLedgerRecord>();
  readonly toggleReconcile = output<SaleLedgerRecord>();
  readonly requestVoid = output<SaleLedgerRecord>();
}
