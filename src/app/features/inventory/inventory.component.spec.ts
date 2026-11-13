import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  });
});
