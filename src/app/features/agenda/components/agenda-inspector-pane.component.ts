import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import {
  TASK_DUE_BUCKETS,
  TASK_DURATIONS,
  TASK_PRIORITIES,
  TaskDueBucket,
  TaskItem,
  TaskPriority
} from '../../../core/tasks/task.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { M3TabItem, M3TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import {
  getPriorityMeta,
  getSubtaskCompletionSummary,
  getTaskCategoryVisual,
  preventEnterDuringComposition
} from './agenda-ui.utils';

export type AgendaInspectorTab = 'steps' | 'plan';

@Component({
  selector: 'app-agenda-inspector-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3LinearProgressComponent,
    M3TabsComponent,
    M3TextFieldComponent
  ],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <section aria-labelledby="agenda-inspector-heading">
      <m3-card
        variant="filled"
        [interactive]="false"
        shape="xl"
        padding="lg"
        customClass="!bg-surface-low rounded-m3-xl-inc space-y-4">
        @if (task(); as current) {
          @let catMeta = categoryVisual(current.category);
          @let prioMeta = priorityMeta(current);
          @let subSummary = subtaskSummary(current);

          <!-- CABECERA DEL DETALLE -->
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="px-2.5 py-1 rounded-full bg-sec-box text-on-sec-box text-label-sm-emphasized inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ catMeta.icon }}</span>
                <span>{{ current.category }}</span>
              </span>

              <span
                [class]="prioMeta.badgeClass"
                class="px-2.5 py-1 rounded-full text-label-sm-emphasized inline-flex items-center gap-1">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ prioMeta.icon }}</span>
                <span>{{ prioMeta.label }}</span>
              </span>
            </div>

            <h2
              id="agenda-inspector-heading"
              [class.line-through]="current.completed"
              [class.opacity-70]="current.completed"
              class="text-title-md-emphasized text-main">
              {{ current.title }}
            </h2>

            <div class="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
              <span class="text-body-sm text-muted tabular-nums inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">schedule</span>
                <span>{{ current.dateLabel }} · {{ current.durationMinutes }}m</span>
              </span>

              <div class="flex items-center gap-2">
                <m3-button
                  variant="tonal"
                  size="xs"
                  [icon]="current.completed ? 'replay' : 'check_circle'"
                  (action)="toggleCompleted.emit(current.id)">
                  {{ current.completed ? 'Reabrir' : 'Completar' }}
                </m3-button>

                <m3-button
                  variant="outlined"
                  size="xs"
                  icon="open_in_new"
                  [invisible]="hideEditButton()"
                  [viewTransitionName]="editViewTransitionName()"
                  (action)="openModalEdit.emit(current)">
                  Modal
                </m3-button>
              </div>
            </div>
          </div>

          <!-- TABS SECUNDARIOS DE INSPECTOR (<m3-tabs variant="secondary">) -->
          <m3-tabs
            variant="secondary"
            ariaLabel="Secciones del inspector"
            idPrefix="agenda-inspector-tab"
            [tabs]="inspectorTabs()"
            [(value)]="inspectorTab" />

          <div>
            <!-- PANEL 1: SUBTAREAS Y CHECKLIST -->
            <div
              id="agenda-inspector-steps-panel"
              role="tabpanel"
              aria-labelledby="agenda-inspector-tab-steps"
              [attr.hidden]="inspectorTab() !== 'steps' ? '' : null"
              [class]="inspectorTab() === 'steps' ? 'space-y-3.5' : 'hidden'">
              <div class="flex items-center justify-between gap-2 px-0.5">
                <h3 class="text-label-md-emphasized uppercase tracking-wider text-muted">
                  Lista de pasos ({{ subSummary.done }}/{{ subSummary.total }})
                </h3>
                @if (subSummary.total > 0) {
                  <span class="text-label-md-emphasized tabular-nums text-primary">{{ subSummary.percent }}%</span>
                }
              </div>

              @if (subSummary.total > 0) {
                <m3-linear-progress
                  [wavy]="false"
                  size="sm"
                  [value]="subSummary.percent"
                  color="secondary"
                  ariaLabel="Avance de subtareas de la actividad seleccionada" />
              }

              @if (current.subtasks.length > 0) {
                <ul role="list" class="list-none m-0 p-0 space-y-2">
                  @for (st of current.subtasks; track st.id) {
                    <li class="flex items-center justify-between gap-2 bg-surface rounded-m3-md px-2.5 py-1">
                      <div class="flex items-center gap-1 flex-1 min-w-0">
                        <m3-checkbox
                          [checked]="st.done"
                          [ariaLabel]="'Paso ' + st.title"
                          (checkedChange)="toggleSubtask.emit({ taskId: current.id, subtaskId: st.id })" />
                        <span
                          [class.line-through]="st.done"
                          [class.opacity-60]="st.done"
                          class="text-body-md text-main truncate">
                          {{ st.title }}
                        </span>
                      </div>
                      <m3-button
                        [iconOnly]="true"
                        variant="text"
                        size="xs"
                        icon="close"
                        [ariaLabel]="'Quitar paso ' + st.title"
                        (action)="removeSubtask.emit({ taskId: current.id, subtaskId: st.id })" />
                    </li>
                  }
                </ul>
              } @else {
                <p class="text-body-sm text-muted bg-surface rounded-m3-md px-4 py-3">
                  Todavía no hay subtareas. Divide esta actividad en pasos accionables abajo.
                </p>
              }

              <form (submit)="onAddSubtaskSubmit($event, current.id)" class="flex items-start gap-2.5 pt-1">
                <div class="flex-1 min-w-0">
                  <m3-text-field
                    [id]="'inspector-new-subtask'"
                    variant="filled"
                    label="Nuevo paso"
                    placeholder="Añadir paso accionable..."
                    icon="playlist_add"
                    enterkeyhint="done"
                    [clearable]="true"
                    [value]="newSubtaskTitle()"
                    (valueChange)="newSubtaskTitle.set($event)"
                    (keydown.enter)="onSubtaskKeyEnter($event)" />
                </div>
                <m3-button
                  type="submit"
                  variant="tonal"
                  size="md"
                  icon="add"
                  customClass="mt-1.5 shrink-0"
                  [disabled]="!newSubtaskTitle().trim()">
                  Paso
                </m3-button>
              </form>
            </div>

            <!-- PANEL 2: PLANIFICACIÓN RÁPIDA Y NOTAS DE TRABAJO -->
            <div
              id="agenda-inspector-plan-panel"
              role="tabpanel"
              aria-labelledby="agenda-inspector-tab-plan"
              [attr.hidden]="inspectorTab() !== 'plan' ? '' : null"
              [class]="inspectorTab() === 'plan' ? 'space-y-4' : 'hidden'">
              <section class="space-y-3">
                <h3 class="text-label-md-emphasized uppercase tracking-wider text-muted">Planificación rápida</h3>

                <div class="space-y-3">
                  <div class="space-y-1.5">
                    <span class="block text-label-md text-muted">Bloque</span>
                    <m3-button-group
                      variant="connected"
                      size="xs"
                      ariaLabel="Mover actividad de día"
                      [options]="bucketOptions"
                      [value]="[current.dueBucket]"
                      (selectionChange)="onBucketSelect(current.id, $event)" />
                  </div>

                  <div class="space-y-1.5">
                    <span class="block text-label-md text-muted">Prioridad</span>
                    <m3-button-group
                      variant="connected"
                      size="xs"
                      ariaLabel="Cambiar prioridad"
                      [options]="priorityOptions"
                      [value]="[current.priority]"
                      (selectionChange)="onPrioritySelect(current.id, $event)" />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
                    <m3-text-field
                      [id]="'inspector-time-slot'"
                      variant="filled"
                      type="time"
                      label="Horario asignado"
                      placeholder="HH:mm"
                      icon="schedule"
                      [value]="current.timeSlot"
                      (valueChange)="onTimeValueChange(current.id, $event)" />

                    <div class="space-y-1.5">
                      <span class="block text-label-md text-muted">Estimación</span>
                      <m3-button-group
                        variant="connected"
                        size="xs"
                        ariaLabel="Cambiar duración estimada"
                        [options]="durationOptions"
                        [value]="[current.durationMinutes.toString()]"
                        (selectionChange)="onDurationSelect(current.id, $event)" />
                    </div>
                  </div>
                </div>
              </section>

              <section class="space-y-2">
                <m3-text-field
                  [id]="'inspector-task-notes'"
                  variant="filled"
                  label="Notas técnicas y criterios"
                  placeholder="Anota decisiones, endpoints o referencias..."
                  icon="description"
                  [multiline]="true"
                  [autoGrow]="true"
                  [rows]="3"
                  [maxlength]="300"
                  [value]="editableNotes()"
                  (valueChange)="onNotesEdited(current.id, $event)" />
              </section>
            </div>
          </div>
        } @else {
          <div class="py-10 px-4 text-center space-y-2.5">
            <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">touch_app</span>
            <h2 id="agenda-inspector-heading" class="text-title-md-emphasized text-main">
              Selecciona una actividad
            </h2>
            <p class="text-body-sm text-muted">
              Toca cualquier bloque de la lista para gestionar subtareas o ajustar su horario.
            </p>
          </div>
        }
      </m3-card>
    </section>
  `
})
export class AgendaInspectorPaneComponent {
  readonly task = input.required<TaskItem | null>();
  readonly editViewTransitionName = input<string | null>(null);
  readonly hideEditButton = input<boolean>(false);

  readonly toggleCompleted = output<number>();
  readonly openModalEdit = output<TaskItem>();
  readonly patchTask = output<{
    id: number;
    patch: Partial<Pick<TaskItem, 'dueBucket' | 'timeSlot' | 'durationMinutes' | 'priority' | 'notes'>>;
  }>();
  readonly toggleSubtask = output<{ taskId: number; subtaskId: string }>();
  readonly addSubtask = output<{ taskId: number; title: string }>();
  readonly removeSubtask = output<{ taskId: number; subtaskId: string }>();
  readonly announceStatus = output<string>();

  readonly bucketOptions: M3ButtonGroupOption[] = TASK_DUE_BUCKETS.map(b => ({ id: b, label: b }));
  readonly priorityOptions: M3ButtonGroupOption[] = TASK_PRIORITIES.map(p => ({
    id: p,
    label: p,
    icon: p === 'Alta' ? 'priority_high' : p === 'Media' ? 'flag' : 'low_priority'
  }));
  readonly durationOptions: M3ButtonGroupOption[] = TASK_DURATIONS.map(d => ({
    id: d.toString(),
    label: `${d}m`
  }));

  readonly inspectorTab = signal<AgendaInspectorTab>('steps');
  readonly newSubtaskTitle = signal<string>('');
  readonly editableNotes = signal<string>('');
  private lastBoundTaskId: number | null = null;

  readonly inspectorTabs = computed<M3TabItem[]>(() => {
    const current = this.task();
    const subSummary = current ? this.subtaskSummary(current) : null;
    return [
      {
        id: 'steps',
        label: 'Pasos & Checklist',
        icon: 'checklist',
        badge: subSummary && subSummary.total > 0 ? `${subSummary.done}/${subSummary.total}` : undefined,
        panelId: 'agenda-inspector-steps-panel'
      },
      {
        id: 'plan',
        label: 'Planificar & Notas',
        icon: 'tune',
        badge: current?.timeSlot ? current.timeSlot : undefined,
        panelId: 'agenda-inspector-plan-panel'
      }
    ];
  });

  constructor() {
    effect(() => {
      const current = this.task();
      if (!current) {
        this.lastBoundTaskId = null;
        this.editableNotes.set('');
        return;
      }

      if (this.lastBoundTaskId !== current.id) {
        this.lastBoundTaskId = current.id;
        this.editableNotes.set(current.notes);
      } else if (current.notes !== this.editableNotes() && document.activeElement?.tagName !== 'TEXTAREA') {
        this.editableNotes.set(current.notes);
      }
    });
  }

  categoryVisual(category: string) {
    return getTaskCategoryVisual(category);
  }

  priorityMeta(task: TaskItem) {
    return getPriorityMeta(task.priority, task.completed);
  }

  subtaskSummary(task: TaskItem) {
    return getSubtaskCompletionSummary(task);
  }

  onBucketSelect(id: number, selected: string[]): void {
    const dueBucket = selected[0] as TaskDueBucket | undefined;
    if (!dueBucket) return;
    this.patchTask.emit({ id, patch: { dueBucket } });
    this.announceStatus.emit(`Actividad movida a ${dueBucket}.`);
  }

  onPrioritySelect(id: number, selected: string[]): void {
    const priority = selected[0] as TaskPriority | undefined;
    if (!priority) return;
    this.patchTask.emit({ id, patch: { priority } });
    this.announceStatus.emit(`Prioridad cambiada a ${priority}.`);
  }

  onDurationSelect(id: number, selected: string[]): void {
    const durationMinutes = Number(selected[0]);
    if (Number.isNaN(durationMinutes) || durationMinutes <= 0) return;
    this.patchTask.emit({ id, patch: { durationMinutes } });
  }

  onTimeValueChange(id: number, timeSlot: string): void {
    this.patchTask.emit({ id, patch: { timeSlot } });
  }

  onNotesEdited(id: number, notes: string): void {
    this.editableNotes.set(notes);
    this.patchTask.emit({ id, patch: { notes } });
  }

  onSubtaskKeyEnter(event: Event): void {
    preventEnterDuringComposition(event);
  }

  onAddSubtaskSubmit(event: Event, taskId: number): void {
    event.preventDefault();
    const title = this.newSubtaskTitle().trim();
    if (!title) return;
    this.addSubtask.emit({ taskId, title });
    this.newSubtaskTitle.set('');
    this.announceStatus.emit(`Subtarea "${title}" añadida.`);
  }
}
