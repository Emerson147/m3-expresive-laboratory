import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { TaskItem } from '../../../core/tasks/task.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3CircularProgressComponent } from '../../../shared/components/progress/circular-progress.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress/linear-progress.component';
import { AgendaFocusService, FOCUS_PRESETS } from '../agenda-focus.service';
import { formatFocusBlocks, getSubtaskCompletionSummary, getTaskCategoryVisual } from './agenda-ui.utils';

@Component({
  selector: 'app-agenda-focus-theater-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3CardComponent,
    M3CheckboxComponent,
    M3DialogComponent,
    M3CircularProgressComponent,
    M3LinearProgressComponent
  ],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="expressive"
      size="fullscreen"
      tone="primary"
      icon="self_improvement"
      headline="Modo Enfoque Inmersivo"
      [subtitle]="task() ? 'Bloque activo · ' + task()!.dateLabel : 'Sesión Pomodoro enfocada'"
      [aurora]="true"
      [open]="open()"
      [managedClose]="true"
      [viewTransitionName]="viewTransitionName()"
      closeLabel="Cerrar vista inmersiva de enfoque"
      (closeRequested)="closeRequested.emit($event)">

      @if (task(); as current) {
        @let catMeta = categoryVisual(current.category);
        <div dialog-header-extra class="flex flex-wrap items-center gap-2">
          @if (isRunning()) {
            <span class="px-3 py-1 rounded-m3-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-on-primary agenda-live-dot" aria-hidden="true"></span>
              <span>En curso</span>
            </span>
          }
          <span class="px-3 py-1 rounded-m3-full bg-surface/85 backdrop-blur-md text-main text-xs font-semibold hidden sm:inline-flex items-center gap-1.5 border border-outline-sub/60">
            <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">{{ catMeta.icon }}</span>
            <span>{{ current.category }}</span>
          </span>
          <span class="px-3 py-1 rounded-m3-full bg-surface/85 backdrop-blur-md text-primary text-xs font-mono font-bold tabular-nums border border-outline-sub/60">
            {{ formatBlocks(current.focusSessionsCompleted, 'hoy') }}
          </span>
        </div>
      }

      <!-- Cuerpo Hero en 2 columnas -->
      @if (task(); as current) {
        @let subSummary = subtaskSummary(current);
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center max-w-6xl w-full mx-auto py-2">
          <!-- Columna Izquierda: Reloj Wavy protagonista flotando sobre Aurora + Presets -->
          <div class="lg:col-span-6 flex flex-col items-center text-center gap-6">
            <div class="relative w-60 h-60 sm:w-[272px] sm:h-[272px] grid place-items-center">
              <div class="sm:scale-[1.13] origin-center grid place-items-center">
                <m3-circular-progress
                  [diameter]="240"
                  [wavy]="isRunning()"
                  [paused]="!isRunning()"
                  [value]="focusProgress()"
                  color="primary"
                  ariaLabel="Progreso inmersivo de Pomodoro" />
              </div>

              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-display-sm sm:text-display-md font-mono font-bold tabular-nums text-main tracking-tight">
                  {{ displayedTimerText() }}
                </span>
                <span class="text-label-md-emphasized uppercase tracking-widest text-primary mt-1">
                  {{ timerStatusLabel() }}
                </span>
              </div>
            </div>

            <div class="overflow-x-auto scrollbar-none max-w-full py-2.5 -my-2.5">
              <m3-button-group
                variant="connected"
                size="sm"
                ariaLabel="Duración en modo inmersivo"
                [options]="focusPresetOptions"
                [value]="[focusService.presetMinutes().toString()]"
                (selectionChange)="onPresetSelect($event, current.id)" />
            </div>
          </div>

          <!-- Columna Derecha: Actividad actual + Checklist interactivo -->
          <div class="lg:col-span-6">
            <m3-card
              variant="filled"
              surface="surface"
              padding="lg"
              shape="xl"
              customClass="backdrop-blur-md space-y-4">
              <div class="space-y-1.5">
                <span class="text-label-sm uppercase tracking-widest text-primary font-semibold block">
                  Actividad en foco · {{ current.dateLabel }}
                </span>
                <h3
                  id="focus-theater-title"
                  class="text-headline-sm md:text-headline-md font-extrabold tracking-tight text-main">
                  {{ current.title }}
                </h3>
                @if (current.notes) {
                  <p class="text-body-sm text-muted leading-relaxed m-0">
                    {{ current.notes }}
                  </p>
                }
              </div>

              @if (current.subtasks.length > 0) {
                <div class="space-y-3 pt-1">
                  <div class="flex items-center justify-between gap-2">
                    <h4 class="text-label-md-emphasized uppercase tracking-wider text-muted m-0">
                      Pasos del bloque ({{ subSummary.done }}/{{ subSummary.total }})
                    </h4>
                    <span class="text-label-md-emphasized tabular-nums text-primary">{{ subSummary.percent }}%</span>
                  </div>

                  <m3-linear-progress
                    [wavy]="false"
                    size="sm"
                    [value]="subSummary.percent"
                    color="secondary"
                    ariaLabel="Avance de pasos durante el enfoque" />

                  <ul
                    role="list"
                    [class]="current.subtasks.length > 4 ? 'max-h-64 overflow-y-auto m3-scrollbar pr-1' : ''"
                    class="list-none m-0 p-0 space-y-2">
                    @for (st of current.subtasks; track st.id) {
                      <li class="flex items-center gap-1.5 bg-surface-low rounded-m3-md px-2.5 py-1">
                        <m3-checkbox
                          [customId]="'theater-subtask-' + st.id"
                          [checked]="st.done"
                          [ariaLabel]="'Paso ' + st.title"
                          (checkedChange)="toggleSubtask.emit({ taskId: current.id, subtaskId: st.id })" />
                        <label
                          [attr.for]="'theater-subtask-' + st.id"
                          [class.line-through]="st.done"
                          [class.opacity-60]="st.done"
                          class="text-body-md text-main truncate flex-1 cursor-pointer select-none">
                          {{ st.title }}
                        </label>
                      </li>
                    }
                  </ul>
                </div>
              }
            </m3-card>
          </div>
        </div>
      }

      <m3-button
        dialog-actions-start
        type="button"
        variant="text"
        icon="restart_alt"
        (action)="resetFocus()">
        Reiniciar
      </m3-button>

      <m3-button-group
        dialog-actions
        variant="standard"
        ariaLabel="Controles de sesión de enfoque">
        <m3-button
          type="button"
          variant="text"
          icon="close_fullscreen"
          (action)="closeRequested.emit('minimize')">
          Minimizar
        </m3-button>

        @if (task(); as current) {
          <m3-button
            type="button"
            variant="tonal"
            icon="verified"
            (action)="completeFocusBlock(current.id)">
            Registrar
          </m3-button>

          @if (isRunning()) {
            <m3-button
              type="button"
              variant="filled"
              icon="pause"
              (action)="focusService.pause()">
              Pausar
            </m3-button>
          } @else {
            <m3-button
              type="button"
              variant="filled"
              icon="play_arrow"
              (action)="startFocus(current)">
              {{ isBoundToTarget() && focusService.status() === 'paused' ? 'Reanudar' : 'Iniciar' }}
            </m3-button>
          }
        }
      </m3-button-group>
    </m3-dialog>
  `
})
export class AgendaFocusTheaterDialogComponent {
  readonly focusService = inject(AgendaFocusService);

  readonly open = input<boolean>(false);
  readonly task = input<TaskItem | null>(null);
  readonly viewTransitionName = input<string | null>(null);

  readonly closeRequested = output<string>();
  readonly toggleSubtask = output<{ taskId: number; subtaskId: string }>();
  readonly focusRecorded = output<string>();

  readonly focusPresetOptions: M3ButtonGroupOption[] = FOCUS_PRESETS.map(p => ({
    id: p.toString(),
    label: `${p}m`
  }));

  readonly isBoundToTarget = computed(() => {
    const current = this.task();
    return !!current && this.focusService.activeTaskId() === current.id;
  });

  readonly isRunning = computed(
    () => this.isBoundToTarget() && this.focusService.status() === 'running'
  );

  readonly focusProgress = computed(() => {
    const current = this.task();
    return current ? this.focusService.getTaskProgressPercent(current.id) : 0;
  });

  displayedTimerText(): string {
    const current = this.task();
    return current
      ? this.focusService.getTaskFormattedTime(current.id, current.durationMinutes)
      : '25:00';
  }

  timerStatusLabel(): string {
    const current = this.task();
    return current ? this.focusService.getTaskStatusLabel(current.id) : 'Listo';
  }

  categoryVisual(category: string) {
    return getTaskCategoryVisual(category);
  }

  subtaskSummary(task: TaskItem) {
    return getSubtaskCompletionSummary(task);
  }

  formatBlocks(count: number, suffix = ''): string {
    return formatFocusBlocks(count, suffix);
  }

  onPresetSelect(selected: string[], taskId: number): void {
    const mins = Number(selected[0]);
    if (!Number.isNaN(mins)) {
      this.focusService.setDurationPreset(mins, taskId);
    }
  }

  startFocus(task: TaskItem): void {
    this.focusService.startTaskSession(task.id, task.durationMinutes, task.title);
  }

  resetFocus(): void {
    this.focusService.reset(this.task()?.durationMinutes);
  }

  completeFocusBlock(taskId: number): void {
    this.focusService.recordTaskSession(taskId);
    this.focusRecorded.emit('Bloque de enfoque registrado');
  }
}
