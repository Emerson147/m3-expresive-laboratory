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
    themeService.setContrastLevel('standard');
    themeService.setSeedChroma(0.16);
    themeService.setMotionScheme('expressive');
    if (themeService.isDarkMode()) {
      themeService.toggleThemeMode();
    }
  });

  it('opens menu-main directly into unified M3 Expressive customization (switch, chroma, contrast, motion, nav) without duplicated task action', () => {
    const fixture = TestBed.createComponent(DialogContainerComponent);
    const themeService = TestBed.inject(ThemeService);
    const navSpy = vi.fn();
    fixture.componentInstance.navStyleChange.subscribe(navSpy);

    fixture.componentRef.setInput('isDialogOpen', true);
    fixture.componentRef.setInput('activeTrigger', 'menu-bottom-left');
    fixture.componentRef.setInput('activeTransition', null);
    fixture.componentRef.setInput('navStyle', 'auto');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('form')).toBeNull();
    expect(el.textContent).not.toContain('Nueva tarea rápida');
    expect(el.querySelector('[aria-label="Color semilla del tema"]')).toBeTruthy();

    // Toggle dark mode via real <m3-switch>
    const switchBtn = el.querySelector('m3-switch button[role="switch"]') as HTMLButtonElement;
    expect(switchBtn).toBeTruthy();
    switchBtn.click();
    fixture.detectChanges();
    expect(themeService.isDarkMode()).toBe(true);

    // OKLCH Chroma preset
    const chromaGroup = el.querySelector('[aria-label="Intensidad cromática OKLCH"]') as HTMLElement;
    const vibrantBtn = Array.from(chromaGroup.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Vibrante')
    ) as HTMLButtonElement;
    vibrantBtn.click();
    expect(themeService.seedChroma()).toBe(0.22);

    // M3 Contrast
    const contrastGroup = el.querySelector('[aria-label="Nivel de contraste M3"]') as HTMLElement;
    const highBtn = Array.from(contrastGroup.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Alto')
    ) as HTMLButtonElement;
    highBtn.click();
    fixture.detectChanges();
    expect(themeService.contrastLevel()).toBe('high');
    expect(highBtn.getAttribute('aria-pressed')).toBe('true');

    // Motion Scheme
    const motionGroup = el.querySelector('[aria-label="Esquema de movimiento"]') as HTMLElement;
    const standardMotionBtn = Array.from(motionGroup.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Estándar')
    ) as HTMLButtonElement;
    standardMotionBtn.click();
    expect(themeService.motionScheme()).toBe('standard');

    // Adaptive Navigation
    const navGroup = el.querySelector('[aria-label="Estilo de navegación"]') as HTMLElement;
    const dockBtn = Array.from(navGroup.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Dock')
    ) as HTMLButtonElement;
    dockBtn.click();
    expect(navSpy).toHaveBeenCalledWith('dock');
  });
});
