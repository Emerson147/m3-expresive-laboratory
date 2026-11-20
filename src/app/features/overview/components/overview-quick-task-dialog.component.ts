import { ChangeDetectionStrategy, Component, effect, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TASK_CATEGORIES,
  TASK_DUE_BUCKETS,
  TASK_PRIORITIES,
  TaskDueBucket,
  TaskPriority
} from '../../../core/tasks/task.service';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { OverviewQuickTaskDraft } from '../overview.models';

@Component({
  selector: 'app-overview-quick-task-dialog',
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
      #quickTaskDlg
      variant="expressive"
      size="md"
      tone="primary"
      icon="add_task"
      headline="Nueva tarea rápida"
      subtitle="Registra un pendiente sin salir del panel ejecutivo."
      [viewTransitionName]="viewTransitionName()"
      [managedClose]="managedClose()"
      [(open)]="open"
      (closeRequested)="closeRequested.emit($event)"
      (closed)="quickTaskError.set(null)">
      <form (ngSubmit)="submitQuickTask()" novalidate class="space-y-4">
        <m3-text-field
          #quickTitleField
          [id]="'overview-quick-title'"
          variant="filled"
          label="Título de la tarea"
          placeholder="Ej. Validar cierre de turno POS"
          icon="edit_note"
          [required]="true"
          [clearable]="true"
          [maxlength]="80"
          enterkeyhint="done"
          [errorText]="quickTaskError()"
          [value]="quickTitle()"
          (valueChange)="onQuickTitleChange($event)" />

        <fieldset class="space-y-1.5 border-0 p-0 m-0">
          <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
            Área
          </legend>
          <m3-button-group
            variant="standard"
            size="xs"
            ariaLabel="Área de la tarea"
            [options]="categoryOptions"
            [value]="[quickCategory()]"
            (selectionChange)="quickCategory.set($event[0] || quickCategory())" />
        </fieldset>

        <div class="bg-surface-low rounded-m3-lg p-4 space-y-3.5">
          <fieldset class="space-y-1.5 border-0 p-0 m-0">
            <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
              Bloque / Día
            </legend>
            <m3-button-group
              variant="connected"
              size="xs"
              ariaLabel="Horizonte de tarea"
              [options]="dueBucketOptions"
              [value]="[quickBucket()]"
              (selectionChange)="onBucketSelect($event)" />
          </fieldset>

          <fieldset class="space-y-1.5 border-0 p-0 m-0">
            <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
              Prioridad
            </legend>
            <m3-button-group
              variant="connected"
              size="xs"
              ariaLabel="Prioridad de tarea"
              [options]="priorityOptions"
              [value]="[quickPriority()]"
              (selectionChange)="onPrioritySelect($event)" />
          </fieldset>
        </div>
      </form>

      <div dialog-actions class="flex items-center gap-3">
        <m3-button
          type="button"
          variant="text"
          (action)="onCancel(quickTaskDlg)">
          Cancelar
        </m3-button>
        <m3-button
          type="button"
          variant="filled"
          icon="check"
          (action)="submitQuickTask()">
          Crear tarea
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class OverviewQuickTaskDialogComponent {
  readonly open = model<boolean>(false);
  readonly viewTransitionName = input<string | null>(null);
  readonly managedClose = input<boolean>(false);

  readonly closeRequested = output<string>();
  readonly saveTask = output<OverviewQuickTaskDraft>();

  private readonly quickTitleField = viewChild<M3TextFieldComponent>('quickTitleField');

  readonly quickTitle = signal<string>('');
  readonly quickCategory = signal<string>('Frontend Angular');
  readonly quickBucket = signal<TaskDueBucket>('Hoy');
  readonly quickPriority = signal<TaskPriority>('Alta');
  readonly quickTaskError = signal<string | null>(null);

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

  constructor() {
    effect(() => {
      if (this.open()) {
        this.quickTitle.set('');
        this.quickCategory.set('Frontend Angular');
        this.quickBucket.set('Hoy');
        this.quickPriority.set('Alta');
        this.quickTaskError.set(null);
      }
    });
  }

  onQuickTitleChange(value: string): void {
    this.quickTitle.set(value);
    if (this.quickTaskError() && value.trim()) {
      this.quickTaskError.set(null);
    }
  }

  onBucketSelect(selected: string[]): void {
    const bucket = selected[0] as TaskDueBucket | undefined;
    if (bucket) this.quickBucket.set(bucket);
  }

  onPrioritySelect(selected: string[]): void {
    const prio = selected[0] as TaskPriority | undefined;
    if (prio) this.quickPriority.set(prio);
  }

  onCancel(dialog: M3DialogComponent): void {
    if (this.managedClose()) {
      this.closeRequested.emit('cancel');
      return;
    }
    dialog.dismiss('cancel');
  }

  submitQuickTask(): void {
    const title = this.quickTitle().trim();
    if (!title) {
      this.quickTaskError.set('Ingresa un título para registrar la tarea.');
      this.quickTitleField()?.focus();
      return;
    }

    this.saveTask.emit({
      title,
      category: this.quickCategory(),
      dueBucket: this.quickBucket(),
      priority: this.quickPriority()
    });
  }
}
