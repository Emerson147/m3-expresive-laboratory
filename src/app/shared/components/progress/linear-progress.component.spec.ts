import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3LinearProgressComponent } from './linear-progress.component';
import { createProgressMotionState, stepProgressMotion } from './progress-motion.util';

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

  it('should render full track in flat indeterminate and avoid 4px left gap at 0%', () => {
    expect(fixture.nativeElement.querySelector('.m3-linear-progress-track-full')).toBeTruthy();

    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    const trackZero = fixture.nativeElement.querySelector('.m3-linear-progress-track') as HTMLElement;
    expect(trackZero).toBeTruthy();
    expect(trackZero.style.left).toBe('0%');
    expect(trackZero.style.marginLeft).toBe('0px');
    expect(fixture.nativeElement.querySelector('.m3-linear-progress-stop')).toBeTruthy();

    fixture.componentRef.setInput('value', 100);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.m3-linear-progress-track')).toBeNull();
    expect(fixture.nativeElement.querySelector('.m3-linear-progress-stop')).toBeNull();
  });

  it('should place flat track after buffer and keep wavy indeterminate visible under reduced motion', () => {
    fixture.componentRef.setInput('value', 30);
    fixture.componentRef.setInput('buffer', 70);
    fixture.detectChanges();

    const track = fixture.nativeElement.querySelector('.m3-linear-progress-track') as HTMLElement;
    const bufferBar = fixture.nativeElement.querySelector('.m3-linear-progress-buffer') as HTMLElement;
    expect(track.style.left).toBe('70%');
    expect(bufferBar.style.clipPath).toContain('calc(');

    fixture.componentRef.setInput('value', null);
    fixture.componentRef.setInput('wavy', true);
    component.prefersReducedMotion.set(true);
    component.indeterminateProgress.set(0.55);
    fixture.detectChanges();

    const wavePath = fixture.nativeElement.querySelector('.m3-linear-wavy-path') as SVGPathElement;
    expect(wavePath?.getAttribute('d')).toBeTruthy();
    const r = component.stopDotRadius();
    const prefix = component.indeterminatePrefixCoords();
    const suffix = component.trackCoords();
    expect(prefix?.x1).toBe(r);
    expect(suffix?.x2).toBe(component.containerWidth() - r);
  });

  it('should show at least a stroke-width dot at 1%, keep 4dp concentric stop dot on lg, and track 40dp floor', () => {
    fixture.componentRef.setInput('value', 1);
    fixture.componentRef.setInput('size', 'md');
    fixture.detectChanges();

    const bar = fixture.nativeElement.querySelector('.m3-linear-progress-bar') as HTMLElement;
    expect(bar.style.minWidth).toBe('4px');

    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('wavy', true);
    fixture.detectChanges();

    expect(component.strokeRadius()).toBe(4);
    expect(component.stopDotRadius()).toBe(2);
    const svgStop = fixture.nativeElement.querySelector('circle.m3-linear-progress-stop') as SVGCircleElement;
    expect(svgStop).toBeTruthy();
    expect(Number(svgStop.getAttribute('r'))).toBe(2);
    expect(Number(svgStop.getAttribute('cx'))).toBe(component.containerWidth() - 4);
    expect(Number(svgStop.getAttribute('cy'))).toBe(component.yCenter());
  });

  it('should grow and shrink dual indeterminate wavy pulses with disjoint middle track gap', () => {
    fixture.componentRef.setInput('value', null);
    fixture.componentRef.setInput('wavy', true);
    component.prefersReducedMotion.set(true);

    component.indeterminateProgress.set(0.25);
    fixture.detectChanges();
    expect(component.indeterminateSegments().length).toBe(1);

    // Overlap phase where trailing Pulse 2 enters left while Pulse 1 exits right
    component.indeterminateProgress.set(0.65);
    fixture.detectChanges();
    const segs = component.indeterminateSegments();
    expect(segs.length).toBe(2);
    expect(segs[0].x2).toBeLessThan(segs[1].x1);
    const mid = component.indeterminateMiddleCoords();
    expect(mid).toBeTruthy();
    expect(mid!.x1).toBeCloseTo(segs[0].x2 + 2 * component.strokeRadius() + component.gap, 1);
    expect(mid!.x2).toBeCloseTo(segs[1].x1 - 2 * component.strokeRadius() - component.gap, 1);
  });

  it('should follow M3 lg (8dp -> 14px / A=3 / lambda=40) measurements, expand height on custom amplitude, and render blueprint cotas', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('wavy', true);
    fixture.componentRef.setInput('value', 65);
    fixture.detectChanges();

    expect(component.containerHeight()).toBe(14);
    expect(component.baseAmplitude()).toBe(3);
    expect(component.effectiveWavelength()).toBe(40);
    expect(component.currentAmplitude()).toBeCloseTo(3, 2);

    // Envelope attenuates linearly on [0, 0.10] and [0.95, 1.0]
    fixture.componentRef.setInput('value', 4);
    fixture.detectChanges();
    expect(component.currentAmplitude()).toBeCloseTo(3 * 0.4, 2);

    // Custom amplitude = 7dp expands container dynamically to prevent crest clipping (8 + 2*7 = 22)
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('amplitude', 7);
    fixture.componentRef.setInput('blueprint', true);
    fixture.detectChanges();

    expect(component.containerHeight()).toBe(22);
    const bp = fixture.nativeElement.querySelector('g.m3-progress-blueprint');
    expect(bp).toBeTruthy();
    expect(bp.textContent).toContain('4dp gap');
    expect(fixture.nativeElement.querySelector('circle.m3-blueprint-stop-ring')).toBeTruthy();
  });

  it('should advance progress with 400ms emphasized-decelerate and flatten destination amplitude over 200ms', () => {
    const state = createProgressMotionState();
    stepProgressMotion(state, {
      targetValue: 50,
      maxAmp: 3,
      dtSec: 0,
      instantValue: true,
      immediateAll: true
    });
    expect(state.valueCurrent).toBe(50);
    expect(state.ampCurrent).toBeCloseTo(3, 2);

    // Target reaches destination (100%): progress takes 400ms (emphasized-decelerate -> fast launch > 80% by 100ms)
    stepProgressMotion(state, {
      targetValue: 100,
      maxAmp: 3,
      dtSec: 0.1,
      instantValue: false,
      immediateAll: false
    });
    expect(state.valueCurrent).toBeGreaterThan(80);
    expect(state.valueCurrent).toBeLessThan(100);

    // Jump directly to 100% in RAF-driven mode: amplitude settles smoothly over 200ms rather than snapping to 0 in 1 frame
    const stateDest = createProgressMotionState();
    stepProgressMotion(stateDest, {
      targetValue: 94,
      maxAmp: 3,
      dtSec: 0,
      instantValue: true,
      immediateAll: true
    });
    const activeAfter100ms = stepProgressMotion(stateDest, {
      targetValue: 100,
      maxAmp: 3,
      dtSec: 0.1,
      instantValue: true,
      immediateAll: false
    });
    expect(activeAfter100ms).toBe(true);
    expect(stateDest.valueCurrent).toBe(100);
    expect(stateDest.ampCurrent).toBeCloseTo(1.5, 2);

    const activeAfter200ms = stepProgressMotion(stateDest, {
      targetValue: 100,
      maxAmp: 3,
      dtSec: 0.1,
      instantValue: true,
      immediateAll: false
    });
    expect(activeAfter200ms).toBe(false);
    expect(stateDest.ampCurrent).toBe(0);
  });
});
