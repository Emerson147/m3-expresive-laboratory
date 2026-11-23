import { DestroyRef, Signal, signal } from '@angular/core';

/**
 * Replays keyframe animations on persistent DOM nodes via requestAnimationFrame
 * without destroying and recreating wrapper nodes in single-item @for blocks (prevents NG0956).
 */
export class MotionReplayHandle {
  private readonly _active = signal<boolean>(false);
  private rafId: number | null = null;

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
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this._active.set(true);
    });
  }

  private cancel(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
