import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RosterFilter } from '../../../core/campus/campus.models';

export interface TeacherRosterSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  atRisk: number;
}

interface KpiFilterChip {
  filter: RosterFilter;
  label: string;
  count: number;
  icon: string;
  iconBoxClass: string;
  activeClass: string;
}

@Component({
  selector: 'app-campus-teacher-kpi-ribbon',
  host: { class: 'block shrink-0' },
  template: `
    <section
      aria-label="Resumen interactivo de asistencia"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4"
    >
      @for (chip of chips(); track chip.filter) {
        @let active = activeFilter() === chip.filter;

        <button
          type="button"
          (click)="filterChange.emit(chip.filter)"
          [attr.aria-pressed]="active"
          class="campus-kpi-btn rounded-m3-xl px-5 py-4 text-left flex flex-col justify-between gap-3 cursor-pointer"
          [class]="
            active
              ? chip.activeClass
              : 'bg-surface-low hover:bg-surface-box text-main'
          "
        >
          <div class="flex items-center justify-between gap-2 w-full">
            <span
              class="text-label-md-emphasized uppercase tracking-wide"
              [class.text-muted]="!active"
            >
              {{ chip.label }}
            </span>

            <span
              class="w-8 h-8 rounded-m3-lg grid place-items-center shrink-0"
              [class]="active ? 'bg-surface/40 text-current' : chip.iconBoxClass"
              aria-hidden="true"
            >
              <span class="material-symbols-rounded text-lg">{{ chip.icon }}</span>
            </span>
          </div>

          <div class="flex items-baseline justify-between gap-2 w-full">
            <span class="text-headline-sm-emphasized font-mono tabular-nums leading-none">
              {{ chip.count }}
            </span>

            @if (active) {
              <span class="px-2 py-0.5 rounded-m3-full bg-surface/40 text-label-sm-emphasized">
                Filtro activo
              </span>
            }
          </div>
        </button>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusTeacherKpiRibbonComponent {
  readonly summary = input.required<TeacherRosterSummary>();
  readonly activeFilter = input.required<RosterFilter>();

  readonly filterChange = output<RosterFilter>();

  protected readonly chips = computed<KpiFilterChip[]>(() => {
    const s = this.summary();
    return [
      {
        filter: 'all',
        label: 'Total',
        count: s.total,
        icon: 'groups',
        iconBoxClass: 'bg-primary-box text-on-primary-box',
        activeClass: 'bg-primary-box text-on-primary-box'
      },
      {
        filter: 'present',
        label: 'Presentes',
        count: s.present,
        icon: 'check_circle',
        iconBoxClass: 'bg-success-box text-on-success-box',
        activeClass: 'bg-success-box text-on-success-box'
      },
      {
        filter: 'late',
        label: 'Tardanzas',
        count: s.late,
        icon: 'schedule',
        iconBoxClass: 'bg-warning-box text-on-warning-box',
        activeClass: 'bg-warning-box text-on-warning-box'
      },
      {
        filter: 'absent',
        label: 'Faltas',
        count: s.absent,
        icon: 'cancel',
        iconBoxClass: 'bg-error-box text-on-error-box',
        activeClass: 'bg-error-box text-on-error-box'
      },
      {
        filter: 'atRisk',
        label: 'En riesgo',
        count: s.atRisk,
        icon: 'warning',
        iconBoxClass: 'bg-tertiary-box text-on-tertiary-box',
        activeClass: 'bg-tertiary-box text-on-tertiary-box'
      }
    ];
  });
}
