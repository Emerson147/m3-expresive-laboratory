import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryComponent } from './inventory.component';
import { InventoryService } from '../../core/inventory/inventory.service';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let service: InventoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(InventoryService);
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

  it('should render 2D matrix columns for available sizes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sizes = service.selectedProduct().availableSizes;
    sizes.forEach(size => {
      expect(compiled.textContent).toContain(size);
    });
  });

  it('should open transfer modal when triggered', () => {
    service.openTransferModal('OXF-802-NVY-M', 'M', 'Azul Marino');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Transferencia Inter-Almacén');
  });

  it('should open the new garment creation modal with Cartesian generator', () => {
    component.openCreateModal();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Product Studio • Alta de Modelo');
    expect(compiled.textContent).toContain('Generador 2D');
  });
});
