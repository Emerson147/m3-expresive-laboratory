import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../core/theme/theme.service';
import { DialogContainerComponent } from './dialog-container.component';

describe('DialogContainerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogContainerComponent]
    }).compileComponents();
  });

  afterEach(() => {
    const themeService = TestBed.inject(ThemeService);
    themeService.setThemeHue(275);
    themeService.setContrastLevel('standard');
    themeService.setSeedChroma(0.16);
    themeService.setMotionScheme('expressive');
    if (themeService.isDarkMode()) {
      themeService.toggleThemeMode();
    }
  });

  it('uses wrapped M3 filter chips without horizontal overflow, enforces 48dp touch swatches and zero .transition-all', () => {
    const fixture = TestBed.createComponent(DialogContainerComponent);
    const themeService = TestBed.inject(ThemeService);
    const navSpy = vi.fn();
    fixture.componentInstance.navStyleChange.subscribe(navSpy);

    fixture.componentRef.setInput('isDialogOpen', true);
    fixture.componentRef.setInput('activeTrigger', 'menu-bottom-left');
    fixture.componentRef.setInput('activeTransition', null);
    fixture.componentRef.setInput('navStyle', 'auto');
    fixture.componentRef.setInput('chromeMode', 'rail-expanded');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.transition-all')).toBeNull();
    expect(el.querySelector('[aria-label="Vista previa de paleta OKLCH activa"]')).toBeTruthy();

    // Scroll body explicitly guards horizontal overflow
    const scrollArea = el.querySelector('#dialog-container .overflow-y-auto') as HTMLElement;
    expect(scrollArea.classList.contains('overflow-x-hidden')).toBe(true);

    // Swatches enforce 48dp accessible touch targets
    const hueButtons = el.querySelectorAll('[aria-label="Color semilla del tema"] button');
    expect(hueButtons.length).toBe(5);
    hueButtons.forEach((btn) => {
      expect(btn.classList.contains('touch-target-48')).toBe(true);
    });

    // Toggle dark mode via <m3-switch>
    const switchBtn = el.querySelector('m3-switch button[role="switch"]') as HTMLButtonElement;
    switchBtn.click();
    fixture.detectChanges();
    expect(themeService.isDarkMode()).toBe(true);

    // OKLCH Chroma filter chip
    const chromaGroup = el.querySelector('[aria-label="Intensidad cromática OKLCH"]') as HTMLElement;
    const vibrantBtn = Array.from(chromaGroup.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Vibrante')
    ) as HTMLButtonElement;
    vibrantBtn.click();
    fixture.detectChanges();
    expect(themeService.seedChroma()).toBe(0.22);

    // M3 Contrast filter chip
    const contrastGroup = el.querySelector('[aria-label="Nivel de contraste M3"]') as HTMLElement;
    const highBtn = Array.from(contrastGroup.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Alto')
    ) as HTMLButtonElement;
    highBtn.click();
    fixture.detectChanges();
    expect(themeService.contrastLevel()).toBe('high');
    expect(highBtn.getAttribute('aria-pressed')).toBe('true');

    // Motion Scheme filter chip
    const motionGroup = el.querySelector('[aria-label="Esquema de movimiento"]') as HTMLElement;
    const standardMotionBtn = Array.from(motionGroup.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Estándar')
    ) as HTMLButtonElement;
    standardMotionBtn.click();
    fixture.detectChanges();
    expect(themeService.motionScheme()).toBe('standard');

    // Adaptive Navigation filter chip
    const navGroup = el.querySelector('[aria-label="Estilo de navegación"]') as HTMLElement;
    const dockBtn = Array.from(navGroup.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Dock')
    ) as HTMLButtonElement;
    dockBtn.click();
    expect(navSpy).toHaveBeenCalledWith('dock');

    // Reset button restores default tokens
    const resetBtn = Array.from(el.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Reset')
    ) as HTMLButtonElement;
    expect(resetBtn).toBeTruthy();
    resetBtn.click();
    fixture.detectChanges();
    expect(themeService.seedChroma()).toBe(0.16);
    expect(themeService.contrastLevel()).toBe('standard');
    expect(themeService.motionScheme()).toBe('expressive');
    expect(navSpy).toHaveBeenCalledWith('auto');
  });

  it('adapts overlay placement by chrome mode (tunnel top-right vs dock center) and closes on Escape', () => {
    const fixture = TestBed.createComponent(DialogContainerComponent);
    const closeSpy = vi.fn();
    fixture.componentInstance.closeDialog.subscribe(closeSpy);

    fixture.componentRef.setInput('isDialogOpen', true);
    fixture.componentRef.setInput('navStyle', 'tunnel');
    fixture.componentRef.setInput('chromeMode', 'tunnel');
    fixture.detectChanges();

    const dlg = (fixture.nativeElement as HTMLElement).querySelector('#dialog-container') as HTMLElement;
    expect(dlg.className).toContain('sm:top-16');
    expect(dlg.className).toContain('sm:right-4');

    fixture.componentRef.setInput('chromeMode', 'dock');
    fixture.detectChanges();
    expect(dlg.className).toContain('sm:bottom-20');
    expect(dlg.className).toContain('sm:left-1/2');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
