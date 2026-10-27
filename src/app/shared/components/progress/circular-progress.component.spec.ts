import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3CircularProgressComponent } from './circular-progress.component';

describe('M3CircularProgressComponent', () => {
  let component: M3CircularProgressComponent;
  let fixture: ComponentFixture<M3CircularProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3CircularProgressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3CircularProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create circular progress component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to indeterminate mode when value is null', () => {
    const el = fixture.nativeElement.querySelector('.m3-circular-progress');
    expect(el.classList.contains('m3-circular-progress-indeterminate')).toBe(true);
    expect(el.getAttribute('aria-valuenow')).toBeNull();
  });

  it('should calculate stroke dashoffset in determinate mode', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-circular-progress');
    expect(el.classList.contains('m3-circular-progress-indeterminate')).toBe(false);
    expect(el.getAttribute('aria-valuenow')).toBe('50');

    const indicator = fixture.nativeElement.querySelector('.m3-circular-indicator');
    expect(indicator).toBeTruthy();
    // 50% means offset is 50% of circumference
    const halfCircumference = component.circumference * 0.5;
    expect(parseFloat(indicator.style.strokeDashoffset)).toBeCloseTo(halfCircumference, 1);
  });

  it('should support four-color expressive mode', () => {
    fixture.componentRef.setInput('color', 'four-color');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-circular-progress');
    expect(el.classList.contains('m3-progress-four-color')).toBe(true);
  });

  it('should apply size classes correctly', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-circular-progress');
    expect(el.classList.contains('m3-circular-progress-lg')).toBe(true);
  });

  it('should apply wavy class when wavy is true', () => {
    fixture.componentRef.setInput('wavy', true);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-circular-progress');
    expect(el.classList.contains('m3-circular-wavy')).toBe(true);
  });
});
