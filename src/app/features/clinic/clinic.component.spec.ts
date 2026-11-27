import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClinicService } from '../../core/clinic/clinic.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { M3CircularProgressComponent } from '../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../shared/components/progress/linear-progress.component';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { ClinicComponent } from './clinic.component';
import { ClinicAdmissionModalComponent } from './components/clinic-admission-modal.component';
import { ClinicChartModalComponent } from './components/clinic-chart-modal.component';
import { ClinicDischargeModalComponent } from './components/clinic-discharge-modal.component';
import { ClinicHistoryModalComponent } from './components/clinic-history-modal.component';

describe('ClinicComponent', () => {
  let component: ClinicComponent;
  let fixture: ComponentFixture<ClinicComponent>;
  let clinicService: ClinicService;
  let stageOverlay: StageOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicComponent);
    component = fixture.componentInstance;
    clinicService = TestBed.inject(ClinicService);
    stageOverlay = TestBed.inject(StageOverlayService);
    fixture.detectChanges();
  });

  it('should render calm clinical workstation with non-redundant KPIs, rapid bed hub, and M3 tabs', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(component).toBeTruthy();
    expect(hostEl.querySelector('h1')?.textContent).toContain('Estación de Emergencias & Triaje');
    expect(hostEl.textContent).toContain('MTS Manchester');
    expect(hostEl.textContent).toContain('NEWS2 / 20');
    expect(hostEl.textContent).toContain('Asignación Rápida de Camas');
    expect(hostEl.querySelectorAll('app-clinic-kpi-ribbon article').length).toBe(4);
    expect(hostEl.querySelectorAll('m3-card').length).toBe(0);
    expect(fixture.debugElement.queryAll(By.directive(M3SnackbarComponent)).length).toBe(1);
  });

  it('should avoid continuous wavy indicators across the clinical workbench', () => {
    const linearBars = fixture.debugElement.queryAll(By.directive(M3LinearProgressComponent));
    const circularBars = fixture.debugElement.queryAll(By.directive(M3CircularProgressComponent));

    const wavyCount =
      linearBars.filter((dbg) => (dbg.componentInstance as M3LinearProgressComponent).wavy() === true).length +
      circularBars.filter((dbg) => (dbg.componentInstance as M3CircularProgressComponent).wavy() === true).length;

    expect(wavyCount).toBe(0);
  });

  it('should open focused Chart modal with Lateral peer tabs and Forward/Backward vitals flow', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const expandBtn = hostEl.querySelector('#clinic-detail-expand-btn button') as HTMLButtonElement | null;
    expect(expandBtn).toBeTruthy();

    expandBtn?.click();
    fixture.detectChanges();

    expect(clinicService.isChartDialogOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    const chartDbg = fixture.debugElement.query(By.directive(ClinicChartModalComponent));
    const chartModal = chartDbg.componentInstance as ClinicChartModalComponent;
    expect(chartModal.activeTab()).toBe('clinical');
    expect(chartDbg.nativeElement.textContent).toContain('Checklist de Protocolo Activo');
    expect(chartDbg.nativeElement.textContent).toContain('Alergias declaradas');

    // Switch Lateral peer tab -> Monitor & Vitales (rightward unison slide)
    const vitalsTabBtn = chartDbg.nativeElement.querySelector('#clinic-chart-tab-vitals') as HTMLButtonElement | null;
    expect(vitalsTabBtn).toBeTruthy();
    vitalsTabBtn?.click();
    fixture.detectChanges();

    expect(chartModal.activeTab()).toBe('vitals');
    expect(chartDbg.nativeElement.querySelector('.clinic-anim-lateral-next')).toBeTruthy();

    // Enter Forward re-evaluation sub-view
    const reevalBtn = Array.from(chartDbg.nativeElement.querySelectorAll('button')).find((b) =>
      (b as HTMLElement).textContent?.includes('Reevaluar Vitales')
    ) as HTMLButtonElement | undefined;
    expect(reevalBtn).toBeTruthy();

    reevalBtn?.click();
    fixture.detectChanges();
    expect(chartModal.isEditingVitals()).toBe(true);
    expect(chartDbg.nativeElement.querySelector('.clinic-anim-forward')).toBeTruthy();

    chartModal.editHr.set('138');
    chartModal.editSpo2.set('88');
    chartModal.editConsciousness.set('V');
    chartModal.editVitalsNote.set('Deterioro respiratorio en sala');
    fixture.detectChanges();

    const vitalsForm = chartDbg.nativeElement.querySelector(
      'form:has(app-clinic-vitals-fields)'
    ) as HTMLFormElement | null;
    expect(vitalsForm).toBeTruthy();
    vitalsForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(clinicService.selectedPatient()?.vitals.consciousness).toBe('V');
    expect(clinicService.selectedPatient()?.vitalsHistory.length).toBe(2);
    expect(chartDbg.nativeElement.querySelector('.clinic-anim-backward')).toBeTruthy();

    // Switch Lateral peer tab backward -> Clínica & Protocolo
    const clinicalTabBtn = chartDbg.nativeElement.querySelector('#clinic-chart-tab-clinical') as HTMLButtonElement | null;
    clinicalTabBtn?.click();
    fixture.detectChanges();
    expect(chartModal.activeTab()).toBe('clinical');
    expect(chartDbg.nativeElement.querySelector('.clinic-anim-lateral-prev')).toBeTruthy();

    // Sliding curved pill track + ArrowRight / End keyboard navigation to Evolución & Órdenes + quick preset
    const tabTrack = chartDbg.nativeElement.querySelector('.clinic-chart-tab-track') as HTMLElement | null;
    expect(tabTrack).toBeTruthy();
    expect(chartDbg.nativeElement.querySelector('.clinic-chart-tab-thumb')).toBeTruthy();
    expect(vitalsTabBtn?.textContent).toContain('NEWS2');

    clinicalTabBtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(chartModal.activeTab()).toBe('orders');
    expect(chartModal.activeTabIndex()).toBe(2);

    const presetBtn = Array.from(chartDbg.nativeElement.querySelectorAll('button')).find((b) =>
      (b as HTMLElement).textContent?.includes('Estable bajo vigilancia')
    ) as HTMLButtonElement | undefined;
    expect(presetBtn).toBeTruthy();
    presetBtn?.click();
    fixture.detectChanges();
    expect(chartModal.newNoteText()).toContain('Estable bajo vigilancia');

    clinicService.closeChartDialog();
    fixture.detectChanges();
    expect(clinicService.isChartDialogOpen()).toBe(false);
  });

  it('should open focused patient Chart modal directly from Mapa Operativo de Boxes without leaving Boxes', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const boxesTab = hostEl.querySelector('#clinic-desktop-tab-boxes') as HTMLButtonElement | null;
    boxesTab?.click();
    fixture.detectChanges();

    expect(component.desktopView()).toBe('boxes');
    expect(hostEl.textContent).toContain('Shock Trauma Bay');
    expect(hostEl.textContent).toContain('Shock Trauma 01');

    const bedChartTrigger = hostEl.querySelector(
      '#clinic-bed-chart-btn-ST-01 button'
    ) as HTMLButtonElement | null;
    expect(bedChartTrigger).toBeTruthy();

    bedChartTrigger?.click();
    fixture.detectChanges();

    expect(clinicService.isChartDialogOpen()).toBe(true);
    expect(clinicService.chartDialogPatient()?.id).toBe('pt-1');
    // Crucial UX requirement: stays on Mapa de Boxes without redirecting to noisy triage queue
    expect(component.desktopView()).toBe('boxes');
  });

  it('should allow 1-click rapid bed assignment from the right Decision Hub', () => {
    const waitingPatient = clinicService.patients().find((p) => !p.bedAssignedId)!;
    clinicService.selectPatient(waitingPatient);
    fixture.detectChanges();

    const detailEl = fixture.nativeElement.querySelector('app-clinic-patient-detail') as HTMLElement;
    const quickAssignBtn = Array.from(detailEl.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Asignar Box Sugerido') || b.textContent?.includes('Shock Trauma')
    ) as HTMLButtonElement | undefined;
    expect(quickAssignBtn).toBeTruthy();

    quickAssignBtn?.click();
    fixture.detectChanges();

    expect(clinicService.selectedPatient()?.bedAssignedId).toBeTruthy();
    expect(clinicService.selectedPatient()?.status).toBe('in_observation');
  });

  it('should open native Top-Layer admission modal, validate required fields, and admit patient', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const admitTrigger = hostEl.querySelector(
      '#clinic-header-admit-btn button'
    ) as HTMLButtonElement | null;
    admitTrigger?.click();
    fixture.detectChanges();

    expect(clinicService.isAdmissionDialogOpen()).toBe(true);
    const modalDbg = fixture.debugElement.query(By.directive(ClinicAdmissionModalComponent));
    const modal = modalDbg.componentInstance as ClinicAdmissionModalComponent;
    const formEl = modalDbg.nativeElement.querySelector('form') as HTMLFormElement;
    const beforeCount = clinicService.patients().length;

    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(clinicService.patients().length).toBe(beforeCount);
    expect(modal.nameInvalid()).toBe(true);

    modal.fullName.set('Pedro Castillo');
    modal.complaint.set('Dolor torácico moderado');
    modal.spo2Input.set('90');
    modal.activeCodeType.set('code_anaphylaxis');
    fixture.detectChanges();
    expect(modalDbg.nativeElement.textContent).toContain('Riesgo Crítico');

    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const created = clinicService.patients().find((p) => p.fullName === 'Pedro Castillo');
    expect(created).toBeTruthy();
    expect(created?.activeCode?.type).toBe('code_anaphylaxis');
    expect(clinicService.isAdmissionDialogOpen()).toBe(false);
  });

  it('should open discharge dialog via Top Layer, confirm ICU transfer, inspect history, and Undo via snackbar', () => {
    const targetPatient = clinicService.selectedPatient();
    expect(targetPatient).toBeTruthy();
    if (!targetPatient) return;

    const dischargeBtn = fixture.nativeElement.querySelector(
      '#clinic-detail-discharge-btn button'
    ) as HTMLButtonElement | null;
    dischargeBtn?.click();
    fixture.detectChanges();
    expect(clinicService.isDischargeDialogOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(clinicService.isDischargeDialogOpen()).toBe(false);

    dischargeBtn?.click();
    fixture.detectChanges();
    const modalDbg = fixture.debugElement.query(By.directive(ClinicDischargeModalComponent));
    const modal = modalDbg.componentInstance as ClinicDischargeModalComponent;
    modal.disposition.set('icu');
    modal.notes.set('Pasa a cama UCI-04');
    fixture.detectChanges();

    const formEl = modalDbg.nativeElement.querySelector('form') as HTMLFormElement;
    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(clinicService.activePatients().some((p) => p.id === targetPatient.id)).toBe(false);

    const historyBtn = fixture.nativeElement.querySelector(
      '#clinic-header-history-btn button'
    ) as HTMLButtonElement | null;
    historyBtn?.click();
    fixture.detectChanges();
    expect(clinicService.isHistoryDialogOpen()).toBe(true);
    const historyDbg = fixture.debugElement.query(By.directive(ClinicHistoryModalComponent));
    expect(historyDbg.nativeElement.textContent).toContain(targetPatient.fullName);

    clinicService.closeHistoryDialog();
    fixture.detectChanges();

    const snackbarDbg = fixture.debugElement.query(By.directive(M3SnackbarComponent));
    (snackbarDbg.componentInstance as M3SnackbarComponent).onActionClick();
    fixture.detectChanges();

    expect(clinicService.activePatients().some((p) => p.id === targetPatient.id)).toBe(true);
  });

  it('should preserve semantic Manchester N1 and NEWS2 badge classes on selected queue row', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const selectedBtn = hostEl.querySelector(
      'app-clinic-patient-queue button[aria-current="true"]'
    ) as HTMLButtonElement | null;
    expect(selectedBtn).toBeTruthy();

    const spans = Array.from(selectedBtn?.querySelectorAll('span') ?? []);
    const triageBadge = spans.find(
      (s) => s.classList.contains('rounded-m3-full') && s.textContent?.includes('N1')
    );
    const newsBadge = spans.find(
      (s) => s.classList.contains('rounded-m3-full') && s.textContent?.includes('NEWS2')
    );
    const liveDot = selectedBtn?.querySelector('.clinic-live-dot');

    expect(triageBadge?.classList.contains('bg-error-box')).toBe(true);
    expect(newsBadge?.classList.contains('bg-error')).toBe(true);
    expect(liveDot?.classList.contains('bg-error')).toBe(true);

    // Semantic vital tiles + Current Box highlight in right Decision Hub, plus Fade Through on patient swap
    const detailEl = hostEl.querySelector('app-clinic-patient-detail') as HTMLElement;
    expect(detailEl.textContent).toContain('Box Actual: ST-01');
    const fcTile = Array.from(detailEl.querySelectorAll('[class*="grid-cols-4"] > div')).find((el) =>
      el.textContent?.includes('FC') && el.textContent?.includes('124')
    );
    expect(fcTile?.classList.contains('bg-warning-box')).toBe(true);

    const secondPatientBtn = hostEl.querySelectorAll('app-clinic-patient-queue button[aria-current]')[0]
      ?.parentElement?.nextElementSibling?.querySelector('button') as HTMLButtonElement | null;
    secondPatientBtn?.click();
    fixture.detectChanges();
    expect(detailEl.querySelector('.clinic-anim-fade-a')).toBeTruthy();
  });
});
