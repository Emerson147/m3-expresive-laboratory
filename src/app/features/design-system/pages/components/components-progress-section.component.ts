import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import {
  M3CircularProgressComponent,
  M3LinearProgressComponent
} from '../../../../shared/components/progress';
import { observePrefersReducedMotion } from '../../../../shared/components/progress/progress-motion.controller';
import {
  DEFAULT_LINEAR_AMPLITUDE_DP,
  DEFAULT_LINEAR_WAVELENGTH_DP,
  DEFAULT_WAVE_SPEED_DP_PER_SEC,
  evalEmphasizedDecelerate,
  evaluateWaveAmplitudeEnvelope
} from '../../../../shared/components/progress/progress-motion.util';
import { M3SliderComponent } from '../../../../shared/components/slider/slider.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { ComponentsLoadingPanelComponent } from './components-loading-panel.component';
import {
  ARCHITECTURE_QUICK_GUIDE_ROWS,
  LOADING_TIMING_SPECS,
  PROGRESS_DECISION_MATRIX,
  PROGRESS_GUIDELINES_SPECS
} from './components-specs.data';

type ProgressColorKind = 'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color';

const PROGRESS_COLOR_SWATCHES: readonly {
  id: ProgressColorKind;
  label: string;
  dotClass: string;
  ringClass: string;
}[] = [
  { id: 'primary', label: 'Color Primary', dotClass: 'bg-primary', ringClass: 'ring-primary' },
  { id: 'secondary', label: 'Color Secondary', dotClass: 'bg-secondary', ringClass: 'ring-secondary' },
  { id: 'tertiary', label: 'Color Tertiary', dotClass: 'bg-tertiary', ringClass: 'ring-tertiary' },
  { id: 'error', label: 'Color Error', dotClass: 'bg-error', ringClass: 'ring-error' },
  {
    id: 'four-color',
    label: 'Four-Color Multicolor (Circular Indeterminado)',
    dotClass: 'bg-gradient-to-tr from-primary via-tertiary to-error',
    ringClass: 'ring-primary'
  }
];

@Component({
  selector: 'app-components-progress-section',
  standalone: true,
  imports: [
    ComponentsLoadingPanelComponent,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3ChipComponent,
    M3CircularProgressComponent,
    M3LinearProgressComponent,
    M3SliderComponent,
    M3SwitchComponent,
    M3TabsComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">hourglass_empty</span>
            Pilar 3 • Communication &amp; Feedback (Progress &gt;5s · Loading &lt;5s)
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Progress Engine (<code class="font-mono text-primary">Wavy</code>) &amp; Shape-Morphing Loader
          </h3>
          <p class="text-xs text-muted max-w-3xl leading-relaxed">
            Elegí la pestaña según duración de espera: barras y anillos sinusoidales <strong>&gt;5s</strong>, polígonos orgánicos <strong>200ms–5s</strong> o la matriz ejecutiva de decisión.
          </p>
        </div>

        @if (activeProgressTab() === 'progress') {
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <m3-button
              variant="outlined"
              size="sm"
              [toggle]="true"
              icon="straighten"
              [(selected)]="blueprint">
              Modo Blueprint (Cotas)
            </m3-button>
            <m3-button
              variant="tonal"
              size="sm"
              [toggle]="true"
              [icon]="paused() ? 'play_arrow' : 'pause'"
              [(selected)]="paused">
              {{ paused() ? 'Reanudar Onda' : 'Pausar Onda' }}
            </m3-button>
            <m3-button
              variant="outlined"
              size="sm"
              [toggle]="true"
              icon="waves"
              [(selected)]="wavy">
              {{ wavy() ? 'Ondas (Wavy)' : 'Recto (Classic)' }}
            </m3-button>
          </div>
        }
      </div>

      <m3-tabs
        variant="primary"
        idPrefix="comp-progress-tab"
        ariaLabel="Submódulos de Progress y Loading"
        [tabs]="progressTabs"
        [(value)]="activeProgressTab" />

      <!-- TAB 1: PROGRESS INDICATORS (> 5s) -->
      @if (activeProgressTab() === 'progress') {
        <div id="comp-progress-panel-wavy" role="tabpanel" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-7 flex flex-col gap-6">
              <!-- Escena Oficial 0 -> 100% -->
              <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-4">
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

                <div class="min-h-[112px] flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 py-3 px-4 rounded-m3-lg bg-surface border border-outline-sub/60">
                  <div class="w-full max-w-[230px]">
                    <m3-linear-progress
                      [value]="showcaseAutoProgress()"
                      [color]="linearColor()"
                      [wavy]="wavy()"
                      [paused]="!showcasePlaying() || paused()"
                      [showStop]="showStop()"
                      customClass="m3-progress-raf-driven"
                      size="md" />
                  </div>
                  <div class="shrink-0">
                    <m3-circular-progress
                      [value]="showcaseAutoProgress()"
                      [color]="color()"
                      [wavy]="wavy()"
                      [paused]="!showcasePlaying() || paused()"
                      customClass="m3-progress-raf-driven"
                      size="md" />
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-outline-sub/70 text-xs text-muted gap-3">
                  <span>Avance con <code>emphasized-decelerate</code> (<code>400ms</code>) y atenuación de amplitud a destino <code>A(p) &rarr; 0</code> en <code>200ms</code>.</span>
                  <m3-button
                    variant="tonal"
                    size="sm"
                    [iconOnly]="true"
                    [icon]="showcasePlaying() ? 'pause' : 'play_arrow'"
                    [ariaLabel]="showcasePlaying() ? 'Pausar ciclo automático' : 'Reanudar ciclo automático'"
                    (action)="showcasePlaying.update(v => !v)" />
                </div>
              </m3-card>

              <!-- 1. Linear Wavy -->
              <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-4">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h4 class="text-title-sm font-bold text-main">1. Linear Wavy Progress Indicator</h4>
                    <p class="text-xs text-muted mt-0.5">
                      Onda viajera <code>y(x,t) = y_c + A(p)·sin(2πx/λ − φ(t))</code> con pista discontinua y Stop Dot canónico.
                    </p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sec-box text-on-sec-box">
                    {{ indeterminate() ? 'Indeterminate' : 'Determinate' }}
                  </span>
                </div>

                <div class="space-y-4" [attr.dir]="rtl() ? 'rtl' : 'ltr'">
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-medium text-muted gap-2 flex-wrap">
                      <span>Variante Estándar (Stroke: 4dp, H: {{ labLinearStdRef()?.containerHeight() ?? 10 }}dp)</span>
                      <span class="font-mono">A_ef = <strong class="text-primary">{{ effectiveAmplitude().toFixed(2) }}</strong> dp</span>
                    </div>
                    <div class="w-full rounded-m3-lg p-3.5 bg-surface border border-outline-sub/70">
                      <m3-linear-progress
                        #labLinearStd
                        [value]="labProgressValue()"
                        [color]="linearColor()"
                        [wavy]="wavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="paused()"
                        [blueprint]="blueprint()"
                        [showStop]="showStop()"
                        size="md" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs font-medium text-muted gap-2 flex-wrap">
                      <span>Variante Thick (Stroke: 8dp, H: {{ labLinearThickRef()?.containerHeight() ?? 14 }}dp)</span>
                      <span class="font-mono">Gap = 4dp • Stop Dot Ø 4dp (r = 2dp)</span>
                    </div>
                    <div class="w-full rounded-m3-lg p-3.5 bg-surface border border-outline-sub/70">
                      <m3-linear-progress
                        #labLinearThick
                        [value]="labProgressValue()"
                        [color]="linearColor()"
                        [wavy]="wavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="paused()"
                        [blueprint]="blueprint()"
                        [showStop]="showStop()"
                        size="lg" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div class="rounded-m3-lg p-3 bg-surface border border-outline-sub/70 space-y-2">
                      <div class="flex justify-between text-[11px] font-mono text-muted">
                        <span>Streaming + Buffer (8dp)</span>
                        <span>{{ indeterminate() ? 'Dual-pulse' : 'Buf ' + buffer() + '%' }}</span>
                      </div>
                      <m3-linear-progress
                        [value]="labProgressValue()"
                        [buffer]="labProgressBuffer()"
                        [color]="linearColor()"
                        [wavy]="wavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="paused()"
                        [blueprint]="blueprint()"
                        [showStop]="showStop()"
                        size="lg" />
                    </div>

                    <div class="rounded-m3-lg p-3 bg-surface border border-outline-sub/70 space-y-2">
                      <div class="flex justify-between text-[11px] font-mono text-muted">
                        <span>Compact / Edge (2dp)</span>
                        <span>sm • min 40dp</span>
                      </div>
                      <m3-linear-progress
                        [value]="labProgressValue()"
                        [color]="linearColor()"
                        [wavy]="wavy()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="paused()"
                        [blueprint]="blueprint()"
                        [showStop]="showStop()"
                        size="sm" />
                    </div>
                  </div>
                </div>
              </m3-card>

              <!-- 2. Circular Wavy -->
              <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-4">
                <div>
                  <h4 class="text-title-sm font-bold text-main">2. Circular Wavy Progress Indicator</h4>
                  <p class="text-xs text-muted mt-0.5">
                    Coordenadas polares <code>r(θ,t) = R₀ + A(p)·sin(Nθ − φ(t))</code> con <code>N = round(2πR₀ / λ_circ)</code>.
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="rounded-m3-lg p-4 bg-surface border border-outline-sub/70 flex items-center gap-4">
                    <div class="w-20 h-20 flex items-center justify-center shrink-0">
                      <m3-circular-progress
                        #labCircularMd
                        size="md"
                        [value]="labProgressValue()"
                        [color]="color()"
                        [wavy]="wavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="paused()"
                        [blueprint]="blueprint()" />
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

                  <div class="rounded-m3-lg p-4 bg-surface border border-outline-sub/70 flex items-center gap-4">
                    <div class="w-24 h-24 flex items-center justify-center shrink-0">
                      <m3-circular-progress
                        #labCircularLg
                        [diameter]="84"
                        [value]="labProgressValue()"
                        [color]="color()"
                        [wavy]="wavy()"
                        [amplitude]="labProgressAmplitude()"
                        [wavelength]="labProgressWavelength()"
                        [speed]="labProgressSpeed()"
                        [paused]="paused()"
                        [blueprint]="blueprint()" />
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

                <div class="pt-3 border-t border-outline-sub flex items-center justify-between flex-wrap gap-4">
                  <div class="flex items-center gap-3">
                    <m3-circular-progress size="sm" [value]="labProgressValue()" [color]="color()" [paused]="paused()" [wavy]="false" />
                    <span class="text-xs font-mono text-muted">24dp (sm • plano en tamaños chicos)</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <m3-circular-progress
                      [value]="null"
                      size="md"
                      [wavy]="wavy()"
                      [amplitude]="labProgressAmplitude()"
                      [wavelength]="labProgressWavelength()"
                      [speed]="labProgressSpeed()"
                      [paused]="paused()"
                      [blueprint]="blueprint()"
                      color="four-color" />
                    <span class="text-xs font-mono font-bold text-primary">Four-Color (Indeterminate)</span>
                  </div>
                </div>
              </m3-card>
            </div>

            <!-- Columna derecha: Parámetros y Ecuaciones -->
            <aside class="lg:col-span-5 flex flex-col gap-6">
              <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-4">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="text-title-sm font-bold text-main">Parámetros Matemáticos en Tiempo Real</h4>
                  <m3-button variant="tonal" size="xs" icon="restart_alt" (action)="resetWaveDefaults()">
                    Defaults M3
                  </m3-button>
                </div>

                <div class="space-y-2">
                  <m3-slider
                    customId="lab-progress-norm"
                    label="Progreso normalizado (p)"
                    unit="%"
                    size="sm"
                    [min]="0"
                    [max]="100"
                    [step]="0.5"
                    [disabled]="indeterminate()"
                    [value]="value()"
                    (valueChange)="onProgressValueChange($event)" />
                  <div class="text-[11px] font-mono text-muted flex items-center justify-between">
                    <span>p = {{ (value() / 100).toFixed(2) }}</span>
                    <span>A(p) = {{ envelope().factor.toFixed(2) }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5 pt-1">
                    @for (preset of waveProgressPresets; track preset.value) {
                      <m3-chip
                        type="filter"
                        [selected]="!indeterminate() && value() === preset.value"
                        (action)="applyWaveProgressPreset(preset.value)">
                        {{ preset.label }}
                      </m3-chip>
                    }
                  </div>
                </div>

                <m3-slider
                  customId="lab-wavelength"
                  label="Longitud de onda (λ)"
                  unit=" dp"
                  size="sm"
                  [min]="16"
                  [max]="80"
                  [step]="1"
                  [disabled]="!wavy()"
                  [value]="wavelength()"
                  (valueChange)="wavelength.set($event)" />

                <m3-slider
                  customId="lab-amplitude"
                  label="Amplitud máxima (A_max)"
                  unit=" dp"
                  size="sm"
                  [min]="0"
                  [max]="8"
                  [step]="0.2"
                  [disabled]="!wavy()"
                  [value]="amplitude()"
                  (valueChange)="amplitude.set($event)" />

                <div class="space-y-1">
                  <m3-slider
                    customId="lab-speed"
                    label="Velocidad de fase (v)"
                    unit=" dp/s"
                    size="sm"
                    [min]="0"
                    [max]="120"
                    [step]="2"
                    [disabled]="!wavy()"
                    [value]="speed()"
                    (valueChange)="speed.set($event)" />
                  <div class="text-[10px] font-mono text-muted text-right">
                    Frecuencia angular: {{ wavePhaseHz().toFixed(2) }} Hz
                  </div>
                </div>

                <div class="pt-3 border-t border-outline-sub space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <m3-switch
                      customId="lab-progress-indeterminate"
                      label="Modo Indeterminado"
                      iconMode="both"
                      [(checked)]="indeterminate" />

                    <m3-switch
                      customId="lab-progress-stop"
                      label="Stop Dot 4dp"
                      iconMode="both"
                      [(checked)]="showStop" />
                  </div>

                  <div class="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-outline-sub/60">
                    <m3-button-group
                      variant="connected"
                      size="xs"
                      selectionMode="single"
                      ariaLabel="Dirección de barra lineal"
                      [options]="progressDirOptions"
                      [value]="[rtl() ? 'rtl' : 'ltr']"
                      (selectionChange)="onProgressDirChange($event)" />

                    <div class="flex items-center gap-5 py-1" role="group" aria-label="Color de Progress Indicator">
                      @for (swatch of progressColorSwatches; track swatch.id) {
                        <button
                          type="button"
                          (click)="color.set(swatch.id)"
                          [class.ring-2]="color() === swatch.id"
                          [class]="'touch-target-48 focus-ring-m3 w-6 h-6 rounded-full ring-offset-1 cursor-pointer ' + swatch.dotClass + ' ' + swatch.ringClass"
                          [attr.aria-label]="swatch.label"></button>
                      }
                    </div>
                  </div>
                </div>
              </m3-card>

              <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-3">
                <h4 class="font-bold text-sm text-main">Ecuaciones &amp; Telemetría A(p)</h4>
                <div class="p-3.5 rounded-m3-lg bg-surface border border-outline-sub font-mono text-[11px] leading-relaxed space-y-1">
                  <div>
                    f(p) = <strong class="text-primary">{{ envelope().factor.toFixed(3) }}</strong>
                    <span class="text-muted"> ({{ envelope().zoneLabel }})</span>
                  </div>
                  <div>
                    A(p) = A_max · f(p) = <strong class="text-primary">{{ effectiveAmplitude().toFixed(2) }} dp</strong>
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
                  Activá <strong>Modo Blueprint (Cotas)</strong> arriba para ver las líneas guía de <code>±A(p)</code>, la brecha de <code>4dp</code> y el punto de parada incrustado.
                </p>
              </m3-card>
            </aside>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
            @for (guide of progressDecisionMatrix; track guide.title) {
              <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-2">
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
              </m3-card>
            }
          </div>

          <div class="p-4 bg-surface-high rounded-m3-xl border border-outline-sub space-y-2.5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">code</span>
                <span class="text-xs font-bold text-main">Snippet Angular generado con tus controles Wavy / Linear / Circular</span>
              </div>
              <m3-button
                variant="filled"
                size="xs"
                icon="content_copy"
                (action)="copyText.emit({ text: generatedProgressSnippet(), message: 'Snippet M3 Progress Indicators copiado al portapapeles' })">
                Copiar snippet
              </m3-button>
            </div>
            <pre class="p-3 rounded-m3-lg bg-surface border border-outline-sub text-[11px] font-mono text-main overflow-x-auto leading-relaxed">{{ generatedProgressSnippet() }}</pre>
          </div>
        </div>
      }

      <!-- TAB 2: LOADING INDICATOR (< 5s MORPHING) -->
      @if (activeProgressTab() === 'loading') {
        <div id="comp-progress-panel-loading" role="tabpanel">
          <app-components-loading-panel (copyText)="copyText.emit($event)" />
        </div>
      }

      <!-- TAB 3: UMBRALES TEMPORALES, BOTONES LOADING, SKELETON & GLOSARIO -->
      @if (activeProgressTab() === 'matrix') {
        <div id="comp-progress-panel-matrix" role="tabpanel" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="lg:col-span-5 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">Umbrales Temporales, Botones &amp; Skeleton</span>
                <m3-switch
                  customId="lab-skeleton-switch"
                  label="Contenido listo"
                  iconMode="both"
                  [(checked)]="demoSkeletonLoaded" />
              </div>

              <div class="grid grid-cols-3 gap-2">
                @for (rule of loadingTimingSpecs; track rule.windowLabel) {
                  <div class="p-2.5 bg-surface rounded-m3-md border border-outline-sub">
                    <span class="text-[11px] font-extrabold text-primary font-mono block">{{ rule.windowLabel }}</span>
                    <span class="text-[10px] font-semibold text-main block mt-0.5">{{ rule.componentToUse }}</span>
                  </div>
                }
              </div>

              <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div class="flex items-center gap-2">
                  <m3-button variant="filled" size="sm" [loading]="true">Procesando...</m3-button>
                  <m3-button variant="outlined" size="sm" [loading]="true">Sincronizando</m3-button>
                </div>
                <span class="text-[10px] font-mono text-muted">currentColor • ≥ 3:1</span>
              </div>

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
                    <div class="w-9 h-9 rounded-full bg-primary-box text-on-primary-box flex items-center justify-center font-bold text-xs shrink-0">M3</div>
                    <div class="min-w-0">
                      <h5 class="text-xs font-bold text-main truncate">Material 3 Expressive</h5>
                      <p class="text-[11px] text-muted truncate">Zero Layout Shift completado</p>
                    </div>
                  </div>
                }
              </div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="lg:col-span-7 space-y-3">
              <span class="text-xs font-bold text-main block">Directrices M3 Oficiales (Checklist)</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                @for (guide of progressGuidelinesSpecs; track guide.title) {
                  <div class="p-3 rounded-m3-md bg-surface border border-outline-sub text-[11px] leading-snug space-y-1">
                    <strong class="text-primary font-bold block">{{ guide.title }}</strong>
                    <span class="text-muted block">{{ guide.rule }}</span>
                  </div>
                }
              </div>
            </m3-card>
          </div>

          <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-outline-sub">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">Glosario Maestro M3 Expressive • Referencia Ejecutiva</span>
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
          </m3-card>
        </div>
      }
    </m3-card>
  `
})
export class ComponentsProgressSectionComponent {
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private showcaseElapsedSec = 0;

  readonly copyText = output<ClipboardCopyPayload>();

  readonly labLinearStdRef = viewChild<M3LinearProgressComponent>('labLinearStd');
  readonly labLinearThickRef = viewChild<M3LinearProgressComponent>('labLinearThick');
  readonly labCircularMdRef = viewChild<M3CircularProgressComponent>('labCircularMd');
  readonly labCircularLgRef = viewChild<M3CircularProgressComponent>('labCircularLg');
  private readonly phiTelemetryReadoutRef = viewChild<ElementRef<HTMLElement>>('phiTelemetryReadout');

  readonly progressTabs: M3TabItem[] = [
    { id: 'progress', label: 'Progress (>5s Wavy)', icon: 'linear_scale', panelId: 'comp-progress-panel-wavy' },
    { id: 'loading', label: 'Loading Indicator (<5s)', icon: 'interests', panelId: 'comp-progress-panel-loading' },
    { id: 'matrix', label: 'Umbrales & Guía', icon: 'menu_book', panelId: 'comp-progress-panel-matrix' }
  ];

  readonly progressDirOptions: M3ButtonGroupOption[] = [
    { id: 'ltr', label: 'LTR' },
    { id: 'rtl', label: 'RTL' }
  ];

  readonly loadingTimingSpecs = LOADING_TIMING_SPECS;
  readonly progressGuidelinesSpecs = PROGRESS_GUIDELINES_SPECS;
  readonly progressDecisionMatrix = PROGRESS_DECISION_MATRIX;
  readonly architectureQuickGuideRows = ARCHITECTURE_QUICK_GUIDE_ROWS;
  readonly progressColorSwatches = PROGRESS_COLOR_SWATCHES;

  readonly waveProgressPresets = [
    { value: 1, label: '1% (Punto)' },
    { value: 4, label: '4% (Rampa inicio)' },
    { value: 50, label: '50% (Pleno)' },
    { value: 97, label: '97% (Rampa fin)' },
    { value: 100, label: '100% (Destino)' }
  ] as const;

  readonly activeProgressTab = signal<string>('progress');
  readonly value = signal<number>(65);
  readonly buffer = signal<number>(80);
  readonly indeterminate = signal<boolean>(false);
  readonly wavy = signal<boolean>(true);
  readonly showStop = signal<boolean>(true);
  readonly rtl = signal<boolean>(false);
  readonly amplitude = signal<number>(DEFAULT_LINEAR_AMPLITUDE_DP);
  readonly wavelength = signal<number>(DEFAULT_LINEAR_WAVELENGTH_DP);
  readonly speed = signal<number>(DEFAULT_WAVE_SPEED_DP_PER_SEC);
  readonly paused = signal<boolean>(false);
  readonly blueprint = signal<boolean>(false);
  readonly color = signal<ProgressColorKind>('primary');

  readonly showcasePlaying = signal<boolean>(true);
  readonly showcaseAutoProgress = signal<number>(0);
  readonly showcaseAutoPercent = computed(() => Math.round(this.showcaseAutoProgress()));
  readonly demoSkeletonLoaded = signal<boolean>(false);
  private readonly prefersReducedMotion = observePrefersReducedMotion();

  readonly labProgressValue = computed(() => (this.indeterminate() ? null : this.value()));
  readonly labProgressBuffer = computed(() => (this.indeterminate() ? null : this.buffer()));
  readonly labProgressAmplitude = computed(() => (this.wavy() ? this.amplitude() : null));
  readonly labProgressWavelength = computed(() => (this.wavy() ? this.wavelength() : null));
  readonly labProgressSpeed = computed(() => (this.wavy() ? this.speed() : null));

  readonly linearColor = computed<'primary' | 'secondary' | 'tertiary' | 'error'>(() => {
    const col = this.color();
    return col === 'four-color' ? 'primary' : col;
  });

  readonly envelope = computed(() =>
    this.indeterminate()
      ? { factor: 1, zone: 'full' as const, zoneLabel: 'Pulso activo indeterminado' }
      : evaluateWaveAmplitudeEnvelope(this.value() / 100)
  );

  readonly effectiveAmplitude = computed(() => this.amplitude() * this.envelope().factor);
  readonly waveNumberK = computed(() => (2 * Math.PI) / this.wavelength());
  readonly circularWavelength = computed(() => Math.max(8, this.wavelength() * 0.375));
  readonly wavePhaseHz = computed(() => this.speed() / this.wavelength());

  readonly generatedProgressSnippet = computed(() => {
    const linearAttrs = [
      `[value]="${this.indeterminate() ? 'null' : this.value()}"`,
      `[wavy]="${this.wavy()}"`,
      `color="${this.linearColor()}"`
    ];
    if (this.wavy()) {
      linearAttrs.push(`[amplitude]="${this.amplitude().toFixed(1)}"`);
      linearAttrs.push(`[wavelength]="${this.wavelength()}"`);
      linearAttrs.push(`[speed]="${this.speed()}"`);
    }
    if (!this.indeterminate()) {
      linearAttrs.push(`[buffer]="${this.buffer()}"`);
      linearAttrs.push(`[showStop]="${this.showStop()}"`);
    }
    if (this.rtl()) {
      linearAttrs.push('dir="rtl"');
    }
    if (this.blueprint()) {
      linearAttrs.push('[blueprint]="true"');
    }
    if (this.paused()) {
      linearAttrs.push('[paused]="true"');
    }
    linearAttrs.push('ariaLabel="Sincronizando reporte..."');

    const circAttrs = [
      `[value]="${this.indeterminate() ? 'null' : this.value()}"`,
      '[diameter]="48"',
      `[wavy]="${this.wavy()}"`,
      `color="${this.color()}"`
    ];
    if (this.wavy()) {
      circAttrs.push(`[amplitude]="${this.amplitude().toFixed(1)}"`);
      circAttrs.push(`[wavelength]="${this.wavelength()}"`);
      circAttrs.push(`[speed]="${this.speed()}"`);
    }
    if (this.blueprint()) {
      circAttrs.push('[blueprint]="true"');
    }
    if (this.paused()) {
      circAttrs.push('[paused]="true"');
    }
    circAttrs.push('ariaLabel="Progreso circular..."');

    return `<m3-linear-progress\n  ${linearAttrs.join('\n  ')} />\n\n<m3-circular-progress\n  ${circAttrs.join('\n  ')} />`;
  });

  constructor() {
    effect(onCleanup => {
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

      const isPaused = this.paused();
      const phiRunning = Boolean(readEl && stdBar) && this.wavy() && !isPaused && this.speed() > 0;
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

  onProgressValueChange(val: number): void {
    if (!Number.isNaN(val)) {
      this.value.set(val);
      this.buffer.set(Math.min(100, val + 15));
    }
  }

  applyWaveProgressPreset(percent: number): void {
    this.indeterminate.set(false);
    this.value.set(percent);
    this.buffer.set(Math.min(100, percent + 15));
  }

  resetWaveDefaults(): void {
    this.value.set(65);
    this.buffer.set(80);
    this.amplitude.set(DEFAULT_LINEAR_AMPLITUDE_DP);
    this.wavelength.set(DEFAULT_LINEAR_WAVELENGTH_DP);
    this.speed.set(DEFAULT_WAVE_SPEED_DP_PER_SEC);
    this.indeterminate.set(false);
    this.wavy.set(true);
  }

  onProgressDirChange(selected: string[]): void {
    if (selected[0]) {
      this.rtl.set(selected[0] === 'rtl');
    }
  }
}
