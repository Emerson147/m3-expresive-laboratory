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
import { CreateAnnouncementDto } from '../../../core/campus/campus.models';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const TAG_PRESETS = ['General', 'Evaluación', 'Laboratorio', 'Tutoría'] as const;

const TAG_OPTIONS: readonly M3ButtonGroupOption[] = TAG_PRESETS.map((tag) => ({
  id: tag,
  label: tag
}));

@Component({
  selector: 'app-campus-announcement-modal',
  imports: [
    M3DialogComponent,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3SwitchComponent,
    M3TextFieldComponent
  ],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Publicar aviso a clase"
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
                  class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[21px]">campaign</span>
                </div>
                <div class="min-w-0">
                  <h3
                    id="campus-announcement-heading"
                    class="text-title-lg-emphasized text-main tracking-tight"
                  >
                    Publicar aviso a clase
                  </h3>
                  <p class="text-label-md text-muted mt-0.5">
                    Llegará al Tablero Oficial de {{ enrolledCount() }} alumnos matriculados.
                  </p>
                </div>
              </div>

              <m3-button
                variant="text"
                size="sm"
                icon="close"
                [iconOnly]="true"
                ariaLabel="Cerrar compositor de avisos"
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
              <div class="bg-surface-low rounded-m3-xl p-3.5 space-y-2.5">
                <p class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                  Categoría del comunicado
                </p>
                <m3-button-group
                  class="campus-connected-group-host"
                  variant="connected"
                  selectionMode="single"
                  size="sm"
                  ariaLabel="Categoría del comunicado"
                  customClass="campus-connected-group"
                  [options]="tagOptions"
                  [value]="[tag()]"
                  (selectionChange)="onTagSelectionChange($event)"
                />
              </div>

              <m3-text-field
                #titleField
                [id]="'campus-announcement-title'"
                name="title"
                variant="filled"
                label="Título del aviso"
                placeholder="Ej. Guía adicional para laboratorio"
                icon="title"
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

              <m3-text-field
                #summaryField
                [id]="'campus-announcement-summary'"
                name="summary"
                variant="filled"
                label="Mensaje para los estudiantes"
                placeholder="Detalla indicaciones, horarios o recursos necesarios..."
                icon="notes"
                [multiline]="true"
                [autoGrow]="true"
                [rows]="3"
                [required]="true"
                [showValidState]="summaryTouched() || submitAttempted()"
                [isError]="summaryError() !== ''"
                [errorText]="summaryError() || null"
                [value]="summary()"
                (valueChange)="summary.set($event)"
                (inputBlur)="summaryTouched.set(true)"
              />

              <div class="bg-surface rounded-m3-xl p-3.5">
                <m3-switch
                  [(checked)]="important"
                  iconMode="both"
                  label="Marcar como aviso prioritario"
                  description="Destaca la notificación en la cabecera del Tablero Oficial"
                />
              </div>
            </div>

            <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
              <m3-button variant="text" size="md" type="button" (action)="close.emit()">
                Cancelar
              </m3-button>
              <m3-button
                variant="filled"
                size="md"
                type="submit"
                icon="send"
              >
                Enviar Aviso
              </m3-button>
            </footer>
          </form>
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusAnnouncementModalComponent {
  protected readonly tagOptions = [...TAG_OPTIONS];

  readonly open = input<boolean>(false);
  readonly enrolledCount = input<number>(0);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly publish = output<CreateAnnouncementDto>();

  readonly title = signal<string>('');
  readonly tag = signal<string>('General');
  readonly summary = signal<string>('');
  readonly important = signal<boolean>(false);
  readonly titleTouched = signal<boolean>(false);
  readonly summaryTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

  private readonly injector = inject(Injector);
  private readonly titleField = viewChild<M3TextFieldComponent>('titleField');
  private readonly summaryField = viewChild<M3TextFieldComponent>('summaryField');
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private wasOpen = false;

  protected readonly titleError = computed(() => {
    if (!this.titleTouched() && !this.submitAttempted()) return '';
    return this.title().trim().length === 0 ? 'Ingresa un título para el aviso.' : '';
  });

  protected readonly summaryError = computed(() => {
    if (!this.summaryTouched() && !this.submitAttempted()) return '';
    return this.summary().trim().length === 0 ? 'Escribe el mensaje para tus estudiantes.' : '';
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        untracked(() => {
          this.title.set('');
          this.tag.set('General');
          this.summary.set('');
          this.important.set(false);
          this.titleTouched.set(false);
          this.summaryTouched.set(false);
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

  protected onTagSelectionChange(selected: string[]): void {
    const next = selected[0];
    if (next) {
      this.tag.set(next);
    }
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    const cleanedTitle = this.title().trim();
    const cleanedSummary = this.summary().trim();
    if (!cleanedTitle) {
      this.titleField()?.focus();
      return;
    }
    if (!cleanedSummary) {
      this.summaryField()?.focus();
      return;
    }

    this.publish.emit({
      title: cleanedTitle,
      tag: this.tag().trim() || 'General',
      summary: cleanedSummary,
      important: this.important()
    });
  }
}
