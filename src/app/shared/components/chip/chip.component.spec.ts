import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3ChipComponent } from './chip.component';

describe('M3ChipComponent', () => {
  let component: M3ChipComponent;
  let fixture: ComponentFixture<M3ChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3ChipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3ChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the chip component', () => {
    expect(component).toBeTruthy();
  });

  it('should apply canonical base classes and filter type by default', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('m3-chip')).toBe(true);
    expect(button.classList.contains('m3-chip-filter')).toBe(true);
    expect(button.classList.contains('state-layer')).toBe(true);
    expect(button.classList.contains('focus-ring-m3')).toBe(true);
    expect(button.classList.contains('touch-target-48')).toBe(true);
  });

  it('should render check icon and is-selected class when selected', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('is-selected')).toBe(true);
    expect(button.textContent).toContain('check');
  });

  it('should emit action on click when enabled', () => {
    let clicked = false;
    component.action.subscribe(() => {
      clicked = true;
    });

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(clicked).toBe(true);
  });

  it('should not emit action when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let clicked = false;
    component.action.subscribe(() => {
      clicked = true;
    });

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(clicked).toBe(false);
  });

  it('should render count badge when count is provided', () => {
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.m3-chip-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('5');
  });

  it('should emit remove event when remove icon is clicked', () => {
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    let removed = false;
    component.remove.subscribe(() => {
      removed = true;
    });

    const cancelIcon = fixture.nativeElement.querySelector('[role="button"]') as HTMLElement;
    cancelIcon.click();
    expect(removed).toBe(true);
  });
});
