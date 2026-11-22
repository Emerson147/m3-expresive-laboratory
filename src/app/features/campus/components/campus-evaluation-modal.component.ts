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
import { CreateAssignmentDto } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-campus-evaluation-modal',
  imports: [M3DialogComponent, M3ButtonComponent, M3SwitchComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Asignar Nueva Evaluación"
      [viewTransitionName]="viewTransitionName()"
      customClass="campus-modal-dialog"
      (closeRequested)="close.emit()"
    >
      @if (open()) {
        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
            <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-m3-lg bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[21px]">add_task</span>
                </div>
                <div class="min-w-0">
                  <h3 id="campus-eval-heading" class="text-title-lg-emphasized text-main tracking-tight">
                    Nueva evaluación / tarea
                  </h3>
                  <p class="text-label-md text-muted truncate mt-0.5">
                    Se publicará en vivo en el calendario de {{ defaultSubject() }}
                  </p>
                </div>
              </div>

              <m3-button
                variant="text"
                size="sm"
                icon="close"
                [iconOnly]="true"
                ariaLabel="Cerrar formulario de nueva evaluación"
                (action)="close.emit()"
              />
            </header>
          </div>

          <form
            (submit)="handleSubmit($event)"
            novalidate
            class="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <div #modalScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-4">
              <m3-text-field
                #titleField
                [id]="'campus-eval-title'"
                name="title"
                variant="filled"
                label="Título de la evaluación o entrega"
                placeholder="Ej. Práctica Calificada 3: Oscilador Armónico"
                icon="assignment"
                enterkeyhint="next"
                [required]="true"
                [clearable]="true"
                [showValidState]="titleTouched() || submitAttempted()"
                [isError]="titleError() !== ''"
                [errorText]="titleError() || null"
                [value]="title()"
                (valueChange)="title.set($event)"
                (inputBlur)="titleTouched.set(true)"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <m3-text-field
                  [id]="'campus-eval-subject'"
                  name="subject"
                  variant="filled"
                  label="Curso"
                  icon="school"
                  [required]="true"
                  [value]="subject()"
                  (valueChange)="subject.set($event)"
                />

                <m3-text-field
                  [id]="'campus-eval-due'"
                  name="dueDate"
                  variant="filled"
                  label="Fecha y hora límite"
                  placeholder="Ej. Viernes 20:00"
                  icon="event"
                  [value]="dueDate()"
                  (valueChange)="dueDate.set($event)"
                />
              </div>

              <m3-text-field
                [id]="'campus-eval-rubric'"
                name="rubricHint"
                variant="filled"
                label="Criterios de rúbrica (opcional)"
                placeholder="Ej. Adjuntar código fuente y análisis de error..."
                icon="fact_check"
                [multiline]="true"
                [autoGrow]="true"
                [rows]="2"
                [value]="rubricHint()"
                (valueChange)="rubricHint.set($event)"
              />

              <div class="bg-surface rounded-m3-xl p-3.5">
                <m3-switch
                  [(checked)]="urgent"
                  iconMode="both"
                  label="Marcar como entrega urgente"
                  description="Prioriza la tarjeta con badge de urgencia para el estudiante"
                />
              </div>
            </div>

            <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
              <m3-button variant="text" size="md" type="button" (action)="close.emit()">
                Cancelar
              </m3-button>
              <m3-button variant="filled" size="md" type="submit" icon="publish">
                Asignar Tarea
              </m3-button>
            </footer>
          </form>
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusEvaluationModalComponent {
  readonly open = input<boolean>(false);
  readonly defaultSubject = input<string>('Física Cuántica');
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly createEvaluation = output<CreateAssignmentDto>();

  readonly title = signal<string>('');
  readonly subject = signal<string>('Física Cuántica');
  readonly dueDate = signal<string>('Viernes 23:59');
  readonly rubricHint = signal<string>('');
  readonly urgent = signal<boolean>(false);
  readonly titleTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

  private readonly injector = inject(Injector);
  private readonly titleField = viewChild<M3TextFieldComponent>('titleField');
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private wasOpen = false;

  protected readonly titleError = computed(() => {
    if (!this.titleTouched() && !this.submitAttempted()) return '';
    return this.title().trim().length < 3
      ? 'Ingresa un título de al menos 3 caracteres.'
      : '';
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        untracked(() => {
          this.title.set('');
          this.subject.set(this.defaultSubject());
          this.dueDate.set('Viernes 23:59');
          this.rubricHint.set('');
          this.urgent.set(false);
          this.titleTouched.set(false);
          this.submitAttempted.set(false);
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

  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    const cleanedTitle = this.title().trim();
    if (cleanedTitle.length < 3) {
      this.titleField()?.focus();
      return;
    }

    this.createEvaluation.emit({
      title: cleanedTitle,
      subject: this.subject().trim() || this.defaultSubject(),
      dueDate: this.dueDate().trim() || 'Próximo lunes 23:59',
      rubricHint: this.rubricHint().trim() || undefined,
      urgent: this.urgent()
    });
  }
}
