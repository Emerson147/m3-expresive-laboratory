import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';
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

export interface PosShiftSummary {
  readonly register: string;
  readonly shift: string;
  readonly cashier: string;
  readonly salesCountToday: number;
}

@Component({
  selector: 'app-pos-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, M3ButtonComponent, M3CardComponent, M3ChipComponent, M3TextFieldComponent],
  host: {
    class: 'pos-catalog-pane flex flex-col h-full min-h-0 gap-3 overflow-hidden'
  },
  template: `
    <div class="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <h2 class="text-2xl font-black text-main tracking-tight">Menú</h2>
        <span class="text-xs font-mono font-bold text-muted px-2.5 py-0.5 rounded-full bg-surface-low">
          {{ products().length }} {{ products().length === 1 ? 'producto' : 'productos' }}
        </span>
        @if (shiftInfo(); as shift) {
          <span class="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-muted px-2.5 py-0.5 rounded-full bg-surface-high">
            <span class="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true"></span>
            <span class="font-mono font-bold text-main">{{ shift.register }}</span>
            <span>· {{ shift.shift }} · {{ shift.salesCountToday }} {{ shift.salesCountToday === 1 ? 'venta' : 'ventas' }}</span>
          </span>
        }
      </div>

      <div class="flex items-center gap-2 flex-1 sm:max-w-lg justify-end">
        <search class="flex-1 min-w-0">
          <m3-text-field
            #searchField
            [id]="'pos-search-input'"
            variant="filled"
            type="search"
            label="Buscar en menú o SKU [F2]"
            placeholder="Espresso, COF-001..."
            icon="search"
            enterkeyhint="search"
            [clearable]="true"
            [trailingIcon]="searchQuery() ? null : 'qr_code_scanner'"
            [value]="searchQuery()"
            (valueChange)="searchChange.emit($event)" />
        </search>

        <m3-button
          variant="tonal"
          size="md"
          icon="keyboard"
          ariaLabel="Ver atajos de teclado del POS"
          (action)="openShortcuts.emit()">
          Atajos
        </m3-button>
      </div>
    </div>

    <div class="shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 -my-2">
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

    <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar p-1 pr-1.5">
      <div class="pos-catalog-grid grid gap-3.5">
        @for (product of products(); track product.id) {
          @let qty = quantityMap().get(product.id) ?? 0;
          @let isOutOfStock = product.stock <= 0;
          @let canAddMore = qty < product.stock;
          @let theme = categoryThemes[product.category];

          <m3-card
            variant="filled"
            [surface]="qty > 0 ? 'default' : (isOutOfStock ? 'surface' : 'low')"
            [tone]="qty > 0 ? 'primary' : 'default'"
            padding="none"
            shape="lg"
            [customClass]="productCardClasses(qty, isOutOfStock)">

            @if (qty > 0) {
              <div
                aria-hidden="true"
                class="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-mono font-black shadow-lg flex items-center gap-1 z-20 m3-anim-spring-pop pointer-events-none">
                <span class="material-symbols-rounded text-sm">shopping_bag</span>
                <span>{{ qty }}x</span>
              </div>
            }

            <button
              type="button"
              [disabled]="!canAddMore"
              [attr.aria-label]="isOutOfStock ? product.name + ' agotado' : 'Agregar ' + product.name + ' a la comanda'"
              (click)="addProduct.emit(product)"
              class="state-layer focus-ring-m3 w-full text-left flex-1 flex flex-col cursor-pointer disabled:cursor-not-allowed bg-transparent border-0 p-0">

              <div class="relative w-full h-36 sm:h-40 bg-surface-high overflow-hidden shrink-0">
                @if (!failedImages()[product.id]) {
                  <img
                    [src]="product.imageUrl"
                    [alt]="product.name"
                    (error)="markImageFailed(product.id)"
                    loading="lazy"
                    [class.grayscale]="isOutOfStock"
                    class="w-full h-full object-cover transition-transform m3-transition-emphasized group-hover:scale-105" />
                } @else {
                  <div
                    [class]="theme.bg + ' ' + theme.text"
                    class="w-full h-full grid place-items-center">
                    <span class="material-symbols-rounded text-5xl" aria-hidden="true">{{ product.icon }}</span>
                  </div>
                }

                <div class="absolute inset-0 bg-gradient-to-t from-[oklch(0%_0_0_/_0.88)] via-[oklch(0%_0_0_/_0.22)] to-transparent pointer-events-none"></div>

                <span
                  [class]="isOutOfStock
                    ? 'bg-error-box text-on-error-box font-black'
                    : product.stock <= 20
                      ? 'bg-warning-box text-on-warning-box font-black'
                      : 'bg-surface-box/90 backdrop-blur-xs text-main font-semibold'"
                  class="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] shadow-xs">
                  @if (isOutOfStock) {
                    <span class="material-symbols-rounded text-[12px] leading-none" aria-hidden="true">block</span>
                    <span>Agotado</span>
                  } @else {
                    @if (product.stock <= 20) {
                      <span class="material-symbols-rounded text-[12px] leading-none" aria-hidden="true">warning</span>
                    }
                    <span>{{ product.stock }} disp.</span>
                  }
                </span>

                <div class="absolute bottom-2 inset-x-3 z-10 text-[oklch(98%_0_0)] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:px-2 forced-colors:py-1 forced-colors:rounded-m3-sm forced-colors:border forced-colors:border-[CanvasText]">
                  <span class="text-[10px] font-mono opacity-80 font-bold tracking-wider uppercase block">
                    {{ product.sku }}
                  </span>
                  <div class="font-mono font-black text-xl sm:text-2xl tracking-tight leading-none mt-0.5 drop-shadow-md">
                    S/ {{ product.price.toFixed(2) }}
                  </div>
                </div>
              </div>

              <div class="p-3 pb-2 flex flex-col gap-0.5 w-full">
                <span class="text-[10px] font-bold uppercase tracking-wider text-primary block leading-none">
                  {{ product.categoryLabel }}
                </span>
                <h4 class="font-extrabold text-sm text-main group-hover:text-primary transition-colors m3-transition-fast line-clamp-1 leading-snug pt-0.5">
                  {{ product.name }}
                </h4>
                <p class="text-xs text-muted line-clamp-1 font-normal">
                  {{ product.description }}
                </p>
              </div>
            </button>

            <div class="px-3 pb-3 pt-1 flex items-center gap-2">
              <m3-button
                variant="tonal"
                size="sm"
                icon="tune"
                customClass="flex-1"
                [disabled]="!canAddMore"
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
                    [disabled]="!canAddMore"
                    [attr.aria-label]="'Sumar uno de ' + product.name"
                    (click)="updateQuantity.emit({ productId: product.id, delta: 1 })"
                    class="btn-m3 state-layer focus-ring-m3 touch-target-48 w-7 h-7 rounded-full hover:bg-on-primary/15 text-on-primary grid place-items-center cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed">
                    <span class="material-symbols-rounded text-sm font-bold" aria-hidden="true">add</span>
                  </button>
                </div>
              } @else {
                <m3-button
                  variant="filled"
                  size="sm"
                  [icon]="isOutOfStock ? 'block' : 'shopping_bag'"
                  customClass="flex-1"
                  [disabled]="!canAddMore"
                  [ariaLabel]="isOutOfStock ? product.name + ' agotado' : 'Añadir ' + product.name + ' al pedido'"
                  (action)="addProduct.emit(product)">
                  {{ isOutOfStock ? 'Agotado' : 'Añadir' }}
                </m3-button>
              }
            </div>
          </m3-card>
        } @empty {
          <m3-card
            variant="filled"
            surface="low"
            shape="xl"
            padding="xl"
            customClass="col-span-full text-center m3-anim-fade-through">
            <div class="flex flex-col items-center gap-2 py-4">
              <span class="material-symbols-rounded text-4xl text-muted" aria-hidden="true">search_off</span>
              <h4 class="font-bold text-base text-main">No se encontraron productos</h4>
              <p class="text-xs text-muted">Revisá el término de búsqueda o cambiá de categoría.</p>
            </div>
          </m3-card>
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
  readonly shiftInfo = input<PosShiftSummary | null>(null);
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
      map.set(item.product.id, (map.get(item.product.id) ?? 0) + item.quantity);
    }
    return map;
  });

  productCardClasses(qty: number, isOutOfStock: boolean): string {
    const base = 'pos-product-card group relative flex flex-col justify-between overflow-hidden';
    if (isOutOfStock) {
      return `${base} is-out-of-stock opacity-75`;
    }
    if (qty > 0) {
      return `${base} is-selected ring-2 ring-inset ring-primary shadow-xs`;
    }
    return base;
  }

  focusSearch(): void {
    this.searchField()?.focus();
  }

  markImageFailed(productId: number): void {
    this.failedImages.update(prev => ({ ...prev, [productId]: true }));
  }
}
