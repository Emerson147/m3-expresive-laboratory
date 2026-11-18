import { Component, inject, input, output } from '@angular/core';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { ContrastLevel, MotionScheme, ThemeService } from '../../core/theme/theme.service';
import { NavStyle, TransitionType, TriggerMode } from '../models/ui.models';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../components/button/button-group.component';
import { M3ButtonComponent } from '../components/button/button.component';
import { M3SwitchComponent } from '../components/switch/switch.component';

@Component({
  selector: 'app-dialog-container',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3SwitchComponent
  ],
  host: {
    class: 'contents'
  },
  template: `
    @if (isDialogOpen()) {
      <div (click)="closeDialog.emit()" class="fixed inset-0 z-40"></div>

      <div
        id="dialog-container"
        role="dialog"
        aria-modal="true"
        aria-label="Opciones del Sistema"
        [style.view-transition-name]="isDialogOpen() && activeTransition() === 'dialog' ? 'dialog-transform' : null"
        [class.bottom-4]="activeTrigger() === 'menu-bottom-left'"
        [class.left-4]="activeTrigger() === 'menu-bottom-left'"
        [class.sm:w-[408px]]="activeTrigger() === 'menu-bottom-left'"
        [class.w-[calc(100%-2rem)]]="true"
        [class.m3-container-enter]="!themeService.hasViewTransitions()"
        class="fixed h-fit max-h-[calc(100dvh-2rem)] bg-surface-box border border-outline-sub/60 forced-colors:border-[CanvasText] p-6 sm:p-7 flex flex-col justify-between shadow-m3-level4 z-50 rounded-m3-xl overflow-hidden">

        <!-- CENTRO GLOBAL DE PERSONALIZACIÓN M3 EXPRESSIVE -->
        <div class="flex flex-col min-h-0 gap-3.5 overflow-y-auto m3-scrollbar pr-0.5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
                  <span class="material-symbols-rounded text-xl" aria-hidden="true">palette</span>
                </span>
                <div class="min-w-0">
                  <h2 class="font-bold text-base tracking-tight text-main leading-tight">
                    Opciones del Sistema
                  </h2>
                  <p class="text-[11px] font-mono text-primary truncate mt-0.5">
                    {{ adaptiveLayout.windowSizeClass() }} · {{ adaptiveLayout.windowWidth() }}dp
                  </p>
                </div>
              </div>

              <m3-button
                [iconOnly]="true"
                variant="text"
                size="sm"
                icon="close"
                ariaLabel="Cerrar opciones del sistema"
                (action)="closeDialog.emit()" />
            </div>

            <!-- Modo Oscuro / Claro con <m3-switch> -->
            <div
              (click)="captureThemeSwitchEvent($event)"
              class="bg-surface rounded-m3-lg px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-8 h-8 rounded-m3-md bg-sec-box text-on-sec-box grid place-items-center shrink-0">
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

            <!-- Color Semilla + Croma OKLCH -->
            <div class="bg-surface rounded-m3-lg p-3.5 space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-muted uppercase tracking-wider">Color Semilla</span>
                  <span class="text-[11px] font-mono text-primary font-semibold">
                    {{ themeService.currentHue() }}°
                  </span>
                </div>
                <div class="flex items-center justify-between gap-2 pt-0.5" role="group" aria-label="Color semilla del tema">
                  @for (t of themeService.themes; track t.hue) {
                    @let selectedHue = themeService.currentHue() === t.hue;
                    <button
                      type="button"
                      (click)="themeService.setThemeHue(t.hue)"
                      [attr.aria-label]="'Color semilla ' + t.name"
                      [attr.aria-pressed]="selectedHue"
                      [class.ring-2]="selectedHue"
                      [class.rounded-m3-md]="selectedHue"
                      [class.rounded-full]="!selectedHue"
                      class="btn-m3 focus-ring-m3 w-9 h-9 ring-offset-2 ring-offset-surface ring-primary grid place-items-center cursor-pointer transition-all duration-200"
                      style="forced-color-adjust: none"
                      [style.background-color]="'oklch(65% 0.16 ' + t.hue + ')'">
                      @if (selectedHue) {
                        <span class="material-symbols-rounded text-base text-white drop-shadow-xs" aria-hidden="true">check</span>
                      }
                    </button>
                  }
                </div>
              </div>

              <div class="space-y-1.5 pt-2 border-t border-outline-sub/50">
                <span class="block text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Saturación OKLCH
                </span>
                <m3-button-group
                  variant="connected"
                  size="xs"
                  ariaLabel="Intensidad cromática OKLCH"
                  [options]="chromaOptions"
                  [value]="[themeService.seedChroma().toString()]"
                  (selectionChange)="onChromaSelect($event)" />
              </div>
            </div>

            <!-- Contraste M3 y Física Motion desde <m3-button-group> -->
            <div class="bg-surface rounded-m3-lg p-3.5 space-y-3">
              <div class="space-y-1.5">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">contrast</span>
                  Contraste M3
                </span>
                <m3-button-group
                  variant="connected"
                  size="xs"
                  ariaLabel="Nivel de contraste M3"
                  [options]="contrastOptions"
                  [value]="[themeService.contrastLevel()]"
                  (selectionChange)="onContrastSelect($event)" />
              </div>

              <div class="space-y-1.5 pt-2 border-t border-outline-sub/50">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">animation</span>
                  Física de Movimiento
                </span>
                <m3-button-group
                  variant="connected"
                  size="xs"
                  ariaLabel="Esquema de movimiento"
                  [options]="motionOptions"
                  [value]="[themeService.motionScheme()]"
                  (selectionChange)="onMotionSelect($event)" />
              </div>
            </div>

            <!-- Navegación Adaptativa desde <m3-button-group> -->
            <div class="bg-surface rounded-m3-lg p-3.5 space-y-2">
              <span class="block text-xs font-semibold text-muted uppercase tracking-wider">
                Navegación Adaptativa
              </span>
              <m3-button-group
                variant="standard"
                size="sm"
                ariaLabel="Estilo de navegación"
                [options]="navOptions"
                [value]="[navStyle()]"
                (selectionChange)="onNavSelect($event)" />
            </div>
          </div>
      </div>
    }
  `
})
export class DialogContainerComponent {
  readonly themeService = inject(ThemeService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);

  readonly navOptions: M3ButtonGroupOption[] = [
    { id: 'auto', label: 'Auto (M3)', icon: 'auto_awesome' },
    { id: 'rail', label: 'Rail', icon: 'view_sidebar' },
    { id: 'dock', label: 'Dock', icon: 'dock_to_bottom' },
    { id: 'tunnel', label: 'Focus Bar', icon: 'center_focus_strong' }
  ];

  readonly chromaOptions: M3ButtonGroupOption[] = [
    { id: '0.08', label: 'Suave' },
    { id: '0.16', label: 'Expressive' },
    { id: '0.22', label: 'Vibrante' }
  ];

  readonly motionOptions: M3ButtonGroupOption[] = [
    { id: 'expressive', label: 'Expresivo', icon: 'animation' },
    { id: 'standard', label: 'Estándar', icon: 'speed' }
  ];

  readonly contrastOptions: M3ButtonGroupOption[] = [
    { id: 'standard', label: 'Estándar' },
    { id: 'medium', label: 'Medio' },
    { id: 'high', label: 'Alto' }
  ];

  private lastThemePointerEvent: MouseEvent | undefined;

  readonly isDialogOpen = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly activeTransition = input<TransitionType>(null);
  readonly navStyle = input.required<NavStyle>();

  readonly closeDialog = output<void>();
  readonly navStyleChange = output<NavStyle>();

  captureThemeSwitchEvent(event: MouseEvent): void {
    this.lastThemePointerEvent = event;
  }

  onDarkModeSwitchChanged(): void {
    this.themeService.toggleThemeMode(this.lastThemePointerEvent);
    this.lastThemePointerEvent = undefined;
  }

  onChromaSelect(selected: string[]): void {
    const val = Number(selected[0]);
    if (Number.isFinite(val)) this.themeService.setSeedChroma(val);
  }

  onContrastSelect(selected: string[]): void {
    const lvl = selected[0] as ContrastLevel | undefined;
    if (lvl) this.themeService.setContrastLevel(lvl);
  }

  onMotionSelect(selected: string[]): void {
    const scheme = selected[0] as MotionScheme | undefined;
    if (scheme) this.themeService.setMotionScheme(scheme);
  }

  onNavSelect(selected: string[]): void {
    const style = selected[0] as NavStyle | undefined;
    if (style) this.navStyleChange.emit(style);
  }
}
