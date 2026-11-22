import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  KanbanColumn,
  KanbanOrder,
  KanbanStageTone,
  OrderStage
} from '../../../core/kanban/kanban.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TabItem, M3TabsComponent } from '../../../shared/components/tabs/tabs.component';
import { KanbanCardComponent } from './kanban-card.component';

const STAGE_ICON_BG_CLASSES: Record<KanbanStageTone, string> = {
  primary: 'bg-primary-box text-on-primary-box',
  warning: 'bg-warning-box text-on-warning-box',
  tertiary: 'bg-tertiary-box text-on-tertiary-box',
  success: 'bg-success-box text-on-success-box'
};

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [KanbanCardComponent, M3TabsComponent, M3ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col shrink-0'
  },
  template: `
    <!-- Adaptive Primary M3 Tabs for Mobile (< md) so cards never squish into 4 tiny rows -->
    <div class="md:hidden mb-4 shrink-0">
      <m3-tabs
        variant="primary"
        ariaLabel="Etapas de cocina KDS"
        idPrefix="kds-tab"
        [tabs]="mobileTabs()"
        [(value)]="activeMobileStage" />
    </div>

    @if (hasActiveSearchOrFilter() && totalVisibleCount() === 0) {
      <div
        role="status"
        class="bg-surface-low rounded-m3-xl px-6 py-10 mb-5 flex flex-col items-center text-center gap-3">
        <div class="w-12 h-12 rounded-m3-full bg-sec-box text-on-sec-box grid place-items-center">
          <span class="material-symbols-rounded text-2xl" aria-hidden="true">filter_alt_off</span>
        </div>
        <div>
          <h2 class="text-title-md-emphasized text-main">No hay comandas que coincidan con el filtro</h2>
          <p class="text-body-sm text-muted mt-0.5">
            Ajustá tu búsqueda actual o limpiá los filtros para ver toda la operación en curso.
          </p>
        </div>
        <m3-button variant="tonal" size="sm" icon="restart_alt" (action)="clearFilters.emit()">
          Mostrar todas las comandas
        </m3-button>
      </div>
    }

    <!-- Adaptive Kanban Lanes: Single focused lane on Mobile | Horizontal snap on md-xl | 4-col grid on 2xl+ -->
    <section
      aria-label="Tablero Kanban Operativo KDS"
      class="kds-board-grid flex items-stretch md:flex-nowrap 2xl:grid 2xl:grid-cols-4 gap-5 2xl:gap-6 md:overflow-x-auto 2xl:overflow-x-visible pb-2">
      @for (column of columns(); track column.id) {
        @let stageOrders = ordersByStage()[column.id];
        @let isWipOver = stageOrders.length > column.wipLimit;
        @let isMobileVisible = activeMobileStage() === column.id;

        <div
          [id]="'kds-lane-' + column.id"
          data-kanban-lane
          [attr.data-stage]="column.id"
          [attr.aria-label]="column.title"
          [class]="(isMobileVisible ? 'flex' : 'hidden md:flex') + ' kds-lane w-full md:flex-1 2xl:w-auto flex-col bg-surface-low min-h-[360px] shrink-0 2xl:shrink'"
          [class.is-drop-target]="dragOverStage() === column.id">

          <!-- Lane Header (divider-free tonal separation + live WIP stepper + SLA Sort) -->
          <div class="shrink-0 px-4 sm:px-5 py-3.5 rounded-t-m3-xl bg-surface-box flex flex-col gap-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  [class]="'w-8 h-8 rounded-m3-md grid place-items-center shrink-0 ' + getToneBadgeClass(column.tone)">
                  <span class="material-symbols-rounded text-lg" aria-hidden="true">{{ column.icon }}</span>
                </span>

                <div class="min-w-0">
                  <h2 class="text-label-lg-emphasized uppercase tracking-wide text-main truncate">
                    {{ column.title }}
                  </h2>
                  <p class="text-label-sm text-muted truncate">{{ column.subtitle }}</p>
                </div>
              </div>

              <span
                [class]="'px-2.5 py-1 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums shrink-0 transition-colors ' + (isWipOver ? 'bg-error-box text-on-error-box' : 'bg-surface text-muted')"
                [attr.aria-label]="'Comandas en etapa: ' + stageOrders.length + ' de límite ' + column.wipLimit">
                {{ stageOrders.length }} / {{ column.wipLimit }}
              </span>
            </div>

            <!-- Quick Lane Controls: WIP Stepper & 1-Click Urgency Sort -->
            <div class="flex items-center justify-between gap-2">
              <div
                class="inline-flex items-center gap-1 bg-surface rounded-m3-full px-1.5 py-0.5"
                role="group"
                [attr.aria-label]="'Ajustar límite WIP de ' + column.title">
                <button
                  type="button"
                  (click)="adjustWip.emit({ stage: column.id, delta: -1 })"
                  [disabled]="column.wipLimit <= 1"
                  [attr.aria-label]="'Reducir límite WIP de ' + column.title"
                  class="w-7 h-7 rounded-m3-full grid place-items-center text-muted hover:text-main hover:bg-surface-high disabled:opacity-35 state-layer focus-ring-m3 transition-colors">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">remove</span>
                </button>
                <span class="text-label-sm font-mono tabular-nums text-muted px-1">
                  WIP {{ column.wipLimit }}
                </span>
                <button
                  type="button"
                  (click)="adjustWip.emit({ stage: column.id, delta: 1 })"
                  [disabled]="column.wipLimit >= 20"
                  [attr.aria-label]="'Aumentar límite WIP de ' + column.title"
                  class="w-7 h-7 rounded-m3-full grid place-items-center text-muted hover:text-main hover:bg-surface-high disabled:opacity-35 state-layer focus-ring-m3 transition-colors">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">add</span>
                </button>
              </div>

              @if (stageOrders.length > 1) {
                <button
                  type="button"
                  (click)="sortStage.emit(column.id)"
                  [attr.aria-label]="'Ordenar ' + column.title + ' por urgencia y SLA'"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-m3-full bg-surface text-label-sm-emphasized text-muted hover:text-primary hover:bg-primary-box/30 state-layer focus-ring-m3 transition-colors">
                  <span class="material-symbols-rounded text-[15px]" aria-hidden="true">sort</span>
                  <span>Ordenar SLA</span>
                </button>
              }
            </div>
          </div>

          <!-- Lane Dropzone & Full-Flow Cards List (scrolls naturally with page workbench) -->
          <div class="kds-lane-scroll flex-1 p-4 sm:p-5 flex flex-col gap-4">
            @if (stageOrders.length === 0) {
              <div class="flex-1 min-h-[180px] flex flex-col items-center justify-center p-6 border border-dashed border-outline rounded-m3-lg text-center text-muted">
                <span class="material-symbols-rounded text-3xl mb-1.5 opacity-60" aria-hidden="true">
                  {{ column.icon }}
                </span>
                <p class="text-body-sm font-medium text-main">Sin comandas activas</p>
                <p class="text-label-sm text-muted mt-0.5">Arrastrá una tarjeta aquí o avanzá un ticket</p>
              </div>
            } @else {
              <ul role="list" class="list-none m-0 p-0 flex flex-col gap-4">
                @for (order of stageOrders; track order.id) {
                  <li
                    class="kds-ticket-item"
                    [attr.data-order-id]="order.id"
                    [style.view-transition-name]="isBoardFlipActive() && activeTransitionOrderId() !== order.id ? 'kds-ticket-' + order.id : null">
                    <app-kanban-card
                      [order]="order"
                      [isDragging]="draggedOrderId() === order.id"
                      [isReorderTarget]="dragOverOrderId() === order.id && draggedOrderId() !== order.id"
                      [isTransitioning]="activeTransitionOrderId() === order.id"
                      [activeInspectTrigger]="activeInspectTrigger()"
                      [isInspectModalOpen]="isInspectModalOpen()"
                      [inspectMorphOwner]="inspectMorphOwner()"
                      (dragStart)="orderDragStart.emit($event)"
                      (dragHover)="orderDragHover.emit($event)"
                      (dragDrop)="orderDragDrop.emit($event)"
                      (dragEnd)="orderDragEnd.emit()"
                      (advance)="advanceOrder.emit($event)"
                      (regress)="regressOrder.emit($event)"
                      (dispatch)="dispatchOrder.emit($event)"
                      (reorder)="reorderOrder.emit({ orderId: order.id, direction: $event })"
                      (inspect)="inspectOrder.emit($event)" />
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </section>
  `
})
export class KanbanBoardComponent {
  readonly columns = input.required<readonly KanbanColumn[]>();
  readonly ordersByStage = input.required<Record<OrderStage, KanbanOrder[]>>();
  readonly draggedOrderId = input<string | null>(null);
  readonly dragOverStage = input<OrderStage | null>(null);
  readonly dragOverOrderId = input<string | null>(null);
  readonly activeTransitionOrderId = input<string | null>(null);
  readonly isBoardFlipActive = input<boolean>(false);
  readonly activeInspectTrigger = input<string | null>(null);
  readonly isInspectModalOpen = input<boolean>(false);
  readonly inspectMorphOwner = input<'trigger' | 'modal' | null>(null);
  readonly hasActiveSearchOrFilter = input<boolean>(false);

  readonly orderDragStart = output<{ orderId: string }>();
  readonly orderDragHover = output<{ stage: OrderStage | null; targetOrderId: string | null }>();
  readonly orderDragDrop = output<{ stage: OrderStage; beforeOrderId: string | null }>();
  readonly orderDragEnd = output<void>();
  readonly advanceOrder = output<string>();
  readonly regressOrder = output<string>();
  readonly dispatchOrder = output<string>();
  readonly reorderOrder = output<{ orderId: string; direction: 'up' | 'down' }>();
  readonly inspectOrder = output<KanbanOrder>();
  readonly adjustWip = output<{ stage: OrderStage; delta: 1 | -1 }>();
  readonly sortStage = output<OrderStage>();
  readonly clearFilters = output<void>();

  readonly activeMobileStage = signal<string>('queue');

  readonly totalVisibleCount = computed(() => {
    const grouped = this.ordersByStage();
    return grouped.queue.length + grouped.prep.length + grouped.qa.length + grouped.ready.length;
  });

  readonly mobileTabs = computed<M3TabItem[]>(() =>
    this.columns().map((column) => ({
      id: column.id,
      label: this.shortStageTitle(column.id),
      badge: this.ordersByStage()[column.id].length,
      panelId: 'kds-lane-' + column.id
    }))
  );

  getToneBadgeClass(tone: KanbanStageTone): string {
    return STAGE_ICON_BG_CLASSES[tone];
  }

  shortStageTitle(stage: OrderStage): string {
    const labels: Record<OrderStage, string> = {
      queue: 'Cola',
      prep: 'Cocina',
      qa: 'Calidad',
      ready: 'Listo'
    };
    return labels[stage];
  }
}
