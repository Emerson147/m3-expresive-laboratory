import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  AttendanceStatus,
  CampusRole,
  ClassScheduleItem,
  CreateAnnouncementDto,
  StudentAssignment,
  SubmitAssignmentDto,
  SubmitGradeDto,
  TeacherGradingItem
} from '../../core/campus/campus.models';
import { CampusService } from '../../core/campus/campus.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3FabComponent } from '../../shared/components/button/fab.component';
import { CampusAnnouncementsCardComponent } from './components/campus-announcements-card.component';
import { CampusAnnouncementModalComponent } from './components/campus-announcement-modal.component';
import { CampusAssignmentModalComponent } from './components/campus-assignment-modal.component';
import { CampusAssignmentsCardComponent } from './components/campus-assignments-card.component';
import { CampusAttendanceRosterComponent } from './components/campus-attendance-roster.component';
import { CampusClassroomModalComponent } from './components/campus-classroom-modal.component';
import { CAMPUS_EXPRESSIVE_CSS } from './components/campus-expressive.styles';
import { CampusGradingModalComponent } from './components/campus-grading-modal.component';
import { CampusGradingQueueComponent } from './components/campus-grading-queue.component';
import { CampusHeaderComponent } from './components/campus-header.component';
import { CampusMetricsCardComponent } from './components/campus-metrics-card.component';
import { CampusQuickActionsComponent } from './components/campus-quick-actions.component';
import { CampusScheduleCardComponent } from './components/campus-schedule-card.component';
import { CampusStudentHeroComponent } from './components/campus-student-hero.component';
import { CampusTeacherHeroComponent } from './components/campus-teacher-hero.component';
import { CampusTeacherKpiRibbonComponent } from './components/campus-teacher-kpi-ribbon.component';

type CampusMobileTabId = 'overview' | 'agenda' | 'board';

interface MobileTabOption {
  id: CampusMobileTabId;
  label: string;
  icon: string;
  count: number | null;
}

@Component({
  selector: 'app-campus',
  imports: [
    NgTemplateOutlet,
    M3ButtonComponent,
    M3FabComponent,
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
    CampusAnnouncementModalComponent
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
        />
      } @else {
        <app-campus-teacher-kpi-ribbon
          [summary]="campus.rosterSummary()"
          [activeFilter]="campus.rosterFilter()"
          (filterChange)="campus.setRosterFilter($event)"
        />
      }

      <!-- Mobile WAI-ARIA Tab Switcher (< lg) -->
      <nav aria-label="Navegación de secciones" class="lg:hidden flex justify-center">
        <div
          role="tablist"
          aria-label="Vistas móviles de campus"
          class="inline-flex items-center gap-1 p-1.5 rounded-m3-full bg-surface-low shadow-m3-level1 max-w-full overflow-x-auto"
        >
          @for (tab of mobileTabs(); track tab.id; let idx = $index) {
            @let selected = mobileTab() === tab.id;

            <button
              #mobileTabBtn
              type="button"
              role="tab"
              [id]="'campus-mobile-tab-' + tab.id"
              [attr.aria-selected]="selected"
              [attr.aria-controls]="'campus-panel-' + tab.id"
              [attr.tabindex]="selected ? 0 : -1"
              (click)="mobileTab.set(tab.id)"
              (keydown)="onMobileTabKeydown($event, idx)"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-m3-full text-label-md-emphasized whitespace-nowrap cursor-pointer transition-colors"
              [class]="
                selected
                  ? 'bg-primary-box text-on-primary-box'
                  : 'text-muted hover:bg-surface'
              "
            >
              <span class="material-symbols-rounded text-[16px]" aria-hidden="true">
                {{ tab.icon }}
              </span>
              <span>{{ tab.label }}</span>
              @if (tab.count !== null && tab.count > 0) {
                <span
                  class="px-1.5 py-0.5 rounded-m3-full text-[10px] leading-none font-bold tabular-nums"
                  [class]="
                    selected
                      ? 'bg-surface/40 text-current'
                      : 'bg-surface text-main'
                  "
                >
                  {{ tab.count }}
                </span>
              }
            </button>
          }
        </div>
      </nav>

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
              [announcements]="campus.announcements()"
              [unreadCount]="campus.unreadAnnouncementsCount()"
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
              [rosterSummary]="campus.rosterSummary()"
              (markAllPresent)="campus.markAllPresent()"
            />

            <app-campus-attendance-roster
              [roster]="campus.filteredRoster()"
              [activeFilter]="campus.rosterFilter()"
              [searchQuery]="campus.rosterSearchQuery()"
              [isTransitioning]="campus.isRosterTransitioning()"
              (searchChange)="campus.setRosterSearch($event)"
              (resetFilters)="onResetTeacherFilters()"
              (statusChange)="onRosterStatusChange($event)"
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
                [items]="campus.gradingQueue()"
                [pendingCount]="campus.pendingGradingCount()"
                [activeDialogTrigger]="campus.activeDialogTrigger()"
                [isDialogOpen]="campus.isAnyDialogOpen()"
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
          !campus.isAnyDialogOpen() &&
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
          !campus.isAnyDialogOpen() &&
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

    <!-- Non-blocking Floating Confirmation Toast -->
    @if (campus.toastMessage(); as message) {
      <div
        role="status"
        class="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)] bg-surface-highest text-main shadow-m3-level3 rounded-m3-full pl-4 pr-2 py-2 flex items-center gap-2.5"
      >
        <span class="material-symbols-rounded text-[18px] text-primary shrink-0" aria-hidden="true">
          notifications_active
        </span>
        <span class="text-xs sm:text-sm font-semibold truncate">{{ message }}</span>
        <m3-button
          variant="text"
          size="xs"
          icon="close"
          [iconOnly]="true"
          ariaLabel="Cerrar notificación"
          (action)="campus.dismissToast()"
        />
      </div>
    }

    <!-- StageOverlay Modal Portal Template -->
    <ng-template #campusModalsTemplate>
      @if (campus.isClassroomDialogOpen()) {
        <app-campus-classroom-modal
          [course]="campus.selectedClass()"
          [isTransitioning]="campus.isDialogTransitioning()"
          (close)="campus.closeClassroomDialog()"
          (copyLink)="onCopyClassroomLink($event)"
          (enterRoom)="onEnterClassroom($event)"
        />
      }

      @if (campus.selectedAssignment(); as assignment) {
        <app-campus-assignment-modal
          [assignment]="assignment"
          [isTransitioning]="campus.isDialogTransitioning()"
          (close)="campus.closeAssignmentDialog()"
          (submitDelivery)="onSubmitAssignmentFromModal($event)"
        />
      }

      @if (campus.selectedGradingItem(); as gradingItem) {
        <app-campus-grading-modal
          [item]="gradingItem"
          [isTransitioning]="campus.isDialogTransitioning()"
          (close)="campus.closeGradingDialog()"
          (submitGrade)="onSubmitGrade($event)"
        />
      }

      @if (campus.isAnnouncementDialogOpen()) {
        <app-campus-announcement-modal
          [enrolledCount]="campus.teacherClass().enrolledCount"
          [isTransitioning]="campus.isDialogTransitioning()"
          (close)="campus.closeAnnouncementDialog()"
          (publish)="onPublishAnnouncement($event)"
        />
      }
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
  private readonly mobileTabButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('mobileTabBtn');

  readonly mobileTab = signal<CampusMobileTabId>('overview');

  private returnFocusElement: HTMLElement | null = null;
  private wasOverlayOpen = false;
  private toastTimerId: ReturnType<typeof setTimeout> | null = null;

  protected readonly mobileTabs = computed<MobileTabOption[]>(() => {
    if (this.campus.currentRole() === 'student') {
      return [
        { id: 'overview', label: 'Sesión', icon: 'school', count: null },
        {
          id: 'agenda',
          label: 'Entregas',
          icon: 'assignment',
          count: this.campus.pendingAssignmentsCount()
        },
        {
          id: 'board',
          label: 'Tablero',
          icon: 'campaign',
          count: this.campus.unreadAnnouncementsCount()
        }
      ];
    }
    return [
      {
        id: 'overview',
        label: 'Asistencia',
        icon: 'fact_check',
        count: this.campus.filteredRoster().length
      },
      {
        id: 'agenda',
        label: 'Revisión',
        icon: 'grading',
        count: this.campus.pendingGradingCount()
      },
      { id: 'board', label: 'Acciones', icon: 'bolt', count: null }
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

    effect(() => {
      const msg = this.campus.toastMessage();
      if (this.toastTimerId) {
        clearTimeout(this.toastTimerId);
        this.toastTimerId = null;
      }
      if (msg) {
        this.toastTimerId = setTimeout(() => {
          this.campus.dismissToast();
        }, 4200);
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.toastTimerId) {
        clearTimeout(this.toastTimerId);
      }
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

  protected onMobileTabKeydown(event: KeyboardEvent, currentIndex: number): void {
    const tabs = this.mobileTabs();
    const total = tabs.length;
    if (total === 0) return;

    let targetIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      targetIndex = (currentIndex + 1) % total;
    } else if (event.key === 'ArrowLeft') {
      targetIndex = (currentIndex - 1 + total) % total;
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = total - 1;
    }

    if (targetIndex === null) return;
    event.preventDefault();

    this.mobileTab.set(tabs[targetIndex].id);
    queueMicrotask(() => {
      this.mobileTabButtons()[targetIndex]?.nativeElement.focus();
    });
  }

  protected onOpenClassroom(triggerId: string): void {
    this.captureReturnFocus();
    this.campus.openClassroomDialog(triggerId);
  }

  protected onOpenAnnouncement(triggerId: string): void {
    this.captureReturnFocus();
    this.campus.openAnnouncementDialog(triggerId);
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
