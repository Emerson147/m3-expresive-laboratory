import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import {
  PatientTriageRecord,
  PatientVitals,
  TriageLevel,
  UrgentBedCandidate
} from '../../../core/clinic/clinic.models';
import { ClinicService } from '../../../core/clinic/clinic.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import {
  NEWS2_RISK_META,
  TRIAGE_LEVEL_META,
  TRIAGE_LEVEL_ORDER,
  evaluatePatientVitals
} from './clinic-ui.tokens';
import { ClinicVitalsFieldsComponent } from './clinic-vitals-fields.component';

@Component({
  selector: 'app-clinic-patient-detail',
  imports: [M3ButtonComponent, M3LinearProgressComponent, ClinicVitalsFieldsComponent],
  host: { class: 'block' },
  template: `
    @if (patient(); as pt) {
      @let triageMeta = triageMetaFor(pt.triageLevel);
      @let newsMeta = newsMetaFor(pt.news2.riskLevel);

      <div class="space-y-4">
        <!-- Acute Emergency Protocol Window (Live dot reserved solely for active code) -->
        @if (pt.activeCode; as code) {
          <div class="rounded-m3-xl bg-error-box text-on-error-box p-4 sm:p-5 space-y-3">
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="clinic-live-dot bg-error shrink-0" aria-hidden="true"></span>
                <div class="min-w-0">
                  <p class="text-title-sm-emphasized tracking-tight">
                    {{ code.title }}
                  </p>
                  <p class="text-label-sm opacity-90">
                    {{ code.windowLabel }}
                  </p>
                </div>
              </div>

              <span
                class="px-3 py-1 rounded-m3-full bg-error text-on-error text-label-sm-emphasized font-mono tabular-nums shrink-0"
              >
                {{ code.remainingMinutes }} min restantes
              </span>
            </div>

            <p class="text-body-sm leading-relaxed">
              {{ code.protocolAction }}
            </p>

            <div class="space-y-1.5">
              <div
                class="flex items-center justify-between text-label-sm font-mono tabular-nums opacity-90"
              >
                <span>Transcurrido: {{ code.elapsedMinutes }} min</span>
                <span>Meta puerta: ≤ {{ code.targetMinutes }} min</span>
              </div>

              <div class="clinic-code-progress">
                <m3-linear-progress
                  [value]="activeCodeProgress()"
                  [wavy]="false"
                  color="error"
                  size="md"
                  [ariaLabel]="'Ventana terapéutica de ' + code.title"
                />
              </div>
            </div>
          </div>
        }

        <!-- Identity, Reclassification & Chief Complaint -->
        <div class="rounded-m3-xl bg-surface p-4 sm:p-5 space-y-4">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0 space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  [class]="triageMeta.badgeClass"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-m3-full text-label-sm-emphasized uppercase tracking-wider"
                >
                  <span class="material-symbols-rounded text-[15px]" aria-hidden="true">
                    {{ triageMeta.icon }}
                  </span>
                  <span>{{ triageMeta.fullLabel }}</span>
                </span>

                <span
                  class="px-2.5 py-1 rounded-m3-full bg-surface-low text-muted text-label-sm font-mono tabular-nums"
                >
                  {{ pt.ticketCode }} · Ingreso {{ pt.admissionTime }} ({{ pt.waitingMinutes }}m)
                </span>
              </div>

              <h3 class="text-title-lg-emphasized text-main tracking-tight">
                {{ pt.fullName }}
              </h3>

              <p class="text-body-sm text-muted">
                {{ pt.age }} años · Sexo {{ genderLabel(pt.gender) }}
                @if (pt.bedAssignedId) {
                  <span> · Box {{ pt.bedAssignedId }}</span>
                } @else {
                  <span> · En espera de box</span>
                }
              </p>
            </div>
          </div>

          <!-- Primary Clinical Decisions Always Above the Fold -->
          <div class="flex flex-wrap items-center gap-2">
            @if (!pt.bedAssignedId) {
              @if (nextUrgentBed(); as candidate) {
                <m3-button
                  variant="filled"
                  size="sm"
                  [icon]="candidate.isPrimaryShockTrauma ? 'emergency' : 'bed'"
                  customClass="flex-1 min-w-[190px]"
                  (action)="assignUrgentBed.emit(pt.id)"
                >
                  {{
                    candidate.isPrimaryShockTrauma
                      ? 'Asignar Shock Trauma (' + candidate.bed.id + ')'
                      : 'Asignar Box Disponible (' + candidate.bed.id + ')'
                  }}
                </m3-button>
              } @else {
                <m3-button
                  variant="filled"
                  size="sm"
                  icon="bed"
                  [disabled]="true"
                  customClass="flex-1 min-w-[190px]"
                >
                  Sin Boxes Disponibles
                </m3-button>
              }
            } @else {
              <m3-button
                variant="filled"
                size="sm"
                icon="swap_horiz"
                customClass="flex-1 min-w-[190px]"
                (action)="openBedsMatrix.emit()"
              >
                Gestionar Box ({{ pt.bedAssignedId }})
              </m3-button>
            }

            <m3-button
              id="clinic-detail-discharge-btn"
              variant="tonal"
              size="sm"
              icon="check_circle"
              [invisible]="
                isDischargeDialogOpen() && activeDialogTrigger() === 'clinic-detail-discharge-btn'
              "
              [viewTransitionName]="
                !isDischargeDialogOpen() && activeDialogTrigger() === 'clinic-detail-discharge-btn'
                  ? 'dialog-transform'
                  : null
              "
              (action)="discharge.emit(pt.id)"
            >
              Alta Médica
            </m3-button>
          </div>

          <!-- Manchester Re-Triage Bar -->
          <div class="rounded-m3-lg bg-surface-low p-3 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-label-sm-emphasized text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-rounded text-[16px] text-primary" aria-hidden="true">
                  swap_vert
                </span>
                Reclasificar prioridad Manchester
              </span>
              <span class="text-label-sm font-mono text-muted">
                Meta: {{ triageMeta.targetWaitLabel }}
              </span>
            </div>

            <div
              role="group"
              aria-label="Reclasificar nivel de triaje Manchester"
              class="grid grid-cols-5 gap-1.5"
            >
              @for (level of levelOrder; track level) {
                @let meta = triageMetaFor(level);
                @let isCurrent = pt.triageLevel === level;
                <button
                  type="button"
                  (click)="retriage.emit({ patientId: pt.id, level, event: $event })"
                  [attr.aria-pressed]="isCurrent"
                  [attr.aria-label]="meta.fullLabel + ' (' + meta.targetWaitLabel + ')'"
                  [class]="
                    'clinic-chip-btn px-2 py-1.5 text-label-md-emphasized font-mono cursor-pointer flex items-center justify-center gap-1 ' +
                    (isCurrent
                      ? meta.badgeClass + ' font-bold'
                      : 'bg-surface hover:bg-surface-high text-muted')
                  "
                >
                  {{ meta.shortCode }}
                </button>
              }
            </div>
          </div>

          <div class="space-y-1.5">
            <p class="text-label-sm-emphasized text-muted uppercase tracking-wider">
              Motivo de consulta principal
            </p>
            <p class="rounded-m3-lg bg-surface-low p-3.5 text-body-sm text-main leading-relaxed">
              {{ pt.chiefComplaint }}
            </p>
          </div>
        </div>

        <!-- NEWS2 Assessment Card -->
        <div class="rounded-m3-xl bg-surface p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-[20px] text-primary" aria-hidden="true">
                analytics
              </span>
              <h4 class="text-title-sm-emphasized text-main uppercase tracking-wider">
                Índice Clínico NEWS2
              </h4>
            </div>

            <span
              [class]="newsMeta.pillClass"
              class="px-3 py-1 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums"
            >
              Score {{ pt.news2.score }} / 20 · {{ newsMeta.label }}
            </span>
          </div>

          <p class="text-body-sm text-muted leading-relaxed">
            {{ pt.news2.recommendation }}
          </p>

          @if (pt.news2.triggers.length > 0) {
            <div class="space-y-1.5 pt-1">
              <p class="text-label-sm-emphasized text-error uppercase tracking-wider">
                Criterios de alerta detectados
              </p>
              <ul role="list" class="list-none m-0 p-0 space-y-1.5">
                @for (trigger of pt.news2.triggers; track $index) {
                  <li
                    class="flex items-center gap-2 rounded-m3-md bg-error-box text-on-error-box px-3 py-2 text-label-md"
                  >
                    <span class="material-symbols-rounded text-[16px] shrink-0" aria-hidden="true">
                      warning
                    </span>
                    <span>{{ trigger }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Physiological Vitals with Automated Out-of-Range Highlight + Inline Re-evaluation -->
        <div class="rounded-m3-xl bg-surface p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="material-symbols-rounded text-[20px] text-primary" aria-hidden="true">
                vital_signs
              </span>
              <h4 class="text-title-sm-emphasized text-main uppercase tracking-wider">
                Signos Vitales y Rangos
              </h4>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-label-sm font-mono tabular-nums text-muted">
                EVA Dolor: <strong class="text-main">{{ pt.vitals.painScale }}/10</strong>
              </span>
              <m3-button
                variant="outlined"
                size="xs"
                [icon]="isEditingVitals() ? 'close' : 'edit_note'"
                (action)="toggleVitalsEditor(pt.vitals)"
              >
                {{ isEditingVitals() ? 'Cerrar' : 'Reevaluar' }}
              </m3-button>
            </div>
          </div>

          @if (isEditingVitals()) {
            @let liveEdited = editedPreviewNews2();
            @let liveRiskMeta = newsMetaFor(liveEdited.riskLevel);
            <form (submit)="saveVitals($event, pt.id, pt.vitals)" class="rounded-m3-lg bg-surface-low p-3.5 space-y-3">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="text-label-sm-emphasized text-muted uppercase tracking-wider">
                  Nueva toma hemodinámica
                </span>
                <span
                  [class]="liveRiskMeta.pillClass"
                  class="px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums"
                >
                  NEWS2 proyectado: {{ liveEdited.score }} / 20 · {{ liveRiskMeta.label }}
                </span>
              </div>

              <app-clinic-vitals-fields
                [(hr)]="editHr"
                [(bpSys)]="editBpSys"
                [(bpDia)]="editBpDia"
                [(spo2)]="editSpo2"
                [(temp)]="editTemp"
                [(pain)]="editPain"
              />

              <div class="flex items-center justify-end gap-2 pt-1">
                <m3-button variant="text" size="sm" (action)="isEditingVitals.set(false)">
                  Cancelar
                </m3-button>
                <m3-button type="submit" variant="filled" size="sm" icon="save">
                  Guardar Vitales
                </m3-button>
              </div>
            </form>
          }

          <div class="grid grid-cols-2 gap-2.5">
            @for (tile of vitalTiles(); track tile.key) {
              <div
                [class]="
                  tile.severity === 'critical'
                    ? 'bg-error-box text-on-error-box'
                    : tile.severity === 'warning'
                      ? 'bg-warning-box text-on-warning-box'
                      : 'bg-surface-low text-main'
                "
                class="rounded-m3-lg p-3 space-y-1.5"
              >
                <div class="flex items-center justify-between gap-1 text-label-sm opacity-85">
                  <span class="truncate">{{ tile.label }}</span>
                  <span class="font-mono shrink-0">{{ tile.referenceRange }}</span>
                </div>

                <div class="flex items-baseline justify-between gap-2">
                  <span class="text-title-md-emphasized font-mono tabular-nums">
                    {{ tile.displayValue }}
                    @if (tile.unit) {
                      <span class="text-label-sm font-normal opacity-80">{{ tile.unit }}</span>
                    }
                  </span>

                  @if (tile.severity !== 'normal') {
                    <span class="inline-flex items-center gap-0.5 text-label-sm-emphasized">
                      <span class="material-symbols-rounded text-[14px]" aria-hidden="true">
                        priority_high
                      </span>
                      <span>{{ tile.statusLabel }}</span>
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Allergies & Evolution Notes -->
        <div class="rounded-m3-xl bg-surface p-4 sm:p-5 space-y-3">
          <div class="space-y-1.5">
            <p class="text-label-sm-emphasized text-muted uppercase tracking-wider">
              Alergias documentadas
            </p>
            @if (pt.allergies && pt.allergies.length > 0) {
              <div class="flex items-center gap-1.5 flex-wrap">
                @for (allergy of pt.allergies; track $index) {
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-m3-full bg-warning-box text-on-warning-box text-label-sm-emphasized"
                  >
                    <span class="material-symbols-rounded text-[14px]" aria-hidden="true">
                      medication
                    </span>
                    {{ allergy }}
                  </span>
                }
              </div>
            } @else {
              <p class="text-body-sm text-muted">
                Sin alergias conocidas reportadas.
              </p>
            }
          </div>

          @if (pt.notes) {
            <div class="space-y-1.5 pt-1">
              <p class="text-label-sm-emphasized text-muted uppercase tracking-wider">
                Evolución e indicaciones clínicas
              </p>
              <p class="rounded-m3-lg bg-surface-low p-3 text-body-sm text-muted leading-relaxed">
                {{ pt.notes }}
              </p>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="rounded-m3-xl bg-surface p-8 text-center space-y-2.5">
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
          Elige un registro en la cola de triaje para consultar su score NEWS2, signos vitales y asignación de box.
        </p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicPatientDetailComponent {
  readonly patient = input<PatientTriageRecord | null>(null);
  readonly nextUrgentBed = input<UrgentBedCandidate | null>(null);
  readonly isDischargeDialogOpen = input<boolean>(false);
  readonly activeDialogTrigger = input<string | null>(null);

  readonly retriage = output<{ patientId: string; level: TriageLevel; event: Event }>();
  readonly assignUrgentBed = output<string>();
  readonly openBedsMatrix = output<void>();
  readonly discharge = output<string>();
  readonly updateVitals = output<{ patientId: string; vitals: PatientVitals }>();

  protected readonly levelOrder = TRIAGE_LEVEL_ORDER;

  readonly isEditingVitals = signal<boolean>(false);
  readonly editHr = signal<string>('');
  readonly editBpSys = signal<string>('');
  readonly editBpDia = signal<string>('');
  readonly editSpo2 = signal<string>('');
  readonly editTemp = signal<string>('');
  readonly editPain = signal<string>('');

  private lastPatientId: string | null = null;

  constructor() {
    effect(() => {
      const id = this.patient()?.id ?? null;
      if (id !== this.lastPatientId) {
        this.lastPatientId = id;
        this.isEditingVitals.set(false);
      }
    });
  }

  protected readonly editedPreviewNews2 = computed(() => {
    const pt = this.patient();
    if (!pt) {
      return ClinicService.computeNews2({
        heartRate: 80,
        bloodPressureSys: 120,
        bloodPressureDia: 80,
        oxygenSat: 98,
        temperature: 36.7,
        painScale: 0
      });
    }
    return ClinicService.computeNews2(this.buildEditedVitals(pt.vitals));
  });

  protected readonly activeCodeProgress = computed(() => {
    const code = this.patient()?.activeCode;
    if (!code || !code.targetMinutes) return 0;
    return Math.min(100, Math.round((code.elapsedMinutes / code.targetMinutes) * 100));
  });

  protected readonly vitalTiles = computed(() => {
    const pt = this.patient();
    return pt ? evaluatePatientVitals(pt.vitals) : [];
  });

  protected toggleVitalsEditor(vitals: PatientVitals): void {
    const next = !this.isEditingVitals();
    if (next) {
      this.editHr.set(String(vitals.heartRate));
      this.editBpSys.set(String(vitals.bloodPressureSys));
      this.editBpDia.set(String(vitals.bloodPressureDia));
      this.editSpo2.set(String(vitals.oxygenSat));
      this.editTemp.set(String(vitals.temperature));
      this.editPain.set(String(vitals.painScale));
    }
    this.isEditingVitals.set(next);
  }

  protected saveVitals(event: Event, patientId: string, fallback: PatientVitals): void {
    event.preventDefault();
    this.updateVitals.emit({
      patientId,
      vitals: this.buildEditedVitals(fallback)
    });
    this.isEditingVitals.set(false);
  }

  private buildEditedVitals(fallback: PatientVitals): PatientVitals {
    return {
      heartRate: this.parseNum(this.editHr(), fallback.heartRate),
      bloodPressureSys: this.parseNum(this.editBpSys(), fallback.bloodPressureSys),
      bloodPressureDia: this.parseNum(this.editBpDia(), fallback.bloodPressureDia),
      oxygenSat: this.parseNum(this.editSpo2(), fallback.oxygenSat),
      temperature: this.parseNum(this.editTemp(), fallback.temperature),
      painScale: Math.min(10, Math.max(0, this.parseNum(this.editPain(), fallback.painScale)))
    };
  }

  private parseNum(raw: string, fallback: number): number {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && raw.trim() !== '' ? parsed : fallback;
  }

  protected triageMetaFor = (level: TriageLevel) => TRIAGE_LEVEL_META[level];

  protected newsMetaFor = (risk: PatientTriageRecord['news2']['riskLevel']) =>
    NEWS2_RISK_META[risk];

  protected genderLabel(gender: PatientTriageRecord['gender']): string {
    if (gender === 'M') return 'Masculino';
    if (gender === 'F') return 'Femenino';
    return 'Otro';
  }
}
