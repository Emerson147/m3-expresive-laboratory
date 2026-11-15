import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  TelemetryFilter,
  TelemetryFilterCounts,
  Vehicle,
  VehicleStatus
} from '../../../core/telemetry/telemetry.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3LinearProgressComponent, M3ProgressColor } from '../../../shared/components/progress';

@Component({
  selector: 'app-telemetry-fleet-panel',
  standalone: true,
  imports: [M3ChipComponent, M3ButtonComponent, M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col'
  },
  template: `
    <section
      aria-label="Flota operativa en corredor"
      class="flex flex-col gap-4 bg-surface-low rounded-m3-xl p-5 sm:p-6">

      <!-- Reactive Filter Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div role="group" aria-label="Filtrar unidades de flota" class="flex items-center flex-wrap gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted mr-1">
            Filtrar:
          </span>

          <m3-chip
            type="filter"
            [selected]="currentFilter() === 'all'"
            [count]="filterCounts().all"
            (action)="filterChange.emit('all')">
            Todas
          </m3-chip>

          <m3-chip
            type="filter"
            [selected]="currentFilter() === 'in_transit'"
            [count]="filterCounts().in_transit"
            (action)="filterChange.emit('in_transit')">
            En Tránsito
          </m3-chip>

          <m3-chip
            type="filter"
            [selected]="currentFilter() === 'risk_sla'"
            [count]="filterCounts().risk_sla"
            (action)="filterChange.emit('risk_sla')">
            Riesgo SLA
          </m3-chip>

          <m3-chip
            type="filter"
            [selected]="currentFilter() === 'cold_chain'"
            [count]="filterCounts().cold_chain"
            (action)="filterChange.emit('cold_chain')">
            Cadena de Frío
          </m3-chip>
        </div>

        <span class="text-label-sm font-mono tabular-nums text-muted shrink-0">
          {{ vehicles().length }} {{ vehicles().length === 1 ? 'unidad visible' : 'unidades visibles' }}
        </span>
      </div>

      <!-- Scrollable Fleet Grid -->
      @if (vehicles().length > 0) {
        <ul
          role="list"
          aria-label="Lista de vehículos filtrados"
          class="tel-scroll-pane max-h-[680px] overflow-y-auto m3-scrollbar list-none m-0 p-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
          @for (v of vehicles(); track v.id) {
            @let isSelected = selectedVehicleId() === v.id;
            <li
              class="tel-fleet-item"
              [style.view-transition-name]="isFleetFlipActive() ? 'tel-card-' + v.id : null">
              <article
                [class]="'tel-fleet-card flex flex-col justify-between gap-3.5 p-4 sm:p-5 transition-colors ' +
                  (isSelected
                    ? 'is-selected bg-primary-box text-on-primary-box shadow-m3-level1'
                    : 'bg-surface hover:bg-surface-high text-main')">

                <!-- Primary Interactive Selection Area (Zero Nested Buttons) -->
                <button
                  type="button"
                  [attr.aria-pressed]="isSelected"
                  (click)="selectVehicle.emit(v.id)"
                  class="state-layer focus-ring-m3 w-full text-left rounded-m3-md p-1.5 -m-1.5 space-y-3 cursor-pointer">

                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div
                        [class]="'w-9 h-9 rounded-m3-md grid place-items-center shrink-0 ' +
                          (isSelected ? 'bg-primary text-on-primary' : 'bg-primary-box text-on-primary-box')">
                        <span class="material-symbols-rounded text-lg" aria-hidden="true">local_shipping</span>
                      </div>

                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="font-mono text-title-sm-emphasized tabular-nums">{{ v.id }}</span>
                          <span [class]="'text-label-sm font-mono tabular-nums ' + (isSelected ? 'opacity-85' : 'text-muted')">
                            ({{ v.plate }})
                          </span>
                        </div>
                        <p [class]="'text-body-sm truncate ' + (isSelected ? 'opacity-90' : 'text-muted')">
                          {{ v.origin }} &rarr; {{ v.destination }}
                        </p>
                      </div>
                    </div>

                    <span
                      [class]="getStatusBadgeClass(v.status)"
                      class="inline-flex items-center gap-1 text-label-sm-emphasized px-2 py-0.5 rounded-m3-full shrink-0">
                      <span class="material-symbols-rounded text-[14px]" aria-hidden="true">{{ getStatusIcon(v.status) }}</span>
                      <span>{{ getStatusLabel(v.status) }}</span>
                    </span>
                  </div>

                  <div class="grid grid-cols-3 gap-2 text-label-sm">
                    <div class="min-w-0">
                      <span [class]="'block ' + (isSelected ? 'opacity-75' : 'text-muted')">Operador</span>
                      <span class="font-medium truncate block">{{ v.driver }}</span>
                    </div>
                    <div>
                      <span [class]="'block ' + (isSelected ? 'opacity-75' : 'text-muted')">Velocidad</span>
                      <span class="font-mono font-bold tabular-nums">{{ v.speedKmh }} km/h</span>
                    </div>
                    <div>
                      <span [class]="'block ' + (isSelected ? 'opacity-75' : 'text-muted')">Térmico</span>
                      <span
                        class="font-mono font-bold tabular-nums"
                        [class]="v.cargoTempC < 0 ? (isSelected ? 'text-on-primary-box' : 'text-tertiary') : ''">
                        {{ v.cargoTempC }}°C
                      </span>
                    </div>
                  </div>

                  <div class="space-y-1">
                    <div class="flex justify-between text-label-sm font-mono tabular-nums">
                      <span [class]="isSelected ? 'opacity-85' : 'text-muted'">Progreso de Entrega</span>
                      <span class="font-bold">{{ v.progressPercent }}%</span>
                    </div>
                    <m3-linear-progress
                      [value]="v.progressPercent"
                      [wavy]="false"
                      size="sm"
                      [color]="getProgressColorByStatus(v.status)"
                      [ariaLabel]="'Progreso de ' + v.id" />
                  </div>
                </button>

                <!-- Sibling Secondary Action Footer -->
                <div class="flex items-center justify-between gap-2 pt-1">
                  <span [class]="'text-label-sm font-mono tabular-nums ' + (isSelected ? 'opacity-90' : 'text-muted')">
                    ETA: {{ v.etaMinutes }}m • {{ v.lastPingTime }}
                  </span>

                  <m3-button
                    [id]="'inspect-trigger-' + v.id"
                    [variant]="isSelected ? 'filled' : 'tonal'"
                    size="sm"
                    icon="visibility"
                    [morph]="true"
                    [invisible]="isInspectModalOpen() && activeInspectTrigger() === ('inspect-' + v.id)"
                    [viewTransitionName]="!isInspectModalOpen() && activeInspectTrigger() === ('inspect-' + v.id) ? 'dialog-transform' : null"
                    (action)="inspectVehicle.emit(v)">
                    Inspeccionar
                  </m3-button>
                </div>
              </article>
            </li>
          }
        </ul>
      } @else {
        <div class="flex-1 grid place-items-center py-10 text-center">
          <div class="space-y-2.5 max-w-xs">
            <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">directions_bus</span>
            <p class="text-title-sm-emphasized text-main">Sin unidades en este filtro</p>
            <p class="text-body-sm text-muted">
              Ningún vehículo activo cumple los criterios del filtro seleccionado.
            </p>
            <m3-button variant="tonal" size="sm" icon="filter_alt_off" (action)="filterChange.emit('all')">
              Mostrar toda la flota
            </m3-button>
          </div>
        </div>
      }
    </section>
  `
})
export class TelemetryFleetPanelComponent {
  readonly vehicles = input.required<Vehicle[]>();
  readonly selectedVehicleId = input.required<string>();
  readonly currentFilter = input.required<TelemetryFilter>();
  readonly filterCounts = input.required<TelemetryFilterCounts>();
  readonly isFleetFlipActive = input.required<boolean>();
  readonly activeInspectTrigger = input<string | null>(null);
  readonly isInspectModalOpen = input<boolean>(false);

  readonly filterChange = output<TelemetryFilter>();
  readonly selectVehicle = output<string>();
  readonly inspectVehicle = output<Vehicle>();

  getStatusBadgeClass(status: VehicleStatus): string {
    switch (status) {
      case 'optimal':
      case 'in_transit':
        return 'bg-success-box text-on-success-box';
      case 'delayed':
      case 'cold_chain_warning':
        return 'bg-warning-box text-on-warning-box';
      case 'critical':
        return 'bg-error-box text-on-error-box';
      default:
        return 'bg-surface-high text-main';
    }
  }

  getStatusIcon(status: VehicleStatus): string {
    switch (status) {
      case 'optimal':
      case 'in_transit':
        return 'check_circle';
      case 'delayed':
        return 'schedule';
      case 'critical':
        return 'error';
      case 'cold_chain_warning':
        return 'ac_unit';
      default:
        return 'local_shipping';
    }
  }

  getStatusLabel(status: VehicleStatus): string {
    switch (status) {
      case 'optimal':
        return 'Óptimo';
      case 'in_transit':
        return 'En Ruta';
      case 'delayed':
        return 'Riesgo SLA';
      case 'critical':
        return 'Crítico';
      case 'cold_chain_warning':
        return 'Cadena Frío';
      default:
        return 'En Ruta';
    }
  }

  getProgressColorByStatus(status: VehicleStatus): M3ProgressColor {
    switch (status) {
      case 'delayed':
      case 'critical':
        return 'error';
      case 'cold_chain_warning':
        return 'secondary';
      case 'optimal':
      case 'in_transit':
      default:
        return 'primary';
    }
  }
}
