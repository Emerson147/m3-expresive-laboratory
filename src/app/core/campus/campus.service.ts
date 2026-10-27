import { Injectable, signal, computed, inject, ApplicationRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CampusRole,
  ClassScheduleItem,
  StudentAssignment,
  StudentGradeMetric,
  CampusAnnouncement,
  TeacherClass,
  StudentAttendanceRecord,
  TeacherGradingItem
} from './campus.models';

const INITIAL_SCHEDULE: ClassScheduleItem[] = [
  {
    id: 'cls-1',
    subject: 'Física Cuántica y Termodinámica',
    code: 'FIS-302',
    category: 'stem',
    teacherName: 'Dr. Alejandro Arismendi',
    room: 'Laboratorio 3B · Pabellón Ciencias',
    timeRange: '16:30 - 18:00',
    isActiveNow: true,
    progressPercent: 65,
    colorHue: 210 // Blue
  },
  {
    id: 'cls-2',
    subject: 'Algoritmos y Estructuras de Datos II',
    code: 'INF-204',
    category: 'stem',
    teacherName: 'Mg. Claudia Valdivia',
    room: 'Aula Magna 102',
    timeRange: '18:15 - 19:45',
    isActiveNow: false,
    progressPercent: 0,
    colorHue: 175 // Cyan
  },
  {
    id: 'cls-3',
    subject: 'Filosofía Contemporánea y Ética',
    code: 'HUM-110',
    category: 'humanities',
    teacherName: 'Lic. Sebastián Morales',
    room: 'Auditorio Central',
    timeRange: '20:00 - 21:30',
    isActiveNow: false,
    progressPercent: 0,
    colorHue: 42 // Amber
  }
];

const INITIAL_ASSIGNMENTS: StudentAssignment[] = [
  {
    id: 'asg-1',
    title: 'Informe Experimental: Espectroscopía de Emisión',
    subject: 'Física Cuántica',
    dueDate: 'Hoy 23:59',
    urgency: 'urgent',
    submissionStatus: 'pending'
  },
  {
    id: 'asg-2',
    title: 'Árboles AVL y Grafos Bipartitos en TypeScript',
    subject: 'Algoritmos II',
    dueDate: 'Jueves 18:00',
    urgency: 'upcoming',
    submissionStatus: 'pending'
  },
  {
    id: 'asg-3',
    title: 'Ensayo Crítico sobre Bioética en la Inteligencia Artificial',
    subject: 'Filosofía Contemporánea',
    dueDate: 'Calificado',
    urgency: 'graded',
    score: '19.5 / 20',
    submissionStatus: 'graded'
  }
];

const INITIAL_STUDENT_METRICS: StudentGradeMetric = {
  currentGpa: 18.6,
  approvedCredits: 142,
  totalCredits: 160,
  attendanceRate: 97.4,
  classStanding: 'Top 3% · Cuadro de Honor'
};

const INITIAL_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Convocatoria Abierta: Hackathon Nacional de Robótica 2026',
    summary: 'Inscripciones de equipos abiertas hasta el viernes. Premios de financiamiento para proyectos seleccionados.',
    publisher: 'Decanato de Ingeniería',
    date: 'Hace 2 horas',
    tag: 'Innovación',
    important: true
  },
  {
    id: 'ann-2',
    title: 'Mantenimiento Programado del Repositorio Digital y Biblioteca',
    summary: 'El acceso a bases de datos científicas tendrá una ventana de optimización este sábado de 02:00 a 06:00.',
    publisher: 'Servicios Académicos',
    date: 'Hoy 10:15',
    tag: 'Servicios',
    important: false
  }
];

const INITIAL_TEACHER_CLASS: TeacherClass = {
  id: 't-cls-101',
  subject: 'Física Cuántica y Termodinámica · Sección B',
  room: 'Laboratorio 3B · Capacidad: 35 estudiantes',
  timeRange: 'Sesión activa · 16:30 - 18:00',
  enrolledCount: 32,
  presentCount: 29,
  pendingGradingCount: 14
};

const INITIAL_ROSTER: StudentAttendanceRecord[] = [
  {
    id: 'std-01',
    studentName: 'Valeria Mendoza Reyes',
    studentCode: '2023-1094',
    status: 'present',
    overallAttendance: 98,
    atRisk: false
  },
  {
    id: 'std-02',
    studentName: 'Mateo Quispe Huamán',
    studentCode: '2023-0482',
    status: 'present',
    overallAttendance: 95,
    atRisk: false
  },
  {
    id: 'std-03',
    studentName: 'Camila Villavicencio Paz',
    studentCode: '2022-8812',
    status: 'late',
    overallAttendance: 84,
    atRisk: false
  },
  {
    id: 'std-04',
    studentName: 'Rodrigo Santillán Vega',
    studentCode: '2023-3150',
    status: 'absent',
    overallAttendance: 74,
    atRisk: true
  },
  {
    id: 'std-05',
    studentName: 'Lucía Fernández Cárdenas',
    studentCode: '2023-7721',
    status: 'present',
    overallAttendance: 100,
    atRisk: false
  },
  {
    id: 'std-06',
    studentName: 'Joaquín Benavides Soto',
    studentCode: '2021-9041',
    status: 'present',
    overallAttendance: 78,
    atRisk: true
  }
];

const INITIAL_GRADING_ITEMS: TeacherGradingItem[] = [
  {
    id: 'grd-1',
    studentName: 'Valeria Mendoza Reyes',
    assignmentTitle: 'Guía de Ondas Electromagnéticas',
    submittedAt: 'Hoy 15:42',
    subject: 'Física Cuántica',
    status: 'pending'
  },
  {
    id: 'grd-2',
    studentName: 'Mateo Quispe Huamán',
    assignmentTitle: 'Guía de Ondas Electromagnéticas',
    submittedAt: 'Hoy 14:10',
    subject: 'Física Cuántica',
    status: 'pending'
  },
  {
    id: 'grd-3',
    studentName: 'Camila Villavicencio Paz',
    assignmentTitle: 'Resolución de Ecuación de Schrödinger',
    submittedAt: 'Ayer 22:15',
    subject: 'Física Cuántica',
    status: 'reviewed'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CampusService {
  private readonly appRef = inject(ApplicationRef);
  private readonly platformId = inject(PLATFORM_ID);

  // Role toggle
  readonly currentRole = signal<CampusRole>('student');

  // Student State
  readonly schedule = signal<ClassScheduleItem[]>(INITIAL_SCHEDULE);
  readonly assignments = signal<StudentAssignment[]>(INITIAL_ASSIGNMENTS);
  readonly studentMetrics = signal<StudentGradeMetric>(INITIAL_STUDENT_METRICS);
  readonly announcements = signal<CampusAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  // Teacher State
  readonly teacherClass = signal<TeacherClass>(INITIAL_TEACHER_CLASS);
  readonly attendanceRoster = signal<StudentAttendanceRecord[]>(INITIAL_ROSTER);
  readonly gradingQueue = signal<TeacherGradingItem[]>(INITIAL_GRADING_ITEMS);

  // Computed Properties
  readonly activeClass = computed(() => this.schedule().find(c => c.isActiveNow) ?? this.schedule()[0]);

  readonly pendingAssignmentsCount = computed(() => 
    this.assignments().filter(a => a.submissionStatus === 'pending').length
  );

  readonly rosterSummary = computed(() => {
    const list = this.attendanceRoster();
    const present = list.filter(s => s.status === 'present').length;
    const late = list.filter(s => s.status === 'late').length;
    const absent = list.filter(s => s.status === 'absent').length;
    const atRisk = list.filter(s => s.atRisk).length;
    return { present, late, absent, atRisk, total: list.length };
  });

  readonly pendingGradingCount = computed(() =>
    this.gradingQueue().filter(g => g.status === 'pending').length
  );

  // Roster Filter State
  readonly rosterFilter = signal<'all' | 'present' | 'late' | 'absent' | 'atRisk'>('all');

  readonly filteredRoster = computed(() => {
    const list = this.attendanceRoster();
    const filter = this.rosterFilter();
    switch (filter) {
      case 'present': return list.filter(s => s.status === 'present');
      case 'late': return list.filter(s => s.status === 'late');
      case 'absent': return list.filter(s => s.status === 'absent');
      case 'atRisk': return list.filter(s => s.atRisk);
      case 'all':
      default: return list;
    }
  });

  switchRole(role: CampusRole): void {
    if (this.currentRole() === role) return;

    this.runViewTransition(() => {
      this.currentRole.set(role);
    });
  }

  setRosterFilter(filter: 'all' | 'present' | 'late' | 'absent' | 'atRisk'): void {
    this.rosterFilter.set(filter);
  }

  markAllPresent(): void {
    this.runViewTransition(() => {
      this.attendanceRoster.update(list =>
        list.map(s => ({ ...s, status: 'present' as const }))
      );
    });
  }

  setAttendance(studentId: string, status: 'present' | 'late' | 'absent'): void {
    this.attendanceRoster.update(list =>
      list.map(s => {
        if (s.id !== studentId) return s;
        return { ...s, status };
      })
    );
  }

  submitAssignment(assignmentId: string): void {
    this.runViewTransition(() => {
      this.assignments.update(list =>
        list.map(a => {
          if (a.id !== assignmentId) return a;
          return {
            ...a,
            submissionStatus: 'submitted',
            urgency: 'upcoming',
            dueDate: 'Entregado a tiempo'
          };
        })
      );
    });
  }

  markGradingReviewed(gradingId: string): void {
    this.runViewTransition(() => {
      this.gradingQueue.update(list =>
        list.map(g => {
          if (g.id !== gradingId) return g;
          return { ...g, status: 'reviewed' };
        })
      );
    });
  }

  private runViewTransition(update: () => void): void {
    const doc = typeof document !== 'undefined' ? (document as any) : null;
    if (doc && typeof doc.startViewTransition === 'function' && isPlatformBrowser(this.platformId)) {
      const transition = doc.startViewTransition(() => {
        update();
        this.appRef.tick();
      });
      transition.finished.finally(() => {
        this.appRef.tick();
      });
    } else {
      update();
    }
  }
}
