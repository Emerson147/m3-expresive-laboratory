import { TestBed } from '@angular/core/testing';
import { AdaptiveLayoutService } from './adaptive-layout.service';

describe('AdaptiveLayoutService', () => {
  let service: AdaptiveLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdaptiveLayoutService);
  });

  it('classifies all 5 official Material 3 Width Breakpoints and layout tokens accurately', () => {
    service.windowWidth.set(375);
    expect(service.windowSizeClass()).toBe('compact');
    expect(service.isCompact()).toBe(true);
    expect(service.marginDp()).toBe(16);
    expect(service.recommendedPanes()).toBe(1);
    expect(service.recommendedNavigation()).toBe('Navigation Bar / Floating Dock');

    service.windowWidth.set(720);
    expect(service.windowSizeClass()).toBe('medium');
    expect(service.isMedium()).toBe(true);
    expect(service.marginDp()).toBe(24);
    expect(service.recommendedPanes()).toBe(2);
    expect(service.recommendedNavigation()).toBe('Navigation Rail');

    service.windowWidth.set(1024);
    expect(service.windowSizeClass()).toBe('expanded');
    expect(service.isExpanded()).toBe(true);
    expect(service.isExpandedOrLarger()).toBe(true);

    service.windowWidth.set(1366);
    expect(service.windowSizeClass()).toBe('large');
    expect(service.isLarge()).toBe(true);
    expect(service.recommendedNavigation()).toBe('Expanded Rail / Persistent Drawer');

    service.windowWidth.set(1680);
    expect(service.windowSizeClass()).toBe('extra-large');
    expect(service.isExtraLarge()).toBe(true);
    expect(service.recommendedPanes()).toBe(3);
  });

  it('classifies all 3 official Material 3 Height Breakpoints', () => {
    service.windowHeight.set(400);
    expect(service.heightSizeClass()).toBe('compact');

    service.windowHeight.set(720);
    expect(service.heightSizeClass()).toBe('medium');

    service.windowHeight.set(960);
    expect(service.heightSizeClass()).toBe('expanded');
  });
});

