import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild
} from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SliderComponent } from '../../../../shared/components/slider/slider.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import {
  M3_CIRCLE_PATH,
  M3_COOKIE4_PATH,
  M3_COOKIE9_PATH,
  M3_LOADING_SHAPE_NAMES,
  M3_OVAL_PATH,
  M3_PENTAGON_PATH,
  M3_PILL_PATH,
  M3_SOFT_BURST_PATH,
  M3_SUNNY_PATH,
  M3LoadingIndicatorColor,
  M3LoadingIndicatorComponent
} from '../../../../shared/components/progress';
import { observePrefersReducedMotion } from '../../../../shared/components/progress/progress-motion.controller';
import {
  DEFAULT_LOADING_DIAMETER_DP,
  LOADING_ACTIVE_SHAPE_RATIO,
  MAX_LOADING_DIAMETER_DP,
  MIN_LOADING_DIAMETER_DP
} from '../../../../shared/components/progress/progress-motion.util';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { LOADING_DECISION_MATRIX } from './components-specs.data';

const LOADING_MODE_OPTIONS: M3ButtonGroupOption[] = [
  { id: 'indeterminate', label: 'Indeterminado (7)' },
  { id: 'determinate', label: 'Determinado [progress]' }
];

const LOADING_PROGRESS_PRESETS = [
  { val: 0, label: '0% Circle' },
  { val: 0.5, label: '50% Morph' },
  { val: 1, label: '100% SoftBurst' }
] as const;

const LOADING_COLOR_SWATCHES: readonly {
  id: M3LoadingIndicatorColor;
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
    label: 'Color Four-Color',
    dotClass: 'bg-gradient-to-tr from-primary via-tertiary to-error',
    ringClass: 'ring-primary'
  }
];

@Component({
  selector: 'app-components-loading-panel',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3ChipComponent,
    M3LoadingIndicatorComponent,
    M3SliderComponent,
    M3SwitchComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-outline-sub">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <span class="material-symbols-rounded text-base" aria-hidden="true">interests</span>
            Material 3 Expressive • Shape Morphing Loading Indicator (&lt; 5s)
          </div>
          <h4 class="text-title-md font-bold text-main">Loading Indicator vs. Progress Indicator</h4>
          <p class="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
            Reservado para esperas indeterminadas cortas de <code>200ms – 5s</code> y <em>Pull-to-refresh</em>. Muta entre sus <strong>7 formas canónicas M3</strong> (<em>SoftBurst → Cookie9 → Pentagon → Pill → Sunny → Cookie4 → Oval</em>) con resorte real (<code>0.6 / 200</code>) cada <code>650ms</code>, <code>+90°</code> y giro continuo de <code>4666ms</code>.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <m3-button
            variant="outlined"
            size="sm"
            [toggle]="true"
            [icon]="demoLoadingPaused() ? 'play_arrow' : 'pause'"
            [(selected)]="demoLoadingPaused">
            {{ demoLoadingPaused() ? 'Reanudar Resorte' : 'Pausar Resorte' }}
          </m3-button>
          <m3-button variant="outlined" size="sm" icon="restart_alt" (action)="resetLoadingDefaults()">
            Reset 48dp
          </m3-button>
          <m3-button variant="tonal" size="sm" icon="refresh" (action)="triggerPhotosRefresh()">
            Simular Pull-to-Refresh
          </m3-button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-7 space-y-5">
          <m3-card variant="filled" surface="high" padding="md" shape="xl" customClass="space-y-4">
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

            <div class="min-h-[248px] rounded-m3-lg bg-surface border border-outline-sub/80 flex flex-col items-center justify-center gap-3 p-4 relative overflow-hidden">
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
                  Modo Determinado (Pull-to-Refresh): <strong>{{ (demoLoadingProgress() * 100).toFixed(0) }}%</strong> • Circle +18° → SoftBurst
                } @else {
                  Modo Indeterminado: 7 polígonos • <code>N = 180</code> splines • {{ demoLoadingPaused() ? 'Pausado en cuadro actual' : '650ms spring + 90°' }}
                }
              </div>
            </div>

            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex flex-wrap items-center gap-1.5">
                @for (preset of loadingDiameterPresets; track preset.dp) {
                  <m3-chip
                    type="filter"
                    [selected]="demoLoadingDiameter() === preset.dp"
                    (action)="applyLoadingPreset(preset.dp, demoLoadingContained(), demoLoadingElevated())">
                    {{ preset.label }}
                  </m3-chip>
                }
              </div>

              <div class="flex items-center gap-2">
                <m3-button variant="outlined" size="xs" (action)="applyLoadingPreset(48, true, false)">
                  Contained 48dp
                </m3-button>
                <m3-button variant="tonal" size="xs" (action)="applyLoadingPreset(48, true, true)">
                  Pull Floating Pill
                </m3-button>
              </div>
            </div>
          </m3-card>

          <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-3">
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
          </m3-card>

          <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div class="md:col-span-6 space-y-3">
              <div>
                <span class="text-xs font-bold text-main uppercase tracking-wider block">Pull-to-Refresh • Gesto Determinado → Soltar</span>
                <p class="text-[11px] text-muted mt-1 leading-relaxed">
                  Mientras el usuario arrastra la lista (<code>[progress]</code> <code>0.0 → 1.0</code>), el loader emerge rotando <code>+18° → +108°</code> y transformando <strong>Circle</strong> en <strong>SoftBurst</strong>. Al soltar en <code>100%</code>, pasa al ciclo indeterminado.
                </p>
              </div>

              <div class="space-y-1.5 p-3 bg-surface rounded-m3-lg border border-outline-sub">
                <m3-slider
                  customId="lab-pull-gesture"
                  label="Simular arrastre manual (0→1)"
                  unit="%"
                  size="sm"
                  [min]="0"
                  [max]="100"
                  [step]="1"
                  [value]="demoPullGesturePercent()"
                  (valueChange)="onPullGesturePercentChange($event)" />
                <div class="text-[10px] text-muted">Arrastrá hasta 100% o tocá "Simular Pull-to-Refresh".</div>
              </div>
            </div>

            <div class="md:col-span-6 flex justify-center">
              <div class="w-64 bg-surface-lowest border-2 border-outline-sub rounded-[32px] p-3 shadow-lg space-y-2.5 relative overflow-hidden">
                <div class="flex items-center justify-between px-2.5 text-[10px] font-bold text-muted">
                  <span>9:30</span>
                  <div class="flex items-center gap-1" aria-hidden="true">
                    <span class="material-symbols-rounded text-xs">signal_cellular_alt</span>
                    <span class="material-symbols-rounded text-xs">wifi</span>
                    <span class="material-symbols-rounded text-xs">battery_full</span>
                  </div>
                </div>

                <div class="flex items-center justify-between px-1.5">
                  <h5 class="text-sm font-bold text-main tracking-tight">Photos</h5>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-base text-muted" aria-hidden="true">more_vert</span>
                    <div class="w-6 h-6 rounded-full bg-sec-box text-on-sec-box font-bold text-[11px] flex items-center justify-center">A</div>
                  </div>
                </div>

                <div class="h-44 bg-surface-low rounded-m3-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-outline-sub/60">
                  @if (demoPhotosRefreshing() || demoPullGestureProgress() > 0) {
                    <div class="m3-anim-item-in flex flex-col items-center gap-2">
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
                      <span class="material-symbols-rounded text-3xl text-primary" aria-hidden="true">photo_library</span>
                      <span class="text-xs font-bold text-main">Galería al día</span>
                      <span class="text-[11px] text-muted">Arrastrá el control o tocá "Simular Pull-to-Refresh"</span>
                    </div>
                  }
                </div>

                <div class="text-center text-[10px] text-muted">Pull-to-refresh • Elevated Floating Pill</div>
              </div>
            </div>
          </m3-card>
        </div>

        <div class="lg:col-span-5 space-y-4">
          <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-4">
            <div class="flex items-center justify-between gap-2">
              <h5 class="font-bold text-sm text-main">Parámetros en Tiempo Real</h5>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-outline-sub text-muted">
                M3 Specs P2
              </span>
            </div>

            <div class="space-y-1.5">
              <span class="text-xs font-semibold text-main block">Modo de Operación</span>
              <m3-button-group
                variant="connected"
                size="xs"
                selectionMode="single"
                ariaLabel="Modo de operación de Loading Indicator"
                [options]="loadingModeOptions"
                [value]="[demoLoadingDeterminate() ? 'determinate' : 'indeterminate']"
                (selectionChange)="onModeGroupChange($event)" />
            </div>

            <m3-slider
              customId="lab-loading-diameter"
              label="Diámetro caja ([diameter])"
              unit=" dp"
              size="sm"
              [min]="loadingMinDiameterDp"
              [max]="loadingMaxDiameterDp"
              [step]="2"
              [value]="demoLoadingDiameter()"
              (valueChange)="demoLoadingDiameter.set($event)" />

            <div class="space-y-1.5">
              <m3-slider
                customId="lab-loading-progress"
                label="Progreso [progress] (Circle → SoftBurst)"
                size="sm"
                [min]="0"
                [max]="1"
                [step]="0.01"
                [disabled]="!demoLoadingDeterminate()"
                [value]="demoLoadingProgress()"
                (valueChange)="demoLoadingProgress.set($event)" />
              @if (demoLoadingDeterminate()) {
                <div class="flex flex-wrap gap-1.5 pt-1">
                  @for (preset of loadingProgressPresets; track preset.val) {
                    <m3-chip
                      type="filter"
                      [selected]="demoLoadingProgress() === preset.val"
                      (action)="demoLoadingProgress.set(preset.val)">
                      {{ preset.label }}
                    </m3-chip>
                  }
                </div>
              }
            </div>

            <div class="pt-3 border-t border-outline-sub space-y-3">
              <div class="flex flex-wrap items-center gap-4">
                <m3-switch
                  customId="lab-loading-contained"
                  label="[contained]"
                  iconMode="both"
                  [(checked)]="demoLoadingContained" />
                <m3-switch
                  customId="lab-loading-elevated"
                  label="[elevated]"
                  iconMode="both"
                  [(checked)]="demoLoadingElevated" />
              </div>

              <div class="flex items-center gap-5 py-1" role="group" aria-label="Color de Loading Indicator">
                @for (swatch of loadingColorSwatches; track swatch.id) {
                  <button
                    type="button"
                    (click)="demoLoadingColor.set(swatch.id)"
                    [class.ring-2]="demoLoadingColor() === swatch.id"
                    [class]="'touch-target-48 focus-ring-m3 w-6 h-6 rounded-full ring-offset-1 cursor-pointer ' + swatch.dotClass + ' ' + swatch.ringClass"
                    [attr.aria-label]="swatch.label"></button>
                }
              </div>

              <p class="text-[11px] text-muted leading-normal">
                Usá <strong>Default</strong> sobre fondos limpios con contraste ≥ 3:1. Activá <code>[contained]="true"</code> (<code>primary-container</code>) cuando el loader va sobre fotos, mapas o contenido visual complejo.
              </p>
            </div>
          </m3-card>

          <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-3">
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
          </m3-card>
        </div>
      </div>

      <div class="pt-5 border-t border-outline-sub space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span class="text-xs font-bold text-primary uppercase tracking-wider block">Guía Rápida de Arquitectura • Loading Indicator</span>
            <h5 class="text-sm font-bold text-main">¿Cómo usar, dónde, por qué y para qué usar Loading Indicator?</h5>
          </div>
          <span class="text-[11px] font-mono text-muted">Regla temporal oficial M3: 200ms – 5s</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          @for (guide of loadingDecisionMatrix; track guide.title) {
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
              <span class="text-xs font-bold text-main">Snippet Angular generado con tu configuración actual</span>
            </div>
            <m3-button
              variant="filled"
              size="xs"
              icon="content_copy"
              (action)="copyText.emit({ text: generatedLoadingSnippet(), message: 'Snippet M3 Loading Indicator copiado al portapapeles' })">
              Copiar snippet
            </m3-button>
          </div>
          <pre class="p-3 rounded-m3-lg bg-surface border border-outline-sub text-[11px] font-mono text-main overflow-x-auto leading-relaxed">{{ generatedLoadingSnippet() }}</pre>
        </div>
      </div>
    </div>
  `
})
export class ComponentsLoadingPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;

  readonly copyText = output<ClipboardCopyPayload>();

  readonly labLoadingRef = viewChild<M3LoadingIndicatorComponent>('labLoading');
  private readonly loadingShapeReadoutRef = viewChild<ElementRef<HTMLElement>>('loadingShapeReadout');
  private readonly loadingSpringReadoutRef = viewChild<ElementRef<HTMLElement>>('loadingSpringReadout');
  private readonly loadingAngleReadoutRef = viewChild<ElementRef<HTMLElement>>('loadingAngleReadout');

  readonly loadingMinDiameterDp = MIN_LOADING_DIAMETER_DP;
  readonly loadingMaxDiameterDp = MAX_LOADING_DIAMETER_DP;
  readonly loadingCirclePath = M3_CIRCLE_PATH;
  readonly loadingDecisionMatrix = LOADING_DECISION_MATRIX;
  readonly loadingModeOptions = LOADING_MODE_OPTIONS;
  readonly loadingProgressPresets = LOADING_PROGRESS_PRESETS;
  readonly loadingColorSwatches = LOADING_COLOR_SWATCHES;

  readonly loadingCanonicalShapeCatalog = [
    { name: M3_LOADING_SHAPE_NAMES[0], path: M3_SOFT_BURST_PATH },
    { name: M3_LOADING_SHAPE_NAMES[1], path: M3_COOKIE9_PATH },
    { name: M3_LOADING_SHAPE_NAMES[2], path: M3_PENTAGON_PATH },
    { name: M3_LOADING_SHAPE_NAMES[3], path: M3_PILL_PATH },
    { name: M3_LOADING_SHAPE_NAMES[4], path: M3_SUNNY_PATH },
    { name: M3_LOADING_SHAPE_NAMES[5], path: M3_COOKIE4_PATH },
    { name: M3_LOADING_SHAPE_NAMES[6], path: M3_OVAL_PATH }
  ] as const;

  readonly loadingDiameterPresets = [
    { dp: 24, label: '24dp Mín' },
    { dp: 32, label: '32dp sm' },
    { dp: 48, label: '48dp Canónico' },
    { dp: 96, label: '96dp Media' },
    { dp: 160, label: '160dp Hero' },
    { dp: 240, label: '240dp Máx' }
  ] as const;

  readonly demoPhotosRefreshing = signal<boolean>(false);
  readonly demoPullGestureProgress = signal<number>(0);
  readonly demoLoadingDiameter = signal<number>(DEFAULT_LOADING_DIAMETER_DP);
  readonly demoLoadingContained = signal<boolean>(false);
  readonly demoLoadingElevated = signal<boolean>(false);
  readonly demoLoadingDeterminate = signal<boolean>(false);
  readonly demoLoadingProgress = signal<number>(0.45);
  readonly demoLoadingPaused = signal<boolean>(false);
  readonly demoLoadingColor = signal<M3LoadingIndicatorColor>('primary');
  private readonly prefersReducedMotion = observePrefersReducedMotion();

  readonly loadingEffectiveShapeDp = computed(() =>
    Math.round(this.demoLoadingDiameter() * LOADING_ACTIVE_SHAPE_RATIO * 10) / 10
  );
  readonly labLoadingProgressInput = computed<number | null>(() =>
    this.demoLoadingDeterminate() ? this.demoLoadingProgress() : null
  );
  readonly demoPhotosLoaderProgress = computed<number | null>(() =>
    this.demoPhotosRefreshing() ? null : this.demoPullGestureProgress() > 0 ? this.demoPullGestureProgress() : null
  );
  readonly demoPullGesturePercent = computed(() => Math.round(this.demoPullGestureProgress() * 100));

  readonly generatedLoadingSnippet = computed(() => {
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

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.refreshTimerId !== null) {
        clearTimeout(this.refreshTimerId);
        this.refreshTimerId = null;
      }
    });

    effect(onCleanup => {
      const loadingComponent = this.labLoadingRef();
      const loadingShapeEl = this.loadingShapeReadoutRef()?.nativeElement;
      const loadingSpringEl = this.loadingSpringReadoutRef()?.nativeElement;
      const loadingAngleEl = this.loadingAngleReadoutRef()?.nativeElement;
      const loadingPaused = this.demoLoadingPaused();
      const loadingDet = this.demoLoadingDeterminate();

      const syncLoadingTelemetry = () => {
        if (!loadingComponent) return;
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

      if (
        !isPlatformBrowser(this.platformId) ||
        typeof requestAnimationFrame !== 'function' ||
        this.prefersReducedMotion() ||
        !loadingComponent ||
        (!loadingShapeEl && !loadingSpringEl && !loadingAngleEl) ||
        loadingPaused ||
        loadingDet
      ) {
        onCleanup(() => {
          disposed = true;
        });
        return;
      }

      let frameId = 0;
      this.ngZone.runOutsideAngular(() => {
        const tick = () => {
          syncLoadingTelemetry();
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

  onModeGroupChange(selected: string[]): void {
    if (selected[0]) {
      this.demoLoadingDeterminate.set(selected[0] === 'determinate');
    }
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

  onPullGesturePercentChange(percent: number): void {
    if (!Number.isNaN(percent)) {
      if (this.refreshTimerId !== null) {
        clearTimeout(this.refreshTimerId);
        this.refreshTimerId = null;
      }
      this.demoPhotosRefreshing.set(false);
      this.demoPullGestureProgress.set(Math.min(1, Math.max(0, percent / 100)));
    }
  }
}
