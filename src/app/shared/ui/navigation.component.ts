import { Component, effect, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AppSection, DESIGN_SYSTEM_STEPS, NavStyle, TransitionType, TriggerMode } from '../models/ui.models';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  host: {
    class: 'contents'
  },
  template: `
    <!-- 1. NAVIGATION RAIL / TUNNEL (Cuando navStyle no es 'dock') -->
    @if (navStyle() !== 'dock') {
      <aside 
        [style.view-transition-name]="activeTransition() === 'nav' ? 'nav-transform' : null"
        [class]="navStyle() === 'tunnel' ? 'w-48 bg-surface p-6' : 'w-20 md:w-64 border-r border-outline-sub bg-surface-low p-4'"
        class="flex flex-col justify-between gap-4 transition-all duration-300 shrink-0 min-h-0">

        <div class="space-y-6 overflow-y-auto min-h-0">
          <div class="flex items-center gap-3 px-2 py-1">
            <div class="w-10 h-10 rounded-m3-md bg-primary text-on-primary font-bold grid place-items-center text-lg shadow-sm">
              <span class="material-symbols-rounded text-2xl">category</span>
            </div>
            <span class="hidden md:inline font-semibold tracking-tight text-lg">Expressive</span>
          </div>

          <!-- MODO CLÁSICO RAIL -->
          @if (navStyle() === 'rail') {
            <nav class="space-y-2">
              <a 
                routerLink="/overview"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="sectionSelect.emit('overview')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">dashboard</span>
                <span class="hidden md:inline text-sm">Dashboard</span>
              </a>

              <a 
                routerLink="/agenda"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('agenda')"
                class="btn-m3 w-full flex items-center justify-between px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="flex items-center gap-3.5">
                  <span class="material-symbols-rounded text-xl">event_upcoming</span>
                  <span class="hidden md:inline text-sm">Agenda de Tareas</span>
                </span>
                <span class="hidden md:inline text-xs px-2 py-0.5 rounded-full bg-surface-high text-main font-bold">
                  {{ pendingCount() }}
                </span>
              </a>

              <div>
                <button
                  type="button"
                  (click)="toggleDesignSystemMenu()"
                  [attr.aria-expanded]="isDesignSystemOpen()"
                  aria-controls="design-system-submenu"
                  [class]="currentSection() === 'design-system'
                    ? 'bg-sec-box/70 text-on-sec-box font-semibold shadow-xs'
                    : 'text-muted hover:bg-surface-high hover:text-main'"
                  class="btn-m3 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-full text-left cursor-pointer">
                  <span class="flex items-center gap-3.5 min-w-0">
                    <span class="material-symbols-rounded text-xl shrink-0">widgets</span>
                    <span class="hidden md:inline text-sm truncate">Design System</span>
                  </span>
                  <span
                    class="hidden md:inline material-symbols-rounded text-lg transition-transform m3-transition-fast shrink-0"
                    [class.rotate-180]="isDesignSystemOpen()"
                    aria-hidden="true">
                    expand_more
                  </span>
                </button>

                <div
                  id="design-system-submenu"
                  [attr.inert]="!isDesignSystemOpen() ? '' : null"
                  [class]="isDesignSystemOpen() ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'"
                  class="grid transition-[grid-template-rows,opacity,margin] m3-transition-emphasized">
                  <div class="overflow-hidden">
                    <div class="space-y-1 md:ml-5 md:pl-3 md:border-l md:border-outline-sub">
                      @for (step of designSystemSteps; track step.path) {
                        <a
                          [routerLink]="step.route"
                          routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                          (click)="sectionSelect.emit('design-system')"
                          [title]="step.label"
                          class="btn-m3 w-full flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main text-xs">
                          <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ step.icon }}</span>
                          <span class="hidden md:inline truncate">{{ step.navLabel }}</span>
                        </a>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <a 
                routerLink="/pos"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('pos')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">point_of_sale</span>
                <span class="hidden md:inline text-sm">Punto de Venta</span>
              </a>

              <a 
                routerLink="/inventory"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('inventory')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">inventory_2</span>
                <span class="hidden md:inline text-sm">Inventario</span>
              </a>

              <a 
                routerLink="/telemetry"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('telemetry')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">sensors</span>
                <span class="hidden md:inline text-sm">Telemetría Viva</span>
              </a>

              <a 
                routerLink="/kanban"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('kanban')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">view_kanban</span>
                <span class="hidden md:inline text-sm">Kanban KDS</span>
              </a>

              <a 
                routerLink="/campus"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('campus')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">school</span>
                <span class="hidden md:inline text-sm">Campus</span>
              </a>

              <a 
                routerLink="/clinic"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('clinic')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">local_hospital</span>
                <span class="hidden md:inline text-sm">Clínica & Triaje</span>
              </a>
            </nav>
          }

          <!-- MODO TUNNEL -->
          @if (navStyle() === 'tunnel') {
            <nav class="space-y-4 pt-4 pl-2">
              <a 
                routerLink="/overview"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="sectionSelect.emit('overview')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Inicio
              </a>
              <a 
                routerLink="/agenda"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('agenda')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Agenda ({{ pendingCount() }})
              </a>
              <div class="space-y-2">
                <a 
                  routerLink="/design-system"
                  routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                  (click)="sectionSelect.emit('design-system')"
                  class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                  Design System
                </a>
                @if (currentSection() === 'design-system') {
                  <div class="pl-3 border-l border-outline-sub space-y-1.5">
                    @for (step of designSystemSteps; track step.path) {
                      <a
                        [routerLink]="step.route"
                        routerLinkActive="text-primary font-bold"
                        (click)="sectionSelect.emit('design-system')"
                        class="block text-xs text-muted hover:text-main transition-colors">
                        {{ step.navLabel }}
                      </a>
                    }
                  </div>
                }
              </div>
              <a 
                routerLink="/pos"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('pos')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Punto de Venta
              </a>
              <a 
                routerLink="/inventory"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('inventory')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Inventario
              </a>
              <a 
                routerLink="/telemetry"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('telemetry')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Telemetría
              </a>
              <a 
                routerLink="/kanban"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('kanban')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Kanban KDS
              </a>
              <a 
                routerLink="/campus"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('campus')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Campus Educativo
              </a>
              <a 
                routerLink="/clinic"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('clinic')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Clínica & Triaje
              </a>
            </nav>
          }
        </div>

        <!-- BOTÓN DE OPCIONES INFERIOR IZQUIERDO -->
        <div>
          <button 
            id="trigger-menu-bottom-left" 
            (click)="openMenu.emit('menu-bottom-left')"
            [class.invisible]="isDialogOpen() && activeTrigger() === 'menu-bottom-left'"
            [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'menu-bottom-left' ? 'dialog-transform' : null"
            class="btn-m3 w-full py-3 px-4 bg-surface-box hover:bg-surface-high border border-outline-sub rounded-full text-sm font-medium flex items-center justify-between shadow-xs cursor-pointer">
            <span class="flex items-center gap-2">
              <span class="material-symbols-rounded text-lg text-primary">tune</span>
              <span class="hidden md:inline">Opciones</span>
            </span>
            <span class="material-symbols-rounded text-sm text-muted hidden md:inline">expand_less</span>
          </button>
        </div>
      </aside>
    }

    <!-- 2. FLOATING DOCK INFERIOR (Cuando navStyle es 'dock') -->
    @if (navStyle() === 'dock') {
      <div 
        [style.view-transition-name]="activeTransition() === 'nav' ? 'nav-transform' : null"
        [class.stage-recessed]="isDialogOpen() || isHeroExpanded()"
        class="fixed bottom-5 inset-x-0 mx-auto w-fit z-30 flex items-center gap-2 bg-surface-box/90 backdrop-blur-xl border border-outline-sub p-2 rounded-full shadow-2xl">

        <a 
          routerLink="/overview"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="sectionSelect.emit('overview')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">dashboard</span>
          <span>Inicio</span>
        </a>

        <a 
          routerLink="/agenda"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('agenda')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">event_upcoming</span>
          <span>Agenda</span>
        </a>

        <a 
          routerLink="/design-system"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('design-system')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">widgets</span>
          <span>Tokens</span>
        </a>

        <a 
          routerLink="/pos"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('pos')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">point_of_sale</span>
          <span>POS</span>
        </a>

        <a 
          routerLink="/inventory"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('inventory')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">inventory_2</span>
          <span>Stock</span>
        </a>

        <a 
          routerLink="/telemetry"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('telemetry')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">sensors</span>
          <span>Flota</span>
        </a>

        <a 
          routerLink="/kanban"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('kanban')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">view_kanban</span>
          <span>KDS</span>
        </a>

        <a 
          routerLink="/campus"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('campus')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">school</span>
          <span>Campus</span>
        </a>

        <a 
          routerLink="/clinic"
          routerLinkActive="bg-sec-box text-on-sec-box px-5 font-semibold"
          (click)="sectionSelect.emit('clinic')"
          class="btn-m3 py-2.5 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3.5">
          <span class="material-symbols-rounded text-xl">local_hospital</span>
          <span>Triaje</span>
        </a>

        <div class="w-px h-6 bg-outline-sub mx-1"></div>

        <button 
          (click)="openMenu.emit('menu-bottom-left')"
          [class.invisible]="isDialogOpen() && activeTrigger() === 'menu-bottom-left'"
          [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'menu-bottom-left' ? 'dialog-transform' : null"
          class="btn-m3 p-2.5 rounded-full bg-primary text-on-primary grid place-items-center cursor-pointer">
          <span class="material-symbols-rounded text-xl">tune</span>
        </button>
      </div>
    }
  `
})
export class NavigationComponent {
  private readonly router = inject(Router);

  readonly designSystemSteps = DESIGN_SYSTEM_STEPS;
  readonly isDesignSystemOpen = signal<boolean>(false);

  readonly navStyle = input.required<NavStyle>();
  readonly currentSection = input<AppSection>('overview');
  readonly pendingCount = input.required<number>();
  readonly isDialogOpen = input.required<boolean>();
  readonly isHeroExpanded = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly activeTransition = input<TransitionType>(null);

  readonly sectionSelect = output<AppSection>();
  readonly openMenu = output<TriggerMode>();

  constructor() {
    effect(() => {
      if (this.currentSection() === 'design-system') {
        this.isDesignSystemOpen.set(true);
      }
    });
  }

  toggleDesignSystemMenu(): void {
    if (this.currentSection() !== 'design-system') {
      this.isDesignSystemOpen.set(true);
      this.sectionSelect.emit('design-system');
      void this.router.navigate(['/design-system/styles']);
      return;
    }

    this.isDesignSystemOpen.update(open => !open);
  }
}
