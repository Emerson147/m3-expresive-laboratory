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
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3FabComponent } from '../../shared/components/button/fab.component';
import { M3DialogComponent } from '../../shared/components/dialog/dialog.component';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TabItem, M3TabsComponent } from '../../shared/components/tabs/tabs.component';
import { AgendaFocusService } from './agenda-focus.service';
import { AGENDA_EXPRESSIVE_CSS } from './components/agenda-expressive.styles';
import {
  AgendaFiltersBarComponent,
  AgendaTaskPresetId
} from './components/agenda-filters-bar.component';
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
    M3ButtonComponent,
    M3DialogComponent,
    M3FabComponent,
    M3SnackbarComponent,
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
    <div class="agenda-workbench flex flex-col gap-7 lg:gap-8 w-full min-w-0">
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

      <!-- BANDA 2: BUSCADOR LANDMARK Y FILTROS DE DESIGN SYSTEM -->
      <app-agenda-filters-bar
        [searchQuery]="taskService.searchQuery()"
        [filterStatus]="taskService.filterStatus()"
        [categoryFilter]="taskService.categoryFilter()"
        [onlyToday]="taskService.onlyToday()"
        [totalCount]="taskService.tasks().length"
        [pendingCount]="taskService.pendingCount()"
        [completedCount]="taskService.completedCount()"
        [isDialogOpen]="dialogService.isDialogOpen()"
        [isDialogTransitioning]="dialogService.activeTransition() === 'dialog'"
        [activeOriginKey]="dialogService.activeOriginKey()"
        (searchChange)="taskService.setSearchQuery($event)"
        (statusChange)="onStatusChange($event)"
        (categoryChange)="taskService.setCategoryFilter($event)"
        (onlyTodayChange)="onOnlyTodayChange($event)"
        (requestClearCompleted)="clearDialogOpen.set(true)"
        (createTask)="openNewTaskDialog('agenda-split-create')"
        (createPreset)="onCreatePresetTask($event)" />

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
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
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
            [isDialogTransitioning]="dialogService.activeTransition() === 'dialog'"
            [activeOriginKey]="dialogService.activeOriginKey()"
            [activeTrigger]="dialogService.activeTrigger()"
            [activeTaskId]="dialogService.activeTaskId()"
            (selectTask)="onSelectTask($event)"
            (toggleCompleted)="onToggleCompleted($event)"
            (editTask)="openTaskModal($event, 'task-edit-' + $event.id)"
            (deleteTask)="onDeleteTask($event)"
            (quickAdd)="onQuickAddTask($event)"
            (resetFilters)="resetFilters()"
            (createTask)="openNewTaskDialog('agenda-empty-create')" />
        </div>

        <div
          id="agenda-panel-inspector"
          [attr.role]="isMobileTabMode ? 'tabpanel' : null"
          [attr.aria-labelledby]="isMobileTabMode ? 'agenda-mobile-tab-inspector' : null"
          [class]="(mobileTab() === 'inspector' ? 'block' : 'hidden') + ' lg:block lg:col-span-5 lg:sticky lg:top-4 min-w-0'">
          <app-agenda-inspector-pane
            [task]="taskService.selectedTask()"
            [isDialogOpen]="dialogService.isDialogOpen()"
            [isDialogTransitioning]="dialogService.activeTransition() === 'dialog'"
            [activeOriginKey]="dialogService.activeOriginKey()"
            (toggleCompleted)="onToggleCompleted($event)"
            (openModalEdit)="openTaskModal($event, 'inspector-modal-' + $event.id)"
            (patchTask)="onPatchTask($event)"
            (toggleSubtask)="taskService.toggleSubtask($event.taskId, $event.subtaskId)"
            (addSubtask)="taskService.addSubtask($event.taskId, $event.title)"
            (removeSubtask)="taskService.removeSubtask($event.taskId, $event.subtaskId)"
            (focusRecorded)="showToast($event, false)"
            (announceStatus)="announce($event)" />
        </div>
      </div>

      <!-- FAB MÓVIL DE SISTEMA PARA CREAR CON CONTAINER TRANSFORM (< md) -->
      <div
        class="md:hidden fixed right-4 z-30"
        [class]="mobileFabBottomClass()">
        <m3-fab
          icon="add"
          size="md"
          variant="primary"
          ariaLabel="Nueva actividad en Agenda"
          [invisible]="dialogService.isDialogOpen() && dialogService.activeOriginKey() === 'agenda-fab-create'"
          [viewTransitionName]="dialogService.activeTransition() === 'dialog' && !dialogService.isDialogOpen() && dialogService.activeOriginKey() === 'agenda-fab-create' ? 'dialog-transform' : null"
          (action)="openNewTaskDialog('agenda-fab-create')" />
      </div>

      <!-- CONFIRMACIÓN MODAL NATIVA PARA LIMPIEZA EN LOTE (<m3-dialog variant="expressive">) -->
      <m3-dialog
        #clearCompletedDlg
        variant="expressive"
        size="sm"
        tone="error"
        headline="¿Limpiar actividades completadas?"
        subtitle="Las actividades pendientes permanecerán intactas."
        icon="cleaning_services"
        [(open)]="clearDialogOpen">
        <p class="text-body-md text-muted">
          Se eliminarán <strong class="text-main tabular-nums">{{ taskService.completedCount() }}</strong>
          actividades completadas de tu agenda.
        </p>

        <div dialog-actions class="flex items-center gap-2.5">
          <m3-button variant="text" (action)="clearCompletedDlg.dismiss('cancel')">
            Cancelar
          </m3-button>
          <m3-button variant="filled" icon="delete_sweep" (action)="confirmClearCompleted(clearCompletedDlg)">
            Limpiar ({{ taskService.completedCount() }})
          </m3-button>
        </div>
      </m3-dialog>

      <!-- FEEDBACK NATIVO DE DESIGN SYSTEM CON ACCIÓN DESHACER -->
      <m3-snackbar
        [open]="snackbarOpen()"
        [message]="snackbarMessage()"
        [actionLabel]="snackbarCanUndo() ? 'Deshacer' : null"
        (openChange)="snackbarOpen.set($event)"
        (action)="onSnackbarUndo()" />

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
  readonly clearDialogOpen = signal<boolean>(false);
  readonly localAnnouncement = signal<string>('');
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');
  readonly snackbarCanUndo = signal<boolean>(false);

  readonly combinedLiveAnnouncement = computed(
    () => this.localAnnouncement() || this.focusService.announcement()
  );

  readonly mobileFabBottomClass = computed(() => {
    const chrome = this.dialogService.effectiveChrome();
    return chrome === 'bar' || chrome === 'dock' ? 'bottom-24' : 'bottom-5';
  });

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

  onOnlyTodayChange(enabled: boolean): void {
    this.taskService.setOnlyToday(enabled);
    this.announce(
      enabled
        ? 'Mostrando únicamente actividades programadas para Hoy.'
        : 'Mostrando actividades de todos los horizontes.'
    );
  }

  onCreatePresetTask(presetId: AgendaTaskPresetId): void {
    const activeCat = this.taskService.categoryFilter();
    const category = activeCat !== 'all' ? activeCat : 'Frontend Angular';

    const presetMap = {
      'deep-45': {
        title: 'Bloque Deep Work',
        durationMinutes: 45,
        priority: 'Alta' as const,
        notes: 'Sesión enfocada sin interrupciones de 45 minutos.'
      },
      'review-25': {
        title: 'Revisión técnica',
        durationMinutes: 25,
        priority: 'Media' as const,
        notes: 'Validar criterios de diseño, arquitectura y pruebas.'
      },
      'quick-15': {
        title: 'Seguimiento rápido',
        durationMinutes: 15,
        priority: 'Baja' as const,
        notes: 'Sincronización breve y actualización de estado.'
      }
    };

    const spec = presetMap[presetId];
    const created = this.taskService.saveTask(
      {
        title: spec.title,
        category,
        dateLabel: 'Hoy',
        dueBucket: 'Hoy',
        timeSlot: '',
        durationMinutes: spec.durationMinutes,
        priority: spec.priority,
        notes: spec.notes
      },
      null
    );

    this.announce(`Plantilla agregada a Hoy: ${created.title}.`);
    this.showToast(`Creada desde plantilla: ${created.title}`, false);
  }

  confirmClearCompleted(dlg: M3DialogComponent): void {
    const removed = this.taskService.clearCompletedTasks();
    dlg.dismiss('confirm');
    if (removed > 0) {
      this.announce(`Se limpiaron ${removed} actividades completadas.`);
      this.showToast(`Limpiadas: ${removed} actividades completadas`, false);
    }
  }

  onSelectTask(id: number): void {
    this.taskService.selectTask(id);
  }

  onToggleCompleted(id: number): void {
    const task = this.taskService.tasks().find(t => t.id === id);
    this.taskService.toggleCompleted(id);
    if (task) {
      const msg = task.completed
        ? `Actividad "${task.title}" reabierta`
        : `Actividad "${task.title}" completada`;
      this.announce(msg);
      this.showToast(msg, false);
    }
  }

  onDeleteTask(id: number): void {
    const removed = this.taskService.deleteTask(id);
    if (removed) {
      this.announce(`Actividad "${removed.title}" eliminada.`);
      this.showToast(`Eliminada: ${removed.title}`, true);
    }
  }

  onSnackbarUndo(): void {
    const restored = this.taskService.restoreLastDeleted();
    this.snackbarOpen.set(false);
    this.snackbarCanUndo.set(false);
    if (restored) {
      this.announce(`Actividad "${restored.title}" restaurada.`);
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
    this.showToast(`Añadida a Hoy: ${created.title}`, false);
  }

  onPatchTask(event: {
    id: number;
    patch: Parameters<TaskService['updateTaskFields']>[1];
  }): void {
    this.taskService.updateTaskFields(event.id, event.patch);
  }

  openNewTaskDialog(originKey: string | null = null): void {
    this.dialogService.openFrom('bento-center', originKey);
  }

  openTaskModal(task: TaskItem, originKey?: string): void {
    this.dialogService.openTaskCard(task, originKey ?? null);
  }

  resetFilters(): void {
    this.taskService.resetAllFilters();
    this.announce('Filtros de agenda restablecidos.');
  }

  showToast(message: string, canUndo: boolean): void {
    this.snackbarMessage.set(message);
    this.snackbarCanUndo.set(canUndo);
    this.snackbarOpen.set(false);
    queueMicrotask(() => this.snackbarOpen.set(true));
  }

  announce(message: string): void {
    this.localAnnouncement.set('');
    queueMicrotask(() => this.localAnnouncement.set(message));
  }
}
