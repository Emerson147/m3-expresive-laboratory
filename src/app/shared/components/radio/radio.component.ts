import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface M3RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

let nextRadioGroupId = 0;

/**
 * Material 3 Radio Group built on native <fieldset> + <input type="radio"> controls
 * to guarantee built-in arrow-key roving navigation and mutual exclusion.
 */
@Component({
  selector: 'm3-radio-group',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => M3RadioGroupComponent),
      multi: true
    }
  ],
  host: {
    class: 'block'
  },
  template: `
    <fieldset
      class="border-0 p-0 m-0"
      [disabled]="isDisabled()"
      [attr.aria-label]="!legend() ? (ariaLabel() || 'Opciones') : null">
      @if (legend()) {
        <legend class="text-xs font-bold text-main uppercase tracking-wider mb-2">
          {{ legend() }}
        </legend>
      }

      <div
        [class]="orientation() === 'horizontal'
          ? 'flex flex-wrap items-start gap-4'
          : 'flex flex-col gap-2.5'">
        @for (option of options(); track option.value; let i = $index) {
          <div
            class="m3-selection-row"
            [class.is-disabled]="isDisabled() || !!option.disabled">
            <span class="m3-selection-target">
              <input
                type="radio"
                class="m3-selection-native-input"
                [id]="optionId(i)"
                [name]="resolvedGroupName()"
                [value]="option.value"
                [checked]="value() === option.value"
                [disabled]="isDisabled() || !!option.disabled"
                [attr.aria-describedby]="option.description ? optionId(i) + '-desc' : null"
                (change)="selectOption(option)"
                (blur)="onTouched()" />

              <span class="m3-selection-halo" aria-hidden="true">
                <span
                  class="m3-radio-outer"
                  [class.is-selected]="value() === option.value">
                  <span class="m3-radio-inner"></span>
                </span>
              </span>
            </span>

            <div class="flex flex-col text-left pl-1" [class.opacity-60]="isDisabled() || !!option.disabled">
              <label
                [attr.for]="optionId(i)"
                class="text-sm font-medium text-main leading-tight"
                [class.cursor-pointer]="!(isDisabled() || option.disabled)"
                [class.cursor-not-allowed]="isDisabled() || !!option.disabled">
                {{ option.label }}
              </label>
              @if (option.description) {
                <span
                  [id]="optionId(i) + '-desc'"
                  class="text-xs text-muted leading-snug mt-0.5">
                  {{ option.description }}
                </span>
              }
            </div>
          </div>
        }
      </div>
    </fieldset>
  `
})
export class M3RadioGroupComponent implements ControlValueAccessor {
  readonly options = input.required<M3RadioOption[]>();
  readonly value = model<string>('');
  readonly legend = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly disabled = input<boolean>(false);

  private readonly seqId = ++nextRadioGroupId;
  private readonly cvaDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly resolvedGroupName = computed(() => this.name() || `m3-radio-group-${this.seqId}`);

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  optionId(index: number): string {
    return `${this.resolvedGroupName()}-opt-${index}`;
  }

  selectOption(option: M3RadioOption): void {
    if (this.isDisabled() || option.disabled) return;
    this.value.set(option.value);
    this.onChange(option.value);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
