import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Injector, TemplateRef, inject, Injectable, signal } from '@angular/core';

export interface ViewTransitionOptions {
  readonly isExiting?: boolean;
  readonly rootClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StageOverlayService {
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  readonly isOverlayOpen = signal<boolean>(false);
  readonly hasExternalHost = signal<boolean>(false);
  readonly overlayTemplate = signal<TemplateRef<unknown> | null>(null);
  readonly overlayInjector = signal<Injector | null>(null);

  registerHost(): void {
    this.hasExternalHost.set(true);
  }

  unregisterHost(): void {
    this.hasExternalHost.set(false);
    this.overlayTemplate.set(null);
    this.overlayInjector.set(null);
    this.isOverlayOpen.set(false);
  }

  mountOverlayTemplate(template: TemplateRef<unknown>, injector: Injector): void {
    this.overlayTemplate.set(template);
    this.overlayInjector.set(injector);
  }

  unmountOverlayTemplate(template: TemplateRef<unknown>): void {
    if (this.overlayTemplate() === template) {
      this.overlayTemplate.set(null);
      this.overlayInjector.set(null);
    }
    this.isOverlayOpen.set(false);
  }

  setOverlayOpen(open: boolean): void {
    this.isOverlayOpen.set(open);
  }

  hasViewTransitions(): boolean {
    const doc = this.document as unknown as { startViewTransition?: unknown };
    return typeof doc?.startViewTransition === 'function';
  }

  runViewTransition(
    update: () => void,
    cleanup?: () => void,
    options: ViewTransitionOptions = {}
  ): void {
    const doc = this.document as unknown as {
      startViewTransition?: (cb: () => void) => { finished?: Promise<unknown> };
      documentElement?: HTMLElement;
    };

    if (typeof doc?.startViewTransition === 'function') {
      const rootEl = doc.documentElement;
      const classes = ['vt-running'];
      if (options.rootClass) classes.push(options.rootClass);
      if (options.isExiting) classes.push('vt-exiting');

      rootEl?.classList.add(...classes);
      const transition = doc.startViewTransition(() => {
        update();
        this.appRef.tick();
      });

      const finalize = () => {
        rootEl?.classList.remove(...classes);
        cleanup?.();
        this.appRef.tick();
      };

      if (transition?.finished) {
        transition.finished.finally(finalize);
      } else {
        finalize();
      }
      return;
    }

    update();
    this.appRef.tick();
    cleanup?.();
  }
}

