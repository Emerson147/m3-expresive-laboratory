import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { StudentAssignment, SubmitAssignmentDto } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-campus-assignment-modal',
  imports: [M3DialogComponent, M3ButtonComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open() && !!assignment()"
      [managedClose]="true"
      [showCloseButton]="false"
      [headline]="dialogHeadline()"
      [viewTransitionName]="viewTransitionName()"
      customClass="campus-modal-dialog"
      (closeRequested)="close.emit()"
    >
      @if (open() && assignment(); as item) {
        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
            <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    [class]="'px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized ' + statusPill().badgeClass"
                  >
                    {{ statusPill().label }}
                  </span>
                  <span class="text-label-sm text-muted truncate">
                    {{ item.subject }}
                  </span>
                </div>
                <h3
                  id="campus-assignment-heading"
                  class="text-title-lg-emphasized text-main tracking-tight leading-snug"
                >
                  {{ item.title }}
                </h3>
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

          <div #modalScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-4">
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
                [id]="'campus-assignment-note'"
                name="deliveryNote"
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
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusAssignmentModalComponent {
  readonly open = input<boolean>(false);
  readonly assignment = input<StudentAssignment | null>(null);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly submitDelivery = output<SubmitAssignmentDto>();

  readonly deliveryNote = signal<string>('');

  private readonly injector = inject(Injector);
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private wasOpen = false;

  protected readonly dialogHeadline = computed(() => {
    const item = this.assignment();
    return item ? item.title : 'Detalle de Entrega';
  });

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
    effect(() => {
      const current = this.assignment();
      const isOpen = this.open() && Boolean(current);
      if (isOpen && !this.wasOpen) {
        untracked(() => {
          this.deliveryNote.set('');
          afterNextRender(
            () => {
              const el = this.modalScrollBody()?.nativeElement;
              if (el) el.scrollTop = 0;
            },
            { injector: this.injector }
          );
        });
      }
      this.wasOpen = isOpen;
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
