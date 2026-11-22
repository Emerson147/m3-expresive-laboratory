import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CampusRole, ClassScheduleItem } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';

@Component({
  selector: 'app-campus-header',
  imports: [M3ButtonComponent, M3ButtonGroupComponent],
  host: { class: 'block shrink-0' },
  template: `
    <header
      class="rounded-m3-xl bg-surface-low px-5 py-4 sm:px-6 sm:py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 shrink-0"
    >
      <div class="flex items-center gap-3.5 min-w-0">
        <div
          class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
          aria-hidden="true"
        >
          <span class="material-symbols-rounded text-[22px]">school</span>
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-title-lg-emphasized sm:text-headline-sm-emphasized text-main tracking-tight">
              Campus Académico
            </h1>
            <span
              class="px-2.5 py-0.5 rounded-m3-full bg-surface text-muted text-label-sm-emphasized font-mono"
            >
              {{ termLabel() }}
            </span>
          </div>
          <p class="text-label-md text-muted mt-0.5 truncate">
            {{ todayLabel() }} · Modalidad Híbrida Sincronizada
          </p>
        </div>
      </div>

      <div class="flex items-center flex-wrap gap-2.5 justify-between xl:justify-end">
        @if (currentRole() === 'student') {
          <div class="flex items-center gap-2 flex-wrap">
            @if (activeCourse(); as liveCourse) {
              @if (liveCourse.isActiveNow) {
                <span
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-m3-full bg-success-box text-on-success-box text-label-md-emphasized"
                >
                  <span class="campus-live-dot bg-success" aria-hidden="true"></span>
                  <span>En vivo · {{ liveCourse.code }}</span>
                </span>
              }
            }
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-m3-full bg-surface text-muted text-label-md-emphasized"
            >
              <span class="material-symbols-rounded text-[16px] text-primary" aria-hidden="true">
                assignment
              </span>
              <span>{{ pendingAssignments() }} pendientes</span>
            </span>
          </div>
        } @else {
          <span
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-m3-full bg-success-box text-on-success-box text-label-md-emphasized"
          >
            <span class="campus-live-dot bg-success" aria-hidden="true"></span>
            <span class="font-mono tabular-nums">Sincronía · {{ presentStudents() }}/{{ enrolledStudents() }}</span>
          </span>
        }

        <div class="flex items-center gap-2.5 flex-wrap">
          <m3-button-group
            variant="connected"
            selectionMode="single"
            size="sm"
            [options]="roleOptions"
            [value]="[currentRole()]"
            ariaLabel="Cambiar perfil de campus"
            (selectionChange)="onRoleSelectionChange($event)"
          />

          @if (currentRole() === 'student') {
            <m3-button
              id="campus-header-classroom-btn"
              variant="tonal"
              size="sm"
              icon="videocam"
              [morph]="true"
              customClass="hidden sm:inline-flex"
              [invisible]="
                isDialogOpen() && activeDialogTrigger() === 'campus-header-classroom-btn'
              "
              [viewTransitionName]="
                dialogMorphOwner() === 'trigger' && activeDialogTrigger() === 'campus-header-classroom-btn'
                  ? 'dialog-transform'
                  : null
              "
              (action)="openClassroom.emit('campus-header-classroom-btn')"
            >
              Aula Virtual
            </m3-button>
          } @else {
            <m3-button
              id="campus-header-announcement-btn"
              variant="filled"
              size="sm"
              icon="campaign"
              [morph]="true"
              customClass="hidden sm:inline-flex"
              [invisible]="
                isDialogOpen() && activeDialogTrigger() === 'campus-header-announcement-btn'
              "
              [viewTransitionName]="
                dialogMorphOwner() === 'trigger' && activeDialogTrigger() === 'campus-header-announcement-btn'
                  ? 'dialog-transform'
                  : null
              "
              (action)="openAnnouncement.emit('campus-header-announcement-btn')"
            >
              Publicar Aviso
            </m3-button>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusHeaderComponent {
  readonly termLabel = input.required<string>();
  readonly todayLabel = input.required<string>();
  readonly currentRole = input.required<CampusRole>();
  readonly pendingAssignments = input.required<number>();
  readonly presentStudents = input.required<number>();
  readonly enrolledStudents = input.required<number>();
  readonly activeCourse = input<ClassScheduleItem | null>(null);
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);
  readonly dialogMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly roleChange = output<CampusRole>();
  readonly openClassroom = output<string>();
  readonly openAnnouncement = output<string>();

  protected readonly roleOptions: M3ButtonGroupOption[] = [
    { id: 'student', label: 'Estudiante', icon: 'person' },
    { id: 'teacher', label: 'Docente', icon: 'co_present' }
  ];

  protected onRoleSelectionChange(vals: string[]): void {
    const next = vals[0];
    if (next === 'student' || next === 'teacher') {
      this.roleChange.emit(next);
    }
  }
}
