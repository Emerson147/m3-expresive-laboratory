import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import {
  APP_NAV_DESTINATIONS,
  APP_NAV_GROUPS,
  AppNavDestination,
  AppSection,
  DESIGN_SYSTEM_STEPS,
  NavChromeMode,
  NavStyle,
  resolveNavChrome,
  TransitionType,
  TriggerMode
} from '../models/ui.models';
import { dismissPopover, supportsNativePopover } from './top-layer.utils';

export type NavPopoverKind = 'compact-more' | 'rail-ds' | 'dock-more' | 'tunnel-switcher';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  host: {
    class: 'contents'
  },
  template: `
    @let chrome = effectiveChrome();

    <!-- 1. MODERN DETACHED NAVIGATION RAIL (>= 600dp) -->
    @if (chrome === 'rail-collapsed' || chrome === 'rail-expanded') {
      @let isExpanded = chrome === 'rail-expanded';
      <aside
        aria-label="Navegación principal"
        [style.view-transition-name]="activeTransition() === 'nav' ? 'nav-transform' : null"
        [class]="isExpanded
          ? 'w-64 bg-surface-low md:rounded-m3-xl px-3.5 py-4'
          : 'w-20 bg-surface-low md:rounded-m3-xl px-2 py-4'"
        class="flex flex-col justify-between gap-3 transition-[width] duration-(--md-sys-motion-duration-medium2) ease-(--md-sys-motion-easing-emphasized-decelerate) shrink-0 min-h-0">

        <div class="flex flex-col gap-4 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-none">
          <!-- Brand Header + Collapse/Expand Toggle -->
          <div
            [class]="isExpanded ? 'justify-between px-1.5' : 'flex-col gap-2 items-center'"
            class="flex items-center py-0.5">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-m3-md bg-primary text-on-primary font-bold grid place-items-center text-lg shadow-xs shrink-0">
                <span class="material-symbols-rounded text-2xl" aria-hidden="true">category</span>
              </div>
              @if (isExpanded) {
                <span class="font-semibold tracking-tight text-lg truncate">Expressive</span>
              }
            </div>

            <button
              type="button"
              (click)="toggleRailSize()"
              [attr.aria-expanded]="isExpanded"
              [attr.aria-label]="isExpanded ? 'Colapsar barra de navegación' : 'Expandir barra de navegación'"
              class="btn-m3 w-9 h-9 rounded-full grid place-items-center text-muted hover:bg-surface-high hover:text-main shrink-0 cursor-pointer">
              <span class="material-symbols-rounded text-xl" aria-hidden="true">
                {{ isExpanded ? 'menu_open' : 'menu' }}
              </span>
            </button>
          </div>

          <!-- Command Palette Launcher -->
          <button
            type="button"
            (click)="openCommandPalette.emit()"
            [attr.aria-label]="'Buscar módulo o comando (Ctrl+K)'"
            [class]="isExpanded
              ? 'w-full px-3.5 py-2 justify-between rounded-m3-full bg-surface hover:bg-surface-high text-muted hover:text-main'
              : 'w-11 h-11 mx-auto justify-center rounded-m3-full bg-surface hover:bg-surface-high text-muted hover:text-main'"
            class="btn-m3 flex items-center gap-2 text-xs shadow-xs cursor-pointer shrink-0">
            <span class="flex items-center gap-2 min-w-0">
              <span class="material-symbols-rounded text-lg text-primary shrink-0" aria-hidden="true">search</span>
              @if (isExpanded) {
                <span class="truncate font-medium">Ir a módulo...</span>
              }
            </span>
            @if (isExpanded) {
              <kbd class="px-1.5 py-0.5 rounded-m3-xs bg-surface-high text-[10px] font-mono text-muted shrink-0">
                ⌘K
              </kbd>
            }
          </button>

          <!-- Grouped Semantic Destinations -->
          <nav aria-label="Módulos del sistema" class="space-y-3">
            @for (group of navGroups; track group.id; let isFirst = $first) {
              <div>
                @if (isExpanded) {
                  <p class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/80">
                    {{ group.label }}
                  </p>
                } @else if (!isFirst) {
                  <div class="w-7 h-px bg-outline-sub/60 mx-auto my-2" aria-hidden="true"></div>
                }

                <ul role="list" class="list-none m-0 p-0 space-y-1">
                  @for (item of destinationsByGroup(group.id); track item.section) {
                    <li>
                      @if (item.section === 'design-system') {
                        @if (isExpanded) {
                          <button
                            type="button"
                            (click)="toggleDesignSystemMenu()"
                            [attr.aria-expanded]="isDesignSystemOpen()"
                            aria-controls="design-system-submenu"
                            [attr.aria-label]="item.label"
                            [class]="(currentSection() === 'design-system'
                              ? 'bg-sec-box/80 text-on-sec-box font-semibold shadow-xs '
                              : 'text-muted hover:bg-surface-high hover:text-main ')
                              + 'justify-between px-3.5 py-2.5'"
                            class="btn-m3 w-full flex items-center gap-3 rounded-full text-left cursor-pointer">
                            <span class="flex items-center gap-3 min-w-0">
                              <span class="material-symbols-rounded text-xl shrink-0" aria-hidden="true">{{ item.icon }}</span>
                              <span class="text-sm truncate">{{ item.label }}</span>
                            </span>
                            <span
                              class="material-symbols-rounded text-lg transition-transform m3-transition-fast shrink-0"
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
                              <ul role="list" class="list-none m-0 ml-5 pl-3 border-l border-outline-sub/70 space-y-1">
                                @for (step of designSystemSteps; track step.path) {
                                  <li>
                                    <a
                                      [routerLink]="step.route"
                                      routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                                      [ariaCurrentWhenActive]="'page'"
                                      [attr.aria-label]="step.label"
                                      class="btn-m3 w-full flex items-center gap-2.5 justify-start px-3 py-2 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main text-xs">
                                      <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ step.icon }}</span>
                                      <span class="truncate">{{ step.navLabel }}</span>
                                    </a>
                                  </li>
                                }
                              </ul>
                            </div>
                          </div>
                        } @else {
                          <!-- Collapsed Rail: Native Top-Layer Flyout Popover via CSS Anchor Positioning -->
                          <button
                            type="button"
                            style="anchor-name: --nav-rail-ds-anchor"
                            [attr.popovertarget]="supportsNativePopover ? 'rail-ds-popover' : null"
                            [attr.aria-expanded]="openPopover() === 'rail-ds'"
                            aria-controls="rail-ds-popover"
                            [attr.aria-label]="item.label"
                            (click)="onPopoverTriggerClick('rail-ds')"
                            [class]="currentSection() === 'design-system' || openPopover() === 'rail-ds'
                              ? 'bg-sec-box text-on-sec-box font-semibold shadow-xs'
                              : 'text-muted hover:bg-surface-high hover:text-main'"
                            class="btn-m3 w-full flex flex-col items-center justify-center gap-0.5 px-2 py-2.5 rounded-full cursor-pointer">
                            <span class="material-symbols-rounded text-xl shrink-0" aria-hidden="true">{{ item.icon }}</span>
                            <span class="text-[10px] font-medium leading-none tracking-tight truncate max-w-full">
                              {{ item.shortLabel }}
                            </span>
                          </button>

                          <div
                            #railDsPopover
                            id="rail-ds-popover"
                            popover="auto"
                            (toggle)="onPopoverToggle('rail-ds', $event)"
                            [class.is-fallback]="!supportsNativePopover"
                            [class.is-fallback-open]="!supportsNativePopover && openPopover() === 'rail-ds'"
                            aria-label="Pasos del Design System"
                            class="m3-nav-popover m3-nav-popover--rail-flyout p-2.5 space-y-1.5">
                            <p class="px-2.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                              Design System M3
                            </p>
                            <ul role="list" class="list-none m-0 p-0 space-y-0.5">
                              @for (step of designSystemSteps; track step.path) {
                                <li>
                                  <a
                                    [routerLink]="step.route"
                                    routerLinkActive="bg-sec-box text-on-sec-box font-semibold"
                                    [ariaCurrentWhenActive]="'page'"
                                    (click)="closeAnyPopover(railDsPopover)"
                                    class="btn-m3 flex items-center gap-2.5 px-3 py-2 rounded-m3-md text-xs text-muted hover:bg-surface-high hover:text-main cursor-pointer">
                                    <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ step.icon }}</span>
                                    <span class="truncate">{{ step.label }}</span>
                                  </a>
                                </li>
                              }
                            </ul>
                          </div>
                        }
                      } @else {
                        <a
                          [routerLink]="item.route"
                          routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
                          [routerLinkActiveOptions]="{ exact: !!item.exact }"
                          [ariaCurrentWhenActive]="'page'"
                          [attr.aria-label]="item.label"
                          [class]="isExpanded
                            ? 'justify-between px-3.5 py-2.5'
                            : 'justify-center px-2 py-2 flex-col gap-0.5 relative'"
                          class="btn-m3 w-full flex items-center rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
                          <span [class]="isExpanded ? 'flex items-center gap-3 min-w-0' : 'flex flex-col items-center gap-0.5 min-w-0'">
                            <span class="material-symbols-rounded text-xl shrink-0" aria-hidden="true">{{ item.icon }}</span>
                            @if (isExpanded) {
                              <span class="text-sm truncate">{{ item.label }}</span>
                            } @else {
                              <span class="text-[10px] font-medium leading-none tracking-tight truncate max-w-full">
                                {{ item.shortLabel }}
                              </span>
                            }
                          </span>
                          @if (item.hasPendingBadge && isExpanded) {
                            <span class="text-xs px-2 py-0.5 rounded-full bg-surface text-main font-bold shrink-0">
                              {{ pendingCount() }}
                            </span>
                          } @else if (item.hasPendingBadge && pendingCount() > 0) {
                            <span class="absolute top-1.5 right-2.5 min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold grid place-items-center leading-none">
                              {{ pendingCount() }}
                            </span>
                          }
                        </a>
                      }
                    </li>
                  }
                </ul>
              </div>
            }
          </nav>
        </div>

        <button
          id="trigger-menu-bottom-left"
          type="button"
          (click)="openMenu.emit('menu-bottom-left')"
          [class.invisible]="isDialogOpen() && activeTrigger() === 'menu-bottom-left'"
          [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'menu-bottom-left' ? 'dialog-transform' : null"
          aria-label="Opciones y apariencia"
          [class]="isExpanded ? 'px-4 justify-between' : 'px-0 justify-center'"
          class="btn-m3 w-full py-2.5 bg-surface hover:bg-surface-high rounded-full text-sm font-medium flex items-center shadow-xs cursor-pointer">
          <span class="flex items-center gap-2">
            <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">tune</span>
            @if (isExpanded) {
              <span>Opciones</span>
            }
          </span>
          @if (isExpanded) {
            <span class="material-symbols-rounded text-sm text-muted" aria-hidden="true">expand_less</span>
          }
        </button>
      </aside>
    }

    <!-- 2. MODERN TUNNEL: TOP FOCUS STRIP (Replaces fixed w-48 sidebar for full-width workbenches) -->
    @if (chrome === 'tunnel') {
      @let current = activeDestination();
      <header
        aria-label="Navegación de enfoque"
        [style.view-transition-name]="activeTransition() === 'nav' ? 'nav-transform' : null"
        class="w-full shrink-0 px-2 md:px-4 pt-2 pb-0.5 flex items-center justify-between gap-2">

        <!-- Left: Brand + Active Module Popover Switcher -->
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-8 h-8 rounded-m3-sm bg-primary text-on-primary grid place-items-center shadow-xs shrink-0" aria-hidden="true">
            <span class="material-symbols-rounded text-lg">category</span>
          </div>

          <button
            type="button"
            style="anchor-name: --nav-tunnel-switcher-anchor"
            [attr.popovertarget]="supportsNativePopover ? 'tunnel-nav-popover' : null"
            [attr.aria-expanded]="openPopover() === 'tunnel-switcher'"
            aria-controls="tunnel-nav-popover"
            aria-label="Cambiar módulo activo"
            (click)="onPopoverTriggerClick('tunnel-switcher')"
            class="btn-m3 px-3 py-1.5 rounded-m3-full bg-surface hover:bg-surface-high text-main flex items-center gap-2 text-sm font-semibold shadow-xs cursor-pointer min-w-0">
            <span class="material-symbols-rounded text-lg text-primary shrink-0" aria-hidden="true">
              {{ current.icon }}
            </span>
            <span class="truncate">{{ current.tunnelLabel ?? current.label }}</span>
            <span class="material-symbols-rounded text-base text-muted shrink-0" aria-hidden="true">
              unfold_more
            </span>
          </button>

          <div
            #tunnelPopover
            id="tunnel-nav-popover"
            popover="auto"
            (toggle)="onPopoverToggle('tunnel-switcher', $event)"
            [class.is-fallback]="!supportsNativePopover"
            [class.is-fallback-open]="!supportsNativePopover && openPopover() === 'tunnel-switcher'"
            aria-label="Selector rápido de módulos"
            class="m3-nav-popover m3-nav-popover--tunnel p-3 space-y-3">
            @for (group of navGroups; track group.id) {
              <div class="space-y-1">
                <p class="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {{ group.label }}
                </p>
                <ul role="list" class="list-none m-0 p-0 grid grid-cols-1 gap-0.5">
                  @for (item of destinationsByGroup(group.id); track item.section) {
                    <li>
                      <a
                        [routerLink]="item.route"
                        routerLinkActive="bg-sec-box text-on-sec-box font-semibold"
                        [routerLinkActiveOptions]="{ exact: !!item.exact }"
                        [ariaCurrentWhenActive]="'page'"
                        (click)="closeAnyPopover(tunnelPopover)"
                        class="btn-m3 flex items-center justify-between gap-2 px-3 py-2 rounded-m3-md text-xs text-muted hover:bg-surface-high hover:text-main cursor-pointer">
                        <span class="flex items-center gap-2.5 min-w-0">
                          <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ item.icon }}</span>
                          <span class="truncate">{{ item.tunnelLabel ?? item.label }}</span>
                        </span>
                        @if (item.hasPendingBadge && pendingCount() > 0) {
                          <span class="px-1.5 py-0.5 rounded-m3-full bg-primary text-on-primary text-[10px] font-bold">
                            {{ pendingCount() }}
                          </span>
                        }
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>

        <!-- Center: Editorial / Key Quick Pills on Wide Desktop -->
        <nav aria-label="Accesos principales de enfoque" class="hidden lg:flex items-center gap-1 bg-surface rounded-m3-full p-1 shadow-xs">
          @for (item of tunnelQuickDestinations(); track item.section) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-sec-box text-on-sec-box font-semibold"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              [ariaCurrentWhenActive]="'page'"
              class="btn-m3 px-3 py-1 rounded-m3-full text-xs text-muted hover:text-main flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-[16px]" aria-hidden="true">{{ item.icon }}</span>
              <span>{{ item.shortLabel }}</span>
            </a>
          }
        </nav>

        <!-- Right: Command Palette, Exit Focus, and Options Morph Trigger -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            (click)="openCommandPalette.emit()"
            aria-label="Abrir paleta de comandos (Ctrl+K)"
            class="btn-m3 px-2.5 py-1.5 rounded-m3-full bg-surface hover:bg-surface-high text-muted hover:text-main flex items-center gap-1.5 text-xs shadow-xs cursor-pointer">
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">search</span>
            <kbd class="hidden sm:inline font-mono text-[10px]">⌘K</kbd>
          </button>

          <button
            type="button"
            (click)="exitTunnel.emit()"
            aria-label="Volver a navegación estándar"
            class="btn-m3 px-2.5 py-1.5 rounded-m3-full bg-surface hover:bg-surface-high text-muted hover:text-main flex items-center gap-1.5 text-xs shadow-xs cursor-pointer">
            <span class="material-symbols-rounded text-base" aria-hidden="true">side_navigation</span>
            <span class="hidden sm:inline">Rail</span>
          </button>

          <button
            id="trigger-menu-bottom-left"
            type="button"
            (click)="openMenu.emit('menu-bottom-left')"
            [class.invisible]="isDialogOpen() && activeTrigger() === 'menu-bottom-left'"
            [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'menu-bottom-left' ? 'dialog-transform' : null"
            aria-label="Opciones y apariencia"
            class="btn-m3 px-3 py-1.5 bg-surface hover:bg-surface-high rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer">
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">tune</span>
            <span class="hidden sm:inline">Opciones</span>
          </button>
        </div>
      </header>
    }

    <!-- 3. COMPACT BOTTOM NAVIGATION BAR (< 600dp) -->
    @if (chrome === 'bar') {
      <div
        #compactMorePopover
        id="compact-more-popover"
        popover="auto"
        (toggle)="onPopoverToggle('compact-more', $event)"
        [class.is-fallback]="!supportsNativePopover"
        [class.is-fallback-open]="!supportsNativePopover && openPopover() === 'compact-more'"
        aria-label="Más módulos del sistema"
        class="m3-nav-popover m3-nav-popover--bar p-3.5 space-y-3">
        <div class="flex items-center justify-between gap-2 px-1">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">
            Módulos y Workbenches
          </span>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="openCommandPaletteFromPopover(compactMorePopover)"
              aria-label="Buscar módulo"
              class="btn-m3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface text-main text-xs font-semibold cursor-pointer">
              <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">search</span>
              <span>Buscar</span>
            </button>
            <button
              type="button"
              (click)="openMenuFromPopover(compactMorePopover)"
              class="btn-m3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-box text-on-primary-box text-xs font-semibold cursor-pointer">
              <span class="material-symbols-rounded text-base" aria-hidden="true">tune</span>
              <span>Opciones</span>
            </button>
          </div>
        </div>

        <ul role="list" class="list-none m-0 p-0 grid grid-cols-2 gap-1.5">
          @for (item of compactSecondaryDestinations; track item.section) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-sec-box text-on-sec-box font-semibold"
                [ariaCurrentWhenActive]="'page'"
                (click)="closeAnyPopover(compactMorePopover)"
                class="btn-m3 flex items-center gap-2.5 px-3 py-2.5 rounded-m3-md text-xs text-muted hover:bg-surface-high hover:text-main cursor-pointer">
                <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ item.icon }}</span>
                <span class="truncate">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </div>

      <nav
        aria-label="Barra de navegación compacta"
        [style.view-transition-name]="activeTransition() === 'nav' ? 'nav-transform' : null"
        class="order-last w-full shrink-0 min-h-16 bg-surface-low shadow-m3-level2 px-2 py-1.5 flex items-center justify-around gap-1 relative z-20">
        @for (item of compactPrimaryDestinations; track item.section) {
          <a
            [routerLink]="item.route"
            routerLinkActive="text-on-sec-box font-semibold [&_.nav-bar-pill]:bg-sec-box"
            [routerLinkActiveOptions]="{ exact: !!item.exact }"
            [ariaCurrentWhenActive]="'page'"
            (click)="closeAnyPopover(compactMorePopover)"
            class="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 text-muted hover:text-main cursor-pointer relative">
            <span class="nav-bar-pill w-14 h-7 rounded-full grid place-items-center transition-colors">
              <span class="material-symbols-rounded text-xl" aria-hidden="true">{{ item.icon }}</span>
            </span>
            <span class="text-[11px] leading-none truncate max-w-full">{{ item.shortLabel }}</span>
            @if (item.hasPendingBadge && pendingCount() > 0) {
              <span class="absolute top-0.5 right-3 min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold grid place-items-center">
                {{ pendingCount() }}
              </span>
            }
          </a>
        }

        <button
          type="button"
          style="anchor-name: --nav-bar-more-anchor"
          [attr.popovertarget]="supportsNativePopover ? 'compact-more-popover' : null"
          [attr.aria-expanded]="openPopover() === 'compact-more'"
          aria-controls="compact-more-popover"
          (click)="onPopoverTriggerClick('compact-more')"
          [class]="isSecondarySectionActive() || openPopover() === 'compact-more'
            ? 'text-on-sec-box font-semibold [&_.nav-bar-pill]:bg-sec-box'
            : 'text-muted hover:text-main'"
          class="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 cursor-pointer">
          <span class="nav-bar-pill w-14 h-7 rounded-full grid place-items-center transition-colors">
            <span class="material-symbols-rounded text-xl" aria-hidden="true">apps</span>
          </span>
          <span class="text-[11px] leading-none">Más</span>
        </button>
      </nav>
    }

    <!-- 4. CURATED FLOATING DOCK (Modo 'dock') -->
    @if (chrome === 'dock') {
      <div
        #dockMorePopover
        id="dock-more-popover"
        popover="auto"
        (toggle)="onPopoverToggle('dock-more', $event)"
        [class.is-fallback]="!supportsNativePopover"
        [class.is-fallback-open]="!supportsNativePopover && openPopover() === 'dock-more'"
        aria-label="Todos los módulos del sistema"
        class="m3-nav-popover m3-nav-popover--dock p-3.5 space-y-3">
        @for (group of navGroups; track group.id) {
          <div class="space-y-1.5">
            <p class="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {{ group.label }}
            </p>
            <ul role="list" class="list-none m-0 p-0 grid grid-cols-2 gap-1.5">
              @for (item of destinationsByGroup(group.id); track item.section) {
                <li>
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-sec-box text-on-sec-box font-semibold"
                    [routerLinkActiveOptions]="{ exact: !!item.exact }"
                    [ariaCurrentWhenActive]="'page'"
                    (click)="closeAnyPopover(dockMorePopover)"
                    class="btn-m3 flex items-center gap-2 px-3 py-2 rounded-m3-md text-xs text-muted hover:bg-surface-high hover:text-main cursor-pointer">
                    <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ item.icon }}</span>
                    <span class="truncate">{{ item.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <nav
        aria-label="Dock de navegación flotante"
        [style.view-transition-name]="activeTransition() === 'nav' ? 'nav-transform' : null"
        class="fixed bottom-4 inset-x-0 mx-auto w-fit max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-none z-30 flex items-center gap-1 bg-surface-high shadow-m3-level3 p-1.5 rounded-full">
        @for (item of dockDestinations(); track item.section) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-sec-box text-on-sec-box px-3.5 font-semibold"
            [routerLinkActiveOptions]="{ exact: !!item.exact }"
            [ariaCurrentWhenActive]="'page'"
            (click)="closeAnyPopover(dockMorePopover)"
            class="btn-m3 py-2 rounded-full flex items-center gap-2 text-sm cursor-pointer text-muted hover:text-main px-3 shrink-0">
            <span class="material-symbols-rounded text-xl" aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.shortLabel }}</span>
          </a>
        }

        <button
          type="button"
          style="anchor-name: --nav-dock-more-anchor"
          [attr.popovertarget]="supportsNativePopover ? 'dock-more-popover' : null"
          [attr.aria-expanded]="openPopover() === 'dock-more'"
          aria-controls="dock-more-popover"
          aria-label="Todos los módulos"
          (click)="onPopoverTriggerClick('dock-more')"
          [class]="openPopover() === 'dock-more'
            ? 'bg-sec-box text-on-sec-box font-semibold'
            : 'text-muted hover:bg-surface hover:text-main'"
          class="btn-m3 py-2 px-3 rounded-full flex items-center gap-1.5 text-sm cursor-pointer shrink-0">
          <span class="material-symbols-rounded text-xl" aria-hidden="true">apps</span>
          <span class="hidden sm:inline">Módulos</span>
        </button>

        <div class="w-px h-6 bg-outline-sub/60 mx-0.5 shrink-0" aria-hidden="true"></div>

        <button
          type="button"
          (click)="openCommandPalette.emit()"
          aria-label="Buscar módulo o comando (Ctrl+K)"
          class="btn-m3 p-2 rounded-full text-muted hover:bg-surface hover:text-main grid place-items-center cursor-pointer shrink-0">
          <span class="material-symbols-rounded text-xl" aria-hidden="true">search</span>
        </button>

        <button
          id="trigger-menu-bottom-left"
          type="button"
          (click)="openMenu.emit('menu-bottom-left')"
          [class.invisible]="isDialogOpen() && activeTrigger() === 'menu-bottom-left'"
          [style.view-transition-name]="!isDialogOpen() && activeTrigger() === 'menu-bottom-left' ? 'dialog-transform' : null"
          aria-label="Opciones y apariencia"
          class="btn-m3 p-2.5 rounded-full bg-primary text-on-primary grid place-items-center cursor-pointer shrink-0">
          <span class="material-symbols-rounded text-xl" aria-hidden="true">tune</span>
        </button>
      </nav>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent {
  private readonly router = inject(Router);
  private readonly adaptiveLayout = inject(AdaptiveLayoutService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly navGroups = APP_NAV_GROUPS;
  readonly destinations = APP_NAV_DESTINATIONS;
  readonly compactPrimaryDestinations = APP_NAV_DESTINATIONS.filter((d) => d.compactPrimary);
  readonly compactSecondaryDestinations = APP_NAV_DESTINATIONS.filter((d) => !d.compactPrimary);
  readonly designSystemSteps = DESIGN_SYSTEM_STEPS;

  readonly supportsNativePopover = supportsNativePopover();
  readonly isDesignSystemOpen = signal<boolean>(false);
  readonly openPopover = signal<NavPopoverKind | null>(null);

  readonly navStyle = input<NavStyle>('auto');
  readonly manualRailExpanded = model<boolean | null>(null);
  readonly currentSection = input<AppSection>('overview');
  readonly pendingCount = input.required<number>();
  readonly isDialogOpen = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly activeTransition = input<TransitionType>(null);

  readonly openMenu = output<TriggerMode>();
  readonly openCommandPalette = output<void>();
  readonly exitTunnel = output<void>();

  readonly effectiveChrome = computed<NavChromeMode>(() =>
    resolveNavChrome(this.navStyle(), this.adaptiveLayout.windowWidth(), this.manualRailExpanded())
  );

  readonly activeDestination = computed<AppNavDestination>(
    () => this.destinations.find((d) => d.section === this.currentSection()) ?? this.destinations[0]
  );

  readonly isSecondarySectionActive = computed(() =>
    this.compactSecondaryDestinations.some((d) => d.section === this.currentSection())
  );

  readonly dockDestinations = computed<readonly AppNavDestination[]>(() => {
    const pinned = this.destinations.filter((d) => d.dockPinned);
    const active = this.activeDestination();
    return pinned.some((d) => d.section === active.section) ? pinned : [...pinned, active];
  });

  readonly tunnelQuickDestinations = computed<readonly AppNavDestination[]>(() => {
    const core = this.destinations.filter((d) => d.group === 'core');
    const active = this.activeDestination();
    return core.some((d) => d.section === active.section) ? core : [...core, active];
  });

  constructor() {
    effect(() => {
      if (this.currentSection() === 'design-system') {
        this.isDesignSystemOpen.set(true);
      }
    });

    effect(() => {
      // Reset popover state whenever adaptive chrome breakpoint changes
      this.effectiveChrome();
      this.openPopover.set(null);
    });

    if (!this.supportsNativePopover && typeof document !== 'undefined') {
      const onDocClick = (event: MouseEvent) => {
        if (this.openPopover() && !this.hostEl.nativeElement.contains(event.target as Node)) {
          this.openPopover.set(null);
        }
      };
      const onDocKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.openPopover()) {
          this.openPopover.set(null);
        }
      };
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onDocKey);
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onDocKey);
      });
    }
  }

  destinationsByGroup(groupId: 'core' | 'workbenches'): readonly AppNavDestination[] {
    return this.destinations.filter((d) => d.group === groupId);
  }

  onPopoverToggle(kind: NavPopoverKind, event: Event): void {
    const toggleEvent = event as Event & { newState?: string };
    if (toggleEvent.newState === 'open') {
      this.openPopover.set(kind);
    } else if (this.openPopover() === kind) {
      this.openPopover.set(null);
    }
  }

  onPopoverTriggerClick(kind: NavPopoverKind): void {
    if (this.supportsNativePopover) return;
    this.openPopover.update((cur) => (cur === kind ? null : kind));
  }

  closeAnyPopover(popoverEl?: HTMLElement): void {
    dismissPopover(popoverEl, () => this.openPopover.set(null));
  }

  toggleRailSize(): void {
    this.manualRailExpanded.set(this.effectiveChrome() !== 'rail-expanded');
  }

  toggleDesignSystemMenu(): void {
    if (this.currentSection() !== 'design-system') {
      this.isDesignSystemOpen.set(true);
      void this.router.navigate(['/design-system/styles']);
      return;
    }

    this.isDesignSystemOpen.update((open) => !open);
  }

  openMenuFromPopover(popoverEl?: HTMLElement): void {
    this.closeAnyPopover(popoverEl);
    this.openMenu.emit('menu-bottom-left');
  }

  openCommandPaletteFromPopover(popoverEl?: HTMLElement): void {
    this.closeAnyPopover(popoverEl);
    this.openCommandPalette.emit();
  }
}
