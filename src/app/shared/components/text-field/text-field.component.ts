import { 
  Component, 
  ElementRef,
  computed, 
  forwardRef, 
  input, 
  model, 
  output, 
  signal,
  viewChild
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

          <div class="m3-text-field-control-row">
            @if (!multiline() && prefix()) {
              <span [id]="actualId() + '-prefix'" class="m3-text-field-affix">
                {{ prefix() }}
              </span>
            }

            @if (!multiline()) {
              <input
                #controlEl
                [id]="actualId()"
                [attr.name]="name() || null"
                [type]="effectiveType()"
                [value]="value()"
                [disabled]="disabled()"
                [readOnly]="readonly()"
                [required]="required()"
                [attr.pattern]="pattern() || null"
                [attr.minlength]="minlength() || null"
                [attr.inputmode]="inputMode()"
                [attr.enterkeyhint]="enterkeyhint() || null"
                [attr.autocomplete]="autocomplete() || null"
                [attr.placeholder]="isFloated() ? placeholder() : ''"
                [attr.maxlength]="maxlength() || null"
                [attr.aria-invalid]="effectiveError() ? 'true' : null"
                [attr.aria-describedby]="describedByIds()"
                class="m3-text-field-input"
                (input)="onInput($event)"
                (focus)="onFocus($event)"
                (blur)="onBlur($event)"
                (invalid)="onNativeInvalid($event)" />
            } @else {
              <textarea
                #controlEl
                [id]="actualId()"
                [attr.name]="name() || null"
                [rows]="rows()"
                [value]="value()"
                [disabled]="disabled()"
                [readOnly]="readonly()"
                [required]="required()"
                [attr.minlength]="minlength() || null"
                [attr.enterkeyhint]="enterkeyhint() || null"
                [attr.autocomplete]="autocomplete() || null"
                [attr.placeholder]="isFloated() ? placeholder() : ''"
                [attr.maxlength]="maxlength() || null"
                [attr.aria-invalid]="effectiveError() ? 'true' : null"
                [attr.aria-describedby]="describedByIds()"
                class="m3-text-field-input"
                (input)="onInput($event)"
                (focus)="onFocus($event)"
                (blur)="onBlur($event)"
                (invalid)="onNativeInvalid($event)"></textarea>
            }

            @if (!multiline() && suffix()) {
              <span [id]="actualId() + '-suffix'" class="m3-text-field-affix">
                {{ suffix() }}
              </span>
            }
          </div>
        </div>

        <!-- Trailing Slot: Error Icon, Password Reveal Toggle, Clear Button, or Custom Icon -->
        @if (hasTrailing()) {
          <div class="m3-text-field-trailing">
            @if (effectiveError()) {
              <span class="material-symbols-rounded text-error" aria-hidden="true">
                error
              </span>
            }

            @if (isPasswordField() && !disabled()) {
              <button
                type="button"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                [attr.aria-pressed]="showPassword()"
                class="m3-text-field-password-btn focus-ring-m3 touch-target-48 rounded-full p-0.5 inline-flex items-center justify-center"
                (click)="togglePasswordVisibility($event)">
                <span class="material-symbols-rounded text-base" aria-hidden="true">
                  {{ showPassword() ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            } @else if (!effectiveError() && clearable() && value() && !disabled() && !readonly()) {
              <button 
                type="button" 
                aria-label="Limpiar campo"
                class="focus-ring-m3 rounded-full p-0.5 inline-flex items-center justify-center"
                (click)="onClear($event)">
                <span class="material-symbols-rounded text-base" aria-hidden="true">
                  cancel
                </span>
              </button>
            } @else if (!effectiveError() && showValidState() && nativeValidAfterInteraction()) {
              <span class="material-symbols-rounded text-success text-base" aria-hidden="true">
                check_circle
              </span>
            } @else if (!effectiveError() && trailingIcon()) {
              <span class="material-symbols-rounded text-base" aria-hidden="true">
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
            {{ effectiveError() ? resolvedErrorText() : supportingText() }}
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

  /** Virtual keyboard hint (e.g. 'numeric', 'decimal', 'search') */
  readonly inputMode = input<string | null>(null);

  /** Native browser autofill hint (e.g. 'email', 'name', 'off') */
  readonly autocomplete = input<string | null>(null);

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

  /** Read-only state (focusable & selectable, prevents editing) */
  readonly readonly = input<boolean>(false);

  /** Stable form field name for native browser autofill & password managers */
  readonly name = input<string | null>(null);

  /** Whether to render a multiline <textarea> */
  readonly multiline = input<boolean>(false);

  /** Number of rows when multiline is true */
  readonly rows = input<number>(3);

  /** Maximum character limit (renders character counter if set) */
  readonly maxlength = input<number | null>(null);

  /** Inline prefix unit/symbol (e.g. 'S/', '$') rendered before the input */
  readonly prefix = input<string | null>(null);

  /** Inline suffix unit/domain (e.g. 'kg', '@empresa.com') rendered after the input */
  readonly suffix = input<string | null>(null);

  /** Enables interactive show/hide password toggle button for password inputs */
  readonly passwordToggle = input<boolean>(false);

  /** Native HTML validation constraints deferred until after user interaction (:user-invalid) */
  readonly required = input<boolean>(false);
  readonly pattern = input<string | null>(null);
  readonly minlength = input<number | null>(null);

  /** Mobile virtual keyboard submit key hint ('next', 'done', 'search', 'send') */
  readonly enterkeyhint = input<string | null>(null);

  /** Enables CSS field-sizing: content auto-growing multiline textarea (with vertical caps) */
  readonly autoGrow = input<boolean>(false);

  /** Highlights valid state softly after interaction when native validation passes */
  readonly showValidState = input<boolean>(false);

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
  readonly showPassword = signal<boolean>(false);
  readonly hasInteracted = signal<boolean>(false);
  readonly nativeValidationError = signal<string | null>(null);
  private readonly controlEl = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('controlEl');
  private readonly internalId = `m3-input-${++nextUniqueId}`;

  focus(): void {
    this.controlEl()?.nativeElement.focus();
  }

  // ControlValueAccessor callbacks
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly actualId = computed(() => this.id() || this.internalId);

  readonly isPasswordField = computed(() => this.type() === 'password' && this.passwordToggle());

  readonly effectiveType = computed(() =>
    this.isPasswordField() && this.showPassword() ? 'text' : this.type()
  );

  readonly resolvedErrorText = computed(
    () => this.errorText() || this.nativeValidationError() || this.supportingText()
  );

  readonly effectiveError = computed(
    () => this.isError() || !!this.errorText() || !!this.nativeValidationError()
  );

  readonly nativeValidAfterInteraction = computed(
    () =>
      this.hasInteracted() &&
      !this.effectiveError() &&
      !!(this.required() || this.pattern() || this.minlength() || this.type() === 'email') &&
      !!this.value()
  );

  readonly isFloated = computed(
    () =>
      this.isFocused() ||
      (this.value() !== '' && this.value() !== null && this.value() !== undefined) ||
      !!this.placeholder() ||
      (!this.multiline() && !!this.prefix())
  );

  readonly hasLeading = computed(() => !!this.icon());

  readonly hasTrailing = computed(
    () =>
      this.effectiveError() ||
      this.isPasswordField() ||
      (this.clearable() && !!this.value() && !this.disabled() && !this.readonly()) ||
      (this.showValidState() && this.nativeValidAfterInteraction()) ||
      !!this.trailingIcon()
  );

  readonly hasSupportingText = computed(
    () => !!this.supportingText() || !!this.errorText() || !!this.nativeValidationError()
  );

  readonly describedByIds = computed(() => {
    const ids: string[] = [];
    if (!this.multiline() && this.prefix()) ids.push(`${this.actualId()}-prefix`);
    if (!this.multiline() && this.suffix()) ids.push(`${this.actualId()}-suffix`);
    if (this.hasSupportingText() || this.counterText()) ids.push(`${this.actualId()}-support`);
    return ids.length > 0 ? ids.join(' ') : null;
  });

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
    if (this.showValidState() && this.nativeValidAfterInteraction()) classes.push('is-valid');
    if (this.disabled()) classes.push('is-disabled');
    if (this.readonly()) classes.push('is-readonly');
    if (this.multiline()) classes.push('m3-text-field-multiline');
    if (this.multiline() && this.autoGrow()) classes.push('is-auto-grow');
    if (this.hasLeading()) classes.push('has-leading');
    if (this.hasTrailing()) classes.push('has-trailing');
    if (this.showValidState()) classes.push('show-valid');

    return classes.join(' ');
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const val = target.value;
    this.value.set(val);
    this.onChange(val);
    if (this.hasInteracted()) {
      this.syncNativeValidity(target);
    }
  }

  onFocus(event: FocusEvent): void {
    this.isFocused.set(true);
    this.inputFocus.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused.set(false);
    this.hasInteracted.set(true);
    this.onTouched();
    this.syncNativeValidity(event.target as HTMLInputElement | HTMLTextAreaElement);
    this.inputBlur.emit(event);
  }

  onNativeInvalid(event: Event): void {
    this.hasInteracted.set(true);
    this.syncNativeValidity(event.target as HTMLInputElement | HTMLTextAreaElement);
  }

  togglePasswordVisibility(event: MouseEvent): void {
    event.stopPropagation();
    this.showPassword.update((v) => !v);
  }

  onClear(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
    this.nativeValidationError.set(null);
    this.onChange('');
    this.clear.emit();
  }

  private syncNativeValidity(control: HTMLInputElement | HTMLTextAreaElement | null): void {
    if (!control || typeof control.checkValidity !== 'function') return;
    if (control.validity.valid) {
      this.nativeValidationError.set(null);
    } else {
      this.nativeValidationError.set(control.validationMessage || 'Valor inválido');
    }
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
