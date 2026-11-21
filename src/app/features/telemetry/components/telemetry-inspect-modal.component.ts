import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { LiveTelemetryEvent, Vehicle, VehicleStatus } from '../../../core/telemetry/telemetry.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

@Component({
  selector: 'app-telemetry-inspect-modal',
  standalone: true,
  imports: [M3DialogComponent, M3ButtonComponent, M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Diagnóstico CAN-BUS"
      [viewTransitionName]="viewTransitionName()"
      customClass="tel-inspect-dialog"
      (closeRequested)="close.emit()">

      <!-- Floating Tonal Modal Header -->
      <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
        <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-2xl" aria-hidden="true">sensors</span>
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-0.5">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized font-mono tabular-nums">
                  {{ vehicle().id }}
                </span>
                <span
                  [class]="'px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized ' + statusBadgeClass()">
                  {{ statusLabel() }}
                </span>
              </div>

              <h3
                id="tel-inspect-title"
                class="text-title-lg-emphasized text-main leading-tight">
                Diagnóstico CAN-BUS
              </h3>

              <p class="text-body-sm text-muted truncate mt-0.5">
                Placa {{ vehicle().plate }} • {{ vehicle().driver }} • {{ vehicle().corridor }}
              </p>
            </div>
          </div>

          <m3-button
            [iconOnly]="true"
            variant="text"
            size="sm"
            icon="close"
            ariaLabel="Cerrar diagnóstico CAN-BUS"
            (action)="close.emit()" />
        </header>
      </div>

      <!-- Inner Scrollable Diagnostic Body -->
      <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar px-5 sm:px-6 py-2 space-y-4">

        <!-- 1. Route Wave Telemetry Summary -->
        <section aria-label="Resumen de despacho de unidad" class="p-4 rounded-m3-xl bg-surface space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-2 text-label-md font-mono tabular-nums">
            <span class="text-muted font-sans">
              {{ vehicle().origin }} &rarr; {{ vehicle().destination }}
            </span>
            <span class="font-bold text-main">
              {{ vehicle().progressPercent }}% • ETA {{ vehicle().etaMinutes }}m
            </span>
          </div>

          <m3-linear-progress
            [value]="vehicle().progressPercent"
            [wavy]="true"
            [paused]="!isLiveTelemetryActive()"
            size="md"
            color="primary"
            [ariaLabel]="'Progreso de despacho de ' + vehicle().id" />

          <div class="flex items-center justify-between text-label-sm font-mono tabular-nums text-muted pt-0.5">
            <span>Velocidad: {{ vehicle().speedKmh }} km/h</span>
            <span>Último ping: {{ vehicle().lastPingTime }}</span>
          </div>
        </section>

        <!-- 2. Comparative Diagnostic Subsystems (Propulsion/Energy vs Cold-Chain Integrity) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Propulsion & Chassis -->
          <section aria-label="Subsistema motriz y energía" class="bg-surface rounded-m3-xl p-4 space-y-3.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">engineering</span>
                <h4 class="text-label-md-emphasized uppercase tracking-wider text-muted m-0">Propulsión &amp; Energía</h4>
              </div>
              <span class="px-2 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-label-sm-emphasized">
                {{ propulsionStatus() }}
              </span>
            </div>

            <div class="space-y-3">
              <div class="p-3 rounded-m3-lg bg-surface-low space-y-1.5">
                <div class="flex items-center justify-between text-label-sm font-mono tabular-nums">
                  <span class="text-muted font-sans">Nivel Combustible</span>
                  <span class="font-bold text-main">{{ vehicle().telemetry.fuelLevelPercent }}%</span>
                </div>
                <div class="h-2 rounded-m3-full bg-surface-high overflow-hidden" aria-hidden="true">
                  <div
                    [class]="'h-full rounded-m3-full ' + (vehicle().telemetry.fuelLevelPercent < 45 ? 'bg-warning' : 'bg-primary')"
                    [style.width.%]="vehicle().telemetry.fuelLevelPercent">
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 font-mono tabular-nums">
                <div class="p-2.5 rounded-m3-lg bg-surface-low">
                  <span class="text-label-sm text-muted block font-sans">Motor</span>
                  <span class="text-title-sm-emphasized text-main">{{ vehicle().telemetry.engineRpm }}</span>
                  <span class="text-[11px] text-muted block">RPM</span>
                </div>
                <div class="p-2.5 rounded-m3-lg bg-surface-low">
                  <span class="text-label-sm text-muted block font-sans">Batería</span>
                  <span class="text-title-sm-emphasized text-main">{{ vehicle().telemetry.batteryVolts }}</span>
                  <span class="text-[11px] text-muted block">Voltios</span>
                </div>
                <div class="p-2.5 rounded-m3-lg bg-surface-low">
                  <span class="text-label-sm text-muted block font-sans">Neumáticos</span>
                  <span class="text-title-sm-emphasized text-main">{{ vehicle().telemetry.tirePressurePsi }}</span>
                  <span class="text-[11px] text-muted block">PSI</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Thermal & Cold Chain Integrity -->
          <section aria-label="Integridad térmica de carga" class="bg-surface rounded-m3-xl p-4 space-y-3.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-base text-tertiary" aria-hidden="true">ac_unit</span>
                <h4 class="text-label-md-emphasized uppercase tracking-wider text-muted m-0">Integridad Térmica</h4>
              </div>
              <span
                [class]="'px-2 py-0.5 rounded-m3-full text-label-sm-emphasized ' + thermalBadgeClass()">
                {{ thermalBadgeLabel() }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2.5 font-mono tabular-nums">
              <div class="p-3 rounded-m3-lg bg-surface-low space-y-1">
                <span class="text-label-sm text-muted block font-sans">Cabina</span>
                <span class="text-title-lg-emphasized text-main block">{{ vehicle().telemetry.cabinTempC }}°C</span>
                <span class="text-label-sm text-muted font-sans block">Ambiente</span>
              </div>

              <div class="p-3 rounded-m3-lg bg-surface-low space-y-1">
                <span class="text-label-sm text-muted block font-sans">Bodega Carga</span>
                <span
                  [class]="'text-title-lg-emphasized block ' +
                    (isColdAlert() ? 'text-warning' : vehicle().telemetry.cargoTempC < 0 ? 'text-tertiary' : 'text-main')">
                  {{ vehicle().telemetry.cargoTempC }}°C
                </span>
                <span class="text-label-sm text-muted font-sans block">{{ thermalThresholdText() }}</span>
              </div>
            </div>

            <div class="p-3 rounded-m3-lg bg-surface-low flex items-center justify-between gap-2 text-label-sm">
              <span class="text-muted">Diferencial térmico cabina / carga</span>
              <span class="font-mono font-bold tabular-nums text-main">{{ thermalDeltaText() }}</span>
            </div>
          </section>
        </div>

        <!-- 3. Unit Timeline Context -->
        <section aria-label="Últimos eventos de la unidad" class="bg-surface rounded-m3-xl p-4 space-y-2.5">
          <h4 class="text-label-md-emphasized uppercase tracking-wider text-muted m-0">
            Bitácora Reciente ({{ vehicle().id }})
          </h4>

          @if (unitEvents().length > 0) {
            <ul class="list-none m-0 p-0 space-y-2">
              @for (evt of unitEvents(); track evt.id) {
                <li class="p-3 rounded-m3-lg bg-surface-low flex items-start justify-between gap-3">
                  <span class="text-body-sm text-main leading-snug">{{ evt.message }}</span>
                  <time class="text-label-sm font-mono tabular-nums text-muted shrink-0">{{ evt.timestamp }}</time>
                </li>
              }
            </ul>
          } @else {
            <p class="text-body-sm text-muted m-0 py-1">
              Sin incidencias ni alertas registradas para esta unidad durante el turno actual.
            </p>
          }
        </section>
      </div>

      <!-- Fixed Divider-Free Action Footer -->
      <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
        <m3-button variant="text" (action)="close.emit()">
          Cerrar
        </m3-button>
        <m3-button variant="filled" icon="download" (action)="exportTelemetry.emit(vehicle())">
          Exportar Telemetría
        </m3-button>
      </footer>
    </m3-dialog>
  `
})
export class TelemetryInspectModalComponent {
  readonly open = input<boolean>(false);
  readonly vehicle = input.required<Vehicle>();
  readonly events = input<LiveTelemetryEvent[]>([]);
  readonly isLiveTelemetryActive = input.required<boolean>();
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly exportTelemetry = output<Vehicle>();

  readonly unitEvents = computed(() => {
    const targetId = this.vehicle().id;
    return this.events().filter(evt => evt.vehicleId === targetId).slice(0, 4);
  });

  readonly isColdAlert = computed(() => {
    const v = this.vehicle();
    return v.status === 'cold_chain_warning' || (v.telemetry.cargoTempC < 0 && v.telemetry.cargoTempC > -16);
  });

  readonly propulsionStatus = computed(() =>
    this.vehicle().telemetry.fuelLevelPercent < 45 ? 'Combustible bajo' : 'Nominal'
  );

  readonly thermalBadgeLabel = computed(() => {
    const temp = this.vehicle().telemetry.cargoTempC;
    if (temp >= 0) return 'Carga seca';
    return temp <= -16 ? 'Cadena intacta' : 'Desvío térmico';
  });

  readonly thermalBadgeClass = computed(() => {
    const temp = this.vehicle().telemetry.cargoTempC;
    if (temp >= 0) return 'bg-surface-high text-main';
    return temp <= -16 ? 'bg-tertiary-box text-on-tertiary-box' : 'bg-warning-box text-on-warning-box';
  });

  readonly thermalThresholdText = computed(() =>
    this.vehicle().telemetry.cargoTempC < 0 ? 'Umbral <= -16°C' : 'Rango ambiente'
  );

  readonly thermalDeltaText = computed(() => {
    const { cabinTempC, cargoTempC } = this.vehicle().telemetry;
    const diff = Math.round(Math.abs(cabinTempC - cargoTempC) * 10) / 10;
    return `${diff}°C Δ`;
  });

  readonly statusBadgeClass = computed(() => {
    const status: VehicleStatus = this.vehicle().status;
    switch (status) {
      case 'optimal':
      case 'in_transit':
        return 'bg-success-box text-on-success-box';
      case 'delayed':
      case 'cold_chain_warning':
        return 'bg-warning-box text-on-warning-box';
      case 'critical':
        return 'bg-error-box text-on-error-box';
      default:
        return 'bg-surface-high text-main';
    }
  });

  readonly statusLabel = computed(() => {
    switch (this.vehicle().status) {
      case 'optimal':
        return 'Óptimo';
      case 'in_transit':
        return 'En Ruta';
      case 'delayed':
        return 'Riesgo SLA';
      case 'critical':
        return 'Crítico';
      case 'cold_chain_warning':
        return 'Alerta Térmica';
      default:
        return 'En Ruta';
    }
  });
}
