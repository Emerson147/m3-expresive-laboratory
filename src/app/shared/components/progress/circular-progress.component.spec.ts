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

  it('should compensate cap protrusion in track gap and omit orphan dots at 0% and >= 86%', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();

    // md strokeWidth = 4 => effectiveGap = 4 + 4 = 8 for true 4dp cap-edge separation
    expect(component.effectiveGap()).toBe(8);
    expect(component.trackDashOffset()).toBeCloseTo(-(component.circumference * 0.5 + 8), 2);

    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.m3-circular-indicator')).toBeNull();
    expect(component.shouldRenderTrack()).toBe(true);

    fixture.componentRef.setInput('value', 90);
    fixture.detectChanges();
    expect(component.shouldRenderTrack()).toBe(false);
    expect(fixture.nativeElement.querySelector('.m3-circular-track')).toBeNull();
  });

  it('should generate closed circular track at 0% wavy and keep wavy gap wide enough for round caps', () => {
    fixture.componentRef.setInput('wavy', true);
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(component.wavyTrackPath()).toBeTruthy();

    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
    const gapAngle = component.effectiveGap() / component.radius;
    expect(gapAngle).toBeCloseTo(8 / 18, 3);
    expect(component.wavyTrackPath()).toBeTruthy();
  });

  it('should support color="inherit", clamp diameter to 240dp with 10 lobes at 120px, and thicken sm stroke', () => {
    fixture.componentRef.setInput('color', 'inherit');
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('wavy', true);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.m3-circular-progress') as HTMLElement;
    expect(el.classList.contains('m3-progress-inherit')).toBe(true);
    expect(component.strokeWidth()).toBe(5.2);

    fixture.componentRef.setInput('size', 'md');
    fixture.componentRef.setInput('diameter', 120);
    fixture.detectChanges();
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('120px');
    expect(component.waveLobes()).toBe(10);

    fixture.componentRef.setInput('diameter', 300);
    fixture.detectChanges();
    expect(el.style.width).toBe('240px');
    expect(el.style.height).toBe('240px');
  });

  it('should expand and contract wavy indeterminate arc (28deg <-> 298deg) with seamless track safety', () => {
    fixture.componentRef.setInput('value', null);
    fixture.componentRef.setInput('wavy', true);

    component.indeterminateCycles.set(0);
    fixture.detectChanges();
    const minSpan = component.indeterminateBounds().endAngle - component.indeterminateBounds().startAngle;
    expect(minSpan).toBeCloseTo((28 * Math.PI) / 180, 3);
    expect(component.wavyTrackPath()).toBeTruthy();

    component.indeterminateCycles.set(0.5);
    fixture.detectChanges();
    const maxSpan = component.indeterminateBounds().endAngle - component.indeterminateBounds().startAngle;
    expect(maxSpan).toBeCloseTo((298 * Math.PI) / 180, 2);

    // Continuity at boundary u=1.0 -> k=1.0: startAngle matches seamlessly without jumping
    component.indeterminateCycles.set(0.9999);
    const endStartAngle = component.indeterminateBounds().startAngle;
    component.indeterminateCycles.set(1.0);
    const nextStartAngle = component.indeterminateBounds().startAngle;
    expect(nextStartAngle).toBeCloseTo(endStartAngle, 2);
  });

  it('should quantize integer lobes N dynamically from wavelength, adapt R0 safely on high amplitude, and render blueprint cotas', () => {
    fixture.componentRef.setInput('diameter', 84);
    fixture.componentRef.setInput('wavy', true);
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('wavelength', 40);
    fixture.componentRef.setInput('amplitude', 3);
    fixture.componentRef.setInput('blueprint', true);
    fixture.detectChanges();

    // lambda_circ = 40 * 0.375 = 15dp, R0_dp = 18 * (84/48) = 31.5dp -> N = round(2*PI*31.5 / 15) = 13
    expect(component.circularWavelengthDp()).toBeCloseTo(15, 2);
    expect(component.radiusDp()).toBeCloseTo(31.5, 1);
    expect(component.waveLobes()).toBe(13);
    expect(fixture.nativeElement.querySelector('g.m3-progress-blueprint')).toBeTruthy();

    // High amplitude (8dp) inside compact 48dp ring shrinks effectiveRadius inside viewBox to avoid clipping
    fixture.componentRef.setInput('diameter', 48);
    fixture.componentRef.setInput('amplitude', 8);
    fixture.detectChanges();
    expect(component.effectiveRadius()).toBeLessThan(18);
  });
});
