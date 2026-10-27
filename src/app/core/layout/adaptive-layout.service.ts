import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type WindowSizeClass = 'compact' | 'medium' | 'expanded';

@Injectable({
  providedIn: 'root'
})
export class AdaptiveLayoutService {
  private readonly document = inject(DOCUMENT);

  // Default to expanded for SSR safety
  readonly windowWidth = signal<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  /**
   * Official Material 3 Window Size Classes
   * - Compact: < 600dp (Phones, single-column)
   * - Medium: 600dp - 839dp (Tablets, foldables)
   * - Expanded: >= 840dp (Desktop, multi-column)
   */
  readonly windowSizeClass = computed<WindowSizeClass>(() => {
    const width = this.windowWidth();
    if (width < 600) return 'compact';
    if (width < 840) return 'medium';
    return 'expanded';
  });

  readonly isCompact = computed(() => this.windowSizeClass() === 'compact');
  readonly isMedium = computed(() => this.windowSizeClass() === 'medium');
  readonly isExpanded = computed(() => this.windowSizeClass() === 'expanded');

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.windowWidth.set(window.innerWidth);
      }, { passive: true });
    }
  }
}
