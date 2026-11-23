import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FoundationsLabComponent } from './foundations-lab.component';

describe('FoundationsLabComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoundationsLabComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  const findButton = (root: ParentNode, text: string): HTMLButtonElement | undefined =>
    Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.includes(text));

  it('renders all 4 M3 Foundations cases using real M3 Expressive components and block section hosts', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Caso 1');
    expect(el.textContent).toContain('Caso 2');
    expect(el.textContent).toContain('Caso 3');
    expect(el.textContent).toContain('Caso 4');
    expect(el.querySelector('.touch-target-48')).toBeTruthy();
    expect(el.querySelector('[aria-live="polite"]')).toBeTruthy();

    expect(el.querySelectorAll('m3-tabs').length).toBeGreaterThanOrEqual(2);
    expect(el.querySelectorAll('m3-switch').length).toBeGreaterThanOrEqual(5);
    expect(el.querySelector('m3-slider')).toBeTruthy();
    expect(el.querySelector('m3-text-field')).toBeTruthy();
    expect(el.querySelector('m3-snackbar')).toBeTruthy();
    expect(el.querySelectorAll('m3-card').length).toBeGreaterThanOrEqual(10);
    expect(el.querySelectorAll('m3-chip').length).toBeGreaterThanOrEqual(8);

    expect(el.querySelector('app-foundations-layout-section')?.classList.contains('block')).toBe(true);
    expect(el.querySelector('app-foundations-ergonomics-section')?.classList.contains('block')).toBe(true);
    expect(el.querySelector('app-foundations-a11y-content-section')?.classList.contains('block')).toBe(true);
  });

  it('simulates Breakpoints, Canonical Layouts, Drag Handle split, Fold switch, and Compact drill-down in Caso 1', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    // Select Compact breakpoint card + Supporting Pane chip
    const compactCard = Array.from(el.querySelectorAll('app-foundations-layout-section m3-card')).find(
      (c) => c.getAttribute('role') === 'button' && c.textContent?.includes('Compact')
    ) as HTMLElement;
    expect(compactCard).toBeTruthy();
    compactCard.click();
    fixture.detectChanges();

    findButton(el, '2. Supporting Pane')!.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Dock Inferior');

    // Switch to List-Detail for Compact drill-down and Levitate sheet
    findButton(el, '1. List-Detail')!.click();
    fixture.detectChanges();

    findButton(el, 'Flow Shirt • Ver Detalle')!.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Volver a Lista');

    const levitateBtn = el.querySelector('button.adaptive-levitate-badge') as HTMLButtonElement;
    expect(levitateBtn).toBeTruthy();
    levitateBtn.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Bottom Sheet / Modal activo en Compact');

    findButton(el, 'Volver a Lista')!.click();
    fixture.detectChanges();

    // Window slider changes breakpoint to Expanded (920px) and enables split controls + Fold switch
    const widthSlider = el.querySelector('m3-slider #adaptive-width-slider') as HTMLInputElement;
    expect(widthSlider).toBeTruthy();
    widthSlider.value = '920';
    widthSlider.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.textContent).toContain('Show & Hide: Multi-Pane');

    const expandSplitBtn = el.querySelector('button[aria-label="Ampliar Pane 1"]') as HTMLButtonElement;
    expect(expandSplitBtn).toBeTruthy();
    expandSplitBtn.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Split 47/53');

    const foldSwitch = el.querySelector('m3-switch #adaptive-fold-switch') as HTMLButtonElement;
    expect(foldSwitch).toBeTruthy();
    foldSwitch.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('FOLD');

    // Extra-Large renders 3rd pane
    widthSlider.value = '1680';
    widthSlider.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.textContent).toContain('Pane 3 (Extra-Large)');
  });

  it('switches Case 1 tabs to inspect 8 Parts of Layout and LTR/RTL logical mirroring', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const layoutEl = el.querySelector('app-foundations-layout-section')!;

    // Tab 2: Anatomy (8 Parts)
    findButton(layoutEl, 'Anatomía (8 Parts)')!.click();
    fixture.detectChanges();
    expect(layoutEl.querySelector('#foundations-layout-panel-anatomy')).toBeTruthy();

    findButton(layoutEl, 'MARGIN (16dp Compact')!.click();
    fixture.detectChanges();
    expect(layoutEl.textContent).toContain('Margins (Outer Spacing)');

    const navBarBtn = findButton(layoutEl, 'Navigation Bar (Compact <600dp)');
    expect(navBarBtn).toBeTruthy();
    expect(navBarBtn!.textContent).toContain('64dp altura (M3E)');
    navBarBtn!.click();
    fixture.detectChanges();
    expect(layoutEl.textContent).toContain('Alto 64dp (bar M3E)');

    // Tab 3: LTR <-> RTL via m3-button-group
    findButton(layoutEl, 'LTR ↔ RTL Lógico')!.click();
    fixture.detectChanges();
    expect(layoutEl.querySelector('#foundations-layout-panel-rtl')).toBeTruthy();

    findButton(layoutEl, 'RTL (dir="rtl")')!.click();
    fixture.detectChanges();
    expect(layoutEl.querySelector('[dir="rtl"]')).toBeTruthy();
  });

  it('operates Case 2 Ergonomics M3 switches, touch target tap counter, and Case 4 Content + Intl formatting', async () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true
    });

    try {
      const el = fixture.nativeElement as HTMLElement;

      // Case 2: Hitbox switches + tap counter + copy utility
      const touchBtn = el.querySelector('button[aria-label="Probar área táctil 48dp"]') as HTMLButtonElement;
      expect(touchBtn.classList.contains('touch-target-debug')).toBe(true);
      touchBtn.click();
      fixture.detectChanges();
      expect(el.querySelector('app-foundations-ergonomics-section')?.textContent).toContain('1');

      const gapSwitch = el.querySelector('m3-switch #ergo-gap-switch') as HTMLButtonElement;
      gapSwitch.click();
      fixture.detectChanges();
      expect(el.textContent).toContain('Sin gap (0dp)');

      findButton(el, 'Copiar .touch-target-48')!.click();
      await Promise.resolve();
      fixture.detectChanges();
      expect(writeTextSpy).toHaveBeenCalledWith('.touch-target-48 { min-inline-size: 48px; min-block-size: 48px; }');
      expect(component.snackbarOpen()).toBe(true);

      // Case 4: Content expansion switch on real <m3-button> + Intl locale selector
      const expansionSwitch = el.querySelector('m3-switch #content-expansion-switch') as HTMLButtonElement;
      expansionSwitch.click();
      fixture.detectChanges();
      expect(el.textContent).toContain('Guardar hoy mismo');

      findButton(el, 'en-US (USD)')!.click();
      fixture.detectChanges();
      expect(el.textContent).toContain('$240.00');

      // Section filters isolate Caso 4 and restore All
      findButton(el, '4. Content Design')!.click();
      fixture.detectChanges();
      expect(component.selectedSectionFilter()).toBe('case-4');
      expect(el.textContent).not.toContain('Caso 1 •');
      expect(el.textContent).toContain('Caso 4 •');

      findButton(el, 'Todos los Casos (4)')!.click();
      fixture.detectChanges();
      expect(el.textContent).toContain('Caso 1 •');
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(navigator, 'clipboard', originalDescriptor);
      } else {
        delete (navigator as { clipboard?: Clipboard }).clipboard;
      }
    }
  });

  it('validates Roving Tabindex via real <m3-tabs>, WCAG error switch, and post-blur validation on <m3-text-field>', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const a11ySection = el.querySelector('app-foundations-a11y-content-section')!;

    // Roving Tabindex inside real <m3-tabs> responds to ArrowRight
    const tabs = Array.from(a11ySection.querySelectorAll('m3-tabs [role="tab"]')) as HTMLButtonElement[];
    expect(tabs.length).toBe(3);
    expect(tabs[0].getAttribute('tabindex')).toBe('0');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(tabs[0].getAttribute('tabindex')).toBe('-1');
    expect(tabs[1].getAttribute('tabindex')).toBe('0');
    expect(a11ySection.querySelector('[aria-live="polite"]')?.textContent).toContain('Envío Express');

    // WCAG error style switch toggles anti-pattern demonstration
    const wcagSwitch = a11ySection.querySelector('m3-switch #a11y-wcag-error-switch') as HTMLButtonElement;
    wcagSwitch.click();
    fixture.detectChanges();
    expect(a11ySection.textContent).toContain('solo color rojo');

    // Real <m3-text-field> validates only after blur (no premature red error while typing)
    const emailInput = a11ySection.querySelector('#a11y-demo-email') as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    expect(emailInput.getAttribute('aria-invalid')).toBeNull();
    expect(emailInput.getAttribute('aria-describedby')).toBe('a11y-demo-email-support');

    emailInput.value = 'correo-invalido';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emailInput.getAttribute('aria-invalid')).toBeNull();

    emailInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    expect(a11ySection.textContent).toContain('aria-invalid="true" (post-blur)');
  });
});
