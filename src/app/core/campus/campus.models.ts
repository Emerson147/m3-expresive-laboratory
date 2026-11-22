export type CampusRole = 'student' | 'teacher';

export type SubjectCategory = 'stem' | 'humanities' | 'arts' | 'sports';

export type AttendanceStatus = 'present' | 'late' | 'absent';

export type RosterFilter = 'all' | AttendanceStatus | 'atRisk';

export type AssignmentFilter = 'all' | 'pending';

export type AnnouncementFilter = 'all' | 'unread' | 'important';

export type GradingFilter = 'all' | 'pending' | 'reviewed';

export interface ClassResourceItem {
  id: string;
  title: string;
  type: 'pdf' | 'slides' | 'video' | 'repo';
  detail: string;
  completed?: boolean;
}

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
  resources?: ClassResourceItem[];
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

export interface CourseGradeSummary {
  id: string;
  code: string;
  subject: string;
  credits: number;
  currentAvg: number;
  remainingWeightPercent: number;
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
  code: string;
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
  attendanceNote?: string | null;
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

export interface CreateAssignmentDto {
  title: string;
  subject: string;
  dueDate: string;
  rubricHint?: string;
  urgent: boolean;
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

/** Parses numeric grade on 0-20 scale from values like "18 / 20" or "17.5". */
export function parseCampusScoreOutOf20(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return null;
  const match = cleaned.match(/^(\d+(?:\.\d+)?)(?:\s*\/\s*20)?$/);
  if (!match) return null;
  const num = Number(match[1]);
  if (!Number.isFinite(num) || num < 0 || num > 20) return null;
  return Math.round(num * 10) / 10;
}
