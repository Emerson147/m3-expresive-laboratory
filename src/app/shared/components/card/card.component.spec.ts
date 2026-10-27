import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3CardComponent } from './card.component';

describe('M3CardComponent', () => {
  let component: M3CardComponent;
  let fixture: ComponentFixture<M3CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the card component', () => {
    expect(component).toBeTruthy();
  });

  it('should apply elevated variant and xl shape by default', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.classList.contains('m3-card')).toBe(true);
    expect(el.classList.contains('m3-card-elevated')).toBe(true);
    expect(el.classList.contains('rounded-m3-xl')).toBe(true);
    expect(el.classList.contains('m3-card-pad-md')).toBe(true);
  });

  it('should apply outlined variant when requested', () => {
    fixture.componentRef.setInput('variant', 'outlined');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.classList.contains('m3-card-outlined')).toBe(true);
  });

  it('should apply interactive classes and accessibility attributes', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.classList.contains('m3-card-interactive')).toBe(true);
    expect(el.classList.contains('state-layer')).toBe(true);
    expect(el.classList.contains('focus-ring-m3')).toBe(true);
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('role')).toBe('button');
  });

  it('should emit action on click when interactive', () => {
    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();

    let clicked = false;
    component.action.subscribe(() => {
      clicked = true;
    });

    const el = fixture.nativeElement as HTMLElement;
    el.click();
    expect(clicked).toBe(true);
  });

  it('should not emit action on click when not interactive', () => {
    let clicked = false;
    component.action.subscribe(() => {
      clicked = true;
    });

    const el = fixture.nativeElement as HTMLElement;
    el.click();
    expect(clicked).toBe(false);
  });

  it('should apply invisible class and view-transition-name style when inputs are provided', () => {
    fixture.componentRef.setInput('invisible', true);
    fixture.componentRef.setInput('viewTransitionName', 'dialog-transform');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.classList.contains('invisible')).toBe(true);
    expect(el.style.getPropertyValue('view-transition-name')).toBe('dialog-transform');
  });
});
