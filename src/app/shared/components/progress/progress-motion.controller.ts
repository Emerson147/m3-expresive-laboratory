import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  NgZone,
  PLATFORM_ID,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import {
  DEFAULT_WAVE_SPEED_DP_PER_SEC,
  createProgressMotionState,
  evaluateWaveAmplitudeEnvelope,
  stepProgressMotion
} from './progress-motion.util';

export interface WavyProgressControllerOptions {
  wavy: () => boolean;
  isIndeterminate: () => boolean;
  paused: () => boolean;
  hasActiveProgress: () => boolean;
  targetValue: () => number;
  maxAmplitude: () => number;
  restingAmplitude: () => number;
  speed: () => number | null;
  phaseWavelength: () => number;
  indeterminateCycleSec: number;
  wrapIndeterminateCycle: boolean;
  reducedMotionIndeterminateValue: number;
  isRafDriven: () => boolean;
}

export interface WavyProgressController {
  readonly phase: WritableSignal<number>;
  readonly indeterminatePosition: WritableSignal<number>;
  readonly prefersReducedMotion: WritableSignal<boolean>;
  readonly effectiveVisualValue: Signal<number>;
  readonly effectiveVisualAmplitude: Signal<number>;
}

/**
 * Tracks `(prefers-reduced-motion: reduce)` safely across SSR and live OS/browser changes.
 * Must be called inside an Angular injection context.
 */
export function observePrefersReducedMotion(onReduced?: () => void): WritableSignal<boolean> {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const prefersReducedMotion = signal<boolean>(false);

  if (isPlatformBrowser(platformId) && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = (matches: boolean) => {
      prefersReducedMotion.set(matches);
      if (matches) {
        onReduced?.();
      }
    };

    syncPreference(mediaQuery.matches);
    const onMotionChange = (event: MediaQueryListEvent) => syncPreference(event.matches);
    mediaQuery.addEventListener('change', onMotionChange);
    destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', onMotionChange));
  }

  return prefersReducedMotion;
}

/**
 * Shared signal & outside-Zone RAF controller for M3 Linear and Circular wavy progress indicators.
 * Coordinates continuous wave phase propagation, indeterminate cycles, 400ms emphasized-decelerate
 * determinate travel, and 200ms destination amplitude settling. Must be called in injection context.
 */
export function createWavyProgressController(
  options: WavyProgressControllerOptions
): WavyProgressController {
  const platformId = inject(PLATFORM_ID);
  const ngZone = inject(NgZone);

  const phase = signal<number>(0);
  const indeterminatePosition = signal<number>(0);
  const visualValue = signal<number>(0);
  const visualAmplitude = signal<number>(0);
  const motionInitialized = signal<boolean>(false);
  const isSettling = signal<boolean>(false);

  const prefersReducedMotion = observePrefersReducedMotion(() =>
    indeterminatePosition.set(options.reducedMotionIndeterminateValue)
  );

  let elapsedSec = 0;
  const animState = createProgressMotionState();
  const canUseRaf = () => isPlatformBrowser(platformId) && typeof requestAnimationFrame === 'function';

  effect(() => {
    const wavy = options.wavy();
    const indet = options.isIndeterminate();
    const targetVal = options.targetValue();
    const maxAmp = options.maxAmplitude();
    const reduced = prefersReducedMotion();
    const rafDriven = options.isRafDriven();

    if (!wavy || indet || reduced || !canUseRaf()) {
      stepProgressMotion(animState, {
        targetValue: targetVal,
        maxAmp: wavy ? maxAmp : 0,
        dtSec: 0,
        instantValue: true,
        immediateAll: true
      });
      if (!wavy || indet) {
        animState.valueInitialized = false;
        animState.ampInitialized = false;
        motionInitialized.set(false);
      } else {
        motionInitialized.set(true);
      }
      visualValue.set(animState.valueCurrent);
      visualAmplitude.set(animState.ampCurrent);
      isSettling.set(false);
      return;
    }

    if (!animState.valueInitialized) {
      stepProgressMotion(animState, {
        targetValue: targetVal,
        maxAmp,
        dtSec: 0,
        instantValue: true,
        immediateAll: true
      });
      motionInitialized.set(true);
      visualValue.set(animState.valueCurrent);
      visualAmplitude.set(animState.ampCurrent);
      isSettling.set(false);
      return;
    }

    if (rafDriven) {
      animState.valueStart = targetVal;
      animState.valueTarget = targetVal;
      animState.valueCurrent = targetVal;
      animState.valueElapsedSec = 0;
      visualValue.set(targetVal);
    }

    const desiredAmp = maxAmp * evaluateWaveAmplitudeEnvelope(animState.valueCurrent / 100).factor;
    const needsValueSettle = !rafDriven && Math.abs(targetVal - animState.valueCurrent) > 0.02;
    const needsAmpSettle = Math.abs(desiredAmp - animState.ampCurrent) > 0.005;
    if (needsValueSettle || needsAmpSettle) {
      isSettling.set(true);
    }
  });

  effect((onCleanup) => {
    if (!canUseRaf()) {
      return;
    }
    if (prefersReducedMotion() && options.isIndeterminate()) {
      indeterminatePosition.set(options.reducedMotionIndeterminateValue);
    }

    const customSpeed = options.speed();
    const hasPhaseMotion = customSpeed === null || customSpeed > 0 || options.isIndeterminate();
    const needsPhaseRaf =
      options.wavy() &&
      !options.paused() &&
      !prefersReducedMotion() &&
      hasPhaseMotion &&
      options.hasActiveProgress();
    const needsSettleRaf =
      options.wavy() &&
      !options.isIndeterminate() &&
      !prefersReducedMotion() &&
      isSettling();

    if (!needsPhaseRaf && !needsSettleRaf) {
      return;
    }

    let frameId = 0;
    let lastFrameTime = 0;
    ngZone.runOutsideAngular(() => {
      const loop = (timestamp: number) => {
        const dt = lastFrameTime > 0 ? Math.min(0.1, Math.max(0, (timestamp - lastFrameTime) / 1000)) : 0;
        lastFrameTime = timestamp;

        if (needsPhaseRaf) {
          elapsedSec += dt;
          const lambda = options.phaseWavelength();
          const speedVal = options.speed();
          const effectiveSpeed = speedVal !== null ? Math.max(0, speedVal) : DEFAULT_WAVE_SPEED_DP_PER_SEC;
          const phaseHz = effectiveSpeed / lambda;
          phase.set((elapsedSec * phaseHz * 2 * Math.PI) % (2 * Math.PI));

          if (options.isIndeterminate()) {
            const rawCycle = elapsedSec / options.indeterminateCycleSec;
            indeterminatePosition.set(options.wrapIndeterminateCycle ? rawCycle % 1 : rawCycle);
          }
        }

        let stillSettling = false;
        if (!options.isIndeterminate()) {
          stillSettling = stepProgressMotion(animState, {
            targetValue: untracked(options.targetValue),
            maxAmp: untracked(options.maxAmplitude),
            dtSec: dt,
            instantValue: untracked(options.isRafDriven),
            immediateAll: false
          });
          visualValue.set(animState.valueCurrent);
          visualAmplitude.set(animState.ampCurrent);
          if (!stillSettling && untracked(() => isSettling())) {
            isSettling.set(false);
          }
        }

        if (needsPhaseRaf || stillSettling) {
          frameId = requestAnimationFrame(loop);
        }
      };

      frameId = requestAnimationFrame(loop);
    });

    onCleanup(() => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    });
  });

  return {
    phase,
    indeterminatePosition,
    prefersReducedMotion,
    effectiveVisualValue: computed(() =>
      motionInitialized() ? visualValue() : options.targetValue()
    ),
    effectiveVisualAmplitude: computed(() =>
      motionInitialized() ? visualAmplitude() : options.restingAmplitude()
    )
  };
}

