import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../../shared/components/text-field/text-field.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { A11Y_FOUNDATION_SPECS, CONTENT_DESIGN_PAIRS } from './foundations-specs.data';

interface LocaleSamplePreset {
  readonly id: 'es-PE' | 'es-AR' | 'en-US';
  readonly currency: string;
  readonly label: string;
}

const LOCALE_SAMPLE_PRESETS: readonly LocaleSamplePreset[] = [
  { id: 'es-PE', currency: 'PEN', label: 'es-PE (PEN)' },
  { id: 'es-AR', currency: 'ARS', label: 'es-AR (ARS)' },
  { id: 'en-US', currency: 'USD', label: 'en-US (USD)' }
];

@Component({
  selector: 'app-foundations-a11y-content-section',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3SwitchComponent,
    M3TabsComponent,
    M3TextFieldComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      @if (showA11y()) {
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-6">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <span class="material-symbols-rounded text-base" aria-hidden="true">accessibility_new</span>
                Caso 3 • Web Accessibility (WCAG 2.2, Formularios &amp; Teclado)
              </div>
              <h2 class="text-title-lg-emphasized text-main">
                Contraste <code class="font-mono text-primary">4.5:1 / 3:1</code>, <code class="font-mono text-primary">&lt;m3-text-field&gt;</code> (<code class="font-mono">:user-invalid</code>) y Roving Tabindex
              </h2>
            </div>

            <m3-button
              variant="tonal"
              size="xs"
              icon="content_copy"
              customClass="shrink-0 self-start lg:self-center"
              (action)="copyRule.emit({ text: focusRingRuleCss, message: 'Regla .focus-ring-m3 / forced-colors copiada' })">
              Copiar Focus Ring CSS
            </m3-button>
          </div>

          <!-- 3.1 Roving Tabindex en Vivo usando el propio <m3-tabs> del kit -->
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="text-xs font-bold text-main">
                  Roving Tabindex Real en nuestro <code class="font-mono text-primary">&lt;m3-tabs&gt;</code>:
                  usá <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">Tab</kbd> una vez y navegá con
                  <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">←</kbd>
                  <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">→</kbd>
                  <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">Home</kbd>
                  <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">End</kbd>
                </div>
                <p class="text-[11px] text-muted">
                  Solo la pestaña activa mantiene <code class="font-mono">tabindex="0"</code>; el resto queda en <code class="font-mono">-1</code> para no obligar al usuario a tabular cada botón.
                </p>
              </div>
              <span class="text-[11px] font-mono text-primary font-bold shrink-0">
                tabindex="0" → {{ activeDeliveryLabel() }}
              </span>
            </div>

            <m3-tabs
              variant="secondary"
              idPrefix="roving-demo-tab"
              ariaLabel="Modo de entrega con Roving Tabindex"
              [tabs]="rovingTabItems"
              [(value)]="selectedDeliveryMode"
              (tabChange)="onDeliveryModeChange($event)" />

            <div class="flex flex-wrap gap-2 text-[10px] font-mono">
              @for (item of rovingTabItems; track item.id) {
                <span
                  [class]="'px-2 py-0.5 rounded border ' + (selectedDeliveryMode() === item.id
                    ? 'bg-primary-box text-on-primary-box border-primary font-bold'
                    : 'bg-surface text-muted border-outline-sub')">
                  {{ item.label }}: tabindex="{{ selectedDeliveryMode() === item.id ? 0 : -1 }}"
                </span>
              }
            </div>

            <div
              aria-live="polite"
              class="text-[11px] font-mono text-muted bg-surface px-3 py-2 rounded-m3-md border border-outline-sub/70">
              <strong class="text-main">aria-live="polite":</strong> {{ liveRegionMessage() }}
            </div>
          </m3-card>

          <!-- 3.2 Contraste WCAG + Formulario <m3-text-field> post-interacción -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-4">
              <div class="space-y-2.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="text-xs font-bold text-main">Contraste WCAG &amp; Independencia del Color</span>
                  <div class="flex gap-1 text-[9px] font-mono">
                    <span class="px-2 py-0.5 rounded bg-primary-box text-on-primary-box font-bold">Texto ≥ 4.5:1</span>
                    <span class="px-2 py-0.5 rounded bg-sec-box text-on-sec-box font-bold">UI / Ícono ≥ 3:1</span>
                  </div>
                </div>
                <p class="text-[11px] text-muted leading-snug">
                  Si un estado depende solo de pintar rojo o verde, falla para daltonismo y Windows <code class="font-mono">forced-colors</code>. Siempre acompañá con ícono y etiqueta explícita.
                </p>

                @if (useAccessibleErrorStyle()) {
                  <div class="p-3 rounded-m3-md bg-error-box/40 border-2 border-error flex items-center gap-2.5 text-xs text-main">
                    <span class="material-symbols-rounded text-lg text-error" aria-hidden="true">error</span>
                    <div>
                      <strong class="text-error">Error de stock (WCAG OK):</strong> Quedan 0 unidades; reponé antes de facturar.
                    </div>
                  </div>
                } @else {
                  <div class="p-3 rounded-m3-md bg-surface border border-error/40 text-xs text-error">
                    Stock: 0 unidades (solo color rojo — sin ícono ni prefijo de estado)
                  </div>
                }
              </div>

              <div class="pt-2 border-t border-outline-sub/60">
                <m3-switch
                  customId="a11y-wcag-error-switch"
                  label="Modo WCAG (Color + Ícono + Borde 3:1)"
                  iconMode="both"
                  [(checked)]="useAccessibleErrorStyle" />
              </div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">Formulario M3 (<code class="font-mono text-primary">&lt;m3-text-field&gt;</code>)</span>
                <span
                  [class]="'text-[10px] font-mono px-2 py-0.5 rounded border font-bold ' + (isEmailInvalid()
                    ? 'bg-error-box/40 border-error text-error'
                    : 'bg-surface border-outline-sub text-primary')">
                  {{ isEmailInvalid() ? 'aria-invalid="true" (post-blur)' : (hasEmailBlurred() ? 'válido tras blur' : 'sin error prematuro') }}
                </span>
              </div>

              <div class="space-y-2 bg-surface p-3.5 rounded-m3-md border border-outline-sub">
                <p id="a11y-demo-hint" class="text-[11px] text-muted">
                  Ayuda visible arriba del campo para que el autocompletado nunca la tape. Escribí un correo inválido y salí del input (<kbd class="font-mono">Tab</kbd>).
                </p>

                <m3-text-field
                  #emailField
                  [id]="'a11y-demo-email'"
                  variant="outlined"
                  type="email"
                  icon="mail"
                  label="Correo de facturación"
                  placeholder="nombre@empresa.com"
                  autocomplete="email"
                  supportingText="Se valida con :user-invalid / aria-invalid recién tras blur"
                  [required]="true"
                  [clearable]="true"
                  [showValidState]="true"
                  [(value)]="demoEmailValue" />
              </div>
            </m3-card>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (item of a11ySpecs; track item.id) {
              <m3-card variant="outlined" surface="low" padding="sm" shape="lg" customClass="flex flex-col justify-between space-y-2">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-1.5 text-xs font-bold text-main">
                    <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">{{ item.icon }}</span>
                    <span>{{ item.title }}</span>
                  </div>
                  <p class="text-[11px] text-muted leading-snug">{{ item.m3Rule }}</p>
                  <p class="text-[11px] text-main leading-snug">{{ item.implementationDetail }}</p>
                </div>
                <div class="pt-1.5 border-t border-outline-sub/60 text-[10px] text-error leading-snug">
                  <strong>Evitar:</strong> {{ item.antiPattern }}
                </div>
              </m3-card>
            }
          </div>
        </m3-card>
      }

      @if (showContent()) {
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-6">
          <div class="space-y-1 border-b border-outline-sub pb-4">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">menu_book</span>
              Caso 4 • Content Design &amp; Localización Web
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Microcopy (UX Writing), Tolerancia de Expansión (<code class="font-mono text-primary">+35%</code>) e <code class="font-mono text-primary">Intl</code> Nativo
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            @for (pair of contentPairs; track pair.category) {
              <m3-card variant="outlined" surface="low" padding="sm" shape="lg" customClass="flex flex-col justify-between space-y-2">
                <div class="space-y-2">
                  <div class="text-xs font-bold text-main">{{ pair.category }}</div>
                  <div class="p-2 rounded bg-error-box/40 text-[11px] text-main">
                    <span class="font-bold text-error block text-[10px]">EVITAR</span>
                    {{ pair.badCopy }}
                  </div>
                  <div class="p-2 rounded bg-primary-box/40 text-[11px] text-main">
                    <span class="font-bold text-primary block text-[10px]">M3 WEB</span>
                    {{ pair.goodCopy }}
                  </div>
                </div>
                <p class="text-[10px] text-muted leading-snug">{{ pair.rationale }}</p>
              </m3-card>
            }
          </div>

          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-4">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div class="space-y-0.5">
                <div class="text-xs font-bold text-main">
                  Prueba de Resiliencia: Expansión (+35%) en <code class="font-mono text-primary">&lt;m3-button&gt;</code> &amp; API <code class="font-mono text-primary">Intl</code>
                </div>
                <p class="text-[11px] text-muted">
                  Nunca fijes ancho (<code class="font-mono">w-24</code>) en botones o tabs: nuestro <code class="font-mono">&lt;m3-button&gt;</code> usa ancho intrínseco para absorber idiomas largos, mientras <code class="font-mono">Intl</code> formatea moneda y fecha nativamente.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-3 shrink-0">
                <m3-switch
                  customId="content-expansion-switch"
                  label="Simular Expansión (+35%)"
                  iconMode="both"
                  [(checked)]="simulateTextExpansion" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-surface p-4 rounded-m3-md border border-outline-sub">
              <div class="space-y-1.5">
                <span class="text-[10px] font-mono text-error font-bold block">ANTI-PATRÓN (w-24 fijo + truncate)</span>
                <button
                  type="button"
                  class="w-24 truncate px-3 py-2 rounded-full bg-error-box/40 border border-error/50 text-xs font-bold text-main">
                  {{ expandedCtaLabel() }}
                </button>
              </div>

              <div class="space-y-1.5">
                <span class="text-[10px] font-mono text-primary font-bold block">KIT M3 (&lt;m3-button&gt; flexible)</span>
                <m3-button variant="filled" size="sm" icon="save">
                  {{ expandedCtaLabel() }}
                </m3-button>
              </div>

              <div class="space-y-2">
                <m3-button-group
                  variant="connected"
                  size="xs"
                  selectionMode="single"
                  ariaLabel="Seleccionar locale para Intl nativo"
                  [options]="localeButtonOptions"
                  [value]="[activeLocaleId()]"
                  (selectionChange)="onLocaleChange($event)" />
                <div class="text-[11px]">
                  <span class="font-mono font-bold text-main block">{{ intlFormattedAmount() }}</span>
                  <span class="text-muted text-[10px]">{{ intlFormattedDate() }}</span>
                </div>
              </div>
            </div>
          </m3-card>
        </m3-card>
      }
    </div>
  `
})
export class FoundationsA11yContentSectionComponent {
  readonly showA11y = input<boolean>(true);
  readonly showContent = input<boolean>(true);
  readonly copyRule = output<ClipboardCopyPayload>();

  readonly a11ySpecs = A11Y_FOUNDATION_SPECS;
  readonly contentPairs = CONTENT_DESIGN_PAIRS;

  readonly rovingTabItems: M3TabItem[] = [
    { id: 'pickup', label: 'Retiro en Local', icon: 'storefront' },
    { id: 'delivery', label: 'Envío Express', icon: 'local_shipping' },
    { id: 'table', label: 'Servicio en Mesa', icon: 'table_restaurant' }
  ];

  readonly localeButtonOptions: M3ButtonGroupOption[] = LOCALE_SAMPLE_PRESETS.map((p) => ({
    id: p.id,
    label: p.label
  }));

  readonly focusRingRuleCss =
    '@media (forced-colors: active) { .focus-ring-m3:focus-visible { outline: 3px solid Highlight; } }';

  readonly selectedDeliveryMode = signal<string>('pickup');
  readonly useAccessibleErrorStyle = signal<boolean>(true);
  readonly demoEmailValue = signal<string>('');
  readonly simulateTextExpansion = signal<boolean>(false);
  readonly activeLocaleId = signal<LocaleSamplePreset['id']>('es-PE');

  private readonly emailField = viewChild<M3TextFieldComponent>('emailField');

  readonly isEmailInvalid = computed(() => this.emailField()?.effectiveError() ?? false);
  readonly hasEmailBlurred = computed(() => this.emailField()?.hasInteracted() ?? false);

  readonly activeDeliveryLabel = computed(
    () => this.rovingTabItems.find((t) => t.id === this.selectedDeliveryMode())?.label ?? this.rovingTabItems[0].label
  );

  readonly liveRegionMessage = computed(() => {
    const idx = this.rovingTabItems.findIndex((t) => t.id === this.selectedDeliveryMode());
    const safeIdx = idx >= 0 ? idx : 0;
    return `Opción seleccionada: ${this.rovingTabItems[safeIdx].label} (${safeIdx + 1} de ${this.rovingTabItems.length})`;
  });

  readonly expandedCtaLabel = computed(() =>
    this.simulateTextExpansion() ? 'Guardar hoy mismo' : 'Guardar'
  );

  private readonly activeLocalePreset = computed(
    () => LOCALE_SAMPLE_PRESETS.find((p) => p.id === this.activeLocaleId()) ?? LOCALE_SAMPLE_PRESETS[0]
  );

  readonly intlFormattedAmount = computed(() => {
    const preset = this.activeLocalePreset();
    return new Intl.NumberFormat(preset.id, { style: 'currency', currency: preset.currency }).format(240);
  });

  readonly intlFormattedDate = computed(() =>
    new Intl.DateTimeFormat(this.activeLocalePreset().id, { dateStyle: 'medium' }).format(new Date(2026, 10, 12))
  );

  onDeliveryModeChange(tabId: string): void {
    this.selectedDeliveryMode.set(tabId);
  }

  onLocaleChange(selected: string[]): void {
    const picked = selected[0] as LocaleSamplePreset['id'] | undefined;
    if (picked === 'es-PE' || picked === 'es-AR' || picked === 'en-US') {
      this.activeLocaleId.set(picked);
    }
  }
}
