import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
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
import { M3CircularProgressComponent } from '../../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { M3TabItem, M3TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { AgendaFocusService, FOCUS_PRESETS } from '../agenda-focus.service';
import {
  getPriorityMeta,
  getSubtaskCompletionSummary,
  getTaskCategoryVisual,
  preventEnterDuringComposition
} from './agenda-ui.utils';

export type AgendaInspectorTab = 'focus' | 'plan';

@Component({
  selector: 'app-agenda-inspector-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3CircularProgressComponent,
    M3LinearProgressComponent,
    M3TabsComponent,
    M3TextFieldComponent
  ],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <aside aria-labelledby="agenda-inspector-heading">
      <m3-card
        variant="filled"
        [interactive]="false"
        shape="xl"
        padding="lg"
        customClass="!bg-surface-low rounded-m3-xl-inc space-y-5">
        @if (task(); as current) {
          @let catMeta = categoryVisual(current.category);
          @let prioMeta = priorityMeta(current);
          @let subSummary = subtaskSummary(current);
          @let isTimerBoundHere = focusService.activeTaskId() === current.id;
          @let isRunningHere = isTimerBoundHere && focusService.status() === 'running';

          <!-- CABECERA DEL SUPPORTING PANE -->
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2.5">
              <span class="px-3 py-1 rounded-full bg-sec-box text-on-sec-box text-label-md-emphasized inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ catMeta.icon }}</span>
                <span>{{ current.category }}</span>
              </span>

              <span
                [class]="prioMeta.badgeClass"
                class="px-3 py-1 rounded-full text-label-md-emphasized inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ prioMeta.icon }}</span>
                <span>{{ prioMeta.label }}</span>
              </span>
            </div>

            <h2
              id="agenda-inspector-heading"
              [class.line-through]="current.completed"
              [class.opacity-70]="current.completed"
              class="text-title-lg-emphasized text-main">
              {{ current.title }}
            </h2>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span class="text-body-sm text-muted tabular-nums inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">schedule</span>
                <span>{{ current.dateLabel }} · {{ current.durationMinutes }}m</span>
              </span>

              <div class="flex items-center gap-2.5">
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
                  [invisible]="isDialogOpen() && activeOriginKey() === ('inspector-modal-' + current.id)"
                  [viewTransitionName]="isDialogTransitioning() && !isDialogOpen() && activeOriginKey() === ('inspector-modal-' + current.id) ? 'dialog-transform' : null"
                  (action)="openModalEdit.emit(current)">
                  Modal
                </m3-button>
              </div>
            </div>
          </div>

          <!-- TABS SECUNDARIOS DENTRO DEL SUPPORTING PANE (<m3-tabs variant="secondary">) -->
          <m3-tabs
            variant="secondary"
            ariaLabel="Secciones del inspector"
            idPrefix="agenda-inspector-tab"
            [tabs]="inspectorTabs()"
            [(value)]="inspectorTab" />

          <div>
            <!-- PANEL 1: SESIÓN DE ENFOQUE Y LISTA DE PASOS -->
            <div
              id="agenda-inspector-focus-panel"
              role="tabpanel"
              aria-labelledby="agenda-inspector-tab-focus"
              [attr.hidden]="inspectorTab() !== 'focus' ? '' : null"
              [class]="inspectorTab() === 'focus' ? 'space-y-5' : 'hidden'">
            <section class="bg-surface rounded-m3-lg p-5 space-y-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">timer</span>
                  <h3 class="text-title-sm-emphasized text-main">Sesión de Enfoque</h3>
                </div>
                <span class="px-3 py-1 rounded-full bg-surface-high text-label-sm tabular-nums text-muted">
                  {{ current.focusSessionsCompleted }} bloques hoy
                </span>
              </div>

              @if (focusService.status() === 'running' && !isTimerBoundHere) {
                <div class="px-3.5 py-2.5 rounded-m3-md bg-tertiary-box text-on-tertiary-box text-body-sm flex items-center justify-between gap-3">
                  <span>Hay otro temporizador corriendo ({{ focusService.formattedTime() }}).</span>
                  <m3-button variant="tonal" size="xs" (action)="startFocus(current)">
                    Enfocar esta
                  </m3-button>
                </div>
              }

              <div class="flex flex-col sm:flex-row items-center gap-5">
                <div class="relative grid place-items-center shrink-0">
                  <m3-circular-progress
                    [diameter]="116"
                    [wavy]="isRunningHere"
                    [paused]="!isRunningHere"
                    [value]="focusProgress()"
                    color="primary"
                    ariaLabel="Progreso de sesión de enfoque" />

                  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span class="text-headline-md-emphasized tabular-nums text-main">
                      {{ displayedTimerText() }}
                    </span>
                    <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                      {{ timerStatusLabel() }}
                    </span>
                  </div>
                </div>

                <div class="flex-1 min-w-0 w-full space-y-3.5">
                  <m3-button-group
                    variant="connected"
                    size="xs"
                    ariaLabel="Duración de sesión de enfoque"
                    [options]="focusPresetOptions"
                    [value]="[focusService.presetMinutes().toString()]"
                    (selectionChange)="onPresetSelect($event, current.id)" />

                  <div class="flex flex-wrap items-center gap-2.5">
                    @if (isRunningHere) {
                      <m3-button variant="tonal" size="sm" icon="pause" (action)="focusService.pause()">
                        Pausar
                      </m3-button>
                    } @else {
                      <m3-button variant="tonal" size="sm" icon="play_arrow" (action)="startFocus(current)">
                        {{ isTimerBoundHere && focusService.status() === 'paused' ? 'Reanudar' : 'Iniciar' }}
                      </m3-button>
                    }

                    <m3-button
                      variant="outlined"
                      size="sm"
                      icon="verified"
                      (action)="completeFocusBlock(current.id)">
                      Registrar
                    </m3-button>

                    <m3-button
                      variant="text"
                      size="sm"
                      icon="restart_alt"
                      (action)="focusService.reset(current.durationMinutes)">
                      Reiniciar
                    </m3-button>
                  </div>
                </div>
              </div>
            </section>

            <!-- SUBTAREAS Y CHECKLIST -->
            <section class="space-y-3.5">
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
                <ul role="list" class="list-none m-0 p-0 space-y-2.5">
                  @for (st of current.subtasks; track st.id) {
                    <li class="flex items-center justify-between gap-2.5 bg-surface rounded-m3-md px-2.5 py-1">
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
            </section>
          </div>

          <!-- PANEL 2: PLANIFICACIÓN RÁPIDA Y NOTAS DE TRABAJO -->
          <div
            id="agenda-inspector-plan-panel"
            role="tabpanel"
            aria-labelledby="agenda-inspector-tab-plan"
            [attr.hidden]="inspectorTab() !== 'plan' ? '' : null"
            [class]="inspectorTab() === 'plan' ? 'space-y-5' : 'hidden'">
            <section class="space-y-3.5">
              <h3 class="text-label-md-emphasized uppercase tracking-wider text-muted">Planificación rápida</h3>

              <div class="space-y-3.5">
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

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end pt-1">
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

            <section class="space-y-2.5">
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
          <div class="py-12 px-4 text-center space-y-2.5">
            <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">touch_app</span>
            <h2 id="agenda-inspector-heading" class="text-title-md-emphasized text-main">
              Selecciona una actividad
            </h2>
            <p class="text-body-sm text-muted">
              Toca cualquier bloque de la lista para ver subtareas, editar detalles o iniciar una sesión de enfoque.
            </p>
          </div>
        }
      </m3-card>
    </aside>
  `
})
export class AgendaInspectorPaneComponent {
  readonly focusService = inject(AgendaFocusService);

  readonly task = input.required<TaskItem | null>();
  readonly isDialogOpen = input<boolean>(false);
  readonly isDialogTransitioning = input<boolean>(false);
  readonly activeOriginKey = input<string | null>(null);

  readonly toggleCompleted = output<number>();
  readonly openModalEdit = output<TaskItem>();
  readonly patchTask = output<{
    id: number;
    patch: Partial<Pick<TaskItem, 'dueBucket' | 'timeSlot' | 'durationMinutes' | 'priority' | 'notes'>>;
  }>();
  readonly toggleSubtask = output<{ taskId: number; subtaskId: string }>();
  readonly addSubtask = output<{ taskId: number; title: string }>();
  readonly removeSubtask = output<{ taskId: number; subtaskId: string }>();
  readonly focusRecorded = output<string>();
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
  readonly focusPresetOptions: M3ButtonGroupOption[] = FOCUS_PRESETS.map(p => ({
    id: p.toString(),
    label: `${p}m`
  }));

  readonly inspectorTab = signal<AgendaInspectorTab>('focus');
  readonly newSubtaskTitle = signal<string>('');
  readonly editableNotes = signal<string>('');
  private lastBoundTaskId: number | null = null;

  readonly inspectorTabs = computed<M3TabItem[]>(() => {
    const current = this.task();
    const subSummary = current ? this.subtaskSummary(current) : null;
    return [
      {
        id: 'focus',
        label: 'Enfoque & Pasos',
        icon: 'timer',
        badge: subSummary && subSummary.total > 0 ? `${subSummary.done}/${subSummary.total}` : undefined,
        panelId: 'agenda-inspector-focus-panel'
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

  readonly focusProgress = computed(() => {
    const current = this.task();
    if (!current || this.focusService.activeTaskId() !== current.id) {
      return 0;
    }
    return this.focusService.progressPercent();
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
        this.focusService.syncIdleWithTask(current.id, current.durationMinutes);
      } else if (current.notes !== this.editableNotes() && document.activeElement?.tagName !== 'TEXTAREA') {
        this.editableNotes.set(current.notes);
      }
    });
  }

  displayedTimerText(): string {
    const current = this.task();
    if (!current) return '25:00';
    if (this.focusService.activeTaskId() === current.id) {
      return this.focusService.formattedTime();
    }
    return `${current.durationMinutes.toString().padStart(2, '0')}:00`;
  }

  timerStatusLabel(): string {
    const current = this.task();
    if (!current || this.focusService.activeTaskId() !== current.id) {
      return 'Listo';
    }
    switch (this.focusService.status()) {
      case 'running':
        return 'En curso';
      case 'paused':
        return 'Pausa';
      case 'completed':
        return 'Logrado';
      default:
        return 'Listo';
    }
  }

  startFocus(task: TaskItem): void {
    if (this.focusService.activeTaskId() !== task.id) {
      this.focusService.setDurationPreset(task.durationMinutes, task.id);
    }
    this.focusService.startOrResume(task.id, task.title);
  }

  completeFocusBlock(taskId: number): void {
    if (this.focusService.activeTaskId() !== taskId) {
      this.focusService.activeTaskId.set(taskId);
    }
    this.focusService.completeSession();
    this.focusRecorded.emit('Bloque de enfoque registrado');
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

  onPresetSelect(selected: string[], taskId: number): void {
    const mins = Number(selected[0]);
    if (!Number.isNaN(mins)) {
      this.focusService.setDurationPreset(mins, taskId);
    }
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
    if (this.focusService.activeTaskId() === id && this.focusService.status() === 'idle') {
      this.focusService.setDurationPreset(durationMinutes, id);
    }
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
