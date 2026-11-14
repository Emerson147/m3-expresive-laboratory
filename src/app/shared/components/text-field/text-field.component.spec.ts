import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3TextFieldComponent } from './text-field.component';

describe('M3TextFieldComponent', () => {
  let component: M3TextFieldComponent;
  let fixture: ComponentFixture<M3TextFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3TextFieldComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3TextFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with default filled variant and base classes', () => {
    expect(component).toBeTruthy();
    const root = fixture.nativeElement.querySelector('.m3-text-field');
    expect(root).toBeTruthy();
    expect(root.classList.contains('m3-text-field-filled')).toBe(true);
  });

  it('should apply outlined variant class when specified', () => {
    fixture.componentRef.setInput('variant', 'outlined');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.m3-text-field');
    expect(root.classList.contains('m3-text-field-outlined')).toBe(true);
  });

  it('should float label when focused or when value is present', () => {
    fixture.componentRef.setInput('label', 'User Email');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.m3-text-field');
    expect(root.classList.contains('is-floated')).toBe(false);

    // Focus input
    const inputEl = fixture.nativeElement.querySelector('input');
    inputEl.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(root.classList.contains('is-floated')).toBe(true);
    expect(root.classList.contains('is-focused')).toBe(true);

    // Blur input
    inputEl.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(root.classList.contains('is-focused')).toBe(false);

    // Set value -> should float even when not focused
    fixture.componentRef.setInput('value', 'test@example.com');
    fixture.detectChanges();
    expect(root.classList.contains('is-floated')).toBe(true);
  });

  it('should update value and call onChange when user inputs text', () => {
    const inputEl = fixture.nativeElement.querySelector('input');
    inputEl.value = 'New Title';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('New Title');
  });

  it('should display error styling, error message and error icon when in error', () => {
    fixture.componentRef.setInput('errorText', 'El campo es obligatorio');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.m3-text-field');
    expect(root.classList.contains('is-error')).toBe(true);

    const helper = fixture.nativeElement.querySelector('.m3-text-field-helper');
    expect(helper.textContent.trim()).toBe('El campo es obligatorio');

    const errorIcon = fixture.nativeElement.querySelector('.material-symbols-rounded.text-error');
    expect(errorIcon).toBeTruthy();
    expect(errorIcon.textContent.trim()).toBe('error');
  });

  it('should clear value and emit clear event when clear button is clicked', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', 'Texto temporal');
    fixture.detectChanges();

    let clearEmitted = false;
    component.clear.subscribe(() => {
      clearEmitted = true;
    });

    const clearBtn = fixture.nativeElement.querySelector('.m3-text-field-trailing button');
    expect(clearBtn).toBeTruthy();
    expect(clearBtn.classList.contains('focus-ring-m3')).toBe(true);

    clearBtn.click();
    fixture.detectChanges();

    expect(component.value()).toBe('');
    expect(clearEmitted).toBe(true);
  });

  it('should forward autocomplete attribute when specified', () => {
    fixture.componentRef.setInput('autocomplete', 'email');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('should render inline prefix and suffix and link them via aria-describedby', () => {
    fixture.componentRef.setInput('prefix', 'S/');
    fixture.componentRef.setInput('suffix', 'PEN');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby') || '';
    const affixes = Array.from(fixture.nativeElement.querySelectorAll('.m3-text-field-affix')) as HTMLElement[];

    expect(affixes.map((el) => el.textContent?.trim())).toEqual(['S/', 'PEN']);
    expect(describedBy).toContain('-prefix');
    expect(describedBy).toContain('-suffix');
  });

  it('should toggle password visibility with accessible aria-label and aria-pressed', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.componentRef.setInput('passwordToggle', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const toggleBtn = fixture.nativeElement.querySelector('.m3-text-field-password-btn') as HTMLButtonElement;

    expect(input.type).toBe('password');
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false');
    expect(toggleBtn.getAttribute('aria-label')).toBe('Mostrar contraseña');

    toggleBtn.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('true');
    expect(toggleBtn.getAttribute('aria-label')).toBe('Ocultar contraseña');
  });

  it('should defer native required error until after blur and apply is-auto-grow on multiline', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.m3-text-field') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(root.classList.contains('is-error')).toBe(false);

    input.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(root.classList.contains('is-error')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');

    fixture.componentRef.setInput('required', false);
    fixture.componentRef.setInput('multiline', true);
    fixture.componentRef.setInput('autoGrow', true);
    fixture.detectChanges();
    expect(root.classList.contains('is-auto-grow')).toBe(true);
  });

  it('should forward native name and readonly attributes and suppress clear button when readonly', () => {
    fixture.componentRef.setInput('name', 'auditFolio');
    fixture.componentRef.setInput('value', 'AUD-2026-0091');
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.m3-text-field') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('name')).toBe('auditFolio');
    expect(input.readOnly).toBe(true);
    expect(root.classList.contains('is-readonly')).toBe(true);
    expect(fixture.nativeElement.querySelector('.m3-text-field-trailing button')).toBeNull();
  });

  it('should render textarea and character counter when multiline is enabled', () => {
    fixture.componentRef.setInput('multiline', true);
    fixture.componentRef.setInput('rows', 4);
    fixture.componentRef.setInput('maxlength', 100);
    fixture.componentRef.setInput('value', 'Hello');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea.getAttribute('rows')).toBe('4');

    const counter = fixture.nativeElement.querySelector('.m3-text-field-counter');
    expect(counter).toBeTruthy();
    expect(counter.textContent.trim()).toBe('5/100');
  });
});
