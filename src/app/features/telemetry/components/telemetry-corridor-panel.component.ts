import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ActiveCorridorSummary,
  CorridorVehicleMarker,
  LiveTelemetryEvent,
  VehicleStatus
} from '../../../core/telemetry/telemetry.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-telemetry-corridor-panel',
  standalone: true,
  imports: [M3ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-5 lg:gap-6'
  },
  template: `
    <!-- 1. Reactive SVG Geospatial Corridor Map -->
    <section
      aria-label="Mapa vectorial del corredor activo"
      class="bg-surface-low rounded-m3-xl p-5 sm:p-6 space-y-4 shrink-0">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="material-symbols-rounded text-primary text-lg shrink-0" aria-hidden="true">route</span>
          <h3 class="text-title-sm-emphasized text-main truncate">Corredor Activo</h3>
        </div>

        <span
          class="text-label-sm-emphasized font-mono px-2.5 py-0.5 rounded-m3-full shrink-0"
          [class]="isLiveTelemetryActive() ? 'bg-success-box text-on-success-box' : 'bg-surface-high text-muted'">
          {{ isLiveTelemetryActive() ? 'LIVE GPS' : 'GPS EN PAUSA' }}
        </span>
      </div>

      <p class="text-body-sm text-muted truncate">
        {{ corridorSummary().corridorName }} • {{ corridorSummary().origin }} &rarr; {{ corridorSummary().destination }}
      </p>

      <div class="relative w-full h-52 bg-surface rounded-m3-lg p-3 overflow-hidden">
        <svg
          class="w-full h-full"
          viewBox="0 0 320 140"
          fill="none"
          role="img"
          [attr.aria-label]="'Trayectoria en corredor para ' + corridorSummary().vehicleId + ' al ' + corridorSummary().progressPercent + '%'"
          xmlns="http://www.w3.org/2000/svg">
          <!-- Subtle coordinate grid lines -->
          <line x1="0" y1="35" x2="320" y2="35" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="3 3" />
          <line x1="0" y1="70" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="3 3" />
          <line x1="0" y1="105" x2="320" y2="105" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="3 3" />

          <!-- Full Corridor Route Spline -->
          <path
            d="M 20 100 C 70 120, 100 30, 160 50 C 220 70, 260 110, 300 40"
            stroke="var(--md-sys-color-primary-container)"
            stroke-width="5"
            stroke-linecap="round" />

          <!-- Traversed Progress Path synced reactively to selected vehicle -->
          @if (corridorSummary().progressPercent > 0) {
            <path
              d="M 20 100 C 70 120, 100 30, 160 50 C 220 70, 260 110, 300 40"
              pathLength="100"
              [attr.stroke-dasharray]="corridorSummary().progressPercent + ' 100'"
              stroke="var(--md-sys-color-primary)"
              stroke-width="5"
              stroke-linecap="round" />
          }

          <!-- Corridor Origin / Destination Terminal Anchors -->
          <circle cx="20" cy="100" r="4" fill="var(--md-sys-color-outline)" />
          <text x="16" y="122" font-size="8" font-family="monospace" fill="var(--md-sys-color-on-surface-variant)">
            ORIGEN
          </text>

          <circle cx="300" cy="40" r="4" fill="var(--md-sys-color-outline)" />
          <text x="270" y="24" font-size="8" font-family="monospace" fill="var(--md-sys-color-on-surface-variant)">
            DESTINO
          </text>

          <!-- Dynamic Fleet Position Nodes along the Bézier spline -->
          @for (marker of markers(); track marker.vehicleId) {
            <g
              class="tel-corridor-node"
              role="button"
              tabindex="0"
              [attr.aria-label]="'Seleccionar ' + marker.vehicleId + ' (' + marker.progressPercent + '%)'"
              (click)="selectVehicle.emit(marker.vehicleId)"
              (keydown.enter)="selectVehicle.emit(marker.vehicleId)"
              (keydown.space)="$event.preventDefault(); selectVehicle.emit(marker.vehicleId)">
              <title>{{ marker.vehicleId }} ({{ marker.plate }}) • {{ marker.progressPercent }}%</title>

              @if (marker.isSelected) {
                <circle
                  class="tel-corridor-pulse"
                  [attr.cx]="marker.x"
                  [attr.cy]="marker.y"
                  r="10"
                  fill="var(--md-sys-color-primary)"
                  opacity="0.22"
                  [class.animate-ping]="isLiveTelemetryActive()" />
              }

              <circle
                [attr.cx]="marker.x"
                [attr.cy]="marker.y"
                [attr.r]="marker.isSelected ? 6 : 4.5"
                [attr.fill]="getMarkerColor(marker.status, marker.isSelected)" />

              <text
                [attr.x]="getLabelX(marker.x)"
                [attr.y]="getLabelY(marker.y)"
                font-size="8"
                [attr.font-weight]="marker.isSelected ? 'bold' : 'normal'"
                font-family="monospace"
                [attr.fill]="marker.isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)'">
                {{ marker.vehicleId }}{{ marker.isSelected ? ' ★' : '' }}
              </text>
            </g>
          }
        </svg>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-label-sm font-mono tabular-nums text-muted">
          Vel. Media: {{ corridorSummary().averageSpeedKmh }} km/h • ETA {{ corridorSummary().etaMinutes }}m
        </span>

        <m3-button
          id="trigger-corridor-inspect"
          variant="text"
          size="sm"
          icon="sensors"
          [invisible]="isInspectModalOpen() && activeInspectTrigger() === 'corridor-inspect'"
          [viewTransitionName]="!isInspectModalOpen() && activeInspectTrigger() === 'corridor-inspect' ? 'dialog-transform' : null"
          (action)="inspectCorridor.emit()">
          Ver Telemetría
        </m3-button>
      </div>
    </section>

    <!-- 2. Live Event & Alert Feed -->
    <section
      aria-label="Feed de alertas y eventos en vivo"
      class="bg-surface-low rounded-m3-xl p-5 sm:p-6 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-2 min-w-0">
          <span class="material-symbols-rounded text-primary text-lg shrink-0" aria-hidden="true">broadcast_on_home</span>
          <h3 class="text-title-sm-emphasized text-main truncate">Feed de Alertas y Eventos</h3>
        </div>

        <span
          class="text-label-sm-emphasized font-mono px-2.5 py-0.5 rounded-m3-full shrink-0"
          [class]="isLiveTelemetryActive() ? 'bg-success-box text-on-success-box' : 'bg-surface-high text-muted'">
          {{ isLiveTelemetryActive() ? 'EN VIVO' : 'PAUSADO' }}
        </span>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Historial de eventos de telemetría"
        class="tel-scroll-pane max-h-[420px] lg:max-h-[460px] overflow-y-auto m3-scrollbar space-y-3 pr-1">
        @for (evt of events(); track evt.id) {
          <article class="tel-event-card p-3.5 sm:p-4 rounded-m3-lg bg-surface space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0">
                <span
                  [class]="getEventBadgeClass(evt.type)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums">
                  <span class="material-symbols-rounded text-[13px]" aria-hidden="true">{{ getEventIcon(evt.type) }}</span>
                  <span>{{ evt.vehicleId }}</span>
                </span>
              </div>
              <time class="text-label-sm font-mono tabular-nums text-muted shrink-0">
                {{ evt.timestamp }}
              </time>
            </div>

            <p class="text-body-sm text-main leading-snug">
              {{ evt.message }}
            </p>
          </article>
        }
      </div>
    </section>
  `
})
export class TelemetryCorridorPanelComponent {
  readonly corridorSummary = input.required<ActiveCorridorSummary>();
  readonly markers = input.required<CorridorVehicleMarker[]>();
  readonly events = input.required<LiveTelemetryEvent[]>();
  readonly isLiveTelemetryActive = input.required<boolean>();
  readonly isInspectModalOpen = input<boolean>(false);
  readonly activeInspectTrigger = input<string | null>(null);

  readonly selectVehicle = output<string>();
  readonly inspectCorridor = output<void>();

  getMarkerColor(status: VehicleStatus, isSelected: boolean): string {
    if (isSelected) return 'var(--md-sys-color-primary)';
    switch (status) {
      case 'delayed':
        return 'var(--md-sys-color-warning)';
      case 'critical':
        return 'var(--md-sys-color-error)';
      case 'cold_chain_warning':
        return 'var(--md-sys-color-tertiary)';
      default:
        return 'var(--md-sys-color-primary)';
    }
  }

  getLabelX(x: number): number {
    return Math.min(248, Math.max(12, Math.round(x - 18)));
  }

  getLabelY(y: number): number {
    return y < 45 ? Math.round(y + 16) : Math.round(y - 10);
  }

  getEventBadgeClass(type: LiveTelemetryEvent['type']): string {
    switch (type) {
      case 'success':
        return 'bg-success-box text-on-success-box';
      case 'warning':
        return 'bg-warning-box text-on-warning-box';
      case 'error':
        return 'bg-error-box text-on-error-box';
      case 'info':
      default:
        return 'bg-primary-box text-on-primary-box';
    }
  }

  getEventIcon(type: LiveTelemetryEvent['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }
}
