import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ClinicKpiSummary } from '../../../core/clinic/clinic.models';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';

@Component({
  selector: 'app-clinic-kpi-ribbon',
  imports: [M3LinearProgressComponent],
  host: { class: 'block shrink-0' },
  template: `
    <section
      aria-label="Indicadores operativos de guardia clínica"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
    >
      <!-- 1. Service Pressure & Bed Occupancy -->
      <article class="clinic-kpi-card bg-surface-low p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
            Carga &amp; Ocupación
          </span>
          <span
            class="w-8 h-8 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-[18px]">monitoring</span>
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
              {{ kpi().totalActivePatients }}
              <span class="text-body-sm font-sans font-normal text-muted">activos</span>
            </span>
            <span class="text-label-sm-emphasized font-mono tabular-nums text-primary">
              {{ kpi().bedOccupancyPercent }}% boxes
            </span>
          </div>

          <m3-linear-progress
            [wavy]="false"
            [value]="kpi().bedOccupancyPercent"
            [color]="kpi().bedOccupancyPercent >= 85 ? 'error' : 'primary'"
            size="md"
            ariaLabel="Ocupación total de boxes de emergencia"
          />
        </div>
      </article>

      <!-- 2. Critical & Active Emergency Codes -->
      <article class="clinic-kpi-card bg-surface-low p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
            Críticos &amp; Códigos
          </span>
          <span
            [class]="
              'w-8 h-8 rounded-m3-md grid place-items-center shrink-0 ' +
              (kpi().criticalCases > 0 ? 'bg-error-box text-on-error-box' : 'bg-surface-high text-muted')
            "
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-[18px]">emergency</span>
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2 flex-wrap">
          <span
            [class]="
              'text-headline-sm-emphasized font-mono tabular-nums ' +
              (kpi().criticalCases > 0 ? 'text-error' : 'text-main')
            "
          >
            {{ kpi().criticalCases }}
            <span class="text-body-sm font-sans font-normal text-muted">N1 / N2</span>
          </span>

          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-m3-full bg-error-box text-on-error-box text-label-sm-emphasized font-mono tabular-nums">
              {{ kpi().activeCodesCount }} códigos
            </span>
            <span class="px-2 py-0.5 rounded-m3-full bg-surface text-muted text-label-sm font-mono tabular-nums">
              {{ kpi().highRiskNews2Count }} NEWS2 alto
            </span>
          </div>
        </div>
      </article>

      <!-- 3. Manchester SLA Compliance -->
      <article class="clinic-kpi-card bg-surface-low p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
            Cumplimiento SLA
          </span>
          <span
            [class]="
              'w-8 h-8 rounded-m3-md grid place-items-center shrink-0 ' +
              (kpi().slaBreachCount > 0 ? 'bg-warning-box text-on-warning-box' : 'bg-success-box text-on-success-box')
            "
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-[18px]">timer</span>
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2 flex-wrap">
          <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
            {{ kpi().slaCompliancePercent }}%
            <span class="text-body-sm font-sans font-normal text-muted">{{ kpi().avgWaitMinutes }}m prom.</span>
          </span>

          <span
            [class]="
              'px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums ' +
              (kpi().slaBreachCount > 0
                ? 'bg-error-box text-on-error-box'
                : 'bg-success-box text-on-success-box')
            "
          >
            {{ kpi().slaBreachCount > 0 ? kpi().slaBreachCount + ' SLA vencido' : 'En meta MTS' }}
          </span>
        </div>
      </article>

      <!-- 4. Bed & Shock Trauma Readiness -->
      <article class="clinic-kpi-card bg-surface-low p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
            Boxes Disponibles
          </span>
          <span
            class="w-8 h-8 rounded-m3-md bg-sec-box text-on-sec-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-[18px]">bed</span>
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2 flex-wrap">
          <span class="text-headline-sm-emphasized font-mono tabular-nums text-main">
            {{ kpi().availableBeds }}
            <span class="text-body-sm font-sans font-normal text-muted">libres / {{ kpi().totalBeds }}</span>
          </span>

          <div class="flex items-center gap-1.5 flex-wrap text-label-sm font-mono tabular-nums">
            <span class="px-2 py-0.5 rounded-m3-full bg-surface text-main">
              ST {{ kpi().shockTraumaOccupancy }}
            </span>
            <span class="px-2 py-0.5 rounded-m3-full bg-warning-box text-on-warning-box">
              {{ kpi().cleaningBeds }} limp.
            </span>
          </div>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicKpiRibbonComponent {
  readonly kpi = input.required<ClinicKpiSummary>();
}
