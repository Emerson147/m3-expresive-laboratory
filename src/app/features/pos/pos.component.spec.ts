import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { App } from '../../app';
import { routes } from '../../app.routes';
import { PosService } from '../../core/pos/pos.service';
import { POS_EXPRESSIVE_CSS } from './components/pos-expressive.styles';
import { PosComponent } from './pos.component';

describe('PosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosComponent]
    }).compileComponents();
  });

  function setup() {
    const posService = TestBed.inject(PosService);
    posService.newSale();
    posService.selectedCategory.set('all');
    posService.searchQuery.set('');

    const fixture = TestBed.createComponent(PosComponent);
    fixture.detectChanges();
    return { fixture, posService };
  }

  it('focuses the M3 search input inside <search> when pressing F2', () => {
    const { fixture } = setup();
    const searchInput = fixture.nativeElement.querySelector('search m3-text-field input[type="search"]') as HTMLInputElement;
    expect(searchInput).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(searchInput);
  });

  it('renders M3 tonal cards, button groups, and touch-target-48 steppers without outlined clutter', () => {
    const { fixture, posService } = setup();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('app-pos-catalog m3-card').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('app-pos-catalog m3-chip').length).toBe(posService.categories.length);
    expect(el.querySelectorAll('app-pos-ticket m3-button-group').length).toBeGreaterThanOrEqual(3);
    expect(el.querySelectorAll('app-pos-ticket .pos-ticket-group').length).toBe(2);
    expect(el.querySelectorAll('.m3-card-outlined').length).toBe(0);
    expect(el.querySelectorAll('.m3-btn-outlined').length).toBe(0);
    expect(POS_EXPRESSIVE_CSS).toContain('@media print');
    expect(POS_EXPRESSIVE_CSS).toContain('pos-receipt-dialog');

    const firstProductBtn = el.querySelector('app-pos-catalog m3-card > button') as HTMLButtonElement;
    firstProductBtn.click();
    fixture.detectChanges();

    expect(posService.cartCount()).toBe(1);
    expect(el.textContent).toContain('1 ítem');
    const ticketMinus = el.querySelector('app-pos-ticket button[aria-label^="Disminuir"]') as HTMLButtonElement;
    expect(ticketMinus).toBeTruthy();
    expect(ticketMinus.classList.contains('touch-target-48')).toBe(true);
  });

  it('opens the native customizer <dialog>, applies extra pricing, and splits variant cart lines', () => {
    const { fixture, posService } = setup();
    const espresso = posService.products()[0];
    posService.addToCart(espresso);
    fixture.detectChanges();

    const optionsBtn = fixture.nativeElement.querySelector('app-pos-catalog m3-button[icon="tune"] button') as HTMLButtonElement;

    optionsBtn.click();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('app-pos-customizer-modal dialog.m3-dialog[open]') as HTMLDialogElement;
    expect(dialog).toBeTruthy();

    const baseBtns = Array.from(dialog.querySelectorAll('[aria-label^="Seleccionar"] button')) as HTMLButtonElement[];
    expect(baseBtns.length).toBeGreaterThan(1);
    expect(baseBtns[1].classList.contains('bg-surface-low')).toBe(true);

    const extraChips = Array.from(dialog.querySelectorAll('m3-chip button')) as HTMLButtonElement[];
    expect(extraChips.length).toBeGreaterThan(0);
    extraChips[0].click(); // Double Charge (+3.00)
    fixture.detectChanges();

    const addCustomizedBtn = dialog.querySelector('[dialog-actions] m3-button[icon="shopping_bag"] button') as HTMLButtonElement;
    addCustomizedBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pos-customizer-modal dialog.m3-dialog[open]')).toBeNull();
    expect(posService.cart().length).toBe(2);
    expect(posService.cart()[0].unitPrice).toBe(espresso.price);
    expect(posService.cart()[1].notes).toBeTruthy();
    expect(posService.cart()[1].unitPrice).toBeGreaterThan(espresso.price);
  });

  it('opens native checkout <dialog> via Ctrl+Enter, renders GPU aurora layers, and shows M3 loading indicator in card mode', () => {
    const { fixture, posService } = setup();
    posService.addToCart(posService.products()[0]);
    fixture.detectChanges();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
    fixture.detectChanges();

    const checkoutDialog = fixture.nativeElement.querySelector('app-pos-checkout-modal dialog.m3-dialog[open]') as HTMLDialogElement;
    expect(checkoutDialog).toBeTruthy();
    expect(checkoutDialog.querySelectorAll('.m3-aurora-glow .m3-aurora-orb').length).toBeGreaterThanOrEqual(3);

    // F2 must not steal focus back into the catalog while a modal is open
    const searchInput = fixture.nativeElement.querySelector('search m3-text-field input[type="search"]') as HTMLInputElement;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    expect(document.activeElement).not.toBe(searchInput);

    const cardMethodBtn = Array.from(checkoutDialog.querySelectorAll('[aria-label="Método de pago"] button'))
      .find(btn => btn.textContent?.includes('Tarjeta')) as HTMLButtonElement;
    cardMethodBtn.click();
    fixture.detectChanges();

    expect(checkoutDialog.querySelector('m3-loading-indicator')).toBeTruthy();
    expect(checkoutDialog.querySelectorAll('.m3-aurora-glow').length).toBe(2);
  });

  it('shows the SUNAT M3 loading indicator on checkout confirm before opening Factura Electrónica', () => {
    vi.useFakeTimers();
    try {
      const { fixture, posService } = setup();
      posService.setVoucherType('factura');
      posService.addToCart(posService.products()[0]);
      posService.openCheckout();
      posService.setExactCash();
      fixture.detectChanges();

      const checkoutDialog = fixture.nativeElement.querySelector('app-pos-checkout-modal dialog.m3-dialog[open]') as HTMLDialogElement;
      const confirmBtn = Array.from(checkoutDialog.querySelectorAll('[dialog-actions] button')).find(btn =>
        btn.textContent?.includes('Confirmar y Emitir Comprobante')
      ) as HTMLButtonElement;
      expect(confirmBtn).toBeTruthy();

      confirmBtn.click();
      fixture.detectChanges();

      expect(checkoutDialog.textContent).toContain('Procesando cobro y emisión SUNAT');
      expect(checkoutDialog.querySelector('m3-loading-indicator[color="four-color"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('app-pos-receipt-modal dialog.m3-dialog[open]')).toBeNull();

      vi.advanceTimersByTime(1000);
      fixture.detectChanges();

      const receipt = fixture.nativeElement.querySelector('app-pos-receipt-modal dialog.m3-dialog[open]') as HTMLDialogElement;
      expect(receipt).toBeTruthy();
      expect(receipt.textContent).toContain('FACTURA ELECTRÓNICA');
    } finally {
      vi.useRealTimers();
    }
  });

  it('coordinates View Transitions across Customizer photo morph and Checkout -> Receipt flow', async () => {
    const { fixture, posService } = setup();
    const doc = document as unknown as {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const original = doc.startViewTransition;
    const transitions: {
      beforeDialogOwner: string | null;
      afterDialogOwner: string | null;
      beforeCheckoutOwner: string | null;
      afterCheckoutOwner: string | null;
      dialogTransformCountBefore: number;
      dialogTransformCountAfter: number;
    }[] = [];
    const pendingResolvers: (() => void)[] = [];

    doc.startViewTransition = (cb: () => void) => {
      const comp = fixture.componentInstance;
      const beforeDialogOwner = comp.customizerMorphOwner();
      const beforeCheckoutOwner = comp.checkoutMorphOwner();
      const dialogTransformCountBefore = (fixture.nativeElement as HTMLElement)
        .querySelectorAll('[style*="view-transition-name: dialog-transform"]').length;
      cb();
      const afterDialogOwner = comp.customizerMorphOwner();
      const afterCheckoutOwner = comp.checkoutMorphOwner();
      const dialogTransformCountAfter = (fixture.nativeElement as HTMLElement)
        .querySelectorAll('[style*="view-transition-name: dialog-transform"]').length;
      transitions.push({
        beforeDialogOwner,
        afterDialogOwner,
        beforeCheckoutOwner,
        afterCheckoutOwner,
        dialogTransformCountBefore,
        dialogTransformCountAfter
      });
      return {
        finished: new Promise<void>(resolve => pendingResolvers.push(resolve))
      };
    };

    try {
      const firstProduct = posService.products()[0];
      fixture.componentInstance.openCustomizer(firstProduct);
      expect(transitions.at(-1)).toEqual({
        beforeDialogOwner: 'catalog',
        afterDialogOwner: 'modal',
        beforeCheckoutOwner: null,
        afterCheckoutOwner: null,
        dialogTransformCountBefore: 1,
        dialogTransformCountAfter: 1
      });
      pendingResolvers.pop()?.();
      await Promise.resolve();
      expect(fixture.componentInstance.customizerMorphOwner()).toBeNull();

      fixture.componentInstance.addCustomizedToCart({ product: firstProduct, notes: 'Sin azúcar' });
      expect(transitions.at(-1)).toEqual({
        beforeDialogOwner: 'modal',
        afterDialogOwner: 'catalog',
        beforeCheckoutOwner: null,
        afterCheckoutOwner: null,
        dialogTransformCountBefore: 1,
        dialogTransformCountAfter: 1
      });
      pendingResolvers.pop()?.();
      await Promise.resolve();
      expect(fixture.componentInstance.customizerMorphOwner()).toBeNull();

      fixture.componentInstance.openCheckout();
      expect(transitions.at(-1)).toEqual({
        beforeDialogOwner: null,
        afterDialogOwner: null,
        beforeCheckoutOwner: 'ticket',
        afterCheckoutOwner: 'checkout',
        dialogTransformCountBefore: 1,
        dialogTransformCountAfter: 1
      });
      pendingResolvers.pop()?.();
      await Promise.resolve();

      fixture.componentInstance.confirmSale();
      expect(transitions.at(-1)).toEqual({
        beforeDialogOwner: null,
        afterDialogOwner: null,
        beforeCheckoutOwner: 'checkout',
        afterCheckoutOwner: 'receipt',
        dialogTransformCountBefore: 1,
        dialogTransformCountAfter: 1
      });
      pendingResolvers.pop()?.();
      await Promise.resolve();
      expect(fixture.nativeElement.querySelector('app-pos-receipt-modal dialog.m3-dialog[open]')).toBeTruthy();

      fixture.componentInstance.dismissReceipt(true);
      expect(transitions.at(-1)).toEqual({
        beforeDialogOwner: null,
        afterDialogOwner: null,
        beforeCheckoutOwner: 'receipt',
        afterCheckoutOwner: 'ticket',
        dialogTransformCountBefore: 1,
        dialogTransformCountAfter: 1
      });
      pendingResolvers.pop()?.();
      await Promise.resolve();
      expect(fixture.componentInstance.checkoutMorphOwner()).toBeNull();
      expect(posService.cartCount()).toBe(0);
    } finally {
      if (original) {
        doc.startViewTransition = original;
      } else {
        delete doc.startViewTransition;
      }
    }
  });

  it('uses M3 semantic OKLCH status tokens and iconography instead of hardcoded Tailwind hues', () => {
    const { fixture, posService } = setup();
    const hostEl = fixture.nativeElement as HTMLElement;
    const lowStockBadge = Array.from(hostEl.querySelectorAll('app-pos-catalog span'))
      .find(el => el.classList.contains('bg-warning-box'));
    expect(lowStockBadge).toBeTruthy();
    expect(lowStockBadge?.classList.contains('text-on-warning-box')).toBe(true);
    expect(lowStockBadge?.textContent).toContain('warning');

    const html = hostEl.innerHTML;
    expect(html).not.toMatch(/amber-|emerald-|rose-|sky-|zinc-/);

    const firstProduct = posService.products()[0];
    fixture.componentInstance.openCustomizer(firstProduct);
    fixture.detectChanges();

    const modalHtml = (hostEl.querySelector('app-pos-customizer-modal') as HTMLElement).innerHTML;
    expect(modalHtml).toContain('text-success');
    expect(modalHtml).toContain('check_circle');
    expect(modalHtml).not.toMatch(/amber-|emerald-|bg-zinc-950/);
  });

  it('clears search on Escape when no modal is open, disables exhausted stock cards, and switches mobile M3 tabs', () => {
    const { fixture, posService } = setup();
    posService.searchQuery.set('Espresso');
    fixture.detectChanges();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(posService.searchQuery()).toBe('');

    // Exhaust first product stock and verify UI locks out adding more
    const first = posService.products()[0];
    posService.products.update(list => list.map(p => (p.id === first.id ? { ...p, stock: 0 } : p)));
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('app-pos-catalog m3-card') as HTMLElement;
    expect(firstCard.textContent).toContain('Agotado');
    expect(firstCard.querySelector('.bg-error-box')).toBeTruthy();
    const addBtn = firstCard.querySelector('m3-card > button') as HTMLButtonElement;
    expect(addBtn.disabled).toBe(true);

    // Mobile tab toggle and bottom summary bar
    const second = posService.products()[1];
    posService.addToCart(second);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ver Comanda');

    const comandaTab = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'))
      .find(el => (el as HTMLElement).textContent?.includes('Comanda')) as HTMLButtonElement;
    comandaTab.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.mobilePane()).toBe('ticket');
  });

  it('validates customer DNI/RUC after interaction, preserves manual values on type toggle, and formats receipt in Spanish', () => {
    const { fixture, posService } = setup();
    const first = posService.products()[0];
    posService.addToCartWithCustomization(first, 'Extra frío', 11.5);
    fixture.detectChanges();

    fixture.componentInstance.openCustomerModal();
    fixture.detectChanges();

    const customerDialog = fixture.nativeElement.querySelector('app-pos-customer-modal dialog.m3-dialog[open]') as HTMLDialogElement;
    const inputs = Array.from(customerDialog.querySelectorAll('m3-text-field input')) as HTMLInputElement[];
    const [docInput, nameInput] = inputs;

    // No premature validation error on open
    expect(customerDialog.textContent).not.toContain('El DNI debe tener');

    // Type partial DNI and blur => error shown post-interaction
    docInput.value = '1234';
    docInput.dispatchEvent(new Event('input'));
    docInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(customerDialog.textContent).toContain('El DNI debe tener exactamente 8 dígitos.');
    expect(docInput.getAttribute('aria-invalid')).toBe('true');

    // Switching DNI -> RUC preserves typed name
    nameInput.value = 'Elena Quispe';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const rucBtn = Array.from(customerDialog.querySelectorAll('[aria-label="Tipo de documento del cliente"] button'))
      .find(b => b.textContent?.includes('RUC')) as HTMLButtonElement;
    rucBtn.click();
    fixture.detectChanges();
    expect(nameInput.value).toBe('Elena Quispe');
    expect(docInput.value).toBe('1234');

    // Fix valid 11-digit RUC => error clears immediately and saves cleanly
    docInput.value = '20123456789';
    docInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(docInput.getAttribute('aria-invalid')).toBeNull();

    const saveBtn = customerDialog.querySelector('m3-button[type="submit"] button') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-pos-customer-modal dialog.m3-dialog[open]')).toBeNull();
    expect(posService.customer().docNumber).toBe('20123456789');

    // Complete sale and verify Spanish payment method + notes on thermal receipt
    posService.setPaymentMethod('cash');
    posService.setQuickCash(20);
    posService.completeSale();
    fixture.detectChanges();

    const receipt = fixture.nativeElement.querySelector('app-pos-receipt-modal dialog.m3-dialog[open]') as HTMLDialogElement;
    expect(receipt).toBeTruthy();
    expect(receipt.textContent).toContain('Efectivo');
    expect(receipt.textContent).toContain('Extra frío');
    expect(receipt.textContent).toContain('11.50');
  });
});

describe('PosComponent Stage Recess Integration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('portals native POS dialogs outside #app-stage and toggles stage-recessed + inert', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const posService = TestBed.inject(PosService);
    posService.newSale();

    await router.navigateByUrl('/pos');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rootEl = fixture.nativeElement as HTMLElement;
    const stageEl = rootEl.querySelector('#app-stage') as HTMLElement;
    expect(stageEl.classList.contains('stage-normal')).toBe(true);
    expect(stageEl.hasAttribute('inert')).toBe(false);

    const optionsBtn = stageEl.querySelector('app-pos-catalog m3-button[icon="tune"] button') as HTMLButtonElement;
    optionsBtn.click();
    fixture.detectChanges();

    const customizerModal = rootEl.querySelector('app-pos-customizer-modal dialog.m3-dialog[open]') as HTMLDialogElement;
    expect(customizerModal).toBeTruthy();
    expect(stageEl.contains(customizerModal)).toBe(false);
    expect(stageEl.classList.contains('stage-recessed')).toBe(true);
    expect(stageEl.hasAttribute('inert')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(rootEl.querySelector('app-pos-customizer-modal dialog.m3-dialog[open]')).toBeNull();
    expect(stageEl.classList.contains('stage-normal')).toBe(true);
    expect(stageEl.hasAttribute('inert')).toBe(false);
  });
});
