import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PosService } from './pos.service';

describe('PosService', () => {
  let service: PosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosService);
  });

  it('initializes with 12 catalog products, empty cart, and default customer', () => {
    expect(service.products().length).toBe(12);
    expect(service.categories.length).toBe(5);
    expect(service.selectedCategory()).toBe('all');
    expect(service.searchQuery()).toBe('');
    expect(service.cart()).toEqual([]);
    expect(service.cartCount()).toBe(0);
    expect(service.total()).toBe(0);
    expect(service.voucherType()).toBe('boleta');
    expect(service.customer()).toEqual(service.defaultCustomer);
    expect(service.isCheckoutOpen()).toBe(false);
    expect(service.isReceiptOpen()).toBe(false);
  });

  it('filters catalog products reactively by category and search query across name, sku, and category', () => {
    service.selectedCategory.set('coffee');
    expect(service.filteredProducts().every(p => p.category === 'coffee')).toBe(true);
    expect(service.filteredProducts().length).toBe(4);

    service.searchQuery.set('COF-004');
    expect(service.filteredProducts().map(p => p.sku)).toEqual(['COF-004']);

    service.selectedCategory.set('all');
    service.searchQuery.set('  cafetería ');
    expect(service.filteredProducts().every(p => p.categoryLabel === 'Cafetería')).toBe(true);

    service.searchQuery.set('Nonexistent Product');
    expect(service.filteredProducts()).toEqual([]);
  });

  it('adds items, splits customized variants by unitPrice/notes, enforces stock ceiling, and removes lines', () => {
    const [espresso, cappuccino] = service.products();

    service.addToCart(espresso);
    service.addToCart(espresso);
    service.addToCartWithCustomization(cappuccino, 'Leche de Almendra (+S/ 3.00)', 15);
    service.addToCart(cappuccino);

    expect(service.cartCount()).toBe(4);
    expect(service.cart().length).toBe(3);
    expect(service.getItemQuantity(espresso.id)).toBe(2);
    expect(service.getItemQuantity(cappuccino.id)).toBe(2);

    const customLine = service.cart().find(i => i.unitPrice === 15);
    const stdLine = service.cart().find(i => i.product.id === cappuccino.id && !i.notes);
    expect(customLine?.notes).toBe('Leche de Almendra (+S/ 3.00)');
    expect(stdLine?.unitPrice).toBe(cappuccino.price);
    expect(service.grossTotal()).toBe(8.5 * 2 + 15 + 12);

    // Repeating exact same variant merges onto existing line
    service.addToCartWithCustomization(cappuccino, 'Leche de Almendra (+S/ 3.00)', 15);
    expect(service.getItemQuantity(cappuccino.id)).toBe(3);
    expect(service.cart().find(i => i.lineId === customLine!.lineId)?.quantity).toBe(2);

    // Stock ceiling prevents exceeding available stock
    service.updateLineQuantity(customLine!.lineId, 999);
    expect(service.getItemQuantity(cappuccino.id)).toBe(cappuccino.stock);
    expect(service.remainingStock(cappuccino.id)).toBe(0);

    service.removeLine(customLine!.lineId);
    expect(service.getItemQuantity(cappuccino.id)).toBe(1);

    service.removeFromCart(espresso.id);
    service.removeFromCart(cappuccino.id);
    expect(service.cart()).toEqual([]);
  });

  it('computes Peruvian 18% IGV breakdown and percentage discounts accurately', () => {
    const [espresso, cappuccino] = service.products(); // 8.50 and 12.00

    service.addToCart(espresso);
    service.addToCart(espresso);
    service.addToCart(cappuccino); // 17.00 + 12.00 = 29.00
    service.discountPercent.set(10); // -2.90 => 26.10 total

    expect(service.grossTotal()).toBe(29);
    expect(service.discount()).toBe(2.9);
    expect(service.total()).toBe(26.1);
    expect(service.subtotal()).toBe(22.12);
    expect(service.tax()).toBe(3.98);
    expect(Number((service.subtotal() + service.tax()).toFixed(2))).toBe(service.total());
  });

  it('switches customer defaults appropriately between boleta and factura vouchers', () => {
    service.setVoucherType('factura');
    expect(service.voucherType()).toBe('factura');
    expect(service.customer().isCompany).toBe(true);
    expect(service.customer().docType).toBe('RUC');

    service.setCustomer({
      docType: 'RUC',
      docNumber: '20555111222',
      name: 'ACME PERU S.A.C.',
      isCompany: true
    });
    service.setVoucherType('factura');
    expect(service.customer().docNumber).toBe('20555111222');

    service.setVoucherType('boleta');
    expect(service.customer()).toEqual(service.defaultCustomer);
  });

  it('validates cash, yape, and card payments and computes change safely', () => {
    expect(service.isPaymentValid()).toBe(false);
    service.openCheckout();
    expect(service.isCheckoutOpen()).toBe(false);

    const [espresso] = service.products(); // 8.50
    service.addToCart(espresso);
    service.yapeCode.set('9999');
    service.openCheckout();

    expect(service.isCheckoutOpen()).toBe(true);
    expect(service.cashReceived()).toBe(9);
    expect(service.yapeCode()).toBe('');
    expect(service.change()).toBe(0.5);
    expect(service.isPaymentValid()).toBe(true);

    service.setQuickCash(5);
    expect(service.change()).toBe(-3.5);
    expect(service.isPaymentValid()).toBe(false);

    service.addQuickCash(15); // 20
    expect(service.change()).toBe(11.5);
    expect(service.isPaymentValid()).toBe(true);

    service.setExactCash();
    expect(service.cashReceived()).toBe(8.5);
    expect(service.change()).toBe(0);

    service.setPaymentMethod('yape');
    expect(service.change()).toBe(0);
    service.yapeCode.set(' 12 ');
    expect(service.isPaymentValid()).toBe(false);
    service.yapeCode.set('8492');
    expect(service.isPaymentValid()).toBe(true);

    service.setPaymentMethod('card');
    expect(service.change()).toBe(0);
    expect(service.isPaymentValid()).toBe(true);

    service.closeCheckout();
    expect(service.isCheckoutOpen()).toBe(false);
  });

  it('completes a valid sale into a receipt snapshot, decrements stock, advances sequence/series, and resets cleanly on newSale', () => {
    const [espresso] = service.products();
    const initialStock = espresso.stock;
    const initialSales = service.shiftInfo().salesCountToday;
    const initialSeq = service.ticketSequence();

    service.setTableNumber('Terraza 01');
    expect(service.tableNumber()).toBe('Terraza 01');

    service.addToCart(espresso);
    service.addToCart(espresso);
    service.setQuickCash(5);
    service.completeSale();
    expect(service.lastCompletedSale()).toBeNull();
    expect(service.isReceiptOpen()).toBe(false);

    service.setQuickCash(20);
    service.completeSale();

    const sale = service.lastCompletedSale();
    expect(sale).not.toBeNull();
    expect(sale?.saleId).toBe(`B001-${String(initialSeq).padStart(6, '0')}`);
    expect(sale?.orderCode).toBe(`#ORD-2026-${String(initialSeq).padStart(4, '0')}`);
    expect(sale?.tableNumber).toBe('Terraza 01');
    expect(sale?.total).toBe(17);
    expect(sale?.cashReceived).toBe(20);
    expect(sale?.change).toBe(3);
    expect(sale?.yapeCode).toBeUndefined();
    expect(service.products()[0].stock).toBe(initialStock - 2);
    expect(service.shiftInfo().salesCountToday).toBe(initialSales + 1);
    expect(service.isCheckoutOpen()).toBe(false);
    expect(service.isReceiptOpen()).toBe(true);

    service.newSale();
    expect(service.ticketSequence()).toBe(initialSeq + 1);
    expect(service.activeOrderCode()).toBe(`#ORD-2026-${String(initialSeq + 1).padStart(4, '0')}`);
    expect(service.cart()).toEqual([]);
    expect(service.discountPercent()).toBe(0);
    expect(service.cashReceived()).toBe(0);
    expect(service.yapeCode()).toBe('');
    expect(service.voucherType()).toBe('boleta');
    expect(service.customer()).toEqual(service.defaultCustomer);
    expect(service.lastCompletedSale()).toBeNull();
    expect(service.isReceiptOpen()).toBe(false);

    // Factura emits F001 series
    service.setVoucherType('factura');
    service.addToCart(espresso);
    service.setPaymentMethod('card');
    service.completeSale();
    expect(service.lastCompletedSale()?.saleId).toMatch(/^F001-\d{6}$/);
  });
});

