import { Component, computed, input, output } from '@angular/core';

export type M3CardVariant = 'elevated' | 'filled' | 'outlined';
export type M3CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type M3CardShape = 'md' | 'lg' | 'xl';
export type M3CardTone = 'default' | 'primary' | 'secondary' | 'tertiary' | 'error';

@Component({
  selector: 'm3-card',
  standalone: true,
  host: {
    'class': 'block',
    '[class]': 'computedClasses()',
    '[style.view-transition-name]': 'viewTransitionName()',
    '[attr.tabindex]': "interactive() && !disabled() ? 0 : null",
    '[attr.role]': "interactive() ? 'button' : null",
    '[attr.aria-disabled]': "interactive() && disabled() ? 'true' : null",
    '(click)': 'onCardClick($event)',
    '(keydown.enter)': 'onCardActivate($event)',
    '(keydown.space)': 'onCardSpaceKeydown($event)',
    '(keyup.space)': 'onCardActivate($event)'
  },
  template: `
    <ng-content></ng-content>
  `
})
export class M3CardComponent {
  /** The 3 canonical Material 3 card variants */
  readonly variant = input<M3CardVariant>('elevated');

  /** When true, activates hover elevation, state layer, and keyboard accessibility */
  readonly interactive = input<boolean>(false);

  /** Internal padding scale (sm: 16px, md: 20px, lg: 24px, xl: 32px) */
  readonly padding = input<M3CardPadding>('md');

  /** Corner radius token */
  readonly shape = input<M3CardShape>('xl');

  /** Semantic theme tone override via M3 component tokens (default adapts automatically to --seed-hue) */
  readonly tone = input<M3CardTone>('default');

  /** Disables interaction on clickable cards using 12% / 38% M3 tokens */
  readonly disabled = input<boolean>(false);

  /** When true, hides the card in background during View Transitions */
  readonly invisible = input<boolean>(false);

  /** CSS view-transition-name for Container Transform */
  readonly viewTransitionName = input<string | null>(null);

  /** Additional custom classes */
  readonly customClass = input<string>('');

  /** Emitted when card is clicked or activated via keyboard */
  readonly action = output<MouseEvent | KeyboardEvent>();

  readonly computedClasses = computed(() => {
    const classes = [
      'block',
      'm3-card',
      `m3-card-${this.variant()}`,
      `m3-card-pad-${this.padding()}`
    ];

    // Shape radius token
    if (this.shape() === 'xl') {
      classes.push('rounded-m3-xl');
    } else if (this.shape() === 'lg') {
      classes.push('rounded-m3-lg');
    } else if (this.shape() === 'md') {
      classes.push('rounded-m3-md');
    }

    // Semantic Tone Override (if non-default)
    if (this.tone() !== 'default') {
      classes.push(`m3-card-tone-${this.tone()}`);
    }

    // Interactivity
    if (this.interactive() && !this.disabled()) {
      classes.push('m3-card-interactive', 'state-layer', 'focus-ring-m3');
    }

    if (this.disabled()) {
      classes.push('is-disabled');
    }

    // View Transitions invisible state
    if (this.invisible()) {
      classes.push('invisible');
    }

    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  onCardClick(event: MouseEvent): void {
    if (this.interactive() && !this.disabled()) {
      this.action.emit(event);
    }
  }

  onCardSpaceKeydown(event: Event): void {
    if (this.interactive() && !this.disabled()) {
      event.preventDefault();
    }
  }

  onCardActivate(event: Event): void {
    if (this.interactive() && !this.disabled()) {
      event.preventDefault();
      this.action.emit(event as KeyboardEvent);
    }
  }
}
