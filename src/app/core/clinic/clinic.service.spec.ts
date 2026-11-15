import { TestBed } from '@angular/core/testing';
import { ClinicService } from './clinic.service';

describe('ClinicService', () => {
  let service: ClinicService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicService]
    });
    service = TestBed.inject(ClinicService);
  });

  it('should be created with initial patients and beds', () => {
    expect(service).toBeTruthy();
    expect(service.patients().length).toBeGreaterThan(0);
    expect(service.beds().length).toBeGreaterThan(0);
    expect(service.selectedPatient()).toBeTruthy();
  });

  it('should compute KPI summary accurately', () => {
    const kpis = service.kpiSummary();
    expect(kpis.totalActivePatients).toBe(service.patients().length);
    expect(kpis.criticalCases).toBeGreaterThanOrEqual(1);
    expect(kpis.occupiedBeds).toBeGreaterThanOrEqual(1);
    expect(kpis.totalBeds).toBe(service.beds().length);
  });

  it('should filter patients by critical status and search query', () => {
    service.setFilter('critical');
    const criticalList = service.filteredPatients();
    expect(criticalList.every(p => p.triageLevel === 'resuscitation' || p.triageLevel === 'emergency')).toBe(true);

    service.setFilter('all');
    service.setSearchQuery('carlos');
    const searchList = service.filteredPatients();
    expect(searchList.length).toBe(1);
    expect(searchList[0].fullName).toContain('Carlos Méndez');
  });

  it('should admit a new patient and calculate ticket code', () => {
    const initialCount = service.patients().length;
    const admitted = service.admitPatient({
      fullName: 'Ana Beltrán',
      age: 29,
      gender: 'F',
      triageLevel: 'emergency',
      chiefComplaint: 'Crisis asmática severa',
      vitals: {
        heartRate: 110,
        bloodPressureSys: 120,
        bloodPressureDia: 80,
        oxygenSat: 91,
        temperature: 37.0,
        painScale: 5
      }
    });

    expect(service.patients().length).toBe(initialCount + 1);
    expect(admitted.ticketCode).toContain('TR-');
    expect(service.selectedPatient()?.fullName).toBe('Ana Beltrán');
  });

  it('should update triage level for a patient', () => {
    const pt = service.patients()[1];
    service.updateTriageLevel(pt.id, 'resuscitation');
    const updated = service.patients().find(p => p.id === pt.id);
    expect(updated?.triageLevel).toBe('resuscitation');
  });

  it('should assign a bed to a patient and update bed status', () => {
    const unassignedPatient = service.patients().find(p => !p.bedAssignedId);
    expect(unassignedPatient).toBeTruthy();
    if (!unassignedPatient) return;

    const availableBed = service.beds().find(b => b.status === 'available');
    expect(availableBed).toBeTruthy();
    if (!availableBed) return;

    service.assignBed(unassignedPatient.id, availableBed.id);

    const updatedPatient = service.patients().find(p => p.id === unassignedPatient.id);
    const updatedBed = service.beds().find(b => b.id === availableBed.id);

    expect(updatedPatient?.bedAssignedId).toBe(availableBed.id);
    expect(updatedPatient?.status).toBe('in_observation');
    expect(updatedBed?.status).toBe('occupied');
    expect(updatedBed?.patientId).toBe(unassignedPatient.id);
  });

  it('should discharge a patient and release bed to cleaning', () => {
    const patientWithBed = service.patients().find(p => !!p.bedAssignedId);
    expect(patientWithBed).toBeTruthy();
    if (!patientWithBed) return;

    const bedId = patientWithBed.bedAssignedId!;
    service.dischargePatient(patientWithBed.id);

    const updatedPatient = service.patients().find(p => p.id === patientWithBed.id);
    const updatedBed = service.beds().find(b => b.id === bedId);

    expect(updatedPatient?.status).toBe('discharged');
    expect(updatedPatient?.bedAssignedId).toBeUndefined();
    expect(updatedBed?.status).toBe('cleaning');
    expect(updatedBed?.patientId).toBeNull();
  });

  it('should compute NEWS2 score and detect high risk triggers', () => {
    const criticalVitals = {
      heartRate: 135,
      bloodPressureSys: 85,
      bloodPressureDia: 50,
      oxygenSat: 88,
      temperature: 39.4,
      painScale: 9
    };
    const news2 = ClinicService.computeNews2(criticalVitals);
    expect(news2.score).toBeGreaterThanOrEqual(7);
    expect(news2.riskLevel).toBe('high');
    expect(news2.triggers.length).toBeGreaterThanOrEqual(2);

    const normalVitals = {
      heartRate: 72,
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      oxygenSat: 99,
      temperature: 36.6,
      painScale: 0
    };
    const normalNews2 = ClinicService.computeNews2(normalVitals);
    expect(normalNews2.score).toBe(0);
    expect(normalNews2.riskLevel).toBe('low');
  });

  it('should assign a bed immediately via 1-click Shock Trauma action', () => {
    const unassignedPatient = service.patients().find(p => !p.bedAssignedId);
    expect(unassignedPatient).toBeTruthy();
    if (!unassignedPatient) return;

    const assigned = service.assignImmediateShockTrauma(unassignedPatient.id);
    expect(assigned).toBe(true);

    const updated = service.patients().find(p => p.id === unassignedPatient.id);
    expect(updated?.bedAssignedId).toBeTruthy();
    expect(updated?.status).toBe('in_observation');
  });

  it('should keep selectedPatient computed state synchronized after triage and bed updates', () => {
    const pt = service.patients().find(p => !p.bedAssignedId);
    expect(pt).toBeTruthy();
    if (!pt) return;

    service.selectPatient(pt);
    expect(service.selectedPatient()?.id).toBe(pt.id);

    service.updateTriageLevel(pt.id, 'resuscitation');
    expect(service.selectedPatient()?.triageLevel).toBe('resuscitation');

    const availableBed = service.beds().find(b => b.status === 'available');
    expect(availableBed).toBeTruthy();
    if (!availableBed) return;

    service.assignBed(pt.id, availableBed.id);
    expect(service.selectedPatient()?.bedAssignedId).toBe(availableBed.id);
    expect(service.selectedPatient()?.status).toBe('in_observation');
  });

  it('should notify cleanly and return false when all beds are occupied', () => {
    service.beds().forEach(b => service.setBedStatus(b.id, 'occupied'));
    const waiting = service.patients().find(p => !p.bedAssignedId);
    expect(waiting).toBeTruthy();
    if (!waiting) return;

    const assigned = service.assignImmediateShockTrauma(waiting.id);
    expect(assigned).toBe(false);
    expect(service.toastMessage()).toContain('No hay camas libres');
  });

  it('should clear patient bed assignment when bed transitions to cleaning directly', () => {
    const patientWithBed = service.patients().find(p => !!p.bedAssignedId);
    expect(patientWithBed).toBeTruthy();
    if (!patientWithBed) return;

    const bedId = patientWithBed.bedAssignedId!;
    service.setBedStatus(bedId, 'cleaning');

    const updatedPatient = service.patients().find(p => p.id === patientWithBed.id);
    expect(updatedPatient?.bedAssignedId).toBeUndefined();
    expect(updatedPatient?.status).toBe('waiting_bed');
  });

  it('should manage portaled admission dialog open and close states', () => {
    expect(service.isAdmissionDialogOpen()).toBe(false);

    service.openAdmissionDialog('clinic-header-admit-btn');
    expect(service.isAdmissionDialogOpen()).toBe(true);
    expect(service.activeDialogTrigger()).toBe('clinic-header-admit-btn');

    service.closeAdmissionDialog();
    expect(service.isAdmissionDialogOpen()).toBe(false);
    expect(service.activeDialogTrigger()).toBeNull();
  });

  it('should initialize active emergency code when admitting patient with activeCodeType', () => {
    const admitted = service.admitPatient({
      fullName: 'Lucía Paredes',
      age: 62,
      gender: 'F',
      triageLevel: 'resuscitation',
      chiefComplaint: 'Déficit neurológico súbito',
      activeCodeType: 'code_stroke',
      vitals: {
        heartRate: 98,
        bloodPressureSys: 175,
        bloodPressureDia: 100,
        oxygenSat: 96,
        temperature: 36.8,
        painScale: 2
      }
    });

    expect(admitted.activeCode).toBeTruthy();
    expect(admitted.activeCode?.type).toBe('code_stroke');
    expect(admitted.activeCode?.title).toBe('Código Ictus (ACV)');
    expect(admitted.activeCode?.targetMinutes).toBe(45);
    expect(admitted.activeCode?.elapsedMinutes).toBe(0);
    expect(admitted.activeCode?.remainingMinutes).toBe(45);
  });

  it('should recalculate NEWS2 score live when updating patient vitals', () => {
    const stablePatient = service.patients().find(p => p.news2.riskLevel === 'low');
    expect(stablePatient).toBeTruthy();
    if (!stablePatient) return;

    service.selectPatient(stablePatient);
    service.updatePatientVitals(stablePatient.id, {
      heartRate: 138,
      bloodPressureSys: 82,
      bloodPressureDia: 48,
      oxygenSat: 87,
      temperature: 39.5,
      painScale: 9
    });

    const updated = service.selectedPatient();
    expect(updated?.id).toBe(stablePatient.id);
    expect(updated?.vitals.oxygenSat).toBe(87);
    expect(updated?.news2.riskLevel).toBe('high');
    expect(updated?.news2.score).toBeGreaterThanOrEqual(7);
  });

  it('should manage discharge dialog state and handle ICU transfer disposition', () => {
    const patientWithBed = service.patients().find(p => !!p.bedAssignedId);
    expect(patientWithBed).toBeTruthy();
    if (!patientWithBed) return;

    const bedId = patientWithBed.bedAssignedId!;
    service.openDischargeDialog(patientWithBed.id);
    expect(service.isDischargeDialogOpen()).toBe(true);
    expect(service.dischargeDialogPatient()?.id).toBe(patientWithBed.id);

    service.dischargePatient(patientWithBed.id, 'icu', 'Derivado a UCI Coronaria');

    const updatedPatient = service.patients().find(p => p.id === patientWithBed.id);
    const updatedBed = service.beds().find(b => b.id === bedId);

    expect(updatedPatient?.status).toBe('transferred_icu');
    expect(updatedPatient?.notes).toContain('Derivado a UCI Coronaria');
    expect(service.activePatients().some(p => p.id === patientWithBed.id)).toBe(false);
    expect(updatedBed?.status).toBe('cleaning');
    expect(service.isDischargeDialogOpen()).toBe(false);
  });
});
