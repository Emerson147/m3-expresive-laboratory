import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import {
  AttendanceStatus,
  CampusRole,
  ClassScheduleItem,
  CreateAnnouncementDto,
  CreateAssignmentDto,
  StudentAssignment,
  SubmitAssignmentDto,
  SubmitGradeDto,
  TeacherGradingItem
} from '../../core/campus/campus.models';
import { CampusService } from '../../core/campus/campus.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { M3FabComponent } from '../../shared/components/button/fab.component';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TabItem, M3TabsComponent } from '../../shared/components/tabs/tabs.component';
import { CampusAnnouncementsCardComponent } from './components/campus-announcements-card.component';
import { CampusAnnouncementModalComponent } from './components/campus-announcement-modal.component';
import { CampusAssignmentModalComponent } from './components/campus-assignment-modal.component';
import { CampusAssignmentsCardComponent } from './components/campus-assignments-card.component';
import { CampusAttendanceRosterComponent } from './components/campus-attendance-roster.component';
import { CampusClassroomModalComponent } from './components/campus-classroom-modal.component';
import { CampusEvaluationModalComponent } from './components/campus-evaluation-modal.component';
import { CAMPUS_EXPRESSIVE_CSS } from './components/campus-expressive.styles';
import { CampusGradingModalComponent } from './components/campus-grading-modal.component';
import { CampusGradingQueueComponent } from './components/campus-grading-queue.component';
import { CampusHeaderComponent } from './components/campus-header.component';
import { CampusMetricsCardComponent } from './components/campus-metrics-card.component';
import { CampusQuickActionsComponent } from './components/campus-quick-actions.component';
import { CampusScheduleCardComponent } from './components/campus-schedule-card.component';
import { CampusSimulatorDialogComponent } from './components/campus-simulator-dialog.component';
import { CampusStudentHeroComponent } from './components/campus-student-hero.component';
import { CampusTeacherHeroComponent } from './components/campus-teacher-hero.component';
import { CampusTeacherKpiRibbonComponent } from './components/campus-teacher-kpi-ribbon.component';

@Component({
  selector: 'app-campus',
  imports: [
    NgTemplateOutlet,
    M3FabComponent,
    M3SnackbarComponent,
    M3TabsComponent,
    CampusHeaderComponent,
    CampusMetricsCardComponent,
    CampusStudentHeroComponent,
    CampusScheduleCardComponent,
    CampusAssignmentsCardComponent,
    CampusAnnouncementsCardComponent,
    CampusTeacherHeroComponent,
    CampusTeacherKpiRibbonComponent,
    CampusAttendanceRosterComponent,
    CampusGradingQueueComponent,
    CampusQuickActionsComponent,
    CampusClassroomModalComponent,
    CampusAssignmentModalComponent,
    CampusGradingModalComponent,
    CampusAnnouncementModalComponent,
    CampusEvaluationModalComponent,
    CampusSimulatorDialogComponent
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [CAMPUS_EXPRESSIVE_CSS],
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface text-main'
  },
  template: `
    <div
      [class]="adaptiveLayout.isCompact()
        ? 'campus-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 gap-5 m3-scrollbar'
        : 'campus-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-20 gap-5 lg:gap-6 m3-scrollbar'"
    >
      <app-campus-header
        [termLabel]="campus.academicTermLabel"
        [todayLabel]="campus.formattedTodayLabel()"
        [currentRole]="campus.currentRole()"
        [pendingAssignments]="campus.pendingAssignmentsCount()"
        [presentStudents]="campus.rosterSummary().present"
        [enrolledStudents]="campus.teacherClass().enrolledCount"
        [activeCourse]="campus.activeClass()"
        [activeDialogTrigger]="campus.activeDialogTrigger()"
        [isDialogOpen]="campus.isAnyDialogOpen()"
        [dialogMorphOwner]="campus.dialogMorphOwner()"
        (roleChange)="onSwitchRole($event)"
        (openClassroom)="onOpenClassroom($event)"
        (openAnnouncement)="onOpenAnnouncement($event)"
      />

      <!-- Unified Role KPI Ribbon -->
      @if (campus.currentRole() === 'student') {
        <app-campus-metrics-card
          [metrics]="campus.studentMetrics()"
          [creditProgress]="campus.creditProgress().percent"
          [pendingAssignments]="campus.pendingAssignmentsCount()"
          [unreadAnnouncements]="campus.unreadAnnouncementsCount()"
          [activeDialogTrigger]="campus.activeDialogTrigger()"
          [isDialogOpen]="campus.isAnyDialogOpen()"
          [dialogMorphOwner]="campus.dialogMorphOwner()"
          (openSimulator)="onOpenSimulator($event)"
        />
      } @else {
        <app-campus-teacher-kpi-ribbon
          [summary]="campus.rosterSummary()"
          [activeFilter]="campus.rosterFilter()"
          (filterChange)="campus.setRosterFilter($event)"
        />
      }

      <!-- Mobile WAI-ARIA Primary M3 Tabs (< lg) -->
      <div class="lg:hidden shrink-0">
        <m3-tabs
          variant="primary"
          ariaLabel="Vistas móviles de campus"
          idPrefix="campus-mobile-tab"
          [tabs]="mobileTabs()"
          [(value)]="mobileTab"
        />
      </div>

      <!-- Responsive 8/4 Mission Control Bento Grid -->
      <div
        class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"
        [class.vt-role-stage]="campus.isRoleTransitioning()"
      >
        @if (campus.currentRole() === 'student') {
          <!-- Left 8 columns: Session Focus + Schedule + Deliverables -->
          <div class="lg:col-span-8 flex flex-col gap-5 lg:gap-6 min-w-0">
            <div
              id="campus-panel-overview"
              [class]="(mobileTab() === 'overview' ? 'flex' : 'hidden') + ' lg:flex flex-col gap-5 lg:gap-6 min-w-0'"
            >
              <app-campus-student-hero
                [course]="campus.selectedClass()"
                [activeDialogTrigger]="campus.activeDialogTrigger()"
                [isDialogOpen]="campus.isAnyDialogOpen()"
                [dialogMorphOwner]="campus.dialogMorphOwner()"
                (enterClassroom)="onOpenClassroom($event)"
              />

              <app-campus-schedule-card
                [schedule]="campus.schedule()"
                [selectedClassId]="campus.selectedClass().id"
                (selectClass)="campus.selectScheduleClass($event)"
              />
            </div>

            <div
              id="campus-panel-agenda"
              [class]="(mobileTab() === 'agenda' ? 'flex' : 'hidden') + ' lg:flex flex-col min-w-0'"
            >
              <app-campus-assignments-card
                [assignments]="campus.filteredAssignments()"
                [filter]="campus.assignmentsFilter()"
                [pendingCount]="campus.pendingAssignmentsCount()"
                [totalCount]="campus.assignments().length"
                [isFilterTransitioning]="campus.isAssignmentsTransitioning()"
                [activeDialogTrigger]="campus.activeDialogTrigger()"
                [isDialogOpen]="campus.isAnyDialogOpen()"
                [dialogMorphOwner]="campus.dialogMorphOwner()"
                (filterChange)="campus.setAssignmentsFilter($event)"
                (submitAssignment)="campus.submitAssignment($event)"
                (inspectAssignment)="onOpenAssignment($event)"
              />
            </div>
          </div>

          <!-- Right 4 columns: Official Board -->
          <aside
            id="campus-panel-board"
            aria-label="Comunicados oficiales"
            [class]="(mobileTab() === 'board' ? 'flex' : 'hidden') + ' lg:flex flex-col gap-5 lg:gap-6 lg:col-span-4 min-w-0'"
          >
            <app-campus-announcements-card
              [announcements]="campus.filteredAnnouncements()"
              [unreadCount]="campus.unreadAnnouncementsCount()"
              [totalCount]="campus.announcements().length"
              [filter]="campus.announcementsFilter()"
              (filterChange)="campus.setAnnouncementsFilter($event)"
              (toggleAck)="campus.toggleAnnouncementAck($event)"
            />
          </aside>
        } @else {
          <!-- Teacher Left 8 columns: Cátedra Activa + Live Attendance Roster -->
          <div
            id="campus-panel-overview"
            [class]="(mobileTab() === 'overview' ? 'flex' : 'hidden') + ' lg:flex flex-col gap-5 lg:gap-6 lg:col-span-8 min-w-0'"
          >
            <app-campus-teacher-hero
              [teacherClass]="campus.teacherClass()"
              [sections]="campus.teacherSections()"
              [rosterSummary]="campus.rosterSummary()"
              (markAllPresent)="campus.markAllPresent()"
              (selectSection)="campus.selectTeacherSection($event)"
            />

            <app-campus-attendance-roster
              [roster]="campus.filteredRoster()"
              [activeFilter]="campus.rosterFilter()"
              [searchQuery]="campus.rosterSearchQuery()"
              [isTransitioning]="campus.isRosterTransitioning()"
              (searchChange)="campus.setRosterSearch($event)"
              (resetFilters)="onResetTeacherFilters()"
              (statusChange)="onRosterStatusChange($event)"
              (justifyStudent)="campus.updateAttendanceNote($event.studentId, $event.note)"
              (tutoringAlert)="campus.sendRiskTutoringAlert($event)"
            />
          </div>

          <!-- Teacher Right 4 columns: Grading Queue + Classroom Quick Actions -->
          <aside
            aria-label="Revisión y acciones de aula"
            class="lg:col-span-4 flex flex-col gap-5 lg:gap-6 min-w-0"
          >
            <div
              id="campus-panel-agenda"
              [class]="(mobileTab() === 'agenda' ? 'flex' : 'hidden') + ' lg:flex flex-col min-w-0'"
            >
              <app-campus-grading-queue
                [items]="campus.filteredGradingQueue()"
                [pendingCount]="campus.pendingGradingCount()"
                [totalCount]="campus.gradingQueue().length"
                [filter]="campus.gradingFilter()"
                [activeDialogTrigger]="campus.activeDialogTrigger()"
                [isDialogOpen]="campus.isAnyDialogOpen()"
                [dialogMorphOwner]="campus.dialogMorphOwner()"
                (filterChange)="campus.setGradingFilter($event)"
                (openGrade)="onOpenGrading($event)"
              />
            </div>

            <div
              id="campus-panel-board"
              [class]="(mobileTab() === 'board' ? 'flex' : 'hidden') + ' lg:flex flex-col min-w-0'"
            >
              <app-campus-quick-actions
                [activeDialogTrigger]="campus.activeDialogTrigger()"
                [isDialogOpen]="campus.isAnyDialogOpen()"
                [dialogMorphOwner]="campus.dialogMorphOwner()"
                (openEvaluation)="onOpenEvaluation($event)"
                (openAnnouncement)="onOpenAnnouncement($event)"
                (downloadCsv)="onDownloadAttendanceCsv()"
              />
            </div>
          </aside>
        }
      </div>

      <div
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ campus.liveAnnouncement() }}
      </div>
    </div>

    <!-- Mobile Floating Action Button (< lg) -->
    @if (campus.currentRole() === 'teacher') {
      <div
        id="campus-mobile-fab-announcement"
        class="lg:hidden fixed bottom-6 right-5 z-30"
        [style.visibility]="
          campus.isAnyDialogOpen() &&
          campus.activeDialogTrigger() === 'campus-mobile-fab-announcement'
            ? 'hidden'
            : 'visible'
        "
        [style.view-transition-name]="
          campus.dialogMorphOwner() === 'trigger' &&
          campus.activeDialogTrigger() === 'campus-mobile-fab-announcement'
            ? 'dialog-transform'
            : null
        "
      >
        <m3-fab
          icon="campaign"
          label="Aviso"
          size="md"
          variant="primary"
          ariaLabel="Publicar nuevo aviso a la clase"
          (action)="onOpenAnnouncement('campus-mobile-fab-announcement')"
        />
      </div>
    } @else {
      <div
        id="campus-mobile-fab-classroom"
        class="lg:hidden fixed bottom-6 right-5 z-30"
        [style.visibility]="
          campus.isAnyDialogOpen() &&
          campus.activeDialogTrigger() === 'campus-mobile-fab-classroom'
            ? 'hidden'
            : 'visible'
        "
        [style.view-transition-name]="
          campus.dialogMorphOwner() === 'trigger' &&
          campus.activeDialogTrigger() === 'campus-mobile-fab-classroom'
            ? 'dialog-transform'
            : null
        "
      >
        <m3-fab
          icon="videocam"
          label="Aula"
          size="md"
          variant="primary"
          ariaLabel="Abrir portal de clase virtual"
          (action)="onOpenClassroom('campus-mobile-fab-classroom')"
        />
      </div>
    }

    <!-- Native Popover Top-Layer Feedback Snackbar with Batch Undo -->
    <m3-snackbar
      [open]="campus.toastMessage() !== null"
      [message]="campus.toastMessage() ?? ''"
      [actionLabel]="campus.canUndoBatchAttendance() ? 'Deshacer' : null"
      (action)="campus.undoBatchAttendance()"
      (dismissed)="campus.dismissToast()"
    />

    <!-- StageOverlay Always-Mounted Native Dialogs Template -->
    <ng-template #campusModalsTemplate>
      <app-campus-classroom-modal
        [open]="campus.isClassroomDialogOpen()"
        [course]="campus.selectedClass()"
        [viewTransitionName]="campus.dialogMorphOwner() === 'modal' && campus.isClassroomDialogOpen() ? 'dialog-transform' : null"
        (close)="campus.closeClassroomDialog()"
        (copyLink)="onCopyClassroomLink($event)"
        (enterRoom)="onEnterClassroom($event)"
        (toggleResource)="campus.toggleClassResourceCompleted($event.courseId, $event.resourceId)"
      />

      <app-campus-assignment-modal
        [open]="campus.selectedAssignment() !== null"
        [assignment]="campus.selectedAssignment()"
        [viewTransitionName]="campus.dialogMorphOwner() === 'modal' && campus.selectedAssignment() !== null ? 'dialog-transform' : null"
        (close)="campus.closeAssignmentDialog()"
        (submitDelivery)="onSubmitAssignmentFromModal($event)"
      />

      <app-campus-grading-modal
        [open]="campus.selectedGradingItem() !== null"
        [item]="campus.selectedGradingItem()"
        [viewTransitionName]="campus.dialogMorphOwner() === 'modal' && campus.selectedGradingItem() !== null ? 'dialog-transform' : null"
        (close)="campus.closeGradingDialog()"
        (submitGrade)="onSubmitGrade($event)"
      />

      <app-campus-announcement-modal
        [open]="campus.isAnnouncementDialogOpen()"
        [enrolledCount]="campus.teacherClass().enrolledCount"
        [viewTransitionName]="campus.dialogMorphOwner() === 'modal' && campus.isAnnouncementDialogOpen() ? 'dialog-transform' : null"
        (close)="campus.closeAnnouncementDialog()"
        (publish)="onPublishAnnouncement($event)"
      />

      <app-campus-evaluation-modal
        [open]="campus.isEvaluationDialogOpen()"
        [defaultSubject]="campus.teacherClass().subject"
        [viewTransitionName]="campus.dialogMorphOwner() === 'modal' && campus.isEvaluationDialogOpen() ? 'dialog-transform' : null"
        (close)="campus.closeEvaluationDialog()"
        (createEvaluation)="onCreateEvaluation($event)"
      />

      <app-campus-simulator-dialog
        [open]="campus.isSimulatorDialogOpen()"
        [courses]="campus.courseGrades()"
        [projection]="campus.simulatedGpaProjection()"
        [(projectedFinalScore)]="campus.simulatedFinalScore"
        [viewTransitionName]="campus.dialogMorphOwner() === 'modal' && campus.isSimulatorDialogOpen() ? 'dialog-transform' : null"
        (close)="campus.closeSimulatorDialog()"
      />
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="campusModalsTemplate" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusComponent {
  readonly campus = inject(CampusService);
  protected readonly adaptiveLayout = inject(AdaptiveLayoutService);
  protected readonly stageOverlay = inject(StageOverlayService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly modalsTemplate =
    viewChild.required<TemplateRef<unknown>>('campusModalsTemplate');

  readonly mobileTab = signal<string>('overview');

  private returnFocusElement: HTMLElement | null = null;
  private wasOverlayOpen = false;

  protected readonly mobileTabs = computed<M3TabItem[]>(() => {
    if (this.campus.currentRole() === 'student') {
      return [
        { id: 'overview', label: 'Sesión', icon: 'school', panelId: 'campus-panel-overview' },
        {
          id: 'agenda',
          label: 'Entregas',
          icon: 'assignment',
          badge: this.campus.pendingAssignmentsCount(),
          panelId: 'campus-panel-agenda'
        },
        {
          id: 'board',
          label: 'Tablero',
          icon: 'campaign',
          badge: this.campus.unreadAnnouncementsCount(),
          panelId: 'campus-panel-board'
        }
      ];
    }
    return [
      {
        id: 'overview',
        label: 'Asistencia',
        icon: 'fact_check',
        badge: this.campus.filteredRoster().length,
        panelId: 'campus-panel-overview'
      },
      {
        id: 'agenda',
        label: 'Revisión',
        icon: 'grading',
        badge: this.campus.pendingGradingCount(),
        panelId: 'campus-panel-agenda'
      },
      { id: 'board', label: 'Acciones', icon: 'bolt', panelId: 'campus-panel-board' }
    ];
  });

  constructor() {
    afterNextRender(() => {
      const tpl = this.modalsTemplate();
      this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      this.destroyRef.onDestroy(() => {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      });
    });

    effect(() => {
      const isOpen = this.campus.isAnyDialogOpen();
      if (this.wasOverlayOpen && !isOpen) {
        queueMicrotask(() => {
          this.returnFocusElement?.focus();
          this.returnFocusElement = null;
        });
      }
      this.wasOverlayOpen = isOpen;
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (!this.campus.isAnyDialogOpen()) return;
    event.preventDefault();
    this.campus.closeActiveDialog();
  }

  protected onSwitchRole(role: CampusRole): void {
    this.mobileTab.set('overview');
    this.campus.switchRole(role);
  }

  protected onOpenClassroom(triggerId: string): void {
    this.captureReturnFocus();
    this.campus.openClassroomDialog(triggerId);
  }

  protected onOpenAnnouncement(triggerId: string): void {
    this.captureReturnFocus();
    this.campus.openAnnouncementDialog(triggerId);
  }

  protected onOpenEvaluation(triggerId: string): void {
    this.captureReturnFocus();
    this.campus.openEvaluationDialog(triggerId);
  }

  protected onOpenSimulator(triggerId: string): void {
    this.captureReturnFocus();
    this.campus.openSimulatorDialog(triggerId);
  }

  protected onOpenGrading(payload: { item: TeacherGradingItem; triggerId: string }): void {
    this.captureReturnFocus();
    this.campus.openGradingDialog(payload.item, payload.triggerId);
  }

  protected onOpenAssignment(payload: { item: StudentAssignment; triggerId: string }): void {
    this.captureReturnFocus();
    this.campus.openAssignmentDialog(payload.item, payload.triggerId);
  }

  protected onCopyClassroomLink(course: ClassScheduleItem): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(course.classroomLink);
    }
    this.campus.notify(`Enlace de ${course.code} copiado al portapapeles.`);
  }

  protected onEnterClassroom(course: ClassScheduleItem): void {
    this.campus.closeClassroomDialog();
    this.campus.notify(`Conectando a ${course.subject} (${course.code}).`);
  }

  protected onSubmitAssignmentFromModal(dto: SubmitAssignmentDto): void {
    this.campus.submitAssignment(dto.assignmentId, dto.note);
  }

  protected onSubmitGrade(dto: SubmitGradeDto): void {
    this.campus.markGradingReviewed(dto.gradingId, dto.score, dto.feedback);
  }

  protected onPublishAnnouncement(dto: CreateAnnouncementDto): void {
    this.campus.publishAnnouncement(dto);
  }

  protected onCreateEvaluation(dto: CreateAssignmentDto): void {
    this.campus.createAssignment(dto);
  }

  protected onResetTeacherFilters(): void {
    this.campus.setRosterFilter('all');
    this.campus.setRosterSearch('');
  }

  protected onRosterStatusChange(event: { studentId: string; status: AttendanceStatus }): void {
    this.campus.setAttendance(event.studentId, event.status);
  }

  protected onDownloadAttendanceCsv(): void {
    const csv = this.campus.buildAttendanceCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = 'acta-asistencia-campus.csv';
    link.click();
    URL.revokeObjectURL(url);
    this.campus.notify('Acta de asistencia descargada en formato CSV.');
  }

  private captureReturnFocus(): void {
    const active = this.document.activeElement;
    if (active instanceof HTMLElement) {
      this.returnFocusElement = active;
    }
  }
}
