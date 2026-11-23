import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../../shared/components/button/button-group.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../../shared/components/checkbox/checkbox.component';
import { M3DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import {
  M3RadioComponent,
  M3RadioGroupComponent,
  M3RadioOption
} from '../../../../shared/components/radio/radio.component';
import { M3SliderComponent, M3SliderSize } from '../../../../shared/components/slider/slider.component';
import { M3SwitchComponent, M3SwitchIconMode } from '../../../../shared/components/switch/switch.component';
import { M3TabItem, M3TabsComponent, M3TabVariant } from '../../../../shared/components/tabs/tabs.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { WEB_A11Y_FIX_SPECS } from './components-specs.data';

@Component({
  selector: 'app-components-controls-overlays-section',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3DialogComponent,
    M3RadioComponent,
    M3RadioGroupComponent,
    M3SliderComponent,
    M3SwitchComponent,
    M3TabsComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Web Selection: M3 Switch -->
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box flex flex-col justify-between space-y-4">
          <div class="space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">toggle_on</span>
                  Web Essential • M3 Switch (16→28dp)
                </div>
                <h3 class="text-title-md font-bold text-main">M3 Switch (Expressive Morphing Thumb)</h3>
                <p class="text-xs text-muted mt-1 leading-relaxed">
                  Control binario inmediato sobre <code>button[role="switch"]</code> con morfing 16→24→28dp y halo circular de 40dp sobre el handle.
                </p>
              </div>

              <m3-button variant="tonal" size="xs" icon="content_copy" (action)="copySnippet('switch')">
                Copiar Switch
              </m3-button>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pb-1">
              <span class="text-[11px] font-semibold text-muted uppercase tracking-wider">Modo ícono (16dp):</span>
              <m3-button-group
                variant="connected"
                size="xs"
                selectionMode="single"
                ariaLabel="Modo de ícono para Switch M3"
                [options]="switchIconModeOptions"
                [value]="[switchIconModeDemo()]"
                (selectionChange)="onSwitchIconModeChange($event)" />
            </div>

            <div class="space-y-4 p-4 bg-surface-low rounded-m3-lg border border-outline-sub">
              <m3-switch
                label="Alertas clínicas en tiempo real"
                description="Notifica signos vitales críticos mediante Top-Layer"
                [iconMode]="switchIconModeDemo()"
                [(checked)]="switchNotifications" />

              <div class="border-t border-outline-sub/60 pt-3">
                <m3-switch
                  label="Modo densidad compacta (Desktop)"
                  description="Variante sin ícono interno hasta activar"
                  iconMode="selected"
                  [(checked)]="switchCompactDensity" />
              </div>

              <div class="border-t border-outline-sub/60 pt-3 flex items-center justify-between gap-2 flex-wrap">
                <m3-switch
                  label="Switch deshabilitado (12% / 38%)"
                  [disabled]="true"
                  [checked]="true" />
                <span class="text-[11px] font-mono text-muted">
                  Estado: {{ switchNotifications() ? 'ON' : 'OFF' }} • Modo: {{ switchIconModeDemo() }}
                </span>
              </div>
            </div>
          </div>

          <div class="p-3 bg-surface-low rounded-m3-md border border-outline-sub text-[11px] text-muted leading-snug">
            <strong class="text-main">Regla M3 Switch:</strong> aplica el cambio de inmediato sin botón Guardar; si el usuario debe confirmar un lote antes de guardar, usá <code>&lt;m3-checkbox&gt;</code>.
          </div>
        </m3-card>

        <!-- Web Overlays: Snackbar & Native M3 Dialog -->
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">notifications_active</span>
                  Web Essential • Top-Layer Overlays
                </div>
                <h3 class="text-title-md font-bold text-main">Snackbar (<code>popover="manual"</code>) &amp; M3 Dialog</h3>
                <p class="text-xs text-muted mt-1 leading-relaxed">
                  Usa <code>popover="manual"</code> para no cerrarse por accidente al navegar la pantalla (sin <em>light-dismiss</em>), y <code>&lt;dialog&gt;.showModal()</code> para modales nativos con <em>inert</em> y <code>Esc</code> automáticos.
                </p>
              </div>

              <m3-button variant="tonal" size="xs" icon="content_copy" (action)="copySnippet('dialog')">
                Copiar Dialog
              </m3-button>
            </div>

            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <m3-button
                  variant="filled"
                  icon="campaign"
                  (action)="notify.emit('Cambio guardado en preferencias Web M3')">
                  Mostrar Snackbar Manual
                </m3-button>
                <m3-button
                  variant="outlined"
                  icon="open_in_new"
                  (action)="dialogOpen.set(true)">
                  Abrir M3 Dialog (showModal)
                </m3-button>
                @if (snackbarUndoCount() > 0) {
                  <span class="text-xs font-mono text-primary font-bold">
                    Deshacer pulsado: {{ snackbarUndoCount() }}×
                  </span>
                }
              </div>
              @if (dialogLastClose()) {
                <p class="text-[11px] font-mono text-primary">
                  Último cierre de &lt;m3-dialog&gt;: {{ dialogLastClose() }}
                </p>
              } @else {
                <p class="text-[11px] text-muted">
                  El Snackbar y el Diálogo viven en el Top Layer del navegador sobre toda la jerarquía DOM sin conflictos de <code>z-index</code>.
                </p>
              }
            </div>
          </div>

          <div class="pt-3 border-t border-outline-sub text-[11px] font-mono text-muted flex flex-wrap items-center justify-between gap-2">
            <span>Split Menu: popover="auto"</span>
            <span>Modal: &lt;dialog&gt;.showModal()</span>
            <span>Toast: popover="manual"</span>
          </div>
        </m3-card>
      </div>

      <!-- Checkbox, Radio Group, Slider & Tabs -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box flex flex-col justify-between space-y-4">
          <div class="space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">check_box</span>
                  M3 Selection • Checkbox &amp; Radio Button
                </div>
                <h3 class="text-title-md font-bold text-main">Checkbox (Tri-state 18dp) &amp; Radio (&lt;m3-radio&gt; 20dp)</h3>
                <p class="text-xs text-muted mt-1 leading-relaxed">
                  Usa <code>&lt;m3-checkbox&gt;</code> para selecciones múltiples pendientes de confirmar y <code>&lt;m3-radio-group&gt;</code> (anillo 20dp, punto 10dp, halo 40dp, target 48dp) cuando hay 2–5 opciones excluyentes visibles.
                </p>
              </div>

              <m3-button variant="tonal" size="xs" icon="content_copy" (action)="copySnippet('selection')">
                Copiar Selección
              </m3-button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-low rounded-m3-lg border border-outline-sub">
              <div class="space-y-2">
                <m3-checkbox
                  label="Todos los módulos activos"
                  description="Soporta estado indeterminate automático"
                  [checked]="checkboxMaster()"
                  [indeterminate]="checkboxIndeterminate()"
                  (changed)="toggleDemoCheckboxMaster()" />

                <div class="pl-6 space-y-1 border-l-2 border-outline-sub ml-4">
                  <m3-checkbox label="Auditoría de sesiones" [(checked)]="checkboxAudit" />
                  <m3-checkbox label="Respaldo nocturno S3" [(checked)]="checkboxBackup" />
                </div>

                <div class="pt-1 border-t border-outline-sub/60">
                  <m3-checkbox
                    label="Acepto términos legales (Error)"
                    description="Obligatorio antes de facturar"
                    [error]="true" />
                </div>
              </div>

              <div class="space-y-3 sm:border-l sm:border-outline-sub sm:pl-4">
                <m3-radio-group
                  legend="Plan del cliente (options)"
                  supportingText="20dp anillo · 10dp punto · 40dp halo · 48dp target"
                  [options]="demoRadioOptions"
                  [(value)]="radioPlan" />

                <div class="pt-2.5 border-t border-outline-sub/60 space-y-2">
                  <m3-radio-group
                    legend="Entrega (<m3-radio> composable)"
                    orientation="horizontal"
                    [errorText]="radioError() ? 'Selecciona un canal de entrega habilitado' : null"
                    [(value)]="radioDelivery">
                    <m3-radio value="email" label="Email" />
                    <m3-radio value="sms">SMS</m3-radio>
                    <m3-radio value="fax" label="Fax" [disabled]="true" />
                  </m3-radio-group>

                  <div class="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <span class="text-[11px] font-mono text-primary">
                      Plan: {{ radioPlan() }} · Canal: {{ radioDelivery() }}
                    </span>
                    <m3-switch
                      customId="controls-radio-error"
                      label="Estado error"
                      iconMode="both"
                      [(checked)]="radioError" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 bg-surface-low rounded-m3-md border border-outline-sub text-[11px] text-muted leading-snug">
            <strong class="text-main">¿Y si tengo 6+ opciones?</strong> No apiles 10 radios: usa <code>.m3-select-field</code> en <code>_text-field.css</code> para ahorrar espacio cognitivo.
          </div>
        </m3-card>

        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box flex flex-col justify-between space-y-4">
          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                <span class="material-symbols-rounded text-base" aria-hidden="true">tune</span>
                M3 Slider Expressive &amp; Tabs (Roving Tabindex)
              </div>
              <h3 class="text-title-md font-bold text-main">Slider (Disjoint Gap + Stop Dots) &amp; Tabs (Primary / Secondary)</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Slider nativo sobre <code>&lt;input type="range"&gt;</code> con manija barra vertical y puntos discretos; Tabs con <code>tabindex</code> rotatorio accesible y soporte RTL automático.
              </p>
            </div>

            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <m3-button-group
                  variant="connected"
                  size="xs"
                  selectionMode="single"
                  ariaLabel="Tamaño del track del Slider M3"
                  [options]="sliderSizeGroupOptions"
                  [value]="[demoSliderSize()]"
                  (selectionChange)="onSliderSizeChange($event)" />

                <m3-switch
                  customId="controls-slider-stops"
                  label="Stop Dots"
                  iconMode="selected"
                  [(checked)]="demoSliderStops" />
              </div>

              <m3-slider
                customId="controls-budget-slider"
                label="Margen objetivo del presupuesto"
                unit="%"
                [min]="0"
                [max]="100"
                [step]="10"
                [size]="demoSliderSize()"
                [showStops]="demoSliderStops()"
                [(value)]="sliderValue" />
            </div>

            <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-[11px] font-semibold text-muted uppercase">Variante M3 Tabs:</span>
                <m3-button-group
                  variant="connected"
                  size="xs"
                  selectionMode="single"
                  ariaLabel="Variante de Tabs M3"
                  [options]="tabVariantGroupOptions"
                  [value]="[demoTabVariant()]"
                  (selectionChange)="onTabVariantChange($event)" />
              </div>

              <m3-tabs
                [tabs]="demoTabItems"
                [variant]="demoTabVariant()"
                ariaLabel="Vistas de demostración de componentes"
                [(value)]="demoActiveTab" />

              <div
                role="tabpanel"
                [attr.id]="'lab-panel-' + demoActiveTab()"
                [attr.aria-labelledby]="'m3-tab-' + demoActiveTab()"
                class="p-3 bg-surface-box rounded-m3-md border border-outline-sub text-xs text-muted">
                @if (demoActiveTab() === 'overview') {
                  <strong class="text-main">Resumen de pantalla:</strong> los tabs Primary (indicador 3dp redondeado) cambian entre vistas principales al mismo nivel jerárquico.
                } @else if (demoActiveTab() === 'specs') {
                  <strong class="text-main">Especificaciones:</strong> los tabs Secondary (indicador 2dp completo) subdividen contenido ya dentro de una ficha o panel.
                } @else {
                  <strong class="text-main">Teclado WAI-ARIA:</strong> navega entre pestañas con <code>&larr;</code> / <code>&rarr;</code>, <code>Home</code> y <code>End</code> sin romper el orden de foco.
                }
              </div>
            </div>
          </div>
        </m3-card>
      </div>

      <!-- Bugs Corregidos en el Kit -->
      <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <span class="material-symbols-rounded text-base" aria-hidden="true">build_circle</span>
            Bugs Estructurales &amp; WCAG Corregidos
          </div>
          <h3 class="text-title-md font-bold text-main">Correcciones Aplicadas en el Kit M3</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (fix of webA11yFixes; track fix.component) {
            <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-1.5">
              <span class="text-xs font-extrabold text-primary block">{{ fix.component }}</span>
              <p class="text-[11px] text-muted leading-snug">
                <strong class="text-main">Antes:</strong> {{ fix.issueFixed }}
              </p>
              <p class="text-[11px] text-muted leading-snug">
                <strong class="text-primary">Ahora:</strong> {{ fix.standardApplied }}
              </p>
            </m3-card>
          }
        </div>
      </m3-card>

      <m3-dialog
        #demoDialog
        headline="Confirmar despliegue a producción"
        icon="rocket_launch"
        ariaDescription="Diálogo modal nativo HTML5 (<dialog>.showModal()) montado en el Top Layer del navegador con backdrop semitransparente e inert automático."
        [(open)]="dialogOpen"
        (closed)="onDemoDialogClosed($event)">
        <p class="text-xs text-muted">
          Plan actual seleccionado: <strong class="text-main">{{ radioPlan() }}</strong> &bull;
          Margen: <strong class="text-main">{{ sliderValue() }}%</strong>.
          Pulsa <code>Esc</code>, hacé clic fuera o elegí una acción para verificar el ciclo de cierre nativo.
        </p>

        <div dialog-actions class="flex items-center gap-2">
          <m3-button variant="text" (action)="demoDialog.dismiss('cancel')">Cancelar</m3-button>
          <m3-button variant="filled" icon="check" (action)="demoDialog.dismiss('confirm')">Confirmar</m3-button>
        </div>
      </m3-dialog>
    </div>
  `
})
export class ComponentsControlsOverlaysSectionComponent {
  readonly notify = output<string>();
  readonly copyText = output<ClipboardCopyPayload>();
  readonly snackbarUndoCount = input<number>(0);

  readonly webA11yFixes = WEB_A11Y_FIX_SPECS;

  readonly checkboxAudit = signal<boolean>(true);
  readonly checkboxBackup = signal<boolean>(false);
  readonly checkboxMaster = computed(() => this.checkboxAudit() && this.checkboxBackup());
  readonly checkboxIndeterminate = computed(() => this.checkboxAudit() !== this.checkboxBackup());
  readonly radioPlan = signal<string>('pro');
  readonly radioDelivery = signal<string>('email');
  readonly radioError = signal<boolean>(false);
  readonly sliderValue = signal<number>(60);
  readonly dialogOpen = signal<boolean>(false);
  readonly dialogLastClose = signal<string>('');

  readonly switchNotifications = signal<boolean>(true);
  readonly switchCompactDensity = signal<boolean>(false);
  readonly switchIconModeDemo = signal<M3SwitchIconMode>('both');
  readonly switchIconModeOptions: M3ButtonGroupOption[] = [
    { id: 'both', label: 'Both' },
    { id: 'selected', label: 'Selected' },
    { id: 'none', label: 'None' }
  ];

  readonly demoRadioOptions: M3RadioOption[] = [
    { value: 'starter', label: 'Starter', description: 'Hasta 3 usuarios activos' },
    { value: 'pro', label: 'Profesional', description: 'Multisede + Auditoría OKLCH' },
    { value: 'enterprise', label: 'Enterprise', description: 'SSO + SLA 99.9%' }
  ];

  readonly demoSliderSize = signal<M3SliderSize>('sm');
  readonly sliderSizeGroupOptions: M3ButtonGroupOption[] = [
    { id: 'xs', label: 'XS (16dp)' },
    { id: 'sm', label: 'SM (24dp)' },
    { id: 'md', label: 'MD (40dp)' }
  ];
  readonly demoSliderStops = signal<boolean>(true);

  readonly demoTabVariant = signal<M3TabVariant>('primary');
  readonly tabVariantGroupOptions: M3ButtonGroupOption[] = [
    { id: 'primary', label: 'Primary (3dp)' },
    { id: 'secondary', label: 'Secondary (2dp)' }
  ];
  readonly demoActiveTab = signal<string>('overview');
  readonly demoTabItems: M3TabItem[] = [
    { id: 'overview', label: 'Resumen', icon: 'dashboard', panelId: 'lab-panel-overview' },
    { id: 'specs', label: 'Specs M3', icon: 'tune', badge: '4', panelId: 'lab-panel-specs' },
    { id: 'a11y', label: 'A11y', icon: 'accessibility_new', panelId: 'lab-panel-a11y' }
  ];

  toggleDemoCheckboxMaster(): void {
    const next = !this.checkboxMaster();
    this.checkboxAudit.set(next);
    this.checkboxBackup.set(next);
  }

  onSwitchIconModeChange(selected: string[]): void {
    const picked = selected[0] as M3SwitchIconMode | undefined;
    if (picked === 'both' || picked === 'selected' || picked === 'none') {
      this.switchIconModeDemo.set(picked);
    }
  }

  onSliderSizeChange(selected: string[]): void {
    const picked = selected[0] as M3SliderSize | undefined;
    if (picked === 'xs' || picked === 'sm' || picked === 'md') {
      this.demoSliderSize.set(picked);
    }
  }

  onTabVariantChange(selected: string[]): void {
    const picked = selected[0] as M3TabVariant | undefined;
    if (picked === 'primary' || picked === 'secondary') {
      this.demoTabVariant.set(picked);
    }
  }

  onDemoDialogClosed(reason: string): void {
    this.dialogLastClose.set(reason);
    this.notify.emit(`Diálogo cerrado con razón: ${reason}`);
  }

  copySnippet(kind: 'switch' | 'selection' | 'dialog'): void {
    const snippets: Record<'switch' | 'selection' | 'dialog', { code: string; label: string }> = {
      switch: {
        code: `<m3-switch\n  label="Alertas clínicas"\n  description="Notificación inmediata"\n  iconMode="${this.switchIconModeDemo()}"\n  [(checked)]="enabled" />`,
        label: 'Snippet <m3-switch> copiado'
      },
      selection: {
        code: `<m3-checkbox label="Todo" [indeterminate]="partial()" [(checked)]="all" />\n<m3-radio-group legend="Entrega" [errorText]="error" [(value)]="delivery">\n  <m3-radio value="email" label="Email" />\n  <m3-radio value="sms" label="SMS" />\n</m3-radio-group>`,
        label: 'Snippet Checkbox + <m3-radio-group> copiado'
      },
      dialog: {
        code: `<m3-dialog headline="Confirmar" [(open)]="open" (closed)="onClose($event)">...</m3-dialog>`,
        label: 'Snippet <m3-dialog> copiado'
      }
    };
    const picked = snippets[kind];
    this.copyText.emit({ text: picked.code, message: picked.label });
  }
}
