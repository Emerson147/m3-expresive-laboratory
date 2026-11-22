import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import {
  BedArea,
  BedStatus,
  EmergencyBed,
  PatientTriageRecord,
  TriageLevel,
  UrgentBedCandidate
} from '../../../core/clinic/clinic.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import {
  BED_AREA_META,
  NEWS2_RISK_META,
  TRIAGE_LEVEL_META,
  TRIAGE_LEVEL_ORDER,
  evaluatePatientVitals,
  formatSlaMetaLabel
} from './clinic-ui.tokens';

@Component({
  selector: 'app-clinic-patient-detail',
  imports: [M3ButtonComponent, M3LinearProgressComponent],
  host: { class: 'block flex-1 flex flex-col' },
  template: `
    <div class="flex-1 flex flex-col">
      @if (patient(); as pt) {
        @let triageMeta = triageMetaFor(pt.triageLevel);
        @let newsMeta = newsMetaFor(pt.news2.riskLevel);
        @let slaMeta = slaMetaFor(pt);

        <div [class]="detailTransitionClass()">
            <!-- Card 1: Calm Executive Patient Summary -->
            <div class="rounded-m3-xl bg-surface p-4 sm:p-5 space-y-4">
              @if (pt.allergies.length > 0) {
                <div
                  role="alert"
                  class="rounded-m3-lg bg-warning-box text-on-warning-box px-3.5 py-2 flex items-center justify-between gap-2 text-label-md-emphasized"
                >
                  <span class="truncate">Alergias: {{ pt.allergies.join(' · ') }}</span>
                  <span class="material-symbols-rounded text-[17px] shrink-0" aria-hidden="true">
                    medication_liquid
                  </span>
                </div>
              }

              <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      [class]="
                        triageMeta.badgeClass +
                        ' inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized uppercase tracking-wider'
                      "
                    >
                      {{ triageMeta.fullLabel }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-m3-full bg-surface-low text-muted text-label-sm font-mono">
                      {{ pt.ticketCode }}
                    </span>
                  </div>

                  <span
                    [class]="
                      newsMeta.pillClass +
                      ' px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums'
                    "
                  >
                    NEWS2 {{ pt.news2.score }} / 20
                  </span>
                </div>

                <h3 class="text-title-lg-emphasized text-main tracking-tight">
                  {{ pt.fullName }}
                </h3>
                <p class="text-body-sm text-muted">
                  {{ pt.age }} años · {{ genderLabel(pt.gender) }} · {{ slaMeta.label }}
                  @if (pt.bedAssignedId) {
                    <span> · En box <strong class="text-main font-mono">{{ pt.bedAssignedId }}</strong></span>
                  }
                </p>
              </div>

              <p class="text-body-sm text-muted line-clamp-2 leading-relaxed">
                {{ pt.chiefComplaint }}
              </p>

              <!-- Semantic 4-Metric Vitals Snapshot -->
              <div class="grid grid-cols-4 gap-2 text-center font-mono tabular-nums">
                @for (metric of summaryVitals(); track metric.key) {
                  <div
                    [class]="
                      (metric.severity === 'critical'
                        ? 'bg-error-box text-on-error-box'
                        : metric.severity === 'warning'
                          ? 'bg-warning-box text-on-warning-box'
                          : 'bg-surface-low text-main') +
                      ' rounded-m3-lg p-2 transition-colors'
                    "
                  >
                    <span class="block text-label-sm opacity-80">{{ metric.label }}</span>
                    <span class="text-title-sm-emphasized font-bold">{{ metric.value }}</span>
                  </div>
                }
              </div>

              @if (pt.activeCode; as code) {
                <div class="rounded-m3-lg bg-error-box text-on-error-box px-3.5 py-2.5 space-y-2 text-label-md">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="clinic-live-dot bg-error shrink-0" aria-hidden="true"></span>
                      <span class="font-semibold truncate">{{ code.title }}</span>
                      @if (code.steps.length > 0) {
                        <span class="px-1.5 py-0.5 rounded-m3-full bg-surface text-main text-[10px] font-mono font-bold shrink-0">
                          {{ completedCodeSteps(pt) }}/{{ code.steps.length }}
                        </span>
                      }
                    </div>
                    <span class="font-mono font-bold shrink-0">{{ code.remainingMinutes }}m rest.</span>
                  </div>
                  <div class="clinic-code-progress">
                    <m3-linear-progress
                      [value]="codeProgress(pt)"
                      [wavy]="false"
                      color="error"
                      size="sm"
                      [ariaLabel]="'Progreso de ventana clínica de ' + code.title"
                    />
                  </div>
                </div>
              }

              <!-- Quick Manchester Re-Triage -->
              <div role="group" aria-label="Reclasificar nivel de triaje Manchester" class="grid grid-cols-5 gap-1.5">
                @for (level of levelOrder; track level) {
                  @let meta = triageMetaFor(level);
                  @let isCurrent = pt.triageLevel === level;
                  <button
                    type="button"
                    (click)="retriage.emit({ patientId: pt.id, level, event: $event })"
                    [attr.aria-pressed]="isCurrent"
                    [attr.aria-label]="meta.fullLabel"
                    [class]="
                      'clinic-chip-btn state-layer focus-ring-m3 px-2 py-1.5 text-label-md-emphasized font-mono cursor-pointer flex items-center justify-center ' +
                      (isCurrent
                        ? meta.badgeClass + ' font-bold'
                        : 'bg-surface-low text-muted')
                    "
                  >
                    {{ meta.shortCode }}
                  </button>
                }
              </div>

              <!-- Primary CTA with dialog-transform to Wide Chart + Discharge -->
              <div class="flex flex-wrap items-center gap-2 pt-1">
                <m3-button
                  id="clinic-detail-expand-btn"
                  variant="filled"
                  size="md"
                  icon="open_in_full"
                  customClass="flex-1 min-w-[190px]"
                  [morph]="true"
                  [invisible]="isChartOriginInvisible()"
                  [viewTransitionName]="isChartOriginActive() ? 'dialog-transform' : null"
                  (action)="openChart.emit({ patientId: pt.id, triggerId: 'clinic-detail-expand-btn' })"
                >
                  Ver Historia Completa
                </m3-button>

                <m3-button
                  id="clinic-detail-discharge-btn"
                  variant="tonal"
                  size="md"
                  icon="check_circle"
                  [invisible]="isDischargeOriginInvisible()"
                  [viewTransitionName]="isDischargeOriginActive() ? 'dialog-transform' : null"
                  (action)="openDischarge.emit({ patientId: pt.id, triggerId: 'clinic-detail-discharge-btn' })"
                >
                  Egreso / Pase
                </m3-button>
              </div>
            </div>

            <!-- Card 2: Rapid Bed Assignment Hub (Stretched symmetrically with left queue) -->
            <div class="rounded-m3-xl bg-surface p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <h4 class="text-title-sm-emphasized text-main flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-[18px] text-primary" aria-hidden="true">
                        bed
                      </span>
                      <span>Asignación Rápida de Camas</span>
                    </h4>
                    <p class="text-label-sm text-muted">
                      {{
                        pt.bedAssignedId
                          ? 'Actualmente en ' + pt.bedAssignedId + ' · toca un box libre para reubicar'
                          : 'Asigna en 1 clic sin salir de la mesa de guardia'
                      }}
                    </p>
                  </div>

                  <m3-button variant="text" size="xs" icon="grid_view" (action)="openBedsMatrix.emit()">
                    Ver Mapa
                  </m3-button>
                </div>

                @if (currentAssignedBed(); as currentBed) {
                  <div class="rounded-m3-lg bg-sec-box text-on-sec-box px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="material-symbols-rounded text-[18px] shrink-0" aria-hidden="true">
                        hotel
                      </span>
                      <div class="min-w-0">
                        <p class="text-label-md-emphasized font-mono truncate">
                          Box Actual: {{ currentBed.id }} · {{ currentBed.name }}
                        </p>
                        <p class="text-label-sm opacity-80 truncate">
                          {{ bedAreaTitle(currentBed.area) }}
                        </p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-m3-full bg-surface text-main text-[10px] font-bold uppercase shrink-0">
                      Ocupada
                    </span>
                  </div>
                } @else if (nextUrgentBed(); as candidate) {
                  <m3-button
                    variant="tonal"
                    size="sm"
                    [icon]="candidate.isPrimaryShockTrauma ? 'emergency' : 'bolt'"
                    customClass="w-full"
                    (action)="assignUrgentBed.emit(pt.id)"
                  >
                    {{
                      candidate.isPrimaryShockTrauma
                        ? 'Ingreso Prioritario → Shock Trauma (' + candidate.bed.id + ')'
                        : 'Asignar Box Sugerido (' + candidate.bed.id + ')'
                    }}
                  </m3-button>
                }

                @if (availableBeds().length > 0) {
                  <div class="grid grid-cols-2 gap-2">
                    @for (bed of availableBeds(); track bed.id) {
                      <button
                        type="button"
                        (click)="assignSpecificBed.emit({ patientId: pt.id, bedId: bed.id })"
                        class="clinic-surface-tile state-layer focus-ring-m3 bg-surface-low text-main p-2.5 text-left cursor-pointer space-y-1"
                      >
                        <div class="flex items-center justify-between gap-1">
                          <span class="inline-flex items-center gap-1.5 font-mono font-bold text-label-md text-main">
                            <span [class]="'w-2 h-2 rounded-full shrink-0 ' + bedAreaDotClass(bed.area)" aria-hidden="true"></span>
                            <span>{{ bed.id }}</span>
                          </span>
                          <span class="px-1.5 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-[10px] font-semibold">
                            Libre
                          </span>
                        </div>
                        <p class="text-label-sm text-muted truncate">{{ bed.name }}</p>
                      </button>
                    }
                  </div>
                } @else {
                  <p class="text-body-sm text-muted rounded-m3-lg bg-surface-low p-3">
                    No hay camas disponibles en este momento.
                  </p>
                }
              </div>

              @if (cleaningBeds().length > 0) {
                <div class="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-outline-sub/50">
                  <span class="text-label-sm text-muted">
                    En sanitización: {{ cleaningBedIdsLabel() }}
                  </span>
                  <m3-button
                    variant="text"
                    size="xs"
                    icon="check_circle"
                    (action)="setBedStatus.emit({ bedId: cleaningBeds()[0].id, status: 'available' })"
                  >
                    Habilitar {{ cleaningBeds()[0].id }}
                  </m3-button>
                </div>
              }
            </div>
          </div>
      } @else {
        <div class="rounded-m3-xl bg-surface p-8 text-center space-y-2.5 flex-1 flex flex-col items-center justify-center">
          <div
            class="w-12 h-12 rounded-m3-full bg-surface-low text-muted grid place-items-center mx-auto"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-[24px]">person_search</span>
          </div>
          <h3 class="text-title-sm-emphasized text-main">
            Ningún paciente seleccionado
          </h3>
          <p class="text-body-sm text-muted">
            Selecciona una fila de la cola para ver su resumen clínico o asignarle una cama libre.
          </p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicPatientDetailComponent {
  readonly patient = input<PatientTriageRecord | null>(null);
  readonly nextUrgentBed = input<UrgentBedCandidate | null>(null);
  readonly allBeds = input<readonly EmergencyBed[]>([]);
  readonly isAnyDialogOpen = input<boolean>(false);
  readonly activeDialogTrigger = input<string | null>(null);
  readonly dialogMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly retriage = output<{ patientId: string; level: TriageLevel; event: Event }>();
  readonly assignUrgentBed = output<string>();
  readonly assignSpecificBed = output<{ patientId: string; bedId: string }>();
  readonly setBedStatus = output<{ bedId: string; status: BedStatus }>();
  readonly openBedsMatrix = output<void>();
  readonly openChart = output<{ patientId: string; triggerId: string }>();
  readonly openDischarge = output<{ patientId: string; triggerId: string }>();

  protected readonly levelOrder = TRIAGE_LEVEL_ORDER;
  private lastPatientId: string | null = null;
  protected readonly detailSwapSeq = signal<number>(0);

  constructor() {
    effect(() => {
      const nextId = this.patient()?.id ?? null;
      if (this.lastPatientId !== null && nextId && nextId !== this.lastPatientId) {
        this.detailSwapSeq.update((n) => n + 1);
      }
      this.lastPatientId = nextId;
    });
  }

  protected readonly detailTransitionClass = computed(() => {
    const seq = this.detailSwapSeq();
    if (seq === 0) return 'space-y-4 flex-1 flex flex-col';
    return seq % 2 === 1
      ? 'space-y-4 flex-1 flex flex-col clinic-anim-fade-a'
      : 'space-y-4 flex-1 flex flex-col clinic-anim-fade-b';
  });

  protected readonly currentAssignedBed = computed(() => {
    const bedId = this.patient()?.bedAssignedId;
    return bedId ? (this.allBeds().find((b) => b.id === bedId) ?? null) : null;
  });

  protected readonly availableBeds = computed(() =>
    this.allBeds().filter((b) => b.status === 'available' && b.id !== this.patient()?.bedAssignedId)
  );

  protected readonly summaryVitals = computed(() => {
    const pt = this.patient();
    if (!pt) return [];
    const byKey = new Map(evaluatePatientVitals(pt.vitals).map((t) => [t.key, t]));
    return [
      {
        key: 'spo2',
        label: 'SpO₂',
        value: `${pt.vitals.oxygenSat}%`,
        severity: byKey.get('oxygenSat')?.severity ?? 'normal'
      },
      {
        key: 'hr',
        label: 'FC',
        value: String(pt.vitals.heartRate),
        severity: byKey.get('heartRate')?.severity ?? 'normal'
      },
      {
        key: 'bp',
        label: 'PA',
        value: `${pt.vitals.bloodPressureSys}/${pt.vitals.bloodPressureDia}`,
        severity: byKey.get('bloodPressure')?.severity ?? 'normal'
      },
      {
        key: 'temp',
        label: 'Temp',
        value: `${pt.vitals.temperature}°`,
        severity: byKey.get('temperature')?.severity ?? 'normal'
      }
    ];
  });

  protected readonly cleaningBeds = computed(() =>
    this.allBeds().filter((b) => b.status === 'cleaning')
  );

  protected readonly cleaningBedIdsLabel = computed(() =>
    this.cleaningBeds()
      .map((b) => b.id)
      .join(', ')
  );

  protected readonly isChartOriginActive = computed(
    () =>
      this.dialogMorphOwner() === 'trigger' &&
      this.activeDialogTrigger() === 'clinic-detail-expand-btn'
  );

  protected readonly isChartOriginInvisible = computed(
    () =>
      this.isAnyDialogOpen() &&
      this.activeDialogTrigger() === 'clinic-detail-expand-btn'
  );

  protected readonly isDischargeOriginActive = computed(
    () =>
      this.dialogMorphOwner() === 'trigger' &&
      this.activeDialogTrigger() === 'clinic-detail-discharge-btn'
  );

  protected readonly isDischargeOriginInvisible = computed(
    () =>
      this.isAnyDialogOpen() &&
      this.activeDialogTrigger() === 'clinic-detail-discharge-btn'
  );

  protected triageMetaFor = (level: TriageLevel) => TRIAGE_LEVEL_META[level];
  protected newsMetaFor = (risk: PatientTriageRecord['news2']['riskLevel']) =>
    NEWS2_RISK_META[risk];
  protected slaMetaFor = (patient: PatientTriageRecord) => formatSlaMetaLabel(patient);

  protected completedCodeSteps(patient: PatientTriageRecord): number {
    return patient.activeCode?.steps.filter((s) => s.completed).length ?? 0;
  }

  protected codeProgress(patient: PatientTriageRecord): number {
    const code = patient.activeCode;
    if (!code || !code.targetMinutes) return 0;
    return Math.min(100, Math.round((code.elapsedMinutes / code.targetMinutes) * 100));
  }

  protected bedAreaTitle(area: BedArea): string {
    return BED_AREA_META.find((m) => m.area === area)?.title ?? area;
  }

  protected bedAreaDotClass(area: BedArea): string {
    if (area === 'shock_trauma') return 'bg-error';
    if (area === 'observation') return 'bg-primary';
    return 'bg-tertiary';
  }

  protected genderLabel(gender: PatientTriageRecord['gender']): string {
    if (gender === 'M') return 'Masculino';
    if (gender === 'F') return 'Femenino';
    return 'Otro';
  }
}
