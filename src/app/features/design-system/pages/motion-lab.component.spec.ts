import { TestBed } from '@angular/core/testing';
import { MotionLabComponent } from './motion-lab.component';
import { CANONICAL_EASINGS, MOTION_THEATER_SETS } from './motion-specs.data';

describe('MotionLabComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotionLabComponent],
    }).compileComponents();
  });

  it('validates 500ms expand and 250ms return as canonical Emphasized on-screen pairings', () => {
    const fixture = TestBed.createComponent(MotionLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.setEasing('emphasized');
    component.testDuration('long2', 500);
    expect(component.easingDurationPairingStatus().valid).toBe(true);

    component.testDuration('medium1', 250);
    expect(component.easingDurationPairingStatus().valid).toBe(true);

    component.testDuration('short4', 200);
    expect(component.easingDurationPairingStatus().valid).toBe(false);
  });

  it('switches Pillar 1 between disposable modal asymmetry (400/200) and on-screen card asymmetry (500/250)', () => {
    const fixture = TestBed.createComponent(MotionLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.demoAsymmetryMode()).toBe('disposable');
    expect(fixture.nativeElement.textContent).toContain('medium4 • 400ms');

    component.setAsymmetryMode('onscreen');
    fixture.detectChanges();

    expect(component.demoAsymmetryMode()).toBe('onscreen');
    expect(fixture.nativeElement.textContent).toContain('long2 • 500ms');
    expect(fixture.nativeElement.textContent).toContain('medium1 • 250ms');
  });

  it('renders Trap 3 Stage Recess ghosting and GPU ambient aurora reduced-motion rules', () => {
    const fixture = TestBed.createComponent(MotionLabComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Trampa 3: Ghosting');
    expect(text).toContain('html.vt-running');
    expect(text).toContain('.m3-aurora-orb');
  });

  it('uses real <m3-switch>, persistent DOM containers without transition-all, and GPU compositor telemetry', () => {
    const fixture = TestBed.createComponent(MotionLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('m3-switch')).toBeTruthy();
    expect(host.querySelector('.transition-all')).toBeNull();
    expect(host.textContent).toContain('Sheet de Acciones');
    expect(host.querySelector('[id="motion-top-layer-demo"][popover="auto"]')).toBeTruthy();

    component.setReducedMotionSim(true);
    fixture.detectChanges();
    expect(host.textContent).toContain('Calm Fade (150ms');

    component.setSpringCurveMode('linear');
    fixture.detectChanges();
    expect(component.activeSpatialCurve()).toContain('linear(');
    expect(host.textContent).toContain('transition-property: transform, opacity;');
  });

  it('switches Pillar 2 spring physics accurately between Expressive (0.6/800) and Standard Minimalismo Zen (0.9/1400)', () => {
    const fixture = TestBed.createComponent(MotionLabComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(component.activeSpringSpecs().spatial.damping).toBe(0.6);
    expect(component.activeSpringSpecs().spatial.stiffness).toBe(800);
    expect(host.textContent).toContain('Damping 0.6 • Stiffness 800');

    component.setSpringStyle('standard');
    fixture.detectChanges();

    expect(component.activeSpringSpecs().spatial.damping).toBe(0.9);
    expect(component.activeSpringSpecs().spatial.stiffness).toBe(1400);
    expect(host.textContent).toContain('Damping 0.9 • Stiffness 1400');
  });

  it('exposes mathematically calibrated SVG curves for Theater and Canonical Easing tables', () => {
    const stdAccel = MOTION_THEATER_SETS.standard.cards.find(c => c.id === 'standard-accelerate');
    const emphCanonical = CANONICAL_EASINGS.find(e => e.name === 'emphasized');

    expect(stdAccel?.svgCurve).toBe('M 5 80 C 44 80, 135 10, 135 10');
    expect(emphCanonical?.svgCurve).toBe('M 15 55 C 18.5 55, 24.3 52.6, 26.6 39 C 29.6 22.2, 32.5 15, 85 15');
  });
});
