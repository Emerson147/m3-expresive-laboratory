import { Component, ElementRef, effect, input, model, output, viewChild } from '@angular/core';

let nextDialogId = 0;

/**
 * Material 3 Basic Dialog backed by the native HTML <dialog> element (.showModal()),
 * delegating top-layer stacking, outside inertness, Esc dismissal, and backdrop blur
 * directly to the browser without manual JS focus traps.
 */
@Component({
  selector: 'm3-dialog',
  standalone: true,
  host: {
    class: 'contents'
  },
  template: `
    <dialog
      #dialogEl
      class="m3-dialog p-0"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="ariaDescription() ? descId : null"
      [attr.closedby]="closeOnBackdrop() ? 'any' : 'closerequest'"
      (cancel)="onNativeCancel($event)"
      (close)="onNativeClose()"
      (click)="onBackdropClick($event)">
      <div class="p-6 space-y-4">
        @if (icon()) {
          <div class="flex justify-center text-secondary">
            <span class="material-symbols-rounded text-2xl" aria-hidden="true">{{ icon() }}</span>
          </div>
        }

        <h2
          [id]="titleId"
          tabindex="-1"
          class="text-headline-sm font-bold text-main outline-none"
          [class.text-center]="!!icon()">
          {{ headline() }}
        </h2>

        @if (ariaDescription()) {
          <p [id]="descId" class="text-body-md text-muted leading-relaxed">
            {{ ariaDescription() }}
          </p>
        }

        <div class="text-body-md text-muted leading-relaxed">
          <ng-content />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <ng-content select="[dialog-actions]" />
        </div>
      </div>
    </dialog>
  `
})
export class M3DialogComponent {
  readonly open = model<boolean>(false);
  readonly headline = input.required<string>();
  readonly icon = input<string | null>(null);
  readonly ariaDescription = input<string | null>(null);
  readonly closeOnBackdrop = input<boolean>(true);

  readonly closed = output<string>();

  private readonly seqId = ++nextDialogId;
  readonly titleId = `m3-dialog-title-${this.seqId}`;
  readonly descId = `m3-dialog-desc-${this.seqId}`;

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');

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

  onBackdropClick(event: MouseEvent): void {
    const el = this.dialogRef()?.nativeElement;
    if (!this.closeOnBackdrop() || !el || event.target !== el) return;
    this.dismiss('backdrop');
  }

  onNativeCancel(event: Event): void {
    event.preventDefault();
    this.dismiss('escape');
  }

  onNativeClose(): void {
    const returnVal = this.dialogRef()?.nativeElement.returnValue || 'close';
    if (this.open()) {
      this.open.set(false);
    }
    this.closed.emit(returnVal);
  }

  dismiss(reason = 'dismiss'): void {
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
}
