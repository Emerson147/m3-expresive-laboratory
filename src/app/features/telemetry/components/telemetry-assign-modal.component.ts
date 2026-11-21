import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Vehicle } from '../../../core/telemetry/telemetry.models';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { TELEMETRY_SELECT_STYLES } from './telemetry-expressive.styles';

export type TelemetryCargoProtocol = 'cold_chain' | 'dry' | 'pharma';

export const TELEMETRY_CARGO_PROTOCOL_OPTIONS: readonly M3ButtonGroupOption[] = [
  { id: 'cold_chain', label: 'Frío (-18°C)', icon: 'ac_unit' },
  { id: 'dry', label: 'Seca General', icon: 'inventory_2' },
  { id: 'pharma', label: 'Farma (2-8°C)', icon: 'vaccines' }
];

export const TELEMETRY_CORRIDOR_OPTIONS: readonly { value: string; label: string }[] = [
  {
    value: 'Corredor Panamericana Sur',
    label: 'Corredor Panamericana Sur (Callao → Lurín → Chilca)'
  },
  {
    value: 'Corredor Carretera Central',
    label: 'Corredor Carretera Central (Planta Huachipa → Puerto Callao)'
  },
  {
    value: 'Corredor Industrial Norte',
    label: 'Corredor Industrial Norte (Terminal Ventanilla → Ancón)'
  }
];

@Component({
  selector: 'app-telemetry-assign-modal',
  standalone: true,
  imports: [
    FormsModule,
    M3DialogComponent,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3TextFieldComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [TELEMETRY_SELECT_STYLES],
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
      headline="Asignar Nueva Ruta"
      [viewTransitionName]="viewTransitionName()"
      customClass="tel-assign-dialog"
      (closeRequested)="close.emit()">

      <!-- Floating Tonal Modal Header -->
      <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
        <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-2xl" aria-hidden="true">add_road</span>
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="px-2 py-0.5 rounded-m3-xs bg-primary text-on-primary text-label-sm-emphasized font-mono uppercase tracking-wider">
                  Despacho Activo
                </span>
                @if (selectedVehicleSummary(); as unit) {
                  <span class="text-label-sm text-muted font-mono tabular-nums">
                    {{ unit.plate }} • {{ unit.cargoTempC }}°C actual
                  </span>
                }
              </div>

              <h3
                id="tel-assign-title"
                class="text-title-lg-emphasized text-main leading-tight">
                Asignar Nueva Ruta
              </h3>
              <p class="text-body-sm text-muted truncate mt-0.5">
                Configuración de corredor logístico y protocolo de despacho
              </p>
            </div>
          </div>

          <m3-button
            [iconOnly]="true"
            variant="text"
            size="sm"
            icon="close"
            ariaLabel="Cerrar asignación de ruta"
            (action)="close.emit()" />
        </header>
      </div>

      <form (ngSubmit)="onFormSubmit()" novalidate class="flex flex-col flex-1 min-h-0 overflow-hidden">
        <!-- Inner Scrollable Body -->
        <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar px-5 sm:px-6 py-2 space-y-4">
          <div class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="tel-filled-select">
                <label for="tel-assign-vehicle" class="tel-filled-select__label">Unidad de Flota</label>
                <select
                  id="tel-assign-vehicle"
                  name="vehicleId"
                  [value]="vehicleId()"
                  (change)="vehicleId.set($any($event.target).value)"
                  class="tel-select font-mono">
                  @for (v of vehicles(); track v.id) {
                    <option [value]="v.id" [selected]="v.id === vehicleId()">
                      {{ v.id }} • {{ v.plate }} ({{ v.driver }})
                    </option>
                  }
                </select>
              </div>

              <div class="tel-filled-select">
                <label for="tel-assign-corridor" class="tel-filled-select__label">Corredor Logístico</label>
                <select
                  id="tel-assign-corridor"
                  name="corridor"
                  [value]="corridor()"
                  (change)="corridor.set($any($event.target).value)"
                  class="tel-select">
                  @for (opt of corridorOptions; track opt.value) {
                    <option [value]="opt.value" [selected]="opt.value === corridor()">
                      {{ opt.label }}
                    </option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
              <m3-text-field
                #destinationField
                [id]="'tel-assign-destination'"
                name="destination"
                variant="filled"
                label="Destino Final *"
                placeholder="Ej. CD Lurín Km 40"
                icon="location_on"
                [required]="true"
                [minlength]="3"
                [clearable]="true"
                [showValidState]="true"
                [errorText]="destinationError()"
                [(value)]="destination"
                (inputBlur)="destinationTouched.set(true)" />

              <m3-text-field
                #driverField
                [id]="'tel-assign-driver'"
                name="driver"
                variant="filled"
                label="Conductor / Operador *"
                placeholder="Nombre del conductor"
                icon="person"
                [required]="true"
                [minlength]="3"
                [clearable]="true"
                [showValidState]="true"
                [errorText]="driverError()"
                [(value)]="driver"
                (inputBlur)="driverTouched.set(true)" />
            </div>
          </div>

          <section aria-label="Protocolo de carga" class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-label-md-emphasized text-main">Protocolo de Carga</span>
              <span class="text-label-sm text-muted">{{ protocolDescription() }}</span>
            </div>

            <m3-button-group
              class="tel-cargo-group-host"
              variant="connected"
              selectionMode="single"
              size="md"
              customClass="tel-cargo-group"
              ariaLabel="Protocolo de carga"
              [options]="cargoOptions"
              [value]="selectedCargoGroup()"
              (selectionChange)="onCargoSelectionChange($event)" />
          </section>

          <!-- Live Dispatch Preview Capsule -->
          <div class="rounded-m3-xl bg-primary-box/45 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="material-symbols-rounded text-base text-primary shrink-0" aria-hidden="true">route</span>
              <span class="text-label-md text-main truncate">
                <strong class="font-mono">{{ vehicleId() }}</strong> &rarr;
                {{ destination().trim() || 'Destino por definir' }}
              </span>
            </div>
            <span class="text-label-sm font-mono tabular-nums text-primary shrink-0">
              {{ selectedProtocolLabel() }} • {{ driver().trim() || 'Sin operador' }}
            </span>
          </div>
        </div>

        <!-- Fixed Divider-Free Action Footer -->
        <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
          <m3-button variant="text" (action)="close.emit()">
            Cancelar
          </m3-button>
          <m3-button type="submit" variant="filled" icon="check_circle">
            Confirmar Despacho
          </m3-button>
        </footer>
      </form>
    </m3-dialog>
  `
})
export class TelemetryAssignModalComponent {
  readonly open = input<boolean>(false);
  readonly vehicles = input.required<Vehicle[]>();
  readonly vehicleId = model.required<string>();
  readonly corridor = model.required<string>();
  readonly destination = model.required<string>();
  readonly driver = model.required<string>();
  readonly cargoType = model.required<TelemetryCargoProtocol>();
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly submitRoute = output<void>();

  private readonly destinationField = viewChild<M3TextFieldComponent>('destinationField');
  private readonly driverField = viewChild<M3TextFieldComponent>('driverField');

  readonly destinationTouched = signal<boolean>(false);
  readonly driverTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

  private wasOpen = false;

  readonly cargoOptions = [...TELEMETRY_CARGO_PROTOCOL_OPTIONS];
  readonly corridorOptions = TELEMETRY_CORRIDOR_OPTIONS;
  readonly selectedCargoGroup = computed<string[]>(() => [this.cargoType()]);

  readonly selectedVehicleSummary = computed(() =>
    this.vehicles().find(v => v.id === this.vehicleId()) ?? null
  );

  readonly selectedProtocolLabel = computed(() => {
    switch (this.cargoType()) {
      case 'cold_chain':
        return 'Frío (-18°C)';
      case 'pharma':
        return 'Farma (2-8°C)';
      case 'dry':
      default:
        return 'Seca General';
    }
  });

  readonly protocolDescription = computed(() => {
    switch (this.cargoType()) {
      case 'cold_chain':
        return 'Congelado profundo con alerta térmica > -16°C';
      case 'pharma':
        return 'Trazabilidad farmacéutica controlada de 2°C a 8°C';
      case 'dry':
      default:
        return 'Transporte seco estándar sin consigna térmica';
    }
  });

  readonly destinationError = computed<string | null>(() => {
    if (!this.destinationTouched() && !this.submitAttempted()) return null;
    const trimmed = this.destination().trim();
    if (!trimmed) return 'El destino final es obligatorio.';
    if (trimmed.length < 3) return 'Ingresa un destino de al menos 3 caracteres.';
    return null;
  });

  readonly driverError = computed<string | null>(() => {
    if (!this.driverTouched() && !this.submitAttempted()) return null;
    const trimmed = this.driver().trim();
    if (!trimmed) return 'El nombre del operador es obligatorio.';
    if (trimmed.length < 3) return 'Ingresa un nombre de al menos 3 caracteres.';
    return null;
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        untracked(() => {
          this.destinationTouched.set(false);
          this.driverTouched.set(false);
          this.submitAttempted.set(false);
        });
      }
      this.wasOpen = isOpen;
    });
  }

  onCargoSelectionChange(selected: string[]): void {
    const next = selected[0];
    if (next === 'cold_chain' || next === 'dry' || next === 'pharma') {
      this.cargoType.set(next);
    }
  }

  onFormSubmit(): void {
    this.submitAttempted.set(true);
    if (this.destination().trim().length < 3) {
      this.destinationField()?.focus();
      return;
    }
    if (this.driver().trim().length < 3) {
      this.driverField()?.focus();
      return;
    }
    this.submitRoute.emit();
  }
}
