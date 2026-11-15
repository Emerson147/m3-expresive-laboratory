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
import {
  M3CircularProgressComponent,
  M3LinearProgressComponent,
  M3LoadingIndicatorColor,
  M3LoadingIndicatorComponent,
  M3_CIRCLE_PATH,
  M3_COOKIE4_PATH,
  M3_COOKIE9_PATH,
  M3_LOADING_SHAPE_NAMES,
  M3_OVAL_PATH,
  M3_PENTAGON_PATH,
  M3_PILL_PATH,
  M3_SOFT_BURST_PATH,
  M3_SUNNY_PATH
} from '../../../shared/components/progress';
import {
  DEFAULT_LINEAR_AMPLITUDE_DP,
  DEFAULT_LINEAR_WAVELENGTH_DP,
  DEFAULT_LOADING_DIAMETER_DP,
  DEFAULT_WAVE_SPEED_DP_PER_SEC,
  LOADING_ACTIVE_SHAPE_RATIO,
  MAX_LOADING_DIAMETER_DP,
  MIN_LOADING_DIAMETER_DP,
  evalEmphasizedDecelerate,
  evaluateWaveAmplitudeEnvelope
} from '../../../shared/components/progress/progress-motion.util';
import { observePrefersReducedMotion } from '../../../shared/components/progress/progress-motion.controller';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3RadioGroupComponent, M3RadioOption } from '../../../shared/components/radio/radio.component';
import { M3SliderComponent, M3SliderSize } from '../../../shared/components/slider/slider.component';
import { M3SnackbarComponent } from '../../../shared/components/snackbar/snackbar.component';
import { M3SwitchComponent, M3SwitchIconMode } from '../../../shared/components/switch/switch.component';
import { M3TabItem, M3TabsComponent, M3TabVariant } from '../../../shared/components/tabs/tabs.component';
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
    M3CheckboxComponent,
    M3RadioGroupComponent,
    M3SliderComponent,
    M3TabsComponent,
    M3DialogComponent,
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
            <a
              routerLink="/design-system/playbook"
              class="btn-m3 state-layer focus-ring-m3 px-3.5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 no-underline">
              <span class="material-symbols-rounded text-base">menu_book</span>
              <span>5. Biblia M3 (Cero a Sistema)</span>
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

          <!-- Guía Rápida de Arquitectura: Progress Indicators (> 5s) + Snippet Copiable -->
          <div class="bg-surface-box border border-outline-sub p-5 rounded-m3-xl space-y-4 shadow-xs">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span class="text-xs font-bold text-primary uppercase tracking-wider block">Guía Rápida de Arquitectura • Progress Indicators</span>
                <h4 class="text-sm font-bold text-main">¿Cómo usar, dónde, por qué y para qué usar Linear &amp; Circular Progress?</h4>
              </div>
              <span class="text-[11px] font-mono text-muted">Regla temporal oficial M3: &gt; 5s</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
              @for (guide of progressDecisionMatrix; track guide.title) {
                <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-extrabold text-main">{{ guide.title }}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-semibold">
                      {{ guide.badge }}
                    </span>
                  </div>
                  <ul class="space-y-1.5 text-[11px] text-muted leading-snug list-disc pl-4">
                    @for (point of guide.points; track point) {
                      <li>{{ point }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <div class="p-4 bg-surface-high rounded-m3-xl border border-outline-sub space-y-2.5">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">code</span>
                  <span class="text-xs font-bold text-main">Snippet Angular generado con tus controles Wavy / Linear / Circular (copiar y pegar)</span>
                </div>
                <button
                  type="button"
                  (click)="copyProgressSnippet()"
                  class="btn-m3 focus-ring-m3 text-xs font-semibold px-3 py-1 rounded-full bg-primary text-on-primary cursor-pointer inline-flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">content_copy</span>
                  Copiar snippet
                </button>
              </div>
              <pre class="p-3 rounded-m3-lg bg-surface border border-outline-sub text-[11px] font-mono text-main overflow-x-auto leading-relaxed">{{ demoProgressGeneratedSnippet() }}</pre>
            </div>
          </div>

          <!-- 4. M3 EXPRESSIVE SHAPE-MORPHING LOADING INDICATOR & PULL-TO-REFRESH -->
          <div class="mt-6 bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-6">
            <!-- Header + Acciones Rápidas -->
            <div class="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-outline-sub">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  <span class="material-symbols-rounded text-base text-primary">interests</span>
                  Material 3 Expressive • Shape Morphing Loading Indicator
                </div>
                <h4 class="text-title-md font-bold text-main">Loading Indicator vs. Progress Indicator</h4>
                <p class="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                  Reservado para esperas indeterminadas cortas de <code>200ms – 5s</code> y <em>Pull-to-refresh</em>. Muta orgánicamente entre sus <strong>7 formas canónicas M3</strong> (<em>SoftBurst → Cookie9 → Pentagon → Pill → Sunny → Cookie4 → Oval</em>) con resorte real (<code>0.6 / 200</code>) cada <code>650ms</code>, salto de <code>+90°</code> y giro continuo de <code>4666ms</code>.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  (click)="toggleLoadingPaused()"
                  [attr.aria-pressed]="demoLoadingPaused()"
                  [class]="demoLoadingPaused() ? 'bg-sec-box text-on-sec-box border-outline-sub' : 'bg-surface-high text-main border-outline-sub'"
                  class="btn-m3 focus-ring-m3 text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer inline-flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ demoLoadingPaused() ? 'play_arrow' : 'pause' }}</span>
                  {{ demoLoadingPaused() ? 'Reanudar Resorte' : 'Pausar Resorte' }}
                </button>
                <button
                  type="button"
                  (click)="resetLoadingDefaults()"
                  class="btn-m3 focus-ring-m3 text-xs font-semibold px-3 py-1.5 rounded-full bg-surface-high text-muted hover:text-main border border-outline-sub cursor-pointer">
                  Reset Canónico (48dp)
                </button>
                <m3-button
                  variant="tonal"
                  icon="refresh"
                  (action)="triggerPhotosRefresh()">
                  Simular Pull-to-Refresh
                </m3-button>
              </div>
            </div>

            <!-- Bento Interactivo: Escenario Vivo + Secuencia 7 Formas + Simulador Photos (Izquierda) vs Controles P2 + Telemetría (Derecha) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <!-- Izquierda (7 cols): Live Stage + Escala/Formas + Pull-to-Refresh Phone -->
              <div class="lg:col-span-7 space-y-5">
                <!-- Escenario Vivo Parametrizable -->
                <div class="p-5 bg-surface-high rounded-m3-xl border border-outline-sub space-y-4">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <span class="text-xs font-bold text-main uppercase tracking-wider">Escenario Vivo • Proporción Óptica 38 / 48 dp</span>
                    <div class="flex items-center gap-2 font-mono text-[11px]">
                      <span class="px-2 py-0.5 rounded-full bg-surface border border-outline-sub text-main">
                        Caja: <strong>{{ demoLoadingDiameter() }}dp</strong>
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-bold">
                        Figura: {{ loadingEffectiveShapeDp() }}dp
                      </span>
                    </div>
                  </div>

                  <div class="min-h-[268px] rounded-m3-lg bg-surface border border-outline-sub/80 flex flex-col items-center justify-center gap-3 p-4 relative overflow-hidden">
                    <m3-loading-indicator
                      #labLoading
                      [diameter]="demoLoadingDiameter()"
                      [progress]="labLoadingProgressInput()"
                      [contained]="demoLoadingContained()"
                      [elevated]="demoLoadingElevated()"
                      [paused]="demoLoadingPaused()"
                      [color]="demoLoadingColor()"
                      ariaLabel="Indicador interactivo de prueba en laboratorio" />

                    <div class="text-[11px] font-mono text-muted text-center">
                      @if (demoLoadingDeterminate()) {
                        Modo Determinado (Gesto Pull-to-Refresh): <strong>{{ (demoLoadingProgress() * 100).toFixed(0) }}%</strong> • Circle +18° → SoftBurst
                      } @else {
                        Modo Indeterminado: 7 polígonos • <code>N = 180</code> splines • {{ demoLoadingPaused() ? 'Pausado en cuadro actual' : '650ms spring + 90°' }}
                      }
                    </div>
                  </div>

                  <!-- Presets de Escala Canónica M3 (24 - 240dp + Modos Contained) -->
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex flex-wrap items-center gap-1.5">
                      @for (preset of loadingDiameterPresets; track preset.dp) {
                        <button
                          type="button"
                          (click)="applyLoadingPreset(preset.dp, demoLoadingContained(), demoLoadingElevated())"
                          [class]="demoLoadingDiameter() === preset.dp ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-muted border-outline-sub hover:text-main'"
                          class="btn-m3 focus-ring-m3 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border cursor-pointer">
                          {{ preset.label }}
                        </button>
                      }
                    </div>

                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        (click)="applyLoadingPreset(48, true, false)"
                        class="btn-m3 focus-ring-m3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface text-primary border border-primary/40 hover:bg-primary-box/30 cursor-pointer">
                        Contained 48dp
                      </button>
                      <button
                        type="button"
                        (click)="applyLoadingPreset(48, true, true)"
                        class="btn-m3 focus-ring-m3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface text-main border border-outline-sub hover:border-primary/50 cursor-pointer">
                        Pull Floating Pill
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Catálogo Visual de las 7 Formas Canónicas + Circle (+18°) -->
                <div class="p-4 bg-surface-low rounded-m3-xl border border-outline-sub space-y-3">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <span class="text-xs font-bold text-main">Secuencia Canónica M3 (7 Polígonos Indeterminados + Circle Determinado)</span>
                    <span class="text-[11px] font-mono text-muted">38dp en ViewBox 48×48</span>
                  </div>
                  <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    @for (shape of loadingCanonicalShapeCatalog; track shape.name) {
                      <div class="p-2 rounded-m3-md bg-surface border border-outline-sub flex flex-col items-center gap-1.5 text-center">
                        <svg viewBox="0 0 48 48" class="w-8 h-8 text-primary" aria-hidden="true">
                          <path [attr.d]="shape.path" fill="currentColor" />
                        </svg>
                        <span class="text-[10px] font-mono font-semibold text-main leading-tight">{{ shape.name }}</span>
                      </div>
                    }
                    <div class="p-2 rounded-m3-md bg-primary-box/35 border border-primary/40 flex flex-col items-center gap-1.5 text-center">
                      <svg viewBox="0 0 48 48" class="w-8 h-8 text-primary" aria-hidden="true">
                        <path [attr.d]="loadingCirclePath" fill="currentColor" />
                      </svg>
                      <span class="text-[10px] font-mono font-bold text-primary leading-tight">Circle (0%)</span>
                    </div>
                  </div>
                </div>

                <!-- Simulador Realista Pull-to-Refresh (Drag Determinado 0->1 + Liberación) -->
                <div class="p-5 bg-surface-low rounded-m3-xl border border-outline-sub grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div class="md:col-span-6 space-y-3">
                    <div>
                      <span class="text-xs font-bold text-main uppercase tracking-wider block">Pull-to-Refresh • Gesto Determinado → Soltar</span>
                      <p class="text-[11px] text-muted mt-1 leading-relaxed">
                        Mientras el usuario arrastra la lista (<code>[progress]</code> de <code>0.0 → 1.0</code>), el loader emerge rotando <code>+18° → +108°</code> y transformando <strong>Circle</strong> en <strong>SoftBurst</strong>. Al alcanzar <code>100%</code> y soltar, pasa sin salto al ciclo indeterminado.
                      </p>
                    </div>

                    <div class="space-y-1.5 p-3 bg-surface rounded-m3-lg border border-outline-sub">
                      <div class="flex justify-between text-xs font-semibold">
                        <label for="lab-pull-gesture" class="text-main">Simular arrastre manual (0→1)</label>
                        <span class="font-mono text-primary">{{ (demoPullGestureProgress() * 100).toFixed(0) }}%</span>
                      </div>
                      <input
                        id="lab-pull-gesture"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        [value]="demoPullGestureProgress() * 100"
                        (input)="onPullGestureInput($event)"
                        class="m3-lab-slider focus-ring-m3 w-full cursor-pointer" />
                      <div class="text-[10px] text-muted">
                        Arrastra el slider para ver el morph <code>Circle → SoftBurst</code> dentro del teléfono, o pulsa <strong>Simular Pull-to-Refresh</strong> arriba.
                      </div>
                    </div>
                  </div>

                  <div class="md:col-span-6 flex justify-center">
                    <div class="w-64 bg-surface-lowest border-2 border-outline-sub rounded-[32px] p-3 shadow-lg space-y-2.5 relative overflow-hidden">
                      <!-- Status Bar -->
                      <div class="flex items-center justify-between px-2.5 text-[10px] font-bold text-muted">
                        <span>9:30</span>
                        <div class="flex items-center gap-1">
                          <span class="material-symbols-rounded text-xs">signal_cellular_alt</span>
                          <span class="material-symbols-rounded text-xs">wifi</span>
                          <span class="material-symbols-rounded text-xs">battery_full</span>
                        </div>
                      </div>

                      <!-- App Bar (Photos) -->
                      <div class="flex items-center justify-between px-1.5">
                        <h5 class="text-sm font-bold text-main tracking-tight">Photos</h5>
                        <div class="flex items-center gap-1.5">
                          <button type="button" aria-label="Opciones de galería" class="focus-ring-m3 p-1 rounded-full text-muted hover:text-main cursor-pointer">
                            <span class="material-symbols-rounded text-base" aria-hidden="true">more_vert</span>
                          </button>
                          <div class="w-6 h-6 rounded-full bg-secondary-box text-on-secondary-box font-bold text-[11px] flex items-center justify-center">
                            A
                          </div>
                        </div>
                      </div>

                      <!-- App Canvas / Feed Simulation -->
                      <div class="h-44 bg-surface-low rounded-m3-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-outline-sub/60">
                        @if (demoPhotosRefreshing() || demoPullGestureProgress() > 0) {
                          <div class="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <m3-loading-indicator
                              size="md"
                              [contained]="true"
                              [elevated]="true"
                              [progress]="demoPhotosLoaderProgress()"
                              [color]="demoLoadingColor()"
                              ariaLabel="Actualizando galería de fotos" />
                            <span class="text-[11px] font-semibold text-muted tracking-wide">
                              @if (demoPhotosRefreshing()) {
                                Actualizando galería...
                              } @else if (demoPullGestureProgress() >= 0.99) {
                                ¡Suelta para actualizar!
                              } @else {
                                Arrastrando ({{ (demoPullGestureProgress() * 100).toFixed(0) }}%)...
                              }
                            </span>
                          </div>
                        } @else {
                          <div class="flex flex-col items-center gap-2 text-center">
                            <span class="material-symbols-rounded text-3xl text-primary">photo_library</span>
                            <span class="text-xs font-bold text-main">Galería al día</span>
                            <span class="text-[11px] text-muted">Arrastra el control o toca "Simular Pull-to-Refresh"</span>
                          </div>
                        }
                      </div>

                      <div class="text-center text-[10px] text-muted">
                        Pull-to-refresh • Elevated Floating Pill
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Derecha (5 cols): Controles P2 en Tiempo Real + Telemetría Spring -->
              <div class="lg:col-span-5 space-y-4">
                <!-- Panel de Parámetros Dinámicos -->
                <div class="bg-surface-low border border-outline-sub p-5 rounded-m3-xl space-y-4">
                  <div class="flex items-center justify-between gap-2">
                    <h5 class="font-bold text-sm text-main">Parámetros en Tiempo Real</h5>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-outline-sub text-muted">
                      M3 Specs P2
                    </span>
                  </div>

                  <!-- Modo: Indeterminado vs Determinado -->
                  <div class="space-y-1.5">
                    <span class="text-xs font-semibold text-main block">Modo de Operación</span>
                    <div class="grid grid-cols-2 gap-1.5 p-1 bg-surface rounded-m3-lg border border-outline-sub">
                      <button
                        type="button"
                        (click)="demoLoadingDeterminate.set(false)"
                        [class]="!demoLoadingDeterminate() ? 'bg-primary text-on-primary shadow-xs' : 'text-muted hover:text-main'"
                        class="btn-m3 focus-ring-m3 text-xs font-semibold py-1.5 px-2.5 rounded-m3-md cursor-pointer">
                        Indeterminado (7)
                      </button>
                      <button
                        type="button"
                        (click)="demoLoadingDeterminate.set(true)"
                        [class]="demoLoadingDeterminate() ? 'bg-primary text-on-primary shadow-xs' : 'text-muted hover:text-main'"
                        class="btn-m3 focus-ring-m3 text-xs font-semibold py-1.5 px-2.5 rounded-m3-md cursor-pointer">
                        Determinado [progress]
                      </button>
                    </div>
                  </div>

                  <!-- Slider Diámetro (24 - 240dp) -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-semibold">
                      <label for="lab-loading-diameter" class="text-main">Diámetro [diameter] (24–240dp)</label>
                      <span class="font-mono text-primary">{{ demoLoadingDiameter() }}dp ({{ loadingEffectiveShapeDp() }}dp)</span>
                    </div>
                    <input
                      id="lab-loading-diameter"
                      type="range"
                      [min]="loadingMinDiameterDp"
                      [max]="loadingMaxDiameterDp"
                      step="2"
                      [value]="demoLoadingDiameter()"
                      (input)="setClampedRange(demoLoadingDiameter, loadingMinDiameterDp, loadingMaxDiameterDp, $event)"
                      class="m3-lab-slider focus-ring-m3 w-full cursor-pointer" />
                  </div>

                  <!-- Slider Progreso Determinado (0 - 1) -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-semibold">
                      <label for="lab-loading-progress" class="text-main">Progreso [progress] (Circle → SoftBurst)</label>
                      <span class="font-mono text-main">{{ (demoLoadingProgress() * 100).toFixed(0) }}%</span>
                    </div>
                    <input
                      id="lab-loading-progress"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      [disabled]="!demoLoadingDeterminate()"
                      [value]="demoLoadingProgress()"
                      (input)="setClampedRange(demoLoadingProgress, 0, 1, $event)"
                      [class.opacity-40]="!demoLoadingDeterminate()"
                      class="m3-lab-slider focus-ring-m3 w-full cursor-pointer" />
                    @if (demoLoadingDeterminate()) {
                      <div class="flex flex-wrap gap-1.5 pt-1">
                        <button type="button" (click)="demoLoadingProgress.set(0)" class="btn-m3 focus-ring-m3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-outline-sub cursor-pointer">0% Circle</button>
                        <button type="button" (click)="demoLoadingProgress.set(0.5)" class="btn-m3 focus-ring-m3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-outline-sub cursor-pointer">50% Morph</button>
                        <button type="button" (click)="demoLoadingProgress.set(1)" class="btn-m3 focus-ring-m3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-outline-sub cursor-pointer">100% SoftBurst</button>
                      </div>
                    }
                  </div>

                  <!-- Variantes de Contenedor & Color Semántico OKLCH -->
                  <div class="pt-3 border-t border-outline-sub space-y-3">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="toggleLoadingContained()"
                          [attr.aria-pressed]="demoLoadingContained()"
                          [class]="demoLoadingContained() ? 'bg-sec-box text-on-sec-box' : 'bg-surface text-muted border border-outline-sub'"
                          class="btn-m3 focus-ring-m3 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer">
                          [contained]: {{ demoLoadingContained() ? 'On' : 'Off' }}
                        </button>
                        <button
                          type="button"
                          (click)="toggleLoadingElevated()"
                          [attr.aria-pressed]="demoLoadingElevated()"
                          [class]="demoLoadingElevated() ? 'bg-sec-box text-on-sec-box' : 'bg-surface text-muted border border-outline-sub'"
                          class="btn-m3 focus-ring-m3 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer">
                          [elevated]: {{ demoLoadingElevated() ? 'On' : 'Off' }}
                        </button>
                      </div>

                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="demoLoadingColor.set('primary')"
                          [class.ring-2]="demoLoadingColor() === 'primary'"
                          class="focus-ring-m3 w-5 h-5 rounded-full bg-primary ring-offset-1 ring-primary cursor-pointer"
                          aria-label="Color Primary"></button>
                        <button
                          type="button"
                          (click)="demoLoadingColor.set('secondary')"
                          [class.ring-2]="demoLoadingColor() === 'secondary'"
                          class="focus-ring-m3 w-5 h-5 rounded-full bg-secondary ring-offset-1 ring-secondary cursor-pointer"
                          aria-label="Color Secondary"></button>
                        <button
                          type="button"
                          (click)="demoLoadingColor.set('tertiary')"
                          [class.ring-2]="demoLoadingColor() === 'tertiary'"
                          class="focus-ring-m3 w-5 h-5 rounded-full bg-tertiary ring-offset-1 ring-tertiary cursor-pointer"
                          aria-label="Color Tertiary"></button>
                        <button
                          type="button"
                          (click)="demoLoadingColor.set('error')"
                          [class.ring-2]="demoLoadingColor() === 'error'"
                          class="focus-ring-m3 w-5 h-5 rounded-full bg-error ring-offset-1 ring-error cursor-pointer"
                          aria-label="Color Error"></button>
                        <button
                          type="button"
                          (click)="demoLoadingColor.set('four-color')"
                          [class.ring-2]="demoLoadingColor() === 'four-color'"
                          title="4-Color Multicolor Cycle"
                          class="focus-ring-m3 w-5 h-5 rounded-full bg-gradient-to-tr from-primary via-tertiary to-error ring-offset-1 ring-primary cursor-pointer"
                          aria-label="Color Four-Color"></button>
                      </div>
                    </div>

                    <p class="text-[11px] text-muted leading-normal">
                      Usa <strong>Default</strong> sobre fondos limpios con contraste ≥ 3:1. Activa <code>[contained]="true"</code> (<code>primary-container</code>) cuando el loader va sobre fotos, mapas o contenido visual complejo.
                    </p>
                  </div>
                </div>

                <!-- Card Telemetría Spring & A11y en Vivo -->
                <div class="bg-surface-low border border-outline-sub p-5 rounded-m3-xl space-y-3">
                  <div class="flex items-center justify-between">
                    <h5 class="font-bold text-sm text-main">Telemetría Spring &amp; Accesibilidad</h5>
                    <span class="text-[10px] font-mono text-primary font-bold">Fuera de NgZone</span>
                  </div>
                  <div class="p-3.5 rounded-m3-lg bg-surface border border-outline-sub font-mono text-[11px] leading-relaxed space-y-1">
                    <div>
                      Transición: <strong #loadingShapeReadout class="text-primary">SoftBurst → Cookie9</strong>
                    </div>
                    <div>
                      Factor resorte s(t) = <strong #loadingSpringReadout class="text-main">0.000</strong>
                      <span class="text-muted"> (0.6 / 200)</span>
                    </div>
                    <div>
                      Rotación θ = <strong #loadingAngleReadout class="text-main">0.0 deg</strong>
                    </div>
                    <div>
                      Proporción óptica = <strong class="text-main">{{ loadingEffectiveShapeDp() }}dp / {{ demoLoadingDiameter() }}dp</strong>
                      <span class="text-muted"> (38/48)</span>
                    </div>
                    <div>
                      ARIA = <strong class="text-main">{{ demoLoadingDeterminate() ? 'role="progressbar" aria-valuenow="' + (demoLoadingProgress() * 100).toFixed(0) + '"' : 'role="progressbar" (sin valuenow)' }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Matriz Glosario de Diseño M3: Cómo usar, Dónde, Por qué y Para qué + Snippet Listo para Copiar -->
            <div class="pt-5 border-t border-outline-sub space-y-5">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span class="text-xs font-bold text-primary uppercase tracking-wider block">Guía Rápida de Arquitectura • Loading Indicator</span>
                  <h5 class="text-sm font-bold text-main">¿Cómo usar, dónde, por qué y para qué usar Loading Indicator?</h5>
                </div>
                <span class="text-[11px] font-mono text-muted">Regla temporal oficial M3: 200ms – 5s</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                @for (guide of loadingDecisionMatrix; track guide.title) {
                  <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-2">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-xs font-extrabold text-main">{{ guide.title }}</span>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-semibold">
                        {{ guide.badge }}
                      </span>
                    </div>
                    <ul class="space-y-1.5 text-[11px] text-muted leading-snug list-disc pl-4">
                      @for (point of guide.points; track point) {
                        <li>{{ point }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>

              <!-- Snippet Angular Generado en Vivo listo para Copy-Paste -->
              <div class="p-4 bg-surface-high rounded-m3-xl border border-outline-sub space-y-2.5">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">code</span>
                    <span class="text-xs font-bold text-main">Snippet Angular generado con tu configuración actual (copiar y pegar)</span>
                  </div>
                  <button
                    type="button"
                    (click)="copyLoadingSnippet()"
                    class="btn-m3 focus-ring-m3 text-xs font-semibold px-3 py-1 rounded-full bg-primary text-on-primary cursor-pointer inline-flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-sm" aria-hidden="true">content_copy</span>
                    Copiar snippet
                  </button>
                </div>
                <pre class="p-3 rounded-m3-lg bg-surface border border-outline-sub text-[11px] font-mono text-main overflow-x-auto leading-relaxed">{{ demoLoadingGeneratedSnippet() }}</pre>
              </div>
            </div>
          </div>

          <!-- GUÍA RÁPIDA DE ARQUITECTURA CONSOLIDADA (PARA PROYECTOS CLIENTE DE CERO) -->
          <div class="mt-6 bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-outline-sub">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">architecture</span>
                  Glosario Maestro M3 Expressive • Referencia Ejecutiva
                </div>
                <h4 class="text-title-md font-bold text-main">Guía Rápida de Arquitectura (Cómo, Dónde, Por qué y Para qué)</h4>
              </div>
              <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-primary-box text-on-primary-box font-semibold">
                YAGNI: 7+1 Formas + Corner 10-Step
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-outline-sub text-muted uppercase text-[10px] tracking-wider">
                    <th class="py-2 pr-3">Escenario / Componente</th>
                    <th class="py-2 px-3">Cómo usar</th>
                    <th class="py-2 px-3">Dónde usar (y NO)</th>
                    <th class="py-2 px-3">Por qué (Física / UX)</th>
                    <th class="py-2 pl-3">Para qué</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-sub/60 text-[11px] leading-snug">
                  @for (row of architectureQuickGuideRows; track row.scenario) {
                    <tr>
                      <td class="py-2.5 pr-3 font-bold text-main align-top whitespace-nowrap">{{ row.scenario }}</td>
                      <td class="py-2.5 px-3 text-muted align-top">{{ row.how }}</td>
                      <td class="py-2.5 px-3 text-muted align-top">{{ row.where }}</td>
                      <td class="py-2.5 px-3 text-muted align-top">{{ row.why }}</td>
                      <td class="py-2.5 pl-3 text-muted align-top">{{ row.purpose }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 8. EXTENSIONES ESENCIALES M3 + WEB: SWITCH, SELECTION, SLIDER, TABS, DIALOG & SNACKBAR -->
        <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Web Selection: M3 Switch (40dp Circular Handle Halo + 3 Icon Modes) -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs flex flex-col justify-between">
              <div class="space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                      <span class="material-symbols-rounded text-base">toggle_on</span>
                      M3 Selection • Switch (52&times;32dp + Halo 40dp)
                    </div>
                    <h3 class="text-title-md font-bold text-main">M3 Switch (Expressive Morphing Thumb)</h3>
                    <p class="text-xs text-muted mt-1 leading-relaxed">
                      Control binario instant&aacute;neo con <code>role="switch"</code>, blanco t&aacute;ctil de 48dp, halo circular de 40dp centrado en el thumb y morphing org&aacute;nico (16dp &rarr; 24dp / 28dp) sin encoger el track.
                    </p>
                  </div>

                  <m3-button variant="tonal" icon="content_copy" (action)="copySelectionSnippet('switch')">
                    Copiar Switch
                  </m3-button>
                </div>

                <!-- Icon Mode Selector ('both' | 'selected' | 'none') -->
                <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-surface-low rounded-m3-lg border border-outline-sub">
                  <span class="text-[11px] font-semibold text-muted uppercase tracking-wider">Modo &iacute;cono (16dp):</span>
                  <div class="flex flex-wrap gap-1.5">
                    @for (mode of switchIconModeOptions; track mode.id) {
                      <m3-chip
                        type="filter"
                        [selected]="switchIconModeDemo() === mode.id"
                        (action)="switchIconModeDemo.set(mode.id)">
                        {{ mode.label }}
                      </m3-chip>
                    }
                  </div>
                </div>

                <div class="space-y-4 p-4 bg-surface-low rounded-m3-lg border border-outline-sub">
                  <m3-switch
                    label="Alertas clínicas en tiempo real"
                    description="Notifica signos vitales críticos mediante Top-Layer"
                    [iconMode]="switchIconModeDemo()"
                    [(checked)]="switchNotifications" />

                  <div class="border-t border-outline-sub/60 pt-3">
                    <m3-switch
                      label="Modo densidad compacta (Desktop)"
                      description="Variante sin ícono interno hasta activar"
                      [withIcons]="false"
                      [(checked)]="switchCompactDensity" />
                  </div>

                  <div class="border-t border-outline-sub/60 pt-3 flex items-center justify-between gap-2">
                    <m3-switch
                      label="Switch deshabilitado (12% / 38%)"
                      [disabled]="true"
                      [checked]="true" />
                    <span class="text-[11px] font-mono text-muted">
                      Estado: {{ switchNotifications() ? 'ON' : 'OFF' }} &bull; Modo: {{ switchIconModeDemo() }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="p-3 bg-surface-low rounded-m3-md border border-outline-sub text-[11px] text-muted leading-snug">
                <strong class="text-main">Regla M3 Switch:</strong> aplica el cambio de inmediato sin bot&oacute;n Guardar; si el usuario debe confirmar un lote antes de guardar, usa <code>&lt;m3-checkbox&gt;</code>.
              </div>
            </div>

            <!-- Web Overlays: Top-Layer Snackbar & Native <m3-dialog> -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                      <span class="material-symbols-rounded text-base">notifications_active</span>
                      Web Essential • Top-Layer Overlays
                    </div>
                    <h3 class="text-title-md font-bold text-main">Snackbar (<code>popover="manual"</code>) &amp; Menu Popover &amp; M3 Dialog</h3>
                    <p class="text-xs text-muted mt-1 leading-relaxed">
                      Usa <code>popover="manual"</code> para no cerrarse por accidente al navegar la pantalla (sin <em>light-dismiss</em>), y <code>&lt;dialog&gt;.showModal()</code> para modales nativos con <em>inert</em> y <code>Esc</code> autom&aacute;ticos.
                    </p>
                  </div>

                  <m3-button variant="tonal" icon="content_copy" (action)="copySelectionSnippet('dialog')">
                    Copiar Dialog
                  </m3-button>
                </div>

                <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <m3-button
                      variant="filled"
                      icon="campaign"
                      (action)="triggerActionSnackbar('Cambio guardado en preferencias Web M3')">
                      Mostrar Snackbar Manual
                    </m3-button>
                    <m3-button
                      variant="outlined"
                      icon="open_in_new"
                      (action)="demoDialogOpen.set(true)">
                      Abrir M3 Dialog (showModal)
                    </m3-button>
                    @if (snackbarUndoCount() > 0) {
                      <span class="text-xs font-mono text-primary font-bold">
                        Deshacer pulsado: {{ snackbarUndoCount() }}×
                      </span>
                    }
                  </div>
                  @if (demoDialogLastClose()) {
                    <p class="text-[11px] font-mono text-primary">
                      Último cierre de &lt;m3-dialog&gt;: {{ demoDialogLastClose() }}
                    </p>
                  } @else {
                    <p class="text-[11px] text-muted">
                      El Snackbar y el Di&aacute;logo viven en el Top Layer del navegador sobre toda la jerarqu&iacute;a DOM sin conflictos de <code>z-index</code>.
                    </p>
                  }
                </div>
              </div>

              <div class="pt-3 border-t border-outline-sub text-[11px] font-mono text-muted flex flex-wrap items-center justify-between gap-2">
                <span>Split Menu: popover="auto" (Esc + light-dismiss)</span>
                <span>Modal: &lt;dialog&gt;.showModal()</span>
                <span>Toast: popover="manual"</span>
              </div>
            </div>
          </div>

          <!-- Checkbox (Tri-state), Radio Group (< 6) & Slider M3 Expressive -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Checkbox & Radio Group -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs flex flex-col justify-between">
              <div class="space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                      <span class="material-symbols-rounded text-base">check_box</span>
                      M3 Selection • Checkbox &amp; Radio Group
                    </div>
                    <h3 class="text-title-md font-bold text-main">Checkbox (Tri-state 18dp) &amp; Radio Group (&lt; 6 opciones)</h3>
                    <p class="text-xs text-muted mt-1 leading-relaxed">
                      Usa <code>&lt;m3-checkbox&gt;</code> para selecciones m&uacute;ltiples pendientes de confirmar y <code>&lt;m3-radio-group&gt;</code> cuando hay menos de 6 opciones excluyentes visibles.
                    </p>
                  </div>

                  <m3-button variant="tonal" icon="content_copy" (action)="copySelectionSnippet('selection')">
                    Copiar Selecci&oacute;n
                  </m3-button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-low rounded-m3-lg border border-outline-sub">
                  <div class="space-y-2">
                    <m3-checkbox
                      label="Todos los módulos activos"
                      description="Soporta estado indeterminate automático"
                      [checked]="demoCheckboxMaster()"
                      [indeterminate]="demoCheckboxIndeterminate()"
                      (changed)="toggleDemoCheckboxMaster()" />

                    <div class="pl-6 space-y-1 border-l-2 border-outline-sub ml-4">
                      <m3-checkbox
                        label="Auditoría de sesiones"
                        [(checked)]="demoCheckboxAudit" />
                      <m3-checkbox
                        label="Respaldo nocturno S3"
                        [(checked)]="demoCheckboxBackup" />
                    </div>

                    <div class="pt-1 border-t border-outline-sub/60">
                      <m3-checkbox
                        label="Acepto términos legales (Error)"
                        description="Obligatorio antes de facturar"
                        [error]="true" />
                    </div>
                  </div>

                  <div class="space-y-2 sm:border-l sm:border-outline-sub sm:pl-4">
                    <m3-radio-group
                      legend="Plan del cliente (3 opciones)"
                      [options]="demoRadioOptions"
                      [(value)]="demoRadioPlan" />
                    <div class="text-[11px] font-mono text-primary pt-1">
                      Plan activo: {{ demoRadioPlan() }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-3 bg-surface-low rounded-m3-md border border-outline-sub text-[11px] text-muted leading-snug">
                <strong class="text-main">&iquest;Y si tengo 6+ opciones?</strong> No apiles 10 radios: usa <code>.m3-select-field</code> en <code>_text-field.css</code> para ahorrar espacio cognitivo.
              </div>
            </div>

            <!-- Slider M3 Expressive & Tabs Primary/Secondary -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs flex flex-col justify-between">
              <div class="space-y-4">
                <div>
                  <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                    <span class="material-symbols-rounded text-base">tune</span>
                    M3 Slider Expressive &amp; Tabs (Roving Tabindex)
                  </div>
                  <h3 class="text-title-md font-bold text-main">Slider (Disjoint Gap + Stop Dots) &amp; Tabs (Primary / Secondary)</h3>
                  <p class="text-xs text-muted mt-1 leading-relaxed">
                    Slider nativo sobre <code>&lt;input type="range"&gt;</code> con manija barra vertical y puntos discretos; Tabs con <code>tabindex</code> rotatorio accesible y soporte RTL autom&aacute;tico.
                  </p>
                </div>

                <!-- Live M3 Slider -->
                <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-[11px] font-semibold text-muted uppercase">Grosor track Slider:</span>
                    <div class="flex flex-wrap items-center gap-1.5">
                      @for (sz of sliderSizeOptions; track sz) {
                        <m3-chip
                          type="filter"
                          [selected]="demoSliderSize() === sz"
                          (action)="demoSliderSize.set(sz)">
                          {{ sz.toUpperCase() }} ({{ sz === 'xs' ? '16dp' : sz === 'sm' ? '24dp' : '40dp' }})
                        </m3-chip>
                      }
                      <m3-chip
                        type="filter"
                        [selected]="demoSliderStops()"
                        (action)="demoSliderStops.set(!demoSliderStops())">
                        Stop Dots
                      </m3-chip>
                    </div>
                  </div>

                  <m3-slider
                    label="Margen objetivo del presupuesto"
                    unit="%"
                    [min]="0"
                    [max]="100"
                    [step]="10"
                    [size]="demoSliderSize()"
                    [showStops]="demoSliderStops()"
                    [(value)]="demoSliderValue" />
                </div>

                <!-- Live M3 Tabs -->
                <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-[11px] font-semibold text-muted uppercase">Variante M3 Tabs:</span>
                    <div class="flex gap-1.5">
                      <m3-chip
                        type="filter"
                        [selected]="demoTabVariant() === 'primary'"
                        (action)="demoTabVariant.set('primary')">
                        Primary (3dp)
                      </m3-chip>
                      <m3-chip
                        type="filter"
                        [selected]="demoTabVariant() === 'secondary'"
                        (action)="demoTabVariant.set('secondary')">
                        Secondary (2dp)
                      </m3-chip>
                    </div>
                  </div>

                  <m3-tabs
                    [tabs]="demoTabItems"
                    [variant]="demoTabVariant()"
                    ariaLabel="Vistas de demostración de componentes"
                    [(value)]="demoActiveTab" />

                  <div
                    role="tabpanel"
                    [attr.id]="'lab-panel-' + demoActiveTab()"
                    [attr.aria-labelledby]="'m3-tab-' + demoActiveTab()"
                    class="p-3 bg-surface-box rounded-m3-md border border-outline-sub text-xs text-muted">
                    @if (demoActiveTab() === 'overview') {
                      <strong class="text-main">Resumen de pantalla:</strong> los tabs Primary (indicador 3dp redondeado) cambian entre vistas principales al mismo nivel jer&aacute;rquico.
                    } @else if (demoActiveTab() === 'specs') {
                      <strong class="text-main">Especificaciones:</strong> los tabs Secondary (indicador 2dp completo) subdividen contenido ya dentro de una ficha o panel.
                    } @else {
                      <strong class="text-main">Teclado WAI-ARIA:</strong> navega entre pesta&ntilde;as con <code>&larr;</code> / <code>&rarr;</code>, <code>Home</code> y <code>End</code> sin romper el orden de foco.
                    }
                  </div>
                </div>
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

      <m3-dialog
        #demoDialog
        headline="Confirmar despliegue a producción"
        icon="rocket_launch"
        ariaDescription="Diálogo modal nativo HTML5 (<dialog>.showModal()) montado en el Top Layer del navegador con backdrop semitransparente e inert automático."
        [(open)]="demoDialogOpen"
        (closed)="onDemoDialogClosed($event)">
        <p class="text-xs text-muted">
          Plan actual seleccionado: <strong class="text-main">{{ demoRadioPlan() }}</strong> &bull;
          Margen: <strong class="text-main">{{ demoSliderValue() }}%</strong>.
          Pulsa <code>Esc</code>, haz clic fuera o elige una acci&oacute;n para verificar el ciclo de cierre nativo.
        </p>

        <div dialog-actions class="flex items-center gap-2">
          <m3-button variant="text" (action)="demoDialog.dismiss('cancel')">
            Cancelar
          </m3-button>
          <m3-button variant="filled" icon="check" (action)="demoDialog.dismiss('confirm')">
            Confirmar
          </m3-button>
        </div>
      </m3-dialog>

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
  readonly labLoadingRef = viewChild<M3LoadingIndicatorComponent>('labLoading');
  private readonly phiTelemetryReadoutRef = viewChild<ElementRef<HTMLElement>>('phiTelemetryReadout');
  private readonly loadingShapeReadoutRef = viewChild<ElementRef<HTMLElement>>('loadingShapeReadout');
  private readonly loadingSpringReadoutRef = viewChild<ElementRef<HTMLElement>>('loadingSpringReadout');
  private readonly loadingAngleReadoutRef = viewChild<ElementRef<HTMLElement>>('loadingAngleReadout');

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
  readonly demoPhotosRefreshing = signal<boolean>(false);
  readonly demoPullGestureProgress = signal<number>(0);

  readonly loadingMinDiameterDp = MIN_LOADING_DIAMETER_DP;
  readonly loadingMaxDiameterDp = MAX_LOADING_DIAMETER_DP;
  readonly loadingCanonicalShapeCatalog = [
    { name: M3_LOADING_SHAPE_NAMES[0], path: M3_SOFT_BURST_PATH },
    { name: M3_LOADING_SHAPE_NAMES[1], path: M3_COOKIE9_PATH },
    { name: M3_LOADING_SHAPE_NAMES[2], path: M3_PENTAGON_PATH },
    { name: M3_LOADING_SHAPE_NAMES[3], path: M3_PILL_PATH },
    { name: M3_LOADING_SHAPE_NAMES[4], path: M3_SUNNY_PATH },
    { name: M3_LOADING_SHAPE_NAMES[5], path: M3_COOKIE4_PATH },
    { name: M3_LOADING_SHAPE_NAMES[6], path: M3_OVAL_PATH }
  ] as const;
  readonly loadingCirclePath = M3_CIRCLE_PATH;
  readonly loadingDiameterPresets = [
    { dp: 24, label: '24dp Mín' },
    { dp: 32, label: '32dp sm' },
    { dp: 48, label: '48dp Canónico' },
    { dp: 96, label: '96dp Media' },
    { dp: 160, label: '160dp Hero' },
    { dp: 240, label: '240dp Máx' }
  ] as const;
  readonly loadingDecisionMatrix = [
    {
      title: '1. Cómo usar',
      badge: '48dp → 38dp',
      points: [
        'Base 48dp (polígono activo 38dp); escala con [diameter] entre 24dp y 240dp.',
        'Activa [contained]="true" (primary-container) sobre fotos, mapas o listas densas.',
        'Declara role="progressbar" con [ariaLabel] concreto ("Acción + objeto").'
      ]
    },
    {
      title: '2. Dónde usar (y dónde NO)',
      badge: '200ms – 5s',
      points: [
        'Sí: esperas breves (200ms–5s), Pull-to-refresh y handshakes rápidos de API/POS.',
        'No en < 200ms (omite carga para evitar parpadeo visual innecesario).',
        'No en > 5s o descarga determinista: usa Progress Indicator Wavy (lineal/circular).'
      ]
    },
    {
      title: '3. Por qué (Física & Contraste)',
      badge: 'Spring 0.6 / 200',
      points: [
        'Morph orgánico de 7 polígonos cada 650ms (+90°/paso + giro 4666ms) mitiga fatiga visual.',
        'Corre fuera de NgZone solo mutando <path d> + transform: rotate() sin reflow CSS.',
        'Se congela en pentágono estático ante prefers-reduced-motion.'
      ]
    },
    {
      title: '4. Para qué (Casos Cliente)',
      badge: 'Gestos & Feedback',
      points: [
        'Confirmar acciones sin progreso conocido sin fabricar porcentajes falsos.',
        'Conectar arrastre táctil Pull-to-refresh ([progress] Circle 18° → SoftBurst).',
        'Garantizar legibilidad ≥ 3:1 sobre cualquier superficie con [contained] / [elevated].'
      ]
    }
  ] as const;

  readonly progressDecisionMatrix = [
    {
      title: '1. Cómo usar',
      badge: '40dp/s • Stop 4dp',
      points: [
        'Lineal (≥ 40dp ancho): ideal en barras, cards y headers; activa [showStopIndicator]="true" en determinado.',
        'Circular (24–240dp): mantén plano ([wavy]="false") en 24dp o botones; usa [wavy]="true" desde 40dp+.',
        'Indeterminado → Determinado: transiciona en la misma variante (nunca cambies de circular a lineal en medio).'
      ]
    },
    {
      title: '2. Dónde usar (y dónde NO)',
      badge: '> 5s • Cuantificable',
      points: [
        'Sí: subidas/descargas largas (> 5s), cargas porcentuales reales, exportaciones y procesos multi-paso.',
        'No en esperas < 200ms (omite) ni 200ms–5s indeterminadas sin % (usa Loading Indicator).',
        'No en botones si quieres tracking complejo: dentro de botón usa circular inline plano (currentColor ≥ 3:1).'
      ]
    },
    {
      title: '3. Por qué (Física & Óptica)',
      badge: '400ms / 200ms',
      points: [
        'Avance de progreso con Emphasized Decelerate (400ms) y atenuación final de amplitud A(p) en 200ms.',
        'La brecha cap-compensada de 4dp + Stop Dot Ø 4dp evita artefactos visuales si el track tiene contraste < 3:1.',
        'La cuantización circular entera N cierra el anillo wavy sin costura ni salto al rodear los 360°.'
      ]
    },
    {
      title: '4. Para qué (Casos Cliente)',
      badge: 'Progreso Real',
      points: [
        'Mostrar avance exacto de importación CSV/PDF o sincronización offline con transparencia real.',
        'Indicar carga en streaming o dual-buffer (active + buffer) en reproductores y archivos pesados.',
        'Dar accesibilidad WCAG 2.2 AA automática vía role="progressbar" y aria-valuenow sincronizado.'
      ]
    }
  ] as const;

  readonly architectureQuickGuideRows = [
    {
      scenario: 'Espera < 200ms',
      how: 'Omitir todo indicador visual; renderizar resultado directo al resolver.',
      where: 'Micro-fetches en memoria, filtros locales, toggles instantáneos.',
      why: 'Evita parpadeos innecesarios que hacen percibir la UI más lenta de lo real.',
      purpose: 'Mantener sensación de respuesta inmediata (Zero Flash).'
    },
    {
      scenario: 'Loading Indicator (200ms–5s)',
      how: 'Caja 48dp / figura 38dp (ratio 38/48), [diameter] 24–240dp, [contained] sobre fotos, [progress] 0..1 en arrastre.',
      where: 'Pull-to-refresh, handshake de terminal POS, carga breve de tarjetas sin % conocido.',
      why: '7 formas convexas con resorte real (0.6 / 200) cada 650ms fuera de NgZone reducen fatiga visual; sin las 35 formas extra por YAGNI.',
      purpose: 'Confirmar actividad breve o feedback táctil continuo sin inventar porcentajes falsos.'
    },
    {
      scenario: 'Progress Indicator (> 5s)',
      how: 'Lineal en borde/panel (wavy ≥4dp gap + Stop Dot 4dp); Circular 24–240dp (plano en ≤24dp, wavy en ≥40dp).',
      where: 'Descargas, uploads, procesos batch, streaming con buffer, reportes largos.',
      why: 'Emphasized Decelerate 400ms + atenuación 200ms en extremos + cuantización circular sin costura.',
      purpose: 'Comunicar avance cuantificable (%) o latencia prolongada con precisión.'
    },
    {
      scenario: 'Superficies, Formas & Motion',
      how: '8 superficies OKLCH (--seed-hue), 10-step Corner Morph (h/2 ↔ squircle), tokens --md-sys-motion-* sin magic numbers.',
      where: 'Toda la app: Buttons, Chips, Cards, Dialogs, Stage Recess y rutas.',
      why: 'Corner Morph reemplaza la vibración háptica en Web; Spatial (0.9) vs Effects (1.0) y 0 lag desde h/2.',
      purpose: 'Escalar proyectos de clientes (POS, Clínica, ERP) copiando tokens sin deuda visual.'
    }
  ] as const;

  readonly demoLoadingDiameter = signal<number>(DEFAULT_LOADING_DIAMETER_DP);
  readonly demoLoadingContained = signal<boolean>(false);
  readonly demoLoadingElevated = signal<boolean>(false);
  readonly demoLoadingDeterminate = signal<boolean>(false);
  readonly demoLoadingProgress = signal<number>(0.45);
  readonly demoLoadingPaused = signal<boolean>(false);
  readonly demoLoadingColor = signal<M3LoadingIndicatorColor>('primary');
  private readonly prefersReducedMotion = observePrefersReducedMotion();

  readonly switchNotifications = signal<boolean>(true);
  readonly switchCompactDensity = signal<boolean>(false);
  readonly switchIconModeDemo = signal<M3SwitchIconMode>('both');
  readonly switchIconModeOptions: readonly { id: M3SwitchIconMode; label: string }[] = [
    { id: 'both', label: 'Both' },
    { id: 'selected', label: 'Selected' },
    { id: 'none', label: 'None' }
  ];
  readonly demoCheckboxAudit = signal<boolean>(true);
  readonly demoCheckboxBackup = signal<boolean>(false);
  readonly demoCheckboxMaster = computed(() => this.demoCheckboxAudit() && this.demoCheckboxBackup());
  readonly demoCheckboxIndeterminate = computed(() => this.demoCheckboxAudit() !== this.demoCheckboxBackup());
  readonly demoRadioPlan = signal<string>('pro');
  readonly demoRadioOptions: M3RadioOption[] = [
    { value: 'starter', label: 'Starter', description: 'Hasta 3 usuarios activos' },
    { value: 'pro', label: 'Profesional', description: 'Multisede + Auditoria OKLCH' },
    { value: 'enterprise', label: 'Enterprise', description: 'SSO + SLA 99.9%' }
  ];
  readonly demoSliderSize = signal<M3SliderSize>('sm');
  readonly sliderSizeOptions: readonly M3SliderSize[] = ['xs', 'sm', 'md'];
  readonly demoSliderValue = signal<number>(60);
  readonly demoSliderStops = signal<boolean>(true);
  readonly demoTabVariant = signal<M3TabVariant>('primary');
  readonly demoActiveTab = signal<string>('overview');
  readonly demoTabItems: M3TabItem[] = [
    { id: 'overview', label: 'Resumen', icon: 'dashboard', panelId: 'lab-panel-overview' },
    { id: 'specs', label: 'Specs M3', icon: 'tune', badge: '4', panelId: 'lab-panel-specs' },
    { id: 'a11y', label: 'A11y', icon: 'accessibility_new', panelId: 'lab-panel-a11y' }
  ];
  readonly demoDialogOpen = signal<boolean>(false);
  readonly demoDialogLastClose = signal<string>('');
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

    // Live RAF telemetry phi(t) + LoadingIndicator spring telemetry + Official 0% -> 100% -> Flat auto-loop showcase (3.6s period).
    // Uses untracked() on high-frequency signals so the effect never re-creates its RAF loop on frame ticks.
    effect((onCleanup) => {
      const readEl = this.phiTelemetryReadoutRef()?.nativeElement;
      const stdBar = this.labLinearStdRef();
      if (readEl && stdBar) {
        readEl.textContent = untracked(() => stdBar.phase()).toFixed(2);
      }

      const loadingComponent = this.labLoadingRef();
      const loadingShapeEl = this.loadingShapeReadoutRef()?.nativeElement;
      const loadingSpringEl = this.loadingSpringReadoutRef()?.nativeElement;
      const loadingAngleEl = this.loadingAngleReadoutRef()?.nativeElement;
      const loadingPaused = this.demoLoadingPaused();
      const loadingDet = this.demoLoadingDeterminate();
      // Track [progress] changes when determinate so telemetry syncs on slider scrub
      void this.demoLoadingProgress();

      const syncLoadingTelemetry = () => {
        if (!loadingComponent) {
          return;
        }
        const snap = loadingComponent.getTelemetrySnapshot();
        if (loadingShapeEl) {
          loadingShapeEl.textContent = snap.isIndeterminate
            ? `${snap.shapeName} → ${snap.nextShapeName}`
            : `${snap.shapeName} (${Math.round((snap.progress ?? 0) * 100)}%)`;
        }
        if (loadingSpringEl) {
          loadingSpringEl.textContent = snap.springFactor.toFixed(3);
        }
        if (loadingAngleEl) {
          loadingAngleEl.textContent = `${snap.angleDeg.toFixed(1)} deg`;
        }
      };

      let disposed = false;
      queueMicrotask(() => {
        if (!disposed) {
          syncLoadingTelemetry();
        }
      });

      if (!isPlatformBrowser(this.platformId) || typeof requestAnimationFrame !== 'function') {
        onCleanup(() => {
          disposed = true;
        });
        return;
      }

      if (this.prefersReducedMotion()) {
        this.showcaseAutoProgress.set(65);
        onCleanup(() => {
          disposed = true;
        });
        return;
      }

      const isPaused = this.demoProgressPaused();
      const phiRunning =
        Boolean(readEl && stdBar) &&
        this.demoProgressWavy() &&
        !isPaused &&
        this.demoProgressSpeed() > 0;
      const showcaseRunning = this.showcasePlaying() && !isPaused;
      const loadingRunning =
        Boolean(loadingComponent && (loadingShapeEl || loadingSpringEl || loadingAngleEl)) &&
        !loadingPaused &&
        !loadingDet;

      if (!phiRunning && !showcaseRunning && !loadingRunning) {
        onCleanup(() => {
          disposed = true;
        });
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
          if (loadingRunning) {
            syncLoadingTelemetry();
          }
          frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
      });

      onCleanup(() => {
        disposed = true;
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

  readonly loadingEffectiveShapeDp = computed(() =>
    Math.round(this.demoLoadingDiameter() * LOADING_ACTIVE_SHAPE_RATIO * 10) / 10
  );
  readonly labLoadingProgressInput = computed<number | null>(() =>
    this.demoLoadingDeterminate() ? this.demoLoadingProgress() : null
  );
  readonly demoPhotosLoaderProgress = computed<number | null>(() =>
    this.demoPhotosRefreshing() ? null : this.demoPullGestureProgress() > 0 ? this.demoPullGestureProgress() : null
  );
  readonly demoLoadingGeneratedSnippet = computed(() => {
    const attrs: string[] = [];
    if (this.demoLoadingDiameter() !== DEFAULT_LOADING_DIAMETER_DP) {
      attrs.push(`[diameter]="${this.demoLoadingDiameter()}"`);
    }
    if (this.demoLoadingColor() !== 'primary') {
      attrs.push(`color="${this.demoLoadingColor()}"`);
    }
    if (this.demoLoadingContained()) {
      attrs.push('[contained]="true"');
    }
    if (this.demoLoadingElevated()) {
      attrs.push('[elevated]="true"');
    }
    if (this.demoLoadingDeterminate()) {
      attrs.push(`[progress]="${this.demoLoadingProgress().toFixed(2)}"`);
    }
    if (this.demoLoadingPaused()) {
      attrs.push('[paused]="true"');
    }
    attrs.push('ariaLabel="Cargando catálogo..."');
    return `<m3-loading-indicator\n  ${attrs.join('\n  ')} />`;
  });

  readonly demoProgressGeneratedSnippet = computed(() => {
    const linearAttrs = [
      `[value]="${this.demoProgressIndeterminate() ? 'null' : this.demoProgressValue()}"`,
      `[wavy]="${this.demoProgressWavy()}"`,
      `color="${this.demoLinearColor()}"`
    ];
    if (!this.demoProgressIndeterminate()) {
      linearAttrs.push(`[buffer]="${this.demoProgressBuffer()}"`);
      linearAttrs.push(`[showStopIndicator]="${this.demoProgressShowStop()}"`);
    }
    if (this.demoProgressRtl()) {
      linearAttrs.push('[rtl]="true"');
    }
    if (this.demoProgressPaused()) {
      linearAttrs.push('[paused]="true"');
    }
    linearAttrs.push('ariaLabel="Sincronizando reporte..."');

    const circAttrs = [
      `[value]="${this.demoProgressIndeterminate() ? 'null' : this.demoProgressValue()}"`,
      '[diameter]="48"',
      `[wavy]="${this.demoProgressWavy()}"`,
      `color="${this.demoProgressColor()}"`,
      'ariaLabel="Progreso circular..."'
    ];

    return `<m3-linear-progress\n  ${linearAttrs.join('\n  ')} />\n\n<m3-circular-progress\n  ${circAttrs.join('\n  ')} />`;
  });

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
    this.demoPullGestureProgress.set(0);
    this.demoPhotosRefreshing.set(true);
    this.refreshTimerId = setTimeout(() => {
      this.demoPhotosRefreshing.set(false);
      this.refreshTimerId = null;
    }, 2800);
  }

  onPullGestureInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) {
      if (this.refreshTimerId !== null) {
        clearTimeout(this.refreshTimerId);
        this.refreshTimerId = null;
      }
      this.demoPhotosRefreshing.set(false);
      this.demoPullGestureProgress.set(Math.min(1, Math.max(0, val / 100)));
    }
  }

  toggleLoadingContained(): void {
    this.demoLoadingContained.update(v => !v);
  }

  toggleLoadingElevated(): void {
    this.demoLoadingElevated.update(v => !v);
  }

  toggleLoadingPaused(): void {
    this.demoLoadingPaused.update(v => !v);
  }

  applyLoadingPreset(dp: number, contained: boolean, elevated: boolean): void {
    this.demoLoadingDiameter.set(dp);
    this.demoLoadingContained.set(contained);
    this.demoLoadingElevated.set(elevated);
  }

  resetLoadingDefaults(): void {
    this.demoLoadingDiameter.set(DEFAULT_LOADING_DIAMETER_DP);
    this.demoLoadingContained.set(false);
    this.demoLoadingElevated.set(false);
    this.demoLoadingDeterminate.set(false);
    this.demoLoadingProgress.set(0.45);
    this.demoLoadingPaused.set(false);
    this.demoLoadingColor.set('primary');
    this.demoPullGestureProgress.set(0);
  }

  copyLoadingSnippet(): void {
    this.copyTextToClipboard(
      this.demoLoadingGeneratedSnippet(),
      'Snippet M3 Loading Indicator copiado al portapapeles'
    );
  }

  copyProgressSnippet(): void {
    this.copyTextToClipboard(
      this.demoProgressGeneratedSnippet(),
      'Snippet M3 Progress Indicators copiado al portapapeles'
    );
  }

  toggleDemoCheckboxMaster(): void {
    const next = !this.demoCheckboxMaster();
    this.demoCheckboxAudit.set(next);
    this.demoCheckboxBackup.set(next);
  }

  onDemoDialogClosed(reason: string): void {
    this.demoDialogLastClose.set(reason);
    this.triggerActionSnackbar(`Dialogo cerrado con razon: ${reason}`);
  }

  copySelectionSnippet(kind: 'switch' | 'selection' | 'dialog'): void {
    const snippets: Record<'switch' | 'selection' | 'dialog', { code: string; label: string }> = {
      switch: {
        code: `<m3-switch\n  label="Alertas clinicas"\n  description="Notificacion inmediata"\n  iconMode="${this.switchIconModeDemo()}"\n  [(checked)]="enabled" />`,
        label: 'Snippet <m3-switch> copiado'
      },
      selection: {
        code: `<m3-checkbox label="Modulo" [(checked)]="checked" [indeterminate]="partial" />\n<m3-radio-group legend="Plan" [options]="options" [(value)]="plan" />\n<m3-slider label="Margen" unit="%" size="${this.demoSliderSize()}" [showStops]="${this.demoSliderStops()}" [(value)]="margin" />`,
        label: 'Snippet Seleccion & Slider copiado'
      },
      dialog: {
        code: `<m3-dialog #dlg headline="Confirmar accion" [(open)]="open">\n  <p>Contenido del dialogo modal nativo.</p>\n  <div dialog-actions>\n    <m3-button variant="text" (action)="dlg.dismiss('cancel')">Cancelar</m3-button>\n    <m3-button variant="filled" (action)="dlg.dismiss('confirm')">Aceptar</m3-button>\n  </div>\n</m3-dialog>`,
        label: 'Snippet <m3-dialog> copiado'
      }
    };
    const picked = snippets[kind];
    this.copyTextToClipboard(picked.code, picked.label);
  }

  private copyTextToClipboard(text: string, snackbarMsg: string): void {
    if (isPlatformBrowser(this.platformId) && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    this.triggerActionSnackbar(snackbarMsg);
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
