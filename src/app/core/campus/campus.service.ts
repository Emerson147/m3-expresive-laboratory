import { ApplicationRef, Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { StageOverlayService } from '../dialog/stage-overlay.service';
import {
  AnnouncementFilter,
  AssignmentFilter,
  AttendanceStatus,
  CampusAnnouncement,
  CampusRole,
  ClassScheduleItem,
  CourseGradeSummary,
  CreateAnnouncementDto,
  CreateAssignmentDto,
  GradingFilter,
  RosterFilter,
  StudentAssignment,
  StudentAttendanceRecord,
  StudentGradeMetric,
  TeacherClass,
  TeacherGradingItem,
  parseCampusScoreOutOf20
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
    syllabusTopic: 'Unidad IV: Función de onda y pozo de potencial finito',
    resources: [
      { id: 'res-1', title: 'Guía de Lab N° 4: Pozo Cuántico', type: 'pdf', detail: '1.8 MB · Lectura obligatoria', completed: true },
      { id: 'res-2', title: 'Diapositivas de Cátedra (Semana 11)', type: 'slides', detail: '28 láminas', completed: false },
      { id: 'res-3', title: 'Simulación interactiva de eigenestados', type: 'repo', detail: 'Jupyter / Web', completed: false }
    ]
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
    syllabusTopic: 'Unidad III: Balanceo AVL y flujo máximo en grafos',
    resources: [
      { id: 'res-4', title: 'Plantilla TypeScript: Árboles AVL', type: 'repo', detail: 'Starter kit + specs', completed: false },
      { id: 'res-5', title: 'Clase grabada anterior (Grafos)', type: 'video', detail: '54 min', completed: true }
    ]
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
    syllabusTopic: 'Seminario: Responsabilidad algorítmica y autonomía',
    resources: [
      { id: 'res-6', title: 'Lectura base: Ética de Sistemas Autónomos', type: 'pdf', detail: '14 págs.', completed: false }
    ]
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

const INITIAL_COURSE_GRADES: CourseGradeSummary[] = [
  { id: 'cg-1', code: 'FIS-302', subject: 'Física Cuántica y Termodinámica', credits: 5, currentAvg: 18.2, remainingWeightPercent: 35 },
  { id: 'cg-2', code: 'INF-204', subject: 'Algoritmos y Estructuras de Datos II', credits: 4, currentAvg: 18.5, remainingWeightPercent: 30 },
  { id: 'cg-3', code: 'HUM-110', subject: 'Filosofía Contemporánea y Ética', credits: 3, currentAvg: 19.4, remainingWeightPercent: 25 }
];

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

const INITIAL_TEACHER_SECTIONS: TeacherClass[] = [
  {
    id: 't-cls-101',
    code: 'FIS-302',
    subject: 'Física Cuántica y Termodinámica · Sección B',
    room: 'Laboratorio 3B · Capacidad: 35 estudiantes',
    timeRange: 'Sesión activa · 16:30 - 18:00',
    enrolledCount: 6,
    presentCount: 4,
    pendingGradingCount: 2
  },
  {
    id: 't-cls-102',
    code: 'INF-204',
    subject: 'Algoritmos y Estructuras II · Sección A',
    room: 'Aula Magna 102 · Capacidad: 42 estudiantes',
    timeRange: 'Próxima sesión · 18:15 - 19:45',
    enrolledCount: 4,
    presentCount: 3,
    pendingGradingCount: 1
  }
];

const INITIAL_ROSTER_BY_SECTION: Record<string, StudentAttendanceRecord[]> = {
  't-cls-101': [
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
  ],
  't-cls-102': [
    {
      id: 'std-07',
      studentName: 'Sofía Paredes Salazar',
      studentCode: '2023-2104',
      status: 'present',
      overallAttendance: 96,
      atRisk: false
    },
    {
      id: 'std-08',
      studentName: 'Diego Huertas Chávez',
      studentCode: '2022-4490',
      status: 'present',
      overallAttendance: 91,
      atRisk: false
    },
    {
      id: 'std-09',
      studentName: 'Ariana Lozada Tello',
      studentCode: '2023-6112',
      status: 'late',
      overallAttendance: 81,
      atRisk: false
    },
    {
      id: 'std-10',
      studentName: 'Bruno Castillo Ríos',
      studentCode: '2022-3081',
      status: 'present',
      overallAttendance: 73,
      atRisk: true
    }
  ]
};

const INITIAL_GRADING_BY_SECTION: Record<string, TeacherGradingItem[]> = {
  't-cls-101': [
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
  ],
  't-cls-102': [
    {
      id: 'grd-4',
      studentName: 'Sofía Paredes Salazar',
      assignmentTitle: 'Implementación Árbol Rojo-Negro',
      submittedAt: 'Hoy 11:30',
      subject: 'Algoritmos II',
      status: 'pending'
    },
    {
      id: 'grd-5',
      studentName: 'Diego Huertas Chávez',
      assignmentTitle: 'Complejidad Amortizada Heap',
      submittedAt: 'Ayer 19:05',
      subject: 'Algoritmos II',
      status: 'reviewed',
      score: '19 / 20',
      feedback: 'Excelente análisis asintótico.'
    }
  ]
};

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
  readonly courseGrades = signal<CourseGradeSummary[]>(INITIAL_COURSE_GRADES);
  readonly simulatedFinalScore = signal<number>(17);
  readonly announcements = signal<CampusAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  readonly announcementsFilter = signal<AnnouncementFilter>('all');

  // Teacher multi-section state
  readonly teacherSectionsBase = signal<TeacherClass[]>(INITIAL_TEACHER_SECTIONS);
  readonly selectedTeacherClassId = signal<string>('t-cls-101');
  readonly rostersBySection = signal<Record<string, StudentAttendanceRecord[]>>(INITIAL_ROSTER_BY_SECTION);
  readonly gradingBySection = signal<Record<string, TeacherGradingItem[]>>(INITIAL_GRADING_BY_SECTION);
  readonly rosterFilter = signal<RosterFilter>('all');
  readonly rosterSearchQuery = signal<string>('');
  readonly gradingFilter = signal<GradingFilter>('all');
  readonly canUndoBatchAttendance = signal<boolean>(false);
  private previousRosterSnapshot: { sectionId: string; roster: StudentAttendanceRecord[] } | null = null;

  // Derived active teacher collections (preserving signal contract)
  readonly attendanceRoster = computed<StudentAttendanceRecord[]>(
    () => this.rostersBySection()[this.selectedTeacherClassId()] ?? []
  );

  readonly gradingQueue = computed<TeacherGradingItem[]>(
    () => this.gradingBySection()[this.selectedTeacherClassId()] ?? []
  );

  readonly filteredGradingQueue = computed<TeacherGradingItem[]>(() => {
    const list = this.gradingQueue();
    const filter = this.gradingFilter();
    if (filter === 'all') return list;
    return list.filter((g) => g.status === filter);
  });

  readonly filteredAnnouncements = computed<CampusAnnouncement[]>(() => {
    const list = this.announcements();
    const filter = this.announcementsFilter();
    if (filter === 'unread') return list.filter((a) => !a.acknowledged);
    if (filter === 'important') return list.filter((a) => a.important);
    return list;
  });

  // Strict single-owner Dialog & Transient Transition coordination
  readonly isRoleTransitioning = signal<boolean>(false);
  readonly isRosterTransitioning = signal<boolean>(false);
  readonly isAssignmentsTransitioning = signal<boolean>(false);
  readonly activeDialogTrigger = signal<string | null>(null);
  readonly dialogMorphOwner = signal<'trigger' | 'modal' | null>(null);
  readonly isDialogTransitioning = computed(() => this.dialogMorphOwner() !== null);

  readonly isClassroomDialogOpen = signal<boolean>(false);
  readonly isAnnouncementDialogOpen = signal<boolean>(false);
  readonly isEvaluationDialogOpen = signal<boolean>(false);
  readonly isSimulatorDialogOpen = signal<boolean>(false);
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

  readonly simulatedGpaProjection = computed(() => {
    const targetFinal = this.simulatedFinalScore();
    const courses = this.courseGrades();
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    if (totalCredits <= 0) {
      return { projectedGpa: this.studentMetrics().currentGpa, delta: 0, keepsHonors: true };
    }

    const weightedSum = courses.reduce((sum, c) => {
      const doneWeight = Math.max(0, 100 - c.remainingWeightPercent) / 100;
      const remWeight = c.remainingWeightPercent / 100;
      const courseProjected = c.currentAvg * doneWeight + targetFinal * remWeight;
      return sum + courseProjected * c.credits;
    }, 0);

    const projectedGpa = Math.round((weightedSum / totalCredits) * 10) / 10;
    const baseGpa = this.studentMetrics().currentGpa;
    return {
      projectedGpa,
      delta: Math.round((projectedGpa - baseGpa) * 10) / 10,
      keepsHonors: projectedGpa >= 18.0
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

  readonly teacherSections = computed<TeacherClass[]>(() => {
    const rosters = this.rostersBySection();
    const gradings = this.gradingBySection();
    return this.teacherSectionsBase().map((section) => {
      const roster = rosters[section.id] ?? [];
      const queue = gradings[section.id] ?? [];
      return {
        ...section,
        enrolledCount: roster.length,
        presentCount: roster.filter((s) => s.status === 'present').length,
        pendingGradingCount: queue.filter((g) => g.status === 'pending').length
      };
    });
  });

  readonly teacherClass = computed<TeacherClass>(() => {
    const selectedId = this.selectedTeacherClassId();
    return (
      this.teacherSections().find((s) => s.id === selectedId) ?? this.teacherSections()[0]
    );
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
      this.isEvaluationDialogOpen() ||
      this.isSimulatorDialogOpen() ||
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

  selectTeacherSection(sectionId: string): void {
    if (this.selectedTeacherClassId() === sectionId) return;
    const target = this.teacherSections().find((s) => s.id === sectionId);
    if (!target) return;

    this.canUndoBatchAttendance.set(false);
    this.previousRosterSnapshot = null;
    this.runTransientTransition(this.isRosterTransitioning, () => {
      this.selectedTeacherClassId.set(sectionId);
      this.rosterFilter.set('all');
      this.rosterSearchQuery.set('');
      this.gradingFilter.set('all');
    });
    this.announce(`Sección activa: ${target.subject}.`);
  }

  selectScheduleClass(scheduleId: string): void {
    const target = this.schedule().find((c) => c.id === scheduleId);
    if (!target || this.selectedClass().id === scheduleId) return;

    this.selectedScheduleId.set(scheduleId);
    this.announce(`Sesión enfocada: ${target.subject}, ${target.timeRange}.`);
  }

  toggleClassResourceCompleted(courseId: string, resourceId: string): void {
    this.schedule.update((courses) =>
      courses.map((c) => {
        if (c.id !== courseId || !c.resources) return c;
        return {
          ...c,
          resources: c.resources.map((r) =>
            r.id === resourceId ? { ...r, completed: !r.completed } : r
          )
        };
      })
    );
  }

  setAssignmentsFilter(filter: AssignmentFilter): void {
    if (this.assignmentsFilter() === filter) return;
    this.runTransientTransition(this.isAssignmentsTransitioning, () => {
      this.assignmentsFilter.set(filter);
    });
  }

  setAnnouncementsFilter(filter: AnnouncementFilter): void {
    if (this.announcementsFilter() === filter) return;
    this.announcementsFilter.set(filter);
  }

  setGradingFilter(filter: GradingFilter): void {
    if (this.gradingFilter() === filter) return;
    this.gradingFilter.set(filter);
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
    const sectionId = this.selectedTeacherClassId();
    const currentRoster = this.rostersBySection()[sectionId] ?? [];
    this.previousRosterSnapshot = {
      sectionId,
      roster: currentRoster.map((s) => ({ ...s }))
    };

    this.runTransientTransition(this.isRosterTransitioning, () => {
      this.rostersBySection.update((map) => ({
        ...map,
        [sectionId]: (map[sectionId] ?? []).map((s) => ({ ...s, status: 'present' as const }))
      }));
    });
    this.canUndoBatchAttendance.set(true);
    this.notify(
      `Todos los estudiantes (${currentRoster.length}) marcados como presentes.`,
      true
    );
  }

  undoBatchAttendance(): void {
    const snapshot = this.previousRosterSnapshot;
    if (!snapshot) return;

    this.previousRosterSnapshot = null;
    this.canUndoBatchAttendance.set(false);
    this.runTransientTransition(this.isRosterTransitioning, () => {
      this.rostersBySection.update((map) => ({
        ...map,
        [snapshot.sectionId]: snapshot.roster
      }));
    });
    this.notify('Asistencia previa restaurada.');
  }

  setAttendance(studentId: string, status: AttendanceStatus): void {
    const sectionId = this.selectedTeacherClassId();
    let targetName = '';
    this.rostersBySection.update((map) => ({
      ...map,
      [sectionId]: (map[sectionId] ?? []).map((s) => {
        if (s.id !== studentId) return s;
        targetName = s.studentName;
        return { ...s, status };
      })
    }));
    if (targetName) {
      this.announce(`${targetName}: ${STATUS_LABELS[status]}.`);
    }
  }

  updateAttendanceNote(studentId: string, note: string | null): void {
    const sectionId = this.selectedTeacherClassId();
    const cleanNote = note?.trim() || null;
    let studentName = '';
    this.rostersBySection.update((map) => ({
      ...map,
      [sectionId]: (map[sectionId] ?? []).map((s) => {
        if (s.id !== studentId) return s;
        studentName = s.studentName;
        return { ...s, attendanceNote: cleanNote };
      })
    }));
    if (studentName) {
      this.notify(
        cleanNote
          ? `Nota registrada para ${studentName}: ${cleanNote}.`
          : `Nota de asistencia eliminada para ${studentName}.`
      );
    }
  }

  sendRiskTutoringAlert(studentId: string): void {
    const student = this.attendanceRoster().find((s) => s.id === studentId);
    if (!student) return;

    this.updateAttendanceNote(studentId, 'Tutoría preventiva solicitada');
    this.notify(`Alerta de tutoría enviada a ${student.studentName} (${student.studentCode}).`);
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

  createAssignment(dto: CreateAssignmentDto): StudentAssignment {
    const created: StudentAssignment = {
      id: `asg-${Date.now()}`,
      title: dto.title.trim(),
      subject: dto.subject.trim(),
      dueDate: dto.dueDate.trim() || 'Próximo lunes 23:59',
      urgency: dto.urgent ? 'urgent' : 'upcoming',
      rubricHint: dto.rubricHint?.trim() || undefined,
      submissionStatus: 'pending'
    };

    const prepend = () => {
      this.assignments.update((list) => [created, ...list]);
    };

    if (this.isEvaluationDialogOpen()) {
      this.closePortaledModal(() => {
        this.isEvaluationDialogOpen.set(false);
        prepend();
      });
    } else {
      this.runTransientTransition(this.isAssignmentsTransitioning, prepend);
    }

    this.notify(`Evaluación "${created.title}" asignada a ${created.subject}.`);
    return created;
  }

  markGradingReviewed(
    gradingId: string,
    score = '18 / 20',
    feedback = 'Evaluado según rúbrica de aula'
  ): void {
    const sectionId = this.selectedTeacherClassId();
    let studentName = '';
    let gradedSubject = '';

    const updateQueue = () => {
      this.gradingBySection.update((map) => ({
        ...map,
        [sectionId]: (map[sectionId] ?? []).map((g) => {
          if (g.id !== gradingId) return g;
          studentName = g.studentName;
          gradedSubject = g.subject;
          return { ...g, status: 'reviewed', score, feedback };
        })
      }));

      // Reflect live grade updates in academic GPA when a valid numeric 0-20 grade is posted
      const parsed = parseCampusScoreOutOf20(score);
      if (parsed !== null && gradedSubject) {
        this.courseGrades.update((courses) =>
          courses.map((c) => {
            const matchesSubject = c.subject
              .toLowerCase()
              .includes(gradedSubject.split(' ')[0].toLowerCase());
            if (!matchesSubject) return c;
            const blended = Math.round((c.currentAvg * 0.8 + parsed * 0.2) * 10) / 10;
            return { ...c, currentAvg: blended };
          })
        );
      }
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
    const activeSec = this.teacherClass();
    const newAnnouncement: CampusAnnouncement = {
      id: `ann-${Date.now()}`,
      title: dto.title.trim(),
      summary: dto.summary.trim(),
      publisher: `Dr. Alejandro Arismendi · Cátedra ${activeSec.code}`,
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

  openEvaluationDialog(triggerId = 'campus-new-evaluation-btn'): void {
    this.openPortaledModal(triggerId, () => {
      this.isEvaluationDialogOpen.set(true);
    });
  }

  closeEvaluationDialog(): void {
    if (!this.isEvaluationDialogOpen()) return;
    this.closePortaledModal(() => {
      this.isEvaluationDialogOpen.set(false);
    });
  }

  openSimulatorDialog(triggerId = 'campus-gpa-simulator-btn'): void {
    this.openPortaledModal(triggerId, () => {
      this.isSimulatorDialogOpen.set(true);
    });
  }

  closeSimulatorDialog(): void {
    if (!this.isSimulatorDialogOpen()) return;
    this.closePortaledModal(() => {
      this.isSimulatorDialogOpen.set(false);
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
    } else if (this.isEvaluationDialogOpen()) {
      this.closeEvaluationDialog();
    } else if (this.isSimulatorDialogOpen()) {
      this.closeSimulatorDialog();
    } else if (this.selectedGradingItem() !== null) {
      this.closeGradingDialog();
    } else if (this.selectedAssignment() !== null) {
      this.closeAssignmentDialog();
    }
  }

  buildAttendanceCsv(): string {
    const header = 'Codigo,Estudiante,Estado,AsistenciaGeneral,EnRiesgo,Nota';
    const rows = this.attendanceRoster().map((s) =>
      [
        s.studentCode,
        `"${s.studentName.replace(/"/g, '""')}"`,
        STATUS_LABELS[s.status],
        `${s.overallAttendance}%`,
        s.atRisk ? 'Si' : 'No',
        `"${(s.attendanceNote ?? '').replace(/"/g, '""')}"`
      ].join(',')
    );
    return [header, ...rows].join('\n');
  }

  notify(message: string, undoable = false): void {
    if (!undoable) {
      this.canUndoBatchAttendance.set(false);
    }
    this.toastMessage.set(message);
    this.announce(message);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
    this.canUndoBatchAttendance.set(false);
  }

  private announce(message: string): void {
    this.liveAnnouncement.set('');
    queueMicrotask(() => this.liveAnnouncement.set(message));
  }

  private runTransientTransition(
    flag: WritableSignal<boolean>,
    update: () => void,
    rootClass = 'vt-campus-swap'
  ): void {
    if (this.isAnyDialogOpen()) {
      update();
      flag.set(false);
      return;
    }

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
    this.dialogMorphOwner.set('trigger');
    if (this.stageOverlay.hasViewTransitions()) {
      this.appRef.tick();
    }
    this.stageOverlay.runViewTransition(
      () => {
        applyOpenState();
        this.dialogMorphOwner.set('modal');
        this.stageOverlay.setOverlayOpen(true);
      },
      () => {
        this.dialogMorphOwner.set(null);
      }
    );
  }

  private closePortaledModal(applyCloseState: () => void): void {
    this.dialogMorphOwner.set('modal');
    if (this.stageOverlay.hasViewTransitions()) {
      this.appRef.tick();
    }
    this.stageOverlay.runViewTransition(
      () => {
        applyCloseState();
        const stillOpen = this.isAnyDialogOpen();
        this.dialogMorphOwner.set(stillOpen ? null : 'trigger');
        this.stageOverlay.setOverlayOpen(stillOpen);
      },
      () => {
        this.dialogMorphOwner.set(null);
        if (!this.isAnyDialogOpen()) {
          this.activeDialogTrigger.set(null);
        }
      },
      { isExiting: true }
    );
  }

  private runCampusTransition(update: () => void, cleanup?: () => void): void {
    if (this.isAnyDialogOpen()) {
      update();
      cleanup?.();
      return;
    }
    this.stageOverlay.runViewTransition(update, cleanup, { rootClass: 'vt-campus-swap' });
  }
}
