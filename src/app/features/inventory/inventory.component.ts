import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  TemplateRef,
  computed,
  effect,
  inject,
  viewChild
} from '@angular/core';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { CreateMasterProductDto } from '../../core/inventory/inventory.models';
import { InventoryService } from '../../core/inventory/inventory.service';
import { InventoryAuditDrawerComponent } from './components/inventory-audit-drawer.component';
import {
  InventoryCatalogComponent,
  InventoryCategoryOption
} from './components/inventory-catalog.component';
import { InventoryCreateModalComponent } from './components/inventory-create-modal.component';
import { InventoryHeaderComponent } from './components/inventory-header.component';
import { InventoryMatrixComponent } from './components/inventory-matrix.component';
import {
  InventoryTransferModalComponent,
  TransferDispatchPayload
} from './components/inventory-transfer-modal.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    InventoryHeaderComponent,
    InventoryCatalogComponent,
    InventoryMatrixComponent,
    InventoryAuditDrawerComponent,
    InventoryTransferModalComponent,
    InventoryCreateModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface'
  },
  template: `
    <div class="flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 py-4 space-y-5 m3-scrollbar">
      <app-inventory-header
        [warehouses]="inventoryService.warehouses()"
        [selectedWarehouseId]="inventoryService.selectedWarehouseId()"
        [activeWarehouseName]="inventoryService.activeWarehouse().name"
        [kpiSummary]="inventoryService.kpiSummary()"
        [transfersCount]="inventoryService.stockTransfers().length"
        [isAuditHistoryOpen]="inventoryService.isAuditHistoryOpen()"
        (selectWarehouse)="inventoryService.setWarehouse($event)"
        (openCreate)="openCreateModal()"
        (batchReplenish)="inventoryService.batchReplenishLowStock()"
        (toggleAuditHistory)="inventoryService.toggleAuditHistory()" />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <app-inventory-catalog
          class="lg:col-span-4 xl:col-span-3"
          [products]="inventoryService.filteredProducts()"
          [categories]="categories"
          [selectedProductId]="inventoryService.selectedProductId()"
          [searchQuery]="inventoryService.searchQuery()"
          [selectedCategory]="inventoryService.selectedCategory()"
          [transitioningProductId]="inventoryService.transitioningProductId()"
          [transitionPhase]="inventoryService.transitionPhase()"
          (searchChange)="inventoryService.setSearchQuery($event)"
          (categoryChange)="inventoryService.setCategory($event)"
          (selectProduct)="inventoryService.selectProduct($event)"
          (openCreate)="openCreateModal()"
          (clearFilters)="clearCatalogFilters()" />

        <app-inventory-matrix
          class="lg:col-span-8 xl:col-span-9"
          [product]="inventoryService.selectedProduct()"
          [rows]="inventoryService.matrixRows()"
          [columns]="inventoryService.matrixColumns()"
          [activeLowThreshold]="inventoryService.activeLowThreshold()"
          [selectedWarehouseId]="inventoryService.selectedWarehouseId()"
          [warehouses]="inventoryService.warehouses()"
          [transitionPhase]="inventoryService.transitionPhase()"
          (adjustStock)="inventoryService.adjustStock($event.variantSku, $event.delta)"
          (openTransfer)="openTransferModal($event)" />
      </div>

      @if (inventoryService.isAuditHistoryOpen()) {
        <app-inventory-audit-drawer
          [transfers]="inventoryService.stockTransfers()"
          [warehouses]="inventoryService.warehouses()"
          (close)="inventoryService.toggleAuditHistory()" />
      }
    </div>

    <ng-template #inventoryModalsTemplate>
      @if (inventoryService.isTransferModalOpen() && inventoryService.activeTransferVariant(); as variant) {
        <app-inventory-transfer-modal
          [variant]="variant"
          [product]="inventoryService.selectedProduct()"
          [warehouses]="inventoryService.warehouses()"
          [selectedWarehouseId]="inventoryService.selectedWarehouseId()"
          (close)="closeTransferModal()"
          (confirmTransfer)="submitTransfer($event)" />
      }

      @if (inventoryService.isCreateModalOpen()) {
        <app-inventory-create-modal
          [warehouses]="inventoryService.warehouses()"
          [existingProducts]="inventoryService.masterProducts()"
          (close)="closeCreateModal()"
          (createProduct)="submitCreateProduct($event)" />
      }
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="inventoryModalsTemplate" />
    }

    @if (inventoryService.toastMessage(); as toast) {
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-surface-box border border-primary text-main shadow-2xl flex items-center gap-3 m3-anim-item-in">
        <span class="material-symbols-rounded text-primary text-xl" aria-hidden="true">check_circle</span>
        <span class="text-xs font-semibold">{{ toast }}</span>
        <button
          type="button"
          aria-label="Cerrar notificación"
          (click)="inventoryService.dismissToast()"
          class="w-6 h-6 rounded-full hover:bg-surface-high text-muted hover:text-main grid place-items-center cursor-pointer">
          <span class="material-symbols-rounded text-sm" aria-hidden="true">close</span>
        </button>
      </div>
    }
  `
})
export class InventoryComponent {
  readonly inventoryService = inject(InventoryService);
  readonly stageOverlay = inject(StageOverlayService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly inventoryModalsTemplate = viewChild<TemplateRef<unknown>>('inventoryModalsTemplate');
  private returnFocusEl: HTMLElement | null = null;

  readonly hasAnyModalOpen = computed(() =>
    this.inventoryService.isTransferModalOpen() || this.inventoryService.isCreateModalOpen()
  );

  readonly categories: InventoryCategoryOption[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'shirts', label: 'Camisas' },
    { id: 'polos', label: 'Polos' },
    { id: 'pants', label: 'Pantalones' },
    { id: 'jackets', label: 'Casacas' }
  ];

  constructor() {
    effect(() => {
      const tpl = this.inventoryModalsTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    effect(() => {
      this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
    });

    this.destroyRef.onDestroy(() => {
      const tpl = this.inventoryModalsTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;

    if (this.inventoryService.isCreateModalOpen()) {
      event.preventDefault();
      this.closeCreateModal();
    } else if (this.inventoryService.isTransferModalOpen()) {
      event.preventDefault();
      this.closeTransferModal();
    } else if (this.inventoryService.isAuditHistoryOpen()) {
      event.preventDefault();
      this.inventoryService.toggleAuditHistory();
    } else if (this.inventoryService.toastMessage()) {
      this.inventoryService.dismissToast();
    } else if (this.inventoryService.searchQuery().trim()) {
      this.inventoryService.setSearchQuery('');
    }
  }

  clearCatalogFilters(): void {
    this.inventoryService.setSearchQuery('');
    this.inventoryService.setCategory('ALL');
  }

  openCreateModal(): void {
    this.captureReturnFocus();
    this.inventoryService.openCreateModal();
  }

  closeCreateModal(): void {
    this.inventoryService.closeCreateModal();
    this.restoreFocusIfIdle();
  }

  openTransferModal(target: { variantSku: string; size: string; colorName: string }): void {
    this.captureReturnFocus();
    this.inventoryService.openTransferModal(target.variantSku, target.size, target.colorName);
  }

  closeTransferModal(): void {
    this.inventoryService.closeTransferModal();
    this.restoreFocusIfIdle();
  }

  submitTransfer(payload: TransferDispatchPayload): void {
    const succeeded = this.inventoryService.executeTransfer(
      payload.fromWhId,
      payload.toWhId,
      payload.variantSku,
      payload.quantity,
      payload.operator
    );
    if (succeeded) {
      this.restoreFocusIfIdle();
    }
  }

  submitCreateProduct(dto: CreateMasterProductDto): void {
    const created = this.inventoryService.createMasterProduct(dto);
    if (created) {
      this.restoreFocusIfIdle();
    }
  }

  private captureReturnFocus(): void {
    if (!this.hasAnyModalOpen() && typeof document !== 'undefined') {
      const active = document.activeElement;
      this.returnFocusEl = active instanceof HTMLElement ? active : null;
    }
  }

  private restoreFocusIfIdle(): void {
    if (this.hasAnyModalOpen() || !this.returnFocusEl) return;
    const target = this.returnFocusEl;
    this.returnFocusEl = null;
    queueMicrotask(() => {
      if (!this.hasAnyModalOpen() && target.isConnected) {
        target.focus();
      }
    });
  }
}
