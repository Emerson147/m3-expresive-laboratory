import { Component, computed, input, output } from '@angular/core';

export type M3ButtonVariant = 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text';
export type M3ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'm3-button',
  standalone: true,
  host: {
    class: 'contents'
  },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-disabled]="disabled() || loading() ? 'true' : null"
      [attr.aria-label]="ariaLabel() || null"
      [class]="computedClasses()"
      [class.invisible]="invisible()"
      [style.view-transition-name]="viewTransitionName()"
      (click)="onClick($event)">
      
      <!-- Leading Spinner or Icon -->
      @if (loading()) {
        <span 
          class="material-symbols-rounded animate-spin shrink-0"
          [class.text-base]="size() === 'sm'"
          [class.text-lg]="size() === 'md'"
          [class.text-xl]="size() === 'lg'">
          progress_activity
        </span>
      } @else if (icon() && !iconTrailing()) {
        <span 
          class="material-symbols-rounded shrink-0"
          [class.text-base]="size() === 'sm'"
          [class.text-lg]="size() === 'md'"
          [class.text-xl]="size() === 'lg'">
          {{ icon() }}
        </span>
      }

      <!-- Label / Content (Hidden if icon-only) -->
      @if (!iconOnly()) {
        <span class="inline-flex items-center truncate">
          <ng-content></ng-content>
        </span>
      }

      <!-- Trailing Icon -->
      @if (!loading() && icon() && iconTrailing()) {
        <span 
          class="material-symbols-rounded shrink-0"
          [class.text-base]="size() === 'sm'"
          [class.text-lg]="size() === 'md'"
          [class.text-xl]="size() === 'lg'">
          {{ icon() }}
        </span>
      }
    </button>
  `
})
export class M3ButtonComponent {
  /** The 5 canonical Material 3 button variants */
  readonly variant = input<M3ButtonVariant>('filled');

  /** Button size token (sm: 32px, md: 40px, lg: 48px) */
  readonly size = input<M3ButtonSize>('md');

  /** Google Material Symbol name (e.g. 'add', 'check', 'delete') */
  readonly icon = input<string | null>(null);

  /** If true, renders the icon after the label instead of before */
  readonly iconTrailing = input<boolean>(false);

  /** If true, formats as a square/circular icon button */
  readonly iconOnly = input<boolean>(false);

  /** Enables M3 Expressive shape morphing on hover/focus */
  readonly morph = input<boolean>(false);

  /** Standard HTML button type */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /** Disabled state (reduces opacity, strips interaction) */
  readonly disabled = input<boolean>(false);

  /** Replaces leading icon with a spin loader and blocks interaction */
  readonly loading = input<boolean>(false);

  /** Optional accessible label, crucial for icon-only buttons */
  readonly ariaLabel = input<string | null>(null);

  /** When true, hides the button in background during View Transitions */
  readonly invisible = input<boolean>(false);

  /** CSS view-transition-name for Container Transform */
  readonly viewTransitionName = input<string | null>(null);

  /** Extra custom CSS classes */
  readonly customClass = input<string>('');

  /** Emitted when the button is clicked and not disabled */
  readonly action = output<MouseEvent>();

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-btn',
      'state-layer',
      'focus-ring-m3',
      'touch-target-48'
    ];

    // Variant
    classes.push(`m3-btn-${this.variant()}`);

    // Size vs Icon-Only Size
    if (this.iconOnly()) {
      classes.push(`m3-btn-icon-${this.size()}`);
    } else {
      classes.push(`m3-btn-${this.size()}`);
      if (this.icon() && !this.iconTrailing()) {
        classes.push('has-icon-leading');
      }
      if (this.icon() && this.iconTrailing()) {
        classes.push('has-icon-trailing');
      }
    }

    // Expressive Shape Morphing
    if (this.morph()) {
      classes.push('m3-btn-morph');
    }

    // Custom utility overrides
    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.action.emit(event);
  }
}
