import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type M3SliderSize = 'xs' | 'sm' | 'md';

let nextSliderId = 0;

/**
 * Material 3 Expressive Slider built on a semantic <input type="range"> with
 * active/inactive disjoint track gaps, bar handle, optional discrete stop dots,
 * and floating inverse-surface value pill.
 */
@Component({
  selector: 'm3-slider',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => M3SliderComponent),
      multi: true
    }
  ],
  host: {
    class: 'block w-full'
  },
  template: `
    <div class="w-full space-y-1">
      @if (label()) {
        <div class="flex items-center justify-between gap-2 text-xs">
          <label
            [attr.for]="actualId()"
            class="font-semibold text-main"
            [class.opacity-60]="isDisabled()">
            {{ label() }}
          </label>
          <span class="font-mono font-bold text-primary">{{ formattedValue() }}</span>
        </div>
      }

      <div
        class="m3-slider-host"
        [class.show-indicator]="alwaysShowIndicator()"
        [class.is-disabled]="isDisabled()">
        <input
          type="range"
          class="m3-slider-input"
          [id]="actualId()"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="clampedValue()"
          [disabled]="isDisabled()"
          [attr.aria-label]="!label() ? (ariaLabel() || 'Control deslizante') : null"
          [attr.aria-valuetext]="formattedValue()"
          (input)="onNativeInput($event)"
          (blur)="onNativeBlur()" />

        <div class="m3-slider-visual" [style.height.px]="trackHeightPx()" aria-hidden="true">
          <div
            class="m3-slider-active-track"
            [style.width]="activeTrackWidthCss()">
          </div>

          <div
            class="m3-slider-inactive-track"
            [style.width]="inactiveTrackWidthCss()">
            @if (percent() < 96) {
              <span class="w-1 h-1 rounded-full bg-primary/80 shrink-0"></span>
            }
          </div>

          @for (stopPct of stopPercents(); track stopPct) {
            <span
              class="m3-slider-stop-dot"
              [style.left.%]="stopPct"
              [class.bg-on-primary]="stopPct < percent()"
              [class.bg-primary]="stopPct >= percent()">
            </span>
          }

          <div
            class="m3-slider-handle"
            [style.left]="handleLeftCss()">
          </div>

          <div
            class="m3-slider-value-indicator"
            [style.left]="handleLeftCss()">
            {{ formattedValue() }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class M3SliderComponent implements ControlValueAccessor {
  readonly value = model<number>(50);
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly size = input<M3SliderSize>('xs');
  readonly showStops = input<boolean>(false);
  readonly alwaysShowIndicator = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly label = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly unit = input<string>('');
  readonly customId = input<string | null>(null);

  private readonly generatedId = `m3-slider-${++nextSliderId}`;
  private readonly cvaDisabled = signal(false);

  readonly actualId = computed(() => this.customId() || this.generatedId);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  readonly clampedValue = computed(() => {
    const low = this.min();
    const high = Math.max(low, this.max());
    return Math.min(high, Math.max(low, this.value()));
  });

  readonly percent = computed(() => {
    const low = this.min();
    const span = this.max() - low;
    if (span <= 0) return 0;
    return Math.min(100, Math.max(0, ((this.clampedValue() - low) / span) * 100));
  });

  readonly trackHeightPx = computed(() => {
    const sz = this.size();
    if (sz === 'md') return 40;
    if (sz === 'sm') return 24;
    return 16;
  });

  readonly activeTrackWidthCss = computed(() => `max(0px, calc(${this.percent()}% - 6px))`);
  readonly inactiveTrackWidthCss = computed(() => `max(0px, calc(${100 - this.percent()}% - 6px))`);
  readonly handleLeftCss = computed(() => `clamp(2px, ${this.percent()}%, calc(100% - 2px))`);

  readonly formattedValue = computed(() => {
    const suffix = this.unit();
    return suffix ? `${this.clampedValue()}${suffix}` : `${this.clampedValue()}`;
  });

  readonly stopPercents = computed<number[]>(() => {
    if (!this.showStops()) return [];
    const low = this.min();
    const high = this.max();
    const stepVal = this.step();
    if (high <= low || stepVal <= 0) return [];
    const steps = Math.round((high - low) / stepVal);
    if (steps < 2 || steps > 24) return [];
    const currentPct = this.percent();
    const out: number[] = [];
    for (let i = 1; i < steps; i++) {
      const pct = (i / steps) * 100;
      if (Math.abs(pct - currentPct) > 4) {
        out.push(pct);
      }
    }
    return out;
  });

  private onChange: (val: number) => void = () => {};
  private onTouched: () => void = () => {};

  onNativeInput(event: Event): void {
    if (this.isDisabled()) return;
    const raw = Number((event.target as HTMLInputElement).value);
    if (Number.isNaN(raw)) return;
    this.value.set(raw);
    this.onChange(raw);
  }

  onNativeBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.value.set(typeof value === 'number' && !Number.isNaN(value) ? value : this.min());
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
