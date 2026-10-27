import { Component, inject, input, output } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { AppSection, NavStyle, TriggerMode } from '../models/ui.models';
import { M3ButtonComponent } from '../components/button/button.component';

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
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
          @if (currentSection() === 'overview') {
            Fundamentos M3
          } @else if (currentSection() === 'agenda') {
            Agenda de Tareas
          } @else if (currentSection() === 'pos') {
            Punto de Venta Expressivo
          } @else {
            Design System & Workshop
          }
        </h1>
        <p class="text-muted text-sm mt-0.5">
          @if (currentSection() === 'overview') {
            Arquitectura adaptativa en Modo {{ themeService.isDarkMode() ? 'Oscuro' : 'Claro' }} • Vista {{ navStyle().toUpperCase() }}
          } @else if (currentSection() === 'agenda') {
            Productividad y gestión visual bajo principios M3 • Vista {{ navStyle().toUpperCase() }}
          } @else if (currentSection() === 'pos') {
            Terminal comercial táctil con cálculo fiscal IGV, Yape/Efectivo y tickets térmicos • Vista {{ navStyle().toUpperCase() }}
          } @else {
            Catálogo maestro de tokens OKLCH, elevación y componentes 80/20 • Vista {{ navStyle().toUpperCase() }}
          }
        </p>
      </div>

      @if (currentSection() !== 'pos') {
        <div class="flex items-center gap-3">
          <!-- Switch Claro / Oscuro con Circular Reveal -->
          <m3-button 
            [iconOnly]="true"
            variant="outlined"
            [icon]="themeService.isDarkMode() ? 'light_mode' : 'dark_mode'"
            ariaLabel="Alternar Modo Claro / Oscuro"
            (action)="themeService.toggleThemeMode($event)" />

          <!-- Swatches con Shape Morphing -->
          <div class="flex items-center gap-2 bg-surface-box px-3 py-2 rounded-full border border-outline-sub shadow-xs">
            @for (t of themeService.themes; track t.hue) {
              <button 
                (click)="themeService.setThemeHue(t.hue)" 
                [title]="t.name" 
                [class.ring-2]="themeService.currentHue() === t.hue"
                [class.rounded-m3-md]="themeService.currentHue() === t.hue" 
                [class.rounded-full]="themeService.currentHue() !== t.hue"
                class="btn-m3 w-6 h-6 ring-offset-2 ring-offset-surface ring-primary cursor-pointer"
                [style.background-color]="'oklch(65% 0.16 ' + t.hue + ')'">
              </button>
            }
          </div>

          <!-- BOTÓN FAB ORIGEN SUPERIOR DERECHO -->
          <button 
            id="trigger-fab-header" 
            (click)="openCreate.emit('fab-header')"
            [class.invisible]="isDialogOpen() && activeTrigger() === 'fab-header'"
            [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'fab-header' ? 'dialog-transform' : null"
            title="Crear nueva tarea"
            class="btn-m3 w-11 h-11 bg-primary text-on-primary rounded-full grid place-items-center shadow-md ml-2 cursor-pointer">
            <span class="material-symbols-rounded text-2xl">add</span>
          </button>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);

  readonly currentSection = input.required<AppSection>();
  readonly navStyle = input.required<NavStyle>();
  readonly isDialogOpen = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);

  readonly openCreate = output<TriggerMode>();
}
