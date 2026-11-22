import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  AllDayDishSummary,
  KanbanClosedOrder,
  OrderCategory
} from '../../../core/kanban/kanban.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TabItem, M3TabsComponent } from '../../../shared/components/tabs/tabs.component';

const CATEGORY_LABELS: Record<OrderCategory, string> = {
  kitchen: 'Cocina Caliente',
  cold_chain: 'Cadena de Frío',
  express: 'Express',
  dispatch: 'Despacho'
};

@Component({
  selector: 'app-kanban-ops-dialog',
  standalone: true,
  imports: [M3DialogComponent, M3ButtonComponent, M3TabsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Centro Operativo Cocina y Turno"
      customClass="kds-ops-dialog"
      (closeRequested)="closed.emit()">

      <!-- Floating Expressive Header -->
      <div id="kanban-ops-dialog" class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0 space-y-3">
        <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-m3-lg bg-sec-box text-on-sec-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-xl" aria-hidden="true">kitchen</span>
            </div>
            <div class="min-w-0">
              <h3 id="kds-ops-title" class="text-title-lg-emphasized text-main leading-tight">
                Producción All-Day &amp; Turno
              </h3>
              <p class="text-label-md text-muted truncate mt-0.5">
                Consolidado de platos pendientes y recuperación de comandas cerradas
              </p>
            </div>
          </div>

          <m3-button
            variant="text"
            size="sm"
            [iconOnly]="true"
            icon="close"
            ariaLabel="Cerrar panel operativo de cocina"
            (action)="closed.emit()" />
        </header>

        <m3-tabs
          variant="secondary"
          ariaLabel="Vistas operativas KDS"
          idPrefix="kds-ops-tab"
          [tabs]="opsTabs()"
          [value]="activeTab()"
          (valueChange)="onTabChange($event)" />
      </div>

      <!-- Scrollable Tab Body -->
      <div class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar flex flex-col gap-3">
        @if (activeTab() === 'allday') {
          @if (allDayDishes().length === 0) {
            <div class="p-8 rounded-m3-xl bg-surface-low text-center space-y-2">
              <span class="material-symbols-rounded text-3xl text-muted opacity-60" aria-hidden="true">
                task_alt
              </span>
              <p class="text-title-sm font-semibold text-main">Cocina al día</p>
              <p class="text-body-sm text-muted">
                No quedan platos sin marcar en Cola de Entrada ni En Preparación.
              </p>
            </div>
          } @else {
            <p class="text-label-md text-muted">
              Sumatoria de ítems pendientes por preparar. Tocá un plato para filtrar sus tickets en el tablero.
            </p>
            <ul role="list" class="list-none p-0 flex flex-col gap-2">
              @for (dish of allDayDishes(); track dish.name) {
                <li>
                  <button
                    type="button"
                    (click)="filterByDish.emit(dish.name)"
                    class="w-full p-3.5 rounded-m3-xl bg-surface-low hover:bg-surface-high flex items-center justify-between gap-3 text-left state-layer focus-ring-m3 transition-colors">
                    <div class="flex items-center gap-3 min-w-0">
                      <span class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box font-mono text-title-md-emphasized tabular-nums grid place-items-center shrink-0">
                        {{ dish.totalQty }}x
                      </span>
                      <div class="min-w-0">
                        <span class="text-title-sm font-semibold text-main block truncate">{{ dish.name }}</span>
                        <span class="text-label-sm text-muted block truncate">
                          {{ getCategoryLabel(dish.category) }} · Tickets: {{ dish.ticketNumbers.join(', ') }}
                        </span>
                      </div>
                    </div>

                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-m3-full bg-surface text-label-sm-emphasized text-primary shrink-0">
                      <span class="material-symbols-rounded text-sm" aria-hidden="true">filter_alt</span>
                      Filtrar
                    </span>
                  </button>
                </li>
              }
            </ul>
          }
        } @else {
          @if (closedHistory().length === 0) {
            <div class="p-8 rounded-m3-xl bg-surface-low text-center space-y-2">
              <span class="material-symbols-rounded text-3xl text-muted opacity-60" aria-hidden="true">
                history
              </span>
              <p class="text-title-sm font-semibold text-main">Aún no hay comandas cerradas en este turno</p>
              <p class="text-body-sm text-muted">
                Cuando entregues o anules una comanda aparecerá aquí para poder recuperarla (Recall).
              </p>
            </div>
          } @else {
            <ul role="list" class="list-none p-0 flex flex-col gap-2.5">
              @for (entry of closedHistory(); track entry.order.id + '-' + entry.closedAt) {
                <li class="p-3.5 rounded-m3-xl bg-surface-low flex flex-wrap items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex items-center flex-wrap gap-2">
                      <span class="font-mono text-title-sm font-bold text-main">
                        {{ entry.order.ticketNumber }}
                      </span>
                      <span
                        [class]="'px-2 py-0.5 rounded-m3-full text-label-sm-emphasized ' + (entry.reason === 'dispatched' ? 'bg-success-box text-on-success-box' : 'bg-error-box text-on-error-box')">
                        {{ entry.reason === 'dispatched' ? 'Entregada' : 'Anulada' }}
                      </span>
                      <span class="text-label-sm font-mono text-muted">{{ entry.closedAt }}</span>
                    </div>
                    <p class="text-body-sm text-muted truncate mt-0.5">
                      {{ entry.order.tableOrClient }} · {{ entry.order.items.length }} ítems · S/ {{ entry.order.totalAmount.toFixed(2) }}
                    </p>
                  </div>

                  <m3-button
                    variant="tonal"
                    size="sm"
                    icon="undo"
                    [ariaLabel]="'Restaurar comanda ' + entry.order.ticketNumber + ' al tablero'"
                    (action)="restoreOrder.emit(entry.order.id)">
                    Restaurar
                  </m3-button>
                </li>
              }
            </ul>
          }
        }
      </div>

      <!-- Divider-Free Dialog Footer -->
      <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex items-center justify-between gap-3 shrink-0">
        <span class="text-label-md font-mono tabular-nums text-muted">
          {{ allDayDishes().length }} platos activos · {{ closedHistory().length }} cierres
        </span>
        <m3-button variant="text" (action)="closed.emit()">
          Cerrar
        </m3-button>
      </footer>
    </m3-dialog>
  `
})
export class KanbanOpsDialogComponent {
  readonly open = input<boolean>(false);
  readonly activeTab = input<'allday' | 'history'>('allday');
  readonly allDayDishes = input<AllDayDishSummary[]>([]);
  readonly closedHistory = input<KanbanClosedOrder[]>([]);

  readonly closed = output<void>();
  readonly tabChange = output<'allday' | 'history'>();
  readonly filterByDish = output<string>();
  readonly restoreOrder = output<string>();

  readonly totalPendingUnits = computed(() =>
    this.allDayDishes().reduce((sum, dish) => sum + dish.totalQty, 0)
  );

  readonly opsTabs = computed<M3TabItem[]>(() => [
    {
      id: 'allday',
      label: 'All-Day Cocina',
      icon: 'restaurant_menu',
      badge: this.totalPendingUnits()
    },
    {
      id: 'history',
      label: 'Historial / Recall',
      icon: 'history',
      badge: this.closedHistory().length
    }
  ]);

  onTabChange(tabId: string): void {
    if (tabId === 'allday' || tabId === 'history') {
      this.tabChange.emit(tabId);
    }
  }

  getCategoryLabel(category: OrderCategory): string {
    return CATEGORY_LABELS[category];
  }
}
