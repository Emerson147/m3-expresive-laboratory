import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClinicService } from '../../core/clinic/clinic.service';
import { DialogService } from '../../core/dialog/dialog.service';
import { TaskService } from '../../core/tasks/task.service';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(DialogService).isHeroExpanded.set(false);
  });

  it('renders the operational hero, wavy linear progress, live agenda panel, and all 6 module pulse cards', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Pulso operativo del sistema');
    expect(el.textContent).toContain('Agenda en vivo');
    expect(el.querySelector('m3-linear-progress')).toBeTruthy();

    expect(el.querySelector('a[href="/agenda"]')).toBeTruthy();
    expect(el.querySelector('a[href="/clinic"]')).toBeTruthy();
    expect(el.querySelector('a[href="/campus"]')).toBeTruthy();
    expect(el.querySelector('a[href="/pos"]')).toBeTruthy();
    expect(el.querySelector('a[href="/inventory"]')).toBeTruthy();
    expect(el.querySelector('a[href="/kanban"]')).toBeTruthy();
    expect(el.querySelector('a[href="/telemetry"]')).toBeTruthy();
  });

  it('requests hero detail expansion when activating the hero card', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const dialogService = TestBed.inject(DialogService);
    const spy = vi.spyOn(dialogService, 'toggleHeroDetail');
    fixture.detectChanges();

    const heroCard = fixture.nativeElement.querySelector('[role="button"][tabindex="0"]') as HTMLElement;
    heroCard.click();

    expect(spy).toHaveBeenCalledWith(true);
  });

  it('keeps the hero slot mounted with invisible state while expanded to avoid grid shift', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const dialogService = TestBed.inject(DialogService);
    fixture.detectChanges();

    dialogService.isHeroExpanded.set(true);
    fixture.detectChanges();

    const heroCard = fixture.nativeElement.querySelector('[role="button"][tabindex="0"]') as HTMLElement;
    expect(heroCard).toBeTruthy();
    expect(heroCard.classList.contains('invisible')).toBe(true);
    expect(heroCard.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the animated GPU aurora layer with 3 orbs on the hero card', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();

    const heroCard = fixture.nativeElement.querySelector('[role="button"][tabindex="0"]') as HTMLElement;
    expect(heroCard.classList.contains('hero-mesh-m3')).toBe(true);
    expect(heroCard.classList.contains('m3-aurora-glow')).toBe(true);
    expect(heroCard.querySelectorAll('.m3-aurora-layer .m3-aurora-orb').length).toBe(3);
  });

  it('reflects live domain KPI updates across modules and toggles tasks directly via TaskService', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const taskService = TestBed.inject(TaskService);
    const clinicService = TestBed.inject(ClinicService);
    fixture.detectChanges();

    const initialCompleted = taskService.completedCount();
    const firstCheckbox = fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLButtonElement;
    const beforeChecked = firstCheckbox.getAttribute('aria-checked');

    firstCheckbox.click();
    fixture.detectChanges();

    expect(taskService.completedCount()).not.toBe(initialCompleted);
    expect(firstCheckbox.getAttribute('aria-checked')).not.toBe(beforeChecked);

    // Restore initial task completion state
    firstCheckbox.click();
    fixture.detectChanges();
    expect(taskService.completedCount()).toBe(initialCompleted);

    const clinicCard = fixture.nativeElement.querySelector('a[href="/clinic"]') as HTMLElement;
    expect(clinicCard.textContent).toContain(`${clinicService.kpiSummary().totalActivePatients} en triaje`);
  });

  it('links clean access to Design System without duplicating appearance controls inside Overview', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[aria-label="Nivel de contraste M3"]')).toBeNull();
    expect(el.querySelector('#overview-inline-spec-panel')).toBeNull();
    expect(el.querySelector('a[href="/design-system/styles"]')).toBeTruthy();
  });

  it('opens local m3-dialog for quick task creation without invoking global DialogService form', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const dialogService = TestBed.inject(DialogService);
    const taskService = TestBed.inject(TaskService);
    const openGlobalSpy = vi.spyOn(dialogService, 'openFrom');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const triggerBtn = el.querySelector('#trigger-bento-center button') as HTMLButtonElement;
    triggerBtn.click();
    fixture.detectChanges();

    expect(openGlobalSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.quickTaskOpen()).toBe(true);
    expect(el.querySelector('m3-dialog dialog.m3-dialog-expressive')?.hasAttribute('open')).toBe(true);

    fixture.componentInstance.onQuickTitleChange('Revisar métricas de Overview');
    fixture.componentInstance.submitQuickTask();
    fixture.detectChanges();

    expect(fixture.componentInstance.quickTaskOpen()).toBe(false);
    expect(taskService.tasks().some(t => t.title === 'Revisar métricas de Overview')).toBe(true);
  });
});
