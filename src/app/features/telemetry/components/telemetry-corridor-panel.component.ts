import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ActiveCorridorSummary,
  CorridorVehicleMarker,
  CorridorWaypoint,
  VehicleStatus
} from '../../../core/telemetry/telemetry.models';
import { evaluateCorridorSplinePoint } from '../../../core/telemetry/telemetry.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';

interface PlacedCorridorMarker extends CorridorVehicleMarker {
  pillX: number;
  pillY: number;
  pillW: number;
  needsLeader: boolean;
}

interface PositionedWaypoint {
  id: string;
  label: string;
  x: number;
  y: number;
  isPassed: boolean;
}

const SVG_OFFSET_X = 24;
const SVG_OFFSET_Y = 22;
const PILL_H = 16;

const LABEL_OFFSETS: readonly (readonly [number, number])[] = [
  [-24, -26],
  [-24, 14],
  [-52, -26],
  [6, -26],
  [-52, 14],
  [6, 14],
  [-24, -44],
  [-24, 32],
  [-60, -44],
  [12, 32]
];

@Component({
  selector: 'app-telemetry-corridor-panel',
  standalone: true,
  imports: [M3ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col h-full min-w-0'
  },
  template: `
    <!-- Reactive SVG Geospatial Corridor Map (Equal-Height Top Bento Hero Companion with hero-transform expand) -->
    <section
      aria-label="Mapa vectorial del corredor activo"
      [class.invisible]="isHiddenForMorph()"
      [attr.aria-hidden]="isHiddenForMorph() ? 'true' : null"
      [style.view-transition-name]="heroViewTransitionName()"
      class="bg-surface-low rounded-m3-xl p-5 sm:p-6 flex flex-col justify-between gap-4 h-full">

      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex flex-col gap-1">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-8 h-8 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">route</span>
            </span>
            <div class="min-w-0">
              <h3 class="text-title-md-emphasized text-main truncate">Corredor Activo</h3>
              <p class="text-label-md text-muted truncate">{{ corridorSummary().corridorName }}</p>
            </div>
          </div>
        </div>

        <span
          [class]="'text-label-sm-emphasized font-mono px-2.5 py-1 rounded-m3-full shrink-0 ' +
            (isLiveTelemetryActive() ? 'bg-success-box text-on-success-box' : 'bg-surface-high text-muted')">
          {{ isLiveTelemetryActive() ? 'LIVE GPS' : 'GPS EN PAUSA' }}
        </span>
      </div>

      <!-- Wide Anti-Collision Geospatial Spline Canvas -->
      <div class="relative w-full min-h-[210px] flex-1 bg-surface rounded-m3-xl p-3 flex items-center justify-center overflow-hidden">
        <svg
          class="w-full h-full max-h-[240px]"
          viewBox="0 0 368 184"
          fill="none"
          role="img"
          [attr.aria-label]="'Trayectoria en corredor para ' + corridorSummary().vehicleId + ' al ' + corridorSummary().progressPercent + '%'"
          xmlns="http://www.w3.org/2000/svg">

          <defs>
            <linearGradient id="tel-corridor-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--md-sys-color-primary)" />
              <stop offset="100%" stop-color="var(--md-sys-color-tertiary)" />
            </linearGradient>
          </defs>

          <!-- Coordinate Grid Guides -->
          <line x1="12" y1="44" x2="356" y2="44" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="3 4" />
          <line x1="12" y1="92" x2="356" y2="92" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="3 4" />
          <line x1="12" y1="140" x2="356" y2="140" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="3 4" />

          <g transform="translate(24 22)">
            <!-- Full Corridor Route Spline -->
            <path
              d="M 20 100 C 70 120, 100 30, 160 50 C 220 70, 260 110, 300 40"
              stroke="var(--md-sys-color-surface-container-highest)"
              stroke-width="6"
              stroke-linecap="round" />

            <!-- Traversed Progress Path synced reactively to selected vehicle -->
            @if (corridorSummary().progressPercent > 0) {
              <path
                d="M 20 100 C 70 120, 100 30, 160 50 C 220 70, 260 110, 300 40"
                pathLength="100"
                [attr.stroke-dasharray]="corridorSummary().progressPercent + ' 100'"
                stroke="url(#tel-corridor-grad)"
                stroke-width="6"
                stroke-linecap="round" />
            }

            <!-- Corridor Intermediate Checkpoints -->
            @for (wp of checkpointMarkers(); track wp.id) {
              <g [attr.opacity]="wp.isPassed ? 0.9 : 0.45">
                <title>{{ wp.label }}</title>
                <circle
                  [attr.cx]="wp.x"
                  [attr.cy]="wp.y"
                  r="3"
                  fill="var(--md-sys-color-surface)"
                  stroke="var(--md-sys-color-outline)"
                  stroke-width="1.5" />
              </g>
            }

            <!-- Corridor Origin / Destination Terminals -->
            <circle cx="20" cy="100" r="4.5" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-primary)" stroke-width="2" />
            <text x="6" y="124" font-size="7.5" font-weight="600" font-family="monospace" fill="var(--md-sys-color-on-surface-variant)">
              ORIGEN
            </text>

            <circle cx="300" cy="40" r="4.5" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-tertiary)" stroke-width="2" />
            <text x="276" y="21" font-size="7.5" font-weight="600" font-family="monospace" fill="var(--md-sys-color-on-surface-variant)">
              DESTINO
            </text>

            <!-- Anti-Collision Fleet Vehicle Nodes & Tonal Pill Labels -->
            @for (marker of placedMarkers(); track marker.vehicleId) {
              <g
                class="tel-corridor-node"
                role="button"
                tabindex="0"
                [attr.aria-label]="'Seleccionar ' + marker.vehicleId + ' (' + marker.progressPercent + '%)'"
                (click)="selectVehicle.emit(marker.vehicleId)"
                (keydown.enter)="selectVehicle.emit(marker.vehicleId)"
                (keydown.space)="$event.preventDefault(); selectVehicle.emit(marker.vehicleId)">
                <title>{{ marker.vehicleId }} ({{ marker.plate }}) • {{ marker.progressPercent }}%</title>

                @if (marker.needsLeader) {
                  <line
                    [attr.x1]="marker.x"
                    [attr.y1]="marker.y"
                    [attr.x2]="marker.pillX + marker.pillW / 2"
                    [attr.y2]="marker.pillY + (marker.pillY < marker.y ? 16 : 0)"
                    [attr.stroke]="getMarkerColor(marker.status, marker.isSelected)"
                    stroke-width="1"
                    stroke-opacity="0.55" />
                }

                @if (marker.isSelected) {
                  <circle
                    class="tel-corridor-pulse"
                    [attr.cx]="marker.x"
                    [attr.cy]="marker.y"
                    r="11"
                    fill="var(--md-sys-color-primary)"
                    opacity="0.24"
                    [class.animate-ping]="isLiveTelemetryActive() && !heroViewTransitionName()" />
                }

                <circle
                  class="tel-corridor-dot"
                  [attr.cx]="marker.x"
                  [attr.cy]="marker.y"
                  [attr.r]="marker.isSelected ? 6 : 4.5"
                  [attr.fill]="getMarkerColor(marker.status, marker.isSelected)"
                  stroke="var(--md-sys-color-surface)"
                  stroke-width="1.5" />

                <rect
                  [attr.x]="marker.pillX"
                  [attr.y]="marker.pillY"
                  [attr.width]="marker.pillW"
                  height="16"
                  rx="8"
                  [attr.fill]="marker.isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)'"
                  [attr.stroke]="marker.isSelected ? 'none' : 'var(--md-sys-color-outline-variant)'"
                  stroke-width="0.75" />

                <text
                  [attr.x]="marker.pillX + marker.pillW / 2"
                  [attr.y]="marker.pillY + 10.5"
                  text-anchor="middle"
                  font-size="7.5"
                  font-weight="700"
                  font-family="monospace"
                  [attr.fill]="marker.isSelected ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)'">
                  {{ marker.vehicleId }}
                </text>
              </g>
            }
          </g>
        </svg>
      </div>

      <!-- Active Dispatch Summary & Fullscreen Container Transform Trigger -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div class="min-w-0">
          <p class="text-label-md-emphasized text-main truncate">
            {{ corridorSummary().origin }} &rarr; {{ corridorSummary().destination }}
          </p>
          <p class="text-label-sm font-mono tabular-nums text-muted">
            Foco: {{ corridorSummary().vehicleId }} • {{ corridorSummary().progressPercent }}% • Vel. media {{ corridorSummary().averageSpeedKmh }} km/h
          </p>
        </div>

        <m3-button
          id="trigger-corridor-expand"
          variant="tonal"
          size="sm"
          icon="open_in_full"
          (action)="expandCorridor.emit()">
          Ampliar Mapa
        </m3-button>
      </div>
    </section>
  `
})
export class TelemetryCorridorPanelComponent {
  readonly corridorSummary = input.required<ActiveCorridorSummary>();
  readonly markers = input.required<CorridorVehicleMarker[]>();
  readonly waypoints = input<CorridorWaypoint[]>([]);
  readonly isLiveTelemetryActive = input.required<boolean>();
  readonly isHiddenForMorph = input<boolean>(false);
  readonly heroViewTransitionName = input<string | null>(null);

  readonly selectVehicle = output<string>();
  readonly expandCorridor = output<void>();

  readonly checkpointMarkers = computed<PositionedWaypoint[]>(() => {
    const raw = this.waypoints();
    if (raw.length === 0) return [];
    const selectedProg = this.corridorSummary().progressPercent;
    const progressStops = [25, 50, 75];
    return progressStops.map((pct, index) => {
      const pt = evaluateCorridorSplinePoint(pct);
      const wp = raw[index + 1];
      return {
        id: wp?.id ?? `CP-${pct}`,
        label: `Hito ${pct}% • ${wp?.name ?? 'Control Corredor'}`,
        x: pt.x,
        y: pt.y,
        isPassed: selectedProg >= pct
      };
    });
  });

  /** Avoids overlap with peer labels AND sampled spline stroke geometry. */
  readonly placedMarkers = computed<PlacedCorridorMarker[]>(() => {
    const raw = [...this.markers()].sort((a, b) => a.x - b.x);
    const occupied: { x: number; y: number; w: number; h: number }[] = [
      { x: 2, y: 112, w: 44, h: 16 },
      { x: 270, y: 10, w: 48, h: 16 }
    ];

    for (let pct = 5; pct <= 95; pct += 10) {
      const pt = evaluateCorridorSplinePoint(pct);
      occupied.push({ x: pt.x - 8, y: pt.y - 8, w: 16, h: 16 });
    }

    const placed: PlacedCorridorMarker[] = [];

    for (const m of raw) {
      const pillW = Math.max(46, m.vehicleId.length * 6.2 + 10);
      let chosenX = Math.max(-16, Math.min(340 - SVG_OFFSET_X - pillW, m.x - pillW / 2));
      let chosenY = m.y - 26;

      for (const [dx, dy] of LABEL_OFFSETS) {
        const candX = Math.max(-18, Math.min(344 - SVG_OFFSET_X - pillW, Math.round(m.x + dx)));
        const candY = Math.max(-18, Math.min(156 - SVG_OFFSET_Y - PILL_H, Math.round(m.y + dy)));

        const collides = occupied.some(
          box =>
            candX < box.x + box.w + 3 &&
            candX + pillW + 3 > box.x &&
            candY < box.y + box.h + 3 &&
            candY + PILL_H + 3 > box.y
        );

        if (!collides) {
          chosenX = candX;
          chosenY = candY;
          break;
        }
      }

      occupied.push({ x: chosenX, y: chosenY, w: pillW, h: PILL_H });

      const pillCenterX = chosenX + pillW / 2;
      const pillCenterY = chosenY + PILL_H / 2;
      const dist = Math.hypot(pillCenterX - m.x, pillCenterY - m.y);

      placed.push({
        ...m,
        pillX: chosenX,
        pillY: chosenY,
        pillW,
        needsLeader: dist > 23
      });
    }

    return placed.sort((a, b) => Number(a.isSelected) - Number(b.isSelected));
  });

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
}
