import { DestroyRef, Signal, signal } from '@angular/core';

/**
 * Replays keyframe and CSS transition animations on persistent DOM nodes via double
 * requestAnimationFrame (ensuring frame 1 paints the reset pose before frame 2 activates),
 * avoiding destroy/recreate churn and NG0956 warnings.
 */
export class MotionReplayHandle {
  private readonly _active = signal<boolean>(false);
  private outerRafId: number | null = null;
  private innerRafId: number | null = null;

  readonly active: Signal<boolean> = this._active.asReadonly();

  constructor(destroyRef: DestroyRef, initialActive = false) {
    this._active.set(initialActive);
    destroyRef.onDestroy(() => this.cancel());
  }

  replay(): void {
    this.cancel();
    if (typeof requestAnimationFrame !== 'function') {
      this._active.set(true);
      return;
    }
    this._active.set(false);
    this.outerRafId = requestAnimationFrame(() => {
      this.outerRafId = null;
      this.innerRafId = requestAnimationFrame(() => {
        this.innerRafId = null;
        this._active.set(true);
      });
    });
  }

  private cancel(): void {
    if (typeof cancelAnimationFrame !== 'function') {
      this.outerRafId = null;
      this.innerRafId = null;
      return;
    }
    if (this.outerRafId !== null) {
      cancelAnimationFrame(this.outerRafId);
      this.outerRafId = null;
    }
    if (this.innerRafId !== null) {
      cancelAnimationFrame(this.innerRafId);
      this.innerRafId = null;
    }
  }
}
