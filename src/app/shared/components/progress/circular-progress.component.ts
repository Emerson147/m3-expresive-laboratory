import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  DEFAULT_CIRCULAR_AMPLITUDE_DP,
  DEFAULT_CIRCULAR_INDETERMINATE_CYCLE_SEC,
  DEFAULT_CIRCULAR_WAVELENGTH_DP,
  DEFAULT_LINEAR_WAVELENGTH_DP,
  buildCircularArcPath,
  buildCircularWavePath,
  computeCircularIndeterminateBounds,
  computeCircularWaveQuantization,
  evaluateWaveAmplitudeEnvelope
} from './progress-motion.util';
import { createWavyProgressController } from './progress-motion.controller';

export type M3CircularProgressColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color' | 'inherit';
export type M3CircularProgressSize = 'sm' | 'md' | 'lg';

const CIRCULAR_STROKE_WIDTH_DP: Record<M3CircularProgressSize, number> = { sm: 5.2, md: 4, lg: 4.5 };
const CIRCULAR_AMPLITUDE_DP: Record<M3CircularProgressSize, number> = {
  sm: 0.9,
  md: DEFAULT_CIRCULAR_AMPLITUDE_DP,
  lg: 1.9
};
const CIRCULAR_LOBES_BY_SIZE: Record<M3CircularProgressSize, number> = { sm: 6, md: 9, lg: 10 };

@Component({
  selector: 'm3-circular-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center justify-center'
  },
  template: `
    <div
      role="progressbar"
      [class]="computedClasses()"
      [style.width.px]="clampedDiameter()"
      [style.height.px]="clampedDiameter()"
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
          @if (showTrack() && shouldRenderTrack() && wavyTrackPath()) {
            <path
              class="m3-circular-track"
              [attr.d]="wavyTrackPath()!"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round"
              fill="none" />
          }

          @if (wavyActivePath()) {
            <path
              class="m3-circular-indicator"
              [attr.d]="wavyActivePath()!"
              [attr.stroke-width]="strokeWidth()"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none" />
          }

          @if (blueprint() && blueprintMetrics(); as bp) {
            <g class="m3-progress-blueprint" aria-hidden="true">
              <line class="m3-blueprint-axis" x1="21.5" y1="24" x2="26.5" y2="24" />
              <line class="m3-blueprint-axis" x1="24" y1="21.5" x2="24" y2="26.5" />
              <circle
                class="m3-blueprint-axis"
                cx="24"
                cy="24"
                [attr.r]="bp.r"
                fill="none" />
              @if (bp.amp > 0.05) {
                <circle
                  class="m3-blueprint-envelope"
                  cx="24"
                  cy="24"
                  [attr.r]="bp.r + bp.amp"
                  fill="none" />
                @if (bp.r - bp.amp > 2) {
                  <circle
                    class="m3-blueprint-envelope"
                    cx="24"
                    cy="24"
                    [attr.r]="bp.r - bp.amp"
                    fill="none" />
                }
              }
              @if (bp.gapTickA && bp.gapTickB) {
                <line
                  class="m3-blueprint-gap-tick"
                  [attr.x1]="bp.gapTickA.x1"
                  [attr.y1]="bp.gapTickA.y1"
                  [attr.x2]="bp.gapTickA.x2"
                  [attr.y2]="bp.gapTickA.y2" />
                <line
                  class="m3-blueprint-gap-tick"
                  [attr.x1]="bp.gapTickB.x1"
                  [attr.y1]="bp.gapTickB.y1"
                  [attr.x2]="bp.gapTickB.x2"
                  [attr.y2]="bp.gapTickB.y2" />
              }
            </g>
          }
        } @else {
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

          @if (isIndeterminate() || clampedValue() > 0) {
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
        }
      </svg>
    </div>
  `
})
export class M3CircularProgressComponent {
  readonly value = input<number | null>(null);
  readonly size = input<M3CircularProgressSize>('md');
  readonly diameter = input<number | null>(null);
  readonly color = input<M3CircularProgressColor>('primary');
  readonly wavy = input<boolean>(false);
  readonly amplitude = input<number | null>(null);
  readonly wavelengthInput = input<number | null>(null, { alias: 'wavelength' });
  readonly speed = input<number | null>(null);
  readonly paused = input<boolean>(false);
  readonly blueprint = input<boolean>(false);
  readonly showTrack = input<boolean>(true);
  readonly ariaLabel = input<string>('Cargando...');
  readonly customClass = input<string>('');

  readonly radius = 18;
  readonly circumference = 2 * Math.PI * this.radius;
  readonly gapLength = 4;
  readonly effectiveGap = computed(() => this.gapLength + this.strokeWidth());

  private readonly motion = createWavyProgressController({
    wavy: () => this.wavy(),
    isIndeterminate: () => this.isIndeterminate(),
    paused: () => this.paused(),
    hasActiveProgress: () => this.hasActiveProgress(),
    targetValue: () => this.clampedValue(),
    maxAmplitude: () => this.waveAmplitude(),
    restingAmplitude: () => this.currentAmplitude(),
    speed: () => this.speed(),
    phaseWavelength: () => this.wavelengthInput() ?? DEFAULT_LINEAR_WAVELENGTH_DP,
    indeterminateCycleSec: DEFAULT_CIRCULAR_INDETERMINATE_CYCLE_SEC,
    wrapIndeterminateCycle: false,
    reducedMotionIndeterminateValue: 0.18,
    isRafDriven: () => this.customClass().includes('m3-progress-raf-driven')
  });

  readonly phase = this.motion.phase;
  readonly indeterminateCycles = this.motion.indeterminatePosition;
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

  readonly clampedDiameter = computed(() => {
    const custom = this.diameter();
    if (custom === null || custom === undefined) return null;
    return Math.min(240, Math.max(18, custom));
  });

  readonly effectiveDiameterDp = computed(() => {
    const custom = this.clampedDiameter();
    if (custom !== null) return custom;
    switch (this.size()) {
      case 'sm': return 24;
      case 'lg': return 56;
      case 'md':
      default: return this.wavy() ? 48 : 40;
    }
  });

  readonly strokeWidth = computed(() => {
    const customD = this.clampedDiameter();
    if (customD !== null) return customD <= 24 ? 5.2 : 4;
    return CIRCULAR_STROKE_WIDTH_DP[this.size()];
  });

  readonly waveAmplitude = computed(() => {
    const custom = this.amplitude();
    if (custom !== null && custom !== undefined) {
      const clampedDp = Math.min(12, Math.max(0, custom));
      return Math.min(8, clampedDp * (48 / this.effectiveDiameterDp()));
    }
    const customD = this.clampedDiameter();
    if (customD !== null) return customD <= 28 ? 0.9 : 1.65;
    return CIRCULAR_AMPLITUDE_DP[this.size()];
  });

  readonly effectiveRadius = computed(() => {
    const customAmp = this.amplitude();
    if (customAmp === null || customAmp === undefined) return this.radius;
    return Math.max(10, Math.min(this.radius, 24 - this.strokeWidth() / 2 - this.waveAmplitude()));
  });

  readonly radiusDp = computed(() => this.effectiveRadius() * (this.effectiveDiameterDp() / 48));

  readonly circularWavelengthDp = computed(() => {
    const custom = this.wavelengthInput();
    if (custom !== null && custom !== undefined) {
      return Math.max(8, custom * 0.375);
    }
    return DEFAULT_CIRCULAR_WAVELENGTH_DP;
  });

  readonly circularQuantization = computed(() =>
    computeCircularWaveQuantization(this.radiusDp(), this.circularWavelengthDp())
  );

  readonly waveLobes = computed(() => {
    if (this.wavelengthInput() !== null && this.wavelengthInput() !== undefined) {
      return this.circularQuantization().lobes;
    }
    const customD = this.clampedDiameter();
    if (customD !== null) {
      if (customD <= 28) return 6;
      return customD >= 96 ? 10 : 9;
    }
    return CIRCULAR_LOBES_BY_SIZE[this.size()];
  });

  readonly currentAmplitude = computed(() => {
    const maxAmp = this.waveAmplitude();
    if (this.isIndeterminate()) return maxAmp;
    return maxAmp * evaluateWaveAmplitudeEnvelope(this.clampedValue() / 100).factor;
  });

  readonly indeterminateBounds = computed(() =>
    computeCircularIndeterminateBounds(this.indeterminateCycles())
  );

  readonly indeterminateAngle = computed(() => this.indeterminateBounds().startAngle);

  readonly dashOffset = computed(() =>
    this.circumference * (1 - this.clampedValue() / 100)
  );

  readonly shouldRenderTrack = computed(() => {
    const r = this.effectiveRadius();
    if (this.isIndeterminate()) {
      if (!this.wavy()) return true;
      const { startAngle, endAngle } = this.indeterminateBounds();
      const gapAngle = this.effectiveGap() / r;
      return 2 * Math.PI - (endAngle - startAngle) - 2 * gapAngle > 0.05;
    }
    const p = (this.wavy() ? this.effectiveVisualValue() : this.clampedValue()) / 100;
    if (p <= 0) return true;
    if (this.wavy()) {
      const gapAngle = this.effectiveGap() / r;
      return 2 * Math.PI - p * 2 * Math.PI - 2 * gapAngle > 0.05;
    }
    const availableTrack = this.circumference * (1 - p) - 2 * this.effectiveGap();
    return availableTrack > 0.5;
  });

  readonly trackDashArray = computed(() => {
    const p = this.clampedValue() / 100;
    if (p <= 0) return `${this.circumference} ${this.circumference}`;
    const remainingLength = this.circumference * (1 - p);
    const availableTrack = Math.max(0, remainingLength - this.effectiveGap() * 2);
    return `${availableTrack} ${this.circumference}`;
  });

  readonly trackDashOffset = computed(() => {
    const p = this.clampedValue() / 100;
    if (p <= 0) return 0;
    return -(this.circumference * p + this.effectiveGap());
  });

  readonly wavyActivePath = computed(() => {
    const rBase = this.effectiveRadius();
    const maxAmp = this.waveAmplitude();
    const ph = this.phase();
    const numLobes = this.waveLobes();

    if (this.isIndeterminate()) {
      const { startAngle, endAngle } = this.indeterminateBounds();
      return buildCircularWavePath(startAngle, endAngle, rBase, maxAmp, numLobes, ph);
    }

    const p = this.effectiveVisualValue() / 100;
    if (p <= 0) return '';

    const totalAngle = p * 2 * Math.PI;
    const amp = this.effectiveVisualAmplitude();
    return buildCircularWavePath(0, totalAngle, rBase, amp, numLobes, ph);
  });

  readonly circularWavePath = computed(() => this.wavyActivePath());

  readonly wavyTrackPath = computed(() => {
    if (!this.shouldRenderTrack()) return null;

    const r = this.effectiveRadius();
    const gapAngle = this.effectiveGap() / r;

    if (this.isIndeterminate()) {
      const { startAngle, endAngle } = this.indeterminateBounds();
      const trackStart = endAngle + gapAngle;
      const trackEnd = startAngle + 2 * Math.PI - gapAngle;
      if (trackEnd <= trackStart + 0.05) return null;
      return buildCircularArcPath(trackStart, trackEnd, r);
    }

    const p = this.effectiveVisualValue() / 100;
    if (p <= 0) return buildCircularArcPath(0, Math.PI * 1.999, r);

    const trackStart = p * 2 * Math.PI + gapAngle;
    const trackEnd = 2 * Math.PI - gapAngle;
    if (trackEnd <= trackStart + 0.05) return null;
    return buildCircularArcPath(trackStart, trackEnd, r);
  });

  readonly blueprintMetrics = computed(() => {
    const r = this.effectiveRadius();
    const amp = this.isIndeterminate() ? this.currentAmplitude() : this.effectiveVisualAmplitude();
    const gapAngle = this.effectiveGap() / r;
    const capAngleOffset = (this.strokeWidth() / 2) / r;

    let endAngle: number | null = null;
    if (this.isIndeterminate()) {
      endAngle = this.indeterminateBounds().endAngle;
    } else {
      const p = this.effectiveVisualValue() / 100;
      if (p > 0) endAngle = p * 2 * Math.PI;
    }

    const tick = (angle: number) => {
      const inner = Math.max(2, r - this.strokeWidth() / 2 - 2.5);
      const outer = r + this.strokeWidth() / 2 + 2.5;
      return {
        x1: 24 + inner * Math.sin(angle),
        y1: 24 - inner * Math.cos(angle),
        x2: 24 + outer * Math.sin(angle),
        y2: 24 - outer * Math.cos(angle)
      };
    };

    const showGapTicks = endAngle !== null && this.shouldRenderTrack();
    return {
      r,
      amp,
      gapTickA: showGapTicks ? tick(endAngle! + capAngleOffset) : null,
      gapTickB: showGapTicks ? tick(endAngle! + gapAngle - capAngleOffset) : null
    };
  });

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-circular-progress',
      `m3-circular-progress-${this.size()}`,
      `m3-progress-${this.color()}`
    ];
    if (this.wavy()) classes.push('m3-circular-wavy');
    if (this.isIndeterminate()) classes.push('m3-circular-progress-indeterminate');
    if (this.customClass()) classes.push(this.customClass());
    return classes.join(' ');
  });
}
