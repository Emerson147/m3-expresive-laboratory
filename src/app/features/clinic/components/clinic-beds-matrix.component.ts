import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  BedStatus,
  EmergencyBed,
  PatientTriageRecord
} from '../../../core/clinic/clinic.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { BED_AREA_META, BED_STATUS_META, BedAreaMeta } from './clinic-ui.tokens';

interface BedAreaGroup {
  meta: BedAreaMeta;
  beds: readonly EmergencyBed[];
  occupiedCount: number;
  availableCount: number;
}

@Component({
  selector: 'app-clinic-beds-matrix',
  imports: [M3ButtonComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-5">
      @for (group of bedGroups(); track group.meta.area) {
        <section class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                [class]="group.meta.iconBoxClass"
                class="w-8 h-8 rounded-m3-md grid place-items-center shrink-0"
                aria-hidden="true"
              >
                <span class="material-symbols-rounded text-[18px]">{{ group.meta.icon }}</span>
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
              class="px-2.5 py-1 rounded-m3-full bg-surface text-muted text-label-sm-emphasized font-mono tabular-nums shrink-0"
            >
              {{ group.occupiedCount }}/{{ group.beds.length }} ocupadas
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (bed of group.beds; track bed.id) {
              @let statusMeta = bedStatusMeta(bed.status);
              @let canAssignSelected =
                bed.status === 'available' && !!selectedUnassignedPatient();

              <article
                class="clinic-surface-tile bg-surface p-3.5 sm:p-4 flex flex-col justify-between gap-3"
              >
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-mono font-bold text-title-sm text-main flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-[18px] text-primary" aria-hidden="true">
                        {{ group.meta.icon }}
                      </span>
                      <span>{{ bed.id }}</span>
                    </span>

                    <span
                      [class]="statusMeta.badgeClass"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized"
                    >
                      <span class="material-symbols-rounded text-[13px]" aria-hidden="true">
                        {{ statusMeta.icon }}
                      </span>
                      <span>{{ statusMeta.label }}</span>
                    </span>
                  </div>

                  <p
                    class="text-body-sm font-medium truncate"
                    [class.text-muted]="bed.status === 'cleaning'"
                    [class.text-main]="bed.status !== 'cleaning'"
                  >
                    {{ bedSubtitle(bed, group.meta) }}
                  </p>

                  @if (bed.equipment.length > 0) {
                    <div class="flex items-center gap-1 flex-wrap">
                      @for (eq of bed.equipment; track $index) {
                        <span
                          class="px-2 py-0.5 rounded-m3-md bg-surface-low text-muted text-label-sm"
                        >
                          {{ eq }}
                        </span>
                      }
                    </div>
                  }
                </div>

                <div class="pt-0.5">
                  @if (canAssignSelected) {
                    <m3-button
                      variant="filled"
                      size="sm"
                      icon="person_add"
                      customClass="w-full"
                      (action)="assignSelectedToBed.emit(bed.id)"
                    >
                      Asignar a {{ firstNameOf(selectedUnassignedPatient()!.fullName) }}
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
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicBedsMatrixComponent {
  readonly beds = input.required<readonly EmergencyBed[]>();
  readonly selectedPatient = input<PatientTriageRecord | null>(null);

  readonly assignSelectedToBed = output<string>();
  readonly setBedStatus = output<{ bedId: string; status: BedStatus }>();

  protected readonly selectedUnassignedPatient = computed(() => {
    const pt = this.selectedPatient();
    return pt && !pt.bedAssignedId ? pt : null;
  });

  protected readonly bedGroups = computed<readonly BedAreaGroup[]>(() => {
    const allBeds = this.beds();
    return BED_AREA_META.map((meta) => {
      const areaBeds = allBeds.filter((b) => b.area === meta.area);
      return {
        meta,
        beds: areaBeds,
        occupiedCount: areaBeds.filter((b) => b.status === 'occupied').length,
        availableCount: areaBeds.filter((b) => b.status === 'available').length
      };
    });
  });

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
