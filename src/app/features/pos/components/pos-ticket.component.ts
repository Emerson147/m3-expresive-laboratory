import { Component, computed, input, output, signal } from '@angular/core';
import { CartItem, PosCustomer, VoucherType } from '../../../core/pos/pos.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';

export type PosServiceChannel = 'dine-in' | 'takeaway' | 'delivery';

@Component({
  selector: 'app-pos-ticket',
  standalone: true,
  imports: [M3ButtonComponent, M3CardComponent],
  host: {
    class: 'flex flex-col h-full min-h-0 overflow-hidden'
  },
  template: `
    <m3-card
      variant="outlined"
      padding="none"
      shape="lg"
      customClass="flex flex-col h-full min-h-0 bg-surface-box shadow-xl overflow-hidden">

      <div class="shrink-0 p-3 bg-surface-high border-b border-outline-sub space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-primary text-xl" aria-hidden="true">receipt_long</span>
            <div>
              <h3 class="font-black text-xs tracking-tight text-main">Comanda Comercial</h3>
              <div class="text-[10px] font-mono text-muted uppercase">Ticket {{ orderCode() }}</div>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-primary-box text-on-primary-box text-xs font-mono font-bold">
            {{ cartCount() }} ítems
          </span>
        </div>

        <div class="space-y-1.5">
          <div
            role="group"
            aria-label="Canal de servicio"
            class="grid grid-cols-3 gap-1 p-1 bg-surface-box rounded-full border border-outline-sub text-xs">
            @for (ch of channelOptions; track ch.id) {
              <button
                type="button"
                [attr.aria-pressed]="serviceChannel() === ch.id"
                [attr.aria-expanded]="ch.id === 'dine-in' && serviceChannel() === 'dine-in' ? isTablePickerOpen() : null"
                (click)="onChannelClick(ch.id)"
                [class]="serviceChannel() === ch.id ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 state-layer focus-ring-m3 touch-target-48 min-h-10 py-1.5 px-2 rounded-full flex items-center justify-center gap-1 cursor-pointer truncate text-xs">
                <span class="material-symbols-rounded text-sm shrink-0" aria-hidden="true">{{ ch.icon }}</span>
                <span class="truncate">{{ ch.id === 'dine-in' ? tableNumber() : ch.label }}</span>
                @if (ch.id === 'dine-in' && serviceChannel() === 'dine-in') {
                  <span class="material-symbols-rounded text-sm shrink-0" aria-hidden="true">
                    {{ isTablePickerOpen() ? 'expand_less' : 'expand_more' }}
                  </span>
                }
              </button>
            }
          </div>

          @if (isTablePickerOpen() && serviceChannel() === 'dine-in') {
            <div
              role="group"
              aria-label="Seleccionar mesa"
              class="flex flex-wrap gap-1.5 p-2 rounded-m3-md bg-surface-box border border-outline-sub m3-anim-fade-through">
              @for (table of availableTables(); track table) {
                <button
                  type="button"
                  [attr.aria-pressed]="tableNumber() === table"
                  (click)="selectTable(table)"
                  [class]="tableNumber() === table ? 'bg-primary text-on-primary font-bold border-primary' : 'bg-surface-high text-main hover:bg-surface-highest border-outline-sub'"
                  class="btn-m3 state-layer focus-ring-m3 px-2.5 py-1 rounded-full border text-[11px] font-mono cursor-pointer">
                  {{ table }}
                </button>
              }
            </div>
          }
        </div>

        <div
          role="group"
          aria-label="Tipo de comprobante"
          class="grid grid-cols-2 gap-1 p-1 bg-surface-box rounded-full border border-outline-sub">
          <button
            type="button"
            [attr.aria-pressed]="voucherType() === 'boleta'"
            (click)="voucherTypeChange.emit('boleta')"
            [class]="voucherType() === 'boleta' ? 'bg-sec-box text-on-sec-box font-bold shadow-xs' : 'text-muted hover:text-main'"
            class="btn-m3 state-layer focus-ring-m3 touch-target-48 min-h-10 py-1.5 rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span class="material-symbols-rounded text-sm" aria-hidden="true">person</span>
            <span>Boleta de Venta</span>
          </button>
          <button
            type="button"
            [attr.aria-pressed]="voucherType() === 'factura'"
            (click)="voucherTypeChange.emit('factura')"
            [class]="voucherType() === 'factura' ? 'bg-sec-box text-on-sec-box font-bold shadow-xs' : 'text-muted hover:text-main'"
            class="btn-m3 state-layer focus-ring-m3 touch-target-48 min-h-10 py-1.5 rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span class="material-symbols-rounded text-sm" aria-hidden="true">domain</span>
            <span>Factura SUNAT</span>
          </button>
        </div>

        <div class="flex items-center justify-between gap-2 text-xs px-3 py-1.5 bg-surface-box rounded-m3-md border border-outline-sub">
          <div class="min-w-0 flex-1">
            <div class="font-bold text-main truncate text-xs">{{ customer().name }}</div>
            <div class="text-[11px] text-muted font-mono">{{ customer().docType }}: {{ customer().docNumber }}</div>
          </div>
          <m3-button
            variant="tonal"
            size="sm"
            icon="edit"
            (action)="editCustomer.emit()">
            Editar [F4]
          </m3-button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar p-3.5 space-y-2.5">
        @for (item of cart(); track item.lineId) {
          @let totalProductQty = quantityMap().get(item.product.id) ?? 0;
          @let canIncrement = totalProductQty < item.product.stock;

          <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-outline-sub/60 last:border-b-0 last:pb-0 m3-anim-item-in">
            <div class="min-w-0 flex-1">
              <h5 class="font-bold text-xs text-main truncate">{{ item.product.name }}</h5>
              <div class="text-[11px] text-muted font-mono mt-0.5">
                S/ {{ item.unitPrice.toFixed(2) }} c/u
              </div>
              @if (item.notes) {
                <div class="text-[10px] text-primary italic mt-0.5 bg-primary/5 px-1.5 py-0.5 rounded w-fit">
                  Obs: {{ item.notes }}
                </div>
              }
            </div>

            <div class="flex items-center gap-1 bg-surface-high rounded-full px-1.5 py-0.5 border border-outline-sub shrink-0">
              <button
                type="button"
                [attr.aria-label]="'Disminuir cantidad de ' + item.product.name"
                (click)="updateLineQuantity.emit({ lineId: item.lineId, delta: -1 })"
                class="btn-m3 state-layer focus-ring-m3 touch-target-48 w-7 h-7 rounded-full grid place-items-center text-muted hover:text-main cursor-pointer">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">remove</span>
              </button>
              <span class="text-xs font-mono font-bold w-5 text-center">{{ item.quantity }}</span>
              <button
                type="button"
                [disabled]="!canIncrement"
                [attr.aria-label]="'Aumentar cantidad de ' + item.product.name"
                (click)="updateLineQuantity.emit({ lineId: item.lineId, delta: 1 })"
                class="btn-m3 state-layer focus-ring-m3 touch-target-48 w-7 h-7 rounded-full grid place-items-center text-muted hover:text-main cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">add</span>
              </button>
            </div>

            <div class="text-right shrink-0">
              <div class="font-mono font-bold text-xs text-main">
                S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}
              </div>
              <button
                type="button"
                [attr.aria-label]="'Quitar ' + item.product.name + ' de la comanda'"
                (click)="removeLine.emit(item.lineId)"
                class="touch-target-48 text-[10px] text-error hover:underline cursor-pointer block ml-auto mt-0.5">
                Quitar
              </button>
            </div>
          </div>
        } @empty {
          <div class="py-14 text-center space-y-2 text-muted m3-anim-fade-through">
            <span class="material-symbols-rounded text-3xl" aria-hidden="true">shopping_cart</span>
            <p class="text-xs font-medium">No hay productos en la comanda.</p>
            <p class="text-[11px]">Tocá una tarjeta del catálogo para sumarlo.</p>
          </div>
        }
      </div>

      <div class="shrink-0 p-3.5 bg-surface-box border-t border-outline-sub space-y-2.5">
        <div class="flex items-center justify-between text-xs gap-1.5">
          <span class="text-[11px] text-muted font-semibold">Descuento:</span>
          <div class="flex items-center gap-1" role="group" aria-label="Descuento rápido">
            @for (pct of [0, 5, 10, 15]; track pct) {
              <button
                type="button"
                [attr.aria-pressed]="discountPercent() === pct"
                (click)="discountChange.emit(pct)"
                [class]="discountPercent() === pct ? 'bg-primary text-on-primary font-bold shadow-xs' : 'bg-surface-high text-muted hover:text-main'"
                class="btn-m3 state-layer focus-ring-m3 touch-target-48 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer">
                {{ pct === 0 ? '0%' : '-' + pct + '%' }}
              </button>
            }
          </div>
        </div>

        <div class="space-y-1 text-xs pt-1 border-t border-outline-sub/60">
          <div class="flex items-center justify-between text-muted text-xs">
            <span>Subtotal (Base Imponible)</span>
            <span class="font-mono">S/ {{ subtotal().toFixed(2) }}</span>
          </div>
          @if (discount() > 0) {
            <div class="flex items-center justify-between text-warning font-semibold text-xs m3-anim-fade-through">
              <span>Descuento Aplicado ({{ discountPercent() }}%)</span>
              <span class="font-mono">- S/ {{ discount().toFixed(2) }}</span>
            </div>
          }
          <div class="flex items-center justify-between text-muted text-xs">
            <span>IGV (18% Fiscal SUNAT)</span>
            <span class="font-mono">S/ {{ tax().toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between font-black text-main pt-1.5 border-t border-outline-sub">
            <span class="text-sm">Total a Liquidar</span>
            <span class="text-primary text-2xl font-mono tracking-tight font-black">S/ {{ total().toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <m3-button
            variant="outlined"
            size="lg"
            [iconOnly]="true"
            icon="delete_sweep"
            ariaLabel="Limpiar comanda"
            [disabled]="cart().length === 0"
            (action)="clearCart.emit()" />

          <m3-button
            variant="filled"
            size="lg"
            icon="payments"
            [morph]="true"
            customClass="flex-1"
            [invisible]="isCheckoutTriggerInvisible()"
            [viewTransitionName]="isCheckoutTransitionOrigin() ? 'dialog-transform' : null"
            [disabled]="cart().length === 0"
            (action)="checkout.emit()">
            Cobrar S/ {{ total().toFixed(2) }} [Ctrl+↵]
          </m3-button>
        </div>
      </div>
    </m3-card>
  `
})
export class PosTicketComponent {
  readonly cart = input.required<readonly CartItem[]>();
  readonly cartCount = input.required<number>();
  readonly orderCode = input<string>('#ORD-2026-0842');
  readonly tableNumber = input.required<string>();
  readonly availableTables = input<readonly string[]>([
    'Mesa 01',
    'Mesa 02',
    'Mesa 03',
    'Mesa 04',
    'Mesa 05',
    'Mesa 06',
    'Terraza 01',
    'Barra'
  ]);
  readonly serviceChannel = input.required<PosServiceChannel>();
  readonly voucherType = input.required<VoucherType>();
  readonly customer = input.required<PosCustomer>();
  readonly discountPercent = input.required<number>();
  readonly subtotal = input.required<number>();
  readonly discount = input.required<number>();
  readonly tax = input.required<number>();
  readonly total = input.required<number>();
  readonly isCheckoutTransitionOrigin = input<boolean>(false);
  readonly isCheckoutTriggerInvisible = input<boolean>(false);

  readonly channelChange = output<PosServiceChannel>();
  readonly tableChange = output<string>();
  readonly voucherTypeChange = output<VoucherType>();
  readonly editCustomer = output<void>();
  readonly updateLineQuantity = output<{ lineId: string; delta: number }>();
  readonly removeLine = output<string>();
  readonly discountChange = output<number>();
  readonly clearCart = output<void>();
  readonly checkout = output<void>();

  readonly isTablePickerOpen = signal<boolean>(false);

  readonly quantityMap = computed(() => {
    const map = new Map<number, number>();
    for (const item of this.cart()) {
      map.set(item.product.id, (map.get(item.product.id) ?? 0) + item.quantity);
    }
    return map;
  });

  readonly channelOptions: readonly { id: PosServiceChannel; label: string; icon: string }[] = [
    { id: 'dine-in', label: 'Mesa', icon: 'restaurant' },
    { id: 'takeaway', label: 'Llevar', icon: 'shopping_bag' },
    { id: 'delivery', label: 'Delivery', icon: 'two_wheeler' }
  ];

  onChannelClick(channel: PosServiceChannel): void {
    if (channel === 'dine-in') {
      if (this.serviceChannel() === 'dine-in') {
        this.isTablePickerOpen.update(open => !open);
      } else {
        this.channelChange.emit('dine-in');
        this.isTablePickerOpen.set(true);
      }
      return;
    }

    this.isTablePickerOpen.set(false);
    this.channelChange.emit(channel);
  }

  selectTable(table: string): void {
    this.tableChange.emit(table);
    this.isTablePickerOpen.set(false);
  }
}

