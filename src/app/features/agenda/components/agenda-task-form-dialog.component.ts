import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TASK_CATEGORIES,
  TASK_DUE_BUCKETS,
  TASK_DURATIONS,
  TASK_PRIORITIES,
  TaskDraft,
  TaskDueBucket,
  TaskItem,
  TaskPriority
} from '../../../core/tasks/task.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-agenda-task-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3DialogComponent,
    M3TextFieldComponent
  ],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      #taskDlg
      variant="expressive"
      size="lg"
      tone="primary"
      [icon]="editingTask() ? 'edit_calendar' : 'event'"
      [headline]="editingTask() ? 'Editar Tarea' : 'Nueva Tarea'"
      [subtitle]="editingTask()
        ? 'Ajusta horizonte temporal, prioridad y notas de seguimiento.'
        : 'Define objetivo, bloque temporal y prioridad de ejecución.'"
      [viewTransitionName]="viewTransitionName()"
      [managedClose]="managedClose()"
      [(open)]="open"
      (closeRequested)="closeRequested.emit($event)"
      (closed)="onDialogClosed()">
      <form (ngSubmit)="submitForm()" novalidate class="flex flex-col gap-5">
        <m3-text-field
          #taskTitleField
          [id]="'agenda-modal-title'"
          variant="filled"
          label="Título de la tarea"
          placeholder="Ej. Revisión arquitectónica de DenRaf"
          icon="edit_note"
          [required]="true"
          [clearable]="true"
          [maxlength]="80"
          enterkeyhint="done"
          [errorText]="titleValidationError()"
          [value]="draftTitle()"
          (valueChange)="onTitleChange($event)"
          (inputBlur)="validateTitleOnBlur()"
          supportingText="Define el objetivo con claridad" />

        <div role="group" aria-labelledby="agenda-form-category-label" class="flex flex-col gap-2.5">
          <span id="agenda-form-category-label" class="block text-label-md-emphasized text-muted uppercase tracking-wider">
            Categoría
          </span>
          <m3-button-group
            variant="standard"
            size="sm"
            ariaLabel="Categoría de tarea"
            [options]="categoryOptions"
            [value]="[draftCategory()]"
            (selectionChange)="onCategorySelect($event)" />
        </div>

        <!-- CONTENEDOR TONAL PARA PROGRAMACIÓN Y PRIORIDAD -->
        <div class="bg-surface-low rounded-m3-lg p-4 sm:p-5 flex flex-col gap-4">
          <div role="group" aria-labelledby="agenda-form-bucket-label" class="flex flex-col gap-2">
            <span id="agenda-form-bucket-label" class="block text-label-md-emphasized text-muted uppercase tracking-wider">
              Bloque / Día
            </span>
            <div class="overflow-x-auto scrollbar-none py-2.5 -my-2.5 max-w-full">
              <m3-button-group
                variant="connected"
                size="sm"
                ariaLabel="Día programado"
                [options]="dueBucketOptions"
                [value]="[draftDate()]"
                (selectionChange)="onDateSelect($event)" />
            </div>
          </div>

          <div role="group" aria-labelledby="agenda-form-priority-label" class="flex flex-col gap-2">
            <span id="agenda-form-priority-label" class="block text-label-md-emphasized text-muted uppercase tracking-wider">
              Prioridad
            </span>
            <div class="overflow-x-auto scrollbar-none py-2.5 -my-2.5 max-w-full">
              <m3-button-group
                variant="connected"
                size="sm"
                ariaLabel="Prioridad de tarea"
                [options]="priorityOptions"
                [value]="[draftPriority()]"
                (selectionChange)="onPrioritySelect($event)" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pt-1">
            <div class="sm:col-span-5">
              <m3-text-field
                [id]="'agenda-modal-time'"
                variant="filled"
                type="time"
                label="Hora sugerida"
                placeholder="HH:mm"
                icon="schedule"
                [value]="draftTimeSlot()"
                (valueChange)="draftTimeSlot.set($event)" />
            </div>

            <div role="group" aria-labelledby="agenda-form-duration-label" class="sm:col-span-7 flex flex-col gap-2">
              <span id="agenda-form-duration-label" class="block text-label-md-emphasized text-muted uppercase tracking-wider">
                Bloque de enfoque
              </span>
              <div class="overflow-x-auto scrollbar-none py-2.5 -my-2.5 max-w-full">
                <m3-button-group
                  variant="connected"
                  size="sm"
                  ariaLabel="Duración en minutos"
                  [options]="durationOptions"
                  [value]="[draftDuration().toString()]"
                  (selectionChange)="onDurationSelect($event)" />
              </div>
            </div>
          </div>
        </div>

        <m3-text-field
          [id]="'agenda-modal-notes'"
          variant="filled"
          label="Notas de apoyo"
          placeholder="Detalles sobre entidades, puertos y adaptadores..."
          icon="description"
          [multiline]="true"
          [autoGrow]="true"
          [rows]="3"
          [maxlength]="300"
          [value]="draftNotes()"
          (valueChange)="draftNotes.set($event)"
          supportingText="Especificaciones y contexto técnico" />
      </form>

      @if (editingTask(); as task) {
        <m3-button
          dialog-actions-start
          type="button"
          variant="tonal"
          size="sm"
          icon="delete"
          (action)="onDelete(task.id)">
          Eliminar
        </m3-button>
      }

      <div dialog-actions class="flex items-center gap-3">
        <m3-button type="button" variant="text" (action)="taskDlg.dismiss('cancel')">
          Cancelar
        </m3-button>
        <m3-button type="button" variant="filled" icon="check" (action)="submitForm()">
          Guardar
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class AgendaTaskFormDialogComponent {
  readonly open = model<boolean>(false);
  readonly editingTask = input<TaskItem | null>(null);
  readonly viewTransitionName = input<string | null>(null);
  readonly managedClose = input<boolean>(false);

  readonly saveTask = output<TaskDraft>();
  readonly deleteTask = output<number>();
  readonly closeRequested = output<string>();

  private readonly taskTitleField = viewChild<M3TextFieldComponent>('taskTitleField');

  readonly categoryOptions: M3ButtonGroupOption[] = TASK_CATEGORIES.map(c => ({
    id: c.name,
    label: c.name,
    icon: c.icon
  }));

  readonly dueBucketOptions: M3ButtonGroupOption[] = TASK_DUE_BUCKETS.map(b => ({
    id: b,
    label: b
  }));

  readonly priorityOptions: M3ButtonGroupOption[] = TASK_PRIORITIES.map(p => ({
    id: p,
    label: p,
    icon: p === 'Alta' ? 'priority_high' : p === 'Media' ? 'flag' : 'low_priority'
  }));

  readonly durationOptions: M3ButtonGroupOption[] = TASK_DURATIONS.map(d => ({
    id: d.toString(),
    label: `${d}m`
  }));

  readonly draftTitle = signal<string>('');
  readonly draftCategory = signal<string>('Frontend Angular');
  readonly draftDate = signal<TaskDueBucket>('Hoy');
  readonly draftTimeSlot = signal<string>('10:00');
  readonly draftDuration = signal<number>(25);
  readonly draftPriority = signal<TaskPriority>('Alta');
  readonly draftNotes = signal<string>('');
  readonly titleValidationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const task = this.editingTask();
      this.titleValidationError.set(null);
      if (task) {
        this.draftTitle.set(task.title);
        this.draftCategory.set(task.category);
        this.draftDate.set(task.dueBucket);
        this.draftTimeSlot.set(task.timeSlot);
        this.draftDuration.set(task.durationMinutes);
        this.draftPriority.set(task.priority);
        this.draftNotes.set(task.notes);
      } else {
        this.draftTitle.set('');
        this.draftCategory.set('Frontend Angular');
        this.draftDate.set('Hoy');
        this.draftTimeSlot.set('10:00');
        this.draftDuration.set(25);
        this.draftPriority.set('Alta');
        this.draftNotes.set('');
      }
    });
  }

  onDialogClosed(): void {
    this.titleValidationError.set(null);
  }

  onCategorySelect(selected: string[]): void {
    if (selected[0]) this.draftCategory.set(selected[0]);
  }

  onDateSelect(selected: string[]): void {
    const bucket = selected[0] as TaskDueBucket | undefined;
    if (bucket) this.draftDate.set(bucket);
  }

  onPrioritySelect(selected: string[]): void {
    const prio = selected[0] as TaskPriority | undefined;
    if (prio) this.draftPriority.set(prio);
  }

  onDurationSelect(selected: string[]): void {
    const mins = Number(selected[0]);
    if (!Number.isNaN(mins) && mins > 0) this.draftDuration.set(mins);
  }

  onTitleChange(val: string): void {
    this.draftTitle.set(val);
    if (this.titleValidationError() && val.trim()) {
      this.titleValidationError.set(null);
    }
  }

  validateTitleOnBlur(): void {
    if (!this.draftTitle().trim()) {
      this.titleValidationError.set('Ingresa un título para identificar la actividad.');
    }
  }

  onDelete(id: number): void {
    this.deleteTask.emit(id);
    if (!this.managedClose()) {
      this.open.set(false);
    }
  }

  submitForm(): void {
    const title = this.draftTitle().trim();
    if (!title) {
      this.titleValidationError.set('El título es obligatorio para guardar la tarea.');
      this.taskTitleField()?.focus();
      return;
    }

    this.titleValidationError.set(null);
    const dueBucket = this.draftDate();
    this.saveTask.emit({
      title,
      category: this.draftCategory(),
      dateLabel: dueBucket,
      dueBucket,
      timeSlot: this.draftTimeSlot(),
      durationMinutes: this.draftDuration(),
      priority: this.draftPriority(),
      notes: this.draftNotes()
    });
    if (!this.managedClose()) {
      this.open.set(false);
    }
  }
}
