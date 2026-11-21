import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FocusTimerStatus } from '../../agenda/agenda-focus.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { ModulePulseCard, OverviewModuleFilter, moduleBadgeClass } from '../overview.models';

@Component({
  selector: 'app-overview-hero-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3DialogComponent,
    M3LinearProgressComponent
  ],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="expressive"
      size="fullscreen"
      tone="primary"
      icon="hub"
      headline="Desglose Ejecutivo"
      subtitle="Visión consolidada de jornada, enfoque y pulso operativo."
      [aurora]="true"
      [open]="open()"
      [managedClose]="true"
      [viewTransitionName]="viewTransitionName()"
      closeLabel="Cerrar desglose del sistema"
      (closeRequested)="closeRequested.emit()">

      @let alerts = totalActiveAlerts();
      <span
        dialog-header-extra
        [class]="alerts > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-success-box text-on-success-box'"
        class="px-3.5 py-1.5 rounded-m3-full text-label-md-emphasized inline-flex items-center gap-1.5 tabular-nums">
        <span class="material-symbols-rounded text-sm" aria-hidden="true">
          {{ alerts > 0 ? 'notifications_active' : 'verified' }}
        </span>
        <span class="hidden sm:inline">
          {{ alerts > 0 ? alerts + ' alertas activas en módulos' : 'Todas las estaciones estables' }}
        </span>
        <span class="sm:hidden">
          {{ alerts > 0 ? alerts + ' alertas' : 'Estable' }}
        </span>
      </span>

      <!-- MAIN 2-COLUMN EXECUTIVE BREAKDOWN -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- LEFT: AGENDA PROGRESS + KPIs + ACTIVE POMODORO -->
        <div class="lg:col-span-5 space-y-5">
          <div class="space-y-3">
            <span class="text-label-md-emphasized uppercase tracking-widest text-muted block">
              Progreso de Jornada
            </span>
            <p class="text-display-sm md:text-display-md font-extrabold tracking-tight text-main tabular-nums m-0">
              {{ completionRate() }}% Completado
            </p>
            <m3-linear-progress
              [value]="completionRate()"
              color="primary"
              size="lg"
              [wavy]="true"
              ariaLabel="Progreso total de tareas" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <m3-card variant="outlined" surface="surface" padding="sm" shape="lg" customClass="backdrop-blur-md">
              <span class="text-label-sm text-muted block">Finalizadas</span>
              <div class="text-headline-sm font-extrabold text-primary tabular-nums mt-1">
                {{ completedCount() }}
              </div>
            </m3-card>
            <m3-card variant="outlined" surface="surface" padding="sm" shape="lg" customClass="backdrop-blur-md">
              <span class="text-label-sm text-muted block">Pendientes</span>
              <div class="text-headline-sm font-extrabold text-main tabular-nums mt-1">
                {{ pendingCount() }}
              </div>
            </m3-card>
            <m3-card variant="outlined" surface="surface" padding="sm" shape="lg" customClass="backdrop-blur-md">
              <span class="text-label-sm text-muted block">Alertas</span>
              <div
                class="text-headline-sm font-extrabold tabular-nums mt-1"
                [class]="totalActiveAlerts() > 0 ? 'text-warning' : 'text-success'">
                {{ totalActiveAlerts() }}
              </div>
            </m3-card>
          </div>

          @if (focusStatus() === 'running' || focusStatus() === 'paused') {
            <div class="bg-surface/85 backdrop-blur-md p-4 rounded-m3-lg border border-outline-sub flex items-center justify-between gap-3">
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

        <!-- RIGHT: 6 WORKBENCHES LIVE STATUS LIST + CONNECTED BUTTON GROUP SWITCHER -->
        <m3-card
          variant="outlined"
          surface="surface"
          padding="md"
          shape="xl"
          customClass="lg:col-span-7 backdrop-blur-md space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-title-md font-bold text-main">
              Estado de las {{ moduleCards().length }} estaciones
            </h3>

            <div class="overflow-x-auto scrollbar-none max-w-full py-2.5 -my-2.5">
              <m3-button-group
                variant="connected"
                selectionMode="single"
                size="xs"
                ariaLabel="Filtrar estaciones en desglose"
                [options]="filterOptions()"
                [value]="[stationFilter()]"
                (selectionChange)="onFilterChange($event)" />
            </div>
          </div>

          <ul role="list" class="list-none m-0 p-0 divide-y divide-outline-sub/60">
            @for (card of filteredStations(); track card.section) {
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
            } @empty {
              <li class="py-6 text-center text-body-sm text-muted">
                No hay estaciones en esta categoría.
              </li>
            }
          </ul>
        </m3-card>
      </div>

      <m3-button
        dialog-actions
        variant="filled"
        size="md"
        (action)="closeRequested.emit()">
        Cerrar vista detallada
      </m3-button>
    </m3-dialog>
  `
})
export class OverviewHeroDetailComponent {
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
  readonly stationFilter = signal<OverviewModuleFilter>('all');

  readonly filterOptions = computed<M3ButtonGroupOption[]>(() => {
    const cards = this.moduleCards();
    const alertsCount = cards.filter(c => c.hasAlert).length;
    const stableCount = cards.length - alertsCount;
    return [
      { id: 'all', label: 'Todas', badge: cards.length },
      { id: 'alerts', label: 'Alertas', icon: 'notifications_active', badge: alertsCount },
      { id: 'stable', label: 'Estables', icon: 'verified', badge: stableCount }
    ];
  });

  readonly filteredStations = computed<readonly ModulePulseCard[]>(() => {
    const filter = this.stationFilter();
    const cards = this.moduleCards();
    if (filter === 'alerts') return cards.filter(c => c.hasAlert);
    if (filter === 'stable') return cards.filter(c => !c.hasAlert);
    return cards;
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.stationFilter.set('all');
      }
    });
  }

  onFilterChange(selected: string[]): void {
    const next = (selected[0] as OverviewModuleFilter | undefined) ?? 'all';
    this.stationFilter.set(next);
  }
}
