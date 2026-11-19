import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  Signal,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface M3RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface M3RadioGroupContext {
  readonly value: Signal<string>;
  readonly resolvedGroupName: Signal<string>;
  readonly isDisabled: Signal<boolean>;
  readonly isError: Signal<boolean>;
  readonly isRequired: Signal<boolean>;
  readonly groupDescribedBy: Signal<string | null>;
  selectValue(value: string): void;
  markTouched(): void;
}

export const M3_RADIO_GROUP = new InjectionToken<M3RadioGroupContext>('M3_RADIO_GROUP');

let nextRadioId = 0;
let nextRadioGroupId = 0;

/**
 * Material 3 Expressive Radio Button built on a native <input type="radio">
 * adhering to m3.material.io/components/radio-button/specs:
 * - 20dp outer ring (2dp stroke), 10dp inner dot, 40dp circular state layer, 48dp touch target
 * - Distinct selected/unselected interactive color & state-layer tokens (--md-comp-radio-button-*)
 * - Spring spatial inner-dot animation and fast-effects state-layer transitions
 * - Usable standalone or composed inside <m3-radio-group> via M3_RADIO_GROUP
 */
@Component({
  selector: 'm3-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block'
  },
  template: `
    <div
      class="m3-selection-row m3-radio-row"
      [class.is-disabled]="resolvedDisabled()"
      [class.is-error]="resolvedError()">
      <span class="m3-selection-target m3-radio-target">
        <input
          #nativeInput
          type="radio"
          class="m3-selection-native-input"
          [id]="actualId()"
          [name]="resolvedName()"
          [value]="value()"
          [checked]="isChecked()"
          [disabled]="resolvedDisabled()"
          [required]="resolvedRequired()"
          [attr.aria-label]="!hasVisibleLabel() ? (ariaLabel() || value()) : null"
          [attr.aria-describedby]="resolvedDescribedBy()"
          [attr.aria-invalid]="resolvedError() ? 'true' : null"
          (change)="onNativeChange()"
          (blur)="onNativeBlur()" />

        <span class="m3-selection-halo m3-radio-halo" aria-hidden="true">
          <span
            class="m3-radio-outer"
            [class.is-selected]="isChecked()">
            <span class="m3-radio-inner"></span>
          </span>
        </span>
      </span>

      @if (hasVisibleLabel() || description()) {
        <div class="m3-radio-copy">
          @if (hasVisibleLabel()) {
            <label
              [attr.for]="actualId()"
              class="m3-radio-label"
              [class.cursor-pointer]="!resolvedDisabled()"
              [class.cursor-not-allowed]="resolvedDisabled()">
              @if (label()) {
                {{ label() }}
              } @else {
                <ng-content />
              }
            </label>
          }
          @if (description()) {
            <span
              [id]="actualId() + '-desc'"
              class="m3-radio-description"
              [class.cursor-pointer]="!resolvedDisabled()"
              [class.cursor-not-allowed]="resolvedDisabled()"
              (click)="onDescriptionClick()">
              {{ description() }}
            </span>
          }
        </div>
      }
    </div>
  `
})
export class M3RadioComponent {
  readonly value = input.required<string>();
  readonly checked = model<boolean>(false);
  readonly label = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly customId = input<string | null>(null);

  readonly selected = output<string>();

  private readonly group = inject(M3_RADIO_GROUP, { optional: true });
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');
  private readonly generatedId = `m3-radio-${++nextRadioId}`;

  readonly actualId = computed(() => this.customId() || this.generatedId);
  readonly resolvedName = computed(() =>
    this.group ? this.group.resolvedGroupName() : (this.name() || this.generatedId)
  );
  readonly isChecked = computed(() =>
    this.group ? this.group.value() === this.value() : this.checked()
  );
  readonly resolvedDisabled = computed(() =>
    this.disabled() || (this.group?.isDisabled() ?? false)
  );
  readonly resolvedRequired = computed(() =>
    this.required() || (this.group?.isRequired() ?? false)
  );
  readonly resolvedError = computed(() =>
    this.error() || (this.group?.isError() ?? false)
  );
  readonly hasVisibleLabel = computed(() => Boolean(this.label()) || !this.ariaLabel());
  readonly resolvedDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.description()) {
      ids.push(`${this.actualId()}-desc`);
    }
    const groupDesc = this.group?.groupDescribedBy();
    if (groupDesc) {
      ids.push(groupDesc);
    }
    return ids.length > 0 ? ids.join(' ') : null;
  });

  focus(): void {
    this.nativeInput()?.nativeElement.focus();
  }

  onNativeChange(): void {
    if (this.resolvedDisabled()) return;
    const nextValue = this.value();
    if (this.group) {
      this.group.selectValue(nextValue);
    } else {
      this.checked.set(true);
    }
    this.selected.emit(nextValue);
  }

  onNativeBlur(): void {
    this.group?.markTouched();
  }

  onDescriptionClick(): void {
    if (this.resolvedDisabled()) return;
    const inputEl = this.nativeInput()?.nativeElement;
    if (!inputEl) return;
    inputEl.focus();
    if (!this.isChecked()) {
      inputEl.checked = true;
      this.onNativeChange();
    }
  }
}

/**
 * Material 3 Expressive Radio Group built on native <fieldset> + <legend> + <m3-radio>
 * to guarantee built-in arrow-key roving navigation and mutual exclusion.
 * Supports both data-driven [options] and projected <m3-radio> children.
 */
@Component({
  selector: 'm3-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3RadioComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => M3RadioGroupComponent),
      multi: true
    },
    {
      provide: M3_RADIO_GROUP,
      useExisting: forwardRef(() => M3RadioGroupComponent)
    }
  ],
  host: {
    class: 'block'
  },
  template: `
    <fieldset
      class="border-0 p-0 m-0"
      [disabled]="isDisabled()">
      @if (legend()) {
        <legend
          class="m3-radio-group-legend"
          [class.is-error]="isError()">
          {{ legend() }}
        </legend>
      } @else {
        <legend class="sr-only-m3">
          {{ ariaLabel() || 'Opciones' }}
        </legend>
      }

      <div
        [class]="orientation() === 'horizontal'
          ? 'flex flex-wrap items-start gap-x-5 gap-y-2'
          : 'flex flex-col gap-2'">
        @if (options().length > 0) {
          @for (option of options(); track option.value; let i = $index) {
            <m3-radio
              [customId]="optionId(i)"
              [value]="option.value"
              [label]="option.label"
              [description]="option.description ?? null"
              [disabled]="!!option.disabled" />
          }
        } @else {
          <ng-content />
        }
      </div>

      @if (errorText()) {
        <p
          [id]="groupId + '-error'"
          role="alert"
          aria-live="polite"
          class="m3-radio-group-feedback is-error">
          <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">error</span>
          <span>{{ errorText() }}</span>
        </p>
      } @else if (supportingText()) {
        <p
          [id]="groupId + '-support'"
          class="m3-radio-group-feedback">
          {{ supportingText() }}
        </p>
      }
    </fieldset>
  `
})
export class M3RadioGroupComponent implements ControlValueAccessor, M3RadioGroupContext {
  readonly options = input<readonly M3RadioOption[]>([]);
  readonly value = model<string>('');
  readonly legend = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly supportingText = input<string | null>(null);
  readonly errorText = input<string | null>(null);

  readonly changed = output<string>();

  private readonly seqId = ++nextRadioGroupId;
  readonly groupId = `m3-radio-group-${this.seqId}`;
  private readonly cvaDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly isRequired = computed(() => this.required());
  readonly isError = computed(() => this.error() || Boolean(this.errorText()));
  readonly resolvedGroupName = computed(() => this.name() || this.groupId);
  readonly groupDescribedBy = computed(() => {
    if (this.errorText()) return `${this.groupId}-error`;
    if (this.supportingText()) return `${this.groupId}-support`;
    return null;
  });

  private onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  optionId(index: number): string {
    return `${this.resolvedGroupName()}-opt-${index}`;
  }

  selectValue(nextValue: string): void {
    if (this.isDisabled()) return;
    this.value.set(nextValue);
    this.onChange(nextValue);
    this.onTouched();
    this.changed.emit(nextValue);
  }

  selectOption(option: M3RadioOption): void {
    if (this.isDisabled() || option.disabled) return;
    this.selectValue(option.value);
  }

  markTouched(): void {
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
