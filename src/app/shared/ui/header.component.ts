import { Component, computed, inject, input, output } from '@angular/core';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { ThemeService } from '../../core/theme/theme.service';
import { AppSection, NavChromeMode, TriggerMode } from '../models/ui.models';
import { M3ButtonComponent } from '../components/button/button.component';

const CHROME_LABELS: Record<NavChromeMode, string> = {
  bar: 'Bar Compact',
  'rail-collapsed': 'Rail 80dp',
  'rail-expanded': 'Rail Expandido',
  dock: 'Dock',
  tunnel: 'Focus Bar'
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [M3ButtonComponent],
  host: {
    class: 'block'
  },
  template: `
    <header class="flex flex-wrap items-center justify-between gap-4 pb-2">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">{{ heading().title }}</h1>
        <p class="text-muted text-sm mt-0.5">
          {{ heading().subtitle }}
          <span class="opacity-75"> • {{ layoutBadge() }}</span>
        </p>
      </div>

      @if (currentSection() !== 'pos') {
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="openCommandPalette.emit()"
            aria-label="Abrir paleta de comandos (Ctrl+K)"
            class="btn-m3 h-10 px-3 sm:px-3.5 rounded-full bg-surface-box hover:bg-surface-high text-muted hover:text-main flex items-center gap-2 text-xs font-medium shadow-xs cursor-pointer">
            <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">search</span>
            <span class="hidden sm:inline">Buscar</span>
            <kbd class="hidden md:inline px-1.5 py-0.5 rounded-m3-xs bg-surface-high text-[10px] font-mono text-muted">
              ⌘K
            </kbd>
          </button>

          <m3-button
            [iconOnly]="true"
            variant="tonal"
            [icon]="themeService.isDarkMode() ? 'light_mode' : 'dark_mode'"
            ariaLabel="Alternar Modo Claro / Oscuro"
            (action)="themeService.toggleThemeMode($event)" />

          <button
            id="trigger-fab-header"
            type="button"
            (click)="openCreate.emit('fab-header')"
            [class.invisible]="isDialogOpen() && activeTrigger() === 'fab-header'"
            [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'fab-header' ? 'dialog-transform' : null"
            aria-label="Crear nueva tarea"
            class="btn-m3 w-11 h-11 bg-primary text-on-primary rounded-full grid place-items-center shadow-sm ml-0.5 cursor-pointer">
            <span class="material-symbols-rounded text-2xl" aria-hidden="true">add</span>
          </button>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  private readonly adaptiveLayout = inject(AdaptiveLayoutService);

  readonly currentSection = input.required<AppSection>();
  readonly chromeMode = input<NavChromeMode | null>(null);
  readonly sectionTitle = input<string | undefined>(undefined);
  readonly sectionSubtitle = input<string | undefined>(undefined);
  readonly isDialogOpen = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);

  readonly openCreate = output<TriggerMode>();
  readonly openCommandPalette = output<void>();

  readonly heading = computed(() => {
    const fallbackBySection: Partial<Record<AppSection, { title: string; subtitle: string }>> = {
      overview: {
        title: 'Centro de Comando',
        subtitle: `Pulso operativo unificado en Modo ${this.themeService.isDarkMode() ? 'Oscuro' : 'Claro'}`
      },
      agenda: {
        title: 'Agenda de Tareas',
        subtitle: 'Bloques horarios, subtareas y enfoque profundo M3'
      },
      pos: {
        title: 'Punto de Venta Expressivo',
        subtitle: 'Terminal comercial táctil con cálculo fiscal IGV, Yape/Efectivo y tickets térmicos'
      }
    };

    const base = fallbackBySection[this.currentSection()] ?? {
      title: 'Design System & Workshop',
      subtitle: 'Catálogo maestro de tokens OKLCH, elevación y componentes 80/20'
    };

    return {
      title: this.sectionTitle() || base.title,
      subtitle: this.sectionSubtitle() || base.subtitle
    };
  });

  readonly layoutBadge = computed(() => {
    const sizeClass = this.adaptiveLayout.windowSizeClass().toUpperCase();
    const chrome = this.chromeMode();
    return chrome ? `${CHROME_LABELS[chrome]} • ${sizeClass}` : `M3 ${sizeClass}`;
  });
}
