import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-campus-quick-actions',
  host: { class: 'block' },
  template: `
    <section
      aria-labelledby="quick-actions-heading"
      class="rounded-m3-xl bg-surface-low p-5 sm:p-6 space-y-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-m3-lg bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0"
          aria-hidden="true"
        >
          <span class="material-symbols-rounded text-lg">bolt</span>
        </div>
        <div>
          <h2 id="quick-actions-heading" class="text-title-md-emphasized text-main tracking-tight">
            Acciones de Aula
          </h2>
          <p class="text-label-sm text-muted">
            Comunicados rápidos y respaldo documental
          </p>
        </div>
      </div>

      <div class="space-y-2.5">
        <button
          id="campus-announcement-btn"
          type="button"
          (click)="openAnnouncement.emit('campus-announcement-btn')"
          [style.visibility]="
            isDialogOpen() && activeDialogTrigger() === 'campus-announcement-btn'
              ? 'hidden'
              : 'visible'
          "
          [style.view-transition-name]="
            !isDialogOpen() && activeDialogTrigger() === 'campus-announcement-btn'
              ? 'dialog-transform'
              : null
          "
          class="campus-surface-tile w-full bg-surface hover:bg-surface-high rounded-m3-lg p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
              aria-hidden="true"
            >
              <span class="material-symbols-rounded text-lg">campaign</span>
            </span>
            <div class="min-w-0">
              <p class="text-title-sm-emphasized text-main">Aviso a toda la clase</p>
              <p class="text-label-sm text-muted truncate">
                Publica un comunicado directo al tablero del grupo
              </p>
            </div>
          </div>
          <span class="material-symbols-rounded text-lg text-muted shrink-0" aria-hidden="true">
            chevron_right
          </span>
        </button>

        <button
          type="button"
          (click)="downloadCsv.emit()"
          class="campus-surface-tile w-full bg-surface hover:bg-surface-high rounded-m3-lg p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-10 h-10 rounded-m3-lg bg-sec-box text-on-sec-box grid place-items-center shrink-0"
              aria-hidden="true"
            >
              <span class="material-symbols-rounded text-lg">download</span>
            </span>
            <div class="min-w-0">
              <p class="text-title-sm-emphasized text-main">Descargar acta (.csv)</p>
              <p class="text-label-sm text-muted truncate">
                Exporta la nómina y estados de asistencia actuales
              </p>
            </div>
          </div>
          <span class="material-symbols-rounded text-lg text-muted shrink-0" aria-hidden="true">
            file_download
          </span>
        </button>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampusQuickActionsComponent {
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);

  readonly openAnnouncement = output<string>();
  readonly downloadCsv = output<void>();
}
