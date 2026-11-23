import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { MotionReplayHandle } from './motion-replay.util';
import {
  SPRING_EXPRESSIVE_FAST_SPATIAL_LINEAR,
  SPRING_PHYSICS_BY_SPEED,
  SPRING_WEB_CURVES,
  SpringSpeed,
  SpringStyle
} from './motion-specs.data';

/**
 * Interactive laboratory for M3 Expressive motion fundamentals:
 * Pillar 1 (Perceptual Asymmetry: En Pantalla vs. Descartable) and
 * Pillar 2 (Spring Physics: Spatial vs. Effects, Expressive vs. Standard, bezier vs. linear()).
 */
@Component({
  selector: 'app-motion-physics-section',
  standalone: true,
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3CardComponent, M3ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="motion-physics" class="space-y-6">
      <!-- PILAR 1: CÓMO FUNCIONA EL MOVIMIENTO Y ASIMETRÍA PERCEPTUAL -->
      <m3-card variant="outlined" padding="md" customClass="space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">speed</span>
              Pilar 1 • Cómo Funciona (Asimetría Perceptual M3)
            </div>
            <h3 class="text-title-md-emphasized text-main">
              Entradas Generosas, Salidas Ágiles y Diferencia Física
            </h3>
            <p class="text-xs text-muted max-w-3xl leading-relaxed">
              Según <code class="font-mono text-primary">m3.material.io/styles/motion/overview/how-it-works</code>, el ojo humano necesita más tiempo para asimilar lo nuevo que para despedir lo conocido. Además, un objeto <strong>recuperable en pantalla</strong> jamás usa la curva brusca de salida de un overlay <strong>descartable</strong>.
            </p>
          </div>

          <m3-button-group
            variant="connected"
            selectionMode="single"
            size="sm"
            ariaLabel="Modo de Asimetría Perceptual"
            [options]="asymmetryOptions"
            [value]="[asymmetryMode()]"
            (selectionChange)="onAsymmetrySelection($event)" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Reglas teóricas + Tokens copiables -->
          <div class="lg:col-span-5 space-y-3">
            <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-3">
              @if (asymmetryMode() === 'disposable') {
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="font-bold text-main text-xs">1. Elemento Descartable (Overlay)</span>
                  <span class="px-2 py-0.5 rounded-m3-full bg-surface-box text-[10px] font-mono text-primary">Modal / Snackbar</span>
                </div>
                <p class="text-xs text-muted leading-relaxed">
                  <strong>Entrada suave, salida veloz:</strong> Entra frenando con <code class="font-mono text-main">emphasized-decelerate</code> (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-medium4', '400ms')">medium4 • 400ms</button>) y desaparece acelerando con <code class="font-mono text-main">emphasized-accelerate</code> (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-short4', '200ms')">short4 • 200ms</button>).
                </p>
              } @else {
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="font-bold text-main text-xs">2. Elemento Persistente En Pantalla</span>
                  <span class="px-2 py-0.5 rounded-m3-full bg-surface-box text-[10px] font-mono text-primary">Card / Sheet</span>
                </div>
                <p class="text-xs text-muted leading-relaxed">
                  <strong>Nunca usar accelerate al volver:</strong> Toma impulso en ida (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-long2', '500ms')">long2 • 500ms</button>) y retorna sedoso con <code class="font-mono text-main">emphasized</code> (<button type="button" class="underline decoration-dotted text-primary font-mono cursor-pointer" (click)="copyCssToken('--md-sys-motion-duration-medium1', '250ms')">medium1 • 250ms</button>) para que el ojo siga su nuevo estado sin golpe seco.
                </p>
              }

              <div class="flex flex-wrap gap-2 pt-1">
                <m3-button
                  variant="tonal"
                  size="sm"
                  icon="content_copy"
                  (action)="copyAsymmetrySnippet()">
                  Copiar Regla CSS Activa
                </m3-button>
              </div>
            </m3-card>

            <!-- Ejemplo extra: Desacoplamiento real Morph Spatial vs Effects -->
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-2.5">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="text-xs font-bold text-main">Ejemplo Vivo del Kit: Botón Morph Desacoplado</span>
                <span class="text-[10px] font-mono text-primary">350ms radio / 150ms color</span>
              </div>
              <p class="text-[11px] text-muted leading-snug">
                Hacé clic en el botón del kit: su contorno muta con <strong>Spatial (350ms, rebote)</strong> mientras el color cambia con <strong>Effects (150ms, damping 1.0)</strong>.
              </p>
              <div class="flex items-center gap-3 flex-wrap pt-1">
                <m3-button
                  variant="tonal"
                  size="md"
                  [toggle]="true"
                  [morph]="true"
                  [icon]="morphButtonActive() ? 'favorite' : 'favorite_border'"
                  [(selected)]="morphButtonActive">
                  {{ morphButtonActive() ? 'Marcado (Squircle 12px)' : 'Guardar (Pill 9999px)' }}
                </m3-button>
                <span class="text-[10px] font-mono text-muted">
                  radius: {{ morphButtonActive() ? '12px' : 'h/2' }}
                </span>
              </div>
            </m3-card>
          </div>

          <!-- Teatro interactivo de Asimetría -->
          <div class="lg:col-span-7 p-4 rounded-m3-xl bg-surface border border-outline-sub space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span class="text-xs font-bold text-main block">Simulador En Vivo de Ida vs. Vuelta</span>
                <span class="text-[11px] text-muted">Probá alternar Abrir/Cerrar y observá la diferencia de velocidad percibida.</span>
              </div>
              <m3-button
                variant="filled"
                size="sm"
                [icon]="asymmetryOpen() ? 'close_fullscreen' : 'open_in_full'"
                (action)="toggleAsymmetryDemo()">
                {{ asymmetryOpen() ? 'Contraer / Cerrar (' + (asymmetryMode() === 'onscreen' ? '250ms' : '200ms') + ')' : 'Expandir / Abrir (' + (asymmetryMode() === 'onscreen' ? '500ms' : '400ms') + ')' }}
              </m3-button>
            </div>

            <div class="h-44 rounded-m3-lg bg-surface-high border border-outline-sub/60 p-4 flex items-center justify-center relative overflow-hidden">
              @if (asymmetryMode() === 'onscreen') {
                <!-- Elemento En Pantalla: morph continuo sin desaparecer -->
                <div
                  class="border flex flex-col justify-between overflow-hidden max-w-full"
                  [class]="asymmetryOpen() ? 'w-80 h-32 p-4 rounded-m3-xl bg-primary-box border-primary shadow-md' : 'w-56 h-14 px-4 py-3 rounded-m3-full bg-surface-box border-outline shadow-xs'"
                  style="transition-property: width, height, padding, border-radius, background-color, border-color, box-shadow;"
                  [style.transition-duration]="asymmetryOpen() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                  [style.transition-timing-function]="'var(--md-sys-motion-easing-emphasized)'">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-rounded text-base text-primary shrink-0" aria-hidden="true">deployed_code</span>
                      <span class="text-xs font-bold text-main truncate">Panel En Pantalla</span>
                    </div>
                    <span class="text-[10px] font-mono text-primary shrink-0">
                      {{ asymmetryOpen() ? 'long2 • 500ms' : 'medium1 • 250ms' }}
                    </span>
                  </div>
                  <p
                    class="text-[11px] text-muted leading-snug"
                    style="transition-property: opacity;"
                    [style.transition-duration]="asymmetryOpen() ? 'var(--md-sys-motion-duration-medium2)' : 'var(--md-sys-motion-duration-short2)'"
                    [style.transition-delay]="asymmetryOpen() ? '90ms' : '0ms'"
                    [class.opacity-100]="asymmetryOpen()"
                    [class.opacity-0]="!asymmetryOpen()">
                    Al volver al reposo usa <strong>emphasized (250ms)</strong> para frenar suavemente en su slot.
                  </p>
                </div>
              } @else {
                <!-- Elemento Descartable: entra decelerate 400ms y sale accelerate 200ms -->
                <div
                  class="w-72 p-4 rounded-m3-lg bg-surface-box border border-primary/40 shadow-md flex items-start gap-3"
                  style="transition-property: transform, opacity;"
                  [style.transition-duration]="asymmetryOpen() ? 'var(--md-sys-motion-duration-medium4)' : 'var(--md-sys-motion-duration-short4)'"
                  [style.transition-timing-function]="asymmetryOpen() ? 'var(--md-sys-motion-easing-emphasized-decelerate)' : 'var(--md-sys-motion-easing-emphasized-accelerate)'"
                  [style.transform]="asymmetryOpen() ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.92)'"
                  [style.opacity]="asymmetryOpen() ? '1' : '0.18'">
                  <span class="material-symbols-rounded text-primary text-lg shrink-0 mt-0.5" aria-hidden="true">notifications_active</span>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-main">Overlay Descartable</span>
                      <span class="text-[10px] font-mono text-primary">
                        {{ asymmetryOpen() ? 'medium4 • 400ms' : 'short4 • 200ms' }}
                      </span>
                    </div>
                    <p class="text-[11px] text-muted leading-snug">
                      Al cerrarse sale del mundo visible: acelera rápido para despejar la vista del usuario sin robar foco.
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </m3-card>

      <!-- PILAR 2: SPRING PHYSICS (SPATIAL VS EFFECTS + EXPRESSIVE VS STANDARD + BEZIER VS LINEAR) -->
      <m3-card variant="outlined" padding="md" customClass="space-y-6">
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-outline-sub pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">air</span>
              Pilar 2 • Spring Physics: Spatial vs. Effects (Expressive vs. Standard)
            </div>
            <h3 class="text-title-md-emphasized text-main">
              Resorte Espacial con Sobrepaso vs. Efectos Críticamente Amortiguados (Damping 1.0)
            </h3>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              M3 Expressive reemplaza tiempos rígidos por física de masa-resorte: <strong>Spatial</strong> anima posición, escala y radios con energía calibrada; <strong>Effects</strong> mantiene siempre <code class="font-mono text-primary">damping = 1.0</code> para que colores, sombras y opacidades jamás parpadeen ni oscilen.
            </p>
          </div>
        </div>

        <!-- Barra de configuración física en M3 Button Groups -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-m3-lg bg-surface border border-outline-sub">
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-main uppercase tracking-wider block">1. Estilo del Resorte</span>
            <m3-button-group
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Estilo del resorte"
              [options]="springStyleOptions"
              [value]="[springStyle()]"
              (selectionChange)="onSpringStyleSelection($event)" />
          </div>

          <div class="space-y-2">
            <span class="text-[11px] font-bold text-main uppercase tracking-wider block">2. Velocidad (Masa/Stiffness)</span>
            <m3-button-group
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Velocidad del resorte"
              [options]="springSpeedOptions"
              [value]="[springSpeed()]"
              (selectionChange)="onSpringSpeedSelection($event)" />
          </div>

          <div class="space-y-2">
            <span class="text-[11px] font-bold text-main uppercase tracking-wider block">3. Curva CSS Web</span>
            <m3-button-group
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Aproximación de curva CSS"
              [options]="curveModeOptions()"
              [value]="[springCurveMode()]"
              (selectionChange)="onSpringCurveSelection($event)" />
          </div>
        </div>

        <!-- Comparativa Side-by-Side Spatial vs Effects -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <m3-button variant="filled" size="sm" icon="replay" (action)="replaySpringDemo()">
              Disparar Comparativa
            </m3-button>
            <m3-button variant="tonal" size="sm" icon="content_copy" (action)="copyActiveSpringTokens()">
              Copiar Tokens CSS
            </m3-button>
          </div>
          <span class="text-[11px] font-mono text-primary">
            {{ activeSpringSpecs().spatial.curveLabel }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Caja Spatial -->
          <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-4">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-main block">Familia Spatial (Posición, Escala y Radio)</span>
                <span class="text-[11px] font-mono text-primary block">
                  Damping {{ activeSpringSpecs().physics.spatial.damping }} • Stiffness {{ activeSpringSpecs().physics.spatial.stiffness }}
                </span>
              </div>
              <m3-chip type="assist" icon="content_copy" (action)="copyCssToken('--md-sys-motion-spring-fast-spatial', activeSpringSpecs().spatial.curve)">
                {{ activeSpringSpecs().spatial.duration }}ms
              </m3-chip>
            </div>

            <div class="h-28 rounded-m3-lg bg-surface-box border border-outline-sub px-4 flex items-center justify-between overflow-hidden">
              <div
                class="w-16 h-16 bg-primary text-on-primary flex items-center justify-center shadow-md font-bold text-xs shrink-0"
                [class.rounded-m3-full]="springReplay.active()"
                [class.rounded-m3-md]="!springReplay.active()"
                style="transition-property: transform, border-radius;"
                [style.transition-duration]="activeSpringSpecs().spatial.duration + 'ms'"
                [style.transition-timing-function]="activeSpringSpecs().spatial.curve"
                [style.transform]="springReplay.active() ? 'translateX(140px) scale(1.12)' : 'translateX(0px) scale(0.9)'">
                Spatial
              </div>
              <span class="text-[10px] font-mono text-muted text-right">
                {{ springStyle() === 'expressive' ? '+Rebote táctil (ζ < 0.9)' : '+Control sobrio (ζ = 0.9)' }}
              </span>
            </div>

            <div class="text-[10px] font-mono text-muted break-all p-2.5 rounded-m3-md bg-surface border border-outline-sub/60">
              {{ activeSpringSpecs().spatial.curve }}
            </div>
          </m3-card>

          <!-- Caja Effects -->
          <m3-card variant="filled" surface="high" padding="md" shape="lg" customClass="space-y-4">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="space-y-0.5">
                <span class="text-xs font-bold text-main block">Familia Effects (Color, Opacidad y Elevación)</span>
                <span class="text-[11px] font-mono text-primary block">
                  Damping {{ activeSpringSpecs().physics.effects.damping }} • Stiffness {{ activeSpringSpecs().physics.effects.stiffness }}
                </span>
              </div>
              <m3-chip type="assist" icon="content_copy" (action)="copyCssToken('--md-sys-motion-spring-fast-effects', activeSpringSpecs().effects.curve)">
                {{ activeSpringSpecs().effects.duration }}ms • Cero Rebote
              </m3-chip>
            </div>

            <div class="h-28 rounded-m3-lg bg-surface-box border border-outline-sub px-4 flex items-center justify-between gap-4">
              <div
                class="flex-1 h-16 rounded-m3-lg border flex items-center justify-center px-3 text-xs font-semibold"
                style="transition-property: background-color, border-color, opacity, color;"
                [style.transition-duration]="activeSpringSpecs().effects.duration + 'ms'"
                [style.transition-timing-function]="activeSpringSpecs().effects.curve"
                [class]="springReplay.active() ? 'bg-secondary-box border-secondary text-on-secondary-box opacity-100' : 'bg-surface border-outline text-muted opacity-55'">
                Effects: Cambio Cromático Limpio (Sin Oscilación)
              </div>
            </div>

            <div class="text-[10px] font-mono text-muted break-all p-2.5 rounded-m3-md bg-surface border border-outline-sub/60">
              {{ activeSpringSpecs().effects.curve }}
            </div>
          </m3-card>
        </div>
      </m3-card>
    </div>
  `
})
export class MotionPhysicsSectionComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly copyToken = output<ClipboardCopyPayload>();

  readonly springReplay = new MotionReplayHandle(this.destroyRef, true);

  readonly asymmetryMode = signal<'disposable' | 'onscreen'>('onscreen');
  readonly asymmetryOpen = signal<boolean>(true);
  readonly morphButtonActive = signal<boolean>(false);

  readonly springStyle = signal<SpringStyle>('expressive');
  readonly springSpeed = signal<SpringSpeed>('fast');
  readonly springCurveMode = signal<'bezier' | 'linear'>('bezier');

  readonly asymmetryOptions: M3ButtonGroupOption[] = [
    { id: 'onscreen', label: 'En Pantalla (500ms / 250ms)' },
    { id: 'disposable', label: 'Descartable (400ms / 200ms)' }
  ];

  readonly springStyleOptions: M3ButtonGroupOption[] = [
    { id: 'expressive', label: 'Expressive' },
    { id: 'standard', label: 'Standard' }
  ];

  readonly springSpeedOptions: M3ButtonGroupOption[] = [
    { id: 'fast', label: 'Fast' },
    { id: 'default', label: 'Default' },
    { id: 'slow', label: 'Slow' }
  ];

  readonly curveModeOptions = computed<M3ButtonGroupOption[]>(() => [
    { id: 'bezier', label: 'cubic-bezier()' },
    {
      id: 'linear',
      label: 'linear() Multi-Rebote',
      disabled: this.springStyle() === 'standard'
    }
  ]);

  readonly activeSpringSpecs = computed(() => {
    const style = this.springStyle();
    const speed = this.springSpeed();
    const useLinear = style === 'expressive' && this.springCurveMode() === 'linear';
    const spatial = SPRING_WEB_CURVES[style].spatial[speed];
    const effects = SPRING_WEB_CURVES[style].effects[speed];
    const physics = SPRING_PHYSICS_BY_SPEED[style][speed];

    const spatialCurve = useLinear ? SPRING_EXPRESSIVE_FAST_SPATIAL_LINEAR : spatial.curve;
    return {
      physics,
      spatial: {
        ...spatial,
        curve: spatialCurve,
        curveLabel: useLinear
          ? 'linear() Multi-Rebote (--md-sys-motion-spring-expressive-fast-spatial-linear)'
          : `${spatial.token} (${spatial.duration}ms)`
      },
      effects
    };
  });

  onAsymmetrySelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'disposable' || picked === 'onscreen') {
      this.asymmetryMode.set(picked);
      this.asymmetryOpen.set(true);
    }
  }

  toggleAsymmetryDemo(): void {
    this.asymmetryOpen.update(open => !open);
  }

  onSpringStyleSelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'expressive' || picked === 'standard') {
      this.springStyle.set(picked);
      if (picked === 'standard') {
        this.springCurveMode.set('bezier');
      }
      this.springReplay.replay();
    }
  }

  onSpringSpeedSelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'fast' || picked === 'default' || picked === 'slow') {
      this.springSpeed.set(picked);
      this.springReplay.replay();
    }
  }

  onSpringCurveSelection(ids: string[]): void {
    const picked = ids[0];
    if (picked === 'bezier' || picked === 'linear') {
      if (picked === 'linear' && this.springStyle() === 'standard') {
        return;
      }
      this.springCurveMode.set(picked);
      this.springReplay.replay();
    }
  }

  replaySpringDemo(): void {
    this.springReplay.replay();
  }

  copyCssToken(tokenName: string, preview: string): void {
    this.copyToken.emit({
      text: `var(${tokenName})`,
      message: `Copiado var(${tokenName}) (${preview})`
    });
  }

  copyAsymmetrySnippet(): void {
    const snippet =
      this.asymmetryMode() === 'onscreen'
        ? `transition-duration: var(--md-sys-motion-duration-long2); /* abrir 500ms | cerrar 250ms medium1 */\ntransition-timing-function: var(--md-sys-motion-easing-emphasized);`
        : `transition-duration: var(--md-sys-motion-duration-medium4); /* entrar 400ms | salir 200ms short4 */\ntransition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate);`;
    this.copyToken.emit({
      text: snippet,
      message: `Regla de Asimetría (${this.asymmetryMode()}) copiada al portapapeles`
    });
  }

  copyActiveSpringTokens(): void {
    const style = this.springStyle();
    const speed = this.springSpeed();
    const snippet = `--md-sys-motion-spring-${style}-${speed}-spatial-curve: ${this.activeSpringSpecs().spatial.curve};\n--md-sys-motion-spring-${style}-${speed}-effects-curve: ${this.activeSpringSpecs().effects.curve};`;
    this.copyToken.emit({
      text: snippet,
      message: `Tokens Spring (${style} / ${speed}) copiados al portapapeles`
    });
  }
}
