import { ChangeDetectionStrategy, Component, HostListener, computed, inject, input, output } from '@angular/core';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { ContrastLevel, MotionScheme, ThemeService } from '../../core/theme/theme.service';
import { M3ButtonComponent } from '../components/button/button.component';
import { M3CardComponent } from '../components/card/card.component';
import { M3ChipComponent } from '../components/chip/chip.component';
import { M3SliderComponent } from '../components/slider/slider.component';
import { M3SwitchComponent } from '../components/switch/switch.component';
import { NavChromeMode, NavStyle, TransitionType, TriggerMode } from '../models/ui.models';

interface SystemChoiceOption<T extends string | number> {
  readonly id: T;
  readonly label: string;
  readonly icon?: string;
}

const DEFAULT_THEME_HUE = 275;
const DEFAULT_SEED_CHROMA = 0.16;

const CHROMA_OPTIONS: readonly SystemChoiceOption<number>[] = [
  { id: 0.08, label: 'Suave' },
  { id: 0.16, label: 'Expressive' },
  { id: 0.22, label: 'Vibrante' }
];

const CONTRAST_OPTIONS: readonly SystemChoiceOption<ContrastLevel>[] = [
  { id: 'standard', label: 'Estándar' },
  { id: 'medium', label: 'Medio' },
  { id: 'high', label: 'Alto' }
];

const MOTION_OPTIONS: readonly SystemChoiceOption<MotionScheme>[] = [
  { id: 'expressive', label: 'Expresivo', icon: 'animation' },
  { id: 'standard', label: 'Estándar', icon: 'speed' }
];

const NAV_OPTIONS: readonly SystemChoiceOption<NavStyle>[] = [
  { id: 'auto', label: 'Auto (M3)', icon: 'auto_awesome' },
  { id: 'rail', label: 'Rail', icon: 'view_sidebar' },
  { id: 'dock', label: 'Dock', icon: 'dock_to_bottom' },
  { id: 'tunnel', label: 'Focus Bar', icon: 'center_focus_strong' }
];

/**
 * Global M3 Expressive System Options overlay ("Opciones del Sistema").
 * Adapts position across Rail, Focus Bar (top-right), Dock, and Compact mobile bottom sheets,
 * uses wrapped M3 Filter Chips (zero horizontal scroll overflow), 48dp touch swatches,
 * a live Seed Hue slider, OKLCH token preview pills, and one-click reset to defaults.
 */
@Component({
  selector: 'app-dialog-container',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3CardComponent,
    M3ChipComponent,
    M3SliderComponent,
    M3SwitchComponent
  ],
  host: {
    class: 'contents'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isDialogOpen()) {
      <div (click)="closeDialog.emit()" class="fixed inset-0 z-40"></div>

      <div
        id="dialog-container"
        role="dialog"
        aria-modal="true"
        aria-label="Opciones del Sistema"
        [style.view-transition-name]="isDialogOpen() && activeTransition() === 'dialog' ? 'dialog-transform' : null"
        [class]="panelClasses()">

        <!-- CABECERA -->
        <div class="flex items-start justify-between gap-2 pb-3 border-b border-outline-sub shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-xl" aria-hidden="true">palette</span>
            </span>
            <div class="min-w-0">
              <h2 class="font-bold text-base tracking-tight text-main leading-tight">
                Opciones del Sistema
              </h2>
              <p class="text-[11px] font-mono text-primary truncate mt-0.5">
                {{ adaptiveLayout.windowSizeClass() }} · {{ adaptiveLayout.windowWidth() }}dp • {{ themeService.currentHue() }}°
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            @if (hasCustomSettings()) {
              <m3-button
                variant="text"
                size="xs"
                icon="restart_alt"
                ariaLabel="Restablecer opciones M3"
                (action)="resetDefaults()">
                Reset
              </m3-button>
            }

            <m3-button
              [iconOnly]="true"
              variant="text"
              size="sm"
              icon="close"
              ariaLabel="Cerrar opciones del sistema"
              (action)="closeDialog.emit()" />
          </div>
        </div>

        <!-- CUERPO SCROLLEABLE (ESTRICTO CERO SCROLL HORIZONTAL) -->
        <div class="flex flex-col min-h-0 gap-3 pt-3 overflow-y-auto overflow-x-hidden m3-scrollbar">
          <!-- Vista rápida en vivo de roles OKLCH -->
          <div class="grid grid-cols-4 gap-1.5 text-[10px] font-bold text-center" aria-label="Vista previa de paleta OKLCH activa">
            <span class="px-1.5 py-1 rounded-m3-sm bg-primary text-on-primary truncate">Primary</span>
            <span class="px-1.5 py-1 rounded-m3-sm bg-sec-box text-on-sec-box truncate">Secondary</span>
            <span class="px-1.5 py-1 rounded-m3-sm bg-tertiary-box text-on-tertiary-box truncate">Tertiary</span>
            <span class="px-1.5 py-1 rounded-m3-sm bg-surface-high text-main border border-outline-sub truncate">Surface</span>
          </div>

          <!-- Modo Oscuro / Claro -->
          <m3-card variant="filled" surface="low" padding="sm" shape="lg" customClass="cursor-default">
            <div
              (click)="captureThemeSwitchEvent($event)"
              class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-9 h-9 rounded-m3-md bg-sec-box text-on-sec-box grid place-items-center shrink-0">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">
                    {{ themeService.isDarkMode() ? 'dark_mode' : 'light_mode' }}
                  </span>
                </span>
                <div class="min-w-0">
                  <span class="block text-sm font-semibold text-main leading-tight">
                    Modo {{ themeService.isDarkMode() ? 'Oscuro' : 'Claro' }}
                  </span>
                  <span class="block text-[11px] text-muted truncate">
                    Superficies OKLCH adaptativas
                  </span>
                </div>
              </div>

              <m3-switch
                [checked]="themeService.isDarkMode()"
                ariaLabel="Alternar modo oscuro o claro"
                (changed)="onDarkModeSwitchChanged()" />
            </div>
          </m3-card>

          <!-- Color Semilla (Swatches 48dp + Slider Hue) + Saturación -->
          <m3-card variant="filled" surface="low" padding="sm" shape="lg" customClass="space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider">Color Semilla</span>
                <span class="text-[11px] font-mono text-primary font-semibold tabular-nums">
                  {{ themeService.currentHue() }}° OKLCH
                </span>
              </div>

              <div class="grid grid-cols-5 gap-2" role="group" aria-label="Color semilla del tema">
                @for (t of themeService.themes; track t.hue) {
                  @let selectedHue = themeService.currentHue() === t.hue;
                  <button
                    type="button"
                    (click)="themeService.setThemeHue(t.hue)"
                    [attr.aria-label]="'Color semilla ' + t.name"
                    [attr.aria-pressed]="selectedHue"
                    [class.ring-2]="selectedHue"
                    class="touch-target-48 focus-ring-m3 w-full h-11 ring-offset-2 ring-offset-surface ring-primary grid place-items-center cursor-pointer"
                    style="forced-color-adjust: none; transition-property: border-radius, transform, box-shadow; transition-duration: var(--md-sys-motion-spring-expressive-fast-spatial-duration, 350ms); transition-timing-function: var(--md-sys-motion-spring-expressive-fast-spatial-curve, cubic-bezier(0.42, 1.67, 0.21, 0.9));"
                    [style.border-radius]="selectedHue ? '14px' : '22px'"
                    [style.background-color]="'oklch(65% 0.16 ' + t.hue + ')'">
                    @if (selectedHue) {
                      <span class="material-symbols-rounded text-base text-white drop-shadow-xs" aria-hidden="true">check</span>
                    }
                  </button>
                }
              </div>

              <m3-slider
                label="Ajuste fino de Matiz (Hue)"
                unit="°"
                size="xs"
                [min]="0"
                [max]="360"
                [step]="5"
                [value]="themeService.currentHue()"
                (valueChange)="themeService.setThemeHue($event)" />
            </div>

            <div class="space-y-1.5 pt-2.5 border-t border-outline-sub/60">
              <span class="block text-[11px] font-semibold text-muted uppercase tracking-wider">
                Saturación OKLCH
              </span>
              <div class="flex flex-wrap gap-1.5" role="group" aria-label="Intensidad cromática OKLCH">
                @for (opt of chromaOptions; track opt.id) {
                  <m3-chip
                    type="filter"
                    [selected]="themeService.seedChroma() === opt.id"
                    (action)="themeService.setSeedChroma(opt.id)">
                    {{ opt.label }}
                  </m3-chip>
                }
              </div>
            </div>
          </m3-card>

          <!-- Contraste M3 y Física de Movimiento -->
          <m3-card variant="filled" surface="low" padding="sm" shape="lg" customClass="space-y-3">
            <div class="space-y-1.5">
              <span class="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">contrast</span>
                Contraste M3
              </span>
              <div class="flex flex-wrap gap-1.5" role="group" aria-label="Nivel de contraste M3">
                @for (opt of contrastOptions; track opt.id) {
                  <m3-chip
                    type="filter"
                    [selected]="themeService.contrastLevel() === opt.id"
                    (action)="themeService.setContrastLevel(opt.id)">
                    {{ opt.label }}
                  </m3-chip>
                }
              </div>
            </div>

            <div class="space-y-1.5 pt-2.5 border-t border-outline-sub/60">
              <span class="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">animation</span>
                Física de Movimiento
              </span>
              <div class="flex flex-wrap gap-1.5" role="group" aria-label="Esquema de movimiento">
                @for (opt of motionOptions; track opt.id) {
                  <m3-chip
                    type="filter"
                    [icon]="opt.icon ?? null"
                    [selected]="themeService.motionScheme() === opt.id"
                    (action)="themeService.setMotionScheme(opt.id)">
                    {{ opt.label }}
                  </m3-chip>
                }
              </div>
            </div>
          </m3-card>

          <!-- Navegación Adaptativa -->
          <m3-card variant="filled" surface="low" padding="sm" shape="lg" customClass="space-y-2">
            <span class="block text-xs font-semibold text-muted uppercase tracking-wider">
              Navegación Adaptativa
            </span>
            <div class="flex flex-wrap gap-1.5" role="group" aria-label="Estilo de navegación">
              @for (opt of navOptions; track opt.id) {
                <m3-chip
                  type="filter"
                  [icon]="opt.icon ?? null"
                  [selected]="navStyle() === opt.id"
                  (action)="navStyleChange.emit(opt.id)">
                  {{ opt.label }}
                </m3-chip>
              }
            </div>
          </m3-card>
        </div>
      </div>
    }
  `
})
export class DialogContainerComponent {
  readonly themeService = inject(ThemeService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);

  readonly chromaOptions = CHROMA_OPTIONS;
  readonly contrastOptions = CONTRAST_OPTIONS;
  readonly motionOptions = MOTION_OPTIONS;
  readonly navOptions = NAV_OPTIONS;

  private lastThemePointerEvent: MouseEvent | undefined;

  readonly isDialogOpen = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly activeTransition = input<TransitionType>(null);
  readonly navStyle = input.required<NavStyle>();
  readonly chromeMode = input<NavChromeMode>('rail-expanded');

  readonly closeDialog = output<void>();
  readonly navStyleChange = output<NavStyle>();

  readonly hasCustomSettings = computed(
    () =>
      this.themeService.currentHue() !== DEFAULT_THEME_HUE ||
      this.themeService.seedChroma() !== DEFAULT_SEED_CHROMA ||
      this.themeService.contrastLevel() !== 'standard' ||
      this.themeService.motionScheme() !== 'expressive' ||
      this.navStyle() !== 'auto'
  );

  readonly panelClasses = computed(() => {
    const chrome = this.chromeMode();
    let desktopPlacement = 'sm:inset-auto sm:bottom-4 sm:left-4 sm:w-[min(456px,calc(100vw-2rem))]';

    if (chrome === 'tunnel') {
      desktopPlacement =
        'sm:inset-auto sm:top-16 sm:right-4 sm:w-[min(456px,calc(100vw-2rem))]';
    } else if (chrome === 'dock') {
      desktopPlacement =
        'sm:inset-auto sm:bottom-20 sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(460px,calc(100vw-2rem))]';
    }

    const fallbackEnter = !this.themeService.hasViewTransitions() ? ' m3-container-enter' : '';

    return [
      'fixed inset-x-3 bottom-3 w-auto max-w-[calc(100vw-1.5rem)]',
      desktopPlacement,
      'h-fit max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]',
      'bg-surface-box border border-outline-sub/70 forced-colors:border-[CanvasText]',
      'p-4 sm:p-5 flex flex-col shadow-m3-level4 z-50',
      'rounded-m3-xl-inc sm:rounded-m3-xl overflow-hidden',
      fallbackEnter
    ].join(' ');
  });

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isDialogOpen()) {
      this.closeDialog.emit();
    }
  }

  captureThemeSwitchEvent(event: MouseEvent): void {
    this.lastThemePointerEvent = event;
  }

  onDarkModeSwitchChanged(): void {
    this.themeService.toggleThemeMode(this.lastThemePointerEvent);
    this.lastThemePointerEvent = undefined;
  }

  resetDefaults(): void {
    this.themeService.setThemeHue(DEFAULT_THEME_HUE);
    this.themeService.setSeedChroma(DEFAULT_SEED_CHROMA);
    this.themeService.setContrastLevel('standard');
    this.themeService.setMotionScheme('expressive');
    this.navStyleChange.emit('auto');
  }
}
