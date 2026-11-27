import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { MotionReplayHandle } from './motion-replay.util';
import { APPLYING_TRANSITIONS_PRINCIPLES, MOTION_APPLIED_RECIPES } from './motion-specs.data';

export type MotionPatternId =
  | 'container'
  | 'forward-backward'
  | 'lateral'
  | 'top-level'
  | 'enter-exit'
  | 'skeleton'
  | 'applied-examples';

interface StaggerOrderRow {
  readonly index: number;
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly status: string;
}

interface DynamicVtCardSpec {
  readonly id: string;
  readonly title: string;
  readonly badge: string;
  readonly summary: string;
  readonly metric: string;
}

/**
 * Interactive laboratory for M3 Canonical Transition Patterns (Pillar 3):
 * 6 official patterns (Container Transform, Forward & Backward, Lateral, Top-Level, Enter & Exit, Skeleton)
 * plus working Applied Examples (Stagger Waterfall with Slow-Mo + real interactive View Transitions origin->detail)
 * and the 8 Applying Transitions quality principles.
 */
@Component({
  selector: 'app-motion-patterns-section',
  standalone: true,
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3CardComponent, M3ChipComponent, M3TabsComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card id="motion-patterns" variant="outlined" padding="md" customClass="space-y-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <span class="material-symbols-rounded text-base" aria-hidden="true">transition_slide</span>
          Pilar 3 • Patrones Canónicos de Transición y Ejemplos Prácticos M3
        </div>
        <h3 class="text-title-md-emphasized text-main">
          Los 6 Patrones Oficiales + Ejemplos Compuestos En Vivo (Zero .animate-pulse / Zero .transition-all)
        </h3>
        <p class="text-xs text-muted max-w-4xl leading-relaxed">
          Cada cambio de pantalla responde a la relación espacial entre origen y destino (<code class="font-mono text-primary">m3.material.io/styles/motion/transitions/transition-patterns</code>). Explorá las 7 pestañas interactivas con controles reales del kit.
        </p>
      </div>

      <!-- Tabs nativos M3 con Roving Tabindex -->
      <m3-tabs
        variant="secondary"
        idPrefix="motion-patterns"
        ariaLabel="Patrones de transición M3 y ejemplos en vivo"
        [tabs]="patternTabs"
        [(value)]="activePattern"
        (tabChange)="onPatternTabActivated($event)" />

      <!-- ESCENARIO ACTIVO DEL PATRÓN -->
      <div class="p-4 sm:p-5 rounded-m3-xl bg-surface border border-outline-sub space-y-5">
        @switch (activePattern()) {
          @case ('container') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div class="lg:col-span-5 space-y-3">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patrón 1 • Container Transform
                </span>
                <h4 class="text-title-md-emphasized text-main">Continuidad Física Persistente (Surface Morph)</h4>
                <p class="text-xs text-muted leading-relaxed">
                  Conecta un origen (Card KPI, Search Pill o FAB) con su estado expandido morphando la superficie compartida con esquinas acotadas (<code class="font-mono text-primary">16px ↔ 24px</code>). Usa <code class="font-mono text-primary">long2 (500ms)</code> al expandir y <code class="font-mono text-main">medium1 (250ms)</code> al regresar.
                </p>
                <div class="flex flex-wrap gap-2">
                  <m3-button variant="filled" size="sm" [icon]="demoContainerExpanded() ? 'collapse_content' : 'open_in_full'" (action)="demoContainerExpanded.set(!demoContainerExpanded())">
                    {{ demoContainerExpanded() ? 'Contraer Tarjeta (250ms)' : 'Expandir Tarjeta (500ms)' }}
                  </m3-button>
                  <m3-button variant="tonal" size="sm" icon="search" (action)="demoSearchPillExpanded.set(!demoSearchPillExpanded())">
                    {{ demoSearchPillExpanded() ? 'Colapsar Search Pill' : 'Expandir Search Pill' }}
                  </m3-button>
                </div>
              </div>

              <div class="lg:col-span-7 space-y-4">
                <!-- Ejemplo 1A: Tarjeta KPI a Detalle con límites px acotados + max-w-full -->
                <button
                  type="button"
                  [attr.aria-expanded]="demoContainerExpanded()"
                  class="m3-card m3-card-outlined m3-card-surface-low state-layer focus-ring-m3 block text-start overflow-hidden max-w-full cursor-pointer"
                  [style.border-radius]="demoContainerExpanded() ? '24px' : '16px'"
                  [style.width]="demoContainerExpanded() ? '420px' : '288px'"
                  [style.height]="demoContainerExpanded() ? '184px' : '72px'"
                  style="transition-property: width, height, border-radius, background-color, border-color, box-shadow;"
                  [style.transition-duration]="demoContainerExpanded() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                  [style.transition-timing-function]="'var(--md-sys-motion-easing-emphasized)'"
                  (click)="demoContainerExpanded.set(!demoContainerExpanded())">
                  <div class="p-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="material-symbols-rounded text-primary text-lg shrink-0" aria-hidden="true">analytics</span>
                      <div class="min-w-0">
                        <span class="text-xs font-bold text-main block truncate">Caja Principal #01</span>
                        <span class="text-[10px] text-muted block">Clic para morfar estado (288px ↔ 420px)</span>
                      </div>
                    </div>
                    <span class="text-xs font-mono font-bold text-primary shrink-0">$14,820</span>
                  </div>
                  <div
                    class="px-4 pb-4 space-y-2"
                    [attr.aria-hidden]="!demoContainerExpanded()"
                    style="transition-property: opacity;"
                    [style.transition-duration]="demoContainerExpanded() ? 'var(--md-sys-motion-duration-medium2)' : 'var(--md-sys-motion-duration-short2)'"
                    [style.transition-delay]="demoContainerExpanded() ? '80ms' : '0ms'"
                    [class.opacity-100]="demoContainerExpanded()"
                    [class.opacity-0]="!demoContainerExpanded()">
                    <div class="grid grid-cols-3 gap-2 text-center p-2 rounded-m3-md bg-surface">
                      <div>
                        <span class="text-[10px] text-muted block">Órdenes</span>
                        <span class="text-xs font-bold font-mono text-main">142</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-muted block">Ticket Med</span>
                        <span class="text-xs font-bold font-mono text-main">$104</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-muted block">Curva</span>
                        <span class="text-xs font-bold font-mono text-primary">Emph.</span>
                      </div>
                    </div>
                  </div>
                </button>

                <!-- Ejemplo 1B: Search Pill morphing -->
                <div class="p-3 rounded-m3-lg bg-surface-high border border-outline-sub/60 flex items-center justify-between gap-3 flex-wrap">
                  <span class="text-[11px] text-muted">Search Pill acotado (<code class="font-mono">20px h/2 ↔ 14px</code>):</span>
                  <button
                    type="button"
                    (click)="demoSearchPillExpanded.set(!demoSearchPillExpanded())"
                    class="h-10 bg-surface-box border border-outline flex items-center gap-2 px-3 max-w-full overflow-hidden cursor-pointer state-layer focus-ring-m3"
                    [style.border-radius]="demoSearchPillExpanded() ? '14px' : '20px'"
                    [style.width]="demoSearchPillExpanded() ? '288px' : '156px'"
                    style="transition-property: width, border-radius, border-color, box-shadow;"
                    [style.transition-duration]="demoSearchPillExpanded() ? 'var(--md-sys-motion-duration-medium4)' : 'var(--md-sys-motion-duration-short4)'"
                    [style.transition-timing-function]="'var(--md-sys-motion-easing-emphasized)'">
                    <span class="material-symbols-rounded text-base text-primary shrink-0" aria-hidden="true">search</span>
                    <span class="text-xs text-muted truncate">
                      {{ demoSearchPillExpanded() ? 'Buscar tokens, curvas o specs...' : 'Buscar...' }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          }

          @case ('forward-backward') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div class="lg:col-span-5 space-y-3">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patrón 2 • Forward &amp; Backward (Shared-Axis X)
                </span>
                <h4 class="text-title-md-emphasized text-main">Profundidad Jerárquica y Stepper Bidireccional</h4>
                <p class="text-xs text-muted leading-relaxed">
                  Al bajar a un detalle o avanzar a un paso siguiente el contenido entra desde la derecha (<code class="font-mono text-primary">m3ForwardIn</code>); al volver o retroceder entra desde la izquierda (<code class="font-mono text-primary">m3BackwardIn</code>).
                </p>

                <m3-button-group
                  variant="connected"
                  selectionMode="single"
                  size="sm"
                  ariaLabel="Paso de flujo secuencial"
                  [options]="hierarchicalStepOptions"
                  [value]="[hierarchicalStep()]"
                  (selectionChange)="onHierarchicalStepSelection($event)" />
              </div>

              <div class="lg:col-span-7 p-4 rounded-m3-lg bg-surface-high border border-outline-sub overflow-hidden min-h-[176px]">
                <div
                  class="space-y-3"
                  [class.opacity-95]="!hierarchicalReplay.active()"
                  [style.animation]="hierarchicalReplay.active() ? (demoHierarchicalDirection() === 'forward' ? 'm3ForwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate) both' : 'm3BackwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate) both') : 'none'">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-main">
                      @if (hierarchicalStep() === 'step1') { Paso 1: Listado de Órdenes }
                      @else if (hierarchicalStep() === 'step2') { Paso 2: Detalle de Facturación }
                      @else { Paso 3: Confirmación Fiscal }
                    </span>
                    <span class="px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-mono">
                      {{ demoHierarchicalDirection() === 'forward' ? 'Avanza →' : '← Retrocede' }}
                    </span>
                  </div>

                  <p class="text-xs text-muted leading-relaxed">
                    @if (hierarchicalStep() === 'step1') {
                      Seleccioná el paso 2 para profundizar en la jerarquía con un deslizamiento + fade de 300ms (<code class="font-mono text-primary">medium2</code>).
                    } @else if (hierarchicalStep() === 'step2') {
                      Nivel intermedio activo: al regresar al Paso 1 se invierte el vector (<code class="font-mono text-primary">-36px → 0</code>) reforzando el mapa mental.
                    } @else {
                      Nivel terminal de confirmación: cero saltos bruscos, orientación izquierda/derecha siempre coherente con la navegación.
                    }
                  </p>

                  <div class="flex items-center gap-2 pt-1">
                    @if (hierarchicalStep() !== 'step1') {
                      <m3-button variant="outlined" size="sm" icon="arrow_back" (action)="stepBackHierarchical()">
                        Anterior
                      </m3-button>
                    }
                    @if (hierarchicalStep() !== 'step3') {
                      <m3-button variant="filled" size="sm" icon="arrow_forward" [iconTrailing]="true" (action)="stepForwardHierarchical()">
                        Continuar
                      </m3-button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          @case ('lateral') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div class="lg:col-span-5 space-y-3">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patrón 3 • Lateral (Peer Tabs en Unísono)
                </span>
                <h4 class="text-title-md-emphasized text-main">Deslizamiento Hermano Bidireccional (Sin Fade)</h4>
                <p class="text-xs text-muted leading-relaxed">
                  Vistas del mismo rango jerárquico (sub-pestañas o carruseles) deslizan al unísono con <code class="font-mono text-primary">medium1 (250ms)</code> + <code class="font-mono text-main">standard</code> según el índice relativo.
                </p>

                <m3-button-group
                  variant="connected"
                  selectionMode="single"
                  size="sm"
                  ariaLabel="Pestañas Laterales"
                  [options]="lateralTabOptions"
                  [value]="[demoLateralTab()]"
                  (selectionChange)="onLateralSelection($event)" />
              </div>

              <div class="lg:col-span-7 p-4 rounded-m3-lg bg-surface-high border border-outline-sub overflow-hidden min-h-[144px]">
                <div
                  class="space-y-2"
                  [style.animation]="lateralReplay.active() ? (demoLateralDirection() === 'next' ? 'm3LateralIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard) both' : 'm3BackwardIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard) both') : 'none'">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-main">
                      @if (demoLateralTab() === 'general') { Pestaña Lateral A: Resumen General }
                      @else if (demoLateralTab() === 'telemetry') { Pestaña Lateral B: Telemetría GPU }
                      @else { Pestaña Lateral C: Hardware &amp; Tasa de Refresco }
                    </span>
                    <span class="text-[10px] font-mono text-primary font-bold">
                      {{ demoLateralDirection() === 'next' ? 'Avanza →' : '← Retrocede' }}
                    </span>
                  </div>
                  <p class="text-xs text-muted leading-relaxed">
                    Cambiá entre General → Hardware o volvé atrás: la dirección calcula automáticamente <code class="font-mono text-main">order[next] &lt; order[current]</code> para no invertir jamás la orientación espacial.
                  </p>
                </div>
              </div>
            </div>
          }

          @case ('top-level') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div class="lg:col-span-5 space-y-3">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patrón 4 • Top Level (Fade-Through)
                </span>
                <h4 class="text-title-md-emphasized text-main">Destinos Raíz Independientes (Sin Deslizamiento X)</h4>
                <p class="text-xs text-muted leading-relaxed">
                  Destinos no emparentados (Navigation Rail / Floating Dock) no comparten orden lateral: jamás deslizan lateralmente. Aplican <code class="font-mono text-primary">m3FadeThroughIn</code> (250ms, escala sutil 92% → 100%).
                </p>

                <m3-button-group
                  variant="connected"
                  selectionMode="single"
                  size="sm"
                  ariaLabel="Destinos Top-Level"
                  [options]="topLevelDestOptions"
                  [value]="[demoTopLevelDest()]"
                  (selectionChange)="onTopLevelSelection($event)" />
              </div>

              <div class="lg:col-span-7 p-4 rounded-m3-lg bg-surface-high border border-outline-sub overflow-hidden min-h-[144px] flex items-center">
                <div
                  class="w-full space-y-2"
                  [style.animation]="topLevelReplay.active() ? 'm3FadeThroughIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard) both' : 'none'">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-main">
                      @if (demoTopLevelDest() === 'dashboard') { Raíz 1: Dashboard Ejecutivo }
                      @else if (demoTopLevelDest() === 'fleet') { Raíz 2: Flota POS Activa }
                      @else { Raíz 3: Ajustes del Sistema }
                    </span>
                    <span class="text-[10px] font-mono text-primary">scale(0.92 → 1) • 250ms</span>
                  </div>
                  <p class="text-xs text-muted leading-relaxed">
                    Observá cómo el cambio ocurre en profundidad (Z sutil) manteniendo las barras de navegación estables y sin desplazamiento horizontal engañoso.
                  </p>
                </div>
              </div>
            </div>
          }

          @case ('enter-exit') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div class="lg:col-span-5 space-y-3">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patrón 5 • Enter &amp; Exit (Origen Físico)
                </span>
                <h4 class="text-title-md-emphasized text-main">Menús, Dialogs y Bottom Sheets Desde Su Borde Real</h4>
                <p class="text-xs text-muted leading-relaxed">
                  Un menú desplegable nace hacia abajo desde su botón activador; un Bottom Sheet o Snackbar emerge desde el borde inferior con <code class="font-mono text-primary">decelerate</code> al entrar y <code class="font-mono text-main">accelerate</code> al salir.
                </p>

                <div class="flex flex-wrap gap-2">
                  <m3-button variant="tonal" size="sm" icon="arrow_drop_down_circle" [toggle]="true" [(selected)]="demoEnterExitMenuOpen">
                    {{ demoEnterExitMenuOpen() ? 'Ocultar Menú' : 'Abrir Menú Top' }}
                  </m3-button>
                  <m3-button variant="filled" size="sm" icon="call_to_action" [toggle]="true" [(selected)]="demoEnterExitSnackbarOpen">
                    {{ demoEnterExitSnackbarOpen() ? 'Cerrar Sheet' : 'Abrir Bottom Sheet' }}
                  </m3-button>
                </div>
              </div>

              <div class="lg:col-span-7 p-4 rounded-m3-lg bg-surface-high border border-outline-sub min-h-[168px] flex flex-col justify-between gap-3 overflow-hidden">
                <div class="min-h-[58px]">
                  <div
                    [attr.inert]="!demoEnterExitMenuOpen() ? '' : null"
                    [attr.aria-hidden]="!demoEnterExitMenuOpen()"
                    class="w-60 p-3 rounded-m3-md bg-surface-box border border-outline shadow-md space-y-1 origin-top"
                    style="transition-property: transform, opacity;"
                    [style.transition-duration]="demoEnterExitMenuOpen() ? 'var(--md-sys-motion-duration-short4)' : 'var(--md-sys-motion-duration-short3)'"
                    [style.transition-timing-function]="demoEnterExitMenuOpen() ? 'var(--md-sys-motion-easing-emphasized-decelerate)' : 'var(--md-sys-motion-easing-emphasized-accelerate)'"
                    [style.transform]="demoEnterExitMenuOpen() ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'"
                    [style.opacity]="demoEnterExitMenuOpen() ? '1' : '0'">
                    <span class="text-xs font-bold text-main block">Menú Contextual (Entra 200ms / Sale 150ms)</span>
                    <span class="text-[11px] text-muted block">Anclado al botón superior (origin-top).</span>
                  </div>
                </div>

                <div
                  [attr.inert]="!demoEnterExitSnackbarOpen() ? '' : null"
                  [attr.aria-hidden]="!demoEnterExitSnackbarOpen()"
                  class="p-3 rounded-m3-lg bg-inverse-surface text-on-inverse-surface shadow-lg flex items-center justify-between gap-2"
                  style="transition-property: transform, opacity;"
                  [style.transition-duration]="demoEnterExitSnackbarOpen() ? 'var(--md-sys-motion-duration-medium1)' : 'var(--md-sys-motion-duration-short4)'"
                  [style.transition-timing-function]="demoEnterExitSnackbarOpen() ? 'var(--md-sys-motion-easing-emphasized-decelerate)' : 'var(--md-sys-motion-easing-emphasized-accelerate)'"
                  [style.transform]="demoEnterExitSnackbarOpen() ? 'translateY(0)' : 'translateY(24px)'"
                  [style.opacity]="demoEnterExitSnackbarOpen() ? '1' : '0'">
                  <span class="text-xs font-semibold">Sheet de Acciones • Borde inferior (250ms in / 200ms out)</span>
                  <span class="text-[10px] font-mono opacity-80">emphasized</span>
                </div>
              </div>
            </div>
          }

          @case ('skeleton') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div class="lg:col-span-5 space-y-3">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patrón 6 • Skeleton Loaders
                </span>
                <h4 class="text-title-md-emphasized text-main">Geometría Pre-Asignada y Zero CLS (0.00)</h4>
                <p class="text-xs text-muted leading-relaxed">
                  En lugar de spinners genéricos o <code class="font-mono text-error">.animate-pulse</code>, usá <code class="font-mono text-primary">.m3-skeleton.m3-skeleton-shimmer</code> con la altura exacta de la tarjeta final para evitar saltos de layout.
                </p>

                <m3-button variant="filled" size="sm" icon="hourglass_empty" (action)="triggerSkeletonSim()">
                  {{ demoSkeletonSimulated() ? 'Cargando Datos (2s)...' : 'Simular Carga Asíncrona (2s)' }}
                </m3-button>
              </div>

              <div class="lg:col-span-7 p-4 rounded-m3-lg bg-surface-high border border-outline-sub">
                @if (demoSkeletonSimulated()) {
                  <div class="space-y-3" aria-label="Cargando métricas de operación">
                    <div class="m3-skeleton m3-skeleton-shimmer h-5 w-44 rounded-m3-sm"></div>
                    <div class="grid grid-cols-3 gap-3">
                      <div class="m3-skeleton m3-skeleton-shimmer h-14 rounded-m3-md"></div>
                      <div class="m3-skeleton m3-skeleton-shimmer h-14 rounded-m3-md"></div>
                      <div class="m3-skeleton m3-skeleton-shimmer h-14 rounded-m3-md"></div>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-3 m3-anim-item-in">
                    <div class="flex items-center justify-between gap-2 h-5">
                      <span class="text-xs font-bold text-main">Métricas Consolidadas en Línea</span>
                      <span class="text-[10px] font-mono text-success">CLS = 0.00</span>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                      <div class="h-14 p-2.5 rounded-m3-md bg-surface-box border border-outline-sub flex flex-col justify-center">
                        <span class="text-[10px] text-muted">Latencia</span>
                        <span class="text-xs font-bold font-mono text-main">14 ms</span>
                      </div>
                      <div class="h-14 p-2.5 rounded-m3-md bg-surface-box border border-outline-sub flex flex-col justify-center">
                        <span class="text-[10px] text-muted">SLA</span>
                        <span class="text-xs font-bold font-mono text-success">99.98%</span>
                      </div>
                      <div class="h-14 p-2.5 rounded-m3-md bg-surface-box border border-outline-sub flex flex-col justify-center">
                        <span class="text-[10px] text-muted">Cola</span>
                        <span class="text-xs font-bold font-mono text-primary">0 pend.</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @case ('applied-examples') {
            <div class="space-y-5">
              <div class="space-y-0.5">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider inline-block">
                  Patrón 7 • Ejemplos Compuestos En Vivo
                </span>
                <h4 class="text-title-md-emphasized text-main">
                  Cascada Stagger Real (Con Cámara Lenta) y Transición View Transitions Hero → Detalle
                </h4>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Ejemplo 7A: Lista Cascada Stagger con transición real CSS (slide + fade escalonados) -->
                <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-3">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span class="text-xs font-bold text-main block">Ejemplo A: Cascada Stagger (--stagger-index × paso)</span>
                      <span class="text-[11px] text-muted">Cada fila espera un paso incremental (capeado máximo a ~240ms totales).</span>
                    </div>
                    <m3-button variant="filled" size="sm" icon="replay" (action)="replayStaggerDemo()">
                      Reproducir Cascada
                    </m3-button>
                  </div>

                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <m3-button-group
                      variant="connected"
                      selectionMode="single"
                      size="xs"
                      ariaLabel="Modo de cascada"
                      [options]="staggerModeOptions"
                      [value]="[staggerCalmMode() ? 'calm' : 'expressive']"
                      (selectionChange)="onStaggerModeChange($event)" />

                    <m3-chip
                      type="filter"
                      icon="slow_motion_video"
                      [selected]="staggerSlowMo()"
                      (action)="toggleStaggerSlowMo()">
                      {{ staggerSlowMo() ? 'Cámara Lenta (3x)' : 'Ver en Cámara Lenta (3x)' }}
                    </m3-chip>
                  </div>

                  <div class="space-y-2 overflow-hidden">
                    @for (row of staggerRows; track row.id) {
                      <div
                        class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub flex items-center justify-between gap-2"
                        style="transition-property: transform, opacity;"
                        [style.transition-duration]="staggerCalmMode() ? (staggerSlowMo() ? '450ms' : '150ms') : (staggerSlowMo() ? '600ms' : '220ms')"
                        [style.transition-timing-function]="staggerCalmMode() ? 'linear' : 'var(--md-sys-motion-easing-emphasized-decelerate)'"
                        [style.transition-delay]="staggerReplay.active() && !staggerCalmMode() ? (row.index * (staggerSlowMo() ? 140 : 40)) + 'ms' : '0ms'"
                        [style.transform]="
                          staggerReplay.active()
                            ? 'translateX(0)'
                            : (staggerCalmMode() ? 'translateX(0)' : 'translateX(32px)')
                        "
                        [style.opacity]="staggerReplay.active() ? '1' : '0.08'">
                        <div class="flex items-center gap-2 min-w-0">
                          <span class="w-5 h-5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold flex items-center justify-center shrink-0">
                            {{ row.index + 1 }}
                          </span>
                          <div class="min-w-0">
                            <span class="text-xs font-bold text-main block truncate">{{ row.title }}</span>
                            <span class="text-[10px] text-muted block truncate">{{ row.detail }}</span>
                          </div>
                        </div>
                        <span class="text-[10px] font-mono text-primary shrink-0">
                          {{ staggerCalmMode() ? '0ms delay' : '+' + row.index * 40 + 'ms' }}
                        </span>
                      </div>
                    }
                  </div>
                </m3-card>

                <!-- Ejemplo 7B: View Transition REAL de Card Origen -> Panel Detalle -->
                <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-3">
                  <div class="space-y-0.5">
                    <span class="text-xs font-bold text-main block">Ejemplo B: View Transition API Real (Card Origen ↔ Detalle)</span>
                    <span class="text-[11px] text-muted">
                      Tocá cualquier tarjeta: dispara <code class="font-mono text-primary">startViewTransition</code> asignando <code class="font-mono text-primary">hero-detail</code> dinámicamente y ocultando la tarjeta origen sin mover la grilla.
                    </span>
                  </div>

                  @if (expandedVtCard(); as detailCard) {
                    <!-- Panel Detalle morphing con view-transition-name: hero-detail -->
                    <div
                      class="p-4 rounded-m3-lg bg-surface-box border-2 border-primary shadow-md space-y-3"
                      [style.view-transition-name]="'hero-detail'">
                      <div class="flex items-center justify-between gap-2">
                        <div>
                          <span class="text-[10px] font-mono text-primary font-bold block">{{ detailCard.badge }} • VISTA EXPANDIDA</span>
                          <h5 class="text-sm font-bold text-main">{{ detailCard.title }}</h5>
                        </div>
                        <m3-button variant="tonal" size="xs" icon="arrow_back" (action)="closeVtDetail()">
                          Volver a Grilla (250ms)
                        </m3-button>
                      </div>
                      <p class="text-xs text-muted leading-relaxed">
                        Métrica activa: <strong class="text-main font-mono">{{ detailCard.metric }}</strong>. La tarjeta original en la grilla permanece montada con <code class="font-mono">invisible</code> + <code class="font-mono text-primary">view-transition-name: null</code> para cero salto de layout al regresar.
                      </p>
                    </div>
                  }

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    @for (card of dynamicVtCards; track card.id) {
                      <m3-card
                        [interactive]="true"
                        [invisible]="expandedVtCardId() === card.id"
                        [variant]="activeVtCardId() === card.id ? 'elevated' : 'outlined'"
                        [surface]="activeVtCardId() === card.id ? 'box' : 'low'"
                        padding="sm"
                        shape="md"
                        customClass="space-y-1 text-start"
                        [style.view-transition-name]="expandedVtCardId() === null && activeVtCardId() === card.id ? 'hero-detail' : null"
                        (action)="openVtCardDetail(card.id)">
                        <span class="text-[10px] font-mono text-primary block">{{ card.badge }}</span>
                        <span class="text-xs font-bold text-main block">{{ card.title }}</span>
                        <span class="text-[10px] font-mono block" [class.text-success]="activeVtCardId() === card.id" [class.text-muted]="activeVtCardId() !== card.id">
                          {{ activeVtCardId() === card.id ? 'vt-name: hero-detail' : 'vt-name: null' }}
                        </span>
                      </m3-card>
                    }
                  </div>

                  <!-- Recetas rápidas copiables -->
                  <div class="space-y-2 pt-2 border-t border-outline-sub">
                    @for (recipe of appliedRecipes; track recipe.id) {
                      <div class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub flex items-start justify-between gap-2">
                        <div class="space-y-0.5 min-w-0">
                          <span class="text-xs font-bold text-main block">{{ recipe.title }}</span>
                          <span class="text-[10px] font-mono text-primary block">{{ recipe.timing }}</span>
                          <p class="text-[11px] text-muted leading-snug">{{ recipe.why }}</p>
                        </div>
                        <m3-button
                          variant="text"
                          size="sm"
                          icon="content_copy"
                          ariaLabel="Copiar receta"
                          (action)="emitCopy(recipe.snippet, recipe.title)">
                          Copiar
                        </m3-button>
                      </div>
                    }
                  </div>
                </m3-card>
              </div>
            </div>
          }
        }
      </div>

      <!-- M3 APPLYING TRANSITIONS: LOS 8 PRINCIPIOS -->
      <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-primary text-base" aria-hidden="true">verified</span>
            <h4 class="text-xs font-bold text-main uppercase tracking-wider">
              Applying Transitions • Los 8 Principios Oficiales de Calidad M3
            </h4>
          </div>
          <span class="text-[10px] font-mono text-muted">m3.material.io/styles/motion/transitions/applying-transitions</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          @for (principle of applyingTransitions; track principle.number) {
            <button
              type="button"
              class="p-3 rounded-m3-md bg-surface-box border border-outline-sub/70 space-y-1 text-start state-layer focus-ring-m3 cursor-pointer"
              (click)="emitCopy(principle.tokenHint, principle.title)">
              <span class="font-bold text-main text-[11px] block">{{ principle.title }}</span>
              <p class="text-[11px] text-muted leading-tight">{{ principle.body }}</p>
              <span class="text-[10px] font-mono text-primary block pt-0.5">{{ principle.tokenHint }}</span>
            </button>
          }
        </div>
      </m3-card>
    </m3-card>
  `
})
export class MotionPatternsSectionComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private skeletonTimer: ReturnType<typeof setTimeout> | null = null;

  readonly copyToken = output<ClipboardCopyPayload>();

  readonly hierarchicalReplay = new MotionReplayHandle(this.destroyRef, true);
  readonly lateralReplay = new MotionReplayHandle(this.destroyRef, true);
  readonly topLevelReplay = new MotionReplayHandle(this.destroyRef, true);
  readonly staggerReplay = new MotionReplayHandle(this.destroyRef, true);

  readonly activePattern = signal<MotionPatternId>('container');

  readonly patternTabs: M3TabItem[] = [
    { id: 'container', label: '1. Container', icon: 'open_in_new' },
    { id: 'forward-backward', label: '2. Jerarquía', icon: 'swap_horiz' },
    { id: 'lateral', label: '3. Lateral', icon: 'view_column' },
    { id: 'top-level', label: '4. Top Level', icon: 'layers' },
    { id: 'enter-exit', label: '5. Enter/Exit', icon: 'open_in_browser' },
    { id: 'skeleton', label: '6. Skeletons', icon: 'hourglass_empty' },
    { id: 'applied-examples', label: '7. Ejemplos Extras', icon: 'auto_awesome' }
  ];

  readonly applyingTransitions = APPLYING_TRANSITIONS_PRINCIPLES;
  readonly appliedRecipes = MOTION_APPLIED_RECIPES;

  readonly demoContainerExpanded = signal<boolean>(false);
  readonly demoSearchPillExpanded = signal<boolean>(false);

  readonly hierarchicalStep = signal<'step1' | 'step2' | 'step3'>('step1');
  readonly demoHierarchicalDirection = signal<'forward' | 'backward'>('forward');
  readonly hierarchicalStepOptions: M3ButtonGroupOption[] = [
    { id: 'step1', label: 'Paso 1' },
    { id: 'step2', label: 'Paso 2' },
    { id: 'step3', label: 'Paso 3' }
  ];

  readonly demoLateralTab = signal<'general' | 'telemetry' | 'hardware'>('general');
  readonly demoLateralDirection = signal<'next' | 'prev'>('next');
  readonly lateralTabOptions: M3ButtonGroupOption[] = [
    { id: 'general', label: 'General' },
    { id: 'telemetry', label: 'Telemetría' },
    { id: 'hardware', label: 'Hardware' }
  ];

  readonly demoTopLevelDest = signal<'dashboard' | 'fleet' | 'settings'>('dashboard');
  readonly topLevelDestOptions: M3ButtonGroupOption[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'fleet', label: 'Flota POS' },
    { id: 'settings', label: 'Ajustes' }
  ];

  readonly demoEnterExitMenuOpen = signal<boolean>(false);
  readonly demoEnterExitSnackbarOpen = signal<boolean>(false);
  readonly demoSkeletonSimulated = signal<boolean>(false);

  readonly staggerCalmMode = signal<boolean>(false);
  readonly staggerSlowMo = signal<boolean>(false);
  readonly staggerModeOptions: M3ButtonGroupOption[] = [
    { id: 'expressive', label: 'Expressive (+40ms/fila)' },
    { id: 'calm', label: 'Reduced Motion (0ms Fade)' }
  ];

  readonly staggerRows: readonly StaggerOrderRow[] = [
    { index: 0, id: 'ord-1', title: 'Mesa #04 • Expressive Combo', detail: 'Impreso en Cocina KDS', status: '0ms' },
    { index: 1, id: 'ord-2', title: 'Pedido #18 • Take Away', detail: 'Validando pago QR', status: '40ms' },
    { index: 2, id: 'ord-3', title: 'Stock Alert • Café Especial', detail: 'Repo automática', status: '80ms' },
    { index: 3, id: 'ord-4', title: 'Sincronización Caja #2', detail: 'Token OKLCH activo', status: '120ms' }
  ];

  readonly activeVtCardId = signal<string>('vt-1');
  readonly expandedVtCardId = signal<string | null>(null);
  readonly dynamicVtCards: readonly DynamicVtCardSpec[] = [
    { id: 'vt-1', badge: 'CARD 01', title: 'Hero Expressive', summary: 'Activa', metric: '98.4 FPS composited' },
    { id: 'vt-2', badge: 'CARD 02', title: 'Bento Telemetría', summary: 'Inactiva', metric: '12.1 ms latency' },
    { id: 'vt-3', badge: 'CARD 03', title: 'Detalle Clínico', summary: 'Inactiva', metric: '0.00 CLS score' }
  ];
  readonly expandedVtCard = computed(
    () => this.dynamicVtCards.find(c => c.id === this.expandedVtCardId()) ?? null
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.skeletonTimer !== null) {
        clearTimeout(this.skeletonTimer);
      }
    });
  }

  onPatternTabActivated(tabId: string): void {
    if (tabId === 'forward-backward') {
      this.hierarchicalReplay.replay();
    } else if (tabId === 'lateral') {
      this.lateralReplay.replay();
    } else if (tabId === 'top-level') {
      this.topLevelReplay.replay();
    } else if (tabId === 'applied-examples') {
      this.staggerReplay.replay();
    }
  }

  onHierarchicalStepSelection(ids: string[]): void {
    const next = ids[0];
    if (next === 'step1' || next === 'step2' || next === 'step3') {
      const order: Record<'step1' | 'step2' | 'step3', number> = { step1: 1, step2: 2, step3: 3 };
      const current = this.hierarchicalStep();
      this.demoHierarchicalDirection.set(order[next] < order[current] ? 'backward' : 'forward');
      this.hierarchicalStep.set(next);
      this.hierarchicalReplay.replay();
    }
  }

  stepForwardHierarchical(): void {
    const current = this.hierarchicalStep();
    if (current === 'step1') {
      this.onHierarchicalStepSelection(['step2']);
    } else if (current === 'step2') {
      this.onHierarchicalStepSelection(['step3']);
    }
  }

  stepBackHierarchical(): void {
    const current = this.hierarchicalStep();
    if (current === 'step3') {
      this.onHierarchicalStepSelection(['step2']);
    } else if (current === 'step2') {
      this.onHierarchicalStepSelection(['step1']);
    }
  }

  onLateralSelection(ids: string[]): void {
    const tab = ids[0];
    if (tab !== 'general' && tab !== 'telemetry' && tab !== 'hardware') {
      return;
    }
    const order: Record<'general' | 'telemetry' | 'hardware', number> = {
      general: 0,
      telemetry: 1,
      hardware: 2
    };
    const current = this.demoLateralTab();
    this.demoLateralDirection.set(order[tab] < order[current] ? 'prev' : 'next');
    this.demoLateralTab.set(tab);
    this.lateralReplay.replay();
  }

  onTopLevelSelection(ids: string[]): void {
    const dest = ids[0];
    if (dest === 'dashboard' || dest === 'fleet' || dest === 'settings') {
      this.demoTopLevelDest.set(dest);
      this.topLevelReplay.replay();
    }
  }

  triggerSkeletonSim(): void {
    if (this.skeletonTimer !== null) {
      clearTimeout(this.skeletonTimer);
    }
    this.demoSkeletonSimulated.set(true);
    this.skeletonTimer = setTimeout(() => {
      this.skeletonTimer = null;
      this.demoSkeletonSimulated.set(false);
    }, 2000);
  }

  replayStaggerDemo(): void {
    this.staggerReplay.replay();
  }

  onStaggerModeChange(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'calm' || picked === 'expressive') {
      this.staggerCalmMode.set(picked === 'calm');
      this.staggerReplay.replay();
    }
  }

  toggleStaggerSlowMo(): void {
    this.staggerSlowMo.update(v => !v);
    this.staggerReplay.replay();
  }

  openVtCardDetail(id: string): void {
    this.activeVtCardId.set(id);
    this.cdr.detectChanges();
    this.runOptionalViewTransition(() => {
      this.expandedVtCardId.set(id);
    });
  }

  closeVtDetail(): void {
    this.runOptionalViewTransition(() => {
      this.expandedVtCardId.set(null);
    });
  }

  private runOptionalViewTransition(mutate: () => void): void {
    const doc = typeof document !== 'undefined' ? (document as Document & { startViewTransition?: (cb: () => void) => unknown }) : null;
    if (doc && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => {
        mutate();
        this.cdr.detectChanges();
      });
    } else {
      mutate();
    }
  }

  emitCopy(text: string, label: string): void {
    this.copyToken.emit({
      text,
      message: `${label}: snippet/token copiado`
    });
  }
}
