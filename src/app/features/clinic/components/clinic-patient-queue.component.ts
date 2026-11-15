import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ClinicKpiSummary,
  PatientTriageRecord,
  TriageFilter
} from '../../../core/clinic/clinic.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { NEWS2_RISK_META, TRIAGE_LEVEL_META } from './clinic-ui.tokens';

interface FilterOption {
  id: TriageFilter;
  label: string;
  count: number | null;
}

@Component({
  selector: 'app-clinic-patient-queue',
  imports: [M3ButtonComponent, M3ChipComponent],
  host: { class: 'block' },
  template: `
    <div class="rounded-m3-xl bg-surface-low p-4 sm:p-5 space-y-4">
      <!-- Queue Header -->
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
              Cola Activa de Triaje
            </h2>
            <p class="text-body-sm text-muted">
              Selecciona un paciente para revisar ficha, NEWS2 o asignar box
            </p>
          </div>
        </div>

        <span
          class="px-3 py-1 rounded-m3-full bg-surface text-main text-label-sm-emphasized font-mono tabular-nums shrink-0"
        >
          {{ patients().length }} visibles
        </span>
      </div>

      <!-- Filter Chips Row (Covers every TriageFilter including in_bed & waiting) -->
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

      <!-- Semantic List of Selectable Triage Cards -->
      @if (patients().length > 0) {
        <ul
          role="list"
          aria-label="Lista de pacientes en emergencia"
          class="list-none m-0 p-0 space-y-2.5"
        >
          @for (patient of patients(); track patient.id) {
            @let isSelected = selectedPatientId() === patient.id;
            @let triageMeta = triageMetaFor(patient.triageLevel);
            @let newsMeta = newsMetaFor(patient.news2.riskLevel);
            @let isCritical =
              patient.triageLevel === 'resuscitation' || patient.triageLevel === 'emergency';

            <li>
              <button
                type="button"
                (click)="selectPatient.emit(patient)"
                [attr.aria-current]="isSelected ? 'true' : null"
                [class]="
                  'clinic-surface-tile w-full text-left p-4 flex flex-col gap-3 cursor-pointer ' +
                  (isSelected
                    ? 'is-selected bg-primary-box text-on-primary-box'
                    : 'bg-surface hover:bg-surface-high text-main')
                "
              >
                <!-- Row 1: Manchester Level + Ticket & Bed / Latency -->
                <div class="flex items-center justify-between gap-2 flex-wrap w-full">
                  <div class="flex items-center gap-2 flex-wrap min-w-0">
                    <span
                      [class]="triageMeta.badgeClass"
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized uppercase tracking-wider shrink-0"
                    >
                      @if (patient.activeCode) {
                        <span
                          class="clinic-live-dot"
                          [class]="triageMeta.dotClass"
                          aria-hidden="true"
                        ></span>
                      } @else {
                        <span class="material-symbols-rounded text-[14px]" aria-hidden="true">
                          {{ triageMeta.icon }}
                        </span>
                      }
                      <span>{{ triageMeta.fullLabel }}</span>
                    </span>

                    <span
                      [class]="isSelected ? 'bg-surface/20 text-on-primary-box' : 'bg-surface-low text-muted'"
                      class="px-2.5 py-0.5 rounded-m3-full text-label-sm font-mono tabular-nums shrink-0"
                    >
                      {{ patient.ticketCode }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0 text-label-sm font-mono tabular-nums">
                    @if (patient.bedAssignedId) {
                      <span
                        [class]="isSelected ? 'bg-surface/20 text-on-primary-box' : 'bg-sec-box text-on-sec-box'"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full font-semibold"
                      >
                        <span class="material-symbols-rounded text-[14px]" aria-hidden="true">bed</span>
                        <span>{{ patient.bedAssignedId }}</span>
                      </span>
                    } @else {
                      <span
                        [class]="
                          isSelected
                            ? 'bg-surface/20 text-on-primary-box'
                            : isCritical
                              ? 'bg-error-box text-on-error-box'
                              : 'bg-warning-box text-on-warning-box'
                        "
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full font-semibold"
                      >
                        <span class="material-symbols-rounded text-[14px]" aria-hidden="true">hourglass_top</span>
                        <span>Sin Box</span>
                      </span>
                    }

                    <span
                      [class]="isSelected ? 'bg-surface/15 text-on-primary-box' : 'bg-surface-low text-muted'"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full"
                    >
                      <span class="material-symbols-rounded text-[13px]" aria-hidden="true">schedule</span>
                      <span>{{ patient.waitingMinutes }}m</span>
                    </span>
                  </div>
                </div>

                <!-- Row 2: Patient Identity + NEWS2 Pill -->
                <div class="flex items-center justify-between gap-3 w-full">
                  <div class="flex items-baseline gap-2 min-w-0">
                    <h3 class="text-title-md-emphasized tracking-tight truncate">
                      {{ patient.fullName }}
                    </h3>
                    <span
                      class="text-label-md shrink-0"
                      [class.text-muted]="!isSelected"
                    >
                      {{ patient.age }}a · {{ genderLabel(patient.gender) }}
                    </span>
                  </div>

                  <span
                    [class]="newsMeta.pillClass"
                    class="px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums shrink-0"
                  >
                    NEWS2 {{ patient.news2.score }}
                  </span>
                </div>

                <!-- Row 3: Acute Protocol Banner OR Chief Complaint -->
                @if (patient.activeCode; as code) {
                  <div
                    class="bg-error-box text-on-error-box px-3 py-2 rounded-m3-md flex items-center justify-between gap-2 w-full"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="material-symbols-rounded text-[16px] shrink-0" aria-hidden="true">
                        bolt
                      </span>
                      <span class="text-label-md-emphasized truncate">{{ code.title }}</span>
                      <span class="text-label-sm opacity-80 truncate hidden sm:inline">
                        · {{ code.windowLabel }}
                      </span>
                    </div>

                    <span
                      class="bg-error text-on-error px-2 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums shrink-0"
                    >
                      {{ code.remainingMinutes }} min
                    </span>
                  </div>
                } @else {
                  <p
                    class="text-body-sm truncate w-full"
                    [class.text-muted]="!isSelected"
                  >
                    <span class="font-semibold">Motivo:</span> {{ patient.chiefComplaint }}
                  </p>
                }
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
  readonly selectedPatientId = input<string | null>(null);

  readonly filterChange = output<TriageFilter>();
  readonly selectPatient = output<PatientTriageRecord>();
  readonly resetFilters = output<void>();

  protected readonly filterOptions = computed<readonly FilterOption[]>(() => {
    const k = this.kpi();
    const total = this.totalPatientsCount();
    const standardCount = Math.max(0, total - k.criticalCases - k.urgentCases);

    return [
      { id: 'all', label: 'Todos', count: total },
      { id: 'critical', label: 'Críticos (N1/N2)', count: k.criticalCases },
      { id: 'urgent', label: 'Urgentes (N3)', count: k.urgentCases },
      { id: 'standard', label: 'Menores (N4/N5)', count: standardCount },
      { id: 'in_bed', label: 'En Box', count: this.inBedCount() },
      { id: 'waiting', label: 'En Espera', count: this.waitingCount() }
    ];
  });

  protected triageMetaFor = (level: PatientTriageRecord['triageLevel']) =>
    TRIAGE_LEVEL_META[level];

  protected newsMetaFor = (risk: PatientTriageRecord['news2']['riskLevel']) =>
    NEWS2_RISK_META[risk];

  protected genderLabel(gender: PatientTriageRecord['gender']): string {
    if (gender === 'M') return 'Masc.';
    if (gender === 'F') return 'Fem.';
    return 'Otro';
  }
}
