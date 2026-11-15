/** Canonical Material 3 WavyProgressIndicator geometry & motion defaults. */
export const DEFAULT_LINEAR_WAVELENGTH_DP = 40;
export const DEFAULT_LINEAR_AMPLITUDE_DP = 3;
export const DEFAULT_CIRCULAR_WAVELENGTH_DP = 15;
export const DEFAULT_CIRCULAR_AMPLITUDE_DP = 1.6;
/** Canonical M3 wave phase velocity: 40 dp/s = 1.00 Hz (1 wavelength cycle per second at 40dp). */
export const DEFAULT_WAVE_SPEED_DP_PER_SEC = 40;
/** Canonical M3 indeterminate cycle durations (seconds) for smooth, non-frantic travel. */
export const DEFAULT_LINEAR_INDETERMINATE_CYCLE_SEC = 2.4;
export const DEFAULT_CIRCULAR_INDETERMINATE_CYCLE_SEC = 2.2;
/** Canonical M3 determinate transition: medium4 (400ms) paired with emphasized-decelerate. */
export const DEFAULT_PROGRESS_TRANSITION_MS = 400;
/** Canonical M3 wave amplitude settling duration at destination (100% / 0%): short4 (200ms). */
export const DEFAULT_AMPLITUDE_SETTLE_MS = 200;

/** Canonical Material 3 WavyProgressIndicator amplitude attenuation thresholds. */
export const WAVE_ENVELOPE_RAMP_IN = 0.1;
export const WAVE_ENVELOPE_RAMP_OUT = 0.95;

/** Canonical M3 Expressive LoadingIndicator spring & rotation choreography (LoadingIndicatorDefaults). */
export const DEFAULT_LOADING_MORPH_INTERVAL_MS = 650;
export const DEFAULT_LOADING_GLOBAL_ROTATION_MS = 4666;
export const DEFAULT_LOADING_SPRING_DAMPING = 0.6;
export const DEFAULT_LOADING_SPRING_STIFFNESS = 200;
export const DEFAULT_LOADING_DIAMETER_DP = 48;
export const MIN_LOADING_DIAMETER_DP = 24;
export const MAX_LOADING_DIAMETER_DP = 240;
export const LOADING_ACTIVE_SHAPE_RATIO = 38 / 48;

export type WaveAmplitudeZone =
  | 'extreme-zero'
  | 'ramp-in'
  | 'full'
  | 'ramp-out'
  | 'extreme-one';

export interface WaveAmplitudeEnvelope {
  factor: number;
  zone: WaveAmplitudeZone;
  zoneLabel: string;
}

export interface CircularWaveQuantization {
  lobes: number;
  circumferenceDp: number;
  adjustedWavelengthDp: number;
}

export interface LinearSegment {
  x1: number;
  x2: number;
}

export interface ProgressMotionState {
  valueInitialized: boolean;
  valueStart: number;
  valueTarget: number;
  valueCurrent: number;
  valueElapsedSec: number;
  ampInitialized: boolean;
  ampCurrent: number;
}

export interface StepProgressMotionOptions {
  targetValue: number;
  maxAmp: number;
  dtSec: number;
  instantValue: boolean;
  immediateAll: boolean;
}

/**
 * Evaluates Y(x) on a unit cubic Bezier curve defined by control points (x1, y1) and (x2, y2)
 * using monotonic binary search on t in [0, 1].
 */
export function evalCubicBezier(x: number, x1: number, y1: number, x2: number, y2: number): number {
  const clamped = Math.min(1, Math.max(0, x));
  if (clamped <= 0) return 0;
  if (clamped >= 1) return 1;

  let lo = 0;
  let hi = 1;
  let t = clamped;

  for (let i = 0; i < 12; i++) {
    t = 0.5 * (lo + hi);
    const inv = 1 - t;
    const bx = 3 * inv * inv * t * x1 + 3 * inv * t * t * x2 + t * t * t;
    if (Math.abs(bx - clamped) < 1e-4) {
      break;
    }
    if (bx < clamped) {
      lo = t;
    } else {
      hi = t;
    }
  }

  const inv = 1 - t;
  return 3 * inv * inv * t * y1 + 3 * inv * t * t * y2 + t * t * t;
}

/** Evaluates M3 Emphasized Decelerate easing: cubic-bezier(0.05, 0.7, 0.1, 1). */
export function evalEmphasizedDecelerate(u: number): number {
  return evalCubicBezier(u, 0.05, 0.7, 0.1, 1);
}

/**
 * Official M3 Expressive amplitude envelope A(p) = A_max * f(p).
 * Smoothly attenuates amplitude to zero at 0% and 100% boundaries using linear ramps
 * below 10% and above 95% so low-progress caps and terminal join stay visually flat.
 */
export function evaluateWaveAmplitudeEnvelope(normalizedProgress: number): WaveAmplitudeEnvelope {
  const p = Math.min(1, Math.max(0, normalizedProgress));
  if (p <= 0) {
    return { factor: 0, zone: 'extreme-zero', zoneLabel: 'Extremo plano (p = 0)' };
  }
  if (p >= 1) {
    return { factor: 0, zone: 'extreme-one', zoneLabel: 'Extremo plano (p = 1)' };
  }
  if (p < WAVE_ENVELOPE_RAMP_IN) {
    return {
      factor: p / WAVE_ENVELOPE_RAMP_IN,
      zone: 'ramp-in',
      zoneLabel: 'Rampa entrada (p < 0.10)'
    };
  }
  if (p > WAVE_ENVELOPE_RAMP_OUT) {
    return {
      factor: (1 - p) / (1 - WAVE_ENVELOPE_RAMP_OUT),
      zone: 'ramp-out',
      zoneLabel: 'Rampa salida (p > 0.95)'
    };
  }
  return {
    factor: 1,
    zone: 'full',
    zoneLabel: 'Zona plena (0.10 ≤ p ≤ 0.95)'
  };
}

/**
 * Quantizes circular wavelengths around circumference C = 2*PI*R0 into integer lobe cycles N
 * so closing the circle at 360deg remains C^1 continuous without seam discontinuities.
 */
export function computeCircularWaveQuantization(
  radiusDp: number,
  circularWavelengthDp: number
): CircularWaveQuantization {
  const safeRadius = Math.max(1, radiusDp);
  const safeLambda = Math.max(1, circularWavelengthDp);
  const circumferenceDp = 2 * Math.PI * safeRadius;
  const lobes = Math.max(1, Math.round(circumferenceDp / safeLambda));
  return {
    lobes,
    circumferenceDp,
    adjustedWavelengthDp: circumferenceDp / lobes
  };
}

export function createProgressMotionState(): ProgressMotionState {
  return {
    valueInitialized: false,
    valueStart: 0,
    valueTarget: 0,
    valueCurrent: 0,
    valueElapsedSec: 0,
    ampInitialized: false,
    ampCurrent: 0
  };
}

function snapValueTarget(state: ProgressMotionState, targetValue: number): void {
  state.valueInitialized = true;
  state.valueStart = targetValue;
  state.valueTarget = targetValue;
  state.valueCurrent = targetValue;
  state.valueElapsedSec = 0;
}

/**
 * Advances determinate wavy progress with M3 Emphasized Decelerate (medium4 400ms)
 * and reduces/settles wave amplitude at destination boundaries (100% / 0%) over short4 (200ms).
 * Returns true while either progress or amplitude is still settling toward its target.
 */
export function stepProgressMotion(
  state: ProgressMotionState,
  { targetValue, maxAmp, dtSec, instantValue, immediateAll }: StepProgressMotionOptions
): boolean {
  const safeMaxAmp = Math.max(0, maxAmp);
  if (immediateAll) {
    snapValueTarget(state, targetValue);
    state.ampInitialized = true;
    state.ampCurrent = safeMaxAmp * evaluateWaveAmplitudeEnvelope(targetValue / 100).factor;
    return false;
  }

  if (!state.valueInitialized || instantValue) {
    snapValueTarget(state, targetValue);
  } else {
    if (Math.abs(targetValue - state.valueTarget) > 0.01) {
      state.valueStart = state.valueCurrent;
      state.valueTarget = targetValue;
      state.valueElapsedSec = 0;
    }
    if (Math.abs(state.valueTarget - state.valueCurrent) > 0.02) {
      state.valueElapsedSec += Math.max(0, dtSec);
      const u = Math.min(1, state.valueElapsedSec / (DEFAULT_PROGRESS_TRANSITION_MS / 1000));
      state.valueCurrent =
        u >= 1
          ? state.valueTarget
          : state.valueStart + (state.valueTarget - state.valueStart) * evalEmphasizedDecelerate(u);
    } else {
      state.valueCurrent = state.valueTarget;
    }
  }

  const desiredAmp = safeMaxAmp * evaluateWaveAmplitudeEnvelope(state.valueCurrent / 100).factor;
  if (!state.ampInitialized) {
    state.ampInitialized = true;
    state.ampCurrent = desiredAmp;
  } else {
    const ampDiff = desiredAmp - state.ampCurrent;
    const maxStep = Math.max(0.25, safeMaxAmp) * (Math.max(0, dtSec) / (DEFAULT_AMPLITUDE_SETTLE_MS / 1000));
    if (Math.abs(ampDiff) <= maxStep || Math.abs(ampDiff) <= 0.005) {
      state.ampCurrent = desiredAmp;
    } else {
      state.ampCurrent += Math.sign(ampDiff) * maxStep;
    }
  }

  const valueSettling = Math.abs(state.valueTarget - state.valueCurrent) > 0.02;
  const ampSettling = Math.abs(desiredAmp - state.ampCurrent) > 0.005;
  return valueSettling || ampSettling;
}

/**
 * Canonical M3 Linear Indeterminate Dual-Pulse kinematics (2.4s cycle).
 * Returns active [x1, x2] pulse segments in SVG container coordinates.
 */
export function computeLinearIndeterminatePulses(
  u: number,
  r: number,
  usableWidth: number
): readonly LinearSegment[] {
  const h1 = u < 0.64 ? evalCubicBezier(u / 0.64, 0.2, 0, 0.8, 1) : 1;
  const t1 = u <= 0.22 ? 0 : u < 0.78 ? evalCubicBezier((u - 0.22) / 0.56, 0.4, 0, 1, 1) : 1;

  const h2 = u <= 0.60 ? 0 : u < 0.92 ? evalCubicBezier((u - 0.60) / 0.32, 0, 0, 0.65, 1) : 1;
  const t2 = u <= 0.72 ? 0 : evalCubicBezier((u - 0.72) / 0.28, 0.1, 0, 0.45, 1);

  const segments: LinearSegment[] = [];
  if (h2 - t2 > 0.01) {
    segments.push({ x1: r + usableWidth * t2, x2: r + usableWidth * h2 });
  }
  if (h1 - t1 > 0.01) {
    segments.push({ x1: r + usableWidth * t1, x2: r + usableWidth * h1 });
  }
  return segments;
}

/**
 * Canonical M3 Circular Indeterminate kinematics (28deg <-> 298deg sweep + continuous spin).
 */
export function computeCircularIndeterminateBounds(cycles: number): {
  startAngle: number;
  endAngle: number;
} {
  const k = Math.floor(cycles);
  const u = cycles - k;

  const minArc = (28 * Math.PI) / 180;
  const sweepSpan = (270 * Math.PI) / 180;
  const cycleAdvance = (144 * Math.PI) / 180;

  const headProgress = u < 0.5 ? evalCubicBezier(u * 2, 0.2, 0, 0.2, 1) : 1;
  const tailProgress = u <= 0.5 ? 0 : evalCubicBezier((u - 0.5) * 2, 0.4, 0, 0.2, 1);

  const baseAngle = cycles * cycleAdvance + k * sweepSpan;
  return {
    startAngle: baseAngle + tailProgress * sweepSpan,
    endAngle: baseAngle + minArc + headProgress * sweepSpan
  };
}

/**
 * Builds an SVG path string for a linear traveling sine wave:
 * y(x, t) = yMid + A(p) * sin(2*PI*x / lambda - phase)
 */
export function buildLinearWavePath(
  startX: number,
  endX: number,
  yMid: number,
  amplitude: number,
  lambda: number,
  phase: number
): string {
  if (endX < startX) return '';
  if (amplitude <= 0.05 || endX - startX < 0.5) {
    return `M ${startX.toFixed(1)},${yMid.toFixed(1)} L ${endX.toFixed(1)},${yMid.toFixed(1)}`;
  }

  const k = (2 * Math.PI) / lambda;
  const step = 2;
  const points: string[] = [];

  const yStart = yMid + amplitude * Math.sin(k * startX - phase);
  points.push(`M ${startX.toFixed(1)},${yStart.toFixed(1)}`);

  for (let x = startX + step; x < endX; x += step) {
    const y = yMid + amplitude * Math.sin(k * x - phase);
    points.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const yEnd = yMid + amplitude * Math.sin(k * endX - phase);
  points.push(`L ${endX.toFixed(1)},${yEnd.toFixed(1)}`);

  return points.join(' ');
}

/**
 * Builds an SVG path string for a polar sinusoidal wave around (24, 24) starting at 12 o'clock:
 * r(theta, t) = rBase + A(p) * sin(numLobes * theta - phase)
 */
export function buildCircularWavePath(
  startAngle: number,
  endAngle: number,
  rBase: number,
  amplitude: number,
  numLobes: number,
  phase: number
): string {
  if (endAngle <= startAngle) return '';

  const totalArc = endAngle - startAngle;
  const numSteps = Math.max(36, Math.ceil((totalArc / (2 * Math.PI)) * 180));
  const step = totalArc / numSteps;
  const points: string[] = [];

  const getPoint = (theta: number) => {
    const r = rBase + amplitude * Math.sin(numLobes * theta - phase);
    return {
      x: 24 + r * Math.sin(theta),
      y: 24 - r * Math.cos(theta)
    };
  };

  const pStart = getPoint(startAngle);
  points.push(`M ${pStart.x.toFixed(2)},${pStart.y.toFixed(2)}`);

  for (let i = 1; i <= numSteps; i++) {
    const p = getPoint(startAngle + i * step);
    points.push(`L ${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }

  if (totalArc >= 2 * Math.PI - 0.01 && amplitude <= 0.02) {
    points.push('Z');
  }

  return points.join(' ');
}

/**
 * Builds a smooth SVG circular arc around (24, 24) clockwise from 12 o'clock (angle 0).
 */
export function buildCircularArcPath(startAngle: number, endAngle: number, r: number): string {
  if (endAngle <= startAngle) return '';

  const x1 = 24 + r * Math.sin(startAngle);
  const y1 = 24 - r * Math.cos(startAngle);
  const x2 = 24 + r * Math.sin(endAngle);
  const y2 = 24 - r * Math.cos(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${x1.toFixed(2)},${y1.toFixed(2)} A ${r},${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

/**
 * Analytical unit step response x(t) for a spring-damper ODE starting at rest x(0)=0, v(0)=0
 * toward target x=1 with normalized dampingRatio (zeta) and stiffness (k = omega_n^2).
 * At zeta = 0.6, stiffness = 200, x peaks near ~1.095 (~9.5% expressive overshoot) around 278ms.
 */
export function evaluateSpringStep(
  elapsedSec: number,
  dampingRatio = DEFAULT_LOADING_SPRING_DAMPING,
  stiffness = DEFAULT_LOADING_SPRING_STIFFNESS
): number {
  const t = Math.max(0, elapsedSec);
  if (t <= 0) return 0;

  const omegaN = Math.sqrt(Math.max(1e-6, stiffness));
  const zeta = Math.max(0, dampingRatio);

  if (zeta < 1) {
    const under = Math.sqrt(1 - zeta * zeta);
    const omegaD = omegaN * under;
    const decay = Math.exp(-zeta * omegaN * t);
    return 1 - decay * (Math.cos(omegaD * t) + (zeta / under) * Math.sin(omegaD * t));
  }

  if (Math.abs(zeta - 1) < 1e-4) {
    const decay = Math.exp(-omegaN * t);
    return 1 - decay * (1 + omegaN * t);
  }

  const root = Math.sqrt(zeta * zeta - 1);
  const r1 = -omegaN * (zeta - root);
  const r2 = -omegaN * (zeta + root);
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

/**
 * Evaluates normalized spring morph progress within a 650ms M3 LoadingIndicator interval,
 * preserving full underdamped overshoot while landing on exact 1.0 at step completion.
 */
export function evaluateLoadingStepSpring(
  elapsedSec: number,
  intervalSec = DEFAULT_LOADING_MORPH_INTERVAL_MS / 1000
): number {
  const safeInterval = Math.max(1e-3, intervalSec);
  const u = Math.min(1, Math.max(0, elapsedSec / safeInterval));
  if (u <= 0) return 0;
  if (u >= 1) return 1;

  const endValue = evaluateSpringStep(safeInterval);
  const scale = endValue > 1e-4 ? 1 / endValue : 1;
  return evaluateSpringStep(u * safeInterval) * scale;
}
