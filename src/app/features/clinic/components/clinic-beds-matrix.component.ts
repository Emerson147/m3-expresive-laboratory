import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  BedFilterStatus,
  BedStatus,
  EmergencyBed,
  PatientTriageRecord
} from '../../../core/clinic/clinic.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import {
  BED_AREA_META,
  BED_FILTER_OPTIONS,
  BED_STATUS_META,
  BedAreaMeta,
  TRIAGE_LEVEL_META
} from './clinic-ui.tokens';

interface BedAreaGroup {
  meta: BedAreaMeta;
  beds: readonly EmergencyBed[];
  occupiedCount: number;
  totalAreaBeds: number;
}

@Component({
  selector: 'app-clinic-beds-matrix',
  imports: [M3ButtonComponent, M3ChipComponent],
  host: { class: 'block' },
  template: `
    <div class="rounded-m3-xl bg-surface-low p-4 sm:p-5 space-y-5">
      <!-- Top Command Header & Status Filter Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="space-y-1">
          <h2 class="text-title-md-emphasized text-main">
            Mapa Operativo de Boxes &amp; Unidades
          </h2>
          @if (selectedUnassignedPatient(); as unassigned) {
            <p class="text-body-sm text-primary font-medium">
              Paciente en espera seleccionado: <strong>{{ unassigned.fullName }}</strong> ({{ unassigned.ticketCode }}). Elige un box disponible para asignar al instante.
            </p>
          } @else {
            <p class="text-body-sm text-muted">
              Toca <strong>Historia</strong> en cualquier box ocupado para abrir la ficha completa sin salir del mapa.
            </p>
          }
        </div>

        <div role="group" aria-label="Filtrar estado de boxes" class="flex items-center gap-1.5 flex-wrap">
          @for (opt of filterOptions; track opt.id) {
            <m3-chip
              type="filter"
              [selected]="bedFilter() === opt.id"
              [count]="statusCountFor(opt.id)"
              (action)="bedFilterChange.emit(opt.id)"
            >
              {{ opt.label }}
            </m3-chip>
          }
        </div>
      </div>

      <!-- Wide Multi-Column Clinical Units Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        @for (group of bedGroups(); track group.meta.area) {
          <section class="rounded-m3-xl bg-surface p-4 space-y-3.5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  [class]="group.meta.iconBoxClass + ' w-9 h-9 rounded-m3-md grid place-items-center shrink-0'"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[19px]">{{ group.meta.icon }}</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-title-sm-emphasized text-main truncate">
                    {{ group.meta.title }}
                  </h3>
                  <p class="text-label-sm text-muted truncate">
                    {{ group.meta.subtitle }}
                  </p>
                </div>
              </div>

              <span
                class="px-2.5 py-1 rounded-m3-full bg-surface-low text-muted text-label-sm-emphasized font-mono tabular-nums shrink-0"
              >
                {{ group.occupiedCount }}/{{ group.totalAreaBeds }}
              </span>
            </div>

            @if (group.beds.length > 0) {
              <div class="space-y-2.5">
                @for (bed of group.beds; track bed.id) {
                  @let statusMeta = bedStatusMeta(bed.status);
                  @let occupant = occupantForBed(bed);
                  @let canAssignSelected = bed.status === 'available' && !!selectedUnassignedPatient();
                  @let triggerId = 'clinic-bed-chart-btn-' + bed.id;

                  <article
                    class="clinic-surface-tile bg-surface-low p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div class="space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <div class="min-w-0">
                          <span class="font-mono font-bold text-title-sm text-main flex items-center gap-1.5">
                            <span class="material-symbols-rounded text-[17px] text-primary" aria-hidden="true">
                              {{ group.meta.icon }}
                            </span>
                            <span>{{ bed.id }}</span>
                            <span class="text-body-sm font-sans font-normal text-muted truncate">
                              · {{ bed.name }}
                            </span>
                          </span>
                        </div>

                        <span
                          [class]="
                            statusMeta.badgeClass +
                            ' inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized shrink-0'
                          "
                        >
                          <span class="material-symbols-rounded text-[13px]" aria-hidden="true">
                            {{ statusMeta.icon }}
                          </span>
                          <span>{{ statusMeta.label }}</span>
                        </span>
                      </div>

                      @if (occupant; as pt) {
                        <div class="rounded-m3-md bg-surface p-2.5 flex items-center justify-between gap-2">
                          <div class="min-w-0">
                            <div class="flex items-center gap-1.5 flex-wrap">
                              <span
                                [class]="
                                  triageMetaFor(pt.triageLevel).badgeClass +
                                  ' px-2 py-0.5 rounded-m3-full text-label-sm font-mono font-bold'
                                "
                              >
                                {{ triageMetaFor(pt.triageLevel).shortCode }}
                              </span>
                              <span class="text-body-sm font-semibold text-main truncate">
                                {{ pt.fullName }}
                              </span>
                            </div>
                            <span class="text-label-sm font-mono text-muted">
                              {{ pt.ticketCode }} · NEWS2 {{ pt.news2.score }} · SpO₂ {{ pt.vitals.oxygenSat }}%
                            </span>
                          </div>

                          <m3-button
                            [id]="triggerId"
                            variant="tonal"
                            size="xs"
                            icon="open_in_full"
                            [morph]="true"
                            [invisible]="isDialogOpen() && activeDialogTrigger() === triggerId"
                            [viewTransitionName]="
                              dialogMorphOwner() === 'trigger' && activeDialogTrigger() === triggerId
                                ? 'dialog-transform'
                                : null
                            "
                            (action)="openPatientChart.emit({ patientId: pt.id, triggerId })"
                          >
                            Historia
                          </m3-button>
                        </div>
                      } @else {
                        <p
                          [class]="
                            'text-body-sm font-medium truncate ' +
                            (bed.status === 'cleaning' ? 'text-muted' : 'text-main')
                          "
                        >
                          {{ bedSubtitle(bed, group.meta) }}
                        </p>
                      }

                      @if (bed.equipment.length > 0) {
                        <div class="flex items-center gap-1 flex-wrap">
                          @for (eq of bed.equipment; track $index) {
                            <span class="px-2 py-0.5 rounded-m3-md bg-surface text-muted text-label-sm">
                              {{ eq }}
                            </span>
                          }
                        </div>
                      }
                    </div>

                    <div class="pt-0.5">
                      @if (canAssignSelected) {
                        @let isRecommended = bed.id === recommendedBedId();
                        <m3-button
                          [variant]="isRecommended ? 'filled' : 'tonal'"
                          size="sm"
                          [icon]="isRecommended ? 'bolt' : 'person_add'"
                          customClass="w-full"
                          (action)="assignSelectedToBed.emit(bed.id)"
                        >
                          {{
                            isRecommended
                              ? 'Prioritario · Asignar a ' + firstNameOf(selectedUnassignedPatient()!.fullName)
                              : 'Asignar a ' + firstNameOf(selectedUnassignedPatient()!.fullName)
                          }}
                        </m3-button>
                      } @else if (bed.status === 'cleaning') {
                        <m3-button
                          variant="tonal"
                          size="sm"
                          icon="check_circle"
                          customClass="w-full"
                          (action)="setBedStatus.emit({ bedId: bed.id, status: 'available' })"
                        >
                          Habilitar Box
                        </m3-button>
                      } @else if (bed.status === 'occupied') {
                        <m3-button
                          variant="outlined"
                          size="sm"
                          icon="cleaning_services"
                          customClass="w-full"
                          (action)="setBedStatus.emit({ bedId: bed.id, status: 'cleaning' })"
                        >
                          Liberar a Limpieza
                        </m3-button>
                      } @else {
                        <p class="text-label-sm text-muted flex items-center gap-1.5 py-1">
                          <span class="material-symbols-rounded text-[15px] text-success" aria-hidden="true">
                            check_circle
                          </span>
                          <span>Listo para asignación inmediata</span>
                        </p>
                      }
                    </div>
                  </article>
                }
              </div>
            } @else {
              <div class="rounded-m3-lg bg-surface-low p-4 text-center text-body-sm text-muted">
                Sin boxes con este estado en {{ group.meta.title }}.
              </div>
            }
          </section>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicBedsMatrixComponent {
  readonly beds = input.required<readonly EmergencyBed[]>();
  readonly patients = input<readonly PatientTriageRecord[]>([]);
  readonly selectedPatient = input<PatientTriageRecord | null>(null);
  readonly recommendedBedId = input<string | null>(null);
  readonly bedFilter = input<BedFilterStatus>('all');
  readonly isDialogOpen = input<boolean>(false);
  readonly activeDialogTrigger = input<string | null>(null);
  readonly dialogMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly bedFilterChange = output<BedFilterStatus>();
  readonly assignSelectedToBed = output<string>();
  readonly setBedStatus = output<{ bedId: string; status: BedStatus }>();
  readonly openPatientChart = output<{ patientId: string; triggerId: string }>();

  protected readonly filterOptions = BED_FILTER_OPTIONS;

  protected readonly selectedUnassignedPatient = computed(() => {
    const pt = this.selectedPatient();
    return pt && !pt.bedAssignedId ? pt : null;
  });

  protected readonly patientById = computed(() => {
    const map = new Map<string, PatientTriageRecord>();
    for (const pt of this.patients()) {
      map.set(pt.id, pt);
    }
    return map;
  });

  protected readonly bedGroups = computed<readonly BedAreaGroup[]>(() => {
    const allBeds = this.beds();
    const filter = this.bedFilter();

    return BED_AREA_META.map((meta) => {
      const areaAll = allBeds.filter((b) => b.area === meta.area);
      const areaFiltered =
        filter === 'all' ? areaAll : areaAll.filter((b) => b.status === filter);
      return {
        meta,
        beds: areaFiltered,
        occupiedCount: areaAll.filter((b) => b.status === 'occupied').length,
        totalAreaBeds: areaAll.length
      };
    });
  });

  protected statusCountFor(filter: BedFilterStatus): number {
    const all = this.beds();
    if (filter === 'all') return all.length;
    return all.filter((b) => b.status === filter).length;
  }

  protected occupantForBed(bed: EmergencyBed): PatientTriageRecord | null {
    if (!bed.patientId) return null;
    return this.patientById().get(bed.patientId) ?? null;
  }

  protected triageMetaFor = (level: PatientTriageRecord['triageLevel']) =>
    TRIAGE_LEVEL_META[level];
  protected bedStatusMeta = (status: BedStatus) => BED_STATUS_META[status];

  protected bedSubtitle(bed: EmergencyBed, meta: BedAreaMeta): string {
    if (bed.status === 'cleaning') {
      return 'En sanitización — pendiente de habilitación';
    }
    return bed.patientName ?? meta.emptyPlaceholder;
  }

  protected firstNameOf(fullName: string): string {
    return fullName.trim().split(/\s+/)[0] || fullName;
  }
}
