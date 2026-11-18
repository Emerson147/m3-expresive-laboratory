import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../../core/dialog/dialog.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { FilterStatus, TaskDraft, TaskItem, TaskService } from '../../core/tasks/task.service';
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
import { AgendaFocusDockComponent } from './components/agenda-focus-dock.component';
import { AgendaFocusTheaterDialogComponent } from './components/agenda-focus-theater-dialog.component';
import { AgendaInspectorPaneComponent } from './components/agenda-inspector-pane.component';
import { AgendaKpiQuickFilter, AgendaKpiRibbonComponent } from './components/agenda-kpi-ribbon.component';
import { AgendaTaskFormDialogComponent } from './components/agenda-task-form-dialog.component';
import { AgendaTaskListComponent } from './components/agenda-task-list.component';

type AgendaMobileTab = 'list' | 'inspector';
export type TaskFormMorphOrigin =
  | 'create-split'
  | 'mobile-fab'
  | 'inspector-modal'
  | `card-${number}`;
type TaskFormMorphTarget = TaskFormMorphOrigin | 'dialog';
type FocusMorphOwner = 'dock' | 'theater';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [AGENDA_EXPRESSIVE_CSS],
  imports: [
    NgTemplateOutlet,
    M3ButtonComponent,
    M3DialogComponent,
    M3FabComponent,
    M3SnackbarComponent,
    M3TabsComponent,
    AgendaKpiRibbonComponent,
    AgendaFiltersBarComponent,
    AgendaFocusDockComponent,
    AgendaFocusTheaterDialogComponent,
    AgendaTaskFormDialogComponent,
    AgendaTaskListComponent,
    AgendaInspectorPaneComponent
  ],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <div class="agenda-workbench flex flex-col gap-5 lg:gap-6 w-full min-w-0">
      <!-- BANDA 1: PANORAMA COMPACTO Y FILTROS RÁPIDOS -->
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

      <!-- BANDA 2: BUSCADOR, SWITCH INMEDIATO Y CTA CON MORPH ORIGIN -->
      <app-agenda-filters-bar
        [searchQuery]="taskService.searchQuery()"
        [filterStatus]="taskService.filterStatus()"
        [categoryFilter]="taskService.categoryFilter()"
        [onlyToday]="taskService.onlyToday()"
        [totalCount]="taskService.tasks().length"
        [pendingCount]="taskService.pendingCount()"
        [completedCount]="taskService.completedCount()"
        [createViewTransitionName]="taskFormMorphTarget() === 'create-split' ? 'dialog-transform' : null"
        [hideCreateTrigger]="isOriginHidden('create-split')"
        (searchChange)="taskService.setSearchQuery($event)"
        (statusChange)="onStatusChange($event)"
        (categoryChange)="taskService.setCategoryFilter($event)"
        (onlyTodayChange)="onOnlyTodayChange($event)"
        (requestClearCompleted)="clearDialogOpen.set(true)"
        (createTask)="openNewTaskDialog('create-split')"
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

      <!-- BANDA 3: COMPOSICIÓN ASIMÉTRICA LIST-DETAIL + POMODORO PROTAGONISTA (7 / 5) -->
      @let isMobileTabMode = adaptiveLayout.windowWidth() < 1024;
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-7 items-start">
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
            [activeEditOriginTaskId]="activeEditCardId()"
            [hiddenEditTaskId]="hiddenEditCardId()"
            (selectTask)="onSelectTask($event)"
            (toggleCompleted)="onToggleCompleted($event)"
            (editTask)="openTaskModal($event)"
            (deleteTask)="onDeleteTask($event)"
            (focusTask)="onQuickFocusTask($event)"
            (quickAdd)="onQuickAddTask($event)"
            (resetFilters)="resetFilters()"
            (createTask)="openNewTaskDialog(null)" />
        </div>

        <div
          id="agenda-panel-inspector"
          [attr.role]="isMobileTabMode ? 'tabpanel' : null"
          [attr.aria-labelledby]="isMobileTabMode ? 'agenda-mobile-tab-inspector' : null"
          [class]="(mobileTab() === 'inspector' ? 'block' : 'hidden') + ' lg:block lg:col-span-5 lg:sticky lg:top-4 min-w-0'">
          <aside aria-label="Enfoque y detalle de actividad" class="space-y-5">
            <!-- POMODORO PROTAGONISTA PERSISTENTE + MORPH CARD -> CARD EXPANDIDA (hero-transform) -->
            <app-agenda-focus-dock
              [focusedTask]="focusedTask()"
              [selectedTask]="taskService.selectedTask()"
              [viewTransitionName]="focusMorphOwner() === 'dock' ? 'hero-transform' : null"
              [isHiddenForMorph]="focusTheaterOpen()"
              (expandTheater)="openFocusTheater()"
              (focusRecorded)="showToast($event, false)"
              (selectFocusedTask)="onSelectTask($event)" />

            <!-- DETALLE, SUBTAREAS Y PLANIFICACIÓN -->
            <app-agenda-inspector-pane
              [task]="taskService.selectedTask()"
              [editViewTransitionName]="taskFormMorphTarget() === 'inspector-modal' ? 'dialog-transform' : null"
              [hideEditButton]="isOriginHidden('inspector-modal')"
              (toggleCompleted)="onToggleCompleted($event)"
              (openModalEdit)="openTaskModal($event, 'inspector-modal')"
              (patchTask)="onPatchTask($event)"
              (toggleSubtask)="taskService.toggleSubtask($event.taskId, $event.subtaskId)"
              (addSubtask)="taskService.addSubtask($event.taskId, $event.title)"
              (removeSubtask)="taskService.removeSubtask($event.taskId, $event.subtaskId)"
              (announceStatus)="announce($event)" />
          </aside>
        </div>
      </div>

      <!-- FAB MÓVIL DE SISTEMA PARA CREAR SIN SUBIR ARRIBA (< md) -->
      <div
        class="md:hidden fixed right-4 z-30"
        [class]="mobileFabBottomClass()">
        <m3-fab
          icon="add"
          size="md"
          variant="primary"
          ariaLabel="Nueva actividad en Agenda"
          [invisible]="isOriginHidden('mobile-fab')"
          [viewTransitionName]="taskFormMorphTarget() === 'mobile-fab' ? 'dialog-transform' : null"
          (action)="openNewTaskDialog('mobile-fab')" />
      </div>

      <!-- MODO ENFOQUE INMERSIVO (CARD -> HERO CARD EXPANDIDA CON STAGE RECESS vía hero-transform) -->
      <ng-template #focusTheaterTemplate>
        <app-agenda-focus-theater-dialog
          [open]="focusTheaterOpen()"
          [task]="focusedTask()"
          [viewTransitionName]="focusMorphOwner() === 'theater' ? 'hero-transform' : null"
          (closeRequested)="closeFocusTheater()"
          (toggleSubtask)="taskService.toggleSubtask($event.taskId, $event.subtaskId)"
          (focusRecorded)="showToast($event, false)" />
      </ng-template>

      @if (!stageOverlay.hasExternalHost()) {
        <ng-container [ngTemplateOutlet]="focusTheaterTemplate" />
      }

      <!-- FORMULARIO LOCAL DEL MÓDULO CON MORPH VIAJERO DESDE SU DISPARADOR -->
      <app-agenda-task-form-dialog
        [(open)]="taskFormOpen"
        [editingTask]="editingTask()"
        [managedClose]="taskFormLastOrigin() !== null && stageOverlay.hasViewTransitions()"
        [viewTransitionName]="taskFormMorphTarget() === 'dialog' ? 'dialog-transform' : null"
        (closeRequested)="closeTaskFormWithMorph()"
        (saveTask)="onSaveTaskForm($event)"
        (deleteTask)="onDeleteFromForm($event)" />

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
  readonly stageOverlay = inject(StageOverlayService);
  readonly focusService = inject(AgendaFocusService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly router = inject(Router, { optional: true });

  private readonly focusTheaterTemplate = viewChild<TemplateRef<unknown>>('focusTheaterTemplate');
  private returnFocusEl: HTMLElement | null = null;

  readonly mobileTab = signal<AgendaMobileTab>('list');
  readonly clearDialogOpen = signal<boolean>(false);
  readonly taskFormOpen = signal<boolean>(false);
  readonly editingTask = signal<TaskItem | null>(null);
  readonly focusTheaterOpen = signal<boolean>(false);
  readonly focusMorphOwner = signal<FocusMorphOwner | null>(null);
  readonly taskFormMorphTarget = signal<TaskFormMorphTarget | null>(null);
  readonly taskFormLastOrigin = signal<TaskFormMorphOrigin | null>(null);

  readonly localAnnouncement = signal<string>('');
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');
  readonly snackbarCanUndo = signal<boolean>(false);

  readonly focusedTask = computed<TaskItem | null>(() => {
    const activeId = this.focusService.activeTaskId();
    if (activeId !== null) {
      const bound = this.taskService.tasks().find(t => t.id === activeId);
      if (bound) return bound;
    }
    return this.taskService.selectedTask();
  });

  readonly activeEditCardId = computed<number | null>(() => {
    const target = this.taskFormMorphTarget();
    return typeof target === 'string' && target.startsWith('card-') ? Number(target.slice(5)) : null;
  });

  readonly hiddenEditCardId = computed<number | null>(() => {
    const origin = this.taskFormLastOrigin();
    if (!this.taskFormOpen() || !origin?.startsWith('card-')) {
      return null;
    }
    return Number(origin.slice(5));
  });

  constructor() {
    effect(() => {
      const tpl = this.focusTheaterTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    this.destroyRef.onDestroy(() => {
      const tpl = this.focusTheaterTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });

    effect(() => {
      const selected = this.taskService.selectedTask();
      if (selected) {
        this.focusService.syncIdleWithTask(selected.id, selected.durationMinutes);
      }
    });

    this.route?.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        if (params.get('newTask') === '1') {
          this.openNewTaskDialog(null);
          if (this.router && this.route) {
            void this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { newTask: null },
              queryParamsHandling: 'merge',
              replaceUrl: true
            });
          }
        }
      });
  }

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

  isOriginHidden(origin: TaskFormMorphOrigin): boolean {
    return this.taskFormOpen() && this.taskFormLastOrigin() === origin;
  }

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

  onQuickFocusTask(task: TaskItem): void {
    const isRunningHere =
      this.focusService.activeTaskId() === task.id && this.focusService.status() === 'running';
    if (isRunningHere) {
      this.focusService.pause();
      return;
    }
    this.focusService.startTaskSession(task.id, task.durationMinutes, task.title);
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

  openFocusTheater(): void {
    if (
      !this.focusedTask() ||
      this.focusTheaterOpen() ||
      this.taskFormOpen() ||
      this.focusMorphOwner() !== null ||
      this.taskFormMorphTarget() !== null
    ) {
      return;
    }

    this.returnFocusEl = this.document.activeElement as HTMLElement | null;
    this.focusMorphOwner.set('dock');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.focusTheaterOpen.set(true);
        this.stageOverlay.setOverlayOpen(true);
        this.focusMorphOwner.set('theater');
      },
      () => {
        this.focusMorphOwner.set(null);
      },
      { rootClass: 'vt-hero' }
    );
  }

  closeFocusTheater(): void {
    if (!this.focusTheaterOpen()) return;

    this.focusMorphOwner.set('theater');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.focusTheaterOpen.set(false);
        this.stageOverlay.setOverlayOpen(false);
        this.focusMorphOwner.set('dock');
      },
      () => {
        this.focusMorphOwner.set(null);
        const returnTarget = this.returnFocusEl;
        this.returnFocusEl = null;
        if (returnTarget?.isConnected) {
          returnTarget.focus();
        }
      },
      { isExiting: true, rootClass: 'vt-hero' }
    );
  }

  openNewTaskDialog(origin: TaskFormMorphOrigin | null = null): void {
    this.openTaskForm(null, origin);
  }

  openTaskModal(task: TaskItem, origin?: TaskFormMorphOrigin): void {
    this.openTaskForm(task, origin ?? `card-${task.id}`);
  }

  private openTaskForm(task: TaskItem | null, origin: TaskFormMorphOrigin | null): void {
    if (
      this.taskFormOpen() ||
      this.focusTheaterOpen() ||
      this.taskFormMorphTarget() !== null ||
      this.focusMorphOwner() !== null
    ) {
      return;
    }

    if (!origin || !this.stageOverlay.hasViewTransitions()) {
      this.taskFormLastOrigin.set(null);
      this.editingTask.set(task);
      this.taskFormOpen.set(true);
      return;
    }

    this.taskFormLastOrigin.set(origin);
    this.taskFormMorphTarget.set(origin);
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.editingTask.set(task);
        this.taskFormOpen.set(true);
        this.taskFormMorphTarget.set('dialog');
      },
      () => {
        this.taskFormMorphTarget.set(null);
      }
    );
  }

  closeTaskFormWithMorph(): void {
    if (!this.taskFormOpen()) return;
    const origin = this.taskFormLastOrigin();

    if (!origin || !this.stageOverlay.hasViewTransitions()) {
      this.taskFormOpen.set(false);
      this.taskFormLastOrigin.set(null);
      this.taskFormMorphTarget.set(null);
      this.editingTask.set(null);
      return;
    }

    this.taskFormMorphTarget.set('dialog');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.taskFormOpen.set(false);
        this.taskFormMorphTarget.set(origin);
      },
      () => {
        this.taskFormMorphTarget.set(null);
        this.taskFormLastOrigin.set(null);
        this.editingTask.set(null);
      },
      { isExiting: true }
    );
  }

  onSaveTaskForm(draft: TaskDraft): void {
    const editingId = this.editingTask()?.id ?? null;
    const saved = this.taskService.saveTask(draft, editingId);
    const msg =
      editingId !== null
        ? `Actividad "${saved.title}" actualizada.`
        : `Actividad "${saved.title}" creada.`;
    this.announce(msg);
    this.showToast(msg, false);
    if (this.taskFormOpen()) {
      this.closeTaskFormWithMorph();
    } else {
      this.editingTask.set(null);
    }
  }

  onDeleteFromForm(id: number): void {
    // Drop deleted card morph origin so close does not target a removed node
    if (this.taskFormLastOrigin() === `card-${id}`) {
      this.taskFormLastOrigin.set(null);
    }
    if (this.taskFormOpen()) {
      this.closeTaskFormWithMorph();
    } else {
      this.editingTask.set(null);
    }
    this.onDeleteTask(id);
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
