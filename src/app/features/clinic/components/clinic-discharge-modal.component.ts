import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {
  DischargeDisposition,
  PatientTriageRecord
} from '../../../core/clinic/clinic.models';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { DISCHARGE_DISPOSITION_META } from './clinic-ui.tokens';

@Component({
  selector: 'app-clinic-discharge-modal',
  imports: [M3ButtonComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  template: `
    <div
      (click)="close.emit()"
      [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
      class="fixed inset-0 z-40 bg-scrim cursor-pointer"
      aria-hidden="true"
    ></div>

    <div class="clinic-modal-stage fixed inset-0 z-50 p-3 sm:p-5 pointer-events-none">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="clinic-discharge-heading"
        [style.view-transition-name]="isTransitioning() ? 'dialog-transform' : null"
        [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
        [class.shadow-m3-level3]="!isTransitioning()"
        class="pointer-events-auto w-full max-w-lg h-fit max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box"
      >
        <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
          <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
                aria-hidden="true"
              >
                <span class="material-symbols-rounded text-[21px]">medical_services</span>
              </div>
              <div class="min-w-0">
                <h2
                  id="clinic-discharge-heading"
                  #modalHeading
                  tabindex="-1"
                  class="outline-none text-title-lg-emphasized text-main tracking-tight"
                >
                  Confirmar Egreso Clínico
                </h2>
                <p class="text-label-md text-muted mt-0.5 truncate">
                  {{ patient().fullName }} · {{ patient().ticketCode }} · NEWS2 {{ patient().news2.score }}
                </p>
              </div>
            </div>

            <m3-button
              variant="text"
              size="sm"
              icon="close"
              [iconOnly]="true"
              ariaLabel="Cancelar egreso"
              (action)="close.emit()"
            />
          </header>
        </div>

        <form (submit)="handleConfirm($event)" class="contents">
          <div class="px-5 sm:px-6 py-3 flex flex-col gap-4 overflow-y-auto m3-scrollbar">
            @if (patient().bedAssignedId; as bedId) {
              <div class="rounded-m3-lg bg-warning-box text-on-warning-box px-3.5 py-2.5 flex items-center gap-2.5 text-label-md">
                <span class="material-symbols-rounded text-[18px] shrink-0" aria-hidden="true">
                  cleaning_services
                </span>
                <span>
                  El box <strong>{{ bedId }}</strong> quedará liberado y pasará automáticamente a <strong>Desinfección</strong>.
                </span>
              </div>
            }

            <div class="flex flex-col gap-2">
              <p class="text-label-md-emphasized text-muted">
                Destino clínico de salida
              </p>
              <div role="radiogroup" aria-label="Destino clínico de egreso" class="flex flex-col gap-2">
                @for (opt of dispositionOptions; track opt.id) {
                  @let selected = disposition() === opt.id;
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="selected"
                    (click)="disposition.set(opt.id)"
                    [class]="
                      'clinic-surface-tile w-full text-left p-3.5 flex items-start gap-3 cursor-pointer ' +
                      (selected
                        ? 'is-selected bg-primary-box text-on-primary-box'
                        : 'bg-surface hover:bg-surface-high text-main')
                    "
                  >
                    <span
                      [class]="opt.badgeClass"
                      class="w-9 h-9 rounded-m3-md grid place-items-center shrink-0"
                      aria-hidden="true"
                    >
                      <span class="material-symbols-rounded text-[19px]">{{ opt.icon }}</span>
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block text-title-sm-emphasized">{{ opt.label }}</span>
                      <span
                        class="block text-body-sm mt-0.5"
                        [class.text-muted]="!selected"
                      >
                        {{ opt.description }}
                      </span>
                    </span>
                  </button>
                }
              </div>
            </div>

            <m3-text-field
              class="block"
              variant="filled"
              label="Indicaciones o nota de egreso (opcional)"
              placeholder="Ej: Control ambulatorio en 48h, analgesia VO..."
              [multiline]="true"
              [rows]="2"
              [autoGrow]="true"
              [value]="notes()"
              (valueChange)="notes.set($event)"
            />
          </div>

          <footer class="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 shrink-0 flex items-center justify-end gap-2">
            <m3-button variant="text" size="md" (action)="close.emit()">
              Cancelar
            </m3-button>
            <m3-button type="submit" variant="filled" size="md" icon="check_circle">
              Confirmar Egreso
            </m3-button>
          </footer>
        </form>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicDischargeModalComponent {
  protected readonly stageOverlay = inject(StageOverlayService);
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly patient = input.required<PatientTriageRecord>();
  readonly isTransitioning = input<boolean>(false);

  readonly close = output<void>();
  readonly confirm = output<{
    patientId: string;
    disposition: DischargeDisposition;
    notes?: string;
  }>();

  protected readonly dispositionOptions = DISCHARGE_DISPOSITION_META;
  readonly disposition = signal<DischargeDisposition>('home');
  readonly notes = signal<string>('');

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });
  }

  protected handleConfirm(event: Event): void {
    event.preventDefault();
    this.confirm.emit({
      patientId: this.patient().id,
      disposition: this.disposition(),
      notes: this.notes().trim() || undefined
    });
  }
}
