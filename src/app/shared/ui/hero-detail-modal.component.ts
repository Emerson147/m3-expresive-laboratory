import { Component, inject, input, output } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { TransitionType } from '../models/ui.models';
import { M3ButtonComponent } from '../components/button/button.component';

@Component({
  selector: 'app-hero-detail-modal',
  standalone: true,
  imports: [M3ButtonComponent],
  host: {
    class: 'contents'
  },
  template: `
    @if (isHeroExpanded()) {
      <div (click)="close.emit()" class="fixed inset-0 z-40"></div>

      <div 
        [style.view-transition-name]="activeTransition() === 'hero' ? 'hero-transform' : null"
        [class.m3-container-enter]="!themeService.hasViewTransitions()"
        class="fixed inset-4 md:inset-12 hero-mesh-m3 border border-outline-sub rounded-m3-xl p-8 flex flex-col justify-between z-50 shadow-2xl overflow-y-auto">

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
          <div>
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">Progreso Total</span>
            <div class="text-5xl md:text-6xl font-extrabold tracking-tight mt-1">
              {{ completionRate() }}% Completado
            </div>
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
    }
  `
})
export class HeroDetailModalComponent {
  readonly themeService = inject(ThemeService);

  readonly isHeroExpanded = input.required<boolean>();
  readonly activeTransition = input<TransitionType>(null);
  readonly completionRate = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly pendingCount = input.required<number>();

  readonly close = output<void>();
}
