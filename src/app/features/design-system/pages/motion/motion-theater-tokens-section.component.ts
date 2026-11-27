import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { MotionReplayHandle } from './motion-replay.util';
import {
  CANONICAL_DURATIONS,
  CANONICAL_EASINGS,
  CanonicalEasingSpec,
  MOTION_THEATER_SETS
} from './motion-specs.data';

/**
 * Interactive lab for Pillar 4: SVG Motion Theater (Emphasized vs Standard),
 * single-shot calm curves (`both` / `forwards`) with optional 3x slow-motion inspection,
 * 16 Canonical Duration Scale with dual track + pairing validation,
 * 4 real interactive canonical duration examples, and the 10-token Easing Matrix.
 */
@Component({
  selector: 'app-motion-theater-tokens-section',
  standalone: true,
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3CardComponent, M3ChipComponent, M3SwitchComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card id="motion-theater" variant="outlined" padding="md" customClass="space-y-6">
      <!-- ENCABEZADO + CONTROLES DEL TEATRO SVG -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">ssid_chart</span>
            Pilar 4 • Teatro de Curvas SVG, 16 Duraciones y Validador de Pares
          </div>
          <h3 class="text-title-md-emphasized text-main">
            Curvas Calibradas M3 + Escala Oficial de 50ms a 1000ms
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Explorá cada curva tal como corre en producción (<code class="font-mono text-primary">both</code> / <code class="font-mono text-primary">forwards</code>, sin ida y vuelta frenético) o activá <strong>Cámara Lenta (3x)</strong> para distinguir cómo acelera y frena con nitidez.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <m3-button-group
            variant="connected"
            selectionMode="single"
            size="sm"
            ariaLabel="Conjunto de curvas del teatro"
            [options]="theaterSetOptions"
            [value]="[theaterSet()]"
            (selectionChange)="onTheaterSetSelection($event)" />
          <m3-chip
            type="filter"
            icon="slow_motion_video"
            [selected]="slowMotionStudy()"
            (action)="toggleSlowMotionStudy()">
            {{ slowMotionStudy() ? 'Cámara Lenta (3x)' : 'Ver en 3x Lento' }}
          </m3-chip>
          <m3-button variant="filled" size="sm" icon="play_arrow" (action)="triggerTheater()">
            Disparar Teatro
          </m3-button>
        </div>
      </div>

      <!-- TEATRO SVG: 3 ROLES DEL CONJUNTO ACTIVO (One-shot fidélisimo como M3 Docs) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-xs font-bold text-main">{{ motionTheaterSpecs().title }}</span>
          <span class="text-[11px] text-muted">
            {{ motionTheaterSpecs().description }}
            {{ slowMotionStudy() ? ' • Escala estudio 3x activa' : '' }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          @for (card of motionTheaterSpecs().cards; track card.id) {
            <m3-card
              [interactive]="false"
              [variant]="selectedEasing() === card.id ? 'elevated' : 'outlined'"
              [surface]="selectedEasing() === card.id ? 'box' : 'low'"
              padding="md"
              shape="lg"
              [customClass]="
                'flex flex-col justify-between space-y-3 ' +
                (selectedEasing() === card.id ? 'ring-1 ring-primary/50' : '')
              ">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                    {{ card.role }}
                  </span>
                  <span class="text-[10px] font-mono text-muted">
                    {{ card.durationToken }}{{ slowMotionStudy() ? ' ×3' : '' }}
                  </span>
                </div>

                <h4 class="text-xs font-bold text-main">{{ card.title }}</h4>

                <!-- SVG de la curva + Canal vertical de bolilla -->
                <div class="h-32 grid grid-cols-[1fr_44px] gap-3 items-center p-3 rounded-m3-md bg-surface border border-outline-sub overflow-hidden">
                  <div class="h-full flex flex-col justify-between">
                    <svg viewBox="0 0 140 90" class="w-full h-22 overflow-visible" aria-hidden="true">
                      <path [attr.d]="card.svgArea" fill="color-mix(in oklch, var(--md-sys-color-primary) 16%, transparent)" />
                      <path [attr.d]="card.svgCurve" fill="none" stroke="var(--md-sys-color-primary)" stroke-width="2.5" stroke-linecap="round" />
                    </svg>
                    <div class="flex items-center justify-between text-[9px] font-mono text-muted">
                      <span>0s</span>
                      <span>Tiempo →</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div class="w-10 h-full mx-auto rounded-m3-full bg-surface-high border border-outline-sub p-1 flex justify-center relative overflow-hidden">
                    <span
                      class="w-7 h-7 rounded-m3-full bg-primary text-on-primary grid place-items-center shadow-md absolute"
                      [style.animation]="
                        theaterReplay.active()
                          ? card.animName + ' ' + card.durationMs * speedScale() + 'ms ' + card.css + ' both'
                          : 'none'
                      ">
                      <span class="material-symbols-rounded text-sm" aria-hidden="true">
                        {{ card.animationType === 'decelerate' ? 'north' : (card.animationType === 'accelerate' ? 'south' : 'swap_vert') }}
                      </span>
                    </span>
                  </div>
                </div>

                <p class="text-[11px] text-muted leading-snug">{{ card.why }}</p>
                <p class="text-[10px] text-main">
                  <strong>Cuándo:</strong> {{ card.when }}
                </p>
              </div>

              <div class="pt-2 border-t border-outline-sub/60 flex items-center justify-between gap-2 flex-wrap">
                <m3-button
                  [variant]="selectedEasing() === card.id ? 'filled' : 'tonal'"
                  size="xs"
                  icon="play_arrow"
                  (action)="selectTheaterCard(card.id)">
                  {{ selectedEasing() === card.id ? 'Activa en Pista' : 'Probar Curva' }}
                </m3-button>
                <m3-button
                  variant="text"
                  size="xs"
                  icon="content_copy"
                  (action)="copyTokenValue(card.css, card.title)">
                  Copiar CSS
                </m3-button>
              </div>
            </m3-card>
          }
        </div>
      </div>

      <!-- ESCALA DE 16 DURACIONES + PISTA DUAL FORWARDS + VALIDADOR -->
      <div class="p-4 rounded-m3-xl bg-surface border border-outline-sub space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <span class="text-xs font-bold text-main block">Escala Completa de 16 Duraciones Oficiales M3 (50ms → 1000ms)</span>
            <span class="text-[11px] text-muted">Tocá cualquier duración para disparar una pasada real izquierda → derecha y validarla contra el Easing activo.</span>
          </div>
          <span class="text-xs font-mono text-primary font-bold shrink-0">
            {{ selectedDurationName() }} ({{ effectiveSelectedDuration() }}ms{{ slowMotionStudy() ? ' = 3x' : '' }}) + {{ activeEasingSpec().label }}
          </span>
        </div>

        <div class="flex flex-wrap gap-1.5" role="group" aria-label="16 Tokens Oficiales de Duración">
          @for (d of canonicalDurations; track d.name) {
            <m3-chip
              type="filter"
              [selected]="selectedDurationName() === d.name"
              (action)="selectDuration(d.name, d.ms)">
              {{ d.name }} • {{ d.ms }}ms
            </m3-chip>
          }
        </div>

        <!-- Pista dual (barra scaleX + puck forwards) + Banner Validador -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div class="lg:col-span-6 p-3 rounded-m3-lg bg-surface-high border border-outline-sub space-y-2.5">
            <div class="flex items-center justify-between gap-2 text-[11px]">
              <span class="font-bold text-main">
                Pista Comparativa ({{ selectedDuration() }}ms{{ slowMotionStudy() ? ' • viendo en ' + effectiveSelectedDuration() + 'ms' : '' }})
              </span>
              <div class="flex items-center gap-1.5">
                <m3-button variant="tonal" size="xs" icon="replay" (action)="replayDurationTrack()">
                  Re-disparar Pista
                </m3-button>
                <m3-button
                  variant="text"
                  size="xs"
                  icon="content_copy"
                  (action)="copyTokenValue('var(--md-sys-motion-duration-' + selectedDurationName() + ')', selectedDurationName())">
                  Token
                </m3-button>
              </div>
            </div>

            <!-- Barra de llenado progresivo -->
            <div class="h-2.5 w-full bg-surface-box rounded-m3-full overflow-hidden border border-outline-sub p-0.5">
              <div
                class="h-full w-full origin-left bg-primary rounded-m3-full"
                [style.animation]="
                  durationReplay.active()
                    ? 'm3DurationTrack ' + effectiveSelectedDuration() + 'ms ' + activeEasingSpec().curve + ' forwards'
                    : 'none'
                ">
              </div>
            </div>

            <!-- Puck cinético one-shot (forwards, sin ping-pong caótico) -->
            <div
              class="h-10 rounded-m3-full bg-surface-box border border-outline-sub p-1 flex items-center overflow-hidden"
              style="container-type: inline-size;">
              <div
                class="h-7 px-2.5 rounded-m3-full bg-primary text-on-primary text-[10px] font-bold flex items-center gap-1 shrink-0"
                [style.animation]="
                  durationReplay.active()
                    ? 'm3PuckMove ' + effectiveSelectedDuration() + 'ms ' + activeEasingSpec().curve + ' forwards'
                    : 'none'
                ">
                <span>{{ selectedDuration() }}ms</span>
                <span class="material-symbols-rounded text-xs" aria-hidden="true">arrow_forward</span>
              </div>
            </div>
          </div>

          <div
            class="lg:col-span-6 p-3 rounded-m3-lg border flex items-start gap-2.5"
            [class]="pairingStatus().valid ? 'bg-success-box/35 border-success/40' : 'bg-warning-box/45 border-warning/50'">
            <span
              class="material-symbols-rounded text-lg shrink-0 mt-0.5"
              [class.text-success]="pairingStatus().valid"
              [class.text-warning]="!pairingStatus().valid"
              aria-hidden="true">
              {{ pairingStatus().valid ? 'check_circle' : 'warning' }}
            </span>
            <div class="space-y-0.5 text-xs">
              <span class="font-bold text-main block">{{ pairingStatus().label }}</span>
              <p class="text-[11px] text-muted leading-snug">{{ pairingStatus().text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 EJEMPLOS CANÓNICOS REALES POR RANGO DE DURACIÓN -->
      <div class="space-y-3">
        <span class="text-xs font-bold text-main block">4 Ejemplos Prácticos Reales por Familia de Duración</span>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <!-- Caso 1: Short (200ms Switch) -->
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <span class="text-[10px] font-mono text-primary font-bold">1. SHORT (short4 • 200ms)</span>
              <h4 class="text-xs font-bold text-main">Micro-Controles &amp; Switch M3</h4>
              <p class="text-[11px] text-muted leading-snug">Feedback inmediato para checkboxes, chips y switches sin demorar tareas rápidas.</p>
            </div>
            <div class="pt-2 flex items-center justify-between gap-2">
              <m3-switch label="Modo Compacto" [(checked)]="demoCanonicalSelection" />
            </div>
          </m3-card>

          <!-- Caso 2: Medium (400ms FAB to Action Menu) -->
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <span class="text-[10px] font-mono text-primary font-bold">2. MEDIUM (medium4 • 400ms)</span>
              <h4 class="text-xs font-bold text-main">FAB ↔ Sheet de Acciones</h4>
              <p class="text-[11px] text-muted leading-snug">Menús medianos y sheets locales usando dimensión explícita acotada.</p>
            </div>
            <div class="flex flex-col items-start gap-2">
              <m3-button variant="tonal" size="sm" [icon]="demoCanonicalFabSheet() ? 'close' : 'bolt'" (action)="demoCanonicalFabSheet.set(!demoCanonicalFabSheet())">
                {{ demoCanonicalFabSheet() ? 'Cerrar Acciones' : 'Abrir Acciones' }}
              </m3-button>
              <div
                [attr.inert]="!demoCanonicalFabSheet() ? '' : null"
                [attr.aria-hidden]="!demoCanonicalFabSheet()"
                [class]="'w-full max-w-full rounded-m3-md bg-surface-box border-outline-sub overflow-hidden px-3 flex items-center justify-between text-[11px] ' + (demoCanonicalFabSheet() ? 'border h-10 opacity-100' : 'border-0 h-0 opacity-0')"
                style="transition-property: height, opacity, border-width; transition-duration: var(--md-sys-motion-duration-medium4); transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate);">
                <span class="font-semibold text-main">Exportar CSV</span>
                <span class="text-primary font-mono">400ms</span>
              </div>
            </div>
          </m3-card>

          <!-- Caso 3: Long (500ms / 250ms Asymmetric Card Expand) -->
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <span class="text-[10px] font-mono text-primary font-bold">3. LONG (500ms / 250ms)</span>
              <h4 class="text-xs font-bold text-main">Card Container Transform Asimétrico</h4>
              <p class="text-[11px] text-muted leading-snug">Expande generoso (500ms) y vuelve ágil (250ms) preservando el marco visual.</p>
            </div>
            <div class="space-y-2">
              <m3-button variant="outlined" size="sm" [icon]="demoCanonicalCardExpanded() ? 'expand_less' : 'expand_more'" (action)="demoCanonicalCardExpanded.set(!demoCanonicalCardExpanded())">
                {{ demoCanonicalCardExpanded() ? 'Contraer (250ms)' : 'Expandir (500ms)' }}
              </m3-button>
              <div
                [attr.inert]="!demoCanonicalCardExpanded() ? '' : null"
                [attr.aria-hidden]="!demoCanonicalCardExpanded()"
                [class]="'rounded-m3-md bg-surface-box border-outline-sub overflow-hidden px-3 flex items-center text-[11px] text-muted ' + (demoCanonicalCardExpanded() ? 'border h-11 opacity-100' : 'border-0 h-0 opacity-0')"
                style="transition-property: height, opacity, border-width;"
                [style.transition-duration]="demoCanonicalCardExpanded() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                [style.transition-timing-function]="'var(--md-sys-motion-easing-emphasized)'">
                Detalle asimétrico recuperable listo.
              </div>
            </div>
          </m3-card>

          <!-- Caso 4: Extra Long (1000ms Real Sliding Hero Carousel) -->
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div class="space-y-1">
              <span class="text-[10px] font-mono text-primary font-bold">4. EXTRA LONG (extra-long4 • 1000ms)</span>
              <h4 class="text-xs font-bold text-main">Hero Carousel &amp; Transición de Escena</h4>
              <div class="overflow-hidden rounded-m3-md border border-outline-sub bg-surface-box">
                <div
                  class="flex"
                  style="transition-property: transform; transition-duration: var(--md-sys-motion-duration-extra-long4); transition-timing-function: var(--md-sys-motion-easing-emphasized);"
                  [style.transform]="'translateX(-' + demoCanonicalCarouselIndex() * 100 + '%)'">
                  <div class="w-full shrink-0 p-2.5 text-[11px] bg-primary-box/35 text-main font-semibold">
                    Escena 1: Campaña OKLCH (1000ms)
                  </div>
                  <div class="w-full shrink-0 p-2.5 text-[11px] bg-sec-box/45 text-main font-semibold">
                    Escena 2: Telemetría KDS en Vivo
                  </div>
                  <div class="w-full shrink-0 p-2.5 text-[11px] bg-tertiary-box/45 text-main font-semibold">
                    Escena 3: Resumen Expressive
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between gap-2 pt-1">
              <span class="text-xs font-bold text-main">Slide {{ demoCanonicalCarouselIndex() + 1 }} / 3</span>
              <m3-button variant="tonal" size="sm" icon="arrow_forward" (action)="nextCanonicalCarousel()">
                Siguiente Escena
              </m3-button>
            </div>
          </m3-card>
        </div>
      </div>

      <!-- CARPETA COLAPSABLE DE LOS 10 TOKENS CANÓNICOS DE EASING -->
      <div class="pt-3 border-t border-outline-sub space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span class="text-xs font-bold text-main block">Matriz Completa: Los 10 Tokens Canónicos de Easing M3</span>
            <span class="text-[11px] text-muted">Paridad multiplataforma (CSS, Android Compose, Flutter e iOS). Aplicá en pista o copiá la variable.</span>
          </div>
          <m3-button variant="outlined" size="sm" icon="folder_open" [toggle]="true" [(selected)]="demoEasingFolderOpen">
            {{ demoEasingFolderOpen() ? 'Ocultar Matriz (10)' : 'Mostrar Matriz (10)' }}
          </m3-button>
        </div>

        @if (demoEasingFolderOpen()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 m3-anim-item-in">
            @for (easing of canonicalEasings; track easing.name) {
              <m3-card
                [interactive]="false"
                [variant]="selectedEasing() === easing.name ? 'elevated' : 'outlined'"
                [surface]="selectedEasing() === easing.name ? 'box' : 'low'"
                padding="sm"
                shape="lg"
                [customClass]="
                  'flex flex-col justify-between space-y-2 ' +
                  (selectedEasing() === easing.name ? 'ring-1 ring-primary/50' : '')
                ">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="px-2 py-0.5 rounded-m3-full bg-surface text-[10px] font-bold text-primary">{{ easing.category }}</span>
                    <span class="text-xs font-bold text-main truncate">{{ easing.label }}</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <m3-button
                      [variant]="selectedEasing() === easing.name ? 'filled' : 'tonal'"
                      size="xs"
                      (action)="selectEasing(easing.name)">
                      {{ selectedEasing() === easing.name ? 'En Pista' : 'Aplicar' }}
                    </m3-button>
                    <m3-button
                      variant="text"
                      size="xs"
                      icon="content_copy"
                      (action)="copyTokenValue('var(' + easing.cssVar + ')', easing.label)">
                      {{ easing.cssVar }}
                    </m3-button>
                  </div>
                </div>

                <p class="text-[11px] text-muted leading-snug">{{ easing.usage }}</p>

                <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-muted pt-1 border-t border-outline-sub/50">
                  <span class="truncate" [title]="easing.curve">Web: {{ easing.curve }}</span>
                  <span class="truncate" [title]="easing.android">Compose: {{ easing.android }}</span>
                </div>
              </m3-card>
            }
          </div>
        }
      </div>
    </m3-card>
  `
})
export class MotionTheaterTokensSectionComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly copyToken = output<ClipboardCopyPayload>();

  readonly theaterReplay = new MotionReplayHandle(this.destroyRef, true);
  readonly durationReplay = new MotionReplayHandle(this.destroyRef, true);

  readonly theaterSet = signal<'emphasized' | 'standard'>('emphasized');
  readonly selectedEasing = signal<string>('emphasized');
  readonly selectedDurationName = signal<string>('long2');
  readonly selectedDuration = signal<number>(500);
  readonly slowMotionStudy = signal<boolean>(false);

  readonly canonicalEasings = CANONICAL_EASINGS;
  readonly canonicalDurations = CANONICAL_DURATIONS;

  readonly theaterSetOptions: M3ButtonGroupOption[] = [
    { id: 'emphasized', label: 'Emphasized Set' },
    { id: 'standard', label: 'Standard Set' }
  ];

  readonly motionTheaterSpecs = computed(() => MOTION_THEATER_SETS[this.theaterSet()]);
  readonly speedScale = computed(() => (this.slowMotionStudy() ? 3 : 1));
  readonly effectiveSelectedDuration = computed(() => this.selectedDuration() * this.speedScale());

  readonly activeEasingSpec = computed<CanonicalEasingSpec>(() => {
    const match = CANONICAL_EASINGS.find(e => e.name === this.selectedEasing());
    return match ?? CANONICAL_EASINGS[0];
  });

  readonly pairingStatus = computed<{ valid: boolean; label: string; text: string }>(() => {
    const easing = this.selectedEasing();
    const ms = this.selectedDuration();
    const isEmphasized = easing === 'emphasized' || easing === 'emphasized-decelerate';

    if (isEmphasized && ms <= 150) {
      return {
        valid: false,
        label: 'Advertencia: Curva Larga en Duración Corta',
        text: `Usar ${easing} con ${ms}ms corta la desaceleración sedosa y genera un salto nervioso. Usá 300ms–500ms o Standard / Fast Effects.`
      };
    }

    if (easing.includes('accelerate') && ms >= 350) {
      return {
        valid: false,
        label: 'Advertencia: Salida Acelerada Demasiado Lenta',
        text: `Una curva accelerate en ${ms}ms deja el elemento colgando en pantalla. Reservá accelerate para salidas ágiles de 150ms–250ms.`
      };
    }

    return {
      valid: true,
      label: 'Emparejamiento M3 Canónico Válido',
      text: `${easing} (${ms}ms) mantiene ritmo perceptivo óptimo entre impulso inicial y reposo legible.`
    };
  });

  readonly demoCanonicalSelection = signal<boolean>(true);
  readonly demoCanonicalFabSheet = signal<boolean>(false);
  readonly demoCanonicalCardExpanded = signal<boolean>(false);
  readonly demoCanonicalCarouselIndex = signal<number>(0);
  readonly demoEasingFolderOpen = signal<boolean>(true);

  onTheaterSetSelection(ids: string[]): void {
    const next = ids[0];
    if (next === 'emphasized' || next === 'standard') {
      this.theaterSet.set(next);
      this.theaterReplay.replay();
    }
  }

  toggleSlowMotionStudy(): void {
    this.slowMotionStudy.update(v => !v);
    this.theaterReplay.replay();
    this.durationReplay.replay();
  }

  triggerTheater(): void {
    this.theaterReplay.replay();
  }

  replayDurationTrack(): void {
    this.durationReplay.replay();
  }

  selectTheaterCard(id: string): void {
    this.selectedEasing.set(id);
    this.theaterReplay.replay();
    this.durationReplay.replay();
  }

  selectDuration(name: string, ms: number): void {
    this.selectedDurationName.set(name);
    this.selectedDuration.set(ms);
    this.durationReplay.replay();
  }

  selectEasing(name: string): void {
    this.selectedEasing.set(name);
    this.durationReplay.replay();
  }

  nextCanonicalCarousel(): void {
    this.demoCanonicalCarouselIndex.update(i => (i + 1) % 3);
  }

  copyTokenValue(text: string, label: string): void {
    this.copyToken.emit({
      text,
      message: `${label}: token copiado (${text})`
    });
  }
}
