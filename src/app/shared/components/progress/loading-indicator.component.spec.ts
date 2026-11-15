import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  M3_LOADING_SEGMENT_COUNT,
  M3LoadingIndicatorComponent,
  computeDeterminateLoadingFrame,
  computeLoadingIndicatorFrame
} from './loading-indicator.component';
import {
  DEFAULT_LOADING_MORPH_INTERVAL_MS,
  evaluateLoadingStepSpring,
  evaluateSpringStep
} from './progress-motion.util';

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

  it('should create the loading indicator component with accessible role="progressbar"', () => {
    expect(component).toBeTruthy();

    const progressEl = fixture.nativeElement.querySelector('[role="progressbar"]');
    expect(progressEl).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    expect(progressEl.getAttribute('aria-label')).toBe('Cargando contenido...');
    expect(fixture.nativeElement.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
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

  it('should generate all 7 canonical M3 indeterminate shapes plus Circle with uniform Bezier segments and zero invalid SMIL animate', () => {
    const path = fixture.nativeElement.querySelector('.m3-loading-shape-path');
    expect(path).toBeTruthy();
    expect(fixture.nativeElement.querySelector('animate')).toBeNull();

    const countCubicSegments = (d: string) => (d.match(/ C /g) ?? []).length;
    expect(countCubicSegments(component.softBurstPath)).toBe(M3_LOADING_SEGMENT_COUNT);
    expect(countCubicSegments(component.cookie9Path)).toBe(M3_LOADING_SEGMENT_COUNT);
    expect(countCubicSegments(component.pentagonPath)).toBe(M3_LOADING_SEGMENT_COUNT);
    expect(countCubicSegments(component.pillPath)).toBe(M3_LOADING_SEGMENT_COUNT);
    expect(countCubicSegments(component.sunnyPath)).toBe(M3_LOADING_SEGMENT_COUNT);
    expect(countCubicSegments(component.flowerPath)).toBe(M3_LOADING_SEGMENT_COUNT);
    expect(countCubicSegments(component.ovalPath)).toBe(M3_LOADING_SEGMENT_COUNT);
    expect(countCubicSegments(component.circlePath)).toBe(M3_LOADING_SEGMENT_COUNT);
  });

  it('should drive morphing and +90deg step rotation via underdamped M3 spring (0.6 / 200) without seams at 650ms boundaries', () => {
    expect(evaluateSpringStep(0)).toBe(0);
    // Peak underdamped overshoot occurs around 278ms (~1.095)
    expect(evaluateSpringStep(0.278)).toBeGreaterThan(1.08);
    expect(evaluateLoadingStepSpring(0)).toBe(0);
    expect(evaluateLoadingStepSpring(0.65)).toBe(1);

    const frameStart = computeLoadingIndicatorFrame(0);
    expect(frameStart.d).toBe(component.softBurstPath);
    expect(frameStart.angleDeg).toBe(0);

    const boundaryBefore = computeLoadingIndicatorFrame(DEFAULT_LOADING_MORPH_INTERVAL_MS - 0.001);
    const boundaryAfter = computeLoadingIndicatorFrame(DEFAULT_LOADING_MORPH_INTERVAL_MS);
    expect(boundaryAfter.d).toBe(component.cookie9Path);
    expect(boundaryAfter.stepIndex).toBe(1);
    expect(boundaryAfter.angleDeg).toBeCloseTo(boundaryBefore.angleDeg, 1);
  });

  it('should scale contained wrapper with size class and freeze SVG shape and transform under reduced motion', () => {
    fixture.componentRef.setInput('contained', true);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.m3-loading-container');
    expect(container.classList.contains('m3-loading-container-lg')).toBe(true);

    component.prefersReducedMotion.set(true);
    fixture.detectChanges();

    const svgEl = fixture.nativeElement.querySelector('.m3-loading-shape-svg') as SVGSVGElement;
    const pathEl = fixture.nativeElement.querySelector('.m3-loading-shape-path') as SVGPathElement;
    expect(pathEl.getAttribute('d')).toBe(component.pentagonPath);
    expect(svgEl.style.transform).toBe('');
  });

  it('should clamp custom [diameter] between 24dp and 240dp and preserve the 38/48 shape ratio on contained wrappers', () => {
    fixture.componentRef.setInput('contained', true);
    fixture.componentRef.setInput('diameter', 10);
    fixture.detectChanges();

    const progressEl = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    const containerEl = fixture.nativeElement.querySelector('.m3-loading-container') as HTMLElement;
    expect(progressEl.style.width).toBe('24px');
    expect(containerEl.style.width).toBe('24px');
    expect(component.effectiveDiameterDp()).toBe(24);
    expect(component.effectiveShapeDp()).toBe(19);

    fixture.componentRef.setInput('diameter', 120);
    fixture.detectChanges();
    expect(progressEl.style.width).toBe('120px');
    expect(containerEl.style.width).toBe('120px');
    expect(component.effectiveShapeDp()).toBe(95);

    fixture.componentRef.setInput('diameter', 360);
    fixture.detectChanges();
    expect(progressEl.style.width).toBe('240px');
    expect(component.effectiveShapeDp()).toBe(190);

    fixture.componentRef.setInput('elevated', true);
    fixture.detectChanges();
    expect(containerEl.style.width).toBe('');
    expect(progressEl.style.width).toBe('240px');
  });

  it('should morph Circle (+18deg) -> SoftBurst deterministically in [progress] mode and sync aria-valuenow', () => {
    const startFrame = computeDeterminateLoadingFrame(0);
    const midFrame = computeDeterminateLoadingFrame(0.5);
    const endFrame = computeDeterminateLoadingFrame(1);

    expect(startFrame.angleDeg).toBe(18);
    expect(midFrame.angleDeg).toBe(63);
    expect(endFrame.angleDeg).toBe(108);
    expect(endFrame.d).toBe(component.softBurstPath);
    expect(midFrame.d).not.toBe(startFrame.d);
    expect(midFrame.d).not.toBe(endFrame.d);

    fixture.componentRef.setInput('progress', 0.45);
    fixture.detectChanges();

    const progressEl = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    const svgEl = fixture.nativeElement.querySelector('.m3-loading-shape-svg') as SVGSVGElement;
    expect(progressEl.getAttribute('aria-valuenow')).toBe('45');
    expect(progressEl.getAttribute('aria-valuemin')).toBe('0');
    expect(progressEl.getAttribute('aria-valuemax')).toBe('100');
    expect(svgEl.style.transform).toContain('58.50deg');
    expect(component.getTelemetrySnapshot().isIndeterminate).toBe(false);
    expect(component.getTelemetrySnapshot().shapeName).toBe('Circle -> SoftBurst');

    fixture.componentRef.setInput('progress', null);
    fixture.detectChanges();
    expect(progressEl.getAttribute('aria-valuenow')).toBeNull();
    expect(progressEl.getAttribute('aria-valuemin')).toBeNull();
    expect(progressEl.getAttribute('aria-valuemax')).toBeNull();
  });

  it('should support [paused] in indeterminate mode cleanly and report telemetry snapshot', () => {
    fixture.componentRef.setInput('paused', true);
    fixture.detectChanges();

    const snapPaused = component.getTelemetrySnapshot();
    expect(snapPaused.paused).toBe(true);
    expect(snapPaused.isIndeterminate).toBe(true);
    expect(snapPaused.diameterDp).toBe(48);
    expect(snapPaused.shapeDp).toBe(38);

    fixture.componentRef.setInput('paused', false);
    fixture.detectChanges();
    expect(component.getTelemetrySnapshot().paused).toBe(false);
  });

  it('should generate convex notch-free Pentagon, diagonal Cookie4, and +45deg Oval silhouettes', () => {
    const extractAnchors = (d: string) => {
      const mMatch = /^M\s+([\d.-]+),([\d.-]+)/.exec(d);
      const pts: Array<{ x: number; y: number }> = [];
      if (mMatch) {
        pts.push({ x: parseFloat(mMatch[1]), y: parseFloat(mMatch[2]) });
      }
      const cRegex = /C\s+[\d.-]+,[\d.-]+\s+[\d.-]+,[\d.-]+\s+([\d.-]+),([\d.-]+)/g;
      let match: RegExpExecArray | null;
      while ((match = cRegex.exec(d)) !== null) {
        pts.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
      return pts.slice(0, M3_LOADING_SEGMENT_COUNT);
    };

    const radialAt = (pts: Array<{ x: number; y: number }>, idx: number) =>
      Math.hypot(pts[idx].x - 24, pts[idx].y - 24);

    // Pentagon: index 0 (-90deg top vertex) = ~19dp, index 18 (-54deg flat side midpoint) = exact apothem >= 15.3dp (no notch)
    const pentagonPts = extractAnchors(component.pentagonPath);
    expect(radialAt(pentagonPts, 0)).toBeCloseTo(19, 1);
    expect(radialAt(pentagonPts, 18)).toBeGreaterThan(15.3);

    // Cookie4: diagonal 45deg (index 67 or 22) > cardinal axis (index 0 or 45)
    const cookie4Pts = extractAnchors(component.flowerPath);
    expect(radialAt(cookie4Pts, 22)).toBeGreaterThan(radialAt(cookie4Pts, 0) + 3);

    // Oval: +45deg visual diagonal (theta=-45deg => idx=22) major axis (~19dp) vs orthogonal (idx=67) minor axis (~13dp)
    const ovalPts = extractAnchors(component.ovalPath);
    expect(radialAt(ovalPts, 22)).toBeGreaterThan(18.5);
    expect(radialAt(ovalPts, 67)).toBeLessThan(13.5);
  });
});
