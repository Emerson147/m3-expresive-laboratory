import { TestBed } from '@angular/core/testing';
import { ClinicService, isPatientSlaBreached } from './clinic.service';

describe('ClinicService', () => {
  let service: ClinicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicService]
    });
    service = TestBed.inject(ClinicService);
  });

  it('should be created with initial patients, anaphylaxis preset fix, and beds', () => {
    expect(service).toBeTruthy();
    expect(service.patients().length).toBeGreaterThan(0);
    expect(service.beds().length).toBeGreaterThan(0);
    expect(service.selectedPatient()).toBeTruthy();

    const anaphylaxisPt = service.patients().find((p) => p.id === 'pt-2');
    expect(anaphylaxisPt?.activeCode?.type).toBe('code_anaphylaxis');
    expect(anaphylaxisPt?.activeCode?.steps.length).toBeGreaterThan(0);
  });

  it('should compute analytical KPI summary including SLA breaches and active codes', () => {
    const kpis = service.kpiSummary();
    expect(kpis.totalActivePatients).toBe(service.patients().length);
    expect(kpis.criticalCases).toBeGreaterThanOrEqual(1);
    expect(kpis.activeCodesCount).toBeGreaterThanOrEqual(3);
    expect(kpis.slaBreachCount).toBeGreaterThanOrEqual(1);
    expect(kpis.occupiedBeds + kpis.availableBeds + kpis.cleaningBeds).toBe(kpis.totalBeds);
  });

  it('should filter patients by clinical status, SLA breach, and search query including allergies', () => {
    service.setFilter('critical');
    const criticalList = service.filteredPatients();
    expect(
      criticalList.every((p) => p.triageLevel === 'resuscitation' || p.triageLevel === 'emergency')
    ).toBe(true);

    service.setFilter('sla_breach');
    const breachedList = service.filteredPatients();
    expect(breachedList.length).toBeGreaterThanOrEqual(1);
    expect(breachedList.every((p) => isPatientSlaBreached(p))).toBe(true);

    service.setFilter('all');
    service.setSearchQuery('mariscos');
    const allergySearch = service.filteredPatients();
    expect(allergySearch.length).toBe(1);
    expect(allergySearch[0].fullName).toBe('Lucía Morales');
  });

  it('should sort patients clinically (N1 -> N5) and by SLA urgency', () => {
    service.setSortMode('clinical');
    const clinicalOrder = service.filteredPatients();
    expect(clinicalOrder[0].triageLevel).toBe('resuscitation');

    service.setSortMode('sla_wait');
    const slaOrder = service.filteredPatients();
    expect(isPatientSlaBreached(slaOrder[0])).toBe(true);
  });

  it('should admit a new patient and compute full NEWS2 / 20 score', () => {
    const initialCount = service.patients().length;
    const admitted = service.admitPatient({
      fullName: 'Ana Beltrán',
      age: 29,
      gender: 'F',
      triageLevel: 'emergency',
      chiefComplaint: 'Crisis asmática severa',
      vitals: {
        heartRate: 110,
        respRate: 26,
        bloodPressureSys: 120,
        bloodPressureDia: 80,
        oxygenSat: 91,
        supplementalO2: true,
        temperature: 37.0,
        consciousness: 'A',
        painScale: 5
      }
    });

    expect(service.patients().length).toBe(initialCount + 1);
    expect(admitted.ticketCode).toContain('TR-');
    expect(admitted.news2.score).toBe(9);
    expect(admitted.news2.riskLevel).toBe('high');
    expect(service.selectedPatient()?.fullName).toBe('Ana Beltrán');
  });

  it('should compute full 7-parameter NEWS2 / 20 score including respiration, O2, and ACVPU', () => {
    const extremeVitals = {
      heartRate: 135,
      respRate: 26,
      bloodPressureSys: 85,
      bloodPressureDia: 50,
      oxygenSat: 88,
      supplementalO2: true,
      temperature: 34.8,
      consciousness: 'V' as const,
      painScale: 9
    };
    const extremeNews2 = ClinicService.computeNews2(extremeVitals);
    expect(extremeNews2.score).toBe(20);
    expect(extremeNews2.riskLevel).toBe('high');
    expect(extremeNews2.triggers.length).toBeGreaterThanOrEqual(5);

    const normalVitals = {
      heartRate: 72,
      respRate: 16,
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      oxygenSat: 99,
      supplementalO2: false,
      temperature: 36.6,
      consciousness: 'A' as const,
      painScale: 0
    };
    const normalNews2 = ClinicService.computeNews2(normalVitals);
    expect(normalNews2.score).toBe(0);
    expect(normalNews2.riskLevel).toBe('low');
  });

  it('should toggle active emergency protocol checklist steps, clinical notes, and allergies', () => {
    const pt = service.patients()[0];
    const stepId = pt.activeCode?.steps[0].id;
    expect(stepId).toBeTruthy();
    if (!stepId) return;

    const initialDone = pt.activeCode!.steps[0].completed;
    service.toggleProtocolStep(pt.id, stepId);
    expect(service.selectedPatient()?.activeCode?.steps[0].completed).toBe(!initialDone);

    service.addClinicalNote(pt.id, 'Control de troponina en 60 minutos', 'order');
    expect(service.selectedPatient()?.clinicalLog[0].text).toContain('troponina');

    service.addAllergy(pt.id, 'Yodo');
    expect(service.selectedPatient()?.allergies).toContain('Yodo');
    service.removeAllergy(pt.id, 'Yodo');
    expect(service.selectedPatient()?.allergies).not.toContain('Yodo');
  });

  it('should assign a bed, record discharge history, and restore via undoLastAction()', () => {
    const patientWithBed = service.patients().find((p) => !!p.bedAssignedId);
    expect(patientWithBed).toBeTruthy();
    if (!patientWithBed) return;

    const bedId = patientWithBed.bedAssignedId!;
    service.dischargePatient(patientWithBed.id, 'icu', 'Derivado a UCI Coronaria');

    expect(service.activePatients().some((p) => p.id === patientWithBed.id)).toBe(false);
    expect(service.dischargeHistory().length).toBe(1);
    expect(service.beds().find((b) => b.id === bedId)?.status).toBe('cleaning');
    expect(service.canUndoLastAction()).toBe(true);

    service.undoLastAction();
    expect(service.activePatients().some((p) => p.id === patientWithBed.id)).toBe(true);
    expect(service.dischargeHistory().length).toBe(0);
    expect(service.beds().find((b) => b.id === bedId)?.status).toBe('occupied');
    expect(service.canUndoLastAction()).toBe(false);
  });

  it('should record vitals history snapshots when updating patient vitals', () => {
    const stablePatient = service.patients().find((p) => p.news2.riskLevel === 'low');
    expect(stablePatient).toBeTruthy();
    if (!stablePatient) return;

    service.selectPatient(stablePatient);
    const initialHistoryLen = stablePatient.vitalsHistory.length;

    service.updatePatientVitals(
      stablePatient.id,
      {
        heartRate: 138,
        respRate: 25,
        bloodPressureSys: 82,
        bloodPressureDia: 48,
        oxygenSat: 87,
        supplementalO2: true,
        temperature: 39.5,
        consciousness: 'C',
        painScale: 9
      },
      'Desaturación súbita en sala'
    );

    const updated = service.selectedPatient();
    expect(updated?.vitalsHistory.length).toBe(initialHistoryLen + 1);
    expect(updated?.news2.riskLevel).toBe('high');
    expect(updated?.clinicalLog[0].text).toContain('Desaturación súbita');
  });

  it('should coordinate strict single-owner dialogMorphOwner signals for modals', () => {
    expect(service.isAnyDialogOpen()).toBe(false);
    expect(service.dialogMorphOwner()).toBeNull();

    service.openAdmissionDialog('clinic-header-admit-btn');
    expect(service.isAdmissionDialogOpen()).toBe(true);
    expect(service.activeDialogTrigger()).toBe('clinic-header-admit-btn');
    expect(service.dialogMorphOwner()).toBeNull();

    service.closeAdmissionDialog();
    expect(service.isAdmissionDialogOpen()).toBe(false);
    expect(service.activeDialogTrigger()).toBeNull();

    // Chart modal -> Discharge modal transition clears stale stage origin safely
    service.openChartDialog('pt-1', 'clinic-bed-chart-btn-ST-01');
    expect(service.isChartDialogOpen()).toBe(true);
    expect(service.chartDialogPatient()?.id).toBe('pt-1');
    expect(service.activeDialogTrigger()).toBe('clinic-bed-chart-btn-ST-01');

    service.openDischargeDialog('pt-1', null);
    expect(service.isChartDialogOpen()).toBe(false);
    expect(service.isDischargeDialogOpen()).toBe(true);
    expect(service.activeDialogTrigger()).toBeNull();

    service.closeDischargeDialog();
    expect(service.isDischargeDialogOpen()).toBe(false);
  });

  it('should advance waiting times and active code windows on guard clock tick', () => {
    const pt = service.patients().find((p) => p.id === 'pt-1')!;
    const beforeWait = pt.waitingMinutes;
    const beforeRemaining = pt.activeCode!.remainingMinutes;

    service.advanceGuardMinutes(3);

    const after = service.patients().find((p) => p.id === 'pt-1')!;
    expect(after.waitingMinutes).toBe(beforeWait + 3);
    expect(after.activeCode!.remainingMinutes).toBe(beforeRemaining - 3);
  });

  it('should assign immediate bed or report unavailable cleanly', () => {
    service.beds().forEach((b) => service.setBedStatus(b.id, 'occupied'));
    const waiting = service.patients().find((p) => !p.bedAssignedId);
    expect(waiting).toBeTruthy();
    if (!waiting) return;

    expect(service.assignImmediateShockTrauma(waiting.id)).toBe(false);
    expect(service.toastMessage()).toContain('No hay camas libres');
  });
});
