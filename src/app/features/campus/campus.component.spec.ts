import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CampusService } from '../../core/campus/campus.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { M3CircularProgressComponent } from '../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../shared/components/progress/linear-progress.component';
import { CampusComponent } from './campus.component';
import { CampusAnnouncementModalComponent } from './components/campus-announcement-modal.component';
import { CampusAssignmentModalComponent } from './components/campus-assignment-modal.component';
import { CampusGradingModalComponent } from './components/campus-grading-modal.component';

describe('CampusComponent', () => {
  let component: CampusComponent;
  let fixture: ComponentFixture<CampusComponent>;
  let service: CampusService;
  let stageOverlay: StageOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CampusComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(CampusService);
    stageOverlay = TestBed.inject(StageOverlayService);
    fixture.detectChanges();
  });

  it('should create modern Campus workbench with borderless OKLCH panes and zero wireframe m3-card boxes', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(component).toBeTruthy();
    expect(hostEl.querySelector('h1')?.textContent).toContain('Campus Académico');
    expect(hostEl.querySelectorAll('m3-card').length).toBe(0);
    expect(service.currentRole()).toBe('student');
  });

  it('should avoid continuous wavy loops and render milestones for student and segmented quorum for teacher', () => {
    const hostEl: HTMLElement = fixture.nativeElement;

    const studentLinear = fixture.debugElement.queryAll(By.directive(M3LinearProgressComponent));
    const studentCircular = fixture.debugElement.queryAll(By.directive(M3CircularProgressComponent));
    const studentWavyCount =
      studentLinear.filter((dbg) => (dbg.componentInstance as M3LinearProgressComponent).wavy() === true).length +
      studentCircular.filter((dbg) => (dbg.componentInstance as M3CircularProgressComponent).wavy() === true).length;

    expect(studentWavyCount).toBe(0);
    const studentHeroText = hostEl.querySelector('app-campus-student-hero')?.textContent ?? '';
    expect(studentHeroText).toContain('Apertura');
    expect(studentHeroText).toContain('Desarrollo');
    expect(studentHeroText).toContain('Cierre');

    service.switchRole('teacher');
    fixture.detectChanges();

    const teacherLinear = fixture.debugElement.queryAll(By.directive(M3LinearProgressComponent));
    const teacherCircular = fixture.debugElement.queryAll(By.directive(M3CircularProgressComponent));
    const teacherWavyCount =
      teacherLinear.filter((dbg) => (dbg.componentInstance as M3LinearProgressComponent).wavy() === true).length +
      teacherCircular.filter((dbg) => (dbg.componentInstance as M3CircularProgressComponent).wavy() === true).length;

    expect(teacherWavyCount).toBe(0);
    const teacherHeroDbg = fixture.debugElement.query(By.css('app-campus-teacher-hero'));
    const teacherHeroBar = teacherHeroDbg.query(By.directive(M3LinearProgressComponent));
    expect(teacherHeroBar).toBeTruthy();
    expect((teacherHeroBar.componentInstance as M3LinearProgressComponent).wavy()).toBe(false);
    const teacherHeroText = hostEl.querySelector('app-campus-teacher-hero')?.textContent ?? '';
    expect(teacherHeroText).toContain('presentes');
    expect(teacherHeroText).toContain('tardanzas');
    expect(teacherHeroText).toContain('faltas');
  });

  it('should update focused hero session and replace empty progress bar with readiness strip on upcoming courses', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const scheduleButtons = Array.from(
      hostEl.querySelectorAll('app-campus-schedule-card button')
    ) as HTMLButtonElement[];
    expect(scheduleButtons.length).toBeGreaterThan(1);

    const upcomingIndex = service.schedule().findIndex((c) => !c.isActiveNow);
    expect(upcomingIndex).toBeGreaterThan(-1);

    scheduleButtons[upcomingIndex].click();
    fixture.detectChanges();

    const heroEl = hostEl.querySelector('app-campus-student-hero');
    expect(heroEl?.querySelector('h2')?.textContent ?? '').toContain(
      service.schedule()[upcomingIndex].subject
    );
    expect(heroEl?.querySelector('m3-linear-progress')).toBeNull();
    expect(heroEl?.querySelector('[data-testid="campus-scheduled-readiness"]')?.textContent).toContain(
      'Próximo bloque programado'
    );
  });

  it('should support WAI-ARIA mobile tablist navigation with ArrowRight and ArrowLeft keys', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const tabs = Array.from(
      hostEl.querySelectorAll('[role="tablist"] [role="tab"]')
    ) as HTMLButtonElement[];
    expect(tabs.length).toBe(3);
    expect(component.mobileTab()).toBe('overview');

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.mobileTab()).toBe('agenda');

    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(component.mobileTab()).toBe('board');

    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(component.mobileTab()).toBe('overview');
  });

  it('should open portaled classroom dialog with dialog-transform trigger and close on Escape', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const heroBtn = hostEl.querySelector(
      '#campus-hero-classroom-btn button'
    ) as HTMLButtonElement | null;
    expect(heroBtn).toBeTruthy();

    heroBtn?.click();
    fixture.detectChanges();

    expect(service.isClassroomDialogOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);
    expect(service.activeDialogTrigger()).toBe('campus-hero-classroom-btn');
    expect(hostEl.querySelector('#campus-classroom-heading')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(service.isClassroomDialogOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
  });

  it('should open assignment modal and confirm delivery submission', () => {
    const pending = service.assignments().find((a) => a.submissionStatus === 'pending');
    expect(pending).toBeTruthy();

    const detailBtn = fixture.nativeElement.querySelector(
      `#campus-assignment-btn-${pending!.id} button`
    ) as HTMLButtonElement | null;
    expect(detailBtn).toBeTruthy();

    detailBtn?.click();
    fixture.detectChanges();

    const modalDbg = fixture.debugElement.query(By.directive(CampusAssignmentModalComponent));
    expect(modalDbg).toBeTruthy();

    const modal = modalDbg.componentInstance as CampusAssignmentModalComponent;
    modal.deliveryNote.set('PDF verificado');
    const buttons = Array.from(
      modalDbg.nativeElement.querySelectorAll('footer button')
    ) as HTMLButtonElement[];
    buttons[buttons.length - 1].click();
    fixture.detectChanges();

    const updated = service.assignments().find((a) => a.id === pending!.id);
    expect(updated?.submissionStatus).toBe('submitted');
    expect(service.selectedAssignment()).toBeNull();
  });

  it('should filter deliverables when clicking filter chips', () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    const pendingChipBtn = Array.from(
      hostEl.querySelectorAll('app-campus-assignments-card button')
    ).find((btn) => btn.textContent?.includes('Pendientes')) as HTMLButtonElement | undefined;

    expect(pendingChipBtn).toBeTruthy();
    pendingChipBtn?.click();
    fixture.detectChanges();

    expect(service.assignmentsFilter()).toBe('pending');
    expect(
      service.filteredAssignments().every((a) => a.submissionStatus === 'pending')
    ).toBe(true);
  });

  it('should switch to Teacher mode, filter roster KPIs, grade work and publish announcement without native checkboxes', () => {
    service.switchRole('teacher');
    fixture.detectChanges();

    const hostEl: HTMLElement = fixture.nativeElement;
    const kpiButtons = Array.from(
      hostEl.querySelectorAll('app-campus-teacher-kpi-ribbon button')
    ) as HTMLButtonElement[];
    expect(kpiButtons.length).toBe(5);

    const lateBtn = kpiButtons.find((btn) => btn.textContent?.includes('Tardanzas'));
    lateBtn?.click();
    fixture.detectChanges();
    expect(service.rosterFilter()).toBe('late');
    expect(service.filteredRoster().every((s) => s.status === 'late')).toBe(true);

    // Open grading modal via portaled trigger
    const pendingGrade = service.gradingQueue().find((g) => g.status === 'pending');
    expect(pendingGrade).toBeTruthy();
    const gradeBtn = hostEl.querySelector(
      `#campus-grade-btn-${pendingGrade!.id} button`
    ) as HTMLButtonElement | null;
    gradeBtn?.click();
    fixture.detectChanges();

    const gradingModalDbg = fixture.debugElement.query(By.directive(CampusGradingModalComponent));
    expect(gradingModalDbg).toBeTruthy();
    const gradingModal = gradingModalDbg.componentInstance as CampusGradingModalComponent;
    gradingModal.score.set('19 / 20');
    const gradeForm = gradingModalDbg.nativeElement.querySelector('form') as HTMLFormElement;
    gradeForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const updatedGrade = service.gradingQueue().find((g) => g.id === pendingGrade!.id);
    expect(updatedGrade?.status).toBe('reviewed');
    expect(updatedGrade?.score).toBe('19 / 20');

    // Open announcement modal and ensure M3Switch is used (zero native checkboxes)
    const annTrigger = hostEl.querySelector('#campus-announcement-btn') as HTMLButtonElement | null;
    annTrigger?.click();
    fixture.detectChanges();

    const annModalDbg = fixture.debugElement.query(By.directive(CampusAnnouncementModalComponent));
    expect(annModalDbg).toBeTruthy();
    expect(annModalDbg.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
    expect(annModalDbg.nativeElement.querySelector('m3-switch')).toBeTruthy();

    const annModal = annModalDbg.componentInstance as CampusAnnouncementModalComponent;
    const annForm = annModalDbg.nativeElement.querySelector('form') as HTMLFormElement;
    const beforeCount = service.announcements().length;

    // Empty submit stays open and triggers error state
    annForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(service.announcements().length).toBe(beforeCount);
    expect(annModal.submitAttempted()).toBe(true);

    // Fill fields and publish
    annModal.title.set('Evaluación corta');
    annModal.summary.set('Mañana evaluamos espectroscopía práctica.');
    annModal.important.set(true);
    annForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(service.announcements().length).toBe(beforeCount + 1);
    expect(service.announcements()[0].title).toBe('Evaluación corta');
    expect(service.isAnnouncementDialogOpen()).toBe(false);
  });
});
