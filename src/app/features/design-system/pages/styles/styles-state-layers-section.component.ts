import { ChangeDetectionStrategy, Component, computed, model, output, signal } from '@angular/core';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { STATE_OPACITY_SPECS } from './styles-specs.data';
import { ForcedStateMode, StylesCopyRequest } from './styles-copy.model';

export function computeSimulatedStateOverlay(mode: ForcedStateMode, colorExpr: string): string | null {
  if (mode === 'live' || mode === 'disabled') {
    return null;
  }
  const opacityTokenMap: Record<Exclude<ForcedStateMode, 'live' | 'disabled'>, string> = {
    hover: 'var(--md-sys-state-hover-state-layer-opacity, 0.08)',
    focus: 'var(--md-sys-state-focus-state-layer-opacity, 0.10)',
    pressed: 'var(--md-sys-state-pressed-state-layer-opacity, 0.12)',
    dragged: 'var(--md-sys-state-dragged-state-layer-opacity, 0.16)'
  };
  const pct = opacityTokenMap[mode];
  const mix = `color-mix(in oklch, ${colorExpr} calc(${pct} * 100%), transparent)`;
  return `linear-gradient(${mix}, ${mix})`;
}

@Component({
  selector: 'app-styles-state-layers-section',
  standalone: true,
  imports: [M3CardComponent, M3ChipComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-6">
      <div class="space-y-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">tune</span>
            Caso 6 • Interaction &amp; State Layers: Cómo Funcionan los Hovers, Focus y Press en Cada Componente
          </div>
          <h2 class="text-title-lg-emphasized text-main">
            Tokens <code class="font-mono text-primary">--md-sys-state-*</code> y Laboratorio en Vivo de Hovers por Rol de Color
          </h2>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            En Material 3 jamás se inventa un hex distinto por cada botón en <code class="font-mono">:hover</code>. Se superpone un velo translúcido de <code class="font-mono text-primary">currentColor</code> (<strong>8% Hover</strong>, <strong>10% Focus</strong>, <strong>12% Pressed</strong>, <strong>16% Dragged</strong>) calculado en OKLCH. Probá libremente o forzalo abajo para inspeccionar todos a la vez.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 bg-surface-low p-2.5 rounded-m3-lg border border-outline-sub" role="group" aria-label="Forzar estado de interacción M3">
          @for (mode of forcedStateModes; track mode.id) {
            <m3-chip
              type="filter"
              [selected]="forcedState() === mode.id"
              (action)="forcedState.set(mode.id)">
              {{ mode.label }}
            </m3-chip>
          }
        </div>
      </div>

      <!-- Fórmula Visual Viva -->
      <div class="px-4 py-2.5 rounded-m3-lg bg-primary-box/35 border border-primary/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-1.5 font-mono text-main">
          <span class="px-2 py-0.5 rounded bg-surface border border-outline-sub font-bold">Color Base</span>
          <span>+</span>
          <span class="px-2 py-0.5 rounded bg-primary text-on-primary font-bold">{{ activeFormulaStep() }}</span>
          <span>=</span>
          <span class="font-bold text-primary">{{ activeForcedStateLabel() }}</span>
        </div>
        <span class="text-[11px] text-muted">
          La fórmula funciona idéntica en Modo Claro y Oscuro
        </span>
      </div>

      <!-- 6.1 Los 6 Tokens Oficiales de Opacidad de Estado (3x2 en desktop para cero break-all feo) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        @for (st of stateSpecs; track st.sysToken) {
          <button
            type="button"
            (click)="copyToken.emit({ text: 'var(' + st.sysToken + ')', message: 'Copiado ' + st.sysToken + ' (' + st.percentage + ')' })"
            class="state-layer focus-ring-m3 text-left p-3.5 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-1.5 cursor-pointer">
            <div class="flex items-center justify-between w-full">
              <span class="text-xs font-bold text-main">{{ st.state }}</span>
              <span class="text-sm font-mono font-extrabold text-primary">{{ st.percentage }}</span>
            </div>
            <div class="text-[11px] font-mono text-primary break-words">{{ st.sysToken }}</div>
            <p class="text-[11px] text-muted leading-snug">{{ st.usage }}</p>
          </button>
        }
      </div>

      <!-- 6.2 Playground en Vivo de los 6 Arquetipos -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="text-xs font-bold text-main">
            Laboratorio Interactivo: Pasá el puntero (Hover), enfocá con <code class="font-mono">Tab</code> o hacé clic en los 6 Arquetipos M3
          </div>
          <span class="text-[11px] font-mono text-primary">
            Modo activo: {{ activeForcedStateLabel() }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- ARQUETIPO 1 -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-4">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">1. Botones Filled &amp; Tonal</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-box text-on-primary-box">on-primary / on-sec-box</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                En un botón <strong>Filled</strong>, <code class="font-mono text-main">currentColor</code> es <code class="font-mono text-primary">on-primary</code>: el hover al 8% aclara con la tinta del texto y eleva a Level 1.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay('var(--md-sys-color-on-primary)')"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                [class.shadow-m3-level1]="forcedState() === 'hover'"
                [class.shadow-m3-level2]="forcedState() === 'dragged'"
                class="m3-btn m3-btn-filled m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                <span class="material-symbols-rounded text-base" aria-hidden="true">bolt</span>
                <span>Filled (Hover 8%)</span>
              </button>

              <button
                type="button"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay('var(--md-sys-color-on-secondary-container)')"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                [class.shadow-m3-level1]="forcedState() === 'hover'"
                class="m3-btn m3-btn-tonal m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                <span class="material-symbols-rounded text-base" aria-hidden="true">tune</span>
                <span>Tonal (Hover 8%)</span>
              </button>
            </div>

            <button
              type="button"
              (click)="copyToken.emit({ text: 'background-image: color-mix(in oklch, var(--md-sys-color-on-primary) 8%, transparent);', message: 'Fórmula State Layer on-primary copiada' })"
              class="focus-ring-m3 text-left text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 hover:border-primary/50 cursor-pointer">
              background-image: color-mix(in oklch, var(--md-sys-color-on-primary) 8%, transparent)
            </button>
          </div>

          <!-- ARQUETIPO 2 -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-4">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">2. Botones Outlined &amp; Text</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sec-box text-on-sec-box">Velo: primary (8%)</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Como el fondo es <code class="font-mono text-main">transparent</code> y la tinta es <code class="font-mono text-primary">primary</code>, el hover al 8% <strong>sí tiñe con el color semilla</strong>.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay('var(--md-sys-color-primary)')"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                class="m3-btn m3-btn-outlined m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                <span class="material-symbols-rounded text-base" aria-hidden="true">filter_list</span>
                <span>Outlined Hover</span>
              </button>

              <button
                type="button"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay('var(--md-sys-color-primary)')"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                class="m3-btn m3-btn-text m3-btn-md state-layer focus-ring-m3 cursor-pointer">
                <span>Text Action</span>
              </button>
            </div>

            <button
              type="button"
              (click)="copyToken.emit({ text: 'background-image: color-mix(in oklch, var(--md-sys-color-primary) 8%, transparent);', message: 'Fórmula State Layer primary copiada' })"
              class="focus-ring-m3 text-left text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 hover:border-primary/50 cursor-pointer">
              background-image: color-mix(in oklch, var(--md-sys-color-primary) 8%, transparent)
            </button>
          </div>

          <!-- ARQUETIPO 3 -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">3. Card Elevated Interactiva</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-tertiary-box text-on-tertiary-box">Velo: on-surface (Neutro)</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Usa <code class="font-mono text-main">on-surface (8%)</code> neutro para no contaminar badges internos y sube de <strong>Level 1 (1dp) a Level 2 (3dp)</strong>.
              </p>
            </div>

            <button
              type="button"
              [disabled]="forcedState() === 'disabled'"
              [style.background-image]="overlay('var(--md-sys-color-on-surface)')"
              [class.shadow-m3-level2]="forcedState() === 'hover'"
              [class.shadow-m3-level4]="forcedState() === 'dragged'"
              [class.ring-2]="forcedState() === 'focus'"
              [class.ring-primary]="forcedState() === 'focus'"
              [class.scale-[0.975]]="forcedState() === 'pressed'"
              [class.is-disabled]="forcedState() === 'disabled'"
              class="m3-card m3-card-elevated m3-card-interactive state-layer focus-ring-m3 w-full text-left p-3.5 rounded-m3-lg border border-outline-sub/60 flex items-center justify-between gap-3 cursor-pointer">
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded-full bg-success-box text-on-success-box text-[10px] font-bold">SLA OK</span>
                  <span class="text-xs font-bold text-main">Card Elevated (1dp → 3dp)</span>
                </div>
                <div class="text-[11px] text-muted">Pasá el mouse: el badge verde mantiene su tono exacto.</div>
              </div>
              <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">open_in_new</span>
            </button>

            <button
              type="button"
              (click)="copyToken.emit({ text: 'box-shadow: var(--md-sys-elevation-level2);', message: 'Token de elevación Level 2 copiado' })"
              class="focus-ring-m3 text-left text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 hover:border-primary/50 cursor-pointer">
              Velo: on-surface 8% + box-shadow: var(--md-sys-elevation-level2)
            </button>
          </div>

          <!-- ARQUETIPO 4 -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">4. Cards Filled vs. Outlined</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-high text-main">0dp → 1dp en Hover</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Nacen en <strong>Level 0 (0dp)</strong>. Al hover proyectan <code class="font-mono text-main">on-surface (8%)</code> y micro-elevación <code class="font-mono">Level 1</code>.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay('var(--md-sys-color-on-surface)')"
                [class.shadow-m3-level1]="forcedState() === 'hover'"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                [class.is-disabled]="forcedState() === 'disabled'"
                class="m3-card m3-card-filled m3-card-interactive state-layer focus-ring-m3 w-full text-left p-3 rounded-m3-md cursor-pointer">
                <div class="text-xs font-bold text-main">Filled Card</div>
                <div class="text-[10px] text-muted mt-0.5">surface-highest</div>
              </button>

              <button
                type="button"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay('var(--md-sys-color-on-surface)')"
                [class.shadow-m3-level1]="forcedState() === 'hover'"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                [class.is-disabled]="forcedState() === 'disabled'"
                class="m3-card m3-card-outlined m3-card-interactive state-layer focus-ring-m3 w-full text-left p-3 rounded-m3-md cursor-pointer">
                <div class="text-xs font-bold text-main">Outlined Card</div>
                <div class="text-[10px] text-muted mt-0.5">surface + outline</div>
              </button>
            </div>

            <button
              type="button"
              (click)="copyToken.emit({ text: 'background-image: color-mix(in oklch, var(--md-sys-color-on-surface) 8%, transparent);', message: 'Fórmula neutra on-surface 8% copiada' })"
              class="focus-ring-m3 text-left text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 hover:border-primary/50 cursor-pointer">
              Contraste automático en Light (oscurece 8%) y Dark (aclara 8%)
            </button>
          </div>

          <!-- ARQUETIPO 5 -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">5. Chips (Reposo vs. Seleccionado)</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sec-box text-on-sec-box">Estado + Morph</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Sin seleccionar usa <code class="font-mono text-main">on-surface-variant (8%)</code>; al seleccionarse cambia a <code class="font-mono text-primary">secondary-container</code> + <code class="font-mono">on-secondary-container</code>.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                (click)="demoChipSelected.update(v => !v)"
                [attr.aria-pressed]="demoChipSelected()"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay(demoChipSelected() ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)')"
                [class.is-selected]="demoChipSelected()"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                class="m3-chip m3-chip-filter state-layer focus-ring-m3 cursor-pointer">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ demoChipSelected() ? 'check' : 'filter_alt' }}</span>
                <span>{{ demoChipSelected() ? 'Filtro Activo (Click)' : 'Filtro Inactivo (Click)' }}</span>
              </button>

              <button
                type="button"
                [disabled]="forcedState() === 'disabled'"
                [style.background-image]="overlay('var(--md-sys-color-on-surface)')"
                [class.ring-2]="forcedState() === 'focus'"
                [class.ring-primary]="forcedState() === 'focus'"
                [class.scale-[0.975]]="forcedState() === 'pressed'"
                class="m3-chip m3-chip-assist state-layer focus-ring-m3 cursor-pointer">
                <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">auto_awesome</span>
                <span>Assist Chip</span>
              </button>
            </div>

            <button
              type="button"
              (click)="copyToken.emit({ text: '<m3-chip type=&quot;filter&quot; [selected]=&quot;active()&quot; (action)=&quot;toggle()&quot;>Filtro</m3-chip>', message: 'Uso <m3-chip type=filter> copiado' })"
              class="focus-ring-m3 text-left text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 hover:border-primary/50 cursor-pointer">
              Hacé clic en el Filter Chip para alternar su rol y radio (16px ↔ 8px)
            </button>
          </div>

          <!-- ARQUETIPO 6 -->
          <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-main">6. List Item &amp; Navigation Pill</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-box text-on-primary-box">Fila Interactiva</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                En listas operativas y en el Navigation Rail, toda la fila proyecta <code class="font-mono text-main">.state-layer</code> al 8% en hover.
              </p>
            </div>

            <div class="space-y-1.5">
              <button
                type="button"
                (click)="demoListActive.set(1)"
                [disabled]="forcedState() === 'disabled'"
                [attr.aria-current]="demoListActive() === 1 ? 'true' : null"
                [style.background-image]="overlay(demoListActive() === 1 ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)')"
                [style.border-radius]="demoListActive() === 1 ? 'var(--md-sys-shape-corner-medium, 12px)' : 'var(--md-comp-button-shape-pill, 24px)'"
                [class]="'state-layer focus-ring-m3 w-full text-left px-3.5 py-2 border border-outline-sub/60 flex items-center justify-between text-xs transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ' + (demoListActive() === 1
                  ? 'bg-sec-box text-on-sec-box font-bold'
                  : 'bg-surface text-main')">
                <span class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">inventory_2</span>
                  <span>Ítem de Lista #1 (Click para activar)</span>
                </span>
                <span class="text-[10px] font-mono opacity-75">8% hover</span>
              </button>

              <button
                type="button"
                (click)="demoListActive.set(2)"
                [disabled]="forcedState() === 'disabled'"
                [attr.aria-current]="demoListActive() === 2 ? 'true' : null"
                [style.background-image]="overlay(demoListActive() === 2 ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)')"
                [style.border-radius]="demoListActive() === 2 ? 'var(--md-sys-shape-corner-medium, 12px)' : 'var(--md-comp-button-shape-pill, 24px)'"
                [class]="'state-layer focus-ring-m3 w-full text-left px-3.5 py-2 border border-outline-sub/60 flex items-center justify-between text-xs transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ' + (demoListActive() === 2
                  ? 'bg-sec-box text-on-sec-box font-bold'
                  : 'bg-surface text-main')">
                <span class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-base text-tertiary" aria-hidden="true">monitoring</span>
                  <span>Ítem de Lista #2 (Hover Neutro)</span>
                </span>
                <span class="text-[10px] font-mono opacity-75">8% hover</span>
              </button>
            </div>

            <button
              type="button"
              (click)="copyToken.emit({ text: 'state-layer focus-ring-m3', message: 'Clases state-layer focus-ring-m3 copiadas' })"
              class="focus-ring-m3 text-left text-[10px] font-mono text-muted bg-surface p-2 rounded border border-outline-sub/60 hover:border-primary/50 cursor-pointer">
              .state-layer hereda border-radius y aplica currentColor automáticamente
            </button>
          </div>
        </div>
      </div>
    </m3-card>
  `
})
export class StylesStateLayersSectionComponent {
  readonly forcedState = model.required<ForcedStateMode>();
  readonly copyToken = output<StylesCopyRequest>();

  readonly stateSpecs = STATE_OPACITY_SPECS;

  readonly forcedStateModes: readonly { id: ForcedStateMode; label: string }[] = [
    { id: 'live', label: 'Interacción Libre (Hover Real)' },
    { id: 'hover', label: 'Forzar Hover (8%)' },
    { id: 'focus', label: 'Forzar Focus (10%)' },
    { id: 'pressed', label: 'Forzar Pressed (12%)' },
    { id: 'dragged', label: 'Forzar Dragged (16%)' },
    { id: 'disabled', label: 'Forzar Disabled (38%/12%)' }
  ];

  readonly demoChipSelected = signal<boolean>(true);
  readonly demoListActive = signal<number>(1);

  readonly activeForcedStateLabel = computed(() =>
    this.forcedStateModes.find((m) => m.id === this.forcedState())?.label ?? 'Interacción Libre'
  );

  readonly activeFormulaStep = computed(() => {
    const mode = this.forcedState();
    if (mode === 'hover') return '8% currentColor Hover';
    if (mode === 'focus') return '10% currentColor + Focus Ring';
    if (mode === 'pressed') return '12% currentColor + scale(0.975)';
    if (mode === 'dragged') return '16% currentColor + Level +1';
    if (mode === 'disabled') return '38% Content / 12% Container';
    return '0% Reposo (hover 8% dinámico)';
  });

  overlay(colorExpr: string): string | null {
    return computeSimulatedStateOverlay(this.forcedState(), colorExpr);
  }
}
