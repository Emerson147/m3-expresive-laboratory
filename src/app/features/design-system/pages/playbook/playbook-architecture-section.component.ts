import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../../shared/components/checkbox/checkbox.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3LinearProgressComponent } from '../../../../shared/components/progress';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import {
  PLAYBOOK_CHECKLIST,
  PLAYBOOK_DEPENDENCY_FLOW,
  PLAYBOOK_LAYERS,
  PLAYBOOK_RUNTIME_PILLARS,
  PLAYBOOK_STARTER_SNIPPETS
} from './playbook-specs.data';

type StarterSnippetKey = 'copyScript' | 'stylesOrder' | 'indexHtml' | 'vercelJson';

const STARTER_SNIPPET_META: Record<
  StarterSnippetKey,
  { label: string; toast: string; code: string }
> = {
  copyScript: {
    label: '1. Bash Kit',
    toast: 'Script cp -r copiado',
    code: PLAYBOOK_STARTER_SNIPPETS.copyScript
  },
  stylesOrder: {
    label: '2. styles.css',
    toast: 'Orden de @import styles.css copiado',
    code: PLAYBOOK_STARTER_SNIPPETS.stylesOrder
  },
  indexHtml: {
    label: '3. Fuentes HTML',
    toast: 'Etiquetas de src/index.html copiadas',
    code: PLAYBOOK_STARTER_SNIPPETS.indexHtml
  },
  vercelJson: {
    label: '4. vercel.json SPA',
    toast: 'Configuración vercel.json copiada',
    code: PLAYBOOK_STARTER_SNIPPETS.vercelJson
  }
};

/**
 * Playbook Section 1: Strict architectural contracts across the 4 M3 UI layers + Runtime Core,
 * production scalability pillars, interactive checklist, and portable starter kit including Vercel SPA rules.
 */
@Component({
  selector: 'app-playbook-architecture-section',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3ChipComponent,
    M3LinearProgressComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="playbook-architecture" class="space-y-6">
      <!-- 1. REGLA DE DEPENDENCIA UNIDIRECCIONAL + CONTRATOS DE LAS 4 CAPAS -->
      <m3-card variant="outlined" padding="md" customClass="space-y-5">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">domain</span>
            Contratos de Arquitectura • Regla de Dependencia Unidireccional
          </div>
          <h3 class="text-title-md-emphasized text-main">
            Cómo Trabajan las 4 Capas M3 con tu Dominio (Qué Exporta, Qué Consume y Qué Está Prohibido)
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            La analogía de obra te ayuda a ubicar el oficio, pero lo que evita deuda técnica es la <strong>dirección única de dependencias</strong>: cada capa solo conoce a la anterior y jamás importa lógica de negocio ni estilos hacia atrás.
          </p>
        </div>

        <!-- Flujo Unidireccional -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-3 rounded-m3-lg bg-surface-low border border-outline-sub">
          @for (node of dependencyFlow; track node.step; let last = $last) {
            <div class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub flex flex-col justify-between gap-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-primary">{{ node.step }}</span>
                @if (!last) {
                  <span class="material-symbols-rounded text-sm text-muted hidden lg:inline" aria-hidden="true">arrow_forward</span>
                }
              </div>
              <div class="text-xs font-bold text-main">{{ node.label }}</div>
              <p class="text-[11px] text-muted leading-snug">{{ node.summary }}</p>
            </div>
          }
        </div>

        <!-- 4 Contratos Técnicos Detallados (sin botones redundantes de navegación) -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          @for (layer of layers; track layer.id) {
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="h-full flex flex-col justify-between space-y-3">
              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold uppercase tracking-wider">
                    {{ layer.step }}
                  </span>
                  <span class="text-[10px] font-mono text-primary font-semibold">{{ layer.moduleBadge }}</span>
                </div>

                <h4 class="text-sm font-bold text-main leading-snug">{{ layer.title }}</h4>

                <p class="text-[11px] text-main bg-surface-box p-2.5 rounded-m3-md border border-outline-sub leading-snug">
                  <strong>En obra:</strong> {{ layer.buildingMetaphor }}
                </p>

                <div class="space-y-1.5 text-[11px] leading-snug">
                  <div class="p-2 rounded-m3-sm bg-surface-box border border-primary/25">
                    <span class="font-bold text-primary uppercase text-[10px]">Exporta (Contrato):</span>
                    <p class="text-main mt-0.5">{{ layer.ownsContract }}</p>
                  </div>

                  <div class="p-2 rounded-m3-sm bg-surface-box border border-outline-sub">
                    <span class="font-bold text-main uppercase text-[10px]">Consume:</span>
                    <p class="text-muted mt-0.5">{{ layer.consumesRule }}</p>
                  </div>

                  <div class="p-2 rounded-m3-sm bg-surface-box border border-error/30">
                    <span class="font-bold text-error uppercase text-[10px]">Prohibido:</span>
                    <p class="text-main mt-0.5">{{ layer.forbiddenRule }}</p>
                  </div>
                </div>
              </div>

              <div class="pt-2.5 border-t border-outline-sub space-y-1">
                <div class="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {{ layer.copyRule }}
                </div>
                <ul class="space-y-0.5 text-[10px] font-mono text-muted">
                  @for (file of layer.files; track file) {
                    <li class="truncate" [title]="file">{{ file }}</li>
                  }
                </ul>
              </div>
            </m3-card>
          }
        </div>
      </m3-card>

      <!-- 2. LOS 3 PILARES PARA SISTEMAS COMPLEJOS, MODERNOS Y RÁPIDOS -->
      <m3-card variant="elevated" padding="md" customClass="space-y-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">rocket_launch</span>
            Más Allá de la UI M3 • Qué Exige un Sistema de Producción Complejo
          </div>
          <h3 class="text-title-md-emphasized text-main">
            Clean Architecture (Ports), Velocidad Angular (&#64;defer + Virtual Scroll) y Despliegue Vercel
          </h3>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          @for (pillar of runtimePillars; track pillar.id) {
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-sec-box text-on-sec-box text-[10px] font-bold uppercase tracking-wider">
                  {{ pillar.badge }}
                </span>
                <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">{{ pillar.icon }}</span>
              </div>

              <h4 class="text-sm font-bold text-main">{{ pillar.title }}</h4>
              <p class="text-xs text-muted leading-relaxed">{{ pillar.whyItMatters }}</p>

              <div class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub text-[11px] text-main leading-snug">
                <strong>Estándar técnico:</strong> {{ pillar.concreteStandard }}
              </div>

              <div class="text-[11px] font-medium text-primary leading-snug">
                {{ pillar.repoGapOrStatus }}
              </div>
            </m3-card>
          }
        </div>
      </m3-card>

      <!-- 3. CHECKLIST INTERACTIVO + KIT PORTABLE + VERCEL SPA -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <m3-card variant="outlined" padding="md" customClass="lg:col-span-7 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <span class="material-symbols-rounded text-base" aria-hidden="true">checklist</span>
                Checklist Paso a Paso • Proyecto Nuevo &amp; Deploy
              </div>
              <h3 class="text-title-md-emphasized text-main">Qué copiar y verificar antes de desplegar</h3>
            </div>

            <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-m3-full bg-primary-box text-on-primary-box">
              {{ completedChecklistCount() }} / {{ checklistItems.length }} listos ({{ checklistProgressPercent() }}%)
            </span>
          </div>

          <m3-linear-progress
            [value]="checklistProgressPercent()"
            [wavy]="true"
            color="primary"
            ariaLabel="Progreso de configuración inicial y despliegue M3" />

          <div class="space-y-2.5 pt-1">
            @for (item of checklistItems; track item.id) {
              <div class="p-3 bg-surface-low rounded-m3-lg border border-outline-sub flex items-start justify-between gap-3">
                <m3-checkbox
                  [label]="item.title"
                  [description]="item.whyItMatters"
                  [checked]="isChecklistDone(item.id)"
                  (changed)="toggleChecklistItem(item.id)" />

                <div class="text-end shrink-0 space-y-1">
                  <span class="inline-block px-2 py-0.5 rounded-m3-sm bg-surface-high text-main text-[10px] font-mono font-bold">
                    {{ item.layer }}
                  </span>
                  <div class="text-[10px] font-mono text-muted">{{ item.path }}</div>
                </div>
              </div>
            }
          </div>
        </m3-card>

        <m3-card variant="outlined" padding="md" customClass="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div class="space-y-3.5">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <span class="material-symbols-rounded text-base" aria-hidden="true">terminal</span>
                Kit Portable + Config Vercel SPA
              </div>
              <h3 class="text-title-md-emphasized text-main">Archivos base para portar o publicar</h3>
              <p class="text-xs text-muted leading-relaxed">
                Incluye el <code class="font-mono text-primary">vercel.json</code> real que evita 404 al recargar rutas cliente como <code class="font-mono">/design-system/playbook</code> o <code class="font-mono">/pos</code>.
              </p>
            </div>

            <div class="flex flex-wrap gap-1.5" role="group" aria-label="Seleccionar archivo del Kit Portable">
              @for (key of snippetKeys; track key) {
                <m3-chip
                  type="filter"
                  [selected]="activeSnippetKey() === key"
                  (action)="activeSnippetKey.set(key)">
                  {{ snippetMeta(key).label }}
                </m3-chip>
              }
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">{{ activeSnippet().label }}</span>
                <m3-button
                  variant="tonal"
                  size="sm"
                  icon="content_copy"
                  (action)="emitCopy(activeSnippet().code, activeSnippet().toast)">
                  Copiar código
                </m3-button>
              </div>
              <pre class="p-3 bg-surface-low rounded-m3-md border border-outline-sub text-[10px] font-mono text-main overflow-x-auto leading-relaxed min-h-44">{{ activeSnippet().code }}</pre>
            </div>
          </div>

          <div class="p-3 bg-primary-box/40 rounded-m3-md border border-primary/20 text-[11px] text-main leading-snug">
            <strong>Regla de Oro en Vercel:</strong> <code class="font-mono">&#64;angular/build:application</code> compila en <code class="font-mono">dist/m3-expressive-ui/browser</code>; sin <code class="font-mono">rewrites</code> hacia <code class="font-mono">/index.html</code> cualquier F5 fuera de <code class="font-mono">/</code> devuelve 404.
          </div>
        </m3-card>
      </div>
    </div>
  `
})
export class PlaybookArchitectureSectionComponent {
  readonly copyToken = output<ClipboardCopyPayload>();

  readonly dependencyFlow = PLAYBOOK_DEPENDENCY_FLOW;
  readonly layers = PLAYBOOK_LAYERS;
  readonly runtimePillars = PLAYBOOK_RUNTIME_PILLARS;
  readonly checklistItems = PLAYBOOK_CHECKLIST;

  readonly snippetKeys: readonly StarterSnippetKey[] = [
    'copyScript',
    'stylesOrder',
    'indexHtml',
    'vercelJson'
  ];
  readonly activeSnippetKey = signal<StarterSnippetKey>('vercelJson');
  readonly activeSnippet = computed(() => STARTER_SNIPPET_META[this.activeSnippetKey()]);

  readonly completedChecklistIds = signal<string[]>(['chk-index', 'chk-styles', 'chk-deploy']);
  readonly completedChecklistCount = computed(() => this.completedChecklistIds().length);
  readonly checklistProgressPercent = computed(() =>
    Math.round((this.completedChecklistCount() / this.checklistItems.length) * 100)
  );

  snippetMeta(key: StarterSnippetKey): { label: string; toast: string; code: string } {
    return STARTER_SNIPPET_META[key];
  }

  isChecklistDone(id: string): boolean {
    return this.completedChecklistIds().includes(id);
  }

  toggleChecklistItem(id: string): void {
    this.completedChecklistIds.update((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  emitCopy(text: string, message: string): void {
    this.copyToken.emit({ text, message });
  }
}
