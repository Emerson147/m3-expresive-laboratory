import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ClassScheduleItem, SubjectCategory } from '../../../core/campus/campus.models';
import { SUBJECT_CATEGORY_META } from './campus-ui.tokens';

@Component({
  selector: 'app-campus-schedule-card',
  host: { class: 'block' },
  template: `
    <section
      aria-labelledby="schedule-heading"
      class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-4"
    >
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 rounded-m3-lg bg-surface text-primary grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-lg">calendar_today</span>
          </div>
          <div class="min-w-0">
            <h2 id="schedule-heading" class="text-title-md-emphasized text-main tracking-tight">
              Horario de Hoy
            </h2>
            <p class="text-label-sm text-muted truncate">
              Toca una cátedra para enfocarla en el monitor superior
            </p>
          </div>
        </div>

        <span
          class="px-3 py-1 rounded-m3-full bg-surface text-muted text-label-sm-emphasized font-mono tabular-nums"
        >
          {{ schedule().length }} bloques
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        @for (item of schedule(); track item.id) {
          @let isSelected = item.id === selectedClassId();
          @let meta = categoryMetaFor(item.category);

          <button
            type="button"
            (click)="selectClass.emit(item.id)"
            [attr.aria-pressed]="isSelected"
            class="campus-surface-tile rounded-m3-lg text-left p-4 flex flex-col justify-between gap-3 cursor-pointer"
            [class.is-selected]="isSelected"
            [class.bg-primary-box]="isSelected"
            [class.text-on-primary-box]="isSelected"
            [class.bg-surface]="!isSelected"
            [class.hover:bg-surface-high]="!isSelected"
            [class.text-main]="!isSelected"
          >
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  [class]="'w-9 h-9 rounded-m3-md grid place-items-center shrink-0 ' + (isSelected ? 'bg-surface/30 text-current' : meta.tileTintClass)"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-lg">{{ meta.icon }}</span>
                </div>
                <div class="min-w-0">
                  <span
                    class="text-label-sm font-mono uppercase tracking-wider"
                    [class.text-muted]="!isSelected"
                    [class.opacity-85]="isSelected"
                  >
                    {{ item.code }}
                  </span>
                  <h3 class="text-title-sm-emphasized leading-snug truncate">
                    {{ item.subject }}
                  </h3>
                </div>
              </div>

              @if (item.isActiveNow) {
                <span
                  [class]="'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-m3-full text-label-sm-emphasized shrink-0 ' + (isSelected ? 'bg-surface text-main' : 'bg-success-box text-on-success-box')"
                >
                  <span class="campus-live-dot bg-success" aria-hidden="true"></span>
                  En vivo
                </span>
              }
            </div>

            <div
              class="flex items-center justify-between gap-2 text-label-sm"
              [class.text-muted]="!isSelected"
              [class.opacity-85]="isSelected"
            >
              <span class="truncate">{{ item.teacherName }} · {{ item.room }}</span>
              <span class="font-mono font-bold tabular-nums shrink-0">{{ item.timeRange }}</span>
            </div>
          </button>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusScheduleCardComponent {
  readonly schedule = input.required<ClassScheduleItem[]>();
  readonly selectedClassId = input.required<string>();

  readonly selectClass = output<string>();

  protected categoryMetaFor(category: SubjectCategory) {
    return SUBJECT_CATEGORY_META[category];
  }
}
