import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import {
  M3_COOKIE4_PATH,
  M3_COOKIE9_PATH,
  M3_OVAL_PATH,
  M3_PENTAGON_PATH,
  M3_PILL_PATH,
  M3_SOFT_BURST_PATH,
  M3_SUNNY_PATH,
  M3LoadingIndicatorComponent
} from '../../../../shared/components/progress';
import { M3SliderComponent } from '../../../../shared/components/slider/slider.component';
import {
  APPLYING_ELEVATION_PRINCIPLES,
  COMPONENT_ELEVATION_MATRIX,
  ELEVATION_6_SPECS,
  SHAPE_CORNER_10_SPECS,
  SHAPE_MORPH_MECHANISMS_SPECS,
  SHAPE_PRINCIPLES_SPECS
} from './styles-specs.data';
import { StylesCopyRequest } from './styles-copy.model';

type ElevationSimMode = 'tonal' | 'hover' | 'modal';

@Component({
  selector: 'app-styles-shape-elevation-section',
  standalone: true,
  imports: [M3ButtonComponent, M3CardComponent, M3ChipComponent, M3LoadingIndicatorComponent, M3SliderComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      @if (showShape()) {
      <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-6">
        <div class="space-y-1 border-b border-outline-sub pb-4">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">rounded_corner</span>
            Caso 4 • Shape System: 10-Step Scale, Overview Principles &amp; Dual Shape Morphing
          </div>
          <h2 class="text-title-lg-emphasized text-main">
            Shape Morphing Vivo (<code class="font-mono text-primary">0px → 48px + Full</code>) &amp; Concentricidad Óptica
          </h2>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Basado en <code class="font-mono text-main">shape/overview-principles</code> y <code class="font-mono text-main">shape/shape-morph</code>: en M3 Expressive las esquinas son <strong>háptica visual</strong>. Usamos nuestro propio kit (<code class="font-mono text-primary">&lt;m3-button [toggle]="true"&gt;</code>, <code class="font-mono text-primary">&lt;m3-chip&gt;</code>, <code class="font-mono text-primary">&lt;m3-card&gt;</code> y <code class="font-mono text-primary">&lt;m3-loading-indicator&gt;</code>) para demostrar los dos mecanismos sin zona muerta de <code class="font-mono">9999px</code>.
          </p>
        </div>

        <!-- 4.1 PRIMERO LO INTERACTIVO: PLAYGROUND CUÁDRUPLE USANDO KIT M3 REAL -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-3">
          <div>
            <div class="text-xs font-bold text-main">
              1. Playground Vivo con Nuestro Kit M3 Expressive (probá cada interacción)
            </div>
            <p class="text-[11px] text-muted">
              A–C aplican <strong>Corner Radius Morphing</strong> (<code class="font-mono text-primary">h/2 ↔ squircle</code> con resorte espacial); D ejecuta <strong>Polygon Spline Morphing</strong> de 180 segmentos cúbicos a 60fps.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Demo A: Real M3 Toggle Button -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">A. &lt;m3-button [toggle]="true"&gt;</div>
                <div class="text-[10px] text-muted">
                  Acotado en <code class="font-mono text-primary">24px ↔ 12px</code>: responde en <code class="font-mono">t = 0ms</code>.
                </div>
              </div>
              <m3-button
                variant="filled"
                [toggle]="true"
                [icon]="isMorphed() ? 'check_box' : 'radio_button_checked'"
                [(selected)]="isMorphed"
                customClass="w-full justify-center">
                {{ isMorphed() ? 'Activo: Squircle (12px)' : 'Reposo: Píldora (24px)' }}
              </m3-button>
            </div>

            <!-- Demo B: Real M3 Filter Chips -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">B. &lt;m3-chip type="filter"&gt;</div>
                <div class="text-[10px] text-muted">
                  Muta <code class="font-mono text-primary">16px (h/2) ↔ 8px</code> al seleccionar cada chip.
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (chip of morphChips; track chip.id) {
                  <m3-chip
                    type="filter"
                    [icon]="chip.icon"
                    [selected]="selectedMorphChips().includes(chip.id)"
                    (action)="toggleMorphChip(chip.id)">
                    {{ chip.label }}
                  </m3-chip>
                }
              </div>
            </div>

            <!-- Demo C: Real M3 Card Interactive Morph -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">C. &lt;m3-card [interactive]&gt;</div>
                <div class="text-[10px] text-muted">
                  Alterna <code class="font-mono text-primary">shape="md" (12px) ↔ "xl" (28px)</code> + tono terciario.
                </div>
              </div>
              <m3-card
                variant="filled"
                padding="sm"
                [interactive]="true"
                [shape]="isCardMorphed() ? 'xl' : 'md'"
                [tone]="isCardMorphed() ? 'tertiary' : 'default'"
                customClass="flex items-center justify-between gap-2"
                (action)="isCardMorphed.update(v => !v)">
                <div>
                  <div class="text-xs font-bold text-main">{{ isCardMorphed() ? 'Extra-Large (28px)' : 'Medium (12px)' }}</div>
                  <div class="text-[10px] text-muted">Clic para morfear card</div>
                </div>
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">aspect_ratio</span>
              </m3-card>
            </div>

            <!-- Demo D: M3 Loading Indicator Polygon Morph -->
            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub flex flex-col justify-between space-y-2.5">
              <div class="space-y-1">
                <div class="text-[11px] font-bold text-main">D. Polygon Morph (&lt;m3-loading-indicator&gt;)</div>
                <div class="text-[10px] text-muted">
                  7 formas de 180 splines cúbicos cada 650ms. Clic para copiar constante.
                </div>
              </div>
              <div class="flex items-center justify-around py-1">
                <m3-loading-indicator size="md" [contained]="true" color="primary" ariaLabel="Demo loading indicator contained" />
                <m3-loading-indicator size="md" [contained]="false" color="tertiary" ariaLabel="Demo loading indicator uncontained" />
              </div>
              <div class="grid grid-cols-7 gap-1 pt-1.5 border-t border-outline-sub/60 text-center">
                @for (poly of canonicalPolygons; track poly.name) {
                  <button
                    type="button"
                    (click)="copyToken.emit({ text: poly.constant, message: 'Copiada constante ' + poly.constant })"
                    [attr.aria-label]="'Copiar polígono ' + poly.constant"
                    class="focus-ring-m3 flex flex-col items-center p-0.5 rounded hover:bg-surface-high cursor-pointer">
                    <svg viewBox="0 0 48 48" aria-hidden="true" class="w-5 h-5 text-primary fill-current">
                      <path [attr.d]="poly.path" />
                    </svg>
                    <span class="text-[8px] font-mono text-muted truncate max-w-full">{{ poly.name }}</span>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- 4.2 ESCALA LEGIBLE 2x5 (SIN RECORTES DE TEXTO NI CRAMMING EN 10 COLUMNAS) -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold text-main flex items-center justify-between flex-wrap gap-2">
            <span>2. Escala Oficial de 10 Radios (<code class="font-mono text-primary">--md-sys-shape-corner-*</code>) — clic para copiar</span>
            <span class="text-[11px] font-mono text-muted">Incluye los 3 radios M3E: 20px, 32px y 48px</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            @for (corner of shapeSpecs; track corner.id) {
              <button
                type="button"
                (click)="copyToken.emit({ text: 'var(' + corner.sysToken + ')', message: 'Copiado ' + corner.tailwindVar + ' (' + corner.value + ')' })"
                [style.border-radius]="'var(' + corner.sysToken + ')'"
                [class]="'state-layer focus-ring-m3 text-left p-3.5 flex flex-col justify-between min-h-[112px] transition-transform hover:-translate-y-0.5 cursor-pointer ' + (corner.isExpressiveNew
                  ? 'bg-primary-box/50 border-2 border-primary'
                  : 'bg-surface-low border border-outline-sub')">
                <div class="flex items-center justify-between gap-2 w-full">
                  <span class="text-sm font-extrabold font-mono text-main">{{ corner.value }}</span>
                  @if (corner.isExpressiveNew) {
                    <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary text-on-primary">M3E</span>
                  }
                </div>
                <div class="space-y-1 w-full">
                  <div class="text-xs font-bold text-main leading-tight">{{ corner.name }}</div>
                  <div class="text-[10px] font-mono text-primary break-words">{{ corner.tailwindVar }}</div>
                  <div class="text-[10px] text-muted leading-snug">{{ corner.usage }}</div>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- 4.3 SIMULADOR DE CONCENTRICIDAD ÓPTICA + PRINCIPIOS -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div class="space-y-1">
              <div class="text-xs font-bold text-main flex items-center gap-1.5">
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">adjust</span>
                3. Concentricidad Óptica en Vivo
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Regla M3: <code class="font-mono text-primary font-bold">R_inner = max(4px, R_outer − padding)</code>. Ajustá el padding y mirá cómo la caja interna acompaña la curva exterior (<code class="font-mono">28px</code>) sin pellizcarse.
              </p>
            </div>

            <m3-slider
              customId="styles-concentric-padding"
              label="Padding interior"
              unit="px"
              size="sm"
              [min]="4"
              [max]="24"
              [step]="2"
              [(value)]="concentricPadding" />

            <div
              class="bg-surface border-2 border-primary/50 rounded-[28px] transition-all"
              [style.padding.px]="concentricPadding()">
              <div
                class="bg-sec-box text-on-sec-box p-3 text-center space-y-0.5 transition-all"
                [style.border-radius.px]="concentricInnerRadius()">
                <div class="text-xs font-bold">R_outer: 28px − Padding: {{ concentricPadding() }}px</div>
                <div class="text-[11px] font-mono">R_inner recomendado = {{ concentricInnerRadius() }}px</div>
              </div>
            </div>
          </m3-card>

          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (prin of shapePrinciples; track prin.id) {
              <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-2">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs font-bold text-main">
                    <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">{{ prin.icon }}</span>
                    <span>{{ prin.title }}</span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">{{ prin.summary }}</p>
                </div>
                <div class="text-[10px] font-mono text-primary bg-surface px-2.5 py-1.5 rounded border border-outline-sub/60">
                  {{ prin.webApplication }}
                </div>
              </m3-card>
            }

            @for (mech of shapeMorphMechanisms; track mech.id) {
              <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-2">
                <div class="space-y-1">
                  <span class="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                    {{ mech.badge }}
                  </span>
                  <div class="text-xs font-bold text-main">{{ mech.title }}</div>
                  <p class="text-[11px] text-muted leading-snug">{{ mech.howItWorks }}</p>
                </div>
                <div class="text-[10px] font-mono text-primary pt-1 border-t border-outline-sub/60">
                  {{ mech.cssOrSvgTech }}
                </div>
              </m3-card>
            }
          </div>
        </div>
      </m3-card>
      }

      @if (showElevation()) {
      <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">layers</span>
              Caso 5 • Elevation System: 6 Levels (0dp → 12dp) &amp; Applying Elevation
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Escala de Elevación Adaptativa (<code class="font-mono text-primary">--md-sys-elevation-level0..5</code>) y Reglas de Aplicación
            </h2>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              Según <code class="font-mono text-main">m3.material.io/styles/elevation/applying-elevation</code>, la elevación expresa distancia relativa en el eje Z. Combinamos separación tonal (<code class="font-mono">0dp</code>) con sombras dinámicas OKLCH solo cuando una superficie flota o reacciona al puntero.
            </p>
          </div>
        </div>

        <!-- Simulador Didáctico: Tonal vs Sombra -->
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div class="lg:col-span-7 space-y-2.5">
            <div class="text-xs font-bold text-main">
              Regla práctica: ¿Cuándo usar Tonal (0dp) vs Sombra (+dp)?
            </div>
            <div class="flex flex-wrap gap-2" role="group" aria-label="Simular altitud M3">
              <m3-chip type="filter" [selected]="elevationSimMode() === 'tonal'" (action)="elevationSimMode.set('tonal')">
                Bento Estático (0dp Tonal)
              </m3-chip>
              <m3-chip type="filter" [selected]="elevationSimMode() === 'hover'" (action)="elevationSimMode.set('hover')">
                Card Interactiva (Hover +1dp→3dp)
              </m3-chip>
              <m3-chip type="filter" [selected]="elevationSimMode() === 'modal'" (action)="elevationSimMode.set('modal')">
                Menú / Diálogo Flotante (Level 3)
              </m3-chip>
            </div>
            <p class="text-[11px] text-muted leading-relaxed">
              {{ elevationSimExplanation() }}
            </p>
          </div>

          <div class="lg:col-span-5 p-4 rounded-m3-lg bg-surface-dim border border-outline-sub/60 flex items-center justify-center">
            <div
              [class]="'w-full max-w-xs p-4 rounded-m3-xl transition-all duration-300 border ' + elevationSimCardClass()">
              <div class="flex items-center justify-between text-xs font-bold text-main">
                <span>Tarjeta Specimen</span>
                <span class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                  {{ elevationSimBadge() }}
                </span>
              </div>
              <p class="text-[11px] text-muted mt-1 leading-snug">
                Observá cómo el contenedor tonal + salto de sombra comunican profundidad real.
              </p>
            </div>
          </div>
        </div>

        <!-- 5.1 Los 6 niveles visuales en vivo -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold text-main">
            1. Los 6 Niveles Canónicos de Elevación (<code class="font-mono text-primary">0dp → 12dp</code>) — pasá el mouse o hacé clic para copiar
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (elev of elevationSpecs; track elev.level) {
              <button
                type="button"
                (click)="copyToken.emit({ text: 'var(' + elev.sysToken + ')', message: 'Copiado Level ' + elev.level + ' (' + elev.sysToken + ')' })"
                [style.box-shadow]="'var(' + elev.sysToken + ')'"
                class="state-layer focus-ring-m3 text-left p-4 rounded-m3-lg bg-surface-low border border-outline-sub/60 flex flex-col justify-between min-h-[116px] transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div class="space-y-1 w-full">
                  <div class="flex items-center justify-between w-full">
                    <span class="text-xs font-extrabold text-main">Level {{ elev.level }}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-bold">
                      {{ elev.dp }}
                    </span>
                  </div>
                  <div class="text-[11px] font-mono text-primary break-words leading-snug">{{ elev.sysToken }}</div>
                </div>
                <div class="space-y-0.5 pt-2 border-t border-outline-sub/50 w-full">
                  <div class="text-[10px] font-semibold text-main">{{ elev.pairedSurface }}</div>
                  <div class="text-[10px] text-muted leading-snug">{{ elev.usage }}</div>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- 5.2 Por qué, Cuándo y Cómo -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          @for (rule of applyingElevationPrinciples; track rule.id) {
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-main">
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">{{ rule.icon }}</span>
                <span>{{ rule.title }}</span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                <strong class="text-main">Por qué:</strong> {{ rule.why }}
              </p>
              <p class="text-[11px] text-muted leading-relaxed">
                <strong class="text-primary">Cómo aplicarlo:</strong> {{ rule.howToApply }}
              </p>
            </m3-card>
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
      </m3-card>
      }
    </div>
  `
})
export class StylesShapeElevationSectionComponent {
  readonly showShape = input<boolean>(true);
  readonly showElevation = input<boolean>(true);
  readonly isMorphed = model.required<boolean>();
  readonly selectedMorphChips = model.required<readonly string[]>();
  readonly copyToken = output<StylesCopyRequest>();

  readonly shapeSpecs = SHAPE_CORNER_10_SPECS;
  readonly shapePrinciples = SHAPE_PRINCIPLES_SPECS;
  readonly shapeMorphMechanisms = SHAPE_MORPH_MECHANISMS_SPECS;
  readonly elevationSpecs = ELEVATION_6_SPECS;
  readonly applyingElevationPrinciples = APPLYING_ELEVATION_PRINCIPLES;
  readonly componentElevationMatrix = COMPONENT_ELEVATION_MATRIX;

  readonly isCardMorphed = signal<boolean>(false);
  readonly concentricPadding = signal<number>(16);
  readonly elevationSimMode = signal<ElevationSimMode>('hover');

  readonly concentricInnerRadius = computed(() => Math.max(4, 28 - this.concentricPadding()));

  readonly elevationSimBadge = computed(() => {
    const mode = this.elevationSimMode();
    if (mode === 'tonal') return 'Level 0 (0dp)';
    if (mode === 'hover') return 'Level 2 (3dp)';
    return 'Level 3 (6dp)';
  });

  readonly elevationSimCardClass = computed(() => {
    const mode = this.elevationSimMode();
    if (mode === 'tonal') return 'bg-surface-highest border-outline-sub shadow-m3-level0';
    if (mode === 'hover') return 'bg-surface-low border-primary/50 shadow-m3-level2 -translate-y-0.5';
    return 'bg-surface-high border-primary shadow-m3-level3 -translate-y-1';
  });

  readonly elevationSimExplanation = computed(() => {
    const mode = this.elevationSimMode();
    if (mode === 'tonal') {
      return 'Las cards Bento quietas no usan sombras: el contraste tonal de surface-container-highest sobre el lienzo ya las separa limpiamente sin ensuciar el Dark Mode.';
    }
    if (mode === 'hover') {
      return 'Al pasar el puntero sobre una tarjeta accionable o Elevated, sube +1 nivel (1dp → 3dp) combinando elevación Z con State Layer neutro (8% on-surface).';
    }
    return 'Menús, sheets y diálogos flotan sobre contenido que hace scroll detrás: requieren Level 3 (6dp) y un Scrim para cortar la atención del plano base.';
  });

  readonly morphChips: readonly { id: string; label: string; icon: string }[] = [
    { id: 'oklch', label: 'OKLCH', icon: 'palette' },
    { id: 'springs', label: 'Springs', icon: 'animation' },
    { id: 'tokens', label: 'Tokens', icon: 'hub' }
  ];

  readonly canonicalPolygons: readonly { name: string; constant: string; path: string }[] = [
    { name: 'Burst', constant: 'M3_SOFT_BURST_PATH', path: M3_SOFT_BURST_PATH },
    { name: 'Cookie9', constant: 'M3_COOKIE9_PATH', path: M3_COOKIE9_PATH },
    { name: 'Pentág.', constant: 'M3_PENTAGON_PATH', path: M3_PENTAGON_PATH },
    { name: 'Pill', constant: 'M3_PILL_PATH', path: M3_PILL_PATH },
    { name: 'Sunny', constant: 'M3_SUNNY_PATH', path: M3_SUNNY_PATH },
    { name: 'Cookie4', constant: 'M3_COOKIE4_PATH', path: M3_COOKIE4_PATH },
    { name: 'Oval', constant: 'M3_OVAL_PATH', path: M3_OVAL_PATH }
  ];

  toggleMorphChip(chipId: string): void {
    this.selectedMorphChips.update((current) =>
      current.includes(chipId) ? current.filter((id) => id !== chipId) : [...current, chipId]
    );
  }
}
