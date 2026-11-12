import { Component, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { TransitionType } from '../models/ui.models';
import { M3ButtonComponent } from '../components/button/button.component';
import { M3LinearProgressComponent } from '../components/progress';

@Component({
  selector: 'app-hero-detail-modal',
  standalone: true,
  imports: [M3ButtonComponent, M3LinearProgressComponent],
  host: {
    class: 'contents',
    '(document:keydown.escape)': 'onEscapeKey()'
  },
  template: `
    @if (isHeroExpanded()) {
      <div
        (click)="close.emit()"
        [class.m3-dialog-backdrop]="!themeService.hasViewTransitions()"
        class="fixed inset-0 z-40"></div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-modal-title"
        [style.view-transition-name]="activeTransition() === 'hero' ? 'hero-transform' : null"
        [class.m3-container-enter]="!themeService.hasViewTransitions()"
        class="fixed inset-4 md:inset-12 hero-mesh-m3 m3-aurora-glow border border-outline-sub rounded-m3-xl z-50 shadow-2xl overflow-hidden">

        <div class="m3-aurora-layer" aria-hidden="true">
          <span class="m3-aurora-orb m3-aurora-orb-1"></span>
          <span class="m3-aurora-orb m3-aurora-orb-2"></span>
          <span class="m3-aurora-orb m3-aurora-orb-3"></span>
        </div>

        <div class="relative z-10 h-full overflow-y-auto p-8 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <m3-button
              [iconOnly]="true"
              variant="tonal"
              icon="close"
              ariaLabel="Cerrar modal"
              (action)="close.emit()" />
            <span class="px-4 py-1.5 rounded-full bg-primary-box text-on-primary-box text-xs font-bold">
              Métricas del Sistema
            </span>
          </div>

          <div class="my-auto py-6 max-w-2xl space-y-6">
            <div class="space-y-3">
              <span class="text-xs font-semibold uppercase tracking-widest text-muted">Progreso Total</span>
              <h2
                #modalHeading
                id="hero-modal-title"
                tabindex="-1"
                class="text-5xl md:text-6xl font-extrabold tracking-tight mt-1 outline-none">
                {{ completionRate() }}% Completado
              </h2>
              <m3-linear-progress
                [value]="completionRate()"
                color="primary"
                size="lg"
                [wavy]="true"
                ariaLabel="Progreso total de tareas" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-surface/75 backdrop-blur-md p-5 rounded-m3-lg border border-outline-sub">
                <span class="text-xs text-muted">Actividades Finalizadas</span>
                <div class="text-2xl font-bold text-primary mt-1">{{ completedCount() }} completadas</div>
              </div>
              <div class="bg-surface/75 backdrop-blur-md p-5 rounded-m3-lg border border-outline-sub">
                <span class="text-xs text-muted">Actividades en Cola</span>
                <div class="text-2xl font-bold text-main mt-1">{{ pendingCount() }} pendientes</div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <m3-button
              variant="filled"
              (action)="close.emit()">
              Cerrar vista detallada
            </m3-button>
          </div>
        </div>
      </div>
    }
  `
})
export class HeroDetailModalComponent {
  readonly themeService = inject(ThemeService);
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly isHeroExpanded = input.required<boolean>();
  readonly activeTransition = input<TransitionType>(null);
  readonly completionRate = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly pendingCount = input.required<number>();

  readonly close = output<void>();

  constructor() {
    effect(() => {
      if (this.isHeroExpanded()) {
        queueMicrotask(() => this.modalHeading()?.nativeElement.focus());
      }
    });
  }

  onEscapeKey(): void {
    if (this.isHeroExpanded()) {
      this.close.emit();
    }
  }
}
