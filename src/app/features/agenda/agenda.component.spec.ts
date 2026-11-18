import { TestBed } from '@angular/core/testing';
import { TaskService } from '../../core/tasks/task.service';
import { AgendaFocusService } from './agenda-focus.service';
import { AgendaComponent } from './agenda.component';

describe('AgendaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaComponent]
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(AgendaFocusService).reset(25);
  });

  it('renders Biblia M3 primitives (KPI card, split primary CTA, immediate switch, Focus Dock, Inspector tabs) with single filled CTA and no nested buttons', () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-agenda-kpi-ribbon m3-card')).toBeTruthy();
    expect(el.querySelector('app-agenda-kpi-ribbon m3-linear-progress')).toBeTruthy();
    expect(el.querySelector('search m3-text-field input[type="search"]')).toBeTruthy();
    expect(el.querySelector('app-agenda-filters-bar m3-split-button')).toBeTruthy();
    expect(el.querySelector('app-agenda-filters-bar m3-switch button[role="switch"]')).toBeTruthy();
    expect(el.querySelectorAll('app-agenda-task-list li m3-card').length).toBeGreaterThan(0);
    expect(el.querySelector('aside app-agenda-focus-dock m3-circular-progress')).toBeTruthy();
    expect(el.querySelector('aside app-agenda-inspector-pane m3-tabs')).toBeTruthy();
    expect(el.querySelectorAll('aside m3-button-group').length).toBeGreaterThanOrEqual(4);
    expect(el.querySelector('m3-fab')).toBeTruthy();
    expect(el.querySelector('app-agenda-task-form-dialog m3-dialog dialog')).toBeTruthy();
    expect(el.querySelector('m3-snackbar')).toBeTruthy();
    expect(el.textContent).toContain('Sesión de Enfoque');

    // Enforce Biblia M3 single primary filled button outside closed <dialog> and <m3-split-button>
    const nonSplitFilledButtons = Array.from(el.querySelectorAll('.m3-btn-filled')).filter(
      btn => !btn.closest('m3-split-button') && !btn.closest('dialog')
    );
    expect(nonSplitFilledButtons.length).toBe(0);

    // Guard against display:inline Angular custom hosts collapsing vertical flex/space gaps
    for (const selector of [
      'app-agenda-kpi-ribbon',
      'app-agenda-filters-bar',
      'app-agenda-task-list',
      'app-agenda-focus-dock',
      'app-agenda-inspector-pane'
    ]) {
      expect(el.querySelector(selector)?.classList.contains('block')).toBe(true);
    }

    // Guard against invalid nested interactive buttons inside cards
    expect(el.querySelectorAll('button button').length).toBe(0);
  });

  it('supports onlyToday switch, split-button preset creation, secondary inspector tabs, and m3-dialog batch cleanup', async () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    const taskService = TestBed.inject(TaskService);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    // 1. Toggle immediate binary filter via <m3-switch iconMode="selected">
    const todaySwitch = el.querySelector('app-agenda-filters-bar m3-switch button[role="switch"]') as HTMLButtonElement;
    expect(todaySwitch.getAttribute('aria-checked')).toBe('false');
    todaySwitch.click();
    fixture.detectChanges();
    expect(taskService.onlyToday()).toBe(true);
    expect(taskService.groupedFilteredTasks().every(g => g.bucket === 'Hoy')).toBe(true);

    todaySwitch.click();
    fixture.detectChanges();
    expect(taskService.onlyToday()).toBe(false);

    // 2. Trigger preset task creation from <m3-split-button> menu item
    const deepWorkItem = Array.from(el.querySelectorAll('m3-split-button button[role="menuitem"]')).find(btn =>
      btn.textContent?.includes('Deep Work')
    ) as HTMLButtonElement;
    expect(deepWorkItem).toBeTruthy();
    deepWorkItem.click();
    fixture.detectChanges();

    const deepTask = taskService.tasks().find(t => t.title === 'Bloque Deep Work');
    expect(deepTask).toBeTruthy();
    expect(deepTask?.durationMinutes).toBe(45);
    expect(deepTask?.priority).toBe('Alta');
    expect(taskService.selectedTask()?.id).toBe(deepTask?.id);

    // 3. Switch between secondary inspector tabs ('steps' <-> 'plan') while Pomodoro Focus Dock stays visible
    const stepsPanel = el.querySelector('#agenda-inspector-steps-panel') as HTMLElement;
    const planPanel = el.querySelector('#agenda-inspector-plan-panel') as HTMLElement;
    expect(stepsPanel.hasAttribute('hidden')).toBe(false);
    expect(planPanel.hasAttribute('hidden')).toBe(true);

    const planTabBtn = el.querySelector('#agenda-inspector-tab-plan') as HTMLButtonElement;
    planTabBtn.click();
    fixture.detectChanges();
    expect(stepsPanel.hasAttribute('hidden')).toBe(true);
    expect(planPanel.hasAttribute('hidden')).toBe(false);
    expect(el.querySelector('#inspector-task-notes')).toBeTruthy();
    expect(el.querySelector('app-agenda-focus-dock m3-circular-progress')).toBeTruthy();

    // 4. Batch clean completed tasks via confirmation <m3-dialog>
    const initialCompleted = taskService.completedCount();
    expect(initialCompleted).toBeGreaterThan(0);

    const clearTrigger = Array.from(el.querySelectorAll('app-agenda-filters-bar button')).find(btn =>
      btn.textContent?.includes('Limpiar completadas')
    ) as HTMLButtonElement;
    expect(clearTrigger).toBeTruthy();
    clearTrigger.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.clearDialogOpen()).toBe(true);
    const confirmBtn = Array.from(el.querySelectorAll('m3-dialog [dialog-actions] button')).find(btn =>
      btn.textContent?.includes('Limpiar')
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(taskService.completedCount()).toBe(0);
    expect(fixture.componentInstance.clearDialogOpen()).toBe(false);
  });

  it('supports in-place quick-add pill morph, selected card focus tray, undo via m3-snackbar, and inspector subtasks', async () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    const taskService = TestBed.inject(TaskService);
    const focusService = TestBed.inject(AgendaFocusService);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    // Expand quick-capture container in-place
    const quickTrigger = el.querySelector('[aria-controls="agenda-quick-add-region"]') as HTMLButtonElement;
    expect(quickTrigger.getAttribute('aria-expanded')).toBe('false');
    quickTrigger.click();
    fixture.detectChanges();
    expect(quickTrigger.getAttribute('aria-expanded')).toBe('true');

    const quickInput = el.querySelector('#agenda-quick-add') as HTMLInputElement;
    quickInput.value = 'Auditar accesibilidad de tabs M3';
    quickInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const quickForm = quickInput.closest('form') as HTMLFormElement;
    quickForm.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const created = taskService.tasks().find(t => t.title === 'Auditar accesibilidad de tabs M3')!;
    expect(created).toBeTruthy();
    expect(created.dueBucket).toBe('Hoy');
    expect(taskService.selectedTask()?.id).toBe(created.id);

    // Selected card expands inline focus tray ("Enfocar bloque")
    const cardFocusBtn = Array.from(
      el.querySelectorAll('app-agenda-task-list .agenda-task-tile.is-selected button')
    ).find(btn => btn.textContent?.includes('Enfocar bloque')) as HTMLButtonElement;
    expect(cardFocusBtn).toBeTruthy();
    cardFocusBtn.click();
    fixture.detectChanges();
    expect(focusService.status()).toBe('running');
    expect(focusService.activeTaskId()).toBe(created.id);
    focusService.pause();

    // Add subtask inside inspector using <m3-text-field>
    const subtaskInput = el.querySelector('#inspector-new-subtask') as HTMLInputElement;
    subtaskInput.value = 'Verificar roving tabindex';
    subtaskInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (subtaskInput.closest('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(taskService.selectedTask()?.subtasks.some(s => s.title === 'Verificar roving tabindex')).toBe(true);

    // Delete task and undo via M3Snackbar
    fixture.componentInstance.onDeleteTask(created.id);
    await Promise.resolve();
    fixture.detectChanges();
    expect(taskService.tasks().some(t => t.id === created.id)).toBe(false);

    const undoBtn = el.querySelector('m3-snackbar .m3-snackbar-action') as HTMLButtonElement;
    expect(undoBtn?.textContent).toContain('Deshacer');
    undoBtn.click();
    fixture.detectChanges();
    expect(taskService.tasks().some(t => t.id === created.id)).toBe(true);

    // Search miss renders empty state & clears cleanly
    taskService.setSearchQuery('zzzzzz_nonexistent_term');
    fixture.detectChanges();
    expect(el.textContent).toContain('Sin actividades para estos filtros');

    const clearBtn = Array.from(el.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Limpiar filtros')
    ) as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();

    expect(taskService.searchQuery()).toBe('');
    expect(el.textContent).toContain('Auditar accesibilidad de tabs M3');
  });

  it('tracks focus session countdown and opens native m3-dialog forms cleanly', () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    const taskService = TestBed.inject(TaskService);
    const focusService = TestBed.inject(AgendaFocusService);
    fixture.detectChanges();

    const selected = taskService.selectedTask()!;
    const prevSessions = selected.focusSessionsCompleted;

    focusService.setDurationPreset(25, selected.id);
    focusService.startOrResume(selected.id, selected.title);
    expect(focusService.status()).toBe('running');

    focusService.tick();
    expect(focusService.remainingSeconds()).toBe(25 * 60 - 1);

    focusService.completeSession();
    expect(focusService.status()).toBe('completed');
    expect(taskService.tasks().find(t => t.id === selected.id)?.focusSessionsCompleted).toBe(
      prevSessions + 1
    );

    const el = fixture.nativeElement as HTMLElement;
    const modalBtn = Array.from(el.querySelectorAll('app-agenda-inspector-pane button')).find(btn =>
      btn.textContent?.includes('Modal')
    ) as HTMLButtonElement;
    modalBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.taskFormOpen()).toBe(true);
    expect(fixture.componentInstance.editingTask()?.id).toBe(selected.id);
    expect(el.querySelector('app-agenda-task-form-dialog dialog.m3-dialog-expressive')?.hasAttribute('open')).toBe(true);

    fixture.componentInstance.taskFormOpen.set(false);
    fixture.detectChanges();

    const splitLeadingBtn = el.querySelector('app-agenda-filters-bar m3-split-button .m3-split-btn-leading') as HTMLButtonElement;
    splitLeadingBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.taskFormOpen()).toBe(true);
    expect(fixture.componentInstance.editingTask()).toBeNull();
  });

  it('orchestrates single-owner hero-transform (Focus Dock Card -> Hero Card) and dialog-transform (Buttons -> Form Modal) keeping origins invisible while open', async () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    const taskService = TestBed.inject(TaskService);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const doc = document as unknown as {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const original = doc.startViewTransition;
    const snapshots: { heroBefore: number; heroAfter: number; dlgBefore: number; dlgAfter: number }[] = [];
    const pendingResolvers: (() => void)[] = [];

    doc.startViewTransition = (cb: () => void) => {
      const heroBefore = el.querySelectorAll('[style*="view-transition-name: hero-transform"]').length;
      const dlgBefore = el.querySelectorAll('[style*="view-transition-name: dialog-transform"]').length;
      cb();
      const heroAfter = el.querySelectorAll('[style*="view-transition-name: hero-transform"]').length;
      const dlgAfter = el.querySelectorAll('[style*="view-transition-name: dialog-transform"]').length;
      snapshots.push({ heroBefore, heroAfter, dlgBefore, dlgAfter });
      return {
        finished: new Promise<void>(resolve => pendingResolvers.push(resolve))
      };
    };

    try {
      // 1. Card -> Expanded Hero Card (hero-transform + Stage Recess)
      const dockCard = el.querySelector('app-agenda-focus-dock section') as HTMLElement;
      const expandBtn = Array.from(el.querySelectorAll('app-agenda-focus-dock button')).find(btn =>
        btn.textContent?.includes('Expandir')
      ) as HTMLButtonElement;
      expect(expandBtn).toBeTruthy();
      expandBtn.click();
      fixture.detectChanges();

      expect(snapshots.at(-1)).toEqual({ heroBefore: 1, heroAfter: 1, dlgBefore: 0, dlgAfter: 0 });
      expect(fixture.componentInstance.focusTheaterOpen()).toBe(true);
      expect(fixture.componentInstance.stageOverlay.isOverlayOpen()).toBe(true);
      expect(
        el.querySelector('app-agenda-focus-theater-dialog [role="dialog"] .m3-aurora-layer')
      ).toBeTruthy();

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();
      expect(fixture.componentInstance.focusMorphOwner()).toBeNull();
      // Dock card must remain invisible the whole time the expanded card is open
      expect(dockCard.classList.contains('invisible')).toBe(true);
      expect(dockCard.getAttribute('aria-hidden')).toBe('true');

      // Minimizing expanded Hero Card morphs back into Focus Dock card
      const minimizeBtn = Array.from(el.querySelectorAll('app-agenda-focus-theater-dialog button')).find(
        btn => btn.textContent?.includes('Minimizar')
      ) as HTMLButtonElement;
      minimizeBtn.click();
      fixture.detectChanges();

      expect(snapshots.at(-1)).toEqual({ heroBefore: 1, heroAfter: 1, dlgBefore: 0, dlgAfter: 0 });
      expect(fixture.componentInstance.focusTheaterOpen()).toBe(false);
      expect(dockCard.classList.contains('invisible')).toBe(false);

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();
      expect(fixture.componentInstance.focusMorphOwner()).toBeNull();

      // 2. Button ("Nueva Actividad" Split Button & Card "Editar") -> Form <m3-dialog> (dialog-transform)
      const splitContainer = el.querySelector('app-agenda-filters-bar .m3-split-btn') as HTMLElement;
      const splitLeadingBtn = el.querySelector(
        'app-agenda-filters-bar m3-split-button .m3-split-btn-leading'
      ) as HTMLButtonElement;
      splitLeadingBtn.click();
      fixture.detectChanges();

      expect(snapshots.at(-1)).toEqual({ heroBefore: 0, heroAfter: 0, dlgBefore: 1, dlgAfter: 1 });
      expect(fixture.componentInstance.taskFormOpen()).toBe(true);
      expect(splitContainer.classList.contains('invisible')).toBe(true);

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();
      // Critical: origin trigger must stay invisible AFTER VT finishes while modal stays open
      expect(fixture.componentInstance.taskFormMorphTarget()).toBeNull();
      expect(splitContainer.classList.contains('invisible')).toBe(true);

      const closeCreateBtn = Array.from(el.querySelectorAll('app-agenda-task-form-dialog [dialog-actions] button')).find(
        btn => btn.textContent?.includes('Cancelar')
      ) as HTMLButtonElement;
      closeCreateBtn.click();
      fixture.detectChanges();

      expect(snapshots.at(-1)).toEqual({ heroBefore: 0, heroAfter: 0, dlgBefore: 1, dlgAfter: 1 });
      expect(fixture.componentInstance.taskFormOpen()).toBe(false);
      expect(splitContainer.classList.contains('invisible')).toBe(false);

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();

      // Card "Editar" button morph -> dialog -> return morph
      const selected = taskService.selectedTask()!;
      const cardEditBtn = el.querySelector(
        `app-agenda-task-list button[aria-label="Editar en modal ${selected.title}"]`
      ) as HTMLButtonElement;
      expect(cardEditBtn).toBeTruthy();
      cardEditBtn.click();
      fixture.detectChanges();

      expect(snapshots.at(-1)).toEqual({ heroBefore: 0, heroAfter: 0, dlgBefore: 1, dlgAfter: 1 });
      expect(fixture.componentInstance.taskFormOpen()).toBe(true);
      expect(fixture.componentInstance.taskFormLastOrigin()).toBe(`card-${selected.id}`);

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();
      expect(cardEditBtn.classList.contains('invisible')).toBe(true);

      const cancelBtn = Array.from(el.querySelectorAll('app-agenda-task-form-dialog [dialog-actions] button')).find(
        btn => btn.textContent?.includes('Cancelar')
      ) as HTMLButtonElement;
      cancelBtn.click();
      fixture.detectChanges();

      expect(snapshots.at(-1)).toEqual({ heroBefore: 0, heroAfter: 0, dlgBefore: 1, dlgAfter: 1 });
      expect(fixture.componentInstance.taskFormOpen()).toBe(false);
      expect(cardEditBtn.classList.contains('invisible')).toBe(false);

      pendingResolvers.pop()?.();
      await Promise.resolve();
      fixture.detectChanges();
      expect(fixture.componentInstance.taskFormLastOrigin()).toBeNull();
    } finally {
      doc.startViewTransition = original;
    }
  });
});
