import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { AdaptiveLayoutService, WindowSizeClass, classifyWindowWidth } from '../../../../core/layout/adaptive-layout.service';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SliderComponent } from '../../../../shared/components/slider/slider.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import {
  ADAPTIVE_STRATEGIES_SPECS,
  CANONICAL_LAYOUT_SPECS,
  HEIGHT_BREAKPOINT_3_SPECS,
  LayoutPartId,
  PARTS_OF_LAYOUT_SPECS,
  RTL_ICON_RULES,
  WIDTH_BREAKPOINT_5_SPECS
} from './foundations-specs.data';

@Component({
  selector: 'app-foundations-layout-section',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3ChipComponent,
    M3SliderComponent,
    M3SwitchComponent,
    M3TabsComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .adaptive-sim-window {
      container-type: inline-size;
      container-name: adaptive-window;
      transition: inline-size var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    @media (prefers-reduced-motion: reduce) {
      .adaptive-sim-window {
        transition: none;
      }
    }

    .adaptive-feed-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 0.625rem;
    }

    .adaptive-pane-meta-extra {
      display: none;
    }

    .adaptive-levitate-badge::after {
      content: 'Sheet / Modal';
    }

    @container adaptive-window (min-width: 600px) {
      .adaptive-feed-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @container adaptive-window (min-width: 840px) {
      .adaptive-feed-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .adaptive-pane-meta-extra {
        display: block;
      }
      .adaptive-levitate-badge::after {
        content: 'Floating Pill (Levitate)';
      }
    }

    @container adaptive-window (min-width: 1200px) {
      .adaptive-feed-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `],
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-5 min-w-0">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">devices</span>
            Caso 1 • Layout &amp; Adaptive Design
          </div>
          <h2 class="text-title-lg-emphasized text-main">
            Adaptive Design, 5 Breakpoints, Anatomía y LTR/RTL
          </h2>
          <p class="text-xs text-muted max-w-3xl leading-relaxed">
            Alineado con <code class="font-mono text-primary">parts-of-layout</code> y <code class="font-mono text-primary">adaptive-design</code>: usá las pestañas para probar primero la ventana adaptativa con CSS <code class="font-mono">&#64;container (inline-size)</code> o explorar las 8 regiones oficiales y el espejado lógico <code class="font-mono">LTR ↔ RTL</code>.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 bg-surface-low px-3.5 py-2 rounded-m3-lg border border-outline-sub shrink-0">
          <div class="text-right">
            <div class="text-[10px] text-muted uppercase">Viewport Real</div>
            <div class="text-sm font-mono font-extrabold text-primary">
              {{ layoutService.windowWidth() }}×{{ layoutService.windowHeight() }}px
            </div>
          </div>
          <span class="h-6 w-px bg-outline-sub" aria-hidden="true"></span>
          <div class="space-y-0.5 text-[11px]">
            <div class="font-bold text-main">
              Width: <span class="text-primary uppercase font-mono">{{ layoutService.windowSizeClass() }}</span>
            </div>
            <div class="text-muted">
              Margin {{ layoutService.marginDp() }}dp • {{ layoutService.recommendedPanes() }} panel(es)
            </div>
          </div>
        </div>
      </div>

      <m3-tabs
        variant="primary"
        idPrefix="foundations-layout-tab"
        ariaLabel="Submódulos de Layout Adaptativo"
        [tabs]="layoutTabs"
        [(value)]="activeLayoutTab" />

      <!-- TAB 1: SIMULADOR ADAPTIVE & 5 BREAKPOINTS -->
      @if (activeLayoutTab() === 'simulator') {
        <div id="foundations-layout-panel-simulator" role="tabpanel" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            @for (bp of widthBreakpoints; track bp.id) {
              <m3-card
                [interactive]="true"
                [variant]="activeSimBreakpoint() === bp.id ? 'filled' : 'outlined'"
                [tone]="activeSimBreakpoint() === bp.id ? 'primary' : 'default'"
                surface="low"
                padding="sm"
                shape="lg"
                customClass="h-full flex flex-col justify-between space-y-2 text-start"
                (action)="selectBreakpointPreset(bp.id, bp.sampleWidthPx)">
                <div class="space-y-1 w-full">
                  <div class="flex items-center justify-between gap-1">
                    <span class="text-xs font-extrabold">{{ bp.label }}</span>
                    @if (layoutService.windowSizeClass() === bp.id) {
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold">REAL</span>
                    }
                  </div>
                  <div class="text-[11px] font-mono text-primary font-bold">{{ bp.rangeDp }}</div>
                  <div class="text-[10px] opacity-80">{{ bp.navigationChrome }}</div>
                </div>
                <div class="pt-2 border-t border-outline-sub/60 flex items-center justify-between text-[10px] font-mono w-full">
                  <span>Margin {{ bp.marginDp }}dp</span>
                  <span>{{ bp.panesLabel }}</span>
                </div>
              </m3-card>
            }
          </div>

          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-4">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div class="text-xs font-bold text-main">
                  Simulador Adaptive Design &amp; Canonical Layouts (<code class="font-mono text-primary">{{ activeBreakpointSpec().label }} • {{ effectiveSimWidthPx() }}px</code>)
                </div>
                <div class="text-[11px] text-muted">
                  Deslizá el ancho de ventana, arrastrá el <strong>Drag Handle (24dp)</strong> o activá la <strong>Bisagra Fold</strong> para ver <em>Reflow</em>, <em>Show &amp; Hide</em> y <em>Levitate</em> en vivo.
                </div>
              </div>

              <div class="flex flex-wrap gap-2" role="group" aria-label="Canonical Layouts M3">
                @for (layout of canonicalLayouts; track layout.id) {
                  <m3-chip
                    type="filter"
                    [selected]="selectedCanonicalLayout() === layout.id"
                    (action)="selectedCanonicalLayout.set(layout.id)">
                    {{ layout.name }}
                  </m3-chip>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 p-3.5 rounded-m3-md bg-surface border border-outline-sub items-center">
              <div class="lg:col-span-6 space-y-1">
                <m3-slider
                  customId="adaptive-width-slider"
                  label="Ancho de Ventana Simulada"
                  unit="px"
                  size="sm"
                  [min]="340"
                  [max]="1680"
                  [step]="10"
                  [value]="effectiveSimWidthPx()"
                  (valueChange)="setSimulatedWidthPx($event)" />
                <div class="flex justify-between text-[9px] font-mono text-muted">
                  <span>340px Compact</span>
                  <span>600 Medium</span>
                  <span>840 Expanded</span>
                  <span>1200 Large</span>
                  <span>1600+ XL</span>
                </div>
              </div>

              <div class="lg:col-span-6 flex flex-wrap items-center justify-start lg:justify-end gap-3">
                <m3-switch
                  customId="adaptive-fold-switch"
                  label="Bisagra Fold"
                  iconMode="selected"
                  [(checked)]="simulateFold" />

                @if (activeSimBreakpoint() !== 'compact' && selectedCanonicalLayout() !== 'feed') {
                  <div class="flex items-center gap-1.5 bg-surface-low border border-outline-sub rounded-full px-2.5 py-1 text-[10px] font-mono">
                    <span class="text-muted">Split {{ paneSplitPercent() }}/{{ 100 - paneSplitPercent() }}</span>
                    <m3-button
                      variant="outlined"
                      size="xs"
                      icon="remove"
                      [iconOnly]="true"
                      ariaLabel="Reducir Pane 1"
                      (action)="adjustPaneSplit(-5)" />
                    <m3-button
                      variant="outlined"
                      size="xs"
                      icon="add"
                      [iconOnly]="true"
                      ariaLabel="Ampliar Pane 1"
                      (action)="adjustPaneSplit(5)" />
                  </div>
                }

                <m3-button variant="tonal" size="xs" icon="restart_alt" (action)="resetWindowSimulation()">
                  Viewport Real
                </m3-button>
              </div>
            </div>

            <div class="rounded-m3-lg bg-surface-dim/80 border border-outline-sub p-3 md:p-4 space-y-3 overflow-x-auto max-w-full min-w-0">
              <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span class="font-semibold text-main">
                  Chrome: <code class="font-mono text-primary">{{ activeBreakpointSpec().navigationChrome }}</code>
                </span>
                <div class="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                  <span class="px-2 py-0.5 rounded-full bg-surface border border-outline-sub text-main">
                    Margin {{ activeBreakpointSpec().marginDp }}dp
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-surface border border-outline-sub text-main">
                    Spacer {{ activeBreakpointSpec().spacerDp }}dp
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-primary-box/50 text-primary font-bold">
                    {{ activeSimBreakpoint() === 'compact' ? 'Reflow: Vertical Stack' : 'Show & Hide: Multi-Pane' }}
                  </span>
                </div>
              </div>

              <div
                class="adaptive-sim-window mx-auto rounded-m3-xl bg-surface border-2 border-outline-sub shadow-sm overflow-hidden"
                [style.inline-size.px]="effectiveSimWidthPx()">
                <div class="px-3 py-2 bg-surface-low border-b border-outline-sub flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-outline-sub"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-outline-sub"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-outline-sub"></span>
                    <span class="ml-2 text-[10px] font-mono text-muted truncate">
                      m3.material.io/adaptive • {{ effectiveSimWidthPx() }}px
                    </span>
                  </div>
                  <span class="text-[10px] font-mono font-bold text-primary shrink-0">
                    &#64;container {{ activeBreakpointSpec().label }}
                  </span>
                </div>

                <div
                  [style.padding.px]="activeBreakpointSpec().marginDp"
                  class="relative flex gap-3 min-h-[220px] bg-surface-dim/40">
                  @if (activeSimBreakpoint() !== 'compact') {
                    <aside
                      [class]="'shrink-0 rounded-m3-lg bg-surface-low border border-outline-sub p-2.5 flex flex-col justify-between transition-all ' + (isExpandedRail() ? 'w-36' : 'w-16')">
                      <div class="space-y-2">
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">diamond</span>
                          @if (isExpandedRail()) {
                            <span class="text-[11px] font-extrabold tracking-wide text-main">SHRINE</span>
                          }
                        </div>
                        <div class="space-y-1">
                          <div class="px-2 py-1 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold flex items-center gap-1.5">
                            <span class="material-symbols-rounded text-xs" aria-hidden="true">favorite</span>
                            @if (isExpandedRail()) {
                              <span>Featured</span>
                            }
                          </div>
                          <div class="px-2 py-1 rounded-full text-muted text-[10px] flex items-center gap-1.5">
                            <span class="material-symbols-rounded text-xs" aria-hidden="true">checkroom</span>
                            @if (isExpandedRail()) {
                              <span>Apparel</span>
                            }
                          </div>
                        </div>
                      </div>
                      <span class="text-[9px] font-mono text-muted">
                        {{ isExpandedRail() ? 'Drawer 220dp+' : 'Rail 80dp' }}
                      </span>
                    </aside>
                  }

                  <div class="flex-1 min-w-0 flex flex-col justify-between gap-3">
                    @if (selectedCanonicalLayout() === 'feed') {
                      <div class="adaptive-feed-grid flex-1">
                        @for (cardIdx of [1, 2, 3, 4]; track cardIdx) {
                          <div class="rounded-m3-md bg-surface-box border border-outline-sub p-2.5 flex flex-col justify-between gap-2">
                            <span class="text-[10px] font-bold text-primary">Feed Card #{{ cardIdx }}</span>
                            <span class="text-[10px] text-muted">Reflow automático vía &#64;container</span>
                          </div>
                        }
                      </div>
                    } @else {
                      <div
                        #splitContainer
                        [class]="'adaptive-split-container flex-1 flex ' + (activeSimBreakpoint() === 'compact' ? 'flex-col gap-3' : 'flex-row items-stretch')">
                        @if (selectedCanonicalLayout() === 'supporting-pane' || activeSimBreakpoint() !== 'compact' || simulateFold() || !compactDetailOpen()) {
                          <div
                            [style.flex-basis.%]="activeSimBreakpoint() === 'compact' ? null : paneSplitPercent()"
                            [class]="'rounded-m3-lg bg-surface-box border border-outline-sub p-3 flex flex-col justify-between gap-2 ' + (activeSimBreakpoint() === 'compact' ? 'w-full' : 'shrink-0')">
                            <div class="flex items-center justify-between gap-1">
                              <span class="text-[11px] font-bold text-primary">
                                {{ selectedCanonicalLayout() === 'list-detail' ? 'Pane 1: Media / Lista' : 'Primary Work Pane' }}
                              </span>
                              <span class="text-[9px] font-mono text-muted">
                                {{ activeSimBreakpoint() === 'compact' ? 'Reflow 100%' : paneSplitPercent() + '% Fixed' }}
                              </span>
                            </div>

                            @if (selectedCanonicalLayout() === 'list-detail') {
                              @if (activeSimBreakpoint() === 'compact' && !simulateFold()) {
                                <m3-button
                                  variant="tonal"
                                  size="sm"
                                  icon="arrow_forward"
                                  customClass="w-full justify-between"
                                  (action)="compactDetailOpen.set(true)">
                                  Flow Shirt • Ver Detalle
                                </m3-button>
                              } @else {
                                <div class="h-20 rounded-m3-md bg-gradient-to-br from-primary-box/60 via-surface-low to-sec-box/60 border border-outline-sub/60 flex items-center justify-center text-[10px] font-mono text-main">
                                  Flow Shirt • Galería
                                </div>
                              }
                              <div class="text-[10px] text-muted leading-snug">
                                {{ activeSimBreakpoint() === 'compact' ? activeCanonicalSpec().compactBehavior : activeCanonicalSpec().expandedBehavior }}
                              </div>
                            } @else {
                              <p class="text-[10px] text-muted leading-snug">{{ activeCanonicalSpec().summary }}</p>
                            }
                          </div>
                        }

                        @if (activeSimBreakpoint() !== 'compact') {
                          <div
                            role="separator"
                            tabindex="0"
                            aria-label="Divisor de paneles Spacer 24dp"
                            aria-valuemin="30"
                            aria-valuemax="70"
                            [attr.aria-valuenow]="paneSplitPercent()"
                            (pointerdown)="startSpacerDrag($event)"
                            (pointermove)="onSpacerDrag($event)"
                            (pointerup)="stopSpacerDrag()"
                            (pointercancel)="stopSpacerDrag()"
                            (keydown)="handleSpacerKeydown($event)"
                            [class]="'focus-ring-m3 shrink-0 flex flex-col items-center justify-center cursor-col-resize select-none group rounded-m3-sm transition-colors ' + (simulateFold() ? 'w-8 bg-sec-box/45 border-x border-dashed border-primary' : 'w-6')">
                            <span
                              [class]="'rounded-full transition-all ' + (isDraggingSpacer() ? 'bg-primary h-12 w-1.5' : 'bg-outline-sub group-hover:bg-primary h-10 w-1')"></span>
                            <span class="text-[8px] font-mono text-primary font-bold mt-1">
                              {{ simulateFold() ? 'FOLD' : '24dp' }}
                            </span>
                          </div>
                        }

                        @if (selectedCanonicalLayout() === 'list-detail' && (activeSimBreakpoint() !== 'compact' || simulateFold() || compactDetailOpen())) {
                          <div class="flex-1 min-w-0 rounded-m3-lg bg-surface border border-outline-sub p-3 flex flex-col justify-between gap-2 relative">
                            <div class="flex items-start justify-between gap-2">
                              <div class="space-y-0.5">
                                @if (activeSimBreakpoint() === 'compact' && !simulateFold()) {
                                  <m3-button
                                    variant="text"
                                    size="xs"
                                    icon="arrow_back"
                                    (action)="compactDetailOpen.set(false)">
                                    Volver a Lista
                                  </m3-button>
                                }
                                <div class="text-[9px] font-mono text-muted">Featured › Apparel › Tops</div>
                                <div class="text-sm font-extrabold text-main">Flow Shirt Blouse</div>
                              </div>
                              <span class="text-xs font-mono font-extrabold text-primary">$240</span>
                            </div>

                            <div class="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                              @for (sz of ['00', '06', '10', '14']; track sz) {
                                <span [class]="'px-1.5 py-0.5 rounded border ' + (sz === '06' ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-low border-outline-sub text-main')">
                                  {{ sz }}
                                </span>
                              }
                            </div>

                            <div class="adaptive-pane-meta-extra p-2 rounded-m3-sm bg-surface-low border border-outline-sub/70 text-[10px] text-muted">
                              <strong class="text-primary">Show &amp; Hide (&#64;container ≥840px):</strong> Detalles y reseñas visibles porque el contenedor supera Expanded.
                            </div>

                            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <m3-button
                                variant="filled"
                                size="xs"
                                icon="shopping_bag"
                                (action)="basketCount.update(c => c + 1)">
                                Add to basket ({{ basketCount() }})
                              </m3-button>
                              <button
                                type="button"
                                aria-label="Alternar Levitate Pill o Bottom Sheet"
                                (click)="compactSheetOpen.update(v => !v)"
                                [attr.aria-expanded]="compactSheetOpen()"
                                class="adaptive-levitate-badge state-layer focus-ring-m3 touch-target-48 px-3 py-1 rounded-full bg-sec-box text-on-sec-box text-[9px] font-mono font-bold shadow-xs cursor-pointer">
                              </button>
                            </div>

                            @if (compactSheetOpen()) {
                              <div class="mt-1 p-2.5 rounded-m3-sm bg-surface-high border border-primary/40 flex items-center justify-between gap-2 text-[10px]">
                                <span class="text-main font-semibold">
                                  {{ activeSimBreakpoint() === 'compact' ? 'Bottom Sheet / Modal activo en Compact' : 'Floating Pill / Supporting Overlay activo' }}
                                </span>
                                <m3-button variant="filled" size="xs" (action)="compactSheetOpen.set(false)">
                                  Cerrar
                                </m3-button>
                              </div>
                            }
                          </div>

                          @if (activeSimBreakpoint() === 'extra-large') {
                            <div class="w-48 shrink-0 rounded-m3-lg bg-surface-low border border-outline-sub p-3 flex flex-col justify-between gap-2">
                              <div class="text-[10px] font-bold text-primary">Pane 3 (Extra-Large)</div>
                              <p class="text-[10px] text-muted leading-snug">
                                &#8805;1600dp habilita 3 paneles simultáneos sin Drawer modal.
                              </p>
                              <span class="text-[9px] font-mono text-muted">Panel Auxiliar</span>
                            </div>
                          }
                        } @else if (selectedCanonicalLayout() === 'supporting-pane' && activeSimBreakpoint() !== 'compact') {
                          <div class="flex-1 min-w-[140px] rounded-m3-lg bg-sec-box/60 border border-outline-sub p-3 space-y-1.5">
                            <div class="text-[11px] font-bold text-on-sec-box">Supporting Pane</div>
                            <p class="text-[10px] text-muted leading-snug">Ticket POS, resumen o notas persistentes.</p>
                          </div>
                        }
                      </div>
                    }

                    @if (activeSimBreakpoint() === 'compact') {
                      <div class="h-8 rounded-full bg-surface-box border border-outline-sub flex items-center justify-around text-[10px] font-mono text-primary font-bold">
                        <span>Inicio</span>
                        <span>•</span>
                        <span>Catálogo</span>
                        <span>•</span>
                        <span>Dock Inferior</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div class="text-[11px] text-muted flex flex-wrap items-center justify-between gap-2">
                <span><strong class="text-main">En esta app:</strong> {{ activeCanonicalSpec().appRoutes }}</span>
                <span class="font-mono text-[10px]">{{ activeBreakpointSpec().devices }}</span>
              </div>
            </div>
          </m3-card>

          <!-- 5 Estrategias Adaptativas & 3 Height Breakpoints -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2.5">
            @for (strategy of adaptiveStrategies; track strategy.id) {
              <m3-card variant="outlined" surface="low" padding="sm" shape="lg" customClass="flex flex-col justify-between space-y-2">
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-1">
                    <span class="text-[11px] font-extrabold text-main">{{ strategy.name }}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary-box/50 text-primary font-bold">
                      {{ strategy.badge }}
                    </span>
                  </div>
                  <p class="text-[10px] text-muted leading-snug">{{ strategy.m3Rule }}</p>
                </div>
                <m3-button
                  variant="tonal"
                  size="xs"
                  icon="content_copy"
                  customClass="w-full justify-start"
                  (action)="copyRule.emit({ text: strategy.webImplementation, message: 'Implementación copiada: ' + strategy.name })">
                  {{ strategy.webImplementation }}
                </m3-button>
              </m3-card>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            @for (hb of heightBreakpoints; track hb.id) {
              <m3-card
                [variant]="layoutService.heightSizeClass() === hb.id ? 'filled' : 'outlined'"
                [tone]="layoutService.heightSizeClass() === hb.id ? 'primary' : 'default'"
                surface="low"
                padding="sm"
                shape="lg"
                customClass="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">{{ hb.label }}</span>
                  <span class="text-[10px] font-mono text-primary font-bold">{{ hb.rangeDp }}</span>
                </div>
                <div class="text-[10px] text-muted">{{ hb.layoutImpact }}</div>
              </m3-card>
            }
          </div>
        </div>
      }

      <!-- TAB 2: ANATOMÍA OFICIAL (8 PARTS OF LAYOUT) -->
      @if (activeLayoutTab() === 'anatomy') {
        <div id="foundations-layout-panel-anatomy" role="tabpanel" class="space-y-4">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Partes oficiales de Layout M3">
            @for (part of layoutParts; track part.id) {
              <m3-chip
                type="filter"
                [selected]="selectedLayoutPart() === part.id"
                (action)="selectedLayoutPart.set(part.id)">
                {{ part.name }}
              </m3-chip>
            }
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div class="lg:col-span-7 rounded-m3-md bg-surface-low border border-outline-sub p-3.5 space-y-2">
              <div class="flex items-center justify-between text-[10px] font-mono text-muted">
                <span>ESQUEMA ANATÓMICO M3</span>
                <span class="text-primary font-bold">{{ activeLayoutPart().region }}</span>
              </div>

              <div
                [class]="'relative rounded-m3-md p-3 border border-outline-sub/80 transition-all ' + (selectedLayoutPart() === 'margin'
                  ? 'ring-2 ring-primary bg-primary-box/25'
                  : 'bg-surface-dim')">
                <div class="text-[9px] font-mono mb-1.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    (click)="selectedLayoutPart.set('margin')"
                    [class]="'focus-ring-m3 rounded px-1 cursor-pointer ' + (selectedLayoutPart() === 'margin' ? 'text-primary font-bold underline' : 'text-muted hover:text-main')">
                    MARGIN (16dp Compact • 24dp Medium+)
                  </button>
                  <button
                    type="button"
                    (click)="selectedLayoutPart.set('column-fold')"
                    [class]="'focus-ring-m3 rounded px-1 cursor-pointer ' + (selectedLayoutPart() === 'column-fold' ? 'text-primary font-bold underline' : 'text-muted hover:text-main')">
                    {{ selectedLayoutPart() === 'column-fold' ? 'FOLD HINGE • 12 COLS' : '12 Cols / Fold' }}
                  </button>
                </div>

                <div class="flex gap-2 min-h-[126px]">
                  <button
                    type="button"
                    (click)="selectedLayoutPart.set('nav-rail-drawer')"
                    [class]="'focus-ring-m3 w-16 shrink-0 rounded-m3-md p-2 flex flex-col justify-between text-start cursor-pointer transition-all ' + (selectedLayoutPart() === 'nav-rail-drawer'
                      ? 'border-2 border-primary bg-primary-box/55 text-on-primary-box'
                      : 'border border-outline-sub bg-surface-low text-muted')">
                    <span class="text-[9px] font-mono font-bold">Nav Rail</span>
                    <span class="text-[9px] font-mono opacity-80">80dp</span>
                  </button>

                  <div
                    [class]="'flex-1 rounded-m3-md border border-outline-sub p-2 flex flex-col justify-between gap-2 transition-all ' + (selectedLayoutPart() === 'body-region'
                      ? 'ring-2 ring-primary bg-primary-box/20'
                      : 'bg-surface')">
                    <div class="flex items-center justify-between text-[9px] font-mono">
                      <button
                        type="button"
                        (click)="selectedLayoutPart.set('body-region')"
                        [class]="'focus-ring-m3 rounded px-1 cursor-pointer ' + (selectedLayoutPart() === 'body-region' ? 'text-primary font-bold underline' : 'text-muted hover:text-main')">
                        BODY REGION
                      </button>
                      <span class="text-muted">@if (selectedLayoutPart() === 'column-fold') { Columns: 4 / 8 / 12 }</span>
                    </div>

                    <div class="flex-1 flex items-stretch gap-1.5">
                      <button
                        type="button"
                        (click)="selectedLayoutPart.set('pane')"
                        [class]="'focus-ring-m3 w-2/5 rounded-m3-sm p-2 text-start flex flex-col justify-between cursor-pointer transition-all ' + (selectedLayoutPart() === 'pane'
                          ? 'border-2 border-primary bg-primary-box/45'
                          : 'border border-outline-sub bg-surface-low')">
                        <span class="text-[10px] font-bold text-main">Fixed Pane</span>
                        <span class="text-[9px] font-mono text-muted">320–412dp</span>
                      </button>

                      <button
                        type="button"
                        (click)="selectedLayoutPart.set(selectedLayoutPart() === 'spacer' ? 'drag-handle' : 'spacer')"
                        [class]="'touch-target-48 focus-ring-m3 w-7 shrink-0 rounded-m3-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ' + (selectedLayoutPart() === 'spacer' || selectedLayoutPart() === 'drag-handle' || selectedLayoutPart() === 'column-fold'
                          ? 'border-2 border-primary bg-primary-box/65'
                          : 'border border-dashed border-outline-sub bg-surface-dim')"
                        aria-label="Inspeccionar Spacer 24dp y Drag Handle">
                        <span class="h-6 w-1 rounded-full bg-primary"></span>
                        <span class="text-[8px] font-mono text-primary font-bold">24dp</span>
                      </button>

                      <button
                        type="button"
                        (click)="selectedLayoutPart.set('pane')"
                        [class]="'focus-ring-m3 flex-1 rounded-m3-sm p-2 text-start flex flex-col justify-between cursor-pointer transition-all ' + (selectedLayoutPart() === 'pane'
                          ? 'border-2 border-primary bg-primary-box/45'
                          : 'border border-outline-sub bg-surface-low')">
                        <span class="text-[10px] font-bold text-main">Flexible Pane</span>
                        <span class="text-[9px] font-mono text-muted">1fr / expandible</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="selectedLayoutPart.set('nav-bar')"
                  [class]="'touch-target-48 focus-ring-m3 mt-2 w-full h-7 rounded-full px-3 flex items-center justify-between text-[9px] font-mono cursor-pointer transition-all ' + (selectedLayoutPart() === 'nav-bar'
                    ? 'border-2 border-primary bg-primary-box/55 text-main font-bold'
                    : 'border border-outline-sub bg-surface text-muted')">
                  <span>Navigation Bar (Compact &lt;600dp)</span>
                  <span>64dp altura (M3E)</span>
                </button>
              </div>
            </div>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="lg:col-span-5 flex flex-col justify-between space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-extrabold text-main">{{ activeLayoutPart().name }}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sec-box text-on-sec-box font-bold">
                    {{ activeLayoutPart().region }}
                  </span>
                </div>
                <div class="text-[11px] font-mono text-primary font-bold">{{ activeLayoutPart().sizingRule }}</div>
                <p class="text-[11px] text-main leading-snug">
                  <strong>Rol:</strong> {{ activeLayoutPart().role }}
                </p>
                <p class="text-[11px] text-muted leading-relaxed">{{ activeLayoutPart().designRule }}</p>
              </div>

              <div class="p-2.5 rounded-m3-sm bg-surface border border-outline-sub/80 text-[10px] space-y-1.5">
                <div class="font-bold text-main">En esta aplicación / CSS Web:</div>
                <div class="font-mono text-primary">{{ activeLayoutPart().exampleInApp }}</div>
                <m3-button
                  variant="tonal"
                  size="xs"
                  icon="content_copy"
                  (action)="copyRule.emit({ text: activeLayoutPart().sizingRule, message: 'Regla copiada: ' + activeLayoutPart().name })">
                  Copiar medida
                </m3-button>
              </div>
            </m3-card>
          </div>
        </div>
      }

      <!-- TAB 3: BIDIRECCIONALIDAD LTR / RTL -->
      @if (activeLayoutTab() === 'rtl') {
        <div id="foundations-layout-panel-rtl" role="tabpanel" class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p class="text-xs text-muted max-w-2xl leading-relaxed">
              Usar <code class="font-mono text-primary">margin-inline</code> / <code class="font-mono text-primary">padding-inline</code> (<code class="font-mono">ps-*</code>, <code class="font-mono">border-s-*</code>) espeja toda la interfaz sin CSS duplicado.
            </p>

            <m3-button-group
              variant="connected"
              size="sm"
              selectionMode="single"
              ariaLabel="Dirección de lectura LTR o RTL"
              [options]="dirModeOptions"
              [value]="[isRtlPreview() ? 'rtl' : 'ltr']"
              (selectionChange)="onDirModeChange($event)" />
          </div>

          <div
            [attr.dir]="isRtlPreview() ? 'rtl' : 'ltr'"
            class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-4">
            <div class="flex items-center justify-between gap-3 border-s-4 border-primary ps-3 py-1.5 bg-surface rounded-m3-md pe-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-primary rtl:-scale-x-100" aria-hidden="true">arrow_back</span>
                <div class="text-start">
                  <div class="text-xs font-bold text-main">
                    {{ isRtlPreview() ? 'Vista Espejada (dir="rtl")' : 'Vista Estándar (dir="ltr")' }}
                  </div>
                  <div class="text-[11px] text-muted">
                    El borde <code class="font-mono">border-s-4</code> y la flecha direccional se invierten; el reloj y el check no.
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 text-muted">
                <span class="material-symbols-rounded text-base" aria-hidden="true">schedule</span>
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">check_circle</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" dir="ltr">
              @for (rule of rtlIconRules; track rule.icon) {
                <m3-card variant="outlined" surface="surface" padding="sm" shape="lg" customClass="flex flex-col justify-between space-y-2">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">{{ rule.icon }}</span>
                      <span
                        [class]="'text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ' + (rule.shouldMirror
                          ? 'bg-primary-box text-on-primary-box'
                          : 'bg-surface-high text-muted')">
                        {{ rule.shouldMirror ? 'ESPEJAR EN RTL' : 'NO ESPEJAR' }}
                      </span>
                    </div>
                    <div class="text-[11px] font-bold text-main">{{ rule.label }}</div>
                    <div class="text-[10px] text-muted leading-snug">{{ rule.reason }}</div>
                  </div>
                  <m3-button
                    variant="tonal"
                    size="xs"
                    icon="content_copy"
                    (action)="copyRule.emit({ text: rule.cssLogicalExample, message: 'CSS lógico copiado: ' + rule.label })">
                    Copiar CSS
                  </m3-button>
                </m3-card>
              }
            </div>
          </div>
        </div>
      }
    </m3-card>
  `
})
export class FoundationsLayoutSectionComponent {
  readonly layoutService = inject(AdaptiveLayoutService);
  readonly copyRule = output<ClipboardCopyPayload>();

  readonly widthBreakpoints = WIDTH_BREAKPOINT_5_SPECS;
  readonly heightBreakpoints = HEIGHT_BREAKPOINT_3_SPECS;
  readonly layoutParts = PARTS_OF_LAYOUT_SPECS;
  readonly adaptiveStrategies = ADAPTIVE_STRATEGIES_SPECS;
  readonly canonicalLayouts = CANONICAL_LAYOUT_SPECS;
  readonly rtlIconRules = RTL_ICON_RULES;

  readonly layoutTabs: M3TabItem[] = [
    { id: 'simulator', label: 'Simulador & 5 Breakpoints', icon: 'view_sidebar', panelId: 'foundations-layout-panel-simulator' },
    { id: 'anatomy', label: 'Anatomía (8 Parts)', icon: 'view_quilt', panelId: 'foundations-layout-panel-anatomy' },
    { id: 'rtl', label: 'LTR ↔ RTL Lógico', icon: 'format_textdirection_r_to_l', panelId: 'foundations-layout-panel-rtl' }
  ];

  readonly dirModeOptions: M3ButtonGroupOption[] = [
    { id: 'ltr', label: 'LTR (dir="ltr")', icon: 'format_textdirection_l_to_r' },
    { id: 'rtl', label: 'RTL (dir="rtl")', icon: 'format_textdirection_r_to_l' }
  ];

  readonly activeLayoutTab = signal<string>('simulator');
  readonly selectedLayoutPart = signal<LayoutPartId>('drag-handle');
  readonly simulatedBreakpoint = signal<WindowSizeClass | null>(null);
  readonly simulatedWidthPx = signal<number | null>(null);
  readonly simulateFold = signal<boolean>(false);
  readonly compactDetailOpen = signal<boolean>(false);
  readonly compactSheetOpen = signal<boolean>(false);
  readonly paneSplitPercent = signal<number>(42);
  readonly selectedCanonicalLayout = signal<'list-detail' | 'supporting-pane' | 'feed'>('list-detail');
  readonly isRtlPreview = signal<boolean>(false);
  readonly basketCount = signal<number>(1);

  readonly isDraggingSpacer = signal<boolean>(false);
  readonly splitContainer = viewChild<ElementRef<HTMLDivElement>>('splitContainer');

  readonly activeLayoutPart = computed(
    () => this.layoutParts.find((p) => p.id === this.selectedLayoutPart()) ?? this.layoutParts[0]
  );

  readonly activeSimBreakpoint = computed<WindowSizeClass>(
    () => this.simulatedBreakpoint() ?? this.layoutService.windowSizeClass()
  );

  readonly activeBreakpointSpec = computed(
    () => this.widthBreakpoints.find((b) => b.id === this.activeSimBreakpoint()) ?? this.widthBreakpoints[0]
  );

  readonly isExpandedRail = computed(
    () => this.activeSimBreakpoint() === 'large' || this.activeSimBreakpoint() === 'extra-large'
  );

  readonly effectiveSimWidthPx = computed<number>(() => {
    const explicitWidth = this.simulatedWidthPx();
    const activeBp = this.activeSimBreakpoint();
    if (explicitWidth !== null && classifyWindowWidth(explicitWidth) === activeBp) {
      return explicitWidth;
    }
    if (this.simulatedBreakpoint() === null && this.layoutService.windowWidth() >= 320) {
      return this.layoutService.windowWidth();
    }
    return this.activeBreakpointSpec().sampleWidthPx;
  });

  readonly activeCanonicalSpec = computed(
    () => this.canonicalLayouts.find((c) => c.id === this.selectedCanonicalLayout()) ?? this.canonicalLayouts[0]
  );

  selectBreakpointPreset(bp: WindowSizeClass, sampleWidthPx: number): void {
    this.simulatedBreakpoint.set(bp);
    this.simulatedWidthPx.set(sampleWidthPx);
  }

  setSimulatedWidthPx(widthPx: number): void {
    const clamped = Math.max(340, Math.min(1680, Math.round(widthPx)));
    this.simulatedWidthPx.set(clamped);
    this.simulatedBreakpoint.set(classifyWindowWidth(clamped));
  }

  resetWindowSimulation(): void {
    this.simulatedBreakpoint.set(null);
    this.simulatedWidthPx.set(null);
    this.simulateFold.set(false);
    this.compactDetailOpen.set(false);
    this.compactSheetOpen.set(false);
    this.paneSplitPercent.set(42);
  }

  adjustPaneSplit(delta: number): void {
    this.paneSplitPercent.update((val) => Math.max(30, Math.min(70, val + delta)));
  }

  onDirModeChange(selected: string[]): void {
    if (selected[0]) {
      this.isRtlPreview.set(selected[0] === 'rtl');
    }
  }

  startSpacerDrag(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    target?.setPointerCapture?.(event.pointerId);
    this.isDraggingSpacer.set(true);
  }

  onSpacerDrag(event: PointerEvent): void {
    if (!this.isDraggingSpacer()) return;
    const rect = this.splitContainer()?.nativeElement.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const pct = ((event.clientX - rect.left) / rect.width) * 100;
    this.paneSplitPercent.set(Math.max(30, Math.min(70, Math.round(pct))));
  }

  stopSpacerDrag(): void {
    this.isDraggingSpacer.set(false);
  }

  handleSpacerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.adjustPaneSplit(-5);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.adjustPaneSplit(5);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.paneSplitPercent.set(30);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.paneSplitPercent.set(70);
    }
  }
}
