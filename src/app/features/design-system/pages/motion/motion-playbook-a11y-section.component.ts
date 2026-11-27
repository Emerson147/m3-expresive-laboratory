import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { MotionReplayHandle } from './motion-replay.util';
import {
  CONTAINER_TRANSFORM_TRAPS,
  MODERN_WEB_MOTION_PRIMITIVES,
  MOTION_PLAYBOOK_FILTERS
} from './motion-specs.data';

/**
 * Interactive engineering guide covering:
 * - The 3-Filter Motion Playbook (DOM lifecycle, Physics family, Tokens/GPU)
 * - Las 3 Trampas Silenciosas of local Container Transform + interactive trap comparison demo
 * - Pillar 5: Accessibility (`prefers-reduced-motion` Calm Fade vs 1ms trap),
 *   Native Top-Layer `@starting-style` + `allow-discrete` popover, and Modern Web Primitives.
 */
@Component({
  selector: 'app-motion-playbook-a11y-section',
  standalone: true,
  imports: [M3ButtonComponent, M3CardComponent, M3ChipComponent, M3SwitchComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="motion-playbook" class="space-y-6">
      <!-- PLAYBOOK DE INGENIERÍA: LOS 3 FILTROS + LAS 3 TRAMPAS SILENCIOSAS -->
      <m3-card variant="outlined" padding="md" customClass="space-y-6">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">architecture</span>
            Playbook de Ingeniería • CSS Transitions vs. View Transitions API
          </div>
          <h3 class="text-title-md-emphasized text-main">
            Los 3 Filtros Decisorios y Las 3 Trampas Silenciosas del Container Transform
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Evaluá siempre estos tres filtros antes de escribir animaciones, evitá errores de layout en frío (<code class="font-mono text-primary">max-width: none</code> / <code class="font-mono text-primary">height: auto</code> / <code class="font-mono text-primary">::before</code>) y protegé las capturas globales con <code class="font-mono text-main">html.vt-running</code> y <code class="font-mono text-main">.m3-aurora-orb</code>.
          </p>
        </div>

        <!-- 3 Filtros Decisorios -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          @for (filter of playbookFilters; track filter.id) {
            <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                    {{ filter.badge }}
                  </span>
                </div>
                <h4 class="text-xs font-bold text-main">{{ filter.title }}</h4>

                <div class="p-2.5 rounded-m3-md bg-surface border border-outline-sub space-y-1">
                  <span class="text-[11px] font-bold text-primary block">{{ filter.ruleLeftLabel }}</span>
                  <p class="text-[11px] text-muted leading-snug">{{ filter.ruleLeftText }}</p>
                </div>

                <div class="p-2.5 rounded-m3-md bg-surface border border-outline-sub space-y-1">
                  <span class="text-[11px] font-bold text-main block">{{ filter.ruleRightLabel }}</span>
                  <p class="text-[11px] text-muted leading-snug">{{ filter.ruleRightText }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between gap-2 pt-2 border-t border-outline-sub/60">
                <code class="text-[10px] font-mono text-primary truncate">{{ filter.tokens }}</code>
                <m3-button variant="text" size="sm" icon="content_copy" (action)="emitCopy(filter.tokens, filter.title)">
                  Copiar
                </m3-button>
              </div>
            </m3-card>
          }
        </div>

        <!-- Las 3 Trampas Silenciosas del Container Transform Local -->
        <div class="space-y-4 pt-2 border-t border-outline-sub">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-warning text-base" aria-hidden="true">bug_report</span>
              <h4 class="text-xs font-bold text-main uppercase tracking-wider">
                Las 3 Trampas Silenciosas del Container Transform Local
              </h4>
            </div>
            <span class="text-[10px] font-mono text-muted">Prohibido .transition-all • Siempre max-w-full invariante</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            @for (trap of containerTraps; track trap.id) {
              <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-2.5">
                <div class="space-y-2">
                  <span class="text-xs font-bold text-main block">{{ trap.title }}</span>
                  <p class="text-[11px] text-muted leading-snug">
                    <strong class="text-error">Error:</strong> {{ trap.problem }}
                  </p>
                  <p class="text-[11px] text-muted leading-snug">
                    <strong class="text-success">Solución M3:</strong> {{ trap.solution }}
                  </p>
                </div>
                <div class="pt-2 border-t border-outline-sub/50 flex items-center justify-between gap-2">
                  <code class="text-[10px] font-mono text-primary truncate">{{ trap.snippet }}</code>
                  <m3-button variant="text" size="sm" icon="content_copy" (action)="emitCopy(trap.snippet, trap.title)">
                    Copiar
                  </m3-button>
                </div>
              </m3-card>
            }
          </div>

          <!-- Demo vivo Trampa vs Solución M3 -->
          <div class="p-4 rounded-m3-lg bg-surface-high border border-outline-sub flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="space-y-2">
              <span class="text-xs font-bold text-main block">Simulador Trampa 2: Contenido Interno al Cerrar Container (500ms)</span>
              <p class="text-[11px] text-muted max-w-xl leading-snug">
                Alterná abrir/cerrar observando cómo en la <strong>Solución M3</strong> el detalle desvanece en <code class="font-mono text-primary">100ms (0ms delay)</code> antes de comprimir la caja, evitando ver texto cortado o cajas huecas.
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <m3-chip
                  type="filter"
                  [selected]="!trapBadMode()"
                  (action)="trapBadMode.set(false)">
                  Solución M3 (short2 fade asimétrico)
                </m3-chip>
                <m3-chip
                  type="filter"
                  [selected]="trapBadMode()"
                  (action)="trapBadMode.set(true)">
                  Anti-patrón (desmonte lento sin delay)
                </m3-chip>
                <m3-button variant="tonal" size="sm" [icon]="trapDemoOpen() ? 'compress' : 'expand'" (action)="trapDemoOpen.set(!trapDemoOpen())">
                  {{ trapDemoOpen() ? 'Cerrar Caja (500ms)' : 'Abrir Caja (500ms)' }}
                </m3-button>
              </div>
            </div>

            <div
              class="w-72 max-w-full rounded-m3-lg bg-surface-box border border-outline-sub overflow-hidden p-3 space-y-1.5 shrink-0"
              style="transition-property: height, border-color; transition-duration: var(--md-sys-motion-duration-long2); transition-timing-function: var(--md-sys-motion-easing-emphasized);"
              [style.height]="trapDemoOpen() ? '104px' : '44px'">
              <div class="flex items-center justify-between text-xs font-bold text-main">
                <span>Resumen Fiscal #42</span>
                <span class="text-[10px] font-mono text-primary">{{ trapDemoOpen() ? 'Abierto' : 'Cerrado' }}</span>
              </div>
              <p
                class="text-[11px] text-muted"
                style="transition-property: opacity;"
                [style.transition-duration]="trapBadMode() ? 'var(--md-sys-motion-duration-long2)' : (trapDemoOpen() ? 'var(--md-sys-motion-duration-medium2)' : 'var(--md-sys-motion-duration-short2)')"
                [style.transition-delay]="trapBadMode() ? '0ms' : (trapDemoOpen() ? '90ms' : '0ms')"
                [class.opacity-100]="trapDemoOpen()"
                [class.opacity-0]="!trapDemoOpen()">
                Detalle secundario sincronizado sin recortes ni ghosting.
              </p>
            </div>
          </div>
        </div>
      </m3-card>

      <!-- PILAR 5: ACCESIBILIDAD REDUCED MOTION + NATIVE POPOVER @STARTING-STYLE + PRIMITIVAS MODERNAS -->
      <m3-card variant="outlined" padding="md" customClass="space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">accessibility_new</span>
              Pilar 5 • Accesibilidad Universal y Primitivas Web Modernas
            </div>
            <h3 class="text-title-md-emphasized text-main">
              prefers-reduced-motion: Calm Fade vs. Corte de 1ms + Top Layer @starting-style
            </h3>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              Aniquilar animaciones con <code class="font-mono text-error">animation-duration: 1ms</code> provoca destellos bruscos. M3 Expressive reemplaza traslaciones y rebotes espaciales por un <strong>Calm Fade suave de 150ms lineales</strong> y usa <code class="font-mono text-primary">@starting-style</code> + <code class="font-mono text-primary">allow-discrete</code> en nativo <code class="font-mono text-main">[popover="auto"]</code>.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <!-- Simulador Reduced Motion -->
          <div class="lg:col-span-6 p-4 rounded-m3-xl bg-surface border border-outline-sub space-y-4">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span class="text-xs font-bold text-main block">Simulador En Vivo: prefers-reduced-motion</span>
                <span class="text-[11px] text-muted">Activá el switch M3 y probá la diferencia entre salto espacial y Calm Fade.</span>
              </div>
              <m3-switch
                label="Reducir Movimiento"
                [checked]="reducedMotionSim()"
                (checkedChange)="onReducedMotionToggle($event)" />
            </div>

            <div class="p-4 rounded-m3-lg bg-surface-high border border-outline-sub space-y-3">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="text-xs font-bold text-main">
                  {{ reducedMotionSim() ? 'Calm Fade (150ms linear fade — zero traslación espacial)' : 'Expressive Spring (350ms con desplazamiento + escala)' }}
                </span>
                <m3-button variant="tonal" size="xs" icon="replay" (action)="replayA11yDemo()">
                  Probar Entrada A11y
                </m3-button>
              </div>

              <div class="h-20 rounded-m3-md bg-surface-box border border-outline-sub px-3 flex items-center justify-between overflow-hidden">
                <div
                  class="px-3.5 py-2 rounded-m3-lg bg-primary-box border border-primary/40 text-xs font-semibold text-main"
                  style="transition-property: transform, opacity;"
                  [style.transition-duration]="reducedMotionSim() ? '150ms' : 'var(--md-sys-motion-spring-expressive-fast-spatial-duration)'"
                  [style.transition-timing-function]="reducedMotionSim() ? 'linear' : 'var(--md-sys-motion-spring-expressive-fast-spatial)'"
                  [style.transform]="
                    a11yReplay.active()
                      ? 'translateX(0) scale(1)'
                      : (reducedMotionSim() ? 'translateX(0) scale(1)' : 'translateX(44px) scale(0.86)')
                  "
                  [style.opacity]="a11yReplay.active() ? '1' : '0.12'">
                  Estado Estabilizado A11y
                </div>

                <span class="text-[10px] font-mono text-primary">
                  {{ reducedMotionSim() ? 'prefers-reduced-motion: reduce' : 'motion: normal' }}
                </span>
              </div>

              <p class="text-[11px] text-muted">
                Las esferas <code class="font-mono text-main">.m3-aurora-orb</code> quedan estáticas y <code class="font-mono text-main">html.vt-running</code> congela la vista durante cambios de ruta.
              </p>

              <div class="p-2.5 rounded-m3-md bg-surface border border-outline-sub text-[10px] font-mono text-primary">
                transition-property: transform, opacity;
              </div>
            </div>
          </div>

          <!-- Top Layer Nativo Popover + @starting-style REAL -->
          <div class="lg:col-span-6 p-4 rounded-m3-xl bg-surface border border-outline-sub space-y-4">
            <div class="space-y-1">
              <span class="text-xs font-bold text-main block">Top Layer Nativo sin JavaScript: [popover="auto"] + @starting-style</span>
              <p class="text-[11px] text-muted leading-snug">
                El botón inferior usa <code class="font-mono text-primary">popovertarget="motion-top-layer-demo"</code> nativo HTML y la clase <code class="font-mono text-main">.m3-popover-surface</code> (<code class="font-mono text-primary">src/styles/_overlays.css</code>) con <code class="font-mono text-main">allow-discrete</code> + <code class="font-mono text-main">&#64;starting-style</code> reales al abrir y cerrar.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                popovertarget="motion-top-layer-demo"
                popovertargetaction="toggle"
                class="m3-btn m3-btn-tonal m3-btn-md state-layer focus-ring-m3">
                <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">layers</span>
                Abrir / Cerrar Top Layer (@starting-style)
              </button>

              <m3-button
                variant="text"
                size="sm"
                icon="content_copy"
                (action)="emitCopy(startingStyleSnippet, '@starting-style Top Layer')">
                Copiar CSS Nativo
              </m3-button>
            </div>

            <!-- Elemento Top-Layer Popover real con @starting-style + allow-discrete -->
            <div
              id="motion-top-layer-demo"
              popover="auto"
              class="m-auto p-5 rounded-m3-xl bg-surface-box border border-primary/50 shadow-2xl max-w-md text-main space-y-2 m3-popover-surface">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-bold text-main">Panel Top-Layer Nativo ([popover="auto"])</span>
                <button
                  type="button"
                  popovertarget="motion-top-layer-demo"
                  popovertargetaction="hide"
                  class="m3-btn m3-btn-text m3-btn-sm state-layer focus-ring-m3">
                  Cerrar (Esc)
                </button>
              </div>
              <p class="text-xs text-muted leading-relaxed">
                Renderizado fuera de cualquier stacking context padre usando atributos declarativos HTML5 + <code class="font-mono text-primary">allow-discrete</code> + <code class="font-mono text-primary">&#64;starting-style</code>, con soporte Light Dismiss automático al hacer clic fuera o presionar Escape.
              </p>
            </div>
          </div>
        </div>

        <!-- 4 Primitivas Modernas de Movimiento Web -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-outline-sub">
          @for (primitive of modernPrimitives; track primitive.id) {
            <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                    {{ primitive.badge }}
                  </span>
                  <m3-button
                    variant="text"
                    size="sm"
                    icon="content_copy"
                    (action)="emitCopy(primitive.snippet, primitive.title)">
                    Copiar Snippet
                  </m3-button>
                </div>
                <h4 class="text-xs font-bold text-main">{{ primitive.title }}</h4>
                <p class="text-[11px] text-muted leading-snug">{{ primitive.summary }}</p>
                <p class="text-[11px] text-main">
                  <strong>Regla:</strong> {{ primitive.rule }}
                </p>
              </div>
              <pre class="p-2.5 rounded-m3-md bg-surface border border-outline-sub text-[10px] font-mono text-primary overflow-x-auto leading-relaxed">{{ primitive.snippet }}</pre>
            </m3-card>
          }
        </div>
      </m3-card>
    </div>
  `
})
export class MotionPlaybookA11ySectionComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly copyToken = output<ClipboardCopyPayload>();

  readonly a11yReplay = new MotionReplayHandle(this.destroyRef, true);

  readonly reducedMotionSim = signal<boolean>(false);
  readonly trapDemoOpen = signal<boolean>(true);
  readonly trapBadMode = signal<boolean>(false);

  readonly playbookFilters = MOTION_PLAYBOOK_FILTERS;
  readonly containerTraps = CONTAINER_TRANSFORM_TRAPS;
  readonly modernPrimitives = MODERN_WEB_MOTION_PRIMITIVES;
  readonly startingStyleSnippet = MODERN_WEB_MOTION_PRIMITIVES[0].snippet;

  onReducedMotionToggle(enabled: boolean): void {
    this.reducedMotionSim.set(enabled);
    this.a11yReplay.replay();
  }

  replayA11yDemo(): void {
    this.a11yReplay.replay();
  }

  emitCopy(text: string, label: string): void {
    this.copyToken.emit({
      text,
      message: `${label}: copiado al portapapeles`
    });
  }
}
