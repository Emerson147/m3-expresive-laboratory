import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild
} from '@angular/core';
import { ClassScheduleItem } from '../../../core/campus/campus.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { SUBJECT_CATEGORY_META } from './campus-ui.tokens';

@Component({
  selector: 'app-campus-classroom-modal',
  imports: [M3DialogComponent, M3ButtonComponent, M3CheckboxComponent],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open() && !!course()"
      [managedClose]="true"
      [showCloseButton]="false"
      [headline]="dialogHeadline()"
      [viewTransitionName]="viewTransitionName()"
      customClass="campus-modal-dialog"
      (closeRequested)="close.emit()"
    >
      @if (open() && course(); as c) {
        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
            <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  [class]="'w-11 h-11 rounded-m3-lg grid place-items-center shrink-0 ' + categoryMeta().tileTintClass"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[22px]">
                    {{ categoryMeta().icon }}
                  </span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      [class]="'px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono ' + categoryMeta().badgeClass"
                    >
                      {{ c.code }} · {{ categoryMeta().label }}
                    </span>
                    @if (c.isActiveNow) {
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-label-sm-emphasized"
                      >
                        <span class="campus-live-dot bg-success" aria-hidden="true"></span>
                        En vivo ahora
                      </span>
                    }
                  </div>
                  <h3
                    id="campus-classroom-heading"
                    class="text-title-lg-emphasized text-main tracking-tight leading-snug"
                  >
                    {{ c.subject }}
                  </h3>
                </div>
              </div>

              <m3-button
                variant="text"
                size="sm"
                icon="close"
                [iconOnly]="true"
                ariaLabel="Cerrar portal del aula"
                (action)="close.emit()"
              />
            </header>
          </div>

          <div #modalScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div class="bg-surface rounded-m3-lg p-3">
                <p class="text-label-sm uppercase tracking-wider text-muted">
                  Docente a cargo
                </p>
                <p class="text-title-sm-emphasized text-main mt-1 truncate">
                  {{ c.teacherName }}
                </p>
              </div>
              <div class="bg-surface rounded-m3-lg p-3">
                <p class="text-label-sm uppercase tracking-wider text-muted">
                  Ambiente & Horario
                </p>
                <p class="text-title-sm-emphasized text-main mt-1 truncate">
                  {{ c.room }} · {{ c.timeRange }}
                </p>
              </div>
            </div>

            <div class="bg-surface rounded-m3-lg p-3.5 space-y-1.5">
              <p class="text-label-sm uppercase tracking-wider text-muted">
                Tema de sesión
              </p>
              <p class="text-body-sm text-main leading-relaxed">
                {{ c.syllabusTopic }}
              </p>
            </div>

            @if (c.resources && c.resources.length > 0) {
              <div class="bg-surface-low rounded-m3-xl p-3.5 flex flex-col gap-2.5">
                <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                  Recursos & Checklist de Sesión
                </span>
                <ul role="list" class="list-none p-0 flex flex-col gap-2">
                  @for (res of c.resources; track res.id) {
                    <li class="p-2.5 rounded-m3-md bg-surface flex items-center justify-between gap-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <m3-checkbox
                          [checked]="!!res.completed"
                          [ariaLabel]="'Marcar recurso ' + res.title + ' como revisado'"
                          (changed)="toggleResource.emit({ courseId: c.id, resourceId: res.id })"
                        />
                        <div class="min-w-0">
                          <p [class]="'text-body-sm font-medium truncate ' + (res.completed ? 'line-through text-muted' : 'text-main')">
                            {{ res.title }}
                          </p>
                          <p class="text-label-sm text-muted">{{ res.detail }}</p>
                        </div>
                      </div>
                      <span class="text-label-sm font-mono uppercase px-2 py-0.5 rounded-m3-full bg-surface-low text-muted shrink-0">
                        {{ res.type }}
                      </span>
                    </li>
                  }
                </ul>
              </div>
            }

            <div class="bg-surface rounded-m3-lg p-3.5 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="text-label-sm uppercase tracking-wider text-muted">
                  Enlace de transmisión institucional
                </p>
                <p class="text-label-sm font-mono text-primary truncate mt-0.5">
                  {{ c.classroomLink }}
                </p>
              </div>
              <m3-button
                variant="tonal"
                size="sm"
                icon="content_copy"
                ariaLabel="Copiar enlace del aula"
                (action)="copyLink.emit(c)"
              >
                Copiar
              </m3-button>
            </div>
          </div>

          <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-end gap-2.5 shrink-0">
            <m3-button variant="text" size="md" (action)="close.emit()">
              Cerrar
            </m3-button>
            <m3-button
              variant="filled"
              size="md"
              icon="videocam"
              (action)="enterRoom.emit(c)"
            >
              {{ c.isActiveNow ? 'Conectar a Sala en Vivo' : 'Abrir Portal del Curso' }}
            </m3-button>
          </footer>
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusClassroomModalComponent {
  readonly open = input<boolean>(false);
  readonly course = input<ClassScheduleItem | null>(null);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();
  readonly copyLink = output<ClassScheduleItem>();
  readonly enterRoom = output<ClassScheduleItem>();
  readonly toggleResource = output<{ courseId: string; resourceId: string }>();

  private readonly injector = inject(Injector);
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');
  private wasOpen = false;

  protected readonly dialogHeadline = computed(() => {
    const c = this.course();
    return c ? `${c.code} · ${c.subject}` : 'Portal de Aula Virtual';
  });

  protected readonly categoryMeta = computed(() => {
    const current = this.course();
    return SUBJECT_CATEGORY_META[current?.category ?? 'stem'];
  });

  constructor() {
    effect(() => {
      const isOpen = this.open() && Boolean(this.course());
      if (isOpen && !this.wasOpen) {
        untracked(() => {
          afterNextRender(
            () => {
              const el = this.modalScrollBody()?.nativeElement;
              if (el) el.scrollTop = 0;
            },
            { injector: this.injector }
          );
        });
      }
      this.wasOpen = isOpen;
    });
  }
}
