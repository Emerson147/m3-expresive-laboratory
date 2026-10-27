import { 
  Component, 
  computed, 
  input, 
  signal, 
  ElementRef, 
  inject, 
  NgZone, 
  PLATFORM_ID, 
  OnDestroy, 
  AfterViewInit 
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type M3CircularProgressColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color';
export type M3CircularProgressSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'm3-circular-progress',
  standalone: true,
  host: {
    class: 'inline-flex items-center justify-center'
  },
  template: `
    <div
      role="progressbar"
      [class]="computedClasses()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-valuenow]="isIndeterminate() ? null : clampedValue()"
      [attr.aria-valuemin]="isIndeterminate() ? null : 0"
      [attr.aria-valuemax]="isIndeterminate() ? null : 100">

      <svg 
        class="m3-circular-svg" 
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        
        @if (wavy()) {
          <!-- M3 Expressive Wavy Circular Progress (Parametric Sine + Disjoint Smooth Arc) -->
          
          <!-- Inactive Smooth Circular Track Arc (Strict 4dp separation, never under wave) -->
          @if (showTrack() && wavyTrackPath()) {
            <path
              class="m3-circular-track"
              [attr.d]="wavyTrackPath()!"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round"
              fill="none" />
          }

          <!-- Dynamic Scalloped Wavy Active Arc (fluid body with oscillating head & tail) -->
          @if (wavyActivePath()) {
            <path
              class="m3-circular-indicator"
              [attr.d]="wavyActivePath()!"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none" />
          }
        } @else {
          <!-- Standard M3 Canonical Flat Circular Progress -->
          @if (showTrack() && shouldRenderTrack()) {
            <circle
              class="m3-circular-track"
              cx="24"
              cy="24"
              [attr.r]="radius"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round"
              [style.stroke-dasharray]="isIndeterminate() ? null : trackDashArray()"
              [style.stroke-dashoffset]="isIndeterminate() ? null : trackDashOffset()">
            </circle>
          }

          <!-- Standard Active Progress Arc -->
          <circle
            class="m3-circular-indicator"
            cx="24"
            cy="24"
            [attr.r]="radius"
            [attr.stroke-width]="strokeWidth()"
            stroke-linecap="round"
            [style.stroke-dasharray]="isIndeterminate() ? null : circumference"
            [style.stroke-dashoffset]="isIndeterminate() ? null : dashOffset()">
          </circle>
        }
      </svg>
    </div>
  `
})
export class M3CircularProgressComponent implements AfterViewInit, OnDestroy {
  /** Value between 0 and 100 for determinate mode. If null, enters indeterminate mode */
  readonly value = input<number | null>(null);

  /** Circular diameter size (sm: 24px, md: 40px canonical, lg: 56px expressive) */
  readonly size = input<M3CircularProgressSize>('md');

  /** Semantic color or Expressive four-color loop */
  readonly color = input<M3CircularProgressColor>('primary');

  /** Enables M3 Expressive scalloped/wavy circular perimeter */
  readonly wavy = input<boolean>(false);

  /** Shows the subtle background track circle */
  readonly showTrack = input<boolean>(true);

  /** Accessible label */
  readonly ariaLabel = input<string>('Cargando...');

  /** Extra custom classes */
  readonly customClass = input<string>('');

  /** Radius for 48x48 coordinate viewBox */
  readonly radius = 18;

  /** Circumference: 2 * Math.PI * 18 (~113.1px) */
  readonly circumference = 2 * Math.PI * this.radius;

  /** Canonical 4dp gap expressed in SVG circumference coordinates (~4px) */
  readonly gapLength = 4;

  // Platform & zone for smooth wave animation loop
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  readonly phase = signal<number>(0);
  readonly indeterminateAngle = signal<number>(0);

  private animFrameId?: number;
  private startTime = 0;

  /** True if progress is undetermined */
  readonly isIndeterminate = computed(() => this.value() === null || this.value() === undefined);

  /** Clamped determinate percentage */
  readonly clampedValue = computed(() => {
    const val = this.value();
    if (val === null || val === undefined) return 0;
    return Math.min(100, Math.max(0, val));
  });

  /** Stroke width tailored by size */
  readonly strokeWidth = computed(() => {
    switch (this.size()) {
      case 'sm': return 3.2;
      case 'lg': return 4.5;
      case 'md':
      default:
        return 4;
    }
  });

  /** Canonical M3 circular wave amplitude tailored to keep ripples organic and soft */
  readonly waveAmplitude = computed(() => {
    switch (this.size()) {
      case 'sm': return 0.9;
      case 'lg': return 1.7;
      case 'md':
      default: return 1.3;
    }
  });

  /** Number of wave lobes around full circle (Compose default ~18.8dp wavelength) */
  readonly waveLobes = computed(() => {
    switch (this.size()) {
      case 'sm': return 5;
      case 'lg': return 7;
      case 'md':
      default: return 6;
    }
  });

  /** Dashoffset for standard determinate mode */
  readonly dashOffset = computed(() => {
    const progress = this.clampedValue() / 100;
    return this.circumference * (1 - progress);
  });

  /** True if inactive track should be rendered (omitted when full or near full) */
  readonly shouldRenderTrack = computed(() => {
    if (this.isIndeterminate()) return true;
    return this.clampedValue() < 96;
  });

  /**
   * Length of the inactive track arc for flat mode.
   * Covers uncompleted fraction minus 4dp gap on both ends.
   */
  readonly trackDashArray = computed(() => {
    const p = this.clampedValue() / 100;
    if (p <= 0) {
      return `${this.circumference} ${this.circumference}`;
    }
    const remainingLength = this.circumference * (1 - p);
    const availableTrack = Math.max(0, remainingLength - this.gapLength * 2);
    return `${availableTrack} ${this.circumference}`;
  });

  /**
   * Inactive track offset starting 4dp AFTER the active indicator ends
   */
  readonly trackDashOffset = computed(() => {
    const p = this.clampedValue() / 100;
    if (p <= 0) return 0;
    return -(this.circumference * p + this.gapLength);
  });

  /**
   * Mathematically generates fluid circular wave path.
   * Clockwise orientation starting at 12 o'clock (0 rad).
   * Both head and tail oscillate in real-time with rounded stroke-linecap.
   */
  readonly wavyActivePath = computed(() => {
    const rBase = this.radius;
    const maxAmp = this.waveAmplitude();
    const ph = this.phase();
    const numLobes = this.waveLobes();

    if (this.isIndeterminate()) {
      // Indeterminate mode: traveling wave slug of 100 degrees (~28%) rotating around circle
      const arcAngle = (100 * Math.PI) / 180;
      const startAngle = this.indeterminateAngle();
      const endAngle = startAngle + arcAngle;

      return this.buildCircularWavePathString(startAngle, endAngle, rBase, maxAmp, numLobes, ph);
    } else {
      // Determinate mode: arc from 0 to p * 2*PI
      const p = this.clampedValue() / 100;
      if (p <= 0) return '';

      const totalAngle = p * 2 * Math.PI;

      // Attenuate amplitude smoothly at 0% and 100% boundaries per M3 indicatorAmplitude spec
      let amp = maxAmp;
      if (p <= 0.05 || p >= 0.98) {
        amp = 0;
      } else if (p < 0.12) {
        amp = maxAmp * ((p - 0.05) / 0.07);
      } else if (p > 0.92) {
        amp = maxAmp * ((0.98 - p) / 0.06);
      }

      return this.buildCircularWavePathString(0, totalAngle, rBase, amp, numLobes, ph);
    }
  });

  /** Alias for backward compatibility with specs/tests */
  readonly circularWavePath = computed(() => this.wavyActivePath());

  /**
   * Generates the inactive smooth circular track arc for wavy mode.
   * Starts with a canonical 4dp gap after the active wave, and stops 4dp before 12 o'clock.
   */
  readonly wavyTrackPath = computed(() => {
    if (!this.shouldRenderTrack()) return null;

    const r = this.radius;
    const gapAngle = this.gapLength / r; // ~0.222 rad (12.7 degrees)

    if (this.isIndeterminate()) {
      const arcAngle = (100 * Math.PI) / 180;
      const startAngle = this.indeterminateAngle();
      const endAngle = startAngle + arcAngle;

      const trackStart = endAngle + gapAngle;
      const trackEnd = startAngle + 2 * Math.PI - gapAngle;

      return this.buildArcPath(trackStart, trackEnd, r);
    } else {
      const p = this.clampedValue() / 100;
      const activeAngle = p * 2 * Math.PI;

      const trackStart = activeAngle + gapAngle;
      const trackEnd = 2 * Math.PI - (p > 0 ? gapAngle : 0);

      if (trackEnd <= trackStart + 0.05) return null;

      return this.buildArcPath(trackStart, trackEnd, r);
    }
  });

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-circular-progress',
      `m3-circular-progress-${this.size()}`,
      `m3-progress-${this.color()}`
    ];

    if (this.wavy()) {
      classes.push('m3-circular-wavy');
    }

    if (this.isIndeterminate()) {
      classes.push('m3-circular-progress-indeterminate');
    }

    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      if (prefersReducedMotion) return;

      const loop = (timestamp: number) => {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = (timestamp - this.startTime) / 1000;

        // Wave phase propagates clockwise: 1 wave cycle per second (waveSpeed = wavelength)
        const currentPhase = (elapsed * 2 * Math.PI) % (2 * Math.PI);
        // Indeterminate rotation: 1 full circle every 2.4s
        const indetAngle = ((elapsed / 2.4) * 2 * Math.PI) % (2 * Math.PI);

        this.phase.set(currentPhase);
        if (this.isIndeterminate()) {
          this.indeterminateAngle.set(indetAngle);
        }

        this.animFrameId = requestAnimationFrame(loop);
      };

      this.animFrameId = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  /**
   * Builds an SVG path string for an undulating sinusoidal circular arc.
   * Clockwise orientation starting at 12 o'clock (angle 0).
   */
  private buildCircularWavePathString(
    startAngle: number,
    endAngle: number,
    rBase: number,
    amplitude: number,
    numLobes: number,
    phase: number
  ): string {
    if (endAngle <= startAngle) return '';

    const totalArc = endAngle - startAngle;
    // Silky smooth 1-degree resolution
    const numSteps = Math.max(36, Math.ceil((totalArc / (2 * Math.PI)) * 180));
    const step = totalArc / numSteps;
    const points: string[] = [];

    // Point generator: 12 o'clock is angle 0, clockwise
    const getPoint = (theta: number) => {
      const r = rBase + amplitude * Math.sin(numLobes * theta - phase);
      const x = 24 + r * Math.sin(theta);
      const y = 24 - r * Math.cos(theta);
      return { x, y };
    };

    // Start point
    const pStart = getPoint(startAngle);
    points.push(`M ${pStart.x.toFixed(2)},${pStart.y.toFixed(2)}`);

    for (let i = 1; i <= numSteps; i++) {
      const theta = startAngle + i * step;
      const p = getPoint(theta);
      points.push(`L ${p.x.toFixed(2)},${p.y.toFixed(2)}`);
    }

    return points.join(' ');
  }

  /**
   * Builds a smooth circular arc from startAngle to endAngle clockwise.
   * 12 o'clock is angle 0.
   */
  private buildArcPath(startAngle: number, endAngle: number, r: number): string {
    if (endAngle <= startAngle) return '';

    const x1 = 24 + r * Math.sin(startAngle);
    const y1 = 24 - r * Math.cos(startAngle);
    const x2 = 24 + r * Math.sin(endAngle);
    const y2 = 24 - r * Math.cos(endAngle);

    const angleDiff = endAngle - startAngle;
    const largeArcFlag = angleDiff > Math.PI ? 1 : 0;

    return `M ${x1.toFixed(2)},${y1.toFixed(2)} A ${r},${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
  }
}
