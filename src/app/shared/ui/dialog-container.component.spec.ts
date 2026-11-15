import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../core/theme/theme.service';
import { DialogContainerComponent } from './dialog-container.component';

describe('DialogContainerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogContainerComponent]
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(ThemeService).setContrastLevel('standard');
  });

  it('centralizes Color Semilla, Contraste M3, and Navegación inside menu-appearance', () => {
    const fixture = TestBed.createComponent(DialogContainerComponent);
    const themeService = TestBed.inject(ThemeService);

    fixture.componentRef.setInput('isDialogOpen', true);
    fixture.componentRef.setInput('activeTrigger', 'menu-bottom-left');
    fixture.componentRef.setInput('activeTransition', null);
    fixture.componentRef.setInput('dialogView', 'menu-appearance');
    fixture.componentRef.setInput('navStyle', 'auto');
    fixture.componentRef.setInput('activeTaskId', null);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-label="Color semilla del tema"]')).toBeTruthy();

    const contrastGroup = el.querySelector('[aria-label="Nivel de contraste M3"]') as HTMLElement;
    expect(contrastGroup).toBeTruthy();

    const highBtn = Array.from(contrastGroup.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Alto')
    ) as HTMLButtonElement;

    highBtn.click();
    fixture.detectChanges();

    expect(themeService.contrastLevel()).toBe('high');
    expect(highBtn.getAttribute('aria-pressed')).toBe('true');
  });
});
