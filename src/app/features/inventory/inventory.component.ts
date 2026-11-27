import { NgTemplateOutlet } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { CreateMasterProductDto } from '../../core/inventory/inventory.models';
import { InventoryService } from '../../core/inventory/inventory.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { M3FabComponent } from '../../shared/components/button/fab.component';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TabItem, M3TabsComponent } from '../../shared/components/tabs/tabs.component';
import { InventoryAuditDrawerComponent } from './components/inventory-audit-drawer.component';
import {
  InventoryCatalogComponent,
  InventoryCategoryOption
} from './components/inventory-catalog.component';
import { InventoryCreateModalComponent } from './components/inventory-create-modal.component';
import { INVENTORY_EXPRESSIVE_STYLES } from './components/inventory-expressive.styles';
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
    M3FabComponent,
    M3SnackbarComponent,
    M3TabsComponent,
    InventoryHeaderComponent,
    InventoryCatalogComponent,
    InventoryMatrixComponent,
    InventoryAuditDrawerComponent,
    InventoryTransferModalComponent,
    InventoryCreateModalComponent
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [INVENTORY_EXPRESSIVE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface'
  },
  template: `
    <div
      [class]="adaptiveLayout.isCompact()
        ? 'inv-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 gap-4 m3-scrollbar'
        : 'inv-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 py-4 pb-10 gap-3.5 m3-scrollbar'">

      <app-inventory-header
        [warehouses]="inventoryService.warehouses()"
        [selectedWarehouseId]="inventoryService.selectedWarehouseId()"
        [activeWarehouseName]="inventoryService.activeWarehouse().name"
        [kpiSummary]="inventoryService.kpiSummary()"
        [transfersCount]="inventoryService.stockTransfers().length"
        [isAuditHistoryOpen]="inventoryService.isAuditHistoryOpen()"
        [isCreateOriginActive]="createMorphOwner() === 'header'"
        [isCreateOriginInvisible]="inventoryService.isCreateModalOpen() && createTriggerOrigin() === 'header'"
        (selectWarehouse)="inventoryService.setWarehouse($event)"
        (openCreate)="openCreateModal('header')"
        (batchReplenish)="inventoryService.batchReplenishLowStock()"
        (toggleAuditHistory)="inventoryService.toggleAuditHistory()" />

      <!-- M3 Split-Pane Mobile/Medium View Switcher (< lg) -->
      <div class="lg:hidden shrink-0">
        <m3-tabs
          variant="secondary"
          ariaLabel="Vistas del módulo de inventario"
          idPrefix="inv-tab"
          [tabs]="mobileTabs()"
          [value]="mobilePane()"
          (tabChange)="onMobileTabChange($event)" />
      </div>

      <!-- Expressive Split Workbench Body -->
      <div class="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-start">
        <app-inventory-catalog
          id="inv-panel-catalog"
          [class]="(mobilePane() === 'catalog' ? 'flex' : 'hidden') + ' lg:flex flex-col lg:w-[320px] xl:w-[340px] shrink-0'"
          [products]="inventoryService.filteredProducts()"
          [categories]="categories"
          [selectedProductId]="inventoryService.selectedProductId()"
          [searchQuery]="inventoryService.searchQuery()"
          [selectedCategory]="inventoryService.selectedCategory()"
          [transitioningProductId]="inventoryService.transitioningProductId()"
          [transitionPhase]="inventoryService.transitionPhase()"
          [isCatalogFlipActive]="isCatalogFlipActive()"
          (searchChange)="inventoryService.setSearchQuery($event)"
          (categoryChange)="onCategoryChange($event)"
          (selectProduct)="selectProductAndSwitchPane($event)"
          (clearFilters)="clearCatalogFilters()" />

        <app-inventory-matrix
          id="inv-panel-matrix"
          [class]="(mobilePane() === 'matrix' ? 'flex' : 'hidden') + ' lg:flex flex-col flex-1 min-w-0 w-full'"
          [product]="inventoryService.selectedProduct()"
          [rows]="inventoryService.matrixRows()"
          [columns]="inventoryService.matrixColumns()"
          [activeLowThreshold]="inventoryService.activeLowThreshold()"
          [selectedWarehouseId]="inventoryService.selectedWarehouseId()"
          [warehouses]="inventoryService.warehouses()"
          [transitionPhase]="inventoryService.transitionPhase()"
          [(alertsOnlyMode)]="alertsOnlyMode"
          [activeTransferOriginSku]="transferMorphOwner() === 'matrix' ? transferOriginSku() : null"
          [hiddenTransferOriginSku]="inventoryService.isTransferModalOpen() ? transferOriginSku() : null"
          (adjustStock)="inventoryService.adjustStock($event.variantSku, $event.delta)"
          (openTransfer)="openTransferModal($event)" />

        @if (inventoryService.isAuditHistoryOpen()) {
          <app-inventory-audit-drawer
            class="shrink-0 2xl:sticky 2xl:top-0 2xl:max-h-[calc(100dvh-2.5rem)]"
            [transfers]="inventoryService.stockTransfers()"
            [warehouses]="inventoryService.warehouses()"
            (close)="inventoryService.toggleAuditHistory()" />
        }
      </div>

      <!-- Compact/Medium Floating Action Button (< lg) -->
      <div
        class="lg:hidden fixed bottom-24 right-4 sm:right-5 z-30"
        [class.invisible]="inventoryService.isCreateModalOpen() && createTriggerOrigin() === 'fab'"
        [style.view-transition-name]="createMorphOwner() === 'fab' ? 'dialog-transform' : null">
        <m3-fab
          variant="primary"
          icon="add"
          label="Nueva"
          ariaLabel="Crear nueva prenda en Product Studio"
          (action)="openCreateModal('fab')" />
      </div>
    </div>

    <ng-template #inventoryModalsTemplate>
      <app-inventory-transfer-modal
        [open]="inventoryService.isTransferModalOpen()"
        [variant]="inventoryService.activeTransferVariant()"
        [product]="inventoryService.selectedProduct()"
        [warehouses]="inventoryService.warehouses()"
        [selectedWarehouseId]="inventoryService.selectedWarehouseId()"
        [isDialogTransitionActive]="transferMorphOwner() === 'modal'"
        (close)="closeTransferModal()"
        (confirmTransfer)="submitTransfer($event)" />

      <app-inventory-create-modal
        [open]="inventoryService.isCreateModalOpen()"
        [warehouses]="inventoryService.warehouses()"
        [existingProducts]="inventoryService.masterProducts()"
        [isDialogTransitionActive]="createMorphOwner() === 'modal'"
        (close)="closeCreateModal()"
        (createProduct)="submitCreateProduct($event)" />
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="inventoryModalsTemplate" />
    }

    <m3-snackbar
      [open]="inventoryService.toastMessage() !== null"
      [message]="inventoryService.toastMessage() ?? ''"
      [durationMs]="0"
      (dismissed)="inventoryService.dismissToast()" />
  `
})
export class InventoryComponent {
  readonly inventoryService = inject(InventoryService);
  readonly stageOverlay = inject(StageOverlayService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly inventoryModalsTemplate = viewChild<TemplateRef<unknown>>('inventoryModalsTemplate');
  private returnFocusEl: HTMLElement | null = null;

  readonly mobilePane = signal<'catalog' | 'matrix'>('catalog');
  readonly alertsOnlyMode = signal<boolean>(false);
  readonly isCatalogFlipActive = signal<boolean>(false);
  readonly createMorphOwner = signal<'header' | 'catalog' | 'fab' | 'modal' | null>(null);
  readonly createTriggerOrigin = signal<'header' | 'catalog' | 'fab' | null>(null);
  readonly transferMorphOwner = signal<'matrix' | 'modal' | null>(null);
  readonly transferOriginSku = signal<string | null>(null);

  readonly mobileTabs = computed<M3TabItem[]>(() => [
    {
      id: 'catalog',
      label: 'Catálogo',
      icon: 'inventory_2',
      badge: this.inventoryService.filteredProducts().length,
      panelId: 'inv-panel-catalog'
    },
    {
      id: 'matrix',
      label: 'Matriz 2D',
      icon: 'grid_on',
      badge: this.inventoryService.selectedProduct().sku,
      panelId: 'inv-panel-matrix'
    }
  ]);

  readonly hasAnyModalOpen = computed(() =>
    this.inventoryService.isTransferModalOpen() || this.inventoryService.isCreateModalOpen()
  );

  readonly categories: InventoryCategoryOption[] = [
    { id: 'ALL', label: 'Todos', icon: 'apps' },
    { id: 'shirts', label: 'Camisas', icon: 'checkroom' },
    { id: 'polos', label: 'Polos', icon: 'styler' },
    { id: 'pants', label: 'Pantalones', icon: 'straighten' },
    { id: 'jackets', label: 'Casacas', icon: 'layers' }
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

  onMobileTabChange(tabId: string): void {
    this.mobilePane.set(tabId === 'matrix' ? 'matrix' : 'catalog');
  }

  onCategoryChange(category: string): void {
    if (category === this.inventoryService.selectedCategory()) return;
    this.isCatalogFlipActive.set(true);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.inventoryService.setCategory(category);
      },
      () => {
        this.isCatalogFlipActive.set(false);
      }
    );
  }

  clearCatalogFilters(): void {
    this.isCatalogFlipActive.set(true);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.inventoryService.setSearchQuery('');
        this.inventoryService.setCategory('ALL');
      },
      () => {
        this.isCatalogFlipActive.set(false);
      }
    );
  }

  selectProductAndSwitchPane(productId: number): void {
    this.inventoryService.selectProduct(productId);
    if (this.adaptiveLayout.isCompact() || this.isBelowLgViewport()) {
      this.mobilePane.set('matrix');
    }
  }

  openCreateModal(origin: 'header' | 'catalog' | 'fab' = 'header'): void {
    if (this.hasAnyModalOpen()) return;
    this.captureReturnFocus();
    this.transferMorphOwner.set(null);
    this.transferOriginSku.set(null);
    this.createTriggerOrigin.set(origin);
    this.createMorphOwner.set(origin);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.createMorphOwner.set('modal');
        this.inventoryService.openCreateModal();
        this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
      },
      () => {
        this.createMorphOwner.set(null);
      }
    );
  }

  closeCreateModal(): void {
    if (!this.inventoryService.isCreateModalOpen()) return;
    const origin = this.createTriggerOrigin() ?? 'header';
    const resolvedOrigin =
      origin === 'catalog' && this.isBelowLgViewport() && this.mobilePane() !== 'catalog' ? 'header' : origin;
    this.createMorphOwner.set('modal');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.createMorphOwner.set(resolvedOrigin);
        this.inventoryService.closeCreateModal();
        this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
      },
      () => {
        this.createMorphOwner.set(null);
        this.createTriggerOrigin.set(null);
        this.restoreFocusIfIdle();
      },
      { isExiting: true }
    );
  }

  openTransferModal(target: { variantSku: string; size: string; colorName: string }): void {
    if (this.hasAnyModalOpen()) return;
    this.captureReturnFocus();
    this.createMorphOwner.set(null);
    this.createTriggerOrigin.set(null);
    this.transferOriginSku.set(target.variantSku);
    this.transferMorphOwner.set('matrix');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.transferMorphOwner.set('modal');
        this.inventoryService.openTransferModal(target.variantSku, target.size, target.colorName);
        this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
      },
      () => {
        this.transferMorphOwner.set(null);
      }
    );
  }

  closeTransferModal(): void {
    if (!this.inventoryService.isTransferModalOpen()) return;
    this.transferMorphOwner.set('modal');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.transferMorphOwner.set('matrix');
        this.inventoryService.closeTransferModal();
        this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
      },
      () => {
        this.transferMorphOwner.set(null);
        this.transferOriginSku.set(null);
        this.restoreFocusIfIdle();
      },
      { isExiting: true }
    );
  }

  submitTransfer(payload: TransferDispatchPayload): void {
    this.transferMorphOwner.set('modal');
    this.appRef.tick();

    let succeeded = false;
    this.stageOverlay.runViewTransition(
      () => {
        succeeded = this.inventoryService.executeTransfer(
          payload.fromWhId,
          payload.toWhId,
          payload.variantSku,
          payload.quantity,
          payload.operator
        );
        this.transferMorphOwner.set(succeeded ? 'matrix' : null);
        this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
      },
      () => {
        this.transferMorphOwner.set(null);
        if (succeeded || !this.inventoryService.isTransferModalOpen()) {
          this.transferOriginSku.set(null);
          this.restoreFocusIfIdle();
        }
      },
      { isExiting: true }
    );
  }

  submitCreateProduct(dto: CreateMasterProductDto): void {
    const origin = this.createTriggerOrigin() ?? 'header';
    const shouldSwitchPane = this.adaptiveLayout.isCompact() || this.isBelowLgViewport();
    const resolvedOrigin = origin === 'catalog' && shouldSwitchPane ? 'header' : origin;
    this.createMorphOwner.set('modal');
    this.appRef.tick();

    let created = false;
    this.stageOverlay.runViewTransition(
      () => {
        created = this.inventoryService.createMasterProduct(dto);
        if (created && shouldSwitchPane) {
          this.mobilePane.set('matrix');
        }
        this.createMorphOwner.set(created ? resolvedOrigin : null);
        this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
      },
      () => {
        this.createMorphOwner.set(null);
        if (created || !this.inventoryService.isCreateModalOpen()) {
          this.createTriggerOrigin.set(null);
          this.restoreFocusIfIdle();
        }
      },
      { isExiting: true }
    );
  }

  private isBelowLgViewport(): boolean {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 1023px)').matches
      : false;
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
