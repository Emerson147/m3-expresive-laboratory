import { Component, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { PosCustomer, PosProduct, PosService } from '../../core/pos/pos.service';
import { PosCatalogComponent } from './components/pos-catalog.component';
import { PosCheckoutModalComponent } from './components/pos-checkout-modal.component';
import { PosCustomerModalComponent } from './components/pos-customer-modal.component';
import { PosCustomizerModalComponent } from './components/pos-customizer-modal.component';
import { PosReceiptModalComponent } from './components/pos-receipt-modal.component';
import { PosShortcutsModalComponent } from './components/pos-shortcuts-modal.component';
import { PosServiceChannel, PosTicketComponent } from './components/pos-ticket.component';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [
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
        (searchChange)="posService.searchQuery.set($event)"
        (categoryChange)="posService.selectedCategory.set($event)"
        (openShortcuts)="isShortcutsModalOpen.set(true)"
        (addProduct)="posService.addToCart($event)"
        (updateQuantity)="posService.updateQuantity($event.productId, $event.delta)"
        (customizeProduct)="customizingProduct.set($event)" />

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
        (channelChange)="setChannel($event)"
        (voucherTypeChange)="posService.setVoucherType($event)"
        (editCustomer)="isCustomerModalOpen.set(true)"
        (updateQuantity)="posService.updateQuantity($event.productId, $event.delta)"
        (removeItem)="posService.removeFromCart($event)"
        (discountChange)="posService.discountPercent.set($event)"
        (clearCart)="posService.clearCart()"
        (checkout)="posService.openCheckout()" />
    </div>

    @if (posService.isCheckoutOpen()) {
      <app-pos-checkout-modal
        [channelLabel]="channelLabel()"
        (close)="posService.closeCheckout()" />
    }

    @if (posService.isReceiptOpen() && posService.lastCompletedSale(); as sale) {
      <app-pos-receipt-modal
        [sale]="sale"
        [channelLabel]="channelLabel()"
        (print)="printReceipt()"
        (newSale)="posService.newSale()" />
    }

    @if (isCustomerModalOpen()) {
      <app-pos-customer-modal
        [initialCustomer]="posService.customer()"
        (close)="isCustomerModalOpen.set(false)"
        (save)="saveCustomer($event)" />
    }

    @if (isShortcutsModalOpen()) {
      <app-pos-shortcuts-modal
        (close)="isShortcutsModalOpen.set(false)" />
    }

    @if (customizingProduct(); as product) {
      <app-pos-customizer-modal
        [product]="product"
        (close)="customizingProduct.set(null)"
        (confirm)="addCustomizedToCart($event)" />
    }
  `
})
export class PosComponent {
  readonly posService = inject(PosService);
  private readonly catalog = viewChild(PosCatalogComponent);

  readonly isCustomerModalOpen = signal<boolean>(false);
  readonly isShortcutsModalOpen = signal<boolean>(false);
  readonly customizingProduct = signal<PosProduct | null>(null);

  readonly channelLabel = computed(() => {
    const channel = this.posService.serviceChannel();
    if (channel === 'dine-in') return this.posService.tableNumber();
    return channel === 'takeaway' ? 'Para Llevar' : 'Delivery';
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      event.preventDefault();
      this.catalog()?.focusSearch();
    } else if (event.key === 'F4') {
      event.preventDefault();
      this.isCustomerModalOpen.update(open => !open);
    } else if (event.key === 'Escape') {
      if (this.customizingProduct()) this.customizingProduct.set(null);
      if (this.isCustomerModalOpen()) this.isCustomerModalOpen.set(false);
      if (this.isShortcutsModalOpen()) this.isShortcutsModalOpen.set(false);
      if (this.posService.isCheckoutOpen()) this.posService.closeCheckout();
      if (this.posService.isReceiptOpen()) this.posService.isReceiptOpen.set(false);
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      if (!this.posService.isCheckoutOpen() && this.posService.cart().length > 0) {
        this.posService.openCheckout();
      }
    }
  }

  setChannel(channel: PosServiceChannel): void {
    this.posService.serviceChannel.set(channel);
  }

  saveCustomer(customer: PosCustomer): void {
    this.posService.setCustomer(customer);
    this.isCustomerModalOpen.set(false);
  }

  addCustomizedToCart(payload: { product: PosProduct; notes: string }): void {
    this.posService.addToCartWithNotes(payload.product, payload.notes);
    this.customizingProduct.set(null);
  }

  printReceipt(): void {
    window.print();
  }
}
