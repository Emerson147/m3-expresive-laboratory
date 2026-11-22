import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild
} from '@angular/core';
import { DischargeRecord } from '../../../core/clinic/clinic.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { DISCHARGE_DISPOSITION_META, TRIAGE_LEVEL_META } from './clinic-ui.tokens';

@Component({
  selector: 'app-clinic-history-modal',
  imports: [M3DialogComponent, M3ButtonComponent],
  host: { class: 'contents' },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Bitácora de Egresos y Traslados"
      [viewTransitionName]="viewTransitionName()"
      customClass="clinic-modal-dialog"
      (closeRequested)="close.emit()"
    >
      @if (open()) {
        <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
            <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-m3-lg bg-sec-box text-on-sec-box grid place-items-center shrink-0"
                  aria-hidden="true"
                >
                  <span class="material-symbols-rounded text-[21px]">history</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-title-lg-emphasized text-main tracking-tight">
                    Bitácora de Egresos del Turno
                  </h3>
                  <p class="text-label-md text-muted mt-0.5">
                    Altas médicas, pases a hospitalización y traslados a UCI
                  </p>
                </div>
              </div>

              <m3-button
                variant="text"
                size="sm"
                icon="close"
                [iconOnly]="true"
                ariaLabel="Cerrar bitácora de egresos"
                (action)="close.emit()"
              />
            </header>
          </div>

          <div #modalScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-2.5">
            @if (records().length > 0) {
              <ul role="list" class="list-none m-0 p-0 space-y-2.5">
                @for (rec of records(); track rec.id) {
                  @let dispMeta = dispositionMetaFor(rec.disposition);
                  @let triageMeta = triageMetaFor(rec.triageLevel);
                  <li class="rounded-m3-xl bg-surface p-4 space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          [class]="
                            triageMeta.badgeClass +
                            ' px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono'
                          "
                        >
                          {{ triageMeta.shortCode }}
                        </span>
                        <span class="text-title-sm-emphasized text-main">{{ rec.fullName }}</span>
                        <span class="text-label-sm font-mono text-muted">{{ rec.ticketCode }} · {{ rec.age }}a</span>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <span
                          [class]="
                            dispMeta.badgeClass +
                            ' inline-flex items-center gap-1 px-2.5 py-0.5 rounded-m3-full text-label-sm-emphasized'
                          "
                        >
                          <span class="material-symbols-rounded text-[14px]" aria-hidden="true">
                            {{ dispMeta.icon }}
                          </span>
                          <span>{{ dispMeta.label }}</span>
                        </span>
                        <span class="text-label-sm font-mono text-muted">{{ rec.dischargedAt }}</span>
                      </div>
                    </div>

                    @if (rec.previousBedId || rec.notes) {
                      <div class="text-body-sm text-muted space-y-1">
                        @if (rec.previousBedId) {
                          <p class="text-label-sm font-mono">
                            Box liberado: {{ rec.previousBedId }}
                          </p>
                        }
                        @if (rec.notes) {
                          <p class="rounded-m3-md bg-surface-low px-3 py-2 text-main">
                            {{ rec.notes }}
                          </p>
                        }
                      </div>
                    }
                  </li>
                }
              </ul>
            } @else {
              <div class="rounded-m3-xl bg-surface p-8 text-center space-y-2">
                <span class="material-symbols-rounded text-[28px] text-muted" aria-hidden="true">
                  assignment_turned_in
                </span>
                <p class="text-title-sm-emphasized text-main">
                  Sin egresos registrados en este turno
                </p>
                <p class="text-body-sm text-muted">
                  Cuando confirmes un alta, pase a piso o traslado a UCI aparecerá aquí con su hora y destino.
                </p>
              </div>
            }
          </div>

          <footer class="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 shrink-0 flex items-center justify-end">
            <m3-button variant="tonal" size="md" (action)="close.emit()">
              Cerrar
            </m3-button>
          </footer>
        </div>
      }
    </m3-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicHistoryModalComponent {
  private readonly injector = inject(Injector);
  private readonly modalScrollBody = viewChild<ElementRef<HTMLElement>>('modalScrollBody');

  readonly open = input<boolean>(false);
  readonly records = input<readonly DischargeRecord[]>([]);
  readonly viewTransitionName = input<string | null>(null);

  readonly close = output<void>();

  private wasOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.open();
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

  protected dispositionMetaFor = (id: DischargeRecord['disposition']) =>
    DISCHARGE_DISPOSITION_META.find((d) => d.id === id) ?? DISCHARGE_DISPOSITION_META[0];

  protected triageMetaFor = (level: DischargeRecord['triageLevel']) =>
    TRIAGE_LEVEL_META[level];
}
