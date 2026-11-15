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
import { CreateAnnouncementDto } from '../../../core/campus/campus.models';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const TAG_PRESETS = ['General', 'Evaluación', 'Laboratorio', 'Tutoría'] as const;

@Component({
  selector: 'app-campus-announcement-modal',
  imports: [M3ButtonComponent, M3SwitchComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  template: `
    <div
      (click)="close.emit()"
      [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
      class="fixed inset-0 z-40 bg-scrim cursor-pointer"
      aria-hidden="true"
    ></div>

    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="campus-announcement-heading"
      [style.view-transition-name]="isTransitioning() ? 'dialog-transform' : null"
      [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
      [class.shadow-m3-level3]="!isTransitioning()"
      class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-lg h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box"
    >
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
              <h2
                id="campus-announcement-heading"
                #modalHeading
                tabindex="-1"
                class="outline-none text-title-lg-emphasized text-main tracking-tight"
              >
                Publicar aviso a clase
              </h2>
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

      <form (submit)="handleSubmit($event)" class="contents">
        <div class="px-5 sm:px-6 py-3 space-y-4 overflow-y-auto m3-scrollbar">
          <div class="space-y-2">
            <p class="text-label-md-emphasized text-muted">
              Categoría del comunicado
            </p>
            <div class="flex flex-wrap gap-1.5" role="group" aria-label="Etiquetas rápidas">
              @for (preset of tagPresets; track preset) {
                <button
                  type="button"
                  (click)="tag.set(preset)"
                  [attr.aria-pressed]="tag().trim() === preset"
                  class="campus-att-btn px-3 py-1.5 text-label-md-emphasized cursor-pointer"
                  [class.bg-primary-box]="tag().trim() === preset"
                  [class.text-on-primary-box]="tag().trim() === preset"
                  [class.bg-surface]="tag().trim() !== preset"
                  [class.text-muted]="tag().trim() !== preset"
                >
                  {{ preset }}
                </button>
              }
            </div>
          </div>

          <m3-text-field
            variant="filled"
            label="Título del aviso"
            placeholder="Ej. Guía adicional para laboratorio"
            icon="title"
            [required]="true"
            [clearable]="true"
            [showValidState]="titleTouched()"
            [errorText]="titleError()"
            [value]="title()"
            (valueChange)="title.set($event)"
            (inputBlur)="titleTouched.set(true)"
          />

          <m3-text-field
            variant="filled"
            label="Mensaje para los estudiantes"
            placeholder="Detalla indicaciones, horarios o recursos necesarios..."
            icon="notes"
            [multiline]="true"
            [autoGrow]="true"
            [rows]="3"
            [required]="true"
            [showValidState]="summaryTouched()"
            [errorText]="summaryError()"
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
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusAnnouncementModalComponent {
  protected readonly stageOverlay = inject(StageOverlayService);
  protected readonly tagPresets = TAG_PRESETS;

  readonly enrolledCount = input<number>(0);
  readonly isTransitioning = input<boolean>(false);

  readonly close = output<void>();
  readonly publish = output<CreateAnnouncementDto>();

  readonly title = signal<string>('');
  readonly tag = signal<string>('General');
  readonly summary = signal<string>('');
  readonly important = signal<boolean>(false);
  readonly titleTouched = signal<boolean>(false);
  readonly summaryTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  protected readonly titleError = computed(() => {
    if (!this.titleTouched() && !this.submitAttempted()) return '';
    return this.title().trim().length === 0 ? 'Ingresa un título para el aviso.' : '';
  });

  protected readonly summaryError = computed(() => {
    if (!this.summaryTouched() && !this.submitAttempted()) return '';
    return this.summary().trim().length === 0 ? 'Escribe el mensaje para tus estudiantes.' : '';
  });

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    const cleanedTitle = this.title().trim();
    const cleanedSummary = this.summary().trim();
    if (!cleanedTitle || !cleanedSummary) return;

    this.publish.emit({
      title: cleanedTitle,
      tag: this.tag().trim() || 'General',
      summary: cleanedSummary,
      important: this.important()
    });
  }
}
