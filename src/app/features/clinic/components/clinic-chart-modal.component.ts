import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  ClinicalNoteEntry,
  ConsciousnessLevel,
  EmergencyCodeType,
  PatientTriageRecord,
  PatientVitals,
  TriageLevel
} from '../../../core/clinic/clinic.models';
import { ClinicService } from '../../../core/clinic/clinic.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import {
  EMERGENCY_CODE_OPTIONS,
  NEWS2_RISK_META,
  TRIAGE_LEVEL_META,
  TRIAGE_LEVEL_ORDER,
  evaluatePatientVitals,
  formatSlaMetaLabel
} from './clinic-ui.tokens';
import { ClinicVitalsFieldsComponent } from './clinic-vitals-fields.component';

export type ClinicChartTabId = 'clinical' | 'vitals' | 'orders';

interface ClinicChartTabConfig {
  id: ClinicChartTabId;
  label: string;
  icon: string;
  panelId: string;
  badgeText?: string;
  badgeClass?: string;
}

const CHART_TAB_ORDER: Record<ClinicChartTabId, number> = {
  clinical: 0,
  vitals: 1,
  orders: 2
};

const NOTE_KIND_OPTIONS: M3ButtonGroupOption[] = [
  { id: 'evolution', label: 'Evolución', icon: 'clinical_notes' },
  { id: 'order', label: 'Indicación', icon: 'prescriptions' }
];

const QUICK_EVOLUTION_PRESETS: readonly string[] = [
  'Estable bajo vigilancia',
  'Buena respuesta a O₂',
  'Reevaluado sin focalidad nueva',
  'Pendiente resultados de lab.'
];

const QUICK_ORDER_PRESETS: readonly string[] = [
  'Control vitales c/15 min',
  'Vía periférica + SF 0.9%',
  'Lab. urgencia + gases art.',
  'ECG 12 derivaciones'
];

@Component({
  selector: 'app-clinic-chart-modal',
  imports: [
    M3DialogComponent,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CheckboxComponent,
    M3ChipComponent,
    M3LinearProgressComponent,
    M3TextFieldComponent,
    ClinicVitalsFieldsComponent
  ],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="xl"
      [open]="open() && !!patient()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Historia Clínica de Guardia"
      [viewTransitionName]="viewTransitionName()"
      customClass="clinic-modal-dialog clinic-modal-xl"
      (closeRequested)="close.emit()"
    >
      @if (open() && patient(); as pt) {
        @let triageMeta = triageMetaFor(pt.triageLevel);
        @let newsMeta = newsMetaFor(pt.news2.riskLevel);
        @let slaMeta = slaMetaFor(pt);

        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <!-- Fixed Clinical Header + Homogeneous Lateral Peer Tabs -->
          <div class="px-5 sm:px-6 pt-5 pb-0 shrink-0 space-y-3">
            <header class="bg-surface rounded-m3-xl p-3.5 sm:p-4 flex items-start justify-between gap-3 flex-wrap">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  [class]="triageMeta.badgeClass + ' w-11 h-11 rounded-m3-lg grid place-items-center shrink-0'"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[22px]">{{ triageMeta.icon }}</span>
                </div>
                <div class="min-w-0 space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      [class]="
                        triageMeta.badgeClass +
                        ' px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono uppercase'
                      "
                    >
                      {{ triageMeta.fullLabel }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-m3-full bg-surface-low text-muted text-label-sm font-mono">
                      {{ pt.ticketCode }} · Ingreso {{ pt.admissionTime }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-m3-full bg-surface-low text-main text-label-sm font-mono">
                      {{ pt.bedAssignedId ? 'Box ' + pt.bedAssignedId : 'Sin Box asignado' }}
                    </span>
                    <span
                      [class]="
                        (slaMeta.breached ? 'bg-error-box text-on-error-box font-semibold' : 'bg-surface-low text-muted') +
                        ' px-2.5 py-0.5 rounded-m3-full text-label-sm font-mono'
                      "
                    >
                      {{ slaMeta.label }}
                    </span>
                  </div>

                  <h3 class="text-title-lg-emphasized text-main tracking-tight">
                    {{ pt.fullName }}
                    <span class="text-body-sm font-normal text-muted ml-2">
                      {{ pt.age }} años · {{ genderLabel(pt.gender) }}
                    </span>
                  </h3>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <m3-button
                  variant="tonal"
                  size="sm"
                  icon="check_circle"
                  (action)="openDischarge.emit(pt.id)"
                >
                  Egreso / Pase
                </m3-button>
                <m3-button
                  variant="text"
                  size="sm"
                  icon="close"
                  [iconOnly]="true"
                  ariaLabel="Cerrar historia clínica"
                  (action)="close.emit()"
                />
              </div>
            </header>

            <!-- High-Visibility Allergies Safety Strip Always Pinned -->
            @if (pt.allergies.length > 0) {
              <div
                role="alert"
                class="rounded-m3-lg bg-warning-box text-on-warning-box px-4 py-2 flex items-center justify-between gap-2 flex-wrap"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="material-symbols-rounded text-[18px] shrink-0" aria-hidden="true">
                    medication_liquid
                  </span>
                  <span class="text-label-md-emphasized">
                    Alergias declaradas: {{ pt.allergies.join(' · ') }}
                  </span>
                </div>
                <span class="text-label-sm font-mono uppercase tracking-wider opacity-85">
                  Alerta Seguridad
                </span>
              </div>
            }

            <!-- M3 Pattern 3 · Curved Expressive Sliding Capsule Peer Navigation -->
            <div class="clinic-chart-tab-track rounded-m3-xl p-1 overflow-hidden bg-surface-low border border-outline-sub">
              <div
                role="tablist"
                aria-label="Secciones homogéneas de historia clínica"
                class="relative grid grid-cols-3 items-stretch"
                [style.--clinic-tab-index]="activeTabIndex()"
              >
                <span class="clinic-chart-tab-thumb" aria-hidden="true"></span>
                @for (tab of chartTabs(); track tab.id; let i = $index) {
                  @let isSelected = activeTab() === tab.id;
                  <button
                    #chartTabBtn
                    type="button"
                    role="tab"
                    class="clinic-chart-tab-btn state-layer focus-ring-m3 flex items-center justify-center gap-1.5 px-2 sm:px-3.5 py-1.5 text-label-md-emphasized cursor-pointer min-w-0"
                    [id]="'clinic-chart-tab-' + tab.id"
                    [attr.aria-selected]="isSelected"
                    [attr.aria-controls]="tab.panelId"
                    [attr.tabindex]="isSelected ? 0 : -1"
                    (click)="selectChartTab(tab.id)"
                    (keydown)="onTabKeydown($event, i)"
                  >
                    <span class="material-symbols-rounded text-[18px] shrink-0" aria-hidden="true">
                      {{ tab.icon }}
                    </span>
                    <span class="truncate">{{ tab.label }}</span>
                    @if (tab.badgeText) {
                      <span
                        [class]="
                          (tab.badgeClass ?? 'bg-sec-box text-on-sec-box') +
                          ' px-2 py-0.5 rounded-m3-full text-[10px] font-mono font-bold leading-none shrink-0 hidden sm:inline-flex items-center'
                        "
                      >
                        {{ tab.badgeText }}
                      </span>
                    }
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Lateral Stage Container (Strict Unison Slide without Fade, consistent desktop height) -->
          <div #modalScrollBody class="px-5 sm:px-6 py-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden m3-scrollbar">
            <div class="overflow-hidden rounded-m3-xl lg:min-h-[25.5rem] lg:grid lg:grid-rows-1">
              @for (seq of [tabTransitionSeq()]; track seq) {
                <div [class]="lateralStageClass()">
                  <!-- PEER TAB 1: Clínica, Manchester, Alergias & Protocolo Activo -->
                  @if (activeTab() === 'clinical') {
                    <div
                      id="clinic-chart-panel-clinical"
                      role="tabpanel"
                      aria-labelledby="clinic-chart-tab-clinical"
                      class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-full"
                    >
                    <section class="lg:col-span-6 rounded-m3-xl bg-surface p-4 flex flex-col justify-between gap-4">
                      <div class="space-y-3">
                        <div>
                          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block mb-1">
                            Motivo de consulta principal
                          </span>
                          <p class="rounded-m3-lg bg-surface-low p-3 text-body-sm text-main leading-relaxed">
                            {{ pt.chiefComplaint }}
                          </p>
                        </div>

                        <div class="rounded-m3-lg bg-surface-low p-3 space-y-2">
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-label-sm-emphasized text-muted uppercase tracking-wider">
                              Prioridad Manchester
                            </span>
                            <span class="text-label-sm font-mono text-muted">
                              Meta: {{ triageMeta.targetWaitLabel }}
                            </span>
                          </div>
                          <div role="group" aria-label="Reclasificar prioridad Manchester" class="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                            @for (level of levelOrder; track level) {
                              @let meta = triageMetaFor(level);
                              @let isCurrent = pt.triageLevel === level;
                              <button
                                type="button"
                                (click)="retriage.emit({ patientId: pt.id, level, event: $event })"
                                [attr.aria-pressed]="isCurrent"
                                [attr.aria-label]="meta.fullLabel"
                                [class]="
                                  'clinic-chip-btn state-layer focus-ring-m3 px-2 py-1 text-label-md-emphasized font-mono cursor-pointer flex items-center justify-center ' +
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
                      </div>

                      <div class="rounded-m3-lg bg-surface-low p-3 space-y-2.5">
                        <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block">
                          Gestión de Alergias Conocidas
                        </span>
                        @if (pt.allergies.length > 0) {
                          <div class="flex items-center gap-1.5 flex-wrap">
                            @for (allergy of pt.allergies; track allergy) {
                              <m3-chip
                                type="input"
                                icon="medication"
                                [removable]="true"
                                [removeLabel]="'Retirar alergia ' + allergy"
                                (remove)="removeAllergy.emit({ patientId: pt.id, allergy })"
                              >
                                {{ allergy }}
                              </m3-chip>
                            }
                          </div>
                        } @else {
                          <p class="text-body-sm text-muted">Sin alergias conocidas documentadas.</p>
                        }

                        <form (submit)="submitAllergy($event, pt.id)" class="flex items-center gap-2">
                          <div class="flex-1 min-w-0">
                            <m3-text-field
                              variant="outlined"
                              label="Añadir alergia"
                              placeholder="Ej: Ibuprofeno..."
                              [value]="newAllergyText()"
                              (valueChange)="newAllergyText.set($event)"
                            />
                          </div>
                          <m3-button
                            type="submit"
                            variant="tonal"
                            size="sm"
                            icon="add"
                            [disabled]="!newAllergyText().trim()"
                          >
                            Añadir
                          </m3-button>
                        </form>
                      </div>
                    </section>

                    <section class="lg:col-span-6 rounded-m3-xl bg-surface p-4 flex flex-col justify-between gap-3.5">
                      @if (pt.activeCode; as code) {
                        <div class="rounded-m3-lg bg-error-box text-on-error-box p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div class="space-y-2.5">
                            <div class="flex items-start justify-between gap-2 flex-wrap">
                              <div class="flex items-center gap-2 min-w-0">
                                <span class="clinic-live-dot bg-error shrink-0" aria-hidden="true"></span>
                                <div>
                                  <p class="text-title-sm-emphasized">{{ code.title }}</p>
                                  <p class="text-label-sm opacity-90">{{ code.windowLabel }}</p>
                                </div>
                              </div>
                              <span class="px-2.5 py-0.5 rounded-m3-full bg-error text-on-error text-label-sm-emphasized font-mono tabular-nums">
                                {{ code.remainingMinutes }} min rest.
                              </span>
                            </div>

                            <p class="text-body-sm leading-relaxed">{{ code.protocolAction }}</p>

                            <div class="space-y-1">
                              <div class="flex items-center justify-between text-label-sm font-mono opacity-90">
                                <span>Transcurrido: {{ code.elapsedMinutes }} min</span>
                                <span>Meta ≤ {{ code.targetMinutes }} min</span>
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

                          @if (code.steps.length > 0) {
                            <div class="rounded-m3-lg bg-surface text-main p-3 space-y-1">
                              <div class="flex items-center justify-between gap-2 pb-1">
                                <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                                  Checklist de Protocolo Activo
                                </span>
                                <span class="text-label-sm font-mono font-semibold text-primary">
                                  {{ completedStepsCount() }}/{{ code.steps.length }}
                                </span>
                              </div>
                              @for (step of code.steps; track step.id) {
                                <m3-checkbox
                                  [checked]="step.completed"
                                  [label]="step.label"
                                  (changed)="toggleCodeStep.emit({ patientId: pt.id, stepId: step.id })"
                                />
                              }
                            </div>
                          }
                        </div>

                        <div class="space-y-2">
                          <div class="rounded-m3-lg bg-surface-low px-3 py-2 flex items-center justify-between gap-2">
                            <span class="text-label-sm font-medium text-muted">Protocolo clínico activo</span>
                            <m3-button
                              variant="text"
                              size="xs"
                              icon="swap_horiz"
                              (action)="isCodePickerOpen.set(!isCodePickerOpen())"
                            >
                              {{ isCodePickerOpen() ? 'Ocultar' : 'Cambiar / Cerrar' }}
                            </m3-button>
                          </div>

                          @if (isCodePickerOpen()) {
                            <div class="flex flex-wrap gap-1.5" role="group" aria-label="Cambiar o cerrar código clínico">
                              @for (codeOpt of codeOptions; track codeOpt.shortLabel) {
                                @let isCodeActive = code.type === codeOpt.type;
                                <button
                                  type="button"
                                  (click)="selectEmergencyCode(pt.id, codeOpt.type)"
                                  [attr.aria-pressed]="isCodeActive"
                                  [class]="
                                    'clinic-chip-btn state-layer focus-ring-m3 px-2.5 py-1 text-label-sm-emphasized cursor-pointer flex items-center gap-1 ' +
                                    (isCodeActive
                                      ? 'bg-error-box text-on-error-box font-bold'
                                      : 'bg-surface-low hover:bg-surface-high text-muted')
                                  "
                                >
                                  <span>{{ codeOpt.shortLabel }}</span>
                                </button>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="rounded-m3-lg bg-surface-low p-5 flex-1 flex flex-col justify-center space-y-4">
                          <div class="space-y-1">
                            <h4 class="text-title-sm-emphasized text-main flex items-center gap-2">
                              <span class="material-symbols-rounded text-[19px] text-primary" aria-hidden="true">bolt</span>
                              <span>Protocolo / Código de Emergencia</span>
                            </h4>
                            <p class="text-body-sm text-muted">
                              Sin código tiempo-dependiente activo. Puedes activar un protocolo de alerta crítica en 1 clic si cambia el cuadro clínico.
                            </p>
                          </div>
                          <div class="flex flex-wrap gap-2" role="group" aria-label="Activar código clínico">
                            @for (codeOpt of codeOptions; track codeOpt.shortLabel) {
                              @if (codeOpt.type) {
                                <button
                                  type="button"
                                  (click)="selectEmergencyCode(pt.id, codeOpt.type)"
                                  class="clinic-chip-btn state-layer focus-ring-m3 px-3 py-1.5 text-label-sm-emphasized cursor-pointer flex items-center gap-1.5 bg-surface hover:bg-error-box hover:text-on-error-box text-main"
                                >
                                  <span class="material-symbols-rounded text-[15px]" aria-hidden="true">bolt</span>
                                  <span>{{ codeOpt.shortLabel }}</span>
                                </button>
                              }
                            }
                          </div>
                        </div>
                      }
                    </section>
                  </div>
                }

                <!-- PEER TAB 2: Signos Vitales, NEWS2 & Tendencia (+ M3 Pattern 2 Forward/Backward para Reevaluar) -->
                @else if (activeTab() === 'vitals') {
                  <div
                    id="clinic-chart-panel-vitals"
                    role="tabpanel"
                    aria-labelledby="clinic-chart-tab-vitals"
                    class="h-full"
                  >
                    @for (vSeq of [vitalsViewSeq()]; track vSeq) {
                      <div [class]="vitalsTransitionClass()">
                        @if (isEditingVitals()) {
                          @let projected = projectedNews2();
                          @let projMeta = newsMetaFor(projected.riskLevel);
                          @let diff = projected.score - pt.news2.score;

                          <form
                            (submit)="saveVitals($event, pt)"
                            class="rounded-m3-xl bg-surface p-4 sm:p-5 space-y-4 min-h-full flex flex-col justify-between"
                          >
                            <div class="flex items-center justify-between gap-3 flex-wrap pb-2 border-b border-outline-sub">
                              <div class="flex items-center gap-2">
                                <m3-button
                                  variant="text"
                                  size="sm"
                                  icon="arrow_back"
                                  (action)="closeVitalsForwardView()"
                                >
                                  Volver a lectura actual
                                </m3-button>
                              </div>

                              <div class="flex items-center gap-2 flex-wrap">
                                @if (diff !== 0) {
                                  <span
                                    [class]="
                                      (diff > 0 ? 'bg-error-box text-on-error-box' : 'bg-success-box text-on-success-box') +
                                      ' px-2.5 py-0.5 rounded-m3-full text-label-sm font-mono font-bold'
                                    "
                                  >
                                    {{ diff > 0 ? '▲ +' + diff : '▼ ' + diff }} pts
                                  </span>
                                }
                                <span
                                  [class]="
                                    projMeta.pillClass +
                                    ' px-3 py-1 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums'
                                  "
                                >
                                  Proyectado: {{ projected.score }} / 20 · {{ projMeta.label }}
                                </span>
                              </div>
                            </div>

                            <app-clinic-vitals-fields
                              [(hr)]="editHr"
                              [(rr)]="editRr"
                              [(bpSys)]="editBpSys"
                              [(bpDia)]="editBpDia"
                              [(spo2)]="editSpo2"
                              [(temp)]="editTemp"
                              [(pain)]="editPain"
                              [(consciousness)]="editConsciousness"
                              [(supplementalO2)]="editO2"
                            />

                            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                              <div class="flex-1 min-w-0">
                                <m3-text-field
                                  variant="filled"
                                  label="Nota de reevaluación (opcional)"
                                  placeholder="Ej: Respuesta tras oxigenoterapia y broncodilatador..."
                                  [value]="editVitalsNote()"
                                  (valueChange)="editVitalsNote.set($event)"
                                />
                              </div>
                              <m3-button type="submit" variant="filled" size="md" icon="save">
                                Guardar Toma
                              </m3-button>
                            </div>
                          </form>
                        } @else {
                          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-full">
                            <!-- Left 7 cols: All Physiological Tiles -->
                            <section class="lg:col-span-7 rounded-m3-xl bg-surface p-4 flex flex-col justify-between gap-3.5">
                              <div class="flex items-center justify-between gap-2 flex-wrap">
                                <div class="flex items-center gap-2">
                                  <span class="material-symbols-rounded text-[20px] text-primary" aria-hidden="true">
                                    vital_signs
                                  </span>
                                  <h4 class="text-title-sm-emphasized text-main uppercase tracking-wider">
                                    Parámetros Hemodinámicos
                                  </h4>
                                </div>

                                <m3-button
                                  variant="tonal"
                                  size="sm"
                                  icon="arrow_forward"
                                  [iconTrailing]="true"
                                  (action)="openVitalsForwardView(pt)"
                                >
                                  Reevaluar Vitales
                                </m3-button>
                              </div>

                              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
                                @for (tile of vitalTiles(); track tile.key) {
                                  <div
                                    [class]="
                                      (tile.severity === 'critical'
                                        ? 'bg-error-box text-on-error-box'
                                        : tile.severity === 'warning'
                                          ? 'bg-warning-box text-on-warning-box'
                                          : 'bg-surface-low text-main') +
                                      ' rounded-m3-lg p-3 flex flex-col justify-between gap-1.5'
                                    "
                                  >
                                    <div class="flex items-center justify-between gap-1 text-label-sm opacity-85">
                                      <span class="truncate">{{ tile.label }}</span>
                                      <span class="font-mono shrink-0">{{ tile.referenceRange }}</span>
                                    </div>
                                    <span class="text-title-lg-emphasized font-mono tabular-nums">
                                      {{ tile.displayValue }}
                                      @if (tile.unit) {
                                        <span class="text-label-sm font-normal opacity-80">{{ tile.unit }}</span>
                                      }
                                    </span>
                                  </div>
                                }

                                <div
                                  [class]="
                                    (pt.vitals.consciousness && pt.vitals.consciousness !== 'A'
                                      ? 'bg-error-box text-on-error-box'
                                      : 'bg-surface-low text-main') +
                                    ' rounded-m3-lg p-3 flex flex-col justify-between gap-1.5'
                                  "
                                >
                                  <div class="flex items-center justify-between gap-1.5 text-label-sm">
                                    <span class="truncate opacity-85">ACVPU · Dolor</span>
                                    @if (pt.vitals.supplementalO2) {
                                      <span class="px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box font-mono font-semibold shrink-0">
                                        +O₂
                                      </span>
                                    } @else {
                                      <span class="font-mono opacity-80 shrink-0">Aire amb.</span>
                                    }
                                  </div>
                                  <span class="text-title-lg-emphasized font-mono tabular-nums">
                                    {{ pt.vitals.consciousness ?? 'A' }}
                                    <span class="text-label-sm font-normal opacity-80">
                                      · EVA {{ pt.vitals.painScale }}/10
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </section>

                            <!-- Right 5 cols: NEWS2 Risk + Triggers + Trend History -->
                            <section class="lg:col-span-5 rounded-m3-xl bg-surface p-4 flex flex-col justify-between gap-3">
                              <div class="space-y-3">
                                <div class="flex items-center justify-between gap-2 flex-wrap">
                                  <span class="text-title-sm-emphasized text-main uppercase tracking-wider">
                                    Índice NEWS2
                                  </span>
                                  <div class="flex items-center gap-1.5">
                                    @if (news2Delta(); as delta) {
                                      <span
                                        [class]="
                                          (delta.diff > 0
                                            ? 'bg-error-box text-on-error-box'
                                            : delta.diff < 0
                                              ? 'bg-success-box text-on-success-box'
                                              : 'bg-surface-low text-muted') +
                                          ' px-2 py-0.5 rounded-m3-full text-label-sm font-mono font-semibold'
                                        "
                                      >
                                        {{ delta.label }}
                                      </span>
                                    }
                                    <span
                                      [class]="
                                        newsMeta.pillClass +
                                        ' px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums'
                                      "
                                    >
                                      {{ pt.news2.score }} / 20 · {{ newsMeta.label }}
                                    </span>
                                  </div>
                                </div>

                                <p class="text-body-sm text-muted leading-relaxed">
                                  {{ pt.news2.recommendation }}
                                </p>

                                @if (pt.news2.triggers.length > 0) {
                                  <ul role="list" class="list-none m-0 p-0 space-y-1.5">
                                    @for (trigger of pt.news2.triggers; track $index) {
                                      <li class="rounded-m3-md bg-error-box text-on-error-box px-3 py-1.5 text-label-sm flex items-center gap-1.5">
                                        <span class="material-symbols-rounded text-[15px] shrink-0" aria-hidden="true">warning</span>
                                        <span>{{ trigger }}</span>
                                      </li>
                                    }
                                  </ul>
                                }
                              </div>

                              <div class="rounded-m3-lg bg-surface-low p-3 space-y-1.5">
                                <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block">
                                  Historial de Tomas ({{ pt.vitalsHistory.length }})
                                </span>
                                <ul role="list" class="list-none m-0 p-0 space-y-1 max-h-28 overflow-y-auto m3-scrollbar">
                                  @for (snap of pt.vitalsHistory; track snap.id) {
                                    <li class="flex items-center justify-between gap-2 text-label-sm font-mono tabular-nums">
                                      <span class="text-muted shrink-0">{{ snap.timestamp }}</span>
                                      <span class="text-main truncate">
                                        SpO₂ {{ snap.vitals.oxygenSat }}% · FC {{ snap.vitals.heartRate }}
                                      </span>
                                      <span [class]="newsMetaFor(snap.riskLevel).pillClass + ' px-2 py-0.5 rounded-m3-full font-semibold shrink-0'">
                                        N2 {{ snap.news2Score }}
                                      </span>
                                    </li>
                                  }
                                </ul>
                              </div>
                            </section>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }

                <!-- PEER TAB 3: Evolución Clínica & Órdenes Médicas -->
                @else {
                  <div
                    id="clinic-chart-panel-orders"
                    role="tabpanel"
                    aria-labelledby="clinic-chart-tab-orders"
                    class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-full"
                  >
                    <section class="lg:col-span-5 rounded-m3-xl bg-surface p-4 flex flex-col justify-between gap-3">
                      <form (submit)="submitNote($event, pt.id)" class="flex-1 flex flex-col justify-between gap-3">
                        <div class="space-y-3">
                          <div class="flex items-center justify-between gap-2 flex-wrap">
                            <h4 class="text-title-sm-emphasized text-main uppercase tracking-wider">
                              Nuevo Registro
                            </h4>
                            <m3-button-group
                              variant="connected"
                              size="xs"
                              selectionMode="single"
                              ariaLabel="Tipo de nota clínica"
                              [options]="noteKindOptions"
                              [value]="[noteKind()]"
                              (selectionChange)="onNoteKindChange($event)"
                            />
                          </div>

                          <m3-text-field
                            class="block"
                            variant="filled"
                            [label]="noteKind() === 'order' ? 'Nueva indicación médica' : 'Nota de evolución'"
                            placeholder="Ej: Control de enzimas en 2h, hidratación IV..."
                            [multiline]="true"
                            [rows]="4"
                            [autoGrow]="true"
                            [value]="newNoteText()"
                            (valueChange)="newNoteText.set($event)"
                          />

                          <div class="space-y-1.5">
                            <span class="text-label-sm font-medium text-muted block">
                              Plantillas rápidas de guardia
                            </span>
                            <div class="flex flex-wrap gap-1.5" role="group" aria-label="Plantillas rápidas de nota clínica">
                              @for (preset of notePresets(); track preset) {
                                <button
                                  type="button"
                                  (click)="applyNotePreset(preset)"
                                  class="clinic-chip-btn state-layer focus-ring-m3 px-2.5 py-1 text-label-sm font-medium cursor-pointer bg-surface-low hover:bg-surface-high text-main flex items-center gap-1"
                                >
                                  <span class="material-symbols-rounded text-[14px] text-primary" aria-hidden="true">add</span>
                                  <span>{{ preset }}</span>
                                </button>
                              }
                            </div>
                          </div>
                        </div>

                        <div class="flex justify-end pt-1">
                          <m3-button
                            type="submit"
                            variant="filled"
                            size="md"
                            icon="add_notes"
                            [disabled]="!newNoteText().trim()"
                          >
                            Registrar en Historia
                          </m3-button>
                        </div>
                      </form>
                    </section>

                    <section class="lg:col-span-7 rounded-m3-xl bg-surface p-4 flex flex-col gap-3">
                      <div class="flex items-center justify-between gap-2">
                        <h4 class="text-title-sm-emphasized text-main uppercase tracking-wider">
                          Bitácora Clínica del Turno ({{ pt.clinicalLog.length }})
                        </h4>
                        <span class="text-label-sm font-mono text-muted">
                          {{ pt.ticketCode }} · Ingreso {{ pt.admissionTime }}
                        </span>
                      </div>

                      @if (pt.clinicalLog.length > 0) {
                        <ul role="list" class="list-none m-0 p-0 space-y-2 flex-1 min-h-0 max-h-[19.5rem] overflow-y-auto m3-scrollbar pr-1">
                          @for (entry of pt.clinicalLog; track entry.id) {
                            <li class="rounded-m3-lg bg-surface-low p-3 space-y-1">
                              <div class="flex items-center justify-between gap-2 text-label-sm">
                                <span
                                  [class]="
                                    (entry.kind === 'alert'
                                      ? 'bg-error-box text-on-error-box'
                                      : entry.kind === 'order'
                                        ? 'bg-primary-box text-on-primary-box'
                                        : 'bg-surface text-muted') +
                                    ' px-2 py-0.5 rounded-m3-full font-semibold'
                                  "
                                >
                                  {{ entry.author }}
                                </span>
                                <span class="font-mono text-muted">{{ entry.timestamp }}</span>
                              </div>
                              <p class="text-body-sm text-main leading-relaxed">{{ entry.text }}</p>
                            </li>
                          }
                        </ul>
                      } @else {
                        <p class="text-body-sm text-muted py-6 text-center rounded-m3-lg bg-surface-low flex-1 flex items-center justify-center">
                          Sin anotaciones clínicas registradas todavía en este turno.
                        </p>
                      }
                    </section>
                  </div>
                }
                </div>
              }
            </div>
          </div>

          <footer class="px-5 sm:px-6 pb-5 pt-2.5 shrink-0 flex items-center justify-end gap-2">
            <m3-button variant="tonal" size="md" (action)="close.emit()">
              Cerrar Historia
            </m3-button>
          </footer>
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicChartModalComponent {
  private readonly injector = inject(Injector);
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private readonly chartTabBtns = viewChildren<ElementRef<HTMLButtonElement>>('chartTabBtn');

  readonly open = input<boolean>(false);
  readonly patient = input<PatientTriageRecord | null>(null);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly retriage = output<{ patientId: string; level: TriageLevel; event: Event }>();
  readonly openDischarge = output<string>();
  readonly toggleCodeStep = output<{ patientId: string; stepId: string }>();
  readonly saveVitalsSnapshot = output<{ patientId: string; vitals: PatientVitals; note?: string }>();
  readonly addNote = output<{ patientId: string; text: string; kind: ClinicalNoteEntry['kind'] }>();
  readonly addAllergy = output<{ patientId: string; allergy: string }>();
  readonly removeAllergy = output<{ patientId: string; allergy: string }>();
  readonly setEmergencyCode = output<{ patientId: string; codeType: EmergencyCodeType | null }>();

  protected readonly levelOrder = TRIAGE_LEVEL_ORDER;
  protected readonly codeOptions = EMERGENCY_CODE_OPTIONS;
  protected readonly noteKindOptions = NOTE_KIND_OPTIONS;

  readonly activeTab = signal<ClinicChartTabId>('clinical');
  readonly lateralDirection = signal<'next' | 'prev'>('next');
  readonly tabTransitionSeq = signal<number>(0);

  readonly isEditingVitals = signal<boolean>(false);
  readonly vitalsNavDirection = signal<'forward' | 'backward'>('forward');
  readonly vitalsViewSeq = signal<number>(0);

  readonly isCodePickerOpen = signal<boolean>(false);
  readonly editHr = signal<string>('80');
  readonly editRr = signal<string>('16');
  readonly editBpSys = signal<string>('120');
  readonly editBpDia = signal<string>('80');
  readonly editSpo2 = signal<string>('98');
  readonly editTemp = signal<string>('36.7');
  readonly editPain = signal<string>('0');
  readonly editConsciousness = signal<ConsciousnessLevel>('A');
  readonly editO2 = signal<boolean>(false);
  readonly editVitalsNote = signal<string>('');

  readonly newNoteText = signal<string>('');
  readonly noteKind = signal<ClinicalNoteEntry['kind']>('evolution');
  readonly newAllergyText = signal<string>('');

  private wasOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        this.activeTab.set('clinical');
        this.tabTransitionSeq.set(0);
        this.isEditingVitals.set(false);
        this.vitalsViewSeq.set(0);
        this.isCodePickerOpen.set(false);
        this.newNoteText.set('');
        this.newAllergyText.set('');
        untracked(() => {
          afterNextRender(
            () => {
              const el = this.modalScrollBody()?.nativeElement;
              if (el) el.scrollTop = 0;
            },
            { injector: this.injector }
          );
        });
      }
      this.wasOpen = isOpen;
    });
  }

  readonly activeTabIndex = computed(() => CHART_TAB_ORDER[this.activeTab()]);

  protected readonly notePresets = computed(() =>
    this.noteKind() === 'order' ? QUICK_ORDER_PRESETS : QUICK_EVOLUTION_PRESETS
  );

  protected readonly chartTabs = computed<ClinicChartTabConfig[]>(() => {
    const pt = this.patient();
    const activeCode = pt?.activeCode ?? null;
    const completedSteps = activeCode ? activeCode.steps.filter((s) => s.completed).length : 0;
    const newsRisk = pt?.news2.riskLevel ?? 'low';

    return [
      {
        id: 'clinical',
        label: 'Clínica & Protocolo',
        icon: 'emergency',
        panelId: 'clinic-chart-panel-clinical',
        badgeText: activeCode ? `${completedSteps}/${activeCode.steps.length}` : undefined,
        badgeClass: 'bg-error-box text-on-error-box'
      },
      {
        id: 'vitals',
        label: 'Monitor & Vitales',
        icon: 'vital_signs',
        panelId: 'clinic-chart-panel-vitals',
        badgeText: pt ? `NEWS2 ${pt.news2.score}` : undefined,
        badgeClass: NEWS2_RISK_META[newsRisk].alertClass
      },
      {
        id: 'orders',
        label: 'Evolución & Órdenes',
        icon: 'clinical_notes',
        panelId: 'clinic-chart-panel-orders',
        badgeText: pt && pt.clinicalLog.length > 0 ? String(pt.clinicalLog.length) : undefined,
        badgeClass: 'bg-sec-box text-on-sec-box'
      }
    ];
  });

  protected readonly lateralStageClass = computed(() => {
    if (this.tabTransitionSeq() === 0) return 'w-full h-full';
    return this.lateralDirection() === 'next'
      ? 'w-full h-full clinic-anim-lateral-next'
      : 'w-full h-full clinic-anim-lateral-prev';
  });

  protected readonly vitalsTransitionClass = computed(() => {
    if (this.vitalsViewSeq() === 0) return 'w-full h-full';
    return this.vitalsNavDirection() === 'forward'
      ? 'w-full h-full clinic-anim-forward'
      : 'w-full h-full clinic-anim-backward';
  });

  protected selectChartTab(tabId: ClinicChartTabId): void {
    const current = this.activeTab();
    if (tabId === current) return;

    this.lateralDirection.set(CHART_TAB_ORDER[tabId] > CHART_TAB_ORDER[current] ? 'next' : 'prev');
    this.activeTab.set(tabId);
    this.tabTransitionSeq.update((n) => n + 1);

    if (tabId !== 'vitals') {
      this.isEditingVitals.set(false);
      this.vitalsViewSeq.set(0);
    }

    const scrollEl = this.modalScrollBody()?.nativeElement;
    if (scrollEl) scrollEl.scrollTop = 0;
  }

  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const tabs = this.chartTabs();
    const isRtl =
      typeof getComputedStyle === 'function' &&
      event.currentTarget instanceof HTMLElement &&
      getComputedStyle(event.currentTarget).direction === 'rtl';

    let nextIndex = -1;
    if (event.key === 'ArrowRight') nextIndex = (index + (isRtl ? -1 : 1) + tabs.length) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index + (isRtl ? 1 : -1) + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    this.selectChartTab(nextTab.id);
    this.chartTabBtns()[nextIndex]?.nativeElement.focus();
  }

  protected readonly vitalTiles = computed(() => {
    const pt = this.patient();
    return pt ? evaluatePatientVitals(pt.vitals) : [];
  });

  protected readonly activeCodeProgress = computed(() => {
    const code = this.patient()?.activeCode;
    if (!code || !code.targetMinutes) return 0;
    return Math.min(100, Math.round((code.elapsedMinutes / code.targetMinutes) * 100));
  });

  protected readonly completedStepsCount = computed(() => {
    const code = this.patient()?.activeCode;
    if (!code) return 0;
    return code.steps.filter((s) => s.completed).length;
  });

  protected readonly news2Delta = computed<{ diff: number; label: string } | null>(() => {
    const hist = this.patient()?.vitalsHistory;
    if (!hist || hist.length < 2) return null;
    const diff = hist[0].news2Score - hist[1].news2Score;
    if (diff > 0) return { diff, label: `▲ +${diff}` };
    if (diff < 0) return { diff, label: `▼ ${diff}` };
    return { diff: 0, label: 'Estable' };
  });

  protected readonly projectedNews2 = computed(() => {
    const pt = this.patient();
    const fallback: PatientVitals = pt?.vitals ?? {
      heartRate: 80,
      respRate: 16,
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      oxygenSat: 98,
      supplementalO2: false,
      temperature: 36.7,
      consciousness: 'A',
      painScale: 0
    };
    return ClinicService.computeNews2(this.buildEditedVitals(fallback));
  });

  protected selectEmergencyCode(patientId: string, codeType: EmergencyCodeType | null): void {
    this.setEmergencyCode.emit({ patientId, codeType });
    this.isCodePickerOpen.set(false);
  }

  protected openVitalsForwardView(pt: PatientTriageRecord): void {
    this.editHr.set(String(pt.vitals.heartRate));
    this.editRr.set(String(pt.vitals.respRate ?? 16));
    this.editBpSys.set(String(pt.vitals.bloodPressureSys));
    this.editBpDia.set(String(pt.vitals.bloodPressureDia));
    this.editSpo2.set(String(pt.vitals.oxygenSat));
    this.editTemp.set(String(pt.vitals.temperature));
    this.editPain.set(String(pt.vitals.painScale));
    this.editConsciousness.set(pt.vitals.consciousness ?? 'A');
    this.editO2.set(pt.vitals.supplementalO2 ?? false);
    this.editVitalsNote.set('');
    this.vitalsNavDirection.set('forward');
    this.vitalsViewSeq.update((n) => n + 1);
    this.isEditingVitals.set(true);
  }

  protected closeVitalsForwardView(): void {
    this.vitalsNavDirection.set('backward');
    this.vitalsViewSeq.update((n) => n + 1);
    this.isEditingVitals.set(false);
  }

  protected saveVitals(event: Event, pt: PatientTriageRecord): void {
    event.preventDefault();
    this.saveVitalsSnapshot.emit({
      patientId: pt.id,
      vitals: this.buildEditedVitals(pt.vitals),
      note: this.editVitalsNote().trim() || undefined
    });
    this.closeVitalsForwardView();
  }

  protected onNoteKindChange(selected: string[]): void {
    const first = selected[0] as ClinicalNoteEntry['kind'] | undefined;
    if (first) this.noteKind.set(first);
  }

  protected applyNotePreset(preset: string): void {
    const current = this.newNoteText().trim();
    if (!current) {
      this.newNoteText.set(preset);
      return;
    }
    if (current.toLowerCase().includes(preset.toLowerCase())) return;
    this.newNoteText.set(`${current}${current.endsWith('.') ? '' : '.'} ${preset}`);
  }

  protected submitNote(event: Event, patientId: string): void {
    event.preventDefault();
    const clean = this.newNoteText().trim();
    if (!clean) return;
    this.addNote.emit({ patientId, text: clean, kind: this.noteKind() });
    this.newNoteText.set('');
  }

  protected submitAllergy(event: Event, patientId: string): void {
    event.preventDefault();
    const clean = this.newAllergyText().trim();
    if (!clean) return;
    this.addAllergy.emit({ patientId, allergy: clean });
    this.newAllergyText.set('');
  }

  protected triageMetaFor = (level: TriageLevel) => TRIAGE_LEVEL_META[level];
  protected newsMetaFor = (risk: PatientTriageRecord['news2']['riskLevel']) =>
    NEWS2_RISK_META[risk];
  protected slaMetaFor = (patient: PatientTriageRecord) => formatSlaMetaLabel(patient);

  protected genderLabel(gender: PatientTriageRecord['gender']): string {
    if (gender === 'M') return 'Masculino';
    if (gender === 'F') return 'Femenino';
    return 'Otro';
  }

  private buildEditedVitals(fallback: PatientVitals): PatientVitals {
    return {
      heartRate: this.parseNum(this.editHr(), fallback.heartRate),
      respRate: this.parseNum(this.editRr(), fallback.respRate ?? 16),
      bloodPressureSys: this.parseNum(this.editBpSys(), fallback.bloodPressureSys),
      bloodPressureDia: this.parseNum(this.editBpDia(), fallback.bloodPressureDia),
      oxygenSat: this.parseNum(this.editSpo2(), fallback.oxygenSat),
      supplementalO2: this.editO2(),
      temperature: this.parseNum(this.editTemp(), fallback.temperature),
      consciousness: this.editConsciousness(),
      painScale: Math.min(10, Math.max(0, this.parseNum(this.editPain(), fallback.painScale)))
    };
  }

  private parseNum(raw: string, fallback: number): number {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && raw.trim() !== '' ? parsed : fallback;
  }
}
