import { TestBed } from '@angular/core/testing';
import { PosService } from '../../core/pos/pos.service';
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

  it('focuses the M3 search input when pressing F2', () => {
    const { fixture } = setup();
    const searchInput = fixture.nativeElement.querySelector('m3-text-field input') as HTMLInputElement;
    expect(searchInput).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2' }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(searchInput);
  });

  it('renders M3 cards, category chips, and touch-target-48 steppers when adding items', () => {
    const { fixture, posService } = setup();

    expect(fixture.nativeElement.querySelectorAll('app-pos-catalog m3-card').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelectorAll('app-pos-catalog m3-chip').length).toBe(posService.categories.length);

    const firstProductBtn = fixture.nativeElement.querySelector('app-pos-catalog m3-card > button') as HTMLButtonElement;
    firstProductBtn.click();
    fixture.detectChanges();

    expect(posService.cartCount()).toBe(1);
    const ticketMinus = fixture.nativeElement.querySelector('app-pos-ticket button[aria-label^="Disminuir"]') as HTMLButtonElement;
    expect(ticketMinus).toBeTruthy();
    expect(ticketMinus.classList.contains('touch-target-48')).toBe(true);
  });

  it('opens the accessible customizer dialog with M3 filter chips and adds customization notes', () => {
    const { fixture, posService } = setup();
    const optionsBtn = fixture.nativeElement.querySelector('app-pos-catalog m3-button[icon="tune"] button') as HTMLButtonElement;

    optionsBtn.click();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('app-pos-customizer-modal [role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    const extraChips = Array.from(dialog.querySelectorAll('m3-chip button')) as HTMLButtonElement[];
    expect(extraChips.length).toBeGreaterThan(0);
    extraChips[0].click();
    fixture.detectChanges();

    const addCustomizedBtn = dialog.querySelector('m3-button[icon="shopping_bag"] button') as HTMLButtonElement;
    addCustomizedBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pos-customizer-modal')).toBeNull();
    expect(posService.cart().length).toBe(1);
    expect(posService.cart()[0].notes).toBeTruthy();
  });

  it('opens checkout via Ctrl+Enter and renders M3 loading indicator in card payment mode', () => {
    const { fixture, posService } = setup();
    posService.addToCart(posService.products()[0]);
    fixture.detectChanges();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
    fixture.detectChanges();

    const checkoutDialog = fixture.nativeElement.querySelector('app-pos-checkout-modal [role="dialog"]') as HTMLElement;
    expect(checkoutDialog).toBeTruthy();

    const cardMethodBtn = Array.from(checkoutDialog.querySelectorAll('[aria-label="Método de pago"] button'))
      .find(btn => btn.textContent?.includes('Tarjeta')) as HTMLButtonElement;
    cardMethodBtn.click();
    fixture.detectChanges();

    expect(checkoutDialog.querySelector('m3-loading-indicator')).toBeTruthy();
  });
});

