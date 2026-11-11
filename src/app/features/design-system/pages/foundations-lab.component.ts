import { Component, inject, signal } from '@angular/core';
import { AdaptiveLayoutService } from '../../../core/layout/adaptive-layout.service';

/**
 * Laboratory page for Step 2 (Foundations): universal state layers, 48x48dp touch targets,
 * dual focus rings, and real-time M3 Window Size Classes.
 */
@Component({
  selector: 'app-foundations-lab',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- TARJETAS INTERACTIVAS PASO 2 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. STATE LAYERS & DUAL FOCUS RING -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">layers</span>
              Foundations • Capas de Estado
            </div>
            <h3 class="text-title-md font-bold text-main">Motor Universal State Layer</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Usa <code class="text-primary font-mono text-[11px]">currentColor</code> en <code class="font-mono text-[11px]">::before</code>. Pasa el cursor, mantén presionado o presiona <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">Tab</kbd>.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex flex-col gap-2">
              <button class="state-layer focus-ring-m3 w-full py-2.5 px-4 rounded-full bg-primary text-on-primary font-semibold text-xs flex items-center justify-between cursor-pointer shadow-xs">
                <span>Hover 8% • Press 12%</span>
                <span class="material-symbols-rounded text-base">touch_app</span>
              </button>
              <button class="state-layer focus-ring-m3 w-full py-2.5 px-4 rounded-full bg-sec-box text-on-sec-box font-semibold text-xs flex items-center justify-between cursor-pointer shadow-xs">
                <span>Secondary Container</span>
                <span class="material-symbols-rounded text-base">check_circle</span>
              </button>
              <button class="state-layer focus-ring-m3 w-full py-2.5 px-4 rounded-full bg-tertiary-box text-on-tertiary-box font-semibold text-xs flex items-center justify-between cursor-pointer shadow-xs">
                <span>Tertiary Container</span>
                <span class="material-symbols-rounded text-base">star</span>
              </button>
            </div>

            <p class="text-[11px] text-muted italic">
              El color de tinta cambia solo; la capa de estado se adapta sin tocar el fondo.
            </p>
          </div>
        </div>

        <!-- 2. TOUCH TARGETS (48x48dp) -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">ads_click</span>
              Foundations • Accesibilidad Táctil
            </div>
            <h3 class="text-title-md font-bold text-main">Touch Target 48×48dp</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              El botón mide solo 28px visuales, pero su área táctil invisible cumple la norma de 48px.
            </p>
          </div>

          <div class="space-y-4">
            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub flex items-center justify-between">
              <div class="relative py-4 px-6 flex items-center justify-center">
                <!-- Botón compacto de 28px con hitbox de 48px -->
                <button
                  (click)="hitboxClicks.update(c => c + 1)"
                  [class.touch-target-debug]="showHitbox()"
                  title="Haz clic incluso alrededor del círculo dentro del recuadro"
                  class="touch-target-48 state-layer focus-ring-m3 w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center cursor-pointer shadow-xs">
                  <span class="material-symbols-rounded text-sm">touch_app</span>
                </button>

                @if (showHitbox()) {
                  <span class="absolute -bottom-1 text-[9px] font-mono text-primary font-bold">
                    Hitbox 48×48px
                  </span>
                }
              </div>

              <div class="text-right">
                <div class="text-xs text-muted">Clics detectados:</div>
                <div class="text-2xl font-bold font-mono text-primary">{{ hitboxClicks() }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <button
                (click)="showHitbox.update(v => !v)"
                class="btn-m3 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-high text-main hover:bg-outline-sub/30 cursor-pointer">
                {{ showHitbox() ? 'Ocultar Hitbox' : 'Ver Hitbox Invisible' }}
              </button>
              <span class="text-[11px] text-muted">WCAG 2.2 AAA</span>
            </div>
          </div>
        </div>

        <!-- 3. WINDOW SIZE CLASSES -->
        <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              <span class="material-symbols-rounded text-base text-primary">devices</span>
              Foundations • Diseño Adaptativo
            </div>
            <h3 class="text-title-md font-bold text-main">Window Size Classes M3</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Clasificación canónica de la pantalla en tiempo real con Angular Signals.
            </p>
          </div>

          <div class="space-y-3">
            <div class="p-3 bg-surface-low rounded-m3-lg border border-outline-sub space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">Clase activa:</span>
                @if (layoutService.isCompact()) {
                  <span class="px-2.5 py-1 rounded-full bg-error-box text-on-error-box text-xs font-bold uppercase">
                    Compact (&lt;600px)
                  </span>
                } @else if (layoutService.isMedium()) {
                  <span class="px-2.5 py-1 rounded-full bg-sec-box text-on-sec-box text-xs font-bold uppercase">
                    Medium (600–839px)
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-primary-box text-on-primary-box text-xs font-bold uppercase">
                    Expanded (≥840px)
                  </span>
                }
              </div>

              <div class="flex items-center justify-between text-xs">
                <span class="text-muted">Ancho actual del viewport:</span>
                <span class="font-mono font-bold text-primary">{{ layoutService.windowWidth() }}px</span>
              </div>

              <div class="flex items-center justify-between text-xs">
                <span class="text-muted">Navegación M3 sugerida:</span>
                <span class="font-semibold text-main">
                  {{ layoutService.isCompact() ? 'Dock / Bottom Bar' : 'Navigation Rail' }}
                </span>
              </div>
            </div>

            <p class="text-[11px] text-muted leading-relaxed">
              Cambia el tamaño del navegador o abre la consola para ver mutar el valor instantáneamente.
            </p>
          </div>
        </div>
      </div>

      <!-- PRINCIPIOS DE INTERACCIÓN -->
      <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-1.5">
          <div class="text-xs font-bold text-primary flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base">opacity</span>
            1. State Layer Desacoplado
          </div>
          <p class="text-[11px] text-muted leading-relaxed">
            Al superponer <code class="font-mono text-main">currentColor</code> con opacidad (8% hover, 10% focus, 12% press) en <code class="font-mono text-main">::before</code>, un mismo motor sirve para cualquier variante cromática sin duplicar reglas hover.
          </p>
        </div>

        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-1.5">
          <div class="text-xs font-bold text-primary flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base">accessibility_new</span>
            2. Ergonomía vs. Tamaño Visual
          </div>
          <p class="text-[11px] text-muted leading-relaxed">
            Un icono compacto puede medir 24–28px visualmente para cuidar la densidad del layout mientras <code class="font-mono text-main">.touch-target-48</code> expande su zona clicable con <code class="font-mono text-main">::after</code>.
          </p>
        </div>

        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-1.5">
          <div class="text-xs font-bold text-primary flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base">view_quilt</span>
            3. Breakpoints Semánticos M3
          </div>
          <p class="text-[11px] text-muted leading-relaxed">
            Compact (&lt;600px), Medium (600–839px) y Expanded (≥840px) gobiernan patrones estructurales (Dock vs. Rail vs. Drawer) en lugar de ajustar columnas arbitrariamente.
          </p>
        </div>
      </div>
    </div>
  `
})
export class FoundationsLabComponent {
  readonly layoutService = inject(AdaptiveLayoutService);

  readonly showHitbox = signal<boolean>(false);
  readonly hitboxClicks = signal<number>(0);
}
