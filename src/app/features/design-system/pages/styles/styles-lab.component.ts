import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ContrastLevel, ThemeService } from '../../../../core/theme/theme.service';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SliderComponent } from '../../../../shared/components/slider/slider.component';
import { M3SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { copyTextWithFeedback } from '../../../../shared/utils/clipboard.util';
import { SHAPE_CORNER_10_SPECS } from './styles-specs.data';
import {
  ForcedStateMode,
  StylesCaseFilter,
  StylesCopyRequest,
  buildPortableThemeCssSnippet
} from './styles-copy.model';
import { StylesColorSectionComponent } from './styles-color-section.component';
import { StylesShapeElevationSectionComponent } from './styles-shape-elevation-section.component';
import {
  StylesStateLayersSectionComponent,
  computeSimulatedStateOverlay
} from './styles-state-layers-section.component';
import { StylesTokensSectionComponent } from './styles-tokens-section.component';
import { StylesTypographySectionComponent } from './styles-typography-section.component';

export type { ForcedStateMode } from './styles-copy.model';

/**
 * Interactive orchestrator for Step 1 (Styles & Design Tokens).
 * Centralizes live theme controls (`--seed-hue`, `--seed-chroma`, contrast level,
 * portable `:root` exporter) using real M3 Expressive components
 * and delegates Cases 1–6 to block-level modular OnPush sections.
 */
@Component({
  selector: 'app-styles-lab',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3ChipComponent,
    M3SliderComponent,
    M3SnackbarComponent,
    StylesTokensSectionComponent,
    StylesColorSectionComponent,
    StylesTypographySectionComponent,
    StylesShapeElevationSectionComponent,
    StylesStateLayersSectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">

      <!-- STUDIO BAR M3 EXPRESSIVE: SEED HUE, CHROMA, CONTRASTE GLOBAL & EXPORT -->
      <m3-card variant="elevated" padding="md" customClass="space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">tune</span>
              Paso 1 • Styles Studio En Vivo (--seed-hue · --seed-chroma · Contraste)
            </div>
            <p class="text-xs text-muted max-w-2xl leading-relaxed">
              Ajustá el seed, cromatismo y contraste para toda la Biblia en tiempo real; hacé clic en tokens, tonos o superficies para copiarlos con un toque.
            </p>
          </div>

          <div class="self-start lg:self-center shrink-0">
            <m3-button
              variant="tonal"
              size="sm"
              icon="code"
              [toggle]="true"
              [(selected)]="showPortableCssExport">
              Exportar :root CSS
            </m3-button>
          </div>
        </div>

        <!-- Fila 1: Presets de Color + Selector Global de Contraste M3 -->
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-outline-sub">
          <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Semillas predefinidas de color">
            @for (theme of themeService.themes; track theme.hue) {
              <m3-chip
                type="filter"
                [selected]="themeService.currentHue() === theme.hue"
                (action)="themeService.setThemeHue(theme.hue)">
                {{ theme.name }} ({{ theme.hue }}°)
              </m3-chip>
            }
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <span class="text-[11px] font-bold text-muted flex items-center gap-1">
              <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">contrast</span>
              Contraste:
            </span>
            <m3-button-group
              variant="connected"
              size="sm"
              selectionMode="single"
              ariaLabel="Nivel de contraste M3 global"
              [options]="contrastGroupOptions"
              [value]="[themeService.contrastLevel()]"
              (selectionChange)="onContrastGroupChange($event)" />
          </div>
        </div>

        <!-- Fila 2: Sliders M3 Expressive con ancho amplio 50/50 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <m3-slider
            customId="styles-seed-hue"
            label="Seed Hue"
            unit="°"
            size="sm"
            [min]="0"
            [max]="360"
            [step]="1"
            [value]="themeService.currentHue()"
            (valueChange)="themeService.setThemeHue($event)" />

          <m3-slider
            customId="styles-seed-chroma"
            label="Seed Chroma"
            size="sm"
            [min]="0"
            [max]="0.22"
            [step]="0.01"
            [value]="themeService.seedChroma()"
            (valueChange)="themeService.setSeedChroma($event)" />
        </div>

        @if (showPortableCssExport()) {
          <div class="p-3.5 rounded-m3-lg bg-surface border border-outline-sub space-y-2 m3-anim-item-in">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-bold text-main flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">package_2</span>
                Configuración CSS Portable (<code class="font-mono text-primary">src/styles/m3-expressive.css</code>)
              </span>
              <m3-button
                variant="tonal"
                size="xs"
                icon="content_copy"
                (action)="copyPortableTheme()">
                Copiar :root CSS
              </m3-button>
            </div>
            <pre class="p-2.5 rounded-m3-md bg-surface-low border border-outline-sub/60 text-[11px] font-mono text-main overflow-x-auto leading-relaxed">{{ portableThemeCssSnippet() }}</pre>
          </div>
        }

        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-sub/60" role="group" aria-label="Filtrar caso de estudio">
          @for (sec of sectionFilterOptions; track sec.id) {
            <m3-chip
              type="filter"
              [selected]="selectedSectionFilter() === sec.id"
              (action)="selectedSectionFilter.set(sec.id)">
              {{ sec.label }}
            </m3-chip>
          }
        </div>
      </m3-card>

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-1') {
        <app-styles-tokens-section (copyToken)="handleCopyRequest($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-2') {
        <app-styles-color-section
          [isDarkMode]="themeService.isDarkMode()"
          [contrastLevel]="themeService.contrastLevel()"
          (copyToken)="handleCopyRequest($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-3') {
        <app-styles-typography-section
          [(isEmphasizedType)]="isEmphasizedType"
          (copyToken)="handleCopyRequest($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-4' || selectedSectionFilter() === 'case-5') {
        <app-styles-shape-elevation-section
          [showShape]="selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-4'"
          [showElevation]="selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-5'"
          [(isMorphed)]="isMorphed"
          [(selectedMorphChips)]="selectedMorphChips"
          (copyToken)="handleCopyRequest($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-6') {
        <app-styles-state-layers-section
          [(forcedState)]="forcedState"
          (copyToken)="handleCopyRequest($event)" />
      }

      <m3-snackbar
        [message]="snackbarMessage()"
        [(open)]="snackbarOpen" />
    </div>
  `
})
export class StylesLabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly themeService = inject(ThemeService);

  readonly shapeSpecs = SHAPE_CORNER_10_SPECS;

  readonly selectedSectionFilter = signal<StylesCaseFilter>('all');
  readonly showPortableCssExport = signal<boolean>(false);
  readonly isEmphasizedType = signal<boolean>(false);
  readonly isMorphed = signal<boolean>(false);
  readonly selectedMorphChips = signal<readonly string[]>(['oklch']);
  readonly forcedState = signal<ForcedStateMode>('live');

  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');

  readonly contrastGroupOptions: M3ButtonGroupOption[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'medium', label: 'Medium (≥3:1)' },
    { id: 'high', label: 'High (≥7:1)' }
  ];

  readonly sectionFilterOptions: readonly { id: StylesCaseFilter; label: string }[] = [
    { id: 'all', label: 'Todos los Casos (6)' },
    { id: 'case-1', label: '1. 3-Layer Tokens' },
    { id: 'case-2', label: '2. Color OKLCH & Contrast' },
    { id: 'case-3', label: '3. Typography (30)' },
    { id: 'case-4', label: '4. Shape Morph' },
    { id: 'case-5', label: '5. Elevation' },
    { id: 'case-6', label: '6. State Layers' }
  ];

  readonly portableThemeCssSnippet = computed(() =>
    buildPortableThemeCssSnippet(
      this.themeService.currentHue(),
      this.themeService.seedChroma(),
      this.themeService.isDarkMode(),
      this.themeService.contrastLevel()
    )
  );

  setContrast(level: ContrastLevel): void {
    this.themeService.setContrastLevel(level);
  }

  onContrastGroupChange(selected: string[]): void {
    const picked = selected[0] as ContrastLevel | undefined;
    if (picked === 'standard' || picked === 'medium' || picked === 'high') {
      this.themeService.setContrastLevel(picked);
    }
  }

  onSeedHueInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) {
      this.themeService.setThemeHue(val);
    }
  }

  onSeedChromaInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(val)) {
      this.themeService.setSeedChroma(val);
    }
  }

  toggleMorph(): void {
    this.isMorphed.update((v) => !v);
  }

  toggleMorphChip(chipId: string): void {
    this.selectedMorphChips.update((current) =>
      current.includes(chipId) ? current.filter((id) => id !== chipId) : [...current, chipId]
    );
  }

  getSimulatedStateOverlay(colorExpr: string): string | null {
    return computeSimulatedStateOverlay(this.forcedState(), colorExpr);
  }

  copyPortableTheme(): void {
    this.handleCopyRequest({
      text: this.portableThemeCssSnippet(),
      message: 'CSS :root portable copiado al portapapeles'
    });
  }

  handleCopyRequest(request: StylesCopyRequest): void {
    copyTextWithFeedback(this.platformId, request.text, request.message, (msg) => {
      this.snackbarMessage.set(msg);
      this.snackbarOpen.set(true);
    });
  }
}
