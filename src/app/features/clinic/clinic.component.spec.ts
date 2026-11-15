import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClinicService } from '../../core/clinic/clinic.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { M3CircularProgressComponent } from '../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../shared/components/progress/linear-progress.component';
import { ClinicComponent } from './clinic.component';
import { ClinicAdmissionModalComponent } from './components/clinic-admission-modal.component';
import { ClinicDischargeModalComponent } from './components/clinic-discharge-modal.component';
import { ClinicPatientDetailComponent } from './components/clinic-patient-detail.component';

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

  it('should create modern M3 Expressive clinic workbench without wireframe m3-card boxes', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(component).toBeTruthy();
    expect(hostEl.querySelector('h1')?.textContent).toContain('Estación de Emergencias & Triaje');
    expect(hostEl.textContent).toContain('MTS Manchester');
    expect(hostEl.querySelectorAll('m3-card').length).toBe(0);
  });

  it('should avoid continuous wavy indicators and render active emergency code details', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const linearBars = fixture.debugElement.queryAll(By.directive(M3LinearProgressComponent));
    const circularBars = fixture.debugElement.queryAll(By.directive(M3CircularProgressComponent));

    const wavyCount =
      linearBars.filter((dbg) => (dbg.componentInstance as M3LinearProgressComponent).wavy() === true).length +
      circularBars.filter((dbg) => (dbg.componentInstance as M3CircularProgressComponent).wavy() === true).length;

    expect(wavyCount).toBe(0);
    expect(hostEl.textContent).toContain('NEWS2');
    expect(hostEl.textContent).toContain('Código Infarto');
  });

  it('should filter triage queue from interactive KPI ribbon including in_bed filter', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const kpiButtons = Array.from(
      hostEl.querySelectorAll('app-clinic-kpi-ribbon button')
    ) as HTMLButtonElement[];

    expect(kpiButtons.length).toBe(5);

    const criticalKpi = kpiButtons.find((btn) => btn.textContent?.includes('Críticos N1/N2'));
    criticalKpi?.click();
    fixture.detectChanges();

    expect(clinicService.activeFilter()).toBe('critical');
    expect(
      clinicService.filteredPatients().every(
        (p) => p.triageLevel === 'resuscitation' || p.triageLevel === 'emergency'
      )
    ).toBe(true);

    const boxesKpi = kpiButtons.find((btn) => btn.textContent?.includes('Boxes Ocupados'));
    boxesKpi?.click();
    fixture.detectChanges();

    expect(clinicService.activeFilter()).toBe('in_bed');
    expect(clinicService.filteredPatients().every((p) => !!p.bedAssignedId)).toBe(true);
  });

  it('should switch WAI-ARIA desktop and mobile tabs with keyboard navigation', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const desktopTabs = Array.from(
      hostEl.querySelectorAll('aside [role="tablist"] [role="tab"]')
    ) as HTMLButtonElement[];

    expect(desktopTabs.length).toBe(2);
    expect(component.activeTab()).toBe('detail');

    desktopTabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.activeTab()).toBe('beds');
    expect(hostEl.textContent).toContain('Shock Trauma Bay');
    expect(hostEl.textContent).toContain('Tópico & Procedimientos');

    const mobileTabs = Array.from(
      hostEl.querySelectorAll('nav [role="tablist"] [role="tab"]')
    ) as HTMLButtonElement[];
    expect(mobileTabs.length).toBe(3);

    mobileTabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.mobileTab()).toBe('detail');

    mobileTabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(component.mobileTab()).toBe('queue');
  });

  it('should select patient on single click, update chart synchronously on retriage, and switch to detail', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    component.activeTab.set('beds');
    fixture.detectChanges();

    const patientButtons = Array.from(
      hostEl.querySelectorAll('app-clinic-patient-queue ul button')
    ) as HTMLButtonElement[];
    expect(patientButtons.length).toBeGreaterThan(1);

    patientButtons[1].click();
    fixture.detectChanges();

    const secondPatient = clinicService.filteredPatients()[1];
    expect(clinicService.selectedPatient()?.id).toBe(secondPatient.id);
    expect(component.activeTab()).toBe('detail');

    const retriageBtns = Array.from(
      hostEl.querySelectorAll('app-clinic-patient-detail [aria-label="Reclasificar nivel de triaje Manchester"] button')
    ) as HTMLButtonElement[];
    expect(retriageBtns.length).toBe(5);

    retriageBtns[0].click();
    fixture.detectChanges();
    expect(clinicService.selectedPatient()?.triageLevel).toBe('resuscitation');
    expect(hostEl.querySelector('app-clinic-patient-detail h3')?.textContent).toContain(
      secondPatient.fullName
    );
  });

  it('should open portaled admission modal, validate required fields, compute live NEWS2, and admit patient', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const admitTrigger = hostEl.querySelector(
      '#clinic-header-admit-btn button'
    ) as HTMLButtonElement | null;
    expect(admitTrigger).toBeTruthy();

    admitTrigger?.click();
    fixture.detectChanges();

    expect(clinicService.isAdmissionDialogOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    const modalDbg = fixture.debugElement.query(By.directive(ClinicAdmissionModalComponent));
    expect(modalDbg).toBeTruthy();
    const modal = modalDbg.componentInstance as ClinicAdmissionModalComponent;
    const formEl = modalDbg.nativeElement.querySelector('form') as HTMLFormElement;
    const beforeCount = clinicService.patients().length;

    // Invalid submit stays open and activates field errors
    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(clinicService.patients().length).toBe(beforeCount);
    expect(modal.nameInvalid()).toBe(true);
    expect(modal.complaintInvalid()).toBe(true);

    // Fill patient details + critical SpO2 for live NEWS2 preview update
    modal.fullName.set('Pedro Castillo');
    modal.complaint.set('Dolor torácico moderado');
    modal.triageLevel.set('urgent');
    modal.spo2Input.set('90');
    fixture.detectChanges();
    expect(modalDbg.nativeElement.textContent).toContain('Riesgo Crítico');

    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const created = clinicService.patients().find((p) => p.fullName === 'Pedro Castillo');
    expect(created).toBeTruthy();
    expect(created?.triageLevel).toBe('urgent');
    expect(created?.vitals.oxygenSat).toBe(90);
    expect(clinicService.isAdmissionDialogOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
    expect(component.activeTab()).toBe('detail');
  });

  it('should close portaled admission modal cleanly on Escape', () => {
    clinicService.openAdmissionDialog('clinic-header-admit-btn');
    fixture.detectChanges();
    expect(clinicService.isAdmissionDialogOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(clinicService.isAdmissionDialogOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
  });

  it('should assign immediate bed from patient detail and enable cleaning procedure beds uniformly', () => {
    const unassignedCritical = clinicService
      .patients()
      .find((p) => !p.bedAssignedId && (p.triageLevel === 'emergency' || p.triageLevel === 'resuscitation'));
    expect(unassignedCritical).toBeTruthy();
    if (!unassignedCritical) return;

    clinicService.selectPatient(unassignedCritical);
    component.activeTab.set('detail');
    fixture.detectChanges();

    const detailEl = fixture.nativeElement.querySelector('app-clinic-patient-detail') as HTMLElement;
    const assignBtn = Array.from(detailEl.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Asignar')
    ) as HTMLButtonElement | undefined;
    expect(assignBtn).toBeTruthy();

    assignBtn?.click();
    fixture.detectChanges();

    const updated = clinicService.patients().find((p) => p.id === unassignedCritical.id);
    expect(updated?.bedAssignedId).toBeTruthy();
    expect(updated?.status).toBe('in_observation');

    // Procedure beds should support cleaning -> available transition uniformly
    clinicService.setBedStatus('PR-01', 'cleaning');
    component.activeTab.set('beds');
    fixture.detectChanges();

    const bedsMatrixEl = fixture.nativeElement.querySelector('app-clinic-beds-matrix') as HTMLElement;
    const enableButtons = Array.from(bedsMatrixEl.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Habilitar Box')
    );
    expect(enableButtons.length).toBeGreaterThanOrEqual(2); // OB-03 + PR-01
  });

  it('should keep urgency badge and NEWS2 semantic colors visible when a patient card is selected', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const selectedBtn = hostEl.querySelector(
      'app-clinic-patient-queue button[aria-current="true"]'
    ) as HTMLButtonElement | null;
    expect(selectedBtn).toBeTruthy();

    const spans = Array.from(selectedBtn?.querySelectorAll('span') ?? []);
    const triageBadge = spans.find(
      (s) => s.classList.contains('rounded-m3-full') && s.textContent?.includes('N1 · Resucitación')
    );
    const newsBadge = spans.find(
      (s) => s.classList.contains('rounded-m3-full') && s.textContent?.includes('NEWS2')
    );
    const liveDot = selectedBtn?.querySelector('.clinic-live-dot');

    expect(triageBadge?.classList.contains('bg-error-box')).toBe(true);
    expect(triageBadge?.classList.contains('bg-primary')).toBe(false);
    expect(newsBadge?.classList.contains('bg-error')).toBe(true);
    expect(newsBadge?.classList.contains('bg-primary')).toBe(false);
    expect(liveDot?.classList.contains('bg-error')).toBe(true);
  });

  it('should display sanitization subtitle on cleaning beds inside boxes matrix', () => {
    component.activeTab.set('beds');
    fixture.detectChanges();

    const bedsMatrixEl = fixture.nativeElement.querySelector('app-clinic-beds-matrix') as HTMLElement;
    expect(bedsMatrixEl.textContent).toContain('En sanitización — pendiente de habilitación');
    expect(bedsMatrixEl.textContent).not.toContain('Lista para ingreso crítico');
  });

  it('should support optional emergency code activation from admission modal', () => {
    clinicService.openAdmissionDialog('clinic-header-admit-btn');
    fixture.detectChanges();

    const modalDbg = fixture.debugElement.query(By.directive(ClinicAdmissionModalComponent));
    const modal = modalDbg.componentInstance as ClinicAdmissionModalComponent;
    modal.fullName.set('Mateo Salazar');
    modal.complaint.set('Fiebre alta e hipotensión');
    modal.triageLevel.set('emergency');
    modal.activeCodeType.set('code_sepsis');
    fixture.detectChanges();

    const formEl = modalDbg.nativeElement.querySelector('form') as HTMLFormElement;
    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const created = clinicService.patients().find((p) => p.fullName === 'Mateo Salazar');
    expect(created?.activeCode?.type).toBe('code_sepsis');
    expect(created?.activeCode?.title).toContain('Sepsis');
  });

  it('should allow live vitals re-evaluation inside patient detail', () => {
    const stablePatient = clinicService.patients().find((p) => p.news2.riskLevel === 'low');
    expect(stablePatient).toBeTruthy();
    if (!stablePatient) return;

    clinicService.selectPatient(stablePatient);
    component.activeTab.set('detail');
    fixture.detectChanges();

    const detailDbg = fixture.debugElement.query(By.directive(ClinicPatientDetailComponent));
    const detail = detailDbg.componentInstance as ClinicPatientDetailComponent;
    const detailEl = detailDbg.nativeElement as HTMLElement;

    const reevalBtn = Array.from(detailEl.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reevaluar')
    ) as HTMLButtonElement | undefined;
    expect(reevalBtn).toBeTruthy();
    reevalBtn?.click();
    fixture.detectChanges();

    expect(detail.isEditingVitals()).toBe(true);
    detail.editHr.set('136');
    detail.editSpo2.set('87');
    fixture.detectChanges();

    expect(detailEl.textContent).toContain('NEWS2 proyectado');
    expect(detailEl.textContent).toContain('Riesgo Crítico');

    const vitalsForm = detailEl.querySelector('form') as HTMLFormElement;
    vitalsForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(detail.isEditingVitals()).toBe(false);
    expect(clinicService.selectedPatient()?.news2.riskLevel).toBe('high');
    expect(clinicService.selectedPatient()?.vitals.oxygenSat).toBe(87);
  });

  it('should require confirmation via portaled discharge modal and process transfer disposition', () => {
    const targetPatient = clinicService.selectedPatient();
    expect(targetPatient).toBeTruthy();
    if (!targetPatient) return;

    const dischargeBtn = fixture.nativeElement.querySelector(
      '#clinic-detail-discharge-btn button'
    ) as HTMLButtonElement | null;
    expect(dischargeBtn).toBeTruthy();

    dischargeBtn?.click();
    fixture.detectChanges();

    expect(clinicService.isDischargeDialogOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);
    expect(clinicService.activePatients().some((p) => p.id === targetPatient.id)).toBe(true);

    // Escape closes confirmation safely without discharging
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(clinicService.isDischargeDialogOpen()).toBe(false);
    expect(clinicService.activePatients().some((p) => p.id === targetPatient.id)).toBe(true);

    // Confirm ICU transfer via modal form
    dischargeBtn?.click();
    fixture.detectChanges();

    const modalDbg = fixture.debugElement.query(By.directive(ClinicDischargeModalComponent));
    expect(modalDbg).toBeTruthy();
    const modal = modalDbg.componentInstance as ClinicDischargeModalComponent;
    modal.disposition.set('icu');
    modal.notes.set('Pasa a cama UCI-04');
    fixture.detectChanges();

    const formEl = modalDbg.nativeElement.querySelector('form') as HTMLFormElement;
    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const dischargedRecord = clinicService.patients().find((p) => p.id === targetPatient.id);
    expect(dischargedRecord?.status).toBe('transferred_icu');
    expect(dischargedRecord?.notes).toContain('Pasa a cama UCI-04');
    expect(clinicService.activePatients().some((p) => p.id === targetPatient.id)).toBe(false);
    expect(clinicService.isDischargeDialogOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
  });
});
