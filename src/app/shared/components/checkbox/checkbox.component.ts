import {
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextCheckboxId = 0;

/**
 * Material 3 Checkbox built over a native <input type="checkbox"> for full keyboard,
 * form submission, screen reader mixed/checked semantics, and 48x48dp touch target support.
 */
@Component({
  selector: 'm3-checkbox',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => M3CheckboxComponent),
      multi: true
    }
  ],
  host: {
    class: 'inline-block'
  },
  template: `
    <div
      class="m3-selection-row"
      [class.is-disabled]="isDisabled()"
      [class.is-error]="error()">
      <span class="m3-selection-target">
        <input
          #nativeInput
          type="checkbox"
          class="m3-selection-native-input"
          [id]="actualId()"
          [name]="name() || null"
          [checked]="checked()"
          [disabled]="isDisabled()"
          [required]="required()"
          [class.is-checked-visual]="checked() || indeterminate()"
          [attr.aria-label]="!label() ? (ariaLabel() || 'Checkbox') : null"
          [attr.aria-describedby]="description() ? actualId() + '-desc' : null"
          [attr.aria-invalid]="error() ? 'true' : null"
          (change)="onNativeChange($event)"
          (blur)="onNativeBlur()" />

        <span class="m3-selection-halo" aria-hidden="true">
          <span
            class="m3-checkbox-box"
            [class.is-checked]="checked() && !indeterminate()"
            [class.is-indeterminate]="indeterminate()">
            @if (indeterminate()) {
              <svg class="m3-checkbox-svg" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3 7H11" />
              </svg>
            } @else if (checked()) {
              <svg class="m3-checkbox-svg" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M2.75 7.25L5.75 10.25L11.25 3.75" />
              </svg>
            }
          </span>
        </span>
      </span>

      @if (label() || description()) {
        <div class="flex flex-col text-left pl-1" [class.opacity-60]="isDisabled()">
          @if (label()) {
            <label
              [attr.for]="actualId()"
              class="text-sm font-medium text-main leading-tight"
              [class.text-error]="error()"
              [class.cursor-pointer]="!isDisabled()"
              [class.cursor-not-allowed]="isDisabled()">
              {{ label() }}
            </label>
          }
          @if (description()) {
            <span
              [id]="actualId() + '-desc'"
              class="text-xs leading-snug mt-0.5"
              [class.text-muted]="!error()"
              [class.text-error]="error()">
              {{ description() }}
            </span>
          }
        </div>
      }
    </div>
  `
})
export class M3CheckboxComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly indeterminate = model<boolean>(false);
  readonly label = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly customId = input<string | null>(null);

  readonly changed = output<boolean>();

  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');
  private readonly generatedId = `m3-checkbox-${++nextCheckboxId}`;
  private readonly cvaDisabled = signal(false);

  readonly actualId = computed(() => this.customId() || this.generatedId);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const inputEl = this.nativeInput()?.nativeElement;
      if (inputEl) {
        inputEl.indeterminate = this.indeterminate();
      }
    });
  }

  onNativeChange(event: Event): void {
    if (this.isDisabled()) return;
    const inputEl = event.target as HTMLInputElement;
    if (this.indeterminate()) {
      this.indeterminate.set(false);
    }
    this.checked.set(inputEl.checked);
    this.onChange(inputEl.checked);
    this.onTouched();
    this.changed.emit(inputEl.checked);
  }

  onNativeBlur(): void {
    this.onTouched();
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

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
