import { Component, computed, input, output } from '@angular/core';

export type M3FabSize = 'sm' | 'md' | 'lg';
export type M3FabVariant = 'primary' | 'secondary' | 'tertiary' | 'surface';

@Component({
  selector: 'm3-fab',
  standalone: true,
  host: {
    class: 'inline-block'
  },
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [attr.aria-label]="!label() ? (ariaLabel() || icon()) : null"
      [class]="computedClasses()"
      (click)="onClick($event)">
      <span
        class="material-symbols-rounded shrink-0"
        [class.text-xl]="size() === 'sm'"
        [class.text-2xl]="size() === 'md'"
        [class.text-4xl]="size() === 'lg'"
        aria-hidden="true">
        {{ icon() }}
      </span>
      @if (label()) {
        <span class="tracking-tight">{{ label() }}</span>
      }
    </button>
  `
})
export class M3FabComponent {
  readonly icon = input<string>('add');
  readonly label = input<string | null>(null);
  readonly size = input<M3FabSize>('md');
  readonly variant = input<M3FabVariant>('primary');
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);
  readonly customClass = input<string>('');

  readonly action = output<MouseEvent>();

  readonly computedClasses = computed(() => {
    const classes = [
      'm3-fab',
      'state-layer',
      'focus-ring-m3',
      'touch-target-48',
      `m3-fab-${this.variant()}`,
      this.label() ? 'm3-fab-extended' : `m3-fab-${this.size()}`
    ];

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
}

