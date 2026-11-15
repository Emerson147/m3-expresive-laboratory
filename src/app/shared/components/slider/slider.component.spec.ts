import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3SliderComponent } from './slider.component';

describe('M3SliderComponent', () => {
  let component: M3SliderComponent;
  let fixture: ComponentFixture<M3SliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3SliderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3SliderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Volumen');
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('step', 20);
    fixture.componentRef.setInput('value', 40);
    fixture.componentRef.setInput('showStops', true);
    fixture.componentRef.setInput('unit', '%');
    fixture.detectChanges();
  });

  it('should calculate normalized percentage, discrete stop dots, and formatted valuetext', () => {
    const range = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    const stops = fixture.nativeElement.querySelectorAll('.m3-slider-stop-dot');

    expect(component.percent()).toBe(40);
    expect(range.getAttribute('aria-valuetext')).toBe('40%');
    // 5 total intervals -> 4 internal stops; index 2 sits at current 40% so hidden behind handle
    expect(stops.length).toBe(3);
  });

  it('should update model value and emit valueChange on native range input', () => {
    const range = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    const emitted: number[] = [];
    component.value.subscribe((v) => emitted.push(v));

    range.value = '80';
    range.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe(80);
    expect(emitted).toEqual([80]);
  });
});
