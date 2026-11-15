import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import { Vehicle } from '../../../core/telemetry/telemetry.models';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
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
  imports: [FormsModule, M3ButtonComponent, M3ButtonGroupComponent, M3TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [TELEMETRY_SELECT_STYLES],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
      class="fixed inset-0 z-40 bg-scrim cursor-pointer"></div>

    <div
      id="telemetry-assign-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tel-assign-title"
      [style.view-transition-name]="isDialogTransitionActive() ? 'dialog-transform' : null"
      [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
      [class.shadow-m3-level3]="!isDialogTransitionActive()"
      class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-xl h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box">

      <!-- Fixed Tonal Modal Header (Divider-Free) -->
      <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
        <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-2xl" aria-hidden="true">add_road</span>
            </div>

            <div class="min-w-0">
              <h2
                #modalHeading
                id="tel-assign-title"
                tabindex="-1"
                class="text-title-lg-emphasized text-main outline-none leading-tight">
                Asignar Nueva Ruta
              </h2>
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
                    {{ v.id }} • {{ v.plate }} ({{ v.driver }}) — {{ v.destination }}
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

          <section aria-label="Protocolo de carga" class="bg-surface rounded-m3-xl p-4 sm:p-5 space-y-2.5">
            <span class="text-label-md-emphasized text-main block">Protocolo de Carga</span>
            <m3-button-group
              variant="standard"
              selectionMode="single"
              size="md"
              ariaLabel="Protocolo de carga"
              [options]="cargoOptions"
              [value]="selectedCargoGroup()"
              (selectionChange)="onCargoSelectionChange($event)" />
          </section>
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
    </div>
  `
})
export class TelemetryAssignModalComponent {
  readonly stageOverlay = inject(StageOverlayService);

  readonly vehicles = input.required<Vehicle[]>();
  readonly vehicleId = model.required<string>();
  readonly corridor = model.required<string>();
  readonly destination = model.required<string>();
  readonly driver = model.required<string>();
  readonly cargoType = model.required<TelemetryCargoProtocol>();
  readonly isDialogTransitionActive = input<boolean>(false);

  readonly close = output<void>();
  readonly submitRoute = output<void>();

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');
  private readonly destinationField = viewChild<M3TextFieldComponent>('destinationField');
  private readonly driverField = viewChild<M3TextFieldComponent>('driverField');

  readonly destinationTouched = signal<boolean>(false);
  readonly driverTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

  readonly cargoOptions = [...TELEMETRY_CARGO_PROTOCOL_OPTIONS];
  readonly corridorOptions = TELEMETRY_CORRIDOR_OPTIONS;
  readonly selectedCargoGroup = computed<string[]>(() => [this.cargoType()]);

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
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
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
