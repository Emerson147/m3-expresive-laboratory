import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { InventoryService } from '../../core/inventory/inventory.service';
import { InventoryComponent } from './inventory.component';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let service: InventoryService;
  let stageOverlay: StageOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(InventoryService);
    stageOverlay = TestBed.inject(StageOverlayService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the multidimensional inventory title and warehouse switcher', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Matriz Multidimensional de Stock');
    expect(compiled.textContent).toContain('Consolidado');
  });

  it('should render semantic 2D matrix table and dynamic legend thresholds', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sizes = service.selectedProduct().availableSizes;
    sizes.forEach(size => {
      expect(compiled.textContent).toContain(size);
    });
    expect(compiled.querySelector('caption')).toBeTruthy();
    expect(compiled.querySelectorAll('th[scope="col"]').length).toBeGreaterThan(0);
    expect(compiled.querySelectorAll('th[scope="row"]').length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain('Saludable (≥30)');

    service.setWarehouse('WH-MIRAFLORES');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Saludable (≥5)');
  });

  it('should show empty catalog state and clear filters when triggered', () => {
    service.setSearchQuery('NO-EXISTE-SKU-XYZ');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No hay prendas con ese filtro');

    const clearBtn = Array.from(compiled.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Limpiar filtros')
    );
    expect(clearBtn).toBeTruthy();
    clearBtn?.click();
    fixture.detectChanges();

    expect(service.searchQuery()).toBe('');
    expect(service.filteredProducts().length).toBeGreaterThan(0);
  });

  it('should open accessible transfer modal defaulting origin warehouse and adding increments', () => {
    service.setWarehouse('WH-MIRAFLORES');
    fixture.detectChanges();

    service.openTransferModal('OXF-802-NVY-M', 'M', 'Azul Marino');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Transferencia Inter-Almacén');
    expect(compiled.querySelector('[role="dialog"][aria-modal="true"]')).toBeTruthy();
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    const fromSelect = compiled.querySelector('#transfer-from-wh') as HTMLSelectElement | null;
    expect(fromSelect?.value).toBe('WH-MIRAFLORES');

    // Switch back to WH-CENTRAL which has stock >= 10 and verify +5 adds instead of overwriting
    service.closeTransferModal();
    service.setWarehouse('WH-CENTRAL');
    service.openTransferModal('OXF-802-NVY-M', 'M', 'Azul Marino');
    fixture.detectChanges();

    const qtyInput = compiled.querySelector('#transfer-qty-input') as HTMLInputElement;
    const initialQty = Number(qtyInput.value);
    const plusFiveBtn = Array.from(compiled.querySelectorAll('button')).find(btn =>
      btn.textContent?.trim() === '+5 uds'
    );
    plusFiveBtn?.click();
    fixture.detectChanges();

    expect(Number(qtyInput.value)).toBeGreaterThan(initialQty);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(service.isTransferModalOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
  });

  it('should open the new garment creation modal, sync overlay, and warn on duplicate SKU', () => {
    component.openCreateModal();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Product Studio • Alta de Modelo');
    expect(compiled.textContent).toContain('Generador 2D');
    expect(compiled.querySelector('[role="dialog"][aria-modal="true"]')).toBeTruthy();
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    const skuInput = compiled.querySelector('#create-product-sku') as HTMLInputElement;
    skuInput.value = service.masterProducts()[0].sku;
    skuInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Ya existe una prenda con el SKU');
    const submitBtn = Array.from(compiled.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Generar y Abrir en Matriz')
    ) as HTMLButtonElement | undefined;
    expect(submitBtn?.disabled).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(service.isCreateModalOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
    expect(component.createTriggerOrigin()).toBeNull();
  });

  it('supports < lg split-pane tablist keyboard navigation and compact auto-switch', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tablist = compiled.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();

    const catalogTab = compiled.querySelector('#inv-tab-catalog') as HTMLButtonElement;
    const matrixTab = compiled.querySelector('#inv-tab-matrix') as HTMLButtonElement;
    const catalogPanel = compiled.querySelector('#inv-panel-catalog') as HTMLElement;
    const matrixPanel = compiled.querySelector('#inv-panel-matrix') as HTMLElement;

    expect(catalogTab.getAttribute('aria-selected')).toBe('true');
    expect(matrixTab.getAttribute('aria-selected')).toBe('false');
    expect(catalogPanel.classList.contains('hidden')).toBe(false);
    expect(matrixPanel.classList.contains('hidden')).toBe(true);

    catalogTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(component.mobilePane()).toBe('matrix');
    expect(matrixTab.getAttribute('aria-selected')).toBe('true');
    expect(matrixTab.getAttribute('tabindex')).toBe('0');
    expect(catalogPanel.classList.contains('hidden')).toBe(true);
    expect(matrixPanel.classList.contains('hidden')).toBe(false);

    matrixTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(component.mobilePane()).toBe('catalog');

    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 1023px)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      }))
    });

    try {
      const targetProduct = service.masterProducts()[1];
      component.selectProductAndSwitchPane(targetProduct.id);
      fixture.detectChanges();
      expect(service.selectedProductId()).toBe(targetProduct.id);
      expect(component.mobilePane()).toBe('matrix');
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: originalMatchMedia
      });
    }
  });

  it('dims healthy matrix cells without hiding critical ones when "Solo alertas" switch is enabled', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Ensure at least one healthy and one non-healthy cell exist on selected product
    const firstRowFirstCell = service.matrixRows()[0].cells[0];
    if (firstRowFirstCell.status === 'healthy') {
      service.adjustStock(firstRowFirstCell.variantSku, -firstRowFirstCell.stock);
      fixture.detectChanges();
    }

    const alertsSwitch = compiled.querySelector('app-inventory-matrix m3-switch button[role="switch"]') as HTMLButtonElement;
    expect(alertsSwitch).toBeTruthy();
    expect(alertsSwitch.getAttribute('aria-checked')).toBe('false');

    alertsSwitch.click();
    fixture.detectChanges();

    expect(alertsSwitch.getAttribute('aria-checked')).toBe('true');
    const healthyCells = Array.from(compiled.querySelectorAll('.m3-matrix-cell-healthy'));
    const alertCells = Array.from(compiled.querySelectorAll('.m3-matrix-cell-low, .m3-matrix-cell-out'));
    expect(healthyCells.length).toBeGreaterThan(0);
    expect(alertCells.length).toBeGreaterThan(0);
    healthyCells.forEach(cell => expect(cell.classList.contains('opacity-40')).toBe(true));
    alertCells.forEach(cell => expect(cell.classList.contains('opacity-40')).toBe(false));
  });

  it('coordinates dialog-transform origins for create and transfer buttons and cleans up on close', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headerCreateBtn = compiled.querySelector('app-inventory-header m3-button[variant="filled"] button') as HTMLButtonElement;
    expect(headerCreateBtn).toBeTruthy();

    headerCreateBtn.click();
    fixture.detectChanges();

    expect(service.isCreateModalOpen()).toBe(true);
    expect(component.createTriggerOrigin()).toBe('header');
    expect(compiled.querySelector('[role="dialog"][aria-labelledby="inventory-create-title"]')).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(service.isCreateModalOpen()).toBe(false);
    expect(component.createTriggerOrigin()).toBeNull();
    expect(component.createMorphOwner()).toBeNull();

    const firstTransferBtn = compiled.querySelector('app-inventory-matrix m3-button[icon="sync_alt"] button') as HTMLButtonElement;
    expect(firstTransferBtn).toBeTruthy();

    firstTransferBtn.click();
    fixture.detectChanges();

    expect(service.isTransferModalOpen()).toBe(true);
    expect(component.transferOriginSku()).toBeTruthy();
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(service.isTransferModalOpen()).toBe(false);
    expect(component.transferOriginSku()).toBeNull();
    expect(component.transferMorphOwner()).toBeNull();
  });

  it('renders semantic h2 audit drawer container-query table and M3 selects/numeric fields in create modal', () => {
    service.toggleAuditHistory();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const auditHeading = compiled.querySelector('app-inventory-audit-drawer h2#inventory-audit-heading');
    expect(auditHeading).toBeTruthy();
    expect(compiled.querySelector('app-inventory-audit-drawer .audit-table-wrapper')).toBeTruthy();
    expect(compiled.querySelector('app-inventory-audit-drawer .audit-table caption')).toBeTruthy();

    component.openCreateModal('catalog');
    fixture.detectChanges();

    const categorySelect = compiled.querySelector('#create-product-category') as HTMLSelectElement;
    const targetWhSelect = compiled.querySelector('#create-target-wh') as HTMLSelectElement;
    expect(categorySelect?.classList.contains('m3-select')).toBe(true);
    expect(targetWhSelect?.classList.contains('m3-select')).toBe(true);

    const priceInput = compiled.querySelector('#create-product-price') as HTMLInputElement;
    expect(priceInput).toBeTruthy();
    priceInput.value = '249.5';
    priceInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('$249.50');
  });

  it('uses deterministic progress bars without decorative waves, keeps a single Solo alertas switch, and preserves flex scroll + dialog shape alignment', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Header uses deterministic m3-linear-progress and zero wavy circular gauges or loading indicators
    const headerProgress = compiled.querySelectorAll('app-inventory-header m3-linear-progress');
    expect(headerProgress.length).toBeGreaterThan(0);
    expect(compiled.querySelector('m3-circular-progress')).toBeNull();
    expect(compiled.querySelector('m3-loading-indicator')).toBeNull();

    // Bounded flex layout on desktop panes (prevents lg:block clipping multi-color matrix rows)
    const catalogPanel = compiled.querySelector('#inv-panel-catalog') as HTMLElement;
    const matrixPanel = compiled.querySelector('#inv-panel-matrix') as HTMLElement;
    expect(catalogPanel?.classList.contains('lg:flex')).toBe(true);
    expect(catalogPanel?.classList.contains('flex-col')).toBe(true);
    expect(catalogPanel?.classList.contains('lg:block')).toBe(false);
    expect(matrixPanel?.classList.contains('lg:flex')).toBe(true);
    expect(matrixPanel?.classList.contains('flex-col')).toBe(true);
    expect(matrixPanel?.classList.contains('lg:block')).toBe(false);

    // Single authoritative Solo alertas switch inside Matrix dims healthy cells
    const firstCell = service.matrixRows()[0].cells[0];
    if (firstCell.status === 'healthy') {
      service.adjustStock(firstCell.variantSku, -firstCell.stock);
      fixture.detectChanges();
    }

    const allSwitches = compiled.querySelectorAll('m3-switch');
    expect(allSwitches.length).toBe(1);
    const matrixSwitch = compiled.querySelector('app-inventory-matrix m3-switch button[role="switch"]') as HTMLButtonElement;
    expect(matrixSwitch).toBeTruthy();

    matrixSwitch.click();
    fixture.detectChanges();

    expect(component.alertsOnlyMode()).toBe(true);
    expect(matrixSwitch.getAttribute('aria-checked')).toBe('true');
    const healthyCells = Array.from(compiled.querySelectorAll('.m3-matrix-cell-healthy'));
    expect(healthyCells.every(c => c.classList.contains('opacity-40'))).toBe(true);

    // Open Create Studio modal: verify no wavy gauges/loaders and aligned M3 dialog container token classes
    component.openCreateModal('header');
    fixture.detectChanges();
    expect(document.querySelector('m3-circular-progress')).toBeNull();
    expect(document.querySelector('m3-loading-indicator')).toBeNull();

    const dialogSurface = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialogSurface).toBeTruthy();
    expect(dialogSurface.classList.contains('rounded-m3-xl')).toBe(true);
    expect(dialogSurface.classList.contains('rounded-m3-2xl')).toBe(false);
    expect(dialogSurface.classList.contains('bg-surface-box')).toBe(true);
    expect(dialogSurface.classList.contains('shadow-m3-level3')).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(service.isCreateModalOpen()).toBe(false);
  });

  it('prevents persistent catalog view-transition stacking bugs when idle and clears FLIP state after category filter', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const catalogItems = Array.from(compiled.querySelectorAll('.inv-catalog-item')) as HTMLElement[];
    expect(catalogItems.length).toBeGreaterThan(0);

    // No persistent view-transition-name on cards when idle (prevents stacking above dialog scrims)
    catalogItems.forEach(item => {
      expect(item.style.viewTransitionName).toBe('');
    });
    expect(component.isCatalogFlipActive()).toBe(false);

    component.onCategoryChange('polos');
    fixture.detectChanges();
    expect(service.selectedCategory()).toBe('polos');
    expect(component.isCatalogFlipActive()).toBe(false);
  });

  it('updates live before/after stock projections in Transfer modal and opens Product Studio from mobile FAB', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    service.setWarehouse('WH-CENTRAL');
    service.openTransferModal('OXF-802-NVY-M', 'M', 'Azul Marino');
    fixture.detectChanges();

    const simSection = compiled.querySelector('section[aria-label="Simulación en vivo de impacto en almacenes"]');
    expect(simSection).toBeTruthy();
    expect(simSection?.textContent).toContain('-5');
    expect(simSection?.textContent).toContain('+5');

    const plusFiveBtn = Array.from(compiled.querySelectorAll('button')).find(btn =>
      btn.textContent?.trim() === '+5 uds'
    );
    plusFiveBtn?.click();
    fixture.detectChanges();
    expect(simSection?.textContent).toContain('-10');
    expect(simSection?.textContent).toContain('+10');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    // Open Product Studio via mobile FAB button
    const fabBtn = compiled.querySelector('m3-fab button') as HTMLButtonElement;
    expect(fabBtn).toBeTruthy();
    fabBtn.click();
    fixture.detectChanges();

    expect(service.isCreateModalOpen()).toBe(true);
    expect(component.createTriggerOrigin()).toBe('fab');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(service.isCreateModalOpen()).toBe(false);
  });
});
