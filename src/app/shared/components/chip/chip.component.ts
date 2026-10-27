import { Component, computed, input, output } from '@angular/core';

export type M3ChipType = 'filter' | 'assist' | 'input' | 'suggestion';

@Component({
  selector: 'm3-chip',
  standalone: true,
  host: {
    class: 'contents'
  },
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [attr.aria-pressed]="type() === 'filter' ? selected() : null"
      [class]="computedClasses()"
      (click)="onClick($event)">
      
      <!-- Leading Icon: Checkmark if selected Filter, or custom icon -->
      @if (type() === 'filter' && selected()) {
        <span class="material-symbols-rounded text-base shrink-0 animate-in fade-in zoom-in-75 duration-150">
          check
        </span>
      } @else if (icon()) {
        <span class="material-symbols-rounded text-base shrink-0">
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

      <!-- Trailing Remove Icon (Input Chips) -->
      @if (removable()) {
        <span 
          role="button"
          tabindex="0"
          (click)="onRemove($event)"
          (keydown.enter)="onRemove($event)"
          class="material-symbols-rounded text-base shrink-0 opacity-70 hover:opacity-100 cursor-pointer ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-current/10">
          cancel
        </span>
      }
    </button>
  `
})
export class M3ChipComponent {
  /** The 4 canonical Material 3 chip types */
  readonly type = input<M3ChipType>('filter');

  /** Active selected state (toggles background and checkmark on filter chips) */
  readonly selected = input<boolean>(false);

  /** Google Material Symbol name */
  readonly icon = input<string | null>(null);

  /** Trailing delete icon for input chips */
  readonly removable = input<boolean>(false);

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
