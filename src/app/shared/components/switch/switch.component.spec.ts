import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3SwitchComponent } from './switch.component';

describe('M3SwitchComponent', () => {
  let component: M3SwitchComponent;
  let fixture: ComponentFixture<M3SwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3SwitchComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3SwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render switch with role="switch", 48dp touch target, and without whole-track scale squeeze', () => {
    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(switchBtn).toBeTruthy();
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');
    expect(switchBtn.classList.contains('touch-target-48')).toBe(true);
    expect(switchBtn.classList.contains('focus-ring-m3')).toBe(true);
    expect(switchBtn.classList.contains('state-layer')).toBe(false);
  });

  it('should toggle checked state, emit changed event, and apply is-checked class on click', () => {
    const emitted: boolean[] = [];
    component.changed.subscribe((v) => emitted.push(v));

    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    switchBtn.click();
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
    expect(switchBtn.getAttribute('aria-checked')).toBe('true');
    expect(switchBtn.classList.contains('is-checked')).toBe(true);
    expect(emitted).toEqual([true]);
  });

  it('should support selected-only icon mode (no close icon when off, check icon when on)', () => {
    fixture.componentRef.setInput('iconMode', 'selected');
    fixture.detectChanges();

    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(switchBtn.classList.contains('has-icon-unselected')).toBe(false);
    expect(fixture.nativeElement.querySelector('.m3-switch-thumb .material-symbols-rounded')).toBeNull();

    switchBtn.click();
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.m3-switch-thumb .material-symbols-rounded') as HTMLElement;
    expect(icon?.textContent?.trim()).toBe('check');
  });

  it('should block interaction via [disabled] input and CVA setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    switchBtn.click();
    fixture.detectChanges();

    expect(component.checked()).toBe(false);
    expect(switchBtn.disabled).toBe(true);
  });

  it('should separate label (aria-labelledby) from description (aria-describedby) and wire ControlValueAccessor', () => {
    fixture.componentRef.setInput('label', 'Notificaciones push');
    fixture.componentRef.setInput('description', 'Alerta inmediata en pantalla');
    component.writeValue(true);
    fixture.detectChanges();

    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    const labelEl = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const descEl = fixture.nativeElement.querySelector(`#${switchBtn.id}-desc`) as HTMLElement;

    expect(switchBtn.getAttribute('aria-checked')).toBe('true');
    expect(labelEl.getAttribute('for')).toBe(switchBtn.id);
    expect(labelEl.textContent?.trim()).toBe('Notificaciones push');
    expect(switchBtn.getAttribute('aria-labelledby')).toBe(`${switchBtn.id}-label`);
    expect(switchBtn.getAttribute('aria-describedby')).toBe(`${switchBtn.id}-desc`);
    expect(descEl?.textContent?.trim()).toBe('Alerta inmediata en pantalla');
  });
});
