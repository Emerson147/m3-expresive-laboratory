import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import { ThemeService } from '../../../core/theme/theme.service';
import { FocusTimerStatus } from '../../agenda/agenda-focus.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { ModulePulseCard, moduleBadgeClass } from '../overview.models';

@Component({
  selector: 'app-overview-hero-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3ButtonComponent, M3CardComponent, M3LinearProgressComponent],
  host: {
    class: 'contents',
    '(document:keydown.escape)': 'onEscapeKey()'
  },
  template: `
    @if (open()) {
      <div
        (click)="closeRequested.emit()"
        [class.m3-dialog-backdrop]="!themeService.hasViewTransitions()"
        class="fixed inset-0 z-40"></div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="overview-hero-detail-title"
        [style.view-transition-name]="viewTransitionName()"
        [class.shadow-2xl]="!viewTransitionName()"
        [class.m3-container-enter]="!themeService.hasViewTransitions()"
        class="fixed inset-4 md:inset-10 !bg-surface-box hero-mesh-m3 m3-aurora-glow border border-outline-sub rounded-m3-xl z-50 overflow-hidden">

        <div class="m3-aurora-layer" aria-hidden="true">
          <span class="m3-aurora-orb m3-aurora-orb-1"></span>
          <span class="m3-aurora-orb m3-aurora-orb-2"></span>
          <span class="m3-aurora-orb m3-aurora-orb-3"></span>
        </div>

        <div class="relative z-10 h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between gap-6">
          <!-- TOP HEADER BAR -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <m3-button
                [iconOnly]="true"
                variant="tonal"
                icon="close"
                ariaLabel="Cerrar desglose del sistema"
                (action)="closeRequested.emit()" />
              <span class="px-3.5 py-1.5 rounded-full bg-primary-box text-on-primary-box text-label-md-emphasized inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">hub</span>
                Desglose Ejecutivo
              </span>
            </div>

            @let alerts = totalActiveAlerts();
            <span
              [class]="alerts > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-success-box text-on-success-box'"
              class="px-3.5 py-1.5 rounded-full text-label-md-emphasized inline-flex items-center gap-1.5 tabular-nums">
              <span class="material-symbols-rounded text-sm" aria-hidden="true">
                {{ alerts > 0 ? 'notifications_active' : 'verified' }}
              </span>
              {{ alerts > 0 ? alerts + ' alertas activas en módulos' : 'Todas las estaciones estables' }}
            </span>
          </div>

          <!-- MAIN 2-COLUMN EXECUTIVE BREAKDOWN -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-auto">
            <!-- LEFT: AGENDA PROGRESS + KPIs + ACTIVE POMODORO -->
            <div class="lg:col-span-5 space-y-5">
              <div class="space-y-3">
                <span class="text-label-md-emphasized uppercase tracking-widest text-muted">
                  Progreso de Jornada
                </span>
                <h2
                  #modalHeading
                  id="overview-hero-detail-title"
                  tabindex="-1"
                  class="text-display-sm md:text-display-md font-extrabold tracking-tight text-main tabular-nums outline-none">
                  {{ completionRate() }}% Completado
                </h2>
                <m3-linear-progress
                  [value]="completionRate()"
                  color="primary"
                  size="lg"
                  [wavy]="true"
                  ariaLabel="Progreso total de tareas" />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <m3-card variant="outlined" padding="sm" shape="lg" customClass="!bg-surface/80 backdrop-blur-md">
                  <span class="text-label-sm text-muted block">Finalizadas</span>
                  <div class="text-headline-sm font-extrabold text-primary tabular-nums mt-1">
                    {{ completedCount() }}
                  </div>
                </m3-card>
                <m3-card variant="outlined" padding="sm" shape="lg" customClass="!bg-surface/80 backdrop-blur-md">
                  <span class="text-label-sm text-muted block">Pendientes</span>
                  <div class="text-headline-sm font-extrabold text-main tabular-nums mt-1">
                    {{ pendingCount() }}
                  </div>
                </m3-card>
                <m3-card variant="outlined" padding="sm" shape="lg" customClass="!bg-surface/80 backdrop-blur-md">
                  <span class="text-label-sm text-muted block">Alertas</span>
                  <div
                    class="text-headline-sm font-extrabold tabular-nums mt-1"
                    [class]="totalActiveAlerts() > 0 ? 'text-warning' : 'text-success'">
                    {{ totalActiveAlerts() }}
                  </div>
                </m3-card>
              </div>

              @if (focusStatus() === 'running' || focusStatus() === 'paused') {
                <div class="bg-surface/80 backdrop-blur-md p-4 rounded-m3-lg border border-outline-sub flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="w-10 h-10 rounded-m3-md bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0">
                      <span class="material-symbols-rounded text-xl" aria-hidden="true">timer</span>
                    </span>
                    <div class="min-w-0">
                      <div class="text-label-sm text-muted uppercase tracking-wider">
                        Enfoque {{ focusLabel() }}
                      </div>
                      <div class="text-title-sm font-semibold text-main truncate">
                        {{ focusTaskTitle() || 'Sesión Pomodoro activa' }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-title-md font-extrabold text-primary tabular-nums">
                      {{ focusTime() }}
                    </span>
                    <m3-button
                      variant="tonal"
                      size="sm"
                      icon="arrow_forward"
                      (action)="navigateModule.emit('/agenda')">
                      Agenda
                    </m3-button>
                  </div>
                </div>
              }
            </div>

            <!-- RIGHT: 6 WORKBENCHES LIVE STATUS LIST -->
            <m3-card
              variant="outlined"
              padding="md"
              shape="xl"
              customClass="lg:col-span-7 !bg-surface/80 backdrop-blur-md space-y-3">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-title-md font-bold text-main">
                  Estado de las {{ moduleCards().length }} estaciones
                </h3>
                <span class="text-label-sm text-muted">Acceso directo</span>
              </div>

              <ul role="list" class="list-none m-0 p-0 divide-y divide-outline-sub/60">
                @for (card of moduleCards(); track card.section) {
                  <li class="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        [class]="card.iconBgClass"
                        class="w-9 h-9 rounded-m3-md grid place-items-center shrink-0">
                        <span class="material-symbols-rounded text-lg" aria-hidden="true">{{ card.icon }}</span>
                      </span>
                      <div class="min-w-0 flex-1 space-y-1">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="text-title-sm font-semibold text-main truncate">{{ card.title }}</span>
                          <span class="text-label-md-emphasized text-primary tabular-nums">{{ card.headline }}</span>
                        </div>
                        <p class="text-body-sm text-muted truncate m-0">{{ card.detail }}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <div class="hidden sm:block w-20 space-y-0.5">
                        <span class="block text-right text-label-sm font-semibold text-main tabular-nums">
                          {{ card.healthPercent }}%
                        </span>
                        <m3-linear-progress
                          [value]="card.healthPercent"
                          [color]="card.healthColor"
                          size="sm"
                          [ariaLabel]="card.title + ': ' + card.healthLabel" />
                      </div>

                      <span
                        [class]="badgeClass(card.statusTone)"
                        class="px-2.5 py-1 rounded-m3-full text-label-sm font-semibold inline-flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs" aria-hidden="true">{{ card.statusIcon }}</span>
                        <span>{{ card.statusLabel }}</span>
                      </span>

                      <m3-button
                        [iconOnly]="true"
                        variant="text"
                        size="sm"
                        icon="arrow_forward"
                        [ariaLabel]="'Abrir ' + card.title"
                        (action)="navigateModule.emit(card.route)" />
                    </div>
                  </li>
                }
              </ul>
            </m3-card>
          </div>

          <!-- FOOTER ACTION -->
          <div class="flex justify-end">
            <m3-button
              variant="filled"
              size="md"
              (action)="closeRequested.emit()">
              Cerrar vista detallada
            </m3-button>
          </div>
        </div>
      </div>
    }
  `
})
export class OverviewHeroDetailComponent {
  readonly themeService = inject(ThemeService);
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly open = input.required<boolean>();
  readonly viewTransitionName = input<string | null>(null);
  readonly completionRate = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly pendingCount = input.required<number>();
  readonly totalActiveAlerts = input.required<number>();
  readonly moduleCards = input.required<readonly ModulePulseCard[]>();
  readonly focusStatus = input<FocusTimerStatus>('idle');
  readonly focusTime = input<string>('25:00');
  readonly focusLabel = input<string>('Listo');
  readonly focusTaskTitle = input<string | null>(null);

  readonly closeRequested = output<void>();
  readonly navigateModule = output<string>();

  readonly badgeClass = moduleBadgeClass;

  constructor() {
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.modalHeading()?.nativeElement.focus());
      }
    });
  }

  onEscapeKey(): void {
    if (this.open()) {
      this.closeRequested.emit();
    }
  }
}
