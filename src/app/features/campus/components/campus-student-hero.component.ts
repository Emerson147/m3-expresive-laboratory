import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ClassScheduleItem } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { SUBJECT_CATEGORY_META } from './campus-ui.tokens';

@Component({
  selector: 'app-campus-student-hero',
  imports: [M3ButtonComponent, M3LinearProgressComponent],
  host: { class: 'block' },
  template: `
    @if (course(); as c) {
      <section
        aria-label="Sesión enfocada"
        class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="min-w-0 space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              @if (c.isActiveNow) {
                <span
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-m3-full bg-success-box text-on-success-box text-label-sm-emphasized"
                >
                  <span class="campus-live-dot bg-success" aria-hidden="true"></span>
                  En vivo ahora
                </span>
              } @else {
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-m3-full bg-surface text-muted text-label-sm-emphasized"
                >
                  <span class="material-symbols-rounded text-[14px]" aria-hidden="true">schedule</span>
                  Programado hoy
                </span>
              }

              <span
                [class]="'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-m3-full text-label-sm-emphasized font-mono ' + categoryMeta().badgeClass"
              >
                <span class="material-symbols-rounded text-[14px]" aria-hidden="true">
                  {{ categoryMeta().icon }}
                </span>
                {{ c.code }} · {{ categoryMeta().label }}
              </span>
            </div>

            <h2 class="text-title-lg-emphasized text-main tracking-tight leading-snug">
              {{ c.subject }}
            </h2>

            <p class="text-body-sm text-muted leading-relaxed">
              {{ c.syllabusTopic }}
            </p>
          </div>

          <div class="shrink-0">
            <m3-button
              id="campus-hero-classroom-btn"
              [variant]="c.isActiveNow ? 'filled' : 'tonal'"
              size="md"
              icon="videocam"
              [morph]="true"
              [invisible]="
                isDialogOpen() && activeDialogTrigger() === 'campus-hero-classroom-btn'
              "
              [viewTransitionName]="
                dialogMorphOwner() === 'trigger' && activeDialogTrigger() === 'campus-hero-classroom-btn'
                  ? 'dialog-transform'
                  : null
              "
              (action)="enterClassroom.emit('campus-hero-classroom-btn')"
            >
              {{ c.isActiveNow ? 'Ingresar a Clase' : 'Ver Portal' }}
            </m3-button>
          </div>
        </div>

        @if (c.isActiveNow) {
          <!-- Flat deterministic progress + 3 academic session milestones -->
          <div class="bg-surface rounded-m3-lg p-3.5 sm:p-4 space-y-3">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="text-label-md-emphasized text-main">
                Progreso de la sesión actual
              </span>
              <span class="text-label-md-emphasized font-mono tabular-nums text-primary">
                {{ c.progressPercent }}% completado
              </span>
            </div>

            <m3-linear-progress
              [value]="c.progressPercent"
              size="md"
              color="primary"
              [wavy]="false"
              [ariaLabel]="'Progreso de ' + c.subject"
            />

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5" aria-label="Fases de la sesión">
              @for (stage of sessionMilestones(); track stage.id) {
                <div
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-m3-md text-label-sm-emphasized transition-colors"
                  [class.bg-primary-box]="stage.state === 'current'"
                  [class.text-on-primary-box]="stage.state === 'current'"
                  [class.bg-surface-low]="stage.state !== 'current'"
                  [class.text-main]="stage.state === 'done'"
                  [class.text-muted]="stage.state === 'upcoming'"
                >
                  <span
                    class="w-2 h-2 rounded-m3-full shrink-0"
                    [class.bg-success]="stage.state === 'done'"
                    [class.bg-primary]="stage.state === 'current'"
                    [class.bg-surface-high]="stage.state === 'upcoming'"
                    aria-hidden="true"
                  ></span>
                  <span class="truncate">{{ stage.label }}</span>
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Scheduled session readiness strip (omits dead 0% progress bar) -->
          <div
            data-testid="campus-scheduled-readiness"
            class="bg-surface rounded-m3-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-9 h-9 rounded-m3-md bg-surface-low text-primary flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <span class="material-symbols-rounded text-[20px]">event_upcoming</span>
              </span>
              <div class="min-w-0">
                <p class="text-label-md-emphasized text-main">
                  Próximo bloque programado
                </p>
                <p class="text-body-sm text-muted truncate">
                  Inicio a las {{ c.timeRange }} · {{ c.room }}
                </p>
              </div>
            </div>

            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-m3-full bg-surface-low text-main text-label-sm-emphasized self-start sm:self-center shrink-0"
            >
              <span class="material-symbols-rounded text-[15px] text-success" aria-hidden="true">
                check_circle
              </span>
              Sala y temario listos
            </span>
          </div>
        }

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-surface rounded-m3-lg px-3.5 py-3">
            <p class="text-label-sm text-muted uppercase tracking-wider">
              Docente
            </p>
            <p class="text-title-sm-emphasized text-main truncate mt-1">
              {{ c.teacherName }}
            </p>
          </div>
          <div class="bg-surface rounded-m3-lg px-3.5 py-3">
            <p class="text-label-sm text-muted uppercase tracking-wider">
              Ambiente
            </p>
            <p class="text-title-sm-emphasized text-main truncate mt-1">
              {{ c.room }}
            </p>
          </div>
          <div class="bg-surface rounded-m3-lg px-3.5 py-3">
            <p class="text-label-sm text-muted uppercase tracking-wider">
              Horario
            </p>
            <p class="text-title-sm-emphasized font-mono tabular-nums text-main mt-1">
              {{ c.timeRange }}
            </p>
          </div>
          <div class="bg-surface rounded-m3-lg px-3.5 py-3">
            <p class="text-label-sm text-muted uppercase tracking-wider">
              Recursos listos
            </p>
            <p class="text-title-sm-emphasized font-mono tabular-nums text-main mt-1">
              {{ completedResourcesLabel() }}
            </p>
          </div>
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusStudentHeroComponent {
  readonly course = input.required<ClassScheduleItem>();
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);
  readonly dialogMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly enterClassroom = output<string>();

  protected readonly categoryMeta = computed(
    () => SUBJECT_CATEGORY_META[this.course().category]
  );

  protected readonly completedResourcesLabel = computed(() => {
    const resources = this.course().resources ?? [];
    if (resources.length === 0) {
      return this.course().remainingMinutes > 0 ? `${this.course().remainingMinutes} min` : 'Sin archivos';
    }
    const done = resources.filter((r) => Boolean(r.completed)).length;
    return `${done} / ${resources.length} archivos`;
  });

  protected readonly sessionMilestones = computed(() => {
    const pct = this.course().progressPercent;
    const stages = [
      { id: 'opening', label: 'Apertura', min: 0, nextMin: 35 },
      { id: 'development', label: 'Desarrollo', min: 35, nextMin: 80 },
      { id: 'closing', label: 'Cierre', min: 80, nextMin: 101 }
    ];
    return stages.map((stage) => {
      const state: 'done' | 'current' | 'upcoming' =
        pct >= stage.nextMin ? 'done' : pct >= stage.min ? 'current' : 'upcoming';
      return { id: stage.id, label: stage.label, state };
    });
  });
}
