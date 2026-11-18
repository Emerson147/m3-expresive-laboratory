import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TaskItem } from '../../../core/tasks/task.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CircularProgressComponent } from '../../../shared/components/progress/circular-progress.component';
import { AgendaFocusService, FOCUS_PRESETS } from '../agenda-focus.service';
import { getTaskCategoryVisual } from './agenda-ui.utils';

@Component({
  selector: 'app-agenda-focus-dock',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CircularProgressComponent
  ],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <section
      aria-labelledby="agenda-focus-dock-heading"
      [class]="dockClasses()"
      [class.invisible]="isHiddenForMorph()"
      [attr.aria-hidden]="isHiddenForMorph() ? 'true' : null"
      [style.view-transition-name]="viewTransitionName()">

      <!-- Capa Aurora GPU (activa en compositor al correr el Pomodoro) -->
      <div
        class="m3-aurora-layer transition-opacity duration-300"
        [class.opacity-95]="isRunning()"
        [class.opacity-25]="focusService.status() === 'paused'"
        [class.opacity-0]="focusService.status() === 'idle' || focusService.status() === 'completed'"
        aria-hidden="true">
        <span class="m3-aurora-orb m3-aurora-orb-1"></span>
        <span class="m3-aurora-orb m3-aurora-orb-2"></span>
        <span class="m3-aurora-orb m3-aurora-orb-3"></span>
      </div>

      <div class="relative z-10 p-5 sm:p-6 space-y-4">
        <!-- Cabecera protagonista con estado vivo + Morph Viajero a Modo Enfoque -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-8 h-8 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-base" aria-hidden="true">timer</span>
            </span>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 id="agenda-focus-dock-heading" class="text-title-sm-emphasized text-main">
                  Sesión de Enfoque
                </h2>
                @if (isRunning()) {
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-on-primary text-label-sm-emphasized uppercase tracking-wider">
                    <span class="w-1.5 h-1.5 rounded-full bg-on-primary agenda-live-dot" aria-hidden="true"></span>
                    <span>En curso</span>
                  </span>
                } @else if (focusService.status() === 'completed') {
                  <span class="px-2 py-0.5 rounded-full bg-success-box text-on-success-box text-label-sm-emphasized">
                    ¡Completado!
                  </span>
                }
              </div>
              <p class="text-label-sm text-muted tabular-nums">
                @if (focusedTask(); as current) {
                  <span>{{ current.focusSessionsCompleted }} bloques hoy · {{ focusService.presetMinutes() }}m</span>
                } @else {
                  <span>Selecciona una tarea para iniciar</span>
                }
              </p>
            </div>
          </div>

          <m3-button
            variant="tonal"
            size="xs"
            icon="open_in_full"
            [disabled]="!focusedTask()"
            ariaLabel="Expandir Pomodoro en Modo Enfoque inmersivo"
            (action)="expandTheater.emit()">
            Expandir
          </m3-button>
        </div>

        @if (focusedTask(); as target) {
          @let catVisual = categoryVisual(target.category);

          <!-- Tarjeta de tarea anclada al Pomodoro + detección de otra tarea seleccionada -->
          <div class="rounded-m3-lg bg-surface-box/85 px-3.5 py-2.5 flex items-center justify-between gap-2.5">
            <button
              type="button"
              (click)="selectFocusedTask.emit(target.id)"
              class="flex items-center gap-2 min-w-0 flex-1 text-left focus-ring-m3 rounded-m3-sm py-0.5 cursor-pointer">
              <span class="material-symbols-rounded text-base text-primary shrink-0" aria-hidden="true">
                {{ catVisual.icon }}
              </span>
              <span class="text-body-sm font-semibold text-main truncate">
                {{ target.title }}
              </span>
            </button>

            @if (hasDifferentSelectedTask()) {
              <m3-button
                variant="text"
                size="xs"
                icon="swap_horiz"
                (action)="switchToSelectedTask()">
                Cambiar
              </m3-button>
            } @else {
              <span class="text-label-sm font-mono text-primary shrink-0">
                {{ target.durationMinutes }}m
              </span>
            }
          </div>

          <!-- Reloj Wavy M3 Expressive + Controles -->
          <div class="flex flex-col sm:flex-row items-center gap-5 pt-1">
            <div
              (click)="expandTheater.emit()"
              class="relative grid place-items-center shrink-0 cursor-pointer">
              <m3-circular-progress
                [diameter]="124"
                [wavy]="isRunning()"
                [paused]="!isRunning()"
                [value]="focusProgress()"
                color="primary"
                ariaLabel="Progreso de sesión de enfoque" />

              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-headline-sm-emphasized font-mono tabular-nums text-main tracking-tight">
                  {{ displayedTimerText() }}
                </span>
                <span class="text-label-sm-emphasized uppercase tracking-wider text-muted mt-0.5">
                  {{ timerStatusLabel() }}
                </span>
              </div>
            </div>

            <div class="flex-1 min-w-0 w-full space-y-3">
              <m3-button-group
                variant="connected"
                size="xs"
                ariaLabel="Duración de sesión de enfoque"
                [options]="focusPresetOptions"
                [value]="[focusService.presetMinutes().toString()]"
                (selectionChange)="onPresetSelect($event, target.id)" />

              <div class="flex flex-wrap items-center gap-2">
                @if (isRunning()) {
                  <m3-button variant="tonal" size="sm" icon="pause" (action)="focusService.pause()">
                    Pausar
                  </m3-button>
                } @else {
                  <m3-button variant="tonal" size="sm" icon="play_arrow" (action)="startFocus(target)">
                    {{ isBoundToTarget() && focusService.status() === 'paused' ? 'Reanudar' : 'Iniciar' }}
                  </m3-button>
                }

                <m3-button
                  variant="outlined"
                  size="sm"
                  icon="verified"
                  (action)="completeFocusBlock(target.id)">
                  Registrar
                </m3-button>

                <m3-button
                  [iconOnly]="true"
                  variant="text"
                  size="sm"
                  icon="restart_alt"
                  ariaLabel="Reiniciar temporizador"
                  (action)="focusService.reset(target.durationMinutes)" />
              </div>
            </div>
          </div>
        } @else {
          <div class="py-5 px-4 rounded-m3-lg bg-surface text-center space-y-1.5">
            <p class="text-body-sm text-muted">
              Crea o selecciona una actividad en la lista para vincular tu sesión Pomodoro.
            </p>
          </div>
        }
      </div>
    </section>
  `
})
export class AgendaFocusDockComponent {
  readonly focusService = inject(AgendaFocusService);

  readonly focusedTask = input<TaskItem | null>(null);
  readonly selectedTask = input<TaskItem | null>(null);
  readonly viewTransitionName = input<string | null>(null);
  readonly isHiddenForMorph = input<boolean>(false);

  readonly expandTheater = output<void>();
  readonly focusRecorded = output<string>();
  readonly selectFocusedTask = output<number>();

  readonly focusPresetOptions: M3ButtonGroupOption[] = FOCUS_PRESETS.map(p => ({
    id: p.toString(),
    label: `${p}m`
  }));

  readonly isBoundToTarget = computed(() => {
    const target = this.focusedTask();
    return !!target && this.focusService.activeTaskId() === target.id;
  });

  readonly isRunning = computed(
    () => this.isBoundToTarget() && this.focusService.status() === 'running'
  );

  readonly focusProgress = computed(() => {
    const target = this.focusedTask();
    return target ? this.focusService.getTaskProgressPercent(target.id) : 0;
  });

  readonly hasDifferentSelectedTask = computed(() => {
    const focused = this.focusedTask();
    const selected = this.selectedTask();
    return !!focused && !!selected && focused.id !== selected.id;
  });

  readonly dockClasses = computed(() => {
    const base = 'agenda-focus-dock hero-mesh-m3 m3-aurora-glow border';
    const showElevation = this.viewTransitionName() === null;
    if (this.isRunning()) {
      return `${base} border-primary/40${showElevation ? ' shadow-m3-level2' : ''}`;
    }
    if (this.focusService.status() === 'completed') {
      return `${base} !bg-success-box/20 border-success/40`;
    }
    return `${base} !bg-surface-low border-outline-sub/60`;
  });

  displayedTimerText(): string {
    const target = this.focusedTask();
    return target
      ? this.focusService.getTaskFormattedTime(target.id, target.durationMinutes)
      : '25:00';
  }

  timerStatusLabel(): string {
    const target = this.focusedTask();
    return target ? this.focusService.getTaskStatusLabel(target.id) : 'Listo';
  }

  categoryVisual(category: string) {
    return getTaskCategoryVisual(category);
  }

  startFocus(task: TaskItem): void {
    this.focusService.startTaskSession(task.id, task.durationMinutes, task.title);
  }

  switchToSelectedTask(): void {
    const selected = this.selectedTask();
    if (!selected) return;
    this.focusService.setDurationPreset(selected.durationMinutes, selected.id);
  }

  completeFocusBlock(taskId: number): void {
    this.focusService.recordTaskSession(taskId);
    this.focusRecorded.emit('Bloque de enfoque registrado');
  }

  onPresetSelect(selected: string[], taskId: number): void {
    const mins = Number(selected[0]);
    if (!Number.isNaN(mins)) {
      this.focusService.setDurationPreset(mins, taskId);
    }
  }
}
