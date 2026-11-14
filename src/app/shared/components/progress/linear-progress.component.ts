import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  DEFAULT_LINEAR_AMPLITUDE_DP,
  DEFAULT_LINEAR_INDETERMINATE_CYCLE_SEC,
  DEFAULT_LINEAR_WAVELENGTH_DP,
  LinearSegment,
  buildLinearWavePath,
  computeLinearIndeterminatePulses,
  evaluateWaveAmplitudeEnvelope
} from './progress-motion.util';
import { createWavyProgressController } from './progress-motion.controller';

export type M3ProgressColor = 'primary' | 'secondary' | 'tertiary' | 'error';
export type M3ProgressSize = 'sm' | 'md' | 'lg';

const LINEAR_STROKE_WIDTH_DP: Record<M3ProgressSize, number> = { sm: 2, md: 4, lg: 8 };
const LINEAR_MIN_HEIGHT_DP: Record<M3ProgressSize, number> = { sm: 8, md: 10, lg: 14 };

@Component({
  selector: 'm3-linear-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full relative'
  },
  template: `
    <div
      role="progressbar"
      [class]="computedClasses()"
      [style.height.px]="wavy() ? containerHeight() : null"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-valuenow]="isIndeterminate() ? null : clampedValue()"
      [attr.aria-valuemin]="isIndeterminate() ? null : 0"
      [attr.aria-valuemax]="isIndeterminate() ? null : 100">

      @if (wavy()) {
        <svg
          class="m3-linear-wavy-svg"
          [attr.viewBox]="'0 0 ' + containerWidth() + ' ' + containerHeight()"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">

          @for (seg of inactiveTrackSegments(); track $index) {
            <line
              class="m3-linear-wavy-track-line"
              [attr.x1]="seg.x1"
              [attr.y1]="yCenter()"
              [attr.x2]="seg.x2"
              [attr.y2]="yCenter()"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round" />
          }

          @if (bufferCoords(); as buf) {
            <line
              class="m3-linear-wavy-buffer-line"
              [attr.x1]="buf.x1"
              [attr.y1]="yCenter()"
              [attr.x2]="buf.x2"
              [attr.y2]="yCenter()"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round" />
          }

          @if (activeWavePath()) {
            <path
              class="m3-linear-wavy-path"
              [attr.d]="activeWavePath()"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round"
              stroke-linejoin="round" />
          }

          @if (showStop() && !isIndeterminate() && effectiveVisualValue() < 99 && trackCoords()) {
            <circle
              class="m3-linear-progress-stop"
              [attr.cx]="containerWidth() - strokeRadius()"
              [attr.cy]="yCenter()"
              [attr.r]="stopDotRadius()" />
          }

          @if (blueprint() && blueprintMetrics(); as bp) {
            <g class="m3-progress-blueprint" aria-hidden="true">
              <line
                class="m3-blueprint-axis"
                [attr.x1]="bp.xMin"
                [attr.y1]="bp.yMid"
                [attr.x2]="bp.xMax"
                [attr.y2]="bp.yMid" />
              @if (bp.amp > 0.05) {
                <line
                  class="m3-blueprint-envelope"
                  [attr.x1]="bp.xMin"
                  [attr.y1]="bp.yMid - bp.amp"
                  [attr.x2]="bp.xMax"
                  [attr.y2]="bp.yMid - bp.amp" />
                <line
                  class="m3-blueprint-envelope"
                  [attr.x1]="bp.xMin"
                  [attr.y1]="bp.yMid + bp.amp"
                  [attr.x2]="bp.xMax"
                  [attr.y2]="bp.yMid + bp.amp" />
              }
              @if (bp.gap) {
                <line
                  class="m3-blueprint-gap-tick"
                  [attr.x1]="bp.gap.left"
                  [attr.y1]="bp.yMid - bp.tickHalf"
                  [attr.x2]="bp.gap.left"
                  [attr.y2]="bp.yMid + bp.tickHalf" />
                <line
                  class="m3-blueprint-gap-tick"
                  [attr.x1]="bp.gap.right"
                  [attr.y1]="bp.yMid - bp.tickHalf"
                  [attr.x2]="bp.gap.right"
                  [attr.y2]="bp.yMid + bp.tickHalf" />
                <text
                  class="m3-blueprint-gap-label"
                  [attr.x]="(bp.gap.left + bp.gap.right) / 2"
                  [attr.y]="bp.yMid - bp.tickHalf - 3"
                  text-anchor="middle">
                  4dp gap
                </text>
              }
              @if (bp.stopCx !== null) {
                <circle
                  class="m3-blueprint-stop-ring"
                  [attr.cx]="bp.stopCx"
                  [attr.cy]="bp.yMid"
                  [attr.r]="stopDotRadius() + 2.5" />
              }
            </g>
          }
        </svg>
      } @else {
        @if (isIndeterminate()) {
          <div class="m3-linear-progress-track m3-linear-progress-track-full"></div>
          <div class="m3-linear-progress-bar-primary"></div>
          <div class="m3-linear-progress-bar-secondary"></div>
        } @else {
          @if (clampedBuffer() !== null) {
            <div
              class="m3-linear-progress-buffer"
              [style.width.%]="clampedBuffer()"
              [style.clip-path]="flatBufferClipPath()">
            </div>
          }

          <div
            class="m3-linear-progress-bar"
            [style.width.%]="clampedValue()"
            [style.min-width.px]="clampedValue() > 0 ? strokeWidth() : 0">
          </div>

          @if (flatTrackStart() < 99) {
            <div
              class="m3-linear-progress-track"
              [style.left.%]="flatTrackStart()"
              [style.margin-left.px]="flatTrackStart() > 0 ? 4 : 0">
            </div>
          }

          @if (showStop() && clampedValue() < 99) {
            <div class="m3-linear-progress-stop"></div>
          }
        }
      }
    </div>
  `
})
export class M3LinearProgressComponent implements AfterViewInit, OnDestroy {
  readonly value = input<number | null>(null);
  readonly buffer = input<number | null>(null);
  readonly size = input<M3ProgressSize>('md');
  readonly color = input<M3ProgressColor>('primary');
  readonly wavy = input<boolean>(false);
  readonly amplitude = input<number | null>(null);
  readonly wavelengthInput = input<number | null>(null, { alias: 'wavelength' });
  readonly speed = input<number | null>(null);
  readonly paused = input<boolean>(false);
  readonly blueprint = input<boolean>(false);
  readonly showStop = input<boolean>(true);
  readonly ariaLabel = input<string>('Progreso de carga');
  readonly customClass = input<string>('');

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  readonly containerWidth = signal<number>(400);
  private resizeObserver?: ResizeObserver;

  private readonly motion = createWavyProgressController({
    wavy: () => this.wavy(),
    isIndeterminate: () => this.isIndeterminate(),
    paused: () => this.paused(),
    hasActiveProgress: () => this.hasActiveProgress(),
    targetValue: () => this.clampedValue(),
    maxAmplitude: () => this.baseAmplitude(),
    restingAmplitude: () => this.currentAmplitude(),
    speed: () => this.speed(),
    phaseWavelength: () => this.effectiveWavelength(),
    indeterminateCycleSec: DEFAULT_LINEAR_INDETERMINATE_CYCLE_SEC,
    wrapIndeterminateCycle: true,
    reducedMotionIndeterminateValue: 0.55,
    isRafDriven: () => this.customClass().includes('m3-progress-raf-driven')
  });

  readonly phase = this.motion.phase;
  readonly indeterminateProgress = this.motion.indeterminatePosition;
  readonly prefersReducedMotion = this.motion.prefersReducedMotion;
  readonly effectiveVisualValue = this.motion.effectiveVisualValue;
  readonly effectiveVisualAmplitude = this.motion.effectiveVisualAmplitude;

  readonly isIndeterminate = computed(() => this.value() === null || this.value() === undefined);

  readonly clampedValue = computed(() => {
    const val = this.value();
    if (val === null || val === undefined) return 0;
    return Math.min(100, Math.max(0, val));
  });

  readonly hasActiveProgress = computed(() =>
    this.isIndeterminate() || (this.clampedValue() > 0 && this.clampedValue() < 100)
  );

  readonly clampedBuffer = computed(() => {
    const buf = this.buffer();
    if (buf === null || buf === undefined) return null;
    return Math.min(100, Math.max(0, buf));
  });

  readonly flatTrackStart = computed(() =>
    Math.max(this.clampedValue(), this.clampedBuffer() ?? 0)
  );

  readonly flatBufferClipPath = computed(() => {
    const val = this.clampedValue();
    const buf = this.clampedBuffer();
    if (val <= 0 || buf === null || buf <= val) return null;
    return `inset(0 0 0 calc(${((val / buf) * 100).toFixed(4)}% + 4px))`;
  });

  readonly strokeWidth = computed(() => LINEAR_STROKE_WIDTH_DP[this.size()]);

  readonly strokeRadius = computed(() => this.strokeWidth() / 2);

  readonly baseAmplitude = computed(() => {
    const custom = this.amplitude();
    if (custom !== null && custom !== undefined) {
      return Math.min(12, Math.max(0, custom));
    }
    return this.size() === 'sm' ? 2 : DEFAULT_LINEAR_AMPLITUDE_DP;
  });

  readonly containerHeight = computed(() =>
    Math.max(LINEAR_MIN_HEIGHT_DP[this.size()], Math.ceil(this.strokeWidth() + 2 * this.baseAmplitude()))
  );

  readonly yCenter = computed(() => this.containerHeight() / 2);

  readonly wavelength = DEFAULT_LINEAR_WAVELENGTH_DP;
  readonly effectiveWavelength = computed(() => {
    const custom = this.wavelengthInput();
    if (custom !== null && custom !== undefined) {
      return Math.min(160, Math.max(12, custom));
    }
    return this.wavelength;
  });

  readonly stopDotRadius = computed(() => (this.size() === 'sm' ? 1 : 2));
  readonly gap = 4;

  readonly indeterminateSegments = computed((): readonly LinearSegment[] => {
    if (!this.isIndeterminate()) return [];
    const r = this.strokeRadius();
    const usableWidth = Math.max(1, this.containerWidth() - 2 * r);
    return computeLinearIndeterminatePulses(this.indeterminateProgress(), r, usableWidth);
  });

  readonly currentAmplitude = computed(() => {
    const maxAmp = this.baseAmplitude();
    if (this.isIndeterminate()) {
      const maxSpan = this.indeterminateSegments().reduce((acc, s) => Math.max(acc, s.x2 - s.x1), 0);
      return maxAmp * Math.min(1, maxSpan / 12);
    }
    return maxAmp * evaluateWaveAmplitudeEnvelope(this.clampedValue() / 100).factor;
  });

  readonly activeWavePath = computed(() => {
    const yMid = this.yCenter();
    const maxAmp = this.baseAmplitude();
    const lambda = this.effectiveWavelength();
    const ph = this.phase();
    const r = this.strokeRadius();

    if (this.isIndeterminate()) {
      return this.indeterminateSegments()
        .map(seg => {
          const spanAmp = maxAmp * Math.min(1, (seg.x2 - seg.x1) / 12);
          return buildLinearWavePath(seg.x1, seg.x2, yMid, spanAmp, lambda, ph);
        })
        .filter(Boolean)
        .join(' ');
    }

    const p = this.effectiveVisualValue() / 100;
    if (p <= 0) return '';

    const endX = r + (this.containerWidth() - 2 * r) * p;
    const amp = this.effectiveVisualAmplitude();
    return buildLinearWavePath(r, endX, yMid, amp, lambda, ph);
  });

  readonly bufferCoords = computed((): LinearSegment | null => {
    if (this.isIndeterminate()) return null;
    const buf = this.clampedBuffer();
    const activeVal = this.effectiveVisualValue();
    if (buf === null || buf <= activeVal) return null;

    const w = this.containerWidth();
    const r = this.strokeRadius();
    const usableWidth = w - 2 * r;
    const pActive = activeVal / 100;
    const activeEndX = r + usableWidth * pActive;
    const x1 = pActive <= 0 ? r : activeEndX + 2 * r + this.gap;
    const x2 = r + usableWidth * (buf / 100);

    return x2 > x1 + this.gap ? { x1, x2 } : null;
  });

  readonly trackCoords = computed((): LinearSegment | null => {
    const w = this.containerWidth();
    const r = this.strokeRadius();
    const x2 = w - r;

    if (this.isIndeterminate()) {
      const segments = this.indeterminateSegments();
      const last = segments[segments.length - 1];
      const x1 = last ? last.x2 + 2 * r + this.gap : r;
      return x2 > x1 + 2 ? { x1, x2 } : null;
    }

    const activeVal = this.effectiveVisualValue();
    const p = activeVal / 100;
    const buf = this.clampedBuffer();
    const usableWidth = w - 2 * r;
    const hasBufferAhead = buf !== null && buf > activeVal;
    const effectivePct = hasBufferAhead ? buf / 100 : p;
    const effectiveEndX = r + usableWidth * effectivePct;
    const x1 = p <= 0 && !hasBufferAhead ? r : effectiveEndX + 2 * r + this.gap;

    return x2 > x1 + 2 ? { x1, x2 } : null;
  });

  readonly indeterminatePrefixCoords = computed((): LinearSegment | null => {
    if (!this.isIndeterminate()) return null;
    const first = this.indeterminateSegments()[0];
    if (!first) return null;

    const r = this.strokeRadius();
    const x1 = r;
    const x2 = first.x1 - 2 * r - this.gap;
    return x2 > x1 + 2 ? { x1, x2 } : null;
  });

  readonly indeterminateMiddleCoords = computed((): LinearSegment | null => {
    if (!this.isIndeterminate()) return null;
    const segments = this.indeterminateSegments();
    if (segments.length < 2) return null;

    const r = this.strokeRadius();
    const x1 = segments[0].x2 + 2 * r + this.gap;
    const x2 = segments[1].x1 - 2 * r - this.gap;
    return x2 > x1 + 2 ? { x1, x2 } : null;
  });

  readonly inactiveTrackSegments = computed((): readonly LinearSegment[] => {
    return [
      this.indeterminatePrefixCoords(),
      this.indeterminateMiddleCoords(),
      this.trackCoords()
    ].filter((seg): seg is LinearSegment => seg !== null);
  });

  readonly blueprintMetrics = computed(() => {
    const r = this.strokeRadius();
    const w = this.containerWidth();
    const yMid = this.yCenter();
    const amp = this.isIndeterminate() ? this.currentAmplitude() : this.effectiveVisualAmplitude();
    const tickHalf = r + 5;

    let gap: { left: number; right: number } | null = null;
    if (this.isIndeterminate()) {
      const segs = this.indeterminateSegments();
      const suffix = this.trackCoords();
      const lastSeg = segs[segs.length - 1];
      if (lastSeg && suffix) {
        gap = { left: lastSeg.x2 + r, right: suffix.x1 - r };
      }
    } else {
      const p = this.effectiveVisualValue() / 100;
      const nextTrack = this.bufferCoords()?.x1 ?? this.trackCoords()?.x1 ?? null;
      if (p > 0 && nextTrack !== null) {
        const activeEnd = r + (w - 2 * r) * p;
        gap = { left: activeEnd + r, right: nextTrack - r };
      }
    }

    const stopCx = this.showStop() && !this.isIndeterminate() && this.trackCoords()
      ? w - r
      : null;

    return {
      xMin: r,
      xMax: w - r,
      yMid,
      amp,
      tickHalf,
      gap,
      stopCx
    };
  });

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-linear-progress',
      `m3-linear-progress-${this.size()}`,
      `m3-progress-${this.color()}`
    ];
    if (this.wavy()) classes.push('m3-linear-progress-wavy');
    if (this.isIndeterminate()) classes.push('m3-linear-progress-indeterminate');
    if (this.customClass()) classes.push(this.customClass());
    return classes.join(' ');
  });

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.elementRef.nativeElement.querySelector('.m3-linear-progress') as HTMLElement;
    if (el) {
      this.containerWidth.set(Math.max(40, el.clientWidth || 400));
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(entries => {
          const w = entries[0]?.contentRect.width;
          if (w && w > 0) {
            this.containerWidth.set(Math.max(40, w));
          }
        });
        this.resizeObserver.observe(el);
      }
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
