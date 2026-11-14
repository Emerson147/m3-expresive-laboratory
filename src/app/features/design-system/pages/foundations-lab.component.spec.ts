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

  it('renders all 4 M3 Foundations cases without duplicating Styles labs', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Caso 1');
    expect(el.textContent).toContain('Caso 2');
    expect(el.textContent).toContain('Caso 3');
    expect(el.textContent).toContain('Caso 4');
    expect(el.querySelector('.touch-target-48')).toBeTruthy();
    expect(el.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  it('simulates all 5 Breakpoints, Canonical Layouts, and LTR/RTL direction toggles', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.widthBreakpoints.length).toBe(5);
    component.simulatedBreakpoint.set('compact');
    component.selectedCanonicalLayout.set('supporting-pane');
    fixture.detectChanges();

    expect(component.activeBreakpointSpec().marginDp).toBe(16);
    expect(fixture.nativeElement.textContent).toContain('Dock Inferior');

    component.simulatedBreakpoint.set('extra-large');
    component.isRtlPreview.set(true);
    fixture.detectChanges();

    expect(component.activeBreakpointSpec().marginDp).toBe(24);
    expect((fixture.nativeElement as HTMLElement).querySelector('[dir="rtl"]')).toBeTruthy();
  });

  it('supports keyboard Roving Tabindex traversal and updates aria-live region', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.focusedRovingIndex()).toBe(0);

    const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.handleRovingKeydown(arrowEvent, 0);
    fixture.detectChanges();

    expect(component.focusedRovingIndex()).toBe(1);

    component.activateRovingOption(1, 'Enter');
    fixture.detectChanges();
    expect(component.selectedRovingIndex()).toBe(1);
    expect(component.liveRegionMessage()).toContain('Envío Express');
  });

  it('validates WCAG color independence, post-interaction form aria-invalid, and +35% text expansion', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.a11ySpecs.length).toBe(6);

    const input = fixture.nativeElement.querySelector('#a11y-demo-email') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe('a11y-demo-hint');

    input.value = 'correo-invalido';
    component.onDemoEmailInput({ target: input } as unknown as Event);
    expect(component.isEmailInvalid()).toBe(false);

    component.onDemoEmailBlur({ target: input } as unknown as Event);
    fixture.detectChanges();
    expect(component.isEmailInvalid()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('a11y-demo-hint a11y-demo-error');

    component.useAccessibleErrorStyle.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('solo color rojo');

    component.simulateTextExpansion.set(true);
    fixture.detectChanges();
    expect(component.expandedCtaLabel()).toBe('Guardar cambios en agenda');
  });

  it('inspects Parts of Layout, simulates Adaptive Window width, Drag Handle split, and Fold hinge', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.layoutParts.length).toBe(8);
    expect(component.adaptiveStrategies.length).toBe(5);

    component.selectedLayoutPart.set('margin');
    fixture.detectChanges();
    expect(component.activeLayoutPart().region).toBe('Body Region');
    expect(fixture.nativeElement.textContent).toContain('Margins (Outer Spacing)');

    component.setSimulatedWidthPx(1024);
    fixture.detectChanges();
    expect(component.activeSimBreakpoint()).toBe('expanded');
    expect(component.effectiveSimWidthPx()).toBe(1024);
    expect(fixture.nativeElement.textContent).toContain('Show & Hide: Multi-Pane');

    component.adjustPaneSplit(15);
    expect(component.paneSplitPercent()).toBe(57);
    component.adjustPaneSplit(50);
    expect(component.paneSplitPercent()).toBe(70);

    component.simulateFold.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('FOLD');
  });
});

