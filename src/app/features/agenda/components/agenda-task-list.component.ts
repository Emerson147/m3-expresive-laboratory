import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TaskGroup, TaskItem } from '../../../core/tasks/task.service';
import { TriggerMode } from '../../../shared/models/ui.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
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
  imports: [M3ButtonComponent, M3CheckboxComponent],
  template: `
    <div class="space-y-5">
      <!-- CAPTURA RÁPIDA INLINE -->
      <form
        (submit)="onQuickAddSubmit($event)"
        class="bg-surface-low rounded-m3-xl p-2.5 pl-4 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary transition-shadow">
        <span class="material-symbols-rounded text-lg text-primary shrink-0" aria-hidden="true">add_task</span>
        <label for="agenda-quick-add" class="sr-only">Captura rápida de actividad para hoy</label>
        <input
          id="agenda-quick-add"
          type="text"
          [value]="quickTitle()"
          (input)="onQuickTitleInput($event)"
          (keydown.enter)="onQuickKeyEnter($event)"
          enterkeyhint="done"
          placeholder="Captura rápida para hoy (presiona Enter para agregar)..."
          class="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-main placeholder:text-muted" />
        <m3-button
          type="submit"
          variant="tonal"
          size="sm"
          icon="arrow_upward"
          [disabled]="!quickTitle().trim()">
          Agregar
        </m3-button>
      </form>

      <!-- LISTA AGRUPADA POR BLOQUES TEMPORALES -->
      @for (group of groupedTasks(); track group.bucket) {
        @let bucketMeta = bucketHeader(group.bucket);
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2 px-1">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-7 h-7 rounded-m3-sm bg-sec-box text-on-sec-box grid place-items-center shrink-0">
                <span class="material-symbols-rounded text-base" aria-hidden="true">{{ bucketMeta.icon }}</span>
              </span>
              <div class="min-w-0">
                <h3 class="text-sm font-bold text-main leading-tight">{{ group.bucket }}</h3>
                <p class="text-[11px] text-muted truncate">{{ bucketMeta.subtitle }}</p>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-high text-muted text-[11px] font-mono font-semibold shrink-0">
              {{ group.items.length }}
            </span>
          </div>

          <ul role="list" class="list-none m-0 p-0 space-y-2.5">
            @for (task of group.items; track task.id) {
              @let isSelected = selectedTaskId() === task.id;
              @let prioMeta = priorityMeta(task);
              @let catMeta = categoryVisual(task.category);
              @let subSummary = subtaskSummary(task);
              @let isFocusActive = focusActiveTaskId() === task.id && focusRunning();

              <li
                [class.invisible]="isDialogOpen() && activeTrigger() === 'task-card' && activeTaskId() === task.id"
                [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'task-card' && activeTaskId() === task.id ? 'dialog-transform' : null"
                [class]="rowSurfaceClasses(task, isSelected)"
                class="agenda-task-tile p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-transparent forced-colors:border-[ButtonText]">

                <!-- Izquierda: Checkbox nativo 48dp + Botón selector independiente (sin anidamiento) -->
                <div class="flex items-start gap-1.5 flex-1 min-w-0">
                  <m3-checkbox
                    [checked]="task.completed"
                    [ariaLabel]="(task.completed ? 'Reabrir actividad ' : 'Completar actividad ') + task.title"
                    (checkedChange)="toggleCompleted.emit(task.id)" />

                  <button
                    type="button"
                    [attr.aria-pressed]="isSelected"
                    (click)="selectTask.emit(task.id)"
                    class="flex-1 min-w-0 text-left py-0.5 px-1 rounded-m3-md focus-ring-m3 cursor-pointer">
                    <div class="flex items-center gap-2 min-w-0">
                      <h4
                        [class.line-through]="task.completed"
                        [class.opacity-70]="task.completed"
                        class="font-bold text-sm sm:text-base text-main truncate">
                        {{ task.title }}
                      </h4>
                      @if (isFocusActive) {
                        <span class="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1">
                          <span class="material-symbols-rounded text-xs" aria-hidden="true">timer</span>
                          Enfoque
                        </span>
                      }
                    </div>

                    @if (task.notes) {
                      <p
                        [class]="isSelected ? 'opacity-80' : 'text-muted'"
                        class="text-xs mt-0.5 line-clamp-1 leading-relaxed">
                        {{ task.notes }}
                      </p>
                    }

                    <div class="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        [class]="isSelected ? 'bg-surface-lowest/90 text-main' : 'bg-surface-high text-main'"
                        class="px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-primary" aria-hidden="true">{{ catMeta.icon }}</span>
                        <span>{{ task.category }}</span>
                      </span>

                      <span
                        [class]="isSelected ? 'opacity-85' : 'text-muted'"
                        class="text-[11px] font-mono inline-flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs" aria-hidden="true">schedule</span>
                        <span>{{ task.dateLabel }}</span>
                      </span>

                      <span
                        [class]="isSelected ? 'opacity-85' : 'text-muted'"
                        class="text-[11px] font-mono inline-flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs" aria-hidden="true">timelapse</span>
                        <span>{{ task.durationMinutes }}m</span>
                      </span>

                      @if (subSummary.total > 0) {
                        <span
                          [class]="isSelected ? 'opacity-85' : 'text-muted'"
                          class="text-[11px] font-mono inline-flex items-center gap-1">
                          <span class="material-symbols-rounded text-xs" aria-hidden="true">checklist</span>
                          <span>{{ subSummary.done }}/{{ subSummary.total }} pasos</span>
                        </span>
                      }
                    </div>
                  </button>
                </div>

                <!-- Derecha: Rol de prioridad (icono + texto) + acciones independientes -->
                <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span
                    [class]="prioMeta.badgeClass"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 shrink-0">
                    <span class="material-symbols-rounded text-xs" aria-hidden="true">{{ prioMeta.icon }}</span>
                    <span>{{ prioMeta.label }}</span>
                  </span>

                  <m3-button
                    variant="tonal"
                    size="xs"
                    icon="edit"
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
              </li>
            }
          </ul>
        </div>
      } @empty {
        <div class="p-10 text-center bg-surface-low rounded-m3-xl space-y-3">
          <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">event_busy</span>
          <h3 class="text-base font-bold text-main">Sin actividades para estos filtros</h3>
          <p class="text-xs text-muted max-w-sm mx-auto">
            Puedes limpiar la búsqueda o crear una nueva actividad en tu agenda.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
            <m3-button variant="tonal" size="sm" icon="filter_alt_off" (action)="resetFilters.emit()">
              Limpiar filtros
            </m3-button>
            <m3-button variant="filled" size="sm" icon="add" (action)="createTask.emit()">
              Nueva Actividad
            </m3-button>
          </div>
        </div>
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

  rowSurfaceClasses(task: TaskItem, isSelected: boolean): string {
    if (isSelected) {
      return 'bg-primary-box text-on-primary-box is-selected shadow-xs';
    }
    if (task.completed) {
      return 'bg-surface-low/75 hover:bg-surface-low text-muted';
    }
    return 'bg-surface-low hover:bg-surface-box text-main';
  }

  onQuickTitleInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.quickTitle.set(target?.value ?? '');
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
