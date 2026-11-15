import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuardsCheckEnd, provideRouter, Router, ViewTransitionInfo } from '@angular/router';
import { App } from './app';
import { classifyRouteDirection, RouteTransitionCoordinator } from './app.config';
import { routes } from './app.routes';
import { resolveNavChrome } from './shared/models/ui.models';

@Component({ standalone: true, template: '<p>Dummy route</p>' })
class DummyPageComponent {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])]
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Centro de Comando');
  });
});

describe('App Design System Routing & Header Sync', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('redirects /design-system to /design-system/styles and updates the header title', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/design-system');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/design-system/styles');
    expect(compiled.querySelector('h1')?.textContent).toContain('Paso 1: Styles');
    expect(compiled.querySelector('#rail-ds-popover')).toBeTruthy();

    fixture.componentInstance.adaptiveLayout.windowWidth.set(1280);
    fixture.detectChanges();
    expect(compiled.querySelector('#design-system-submenu')?.hasAttribute('inert')).toBe(false);
  });

  it('renders step-specific header title when navigating to /design-system/motion', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/design-system/motion');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Paso 4: Motion & Transitions');
  });
});

describe('M3 Layout Helpers & Route Classification', () => {
  it('resolves canonical M3 chrome modes across breakpoints and overrides', () => {
    expect(resolveNavChrome('auto', 480)).toBe('bar');
    expect(resolveNavChrome('rail', 480)).toBe('bar');
    expect(resolveNavChrome('dock', 480)).toBe('dock');

    expect(resolveNavChrome('auto', 900)).toBe('rail-collapsed');
    expect(resolveNavChrome('auto', 900, true)).toBe('rail-expanded');
    expect(resolveNavChrome('tunnel', 900)).toBe('tunnel');
    expect(resolveNavChrome('dock', 900)).toBe('dock');

    expect(resolveNavChrome('auto', 1280)).toBe('rail-expanded');
    expect(resolveNavChrome('auto', 1280, false)).toBe('rail-collapsed');
  });

  it('classifies route transitions as forward, backward, or top-level', () => {
    expect(classifyRouteDirection('design-system/styles', 'design-system/motion')).toBe('forward');
    expect(classifyRouteDirection('design-system/playbook', 'design-system/foundations')).toBe('backward');
    expect(classifyRouteDirection('overview', 'agenda')).toBe('top-level');
    expect(classifyRouteDirection('design-system/styles', 'overview')).toBe('top-level');
  });
});

describe('App Adaptive Shell & Route Stage Isolation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: 'overview', component: DummyPageComponent, data: { title: 'Dashboard', subtitle: 'Vista' } },
          { path: 'agenda', component: DummyPageComponent, data: { title: 'Agenda', subtitle: 'Tareas' } },
          { path: 'pos', component: DummyPageComponent }
        ])
      ]
    }).compileComponents();
  });

  it('switches flex direction between Compact Bar (<600dp) and Rail (>=600dp) and renders isolated #route-stage', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/overview');
    app.adaptiveLayout.windowWidth.set(480);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const routeStage = compiled.querySelector('main#route-stage') as HTMLElement;
    expect(routeStage).toBeTruthy();
    expect(routeStage.getAttribute('tabindex')).toBe('-1');
    expect(app.stageClasses()).toContain('flex-col');

    app.adaptiveLayout.windowWidth.set(900);
    fixture.detectChanges();
    expect(app.stageClasses()).toContain('flex-row');

    app.dialogService.isDialogOpen.set(true);
    fixture.detectChanges();
    expect((compiled.firstElementChild as HTMLElement).className).toContain('bg-black');
  });

  it('switches between editorial and workbench shell modes and resets #route-stage scroll/focus on subsequent navigations', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/overview');
    fixture.detectChanges();

    expect(app.shellMode()).toBe('editorial');
    expect(app.mainClasses()).toContain('m3-editorial-pane');
    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();

    const routeStage = fixture.nativeElement.querySelector('#route-stage') as HTMLElement;
    routeStage.scrollTop = 120;
    const focusSpy = vi.spyOn(routeStage, 'focus');

    await router.navigateByUrl('/agenda');
    fixture.detectChanges();

    expect(routeStage.scrollTop).toBe(0);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });

    await router.navigateByUrl('/pos');
    fixture.detectChanges();

    expect(app.shellMode()).toBe('workbench');
    expect(app.mainClasses()).toContain('overflow-hidden');
    expect(fixture.nativeElement.querySelector('app-header')).toBeNull();
  });

  it('applies Detached Stage framing, switches tunnel into flex-col focus mode, and toggles Command Palette on Ctrl+K', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);

    app.adaptiveLayout.windowWidth.set(1280);
    await router.navigateByUrl('/overview');
    fixture.detectChanges();

    expect(app.stageClasses()).toContain('bg-surface-low');
    expect(app.stageClasses()).toContain('md:p-2.5');
    expect(app.mainClasses()).toContain('bg-surface');
    expect(app.mainClasses()).toContain('md:rounded-m3-xl');

    app.dialogService.setNavStyle('tunnel');
    fixture.detectChanges();
    expect(app.stageClasses()).toContain('flex-col');
    expect(fixture.nativeElement.querySelector('header[aria-label="Navegación de enfoque"]')).toBeTruthy();

    expect(app.isCommandPaletteOpen()).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }));
    fixture.detectChanges();
    expect(app.isCommandPaletteOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }));
    fixture.detectChanges();
    expect(app.isCommandPaletteOpen()).toBe(false);

    app.dialogService.isDialogOpen.set(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }));
    fixture.detectChanges();
    expect(app.isCommandPaletteOpen()).toBe(false);
  });
});

describe('RouteTransitionCoordinator', () => {
  let originalStartVtDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    const doc = document;
    originalStartVtDescriptor = Object.getOwnPropertyDescriptor(doc, 'startViewTransition');
    Object.defineProperty(doc, 'startViewTransition', {
      value: () => ({
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: () => {}
      }),
      configurable: true
    });

    await TestBed.configureTestingModule({
      providers: [
        RouteTransitionCoordinator,
        provideRouter([
          { path: 'overview', component: DummyPageComponent },
          { path: 'design-system/styles', component: DummyPageComponent },
          { path: 'design-system/motion', component: DummyPageComponent }
        ])
      ]
    }).compileComponents();
  });

  afterEach(() => {
    const doc = document;
    doc.documentElement.classList.remove('vt-route-nav', 'vt-nav-forward', 'vt-nav-backward', 'vt-nav-top-level');
    if (originalStartVtDescriptor) {
      Object.defineProperty(doc, 'startViewTransition', originalStartVtDescriptor);
    } else {
      delete (doc as unknown as { startViewTransition?: unknown }).startViewTransition;
    }
  });

  it('skips route transition classes on initial navigation and applies/cleans directional classes on transition lifecycle', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const router = TestBed.inject(Router);
    const coordinator = TestBed.inject(RouteTransitionCoordinator);
    coordinator.init();

    await router.navigateByUrl('/design-system/styles');
    expect(doc.documentElement.classList.contains('vt-route-nav')).toBe(false);

    let resolveFinished!: () => void;
    const finished = new Promise<void>(resolve => {
      resolveFinished = resolve;
    });
    const types = new Set<string>();

    const transitionInfo = {
      from: { url: [{ path: 'design-system' }, { path: 'styles' }], firstChild: null },
      to: { url: [{ path: 'design-system' }, { path: 'motion' }], firstChild: null },
      transition: { finished, types, skipTransition: vi.fn() }
    } as unknown as ViewTransitionInfo;

    coordinator.onViewTransitionCreated(transitionInfo);

    expect(doc.documentElement.classList.contains('vt-route-nav')).toBe(true);
    expect(doc.documentElement.classList.contains('vt-nav-forward')).toBe(true);
    expect(types.has('route-nav')).toBe(true);
    expect(types.has('forward')).toBe(true);

    resolveFinished();
    await finished;
    await Promise.resolve();

    expect(doc.documentElement.classList.contains('vt-route-nav')).toBe(false);
    expect(doc.documentElement.classList.contains('vt-nav-forward')).toBe(false);
  });

  it('applies vt-route-nav on GuardsCheckEnd for subsequent navigations and cleans up on NavigationEnd when no ViewTransition starts', async () => {
    const doc = TestBed.inject(DOCUMENT);
    const router = TestBed.inject(Router);
    const coordinator = TestBed.inject(RouteTransitionCoordinator);
    coordinator.init();

    await router.navigateByUrl('/overview');

    const seenOnGuardsEnd: boolean[] = [];
    const sub = router.events.subscribe(evt => {
      if (evt instanceof GuardsCheckEnd) {
        seenOnGuardsEnd.push(doc.documentElement.classList.contains('vt-route-nav'));
      }
    });

    await router.navigateByUrl('/design-system/styles');
    sub.unsubscribe();

    expect(seenOnGuardsEnd).toEqual([true]);
    expect(doc.documentElement.classList.contains('vt-route-nav')).toBe(false);
  });
});
