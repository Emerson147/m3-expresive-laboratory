import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ModulePulseCard } from '../overview.models';
import { OverviewHeroDetailComponent } from './overview-hero-detail.component';

const MOCK_MODULES: readonly ModulePulseCard[] = [
  {
    section: 'clinic',
    title: 'Clínica & Triaje',
    route: '/clinic',
    icon: 'local_hospital',
    iconBgClass: 'bg-error-box text-on-error-box',
    headline: '6 en triaje',
    detail: 'Boxes 5/8 · Shock 2/2',
    statusLabel: '2 críticos',
    statusIcon: 'emergency',
    statusTone: 'error',
    hasAlert: true,
    alertCount: 2,
    healthPercent: 63,
    healthLabel: 'Ocupación boxes',
    healthColor: 'error'
  },
  {
    section: 'pos',
    title: 'Punto de Venta',
    route: '/pos',
    icon: 'point_of_sale',
    iconBgClass: 'bg-tertiary-box text-on-tertiary-box',
    headline: '48 tickets',
    detail: 'Caja 01 · Turno Mañana',
    statusLabel: 'SUNAT OK',
    statusIcon: 'verified',
    statusTone: 'success',
    hasAlert: false,
    alertCount: 0,
    healthPercent: 100,
    healthLabel: 'Disponibilidad carta',
    healthColor: 'tertiary'
  }
];

describe('OverviewHeroDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewHeroDetailComponent]
    }).compileComponents();
  });

  function createFixture(open: boolean, viewTransitionName: string | null = null) {
    const fixture = TestBed.createComponent(OverviewHeroDetailComponent);
    fixture.componentRef.setInput('open', open);
    fixture.componentRef.setInput('viewTransitionName', viewTransitionName);
    fixture.componentRef.setInput('completionRate', 75);
    fixture.componentRef.setInput('completedCount', 6);
    fixture.componentRef.setInput('pendingCount', 2);
    fixture.componentRef.setInput('totalActiveAlerts', 2);
    fixture.componentRef.setInput('moduleCards', MOCK_MODULES);
    fixture.detectChanges();
    return fixture;
  }

  it('does not render modal markup when closed', () => {
    const fixture = createFixture(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders 3 aurora orbs, m3-card breakdown panels, defers shadow-2xl during hero-transform, and emits close on Escape', () => {
    const fixture = createFixture(true, 'hero-transform');
    const closeSpy = vi.fn();
    fixture.componentInstance.closeRequested.subscribe(closeSpy);

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.querySelectorAll('.m3-aurora-orb').length).toBe(3);
    expect(dialog.querySelectorAll('m3-card.m3-card-outlined').length).toBe(4);
    expect(dialog.classList.contains('shadow-2xl')).toBe(false);

    fixture.componentRef.setInput('viewTransitionName', null);
    fixture.detectChanges();
    expect(dialog.classList.contains('shadow-2xl')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('emits navigateModule when clicking a module shortcut inside the executive list', () => {
    const fixture = createFixture(true);
    const navSpy = vi.fn();
    fixture.componentInstance.navigateModule.subscribe(navSpy);

    const clinicBtn = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Abrir Clínica & Triaje"]'
    ) as HTMLButtonElement;
    expect(clinicBtn).toBeTruthy();
    clinicBtn.click();

    expect(navSpy).toHaveBeenCalledWith('/clinic');
  });
});
