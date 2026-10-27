import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3LoadingIndicatorComponent } from './loading-indicator.component';

describe('M3LoadingIndicatorComponent', () => {
  let component: M3LoadingIndicatorComponent;
  let fixture: ComponentFixture<M3LoadingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3LoadingIndicatorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3LoadingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the loading indicator component', () => {
    expect(component).toBeTruthy();
  });

  it('should apply canonical base classes and medium size by default', () => {
    const el = fixture.nativeElement.querySelector('.m3-loading-indicator');
    expect(el).toBeTruthy();
    expect(el.classList.contains('m3-loading-indicator-md')).toBe(true);
    expect(el.classList.contains('m3-progress-primary')).toBe(true);
  });

  it('should apply size and color correctly', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('color', 'tertiary');
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-loading-indicator');
    expect(el.classList.contains('m3-loading-indicator-lg')).toBe(true);
    expect(el.classList.contains('m3-progress-tertiary')).toBe(true);
  });

  it('should render contained pill wrapper when contained is true', () => {
    fixture.componentRef.setInput('contained', true);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.m3-loading-container');
    expect(container).toBeTruthy();
  });

  it('should render elevated container when elevated is true', () => {
    fixture.componentRef.setInput('elevated', true);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.m3-loading-container.m3-loading-container-elevated');
    expect(container).toBeTruthy();
  });

  it('should render SVG shape path with animate element', () => {
    const path = fixture.nativeElement.querySelector('.m3-loading-shape-path');
    const animate = fixture.nativeElement.querySelector('animate');
    expect(path).toBeTruthy();
    expect(animate).toBeTruthy();
    expect(animate.getAttribute('attributeName')).toBe('d');
  });
});
