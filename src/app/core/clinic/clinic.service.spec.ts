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
});
