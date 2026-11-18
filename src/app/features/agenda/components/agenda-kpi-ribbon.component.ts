import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterStatus, TaskPriority } from '../../../core/tasks/task.service';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';

export type AgendaKpiQuickFilter = 'all' | 'pending' | 'high-priority' | 'completed';

@Component({
  selector: 'app-agenda-kpi-ribbon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3CardComponent, M3LinearProgressComponent],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <m3-card
      variant="filled"
      shape="xl"
      padding="lg"
      [interactive]="false"
      customClass="!bg-surface-low rounded-m3-xl-inc space-y-5">
      <!-- FILA 1: RESUMEN EJECUTIVO AMPLIO + BARRA ONDULADA M3 EXPRESSIVE -->
      <div class="space-y-3.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 text-label-md-emphasized uppercase tracking-wider text-primary">
              <span class="material-symbols-rounded text-base" aria-hidden="true">wb_twilight</span>
              <span>Panorama del Día</span>
            </div>
            <h2 class="text-headline-sm-emphasized text-main tabular-nums">
              {{ completionRate() }}% completado · {{ pendingCount() }} bloques pendientes
            </h2>
            <p class="text-body-sm text-muted tabular-nums pt-0.5">
              {{ todayPendingCount() }} para hoy · {{ totalPendingMinutes() }} min estimados · {{ totalFocusSessions() }} bloques registrados
            </p>
          </div>

          <div class="px-4 py-2.5 rounded-m3-lg bg-surface-box text-right shrink-0 self-start sm:self-center">
            <span class="block text-label-sm uppercase tracking-wider text-muted">Progreso</span>
            <span class="text-title-lg-emphasized text-primary tabular-nums block mt-0.5">
              {{ completedCount() }}/{{ totalCount() }}
            </span>
          </div>
        </div>

        <m3-linear-progress
          [wavy]="true"
          [value]="completionRate()"
          size="md"
          color="primary"
          ariaLabel="Avance general de actividades en Agenda" />
      </div>

      <!-- FILA 2: 4 SELECTORES KPI CONCÉNTRICOS CON AIRE REAL -->
      <div
        class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1"
        role="group"
        aria-label="Filtros rápidos de estado">
        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'all'"
          (click)="quickFilter.emit('all')"
          [class]="activeQuickFilter() === 'all'
            ? 'bg-primary-box text-on-primary-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Total</span>
            <span class="block text-title-lg-emphasized tabular-nums mt-1">{{ totalCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-sm bg-surface-box/75 text-primary grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">view_agenda</span>
          </span>
        </button>

        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'pending'"
          (click)="quickFilter.emit('pending')"
          [class]="activeQuickFilter() === 'pending'
            ? 'bg-primary-box text-on-primary-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Pendientes</span>
            <span class="block text-title-lg-emphasized tabular-nums mt-1">{{ pendingCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-sm bg-sec-box text-on-sec-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">pending_actions</span>
          </span>
        </button>

        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'high-priority'"
          (click)="quickFilter.emit('high-priority')"
          [class]="activeQuickFilter() === 'high-priority'
            ? 'bg-error-box text-on-error-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Prioridad Alta</span>
            <span class="block text-title-lg-emphasized tabular-nums mt-1">{{ highPriorityPendingCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-sm bg-error-box text-on-error-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">priority_high</span>
          </span>
        </button>

        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'completed'"
          (click)="quickFilter.emit('completed')"
          [class]="activeQuickFilter() === 'completed'
            ? 'bg-success-box text-on-success-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Completadas</span>
            <span class="block text-title-lg-emphasized tabular-nums mt-1">{{ completedCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-sm bg-success-box text-on-success-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">task_alt</span>
          </span>
        </button>
      </div>
    </m3-card>
  `
})
export class AgendaKpiRibbonComponent {
  readonly totalCount = input.required<number>();
  readonly pendingCount = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly highPriorityPendingCount = input.required<number>();
  readonly todayPendingCount = input.required<number>();
  readonly totalPendingMinutes = input.required<number>();
  readonly totalFocusSessions = input.required<number>();
  readonly completionRate = input.required<number>();
  readonly filterStatus = input.required<FilterStatus>();
  readonly priorityFilter = input.required<TaskPriority | 'all'>();

  readonly quickFilter = output<AgendaKpiQuickFilter>();

  activeQuickFilter(): AgendaKpiQuickFilter {
    if (this.priorityFilter() === 'Alta' && this.filterStatus() === 'pending') {
      return 'high-priority';
    }
    if (this.filterStatus() === 'pending') return 'pending';
    if (this.filterStatus() === 'completed') return 'completed';
    return 'all';
  }
}
