import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PosProduct } from '../../../core/pos/pos.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { CATEGORY_MODIFIERS } from '../pos-modifiers.data';

@Component({
  selector: 'app-pos-customizer-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, M3ButtonComponent, M3ChipComponent, M3DialogComponent, M3TextFieldComponent],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="basic"
      size="md"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      [headline]="product()?.name ?? 'Personalizar producto'"
      [viewTransitionName]="viewTransitionName()"
      customClass="pos-customizer-dialog"
      (closeRequested)="close.emit()">

      @if (product(); as prod) {
        <div class="relative w-full h-44 sm:h-48 bg-surface-dim overflow-hidden shrink-0">
          <img
            [src]="prod.imageUrl"
            [alt]="prod.name"
            class="w-full h-full object-cover object-center transition-transform m3-transition-spatial hover:scale-105" />

          <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[oklch(0%_0_0_/_0.58)] to-transparent pointer-events-none"></div>

          <div class="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-box/90 backdrop-blur-md text-main text-[11px] font-bold uppercase tracking-wider shadow-md">
            <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">{{ prod.icon }}</span>
            <span>{{ prod.categoryLabel }}</span>
          </div>

          <div class="absolute top-3.5 right-3.5 z-10">
            <m3-button
              [iconOnly]="true"
              variant="tonal"
              size="sm"
              icon="close"
              ariaLabel="Cerrar personalización"
              (action)="close.emit()" />
          </div>
        </div>

        <div class="px-6 pt-4 pb-3 border-b border-outline-sub/50 bg-surface-box shrink-0">
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-0.5 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
                  {{ prod.sku }}
                </span>
                <span class="text-xs text-muted/60">•</span>
                <span
                  [class]="(prod.stock === 0 ? 'text-error' : prod.stock <= 20 ? 'text-warning' : 'text-success') + ' text-xs font-semibold inline-flex items-center gap-1'">
                  <span class="material-symbols-rounded text-sm leading-none" aria-hidden="true">
                    {{ prod.stock === 0 ? 'block' : prod.stock <= 20 ? 'warning' : 'check_circle' }}
                  </span>
                  <span>{{ prod.stock === 0 ? 'Agotado' : prod.stock + ' disponibles' }}</span>
                </span>
              </div>
              <h3
                id="pos-customizer-title"
                class="text-xl sm:text-2xl font-black text-main tracking-tight leading-tight">
                {{ prod.name }}
              </h3>
              <p class="text-xs text-muted leading-relaxed line-clamp-1">
                {{ prod.description }}
              </p>
            </div>

            <div class="text-right shrink-0">
              <span class="text-[10px] font-mono text-muted uppercase font-bold tracking-wider block">Total Receta</span>
              <div class="text-2xl sm:text-3xl font-mono font-black text-primary tracking-tight leading-none mt-1 tabular-nums">
                S/ {{ calculatedPrice().toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <form (ngSubmit)="submitCustomization()" novalidate class="flex flex-col flex-1 min-h-0">
          <div class="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto m3-scrollbar">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-main block uppercase tracking-wide">
                {{ modifiers().baseLabel }}
              </span>
              <div class="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2" role="group" [attr.aria-label]="modifiers().baseLabel">
                @for (base of modifiers().bases; track base.id) {
                  <button
                    type="button"
                    [attr.aria-pressed]="selectedBaseOption() === base.label"
                    (click)="selectedBaseOption.set(base.label)"
                    [class]="selectedBaseOption() === base.label ? 'bg-primary text-on-primary font-bold shadow-xs' : 'bg-surface-low hover:bg-surface-lowest text-main shadow-2xs'"
                    class="btn-m3 state-layer focus-ring-m3 touch-target-48 py-2.5 px-3 rounded-m3-md text-xs text-left flex items-center justify-between cursor-pointer">
                    <span class="truncate">{{ base.name }}</span>
                    <span class="font-mono text-[11px] opacity-85 shrink-0 ml-1 tabular-nums">
                      {{ base.extraPrice > 0 ? '+S/ ' + base.extraPrice.toFixed(2) : 'Incl.' }}
                    </span>
                  </button>
                }
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-main block uppercase tracking-wide">
                Extras y Adicionales
              </span>
              <div class="flex flex-wrap gap-2">
                @for (extra of modifiers().extras; track extra.id) {
                  <m3-chip
                    type="filter"
                    [selected]="selectedExtras().includes(extra.label)"
                    (action)="toggleExtra(extra.label)">
                    {{ extra.name }}{{ extra.extraPrice > 0 ? ' (+S/ ' + extra.extraPrice.toFixed(2) + ')' : '' }}
                  </m3-chip>
                }
              </div>
            </div>

            <m3-text-field
              [id]="'pos-customizer-notes'"
              variant="filled"
              label="Indicaciones para Cocina / Barra"
              placeholder="Ej. Sin azúcar, bien caliente, salsa aparte..."
              icon="edit_note"
              [clearable]="true"
              [(value)]="customizeNotes" />
          </div>
        </form>
      }

      <div dialog-actions class="flex items-center justify-end gap-3">
        <m3-button type="button" variant="text" (action)="close.emit()">
          Cancelar
        </m3-button>
        @if (product(); as prod) {
          <m3-button
            type="button"
            variant="filled"
            size="md"
            icon="shopping_bag"
            [disabled]="prod.stock <= 0"
            [morph]="true"
            (action)="submitCustomization()">
            Añadir a Comanda (S/ {{ calculatedPrice().toFixed(2) }})
          </m3-button>
        }
      </div>
    </m3-dialog>
  `
})
export class PosCustomizerModalComponent {
  readonly open = input<boolean>(false);
  readonly product = input<PosProduct | null>(null);
  readonly viewTransitionName = input<string | null>(null);
  readonly close = output<void>();
  readonly confirm = output<{ product: PosProduct; notes: string; unitPrice: number }>();

  readonly selectedBaseOption = signal<string>('');
  readonly selectedExtras = signal<string[]>([]);
  readonly customizeNotes = signal<string>('');

  readonly modifiers = computed(() => {
    const prod = this.product();
    return prod ? CATEGORY_MODIFIERS[prod.category] : CATEGORY_MODIFIERS['coffee'];
  });

  readonly calculatedPrice = computed(() => {
    const prod = this.product();
    if (!prod) return 0;
    const mods = CATEGORY_MODIFIERS[prod.category];
    let total = prod.price;

    const baseOpt = mods.bases.find(b => b.label === this.selectedBaseOption());
    if (baseOpt) {
      total += baseOpt.extraPrice;
    }

    for (const label of this.selectedExtras()) {
      const extra = mods.extras.find(e => e.label === label);
      if (extra) {
        total += extra.extraPrice;
      }
    }

    return Number(total.toFixed(2));
  });

  constructor() {
    effect(() => {
      const prod = this.product();
      if (!this.open() || !prod) return;
      const bases = CATEGORY_MODIFIERS[prod.category].bases;
      this.selectedBaseOption.set(bases[0]?.label ?? '');
      this.selectedExtras.set([]);
      this.customizeNotes.set('');
    });
  }

  toggleExtra(extraLabel: string): void {
    this.selectedExtras.update(current =>
      current.includes(extraLabel)
        ? current.filter(item => item !== extraLabel)
        : [...current, extraLabel]
    );
  }

  submitCustomization(): void {
    const prod = this.product();
    if (!prod) return;
    const mods = CATEGORY_MODIFIERS[prod.category];
    const parts: string[] = [];

    if (this.selectedBaseOption() && !this.selectedBaseOption().includes('(Std)')) {
      const baseOpt = mods.bases.find(b => b.label === this.selectedBaseOption());
      if (baseOpt) parts.push(baseOpt.name);
    }

    for (const label of this.selectedExtras()) {
      const found = mods.extras.find(e => e.label === label);
      if (found) parts.push(found.name);
    }

    const note = this.customizeNotes().trim();
    if (note) {
      parts.push(`"${note}"`);
    }

    this.confirm.emit({
      product: prod,
      notes: parts.join(' • '),
      unitPrice: this.calculatedPrice()
    });
  }
}
