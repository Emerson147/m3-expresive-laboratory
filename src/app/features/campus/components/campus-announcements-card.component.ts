import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AnnouncementFilter, CampusAnnouncement } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';

@Component({
  selector: 'app-campus-announcements-card',
  imports: [M3ButtonComponent, M3ChipComponent],
  host: { class: 'block' },
  template: `
    <section
      aria-labelledby="announcements-heading"
      class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-4"
    >
      <div class="flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 rounded-m3-lg bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <span class="material-symbols-rounded text-lg">campaign</span>
          </div>
          <div class="min-w-0">
            <h2 id="announcements-heading" class="text-title-md-emphasized text-main tracking-tight">
              Tablero Oficial
            </h2>
            <p class="text-label-sm text-muted truncate">
              Comunicados de cátedra y coordinación
            </p>
          </div>
        </div>

        @if (unreadCount() > 0) {
          <span
            class="px-2.5 py-1 rounded-m3-full bg-primary-box text-on-primary-box text-label-sm-emphasized shrink-0"
          >
            {{ unreadCount() }} nuevos
          </span>
        }
      </div>

      <div class="flex items-center flex-wrap gap-1.5" role="group" aria-label="Filtrar comunicados">
        <m3-chip
          type="filter"
          [selected]="filter() === 'all'"
          [count]="totalCount()"
          (action)="filterChange.emit('all')"
        >
          Todos
        </m3-chip>
        <m3-chip
          type="filter"
          [selected]="filter() === 'unread'"
          [count]="unreadCount()"
          (action)="filterChange.emit('unread')"
        >
          Sin leer
        </m3-chip>
        <m3-chip
          type="filter"
          [selected]="filter() === 'important'"
          (action)="filterChange.emit('important')"
        >
          Prioritarios
        </m3-chip>
      </div>

      <div class="flex flex-col gap-3">
        @for (ann of announcements(); track ann.id) {
          <article
            class="campus-surface-tile rounded-m3-lg p-4 space-y-2.5"
            [class.bg-surface]="!ann.important"
            [class.bg-surface-high]="ann.important"
          >
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5 flex-wrap">
                @if (ann.important) {
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full bg-warning-box text-on-warning-box text-[10px] font-bold uppercase tracking-wider"
                  >
                    <span class="material-symbols-rounded text-[13px]" aria-hidden="true">
                      priority_high
                    </span>
                    Prioritario
                  </span>
                }
                <span
                  class="px-2.5 py-0.5 rounded-m3-full bg-surface-low text-muted text-label-sm"
                >
                  {{ ann.tag }}
                </span>
              </div>

              <span class="text-label-sm text-muted">{{ ann.date }}</span>
            </div>

            <h3 class="text-title-sm-emphasized text-main leading-snug">
              {{ ann.title }}
            </h3>

            <p class="text-body-sm text-muted leading-relaxed">
              {{ ann.summary }}
            </p>

            <div class="pt-1 flex items-center justify-between gap-2">
              <span class="text-label-sm text-muted truncate">
                {{ ann.publisher }}
              </span>

              <m3-button
                variant="text"
                size="xs"
                [toggle]="true"
                [selected]="!!ann.acknowledged"
                [icon]="ann.acknowledged ? 'done_all' : 'check'"
                (action)="toggleAck.emit(ann.id)"
              >
                {{ ann.acknowledged ? 'Leído' : 'Enterado' }}
              </m3-button>
            </div>
          </article>
        } @empty {
          <div class="rounded-m3-xl bg-surface p-5 text-center space-y-2">
            <span class="material-symbols-rounded text-2xl text-muted" aria-hidden="true">
              mark_email_read
            </span>
            <p class="text-title-sm-emphasized text-main">Sin avisos en este filtro</p>
            <m3-button variant="tonal" size="sm" (action)="filterChange.emit('all')">
              Ver todos
            </m3-button>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusAnnouncementsCardComponent {
  readonly announcements = input.required<CampusAnnouncement[]>();
  readonly unreadCount = input.required<number>();
  readonly totalCount = input<number>(0);
  readonly filter = input<AnnouncementFilter>('all');

  readonly filterChange = output<AnnouncementFilter>();
  readonly toggleAck = output<string>();
}
