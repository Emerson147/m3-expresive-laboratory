import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { INPUT_MODALITY_SPECS } from './foundations-specs.data';

@Component({
  selector: 'app-foundations-ergonomics-section',
  standalone: true,
  imports: [M3ButtonComponent, M3CardComponent, M3SwitchComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">ads_click</span>
            Caso 2 • Interaction: Ergonomía Táctil, Inputs &amp; Selection
          </div>
          <h2 class="text-title-lg-emphasized text-main">
            Hitbox Mínimo <code class="font-mono text-primary">48×48dp</code>, Separación <code class="font-mono text-primary">≥8dp</code> y Modalidades de Entrada
          </h2>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Un icono visual compacto de 28px mantiene limpio el diseño mientras <code class="font-mono text-primary">.touch-target-48</code> expande su zona táctil a 48×48dp con <code class="font-mono">min-inline-size</code> / <code class="font-mono">min-block-size</code> y al menos <code class="font-mono">8dp</code> de aire entre controles.
          </p>
        </div>

        <m3-button
          variant="tonal"
          size="xs"
          icon="content_copy"
          customClass="shrink-0 self-start lg:self-center"
          (action)="copyRule.emit({ text: touchUtilityCss, message: 'Utilidad .touch-target-48 copiada al portapapeles' })">
          Copiar .touch-target-48
        </m3-button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-main">Tester Interactivo 48×48dp + Gap 8dp</span>
              <span class="text-[10px] font-mono text-muted">WCAG 2.2 / M3</span>
            </div>

            <div class="p-4 bg-surface rounded-m3-md border border-outline-sub flex items-center justify-between gap-4">
              <div [class]="'relative py-3 px-4 flex items-center ' + (useSafeTouchGap() ? 'gap-7' : 'gap-0')">
                <button
                  type="button"
                  (click)="hitboxClicks.update(c => c + 1)"
                  [class.touch-target-debug]="showHitbox()"
                  aria-label="Probar área táctil 48dp"
                  class="touch-target-48 state-layer focus-ring-m3 w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center cursor-pointer shadow-xs">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">touch_app</span>
                </button>
                <button
                  type="button"
                  (click)="hitboxClicks.update(c => c + 1)"
                  [class.touch-target-debug]="showHitbox()"
                  aria-label="Control adyacente de prueba"
                  class="touch-target-48 state-layer focus-ring-m3 w-7 h-7 rounded-full bg-sec-box text-on-sec-box grid place-items-center cursor-pointer shadow-xs">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">edit</span>
                </button>
              </div>

              <div class="text-right">
                <div class="text-[11px] text-muted">Taps detectados:</div>
                <div class="text-2xl font-bold font-mono text-primary">{{ hitboxClicks() }}</div>
              </div>
            </div>

            <p class="text-[11px] text-muted leading-snug">
              @if (useSafeTouchGap()) {
                Con separación <strong class="text-main">gap-7 (28px visual = 10px + 10px halo + 8dp libre)</strong>, ambos hitboxes de <code class="font-mono">48×48dp</code> respiran exactamente a <strong>8dp</strong> sin solaparse.
              } @else {
                <strong class="text-error">Sin gap (0dp):</strong> los hitboxes invisibles de 48×48dp se pisan 20px y generan toques erróneos.
              }
            </p>
          </div>

          <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2 border-t border-outline-sub/60">
            <m3-switch
              customId="ergo-hitbox-switch"
              label="Mostrar Hitbox 48dp"
              iconMode="both"
              [(checked)]="showHitbox" />
            <m3-switch
              customId="ergo-gap-switch"
              label="Separación ≥8dp"
              iconMode="both"
              [(checked)]="useSafeTouchGap" />
          </div>
        </m3-card>

        <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (mod of inputModalities; track mod.id) {
            <m3-card variant="outlined" surface="low" padding="sm" shape="lg" customClass="flex flex-col justify-between space-y-2">
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs font-bold text-main">
                  <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">{{ mod.icon }}</span>
                  <span>{{ mod.title }}</span>
                </div>
                <div class="text-[11px] text-muted leading-snug">
                  <strong class="text-main">Target:</strong> {{ mod.targetRule }}
                </div>
                <div class="text-[11px] text-muted leading-snug">
                  <strong class="text-main">Selección:</strong> {{ mod.selectionPattern }}
                </div>
              </div>
              <div class="pt-1.5 border-t border-outline-sub/60 text-[10px] font-mono text-primary">
                {{ mod.webPlatformRule }}
              </div>
            </m3-card>
          }
        </div>
      </div>
    </m3-card>
  `
})
export class FoundationsErgonomicsSectionComponent {
  readonly copyRule = output<ClipboardCopyPayload>();
  readonly inputModalities = INPUT_MODALITY_SPECS;

  readonly showHitbox = signal<boolean>(true);
  readonly useSafeTouchGap = signal<boolean>(true);
  readonly hitboxClicks = signal<number>(0);

  readonly touchUtilityCss = '.touch-target-48 { min-inline-size: 48px; min-block-size: 48px; }';
}
