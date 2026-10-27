import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3LinearProgressComponent } from './linear-progress.component';

describe('M3LinearProgressComponent', () => {
  let component: M3LinearProgressComponent;
  let fixture: ComponentFixture<M3LinearProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3LinearProgressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3LinearProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the linear progress component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to indeterminate mode when value is null', () => {
    const el = fixture.nativeElement.querySelector('.m3-linear-progress');
    expect(el.classList.contains('m3-linear-progress-indeterminate')).toBe(true);
    expect(el.getAttribute('aria-valuenow')).toBeNull();
  });

  it('should render determinate bar when value is provided', () => {
    fixture.componentRef.setInput('value', 45);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-linear-progress');
    expect(el.classList.contains('m3-linear-progress-indeterminate')).toBe(false);
    expect(el.getAttribute('aria-valuenow')).toBe('45');

    const bar = fixture.nativeElement.querySelector('.m3-linear-progress-bar');
    expect(bar).toBeTruthy();
    expect(bar.style.width).toBe('45%');
  });

  it('should render buffer bar when buffer is provided', () => {
    fixture.componentRef.setInput('value', 30);
    fixture.componentRef.setInput('buffer', 70);
    fixture.detectChanges();

    const bufferBar = fixture.nativeElement.querySelector('.m3-linear-progress-buffer');
    expect(bufferBar).toBeTruthy();
    expect(bufferBar.style.width).toBe('70%');
  });

  it('should apply size and color classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'secondary');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-linear-progress');
    expect(el.classList.contains('m3-linear-progress-lg')).toBe(true);
    expect(el.classList.contains('m3-progress-secondary')).toBe(true);
  });

  it('should render wavy track and active SVG path when wavy is true', () => {
    fixture.componentRef.setInput('wavy', true);
    fixture.componentRef.setInput('value', 60);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-linear-progress');
    expect(el.classList.contains('m3-linear-progress-wavy')).toBe(true);

    const wavePath = fixture.nativeElement.querySelector('.m3-linear-wavy-path');
    expect(wavePath).toBeTruthy();
  });
});
