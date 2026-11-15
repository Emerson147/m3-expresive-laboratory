import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlaybookLabComponent } from './playbook-lab.component';

describe('PlaybookLabComponent', () => {
  let component: PlaybookLabComponent;
  let fixture: ComponentFixture<PlaybookLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybookLabComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaybookLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the 4 Lego layers, 5 sacred questions, starter checklist, and uses real M3 components', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Biblia M3');
    expect(el.textContent).toContain('Modelo Mental en 4 Capas');
    expect(el.textContent).toContain('Las 5 Preguntas Sagradas');
    expect(el.querySelectorAll('m3-card').length).toBe(4);
    expect(el.querySelectorAll('m3-checkbox').length).toBe(component.checklistItems.length);
    expect(el.querySelector('m3-linear-progress')).toBeTruthy();
    expect(el.querySelector('m3-tabs')).toBeTruthy();
  });

  it('updates interactive starter checklist progress when toggling items', () => {
    const initialCount = component.completedChecklistCount();
    expect(initialCount).toBe(2);

    component.toggleChecklistItem('chk-components');
    fixture.detectChanges();
    expect(component.completedChecklistCount()).toBe(3);
    expect(component.checklistProgressPercent()).toBe(50);

    component.toggleChecklistItem('chk-components');
    fixture.detectChanges();
    expect(component.completedChecklistCount()).toBe(2);
  });

  it('switches screen recipe blueprints through the active M3 tabs model', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Receta 1: Formulario CRUD');

    component.activeBlueprintId.set('modal');
    fixture.detectChanges();
    expect(el.textContent).toContain('Receta 4: Diálogo Modal Seguro');
  });

  it('filters the Decision Oracle by category, source badge, and search query cleanly', () => {
    expect(component.filteredRules().length).toBe(component.totalRulesCount);

    component.selectedCategory.set('overlays');
    fixture.detectChanges();
    expect(component.filteredRules().every((r) => r.category === 'overlays')).toBe(true);

    component.selectedCategory.set('all');
    component.selectedSource.set('Estándar Web / WCAG');
    fixture.detectChanges();
    expect(component.filteredRules().length).toBeGreaterThan(0);
    expect(component.filteredRules().every((r) => r.sourceBadge === 'Estándar Web / WCAG')).toBe(true);

    component.selectedSource.set('all');
    component.oracleQuery.set('switch');
    fixture.detectChanges();
    expect(component.filteredRules().some((r) => r.id === 'rule-switch')).toBe(true);

    component.oracleQuery.set('no-existe-esta-regla-xyz');
    fixture.detectChanges();
    expect(component.filteredRules().length).toBe(0);

    component.resetOracleFilters();
    fixture.detectChanges();
    expect(component.filteredRules().length).toBe(component.totalRulesCount);
  });

  it('opens the manual snackbar when copying a starter snippet or oracle rule', () => {
    component.copySnippet('<m3-switch />', 'Uso copiado');
    fixture.detectChanges();

    expect(component.snackbarOpen()).toBe(true);
    expect(component.snackbarMessage()).toBe('Uso copiado');
    expect(fixture.nativeElement.querySelector('.m3-snackbar')?.textContent).toContain('Uso copiado');
  });
});
