import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TaskGroup, TaskItem } from '../../../core/tasks/task.service';
import { TriggerMode } from '../../../shared/models/ui.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import {
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
  imports: [M3ButtonComponent, M3CardComponent, M3CheckboxComponent, M3TextFieldComponent],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <div class="space-y-6">
      <!-- CAPTURA RÁPIDA CON <m3-text-field> + <m3-button variant="tonal"> -->
      <form (submit)="onQuickAddSubmit($event)" class="flex items-start gap-3">
        <div class="flex-1 min-w-0">
          <m3-text-field
            [id]="'agenda-quick-add'"
            variant="filled"
            label="Captura rápida para hoy"
            placeholder="Escribe una actividad y presiona Enter..."
            icon="add_task"
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

      <!-- LISTA AGRUPADA POR BLOQUES TEMPORALES -->
      @for (group of groupedTasks(); track group.bucket) {
        @let bucketMeta = bucketHeader(group.bucket);
        <div class="space-y-3.5">
          <div class="flex items-center justify-between gap-3 px-1">
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-9 h-9 rounded-m3-sm bg-sec-box text-on-sec-box grid place-items-center shrink-0">
                <span class="material-symbols-rounded text-base" aria-hidden="true">{{ bucketMeta.icon }}</span>
              </span>
              <div class="min-w-0">
                <h3 class="text-title-sm-emphasized text-main">{{ group.bucket }}</h3>
                <p class="text-body-sm text-muted truncate">{{ bucketMeta.subtitle }}</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-surface-high text-muted text-label-md-emphasized tabular-nums shrink-0">
              {{ group.items.length }}
            </span>
          </div>

          <ul role="list" class="list-none m-0 p-0 space-y-3.5">
            @for (task of group.items; track task.id) {
              @let isSelected = selectedTaskId() === task.id;
              @let prioMeta = priorityMeta(task);
              @let catMeta = categoryVisual(task.category);
              @let subSummary = subtaskSummary(task);
              @let isFocusActive = focusActiveTaskId() === task.id && focusRunning();

              <li>
                <m3-card
                  [variant]="cardVariant(task, isSelected)"
                  [tone]="isSelected ? 'primary' : 'default'"
                  [interactive]="false"
                  shape="lg"
                  padding="lg"
                  [customClass]="rowCardClasses(task, isSelected)">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-start gap-2.5 flex-1 min-w-0">
                      <m3-checkbox
                        [checked]="task.completed"
                        [ariaLabel]="(task.completed ? 'Reabrir actividad ' : 'Completar actividad ') + task.title"
                        (checkedChange)="toggleCompleted.emit(task.id)" />

                      <button
                        type="button"
                        [attr.aria-pressed]="isSelected"
                        (click)="selectTask.emit(task.id)"
                        class="flex-1 min-w-0 text-left py-1 px-1.5 rounded-m3-sm focus-ring-m3 cursor-pointer space-y-1.5">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <h4
                            [class.line-through]="task.completed"
                            [class.opacity-70]="task.completed"
                            class="text-title-sm-emphasized text-main truncate">
                            {{ task.title }}
                          </h4>
                          @if (isFocusActive) {
                            <span class="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-label-sm-emphasized uppercase tracking-wider shrink-0 inline-flex items-center gap-1">
                              <span class="material-symbols-rounded text-xs" aria-hidden="true">timer</span>
                              Enfoque
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

                        <div class="flex flex-wrap items-center gap-2.5 pt-1">
                          <span
                            [class]="isSelected ? 'bg-surface-lowest/90 text-main' : 'bg-surface-high text-main'"
                            class="px-2.5 py-1 rounded-full text-label-sm inline-flex items-center gap-1.5">
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

                    <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <span
                        [class]="prioMeta.badgeClass"
                        class="px-3 py-1 rounded-full text-label-sm-emphasized inline-flex items-center gap-1 shrink-0">
                        <span class="material-symbols-rounded text-xs" aria-hidden="true">{{ prioMeta.icon }}</span>
                        <span>{{ prioMeta.label }}</span>
                      </span>

                      <m3-button
                        variant="tonal"
                        size="xs"
                        icon="edit"
                        [ariaLabel]="'Editar en modal ' + task.title"
                        [invisible]="isDialogOpen() && activeOriginKey() === ('task-edit-' + task.id)"
                        [viewTransitionName]="isDialogTransitioning() && !isDialogOpen() && activeOriginKey() === ('task-edit-' + task.id) ? 'dialog-transform' : null"
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
                </m3-card>
              </li>
            }
          </ul>
        </div>
      } @empty {
        <m3-card variant="filled" [interactive]="false" shape="xl" padding="xl" customClass="!bg-surface-low text-center">
          <div class="space-y-3.5 py-2">
            <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">event_busy</span>
            <h3 class="text-title-md-emphasized text-main">Sin actividades para estos filtros</h3>
            <p class="text-body-sm text-muted max-w-sm mx-auto">
              Puedes limpiar la búsqueda o crear una nueva actividad en tu agenda.
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <m3-button variant="outlined" size="sm" icon="filter_alt_off" (action)="resetFilters.emit()">
                Limpiar filtros
              </m3-button>
              <m3-button
                variant="tonal"
                size="sm"
                icon="add"
                [invisible]="isDialogOpen() && activeOriginKey() === 'agenda-empty-create'"
                [viewTransitionName]="isDialogTransitioning() && !isDialogOpen() && activeOriginKey() === 'agenda-empty-create' ? 'dialog-transform' : null"
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
  readonly isDialogOpen = input.required<boolean>();
  readonly isDialogTransitioning = input<boolean>(false);
  readonly activeOriginKey = input<string | null>(null);
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly activeTaskId = input<number | null>(null);

  readonly selectTask = output<number>();
  readonly toggleCompleted = output<number>();
  readonly editTask = output<TaskItem>();
  readonly deleteTask = output<number>();
  readonly quickAdd = output<string>();
  readonly resetFilters = output<void>();
  readonly createTask = output<void>();

  readonly quickTitle = signal<string>('');

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

  cardVariant(task: TaskItem, isSelected: boolean): 'elevated' | 'filled' | 'outlined' {
    if (isSelected) return 'filled';
    return task.completed ? 'outlined' : 'elevated';
  }

  rowCardClasses(task: TaskItem, isSelected: boolean): string {
    if (isSelected) {
      return 'agenda-task-tile is-selected shadow-xs';
    }
    if (task.completed) {
      return 'agenda-task-tile opacity-80 text-muted';
    }
    return 'agenda-task-tile hover:bg-surface-box';
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
