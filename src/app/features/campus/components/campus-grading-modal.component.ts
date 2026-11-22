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
import {
  SubmitGradeDto,
  TeacherGradingItem,
  parseCampusScoreOutOf20
} from '../../../core/campus/campus.models';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const SCORE_PRESETS = ['20 / 20', '19 / 20', '18 / 20', '16 / 20', '14 / 20'] as const;

const SCORE_PRESET_OPTIONS: readonly M3ButtonGroupOption[] = SCORE_PRESETS.map((preset) => ({
  id: preset,
  label: preset
}));

@Component({
  selector: 'app-campus-grading-modal',
  imports: [M3DialogComponent, M3ButtonComponent, M3ButtonGroupComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open() && !!item()"
      [managedClose]="true"
      [showCloseButton]="false"
      [headline]="dialogHeadline()"
      [viewTransitionName]="viewTransitionName()"
      customClass="campus-modal-dialog"
      (closeRequested)="close.emit()"
    >
      @if (open() && item(); as current) {
        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
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
                <h3
                  id="campus-grading-heading"
                  class="text-title-lg-emphasized text-main tracking-tight leading-snug"
                >
                  Evaluar a {{ current.studentName }}
                </h3>
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

          <form
            (submit)="handleSubmit($event)"
            novalidate
            class="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <div #modalScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-4">
              <div class="bg-surface-low rounded-m3-xl p-3.5 space-y-2.5">
                <p class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                  Selección rápida de nota (escala vigesimal)
                </p>
                <m3-button-group
                  class="campus-connected-group-host"
                  variant="connected"
                  selectionMode="single"
                  size="sm"
                  ariaLabel="Notas sugeridas"
                  customClass="campus-connected-group"
                  [options]="presetOptions"
                  [value]="selectedPresetGroup()"
                  (selectionChange)="onPresetChange($event)"
                />
              </div>

              <m3-text-field
                #scoreField
                [id]="'campus-grading-score'"
                name="score"
                variant="filled"
                label="Calificación final"
                placeholder="Ej. 18 / 20 o 17.5"
                icon="grade"
                enterkeyhint="next"
                [required]="true"
                [showValidState]="scoreTouched() || submitAttempted()"
                [isError]="scoreError() !== ''"
                [errorText]="scoreError() || null"
                supportingText="Rango válido: 0 a 20"
                [value]="score()"
                (valueChange)="score.set($event)"
                (inputBlur)="scoreTouched.set(true)"
              />

              <m3-text-field
                [id]="'campus-grading-feedback'"
                name="feedback"
                variant="filled"
                label="Retroalimentación para el estudiante"
                placeholder="Comentarios breves de la rúbrica..."
                icon="rate_review"
                enterkeyhint="done"
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
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusGradingModalComponent {
  protected readonly presetOptions = [...SCORE_PRESET_OPTIONS];

  readonly open = input<boolean>(false);
  readonly item = input<TeacherGradingItem | null>(null);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly submitGrade = output<SubmitGradeDto>();

  readonly score = signal<string>('18 / 20');
  readonly feedback = signal<string>('Excelente planteamiento y análisis riguroso del experimento.');
  readonly scoreTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

  private readonly injector = inject(Injector);
  private readonly scoreField = viewChild<M3TextFieldComponent>('scoreField');
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private wasOpen = false;

  protected readonly dialogHeadline = computed(() => {
    const current = this.item();
    return current ? `Evaluar a ${current.studentName}` : 'Registrar Calificación';
  });

  protected readonly selectedPresetGroup = computed<string[]>(() => {
    const currentScore = this.score().trim();
    return SCORE_PRESETS.includes(currentScore as (typeof SCORE_PRESETS)[number])
      ? [currentScore]
      : [];
  });

  protected readonly scoreError = computed(() => {
    if (!this.scoreTouched() && !this.submitAttempted()) return '';
    const trimmed = this.score().trim();
    if (!trimmed) return 'Ingresa una calificación válida.';
    if (parseCampusScoreOutOf20(trimmed) === null) {
      return 'Usa un valor numérico entre 0 y 20 (ej. 18 o 18 / 20).';
    }
    return '';
  });

  constructor() {
    effect(() => {
      const current = this.item();
      const isOpen = this.open() && Boolean(current);
      if (isOpen && !this.wasOpen && current) {
        untracked(() => {
          this.score.set(current.score ?? '18 / 20');
          this.feedback.set(
            current.feedback ?? 'Excelente planteamiento y análisis riguroso del experimento.'
          );
          this.scoreTouched.set(false);
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

  protected onPresetChange(selected: string[]): void {
    const next = selected[0];
    if (next) {
      this.score.set(next);
      this.scoreTouched.set(true);
    }
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    const current = this.item();
    const cleanedScore = this.score().trim();
    const numeric = parseCampusScoreOutOf20(cleanedScore);
    if (!current || numeric === null) {
      this.scoreField()?.focus();
      return;
    }

    const formattedScore = cleanedScore.includes('/') ? cleanedScore : `${numeric} / 20`;
    this.submitGrade.emit({
      gradingId: current.id,
      score: formattedScore,
      feedback: this.feedback().trim() || 'Evaluado según rúbrica oficial.'
    });
  }
}
