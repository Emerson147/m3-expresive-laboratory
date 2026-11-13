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
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden'
  },
  template: `
    <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-full overflow-hidden">
      <app-pos-catalog
        class="lg:col-span-7 xl:col-span-8 min-w-0"
        [products]="posService.filteredProducts()"
        [categories]="posService.categories"
        [selectedCategory]="posService.selectedCategory()"
        [searchQuery]="posService.searchQuery()"
        [cart]="posService.cart()"
        [activeCustomizerOriginId]="customizerMorphOwner() === 'catalog' ? morphProductId() : null"
        [hiddenCustomizerOriginId]="customizingProduct()?.id ?? null"
        (searchChange)="posService.searchQuery.set($event)"
        (categoryChange)="posService.selectedCategory.set($event)"
        (openShortcuts)="openShortcutsModal()"
        (addProduct)="posService.addToCart($event)"
        (updateQuantity)="posService.updateQuantity($event.productId, $event.delta)"
        (customizeProduct)="openCustomizer($event)" />

      <app-pos-ticket
        class="lg:col-span-5 xl:col-span-4 min-w-0"
        [cart]="posService.cart()"
        [cartCount]="posService.cartCount()"
        [tableNumber]="posService.tableNumber()"
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
        (voucherTypeChange)="posService.setVoucherType($event)"
        (editCustomer)="openCustomerModal()"
        (updateQuantity)="posService.updateQuantity($event.productId, $event.delta)"
        (removeItem)="posService.removeFromCart($event)"
        (discountChange)="posService.discountPercent.set($event)"
        (clearCart)="posService.clearCart()"
        (checkout)="openCheckout()" />
    </div>

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
    if (this.hasAnyModalOpen()) return;
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

  addCustomizedToCart(payload: { product: PosProduct; notes: string }): void {
    this.posService.addToCartWithNotes(payload.product, payload.notes);
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
