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
  AdmitPatientDto,
  BedStatus,
  DischargeDisposition,
  PatientTriageRecord,
  PatientVitals,
  TriageLevel
} from '../../core/clinic/clinic.models';
import { ClinicService } from '../../core/clinic/clinic.service';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3FabComponent } from '../../shared/components/button/fab.component';
import { ClinicAdmissionModalComponent } from './components/clinic-admission-modal.component';
import { ClinicBedsMatrixComponent } from './components/clinic-beds-matrix.component';
import { ClinicDischargeModalComponent } from './components/clinic-discharge-modal.component';
import { CLINIC_EXPRESSIVE_CSS } from './components/clinic-expressive.styles';
import { ClinicHeaderComponent } from './components/clinic-header.component';
import { ClinicKpiRibbonComponent } from './components/clinic-kpi-ribbon.component';
import { ClinicPatientDetailComponent } from './components/clinic-patient-detail.component';
import { ClinicPatientQueueComponent } from './components/clinic-patient-queue.component';

export type ClinicRightTab = 'detail' | 'beds';
export type ClinicMobileTab = 'queue' | 'detail' | 'beds';

interface MobileTabItem {
  id: ClinicMobileTab;
  label: string;
  icon: string;
  count: number | null;
}

@Component({
  selector: 'app-clinic-page',
  imports: [
    NgTemplateOutlet,
    M3ButtonComponent,
    M3FabComponent,
    ClinicHeaderComponent,
    ClinicKpiRibbonComponent,
    ClinicPatientQueueComponent,
    ClinicPatientDetailComponent,
    ClinicBedsMatrixComponent,
    ClinicAdmissionModalComponent,
    ClinicDischargeModalComponent
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
      <!-- 1. Operational Clinical Header -->
      <app-clinic-header
        [searchQuery]="clinicService.searchQuery()"
        [activeDialogTrigger]="clinicService.activeDialogTrigger()"
        [isDialogOpen]="clinicService.isAdmissionDialogOpen()"
        (searchChange)="clinicService.setSearchQuery($event)"
        (openAdmission)="onOpenAdmissionModal($event)"
      />

      <!-- 2. Interactive M3 KPI & Quick Filter Command Strip -->
      <app-clinic-kpi-ribbon
        [kpi]="clinicService.kpiSummary()"
        [waitingCount]="clinicService.waitingCount()"
        [activeFilter]="clinicService.activeFilter()"
        (filterChange)="clinicService.setFilter($event)"
      />

      <!-- 3. Mobile WAI-ARIA Tab Switcher (< lg) -->
      <nav aria-label="Vistas clínicas móviles" class="lg:hidden flex justify-center shrink-0">
        <div
          role="tablist"
          aria-label="Secciones de clínica y triaje"
          class="inline-flex items-center gap-1 p-1.5 rounded-m3-full bg-surface-low shadow-m3-level1 max-w-full overflow-x-auto"
        >
          @for (tab of mobileTabs(); track tab.id; let idx = $index) {
            @let active = mobileTab() === tab.id;
            <button
              #mobileTabBtn
              type="button"
              role="tab"
              [id]="'clinic-mobile-tab-' + tab.id"
              [attr.aria-selected]="active"
              [attr.aria-controls]="
                tab.id === 'queue' ? 'clinic-queue-section' : 'clinic-workspace-section'
              "
              [tabindex]="active ? 0 : -1"
              (click)="onSelectMobileTab(tab.id)"
              (keydown)="onMobileTabKeydown($event, idx)"
              [class]="
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-m3-full text-label-md-emphasized whitespace-nowrap cursor-pointer transition-colors ' +
                (active
                  ? 'bg-primary-box text-on-primary-box'
                  : 'text-muted hover:bg-surface-high hover:text-main')
              "
            >
              <span class="material-symbols-rounded text-[17px]" aria-hidden="true">
                {{ tab.icon }}
              </span>
              <span>{{ tab.label }}</span>
              @if (tab.count !== null) {
                <span
                  [class]="
                    active
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-high text-muted'
                  "
                  class="px-1.5 py-0.5 rounded-m3-full text-label-sm font-mono tabular-nums"
                >
                  {{ tab.count }}
                </span>
              }
            </button>
          }
        </div>
      </nav>

      <!-- 4. Mission Control Grid (Left: 7 cols Queue, Right: 5 cols Chart & Beds) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <section
          id="clinic-queue-section"
          [class]="
            (mobileTab() === 'queue' ? 'block' : 'hidden') +
            ' lg:block lg:col-span-7 min-w-0'
          "
        >
          <app-clinic-patient-queue
            [patients]="clinicService.filteredPatients()"
            [totalPatientsCount]="clinicService.activePatients().length"
            [kpi]="clinicService.kpiSummary()"
            [inBedCount]="clinicService.inBedCount()"
            [waitingCount]="clinicService.waitingCount()"
            [activeFilter]="clinicService.activeFilter()"
            [selectedPatientId]="clinicService.selectedPatient()?.id ?? null"
            (filterChange)="clinicService.setFilter($event)"
            (selectPatient)="onSelectPatient($event)"
            (resetFilters)="onResetFilters()"
          />
        </section>

        <aside
          id="clinic-workspace-section"
          [class]="
            (mobileTab() === 'detail' || mobileTab() === 'beds' ? 'block' : 'hidden') +
            ' lg:block lg:col-span-5 min-w-0'
          "
        >
          <div class="rounded-m3-xl bg-surface-low p-4 sm:p-5 space-y-4">
            <!-- Desktop Panel Mode Switcher (WAI-ARIA Tablist) -->
            <div
              role="tablist"
              aria-label="Panel operativo derecho"
              class="hidden lg:grid grid-cols-2 gap-1 p-1 rounded-m3-full bg-surface"
            >
              @let detailActive = activeTab() === 'detail';
              <button
                #desktopTabBtn
                type="button"
                role="tab"
                id="clinic-tab-detail"
                aria-controls="clinic-panel-detail"
                [attr.aria-selected]="detailActive"
                [tabindex]="detailActive ? 0 : -1"
                (click)="activeTab.set('detail')"
                (keydown)="onDesktopTabKeydown($event, 0)"
                [class]="
                  'py-2 px-3 rounded-m3-full text-label-md-emphasized flex items-center justify-center gap-1.5 cursor-pointer transition-colors ' +
                  (detailActive
                    ? 'bg-primary-box text-on-primary-box'
                    : 'text-muted hover:bg-surface-high hover:text-main')
                "
              >
                <span class="material-symbols-rounded text-[18px]" aria-hidden="true">
                  clinical_notes
                </span>
                <span>Ficha &amp; NEWS2</span>
              </button>

              @let bedsActive = activeTab() === 'beds';
              <button
                #desktopTabBtn
                type="button"
                role="tab"
                id="clinic-tab-beds"
                aria-controls="clinic-panel-beds"
                [attr.aria-selected]="bedsActive"
                [tabindex]="bedsActive ? 0 : -1"
                (click)="activeTab.set('beds')"
                (keydown)="onDesktopTabKeydown($event, 1)"
                [class]="
                  'py-2 px-3 rounded-m3-full text-label-md-emphasized flex items-center justify-center gap-1.5 cursor-pointer transition-colors ' +
                  (bedsActive
                    ? 'bg-primary-box text-on-primary-box'
                    : 'text-muted hover:bg-surface-high hover:text-main')
                "
              >
                <span class="material-symbols-rounded text-[18px]" aria-hidden="true">bed</span>
                <span>
                  Boxes ({{ clinicService.kpiSummary().occupiedBeds }}/{{
                    clinicService.kpiSummary().totalBeds
                  }})
                </span>
              </button>
            </div>

            @if (activeTab() === 'detail') {
              <div
                id="clinic-panel-detail"
                role="tabpanel"
                aria-labelledby="clinic-tab-detail"
              >
                <app-clinic-patient-detail
                  [patient]="clinicService.selectedPatient()"
                  [nextUrgentBed]="clinicService.nextUrgentAvailableBed()"
                  [isDischargeDialogOpen]="clinicService.isDischargeDialogOpen()"
                  [activeDialogTrigger]="clinicService.activeDialogTrigger()"
                  (retriage)="onQuickRetriage($event.patientId, $event.level, $event.event)"
                  (assignUrgentBed)="onImmediateShockTrauma($event)"
                  (openBedsMatrix)="onSwitchToBeds()"
                  (updateVitals)="onUpdateVitals($event)"
                  (discharge)="onDischarge($event)"
                />
              </div>
            } @else {
              <div
                id="clinic-panel-beds"
                role="tabpanel"
                aria-labelledby="clinic-tab-beds"
              >
                <app-clinic-beds-matrix
                  [beds]="clinicService.beds()"
                  [selectedPatient]="clinicService.selectedPatient()"
                  (assignSelectedToBed)="onAssignSelectedToBed($event)"
                  (setBedStatus)="onSetBedStatus($event)"
                />
              </div>
            }
          </div>
        </aside>
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
        !clinicService.isAdmissionDialogOpen() &&
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

    <!-- Non-blocking Operational Confirmation Toast -->
    @if (clinicService.toastMessage(); as message) {
      <div
        role="status"
        class="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)] bg-surface-highest text-main shadow-m3-level3 rounded-m3-full pl-4 pr-2 py-2 flex items-center gap-2.5"
      >
        <span class="material-symbols-rounded text-[18px] text-primary shrink-0" aria-hidden="true">
          local_hospital
        </span>
        <span class="text-body-sm font-semibold truncate">{{ message }}</span>
        <m3-button
          variant="text"
          size="xs"
          icon="close"
          [iconOnly]="true"
          ariaLabel="Cerrar aviso"
          (action)="clinicService.dismissToast()"
        />
      </div>
    }

    <!-- StageOverlay Modal Portal Template -->
    <ng-template #clinicModalsTemplate>
      @if (clinicService.isAdmissionDialogOpen()) {
        <app-clinic-admission-modal
          [isTransitioning]="clinicService.isDialogTransitioning()"
          (close)="clinicService.closeAdmissionDialog()"
          (admit)="onAdmitPatient($event)"
        />
      }
      @if (clinicService.dischargeDialogPatient(); as dischargePatient) {
        <app-clinic-discharge-modal
          [patient]="dischargePatient"
          [isTransitioning]="clinicService.isDialogTransitioning()"
          (close)="clinicService.closeDischargeDialog()"
          (confirm)="onConfirmDischarge($event)"
        />
      }
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
  private readonly mobileTabButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('mobileTabBtn');
  private readonly desktopTabButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('desktopTabBtn');

  readonly activeTab = signal<ClinicRightTab>('detail');
  readonly mobileTab = signal<ClinicMobileTab>('queue');

  private returnFocusElement: HTMLElement | null = null;
  private wasOverlayOpen = false;
  private toastTimerId: ReturnType<typeof setTimeout> | null = null;

  protected readonly mobileTabs = computed<readonly MobileTabItem[]>(() => [
    {
      id: 'queue',
      label: 'Triaje',
      icon: 'format_list_bulleted',
      count: this.clinicService.filteredPatients().length
    },
    {
      id: 'detail',
      label: 'Ficha & NEWS2',
      icon: 'clinical_notes',
      count: null
    },
    {
      id: 'beds',
      label: 'Boxes',
      icon: 'bed',
      count: this.clinicService.kpiSummary().occupiedBeds
    }
  ]);

  constructor() {
    afterNextRender(() => {
      const tpl = this.modalsTemplate();
      this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      this.destroyRef.onDestroy(() => {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      });
    });

    effect(() => {
      const isOpen =
        this.clinicService.isAdmissionDialogOpen() ||
        this.clinicService.isDischargeDialogOpen();
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

    effect(() => {
      const msg = this.clinicService.toastMessage();
      if (this.toastTimerId) {
        clearTimeout(this.toastTimerId);
        this.toastTimerId = null;
      }
      if (msg) {
        this.toastTimerId = setTimeout(() => {
          this.clinicService.dismissToast();
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
    if (this.clinicService.isDischargeDialogOpen()) {
      event.preventDefault();
      this.clinicService.closeDischargeDialog();
      return;
    }
    if (this.clinicService.isAdmissionDialogOpen()) {
      event.preventDefault();
      this.clinicService.closeAdmissionDialog();
    }
  }

  onSelectPatient(patient: PatientTriageRecord): void {
    this.clinicService.selectPatient(patient);
    this.activeTab.set('detail');
    this.mobileTab.set('detail');
  }

  onQuickRetriage(patientId: string, level: TriageLevel, event?: Event): void {
    event?.stopPropagation();
    this.clinicService.updateTriageLevel(patientId, level);
  }

  onImmediateShockTrauma(patientId: string, event?: Event): void {
    event?.stopPropagation();
    this.clinicService.assignImmediateShockTrauma(patientId);
  }

  onDischarge(patientId: string, event?: Event): void {
    event?.stopPropagation();
    this.captureReturnFocus();
    this.clinicService.openDischargeDialog(patientId);
  }

  protected onConfirmDischarge(payload: {
    patientId: string;
    disposition: DischargeDisposition;
    notes?: string;
  }): void {
    this.clinicService.dischargePatient(payload.patientId, payload.disposition, payload.notes);
  }

  protected onUpdateVitals(payload: { patientId: string; vitals: PatientVitals }): void {
    this.clinicService.updatePatientVitals(payload.patientId, payload.vitals);
  }

  protected onSwitchToBeds(): void {
    this.activeTab.set('beds');
    this.mobileTab.set('beds');
  }

  protected onSelectMobileTab(tab: ClinicMobileTab): void {
    this.mobileTab.set(tab);
    if (tab === 'detail' || tab === 'beds') {
      this.activeTab.set(tab);
    }
  }

  protected onMobileTabKeydown(event: KeyboardEvent, currentIndex: number): void {
    const tabs = this.mobileTabs();
    const targetIndex = this.resolveTabKeyIndex(event.key, currentIndex, tabs.length);
    if (targetIndex === null) return;

    event.preventDefault();
    this.onSelectMobileTab(tabs[targetIndex].id);
    queueMicrotask(() => {
      this.mobileTabButtons()[targetIndex]?.nativeElement.focus();
    });
  }

  protected onDesktopTabKeydown(event: KeyboardEvent, currentIndex: number): void {
    const order: readonly ClinicRightTab[] = ['detail', 'beds'];
    const targetIndex = this.resolveTabKeyIndex(event.key, currentIndex, order.length);
    if (targetIndex === null) return;

    event.preventDefault();
    this.activeTab.set(order[targetIndex]);
    queueMicrotask(() => {
      this.desktopTabButtons()[targetIndex]?.nativeElement.focus();
    });
  }

  protected onOpenAdmissionModal(triggerId: string): void {
    this.captureReturnFocus();
    this.clinicService.openAdmissionDialog(triggerId);
  }

  private captureReturnFocus(): void {
    const active = this.document.activeElement;
    if (active instanceof HTMLElement) {
      this.returnFocusElement = active;
    }
  }

  protected onAdmitPatient(dto: AdmitPatientDto): void {
    this.clinicService.admitPatient(dto);
    this.activeTab.set('detail');
    this.mobileTab.set('detail');
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

  private resolveTabKeyIndex(key: string, current: number, total: number): number | null {
    if (total === 0) return null;
    if (key === 'ArrowRight') return (current + 1) % total;
    if (key === 'ArrowLeft') return (current - 1 + total) % total;
    if (key === 'Home') return 0;
    if (key === 'End') return total - 1;
    return null;
  }
}
