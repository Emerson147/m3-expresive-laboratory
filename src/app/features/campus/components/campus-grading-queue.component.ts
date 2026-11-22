import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { GradingFilter, TeacherGradingItem } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';

@Component({
  selector: 'app-campus-grading-queue',
  imports: [M3ButtonComponent, M3ChipComponent],
  host: { class: 'block' },
  template: `
    <section
      aria-labelledby="grading-heading"
      class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-4"
    >
      <div class="flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 rounded-m3-lg bg-sec-box text-on-sec-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-lg">grading</span>
          </div>
          <div class="min-w-0">
            <h2 id="grading-heading" class="text-title-md-emphasized text-main tracking-tight">
              Cola de Revisión
            </h2>
            <p class="text-label-sm text-muted truncate">
              Entregas recientes listas para calificación
            </p>
          </div>
        </div>

        @if (pendingCount() > 0) {
          <span
            class="px-2.5 py-1 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized shrink-0"
          >
            {{ pendingCount() }} pendientes
          </span>
        }
      </div>

      <div class="flex items-center flex-wrap gap-1.5" role="group" aria-label="Filtrar revisiones">
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
        <m3-chip
          type="filter"
          [selected]="filter() === 'reviewed'"
          [count]="reviewedCount()"
          (action)="filterChange.emit('reviewed')"
        >
          Evaluadas
        </m3-chip>
      </div>

      <div class="flex flex-col gap-3">
        @for (item of items(); track item.id) {
          @let triggerId = 'campus-grade-btn-' + item.id;

          <article
            class="campus-surface-tile bg-surface hover:bg-surface-high rounded-m3-lg p-4 space-y-3"
          >
            <div class="flex items-start justify-between gap-2.5">
              <div class="min-w-0 space-y-0.5">
                <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block truncate">
                  {{ item.subject }} · {{ item.submittedAt }}
                </span>
                <h3 class="text-title-sm-emphasized text-main truncate">
                  {{ item.studentName }}
                </h3>
                <p class="text-body-sm text-muted truncate">
                  {{ item.assignmentTitle }}
                </p>
              </div>

              <span
                [class]="'px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized shrink-0 ' + (item.status === 'reviewed' ? 'bg-success-box text-on-success-box' : 'bg-warning-box text-on-warning-box')"
              >
                {{ item.status === 'reviewed' ? item.score || 'Evaluado' : 'Pendiente' }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-2 pt-0.5">
              @if (item.feedback && item.status === 'reviewed') {
                <p class="text-label-sm text-muted truncate">{{ item.feedback }}</p>
              } @else {
                <span class="text-label-sm text-muted">Rúbrica activa</span>
              }

              <m3-button
                [id]="triggerId"
                [variant]="item.status === 'reviewed' ? 'tonal' : 'filled'"
                size="sm"
                [morph]="true"
                [icon]="item.status === 'reviewed' ? 'edit' : 'rate_review'"
                [invisible]="isDialogOpen() && activeDialogTrigger() === triggerId"
                [viewTransitionName]="
                  dialogMorphOwner() === 'trigger' && activeDialogTrigger() === triggerId
                    ? 'dialog-transform'
                    : null
                "
                (action)="openGrade.emit({ item, triggerId })"
              >
                {{ item.status === 'reviewed' ? 'Editar Nota' : 'Calificar' }}
              </m3-button>
            </div>
          </article>
        } @empty {
          <div class="rounded-m3-xl bg-surface p-5 text-center space-y-2">
            <span class="material-symbols-rounded text-2xl text-success" aria-hidden="true">
              task_alt
            </span>
            <p class="text-title-sm-emphasized text-main">Sin entregas bajo este filtro</p>
            <m3-button variant="tonal" size="sm" (action)="filterChange.emit('all')">
              Mostrar todas
            </m3-button>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusGradingQueueComponent {
  readonly items = input.required<TeacherGradingItem[]>();
  readonly pendingCount = input.required<number>();
  readonly totalCount = input<number>(0);
  readonly filter = input<GradingFilter>('all');
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);
  readonly dialogMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly filterChange = output<GradingFilter>();
  readonly openGrade = output<{ item: TeacherGradingItem; triggerId: string }>();

  protected readonly reviewedCount = computed(() =>
    Math.max(0, this.totalCount() - this.pendingCount())
  );
}
