import { Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type M3SwitchIconMode = 'none' | 'selected' | 'both';

let nextSwitchId = 0;

/**
 * Material 3 Switch control adhering to m3.material.io/components/switch specs:
 * - 52x32dp pill track, 16/24/28dp spring-morphing thumb, 16dp optional icon
 * - 40dp circular state-layer halo centered on the thumb + 48x48dp accessible touch target
 * - Three icon modes ('none' | 'selected' | 'both') with backward-compatible [withIcons]
 * - Separate aria-labelledby (<label>) and aria-describedby (<description>)
 */
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
        [disabled]="isDisabled()"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="!label() ? (ariaLabel() || 'Toggle') : null"
        [attr.aria-labelledby]="label() ? actualId() + '-label' : null"
        [attr.aria-describedby]="description() ? actualId() + '-desc' : null"
        [class]="switchClasses()"
        (click)="toggle()">
        <span class="m3-switch-thumb" aria-hidden="true">
          @if (showThumbIcon()) {
            <span class="material-symbols-rounded text-[16px] leading-none">
              {{ checked() ? 'check' : 'close' }}
            </span>
          }
        </span>
      </button>

      @if (label() || description()) {
        <div class="flex flex-col text-left" [class.opacity-60]="isDisabled()">
          @if (label()) {
            <label
              [id]="actualId() + '-label'"
              [attr.for]="actualId()"
              class="text-sm font-medium text-main leading-tight"
              [class.cursor-pointer]="!isDisabled()"
              [class.cursor-not-allowed]="isDisabled()">
              {{ label() }}
            </label>
          }
          @if (description()) {
            <span
              [id]="actualId() + '-desc'"
              class="text-xs text-muted leading-snug mt-0.5">
              {{ description() }}
            </span>
          }
        </div>
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
  readonly iconMode = input<M3SwitchIconMode | null>(null);
  readonly disabled = input<boolean>(false);
  readonly customId = input<string | null>(null);

  readonly changed = output<boolean>();

  private readonly generatedId = `m3-switch-${++nextSwitchId}`;
  private readonly cvaDisabled = signal(false);

  readonly actualId = computed(() => this.customId() || this.generatedId);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly resolvedIconMode = computed<M3SwitchIconMode>(() =>
    this.iconMode() ?? (this.withIcons() ? 'both' : 'none')
  );
  readonly showThumbIcon = computed(() => {
    const mode = this.resolvedIconMode();
    return mode === 'both' || (mode === 'selected' && this.checked());
  });

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  readonly wrapperClasses = computed(() =>
    this.isDisabled() ? 'm3-switch-wrapper is-disabled' : 'm3-switch-wrapper'
  );

  readonly switchClasses = computed(() => {
    const classes = ['m3-switch', 'focus-ring-m3', 'touch-target-48'];
    if (this.checked()) classes.push('is-checked');
    if (this.resolvedIconMode() === 'both') classes.push('has-icon-unselected');
    return classes.join(' ');
  });

  toggle(): void {
    if (this.isDisabled()) return;
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

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
