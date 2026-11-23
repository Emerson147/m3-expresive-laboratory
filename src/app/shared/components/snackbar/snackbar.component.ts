import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  model,
  output,
  viewChild
} from '@angular/core';

let nextSnackbarId = 0;

@Component({
  selector: 'm3-snackbar',
  standalone: true,
  host: {
    class: 'contents'
  },
  template: `
    <div
      #popoverEl
      [id]="snackbarId"
      popover="manual"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="m3-snackbar"
      [class.is-fallback-open]="!supportsNativePopover && open()">
      <span class="font-medium tracking-tight">{{ message() }}</span>

      <div class="flex items-center gap-1 shrink-0">
        @if (actionLabel()) {
          <button
            type="button"
            class="m3-snackbar-action state-layer focus-ring-m3"
            (click)="onActionClick()">
            {{ actionLabel() }}
          </button>
        }

        @if (dismissible()) {
          <button
            type="button"
            aria-label="Cerrar notificación"
            [attr.popovertarget]="supportsNativePopover ? snackbarId : null"
            [attr.popovertargetaction]="supportsNativePopover ? 'hide' : null"
            class="m3-snackbar-close state-layer focus-ring-m3"
            (click)="dismiss()">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">close</span>
          </button>
        }
      </div>
    </div>
  `
})
export class M3SnackbarComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly message = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly dismissible = input<boolean>(true);
  readonly durationMs = input<number>(4000);
  readonly open = model<boolean>(false);

  readonly action = output<void>();
  readonly dismissed = output<void>();

  readonly snackbarId = `m3-snackbar-${++nextSnackbarId}`;
  readonly popoverEl = viewChild<ElementRef<HTMLElement>>('popoverEl');

  /** Mandatory feature detection: popover="manual" must exist with showPopover/hidePopover */
  readonly supportsNativePopover =
    typeof HTMLElement !== 'undefined' &&
    'popover' in HTMLElement.prototype &&
    typeof HTMLElement.prototype.showPopover === 'function';

  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      // Track message changes so consecutive notifications reset the auto-hide countdown
      this.message();
      const duration = this.durationMs();
      const el = this.popoverEl()?.nativeElement;
      this.clearAutoHide();

      if (isOpen) {
        if (this.supportsNativePopover && el && !el.matches(':popover-open')) {
          try {
            el.showPopover();
          } catch {
            // Fallback state already binds via open()
          }
        }
        if (duration > 0) {
          this.autoHideTimer = setTimeout(() => this.dismiss(), duration);
        }
      } else if (this.supportsNativePopover && el) {
        try {
          if (el.matches(':popover-open')) {
            el.hidePopover();
          }
        } catch {
          // Ignore when already closed or unsupported
        }
      }
    });

    this.destroyRef.onDestroy(() => this.clearAutoHide());
  }

  onActionClick(): void {
    this.action.emit();
    this.dismiss();
  }

  dismiss(): void {
    this.clearAutoHide();
    const el = this.popoverEl()?.nativeElement;
    if (this.supportsNativePopover && el) {
      try {
        if (el.matches(':popover-open')) {
          el.hidePopover();
        }
      } catch {
        // Ignore in JSDOM/synthetic environments
      }
    }
    if (this.open()) {
      this.open.set(false);
      this.dismissed.emit();
    }
  }

  private clearAutoHide(): void {
    if (this.autoHideTimer !== null) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }
}

