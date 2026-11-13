import { Component, computed, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdaptiveLayoutService, WindowSizeClass } from '../../../core/layout/adaptive-layout.service';
import {
  A11Y_FOUNDATION_SPECS,
  CANONICAL_LAYOUT_SPECS,
  CONTENT_DESIGN_PAIRS,
  HEIGHT_BREAKPOINT_3_SPECS,
  INPUT_MODALITY_SPECS,
  MATERIAL_AZ_GLOSSARY,
  RTL_ICON_RULES,
  WIDTH_BREAKPOINT_5_SPECS
} from './foundations-specs.data';

/**
 * Laboratory page for Step 2 (Foundations): Layout (5 Breakpoints, Canonical Layouts, LTR/RTL),
 * Interaction Ergonomics (48dp touch targets & 8dp spacing), Accessibility (Keyboard & ARIA),
 * Content Design, and Material A-Z Glossary — cleanly separated from Styles.
 */
@Component({
  selector: 'app-foundations-lab',
  standalone: true,
  imports: [RouterLink],
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
              5 Width Breakpoints, 3 Height Breakpoints, Canonical Layouts y Bidireccionalidad (LTR/RTL)
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              <code class="font-mono text-primary">AdaptiveLayoutService</code> clasifica el viewport real en las 5 clases oficiales de Material 3 (<code class="font-mono">compact → extra-large</code>) y ajusta márgenes (<code class="font-mono">16dp/24dp</code>), spacers y cantidad de paneles simultáneos.
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

        <!-- 1.1 Tabla visual de los 5 Breakpoints + 3 Height Breakpoints -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          @for (bp of widthBreakpoints; track bp.id) {
            <button
              type="button"
              (click)="simulatedBreakpoint.set(bp.id)"
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

        <!-- 1.2 Simulador Interactivo de Canonical Layouts (sin achicar navegador) -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-main">
                Simulador de Canonical Layouts ({{" "}}<code class="font-mono text-primary">{{ activeBreakpointSpec().label }} • {{ activeBreakpointSpec().sampleWidthPx }}px</code> )
              </div>
              <div class="text-[11px] text-muted">
                Elegí un patrón M3 y tocá cualquier Breakpoint arriba para ver cómo mutan paneles, chrome de navegación, márgenes y spacers.
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

          <!-- Lienzo simulado del Canonical Layout -->
          <div class="rounded-m3-lg bg-surface border border-outline-sub p-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span class="font-semibold text-main">
                Chrome: <code class="font-mono text-primary">{{ activeBreakpointSpec().navigationChrome }}</code>
              </span>
              <span class="font-mono text-muted">
                Outer Margin: {{ activeBreakpointSpec().marginDp }}dp • Inter-Pane Spacer: {{ activeBreakpointSpec().spacerDp }}dp
              </span>
            </div>

            <div class="flex gap-3 min-h-[150px] rounded-m3-md bg-surface-dim p-3 border border-outline-sub/70">
              <!-- Chrome lateral cuando no es Compact -->
              @if (activeSimBreakpoint() !== 'compact') {
                <div
                  [class]="activeSimBreakpoint() === 'large' || activeSimBreakpoint() === 'extra-large' ? 'w-32' : 'w-14'"
                  class="shrink-0 rounded-m3-md bg-surface-low border border-outline-sub p-2 flex flex-col justify-between transition-all">
                  <div class="space-y-1.5">
                    <div class="h-2.5 w-6 rounded-full bg-primary"></div>
                    <div class="h-2 w-full rounded bg-surface-high"></div>
                    <div class="h-2 w-4/5 rounded bg-surface-high"></div>
                  </div>
                  <span class="text-[9px] font-mono text-muted">
                    {{ activeSimBreakpoint() === 'large' || activeSimBreakpoint() === 'extra-large' ? 'Drawer / Rail+' : 'Rail' }}
                  </span>
                </div>
              }

              <!-- Panes según layout y breakpoint -->
              <div class="flex-1 flex flex-col justify-between gap-2">
                @if (selectedCanonicalLayout() === 'list-detail') {
                  <div class="flex-1 grid gap-3" [class]="activeSimBreakpoint() === 'compact' ? 'grid-cols-1' : 'grid-cols-12'">
                    <div
                      [class]="activeSimBreakpoint() === 'compact' ? 'col-span-1' : 'col-span-5'"
                      class="rounded-m3-md bg-surface-box border border-outline-sub p-3 space-y-2">
                      <div class="text-[11px] font-bold text-primary">Panel 1: Lista Maestra</div>
                      <div class="h-2.5 w-3/4 rounded bg-surface-high"></div>
                      <div class="h-2.5 w-2/3 rounded bg-surface-high"></div>
                      <div class="text-[10px] text-muted">{{ activeCanonicalSpec().compactBehavior }}</div>
                    </div>
                    @if (activeSimBreakpoint() !== 'compact') {
                      <div class="col-span-7 rounded-m3-md bg-primary-box/35 border border-primary/40 p-3 space-y-1.5">
                        <div class="text-[11px] font-bold text-main">Panel 2: Detalle Acoplado</div>
                        <p class="text-[10px] text-muted leading-snug">{{ activeCanonicalSpec().expandedBehavior }}</p>
                      </div>
                    }
                  </div>
                } @else if (selectedCanonicalLayout() === 'supporting-pane') {
                  <div class="flex-1 grid gap-3" [class]="activeSimBreakpoint() === 'compact' ? 'grid-cols-1' : 'grid-cols-12'">
                    <div
                      [class]="activeSimBreakpoint() === 'compact' ? 'col-span-1' : 'col-span-8'"
                      class="rounded-m3-md bg-surface-box border border-outline-sub p-3 space-y-1.5">
                      <div class="text-[11px] font-bold text-primary">Foco Principal (~65–70%)</div>
                      <p class="text-[10px] text-muted leading-snug">{{ activeCanonicalSpec().summary }}</p>
                    </div>
                    @if (activeSimBreakpoint() !== 'compact') {
                      <div class="col-span-4 rounded-m3-md bg-sec-box/60 border border-outline-sub p-3 space-y-1.5">
                        <div class="text-[11px] font-bold text-on-sec-box">Supporting Pane</div>
                        <p class="text-[10px] text-muted leading-snug">Ticket POS, notas o inspector contextual.</p>
                      </div>
                    }
                  </div>
                } @else {
                  <div
                    class="flex-1 grid gap-2.5"
                    [class]="activeSimBreakpoint() === 'compact'
                      ? 'grid-cols-1'
                      : activeSimBreakpoint() === 'medium'
                        ? 'grid-cols-2'
                        : activeSimBreakpoint() === 'extra-large'
                          ? 'grid-cols-4'
                          : 'grid-cols-3'">
                    @for (cardIdx of [1, 2, 3, 4]; track cardIdx) {
                      <div class="rounded-m3-md bg-surface-box border border-outline-sub p-2.5 flex flex-col justify-between">
                        <span class="text-[10px] font-bold text-primary">Feed Card #{{ cardIdx }}</span>
                        <span class="text-[10px] text-muted">Fluye según columnas</span>
                      </div>
                    }
                  </div>
                }

                @if (activeSimBreakpoint() === 'compact') {
                  <div class="h-7 rounded-full bg-surface-box border border-outline-sub flex items-center justify-around text-[10px] font-mono text-primary font-bold">
                    <span>Inicio</span>
                    <span>•</span>
                    <span>Lista</span>
                    <span>•</span>
                    <span>Dock Inferior</span>
                  </div>
                }
              </div>
            </div>

            <div class="text-[11px] text-muted flex flex-wrap items-center justify-between gap-2">
              <span><strong class="text-main">En esta app:</strong> {{ activeCanonicalSpec().appRoutes }}</span>
              <span class="font-mono text-[10px]">{{ activeBreakpointSpec().devices }}</span>
            </div>
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
           CASO 3: ACCESSIBILITY — KEYBOARD ROVING FOCUS, ARIA-LIVE & FORCED COLORS
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">accessibility_new</span>
            Caso 3 • Accessibility (Teclado, Lectores de Pantalla y Preferencias del SO)
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Navegación por Teclado (<code class="font-mono text-primary">Roving Tabindex</code>), <code class="font-mono text-primary">aria-live</code> y Anillo Dual <code class="font-mono text-primary">.focus-ring-m3</code>
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

        <!-- 3.2 Los 4 Pilares de A11y -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
           CASO 4: CONTENT DESIGN & GLOSARIO MATERIAL A–Z
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">menu_book</span>
            Caso 4 • Content Design & Material A–Z
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Reglas de Microcopy (UX Writing) y Glosario Oficial del Sistema
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
                <span class="font-bold text-primary block text-[10px]">M3 CONTENT DESIGN</span>
                {{ pair.goodCopy }}
              </div>
              <p class="text-[10px] text-muted leading-snug">{{ pair.rationale }}</p>
            </div>
          }
        </div>

        <!-- 4.2 Buscador del Glosario Material A-Z -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="text-xs font-bold text-main">
              Glosario Material A–Z ({{ filteredGlossary().length }} términos)
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <input
                type="search"
                [value]="glossaryQuery()"
                (input)="glossaryQuery.set($any($event.target).value)"
                placeholder="Buscar término (ej. Pane, Inert, 48dp)..."
                aria-label="Buscar término en el glosario Material A-Z"
                class="focus-ring-m3 px-3 py-1.5 rounded-full bg-surface border border-outline-sub text-xs text-main min-w-[230px]" />

              <div class="flex flex-wrap gap-1">
                @for (cat of glossaryCategories; track cat) {
                  <button
                    type="button"
                    (click)="selectedGlossaryCategory.set(cat)"
                    [class]="selectedGlossaryCategory() === cat
                      ? 'bg-sec-box text-on-sec-box font-bold'
                      : 'bg-surface text-muted hover:text-main border border-outline-sub'"
                    class="btn-m3 focus-ring-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                    {{ cat }}
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (entry of filteredGlossary(); track entry.term) {
              <div class="p-3 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-2">
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-extrabold text-main">
                      <span class="text-primary font-mono me-1">[{{ entry.letter }}]</span>{{ entry.term }}
                    </span>
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-high text-muted shrink-0">
                      {{ entry.category }}
                    </span>
                  </div>
                  <p class="text-[11px] text-muted leading-snug">{{ entry.definition }}</p>
                </div>
                <div class="text-[10px] font-mono text-primary pt-1 border-t border-outline-sub/50">
                  {{ entry.whereUsed }}
                </div>
              </div>
            }
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
  readonly canonicalLayouts = CANONICAL_LAYOUT_SPECS;
  readonly rtlIconRules = RTL_ICON_RULES;
  readonly inputModalities = INPUT_MODALITY_SPECS;
  readonly a11ySpecs = A11Y_FOUNDATION_SPECS;
  readonly contentPairs = CONTENT_DESIGN_PAIRS;
  readonly glossaryTerms = MATERIAL_AZ_GLOSSARY;

  // Caso 1: Simulador de Canonical Layouts & LTR/RTL
  readonly simulatedBreakpoint = signal<WindowSizeClass | null>(null);
  readonly activeSimBreakpoint = computed<WindowSizeClass>(
    () => this.simulatedBreakpoint() ?? this.layoutService.windowSizeClass()
  );
  readonly selectedCanonicalLayout = signal<'list-detail' | 'supporting-pane' | 'feed'>('list-detail');
  readonly isRtlPreview = signal<boolean>(false);

  readonly activeBreakpointSpec = computed(
    () => this.widthBreakpoints.find(b => b.id === this.activeSimBreakpoint()) ?? this.widthBreakpoints[0]
  );

  readonly activeCanonicalSpec = computed(
    () => this.canonicalLayouts.find(c => c.id === this.selectedCanonicalLayout()) ?? this.canonicalLayouts[0]
  );

  // Caso 2: Touch Targets 48dp + 8dp Spacing
  readonly showHitbox = signal<boolean>(false);
  readonly useSafeTouchGap = signal<boolean>(true);
  readonly hitboxClicks = signal<number>(0);

  // Caso 3: Accessibility Roving Tabindex & aria-live
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

  // Caso 4: Material A-Z Glossary Filter
  readonly glossaryQuery = signal<string>('');
  readonly glossaryCategories = ['Todos', 'Layout', 'Interaction', 'Accessibility', 'Styles & Motion (Ref)'] as const;
  readonly selectedGlossaryCategory = signal<(typeof this.glossaryCategories)[number]>('Todos');

  readonly filteredGlossary = computed(() => {
    const query = this.glossaryQuery().trim().toLowerCase();
    const cat = this.selectedGlossaryCategory();
    return this.glossaryTerms.filter(item => {
      const matchesCat = cat === 'Todos' || item.category === cat;
      const matchesQuery =
        !query ||
        item.term.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        item.whereUsed.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  });

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
