import { Component, computed, forwardRef, input, model, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextSwitchId = 0;

@Component({
  selector: 'm3-switch',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => M3SwitchComponent),
      multi: true
    }
  ],
  host: {
    class: 'inline-block'
  },
  template: `
    <div [class]="wrapperClasses()">
      <button
        type="button"
        role="switch"
        [id]="actualId()"
        [disabled]="disabled()"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="!label() ? (ariaLabel() || 'Toggle') : null"
        [attr.aria-labelledby]="label() ? actualId() + '-label' : null"
        [class]="switchClasses()"
        (click)="toggle()">
        <span class="m3-switch-thumb" aria-hidden="true">
          @if (withIcons()) {
            <span class="material-symbols-rounded text-[14px] leading-none">
              {{ checked() ? 'check' : 'close' }}
            </span>
          }
        </span>
      </button>

      @if (label() || description()) {
        <label
          [id]="actualId() + '-label'"
          [attr.for]="actualId()"
          class="flex flex-col text-left cursor-pointer"
          [class.opacity-60]="disabled()">
          @if (label()) {
            <span class="text-sm font-medium text-main leading-tight">{{ label() }}</span>
          }
          @if (description()) {
            <span class="text-xs text-muted leading-snug mt-0.5">{{ description() }}</span>
          }
        </label>
      }
    </div>
  `
})
export class M3SwitchComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly label = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly withIcons = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly customId = input<string | null>(null);

  readonly changed = output<boolean>();

  private readonly generatedId = `m3-switch-${++nextSwitchId}`;
  readonly actualId = computed(() => this.customId() || this.generatedId);

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  readonly wrapperClasses = computed(() =>
    this.disabled() ? 'm3-switch-wrapper is-disabled' : 'm3-switch-wrapper'
  );

  readonly switchClasses = computed(() => {
    const classes = ['m3-switch', 'state-layer', 'focus-ring-m3', 'touch-target-48'];
    if (this.checked()) classes.push('is-checked');
    if (this.withIcons()) classes.push('has-icon');
    return classes.join(' ');
  });

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
    this.changed.emit(next);
  }

  writeValue(value: boolean | null): void {
    this.checked.set(Boolean(value));
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}

