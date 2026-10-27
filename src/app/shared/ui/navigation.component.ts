import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppSection, NavStyle, TransitionType, TriggerMode } from '../models/ui.models';

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
        class="flex flex-col justify-between transition-all duration-300 shrink-0">

        <div class="space-y-6">
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

              <a 
                routerLink="/design-system"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                (click)="sectionSelect.emit('design-system')"
                class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                <span class="material-symbols-rounded text-xl">widgets</span>
                <span class="hidden md:inline text-sm">Design System</span>
              </a>

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
              <a 
                routerLink="/design-system"
                routerLinkActive="text-primary text-2xl font-extrabold tracking-tight translate-x-1"
                (click)="sectionSelect.emit('design-system')"
                class="block transition-all duration-200 text-left cursor-pointer text-muted hover:text-main text-base font-medium">
                Design System
              </a>
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
  readonly navStyle = input.required<NavStyle>();
  readonly currentSection = input<AppSection>('overview');
  readonly pendingCount = input.required<number>();
  readonly isDialogOpen = input.required<boolean>();
  readonly isHeroExpanded = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly activeTransition = input<TransitionType>(null);

  readonly sectionSelect = output<AppSection>();
  readonly openMenu = output<TriggerMode>();
}
