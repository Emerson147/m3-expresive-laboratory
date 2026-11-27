import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { M3ButtonAnchorComponent, M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../../shared/components/text-field/text-field.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import {
  PLAYBOOK_BLUEPRINTS,
  PLAYBOOK_BLUEPRINT_TABS,
  PLAYBOOK_CATEGORY_FILTERS,
  PLAYBOOK_DECISION_RULES,
  PLAYBOOK_SACRED_QUESTIONS,
  PLAYBOOK_TROUBLESHOOTING,
  PlaybookCategory,
  PlaybookModuleId,
  PlaybookSourceBadge,
  PlaybookTroubleshootLayer
} from './playbook-specs.data';

type InspectorTabId = 'oracle' | 'troubleshoot' | 'blueprints';

const MODULE_LABELS: Record<PlaybookModuleId, { label: string; route: string }> = {
  styles: { label: 'Ver 1. Styles', route: '/design-system/styles' },
  foundations: { label: 'Ver 2. Foundations', route: '/design-system/foundations' },
  components: { label: 'Ver 3. Components', route: '/design-system/components' },
  motion: { label: 'Ver 4. Motion', route: '/design-system/motion' }
};

/**
 * Playbook Decision & Diagnostic Hub:
 * - Tab 1: 6 Sacred Architecture/UI Questions + 20-rule Searchable Oracle (UI + Performance + Vercel)
 * - Tab 2: Symptom Failure Inspector across Styles, Foundations, Components, Motion & Architecture/Deploy
 * - Tab 3: 4 Production Architecture Recipes (Ports, @defer+VirtualScroll, Optimistic UI, Dirty Guard)
 */
@Component({
  selector: 'app-playbook-inspector-section',
  standalone: true,
  imports: [
    RouterLink,
    M3ButtonAnchorComponent,
    M3ButtonComponent,
    M3CardComponent,
    M3ChipComponent,
    M3TabsComponent,
    M3TextFieldComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card id="playbook-inspector" variant="outlined" padding="md" customClass="space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">troubleshoot</span>
            Manual de Criterio, Diagnóstico de Fallas y Recetas Listas
          </div>
          <h3 class="text-title-md-emphasized text-main">
            Oráculo Estricto + Inspector de Fallas (UI M3, Velocidad Angular y Vercel)
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Resuelve dudas antes de programar o diagnostica síntomas reales en producción (incluyendo 404 de rutas en Vercel, lag por exceso de nodos DOM o pérdida de datos al fallar la red).
          </p>
        </div>
      </div>

      <m3-tabs
        variant="secondary"
        idPrefix="playbook-insp"
        ariaLabel="Secciones de Oráculo, Inspector de Fallas y Recetas"
        [tabs]="inspectorTabs"
        [(value)]="activeTab" />

      @switch (activeTab()) {
        <!-- TAB 1: LAS 6 PREGUNTAS SAGRADAS + ORÁCULO ESTRICTO -->
        @case ('oracle') {
          <div class="space-y-6">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <span class="material-symbols-rounded text-base" aria-hidden="true">psychology</span>
                Las 6 Preguntas Sagradas Antes de Escribir Código
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                @for (q of sacredQuestions; track q.number) {
                  <m3-card variant="filled" surface="high" padding="sm" shape="lg" customClass="flex flex-col justify-between space-y-3">
                    <div class="space-y-1.5">
                      <span class="inline-flex w-6 h-6 rounded-m3-full bg-primary text-on-primary text-xs font-bold items-center justify-center">
                        {{ q.number }}
                      </span>
                      <h4 class="text-xs font-bold text-main leading-snug">{{ q.question }}</h4>
                      <p class="text-[11px] text-muted leading-snug">{{ q.explanation }}</p>
                    </div>

                    <div class="space-y-1.5 pt-2 border-t border-outline-sub">
                      @for (ans of q.answerMap; track ans.condition) {
                        <div class="text-[10px] leading-snug">
                          <span class="font-bold text-primary">{{ ans.condition }}:</span>
                          <span class="text-main"> {{ ans.pick }}</span>
                        </div>
                      }
                    </div>
                  </m3-card>
                }
              </div>
            </div>

            <!-- Oráculo Buscador + Filtros -->
            <div class="space-y-4 pt-3 border-t border-outline-sub">
              <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h4 class="text-sm font-bold text-main">
                    Oráculo de Decisiones («Úsalo cuando X» vs «Evítalo cuando Y»)
                  </h4>
                  <p class="text-xs text-muted mt-0.5">
                    Cubre M3 Expressive, Clean Ports, <code class="font-mono">&#64;defer</code>, Virtualización y Deploy SPA en Vercel.
                  </p>
                </div>

                <div class="w-full lg:w-80">
                  <m3-text-field
                    label="Buscar regla, patrón o archivo..."
                    placeholder="Ej: defer, vercel, port, switch, oklch"
                    variant="outlined"
                    icon="search"
                    [clearable]="true"
                    [(value)]="oracleQuery" />
                </div>
              </div>

              <div class="space-y-2.5">
                <div role="group" aria-label="Filtrar Oráculo por categoría" class="flex flex-wrap gap-2">
                  @for (cat of categoryFilters; track cat.id) {
                    <m3-chip
                      type="filter"
                      [selected]="selectedCategory() === cat.id"
                      (action)="selectedCategory.set(cat.id)">
                      {{ cat.label }}
                    </m3-chip>
                  }
                </div>

                <div role="group" aria-label="Filtrar Oráculo por fuente normativa" class="flex flex-wrap items-center gap-2">
                  <span class="text-[11px] font-semibold text-muted uppercase me-1">Fuente:</span>
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
                    Restablecer filtros del Oráculo
                  </m3-button>
                </div>
              } @else {
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  @for (rule of filteredRules(); track rule.id) {
                    <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="flex flex-col justify-between space-y-3">
                      <div class="space-y-3">
                        <div class="flex flex-wrap items-start justify-between gap-2">
                          <h4 class="text-sm font-bold text-main leading-snug">{{ rule.component }}</h4>
                          <span [class]="sourceBadgeClass(rule.sourceBadge)">
                            {{ rule.sourceBadge }}
                          </span>
                        </div>

                        <p class="text-xs text-main bg-surface-box p-2.5 rounded-m3-md border border-outline-sub leading-relaxed">
                          <strong>En obra:</strong> {{ rule.buildingAnalogy }}
                        </p>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div class="p-2.5 rounded-m3-md bg-surface-box border border-primary/30 space-y-1">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                              <span class="material-symbols-rounded text-sm" aria-hidden="true">check_circle</span>
                              Úsalo cuando
                            </span>
                            <p class="text-[11px] text-main leading-snug">{{ rule.useWhen }}</p>
                          </div>

                          <div class="p-2.5 rounded-m3-md bg-surface-box border border-error/35 space-y-1">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-error flex items-center gap-1">
                              <span class="material-symbols-rounded text-sm" aria-hidden="true">cancel</span>
                              Evítalo cuando
                            </span>
                            <p class="text-[11px] text-main leading-snug">{{ rule.avoidWhen }}</p>
                          </div>
                        </div>

                        <p class="text-[11px] text-muted leading-snug">
                          <strong class="text-main">Por qué técnico:</strong> {{ rule.technicalWhy }}
                        </p>
                      </div>

                      <div class="pt-3 border-t border-outline-sub flex flex-wrap items-center justify-between gap-2">
                        <span class="text-[10px] font-mono text-primary truncate max-w-full">
                          {{ rule.repoFile }}
                        </span>
                        <div class="flex items-center gap-1.5 shrink-0">
                          @if (rule.moduleRef; as ref) {
                            <a m3-button variant="tonal" size="xs" [routerLink]="moduleMeta(ref).route">
                              {{ moduleMeta(ref).label }}
                            </a>
                          }
                          <m3-button variant="text" size="xs" icon="content_copy" (action)="emitCopy(rule.snippet, 'Uso de ' + rule.component + ' copiado')">
                            Copiar uso
                          </m3-button>
                        </div>
                      </div>
                    </m3-card>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 2: INSPECTOR DE FALLAS -->
        @case ('troubleshoot') {
          <div class="space-y-4">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-main">
                  Inspector de Obra: ¿Qué síntoma falló en producción o en otro repo?
                </h4>
                <p class="text-xs text-muted">
                  Filtra por capa o busca el síntoma (<code class="font-mono">404</code>, <code class="font-mono">1MB</code>, <code class="font-mono">íconos</code>, <code class="font-mono">1 segundo</code>, <code class="font-mono">borroso</code>).
                </p>
              </div>

              <div class="w-full lg:w-80">
                <m3-text-field
                  label="Buscar síntoma o error..."
                  placeholder="Ej: 404, 1MB, 9999px, borroso"
                  variant="outlined"
                  icon="bug_report"
                  [clearable]="true"
                  [(value)]="troubleQuery" />
              </div>
            </div>

            <div role="group" aria-label="Filtrar fallas por capa o arquitectura" class="flex flex-wrap gap-2">
              <m3-chip type="filter" [selected]="troubleLayer() === 'all'" (action)="troubleLayer.set('all')">
                Todas ({{ troubleshootingItems.length }})
              </m3-chip>
              <m3-chip type="filter" [selected]="troubleLayer() === 'styles'" (action)="troubleLayer.set('styles')">
                1. Styles
              </m3-chip>
              <m3-chip type="filter" [selected]="troubleLayer() === 'foundations'" (action)="troubleLayer.set('foundations')">
                2. Foundations
              </m3-chip>
              <m3-chip type="filter" [selected]="troubleLayer() === 'components'" (action)="troubleLayer.set('components')">
                3. Components
              </m3-chip>
              <m3-chip type="filter" [selected]="troubleLayer() === 'motion'" (action)="troubleLayer.set('motion')">
                4. Motion
              </m3-chip>
              <m3-chip type="filter" [selected]="troubleLayer() === 'architecture'" (action)="troubleLayer.set('architecture')">
                5. Arquitectura &amp; Vercel
              </m3-chip>
            </div>

            @if (filteredTroubleshooting().length === 0) {
              <div class="p-8 text-center bg-surface-low rounded-m3-lg border border-outline-sub space-y-2">
                <p class="text-sm font-bold text-main">No hay fallas registradas con ese filtro.</p>
                <m3-button variant="tonal" icon="restart_alt" (action)="resetTroubleFilters()">
                  Ver todos los diagnósticos
                </m3-button>
              </div>
            } @else {
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                @for (item of filteredTroubleshooting(); track item.id) {
                  <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
                    <div class="space-y-2.5">
                      <div class="flex items-center justify-between gap-2 flex-wrap">
                        <span class="px-2.5 py-0.5 rounded-m3-full bg-error-box text-on-error-box text-[10px] font-bold">
                          {{ item.layerLabel }}
                        </span>
                        @if (item.route && item.routeLabel) {
                          <a m3-button variant="tonal" size="xs" icon="open_in_new" [routerLink]="item.route">
                            {{ item.routeLabel }}
                          </a>
                        }
                      </div>

                      <h5 class="text-xs font-bold text-main leading-snug">
                        Síntoma: {{ item.symptom }}
                      </h5>

                      <p class="text-[11px] text-muted leading-snug">
                        <strong class="text-error">Por qué ocurre:</strong> {{ item.cause }}
                      </p>

                      <p class="text-[11px] text-muted leading-snug">
                        <strong class="text-success">Cómo corregirlo:</strong> {{ item.fixRule }}
                      </p>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub flex items-center justify-between gap-2">
                      <code class="text-[10px] font-mono text-primary truncate">{{ item.fixSnippet }}</code>
                      <m3-button variant="text" size="xs" icon="content_copy" (action)="emitCopy(item.fixSnippet, 'Fix copiado al portapapeles')">
                        Copiar
                      </m3-button>
                    </div>
                  </m3-card>
                }
              </div>
            }
          </div>
        }

        <!-- TAB 3: RECETAS AVANZADAS DE ARQUITECTURA -->
        @case ('blueprints') {
          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-bold text-main">Recetas de Arquitectura Avanzada Listas para Copiar</h4>
              <p class="text-xs text-muted mt-0.5">Patrones reales de desacoplamiento, rendimiento y resiliencia sobre el kit M3 Expressive.</p>
            </div>

            <m3-tabs
              variant="primary"
              idPrefix="m3-bp"
              [tabs]="blueprintTabs"
              ariaLabel="Recetas avanzadas de arquitectura Angular y M3"
              [(value)]="activeBlueprintId" />

            @if (activeBlueprint(); as bp) {
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-surface-low rounded-m3-lg border border-outline-sub">
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-xl text-primary" aria-hidden="true">{{ bp.icon }}</span>
                    <h4 class="text-sm font-bold text-main">{{ bp.title }}</h4>
                  </div>

                  <p class="text-xs text-main leading-relaxed bg-surface-box p-3 rounded-m3-md border border-outline-sub">
                    <strong>Por qué escala:</strong> {{ bp.summary }}
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
                    <span class="text-xs font-bold text-main">Patrón TypeScript / Angular base</span>
                    <m3-button variant="tonal" size="sm" icon="content_copy" (action)="emitCopy(bp.codeSnippet, 'Receta ' + bp.id + ' copiada')">
                      Copiar Receta
                    </m3-button>
                  </div>
                  <pre class="p-3.5 bg-surface-box rounded-m3-md border border-outline-sub text-[11px] font-mono text-main overflow-x-auto leading-relaxed flex-1">{{ bp.codeSnippet }}</pre>
                </div>
              </div>
            }
          </div>
        }
      }
    </m3-card>
  `
})
export class PlaybookInspectorSectionComponent {
  readonly copyToken = output<ClipboardCopyPayload>();

  readonly activeTab = signal<InspectorTabId>('oracle');
  readonly inspectorTabs: M3TabItem[] = [
    { id: 'oracle', label: 'Oráculo y 6 Preguntas', icon: 'gavel' },
    { id: 'troubleshoot', label: 'Inspector de Fallas', icon: 'troubleshoot' },
    { id: 'blueprints', label: '4 Recetas Avanzadas', icon: 'schema' }
  ];

  // --- ORACLE STATE ---
  readonly sacredQuestions = PLAYBOOK_SACRED_QUESTIONS;
  readonly categoryFilters = PLAYBOOK_CATEGORY_FILTERS;
  readonly sourceFilters: readonly PlaybookSourceBadge[] = [
    'Google M3 Oficial',
    'Estándar Web / WCAG',
    'Arquitectura M3E Web',
    'Ingeniería Angular / Vercel'
  ];
  readonly totalRulesCount = PLAYBOOK_DECISION_RULES.length;

  readonly selectedCategory = signal<PlaybookCategory>('all');
  readonly selectedSource = signal<PlaybookSourceBadge | 'all'>('all');
  readonly oracleQuery = signal<string>('');

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
      const haystack = `${rule.component} ${rule.buildingAnalogy} ${rule.useWhen} ${rule.avoidWhen} ${rule.technicalWhy} ${rule.repoFile}`.toLowerCase();
      return haystack.includes(query);
    });
  });

  // --- TROUBLESHOOTER STATE ---
  readonly troubleshootingItems = PLAYBOOK_TROUBLESHOOTING;
  readonly troubleLayer = signal<'all' | PlaybookTroubleshootLayer>('all');
  readonly troubleQuery = signal<string>('');

  readonly filteredTroubleshooting = computed(() => {
    const layer = this.troubleLayer();
    const query = this.troubleQuery().trim().toLowerCase();

    return PLAYBOOK_TROUBLESHOOTING.filter((item) => {
      if (layer !== 'all' && item.layer !== layer) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = `${item.symptom} ${item.cause} ${item.fixRule} ${item.fixSnippet} ${item.layerLabel}`.toLowerCase();
      return haystack.includes(query);
    });
  });

  // --- BLUEPRINTS STATE ---
  readonly blueprintTabs = PLAYBOOK_BLUEPRINT_TABS;
  readonly activeBlueprintId = signal<string>('ports');
  readonly activeBlueprint = computed(
    () => PLAYBOOK_BLUEPRINTS.find((bp) => bp.id === this.activeBlueprintId()) ?? PLAYBOOK_BLUEPRINTS[0]
  );

  moduleMeta(id: PlaybookModuleId): { label: string; route: string } {
    return MODULE_LABELS[id];
  }

  resetOracleFilters(): void {
    this.selectedCategory.set('all');
    this.selectedSource.set('all');
    this.oracleQuery.set('');
  }

  resetTroubleFilters(): void {
    this.troubleLayer.set('all');
    this.troubleQuery.set('');
  }

  sourceBadgeClass(badge: PlaybookSourceBadge): string {
    const base = 'px-2 py-0.5 rounded-m3-full text-[10px] font-bold shrink-0';
    if (badge === 'Google M3 Oficial') {
      return `${base} bg-primary-box text-on-primary-box`;
    }
    if (badge === 'Estándar Web / WCAG') {
      return `${base} bg-sec-box text-on-sec-box`;
    }
    if (badge === 'Ingeniería Angular / Vercel') {
      return `${base} bg-success-box text-on-success-box`;
    }
    return `${base} bg-tertiary-box text-on-tertiary-box`;
  }

  emitCopy(text: string, message: string): void {
    this.copyToken.emit({ text, message });
  }
}
