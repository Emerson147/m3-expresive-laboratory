import { TestBed } from '@angular/core/testing';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryService);
  });

  it('should be created and initialized with master products and warehouses', () => {
    expect(service).toBeTruthy();
    expect(service.warehouses().length).toBe(4);
    expect(service.masterProducts().length).toBe(5);
    expect(service.selectedWarehouseId()).toBe('ALL');
  });

  it('should compute matrixRows matching the selected product colors and sizes', () => {
    const prod = service.selectedProduct();
    const rows = service.matrixRows();

    expect(rows.length).toBe(prod.availableColors.length);
    expect(rows[0].cells.length).toBe(prod.availableSizes.length);
  });

  it('should adjust stock inline on a variant cell', () => {
    service.setWarehouse('WH-CENTRAL');
    const firstRow = service.matrixRows()[0];
    const targetCell = firstRow.cells[0];
    const initialStock = targetCell.stock;

    service.adjustStock(targetCell.variantSku, 5);

    const updatedRow = service.matrixRows()[0];
    const updatedCell = updatedRow.cells[0];
    expect(updatedCell.stock).toBe(initialStock + 5);

    // Prevent negative stock
    service.adjustStock(targetCell.variantSku, -9999);
    const zeroCell = service.matrixRows()[0].cells[0];
    expect(zeroCell.stock).toBe(0);
  });

  it('should execute inter-warehouse stock transfers cleanly', () => {
    const activeProd = service.selectedProduct();
    const variantSku = activeProd.cells[0].variantSku;

    // Check central cell
    const centralCell = activeProd.cells.find(
      c => c.variantSku === variantSku && c.warehouseId === 'WH-CENTRAL'
    );
    expect(centralCell).toBeDefined();
    const initialCentralStock = centralCell!.stock;

    const mirafloresCell = activeProd.cells.find(
      c => c.variantSku === variantSku && c.warehouseId === 'WH-MIRAFLORES'
    );
    const initialMflStock = mirafloresCell!.stock;

    const success = service.executeTransfer(
      'WH-CENTRAL',
      'WH-MIRAFLORES',
      variantSku,
      5,
      'Test Operator'
    );

    expect(success).toBe(true);

    const updatedProd = service.selectedProduct();
    const updatedCentral = updatedProd.cells.find(
      c => c.variantSku === variantSku && c.warehouseId === 'WH-CENTRAL'
    );
    const updatedMfl = updatedProd.cells.find(
      c => c.variantSku === variantSku && c.warehouseId === 'WH-MIRAFLORES'
    );

    expect(updatedCentral!.stock).toBe(initialCentralStock - 5);
    expect(updatedMfl!.stock).toBe(initialMflStock + 5);
    expect(service.stockTransfers()[0].operator).toBe('Test Operator');
  });

  it('should reject invalid transfers (same origin & destination)', () => {
    const success = service.executeTransfer(
      'WH-CENTRAL',
      'WH-CENTRAL',
      'OXF-802-NVY-M',
      5,
      'Op'
    );
    expect(success).toBe(false);
  });

  it('should calculate accurate KPIs', () => {
    const kpis = service.kpiSummary();
    expect(kpis.totalSkus).toBeGreaterThan(0);
    expect(kpis.totalUnits).toBeGreaterThan(0);
    expect(kpis.totalCatalogValue).toBeGreaterThan(0);
    expect(kpis.healthRate).toBeGreaterThanOrEqual(0);
    expect(kpis.healthRate).toBeLessThanOrEqual(100);
  });

  it('should create a new master product and generate its full Cartesian matrix across warehouses', () => {
    const initialProductCount = service.masterProducts().length;
    const sizes = ['S', 'M', 'L'];
    const colors = [
      { code: 'BLK', name: 'Negro', hex: '#000000' },
      { code: 'WHT', name: 'Blanco', hex: '#FFFFFF' }
    ];

    const success = service.createMasterProduct({
      name: 'Buzo Hoodie Pima',
      sku: 'HOD-900',
      category: 'jackets',
      categoryLabel: 'Outerwear Premium',
      brand: 'Atelier Urbano',
      season: 'Invierno 2026',
      basePrice: 59.0,
      sizes,
      colors,
      initialStockPerCell: 12,
      targetWarehouseId: 'WH-CENTRAL'
    });

    expect(success).toBe(true);
    expect(service.masterProducts().length).toBe(initialProductCount + 1);

    const created = service.selectedProduct();
    expect(created.name).toBe('Buzo Hoodie Pima');
    expect(created.sku).toBe('HOD-900');

    // Expected total cells = sizes (3) * colors (2) * warehouses (4) = 24 cells
    expect(created.cells.length).toBe(3 * 2 * service.warehouses().length);

    // Verify target warehouse stock
    const centralCells = created.cells.filter(c => c.warehouseId === 'WH-CENTRAL');
    expect(centralCells.every(c => c.stock === 12)).toBe(true);

    // Verify other warehouses have 0 stock initially
    const otherCells = created.cells.filter(c => c.warehouseId !== 'WH-CENTRAL');
    expect(otherCells.every(c => c.stock === 0)).toBe(true);
  });

  it('should reject creating a product without valid SKU or attributes', () => {
    const success = service.createMasterProduct({
      name: '',
      sku: '',
      category: 'shirts',
      categoryLabel: 'Camisería',
      brand: 'Brand',
      season: '2026',
      basePrice: 50,
      sizes: [],
      colors: [],
      initialStockPerCell: 10,
      targetWarehouseId: 'WH-CENTRAL'
    });
    expect(success).toBe(false);
  });
});
