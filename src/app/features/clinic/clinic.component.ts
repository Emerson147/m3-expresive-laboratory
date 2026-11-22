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
  AdmitPatientDto,
  BedStatus,
  ClinicDesktopView,
  ClinicalNoteEntry,
  DischargeDisposition,
  EmergencyCodeType,
  PatientTriageRecord,
  PatientVitals,
  TriageLevel
} from '../../core/clinic/clinic.models';
import { ClinicService } from '../../core/clinic/clinic.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { M3FabComponent } from '../../shared/components/button/fab.component';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TabItem, M3TabsComponent } from '../../shared/components/tabs/tabs.component';
import { ClinicAdmissionModalComponent } from './components/clinic-admission-modal.component';
import { ClinicBedsMatrixComponent } from './components/clinic-beds-matrix.component';
import { ClinicChartModalComponent } from './components/clinic-chart-modal.component';
import { ClinicDischargeModalComponent } from './components/clinic-discharge-modal.component';
import { CLINIC_EXPRESSIVE_CSS } from './components/clinic-expressive.styles';
import { ClinicHeaderComponent } from './components/clinic-header.component';
import { ClinicHistoryModalComponent } from './components/clinic-history-modal.component';
import { ClinicKpiRibbonComponent } from './components/clinic-kpi-ribbon.component';
import { ClinicPatientDetailComponent } from './components/clinic-patient-detail.component';
import { ClinicPatientQueueComponent } from './components/clinic-patient-queue.component';

export type ClinicMobileTab = 'queue' | 'detail' | 'boxes';

@Component({
  selector: 'app-clinic-page',
  imports: [
    NgTemplateOutlet,
    M3FabComponent,
    M3SnackbarComponent,
    M3TabsComponent,
    ClinicHeaderComponent,
    ClinicKpiRibbonComponent,
    ClinicPatientQueueComponent,
    ClinicPatientDetailComponent,
    ClinicBedsMatrixComponent,
    ClinicAdmissionModalComponent,
    ClinicChartModalComponent,
    ClinicDischargeModalComponent,
    ClinicHistoryModalComponent
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [CLINIC_EXPRESSIVE_CSS],
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface text-main'
  },
  template: `
    <div
      [class]="
        adaptiveLayout.isCompact()
          ? 'clinic-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 gap-5 m3-scrollbar'
          : 'clinic-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-20 gap-5 lg:gap-6 m3-scrollbar'
      "
    >
      <!-- 1. Tactical Clinical Command Rail -->
      <app-clinic-header
        [searchQuery]="clinicService.searchQuery()"
        [isLiveMonitoring]="clinicService.isLiveMonitoring()"
        [historyCount]="clinicService.dischargeHistory().length"
        [activeDialogTrigger]="clinicService.activeDialogTrigger()"
        [isDialogOpen]="clinicService.isAnyDialogOpen()"
        [dialogMorphOwner]="clinicService.dialogMorphOwner()"
        (searchChange)="clinicService.setSearchQuery($event)"
        (toggleLive)="clinicService.toggleLiveMonitoring()"
        (openHistory)="onOpenHistoryModal($event)"
        (openAdmission)="onOpenAdmissionModal($event)"
      />

      <!-- 2. Analytical Mission Control KPI Strip -->
      <app-clinic-kpi-ribbon [kpi]="clinicService.kpiSummary()" />

      <!-- 3. Desktop Workspace Mode Switcher (>= lg) -->
      <div class="hidden lg:block shrink-0">
        <m3-tabs
          variant="primary"
          ariaLabel="Vistas principales de estación clínica"
          idPrefix="clinic-desktop-tab"
          [tabs]="desktopTabs()"
          [value]="desktopView()"
          (tabChange)="onDesktopViewChange($event)"
        />
      </div>

      <!-- 4. Mobile WAI-ARIA Tab Switcher (< lg) -->
      <div class="lg:hidden shrink-0">
        <m3-tabs
          variant="primary"
          ariaLabel="Vistas clínicas móviles"
          idPrefix="clinic-mobile-tab"
          [tabs]="mobileTabs()"
          [value]="mobileTab()"
          (tabChange)="onMobileTabChange($event)"
        />
      </div>

      <!-- 5. Main Clinical Workspace: Calm Triage Desk OR Wide Boxes Matrix (Fade Through Top Level) -->
      <div [class]="desktopViewTransitionClass()">
        @if (desktopView() === 'boxes') {
            <section id="clinic-panel-boxes" aria-label="Mapa operativo de boxes">
              <app-clinic-beds-matrix
                [beds]="clinicService.beds()"
                [patients]="clinicService.activePatients()"
                [selectedPatient]="clinicService.selectedPatient()"
                [recommendedBedId]="clinicService.nextUrgentAvailableBed()?.bed.id ?? null"
                [bedFilter]="clinicService.bedFilterStatus()"
                [isDialogOpen]="clinicService.isAnyDialogOpen()"
                [activeDialogTrigger]="clinicService.activeDialogTrigger()"
                [dialogMorphOwner]="clinicService.dialogMorphOwner()"
                (bedFilterChange)="clinicService.setBedFilterStatus($event)"
                (assignSelectedToBed)="onAssignSelectedToBed($event)"
                (setBedStatus)="onSetBedStatus($event)"
                (openPatientChart)="onOpenChartFromModalTrigger($event)"
              />
            </section>
          } @else {
            <div
              id="clinic-panel-triage"
              class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch"
            >
              <section
                id="clinic-queue-section"
                [class]="
                  (mobileTab() === 'queue' ? 'block' : 'hidden') +
                  ' lg:flex lg:flex-col lg:col-span-7 min-w-0'
                "
              >
                <app-clinic-patient-queue
                  [patients]="clinicService.filteredPatients()"
                  [totalPatientsCount]="clinicService.activePatients().length"
                  [kpi]="clinicService.kpiSummary()"
                  [inBedCount]="clinicService.inBedCount()"
                  [waitingCount]="clinicService.waitingCount()"
                  [activeFilter]="clinicService.activeFilter()"
                  [sortMode]="clinicService.sortMode()"
                  [selectedPatientId]="clinicService.selectedPatient()?.id ?? null"
                  (filterChange)="clinicService.setFilter($event)"
                  (sortModeChange)="clinicService.setSortMode($event)"
                  (selectPatient)="onSelectPatient($event)"
                  (resetFilters)="onResetFilters()"
                />
              </section>

              <aside
                id="clinic-workspace-section"
                aria-label="Centro de decisión rápida y camas"
                [class]="
                  (mobileTab() === 'detail' ? 'flex flex-col' : 'hidden') +
                  ' lg:flex lg:flex-col lg:col-span-5 min-w-0 rounded-m3-xl bg-surface-low p-4 sm:p-5'
                "
              >
                <app-clinic-patient-detail
                  [patient]="clinicService.selectedPatient()"
                  [nextUrgentBed]="clinicService.nextUrgentAvailableBed()"
                  [allBeds]="clinicService.beds()"
                  [isAnyDialogOpen]="clinicService.isAnyDialogOpen()"
                  [activeDialogTrigger]="clinicService.activeDialogTrigger()"
                  [dialogMorphOwner]="clinicService.dialogMorphOwner()"
                  (retriage)="onQuickRetriage($event.patientId, $event.level, $event.event)"
                  (assignUrgentBed)="onImmediateShockTrauma($event)"
                  (assignSpecificBed)="onAssignSpecificBed($event)"
                  (setBedStatus)="onSetBedStatus($event)"
                  (openBedsMatrix)="onSwitchToBoxes()"
                  (openChart)="onOpenChartFromModalTrigger($event)"
                  (openDischarge)="onOpenDischargeModal($event)"
                />
              </aside>
            </div>
          }
      </div>

      <!-- Single Polite Screen-Reader Announcer -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ clinicService.liveAnnouncement() }}
      </div>
    </div>

    <!-- Mobile Quick Admission FAB (< lg) -->
    <div
      id="clinic-mobile-fab-admit"
      class="lg:hidden fixed bottom-6 right-5 z-30"
      [style.visibility]="
        clinicService.isAdmissionDialogOpen() &&
        clinicService.activeDialogTrigger() === 'clinic-mobile-fab-admit'
          ? 'hidden'
          : 'visible'
      "
      [style.view-transition-name]="
        clinicService.dialogMorphOwner() === 'trigger' &&
        clinicService.activeDialogTrigger() === 'clinic-mobile-fab-admit'
          ? 'dialog-transform'
          : null
      "
    >
      <m3-fab
        icon="person_add"
        label="Admisión"
        size="md"
        variant="primary"
        ariaLabel="Abrir ingreso rápido a triaje"
        (action)="onOpenAdmissionModal('clinic-mobile-fab-admit')"
      />
    </div>

    <!-- Top-Layer Native Popover Snackbar with Clinical Undo -->
    <m3-snackbar
      [open]="clinicService.toastMessage() !== null"
      [message]="clinicService.toastMessage() ?? ''"
      [actionLabel]="clinicService.canUndoLastAction() ? 'Deshacer' : null"
      (action)="clinicService.undoLastAction()"
      (dismissed)="clinicService.dismissToast()"
    />

    <!-- StageOverlay Always-Mounted Native Dialogs Template -->
    <ng-template #clinicModalsTemplate>
      <app-clinic-admission-modal
        [open]="clinicService.isAdmissionDialogOpen()"
        [viewTransitionName]="
          clinicService.dialogMorphOwner() === 'modal' && clinicService.isAdmissionDialogOpen()
            ? 'dialog-transform'
            : null
        "
        (close)="clinicService.closeAdmissionDialog()"
        (admit)="onAdmitPatient($event)"
      />

      <app-clinic-chart-modal
        [open]="clinicService.isChartDialogOpen()"
        [patient]="clinicService.chartDialogPatient()"
        [viewTransitionName]="
          clinicService.dialogMorphOwner() === 'modal' && clinicService.isChartDialogOpen()
            ? 'dialog-transform'
            : null
        "
        (close)="clinicService.closeChartDialog()"
        (retriage)="onQuickRetriage($event.patientId, $event.level, $event.event)"
        (openDischarge)="onOpenDischargeFromChart($event)"
        (toggleCodeStep)="onToggleCodeStep($event)"
        (saveVitalsSnapshot)="onSaveVitalsSnapshot($event)"
        (addNote)="onAddClinicalNote($event)"
        (addAllergy)="onAddAllergy($event)"
        (removeAllergy)="onRemoveAllergy($event)"
        (setEmergencyCode)="onSetEmergencyCode($event)"
      />

      <app-clinic-discharge-modal
        [open]="clinicService.isDischargeDialogOpen()"
        [patient]="clinicService.dischargeDialogPatient()"
        [viewTransitionName]="
          clinicService.dialogMorphOwner() === 'modal' && clinicService.isDischargeDialogOpen()
            ? 'dialog-transform'
            : null
        "
        (close)="clinicService.closeDischargeDialog()"
        (confirm)="onConfirmDischarge($event)"
      />

      <app-clinic-history-modal
        [open]="clinicService.isHistoryDialogOpen()"
        [records]="clinicService.dischargeHistory()"
        [viewTransitionName]="
          clinicService.dialogMorphOwner() === 'modal' && clinicService.isHistoryDialogOpen()
            ? 'dialog-transform'
            : null
        "
        (close)="clinicService.closeHistoryDialog()"
      />
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="clinicModalsTemplate" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicComponent {
  readonly clinicService = inject(ClinicService);
  protected readonly adaptiveLayout = inject(AdaptiveLayoutService);
  protected readonly stageOverlay = inject(StageOverlayService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly modalsTemplate =
    viewChild.required<TemplateRef<unknown>>('clinicModalsTemplate');

  readonly desktopView = signal<ClinicDesktopView>('triage');
  readonly mobileTab = signal<ClinicMobileTab>('queue');
  readonly desktopViewSwitchSeq = signal<number>(0);

  protected readonly desktopViewTransitionClass = computed(() => {
    const seq = this.desktopViewSwitchSeq();
    if (seq === 0) return '';
    return seq % 2 === 1 ? 'clinic-anim-fade-a' : 'clinic-anim-fade-b';
  });

  private returnFocusElement: HTMLElement | null = null;
  private wasOverlayOpen = false;

  protected readonly desktopTabs = computed<M3TabItem[]>(() => {
    const kpi = this.clinicService.kpiSummary();
    return [
      {
        id: 'triage',
        label: 'Mesa de Triaje & Guardia',
        icon: 'emergency',
        badge: kpi.totalActivePatients,
        panelId: 'clinic-panel-triage'
      },
      {
        id: 'boxes',
        label: 'Mapa Operativo de Boxes',
        icon: 'bed',
        badge: `${kpi.occupiedBeds}/${kpi.totalBeds}`,
        panelId: 'clinic-panel-boxes'
      }
    ];
  });

  protected readonly mobileTabs = computed<M3TabItem[]>(() => {
    const kpi = this.clinicService.kpiSummary();
    return [
      {
        id: 'queue',
        label: 'Triaje',
        icon: 'format_list_bulleted',
        badge: this.clinicService.filteredPatients().length,
        panelId: 'clinic-queue-section'
      },
      {
        id: 'detail',
        label: 'Resumen & Camas',
        icon: 'clinical_notes',
        panelId: 'clinic-workspace-section'
      },
      {
        id: 'boxes',
        label: 'Boxes',
        icon: 'bed',
        badge: kpi.occupiedBeds,
        panelId: 'clinic-panel-boxes'
      }
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
      const isOpen = this.clinicService.isAnyDialogOpen();
      if (this.wasOverlayOpen && !isOpen) {
        queueMicrotask(() => {
          if (this.returnFocusElement?.isConnected) {
            this.returnFocusElement.focus();
          }
          this.returnFocusElement = null;
        });
      }
      this.wasOverlayOpen = isOpen;
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (!this.clinicService.isAnyDialogOpen()) return;
    event.preventDefault();
    this.clinicService.closeActiveDialog();
  }

  protected onDesktopViewChange(viewId: string): void {
    const view: ClinicDesktopView = viewId === 'boxes' ? 'boxes' : 'triage';
    if (view !== this.desktopView()) {
      this.desktopViewSwitchSeq.update((n) => n + 1);
    }
    this.desktopView.set(view);
    if (view === 'boxes') {
      this.mobileTab.set('boxes');
    } else if (this.mobileTab() === 'boxes') {
      this.mobileTab.set('queue');
    }
  }

  protected onMobileTabChange(tabId: string): void {
    const tab: ClinicMobileTab =
      tabId === 'boxes' ? 'boxes' : tabId === 'detail' ? 'detail' : 'queue';
    const nextDesktopView: ClinicDesktopView = tab === 'boxes' ? 'boxes' : 'triage';
    if (nextDesktopView !== this.desktopView()) {
      this.desktopViewSwitchSeq.update((n) => n + 1);
    }
    this.mobileTab.set(tab);
    this.desktopView.set(nextDesktopView);
  }

  onSelectPatient(patient: PatientTriageRecord): void {
    this.clinicService.selectPatient(patient);
    if (this.desktopView() !== 'triage') {
      this.desktopViewSwitchSeq.update((n) => n + 1);
    }
    this.desktopView.set('triage');
    this.mobileTab.set('detail');
  }

  onQuickRetriage(patientId: string, level: TriageLevel, event?: Event): void {
    event?.stopPropagation();
    this.clinicService.updateTriageLevel(patientId, level);
  }

  onImmediateShockTrauma(patientId: string): void {
    this.clinicService.assignImmediateShockTrauma(patientId);
  }

  protected onAssignSpecificBed(payload: { patientId: string; bedId: string }): void {
    this.clinicService.assignBed(payload.patientId, payload.bedId);
  }

  protected onSwitchToBoxes(): void {
    if (this.desktopView() !== 'boxes') {
      this.desktopViewSwitchSeq.update((n) => n + 1);
    }
    this.desktopView.set('boxes');
    this.mobileTab.set('boxes');
  }

  protected onOpenAdmissionModal(triggerId: string): void {
    this.captureReturnFocus();
    this.clinicService.openAdmissionDialog(triggerId);
  }

  protected onOpenHistoryModal(triggerId: string): void {
    this.captureReturnFocus();
    this.clinicService.openHistoryDialog(triggerId);
  }

  protected onOpenChartFromModalTrigger(payload: { patientId: string; triggerId: string }): void {
    this.captureReturnFocus();
    this.clinicService.openChartDialog(payload.patientId, payload.triggerId);
  }

  protected onOpenDischargeModal(payload: { patientId: string; triggerId: string }): void {
    this.captureReturnFocus();
    this.clinicService.openDischargeDialog(payload.patientId, payload.triggerId);
  }

  protected onOpenDischargeFromChart(patientId: string): void {
    this.clinicService.openDischargeDialog(patientId, null);
  }

  protected onConfirmDischarge(payload: {
    patientId: string;
    disposition: DischargeDisposition;
    notes?: string;
  }): void {
    this.clinicService.dischargePatient(payload.patientId, payload.disposition, payload.notes);
  }

  protected onSaveVitalsSnapshot(payload: {
    patientId: string;
    vitals: PatientVitals;
    note?: string;
  }): void {
    this.clinicService.updatePatientVitals(payload.patientId, payload.vitals, payload.note);
  }

  protected onAdmitPatient(dto: AdmitPatientDto): void {
    this.clinicService.admitPatient(dto);
    this.desktopView.set('triage');
    this.mobileTab.set('detail');
  }

  protected onToggleCodeStep(payload: { patientId: string; stepId: string }): void {
    this.clinicService.toggleProtocolStep(payload.patientId, payload.stepId);
  }

  protected onAddClinicalNote(payload: {
    patientId: string;
    text: string;
    kind: ClinicalNoteEntry['kind'];
  }): void {
    this.clinicService.addClinicalNote(payload.patientId, payload.text, payload.kind);
  }

  protected onAddAllergy(payload: { patientId: string; allergy: string }): void {
    this.clinicService.addAllergy(payload.patientId, payload.allergy);
  }

  protected onRemoveAllergy(payload: { patientId: string; allergy: string }): void {
    this.clinicService.removeAllergy(payload.patientId, payload.allergy);
  }

  protected onSetEmergencyCode(payload: {
    patientId: string;
    codeType: EmergencyCodeType | null;
  }): void {
    this.clinicService.activateEmergencyCode(payload.patientId, payload.codeType);
  }

  protected onAssignSelectedToBed(bedId: string): void {
    const patient = this.clinicService.selectedPatient();
    if (!patient) return;
    this.clinicService.assignBed(patient.id, bedId);
  }

  protected onSetBedStatus(payload: { bedId: string; status: BedStatus }): void {
    this.clinicService.setBedStatus(payload.bedId, payload.status);
  }

  protected onResetFilters(): void {
    this.clinicService.setFilter('all');
    this.clinicService.setSearchQuery('');
  }

  private captureReturnFocus(): void {
    const active = this.document.activeElement;
    if (active instanceof HTMLElement) {
      this.returnFocusElement = active;
    }
  }
}
