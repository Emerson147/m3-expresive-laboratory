import { Component, computed, input, output } from '@angular/core';

export type M3ChipType = 'filter' | 'assist' | 'input' | 'suggestion';

@Component({
  selector: 'm3-chip',
  standalone: true,
  host: {
    class: 'contents'
  },
  template: `
    <div
      [class]="removable() ? compositeClasses() : 'contents'"
      [attr.aria-disabled]="removable() && disabled() ? 'true' : null">
      <button
        type="button"
        [disabled]="disabled()"
        [attr.aria-disabled]="disabled() ? 'true' : null"
        [attr.aria-pressed]="type() === 'filter' ? selected() : null"
        [class]="removable() ? primaryClasses() : computedClasses()"
        (click)="onClick($event)">
        
        <!-- Leading Icon: Checkmark if selected Filter, or custom icon -->
        @if (type() === 'filter' && selected()) {
          <span class="material-symbols-rounded text-base shrink-0 m3-anim-item-in" aria-hidden="true">
            check
          </span>
        } @else if (icon()) {
          <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">
            {{ icon() }}
          </span>
        }

        <!-- Label -->
        <span class="truncate leading-none">
          <ng-content></ng-content>
        </span>

        <!-- Count Badge (e.g. '(3)') -->
        @if (count() !== null) {
          <span class="m3-chip-badge leading-none shrink-0">
            {{ count() }}
          </span>
        }
      </button>

      <!-- Sibling Trailing Remove Button (Input Chips — zero nested interactive elements) -->
      @if (removable()) {
        <button
          type="button"
          [disabled]="disabled()"
          [attr.aria-disabled]="disabled() ? 'true' : null"
          [attr.aria-label]="removeLabel()"
          (click)="onRemove($event)"
          class="m3-chip-remove state-layer focus-ring-m3 touch-target-48">
          <span class="material-symbols-rounded text-base" aria-hidden="true">
            cancel
          </span>
        </button>
      }
    </div>
  `
})
export class M3ChipComponent {
  /** The 4 canonical Material 3 chip types */
  readonly type = input<M3ChipType>('filter');

  /** Active selected state (toggles background and checkmark on filter chips) */
  readonly selected = input<boolean>(false);

  /** Google Material Symbol name */
  readonly icon = input<string | null>(null);

  /** Trailing delete button for input chips */
  readonly removable = input<boolean>(false);

  /** Accessible label for trailing remove button */
  readonly removeLabel = input<string>('Quitar');

  /** Numeric or text counter badge */
  readonly count = input<number | string | null>(null);

  /** Disabled state */
  readonly disabled = input<boolean>(false);

  /** Additional classes */
  readonly customClass = input<string>('');

  /** Emitted on chip click */
  readonly action = output<MouseEvent>();

  /** Emitted when remove icon is clicked */
  readonly remove = output<Event>();

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-chip',
      'state-layer',
      'focus-ring-m3',
      'touch-target-48',
      `m3-chip-${this.type()}`
    ];

    if (this.selected()) {
      classes.push('is-selected');
    }

    if ((this.type() === 'filter' && this.selected()) || this.icon()) {
      classes.push('has-leading');
    }

    if (this.removable()) {
      classes.push('has-trailing');
    }

    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  readonly compositeClasses = computed(() => {
    const classes = [
      'm3-chip',
      'm3-chip-composite',
      `m3-chip-${this.type()}`,
      'has-trailing'
    ];

    if (this.selected()) {
      classes.push('is-selected');
    }
    if ((this.type() === 'filter' && this.selected()) || this.icon()) {
      classes.push('has-leading');
    }
    if (this.disabled()) {
      classes.push('is-disabled');
    }
    if (this.customClass()) {
      classes.push(this.customClass());
    }

    return classes.join(' ');
  });

  readonly primaryClasses = computed(() =>
    'm3-chip-primary state-layer focus-ring-m3 touch-target-48'
  );

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.action.emit(event);
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.remove.emit(event);
    }
  }
}
