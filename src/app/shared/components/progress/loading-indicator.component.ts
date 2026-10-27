import { Component, computed, input } from '@angular/core';

export type M3LoadingIndicatorSize = 'sm' | 'md' | 'lg';
export type M3LoadingIndicatorColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color';

@Component({
  selector: 'm3-loading-indicator',
  standalone: true,
  host: {
    class: 'inline-flex items-center justify-center'
  },
  template: `
    <div [class]="containerClasses()">
      <div
        role="status"
        [class]="computedClasses()"
        [attr.aria-label]="ariaLabel()">
        
        <svg
          class="m3-loading-shape-svg"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          
          <!-- Morphing Geometric Contour (Pentagon -> Squircle -> Flower -> Circle) -->
          <path
            class="m3-loading-shape-path"
            [attr.d]="pentagonPath">
            <animate
              attributeName="d"
              dur="3.6s"
              repeatCount="indefinite"
              [attr.values]="morphValues()"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              calcMode="spline"
              keySplines="0.2 0 0 1; 0.2 0 0 1; 0.2 0 0 1; 0.2 0 0 1" />
          </path>
        </svg>
      </div>
    </div>
  `
})
export class M3LoadingIndicatorComponent {
  /** Diameter scale: sm (32px), md (48px canonical), lg (64px hero) */
  readonly size = input<M3LoadingIndicatorSize>('md');

  /** Semantic OKLCH color theme */
  readonly color = input<M3LoadingIndicatorColor>('primary');

  /** If true, wraps the indicator in an explicit backing container shape (M3 Contained) */
  readonly contained = input<boolean>(false);

  /** If true, elevates the container into a floating card with shadow (e.g. pull-to-refresh) */
  readonly elevated = input<boolean>(false);

  /** Accessible label */
  readonly ariaLabel = input<string>('Cargando contenido...');

  /** Additional classes */
  readonly customClass = input<string>('');

  // 1. Pentagon (5-point organic rounded polygon - canonical M3 Expressive)
  readonly pentagonPath = 'M 24,5 C 33,5 42,12 39,22 C 37,32 40,40 31,43 C 21,45 11,41 8,33 C 5,24 7,13 14,7 C 17,5 20,5 24,5 Z';

  // 2. Squircle (4-corner continuous squircle)
  readonly squirclePath = 'M 24,6 C 36,6 42,12 42,24 C 42,36 36,42 24,42 C 12,42 6,36 6,24 C 6,12 12,6 24,6 Z';

  // 3. 4-Petal Flower (clover organic shape)
  readonly flowerPath = 'M 24,7 C 31,3 41,13 37,21 C 45,27 37,39 29,37 C 23,45 11,39 15,31 C 5,23 13,11 21,15 C 22,10 23,7 24,7 Z';

  // 4. Circle
  readonly circlePath = 'M 24,6 C 33.94,6 42,14.06 42,24 C 42,33.94 33.94,42 24,42 C 14.06,42 6,33.94 6,24 C 6,14.06 14.06,6 24,6 Z';

  readonly morphValues = computed(() => {
    return `${this.pentagonPath}; ${this.squirclePath}; ${this.flowerPath}; ${this.circlePath}; ${this.pentagonPath}`;
  });

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-loading-indicator',
      `m3-loading-indicator-${this.size()}`,
      `m3-progress-${this.color()}`
    ];

    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  readonly containerClasses = computed(() => {
    if (!this.contained() && !this.elevated()) {
      return 'contents';
    }
    const classes = ['m3-loading-container', `m3-progress-${this.color()}`];
    if (this.elevated()) {
      classes.push('m3-loading-container-elevated');
    }
    return classes.join(' ');
  });
}
