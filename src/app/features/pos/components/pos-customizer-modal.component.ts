import { Component, ElementRef, computed, effect, input, output, signal, viewChild } from '@angular/core';
import { PosProduct } from '../../../core/pos/pos.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { CATEGORY_MODIFIERS } from '../pos-modifiers.data';

@Component({
  selector: 'app-pos-customizer-modal',
  standalone: true,
  imports: [M3ButtonComponent, M3ChipComponent, M3TextFieldComponent],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 bg-black/65 backdrop-blur-md z-40 m3-dialog-backdrop cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pos-customizer-title"
      class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[520px] h-fit max-h-[92vh] bg-surface-box border border-outline-sub rounded-m3-xl shadow-2xl z-50 overflow-hidden flex flex-col m3-dialog-surface">

      <div class="relative w-full h-64 sm:h-72 bg-zinc-950 overflow-hidden shrink-0">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          class="w-full h-full object-cover object-center transition-transform m3-transition-spatial hover:scale-105" />

        <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

        <div class="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20 shadow-md">
          <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">{{ product().icon }}</span>
          <span>{{ product().categoryLabel }}</span>
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

      <div class="px-6 pt-4 pb-3 border-b border-outline-sub bg-surface-box shrink-0">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
                {{ product().sku }}
              </span>
              <span class="text-xs text-muted/60">•</span>
              <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {{ product().stock }} disponibles
              </span>
            </div>
            <h3
              #modalHeading
              id="pos-customizer-title"
              tabindex="-1"
              class="text-xl sm:text-2xl font-black text-main tracking-tight leading-tight outline-none">
              {{ product().name }}
            </h3>
            <p class="text-xs text-muted leading-relaxed line-clamp-1">
              {{ product().description }}
            </p>
          </div>

          <div class="text-right shrink-0">
            <span class="text-[10px] font-mono text-muted uppercase font-bold tracking-wider block">Total Receta</span>
            <div class="text-2xl sm:text-3xl font-mono font-black text-primary tracking-tight leading-none mt-1">
              S/ {{ calculatedPrice().toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 space-y-4 overflow-y-auto m3-scrollbar max-h-[calc(88vh-23rem)]">
        <div class="space-y-2">
          <span class="text-xs font-bold text-main block uppercase tracking-wide">
            {{ modifiers().baseLabel }}
          </span>
          <div class="grid grid-cols-2 gap-2" role="group" [attr.aria-label]="modifiers().baseLabel">
            @for (base of modifiers().bases; track base.id) {
              <button
                type="button"
                [attr.aria-pressed]="selectedBaseOption() === base.label"
                (click)="selectedBaseOption.set(base.label)"
                [class]="selectedBaseOption() === base.label ? 'bg-primary text-on-primary font-bold shadow-xs border-primary' : 'bg-surface-high hover:bg-surface-highest text-main border-outline-sub'"
                class="btn-m3 state-layer focus-ring-m3 py-2 px-3 rounded-m3-md border text-xs text-left flex items-center justify-between cursor-pointer">
                <span class="truncate">{{ base.name }}</span>
                <span class="font-mono text-[11px] opacity-85 shrink-0 ml-1">
                  {{ base.extraPrice > 0 ? '+S/ ' + base.extraPrice.toFixed(2) : 'Incl.' }}
                </span>
              </button>
            }
          </div>
        </div>

        <div class="space-y-2">
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
          variant="filled"
          label="Indicaciones para Cocina / Barra"
          placeholder="Ej. Sin azúcar, bien caliente, salsa aparte..."
          icon="edit_note"
          [clearable]="true"
          [(value)]="customizeNotes" />
      </div>

      <div class="p-4 bg-surface-high/60 border-t border-outline-sub flex items-center justify-end gap-3 shrink-0">
        <m3-button variant="text" (action)="close.emit()">
          Cancelar
        </m3-button>
        <m3-button
          variant="filled"
          size="md"
          icon="shopping_bag"
          [morph]="true"
          (action)="submitCustomization()">
          Añadir a Comanda (S/ {{ calculatedPrice().toFixed(2) }})
        </m3-button>
      </div>
    </div>
  `
})
export class PosCustomizerModalComponent {
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly product = input.required<PosProduct>();
  readonly close = output<void>();
  readonly confirm = output<{ product: PosProduct; notes: string }>();

  readonly selectedBaseOption = signal<string>('');
  readonly selectedExtras = signal<string[]>([]);
  readonly customizeNotes = signal<string>('');

  readonly modifiers = computed(() => CATEGORY_MODIFIERS[this.product().category]);

  readonly calculatedPrice = computed(() => {
    const prod = this.product();
    const mods = this.modifiers();
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

    return total;
  });

  constructor() {
    effect(() => {
      const prod = this.product();
      const bases = CATEGORY_MODIFIERS[prod.category].bases;
      this.selectedBaseOption.set(bases[0]?.label ?? '');
      this.selectedExtras.set([]);
      this.customizeNotes.set('');
      queueMicrotask(() => this.modalHeading()?.nativeElement.focus());
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
    const mods = this.modifiers();
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

    this.confirm.emit({ product: prod, notes: parts.join(' • ') });
  }
}

