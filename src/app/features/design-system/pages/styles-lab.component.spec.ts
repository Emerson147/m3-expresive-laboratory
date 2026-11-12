import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../core/theme/theme.service';
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
    expect(el.textContent).toContain('styles/typography/applying-type');
    expect(el.textContent).toContain('styles/typography/type-scale-tokens');
    expect(el.textContent).toContain('Caso 4');
    expect(el.textContent).toContain('shape/overview-principles');
    expect(el.textContent).toContain('shape/shape-morph');
    expect(el.querySelector('m3-loading-indicator')).toBeTruthy();
    expect(el.textContent).toContain('Caso 5');
    expect(el.textContent).toContain('styles/elevation/applying-elevation');
    expect(el.textContent).toContain('Caso 6');
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
});
