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

  it('filters the Material A-Z Glossary by query and category', () => {
    const fixture = TestBed.createComponent(FoundationsLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const total = component.glossaryTerms.length;
    expect(component.filteredGlossary().length).toBe(total);

    component.glossaryQuery.set('48');
    expect(component.filteredGlossary().some(t => t.term.includes('48'))).toBe(true);

    component.glossaryQuery.set('');
    component.selectedGlossaryCategory.set('Accessibility');
    expect(component.filteredGlossary().every(t => t.category === 'Accessibility')).toBe(true);
  });
});

