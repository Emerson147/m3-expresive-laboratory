import { Component, computed, signal } from '@angular/core';
import {
  CANONICAL_DURATIONS,
  CANONICAL_EASINGS,
  MOTION_THEATER_SETS,
  SPRING_PHYSICS_BY_SPEED,
  SPRING_WEB_CURVES,
  SpringSpeed,
  SpringStyle
} from './motion-specs.data';

type MotionPatternId =
  | 'container'
  | 'forward-backward'
  | 'lateral'
  | 'top-level'
  | 'enter-exit'
  | 'skeleton'
  | 'shared-axis'
  | 'fade-through'
  | 'fade';

/**
 * Laboratory page for Step 4 (Motion & Transitions): interactive playground for
 * M3 perceptual asymmetry, disjoint springs (Spatial vs. Effects), 6 canonical patterns,
 * 10 easing curves, 16 durations, the 3-Filter Playbook, CSS traps, and WCAG reduced motion.
 */
@Component({
  selector: 'app-motion-lab',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- GRID DE 2 COLUMNAS: ASIMETRÍA + FÍSICA DE RESORTES -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- PILAR 1: ASIMETRÍA DE ENTRADA VS SALIDA (MODO ESTUDIO CON TOKENS EXPLÍCITOS) -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-5 shadow-xs">
          <div class="space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                <span class="material-symbols-rounded text-base text-primary">swap_horiz</span>
                Pilar 1 • Asimetría Perceptual
              </div>
              <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                <button
                  type="button"
                  (click)="setAsymmetryMode('disposable')"
                  [class]="demoAsymmetryMode() === 'disposable' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-2.5 py-0.5 rounded-full text-[11px] cursor-pointer">
                  Descartable (400/200)
                </button>
                <button
                  type="button"
                  (click)="setAsymmetryMode('onscreen')"
                  [class]="demoAsymmetryMode() === 'onscreen' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-2.5 py-0.5 rounded-full text-[11px] cursor-pointer">
                  En Pantalla (500/250)
                </button>
              </div>
            </div>

            <h3 class="text-title-md font-bold text-main">
              {{ demoAsymmetryMode() === 'disposable'
                ? 'Entrada Desacelerada vs. Salida Permanente'
                : 'Comienza y Termina en Pantalla (Hero / Card)' }}
            </h3>
            <p class="text-xs text-muted leading-relaxed">
              @if (demoAsymmetryMode() === 'disposable') {
                En superficies descartables (modales, snackbars), <strong>entrada y salida jamás comparten curva</strong>: entra en 400ms desacelerando y se descarta en 200ms acelerando fuera de pantalla.
              } @else {
                Si el destino vuelve a quedar visible en pantalla (Hero Card &harr; Detalle), <strong>no uses accelerate</strong> al cerrar porque golpea en seco: usa <strong>emphasized</strong> (500ms abrir / 250ms regresar) para frenar suave en su origen.
              }
            </p>

            <!-- TOKENS COMPARATIVOS -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub space-y-1">
                <div class="text-[11px] font-bold text-primary flex items-center gap-1">
                  <span class="material-symbols-rounded text-sm">login</span>
                  {{ demoAsymmetryMode() === 'disposable' ? 'Entrada (Entering)' : 'Expansión (Open)' }}
                </div>
                <div class="font-mono text-xs font-bold text-main">
                  {{ demoAsymmetryMode() === 'disposable' ? 'medium4 • 400ms' : 'long2 • 500ms' }}
                </div>
                <div class="text-[10px] text-muted font-mono leading-tight">
                  {{ demoAsymmetryMode() === 'disposable' ? 'emphasized-decelerate' : 'emphasized (linear 10-stop)' }}<br>
                  {{ demoAsymmetryMode() === 'disposable' ? 'cubic-bezier(0.05, 0.7, 0.1, 1)' : '22% despegue rápido • 78% freno suave' }}
                </div>
              </div>

              <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub space-y-1">
                <div class="text-[11px] font-bold text-primary flex items-center gap-1">
                  <span class="material-symbols-rounded text-sm">logout</span>
                  {{ demoAsymmetryMode() === 'disposable' ? 'Salida Permanente' : 'Retorno (Close)' }}
                </div>
                <div class="font-mono text-xs font-bold text-main">
                  {{ demoAsymmetryMode() === 'disposable' ? 'short4 • 200ms' : 'medium1 • 250ms' }}
                </div>
                <div class="text-[10px] text-muted font-mono leading-tight">
                  {{ demoAsymmetryMode() === 'disposable' ? 'emphasized-accelerate' : 'emphasized (sin accelerate)' }}<br>
                  {{ demoAsymmetryMode() === 'disposable' ? 'cubic-bezier(0.3, 0, 0.8, 0.15)' : 'Acelera al inicio y frena en la card' }}
                </div>
              </div>
            </div>

            <!-- PLAYGROUND INTERACTIVO DE ASIMETRÍA -->
            <div class="pt-2">
              <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                <!-- CONTENEDOR ASIMÉTRICO EN VIVO (MISMA ARQUITECTURA DE CAJA ACOTADA) -->
                <div
                  (click)="toggleAsymmetryDemo()"
                  [style.transition-duration]="demoAsymmetryOpen()
                    ? (demoAsymmetryMode() === 'disposable' ? 'var(--md-sys-motion-duration-medium4)' : 'var(--md-sys-motion-duration-long2)')
                    : (demoAsymmetryMode() === 'disposable' ? 'var(--md-sys-motion-duration-short4)' : 'var(--md-sys-motion-duration-medium1)')"
                  [style.transition-timing-function]="demoAsymmetryMode() === 'disposable'
                    ? (demoAsymmetryOpen() ? 'var(--md-sys-motion-easing-emphasized-decelerate)' : 'var(--md-sys-motion-easing-emphasized-accelerate)')
                    : 'var(--md-sys-motion-easing-emphasized)'"
                  [class]="demoAsymmetryOpen()
                    ? 'w-[384px] h-36 p-4 bg-surface-box text-main border-primary rounded-m3-xl shadow-lg'
                    : 'w-56 h-10 px-4 bg-primary text-on-primary border-transparent rounded-full shadow-xs'"
                  class="cursor-pointer overflow-hidden border select-none max-w-full transition-all text-center">
                  @if (!demoAsymmetryOpen()) {
                    <div class="h-full flex items-center justify-center gap-2 text-xs font-bold">
                      <span class="material-symbols-rounded text-base">open_in_full</span>
                      <span>{{ demoAsymmetryMode() === 'disposable' ? 'Abrir Superficie (400ms)' : 'Expandir en Pantalla (500ms)' }}</span>
                    </div>
                  } @else {
                    <div class="space-y-2 text-left" style="animation: m3ContainerContentIn 250ms var(--md-sys-motion-easing-emphasized-decelerate) both;">
                      <div class="flex items-center justify-between border-b border-outline-sub pb-1.5">
                        <span class="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <span class="material-symbols-rounded text-sm">notifications</span>
                          Superficie Revelada
                        </span>
                        <span class="material-symbols-rounded text-base text-muted hover:text-main">close</span>
                      </div>
                      <p class="text-xs text-muted leading-relaxed">
                        @if (demoAsymmetryMode() === 'disposable') {
                          Desaceleración suave al entrar (400ms) para asimilar la info; al cerrar, salida acelerada e instantánea (200ms).
                        } @else {
                          Despegue elástico al abrir (500ms) y retorno ágil (250ms) frenando suave sobre el origen con <code class="font-mono text-main">emphasized</code>.
                        }
                      </p>
                      <div class="text-[10px] font-mono text-primary font-bold">
                        {{ demoAsymmetryMode() === 'disposable' ? 'Clic para cerrar acelerado (200ms)' : 'Clic para regresar suave (250ms)' }}
                      </div>
                    </div>
                  }
                </div>

                <!-- BARRA DE TIEMPO VISUAL -->
                <div class="w-full max-w-xs mt-4 pt-2 border-t border-outline-sub flex items-center justify-between text-[10px] font-mono text-muted">
                  <span>Curva activa:</span>
                  <span class="font-bold text-main">
                    {{ demoAsymmetryMode() === 'disposable'
                      ? (demoAsymmetryOpen() ? 'emphasized-decelerate (400ms)' : 'emphasized-accelerate (200ms)')
                      : (demoAsymmetryOpen() ? 'emphasized (500ms)' : 'emphasized (250ms)') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="text-[11px] text-muted flex items-center gap-1.5 pt-2 border-t border-outline-sub">
            <span class="material-symbols-rounded text-sm text-primary">info</span>
            <span>Configurado en <code class="font-mono text-main">src/styles/_motion.css</code> y en <code class="font-mono text-main">html.vt-exiting</code>.</span>
          </div>
        </div>

        <!-- PILAR 2: RESORTES DISJUNTOS: SPATIAL VS EFFECTS -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-5 shadow-xs">
          <div class="space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                <span class="material-symbols-rounded text-base text-primary">all_inclusive</span>
                Pilar 2 • Motion Physics &amp; Web Spring Curves
              </div>

              <div class="flex items-center gap-2">
                <!-- SELECTOR DE ESTILO (EXPRESSIVE VS STANDARD) -->
                <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                  <button
                    (click)="setSpringStyle('expressive')"
                    [class]="demoSpringStyle() === 'expressive' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                    class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                    Expressive
                  </button>
                  <button
                    (click)="setSpringStyle('standard')"
                    [class]="demoSpringStyle() === 'standard' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                    class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                    Standard
                  </button>
                </div>

                <button
                  (click)="triggerSpringDemo()"
                  class="btn-m3 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">play_arrow</span>
                  Disparar Pulso
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 class="text-title-md font-bold text-main">Física Espacial vs. Amortiguación de Efectos</h3>
                <p class="text-xs text-muted leading-relaxed mt-0.5">
                  Especificación canónica Material 3: los resortes combinan amortiguación (&zeta;) y rigidez (k). En Web, Google traduce resortes a curvas <code class="font-mono text-primary font-bold">cubic-bezier</code> de alta fidelidad.
                </p>
              </div>

              <!-- SELECTOR DE VELOCIDAD -->
              <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                <button
                  (click)="setSpringSpeed('fast')"
                  [class]="demoSpringSpeed() === 'fast' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                  Fast (350ms)
                </button>
                <button
                  (click)="setSpringSpeed('default')"
                  [class]="demoSpringSpeed() === 'default' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                  Default (500ms)
                </button>
                <button
                  (click)="setSpringSpeed('slow')"
                  [class]="demoSpringSpeed() === 'slow' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                  Slow ({{ activeSpringSpecs().style === 'expressive' ? '650ms' : '750ms' }})
                </button>
              </div>
            </div>

            <!-- COMPARATIVA DE RESORTES INTERACTIVOS -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <!-- SPATIAL SPRING -->
              <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-base">crop_free</span>
                      Familia Espacial (Spatial)
                    </div>
                    <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-mono font-bold">
                      &zeta; = {{ activeSpringSpecs().spatial.damping }} (Subamortiguado)
                    </span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">
                    Posición, escala, ancho y geometrías. Permite sobrepaso elástico natural (momentum) sin vibración residual.
                  </p>
                </div>

                <!-- ELEMENTO ANIMADO SPATIAL -->
                <div class="h-28 bg-surface-high rounded-m3-md flex items-center justify-center overflow-hidden relative cursor-pointer"
                  (click)="triggerSpringDemo()">
                  @for (trigger of [demoSpringCount()]; track trigger) {
                    <div
                      class="w-14 h-14 rounded-m3-md bg-primary text-on-primary flex flex-col items-center justify-center font-bold text-xs shadow-md select-none"
                      [style.animation]="demoSpringCount() > 0
                        ? ('m3SpringScale ' + activeSpringSpecs().spatial.duration + 'ms ' + activeSpringSpecs().spatial.curve + ' both')
                        : 'none'">
                      <span class="material-symbols-rounded text-xl">transform</span>
                      <span class="text-[9px] font-mono font-normal">Rebote</span>
                    </div>
                  }
                </div>

                <!-- ESPECIFICACIONES TÉCNICAS SPATIAL -->
                <div class="space-y-1.5 pt-1 border-t border-outline-sub text-[11px]">
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Android / Compose:</span>
                    <span class="font-mono font-bold text-main">Damping {{ activeSpringSpecs().spatial.damping }} • Stiffness {{ activeSpringSpecs().spatial.stiffness }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Web Curve Token:</span>
                    <span class="font-mono text-primary font-bold">{{ activeSpringSpecs().spatial.token }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">CSS Easing &amp; Timing:</span>
                    <span class="font-mono text-[10px] text-main">{{ activeSpringSpecs().spatial.curve }} • {{ activeSpringSpecs().spatial.duration }}ms</span>
                  </div>
                </div>
              </div>

              <!-- EFFECTS SPRING -->
              <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="text-xs font-bold text-tertiary flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-base">palette</span>
                      Familia Efectos (Effects)
                    </div>
                    <span class="px-2 py-0.5 rounded-full bg-surface-high text-muted text-[10px] font-mono font-bold">
                      &zeta; = {{ activeSpringSpecs().effects.damping }} (Crítico / 0 Rebote)
                    </span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">
                    Color, opacidad, elevación y blur. <strong>Prohibido rebotar:</strong> la oscilación en propiedades ópticas fatiga la retina y genera flickering.
                  </p>
                </div>

                <!-- ELEMENTO ANIMADO EFFECTS -->
                <div class="h-28 bg-surface-high rounded-m3-md flex items-center justify-center overflow-hidden relative cursor-pointer"
                  (click)="triggerSpringDemo()">
                  @for (trigger of [demoSpringCount()]; track trigger) {
                    <div
                      class="w-14 h-14 rounded-m3-md flex flex-col items-center justify-center font-bold text-xs shadow-xs select-none"
                      [style.animation]="demoSpringCount() > 0
                        ? ('m3SpringEffects ' + activeSpringSpecs().effects.duration + 'ms ' + activeSpringSpecs().effects.curve + ' both')
                        : 'none'"
                      style="background-color: var(--color-tertiary); color: var(--color-on-tertiary);">
                      <span class="material-symbols-rounded text-xl">contrast</span>
                      <span class="text-[9px] font-mono font-normal">Suave</span>
                    </div>
                  }
                </div>

                <!-- ESPECIFICACIONES TÉCNICAS EFFECTS -->
                <div class="space-y-1.5 pt-1 border-t border-outline-sub text-[11px]">
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Android / Compose:</span>
                    <span class="font-mono font-bold text-main">Damping {{ activeSpringSpecs().effects.damping }} • Stiffness {{ activeSpringSpecs().effects.stiffness }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Web Curve Token:</span>
                    <span class="font-mono text-tertiary font-bold">{{ activeSpringSpecs().effects.token }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">CSS Easing &amp; Timing:</span>
                    <span class="font-mono text-[10px] text-main">{{ activeSpringSpecs().effects.curve }} • {{ activeSpringSpecs().effects.duration }}ms</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CRITERIO DE DECISIÓN ARQUITECTÓNICA: EXPRESSIVE VS STANDARD -->
            <div class="p-3.5 rounded-m3-lg bg-surface-high/60 border border-outline-sub space-y-2.5">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-1.5 text-xs font-bold text-main">
                  <span class="material-symbols-rounded text-base text-primary">menu_book</span>
                  <span>Laboratorio Teórico: ¿Cuándo usar Expressive vs. Standard?</span>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-outline-sub text-muted font-bold">
                  M3 Decision Matrix
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <!-- EXPRESSIVE CARD -->
                <div class="p-3 rounded-m3-md bg-surface border space-y-1.5 transition-colors"
                  [class.border-primary]="demoSpringStyle() === 'expressive'"
                  [class.border-outline-sub]="demoSpringStyle() !== 'expressive'">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-primary flex items-center gap-1">
                      <span class="material-symbols-rounded text-sm">auto_awesome</span>
                      Expressive (Carisma y Deleite)
                    </span>
                    <span class="font-mono text-[10px] text-primary font-bold">y₁ = 1.67 (+67%)</span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">
                    <strong>Para momentos de foco cognitivo:</strong> modales, drawers, cards expandibles (Container Transform), botones de acción flotante (FAB) o celebraciones de tareas. Transmite inercia física, peso elástico y respuesta viva.
                  </p>
                </div>

                <!-- STANDARD CARD -->
                <div class="p-3 rounded-m3-md bg-surface border space-y-1.5 transition-colors"
                  [class.border-primary]="demoSpringStyle() === 'standard'"
                  [class.border-outline-sub]="demoSpringStyle() !== 'standard'">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-main flex items-center gap-1">
                      <span class="material-symbols-rounded text-sm">speed</span>
                      Standard (Utilitario e Invisible)
                    </span>
                    <span class="font-mono text-[10px] text-muted font-bold">y₁ = 1.06 (+6%)</span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">
                    <strong>Para interfaces densas y alta frecuencia:</strong> tablas de inventario, grillas de datos enterprise, dropdowns continuos y campos de texto. Evita la fatiga visual de rebotes repetitivos mientras mantiene fluidez sin fricción.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="text-[11px] text-muted flex items-center justify-between pt-2 border-t border-outline-sub flex-wrap gap-2">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm text-primary">verified</span>
              <span>M3 Web Spec: Curvas <code class="font-mono text-main">cubic-bezier</code> con sobrepaso en eje Y (&gt; 1.0) para inercia real en navegador.</span>
            </div>
            <div class="font-mono text-[10px] text-muted">
              Tokens activos: --md-sys-motion-spring-{{ demoSpringStyle() }}-{{ demoSpringSpeed() }}-spatial
            </div>
          </div>
        </div>

      </div>

      <!-- PILAR 3: LOS 6 PATRONES CANÓNICOS DE TRANSICIÓN M3 (GOOGLE SPEC) -->
      <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">alt_route</span>
              Pilar 3 • Los 6 Patrones Canónicos de Transición M3
            </div>
            <h3 class="text-title-md font-bold text-main">Taxonomía Oficial de Transiciones y Modelo Mental</h3>
            <p class="text-xs text-muted max-w-2xl leading-relaxed mt-0.5">
              Material 3 define exactamente 6 patrones canónicos para conectar elementos y vistas, guiando la orientación cognitiva sin generar fricción perceptiva.
            </p>
          </div>

          <!-- SELECTOR DE LOS 6 PATRONES -->
          <div class="flex flex-wrap items-center gap-1.5 p-1 bg-surface-high rounded-full border border-outline-sub">
            <button
              (click)="setPattern('container')"
              [class]="demoActivePattern() === 'container' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-sm">open_in_new</span>
              1. Container Transform
            </button>
            <button
              (click)="setPattern('forward-backward')"
              [class]="demoActivePattern() === 'forward-backward' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-sm">swap_horiz</span>
              2. Forward &amp; Backward
            </button>
            <button
              (click)="setPattern('lateral')"
              [class]="demoActivePattern() === 'lateral' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-sm">view_column</span>
              3. Lateral
            </button>
            <button
              (click)="setPattern('top-level')"
              [class]="demoActivePattern() === 'top-level' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-sm">layers</span>
              4. Top Level
            </button>
            <button
              (click)="setPattern('enter-exit')"
              [class]="demoActivePattern() === 'enter-exit' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-sm">open_in_browser</span>
              5. Enter &amp; Exit
            </button>
            <button
              (click)="setPattern('skeleton')"
              [class]="demoActivePattern() === 'skeleton' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
              <span class="material-symbols-rounded text-sm">hourglass_empty</span>
              6. Skeleton Loaders
            </button>
          </div>
        </div>

        <!-- DETALLE Y PLAYGROUND DEL PATRÓN ACTIVO -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">

          <!-- COLUMNA IZQUIERDA: EL POR QUÉ, PARA QUÉ Y CÓMO USARLO -->
          <div class="lg:col-span-1 p-5 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-4 shadow-xs">

            <!-- 1. CONTAINER TRANSFORM -->
            @if (demoActivePattern() === 'container') {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                    Máxima Expresividad M3
                  </span>
                  <span class="text-[10px] font-mono text-muted">long2 (500ms) / medium1 (250ms)</span>
                </div>

                <h4 class="text-sm font-bold text-main">Container Transform</h4>

                <div class="space-y-1.5 text-xs">
                  <div>
                    <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                    <p class="text-muted leading-relaxed">
                      Porque mantener el <strong>contenedor físico persistente</strong> (con su radio, sombra y color) evita que el cerebro sufra un corte abrupto. El usuario jamás pierde el foco de origen.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                    <p class="text-muted leading-relaxed">
                      Para momentos de héroe y jerarquías poco profundas: expandir un elemento para ver su detalle completo y colapsarlo de regreso al mismo lugar.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                    <p class="text-muted leading-relaxed">
                      Cards de productos, listas de tareas, barras de búsqueda que expanden resultados, FABs que se abren como sheets.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                  <div class="text-primary font-bold flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">check_circle</span>
                    <span>Do: Usar View Transitions API en Web (GPU-accelerated).</span>
                  </div>
                  <div class="text-muted flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs text-error">cancel</span>
                    <span>Don't: No encadenar en jerarquías profundas (pantalla 1&rarr;2&rarr;3&rarr;4).</span>
                  </div>
                </div>
              </div>
            }

            <!-- 2. FORWARD AND BACKWARD -->
            @if (demoActivePattern() === 'forward-backward' || demoActivePattern() === 'shared-axis') {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                    Jerarquía Consecutiva
                  </span>
                  <span class="text-[10px] font-mono text-muted">medium2 (300ms)</span>
                </div>

                <h4 class="text-sm font-bold text-main">Forward and Backward</h4>

                <div class="space-y-1.5 text-xs">
                  <div>
                    <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                    <p class="text-muted leading-relaxed">
                      Comunica con claridad matemática si el usuario está <strong>avanzando o retrocediendo</strong> en el árbol de la aplicación.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                    <p class="text-muted leading-relaxed">
                      Para navegar entre pantallas de niveles consecutivos (ej: de la bandeja de entrada a un correo individual).
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                    <p class="text-muted leading-relaxed">
                      Ítems de listas, botones de flujo "Siguiente/Atrás", tarjetas que abren vistas hijas. En Android se combina con un fade sutil para no recorrer toda la pantalla.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                  <div class="text-primary font-bold flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">check_circle</span>
                    <span>Do: Invertir la dirección exactamente al regresar (Backward).</span>
                  </div>
                  <div class="text-muted flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs text-error">cancel</span>
                    <span>Don't: No usar para navegar entre pestañas al mismo nivel (usar Lateral).</span>
                  </div>
                </div>
              </div>
            }

            <!-- 3. LATERAL -->
            @if (demoActivePattern() === 'lateral') {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                    Pares Homogéneos
                  </span>
                  <span class="text-[10px] font-mono text-muted">medium1 (250ms)</span>
                </div>

                <h4 class="text-sm font-bold text-main">Lateral</h4>

                <div class="space-y-1.5 text-xs">
                  <div>
                    <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                    <p class="text-muted leading-relaxed">
                      Al mover el contenido en <strong>estricto unísono sin fade</strong>, le indica al usuario que todos los elementos son pares iguales que habitan en el mismo plano horizontal.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                    <p class="text-muted leading-relaxed">
                      Insinúa y responde directamente al gesto táctil de <em>swipe</em> continuo entre secciones hermanas.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                    <p class="text-muted leading-relaxed">
                      Tabs (pestañas), carruseles de fotos, colecciones de productos en carrusel horizontal.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                  <div class="text-primary font-bold flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">check_circle</span>
                    <span>Do: Deslizar en bloque unificado sin desvanecimiento.</span>
                  </div>
                  <div class="text-muted flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs text-error">cancel</span>
                    <span>Don't: No agregar fade (rompe la sensación de swipe y confunde con jerarquía).</span>
                  </div>
                </div>
              </div>
            }

            <!-- 4. TOP LEVEL -->
            @if (demoActivePattern() === 'top-level' || demoActivePattern() === 'fade-through') {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                    Destinos de Primer Nivel
                  </span>
                  <span class="text-[10px] font-mono text-muted">short4 (200ms)</span>
                </div>

                <h4 class="text-sm font-bold text-main">Top Level (Fade Through)</h4>

                <div class="space-y-1.5 text-xs">
                  <div>
                    <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                    <p class="text-muted leading-relaxed">
                      Los módulos principales de una app (ej: Dashboard vs Flotas vs Configuración) <strong>no tienen relación física ni espacial entre sí</strong>. Deslizarlos engañaría al usuario haciéndole creer que Configuración está "a la derecha".
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                    <p class="text-muted leading-relaxed">
                      Para alternar entre pantallas principales sin crear expectativas de arrastre gestual.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                    <p class="text-muted leading-relaxed">
                      Navigation Bar inferior, Navigation Rail lateral, Navigation Drawer de escritorio.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                  <div class="text-primary font-bold flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">check_circle</span>
                    <span>Do: Fade-out rápido del viejo, luego fade-in del nuevo escalando a 100%.</span>
                  </div>
                  <div class="text-muted flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs text-error">cancel</span>
                    <span>Don't: Nunca usar deslizamiento lateral (conflictuaría con carruseles internos).</span>
                  </div>
                </div>
              </div>
            }

            <!-- 5. ENTER AND EXIT -->
            @if (demoActivePattern() === 'enter-exit' || demoActivePattern() === 'fade') {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                    Entorno y Contexto
                  </span>
                  <span class="text-[10px] font-mono text-muted">short3 (150ms) / medium4</span>
                </div>

                <h4 class="text-sm font-bold text-main">Enter and Exit</h4>

                <div class="space-y-1.5 text-xs">
                  <div>
                    <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                    <p class="text-muted leading-relaxed">
                      El cerebro humano asimila objetos contextuales según su <strong>borde físico de origen</strong>: lo que está arriba baja, lo que está abajo emerge.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                    <p class="text-muted leading-relaxed">
                      Para introducir componentes sin romper el flujo de la pantalla principal.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                    <p class="text-muted leading-relaxed">
                      <strong>Dentro de pantalla:</strong> Menús desplegables, snackbars, time pickers, tooltips.<br>
                      <strong>Fuera de pantalla:</strong> Bottom sheets, side sheets coplanares, app bars.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                  <div class="text-primary font-bold flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">check_circle</span>
                    <span>Do: Expandir alejándose del borde del dispositivo más próximo.</span>
                  </div>
                  <div class="text-muted flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs text-error">cancel</span>
                    <span>Don't: Evitar cross-fade lento que superponga capas semitransparentes sucias.</span>
                  </div>
                </div>
              </div>
            }

            <!-- 6. SKELETON LOADERS -->
            @if (demoActivePattern() === 'skeleton') {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                    Estabilización de Layout
                  </span>
                  <span class="text-[10px] font-mono text-muted">1500ms shimmer</span>
                </div>

                <h4 class="text-sm font-bold text-main">Skeleton Loaders</h4>

                <div class="space-y-1.5 text-xs">
                  <div>
                    <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                    <p class="text-muted leading-relaxed">
                      Los "jump cuts" (contenido que aparece de golpe y empuja la UI) desorientan la visión y provocan clics erróneos (Cumulative Layout Shift). El esqueleto fija la estructura antes de que lleguen los datos.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                    <p class="text-muted leading-relaxed">
                      Para una transición suave y continua desde el estado de espera asíncrona hacia la UI funcional definitiva.
                    </p>
                  </div>

                  <div class="pt-1">
                    <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                    <p class="text-muted leading-relaxed">
                      Al lanzar una pantalla, recargar feeds o aplicar filtros pesados en tablas enterprise.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                  <div class="text-primary font-bold flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">check_circle</span>
                    <span>Do: Pulso diagonal arriba-izquierda a abajo-derecha, fade-in suave al cargar.</span>
                  </div>
                  <div class="text-muted flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs text-error">cancel</span>
                    <span>Don't: Prohibido que el contenido haga pop-in desplazando botones o textos.</span>
                  </div>
                </div>
              </div>
            }

            <div class="text-[10px] font-mono text-muted pt-2 border-t border-outline-sub flex items-center justify-between">
              <span>M3 Spec: Transitions</span>
              <span class="text-primary font-bold">Legacy Curve + Durations</span>
            </div>
          </div>

          <!-- COLUMNA DERECHA: PLAYGROUND INTERACTIVO EN VIVO -->
          <div class="lg:col-span-2 p-6 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-center items-center min-h-[300px] relative overflow-hidden shadow-xs">

            <!-- 1. PLAYGROUND: CONTAINER TRANSFORM (MODO ESTUDIO CON TOKENS EXPLÍCITOS) -->
            @if (demoActivePattern() === 'container') {
              <div class="w-full flex flex-col items-center justify-center gap-4">
                <div class="w-full h-52 grid place-items-center">
                  <div
                    (click)="toggleContainerDemo()"
                    class="cursor-pointer overflow-hidden border select-none max-w-full transition-all"
                    [class]="demoContainerExpanded()
                      ? 'w-[448px] h-48 p-4 bg-surface-box text-main rounded-m3-xl border-primary shadow-lg'
                      : 'w-72 h-16 p-3 bg-surface-high hover:bg-surface-box text-main rounded-m3-lg border-outline-sub shadow-xs'"
                    [style.transition-duration]="demoContainerExpanded() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                    style="transition-timing-function: var(--md-sys-motion-easing-emphasized);">

                    <!-- ELEMENTO PERSISTENTE: CABECERA QUE ACOMPAÑA LA TRANSFORMACIÓN -->
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span
                          class="w-9 h-9 shrink-0 rounded-full grid place-items-center transition-colors"
                          style="transition-duration: var(--md-sys-motion-duration-medium2);"
                          [class]="demoContainerExpanded()
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-primary-box text-on-primary-box'">
                          <span class="material-symbols-rounded text-base">local_shipping</span>
                        </span>
                        <div class="min-w-0">
                          <div class="text-xs font-bold truncate">
                            {{ demoContainerExpanded() ? 'Telemetría • TRK-884' : 'Unidad TRK-884' }}
                          </div>
                          <div class="text-[10px] text-muted font-mono truncate">
                            {{ demoContainerExpanded() ? 'Corredor Logístico Sur' : 'En Tránsito • 84 km/h' }}
                          </div>
                        </div>
                      </div>

                      <span
                        [class]="demoContainerExpanded() ? 'bg-surface-high text-main hover:bg-outline-sub' : 'bg-primary text-on-primary shadow-xs'"
                        class="px-2.5 py-1 shrink-0 rounded-full text-[10px] font-bold transition-colors">
                        {{ demoContainerExpanded() ? 'Cerrar' : 'Expandir' }}
                      </span>
                    </div>

                    <!-- CONTENIDO SECUNDARIO CON FADE ASIMÉTRICO M3 (SIN HUECOS VACÍOS) -->
                    <div
                      class="mt-3.5 space-y-2.5 transition-opacity"
                      [style.transition-duration]="demoContainerExpanded() ? 'var(--md-sys-motion-duration-medium2)' : 'var(--md-sys-motion-duration-short2)'"
                      [style.transition-delay]="demoContainerExpanded() ? '80ms' : '0ms'"
                      [class]="demoContainerExpanded() ? 'opacity-100' : 'opacity-0 pointer-events-none'">
                      <div class="grid grid-cols-3 gap-2 text-center">
                        <div class="p-2 rounded-m3-md bg-surface border border-outline-sub">
                          <div class="text-[10px] text-muted uppercase font-bold">Batería</div>
                          <div class="text-xs font-mono font-bold text-primary">94%</div>
                        </div>
                        <div class="p-2 rounded-m3-md bg-surface border border-outline-sub">
                          <div class="text-[10px] text-muted uppercase font-bold">Presión</div>
                          <div class="text-xs font-mono font-bold text-main">32.4 PSI</div>
                        </div>
                        <div class="p-2 rounded-m3-md bg-surface border border-outline-sub">
                          <div class="text-[10px] text-muted uppercase font-bold">Carga</div>
                          <div class="text-xs font-mono font-bold text-tertiary">1,420 kg</div>
                        </div>
                      </div>

                      <div class="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-outline-sub/60">
                        <span>Clic en cualquier parte para volver al origen</span>
                        <span class="font-mono text-primary font-bold">500ms abrir / 250ms volver • emphasized</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-[11px] font-mono text-muted flex items-center gap-2">
                  <span class="font-bold text-main">Física activa:</span>
                  <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-bold">
                    {{ demoContainerExpanded()
                      ? 'Expansión En Pantalla (288px → 448px • long2 500ms + emphasized)'
                      : 'Retorno En Pantalla (448px → 288px • medium1 250ms + emphasized)' }}
                  </span>
                </div>
              </div>
            }

            <!-- 2. PLAYGROUND: FORWARD AND BACKWARD -->
            @if (demoActivePattern() === 'forward-backward' || demoActivePattern() === 'shared-axis') {
              <div class="w-full max-w-md space-y-4">
                <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                  <span class="text-xs font-bold text-main flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-sm text-primary">account_tree</span>
                    Nivel Jerárquico: {{ demoHierarchicalView() === 'list' ? 'Nivel 1 (Lista de Auditorías)' : 'Nivel 2 (Detalle Inspección)' }}
                  </span>

                  <div class="flex items-center gap-1.5">
                    <button
                      (click)="navigateToHierarchicalList()"
                      [disabled]="demoHierarchicalView() === 'list'"
                      class="btn-m3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer border border-outline-sub disabled:opacity-40 disabled:cursor-not-allowed">
                      <span class="material-symbols-rounded text-sm">arrow_back</span>
                      <span>Regresar</span>
                    </button>
                    <button
                      (click)="navigateToHierarchicalDetail()"
                      [disabled]="demoHierarchicalView() === 'detail'"
                      class="btn-m3 px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed">
                      <span>Avanzar</span>
                      <span class="material-symbols-rounded text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <!-- PANTALLA JERÁRQUICA ANIMADA -->
                <div class="h-36 bg-surface-high rounded-m3-lg p-4 border border-outline-sub flex items-center justify-center overflow-hidden relative">
                  @for (k of [demoHierarchicalKey()]; track k) {
                    <div
                      class="w-full"
                      [style.animation]="demoHierarchicalDirection() === 'forward'
                        ? 'm3ForwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate) both'
                        : 'm3BackwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate) both'">
                      @if (demoHierarchicalView() === 'list') {
                        <div class="space-y-2">
                          <div class="text-xs font-bold text-main">Auditorías Operativas de Flota (Nivel 1)</div>
                          <div (click)="navigateToHierarchicalDetail()" class="p-2 rounded bg-surface border border-outline-sub flex items-center justify-between cursor-pointer hover:border-primary">
                            <div class="flex items-center gap-2">
                              <span class="material-symbols-rounded text-primary text-sm">verified_user</span>
                              <span class="text-xs font-medium">Unidad TRK-884 • Sensor Presión</span>
                            </div>
                            <span class="material-symbols-rounded text-muted text-sm">chevron_right</span>
                          </div>
                        </div>
                      } @else {
                        <div class="space-y-2">
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-primary">Inspección de Unidad TRK-884 (Nivel 2)</span>
                            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border text-muted">Aprobado</span>
                          </div>
                          <p class="text-xs text-muted leading-tight">
                            Telemetría calibrada con OKLCH y resortes subamortiguados &zeta;=0.9.
                          </p>
                          <div class="text-[10px] font-mono text-muted">Presiona 'Regresar' para probar el retroceso en sentido inverso.</div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                  <span>Dirección activa:</span>
                  <span class="font-bold text-main">
                    {{ demoHierarchicalDirection() === 'forward' ? 'Forward (Slide +36px + Fade In)' : 'Backward (Slide -36px + Fade In)' }}
                  </span>
                </div>
              </div>
            }

            <!-- 3. PLAYGROUND: LATERAL -->
            @if (demoActivePattern() === 'lateral') {
              <div class="w-full max-w-md space-y-4">
                <!-- TABS HOMOGÉNEOS -->
                <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                  <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                    <button
                      (click)="setLateralTab('general')"
                      [class]="demoLateralTab() === 'general' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                      General
                    </button>
                    <button
                      (click)="setLateralTab('telemetry')"
                      [class]="demoLateralTab() === 'telemetry' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                      Telemetría
                    </button>
                    <button
                      (click)="setLateralTab('hardware')"
                      [class]="demoLateralTab() === 'hardware' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                      Hardware
                    </button>
                  </div>
                  <span class="text-[10px] font-mono text-muted font-bold">medium1 (250ms)</span>
                </div>

                <!-- CONTENEDOR LATERAL EN UNÍSONO -->
                <div class="h-32 bg-surface-high rounded-m3-lg p-4 border border-outline-sub flex items-center justify-center overflow-hidden relative">
                  @for (k of [demoLateralCount()]; track k) {
                    <div
                      class="w-full text-center space-y-1.5"
                      style="animation: m3LateralIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard) both;">
                      <div class="text-xs font-bold text-main uppercase tracking-wider">
                        Pestaña Par: {{ demoLateralTab().toUpperCase() }}
                      </div>
                      <p class="text-xs text-muted leading-relaxed">
                        @if (demoLateralTab() === 'general') {
                          Visión panorámica de la unidad. Deslizamiento en unísono estricto sin fade.
                        } @else if (demoLateralTab() === 'telemetry') {
                          Gráficas de velocidad y presión. Mismo plano de jerarquía peer-to-peer.
                        } @else {
                          Módulos de sensorica IoT y controladores integrados en bus CAN.
                        }
                      </p>
                    </div>
                  }
                </div>

                <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                  <span>Mecánica:</span>
                  <span class="font-bold text-main">Slide en Unísono (Sin Fade ni Parallax)</span>
                </div>
              </div>
            }

            <!-- 4. PLAYGROUND: TOP LEVEL (FADE THROUGH) -->
            @if (demoActivePattern() === 'top-level' || demoActivePattern() === 'fade-through') {
              <div class="w-full max-w-md space-y-4">
                <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                  <span class="text-xs font-bold text-main">Barra de Navegación Principal</span>
                  <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                    <button
                      (click)="setTopLevelDest('dashboard')"
                      [class]="demoTopLevelDest() === 'dashboard' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-2.5 py-1 rounded-full text-xs cursor-pointer">
                      Dashboard
                    </button>
                    <button
                      (click)="setTopLevelDest('fleet')"
                      [class]="demoTopLevelDest() === 'fleet' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-2.5 py-1 rounded-full text-xs cursor-pointer">
                      Flotas
                    </button>
                    <button
                      (click)="setTopLevelDest('settings')"
                      [class]="demoTopLevelDest() === 'settings' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-2.5 py-1 rounded-full text-xs cursor-pointer">
                      Ajustes
                    </button>
                  </div>
                </div>

                <!-- CONTENEDOR FADE THROUGH -->
                <div class="h-32 bg-surface-high rounded-m3-lg p-4 border border-outline-sub flex items-center justify-center overflow-hidden relative">
                  @for (k of [demoTopLevelCount()]; track k) {
                    <div
                      class="text-center space-y-1 w-full"
                      style="animation: m3FadeThroughIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard) both;">
                      <div class="text-sm font-bold text-main flex items-center justify-center gap-1.5">
                        <span class="material-symbols-rounded text-primary text-base">
                          {{ demoTopLevelDest() === 'dashboard' ? 'dashboard' : (demoTopLevelDest() === 'fleet' ? 'commute' : 'settings') }}
                        </span>
                        <span>Módulo: {{ demoTopLevelDest() === 'dashboard' ? 'Dashboard' : (demoTopLevelDest() === 'fleet' ? 'Flotas' : 'Ajustes') }}</span>
                      </div>
                      <p class="text-xs text-muted max-w-xs mx-auto">
                        Transición desacoplada. Fade-out rápido del módulo saliente y fade-in con escalado sutil 92% &rarr; 100% del nuevo.
                      </p>
                    </div>
                  }
                </div>

                <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                  <span>M3 Rule:</span>
                  <span class="font-bold text-main">Sin Deslizamiento Espacial (Evita Falso Swipe)</span>
                </div>
              </div>
            }

            <!-- 5. PLAYGROUND: ENTER AND EXIT -->
            @if (demoActivePattern() === 'enter-exit' || demoActivePattern() === 'fade') {
              <div class="w-full max-w-md space-y-4">
                <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                  <span class="text-xs font-bold text-main">Disparadores Direccionales</span>
                  <div class="flex items-center gap-2">
                    <button
                      (click)="toggleEnterExitMenu()"
                      class="btn-m3 px-2.5 py-1 rounded-full bg-surface-high hover:bg-surface-box border border-outline-sub text-xs font-bold text-main flex items-center gap-1 cursor-pointer">
                      <span class="material-symbols-rounded text-sm">menu_open</span>
                      <span>{{ demoEnterExitMenuOpen() ? 'Cerrar Menú' : 'Menú Superior' }}</span>
                    </button>
                    <button
                      (click)="toggleEnterExitSnackbar()"
                      class="btn-m3 px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs">
                      <span class="material-symbols-rounded text-sm">vertical_align_top</span>
                      <span>{{ demoEnterExitSnackbarOpen() ? 'Ocultar Sheet' : 'Bottom Sheet' }}</span>
                    </button>
                  </div>
                </div>

                <!-- CONTENEDOR ENTER & EXIT -->
                <div class="h-36 bg-surface-high rounded-m3-lg p-3 border border-outline-sub flex flex-col justify-between overflow-hidden relative">
                  <!-- MENÚ SUPERIOR (EXPANDE HACIA ABAJO) -->
                  <div class="h-14 flex items-start justify-center">
                    @if (demoEnterExitMenuOpen()) {
                      <div
                        class="px-3 py-1.5 rounded-m3-md bg-surface-box border border-primary text-main text-xs font-semibold shadow-md flex items-center gap-2"
                        style="animation: m3EnterFromTop var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate) both;">
                        <span class="material-symbols-rounded text-primary text-sm">tune</span>
                        <span>Menú desplegado desde el borde superior</span>
                      </div>
                    } @else {
                      <span class="text-[10px] text-muted font-mono">Borde Superior (Haz clic en 'Menú Superior')</span>
                    }
                  </div>

                  <!-- BOTTOM SHEET / SNACKBAR (EMERGE HACIA ARRIBA) -->
                  <div class="h-14 flex items-end justify-center">
                    @if (demoEnterExitSnackbarOpen()) {
                      <div
                        class="px-3 py-1.5 rounded-m3-md bg-primary text-on-primary text-xs font-semibold shadow-md flex items-center gap-2"
                        style="animation: m3EnterFromBottom var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate) both;">
                        <span class="material-symbols-rounded text-sm">check_circle</span>
                        <span>Bottom Sheet emergiendo desde la base</span>
                      </div>
                    } @else {
                      <span class="text-[10px] text-muted font-mono">Borde Inferior (Haz clic en 'Bottom Sheet')</span>
                    }
                  </div>
                </div>

                <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                  <span>Modelo Espacial:</span>
                  <span class="font-bold text-main">Expansión guiada desde los bordes físicos</span>
                </div>
              </div>
            }

            <!-- 6. PLAYGROUND: SKELETON LOADERS -->
            @if (demoActivePattern() === 'skeleton') {
              <div class="w-full max-w-md space-y-4">
                <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                  <span class="text-xs font-bold text-main flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-sm text-primary">hourglass_bottom</span>
                    Estabilización sin Jump-Cuts
                  </span>
                  <button
                    (click)="triggerSkeletonSim()"
                    [disabled]="demoSkeletonSimulated()"
                    class="btn-m3 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-40">
                    <span class="material-symbols-rounded text-sm">autorenew</span>
                    <span>Simular Carga de Red (2s)</span>
                  </button>
                </div>

                <!-- TARJETA SKELETON VS FINAL DATA -->
                <div class="h-36 bg-surface rounded-m3-lg p-3.5 border border-outline-sub flex flex-col justify-between overflow-hidden relative shadow-xs">
                  @if (demoSkeletonSimulated()) {
                    <!-- ESTADO SKELETON (ESTRUCTURA IDÉNTICA PARA CERO DESPLAZAMIENTO) -->
                    <div class="space-y-2.5 animate-pulse">
                      <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-full m3-skeleton m3-skeleton-circle m3-skeleton-shimmer shrink-0"></div>
                        <div class="space-y-1.5 flex-1">
                          <div class="h-3.5 w-3/5 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                          <div class="h-2.5 w-2/5 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                        </div>
                      </div>
                      <div class="h-2.5 w-full m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                      <div class="h-2.5 w-4/5 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                    </div>
                  } @else {
                    <!-- ESTADO FINAL CON DATOS (FADE IN SUAVE SOBRE EL ESQUELETO) -->
                    <div class="space-y-2.5" style="animation: m3FadeIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate) both;">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                          <span class="w-9 h-9 rounded-full bg-primary text-on-primary grid place-items-center shadow-xs">
                            <span class="material-symbols-rounded text-base">analytics</span>
                          </span>
                          <div>
                            <h5 class="text-xs font-bold text-main">Diagnóstico Motor • TRK-884</h5>
                            <div class="text-[10px] text-muted font-mono">100% Nominal • Cero Fricción</div>
                          </div>
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[9px] font-bold">Activo</span>
                      </div>
                      <p class="text-xs text-muted leading-tight">
                        El layout se mantuvo 100% estable durante la transición de carga, sin salto de píxeles ni popping de elementos.
                      </p>
                    </div>
                  }

                  <div class="text-[10px] font-mono text-muted flex items-center justify-between pt-1 border-t border-outline-sub">
                    <span>Estado: {{ demoSkeletonSimulated() ? 'Cargando datos con shimmer...' : 'Datos renderizados con fade-in' }}</span>
                    <span class="text-primary font-bold">CLS = 0.00</span>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>

        <!-- M3 APPLYING TRANSITIONS: LOS 8 PRINCIPIOS DE CALIDAD DE GOOGLE -->
        <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-primary text-base">verified</span>
              <h4 class="text-xs font-bold text-main uppercase tracking-wider">
                Applying Transitions • Los 8 Principios de Calidad de Google
              </h4>
            </div>
            <span class="text-[10px] font-mono text-muted">m3.material.io/styles/motion/transitions/applying-transitions</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">1. Accesibilidad Universal</span>
              <p class="text-[11px] text-muted leading-tight">
                Respeta <code class="font-mono text-primary">prefers-reduced-motion</code>: reemplaza traslaciones por desvanecimientos sutiles sin efectos decorativos.
              </p>
            </div>
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">2. Consistencia Sistémica</span>
              <p class="text-[11px] text-muted leading-tight">
                Mismo tipo de transición para la misma acción en toda la app. Aumenta la previsibilidad operativa.
              </p>
            </div>
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">3. Layouts Estables (Skeletons)</span>
              <p class="text-[11px] text-muted leading-tight">
                Fija las dimensiones físicas antes de que carguen los datos para evitar empujar elementos en pantalla.
              </p>
            </div>
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">4. Cero Jump-Cuts</span>
              <p class="text-[11px] text-muted leading-tight">
                Evita cortes secos e instantáneos salvo en herramientas de pura velocidad donde el usuario sea experto.
              </p>
            </div>
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">5. Modelo Espacial Coherente</span>
              <p class="text-[11px] text-muted leading-tight">
                Los elementos emergen desde su origen físico real: drawers desde los laterales, sheets desde abajo.
              </p>
            </div>
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">6. Dirección Unificada</span>
              <p class="text-[11px] text-muted leading-tight">
                Los elementos secundarios se agrupan y viajan a lo largo del mismo eje de movimiento.
              </p>
            </div>
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">7. Clean Fades (Sin Cross-Fade)</span>
              <p class="text-[11px] text-muted leading-tight">
                Desvanece por completo el contenido saliente antes de entrar el nuevo para evitar capas semitransparentes sucias.
              </p>
            </div>
            <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
              <span class="font-bold text-main text-[11px] block">8. Estilo Sobrio</span>
              <p class="text-[11px] text-muted leading-tight">
                La navegación frecuente debe ser ágil y sobria, sin resortes elásticos exagerados que causen fatiga.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- PILAR 4: ESCALA CANÓNICA DE EASING Y DURACIÓN M3 -->
      <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-7">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">timer</span>
              Pilar 4 • Tokens Canónicos de Easing &amp; Duración M3
            </div>
            <h3 class="text-title-md font-bold text-main">Laboratorio Oficial de Easing y Escala de 16 Tiempos</h3>
            <p class="text-xs text-muted leading-relaxed mt-0.5">
              Material Design 3 establece que <strong>la duración nunca se elige de forma aislada</strong>: la dirección y el contexto dictan si el elemento entra desacelerando, sale acelerando o se transforma en pantalla.
            </p>
          </div>

          <!-- SELECTOR DE CONJUNTO OFICIAL (EMPHASIZED VS STANDARD) -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
              <button
                (click)="setTheaterSet('emphasized')"
                [class]="demoTheaterSet() === 'emphasized' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                Emphasized Set
              </button>
              <button
                (click)="setTheaterSet('standard')"
                [class]="demoTheaterSet() === 'standard' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                Standard Set
              </button>
            </div>

            <button
              (click)="triggerTheater()"
              class="btn-m3 px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
              <span class="material-symbols-rounded text-sm">play_arrow</span>
              <span>Disparar Teatro</span>
            </button>
          </div>
        </div>

        <!-- TEATRO VISUAL DE MOVIMIENTO (RÉPLICA EXACTA DE LA DOCUMENTACIÓN OFICIAL DE GOOGLE) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-xs font-bold text-main uppercase tracking-wider">{{ motionTheaterSpecs().title }}</h4>
              <p class="text-[11px] text-muted">{{ motionTheaterSpecs().description }}</p>
            </div>
            <span class="text-[10px] font-mono text-muted">Clic en cualquier tarjeta para probar individualmente</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (c of motionTheaterSpecs().cards; track c.id) {
              <div
                (click)="setEasing(c.id); triggerTheater()"
                class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3 flex flex-col justify-between hover:border-primary/50 transition-all cursor-pointer shadow-xs select-none">

                <!-- ENCABEZADO DE TARJETA -->
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [class]="c.animationType === 'decelerate'
                      ? 'bg-primary-box text-on-primary-box'
                      : (c.animationType === 'accelerate' ? 'bg-surface-high text-main font-bold border border-outline-sub' : 'bg-primary/10 text-primary')">
                    {{ c.role }}
                  </span>
                  <span class="text-[10px] font-mono text-muted">{{ c.durationToken }}</span>
                </div>

                <!-- VISOR GRÁFICO SVG + PISTA VERTICAL (MODELO GOOGLE M3) -->
                <div class="h-32 bg-surface-high/60 rounded-m3-md p-3 border border-outline-sub flex items-center justify-between overflow-hidden relative">
                  <!-- GRÁFICA VECTORIAL DE LA CURVA -->
                  <div class="w-3/4 h-full flex flex-col justify-between">
                    <svg class="w-full h-24 overflow-visible" viewBox="0 0 140 90">
                      <path [attr.d]="c.svgArea" class="fill-primary/15" />
                      <path [attr.d]="c.svgCurve" fill="none" stroke="currentColor" class="text-primary" stroke-width="3" stroke-linecap="round" />
                    </svg>
                    <div class="flex items-center justify-between text-[9px] font-mono text-muted pt-1">
                      <span>0s (Inicio)</span>
                      <span>Tiempo &rarr;</span>
                      <span>100% (Meta)</span>
                    </div>
                  </div>

                  <!-- CANAL VERTICAL CON EL PUCK EN MOVIMIENTO -->
                  <div class="w-10 h-full bg-surface rounded-full border border-outline-sub p-1 flex justify-center relative overflow-hidden">
                    @for (play of [demoTheaterPlayCount()]; track play) {
                      <div
                        class="w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center font-bold text-xs shadow-md absolute"
                        [style.animation]="c.animName + ' ' + c.durationMs + 'ms ' + c.css + ' both'">
                        <span class="material-symbols-rounded text-sm">
                          {{ c.animationType === 'decelerate' ? 'north' : (c.animationType === 'accelerate' ? 'south' : 'swap_vert') }}
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <!-- TÍTULO Y RAZÓN ARQUITECTÓNICA (POR QUÉ Y CUÁNDO) -->
                <div class="space-y-2 text-xs">
                  <div>
                    <h5 class="text-xs font-bold text-main">{{ c.title }}</h5>
                    <p class="text-[11px] text-muted leading-relaxed mt-0.5">{{ c.why }}</p>
                  </div>

                  <div class="p-2 rounded-m3-md bg-surface-high text-[10px] space-y-1 border border-outline-sub/60">
                    <div><strong class="text-main">¿Cuándo usarlo?:</strong> <span class="text-muted">{{ c.when }}</span></div>
                  </div>
                </div>

                <!-- ESPECIFICACIONES TÉCNICAS (CSS & ANDROID) -->
                <div class="pt-2 border-t border-outline-sub text-[10px] font-mono space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-muted">CSS:</span>
                    <span class="text-primary font-bold truncate max-w-[170px]">{{ c.css }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Android:</span>
                    <span class="text-main truncate max-w-[170px]">{{ c.android }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ESCALA DE 16 DURACIONES OFICIALES M3 -->
        <div class="space-y-2.5 pt-2 border-t border-outline-sub">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-xs font-bold text-main uppercase tracking-wider">
                Escala Canónica de 16 Duraciones (50ms — 1000ms)
              </h4>
              <p class="text-[11px] text-muted">Haz clic en un token de tiempo para poner a prueba su velocidad con la curva activa</p>
            </div>
            <div class="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary-box text-on-primary-box">
              Activo: {{ demoSelectedDurationName() }} ({{ demoSelectedDuration() }}ms)
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            @for (d of canonicalDurations; track d.name) {
              <button
                (click)="testDuration(d.name, d.ms)"
                [class]="demoSelectedDurationName() === d.name
                  ? 'border-primary ring-2 ring-primary/30 bg-primary-box/20'
                  : 'border-outline-sub hover:border-outline bg-surface'"
                class="btn-m3 p-2.5 rounded-m3-md border text-left flex flex-col justify-between space-y-1 cursor-pointer transition-all">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-muted">{{ d.category }}</span>
                  <span class="text-xs font-mono font-bold text-primary">{{ d.ms }}ms</span>
                </div>
                <div class="font-mono text-xs font-bold text-main truncate">{{ d.name }}</div>
                <div class="text-[10px] text-muted truncate leading-tight">{{ d.usage }}</div>
              </button>
            }
          </div>
        </div>

        <!-- PISTA DE TELEMETRÍA CINÉTICA EN VIVO -->
        <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-main flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary">speed</span>
                Pista de Velocidad: {{ demoSelectedDurationName() }} ({{ demoSelectedDuration() }}ms) + {{ activeEasingSpec().label }}
              </span>
            </div>

            <button
              (click)="testDuration(demoSelectedDurationName(), demoSelectedDuration())"
              class="btn-m3 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1">
              <span class="material-symbols-rounded text-sm">replay</span>
              <span>Re-disparar Pista</span>
            </button>
          </div>

          <!-- PISTA DE CARRERA DUAL (BARRA + PUCK FÍSICO) -->
          <div class="space-y-2">
            <!-- BARRA DE RELLENO -->
            <div class="h-3 w-full bg-surface-high rounded-full overflow-hidden relative border border-outline-sub p-0.5">
              @for (run of [demoDurationRunId()]; track run) {
                <div
                  class="h-full bg-primary rounded-full shadow-xs"
                  [style.animation]="'m3DurationTrack ' + demoSelectedDuration() + 'ms ' + activeEasingSpec().curve + ' forwards'">
                </div>
              }
            </div>

            <!-- PUCK CINÉTICO -->
            <div class="h-8 w-full bg-surface-high/40 rounded-m3-md relative overflow-hidden border border-outline-sub flex items-center px-1">
              @for (run of [demoDurationRunId()]; track run) {
                <div
                  class="absolute w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center shadow-md select-none"
                  [style.animation]="'m3PuckMove ' + demoSelectedDuration() + 'ms ' + activeEasingSpec().curve + ' forwards'">
                  <span class="material-symbols-rounded text-sm">arrow_forward</span>
                </div>
              }
            </div>
          </div>

          <!-- EVALUACIÓN DE MARIDAJE M3 -->
          <div class="pt-2 border-t border-outline-sub flex items-center justify-between text-[11px] flex-wrap gap-2">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm"
                [class.text-primary]="easingDurationPairingStatus().valid"
                [class.text-muted]="!easingDurationPairingStatus().valid">
                {{ easingDurationPairingStatus().valid ? 'verified' : 'lightbulb' }}
              </span>
              <span class="font-semibold text-main">{{ easingDurationPairingStatus().text }}</span>
            </div>
            <div class="font-mono text-[10px] text-muted">
              CSS: transition: all var({{ activeEasingSpec().cssVar }}) var(--md-sys-motion-duration-{{ demoSelectedDurationName() }});
            </div>
          </div>
        </div>

        <!-- 4 CASOS CANÓNICOS OFICIALES GOOGLE M3 (SHORT, MEDIUM, LONG, EXTRA LONG) -->
        <div class="space-y-3 pt-4 border-t border-outline-sub">
          <div>
            <span class="text-xs font-semibold text-primary uppercase tracking-wider block">
              Material 3 Motion Specs • 4 Casos Canónicos Oficiales
            </span>
            <p class="text-[11px] text-muted mt-0.5">
              Google prescribe 4 arquetipos esenciales de escala y momentum. Haz clic en cada ejemplo para interactuar con la animación en vivo:
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- CASO 1: SHORT (200ms) - SELECTION CONTROLS -->
            <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                    1. Short (200ms)
                  </span>
                  <span class="text-[10px] font-mono text-primary font-bold">Standard</span>
                </div>
                <h5 class="text-xs font-bold text-main pt-1">Selection Controls</h5>
                <p class="text-[11px] text-muted leading-relaxed">
                  "Selection controls have a short duration of 200ms with Standard easing."
                </p>
              </div>

              <!-- DEMO INTERACTIVA SWITCH M3 -->
              <div class="h-24 bg-surface-high/60 rounded-m3-md p-3 border border-outline-sub grid place-items-center">
                <button
                  (click)="toggleCanonicalSelection()"
                  class="w-14 h-8 rounded-full p-1 cursor-pointer transition-colors relative flex items-center border"
                  [class]="demoCanonicalSelection() ? 'bg-primary border-primary justify-end' : 'bg-surface-high border-outline justify-start'"
                  style="transition-duration: var(--md-sys-motion-duration-short4); transition-timing-function: var(--md-sys-motion-easing-standard);">
                  <div
                    class="w-6 h-6 rounded-full shadow-sm flex items-center justify-center transition-all"
                    [class]="demoCanonicalSelection() ? 'bg-on-primary text-primary scale-100' : 'bg-outline text-surface scale-85'"
                    style="transition-duration: var(--md-sys-motion-duration-short4); transition-timing-function: var(--md-sys-motion-easing-standard);">
                    <span class="material-symbols-rounded text-xs font-bold">
                      {{ demoCanonicalSelection() ? 'check' : 'close' }}
                    </span>
                  </div>
                </button>
              </div>

              <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                <div class="truncate"><strong class="text-main">Token:</strong> short4 (200ms)</div>
                <div class="truncate"><strong class="text-main">Easing:</strong> standard</div>
              </div>
            </div>

            <!-- CASO 2: MEDIUM (400ms) - FAB TO SHEET -->
            <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                    2. Medium (400ms)
                  </span>
                  <span class="text-[10px] font-mono text-primary font-bold">Emphasized</span>
                </div>
                <h5 class="text-xs font-bold text-main pt-1">FAB Expanding into Sheet</h5>
                <p class="text-[11px] text-muted leading-relaxed">
                  "A FAB expanding into a Sheet uses a 400ms duration with Emphasized easing."
                </p>
              </div>

              <!-- DEMO INTERACTIVA FAB MORPHING -->
              <div class="h-24 bg-surface-high/60 rounded-m3-md p-2 border border-outline-sub grid place-items-center overflow-hidden">
                <div
                  (click)="toggleCanonicalFabSheet()"
                  class="cursor-pointer overflow-hidden shadow-md flex items-center justify-center transition-all"
                  [class]="demoCanonicalFabSheet()
                    ? 'w-full h-16 rounded-m3-md bg-surface-box border border-primary/40 px-3 py-1'
                    : 'w-10 h-10 rounded-full bg-primary text-on-primary'"
                  style="transition-duration: var(--md-sys-motion-duration-medium4); transition-timing-function: var(--md-sys-motion-easing-emphasized);">
                  @if (demoCanonicalFabSheet()) {
                    <div class="w-full flex items-center justify-between text-xs">
                      <div class="flex items-center gap-1.5 truncate">
                        <span class="material-symbols-rounded text-primary text-sm">tune</span>
                        <span class="font-bold text-main text-[11px] truncate">Sheet de Acciones</span>
                      </div>
                      <span class="material-symbols-rounded text-muted text-xs hover:text-main">close</span>
                    </div>
                  } @else {
                    <span class="material-symbols-rounded text-base">add</span>
                  }
                </div>
              </div>

              <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                <div class="truncate"><strong class="text-main">Token:</strong> medium4 (400ms)</div>
                <div class="truncate"><strong class="text-main">Easing:</strong> emphasized</div>
              </div>
            </div>

            <!-- CASO 3: LONG (500ms / 250ms) - CARD TO FULL SCREEN -->
            <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                    3. Long (500ms / 250ms)
                  </span>
                  <span class="text-[10px] font-mono text-primary font-bold">Emphasized</span>
                </div>
                <h5 class="text-xs font-bold text-main pt-1">Card Expanding to Full Screen</h5>
                <p class="text-[11px] text-muted leading-relaxed">
                  Inicia y termina en pantalla: <strong>500ms</strong> (long2) al expandir y <strong>250ms</strong> (medium1) al regresar con <strong>Emphasized</strong>.
                </p>
              </div>

              <!-- DEMO INTERACTIVA CARD TRANSFORM -->
              <div class="h-24 bg-surface-high/60 rounded-m3-md p-2 border border-outline-sub grid place-items-center overflow-hidden">
                <div
                  (click)="toggleCanonicalCardExpanded()"
                  class="cursor-pointer overflow-hidden border shadow-sm max-w-full transition-all"
                  [class]="demoCanonicalCardExpanded()
                    ? 'w-56 h-20 rounded-m3-md bg-surface border-primary p-2'
                    : 'w-24 h-12 rounded-m3-sm bg-surface-box border-outline-sub p-1.5'"
                  [style.transition-duration]="demoCanonicalCardExpanded() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                  style="transition-timing-function: var(--md-sys-motion-easing-emphasized);">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-primary text-xs">dashboard</span>
                    <span class="font-bold text-main text-[10px] truncate">
                      {{ demoCanonicalCardExpanded() ? 'Vista Detallada' : 'Bento Card' }}
                    </span>
                  </div>
                  @if (demoCanonicalCardExpanded()) {
                    <p class="text-[9px] text-muted mt-1 leading-tight">
                      Abrir 500ms &harr; Volver 250ms (Emphasized).
                    </p>
                  }
                </div>
              </div>

              <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                <div class="truncate"><strong class="text-main">Token:</strong> long2 (500ms) / medium1 (250ms)</div>
                <div class="truncate"><strong class="text-main">Easing:</strong> emphasized</div>
              </div>
            </div>

            <!-- CASO 4: EXTRA LONG (1000ms) - AMBIENT CAROUSEL -->
            <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                    4. Extra Long (1000ms)
                  </span>
                  <span class="text-[10px] font-mono text-primary font-bold">Emphasized</span>
                </div>
                <h5 class="text-xs font-bold text-main pt-1">Ambient Carousel Slide</h5>
                <p class="text-[11px] text-muted leading-relaxed">
                  "An ambient carousel auto-advance uses an extra long 1000ms duration with emphasized easing."
                </p>
              </div>

              <!-- DEMO INTERACTIVA CAROUSEL SLIDE -->
              <div class="h-24 bg-surface-high/60 rounded-m3-md p-2 border border-outline-sub flex flex-col justify-between overflow-hidden">
                <div class="h-10 w-full overflow-hidden relative rounded-m3-xs border border-outline-sub/60 bg-surface">
                  <div
                    class="h-full flex transition-transform"
                    [style.transform]="'translateX(-' + (demoCanonicalCarouselIndex() * 100) + '%)'"
                    style="transition-duration: var(--md-sys-motion-duration-extra-long4); transition-timing-function: var(--md-sys-motion-easing-emphasized);">
                    <div class="min-w-full h-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      Slide 1: Ambient A
                    </div>
                    <div class="min-w-full h-full bg-secondary/10 flex items-center justify-center text-[10px] font-bold text-secondary">
                      Slide 2: Ambient B
                    </div>
                    <div class="min-w-full h-full bg-tertiary/10 flex items-center justify-center text-[10px] font-bold text-tertiary">
                      Slide 3: Ambient C
                    </div>
                  </div>
                </div>

                <button
                  (click)="nextCanonicalCarousel()"
                  class="btn-m3 w-full py-1 text-[10px] font-bold rounded-full bg-surface-box hover:bg-surface-high border border-outline-sub text-main flex items-center justify-center gap-1 cursor-pointer">
                  <span class="material-symbols-rounded text-xs">play_arrow</span>
                  <span>Avanzar Slide (1000ms)</span>
                </button>
              </div>

              <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                <div class="truncate"><strong class="text-main">Token:</strong> extra-long4 (1000ms)</div>
                <div class="truncate"><strong class="text-main">Easing:</strong> emphasized</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CARPETAS DE TOKENS OFICIALES -->
        <div class="space-y-4 pt-4 border-t border-outline-sub">
          <!-- CARPETA 1: EASING TOKENS (10 TOKENS) -->
          <div class="rounded-m3-lg bg-surface border border-outline-sub overflow-hidden shadow-xs">
            <button
              (click)="toggleEasingFolder()"
              class="w-full p-4 flex items-center justify-between hover:bg-surface-high/40 transition-colors cursor-pointer text-left">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-primary text-base">folder_open</span>
                <span class="font-bold text-main text-xs uppercase tracking-wider">Easing Tokens (10 Curvas Oficiales M3)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-muted">Emphasized • Standard • Legacy • Linear</span>
                <span class="material-symbols-rounded text-muted text-sm transition-transform" [class.rotate-180]="demoEasingFolderOpen()">
                  expand_more
                </span>
              </div>
            </button>

            @if (demoEasingFolderOpen()) {
              <div class="p-4 pt-0 border-t border-outline-sub/60 space-y-3">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
                  @for (e of canonicalEasings; track e.name) {
                    <div
                      (click)="setEasing(e.name)"
                      [class]="demoSelectedEasing() === e.name ? 'border-primary ring-2 ring-primary/30 bg-primary-box/15' : 'border-outline-sub hover:border-outline bg-surface-box'"
                      class="p-2.5 rounded-m3-md border flex flex-col justify-between space-y-2 cursor-pointer transition-all">
                      <!-- GRÁFICA VECTORIAL MINIATURA -->
                      <div class="h-16 w-full bg-surface-high/60 rounded-m3-xs relative overflow-hidden flex items-center justify-center p-1">
                        <svg class="w-full h-full overflow-visible" viewBox="0 0 100 70">
                          <path [attr.d]="e.svgArea" class="fill-primary/20" />
                          <path [attr.d]="e.svgCurve" fill="none" stroke="currentColor" class="text-primary" stroke-width="2.5" stroke-linecap="round" />
                          <circle cx="85" cy="15" r="4" class="fill-primary" />
                        </svg>
                      </div>
                      <div>
                        <div class="font-bold text-[11px] text-main truncate">{{ e.label }}</div>
                        <div class="text-[9px] font-mono text-muted truncate">{{ e.token }}</div>
                      </div>
                    </div>
                  }
                </div>

                <!-- TABLA MULTIPLATAFORMA DEL TOKEN SELECCIONADO -->
                <div class="mt-3 p-3 rounded-m3-md bg-surface-high/40 border border-outline-sub text-[11px] space-y-2">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-main">Especificación Multiplataforma:</span>
                      <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-mono font-bold text-[10px]">
                        {{ activeEasingSpec().label }}
                      </span>
                    </div>
                    <span class="text-[10px] font-mono text-muted">{{ activeEasingSpec().token }}</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] font-mono pt-1">
                    <div class="p-2 rounded bg-surface border border-outline-sub/60">
                      <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">Android</span>
                      <span class="text-main truncate block mt-0.5">{{ activeEasingSpec().android }}</span>
                    </div>
                    <div class="p-2 rounded bg-surface border border-outline-sub/60">
                      <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">CSS Web</span>
                      <span class="text-primary font-bold truncate block mt-0.5">{{ activeEasingSpec().curve }}</span>
                    </div>
                    <div class="p-2 rounded bg-surface border border-outline-sub/60">
                      <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">Flutter</span>
                      <span class="text-main truncate block mt-0.5">{{ activeEasingSpec().flutter }}</span>
                    </div>
                    <div class="p-2 rounded bg-surface border border-outline-sub/60">
                      <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">iOS</span>
                      <span class="text-main truncate block mt-0.5">{{ activeEasingSpec().ios }}</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- PLAYBOOK MAESTRO: CÓMO, DÓNDE, PARA QUÉ, POR QUÉ Y EL TRUCO REAL -->
      <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">architecture</span>
              Playbook de Ejecución • Guía Maestra para Proyectos Reales
            </div>
            <h3 class="text-title-md font-bold text-main">El Truco Real: Cómo, Dónde, Para Qué y Por Qué Aplicar Motion M3</h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed mt-0.5">
              Google provee la especificación conceptual en m3.material.io (marcando incluso <code class="font-mono text-primary">CSS: N/A</code> en curvas compuestas). Este motor traduce esos conceptos en 3 reglas operativas y 2 leyes de CSS para construir sistemas como POS, Clínica o Inventario sin fallas visuales.
            </p>
          </div>
          <span class="px-3 py-1 rounded-full bg-primary-box text-on-primary-box text-[11px] font-bold font-mono shrink-0">
            Regla de los 3 Filtros
          </span>
        </div>

        <!-- LOS 3 FILTROS DE DECISIÓN ARQUITECTÓNICA -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- FILTRO 1: DÓNDE Y POR QUÉ (CSS VS VIEW TRANSITIONS) -->
          <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-2.5 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                  Filtro 1 • Ciclo de Vida del DOM
                </span>
                <span class="material-symbols-rounded text-primary text-base">account_tree</span>
              </div>
              <h4 class="text-xs font-bold text-main">¿Dónde usar CSS Transitions vs. View Transitions API?</h4>
              <div class="text-[11px] text-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong class="text-main">CSS Transitions (Mismo componente):</strong> Cuando el nodo permanece vivo en el árbol DOM (expandir una card, FAB &rarr; barra, acordeón). <span class="text-primary font-semibold">Por qué:</span> Interpola en GPU de forma sincrónica sin capturar snapshots.
                </p>
                <p>
                  <strong class="text-main">View Transitions API (Ruptura DOM):</strong> En cambios de ruta o modales en overlay global donde el origen se destruye. <span class="text-primary font-semibold">Por qué:</span> Único mecanismo nativo que conecta elementos que no coexisten mediante <code class="font-mono text-main">view-transition-name</code>.
                </p>
              </div>
            </div>
            <div class="pt-2 border-t border-outline-sub text-[10px] font-mono text-muted">
              Regla: Mismo DOM &rarr; CSS • Distinto DOM &rarr; ViewTransition
            </div>
          </div>

          <!-- FILTRO 2: PARA QUÉ (SPATIAL VS EFFECTS) -->
          <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-2.5 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                  Filtro 2 • Física de Propiedades
                </span>
                <span class="material-symbols-rounded text-primary text-base">all_inclusive</span>
              </div>
              <h4 class="text-xs font-bold text-main">¿Para qué elegir Spatial vs. Effects?</h4>
              <div class="text-[11px] text-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong class="text-main">Spatial (&zeta; = 0.9, Subamortiguado):</strong> Para mover geometría (posición, ancho, alto, escala). Usa <code class="font-mono text-primary">Expressive</code> en momentos focales (modales, hero cards) y <code class="font-mono text-main">Standard</code> (+6%) en tablas densas para evitar fatiga visual.
                </p>
                <p>
                  <strong class="text-main">Effects (&zeta; = 1.0, Crítico):</strong> Para cambios ópticos (color, opacidad, sombras, bordes). <span class="text-primary font-semibold">Por qué:</span> Cero rebote; oscilar la luminosidad provoca parpadeo y cansancio ocular.
                </p>
              </div>
            </div>
            <div class="pt-2 border-t border-outline-sub text-[10px] font-mono text-muted">
              Regla: Tamaño/Lugar &rarr; Spatial • Color/Luz &rarr; Effects
            </div>
          </div>

          <!-- FILTRO 3: CÓMO CABLEARLO (CERO NÚMEROS MÁGICOS) -->
          <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-2.5 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                  Filtro 3 • Arquitectura de Tokens
                </span>
                <span class="material-symbols-rounded text-primary text-base">css</span>
              </div>
              <h4 class="text-xs font-bold text-main">¿Cómo usarlo en el día a día sin deuda técnica?</h4>
              <div class="text-[11px] text-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong class="text-main">Prohibidos valores manuales:</strong> Nunca escribas <code class="font-mono text-error">duration-300</code> o <code class="font-mono text-error">ease-out</code> a mano en los módulos de negocio.
                </p>
                <p>
                  <strong class="text-main">Consumo de tokens:</strong> Referencia siempre <code class="font-mono text-primary">var(--md-sys-motion-*)</code> o las clases semánticas <code class="font-mono text-primary">.m3-transition-*</code> desde <code class="font-mono text-main">_motion.css</code>. <span class="text-primary font-semibold">Por qué:</span> Coherencia global y soporte automático de <code class="font-mono">prefers-reduced-motion</code>.
                </p>
              </div>
            </div>
            <div class="pt-2 border-t border-outline-sub text-[10px] font-mono text-muted">
              Archivo maestro: src/styles/_motion.css
            </div>
          </div>
        </div>

        <!-- LAS 2 TRAMPAS SILENCIOSAS DE CSS (CERO GLITCHES) -->
        <div class="p-4 rounded-m3-lg bg-surface-high/60 border border-outline-sub space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-error text-base">warning</span>
              <h4 class="text-xs font-bold text-main uppercase tracking-wider">
                Las 2 Trampas Silenciosas de CSS en Container Transform (Por Qué a Veces Falla la Fluidez)
              </h4>
            </div>
            <span class="text-[10px] font-mono text-primary font-bold">Leyes Cero-Glitches Verificadas</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub space-y-2">
              <div class="font-bold text-main flex items-center justify-between gap-2">
                <span>Trampa 1: Explosión Horizontal (<code class="font-mono text-error">max-width</code>)</span>
                <span class="text-[10px] font-mono text-error font-bold shrink-0">Anti-Patrón</span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                <strong>El error:</strong> Mezclar <code class="font-mono text-main">w-full max-w-md</code> al expandir con <code class="font-mono text-main">w-72</code> al colapsar. Al cerrar, el navegador quita <code class="font-mono">max-width</code> a <code class="font-mono">none</code> en 0ms mientras <code class="font-mono">width</code> aún interpola desde <code class="font-mono">100%</code>.
              </p>
              <div class="p-2 rounded bg-surface-high border border-outline-sub/70 text-[10px] font-mono text-primary">
                Solución: Dejar max-w-full fijo e interpolar anchos explícitos (w-72 &harr; w-[448px]).
              </div>
            </div>

            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub space-y-2">
              <div class="font-bold text-main flex items-center justify-between gap-2">
                <span>Trampa 2: Hueco Fantasma (<code class="font-mono text-error">height: auto</code>)</span>
                <span class="text-[10px] font-mono text-error font-bold shrink-0">Anti-Patrón</span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                <strong>El error:</strong> CSS no interpola <code class="font-mono">height: auto</code>, y desmontar nodos con <code class="font-mono">&#64;if</code> en 0ms deja una caja vacía encogiéndose durante 500ms.
              </p>
              <div class="p-2 rounded bg-surface-high border border-outline-sub/70 text-[10px] font-mono text-primary">
                Solución: grid-rows-[0fr/1fr] o alturas fijas + [attr.inert] + fade asimétrico.
              </div>
            </div>

            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub space-y-2">
              <div class="font-bold text-main flex items-center justify-between gap-2">
                <span>Trampa 3: Ghosting &amp; Colisión en <code class="font-mono text-error">::before</code></span>
                <span class="text-[10px] font-mono text-error font-bold shrink-0">Anti-Patrón</span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                <strong>El error:</strong> Usar <code class="font-mono text-main">::before</code> para auras animadas sobre <code class="font-mono text-main">.card-interactive</code> (colisiona con el state layer <code class="font-mono text-main">currentColor</code>) o capturar <code class="font-mono text-main">#app-stage</code> a mitad de su blur.
              </p>
              <div class="p-2 rounded bg-surface-high border border-outline-sub/70 text-[10px] font-mono text-primary">
                Solución: Usar .m3-aurora-layer (.m3-aurora-orb) aislada + html.vt-running + [class.invisible].
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PILAR 5: ACCESIBILIDAD Y REDUCED MOTION -->
      <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1 max-w-2xl">
          <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
            <span class="material-symbols-rounded text-base text-primary">accessibility_new</span>
            Accesibilidad Universal • WCAG 2.2 SC 2.3.3
          </div>
          <h3 class="text-base font-bold text-main">Respeto por Prefers-Reduced-Motion</h3>
          <p class="text-xs text-muted leading-relaxed">
            Cuando el usuario activa <code class="font-mono text-primary">&#64;media (prefers-reduced-motion: reduce)</code>, las transiciones de vista colapsan a <strong>1ms</strong> y los fondos ambientales continuos como <code class="font-mono text-primary">.m3-aurora-orb</code> pasan a estado estático (<code class="font-mono text-main">animation: none</code>) para garantizar confort vestibular absoluto.
          </p>
        </div>

        <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub text-xs space-y-1 shrink-0 font-mono">
          <div class="text-muted text-[10px] uppercase font-bold tracking-wider">Regla CSS en _motion.css</div>
          <div class="text-main font-bold">&#64;media (prefers-reduced-motion)</div>
          <div class="text-primary text-[11px]">.m3-aurora-orb {{ '{' }} animation: none; {{ '}' }}</div>
        </div>
      </div>
    </div>
  `
})
export class MotionLabComponent {
  readonly demoAsymmetryMode = signal<'disposable' | 'onscreen'>('disposable');
  readonly demoAsymmetryOpen = signal<boolean>(false);
  readonly demoSpringCount = signal<number>(0);
  readonly demoSpringStyle = signal<SpringStyle>('expressive');
  readonly demoSpringSpeed = signal<SpringSpeed>('fast');
  readonly demoContainerExpanded = signal<boolean>(false);
  readonly demoActivePattern = signal<MotionPatternId>('container');

  readonly demoHierarchicalView = signal<'list' | 'detail'>('list');
  readonly demoHierarchicalDirection = signal<'forward' | 'backward'>('forward');
  readonly demoHierarchicalKey = signal<number>(1);
  readonly demoLateralTab = signal<'general' | 'telemetry' | 'hardware'>('general');
  readonly demoLateralCount = signal<number>(1);
  readonly demoTopLevelDest = signal<'dashboard' | 'fleet' | 'settings'>('dashboard');
  readonly demoTopLevelCount = signal<number>(1);
  readonly demoEnterExitMenuOpen = signal<boolean>(false);
  readonly demoEnterExitSnackbarOpen = signal<boolean>(false);
  readonly demoSkeletonSimulated = signal<boolean>(false);

  readonly demoSelectedDurationName = signal<string>('medium4');
  readonly demoSelectedDuration = signal<number>(400);
  readonly demoSelectedEasing = signal<string>('emphasized-decelerate');
  readonly demoDurationRunId = signal<number>(1);
  readonly demoTheaterSet = signal<'emphasized' | 'standard'>('emphasized');
  readonly demoTheaterPlayCount = signal<number>(1);

  readonly demoCanonicalSelection = signal<boolean>(true);
  readonly demoCanonicalFabSheet = signal<boolean>(false);
  readonly demoCanonicalCardExpanded = signal<boolean>(false);
  readonly demoCanonicalCarouselIndex = signal<number>(0);
  readonly demoEasingFolderOpen = signal<boolean>(true);

  readonly canonicalEasings = CANONICAL_EASINGS;
  readonly canonicalDurations = CANONICAL_DURATIONS;

  readonly motionTheaterSpecs = computed(() => MOTION_THEATER_SETS[this.demoTheaterSet()]);

  readonly activeEasingSpec = computed(() => {
    return this.canonicalEasings.find(e => e.name === this.demoSelectedEasing()) ?? this.canonicalEasings[0];
  });

  readonly easingDurationPairingStatus = computed(() => {
    const easing = this.demoSelectedEasing();
    const duration = this.demoSelectedDuration();

    if (easing === 'emphasized-decelerate') {
      return duration === 400 || duration === 500
        ? { valid: true, text: 'Maridaje Canónico Óptimo (M3: Entrada a pantalla con medium4 o long2)' }
        : { valid: false, text: 'M3 recomienda medium4 (400ms) o long2 (500ms) para decelerate' };
    }
    if (easing === 'emphasized-accelerate') {
      return duration === 200 || duration === 150
        ? { valid: true, text: 'Maridaje Canónico Óptimo (M3: Salida rápida con short4 o short3)' }
        : { valid: false, text: 'M3 recomienda short4 (200ms) o short3 (150ms) para accelerate' };
    }
    if (easing === 'emphasized') {
      return duration === 500 || duration === 250 || (duration >= 250 && duration <= 500)
        ? { valid: true, text: 'Maridaje Canónico Óptimo (M3: 500ms abrir o 250ms retorno en pantalla)' }
        : { valid: false, text: 'M3 recomienda long2 (500ms) para abrir o medium1 (250ms) para volver en pantalla' };
    }
    if (easing === 'standard') {
      return duration >= 250 && duration <= 350
        ? { valid: true, text: 'Maridaje Canónico Óptimo (M3: Transición utilitaria en pantalla con 300ms)' }
        : { valid: false, text: 'M3 recomienda medium2 (300ms) para transiciones Standard en pantalla' };
    }
    return { valid: true, text: 'Configuración libre de laboratorio' };
  });

  readonly activeSpringSpecs = computed(() => {
    const style = this.demoSpringStyle();
    const speed = this.demoSpringSpeed();
    const physics = SPRING_PHYSICS_BY_SPEED[speed];
    const webCurves = SPRING_WEB_CURVES[style];

    return {
      style,
      speed,
      spatial: { ...physics.spatial, ...webCurves.spatial[speed] },
      effects: { ...physics.effects, ...webCurves.effects[speed] }
    };
  });

  setAsymmetryMode(mode: 'disposable' | 'onscreen'): void {
    this.demoAsymmetryMode.set(mode);
  }

  toggleAsymmetryDemo(): void {
    this.demoAsymmetryOpen.update(v => !v);
  }

  toggleContainerDemo(): void {
    this.demoContainerExpanded.update(v => !v);
  }

  triggerSpringDemo(): void {
    this.demoSpringCount.update(c => c + 1);
  }

  setSpringSpeed(speed: SpringSpeed): void {
    this.demoSpringSpeed.set(speed);
    this.triggerSpringDemo();
  }

  setSpringStyle(style: SpringStyle): void {
    this.demoSpringStyle.set(style);
    this.triggerSpringDemo();
  }

  setPattern(pattern: MotionPatternId): void {
    this.demoActivePattern.set(pattern);
  }

  navigateToHierarchicalDetail(): void {
    this.demoHierarchicalDirection.set('forward');
    this.demoHierarchicalView.set('detail');
    this.demoHierarchicalKey.update(k => k + 1);
  }

  navigateToHierarchicalList(): void {
    this.demoHierarchicalDirection.set('backward');
    this.demoHierarchicalView.set('list');
    this.demoHierarchicalKey.update(k => k + 1);
  }

  setLateralTab(tab: 'general' | 'telemetry' | 'hardware'): void {
    this.demoLateralTab.set(tab);
    this.demoLateralCount.update(c => c + 1);
  }

  setTopLevelDest(dest: 'dashboard' | 'fleet' | 'settings'): void {
    this.demoTopLevelDest.set(dest);
    this.demoTopLevelCount.update(c => c + 1);
  }

  toggleEnterExitMenu(): void {
    this.demoEnterExitMenuOpen.update(v => !v);
  }

  toggleEnterExitSnackbar(): void {
    this.demoEnterExitSnackbarOpen.update(v => !v);
  }

  triggerSkeletonSim(): void {
    this.demoSkeletonSimulated.set(true);
    setTimeout(() => {
      this.demoSkeletonSimulated.set(false);
    }, 2000);
  }

  testDuration(name: string, ms: number): void {
    this.demoSelectedDurationName.set(name);
    this.demoSelectedDuration.set(ms);
    this.demoDurationRunId.update(id => id + 1);
  }

  setEasing(name: string): void {
    this.demoSelectedEasing.set(name);
    this.demoDurationRunId.update(id => id + 1);
  }

  triggerTheater(): void {
    this.demoTheaterPlayCount.update(c => c + 1);
  }

  setTheaterSet(set: 'emphasized' | 'standard'): void {
    this.demoTheaterSet.set(set);
    this.triggerTheater();
  }

  toggleCanonicalSelection(): void {
    this.demoCanonicalSelection.update(v => !v);
  }

  toggleCanonicalFabSheet(): void {
    this.demoCanonicalFabSheet.update(v => !v);
  }

  toggleCanonicalCardExpanded(): void {
    this.demoCanonicalCardExpanded.update(v => !v);
  }

  nextCanonicalCarousel(): void {
    this.demoCanonicalCarouselIndex.update(i => (i + 1) % 3);
  }

  toggleEasingFolder(): void {
    this.demoEasingFolderOpen.update(v => !v);
  }
}
