import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ClinicComponent } from './clinic.component';
import { ClinicService } from '../../core/clinic/clinic.service';

describe('ClinicComponent', () => {
  let component: ClinicComponent;
  let fixture: ComponentFixture<ClinicComponent>;
  let clinicService: ClinicService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicComponent],
      providers: [ClinicService]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicComponent);
    component = fixture.componentInstance;
    clinicService = TestBed.inject(ClinicService);
    fixture.detectChanges();
  });

  it('should create the clinic component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the clinic header and MTS Manchester indicator', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Estación de Emergencias & Triaje');
    expect(compiled.textContent).toContain('MTS Manchester');
  });

  it('should switch tabs between beds, detail, and admission', () => {
    component.activeTab.set('admit');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ingreso Rápido a Triaje');

    component.activeTab.set('beds');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Shock Trauma Bay');
  });

  it('should select patient on card click and switch to detail view', () => {
    const pt = clinicService.patients()[0];
    component.onSelectPatient(pt);
    expect(clinicService.selectedPatient()?.id).toBe(pt.id);
    expect(component.activeTab()).toBe('detail');
  });

  it('should submit admission and create a new patient in the triage queue', () => {
    component.newPatientName = 'Pedro Castillo';
    component.newPatientComplaint = 'Dolor torácico moderado';
    component.newPatientLevel = 'urgent';
    component.submitAdmission();

    const created = clinicService.patients().find(p => p.fullName === 'Pedro Castillo');
    expect(created).toBeTruthy();
    expect(created?.triageLevel).toBe('urgent');
    expect(component.activeTab()).toBe('detail');
  });

  it('should allow quick re-triage of a patient', () => {
    const pt = clinicService.patients()[1];
    const dummyEvent = new MouseEvent('click');
    vi.spyOn(dummyEvent, 'stopPropagation');

    component.onQuickRetriage(pt.id, 'resuscitation', dummyEvent);
    expect(dummyEvent.stopPropagation).toHaveBeenCalled();

    const updated = clinicService.patients().find(p => p.id === pt.id);
    expect(updated?.triageLevel).toBe('resuscitation');
  });
});
