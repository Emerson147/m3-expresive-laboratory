import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { CompletedSale } from '../../../core/pos/pos.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-pos-receipt-modal',
  standalone: true,
  imports: [CommonModule, M3ButtonComponent],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="newSale.emit()"
      [class.m3-dialog-backdrop]="!themeService.hasViewTransitions()"
      class="fixed inset-0 bg-scrim z-40 cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pos-receipt-title"
      [style.view-transition-name]="isSurfaceTransitionActive() ? 'dialog-transform' : null"
      [class.m3-dialog-surface]="!themeService.hasViewTransitions()"
      class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[400px] h-fit max-h-[calc(100vh-3rem)] bg-white text-zinc-900 border border-zinc-300 p-6 rounded-m3-xl shadow-2xl z-50 overflow-y-auto font-mono text-xs space-y-3.5">

      <div class="text-center space-y-0.5 border-b border-dashed border-zinc-400 pb-2.5">
        <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-box text-on-success-box border border-success/30 text-[10px] font-bold mb-1 m3-anim-spring-pop">
          <span class="material-symbols-rounded text-xs" aria-hidden="true">check_circle</span>
          <span>VENTA COMPLETADA</span>
        </div>
        <h3
          #modalHeading
          id="pos-receipt-title"
          tabindex="-1"
          class="text-sm font-black tracking-tight outline-none">
          EXPRESSIVE CAFÉ &amp; BISTRO
        </h3>
        <div class="text-[10px]">R.U.C. 20601234567</div>
        <div class="text-[10px]">Av. Larco 450, Miraflores - Lima</div>
        <div class="text-[10px] font-bold mt-1">
          {{ sale().voucherType === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA' }}
        </div>
        <div class="text-xs font-black">{{ sale().saleId }}</div>
      </div>

      <div class="space-y-0.5 border-b border-dashed border-zinc-400 pb-2 text-[10px]">
        <div class="flex justify-between">
          <span>FECHA: {{ sale().date | date:'dd/MM/yyyy HH:mm' }}</span>
          <span>CAJA: 01</span>
        </div>
        <div class="flex justify-between">
          <span>CLIENTE: {{ sale().customer.name }}</span>
        </div>
        <div class="flex justify-between">
          <span>{{ sale().customer.docType }}: {{ sale().customer.docNumber }}</span>
          <span>CANAL: {{ channelLabel() }}</span>
        </div>
      </div>

      <div class="space-y-1 border-b border-dashed border-zinc-400 pb-2">
        <div class="flex justify-between font-bold text-[9px] uppercase text-zinc-600">
          <span class="w-6">CANT</span>
          <span class="flex-1">DESCRIPCIÓN</span>
          <span class="w-14 text-right">TOTAL</span>
        </div>
        @for (item of sale().items; track item.product.id) {
          <div class="flex justify-between text-[10px]">
            <span class="w-6 font-bold">{{ item.quantity }}</span>
            <span class="flex-1 truncate pr-2">{{ item.product.name }}</span>
            <span class="w-14 text-right">S/ {{ (item.product.price * item.quantity).toFixed(2) }}</span>
          </div>
        }
      </div>

      <div class="space-y-0.5 text-[10px]">
        <div class="flex justify-between">
          <span>OP. GRAVADA:</span>
          <span>S/ {{ sale().subtotal.toFixed(2) }}</span>
        </div>
        @if (sale().discount > 0) {
          <div class="flex justify-between font-bold">
            <span>DESCUENTO:</span>
            <span>- S/ {{ sale().discount.toFixed(2) }}</span>
          </div>
        }
        <div class="flex justify-between">
          <span>I.G.V. (18%):</span>
          <span>S/ {{ sale().tax.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm font-black pt-1 border-t border-zinc-400">
          <span>TOTAL A PAGAR:</span>
          <span>S/ {{ sale().total.toFixed(2) }}</span>
        </div>

        <div class="pt-1.5 border-t border-dashed border-zinc-400 space-y-0.5 text-[9px] text-zinc-700">
          <div class="flex justify-between">
            <span>FORMA DE PAGO:</span>
            <span class="uppercase font-bold">{{ sale().paymentMethod }}</span>
          </div>
          @if (sale().paymentMethod === 'cash') {
            <div class="flex justify-between">
              <span>IMPORTE RECIBIDO:</span>
              <span>S/ {{ sale().cashReceived?.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>VUELTO:</span>
              <span>S/ {{ sale().change?.toFixed(2) }}</span>
            </div>
          }
          @if (sale().paymentMethod === 'yape') {
            <div class="flex justify-between">
              <span>CÓD. OPERACIÓN:</span>
              <span>{{ sale().yapeCode }}</span>
            </div>
          }
        </div>
      </div>

      <div class="text-center pt-1.5 space-y-0.5 text-[9px] text-zinc-600 border-t border-dashed border-zinc-400">
        <div>Representación impresa de Comprobante Electrónico</div>
        <div>Autorizado mediante Resolución de Superintendencia SUNAT</div>
        <div class="font-bold">¡GRACIAS POR SU COMPRA!</div>
      </div>

      <div class="pt-3 border-t border-zinc-300 flex items-center justify-between gap-2.5">
        <m3-button
          variant="tonal"
          size="md"
          icon="print"
          customClass="flex-1"
          (action)="print.emit()">
          Imprimir
        </m3-button>
        <m3-button
          variant="filled"
          size="md"
          icon="add_shopping_cart"
          [morph]="true"
          customClass="flex-1"
          (action)="newSale.emit()">
          Nueva Venta
        </m3-button>
      </div>
    </div>
  `
})
export class PosReceiptModalComponent {
  readonly themeService = inject(ThemeService);
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly sale = input.required<CompletedSale>();
  readonly channelLabel = input.required<string>();
  readonly isSurfaceTransitionActive = input<boolean>(false);

  readonly print = output<void>();
  readonly newSale = output<void>();

  constructor() {
    queueMicrotask(() => this.modalHeading()?.nativeElement.focus());
  }
}

