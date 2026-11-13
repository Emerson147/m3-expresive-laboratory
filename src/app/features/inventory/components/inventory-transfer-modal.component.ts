import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  input,
  OnInit,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { MasterProduct, Warehouse } from '../../../core/inventory/inventory.models';

export interface ActiveTransferVariant {
  variantSku: string;
  productName: string;
  size: string;
  colorName: string;
  productId: number;
  availableInCentral: number;
}

export interface TransferDispatchPayload {
  fromWhId: string;
  toWhId: string;
  variantSku: string;
  quantity: number;
  operator: string;
}

@Component({
  selector: 'app-inventory-transfer-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm m3-dialog-backdrop cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-transfer-title"
      class="fixed inset-0 m-auto z-50 w-[calc(100%-2rem)] max-w-lg h-fit max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-surface-box border border-outline-sub shadow-2xl p-6 space-y-5 m3-dialog-surface">
      <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-primary text-on-primary grid place-items-center">
            <span class="material-symbols-rounded text-xl" aria-hidden="true">swap_horiz</span>
          </div>
          <div>
            <h3
              #modalHeading
              id="inventory-transfer-title"
              tabindex="-1"
              class="text-lg font-black text-main outline-none">
              Transferencia Inter-Almacén
            </h3>
            <p class="text-xs text-muted">Mover unidades físicas entre centros logísticos</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Cerrar transferencia inter-almacén"
          (click)="close.emit()"
          class="w-8 h-8 rounded-full bg-surface hover:bg-surface-high border border-outline-sub grid place-items-center text-muted hover:text-main cursor-pointer">
          <span class="material-symbols-rounded text-base" aria-hidden="true">close</span>
        </button>
      </div>

      <div class="p-3.5 rounded-2xl bg-surface border border-outline-sub flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-surface-high overflow-hidden shrink-0 border border-outline-sub">
          <img
            [src]="product().imageUrl"
            [alt]="product().name"
            class="w-full h-full object-cover" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold text-main truncate">
            {{ variant().productName }}
          </div>
          <div class="text-[11px] font-mono text-muted flex flex-wrap items-center gap-2 mt-0.5">
            <span class="text-primary font-bold">{{ variant().variantSku }}</span>
            <span aria-hidden="true">•</span>
            <span>Color: {{ variant().colorName }}</span>
            <span aria-hidden="true">•</span>
            <span>Talla: {{ variant().size }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <div class="space-y-1.5">
          <label for="transfer-from-wh" class="text-xs font-bold text-muted uppercase tracking-wider">Almacén Origen</label>
          <select
            id="transfer-from-wh"
            [value]="fromWh()"
            (change)="onFromWarehouseChange($any($event.target).value)"
            class="w-full text-xs p-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
            @for (wh of warehouses(); track wh.id) {
              <option [value]="wh.id" [selected]="wh.id === fromWh()">{{ wh.name }}</option>
            }
          </select>
        </div>

        <div class="space-y-1.5">
          <label for="transfer-to-wh" class="text-xs font-bold text-muted uppercase tracking-wider">Almacén Destino</label>
          <select
            id="transfer-to-wh"
            [value]="toWh()"
            (change)="onToWarehouseChange($any($event.target).value)"
            class="w-full text-xs p-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
            @for (wh of warehouses(); track wh.id) {
              <option [value]="wh.id" [selected]="wh.id === toWh()" [disabled]="wh.id === fromWh()">{{ wh.name }}</option>
            }
          </select>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <label for="transfer-qty-input" class="font-bold text-muted uppercase tracking-wider">Cantidad de Unidades</label>
          <span class="text-muted">
            Disponible en origen: <strong class="text-main font-mono">{{ sourceStock() }} uds</strong>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            [disabled]="sourceStock() === 0 || transferQty() <= 1"
            (click)="adjustQuantity(-1)"
            class="w-10 h-10 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high disabled:opacity-40 disabled:cursor-not-allowed grid place-items-center text-sm cursor-pointer">
            -
          </button>
          <input
            id="transfer-qty-input"
            type="number"
            [value]="transferQty()"
            (input)="onQuantityInput($any($event.target).value)"
            [min]="sourceStock() > 0 ? 1 : 0"
            [max]="sourceStock()"
            [disabled]="sourceStock() === 0"
            class="flex-1 text-center font-mono font-black text-lg py-2 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
          <button
            type="button"
            aria-label="Aumentar cantidad"
            [disabled]="sourceStock() === 0 || transferQty() >= sourceStock()"
            (click)="adjustQuantity(1)"
            class="w-10 h-10 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high disabled:opacity-40 disabled:cursor-not-allowed grid place-items-center text-sm cursor-pointer">
            +
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            [disabled]="sourceStock() === 0 || transferQty() >= sourceStock()"
            (click)="adjustQuantity(5)"
            class="px-2.5 py-1 rounded-lg text-xs bg-surface border border-outline-sub text-muted hover:text-main disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            +5 uds
          </button>
          <button
            type="button"
            [disabled]="sourceStock() === 0 || transferQty() >= sourceStock()"
            (click)="adjustQuantity(10)"
            class="px-2.5 py-1 rounded-lg text-xs bg-surface border border-outline-sub text-muted hover:text-main disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            +10 uds
          </button>
          <button
            type="button"
            [disabled]="sourceStock() === 0"
            (click)="setMaxQuantity()"
            class="px-2.5 py-1 rounded-lg text-xs bg-surface border border-outline-sub text-muted hover:text-main disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            Todo ({{ sourceStock() }})
          </button>
        </div>

        @if (sourceStock() === 0) {
          <p role="alert" class="text-xs font-medium text-rose-500 pt-1">
            No hay unidades disponibles de {{ variant().variantSku }} en esta sede de origen.
          </p>
        }
      </div>

      <div class="space-y-1.5">
        <label for="transfer-operator" class="text-xs font-bold text-muted uppercase tracking-wider">Operador de Despacho</label>
        <input
          id="transfer-operator"
          type="text"
          [value]="operator()"
          (input)="operator.set($any($event.target).value)"
          placeholder="Nombre del encargado (ej. Juan Pérez)"
          class="w-full text-xs px-3 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-sub">
        <button
          type="button"
          (click)="close.emit()"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-surface-high cursor-pointer transition-all">
          Cancelar
        </button>
        <button
          type="button"
          (click)="submit()"
          [disabled]="!canSubmit()"
          class="btn-m3 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
          <span class="material-symbols-rounded text-base" aria-hidden="true">local_shipping</span>
          Confirmar Despacho
        </button>
      </div>
    </div>
  `
})
export class InventoryTransferModalComponent implements OnInit {
  readonly variant = input.required<ActiveTransferVariant>();
  readonly product = input.required<MasterProduct>();
  readonly warehouses = input.required<Warehouse[]>();
  readonly selectedWarehouseId = input.required<string>();

  readonly close = output<void>();
  readonly confirmTransfer = output<TransferDispatchPayload>();

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly fromWh = signal<string>('WH-CENTRAL');
  readonly toWh = signal<string>('WH-MIRAFLORES');
  readonly transferQty = signal<number>(5);
  readonly operator = signal<string>('Carlos M.');

  readonly sourceStock = computed<number>(() => {
    const sku = this.variant().variantSku;
    const whId = this.fromWh();
    const cell = this.product().cells.find(
      c => c.variantSku === sku && c.warehouseId === whId
    );
    return cell?.stock ?? 0;
  });

  readonly canSubmit = computed<boolean>(() => {
    const qty = this.transferQty();
    const max = this.sourceStock();
    return max > 0 && qty >= 1 && qty <= max && this.fromWh() !== this.toWh();
  });

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });

    effect(() => {
      this.variant();
      untracked(() => this.syncInitialState());
    });
  }

  ngOnInit(): void {
    this.syncInitialState();
  }

  private syncInitialState(): void {
    const activeWh = this.selectedWarehouseId();
    const allWarehouses = this.warehouses();
    const initialFrom = activeWh !== 'ALL' ? activeWh : 'WH-CENTRAL';
    this.fromWh.set(initialFrom);

    const alternate = allWarehouses.find(w => w.id !== initialFrom)?.id ?? initialFrom;
    this.toWh.set(alternate);

    const initialMax = this.sourceStock();
    this.transferQty.set(initialMax > 0 ? Math.min(5, initialMax) : 0);
  }

  onFromWarehouseChange(whId: string): void {
    this.fromWh.set(whId);
    if (this.toWh() === whId) {
      const alternate = this.warehouses().find(w => w.id !== whId)?.id;
      if (alternate) this.toWh.set(alternate);
    }
    this.clampQuantity();
  }

  onToWarehouseChange(whId: string): void {
    this.toWh.set(whId);
  }

  onQuantityInput(rawValue: unknown): void {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      this.transferQty.set(this.sourceStock() > 0 ? 1 : 0);
      return;
    }
    this.setClampedQuantity(Math.floor(parsed));
  }

  adjustQuantity(delta: number): void {
    this.setClampedQuantity(this.transferQty() + delta);
  }

  setMaxQuantity(): void {
    this.transferQty.set(this.sourceStock());
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.confirmTransfer.emit({
      fromWhId: this.fromWh(),
      toWhId: this.toWh(),
      variantSku: this.variant().variantSku,
      quantity: this.transferQty(),
      operator: this.operator().trim() || 'Operador Central'
    });
  }

  private clampQuantity(): void {
    this.setClampedQuantity(this.transferQty() || 1);
  }

  private setClampedQuantity(candidate: number): void {
    const max = this.sourceStock();
    if (max <= 0) {
      this.transferQty.set(0);
      return;
    }
    this.transferQty.set(Math.max(1, Math.min(max, candidate)));
  }
}
