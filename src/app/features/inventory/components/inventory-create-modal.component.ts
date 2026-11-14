import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import {
  CreateMasterProductDto,
  MasterProduct,
  ProductColor,
  STANDARD_COLORS,
  Warehouse
} from '../../../core/inventory/inventory.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { INVENTORY_SELECT_STYLES } from './inventory-select.styles';

@Component({
  selector: 'app-inventory-create-modal',
  standalone: true,
  imports: [
    FormsModule,
    M3ButtonComponent,
    M3ChipComponent,
    M3TextFieldComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [INVENTORY_SELECT_STYLES],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
      class="fixed inset-0 z-40 bg-scrim cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-create-title"
      [style.view-transition-name]="isDialogTransitionActive() ? 'dialog-transform' : null"
      [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
      [class.shadow-m3-level3]="!isDialogTransitionActive()"
      class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-5xl h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box">

      <!-- Floating Tonal Header (Aligned with Transfer Dialog) -->
      <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2 shrink-0">
        <header class="bg-surface rounded-m3-xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-m3-lg bg-primary text-on-primary grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-xl" aria-hidden="true">auto_awesome</span>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span class="px-2 py-0.5 rounded-m3-xs bg-primary-box text-on-primary-box text-label-sm-emphasized font-mono uppercase tracking-wider">
                Generador 2D
              </span>
              <span class="text-label-sm text-muted">Alta rápida por curva</span>
            </div>
            <h2
              #modalHeading
              id="inventory-create-title"
              tabindex="-1"
              class="text-title-lg-emphasized text-main outline-none leading-tight">
              Product Studio • Alta de Modelo
            </h2>
            <p class="text-body-sm text-muted truncate mt-0.5">
              Define identidad, curva de tallas, colores y lote inicial
            </p>
          </div>
        </div>

        <m3-button
          [iconOnly]="true"
          variant="text"
          size="sm"
          icon="close"
          ariaLabel="Cerrar estudio de producto"
          (action)="close.emit()" />
        </header>
      </div>

      <form (ngSubmit)="submit()" novalidate class="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar px-5 sm:px-6 py-2">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          <!-- Left Configurator Column (Tonal Capsules on bg-surface-box, zero divider lines) -->
          <div class="lg:col-span-7 space-y-4">

            <!-- Capsule 1: Identity & Lookbook -->
            <section aria-label="Identidad de prenda" class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-3.5">
              <h3 class="flex items-center gap-2 text-label-md-emphasized text-muted uppercase tracking-wider">
                <span class="w-5 h-5 rounded-m3-full bg-primary-box text-on-primary-box grid place-items-center text-label-sm-emphasized">1</span>
                <span>Identidad de Prenda</span>
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <m3-text-field
                  [id]="'create-product-name'"
                  name="productName"
                  variant="filled"
                  label="Nombre del Modelo *"
                  placeholder="ej. Sobrecamisa Pana Heavyweight"
                  [required]="true"
                  [showValidState]="true"
                  [value]="newProductName()"
                  (valueChange)="newProductName.set($event)" />

                <m3-text-field
                  [id]="'create-product-sku'"
                  name="productSku"
                  variant="filled"
                  label="SKU Base *"
                  placeholder="ej. OVS-700"
                  [required]="true"
                  [showValidState]="true"
                  [errorText]="isDuplicateSku() ? 'Ya existe una prenda con el SKU ' + newProductSku().trim().toUpperCase() + '.' : null"
                  [value]="newProductSku()"
                  (valueChange)="newProductSku.set($event)" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div class="inv-filled-select">
                  <label for="create-product-category" class="inv-filled-select__label">Categoría</label>
                  <select
                    id="create-product-category"
                    name="category"
                    [value]="newProductCategory()"
                    (change)="onCategoryChange($any($event.target).value)"
                    class="m3-select">
                    <option value="shirts">Camisería Fina</option>
                    <option value="polos">Polos Piqué</option>
                    <option value="pants">Pantalones Chinos</option>
                    <option value="jackets">Casacas & Outerwear</option>
                  </select>
                </div>

                <m3-text-field
                  [id]="'create-product-price'"
                  name="basePrice"
                  variant="filled"
                  label="PVP Base *"
                  type="number"
                  inputMode="decimal"
                  prefix="$"
                  suffix="USD"
                  [required]="true"
                  [value]="newProductPrice().toString()"
                  (valueChange)="onPriceChange($event)" />

                <m3-text-field
                  [id]="'create-product-brand'"
                  name="brand"
                  variant="filled"
                  label="Marca"
                  [value]="newProductBrand()"
                  (valueChange)="newProductBrand.set($event)" />
              </div>

              <div class="space-y-2">
                <span class="text-label-sm-emphasized text-muted uppercase tracking-wider block">Foto de Lookbook</span>
                <div class="grid grid-cols-5 gap-2">
                  @for (preset of lookbookPresets; track preset.label) {
                    <button
                      type="button"
                      [attr.aria-pressed]="newProductImageUrl() === preset.url"
                      (click)="newProductImageUrl.set(preset.url)"
                      [class.is-selected]="newProductImageUrl() === preset.url"
                      [class]="newProductImageUrl() === preset.url
                        ? 'inv-swatch-tile state-layer focus-ring-m3 p-1.5 bg-primary-box text-on-primary-box flex flex-col items-center gap-1 cursor-pointer group'
                        : 'inv-swatch-tile state-layer focus-ring-m3 p-1.5 bg-surface-low text-muted hover:bg-surface-high hover:text-main flex flex-col items-center gap-1 cursor-pointer group'">
                      <div class="w-full h-10 rounded-m3-sm overflow-hidden bg-surface-high">
                        <img [src]="preset.url" [alt]="preset.label" class="w-full h-full object-cover group-hover:scale-105 transition-transform m3-transition-emphasized" />
                      </div>
                      <span class="text-label-sm-emphasized truncate w-full text-center px-0.5">
                        {{ preset.label }}
                      </span>
                    </button>
                  }
                </div>
              </div>
            </section>

            <!-- Capsule 2: Size Curve -->
            <section aria-label="Curva de tallas" class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <h3 class="flex items-center gap-2 text-label-md-emphasized text-muted uppercase tracking-wider">
                  <span class="w-5 h-5 rounded-m3-full bg-primary-box text-on-primary-box grid place-items-center text-label-sm-emphasized">2</span>
                  <span>Curva de Tallas ({{ selectedSizes().length }})</span>
                </h3>

                <div class="flex items-center gap-1">
                  <m3-button variant="text" size="xs" (action)="selectAllSizes()">Todas</m3-button>
                  <m3-button variant="text" size="xs" (action)="selectCoreCurve()">Curva Central</m3-button>
                </div>
              </div>

              <div role="group" aria-label="Selector de tallas disponibles" class="flex flex-wrap gap-2">
                @for (size of contextualSizes(); track size) {
                  <m3-chip
                    type="filter"
                    [selected]="selectedSizes().includes(size)"
                    (action)="toggleSize(size)">
                    {{ size }}
                  </m3-chip>
                }
              </div>
            </section>

            <!-- Capsule 3: Swatches -->
            <section aria-label="Paleta textil" class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-3">
              <h3 class="flex items-center gap-2 text-label-md-emphasized text-muted uppercase tracking-wider">
                <span class="w-5 h-5 rounded-m3-full bg-primary-box text-on-primary-box grid place-items-center text-label-sm-emphasized">3</span>
                <span>Paleta Textil ({{ selectedColors().length }})</span>
              </h3>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                @for (col of standardColors; track col.code) {
                  <button
                    type="button"
                    [attr.aria-pressed]="isColorSelected(col)"
                    (click)="toggleColor(col)"
                    [class.is-selected]="isColorSelected(col)"
                    [class]="isColorSelected(col)
                      ? 'inv-swatch-tile state-layer focus-ring-m3 p-2.5 bg-primary-box text-on-primary-box text-left flex items-center gap-2.5 cursor-pointer group'
                      : 'inv-swatch-tile state-layer focus-ring-m3 p-2.5 bg-surface-low text-main text-left flex items-center gap-2.5 cursor-pointer hover:bg-surface-high group'">
                    <div
                      class="w-6 h-6 rounded-m3-full shrink-0 grid place-items-center transition-transform m3-transition-fast group-hover:scale-110"
                      [style.background-color]="col.hex"
                      [style.border]="col.border ? '1.5px solid ' + col.border : '1.5px solid color-mix(in oklch, var(--md-sys-color-outline) 30%, transparent)'"
                      aria-hidden="true">
                      @if (isColorSelected(col)) {
                        <span
                          [style.color]="isLightSwatch(col.hex) ? 'oklch(18% 0 0)' : 'oklch(98% 0 0)'"
                          class="material-symbols-rounded text-sm font-black">
                          check
                        </span>
                      }
                    </div>
                    <div class="min-w-0">
                      <div class="text-label-lg-emphasized leading-tight truncate">{{ col.name }}</div>
                      <div class="text-label-sm font-mono opacity-80">{{ col.code }}</div>
                    </div>
                  </button>
                }
              </div>
            </section>
          </div>

          <!-- Right Preview & Batch Capsule Column (Balances grid, removes inner split scrollbar) -->
          <div class="lg:col-span-5 space-y-4">

            <!-- Capsule A: Model & 2D Variants Preview -->
            <section aria-label="Vista previa del modelo y matriz" class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-3.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-label-md-emphasized text-muted uppercase tracking-wider">Vista Previa</span>
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized font-mono tabular-nums">
                  {{ selectedSizes().length }} × {{ selectedColors().length }} = {{ totalVariants() }} variantes
                </span>
              </div>

              <!-- Sub-tile: bg-surface-low inside bg-surface -->
              <div class="bg-surface-low rounded-m3-lg-inc p-3 flex items-center gap-3">
                <div class="w-14 h-14 rounded-m3-md overflow-hidden bg-surface-high shrink-0">
                  <img
                    [src]="newProductImageUrl()"
                    [alt]="newProductName() || 'Vista previa del modelo'"
                    class="w-full h-full object-cover" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-label-sm-emphasized font-mono text-on-primary bg-primary px-1.5 py-0.5 rounded-m3-xs uppercase">
                      {{ newProductSku() || 'SKU-000' }}
                    </span>
                    <span class="text-label-sm text-muted truncate">{{ newProductCategoryLabel() }}</span>
                  </div>
                  <h3 class="text-title-sm-emphasized text-main truncate mt-0.5">
                    {{ newProductName() || 'Nombre de la Prenda' }}
                  </h3>
                  <div class="text-label-lg-emphasized font-mono tabular-nums text-main mt-0.5">
                    \${{ newProductPrice().toFixed(2) }} <span class="text-label-sm text-muted font-sans font-normal">USD</span>
                  </div>
                </div>
              </div>

              <!-- 2D Variants Matrix Sub-tile -->
              <div class="bg-surface-low rounded-m3-lg-inc p-2 overflow-hidden">
                <div class="overflow-x-auto max-h-52 m3-scrollbar">
                  <table class="w-full text-left border-collapse">
                    <caption class="sr-only">Vista previa de variantes generadas</caption>
                    <thead>
                      <tr class="text-label-sm-emphasized text-muted font-mono">
                        <th scope="col" class="px-2 py-1.5">Color</th>
                        @for (sz of selectedSizes(); track sz) {
                          <th scope="col" class="px-1.5 py-1.5 text-center">{{ sz }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody class="font-mono tabular-nums">
                      @for (col of selectedColors(); track col.code) {
                        <tr>
                          <th scope="row" class="px-2 py-1 font-normal text-left">
                            <div class="flex items-center gap-1.5">
                              <div
                                class="w-2.5 h-2.5 rounded-m3-full shrink-0"
                                [style.background-color]="col.hex"
                                [style.border]="col.border ? '1px solid ' + col.border : '1px solid color-mix(in oklch, var(--md-sys-color-outline) 28%, transparent)'"
                                aria-hidden="true">
                              </div>
                              <span class="text-label-sm-emphasized text-main font-sans truncate max-w-[84px]">{{ col.name }}</span>
                            </div>
                          </th>
                          @for (sz of selectedSizes(); track sz) {
                            <td class="p-1 text-center">
                              <span class="px-2 py-0.5 rounded-m3-sm bg-surface text-main text-label-sm-emphasized block">
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
            </section>

            <!-- Capsule B: Initial Batch Reception + Live Balance (Transfer-style telemetry sub-cards) -->
            <section aria-label="Recepción del primer lote" class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-3.5">
              <h3 class="flex items-center gap-2 text-label-md-emphasized text-muted uppercase tracking-wider">
                <span class="w-5 h-5 rounded-m3-full bg-primary-box text-on-primary-box grid place-items-center text-label-sm-emphasized">4</span>
                <span>Recepción del Primer Lote</span>
              </h3>

              <div class="space-y-3">
                <div class="inv-filled-select">
                  <label for="create-target-wh" class="inv-filled-select__label">Almacén de Entrada</label>
                  <select
                    id="create-target-wh"
                    name="targetWarehouseId"
                    [value]="targetWarehouseId()"
                    (change)="targetWarehouseId.set($any($event.target).value)"
                    class="m3-select">
                    @for (wh of warehouses(); track wh.id) {
                      <option [value]="wh.id" [selected]="wh.id === targetWarehouseId()">{{ wh.name }}</option>
                    }
                  </select>
                </div>

                <div class="flex items-start gap-2">
                  <div class="pt-1.5 shrink-0">
                    <m3-button
                      variant="tonal"
                      size="md"
                      ariaLabel="Restar 5 unidades iniciales por variante"
                      (action)="adjustInitialStock(-5)">
                      -5
                    </m3-button>
                  </div>
                  <div class="flex-1 min-w-0">
                    <m3-text-field
                      [id]="'create-initial-stock'"
                      name="initialStockPerCell"
                      variant="filled"
                      label="Stock / variante"
                      type="number"
                      inputMode="numeric"
                      suffix="uds"
                      [value]="initialStockPerCell().toString()"
                      (valueChange)="onInitialStockInput($event)" />
                  </div>
                  <div class="pt-1.5 shrink-0">
                    <m3-button
                      variant="tonal"
                      size="md"
                      ariaLabel="Sumar 5 unidades iniciales por variante"
                      (action)="adjustInitialStock(5)">
                      +5
                    </m3-button>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div class="bg-surface-low rounded-m3-lg-inc p-3">
                  <div class="text-label-sm text-muted">Unidades</div>
                  <div class="text-title-lg-emphasized text-main font-mono tabular-nums mt-0.5">
                    {{ previewBatchUnits() }} <span class="text-body-sm font-sans text-muted font-normal">uds</span>
                  </div>
                </div>
                <div class="bg-surface-low rounded-m3-lg-inc p-3">
                  <div class="text-label-sm text-muted">Valorización</div>
                  <div class="text-title-lg-emphasized text-primary font-mono tabular-nums mt-0.5">
                    \${{ previewBatchValuation().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </div>
                </div>
              </div>
            </section>
            </div>
          </div>
        </div>

        <!-- Organic Dialog Footer on bg-surface-box (no divider border) -->
        <footer class="px-5 sm:px-6 pt-2 pb-5 sm:pb-6 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div class="text-body-sm text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-primary text-base" aria-hidden="true">check_circle</span>
            <span>Ingreso de <strong class="font-mono tabular-nums text-main">{{ previewBatchUnits() }} uds</strong> en <strong class="text-main">{{ getWarehouseName(targetWarehouseId()) }}</strong></span>
          </div>

          <div class="flex items-center gap-3">
            <m3-button
              variant="text"
              size="md"
              (action)="close.emit()">
              Cancelar
            </m3-button>
            <m3-button
              type="submit"
              variant="filled"
              size="md"
              icon="rocket_launch"
              [morph]="true"
              [disabled]="!canSubmit()">
              Generar y Abrir en Matriz
            </m3-button>
          </div>
        </footer>
      </form>
    </div>
  `
})
export class InventoryCreateModalComponent {
  readonly stageOverlay = inject(StageOverlayService);

  readonly warehouses = input.required<Warehouse[]>();
  readonly existingProducts = input.required<MasterProduct[]>();
  readonly isDialogTransitionActive = input<boolean>(false);

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

  isLightSwatch(hex: string): boolean {
    return hex === '#FFFFFF' || hex === '#F8FAFC';
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
