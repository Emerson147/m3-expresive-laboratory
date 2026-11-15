import { ApplicationRef, Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { StageOverlayService } from '../dialog/stage-overlay.service';
import {
  AssignmentFilter,
  AttendanceStatus,
  CampusAnnouncement,
  CampusRole,
  ClassScheduleItem,
  CreateAnnouncementDto,
  RosterFilter,
  StudentAssignment,
  StudentAttendanceRecord,
  StudentGradeMetric,
  TeacherClass,
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
    remainingMinutes: 32,
    classroomLink: 'meet.campus.edu/fis-302-sec-b',
    syllabusTopic: 'Unidad IV: Función de onda y pozo de potencial finito'
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
    remainingMinutes: 90,
    classroomLink: 'meet.campus.edu/inf-204-magna',
    syllabusTopic: 'Unidad III: Balanceo AVL y flujo máximo en grafos'
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
    remainingMinutes: 90,
    classroomLink: 'meet.campus.edu/hum-110-aud',
    syllabusTopic: 'Seminario: Responsabilidad algorítmica y autonomía'
  }
];

const INITIAL_ASSIGNMENTS: StudentAssignment[] = [
  {
    id: 'asg-1',
    title: 'Informe Experimental: Espectroscopía de Emisión',
    subject: 'Física Cuántica',
    dueDate: 'Hoy 23:59',
    urgency: 'urgent',
    rubricHint: 'Adjuntar tabla de longitudes de onda e incertidumbre experimental.',
    submissionStatus: 'pending'
  },
  {
    id: 'asg-2',
    title: 'Árboles AVL y Grafos Bipartitos en TypeScript',
    subject: 'Algoritmos II',
    dueDate: 'Jueves 18:00',
    urgency: 'upcoming',
    rubricHint: 'Complejidad O(log n) demostrada con pruebas unitarias.',
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
    summary:
      'Inscripciones de equipos abiertas hasta el viernes. Premios de financiamiento para proyectos seleccionados.',
    publisher: 'Decanato de Ingeniería',
    date: 'Hace 2 horas',
    tag: 'Innovación',
    important: true,
    acknowledged: false
  },
  {
    id: 'ann-2',
    title: 'Mantenimiento Programado del Repositorio Digital y Biblioteca',
    summary:
      'El acceso a bases de datos científicas tendrá una ventana de optimización este sábado de 02:00 a 06:00.',
    publisher: 'Servicios Académicos',
    date: 'Hoy 10:15',
    tag: 'Servicios',
    important: false,
    acknowledged: false
  }
];

const INITIAL_TEACHER_CLASS: TeacherClass = {
  id: 't-cls-101',
  subject: 'Física Cuántica y Termodinámica · Sección B',
  room: 'Laboratorio 3B · Capacidad: 35 estudiantes',
  timeRange: 'Sesión activa · 16:30 - 18:00',
  enrolledCount: 6,
  presentCount: 4,
  pendingGradingCount: 2
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
    status: 'reviewed',
    score: '18 / 20',
    feedback: 'Desarrollo analítico completo.'
  }
];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  late: 'Tardanza',
  absent: 'Ausente'
};

@Injectable({
  providedIn: 'root'
})
export class CampusService {
  private readonly appRef = inject(ApplicationRef);
  private readonly stageOverlay = inject(StageOverlayService);

  readonly academicTermLabel = 'Ciclo 2026-II · Semana 11';

  // Role toggle
  readonly currentRole = signal<CampusRole>('student');

  // Student state
  readonly schedule = signal<ClassScheduleItem[]>(INITIAL_SCHEDULE);
  readonly selectedScheduleId = signal<string | null>(null);
  readonly assignments = signal<StudentAssignment[]>(INITIAL_ASSIGNMENTS);
  readonly assignmentsFilter = signal<AssignmentFilter>('all');
  readonly studentMetrics = signal<StudentGradeMetric>(INITIAL_STUDENT_METRICS);
  readonly announcements = signal<CampusAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  // Teacher state
  readonly teacherClassBase = signal<TeacherClass>(INITIAL_TEACHER_CLASS);
  readonly attendanceRoster = signal<StudentAttendanceRecord[]>(INITIAL_ROSTER);
  readonly gradingQueue = signal<TeacherGradingItem[]>(INITIAL_GRADING_ITEMS);
  readonly rosterFilter = signal<RosterFilter>('all');
  readonly rosterSearchQuery = signal<string>('');

  // Dialog, Transition & Feedback state
  readonly isRoleTransitioning = signal<boolean>(false);
  readonly isRosterTransitioning = signal<boolean>(false);
  readonly isAssignmentsTransitioning = signal<boolean>(false);
  readonly isDialogTransitioning = signal<boolean>(false);
  readonly activeDialogTrigger = signal<string | null>(null);
  readonly isClassroomDialogOpen = signal<boolean>(false);
  readonly isAnnouncementDialogOpen = signal<boolean>(false);
  readonly selectedGradingItem = signal<TeacherGradingItem | null>(null);
  readonly selectedAssignment = signal<StudentAssignment | null>(null);
  readonly toastMessage = signal<string | null>(null);
  readonly liveAnnouncement = signal<string>('');

  // Computed academic projections
  readonly activeClass = computed(
    () => this.schedule().find((c) => c.isActiveNow) ?? this.schedule()[0]
  );

  readonly selectedClass = computed(() => {
    const selectedId = this.selectedScheduleId();
    if (!selectedId) return this.activeClass();
    return this.schedule().find((c) => c.id === selectedId) ?? this.activeClass();
  });

  readonly pendingAssignmentsCount = computed(
    () => this.assignments().filter((a) => a.submissionStatus === 'pending').length
  );

  readonly filteredAssignments = computed(() => {
    const list = this.assignments();
    return this.assignmentsFilter() === 'pending'
      ? list.filter((a) => a.submissionStatus === 'pending')
      : list;
  });

  readonly unreadAnnouncementsCount = computed(
    () => this.announcements().filter((a) => !a.acknowledged).length
  );

  readonly creditProgress = computed(() => {
    const { approvedCredits, totalCredits } = this.studentMetrics();
    const safeTotal = Math.max(1, totalCredits);
    const percent = Math.round((approvedCredits / safeTotal) * 1000) / 10;
    return {
      percent,
      formattedPercent: `${percent.toFixed(1)}%`,
      remainingCredits: Math.max(0, totalCredits - approvedCredits)
    };
  });

  readonly rosterSummary = computed(() => {
    const list = this.attendanceRoster();
    const present = list.filter((s) => s.status === 'present').length;
    const late = list.filter((s) => s.status === 'late').length;
    const absent = list.filter((s) => s.status === 'absent').length;
    const atRisk = list.filter((s) => s.atRisk).length;
    const total = list.length;
    const presentRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { present, late, absent, atRisk, total, presentRate };
  });

  readonly pendingGradingCount = computed(
    () => this.gradingQueue().filter((g) => g.status === 'pending').length
  );

  readonly teacherClass = computed<TeacherClass>(() => {
    const base = this.teacherClassBase();
    const summary = this.rosterSummary();
    return {
      ...base,
      enrolledCount: summary.total,
      presentCount: summary.present,
      pendingGradingCount: this.pendingGradingCount()
    };
  });

  readonly filteredRoster = computed(() => {
    const list = this.attendanceRoster();
    const filter = this.rosterFilter();
    const query = this.rosterSearchQuery().trim().toLowerCase();

    const byFilter = (() => {
      switch (filter) {
        case 'present':
          return list.filter((s) => s.status === 'present');
        case 'late':
          return list.filter((s) => s.status === 'late');
        case 'absent':
          return list.filter((s) => s.status === 'absent');
        case 'atRisk':
          return list.filter((s) => s.atRisk);
        case 'all':
        default:
          return list;
      }
    })();

    if (!query) return byFilter;

    return byFilter.filter(
      (s) =>
        s.studentName.toLowerCase().includes(query) ||
        s.studentCode.toLowerCase().includes(query)
    );
  });

  readonly isAnyDialogOpen = computed(
    () =>
      this.isClassroomDialogOpen() ||
      this.isAnnouncementDialogOpen() ||
      this.selectedGradingItem() !== null ||
      this.selectedAssignment() !== null
  );

  readonly formattedTodayLabel = computed(() => {
    const raw = new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(new Date());
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  switchRole(role: CampusRole): void {
    if (this.currentRole() === role) return;

    this.runTransientTransition(this.isRoleTransitioning, () => {
      this.currentRole.set(role);
    });
    this.announce(
      role === 'teacher'
        ? 'Vista cambiada a Modo Docente.'
        : 'Vista cambiada a Modo Estudiante.'
    );
  }

  selectScheduleClass(scheduleId: string): void {
    const target = this.schedule().find((c) => c.id === scheduleId);
    if (!target || this.selectedClass().id === scheduleId) return;

    this.selectedScheduleId.set(scheduleId);
    this.announce(`Sesión enfocada: ${target.subject}, ${target.timeRange}.`);
  }

  setAssignmentsFilter(filter: AssignmentFilter): void {
    if (this.assignmentsFilter() === filter) return;
    this.runTransientTransition(this.isAssignmentsTransitioning, () => {
      this.assignmentsFilter.set(filter);
    });
  }

  setRosterFilter(filter: RosterFilter): void {
    if (this.rosterFilter() === filter) return;
    this.runTransientTransition(this.isRosterTransitioning, () => {
      this.rosterFilter.set(filter);
    });
  }

  setRosterSearch(query: string): void {
    this.rosterSearchQuery.set(query);
  }

  markAllPresent(): void {
    this.runTransientTransition(this.isRosterTransitioning, () => {
      this.attendanceRoster.update((list) =>
        list.map((s) => ({ ...s, status: 'present' as const }))
      );
    });
    const total = this.attendanceRoster().length;
    this.notify(`Todos los estudiantes (${total}) marcados como presentes.`);
  }

  setAttendance(studentId: string, status: AttendanceStatus): void {
    let targetName = '';
    this.attendanceRoster.update((list) =>
      list.map((s) => {
        if (s.id !== studentId) return s;
        targetName = s.studentName;
        return { ...s, status };
      })
    );
    if (targetName) {
      this.announce(`${targetName}: ${STATUS_LABELS[status]}.`);
    }
  }

  submitAssignment(assignmentId: string, note?: string): void {
    let targetTitle = '';
    const trimmedNote = note?.trim();
    const updateAssignments = () => {
      this.assignments.update((list) =>
        list.map((a) => {
          if (a.id !== assignmentId) return a;
          targetTitle = a.title;
          return {
            ...a,
            submissionStatus: 'submitted',
            urgency: 'upcoming',
            dueDate: 'Entregado hoy',
            submittedAt: trimmedNote ? `Recién enviado · ${trimmedNote}` : 'Recién enviado'
          };
        })
      );
    };

    if (this.selectedAssignment()?.id === assignmentId) {
      this.closePortaledModal(() => {
        this.selectedAssignment.set(null);
        updateAssignments();
      });
    } else {
      this.runTransientTransition(this.isAssignmentsTransitioning, updateAssignments);
    }

    if (targetTitle) {
      this.notify(`Entrega registrada: ${targetTitle}.`);
    }
  }

  markGradingReviewed(
    gradingId: string,
    score = '18 / 20',
    feedback = 'Evaluado según rúbrica de aula'
  ): void {
    let studentName = '';
    const updateQueue = () => {
      this.gradingQueue.update((list) =>
        list.map((g) => {
          if (g.id !== gradingId) return g;
          studentName = g.studentName;
          return { ...g, status: 'reviewed', score, feedback };
        })
      );
    };

    if (this.selectedGradingItem() !== null) {
      this.closePortaledModal(() => {
        this.selectedGradingItem.set(null);
        updateQueue();
      });
    } else {
      this.runCampusTransition(updateQueue);
    }

    if (studentName) {
      this.notify(`Calificación ${score} registrada para ${studentName}.`);
    }
  }

  toggleAnnouncementAck(announcementId: string): void {
    let targetTitle = '';
    let acknowledged = false;
    this.announcements.update((list) =>
      list.map((a) => {
        if (a.id !== announcementId) return a;
        targetTitle = a.title;
        acknowledged = !a.acknowledged;
        return { ...a, acknowledged };
      })
    );
    if (targetTitle) {
      this.announce(
        acknowledged ? `Aviso marcado como leído: ${targetTitle}.` : `Aviso marcado como pendiente.`
      );
    }
  }

  publishAnnouncement(dto: CreateAnnouncementDto): void {
    const newAnnouncement: CampusAnnouncement = {
      id: `ann-${Date.now()}`,
      title: dto.title.trim(),
      summary: dto.summary.trim(),
      publisher: 'Dr. Alejandro Arismendi · Cátedra FIS-302',
      date: 'Justo ahora',
      tag: dto.tag.trim() || 'Aula',
      important: dto.important,
      acknowledged: false
    };

    const prependAnnouncement = () => {
      this.announcements.update((list) => [newAnnouncement, ...list]);
    };

    if (this.isAnnouncementDialogOpen()) {
      this.closePortaledModal(() => {
        this.isAnnouncementDialogOpen.set(false);
        prependAnnouncement();
      });
    } else {
      this.runCampusTransition(prependAnnouncement);
    }

    this.notify(
      `Aviso "${newAnnouncement.title}" enviado a los ${this.rosterSummary().total} alumnos.`
    );
  }

  openClassroomDialog(triggerId = 'campus-hero-classroom-btn'): void {
    this.openPortaledModal(triggerId, () => {
      this.isClassroomDialogOpen.set(true);
    });
  }

  closeClassroomDialog(): void {
    if (!this.isClassroomDialogOpen()) return;
    this.closePortaledModal(() => {
      this.isClassroomDialogOpen.set(false);
    });
  }

  openAnnouncementDialog(triggerId = 'campus-announcement-btn'): void {
    this.openPortaledModal(triggerId, () => {
      this.isAnnouncementDialogOpen.set(true);
    });
  }

  closeAnnouncementDialog(): void {
    if (!this.isAnnouncementDialogOpen()) return;
    this.closePortaledModal(() => {
      this.isAnnouncementDialogOpen.set(false);
    });
  }

  openGradingDialog(
    item: TeacherGradingItem,
    triggerId = `campus-grade-btn-${item.id}`
  ): void {
    this.openPortaledModal(triggerId, () => {
      this.selectedGradingItem.set(item);
    });
  }

  closeGradingDialog(): void {
    if (this.selectedGradingItem() === null) return;
    this.closePortaledModal(() => {
      this.selectedGradingItem.set(null);
    });
  }

  openAssignmentDialog(
    item: StudentAssignment,
    triggerId = `campus-assignment-btn-${item.id}`
  ): void {
    this.openPortaledModal(triggerId, () => {
      this.selectedAssignment.set(item);
    });
  }

  closeAssignmentDialog(): void {
    if (this.selectedAssignment() === null) return;
    this.closePortaledModal(() => {
      this.selectedAssignment.set(null);
    });
  }

  closeActiveDialog(): void {
    if (this.isClassroomDialogOpen()) {
      this.closeClassroomDialog();
    } else if (this.isAnnouncementDialogOpen()) {
      this.closeAnnouncementDialog();
    } else if (this.selectedGradingItem() !== null) {
      this.closeGradingDialog();
    } else if (this.selectedAssignment() !== null) {
      this.closeAssignmentDialog();
    }
  }

  buildAttendanceCsv(): string {
    const header = 'Codigo,Estudiante,Estado,AsistenciaGeneral,EnRiesgo';
    const rows = this.attendanceRoster().map((s) =>
      [
        s.studentCode,
        `"${s.studentName.replace(/"/g, '""')}"`,
        STATUS_LABELS[s.status],
        `${s.overallAttendance}%`,
        s.atRisk ? 'Si' : 'No'
      ].join(',')
    );
    return [header, ...rows].join('\n');
  }

  notify(message: string): void {
    this.toastMessage.set(message);
    this.announce(message);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
  }

  private announce(message: string): void {
    // Re-trigger politely even when two identical messages arrive back-to-back
    this.liveAnnouncement.set('');
    queueMicrotask(() => this.liveAnnouncement.set(message));
  }

  private runTransientTransition(
    flag: WritableSignal<boolean>,
    update: () => void,
    rootClass = 'vt-campus-swap'
  ): void {
    flag.set(true);
    if (this.stageOverlay.hasViewTransitions()) {
      this.appRef.tick();
    }
    this.stageOverlay.runViewTransition(
      update,
      () => flag.set(false),
      { rootClass }
    );
  }

  private openPortaledModal(triggerId: string, applyOpenState: () => void): void {
    this.activeDialogTrigger.set(triggerId);
    this.isDialogTransitioning.set(true);
    if (this.stageOverlay.hasViewTransitions()) {
      this.appRef.tick();
    }
    this.stageOverlay.runViewTransition(
      () => {
        applyOpenState();
        this.stageOverlay.setOverlayOpen(true);
      },
      () => {
        this.isDialogTransitioning.set(false);
      }
    );
  }

  private closePortaledModal(applyCloseState: () => void): void {
    this.isDialogTransitioning.set(true);
    if (this.stageOverlay.hasViewTransitions()) {
      this.appRef.tick();
    }
    this.stageOverlay.runViewTransition(
      () => {
        applyCloseState();
        this.stageOverlay.setOverlayOpen(this.isAnyDialogOpen());
      },
      () => {
        this.activeDialogTrigger.set(null);
        this.isDialogTransitioning.set(false);
      },
      { isExiting: true }
    );
  }

  private runCampusTransition(update: () => void, cleanup?: () => void): void {
    this.stageOverlay.runViewTransition(update, cleanup, { rootClass: 'vt-campus-swap' });
  }
}
