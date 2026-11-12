import { Component, computed, input } from '@angular/core';

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
export const M3_PENTAGON_PATH = createRoundedRegularPolygonPath(5, 13.2, 5.2);

// 2. Canonical M3 Squircle (Superellipse |x|^4 + |y|^4 = R^4)
export const M3_SQUIRCLE_PATH = createPolarShapePath(theta => {
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  return 16.2 / Math.pow(Math.pow(c, 4.2) + Math.pow(s, 4.2), 1 / 4.2);
});

// 3. Canonical M3 4-Petal Cookie / Clover (4 radially symmetric lobes)
export const M3_COOKIE4_PATH = createPolarShapePath(theta => 15.4 - 2.8 * Math.cos(4 * (theta + Math.PI / 2)));

// 4. Canonical M3 Perfect Circle (constant radius R = 17)
export const M3_CIRCLE_PATH = createPolarShapePath(() => 17.0);

@Component({
  selector: 'm3-loading-indicator',
  standalone: true,
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
          xmlns="http://www.w3.org/2000/svg">
          
          <!-- Morphing Geometric Contour (Pentagon -> Squircle -> 4-Petal Cookie -> Circle) -->
          <path
            class="m3-loading-shape-path"
            [attr.d]="pentagonPath">
            <animate
              attributeName="d"
              dur="3.2s"
              repeatCount="indefinite"
              [attr.values]="morphValues()"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              calcMode="spline"
              keySplines="0.2 0 0 1; 0.2 0 0 1; 0.2 0 0 1; 0.2 0 0 1" />
          </path>
        </svg>
      </div>
    </div>
  `
})
export class M3LoadingIndicatorComponent {
  /** Diameter scale: sm (32px), md (48px canonical), lg (64px hero) */
  readonly size = input<M3LoadingIndicatorSize>('md');

  /** Semantic OKLCH color theme */
  readonly color = input<M3LoadingIndicatorColor>('primary');

  /** If true, wraps the indicator in an explicit backing container shape (M3 Contained) */
  readonly contained = input<boolean>(false);

  /** If true, elevates the container into a floating card with shadow (e.g. pull-to-refresh) */
  readonly elevated = input<boolean>(false);

  /** Accessible label */
  readonly ariaLabel = input<string>('Cargando contenido...');

  /** Additional classes */
  readonly customClass = input<string>('');

  // 1. Pentagon (5-point symmetric rounded regular pentagon - canonical M3 Expressive)
  readonly pentagonPath = M3_PENTAGON_PATH;

  // 2. Squircle (4-corner continuous superellipse)
  readonly squirclePath = M3_SQUIRCLE_PATH;

  // 3. 4-Petal Cookie (symmetric 4-lobe organic shape)
  readonly flowerPath = M3_COOKIE4_PATH;

  // 4. Perfect Circle
  readonly circlePath = M3_CIRCLE_PATH;

  readonly morphValues = computed(() => {
    return `${this.pentagonPath}; ${this.squirclePath}; ${this.flowerPath}; ${this.circlePath}; ${this.pentagonPath}`;
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
    const classes = ['m3-loading-container', `m3-progress-${this.color()}`];
    if (this.elevated()) {
      classes.push('m3-loading-container-elevated');
    }
    return classes.join(' ');
  });
}
