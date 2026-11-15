import { DOCUMENT } from '@angular/common';
import {
  ApplicationConfig,
  DestroyRef,
  inject,
  Injectable,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer
} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  GuardsCheckEnd,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  PreloadAllModules,
  provideRouter,
  Router,
  ViewTransitionInfo,
  withPreloading,
  withViewTransitions
} from '@angular/router';
import { routes } from './app.routes';
import { DESIGN_SYSTEM_STEPS } from './shared/models/ui.models';

export type RouteTransitionDirection = 'forward' | 'backward' | 'top-level';

const ROUTE_VT_CLASSES = ['vt-route-nav', 'vt-nav-forward', 'vt-nav-backward', 'vt-nav-top-level'] as const;

const cleanPath = (url: string): string => url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');

const snapshotPath = (snapshot: ActivatedRouteSnapshot): string => {
  const segments: string[] = [];
  for (let current: ActivatedRouteSnapshot | null = snapshot.root ?? snapshot; current; current = current.firstChild) {
    for (const seg of current.url) {
      if (seg.path) segments.push(seg.path);
    }
  }
  return segments.join('/');
};

export function classifyRouteDirection(fromUrl: string, toUrl: string): RouteTransitionDirection {
  const fromStep = DESIGN_SYSTEM_STEPS.findIndex(s => cleanPath(fromUrl) === `design-system/${s.path}`);
  const toStep = DESIGN_SYSTEM_STEPS.findIndex(s => cleanPath(toUrl) === `design-system/${s.path}`);
  return fromStep !== -1 && toStep !== -1 ? (toStep > fromStep ? 'forward' : 'backward') : 'top-level';
}

/** Coordinates `#route-stage` View Transitions so Navigation Chrome stays pinned while content swaps. */
@Injectable()
export class RouteTransitionCoordinator {
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private booted = false;
  private preparedNavId: number | null = null;
  private transitionActive = false;

  init(): void {
    const rootEl = this.doc.documentElement;
    const sub = this.router.events.subscribe(event => {
      if (!rootEl) return;

      if (event instanceof GuardsCheckEnd) {
        if (!event.shouldActivate || !this.booted || !this.canTransition()) return;
        const from = cleanPath(this.router.url);
        const to = cleanPath(event.urlAfterRedirects);
        if (from === to) {
          this.reset(rootEl);
          return;
        }
        this.preparedNavId = event.id;
        this.transitionActive = false;
        this.mark(rootEl, classifyRouteDirection(from, to));
        return;
      }

      if (event instanceof NavigationEnd) {
        this.booted = true;
        if (this.preparedNavId === event.id) {
          if (!this.transitionActive) rootEl.classList.remove(...ROUTE_VT_CLASSES);
          this.preparedNavId = null;
        }
        return;
      }

      if (
        (event instanceof NavigationCancel || event instanceof NavigationError || event instanceof NavigationSkipped) &&
        this.preparedNavId === event.id
      ) {
        this.reset(rootEl);
      }
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      rootEl?.classList.remove(...ROUTE_VT_CLASSES);
    });
  }

  onViewTransitionCreated(info: ViewTransitionInfo): void {
    const rootEl = this.doc.documentElement;
    if (!rootEl) return;

    const from = snapshotPath(info.from);
    const to = snapshotPath(info.to);
    if (from === to) {
      this.reset(rootEl);
      info.transition.skipTransition?.();
      return;
    }

    const direction = classifyRouteDirection(from, to);
    this.transitionActive = true;
    if (this.canTransition()) {
      this.mark(rootEl, direction);
      const vt = info.transition as ViewTransition & { types?: Set<string> };
      vt.types?.add('route-nav');
      vt.types?.add(direction);
    }

    info.transition.finished
      ?.finally(() => {
        this.transitionActive = false;
        rootEl.classList.remove(...ROUTE_VT_CLASSES);
      })
      .catch(() => {});
  }

  private canTransition(): boolean {
    const hasApi = typeof (this.doc as unknown as { startViewTransition?: unknown }).startViewTransition === 'function';
    return hasApi && !this.doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  }

  private mark(rootEl: HTMLElement, direction: RouteTransitionDirection): void {
    rootEl.classList.remove(...ROUTE_VT_CLASSES);
    rootEl.classList.add('vt-route-nav', `vt-nav-${direction}`);
  }

  private reset(rootEl: HTMLElement): void {
    this.preparedNavId = null;
    this.transitionActive = false;
    rootEl.classList.remove(...ROUTE_VT_CLASSES);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    RouteTransitionCoordinator,
    provideEnvironmentInitializer(() => inject(RouteTransitionCoordinator).init()),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: info => inject(RouteTransitionCoordinator).onViewTransitionCreated(info)
      })
    )
  ]
};
