import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

/** Official Material 3 Width Breakpoints (formerly Window Size Classes). */
export type WindowSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large';

/** Official Material 3 Height Breakpoints. */
export type WindowHeightClass = 'compact' | 'medium' | 'expanded';

/** Classifies a pixel width into Google Material 3's 5 canonical Width Breakpoints. */
export function classifyWindowWidth(widthPx: number): WindowSizeClass {
  if (widthPx < 600) return 'compact';
  if (widthPx < 840) return 'medium';
  if (widthPx < 1200) return 'expanded';
  if (widthPx < 1600) return 'large';
  return 'extra-large';
}

@Injectable({
  providedIn: 'root'
})
export class AdaptiveLayoutService {
  private readonly destroyRef = inject(DestroyRef);

  // Default to desktop standard width/height for SSR safety
  readonly windowWidth = signal<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  readonly windowHeight = signal<number>(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  /**
   * Official Material 3 Width Breakpoints (`m3.material.io/foundations/layout/applying-layout/window-size-classes`):
   * - Compact: < 600dp (Portrait phones, 1 pane, Bottom Bar / Dock)
   * - Medium: 600dp – 839dp (Portrait tablets / foldables, 1–2 panes, Navigation Rail)
   * - Expanded: 840dp – 1199dp (Landscape tablets / compact desktop, 2 panes, Rail / Drawer)
   * - Large: 1200dp – 1599dp (Desktops & laptops, 2 panes, Expanded Rail / Drawer)
   * - Extra-Large: >= 1600dp (Ultrawide monitors, 2–3 panes, Persistent Drawer)
   */
  readonly windowSizeClass = computed<WindowSizeClass>(() => classifyWindowWidth(this.windowWidth()));

  /**
   * Official Material 3 Height Breakpoints:
   * - Compact: < 480dp (Phones in landscape)
   * - Medium: 480dp – 899dp (Tablets landscape / phones portrait)
   * - Expanded: >= 900dp (Portrait tablets / tall desktop windows)
   */
  readonly heightSizeClass = computed<WindowHeightClass>(() => {
    const height = this.windowHeight();
    if (height < 480) return 'compact';
    if (height < 900) return 'medium';
    return 'expanded';
  });

  readonly isCompact = computed(() => this.windowSizeClass() === 'compact');
  readonly isMedium = computed(() => this.windowSizeClass() === 'medium');
  readonly isExpanded = computed(() => this.windowSizeClass() === 'expanded');
  readonly isLarge = computed(() => this.windowSizeClass() === 'large');
  readonly isExtraLarge = computed(() => this.windowSizeClass() === 'extra-large');
  readonly isExpandedOrLarger = computed(() => this.windowWidth() >= 840);

  /** Canonical layout outer margin (16dp Compact, 24dp Medium and larger). */
  readonly marginDp = computed<16 | 24>(() => (this.isCompact() ? 16 : 24));

  /** Canonical inter-pane spacer / gutter (16dp Compact, 24dp Medium+). */
  readonly spacerDp = computed<16 | 24>(() => (this.isCompact() ? 16 : 24));

  /** Maximum simultaneous panes recommended for the active width breakpoint. */
  readonly recommendedPanes = computed<1 | 2 | 3>(() => {
    const size = this.windowSizeClass();
    if (size === 'compact') return 1;
    if (size === 'extra-large') return 3;
    return 2;
  });

  /** Recommended structural navigation chrome for the active width breakpoint. */
  readonly recommendedNavigation = computed<string>(() => {
    const size = this.windowSizeClass();
    if (size === 'compact') return 'Navigation Bar / Floating Dock';
    if (size === 'medium' || size === 'expanded') return 'Navigation Rail';
    return 'Expanded Rail / Persistent Drawer';
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const onResize = () => {
        this.windowWidth.set(window.innerWidth);
        this.windowHeight.set(window.innerHeight);
      };
      window.addEventListener('resize', onResize, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
    }
  }
}
