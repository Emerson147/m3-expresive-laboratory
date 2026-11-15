import { Component, computed, inject, signal } from '@angular/core';
import { ContrastLevel, ThemeService } from '../../../core/theme/theme.service';
import {
  M3_COOKIE4_PATH,
  M3_COOKIE9_PATH,
  M3_OVAL_PATH,
  M3_PENTAGON_PATH,
  M3_PILL_PATH,
  M3_SOFT_BURST_PATH,
  M3_SUNNY_PATH,
  M3LoadingIndicatorComponent
} from '../../../shared/components/progress';
import {
  APPLYING_ELEVATION_PRINCIPLES,
  APPLYING_TYPE_RULES,
  COMPONENT_ELEVATION_MATRIX,
  ELEVATION_6_SPECS,
  SHAPE_CORNER_10_SPECS,
  SHAPE_MORPH_MECHANISMS_SPECS,
  SHAPE_PRINCIPLES_SPECS,
  STATE_LAYER_COMPONENT_RECIPES,
  STATE_OPACITY_SPECS,
  SURFACE_HIERARCHY_SPECS,
  TOKEN_ANATOMY_EXAMPLES,
  TONAL_PALETTE_FAMILIES,
  TYPEFACE_FONT_SPECS,
  TYPESCALES_30_SPECS,
  TonalPaletteFamily
} from './styles-specs.data';

type TypeCategoryFilter = 'all' | 'display' | 'headline' | 'title' | 'body' | 'label';
export type ForcedStateMode = 'live' | 'hover' | 'focus' | 'pressed' | 'dragged' | 'disabled';

/**
 * Interactive laboratory page for Step 1 (Styles & Design Tokens):
 * Documents and tests Cases 1–6 directly inside the application:
 * - Case 1: 3-Tier Token Architecture (--md-ref-* -> --md-sys-* -> --md-comp-* / @theme)
 * - Case 2: Dynamic OKLCH Color System, Tonal Palettes (0..100), 8 Surfaces, 12 Fixed Roles & 3 Contrast Levels
 * - Case 3: M3 Expressive Typography: Fonts (--md-ref-typeface-*), Applying Type & 30-Style Dual Scale
 * - Case 4: Shape System: 10-Step Corner Scale, Overview Principles & Dual Shape Morphing (Corner vs Polygon)
 * - Case 5: Elevation System: 6 Levels (0dp -> 12dp) & Applying Elevation (Why, When, How + Component Matrix)
 * - Case 6: State Layer Opacities (--md-sys-state-*) & Interactive Multi-Component Hover Playground
 */
@Component({
  selector: 'app-styles-lab',
  standalone: true,
  imports: [M3LoadingIndicatorComponent],
  template: `
    <div class="space-y-6">

      <!-- =====================================================================
           CASO 1: ARQUITECTURA DE 3 CAPAS (md.ref -> md.sys -> md.comp)
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-5 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base">account_tree</span>
              Caso 1 • Foundations: Design Tokens Overview & How to Use Tokens
            </div>
            <h3 class="text-title-lg-emphasized text-main">
              Pipeline Oficial de 3 Capas: Reference → System → Component
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              Según <code class="font-mono text-main">m3.material.io/foundations/design-tokens</code>, los componentes jamás consumen valores crudos ni tokens de referencia (<code class="font-mono text-primary">--md-ref-*</code>) directamente. Todo pasa por el puente semántico (<code class="font-mono text-primary">--md-sys-*</code>) para que el Modo Oscuro y los 3 niveles de contraste funcionen sin reescribir reglas CSS.
            </p>
          </div>

          <!-- Selector de ejemplo de anatomía -->
          <div class="flex flex-wrap gap-1.5 shrink-0">
            @for (ex of anatomyExamples; track ex.id) {
              <button
                type="button"
                (click)="selectedAnatomyId.set(ex.id)"
                [class]="selectedAnatomyId() === ex.id
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-high text-muted hover:text-main'"
                class="btn-m3 px-3 py-1.5 rounded-full text-xs cursor-pointer">
                {{ ex.category }}
              </button>
            }
          </div>
        </div>

        <!-- Anatomía visual del token seleccionado -->
        @if (activeAnatomy(); as ex) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <!-- Desglose de segmentos del nombre oficial -->
            <div class="lg:col-span-5 p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="text-xs font-bold text-main flex items-center justify-between">
                <span>Anatomía Taxonómica M3</span>
                <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-mono">{{ ex.label }}</span>
              </div>

              <div class="grid grid-cols-4 gap-1.5 text-center font-mono">
                <div class="p-2 rounded-m3-sm bg-surface-high border border-outline-sub">
                  <div class="text-[10px] text-muted uppercase">1. Prefix</div>
                  <div class="text-xs font-bold text-main mt-0.5">--{{ ex.segments.prefix }}</div>
                </div>
                <div class="p-2 rounded-m3-sm bg-primary-box text-on-primary-box">
                  <div class="text-[10px] opacity-80 uppercase">2. Tier</div>
                  <div class="text-xs font-bold mt-0.5">{{ ex.segments.tier }}</div>
                </div>
                <div class="p-2 rounded-m3-sm bg-sec-box text-on-sec-box">
                  <div class="text-[10px] opacity-80 uppercase">3. Domain</div>
                  <div class="text-xs font-bold mt-0.5">{{ ex.segments.family }}</div>
                </div>
                <div class="p-2 rounded-m3-sm bg-tertiary-box text-on-tertiary-box">
                  <div class="text-[10px] opacity-80 uppercase">4. Role</div>
                  <div class="text-[11px] font-bold mt-0.5 truncate" [title]="ex.segments.role">{{ ex.segments.role }}</div>
                </div>
              </div>

              <p class="text-[11px] text-muted leading-relaxed">
                {{ ex.whyItMatters }}
              </p>
            </div>

            <!-- Flujo de resolución en las 3 capas -->
            <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface-high text-muted">Tier 1 • Reference</span>
                  <span class="material-symbols-rounded text-sm text-muted">palette</span>
                </div>
                <div class="font-mono text-xs font-bold text-main break-all">{{ ex.refToken }}</div>
                <div class="text-[11px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 break-all">
                  {{ ex.refValue }}
                </div>
              </div>

              <div class="p-4 rounded-m3-lg bg-primary-box/35 border border-primary/40 flex flex-col justify-between space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-on-primary font-bold">Tier 2 • System</span>
                  <span class="material-symbols-rounded text-sm text-primary">hub</span>
                </div>
                <div class="font-mono text-xs font-bold text-primary break-all">{{ ex.sysToken }}</div>
                <div class="text-[11px] text-muted leading-snug">
                  Responde dinámicamente a <code class="font-mono text-main">.dark</code> y <code class="font-mono text-main">[data-contrast]</code>.
                </div>
              </div>

              <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sec-box text-on-sec-box font-bold">Tier 3 • Component</span>
                  <span class="material-symbols-rounded text-sm text-secondary">widgets</span>
                </div>
                <div class="font-mono text-xs font-bold text-main break-all">{{ ex.compOrThemeToken }}</div>
                <div class="text-[11px] text-muted leading-snug">
                  Consumido en plantillas Angular y hojas <code class="font-mono text-main">_button.css</code> / <code class="font-mono text-main">_card.css</code>.
                </div>
              </div>
            </div>
          </div>
        }
      </section>

      <!-- =====================================================================
           CASO 2: SISTEMA DE COLOR OKLCH, PALETAS TONALES, 8 SUPERFICIES & CONTRASTE
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base">colorize</span>
              Caso 2 • Color System: Tonal Palettes, 8 Surfaces, 12 Fixed Roles & 3 Contrast Levels
            </div>
            <h3 class="text-title-lg-emphasized text-main">
              Esquema Expresivo OKLCH + Control de Contraste Accesible (WCAG)
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              Mantenemos la vitalidad cromática de M3 Expressive (<code class="font-mono text-primary">0.005 → 0.022</code> en Light y <code class="font-mono text-primary">0.012 → 0.030</code> en Dark) con orden monótono estricto en las 8 superficies y soporte en vivo para los <strong>3 niveles de contraste</strong> de la guía oficial <code class="font-mono text-main">m3.material.io/styles/color/system/overview</code>.
            </p>
          </div>

          <!-- Selector interactivo de Nivel de Contraste (Standard / Medium / High) -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 bg-surface-low p-2 rounded-m3-lg border border-outline-sub shrink-0">
            <span class="text-[11px] font-bold text-muted px-2 flex items-center gap-1">
              <span class="material-symbols-rounded text-sm text-primary">contrast</span>
              Contraste M3:
            </span>
            <div class="flex items-center gap-1">
              @for (lvl of contrastLevels; track lvl.id) {
                <button
                  type="button"
                  (click)="setContrast(lvl.id)"
                  [class]="themeService.contrastLevel() === lvl.id
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'bg-surface text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs cursor-pointer">
                  {{ lvl.label }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Explorador de Paletas Tonales (Reference Tokens 0..100) -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="text-xs font-bold text-main">
                1. Paletas Tonales de Referencia (<code class="font-mono text-primary">--md-ref-palette-*</code>)
              </div>
              <div class="text-[11px] text-muted">
                Fórmula activa: <code class="font-mono text-main">{{ activePalette().hueFormula }}</code> — {{ activePalette().chromaNote }}
              </div>
            </div>

            <div class="flex flex-wrap gap-1">
              @for (pal of tonalPalettes; track pal.id) {
                <button
                  type="button"
                  (click)="selectedPaletteId.set(pal.id)"
                  [class]="selectedPaletteId() === pal.id
                    ? 'bg-sec-box text-on-sec-box font-bold border-secondary/40'
                    : 'bg-surface-low text-muted hover:text-main border-outline-sub'"
                  class="btn-m3 px-2.5 py-1 rounded-full text-[11px] border cursor-pointer">
                  {{ pal.name }}
                </button>
              }
            </div>
          </div>

          <!-- Cinta de tonos en vivo -->
          <div class="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
            @for (stop of activePalette().stops; track stop) {
              <div
                class="rounded-m3-sm p-2 min-h-[60px] flex flex-col justify-between border border-outline-sub/40 shadow-2xs transition-transform hover:scale-105"
                [style.background-color]="'var(--md-ref-palette-' + activePalette().id + stop + ')'"
                [style.color]="stop >= 60 ? 'oklch(12% 0.02 var(--seed-hue))' : 'oklch(98% 0.01 var(--seed-hue))'">
                <span class="text-[10px] font-mono font-bold">T{{ stop }}</span>
                <span class="text-[9px] font-mono opacity-80 truncate">{{ activePalette().id }}{{ stop }}</span>
              </div>
            }
          </div>
        </div>

        <!-- 8 Superficies Tonales + 12 Roles Fixed + Roles Extendidos -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Las 8 superficies tonales ordenadas -->
          <div class="lg:col-span-7 space-y-2.5">
            <div class="text-xs font-bold text-main flex items-center justify-between">
              <span>2. Jerarquía de las 8 Superficies Tonales (<code class="font-mono text-primary">--md-sys-color-surface*</code>)</span>
              <span class="text-[11px] font-mono text-muted">
                Modo actual: {{ themeService.isDarkMode() ? 'Dark (neutral4 → neutral24)' : 'Light (neutral100 → neutral87)' }}
              </span>
            </div>

            <div class="space-y-1.5">
              @for (surf of surfaceSpecs; track surf.sysToken) {
                <div
                  [style.background-color]="'var(' + surf.sysToken + ')'"
                  class="p-3 rounded-m3-md border border-outline-sub flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-main">
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold">{{ surf.name }}</span>
                      <code class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface/70 border border-outline-sub/60 text-primary">
                        .{{ surf.tailwindClass }}
                      </code>
                    </div>
                    <div class="text-[11px] text-muted">{{ surf.usage }}</div>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] font-mono shrink-0">
                    <span [class]="!themeService.isDarkMode() ? 'font-bold text-main underline' : 'text-muted'">
                      L: {{ surf.oklchLight }}
                    </span>
                    <span class="text-muted">•</span>
                    <span [class]="themeService.isDarkMode() ? 'font-bold text-main underline' : 'text-muted'">
                      D: {{ surf.oklchDark }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Roles Semánticos + 12 Roles Fixed Invariantes + Extended Custom Roles -->
          <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="text-xs font-bold text-main">
                3. Pares Contenedor / On-Container & Roles Extendidos
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="p-3 rounded-m3-md bg-primary text-on-primary text-xs font-bold flex items-center justify-between">
                  <span>Primary</span>
                  <span class="font-mono text-[10px] opacity-85">on-primary</span>
                </div>
                <div class="p-3 rounded-m3-md bg-primary-box text-on-primary-box text-xs font-bold flex items-center justify-between">
                  <span>Primary Container</span>
                  <span class="font-mono text-[10px] opacity-85">T90 / T30</span>
                </div>
                <div class="p-3 rounded-m3-md bg-sec-box text-on-sec-box text-xs font-bold flex items-center justify-between">
                  <span>Secondary Box</span>
                  <span class="font-mono text-[10px] opacity-85">+10° Hue</span>
                </div>
                <div class="p-3 rounded-m3-md bg-tertiary-box text-on-tertiary-box text-xs font-bold flex items-center justify-between">
                  <span>Tertiary Box</span>
                  <span class="font-mono text-[10px] opacity-85">+65° Hue</span>
                </div>
                <div class="p-3 rounded-m3-md bg-success-box text-on-success-box text-xs font-bold flex items-center justify-between">
                  <span>Success Box</span>
                  <span class="font-mono text-[10px] opacity-85">Hue 155°</span>
                </div>
                <div class="p-3 rounded-m3-md bg-warning-box text-on-warning-box text-xs font-bold flex items-center justify-between">
                  <span>Warning Box</span>
                  <span class="font-mono text-[10px] opacity-85">Hue 65°</span>
                </div>
                <div class="p-3 rounded-m3-md bg-error-box text-on-error-box text-xs font-bold flex items-center justify-between">
                  <span>Error Box</span>
                  <span class="font-mono text-[10px] opacity-85">Hue 25°</span>
                </div>
                <div class="p-3 rounded-m3-md bg-inverse-surface text-inverse-on-surface text-xs font-bold flex items-center justify-between">
                  <span>Inverse Surface</span>
                  <span class="font-mono text-[10px] text-inverse-primary">inverse</span>
                </div>
              </div>
            </div>

            <!-- 12 Roles Fixed (Invariantes al cambiar entre Light y Dark) -->
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm text-primary">lock</span>
                  4. Los 12 Roles Fixed (Invariantes Light/Dark)
                </span>
                <span class="text-[10px] font-mono text-muted">T90 / T80 / T10 / T30</span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                A diferencia de <code class="font-mono text-main">*-container</code>, los roles <code class="font-mono text-primary">*-fixed</code> conservan exactamente el mismo tono claro (T90/T80) con texto oscuro (T10/T30) tanto en Modo Claro como en Modo Oscuro.
              </p>
              <div class="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                <div class="p-2.5 rounded-m3-sm bg-primary-fixed text-on-primary-fixed border border-outline-sub/40">
                  <div>Primary Fixed</div>
                  <div class="text-[10px] font-normal text-on-primary-fixed-variant">on-fixed-variant</div>
                </div>
                <div class="p-2.5 rounded-m3-sm bg-secondary-fixed text-on-secondary-fixed border border-outline-sub/40">
                  <div>Secondary Fixed</div>
                  <div class="text-[10px] font-normal text-on-secondary-fixed-variant">on-fixed-variant</div>
                </div>
                <div class="p-2.5 rounded-m3-sm bg-tertiary-fixed text-on-tertiary-fixed border border-outline-sub/40">
                  <div>Tertiary Fixed</div>
                  <div class="text-[10px] font-normal text-on-tertiary-fixed-variant">on-fixed-variant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =====================================================================
           CASO 3: TIPOGRAFÍA M3 EXPRESSIVE (FONTS, APPLYING TYPE & 30-STYLE SCALE)
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base">text_fields</span>
              Caso 3 • Typography: Fonts, Applying Type & 30-Style Dual Type Scale
            </div>
            <h3 class="text-title-lg-emphasized text-main">
              1. Fuentes (<code class="font-mono text-primary">Brand vs. Plain</code>) • 2. Reglas de Aplicación • 3. Tokens (<code class="font-mono text-primary">15 Baseline + 15 Emphasized</code>)
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              Alineado con <code class="font-mono text-main">styles/typography/fonts</code>, <code class="font-mono text-main">applying-type</code> y <code class="font-mono text-main">type-scale-tokens</code>: dividimos las fuentes de referencia en <strong>Brand</strong> (<code class="font-mono">Plus Jakarta Sans</code>), <strong>Plain</strong> (<code class="font-mono">--md-ref-typeface-plain → Plus Jakarta Sans</code>) y <strong>Mono</strong> (<code class="font-mono">ui-monospace / Cascadia Code</code>), aplicamos <code class="font-mono text-primary">rem</code> para respetar el escalado de texto del sistema operativo y balanceamos titulares con <code class="font-mono">text-wrap: balance</code> y párrafos con <code class="font-mono">text-wrap: pretty</code>.
            </p>
          </div>
        </div>

        <!-- 3.1 PILAR A: FONTS & REFERENCE TYPEFACE TOKENS (styles/typography/fonts) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-main flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm text-primary">font_download</span>
              Pilar 1 • Fonts & Reference Typeface Tokens (<code class="font-mono text-primary">m3.material.io/styles/typography/fonts</code>)
            </h4>
            <span class="text-[11px] font-mono text-muted">_token.css → _typography.css</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            @for (font of typefaceFontSpecs; track font.id) {
              <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-main">{{ font.roleName }}</span>
                    <code class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-box text-on-primary-box font-bold">
                      {{ font.refToken }}
                    </code>
                  </div>
                  <div class="text-[11px] font-mono text-muted">{{ font.fontFamily }}</div>
                  <div
                    class="p-3 rounded-m3-md bg-surface border border-outline-sub/70 text-lg font-bold text-main truncate"
                    [style.font-family]="'var(' + font.refToken + ')'">
                    {{ font.sampleGlyphs }}
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="text-[11px] text-muted leading-relaxed">{{ font.rationale }}</div>
                  <div class="text-[10px] font-semibold text-primary">
                    Escalas asignadas: <span class="text-main font-mono">{{ font.assignedScales }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1 pt-1">
                    @for (w of font.weightsAvailable; track w.weight) {
                      <span
                        class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-high border border-outline-sub text-main"
                        [style.font-weight]="w.weight">
                        {{ w.weight }} • {{ w.label }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- 3.2 PILAR B: APPLYING TYPE (styles/typography/applying-type) -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 class="text-xs font-bold text-main flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm text-primary">menu_book</span>
              Pilar 2 • Cómo Aplicar las 5 Familias Tipográficas (<code class="font-mono text-primary">m3.material.io/styles/typography/applying-type</code>)
            </h4>
            <span class="text-[11px] text-muted">
              Ancho óptimo de lectura en Body: <strong class="text-main font-mono">40ch – 75ch</strong> (máximo 80ch)
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            @for (rule of applyingTypeRules; track rule.category) {
              <div class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-2.5">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="material-symbols-rounded text-base text-primary">{{ rule.icon }}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-high text-muted">
                      {{ rule.typefaceUsed }}
                    </span>
                  </div>
                  <div class="text-xs font-bold text-main">{{ rule.title }}</div>
                  <div class="text-[10px] font-mono text-primary bg-surface px-2 py-1 rounded border border-outline-sub/60">
                    {{ rule.measureAndWrap }}
                  </div>
                </div>

                <div class="space-y-1.5 text-[11px]">
                  <p class="text-muted leading-snug">
                    <strong class="text-main">Cuándo usar:</strong> {{ rule.whenToUse }}
                  </p>
                  <p class="text-muted leading-snug">
                    <strong class="text-error">Evitar:</strong> {{ rule.avoid }}
                  </p>
                  <div class="pt-1 border-t border-outline-sub/60 text-[10px] text-muted">
                    <strong class="text-main">En esta UI:</strong> {{ rule.uiExamples }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- 3.3 PILAR C: TYPE SCALE TOKENS EXPLORER (styles/typography/type-scale-tokens) -->
        <div class="space-y-3 pt-2 border-t border-outline-sub">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div class="space-y-0.5">
              <h4 class="text-xs font-bold text-main flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary">straighten</span>
                Pilar 3 • Explorador en Vivo de los 30 Type Scale Tokens (<code class="font-mono text-primary">m3.material.io/styles/typography/type-scale-tokens</code>)
              </h4>
              <p class="text-[11px] text-muted">
                Cada rol compone 5 tokens atómicos (<code class="font-mono text-main">-font</code>, <code class="font-mono text-main">-size</code> en <code class="font-mono">rem</code>, <code class="font-mono text-main">-line-height</code>, <code class="font-mono text-main">-tracking</code> y <code class="font-mono text-main">-weight</code> / <code class="font-mono text-main">-emphasized-weight</code>).
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <!-- Toggle Baseline vs Emphasized -->
              <div class="flex items-center bg-surface-low p-1 rounded-full border border-outline-sub">
                <button
                  type="button"
                  (click)="isEmphasizedType.set(false)"
                  [class]="!isEmphasizedType()
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                  Baseline (15)
                </button>
                <button
                  type="button"
                  (click)="isEmphasizedType.set(true)"
                  [class]="isEmphasizedType()
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                  Emphasized (15)
                </button>
              </div>

              <!-- Filtro de categoría -->
              <div class="flex flex-wrap gap-1">
                @for (cat of typeCategories; track cat.id) {
                  <button
                    type="button"
                    (click)="selectedTypeCategory.set(cat.id)"
                    [class]="selectedTypeCategory() === cat.id
                      ? 'bg-sec-box text-on-sec-box font-bold'
                      : 'bg-surface-high text-muted hover:text-main'"
                    class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                    {{ cat.label }}
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="space-y-2">
            @for (item of filteredTypescales(); track item.tokenKey) {
              <div class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div class="min-w-0 flex-1 overflow-hidden space-y-1">
                  <div
                    [class]="isEmphasizedType() ? item.emphasizedClass : item.baselineClass"
                    class="text-main truncate">
                    {{ item.sampleText }}
                  </div>
                  <div class="text-[11px] text-muted flex flex-wrap items-center gap-2">
                    <span class="font-semibold text-main">{{ item.label }} ({{ item.typeface }}):</span>
                    <span>{{ item.whereToApply }}</span>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-1.5 shrink-0 text-[11px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-surface-high text-primary font-bold">
                    .{{ isEmphasizedType() ? item.emphasizedClass : item.baselineClass }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-surface border border-outline-sub text-main" title="Tamaño en rem y px">
                    {{ item.sizeRem }} ({{ item.sizePx }}) / {{ item.lineHeightPx }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-surface border border-outline-sub text-muted">
                    trk {{ item.trackingPx }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-primary-box text-on-primary-box font-bold">
                    w: {{ isEmphasizedType() ? item.emphasizedWeight : item.baselineWeight }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- =====================================================================
           CASO 4: SHAPE SYSTEM — 10-STEP SCALE, PRINCIPLES & DUAL SHAPE MORPH
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">rounded_corner</span>
            Caso 4 • Shape System: 10-Step Scale, Overview Principles & Dual Shape Morphing
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Escala de 10 Radios (<code class="font-mono text-primary">0px → 48px + Full</code>), Principios Ópticos y Los 2 Mecanismos de Shape Morph
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Según <code class="font-mono text-main">m3.material.io/styles/shape/overview-principles</code> y <code class="font-mono text-main">styles/shape/shape-morph</code>, el Shape Morph en M3 Expressive <strong>NO es exclusivo de móviles ni solo del Loading Indicator</strong>: se divide en <strong>Mecanismo A (Corner Radius Morphing)</strong> —usado a diario en Web/Desktop para botones, filter chips, cards y FABs como reemplazo visual de la vibración háptica— y <strong>Mecanismo B (Polygon Spline Morphing)</strong> —usado en el <code class="font-mono text-primary">&lt;m3-loading-indicator&gt;</code> y badges expresivos.
          </p>
        </div>

        <!-- 4.1 Los 10 Niveles Oficiales de Corner Shape -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold text-main flex items-center justify-between">
            <span>1. Escala Completa de 10 Niveles (<code class="font-mono text-primary">--md-sys-shape-corner-*</code>)</span>
            <span class="text-[11px] font-mono text-muted">Incluye los 3 nuevos radios M3E: 20px, 32px y 48px</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            @for (corner of shapeSpecs; track corner.id) {
              <div
                [style.border-radius]="'var(' + corner.sysToken + ')'"
                [class]="corner.isExpressiveNew
                  ? 'bg-primary-box/50 border-2 border-primary'
                  : 'bg-surface-low border border-outline-sub'"
                class="p-3 flex flex-col justify-between min-h-[104px] transition-all">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-xs font-extrabold font-mono text-main">{{ corner.value }}</span>
                  @if (corner.isExpressiveNew) {
                    <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-primary text-on-primary">
                      M3E
                    </span>
                  }
                </div>
                <div class="space-y-0.5">
                  <div class="text-[11px] font-bold text-main leading-tight">{{ corner.name }}</div>
                  <div class="text-[9px] font-mono text-primary truncate" [title]="corner.tailwindVar">{{ corner.tailwindVar }}</div>
                  <div class="text-[9px] text-muted leading-tight line-clamp-2">{{ corner.usage }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- 4.2 Principios Oficiales de Shape (overview-principles) + Comparativa de los 2 Mecanismos de Morph -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- Los 3 principios de overview-principles -->
          <div class="lg:col-span-5 space-y-2.5">
            <div class="text-xs font-bold text-main">
              2. Principios Oficiales (<code class="font-mono text-primary">shape/overview-principles</code>)
            </div>
            <div class="space-y-2">
              @for (prin of shapePrinciples; track prin.id) {
                <div class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub space-y-1.5">
                  <div class="flex items-center gap-2 text-xs font-bold text-main">
                    <span class="material-symbols-rounded text-base text-primary">{{ prin.icon }}</span>
                    <span>{{ prin.title }}</span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">{{ prin.summary }}</p>
                  <div class="text-[10px] font-mono text-primary bg-surface px-2 py-1 rounded border border-outline-sub/60">
                    Aplicación Web: {{ prin.webApplication }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Los 2 Mecanismos de Shape Morph (Corner Morph vs Polygon Morph) -->
          <div class="lg:col-span-7 space-y-2.5">
            <div class="text-xs font-bold text-main">
              3. Arquitectura Dual de Shape Morph (<code class="font-mono text-primary">shape/shape-morph</code>): ¿Dónde aplica cada uno?
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (mech of shapeMorphMechanisms; track mech.id) {
                <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
                  <div class="space-y-1.5">
                    <span class="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                      {{ mech.badge }}
                    </span>
                    <div class="text-xs font-bold text-main">{{ mech.title }}</div>
                    <div class="text-[11px] text-muted leading-relaxed">{{ mech.howItWorks }}</div>
                  </div>

                  <div class="space-y-2 pt-2 border-t border-outline-sub/60">
                    <div class="text-[10px] font-mono text-primary">{{ mech.cssOrSvgTech }}</div>
                    <ul class="space-y-1 text-[11px] text-main list-disc list-inside">
                      @for (comp of mech.canonicalComponents; track comp) {
                        <li class="leading-snug">{{ comp }}</li>
                      }
                    </ul>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- 4.3 Playground Cuádruple de Shape Morph en Vivo -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="text-xs font-bold text-main">
                4. Laboratorio en Vivo: Los 4 Casos Reales de Shape Morphing en Nuestra Aplicación
              </div>
              <p class="text-[11px] text-muted">
                Probá cada control: los 3 primeros usan <strong>Corner Radius Morphing</strong> con resorte espacial (<code class="font-mono text-primary">--md-sys-motion-spring-expressive-fast-spatial</code>) y el cuarto ejecuta <strong>Polygon Spline Morphing</strong> continuo a 60fps.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Demo 1: Button Press / Active Toggle Morph -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">A. Botón Toggle / Press Morph (0ms Lag)</div>
                <div class="text-[10px] text-muted">
                  Usa radio acotado (<code class="font-mono text-primary">20px = h/2</code>) en lugar de <code class="font-mono">9999px</code> para morfear en el instante <code class="font-mono">t=0ms</code> a <code class="font-mono text-primary">10px</code>.
                </div>
              </div>
              <button
                type="button"
                (click)="toggleMorph()"
                [style.border-radius]="isMorphed() ? '10px' : '20px'"
                [class]="isMorphed()
                  ? 'bg-sec-box text-on-sec-box'
                  : 'bg-primary text-on-primary'"
                class="btn-m3 w-full h-10 px-4 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                <span class="material-symbols-rounded text-base">
                  {{ isMorphed() ? 'check_box' : 'radio_button_checked' }}
                </span>
                <span>{{ isMorphed() ? 'Activo: Squircle (10px)' : 'Reposo: Píldora (20px)' }}</span>
              </button>
            </div>

            <!-- Demo 2: Filter Chip Selection Morph -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">B. Filter Chips (Selección Instantánea)</div>
                <div class="text-[10px] text-muted">
                  Radio acotado <code class="font-mono text-primary">16px (h/2) ↔ 8px (small)</code>: muta al instante sin zona muerta.
                </div>
              </div>
              <div class="flex flex-wrap gap-1.5">
                @for (chip of morphChips; track chip.id) {
                  <button
                    type="button"
                    (click)="toggleMorphChip(chip.id)"
                    [style.border-radius]="selectedMorphChips().includes(chip.id) ? 'var(--md-sys-shape-corner-small, 8px)' : '16px'"
                    [class]="selectedMorphChips().includes(chip.id)
                      ? 'bg-sec-box text-on-sec-box border-secondary/40 font-bold'
                      : 'bg-surface-low text-muted border-outline-sub hover:text-main'"
                    class="btn-m3 h-8 px-3 text-xs border flex items-center gap-1 cursor-pointer">
                    <span class="material-symbols-rounded text-sm">
                      {{ selectedMorphChips().includes(chip.id) ? 'check' : chip.icon }}
                    </span>
                    <span>{{ chip.label }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Demo 3: Card Interactive Corner Morph -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">C. Card Surface Morph</div>
                <div class="text-[10px] text-muted">
                  Hacé clic o pasá el mouse: la tarjeta muta de <code class="font-mono text-primary">medium (12px)</code> a <code class="font-mono text-primary">extra-large (28px)</code>.
                </div>
              </div>
              <button
                type="button"
                (click)="isCardMorphed.update(v => !v)"
                [class]="isCardMorphed()
                  ? 'rounded-m3-xl bg-tertiary-box text-on-tertiary-box border-tertiary/50 shadow-m3-level2'
                  : 'rounded-m3-md bg-surface-high text-main border-outline-sub hover:rounded-m3-xl'"
                class="w-full p-3 border text-left transition-all duration-300 cursor-pointer flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold">{{ isCardMorphed() ? 'Radio Extra-Large (28px)' : 'Radio Medium (12px)' }}</div>
                  <div class="text-[10px] opacity-80">Click o Hover para morfear</div>
                </div>
                <span class="material-symbols-rounded text-base">aspect_ratio</span>
              </button>
            </div>

            <!-- Demo 4: Polygon Spline Morph (M3 Loading Indicator) -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-2.5">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">D. Polygon Morph (&lt;m3-loading-indicator&gt;)</div>
                <div class="text-[10px] text-muted">
                  7 formas canónicas a 180 splines cúbicos con resorte M3 (0.6 / 200) cada 650ms y +90° por paso.
                </div>
              </div>
              <div class="flex items-center justify-around py-1">
                <m3-loading-indicator size="md" [contained]="true" color="primary" ariaLabel="Demo loading indicator contained" />
                <m3-loading-indicator size="md" [contained]="false" color="tertiary" ariaLabel="Demo loading indicator uncontained" />
              </div>
              <!-- Galería de los 7 polígonos canónicos que componen el ciclo -->
              <div class="grid grid-cols-7 gap-1 pt-1.5 border-t border-outline-sub/60 text-center">
                @for (poly of canonicalPolygons; track poly.name) {
                  <div class="flex flex-col items-center">
                    <svg viewBox="0 0 48 48" aria-hidden="true" class="w-5 h-5 text-primary fill-current">
                      <path [attr.d]="poly.path" />
                    </svg>
                    <span class="text-[8px] font-mono text-muted truncate max-w-full">{{ poly.name }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =====================================================================
           CASO 5: ELEVATION SYSTEM — 6 LEVELS & APPLYING ELEVATION (WHY / WHEN / HOW)
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base">layers</span>
            Caso 5 • Elevation System: 6 Levels (0dp → 12dp) & Applying Elevation
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Escala de Elevación Adaptativa (<code class="font-mono text-primary">--md-sys-elevation-level0..5</code>) y Reglas de Aplicación
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Según <code class="font-mono text-main">m3.material.io/styles/elevation/applying-elevation</code>, la elevación en M3 expresa la distancia relativa en el eje Z entre dos superficies. En <code class="font-mono text-main">_elevation.css</code> acoplamos las sombras a <code class="font-mono text-primary">color-mix(in oklch, var(--md-sys-color-shadow) ...)</code> y combinamos contenedores tonales con saltos dinámicos de altitud.
          </p>
        </div>

        <!-- 5.1 Los 6 niveles visuales en vivo -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold text-main">
            1. Los 6 Niveles Canónicos de Elevación (<code class="font-mono text-primary">0dp → 12dp</code>) — Pasá el mouse sobre cada tarjeta
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            @for (elev of elevationSpecs; track elev.level) {
              <div
                [style.box-shadow]="'var(' + elev.sysToken + ')'"
                class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub/60 flex flex-col justify-between min-h-[124px] transition-transform hover:-translate-y-0.5">
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold text-main">Level {{ elev.level }}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-bold">
                      {{ elev.dp }}
                    </span>
                  </div>
                  <div class="text-[10px] font-mono text-primary truncate" [title]="elev.sysToken">{{ elev.sysToken }}</div>
                </div>
                <div class="space-y-1 pt-2 border-t border-outline-sub/50">
                  <div class="text-[10px] font-semibold text-main">{{ elev.pairedSurface }}</div>
                  <div class="text-[10px] text-muted leading-snug">{{ elev.usage }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- 5.2 Por qué, Cuándo y Cómo aplicar elevación (applying-elevation) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          @for (rule of applyingElevationPrinciples; track rule.id) {
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-main">
                <span class="material-symbols-rounded text-base text-primary">{{ rule.icon }}</span>
                <span>{{ rule.title }}</span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                <strong class="text-main">Por qué:</strong> {{ rule.why }}
              </p>
              <p class="text-[11px] text-muted leading-relaxed">
                <strong class="text-primary">Cómo aplicarlo:</strong> {{ rule.howToApply }}
              </p>
            </div>
          }
        </div>

        <!-- 5.3 Matriz Oficial de Elevación por Componente -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold text-main">
            2. Matriz Oficial de Elevación por Componente (<code class="font-mono text-primary">Resting → Hover/Scroll → Drag/Active</code>)
          </div>
          <div class="overflow-x-auto rounded-m3-lg border border-outline-sub">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-surface-high text-main border-b border-outline-sub">
                  <th class="p-3 font-bold">Componente M3</th>
                  <th class="p-3 font-bold">Superficie Tonal</th>
                  <th class="p-3 font-bold">Reposo (Resting)</th>
                  <th class="p-3 font-bold">Hover / Scroll</th>
                  <th class="p-3 font-bold">Pressed / Dragged</th>
                  <th class="p-3 font-bold">Razón Arquitectónica</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-sub/60 bg-surface-low">
                @for (row of componentElevationMatrix; track row.component) {
                  <tr class="hover:bg-surface-high/50 transition-colors">
                    <td class="p-3 font-bold text-main">{{ row.component }}</td>
                    <td class="p-3 font-mono text-[11px] text-primary">{{ row.surfaceToken }}</td>
                    <td class="p-3 font-mono text-[11px] text-main">{{ row.restingLevel }}</td>
                    <td class="p-3 font-mono text-[11px] font-bold text-secondary">{{ row.hoverOrFocusLevel }}</td>
                    <td class="p-3 font-mono text-[11px] text-muted">{{ row.activeOrDraggedLevel }}</td>
                    <td class="p-3 text-[11px] text-muted leading-snug">{{ row.reason }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- =====================================================================
           CASO 6: STATE LAYERS (--md-sys-state-*) & PLAYGROUND MULTICOMPONENTE DE HOVERS
           ===================================================================== -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-6 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base">tune</span>
              Caso 6 • Interaction & State Layers: Cómo Funcionan los Hovers, Focus y Press en Cada Componente
            </div>
            <h3 class="text-title-lg-emphasized text-main">
              Tokens <code class="font-mono text-primary">--md-sys-state-*</code> y Laboratorio en Vivo de Hovers por Rol de Color
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              En Material 3 jamás se oscurece un botón o tarjeta con un color arbitrario en <code class="font-mono">:hover</code>. En su lugar, se superpone una <strong>State Layer</strong> (velo translúcido de <code class="font-mono text-primary">currentColor</code> al <strong>8% en Hover</strong>, <strong>10% en Focus</strong>, <strong>12% en Pressed</strong> y <strong>16% en Dragged</strong>). Podés interactuar libremente con el mouse o <strong>forzar un estado abajo</strong> para inspeccionar todos los componentes al mismo tiempo.
            </p>
          </div>

          <!-- Selector de Estado Forzado para inspeccionar todos los componentes a la vez -->
          <div class="flex flex-wrap items-center gap-1 bg-surface-low p-1.5 rounded-m3-lg border border-outline-sub shrink-0">
            @for (mode of forcedStateModes; track mode.id) {
              <button
                type="button"
                (click)="forcedState.set(mode.id)"
                [class]="forcedState() === mode.id
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface text-muted hover:text-main'"
                class="btn-m3 px-2.5 py-1.5 rounded-full text-[11px] cursor-pointer">
                {{ mode.label }}
              </button>
            }
          </div>
        </div>

        <!-- 6.1 Los 6 Tokens Oficiales de Opacidad de Estado -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          @for (st of stateSpecs; track st.sysToken) {
            <div class="p-3 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">{{ st.state }}</span>
                <span class="text-sm font-mono font-extrabold text-primary">{{ st.percentage }}</span>
              </div>
              <div class="text-[10px] font-mono text-muted break-all">{{ st.sysToken }}</div>
              <p class="text-[10px] text-muted leading-snug">{{ st.usage }}</p>
            </div>
          }
        </div>

        <!-- 6.2 Playground en Vivo de los 6 Arquetipos de Hover / Focus / Press -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="text-xs font-bold text-main">
              Laboratorio Interactivo: Pasá el puntero (Hover), enfocá con <code class="font-mono">Tab</code> o hacé clic en los 6 Arquetipos M3
            </div>
            <span class="text-[11px] font-mono text-primary">
              Modo activo: {{ activeForcedStateLabel() }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <!-- ARQUETIPO 1: Botones de Énfasis Alto y Medio (Filled & Tonal) -->
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-4">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">1. Botones Filled & Tonal</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-box text-on-primary-box">on-primary / on-sec-box</span>
                </div>
                <p class="text-[11px] text-muted leading-snug">
                  En un botón <strong>Filled</strong>, <code class="font-mono text-main">currentColor</code> es <code class="font-mono text-primary">on-primary</code>: el hover al 8% tiñe suavemente con el color del texto/icono y eleva la sombra a Level 1.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  [disabled]="forcedState() === 'disabled'"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-primary)')"
                  [class.ring-2]="forcedState() === 'focus'"
                  [class.ring-primary]="forcedState() === 'focus'"
                  [class.scale-95]="forcedState() === 'pressed'"
                  [class.shadow-m3-level2]="forcedState() === 'hover' || forcedState() === 'dragged'"
                  class="m3-btn m3-btn-filled m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                  <span class="material-symbols-rounded text-base">bolt</span>
                  <span>Filled (Hover 8%)</span>
                </button>

                <button
                  type="button"
                  [disabled]="forcedState() === 'disabled'"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-secondary-container)')"
                  [class.ring-2]="forcedState() === 'focus'"
                  [class.ring-primary]="forcedState() === 'focus'"
                  [class.scale-95]="forcedState() === 'pressed'"
                  class="m3-btn m3-btn-tonal m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                  <span class="material-symbols-rounded text-base">tune</span>
                  <span>Tonal (Hover 8%)</span>
                </button>
              </div>

              <div class="text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60">
                background-image: color-mix(in oklch, var(--md-sys-color-on-primary) 8%, transparent)
              </div>
            </div>

            <!-- ARQUETIPO 2: Botones Transparentes (Outlined & Text) -->
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-4">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">2. Botones Outlined & Text</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sec-box text-on-sec-box">Velo: primary (8%)</span>
                </div>
                <p class="text-[11px] text-muted leading-snug">
                  Como el fondo en reposo es <code class="font-mono text-main">transparent</code> y el texto es <code class="font-mono text-primary">primary</code>, el hover al 8% <strong>sí tiñe con el color primario semilla</strong>.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  [disabled]="forcedState() === 'disabled'"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-primary)')"
                  [class.ring-2]="forcedState() === 'focus'"
                  [class.ring-primary]="forcedState() === 'focus'"
                  [class.scale-95]="forcedState() === 'pressed'"
                  class="m3-btn m3-btn-outlined m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                  <span class="material-symbols-rounded text-base">filter_list</span>
                  <span>Outlined Hover</span>
                </button>

                <button
                  type="button"
                  [disabled]="forcedState() === 'disabled'"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-primary)')"
                  [class.ring-2]="forcedState() === 'focus'"
                  [class.ring-primary]="forcedState() === 'focus'"
                  [class.scale-95]="forcedState() === 'pressed'"
                  class="m3-btn m3-btn-text m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                  <span>Text Action</span>
                </button>
              </div>

              <div class="text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60">
                background-image: color-mix(in oklch, var(--md-sys-color-primary) 8%, transparent)
              </div>
            </div>

            <!-- ARQUETIPO 3: Tarjeta Interactiva Elevated (Hover Neutro on-surface + Salto de Sombra) -->
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">3. Card Elevated Interactiva</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-tertiary-box text-on-tertiary-box">Velo: on-surface (Neutro)</span>
                </div>
                <p class="text-[11px] text-muted leading-snug">
                  Usa <code class="font-mono text-main">on-surface (8%)</code> neutro para no alterar el color de los badges internos y sube su sombra de <strong>Level 1 (1dp) a Level 2 (3dp)</strong>.
                </p>
              </div>

              <div
                tabindex="0"
                role="button"
                [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-surface)')"
                [class.shadow-m3-level2]="forcedState() === 'hover'"
                [class.shadow-m3-level4]="forcedState() === 'dragged'"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.98]]="forcedState() === 'pressed'"
                [class.opacity-50]="forcedState() === 'disabled'"
                class="m3-card m3-card-elevated m3-card-interactive state-layer focus-ring-m3 p-3.5 rounded-m3-lg border border-outline-sub/60 flex items-center justify-between gap-3 cursor-pointer">
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded-full bg-success-box text-on-success-box text-[10px] font-bold">SLA OK</span>
                    <span class="text-xs font-bold text-main">Card Elevated (1dp → 3dp)</span>
                  </div>
                  <div class="text-[11px] text-muted">Pasá el mouse: el badge verde mantiene su tono exacto.</div>
                </div>
                <span class="material-symbols-rounded text-base text-primary">open_in_new</span>
              </div>

              <div class="text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60">
                Velo: on-surface 8% + box-shadow: var(--md-sys-elevation-level2)
              </div>
            </div>

            <!-- ARQUETIPO 4: Tarjetas Filled vs Outlined en Hover -->
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">4. Cards Filled vs. Outlined</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-high text-main">0dp → 1dp en Hover</span>
                </div>
                <p class="text-[11px] text-muted leading-snug">
                  Ambas nacen en <strong>Level 0 (0dp)</strong>. Al pasar el mouse proyectan el velo <code class="font-mono text-main">on-surface (8%)</code> y adquieren micro-elevación <code class="font-mono">Level 1</code>.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div
                  tabindex="0"
                  role="button"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-surface)')"
                  [class.shadow-m3-level1]="forcedState() === 'hover'"
                  [class.ring-2]="forcedState() === 'focus'"
                  [class.ring-primary]="forcedState() === 'focus'"
                  [class.scale-[0.98]]="forcedState() === 'pressed'"
                  class="m3-card m3-card-filled m3-card-interactive state-layer focus-ring-m3 p-3 rounded-m3-md cursor-pointer">
                  <div class="text-xs font-bold text-main">Filled Card</div>
                  <div class="text-[10px] text-muted mt-0.5">surface-highest</div>
                </div>

                <div
                  tabindex="0"
                  role="button"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-surface)')"
                  [class.shadow-m3-level1]="forcedState() === 'hover'"
                  [class.ring-2]="forcedState() === 'focus'"
                  [class.ring-primary]="forcedState() === 'focus'"
                  [class.scale-[0.98]]="forcedState() === 'pressed'"
                  class="m3-card m3-card-outlined m3-card-interactive state-layer focus-ring-m3 p-3 rounded-m3-md cursor-pointer">
                  <div class="text-xs font-bold text-main">Outlined Card</div>
                  <div class="text-[10px] text-muted mt-0.5">surface + outline</div>
                </div>
              </div>

              <div class="text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60">
                Contraste garantizado tanto en Light (oscurece 8%) como en Dark (aclara 8%)
              </div>
            </div>

            <!-- ARQUETIPO 5: Filter Chips & Assist Chips -->
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">5. Chips (Reposo vs. Seleccionado)</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sec-box text-on-sec-box">Estado + Morph</span>
                </div>
                <p class="text-[11px] text-muted leading-snug">
                  Un chip sin seleccionar usa velo <code class="font-mono text-main">on-surface-variant (8%)</code>; al seleccionarse cambia su contenedor a <code class="font-mono text-primary">secondary-container</code> y su velo a <code class="font-mono">on-secondary-container</code>.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  (click)="demoChipSelected.update(v => !v)"
                  [disabled]="forcedState() === 'disabled'"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-secondary-container)')"
                  [class.is-selected]="demoChipSelected()"
                  [class.ring-2]="forcedState() === 'focus'"
                  [class.ring-primary]="forcedState() === 'focus'"
                  class="m3-chip m3-chip-filter state-layer focus-ring-m3 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">{{ demoChipSelected() ? 'check' : 'filter_alt' }}</span>
                  <span>{{ demoChipSelected() ? 'Filtro Activo (Click)' : 'Filtro Inactivo (Click)' }}</span>
                </button>

                <button
                  type="button"
                  [disabled]="forcedState() === 'disabled'"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-surface)')"
                  class="m3-chip m3-chip-assist state-layer focus-ring-m3 cursor-pointer">
                  <span class="material-symbols-rounded text-sm text-primary">auto_awesome</span>
                  <span>Assist Chip</span>
                </button>
              </div>

              <div class="text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60">
                Hacé clic en el Filter Chip para alternar su rol y su radio (8px ↔ 12px)
              </div>
            </div>

            <!-- ARQUETIPO 6: Filas de Lista & Destinos de Navegación -->
            <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">6. List Item & Navigation Pill</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-box text-on-primary-box">Fila Interactiva</span>
                </div>
                <p class="text-[11px] text-muted leading-snug">
                  En listas operativas (Agenda, Inventario, Clínica) y en el Navigation Rail, toda la fila proyecta <code class="font-mono text-main">.state-layer</code> al 8% en hover.
                </p>
              </div>

              <div class="space-y-1.5">
                <div
                  tabindex="0"
                  role="button"
                  (click)="demoListActive.set(1)"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-surface)')"
                  [style.border-radius]="demoListActive() === 1 ? '10px' : '20px'"
                  [class]="demoListActive() === 1
                    ? 'bg-sec-box text-on-sec-box font-bold'
                    : 'bg-surface text-main'"
                  class="state-layer focus-ring-m3 px-3.5 py-2 border border-outline-sub/60 flex items-center justify-between text-xs transition-all duration-200 cursor-pointer">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-base text-primary">inventory_2</span>
                    <span>Ítem de Lista #1 (Click para activar)</span>
                  </span>
                  <span class="text-[10px] font-mono opacity-75">8% hover</span>
                </div>

                <div
                  tabindex="0"
                  role="button"
                  (click)="demoListActive.set(2)"
                  [style.background-image]="getSimulatedStateOverlay('var(--md-sys-color-on-surface)')"
                  [style.border-radius]="demoListActive() === 2 ? '10px' : '20px'"
                  [class]="demoListActive() === 2
                    ? 'bg-sec-box text-on-sec-box font-bold'
                    : 'bg-surface text-main'"
                  class="state-layer focus-ring-m3 px-3.5 py-2 border border-outline-sub/60 flex items-center justify-between text-xs transition-all duration-200 cursor-pointer">
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-base text-tertiary">monitoring</span>
                    <span>Ítem de Lista #2 (Hover Neutro)</span>
                  </span>
                  <span class="text-[10px] font-mono opacity-75">8% hover</span>
                </div>
              </div>

              <div class="text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60">
                .state-layer hereda border-radius y aplica currentColor automáticamente
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  `
})
export class StylesLabComponent {
  readonly themeService = inject(ThemeService);

  readonly anatomyExamples = TOKEN_ANATOMY_EXAMPLES;
  readonly tonalPalettes = TONAL_PALETTE_FAMILIES;
  readonly surfaceSpecs = SURFACE_HIERARCHY_SPECS;
  readonly typefaceFontSpecs = TYPEFACE_FONT_SPECS;
  readonly applyingTypeRules = APPLYING_TYPE_RULES;
  readonly typescaleSpecs = TYPESCALES_30_SPECS;
  readonly shapeSpecs = SHAPE_CORNER_10_SPECS;
  readonly shapePrinciples = SHAPE_PRINCIPLES_SPECS;
  readonly shapeMorphMechanisms = SHAPE_MORPH_MECHANISMS_SPECS;
  readonly elevationSpecs = ELEVATION_6_SPECS;
  readonly applyingElevationPrinciples = APPLYING_ELEVATION_PRINCIPLES;
  readonly componentElevationMatrix = COMPONENT_ELEVATION_MATRIX;
  readonly stateSpecs = STATE_OPACITY_SPECS;
  readonly stateLayerRecipes = STATE_LAYER_COMPONENT_RECIPES;

  readonly contrastLevels: readonly { id: ContrastLevel; label: string }[] = [
    { id: 'standard', label: 'Standard (Default)' },
    { id: 'medium', label: 'Medium (≥3:1)' },
    { id: 'high', label: 'High (≥7:1)' }
  ];

  readonly typeCategories: readonly { id: TypeCategoryFilter; label: string }[] = [
    { id: 'all', label: 'Todas (15)' },
    { id: 'display', label: 'Display' },
    { id: 'headline', label: 'Headline' },
    { id: 'title', label: 'Title' },
    { id: 'body', label: 'Body' },
    { id: 'label', label: 'Label' }
  ];

  readonly morphChips: readonly { id: string; label: string; icon: string }[] = [
    { id: 'oklch', label: 'OKLCH', icon: 'palette' },
    { id: 'springs', label: 'Springs', icon: 'animation' },
    { id: 'tokens', label: 'Tokens', icon: 'hub' }
  ];

  readonly canonicalPolygons: readonly { name: string; path: string }[] = [
    { name: 'Burst', path: M3_SOFT_BURST_PATH },
    { name: 'Cookie9', path: M3_COOKIE9_PATH },
    { name: 'Pentág.', path: M3_PENTAGON_PATH },
    { name: 'Pill', path: M3_PILL_PATH },
    { name: 'Sunny', path: M3_SUNNY_PATH },
    { name: 'Cookie4', path: M3_COOKIE4_PATH },
    { name: 'Oval', path: M3_OVAL_PATH }
  ];

  readonly forcedStateModes: readonly { id: ForcedStateMode; label: string }[] = [
    { id: 'live', label: 'Interacción Libre (Hover Real)' },
    { id: 'hover', label: 'Forzar Hover (8%)' },
    { id: 'focus', label: 'Forzar Focus (10%)' },
    { id: 'pressed', label: 'Forzar Pressed (12%)' },
    { id: 'dragged', label: 'Forzar Dragged (16%)' },
    { id: 'disabled', label: 'Forzar Disabled (38%/12%)' }
  ];

  readonly selectedAnatomyId = signal<string>(TOKEN_ANATOMY_EXAMPLES[0].id);
  readonly selectedPaletteId = signal<TonalPaletteFamily['id']>('primary');
  readonly isEmphasizedType = signal<boolean>(false);
  readonly selectedTypeCategory = signal<TypeCategoryFilter>('all');
  readonly isMorphed = signal<boolean>(false);
  readonly selectedMorphChips = signal<readonly string[]>(['oklch']);
  readonly isCardMorphed = signal<boolean>(false);
  readonly forcedState = signal<ForcedStateMode>('live');
  readonly demoChipSelected = signal<boolean>(true);
  readonly demoListActive = signal<number>(1);

  readonly activeAnatomy = computed(() =>
    this.anatomyExamples.find(item => item.id === this.selectedAnatomyId()) ?? this.anatomyExamples[0]
  );

  readonly activePalette = computed(() =>
    this.tonalPalettes.find(p => p.id === this.selectedPaletteId()) ?? this.tonalPalettes[0]
  );

  readonly filteredTypescales = computed(() => {
    const cat = this.selectedTypeCategory();
    if (cat === 'all') {
      return this.typescaleSpecs;
    }
    return this.typescaleSpecs.filter(item => item.category === cat);
  });

  readonly activeForcedStateLabel = computed(() =>
    this.forcedStateModes.find(m => m.id === this.forcedState())?.label ?? 'Interacción Libre'
  );

  setContrast(level: ContrastLevel): void {
    this.themeService.setContrastLevel(level);
  }

  toggleMorph(): void {
    this.isMorphed.update(v => !v);
  }

  toggleMorphChip(chipId: string): void {
    this.selectedMorphChips.update(current =>
      current.includes(chipId) ? current.filter(id => id !== chipId) : [...current, chipId]
    );
  }

  getSimulatedStateOverlay(colorExpr: string): string | null {
    const mode = this.forcedState();
    if (mode === 'live' || mode === 'disabled') {
      return null;
    }
    const opacityTokenMap: Record<Exclude<ForcedStateMode, 'live' | 'disabled'>, string> = {
      hover: 'var(--md-sys-state-hover-state-layer-opacity, 0.08)',
      focus: 'var(--md-sys-state-focus-state-layer-opacity, 0.10)',
      pressed: 'var(--md-sys-state-pressed-state-layer-opacity, 0.12)',
      dragged: 'var(--md-sys-state-dragged-state-layer-opacity, 0.16)'
    };
    const pct = opacityTokenMap[mode];
    const mix = `color-mix(in oklch, ${colorExpr} calc(${pct} * 100%), transparent)`;
    return `linear-gradient(${mix}, ${mix})`;
  }
}
