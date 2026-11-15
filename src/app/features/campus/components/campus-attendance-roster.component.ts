import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  AttendanceStatus,
  RosterFilter,
  StudentAttendanceRecord
} from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { ATTENDANCE_STATUS_META } from './campus-ui.tokens';

const STATUS_OPTIONS: readonly AttendanceStatus[] = ['present', 'late', 'absent'];

const FILTER_LABELS: Record<RosterFilter, string> = {
  all: 'Todos',
  present: 'Presentes',
  late: 'Tardanzas',
  absent: 'Faltas',
  atRisk: 'En riesgo'
};

@Component({
  selector: 'app-campus-attendance-roster',
  imports: [M3ButtonComponent, M3TextFieldComponent],
  host: { class: 'block' },
  template: `
    <section
      aria-labelledby="roster-heading"
      class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-4"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-lg">fact_check</span>
          </div>
          <div class="min-w-0">
            <h2 id="roster-heading" class="text-title-md-emphasized text-main tracking-tight">
              Lista de Asistencia en Vivo
            </h2>
            <p class="text-label-md text-muted truncate">
              Marca P (Presente), T (Tardanza) o F (Falta) por estudiante
            </p>
          </div>
        </div>

        <span class="px-3 py-1 rounded-m3-full bg-surface text-muted text-label-sm-emphasized font-mono tabular-nums shrink-0 self-start sm:self-auto">
          {{ roster().length }} visibles
        </span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1 min-w-0">
          <m3-text-field
            variant="filled"
            label="Buscar estudiante"
            placeholder="Nombre o código universitario..."
            icon="search"
            [clearable]="true"
            [value]="searchQuery()"
            (valueChange)="searchChange.emit($event)"
          />
        </div>

        @if (activeFilter() !== 'all' || searchQuery().trim().length > 0) {
          <div class="flex items-center gap-2 shrink-0">
            <span class="px-3 py-1.5 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized">
              {{ filterLabelFor(activeFilter()) }}
            </span>
            <m3-button variant="tonal" size="sm" icon="filter_alt_off" (action)="resetFilters.emit()">
              Limpiar
            </m3-button>
          </div>
        }
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-3.5"
        [class.vt-roster-active]="isTransitioning()"
      >
        @for (student of roster(); track student.id) {
          <article
            class="campus-roster-row campus-surface-tile bg-surface hover:bg-surface-high rounded-m3-lg p-4 flex items-center justify-between gap-3"
            [style.--roster-vt-name]="'campus-roster-' + student.id"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-m3-md bg-primary-box/70 text-on-primary-box grid place-items-center font-mono text-label-md-emphasized shrink-0"
                aria-hidden="true"
              >
                {{ initialsFor(student.studentName) }}
              </div>

              <div class="min-w-0 space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-label-sm font-mono text-muted tabular-nums">
                    {{ student.studentCode }}
                  </span>
                  @if (student.atRisk) {
                    <span class="px-2 py-0.5 rounded-m3-full bg-error-box text-on-error-box text-[10px] font-bold uppercase tracking-wider">
                      Riesgo
                    </span>
                  }
                </div>

                <h3 class="text-title-sm-emphasized text-main truncate">
                  {{ student.studentName }}
                </h3>

                <p class="text-label-sm text-muted font-mono tabular-nums">
                  Asistencia acumulada: {{ student.overallAttendance }}%
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-1.5 shrink-0"
              role="group"
              [attr.aria-label]="'Asistencia de ' + student.studentName"
            >
              @for (status of statusOptions; track status) {
                @let meta = statusMetaFor(status);
                @let selected = student.status === status;

                <button
                  type="button"
                  (click)="statusChange.emit({ studentId: student.id, status })"
                  [attr.aria-pressed]="selected"
                  [attr.aria-label]="meta.ariaLabel + ' a ' + student.studentName"
                  class="campus-att-btn rounded-m3-md px-2.5 text-label-md-emphasized cursor-pointer flex items-center justify-center"
                  [class]="
                    selected
                      ? meta.activeClass
                      : 'bg-surface-low text-muted hover:bg-surface-highest'
                  "
                >
                  {{ meta.code }}
                </button>
              }
            </div>
          </article>
        } @empty {
          <div class="md:col-span-2 rounded-m3-xl bg-surface p-6 text-center space-y-2.5">
            <span class="material-symbols-rounded text-3xl text-muted" aria-hidden="true">
              person_search
            </span>
            <p class="text-title-sm-emphasized text-main">Sin coincidencias en la nómina</p>
            <p class="text-body-sm text-muted">
              Ajusta tu búsqueda o limpia el filtro activo para ver todos los alumnos.
            </p>
            <div>
              <m3-button variant="tonal" size="sm" (action)="resetFilters.emit()">
                Mostrar toda la nómina
              </m3-button>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusAttendanceRosterComponent {
  readonly roster = input.required<StudentAttendanceRecord[]>();
  readonly activeFilter = input.required<RosterFilter>();
  readonly searchQuery = input.required<string>();
  readonly isTransitioning = input<boolean>(false);

  readonly searchChange = output<string>();
  readonly resetFilters = output<void>();
  readonly statusChange = output<{ studentId: string; status: AttendanceStatus }>();

  protected readonly statusOptions = STATUS_OPTIONS;

  protected statusMetaFor(status: AttendanceStatus) {
    return ATTENDANCE_STATUS_META[status];
  }

  protected filterLabelFor(filter: RosterFilter): string {
    return FILTER_LABELS[filter];
  }

  protected initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'ES';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
}
