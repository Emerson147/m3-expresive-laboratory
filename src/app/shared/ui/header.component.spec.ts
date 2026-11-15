import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    }).compileComponents();
  });

  function setup(section: 'overview' | 'pos' = 'overview') {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentSection', section);
    fixture.componentRef.setInput('chromeMode', 'rail-expanded');
    fixture.componentRef.setInput('isDialogOpen', false);
    fixture.componentRef.setInput('activeTrigger', null);
    fixture.detectChanges();
    return fixture;
  }

  it('renders Centro de Comando heading, omits duplicated color seed dots, and emits command palette & create actions', () => {
    const fixture = setup('overview');
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('Centro de Comando');
    expect(el.querySelector('[style*="background-color"]')).toBeNull();

    const paletteSpy = vi.spyOn(fixture.componentInstance.openCommandPalette, 'emit');
    const searchBtn = el.querySelector('button[aria-label="Abrir paleta de comandos (Ctrl+K)"]') as HTMLButtonElement;
    expect(searchBtn).toBeTruthy();
    searchBtn.click();
    expect(paletteSpy).toHaveBeenCalledTimes(1);

    const createSpy = vi.spyOn(fixture.componentInstance.openCreate, 'emit');
    const fabBtn = el.querySelector('#trigger-fab-header') as HTMLButtonElement;
    fabBtn.click();
    expect(createSpy).toHaveBeenCalledWith('fab-header');
  });
});
