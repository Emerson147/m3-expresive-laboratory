import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { TOKEN_ANATOMY_EXAMPLES } from './styles-specs.data';
import { StylesCopyRequest } from './styles-copy.model';

@Component({
  selector: 'app-styles-tokens-section',
  standalone: true,
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3CardComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-5">
      <div class="space-y-3 border-b border-outline-sub pb-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">account_tree</span>
              Caso 1 • Foundations: Design Tokens Overview &amp; How to Use Tokens
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Pipeline Oficial de 3 Capas: Reference → System → Component
            </h2>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              Según <code class="font-mono text-main">m3.material.io/foundations/design-tokens</code>, los componentes jamás consumen valores crudos ni tokens de referencia (<code class="font-mono text-primary">--md-ref-*</code>). Todo pasa por el puente semántico (<code class="font-mono text-primary">--md-sys-*</code>) para que Modo Oscuro y Contraste funcionen sin reescribir CSS.
            </p>
          </div>

          <m3-button-group
            variant="connected"
            size="sm"
            selectionMode="single"
            ariaLabel="Dominios de tokens M3"
            [options]="domainOptions"
            [value]="[selectedAnatomyId()]"
            (selectionChange)="onDomainSelect($event)" />
        </div>

        <!-- Resumen didáctico en 1 línea -->
        <div class="flex flex-wrap items-center gap-2 text-[11px] bg-surface-low px-3.5 py-2 rounded-m3-md border border-outline-sub/80">
          <span class="font-bold text-primary">Modelo simple:</span>
          <span class="text-main"><strong>1. Reference</strong> = ingrediente crudo</span>
          <span class="text-muted">→</span>
          <span class="text-main"><strong>2. System</strong> = etiqueta semántica adaptable (Light / Dark / Contraste)</span>
          <span class="text-muted">→</span>
          <span class="text-main"><strong>3. Component / @theme</strong> = componente final pintado en pantalla</span>
        </div>
      </div>

      @if (activeAnatomy(); as ex) {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div class="text-xs font-bold text-main flex items-center justify-between gap-2">
              <span>Anatomía Taxonómica M3</span>
              <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-mono">{{ ex.label }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div class="p-2 rounded-m3-sm bg-surface-high border border-outline-sub">
                <div class="text-[10px] text-muted uppercase">1. Prefix</div>
                <div class="text-xs font-bold text-main mt-0.5">--{{ ex.segments.prefix }}</div>
              </div>
              <div class="p-2 rounded-m3-sm bg-primary-box text-on-primary-box">
                <div class="text-[10px] opacity-80 uppercase">2. Tier</div>
                <div class="text-xs font-bold mt-0.5">{{ ex.segments.tier }}</div>
              </div>
              <div class="p-2 rounded-m3-sm bg-sec-box text-on-sec-box">
                <div class="text-[10px] opacity-80 uppercase">3. Domain</div>
                <div class="text-xs font-bold mt-0.5">{{ ex.segments.family }}</div>
              </div>
              <div class="p-2 rounded-m3-sm bg-tertiary-box text-on-tertiary-box">
                <div class="text-[10px] opacity-80 uppercase">4. Role</div>
                <div class="text-[11px] font-bold mt-0.5 break-words leading-tight">{{ ex.segments.role }}</div>
              </div>
            </div>

            <p class="text-[11px] text-muted leading-relaxed">
              {{ ex.whyItMatters }}
            </p>
          </m3-card>

          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-2.5">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface-high text-muted">Tier 1 • Reference</span>
                  <m3-button
                    variant="text"
                    size="xs"
                    icon="content_copy"
                    [iconOnly]="true"
                    [ariaLabel]="'Copiar token de referencia ' + ex.refToken"
                    (action)="emitCopy('var(' + ex.refToken + ')', 'Copiado ' + ex.refToken)" />
                </div>
                <div class="font-mono text-xs font-bold text-main break-words leading-snug">{{ ex.refToken }}</div>
              </div>
              <div class="text-[11px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 break-words leading-snug">
                {{ ex.refValue }}
              </div>
            </m3-card>

            <m3-card variant="filled" tone="primary" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-2.5 border border-primary/35">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-on-primary font-bold">Tier 2 • System</span>
                  <m3-button
                    variant="text"
                    size="xs"
                    icon="content_copy"
                    [iconOnly]="true"
                    [ariaLabel]="'Copiar token de sistema ' + ex.sysToken"
                    (action)="emitCopy('var(' + ex.sysToken + ')', 'Copiado ' + ex.sysToken)" />
                </div>
                <div class="font-mono text-xs font-bold text-primary break-words leading-snug">{{ ex.sysToken }}</div>
              </div>
              <div class="text-[11px] text-on-primary-box/85 leading-snug">
                Cambia en vivo con <code class="font-mono text-on-primary-box">[data-theme="dark"]</code> y <code class="font-mono text-on-primary-box">[data-contrast]</code>.
              </div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-2.5">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sec-box text-on-sec-box font-bold">Tier 3 • Live</span>
                  <m3-button
                    variant="text"
                    size="xs"
                    icon="content_copy"
                    [iconOnly]="true"
                    [ariaLabel]="'Copiar token de componente ' + ex.compOrThemeToken"
                    (action)="emitCopy(ex.compOrThemeToken, 'Copiado ' + ex.compOrThemeToken)" />
                </div>
                <div class="font-mono text-xs font-bold text-main break-words leading-snug">{{ ex.compOrThemeToken }}</div>
              </div>

              <!-- Specimen vivo usando el token de ese dominio -->
              <div class="pt-1 flex items-center justify-between gap-2">
                @switch (ex.id) {
                  @case ('color') {
                    <m3-button variant="tonal" size="xs" icon="palette" (action)="emitCopy('bg-primary-box text-on-primary-box', 'Copiadas clases Primary Container')">
                      Primary Box
                    </m3-button>
                  }
                  @case ('typography') {
                    <span class="text-title-md-emphasized text-main">Headline Live</span>
                  }
                  @case ('shape') {
                    <span class="px-3 py-1.5 rounded-m3-lg bg-primary-box text-on-primary-box text-[11px] font-mono font-bold">16px M3</span>
                  }
                  @case ('elevation') {
                    <span class="px-3 py-1.5 rounded-m3-md bg-surface shadow-m3-level2 text-[11px] font-mono font-bold text-main">Level 2 (3dp)</span>
                  }
                  @default {
                    <m3-button variant="outlined" size="xs" (action)="emitCopy('.state-layer', 'Copiada utilidad .state-layer')">
                      Hover 8%
                    </m3-button>
                  }
                }
              </div>
            </m3-card>
          </div>
        </div>
      }
    </m3-card>
  `
})
export class StylesTokensSectionComponent {
  readonly copyToken = output<StylesCopyRequest>();

  readonly anatomyExamples = TOKEN_ANATOMY_EXAMPLES;
  readonly selectedAnatomyId = signal<string>(TOKEN_ANATOMY_EXAMPLES[0].id);

  readonly domainOptions: M3ButtonGroupOption[] = TOKEN_ANATOMY_EXAMPLES.map((ex) => ({
    id: ex.id,
    label: ex.category
  }));

  readonly activeAnatomy = computed(() =>
    this.anatomyExamples.find((item) => item.id === this.selectedAnatomyId()) ?? this.anatomyExamples[0]
  );

  onDomainSelect(selected: string[]): void {
    if (selected[0]) {
      this.selectedAnatomyId.set(selected[0]);
    }
  }

  emitCopy(text: string, message: string): void {
    this.copyToken.emit({ text, message });
  }
}
