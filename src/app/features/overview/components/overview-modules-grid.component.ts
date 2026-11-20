import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { ModulePulseCard, OverviewModuleFilter, moduleBadgeClass } from '../overview.models';

@Component({
  selector: 'app-overview-modules-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, M3ButtonComponent, M3CardComponent, M3ChipComponent, M3LinearProgressComponent],
  host: {
    class: 'block space-y-3.5'
  },
  template: `
    <section aria-labelledby="overview-modules-heading" class="space-y-3.5">
      <!-- COMMAND TOOLBAR EN UNA SOLA FILA (TÍTULO + CHIPS FILTRO + ENLACE DS) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="space-y-0.5 min-w-0">
          <h3 id="overview-modules-heading" class="text-title-lg font-bold tracking-tight text-main">
            Módulos en Vivo
          </h3>
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
            routerLink="/design-system/styles"
            class="btn-m3 overview-link-pill focus-ring-m3 touch-target-48 h-8 px-3.5 bg-surface-low hover:bg-surface-high text-label-md-emphasized text-primary inline-flex items-center gap-1.5 no-underline cursor-pointer shrink-0">
            <span class="material-symbols-rounded text-base" aria-hidden="true">widgets</span>
            <span>Design System M3</span>
            <span class="material-symbols-rounded overview-link-arrow text-sm" aria-hidden="true">arrow_forward</span>
          </a>
        </div>
      </div>

      <!-- GRILLA BENTO SIMÉTRICA CON ANATOMÍA DE 3 BANDAS (HEADER / TELEMETRÍA / FOOTER) -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (card of cards(); track card.section; let idx = $index) {
          <a
            [routerLink]="card.route"
            [style.animation-delay]="(idx * 35 + 60) + 'ms'"
            class="group overview-module-link overview-module-enter block no-underline focus-ring-m3 rounded-m3-xl">
            <m3-card
              variant="outlined"
              [interactive]="false"
              shape="xl"
              padding="none"
              customClass="overview-module-card h-full overflow-hidden flex flex-col justify-between forced-colors:border-[LinkText]">
              <!-- BANDA 1: CABECERA + CIFRA PROTAGONISTA -->
              <div class="p-4 pb-2.5 flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    [class]="card.iconBgClass"
                    class="overview-module-icon w-10 h-10 grid place-items-center shrink-0">
                    <span class="material-symbols-rounded text-xl" aria-hidden="true">{{ card.icon }}</span>
                  </span>
                  <div class="min-w-0">
                    <div class="text-label-md-emphasized text-muted uppercase tracking-wider truncate">
                      {{ card.title }}
                    </div>
                    <div class="text-headline-sm font-extrabold text-main tabular-nums truncate">
                      {{ card.headline }}
                    </div>
                  </div>
                </div>

                <span
                  [class]="badgeClass(card.statusTone)"
                  class="px-2.5 py-1 rounded-m3-full text-label-sm font-semibold inline-flex items-center gap-1 shrink-0">
                  <span class="material-symbols-rounded text-xs" aria-hidden="true">{{ card.statusIcon }}</span>
                  <span>{{ card.statusLabel }}</span>
                </span>
              </div>

              <!-- BANDA 2: MEDIDOR VISUAL UNIFORME EN TODAS LAS ESTACIONES (4dp CANÓNICO M3) -->
              <div class="px-4 pb-3.5 space-y-1.5">
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

              <!-- BANDA 3: FOOTER TONAL CON DIVISOR SUTIL -->
              <div class="mt-auto px-4 py-2.5 bg-surface-low/65 border-t border-outline-sub/60 flex items-center justify-between gap-2 text-body-sm text-muted">
                <span class="truncate">{{ card.detail }}</span>
                <span
                  class="material-symbols-rounded overview-module-arrow text-base text-primary shrink-0"
                  aria-hidden="true">
                  arrow_forward
                </span>
              </div>
            </m3-card>
          </a>
        } @empty {
          <m3-card
            variant="elevated"
            shape="xl"
            padding="lg"
            customClass="md:col-span-2 xl:col-span-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-outline-sub/60">
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
