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

  it('should render switch with role="switch" and aria-checked="false" by default', () => {
    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(switchBtn).toBeTruthy();
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');
    expect(switchBtn.classList.contains('touch-target-48')).toBe(true);
    expect(switchBtn.classList.contains('focus-ring-m3')).toBe(true);
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

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    switchBtn.click();
    fixture.detectChanges();

    expect(component.checked()).toBe(false);
    expect(switchBtn.disabled).toBe(true);
  });

  it('should associate label with switch via aria-labelledby and ControlValueAccessor', () => {
    fixture.componentRef.setInput('label', 'Notificaciones push');
    component.writeValue(true);
    fixture.detectChanges();

    const switchBtn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    const labelEl = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(switchBtn.getAttribute('aria-checked')).toBe('true');
    expect(labelEl.getAttribute('for')).toBe(switchBtn.id);
    expect(switchBtn.getAttribute('aria-labelledby')).toBe(`${switchBtn.id}-label`);
  });
});

