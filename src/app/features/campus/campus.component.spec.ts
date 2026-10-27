import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampusComponent } from './campus.component';
import { CampusService } from '../../core/campus/campus.service';
import { ThemeService } from '../../core/theme/theme.service';

describe('CampusComponent', () => {
  let component: CampusComponent;
  let fixture: ComponentFixture<CampusComponent>;
  let campusService: CampusService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampusComponent],
      providers: [CampusService, ThemeService]
    }).compileComponents();

    fixture = TestBed.createComponent(CampusComponent);
    component = fixture.componentInstance;
    campusService = TestBed.inject(CampusService);
    fixture.detectChanges();
  });

  it('should create the campus component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Campus header and default to student role', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('h1');
    expect(title?.textContent).toContain('Campus Académico');
    expect(campusService.currentRole()).toBe('student');
  });

  it('should switch between student and teacher views', () => {
    campusService.switchRole('teacher');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cátedra Activa');
    expect(el.textContent).toContain('Lista de Asistencia en Vivo');

    campusService.switchRole('student');
    fixture.detectChanges();
    expect(el.textContent).toContain('Horario de Hoy');
    expect(el.textContent).toContain('Entregas & Tareas');
  });

  it('should handle student attendance toggle in teacher view', () => {
    campusService.switchRole('teacher');
    fixture.detectChanges();

    const student = campusService.attendanceRoster()[0];
    campusService.setAttendance(student.id, 'absent');
    fixture.detectChanges();

    const updated = campusService.attendanceRoster().find(s => s.id === student.id);
    expect(updated?.status).toBe('absent');
  });

  it('should handle assignment submission in student view', () => {
    const pending = campusService.assignments().find(a => a.submissionStatus === 'pending');
    expect(pending).toBeTruthy();

    if (pending) {
      campusService.submitAssignment(pending.id);
      fixture.detectChanges();
      const updated = campusService.assignments().find(a => a.id === pending.id);
      expect(updated?.submissionStatus).toBe('submitted');
    }
  });
});
