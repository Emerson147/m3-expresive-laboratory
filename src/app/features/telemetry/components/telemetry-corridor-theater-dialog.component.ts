import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ActiveCorridorSummary,
  CorridorVehicleMarker,
  CorridorWaypoint,
  LiveTelemetryEvent,
  Vehicle,
  VehicleStatus
} from '../../../core/telemetry/telemetry.models';
import { evaluateCorridorSplinePoint } from '../../../core/telemetry/telemetry.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

interface TheaterMarkerLayout extends CorridorVehicleMarker {
  sx: number;
  sy: number;
  pillX: number;
  pillY: number;
  pillW: number;
  needsLeader: boolean;
}

interface TheaterCheckpoint {
  id: string;
  label: string;
  pctLabel: string;
  x: number;
  y: number;
  isPassed: boolean;
}

// Keep spline comfortably in y = 40..205 so bottom milestone axis at y = 252..276 never collides with route stroke
const SCALE_X = 2.25;
const OFFSET_X = 25;
const SCALE_Y = 1.65;
const OFFSET_Y = -8;
const THEATER_PILL_H = 24;

const THEATER_LABEL_OFFSETS: readonly (readonly [number, number])[] = [
  [-56, -42],
  [-56, 20],
  [-116, -42],
  [10, -42],
  [-116, 20],
  [10, 20],
  [-56, -68],
  [-56, 46],
  [-124, -68],
  [18, 46]
];

@Component({
  selector: 'app-telemetry-corridor-theater-dialog',
  standalone: true,
  imports: [M3DialogComponent, M3ButtonComponent, M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="expressive"
      size="fullscreen"
      tone="primary"
      icon="route"
      headline="Centro Geoespacial del Corredor"
      [subtitle]="corridorSummary().corridorName + ' • ' + corridorSummary().origin + ' → ' + corridorSummary().destination"
      [aurora]="true"
      [open]="open()"
      [managedClose]="true"
      [viewTransitionName]="viewTransitionName()"
      closeLabel="Contraer centro geoespacial"
      (closeRequested)="closeRequested.emit()">

      <div dialog-header-extra class="flex flex-wrap items-center gap-2">
        <span
          [class]="'px-3 py-1 rounded-m3-full text-label-md-emphasized font-mono inline-flex items-center gap-1.5 ' +
            (isLiveTelemetryActive() ? 'bg-success-box text-on-success-box' : 'bg-surface-high text-muted')">
          <span
            [class]="'w-2 h-2 rounded-m3-full ' + (isLiveTelemetryActive() ? 'bg-success animate-pulse' : 'bg-outline')"
            aria-hidden="true"></span>
          <span>{{ isLiveTelemetryActive() ? 'LIVE GPS' : 'GPS EN PAUSA' }}</span>
        </span>

        <span class="px-3 py-1 rounded-m3-full bg-surface text-main text-label-md-emphasized font-mono tabular-nums border border-outline-sub/60">
          {{ vehicles().length }} unidades en línea
        </span>

        <span class="hidden sm:inline-flex px-3 py-1 rounded-m3-full bg-surface text-primary text-label-md-emphasized font-mono tabular-nums border border-outline-sub/60">
          Vel. media {{ corridorSummary().averageSpeedKmh }} km/h
        </span>
      </div>

      <!-- Fullscreen 2-Column Mission Control Breakdown (Opaque Tonal Surfaces for Smooth 120fps Morph) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start max-w-7xl w-full mx-auto py-1">

        <!-- Left (8 cols): Wide High-Detail Vector Corridor + Complete 6-Sensor Live Strip -->
        <div class="lg:col-span-8 flex flex-col gap-5 min-w-0">
          <div class="bg-surface rounded-m3-xl p-4 sm:p-5 border border-outline-sub/60">
            <svg
              class="w-full h-auto max-h-[340px]"
              viewBox="0 0 760 296"
              fill="none"
              role="img"
              [attr.aria-label]="'Mapa geoespacial ampliado del ' + corridorSummary().corridorName + ' enfocando ' + selectedVehicle().id"
              xmlns="http://www.w3.org/2000/svg">

              <defs>
                <linearGradient id="tel-theater-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="var(--md-sys-color-primary)" />
                  <stop offset="100%" stop-color="var(--md-sys-color-tertiary)" />
                </linearGradient>
              </defs>

              <!-- Geospatial Grid Lines -->
              <line x1="24" y1="54" x2="736" y2="54" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="4 6" />
              <line x1="24" y1="120" x2="736" y2="120" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="4 6" />
              <line x1="24" y1="186" x2="736" y2="186" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="4 6" />

              <!-- Dedicated Bottom Milestone Baseline Rail (Zero Overlap With Spline) -->
              <line x1="70" y1="252" x2="700" y2="252" stroke="var(--md-sys-color-outline-variant)" stroke-opacity="0.55" stroke-width="1.5" />

              <!-- Corridor Route Base Spline (x = 25 + x*2.25, y = -8 + y*1.65) -->
              <path
                d="M 70 157 C 182.5 190, 250 41.5, 385 74.5 C 520 107.5, 610 173.5, 700 58"
                stroke="var(--md-sys-color-surface-container-highest)"
                stroke-width="8"
                stroke-linecap="round" />

              <!-- Traversed Distance Path synced to Focused Vehicle -->
              @if (selectedVehicle().progressPercent > 0) {
                <path
                  d="M 70 157 C 182.5 190, 250 41.5, 385 74.5 C 520 107.5, 610 173.5, 700 58"
                  pathLength="100"
                  [attr.stroke-dasharray]="selectedVehicle().progressPercent + ' 100'"
                  stroke="url(#tel-theater-grad)"
                  stroke-width="8"
                  stroke-linecap="round" />
              }

              <!-- Corridor Terminals Linked to Baseline Axis -->
              <line x1="70" y1="157" x2="70" y2="252" stroke="var(--md-sys-color-outline-variant)" stroke-opacity="0.4" stroke-dasharray="2 3" />
              <circle cx="70" cy="157" r="7" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-primary)" stroke-width="3" />
              <circle cx="70" cy="252" r="3.5" fill="var(--md-sys-color-primary)" />
              <text x="70" y="272" text-anchor="middle" font-size="10" font-weight="700" font-family="monospace" fill="var(--md-sys-color-on-surface-variant)">
                ORIGEN · 0%
              </text>

              <line x1="700" y1="58" x2="700" y2="252" stroke="var(--md-sys-color-outline-variant)" stroke-opacity="0.4" stroke-dasharray="2 3" />
              <circle cx="700" cy="58" r="7" fill="var(--md-sys-color-surface)" stroke="var(--md-sys-color-tertiary)" stroke-width="3" />
              <circle cx="700" cy="252" r="3.5" fill="var(--md-sys-color-tertiary)" />
              <text x="700" y="272" text-anchor="middle" font-size="10" font-weight="700" font-family="monospace" fill="var(--md-sys-color-on-surface-variant)">
                DESTINO · 100%
              </text>

              <!-- Intermediate Checkpoints Projected Cleanly to Bottom Milestone Rail -->
              @for (cp of checkpoints(); track cp.id) {
                <g>
                  <line
                    [attr.x1]="cp.x"
                    [attr.y1]="cp.y"
                    [attr.x2]="cp.x"
                    y2="252"
                    stroke="var(--md-sys-color-outline-variant)"
                    stroke-opacity="0.35"
                    stroke-dasharray="2 3" />
                  <circle
                    [attr.cx]="cp.x"
                    [attr.cy]="cp.y"
                    r="5"
                    [attr.fill]="cp.isPassed ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface)'"
                    [attr.stroke]="cp.isPassed ? 'var(--md-sys-color-surface)' : 'var(--md-sys-color-outline)'"
                    stroke-width="2" />
                  <circle
                    [attr.cx]="cp.x"
                    cy="252"
                    r="3.5"
                    [attr.fill]="cp.isPassed ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)'" />
                  <text
                    [attr.x]="cp.x"
                    y="272"
                    text-anchor="middle"
                    font-size="10"
                    font-family="monospace"
                    font-weight="600"
                    [attr.fill]="cp.isPassed ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)'">
                    {{ cp.label }} · {{ cp.pctLabel }}
                  </text>
                </g>
              }

              <!-- Interactive Curve-Avoiding Convoy Nodes -->
              @for (m of placedMarkers(); track m.vehicleId) {
                <g
                  class="tel-corridor-node"
                  role="button"
                  tabindex="0"
                  [attr.aria-label]="'Enfocar ' + m.vehicleId + ' al ' + m.progressPercent + '%'"
                  (click)="selectVehicle.emit(m.vehicleId)"
                  (keydown.enter)="selectVehicle.emit(m.vehicleId)"
                  (keydown.space)="$event.preventDefault(); selectVehicle.emit(m.vehicleId)">
                  <title>{{ m.vehicleId }} ({{ m.plate }}) • {{ m.progressPercent }}%</title>

                  @if (m.needsLeader) {
                    <line
                      [attr.x1]="m.sx"
                      [attr.y1]="m.sy"
                      [attr.x2]="m.pillX + m.pillW / 2"
                      [attr.y2]="m.pillY + (m.pillY < m.sy ? 24 : 0)"
                      [attr.stroke]="getMarkerColor(m.status, m.isSelected)"
                      stroke-width="1.25"
                      stroke-opacity="0.65" />
                  }

                  @if (m.isSelected) {
                    <circle
                      class="tel-corridor-pulse"
                      [attr.cx]="m.sx"
                      [attr.cy]="m.sy"
                      r="16"
                      fill="var(--md-sys-color-primary)"
                      opacity="0.24"
                      [class.animate-ping]="isLiveTelemetryActive() && !viewTransitionName()" />
                  }

                  <circle
                    class="tel-corridor-dot"
                    [attr.cx]="m.sx"
                    [attr.cy]="m.sy"
                    [attr.r]="m.isSelected ? 8.5 : 6.5"
                    [attr.fill]="getMarkerColor(m.status, m.isSelected)"
                    stroke="var(--md-sys-color-surface)"
                    stroke-width="2" />

                  <rect
                    [attr.x]="m.pillX"
                    [attr.y]="m.pillY"
                    [attr.width]="m.pillW"
                    height="24"
                    rx="12"
                    [attr.fill]="m.isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)'"
                    [attr.stroke]="m.isSelected ? 'none' : 'var(--md-sys-color-outline-variant)'"
                    stroke-width="1" />

                  <text
                    [attr.x]="m.pillX + m.pillW / 2"
                    [attr.y]="m.pillY + 15.5"
                    text-anchor="middle"
                    font-size="10.5"
                    font-weight="700"
                    font-family="monospace"
                    [attr.fill]="m.isSelected ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)'">
                    {{ m.vehicleId }} · {{ m.progressPercent }}%
                  </text>
                </g>
              }
            </svg>
          </div>

          <!-- Focused Vehicle Live Progress Strip + All 6 CAN-BUS Metrics In-Place -->
          <section
            aria-label="Detalle de avance y sensores de unidad enfocada"
            class="bg-surface rounded-m3-xl p-5 border border-outline-sub/60 space-y-3.5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="px-3 py-1 rounded-m3-full bg-primary text-on-primary text-label-md-emphasized font-mono tabular-nums">
                  {{ selectedVehicle().id }}
                </span>
                <div class="min-w-0">
                  <h3 class="text-title-md-emphasized text-main truncate">
                    {{ selectedVehicle().origin }} &rarr; {{ selectedVehicle().destination }}
                  </h3>
                  <p class="text-body-sm text-muted truncate">
                    Operador: {{ selectedVehicle().driver }} • Placa {{ selectedVehicle().plate }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2.5 font-mono tabular-nums shrink-0">
                <span class="px-2.5 py-1 rounded-m3-md bg-surface-high text-label-md-emphasized text-main">
                  {{ selectedVehicle().speedKmh }} km/h
                </span>
                <span class="px-2.5 py-1 rounded-m3-md bg-primary-box text-on-primary-box text-label-md-emphasized">
                  ETA {{ selectedVehicle().etaMinutes }} min
                </span>
              </div>
            </div>

            @if (open()) {
              <m3-linear-progress
                [value]="selectedVehicle().progressPercent"
                [wavy]="true"
                [paused]="!isLiveTelemetryActive() || viewTransitionName() !== null"
                size="lg"
                color="primary"
                [ariaLabel]="'Progreso en corredor de ' + selectedVehicle().id" />
            }

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 font-mono tabular-nums">
              <div class="p-3 rounded-m3-lg bg-surface-low">
                <span class="text-label-sm text-muted font-sans block">Combustible</span>
                <span class="text-title-sm-emphasized text-main">{{ selectedVehicle().telemetry.fuelLevelPercent }}%</span>
              </div>
              <div class="p-3 rounded-m3-lg bg-surface-low">
                <span class="text-label-sm text-muted font-sans block">Motor</span>
                <span class="text-title-sm-emphasized text-main">{{ selectedVehicle().telemetry.engineRpm }} RPM</span>
              </div>
              <div class="p-3 rounded-m3-lg bg-surface-low">
                <span class="text-label-sm text-muted font-sans block">Batería</span>
                <span class="text-title-sm-emphasized text-main">{{ selectedVehicle().telemetry.batteryVolts }} V</span>
              </div>
              <div class="p-3 rounded-m3-lg bg-surface-low">
                <span class="text-label-sm text-muted font-sans block">Neumáticos</span>
                <span class="text-title-sm-emphasized text-main">{{ selectedVehicle().telemetry.tirePressurePsi }} PSI</span>
              </div>
              <div class="p-3 rounded-m3-lg bg-surface-low">
                <span class="text-label-sm text-muted font-sans block">Carga Térmica</span>
                <span
                  [class]="'text-title-sm-emphasized ' + (selectedVehicle().cargoTempC < 0 ? 'text-tertiary' : 'text-main')">
                  {{ selectedVehicle().cargoTempC }}°C
                </span>
              </div>
              <div class="p-3 rounded-m3-lg bg-surface-low">
                <span class="text-label-sm text-muted font-sans block">Último Ping</span>
                <span class="text-title-sm-emphasized text-main">{{ selectedVehicle().lastPingTime }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Right (4 cols): Convoy Breakdown + Focused Unit Events -->
        <div class="lg:col-span-4 flex flex-col gap-4 min-w-0">
          <section
            aria-label="Unidades en el corredor"
            class="bg-surface rounded-m3-xl p-4 sm:p-5 border border-outline-sub/60 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-title-sm-emphasized text-main">Convoy Activo</h3>
              <span class="text-label-sm font-mono tabular-nums text-muted">Clic para enfocar</span>
            </div>

            <div class="flex flex-col gap-2">
              @for (v of vehicles(); track v.id) {
                @let isSel = v.id === selectedVehicle().id;
                <button
                  type="button"
                  (click)="selectVehicle.emit(v.id)"
                  [attr.aria-pressed]="isSel"
                  [class]="'tel-theater-convoy-btn state-layer focus-ring-m3 w-full text-left p-3 rounded-m3-lg flex items-center justify-between gap-2.5 cursor-pointer m3-transition-fast ' +
                    (isSel ? 'bg-primary-box text-on-primary-box shadow-m3-level1' : 'bg-surface-low hover:bg-surface-high text-main')">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono text-label-lg-emphasized tabular-nums">{{ v.id }}</span>
                      <span class="text-label-sm opacity-80 truncate">• {{ v.driver }}</span>
                    </div>
                    <p class="text-label-sm opacity-80 truncate m-0">
                      {{ v.destination }}
                    </p>
                  </div>

                  <div class="text-right font-mono tabular-nums shrink-0">
                    <span class="text-label-lg-emphasized block">{{ v.progressPercent }}%</span>
                    <span class="text-label-sm opacity-80 block">{{ v.etaMinutes }}m</span>
                  </div>
                </button>
              }
            </div>
          </section>

          <section
            aria-label="Incidencias recientes del vehículo enfocado"
            class="bg-surface rounded-m3-xl p-4 sm:p-5 border border-outline-sub/60 space-y-2.5">
            <h3 class="text-title-sm-emphasized text-main">Bitácora de {{ selectedVehicle().id }}</h3>
            @if (selectedEvents().length > 0) {
              <ul class="list-none m-0 p-0 space-y-2">
                @for (evt of selectedEvents(); track evt.id) {
                  <li class="p-3 rounded-m3-lg bg-surface-low flex items-start justify-between gap-2">
                    <span class="text-body-sm text-main leading-snug">{{ evt.message }}</span>
                    <time class="text-label-sm font-mono tabular-nums text-muted shrink-0">{{ evt.timestamp }}</time>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-body-sm text-muted m-0">Sin alertas recientes para esta unidad.</p>
            }
          </section>
        </div>
      </div>

      <span dialog-actions-start class="text-label-md text-muted font-mono hidden sm:inline">
        {{ corridorSummary().corridorName }}
      </span>

      <div dialog-actions class="flex items-center gap-2.5">
        <m3-button
          variant="filled"
          icon="close_fullscreen"
          (action)="closeRequested.emit()">
          Contraer
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class TelemetryCorridorTheaterDialogComponent {
  readonly open = input<boolean>(false);
  readonly viewTransitionName = input<string | null>(null);
  readonly corridorSummary = input.required<ActiveCorridorSummary>();
  readonly selectedVehicle = input.required<Vehicle>();
  readonly vehicles = input.required<Vehicle[]>();
  readonly markers = input.required<CorridorVehicleMarker[]>();
  readonly waypoints = input<CorridorWaypoint[]>([]);
  readonly events = input<LiveTelemetryEvent[]>([]);
  readonly isLiveTelemetryActive = input.required<boolean>();

  readonly closeRequested = output<void>();
  readonly selectVehicle = output<string>();

  readonly selectedEvents = computed(() => {
    const id = this.selectedVehicle().id;
    return this.events().filter(e => e.vehicleId === id).slice(0, 3);
  });

  readonly checkpoints = computed<TheaterCheckpoint[]>(() => {
    const prog = this.selectedVehicle().progressPercent;
    const raw = this.waypoints();
    const stops = [
      { pct: 25, label: raw[1]?.name && !raw[1].name.startsWith('Trk') ? raw[1].name : 'Peaje Sur' },
      { pct: 50, label: raw[2]?.name && !raw[2].name.startsWith('Trk') ? raw[2].name : 'Hub Central' },
      { pct: 75, label: raw[3]?.name && !raw[3].name.startsWith('Trk') ? raw[3].name : 'Garita Norte' }
    ];
    return stops.map((s, idx) => {
      const pt = evaluateCorridorSplinePoint(s.pct);
      return {
        id: `theater-cp-${idx}`,
        label: s.label,
        pctLabel: `${s.pct}%`,
        x: Math.round(OFFSET_X + pt.x * SCALE_X),
        y: Math.round(OFFSET_Y + pt.y * SCALE_Y),
        isPassed: prog >= s.pct
      };
    });
  });

  /** Guarantees vehicle pills avoid both peer pills AND the spline curve itself. */
  readonly placedMarkers = computed<TheaterMarkerLayout[]>(() => {
    const raw = [...this.markers()].sort((a, b) => a.x - b.x);
    const occupied: { x: number; y: number; w: number; h: number }[] = [
      // Bottom milestone rail safety band
      { x: 0, y: 238, w: 760, h: 58 }
    ];

    // Sample points along the spline stroke so truck badges stay cleanly off the curve
    for (let pct = 0; pct <= 100; pct += 5) {
      const pt = evaluateCorridorSplinePoint(pct);
      const sx = Math.round(OFFSET_X + pt.x * SCALE_X);
      const sy = Math.round(OFFSET_Y + pt.y * SCALE_Y);
      occupied.push({ x: sx - 14, y: sy - 14, w: 28, h: 28 });
    }

    const out: TheaterMarkerLayout[] = [];
    for (const m of raw) {
      const sx = Math.round(OFFSET_X + m.x * SCALE_X);
      const sy = Math.round(OFFSET_Y + m.y * SCALE_Y);
      const text = `${m.vehicleId} · ${m.progressPercent}%`;
      const pillW = Math.max(96, Math.round(text.length * 7.2 + 18));

      let chosenX = Math.max(12, Math.min(748 - pillW, sx - Math.round(pillW / 2)));
      let chosenY = sy - 42;

      for (const [dx, dy] of THEATER_LABEL_OFFSETS) {
        const candX = Math.max(12, Math.min(748 - pillW, sx + dx));
        const candY = Math.max(10, Math.min(232 - THEATER_PILL_H, sy + dy));
        const collides = occupied.some(
          box =>
            candX < box.x + box.w + 6 &&
            candX + pillW + 6 > box.x &&
            candY < box.y + box.h + 5 &&
            candY + THEATER_PILL_H + 5 > box.y
        );
        if (!collides) {
          chosenX = candX;
          chosenY = candY;
          break;
        }
      }

      occupied.push({ x: chosenX, y: chosenY, w: pillW, h: THEATER_PILL_H });
      const dist = Math.hypot(chosenX + pillW / 2 - sx, chosenY + THEATER_PILL_H / 2 - sy);

      out.push({
        ...m,
        sx,
        sy,
        pillX: chosenX,
        pillY: chosenY,
        pillW,
        needsLeader: dist > 32
      });
    }

    return out.sort((a, b) => Number(a.isSelected) - Number(b.isSelected));
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
