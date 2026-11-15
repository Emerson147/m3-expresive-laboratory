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

  it('renders KPI ribbon, semantic search landmark, grouped tasks, and focus inspector without nested buttons', () => {
    const fixture = TestBed.createComponent(AgendaComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-agenda-kpi-ribbon m3-linear-progress')).toBeTruthy();
    expect(el.querySelector('search input[type="search"]')).toBeTruthy();
    expect(el.querySelector('aside m3-circular-progress')).toBeTruthy();
    expect(el.textContent).toContain('Sesión de Enfoque');

    // Guard against invalid nested interactive buttons inside cards
    const nestedButtons = el.querySelectorAll('button button');
    expect(nestedButtons.length).toBe(0);
  });

  it('supports inline quick-add for Hoy, filtering, empty state reset, and inspector subtask creation', () => {
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

    const created = taskService.tasks().find(t => t.title === 'Auditar accesibilidad de tabs M3');
    expect(created).toBeTruthy();
    expect(created?.dueBucket).toBe('Hoy');
    expect(taskService.selectedTask()?.id).toBe(created?.id);

    // Add subtask inside inspector for the newly selected task
    const subtaskInput = el.querySelector('#inspector-new-subtask') as HTMLInputElement;
    subtaskInput.value = 'Verificar roving tabindex';
    subtaskInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (subtaskInput.closest('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(taskService.selectedTask()?.subtasks.some(s => s.title === 'Verificar roving tabindex')).toBe(true);

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

    expect(openSpy).toHaveBeenCalledWith(expect.objectContaining({ id: selected.id }));
    expect(dialogService.draftDate()).toBe(selected.dueBucket);
    expect(dialogService.draftTimeSlot()).toBe(selected.timeSlot);
    expect(dialogService.draftDuration()).toBe(selected.durationMinutes);
  });
});
