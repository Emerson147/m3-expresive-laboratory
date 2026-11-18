import { TestBed } from '@angular/core/testing';
import { DialogService } from '../../core/dialog/dialog.service';
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

  it('renders Biblia M3 primitives (KPI card, split primary CTA, immediate switch, cards, secondary tabs) with single filled CTA and no nested buttons', () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-agenda-kpi-ribbon m3-card')).toBeTruthy();
    expect(el.querySelector('app-agenda-kpi-ribbon m3-linear-progress')).toBeTruthy();
    expect(el.querySelector('search m3-text-field input[type="search"]')).toBeTruthy();
    expect(el.querySelector('app-agenda-filters-bar m3-split-button')).toBeTruthy();
    expect(el.querySelector('app-agenda-filters-bar m3-switch button[role="switch"]')).toBeTruthy();
    expect(el.querySelectorAll('app-agenda-task-list li m3-card').length).toBeGreaterThan(0);
    expect(el.querySelector('aside m3-tabs')).toBeTruthy();
    expect(el.querySelector('aside m3-circular-progress')).toBeTruthy();
    expect(el.querySelectorAll('aside m3-button-group').length).toBeGreaterThanOrEqual(4);
    expect(el.querySelector('m3-fab')).toBeTruthy();
    expect(el.querySelector('m3-dialog dialog')).toBeTruthy();
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

    // 3. Switch between secondary inspector tabs ('focus' <-> 'plan')
    const focusPanel = el.querySelector('#agenda-inspector-focus-panel') as HTMLElement;
    const planPanel = el.querySelector('#agenda-inspector-plan-panel') as HTMLElement;
    expect(focusPanel.hasAttribute('hidden')).toBe(false);
    expect(planPanel.hasAttribute('hidden')).toBe(true);

    const planTabBtn = el.querySelector('#agenda-inspector-tab-plan') as HTMLButtonElement;
    planTabBtn.click();
    fixture.detectChanges();
    expect(focusPanel.hasAttribute('hidden')).toBe(true);
    expect(planPanel.hasAttribute('hidden')).toBe(false);
    expect(el.querySelector('#inspector-task-notes')).toBeTruthy();

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

  it('supports inline quick-add for Hoy, filtering, undo via m3-snackbar, and inspector subtask creation', async () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    const taskService = TestBed.inject(TaskService);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
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

  it('tracks focus session countdown and opens DialogService with synchronized bucket and timeSlot', () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    const taskService = TestBed.inject(TaskService);
    const focusService = TestBed.inject(AgendaFocusService);
    const dialogService = TestBed.inject(DialogService);
    const openSpy = vi.spyOn(dialogService, 'openTaskCard');
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

    const modalBtn = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('aside button')).find(btn =>
      btn.textContent?.includes('Modal')
    ) as HTMLButtonElement;
    modalBtn.click();
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: selected.id }),
      `inspector-modal-${selected.id}`
    );
    expect(dialogService.draftDate()).toBe(selected.dueBucket);
    expect(dialogService.draftTimeSlot()).toBe(selected.timeSlot);
    expect(dialogService.draftDuration()).toBe(selected.durationMinutes);
    dialogService.closeDialog();
  });

  it('binds exclusive dialog-transform origins per trigger button (Nueva Actividad split button, row Editar, and mobile FAB)', () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    const dialogService = TestBed.inject(DialogService);
    const taskService = TestBed.inject(TaskService);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const splitLeadingBtn = el.querySelector('app-agenda-filters-bar m3-split-button .m3-split-btn-leading') as HTMLButtonElement;
    expect(splitLeadingBtn).toBeTruthy();

    splitLeadingBtn.click();
    fixture.detectChanges();
    expect(dialogService.isDialogOpen()).toBe(true);
    expect(dialogService.activeOriginKey()).toBe('agenda-split-create');
    expect(el.querySelector('app-agenda-filters-bar m3-split-button .m3-split-btn')?.classList.contains('invisible')).toBe(true);

    dialogService.closeDialog();
    fixture.detectChanges();
    expect(dialogService.activeOriginKey()).toBeNull();

    // Verify task row Editar button is origin (not the wide <li> row)
    const firstTask = taskService.groupedFilteredTasks()[0].items[0];
    const rowEditBtn = el.querySelector(`button[aria-label="Editar en modal ${firstTask.title}"]`) as HTMLButtonElement;
    expect(rowEditBtn).toBeTruthy();
    rowEditBtn.click();
    fixture.detectChanges();

    expect(dialogService.activeOriginKey()).toBe(`task-edit-${firstTask.id}`);
    expect(rowEditBtn.classList.contains('invisible')).toBe(true);
    expect(rowEditBtn.closest('li')?.classList.contains('invisible')).toBe(false);

    dialogService.closeDialog();
    fixture.detectChanges();

    // Verify mobile <m3-fab> binds its own origin key cleanly
    const mobileFab = el.querySelector('m3-fab button') as HTMLButtonElement;
    expect(mobileFab).toBeTruthy();
    mobileFab.click();
    fixture.detectChanges();
    expect(dialogService.activeOriginKey()).toBe('agenda-fab-create');
    expect(mobileFab.classList.contains('invisible')).toBe(true);

    dialogService.closeDialog();
  });
});
