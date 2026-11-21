import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { ThemeOption } from '../../../core/theme/theme.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3SliderComponent } from '../../../shared/components/slider/slider.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';

let nextCalibrationSeq = 0;

@Component({
  selector: 'app-telemetry-header',
  standalone: true,
  imports: [M3ButtonComponent, M3SwitchComponent, M3SliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-surface-low rounded-m3-xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
          <span class="material-symbols-rounded text-xl" aria-hidden="true">satellite_alt</span>
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span
              [class]="'w-2.5 h-2.5 rounded-m3-full shrink-0 ' +
                (isLiveTelemetryActive() ? 'bg-success animate-pulse' : 'bg-outline')"
              aria-hidden="true">
            </span>
            <span class="text-label-sm-emphasized uppercase tracking-wider text-primary">
              Aether Fleet • Mission Control
            </span>
            <span
              [class]="'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full font-mono tabular-nums ' +
                (isLiveTelemetryActive() ? 'bg-success-box text-on-success-box' : 'bg-surface-high text-muted')">
              {{ isLiveTelemetryActive() ? 'Sincronía cada ' + refreshIntervalSeconds() + 's' : 'En pausa' }}
            </span>
          </div>

          <h1 class="text-title-lg-emphasized sm:text-headline-sm-emphasized text-main truncate mt-0.5">
            Panel de Monitoreo de Despachos y Flotas
          </h1>
          <p class="text-label-md text-muted truncate">
            Corredor Panamericana &amp; Hub Callao • Telemetría CAN-BUS cada {{ refreshIntervalSeconds() }}s
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center touch-gap-8 shrink-0">
        <div class="flex items-center gap-2 px-3 py-1 rounded-m3-full bg-surface">
          <m3-switch
            [checked]="isLiveTelemetryActive()"
            ariaLabel="Activar o pausar telemetría en vivo cada 2 segundos"
            label="En vivo"
            (changed)="toggleLiveTelemetry.emit()" />
        </div>

        <div class="relative inline-flex items-center touch-gap-8">
          <button
            type="button"
            class="tel-calibration-trigger m3-btn m3-btn-tonal m3-btn-sm state-layer focus-ring-m3 touch-target-48 has-icon-leading"
            [attr.aria-expanded]="calibrationOpen()"
            [attr.aria-controls]="popoverId"
            [attr.aria-label]="'Calibrar tema M3 (' + currentHue() + ' grados)'"
            (click)="toggleCalibration($event)">
            <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">palette</span>
            <span class="font-mono tabular-nums">{{ currentHue() }}°</span>
          </button>

          <m3-button
            [iconOnly]="true"
            variant="outlined"
            size="sm"
            [icon]="isDarkMode() ? 'light_mode' : 'dark_mode'"
            [ariaLabel]="isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            (action)="toggleTheme.emit($event)" />

          <div
            #calibrationPopover
            [id]="popoverId"
            [attr.popover]="supportsNativePopover ? 'auto' : null"
            class="tel-calibration-popover space-y-3"
            [class.is-fallback]="!supportsNativePopover"
            [class.is-fallback-open]="!supportsNativePopover && calibrationOpen()"
            (toggle)="onNativeToggle($event)">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="text-title-sm-emphasized text-main">Calibración OKLCH</p>
                <p class="text-label-sm text-muted">Ajusta matiz semilla y contraste</p>
              </div>
              <span class="text-label-md-emphasized font-mono tabular-nums px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box">
                {{ currentHue() }}°
              </span>
            </div>

            <div class="space-y-1.5">
              <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block">
                Paletas rápidas
              </span>
              <div class="grid grid-cols-5 gap-1.5" role="group" aria-label="Paletas rápidas OKLCH">
                @for (theme of themes(); track theme.hue) {
                  <button
                    type="button"
                    (click)="selectPresetHue(theme.hue)"
                    [attr.aria-label]="theme.name + ' (' + theme.hue + ' grados)'"
                    [attr.aria-pressed]="currentHue() === theme.hue"
                    class="state-layer focus-ring-m3 h-9 rounded-m3-md flex items-center justify-center cursor-pointer transition-transform"
                    [class.ring-2]="currentHue() === theme.hue"
                    [class.ring-primary]="currentHue() === theme.hue"
                    [style.background]="'oklch(62% 0.16 ' + theme.hue + ')'">
                    @if (currentHue() === theme.hue) {
                      <span class="w-5 h-5 rounded-m3-full bg-surface text-main grid place-items-center shadow-m3-level1">
                        <span class="material-symbols-rounded text-sm" aria-hidden="true">check</span>
                      </span>
                    }
                  </button>
                }
              </div>
            </div>

            <div class="pt-0.5">
              <m3-slider
                [customId]="hueSliderId"
                label="Matiz personalizado"
                unit="°"
                size="xs"
                [min]="0"
                [max]="360"
                [step]="1"
                [value]="currentHue()"
                (valueChange)="hueChange.emit($event)" />
            </div>
          </div>
        </div>

        <m3-button
          id="trigger-assign-route"
          variant="filled"
          size="md"
          icon="add_road"
          [morph]="true"
          [invisible]="isAssignOriginInvisible()"
          [viewTransitionName]="isAssignOriginActive() ? 'dialog-transform' : null"
          (action)="assignRoute.emit()">
          Asignar Ruta
        </m3-button>
      </div>
    </header>
  `
})
export class TelemetryHeaderComponent {
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentHue = input.required<number>();
  readonly isDarkMode = input.required<boolean>();
  readonly themes = input.required<readonly ThemeOption[]>();
  readonly isLiveTelemetryActive = input.required<boolean>();
  readonly refreshIntervalSeconds = input.required<number>();
  readonly isAssignOriginActive = input<boolean>(false);
  readonly isAssignOriginInvisible = input<boolean>(false);

  readonly hueChange = output<number>();
  readonly toggleTheme = output<MouseEvent>();
  readonly toggleLiveTelemetry = output<void>();
  readonly assignRoute = output<void>();

  readonly seq = ++nextCalibrationSeq;
  readonly popoverId = `tel-calibration-popover-${this.seq}`;
  readonly hueSliderId = `tel-seed-hue-slider-${this.seq}`;
  readonly calibrationOpen = signal<boolean>(false);
  readonly calibrationPopover = viewChild<ElementRef<HTMLElement>>('calibrationPopover');

  readonly supportsNativePopover =
    typeof HTMLElement !== 'undefined' &&
    'popover' in HTMLElement.prototype &&
    typeof HTMLElement.prototype.showPopover === 'function';

  private readonly supportsAnchorPositioning =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('position-area: block-end');

  constructor() {
    if (!this.supportsNativePopover && typeof document !== 'undefined') {
      const onDocClick = (event: MouseEvent) => {
        if (this.calibrationOpen() && !this.hostEl.nativeElement.contains(event.target as Node)) {
          this.calibrationOpen.set(false);
        }
      };
      const onDocKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.calibrationOpen()) {
          this.calibrationOpen.set(false);
        }
      };
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onDocKeydown);
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onDocKeydown);
      });
    }
  }

  toggleCalibration(event: MouseEvent): void {
    const panel = this.calibrationPopover()?.nativeElement;
    if (!panel) return;

    if (!this.supportsAnchorPositioning || !this.supportsNativePopover) {
      const triggerRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      panel.style.position = 'fixed';
      panel.style.inset = 'auto';
      panel.style.margin = '0';
      panel.style.top = `${Math.round(triggerRect.bottom + 8)}px`;
      panel.style.right = `${Math.max(12, Math.round(window.innerWidth - triggerRect.right))}px`;
    } else {
      panel.style.removeProperty('top');
      panel.style.removeProperty('right');
      panel.style.removeProperty('left');
      panel.style.removeProperty('bottom');
    }

    if (this.supportsNativePopover && typeof panel.togglePopover === 'function') {
      panel.togglePopover();
    } else {
      this.calibrationOpen.update(v => !v);
    }
  }

  onNativeToggle(event: Event): void {
    const toggleEvent = event as Event & { newState?: string };
    this.calibrationOpen.set(toggleEvent.newState === 'open');
  }

  selectPresetHue(hue: number): void {
    this.hueChange.emit(hue);
  }
}
