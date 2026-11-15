import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3CheckboxComponent } from './checkbox.component';

describe('M3CheckboxComponent', () => {
  let component: M3CheckboxComponent;
  let fixture: ComponentFixture<M3CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3CheckboxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render native input[type="checkbox"] with aria-describedby for helper description', () => {
    fixture.componentRef.setInput('label', 'Aceptar términos');
    fixture.componentRef.setInput('description', 'Requerido para facturar');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const desc = fixture.nativeElement.querySelector(`#${input.id}-desc`) as HTMLElement;

    expect(input).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(`${input.id}-desc`);
    expect(desc.textContent?.trim()).toBe('Requerido para facturar');
  });

  it('should sync indeterminate DOM property and clear it cleanly when toggled', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    expect(fixture.nativeElement.querySelector('.m3-checkbox-box.is-indeterminate')).toBeTruthy();

    input.click();
    fixture.detectChanges();

    expect(component.indeterminate()).toBe(false);
    expect(component.checked()).toBe(true);
  });

  it('should honor ControlValueAccessor setDisabledState and writeValue', () => {
    component.writeValue(true);
    component.setDisabledState(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(input.disabled).toBe(true);
  });
});
