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
import { Router } from '@angular/router';
import { CampusService } from '../../core/campus/campus.service';
import { ClinicService } from '../../core/clinic/clinic.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { InventoryService } from '../../core/inventory/inventory.service';
import { KanbanService } from '../../core/kanban/kanban.service';
import { PosService } from '../../core/pos/pos.service';
import { TaskService } from '../../core/tasks/task.service';
import { TelemetryService } from '../../core/telemetry/telemetry.service';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { AgendaFocusService } from '../agenda/agenda-focus.service';
import { OVERVIEW_EXPRESSIVE_CSS } from './components/overview-expressive.styles';
import { OverviewHeroCardComponent } from './components/overview-hero-card.component';
import { OverviewHeroDetailComponent } from './components/overview-hero-detail.component';
import { OverviewLiveAgendaComponent } from './components/overview-live-agenda.component';
import { OverviewModulesGridComponent } from './components/overview-modules-grid.component';
import { OverviewQuickTaskDialogComponent } from './components/overview-quick-task-dialog.component';
import {
  ModulePulseCard,
  OverviewHeroMetric,
  OverviewHeroMorphOwner,
  OverviewHeroPresetId,
  OverviewModuleFilter,
  OverviewQuickTaskDraft,
  OverviewQuickTaskMorphTarget
} from './overview.models';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [OVERVIEW_EXPRESSIVE_CSS],
  imports: [
    NgTemplateOutlet,
    M3SnackbarComponent,
    OverviewHeroCardComponent,
    OverviewHeroDetailComponent,
    OverviewLiveAgendaComponent,
    OverviewModulesGridComponent,
    OverviewQuickTaskDialogComponent
  ],
  template: `
    <div class="space-y-5 pb-2">
      <!-- BANDA 1: HERO AURORA OPERATIVO (7 COLS) + AGENDA EN VIVO (5 COLS) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <app-overview-hero-card
          [completionRate]="taskService.completionRate()"
          [completedCount]="taskService.completedCount()"
          [pendingCount]="taskService.pendingCount()"
          [totalTasks]="taskService.tasks().length"
          [totalActiveAlerts]="totalActiveAlerts()"
          [modulesCount]="modulePulseCards().length"
          [metrics]="heroExecutiveMetrics()"
          [focusStatus]="focusService.status()"
          [focusTime]="focusService.formattedTime()"
          [focusLabel]="focusService.statusLabel()"
          [isHeroHidden]="heroDetailOpen()"
          [heroViewTransitionName]="heroMorphOwner() === 'card' ? 'hero-transform' : null"
          [isQuickTaskOriginHidden]="quickTaskOpen()"
          [quickTaskViewTransitionName]="quickTaskMorphTarget() === 'button' ? 'dialog-transform' : null"
          (openQuickTask)="openQuickTaskDialog()"
          (quickPreset)="onQuickPreset($event)"
          (openDetail)="openHeroDetail()" />

        <app-overview-live-agenda
          [tasks]="previewTasks()"
          [pendingCount]="taskService.pendingCount()"
          [focusStatus]="focusService.status()"
          [focusTime]="focusService.formattedTime()"
          [focusLabel]="focusService.statusLabel()"
          [focusTaskTitle]="activeFocusTaskTitle()"
          (toggleTask)="taskService.toggleCompleted($event)"
          (toggleFocusTimer)="toggleFocusTimer()" />
      </div>

      <!-- BANDA 2: PULSO MULTIDOMINIO (6 WORKBENCHES EN VIVO + M3 FILTER CHIPS) -->
      <app-overview-modules-grid
        [cards]="filteredModuleCards()"
        [activeFilter]="moduleFilter()"
        [totalCount]="modulePulseCards().length"
        [alertsModuleCount]="alertsModuleCount()"
        [stableModuleCount]="stableModuleCount()"
        (filterChange)="moduleFilter.set($event)" />
    </div>

    <!-- HERO DETAIL EXPANDIDO A PANTALLA COMPLETA (PORTAL STAGE OVERLAY vía hero-transform) -->
    <ng-template #heroDetailTemplate>
      <app-overview-hero-detail
        [open]="heroDetailOpen()"
        [viewTransitionName]="heroMorphOwner() === 'detail' ? 'hero-transform' : null"
        [completionRate]="taskService.completionRate()"
        [completedCount]="taskService.completedCount()"
        [pendingCount]="taskService.pendingCount()"
        [totalActiveAlerts]="totalActiveAlerts()"
        [moduleCards]="modulePulseCards()"
        [focusStatus]="focusService.status()"
        [focusTime]="focusService.formattedTime()"
        [focusLabel]="focusService.statusLabel()"
        [focusTaskTitle]="activeFocusTaskTitle()"
        (closeRequested)="closeHeroDetail()"
        (navigateModule)="navigateFromHero($event)" />
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="heroDetailTemplate" />
    }

    <!-- DIÁLOGO LOCAL DEL DASHBOARD CON MORPH VIAJERO (dialog-transform) -->
    <app-overview-quick-task-dialog
      [(open)]="quickTaskOpen"
      [managedClose]="stageOverlay.hasViewTransitions()"
      [viewTransitionName]="quickTaskMorphTarget() === 'dialog' ? 'dialog-transform' : null"
      (closeRequested)="closeQuickTaskDialog()"
      (saveTask)="onSaveQuickTask($event)" />

    <m3-snackbar
      [open]="snackbarOpen()"
      [message]="snackbarMessage()"
      (openChange)="snackbarOpen.set($event)" />
  `
})
export class OverviewComponent {
  readonly taskService = inject(TaskService);
  readonly focusService = inject(AgendaFocusService);
  readonly stageOverlay = inject(StageOverlayService);
  private readonly clinicService = inject(ClinicService);
  private readonly campusService = inject(CampusService);
  private readonly posService = inject(PosService);
  private readonly inventoryService = inject(InventoryService);
  private readonly kanbanService = inject(KanbanService);
  private readonly telemetryService = inject(TelemetryService);
  private readonly router = inject(Router, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly heroDetailTemplate = viewChild<TemplateRef<unknown>>('heroDetailTemplate');
  private returnFocusEl: HTMLElement | null = null;

  readonly moduleFilter = signal<OverviewModuleFilter>('all');
  readonly heroDetailOpen = signal<boolean>(false);
  readonly heroMorphOwner = signal<OverviewHeroMorphOwner | null>(null);
  readonly quickTaskOpen = signal<boolean>(false);
  readonly quickTaskMorphTarget = signal<OverviewQuickTaskMorphTarget | null>(null);
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');

  readonly previewTasks = computed(() => this.taskService.tasks().slice(0, 4));

  readonly activeFocusTaskTitle = computed<string | null>(() => {
    const activeId = this.focusService.activeTaskId();
    if (activeId === null) return null;
    return this.taskService.tasks().find(t => t.id === activeId)?.title ?? null;
  });

  readonly totalActiveAlerts = computed(() =>
    this.modulePulseCards().reduce((sum, card) => sum + card.alertCount, 0)
  );

  readonly heroExecutiveMetrics = computed<readonly OverviewHeroMetric[]>(() => {
    const totalModules = this.modulePulseCards().length;
    const stableCount = this.stableModuleCount();
    const posShift = this.posService.shiftInfo();
    const telemetry = this.telemetryService.kpiSummary();

    return [
      {
        label: 'Estaciones',
        value: `${stableCount}/${totalModules} OK`,
        caption: `${this.alertsModuleCount()} con atención`,
        icon: stableCount === totalModules ? 'verified' : 'monitoring',
        toneClass:
          stableCount === totalModules
            ? 'bg-success-box text-on-success-box'
            : 'bg-warning-box text-on-warning-box'
      },
      {
        label: 'Ventas POS',
        value: `${posShift.salesCountToday} tickets`,
        caption: posShift.sunatOnline ? 'SUNAT en línea' : posShift.status,
        icon: 'point_of_sale',
        toneClass: 'bg-tertiary-box text-on-tertiary-box'
      },
      {
        label: 'Flota Viva',
        value: `${telemetry.activeFleetCount}/${telemetry.totalFleetCount} en ruta`,
        caption: `${telemetry.slaRate}% SLA entrega`,
        icon: 'local_shipping',
        toneClass: 'bg-primary-box text-on-primary-box'
      }
    ];
  });

  readonly modulePulseCards = computed<readonly ModulePulseCard[]>(() => {
    const clinic = this.clinicService.kpiSummary();
    const clinicOccupancy = Math.round((clinic.occupiedBeds / Math.max(1, clinic.totalBeds)) * 100);
    const activeClass = this.campusService.activeClass();
    const pendingAssignments = this.campusService.pendingAssignmentsCount();
    const creditProgress = this.campusService.creditProgress();
    const posShift = this.posService.shiftInfo();
    const cartCount = this.posService.cartCount();
    const posProducts = this.posService.products();
    const posAvailablePercent = Math.round(
      (posProducts.filter(p => p.stock > 0).length / Math.max(1, posProducts.length)) * 100
    );
    const inventory = this.inventoryService.kpiSummary();
    const stockIssues = inventory.lowStockSkus + inventory.outOfStockSkus;
    const kanban = this.kanbanService.kpis();
    const telemetry = this.telemetryService.kpiSummary();

    return [
      {
        section: 'clinic',
        title: 'Clínica & Triaje',
        route: '/clinic',
        icon: 'local_hospital',
        iconBgClass: clinic.criticalCases > 0 ? 'bg-error-box text-on-error-box' : 'bg-primary-box text-on-primary-box',
        headline: `${clinic.totalActivePatients} en triaje`,
        detail: `Boxes ${clinic.occupiedBeds}/${clinic.totalBeds} · Shock ${clinic.shockTraumaOccupancy}`,
        statusLabel: clinic.criticalCases > 0 ? this.formatCount(clinic.criticalCases, 'crítico', 'críticos') : 'Estable',
        statusIcon: clinic.criticalCases > 0 ? 'emergency' : 'check_circle',
        statusTone: clinic.criticalCases > 0 ? 'error' : 'success',
        hasAlert: clinic.criticalCases > 0,
        alertCount: clinic.criticalCases,
        healthPercent: clinicOccupancy,
        healthLabel: 'Ocupación boxes',
        healthColor: clinic.criticalCases > 0 ? 'error' : 'primary'
      },
      {
        section: 'campus',
        title: 'Campus',
        route: '/campus',
        icon: 'school',
        iconBgClass: 'bg-primary-box text-on-primary-box',
        headline: activeClass.code,
        detail: `${activeClass.subject} · ${activeClass.timeRange}`,
        statusLabel: pendingAssignments > 0 ? this.formatCount(pendingAssignments, 'entrega', 'entregas') : 'Al día',
        statusIcon: pendingAssignments > 0 ? 'assignment_late' : 'task_alt',
        statusTone: pendingAssignments > 0 ? 'warning' : 'primary',
        hasAlert: pendingAssignments > 0,
        alertCount: pendingAssignments,
        healthPercent: Math.round(creditProgress.percent),
        healthLabel: 'Avance curricular',
        healthColor: 'primary'
      },
      {
        section: 'pos',
        title: 'Punto de Venta',
        route: '/pos',
        icon: 'point_of_sale',
        iconBgClass: 'bg-tertiary-box text-on-tertiary-box',
        headline: `${posShift.salesCountToday} tickets`,
        detail: `${posShift.register} · ${posShift.shift} · ${cartCount} en carrito`,
        statusLabel: posShift.sunatOnline ? 'SUNAT OK' : posShift.status,
        statusIcon: posShift.sunatOnline ? 'verified' : 'warning',
        statusTone: posShift.sunatOnline ? 'success' : 'warning',
        hasAlert: !posShift.sunatOnline,
        alertCount: posShift.sunatOnline ? 0 : 1,
        healthPercent: posAvailablePercent,
        healthLabel: 'Disponibilidad carta',
        healthColor: 'tertiary'
      },
      {
        section: 'inventory',
        title: 'Inventario',
        route: '/inventory',
        icon: 'inventory_2',
        iconBgClass: 'bg-sec-box text-on-sec-box',
        headline: `${inventory.healthRate}% salud`,
        detail: `${inventory.totalUnits} uds · ${inventory.totalSkus} SKUs`,
        statusLabel: stockIssues > 0 ? this.formatCount(stockIssues, 'alerta', 'alertas') : 'Stock OK',
        statusIcon: stockIssues > 0 ? 'warning' : 'inventory',
        statusTone: stockIssues > 0 ? 'warning' : 'success',
        hasAlert: stockIssues > 0,
        alertCount: stockIssues,
        healthPercent: inventory.healthRate,
        healthLabel: 'Salud de stock',
        healthColor: stockIssues > 0 ? 'tertiary' : 'primary'
      },
      {
        section: 'kanban',
        title: 'Kanban KDS',
        route: '/kanban',
        icon: 'view_kanban',
        iconBgClass: kanban.slaBreachCount > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-primary-box text-on-primary-box',
        headline: `${kanban.totalActive} órdenes`,
        detail: `Prom. ${kanban.avgPrepTimeMin} min · ${kanban.readyCount} listas · ${kanban.throughputPerHour}/h`,
        statusLabel: kanban.slaBreachCount > 0 ? this.formatCount(kanban.slaBreachCount, 'demorada', 'demoradas') : 'En tiempo',
        statusIcon: kanban.slaBreachCount > 0 ? 'timer_off' : 'timer',
        statusTone: kanban.slaBreachCount > 0 ? 'error' : 'success',
        hasAlert: kanban.slaBreachCount > 0,
        alertCount: kanban.slaBreachCount,
        healthPercent: kanban.onTimeRatePercent,
        healthLabel: 'Cumplimiento SLA',
        healthColor: kanban.slaBreachCount > 0 ? 'error' : 'primary'
      },
      {
        section: 'telemetry',
        title: 'Telemetría Viva',
        route: '/telemetry',
        icon: 'sensors',
        iconBgClass: 'bg-tertiary-box text-on-tertiary-box',
        headline: `${telemetry.activeFleetCount}/${telemetry.totalFleetCount} en ruta`,
        detail: `${telemetry.averageSpeedKmh} km/h · Frío ${telemetry.coldChainAvgTempC}°C`,
        statusLabel: telemetry.delayedCount > 0 ? this.formatCount(telemetry.delayedCount, 'retraso', 'retrasos') : `${telemetry.slaRate}% SLA`,
        statusIcon: telemetry.delayedCount > 0 ? 'schedule' : 'route',
        statusTone: telemetry.delayedCount > 0 ? 'warning' : 'primary',
        hasAlert: telemetry.delayedCount > 0,
        alertCount: telemetry.delayedCount,
        healthPercent: telemetry.slaRate,
        healthLabel: 'SLA de flota',
        healthColor: telemetry.delayedCount > 0 ? 'tertiary' : 'primary'
      }
    ];
  });

  readonly alertsModuleCount = computed(
    () => this.modulePulseCards().filter(card => card.hasAlert).length
  );

  readonly stableModuleCount = computed(
    () => this.modulePulseCards().filter(card => !card.hasAlert).length
  );

  readonly filteredModuleCards = computed<readonly ModulePulseCard[]>(() => {
    const filter = this.moduleFilter();
    const cards = this.modulePulseCards();
    if (filter === 'alerts') return cards.filter(card => card.hasAlert);
    if (filter === 'stable') return cards.filter(card => !card.hasAlert);
    return cards;
  });

  constructor() {
    effect(() => {
      const tpl = this.heroDetailTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    this.destroyRef.onDestroy(() => {
      const tpl = this.heroDetailTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });
  }

  private isModalOrTransitionActive(): boolean {
    return (
      this.heroDetailOpen() ||
      this.quickTaskOpen() ||
      this.heroMorphOwner() !== null ||
      this.quickTaskMorphTarget() !== null
    );
  }

  openHeroDetail(): void {
    if (this.isModalOrTransitionActive()) {
      return;
    }

    this.returnFocusEl = this.document.activeElement as HTMLElement | null;
    this.heroMorphOwner.set('card');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.heroDetailOpen.set(true);
        this.stageOverlay.setOverlayOpen(true);
        this.heroMorphOwner.set('detail');
      },
      () => {
        this.heroMorphOwner.set(null);
      },
      { rootClass: 'vt-hero' }
    );
  }

  closeHeroDetail(): void {
    if (!this.heroDetailOpen()) return;

    this.heroMorphOwner.set('detail');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.heroDetailOpen.set(false);
        this.stageOverlay.setOverlayOpen(false);
        this.heroMorphOwner.set('card');
      },
      () => {
        this.heroMorphOwner.set(null);
        const target = this.returnFocusEl;
        this.returnFocusEl = null;
        if (target?.isConnected) {
          target.focus();
        }
      },
      { isExiting: true, rootClass: 'vt-hero' }
    );
  }

  navigateFromHero(route: string): void {
    this.returnFocusEl = null;
    this.heroDetailOpen.set(false);
    this.heroMorphOwner.set(null);
    this.stageOverlay.setOverlayOpen(false);
    if (this.router) {
      void this.router.navigateByUrl(route);
    }
  }

  openQuickTaskDialog(): void {
    if (this.isModalOrTransitionActive()) {
      return;
    }

    if (!this.stageOverlay.hasViewTransitions()) {
      this.quickTaskOpen.set(true);
      return;
    }

    this.quickTaskMorphTarget.set('button');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.quickTaskOpen.set(true);
        this.quickTaskMorphTarget.set('dialog');
      },
      () => {
        this.quickTaskMorphTarget.set(null);
      }
    );
  }

  closeQuickTaskDialog(): void {
    if (!this.quickTaskOpen()) return;

    if (!this.stageOverlay.hasViewTransitions()) {
      this.quickTaskOpen.set(false);
      this.quickTaskMorphTarget.set(null);
      return;
    }

    this.quickTaskMorphTarget.set('dialog');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.quickTaskOpen.set(false);
        this.quickTaskMorphTarget.set('button');
      },
      () => {
        this.quickTaskMorphTarget.set(null);
      },
      { isExiting: true }
    );
  }

  onQuickPreset(preset: OverviewHeroPresetId): void {
    const drafts: Record<OverviewHeroPresetId, OverviewQuickTaskDraft> = {
      'deep-work': {
        title: 'Bloque Deep Work de foco operativo',
        category: 'Frontend Angular',
        dueBucket: 'Hoy',
        priority: 'Alta'
      },
      triage: {
        title: 'Revisión de casos críticos en Clínica & Ops',
        category: 'Clínica & Ops',
        dueBucket: 'Hoy',
        priority: 'Alta'
      },
      stock: {
        title: 'Auditar reposición de SKUs y caja POS',
        category: 'Backend Spring',
        dueBucket: 'Hoy',
        priority: 'Media'
      },
      fleet: {
        title: 'Validar SLA de flota viva y órdenes KDS',
        category: 'Clínica & Ops',
        dueBucket: 'Mañana',
        priority: 'Media'
      }
    };

    const draft = drafts[preset];
    const created = this.taskService.saveTask(
      {
        title: draft.title,
        category: draft.category,
        dateLabel: draft.dueBucket,
        dueBucket: draft.dueBucket,
        timeSlot: '',
        durationMinutes: 25,
        priority: draft.priority,
        notes: 'Creada vía plantilla rápida del Dashboard'
      },
      null
    );

    this.announceSnackbar(`Plantilla agregada en ${draft.dueBucket}: ${created.title}`);
  }

  onSaveQuickTask(draft: OverviewQuickTaskDraft): void {
    const created = this.taskService.saveTask(
      {
        title: draft.title,
        category: draft.category,
        dateLabel: draft.dueBucket,
        dueBucket: draft.dueBucket,
        timeSlot: '',
        durationMinutes: 25,
        priority: draft.priority,
        notes: 'Creada desde Dashboard'
      },
      null
    );

    this.closeQuickTaskDialog();
    this.announceSnackbar(`Tarea creada en ${draft.dueBucket}: ${created.title}`);
  }

  private formatCount(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  private announceSnackbar(message: string): void {
    this.snackbarMessage.set(message);
    this.snackbarOpen.set(false);
    queueMicrotask(() => this.snackbarOpen.set(true));
  }

  toggleFocusTimer(): void {
    const status = this.focusService.status();
    if (status === 'running') {
      this.focusService.pause();
      return;
    }
    if (status === 'paused') {
      const taskId = this.focusService.activeTaskId() ?? this.previewTasks()[0]?.id;
      if (taskId !== undefined) {
        this.focusService.startOrResume(taskId, this.activeFocusTaskTitle() ?? undefined);
      }
    }
  }
}
