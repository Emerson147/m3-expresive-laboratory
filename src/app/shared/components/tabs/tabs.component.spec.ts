import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3TabItem, M3TabsComponent } from './tabs.component';

describe('M3TabsComponent', () => {
  let component: M3TabsComponent;
  let fixture: ComponentFixture<M3TabsComponent>;

  const sampleTabs: M3TabItem[] = [
    { id: 'overview', label: 'Resumen', icon: 'dashboard' },
    { id: 'specs', label: 'Especificaciones', icon: 'tune' },
    { id: 'disabled', label: 'Bloqueado', disabled: true },
    { id: 'code', label: 'Código', icon: 'code' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3TabsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3TabsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tabs', sampleTabs);
    fixture.detectChanges();
  });

  it('should render role="tablist" with roving tabindex (0 active, -1 others)', () => {
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>;

    expect(tablist).toBeTruthy();
    expect(tabs.length).toBe(4);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('tabindex')).toBe('0');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should skip disabled tabs during ArrowRight/Home/End keyboard navigation', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>;

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(component.activeTabId()).toBe('specs');

    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(component.activeTabId()).toBe('code');

    tabs[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(component.activeTabId()).toBe('overview');
  });
});
