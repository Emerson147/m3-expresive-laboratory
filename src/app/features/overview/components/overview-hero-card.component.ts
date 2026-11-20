import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FocusTimerStatus } from '../../agenda/agenda-focus.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { OverviewHeroMetric } from '../overview.models';

@Component({
  selector: 'app-overview-hero-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3ButtonComponent, M3CardComponent, M3LinearProgressComponent],
  host: {
    class: 'block min-w-0 lg:col-span-7'
  },
  template: `
    <section aria-labelledby="overview-hero-heading" class="h-full">
      <m3-card
        variant="filled"
        [interactive]="false"
        shape="xl"
        padding="lg"
        [invisible]="isHeroHidden()"
        [attr.aria-hidden]="isHeroHidden() ? 'true' : null"
        [viewTransitionName]="heroViewTransitionName()"
        customClass="!bg-surface-box hero-mesh-m3 m3-aurora-glow h-full min-w-0 flex flex-col justify-between gap-4 border border-transparent forced-colors:border-[CanvasText]">

      <div class="m3-aurora-layer" aria-hidden="true">
        <span class="m3-aurora-orb m3-aurora-orb-1"></span>
        <span class="m3-aurora-orb m3-aurora-orb-2"></span>
        <span class="m3-aurora-orb m3-aurora-orb-3"></span>
      </div>

      <div class="relative z-10 space-y-3.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 bg-primary-box text-on-primary-box rounded-full text-label-md-emphasized tracking-wide inline-flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm" aria-hidden="true">hub</span>
            Operación en Vivo
          </span>

          @let alerts = totalActiveAlerts();
          <span
            [class]="alerts > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-success-box text-on-success-box'"
            class="px-3 py-1 rounded-full text-label-md-emphasized inline-flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm" aria-hidden="true">
              {{ alerts > 0 ? 'notifications_active' : 'verified' }}
            </span>
            <span class="tabular-nums">
              {{ alerts > 0 ? alerts + ' alertas activas' : 'Sistema estable' }}
            </span>
          </span>

          <span class="px-3 py-1 bg-surface/80 backdrop-blur-md rounded-full text-label-md-emphasized text-primary tabular-nums">
            {{ completionRate() }}% tareas
          </span>

          @if (focusStatus() === 'running' || focusStatus() === 'paused') {
            <span class="px-3 py-1 bg-tertiary-box text-on-tertiary-box rounded-full text-label-md-emphasized inline-flex items-center gap-1.5 tabular-nums">
              <span class="material-symbols-rounded text-sm" aria-hidden="true">timer</span>
              <span>{{ focusTime() }} · {{ focusLabel() }}</span>
            </span>
          }
        </div>

        <div class="space-y-1">
          <h2 id="overview-hero-heading" class="text-headline-md md:text-headline-lg font-extrabold tracking-tight text-main">
            Pulso operativo del sistema
          </h2>
          <p class="text-body-md text-muted max-w-xl m-0">
            Supervisión reactiva sobre
            <strong class="text-main font-semibold tabular-nums">{{ pendingCount() }}</strong>
            pendientes de agenda y
            <strong class="text-main font-semibold tabular-nums">{{ modulesCount() }}</strong>
            estaciones operativas en tiempo real.
          </p>
        </div>

        <div class="space-y-1.5 max-w-xl">
          <div class="flex items-center justify-between text-label-md text-muted">
            <span>Avance de jornada</span>
            <span class="text-label-md-emphasized text-main tabular-nums">
              {{ completedCount() }} / {{ totalTasks() }} completadas
            </span>
          </div>
          <m3-linear-progress
            [value]="completionRate()"
            color="primary"
            [wavy]="true"
            size="md"
            ariaLabel="Avance general de tareas" />
        </div>
      </div>

      <!-- MINI BENTO DE PULSO EJECUTIVO (EVITA AIRE MUERTO Y DA SEÑAL REAL INMEDIATA) -->
      @if (metrics().length > 0) {
        <div class="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          @for (metric of metrics(); track metric.label) {
            <div class="overview-hero-kpi-tile bg-surface/80 backdrop-blur-md border border-outline-sub/60 px-3.5 py-2.5 flex items-center gap-2.5 min-w-0">
              <span
                [class]="metric.toneClass"
                class="overview-hero-kpi-icon w-8 h-8 rounded-m3-sm grid place-items-center shrink-0">
                <span class="material-symbols-rounded text-base" aria-hidden="true">{{ metric.icon }}</span>
              </span>
              <div class="min-w-0">
                <span class="block text-label-sm text-muted truncate">{{ metric.label }}</span>
                <span class="block text-title-sm font-extrabold text-main tabular-nums leading-tight truncate">
                  {{ metric.value }}
                </span>
                <span class="block text-label-sm text-muted truncate">{{ metric.caption }}</span>
              </div>
            </div>
          }
        </div>
      }

      <div class="relative z-10 pt-1 flex flex-wrap items-center justify-between gap-3">
        <m3-button
          id="trigger-overview-quick-task"
          variant="filled"
          size="md"
          icon="add"
          [invisible]="isQuickTaskOriginHidden()"
          [viewTransitionName]="quickTaskViewTransitionName()"
          (action)="openQuickTask.emit()">
          Nueva tarea
        </m3-button>

        <m3-button
          id="trigger-overview-hero-detail"
          variant="tonal"
          size="md"
          icon="open_in_full"
          (action)="openDetail.emit()">
          Ver desglose
        </m3-button>
      </div>
      </m3-card>
    </section>
  `
})
export class OverviewHeroCardComponent {
  readonly completionRate = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly pendingCount = input.required<number>();
  readonly totalTasks = input.required<number>();
  readonly totalActiveAlerts = input.required<number>();
  readonly modulesCount = input<number>(6);
  readonly metrics = input<readonly OverviewHeroMetric[]>([]);
  readonly focusStatus = input<FocusTimerStatus>('idle');
  readonly focusTime = input<string>('25:00');
  readonly focusLabel = input<string>('Listo');

  readonly isHeroHidden = input<boolean>(false);
  readonly heroViewTransitionName = input<string | null>(null);
  readonly isQuickTaskOriginHidden = input<boolean>(false);
  readonly quickTaskViewTransitionName = input<string | null>(null);

  readonly openQuickTask = output<void>();
  readonly openDetail = output<void>();
}
