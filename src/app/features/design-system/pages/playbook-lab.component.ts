import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';
import { M3SnackbarComponent } from '../../../shared/components/snackbar/snackbar.component';
import { M3TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import {
  PLAYBOOK_BLUEPRINTS,
  PLAYBOOK_BLUEPRINT_TABS,
  PLAYBOOK_CATEGORY_FILTERS,
  PLAYBOOK_CHECKLIST,
  PLAYBOOK_DECISION_RULES,
  PLAYBOOK_LAYERS,
  PLAYBOOK_SACRED_QUESTIONS,
  PLAYBOOK_STARTER_SNIPPETS,
  PlaybookCategory,
  PlaybookSourceBadge
} from './playbook-specs.data';

/**
 * Interactive M3 Reference Bible ("Paso 5: Biblia M3"): teaches how to bootstrap
 * real client applications from scratch with zero guesswork using verified
 * Google Material 3 + Web/WCAG + M3E Web Architecture decision rules.
 */
@Component({
  selector: 'app-playbook-lab',
  standalone: true,
  imports: [
    RouterLink,
    M3ButtonComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3ChipComponent,
    M3LinearProgressComponent,
    M3TabsComponent,
    M3TextFieldComponent,
    M3SnackbarComponent
  ],
  template: `
    <div class="space-y-8">
      <!-- 1. HERO: TU BIBLIA DE ARQUITECTURA M3 (DE CERO A SISTEMA REAL) -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base">menu_book</span>
              Paso 5 • Biblia M3 (De Cero a Producci&oacute;n)
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              C&oacute;mo Armar Sistemas Reales Desde Cero (Explicado Simple + Reglas Estrictas Google M3 &amp; Web)
            </h2>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              Aqu&iacute; vienes antes de programar un sistema nuevo para un cliente: ves qu&eacute; carpetas exactas copiar, qu&eacute; bot&oacute;n o control elegir en cada situaci&oacute;n y por qu&eacute;, sin depender de adivinar ni pedir c&oacute;digo gen&eacute;rico.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <a
              routerLink="/design-system/styles"
              class="btn-m3 state-layer focus-ring-m3 px-3.5 py-2 rounded-full bg-surface-high text-main text-xs font-bold flex items-center gap-1.5 no-underline">
              <span class="material-symbols-rounded text-base">palette</span>
              <span>1. Styles</span>
            </a>
            <a
              routerLink="/design-system/components"
              class="btn-m3 state-layer focus-ring-m3 px-3.5 py-2 rounded-full bg-sec-box text-on-sec-box text-xs font-bold flex items-center gap-1.5 no-underline">
              <span class="material-symbols-rounded text-base">widgets</span>
              <span>3. Components</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 2. MODELO MENTAL PARA UN NIÑO DE 5 AÑOS: LA CASA DE LEGO EN 4 CAPAS -->
      <section class="space-y-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <span class="material-symbols-rounded text-base">toys</span>
            Modelo Mental en 4 Capas
          </div>
          <h3 class="text-title-md font-bold text-main">
            &iquest;C&oacute;mo funciona este proyecto por dentro? Imagina armar una casa de Lego
          </h3>
          <p class="text-xs text-muted mt-0.5">
            Si respetas estas 4 capas, cambias un cliente completo cambiando la pintura base sin romper las habitaciones.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (layer of layers; track layer.id) {
            <m3-card variant="outlined" padding="md">
              <div class="space-y-2.5 h-full flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider">
                      {{ layer.step }}
                    </span>
                  </div>
                  <h4 class="text-sm font-bold text-main leading-snug">{{ layer.title }}</h4>
                  <p class="text-xs text-main bg-surface-low p-2.5 rounded-m3-md border border-outline-sub leading-relaxed">
                    <strong>Para 5 a&ntilde;os:</strong> {{ layer.metaphor5Years }}
                  </p>
                  <p class="text-[11px] text-muted leading-snug">{{ layer.whatLivesHere }}</p>
                </div>

                <div class="pt-2 border-t border-outline-sub space-y-1.5">
                  <div class="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {{ layer.copyRule }}
                  </div>
                  <ul class="space-y-0.5 text-[10px] font-mono text-muted">
                    @for (file of layer.files; track file) {
                      <li class="truncate" [title]="file">{{ file }}</li>
                    }
                  </ul>
                </div>
              </div>
            </m3-card>
          }
        </div>
      </section>

      <!-- 3. CHECKLIST INTERACTIVO + SNIPPETS DE ARRANQUE -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base">checklist</span>
                Checklist Paso a Paso • Cero a Cliente Nuevo
              </div>
              <h3 class="text-title-md font-bold text-main">Qu&eacute; copiar exactamente antes de programar pantallas</h3>
            </div>

            <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-primary-box text-on-primary-box">
              {{ completedChecklistCount() }} / {{ checklistItems.length }} listos ({{ checklistProgressPercent() }}%)
            </span>
          </div>

          <m3-linear-progress
            [value]="checklistProgressPercent()"
            [wavy]="false"
            color="primary"
            ariaLabel="Progreso de configuracion inicial M3" />

          <div class="space-y-2.5 pt-1">
            @for (item of checklistItems; track item.id) {
              <div class="p-3 bg-surface-low rounded-m3-lg border border-outline-sub flex items-start justify-between gap-3">
                <m3-checkbox
                  [label]="item.title"
                  [description]="item.why5Years"
                  [checked]="isChecklistDone(item.id)"
                  (changed)="toggleChecklistItem(item.id)" />

                <div class="text-right shrink-0 space-y-1">
                  <span class="inline-block px-2 py-0.5 rounded-m3-sm bg-surface-high text-main text-[10px] font-mono font-bold">
                    {{ item.layer }}
                  </span>
                  <div class="text-[10px] font-mono text-muted">{{ item.path }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Copy-paste Quick Kit -->
        <div class="lg:col-span-5 bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs flex flex-col justify-between">
          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base">terminal</span>
                Kit M&iacute;nimo Copiable
              </div>
              <h3 class="text-title-md font-bold text-main">Archivos base para pegar en otro repo Angular</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Copia primero las fuentes en <code>index.html</code>, respeta el orden exacto de <code>@import</code> en <code>styles.css</code> (especialmente <code>_token.css</code> arriba y <code>_overlays.css</code> al final) y ajusta el <code>--seed-hue</code> del cliente.
              </p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">1. Comando de copia rápida (Core 80/20)</span>
                <m3-button variant="tonal" size="sm" icon="content_copy" (action)="copySnippet(starterSnippets.copyScript, 'Script cp -r copiado')">
                  Copiar bash
                </m3-button>
              </div>
              <pre class="p-3 bg-surface-low rounded-m3-md border border-outline-sub text-[10px] font-mono text-main overflow-x-auto leading-relaxed">{{ starterSnippets.copyScript }}</pre>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">2. Orden obligatorio en src/styles.css</span>
                <m3-button variant="tonal" size="sm" icon="content_copy" (action)="copySnippet(starterSnippets.stylesOrder, 'Orden de @import styles.css copiado')">
                  Copiar CSS
                </m3-button>
              </div>
              <pre class="p-3 bg-surface-low rounded-m3-md border border-outline-sub text-[10px] font-mono text-muted overflow-x-auto leading-relaxed max-h-40">{{ starterSnippets.stylesOrder }}</pre>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span class="text-[11px] text-muted">Tambi&eacute;n necesitas fuentes Google + color-scheme:</span>
              <m3-button variant="outlined" size="sm" icon="content_copy" (action)="copySnippet(starterSnippets.indexHtml, 'Etiquetas de src/index.html copiadas')">
                Copiar index.html
              </m3-button>
            </div>
          </div>

          <div class="p-3 bg-primary-box/40 rounded-m3-md border border-primary/20 text-[11px] text-main leading-snug">
            <strong>Regla de Oro:</strong> En las pantallas del cliente nunca escribas hexadecimales sueltos (<code>#ff0000</code>). Usa siempre tokens sem&aacute;nticos (<code>bg-surface-box</code>, <code>text-primary</code>, <code>bg-error</code>).
          </div>
        </div>
      </section>

      <!-- 4. LAS 5 PREGUNTAS SAGRADAS ANTES DE PROGRAMAR -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <span class="material-symbols-rounded text-base">psychology</span>
            Criterio Propio Antes de Tocar el Teclado
          </div>
          <h3 class="text-title-md font-bold text-main">
            Las 5 Preguntas Sagradas (para elegir t&uacute; mismo sin depender de adivinar)
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          @for (q of sacredQuestions; track q.number) {
            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <span class="inline-flex w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold items-center justify-center">
                  {{ q.number }}
                </span>
                <h4 class="text-xs font-bold text-main leading-snug">{{ q.question }}</h4>
                <p class="text-[11px] text-muted leading-snug">{{ q.kidExplanation }}</p>
              </div>

              <div class="space-y-1.5 pt-2 border-t border-outline-sub">
                @for (ans of q.answerMap; track ans.condition) {
                  <div class="text-[10px] leading-snug">
                    <span class="font-bold text-primary">{{ ans.condition }}:</span>
                    <span class="text-main"> {{ ans.pick }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 5. RECETAS POR TIPO DE PANTALLA (USANDO <m3-tabs> REALES) -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-4 shadow-xs">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <span class="material-symbols-rounded text-base">schema</span>
            Recetas Listas Por Caso de Uso
          </div>
          <h3 class="text-title-md font-bold text-main">Qu&eacute; componentes juntar en cada pantalla t&iacute;pica</h3>
        </div>

        <m3-tabs
          variant="primary"
          [tabs]="blueprintTabs"
          ariaLabel="Recetas de pantallas Material 3"
          [(value)]="activeBlueprintId" />

        @if (activeBlueprint(); as bp) {
          <div
            role="tabpanel"
            [attr.id]="'bp-panel-' + bp.id"
            [attr.aria-labelledby]="'m3-tab-' + bp.id"
            class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-surface-low rounded-m3-lg border border-outline-sub">
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-xl text-primary" aria-hidden="true">{{ bp.icon }}</span>
                <h4 class="text-sm font-bold text-main">{{ bp.title }}</h4>
              </div>

              <p class="text-xs text-main leading-relaxed bg-surface-box p-3 rounded-m3-md border border-outline-sub">
                <strong>Explicado simple:</strong> {{ bp.summary5Years }}
              </p>

              <div class="flex flex-wrap gap-1.5">
                @for (comp of bp.componentsUsed; track comp) {
                  <span class="px-2 py-0.5 rounded-m3-sm bg-sec-box text-on-sec-box text-[10px] font-mono font-bold">
                    {{ comp }}
                  </span>
                }
              </div>

              <ul class="space-y-1.5 text-xs text-muted">
                @for (rule of bp.strictRules; track rule) {
                  <li class="flex items-start gap-2 leading-snug">
                    <span class="material-symbols-rounded text-sm text-primary shrink-0 mt-0.5" aria-hidden="true">verified</span>
                    <span>{{ rule }}</span>
                  </li>
                }
              </ul>
            </div>

            <div class="space-y-2 flex flex-col justify-between">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">Plantilla HTML / Angular base</span>
                <m3-button variant="tonal" size="sm" icon="content_copy" (action)="copySnippet(bp.codeSnippet, 'Receta ' + bp.id + ' copiada')">
                  Copiar Receta
                </m3-button>
              </div>
              <pre class="p-3.5 bg-surface-box rounded-m3-md border border-outline-sub text-[11px] font-mono text-main overflow-x-auto leading-relaxed flex-1">{{ bp.codeSnippet }}</pre>
            </div>
          </div>
        }
      </section>

      <!-- 6. ORÁCULO ESTRICTO DE DECISIONES ("USA ESTO CUANDO X / EVITA ESTO CUANDO Y") -->
      <section class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl space-y-5 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
              <span class="material-symbols-rounded text-base">gavel</span>
              Or&aacute;culo Estricto de Decisiones
            </div>
            <h3 class="text-title-md font-bold text-main">
              &laquo;&Uacute;salo cuando X&raquo; vs &laquo;Ev&iacute;talo cuando Y&raquo; (con fuente verificada)
            </h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Distingue claramente qu&eacute; regla viene directa de <strong>Google M3 Oficial</strong>, cu&aacute;l viene de <strong>Est&aacute;ndares Web / WCAG</strong> (HTML nativo, Popover, <code>&lt;dialog&gt;</code>) y cu&aacute;l es <strong>Arquitectura M3E Web</strong> propia.
            </p>
          </div>

          <div class="w-full lg:w-80">
            <m3-text-field
              label="Buscar componente, regla o duda..."
              placeholder="Ej: switch, modal, 6 opciones, >5s"
              variant="outlined"
              icon="search"
              [clearable]="true"
              [(value)]="oracleQuery" />
          </div>
        </div>

        <!-- Category & Source Filters -->
        <div class="space-y-2.5">
          <div class="flex flex-wrap gap-1.5">
            @for (cat of categoryFilters; track cat.id) {
              <m3-chip
                type="filter"
                [selected]="selectedCategory() === cat.id"
                (action)="selectedCategory.set(cat.id)">
                {{ cat.label }}
              </m3-chip>
            }
          </div>

          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="text-[11px] font-semibold text-muted uppercase mr-1">Fuente:</span>
            <m3-chip
              type="filter"
              [selected]="selectedSource() === 'all'"
              (action)="selectedSource.set('all')">
              Todas ({{ totalRulesCount }})
            </m3-chip>
            @for (src of sourceFilters; track src) {
              <m3-chip
                type="filter"
                [selected]="selectedSource() === src"
                (action)="selectedSource.set(src)">
                {{ src }}
              </m3-chip>
            }
          </div>
        </div>

        @if (filteredRules().length === 0) {
          <div class="p-8 text-center bg-surface-low rounded-m3-lg border border-outline-sub space-y-2">
            <p class="text-sm font-bold text-main">No encontramos reglas con ese filtro.</p>
            <m3-button variant="tonal" icon="restart_alt" (action)="resetOracleFilters()">
              Restablecer filtros del Or&aacute;culo
            </m3-button>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            @for (rule of filteredRules(); track rule.id) {
              <div class="p-5 bg-surface-low rounded-m3-xl border border-outline-sub flex flex-col justify-between space-y-3">
                <div class="space-y-3">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <h4 class="text-sm font-bold text-main leading-snug">{{ rule.component }}</h4>
                    <span [class]="sourceBadgeClass(rule.sourceBadge)">
                      {{ rule.sourceBadge }}
                    </span>
                  </div>

                  <p class="text-xs text-main bg-surface-box p-2.5 rounded-m3-md border border-outline-sub leading-relaxed">
                    <strong>Para 5 a&ntilde;os:</strong> {{ rule.kidAnalogy }}
                  </p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div class="p-2.5 rounded-m3-md bg-surface-box border border-primary/30 space-y-1">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <span class="material-symbols-rounded text-sm" aria-hidden="true">check_circle</span>
                        &Uacute;salo cuando
                      </span>
                      <p class="text-[11px] text-main leading-snug">{{ rule.useWhen }}</p>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-box border border-error/35 space-y-1">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-error flex items-center gap-1">
                        <span class="material-symbols-rounded text-sm" aria-hidden="true">cancel</span>
                        Ev&iacute;talo cuando
                      </span>
                      <p class="text-[11px] text-main leading-snug">{{ rule.avoidWhen }}</p>
                    </div>
                  </div>

                  <p class="text-[11px] text-muted leading-snug">
                    <strong class="text-main">Por qu&eacute; t&eacute;cnico:</strong> {{ rule.technicalWhy }}
                  </p>
                </div>

                <div class="pt-3 border-t border-outline-sub flex flex-wrap items-center justify-between gap-2">
                  <span class="text-[10px] font-mono text-primary truncate max-w-full" [title]="rule.repoFile">
                    {{ rule.repoFile }}
                  </span>
                  <m3-button variant="text" size="xs" icon="content_copy" (action)="copySnippet(rule.snippet, 'Uso de ' + rule.component + ' copiado')">
                    Copiar uso
                  </m3-button>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <m3-snackbar
        [message]="snackbarMessage()"
        [(open)]="snackbarOpen" />
    </div>
  `
})
export class PlaybookLabComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly layers = PLAYBOOK_LAYERS;
  readonly checklistItems = PLAYBOOK_CHECKLIST;
  readonly sacredQuestions = PLAYBOOK_SACRED_QUESTIONS;
  readonly categoryFilters = PLAYBOOK_CATEGORY_FILTERS;
  readonly sourceFilters: readonly PlaybookSourceBadge[] = [
    'Google M3 Oficial',
    'Estándar Web / WCAG',
    'Arquitectura M3E Web'
  ];
  readonly totalRulesCount = PLAYBOOK_DECISION_RULES.length;
  readonly blueprintTabs = PLAYBOOK_BLUEPRINT_TABS;
  readonly starterSnippets = PLAYBOOK_STARTER_SNIPPETS;

  readonly completedChecklistIds = signal<string[]>(['chk-index', 'chk-styles']);
  readonly activeBlueprintId = signal<string>('crud');
  readonly selectedCategory = signal<PlaybookCategory>('all');
  readonly selectedSource = signal<PlaybookSourceBadge | 'all'>('all');
  readonly oracleQuery = signal<string>('');

  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');

  readonly completedChecklistCount = computed(() => this.completedChecklistIds().length);
  readonly checklistProgressPercent = computed(() =>
    Math.round((this.completedChecklistCount() / this.checklistItems.length) * 100)
  );

  readonly activeBlueprint = computed(
    () => PLAYBOOK_BLUEPRINTS.find((bp) => bp.id === this.activeBlueprintId()) ?? PLAYBOOK_BLUEPRINTS[0]
  );

  readonly filteredRules = computed(() => {
    const category = this.selectedCategory();
    const source = this.selectedSource();
    const query = this.oracleQuery().trim().toLowerCase();

    return PLAYBOOK_DECISION_RULES.filter((rule) => {
      if (category !== 'all' && rule.category !== category) {
        return false;
      }
      if (source !== 'all' && rule.sourceBadge !== source) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = `${rule.component} ${rule.kidAnalogy} ${rule.useWhen} ${rule.avoidWhen} ${rule.technicalWhy} ${rule.repoFile}`.toLowerCase();
      return haystack.includes(query);
    });
  });

  isChecklistDone(id: string): boolean {
    return this.completedChecklistIds().includes(id);
  }

  toggleChecklistItem(id: string): void {
    this.completedChecklistIds.update((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  resetOracleFilters(): void {
    this.selectedCategory.set('all');
    this.selectedSource.set('all');
    this.oracleQuery.set('');
  }

  sourceBadgeClass(badge: PlaybookSourceBadge): string {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0';
    if (badge === 'Google M3 Oficial') {
      return `${base} bg-primary-box text-on-primary-box`;
    }
    if (badge === 'Estándar Web / WCAG') {
      return `${base} bg-sec-box text-on-sec-box`;
    }
    return `${base} bg-tertiary-box text-on-tertiary-box`;
  }

  copySnippet(content: string, confirmationMsg: string): void {
    if (isPlatformBrowser(this.platformId) && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    this.snackbarMessage.set(confirmationMsg);
    this.snackbarOpen.set(true);
  }
}
