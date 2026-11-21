import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterProduct, Warehouse } from '../../../core/inventory/inventory.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { INVENTORY_SELECT_STYLES } from './inventory-select.styles';

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
  imports: [
    FormsModule,
    M3ButtonComponent,
    M3DialogComponent,
    M3LinearProgressComponent,
    M3TextFieldComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [INVENTORY_SELECT_STYLES],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="basic"
      size="md"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Transferencia Inter-Almacén"
      [viewTransitionName]="isDialogTransitionActive() ? 'dialog-transform' : null"
      customClass="inv-transfer-dialog"
      (closeRequested)="close.emit()">

      @if (variant(); as activeVariant) {
        <!-- Clean Modal Header -->
        <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 shrink-0">
          <header class="bg-surface rounded-m3-lg p-3.5 flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-12 h-12 rounded-m3-md bg-surface-high overflow-hidden shrink-0">
                <img
                  [src]="product().imageUrl"
                  [alt]="product().name"
                  class="w-full h-full object-cover" />
              </div>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span class="px-2 py-0.5 rounded-m3-xs bg-primary text-on-primary text-label-sm-emphasized font-mono">
                    {{ activeVariant.variantSku }}
                  </span>
                  <span class="text-label-sm text-muted">
                    {{ activeVariant.colorName }} · {{ activeVariant.size }}
                  </span>
                </div>
                <h3
                  id="inventory-transfer-title"
                  class="text-title-lg-emphasized text-main leading-tight">
                  Transferencia Inter-Almacén
                </h3>
                <p class="text-body-sm text-muted truncate mt-0.5">
                  {{ activeVariant.productName }}
                </p>
              </div>
            </div>

            <m3-button
              [iconOnly]="true"
              variant="text"
              size="sm"
              icon="close"
              ariaLabel="Cerrar transferencia inter-almacén"
              (action)="close.emit()" />
          </header>
        </div>

        <form (ngSubmit)="submit()" novalidate class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar px-5 sm:px-6 py-2 flex flex-col gap-4">
            <!-- Unified M3 Filled Select Route Selectors -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div class="inv-filled-select">
                <label for="transfer-from-wh" class="inv-filled-select__label">Almacén Origen</label>
                <select
                  id="transfer-from-wh"
                  name="fromWarehouse"
                  [value]="fromWh()"
                  (change)="onFromWarehouseChange($any($event.target).value)"
                  class="m3-select">
                  @for (wh of warehouses(); track wh.id) {
                    <option [value]="wh.id" [selected]="wh.id === fromWh()">{{ wh.name }}</option>
                  }
                </select>
              </div>

              <div class="inv-filled-select">
                <label for="transfer-to-wh" class="inv-filled-select__label">Almacén Destino</label>
                <select
                  id="transfer-to-wh"
                  name="toWarehouse"
                  [value]="toWh()"
                  (change)="onToWarehouseChange($any($event.target).value)"
                  class="m3-select">
                  @for (wh of warehouses(); track wh.id) {
                    <option [value]="wh.id" [selected]="wh.id === toWh()" [disabled]="wh.id === fromWh()">{{ wh.name }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Live Before -> After Route Simulator -->
            <section
              aria-label="Simulación en vivo de impacto en almacenes"
              class="bg-surface rounded-m3-xl p-3.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 shadow-m3-level1">
              <!-- Origin Telemetry -->
              <div class="bg-surface-low rounded-m3-lg-inc p-3 flex flex-col gap-2 min-w-0">
                <div class="flex items-center justify-between gap-1.5">
                  <span class="text-label-sm-emphasized text-muted truncate">{{ fromWhName() }}</span>
                  <span class="text-label-sm font-mono text-error px-1.5 py-0.5 rounded-m3-xs bg-error-box text-on-error-box shrink-0">
                    -{{ simulatedDelta() }}
                  </span>
                </div>
                <div class="flex items-baseline gap-1.5 font-mono tabular-nums">
                  <span class="text-label-md text-muted line-through">{{ sourceStock() }}</span>
                  <span class="material-symbols-rounded text-xs text-muted" aria-hidden="true">east</span>
                  <span class="text-title-lg-emphasized text-main">{{ projectedSourceStock() }} uds</span>
                </div>
                <m3-linear-progress
                  [value]="projectedSourcePct()"
                  size="sm"
                  [color]="projectedSourceStock() <= 5 ? 'error' : 'primary'"
                  ariaLabel="Stock proyectado en origen" />
              </div>

              <!-- Center Pulse Connector -->
              <div class="w-9 h-9 rounded-m3-full bg-primary-box text-on-primary-box grid place-items-center shrink-0 shadow-m3-level1" aria-hidden="true">
                <span class="material-symbols-rounded text-lg">local_shipping</span>
              </div>

              <!-- Destination Telemetry -->
              <div class="bg-surface-low rounded-m3-lg-inc p-3 flex flex-col gap-2 min-w-0">
                <div class="flex items-center justify-between gap-1.5">
                  <span class="text-label-sm-emphasized text-muted truncate">{{ toWhName() }}</span>
                  <span class="text-label-sm font-mono px-1.5 py-0.5 rounded-m3-xs bg-success-box text-on-success-box shrink-0">
                    +{{ simulatedDelta() }}
                  </span>
                </div>
                <div class="flex items-baseline gap-1.5 font-mono tabular-nums">
                  <span class="text-label-md text-muted">{{ destStock() }}</span>
                  <span class="material-symbols-rounded text-xs text-primary" aria-hidden="true">east</span>
                  <span class="text-title-lg-emphasized text-primary">{{ projectedDestStock() }} uds</span>
                </div>
                <m3-linear-progress
                  [value]="projectedDestPct()"
                  size="sm"
                  color="secondary"
                  ariaLabel="Stock proyectado en destino" />
              </div>
            </section>

            <!-- Quantity Stepper + Filled M3 Field -->
            <div class="bg-surface rounded-m3-xl p-4 flex flex-col gap-3">
              <div class="flex items-center justify-between gap-2">
                <span class="text-label-md-emphasized text-muted uppercase tracking-wider">Cantidad a Despachar</span>
                <span class="text-body-sm text-muted">
                  Máximo disponible: <strong class="text-main font-mono tabular-nums">{{ sourceStock() }} uds</strong>
                </span>
              </div>

              <div class="flex items-start gap-2">
                <div class="pt-1.5 shrink-0">
                  <m3-button
                    variant="tonal"
                    size="md"
                    [iconOnly]="true"
                    icon="remove"
                    ariaLabel="Disminuir cantidad"
                    [disabled]="sourceStock() === 0 || transferQty() <= 1"
                    (action)="adjustQuantity(-1)" />
                </div>

                <div class="flex-1 min-w-0">
                  <m3-text-field
                    [id]="'transfer-qty-input'"
                    name="transferQuantity"
                    variant="filled"
                    label="Cantidad *"
                    type="number"
                    inputMode="numeric"
                    suffix="uds"
                    [required]="true"
                    [disabled]="sourceStock() === 0"
                    [errorText]="transferQtyError()"
                    [value]="transferQty().toString()"
                    (valueChange)="onQuantityInput($event)" />
                </div>

                <div class="pt-1.5 shrink-0">
                  <m3-button
                    variant="tonal"
                    size="md"
                    [iconOnly]="true"
                    icon="add"
                    ariaLabel="Aumentar cantidad"
                    [disabled]="sourceStock() === 0 || transferQty() >= sourceStock()"
                    (action)="adjustQuantity(1)" />
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2 pt-0.5">
                <m3-button
                  variant="tonal"
                  size="xs"
                  [disabled]="sourceStock() === 0 || transferQty() >= sourceStock()"
                  (action)="adjustQuantity(5)">
                  +5 uds
                </m3-button>
                <m3-button
                  variant="tonal"
                  size="xs"
                  [disabled]="sourceStock() === 0 || transferQty() >= sourceStock()"
                  (action)="adjustQuantity(10)">
                  +10 uds
                </m3-button>
                <m3-button
                  variant="text"
                  size="xs"
                  [disabled]="sourceStock() === 0"
                  (action)="setMaxQuantity()">
                  Todo ({{ sourceStock() }})
                </m3-button>
              </div>

              @if (sourceStock() === 0) {
                <p role="alert" class="text-body-sm font-medium bg-error-box text-on-error-box px-3.5 py-2.5 rounded-m3-lg flex items-center gap-2 m3-anim-item-in">
                  <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">error</span>
                  <span>No hay unidades disponibles de {{ activeVariant.variantSku }} en esta sede de origen.</span>
                </p>
              }
            </div>

            <m3-text-field
              [id]="'transfer-operator'"
              name="operator"
              variant="filled"
              label="Operador de Despacho *"
              placeholder="Nombre del encargado (ej. Juan Pérez)"
              icon="person"
              autocomplete="name"
              [required]="true"
              [showValidState]="true"
              [value]="operator()"
              (valueChange)="operator.set($event)" />
          </div>
        </form>
      }

      <div dialog-actions class="flex items-center justify-end gap-3 w-full">
        <m3-button
          type="button"
          variant="text"
          size="md"
          (action)="close.emit()">
          Cancelar
        </m3-button>
        <m3-button
          type="submit"
          variant="filled"
          size="md"
          [morph]="true"
          icon="local_shipping"
          [disabled]="!canSubmit()"
          (action)="submit()">
          Confirmar Despacho
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class InventoryTransferModalComponent {
  readonly open = input<boolean>(false);
  readonly variant = input<ActiveTransferVariant | null>(null);
  readonly product = input.required<MasterProduct>();
  readonly warehouses = input.required<Warehouse[]>();
  readonly selectedWarehouseId = input.required<string>();
  readonly isDialogTransitionActive = input<boolean>(false);

  readonly close = output<void>();
  readonly confirmTransfer = output<TransferDispatchPayload>();

  readonly fromWh = signal<string>('WH-CENTRAL');
  readonly toWh = signal<string>('WH-MIRAFLORES');
  readonly transferQty = signal<number>(5);
  readonly operator = signal<string>('Carlos M.');

  readonly sourceStock = computed<number>(() => {
    const sku = this.variant()?.variantSku;
    if (!sku) return 0;
    const whId = this.fromWh();
    const cell = this.product().cells.find(
      c => c.variantSku === sku && c.warehouseId === whId
    );
    return cell?.stock ?? 0;
  });

  readonly destStock = computed<number>(() => {
    const sku = this.variant()?.variantSku;
    if (!sku) return 0;
    const whId = this.toWh();
    const cell = this.product().cells.find(
      c => c.variantSku === sku && c.warehouseId === whId
    );
    return cell?.stock ?? 0;
  });

  readonly simulatedDelta = computed<number>(() => {
    const max = this.sourceStock();
    if (max <= 0) return 0;
    return Math.max(0, Math.min(max, this.transferQty()));
  });

  readonly projectedSourceStock = computed<number>(() =>
    Math.max(0, this.sourceStock() - this.simulatedDelta())
  );

  readonly projectedDestStock = computed<number>(() =>
    this.destStock() + this.simulatedDelta()
  );

  readonly projectedSourcePct = computed<number>(() => {
    const baseline = Math.max(this.sourceStock(), 20);
    return Math.min(100, Math.round((this.projectedSourceStock() / baseline) * 100));
  });

  readonly projectedDestPct = computed<number>(() => {
    const baseline = Math.max(this.projectedDestStock(), 20);
    return Math.min(100, Math.round((this.projectedDestStock() / baseline) * 100));
  });

  readonly fromWhName = computed<string>(() => {
    const wh = this.warehouses().find(w => w.id === this.fromWh());
    return wh ? wh.name.replace('Almacén ', '') : this.fromWh();
  });

  readonly toWhName = computed<string>(() => {
    const wh = this.warehouses().find(w => w.id === this.toWh());
    return wh ? wh.name.replace('Almacén ', '') : this.toWh();
  });

  readonly transferQtyError = computed<string | null>(() => {
    if (this.sourceStock() > 0 && this.transferQty() > this.sourceStock()) {
      return `Máximo disponible: ${this.sourceStock()} uds.`;
    }
    return null;
  });

  readonly canSubmit = computed<boolean>(() => {
    if (!this.variant()) return false;
    const qty = this.transferQty();
    const max = this.sourceStock();
    return max > 0 && qty >= 1 && qty <= max && this.fromWh() !== this.toWh();
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const activeVariant = this.variant();
      if (isOpen && activeVariant) {
        untracked(() => this.syncInitialState());
      }
    });
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
    const activeVariant = this.variant();
    if (!this.canSubmit() || !activeVariant) return;
    this.confirmTransfer.emit({
      fromWhId: this.fromWh(),
      toWhId: this.toWh(),
      variantSku: activeVariant.variantSku,
      quantity: this.transferQty(),
      operator: this.operator().trim() || 'Operador Central'
    });
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
