import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal
} from '@angular/core';
import { DialogService } from '../../core/dialog/dialog.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { FilterStatus, TaskItem, TaskService } from '../../core/tasks/task.service';
import { M3TabItem, M3TabsComponent } from '../../shared/components/tabs/tabs.component';
import { AgendaFocusService } from './agenda-focus.service';
import { AGENDA_EXPRESSIVE_CSS } from './components/agenda-expressive.styles';
import { AgendaFiltersBarComponent } from './components/agenda-filters-bar.component';
import { AgendaInspectorPaneComponent } from './components/agenda-inspector-pane.component';
import { AgendaKpiQuickFilter, AgendaKpiRibbonComponent } from './components/agenda-kpi-ribbon.component';
import { AgendaTaskListComponent } from './components/agenda-task-list.component';

type AgendaMobileTab = 'list' | 'inspector';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [AGENDA_EXPRESSIVE_CSS],
  imports: [
    M3TabsComponent,
    AgendaKpiRibbonComponent,
    AgendaFiltersBarComponent,
    AgendaTaskListComponent,
    AgendaInspectorPaneComponent
  ],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <div class="agenda-workbench space-y-5 w-full min-w-0">
      <!-- BANDA 1: PANORAMA Y PULSO DIARIO -->
      <app-agenda-kpi-ribbon
        [totalCount]="taskService.tasks().length"
        [pendingCount]="taskService.pendingCount()"
        [completedCount]="taskService.completedCount()"
        [highPriorityPendingCount]="taskService.highPriorityPendingCount()"
        [todayPendingCount]="taskService.todayPendingCount()"
        [totalPendingMinutes]="taskService.totalPendingMinutes()"
        [totalFocusSessions]="taskService.totalFocusSessions()"
        [completionRate]="taskService.completionRate()"
        [filterStatus]="taskService.filterStatus()"
        [priorityFilter]="taskService.priorityFilter()"
        (quickFilter)="applyQuickFilter($event)" />

      <!-- BANDA 2: BUSCADOR LANDMARK Y FILTROS -->
      <app-agenda-filters-bar
        [searchQuery]="taskService.searchQuery()"
        [filterStatus]="taskService.filterStatus()"
        [categoryFilter]="taskService.categoryFilter()"
        [totalCount]="taskService.tasks().length"
        [pendingCount]="taskService.pendingCount()"
        [completedCount]="taskService.completedCount()"
        (searchChange)="taskService.setSearchQuery($event)"
        (statusChange)="onStatusChange($event)"
        (categoryChange)="taskService.setCategoryFilter($event)"
        (createTask)="openNewTaskDialog()" />

      <!-- NAVEGADOR ADAPTATIVO EN MÓVIL / TABLET (< lg) -->
      <div class="lg:hidden">
        <m3-tabs
          variant="primary"
          ariaLabel="Vistas de agenda"
          idPrefix="agenda-mobile-tab"
          [tabs]="mobileTabs()"
          [(value)]="mobileTab" />
      </div>

      <!-- BANDA 3: COMPOSICIÓN ASIMÉTRICA LIST-DETAIL + SUPPORTING PANE (7 / 5) -->
      @let isMobileTabMode = adaptiveLayout.windowWidth() < 1024;
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div
          id="agenda-panel-list"
          [attr.role]="isMobileTabMode ? 'tabpanel' : null"
          [attr.aria-labelledby]="isMobileTabMode ? 'agenda-mobile-tab-list' : null"
          [class]="(mobileTab() === 'list' ? 'block' : 'hidden') + ' lg:block lg:col-span-7 min-w-0'">
          <app-agenda-task-list
            [groupedTasks]="taskService.groupedFilteredTasks()"
            [selectedTaskId]="taskService.selectedTask()?.id ?? null"
            [focusActiveTaskId]="focusService.activeTaskId()"
            [focusRunning]="focusService.status() === 'running'"
            [isDialogOpen]="dialogService.isDialogOpen()"
            [activeTrigger]="dialogService.activeTrigger()"
            [activeTaskId]="dialogService.activeTaskId()"
            (selectTask)="onSelectTask($event)"
            (toggleCompleted)="onToggleCompleted($event)"
            (editTask)="openTaskModal($event)"
            (deleteTask)="onDeleteTask($event)"
            (quickAdd)="onQuickAddTask($event)"
            (resetFilters)="resetFilters()"
            (createTask)="openNewTaskDialog()" />
        </div>

        <div
          id="agenda-panel-inspector"
          [attr.role]="isMobileTabMode ? 'tabpanel' : null"
          [attr.aria-labelledby]="isMobileTabMode ? 'agenda-mobile-tab-inspector' : null"
          [class]="(mobileTab() === 'inspector' ? 'block' : 'hidden') + ' lg:block lg:col-span-5 lg:sticky lg:top-4 min-w-0'">
          <app-agenda-inspector-pane
            [task]="taskService.selectedTask()"
            (toggleCompleted)="onToggleCompleted($event)"
            (openModalEdit)="openTaskModal($event)"
            (patchTask)="onPatchTask($event)"
            (toggleSubtask)="taskService.toggleSubtask($event.taskId, $event.subtaskId)"
            (addSubtask)="taskService.addSubtask($event.taskId, $event.title)"
            (removeSubtask)="taskService.removeSubtask($event.taskId, $event.subtaskId)"
            (announceStatus)="announce($event)" />
        </div>
      </div>

      <!-- ÚNICO LIVE REGION CENTRALIZADO PARA ANUNCIOS NO INTRUSIVOS -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ combinedLiveAnnouncement() }}
      </div>
    </div>
  `
})
export class AgendaComponent {
  readonly taskService = inject(TaskService);
  readonly dialogService = inject(DialogService);
  readonly focusService = inject(AgendaFocusService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);

  readonly mobileTab = signal<AgendaMobileTab>('list');
  readonly localAnnouncement = signal<string>('');

  readonly combinedLiveAnnouncement = computed(
    () => this.localAnnouncement() || this.focusService.announcement()
  );

  readonly mobileTabs = computed<M3TabItem[]>(() => [
    {
      id: 'list',
      label: 'Actividades',
      icon: 'checklist',
      badge: this.taskService.filteredTasks().length,
      panelId: 'agenda-panel-list'
    },
    {
      id: 'inspector',
      label: 'Enfoque & Detalle',
      icon: 'timer',
      badge:
        this.focusService.status() === 'running'
          ? this.focusService.formattedTime()
          : this.taskService.selectedTask()
            ? '1'
            : undefined,
      panelId: 'agenda-panel-inspector'
    }
  ]);

  applyQuickFilter(filter: AgendaKpiQuickFilter): void {
    if (filter === 'high-priority') {
      this.taskService.setFilter('pending');
      this.taskService.setPriorityFilter('Alta');
      this.announce('Mostrando actividades pendientes de prioridad Alta.');
      return;
    }

    this.taskService.setPriorityFilter('all');
    this.taskService.setFilter(filter);
    const labels: Record<Exclude<AgendaKpiQuickFilter, 'high-priority'>, string> = {
      all: 'Mostrando todas las actividades.',
      pending: 'Mostrando actividades pendientes.',
      completed: 'Mostrando actividades completadas.'
    };
    this.announce(labels[filter]);
  }

  onStatusChange(status: FilterStatus): void {
    this.taskService.setPriorityFilter('all');
    this.taskService.setFilter(status);
  }

  onSelectTask(id: number): void {
    this.taskService.selectTask(id);
  }

  onToggleCompleted(id: number): void {
    const task = this.taskService.tasks().find(t => t.id === id);
    this.taskService.toggleCompleted(id);
    if (task) {
      this.announce(
        task.completed
          ? `Actividad "${task.title}" marcada como pendiente.`
          : `Actividad "${task.title}" marcada como completada.`
      );
    }
  }

  onDeleteTask(id: number): void {
    const task = this.taskService.tasks().find(t => t.id === id);
    this.taskService.deleteTask(id);
    if (task) {
      this.announce(`Actividad "${task.title}" eliminada.`);
    }
  }

  onQuickAddTask(title: string): void {
    const activeCat = this.taskService.categoryFilter();
    const category = activeCat !== 'all' ? activeCat : 'Frontend Angular';
    const created = this.taskService.saveTask(
      {
        title,
        category,
        dateLabel: 'Hoy',
        dueBucket: 'Hoy',
        timeSlot: '',
        durationMinutes: 25,
        priority: 'Media',
        notes: ''
      },
      null
    );
    this.announce(`Actividad "${created.title}" agregada a Hoy.`);
  }

  onPatchTask(event: {
    id: number;
    patch: Parameters<TaskService['updateTaskFields']>[1];
  }): void {
    this.taskService.updateTaskFields(event.id, event.patch);
  }

  openNewTaskDialog(): void {
    this.dialogService.openFrom('bento-center');
  }

  openTaskModal(task: TaskItem): void {
    this.dialogService.openTaskCard(task);
  }

  resetFilters(): void {
    this.taskService.resetAllFilters();
    this.announce('Filtros de agenda restablecidos.');
  }

  announce(message: string): void {
    this.localAnnouncement.set('');
    queueMicrotask(() => this.localAnnouncement.set(message));
  }
}
