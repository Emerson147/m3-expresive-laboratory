import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogService } from '../../core/dialog/dialog.service';
import { TaskService } from '../../core/tasks/task.service';
import { ThemeService } from '../../core/theme/theme.service';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(ThemeService).setContrastLevel('standard');
    TestBed.inject(DialogService).isHeroExpanded.set(false);
  });

  it('renders the hero card, aligned +60 OKLCH copy, linear progress, and 3 agenda KPI links', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('+60°');
    expect(el.querySelector('m3-linear-progress')).toBeTruthy();

    const kpiLinks = el.querySelectorAll('a[href="/agenda"]');
    expect(kpiLinks.length).toBe(3);
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

  it('renders the animated GPU aurora layer on the hero card without manual toggle controls', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();

    const heroCard = fixture.nativeElement.querySelector('[role="button"][tabindex="0"]') as HTMLElement;
    expect(heroCard.classList.contains('hero-mesh-m3')).toBe(true);
    expect(heroCard.classList.contains('m3-aurora-glow')).toBe(true);
    expect(heroCard.querySelectorAll('.m3-aurora-layer .m3-aurora-orb').length).toBe(3);
    expect(fixture.nativeElement.querySelector('[aria-label="Modo de aurora de fondo"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Gemini buscando...');
  });

  it('updates M3 contrast level directly via ThemeService from the tertiary card', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();

    const contrastGroup = fixture.nativeElement.querySelector('[aria-label="Nivel de contraste M3"]') as HTMLElement;
    const highBtn = Array.from(contrastGroup.querySelectorAll('button')).find(btn => btn.textContent?.includes('Alto')) as HTMLButtonElement;

    highBtn.click();
    fixture.detectChanges();

    expect(themeService.contrastLevel()).toBe('high');
    expect(highBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('toggles task completion from the Overview checklist and syncs TaskService counts', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const taskService = TestBed.inject(TaskService);
    fixture.detectChanges();

    const initialCompleted = taskService.completedCount();
    const firstChipButton = fixture.nativeElement.querySelector('m3-chip button') as HTMLButtonElement;

    firstChipButton.click();
    fixture.detectChanges();

    expect(taskService.completedCount()).not.toBe(initialCompleted);

    // Restore initial task completion state
    firstChipButton.click();
    fixture.detectChanges();
    expect(taskService.completedCount()).toBe(initialCompleted);
  });

  it('toggles the Caso 3 inline expandable card using CSS grid transitions and inert attribute', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();

    const toggleBtn = fixture.nativeElement.querySelector('[aria-controls="overview-inline-spec-panel"]') as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector('#overview-inline-spec-panel') as HTMLElement;

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hasAttribute('inert')).toBe(true);

    toggleBtn.click();
    fixture.detectChanges();

    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(false);
    expect(panel.classList.contains('grid-rows-[1fr]')).toBe(true);
  });
});
