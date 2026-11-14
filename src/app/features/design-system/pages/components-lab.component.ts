import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption,
  M3SplitButtonComponent,
  M3SplitMenuItem
} from '../../../shared/components/button/button-group.component';
import { M3FabComponent } from '../../../shared/components/button/fab.component';
import { M3CardComponent, M3CardTone, M3CardVariant } from '../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3CircularProgressComponent, M3LinearProgressComponent, M3LoadingIndicatorComponent } from '../../../shared/components/progress';
import {
  DEFAULT_LINEAR_AMPLITUDE_DP,
  DEFAULT_LINEAR_WAVELENGTH_DP,
  DEFAULT_WAVE_SPEED_DP_PER_SEC,
  evalEmphasizedDecelerate,
  evaluateWaveAmplitudeEnvelope
} from '../../../shared/components/progress/progress-motion.util';
import { observePrefersReducedMotion } from '../../../shared/components/progress/progress-motion.controller';
import { M3SnackbarComponent } from '../../../shared/components/snackbar/snackbar.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import {
  BUTTON_EMPHASIS_SPECS,
  CARD_GUIDELINE_SPECS,
  COMPONENT_PILLAR_SPECS,
  LOADING_TIMING_SPECS,
  TEXT_FIELD_CONTEXT_SPECS,
  WEB_A11Y_FIX_SPECS
} from './components-specs.data';

/**
 * Laboratory page for Step 3 (Components): interactive showcase and reference aligned with
 * m3.material.io/components (All Buttons, Cards, Chips, Text Fields, Loading Indicator, Progress Indicators,
 * plus essential Web M3 components: Switch and Top-Layer Menu/Snackbar Overlays).
 */
@Component({
  selector: 'app-components-lab',
  standalone: true,
  imports: [
    RouterLink,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3SplitButtonComponent,
    M3FabComponent,
    M3CardComponent,
    M3ChipComponent,
    M3TextFieldComponent,
    M3LinearProgressComponent,
    M3CircularProgressComponent,
    M3LoadingIndicatorComponent,
    M3SwitchComponent,
    M3SnackbarComponent
  ],
  template: `
    <div class="space-y-8">
      <!-- BANNER PEDAGÓGICO: SEPARACIÓN PASO 1 (STYLES), PASO 2 (FOUNDATIONS) -> PASO 3 (COMPONENTS) -->
      <section class="bg-surface-box border border-outline-sub p-5 rounded-m3-xl space-y-4 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base">widgets</span>
              Paso 3 • Components (m3.material.io/components)
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Los 6 Pilares Oficiales M3 + Extensiones Esenciales Web (Switch & Top-Layer Popovers)
            </h2>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              Los componentes consumen los tokens OKLCH y State Layers de <strong>Styles</strong> y las leyes de targets/layout de <strong>Foundations</strong>. Aquí interactuamos con All Buttons (Toggle, Button Groups, Split Button, FAB), Cards, Chips, Text Fields, Loading Indicator (&lt;5s), Progress Wavy (&gt;5s), Switch y Snackbar <code>popover="manual"</code>.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <a
              routerLink="/design-system/foundations"
              class="btn-m3 state-layer focus-ring-m3 px-3.5 py-2 rounded-full bg-sec-box text-on-sec-box text-xs font-bold flex items-center gap-1.5 no-underline">
              <span class="material-symbols-rounded text-base">architecture</span>
              <span>Ir a Foundations</span>
            </a>
          </div>
        </div>

        <!-- Mapa rápido de los 6 Pilares + 2 Web -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-outline-sub">
          @for (spec of componentPillars; track spec.id) {
            <div class="p-3 bg-surface-low rounded-m3-lg border border-outline-sub space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">{{ spec.name }}</span>
              </div>
              <div class="text-[10px] font-mono text-primary truncate">{{ spec.selectorOrCss }}</div>
              <p class="text-[11px] text-muted leading-snug">{{ spec.keyRule }}</p>
            </div>
          }
        </div>
      </section>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. LAS 5 VARIANTES CANÓNICAS -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">smart_button</span>
              Components • Jerarquía Visual
            </div>
            <h3 class="text-title-md font-bold text-main">Las 5 Variantes Canónicas</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Tokens de superficie y roles semánticos según el nivel de énfasis requerido.
            </p>
          </div>

          <div class="flex flex-col gap-3 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">1. Filled (High)</span>
              <m3-button variant="filled" icon="add" (action)="incrementClicks()">
                Filled Button
              </m3-button>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">2. Tonal (Medium-High)</span>
              <m3-button variant="tonal" icon="edit" (action)="incrementClicks()">
                Tonal Button
              </m3-button>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">3. Elevated (Depth)</span>
              <m3-button variant="elevated" icon="cloud_upload" (action)="incrementClicks()">
                Elevated Button
              </m3-button>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">4. Outlined (Border)</span>
              <m3-button variant="outlined" icon="tune" (action)="incrementClicks()">
                Outlined Button
              </m3-button>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">5. Text (Low)</span>
              <m3-button variant="text" icon="close" (action)="incrementClicks()">
                Text Button
              </m3-button>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-sub flex items-center justify-between text-xs text-muted">
            <span>Clics registrados:</span>
            <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high">
              {{ buttonClicks() }}
            </span>
          </div>
        </div>

        <!-- 2. TAMAÑOS Y SHAPE MORPHING EXPRESIVO -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">animation</span>
              Components • Expresión y Escala
            </div>
            <h3 class="text-title-md font-bold text-main">Tamaños y Shape Morphing</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Escala dimensional estándar (32px, 40px, 48px) y transiciones elásticas en hover.
            </p>
          </div>

          <div class="space-y-4 pt-1">
            <!-- XS / SM / MD / LG / XL Compact Matrix -->
            <div class="flex flex-wrap items-center gap-2 pb-1">
              <m3-button size="xs" variant="outlined" icon="bolt" (action)="incrementClicks()">XS 28</m3-button>
              <m3-button size="xl" variant="filled" icon="auto_awesome" (action)="incrementClicks()">XL 56</m3-button>
            </div>

            <!-- Small -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">Small (32px)</span>
              <m3-button size="sm" variant="tonal" icon="star" (action)="incrementClicks()">
                Small Button
              </m3-button>
            </div>

            <!-- Medium (Standard) -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">Medium (40px)</span>
              <m3-button size="md" variant="filled" icon="check_circle" (action)="incrementClicks()">
                Medium Standard
              </m3-button>
            </div>

            <!-- Large -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-mono">Large (48px)</span>
              <m3-button size="lg" variant="elevated" icon="rocket_launch" (action)="incrementClicks()">
                Large Button
              </m3-button>
            </div>

            <!-- Expressive Shape Morphing -->
            <div class="p-3 bg-surface-high rounded-m3-lg border border-outline-sub space-y-2">
              <span class="text-xs font-semibold text-main block">Expressive Morphing Hover</span>
              <p class="text-[11px] text-muted">Pasa el mouse: el radio muta de píldora a squircle sin saltos de layout:</p>
              <div class="flex items-center justify-center pt-1">
                <m3-button variant="filled" [morph]="true" icon="auto_awesome" (action)="incrementClicks()">
                  Pasa el cursor sobre mí
                </m3-button>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary">info</span>
            <span>48px mantiene la escala táctil WCAG AAA.</span>
          </div>
        </div>

        <!-- 3. ESTADOS REACTIVOS E ICON-ONLY -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">toggle_on</span>
              Components • Estados y Variaciones
            </div>
            <h3 class="text-title-md font-bold text-main">Loading, Disabled & Icon-Only</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Control dinámico de feedback sin romper el ancho de las cajas.
            </p>
          </div>

          <div class="space-y-4 pt-1">
            <!-- Toggles de estado -->
            <div class="flex items-center gap-2 pb-2">
              <button
                type="button"
                (click)="buttonLoading.update(v => !v)"
                [class]="buttonLoading() ? 'bg-primary text-on-primary font-bold' : 'bg-surface-high text-muted'"
                class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">progress_activity</span>
                {{ buttonLoading() ? 'Cargando: SÍ' : 'Cargando: NO' }}
              </button>

              <button
                type="button"
                (click)="buttonDisabled.update(v => !v)"
                [class]="buttonDisabled() ? 'bg-primary text-on-primary font-bold' : 'bg-surface-high text-muted'"
                class="btn-m3 focus-ring-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">block</span>
                {{ buttonDisabled() ? 'Deshabilitado: SÍ' : 'Deshabilitado: NO' }}
              </button>
            </div>

            <!-- Botón reactivo que reacciona a los toggles -->
            <div class="flex items-center justify-between p-3 bg-surface-high rounded-m3-lg border border-outline-sub">
              <span class="text-xs text-muted font-mono">Reactivo:</span>
              <m3-button
                variant="filled"
                icon="send"
                [loading]="buttonLoading()"
                [disabled]="buttonDisabled()"
                (action)="incrementClicks()">
                Enviar Tarea
              </m3-button>
            </div>

            <!-- Icon-Only Buttons -->
            <div class="space-y-2">
              <span class="text-xs font-semibold text-main block">Variantes Icon-Only (Touch Target 48dp)</span>
              <div class="flex items-center justify-around gap-2 p-2 bg-surface-high rounded-m3-lg border border-outline-sub">
                <m3-button [iconOnly]="true" variant="filled" icon="bookmark" ariaLabel="Guardar" (action)="incrementClicks()" />
                <m3-button [iconOnly]="true" variant="tonal" icon="share" ariaLabel="Compartir" (action)="incrementClicks()" />
                <m3-button [iconOnly]="true" variant="elevated" icon="favorite" ariaLabel="Favorito" (action)="incrementClicks()" />
                <m3-button [iconOnly]="true" variant="outlined" icon="filter_list" ariaLabel="Filtrar" (action)="incrementClicks()" />
                <m3-button [iconOnly]="true" variant="text" icon="more_vert" ariaLabel="Más opciones" (action)="incrementClicks()" />
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary">verified</span>
            <span>Disabled aplica 12% contenedor y 38% tinta <code>on-surface</code> independientes.</span>
          </div>
        </div>

        <!-- 1B. ALL BUTTONS EXTENDED (TOGGLE, BUTTON GROUPS, SPLIT BUTTON & FAB) -->
        <div class="col-span-1 md:col-span-3 bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-5 shadow-xs">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-outline-sub pb-3">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base">dynamic_feed</span>
                m3.material.io/components/all-buttons • Expressive Extended Family
              </div>
              <h3 class="text-title-md font-bold text-main">Toggle Buttons, Button Groups (Standard & Connected), Split Button & FAB</h3>
            </div>
            <span class="text-[11px] font-mono text-muted">
              Connected Group reemplaza oficialmente a Segmented Buttons
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <!-- Toggle Button Pill <-> Square -->
            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-main block">1. Toggle Button (Morph)</span>
                <p class="text-[11px] text-muted mt-0.5">Muta de Pill a Squircle 12px y expone <code>aria-pressed</code>.</p>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <m3-button
                  variant="tonal"
                  [toggle]="true"
                  [(selected)]="togglePinned"
                  [icon]="togglePinned() ? 'keep' : 'keep_off'">
                  {{ togglePinned() ? 'Fijado' : 'Fijar vista' }}
                </m3-button>
                <m3-button
                  variant="outlined"
                  [toggle]="true"
                  icon="favorite"
                  [(selected)]="toggleFavorite">
                  Favorito
                </m3-button>
              </div>
            </div>

            <!-- Connected Button Group (Single Select) -->
            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-main block">2. Connected Button Group</span>
                <p class="text-[11px] text-muted mt-0.5">Gap 2px interno; el ítem seleccionado se vuelve Pill completo.</p>
              </div>
              <div class="space-y-2">
                <m3-button-group
                  variant="connected"
                  selectionMode="single"
                  size="sm"
                  ariaLabel="Vista temporal"
                  [options]="periodGroupOptions"
                  [(value)]="connectedGroupValue" />
                <div class="text-[11px] font-mono text-muted">
                  Activo: <strong class="text-primary">{{ connectedGroupValue().join(', ') }}</strong>
                </div>
              </div>
            </div>

            <!-- Standard Button Group + Split Button (Popover Auto) -->
            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-main block">3. Standard Group & Split Popover</span>
                <p class="text-[11px] text-muted mt-0.5">Multi-selección o Split Button con menú nativo <code>popover="auto"</code>.</p>
              </div>
              <div class="space-y-3">
                <m3-button-group
                  variant="standard"
                  selectionMode="multi"
                  size="xs"
                  ariaLabel="Filtros rápidos"
                  [options]="standardGroupOptions"
                  [(value)]="standardGroupValue" />
                <div class="flex items-center gap-3 flex-wrap">
                  <m3-split-button
                    label="Guardar"
                    icon="save"
                    variant="filled"
                    size="sm"
                    [menuItems]="splitMenuItems"
                    (primaryAction)="triggerActionSnackbar('Guardado principal ejecutado')"
                    (itemAction)="onSplitMenuSelect($event)" />
                </div>
              </div>
            </div>

            <!-- FAB & Extended FAB -->
            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-main block">4. FAB & Extended FAB (Level 3)</span>
                <p class="text-[11px] text-muted mt-0.5">Elevación flotante Level 3 para la acción constructiva principal.</p>
              </div>
              <div class="flex items-center gap-3 flex-wrap">
                <m3-fab size="sm" variant="secondary" icon="edit" ariaLabel="Editar rápido" (action)="incrementClicks()" />
                <m3-fab size="md" variant="primary" icon="add" ariaLabel="Crear nuevo" (action)="incrementClicks()" />
                <m3-fab variant="tertiary" icon="add_shopping_cart" label="Nueva orden" (action)="triggerActionSnackbar('Orden creada desde Extended FAB')" />
              </div>
            </div>
          </div>

          <div class="overflow-x-auto border border-outline-sub rounded-m3-lg">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-surface-high text-[10px] uppercase tracking-wider text-muted font-bold">
                <tr>
                  <th class="py-2 px-3">Variante / Patrón</th>
                  <th class="py-2 px-3">Rol Semántico</th>
                  <th class="py-2 px-3">Tokens</th>
                  <th class="py-2 px-3">Regla de Forma</th>
                  <th class="py-2 px-3">Cuándo usar en Web</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-sub/60">
                @for (row of buttonEmphasisSpecs; track row.kind) {
                  <tr class="hover:bg-surface-low">
                    <td class="py-2 px-3 font-bold text-main">{{ row.kind }}</td>
                    <td class="py-2 px-3 text-muted">{{ row.role }}</td>
                    <td class="py-2 px-3 font-mono text-[11px] text-primary">{{ row.containerToken }}</td>
                    <td class="py-2 px-3 font-mono text-[11px] text-main">{{ row.shapeRule }}</td>
                    <td class="py-2 px-3 text-muted">{{ row.useWhen }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. LAS 3 VARIANTES DE CARDS M3 + GUÍA DE USO Y COLORES DINÁMICOS -->
        <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub space-y-5">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base">view_quilt</span>
                m3.material.io/components/cards/overview • Uso, Colores y Reglas M3
              </div>
              <h3 class="text-title-md font-bold text-main">Cards: ¿Dónde, Cómo, Por Qué y Cuándo Cambiar de Color?</h3>
              <p class="text-xs text-muted mt-1 max-w-4xl leading-relaxed">
                Cada card agrupa <strong>un único tema</strong>. Por defecto <strong>no hace falta cambiar su color a mano</strong> porque el motor OKLCH (<code>--seed-hue</code>) recalcula Light/Dark en <code>surface-container-*</code>. Sólo sobrescribís vía <code>[tone]</code> semántico cuando necesitás comunicar estado o foco especial.
              </p>
            </div>
            <div class="text-xs text-muted flex items-center gap-1.5 shrink-0">
              <span>Activaciones card:</span>
              <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high">
                {{ cardClicks() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 1. ELEVATED CARD (Entirely Actionable — ZERO nested interactive controls inside role="button") -->
            <m3-card
              variant="elevated"
              [interactive]="true"
              padding="lg"
              (action)="incrementCardClicks()"
              customClass="flex flex-col justify-between min-h-[200px]">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider">1. Elevated Card</span>
                  <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">layers</span>
                </div>
                <h4 class="text-base font-bold text-main mt-1">Accionable Completa (Superficie Flotante)</h4>
                <p class="text-xs text-muted mt-1.5 leading-relaxed">
                  Usa <code>surface-container-low</code> + sombra Level 1 &rarr; 2. Regla M3: cuando toda la card es <code>role="button"</code>, no anides otro <code>&lt;button&gt;</code> dentro.
                </p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs text-primary font-semibold">
                <span class="font-mono text-[11px] text-muted">Click / Enter / keyup.space</span>
                <span class="inline-flex items-center gap-1">
                  Abrir detalle
                  <span class="material-symbols-rounded text-base" aria-hidden="true">arrow_forward</span>
                </span>
              </div>
            </m3-card>

            <!-- 2. FILLED CARD (Static Container with explicit local action button) -->
            <m3-card
              variant="filled"
              [interactive]="false"
              padding="lg"
              customClass="flex flex-col justify-between min-h-[200px]">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-muted uppercase tracking-wider">2. Filled Card</span>
                  <span class="material-symbols-rounded text-lg text-muted" aria-hidden="true">crop_din</span>
                </div>
                <h4 class="text-base font-bold text-main mt-1">Contenedor Tonal con Acción Local</h4>
                <p class="text-xs text-muted mt-1.5 leading-relaxed">
                  Usa <code>surface-container-highest</code> (0dp sombra). Ideal en Bento Grids densas o cuando contiene botones independientes adentro.
                </p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs text-muted">
                <span class="font-mono text-[11px]">elevation: 0dp • Bento Grid</span>
                <m3-button variant="tonal" size="sm" icon="arrow_forward" (action)="incrementCardClicks()">
                  Acción local
                </m3-button>
              </div>
            </m3-card>

            <!-- 3. OUTLINED CARD (Pure M3 Outlined Specimen — Surface + 1px outline-variant -> outline on hover) -->
            <m3-card
              variant="outlined"
              [interactive]="true"
              padding="lg"
              (action)="incrementCardClicks()"
              customClass="flex flex-col justify-between min-h-[200px]">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider">3. Outlined Card</span>
                  <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">border_outer</span>
                </div>
                <h4 class="text-base font-bold text-main mt-1">Estructura Nítida con Borde 1px</h4>
                <p class="text-xs text-muted mt-1.5 leading-relaxed">
                  Usa <code>surface</code> + <code>1px solid outline-variant</code>. En hover oscurece el trazo a <code>outline</code> y sube a Level 1 sin relleno pesado.
                </p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs text-primary font-semibold">
                <span class="font-mono text-[11px] text-muted">outline-variant &rarr; outline</span>
                <span class="inline-flex items-center gap-1">
                  Seleccionar card
                  <span class="material-symbols-rounded text-base" aria-hidden="true">arrow_forward</span>
                </span>
              </div>
            </m3-card>
          </div>

          <!-- 4. PLAYGROUND: TOKENS DINÁMICOS (--seed-hue), [tone] SEMÁNTICO Y [disabled] -->
          <m3-card
            [variant]="demoCardVariant()"
            [tone]="demoCardTone()"
            [disabled]="demoCardDisabled()"
            padding="md"
            customClass="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="space-y-1 max-w-2xl">
              <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <span class="material-symbols-rounded text-base" aria-hidden="true">palette</span>
                <span>¿Cambiar color? (variant: {{ demoCardVariant() }} • tone: {{ demoCardTone() }})</span>
              </div>
              <h4 class="text-sm font-bold">Tokens Dinámicos vs Tono Semántico y Estado Disabled</h4>
              <p class="text-xs opacity-85 leading-relaxed">
                En <code>default</code> sigue tu <code>--seed-hue</code> sin hardcodear colores. Sólo pasá <code>[tone]</code> para estados o jerarquía especial, usando <code>--md-comp-*-card-*</code>.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <div class="flex flex-wrap items-center gap-1">
                @for (vOpt of cardVariantOptions; track vOpt) {
                  <button
                    type="button"
                    (click)="demoCardVariant.set(vOpt)"
                    [class]="demoCardVariant() === vOpt ? 'bg-surface text-main font-bold shadow-xs' : 'bg-surface/40 opacity-80 hover:opacity-100'"
                    class="btn-m3 focus-ring-m3 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer border border-outline-sub/60">
                    {{ vOpt }}
                  </button>
                }
              </div>

              <div class="flex flex-wrap items-center gap-1">
                @for (toneOpt of cardToneOptions; track toneOpt) {
                  <button
                    type="button"
                    (click)="demoCardTone.set(toneOpt)"
                    [class]="demoCardTone() === toneOpt ? 'bg-surface text-main font-bold shadow-xs' : 'bg-surface/40 opacity-80 hover:opacity-100'"
                    class="btn-m3 focus-ring-m3 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer border border-outline-sub/60">
                    {{ toneOpt }}
                  </button>
                }
              </div>

              <button
                type="button"
                (click)="demoCardDisabled.set(!demoCardDisabled())"
                [class]="demoCardDisabled() ? 'bg-error text-on-error font-bold' : 'bg-surface/60 text-main'"
                class="btn-m3 focus-ring-m3 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer border border-outline-sub/60">
                {{ demoCardDisabled() ? 'disabled: true' : 'disabled: false' }}
              </button>
            </div>
          </m3-card>

          <!-- Guía de Decisión Cards: Cuándo usar vs Qué NO hacer -->
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-3 overflow-x-auto border border-outline-sub rounded-m3-lg">
              <table class="w-full text-left border-collapse text-xs">
                <thead class="bg-surface-high text-[10px] uppercase tracking-wider text-muted font-bold">
                  <tr>
                    <th class="py-2 px-3">Variante</th>
                    <th class="py-2 px-3">Tokens M3</th>
                    <th class="py-2 px-3">Por qué / Para qué</th>
                    <th class="py-2 px-3">Dónde usarla</th>
                    <th class="py-2 px-3">Cuándo evitarla</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-sub/60">
                  @for (spec of cardGuidelineSpecs; track spec.variant) {
                    <tr class="hover:bg-surface-low">
                      <td class="py-2 px-3 font-bold text-main">{{ spec.variant }}</td>
                      <td class="py-2 px-3 font-mono text-[11px] text-primary">{{ spec.tokens }}</td>
                      <td class="py-2 px-3 text-muted">{{ spec.whyUseIt }}</td>
                      <td class="py-2 px-3 text-main">{{ spec.whereToUse }}</td>
                      <td class="py-2 px-3 text-muted">{{ spec.avoidWhen }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-2 text-xs">
              <div class="flex items-center gap-1.5 font-bold text-error">
                <span class="material-symbols-rounded text-base" aria-hidden="true">do_not_disturb_on</span>
                <span>M3 Card Don'ts</span>
              </div>
              <ul class="space-y-1.5 text-[11px] text-muted list-disc pl-4">
                <li>No usar Card si un <code>divider</code> o padding ya agrupa bien.</li>
                <li>No hacer scroll interno dentro de una Card (doble scroll).</li>
                <li>No mezclar dos temas distintos ni colores hex fijos ajenos al seed.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 5. LOS 4 TIPOS CANÓNICOS DE CHIPS M3 -->
        <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub">
          <div class="flex items-center justify-between pb-3">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base text-primary">label</span>
                Components • M3 Chips & Filtros
              </div>
              <h3 class="text-title-md font-bold text-main">Los 4 Tipos Canónicos de Chips</h3>
            </div>
            <div class="text-xs text-muted flex items-center gap-1.5">
              <span>Filtro activo:</span>
              <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high uppercase">
                {{ demoFilter() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 1. Filter Chips -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">1. Filter Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Selección con checkmark y morphing a squircle:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <m3-chip
                  type="filter"
                  [selected]="demoFilter() === 'ux'"
                  count="8"
                  (action)="setDemoFilter('ux')">
                  UX Design
                </m3-chip>
                <m3-chip
                  type="filter"
                  [selected]="demoFilter() === 'code'"
                  count="14"
                  (action)="setDemoFilter('code')">
                  Frontend
                </m3-chip>
                <m3-chip
                  type="filter"
                  [selected]="demoFilter() === 'qa'"
                  count="3"
                  (action)="setDemoFilter('qa')">
                  Testing
                </m3-chip>
              </div>
            </div>

            <!-- 2. Assist Chips -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">2. Assist Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Atajos de acción inteligente y disparadores:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <m3-chip type="assist" icon="event" (action)="incrementClicks()">
                  Agendar reunión
                </m3-chip>
                <m3-chip type="assist" icon="share" (action)="incrementClicks()">
                  Compartir
                </m3-chip>
                <m3-chip type="assist" icon="bookmark" (action)="incrementClicks()">
                  Guardar
                </m3-chip>
              </div>
            </div>

            <!-- 3. Input Chips -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">3. Input Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Entidades removibles por el usuario:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                @for (tag of inputTags(); track tag) {
                  <m3-chip type="input" [removable]="true" (remove)="removeTag(tag)">
                    {{ tag }}
                  </m3-chip>
                }
                @if (inputTags().length === 0) {
                  <button type="button" (click)="resetTags()" class="focus-ring-m3 rounded px-1.5 py-0.5 text-xs text-primary font-semibold hover:underline cursor-pointer">
                    Restaurar tags
                  </button>
                }
              </div>
            </div>

            <!-- 4. Suggestion Chips -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">4. Suggestion Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Sugerencias dinámicas del sistema:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <m3-chip type="suggestion" icon="auto_awesome" (action)="incrementClicks()">
                  Resumir con IA
                </m3-chip>
                <m3-chip type="suggestion" icon="translate" (action)="incrementClicks()">
                  Traducir
                </m3-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. M3 TEXT FIELDS / INPUTS MODERNOS (VARIANTS, DIALOGOS VS FORMULARIOS, AFFIXES & :user-invalid) -->
        <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub space-y-5">
          <div class="flex items-center justify-between pb-1">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base">edit_square</span>
                m3.material.io/components/text-fields/overview • Modern Web &amp; M3 Expressive
              </div>
              <h3 class="text-title-md font-bold text-main">Text Fields Modernos: Filled (Diálogos) vs Outlined (Formularios)</h3>
              <p class="text-xs text-muted mt-1 max-w-4xl leading-relaxed">
                Superficies Stage Recess 16px: ícono leading estático (solo cambia color según M3), entrada <code>@starting-style</code> en botones trailing y helper, shake sutil al invalidar, <code>[prefix]/[suffix]</code> con <code>aria-describedby</code>, <code>[passwordToggle]</code>, <code>[readonly]</code>, validación diferida <code>:user-invalid</code> y <code>[autoGrow]</code>.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 1. Filled Text Field with Clear -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">1. Filled + Clear + Autofill</span>
                <p class="text-[11px] text-muted mt-0.5">Superficie tonal para acciones rápidas:</p>
              </div>
              <div class="pt-1">
                <m3-text-field
                  variant="filled"
                  label="Nombre Completo"
                  placeholder="Ej. Alex Johnson"
                  icon="person"
                  autocomplete="name"
                  [clearable]="true"
                  [(value)]="demoFilledText"
                  supportingText="Floating label interno sin cortes" />
              </div>
              <div class="text-[11px] font-mono text-muted truncate">
                Valor: "{{ demoFilledText() }}"
              </div>
            </div>

            <!-- 2. Outlined Text Field with Prefix / Suffix -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">2. Outlined + Prefix / Suffix</span>
                <p class="text-[11px] text-muted mt-0.5">Unidades inline con vínculo WCAG:</p>
              </div>
              <div class="pt-1">
                <m3-text-field
                  variant="outlined"
                  label="Presupuesto"
                  placeholder="250.00"
                  type="number"
                  inputMode="decimal"
                  prefix="S/"
                  suffix="PEN"
                  [(value)]="demoBudgetText"
                  supportingText="Prefix y suffix ligados al screen reader" />
              </div>
              <div class="text-[11px] font-mono text-muted truncate">
                Monto: S/ {{ demoBudgetText() || '0.00' }} PEN
              </div>
            </div>

            <!-- 3. Password Toggle + Deferred Validation -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-error uppercase tracking-wider block">3. Password Reveal &amp; Error</span>
                <p class="text-[11px] text-muted mt-0.5">Toggle accesible + estado error reactivo:</p>
              </div>
              <div class="pt-1">
                <m3-text-field
                  variant="filled"
                  label="Contraseña"
                  type="password"
                  icon="lock"
                  autocomplete="current-password"
                  [passwordToggle]="true"
                  [errorText]="demoErrorText() ? 'La clave debe tener al menos 8 caracteres' : null"
                  [(value)]="demoPasswordText"
                  supportingText="Usa visibility_off con aria-pressed" />
              </div>
              <div class="flex items-center justify-between pt-1">
                <button
                  type="button"
                  (click)="toggleDemoError()"
                  class="focus-ring-m3 rounded px-1.5 py-0.5 text-[11px] text-primary font-semibold hover:underline cursor-pointer">
                  {{ demoErrorText() ? 'Quitar error' : 'Simular error' }}
                </button>
                <span class="text-[11px] font-mono text-muted">
                  {{ demoErrorText() ? 'isError: true' : 'isError: false' }}
                </span>
              </div>
            </div>

            <!-- 4. Modern Auto-Grow Textarea (field-sizing: content) -->
            <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">4. Auto-Grow (field-sizing)</span>
                <p class="text-[11px] text-muted mt-0.5">Crece verticalmente sin salto lateral:</p>
              </div>
              <div class="pt-1">
                <m3-text-field
                  variant="outlined"
                  label="Criterios de Aceptación"
                  placeholder="Escribí varias líneas..."
                  icon="notes"
                  [multiline]="true"
                  [autoGrow]="true"
                  [maxlength]="220"
                  [(value)]="demoMultilineText"
                  supportingText="min 3lh / max 10lh con field-sizing" />
              </div>
            </div>
          </div>

          <!-- Patrón Real: Cuándo usar Filled en Diálogos vs Outlined en Formularios -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Caso A: Dialog / Modal Breve -->
            <div class="bg-surface-high/60 border border-outline-sub p-5 rounded-m3-xl space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold text-primary uppercase">Patrón Diálogo / Modal Breve</span>
                  <h4 class="text-sm font-bold text-main">Usá <code>variant="filled"</code> (1–3 campos focales)</h4>
                </div>
                <span class="material-symbols-rounded text-primary" aria-hidden="true">dialogs</span>
              </div>

              <div class="bg-surface p-4 rounded-m3-lg border border-outline-sub shadow-sm space-y-3">
                <m3-text-field
                  variant="filled"
                  label="Cobro rápido"
                  type="number"
                  inputMode="decimal"
                  prefix="S/"
                  enterkeyhint="done"
                  icon="payments"
                  [(value)]="demoDialogAmount"
                  supportingText="Sobre el fondo del modal, Filled da jerarquía clara al foco" />

                <div class="flex justify-end gap-2 pt-1">
                  <m3-button variant="text" size="sm" (action)="demoDialogAmount.set('120.00')">Reset</m3-button>
                  <m3-button variant="filled" size="sm" icon="check" (action)="triggerActionSnackbar('Cobro registrado: S/ ' + demoDialogAmount())">
                    Confirmar
                  </m3-button>
                </div>
              </div>
            </div>

            <!-- Caso B: Formulario Largo con :user-invalid -->
            <form (submit)="onDemoFormSubmit($event)" class="bg-surface-box border border-outline-sub p-5 rounded-m3-xl space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold text-primary uppercase">Patrón Formulario Extenso (:user-invalid)</span>
                  <h4 class="text-sm font-bold text-main">Usá <code>variant="outlined"</code> + validación tras blur/submit</h4>
                </div>
                <span class="material-symbols-rounded text-primary" aria-hidden="true">dynamic_form</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <m3-text-field
                  id="demo-form-email"
                  name="email"
                  variant="outlined"
                  label="Email corporativo"
                  type="email"
                  icon="mail"
                  autocomplete="email"
                  enterkeyhint="next"
                  [required]="true"
                  [showValidState]="true"
                  [(value)]="demoFormEmail"
                  supportingText="No muestra rojo antes de perder foco" />

                <m3-text-field
                  id="demo-form-code"
                  name="siteCode"
                  variant="outlined"
                  label="Código Sede"
                  icon="badge"
                  pattern="^[A-Z]{2}-[0-9]{3}$"
                  placeholder="LM-104"
                  enterkeyhint="done"
                  [required]="true"
                  [showValidState]="true"
                  [(value)]="demoFormCode"
                  supportingText="Formato requerido: AA-123" />
              </div>

              <m3-text-field
                id="demo-form-folio"
                name="auditFolio"
                variant="outlined"
                label="Folio asignado ([readonly])"
                icon="verified"
                [readonly]="true"
                value="AUD-2026-0091"
                supportingText="Dato bloqueado copiable con foco intacto (a diferencia de disabled)" />

              <div class="flex items-center justify-between gap-3 pt-1">
                <span class="text-[11px] text-muted">Probá borrar un campo y salir (<code>blur</code>) para ver <code>:user-invalid</code>.</span>
                <m3-button type="submit" variant="tonal" size="sm" icon="task_alt">Validar Form</m3-button>
              </div>
            </form>
          </div>

          <div class="overflow-x-auto border border-outline-sub rounded-m3-lg">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-surface-high text-[10px] uppercase tracking-wider text-muted font-bold">
                <tr>
                  <th class="py-2 px-3">Contexto UI</th>
                  <th class="py-2 px-3">Variante Recomendada</th>
                  <th class="py-2 px-3">Por qué (M3 Spec)</th>
                  <th class="py-2 px-3">Estándar Web Moderno</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-sub/60">
                @for (spec of textFieldContextSpecs; track spec.context) {
                  <tr class="hover:bg-surface-low">
                    <td class="py-2 px-3 font-bold text-main">{{ spec.context }}</td>
                    <td class="py-2 px-3 font-mono text-[11px] text-primary">{{ spec.variantToUse }}</td>
                    <td class="py-2 px-3 text-muted">{{ spec.rationale }}</td>
                    <td class="py-2 px-3 font-mono text-[11px] text-main">{{ spec.modernWebPattern }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 7. M3 PROGRESS INDICATORS & LOADING STATES (UNIFIED LIVE GEOMETRY LAB) -->
        <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub space-y-5">
          <!-- Header aligned with the rest of ComponentsLab sections -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base">hourglass_empty</span>
                m3.material.io/components/progress-indicators/overview • Live Geometry Engine
              </div>
              <h3 class="text-title-md font-bold text-main">Linear &amp; Circular Progress Indicators</h3>
              <p class="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                Ecuaciones sinusoidales en vivo, atenuación de bordes <code>A(p)</code> (<code>0.10</code> / <code>0.95</code>), brecha de <code>4dp</code>, Stop Dot de <code>Ø 4dp</code> y cuantización circular entera <code>N</code>.
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap self-start sm:self-center">
              <button
                type="button"
                (click)="toggleProgressBlueprint()"
                [attr.aria-pressed]="demoProgressBlueprint()"
                [class]="demoProgressBlueprint() ? 'bg-sec-box text-on-sec-box border-primary' : 'bg-surface-high text-main border-outline-sub'"
                class="btn-m3 state-layer focus-ring-m3 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border cursor-pointer">
                <span
                  class="w-2 h-2 rounded-full transition-colors"
                  [class]="demoProgressBlueprint() ? 'bg-error' : 'bg-outline'"
                  aria-hidden="true"></span>
                <span>Modo Blueprint (Cotas)</span>
              </button>

              <button
                type="button"
                (click)="toggleProgressPaused()"
                [attr.aria-pressed]="demoProgressPaused()"
                class="btn-m3 state-layer focus-ring-m3 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-on-primary shadow-xs cursor-pointer flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">
                  {{ demoProgressPaused() ? 'play_arrow' : 'pause' }}
                </span>
                <span>{{ demoProgressPaused() ? 'Reanudar Onda' : 'Pausar Onda' }}</span>
              </button>

              <button
                type="button"
                (click)="toggleProgressWavy()"
                [attr.aria-pressed]="demoProgressWavy()"
                class="btn-m3 state-layer focus-ring-m3 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-high text-main border border-outline-sub cursor-pointer flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">waves</span>
                <span>{{ demoProgressWavy() ? 'Ondas (Wavy)' : 'Recto (Classic)' }}</span>
              </button>
            </div>
          </div>

          <!-- Grid Principal (Columna Izquierda 7 cols: Renderizado en Vivo | Columna Derecha 5 cols: Controles & Telemetría) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            <!-- COLUMNA IZQUIERDA: RENDERIZADO EN VIVO (0, 1, 2, 3) -->
            <section class="lg:col-span-7 flex flex-col gap-6">

              <!-- 0. Escena Oficial M3 Expressive (Ciclo automático 0% -> 100% -> Aplanamiento Final) -->
              <div class="rounded-m3-xl p-6 bg-surface-low border border-outline-sub shadow-xs space-y-5">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                      Réplica Exacta de Documentación M3
                    </span>
                    <h4 class="text-title-sm font-bold text-main mt-1.5">
                      Carga Determinada (0% &rarr; 100%) con Aplanamiento Final
                    </h4>
                  </div>
                  <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-sec-box text-on-sec-box">
                    {{ showcaseAutoPercent() }}%
                  </span>
                </div>

                <div class="min-h-[112px] flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 py-3 px-4 rounded-m3-lg bg-surface-box border border-outline-sub/60">
                  <div class="w-full max-w-[230px]">
                    <m3-linear-progress
                      [value]="showcaseAutoProgress()"
                      [color]="demoLinearColor()"
                      [wavy]="demoProgressWavy()"
                      [paused]="!showcasePlaying() || demoProgressPaused()"
                      [showStop]="demoProgressShowStop()"
                      customClass="m3-progress-raf-driven"
                      size="md" />
                  </div>
                  <div class="shrink-0">
                    <m3-circular-progress
                      [value]="showcaseAutoProgress()"
                      [color]="demoProgressColor()"
                      [wavy]="demoProgressWavy()"
                      [paused]="!showcasePlaying() || demoProgressPaused()"
                      customClass="m3-progress-raf-driven"
                      size="md" />
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-outline-sub/70 text-xs text-muted gap-3">
                  <span>Avance con <code>emphasized-decelerate</code> (<code>400ms</code>) y atenuación de amplitud a destino <code>A(p) &rarr; 0</code> en <code>200ms</code>.</span>
                  <button
                    type="button"
                    (click)="toggleShowcasePlaying()"
                    [attr.aria-label]="showcasePlaying() ? 'Pausar ciclo automático' : 'Reanudar ciclo automático'"
                    title="Pausar / Reanudar ciclo de carga 0% a 100%"
                    class="btn-m3 state-layer focus-ring-m3 w-9 h-9 rounded-full flex items-center justify-center bg-sec-box text-on-sec-box shrink-0 cursor-pointer">
                    <span class="material-symbols-rounded text-base" aria-hidden="true">
                      {{ showcasePlaying() ? 'pause' : 'play_arrow' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- 1. Linear Wavy Progress Indicator -->
              <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-5 shadow-xs">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h4 class="text-title-sm font-bold text-main">1. Linear Wavy Progress Indicator</h4>
                    <p class="text-xs text-muted mt-0.5">
                      Onda viajera <code>y(x,t) = y_c + A(p)·sin(2πx/λ − φ(t))</code> con pista discontinua y Stop Dot canónico.
                    </p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sec-box text-on-sec-box">
                    {{ demoProgressIndeterminate() ? 'Indeterminate' : 'Determinate' }}
                  </span>
                </div>

                <div class="space-y-4" [attr.dir]="demoProgressRtl() ? 'rtl' : 'ltr'">
                  <!-- Variante Estándar (4dp) -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-medium text-muted gap-2 flex-wrap">
                      <span>Variante Estándar (Stroke: 4dp, H: {{ labLinearStdRef()?.containerHeight() ?? 10 }}dp)</span>
                      <span class="font-mono">A_ef = <strong class="text-primary">{{ waveEffectiveAmplitude().toFixed(2) }}</strong> dp</span>
                    </div>
                    <div class="w-full rounded-m3-lg p-3.5 bg-surface-low border border-outline-sub/70">
                      <m3-linear-progress
                        #labLinearStd
                        [value]="labProgressValue()"
                        [color]="demoLinearColor()"
                        [wavy]="demoProgressWavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="demoProgressPaused()"
                        [blueprint]="demoProgressBlueprint()"
                        [showStop]="demoProgressShowStop()"
                        size="md" />
                    </div>
                  </div>

                  <!-- Variante Thick (8dp) -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-medium text-muted gap-2 flex-wrap">
                      <span>Variante Thick (Stroke: 8dp, H: {{ labLinearThickRef()?.containerHeight() ?? 14 }}dp)</span>
                      <span class="font-mono">Gap = 4dp • Stop Dot Ø 4dp (r = 2dp)</span>
                    </div>
                    <div class="w-full rounded-m3-lg p-3.5 bg-surface-low border border-outline-sub/70">
                      <m3-linear-progress
                        #labLinearThick
                        [value]="labProgressValue()"
                        [color]="demoLinearColor()"
                        [wavy]="demoProgressWavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="demoProgressPaused()"
                        [blueprint]="demoProgressBlueprint()"
                        [showStop]="demoProgressShowStop()"
                        size="lg" />
                    </div>
                  </div>

                  <!-- Streaming + Buffer (8dp) & Compact (2dp) -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div class="rounded-m3-lg p-3 bg-surface-low border border-outline-sub/70 space-y-2">
                      <div class="flex justify-between text-[11px] font-mono text-muted">
                        <span>Streaming + Buffer (8dp)</span>
                        <span>{{ demoProgressIndeterminate() ? 'Dual-pulse' : 'Buf ' + demoProgressBuffer() + '%' }}</span>
                      </div>
                      <m3-linear-progress
                        [value]="labProgressValue()"
                        [buffer]="labProgressBuffer()"
                        [color]="demoLinearColor()"
                        [wavy]="demoProgressWavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="demoProgressPaused()"
                        [blueprint]="demoProgressBlueprint()"
                        [showStop]="demoProgressShowStop()"
                        size="lg" />
                    </div>

                    <div class="rounded-m3-lg p-3 bg-surface-low border border-outline-sub/70 space-y-2">
                      <div class="flex justify-between text-[11px] font-mono text-muted">
                        <span>Compact / Edge (2dp)</span>
                        <span>sm • min 40dp</span>
                      </div>
                      <m3-linear-progress
                        [value]="labProgressValue()"
                        [color]="demoLinearColor()"
                        [wavy]="demoProgressWavy()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="demoProgressPaused()"
                        [blueprint]="demoProgressBlueprint()"
                        [showStop]="demoProgressShowStop()"
                        size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Circular Wavy Progress Indicator -->
              <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-5 shadow-xs">
                <div>
                  <h4 class="text-title-sm font-bold text-main">2. Circular Wavy Progress Indicator</h4>
                  <p class="text-xs text-muted mt-0.5">
                    Coordenadas polares <code>r(θ,t) = R₀ + A(p)·sin(Nθ − φ(t))</code> con <code>N = round(2πR₀ / λ_circ)</code>.
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Circular Canónico (48dp) -->
                  <div class="rounded-m3-lg p-4 bg-surface-low border border-outline-sub/70 flex items-center gap-4">
                    <div class="w-20 h-20 flex items-center justify-center shrink-0">
                      <m3-circular-progress
                        #labCircularMd
                        size="md"
                        [value]="labProgressValue()"
                        [color]="demoProgressColor()"
                        [wavy]="demoProgressWavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="demoProgressPaused()"
                        [blueprint]="demoProgressBlueprint()" />
                    </div>
                    <div class="flex flex-col gap-1">
                      <span class="text-xs font-bold text-main">Canónico (48dp)</span>
                      <span class="text-xs font-mono text-muted">
                        Ciclos enteros N: <strong class="text-primary">{{ labCircularMdRef()?.waveLobes() ?? 9 }}</strong>
                      </span>
                      <span class="text-xs font-mono text-muted">
                        Radio R₀: <strong class="text-main">{{ (labCircularMdRef()?.radiusDp() ?? 18).toFixed(1) }}</strong> dp
                      </span>
                    </div>
                  </div>

                  <!-- Circular Expressive (84dp) -->
                  <div class="rounded-m3-lg p-4 bg-surface-low border border-outline-sub/70 flex items-center gap-4">
                    <div class="w-24 h-24 flex items-center justify-center shrink-0">
                      <m3-circular-progress
                        #labCircularLg
                        [diameter]="84"
                        [value]="labProgressValue()"
                        [color]="demoProgressColor()"
                        [wavy]="demoProgressWavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="demoProgressPaused()"
                        [blueprint]="demoProgressBlueprint()" />
                    </div>
                    <div class="flex flex-col gap-1">
                      <span class="text-xs font-bold text-main">Expressive (84dp)</span>
                      <span class="text-xs font-mono text-muted">
                        Ciclos enteros N: <strong class="text-primary">{{ labCircularLgRef()?.waveLobes() ?? 13 }}</strong>
                      </span>
                      <span class="text-xs font-mono text-muted">
                        Radio R₀: <strong class="text-main">{{ (labCircularLgRef()?.radiusDp() ?? 31.5).toFixed(1) }}</strong> dp
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Sub-row: Compact 24px (sm flat) & Four-Color Indeterminate -->
                <div class="pt-3 border-t border-outline-sub flex items-center justify-between flex-wrap gap-4">
                  <div class="flex items-center gap-3">
                    <m3-circular-progress
                      size="sm"
                      [value]="labProgressValue()"
                      [color]="demoProgressColor()"
                      [paused]="demoProgressPaused()"
                      [wavy]="false" />
                    <span class="text-xs font-mono text-muted">24dp (sm • plano en tamaños chicos)</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <m3-circular-progress
                      [value]="null"
                      size="md"
                      [wavy]="demoProgressWavy()"
                      [amplitude]="labProgressAmplitude()"
                      [wavelength]="labProgressWavelength()"
                      [speed]="labProgressSpeed()"
                      [paused]="demoProgressPaused()"
                      [blueprint]="demoProgressBlueprint()"
                      color="four-color" />
                    <span class="text-xs font-mono font-bold text-primary">Four-Color (Indeterminate)</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- COLUMNA DERECHA: CONTROLES MATEMÁTICOS, TELEMETRÍA A(p) & DIRECTRICES M3 -->
            <aside class="lg:col-span-5 flex flex-col gap-6">

              <!-- Card A: Parámetros Matemáticos en Tiempo Real -->
              <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-5 shadow-xs">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="text-title-sm font-bold text-main">Parámetros Matemáticos en Tiempo Real</h4>
                  <button
                    type="button"
                    (click)="resetWaveDefaults()"
                    class="btn-m3 state-layer focus-ring-m3 text-xs font-semibold px-3 py-1 rounded-full bg-primary-box text-on-primary-box cursor-pointer">
                    Valores M3 Default
                  </button>
                </div>

                <!-- Progreso p -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs font-semibold">
                    <label for="lab-progress-norm" class="text-main">Progreso normalizado (p)</label>
                    <span class="font-mono text-primary">
                      {{ (demoProgressValue() / 100).toFixed(2) }} ({{ demoProgressValue() }}%)
                    </span>
                  </div>
                  <input
                    id="lab-progress-norm"
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    [disabled]="demoProgressIndeterminate()"
                    [value]="demoProgressValue()"
                    (input)="onProgressSliderChange($event)"
                    [class.opacity-40]="demoProgressIndeterminate()"
                    class="m3-lab-slider focus-ring-m3 w-full cursor-pointer" />
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    @for (preset of waveProgressPresets; track preset.value) {
                      <button
                        type="button"
                        (click)="applyWaveProgressPreset(preset.value)"
                        class="text-[11px] px-2.5 py-1 rounded-m3-sm bg-surface-low border border-outline-sub hover:border-primary text-main cursor-pointer">
                        {{ preset.label }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Longitud de onda lambda -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs font-semibold">
                    <label for="lab-wavelength" class="text-main">Longitud de onda (λ)</label>
                    <span class="font-mono text-main">{{ demoProgressWavelength() }} dp</span>
                  </div>
                  <input
                    id="lab-wavelength"
                    type="range"
                    min="16"
                    max="80"
                    step="1"
                    [disabled]="!demoProgressWavy()"
                    [value]="demoProgressWavelength()"
                    (input)="setClampedRange(demoProgressWavelength, 16, 80, $event)"
                    [class.opacity-40]="!demoProgressWavy()"
                    class="m3-lab-slider focus-ring-m3 w-full cursor-pointer" />
                </div>

                <!-- Amplitud máxima A_max -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs font-semibold">
                    <label for="lab-amplitude" class="text-main">Amplitud máxima (A_max)</label>
                    <span class="font-mono text-main">{{ demoProgressAmplitude().toFixed(1) }} dp</span>
                  </div>
                  <input
                    id="lab-amplitude"
                    type="range"
                    min="0"
                    max="8"
                    step="0.2"
                    [disabled]="!demoProgressWavy()"
                    [value]="demoProgressAmplitude()"
                    (input)="setClampedRange(demoProgressAmplitude, 0, 8, $event)"
                    [class.opacity-40]="!demoProgressWavy()"
                    class="m3-lab-slider focus-ring-m3 w-full cursor-pointer" />
                </div>

                <!-- Velocidad de fase v -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs font-semibold">
                    <label for="lab-speed" class="text-main">Velocidad de fase (v)</label>
                    <span class="font-mono text-main">
                      {{ demoProgressSpeed() }} dp/s ({{ wavePhaseHz().toFixed(2) }} Hz)
                    </span>
                  </div>
                  <input
                    id="lab-speed"
                    type="range"
                    min="0"
                    max="120"
                    step="2"
                    [disabled]="!demoProgressWavy()"
                    [value]="demoProgressSpeed()"
                    (input)="setClampedRange(demoProgressSpeed, 0, 120, $event)"
                    [class.opacity-40]="!demoProgressWavy()"
                    class="m3-lab-slider focus-ring-m3 w-full cursor-pointer" />
                </div>

                <!-- Modo Indeterminado + Opciones M3 (Stop 4dp, RTL, Color) -->
                <div class="pt-3 border-t border-outline-sub space-y-3">
                  <div class="flex items-center justify-between gap-2">
                    <div>
                      <div class="text-xs font-semibold text-main">Modo Indeterminado</div>
                      <div class="text-[11px] text-muted">Onda viajera con ancho variable y doble brecha de 4dp</div>
                    </div>
                    <button
                      type="button"
                      (click)="toggleProgressMode()"
                      [attr.aria-pressed]="demoProgressIndeterminate()"
                      [class]="demoProgressIndeterminate() ? 'bg-primary text-on-primary' : 'bg-surface-high text-muted border border-outline-sub'"
                      class="btn-m3 focus-ring-m3 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer">
                      {{ demoProgressIndeterminate() ? 'Activo' : 'Inactivo' }}
                    </button>
                  </div>

                  <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-outline-sub/60">
                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        (click)="toggleProgressStop()"
                        [class]="demoProgressShowStop() ? 'bg-sec-box text-on-sec-box' : 'bg-surface-high text-muted'"
                        class="btn-m3 focus-ring-m3 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer">
                        Stop 4dp: {{ demoProgressShowStop() ? 'On' : 'Off' }}
                      </button>
                      <button
                        type="button"
                        (click)="toggleProgressRtl()"
                        [class]="demoProgressRtl() ? 'bg-sec-box text-on-sec-box' : 'bg-surface-high text-muted'"
                        class="btn-m3 focus-ring-m3 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer">
                        {{ demoProgressRtl() ? 'RTL' : 'LTR' }}
                      </button>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        (click)="demoProgressColor.set('primary')"
                        [class.ring-2]="demoProgressColor() === 'primary'"
                        class="focus-ring-m3 w-5 h-5 rounded-full bg-primary ring-offset-1 ring-primary cursor-pointer"
                        aria-label="Color Primary"></button>
                      <button
                        type="button"
                        (click)="demoProgressColor.set('secondary')"
                        [class.ring-2]="demoProgressColor() === 'secondary'"
                        class="focus-ring-m3 w-5 h-5 rounded-full bg-secondary ring-offset-1 ring-secondary cursor-pointer"
                        aria-label="Color Secondary"></button>
                      <button
                        type="button"
                        (click)="demoProgressColor.set('tertiary')"
                        [class.ring-2]="demoProgressColor() === 'tertiary'"
                        class="focus-ring-m3 w-5 h-5 rounded-full bg-tertiary ring-offset-1 ring-tertiary cursor-pointer"
                        aria-label="Color Tertiary"></button>
                      <button
                        type="button"
                        (click)="demoProgressColor.set('error')"
                        [class.ring-2]="demoProgressColor() === 'error'"
                        class="focus-ring-m3 w-5 h-5 rounded-full bg-error ring-offset-1 ring-error cursor-pointer"
                        aria-label="Color Error"></button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card B: Ecuaciones & Telemetría A(p) -->
              <div class="bg-surface-box border border-outline-sub p-5 rounded-m3-xl space-y-3 shadow-xs">
                <h4 class="font-bold text-sm text-main">Ecuaciones &amp; Telemetría A(p)</h4>
                <div class="p-3.5 rounded-m3-lg bg-surface-high border border-outline-sub font-mono text-[11px] leading-relaxed space-y-1">
                  <div>
                    f(p) = <strong class="text-primary">{{ waveEnvelope().factor.toFixed(3) }}</strong>
                    <span class="text-muted"> ({{ waveEnvelope().zoneLabel }})</span>
                  </div>
                  <div>
                    A(p) = A_max · f(p) = <strong class="text-primary">{{ waveEffectiveAmplitude().toFixed(2) }} dp</strong>
                  </div>
                  <div>
                    k = 2π / λ = <strong class="text-main">{{ waveNumberK().toFixed(4) }} rad/dp</strong>
                  </div>
                  <div>
                    λ_circ = <strong class="text-main">{{ circularWavelength().toFixed(2) }} dp</strong>
                    <span class="text-muted"> (15dp @ λ=40dp)</span>
                  </div>
                  <div>
                    φ(t) = <strong #phiTelemetryReadout class="text-main">0.00</strong> rad
                  </div>
                </div>
                <p class="text-[11px] text-muted leading-normal">
                  Activa <strong>Modo Blueprint (Cotas)</strong> arriba para ver las líneas guía de <code>±A(p)</code>, la brecha exacta de <code>4dp</code> entre el fin de la onda y la pista inactiva, y el punto de parada incrustado.
                </p>
              </div>

              <!-- Card C: Umbrales de Espera, Botones en Carga & Skeleton Shimmer -->
              <div class="bg-surface-box border border-outline-sub p-5 rounded-m3-xl space-y-4 shadow-xs">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-main">Umbrales Temporales, Botones &amp; Skeleton</span>
                  <button
                    type="button"
                    (click)="toggleSkeleton()"
                    class="text-[11px] text-primary font-bold hover:underline cursor-pointer">
                    {{ demoSkeletonLoaded() ? 'Ver Skeleton' : 'Ver Contenido' }}
                  </button>
                </div>

                <!-- Reglas de tiempo (<200ms, 200ms-5s, >5s) -->
                <div class="grid grid-cols-3 gap-2">
                  @for (rule of loadingTimingSpecs; track rule.windowLabel) {
                    <div class="p-2.5 bg-surface-low rounded-m3-md border border-outline-sub">
                      <span class="text-[11px] font-extrabold text-primary font-mono block">{{ rule.windowLabel }}</span>
                      <span class="text-[10px] font-semibold text-main block mt-0.5">{{ rule.componentToUse }}</span>
                    </div>
                  }
                </div>

                <!-- Progreso en botones (contraste >= 3:1, plano y sin track) -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div class="flex items-center gap-2">
                    <m3-button variant="filled" size="sm" [loading]="true">Procesando...</m3-button>
                    <m3-button variant="outlined" size="sm" [loading]="true">Sincronizando</m3-button>
                  </div>
                  <span class="text-[10px] font-mono text-muted">currentColor • ≥ 3:1</span>
                </div>

                <!-- Skeleton Shimmer -->
                <div class="p-3.5 bg-surface-high rounded-m3-lg border border-outline-sub">
                  @if (!demoSkeletonLoaded()) {
                    <div class="space-y-2.5">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 m3-skeleton m3-skeleton-circle m3-skeleton-shimmer shrink-0"></div>
                        <div class="space-y-1.5 flex-1">
                          <div class="h-3 w-3/4 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                          <div class="h-2.5 w-1/2 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                        </div>
                      </div>
                      <div class="h-2.5 w-full m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                    </div>
                  } @else {
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-primary-box text-on-primary-box flex items-center justify-center font-bold text-xs shrink-0">
                        M3
                      </div>
                      <div class="min-w-0">
                        <h5 class="text-xs font-bold text-main truncate">Material 3 Expressive</h5>
                        <p class="text-[11px] text-muted truncate">Zero Layout Shift completado</p>
                      </div>
                    </div>
                  }
                </div>

                <!-- Directrices Oficiales M3 (Guidelines Summary) -->
                <div class="pt-3 border-t border-outline-sub/60 space-y-1.5">
                  <div class="text-[11px] font-bold text-main">Directrices M3 (Guidelines Checklist)</div>
                  <div class="grid grid-cols-1 gap-1.5">
                    @for (guide of progressGuidelinesSpecs; track guide.title) {
                      <div class="px-2.5 py-1.5 rounded-m3-sm bg-surface-low border border-outline-sub/60 text-[11px] leading-snug">
                        <strong class="text-primary font-semibold">{{ guide.title }}:</strong>
                        <span class="text-muted"> {{ guide.rule }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <!-- 4. M3 EXPRESSIVE SHAPE-MORPHING LOADING INDICATOR & PULL-TO-REFRESH -->
          <div class="mt-6 bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs">
            <div class="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-outline-sub">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  <span class="material-symbols-rounded text-base text-primary">interests</span>
                  Material 3 Expressive • Shape Morphing Loading Indicator
                </div>
                <h4 class="text-title-md font-bold text-main">Loading Indicator vs. Progress Indicator</h4>
                <p class="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                  A diferencia del progreso porcentual, el <strong>Loading Indicator</strong> de M3 Expressive muta orgánicamente su geometría entre pentágono redondeado, squircle, flor de 4 pétalos y círculo, con rotación continua acelerada. Diseñado para <em>Pull-to-refresh</em> y feedback de carga no determinista.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <m3-button
                  variant="tonal"
                  icon="refresh"
                  (action)="triggerPhotosRefresh()">
                  Simular Pull-to-Refresh
                </m3-button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
              <!-- Left: Morphing Showcase Across Sizes & Roles -->
              <div class="lg:col-span-7 space-y-5">
                <div class="space-y-2">
                  <span class="text-xs font-bold text-main uppercase tracking-wider">Morfología y Escala Dimensional</span>
                  <p class="text-xs text-muted">Interpolación de splines cúbicos acelerada por GPU con cero recálculo de layout:</p>
                </div>

                <div class="flex items-center justify-around p-6 bg-surface-high rounded-m3-lg border border-outline-sub">
                  <!-- Small (32px) -->
                  <div class="flex flex-col items-center gap-2.5">
                    <m3-loading-indicator size="sm" [color]="demoProgressColor()" />
                    <span class="text-[11px] font-mono text-muted">sm (32px)</span>
                  </div>

                  <!-- Medium (48px) - Canonical -->
                  <div class="flex flex-col items-center gap-2.5">
                    <m3-loading-indicator size="md" [color]="demoProgressColor()" />
                    <span class="text-[11px] font-mono text-primary font-bold">md (48px) Canónico</span>
                  </div>

                  <!-- Large (64px) - Hero -->
                  <div class="flex flex-col items-center gap-2.5">
                    <m3-loading-indicator size="lg" [color]="demoProgressColor()" />
                    <span class="text-[11px] font-mono text-muted">lg (64px) Hero</span>
                  </div>

                  <!-- Contained / Surface Pill -->
                  <div class="flex flex-col items-center gap-2.5">
                    <m3-loading-indicator size="md" [contained]="true" [color]="demoProgressColor()" />
                    <span class="text-[11px] font-mono text-muted">Contained Pill</span>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3 text-xs text-muted">
                  <div class="p-3 bg-surface rounded-m3-md border border-outline-sub">
                    <span class="font-bold text-main block mb-0.5">1. Pentágono Suave</span>
                    <span class="text-[11px]">5 vértices redondeados con tensión orgánica.</span>
                  </div>
                  <div class="p-3 bg-surface rounded-m3-md border border-outline-sub">
                    <span class="font-bold text-main block mb-0.5">2. Squircle M3</span>
                    <span class="text-[11px]">Transición armónica a curvatura continua.</span>
                  </div>
                  <div class="p-3 bg-surface rounded-m3-md border border-outline-sub">
                    <span class="font-bold text-main block mb-0.5">3. Trébol Floral</span>
                    <span class="text-[11px]">Expansión expresiva de 4 lóbulos simétricos.</span>
                  </div>
                </div>
              </div>

              <!-- Right: Realistic Photos Mockup Replicating Google M3 Specification -->
              <div class="lg:col-span-5 flex justify-center">
                <div class="w-72 bg-surface-lowest border-2 border-outline-sub rounded-[36px] p-3 shadow-lg space-y-3 relative overflow-hidden">
                  <!-- Status Bar -->
                  <div class="flex items-center justify-between px-3 text-[11px] font-bold text-muted">
                    <span>9:30</span>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-xs">signal_cellular_alt</span>
                      <span class="material-symbols-rounded text-xs">wifi</span>
                      <span class="material-symbols-rounded text-xs">battery_full</span>
                    </div>
                  </div>

                  <!-- App Bar (Photos) -->
                  <div class="flex items-center justify-between px-2 pt-1">
                    <h5 class="text-base font-bold text-main tracking-tight">Photos</h5>
                    <div class="flex items-center gap-2">
                      <button type="button" aria-label="Opciones de galería" class="focus-ring-m3 p-1 rounded-full text-muted hover:text-main cursor-pointer">
                        <span class="material-symbols-rounded text-lg" aria-hidden="true">more_vert</span>
                      </button>
                      <div class="w-7 h-7 rounded-full bg-secondary-box text-on-secondary-box font-bold text-xs flex items-center justify-center">
                        A
                      </div>
                    </div>
                  </div>

                  <!-- App Canvas / Feed Simulation -->
                  <div class="h-48 bg-surface-low rounded-m3-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-outline-sub/60">
                    @if (demoPhotosRefreshing()) {
                      <!-- Pull-to-refresh contained shape-morphing loader over surface -->
                      <div class="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <m3-loading-indicator size="md" [contained]="true" [elevated]="true" [color]="demoProgressColor()" />
                        <span class="text-[11px] font-semibold text-muted tracking-wide">Actualizando...</span>
                      </div>
                    } @else {
                      <div class="flex flex-col items-center gap-2 text-center">
                        <span class="material-symbols-rounded text-3xl text-primary">photo_library</span>
                        <span class="text-xs font-bold text-main">Galería al día</span>
                        <span class="text-[11px] text-muted">Toca "Simular Pull-to-Refresh" para ver la animación</span>
                      </div>
                    }
                  </div>

                  <div class="text-center text-[10px] text-muted pb-1">
                    Pull-to-refresh interaction • M3 Expressive
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. EXTENSIONES ESENCIALES WEB: M3 SWITCH, TOP-LAYER SNACKBAR & AUDITORÍA BUGFIXES -->
        <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Web Selection: M3 Switch -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base">toggle_on</span>
                  Web Essential • Selection Control
                </div>
                <h3 class="text-title-md font-bold text-main">M3 Switch (Expressive Morphing Thumb)</h3>
                <p class="text-xs text-muted mt-1 leading-relaxed">
                  Control binario instantáneo con <code>role="switch"</code>, blanco táctil de 48dp y morphing orgánico de thumb (16px &rarr; 24px / 28px).
                </p>
              </div>

              <div class="space-y-4 p-4 bg-surface-low rounded-m3-lg border border-outline-sub">
                <m3-switch
                  label="Alertas clínicas en tiempo real"
                  description="Notifica signos vitales críticos mediante Top-Layer"
                  [(checked)]="switchNotifications" />

                <div class="border-t border-outline-sub/60 pt-3">
                  <m3-switch
                    label="Modo densidad compacta (Desktop)"
                    description="Variante sin ícono interno hasta activar"
                    [withIcons]="false"
                    [(checked)]="switchCompactDensity" />
                </div>

                <div class="border-t border-outline-sub/60 pt-3 flex items-center justify-between">
                  <m3-switch
                    label="Switch deshabilitado (12% / 38%)"
                    [disabled]="true"
                    [checked]="true" />
                  <span class="text-[11px] font-mono text-muted">
                    Estado: {{ switchNotifications() ? 'ON' : 'OFF' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Web Overlays: Top-Layer Snackbar -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs flex flex-col justify-between">
              <div class="space-y-3">
                <div>
                  <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                    <span class="material-symbols-rounded text-base">notifications_active</span>
                    Web Essential • Top-Layer Overlays
                  </div>
                  <h3 class="text-title-md font-bold text-main">Snackbar (<code>popover="manual"</code>) &amp; Menu Popover</h3>
                  <p class="text-xs text-muted mt-1 leading-relaxed">
                    Usa <code>popover="manual"</code> para no cerrarse por accidente al navegar la pantalla (sin <em>light-dismiss</em>) y <code>@starting-style</code> + <code>transition-behavior: allow-discrete</code> para entrada/salida desde el Top Layer.
                  </p>
                </div>

                <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <m3-button
                      variant="filled"
                      icon="campaign"
                      (action)="triggerActionSnackbar('Cambio guardado en preferencias Web M3')">
                      Mostrar Snackbar Manual
                    </m3-button>
                    @if (snackbarUndoCount() > 0) {
                      <span class="text-xs font-mono text-primary font-bold">
                        Deshacer pulsado: {{ snackbarUndoCount() }}×
                      </span>
                    }
                  </div>
                  <p class="text-[11px] text-muted">
                    El Snackbar aparece fijado al borde inferior sobre toda la jerarquía DOM sin conflictos de <code>z-index</code>.
                  </p>
                </div>
              </div>

              <div class="pt-3 border-t border-outline-sub text-[11px] font-mono text-muted flex items-center justify-between">
                <span>Split Menu: popover="auto" (Esc + light-dismiss)</span>
                <span>Toast: popover="manual"</span>
              </div>
            </div>
          </div>

          <!-- Auditoría de Bugs Corregidos en Step 3 -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base">build_circle</span>
                Bugs Estructurales &amp; WCAG Corregidos
              </div>
              <h3 class="text-title-md font-bold text-main">Correcciones Aplicadas en Los 6 Pilares</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              @for (fix of webA11yFixes; track fix.component) {
                <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-1.5">
                  <span class="text-xs font-extrabold text-primary block">{{ fix.component }}</span>
                  <p class="text-[11px] text-muted leading-snug">
                    <strong class="text-main">Antes:</strong> {{ fix.issueFixed }}
                  </p>
                  <p class="text-[11px] text-muted leading-snug">
                    <strong class="text-primary">Ahora:</strong> {{ fix.standardApplied }}
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <m3-snackbar
        [message]="snackbarMessage()"
        actionLabel="Deshacer"
        [(open)]="snackbarOpen"
        (action)="onSnackbarUndo()" />
    </div>
  `
})
export class ComponentsLabComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;

  readonly labLinearStdRef = viewChild<M3LinearProgressComponent>('labLinearStd');
  readonly labLinearThickRef = viewChild<M3LinearProgressComponent>('labLinearThick');
  readonly labCircularMdRef = viewChild<M3CircularProgressComponent>('labCircularMd');
  readonly labCircularLgRef = viewChild<M3CircularProgressComponent>('labCircularLg');
  private readonly phiTelemetryReadoutRef = viewChild<ElementRef<HTMLElement>>('phiTelemetryReadout');

  readonly componentPillars = COMPONENT_PILLAR_SPECS;
  readonly loadingTimingSpecs = LOADING_TIMING_SPECS;
  readonly buttonEmphasisSpecs = BUTTON_EMPHASIS_SPECS;
  readonly webA11yFixes = WEB_A11Y_FIX_SPECS;
  readonly cardGuidelineSpecs = CARD_GUIDELINE_SPECS;
  readonly textFieldContextSpecs = TEXT_FIELD_CONTEXT_SPECS;
  readonly progressGuidelinesSpecs = [
    {
      title: 'Emphasized Decelerate (400ms) + Amplitud (200ms)',
      rule: 'Avance de progreso con medium4 (400ms) y cubic-bezier(0.05, 0.7, 0.1, 1); al llegar a destino (100%), A(p) se reduce en short4 (200ms).'
    },
    {
      title: 'Velocidad Canónica (40 dp/s • 1.00 Hz)',
      rule: 'Fase v = 40 dp/s; ciclo indeterminado suave de 2.4s (lineal) y 2.2s (circular) sin multiplicador 2×.'
    },
    {
      title: 'Ubicación & Un Solo Indicador',
      rule: 'Lineal (mín. 40dp) en el borde de un contenedor; Circular (24–240dp) centrado o en botón. Nunca combinar dos en el mismo grupo.'
    },
    {
      title: 'Indeterminate → Determinate',
      rule: 'Si un proceso pasa de duración desconocida a conocida, transicionar en la misma variante (nunca cambiar de circular a lineal).'
    },
    {
      title: 'Stop Dot (Ø 4dp) & Contraste',
      rule: 'Obligatorio en lineal determinado cuando la pista tiene contraste < 3:1 frente a la superficie; RTL solo invierte lineal.'
    }
  ];
  readonly cardVariantOptions: M3CardVariant[] = ['elevated', 'filled', 'outlined'];
  readonly cardToneOptions: M3CardTone[] = ['default', 'primary', 'secondary', 'tertiary', 'error'];

  readonly periodGroupOptions: M3ButtonGroupOption[] = [
    { id: 'day', label: 'Día', icon: 'today' },
    { id: 'week', label: 'Semana', icon: 'date_range' },
    { id: 'month', label: 'Mes', icon: 'calendar_month' }
  ];

  readonly standardGroupOptions: M3ButtonGroupOption[] = [
    { id: 'wcag', label: 'WCAG AA', icon: 'verified_user' },
    { id: 'motion', label: 'Springs', icon: 'animation' },
    { id: 'rtl', label: 'RTL Ready', icon: 'format_textdirection_r_to_l' }
  ];

  readonly splitMenuItems: M3SplitMenuItem[] = [
    { id: 'draft', label: 'Guardar como borrador', icon: 'edit_note' },
    { id: 'template', label: 'Guardar plantilla JSON', icon: 'data_object' },
    { id: 'pdf', label: 'Exportar ficha PDF', icon: 'picture_as_pdf' }
  ];

  readonly buttonClicks = signal<number>(0);
  readonly buttonLoading = signal<boolean>(false);
  readonly buttonDisabled = signal<boolean>(false);
  readonly togglePinned = signal<boolean>(true);
  readonly toggleFavorite = signal<boolean>(false);
  readonly connectedGroupValue = signal<string[]>(['week']);
  readonly standardGroupValue = signal<string[]>(['wcag']);

  readonly cardClicks = signal<number>(0);
  readonly demoCardVariant = signal<M3CardVariant>('outlined');
  readonly demoCardTone = signal<M3CardTone>('primary');
  readonly demoCardDisabled = signal<boolean>(false);
  readonly demoFilter = signal<'ux' | 'code' | 'qa'>('code');
  readonly inputTags = signal<string[]>(['Angular', 'OKLCH', 'Material 3']);

  readonly demoFilledText = signal<string>('Alex Johnson');
  readonly demoBudgetText = signal<string>('250.00');
  readonly demoPasswordText = signal<string>('mypass');
  readonly demoErrorText = signal<boolean>(true);
  readonly demoMultilineText = signal<string>('Validar puertos y adaptadores en arquitectura hexagonal.');
  readonly demoDialogAmount = signal<string>('120.00');
  readonly demoFormEmail = signal<string>('arquitectura@m3.dev');
  readonly demoFormCode = signal<string>('LM-104');

  readonly demoProgressValue = signal<number>(65);
  readonly demoProgressBuffer = signal<number>(80);
  readonly demoProgressIndeterminate = signal<boolean>(false);
  readonly demoProgressWavy = signal<boolean>(true);
  readonly demoProgressShowStop = signal<boolean>(true);
  readonly demoProgressRtl = signal<boolean>(false);
  readonly demoProgressAmplitude = signal<number>(DEFAULT_LINEAR_AMPLITUDE_DP);
  readonly demoProgressWavelength = signal<number>(DEFAULT_LINEAR_WAVELENGTH_DP);
  readonly demoProgressSpeed = signal<number>(DEFAULT_WAVE_SPEED_DP_PER_SEC);
  readonly demoProgressPaused = signal<boolean>(false);
  readonly demoProgressBlueprint = signal<boolean>(false);
  readonly demoProgressColor = signal<'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color'>('primary');
  readonly waveProgressPresets = [
    { value: 1, label: '1% (Punto)' },
    { value: 4, label: '4% (Rampa inicio)' },
    { value: 50, label: '50% (Pleno)' },
    { value: 97, label: '97% (Rampa fin)' },
    { value: 100, label: '100% (Destino)' }
  ] as const;
  readonly showcasePlaying = signal<boolean>(true);
  readonly showcaseAutoProgress = signal<number>(0);
  readonly showcaseAutoPercent = computed(() => Math.round(this.showcaseAutoProgress()));
  readonly demoSkeletonLoaded = signal<boolean>(false);
  readonly demoPhotosRefreshing = signal<boolean>(true);
  private readonly prefersReducedMotion = observePrefersReducedMotion();

  readonly switchNotifications = signal<boolean>(true);
  readonly switchCompactDensity = signal<boolean>(false);
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('Preferencias Web M3 guardadas');
  readonly snackbarUndoCount = signal<number>(0);

  private showcaseElapsedSec = 0;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.refreshTimerId !== null) {
        clearTimeout(this.refreshTimerId);
        this.refreshTimerId = null;
      }
    });

    // Live RAF telemetry phi(t) + Official 0% -> 100% -> Flat auto-loop showcase (3.6s period).
    // Uses untracked() on high-frequency signals so the effect never re-creates its RAF loop on frame ticks.
    effect((onCleanup) => {
      const readEl = this.phiTelemetryReadoutRef()?.nativeElement;
      const stdBar = this.labLinearStdRef();
      if (readEl && stdBar) {
        readEl.textContent = untracked(() => stdBar.phase()).toFixed(2);
      }

      if (!isPlatformBrowser(this.platformId) || typeof requestAnimationFrame !== 'function') {
        return;
      }

      if (this.prefersReducedMotion()) {
        this.showcaseAutoProgress.set(65);
        return;
      }

      const isPaused = this.demoProgressPaused();
      const phiRunning =
        Boolean(readEl && stdBar) &&
        this.demoProgressWavy() &&
        !isPaused &&
        this.demoProgressSpeed() > 0;
      const showcaseRunning = this.showcasePlaying() && !isPaused;

      if (!phiRunning && !showcaseRunning) {
        return;
      }

      let frameId = 0;
      let lastTime = 0;
      let lastRenderedPct = untracked(() => this.showcaseAutoProgress());

      this.ngZone.runOutsideAngular(() => {
        const tick = (now: number) => {
          if (lastTime > 0 && showcaseRunning) {
            const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
            this.showcaseElapsedSec = (this.showcaseElapsedSec + dt) % 3.6;
            const rawU = Math.min(1, this.showcaseElapsedSec / 2.4);
            const easedU = evalEmphasizedDecelerate(rawU);
            const nextPct = Number((easedU * 100).toFixed(1));
            if (Math.abs(nextPct - lastRenderedPct) >= 0.3 || (nextPct === 100 && lastRenderedPct !== 100)) {
              lastRenderedPct = nextPct;
              this.showcaseAutoProgress.set(nextPct);
            }
          }
          lastTime = now;

          if (readEl && stdBar) {
            readEl.textContent = stdBar.phase().toFixed(2);
          }
          frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
      });

      onCleanup(() => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      });
    });
  }

  readonly labProgressValue = computed(() =>
    this.demoProgressIndeterminate() ? null : this.demoProgressValue()
  );
  readonly labProgressBuffer = computed(() =>
    this.demoProgressIndeterminate() ? null : this.demoProgressBuffer()
  );
  readonly labProgressAmplitude = computed(() =>
    this.demoProgressWavy() ? this.demoProgressAmplitude() : null
  );
  readonly labProgressWavelength = computed(() =>
    this.demoProgressWavy() ? this.demoProgressWavelength() : null
  );
  readonly labProgressSpeed = computed(() =>
    this.demoProgressWavy() ? this.demoProgressSpeed() : null
  );

  readonly demoLinearColor = computed<'primary' | 'secondary' | 'tertiary' | 'error'>(() => {
    const col = this.demoProgressColor();
    return col === 'four-color' ? 'primary' : col;
  });

  readonly waveEnvelope = computed(() =>
    this.demoProgressIndeterminate()
      ? { factor: 1, zone: 'full' as const, zoneLabel: 'Pulso activo indeterminado' }
      : evaluateWaveAmplitudeEnvelope(this.demoProgressValue() / 100)
  );

  readonly waveEffectiveAmplitude = computed(() =>
    this.demoProgressAmplitude() * this.waveEnvelope().factor
  );

  readonly waveNumberK = computed(() => (2 * Math.PI) / this.demoProgressWavelength());
  readonly circularWavelength = computed(() => Math.max(8, this.demoProgressWavelength() * 0.375));
  readonly wavePhaseHz = computed(() => this.demoProgressSpeed() / this.demoProgressWavelength());

  triggerActionSnackbar(msg: string): void {
    this.snackbarMessage.set(msg);
    this.snackbarOpen.set(true);
  }

  onSplitMenuSelect(itemId: string): void {
    const item = this.splitMenuItems.find((m) => m.id === itemId);
    this.triggerActionSnackbar(`Split action: ${item?.label || itemId}`);
  }

  onSnackbarUndo(): void {
    this.snackbarUndoCount.update((c) => c + 1);
  }

  toggleProgressMode(): void {
    this.demoProgressIndeterminate.update(v => !v);
  }

  toggleProgressWavy(): void {
    this.demoProgressWavy.update(v => !v);
  }

  toggleSkeleton(): void {
    this.demoSkeletonLoaded.update(v => !v);
  }

  triggerPhotosRefresh(): void {
    if (this.refreshTimerId !== null) {
      clearTimeout(this.refreshTimerId);
    }
    this.demoPhotosRefreshing.set(true);
    this.refreshTimerId = setTimeout(() => {
      this.demoPhotosRefreshing.set(false);
      this.refreshTimerId = null;
    }, 2800);
  }

  onProgressSliderChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.updateDemoProgress(val);
  }

  toggleProgressStop(): void {
    this.demoProgressShowStop.update(v => !v);
  }

  toggleProgressRtl(): void {
    this.demoProgressRtl.update(v => !v);
  }

  toggleProgressBlueprint(): void {
    this.demoProgressBlueprint.update(v => !v);
  }

  toggleProgressPaused(): void {
    this.demoProgressPaused.update(v => !v);
  }

  toggleShowcasePlaying(): void {
    this.showcasePlaying.update(v => !v);
  }

  applyWaveProgressPreset(percent: number): void {
    this.demoProgressIndeterminate.set(false);
    this.updateDemoProgress(percent);
  }

  resetWaveDefaults(): void {
    this.demoProgressValue.set(65);
    this.demoProgressBuffer.set(80);
    this.demoProgressAmplitude.set(DEFAULT_LINEAR_AMPLITUDE_DP);
    this.demoProgressWavelength.set(DEFAULT_LINEAR_WAVELENGTH_DP);
    this.demoProgressSpeed.set(DEFAULT_WAVE_SPEED_DP_PER_SEC);
    this.demoProgressIndeterminate.set(false);
    this.demoProgressWavy.set(true);
  }

  setClampedRange(target: WritableSignal<number>, min: number, max: number, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) {
      target.set(Math.min(max, Math.max(min, val)));
    }
  }

  private updateDemoProgress(percent: number): void {
    this.demoProgressValue.set(percent);
    this.demoProgressBuffer.set(Math.min(100, percent + 15));
  }

  toggleDemoError(): void {
    this.demoErrorText.update(v => !v);
  }

  incrementClicks(): void {
    this.buttonClicks.update(c => c + 1);
  }

  incrementCardClicks(): void {
    this.cardClicks.update(c => c + 1);
  }

  setDemoFilter(filter: 'ux' | 'code' | 'qa'): void {
    this.demoFilter.set(filter);
  }

  removeTag(tag: string): void {
    this.inputTags.update(tags => tags.filter(t => t !== tag));
  }

  resetTags(): void {
    this.inputTags.set(['Angular', 'OKLCH', 'Material 3']);
  }

  onDemoFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (form.checkValidity()) {
      this.triggerActionSnackbar(`Formulario válido: ${this.demoFormEmail()} (${this.demoFormCode()})`);
    } else {
      form.reportValidity?.();
      this.triggerActionSnackbar('Revisa los campos resaltados en el formulario');
    }
  }
}
