import { ChangeDetectionStrategy, Component, input, output, signal, viewChild } from '@angular/core';
import { TaskGroup, TaskItem } from '../../../core/tasks/task.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import {
  formatFocusBlocks,
  getBucketHeaderMeta,
  getPriorityMeta,
  getSubtaskCompletionSummary,
  getTaskCategoryVisual,
  preventEnterDuringComposition
} from './agenda-ui.utils';

@Component({
  selector: 'app-agenda-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3LinearProgressComponent,
    M3TextFieldComponent
  ],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <div class="space-y-5">
      <!-- MORPH IN-PLACE: PÍLDORA COMPACTA <-> CAPTURA RÁPIDA PARA HOY -->
      <div
        class="agenda-quick-morph border px-4 py-2.5"
        [class]="quickAddExpanded()
          ? 'is-expanded bg-surface-box border-primary/45 shadow-xs'
          : 'bg-surface-low border-outline-sub/60 hover:bg-surface-container'">
        <button
          type="button"
          [attr.aria-expanded]="quickAddExpanded()"
          aria-controls="agenda-quick-add-region"
          (click)="toggleQuickAdd()"
          class="w-full flex items-center justify-between gap-3 py-1 text-left focus-ring-m3 rounded-m3-sm cursor-pointer">
          <span class="flex items-center gap-2.5 min-w-0">
            <span class="w-8 h-8 rounded-m3-md bg-sec-box text-on-sec-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-base" aria-hidden="true">
                {{ quickAddExpanded() ? 'edit_note' : 'add_task' }}
              </span>
            </span>
            <span class="min-w-0">
              <span class="block text-title-sm-emphasized text-main truncate">
                Captura rápida para hoy
              </span>
              @if (!quickAddExpanded()) {
                <span class="block text-body-sm text-muted truncate">
                  Toca para anotar una tarea rápida en un toque...
                </span>
              }
            </span>
          </span>

          <span class="px-2.5 py-1 rounded-full bg-surface-high text-muted text-label-sm font-medium shrink-0 inline-flex items-center gap-1">
            @if (quickAddExpanded()) {
              <span class="material-symbols-rounded text-xs" aria-hidden="true">expand_less</span>
              <span>Contraer</span>
            } @else {
              <span>Hoy · 25m</span>
              <span class="material-symbols-rounded text-xs" aria-hidden="true">expand_more</span>
            }
          </span>
        </button>

        <div
          id="agenda-quick-add-region"
          class="agenda-expand-grid"
          [class.is-open]="quickAddExpanded()"
          [attr.inert]="!quickAddExpanded() ? '' : null"
          [attr.aria-hidden]="!quickAddExpanded() ? 'true' : null">
          <div class="agenda-expand-inner">
            <form (submit)="onQuickAddSubmit($event)" class="flex items-start gap-2.5 pt-3 pb-1">
              <div class="flex-1 min-w-0">
                <m3-text-field
                  #quickField
                  [id]="'agenda-quick-add'"
                  variant="filled"
                  label="Título rápido"
                  placeholder="Escribe una actividad y presiona Enter..."
                  icon="bolt"
                  enterkeyhint="done"
                  [clearable]="true"
                  [value]="quickTitle()"
                  (valueChange)="quickTitle.set($event)"
                  (keydown.enter)="onQuickKeyEnter($event)" />
              </div>
              <m3-button
                type="submit"
                variant="tonal"
                size="lg"
                icon="arrow_upward"
                customClass="mt-1 shrink-0"
                [disabled]="!quickTitle().trim()">
                Agregar
              </m3-button>
            </form>
          </div>
        </div>
      </div>

      <!-- LISTA AGRUPADA POR BLOQUES TEMPORALES -->
      @for (group of groupedTasks(); track group.bucket) {
        @let bucketMeta = bucketHeader(group.bucket);
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3 px-1">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-8 h-8 rounded-m3-sm bg-sec-box text-on-sec-box grid place-items-center shrink-0">
                <span class="material-symbols-rounded text-base" aria-hidden="true">{{ bucketMeta.icon }}</span>
              </span>
              <div class="min-w-0">
                <h3 class="text-title-sm-emphasized text-main">{{ group.bucket }}</h3>
                <p class="text-body-sm text-muted truncate">{{ bucketMeta.subtitle }}</p>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-high text-muted text-label-md-emphasized tabular-nums shrink-0">
              {{ group.items.length }}
            </span>
          </div>

          <ul role="list" class="list-none m-0 p-0 space-y-3">
            @for (task of group.items; track task.id) {
              @let isSelected = selectedTaskId() === task.id;
              @let prioMeta = priorityMeta(task);
              @let catMeta = categoryVisual(task.category);
              @let subSummary = subtaskSummary(task);
              @let isFocusActive = focusActiveTaskId() === task.id && focusRunning();

              <li>
                <m3-card
                  variant="filled"
                  [surface]="cardSurface(task, isSelected)"
                  [tone]="isSelected ? 'primary' : 'default'"
                  [interactive]="false"
                  shape="lg"
                  padding="md"
                  [customClass]="rowCardClasses(task, isSelected, isFocusActive)">
                  <div class="agenda-task-main-row flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div class="flex items-start gap-2 flex-1 min-w-0">
                      <m3-checkbox
                        [checked]="task.completed"
                        [ariaLabel]="(task.completed ? 'Reabrir actividad ' : 'Completar actividad ') + task.title"
                        (checkedChange)="toggleCompleted.emit(task.id)" />

                      <button
                        type="button"
                        [attr.aria-pressed]="isSelected"
                        (click)="selectTask.emit(task.id)"
                        class="flex-1 min-w-0 text-left py-0.5 px-1.5 rounded-m3-sm focus-ring-m3 cursor-pointer space-y-1">
                        <div class="flex items-center gap-2 min-w-0">
                          <h4
                            [class.line-through]="task.completed"
                            [class.opacity-70]="task.completed"
                            class="text-title-sm-emphasized text-main truncate">
                            {{ task.title }}
                          </h4>
                          @if (isFocusActive) {
                            <span class="px-2 py-0.5 rounded-full bg-primary text-on-primary text-label-sm-emphasized uppercase tracking-wider shrink-0 inline-flex items-center gap-1">
                              <span class="w-1.5 h-1.5 rounded-full bg-on-primary agenda-live-dot" aria-hidden="true"></span>
                              <span>Enfoque</span>
                            </span>
                          }
                        </div>

                        @if (task.notes) {
                          <p
                            [class]="isSelected ? 'opacity-85' : 'text-muted'"
                            class="text-body-sm line-clamp-1">
                            {{ task.notes }}
                          </p>
                        }

                        <div class="flex flex-wrap items-center gap-2 pt-0.5">
                          <span
                            [class]="isSelected ? 'bg-surface-lowest/90 text-main' : 'bg-surface-high text-main'"
                            class="px-2.5 py-0.5 rounded-full text-label-sm inline-flex items-center gap-1.5">
                            <span class="material-symbols-rounded text-xs text-primary" aria-hidden="true">{{ catMeta.icon }}</span>
                            <span>{{ task.category }}</span>
                          </span>

                          <span
                            [class]="isSelected ? 'opacity-90' : 'text-muted'"
                            class="text-label-sm tabular-nums inline-flex items-center gap-1">
                            <span class="material-symbols-rounded text-xs" aria-hidden="true">schedule</span>
                            <span>{{ task.dateLabel }}</span>
                          </span>

                          <span
                            [class]="isSelected ? 'opacity-90' : 'text-muted'"
                            class="text-label-sm tabular-nums inline-flex items-center gap-1">
                            <span class="material-symbols-rounded text-xs" aria-hidden="true">timelapse</span>
                            <span>{{ task.durationMinutes }}m</span>
                          </span>

                          @if (subSummary.total > 0) {
                            <span
                              [class]="isSelected ? 'opacity-90' : 'text-muted'"
                              class="text-label-sm tabular-nums inline-flex items-center gap-1">
                              <span class="material-symbols-rounded text-xs" aria-hidden="true">checklist</span>
                              <span>{{ subSummary.done }}/{{ subSummary.total }} pasos</span>
                            </span>
                          }
                        </div>
                      </button>
                    </div>

                    <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span
                        [class]="prioMeta.badgeClass"
                        class="px-2.5 py-1 rounded-full text-label-sm-emphasized inline-flex items-center gap-1 shrink-0">
                        <span class="material-symbols-rounded text-xs" aria-hidden="true">{{ prioMeta.icon }}</span>
                        <span>{{ prioMeta.label }}</span>
                      </span>

                      <m3-button
                        variant="tonal"
                        size="xs"
                        icon="edit"
                        [invisible]="hiddenEditTaskId() === task.id"
                        [viewTransitionName]="activeEditOriginTaskId() === task.id ? 'dialog-transform' : null"
                        [ariaLabel]="'Editar en modal ' + task.title"
                        (action)="editTask.emit(task)">
                        Editar
                      </m3-button>

                      <m3-button
                        [iconOnly]="true"
                        variant="text"
                        size="xs"
                        icon="delete"
                        [ariaLabel]="'Eliminar actividad ' + task.title"
                        (action)="deleteTask.emit(task.id)" />
                    </div>
                  </div>

                  <!-- MORPH IN-PLACE AL SELECCIONAR: BARRA RÁPIDA DE ENFOQUE TONAL -->
                  <div
                    class="agenda-expand-grid"
                    [class.is-open]="isSelected"
                    [attr.inert]="!isSelected ? '' : null"
                    [attr.aria-hidden]="!isSelected ? 'true' : null">
                    <div class="agenda-expand-inner">
                      <div class="mt-3 rounded-m3-lg bg-surface-lowest/85 text-main px-3.5 py-2.5 space-y-2.5">
                        @if (subSummary.total > 0) {
                          <m3-linear-progress
                            [wavy]="false"
                            size="sm"
                            [value]="subSummary.percent"
                            color="secondary"
                            [ariaLabel]="'Progreso de subtareas de ' + task.title" />
                        }
                        <div class="flex flex-wrap items-center justify-between gap-2.5">
                          <span class="text-label-sm text-muted tabular-nums inline-flex items-center gap-1.5">
                            <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">
                              {{ isFocusActive ? 'graphic_eq' : 'bolt' }}
                            </span>
                            <span>
                              @if (isFocusActive) {
                                Pomodoro activo en esta tarea
                              } @else if (subSummary.total > 0) {
                                {{ subSummary.percent }}% de pasos completados · {{ formatBlocks(task.focusSessionsCompleted, 'hoy') }}
                              } @else {
                                {{ formatBlocks(task.focusSessionsCompleted, 'enfocado hoy', 'enfocados hoy') }} · Listo para iniciar
                              }
                            </span>
                          </span>

                          <m3-button
                            variant="tonal"
                            size="xs"
                            [disabled]="!isSelected"
                            [icon]="isFocusActive ? 'pause' : 'play_arrow'"
                            (action)="focusTask.emit(task)">
                            {{ isFocusActive ? 'Pausar enfoque' : 'Enfocar bloque' }}
                          </m3-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </m3-card>
              </li>
            }
          </ul>
        </div>
      } @empty {
        <m3-card variant="filled" surface="low" [interactive]="false" shape="xl" padding="xl" customClass="text-center">
          <div class="space-y-3.5 py-2">
            <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">event_busy</span>
            <h3 class="text-title-md-emphasized text-main">Sin actividades para estos filtros</h3>
            <p class="text-body-sm text-muted max-w-sm mx-auto">
              Puedes limpiar la búsqueda o crear una nueva actividad en tu agenda.
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <m3-button variant="text" size="sm" icon="filter_alt_off" (action)="resetFilters.emit()">
                Limpiar filtros
              </m3-button>
              <m3-button
                variant="tonal"
                size="sm"
                icon="add"
                (action)="createTask.emit()">
                Nueva Actividad
              </m3-button>
            </div>
          </div>
        </m3-card>
      }
    </div>
  `
})
export class AgendaTaskListComponent {
  readonly groupedTasks = input.required<readonly TaskGroup[]>();
  readonly selectedTaskId = input.required<number | null>();
  readonly focusActiveTaskId = input<number | null>(null);
  readonly focusRunning = input<boolean>(false);
  readonly activeEditOriginTaskId = input<number | null>(null);
  readonly hiddenEditTaskId = input<number | null>(null);

  readonly selectTask = output<number>();
  readonly toggleCompleted = output<number>();
  readonly editTask = output<TaskItem>();
  readonly deleteTask = output<number>();
  readonly focusTask = output<TaskItem>();
  readonly quickAdd = output<string>();
  readonly resetFilters = output<void>();
  readonly createTask = output<void>();

  private readonly quickField = viewChild<M3TextFieldComponent>('quickField');
  readonly quickAddExpanded = signal<boolean>(false);
  readonly quickTitle = signal<string>('');

  toggleQuickAdd(): void {
    const next = !this.quickAddExpanded();
    this.quickAddExpanded.set(next);
    if (next) {
      queueMicrotask(() => this.quickField()?.focus());
    }
  }

  bucketHeader(bucket: TaskGroup['bucket']) {
    return getBucketHeaderMeta(bucket);
  }

  priorityMeta(task: TaskItem) {
    return getPriorityMeta(task.priority, task.completed);
  }

  categoryVisual(category: string) {
    return getTaskCategoryVisual(category);
  }

  subtaskSummary(task: TaskItem) {
    return getSubtaskCompletionSummary(task);
  }

  formatBlocks(count: number, singularSuffix = '', pluralSuffix = singularSuffix): string {
    return formatFocusBlocks(count, singularSuffix, pluralSuffix);
  }

  cardSurface(task: TaskItem, isSelected: boolean): 'default' | 'low' | 'surface' {
    if (isSelected) return 'default';
    return task.completed ? 'surface' : 'low';
  }

  rowCardClasses(task: TaskItem, isSelected: boolean, isFocusActive = false): string {
    const focusRing = isFocusActive ? ' ring-1 ring-primary/45 shadow-xs' : '';
    if (isSelected) {
      return `agenda-task-tile is-selected shadow-xs${focusRing}`;
    }
    if (task.completed) {
      return `agenda-task-tile is-completed text-muted${focusRing}`;
    }
    return `agenda-task-tile${focusRing}`;
  }

  onQuickKeyEnter(event: Event): void {
    preventEnterDuringComposition(event);
  }

  onQuickAddSubmit(event: Event): void {
    event.preventDefault();
    const title = this.quickTitle().trim();
    if (!title) return;
    this.quickAdd.emit(title);
    this.quickTitle.set('');
  }
}
