import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppSection, NavStyle } from '../models/ui.models';
import { NavigationComponent } from './navigation.component';

@Component({ standalone: true, template: '' })
class DummyRouteComponent {}

describe('NavigationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [
        provideRouter([
          { path: 'overview', component: DummyRouteComponent },
          { path: 'design-system/styles', component: DummyRouteComponent },
          { path: 'design-system/motion', component: DummyRouteComponent }
        ])
      ]
    }).compileComponents();
  });

  function setup(initialSection: AppSection = 'overview', navStyle: NavStyle = 'rail') {
    const fixture = TestBed.createComponent(NavigationComponent);
    fixture.componentRef.setInput('navStyle', navStyle);
    fixture.componentRef.setInput('currentSection', initialSection);
    fixture.componentRef.setInput('pendingCount', 2);
    fixture.componentRef.setInput('isDialogOpen', false);
    fixture.componentRef.setInput('isHeroExpanded', false);
    fixture.detectChanges();
    return { fixture };
  }

  it('keeps the Design System submenu inert and collapsed outside design-system routes', () => {
    const { fixture } = setup('overview', 'rail');
    const trigger = fixture.nativeElement.querySelector('button[aria-controls="design-system-submenu"]') as HTMLButtonElement;
    const submenu = fixture.nativeElement.querySelector('#design-system-submenu') as HTMLElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(submenu.hasAttribute('inert')).toBe(true);
    expect(submenu.querySelectorAll('a').length).toBe(4);
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
});
