import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../core/dialog/dialog.service';
import { TaskService } from '../../core/tasks/task.service';
import { ContrastLevel, ThemeService } from '../../core/theme/theme.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3CardComponent } from '../../shared/components/card/card.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';
import { M3LinearProgressComponent } from '../../shared/components/progress';

export type AuroraMode = 'ambient' | 'thinking' | 'paused';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [RouterLink, M3ButtonComponent, M3CardComponent, M3ChipComponent, M3LinearProgressComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- 1. HERO CARD EXPANDIBLE (BENTO 7 COLS) CON AURORA GPU ESTILO GEMINI + CONTAINER TRANSFORM -->
      <section
        role="button"
        tabindex="0"
        [attr.aria-hidden]="dialogService.isHeroExpanded()"
        aria-label="Abrir vista detallada de métricas del sistema"
        (click)="dialogService.toggleHeroDetail(true)"
        (keydown.enter)="dialogService.toggleHeroDetail(true)"
        (keydown.space)="$event.preventDefault(); dialogService.toggleHeroDetail(true)"
        [class.invisible]="dialogService.isHeroExpanded()"
        [class.is-aurora-ambient]="auroraMode() === 'ambient'"
        [class.is-aurora-thinking]="auroraMode() === 'thinking'"
        [class.is-aurora-paused]="auroraMode() === 'paused'"
        [style.view-transition-name]="dialogService.activeTransition() === 'hero' && !dialogService.isHeroExpanded() ? 'hero-transform' : null"
        class="card-interactive hero-mesh-m3 m3-aurora-glow focus-ring-m3 lg:col-span-7 border border-outline-sub rounded-m3-xl p-8 flex flex-col justify-between min-h-[340px] shadow-xs cursor-pointer group hover:border-primary/50 m3-transition-standard">

          <div class="m3-aurora-layer" aria-hidden="true">
            <span class="m3-aurora-orb m3-aurora-orb-1"></span>
            <span class="m3-aurora-orb m3-aurora-orb-2"></span>
            <span class="m3-aurora-orb m3-aurora-orb-3"></span>
          </div>

          <div class="space-y-4 max-w-xl">
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
              <span
                [class]="auroraMode() === 'thinking'
                  ? 'bg-tertiary-box text-on-tertiary-box border-tertiary/30'
                  : 'bg-surface/70 text-muted border-outline-sub'"
                class="px-3 py-1.5 backdrop-blur-md border rounded-full text-xs font-medium inline-flex items-center gap-1.5 m3-transition-fast">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">
                  {{ auroraMode() === 'thinking' ? 'auto_awesome' : (auroraMode() === 'paused' ? 'pause_circle' : 'blur_on') }}
                </span>
                <span>{{ auroraBadgeLabel() }}</span>
              </span>
            </div>

            <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight pt-1">
              Diseño accesible y armónico
            </h2>
            <p class="text-muted text-sm md:text-base leading-relaxed">
              @if (auroraMode() === 'thinking') {
                Modo pensando activo: lóbulos OKLCH animados en GPU (<code class="font-mono text-xs text-primary">transform</code> + <code class="font-mono text-xs text-primary">opacity</code>) sin repintar desenfoques.
              } @else {
                Superficies tonales, legibilidad garantizada por color science OKLCH y elevaciones sutiles sin sobrecargar la vista.
              }
            </p>

            <div class="pt-1 space-y-1.5">
              <m3-linear-progress
                [value]="taskService.completionRate()"
                [color]="auroraMode() === 'thinking' ? 'tertiary' : 'primary'"
                [wavy]="auroraMode() === 'thinking'"
                size="sm"
                ariaLabel="Avance general de tareas" />
            </div>
          </div>

          <div
            class="pt-6 flex flex-wrap items-center justify-between gap-3"
            (click)="$event.stopPropagation()"
            (keydown.enter)="$event.stopPropagation()"
            (keydown.space)="$event.stopPropagation()">
            <div class="flex flex-wrap items-center gap-2.5">
              <button
                id="trigger-bento-center"
                type="button"
                (click)="dialogService.openFrom('bento-center')"
                [class.invisible]="dialogService.isDialogOpen() && dialogService.activeTrigger() === 'bento-center'"
                [style.view-transition-name]="dialogService.activeTransition() === 'dialog' && !dialogService.isDialogOpen() && dialogService.activeTrigger() === 'bento-center' ? 'dialog-transform' : null"
                class="btn-m3 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-full text-sm shadow-sm inline-flex items-center gap-2 cursor-pointer">
                <span class="material-symbols-rounded text-base">add</span>
                <span>Crear registro</span>
              </button>

              <div
                class="flex items-center gap-1 bg-surface/75 backdrop-blur-md p-1 rounded-full border border-outline-sub"
                role="group"
                aria-label="Modo de aurora de fondo">
                @for (mode of auroraModes; track mode.id) {
                  <button
                    type="button"
                    (click)="setAuroraMode(mode.id)"
                    [attr.aria-pressed]="auroraMode() === mode.id"
                    [class]="auroraMode() === mode.id
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'text-muted hover:text-main'"
                    class="btn-m3 px-2.5 py-1 rounded-full text-xs inline-flex items-center gap-1 cursor-pointer">
                    <span class="material-symbols-rounded text-sm" aria-hidden="true">{{ mode.icon }}</span>
                    <span>{{ mode.label }}</span>
                  </button>
                }
              </div>
            </div>

            <m3-button
              variant="tonal"
              size="sm"
              icon="open_in_full"
              (action)="dialogService.toggleHeroDetail(true)">
              Ver desglose
            </m3-button>
          </div>
      </section>

      <!-- 2. TARJETA TERCIARIA + CONTROL DE CONTRASTE M3 (BENTO 5 COLS) -->
      <section
        style="animation-delay: 40ms;"
        class="card-m3 m3-anim-item-in lg:col-span-5 bg-tertiary-box border border-outline-sub rounded-m3-xl p-8 flex flex-col justify-between gap-4 text-on-tertiary-box min-h-[340px] shadow-xs">
        <div class="space-y-2">
          <span class="text-xs font-semibold uppercase tracking-widest opacity-80 flex items-center gap-1">
            <span class="material-symbols-rounded text-base">palette</span>
            M3 Expressive Color
          </span>
          <h3 class="text-2xl font-bold">Acento Terciario</h3>
          <p class="text-sm opacity-90 leading-relaxed">
            Contraste orgánico generado matemáticamente con OKLCH a +60° del tono semilla primario.
          </p>
        </div>

        <div class="space-y-3">
          <div class="bg-surface/65 backdrop-blur-md p-3 rounded-m3-lg border border-outline-sub flex items-center justify-between gap-2 text-main">
            <span class="text-xs font-medium text-muted flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">contrast</span>
              Contraste M3
            </span>
            <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub" role="group" aria-label="Nivel de contraste M3">
              @for (lvl of contrastLevels; track lvl.id) {
                <button
                  type="button"
                  (click)="setContrastLevel(lvl.id)"
                  [attr.aria-pressed]="themeService.contrastLevel() === lvl.id"
                  [class]="themeService.contrastLevel() === lvl.id
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'text-muted hover:text-main'"
                  class="btn-m3 px-2.5 py-1 rounded-full text-xs cursor-pointer">
                  {{ lvl.label }}
                </button>
              }
            </div>
          </div>

          <div class="bg-surface/60 backdrop-blur-md p-4 rounded-m3-lg border border-outline-sub flex items-center justify-between gap-3 text-main">
            <div class="space-y-1">
              <div class="text-xs text-muted">Semilla Actual</div>
              <div class="flex items-center gap-2.5">
                <span class="text-lg font-bold font-mono">Hue {{ themeService.currentHue() }}°</span>
                <span class="inline-flex items-center gap-1" aria-hidden="true">
                  <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                </span>
              </div>
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
        </div>
      </section>

      <!-- 3. BENTO METRICS BANNER (RESUMEN RÁPIDO CON TARJETAS M3) -->
      <section class="col-span-1 lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        @for (kpi of kpiCards(); track kpi.label; let idx = $index) {
          <a
            routerLink="/agenda"
            [style.animation-delay]="(idx * 40 + 80) + 'ms'"
            class="block h-full rounded-m3-lg no-underline focus-ring-m3 m3-anim-item-in">
            <m3-card
              variant="elevated"
              padding="md"
              shape="lg"
              customClass="h-full m3-card-interactive state-layer flex flex-col justify-between space-y-2">
              <div class="flex items-center justify-between text-xs text-muted">
                <span class="flex items-center gap-1.5 font-medium">
                  <span class="material-symbols-rounded text-base" [class]="kpi.iconClass">{{ kpi.icon }}</span>
                  {{ kpi.label }}
                </span>
                <span class="material-symbols-rounded text-sm opacity-60" aria-hidden="true">arrow_forward</span>
              </div>
              <div class="text-2xl font-extrabold text-main font-mono">
                {{ kpi.value }}
              </div>
            </m3-card>
          </a>
        }
      </section>

      <!-- 4. LABORATORIO INTERACTIVO DEL OVERVIEW: CHECKLIST EN VIVO + CONTAINER EXPAND INLINE -->
      <section class="col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- CHECKLIST RÁPIDA DE TAREAS VINCULADA A TASKSERVICE -->
        <div
          style="animation-delay: 160ms;"
          class="lg:col-span-7 m3-anim-item-in">
          <m3-card
            variant="filled"
            padding="lg"
            shape="xl"
            customClass="h-full border border-outline-sub flex flex-col justify-between space-y-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">checklist</span>
                  Checklist Reactiva • TaskService
                </div>
                <h3 class="text-lg font-bold text-main">Toca una tarea para probar señales en vivo</h3>
              </div>

              <span class="px-3 py-1 rounded-full bg-surface text-main border border-outline-sub text-xs font-mono font-bold">
                {{ taskService.completedCount() }} / {{ taskService.tasks().length }} listas
              </span>
            </div>

            <div class="flex flex-wrap gap-2.5">
              @for (task of previewTasks(); track task.id) {
                <m3-chip
                  type="filter"
                  [selected]="task.completed"
                  [icon]="task.completed ? null : 'radio_button_unchecked'"
                  (action)="taskService.toggleCompleted(task.id)">
                  {{ task.title }}
                </m3-chip>
              }
            </div>

            <div class="pt-3 border-t border-outline-sub flex flex-wrap items-center justify-between gap-3">
              <p class="text-xs text-muted">
                Cada cambio actualiza al instante la barra del Hero y los KPIs superiores.
              </p>
              <m3-button
                variant="text"
                size="sm"
                icon="arrow_forward"
                [iconTrailing]="true"
                routerLink="/agenda">
                Gestionar todas
              </m3-button>
            </div>
          </m3-card>
        </div>

        <!-- CASO 3 INLINE: CONTAINER TRANSFORM EN DOM PERSISTENTE (500ms ABRIR / 250ms VOLVER) -->
        <div
          style="animation-delay: 200ms;"
          class="lg:col-span-5 m3-anim-item-in">
          <m3-card
            variant="outlined"
            padding="lg"
            shape="xl"
            customClass="h-full bg-surface-box border border-outline-sub flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <button
                type="button"
                (click)="toggleInlineSpecExpanded()"
                [attr.aria-expanded]="isInlineSpecExpanded()"
                aria-controls="overview-inline-spec-panel"
                class="w-full text-left flex items-start justify-between gap-3 rounded-m3-md focus-ring-m3 cursor-pointer">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <span class="material-symbols-rounded text-base" aria-hidden="true">animation</span>
                    Caso 3 Inline • DOM Persistente
                  </div>
                  <h3 class="text-lg font-bold text-main">Expandir sin View Transition</h3>
                  <p class="text-xs text-muted font-mono">
                    {{ isInlineSpecExpanded() ? 'Abierto (long2 • 500ms emphasized)' : 'Cerrado (medium1 • 250ms emphasized)' }}
                  </p>
                </div>

                <span
                  class="w-9 h-9 shrink-0 rounded-full bg-surface-high border border-outline-sub grid place-items-center text-main transition-transform"
                  [class.rotate-180]="isInlineSpecExpanded()"
                  [style.transition-duration]="isInlineSpecExpanded() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                  style="transition-timing-function: var(--md-sys-motion-easing-emphasized);"
                  aria-hidden="true">
                  <span class="material-symbols-rounded text-lg">expand_more</span>
                </span>
              </button>

              <div
                id="overview-inline-spec-panel"
                [attr.inert]="!isInlineSpecExpanded() ? '' : null"
                [class]="isInlineSpecExpanded() ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'"
                [style.transition-duration]="isInlineSpecExpanded() ? 'var(--md-sys-motion-duration-long2)' : 'var(--md-sys-motion-duration-medium1)'"
                style="transition-timing-function: var(--md-sys-motion-easing-emphasized);"
                class="grid transition-[grid-template-rows,opacity,margin]">
                <div class="overflow-hidden">
                  <div class="p-3.5 rounded-m3-lg bg-surface border border-outline-sub space-y-2.5 text-xs">
                    <p class="text-muted leading-relaxed">
                      Como esta card sigue viva en el mismo árbol DOM, usa transición CSS con <code class="font-mono text-primary">grid-rows</code> + <code class="font-mono text-primary">emphasized</code> (500ms abrir / 250ms volver), sin capturar snapshots de pantalla completa.
                    </p>
                    <div class="flex flex-wrap items-center gap-2 pt-1">
                      <m3-button
                        variant="tonal"
                        size="sm"
                        icon="science"
                        routerLink="/design-system/motion">
                        Probar en Motion Lab
                      </m3-button>
                      <m3-button
                        variant="text"
                        size="sm"
                        icon="palette"
                        routerLink="/design-system/styles">
                        Ver Tokens
                      </m3-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-outline-sub flex items-center justify-between text-[11px] font-mono text-muted">
              <span>Arriba: ViewTransition</span>
              <span class="text-primary font-semibold">Aquí: CSS Transitions</span>
            </div>
          </m3-card>
        </div>

      </section>

    </div>
  `
})
export class OverviewComponent {
  readonly taskService = inject(TaskService);
  readonly themeService = inject(ThemeService);
  readonly dialogService = inject(DialogService);

  readonly auroraMode = signal<AuroraMode>('ambient');
  readonly isInlineSpecExpanded = signal<boolean>(false);

  readonly auroraModes: readonly { id: AuroraMode; label: string; icon: string }[] = [
    { id: 'ambient', label: 'Reposo', icon: 'blur_on' },
    { id: 'thinking', label: 'Buscando', icon: 'auto_awesome' },
    { id: 'paused', label: 'Pausa', icon: 'pause_circle' }
  ];

  readonly contrastLevels: readonly { id: ContrastLevel; label: string }[] = [
    { id: 'standard', label: 'Estándar' },
    { id: 'medium', label: 'Medio' },
    { id: 'high', label: 'Alto' }
  ];

  readonly auroraBadgeLabel = computed(() => {
    switch (this.auroraMode()) {
      case 'thinking':
        return 'Gemini buscando...';
      case 'paused':
        return 'Aurora pausada';
      default:
        return 'Aurora GPU';
    }
  });

  readonly previewTasks = computed(() => this.taskService.tasks().slice(0, 4));

  readonly kpiCards = computed(() => [
    {
      label: 'Total de Tareas',
      value: this.taskService.tasks().length,
      icon: 'done_all',
      iconClass: 'text-primary'
    },
    {
      label: 'Pendientes',
      value: this.taskService.pendingCount(),
      icon: 'hourglass_top',
      iconClass: 'text-tertiary'
    },
    {
      label: 'Completadas',
      value: this.taskService.completedCount(),
      icon: 'check_circle',
      iconClass: 'text-secondary'
    }
  ]);

  setAuroraMode(mode: AuroraMode): void {
    this.auroraMode.set(mode);
  }

  setContrastLevel(level: ContrastLevel): void {
    this.themeService.setContrastLevel(level);
  }

  toggleInlineSpecExpanded(): void {
    this.isInlineSpecExpanded.update(expanded => !expanded);
  }
}
