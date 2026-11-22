import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild
} from '@angular/core';
import { CourseGradeSummary } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3SliderComponent } from '../../../shared/components/slider/slider.component';

export interface GpaProjectionResult {
  projectedGpa: number;
  delta: number;
  keepsHonors: boolean;
}

@Component({
  selector: 'app-campus-simulator-dialog',
  imports: [M3DialogComponent, M3ButtonComponent, M3SliderComponent],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Simulador de Promedio Ponderado"
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
                  class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[22px]">calculate</span>
                </div>
                <div class="min-w-0">
                  <h3 id="campus-simulator-heading" class="text-title-lg-emphasized text-main tracking-tight">
                    Simulador Ponderado
                  </h3>
                  <p class="text-label-md text-muted truncate mt-0.5">
                    Desglose por curso y proyección de cierre de ciclo
                  </p>
                </div>
              </div>

              <m3-button
                variant="text"
                size="sm"
                icon="close"
                [iconOnly]="true"
                ariaLabel="Cerrar simulador de promedio"
                (action)="close.emit()"
              />
            </header>
          </div>

          <div #modalScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-4">
            <div class="bg-surface rounded-m3-xl p-4 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span class="text-label-sm uppercase tracking-wider text-muted block">
                    Promedio Proyectado
                  </span>
                  <div class="flex items-baseline gap-2 mt-0.5">
                    <span class="text-headline-md-emphasized font-mono tabular-nums text-main">
                      {{ projection().projectedGpa.toFixed(1) }}
                    </span>
                    <span class="text-label-md font-mono text-muted">/ 20</span>
                    <span
                      [class]="'text-label-sm-emphasized font-mono px-2 py-0.5 rounded-m3-full ' + (projection().delta >= 0 ? 'bg-success-box text-on-success-box' : 'bg-warning-box text-on-warning-box')"
                    >
                      {{ projection().delta >= 0 ? '+' + projection().delta.toFixed(1) : projection().delta.toFixed(1) }}
                    </span>
                  </div>
                </div>

                <span
                  [class]="'px-3 py-1 rounded-m3-full text-label-sm-emphasized ' + (projection().keepsHonors ? 'bg-primary-box text-on-primary-box' : 'bg-warning-box text-on-warning-box')"
                >
                  {{ projection().keepsHonors ? 'Mantiene Cuadro de Honor' : 'Bajo meta 18.0' }}
                </span>
              </div>

              <m3-slider
                [customId]="'campus-gpa-slider'"
                label="Nota estimada en evaluaciones finales"
                [min]="10"
                [max]="20"
                [step]="0.5"
                size="md"
                unit=" / 20"
                [(value)]="projectedFinalScore"
              />
            </div>

            <div class="flex flex-col gap-2.5">
              <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                Desglose Ponderado por Cátedra
              </span>

              <ul role="list" class="list-none p-2 rounded-m3-xl bg-surface-low flex flex-col gap-2">
                @for (course of courses(); track course.id) {
                  <li class="p-3 rounded-m3-md bg-surface flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-label-sm font-mono font-bold text-primary">{{ course.code }}</span>
                        <span class="text-label-sm text-muted">{{ course.credits }} cr.</span>
                      </div>
                      <p class="text-body-sm font-medium text-main truncate">{{ course.subject }}</p>
                    </div>
                    <div class="text-right font-mono tabular-nums shrink-0">
                      <span class="text-title-sm-emphasized text-main">{{ course.currentAvg.toFixed(1) }}</span>
                      <span class="block text-label-sm text-muted">Falta {{ course.remainingWeightPercent }}%</span>
                    </div>
                  </li>
                }
              </ul>
            </div>
          </div>

          <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end shrink-0">
            <m3-button variant="tonal" size="md" (action)="close.emit()">
              Listo
            </m3-button>
          </footer>
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusSimulatorDialogComponent {
  readonly open = input<boolean>(false);
  readonly courses = input.required<CourseGradeSummary[]>();
  readonly projection = input.required<GpaProjectionResult>();
  readonly projectedFinalScore = model<number>(17);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();

  private readonly injector = inject(Injector);
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private wasOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        untracked(() => {
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
}
