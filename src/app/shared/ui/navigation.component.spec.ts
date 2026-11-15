import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { AppSection, NavStyle } from '../models/ui.models';
import { NavigationComponent } from './navigation.component';

@Component({ standalone: true, template: '' })
class DummyRouteComponent {}

describe('NavigationComponent', () => {
  let adaptiveLayout: AdaptiveLayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [
        provideRouter([
          { path: 'overview', component: DummyRouteComponent },
          { path: 'agenda', component: DummyRouteComponent },
          { path: 'design-system/styles', component: DummyRouteComponent },
          { path: 'design-system/motion', component: DummyRouteComponent },
          { path: 'pos', component: DummyRouteComponent }
        ])
      ]
    }).compileComponents();

    adaptiveLayout = TestBed.inject(AdaptiveLayoutService);
    adaptiveLayout.windowWidth.set(1280);
  });

  function setup(
    initialSection: AppSection = 'overview',
    navStyle: NavStyle = 'rail',
    options: { isDialogOpen?: boolean; viewportWidth?: number } = {}
  ) {
    if (options.viewportWidth !== undefined) {
      adaptiveLayout.windowWidth.set(options.viewportWidth);
    }

    const fixture = TestBed.createComponent(NavigationComponent);
    fixture.componentRef.setInput('navStyle', navStyle);
    fixture.componentRef.setInput('currentSection', initialSection);
    fixture.componentRef.setInput('pendingCount', 2);
    fixture.componentRef.setInput('isDialogOpen', options.isDialogOpen ?? false);
    fixture.detectChanges();
    return { fixture };
  }

  it('keeps the Design System submenu inert and collapsed outside design-system routes', () => {
    const { fixture } = setup('overview', 'rail');
    const trigger = fixture.nativeElement.querySelector('button[aria-controls="design-system-submenu"]') as HTMLButtonElement;
    const submenu = fixture.nativeElement.querySelector('#design-system-submenu') as HTMLElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(submenu.hasAttribute('inert')).toBe(true);
    expect(submenu.querySelectorAll('a').length).toBe(5);
  });

  it('auto-expands the Design System submenu when currentSection is design-system and toggles cleanly', () => {
    const { fixture } = setup('design-system', 'rail');
    const trigger = fixture.nativeElement.querySelector('button[aria-controls="design-system-submenu"]') as HTMLButtonElement;
    const submenu = fixture.nativeElement.querySelector('#design-system-submenu') as HTMLElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(submenu.hasAttribute('inert')).toBe(false);

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(submenu.hasAttribute('inert')).toBe(true);
  });

  it('navigates to /design-system/styles when clicking Design System from another section', () => {
    const { fixture } = setup('overview', 'rail');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const trigger = fixture.nativeElement.querySelector('button[aria-controls="design-system-submenu"]') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/design-system/styles']);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders Compact Bottom Bar with 4 primary destinations on viewports < 600dp in auto mode', () => {
    const { fixture } = setup('overview', 'auto', { viewportWidth: 480 });
    const compiled = fixture.nativeElement as HTMLElement;

    const bar = compiled.querySelector('nav[aria-label="Barra de navegación compacta"]');
    expect(bar).toBeTruthy();
    expect(bar?.classList.contains('order-last')).toBe(true);
    expect(bar?.querySelectorAll('a').length).toBe(4);
    expect(compiled.querySelector('aside[aria-label="Navegación principal"]')).toBeNull();
  });

  it('opens Compact More popover on click and closes it on Escape', () => {
    const { fixture } = setup('overview', 'auto', { viewportWidth: 480 });
    const compiled = fixture.nativeElement as HTMLElement;
    const moreBtn = compiled.querySelector('button[aria-controls="compact-more-popover"]') as HTMLButtonElement;
    const popover = compiled.querySelector('#compact-more-popover') as HTMLElement;

    expect(popover).toBeTruthy();
    expect(popover.getAttribute('popover')).toBe('auto');
    expect(moreBtn.getAttribute('aria-expanded')).toBe('false');

    moreBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.openPopover()).toBe('compact-more');
    expect(moreBtn.getAttribute('aria-expanded')).toBe('true');
    if (!fixture.componentInstance.supportsNativePopover) {
      expect(popover.classList.contains('is-fallback-open')).toBe(true);
    }

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    if (!fixture.componentInstance.supportsNativePopover) {
      expect(fixture.componentInstance.openPopover()).toBeNull();
      expect(popover.classList.contains('is-fallback-open')).toBe(false);
      expect(moreBtn.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('renders Collapsed Rail (w-20) on 600-1199dp and toggles manually to Expanded Rail (w-64)', () => {
    const { fixture } = setup('overview', 'auto', { viewportWidth: 900 });
    const compiled = fixture.nativeElement as HTMLElement;

    const aside = compiled.querySelector('aside[aria-label="Navegación principal"]') as HTMLElement;
    expect(aside).toBeTruthy();
    expect(aside.classList.contains('w-20')).toBe(true);

    const expandBtn = compiled.querySelector('button[aria-label="Expandir barra de navegación"]') as HTMLButtonElement;
    expect(expandBtn.getAttribute('aria-expanded')).toBe('false');

    expandBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.manualRailExpanded()).toBe(true);
    expect(aside.classList.contains('w-64')).toBe(true);
    const collapseBtn = compiled.querySelector('button[aria-label="Colapsar barra de navegación"]') as HTMLButtonElement;
    expect(collapseBtn.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders Expanded Rail (w-64) automatically on >= 1200dp viewports', () => {
    const { fixture } = setup('overview', 'auto', { viewportWidth: 1280 });
    const aside = fixture.nativeElement.querySelector('aside[aria-label="Navegación principal"]') as HTMLElement;

    expect(aside).toBeTruthy();
    expect(aside.classList.contains('w-64')).toBe(true);
  });

  it('renders grouped rail sections (Núcleo / Operación), avoids title tooltips, and emits openCommandPalette', () => {
    const { fixture } = setup('overview', 'rail', { viewportWidth: 1280 });
    const compiled = fixture.nativeElement as HTMLElement;
    const aside = compiled.querySelector('aside[aria-label="Navegación principal"]') as HTMLElement;

    expect(aside.textContent).toContain('Núcleo');
    expect(aside.textContent).toContain('Operación');
    expect(aside.querySelector('[title]')).toBeNull();

    const emitSpy = vi.spyOn(fixture.componentInstance.openCommandPalette, 'emit');
    const searchBtn = aside.querySelector('button[aria-label="Buscar módulo o comando (Ctrl+K)"]') as HTMLButtonElement;
    searchBtn.click();
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('opens collapsed rail Design System flyout popover with all 5 steps', () => {
    const { fixture } = setup('overview', 'auto', { viewportWidth: 900 });
    const compiled = fixture.nativeElement as HTMLElement;
    const dsTrigger = compiled.querySelector('button[aria-controls="rail-ds-popover"]') as HTMLButtonElement;
    const dsPopover = compiled.querySelector('#rail-ds-popover') as HTMLElement;

    expect(dsTrigger).toBeTruthy();
    expect(dsPopover).toBeTruthy();
    expect(dsPopover.querySelectorAll('a').length).toBe(5);

    dsTrigger.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.openPopover()).toBe('rail-ds');
    expect(dsTrigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders modern Tunnel Top Focus Bar with module switcher, command trigger, and exitTunnel action', () => {
    const { fixture } = setup('clinic', 'tunnel', { viewportWidth: 1280 });
    const compiled = fixture.nativeElement as HTMLElement;
    const focusHeader = compiled.querySelector('header[aria-label="Navegación de enfoque"]') as HTMLElement;

    expect(focusHeader).toBeTruthy();
    expect(compiled.querySelector('aside[aria-label="Navegación principal"]')).toBeNull();

    const switcherBtn = focusHeader.querySelector('button[aria-controls="tunnel-nav-popover"]') as HTMLButtonElement;
    const switcherPopover = focusHeader.querySelector('#tunnel-nav-popover') as HTMLElement;
    expect(switcherPopover).toBeTruthy();

    switcherBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.openPopover()).toBe('tunnel-switcher');

    const exitSpy = vi.spyOn(fixture.componentInstance.exitTunnel, 'emit');
    const exitBtn = focusHeader.querySelector('button[aria-label="Volver a navegación estándar"]') as HTMLButtonElement;
    exitBtn.click();
    expect(exitSpy).toHaveBeenCalledTimes(1);

    const cmdSpy = vi.spyOn(fixture.componentInstance.openCommandPalette, 'emit');
    const cmdBtn = focusHeader.querySelector('button[aria-label="Abrir paleta de comandos (Ctrl+K)"]') as HTMLButtonElement;
    cmdBtn.click();
    expect(cmdSpy).toHaveBeenCalledTimes(1);
  });

  it('bounds Curated Dock overflow safely, toggles dock-more-popover, and never applies stage-recessed class', () => {
    const { fixture } = setup('overview', 'dock', {
      viewportWidth: 480,
      isDialogOpen: true
    });
    const compiled = fixture.nativeElement as HTMLElement;
    const dock = compiled.querySelector('nav[aria-label="Dock de navegación flotante"]') as HTMLElement;

    expect(dock).toBeTruthy();
    expect(dock.className).toContain('max-w-[calc(100vw-2rem)]');
    expect(dock.classList.contains('overflow-x-auto')).toBe(true);
    expect(dock.classList.contains('stage-recessed')).toBe(false);
    expect(dock.querySelectorAll('a').length).toBe(5);

    const moreTrigger = dock.querySelector('button[aria-controls="dock-more-popover"]') as HTMLButtonElement;
    const dockPopover = compiled.querySelector('#dock-more-popover') as HTMLElement;
    expect(dockPopover).toBeTruthy();

    moreTrigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.openPopover()).toBe('dock-more');
  });
});
