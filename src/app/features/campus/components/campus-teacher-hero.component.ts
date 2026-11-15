import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TeacherClass } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { TeacherRosterSummary } from './campus-teacher-kpi-ribbon.component';

@Component({
  selector: 'app-campus-teacher-hero',
  imports: [M3ButtonComponent, M3LinearProgressComponent],
  host: { class: 'block' },
  template: `
    @if (teacherClass(); as cls) {
      @let q = quorum();
      <section
        aria-label="Cátedra en curso"
        class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="min-w-0 space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="inline-flex items-center gap-2 px-3 py-1 rounded-m3-full bg-success-box text-on-success-box text-label-sm-emphasized"
              >
                <span class="campus-live-dot bg-success" aria-hidden="true"></span>
                Cátedra activa
              </span>
              <span class="px-2.5 py-1 rounded-m3-full bg-surface text-muted text-label-sm-emphasized">
                {{ cls.room }}
              </span>
            </div>

            <h2 class="text-title-lg-emphasized text-main tracking-tight leading-snug">
              {{ cls.subject }}
            </h2>

            <p class="text-body-sm text-muted">
              Bloque horario {{ cls.timeRange }} · Registro sincrónico de aula
            </p>
          </div>

          <m3-button
            variant="filled"
            size="md"
            icon="done_all"
            (action)="markAllPresent.emit()"
          >
            Marcar Todos Presentes
          </m3-button>
        </div>

        <!-- Deterministic M3 flat progress with optional tardiness buffer -->
        <div class="bg-surface rounded-m3-lg p-3.5 sm:p-4 space-y-2.5">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-label-md-emphasized text-main">
              Quórum de asistencia en vivo
            </span>
            <span class="text-label-md-emphasized font-mono tabular-nums text-primary">
              {{ q.attendanceRate }}% ({{ q.present }} de {{ q.total }})
            </span>
          </div>

          <m3-linear-progress
            [value]="q.attendanceRate"
            [buffer]="q.bufferRate"
            size="lg"
            color="primary"
            [wavy]="false"
            [ariaLabel]="quorumAriaLabel()"
          />

          <p class="text-label-sm text-muted font-mono tabular-nums">
            {{ q.present }} presentes · {{ q.late }} tardanzas · {{ q.absent }} faltas
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-surface rounded-m3-lg px-4 py-3">
            <p class="text-label-sm text-muted uppercase tracking-wider">
              Matriculados
            </p>
            <p class="text-title-sm-emphasized font-mono tabular-nums text-main mt-1">
              {{ cls.enrolledCount }} estudiantes
            </p>
          </div>
          <div class="bg-surface rounded-m3-lg px-4 py-3">
            <p class="text-label-sm text-muted uppercase tracking-wider">
              Presentes hoy
            </p>
            <p class="text-title-sm-emphasized font-mono tabular-nums text-success mt-1">
              {{ cls.presentCount }} en sala
            </p>
          </div>
          <div class="bg-surface rounded-m3-lg px-4 py-3">
            <p class="text-label-sm text-muted uppercase tracking-wider">
              Pendientes de revisión
            </p>
            <p class="text-title-sm-emphasized font-mono tabular-nums text-main mt-1">
              {{ cls.pendingGradingCount }} entregas
            </p>
          </div>
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusTeacherHeroComponent {
  readonly teacherClass = input.required<TeacherClass>();
  readonly rosterSummary = input<TeacherRosterSummary | null>(null);

  readonly markAllPresent = output<void>();

  protected readonly quorum = computed(() => {
    const cls = this.teacherClass();
    const summary = this.rosterSummary();
    const total = summary ? summary.total : cls.enrolledCount;
    const present = summary ? summary.present : cls.presentCount;
    const late = summary ? summary.late : 0;
    const absent = summary ? summary.absent : Math.max(0, total - present - late);

    if (total <= 0) {
      return {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        attendanceRate: 0,
        bufferRate: null as number | null
      };
    }

    return {
      total,
      present,
      late,
      absent,
      attendanceRate: Math.round((present / total) * 100),
      bufferRate: late > 0 ? Math.min(100, Math.round(((present + late) / total) * 100)) : null
    };
  });

  protected readonly quorumAriaLabel = computed(() => {
    const q = this.quorum();
    return `Quórum de asistencia en vivo: ${q.present} presentes, ${q.late} tardanzas, ${q.absent} faltas de ${q.total} estudiantes`;
  });
}
