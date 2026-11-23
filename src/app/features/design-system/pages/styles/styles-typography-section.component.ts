import { ChangeDetectionStrategy, Component, computed, model, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../../shared/components/text-field/text-field.component';
import {
  APPLYING_TYPE_RULES,
  TYPEFACE_FONT_SPECS,
  TYPESCALES_30_SPECS
} from './styles-specs.data';
import { StylesCopyRequest, TypeCategoryFilter } from './styles-copy.model';

@Component({
  selector: 'app-styles-typography-section',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3ChipComponent,
    M3TabsComponent,
    M3TextFieldComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-5">
      <div class="space-y-1 border-b border-outline-sub pb-4">
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <span class="material-symbols-rounded text-base" aria-hidden="true">text_fields</span>
          Caso 3 • Typography: Fonts, Applying Type &amp; 30-Style Dual Type Scale
        </div>
        <h2 class="text-title-lg-emphasized text-main">
          Tipografía M3 Expressive: Explorador en Vivo, Reglas y Fuentes
        </h2>
        <p class="text-xs text-muted max-w-4xl leading-relaxed">
          Alineado con <code class="font-mono text-main">styles/typography/fonts</code>, <code class="font-mono text-main">applying-type</code> y <code class="font-mono text-main">type-scale-tokens</code>: alterná las pestañas para probar texto vivo arriba sin paredes de lectura previas, o estudiá cuándo usar cada familia (<code class="font-mono">rem</code> + <code class="font-mono">text-wrap: balance/pretty</code>).
        </p>
      </div>

      <m3-tabs
        variant="primary"
        ariaLabel="Secciones del laboratorio tipográfico"
        idPrefix="styles-typo-tab"
        [tabs]="typoTabs"
        [(value)]="activeTypoTab" />

      <!-- TAB 1: EXPLORADOR EN VIVO DE LOS 30 ESTILOS -->
      @if (activeTypoTab() === 'explorer') {
        <div id="styles-typo-panel-explorer" role="tabpanel" class="space-y-4">
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div class="w-full lg:max-w-md">
              <m3-text-field
                variant="outlined"
                label="Texto de prueba en vivo (+35% expansión)"
                placeholder="Escribí una frase real de tu app..."
                [clearable]="true"
                [(value)]="livePreviewText" />
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <m3-button-group
                variant="connected"
                size="sm"
                selectionMode="single"
                ariaLabel="Escala tipográfica M3"
                [options]="scaleModeOptions"
                [value]="[isEmphasizedType() ? 'emphasized' : 'baseline']"
                (selectionChange)="onScaleModeChange($event)" />

              <div class="flex flex-wrap gap-2" role="group" aria-label="Categoría tipográfica">
                @for (cat of typeCategories; track cat.id) {
                  <m3-chip
                    type="filter"
                    [selected]="selectedTypeCategory() === cat.id"
                    (action)="selectedTypeCategory.set(cat.id)">
                    {{ cat.label }}
                  </m3-chip>
                }
              </div>
            </div>
          </div>

          <div class="space-y-2">
            @for (item of filteredTypescales(); track item.tokenKey) {
              <div class="p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div class="min-w-0 flex-1 space-y-1">
                  <div
                    [class]="'text-main break-words ' + (isEmphasizedType() ? item.emphasizedClass : item.baselineClass)">
                    {{ livePreviewText().trim() || item.sampleText }}
                  </div>
                  <div class="text-[11px] text-muted flex flex-wrap items-center gap-2">
                    <span class="font-semibold text-main">{{ item.label }} ({{ item.typeface }}):</span>
                    <span>{{ item.whereToApply }}</span>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-1.5 shrink-0 text-[11px] font-mono">
                  <m3-button
                    variant="tonal"
                    size="xs"
                    icon="content_copy"
                    (action)="copyClass(isEmphasizedType() ? item.emphasizedClass : item.baselineClass)">
                    .{{ isEmphasizedType() ? item.emphasizedClass : item.baselineClass }}
                  </m3-button>
                  <span class="px-2 py-0.5 rounded bg-surface border border-outline-sub text-main">
                    {{ item.sizeRem }} ({{ item.sizePx }}) / {{ item.lineHeightPx }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-surface border border-outline-sub text-muted">
                    trk {{ item.trackingPx }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-primary-box text-on-primary-box font-bold">
                    w: {{ isEmphasizedType() ? item.emphasizedWeight : item.baselineWeight }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: REGLAS DE APLICACIÓN (5 FAMILIAS) -->
      @if (activeTypoTab() === 'applying') {
        <div id="styles-typo-panel-applying" role="tabpanel" class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>Elegí la escala según jerarquía semántica, nunca solo por "tamaño bonito".</span>
            <span>Ancho óptimo Body: <strong class="text-main font-mono">40ch – 75ch</strong> (máximo 80ch)</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (rule of applyingTypeRules; track rule.category) {
              <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-2.5">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">{{ rule.icon }}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-high text-muted">
                      {{ rule.typefaceUsed }}
                    </span>
                  </div>
                  <div class="text-xs font-bold text-main">{{ rule.title }}</div>
                  <div class="text-[10px] font-mono text-primary bg-surface px-2 py-1 rounded border border-outline-sub/60">
                    {{ rule.measureAndWrap }}
                  </div>
                </div>

                <div class="space-y-1.5 text-[11px]">
                  <p class="text-muted leading-snug">
                    <strong class="text-main">Cuándo usar:</strong> {{ rule.whenToUse }}
                  </p>
                  <p class="text-muted leading-snug">
                    <strong class="text-error">Evitar:</strong> {{ rule.avoid }}
                  </p>
                  <div class="pt-1 border-t border-outline-sub/60 text-[10px] text-muted">
                    <strong class="text-main">En esta UI:</strong> {{ rule.uiExamples }}
                  </div>
                </div>
              </m3-card>
            }
          </div>
        </div>
      }

      <!-- TAB 3: FUENTES DE REFERENCIA (BRAND VS PLAIN VS MONO) -->
      @if (activeTypoTab() === 'fonts') {
        <div id="styles-typo-panel-fonts" role="tabpanel" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          @for (font of typefaceFontSpecs; track font.id) {
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-bold text-main">{{ font.roleName }}</span>
                  <m3-button
                    variant="tonal"
                    size="xs"
                    icon="content_copy"
                    (action)="copyToken.emit({ text: 'var(' + font.refToken + ')', message: 'Copiado ' + font.refToken })">
                    {{ font.refToken }}
                  </m3-button>
                </div>
                <div class="text-[11px] font-mono text-muted">{{ font.fontFamily }}</div>
                <div
                  class="p-3 rounded-m3-md bg-surface border border-outline-sub/70 text-lg font-bold text-main truncate"
                  [style.font-family]="'var(' + font.refToken + ')'">
                  {{ font.sampleGlyphs }}
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-[11px] text-muted leading-relaxed">{{ font.rationale }}</div>
                <div class="text-[10px] font-semibold text-primary">
                  Escalas asignadas: <span class="text-main font-mono">{{ font.assignedScales }}</span>
                </div>
                <div class="flex flex-wrap gap-1 pt-1">
                  @for (w of font.weightsAvailable; track w.weight) {
                    <span
                      class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-high border border-outline-sub text-main"
                      [style.font-weight]="w.weight">
                      {{ w.weight }} • {{ w.label }}
                    </span>
                  }
                </div>
              </div>
            </m3-card>
          }
        </div>
      }
    </m3-card>
  `
})
export class StylesTypographySectionComponent {
  readonly isEmphasizedType = model.required<boolean>();
  readonly copyToken = output<StylesCopyRequest>();

  readonly typefaceFontSpecs = TYPEFACE_FONT_SPECS;
  readonly applyingTypeRules = APPLYING_TYPE_RULES;
  readonly typescaleSpecs = TYPESCALES_30_SPECS;

  readonly typoTabs: M3TabItem[] = [
    { id: 'explorer', label: 'Explorador en Vivo (30)', icon: 'straighten', panelId: 'styles-typo-panel-explorer' },
    { id: 'applying', label: 'Reglas de Aplicación (5)', icon: 'menu_book', panelId: 'styles-typo-panel-applying' },
    { id: 'fonts', label: 'Fuentes Brand / Plain', icon: 'font_download', panelId: 'styles-typo-panel-fonts' }
  ];

  readonly scaleModeOptions: M3ButtonGroupOption[] = [
    { id: 'baseline', label: 'Baseline (15)' },
    { id: 'emphasized', label: 'Emphasized (15)' }
  ];

  readonly typeCategories: readonly { id: TypeCategoryFilter; label: string }[] = [
    { id: 'all', label: 'Todas (15)' },
    { id: 'display', label: 'Display' },
    { id: 'headline', label: 'Headline' },
    { id: 'title', label: 'Title' },
    { id: 'body', label: 'Body' },
    { id: 'label', label: 'Label' }
  ];

  readonly activeTypoTab = signal<string>('explorer');
  readonly selectedTypeCategory = signal<TypeCategoryFilter>('all');
  readonly livePreviewText = signal<string>('');

  readonly filteredTypescales = computed(() => {
    const cat = this.selectedTypeCategory();
    return cat === 'all'
      ? this.typescaleSpecs
      : this.typescaleSpecs.filter((item) => item.category === cat);
  });

  onScaleModeChange(selected: string[]): void {
    if (selected[0]) {
      this.isEmphasizedType.set(selected[0] === 'emphasized');
    }
  }

  copyClass(className: string): void {
    this.copyToken.emit({
      text: className,
      message: `Clase .${className} copiada al portapapeles`
    });
  }
}
