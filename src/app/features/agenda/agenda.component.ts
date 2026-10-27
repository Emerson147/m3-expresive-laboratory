import { Component, inject } from '@angular/core';
import { DialogService } from '../../core/dialog/dialog.service';
import { FilterStatus, TaskItem, TaskService } from '../../core/tasks/task.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3CardComponent } from '../../shared/components/card/card.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [M3ButtonComponent, M3CardComponent, M3ChipComponent],
  template: `
    <section class="space-y-5 max-w-4xl">
      <!-- BARRA DE ACCIÓN Y FILTROS ZEN (Sin doble header) -->
      <div class="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div class="flex flex-wrap items-center gap-2.5">
          <m3-chip 
            type="filter" 
            [selected]="filterStatus() === 'all'" 
            [count]="tasks().length"
            (action)="setFilter('all')">
            Todas
          </m3-chip>

          <m3-chip 
            type="filter" 
            [selected]="filterStatus() === 'pending'" 
            [count]="pendingCount()"
            (action)="setFilter('pending')">
            Pendientes
          </m3-chip>

          <m3-chip 
            type="filter" 
            [selected]="filterStatus() === 'completed'" 
            [count]="completedCount()"
            (action)="setFilter('completed')">
            Completadas
          </m3-chip>
        </div>

        <m3-button 
          variant="filled" 
          size="sm"
          icon="add" 
          (action)="dialogService.openFrom('fab-header')">
          Nueva Tarea
        </m3-button>
      </div>

      <!-- LISTA DE TAREAS CON VIEW TRANSITION CONTAINER TRANSFORM -->
      <div class="space-y-3 pt-1">
        @for (task of filteredTasks(); track task.id) {
          <m3-card 
            variant="filled" 
            [interactive]="true" 
            padding="md" 
            (action)="openTask(task)"
            [invisible]="dialogService.isDialogOpen() && dialogService.activeTrigger() === 'task-card' && dialogService.activeTaskId() === task.id"
            [viewTransitionName]="!dialogService.isDialogOpen() && dialogService.activeTrigger() === 'task-card' && dialogService.activeTaskId() === task.id ? 'dialog-transform' : null"
            customClass="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-sub">
            
            <div class="flex items-start gap-3.5 flex-1 min-w-0">
              <button 
                type="button"
                [attr.aria-label]="task.completed ? 'Marcar como pendiente' : 'Marcar como completada'"
                (click)="toggleCompleted($event, task.id)"
                [class]="task.completed 
                  ? 'bg-primary text-on-primary rounded-full shadow-xs' 
                  : 'border-2 border-outline hover:border-primary text-transparent rounded-m3-xs'"
                class="btn-m3 w-7 h-7 grid place-items-center mt-0.5 shrink-0 cursor-pointer transition-colors duration-200">
                <span class="material-symbols-rounded text-base font-bold">check</span>
              </button>

              <div class="min-w-0 flex-1">
                <h3 
                  [class.line-through]="task.completed" 
                  [class.text-muted]="task.completed"
                  class="font-bold text-base truncate">
                  {{ task.title }}
                </h3>
                <p class="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed">
                  {{ task.notes }}
                </p>
                
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <span class="px-2.5 py-0.5 rounded-full bg-surface-high text-main text-[11px] font-medium">
                    {{ task.category }}
                  </span>
                  <span class="text-xs text-muted inline-flex items-center gap-1">
                    <span class="material-symbols-rounded text-sm">calendar_today</span>
                    {{ task.dateLabel }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ACCIONES LATERALES DE LA TARJETA -->
            <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center" (click)="$event.stopPropagation()">
              <span 
                [class]="task.priority === 'Alta' 
                  ? 'bg-tertiary-box text-on-tertiary-box' 
                  : 'bg-sec-box text-on-sec-box'"
                class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ task.priority }}
              </span>

              <m3-button 
                variant="outlined" 
                size="sm" 
                icon="edit" 
                (action)="openTask(task)">
                Editar
              </m3-button>

              <m3-button 
                [iconOnly]="true" 
                variant="text" 
                size="sm" 
                icon="delete" 
                ariaLabel="Eliminar tarea"
                (action)="deleteTask(task.id)" />
            </div>
          </m3-card>
        } @empty {
          <div class="p-12 text-center bg-surface-box border border-outline-sub rounded-m3-xl space-y-3">
            <span class="material-symbols-rounded text-4xl text-muted">task_alt</span>
            <h4 class="text-base font-bold text-main">No hay tareas en esta vista</h4>
            <p class="text-xs text-muted max-w-sm mx-auto">
              Todo está al día. Podés crear una nueva actividad o cambiar los filtros.
            </p>
          </div>
        }
      </div>
    </section>
  `
})
export class AgendaComponent {
  readonly taskService = inject(TaskService);
  readonly dialogService = inject(DialogService);

  readonly tasks = this.taskService.tasks;
  readonly filterStatus = this.taskService.filterStatus;
  readonly filteredTasks = this.taskService.filteredTasks;
  readonly pendingCount = this.taskService.pendingCount;
  readonly completedCount = this.taskService.completedCount;

  setFilter(status: FilterStatus): void {
    this.taskService.setFilter(status);
  }

  toggleCompleted(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.taskService.toggleCompleted(id);
  }

  openTask(task: TaskItem): void {
    this.dialogService.openTaskCard(task);
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id);
  }
}
