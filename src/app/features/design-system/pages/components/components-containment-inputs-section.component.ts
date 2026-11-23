import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent, M3CardTone, M3CardVariant } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../../shared/components/text-field/text-field.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { CARD_GUIDELINE_SPECS, TEXT_FIELD_CONTEXT_SPECS } from './components-specs.data';

@Component({
  selector: 'app-components-containment-inputs-section',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3ChipComponent,
    M3SwitchComponent,
    M3TabsComponent,
    M3TextFieldComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-5">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">view_quilt</span>
            Pilar 2 • Containment &amp; Inputs (Cards · Chips · Text Fields)
          </div>
          <h3 class="text-title-lg-emphasized text-main">
            Contenedores Tonalmente Inteligentes, 4 Chips y Campos Modernos
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            Explorá por pestañas sin paredes verticales largas: cómo elegir variante y tono en Cards, los 4 tipos de Chips (cero anidamiento interactivo) y Text Fields modernos con <code>:user-invalid</code>, <code>[prefix]/[suffix]</code>, <code>[passwordToggle]</code> y <code>[autoGrow]</code>.
          </p>
        </div>

        <m3-button
          variant="tonal"
          size="xs"
          icon="content_copy"
          customClass="shrink-0 self-start lg:self-center"
          (action)="copyActiveContainmentSnippet()">
          Copiar Snippet ({{ activeTabLabel() }})
        </m3-button>
      </div>

      <m3-tabs
        variant="primary"
        idPrefix="comp-contain-tab"
        ariaLabel="Submódulos de Containment e Inputs"
        [tabs]="containmentTabs"
        [(value)]="activeContainmentTab" />

      <!-- TAB 1: CARDS M3 -->
      @if (activeContainmentTab() === 'cards') {
        <div id="comp-contain-panel-cards" role="tabpanel" class="space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 class="text-title-md font-bold text-main">Cards: ¿Dónde, Cómo, Por Qué y Cuándo Cambiar de Color?</h4>
              <p class="text-xs text-muted mt-0.5 max-w-4xl leading-relaxed">
                Cada card agrupa <strong>un único tema</strong>. Por defecto sigue tu <code>--seed-hue</code> automáticamente; solo usás <code>[tone]</code> semántico cuando comunicás estado o jerarquía especial.
              </p>
            </div>
            <div class="text-xs text-muted flex items-center gap-1.5 shrink-0">
              <span>Activaciones card:</span>
              <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high">
                {{ cardClicks() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <m3-card
              variant="elevated"
              [interactive]="true"
              padding="lg"
              (action)="incrementCardClicks()"
              customClass="flex flex-col justify-between min-h-[190px]">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider">1. Elevated Card</span>
                  <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">layers</span>
                </div>
                <h5 class="text-base font-bold text-main mt-1">Accionable Completa (Superficie Flotante)</h5>
                <p class="text-xs text-muted mt-1.5 leading-relaxed">
                  Usa <code>surface-container-low</code> + sombra Level 1 &rarr; 2. Regla M3: cuando toda la card es <code>role="button"</code>, no anides otro <code>&lt;button&gt;</code> dentro.
                </p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs text-primary font-semibold">
                <span class="font-mono text-[11px] text-muted">Click / Enter / keyup.space</span>
                <span class="inline-flex items-center gap-1">
                  Abrir detalle
                  <span class="material-symbols-rounded text-base" aria-hidden="true">arrow_forward</span>
                </span>
              </div>
            </m3-card>

            <m3-card
              variant="filled"
              [interactive]="false"
              padding="lg"
              customClass="flex flex-col justify-between min-h-[190px]">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-muted uppercase tracking-wider">2. Filled Card</span>
                  <span class="material-symbols-rounded text-lg text-muted" aria-hidden="true">crop_din</span>
                </div>
                <h5 class="text-base font-bold text-main mt-1">Contenedor Tonal con Acción Local</h5>
                <p class="text-xs text-muted mt-1.5 leading-relaxed">
                  Usa <code>surface-container-highest</code> (0dp sombra). Ideal en Bento Grids densas o cuando contiene botones independientes adentro.
                </p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs text-muted">
                <span class="font-mono text-[11px]">elevation: 0dp • Bento Grid</span>
                <m3-button variant="tonal" size="sm" icon="arrow_forward" (action)="incrementCardClicks()">Acción local</m3-button>
              </div>
            </m3-card>

            <m3-card
              variant="outlined"
              [interactive]="true"
              padding="lg"
              (action)="incrementCardClicks()"
              customClass="flex flex-col justify-between min-h-[190px]">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider">3. Outlined Card</span>
                  <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">border_outer</span>
                </div>
                <h5 class="text-base font-bold text-main mt-1">Estructura Nítida con Borde 1px</h5>
                <p class="text-xs text-muted mt-1.5 leading-relaxed">
                  Usa <code>surface</code> + <code>1px solid outline-variant</code>. En hover oscurece el trazo a <code>outline</code> y sube a Level 1 sin relleno pesado.
                </p>
              </div>
              <div class="pt-4 flex items-center justify-between text-xs text-primary font-semibold">
                <span class="font-mono text-[11px] text-muted">outline-variant &rarr; outline</span>
                <span class="inline-flex items-center gap-1">
                  Seleccionar card
                  <span class="material-symbols-rounded text-base" aria-hidden="true">arrow_forward</span>
                </span>
              </div>
            </m3-card>
          </div>

          <!-- Playground vivo usando ButtonGroup + Filter Chips + Switch reales -->
          <m3-card
            [variant]="demoCardVariant()"
            [tone]="demoCardTone()"
            [disabled]="demoCardDisabled()"
            padding="md"
            customClass="space-y-4">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="space-y-1 max-w-2xl">
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">palette</span>
                  <span>¿Cambiar color? (variant: {{ demoCardVariant() }} • tone: {{ demoCardTone() }})</span>
                </div>
                <h5 class="text-sm font-bold">Tokens Dinámicos vs Tono Semántico y Estado Disabled</h5>
                <p class="text-xs opacity-85 leading-relaxed">
                  En <code>default</code> sigue tu <code>--seed-hue</code> sin hardcodear colores. Probá alternar variante, tono y estado deshabilitado con controles reales del kit:
                </p>
              </div>

              <m3-switch
                customId="containment-card-disabled"
                label="Card Disabled"
                iconMode="both"
                [(checked)]="demoCardDisabled" />
            </div>

            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-outline-sub/40">
              <m3-button-group
                variant="connected"
                size="xs"
                selectionMode="single"
                ariaLabel="Variante de Card M3"
                [options]="cardVariantButtonOptions"
                [value]="[demoCardVariant()]"
                (selectionChange)="onCardVariantChange($event)" />

              <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Tono semántico de Card">
                @for (toneOpt of cardToneOptions; track toneOpt) {
                  <m3-chip
                    type="filter"
                    [selected]="demoCardTone() === toneOpt"
                    (action)="demoCardTone.set(toneOpt)">
                    {{ toneOpt }}
                  </m3-chip>
                }
              </div>
            </div>
          </m3-card>

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-3 overflow-x-auto border border-outline-sub rounded-m3-lg">
              <table class="w-full text-left border-collapse text-xs">
                <thead class="bg-surface-high text-[10px] uppercase tracking-wider text-muted font-bold">
                  <tr>
                    <th class="py-2 px-3">Variante</th>
                    <th class="py-2 px-3">Tokens M3</th>
                    <th class="py-2 px-3">Por qué / Para qué</th>
                    <th class="py-2 px-3">Dónde usarla</th>
                    <th class="py-2 px-3">Cuándo evitarla</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-sub/60">
                  @for (spec of cardGuidelineSpecs; track spec.variant) {
                    <tr class="hover:bg-surface-low">
                      <td class="py-2 px-3 font-bold text-main">{{ spec.variant }}</td>
                      <td class="py-2 px-3 font-mono text-[11px] text-primary">{{ spec.tokens }}</td>
                      <td class="py-2 px-3 text-muted">{{ spec.whyUseIt }}</td>
                      <td class="py-2 px-3 text-main">{{ spec.whereToUse }}</td>
                      <td class="py-2 px-3 text-muted">{{ spec.avoidWhen }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-2 text-xs">
              <div class="flex items-center gap-1.5 font-bold text-error">
                <span class="material-symbols-rounded text-base" aria-hidden="true">do_not_disturb_on</span>
                <span>M3 Card Don'ts</span>
              </div>
              <ul class="space-y-1.5 text-[11px] text-muted list-disc pl-4">
                <li>No usar Card si un <code>divider</code> o padding ya agrupa bien.</li>
                <li>No hacer scroll interno dentro de una Card (doble scroll).</li>
                <li>No mezclar dos temas distintos ni colores hex fijos ajenos al seed.</li>
              </ul>
            </m3-card>
          </div>
        </div>
      }

      <!-- TAB 2: CHIPS M3 -->
      @if (activeContainmentTab() === 'chips') {
        <div id="comp-contain-panel-chips" role="tabpanel" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-title-md font-bold text-main">Los 4 Tipos Canónicos de Chips</h4>
              <p class="text-xs text-muted">Filter morfa 16px ↔ 8px; Input removable usa botones hermanos sin anidamiento interactivo.</p>
            </div>
            <div class="text-xs text-muted flex items-center gap-1.5">
              <span>Filtro activo:</span>
              <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high uppercase">
                {{ demoFilter() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">1. Filter Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Selección con checkmark y morphing a squircle:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <m3-chip type="filter" [selected]="demoFilter() === 'ux'" count="8" (action)="demoFilter.set('ux')">UX Design</m3-chip>
                <m3-chip type="filter" [selected]="demoFilter() === 'code'" count="14" (action)="demoFilter.set('code')">Frontend</m3-chip>
                <m3-chip type="filter" [selected]="demoFilter() === 'qa'" count="3" (action)="demoFilter.set('qa')">Testing</m3-chip>
              </div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">2. Assist Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Atajos de acción inteligente y disparadores:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <m3-chip type="assist" icon="event" (action)="notify.emit('Chip: Agendar reunión')">Agendar reunión</m3-chip>
                <m3-chip type="assist" icon="share" (action)="notify.emit('Chip: Compartir')">Compartir</m3-chip>
                <m3-chip type="assist" icon="bookmark" (action)="notify.emit('Chip: Guardar')">Guardar</m3-chip>
              </div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">3. Input Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Entidades removibles por el usuario:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                @for (tag of inputTags(); track tag) {
                  <m3-chip type="input" [removable]="true" (remove)="removeTag(tag)">{{ tag }}</m3-chip>
                }
                @if (inputTags().length === 0) {
                  <m3-button variant="text" size="xs" icon="restart_alt" (action)="resetTags()">
                    Restaurar tags
                  </m3-button>
                }
              </div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">4. Suggestion Chips</span>
                <p class="text-[11px] text-muted mt-0.5">Sugerencias dinámicas del sistema:</p>
              </div>
              <div class="flex flex-wrap gap-2 pt-1">
                <m3-chip type="suggestion" icon="auto_awesome" (action)="notify.emit('Chip: Resumir con IA')">Resumir con IA</m3-chip>
                <m3-chip type="suggestion" icon="translate" (action)="notify.emit('Chip: Traducir')">Traducir</m3-chip>
              </div>
            </m3-card>
          </div>
        </div>
      }

      <!-- TAB 3: TEXT FIELDS MODERNOS -->
      @if (activeContainmentTab() === 'textfields') {
        <div id="comp-contain-panel-textfields" role="tabpanel" class="space-y-5">
          <div>
            <h4 class="text-title-md font-bold text-main">Text Fields Modernos: Filled (Diálogos) vs Outlined (Formularios)</h4>
            <p class="text-xs text-muted mt-1 max-w-4xl leading-relaxed">
              Superficies Stage Recess 16px: ícono leading estático, entrada <code>&#64;starting-style</code>, <code>[prefix]/[suffix]</code> con <code>aria-describedby</code>, <code>[passwordToggle]</code>, <code>[readonly]</code>, validación diferida <code>:user-invalid</code> y <code>[autoGrow]</code>.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">1. Filled + Clear + Autofill</span>
                <p class="text-[11px] text-muted mt-0.5">Superficie tonal para acciones rápidas:</p>
              </div>
              <m3-text-field
                variant="filled"
                label="Nombre Completo"
                placeholder="Ej. Alex Johnson"
                icon="person"
                autocomplete="name"
                [clearable]="true"
                [(value)]="demoFilledText"
                supportingText="Floating label interno sin cortes" />
              <div class="text-[11px] font-mono text-muted truncate">Valor: "{{ demoFilledText() }}"</div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">2. Outlined + Prefix / Suffix</span>
                <p class="text-[11px] text-muted mt-0.5">Unidades inline con vínculo WCAG:</p>
              </div>
              <m3-text-field
                variant="outlined"
                label="Presupuesto"
                placeholder="250.00"
                type="number"
                inputMode="decimal"
                prefix="S/"
                suffix="PEN"
                [(value)]="demoBudgetText"
                supportingText="Prefix y suffix ligados al screen reader" />
              <div class="text-[11px] font-mono text-muted truncate">Monto: S/ {{ demoBudgetText() || '0.00' }} PEN</div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-error uppercase tracking-wider block">3. Password Reveal &amp; Error</span>
                <p class="text-[11px] text-muted mt-0.5">Toggle accesible + estado error reactivo:</p>
              </div>
              <m3-text-field
                variant="filled"
                label="Contraseña"
                type="password"
                icon="lock"
                autocomplete="current-password"
                [passwordToggle]="true"
                [errorText]="demoErrorText() ? 'La clave debe tener al menos 8 caracteres' : null"
                [(value)]="demoPasswordText"
                supportingText="Usa visibility_off con aria-pressed" />
              <div class="pt-1">
                <m3-switch
                  customId="textfield-error-switch"
                  label="Simular error"
                  iconMode="both"
                  [(checked)]="demoErrorText" />
              </div>
            </m3-card>

            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-3">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">4. Auto-Grow (field-sizing)</span>
                <p class="text-[11px] text-muted mt-0.5">Crece verticalmente sin salto lateral:</p>
              </div>
              <m3-text-field
                variant="outlined"
                label="Criterios de Aceptación"
                placeholder="Escribí varias líneas..."
                icon="notes"
                [multiline]="true"
                [autoGrow]="true"
                [maxlength]="220"
                [(value)]="demoMultilineText"
                supportingText="min 3lh / max 10lh con field-sizing" />
            </m3-card>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <m3-card variant="filled" surface="high" padding="md" shape="xl" customClass="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold text-primary uppercase">Patrón Diálogo / Modal Breve</span>
                  <h5 class="text-sm font-bold text-main">Usá <code>variant="filled"</code> (1–3 campos focales)</h5>
                </div>
                <span class="material-symbols-rounded text-primary" aria-hidden="true">dialogs</span>
              </div>

              <div class="bg-surface p-4 rounded-m3-lg border border-outline-sub shadow-sm space-y-3">
                <m3-text-field
                  variant="filled"
                  label="Cobro rápido"
                  type="number"
                  inputMode="decimal"
                  prefix="S/"
                  enterkeyhint="done"
                  icon="payments"
                  [(value)]="demoDialogAmount"
                  supportingText="Sobre el fondo del modal, Filled da jerarquía clara al foco" />

                <div class="flex justify-end gap-2 pt-1">
                  <m3-button variant="text" size="sm" (action)="demoDialogAmount.set('120.00')">Reset</m3-button>
                  <m3-button variant="filled" size="sm" icon="check" (action)="notify.emit('Cobro registrado: S/ ' + demoDialogAmount())">
                    Confirmar
                  </m3-button>
                </div>
              </div>
            </m3-card>

            <form (submit)="onDemoFormSubmit($event)" class="bg-surface-low border border-outline-sub p-5 rounded-m3-xl space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono font-bold text-primary uppercase">Patrón Formulario Extenso (:user-invalid)</span>
                  <h5 class="text-sm font-bold text-main">Usá <code>variant="outlined"</code> + validación tras blur/submit</h5>
                </div>
                <span class="material-symbols-rounded text-primary" aria-hidden="true">dynamic_form</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <m3-text-field
                  [id]="'demo-form-email'"
                  name="email"
                  variant="outlined"
                  label="Email corporativo"
                  type="email"
                  icon="mail"
                  autocomplete="email"
                  enterkeyhint="next"
                  [required]="true"
                  [showValidState]="true"
                  [(value)]="demoFormEmail"
                  supportingText="No muestra rojo antes de perder foco" />

                <m3-text-field
                  [id]="'demo-form-code'"
                  name="siteCode"
                  variant="outlined"
                  label="Código Sede"
                  icon="badge"
                  pattern="^[A-Z]{2}-[0-9]{3}$"
                  placeholder="LM-104"
                  enterkeyhint="done"
                  [required]="true"
                  [showValidState]="true"
                  [(value)]="demoFormCode"
                  supportingText="Formato requerido: AA-123" />
              </div>

              <m3-text-field
                [id]="'demo-form-folio'"
                name="auditFolio"
                variant="outlined"
                label="Folio asignado ([readonly])"
                icon="verified"
                [readonly]="true"
                value="AUD-2026-0091"
                supportingText="Dato bloqueado copiable con foco intacto (a diferencia de disabled)" />

              <div class="flex items-center justify-between gap-3 pt-1">
                <span class="text-[11px] text-muted">Probá borrar un campo y salir (<code>blur</code>) para ver <code>:user-invalid</code>.</span>
                <m3-button type="submit" variant="tonal" size="sm" icon="task_alt">Validar Form</m3-button>
              </div>
            </form>
          </div>

          <div class="overflow-x-auto border border-outline-sub rounded-m3-lg">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-surface-high text-[10px] uppercase tracking-wider text-muted font-bold">
                <tr>
                  <th class="py-2 px-3">Contexto UI</th>
                  <th class="py-2 px-3">Variante Recomendada</th>
                  <th class="py-2 px-3">Por qué (M3 Spec)</th>
                  <th class="py-2 px-3">Estándar Web Moderno</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-sub/60">
                @for (spec of textFieldContextSpecs; track spec.context) {
                  <tr class="hover:bg-surface-low">
                    <td class="py-2 px-3 font-bold text-main">{{ spec.context }}</td>
                    <td class="py-2 px-3 font-mono text-[11px] text-primary">{{ spec.variantToUse }}</td>
                    <td class="py-2 px-3 text-muted">{{ spec.rationale }}</td>
                    <td class="py-2 px-3 font-mono text-[11px] text-main">{{ spec.modernWebPattern }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </m3-card>
  `
})
export class ComponentsContainmentInputsSectionComponent {
  readonly notify = output<string>();
  readonly copyText = output<ClipboardCopyPayload>();

  readonly cardGuidelineSpecs = CARD_GUIDELINE_SPECS;
  readonly textFieldContextSpecs = TEXT_FIELD_CONTEXT_SPECS;
  readonly cardToneOptions: M3CardTone[] = ['default', 'primary', 'secondary', 'tertiary', 'error'];

  readonly containmentTabs: M3TabItem[] = [
    { id: 'cards', label: 'Cards M3', icon: 'view_quilt', panelId: 'comp-contain-panel-cards' },
    { id: 'chips', label: 'Chips (4 Tipos)', icon: 'label', panelId: 'comp-contain-panel-chips' },
    { id: 'textfields', label: 'Text Fields Modernos', icon: 'edit_square', panelId: 'comp-contain-panel-textfields' }
  ];

  readonly cardVariantButtonOptions: M3ButtonGroupOption[] = [
    { id: 'elevated', label: 'elevated' },
    { id: 'filled', label: 'filled' },
    { id: 'outlined', label: 'outlined' }
  ];

  readonly activeContainmentTab = signal<string>('cards');
  readonly cardClicks = signal<number>(0);
  readonly demoCardVariant = signal<M3CardVariant>('outlined');
  readonly demoCardTone = signal<M3CardTone>('primary');
  readonly demoCardDisabled = signal<boolean>(false);
  readonly demoFilter = signal<'ux' | 'code' | 'qa'>('code');
  readonly inputTags = signal<string[]>(['Angular', 'OKLCH', 'Material 3']);

  readonly demoFilledText = signal<string>('Alex Johnson');
  readonly demoBudgetText = signal<string>('250.00');
  readonly demoPasswordText = signal<string>('mypass');
  readonly demoErrorText = signal<boolean>(true);
  readonly demoMultilineText = signal<string>('Validar puertos y adaptadores en arquitectura hexagonal.');
  readonly demoDialogAmount = signal<string>('120.00');
  readonly demoFormEmail = signal<string>('arquitectura@m3.dev');
  readonly demoFormCode = signal<string>('LM-104');

  activeTabLabel(): string {
    return this.containmentTabs.find((t) => t.id === this.activeContainmentTab())?.label ?? 'Cards';
  }

  onCardVariantChange(selected: string[]): void {
    const picked = selected[0] as M3CardVariant | undefined;
    if (picked === 'elevated' || picked === 'filled' || picked === 'outlined') {
      this.demoCardVariant.set(picked);
    }
  }

  incrementCardClicks(): void {
    this.cardClicks.update(c => c + 1);
  }

  removeTag(tag: string): void {
    this.inputTags.update(tags => tags.filter(t => t !== tag));
  }

  resetTags(): void {
    this.inputTags.set(['Angular', 'OKLCH', 'Material 3']);
  }

  onDemoFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (form.checkValidity()) {
      this.notify.emit(`Formulario válido: ${this.demoFormEmail()} (${this.demoFormCode()})`);
    } else {
      form.reportValidity?.();
      this.notify.emit('Revisa los campos resaltados en el formulario');
    }
  }

  copyActiveContainmentSnippet(): void {
    const tab = this.activeContainmentTab();
    if (tab === 'chips') {
      this.copyText.emit({
        text: `<m3-chip type="filter" [selected]="selected()" (action)="toggle()">OKLCH</m3-chip>\n<m3-chip type="input" [removable]="true" (remove)="onRemove()">Angular</m3-chip>`,
        message: 'Snippet <m3-chip> copiado'
      });
      return;
    }
    if (tab === 'textfields') {
      this.copyText.emit({
        text: `<m3-text-field variant="outlined" type="email" icon="mail" label="Correo" [required]="true" [showValidState]="true" [(value)]="email" />`,
        message: 'Snippet <m3-text-field> copiado'
      });
      return;
    }
    this.copyText.emit({
      text: `<m3-card variant="${this.demoCardVariant()}" tone="${this.demoCardTone()}" [disabled]="${this.demoCardDisabled()}" padding="md">...</m3-card>`,
      message: 'Snippet <m3-card> copiado'
    });
  }
}
