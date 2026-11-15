export type CampusRole = 'student' | 'teacher';

export type SubjectCategory = 'stem' | 'humanities' | 'arts' | 'sports';

export type AttendanceStatus = 'present' | 'late' | 'absent';

export type RosterFilter = 'all' | AttendanceStatus | 'atRisk';

export type AssignmentFilter = 'all' | 'pending';

export interface ClassScheduleItem {
  id: string;
  subject: string;
  code: string;
  category: SubjectCategory;
  teacherName: string;
  room: string;
  timeRange: string;
  isActiveNow: boolean;
  progressPercent: number;
  remainingMinutes: number;
  classroomLink: string;
  syllabusTopic: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  urgency: 'urgent' | 'upcoming' | 'graded';
  score?: string;
  submittedAt?: string;
  rubricHint?: string;
  submissionStatus: 'pending' | 'submitted' | 'graded';
}

export interface StudentGradeMetric {
  currentGpa: number;
  approvedCredits: number;
  totalCredits: number;
  attendanceRate: number;
  classStanding: string;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  date: string;
  tag: string;
  important: boolean;
  acknowledged?: boolean;
}

export interface TeacherClass {
  id: string;
  subject: string;
  room: string;
  timeRange: string;
  enrolledCount: number;
  presentCount: number;
  pendingGradingCount: number;
}

export interface StudentAttendanceRecord {
  id: string;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
  overallAttendance: number;
  atRisk: boolean;
}

export interface TeacherGradingItem {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  subject: string;
  status: 'pending' | 'reviewed';
  score?: string;
  feedback?: string;
}

export interface CreateAnnouncementDto {
  title: string;
  summary: string;
  tag: string;
  important: boolean;
}

export interface SubmitGradeDto {
  gradingId: string;
  score: string;
  feedback: string;
}

export interface SubmitAssignmentDto {
  assignmentId: string;
  note?: string;
}
