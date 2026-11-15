import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StudentGradeMetric } from '../../../core/campus/campus.models';
import { M3CircularProgressComponent } from '../../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';

@Component({
  selector: 'app-campus-metrics-card',
  imports: [M3CircularProgressComponent, M3LinearProgressComponent],
  host: { class: 'block shrink-0' },
  template: `
    <section
      aria-label="Indicadores académicos del estudiante"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <!-- KPI 1: GPA -->
      <article class="campus-kpi-card rounded-m3-xl bg-surface-low hover:bg-surface-box px-5 py-4 sm:py-5 flex flex-col justify-between gap-3.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-label-md-emphasized uppercase tracking-wide text-muted">
              Promedio ponderado
            </p>
            <div class="flex items-baseline gap-1.5 mt-1">
              <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
                {{ metrics().currentGpa.toFixed(1) }}
              </span>
              <span class="text-label-lg font-mono text-muted">/ 20</span>
            </div>
          </div>
          <span
            class="w-8 h-8 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-lg">military_tech</span>
          </span>
        </div>

        <div class="flex items-center justify-between gap-2">
          <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized">
            {{ metrics().classStanding }}
          </span>
          <span class="text-label-sm text-muted">Tendencia estable</span>
        </div>
      </article>

      <!-- KPI 2: Attendance (flat circular progress) -->
      <article class="campus-kpi-card rounded-m3-xl bg-surface-low hover:bg-surface-box px-5 py-4 sm:py-5 flex items-center justify-between gap-3.5">
        <div class="min-w-0 space-y-1">
          <p class="text-label-md-emphasized uppercase tracking-wide text-muted">
            Asistencia del ciclo
          </p>
          <p class="text-headline-sm-emphasized font-mono tabular-nums text-main">
            {{ metrics().attendanceRate }}%
          </p>
          <p class="text-label-sm text-success">
            Sin inasistencias críticas
          </p>
        </div>

        <div class="shrink-0 grid place-items-center">
          <m3-circular-progress
            [value]="metrics().attendanceRate"
            size="md"
            color="primary"
            [wavy]="false"
            ariaLabel="Porcentaje de asistencia del ciclo"
          />
        </div>
      </article>

      <!-- KPI 3: Credits Progress (flat linear progress) -->
      <article class="campus-kpi-card rounded-m3-xl bg-surface-low hover:bg-surface-box px-5 py-4 sm:py-5 flex flex-col justify-between gap-3">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-label-md-emphasized uppercase tracking-wide text-muted">
              Avance curricular
            </p>
            <p class="text-title-lg-emphasized font-mono tabular-nums text-main mt-1">
              {{ metrics().approvedCredits }} / {{ metrics().totalCredits }} cr
            </p>
          </div>
          <span class="text-label-md-emphasized font-mono text-primary tabular-nums">
            {{ creditProgress() }}%
          </span>
        </div>

        <m3-linear-progress
          [value]="creditProgress()"
          size="sm"
          color="primary"
          [wavy]="false"
          ariaLabel="Avance de créditos aprobados"
        />
      </article>

      <!-- KPI 4: Pending Activity Radar -->
      <article class="campus-kpi-card rounded-m3-xl bg-surface-low hover:bg-surface-box px-5 py-4 sm:py-5 flex flex-col justify-between gap-3.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-label-md-emphasized uppercase tracking-wide text-muted">
              Radar de actividad
            </p>
            <p class="text-title-lg-emphasized font-mono tabular-nums text-main mt-1">
              {{ pendingAssignments() }} {{ pendingAssignments() === 1 ? 'entrega' : 'entregas' }}
            </p>
          </div>
          <span
            class="w-8 h-8 rounded-m3-lg bg-sec-box text-on-sec-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-lg">assignment_turned_in</span>
          </span>
        </div>

        <p class="text-label-sm text-muted">
          {{ unreadAnnouncements() }} {{ unreadAnnouncements() === 1 ? 'aviso sin leer' : 'avisos sin leer' }} en tablero
        </p>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusMetricsCardComponent {
  readonly metrics = input.required<StudentGradeMetric>();
  readonly creditProgress = input.required<number>();
  readonly pendingAssignments = input<number>(0);
  readonly unreadAnnouncements = input<number>(0);
}
