import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { ClassScheduleItem } from '../../../core/campus/campus.models';
import { StageOverlayService } from '../../../core/dialog/stage-overlay.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { SUBJECT_CATEGORY_META } from './campus-ui.tokens';

@Component({
  selector: 'app-campus-classroom-modal',
  imports: [M3ButtonComponent],
  host: { class: 'contents' },
  template: `
    @if (course(); as c) {
      <div
        (click)="close.emit()"
        [class.m3-dialog-backdrop]="!stageOverlay.hasViewTransitions()"
        class="fixed inset-0 z-40 bg-scrim cursor-pointer"
        aria-hidden="true"
      ></div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campus-classroom-heading"
        [style.view-transition-name]="isTransitioning() ? 'dialog-transform' : null"
        [class.m3-dialog-surface]="!stageOverlay.hasViewTransitions()"
        [class.shadow-m3-level3]="!isTransitioning()"
        class="fixed inset-0 m-auto z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] max-w-lg h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col rounded-m3-xl bg-surface-box"
      >
        <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
          <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="w-11 h-11 rounded-m3-lg grid place-items-center shrink-0"
                [class]="categoryMeta().tileTintClass"
                aria-hidden="true"
              >
                <span class="material-symbols-rounded text-[22px]">
                  {{ categoryMeta().icon }}
                </span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    class="px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono"
                    [class]="categoryMeta().badgeClass"
                  >
                    {{ c.code }} · {{ categoryMeta().label }}
                  </span>
                  @if (c.isActiveNow) {
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-label-sm-emphasized"
                    >
                      <span class="campus-live-dot bg-success" aria-hidden="true"></span>
                      En vivo ahora
                    </span>
                  }
                </div>
                <h2
                  id="campus-classroom-heading"
                  #modalHeading
                  tabindex="-1"
                  class="outline-none text-title-lg-emphasized text-main tracking-tight leading-snug"
                >
                  {{ c.subject }}
                </h2>
              </div>
            </div>

            <m3-button
              variant="text"
              size="sm"
              icon="close"
              [iconOnly]="true"
              ariaLabel="Cerrar portal del aula"
              (action)="close.emit()"
            />
          </header>
        </div>

        <div class="px-5 sm:px-6 py-3 space-y-4 overflow-y-auto m3-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div class="bg-surface rounded-m3-lg p-3">
              <p class="text-label-sm uppercase tracking-wider text-muted">
                Docente a cargo
              </p>
              <p class="text-title-sm-emphasized text-main mt-1 truncate">
                {{ c.teacherName }}
              </p>
            </div>
            <div class="bg-surface rounded-m3-lg p-3">
              <p class="text-label-sm uppercase tracking-wider text-muted">
                Ambiente & Horario
              </p>
              <p class="text-title-sm-emphasized text-main mt-1 truncate">
                {{ c.room }} · {{ c.timeRange }}
              </p>
            </div>
          </div>

          <div class="bg-surface rounded-m3-lg p-3.5 space-y-1.5">
            <p class="text-label-sm uppercase tracking-wider text-muted">
              Tema de sesión
            </p>
            <p class="text-body-sm text-main leading-relaxed">
              {{ c.syllabusTopic }}
            </p>
          </div>

          <div class="bg-surface-low rounded-m3-lg p-3.5 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-label-sm uppercase tracking-wider text-muted">
                Enlace de transmisión institucional
              </p>
              <p class="text-label-sm font-mono text-primary truncate mt-0.5">
                {{ c.classroomLink }}
              </p>
            </div>
            <m3-button
              variant="tonal"
              size="sm"
              icon="content_copy"
              ariaLabel="Copiar enlace del aula"
              (action)="copyLink.emit(c)"
            >
              Copiar
            </m3-button>
          </div>
        </div>

        <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
          <m3-button variant="text" size="md" (action)="close.emit()">
            Cerrar
          </m3-button>
          <m3-button
            variant="filled"
            size="md"
            icon="videocam"
            (action)="enterRoom.emit(c)"
          >
            {{ c.isActiveNow ? 'Conectar a Sala en Vivo' : 'Abrir Portal del Curso' }}
          </m3-button>
        </footer>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusClassroomModalComponent {
  protected readonly stageOverlay = inject(StageOverlayService);

  readonly course = input<ClassScheduleItem | null>(null);
  readonly isTransitioning = input<boolean>(false);

  readonly close = output<void>();
  readonly copyLink = output<ClassScheduleItem>();
  readonly enterRoom = output<ClassScheduleItem>();

  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  protected readonly categoryMeta = computed(() => {
    const current = this.course();
    return SUBJECT_CATEGORY_META[current?.category ?? 'stem'];
  });

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus();
    });
  }
}
