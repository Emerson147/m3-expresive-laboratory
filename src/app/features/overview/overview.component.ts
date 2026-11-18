import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CampusService } from '../../core/campus/campus.service';
import { ClinicService } from '../../core/clinic/clinic.service';
import { DialogService } from '../../core/dialog/dialog.service';
import { InventoryService } from '../../core/inventory/inventory.service';
import { KanbanService } from '../../core/kanban/kanban.service';
import { PosService } from '../../core/pos/pos.service';
import {
  TASK_CATEGORIES,
  TASK_DUE_BUCKETS,
  TASK_PRIORITIES,
  TaskDueBucket,
  TaskPriority,
  TaskService
} from '../../core/tasks/task.service';
import { TelemetryService } from '../../core/telemetry/telemetry.service';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3DialogComponent } from '../../shared/components/dialog/dialog.component';
import { M3LinearProgressComponent } from '../../shared/components/progress';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TextFieldComponent } from '../../shared/components/text-field/text-field.component';

type PulseTone = 'primary' | 'success' | 'warning' | 'error';

interface ModulePulseCard {
  readonly section: string;
  readonly title: string;
  readonly route: string;
  readonly icon: string;
  readonly iconBgClass: string;
  readonly headline: string;
  readonly detail: string;
  readonly statusLabel: string;
  readonly statusIcon: string;
  readonly statusTone: PulseTone;
}

const PULSE_BADGE_CLASSES: Record<PulseTone, string> = {
  primary: 'bg-primary-box text-on-primary-box',
  success: 'bg-success-box text-on-success-box',
  warning: 'bg-warning-box text-on-warning-box',
  error: 'bg-error-box text-on-error-box'
};

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3DialogComponent,
    M3LinearProgressComponent,
    M3SnackbarComponent,
    M3TextFieldComponent
  ],
  template: `
    <div class="space-y-6">

      <!-- BANDA 1: HERO AURORA OPERATIVO (7 COLS) + AGENDA EN VIVO (5 COLS) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <!-- HERO CARD EXPANDIBLE CON AURORA GPU VIVA + CONTAINER TRANSFORM -->
        <section
          role="button"
          tabindex="0"
          [attr.aria-hidden]="dialogService.isHeroExpanded()"
          aria-label="Abrir vista detallada de métricas del sistema"
          (click)="dialogService.toggleHeroDetail(true)"
          (keydown.enter)="dialogService.toggleHeroDetail(true)"
          (keydown.space)="$event.preventDefault(); dialogService.toggleHeroDetail(true)"
          [class.invisible]="dialogService.isHeroExpanded()"
          [style.view-transition-name]="dialogService.activeTransition() === 'hero' && !dialogService.isHeroExpanded() ? 'hero-transform' : null"
          class="card-interactive hero-mesh-m3 m3-aurora-glow focus-ring-m3 lg:col-span-7 min-w-0 rounded-m3-xl p-6 md:p-8 flex flex-col justify-between min-h-[300px] shadow-xs cursor-pointer group border border-transparent forced-colors:border-[ButtonText]">

          <div class="m3-aurora-layer" aria-hidden="true">
            <span class="m3-aurora-orb m3-aurora-orb-1"></span>
            <span class="m3-aurora-orb m3-aurora-orb-2"></span>
            <span class="m3-aurora-orb m3-aurora-orb-3"></span>
          </div>

          <div class="space-y-4 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3.5 py-1.5 bg-primary-box text-on-primary-box rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">hub</span>
                Operación en Vivo
              </span>

              @let alerts = totalActiveAlerts();
              <span
                [class]="alerts > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-success-box text-on-success-box'"
                class="px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">
                  {{ alerts > 0 ? 'notifications_active' : 'verified' }}
                </span>
                {{ alerts > 0 ? alerts + ' alertas activas' : 'Sistema estable' }}
              </span>

              <span class="px-3 py-1.5 bg-surface/75 backdrop-blur-md rounded-full text-xs font-semibold text-primary font-mono">
                {{ taskService.completionRate() }}% tareas
              </span>
            </div>

            <div class="space-y-2 pt-1">
              <h2 class="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight text-main">
                Pulso operativo del sistema
              </h2>
              <p class="text-muted text-sm md:text-base leading-relaxed max-w-xl">
                Supervisión reactiva sobre {{ taskService.pendingCount() }} pendientes de agenda y 6 estaciones en tiempo real con señales Angular.
              </p>
            </div>

            <div class="pt-1 space-y-1.5 max-w-lg">
              <div class="flex items-center justify-between text-[11px] font-medium text-muted">
                <span>Avance de jornada</span>
                <span class="font-mono text-main font-semibold">
                  {{ taskService.completedCount() }} / {{ taskService.tasks().length }} completadas
                </span>
              </div>
              <m3-linear-progress
                [value]="taskService.completionRate()"
                color="primary"
                [wavy]="true"
                size="sm"
                ariaLabel="Avance general de tareas" />
            </div>
          </div>

          <div
            class="pt-6 flex flex-wrap items-center justify-between gap-3"
            (click)="$event.stopPropagation()"
            (keydown.enter)="$event.stopPropagation()"
            (keydown.space)="$event.stopPropagation()">
            <m3-button
              id="trigger-bento-center"
              variant="filled"
              size="md"
              icon="add"
              (action)="openQuickTaskDialog()">
              Nueva tarea
            </m3-button>

            <m3-button
              variant="tonal"
              size="sm"
              icon="open_in_full"
              (action)="dialogService.toggleHeroDetail(true)">
              Ver desglose
            </m3-button>
          </div>
        </section>

        <!-- FOCUS STACK: AGENDA ACCIONABLE EN VIVO (REEMPLAZA TARJETA DUPLICADA DE COLOR) -->
        <section
          aria-label="Agenda en vivo"
          style="animation-delay: 40ms;"
          class="m3-anim-item-in lg:col-span-5 min-w-0 bg-surface-low rounded-m3-xl p-6 flex flex-col justify-between gap-4 border border-transparent forced-colors:border-[CanvasText]">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <span class="material-symbols-rounded text-base" aria-hidden="true">event_upcoming</span>
                <span>Foco del Día</span>
              </div>
              <h3 class="text-xl font-bold text-main">Agenda en vivo</h3>
            </div>

            <a
              routerLink="/agenda"
              class="btn-m3 focus-ring-m3 h-8 px-3.5 rounded-full bg-sec-box text-on-sec-box text-xs font-semibold inline-flex items-center gap-1.5 no-underline shrink-0 cursor-pointer">
              <span>Ver Agenda</span>
              <span class="material-symbols-rounded text-base" aria-hidden="true">arrow_forward</span>
            </a>
          </div>

          <ul role="list" class="list-none m-0 p-0 space-y-2">
            @for (task of previewTasks(); track task.id) {
              <li>
                <button
                  type="button"
                  role="checkbox"
                  [attr.aria-checked]="task.completed"
                  (click)="taskService.toggleCompleted(task.id)"
                  [class]="task.completed
                    ? 'bg-surface/55 text-muted hover:bg-surface'
                    : 'bg-surface-box text-main hover:bg-surface-high shadow-2xs'"
                  class="btn-m3 w-full text-left px-3.5 py-2.5 rounded-m3-lg flex items-center justify-between gap-3 cursor-pointer border border-transparent forced-colors:border-[ButtonText]">
                  <span class="flex items-center gap-3 min-w-0">
                    <span
                      class="material-symbols-rounded text-xl shrink-0"
                      [class]="task.completed ? 'text-primary' : 'text-muted'"
                      aria-hidden="true">
                      {{ task.completed ? 'check_circle' : 'radio_button_unchecked' }}
                    </span>
                    <span class="min-w-0">
                      <span
                        [class.line-through]="task.completed"
                        [class.opacity-65]="task.completed"
                        class="block text-sm font-medium truncate">
                        {{ task.title }}
                      </span>
                      <span class="block text-[11px] text-muted truncate">
                        {{ task.category }} · {{ task.dateLabel }}
                      </span>
                    </span>
                  </span>

                  <span
                    [class]="priorityBadgeClass(task.priority, task.completed)"
                    class="px-2 py-0.5 rounded-m3-full text-[11px] font-semibold inline-flex items-center gap-1 shrink-0">
                    <span class="material-symbols-rounded text-xs" aria-hidden="true">
                      {{ task.completed ? 'done' : task.priority === 'Alta' ? 'priority_high' : 'flag' }}
                    </span>
                    <span>{{ task.completed ? 'Lista' : task.priority }}</span>
                  </span>
                </button>
              </li>
            }
          </ul>

          <div class="pt-1 flex items-center justify-between gap-2 text-xs text-muted">
            <span>Toca una actividad para actualizar la barra del Hero.</span>
            <span class="font-mono font-semibold text-main shrink-0">
              {{ taskService.pendingCount() }} pend.
            </span>
          </div>
        </section>
      </div>

      <!-- BANDA 2: PULSO MULTIDOMINIO (6 WORKBENCHES EN VIVO) -->
      <section aria-labelledby="overview-modules-heading" class="space-y-3.5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-0.5">
            <h3 id="overview-modules-heading" class="text-base font-bold tracking-tight text-main">
              Módulos en Vivo
            </h3>
            <p class="text-xs text-muted">
              Estado consolidado de tus 6 estaciones operativas con acceso directo.
            </p>
          </div>

          <a
            routerLink="/design-system/styles"
            class="btn-m3 px-3.5 py-1.5 rounded-m3-full bg-surface-low hover:bg-surface-high text-xs font-medium text-muted hover:text-main inline-flex items-center gap-1.5 no-underline cursor-pointer">
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">widgets</span>
            <span>Design System M3</span>
            <span class="material-symbols-rounded text-sm" aria-hidden="true">arrow_forward</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (card of modulePulseCards(); track card.section; let idx = $index) {
            <a
              [routerLink]="card.route"
              [style.animation-delay]="(idx * 35 + 80) + 'ms'"
              class="card-interactive m3-anim-item-in focus-ring-m3 bg-surface-low hover:bg-surface-container rounded-m3-xl p-5 no-underline flex flex-col justify-between gap-4 border border-transparent forced-colors:border-[LinkText]">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    [class]="card.iconBgClass"
                    class="w-10 h-10 rounded-m3-md grid place-items-center shrink-0">
                    <span class="material-symbols-rounded text-xl" aria-hidden="true">{{ card.icon }}</span>
                  </span>
                  <div class="min-w-0">
                    <div class="text-xs font-semibold text-muted uppercase tracking-wider truncate">
                      {{ card.title }}
                    </div>
                    <div class="text-xl font-extrabold text-main font-mono truncate">
                      {{ card.headline }}
                    </div>
                  </div>
                </div>

                <span
                  [class]="badgeClass(card.statusTone)"
                  class="px-2.5 py-1 rounded-m3-full text-[11px] font-semibold inline-flex items-center gap-1 shrink-0">
                  <span class="material-symbols-rounded text-xs" aria-hidden="true">{{ card.statusIcon }}</span>
                  <span>{{ card.statusLabel }}</span>
                </span>
              </div>

              <div class="flex items-center justify-between gap-2 text-xs text-muted pt-1">
                <span class="truncate">{{ card.detail }}</span>
                <span class="material-symbols-rounded text-base text-primary shrink-0" aria-hidden="true">
                  arrow_forward
                </span>
              </div>
            </a>
          }
        </div>
      </section>

    </div>

    <!-- DIÁLOGO LOCAL DEL DASHBOARD PARA CREACIÓN RÁPIDA DE TAREA (<m3-dialog variant="expressive">) -->
    <m3-dialog
      #quickTaskDlg
      variant="expressive"
      size="md"
      tone="primary"
      icon="add_task"
      headline="Nueva tarea rápida"
      subtitle="Registra un pendiente sin salir del panel ejecutivo."
      [(open)]="quickTaskOpen"
      (closed)="quickTaskError.set(null)">
      <form (ngSubmit)="submitQuickTask()" novalidate class="space-y-4">
        <m3-text-field
          #quickTitleField
          [id]="'overview-quick-title'"
          variant="filled"
          label="Título de la tarea"
          placeholder="Ej. Validar cierre de turno POS"
          icon="edit_note"
          [required]="true"
          [clearable]="true"
          [maxlength]="80"
          enterkeyhint="done"
          [errorText]="quickTaskError()"
          [value]="quickTitle()"
          (valueChange)="onQuickTitleChange($event)" />

        <fieldset class="space-y-1.5 border-0 p-0 m-0">
          <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
            Área
          </legend>
          <m3-button-group
            variant="standard"
            size="xs"
            ariaLabel="Área de la tarea"
            [options]="categoryOptions"
            [value]="[quickCategory()]"
            (selectionChange)="quickCategory.set($event[0] || quickCategory())" />
        </fieldset>

        <div class="bg-surface-low rounded-m3-lg p-4 space-y-3.5">
          <fieldset class="space-y-1.5 border-0 p-0 m-0">
            <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
              Bloque / Día
            </legend>
            <m3-button-group
              variant="connected"
              size="xs"
              ariaLabel="Horizonte de tarea"
              [options]="dueBucketOptions"
              [value]="[quickBucket()]"
              (selectionChange)="onBucketSelect($event)" />
          </fieldset>

          <fieldset class="space-y-1.5 border-0 p-0 m-0">
            <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
              Prioridad
            </legend>
            <m3-button-group
              variant="connected"
              size="xs"
              ariaLabel="Prioridad de tarea"
              [options]="priorityOptions"
              [value]="[quickPriority()]"
              (selectionChange)="onPrioritySelect($event)" />
          </fieldset>
        </div>
      </form>

      <div dialog-actions class="flex items-center gap-3">
        <m3-button type="button" variant="text" (action)="quickTaskDlg.dismiss('cancel')">
          Cancelar
        </m3-button>
        <m3-button type="button" variant="filled" icon="check" (action)="submitQuickTask()">
          Crear tarea
        </m3-button>
      </div>
    </m3-dialog>

    <m3-snackbar
      [open]="snackbarOpen()"
      [message]="snackbarMessage()"
      (openChange)="snackbarOpen.set($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  readonly taskService = inject(TaskService);
  readonly dialogService = inject(DialogService);
  private readonly clinicService = inject(ClinicService);
  private readonly campusService = inject(CampusService);
  private readonly posService = inject(PosService);
  private readonly inventoryService = inject(InventoryService);
  private readonly kanbanService = inject(KanbanService);
  private readonly telemetryService = inject(TelemetryService);
  private readonly quickTitleField = viewChild<M3TextFieldComponent>('quickTitleField');

  readonly quickTaskOpen = signal<boolean>(false);
  readonly quickTitle = signal<string>('');
  readonly quickCategory = signal<string>('Frontend Angular');
  readonly quickBucket = signal<TaskDueBucket>('Hoy');
  readonly quickPriority = signal<TaskPriority>('Alta');
  readonly quickTaskError = signal<string | null>(null);
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');

  readonly categoryOptions: M3ButtonGroupOption[] = TASK_CATEGORIES.map(c => ({
    id: c.name,
    label: c.name,
    icon: c.icon
  }));
  readonly dueBucketOptions: M3ButtonGroupOption[] = TASK_DUE_BUCKETS.map(b => ({ id: b, label: b }));
  readonly priorityOptions: M3ButtonGroupOption[] = TASK_PRIORITIES.map(p => ({
    id: p,
    label: p,
    icon: p === 'Alta' ? 'priority_high' : p === 'Media' ? 'flag' : 'low_priority'
  }));

  readonly previewTasks = computed(() => this.taskService.tasks().slice(0, 4));

  readonly totalActiveAlerts = computed(() => {
    const clinicAlerts = this.clinicService.kpiSummary().criticalCases;
    const invSummary = this.inventoryService.kpiSummary();
    const stockAlerts = invSummary.lowStockSkus + invSummary.outOfStockSkus > 0 ? 1 : 0;
    const kanbanAlerts = this.kanbanService.kpis().slaBreachCount;
    const fleetAlerts = this.telemetryService.kpiSummary().delayedCount;
    const campusAlerts = this.campusService.pendingAssignmentsCount();
    return clinicAlerts + stockAlerts + kanbanAlerts + fleetAlerts + campusAlerts;
  });

  readonly modulePulseCards = computed<readonly ModulePulseCard[]>(() => {
    const clinic = this.clinicService.kpiSummary();
    const activeClass = this.campusService.activeClass();
    const pendingAssignments = this.campusService.pendingAssignmentsCount();
    const creditProgress = this.campusService.creditProgress();
    const posShift = this.posService.shiftInfo();
    const cartCount = this.posService.cartCount();
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
        statusLabel: clinic.criticalCases > 0 ? `${clinic.criticalCases} críticos` : 'Estable',
        statusIcon: clinic.criticalCases > 0 ? 'emergency' : 'check_circle',
        statusTone: clinic.criticalCases > 0 ? 'error' : 'success'
      },
      {
        section: 'campus',
        title: 'Campus',
        route: '/campus',
        icon: 'school',
        iconBgClass: 'bg-primary-box text-on-primary-box',
        headline: activeClass.code,
        detail: `${activeClass.subject} · ${creditProgress.formattedPercent} avance`,
        statusLabel: pendingAssignments > 0 ? `${pendingAssignments} entregas` : 'Al día',
        statusIcon: pendingAssignments > 0 ? 'assignment_late' : 'task_alt',
        statusTone: pendingAssignments > 0 ? 'warning' : 'primary'
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
        statusIcon: 'verified',
        statusTone: 'success'
      },
      {
        section: 'inventory',
        title: 'Inventario',
        route: '/inventory',
        icon: 'inventory_2',
        iconBgClass: 'bg-sec-box text-on-sec-box',
        headline: `${inventory.healthRate}% salud`,
        detail: `${inventory.totalUnits} uds · ${inventory.totalSkus} SKUs`,
        statusLabel: stockIssues > 0 ? `${stockIssues} alertas` : 'Stock OK',
        statusIcon: stockIssues > 0 ? 'warning' : 'inventory',
        statusTone: stockIssues > 0 ? 'warning' : 'success'
      },
      {
        section: 'kanban',
        title: 'Kanban KDS',
        route: '/kanban',
        icon: 'view_kanban',
        iconBgClass: kanban.slaBreachCount > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-primary-box text-on-primary-box',
        headline: `${kanban.totalActive} órdenes`,
        detail: `Prom. ${kanban.avgPrepTimeMin} min · ${kanban.onTimeRatePercent}% SLA`,
        statusLabel: kanban.slaBreachCount > 0 ? `${kanban.slaBreachCount} demoradas` : 'En tiempo',
        statusIcon: kanban.slaBreachCount > 0 ? 'timer_off' : 'timer',
        statusTone: kanban.slaBreachCount > 0 ? 'error' : 'success'
      },
      {
        section: 'telemetry',
        title: 'Telemetría Viva',
        route: '/telemetry',
        icon: 'sensors',
        iconBgClass: 'bg-tertiary-box text-on-tertiary-box',
        headline: `${telemetry.activeFleetCount}/${telemetry.totalFleetCount} en ruta`,
        detail: `${telemetry.averageSpeedKmh} km/h · Frío ${telemetry.coldChainAvgTempC}°C`,
        statusLabel: telemetry.delayedCount > 0 ? `${telemetry.delayedCount} retrasos` : `${telemetry.slaRate}% SLA`,
        statusIcon: telemetry.delayedCount > 0 ? 'schedule' : 'route',
        statusTone: telemetry.delayedCount > 0 ? 'warning' : 'primary'
      }
    ];
  });

  badgeClass(tone: PulseTone): string {
    return PULSE_BADGE_CLASSES[tone];
  }

  priorityBadgeClass(priority: TaskPriority, completed: boolean): string {
    if (completed) return 'bg-surface-high text-muted';
    if (priority === 'Alta') return 'bg-error-box text-on-error-box';
    if (priority === 'Media') return 'bg-warning-box text-on-warning-box';
    return 'bg-surface-high text-muted';
  }

  openQuickTaskDialog(): void {
    this.quickTitle.set('');
    this.quickCategory.set('Frontend Angular');
    this.quickBucket.set('Hoy');
    this.quickPriority.set('Alta');
    this.quickTaskError.set(null);
    this.quickTaskOpen.set(true);
  }

  onQuickTitleChange(value: string): void {
    this.quickTitle.set(value);
    if (this.quickTaskError() && value.trim()) {
      this.quickTaskError.set(null);
    }
  }

  onBucketSelect(selected: string[]): void {
    const bucket = selected[0] as TaskDueBucket | undefined;
    if (bucket) this.quickBucket.set(bucket);
  }

  onPrioritySelect(selected: string[]): void {
    const prio = selected[0] as TaskPriority | undefined;
    if (prio) this.quickPriority.set(prio);
  }

  submitQuickTask(): void {
    const title = this.quickTitle().trim();
    if (!title) {
      this.quickTaskError.set('Ingresa un título para registrar la tarea.');
      this.quickTitleField()?.focus();
      return;
    }

    const bucket = this.quickBucket();
    const created = this.taskService.saveTask(
      {
        title,
        category: this.quickCategory(),
        dateLabel: bucket,
        dueBucket: bucket,
        timeSlot: '',
        durationMinutes: 25,
        priority: this.quickPriority(),
        notes: 'Creada desde Dashboard'
      },
      null
    );

    this.quickTaskOpen.set(false);
    this.snackbarMessage.set(`Tarea creada en ${bucket}: ${created.title}`);
    this.snackbarOpen.set(false);
    queueMicrotask(() => this.snackbarOpen.set(true));
  }
}
