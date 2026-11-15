import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  viewChild
} from '@angular/core';
import { observePrefersReducedMotion } from './progress-motion.controller';
import {
  DEFAULT_LOADING_DIAMETER_DP,
  DEFAULT_LOADING_GLOBAL_ROTATION_MS,
  DEFAULT_LOADING_MORPH_INTERVAL_MS,
  LOADING_ACTIVE_SHAPE_RATIO,
  MAX_LOADING_DIAMETER_DP,
  MIN_LOADING_DIAMETER_DP,
  evaluateLoadingStepSpring
} from './progress-motion.util';

export type M3LoadingIndicatorSize = 'sm' | 'md' | 'lg';
export type M3LoadingIndicatorColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color';

/** Uniform Cubic Bezier segment count shared across every M3 LoadingIndicator polygon. */
export const M3_LOADING_SEGMENT_COUNT = 180;
const CENTER = 24;

interface Point2D {
  x: number;
  y: number;
}

const round2 = (v: number): number => Math.round(v * 100) / 100;

/**
 * Converts a closed ring of N points into a uniform N-segment Cubic Bezier SVG path
 * using Catmull-Rom tangents so every canonical M3 shape shares exact vertex alignment.
 */
function buildClosedSplinePath(points: readonly Point2D[], tension = 1 / 6): string {
  const n = points.length;
  let d = `M ${round2(points[0].x)},${round2(points[0].y)}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${round2(c1x)},${round2(c1y)} ${round2(c2x)},${round2(c2y)} ${round2(p2.x)},${round2(p2.y)}`;
  }

  return `${d} Z`;
}

/**
 * Exact Minkowski convex envelope of a regular N-gon (circumscribed corner circles of
 * `cornerRadius` tangent to straight flat edges) sampled radially without edge notches.
 */
function createRoundedRegularPolygonPoints(
  sides: number,
  outerRadius: number,
  cornerRadius: number
): Point2D[] {
  const safeCorner = Math.min(cornerRadius, outerRadius * 0.65);
  const cornerRing = outerRadius - safeCorner;
  const sector = (2 * Math.PI) / sides;
  const halfSector = sector / 2;
  const phiTan = Math.atan2(
    safeCorner * Math.sin(halfSector),
    cornerRing + safeCorner * Math.cos(halfSector)
  );
  const apothem = cornerRing * Math.cos(halfSector) + safeCorner;

  return createPolarShapePoints(theta => {
    const rel = ((theta + Math.PI / 2) % sector + sector) % sector;
    const dVert = Math.min(rel, sector - rel);

    if (dVert <= phiTan) {
      const tangentLeg = cornerRing * Math.sin(dVert);
      return cornerRing * Math.cos(dVert) + Math.sqrt(Math.max(0, safeCorner * safeCorner - tangentLeg * tangentLeg));
    }

    return apothem / Math.cos(halfSector - dVert);
  });
}

function createStadiumCapsulePoints(
  majorRadius: number,
  minorRadius: number,
  tiltRad: number
): Point2D[] {
  const flatHalf = Math.max(0, majorRadius - minorRadius);

  return createPolarShapePoints(theta => {
    const rot = theta + tiltRad;
    const c = Math.abs(Math.cos(rot));
    const s = Math.abs(Math.sin(rot));

    if (s * flatHalf >= c * minorRadius) {
      return minorRadius / s;
    }

    const leg = flatHalf * s;
    return flatHalf * c + Math.sqrt(Math.max(0, minorRadius * minorRadius - leg * leg));
  });
}

function createPolarShapePoints(
  radiusFn: (theta: number) => number,
  angleOffsetRad = 0
): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i < M3_LOADING_SEGMENT_COUNT; i++) {
    const theta = -Math.PI / 2 + angleOffsetRad + (2 * Math.PI * i) / M3_LOADING_SEGMENT_COUNT;
    const r = radiusFn(theta);
    points.push({
      x: CENTER + r * Math.cos(theta),
      y: CENTER + r * Math.sin(theta)
    });
  }
  return points;
}

function normalizedScallopLobe(halfFreqAngle: number, epsilon: number): number {
  const min = Math.sqrt(epsilon);
  const max = Math.sqrt(1 + epsilon);
  const c = Math.cos(halfFreqAngle);
  return (Math.sqrt(c * c + epsilon) - min) / (max - min);
}

// Precompute canonical M3 Expressive geometric shapes (38dp optical footprint inside 48dp box),
// calibrated 1:1 against the official M3 Shape Overview specification:
const SOFT_BURST_POINTS = createPolarShapePoints(theta => {
  const phi = theta + Math.PI / 2;
  return 14.4 + 4.6 * Math.pow(0.5 + 0.5 * Math.cos(10 * phi), 0.92);
});

const COOKIE9_POINTS = createPolarShapePoints(theta => {
  const phi = theta + Math.PI / 2;
  return 16.5 + 2.5 * normalizedScallopLobe(4.5 * phi, 0.055);
});

const PENTAGON_POINTS = createRoundedRegularPolygonPoints(5, 19.0, 4.5);

// Official M3 Pill & Oval both lean +45deg bottom-left -> top-right (theta + pi/4 in SVG +y-down).
const PILL_POINTS = createStadiumCapsulePoints(19.0, 14.8, Math.PI / 4);

const SUNNY_POINTS = createPolarShapePoints(theta => {
  const phi = theta + Math.PI / 2;
  return 15.8 + 3.2 * Math.pow(0.5 + 0.5 * Math.cos(8 * phi), 0.85);
});

// 4-sided cookie features rounded corners along diagonals (±45deg, ±135deg) and gentle cardinal waists.
const COOKIE4_POINTS = createPolarShapePoints(theta => {
  return 14.5 + 4.1 * Math.pow(0.5 - 0.5 * Math.cos(4 * theta), 0.72);
});

const OVAL_POINTS = createPolarShapePoints(theta => {
  const rot = theta + Math.PI / 4;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return 1 / Math.sqrt((c * c) / (19.0 * 19.0) + (s * s) / (13.0 * 13.0));
});

const CIRCLE_POINTS = createPolarShapePoints(() => 19.0);
// M3 Determinate Pull-to-Refresh starts Circle with +18deg phase offset so chord morph -> SoftBurst flows into 108deg rotational symmetry.
const CIRCLE_DETERMINATE_POINTS = createPolarShapePoints(() => 19.0, Math.PI / 10);

/** Canonical M3 Expressive Indeterminate 7-polygon sequence labels. */
export const M3_LOADING_SHAPE_NAMES = [
  'SoftBurst',
  'Cookie9',
  'Pentagon',
  'Pill',
  'Sunny',
  'Cookie4',
  'Oval'
] as const;

export type M3LoadingShapeName = (typeof M3_LOADING_SHAPE_NAMES)[number];

/** M3 Expressive Soft Burst (10-ray soft radial burst, 38dp footprint in 48dp box) */
export const M3_SOFT_BURST_PATH = buildClosedSplinePath(SOFT_BURST_POINTS);

/** M3 Expressive 9-Sided Scalloped Cookie (Cookie9Sided) */
export const M3_COOKIE9_PATH = buildClosedSplinePath(COOKIE9_POINTS);

/** M3 Expressive Rounded Pentagon (38dp outer envelope) */
export const M3_PENTAGON_PATH = buildClosedSplinePath(PENTAGON_POINTS);

/** M3 Expressive Tilted Pill / Capsule (45deg oval-stadium) */
export const M3_PILL_PATH = buildClosedSplinePath(PILL_POINTS);

/** M3 Expressive Sunny (8-ray broad rounded sunburst, ~0.83 inner radius ratio) */
export const M3_SUNNY_PATH = buildClosedSplinePath(SUNNY_POINTS);

/** M3 Expressive 4-Sided Cookie (diagonal ±45deg cushion lobes with soft cardinal waists) */
export const M3_COOKIE4_PATH = buildClosedSplinePath(COOKIE4_POINTS);

/** M3 Expressive Tilted Oval (+45deg bottom-left to top-right organic ellipse) */
export const M3_OVAL_PATH = buildClosedSplinePath(OVAL_POINTS);

/** M3 Expressive Perfect Circle (38dp diameter inside 48dp viewBox) */
export const M3_CIRCLE_PATH = buildClosedSplinePath(CIRCLE_POINTS);

const INDETERMINATE_SEQUENCE: readonly (readonly Point2D[])[] = [
  SOFT_BURST_POINTS,
  COOKIE9_POINTS,
  PENTAGON_POINTS,
  PILL_POINTS,
  SUNNY_POINTS,
  COOKIE4_POINTS,
  OVAL_POINTS
];

export interface LoadingIndicatorFrame {
  readonly d: string;
  readonly angleDeg: number;
  readonly stepIndex: number;
  readonly springFactor: number;
}

export interface LoadingIndicatorTelemetrySnapshot {
  readonly elapsedMs: number;
  readonly stepIndex: number;
  readonly shapeName: M3LoadingShapeName | 'Circle -> SoftBurst';
  readonly nextShapeName: M3LoadingShapeName;
  readonly springFactor: number;
  readonly angleDeg: number;
  readonly isIndeterminate: boolean;
  readonly progress: number | null;
  readonly diameterDp: number;
  readonly shapeDp: number;
  readonly paused: boolean;
}

function interpolatePointRings(
  from: readonly Point2D[],
  to: readonly Point2D[],
  factor: number,
  scratchPoints?: Point2D[]
): Point2D[] {
  const target =
    scratchPoints && scratchPoints.length === M3_LOADING_SEGMENT_COUNT
      ? scratchPoints
      : Array.from({ length: M3_LOADING_SEGMENT_COUNT }, () => ({ x: CENTER, y: CENTER }));

  for (let i = 0; i < M3_LOADING_SEGMENT_COUNT; i++) {
    target[i].x = from[i].x + (to[i].x - from[i].x) * factor;
    target[i].y = from[i].y + (to[i].y - from[i].y) * factor;
  }

  return target;
}

/**
 * Evaluates a single frame of M3 Expressive Indeterminate LoadingIndicator choreography:
 * 650ms spring steps (dampingRatio = 0.6, stiffness = 200) morphing through all 7 polygons
 * paired with +90deg spring quarter-turns and continuous 4666ms baseline rotation.
 */
export function computeLoadingIndicatorFrame(
  elapsedMs: number,
  scratchPoints?: Point2D[]
): LoadingIndicatorFrame {
  const safeMs = Math.max(0, elapsedMs);
  const stepIndex = Math.floor(safeMs / DEFAULT_LOADING_MORPH_INTERVAL_MS);
  const stepElapsedSec = (safeMs % DEFAULT_LOADING_MORPH_INTERVAL_MS) / 1000;
  const springFactor = evaluateLoadingStepSpring(stepElapsedSec);

  const count = INDETERMINATE_SEQUENCE.length;
  const from = INDETERMINATE_SEQUENCE[stepIndex % count];
  const to = INDETERMINATE_SEQUENCE[(stepIndex + 1) % count];
  const target = interpolatePointRings(from, to, springFactor, scratchPoints);

  const stepAngleDeg = (stepIndex + springFactor) * 90;
  const baselineAngleDeg = (safeMs / DEFAULT_LOADING_GLOBAL_ROTATION_MS) * 360;

  return {
    d: buildClosedSplinePath(target),
    angleDeg: (stepAngleDeg + baselineAngleDeg) % 360,
    stepIndex,
    springFactor
  };
}

/**
 * Evaluates M3 Expressive Determinate LoadingIndicator frame (`progress` in [0, 1]),
 * typically driven by pull-to-refresh drag gesture:
 * morphs Circle (+18deg phase) into SoftBurst across +90deg rotation (ending at 108deg symmetry).
 */
export function computeDeterminateLoadingFrame(
  progress: number,
  scratchPoints?: Point2D[]
): LoadingIndicatorFrame {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const target = interpolatePointRings(
    CIRCLE_DETERMINATE_POINTS,
    SOFT_BURST_POINTS,
    clamped,
    scratchPoints
  );

  return {
    d: buildClosedSplinePath(target),
    angleDeg: 18 + clamped * 90,
    stepIndex: 0,
    springFactor: clamped
  };
}

@Component({
  selector: 'm3-loading-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center justify-center'
  },
  template: `
    <div
      [class]="containerClasses()"
      [style.width.px]="containerDiameterPx()"
      [style.height.px]="containerDiameterPx()">
      <div
        role="progressbar"
        [class]="computedClasses()"
        [style.width.px]="clampedDiameter()"
        [style.height.px]="clampedDiameter()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-valuenow]="determinatePercent()"
        [attr.aria-valuemin]="determinatePercent() !== null ? 0 : null"
        [attr.aria-valuemax]="determinatePercent() !== null ? 100 : null">

        <svg
          #shapeSvg
          class="m3-loading-shape-svg"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg">

          <!-- Spring-driven M3 Expressive Contour (Indeterminate 7-shape loop or Determinate Circle->SoftBurst) -->
          <path
            #shapePath
            class="m3-loading-shape-path"
            [attr.d]="initialPathD()" />
        </svg>
      </div>
    </div>
  `
})
export class M3LoadingIndicatorComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly shapeSvgRef = viewChild<ElementRef<SVGSVGElement>>('shapeSvg');
  private readonly shapePathRef = viewChild<ElementRef<SVGPathElement>>('shapePath');

  /** Preset scale: sm (32dp), md (48dp canonical M3 box with 38dp active shape), lg (64dp hero) */
  readonly size = input<M3LoadingIndicatorSize>('md');

  /** Optional custom outer container diameter in dp/px (clamped to official M3 24–240dp range) */
  readonly diameter = input<number | null>(null);

  /** Optional determinate progress in [0, 1] (pull-to-refresh gesture: Circle +18deg -> SoftBurst) */
  readonly progress = input<number | null>(null);

  /** Freezes indeterminate spring RAF cleanly at current frame without resetting state */
  readonly paused = input<boolean>(false);

  /** Semantic OKLCH color theme */
  readonly color = input<M3LoadingIndicatorColor>('primary');

  /** If true, wraps the indicator in an explicit backing container shape (M3 Contained: primary-container / on-primary-container) */
  readonly contained = input<boolean>(false);

  /** Floating surface badge extension (e.g. pull-to-refresh over complex backgrounds) */
  readonly elevated = input<boolean>(false);

  /** Accessible action + context label */
  readonly ariaLabel = input<string>('Cargando contenido...');

  /** Additional classes */
  readonly customClass = input<string>('');

  /** Respect OS/user motion preference by halting spring RAF and freezing on static shape */
  readonly prefersReducedMotion = observePrefersReducedMotion();

  readonly softBurstPath = M3_SOFT_BURST_PATH;
  readonly cookie9Path = M3_COOKIE9_PATH;
  readonly pentagonPath = M3_PENTAGON_PATH;
  readonly pillPath = M3_PILL_PATH;
  readonly sunnyPath = M3_SUNNY_PATH;
  readonly flowerPath = M3_COOKIE4_PATH;
  readonly ovalPath = M3_OVAL_PATH;
  readonly circlePath = M3_CIRCLE_PATH;

  readonly clampedDiameter = computed<number | null>(() => {
    const custom = this.diameter();
    if (custom === null || !Number.isFinite(custom)) {
      return null;
    }
    return Math.round(Math.min(MAX_LOADING_DIAMETER_DP, Math.max(MIN_LOADING_DIAMETER_DP, custom)));
  });

  readonly effectiveDiameterDp = computed<number>(() => {
    const custom = this.clampedDiameter();
    if (custom !== null) {
      return custom;
    }
    switch (this.size()) {
      case 'sm':
        return 32;
      case 'lg':
        return 64;
      default:
        return DEFAULT_LOADING_DIAMETER_DP;
    }
  });

  readonly effectiveShapeDp = computed<number>(
    () => Math.round(this.effectiveDiameterDp() * LOADING_ACTIVE_SHAPE_RATIO * 10) / 10
  );

  readonly containerDiameterPx = computed<number | null>(() =>
    this.contained() && !this.elevated() ? this.clampedDiameter() : null
  );

  readonly clampedProgress = computed<number | null>(() => {
    const raw = this.progress();
    if (raw === null || !Number.isFinite(raw)) {
      return null;
    }
    return Math.min(1, Math.max(0, raw));
  });

  readonly isIndeterminate = computed<boolean>(() => this.clampedProgress() === null);

  readonly determinatePercent = computed<number | null>(() => {
    const p = this.clampedProgress();
    return p === null ? null : Math.round(p * 100);
  });

  readonly initialPathD = computed<string>(() => {
    const p = this.clampedProgress();
    if (p !== null) {
      return computeDeterminateLoadingFrame(p).d;
    }
    return this.prefersReducedMotion() ? this.pentagonPath : this.softBurstPath;
  });

  private readonly scratchPoints: Point2D[] = Array.from(
    { length: M3_LOADING_SEGMENT_COUNT },
    () => ({ x: CENTER, y: CENTER })
  );
  private elapsedMs = 0;
  private currentStepIndex = 0;
  private currentSpringFactor = 0;
  private currentAngleDeg = 0;

  constructor() {
    effect((onCleanup) => {
      const svgEl = this.shapeSvgRef()?.nativeElement;
      const pathEl = this.shapePathRef()?.nativeElement;
      const reduced = this.prefersReducedMotion();
      const progressVal = this.clampedProgress();
      const isPaused = this.paused();

      if (!svgEl || !pathEl) {
        return;
      }

      if (progressVal !== null) {
        const frame = computeDeterminateLoadingFrame(progressVal, this.scratchPoints);
        this.currentStepIndex = 0;
        this.currentSpringFactor = frame.springFactor;
        this.currentAngleDeg = reduced ? 0 : frame.angleDeg;
        pathEl.setAttribute('d', frame.d);
        svgEl.style.transform = reduced ? '' : `rotate(${frame.angleDeg.toFixed(2)}deg)`;
        return;
      }

      if (reduced || !isPlatformBrowser(this.platformId) || typeof requestAnimationFrame !== 'function') {
        svgEl.style.transform = '';
        pathEl.setAttribute('d', reduced ? this.pentagonPath : this.softBurstPath);
        return;
      }

      const applyIndeterminateFrame = (ms: number) => {
        const frame = computeLoadingIndicatorFrame(ms, this.scratchPoints);
        this.currentStepIndex = frame.stepIndex;
        this.currentSpringFactor = frame.springFactor;
        this.currentAngleDeg = frame.angleDeg;
        pathEl.setAttribute('d', frame.d);
        svgEl.style.transform = `rotate(${frame.angleDeg.toFixed(2)}deg)`;
      };

      if (isPaused) {
        applyIndeterminateFrame(this.elapsedMs);
        return;
      }

      applyIndeterminateFrame(this.elapsedMs);

      let frameId = 0;
      let lastTime = 0;

      this.ngZone.runOutsideAngular(() => {
        const tick = (now: number) => {
          if (lastTime > 0) {
            const dtMs = Math.min(100, Math.max(0, now - lastTime));
            this.elapsedMs += dtMs;
          }
          lastTime = now;

          applyIndeterminateFrame(this.elapsedMs);
          frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
      });

      onCleanup(() => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      });
    });
  }

  /**
   * Returns a lightweight synchronous telemetry snapshot of the current morph state
   * without triggering Angular change detection (safe inside outside-NgZone RAF loops).
   */
  getTelemetrySnapshot(): LoadingIndicatorTelemetrySnapshot {
    const progress = this.clampedProgress();
    const indeterminate = progress === null;
    const count = M3_LOADING_SHAPE_NAMES.length;
    const activeIndex = this.currentStepIndex % count;
    const nextIndex = (activeIndex + 1) % count;

    return {
      elapsedMs: this.elapsedMs,
      stepIndex: this.currentStepIndex,
      shapeName: indeterminate ? M3_LOADING_SHAPE_NAMES[activeIndex] : 'Circle -> SoftBurst',
      nextShapeName: indeterminate ? M3_LOADING_SHAPE_NAMES[nextIndex] : 'SoftBurst',
      springFactor: this.currentSpringFactor,
      angleDeg: this.currentAngleDeg,
      isIndeterminate: indeterminate,
      progress,
      diameterDp: this.effectiveDiameterDp(),
      shapeDp: this.effectiveShapeDp(),
      paused: this.paused()
    };
  }

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-loading-indicator',
      `m3-loading-indicator-${this.size()}`,
      `m3-progress-${this.color()}`
    ];

    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  readonly containerClasses = computed(() => {
    if (!this.contained() && !this.elevated()) {
      return 'contents';
    }
    const classes = [
      'm3-loading-container',
      `m3-loading-container-${this.size()}`,
      `m3-progress-${this.color()}`
    ];
    if (this.elevated()) {
      classes.push('m3-loading-container-elevated');
    }
    return classes.join(' ');
  });
}
