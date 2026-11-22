import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StudentGradeMetric } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CircularProgressComponent } from '../../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';

@Component({
  selector: 'app-campus-metrics-card',
  imports: [M3ButtonComponent, M3CircularProgressComponent, M3LinearProgressComponent],
  host: { class: 'block shrink-0' },
  template: `
    <section
      aria-label="Indicadores académicos del estudiante"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      <!-- KPI 1: GPA & Simulator Action -->
      <article class="campus-kpi-card rounded-m3-xl bg-surface-low hover:bg-surface-box px-5 py-4 sm:py-5 flex flex-col justify-between gap-3">
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

        <div class="flex items-center justify-between gap-2 pt-0.5">
          <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized truncate">
            {{ metrics().classStanding }}
          </span>
          <m3-button
            id="campus-gpa-simulator-btn"
            variant="tonal"
            size="xs"
            icon="calculate"
            [morph]="true"
            [invisible]="isDialogOpen() && activeDialogTrigger() === 'campus-gpa-simulator-btn'"
            [viewTransitionName]="
              dialogMorphOwner() === 'trigger' && activeDialogTrigger() === 'campus-gpa-simulator-btn'
                ? 'dialog-transform'
                : null
            "
            ariaLabel="Abrir simulador de promedio ponderado"
            (action)="openSimulator.emit('campus-gpa-simulator-btn')"
          >
            Simular
          </m3-button>
        </div>
      </article>

      <!-- KPI 2: Attendance (flat circular progress) -->
      <article class="campus-kpi-card rounded-m3-xl bg-surface-low hover:bg-surface-box px-5 py-4 sm:py-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <p class="text-label-md-emphasized uppercase tracking-wide text-muted">
              Asistencia del ciclo
            </p>
            <p class="text-headline-sm-emphasized font-mono tabular-nums text-main">
              {{ metrics().attendanceRate }}%
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
        </div>

        <div class="flex items-center justify-between text-label-sm pt-0.5">
          <span class="text-success font-medium">Sin inasistencias críticas</span>
          <span class="font-mono text-muted">Mín. 70%</span>
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

        <div class="space-y-1.5">
          <m3-linear-progress
            [value]="creditProgress()"
            size="sm"
            color="primary"
            [wavy]="false"
            ariaLabel="Avance de créditos aprobados"
          />
          <div class="flex items-center justify-between text-label-sm text-muted">
            <span>Restantes para egreso</span>
            <span class="font-mono tabular-nums font-medium">{{ metrics().totalCredits - metrics().approvedCredits }} cr</span>
          </div>
        </div>
      </article>

      <!-- KPI 4: Pending Activity Radar -->
      <article class="campus-kpi-card rounded-m3-xl bg-surface-low hover:bg-surface-box px-5 py-4 sm:py-5 flex flex-col justify-between gap-3">
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

        <div class="flex items-center justify-between text-label-sm text-muted pt-0.5">
          <span>Avisos sin leer en tablero</span>
          <span class="font-mono tabular-nums font-semibold text-main">{{ unreadAnnouncements() }}</span>
        </div>
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
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);
  readonly dialogMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly openSimulator = output<string>();
}
