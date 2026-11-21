import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CartItem, PosCustomer, VoucherType } from '../../../core/pos/pos.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';

export type PosServiceChannel = 'dine-in' | 'takeaway' | 'delivery';

@Component({
  selector: 'app-pos-ticket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3CardComponent],
  host: {
    class: 'flex flex-col h-full min-h-0 overflow-hidden'
  },
  template: `
    <m3-card
      variant="filled"
      surface="low"
      padding="none"
      shape="xl"
      customClass="pos-ticket-pane flex flex-col h-full min-h-0 shadow-m3-level1 overflow-hidden">

      <div class="shrink-0 p-3.5 bg-surface-box flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-8 h-8 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">receipt_long</span>
            </span>
            <div class="min-w-0">
              <h3 class="font-black text-xs tracking-tight text-main">Comanda Comercial</h3>
              <div class="text-[10px] font-mono text-muted uppercase">Ticket {{ orderCode() }}</div>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-primary-box text-on-primary-box text-xs font-mono font-bold tabular-nums shrink-0">
            {{ cartCount() }} {{ cartCount() === 1 ? 'ítem' : 'ítems' }}
          </span>
        </div>

        <div class="flex flex-col gap-2">
          <div class="overflow-x-auto scrollbar-none py-1 -my-1 w-full">
            <m3-button-group
              variant="connected"
              size="sm"
              customClass="pos-ticket-group"
              ariaLabel="Canal de servicio"
              [options]="channelOptions()"
              [value]="[serviceChannel()]"
              (selectionChange)="onChannelGroupSelect($event)" />
          </div>

          @if (isTablePickerOpen() && serviceChannel() === 'dine-in') {
            <div
              role="group"
              aria-label="Seleccionar mesa"
              class="flex flex-wrap gap-1.5 p-2 rounded-m3-md bg-surface m3-anim-fade-through">
              @for (table of availableTables(); track table) {
                <button
                  type="button"
                  [attr.aria-pressed]="tableNumber() === table"
                  (click)="selectTable(table)"
                  [class]="tableNumber() === table ? 'bg-primary text-on-primary font-bold' : 'bg-surface-high text-main hover:bg-surface-highest'"
                  class="btn-m3 state-layer focus-ring-m3 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer">
                  {{ table }}
                </button>
              }
            </div>
          }
        </div>

        <div class="overflow-x-auto scrollbar-none py-1 -my-1 w-full">
          <m3-button-group
            variant="connected"
            size="md"
            customClass="pos-ticket-group"
            ariaLabel="Tipo de comprobante"
            [options]="voucherOptions"
            [value]="[voucherType()]"
            (selectionChange)="onVoucherSelect($event)" />
        </div>

        <div class="flex items-center justify-between gap-2 text-xs px-3 py-2 bg-surface rounded-m3-md">
          <div class="min-w-0 flex-1">
            <div class="font-bold text-main truncate text-xs">{{ customer().name }}</div>
            <div class="text-[11px] text-muted font-mono">{{ customer().docType }}: {{ customer().docNumber }}</div>
          </div>
          <m3-button
            variant="tonal"
            size="xs"
            icon="edit"
            (action)="editCustomer.emit()">
            Editar [F4]
          </m3-button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar p-3.5 flex flex-col gap-2.5">
        @for (item of cart(); track item.lineId) {
          @let totalProductQty = quantityMap().get(item.product.id) ?? 0;
          @let canIncrement = totalProductQty < item.product.stock;

          <div class="pos-ticket-line-row flex items-start justify-between gap-2 pb-2.5 border-b border-outline-sub/35 last:border-b-0 last:pb-0 m3-anim-item-in">
            <div class="min-w-0 flex-1">
              <h5 class="font-bold text-xs text-main truncate">{{ item.product.name }}</h5>
              <div class="text-[11px] text-muted font-mono mt-0.5">
                S/ {{ item.unitPrice.toFixed(2) }} c/u
              </div>
              @if (item.notes) {
                <div class="text-[10px] text-primary italic mt-1 bg-primary-box/45 px-2 py-0.5 rounded-m3-sm w-fit">
                  Obs: {{ item.notes }}
                </div>
              }
            </div>

            <div class="pos-ticket-line-controls flex items-center gap-2 shrink-0">
              <div class="flex items-center gap-1 bg-surface rounded-full px-1.5 py-0.5 shrink-0">
                <button
                  type="button"
                  [attr.aria-label]="'Disminuir cantidad de ' + item.product.name"
                  (click)="updateLineQuantity.emit({ lineId: item.lineId, delta: -1 })"
                  class="btn-m3 state-layer focus-ring-m3 touch-target-48 w-7 h-7 rounded-full grid place-items-center text-muted hover:text-main cursor-pointer">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">remove</span>
                </button>
                <span class="text-xs font-mono font-bold w-5 text-center tabular-nums">{{ item.quantity }}</span>
                <button
                  type="button"
                  [disabled]="!canIncrement"
                  [attr.aria-label]="'Aumentar cantidad de ' + item.product.name"
                  (click)="updateLineQuantity.emit({ lineId: item.lineId, delta: 1 })"
                  class="btn-m3 state-layer focus-ring-m3 touch-target-48 w-7 h-7 rounded-full grid place-items-center text-muted hover:text-main cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">add</span>
                </button>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <span class="font-mono font-bold text-xs text-main tabular-nums">
                  S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}
                </span>
                <m3-button
                  [iconOnly]="true"
                  variant="text"
                  size="xs"
                  icon="close"
                  [ariaLabel]="'Quitar ' + item.product.name + ' de la comanda'"
                  (action)="removeLine.emit(item.lineId)" />
              </div>
            </div>
          </div>
        } @empty {
          <div class="py-14 text-center flex flex-col items-center gap-2 text-muted m3-anim-fade-through">
            <span class="material-symbols-rounded text-3xl" aria-hidden="true">shopping_cart</span>
            <p class="text-xs font-medium m-0">No hay productos en la comanda.</p>
            <p class="text-[11px] m-0">Tocá una tarjeta del catálogo para sumarlo.</p>
          </div>
        }
      </div>

      <div class="shrink-0 p-3.5 bg-surface-box flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span class="text-[11px] text-muted font-semibold">Descuento</span>
          <div class="overflow-x-auto scrollbar-none py-2 -my-2 max-w-full">
            <m3-button-group
              variant="connected"
              size="sm"
              ariaLabel="Descuento rápido"
              [options]="discountOptions"
              [value]="[discountPercent().toString()]"
              (selectionChange)="onDiscountSelect($event)" />
          </div>
        </div>

        <div class="flex flex-col gap-1 text-xs pt-2 border-t border-outline-sub/45">
          <div class="flex items-center justify-between text-muted text-xs">
            <span>Subtotal (Base Imponible)</span>
            <span class="font-mono tabular-nums">S/ {{ subtotal().toFixed(2) }}</span>
          </div>
          @if (discount() > 0) {
            <div class="flex items-center justify-between text-warning font-semibold text-xs m3-anim-fade-through">
              <span>Descuento Aplicado ({{ discountPercent() }}%)</span>
              <span class="font-mono tabular-nums">- S/ {{ discount().toFixed(2) }}</span>
            </div>
          }
          <div class="flex items-center justify-between text-muted text-xs">
            <span>IGV (18% Fiscal SUNAT)</span>
            <span class="font-mono tabular-nums">S/ {{ tax().toFixed(2) }}</span>
          </div>
          <div class="flex items-center justify-between font-black text-main pt-2 mt-1 border-t border-outline-sub/45">
            <span class="text-sm">Total a Liquidar</span>
            <span class="text-primary text-2xl font-mono tracking-tight font-black tabular-nums">S/ {{ total().toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <m3-button
            variant="tonal"
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

  readonly voucherOptions: M3ButtonGroupOption[] = [
    { id: 'boleta', label: 'Boleta de Venta', icon: 'person' },
    { id: 'factura', label: 'Factura SUNAT', icon: 'domain' }
  ];

  readonly discountOptions: M3ButtonGroupOption[] = [0, 5, 10, 15].map(pct => ({
    id: pct.toString(),
    label: pct === 0 ? '0%' : `-${pct}%`
  }));

  readonly quantityMap = computed(() => {
    const map = new Map<number, number>();
    for (const item of this.cart()) {
      map.set(item.product.id, (map.get(item.product.id) ?? 0) + item.quantity);
    }
    return map;
  });

  readonly channelOptions = computed<M3ButtonGroupOption[]>(() => {
    const dineInArrow = this.serviceChannel() === 'dine-in' ? (this.isTablePickerOpen() ? ' ▴' : ' ▾') : '';
    return [
      { id: 'dine-in', label: `${this.tableNumber()}${dineInArrow}`, icon: 'restaurant' },
      { id: 'takeaway', label: 'Llevar', icon: 'shopping_bag' },
      { id: 'delivery', label: 'Delivery', icon: 'two_wheeler' }
    ];
  });

  onChannelGroupSelect(selected: string[]): void {
    const channel = selected[0] as PosServiceChannel | undefined;
    if (!channel) return;
    this.onChannelClick(channel);
  }

  onVoucherSelect(selected: string[]): void {
    const voucher = selected[0] as VoucherType | undefined;
    if (voucher) {
      this.voucherTypeChange.emit(voucher);
    }
  }

  onDiscountSelect(selected: string[]): void {
    const pct = Number(selected[0]);
    if (!Number.isNaN(pct)) {
      this.discountChange.emit(pct);
    }
  }

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
    this.channelChange.emit('dine-in');
    this.isTablePickerOpen.set(false);
  }
}
