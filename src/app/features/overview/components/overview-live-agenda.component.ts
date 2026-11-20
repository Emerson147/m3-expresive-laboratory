import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskItem } from '../../../core/tasks/task.service';
import { FocusTimerStatus } from '../../agenda/agenda-focus.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../shared/components/card/card.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { priorityBadgeClass } from '../overview.models';

@Component({
  selector: 'app-overview-live-agenda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, M3ButtonComponent, M3CardComponent, M3CheckboxComponent],
  host: {
    class: 'block min-w-0 lg:col-span-5'
  },
  template: `
    <m3-card
      variant="filled"
      [interactive]="false"
      shape="xl"
      padding="lg"
      customClass="!bg-surface-low m3-anim-item-in h-full flex flex-col justify-between gap-4 border border-transparent forced-colors:border-[CanvasText]"
      style="animation-delay: 40ms;">

      <div class="space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-0.5 min-w-0">
            <div class="flex items-center gap-2 text-label-md-emphasized text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">event_upcoming</span>
              <span>Foco del Día</span>
            </div>
            <h3 class="text-title-lg font-bold text-main">Agenda en vivo</h3>
          </div>

          <a
            routerLink="/agenda"
            class="btn-m3 overview-link-pill focus-ring-m3 touch-target-48 h-8 px-3.5 bg-sec-box text-on-sec-box text-label-md-emphasized inline-flex items-center gap-1.5 no-underline shrink-0 cursor-pointer">
            <span>Ver Agenda</span>
            <span class="material-symbols-rounded overview-link-arrow text-base" aria-hidden="true">arrow_forward</span>
          </a>
        </div>

        @if (focusStatus() === 'running' || focusStatus() === 'paused') {
          <div
            role="region"
            aria-label="Sesión de enfoque en curso"
            class="rounded-m3-lg bg-primary-box/85 text-on-primary-box px-4 py-2.5 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">
                {{ focusStatus() === 'running' ? 'timer' : 'pause_circle' }}
              </span>
              <div class="min-w-0">
                <div class="text-label-sm uppercase tracking-wider opacity-85">
                  Pomodoro · {{ focusLabel() }}
                </div>
                <div class="text-body-sm font-semibold truncate">
                  {{ focusTaskTitle() || 'Bloque de enfoque activo' }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-title-sm font-extrabold tabular-nums">
                {{ focusTime() }}
              </span>
              <m3-button
                [iconOnly]="true"
                variant="text"
                size="xs"
                customClass="!bg-surface !text-primary"
                [icon]="focusStatus() === 'running' ? 'pause' : 'play_arrow'"
                [ariaLabel]="focusStatus() === 'running' ? 'Pausar sesión de enfoque' : 'Reanudar sesión de enfoque'"
                (action)="toggleFocusTimer.emit()" />
            </div>
          </div>
        }

        <ul role="list" class="list-none m-0 p-0 space-y-2.5">
          @for (task of tasks(); track task.id) {
            <li
              [class]="task.completed
                ? 'bg-surface/60 hover:bg-surface text-muted'
                : 'bg-surface-box hover:bg-surface-high text-main shadow-2xs'"
              class="overview-agenda-row px-4 py-2.5 flex items-center justify-between gap-3 border border-transparent forced-colors:border-[CanvasText]">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <m3-checkbox
                  [customId]="'overview-live-task-' + task.id"
                  [checked]="task.completed"
                  [ariaLabel]="'Marcar tarea ' + task.title"
                  (changed)="toggleTask.emit(task.id)" />

                <label
                  [attr.for]="'overview-live-task-' + task.id"
                  class="min-w-0 flex-1 cursor-pointer select-none">
                  <span
                    [class.line-through]="task.completed"
                    [class.opacity-65]="task.completed"
                    class="block text-body-md font-medium truncate">
                    {{ task.title }}
                  </span>
                  <span class="block text-label-sm text-muted truncate">
                    {{ task.category }} · {{ task.dateLabel }}
                  </span>
                </label>
              </div>

              @if (task.completed) {
                <span
                  [class]="priorityBadgeClass(task.priority, true)"
                  class="m3-anim-spring-pop px-2.5 py-0.5 rounded-m3-full text-label-sm font-semibold inline-flex items-center gap-1 shrink-0">
                  <span class="material-symbols-rounded text-xs" aria-hidden="true">done</span>
                  <span>Lista</span>
                </span>
              } @else {
                <span
                  [class]="priorityBadgeClass(task.priority, false)"
                  class="m3-anim-spring-pop px-2.5 py-0.5 rounded-m3-full text-label-sm font-semibold inline-flex items-center gap-1 shrink-0">
                  <span class="material-symbols-rounded text-xs" aria-hidden="true">
                    {{ task.priority === 'Alta' ? 'priority_high' : 'flag' }}
                  </span>
                  <span>{{ task.priority }}</span>
                </span>
              }
            </li>
          } @empty {
            <li class="rounded-m3-lg bg-surface/60 px-4 py-6 text-center text-body-sm text-muted">
              No hay tareas registradas todavía.
            </li>
          }
        </ul>
      </div>

      <div class="pt-1 flex items-center justify-between gap-2 text-label-md text-muted">
        <span>Marca una actividad para actualizar el avance del Hero.</span>
        <span class="text-label-md-emphasized text-main tabular-nums shrink-0">
          {{ pendingCount() }} pend.
        </span>
      </div>
    </m3-card>
  `
})
export class OverviewLiveAgendaComponent {
  readonly tasks = input.required<readonly TaskItem[]>();
  readonly pendingCount = input.required<number>();
  readonly focusStatus = input<FocusTimerStatus>('idle');
  readonly focusTime = input<string>('25:00');
  readonly focusLabel = input<string>('Listo');
  readonly focusTaskTitle = input<string | null>(null);

  readonly toggleTask = output<number>();
  readonly toggleFocusTimer = output<void>();

  readonly priorityBadgeClass = priorityBadgeClass;
}
