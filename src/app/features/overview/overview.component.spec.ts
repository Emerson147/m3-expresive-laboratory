import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { TaskService } from '../../core/tasks/task.service';
import { AgendaFocusService } from '../agenda/agenda-focus.service';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(AgendaFocusService).reset();
    TestBed.inject(StageOverlayService).setOverlayOpen(false);
  });

  it('enforces M3 Bible invariants: single filled CTA outside dialogs, zero nested interactive controls, 3 aurora orbs, and 48dp touch targets', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    // 1. Aurora Hero & Live Agenda built cleanly on m3-card tokens (zero !bg-* / .btn-m3 hacks)
    const heroCard = el.querySelector('app-overview-hero-card m3-card') as HTMLElement;
    expect(heroCard).toBeTruthy();
    expect(heroCard.classList.contains('hero-mesh-m3')).toBe(true);
    expect(heroCard.classList.contains('m3-card-surface-box')).toBe(true);
    expect(heroCard.querySelectorAll('.m3-aurora-orb').length).toBe(3);
    expect(heroCard.querySelector('m3-linear-progress')).toBeTruthy();

    const agendaCard = el.querySelector('app-overview-live-agenda m3-card') as HTMLElement;
    expect(agendaCard).toBeTruthy();
    expect(agendaCard.classList.contains('m3-card-filled')).toBe(true);
    expect(agendaCard.classList.contains('m3-card-surface-low')).toBe(true);

    expect(el.querySelectorAll('app-overview-modules-grid m3-card m3-linear-progress .m3-linear-progress-md').length).toBe(6);
    expect(el.querySelectorAll('.overview-module-card').length).toBe(6);
    expect(el.querySelectorAll('.overview-hero-kpi-tile').length).toBe(3);
    expect(el.querySelectorAll('.overview-agenda-row').length).toBe(4);
    expect(el.querySelector('.btn-m3')).toBeNull();

    // 2. Zero WCAG nested interactive elements
    expect(el.querySelector('[role="button"] button')).toBeNull();
    expect(el.querySelector('button button')).toBeNull();
    expect(el.querySelector('a button')).toBeNull();
    expect(el.querySelector('a [role="button"]')).toBeNull();

    // 3. Single primary filled <m3-split-button> CTA visible inside Hero standard button group
    expect(el.querySelector('app-overview-hero-card m3-button-group m3-split-button')).toBeTruthy();
    const standaloneFilledButtons = Array.from(el.querySelectorAll('.m3-btn-filled')).filter(
      btn => !btn.closest('dialog') && !btn.closest('m3-split-button')
    );
    expect(standaloneFilledButtons.length).toBe(0);
    const splitLeading = el.querySelector('#trigger-overview-quick-task .m3-split-btn-leading') as HTMLButtonElement;
    expect(splitLeading.textContent).toContain('Nueva tarea');

    // 4. Touch target 48dp on semantic <a m3-button> editorial links
    const agendaLink = el.querySelector('a[m3-button][href="/agenda"]');
    const dsLink = el.querySelector('a[m3-button][href="/design-system/styles"]');
    expect(agendaLink?.classList.contains('touch-target-48')).toBe(true);
    expect(dsLink?.classList.contains('touch-target-48')).toBe(true);
  });

  it('renders 6 subgrid tonal filled m3-cards (matching Agenda en vivo) with stretched links, matches alert sum, and filters via M3 filter chips', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const filledCards = el.querySelectorAll('app-overview-modules-grid article.overview-module-slot m3-card.m3-card-filled.m3-card-surface-low');
    expect(filledCards.length).toBe(6);
    expect(el.querySelectorAll('app-overview-modules-grid m3-card.m3-card-outlined').length).toBe(0);
    expect(el.querySelectorAll('app-overview-modules-grid m3-card a.overview-module-stretched-link').length).toBe(6);

    const sumAlerts = fixture.componentInstance.modulePulseCards().reduce((acc, card) => acc + card.alertCount, 0);
    expect(fixture.componentInstance.totalActiveAlerts()).toBe(sumAlerts);

    const chips = Array.from(
      el.querySelectorAll('app-overview-modules-grid m3-chip button')
    ) as HTMLButtonElement[];
    expect(chips.length).toBe(3);

    const alertsChip = chips.find(btn => btn.textContent?.includes('Con alertas'));
    const stableChip = chips.find(btn => btn.textContent?.includes('Estables'));
    const allChip = chips.find(btn => btn.textContent?.includes('Todos'));

    expect(alertsChip).toBeTruthy();
    expect(stableChip).toBeTruthy();
    expect(allChip).toBeTruthy();

    const expectedAlerts = fixture.componentInstance.alertsModuleCount();
    const expectedStable = fixture.componentInstance.stableModuleCount();
    expect(expectedAlerts + expectedStable).toBe(6);

    alertsChip!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-overview-modules-grid m3-card.m3-card-filled').length).toBe(expectedAlerts);

    stableChip!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-overview-modules-grid m3-card.m3-card-filled').length).toBe(expectedStable);

    allChip!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-overview-modules-grid m3-card.m3-card-filled').length).toBe(6);
  });

  it('toggles live agenda tasks via real <m3-checkbox> inputs and reflects active Pomodoro state', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const taskService = TestBed.inject(TaskService);
    const focusService = TestBed.inject(AgendaFocusService);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const checkboxes = el.querySelectorAll(
      'app-overview-live-agenda m3-checkbox input[type="checkbox"]'
    ) as NodeListOf<HTMLInputElement>;
    expect(checkboxes.length).toBe(4);

    const firstTask = taskService.tasks()[0];
    const initialCompleted = firstTask.completed;

    checkboxes[0].click();
    fixture.detectChanges();
    expect(taskService.tasks().find(t => t.id === firstTask.id)?.completed).toBe(!initialCompleted);

    // Start Pomodoro session and verify live banner + pause action
    focusService.startTaskSession(firstTask.id, 25, firstTask.title);
    fixture.detectChanges();

    const focusBanner = el.querySelector('app-overview-live-agenda [aria-label="Sesión de enfoque en curso"]');
    expect(focusBanner).toBeTruthy();
    expect(focusBanner?.textContent).toContain('25:00');

    const pauseBtn = focusBanner?.querySelector('m3-button button') as HTMLButtonElement | null;
    expect(pauseBtn).toBeTruthy();
    pauseBtn!.click();
    fixture.detectChanges();
    expect(focusService.status()).toBe('paused');
  });

  it('orchestrates single-owner hero-transform and dialog-transform relays keeping origins invisible while open', async () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const doc = TestBed.inject(DOCUMENT) as Document & {
      startViewTransition?: (cb?: () => void) => ViewTransition;
    };
    const stageOverlay = TestBed.inject(StageOverlayService);
    const taskService = TestBed.inject(TaskService);

    const originalStartVt = doc.startViewTransition;
    const snapshots: Array<{ heroBefore: number; heroAfter: number; dlgBefore: number; dlgAfter: number }> = [];

    doc.startViewTransition = vi.fn((cb?: () => void) => {
      const el = fixture.nativeElement as HTMLElement;
      const heroBefore = el.querySelectorAll('[style*="view-transition-name: hero-transform"]').length;
      const dlgBefore = el.querySelectorAll('[style*="view-transition-name: dialog-transform"]').length;
      cb?.();
      fixture.detectChanges();
      const heroAfter = el.querySelectorAll('[style*="view-transition-name: hero-transform"]').length;
      const dlgAfter = el.querySelectorAll('[style*="view-transition-name: dialog-transform"]').length;
      snapshots.push({ heroBefore, heroAfter, dlgBefore, dlgAfter });
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: () => { },
        types: new Set<string>()
      } as unknown as ViewTransition;
    });

    try {
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;

      // 1. Hero Card -> Expanded Hero Detail (hero-transform + Stage Overlay)
      const detailBtn = el.querySelector('#trigger-overview-hero-detail button') as HTMLButtonElement;
      detailBtn.click();
      await Promise.resolve();
      fixture.detectChanges();

      expect(snapshots.length).toBe(1);
      expect(snapshots[0].heroBefore).toBe(1);
      expect(snapshots[0].heroAfter).toBe(1);
      expect(fixture.componentInstance.heroDetailOpen()).toBe(true);
      expect(stageOverlay.isOverlayOpen()).toBe(true);

      const heroCardEl = el.querySelector('app-overview-hero-card m3-card') as HTMLElement;
      expect(heroCardEl.classList.contains('invisible')).toBe(true);
      expect(heroCardEl.getAttribute('aria-hidden')).toBe('true');

      // Close Hero Detail via close button
      const closeDetailBtn = el.querySelector(
        'app-overview-hero-detail [aria-label="Cerrar desglose del sistema"]'
      ) as HTMLButtonElement;
      closeDetailBtn.click();
      await Promise.resolve();
      fixture.detectChanges();

      expect(snapshots.length).toBe(2);
      expect(snapshots[1].heroBefore).toBe(1);
      expect(snapshots[1].heroAfter).toBe(1);
      expect(fixture.componentInstance.heroDetailOpen()).toBe(false);
      expect(stageOverlay.isOverlayOpen()).toBe(false);
      expect(heroCardEl.classList.contains('invisible')).toBe(false);

      // 2. Nueva tarea Split Button -> Quick Task <m3-dialog> (dialog-transform)
      const newTaskBtn = el.querySelector('#trigger-overview-quick-task .m3-split-btn-leading') as HTMLButtonElement;
      const newTaskWrapper = el.querySelector('#trigger-overview-quick-task .m3-split-btn') as HTMLElement;
      newTaskBtn.click();
      await Promise.resolve();
      fixture.detectChanges();

      expect(snapshots.length).toBe(3);
      expect(snapshots[2].dlgBefore).toBe(1);
      expect(snapshots[2].dlgAfter).toBe(1);
      expect(fixture.componentInstance.quickTaskOpen()).toBe(true);
      expect(newTaskWrapper.classList.contains('invisible')).toBe(true);

      // Submit valid quick task
      const initialCount = taskService.tasks().length;
      const input = el.querySelector('#overview-quick-title') as HTMLInputElement;
      input.value = 'Auditar contraste OKLCH en Overview';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const submitBtn = Array.from(el.querySelectorAll('app-overview-quick-task-dialog button')).find(
        btn => btn.textContent?.includes('Crear tarea')
      ) as HTMLButtonElement;
      submitBtn.click();
      await Promise.resolve();
      fixture.detectChanges();

      expect(taskService.tasks().length).toBe(initialCount + 1);
      expect(taskService.tasks()[0].title).toBe('Auditar contraste OKLCH en Overview');
      expect(fixture.componentInstance.quickTaskOpen()).toBe(false);
      expect(newTaskWrapper.classList.contains('invisible')).toBe(false);
    } finally {
      doc.startViewTransition = originalStartVt;
    }
  });

  it('creates a preset task directly from Hero <m3-split-button> popover menu', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    const taskService = TestBed.inject(TaskService);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const initialCount = taskService.tasks().length;

    const trigger = el.querySelector('#trigger-overview-quick-task .m3-split-btn-trailing') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const deepWorkItem = Array.from(el.querySelectorAll('#trigger-overview-quick-task [role="menuitem"]')).find(
      item => item.textContent?.includes('Bloque Deep Work')
    ) as HTMLButtonElement;
    expect(deepWorkItem).toBeTruthy();
    deepWorkItem.click();
    fixture.detectChanges();

    expect(taskService.tasks().length).toBe(initialCount + 1);
    expect(taskService.tasks()[0].title).toContain('Deep Work');
    expect(fixture.componentInstance.quickTaskOpen()).toBe(false);
  });
});
