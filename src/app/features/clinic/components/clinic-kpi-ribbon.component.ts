import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ClinicKpiSummary, TriageFilter } from '../../../core/clinic/clinic.models';

interface ClinicKpiTile {
  id: TriageFilter;
  label: string;
  value: string;
  sublabel: string;
  icon: string;
  inactiveIconBoxClass: string;
  highlightCritical?: boolean;
}

@Component({
  selector: 'app-clinic-kpi-ribbon',
  host: { class: 'block shrink-0' },
  template: `
    <div
      role="group"
      aria-label="Indicadores clínicos y filtros rápidos"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      @for (tile of kpiTiles(); track tile.id) {
        @let isSelected = activeFilter() === tile.id;
        <button
          type="button"
          (click)="filterChange.emit(tile.id)"
          [attr.aria-pressed]="isSelected"
          [class]="
            'clinic-kpi-btn text-left p-4 flex flex-col justify-between gap-2.5 cursor-pointer ' +
            (isSelected
              ? 'bg-primary-box text-on-primary-box'
              : 'bg-surface-low hover:bg-surface-high text-main')
          "
        >
          <div class="flex items-center justify-between gap-2 w-full">
            <span
              class="text-label-sm-emphasized uppercase tracking-wider truncate"
              [class.text-muted]="!isSelected"
            >
              {{ tile.label }}
            </span>
            <span
              class="w-8 h-8 rounded-m3-md grid place-items-center shrink-0"
              [class]="
                isSelected
                  ? 'bg-primary text-on-primary'
                  : tile.inactiveIconBoxClass
              "
              aria-hidden="true"
            >
              <span class="material-symbols-rounded text-[18px]">{{ tile.icon }}</span>
            </span>
          </div>

          <div class="flex items-baseline justify-between gap-2 w-full">
            <span
              class="text-headline-sm-emphasized font-mono tabular-nums"
              [class.text-error]="!isSelected && tile.highlightCritical"
            >
              {{ tile.value }}
            </span>
            <span
              class="text-label-sm truncate"
              [class.text-muted]="!isSelected"
            >
              {{ isSelected ? 'Filtro activo' : tile.sublabel }}
            </span>
          </div>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicKpiRibbonComponent {
  readonly kpi = input.required<ClinicKpiSummary>();
  readonly waitingCount = input.required<number>();
  readonly activeFilter = input.required<TriageFilter>();

  readonly filterChange = output<TriageFilter>();

  protected readonly kpiTiles = computed<readonly ClinicKpiTile[]>(() => {
    const k = this.kpi();
    const waiting = this.waitingCount();

    return [
      {
        id: 'all',
        label: 'Pacientes Activos',
        value: String(k.totalActivePatients),
        sublabel: 'En emergencia',
        icon: 'groups',
        inactiveIconBoxClass: 'bg-surface-high text-main'
      },
      {
        id: 'critical',
        label: 'Críticos N1/N2',
        value: String(k.criticalCases),
        sublabel: `${k.highRiskNews2Count} NEWS2 crítico`,
        icon: 'emergency',
        inactiveIconBoxClass:
          k.criticalCases > 0 ? 'bg-error-box text-on-error-box' : 'bg-surface-high text-muted',
        highlightCritical: k.criticalCases > 0
      },
      {
        id: 'urgent',
        label: 'Urgentes N3',
        value: String(k.urgentCases),
        sublabel: `Espera ~${k.avgWaitMinutes}m`,
        icon: 'pace',
        inactiveIconBoxClass: 'bg-warning-box text-on-warning-box'
      },
      {
        id: 'waiting',
        label: 'En Espera',
        value: String(waiting),
        sublabel: 'Sin box asignado',
        icon: 'hourglass_top',
        inactiveIconBoxClass: 'bg-sec-box text-on-sec-box'
      },
      {
        id: 'in_bed',
        label: 'Boxes Ocupados',
        value: `${k.occupiedBeds}/${k.totalBeds}`,
        sublabel: `${k.bedOccupancyPercent}% · ST ${k.shockTraumaOccupancy}`,
        icon: 'bed',
        inactiveIconBoxClass: 'bg-primary-box text-on-primary-box'
      }
    ];
  });
}
