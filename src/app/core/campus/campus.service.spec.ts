import { TestBed } from '@angular/core/testing';
import { CampusService } from './campus.service';

describe('CampusService', () => {
  let service: CampusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CampusService]
    });
    service = TestBed.inject(CampusService);
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
    const updated = service.attendanceRoster().find(s => s.id === student.id);
    expect(updated?.status).toBe('absent');
  });

  it('should calculate roster summary metrics correctly', () => {
    const summary = service.rosterSummary();
    expect(summary.total).toBe(service.attendanceRoster().length);
    expect(summary.present + summary.late + summary.absent).toBe(summary.total);
  });

  it('should mark assignment as submitted', () => {
    const pending = service.assignments().find(a => a.submissionStatus === 'pending');
    expect(pending).toBeTruthy();

    if (pending) {
      service.submitAssignment(pending.id);
      const updated = service.assignments().find(a => a.id === pending.id);
      expect(updated?.submissionStatus).toBe('submitted');
    }
  });

  it('should mark grading item as reviewed', () => {
    const pendingItem = service.gradingQueue().find(g => g.status === 'pending');
    expect(pendingItem).toBeTruthy();

    if (pendingItem) {
      service.markGradingReviewed(pendingItem.id);
      const updated = service.gradingQueue().find(g => g.id === pendingItem.id);
      expect(updated?.status).toBe('reviewed');
    }
  });
});
