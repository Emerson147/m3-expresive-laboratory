import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-clinic-header',
  imports: [M3ButtonComponent, M3TextFieldComponent],
  host: { class: 'block shrink-0' },
  template: `
    <header
      class="rounded-m3-xl bg-surface-low px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <div class="flex items-start sm:items-center gap-3.5 min-w-0">
        <div
          class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
          aria-hidden="true"
        >
          <span class="material-symbols-rounded text-[24px]">local_hospital</span>
        </div>

        <div class="min-w-0 space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-title-lg-emphasized text-main tracking-tight">
              Estación de Emergencias &amp; Triaje
            </h1>
            <span
              class="px-2.5 py-0.5 rounded-m3-full bg-surface text-muted text-label-sm-emphasized font-mono"
            >
              MTS Manchester
            </span>
            <span
              class="hidden sm:inline-flex px-2.5 py-0.5 rounded-m3-full bg-sec-box text-on-sec-box text-label-sm-emphasized font-mono"
            >
              NEWS2 Activo
            </span>
          </div>

          <p class="text-body-sm text-muted">
            Soporte a la Decisión Clínica · Monitoreo Hemodinámico y Gestión de Boxes
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
        <div class="w-full sm:w-64">
          <m3-text-field
            variant="outlined"
            icon="search"
            label="Buscar paciente"
            placeholder="Nombre, ticket TR o box..."
            autocomplete="off"
            [clearable]="true"
            [value]="searchQuery()"
            (valueChange)="searchChange.emit($event)"
            (clear)="searchChange.emit('')"
          />
        </div>

        <div class="shrink-0 self-start sm:self-center">
          <m3-button
            id="clinic-header-admit-btn"
            variant="filled"
            size="md"
            icon="person_add"
            [morph]="true"
            [invisible]="isDialogOpen() && activeDialogTrigger() === 'clinic-header-admit-btn'"
            [viewTransitionName]="
              !isDialogOpen() && activeDialogTrigger() === 'clinic-header-admit-btn'
                ? 'dialog-transform'
                : null
            "
            (action)="openAdmission.emit('clinic-header-admit-btn')"
          >
            Nueva Admisión
          </m3-button>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicHeaderComponent {
  readonly searchQuery = input<string>('');
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);

  readonly searchChange = output<string>();
  readonly openAdmission = output<string>();
}
