import { TestBed } from '@angular/core/testing';
import { TaskItem } from '../../../core/tasks/task.service';
import { AgendaTaskFormDialogComponent } from './agenda-task-form-dialog.component';

describe('AgendaTaskFormDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaTaskFormDialogComponent]
    }).compileComponents();
  });

  it('validates empty title before emitting saveTask and submits filled draft via native m3-dialog', () => {
    const fixture = TestBed.createComponent(AgendaTaskFormDialogComponent);
    const saved: unknown[] = [];
    fixture.componentInstance.saveTask.subscribe(d => saved.push(d));

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('m3-dialog dialog.m3-dialog-expressive.m3-dialog-lg')).toBeTruthy();
    expect(el.querySelector('m3-button-group [aria-label="Categoría de tarea"]')).toBeTruthy();
    expect(el.querySelector('m3-button-group [aria-label="Día programado"]')).toBeTruthy();
    expect(el.querySelector('m3-button-group [aria-label="Prioridad de tarea"]')).toBeTruthy();
    expect(el.querySelector('#agenda-modal-time')).toBeTruthy();

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(saved.length).toBe(0);
    expect(el.textContent).toContain('El título es obligatorio para guardar la tarea.');

    fixture.componentInstance.onTitleChange('Configurar Pipeline CI');
    fixture.detectChanges();
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(saved.length).toBe(1);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('populates fields when editing an existing task and emits deleteTask from dialog-actions-start', () => {
    const fixture = TestBed.createComponent(AgendaTaskFormDialogComponent);
    const deleted: number[] = [];
    fixture.componentInstance.deleteTask.subscribe(id => deleted.push(id));

    const sampleTask: TaskItem = {
      id: 42,
      title: 'Refinar Dialogs Locales',
      category: 'Design System',
      dueBucket: 'Mañana',
      timeSlot: '14:30',
      dateLabel: 'Mañana, 02:30 PM',
      durationMinutes: 45,
      priority: 'Media',
      notes: 'Usar <m3-dialog variant="expressive">',
      subtasks: [],
      focusSessionsCompleted: 0,
      completed: false
    };

    fixture.componentRef.setInput('editingTask', sampleTask);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Editar Tarea');
    expect(fixture.componentInstance.draftTitle()).toBe('Refinar Dialogs Locales');
    expect(fixture.componentInstance.draftDate()).toBe('Mañana');
    expect(fixture.componentInstance.draftDuration()).toBe(45);

    const deleteBtn = el.querySelector('[dialog-actions-start] button') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();
    fixture.detectChanges();

    expect(deleted).toEqual([42]);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
