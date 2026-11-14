import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3ButtonComponent } from './button.component';

describe('M3ButtonComponent', () => {
  let component: M3ButtonComponent;
  let fixture: ComponentFixture<M3ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the button component', () => {
    expect(component).toBeTruthy();
  });

  it('should apply canonical base classes and filled variant by default', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('m3-btn')).toBe(true);
    expect(button.classList.contains('m3-btn-filled')).toBe(true);
    expect(button.classList.contains('state-layer')).toBe(true);
    expect(button.classList.contains('focus-ring-m3')).toBe(true);
    expect(button.classList.contains('touch-target-48')).toBe(true);
  });

  it('should emit action when clicked and enabled', () => {
    let clicked = false;
    component.action.subscribe(() => {
      clicked = true;
    });

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(clicked).toBe(true);
  });

  it('should not emit action when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let clicked = false;
    component.action.subscribe(() => {
      clicked = true;
    });

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(clicked).toBe(false);
  });

  it('should display flat trackless circular indicator inheriting color when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('m3-circular-progress');
    const progressEl = fixture.nativeElement.querySelector('.m3-circular-progress');
    expect(indicator).toBeTruthy();
    expect(progressEl.classList.contains('m3-progress-inherit')).toBe(true);
    expect(progressEl.classList.contains('m3-circular-wavy')).toBe(false);
    expect(fixture.nativeElement.querySelector('.m3-circular-track')).toBeNull();
  });

  it('should apply morph class when morph input is true', () => {
    fixture.componentRef.setInput('morph', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('m3-btn-morph')).toBe(true);
  });

  it('should apply invisible class and view-transition-name style when inputs are provided', () => {
    fixture.componentRef.setInput('invisible', true);
    fixture.componentRef.setInput('viewTransitionName', 'dialog-transform');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('invisible')).toBe(true);
    expect(button.style.getPropertyValue('view-transition-name')).toBe('dialog-transform');
  });

  it('should toggle selected state and expose aria-pressed when toggle is true', () => {
    fixture.componentRef.setInput('toggle', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('m3-btn-toggle')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.classList.contains('is-selected')).toBe(false);

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('is-selected')).toBe(true);
  });

  it('should support 5-tier sizing tokens including xs and xl', () => {
    fixture.componentRef.setInput('size', 'xs');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').classList.contains('m3-btn-xs')).toBe(true);

    fixture.componentRef.setInput('size', 'xl');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').classList.contains('m3-btn-xl')).toBe(true);
  });
});
