import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ClinicKpiSummary,
  PatientTriageRecord,
  TriageFilter,
  TriageSortMode
} from '../../../core/clinic/clinic.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import {
  NEWS2_RISK_META,
  SORT_MODE_OPTIONS,
  TRIAGE_LEVEL_META,
  formatSlaMetaLabel
} from './clinic-ui.tokens';

interface FilterOption {
  id: TriageFilter;
  label: string;
  count: number;
}

const SORT_BUTTON_OPTIONS: M3ButtonGroupOption[] = SORT_MODE_OPTIONS.map((opt) => ({
  id: opt.id,
  label: opt.label,
  icon: opt.icon
}));

@Component({
  selector: 'app-clinic-patient-queue',
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3ChipComponent],
  host: { class: 'block h-full' },
  template: `
    <div class="rounded-m3-xl bg-surface-low p-4 sm:p-5 space-y-4 h-full">
      <!-- Queue Header + Sort Group -->
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-m3-md bg-surface text-primary grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-[20px]">format_list_bulleted</span>
          </div>
          <div class="min-w-0">
            <h2 class="text-title-md-emphasized text-main truncate">
              Cola Clínica de Guardia
            </h2>
            <p class="text-body-sm text-muted">
              {{ patients().length }} de {{ totalPatientsCount() }} pacientes visibles
            </p>
          </div>
        </div>

        <m3-button-group
          variant="connected"
          size="xs"
          selectionMode="single"
          ariaLabel="Ordenar cola clínica"
          [options]="sortOptions"
          [value]="[sortMode()]"
          (selectionChange)="onSortChange($event)"
        />
      </div>

      <!-- Single-Row Essential Clinical Filters -->
      <div
        role="group"
        aria-label="Filtrar cola de triaje"
        class="flex items-center gap-1.5 flex-wrap"
      >
        @for (opt of filterOptions(); track opt.id) {
          <m3-chip
            type="filter"
            [selected]="activeFilter() === opt.id"
            [count]="opt.count"
            (action)="filterChange.emit(opt.id)"
          >
            {{ opt.label }}
          </m3-chip>
        }
      </div>

      <!-- Calm, Low-Fatigue Patient Rows -->
      @if (patients().length > 0) {
        <ul
          role="list"
          aria-label="Lista de pacientes en emergencia"
          class="list-none m-0 p-0 space-y-2"
        >
          @for (patient of patients(); track patient.id) {
            @let isSelected = selectedPatientId() === patient.id;
            @let triageMeta = triageMetaFor(patient.triageLevel);
            @let newsMeta = newsMetaFor(patient.news2.riskLevel);
            @let slaMeta = slaMetaFor(patient);

            <li>
              <button
                type="button"
                (click)="selectPatient.emit(patient)"
                [attr.aria-current]="isSelected ? 'true' : null"
                [class]="
                  'clinic-surface-tile state-layer focus-ring-m3 relative w-full text-left p-3.5 flex items-start gap-3 cursor-pointer ' +
                  (isSelected
                    ? 'is-selected bg-primary-box text-on-primary-box'
                    : 'bg-surface text-main')
                "
              >
                <!-- Leading M3 Circular Priority Avatar (replaces stiff vertical edge stripe) -->
                <span
                  [class]="
                    triageMeta.badgeClass +
                    ' relative w-11 h-11 rounded-m3-full grid place-items-center text-label-md-emphasized font-mono font-bold uppercase shrink-0 mt-0.5'
                  "
                >
                  {{ triageMeta.shortCode }}
                  @if (patient.activeCode) {
                    <span class="absolute -top-0.5 -right-0.5 flex" aria-hidden="true">
                      <span [class]="'clinic-live-dot ' + triageMeta.dotClass"></span>
                    </span>
                  }
                </span>

                <div class="flex-1 min-w-0 space-y-1.5">
                  <!-- Row 1: Identity + Active Protocol Tag + Box & SLA -->
                  <div class="flex items-center justify-between gap-2 flex-wrap w-full">
                    <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                      <h3 class="text-title-sm-emphasized tracking-tight truncate">
                        {{ patient.fullName }}
                      </h3>

                      <span
                        class="text-label-sm shrink-0"
                        [class.text-muted]="!isSelected"
                      >
                        {{ patient.age }}a · {{ patient.ticketCode }}
                      </span>

                      @if (patient.activeCode; as code) {
                        <span
                          class="bg-error-box text-on-error-box inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full text-label-sm font-semibold shrink-0"
                        >
                          <span class="material-symbols-rounded text-[13px]" aria-hidden="true">bolt</span>
                          <span>
                            {{ code.title }} · {{ code.remainingMinutes }}m
                            @if (code.steps.length > 0) {
                              <span class="opacity-80 font-mono">
                                ({{ completedCodeSteps(patient) }}/{{ code.steps.length }})
                              </span>
                            }
                          </span>
                        </span>
                      }
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0 text-label-sm font-mono tabular-nums">
                      <span
                        [class]="
                          newsMeta.pillClass +
                          ' px-2 py-0.5 rounded-m3-full font-semibold'
                        "
                      >
                        NEWS2 {{ patient.news2.score }}
                      </span>

                      @if (patient.bedAssignedId) {
                        <span
                          [class]="
                            (isSelected ? 'bg-surface text-main' : 'bg-surface-low text-main') +
                            ' inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full font-semibold'
                          "
                        >
                          <span class="material-symbols-rounded text-[13px]" aria-hidden="true">bed</span>
                          <span>{{ patient.bedAssignedId }}</span>
                        </span>
                      } @else {
                        <span
                          class="bg-warning-box text-on-warning-box inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full font-semibold"
                        >
                          Sin Box
                        </span>
                      }

                      @if (slaMeta.breached || slaMeta.nearLimit) {
                        <span
                          [class]="
                            (slaMeta.breached
                              ? 'bg-error-box text-on-error-box font-semibold'
                              : 'bg-warning-box text-on-warning-box') +
                            ' inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full'
                          "
                        >
                          {{ slaMeta.label }}
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Row 2: Calm Single-Line Clinical Context + Vitals + Allergy Notice -->
                  <div class="flex items-center justify-between gap-3 w-full text-body-sm">
                    <p class="truncate min-w-0" [class.text-muted]="!isSelected">
                      {{ patient.chiefComplaint }}
                    </p>

                    <div class="flex items-center gap-2.5 shrink-0 text-label-sm font-mono tabular-nums">
                      @if (patient.allergies.length > 0) {
                        <span
                          class="bg-warning-box text-on-warning-box px-2 py-0.5 rounded-m3-full font-semibold"
                          [attr.title]="'Alergias: ' + patient.allergies.join(', ')"
                        >
                          ⚠ {{ patient.allergies.length }} alerg.
                        </span>
                      }
                      <span [class.text-muted]="!isSelected">
                        SpO₂ {{ patient.vitals.oxygenSat }}% · FC {{ patient.vitals.heartRate }}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          }
        </ul>
      } @else {
        <div class="rounded-m3-lg bg-surface p-8 text-center space-y-3">
          <div
            class="w-12 h-12 rounded-m3-full bg-surface-high text-muted grid place-items-center mx-auto"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-[24px]">health_and_safety</span>
          </div>
          <div class="space-y-1">
            <p class="text-title-sm-emphasized text-main">
              Sin pacientes para este criterio
            </p>
            <p class="text-body-sm text-muted">
              Ajusta el filtro clínico o limpia el término de búsqueda para ver toda la cola.
            </p>
          </div>
          <div class="pt-1 flex justify-center">
            <m3-button
              variant="tonal"
              size="sm"
              icon="filter_alt_off"
              (action)="resetFilters.emit()"
            >
              Ver Todos los Pacientes
            </m3-button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicPatientQueueComponent {
  readonly patients = input.required<readonly PatientTriageRecord[]>();
  readonly totalPatientsCount = input.required<number>();
  readonly kpi = input.required<ClinicKpiSummary>();
  readonly inBedCount = input.required<number>();
  readonly waitingCount = input.required<number>();
  readonly activeFilter = input.required<TriageFilter>();
  readonly sortMode = input.required<TriageSortMode>();
  readonly selectedPatientId = input<string | null>(null);

  readonly filterChange = output<TriageFilter>();
  readonly sortModeChange = output<TriageSortMode>();
  readonly selectPatient = output<PatientTriageRecord>();
  readonly resetFilters = output<void>();

  protected readonly sortOptions = SORT_BUTTON_OPTIONS;

  protected readonly filterOptions = computed<readonly FilterOption[]>(() => {
    const k = this.kpi();
    const total = this.totalPatientsCount();

    return [
      { id: 'all', label: 'Todos', count: total },
      { id: 'critical', label: 'Críticos (N1/N2)', count: k.criticalCases },
      { id: 'sla_breach', label: 'SLA Vencido', count: k.slaBreachCount },
      { id: 'waiting', label: 'En Espera', count: this.waitingCount() },
      { id: 'in_bed', label: 'En Box', count: this.inBedCount() }
    ];
  });

  protected onSortChange(selected: string[]): void {
    const next = selected[0] as TriageSortMode | undefined;
    if (next) {
      this.sortModeChange.emit(next);
    }
  }

  protected triageMetaFor = (level: PatientTriageRecord['triageLevel']) =>
    TRIAGE_LEVEL_META[level];

  protected newsMetaFor = (risk: PatientTriageRecord['news2']['riskLevel']) =>
    NEWS2_RISK_META[risk];

  protected slaMetaFor = (patient: PatientTriageRecord) => formatSlaMetaLabel(patient);

  protected completedCodeSteps(patient: PatientTriageRecord): number {
    return patient.activeCode?.steps.filter((s) => s.completed).length ?? 0;
  }
}
