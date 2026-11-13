import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterProduct } from '../../../core/inventory/inventory.models';

export interface InventoryCategoryOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-inventory-catalog',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3.5">
      <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-main uppercase tracking-wider">Prendas & Modelos</h2>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-semibold text-muted">
              {{ products().length }} estilos
            </span>
            <button
              type="button"
              (click)="openCreate.emit()"
              class="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
              <span class="material-symbols-rounded text-sm" aria-hidden="true">add_circle</span>
              Nuevo
            </button>
          </div>
        </div>

        <div class="relative">
          <span
            class="material-symbols-rounded absolute left-3 top-2.5 text-base text-muted pointer-events-none"
            aria-hidden="true">
            search
          </span>
          <input
            #searchInput
            type="search"
            aria-label="Buscar prenda por SKU, nombre o marca"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchChange.emit($event)"
            placeholder="Buscar por SKU, nombre..."
            class="w-full text-xs pl-8 pr-8 py-2 rounded-xl bg-surface border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          @if (searchQuery()) {
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              (click)="searchChange.emit('')"
              class="absolute right-2.5 top-2 text-muted hover:text-main cursor-pointer">
              <span class="material-symbols-rounded text-sm" aria-hidden="true">close</span>
            </button>
          }
        </div>

        <div role="group" aria-label="Filtrar por categoría" class="flex flex-wrap gap-1.5 pt-1">
          @for (cat of categories(); track cat.id) {
            <button
              type="button"
              [attr.aria-pressed]="selectedCategory() === cat.id"
              (click)="categoryChange.emit(cat.id)"
              [class.bg-primary]="selectedCategory() === cat.id"
              [class.text-on-primary]="selectedCategory() === cat.id"
              [class.bg-surface]="selectedCategory() !== cat.id"
              [class.text-muted]="selectedCategory() !== cat.id"
              class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-outline-sub transition-all cursor-pointer hover:text-main">
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      <div class="space-y-2 max-h-[580px] overflow-y-auto pr-1 m3-scrollbar">
        @for (prod of products(); track prod.id) {
          <button
            type="button"
            (click)="selectProduct.emit(prod.id)"
            [attr.aria-current]="selectedProductId() === prod.id ? 'true' : null"
            [style.view-transition-name]="'product-card-' + prod.id"
            [class]="selectedProductId() === prod.id ? 'w-full text-left p-3 rounded-2xl bg-primary/10 border-2 border-primary cursor-pointer transition-all flex gap-3 items-center group shadow-md' : 'w-full text-left p-3 rounded-2xl bg-surface-box border border-outline-sub cursor-pointer transition-all hover:border-primary/50 flex gap-3 items-center group'">
            <div class="w-16 h-16 rounded-xl overflow-hidden bg-surface-high shrink-0 border border-outline-sub relative grid place-items-center">
              @if (failedImages()[prod.id]) {
                <span class="material-symbols-rounded text-muted text-xl" aria-hidden="true">checkroom</span>
              } @else {
                <img
                  [src]="prod.imageUrl"
                  [alt]="prod.name"
                  (error)="markImageFailed(prod.id)"
                  [style.view-transition-name]="transitionPhase() === 'before' && transitioningProductId() === prod.id ? 'product-hero-image' : null"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              }
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {{ prod.sku }}
                </span>
                <span class="text-[10px] text-muted truncate">{{ prod.brand }}</span>
              </div>
              <h3
                [style.view-transition-name]="transitionPhase() === 'before' && transitioningProductId() === prod.id ? 'product-hero-title' : null"
                class="text-xs font-bold text-main truncate mt-0.5 group-hover:text-primary transition-colors">
                {{ prod.name }}
              </h3>
              <div class="flex items-center justify-between mt-1 text-[11px]">
                <span class="font-mono font-bold text-main">\${{ prod.basePrice.toFixed(2) }}</span>
                <div class="flex items-center gap-1">
                  <span class="text-[10px] text-muted">{{ prod.availableColors.length }} cols</span>
                  <span class="text-[10px] text-muted" aria-hidden="true">•</span>
                  <span class="text-[10px] text-muted">{{ prod.availableSizes.length }} tallas</span>
                </div>
              </div>
            </div>

            @if (selectedProductId() === prod.id) {
              <span class="material-symbols-rounded text-primary text-xl shrink-0" aria-hidden="true">
                arrow_forward_ios
              </span>
            }
          </button>
        } @empty {
          <div class="p-6 rounded-2xl bg-surface-box border border-outline-sub text-center space-y-2.5 m3-anim-item-in">
            <span class="material-symbols-rounded text-3xl text-muted" aria-hidden="true">inventory</span>
            <div class="space-y-1">
              <p class="text-xs font-bold text-main">No hay prendas con ese filtro</p>
              <p class="text-[11px] text-muted">Prueba otro SKU o restablece la categoría.</p>
            </div>
            <button
              type="button"
              (click)="clearFilters.emit()"
              class="btn-m3 px-3 py-1.5 rounded-xl bg-surface border border-outline-sub text-xs font-semibold text-primary hover:bg-surface-high cursor-pointer">
              Limpiar filtros
            </button>
          </div>
        }
      </div>
    </div>
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

  readonly searchChange = output<string>();
  readonly categoryChange = output<string>();
  readonly selectProduct = output<number>();
  readonly openCreate = output<void>();
  readonly clearFilters = output<void>();

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly failedImages = signal<Record<number, boolean>>({});

  markImageFailed(productId: number): void {
    this.failedImages.update(prev => ({ ...prev, [productId]: true }));
  }

  focusSearch(): void {
    this.searchInput()?.nativeElement.focus();
  }
}
