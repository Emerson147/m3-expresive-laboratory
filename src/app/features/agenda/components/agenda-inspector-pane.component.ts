import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  TASK_DUE_BUCKETS,
  TASK_DURATIONS,
  TASK_PRIORITIES,
  TaskDueBucket,
  TaskItem,
  TaskPriority
} from '../../../core/tasks/task.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3CircularProgressComponent } from '../../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { AgendaFocusService, FOCUS_PRESETS } from '../agenda-focus.service';
import {
  getPriorityMeta,
  getSubtaskCompletionSummary,
  getTaskCategoryVisual,
  preventEnterDuringComposition
} from './agenda-ui.utils';

@Component({
  selector: 'app-agenda-inspector-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3CheckboxComponent,
    M3CircularProgressComponent,
    M3LinearProgressComponent,
    M3TextFieldComponent
  ],
  template: `
    <aside
      aria-labelledby="agenda-inspector-heading"
      class="bg-surface-low rounded-m3-xl p-5 space-y-5">
      @if (task(); as current) {
        @let catMeta = categoryVisual(current.category);
        @let prioMeta = priorityMeta(current);
        @let subSummary = subtaskSummary(current);
        @let isTimerBoundHere = focusService.activeTaskId() === current.id;
        @let isRunningHere = isTimerBoundHere && focusService.status() === 'running';

        <!-- CABECERA DEL INSPECTOR -->
        <div class="space-y-3 pb-4 border-b border-outline-sub">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="px-2.5 py-1 rounded-full bg-sec-box text-on-sec-box text-xs font-semibold inline-flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ catMeta.icon }}</span>
              <span>{{ current.category }}</span>
            </span>

            <span
              [class]="prioMeta.badgeClass"
              class="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
              <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ prioMeta.icon }}</span>
              <span>{{ prioMeta.label }}</span>
            </span>
          </div>

          <h2
            id="agenda-inspector-heading"
            [class.line-through]="current.completed"
            [class.opacity-70]="current.completed"
            class="text-lg sm:text-xl font-bold tracking-tight text-main leading-snug">
            {{ current.title }}
          </h2>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span class="text-xs font-mono text-muted inline-flex items-center gap-1.5">
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
                (action)="openModalEdit.emit(current)">
                Modal
              </m3-button>
            </div>
          </div>
        </div>

        <!-- MÓDULO POMODORO / DEEP WORK -->
        <section class="bg-surface rounded-m3-lg p-4 space-y-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">timer</span>
              <h3 class="text-sm font-bold text-main">Sesión de Enfoque</h3>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-high text-[11px] font-mono text-muted">
              {{ current.focusSessionsCompleted }} bloques hoy
            </span>
          </div>

          @if (focusService.status() === 'running' && !isTimerBoundHere) {
            <div class="px-3 py-2 rounded-m3-md bg-tertiary-box text-on-tertiary-box text-xs flex items-center justify-between gap-2">
              <span>Hay otro temporizador corriendo ({{ focusService.formattedTime() }}).</span>
              <m3-button variant="tonal" size="xs" (action)="startFocus(current)">
                Enfocar esta
              </m3-button>
            </div>
          }

          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div class="relative grid place-items-center shrink-0">
              <m3-circular-progress
                [diameter]="124"
                [wavy]="isRunningHere"
                [paused]="!isRunningHere"
                [value]="focusProgress()"
                color="primary"
                ariaLabel="Progreso de sesión de enfoque" />

              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-2xl font-extrabold font-mono tabular-nums text-main">
                  {{ displayedTimerText() }}
                </span>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {{ timerStatusLabel() }}
                </span>
              </div>
            </div>

            <div class="flex-1 min-w-0 w-full space-y-3">
              <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Duración del bloque">
                @for (preset of focusPresets; track preset) {
                  @let activePreset = focusService.presetMinutes() === preset;
                  <button
                    type="button"
                    [attr.aria-pressed]="activePreset"
                    (click)="focusService.setDurationPreset(preset, current.id)"
                    [class]="activePreset
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-high text-muted hover:text-main'"
                    class="agenda-pill-toggle focus-ring-m3 px-3 py-1 text-xs font-mono cursor-pointer">
                    {{ preset }}m
                  </button>
                }
              </div>

              <div class="flex flex-wrap items-center gap-2">
                @if (isRunningHere) {
                  <m3-button variant="filled" size="sm" icon="pause" (action)="focusService.pause()">
                    Pausar
                  </m3-button>
                } @else {
                  <m3-button variant="filled" size="sm" icon="play_arrow" (action)="startFocus(current)">
                    {{ isTimerBoundHere && focusService.status() === 'paused' ? 'Reanudar' : 'Iniciar' }}
                  </m3-button>
                }

                <m3-button
                  variant="tonal"
                  size="sm"
                  icon="restart_alt"
                  (action)="focusService.reset(current.durationMinutes)">
                  Reiniciar
                </m3-button>

                <m3-button
                  variant="outlined"
                  size="sm"
                  icon="verified"
                  (action)="completeFocusBlock(current.id)">
                  Registrar
                </m3-button>
              </div>
            </div>
          </div>
        </section>

        <!-- AJUSTES RÁPIDOS DE PLANIFICACIÓN -->
        <section class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-muted">Planificación rápida</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset class="space-y-1.5 border-0 p-0 m-0">
              <legend class="text-[11px] font-medium text-muted">Bloque</legend>
              <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Mover actividad de día">
                @for (bucket of buckets; track bucket) {
                  @let isSelected = current.dueBucket === bucket;
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="isSelected"
                    (click)="updateBucket(current.id, bucket)"
                    [class]="isSelected
                      ? 'bg-sec-box text-on-sec-box font-semibold'
                      : 'bg-surface text-muted hover:text-main'"
                    class="agenda-pill-toggle focus-ring-m3 px-2.5 py-1 text-xs cursor-pointer">
                    {{ bucket }}
                  </button>
                }
              </div>
            </fieldset>

            <fieldset class="space-y-1.5 border-0 p-0 m-0">
              <legend class="text-[11px] font-medium text-muted">Prioridad</legend>
              <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cambiar prioridad">
                @for (prio of priorities; track prio) {
                  @let isSelected = current.priority === prio;
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="isSelected"
                    (click)="updatePriority(current.id, prio)"
                    [class]="priorityToggleClass(prio, isSelected)"
                    class="agenda-pill-toggle focus-ring-m3 px-2.5 py-1 text-xs inline-flex items-center gap-1 cursor-pointer">
                    <span class="material-symbols-rounded text-xs" aria-hidden="true">
                      {{ prio === 'Alta' ? 'priority_high' : prio === 'Media' ? 'flag' : 'low_priority' }}
                    </span>
                    <span>{{ prio }}</span>
                  </button>
                }
              </div>
            </fieldset>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div class="space-y-1">
              <label for="inspector-time-slot" class="block text-[11px] font-medium text-muted">
                Horario asignado
              </label>
              <input
                id="inspector-time-slot"
                type="time"
                [value]="current.timeSlot"
                (change)="onTimeChange(current.id, $event)"
                class="w-full min-h-[38px] px-3 rounded-m3-md bg-surface text-main text-sm font-mono focus-ring-m3" />
            </div>

            <fieldset class="space-y-1 border-0 p-0 m-0">
              <legend class="text-[11px] font-medium text-muted">Estimación</legend>
              <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cambiar duración estimada">
                @for (dur of durations; track dur) {
                  @let isSelected = current.durationMinutes === dur;
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="isSelected"
                    (click)="updateDuration(current.id, dur)"
                    [class]="isSelected
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface text-muted hover:text-main'"
                    class="agenda-pill-toggle focus-ring-m3 px-2.5 py-1 text-xs font-mono cursor-pointer">
                    {{ dur }}m
                  </button>
                }
              </div>
            </fieldset>
          </div>
        </section>

        <!-- SUBTAREAS Y CHECKLIST -->
        <section class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted">
              Lista de pasos ({{ subSummary.done }}/{{ subSummary.total }})
            </h3>
            @if (subSummary.total > 0) {
              <span class="text-xs font-mono font-semibold text-primary">{{ subSummary.percent }}%</span>
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
            <ul role="list" class="list-none m-0 p-0 space-y-1.5">
              @for (st of current.subtasks; track st.id) {
                <li class="flex items-center justify-between gap-2 bg-surface rounded-m3-md pr-2">
                  <div class="flex items-center flex-1 min-w-0">
                    <m3-checkbox
                      [checked]="st.done"
                      [ariaLabel]="'Paso ' + st.title"
                      (checkedChange)="toggleSubtask.emit({ taskId: current.id, subtaskId: st.id })" />
                    <span
                      [class.line-through]="st.done"
                      [class.opacity-60]="st.done"
                      class="text-xs sm:text-sm text-main truncate">
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
            <p class="text-xs text-muted bg-surface rounded-m3-md px-3 py-2.5">
              Todavía no hay subtareas. Divide esta actividad en pasos accionables abajo.
            </p>
          }

          <form (submit)="onAddSubtaskSubmit($event, current.id)" class="flex items-center gap-2">
            <label for="inspector-new-subtask" class="sr-only">Nuevo paso para la actividad</label>
            <input
              id="inspector-new-subtask"
              type="text"
              [value]="newSubtaskTitle()"
              (input)="onSubtaskInput($event)"
              (keydown.enter)="onSubtaskKeyEnter($event)"
              enterkeyhint="done"
              placeholder="Añadir paso accionable..."
              class="flex-1 min-w-0 min-h-[38px] px-3 rounded-m3-md bg-surface text-sm text-main placeholder:text-muted focus-ring-m3" />
            <m3-button
              type="submit"
              variant="tonal"
              size="sm"
              icon="add"
              [disabled]="!newSubtaskTitle().trim()">
              Paso
            </m3-button>
          </form>
        </section>

        <!-- NOTAS DE TRABAJO -->
        <section class="space-y-2">
          <m3-text-field
            variant="outlined"
            label="Notas técnicas y criterios"
            placeholder="Anota decisiones, endpoints o referencias..."
            icon="description"
            [multiline]="true"
            [autoGrow]="true"
            [rows]="2"
            [maxlength]="300"
            [value]="editableNotes()"
            (valueChange)="onNotesEdited(current.id, $event)" />
        </section>
      } @else {
        <div class="py-12 px-4 text-center space-y-2">
          <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">touch_app</span>
          <h2 id="agenda-inspector-heading" class="text-base font-bold text-main">
            Selecciona una actividad
          </h2>
          <p class="text-xs text-muted">
            Toca cualquier bloque de la lista para ver subtareas, editar detalles o iniciar una sesión de enfoque.
          </p>
        </div>
      }
    </aside>
  `
})
export class AgendaInspectorPaneComponent {
  readonly focusService = inject(AgendaFocusService);

  readonly task = input.required<TaskItem | null>();

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

  readonly buckets = TASK_DUE_BUCKETS;
  readonly priorities = TASK_PRIORITIES;
  readonly durations = TASK_DURATIONS;
  readonly focusPresets = FOCUS_PRESETS;

  readonly newSubtaskTitle = signal<string>('');
  readonly editableNotes = signal<string>('');
  private lastBoundTaskId: number | null = null;

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

  priorityToggleClass(prio: TaskPriority, selected: boolean): string {
    if (!selected) return 'bg-surface text-muted hover:text-main';
    if (prio === 'Alta') return 'bg-error-box text-on-error-box font-semibold';
    if (prio === 'Media') return 'bg-warning-box text-on-warning-box font-semibold';
    return 'bg-tertiary-box text-on-tertiary-box font-semibold';
  }

  updateBucket(id: number, dueBucket: TaskDueBucket): void {
    this.patchTask.emit({ id, patch: { dueBucket } });
    this.announceStatus.emit(`Actividad movida a ${dueBucket}.`);
  }

  updatePriority(id: number, priority: TaskPriority): void {
    this.patchTask.emit({ id, patch: { priority } });
    this.announceStatus.emit(`Prioridad cambiada a ${priority}.`);
  }

  onTimeChange(id: number, event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.patchTask.emit({ id, patch: { timeSlot: target?.value ?? '' } });
  }

  updateDuration(id: number, durationMinutes: number): void {
    this.patchTask.emit({ id, patch: { durationMinutes } });
    if (this.focusService.activeTaskId() === id && this.focusService.status() === 'idle') {
      this.focusService.setDurationPreset(durationMinutes, id);
    }
  }

  onNotesEdited(id: number, notes: string): void {
    this.editableNotes.set(notes);
    this.patchTask.emit({ id, patch: { notes } });
  }

  onSubtaskInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.newSubtaskTitle.set(target?.value ?? '');
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
