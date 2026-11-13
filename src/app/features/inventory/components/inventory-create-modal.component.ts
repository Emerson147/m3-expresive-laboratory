import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateMasterProductDto,
  MasterProduct,
  ProductColor,
  STANDARD_COLORS,
  Warehouse
} from '../../../core/inventory/inventory.models';

@Component({
  selector: 'app-inventory-create-modal',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 z-40 bg-black/70 backdrop-blur-md m3-dialog-backdrop cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-create-title"
      class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-5xl h-[90vh] max-h-[840px] flex flex-col rounded-[32px] bg-surface-box border border-outline-sub shadow-2xl overflow-hidden m3-dialog-surface">
      <div class="flex items-center justify-between px-6 py-4 border-b border-outline-sub shrink-0 bg-surface/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-primary text-on-primary grid place-items-center shadow-xs">
            <span class="material-symbols-rounded text-xl" aria-hidden="true">auto_awesome</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3
                #modalHeading
                id="inventory-create-title"
                tabindex="-1"
                class="text-base sm:text-lg font-black text-main tracking-tight outline-none">
                Product Studio • Alta de Modelo
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                Generador 2D
              </span>
            </div>
            <p class="text-xs text-muted">Configura el estilo base y proyecta en tiempo real la cuadrícula de variantes</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-outline-sub text-xs font-mono font-bold text-muted">
            <span>{{ selectedSizes().length }} Tallas</span>
            <span aria-hidden="true">×</span>
            <span>{{ selectedColors().length }} Colores</span>
            <span aria-hidden="true">=</span>
            <span class="text-primary">{{ totalVariants() }} Variantes</span>
          </div>

          <button
            type="button"
            aria-label="Cerrar estudio de producto"
            (click)="close.emit()"
            class="w-9 h-9 rounded-full bg-surface hover:bg-surface-high border border-outline-sub grid place-items-center text-muted hover:text-main cursor-pointer transition-all">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">close</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 min-h-0 flex-1 overflow-hidden">
        <div class="lg:col-span-7 overflow-y-auto p-5 sm:p-6 space-y-5 m3-scrollbar">
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">1</span>
              <span>Identidad de Prenda</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label for="create-product-name" class="text-[11px] font-bold text-muted">Nombre del Modelo *</label>
                <input
                  id="create-product-name"
                  type="text"
                  [ngModel]="newProductName()"
                  (ngModelChange)="newProductName.set($event)"
                  placeholder="ej. Sobrecamisa Pana Heavyweight"
                  class="w-full text-xs px-3 py-2.5 rounded-xl bg-surface border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
              </div>

              <div class="space-y-1">
                <label for="create-product-sku" class="text-[11px] font-bold text-muted">SKU Base *</label>
                <input
                  id="create-product-sku"
                  type="text"
                  [ngModel]="newProductSku()"
                  (ngModelChange)="newProductSku.set($event)"
                  [attr.aria-invalid]="isDuplicateSku() ? 'true' : null"
                  placeholder="ej. OVS-700"
                  [class.border-rose-500]="isDuplicateSku()"
                  class="w-full text-xs px-3 py-2.5 font-mono uppercase rounded-xl bg-surface border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary font-bold" />
                @if (isDuplicateSku()) {
                  <p role="alert" class="text-[11px] font-medium text-rose-500">
                    Ya existe una prenda con el SKU {{ newProductSku().trim().toUpperCase() }}.
                  </p>
                }
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2.5 pt-1">
              <div class="space-y-1">
                <label for="create-product-category" class="text-[11px] font-bold text-muted">Categoría</label>
                <select
                  id="create-product-category"
                  [ngModel]="newProductCategory()"
                  (ngModelChange)="onCategoryChange($event)"
                  class="w-full text-xs px-2.5 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium">
                  <option value="shirts">Camisería Fina</option>
                  <option value="polos">Polos Piqué</option>
                  <option value="pants">Pantalones Chinos</option>
                  <option value="jackets">Casacas & Outerwear</option>
                </select>
              </div>

              <div class="space-y-1">
                <label for="create-product-price" class="text-[11px] font-bold text-muted">PVP Base ($ USD)</label>
                <input
                  id="create-product-price"
                  type="number"
                  [ngModel]="newProductPrice()"
                  (ngModelChange)="onPriceChange($event)"
                  min="1"
                  step="0.5"
                  class="w-full text-xs px-2.5 py-2.5 font-mono font-bold rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div class="space-y-1">
                <label for="create-product-brand" class="text-[11px] font-bold text-muted">Marca</label>
                <input
                  id="create-product-brand"
                  type="text"
                  [ngModel]="newProductBrand()"
                  (ngModelChange)="newProductBrand.set($event)"
                  class="w-full text-xs px-2.5 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
              </div>
            </div>

            <div class="space-y-1.5 pt-1">
              <span class="text-[11px] font-bold text-muted block">Foto de Lookbook (Selector Rápido)</span>
              <div class="grid grid-cols-5 gap-2">
                @for (preset of lookbookPresets; track preset.label) {
                  <button
                    type="button"
                    [attr.aria-pressed]="newProductImageUrl() === preset.url"
                    (click)="newProductImageUrl.set(preset.url)"
                    [class.border-primary]="newProductImageUrl() === preset.url"
                    [class.ring-2]="newProductImageUrl() === preset.url"
                    [class.ring-primary]="newProductImageUrl() === preset.url"
                    class="h-14 rounded-xl overflow-hidden border border-outline-sub cursor-pointer relative group transition-all">
                    <img [src]="preset.url" [alt]="preset.label" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span class="absolute inset-x-0 bottom-0 text-[8px] font-bold text-white bg-black/60 py-0.5 truncate px-1 text-center">
                      {{ preset.label }}
                    </span>
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="space-y-2.5 pt-4 border-t border-outline-sub">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">2</span>
                <span>Eje X: Curva de Tallas ({{ selectedSizes().length }} activas)</span>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="selectAllSizes()"
                  class="text-[11px] font-bold text-primary hover:underline cursor-pointer">
                  Todas
                </button>
                <span class="text-muted text-xs" aria-hidden="true">•</span>
                <button
                  type="button"
                  (click)="selectCoreCurve()"
                  class="text-[11px] font-bold text-muted hover:text-main cursor-pointer">
                  Curva Central
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              @for (size of contextualSizes(); track size) {
                <button
                  type="button"
                  [attr.aria-pressed]="selectedSizes().includes(size)"
                  (click)="toggleSize(size)"
                  [class.bg-primary]="selectedSizes().includes(size)"
                  [class.text-on-primary]="selectedSizes().includes(size)"
                  [class.border-primary]="selectedSizes().includes(size)"
                  [class.shadow-xs]="selectedSizes().includes(size)"
                  [class.bg-surface]="!selectedSizes().includes(size)"
                  [class.text-muted]="!selectedSizes().includes(size)"
                  class="px-4 py-2 rounded-xl text-xs font-mono font-bold border border-outline-sub cursor-pointer transition-all hover:scale-105">
                  {{ size }}
                </button>
              }
            </div>
          </div>

          <div class="space-y-2.5 pt-4 border-t border-outline-sub">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">3</span>
                <span>Eje Y: Paleta Textil ({{ selectedColors().length }} colores activos)</span>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              @for (col of standardColors; track col.code) {
                <button
                  type="button"
                  [attr.aria-pressed]="isColorSelected(col)"
                  (click)="toggleColor(col)"
                  [class]="isColorSelected(col) ? 'p-2.5 rounded-xl border-2 border-primary bg-primary/10 text-left flex items-center gap-2.5 cursor-pointer shadow-xs group transition-all' : 'p-2.5 rounded-xl border border-outline-sub text-left flex items-center gap-2.5 cursor-pointer hover:border-primary/50 transition-all group'">
                  <div
                    class="w-6 h-6 rounded-full shadow-2xs shrink-0 grid place-items-center transition-transform group-hover:scale-110"
                    [style.background-color]="col.hex"
                    [style.border]="col.border ? '1.5px solid ' + col.border : '1.5px solid rgba(0,0,0,0.12)'"
                    aria-hidden="true">
                    @if (isColorSelected(col)) {
                      <span
                        [class.text-white]="col.hex !== '#FFFFFF' && col.hex !== '#F8FAFC'"
                        [class.text-black]="col.hex === '#FFFFFF' || col.hex === '#F8FAFC'"
                        class="material-symbols-rounded text-sm font-black">
                        check
                      </span>
                    }
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-main leading-tight truncate">{{ col.name }}</div>
                    <div class="text-[10px] font-mono text-muted">{{ col.code }}</div>
                  </div>
                </button>
              }
            </div>
          </div>

          <div class="space-y-3 pt-4 border-t border-outline-sub">
            <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">4</span>
              <span>Recepción del Primer Lote</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label for="create-target-wh" class="text-[11px] font-bold text-muted">Almacén de Entrada</label>
                <select
                  id="create-target-wh"
                  [ngModel]="targetWarehouseId()"
                  (ngModelChange)="targetWarehouseId.set($event)"
                  class="w-full text-xs px-3 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium">
                  @for (wh of warehouses(); track wh.id) {
                    <option [value]="wh.id">{{ wh.name }}</option>
                  }
                </select>
              </div>

              <div class="space-y-1">
                <label for="create-initial-stock" class="text-[11px] font-bold text-muted">Stock por Variante (uds)</label>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Restar 5 unidades iniciales por variante"
                    (click)="adjustInitialStock(-5)"
                    class="w-9 h-9 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high grid place-items-center text-xs cursor-pointer">
                    -5
                  </button>
                  <input
                    id="create-initial-stock"
                    type="number"
                    [ngModel]="initialStockPerCell()"
                    (ngModelChange)="onInitialStockInput($event)"
                    min="0"
                    class="flex-1 text-center font-mono font-black text-sm py-2 rounded-xl bg-surface border border-outline-sub text-main" />
                  <button
                    type="button"
                    aria-label="Sumar 5 unidades iniciales por variante"
                    (click)="adjustInitialStock(5)"
                    class="w-9 h-9 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high grid place-items-center text-xs cursor-pointer">
                    +5
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 bg-surface/80 p-5 sm:p-6 border-t lg:border-t-0 lg:border-l border-outline-sub flex flex-col justify-between overflow-y-auto m3-scrollbar space-y-4">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-muted uppercase tracking-wider">Live Matrix Canvas</span>
              <span class="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                Vista en Tiempo Real
              </span>
            </div>

            <div class="p-3.5 rounded-2xl bg-surface-box border border-outline-sub shadow-xs flex items-center gap-3.5">
              <div class="w-20 h-20 rounded-xl overflow-hidden bg-surface-high border border-outline-sub shrink-0">
                <img
                  [src]="newProductImageUrl()"
                  [alt]="newProductName() || 'Vista previa del modelo'"
                  class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                    {{ newProductSku() || 'SKU-000' }}
                  </span>
                  <span class="text-[10px] text-muted truncate">{{ newProductCategoryLabel() }}</span>
                </div>
                <h4 class="text-sm font-black text-main truncate mt-0.5">
                  {{ newProductName() || 'Nombre de la Prenda' }}
                </h4>
                <div class="text-xs font-mono font-bold text-main mt-1">
                  \${{ newProductPrice().toFixed(2) }} <span class="text-[10px] font-normal text-muted">USD</span>
                </div>
              </div>
            </div>

            <div class="rounded-2xl bg-surface-box border border-outline-sub overflow-hidden shadow-2xs">
              <div class="p-2.5 bg-surface border-b border-outline-sub flex items-center justify-between text-[11px] font-bold text-muted">
                <span>Estructura 2D de la Prenda</span>
                <span class="font-mono text-primary">{{ selectedSizes().length }} × {{ selectedColors().length }} = {{ totalVariants() }} celdas</span>
              </div>

              <div class="overflow-x-auto max-h-56 m3-scrollbar">
                <table class="w-full text-left border-collapse text-[11px]">
                  <caption class="sr-only">Vista previa de variantes generadas</caption>
                  <thead>
                    <tr class="border-b border-outline-sub bg-surface/50 text-[10px] text-muted font-bold font-mono">
                      <th scope="col" class="p-2">Color</th>
                      @for (sz of selectedSizes(); track sz) {
                        <th scope="col" class="p-2 text-center">{{ sz }}</th>
                      }
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-sub font-mono">
                    @for (col of selectedColors(); track col.code) {
                      <tr class="hover:bg-surface/30">
                        <th scope="row" class="p-2 font-normal text-left">
                          <div class="flex items-center gap-1.5">
                            <div
                              class="w-3.5 h-3.5 rounded-full shrink-0"
                              [style.background-color]="col.hex"
                              [style.border]="col.border ? '1px solid ' + col.border : '1px solid rgba(0,0,0,0.1)'"
                              aria-hidden="true">
                            </div>
                            <span class="text-[10px] font-bold text-main font-sans truncate max-w-[80px]">{{ col.name }}</span>
                          </div>
                        </th>
                        @for (sz of selectedSizes(); track sz) {
                          <td class="p-1.5 text-center">
                            <span class="px-2 py-0.5 rounded-lg bg-surface border border-outline-sub text-main font-bold block text-[10px]">
                              {{ initialStockPerCell() }}
                            </span>
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-surface-box border border-outline-sub space-y-2">
            <div class="text-[11px] font-bold text-muted uppercase tracking-wider">Balance Inicial del Lote</div>
            <div class="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div class="text-[10px] text-muted">Unidades a Ingresar</div>
                <div class="text-lg font-black text-main font-mono">
                  {{ previewBatchUnits() }} <span class="text-xs font-normal text-muted">uds</span>
                </div>
              </div>
              <div>
                <div class="text-[10px] text-muted">Valorización Lote</div>
                <div class="text-lg font-black text-primary font-mono">
                  \${{ previewBatchValuation().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-outline-sub bg-surface shrink-0">
        <div class="text-xs text-muted flex items-center gap-1.5">
          <span class="material-symbols-rounded text-primary text-base" aria-hidden="true">check_circle</span>
          <span>Recepción inmediata de <strong>{{ previewBatchUnits() }} unidades</strong> en <strong>{{ getWarehouseName(targetWarehouseId()) }}</strong></span>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-surface-high cursor-pointer transition-all">
            Cancelar
          </button>
          <button
            type="button"
            (click)="submit()"
            [disabled]="!canSubmit()"
            class="btn-m3 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
            <span class="material-symbols-rounded text-base" aria-hidden="true">rocket_launch</span>
            <span>Generar y Abrir en Matriz</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class InventoryCreateModalComponent {
  readonly warehouses = input.required<Warehouse[]>();
  readonly existingProducts = input.required<MasterProduct[]>();

  readonly close = output<void>();
  readonly createProduct = output<CreateMasterProductDto>();

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly standardColors = STANDARD_COLORS;

  readonly lookbookPresets = [
    { label: 'Camisa', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85' },
    { label: 'Polo', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=85' },
    { label: 'Pantalón', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=85' },
    { label: 'Casaca', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=85' },
    { label: 'Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=85' }
  ];

  readonly categorySizeMap: Record<string, string[]> = {
    shirts: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    polos: ['S', 'M', 'L', 'XL', 'XXL'],
    pants: ['28', '30', '32', '34', '36', '38'],
    jackets: ['S', 'M', 'L', 'XL', 'XXL']
  };

  readonly newProductName = signal<string>('');
  readonly newProductSku = signal<string>('');
  readonly newProductCategory = signal<string>('shirts');
  readonly newProductCategoryLabel = signal<string>('Camisería Fina');
  readonly newProductBrand = signal<string>('Sartorial Lima');
  readonly newProductSeason = signal<string>('Temporada 2026');
  readonly newProductPrice = signal<number>(69.0);
  readonly newProductImageUrl = signal<string>(this.lookbookPresets[0].url);
  readonly selectedSizes = signal<string[]>(['S', 'M', 'L', 'XL']);
  readonly selectedColors = signal<ProductColor[]>([
    STANDARD_COLORS[0],
    STANDARD_COLORS[1],
    STANDARD_COLORS[2]
  ]);
  readonly initialStockPerCell = signal<number>(15);
  readonly targetWarehouseId = signal<string>('WH-CENTRAL');

  readonly contextualSizes = computed<string[]>(() =>
    this.categorySizeMap[this.newProductCategory()] || ['S', 'M', 'L', 'XL']
  );

  readonly totalVariants = computed<number>(() =>
    this.selectedSizes().length * this.selectedColors().length
  );

  readonly previewBatchUnits = computed<number>(() =>
    this.totalVariants() * this.initialStockPerCell()
  );

  readonly previewBatchValuation = computed<number>(() =>
    this.previewBatchUnits() * this.newProductPrice()
  );

  readonly isDuplicateSku = computed<boolean>(() => {
    const normalized = this.newProductSku().trim().toUpperCase();
    if (!normalized) return false;
    return this.existingProducts().some(p => p.sku.toUpperCase() === normalized);
  });

  readonly canSubmit = computed<boolean>(() =>
    Boolean(this.newProductName().trim()) &&
    Boolean(this.newProductSku().trim()) &&
    !this.isDuplicateSku() &&
    this.newProductPrice() >= 0 &&
    this.initialStockPerCell() >= 0 &&
    this.selectedSizes().length > 0 &&
    this.selectedColors().length > 0
  );

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });
  }

  onCategoryChange(cat: string): void {
    this.newProductCategory.set(cat);
    const map: Record<string, string> = {
      shirts: 'Camisería Fina',
      polos: 'Esenciales Urbanos',
      pants: 'Sastrería Casual',
      jackets: 'Outerwear Premium'
    };
    this.newProductCategoryLabel.set(map[cat] || 'Moda Textil');
    this.selectedSizes.set([...(this.categorySizeMap[cat] || ['S', 'M', 'L', 'XL'])]);

    const photoMap: Record<string, string> = {
      shirts: this.lookbookPresets[0].url,
      polos: this.lookbookPresets[1].url,
      pants: this.lookbookPresets[2].url,
      jackets: this.lookbookPresets[3].url
    };
    if (photoMap[cat]) {
      this.newProductImageUrl.set(photoMap[cat]);
    }
  }

  onPriceChange(rawValue: unknown): void {
    const parsed = Number(rawValue);
    this.newProductPrice.set(Number.isFinite(parsed) ? Math.max(0, parsed) : 0);
  }

  onInitialStockInput(rawValue: unknown): void {
    const parsed = Number(rawValue);
    this.initialStockPerCell.set(Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0);
  }

  adjustInitialStock(delta: number): void {
    this.initialStockPerCell.update(val => Math.max(0, val + delta));
  }

  selectAllSizes(): void {
    this.selectedSizes.set([...this.contextualSizes()]);
  }

  selectCoreCurve(): void {
    this.selectedSizes.set(
      this.newProductCategory() === 'pants' ? ['30', '32', '34'] : ['S', 'M', 'L']
    );
  }

  toggleSize(size: string): void {
    const current = this.selectedSizes();
    if (current.includes(size)) {
      if (current.length > 1) {
        this.selectedSizes.set(current.filter(s => s !== size));
      }
      return;
    }
    this.selectedSizes.set([...current, size]);
  }

  toggleColor(color: ProductColor): void {
    const current = this.selectedColors();
    if (current.some(c => c.code === color.code)) {
      if (current.length > 1) {
        this.selectedColors.set(current.filter(c => c.code !== color.code));
      }
      return;
    }
    this.selectedColors.set([...current, color]);
  }

  isColorSelected(color: ProductColor): boolean {
    return this.selectedColors().some(c => c.code === color.code);
  }

  getWarehouseName(whId: string): string {
    const wh = this.warehouses().find(w => w.id === whId);
    return wh ? wh.name : whId;
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.createProduct.emit({
      name: this.newProductName(),
      sku: this.newProductSku(),
      category: this.newProductCategory(),
      categoryLabel: this.newProductCategoryLabel(),
      brand: this.newProductBrand(),
      season: this.newProductSeason(),
      basePrice: this.newProductPrice(),
      imageUrl: this.newProductImageUrl(),
      sizes: this.selectedSizes(),
      colors: this.selectedColors(),
      initialStockPerCell: this.initialStockPerCell(),
      targetWarehouseId: this.targetWarehouseId()
    });
  }
}
