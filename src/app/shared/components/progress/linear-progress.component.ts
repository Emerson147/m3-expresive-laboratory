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

export type M3ProgressColor = 'primary' | 'secondary' | 'tertiary' | 'error';
export type M3ProgressSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'm3-linear-progress',
  standalone: true,
  host: {
    class: 'block w-full relative'
  },
  template: `
    <div
      role="progressbar"
      [class]="computedClasses()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-valuenow]="isIndeterminate() ? null : clampedValue()"
      [attr.aria-valuemin]="isIndeterminate() ? null : 0"
      [attr.aria-valuemax]="isIndeterminate() ? null : 100">

      @if (wavy()) {
        <!-- M3 Expressive Wavy Progress Engine -->
        <svg
          class="m3-linear-wavy-svg"
          [attr.viewBox]="'0 0 ' + containerWidth() + ' ' + containerHeight()"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          
          <!-- Inactive Track Suffix: starts AFTER active wave (or buffer) with 4dp gap, ends 4dp before stop dot -->
          @if (trackCoords()) {
            <line
              class="m3-linear-wavy-track-line"
              [attr.x1]="trackCoords()!.x1"
              [attr.y1]="yCenter()"
              [attr.x2]="trackCoords()!.x2"
              [attr.y2]="yCenter()"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round" />
          }

          <!-- Buffer Line: starts after active wave with 4dp gap, ends at buffer percentage -->
          @if (bufferCoords()) {
            <line
              class="m3-linear-wavy-buffer-line"
              [attr.x1]="bufferCoords()!.x1"
              [attr.y1]="yCenter()"
              [attr.x2]="bufferCoords()!.x2"
              [attr.y2]="yCenter()"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round" />
          }

          <!-- Inactive Track Prefix: in indeterminate mode before traveling wave slug -->
          @if (indeterminatePrefixCoords()) {
            <line
              class="m3-linear-wavy-track-line"
              [attr.x1]="indeterminatePrefixCoords()!.x1"
              [attr.y1]="yCenter()"
              [attr.x2]="indeterminatePrefixCoords()!.x2"
              [attr.y2]="yCenter()"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round" />
          }

          <!-- Active Wavy Sine Path with fluid body and bobbing head & tail -->
          @if (activeWavePath()) {
            <path
              class="m3-linear-wavy-path"
              [attr.d]="activeWavePath()"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round"
              stroke-linejoin="round" />
          }

          <!-- Canonical Stop Indicator Dot (embedded inside terminal cap of track line) -->
          @if (showStop() && !isIndeterminate() && trackCoords()) {
            <circle
              class="m3-linear-progress-stop"
              [attr.cx]="containerWidth() - stopDotRadius()"
              [attr.cy]="yCenter()"
              [attr.r]="stopDotRadius()" />
          }
        </svg>
      } @else {
        <!-- Standard M3 Canonical Flat Linear Progress -->
        @if (isIndeterminate()) {
          <!-- Dual bar expressive indeterminate animation -->
          <div class="m3-linear-progress-bar-primary"></div>
          <div class="m3-linear-progress-bar-secondary"></div>
        } @else {
          <!-- Buffer bar (optional) -->
          @if (clampedBuffer() !== null) {
            <div 
              class="m3-linear-progress-buffer" 
              [style.width.%]="clampedBuffer()">
            </div>
          }

          <!-- Active determinate bar -->
          <div 
            class="m3-linear-progress-bar" 
            [style.width.%]="clampedValue()">
          </div>

          <!-- Inactive Track: starts AFTER active bar with 4dp gap, stops before stop dot -->
          @if (clampedValue() < 96) {
            <div
              class="m3-linear-progress-track"
              [style.left.%]="clampedValue()"
              [style.margin-left.px]="4">
            </div>
          }

          <!-- Stop indicator dot at right edge -->
          @if (showStop() && clampedValue() < 96) {
            <div class="m3-linear-progress-stop"></div>
          }
        }
      }
    </div>
  `
})
export class M3LinearProgressComponent implements AfterViewInit, OnDestroy {
  /** Value between 0 and 100 for determinate mode. If null/undefined, enters indeterminate mode */
  readonly value = input<number | null>(null);

  /** Optional secondary buffer value (0 - 100) e.g. for streaming/caching */
  readonly buffer = input<number | null>(null);

  /** Track size/thickness (sm: 2px, md: 4px canonical, lg: 8px expressive) */
  readonly size = input<M3ProgressSize>('md');

  /** Semantic role color */
  readonly color = input<M3ProgressColor>('primary');

  /** Enables M3 Expressive undulating sine wave active track */
  readonly wavy = input<boolean>(false);

  /** Shows the canonical M3 circular stop dot at the end of the track */
  readonly showStop = input<boolean>(true);

  /** Accessible label for screen readers */
  readonly ariaLabel = input<string>('Progreso de carga');

  /** Custom utility classes for spacing or positioning */
  readonly customClass = input<string>('');

  // DOM and platform injection for fluid wave physics
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  readonly containerWidth = signal<number>(400);
  readonly phase = signal<number>(0);
  readonly indeterminateProgress = signal<number>(0);

  private resizeObserver?: ResizeObserver;
  private animFrameId?: number;
  private startTime = 0;

  /** True if progress is undetermined */
  readonly isIndeterminate = computed(() => this.value() === null || this.value() === undefined);

  /** Determinate value clamped to 0 - 100 */
  readonly clampedValue = computed(() => {
    const val = this.value();
    if (val === null || val === undefined) return 0;
    return Math.min(100, Math.max(0, val));
  });

  /** Buffer value clamped to 0 - 100 */
  readonly clampedBuffer = computed(() => {
    const buf = this.buffer();
    if (buf === null || buf === undefined) return null;
    return Math.min(100, Math.max(0, buf));
  });

  /** Container height: 10px (md), 14px (lg), 8px (sm) based on M3 Measurements spec (Image 5) */
  readonly containerHeight = computed(() => {
    switch (this.size()) {
      case 'lg': return 14;
      case 'sm': return 8;
      case 'md':
      default: return 10;
    }
  });

  /** Center baseline Y */
  readonly yCenter = computed(() => this.containerHeight() / 2);

  /** Stroke width: 4px (md), 8px (lg), 2px (sm) */
  readonly strokeWidth = computed(() => {
    switch (this.size()) {
      case 'lg': return 8;
      case 'sm': return 2;
      case 'md':
      default: return 4;
    }
  });

  /** Canonical M3 wave amplitude (3px for md/lg, 2px for sm) per Image 5 */
  readonly baseAmplitude = computed(() => {
    switch (this.size()) {
      case 'sm': return 2;
      case 'lg':
      case 'md':
      default: return 3;
    }
  });

  /** Canonical M3 wave wavelength: 40px (Image 5) */
  readonly wavelength = 40;

  /** Canonical stop indicator dot radius (half the stroke width) */
  readonly stopDotRadius = computed(() => this.strokeWidth() / 2);

  /** Canonical M3 4dp gap between disjoint segments */
  readonly gap = 4;

  /** Dynamic traveling sinusoidal wave path with bobbing head and tail */
  readonly activeWavePath = computed(() => {
    const w = this.containerWidth();
    const yMid = this.yCenter();
    const maxAmp = this.baseAmplitude();
    const lambda = this.wavelength;
    const ph = this.phase();
    const r = this.stopDotRadius();

    if (this.isIndeterminate()) {
      // Indeterminate mode: traveling wave slug of ~35% container width
      const slugLength = Math.max(80, w * 0.35);
      const totalTravel = w + slugLength;
      const headX = this.indeterminateProgress() * totalTravel;
      const tailX = headX - slugLength;

      const visStart = Math.max(r, tailX);
      const visEnd = Math.min(w - r, headX);

      if (visEnd <= visStart + 2) return '';

      return this.buildWavePathString(visStart, visEnd, yMid, maxAmp, lambda, ph);
    } else {
      // Determinate mode
      const p = this.clampedValue() / 100;
      if (p <= 0) return '';

      const usableWidth = w - 2 * r;
      const endX = r + usableWidth * p;
      // Amplitude transitions smoothly near extreme boundaries (0% and 100%)
      let amp = maxAmp;
      if (p <= 0.02 || p >= 0.995) {
        amp = 0;
      } else if (p < 0.08) {
        amp = maxAmp * ((p - 0.02) / 0.06);
      } else if (p > 0.96) {
        amp = maxAmp * ((0.995 - p) / 0.035);
      }

      return this.buildWavePathString(r, endX, yMid, amp, lambda, ph);
    }
  });

  /** Buffer line coordinates (starts 4dp after active wave, ends at buffer percentage) */
  readonly bufferCoords = computed(() => {
    if (this.isIndeterminate()) return null;
    const buf = this.clampedBuffer();
    if (buf === null || buf <= this.clampedValue()) return null;

    const w = this.containerWidth();
    const r = this.stopDotRadius();
    const g = this.gap;
    const usableWidth = w - 2 * r;
    const pActive = this.clampedValue() / 100;
    const pBuf = buf / 100;

    const activeEndX = r + usableWidth * pActive;
    const x1 = activeEndX + 2 * r + g;
    const x2 = r + usableWidth * pBuf;

    if (x2 > x1 + g) {
      return { x1, x2 };
    }
    return null;
  });

  /** Inactive Track Suffix (starts 4dp after active wave or buffer, extends to end of container) */
  readonly trackCoords = computed(() => {
    const w = this.containerWidth();
    const r = this.stopDotRadius();
    const g = this.gap; // Canonical 4dp gap

    // The inactive track line extends all the way to the end of the container (w - r).
    // The stop dot sits embedded directly inside the terminal cap of the line at (w - r).
    const x2 = w - r;

    if (this.isIndeterminate()) {
      const slugLength = Math.max(80, w * 0.35);
      const totalTravel = w + slugLength;
      const headX = this.indeterminateProgress() * totalTravel;
      const visEnd = Math.min(w, headX);

      // Inactive track starts after wave slug with visible gap g
      const x1 = visEnd + 2 * r + g;
      if (x2 > x1 + 2) {
        return { x1, x2 };
      }
      return null;
    } else {
      const p = this.clampedValue() / 100;
      const buf = this.clampedBuffer();
      const usableWidth = w - 2 * r;
      const effectivePct = (buf !== null && buf > this.clampedValue()) ? (buf / 100) : p;
      const effectiveEndX = r + usableWidth * effectivePct;

      // Inactive track starts after active wave/buffer with visible gap g:
      // If no active progress (p <= 0), track line starts at r.
      // Otherwise: Wave tip is at (effectiveEndX + r). Line left cap is at (x1 - r).
      // (x1 - r) - (effectiveEndX + r) = g  =>  x1 = effectiveEndX + 2*r + g.
      const x1 = p <= 0 ? r : effectiveEndX + 2 * r + g;

      if (x2 > x1 + 2) {
        return { x1, x2 };
      }
      return null;
    }
  });

  /** Inactive Track Prefix (for indeterminate traveling slug before its tail) */
  readonly indeterminatePrefixCoords = computed(() => {
    if (!this.isIndeterminate()) return null;
    const w = this.containerWidth();
    const r = this.stopDotRadius();
    const g = this.gap;
    const slugLength = Math.max(80, w * 0.35);
    const totalTravel = w + slugLength;
    const headX = this.indeterminateProgress() * totalTravel;
    const tailX = headX - slugLength;
    const visStart = Math.max(0, tailX);

    // Prefix line starts at r, ends with gap g before wave tail:
    // Wave tail tip is at (visStart - r). Prefix right cap is at (x2 + r).
    // (visStart - r) - (x2 + r) = g  =>  x2 = visStart - 2*r - g.
    const x1 = r;
    const x2 = visStart - 2 * r - g;

    if (x2 > x1 + g) {
      return { x1, x2 };
    }
    return null;
  });

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-linear-progress',
      `m3-linear-progress-${this.size()}`,
      `m3-progress-${this.color()}`
    ];

    if (this.wavy()) {
      classes.push('m3-linear-progress-wavy');
    }

    if (this.isIndeterminate()) {
      classes.push('m3-linear-progress-indeterminate');
    }

    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.elementRef.nativeElement.querySelector('.m3-linear-progress') as HTMLElement;
    if (el) {
      this.containerWidth.set(Math.max(120, el.clientWidth || 400));
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(entries => {
          const w = entries[0]?.contentRect.width;
          if (w && w > 0) {
            this.containerWidth.set(w);
          }
        });
        this.resizeObserver.observe(el);
      }
    }

    // High performance animation loop outside Angular zone
    this.ngZone.runOutsideAngular(() => {
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      if (prefersReducedMotion) return;

      const loop = (timestamp: number) => {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = (timestamp - this.startTime) / 1000;

        // Wave speed: 40px/s (1 full wavelength shift per second)
        const currentPhase = (elapsed * 2 * Math.PI) % (2 * Math.PI);
        const indetProg = (elapsed / 2.0) % 1;

        this.phase.set(currentPhase);
        if (this.isIndeterminate()) {
          this.indeterminateProgress.set(indetProg);
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
    this.resizeObserver?.disconnect();
  }

  /**
   * Generates continuous sine wave SVG path string.
   * Both start point and end point explicitly calculate their Y coordinate on the sine curve,
   * guaranteeing that with stroke-linecap: round, the head and tail bob up and down naturally!
   */
  private buildWavePathString(
    startX: number,
    endX: number,
    yMid: number,
    amplitude: number,
    lambda: number,
    phase: number
  ): string {
    if (endX <= startX) return '';

    // Flat line fallback if amplitude is 0 (extremes 0% or 100%)
    if (amplitude <= 0.05) {
      return `M ${startX.toFixed(1)},${yMid.toFixed(1)} L ${endX.toFixed(1)},${yMid.toFixed(1)}`;
    }

    const points: string[] = [];
    const step = 3; // 3px step yields silky smooth curve with zero vertex angles

    // Start point: tail coordinate bobs up and down
    const yStart = yMid + amplitude * Math.sin((2 * Math.PI * startX) / lambda - phase);
    points.push(`M ${startX.toFixed(1)},${yStart.toFixed(1)}`);

    for (let x = startX + step; x < endX; x += step) {
      const y = yMid + amplitude * Math.sin((2 * Math.PI * x) / lambda - phase);
      points.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
    }

    // End point: head coordinate bobs up and down with stroke-linecap: round!
    const yEnd = yMid + amplitude * Math.sin((2 * Math.PI * endX) / lambda - phase);
    points.push(`L ${endX.toFixed(1)},${yEnd.toFixed(1)}`);

    return points.join(' ');
  }
}
