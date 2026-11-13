import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartItem, PosProduct } from '../../../core/pos/pos.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { CATEGORY_FALLBACK_THEMES } from '../pos-modifiers.data';

export interface PosCategoryOption {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}

@Component({
  selector: 'app-pos-catalog',
  standalone: true,
  imports: [FormsModule, M3ButtonComponent, M3CardComponent, M3ChipComponent, M3TextFieldComponent],
  host: {
    class: 'flex flex-col h-full min-h-0 space-y-3 overflow-hidden'
  },
  template: `
    <div class="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      <div class="flex items-center gap-3 shrink-0">
        <h2 class="text-2xl font-black text-main tracking-tight">Menú</h2>
        <span class="text-xs font-mono font-bold text-muted px-2.5 py-0.5 rounded-full bg-surface-box border border-outline-sub shadow-2xs">
          {{ products().length }} productos
        </span>
      </div>

      <div class="flex items-center gap-2 flex-1 sm:max-w-lg justify-end">
        <div class="flex-1 min-w-0">
          <m3-text-field
            #searchField
            variant="outlined"
            label="Buscar en menú o SKU [F2]"
            placeholder="Espresso, COF-001..."
            icon="search"
            [clearable]="true"
            [trailingIcon]="searchQuery() ? null : 'qr_code_scanner'"
            [value]="searchQuery()"
            (valueChange)="searchChange.emit($event)" />
        </div>

        <m3-button
          variant="outlined"
          size="md"
          icon="keyboard"
          ariaLabel="Ver atajos de teclado del POS"
          (action)="openShortcuts.emit()">
          Atajos
        </m3-button>
      </div>
    </div>

    <div class="shrink-0 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
      @for (cat of categories(); track cat.id) {
        <m3-chip
          type="filter"
          [selected]="selectedCategory() === cat.id"
          [icon]="cat.icon"
          (action)="categoryChange.emit(cat.id)">
          {{ cat.label }}
        </m3-chip>
      }
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar p-1 pr-1.5 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (product of products(); track product.id) {
          @let qty = quantityMap().get(product.id) ?? 0;
          @let theme = categoryThemes[product.category];

          <m3-card
            variant="outlined"
            padding="none"
            shape="lg"
            [customClass]="qty > 0
              ? 'group relative flex flex-col justify-between overflow-hidden ring-2 ring-inset ring-primary border-primary bg-primary/10 shadow-sm'
              : 'group relative flex flex-col justify-between overflow-hidden bg-surface-box shadow-2xs hover:shadow-md hover:border-outline'">

            @if (qty > 0) {
              <div
                aria-hidden="true"
                class="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-mono font-black shadow-lg flex items-center gap-1.5 z-20 m3-anim-spring-pop pointer-events-none">
                <span class="material-symbols-rounded text-sm">shopping_bag</span>
                <span>{{ qty }}x</span>
              </div>
            }

            <button
              type="button"
              [attr.aria-label]="'Agregar ' + product.name + ' a la comanda'"
              (click)="addProduct.emit(product)"
              class="state-layer focus-ring-m3 w-full text-left flex-1 flex flex-col cursor-pointer bg-transparent border-0 p-0">

              <div class="relative w-full h-60 bg-surface-high overflow-hidden shrink-0">
                @if (!failedImages()[product.id]) {
                  <img
                    [src]="product.imageUrl"
                    [alt]="product.name"
                    (error)="markImageFailed(product.id)"
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform m3-transition-emphasized group-hover:scale-105" />
                } @else {
                  <div
                    [class]="theme.bg + ' ' + theme.text"
                    class="w-full h-full grid place-items-center">
                    <span class="material-symbols-rounded text-6xl" aria-hidden="true">{{ product.icon }}</span>
                  </div>
                }

                <div class="absolute inset-0 bg-gradient-to-t from-[oklch(0%_0_0_/_0.88)] via-[oklch(0%_0_0_/_0.25)] to-transparent pointer-events-none"></div>

                <div class="absolute top-2.5 inset-x-2.5 flex items-center justify-between text-xs z-10">
                  <span class="px-2.5 py-0.5 rounded-full bg-surface-box/90 backdrop-blur-xs text-main font-bold text-[10px] uppercase tracking-wider border border-outline-sub shadow-xs">
                    {{ product.categoryLabel }}
                  </span>
                  <span
                    [class]="product.stock <= 20 ? 'bg-warning-box text-on-warning-box font-black border-warning/40' : 'bg-surface-dim/90 backdrop-blur-xs text-main font-semibold border-outline-sub'"
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] border shadow-xs">
                    @if (product.stock <= 20) {
                      <span class="material-symbols-rounded text-[12px] leading-none" aria-hidden="true">warning</span>
                    }
                    <span>{{ product.stock }} disp.</span>
                  </span>
                </div>

                <div class="absolute bottom-2.5 inset-x-3 z-10 text-[oklch(98%_0_0)] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:px-2 forced-colors:py-1 forced-colors:rounded-m3-sm forced-colors:border forced-colors:border-[CanvasText]">
                  <span class="text-[10px] font-mono opacity-80 font-bold tracking-wider uppercase block">
                    {{ product.sku }}
                  </span>
                  <div class="font-mono font-black text-2xl tracking-tight leading-none mt-0.5 drop-shadow-md">
                    S/ {{ product.price.toFixed(2) }}
                  </div>
                </div>
              </div>

              <div class="p-3.5 pb-2.5 space-y-0.5 w-full">
                <h4 class="font-extrabold text-sm text-main group-hover:text-primary transition-colors m3-transition-fast line-clamp-1 leading-snug">
                  {{ product.name }}
                </h4>
                <p class="text-xs text-muted line-clamp-1 font-normal">
                  {{ product.description }}
                </p>
              </div>
            </button>

            <div class="px-3.5 pb-3.5 pt-2 flex items-center gap-2 border-t border-outline-sub/60">
              <m3-button
                variant="tonal"
                size="sm"
                icon="tune"
                customClass="flex-1"
                [invisible]="hiddenCustomizerOriginId() === product.id"
                [viewTransitionName]="activeCustomizerOriginId() === product.id ? 'dialog-transform' : null"
                [ariaLabel]="'Personalizar ' + product.name"
                (action)="customizeProduct.emit(product)">
                Opciones
              </m3-button>

              @if (qty > 0) {
                <div class="flex items-center gap-1 bg-primary text-on-primary rounded-full p-1 shadow-xs m3-anim-spring-pop">
                  <button
                    type="button"
                    [attr.aria-label]="'Restar uno de ' + product.name"
                    (click)="updateQuantity.emit({ productId: product.id, delta: -1 })"
                    class="btn-m3 state-layer focus-ring-m3 touch-target-48 w-7 h-7 rounded-full hover:bg-on-primary/15 text-on-primary grid place-items-center cursor-pointer">
                    <span class="material-symbols-rounded text-sm font-bold" aria-hidden="true">remove</span>
                  </button>
                  <span class="text-xs font-mono font-bold w-5 text-center">{{ qty }}</span>
                  <button
                    type="button"
                    [attr.aria-label]="'Sumar uno de ' + product.name"
                    (click)="updateQuantity.emit({ productId: product.id, delta: 1 })"
                    class="btn-m3 state-layer focus-ring-m3 touch-target-48 w-7 h-7 rounded-full hover:bg-on-primary/15 text-on-primary grid place-items-center cursor-pointer">
                    <span class="material-symbols-rounded text-sm font-bold" aria-hidden="true">add</span>
                  </button>
                </div>
              } @else {
                <m3-button
                  variant="filled"
                  size="sm"
                  icon="shopping_bag"
                  customClass="flex-1"
                  [ariaLabel]="'Añadir ' + product.name + ' al pedido'"
                  (action)="addProduct.emit(product)">
                  Añadir
                </m3-button>
              }
            </div>
          </m3-card>
        } @empty {
          <div class="col-span-full p-12 text-center bg-surface-box border border-outline-sub rounded-m3-lg space-y-2 m3-anim-fade-through">
            <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">search_off</span>
            <h4 class="font-bold text-base">No se encontraron productos</h4>
            <p class="text-xs text-muted">Revisá el término de búsqueda o cambiá de categoría.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class PosCatalogComponent {
  private readonly searchField = viewChild(M3TextFieldComponent);

  readonly products = input.required<readonly PosProduct[]>();
  readonly categories = input.required<readonly PosCategoryOption[]>();
  readonly selectedCategory = input.required<string>();
  readonly searchQuery = input.required<string>();
  readonly cart = input.required<readonly CartItem[]>();
  readonly activeCustomizerOriginId = input<number | null>(null);
  readonly hiddenCustomizerOriginId = input<number | null>(null);

  readonly searchChange = output<string>();
  readonly categoryChange = output<string>();
  readonly openShortcuts = output<void>();
  readonly addProduct = output<PosProduct>();
  readonly updateQuantity = output<{ productId: number; delta: number }>();
  readonly customizeProduct = output<PosProduct>();

  readonly failedImages = signal<Record<number, boolean>>({});
  readonly categoryThemes = CATEGORY_FALLBACK_THEMES;

  readonly quantityMap = computed(() => {
    const map = new Map<number, number>();
    for (const item of this.cart()) {
      map.set(item.product.id, item.quantity);
    }
    return map;
  });

  focusSearch(): void {
    this.searchField()?.focus();
  }

  markImageFailed(productId: number): void {
    this.failedImages.update(prev => ({ ...prev, [productId]: true }));
  }
}
