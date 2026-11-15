import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3RadioGroupComponent, M3RadioOption } from './radio.component';

describe('M3RadioGroupComponent', () => {
  let component: M3RadioGroupComponent;
  let fixture: ComponentFixture<M3RadioGroupComponent>;

  const sampleOptions: M3RadioOption[] = [
    { value: 'card', label: 'Tarjeta', description: 'Crédito o débito' },
    { value: 'cash', label: 'Efectivo', description: 'Pago en caja' },
    { value: 'transfer', label: 'Transferencia' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3RadioGroupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3RadioGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', sampleOptions);
    fixture.componentRef.setInput('legend', 'Método de pago');
    fixture.componentRef.setInput('value', 'card');
    fixture.detectChanges();
  });

  it('should render native radio inputs sharing one group name inside a fieldset legend', () => {
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    const legend = fixture.nativeElement.querySelector('legend') as HTMLLegendElement;

    expect(radios.length).toBe(3);
    expect(legend.textContent?.trim()).toBe('Método de pago');
    expect(radios[0].name).toBe(radios[1].name);
    expect(radios[0].checked).toBe(true);
    expect(radios[0].getAttribute('aria-describedby')).toBe(`${radios[0].id}-desc`);
  });

  it('should switch value mutually exclusively and emit valueChange', () => {
    const emitted: string[] = [];
    component.value.subscribe((v) => emitted.push(v));

    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radios[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe('cash');
    expect(radios[1].checked).toBe(true);
    expect(radios[0].checked).toBe(false);
    expect(emitted).toEqual(['cash']);
  });
});
