import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';

@Component({
  selector: 'app-kanban-header',
  standalone: true,
  imports: [M3ButtonComponent, M3SwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-surface-low rounded-m3-xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
          <span class="material-symbols-rounded text-2xl" aria-hidden="true">view_kanban</span>
        </div>

        <div class="min-w-0">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-primary block">
            Kitchen &amp; Dispatch Display
          </span>

          <h1 class="text-title-lg-emphasized sm:text-headline-sm-emphasized text-main truncate mt-0.5">
            Kanban Operativo &amp; KDS
          </h1>
          <p class="text-body-sm text-muted truncate">
            Control táctil de estaciones, metas SLA y auditoría de despacho en tiempo real.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center touch-gap-8 shrink-0">
        <!-- Kitchen Live Clock -->
        <div
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-m3-full bg-surface text-label-md-emphasized font-mono tabular-nums text-main"
          aria-label="Hora actual de cocina">
          <span class="material-symbols-rounded text-lg text-primary" aria-hidden="true">schedule</span>
          <span>{{ currentClock() }}</span>
        </div>

        <!-- Auto SLA Clock Switch -->
        <m3-button
          [toggle]="true"
          [selected]="isLiveActive()"
          variant="tonal"
          size="sm"
          [icon]="isLiveActive() ? 'pause_circle' : 'play_circle'"
          ariaLabel="Pausar o reanudar cronómetro automático SLA"
          (action)="toggleLive.emit()">
          {{ isLiveActive() ? 'En Vivo' : 'Pausado' }}
        </m3-button>

        <!-- Sound Buzzer Switch -->
        <div class="flex items-center px-3.5 py-1 rounded-m3-full bg-surface">
          <m3-switch
            [checked]="buzzerEnabled()"
            iconMode="selected"
            label="Timbre KDS"
            ariaLabel="Activar o silenciar timbre sonoro de comandas"
            (changed)="toggleBuzzer.emit()" />
        </div>

        <!-- Primary Dispatch / New Order CTA -->
        <m3-button
          id="trigger-create-order"
          variant="filled"
          size="md"
          icon="add"
          [morph]="true"
          [invisible]="isCreateOriginInvisible()"
          [viewTransitionName]="isCreateOriginActive() ? 'dialog-transform' : null"
          (action)="createOrder.emit()">
          Nueva Comanda
        </m3-button>
      </div>
    </header>
  `
})
export class KanbanHeaderComponent {
  readonly currentClock = input.required<string>();
  readonly buzzerEnabled = input<boolean>(true);
  readonly isLiveActive = input<boolean>(true);
  readonly isCreateOriginActive = input<boolean>(false);
  readonly isCreateOriginInvisible = input<boolean>(false);

  readonly toggleBuzzer = output<void>();
  readonly toggleLive = output<void>();
  readonly createOrder = output<void>();
}
