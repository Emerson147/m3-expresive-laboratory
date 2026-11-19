import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3RadioComponent, M3RadioGroupComponent, M3RadioOption } from './radio.component';

@Component({
  standalone: true,
  imports: [M3RadioComponent, M3RadioGroupComponent],
  template: `
    <m3-radio-group
      legend="Frecuencia de envío"
      name="delivery-frequency"
      [errorText]="errorText()"
      [(value)]="selected">
      <m3-radio value="daily" label="Diaria" description="Todos los días a las 08:00" />
      <m3-radio value="weekly" description="Cada lunes">Semanal</m3-radio>
      <m3-radio value="monthly" label="Mensual" [disabled]="true" />
    </m3-radio-group>
  `
})
class ProjectedRadioGroupHostComponent {
  readonly selected = signal<string>('daily');
  readonly errorText = signal<string | null>(null);
}

describe('M3RadioGroupComponent & M3RadioComponent', () => {
  let component: M3RadioGroupComponent;
  let fixture: ComponentFixture<M3RadioGroupComponent>;

  const sampleOptions: M3RadioOption[] = [
    { value: 'card', label: 'Tarjeta', description: 'Crédito o débito' },
    { value: 'cash', label: 'Efectivo', description: 'Pago en caja' },
    { value: 'transfer', label: 'Transferencia' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3RadioGroupComponent, M3RadioComponent, ProjectedRadioGroupHostComponent]
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

  it('should render an accessible sr-only legend when visible legend is omitted', () => {
    fixture.componentRef.setInput('legend', null);
    fixture.componentRef.setInput('ariaLabel', 'Medio de cobro');
    fixture.detectChanges();

    const legend = fixture.nativeElement.querySelector('fieldset > legend') as HTMLLegendElement;
    expect(legend).toBeTruthy();
    expect(legend.classList.contains('sr-only-m3')).toBe(true);
    expect(legend.textContent?.trim()).toBe('Medio de cobro');
  });

  it('should switch value mutually exclusively and emit valueChange and changed', () => {
    const emittedValue: string[] = [];
    const emittedChanged: string[] = [];
    component.value.subscribe((v) => emittedValue.push(v));
    component.changed.subscribe((v) => emittedChanged.push(v));

    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radios[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe('cash');
    expect(radios[1].checked).toBe(true);
    expect(radios[0].checked).toBe(false);
    expect(emittedValue).toEqual(['cash']);
    expect(emittedChanged).toEqual(['cash']);
  });

  it('should select the option when clicking its supporting description without packing description into the label', () => {
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    const labels = fixture.nativeElement.querySelectorAll('label') as NodeListOf<HTMLLabelElement>;
    const descriptions = fixture.nativeElement.querySelectorAll('.m3-radio-description') as NodeListOf<HTMLElement>;

    expect(labels[1].textContent?.trim()).toBe('Efectivo');
    expect(labels[1].getAttribute('for')).toBe(radios[1].id);

    descriptions[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe('cash');
    expect(radios[1].checked).toBe(true);
  });

  it('should honor ControlValueAccessor writeValue and setDisabledState', () => {
    component.writeValue('transfer');
    component.setDisabledState(true);
    fixture.detectChanges();

    const fieldset = fixture.nativeElement.querySelector('fieldset') as HTMLFieldSetElement;
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;

    expect(fieldset.disabled).toBe(true);
    expect(radios[2].checked).toBe(true);
    expect(radios[0].disabled).toBe(true);

    radios[0].click();
    fixture.detectChanges();
    expect(component.value()).toBe('transfer');
  });

  it('should support composable projected <m3-radio> children, error alerts, and disabled items', () => {
    const hostFixture = TestBed.createComponent(ProjectedRadioGroupHostComponent);
    hostFixture.detectChanges();

    const host = hostFixture.componentInstance;
    const el = hostFixture.nativeElement as HTMLElement;
    const radios = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    const labels = el.querySelectorAll('label') as NodeListOf<HTMLLabelElement>;

    expect(radios.length).toBe(3);
    expect(radios[0].name).toBe('delivery-frequency');
    expect(radios[1].name).toBe('delivery-frequency');
    expect(radios[0].checked).toBe(true);
    expect(labels[1].textContent?.trim()).toBe('Semanal');
    expect(radios[2].disabled).toBe(true);

    radios[1].click();
    hostFixture.detectChanges();
    expect(host.selected()).toBe('weekly');
    expect(radios[1].checked).toBe(true);

    radios[2].click();
    hostFixture.detectChanges();
    expect(host.selected()).toBe('weekly');

    host.errorText.set('Selecciona una frecuencia válida');
    hostFixture.detectChanges();

    const alert = el.querySelector('[role="alert"]') as HTMLElement;
    expect(alert?.textContent).toContain('Selecciona una frecuencia válida');
    expect(radios[0].getAttribute('aria-invalid')).toBe('true');
    expect(radios[0].getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('should support standalone <m3-radio> with icon-only ariaLabel', () => {
    const radioFixture = TestBed.createComponent(M3RadioComponent);
    radioFixture.componentRef.setInput('value', 'opt-a');
    radioFixture.componentRef.setInput('name', 'standalone-set');
    radioFixture.componentRef.setInput('ariaLabel', 'Seleccionar opción A');
    radioFixture.detectChanges();

    const input = radioFixture.nativeElement.querySelector('input[type="radio"]') as HTMLInputElement;
    const label = radioFixture.nativeElement.querySelector('label');

    expect(label).toBeNull();
    expect(input.getAttribute('aria-label')).toBe('Seleccionar opción A');

    const selectedValues: string[] = [];
    radioFixture.componentInstance.selected.subscribe((val) => selectedValues.push(val));

    input.click();
    radioFixture.detectChanges();

    expect(radioFixture.componentInstance.checked()).toBe(true);
    expect(selectedValues).toEqual(['opt-a']);
  });
});
