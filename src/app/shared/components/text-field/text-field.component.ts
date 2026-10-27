import { 
  Component, 
  computed, 
  forwardRef, 
  input, 
  model, 
  output, 
  signal 
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type M3TextFieldVariant = 'filled' | 'outlined';

let nextUniqueId = 0;

@Component({
  selector: 'm3-text-field',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => M3TextFieldComponent),
      multi: true
    }
  ],
  host: {
    'class': 'block w-full',
    '[class.is-disabled]': 'disabled()'
  },
  template: `
    <div [class]="rootClasses()">
      <div class="m3-text-field-container">
        
        <!-- Leading Icon -->
        @if (icon()) {
          <span class="material-symbols-rounded m3-text-field-leading shrink-0">
            {{ icon() }}
          </span>
        }

        <!-- Main Input & Label Content Area -->
        <div class="m3-text-field-content">
          @if (label()) {
            <label 
              [attr.for]="actualId()" 
              class="m3-text-field-label">
              {{ label() }}
            </label>
          }

          @if (!multiline()) {
            <input
              [id]="actualId()"
              [type]="type()"
              [value]="value()"
              [disabled]="disabled()"
              [attr.placeholder]="isFloated() ? placeholder() : ''"
              [attr.maxlength]="maxlength() || null"
              [attr.aria-invalid]="effectiveError() ? 'true' : null"
              [attr.aria-describedby]="hasSupportingText() ? actualId() + '-support' : null"
              class="m3-text-field-input"
              (input)="onInput($event)"
              (focus)="onFocus($event)"
              (blur)="onBlur($event)" />
          } @else {
            <textarea
              [id]="actualId()"
              [rows]="rows()"
              [value]="value()"
              [disabled]="disabled()"
              [attr.placeholder]="isFloated() ? placeholder() : ''"
              [attr.maxlength]="maxlength() || null"
              [attr.aria-invalid]="effectiveError() ? 'true' : null"
              [attr.aria-describedby]="hasSupportingText() ? actualId() + '-support' : null"
              class="m3-text-field-input"
              (input)="onInput($event)"
              (focus)="onFocus($event)"
              (blur)="onBlur($event)"></textarea>
          }
        </div>

        <!-- Trailing Slot: Error Icon, Clear Button, or Custom Icon -->
        @if (hasTrailing()) {
          <div class="m3-text-field-trailing">
            @if (effectiveError()) {
              <span class="material-symbols-rounded text-error">
                error
              </span>
            } @else if (clearable() && value() && !disabled()) {
              <button 
                type="button" 
                aria-label="Limpiar campo"
                (click)="onClear($event)">
                <span class="material-symbols-rounded text-base">
                  cancel
                </span>
              </button>
            } @else if (trailingIcon()) {
              <span class="material-symbols-rounded text-base">
                {{ trailingIcon() }}
              </span>
            }
          </div>
        }
      </div>

      <!-- Supporting Text / Error Message & Counter -->
      @if (hasSupportingText() || counterText()) {
        <div [id]="actualId() + '-support'" class="m3-text-field-supporting">
          <span class="m3-text-field-helper">
            {{ effectiveError() ? (errorText() || supportingText()) : supportingText() }}
          </span>

          @if (counterText()) {
            <span class="m3-text-field-counter">
              {{ counterText() }}
            </span>
          }
        </div>
      }
    </div>
  `
})
export class M3TextFieldComponent implements ControlValueAccessor {
  /** The 2 canonical Material 3 variants: 'filled' | 'outlined' */
  readonly variant = input<M3TextFieldVariant>('filled');

  /** Floating label text */
  readonly label = input<string>('');

  /** Input placeholder shown when floated or focused */
  readonly placeholder = input<string>('');

  /** HTML input type: 'text', 'password', 'email', 'number', etc. */
  readonly type = input<string>('text');

  /** Leading Material Symbol icon */
  readonly icon = input<string | null>(null);

  /** Trailing Material Symbol icon */
  readonly trailingIcon = input<string | null>(null);

  /** Displays a clear button when text is present */
  readonly clearable = input<boolean>(false);

  /** Helper supporting text below the field */
  readonly supportingText = input<string | null>(null);

  /** Error text; setting this automatically triggers the error state */
  readonly errorText = input<string | null>(null);

  /** Explicit error state override */
  readonly isError = input<boolean>(false);

  /** Disabled state */
  readonly disabled = input<boolean>(false);

  /** Whether to render a multiline <textarea> */
  readonly multiline = input<boolean>(false);

  /** Number of rows when multiline is true */
  readonly rows = input<number>(3);

  /** Maximum character limit (renders character counter if set) */
  readonly maxlength = input<number | null>(null);

  /** Optional HTML ID */
  readonly id = input<string>('');

  /** Two-way value binding model */
  readonly value = model<string>('');

  /** Output events */
  readonly clear = output<void>();
  readonly inputFocus = output<FocusEvent>();
  readonly inputBlur = output<FocusEvent>();

  /** Internal state */
  readonly isFocused = signal<boolean>(false);
  private readonly internalId = `m3-input-${++nextUniqueId}`;

  // ControlValueAccessor callbacks
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly actualId = computed(() => this.id() || this.internalId);

  readonly effectiveError = computed(() => this.isError() || !!this.errorText());

  readonly isFloated = computed(() => 
    this.isFocused() || (this.value() !== '' && this.value() !== null && this.value() !== undefined) || !!this.placeholder()
  );

  readonly hasLeading = computed(() => !!this.icon());

  readonly hasTrailing = computed(() => 
    this.effectiveError() || (this.clearable() && !!this.value() && !this.disabled()) || !!this.trailingIcon()
  );

  readonly hasSupportingText = computed(() => 
    !!this.supportingText() || !!this.errorText()
  );

  readonly counterText = computed(() => {
    const max = this.maxlength();
    if (max === null || max === undefined || max <= 0) return null;
    const current = (this.value() || '').length;
    return `${current}/${max}`;
  });

  readonly rootClasses = computed(() => {
    const classes = [
      'm3-text-field',
      `m3-text-field-${this.variant()}`
    ];

    if (this.isFloated()) classes.push('is-floated');
    if (this.isFocused()) classes.push('is-focused');
    if (this.effectiveError()) classes.push('is-error');
    if (this.disabled()) classes.push('is-disabled');
    if (this.multiline()) classes.push('m3-text-field-multiline');
    if (this.hasLeading()) classes.push('has-leading');
    if (this.hasTrailing()) classes.push('has-trailing');

    return classes.join(' ');
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const val = target.value;
    this.value.set(val);
    this.onChange(val);
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.inputFocus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.onTouched();
    this.inputBlur.emit(event);
  }

  onClear(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
    this.onChange('');
    this.clear.emit();
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handled via disabled input binding
  }
}
