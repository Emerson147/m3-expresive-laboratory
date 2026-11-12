import { TestBed } from '@angular/core/testing';
import { HeroDetailModalComponent } from './hero-detail-modal.component';

describe('HeroDetailModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroDetailModalComponent]
    }).compileComponents();
  });

  function setup(isOpen = true) {
    const fixture = TestBed.createComponent(HeroDetailModalComponent);
    fixture.componentRef.setInput('isHeroExpanded', isOpen);
    fixture.componentRef.setInput('activeTransition', 'hero');
    fixture.componentRef.setInput('completionRate', 65);
    fixture.componentRef.setInput('completedCount', 4);
    fixture.componentRef.setInput('pendingCount', 2);
    fixture.detectChanges();
    return { fixture };
  }

  it('renders an accessible modal dialog with wavy M3 progress when expanded', () => {
    const { fixture } = setup(true);
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.classList.contains('hero-mesh-m3')).toBe(true);
    expect(dialog.classList.contains('m3-aurora-glow')).toBe(true);
    expect(dialog.querySelectorAll('.m3-aurora-layer .m3-aurora-orb').length).toBe(3);
    expect(fixture.nativeElement.querySelector('m3-linear-progress')).toBeTruthy();
  });

  it('emits close when pressing Escape while expanded', () => {
    const { fixture } = setup(true);
    const closeSpy = vi.fn();
    fixture.componentInstance.close.subscribe(closeSpy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not emit close on Escape when modal is closed', () => {
    const { fixture } = setup(false);
    const closeSpy = vi.fn();
    fixture.componentInstance.close.subscribe(closeSpy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closeSpy).not.toHaveBeenCalled();
  });
});
