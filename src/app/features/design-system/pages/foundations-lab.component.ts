import { Component, computed, ElementRef, inject, signal, viewChild, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdaptiveLayoutService, WindowSizeClass } from '../../../core/layout/adaptive-layout.service';
import {
  A11Y_FOUNDATION_SPECS,
  ADAPTIVE_STRATEGIES_SPECS,
  CANONICAL_LAYOUT_SPECS,
  CONTENT_DESIGN_PAIRS,
  HEIGHT_BREAKPOINT_3_SPECS,
  INPUT_MODALITY_SPECS,
  LayoutPartId,
  PARTS_OF_LAYOUT_SPECS,
  RTL_ICON_RULES,
  WIDTH_BREAKPOINT_5_SPECS
} from './foundations-specs.data';

/**
 * Laboratory page for Step 2 (Foundations — Web Focused):
 * Layout (Parts of Layout, Adaptive Design with @container, 5 Breakpoints, Canonical Layouts, LTR/RTL),
 * Interaction Ergonomics (48dp touch targets & 8dp spacing), Web Accessibility (WCAG Contrast 4.5:1/3:1,
 * Color Independence, :user-invalid + aria-describedby Forms, Roving Tabindex & aria-live),
 * and Web Content Design (+35% i18n Expansion & native Intl).
 */
@Component({
  selector: 'app-foundations-lab',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .adaptive-sim-window {
      container-type: inline-size;
      container-name: adaptive-window;
      transition: inline-size 180ms cubic-bezier(0.2, 0, 0, 1);
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

    .a11y-demo-input:user-invalid {
      border-color: var(--md-sys-color-error);
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
    <div class="space-y-8">
      <!-- =====================================================================
           BANNER PUENTE: SEPARACIÓN LIMPIA VS. STYLES
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-5 rounded-m3-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">architecture</span>
            Paso 2 • Foundations (m3.material.io/foundations)
          </div>
          <h2 class="text-title-lg-emphasized text-main">
            Estructura Adaptativa, Ergonomía Táctil, Accesibilidad y Content Design
          </h2>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Para evitar duplicaciones: <strong>Design Tokens</strong>, <strong>Customizing Color OKLCH</strong> y las opacidades de <strong>Interaction States (8%/10%/12%/16%)</strong> viven en <strong>Styles</strong>. Aquí implementamos las leyes espaciales, de entrada, accesibilidad y lenguaje de interfaz.
          </p>
        </div>

        <a
          routerLink="/design-system/styles"
          class="btn-m3 state-layer focus-ring-m3 shrink-0 px-4 py-2 rounded-full bg-sec-box text-on-sec-box text-xs font-bold flex items-center gap-1.5 no-underline cursor-pointer">
          <span class="material-symbols-rounded text-base">palette</span>
          <span>Ir a Styles (Tokens y Hovers)</span>
        </a>
      </section>

      <!-- =====================================================================
           CASO 1: LAYOUT — 5 BREAKPOINTS, CANONICAL LAYOUTS & LTR/RTL
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base">devices</span>
              Caso 1 • Layout & Adaptive Design
            </div>
            <h3 class="text-title-lg-emphasized text-main">
              Parts of Layout, Adaptive Design, 5 Breakpoints y Bidireccionalidad (LTR/RTL)
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              Basado en <code class="font-mono text-primary">parts-of-layout</code> y <code class="font-mono text-primary">adaptive-design</code> de Material 3: separamos <strong>Navigation Components</strong> (Bar/Rail/Drawer) de la <strong>Body Region</strong> (Panes Fixed/Flexible, Margin, Spacer, Drag Handle y Fold) usando <code class="font-mono">@container (inline-size)</code>.
            </p>
          </div>

          <!-- Telemetría real de ventana -->
          <div class="flex flex-wrap items-center gap-2 bg-surface-low px-3.5 py-2 rounded-m3-lg border border-outline-sub shrink-0">
            <div class="text-right">
              <div class="text-[10px] text-muted uppercase">Viewport Real</div>
              <div class="text-sm font-mono font-extrabold text-primary">
                {{ layoutService.windowWidth() }}×{{ layoutService.windowHeight() }}px
              </div>
            </div>
            <span class="h-6 w-px bg-outline-sub"></span>
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

        <!-- 1.1 Tabla visual de los 5 Breakpoints -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          @for (bp of widthBreakpoints; track bp.id) {
            <button
              type="button"
              (click)="selectBreakpointPreset(bp.id, bp.sampleWidthPx)"
              [class]="activeSimBreakpoint() === bp.id
                ? 'bg-primary-box/60 border-2 border-primary shadow-xs'
                : 'bg-surface-low border border-outline-sub hover:border-primary/40'"
              class="state-layer focus-ring-m3 p-3.5 rounded-m3-lg text-start flex flex-col justify-between space-y-2 cursor-pointer transition-all">
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-xs font-extrabold text-main">{{ bp.label }}</span>
                  @if (layoutService.windowSizeClass() === bp.id) {
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold">REAL</span>
                  }
                </div>
                <div class="text-[11px] font-mono text-primary font-bold">{{ bp.rangeDp }}</div>
                <div class="text-[10px] text-muted">{{ bp.navigationChrome }}</div>
              </div>
              <div class="pt-2 border-t border-outline-sub/60 flex items-center justify-between text-[10px] font-mono text-main">
                <span>Margin {{ bp.marginDp }}dp</span>
                <span>{{ bp.panesLabel }}</span>
              </div>
            </button>
          }
        </div>

        <!-- 1.1B Inspector Interactivo "Parts of Layout" (m3.material.io/foundations/layout/layout-overview/parts-of-layout) -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-main flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary">view_quilt</span>
                Anatomía Oficial: Parts of Layout
              </div>
              <div class="text-[11px] text-muted">
                Tocá cada parte para iluminarla en el plano arquitectónico y leer su regla M3 de tamaño, rol y separación.
              </div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-outline-sub text-primary font-bold self-start">
              Navigation vs Body Region
            </span>
          </div>

          <!-- Chips de las 8 partes oficiales -->
          <div class="flex flex-wrap gap-1.5">
            @for (part of layoutParts; track part.id) {
              <button
                type="button"
                (click)="selectedLayoutPart.set(part.id)"
                [class]="selectedLayoutPart() === part.id
                  ? 'bg-primary text-on-primary font-bold border-primary'
                  : 'bg-surface text-muted hover:text-main border-outline-sub'"
                class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-[11px] border cursor-pointer transition-colors">
                {{ part.name }}
              </button>
            }
          </div>

          <!-- Plano interactivo + ficha técnica de la parte seleccionada -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <!-- Plano arquitectónico interactivo -->
            <div class="lg:col-span-7 rounded-m3-md bg-surface border border-outline-sub p-3 space-y-2">
              <div class="flex items-center justify-between text-[10px] font-mono text-muted">
                <span>ESQUEMA ANATÓMICO M3</span>
                <span class="text-primary font-bold">{{ activeLayoutPart().region }}</span>
              </div>

              <div
                [class]="selectedLayoutPart() === 'margin'
                  ? 'ring-2 ring-primary bg-primary-box/25'
                  : 'bg-surface-dim'"
                class="relative rounded-m3-md p-3 border border-outline-sub/80 transition-all">
                <div class="text-[9px] font-mono mb-1.5 flex items-center justify-between"
                     [class]="selectedLayoutPart() === 'margin' ? 'text-primary font-bold' : 'text-muted'">
                  <span>MARGIN (16dp Compact • 24dp Medium+)</span>
                  <span>@if (selectedLayoutPart() === 'column-fold') { FOLD HINGE • 12 COLS }</span>
                </div>

                <div class="flex gap-2 min-h-[126px]">
                  <!-- Navigation Rail / Drawer -->
                  <button
                    type="button"
                    (click)="selectedLayoutPart.set('nav-rail-drawer')"
                    [class]="selectedLayoutPart() === 'nav-rail-drawer'
                      ? 'border-2 border-primary bg-primary-box/55 text-on-primary-box'
                      : 'border border-outline-sub bg-surface-low text-muted'"
                    class="w-16 shrink-0 rounded-m3-md p-2 flex flex-col justify-between text-start cursor-pointer transition-all">
                    <span class="text-[9px] font-mono font-bold">Nav Rail</span>
                    <span class="text-[9px] font-mono opacity-80">80dp</span>
                  </button>

                  <!-- Body Region (Panes + Spacer + Drag Handle + Fold) -->
                  <div
                    [class]="selectedLayoutPart() === 'body-region'
                      ? 'ring-2 ring-primary bg-primary-box/20'
                      : 'bg-surface'"
                    class="flex-1 rounded-m3-md border border-outline-sub p-2 flex flex-col justify-between gap-2 transition-all">
                    <div class="flex items-center justify-between text-[9px] font-mono text-muted">
                      <span>BODY REGION</span>
                      <span>@if (selectedLayoutPart() === 'column-fold') { Columns: 4 / 8 / 12 }</span>
                    </div>

                    <div class="flex-1 flex items-stretch gap-1.5">
                      <!-- Fixed Pane -->
                      <button
                        type="button"
                        (click)="selectedLayoutPart.set('pane')"
                        [class]="selectedLayoutPart() === 'pane'
                          ? 'border-2 border-primary bg-primary-box/45'
                          : 'border border-outline-sub bg-surface-low'"
                        class="w-2/5 rounded-m3-sm p-2 text-start flex flex-col justify-between cursor-pointer transition-all">
                        <span class="text-[10px] font-bold text-main">Fixed Pane</span>
                        <span class="text-[9px] font-mono text-muted">320–412dp</span>
                      </button>

                      <!-- Spacer + Drag Handle + Fold -->
                      <button
                        type="button"
                        (click)="selectedLayoutPart.set(selectedLayoutPart() === 'spacer' ? 'drag-handle' : 'spacer')"
                        [class]="selectedLayoutPart() === 'spacer' || selectedLayoutPart() === 'drag-handle' || selectedLayoutPart() === 'column-fold'
                          ? 'border-2 border-primary bg-primary-box/65'
                          : 'border border-dashed border-outline-sub bg-surface-dim'"
                        class="w-7 shrink-0 rounded-m3-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                        title="Spacer 24dp con Drag Handle">
                        <span class="h-6 w-1 rounded-full bg-primary"></span>
                        <span class="text-[8px] font-mono text-primary font-bold">24dp</span>
                      </button>

                      <!-- Flexible Pane -->
                      <button
                        type="button"
                        (click)="selectedLayoutPart.set('pane')"
                        [class]="selectedLayoutPart() === 'pane'
                          ? 'border-2 border-primary bg-primary-box/45'
                          : 'border border-outline-sub bg-surface-low'"
                        class="flex-1 rounded-m3-sm p-2 text-start flex flex-col justify-between cursor-pointer transition-all">
                        <span class="text-[10px] font-bold text-main">Flexible Pane</span>
                        <span class="text-[9px] font-mono text-muted">1fr / expandible</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Navigation Bar (Compact Bottom) -->
                <button
                  type="button"
                  (click)="selectedLayoutPart.set('nav-bar')"
                  [class]="selectedLayoutPart() === 'nav-bar'
                    ? 'border-2 border-primary bg-primary-box/55 text-main font-bold'
                    : 'border border-outline-sub bg-surface text-muted'"
                  class="mt-2 w-full h-7 rounded-full px-3 flex items-center justify-between text-[9px] font-mono cursor-pointer transition-all">
                  <span>Navigation Bar (Compact &lt;600dp)</span>
                  <span>80dp altura</span>
                </button>
              </div>
            </div>

            <!-- Ficha técnica de la parte activa -->
            <div class="lg:col-span-5 rounded-m3-md bg-surface border border-outline-sub p-4 flex flex-col justify-between space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-extrabold text-main">{{ activeLayoutPart().name }}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sec-box text-on-sec-box font-bold">
                    {{ activeLayoutPart().region }}
                  </span>
                </div>
                <div class="text-[11px] font-mono text-primary font-semibold bg-primary-box/30 px-2.5 py-1.5 rounded-m3-sm">
                  {{ activeLayoutPart().sizingRule }}
                </div>
                <p class="text-xs text-muted leading-relaxed">{{ activeLayoutPart().role }}</p>
                <div class="p-2.5 rounded-m3-sm bg-surface-low border border-outline-sub/80 text-[11px] text-main leading-snug">
                  <strong class="text-primary">Regla M3:</strong> {{ activeLayoutPart().designRule }}
                </div>
              </div>
              <div class="text-[10px] font-mono text-muted pt-2 border-t border-outline-sub/60">
                En nuestra app: <span class="text-main font-semibold">{{ activeLayoutPart().exampleInApp }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 1.2 Simulador Interactivo "Adaptive Design" (Ventana Redimensionable + @container + Drag Handle + Fold) -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-4">
          <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-main">
                Simulador Adaptive Design & Canonical Layouts ({{" "}}<code class="font-mono text-primary">{{ activeBreakpointSpec().label }} • {{ effectiveSimWidthPx() }}px</code> )
              </div>
              <div class="text-[11px] text-muted">
                Mové el ancho de ventana, arrastrá el <strong>Drag Handle</strong> entre paneles o activá el <strong>Fold</strong> para observar <strong>Show & Hide</strong>, <strong>Levitate</strong> y <strong>Reflow</strong> con CSS <code class="font-mono text-primary">&#64;container (inline-size)</code>.
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5">
              @for (layout of canonicalLayouts; track layout.id) {
                <button
                  type="button"
                  (click)="selectedCanonicalLayout.set(layout.id)"
                  [class]="selectedCanonicalLayout() === layout.id
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface text-muted hover:text-main border border-outline-sub'"
                  class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-xs cursor-pointer">
                  {{ layout.name }}
                </button>
              }
            </div>
          </div>

          <!-- Barra de controles de ventana: Slider continuo + Fold + Split Handle + Reset -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 rounded-m3-md bg-surface border border-outline-sub items-center">
            <div class="lg:col-span-6 space-y-1.5">
              <div class="flex items-center justify-between text-[11px]">
                <label for="adaptive-width-slider" class="font-bold text-main">
                  Ancho de Ventana Simulada
                </label>
                <span class="font-mono text-primary font-bold">
                  {{ effectiveSimWidthPx() }}px ({{ activeBreakpointSpec().label }})
                </span>
              </div>
              <input
                id="adaptive-width-slider"
                type="range"
                min="340"
                max="1680"
                step="10"
                [value]="effectiveSimWidthPx()"
                (input)="onWidthSliderChange($event)"
                class="w-full accent-primary cursor-pointer" />
              <div class="flex justify-between text-[9px] font-mono text-muted">
                <span>340px Compact</span>
                <span>600 Medium</span>
                <span>840 Expanded</span>
                <span>1200 Large</span>
                <span>1600+ XL</span>
              </div>
            </div>

            <div class="lg:col-span-6 flex flex-wrap items-center justify-start lg:justify-end gap-2">
              <button
                type="button"
                (click)="simulateFold.set(!simulateFold())"
                [class]="simulateFold()
                  ? 'bg-sec-box text-on-sec-box border-primary font-bold'
                  : 'bg-surface-low text-muted border-outline-sub hover:text-main'"
                class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-[11px] border flex items-center gap-1.5 cursor-pointer">
                <span class="material-symbols-rounded text-sm">splitscreen_left</span>
                <span>{{ simulateFold() ? 'Fold: ON (Bisagra)' : 'Simular Fold (Bisagra)' }}</span>
              </button>

              @if (activeSimBreakpoint() !== 'compact' && selectedCanonicalLayout() !== 'feed') {
                <div class="flex items-center gap-1 bg-surface-low border border-outline-sub rounded-full px-2 py-1 text-[10px] font-mono">
                  <span class="text-muted px-1">Split {{ paneSplitPercent() }}/{{ 100 - paneSplitPercent() }}</span>
                  <button
                    type="button"
                    (click)="adjustPaneSplit(-5)"
                    class="w-6 h-6 rounded-full bg-surface hover:bg-primary-box/40 text-main font-bold cursor-pointer"
                    aria-label="Reducir Pane 1">
                    -
                  </button>
                  <button
                    type="button"
                    (click)="adjustPaneSplit(5)"
                    class="w-6 h-6 rounded-full bg-surface hover:bg-primary-box/40 text-main font-bold cursor-pointer"
                    aria-label="Ampliar Pane 1">
                    +
                  </button>
                </div>
              }

              <button
                type="button"
                (click)="resetWindowSimulation()"
                class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-[11px] bg-surface-low border border-outline-sub text-main hover:border-primary cursor-pointer">
                Viewport Real
              </button>
            </div>
          </div>

          <!-- Escenario de Ventana con scroll horizontal seguro + container-type: inline-size real -->
          <div class="rounded-m3-lg bg-surface-dim/80 border border-outline-sub p-3 md:p-4 space-y-3 overflow-x-auto">
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

            <!-- Ventana simulada tipo Browser (Shrine Demo) con inline-size exacto -->
            <div
              class="adaptive-sim-window mx-auto rounded-m3-xl bg-surface border-2 border-outline-sub shadow-sm overflow-hidden"
              [style.inline-size.px]="effectiveSimWidthPx()">
              <!-- Barra superior tipo navegador -->
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

              <!-- Contenido interno con Margin real (16px Compact / 24px Medium+) -->
              <div
                [style.padding.px]="activeBreakpointSpec().marginDp"
                class="relative flex gap-3 min-h-[220px] bg-surface-dim/40">
                <!-- Navigation Chrome Lateral: Rail en Medium/Expanded, Persistent Drawer en Large/XL -->
                @if (activeSimBreakpoint() !== 'compact') {
                  <aside
                    [class]="activeSimBreakpoint() === 'large' || activeSimBreakpoint() === 'extra-large' ? 'w-36' : 'w-16'"
                    class="shrink-0 rounded-m3-lg bg-surface-low border border-outline-sub p-2.5 flex flex-col justify-between transition-all">
                    <div class="space-y-2">
                      <div class="flex items-center gap-1.5">
                        <span class="material-symbols-rounded text-base text-primary">diamond</span>
                        @if (activeSimBreakpoint() === 'large' || activeSimBreakpoint() === 'extra-large') {
                          <span class="text-[11px] font-extrabold tracking-wide text-main">SHRINE</span>
                        }
                      </div>
                      <div class="space-y-1">
                        <div class="px-2 py-1 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold flex items-center gap-1.5">
                          <span class="material-symbols-rounded text-xs">favorite</span>
                          @if (activeSimBreakpoint() === 'large' || activeSimBreakpoint() === 'extra-large') {
                            <span>Featured</span>
                          }
                        </div>
                        <div class="px-2 py-1 rounded-full text-muted text-[10px] flex items-center gap-1.5">
                          <span class="material-symbols-rounded text-xs">checkroom</span>
                          @if (activeSimBreakpoint() === 'large' || activeSimBreakpoint() === 'extra-large') {
                            <span>Apparel</span>
                          }
                        </div>
                      </div>
                    </div>
                    <span class="text-[9px] font-mono text-muted">
                      {{ activeSimBreakpoint() === 'large' || activeSimBreakpoint() === 'extra-large' ? 'Drawer 220dp+' : 'Rail 80dp' }}
                    </span>
                  </aside>
                }

                <!-- Body Region -->
                <div class="flex-1 min-w-0 flex flex-col justify-between gap-3">
                  @if (selectedCanonicalLayout() === 'list-detail') {
                    <div
                      #splitContainer
                      class="adaptive-split-container flex-1 flex"
                      [class]="activeSimBreakpoint() === 'compact' ? 'flex-col gap-3' : 'flex-row items-stretch'">
                      <!-- Pane 1: Galería / Lista (Fixed/Resizable) -->
                      <div
                        [style.flex-basis.%]="activeSimBreakpoint() === 'compact' ? null : paneSplitPercent()"
                        [class]="activeSimBreakpoint() === 'compact' ? 'w-full' : 'shrink-0'"
                        class="rounded-m3-lg bg-surface-box border border-outline-sub p-3 flex flex-col justify-between gap-2">
                        <div class="flex items-center justify-between gap-1">
                          <span class="text-[11px] font-bold text-primary">Pane 1: Media / Lista</span>
                          <span class="text-[9px] font-mono text-muted">
                            {{ activeSimBreakpoint() === 'compact' ? 'Reflow 100%' : paneSplitPercent() + '% Fixed' }}
                          </span>
                        </div>
                        <div class="h-20 rounded-m3-md bg-gradient-to-br from-primary-box/60 via-surface-low to-sec-box/60 border border-outline-sub/60 flex items-center justify-center text-[10px] font-mono text-main">
                          Flow Shirt • Galería
                        </div>
                        <div class="text-[10px] text-muted leading-snug">
                          {{ activeSimBreakpoint() === 'compact' ? activeCanonicalSpec().compactBehavior : activeCanonicalSpec().expandedBehavior }}
                        </div>
                      </div>

                      <!-- Spacer (24dp) + Interactive Drag Handle + Fold Hinge -->
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
                          [class]="simulateFold() ? 'w-8 bg-sec-box/45 border-x border-dashed border-primary' : 'w-6'"
                          class="focus-ring-m3 shrink-0 flex flex-col items-center justify-center cursor-col-resize select-none group rounded-m3-sm transition-colors">
                          <span
                            [class]="isDraggingSpacer() ? 'bg-primary h-12 w-1.5' : 'bg-outline-sub group-hover:bg-primary h-10 w-1'"
                            class="rounded-full transition-all"></span>
                          <span class="text-[8px] font-mono text-primary font-bold mt-1">
                            {{ simulateFold() ? 'FOLD' : '24dp' }}
                          </span>
                        </div>
                      }

                      <!-- Pane 2: Detalle Flexible (Shrine Product Card + Show & Hide + Levitate) -->
                      @if (activeSimBreakpoint() !== 'compact' || simulateFold()) {
                        <div class="flex-1 min-w-0 rounded-m3-lg bg-surface border border-outline-sub p-3 flex flex-col justify-between gap-2 relative">
                          <div class="flex items-start justify-between gap-2">
                            <div>
                              <div class="text-[9px] font-mono text-muted">Featured › Apparel › Tops</div>
                              <div class="text-sm font-extrabold text-main">Flow Shirt Blouse</div>
                            </div>
                            <span class="text-xs font-mono font-extrabold text-primary">$240</span>
                          </div>

                          <div class="flex flex-wrap items-center gap-1 text-[9px] font-mono">
                            <span class="px-1.5 py-0.5 rounded bg-surface-low border border-outline-sub">00</span>
                            <span class="px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold">06</span>
                            <span class="px-1.5 py-0.5 rounded bg-surface-low border border-outline-sub">10</span>
                            <span class="px-1.5 py-0.5 rounded bg-surface-low border border-outline-sub">14</span>
                          </div>

                          <!-- Show & Hide por CSS @container (min-width: 840px) -->
                          <div class="adaptive-pane-meta-extra p-2 rounded-m3-sm bg-surface-low border border-outline-sub/70 text-[10px] text-muted">
                            <strong class="text-primary">Show &amp; Hide (&#64;container ≥840px):</strong> Detalles y reseñas visibles porque el contenedor supera Expanded.
                          </div>

                          <div class="flex items-center justify-between gap-2 pt-1">
                            <span class="px-2.5 py-1 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                              Add to basket
                            </span>
                            <!-- Levitate Pill -->
                            <span class="adaptive-levitate-badge px-2.5 py-1 rounded-full bg-sec-box text-on-sec-box text-[9px] font-mono font-bold shadow-xs">
                            </span>
                          </div>
                        </div>
                      }
                    </div>
                  } @else if (selectedCanonicalLayout() === 'supporting-pane') {
                    <div
                      #splitContainer
                      class="adaptive-split-container flex-1 flex"
                      [class]="activeSimBreakpoint() === 'compact' ? 'flex-col gap-3' : 'flex-row items-stretch'">
                      <div
                        [style.flex-basis.%]="activeSimBreakpoint() === 'compact' ? null : paneSplitPercent()"
                        [class]="activeSimBreakpoint() === 'compact' ? 'w-full' : 'shrink-0'"
                        class="rounded-m3-lg bg-surface-box border border-outline-sub p-3 space-y-2">
                        <div class="flex items-center justify-between gap-1">
                          <span class="text-[11px] font-bold text-primary">Primary Work Pane</span>
                          <span class="text-[9px] font-mono text-muted">
                            {{ activeSimBreakpoint() === 'compact' ? '100%' : paneSplitPercent() + '%' }}
                          </span>
                        </div>
                        <p class="text-[10px] text-muted leading-snug">{{ activeCanonicalSpec().summary }}</p>
                      </div>

                      @if (activeSimBreakpoint() !== 'compact') {
                        <div
                          role="separator"
                          tabindex="0"
                          aria-label="Divisor Supporting Pane"
                          aria-valuemin="30"
                          aria-valuemax="70"
                          [attr.aria-valuenow]="paneSplitPercent()"
                          (pointerdown)="startSpacerDrag($event)"
                          (pointermove)="onSpacerDrag($event)"
                          (pointerup)="stopSpacerDrag()"
                          (pointercancel)="stopSpacerDrag()"
                          (keydown)="handleSpacerKeydown($event)"
                          [class]="simulateFold() ? 'w-8 bg-sec-box/45 border-x border-dashed border-primary' : 'w-6'"
                          class="focus-ring-m3 shrink-0 flex flex-col items-center justify-center cursor-col-resize select-none">
                          <span class="h-10 w-1 rounded-full bg-primary"></span>
                          <span class="text-[8px] font-mono text-primary font-bold mt-1">{{ simulateFold() ? 'FOLD' : '24dp' }}</span>
                        </div>

                        <div class="flex-1 min-w-[140px] rounded-m3-lg bg-sec-box/60 border border-outline-sub p-3 space-y-1.5">
                          <div class="text-[11px] font-bold text-on-sec-box">Supporting Pane</div>
                          <p class="text-[10px] text-muted leading-snug">Ticket POS, resumen o notas persistentes.</p>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="adaptive-feed-grid flex-1">
                      @for (cardIdx of [1, 2, 3, 4]; track cardIdx) {
                        <div class="rounded-m3-md bg-surface-box border border-outline-sub p-2.5 flex flex-col justify-between gap-2">
                          <span class="text-[10px] font-bold text-primary">Feed Card #{{ cardIdx }}</span>
                          <span class="text-[10px] text-muted">Reflow automático vía &#64;container</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Navigation Bar inferior en Compact -->
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

          <!-- Estrategias Oficiales de Adaptive Design (Show & Hide, Levitate, Reflow, Fold) -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2.5">
            @for (strategy of adaptiveStrategies; track strategy.id) {
              <div class="p-3 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-1.5">
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-1">
                    <span class="text-[11px] font-extrabold text-main">{{ strategy.name }}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary-box/50 text-primary font-bold">
                      {{ strategy.badge }}
                    </span>
                  </div>
                  <p class="text-[10px] text-muted leading-snug">{{ strategy.m3Rule }}</p>
                </div>
                <div class="text-[9px] font-mono text-primary pt-1 border-t border-outline-sub/50">
                  {{ strategy.webImplementation }}
                </div>
              </div>
            }
          </div>

          <!-- Height Breakpoints en 3 mini-tarjetas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            @for (hb of heightBreakpoints; track hb.id) {
              <div
                [class]="layoutService.heightSizeClass() === hb.id
                  ? 'border-primary bg-primary-box/30'
                  : 'border-outline-sub bg-surface'"
                class="p-3 rounded-m3-md border space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">{{ hb.label }}</span>
                  <span class="text-[10px] font-mono text-primary font-bold">{{ hb.rangeDp }}</span>
                </div>
                <div class="text-[10px] text-muted">{{ hb.layoutImpact }}</div>
              </div>
            }
          </div>
        </div>

        <!-- 1.3 Bidireccionalidad LTR / RTL & Propiedades Lógicas -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-main flex items-center gap-1.5">
                <span class="material-symbols-rounded text-base text-primary">format_textdirection_r_to_l</span>
                Bidireccionalidad (LTR ↔ RTL) y Propiedades CSS Lógicas
              </div>
              <p class="text-[11px] text-muted">
                Usar <code class="font-mono text-primary">margin-inline</code> / <code class="font-mono text-primary">padding-inline</code> (<code class="font-mono">ps-*</code>, <code class="font-mono">border-s-*</code>) permite espejar toda la interfaz sin CSS duplicado.
              </p>
            </div>

            <button
              type="button"
              (click)="isRtlPreview.update(v => !v)"
              [class]="isRtlPreview() ? 'bg-primary text-on-primary' : 'bg-surface-high text-main'"
              class="btn-m3 focus-ring-m3 shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-base">swap_horiz</span>
              <span>{{ isRtlPreview() ? 'Dirección Activa: RTL' : 'Dirección Activa: LTR' }}</span>
            </button>
          </div>

          <div
            [attr.dir]="isRtlPreview() ? 'rtl' : 'ltr'"
            class="p-4 rounded-m3-md bg-surface border border-outline-sub space-y-3">
            <div class="flex items-center justify-between gap-3 border-s-4 border-primary ps-3 py-1">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-primary rtl:-scale-x-100">arrow_back</span>
                <div class="text-start">
                  <div class="text-xs font-bold text-main">
                    {{ isRtlPreview() ? 'Vista Espejada (dir="rtl")' : 'Vista Estándar (dir="ltr")' }}
                  </div>
                  <div class="text-[11px] text-muted">
                    El borde <code class="font-mono">border-s-4</code> y la flecha direccional se invierten; el reloj no.
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 text-muted">
                <span class="material-symbols-rounded text-base" title="No se espeja">schedule</span>
                <span class="material-symbols-rounded text-base text-primary" title="No se espeja">check_circle</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5" dir="ltr">
              @for (rule of rtlIconRules; track rule.icon) {
                <div class="p-2.5 rounded-m3-md bg-surface-low border border-outline-sub space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="material-symbols-rounded text-base text-primary">{{ rule.icon }}</span>
                    <span
                      [class]="rule.shouldMirror
                        ? 'bg-primary-box text-on-primary-box'
                        : 'bg-surface-high text-muted'"
                      class="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                      {{ rule.shouldMirror ? 'ESPEJAR EN RTL' : 'NO ESPEJAR' }}
                    </span>
                  </div>
                  <div class="text-[11px] font-bold text-main">{{ rule.label }}</div>
                  <div class="text-[10px] text-muted leading-snug">{{ rule.reason }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- =====================================================================
           CASO 2: INTERACTION — TOUCH TARGETS 48DP, 8DP GAP, INPUTS & SELECTION
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">ads_click</span>
            Caso 2 • Interaction: Ergonomía Táctil, Inputs & Selection
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Hitbox Mínimo <code class="font-mono text-primary">48×48dp</code>, Separación <code class="font-mono text-primary">≥8dp</code> y Modalidades de Entrada
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Un icono visual compacto de 28px mantiene limpio el diseño mientras <code class="font-mono text-primary">.touch-target-48</code> expande su zona táctil a 48×48dp con <code class="font-mono">min-inline-size</code> / <code class="font-mono">min-block-size</code> y al menos <code class="font-mono">8dp</code> de distancia entre controles adyacentes.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- 2.1 Probador 48x48dp + Comparador 8dp gap -->
          <div class="lg:col-span-5 p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">Tester Interactivo 48×48dp + Gap 8dp</span>
                <span class="text-[10px] font-mono text-muted">WCAG 2.2 / M3</span>
              </div>

              <div class="p-4 bg-surface rounded-m3-md border border-outline-sub flex items-center justify-between gap-4">
                <div class="relative py-3 px-4 flex items-center" [class]="useSafeTouchGap() ? 'gap-3' : 'gap-0'">
                  <button
                    type="button"
                    (click)="hitboxClicks.update(c => c + 1)"
                    [class.touch-target-debug]="showHitbox()"
                    aria-label="Probar área táctil 48dp"
                    class="touch-target-48 state-layer focus-ring-m3 w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center cursor-pointer shadow-xs">
                    <span class="material-symbols-rounded text-sm">touch_app</span>
                  </button>
                  <button
                    type="button"
                    (click)="hitboxClicks.update(c => c + 1)"
                    [class.touch-target-debug]="showHitbox()"
                    aria-label="Control adyacente de prueba"
                    class="touch-target-48 state-layer focus-ring-m3 w-7 h-7 rounded-full bg-sec-box text-on-sec-box grid place-items-center cursor-pointer shadow-xs">
                    <span class="material-symbols-rounded text-sm">edit</span>
                  </button>
                </div>

                <div class="text-right">
                  <div class="text-[11px] text-muted">Taps detectados:</div>
                  <div class="text-2xl font-bold font-mono text-primary">{{ hitboxClicks() }}</div>
                </div>
              </div>

              <p class="text-[11px] text-muted leading-snug">
                @if (useSafeTouchGap()) {
                  Con separación <strong class="text-main">≥ 8dp</strong>, ambas áreas táctiles respiran sin solaparse.
                } @else {
                  <strong class="text-error">Sin gap (0dp):</strong> los hitboxes invisibles de 48×48dp se pisan y generan toques erróneos.
                }
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                (click)="showHitbox.update(v => !v)"
                class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-on-primary cursor-pointer">
                {{ showHitbox() ? 'Ocultar Hitbox' : 'Mostrar Hitbox 48dp' }}
              </button>
              <button
                type="button"
                (click)="useSafeTouchGap.update(v => !v)"
                class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-high text-main cursor-pointer">
                {{ useSafeTouchGap() ? 'Simular 0dp (Solapado)' : 'Aplicar ≥8dp Gap' }}
              </button>
            </div>
          </div>

          <!-- 2.2 Matriz de 4 Modalidades de Input & Selection -->
          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (mod of inputModalities; track mod.id) {
              <div class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub space-y-2">
                <div class="flex items-center gap-2 text-xs font-bold text-main">
                  <span class="material-symbols-rounded text-base text-primary">{{ mod.icon }}</span>
                  <span>{{ mod.title }}</span>
                </div>
                <div class="text-[11px] text-muted leading-snug">
                  <strong class="text-main">Target:</strong> {{ mod.targetRule }}
                </div>
                <div class="text-[11px] text-muted leading-snug">
                  <strong class="text-main">Selección:</strong> {{ mod.selectionPattern }}
                </div>
                <div class="pt-1 border-t border-outline-sub/60 text-[10px] font-mono text-primary">
                  {{ mod.webPlatformRule }}
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- =====================================================================
           CASO 3: ACCESSIBILITY WEB — CONTRASTE WCAG, FORMULARIOS :user-invalid, ROVING TABINDEX
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">accessibility_new</span>
            Caso 3 • Web Accessibility (WCAG 2.2, Formularios &amp; Teclado)
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Contraste <code class="font-mono text-primary">4.5:1 / 3:1</code>, Formularios (<code class="font-mono text-primary">:user-invalid</code> + <code class="font-mono text-primary">aria-describedby</code>) y <code class="font-mono text-primary">Roving Tabindex</code>
          </h3>
        </div>

        <!-- 3.1 Playground Interactivo de Roving Tabindex + aria-live -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="text-xs font-bold text-main">
                Probá usar <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">Tab</kbd> para entrar al grupo y <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">←</kbd> <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">→</kbd> + <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">Enter</kbd>
              </div>
              <p class="text-[11px] text-muted">
                Un grupo de opciones usa <strong>un solo tab stop</strong> (<code class="font-mono">tabindex="0"</code> en el ítem activo y <code class="font-mono">-1</code> en el resto) para no obligar al usuario a tabular 20 veces.
              </p>
            </div>
            <span class="text-[11px] font-mono text-primary font-bold">
              {{ lastKeyboardAnnouncement() }}
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Modo de entrega de orden"
            class="flex flex-wrap gap-2.5 pt-1">
            @for (option of rovingOptions; track option.id; let idx = $index) {
              <button
                #rovingItem
                type="button"
                role="radio"
                [attr.aria-checked]="selectedRovingIndex() === idx"
                [attr.tabindex]="focusedRovingIndex() === idx ? 0 : -1"
                (click)="activateRovingOption(idx, 'Click / Enter')"
                (keydown)="handleRovingKeydown($event, idx)"
                [class]="selectedRovingIndex() === idx
                  ? 'bg-primary text-on-primary font-bold'
                  : 'bg-surface text-main border border-outline-sub'"
                class="btn-m3 state-layer focus-ring-m3 px-4 py-2 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
                <span class="material-symbols-rounded text-base">{{ option.icon }}</span>
                <span>{{ option.label }}</span>
              </button>
            }
          </div>

          <!-- Región viva real para lectores de pantalla -->
          <div
            aria-live="polite"
            class="text-[11px] font-mono text-muted bg-surface px-3 py-2 rounded border border-outline-sub/70">
            <strong class="text-main">aria-live="polite":</strong> {{ liveRegionMessage() }}
          </div>
        </div>

        <!-- 3.2 Laboratorios Web Críticos: Contraste + No Solo Color & Formularios (:user-invalid + ARIA) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Contraste WCAG & Color Independence -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-3 flex flex-col justify-between">
            <div class="space-y-2.5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">Contraste WCAG &amp; Independencia del Color</span>
                <div class="flex gap-1 text-[9px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-primary-box text-on-primary-box font-bold">Texto ≥ 4.5:1</span>
                  <span class="px-2 py-0.5 rounded bg-sec-box text-on-sec-box font-bold">UI / Ícono ≥ 3:1</span>
                </div>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Si un estado depende solo de pintar rojo o verde, falla para daltonismo y Windows <code class="font-mono">forced-colors</code>. Siempre acompañá con ícono y etiqueta explícita.
              </p>

              @if (useAccessibleErrorStyle()) {
                <div class="p-3 rounded-m3-md bg-error-box/40 border-2 border-error flex items-center gap-2.5 text-xs text-main">
                  <span class="material-symbols-rounded text-lg text-error" aria-hidden="true">error</span>
                  <div>
                    <strong class="text-error">Error de stock (WCAG OK):</strong> Quedan 0 unidades; reponé antes de facturar.
                  </div>
                </div>
              } @else {
                <div class="p-3 rounded-m3-md bg-surface border border-error/40 text-xs text-error">
                  Stock: 0 unidades (solo color rojo — sin ícono ni prefijo de estado)
                </div>
              }
            </div>

            <button
              type="button"
              (click)="useAccessibleErrorStyle.update(v => !v)"
              class="btn-m3 focus-ring-m3 self-start px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface border border-outline-sub text-main cursor-pointer">
              {{ useAccessibleErrorStyle() ? 'Ver Anti-patrón (Solo Color)' : 'Aplicar Color + Ícono + Borde 3:1' }}
            </button>
          </div>

          <!-- Formulario Web Accesible: label for + hint arriba + :user-invalid + aria-describedby -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-bold text-main">Formulario Accesible (<code class="font-mono text-primary">:user-invalid</code>)</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-outline-sub text-primary font-bold">
                aria-invalid={{ isEmailInvalid() ? 'true' : 'unset' }}
              </span>
            </div>

            <div class="space-y-1.5 bg-surface p-3 rounded-m3-md border border-outline-sub">
              <label for="a11y-demo-email" class="block text-xs font-bold text-main">
                Correo de facturación
              </label>
              <p id="a11y-demo-hint" class="text-[11px] text-muted">
                Ayuda arriba del campo para que el autocompletado no la tape. Escribí algo inválido y salí del input (<kbd class="font-mono">Tab</kbd>).
              </p>
              <input
                #a11yEmailInput
                id="a11y-demo-email"
                type="email"
                required
                autocomplete="email"
                [value]="demoEmailValue()"
                (input)="onDemoEmailInput($event)"
                (blur)="onDemoEmailBlur($event)"
                [attr.aria-invalid]="isEmailInvalid() ? 'true' : null"
                [attr.aria-describedby]="isEmailInvalid() ? 'a11y-demo-hint a11y-demo-error' : 'a11y-demo-hint'"
                placeholder="nombre@empresa.com"
                class="a11y-demo-input focus-ring-m3 w-full px-3 py-2 rounded-m3-sm bg-surface-low border border-outline-sub text-xs text-main" />

              @if (isEmailInvalid()) {
                <p id="a11y-demo-error" class="text-[11px] text-error font-medium flex items-center gap-1.5 pt-1">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">error</span>
                  <span>Ingresá un correo válido (ej. finanzas@empresa.com).</span>
                </p>
              }
            </div>
          </div>
        </div>

        <!-- 3.3 Los 6 Pilares Web de A11y -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (item of a11ySpecs; track item.id) {
            <div class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-2">
              <div class="space-y-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-main">
                  <span class="material-symbols-rounded text-base text-primary">{{ item.icon }}</span>
                  <span>{{ item.title }}</span>
                </div>
                <p class="text-[11px] text-muted leading-snug">{{ item.m3Rule }}</p>
                <p class="text-[11px] text-main leading-snug">{{ item.implementationDetail }}</p>
              </div>
              <div class="pt-1.5 border-t border-outline-sub/60 text-[10px] text-error leading-snug">
                <strong>Evitar:</strong> {{ item.antiPattern }}
              </div>
            </div>
          }
        </div>
      </section>

      <!-- =====================================================================
           CASO 4: CONTENT DESIGN & LOCALIZACIÓN WEB (EXPANSIÓN +35% E INTL)
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">menu_book</span>
            Caso 4 • Content Design &amp; Localización Web
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Microcopy (UX Writing), Tolerancia de Expansión (<code class="font-mono text-primary">+35%</code>) e <code class="font-mono text-primary">Intl</code> Nativo
          </h3>
        </div>

        <!-- 4.1 Comparador Malo vs Bueno en Content Design -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          @for (pair of contentPairs; track pair.category) {
            <div class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub space-y-2">
              <div class="text-xs font-bold text-main">{{ pair.category }}</div>
              <div class="p-2 rounded bg-error-box/40 text-[11px] text-main">
                <span class="font-bold text-error block text-[10px]">EVITAR</span>
                {{ pair.badCopy }}
              </div>
              <div class="p-2 rounded bg-primary-box/40 text-[11px] text-main">
                <span class="font-bold text-primary block text-[10px]">M3 WEB</span>
                {{ pair.goodCopy }}
              </div>
              <p class="text-[10px] text-muted leading-snug">{{ pair.rationale }}</p>
            </div>
          }
        </div>

        <!-- 4.2 Simulador Web de Expansión i18n (+35%) e Intl Nativo -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-main">
                Prueba de Resiliencia: Expansión de Texto (+35%) &amp; API <code class="font-mono text-primary">Intl</code> Web
              </div>
              <p class="text-[11px] text-muted">
                Nunca fijes ancho (<code class="font-mono">w-24</code>) en botones o tabs: usá <code class="font-mono">min-inline-size</code> / <code class="font-mono">fit-content</code> para tolerar variaciones de idioma y viewport.
              </p>
            </div>

            <button
              type="button"
              (click)="simulateTextExpansion.update(v => !v)"
              [class]="simulateTextExpansion() ? 'bg-primary text-on-primary' : 'bg-surface border border-outline-sub text-main'"
              class="btn-m3 focus-ring-m3 shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer">
              {{ simulateTextExpansion() ? 'Expansión +35%: ACTIVA' : 'Simular Texto +35%' }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-surface p-3.5 rounded-m3-md border border-outline-sub">
            <div class="space-y-1">
              <span class="text-[10px] font-mono text-error font-bold block">ANTI-PATRÓN (w-24 fijo + truncate)</span>
              <button
                type="button"
                class="w-24 truncate px-3 py-2 rounded-full bg-error-box/40 border border-error/50 text-xs font-bold text-main">
                {{ expandedCtaLabel() }}
              </button>
            </div>

            <div class="space-y-1">
              <span class="text-[10px] font-mono text-primary font-bold block">M3 WEB (inline-size flexible)</span>
              <button
                type="button"
                class="min-w-24 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold">
                {{ expandedCtaLabel() }}
              </button>
            </div>

            <div class="space-y-1 text-[11px]">
              <span class="text-[10px] font-mono text-muted block">INTL NATIVO (sin librerías)</span>
              <div class="font-mono font-bold text-main">{{ intlFormattedAmount }}</div>
              <div class="text-muted text-[10px]">{{ intlFormattedDate }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class FoundationsLabComponent {
  readonly layoutService = inject(AdaptiveLayoutService);

  readonly widthBreakpoints = WIDTH_BREAKPOINT_5_SPECS;
  readonly heightBreakpoints = HEIGHT_BREAKPOINT_3_SPECS;
  readonly layoutParts = PARTS_OF_LAYOUT_SPECS;
  readonly adaptiveStrategies = ADAPTIVE_STRATEGIES_SPECS;
  readonly canonicalLayouts = CANONICAL_LAYOUT_SPECS;
  readonly rtlIconRules = RTL_ICON_RULES;
  readonly inputModalities = INPUT_MODALITY_SPECS;
  readonly a11ySpecs = A11Y_FOUNDATION_SPECS;
  readonly contentPairs = CONTENT_DESIGN_PAIRS;

  // Caso 1: Parts of Layout, Adaptive Window Simulator, Drag Handle & LTR/RTL
  readonly selectedLayoutPart = signal<LayoutPartId>('drag-handle');
  readonly activeLayoutPart = computed(
    () => this.layoutParts.find(p => p.id === this.selectedLayoutPart()) ?? this.layoutParts[0]
  );

  readonly simulatedBreakpoint = signal<WindowSizeClass | null>(null);
  readonly simulatedWidthPx = signal<number | null>(null);
  readonly simulateFold = signal<boolean>(false);
  readonly paneSplitPercent = signal<number>(42);
  readonly isDraggingSpacer = signal<boolean>(false);
  readonly splitContainer = viewChild<ElementRef<HTMLDivElement>>('splitContainer');

  readonly activeSimBreakpoint = computed<WindowSizeClass>(
    () => this.simulatedBreakpoint() ?? this.layoutService.windowSizeClass()
  );
  readonly selectedCanonicalLayout = signal<'list-detail' | 'supporting-pane' | 'feed'>('list-detail');
  readonly isRtlPreview = signal<boolean>(false);

  readonly activeBreakpointSpec = computed(
    () => this.widthBreakpoints.find(b => b.id === this.activeSimBreakpoint()) ?? this.widthBreakpoints[0]
  );

  readonly effectiveSimWidthPx = computed<number>(() => {
    const explicitWidth = this.simulatedWidthPx();
    const activeBp = this.activeSimBreakpoint();
    if (explicitWidth !== null && this.classifyWindowWidth(explicitWidth) === activeBp) {
      return explicitWidth;
    }
    if (this.simulatedBreakpoint() === null && this.layoutService.windowWidth() >= 320) {
      return this.layoutService.windowWidth();
    }
    return this.activeBreakpointSpec().sampleWidthPx;
  });

  readonly activeCanonicalSpec = computed(
    () => this.canonicalLayouts.find(c => c.id === this.selectedCanonicalLayout()) ?? this.canonicalLayouts[0]
  );

  private classifyWindowWidth(widthPx: number): WindowSizeClass {
    if (widthPx < 600) return 'compact';
    if (widthPx < 840) return 'medium';
    if (widthPx < 1200) return 'expanded';
    if (widthPx < 1600) return 'large';
    return 'extra-large';
  }

  selectBreakpointPreset(bp: WindowSizeClass, sampleWidthPx: number): void {
    this.simulatedBreakpoint.set(bp);
    this.simulatedWidthPx.set(sampleWidthPx);
  }

  setSimulatedWidthPx(widthPx: number): void {
    const clamped = Math.max(340, Math.min(1680, Math.round(widthPx)));
    this.simulatedWidthPx.set(clamped);
    this.simulatedBreakpoint.set(this.classifyWindowWidth(clamped));
  }

  onWidthSliderChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value)) {
      this.setSimulatedWidthPx(value);
    }
  }

  resetWindowSimulation(): void {
    this.simulatedBreakpoint.set(null);
    this.simulatedWidthPx.set(null);
    this.simulateFold.set(false);
    this.paneSplitPercent.set(42);
  }

  adjustPaneSplit(delta: number): void {
    this.paneSplitPercent.update(val => Math.max(30, Math.min(70, val + delta)));
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

  // Caso 2: Touch Targets 48dp + 8dp Spacing
  readonly showHitbox = signal<boolean>(false);
  readonly useSafeTouchGap = signal<boolean>(true);
  readonly hitboxClicks = signal<number>(0);

  // Caso 3: Accessibility Roving Tabindex, Contraste Web & Formulario :user-invalid
  readonly rovingButtons = viewChildren<ElementRef<HTMLButtonElement>>('rovingItem');
  readonly rovingOptions = [
    { id: 'pickup', label: 'Retiro en Local', icon: 'storefront' },
    { id: 'delivery', label: 'Envío Express', icon: 'local_shipping' },
    { id: 'table', label: 'Servicio en Mesa', icon: 'table_restaurant' }
  ] as const;
  readonly focusedRovingIndex = signal<number>(0);
  readonly selectedRovingIndex = signal<number>(0);
  readonly lastKeyboardAnnouncement = signal<string>('Modo activo: Retiro en Local');
  readonly liveRegionMessage = signal<string>('Seleccionado: Retiro en Local');

  readonly useAccessibleErrorStyle = signal<boolean>(true);
  readonly demoEmailValue = signal<string>('');
  readonly demoEmailBlurred = signal<boolean>(false);
  readonly isEmailInvalid = signal<boolean>(false);
  readonly a11yEmailInput = viewChild<ElementRef<HTMLInputElement>>('a11yEmailInput');

  // Caso 4: Content Design (+35% i18n Expansion & Native Intl)
  readonly simulateTextExpansion = signal<boolean>(false);
  readonly expandedCtaLabel = computed(() =>
    this.simulateTextExpansion() ? 'Guardar cambios en agenda' : 'Guardar'
  );
  readonly intlFormattedAmount = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(240);
  readonly intlFormattedDate = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium'
  }).format(new Date(2026, 10, 12));

  private syncEmailValidity(input: HTMLInputElement | null | undefined): void {
    if (!input) return;
    const matchesNative = typeof input.matches === 'function' && this.supportsUserInvalidSelector()
      ? input.matches(':user-invalid')
      : false;
    const postInteractionInvalid = this.demoEmailBlurred() && !input.checkValidity();
    this.isEmailInvalid.set(matchesNative || postInteractionInvalid);
  }

  private supportsUserInvalidSelector(): boolean {
    return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('selector(:user-invalid)');
  }

  onDemoEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.demoEmailValue.set(input.value);
    if (this.demoEmailBlurred() || this.isEmailInvalid()) {
      this.syncEmailValidity(input);
    }
  }

  onDemoEmailBlur(event: Event): void {
    this.demoEmailBlurred.set(true);
    this.syncEmailValidity(event.target as HTMLInputElement);
  }

  activateRovingOption(index: number, source: string): void {
    this.focusedRovingIndex.set(index);
    this.selectedRovingIndex.set(index);
    const chosen = this.rovingOptions[index];
    this.lastKeyboardAnnouncement.set(`${source} → ${chosen.label}`);
    this.liveRegionMessage.set(`Opción seleccionada: ${chosen.label} (${index + 1} de ${this.rovingOptions.length})`);
  }

  handleRovingKeydown(event: KeyboardEvent, currentIndex: number): void {
    const total = this.rovingOptions.length;
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % total;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + total) % total;
    } else {
      return;
    }

    this.focusedRovingIndex.set(nextIndex);
    const targetBtn = this.rovingButtons()[nextIndex]?.nativeElement;
    targetBtn?.focus();
    this.lastKeyboardAnnouncement.set(`Tecla ${event.key} → foco en ${this.rovingOptions[nextIndex].label}`);
  }
}
