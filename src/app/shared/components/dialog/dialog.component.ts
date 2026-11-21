import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { M3ButtonComponent } from '../button/button.component';

export type M3DialogVariant = 'basic' | 'expressive';
export type M3DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type M3DialogTone = 'primary' | 'secondary' | 'tertiary' | 'error';

let nextDialogId = 0;

const TONE_BADGE_CLASSES: Record<M3DialogTone, string> = {
  primary: 'bg-primary-box text-on-primary-box',
  secondary: 'bg-sec-box text-on-sec-box',
  tertiary: 'bg-tertiary-box text-on-tertiary-box',
  error: 'bg-error-box text-on-error-box'
};

const TONE_ICON_CLASSES: Record<M3DialogTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  error: 'text-error'
};

/**
 * Material 3 Modal Dialog backed by native `<dialog>.showModal()` Top Layer.
 * Supports two visual presets:
 * - `basic` (default): M3 centered confirmation/alert dialog (`280–560px`).
 * - `expressive`: Modular form/detail shell with leading tone badge, subtitle,
 *   close trigger, scrollable `.m3-scrollbar` body, and start/end action slots.
 */
@Component({
  selector: 'm3-dialog',
  standalone: true,
  imports: [M3ButtonComponent],
  host: {
    class: 'contents'
  },
  template: `
    <dialog
      #dialogEl
      [class]="dialogClasses()"
      [style.view-transition-name]="viewTransitionName()"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="describedById()"
      [attr.closedby]="managedClose() ? 'none' : (closeOnBackdrop() ? 'any' : 'closerequest')"
      (cancel)="onNativeCancel($event)"
      (close)="onNativeClose()"
      (pointerdown)="onPointerDown($event)"
      (pointerup)="onPointerUp($event)">
      @if (aurora()) {
        <div class="m3-aurora-layer" aria-hidden="true">
          <span class="m3-aurora-orb m3-aurora-orb-1"></span>
          <span class="m3-aurora-orb m3-aurora-orb-2"></span>
          <span class="m3-aurora-orb m3-aurora-orb-3"></span>
        </div>
      }

      <div
        class="m3-dialog-inner relative z-10 p-6 flex flex-col gap-4 max-h-[calc(100dvh-2rem)]"
        [class.md:p-8]="size() === 'fullscreen'"
        [class.relative]="!isExpressive() && !aurora()">
        @if (isExpressive()) {
          <!-- EXPRESSIVE HEADER (Icon Pill + Headline + Subtitle + Extra Badges + Close Button) -->
          <header class="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-outline-sub shrink-0">
            <div class="flex items-start gap-3 min-w-0">
              @if (icon()) {
                <div
                  [class]="toneBadgeClass()"
                  class="w-11 h-11 rounded-m3-lg grid place-items-center shrink-0"
                  aria-hidden="true">
                  <span class="material-symbols-rounded text-xl">{{ icon() }}</span>
                </div>
              }
              <div class="min-w-0">
                <h2
                  [id]="titleId"
                  tabindex="-1"
                  class="text-title-lg-emphasized text-main outline-none">
                  {{ headline() }}
                </h2>
                @if (subtitle() || ariaDescription()) {
                  <p [id]="descId" class="text-body-sm text-muted mt-0.5">
                    {{ subtitle() || ariaDescription() }}
                  </p>
                }
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-auto">
              <ng-content select="[dialog-header-extra]" />
              @if (hasCloseButton()) {
                <m3-button
                  [iconOnly]="true"
                  variant="text"
                  size="sm"
                  icon="close"
                  [ariaLabel]="closeLabel()"
                  (action)="dismiss('close')" />
              }
            </div>
          </header>

          @if (subtitle() && ariaDescription()) {
            <p [id]="extraDescId" class="text-body-sm text-muted shrink-0">
              {{ ariaDescription() }}
            </p>
          }
        } @else {
          @if (hasCloseButton()) {
            <div class="absolute top-3 right-3">
              <m3-button
                [iconOnly]="true"
                variant="text"
                size="sm"
                icon="close"
                [ariaLabel]="closeLabel()"
                (action)="dismiss('close')" />
            </div>
          }

          @if (icon()) {
            <div [class]="'flex justify-center ' + toneIconClass()">
              <span class="material-symbols-rounded text-2xl" aria-hidden="true">{{ icon() }}</span>
            </div>
          }

          <h2
            [id]="titleId"
            tabindex="-1"
            class="text-headline-sm-emphasized text-main outline-none"
            [class.text-center]="!!icon()">
            {{ headline() }}
          </h2>

          @if (ariaDescription()) {
            <p [id]="descId" class="text-body-md text-muted leading-relaxed">
              {{ ariaDescription() }}
            </p>
          }
        }

        <!-- SINGLE STATIC CONTENT SLOT (Prevents Angular @if/@else dual <ng-content> projection loss) -->
        <div
          [class]="isExpressive()
            ? 'm3-dialog-body flex-initial min-h-0 overflow-y-auto overflow-x-hidden pr-1 m3-scrollbar text-body-md text-main'
            : 'm3-dialog-body flex-initial min-h-0 overflow-y-auto overflow-x-hidden m3-scrollbar text-body-md text-muted leading-relaxed'">
          <ng-content />
        </div>

        <!-- SINGLE STATIC FOOTER WITH START + END ACTION SLOTS -->
        <footer
          [class]="isExpressive()
            ? 'm3-dialog-footer flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-outline-sub shrink-0'
            : 'm3-dialog-footer flex items-center justify-end gap-2 pt-2 shrink-0'">
          <div class="m3-dialog-actions-slot flex items-center gap-2 empty:hidden">
            <ng-content select="[dialog-actions-start]" />
          </div>
          <div class="m3-dialog-actions-slot flex items-center gap-3 ml-auto empty:hidden">
            <ng-content select="[dialog-actions]" />
          </div>
        </footer>
      </div>
    </dialog>
  `
})
export class M3DialogComponent {
  readonly open = model<boolean>(false);
  readonly headline = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly ariaDescription = input<string | null>(null);
  readonly variant = input<M3DialogVariant>('basic');
  readonly size = input<M3DialogSize>('md');
  readonly tone = input<M3DialogTone>('secondary');
  readonly closeOnBackdrop = input<boolean>(true);
  readonly showCloseButton = input<boolean | null>(null);
  readonly closeLabel = input<string>('Cerrar diálogo');
  readonly viewTransitionName = input<string | null>(null);
  readonly managedClose = input<boolean>(false);
  readonly aurora = input<boolean>(false);
  readonly customClass = input<string>('');

  readonly closed = output<string>();
  readonly closeRequested = output<string>();

  private readonly seqId = ++nextDialogId;
  readonly titleId = `m3-dialog-title-${this.seqId}`;
  readonly descId = `m3-dialog-desc-${this.seqId}`;
  readonly extraDescId = `m3-dialog-extra-desc-${this.seqId}`;

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');
  private pressedOutside = false;

  readonly hasCloseButton = computed(() =>
    this.showCloseButton() ?? this.variant() === 'expressive'
  );
  readonly isExpressive = computed(() => this.variant() === 'expressive');

  readonly toneBadgeClass = computed(() => TONE_BADGE_CLASSES[this.tone()]);
  readonly toneIconClass = computed(() => TONE_ICON_CLASSES[this.tone()]);

  readonly describedById = computed<string | null>(() => {
    if (this.variant() === 'expressive') {
      if (this.subtitle() && this.ariaDescription()) return this.extraDescId;
      if (this.subtitle() || this.ariaDescription()) return this.descId;
      return null;
    }
    return this.ariaDescription() ? this.descId : null;
  });

  readonly dialogClasses = computed(() => {
    const classes = ['m3-dialog', `m3-dialog-${this.variant()}`];
    if (this.variant() === 'expressive' || this.size() !== 'md') {
      classes.push(`m3-dialog-${this.size()}`);
    }
    if (this.aurora()) {
      classes.push('hero-mesh-m3', 'm3-aurora-glow');
    }
    if (this.viewTransitionName()) {
      classes.push('is-vt-managed');
    }
    if (this.customClass()) {
      classes.push(this.customClass());
    }
    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      const shouldOpen = this.open();
      const el = this.dialogRef()?.nativeElement;
      if (!el) return;

      if (shouldOpen) {
        if (!el.hasAttribute('open')) {
          if (typeof el.showModal === 'function') {
            try {
              el.showModal();
            } catch {
              el.setAttribute('open', '');
            }
          } else {
            el.setAttribute('open', '');
          }
        }
      } else if (el.hasAttribute('open')) {
        if (typeof el.close === 'function') {
          try {
            el.close();
          } catch {
            el.removeAttribute('open');
          }
        } else {
          el.removeAttribute('open');
        }
      }
    });
  }

  onPointerDown(event: PointerEvent): void {
    const el = this.dialogRef()?.nativeElement;
    if (!this.closeOnBackdrop() || !el) {
      this.pressedOutside = false;
      return;
    }
    this.pressedOutside = this.isPointerOutside(event, el);
  }

  onPointerUp(event: PointerEvent): void {
    const el = this.dialogRef()?.nativeElement;
    const needsManualBackdropCheck =
      this.managedClose() || !('closedBy' in HTMLDialogElement.prototype);
    if (!this.closeOnBackdrop() || !el || !needsManualBackdropCheck) {
      this.pressedOutside = false;
      return;
    }
    if (this.pressedOutside && this.isPointerOutside(event, el)) {
      this.pressedOutside = false;
      this.dismiss('backdrop');
      return;
    }
    this.pressedOutside = false;
  }

  onNativeCancel(event: Event): void {
    event.preventDefault();
    this.dismiss('escape');
  }

  onNativeClose(): void {
    const el = this.dialogRef()?.nativeElement;
    const returnVal = el?.returnValue || 'close';
    if (el) {
      el.returnValue = '';
    }
    if (this.open()) {
      this.open.set(false);
    }
    this.closed.emit(returnVal);
  }

  dismiss(reason = 'dismiss'): void {
    if (this.managedClose()) {
      this.closeRequested.emit(reason);
      return;
    }
    const el = this.dialogRef()?.nativeElement;
    if (el && el.hasAttribute('open')) {
      if (typeof el.close === 'function') {
        try {
          el.close(reason);
          return;
        } catch {
          el.removeAttribute('open');
        }
      } else {
        el.removeAttribute('open');
      }
    }
    if (this.open()) {
      this.open.set(false);
      this.closed.emit(reason);
    }
  }

  private isPointerOutside(event: PointerEvent, el: HTMLDialogElement): boolean {
    const r = el.getBoundingClientRect();
    return (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    );
  }
}
