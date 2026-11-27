import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { MotionReplayHandle } from './motion-replay.util';
import {
  SPRING_EXPRESSIVE_FAST_SPATIAL_LINEAR,
  SPRING_PHYSICS_BY_SPEED,
  SPRING_WEB_CURVES,
  SpringSpeed,
  SpringStyle
} from './motion-specs.data';

/**
 * Interactive laboratory for M3 Expressive motion fundamentals:
 * Pillar 1 (Perceptual Asymmetry with bounded h/2 corner morphing and zero 9999px dead-zone) and
 * Pillar 2 (Clear architectural & visual comparison of Spatial vs. Effects springs with target markers).
 */
@Component({
  selector: 'app-motion-physics-section',
  standalone: true,
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3CardComponent, M3ChipComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="motion-physics" class="space-y-6">
      <!-- PILAR 1: CÓMO FUNCIONA EL MOVIMIENTO Y ASIMETRÍA PERCEPTUAL -->
      <m3-card variant="outlined" padding="md" customClass="space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">speed</span>
              Pilar 1 • Cómo Funciona (Asimetría Perceptual M3)
            </div>
            <h3 class="text-title-md-emphasized text-main">
              Entradas Generosas, Salidas Ágiles y Morfeo de Esquinas sin Zona Muerta
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              Según <code class="font-mono text-primary">m3.material.io/styles/motion/overview/how-it-works</code>, el ojo asimila mejor lo nuevo si entra frenando suave y despide rápido lo conocido. Además, un panel que <strong>vuelve en pantalla</strong> usa <code class="font-mono text-main">emphasized (500ms → 250ms)</code> y esquinas acotadas (<code class="font-mono text-primary">24px ↔ 16px</code>, jamás <code class="font-mono text-error">9999px</code>).
            </p>
          </div>

          <m3-button-group
            variant="connected"
            selectionMode="single"
            size="sm"
            ariaLabel="Modo de Asimetría Perceptual"
            [options]="asymmetryOptions"
            [value]="[asymmetryMode()]"
            (selectionChange)="onAsymmetrySelection($event)" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Reglas teóricas + Botón Morph Real -->
          <div class="lg:col-span-5 space-y-3">
            <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-3">
              @if (asymmetryMode() === 'disposable') {
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="font-bold text-main text-xs">1. Elemento Descartable (Overlay)</span>
                  <span class="px-2 py-0.5 rounded-m3-full bg-surface-box text-[10px] font-mono text-primary">Modal / Snackbar</span>
                </div>
                <p class="text-xs text-muted leading-relaxed">
                  <strong>Entrada suave, salida veloz:</strong> Entra frenando con <code class="font-mono text-main">emphasized-decelerate</code> (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-medium4', '400ms')">medium4 • 400ms</button>) y desaparece acelerando con <code class="font-mono text-main">emphasized-accelerate</code> (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-short4', '200ms')">short4 • 200ms</button>).
                </p>
              } @else {
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="font-bold text-main text-xs">2. Elemento Persistente En Pantalla</span>
                  <span class="px-2 py-0.5 rounded-m3-full bg-surface-box text-[10px] font-mono text-primary">Card / Sheet</span>
                </div>
                <p class="text-xs text-muted leading-relaxed">
                  <strong>Nunca usar accelerate al volver:</strong> Toma impulso al expandir (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-long2', '500ms')">long2 • 500ms</button>) y retorna sedoso con <code class="font-mono text-main">emphasized</code> (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-medium1', '250ms')">medium1 • 250ms</button>). Sus esquinas pasan al instante de <code class="font-mono text-primary">24px (h/2)</code> a <code class="font-mono text-primary">16px</code>.
                </p>
              }

              <div class="flex flex-wrap gap-2 pt-1">
                <m3-button
                  variant="tonal"
                  size="sm"
                  icon="content_copy"
                  (action)="copyAsymmetrySnippet()">
                  Copiar Regla CSS Activa
                </m3-button>
              </div>
            </m3-card>

            <!-- Ejemplo Vivo del Kit: Botón Morph -->
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-2.5">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="text-xs font-bold text-main">Ejemplo del Kit: Botón Toggle con Shape Morph</span>
                <span class="text-[10px] font-mono text-primary">350ms radio / 150ms color</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Tocá el botón real de nuestro kit: cambia su forma (<code class="font-mono">24px ↔ 12px</code>) con <strong>Spatial (350ms)</strong> y su color de relleno con <strong>Effects (150ms, sin rebote)</strong>.
              </p>
              <div class="flex items-center gap-3 flex-wrap pt-1">
                <m3-button
                  variant="tonal"
                  size="md"
                  [toggle]="true"
                  [morph]="true"
                  [icon]="morphButtonActive() ? 'favorite' : 'favorite_border'"
                  [(selected)]="morphButtonActive">
                  {{ morphButtonActive() ? 'Marcado (Squircle 12px)' : 'Guardar (Pill 9999px)' }}
                </m3-button>
                <span class="text-[10px] font-mono text-muted">
                  token acotado: {{ morphButtonActive() ? '12px' : 'h/2 (20px)' }}
                </span>
              </div>
            </m3-card>
          </div>

          <!-- Teatro interactivo de Asimetría con radios acotados (ZERO 9999px dead-zone) -->
          <div class="lg:col-span-7 p-4 rounded-m3-xl bg-surface border border-outline-sub space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span class="text-xs font-bold text-main block">Simulador En Vivo de Ida vs. Vuelta</span>
                <span class="text-[11px] text-muted">Morfeo inmediato desde el milisegundo 0 gracias al radio acotado <code class="font-mono text-primary">24px ↔ 16px</code>.</span>
              </div>
              <m3-button
                variant="filled"
                size="sm"
                [icon]="asymmetryOpen() ? 'close_fullscreen' : 'open_in_full'"
                (action)="toggleAsymmetryDemo()">
                {{ asymmetryOpen() ? 'Contraer / Cerrar (' + (asymmetryMode() === 'onscreen' ? '250ms' : '200ms') + ')' : 'Expandir / Abrir (' + (asymmetryMode() === 'onscreen' ? '500ms' : '400ms') + ')' }}
              </m3-button>
            </div>

            <div class="h-44 rounded-m3-lg bg-surface-high border border-outline-sub/60 p-4 flex items-center justify-center relative overflow-hidden">
              @if (asymmetryMode() === 'onscreen') {
                <!-- Elemento En Pantalla: morph continuo desde t=0ms (24px <-> 16px, cero 9999px) -->
                <button
                  type="button"
                  (click)="toggleAsymmetryDemo()"
                  [attr.aria-expanded]="asymmetryOpen()"
                  [style.width]="asymmetryOpen() ? '336px' : '236px'"
                  [style.height]="asymmetryOpen() ? '124px' : '48px'"
                  [style.border-radius]="asymmetryOpen() ? '16px' : '24px'"
                  [class]="
                    'border px-4 py-3 text-start flex flex-col justify-start gap-2 overflow-hidden max-w-full cursor-pointer state-layer focus-ring-m3 ' +
                    (asymmetryOpen()
                      ? 'bg-primary-box border-primary shadow-md'
                      : 'bg-surface-box border-outline shadow-xs')
                  "
                  style="transition-property: width, height, border-radius, background-color, border-color, box-shadow;"
                  [style.transition-duration]="asymmetryOpen() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                  [style.transition-timing-function]="'var(--md-sys-motion-easing-emphasized)'">
                  <div class="flex items-center justify-between gap-2 w-full shrink-0">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="material-symbols-rounded text-base text-primary shrink-0" aria-hidden="true">deployed_code</span>
                      <span class="text-xs font-bold text-main truncate">Panel En Pantalla</span>
                    </div>
                    <span class="text-[10px] font-mono text-primary shrink-0">
                      {{ asymmetryOpen() ? 'long2 • 500ms' : 'medium1 • 250ms' }}
                    </span>
                  </div>
                  <p
                    class="text-[11px] text-muted leading-snug"
                    style="transition-property: opacity;"
                    [style.transition-duration]="asymmetryOpen() ? 'var(--md-sys-motion-duration-medium2)' : 'var(--md-sys-motion-duration-short2)'"
                    [style.transition-delay]="asymmetryOpen() ? '80ms' : '0ms'"
                    [class.opacity-100]="asymmetryOpen()"
                    [class.opacity-0]="!asymmetryOpen()">
                    Esquinas acotadas (<code class="font-mono text-main">24px ↔ 16px</code>): morfea sin espera muerta y vuelve sedoso con <strong>emphasized (250ms)</strong>.
                  </p>
                </button>
              } @else {
                <!-- Elemento Descartable: entra decelerate 400ms y sale accelerate 200ms -->
                <div
                  class="w-72 p-4 rounded-m3-lg bg-surface-box border border-primary/40 shadow-md flex items-start gap-3"
                  style="transition-property: transform, opacity;"
                  [style.transition-duration]="asymmetryOpen() ? 'var(--md-sys-motion-duration-medium4)' : 'var(--md-sys-motion-duration-short4)'"
                  [style.transition-timing-function]="asymmetryOpen() ? 'var(--md-sys-motion-easing-emphasized-decelerate)' : 'var(--md-sys-motion-easing-emphasized-accelerate)'"
                  [style.transform]="asymmetryOpen() ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.92)'"
                  [style.opacity]="asymmetryOpen() ? '1' : '0.18'">
                  <span class="material-symbols-rounded text-primary text-lg shrink-0 mt-0.5" aria-hidden="true">notifications_active</span>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-main">Overlay Descartable</span>
                      <span class="text-[10px] font-mono text-primary">
                        {{ asymmetryOpen() ? 'medium4 • 400ms' : 'short4 • 200ms' }}
                      </span>
                    </div>
                    <p class="text-[11px] text-muted leading-snug">
                      Entra suavemente (400ms) para ser leído; al cerrarse acelera rápido (200ms) para despejar la pantalla.
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </m3-card>

      <!-- PILAR 2: SPRING PHYSICS EXPLICADO SIMPLE + EJEMPLOS UI DETALLADOS -->
      <m3-card variant="outlined" padding="md" customClass="space-y-6">
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">air</span>
              Pilar 2 • Resortes (Springs): ¿Qué Se Mueve vs. Qué Cambia de Color?
            </div>
            <h3 class="text-title-md-emphasized text-main">
              Regla de Oro M3: Spatial (Física con Tacto) vs. Effects (Visual sin Rebote)
            </h3>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              En M3 Expressive no animás todo con la misma curva. Separá siempre en dos familias: <strong>1) Spatial</strong> mueve tamaño, posición y esquinas (puede pasar apenas de la meta y rebotar en modo <em>Expressive</em> para dar vida); <strong>2) Effects</strong> cambia color, opacidad o sombra y <strong>jamás rebota</strong> (<code class="font-mono text-primary">Damping = 1.0</code>) porque oscilar colores hace parpadear la vista.
            </p>
          </div>
        </div>

        <!-- GUÍA RÁPIDA DE QUÉ SIGNIFICA CADA PERILLA -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <m3-card variant="filled" surface="high" padding="sm" shape="lg" customClass="space-y-1">
            <span class="font-bold text-main block">1. Estilo: Expressive vs. Standard</span>
            <p class="text-[11px] text-muted leading-snug">
              <strong>Expressive (Damping 0.6–0.8):</strong> Se pasa un poco del objetivo (+67% en Fast) y rebota suave. Úsalo en botones hero, tarjetas destacadas o logros.<br>
              <strong>Standard (Damping 0.9):</strong> Sobrio y firme (+6%). Úsalo en listas densas o tablas de trabajo.
            </p>
          </m3-card>
          <m3-card variant="filled" surface="high" padding="sm" shape="lg" customClass="space-y-1">
            <span class="font-bold text-main block">2. Velocidad según Tamaño (Fast / Default / Slow)</span>
            <p class="text-[11px] text-muted leading-snug">
              <strong>Fast (350ms / 150ms):</strong> Chips, switches, badges.<br>
              <strong>Default (500ms / 200ms):</strong> Tarjetas bento, sheets medianos.<br>
              <strong>Slow (650–750ms / 300ms):</strong> Modales o pantallas grandes.
            </p>
          </m3-card>
          <m3-card variant="filled" surface="high" padding="sm" shape="lg" customClass="space-y-1">
            <span class="font-bold text-main block">3. Curva Web: bezier() vs. linear()</span>
            <p class="text-[11px] text-muted leading-snug">
              <code class="font-mono">cubic-bezier()</code> solo permite 1 impulso; <code class="font-mono text-primary">linear()</code> encadena 11 puntos de resorte real (disponible en Expressive) para simular rebote + asentamiento real en CSS puro.
            </p>
          </m3-card>
        </div>

        <!-- BARRA DE CONTROLES -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-m3-lg bg-surface border border-outline-sub">
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-main uppercase tracking-wider block">1. Estilo del Resorte</span>
            <m3-button-group
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Estilo del resorte"
              [options]="springStyleOptions"
              [value]="[springStyle()]"
              (selectionChange)="onSpringStyleSelection($event)" />
          </div>

          <div class="space-y-2">
            <span class="text-[11px] font-bold text-main uppercase tracking-wider block">2. Escala de Velocidad</span>
            <m3-button-group
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Velocidad del resorte"
              [options]="springSpeedOptions"
              [value]="[springSpeed()]"
              (selectionChange)="onSpringSpeedSelection($event)" />
          </div>

          <div class="space-y-2">
            <span class="text-[11px] font-bold text-main uppercase tracking-wider block">3. Función CSS Web</span>
            <m3-button-group
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Aproximación de curva CSS"
              [options]="curveModeOptions()"
              [value]="[springCurveMode()]"
              (selectionChange)="onSpringCurveSelection($event)" />
          </div>
        </div>

        <!-- ACCIONES + MODO CÁMARA LENTA PARA ESTUDIAR EL REBOTE -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <m3-button variant="filled" size="sm" icon="replay" (action)="replaySpringDemo()">
              Disparar Comparativa
            </m3-button>
            <m3-chip
              type="filter"
              icon="slow_motion_video"
              [selected]="slowMotionSpring()"
              (action)="toggleSlowMotionSpring()">
              {{ slowMotionSpring() ? 'Cámara Lenta Activa (3x para ver el rebote)' : 'Ver en Cámara Lenta (3x)' }}
            </m3-chip>
            <m3-button variant="tonal" size="sm" icon="content_copy" (action)="copyActiveSpringTokens()">
              Copiar Tokens CSS
            </m3-button>
          </div>
          <span class="text-[11px] font-mono text-primary">
            {{ activeSpringSpecs().spatial.curveLabel }}
          </span>
        </div>

        <!-- DOS EJEMPLOS DETALLADOS LADO A LADO -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Ejemplo A: Spatial con línea de Meta 100% visible -->
          <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-4">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-main block">Ejemplo A • Spatial: Mover Tarjeta hacia su Meta (Con o sin Rebote)</span>
                <span class="text-[11px] font-mono text-primary block">
                  Damping {{ activeSpringSpecs().physics.spatial.damping }} • Stiffness {{ activeSpringSpecs().physics.spatial.stiffness }}
                </span>
              </div>
              <m3-chip type="assist" icon="content_copy" (action)="copyCssToken('--md-sys-motion-spring-fast-spatial', activeSpringSpecs().spatial.curve)">
                {{ effectiveSpatialDuration() }}ms{{ slowMotionSpring() ? ' (3x)' : '' }}
              </m3-chip>
            </div>

            <p class="text-[11px] text-muted leading-snug">
              <strong>Fijate en la línea punteada ("Meta 100%"):</strong> en <em>Expressive</em> la tarjeta pasa un poco la línea y vuelve asentándose; en <em>Standard</em> frena derecho en la meta. Encendé <strong>Cámara Lenta (3x)</strong> para apreciarlo claro.
            </p>

            <!-- Pista con Meta 100% claramente marcada -->
            <div
              class="h-24 rounded-m3-lg bg-surface-box border border-outline-sub px-4 flex items-center relative overflow-hidden"
              style="container-type: inline-size;">
              <!-- Línea de Meta 100% al 68% de pista para dejar zona de sobrepaso visible a la derecha -->
              <div
                aria-hidden="true"
                class="absolute top-2 bottom-2 border-r-2 border-dashed border-primary/45 pointer-events-none flex items-end"
                style="left: 68%;">
                <span class="text-[9px] font-mono font-bold text-primary bg-surface-box px-1 -translate-x-1/2">Meta 100%</span>
              </div>

              <div
                class="h-12 px-3.5 bg-primary text-on-primary flex items-center gap-2 shadow-md font-semibold text-xs shrink-0 relative z-10"
                [style.border-radius]="springReplay.active() ? '14px' : '22px'"
                style="transition-property: transform, border-radius;"
                [style.transition-duration]="effectiveSpatialDuration() + 'ms'"
                [style.transition-timing-function]="activeSpringSpecs().spatial.curve"
                [style.transform]="springReplay.active() ? 'translateX(calc(68cqw - 100%)) scale(1.04)' : 'translateX(0px) scale(0.92)'">
                <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">shopping_bag</span>
                <span>Pedido #42</span>
              </div>
            </div>

            <div class="text-[10px] font-mono text-muted break-all p-2.5 rounded-m3-md bg-surface border border-outline-sub/60">
              Dónde usar: drawer que entra, FAB expandiendo a tarjeta, pill → squircle en botones.<br>
              CSS: {{ activeSpringSpecs().spatial.curve }}
            </div>
          </m3-card>

          <!-- Ejemplo B: Effects con Estado Real -->
          <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-4">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-main block">Ejemplo B • Effects: Cambio de Color &amp; Opacidad (Cero Rebote)</span>
                <span class="text-[11px] font-mono text-primary block">
                  Damping {{ activeSpringSpecs().physics.effects.damping }} • Stiffness {{ activeSpringSpecs().physics.effects.stiffness }}
                </span>
              </div>
              <m3-chip type="assist" icon="content_copy" (action)="copyCssToken('--md-sys-motion-spring-fast-effects', activeSpringSpecs().effects.curve)">
                {{ effectiveEffectsDuration() }}ms • Damping 1.0
              </m3-chip>
            </div>

            <p class="text-[11px] text-muted leading-snug">
              <strong>¿Por qué no rebota nunca?</strong> Al pasar un card de <em>Borrador</em> a <em>Aprobado</em>, la curva <code class="font-mono text-primary">Damping 1.0</code> frena de golpe al 100% sin pasarse ni parpadear.
            </p>

            <div class="h-24 rounded-m3-lg bg-surface-box border border-outline-sub px-4 flex items-center justify-between gap-4">
              <div
                class="w-full h-14 rounded-m3-lg border px-4 flex items-center justify-between gap-3"
                style="transition-property: background-color, border-color, box-shadow, opacity, color;"
                [style.transition-duration]="effectiveEffectsDuration() + 'ms'"
                [style.transition-timing-function]="activeSpringSpecs().effects.curve"
                [class]="
                  springReplay.active()
                    ? 'bg-success-box/65 border-success text-main shadow-sm opacity-100'
                    : 'bg-surface-high border-outline-sub text-muted shadow-none opacity-65'
                ">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="material-symbols-rounded text-lg shrink-0" [class.text-success]="springReplay.active()" aria-hidden="true">
                    {{ springReplay.active() ? 'check_circle' : 'hourglass_top' }}
                  </span>
                  <span class="text-xs font-bold truncate">
                    {{ springReplay.active() ? 'Estado: Factura Aprobada (Efecto limpio)' : 'Estado: Validando pago...' }}
                  </span>
                </div>
                <span class="text-[10px] font-mono shrink-0">0% rebote</span>
              </div>
            </div>

            <div class="text-[10px] font-mono text-muted break-all p-2.5 rounded-m3-md bg-surface border border-outline-sub/60">
              Dónde usar: State Layer hover (8%), cambio de color en chips/cards, aparición de texto y sombras.<br>
              CSS: {{ activeSpringSpecs().effects.curve }}
            </div>
          </m3-card>
        </div>
      </m3-card>
    </div>
  `
})
export class MotionPhysicsSectionComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly copyToken = output<ClipboardCopyPayload>();

  readonly springReplay = new MotionReplayHandle(this.destroyRef, true);

  readonly asymmetryMode = signal<'disposable' | 'onscreen'>('onscreen');
  readonly asymmetryOpen = signal<boolean>(true);
  readonly morphButtonActive = signal<boolean>(false);

  readonly springStyle = signal<SpringStyle>('expressive');
  readonly springSpeed = signal<SpringSpeed>('fast');
  readonly springCurveMode = signal<'bezier' | 'linear'>('bezier');
  readonly slowMotionSpring = signal<boolean>(false);

  readonly asymmetryOptions: M3ButtonGroupOption[] = [
    { id: 'onscreen', label: 'En Pantalla (500ms / 250ms)' },
    { id: 'disposable', label: 'Descartable (400ms / 200ms)' }
  ];

  readonly springStyleOptions: M3ButtonGroupOption[] = [
    { id: 'expressive', label: 'Expressive' },
    { id: 'standard', label: 'Standard' }
  ];

  readonly springSpeedOptions: M3ButtonGroupOption[] = [
    { id: 'fast', label: 'Fast' },
    { id: 'default', label: 'Default' },
    { id: 'slow', label: 'Slow' }
  ];

  readonly curveModeOptions = computed<M3ButtonGroupOption[]>(() => [
    { id: 'bezier', label: 'cubic-bezier()' },
    {
      id: 'linear',
      label: 'linear() Multi-Rebote',
      disabled: this.springStyle() === 'standard'
    }
  ]);

  readonly activeSpringSpecs = computed(() => {
    const style = this.springStyle();
    const speed = this.springSpeed();
    const useLinear = style === 'expressive' && this.springCurveMode() === 'linear';
    const spatial = SPRING_WEB_CURVES[style].spatial[speed];
    const effects = SPRING_WEB_CURVES[style].effects[speed];
    const physics = SPRING_PHYSICS_BY_SPEED[style][speed];

    const spatialCurve = useLinear ? SPRING_EXPRESSIVE_FAST_SPATIAL_LINEAR : spatial.curve;
    return {
      physics,
      spatial: {
        ...spatial,
        curve: spatialCurve,
        curveLabel: useLinear
          ? 'linear() Multi-Rebote (--md-sys-motion-spring-expressive-fast-spatial-linear)'
          : `${spatial.token} (${spatial.duration}ms)`
      },
      effects
    };
  });

  readonly effectiveSpatialDuration = computed(() =>
    this.activeSpringSpecs().spatial.duration * (this.slowMotionSpring() ? 3 : 1)
  );

  readonly effectiveEffectsDuration = computed(() =>
    this.activeSpringSpecs().effects.duration * (this.slowMotionSpring() ? 3 : 1)
  );

  onAsymmetrySelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'disposable' || picked === 'onscreen') {
      this.asymmetryMode.set(picked);
      this.asymmetryOpen.set(true);
    }
  }

  toggleAsymmetryDemo(): void {
    this.asymmetryOpen.update(open => !open);
  }

  onSpringStyleSelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'expressive' || picked === 'standard') {
      this.springStyle.set(picked);
      if (picked === 'standard') {
        this.springCurveMode.set('bezier');
      }
      this.springReplay.replay();
    }
  }

  onSpringSpeedSelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'fast' || picked === 'default' || picked === 'slow') {
      this.springSpeed.set(picked);
      this.springReplay.replay();
    }
  }

  onSpringCurveSelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'bezier' || picked === 'linear') {
      if (picked === 'linear' && this.springStyle() === 'standard') {
        return;
      }
      this.springCurveMode.set(picked);
      this.springReplay.replay();
    }
  }

  toggleSlowMotionSpring(): void {
    this.slowMotionSpring.update(v => !v);
    this.springReplay.replay();
  }

  replaySpringDemo(): void {
    this.springReplay.replay();
  }

  copyCssToken(tokenName: string, preview: string): void {
    this.copyToken.emit({
      text: `var(${tokenName})`,
      message: `Copiado var(${tokenName}) (${preview})`
    });
  }

  copyAsymmetrySnippet(): void {
    const snippet =
      this.asymmetryMode() === 'onscreen'
        ? `transition-duration: var(--md-sys-motion-duration-long2); /* abrir 500ms | cerrar 250ms medium1 */\ntransition-timing-function: var(--md-sys-motion-easing-emphasized);\nborder-radius: 24px; /* h/2 acotado en reposo → 16px al expandir */`
        : `transition-duration: var(--md-sys-motion-duration-medium4); /* entrar 400ms | salir 200ms short4 */\ntransition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate);`;
    this.copyToken.emit({
      text: snippet,
      message: `Regla de Asimetría (${this.asymmetryMode()}) copiada al portapapeles`
    });
  }

  copyActiveSpringTokens(): void {
    const style = this.springStyle();
    const speed = this.springSpeed();
    const snippet = `--md-sys-motion-spring-${style}-${speed}-spatial-curve: ${this.activeSpringSpecs().spatial.curve};\n--md-sys-motion-spring-${style}-${speed}-effects-curve: ${this.activeSpringSpecs().effects.curve};`;
    this.copyToken.emit({
      text: snippet,
      message: `Tokens Spring (${style} / ${speed}) copiados al portapapeles`
    });
  }
}
