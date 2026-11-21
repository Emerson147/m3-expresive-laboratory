import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  M3ButtonAnchorComponent,
  M3ButtonComponent
} from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { ModulePulseCard, OverviewModuleFilter, moduleBadgeClass } from '../overview.models';

@Component({
  selector: 'app-overview-modules-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, M3ButtonAnchorComponent, M3ButtonComponent, M3CardComponent, M3ChipComponent, M3LinearProgressComponent],
  host: {
    class: 'block space-y-3.5'
  },
  template: `
    <section aria-labelledby="overview-modules-heading" class="space-y-3.5">
      <!-- COMMAND TOOLBAR EN UNA SOLA FILA (TÍTULO + CHIPS FILTRO + ENLACE DS) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="space-y-0.5 min-w-0">
          <h2 id="overview-modules-heading" class="text-title-lg font-bold tracking-tight text-main">
            Módulos en Vivo
          </h2>
          <p class="text-body-sm text-muted m-0">
            Estado consolidado de tus {{ totalCount() }} estaciones operativas con acceso directo.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <div role="group" aria-label="Filtrar estaciones operativas" class="flex flex-wrap items-center gap-2">
            <m3-chip
              type="filter"
              [selected]="activeFilter() === 'all'"
              [count]="totalCount()"
              (action)="filterChange.emit('all')">
              Todos
            </m3-chip>
            <m3-chip
              type="filter"
              icon="notifications_active"
              [selected]="activeFilter() === 'alerts'"
              [count]="alertsModuleCount()"
              (action)="filterChange.emit('alerts')">
              Con alertas
            </m3-chip>
            <m3-chip
              type="filter"
              icon="verified"
              [selected]="activeFilter() === 'stable'"
              [count]="stableModuleCount()"
              (action)="filterChange.emit('stable')">
              Estables
            </m3-chip>
          </div>

          <span class="hidden sm:block h-5 w-px bg-outline-sub/80 mx-0.5" aria-hidden="true"></span>

          <a
            m3-button
            variant="tonal"
            size="sm"
            icon="widgets"
            routerLink="/design-system/styles"
            customClass="overview-link-pill shrink-0">
            Design System M3
          </a>
        </div>
      </div>

      <!-- GRILLA BENTO SIMÉTRICA CON TARJETAS TONALES (PARIDAD CON AGENDA EN VIVO) -->
      <div class="overview-modules-bento">
        @for (card of cards(); track card.section; let idx = $index) {
          <article
            [style.animation-delay]="(idx * 35 + 60) + 'ms'"
            class="overview-module-slot overview-module-enter">
            <m3-card
              variant="filled"
              surface="low"
              [interactive]="false"
              shape="xl"
              padding="none"
              customClass="overview-module-card h-full overflow-hidden border border-transparent forced-colors:border-[LinkText]">
              <div class="p-4 sm:p-5 flex flex-col justify-between gap-4 h-full">
                <!-- BANDA 1: CABECERA + CIFRA PROTAGONISTA -->
                <div class="overview-module-header-band flex items-start justify-between gap-3 min-w-0">
                  <div class="flex items-center gap-3 min-w-0">
                    <span
                      [class]="card.iconBgClass"
                      class="overview-module-icon w-10 h-10 grid place-items-center shrink-0">
                      <span class="material-symbols-rounded text-xl" aria-hidden="true">{{ card.icon }}</span>
                    </span>
                    <div class="min-w-0">
                      <h3 class="m-0">
                        <a
                          [routerLink]="card.route"
                          class="overview-module-stretched-link text-label-md-emphasized text-muted uppercase tracking-wider truncate block no-underline">
                          {{ card.title }}
                        </a>
                      </h3>
                      <div class="text-headline-sm font-extrabold text-main tabular-nums truncate">
                        {{ card.headline }}
                      </div>
                    </div>
                  </div>

                  <span
                    [class]="badgeClass(card.statusTone)"
                    class="px-2.5 py-1 rounded-m3-full text-label-sm font-semibold inline-flex items-center gap-1 shrink-0 relative z-10 pointer-events-none">
                    <span class="material-symbols-rounded text-xs" aria-hidden="true">{{ card.statusIcon }}</span>
                    <span>{{ card.statusLabel }}</span>
                  </span>
                </div>

                <!-- BANDA 2 + 3: TELEMETRÍA Y CÁPSULA DE PIE CON ESPACIADO GARANTIZADO -->
                <div class="mt-auto space-y-4 min-w-0">
                  <div class="space-y-2 min-w-0">
                    <div class="flex items-center justify-between text-label-sm text-muted">
                      <span>{{ card.healthLabel }}</span>
                      <span class="font-semibold text-main tabular-nums">{{ card.healthPercent }}%</span>
                    </div>
                    <m3-linear-progress
                      [value]="card.healthPercent"
                      [color]="card.healthColor"
                      size="md"
                      [ariaLabel]="card.title + ': ' + card.healthLabel" />
                  </div>

                  <div class="overview-module-footer-pill rounded-m3-lg bg-surface-box px-3.5 py-2.5 flex items-center justify-between gap-2 text-body-sm text-muted">
                    <span class="truncate">{{ card.detail }}</span>
                    <span
                      class="material-symbols-rounded overview-module-arrow text-base text-primary shrink-0"
                      aria-hidden="true">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            </m3-card>
          </article>
        } @empty {
          <m3-card
            variant="elevated"
            shape="xl"
            padding="lg"
            customClass="col-span-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-outline-sub/60">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-m3-md bg-success-box text-on-success-box grid place-items-center shrink-0">
                <span class="material-symbols-rounded text-xl" aria-hidden="true">verified</span>
              </span>
              <div>
                <p class="text-title-sm font-semibold text-main m-0">
                  Ninguna estación coincide con este filtro.
                </p>
                <p class="text-body-sm text-muted m-0">
                  Vuelve a mostrar los {{ totalCount() }} módulos para supervisar toda la operación.
                </p>
              </div>
            </div>
            <m3-button
              variant="tonal"
              size="sm"
              icon="filter_alt_off"
              (action)="filterChange.emit('all')">
              Mostrar todos
            </m3-button>
          </m3-card>
        }
      </div>
    </section>
  `
})
export class OverviewModulesGridComponent {
  readonly cards = input.required<readonly ModulePulseCard[]>();
  readonly activeFilter = input.required<OverviewModuleFilter>();
  readonly totalCount = input.required<number>();
  readonly alertsModuleCount = input.required<number>();
  readonly stableModuleCount = input.required<number>();

  readonly filterChange = output<OverviewModuleFilter>();

  readonly badgeClass = moduleBadgeClass;
}
