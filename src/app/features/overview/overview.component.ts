import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../core/dialog/dialog.service';
import { TaskService } from '../../core/tasks/task.service';
import { ThemeService } from '../../core/theme/theme.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [RouterLink, M3ButtonComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- 1. HERO CARD EXPANDIBLE (BENTO 7 COLS) CON VIEW TRANSITIONS -->
      @if (!dialogService.isHeroExpanded()) {
        <section 
          (click)="dialogService.toggleHeroDetail(true)"
          [style.view-transition-name]="dialogService.activeTransition() === 'hero' ? 'hero-transform' : null"
          class="card-m3 hero-mesh-m3 lg:col-span-7 border border-outline-sub rounded-m3-xl p-8 flex flex-col justify-between min-h-[320px] shadow-xs cursor-pointer group hover:border-primary/50 transition-colors">
          
          <div class="space-y-4 max-w-lg">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3.5 py-1.5 bg-primary-box text-on-primary-box rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm">verified</span>
                Foundations
              </span>
              <span class="px-3 py-1.5 bg-surface/70 backdrop-blur-md border border-outline-sub rounded-full text-xs font-medium text-muted">
                {{ taskService.pendingCount() }} pendientes
              </span>
              <span class="px-3 py-1.5 bg-surface/70 backdrop-blur-md border border-outline-sub rounded-full text-xs font-semibold text-primary">
                {{ taskService.completionRate() }}% avance
              </span>
            </div>

            <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight pt-1">
              Diseño accesible y armónico
            </h2>
            <p class="text-muted text-sm md:text-base leading-relaxed">
              Superficies tonales, legibilidad garantizada por color science OKLCH y elevaciones sutiles sin sobrecargar la vista.
            </p>
          </div>

          <div class="pt-6 flex flex-wrap items-center justify-between gap-4" (click)="$event.stopPropagation()">
            <button 
              id="trigger-bento-center" 
              (click)="dialogService.openFrom('bento-center')"
              [class.invisible]="dialogService.isDialogOpen() && dialogService.activeTrigger() === 'bento-center'"
              [style.view-transition-name]="!dialogService.isDialogOpen() && dialogService.activeTrigger() === 'bento-center' ? 'dialog-transform' : null"
              class="btn-m3 px-6 py-2.5 bg-primary text-on-primary font-medium rounded-full text-sm shadow-sm inline-flex items-center gap-2 cursor-pointer">
              <span class="material-symbols-rounded text-base">add</span>
              <span>Crear registro</span>
            </button>

            <m3-button 
              variant="tonal" 
              size="sm" 
              icon="open_in_full" 
              (action)="dialogService.toggleHeroDetail(true)">
              Ver desglose
            </m3-button>
          </div>
        </section>
      }

      <!-- 2. TARJETA TERCIARIA (BENTO 5 COLS) -->
      <section class="card-m3 lg:col-span-5 bg-tertiary-box border border-outline-sub rounded-m3-xl p-8 flex flex-col justify-between text-on-tertiary-box min-h-[320px] shadow-xs">
        <div class="space-y-2">
          <span class="text-xs font-semibold uppercase tracking-widest opacity-80 flex items-center gap-1">
            <span class="material-symbols-rounded text-base">palette</span>
            M3 Expressive Color
          </span>
          <h3 class="text-2xl font-bold">Acento Terciario</h3>
          <p class="text-sm opacity-90 leading-relaxed">
            Contraste orgánico generado matemáticamente con OKLCH a +65° del tono semilla primario.
          </p>
        </div>

        <div class="bg-surface/60 backdrop-blur-md p-4 rounded-m3-lg border border-outline-sub flex items-center justify-between text-main">
          <div>
            <div class="text-xs text-muted">Semilla Actual</div>
            <div class="text-lg font-bold font-mono">Hue {{ themeService.currentHue() }}°</div>
          </div>
          
          <m3-button 
            variant="filled" 
            size="sm" 
            icon="arrow_forward" 
            [iconTrailing]="true"
            routerLink="/agenda">
            Ver Agenda
          </m3-button>
        </div>
      </section>

      <!-- 3. BENTO METRICS BANNER (RESUMEN RÁPIDO) -->
      <section class="col-span-1 lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div class="p-5 bg-surface-box border border-outline-sub rounded-m3-lg space-y-1">
          <div class="text-xs text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary">done_all</span>
            Total de Tareas
          </div>
          <div class="text-2xl font-extrabold text-main font-mono">
            {{ taskService.tasks().length }}
          </div>
        </div>

        <div class="p-5 bg-surface-box border border-outline-sub rounded-m3-lg space-y-1">
          <div class="text-xs text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-tertiary">hourglass_top</span>
            Pendientes
          </div>
          <div class="text-2xl font-extrabold text-main font-mono">
            {{ taskService.pendingCount() }}
          </div>
        </div>

        <div class="p-5 bg-surface-box border border-outline-sub rounded-m3-lg space-y-1">
          <div class="text-xs text-muted flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-secondary">check_circle</span>
            Completadas
          </div>
          <div class="text-2xl font-extrabold text-main font-mono">
            {{ taskService.completedCount() }}
          </div>
        </div>
      </section>

    </div>
  `
})
export class OverviewComponent {
  readonly taskService = inject(TaskService);
  readonly themeService = inject(ThemeService);
  readonly dialogService = inject(DialogService);
}
