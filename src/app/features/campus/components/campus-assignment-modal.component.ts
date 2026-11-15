import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { StudentAssignment, SubmitAssignmentDto } from '../../../core/campus/campus.models';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-campus-assignment-modal',
  imports: [M3ButtonComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  template: `
    @if (assignment(); as item) {
      <div
        (click)="close.emit()"
        [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
        class="fixed inset-0 z-40 bg-scrim cursor-pointer"
        aria-hidden="true"
      ></div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campus-assignment-heading"
        [style.view-transition-name]="isTransitioning() ? 'dialog-transform' : null"
        [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
        [class.shadow-m3-level3]="!isTransitioning()"
        class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-lg h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box"
      >
        <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
          <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span
                  class="px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized"
                  [class]="statusPill().badgeClass"
                >
                  {{ statusPill().label }}
                </span>
                <span class="text-label-sm text-muted truncate">
                  {{ item.subject }}
                </span>
              </div>
              <h2
                id="campus-assignment-heading"
                #modalHeading
                tabindex="-1"
                class="outline-none text-title-lg-emphasized text-main tracking-tight leading-snug"
              >
                {{ item.title }}
              </h2>
            </div>

            <m3-button
              variant="text"
              size="sm"
              icon="close"
              [iconOnly]="true"
              ariaLabel="Cerrar detalle de entrega"
              (action)="close.emit()"
            />
          </header>
        </div>

        <div class="px-5 sm:px-6 py-3 space-y-4 overflow-y-auto m3-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div class="bg-surface rounded-m3-lg p-3">
              <p class="text-label-sm uppercase tracking-wider text-muted">
                Plazo / Estado
              </p>
              <p class="text-title-sm-emphasized text-main mt-1">
                {{ item.dueDate }}
              </p>
            </div>
            <div class="bg-surface rounded-m3-lg p-3">
              <p class="text-label-sm uppercase tracking-wider text-muted">
                {{ item.score ? 'Calificación' : 'Registro de envío' }}
              </p>
              <p class="text-title-sm-emphasized text-main mt-1">
                {{ item.score ?? item.submittedAt ?? 'Pendiente de carga' }}
              </p>
            </div>
          </div>

          @if (item.rubricHint) {
            <div class="bg-surface rounded-m3-lg p-3.5 space-y-1">
              <div class="flex items-center gap-1.5 text-primary">
                <span class="material-symbols-rounded text-[18px]" aria-hidden="true">fact_check</span>
                <p class="text-label-sm-emphasized uppercase tracking-wider">
                  Criterios de evaluación
                </p>
              </div>
              <p class="text-body-sm text-muted leading-relaxed">
                {{ item.rubricHint }}
              </p>
            </div>
          }

          @if (item.submissionStatus === 'pending') {
            <m3-text-field
              variant="filled"
              label="Nota de entrega o enlace de repositorio (opcional)"
              placeholder="Ej. Adjunto informe final y código fuente verificado."
              icon="attach_file"
              [multiline]="true"
              [autoGrow]="true"
              [rows]="3"
              [clearable]="true"
              [value]="deliveryNote()"
              (valueChange)="deliveryNote.set($event)"
            />
          } @else {
            <div class="bg-success-box/80 text-on-success-box rounded-m3-lg p-3.5 flex items-center gap-2.5 text-body-sm font-medium">
              <span class="material-symbols-rounded text-[20px]" aria-hidden="true">task_alt</span>
              <span>
                {{
                  item.submissionStatus === 'graded'
                    ? 'Entrega evaluada y registrada en tu historial académico.'
                    : 'Entrega registrada correctamente. Esperando calificación docente.'
                }}
              </span>
            </div>
          }
        </div>

        <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
          @if (item.submissionStatus === 'pending') {
            <m3-button variant="text" size="md" (action)="close.emit()">
              Cancelar
            </m3-button>
            <m3-button
              variant="filled"
              size="md"
              icon="upload_file"
              (action)="handleConfirmSubmit()"
            >
              Confirmar Entrega
            </m3-button>
          } @else {
            <m3-button variant="tonal" size="md" (action)="close.emit()">
              Cerrar
            </m3-button>
          }
        </footer>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusAssignmentModalComponent {
  protected readonly stageOverlay = inject(StageOverlayService);

  readonly assignment = input<StudentAssignment | null>(null);
  readonly isTransitioning = input<boolean>(false);

  readonly close = output<void>();
  readonly submitDelivery = output<SubmitAssignmentDto>();

  readonly deliveryNote = signal<string>('');

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  protected readonly statusPill = computed(() => {
    const current = this.assignment();
    if (!current) {
      return { label: '', badgeClass: 'bg-surface-high text-main' };
    }
    if (current.submissionStatus === 'graded') {
      return { label: 'Calificada', badgeClass: 'bg-success-box text-on-success-box' };
    }
    if (current.submissionStatus === 'submitted') {
      return { label: 'Entregada', badgeClass: 'bg-primary-box text-on-primary-box' };
    }
    return current.urgency === 'urgent'
      ? { label: 'Urgente', badgeClass: 'bg-error-box text-on-error-box' }
      : { label: 'Por entregar', badgeClass: 'bg-sec-box text-on-sec-box' };
  });

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });
  }

  protected handleConfirmSubmit(): void {
    const current = this.assignment();
    if (!current || current.submissionStatus !== 'pending') return;

    this.submitDelivery.emit({
      assignmentId: current.id,
      note: this.deliveryNote()
    });
  }
}
