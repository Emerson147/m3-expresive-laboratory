import { Injectable, computed, signal, inject, ApplicationRef } from '@angular/core';
import {
  CreateMasterProductDto,
  InventoryKpiSummary,
  MasterProduct,
  MatrixCellView,
  MatrixColumnSummary,
  MatrixRowView,
  StockCell,
  StockStatus,
  StockTransfer,
  Warehouse
} from './inventory.models';

const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'WH-CENTRAL',
    code: 'LUR-01',
    name: 'Almacén Central Lurín',
    type: 'central',
    location: 'Lima Sur • Hub Logístico Industrial'
  },
  {
    id: 'WH-MIRAFLORES',
    code: 'MFL-01',
    name: 'Flagship Store Miraflores',
    type: 'store',
    location: 'Av. Larco 742, Miraflores'
  },
  {
    id: 'WH-SANISIDRO',
    code: 'SIS-01',
    name: 'Boutique San Isidro',
    type: 'store',
    location: 'Av. Conquistadores 620, San Isidro'
  },
  {
    id: 'WH-JOCKEY',
    code: 'JKY-01',
    name: 'Concept Store Jockey Plaza',
    type: 'store',
    location: 'C.C. Jockey Plaza Nivel 2, Surco'
  }
];

function generateStockCells(
  baseSku: string,
  sizes: string[],
  colors: { code: string }[],
  warehouses: Warehouse[]
): StockCell[] {
  const cells: StockCell[] = [];

  warehouses.forEach(wh => {
    colors.forEach(col => {
      sizes.forEach(sz => {
        const variantSku = `${baseSku}-${col.code}-${sz}`;
        // Realistic distribution based on warehouse type and size popularity
        let baseUnits = wh.type === 'central' ? 35 : 12;
        if (sz === 'M' || sz === 'L' || sz === '32' || sz === '40R') {
          baseUnits += wh.type === 'central' ? 20 : 6;
        } else if (sz === 'XS' || sz === 'XXL' || sz === '28' || sz === '38') {
          baseUnits = Math.max(0, baseUnits - 10);
        }

        // Add some purposeful stock variances (low stock, out of stock for realistic UI testing)
        let stock = baseUnits;
        if (col.code === 'BUR' && (sz === 'S' || sz === 'XL')) stock = 2; // low stock
        if (col.code === 'NVY' && sz === 'XXL' && wh.id === 'WH-SANISIDRO') stock = 0; // out of stock
        if (col.code === 'WHT' && sz === 'M' && wh.id === 'WH-MIRAFLORES') stock = 18;
        if (col.code === 'RAW' && sz === 'XL') stock = 0; // out of stock
        if (col.code === 'TER' && (sz === 'XXL' || sz === 'S')) stock = 3; // low stock

        const reserved = stock > 5 ? Math.floor(stock * 0.15) : 0;
        const minThreshold = wh.type === 'central' ? 15 : 5;

        cells.push({
          variantSku,
          size: sz,
          colorCode: col.code,
          stock,
          minThreshold,
          reserved,
          warehouseId: wh.id
        });
      });
    });
  });

  return cells;
}

const INITIAL_PRODUCTS: MasterProduct[] = [
  {
    id: 1,
    sku: 'OXF-802',
    name: 'Camisa Oxford Pima 80/2 Slim Fit',
    category: 'shirts',
    categoryLabel: 'Camisería Fina',
    brand: 'Sartorial Lima',
    season: 'Primavera / Verano 2026',
    basePrice: 69.0,
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85',
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    availableColors: [
      { code: 'NVY', name: 'Azul Marino', hex: '#1B2A4A' },
      { code: 'WHT', name: 'Blanco Óptico', hex: '#FFFFFF', border: '#CBD5E1' },
      { code: 'SKY', name: 'Celeste Clásico', hex: '#93C5FD' },
      { code: 'OLV', name: 'Verde Salvia', hex: '#4A5D4E' },
      { code: 'BUR', name: 'Borgoña Profundo', hex: '#5B1D28' }
    ],
    cells: []
  },
  {
    id: 2,
    sku: 'POL-100',
    name: 'Polo Piqué Peruano 100% Pima Heavy',
    category: 'polos',
    categoryLabel: 'Esenciales Urbanos',
    brand: 'Pima Craft',
    season: 'Esenciales Continuos',
    basePrice: 42.0,
    imageUrl:
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=85',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    availableColors: [
      { code: 'BLK', name: 'Negro Azabache', hex: '#18181B' },
      { code: 'WHT', name: 'Blanco Pima', hex: '#F8FAFC', border: '#CBD5E1' },
      { code: 'NAV', name: 'Azul Noche', hex: '#1E293B' },
      { code: 'TER', name: 'Terracota Sol', hex: '#9A3412' },
      { code: 'SND', name: 'Arena Cálido', hex: '#D6D3D1' }
    ],
    cells: []
  },
  {
    id: 3,
    sku: 'CHN-404',
    name: 'Pantalón Chino Comfort Stretch 4-Way',
    category: 'pants',
    categoryLabel: 'Sastrería Casual',
    brand: 'Atelier Urbano',
    season: 'Todo el Año',
    basePrice: 79.0,
    imageUrl:
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=85',
    availableSizes: ['28', '30', '32', '34', '36', '38'],
    availableColors: [
      { code: 'KHK', name: 'Caqui Clásico', hex: '#B5A68E' },
      { code: 'NVY', name: 'Azul Marino', hex: '#172554' },
      { code: 'OLV', name: 'Verde Militar', hex: '#3F4F3D' },
      { code: 'GRY', name: 'Gris Marengo', hex: '#475569' }
    ],
    cells: []
  },
  {
    id: 4,
    sku: 'DNM-007',
    name: 'Casaca Denim Raw Selvedge Japonesa',
    category: 'jackets',
    categoryLabel: 'Outerwear Premium',
    brand: 'Kuroki Heritage',
    season: 'Otoño / Invierno 2026',
    basePrice: 149.0,
    imageUrl:
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=85',
    availableSizes: ['S', 'M', 'L', 'XL'],
    availableColors: [
      { code: 'RAW', name: 'Índigo Profundo Raw', hex: '#1E1B4B' },
      { code: 'BLK', name: 'Denim Negro Lavado', hex: '#27272A' },
      { code: 'MED', name: 'Lavado Vintage Medio', hex: '#0284C7' }
    ],
    cells: []
  },
  {
    id: 5,
    sku: 'BLZ-550',
    name: 'Blazer Lino Desestructurado Sartorial',
    category: 'jackets',
    categoryLabel: 'Alta Confección',
    brand: 'Sartorial Lima',
    season: 'Primavera / Verano 2026',
    basePrice: 189.0,
    imageUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85',
    availableSizes: ['38R', '40R', '42R', '44R'],
    availableColors: [
      { code: 'NAT', name: 'Lino Crudo', hex: '#E7E5E4', border: '#CBD5E1' },
      { code: 'NAV', name: 'Azul Tinta', hex: '#0F172A' },
      { code: 'TAB', name: 'Tabaco Tostado', hex: '#78350F' }
    ],
    cells: []
  }
];

// Populate cells
INITIAL_PRODUCTS.forEach(prod => {
  prod.cells = generateStockCells(prod.sku, prod.availableSizes, prod.availableColors, INITIAL_WAREHOUSES);
});

const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'TRF-1092',
    date: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    productId: 1,
    productName: 'Camisa Oxford Pima 80/2',
    variantSku: 'OXF-802-NVY-M',
    size: 'M',
    colorName: 'Azul Marino',
    fromWarehouseId: 'WH-CENTRAL',
    toWarehouseId: 'WH-MIRAFLORES',
    quantity: 15,
    operator: 'Carlos M.'
  },
  {
    id: 'TRF-1091',
    date: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    productId: 2,
    productName: 'Polo Piqué Peruano Pima',
    variantSku: 'POL-100-BLK-L',
    size: 'L',
    colorName: 'Negro Azabache',
    fromWarehouseId: 'WH-CENTRAL',
    toWarehouseId: 'WH-SANISIDRO',
    quantity: 10,
    operator: 'Andrea V.'
  },
  {
    id: 'TRF-1090',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
    productId: 3,
    productName: 'Pantalón Chino Comfort',
    variantSku: 'CHN-404-KHK-32',
    size: '32',
    colorName: 'Caqui Clásico',
    fromWarehouseId: 'WH-CENTRAL',
    toWarehouseId: 'WH-JOCKEY',
    quantity: 20,
    operator: 'Roberto S.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  readonly warehouses = signal<Warehouse[]>(INITIAL_WAREHOUSES);
  readonly selectedWarehouseId = signal<string>('ALL');
  readonly masterProducts = signal<MasterProduct[]>(INITIAL_PRODUCTS);
  readonly selectedProductId = signal<number>(1);
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('ALL');
  readonly stockTransfers = signal<StockTransfer[]>(INITIAL_TRANSFERS);

  // Modal & Notification signals
  readonly isTransferModalOpen = signal<boolean>(false);
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly activeTransferVariant = signal<{
    variantSku: string;
    productName: string;
    size: string;
    colorName: string;
    productId: number;
    availableInCentral: number;
  } | null>(null);

  readonly isAuditHistoryOpen = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // View Transition Shared Element state
  private readonly appRef = inject(ApplicationRef);
  readonly transitioningProductId = signal<number | null>(null);
  readonly transitionPhase = signal<'before' | 'after' | null>(null);

  // Selected Master Product
  readonly selectedProduct = computed<MasterProduct>(() => {
    const prods = this.masterProducts();
    const id = this.selectedProductId();
    return prods.find(p => p.id === id) ?? prods[0];
  });

  // Filtered master products
  readonly filteredProducts = computed<MasterProduct[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    return this.masterProducts().filter(prod => {
      const matchCat = category === 'ALL' || prod.category === category;
      const matchQuery =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.sku.toLowerCase().includes(query) ||
        prod.brand.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  });

  // Current active warehouse label/object
  readonly activeWarehouse = computed<Warehouse | { id: string; name: string; type: string; location: string }>(() => {
    const whId = this.selectedWarehouseId();
    if (whId === 'ALL') {
      return {
        id: 'ALL',
        name: 'Consolidado Global (Omnicanal)',
        type: 'omnichannel',
        location: 'Todas las ubicaciones • 4 Hubs'
      };
    }
    return this.warehouses().find(w => w.id === whId) ?? this.warehouses()[0];
  });

  // 2D Matrix Rows (Colors x Sizes) for currently selected product & warehouse
  readonly matrixRows = computed<MatrixRowView[]>(() => {
    const product = this.selectedProduct();
    const whId = this.selectedWarehouseId();
    const rows: MatrixRowView[] = [];

    product.availableColors.forEach(color => {
      const rowCells: MatrixCellView[] = [];
      let rowTotalStock = 0;
      let rowTotalReserved = 0;

      product.availableSizes.forEach(size => {
        const variantSku = `${product.sku}-${color.code}-${size}`;
        let stock = 0;
        let reserved = 0;
        let minThreshold = 5;

        if (whId === 'ALL') {
          // Aggregate across all warehouses
          const matchingCells = product.cells.filter(
            c => c.size === size && c.colorCode === color.code
          );
          matchingCells.forEach(c => {
            stock += c.stock;
            reserved += c.reserved;
            minThreshold = Math.max(minThreshold, c.minThreshold);
          });
          minThreshold = minThreshold * 2; // threshold for global
        } else {
          // Specific warehouse
          const cell = product.cells.find(
            c => c.warehouseId === whId && c.size === size && c.colorCode === color.code
          );
          if (cell) {
            stock = cell.stock;
            reserved = cell.reserved;
            minThreshold = cell.minThreshold;
          }
        }

        let status: StockStatus = 'healthy';
        if (stock === 0) {
          status = 'out_of_stock';
        } else if (stock < minThreshold) {
          status = 'low';
        }

        rowTotalStock += stock;
        rowTotalReserved += reserved;

        rowCells.push({
          variantSku,
          size,
          colorCode: color.code,
          stock,
          reserved,
          minThreshold,
          status,
          warehouseId: whId
        });
      });

      rows.push({
        color,
        cells: rowCells,
        totalStock: rowTotalStock,
        totalReserved: rowTotalReserved
      });
    });

    return rows;
  });

  // 2D Matrix Column Summaries (Sizes)
  readonly matrixColumns = computed<MatrixColumnSummary[]>(() => {
    const product = this.selectedProduct();
    const rows = this.matrixRows();

    return product.availableSizes.map((size, index) => {
      let colStock = 0;
      let colReserved = 0;

      rows.forEach(row => {
        const cell = row.cells[index];
        if (cell) {
          colStock += cell.stock;
          colReserved += cell.reserved;
        }
      });

      return {
        size,
        totalStock: colStock,
        totalReserved: colReserved
      };
    });
  });

  // KPI Summary across entire catalog or active warehouse
  readonly kpiSummary = computed<InventoryKpiSummary>(() => {
    const products = this.masterProducts();
    const whId = this.selectedWarehouseId();

    let totalSkus = 0;
    let totalUnits = 0;
    let totalCatalogValue = 0;
    let lowStockSkus = 0;
    let outOfStockSkus = 0;

    products.forEach(prod => {
      prod.availableColors.forEach(col => {
        prod.availableSizes.forEach(sz => {
          totalSkus++;
          let skuStock = 0;
          let threshold = 5;

          if (whId === 'ALL') {
            const cells = prod.cells.filter(c => c.size === sz && c.colorCode === col.code);
            cells.forEach(c => {
              skuStock += c.stock;
            });
            threshold = 15;
          } else {
            const cell = prod.cells.find(
              c => c.warehouseId === whId && c.size === sz && c.colorCode === col.code
            );
            if (cell) {
              skuStock = cell.stock;
              threshold = cell.minThreshold;
            }
          }

          totalUnits += skuStock;
          totalCatalogValue += skuStock * prod.basePrice;

          if (skuStock === 0) {
            outOfStockSkus++;
          } else if (skuStock < threshold) {
            lowStockSkus++;
          }
        });
      });
    });

    const healthySkus = totalSkus - (lowStockSkus + outOfStockSkus);
    const healthRate = totalSkus > 0 ? Math.round((healthySkus / totalSkus) * 100) : 100;

    return {
      totalSkus,
      totalUnits,
      totalCatalogValue,
      lowStockSkus,
      outOfStockSkus,
      healthRate
    };
  });

  // Action methods
  setWarehouse(id: string): void {
    if (this.selectedWarehouseId() === id) return;
    this.runViewTransition(() => {
      this.selectedWarehouseId.set(id);
    });
  }

  selectProduct(id: number): void {
    if (this.selectedProductId() === id) return;

    this.transitioningProductId.set(id);
    this.transitionPhase.set('before');
    this.appRef.tick();

    this.runViewTransition(
      () => {
        this.selectedProductId.set(id);
        this.transitionPhase.set('after');
      },
      () => {
        this.transitioningProductId.set(null);
        this.transitionPhase.set(null);
      }
    );
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  setCategory(c: string): void {
    if (this.selectedCategory() === c) return;
    this.runViewTransition(() => {
      this.selectedCategory.set(c);
    });
  }

  private runViewTransition(update: () => void, cleanup?: () => void): void {
    const doc = typeof document !== 'undefined' ? (document as any) : null;
    if (doc && typeof doc.startViewTransition === 'function') {
      const transition = doc.startViewTransition(() => {
        update();
        this.appRef.tick();
      });
      transition.finished.finally(() => {
        cleanup?.();
        this.appRef.tick();
      });
    } else {
      update();
      cleanup?.();
    }
  }

  toggleAuditHistory(): void {
    this.isAuditHistoryOpen.update(v => !v);
  }

  /**
   * Inline stock adjustment on a matrix cell (+1 or -1)
   */
  adjustStock(variantSku: string, delta: number): void {
    const whId = this.selectedWarehouseId();
    const targetWarehouse = whId === 'ALL' ? 'WH-CENTRAL' : whId;

    this.masterProducts.update(products => {
      return products.map(prod => {
        const hasCell = prod.cells.some(c => c.variantSku === variantSku && c.warehouseId === targetWarehouse);
        if (!hasCell) return prod;

        return {
          ...prod,
          cells: prod.cells.map(c => {
            if (c.variantSku === variantSku && c.warehouseId === targetWarehouse) {
              const updatedStock = Math.max(0, c.stock + delta);
              return { ...c, stock: updatedStock };
            }
            return c;
          })
        };
      });
    });

    const actionText = delta > 0 ? `+${delta}` : `${delta}`;
    const whName = this.warehouses().find(w => w.id === targetWarehouse)?.name ?? targetWarehouse;
    this.showToast(`Stock actualizado (${actionText} uds) en ${whName}`);
  }

  /**
   * Open the Stock Transfer Modal pre-filled with the selected variant
   */
  openTransferModal(variantSku: string, size: string, colorName: string): void {
    const prod = this.selectedProduct();
    // Check central warehouse available stock for this variant
    const centralCell = prod.cells.find(
      c => c.variantSku === variantSku && c.warehouseId === 'WH-CENTRAL'
    );
    const availableInCentral = centralCell ? centralCell.stock : 0;

    this.activeTransferVariant.set({
      variantSku,
      productName: prod.name,
      size,
      colorName,
      productId: prod.id,
      availableInCentral
    });
    this.isTransferModalOpen.set(true);
  }

  closeTransferModal(): void {
    this.isTransferModalOpen.set(false);
    this.activeTransferVariant.set(null);
  }

  /**
   * Execute an inter-warehouse stock transfer with immutable balance verification
   */
  executeTransfer(
    fromWhId: string,
    toWhId: string,
    variantSku: string,
    quantity: number,
    operator: string
  ): boolean {
    if (fromWhId === toWhId) {
      this.showToast('El almacén origen y destino no pueden ser el mismo');
      return false;
    }
    if (quantity <= 0) {
      this.showToast('La cantidad debe ser mayor a 0');
      return false;
    }

    const prod = this.selectedProduct();
    const sourceCell = prod.cells.find(c => c.variantSku === variantSku && c.warehouseId === fromWhId);

    if (!sourceCell || sourceCell.stock < quantity) {
      this.showToast(`Stock insuficiente en origen (${sourceCell?.stock ?? 0} disponibles)`);
      return false;
    }

    // Apply stock delta across products
    this.masterProducts.update(products => {
      return products.map(p => {
        if (p.id !== prod.id) return p;

        return {
          ...p,
          cells: p.cells.map(c => {
            if (c.variantSku === variantSku && c.warehouseId === fromWhId) {
              return { ...c, stock: c.stock - quantity };
            }
            if (c.variantSku === variantSku && c.warehouseId === toWhId) {
              return { ...c, stock: c.stock + quantity };
            }
            return c;
          })
        };
      });
    });

    const activeVariant = this.activeTransferVariant();
    const fromName = this.warehouses().find(w => w.id === fromWhId)?.name ?? fromWhId;
    const toName = this.warehouses().find(w => w.id === toWhId)?.name ?? toWhId;

    const newTransfer: StockTransfer = {
      id: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date(),
      productId: prod.id,
      productName: prod.name,
      variantSku,
      size: activeVariant?.size ?? '',
      colorName: activeVariant?.colorName ?? '',
      fromWarehouseId: fromWhId,
      toWarehouseId: toWhId,
      quantity,
      operator: operator || 'Operador Central'
    };

    this.stockTransfers.update(list => [newTransfer, ...list]);
    this.closeTransferModal();
    this.showToast(`Transferidas ${quantity} uds: ${fromName} → ${toName}`);
    return true;
  }

  /**
   * Fast batch replenishment for all low-stock variants of the current master product in Central
   */
  batchReplenishLowStock(): void {
    const prod = this.selectedProduct();
    let replenishedCount = 0;

    this.masterProducts.update(products => {
      return products.map(p => {
        if (p.id !== prod.id) return p;

        return {
          ...p,
          cells: p.cells.map(c => {
            if (c.warehouseId === 'WH-CENTRAL' && c.stock < 15) {
              replenishedCount += 25;
              return { ...c, stock: c.stock + 25 };
            }
            return c;
          })
        };
      });
    });

    this.showToast(`Lote completado: +${replenishedCount} unidades ingresadas a Almacén Central`);
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  /**
   * Generates a new master garment and its full 2D matrix of variants across warehouses
   */
  createMasterProduct(dto: CreateMasterProductDto): boolean {
    if (!dto.name.trim() || !dto.sku.trim()) {
      this.showToast('El nombre y el SKU son obligatorios');
      return false;
    }
    if (dto.sizes.length === 0 || dto.colors.length === 0) {
      this.showToast('Debes seleccionar al menos una talla y un color');
      return false;
    }

    const newId = Math.max(...this.masterProducts().map(p => p.id), 0) + 1;
    const baseSku = dto.sku.trim().toUpperCase();

    // Generate cells for all warehouses using Cartesian product (sizes x colors x warehouses)
    const cells: StockCell[] = [];
    const warehouses = this.warehouses();

    warehouses.forEach(wh => {
      dto.colors.forEach(col => {
        dto.sizes.forEach(sz => {
          const variantSku = `${baseSku}-${col.code}-${sz}`;
          const isTargetWarehouse = wh.id === dto.targetWarehouseId;
          const initialStock = isTargetWarehouse ? Math.max(0, dto.initialStockPerCell) : 0;
          const minThreshold = wh.type === 'central' ? 15 : 5;

          cells.push({
            variantSku,
            size: sz,
            colorCode: col.code,
            stock: initialStock,
            minThreshold,
            reserved: 0,
            warehouseId: wh.id
          });
        });
      });
    });

    const newProduct: MasterProduct = {
      id: newId,
      sku: baseSku,
      name: dto.name.trim(),
      category: dto.category || 'shirts',
      categoryLabel: dto.categoryLabel || 'Moda Textil',
      brand: dto.brand || 'Colección Atelier',
      season: dto.season || 'Temporada 2026',
      basePrice: Number(dto.basePrice) || 49.0,
      imageUrl:
        dto.imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85',
      availableSizes: dto.sizes,
      availableColors: dto.colors,
      cells
    };

    this.masterProducts.update(prods => [newProduct, ...prods]);
    this.selectedProductId.set(newId);
    this.closeCreateModal();

    const totalVariants = dto.sizes.length * dto.colors.length;
    this.showToast(`Prenda agregada: ${newProduct.name} (${totalVariants} variantes en matriz)`);
    return true;
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      if (this.toastMessage() === message) {
        this.toastMessage.set(null);
      }
    }, 4000);
  }
}
