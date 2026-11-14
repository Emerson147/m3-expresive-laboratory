import { Component, computed, input, model, output } from '@angular/core';
import { M3CircularProgressComponent } from '../progress/circular-progress.component';

export type M3ButtonVariant = 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text';
export type M3ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'm3-button',
  standalone: true,
  imports: [M3CircularProgressComponent],
  host: {
    class: 'contents'
  },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-disabled]="disabled() || loading() ? 'true' : null"
      [attr.aria-pressed]="toggle() ? selected() : null"
      [attr.aria-label]="ariaLabel() || null"
      [class]="computedClasses()"
      [class.invisible]="invisible()"
      [style.view-transition-name]="viewTransitionName()"
      (click)="onClick($event)">
      
      <!-- M3 Guideline: compact flat circular progress inside button, no track, inheriting button contrast color -->
      @if (loading()) {
        <m3-circular-progress
          class="shrink-0"
          [value]="null"
          [wavy]="false"
          [showTrack]="false"
          color="inherit"
          [diameter]="loadingDiameter()"
          ariaLabel="Procesando..." />
      } @else if (icon() && !iconTrailing()) {
        <span 
          class="material-symbols-rounded shrink-0"
          [class.text-sm]="size() === 'xs'"
          [class.text-base]="size() === 'sm'"
          [class.text-lg]="size() === 'md'"
          [class.text-xl]="size() === 'lg'"
          [class.text-2xl]="size() === 'xl'">
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
          [class.text-sm]="size() === 'xs'"
          [class.text-base]="size() === 'sm'"
          [class.text-lg]="size() === 'md'"
          [class.text-xl]="size() === 'lg'"
          [class.text-2xl]="size() === 'xl'">
          {{ icon() }}
        </span>
      }
    </button>
  `
})
export class M3ButtonComponent {
  /** The 5 canonical Material 3 button variants */
  readonly variant = input<M3ButtonVariant>('filled');

  /** Button size token (xs: 28px, sm: 32px, md: 40px, lg: 48px, xl: 56px) */
  readonly size = input<M3ButtonSize>('md');

  /** Enables M3 Expressive toggle mode (exposes aria-pressed and morphs pill <-> square) */
  readonly toggle = input<boolean>(false);

  /** Two-way or reactive selected state for toggle buttons */
  readonly selected = model<boolean>(false);

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

  /** Custom class string */
  readonly customClass = input<string>('');

  readonly loadingDiameter = computed(() => {
    switch (this.size()) {
      case 'xs':
      case 'sm':
        return 18;
      case 'lg':
        return 22;
      case 'xl':
        return 24;
      case 'md':
      default:
        return 20;
    }
  });

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

    // M3 Expressive Toggle Mode
    if (this.toggle()) {
      classes.push('m3-btn-toggle');
      if (this.selected()) {
        classes.push('is-selected');
      }
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
    if (this.toggle()) {
      this.selected.update((v) => !v);
    }
    this.action.emit(event);
  }
}
