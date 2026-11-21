import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CompletedSale, PaymentMethod } from '../../../core/pos/pos.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  yape: 'Yape / Plin',
  card: 'Tarjeta'
};

@Component({
  selector: 'app-pos-receipt-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, M3ButtonComponent, M3DialogComponent],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="basic"
      size="sm"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      [headline]="sale()?.saleId ? 'Comprobante ' + sale()!.saleId : 'Comprobante electrónico'"
      [viewTransitionName]="viewTransitionName()"
      customClass="pos-receipt-dialog"
      (closeRequested)="newSale.emit()">

      @if (sale(); as currentSale) {
        <div class="font-mono text-xs flex flex-col gap-3">
          <div class="text-center flex flex-col gap-0.5 pos-receipt-dashed pb-2.5">
            <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-box text-on-success-box text-[10px] font-bold mb-1 mx-auto m3-anim-spring-pop">
              <span class="material-symbols-rounded text-xs" aria-hidden="true">check_circle</span>
              <span>VENTA COMPLETADA</span>
            </div>
            <h3
              id="pos-receipt-title"
              class="text-sm font-black tracking-tight">
              EXPRESSIVE CAFÉ &amp; BISTRO
            </h3>
            <div class="text-[10px]">R.U.C. 20601234567</div>
            <div class="text-[10px]">Av. Larco 450, Miraflores - Lima</div>
            <div class="text-[10px] font-bold mt-1">
              {{ currentSale.voucherType === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA' }}
            </div>
            <div class="text-xs font-black">{{ currentSale.saleId }}</div>
          </div>

          <div class="flex flex-col gap-0.5 pos-receipt-dashed pb-2 text-[10px]">
            <div class="flex justify-between">
              <span>FECHA: {{ currentSale.date | date:'dd/MM/yyyy HH:mm' }}</span>
              <span>CAJA: 01</span>
            </div>
            <div class="flex justify-between">
              <span>CLIENTE: {{ currentSale.customer.name }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ currentSale.customer.docType }}: {{ currentSale.customer.docNumber }}</span>
              <span>CANAL: {{ channelLabel() }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-1 pos-receipt-dashed pb-2">
            <div class="flex justify-between font-bold text-[9px] uppercase pos-receipt-ink-muted">
              <span class="w-6">CANT</span>
              <span class="flex-1">DESCRIPCIÓN</span>
              <span class="w-14 text-right">TOTAL</span>
            </div>
            @for (item of currentSale.items; track item.lineId) {
              <div class="flex flex-col gap-0.5 text-[10px]">
                <div class="flex justify-between">
                  <span class="w-6 font-bold">{{ item.quantity }}</span>
                  <span class="flex-1 truncate pr-2">{{ item.product.name }}</span>
                  <span class="w-14 text-right tabular-nums">S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
                </div>
                @if (item.notes) {
                  <div class="pl-6 text-[9px] pos-receipt-ink-muted italic truncate">
                    {{ item.notes }}
                  </div>
                }
              </div>
            }
          </div>

          <div class="flex flex-col gap-0.5 text-[10px]">
            <div class="flex justify-between">
              <span>OP. GRAVADA:</span>
              <span class="tabular-nums">S/ {{ currentSale.subtotal.toFixed(2) }}</span>
            </div>
            @if (currentSale.discount > 0) {
              <div class="flex justify-between font-bold">
                <span>DESCUENTO:</span>
                <span class="tabular-nums">- S/ {{ currentSale.discount.toFixed(2) }}</span>
              </div>
            }
            <div class="flex justify-between">
              <span>I.G.V. (18%):</span>
              <span class="tabular-nums">S/ {{ currentSale.tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm font-black pt-1 pos-receipt-dashed-top">
              <span>TOTAL A PAGAR:</span>
              <span class="tabular-nums">S/ {{ currentSale.total.toFixed(2) }}</span>
            </div>

            <div class="pt-1.5 pos-receipt-dashed-top flex flex-col gap-0.5 text-[9px] pos-receipt-ink-soft">
              <div class="flex justify-between">
                <span>FORMA DE PAGO:</span>
                <span class="uppercase font-bold">{{ paymentMethodLabel(currentSale.paymentMethod) }}</span>
              </div>
              @if (currentSale.paymentMethod === 'cash') {
                <div class="flex justify-between">
                  <span>IMPORTE RECIBIDO:</span>
                  <span class="tabular-nums">S/ {{ currentSale.cashReceived?.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between font-bold">
                  <span>VUELTO:</span>
                  <span class="tabular-nums">S/ {{ currentSale.change?.toFixed(2) }}</span>
                </div>
              }
              @if (currentSale.paymentMethod === 'yape') {
                <div class="flex justify-between">
                  <span>CÓD. OPERACIÓN:</span>
                  <span>{{ currentSale.yapeCode }}</span>
                </div>
              }
            </div>
          </div>

          <div class="text-center pt-1.5 flex flex-col gap-0.5 text-[9px] pos-receipt-ink-muted pos-receipt-dashed-top">
            <div>Representación impresa de Comprobante Electrónico</div>
            <div>Autorizado mediante Resolución de Superintendencia SUNAT</div>
            <div class="font-bold">¡GRACIAS POR SU COMPRA!</div>
          </div>
        </div>
      }

      <div dialog-actions class="flex items-center justify-between gap-2.5 w-full">
        <m3-button
          type="button"
          variant="tonal"
          size="md"
          icon="print"
          customClass="flex-1"
          (action)="print.emit()">
          Imprimir
        </m3-button>
        <m3-button
          type="button"
          variant="filled"
          size="md"
          icon="add_shopping_cart"
          [morph]="true"
          customClass="flex-1"
          (action)="newSale.emit()">
          Nueva Venta
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class PosReceiptModalComponent {
  readonly open = input<boolean>(false);
  readonly sale = input<CompletedSale | null>(null);
  readonly channelLabel = input.required<string>();
  readonly viewTransitionName = input<string | null>(null);

  readonly print = output<void>();
  readonly newSale = output<void>();

  paymentMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method];
  }
}
