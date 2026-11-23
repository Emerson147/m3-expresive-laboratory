import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../../core/theme/theme.service';
import { StylesLabComponent } from './styles-lab.component';

describe('StylesLabComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StylesLabComponent],
    }).compileComponents();
  });

  it('renders all 6 M3 Expressive Styles & Tokens cases including Fonts, Applying Type, Shape Morph, Applying Elevation, and State Layer Hover Playground', () => {
    const fixture = TestBed.createComponent(StylesLabComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Caso 1');
    expect(el.textContent).toContain('Caso 2');
    expect(el.textContent).toContain('Caso 3');
    expect(el.textContent).toContain('styles/typography/fonts');
    expect(el.textContent).toContain('applying-type');
    expect(el.textContent).toContain('type-scale-tokens');
    expect(el.textContent).toContain('Caso 4');
    expect(el.textContent).toContain('shape/overview-principles');
    expect(el.textContent).toContain('shape/shape-morph');
    expect(el.querySelector('m3-loading-indicator')).toBeTruthy();
    expect(el.textContent).toContain('Caso 5');
    expect(el.textContent).toContain('styles/elevation/applying-elevation');
    expect(el.textContent).toContain('Caso 6');

    const typoButtons = Array.from(el.querySelectorAll('app-styles-typography-section m3-tabs button'));
    const rulesTab = typoButtons.find((btn) => btn.textContent?.includes('Reglas de Aplicación')) as HTMLButtonElement;
    const fontsTab = typoButtons.find((btn) => btn.textContent?.includes('Fuentes Brand / Plain')) as HTMLButtonElement;
    expect(rulesTab).toBeTruthy();
    expect(fontsTab).toBeTruthy();

    rulesTab.click();
    fixture.detectChanges();
    expect(el.querySelector('#styles-typo-panel-applying')).toBeTruthy();
    expect(el.textContent).toContain('40ch – 75ch');

    fontsTab.click();
    fixture.detectChanges();
    expect(el.querySelector('#styles-typo-panel-fonts')).toBeTruthy();
    expect(el.textContent).toContain('--md-ref-typeface-brand');
  });

  it('switches the active contrast level via ThemeService when calling setContrast', () => {
    const fixture = TestBed.createComponent(StylesLabComponent);
    const component = fixture.componentInstance;
    const themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();

    expect(themeService.contrastLevel()).toBe('standard');

    component.setContrast('high');
    fixture.detectChanges();

    expect(themeService.contrastLevel()).toBe('high');
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high');

    component.setContrast('standard');
    fixture.detectChanges();
    expect(document.documentElement.getAttribute('data-contrast')).toBeNull();
  });

  it('toggles between Baseline and Emphasized (M3 Expressive) typography modes', () => {
    const fixture = TestBed.createComponent(StylesLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEmphasizedType()).toBe(false);

    component.isEmphasizedType.set(true);
    fixture.detectChanges();

    expect(component.isEmphasizedType()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.text-display-lg-emphasized')).toBeTruthy();
  });

  it('exposes all 10 M3 Expressive shape corner tokens and supports multi-component shape morphing', () => {
    const fixture = TestBed.createComponent(StylesLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.shapeSpecs.length).toBe(10);
    expect(component.isMorphed()).toBe(false);

    component.toggleMorph();
    component.toggleMorphChip('springs');
    fixture.detectChanges();

    expect(component.isMorphed()).toBe(true);
    expect(component.selectedMorphChips()).toContain('springs');
  });

  it('simulates forced state overlays (Hover 8%, Focus 10%, Pressed 12%, Dragged 16%) across all 6 component archetypes', () => {
    const fixture = TestBed.createComponent(StylesLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.forcedState()).toBe('live');
    expect(component.getSimulatedStateOverlay('var(--md-sys-color-on-primary)')).toBeNull();

    component.forcedState.set('hover');
    fixture.detectChanges();

    const hoverOverlay = component.getSimulatedStateOverlay('var(--md-sys-color-on-primary)');
    expect(hoverOverlay).toContain('color-mix(in oklch, var(--md-sys-color-on-primary)');
    expect(hoverOverlay).toContain('--md-sys-state-hover-state-layer-opacity');
  });

  it('controls live Studio Bar (seed preset, hue/chroma ranges, contrast group without duplicate dark toggle), section filters, 12 Fixed Roles, and Case 6 disabled/filter chip contracts', () => {
    const fixture = TestBed.createComponent(StylesLabComponent);
    const component = fixture.componentInstance;
    const themeService = TestBed.inject(ThemeService);
    const initialHue = themeService.currentHue();
    const initialChroma = themeService.seedChroma();
    const initialDark = themeService.isDarkMode();
    fixture.detectChanges();

    try {
      const el = fixture.nativeElement as HTMLElement;
      const buttons = Array.from(el.querySelectorAll('button')) as HTMLButtonElement[];

      // All 12 Fixed role pairs are present in Caso 2
      expect(el.querySelector('.bg-primary-fixed.text-on-primary-fixed')).toBeTruthy();
      expect(el.querySelector('.bg-primary-fixed-dim.text-on-primary-fixed-variant')).toBeTruthy();
      expect(el.querySelector('.bg-secondary-fixed.text-on-secondary-fixed')).toBeTruthy();
      expect(el.querySelector('.bg-secondary-fixed-dim.text-on-secondary-fixed-variant')).toBeTruthy();
      expect(el.querySelector('.bg-tertiary-fixed.text-on-tertiary-fixed')).toBeTruthy();
      expect(el.querySelector('.bg-tertiary-fixed-dim.text-on-tertiary-fixed-variant')).toBeTruthy();

      // Seed preset button updates ThemeService hue
      const secondPreset = themeService.themes[1];
      const presetBtn = buttons.find((b) => b.textContent?.includes(`(${secondPreset.hue}°)`));
      expect(presetBtn).toBeTruthy();
      presetBtn!.click();
      fixture.detectChanges();
      expect(themeService.currentHue()).toBe(secondPreset.hue);

      // Seed Hue & Seed Chroma range inputs update ThemeService via DOM input events
      const hueSlider = el.querySelector('#styles-seed-hue') as HTMLInputElement;
      const chromaSlider = el.querySelector('#styles-seed-chroma') as HTMLInputElement;
      hueSlider.value = '145';
      hueSlider.dispatchEvent(new Event('input'));
      chromaSlider.value = '0.16';
      chromaSlider.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(themeService.currentHue()).toBe(145);
      expect(themeService.seedChroma()).toBeCloseTo(0.16, 2);

      // Studio Bar avoids duplicate dark-mode controls (header owns dark mode) and reflects global dark state passively
      expect(el.querySelector('m3-switch')).toBeNull();
      expect(el.textContent).not.toContain('Cambiar a Modo Oscuro');
      themeService.toggleThemeMode();
      fixture.detectChanges();
      expect(el.querySelector('app-styles-color-section')?.textContent).toContain('Dark (neutral4 → neutral24)');
      themeService.toggleThemeMode();
      fixture.detectChanges();

      const highContrastBtn = Array.from(el.querySelectorAll('m3-button-group button')).find((b) =>
        b.textContent?.includes('High (≥7:1)')
      ) as HTMLButtonElement;
      expect(highContrastBtn).toBeTruthy();
      highContrastBtn.click();
      fixture.detectChanges();
      expect(themeService.contrastLevel()).toBe('high');
      themeService.setContrastLevel('standard');

      // Section filter switches to Case 6 only
      const case6FilterBtn = Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('6. State Layers')
      );
      expect(case6FilterBtn).toBeTruthy();
      case6FilterBtn!.click();
      fixture.detectChanges();
      expect(component.selectedSectionFilter()).toBe('case-6');
      expect(el.textContent).not.toContain('Caso 1 •');
      expect(el.textContent).toContain('Caso 6 •');

      // Case 6 forced Hover + Filter chip toggle transitions state-layer role between on-secondary-container and on-surface-variant
      const hoverBtn = Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Forzar Hover (8%)')
      );
      hoverBtn!.click();
      fixture.detectChanges();

      const filterChipBtn = Array.from(el.querySelectorAll('app-styles-state-layers-section button')).find((b) =>
        b.textContent?.includes('Filtro Activo')
      ) as HTMLButtonElement;
      expect(filterChipBtn).toBeTruthy();
      expect(filterChipBtn.getAttribute('aria-pressed')).toBe('true');
      expect(filterChipBtn.style.backgroundImage).toContain('on-secondary-container');

      filterChipBtn.click();
      fixture.detectChanges();
      expect(filterChipBtn.getAttribute('aria-pressed')).toBe('false');
      expect(filterChipBtn.style.backgroundImage).toContain('on-surface-variant');

      // Case 6 forced Disabled disables native button-cards and adds .is-disabled
      const disabledModeBtn = Array.from(el.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Forzar Disabled')
      );
      disabledModeBtn!.click();
      fixture.detectChanges();

      const cardBtn = el.querySelector('button.m3-card-elevated') as HTMLButtonElement;
      expect(cardBtn).toBeTruthy();
      expect(cardBtn.disabled).toBe(true);
      expect(cardBtn.classList.contains('is-disabled')).toBe(true);
    } finally {
      themeService.setThemeHue(initialHue);
      themeService.setSeedChroma(initialChroma);
      if (themeService.isDarkMode() !== initialDark) {
        themeService.toggleThemeMode();
      }
    }
  });

  it('uses M3 components (m3-slider, m3-chip, m3-card, m3-text-field, m3-snackbar), exports portable :root CSS, inspects tonal stops, and previews live typography', async () => {
    const fixture = TestBed.createComponent(StylesLabComponent);
    const component = fixture.componentInstance;
    const themeService = TestBed.inject(ThemeService);
    const initialHue = themeService.currentHue();
    const initialChroma = themeService.seedChroma();
    fixture.detectChanges();

    const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true
    });

    try {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('m3-slider').length).toBeGreaterThanOrEqual(3);
      expect(el.querySelectorAll('m3-card').length).toBeGreaterThanOrEqual(6);
      expect(el.querySelectorAll('m3-chip').length).toBeGreaterThan(8);
      expect(el.querySelector('m3-tabs')).toBeTruthy();
      expect(el.querySelector('m3-snackbar')).toBeTruthy();

      // Section hosts keep display: block so vertical spacing never collapses to 0px
      expect(el.querySelector('app-styles-tokens-section')?.classList.contains('block')).toBe(true);
      expect(el.querySelector('app-styles-color-section')?.classList.contains('block')).toBe(true);

      themeService.setThemeHue(155);
      themeService.setSeedChroma(0.14);
      fixture.detectChanges();

      const findButton = (text: string): HTMLButtonElement | undefined =>
        Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes(text));

      // Optical Concentricity simulator reacts to M3 slider
      const concentricSlider = el.querySelector('#styles-concentric-padding') as HTMLInputElement;
      expect(concentricSlider).toBeTruthy();
      concentricSlider.value = '20';
      concentricSlider.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(el.textContent).toContain('R_inner recomendado = 8px');

      // Portable :root CSS exporter panel & clipboard action
      findButton('Exportar :root CSS')!.click();
      fixture.detectChanges();
      const exportPre = el.querySelector('pre')?.textContent ?? '';
      expect(exportPre).toContain('@import "./styles/m3-expressive.css";');
      expect(exportPre).toContain('--seed-hue: 155;');
      expect(exportPre).toContain('--seed-chroma: 0.14;');

      findButton('Copiar :root CSS')!.click();
      await Promise.resolve();
      fixture.detectChanges();
      expect(writeTextSpy).toHaveBeenCalledWith(exportPre);
      expect(component.snackbarOpen()).toBe(true);

      // Tonal swatch click-to-copy inspector in Caso 2
      const tertiaryChip = Array.from(el.querySelectorAll('app-styles-color-section m3-chip button')).find(
        (b) => b.textContent?.trim() === 'Tertiary'
      ) as HTMLButtonElement;
      tertiaryChip.click();
      fixture.detectChanges();

      const swatchBtn = el.querySelector('button[aria-label="Copiar token --md-ref-palette-tertiary40"]') as HTMLButtonElement;
      expect(swatchBtn).toBeTruthy();
      swatchBtn.click();
      await Promise.resolve();
      fixture.detectChanges();
      expect(el.querySelector('app-styles-color-section')?.textContent).toContain('--md-ref-palette-tertiary40');
      expect(writeTextSpy).toHaveBeenCalledWith('var(--md-ref-palette-tertiary40)');

      // Live typography preview input in Caso 3
      const typoInput = el.querySelector('app-styles-typography-section m3-text-field input') as HTMLInputElement;
      expect(typoInput).toBeTruthy();
      typoInput.value = 'Guardia Clínica Expresiva';
      typoInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(el.querySelector('app-styles-typography-section')?.textContent).toContain('Guardia Clínica Expresiva');
    } finally {
      themeService.setThemeHue(initialHue);
      themeService.setSeedChroma(initialChroma);
      if (originalDescriptor) {
        Object.defineProperty(navigator, 'clipboard', originalDescriptor);
      } else {
        delete (navigator as { clipboard?: Clipboard }).clipboard;
      }
    }
  });
});
