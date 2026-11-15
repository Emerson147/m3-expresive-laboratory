import { TestBed } from '@angular/core/testing';
import { StageOverlayService } from '../dialog/stage-overlay.service';
import { CampusService } from './campus.service';

describe('CampusService', () => {
  let service: CampusService;
  let stageOverlay: StageOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CampusService, StageOverlayService]
    });
    service = TestBed.inject(CampusService);
    stageOverlay = TestBed.inject(StageOverlayService);
  });

  it('should be created with student role by default', () => {
    expect(service).toBeTruthy();
    expect(service.currentRole()).toBe('student');
  });

  it('should switch role between student and teacher', () => {
    service.switchRole('teacher');
    expect(service.currentRole()).toBe('teacher');

    service.switchRole('student');
    expect(service.currentRole()).toBe('student');
  });

  it('should update student attendance status in roster', () => {
    const student = service.attendanceRoster()[0];
    expect(student.status).toBe('present');

    service.setAttendance(student.id, 'absent');
    const updated = service.attendanceRoster().find((s) => s.id === student.id);
    expect(updated?.status).toBe('absent');
  });

  it('should calculate roster summary metrics correctly and keep teacherClass synced', () => {
    const summary = service.rosterSummary();
    expect(summary.total).toBe(service.attendanceRoster().length);
    expect(summary.present + summary.late + summary.absent).toBe(summary.total);
    expect(service.teacherClass().enrolledCount).toBe(summary.total);
    expect(service.teacherClass().presentCount).toBe(summary.present);
  });

  it('should filter roster by absent status and search query', () => {
    service.setRosterFilter('absent');
    expect(service.filteredRoster().every((s) => s.status === 'absent')).toBe(true);
    expect(service.filteredRoster().length).toBe(service.rosterSummary().absent);

    service.setRosterFilter('all');
    service.setRosterSearch('2023-1094');
    expect(service.filteredRoster().length).toBe(1);
    expect(service.filteredRoster()[0].studentName).toContain('Valeria');
  });

  it('should mark all students present on batch action', () => {
    service.markAllPresent();
    expect(service.rosterSummary().present).toBe(service.attendanceRoster().length);
    expect(service.rosterSummary().absent).toBe(0);
    expect(service.toastMessage()).toContain('presentes');
  });

  it('should compute accurate student credit percentage', () => {
    expect(service.creditProgress().percent).toBe(88.8);
    expect(service.creditProgress().formattedPercent).toBe('88.8%');
    expect(service.creditProgress().remainingCredits).toBe(18);
  });

  it('should mark assignment as submitted', () => {
    const pending = service.assignments().find((a) => a.submissionStatus === 'pending');
    expect(pending).toBeTruthy();

    if (pending) {
      service.submitAssignment(pending.id);
      const updated = service.assignments().find((a) => a.id === pending.id);
      expect(updated?.submissionStatus).toBe('submitted');
    }
  });

  it('should mark grading item as reviewed with optional score', () => {
    const pendingItem = service.gradingQueue().find((g) => g.status === 'pending');
    expect(pendingItem).toBeTruthy();

    if (pendingItem) {
      service.markGradingReviewed(pendingItem.id, '19 / 20', 'Excelente análisis');
      const updated = service.gradingQueue().find((g) => g.id === pendingItem.id);
      expect(updated?.status).toBe('reviewed');
      expect(updated?.score).toBe('19 / 20');
    }
  });

  it('should publish a new announcement to official board and build CSV report', () => {
    const initialCount = service.announcements().length;
    service.publishAnnouncement({
      title: 'Práctica reprogramada',
      tag: 'Laboratorio',
      summary: 'La sesión del viernes inicia a las 17:00 en Lab 3B.',
      important: true
    });

    expect(service.announcements().length).toBe(initialCount + 1);
    expect(service.announcements()[0].title).toBe('Práctica reprogramada');

    const csv = service.buildAttendanceCsv();
    expect(csv).toContain('Codigo,Estudiante,Estado,AsistenciaGeneral,EnRiesgo');
    expect(csv).toContain('Valeria Mendoza Reyes');
  });

  it('should update focused class when selecting a schedule course', async () => {
    const initial = service.selectedClass();
    const other = service.schedule().find((c) => c.id !== initial.id);
    expect(other).toBeTruthy();

    if (other) {
      service.selectScheduleClass(other.id);
      expect(service.selectedClass().id).toBe(other.id);
      await Promise.resolve();
      expect(service.liveAnnouncement()).toContain(other.subject);
    }
  });

  it('should track trigger IDs and StageOverlay state across portaled dialogs', () => {
    service.openClassroomDialog('campus-header-classroom-btn');
    expect(service.isClassroomDialogOpen()).toBe(true);
    expect(service.isAnyDialogOpen()).toBe(true);
    expect(service.activeDialogTrigger()).toBe('campus-header-classroom-btn');
    expect(stageOverlay.isOverlayOpen()).toBe(true);

    service.closeActiveDialog();
    expect(service.isClassroomDialogOpen()).toBe(false);
    expect(service.isAnyDialogOpen()).toBe(false);
    expect(service.activeDialogTrigger()).toBeNull();
    expect(stageOverlay.isOverlayOpen()).toBe(false);
  });

  it('should open assignment modal and submit assignment with delivery note', () => {
    const pending = service.assignments().find((a) => a.submissionStatus === 'pending');
    expect(pending).toBeTruthy();

    if (pending) {
      service.openAssignmentDialog(pending, `campus-assignment-btn-${pending.id}`);
      expect(service.selectedAssignment()?.id).toBe(pending.id);
      expect(stageOverlay.isOverlayOpen()).toBe(true);

      service.submitAssignment(pending.id, 'Informe y repositorio adjuntos');
      const updated = service.assignments().find((a) => a.id === pending.id);
      expect(updated?.submissionStatus).toBe('submitted');
      expect(updated?.submittedAt).toContain('Informe y repositorio adjuntos');
      expect(service.selectedAssignment()).toBeNull();
      expect(stageOverlay.isOverlayOpen()).toBe(false);
    }
  });
});
