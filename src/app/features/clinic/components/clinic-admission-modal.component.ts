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
  viewChild
} from '@angular/core';
import {
  AdmitPatientDto,
  ConsciousnessLevel,
  EmergencyCodeType,
  TriageLevel
} from '../../../core/clinic/clinic.models';
import { ClinicService } from '../../../core/clinic/clinic.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import {
  EMERGENCY_CODE_OPTIONS,
  NEWS2_RISK_META,
  TRIAGE_LEVEL_META,
  TRIAGE_LEVEL_ORDER
} from './clinic-ui.tokens';
import { ClinicVitalsFieldsComponent } from './clinic-vitals-fields.component';

const GENDER_BUTTON_OPTIONS: M3ButtonGroupOption[] = [
  { id: 'M', label: 'Masculino' },
  { id: 'F', label: 'Femenino' },
  { id: 'Other', label: 'Otro' }
];

@Component({
  selector: 'app-clinic-admission-modal',
  imports: [
    M3DialogComponent,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3TextFieldComponent,
    ClinicVitalsFieldsComponent
  ],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Ingreso Rápido a Triaje"
      [viewTransitionName]="viewTransitionName()"
      customClass="clinic-modal-dialog"
      (closeRequested)="close.emit()"
    >
      @if (open()) {
        <form (submit)="handleSubmit($event)" novalidate class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
            <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[21px]">person_add</span>
                </div>
                <div class="min-w-0">
                  <h3
                    id="clinic-admission-heading"
                    class="text-title-lg-emphasized text-main tracking-tight"
                  >
                    Ingreso Rápido a Triaje
                  </h3>
                  <p class="text-label-md text-muted mt-0.5">
                    Protocolo MTS Manchester · Evaluación automática NEWS2 / 20
                  </p>
                </div>
              </div>

              <m3-button
                variant="text"
                size="sm"
                icon="close"
                [iconOnly]="true"
                ariaLabel="Cerrar formulario de admisión"
                (action)="close.emit()"
              />
            </header>
          </div>

          <div #modalScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto m3-scrollbar">
            <!-- Live Projected NEWS2 Banner -->
            @let projected = previewNews2();
            @let riskMeta = newsRiskMetaFor(projected.riskLevel);
            <div class="rounded-m3-lg bg-surface p-3.5 space-y-2">
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="material-symbols-rounded text-[18px] text-primary shrink-0" aria-hidden="true">
                    analytics
                  </span>
                  <span class="text-label-md-emphasized text-main">
                    Previsualización NEWS2
                  </span>
                </div>
                <span
                  [class]="
                    riskMeta.pillClass +
                    ' px-3 py-1 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums shrink-0'
                  "
                >
                  Score {{ projected.score }} / 20 · {{ riskMeta.label }}
                </span>
              </div>
              @if (projected.triggers.length > 0) {
                <p class="text-label-sm text-error">
                  Alertas detectadas: {{ projected.triggers.join(' · ') }}
                </p>
              }
            </div>

            <!-- Patient Identity -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <m3-text-field
                  #fullNameField
                  variant="filled"
                  label="Nombre completo"
                  placeholder="Ej: Marcelo Quiroga"
                  autocomplete="name"
                  [required]="true"
                  [value]="fullName()"
                  [errorText]="fullNameError()"
                  (valueChange)="onFullNameChange($event)"
                />
              </div>

              <div>
                <m3-text-field
                  variant="filled"
                  label="Edad"
                  type="number"
                  inputMode="numeric"
                  suffix="años"
                  [value]="ageInput()"
                  (valueChange)="ageInput.set($event)"
                />
              </div>
            </div>

            <!-- Gender Selection (<m3-button-group variant="connected">) -->
            <div class="space-y-1.5">
              <p class="text-label-md-emphasized text-muted">
                Sexo registrado
              </p>
              <m3-button-group
                variant="connected"
                size="sm"
                selectionMode="single"
                ariaLabel="Sexo del paciente"
                customClass="clinic-connected-group"
                class="clinic-connected-group-host"
                [options]="genderOptions"
                [value]="[gender()]"
                (selectionChange)="onGenderChange($event)"
              />
            </div>

            <!-- Manchester Priority Selection -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <p class="text-label-md-emphasized text-muted">
                  Prioridad Manchester (MTS)
                </p>
                <span class="text-label-sm font-mono text-muted">
                  {{ triageMetaFor(triageLevel()).fullLabel }} · {{ triageMetaFor(triageLevel()).targetWaitLabel }}
                </span>
              </div>
              <div role="group" aria-label="Prioridad Manchester" class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                @for (lvl of triageOrder; track lvl) {
                  @let meta = triageMetaFor(lvl);
                  @let selected = triageLevel() === lvl;
                  <button
                    type="button"
                    (click)="triageLevel.set(lvl)"
                    [attr.aria-pressed]="selected"
                    [attr.aria-label]="meta.fullLabel"
                    [class]="
                      'clinic-chip-btn state-layer focus-ring-m3 px-2 py-2 text-label-md-emphasized font-mono cursor-pointer flex items-center justify-center ' +
                      (selected
                        ? meta.badgeClass + ' font-bold'
                        : 'bg-surface hover:bg-surface-high text-muted')
                    "
                  >
                    {{ meta.shortCode }}
                  </button>
                }
              </div>
            </div>

            <!-- Active Emergency Code Protocol (Optional) -->
            <div class="space-y-1.5">
              <p class="text-label-md-emphasized text-muted">
                Activación de código clínico (opcional)
              </p>
              <div role="group" aria-label="Código clínico inicial" class="flex flex-wrap gap-2">
                @for (codeOpt of codeOptions; track codeOpt.shortLabel) {
                  @let selected = activeCodeType() === codeOpt.type;
                  <button
                    type="button"
                    (click)="activeCodeType.set(codeOpt.type)"
                    [attr.aria-pressed]="selected"
                    [class]="
                      'clinic-chip-btn state-layer focus-ring-m3 px-3 py-1.5 text-label-md-emphasized cursor-pointer flex items-center gap-1.5 ' +
                      (selected
                        ? (codeOpt.type ? 'bg-error-box text-on-error-box font-bold' : 'bg-primary-box text-on-primary-box')
                        : 'bg-surface hover:bg-surface-high text-muted')
                    "
                  >
                    @if (codeOpt.type) {
                      <span class="material-symbols-rounded text-[15px]" aria-hidden="true">bolt</span>
                    }
                    <span>{{ codeOpt.shortLabel }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Chief Complaint -->
            <m3-text-field
              #complaintField
              class="block"
              variant="filled"
              label="Motivo de consulta clínica"
              placeholder="Describe síntomas agudos, localización y tiempo de evolución..."
              [multiline]="true"
              [rows]="2"
              [autoGrow]="true"
              [required]="true"
              [value]="complaint()"
              [errorText]="complaintError()"
              (valueChange)="onComplaintChange($event)"
            />

            <!-- Complete Hemodynamic & Respiratory Vitals Grid -->
            <fieldset class="border-0 p-0 flex flex-col gap-2">
              <legend class="text-label-md-emphasized text-muted pb-1">
                Signos vitales iniciales y parámetros NEWS2
              </legend>
              <app-clinic-vitals-fields
                [(hr)]="hrInput"
                [(rr)]="rrInput"
                [(bpSys)]="bpSysInput"
                [(bpDia)]="bpDiaInput"
                [(spo2)]="spo2Input"
                [(temp)]="tempInput"
                [(pain)]="painInput"
                [(consciousness)]="consciousness"
                [(supplementalO2)]="supplementalO2"
              />
            </fieldset>

            <!-- Allergies (Optional) -->
            <m3-text-field
              class="block"
              variant="filled"
              label="Alergias conocidas (opcional)"
              placeholder="Separadas por coma. Ej: Penicilina, Látex"
              [value]="allergiesInput()"
              (valueChange)="allergiesInput.set($event)"
            />
          </div>

          <footer class="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 shrink-0 flex items-center justify-end gap-2">
            <m3-button variant="text" size="md" (action)="close.emit()">
              Cancelar
            </m3-button>
            <m3-button type="submit" variant="filled" size="md" icon="person_add">
              Admitir Paciente a Triaje
            </m3-button>
          </footer>
        </form>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicAdmissionModalComponent {
  private readonly injector = inject(Injector);
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private readonly fullNameField = viewChild<M3TextFieldComponent>('fullNameField');
  private readonly complaintField = viewChild<M3TextFieldComponent>('complaintField');

  readonly open = input<boolean>(false);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly admit = output<AdmitPatientDto>();

  protected readonly genderOptions = GENDER_BUTTON_OPTIONS;
  protected readonly triageOrder = TRIAGE_LEVEL_ORDER;
  protected readonly codeOptions = EMERGENCY_CODE_OPTIONS;

  readonly fullName = signal<string>('');
  readonly ageInput = signal<string>('40');
  readonly gender = signal<'M' | 'F' | 'Other'>('M');
  readonly triageLevel = signal<TriageLevel>('urgent');
  readonly activeCodeType = signal<EmergencyCodeType | null>(null);
  readonly complaint = signal<string>('');
  readonly hrInput = signal<string>('82');
  readonly rrInput = signal<string>('16');
  readonly bpSysInput = signal<string>('120');
  readonly bpDiaInput = signal<string>('80');
  readonly spo2Input = signal<string>('98');
  readonly tempInput = signal<string>('36.7');
  readonly painInput = signal<string>('3');
  readonly consciousness = signal<ConsciousnessLevel>('A');
  readonly supplementalO2 = signal<boolean>(false);
  readonly allergiesInput = signal<string>('');
  readonly nameInvalid = signal<boolean>(false);
  readonly complaintInvalid = signal<boolean>(false);

  private wasOpen = false;

  protected readonly fullNameError = computed(() =>
    this.nameInvalid() ? 'Ingresa el nombre completo del paciente.' : null
  );

  protected readonly complaintError = computed(() =>
    this.complaintInvalid() ? 'Describe el motivo clínico del ingreso.' : null
  );

  protected readonly parsedVitals = computed(() => ({
    heartRate: this.parseNumber(this.hrInput(), 82),
    respRate: this.parseNumber(this.rrInput(), 16),
    bloodPressureSys: this.parseNumber(this.bpSysInput(), 120),
    bloodPressureDia: this.parseNumber(this.bpDiaInput(), 80),
    oxygenSat: this.parseNumber(this.spo2Input(), 98),
    supplementalO2: this.supplementalO2(),
    temperature: this.parseNumber(this.tempInput(), 36.7),
    consciousness: this.consciousness(),
    painScale: Math.min(10, Math.max(0, this.parseNumber(this.painInput(), 3)))
  }));

  protected readonly previewNews2 = computed(() =>
    ClinicService.computeNews2(this.parsedVitals())
  );

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        this.resetForm();
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

  protected onGenderChange(selected: string[]): void {
    const first = selected[0] as 'M' | 'F' | 'Other' | undefined;
    if (first) {
      this.gender.set(first);
    }
  }

  protected onFullNameChange(value: string): void {
    this.fullName.set(value);
    this.nameInvalid.set(false);
  }

  protected onComplaintChange(value: string): void {
    this.complaint.set(value);
    this.complaintInvalid.set(false);
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();
    const missingName = !this.fullName().trim();
    const missingComplaint = !this.complaint().trim();
    this.nameInvalid.set(missingName);
    this.complaintInvalid.set(missingComplaint);

    if (missingName) {
      this.fullNameField()?.focus();
      return;
    }
    if (missingComplaint) {
      this.complaintField()?.focus();
      return;
    }

    const allergies = this.allergiesInput()
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    this.admit.emit({
      fullName: this.fullName().trim(),
      age: Math.min(120, Math.max(0, Math.round(this.parseNumber(this.ageInput(), 40)))),
      gender: this.gender(),
      triageLevel: this.triageLevel(),
      chiefComplaint: this.complaint().trim(),
      vitals: this.parsedVitals(),
      activeCodeType: this.activeCodeType(),
      allergies
    });
  }

  protected triageMetaFor = (level: TriageLevel) => TRIAGE_LEVEL_META[level];
  protected newsRiskMetaFor = (risk: keyof typeof NEWS2_RISK_META) => NEWS2_RISK_META[risk];

  private resetForm(): void {
    this.fullName.set('');
    this.ageInput.set('40');
    this.gender.set('M');
    this.triageLevel.set('urgent');
    this.activeCodeType.set(null);
    this.complaint.set('');
    this.hrInput.set('82');
    this.rrInput.set('16');
    this.bpSysInput.set('120');
    this.bpDiaInput.set('80');
    this.spo2Input.set('98');
    this.tempInput.set('36.7');
    this.painInput.set('3');
    this.consciousness.set('A');
    this.supplementalO2.set(false);
    this.allergiesInput.set('');
    this.nameInvalid.set(false);
    this.complaintInvalid.set(false);
  }

  private parseNumber(raw: string, fallback: number): number {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && raw.trim() !== '' ? parsed : fallback;
  }
}
