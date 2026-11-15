import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AssignmentFilter, StudentAssignment } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';

@Component({
  selector: 'app-campus-assignments-card',
  imports: [M3ButtonComponent, M3ChipComponent],
  host: { class: 'block' },
  template: `
    <section
      aria-labelledby="assignments-heading"
      class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-4"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 rounded-m3-lg bg-sec-box text-on-sec-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-lg">assignment</span>
          </div>
          <div class="min-w-0">
            <h2 id="assignments-heading" class="text-title-md-emphasized text-main tracking-tight">
              Entregas & Tareas
            </h2>
            <p class="text-label-sm text-muted truncate">
              Inspecciona criterios de rúbrica o registra entregas en línea
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2" role="group" aria-label="Filtrar entregas">
          <m3-chip
            type="filter"
            [selected]="filter() === 'all'"
            [count]="totalCount()"
            (action)="filterChange.emit('all')"
          >
            Todas
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="filter() === 'pending'"
            [count]="pendingCount()"
            (action)="filterChange.emit('pending')"
          >
            Pendientes
          </m3-chip>
        </div>
      </div>

      <div
        class="space-y-3"
        [class.vt-assignments-active]="isFilterTransitioning()"
      >
        @for (item of assignments(); track item.id) {
          <article
            class="campus-assignment-item campus-surface-tile bg-surface hover:bg-surface-high rounded-m3-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            [style.--assign-vt-name]="'campus-assign-' + item.id"
          >
            <div class="min-w-0 space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized"
                  [class]="badgeClassFor(item)"
                >
                  {{ statusLabelFor(item) }}
                </span>
                <span class="text-label-sm text-muted truncate">
                  {{ item.subject }}
                </span>
              </div>

              <h3 class="text-title-sm-emphasized text-main leading-snug">
                {{ item.title }}
              </h3>

              <div class="flex items-center gap-2.5 flex-wrap text-label-sm text-muted">
                <span>{{ item.dueDate }}</span>
                @if (item.score) {
                  <span class="font-mono font-bold text-success">Nota: {{ item.score }}</span>
                }
                @if (item.submittedAt) {
                  <span>{{ item.submittedAt }}</span>
                }
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <m3-button
                [id]="'campus-assignment-btn-' + item.id"
                variant="text"
                size="sm"
                icon="visibility"
                [invisible]="
                  isDialogOpen() &&
                  activeDialogTrigger() === 'campus-assignment-btn-' + item.id
                "
                [viewTransitionName]="
                  !isDialogOpen() &&
                  activeDialogTrigger() === 'campus-assignment-btn-' + item.id
                    ? 'dialog-transform'
                    : null
                "
                (action)="
                  inspectAssignment.emit({
                    item,
                    triggerId: 'campus-assignment-btn-' + item.id
                  })
                "
              >
                Detalle
              </m3-button>

              @if (item.submissionStatus === 'pending') {
                <m3-button
                  [variant]="item.urgency === 'urgent' ? 'filled' : 'tonal'"
                  size="sm"
                  icon="upload_file"
                  (action)="submitAssignment.emit(item.id)"
                >
                  Entregar
                </m3-button>
              }
            </div>
          </article>
        } @empty {
          <div class="rounded-m3-xl bg-surface p-6 text-center space-y-2">
            <span class="material-symbols-rounded text-3xl text-success" aria-hidden="true">
              verified
            </span>
            <p class="text-title-sm-emphasized text-main">Todo entregado al día</p>
            <p class="text-body-sm text-muted">
              No tienes entregas pendientes bajo este filtro.
            </p>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusAssignmentsCardComponent {
  readonly assignments = input.required<StudentAssignment[]>();
  readonly filter = input.required<AssignmentFilter>();
  readonly pendingCount = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly isFilterTransitioning = input<boolean>(false);
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);

  readonly filterChange = output<AssignmentFilter>();
  readonly submitAssignment = output<string>();
  readonly inspectAssignment = output<{ item: StudentAssignment; triggerId: string }>();

  protected badgeClassFor(item: StudentAssignment): string {
    if (item.submissionStatus === 'graded') return 'bg-success-box text-on-success-box';
    if (item.submissionStatus === 'submitted') return 'bg-primary-box text-on-primary-box';
    return item.urgency === 'urgent'
      ? 'bg-error-box text-on-error-box'
      : 'bg-sec-box text-on-sec-box';
  }

  protected statusLabelFor(item: StudentAssignment): string {
    if (item.submissionStatus === 'graded') return 'Calificada';
    if (item.submissionStatus === 'submitted') return 'Entregada';
    return item.urgency === 'urgent' ? 'Urgente' : 'Pendiente';
  }
}
