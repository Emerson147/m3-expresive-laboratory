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
      surface="low"
      shape="xl"
      padding="md"
      [interactive]="false"
      customClass="agenda-kpi-ribbon rounded-m3-xl-inc space-y-3.5">
      <!-- FILA 1: RESUMEN EJECUTIVO COMPACTO + BARRA ONDULADA M3 EXPRESSIVE -->
      <div class="space-y-2.5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-start sm:items-center gap-3 min-w-0">
            <span class="w-9 h-9 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">wb_twilight</span>
            </span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <h2 class="text-title-md-emphasized text-main tabular-nums">
                  {{ completionRate() }}% completado · {{ pendingCount() }} pendientes
                </h2>
                <span class="text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Panorama del Día
                </span>
              </div>
              <p class="text-body-sm text-muted tabular-nums">
                {{ todayPendingCount() }} para hoy · {{ totalPendingMinutes() }} min estimados · {{ totalFocusSessions() }} bloques registrados
              </p>
            </div>
          </div>

          <div class="px-3.5 py-1.5 rounded-m3-md bg-surface-box inline-flex items-center gap-2 shrink-0 self-start md:self-center">
            <span class="text-label-sm uppercase tracking-wider text-muted">Progreso</span>
            <span class="text-title-md-emphasized text-primary tabular-nums">
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

      <!-- FILA 2: 4 SELECTORES KPI COMPACTOS CON MORPH DE ESQUINA -->
      <div
        class="grid grid-cols-2 lg:grid-cols-4 gap-2.5"
        role="group"
        aria-label="Filtros rápidos de estado">
        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'all'"
          (click)="quickFilter.emit('all')"
          [class]="activeQuickFilter() === 'all'
            ? 'bg-primary-box text-on-primary-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-3.5 py-2.5 text-left flex items-center justify-between gap-2.5 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Total</span>
            <span class="block text-title-md-emphasized tabular-nums leading-tight mt-0.5">{{ totalCount() }}</span>
          </span>
          <span class="w-8 h-8 rounded-m3-sm bg-surface-box/75 text-primary grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">view_agenda</span>
          </span>
        </button>

        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'pending'"
          (click)="quickFilter.emit('pending')"
          [class]="activeQuickFilter() === 'pending'
            ? 'bg-primary-box text-on-primary-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-3.5 py-2.5 text-left flex items-center justify-between gap-2.5 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Pendientes</span>
            <span class="block text-title-md-emphasized tabular-nums leading-tight mt-0.5">{{ pendingCount() }}</span>
          </span>
          <span class="w-8 h-8 rounded-m3-sm bg-sec-box text-on-sec-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">pending_actions</span>
          </span>
        </button>

        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'high-priority'"
          (click)="quickFilter.emit('high-priority')"
          [class]="activeQuickFilter() === 'high-priority'
            ? 'bg-error-box text-on-error-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-3.5 py-2.5 text-left flex items-center justify-between gap-2.5 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Prioridad Alta</span>
            <span class="block text-title-md-emphasized tabular-nums leading-tight mt-0.5">{{ highPriorityPendingCount() }}</span>
          </span>
          <span class="w-8 h-8 rounded-m3-sm bg-error-box text-on-error-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">priority_high</span>
          </span>
        </button>

        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'completed'"
          (click)="quickFilter.emit('completed')"
          [class]="activeQuickFilter() === 'completed'
            ? 'bg-success-box text-on-success-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 px-3.5 py-2.5 text-left flex items-center justify-between gap-2.5 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-label-sm uppercase tracking-wider opacity-85">Completadas</span>
            <span class="block text-title-md-emphasized tabular-nums leading-tight mt-0.5">{{ completedCount() }}</span>
          </span>
          <span class="w-8 h-8 rounded-m3-sm bg-success-box text-on-success-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">task_alt</span>
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
