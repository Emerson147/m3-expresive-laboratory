import { Component, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PosProduct } from '../../../core/pos/pos.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { CATEGORY_MODIFIERS } from '../pos-modifiers.data';

@Component({
  selector: 'app-pos-customizer-modal',
  standalone: true,
  imports: [FormsModule, M3ButtonComponent, M3ChipComponent, M3TextFieldComponent],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      [class.m3-dialog-backdrop]="!themeService.hasViewTransitions()"
      class="fixed inset-0 bg-scrim z-40 cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pos-customizer-title"
      [style.view-transition-name]="isDialogTransitionActive() ? 'dialog-transform' : null"
      [class.m3-dialog-surface]="!themeService.hasViewTransitions()"
      class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[520px] h-fit max-h-[92vh] bg-surface-box border border-outline-sub rounded-m3-xl shadow-2xl z-50 overflow-hidden flex flex-col">

      <div class="relative w-full h-44 sm:h-48 bg-surface-dim overflow-hidden shrink-0">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          class="w-full h-full object-cover object-center transition-transform m3-transition-spatial hover:scale-105" />

        <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[oklch(0%_0_0_/_0.58)] to-transparent pointer-events-none"></div>

        <div class="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-box/90 backdrop-blur-md text-main text-[11px] font-bold uppercase tracking-wider border border-outline-sub shadow-md">
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
              <span
                [class]="(product().stock === 0 ? 'text-error' : product().stock <= 20 ? 'text-warning' : 'text-success') + ' text-xs font-semibold inline-flex items-center gap-1'">
                <span class="material-symbols-rounded text-sm leading-none" aria-hidden="true">
                  {{ product().stock === 0 ? 'block' : product().stock <= 20 ? 'warning' : 'check_circle' }}
                </span>
                <span>{{ product().stock === 0 ? 'Agotado' : product().stock + ' disponibles' }}</span>
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

      <form (ngSubmit)="submitCustomization()" novalidate class="flex flex-col flex-1 min-h-0">
        <div class="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto m3-scrollbar">
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
            type="submit"
            variant="filled"
            size="md"
            icon="shopping_bag"
            [disabled]="product().stock <= 0"
            [morph]="true">
            Añadir a Comanda (S/ {{ calculatedPrice().toFixed(2) }})
          </m3-button>
        </div>
      </form>
    </div>
  `
})
export class PosCustomizerModalComponent {
  readonly themeService = inject(ThemeService);
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly product = input.required<PosProduct>();
  readonly isDialogTransitionActive = input<boolean>(false);
  readonly close = output<void>();
  readonly confirm = output<{ product: PosProduct; notes: string; unitPrice: number }>();

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

    return Number(total.toFixed(2));
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

    this.confirm.emit({
      product: prod,
      notes: parts.join(' • '),
      unitPrice: this.calculatedPrice()
    });
  }
}

