import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { SubmitGradeDto, TeacherGradingItem } from '../../../core/campus/campus.models';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const SCORE_PRESETS = ['20 / 20', '19 / 20', '18 / 20', '16 / 20', '14 / 20'] as const;

@Component({
  selector: 'app-campus-grading-modal',
  imports: [M3ButtonComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  template: `
    @if (item(); as current) {
      <div
        (click)="close.emit()"
        [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
        class="fixed inset-0 z-40 bg-scrim cursor-pointer"
        aria-hidden="true"
      ></div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campus-grading-heading"
        [style.view-transition-name]="isTransitioning() ? 'dialog-transform' : null"
        [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
        [class.shadow-m3-level3]="!isTransitioning()"
        class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-lg h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box"
      >
        <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
          <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-sec-box text-on-sec-box text-label-sm-emphasized">
                  {{ current.subject }}
                </span>
                <span class="text-label-sm text-muted">
                  {{ current.submittedAt }}
                </span>
              </div>
              <h2
                id="campus-grading-heading"
                #modalHeading
                tabindex="-1"
                class="outline-none text-title-lg-emphasized text-main tracking-tight leading-snug"
              >
                Evaluar a {{ current.studentName }}
              </h2>
              <p class="text-label-md text-muted mt-0.5 truncate">
                {{ current.assignmentTitle }}
              </p>
            </div>

            <m3-button
              variant="text"
              size="sm"
              icon="close"
              [iconOnly]="true"
              ariaLabel="Cerrar formulario de calificación"
              (action)="close.emit()"
            />
          </header>
        </div>

        <form (submit)="handleSubmit($event)" class="contents">
          <div class="px-5 sm:px-6 py-3 space-y-4 overflow-y-auto m3-scrollbar">
            <div class="space-y-2">
              <p class="text-label-md-emphasized text-muted">
                Selección rápida de nota
              </p>
              <div class="flex flex-wrap gap-1.5" role="group" aria-label="Notas sugeridas">
                @for (preset of scorePresets; track preset) {
                  <button
                    type="button"
                    (click)="selectPreset(preset)"
                    [attr.aria-pressed]="score().trim() === preset"
                    class="campus-att-btn px-3 py-1.5 text-label-md-emphasized font-mono cursor-pointer"
                    [class.bg-primary-box]="score().trim() === preset"
                    [class.text-on-primary-box]="score().trim() === preset"
                    [class.bg-surface]="score().trim() !== preset"
                    [class.text-muted]="score().trim() !== preset"
                  >
                    {{ preset }}
                  </button>
                }
              </div>
            </div>

            <m3-text-field
              variant="filled"
              label="Calificación final"
              placeholder="Ej. 18 / 20"
              icon="grade"
              [required]="true"
              [showValidState]="scoreTouched()"
              [errorText]="scoreError()"
              [value]="score()"
              (valueChange)="score.set($event)"
              (inputBlur)="scoreTouched.set(true)"
            />

            <m3-text-field
              variant="filled"
              label="Retroalimentación para el estudiante"
              placeholder="Comentarios breves de la rúbrica..."
              icon="rate_review"
              [multiline]="true"
              [autoGrow]="true"
              [rows]="3"
              [clearable]="true"
              [value]="feedback()"
              (valueChange)="feedback.set($event)"
            />
          </div>

          <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
            <m3-button variant="text" size="md" type="button" (action)="close.emit()">
              Cancelar
            </m3-button>
            <m3-button
              variant="filled"
              size="md"
              type="submit"
              icon="task_alt"
            >
              Registrar Nota
            </m3-button>
          </footer>
        </form>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusGradingModalComponent {
  protected readonly stageOverlay = inject(StageOverlayService);
  protected readonly scorePresets = SCORE_PRESETS;

  readonly item = input<TeacherGradingItem | null>(null);
  readonly isTransitioning = input<boolean>(false);

  readonly close = output<void>();
  readonly submitGrade = output<SubmitGradeDto>();

  readonly score = signal<string>('18 / 20');
  readonly feedback = signal<string>('Excelente planteamiento y análisis riguroso del experimento.');
  readonly scoreTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  protected readonly scoreError = computed(() => {
    if (!this.scoreTouched() && !this.submitAttempted()) return '';
    return this.score().trim().length === 0 ? 'Ingresa una calificación válida.' : '';
  });

  constructor() {
    effect(() => {
      const current = this.item();
      if (!current) return;
      this.score.set(current.score ?? '18 / 20');
      this.feedback.set(
        current.feedback ?? 'Excelente planteamiento y análisis riguroso del experimento.'
      );
      this.scoreTouched.set(false);
      this.submitAttempted.set(false);
    });

    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });
  }

  protected selectPreset(preset: string): void {
    this.score.set(preset);
    this.scoreTouched.set(true);
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    const current = this.item();
    const cleanedScore = this.score().trim();
    if (!current || !cleanedScore) return;

    this.submitGrade.emit({
      gradingId: current.id,
      score: cleanedScore,
      feedback: this.feedback().trim() || 'Evaluado según rúbrica oficial.'
    });
  }
}
