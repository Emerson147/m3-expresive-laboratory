import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ContrastLevel } from '../../../../core/theme/theme.service';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import {
  SURFACE_HIERARCHY_SPECS,
  TONAL_PALETTE_FAMILIES,
  TonalPaletteFamily
} from './styles-specs.data';
import { StylesCopyRequest } from './styles-copy.model';

@Component({
  selector: 'app-styles-color-section',
  standalone: true,
  imports: [M3CardComponent, M3ChipComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">colorize</span>
            Caso 2 • Color System: Tonal Palettes, 8 Surfaces, 12 Fixed Roles &amp; 3 Contrast Levels
          </div>
          <h2 class="text-title-lg-emphasized text-main">
            Esquema Expresivo OKLCH + Roles Tonales Inteligentes
          </h2>
          <p class="text-xs text-muted max-w-3xl leading-relaxed">
            Alineado con <code class="font-mono text-main">m3.material.io/styles/color/system/overview</code>: la luminosidad perceptual OKLCH crece suavemente de <code class="font-mono text-primary">0.003 → 0.022</code> en Light (<code class="font-mono">neutral100 = 0</code>) y <code class="font-mono text-primary">0.012 → 0.030</code> en Dark. Probá cambiar el contraste global arriba en la Studio Bar o tocá cualquier swatch para copiar su variable.
          </p>
        </div>

        <div class="px-3 py-2 rounded-m3-lg bg-surface-low border border-outline-sub text-[11px] font-mono shrink-0 flex items-center gap-2">
          <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">contrast</span>
          <span>Contraste activo: <strong class="text-primary">{{ contrastLevelLabel() }}</strong></span>
        </div>
      </div>

      <!-- Regla didáctica rápida: Surface vs Container vs Fixed -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <m3-card variant="outlined" surface="low" padding="sm" shape="lg" customClass="space-y-1">
          <div class="text-xs font-bold text-main flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">layers</span>
            1. Surfaces (Estructura sin ruido)
          </div>
          <p class="text-[11px] text-muted leading-snug">
            Usá <code class="font-mono text-main">.bg-surface-*</code> para separar lienzo, sidebars y cards por tono en lugar de abusar de bordes o sombras.
          </p>
        </m3-card>

        <m3-card variant="filled" tone="primary" padding="sm" shape="lg" customClass="space-y-1">
          <div class="text-xs font-bold text-on-primary-box flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm" aria-hidden="true">auto_awesome</span>
            2. Containers (Énfasis adaptable)
          </div>
          <p class="text-[11px] text-on-primary-box/85 leading-snug">
            <code class="font-mono">primary-box / sec-box</code> pasan automáticamente de T90 (claro) en Light a T30 (oscuro) cuando activás Modo Oscuro.
          </p>
        </m3-card>

        <div class="p-3 rounded-m3-lg bg-tertiary-fixed text-on-tertiary-fixed border border-outline-sub/40 space-y-1">
          <div class="text-xs font-bold flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm" aria-hidden="true">lock</span>
            3. Fixed Roles (Invariantes)
          </div>
          <p class="text-[11px] opacity-90 leading-snug">
            <code class="font-mono">*-fixed</code> nunca invierte brillo en Dark Mode; ideal para badges sobre fotos, mapas o portadas.
          </p>
        </div>
      </div>

      <!-- Explorador Interactivo de Paletas Tonales (Reference Tokens 0..100) -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="text-xs font-bold text-main">
              1. Paletas Tonales de Referencia (<code class="font-mono text-primary">--md-ref-palette-*</code>)
            </div>
            <div class="text-[11px] text-muted">
              Fórmula activa: <code class="font-mono text-main">{{ activePalette().hueFormula }}</code> — {{ activePalette().chromaNote }}
            </div>
          </div>

          <div class="flex flex-wrap gap-2" role="group" aria-label="Familia tonal OKLCH">
            @for (pal of tonalPalettes; track pal.id) {
              <m3-chip
                type="filter"
                [selected]="selectedPaletteId() === pal.id"
                (action)="selectPalette(pal.id)">
                {{ pal.name }}
              </m3-chip>
            }
          </div>
        </div>

        <div class="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
          @for (stop of activePalette().stops; track stop) {
            <button
              type="button"
              (click)="inspectAndCopyTone(stop)"
              [attr.aria-pressed]="selectedToneStop() === stop"
              [attr.aria-label]="'Copiar token --md-ref-palette-' + activePalette().id + stop"
              [style.background-color]="'var(--md-ref-palette-' + activePalette().id + stop + ')'"
              [style.color]="stop >= 60 ? 'oklch(12% 0.02 var(--seed-hue))' : 'oklch(98% 0.01 var(--seed-hue))'"
              [class]="'state-layer focus-ring-m3 text-left rounded-m3-sm p-2 min-h-[68px] flex flex-col justify-between shadow-2xs transition-transform hover:scale-105 cursor-pointer ' + (selectedToneStop() === stop
                ? 'border-2 border-primary ring-2 ring-primary/30'
                : 'border border-outline-sub/40')">
              <div class="flex items-center justify-between gap-1 w-full">
                <span class="text-[10px] font-mono font-bold">T{{ stop }}</span>
                @if (stopKeyBadge(stop); as roleTag) {
                  <span class="text-[8px] font-mono font-bold px-1 rounded bg-black/20 backdrop-blur-[1px]">{{ roleTag }}</span>
                }
              </div>
              <span class="text-[9px] font-mono opacity-85 truncate">{{ activePalette().id }}{{ stop }}</span>
            </button>
          }
        </div>

        <div class="px-3.5 py-2.5 rounded-m3-md bg-surface-low border border-outline-sub flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div class="flex items-center gap-2 font-mono text-main">
            <span
              class="w-3.5 h-3.5 rounded-full border border-outline-sub inline-block shrink-0"
              [style.background-color]="'var(' + activeToneToken() + ')'"
              aria-hidden="true"></span>
            <span class="font-bold text-primary">{{ activeToneToken() }}</span>
          </div>
          <span class="text-muted">{{ activeToneGuidance() }}</span>
        </div>
      </div>

      <!-- 8 Superficies Tonales + Pares Semánticos + 12 Roles Fixed -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-7 space-y-2.5">
          <div class="text-xs font-bold text-main flex items-center justify-between gap-2 flex-wrap">
            <span>2. Jerarquía de las 8 Superficies Tonales (<code class="font-mono text-primary">--md-sys-color-surface*</code>)</span>
            <span class="text-[11px] font-mono text-muted">
              {{ isDarkMode() ? 'Dark (neutral4 → neutral24)' : 'Light (neutral100 → neutral87)' }}
            </span>
          </div>

          <div class="space-y-1.5">
            @for (surf of surfaceSpecs; track surf.sysToken) {
              <button
                type="button"
                (click)="copyToken.emit({ text: 'var(' + surf.sysToken + ')', message: 'Copiado .' + surf.tailwindClass + ' (' + surf.sysToken + ')' })"
                [style.background-color]="'var(' + surf.sysToken + ')'"
                class="state-layer focus-ring-m3 w-full text-left p-3 rounded-m3-md border border-outline-sub flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-main cursor-pointer">
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold">{{ surf.name }}</span>
                    <code class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface/75 border border-outline-sub/60 text-primary">
                      .{{ surf.tailwindClass }}
                    </code>
                  </div>
                  <div class="text-[11px] text-muted">{{ surf.usage }}</div>
                </div>
                <div class="flex items-center gap-2 text-[11px] font-mono shrink-0">
                  <span [class]="!isDarkMode() ? 'font-bold text-main underline' : 'text-muted'">
                    L: {{ surf.oklchLight }}
                  </span>
                  <span class="text-muted">•</span>
                  <span [class]="isDarkMode() ? 'font-bold text-main underline' : 'text-muted'">
                    D: {{ surf.oklchDark }}
                  </span>
                </div>
              </button>
            }
          </div>
        </div>

        <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="text-xs font-bold text-main">
              3. Pares Contenedor / On-Container (clic para copiar)
            </div>
            <div class="grid grid-cols-2 gap-2">
              @for (pair of semanticPairs; track pair.classes) {
                <button
                  type="button"
                  (click)="copyToken.emit({ text: pair.classes, message: 'Copiadas clases ' + pair.classes })"
                  [class]="'state-layer focus-ring-m3 p-3 rounded-m3-md text-xs font-bold flex items-center justify-between cursor-pointer ' + pair.classes">
                  <span>{{ pair.label }}</span>
                  <span [class]="'font-mono text-[10px] ' + pair.tagClass">{{ pair.tag }}</span>
                </button>
              }
            </div>
          </div>

          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-main flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">lock</span>
                4. Los 12 Roles Fixed (Invariantes Light/Dark)
              </span>
              <span class="text-[10px] font-mono text-muted">T90 / T80 / T10 / T30</span>
            </div>
            <p class="text-[11px] text-muted leading-relaxed">
              Conservan exactamente el mismo tono claro con tinta oscura incluso si pasás toda la app a Modo Oscuro arriba.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <button
                type="button"
                (click)="copyToken.emit({ text: 'bg-primary-fixed text-on-primary-fixed', message: 'Copiados roles Primary Fixed' })"
                class="focus-ring-m3 rounded-m3-sm overflow-hidden border border-outline-sub/40 cursor-pointer text-center">
                <div class="p-2 bg-primary-fixed text-on-primary-fixed">
                  <div>primary-fixed</div>
                  <div class="text-[10px] font-mono font-normal">on-primary-fixed (T90/T10)</div>
                </div>
                <div class="p-1.5 bg-primary-fixed-dim text-on-primary-fixed-variant text-[10px]">
                  <div class="font-bold">primary-fixed-dim</div>
                  <div class="font-mono font-normal">on-primary-fixed-variant (T80/T30)</div>
                </div>
              </button>
              <button
                type="button"
                (click)="copyToken.emit({ text: 'bg-secondary-fixed text-on-secondary-fixed', message: 'Copiados roles Secondary Fixed' })"
                class="focus-ring-m3 rounded-m3-sm overflow-hidden border border-outline-sub/40 cursor-pointer text-center">
                <div class="p-2 bg-secondary-fixed text-on-secondary-fixed">
                  <div>secondary-fixed</div>
                  <div class="text-[10px] font-mono font-normal">on-secondary-fixed (T90/T10)</div>
                </div>
                <div class="p-1.5 bg-secondary-fixed-dim text-on-secondary-fixed-variant text-[10px]">
                  <div class="font-bold">secondary-fixed-dim</div>
                  <div class="font-mono font-normal">on-secondary-fixed-variant (T80/T30)</div>
                </div>
              </button>
              <button
                type="button"
                (click)="copyToken.emit({ text: 'bg-tertiary-fixed text-on-tertiary-fixed', message: 'Copiados roles Tertiary Fixed' })"
                class="focus-ring-m3 rounded-m3-sm overflow-hidden border border-outline-sub/40 cursor-pointer text-center">
                <div class="p-2 bg-tertiary-fixed text-on-tertiary-fixed">
                  <div>tertiary-fixed</div>
                  <div class="text-[10px] font-mono font-normal">on-tertiary-fixed (T90/T10)</div>
                </div>
                <div class="p-1.5 bg-tertiary-fixed-dim text-on-tertiary-fixed-variant text-[10px]">
                  <div class="font-bold">tertiary-fixed-dim</div>
                  <div class="font-mono font-normal">on-tertiary-fixed-variant (T80/T30)</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </m3-card>
  `
})
export class StylesColorSectionComponent {
  readonly isDarkMode = input.required<boolean>();
  readonly contrastLevel = input.required<ContrastLevel>();

  readonly copyToken = output<StylesCopyRequest>();

  readonly tonalPalettes = TONAL_PALETTE_FAMILIES;
  readonly surfaceSpecs = SURFACE_HIERARCHY_SPECS;

  readonly semanticPairs: readonly { label: string; tag: string; classes: string; tagClass: string }[] = [
    { label: 'Primary', tag: 'on-primary', classes: 'bg-primary text-on-primary', tagClass: 'opacity-85' },
    { label: 'Primary Container', tag: 'T90 / T30', classes: 'bg-primary-box text-on-primary-box', tagClass: 'opacity-85' },
    { label: 'Secondary Box', tag: '+10° Hue', classes: 'bg-sec-box text-on-sec-box', tagClass: 'opacity-85' },
    { label: 'Tertiary Box', tag: '+65° Hue', classes: 'bg-tertiary-box text-on-tertiary-box', tagClass: 'opacity-85' },
    { label: 'Success Box', tag: 'Hue 155°', classes: 'bg-success-box text-on-success-box', tagClass: 'opacity-85' },
    { label: 'Warning Box', tag: 'Hue 65°', classes: 'bg-warning-box text-on-warning-box', tagClass: 'opacity-85' },
    { label: 'Error Box', tag: 'Hue 25°', classes: 'bg-error-box text-on-error-box', tagClass: 'opacity-85' },
    { label: 'Inverse Surface', tag: 'inverse', classes: 'bg-inverse-surface text-inverse-on-surface', tagClass: 'text-inverse-primary' }
  ];

  readonly selectedPaletteId = signal<TonalPaletteFamily['id']>('primary');
  readonly selectedToneStop = signal<number>(40);

  readonly contrastLevelLabel = computed(() => {
    const lvl = this.contrastLevel();
    if (lvl === 'high') return 'High (≥7:1)';
    if (lvl === 'medium') return 'Medium (≥3:1)';
    return 'Standard';
  });

  readonly activePalette = computed(() =>
    this.tonalPalettes.find((p) => p.id === this.selectedPaletteId()) ?? this.tonalPalettes[0]
  );

  readonly activeToneToken = computed(
    () => `--md-ref-palette-${this.selectedPaletteId()}${this.selectedToneStop()}`
  );

  readonly activeToneGuidance = computed(() => {
    const stop = this.selectedToneStop();
    if (stop <= 20) return 'Tono ultra oscuro: ideal para on-*-fixed (T10) o superficies Dark (neutral4–20).';
    if (stop <= 40) return 'Tono acento Light (T40 = Primary/Secondary/Error Light) y contenedores Dark (T30).';
    if (stop <= 70) return 'Tono medio expresivo: óptimo para bordes ≥3:1, Focus/Hover e iconos de contraste.';
    return 'Tono luminoso: ideal para contenedores Light (T90/T95), superficies claras (T98/T99) e ink Dark (T80).';
  });

  stopKeyBadge(stop: number): string | null {
    if (stop === 40) return 'Light';
    if (stop === 80) return 'Dark';
    if (stop === 90) return 'Box';
    if (stop === 30) return 'DkBox';
    return null;
  }

  selectPalette(id: TonalPaletteFamily['id']): void {
    this.selectedPaletteId.set(id);
    const palette = this.tonalPalettes.find((p) => p.id === id);
    if (palette && !palette.stops.includes(this.selectedToneStop())) {
      this.selectedToneStop.set(palette.stops[Math.floor(palette.stops.length / 2)]);
    }
  }

  inspectAndCopyTone(stop: number): void {
    this.selectedToneStop.set(stop);
    const token = `--md-ref-palette-${this.selectedPaletteId()}${stop}`;
    this.copyToken.emit({
      text: `var(${token})`,
      message: `Copiado token tonal ${token}`
    });
  }
}
