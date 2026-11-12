import { TestBed } from '@angular/core/testing';
import { MotionLabComponent } from './motion-lab.component';

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
});
