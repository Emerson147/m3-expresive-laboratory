import { NgTemplateOutlet } from '@angular/common';
import {
  ApplicationRef,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { PosCustomer, PosProduct, PosService } from '../../core/pos/pos.service';
import { PosCatalogComponent } from './components/pos-catalog.component';
import { PosCheckoutModalComponent } from './components/pos-checkout-modal.component';
import { PosCustomerModalComponent } from './components/pos-customer-modal.component';
import { PosCustomizerModalComponent } from './components/pos-customizer-modal.component';
import { PosReceiptModalComponent } from './components/pos-receipt-modal.component';
import { PosShortcutsModalComponent } from './components/pos-shortcuts-modal.component';
import { PosServiceChannel, PosTicketComponent } from './components/pos-ticket.component';

type DialogMorphOwner = 'catalog' | 'modal' | null;
type CheckoutMorphOwner = 'ticket' | 'checkout' | 'receipt' | null;

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    PosCatalogComponent,
    PosTicketComponent,
    PosCheckoutModalComponent,
    PosReceiptModalComponent,
    PosCustomerModalComponent,
    PosShortcutsModalComponent,
    PosCustomizerModalComponent
  ],
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden gap-3'
  },
  template: `
    <div
      role="tablist"
      aria-label="Vistas del punto de venta"
      class="lg:hidden shrink-0 grid grid-cols-2 gap-1 p-1 rounded-full bg-surface-high border border-outline-sub">
      <button
        type="button"
        role="tab"
        [attr.aria-selected]="mobilePane() === 'catalog'"
        (click)="mobilePane.set('catalog')"
        [class]="mobilePane() === 'catalog' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
        class="btn-m3 state-layer focus-ring-m3 min-h-10 rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer">
        <span class="material-symbols-rounded text-sm" aria-hidden="true">storefront</span>
        <span>Menú ({{ posService.filteredProducts().length }})</span>
      </button>
      <button
        type="button"
        role="tab"
        [attr.aria-selected]="mobilePane() === 'ticket'"
        (click)="mobilePane.set('ticket')"
        [class]="mobilePane() === 'ticket' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
        class="btn-m3 state-layer focus-ring-m3 min-h-10 rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer">
        <span class="material-symbols-rounded text-sm" aria-hidden="true">receipt_long</span>
        <span>Comanda ({{ posService.cartCount() }})</span>
      </button>
    </div>

    <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
      <app-pos-catalog
        [class]="(mobilePane() === 'catalog' ? 'flex' : 'hidden lg:flex') + ' lg:col-span-7 xl:col-span-8 min-w-0 min-h-0'"
        [products]="posService.filteredProducts()"
        [categories]="posService.categories"
        [selectedCategory]="posService.selectedCategory()"
        [searchQuery]="posService.searchQuery()"
        [cart]="posService.cart()"
        [shiftInfo]="posService.shiftInfo()"
        [activeCustomizerOriginId]="customizerMorphOwner() === 'catalog' ? morphProductId() : null"
        [hiddenCustomizerOriginId]="customizingProduct()?.id ?? null"
        (searchChange)="posService.searchQuery.set($event)"
        (categoryChange)="posService.selectedCategory.set($event)"
        (openShortcuts)="openShortcutsModal()"
        (addProduct)="posService.addToCart($event)"
        (updateQuantity)="posService.updateQuantity($event.productId, $event.delta)"
        (customizeProduct)="openCustomizer($event)" />

      <app-pos-ticket
        [class]="(mobilePane() === 'ticket' ? 'flex' : 'hidden lg:flex') + ' lg:col-span-5 xl:col-span-4 min-w-0 min-h-0'"
        [cart]="posService.cart()"
        [cartCount]="posService.cartCount()"
        [orderCode]="posService.activeOrderCode()"
        [tableNumber]="posService.tableNumber()"
        [availableTables]="posService.availableTables"
        [serviceChannel]="posService.serviceChannel()"
        [voucherType]="posService.voucherType()"
        [customer]="posService.customer()"
        [discountPercent]="posService.discountPercent()"
        [subtotal]="posService.subtotal()"
        [discount]="posService.discount()"
        [tax]="posService.tax()"
        [total]="posService.total()"
        [isCheckoutTransitionOrigin]="checkoutMorphOwner() === 'ticket'"
        [isCheckoutTriggerInvisible]="posService.isCheckoutOpen() || posService.isReceiptOpen()"
        (channelChange)="setChannel($event)"
        (tableChange)="posService.setTableNumber($event)"
        (voucherTypeChange)="posService.setVoucherType($event)"
        (editCustomer)="openCustomerModal()"
        (updateLineQuantity)="posService.updateLineQuantity($event.lineId, $event.delta)"
        (removeLine)="posService.removeLine($event)"
        (discountChange)="posService.discountPercent.set($event)"
        (clearCart)="posService.clearCart()"
        (checkout)="openCheckout()" />
    </div>

    @if (mobilePane() === 'catalog' && posService.cartCount() > 0) {
      <div class="lg:hidden shrink-0 m3-anim-item-in">
        <button
          type="button"
          (click)="mobilePane.set('ticket')"
          class="btn-m3 state-layer focus-ring-m3 w-full min-h-12 px-4 py-2.5 rounded-m3-lg bg-primary text-on-primary shadow-lg flex items-center justify-between gap-3 cursor-pointer">
          <div class="flex items-center gap-2 text-xs font-bold">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">shopping_bag</span>
            <span>Ver Comanda · {{ posService.cartCount() }} {{ posService.cartCount() === 1 ? 'ítem' : 'ítems' }}</span>
          </div>
          <div class="flex items-center gap-1.5 font-mono font-black text-sm">
            <span>S/ {{ posService.total().toFixed(2) }}</span>
            <span class="material-symbols-rounded text-base" aria-hidden="true">arrow_forward</span>
          </div>
        </button>
      </div>
    }

    <ng-template #posModalsTemplate>
      @if (posService.isCheckoutOpen()) {
        <app-pos-checkout-modal
          [channelLabel]="channelLabel()"
          [isSurfaceTransitionActive]="checkoutMorphOwner() === 'checkout'"
          (close)="closeCheckout()"
          (saleConfirmed)="confirmSale()" />
      }

      @if (posService.isReceiptOpen() && posService.lastCompletedSale(); as sale) {
        <app-pos-receipt-modal
          [sale]="sale"
          [channelLabel]="channelLabel()"
          [isSurfaceTransitionActive]="checkoutMorphOwner() === 'receipt'"
          (print)="printReceipt()"
          (newSale)="dismissReceipt(true)" />
      }

      @if (isCustomerModalOpen()) {
        <app-pos-customer-modal
          [initialCustomer]="posService.customer()"
          (close)="closeCustomerModal()"
          (save)="saveCustomer($event)" />
      }

      @if (isShortcutsModalOpen()) {
        <app-pos-shortcuts-modal
          (close)="closeShortcutsModal()" />
      }

      @if (customizingProduct(); as product) {
        <app-pos-customizer-modal
          [product]="product"
          [isDialogTransitionActive]="customizerMorphOwner() === 'modal'"
          (close)="closeCustomizer()"
          (confirm)="addCustomizedToCart($event)" />
      }
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="posModalsTemplate" />
    }
  `
})
export class PosComponent {
  readonly posService = inject(PosService);
  readonly stageOverlay = inject(StageOverlayService);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly catalog = viewChild(PosCatalogComponent);
  private readonly posModalsTemplate = viewChild<TemplateRef<unknown>>('posModalsTemplate');
  private returnFocusEl: HTMLElement | null = null;

  readonly mobilePane = signal<'catalog' | 'ticket'>('catalog');
  readonly isCustomerModalOpen = signal<boolean>(false);
  readonly isShortcutsModalOpen = signal<boolean>(false);
  readonly customizingProduct = signal<PosProduct | null>(null);
  readonly customizerMorphOwner = signal<DialogMorphOwner>(null);
  readonly morphProductId = signal<number | null>(null);
  readonly checkoutMorphOwner = signal<CheckoutMorphOwner>(null);

  readonly hasAnyModalOpen = computed(() =>
    this.posService.isCheckoutOpen() ||
    this.posService.isReceiptOpen() ||
    this.isCustomerModalOpen() ||
    this.isShortcutsModalOpen() ||
    this.customizingProduct() !== null
  );

  readonly channelLabel = computed(() => {
    const channel = this.posService.serviceChannel();
    if (channel === 'dine-in') return this.posService.tableNumber();
    return channel === 'takeaway' ? 'Para Llevar' : 'Delivery';
  });

  constructor() {
    effect(() => {
      const tpl = this.posModalsTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    this.destroyRef.onDestroy(() => {
      const tpl = this.posModalsTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      if (this.hasAnyModalOpen()) return;
      event.preventDefault();
      this.catalog()?.focusSearch();
    } else if (event.key === 'F4') {
      event.preventDefault();
      if (this.isCustomerModalOpen()) {
        this.closeCustomerModal();
      } else if (!this.hasAnyModalOpen()) {
        this.openCustomerModal();
      }
    } else if (event.key === 'Escape') {
      if (this.customizingProduct()) this.closeCustomizer();
      else if (this.isCustomerModalOpen()) this.closeCustomerModal();
      else if (this.isShortcutsModalOpen()) this.closeShortcutsModal();
      else if (this.posService.isCheckoutOpen()) this.closeCheckout();
      else if (this.posService.isReceiptOpen()) this.dismissReceipt(false);
      else if (this.posService.searchQuery().trim()) {
        this.posService.searchQuery.set('');
      }
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      if (!this.hasAnyModalOpen() && this.posService.cart().length > 0) {
        this.openCheckout();
      }
    }
  }

  setChannel(channel: PosServiceChannel): void {
    this.posService.serviceChannel.set(channel);
  }

  openCustomizer(product: PosProduct): void {
    if (this.hasAnyModalOpen() || this.posService.remainingStock(product.id) <= 0) return;
    this.captureReturnFocus();
    this.morphProductId.set(product.id);
    this.customizerMorphOwner.set('catalog');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.customizingProduct.set(product);
        this.customizerMorphOwner.set('modal');
        this.syncOverlayState();
      },
      () => {
        this.morphProductId.set(null);
        this.customizerMorphOwner.set(null);
      }
    );
  }

  closeCustomizer(): void {
    const product = this.customizingProduct();
    if (!product) return;

    this.morphProductId.set(product.id);
    this.customizerMorphOwner.set('modal');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.customizingProduct.set(null);
        this.customizerMorphOwner.set('catalog');
        this.syncOverlayState();
      },
      () => {
        this.morphProductId.set(null);
        this.customizerMorphOwner.set(null);
        this.restoreFocusIfIdle();
      },
      { isExiting: true }
    );
  }

  addCustomizedToCart(payload: { product: PosProduct; notes: string; unitPrice?: number }): void {
    this.posService.addToCartWithCustomization(payload.product, payload.notes, payload.unitPrice);
    this.closeCustomizer();
  }

  openCheckout(): void {
    if (this.posService.isCheckoutOpen() || this.posService.cart().length === 0) return;
    this.captureReturnFocus();
    this.checkoutMorphOwner.set('ticket');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.posService.openCheckout();
        this.checkoutMorphOwner.set('checkout');
        this.syncOverlayState();
      },
      () => {
        this.checkoutMorphOwner.set(null);
      }
    );
  }

  closeCheckout(): void {
    if (!this.posService.isCheckoutOpen()) return;
    this.checkoutMorphOwner.set('checkout');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.posService.closeCheckout();
        this.checkoutMorphOwner.set('ticket');
        this.syncOverlayState();
      },
      () => {
        this.checkoutMorphOwner.set(null);
        this.restoreFocusIfIdle();
      },
      { isExiting: true }
    );
  }

  confirmSale(): void {
    if (!this.posService.isPaymentValid()) return;
    this.checkoutMorphOwner.set('checkout');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.posService.completeSale();
        this.checkoutMorphOwner.set('receipt');
        this.syncOverlayState();
      },
      () => {
        this.checkoutMorphOwner.set(null);
      }
    );
  }

  dismissReceipt(resetSale: boolean): void {
    if (!this.posService.isReceiptOpen()) return;
    this.checkoutMorphOwner.set('receipt');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        if (resetSale) {
          this.posService.newSale();
          this.mobilePane.set('catalog');
        } else {
          this.posService.isReceiptOpen.set(false);
        }
        this.checkoutMorphOwner.set('ticket');
        this.syncOverlayState();
      },
      () => {
        this.checkoutMorphOwner.set(null);
        this.restoreFocusIfIdle();
      },
      { isExiting: true }
    );
  }

  openCustomerModal(): void {
    if (this.hasAnyModalOpen()) return;
    this.captureReturnFocus();
    this.isCustomerModalOpen.set(true);
    this.syncOverlayState();
  }

  closeCustomerModal(): void {
    if (!this.isCustomerModalOpen()) return;
    this.isCustomerModalOpen.set(false);
    this.syncOverlayState();
    this.restoreFocusIfIdle();
  }

  saveCustomer(customer: PosCustomer): void {
    this.posService.setCustomer(customer);
    this.closeCustomerModal();
  }

  openShortcutsModal(): void {
    if (this.hasAnyModalOpen()) return;
    this.captureReturnFocus();
    this.isShortcutsModalOpen.set(true);
    this.syncOverlayState();
  }

  closeShortcutsModal(): void {
    if (!this.isShortcutsModalOpen()) return;
    this.isShortcutsModalOpen.set(false);
    this.syncOverlayState();
    this.restoreFocusIfIdle();
  }

  printReceipt(): void {
    window.print();
  }

  private syncOverlayState(): void {
    this.stageOverlay.setOverlayOpen(this.hasAnyModalOpen());
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
