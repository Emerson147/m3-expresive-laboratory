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

  it('keeps native <dialog> closed when open is false', () => {
    const fixture = createFixture(false);
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog.m3-dialog') as HTMLDialogElement;
    expect(dialog).toBeTruthy();
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('renders native fullscreen dialog with 3 aurora orbs, m3-card breakdown panels, defers shadow during hero-transform, and emits close on cancel', () => {
    const fixture = createFixture(true, 'hero-transform');
    const closeSpy = vi.fn();
    fixture.componentInstance.closeRequested.subscribe(closeSpy);

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog.m3-dialog') as HTMLDialogElement;
    expect(dialog).toBeTruthy();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.classList.contains('m3-dialog-fullscreen')).toBe(true);
    expect(dialog.classList.contains('is-vt-managed')).toBe(true);
    expect(dialog.querySelectorAll('.m3-aurora-orb').length).toBe(3);
    expect(dialog.querySelectorAll('m3-card.m3-card-outlined').length).toBe(4);

    fixture.componentRef.setInput('viewTransitionName', null);
    fixture.detectChanges();
    expect(dialog.classList.contains('is-vt-managed')).toBe(false);

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('filters executive station list via connected <m3-button-group> with badges', () => {
    const fixture = createFixture(true);
    const el = fixture.nativeElement as HTMLElement;

    const filterBtns = Array.from(el.querySelectorAll('m3-button-group button')) as HTMLButtonElement[];
    expect(filterBtns.length).toBe(3);
    expect(el.querySelectorAll('ul li').length).toBe(2);

    const alertsBtn = filterBtns.find(btn => btn.textContent?.includes('Alertas'));
    const stableBtn = filterBtns.find(btn => btn.textContent?.includes('Estables'));
    const allBtn = filterBtns.find(btn => btn.textContent?.includes('Todas'));

    alertsBtn!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('ul li').length).toBe(1);
    expect(el.querySelector('ul')?.textContent).toContain('Clínica & Triaje');

    stableBtn!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('ul li').length).toBe(1);
    expect(el.querySelector('ul')?.textContent).toContain('Punto de Venta');

    allBtn!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('ul li').length).toBe(2);
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
