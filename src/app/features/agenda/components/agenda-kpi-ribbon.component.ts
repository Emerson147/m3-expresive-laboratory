import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterStatus, TaskPriority } from '../../../core/tasks/task.service';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';

export type AgendaKpiQuickFilter = 'all' | 'pending' | 'high-priority' | 'completed';

@Component({
  selector: 'app-agenda-kpi-ribbon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3LinearProgressComponent],
  template: `
    <section class="bg-surface-low rounded-m3-xl p-5 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1 min-w-0">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <span class="material-symbols-rounded text-base" aria-hidden="true">wb_twilight</span>
            <span>Panorama del Día</span>
          </div>
          <h2 class="text-lg md:text-xl font-bold tracking-tight text-main">
            {{ completionRate() }}% completado · {{ pendingCount() }} bloques pendientes
          </h2>
          <p class="text-xs text-muted">
            {{ todayPendingCount() }} para hoy · Carga estimada de {{ totalPendingMinutes() }} min · {{ totalFocusSessions() }} sesiones de enfoque registradas
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <div class="px-3.5 py-2 rounded-m3-lg bg-surface-box text-right">
            <span class="block text-[11px] font-semibold uppercase tracking-wider text-muted">Progreso</span>
            <span class="text-xl font-extrabold font-mono text-primary">
              {{ completedCount() }}/{{ totalCount() }}
            </span>
          </div>
        </div>
      </div>

      <m3-linear-progress
        [wavy]="true"
        [value]="completionRate()"
        size="md"
        color="primary"
        ariaLabel="Avance general de actividades en Agenda" />

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1" role="group" aria-label="Filtros rápidos de estado">
        <button
          type="button"
          [attr.aria-pressed]="activeQuickFilter() === 'all'"
          (click)="quickFilter.emit('all')"
          [class]="activeQuickFilter() === 'all'
            ? 'bg-primary-box text-on-primary-box shadow-2xs'
            : 'bg-surface text-main hover:bg-surface-high'"
          class="agenda-kpi-btn focus-ring-m3 p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-[11px] font-semibold uppercase tracking-wider opacity-80">Total</span>
            <span class="block text-xl font-extrabold font-mono mt-0.5">{{ totalCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-md bg-surface-box/70 text-primary grid place-items-center shrink-0">
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
          class="agenda-kpi-btn focus-ring-m3 p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-[11px] font-semibold uppercase tracking-wider opacity-80">Pendientes</span>
            <span class="block text-xl font-extrabold font-mono mt-0.5">{{ pendingCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-md bg-sec-box text-on-sec-box grid place-items-center shrink-0">
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
          class="agenda-kpi-btn focus-ring-m3 p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-[11px] font-semibold uppercase tracking-wider opacity-80">Prioridad Alta</span>
            <span class="block text-xl font-extrabold font-mono mt-0.5">{{ highPriorityPendingCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-md bg-error-box text-on-error-box grid place-items-center shrink-0">
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
          class="agenda-kpi-btn focus-ring-m3 p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer">
          <span class="min-w-0">
            <span class="block text-[11px] font-semibold uppercase tracking-wider opacity-80">Completadas</span>
            <span class="block text-xl font-extrabold font-mono mt-0.5">{{ completedCount() }}</span>
          </span>
          <span class="w-9 h-9 rounded-m3-md bg-success-box text-on-success-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">task_alt</span>
          </span>
        </button>
      </div>
    </section>
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
