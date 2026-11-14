import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { observePrefersReducedMotion } from './progress-motion.controller';

export type M3LoadingIndicatorSize = 'sm' | 'md' | 'lg';
export type M3LoadingIndicatorColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color';

const SEGMENT_COUNT = 40;
const CENTER = 24;

interface Point2D {
  readonly x: number;
  readonly y: number;
}

/**
 * Converts a closed ring of N points into a uniform N-segment Cubic Bezier SVG path
 * using Catmull-Rom tangents. Because every shape uses the exact same N=40 `C` commands,
 * SVG SMIL `<animate attributeName="d">` interpolates all vertices at 60fps without snapping.
 */
function buildClosedSplinePath(points: readonly Point2D[], tension = 1 / 6): string {
  const n = points.length;
  const fmt = (v: number) => Number(v.toFixed(2));
  let d = `M ${fmt(points[0].x)},${fmt(points[0].y)}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2.x)},${fmt(p2.y)}`;
  }

  return `${d} Z`;
}

/**
 * Computes exact points on a regular n-gon with rounded corner radius `cornerRadius`
 * and center-to-corner-center distance `coreRadius` (Minkowski sum of regular n-gon + circle).
 */
function createRoundedRegularPolygonPath(sides: number, coreRadius: number, cornerRadius: number): string {
  const points: Point2D[] = [];
  const sector = (2 * Math.PI) / sides;
  const halfSector = sector / 2;

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const theta = -Math.PI / 2 + (2 * Math.PI * i) / SEGMENT_COUNT;
    const rel = ((theta + Math.PI / 2) % sector + sector) % sector;
    const phi = rel - halfSector; // [-pi/sides, +pi/sides], 0 at vertex

    // Smoothly blend between the flat polygon face (cos(halfSector)/cos(phi)) and rounded vertex cap
    const flatR = (coreRadius * Math.cos(halfSector)) / Math.cos(phi);
    const vertexCapR = coreRadius * Math.cos(phi) + Math.sqrt(Math.max(0, cornerRadius * cornerRadius - Math.pow(coreRadius * Math.sin(phi), 2)));
    // Rounded polygon radius at angle theta:
    const r = Math.min(flatR + cornerRadius * 0.72, vertexCapR);

    points.push({
      x: CENTER + r * Math.cos(theta),
      y: CENTER + r * Math.sin(theta)
    });
  }

  return buildClosedSplinePath(points);
}

function createPolarShapePath(radiusFn: (theta: number) => number): string {
  const points: Point2D[] = [];
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const theta = -Math.PI / 2 + (2 * Math.PI * i) / SEGMENT_COUNT;
    const r = radiusFn(theta);
    points.push({
      x: CENTER + r * Math.cos(theta),
      y: CENTER + r * Math.sin(theta)
    });
  }
  return buildClosedSplinePath(points);
}

// Precompute canonical M3 Expressive geometric shapes (all with 40 uniform Cubic Bezier segments):
// 1. Canonical M3 Rounded Regular Pentagon (5 identical rounded corners + 5 straight sides)
/** M3 Expressive Soft Burst (10-lobe radial burst, 38dp footprint in 48dp box) */
export const M3_SOFT_BURST_PATH = createPolarShapePath(
  theta => 16.4 + 2.6 * Math.cos(10 * theta)
);

/** M3 Expressive Scalloped Sunny/Cookie (8-lobe harmonic of N=40) */
export const M3_COOKIE8_PATH = createPolarShapePath(
  theta => 16.8 + 2.1 * Math.cos(8 * theta)
);

/** M3 Expressive Rounded Pentagon (38dp outer envelope) */
export const M3_PENTAGON_PATH = createRoundedRegularPolygonPath(5, 13.6, 5.2);

/** M3 Expressive Tilted Pill / Capsule (45deg oval-stadium) */
export const M3_PILL_PATH = createPolarShapePath(theta => {
  const rot = theta + Math.PI / 4;
  const c = Math.abs(Math.cos(rot));
  const s = Math.abs(Math.sin(rot));
  return 1 / Math.pow(Math.pow(c / 19.0, 2.8) + Math.pow(s / 12.6, 2.8), 1 / 2.8);
});

/** M3 Expressive Tilted Oval (30deg organic ellipse) */
export const M3_OVAL_PATH = createPolarShapePath(theta => {
  const rot = theta - Math.PI / 6;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return 1 / Math.sqrt((c * c) / (19.0 * 19.0) + (s * s) / (14.2 * 14.2));
});

// 2. Canonical M3 Squircle (Superellipse |x|^4 + |y|^4 = R^4)
/** M3 Expressive Squircle (4-corner continuous superellipse, ~38dp diagonal in 48dp box) */
export const M3_SQUIRCLE_PATH = createPolarShapePath(theta => {
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  return 15.8 / Math.pow(Math.pow(c, 4.2) + Math.pow(s, 4.2), 1 / 4.2);
});

/** M3 Expressive 4-Petal Cookie / Clover (4 radially symmetric lobes, 38dp outer envelope) */
export const M3_COOKIE4_PATH = createPolarShapePath(theta => 16.0 - 3.0 * Math.cos(4 * (theta + Math.PI / 2)));

/** M3 Expressive Perfect Circle (38dp diameter inside 48dp viewBox) */
export const M3_CIRCLE_PATH = createPolarShapePath(() => 19.0);

@Component({
  selector: 'm3-loading-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center justify-center'
  },
  template: `
    <div [class]="containerClasses()">
      <div
        role="status"
        [class]="computedClasses()"
        [attr.aria-label]="ariaLabel()">

        <svg
          class="m3-loading-shape-svg"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg">

          <!-- Morphing M3 Expressive Contour (SoftBurst -> Cookie8 -> Pentagon -> Pill -> Squircle -> Cookie4 -> Oval) -->
          <path
            class="m3-loading-shape-path"
            [attr.d]="prefersReducedMotion() ? pentagonPath : softBurstPath">
            @if (!prefersReducedMotion()) {
              <animate
                attributeName="d"
                dur="4.2s"
                repeatCount="indefinite"
                [attr.values]="morphValues()"
                [attr.keyTimes]="morphKeyTimes"
                calcMode="spline"
                [attr.keySplines]="morphKeySplines" />
            }
          </path>
        </svg>
      </div>
    </div>
  `
})
export class M3LoadingIndicatorComponent {
  /** Diameter scale: sm (32px), md (48px canonical M3 box with 38dp active shape), lg (64px hero) */
  readonly size = input<M3LoadingIndicatorSize>('md');

  /** Semantic OKLCH color theme */
  readonly color = input<M3LoadingIndicatorColor>('primary');

  /** If true, wraps the indicator in an explicit backing container shape (M3 Contained: primary-container / on-primary-container) */
  readonly contained = input<boolean>(false);

  /** If true, elevates the container into a floating card with shadow (e.g. pull-to-refresh) */
  readonly elevated = input<boolean>(false);

  /** Accessible label */
  readonly ariaLabel = input<string>('Cargando contenido...');

  /** Additional classes */
  readonly customClass = input<string>('');

  /** Respect OS/user motion preference including SMIL <animate> which ignores CSS animation: none */
  readonly prefersReducedMotion = observePrefersReducedMotion();

  readonly softBurstPath = M3_SOFT_BURST_PATH;
  readonly cookie8Path = M3_COOKIE8_PATH;
  readonly pentagonPath = M3_PENTAGON_PATH;
  readonly pillPath = M3_PILL_PATH;
  readonly squirclePath = M3_SQUIRCLE_PATH;
  readonly flowerPath = M3_COOKIE4_PATH;
  readonly ovalPath = M3_OVAL_PATH;
  readonly circlePath = M3_CIRCLE_PATH;

  readonly morphKeyTimes = '0; 0.1428; 0.2857; 0.4285; 0.5714; 0.7142; 0.8571; 1';
  readonly morphKeySplines = Array(7).fill('0.38 1.21 0.22 1').join('; ');

  readonly morphValues = computed(() => {
    return [
      this.softBurstPath,
      this.cookie8Path,
      this.pentagonPath,
      this.pillPath,
      this.squirclePath,
      this.flowerPath,
      this.ovalPath,
      this.softBurstPath
    ].join('; ');
  });

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
