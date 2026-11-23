import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { M3ButtonComponent, M3ButtonSize, M3ButtonVariant } from '../../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption,
  M3SplitButtonComponent,
  M3SplitMenuItem
} from '../../../../shared/components/button/button-group.component';
import { M3FabComponent } from '../../../../shared/components/button/fab.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { ClipboardCopyPayload } from '../../../../shared/utils/clipboard.util';
import { BUTTON_EMPHASIS_SPECS } from './components-specs.data';

interface ButtonSpecimenRow {
  readonly codeLabel: string;
  readonly variant: M3ButtonVariant;
  readonly icon: string;
  readonly label: string;
}

interface ButtonSizeSpecimenRow {
  readonly codeLabel: string;
  readonly size: M3ButtonSize;
  readonly variant: M3ButtonVariant;
  readonly icon: string;
  readonly label: string;
}

const CANONICAL_BUTTON_ROWS: readonly ButtonSpecimenRow[] = [
  { codeLabel: '1. Filled (High)', variant: 'filled', icon: 'add', label: 'Filled Button' },
  { codeLabel: '2. Tonal (Medium-High)', variant: 'tonal', icon: 'edit', label: 'Tonal Button' },
  { codeLabel: '3. Elevated (Depth)', variant: 'elevated', icon: 'cloud_upload', label: 'Elevated Button' },
  { codeLabel: '4. Outlined (Border)', variant: 'outlined', icon: 'tune', label: 'Outlined Button' },
  { codeLabel: '5. Text (Low)', variant: 'text', icon: 'close', label: 'Text Button' }
];

const BUTTON_SIZE_ROWS: readonly ButtonSizeSpecimenRow[] = [
  { codeLabel: 'Small (32px)', size: 'sm', variant: 'tonal', icon: 'star', label: 'Small Button' },
  { codeLabel: 'Medium (40px)', size: 'md', variant: 'filled', icon: 'check_circle', label: 'Medium Standard' },
  { codeLabel: 'Large (48px)', size: 'lg', variant: 'elevated', icon: 'rocket_launch', label: 'Large Button' }
];

const ICON_ONLY_BUTTON_VARIANTS: readonly { variant: M3ButtonVariant; icon: string; ariaLabel: string }[] = [
  { variant: 'filled', icon: 'bookmark', ariaLabel: 'Guardar' },
  { variant: 'tonal', icon: 'share', ariaLabel: 'Compartir' },
  { variant: 'elevated', icon: 'favorite', ariaLabel: 'Favorito' },
  { variant: 'outlined', icon: 'filter_list', ariaLabel: 'Filtrar' },
  { variant: 'text', icon: 'more_vert', ariaLabel: 'Más opciones' }
];

@Component({
  selector: 'app-components-actions-section',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3FabComponent,
    M3SplitButtonComponent,
    M3SwitchComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. LAS 5 VARIANTES CANÓNICAS -->
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box flex flex-col justify-between space-y-4">
          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base" aria-hidden="true">smart_button</span>
                Pilar 1 • Jerarquía Visual
              </div>
              <h3 class="text-title-md font-bold text-main">Las 5 Variantes Canónicas</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Tokens de superficie y roles semánticos según el nivel de énfasis requerido.
              </p>
            </div>

            <div class="flex flex-col gap-3">
              @for (item of canonicalButtonRows; track item.variant) {
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted font-mono">{{ item.codeLabel }}</span>
                  <m3-button [variant]="item.variant" [icon]="item.icon" (action)="incrementClicks()">
                    {{ item.label }}
                  </m3-button>
                </div>
              }
            </div>
          </div>

          <div class="pt-3 border-t border-outline-sub flex items-center justify-between text-xs text-muted">
            <span>Clics registrados:</span>
            <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high">
              {{ buttonClicks() }}
            </span>
          </div>
        </m3-card>

        <!-- 2. TAMAÑOS Y SHAPE MORPHING EXPRESIVO -->
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box flex flex-col justify-between space-y-4">
          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base" aria-hidden="true">animation</span>
                Components • Expresión y Escala
              </div>
              <h3 class="text-title-md font-bold text-main">Tamaños y Shape Morphing</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Escala dimensional M3E de 5 niveles (28px, 32px, 40px, 48px, 56px) y transiciones elásticas en hover.
              </p>
            </div>

            <div class="space-y-3.5">
              <div class="flex flex-wrap items-center gap-2 pb-1">
                <m3-button size="xs" variant="outlined" icon="bolt" (action)="incrementClicks()">XS 28</m3-button>
                <m3-button size="xl" variant="filled" icon="auto_awesome" (action)="incrementClicks()">XL 56</m3-button>
              </div>

              @for (row of buttonSizeRows; track row.size) {
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted font-mono">{{ row.codeLabel }}</span>
                  <m3-button [size]="row.size" [variant]="row.variant" [icon]="row.icon" (action)="incrementClicks()">
                    {{ row.label }}
                  </m3-button>
                </div>
              }

              <m3-card variant="filled" surface="high" padding="sm" shape="lg" customClass="space-y-2">
                <span class="text-xs font-semibold text-main block">Expressive Morphing Hover</span>
                <p class="text-[11px] text-muted">Pasá el mouse: el radio muta de píldora a squircle sin saltos de layout:</p>
                <div class="flex items-center justify-center pt-1">
                  <m3-button variant="filled" [morph]="true" icon="auto_awesome" (action)="incrementClicks()">
                    Pasa el cursor sobre mí
                  </m3-button>
                </div>
              </m3-card>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">info</span>
            <span>48px mantiene la escala táctil WCAG AAA.</span>
          </div>
        </m3-card>

        <!-- 3. ESTADOS REACTIVOS E ICON-ONLY (CON M3-SWITCH REAL) -->
        <m3-card variant="outlined" padding="lg" customClass="bg-surface-box flex flex-col justify-between space-y-4">
          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base" aria-hidden="true">toggle_on</span>
                Components • Estados y Variaciones
              </div>
              <h3 class="text-title-md font-bold text-main">Loading, Disabled &amp; Icon-Only</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Control dinámico de feedback sin romper el ancho de las cajas usando switches M3 reales.
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-4 p-3 bg-surface-low rounded-m3-lg border border-outline-sub">
                <m3-switch
                  customId="actions-loading-switch"
                  label="Loading"
                  iconMode="both"
                  [(checked)]="buttonLoading" />
                <m3-switch
                  customId="actions-disabled-switch"
                  label="Disabled"
                  iconMode="both"
                  [(checked)]="buttonDisabled" />
              </div>

              <div class="flex items-center justify-between p-3 bg-surface-high rounded-m3-lg border border-outline-sub">
                <span class="text-xs text-muted font-mono">Reactivo:</span>
                <m3-button
                  variant="filled"
                  icon="send"
                  [loading]="buttonLoading()"
                  [disabled]="buttonDisabled()"
                  (action)="incrementClicks()">
                  Enviar Tarea
                </m3-button>
              </div>

              <div class="space-y-2">
                <span class="text-xs font-semibold text-main block">Variantes Icon-Only (Touch Target 48dp)</span>
                <div class="flex items-center justify-around gap-2 p-2 bg-surface-high rounded-m3-lg border border-outline-sub">
                  @for (iconBtn of iconOnlyVariants; track iconBtn.variant) {
                    <m3-button
                      [iconOnly]="true"
                      [variant]="iconBtn.variant"
                      [icon]="iconBtn.icon"
                      [ariaLabel]="iconBtn.ariaLabel"
                      (action)="incrementClicks()" />
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">verified</span>
            <span>Disabled aplica 12% contenedor y 38% tinta <code>on-surface</code> independientes.</span>
          </div>
        </m3-card>
      </div>

      <!-- 1B. ALL BUTTONS EXTENDED -->
      <m3-card variant="outlined" padding="lg" customClass="bg-surface-box space-y-5">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-outline-sub pb-3">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
              <span class="material-symbols-rounded text-base" aria-hidden="true">dynamic_feed</span>
              m3.material.io/components/all-buttons • Expressive Extended Family
            </div>
            <h3 class="text-title-md font-bold text-main">Toggle Buttons, Button Groups (Standard &amp; Connected), Split Button &amp; FAB</h3>
          </div>

          <m3-button
            variant="tonal"
            size="xs"
            icon="content_copy"
            customClass="shrink-0 self-start lg:self-center"
            (action)="copyActionFamilySnippet()">
            Copiar Familia Botones
          </m3-button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div>
              <span class="text-xs font-bold text-main block">1. Toggle Button (Morph)</span>
              <p class="text-[11px] text-muted mt-0.5">Muta de Pill a Squircle 12px y expone <code>aria-pressed</code>.</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <m3-button
                variant="tonal"
                [toggle]="true"
                [(selected)]="togglePinned"
                [icon]="togglePinned() ? 'keep' : 'keep_off'">
                {{ togglePinned() ? 'Fijado' : 'Fijar vista' }}
              </m3-button>
              <m3-button
                variant="outlined"
                [toggle]="true"
                icon="favorite"
                [(selected)]="toggleFavorite">
                Favorito
              </m3-button>
            </div>
          </m3-card>

          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div>
              <span class="text-xs font-bold text-main block">2. Connected Button Group</span>
              <p class="text-[11px] text-muted mt-0.5">Gap 2px interno; el ítem seleccionado se vuelve Pill completo.</p>
            </div>
            <div class="space-y-2">
              <m3-button-group
                variant="connected"
                selectionMode="single"
                size="sm"
                ariaLabel="Vista temporal"
                [options]="periodGroupOptions"
                [(value)]="connectedGroupValue" />
              <div class="text-[11px] font-mono text-muted">
                Activo: <strong class="text-primary">{{ connectedGroupValue().join(', ') }}</strong>
              </div>
            </div>
          </m3-card>

          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div>
              <span class="text-xs font-bold text-main block">3. Standard Group &amp; Split Popover</span>
              <p class="text-[11px] text-muted mt-0.5">Multi-selección o Split Button con menú nativo <code>popover="auto"</code>.</p>
            </div>
            <div class="space-y-3">
              <m3-button-group
                variant="standard"
                selectionMode="multi"
                size="xs"
                ariaLabel="Filtros rápidos"
                [options]="standardGroupOptions"
                [(value)]="standardGroupValue" />
              <div class="flex items-center gap-3 flex-wrap">
                <m3-split-button
                  label="Guardar"
                  icon="save"
                  variant="filled"
                  size="sm"
                  [menuItems]="splitMenuItems"
                  (primaryAction)="notify.emit('Guardado principal ejecutado')"
                  (itemAction)="onSplitMenuSelect($event)" />
              </div>
            </div>
          </m3-card>

          <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="flex flex-col justify-between space-y-3">
            <div>
              <span class="text-xs font-bold text-main block">4. FAB &amp; Extended FAB (Level 3)</span>
              <p class="text-[11px] text-muted mt-0.5">Elevación flotante Level 3 para la acción constructiva principal.</p>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <m3-fab size="sm" variant="secondary" icon="edit" ariaLabel="Editar rápido" (action)="incrementClicks()" />
              <m3-fab size="md" variant="primary" icon="add" ariaLabel="Crear nuevo" (action)="incrementClicks()" />
              <m3-fab variant="tertiary" icon="add_shopping_cart" label="Nueva orden" (action)="notify.emit('Orden creada desde Extended FAB')" />
            </div>
          </m3-card>
        </div>

        <div class="overflow-x-auto border border-outline-sub rounded-m3-lg">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-surface-high text-[10px] uppercase tracking-wider text-muted font-bold">
              <tr>
                <th class="py-2 px-3">Variante / Patrón</th>
                <th class="py-2 px-3">Rol Semántico</th>
                <th class="py-2 px-3">Tokens</th>
                <th class="py-2 px-3">Regla de Forma</th>
                <th class="py-2 px-3">Cuándo usar en Web</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-sub/60">
              @for (row of buttonEmphasisSpecs; track row.kind) {
                <tr class="hover:bg-surface-low">
                  <td class="py-2 px-3 font-bold text-main">{{ row.kind }}</td>
                  <td class="py-2 px-3 text-muted">{{ row.role }}</td>
                  <td class="py-2 px-3 font-mono text-[11px] text-primary">{{ row.containerToken }}</td>
                  <td class="py-2 px-3 font-mono text-[11px] text-main">{{ row.shapeRule }}</td>
                  <td class="py-2 px-3 text-muted">{{ row.useWhen }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </m3-card>
    </div>
  `
})
export class ComponentsActionsSectionComponent {
  readonly notify = output<string>();
  readonly copyText = output<ClipboardCopyPayload>();

  readonly buttonEmphasisSpecs = BUTTON_EMPHASIS_SPECS;
  readonly canonicalButtonRows = CANONICAL_BUTTON_ROWS;
  readonly buttonSizeRows = BUTTON_SIZE_ROWS;
  readonly iconOnlyVariants = ICON_ONLY_BUTTON_VARIANTS;

  readonly periodGroupOptions: M3ButtonGroupOption[] = [
    { id: 'day', label: 'Día', icon: 'today' },
    { id: 'week', label: 'Semana', icon: 'date_range' },
    { id: 'month', label: 'Mes', icon: 'calendar_month' }
  ];

  readonly standardGroupOptions: M3ButtonGroupOption[] = [
    { id: 'wcag', label: 'WCAG AA', icon: 'verified_user' },
    { id: 'motion', label: 'Springs', icon: 'animation' },
    { id: 'rtl', label: 'RTL Ready', icon: 'format_textdirection_r_to_l' }
  ];

  readonly splitMenuItems: M3SplitMenuItem[] = [
    { id: 'draft', label: 'Guardar como borrador', icon: 'edit_note' },
    { id: 'template', label: 'Guardar plantilla JSON', icon: 'data_object' },
    { id: 'pdf', label: 'Exportar ficha PDF', icon: 'picture_as_pdf' }
  ];

  readonly buttonClicks = signal<number>(0);
  readonly buttonLoading = signal<boolean>(false);
  readonly buttonDisabled = signal<boolean>(false);
  readonly togglePinned = signal<boolean>(true);
  readonly toggleFavorite = signal<boolean>(false);
  readonly connectedGroupValue = signal<string[]>(['week']);
  readonly standardGroupValue = signal<string[]>(['wcag']);

  incrementClicks(): void {
    this.buttonClicks.update(c => c + 1);
  }

  onSplitMenuSelect(itemId: string): void {
    const item = this.splitMenuItems.find(m => m.id === itemId);
    this.notify.emit(`Split action: ${item?.label || itemId}`);
  }

  copyActionFamilySnippet(): void {
    this.copyText.emit({
      text: `<m3-button-group variant="connected" selectionMode="single" [options]="options" [(value)]="selected" />\n<m3-split-button label="Guardar" icon="save" [menuItems]="items" (primaryAction)="save()" />`,
      message: 'Snippet <m3-button-group> + <m3-split-button> copiado'
    });
  }
}
