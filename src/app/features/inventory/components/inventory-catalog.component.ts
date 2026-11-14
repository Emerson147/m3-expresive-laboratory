import { ChangeDetectionStrategy, Component, input, output, signal, viewChild } from '@angular/core';
import { MasterProduct } from '../../../core/inventory/inventory.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

export interface InventoryCategoryOption {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-inventory-catalog',
  standalone: true,
  imports: [M3ButtonComponent, M3ChipComponent, M3TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col min-h-0'
  },
  template: `
    <aside
      aria-label="Catálogo de estilos y modelos"
      class="flex-1 min-h-0 flex flex-col gap-3 bg-surface-low rounded-m3-xl p-3.5">

      <!-- Clean Sticky Search & Category Filter Rail -->
      <div class="space-y-2.5 shrink-0">
        <div class="flex items-baseline justify-between gap-2 px-0.5">
          <h2 class="text-title-md-emphasized text-main truncate">Prendas & Modelos</h2>
          <span class="text-label-sm font-mono tabular-nums text-muted shrink-0">
            {{ products().length }} estilos
          </span>
        </div>

        <m3-text-field
          #searchField
          variant="outlined"
          icon="search"
          label="Buscar prenda"
          placeholder="SKU, nombre o marca..."
          [clearable]="true"
          [value]="searchQuery()"
          (valueChange)="searchChange.emit($event)"
          (clear)="searchChange.emit('')" />

        <div role="group" aria-label="Filtrar por categoría" class="flex flex-wrap gap-1.5">
          @for (cat of categories(); track cat.id) {
            <m3-chip
              type="filter"
              [selected]="selectedCategory() === cat.id"
              [icon]="cat.icon ?? null"
              (action)="categoryChange.emit(cat.id)">
              {{ cat.label }}
            </m3-chip>
          }
        </div>
      </div>

      <!-- Independent Scrollable Master List -->
      @if (products().length > 0) {
        <ul
          role="list"
          aria-label="Lista de prendas disponibles"
          class="inv-scroll-pane flex-1 min-h-0 max-h-[540px] lg:max-h-none overflow-y-auto m3-scrollbar list-none m-0 p-0.5 space-y-2">
          @for (prod of products(); track prod.id) {
            @let isSelected = selectedProductId() === prod.id;
            <li
              class="inv-catalog-item"
              [style.view-transition-name]="isCatalogFlipActive() ? 'inv-card-' + prod.id : null">
              <button
                type="button"
                [attr.aria-pressed]="isSelected"
                (click)="selectProduct.emit(prod.id)"
                [class]="'inv-catalog-card state-layer focus-ring-m3 w-full text-left p-2.5 flex items-center gap-3 group cursor-pointer ' +
                  (isSelected
                    ? 'is-selected bg-primary-box text-on-primary-box shadow-m3-level1'
                    : 'bg-surface hover:bg-surface-high text-main')">

                <div
                  [style.view-transition-name]="transitionPhase() === 'before' && transitioningProductId() === prod.id ? 'product-hero-image' : null"
                  [class]="'w-14 h-14 overflow-hidden bg-surface-high shrink-0 relative transition-all m3-transition-emphasized ' +
                    (isSelected ? 'rounded-m3-lg' : 'rounded-m3-md')">
                  @if (failedImages()[prod.id]) {
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="material-symbols-rounded text-muted text-xl" aria-hidden="true">checkroom</span>
                    </div>
                  } @else {
                    <img
                      [src]="prod.imageUrl"
                      [alt]="prod.name"
                      width="56"
                      height="56"
                      (error)="markImageFailed(prod.id)"
                      class="block w-full h-full object-cover transition-transform m3-transition-emphasized group-hover:scale-105" />
                  }
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span
                      [class]="'text-label-sm-emphasized font-mono px-1.5 py-0.5 rounded-m3-xs ' +
                        (isSelected ? 'bg-primary text-on-primary' : 'bg-primary-box text-on-primary-box')">
                      {{ prod.sku }}
                    </span>
                    <span [class]="'text-label-sm truncate ' + (isSelected ? 'opacity-80' : 'text-muted')">
                      {{ prod.brand }}
                    </span>
                  </div>

                  <h3
                    [style.view-transition-name]="transitionPhase() === 'before' && transitioningProductId() === prod.id ? 'product-hero-title' : null"
                    [class]="'inv-hero-title text-title-sm-emphasized truncate mt-0.5 ' +
                      (isSelected ? 'text-on-primary-box' : 'text-main group-hover:text-primary')">
                    {{ prod.name }}
                  </h3>

                  <div class="flex items-center justify-between gap-2 mt-1">
                    <span class="text-label-lg-emphasized font-mono tabular-nums">
                      \${{ prod.basePrice.toFixed(2) }}
                    </span>

                    <div class="flex items-center gap-1.5">
                      <div class="flex -space-x-1" aria-hidden="true">
                        @for (clr of prod.availableColors.slice(0, 4); track clr.code) {
                          <span
                            class="w-3 h-3 rounded-m3-full ring-1 ring-surface"
                            [style.background-color]="clr.hex">
                          </span>
                        }
                      </div>
                      <span [class]="'text-label-sm ' + (isSelected ? 'opacity-85' : 'text-muted')">
                        {{ prod.availableSizes.length }}T
                      </span>
                    </div>
                  </div>
                </div>

                @if (isSelected) {
                  <span
                    class="w-7 h-7 rounded-m3-md bg-primary text-on-primary grid place-items-center shrink-0 m3-anim-spring-pop"
                    aria-hidden="true">
                    <span class="material-symbols-rounded text-base">arrow_forward</span>
                  </span>
                }
              </button>
            </li>
          }
        </ul>
      } @else {
        <div class="flex-1 grid place-items-center bg-surface rounded-m3-xl p-6 text-center m3-anim-item-in">
          <div class="space-y-3 max-w-[240px]">
            <div class="w-12 h-12 mx-auto rounded-m3-xl bg-surface-high grid place-items-center text-muted">
              <span class="material-symbols-rounded text-2xl" aria-hidden="true">inventory</span>
            </div>
            <div class="space-y-1">
              <p class="text-title-sm-emphasized text-main">No hay prendas con ese filtro</p>
              <p class="text-body-sm text-muted">Prueba otro SKU o restablece la categoría.</p>
            </div>
            <div class="flex justify-center">
              <m3-button
                variant="tonal"
                size="sm"
                icon="filter_alt_off"
                (action)="clearFilters.emit()">
                Limpiar filtros
              </m3-button>
            </div>
          </div>
        </div>
      }
    </aside>
  `
})
export class InventoryCatalogComponent {
  readonly products = input.required<MasterProduct[]>();
  readonly categories = input.required<InventoryCategoryOption[]>();
  readonly selectedProductId = input.required<number>();
  readonly searchQuery = input.required<string>();
  readonly selectedCategory = input.required<string>();
  readonly transitioningProductId = input<number | null>(null);
  readonly transitionPhase = input<'before' | 'after' | null>(null);
  readonly isCatalogFlipActive = input<boolean>(false);

  readonly searchChange = output<string>();
  readonly categoryChange = output<string>();
  readonly selectProduct = output<number>();
  readonly clearFilters = output<void>();

  private readonly searchField = viewChild<M3TextFieldComponent>('searchField');
  readonly failedImages = signal<Record<number, boolean>>({});

  markImageFailed(productId: number): void {
    this.failedImages.update(prev => ({ ...prev, [productId]: true }));
  }

  focusSearch(): void {
    this.searchField()?.focus();
  }
}
