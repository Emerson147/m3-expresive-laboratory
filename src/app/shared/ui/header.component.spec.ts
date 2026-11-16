import { TestBed } from '@angular/core/testing';
import { NavChromeMode } from '../models/ui.models';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    }).compileComponents();
  });

  function setup(chromeMode: NavChromeMode = 'rail-expanded', section: 'overview' | 'pos' = 'overview') {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentSection', section);
    fixture.componentRef.setInput('chromeMode', chromeMode);
    fixture.detectChanges();
    return fixture;
  }

  it('omits duplicated command palette search, create FAB, and seed dots when Rail navigation is active', () => {
    const fixture = setup('rail-expanded', 'overview');
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('Centro de Comando');
    expect(el.querySelector('[style*="background-color"]')).toBeNull();
    expect(el.querySelector('button[aria-label="Abrir paleta de comandos (Ctrl+K)"]')).toBeNull();
    expect(el.querySelector('#trigger-fab-header')).toBeNull();
    expect(el.querySelector('button[aria-label="Alternar Modo Claro / Oscuro"]')).toBeTruthy();
  });

  it('shows command palette search trigger in compact Bar / Dock / Tunnel modes where Rail is hidden', () => {
    const fixture = setup('dock', 'overview');
    const el = fixture.nativeElement as HTMLElement;

    const paletteSpy = vi.spyOn(fixture.componentInstance.openCommandPalette, 'emit');
    const searchBtn = el.querySelector('button[aria-label="Abrir paleta de comandos (Ctrl+K)"]') as HTMLButtonElement;
    expect(searchBtn).toBeTruthy();
    searchBtn.click();
    expect(paletteSpy).toHaveBeenCalledTimes(1);
  });
});
