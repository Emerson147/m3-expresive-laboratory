import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  KanbanColumn,
  KanbanOrder,
  KanbanStageTone,
  OrderStage
} from '../../../core/kanban/kanban.models';
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
  imports: [KanbanCardComponent, M3TabsComponent],
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

    <!-- Adaptive Kanban Lanes: Single focused lane on Mobile | Horizontal snap on md-lg | 4-col grid on xl+ -->
    <section
      aria-label="Tablero Kanban Operativo KDS"
      class="kds-board-grid flex items-stretch md:flex-nowrap xl:grid xl:grid-cols-4 gap-5 xl:gap-6 md:overflow-x-auto xl:overflow-x-visible pb-2">
      @for (column of columns(); track column.id) {
        @let stageOrders = ordersByStage()[column.id];
        @let isWipOver = stageOrders.length > column.wipLimit;
        @let isMobileVisible = activeMobileStage() === column.id;

        <div
          [id]="'kds-lane-' + column.id"
          data-kanban-lane
          [attr.data-stage]="column.id"
          [attr.aria-label]="column.title"
          [class]="(isMobileVisible ? 'flex' : 'hidden md:flex') + ' kds-lane w-full md:flex-1 xl:w-auto flex-col bg-surface-low min-h-[360px] shrink-0 xl:shrink'"
          [class.is-drop-target]="dragOverStage() === column.id">

          <!-- Lane Header (divider-free tonal separation) -->
          <div class="shrink-0 px-5 py-4 rounded-t-m3-xl bg-surface-box flex items-center justify-between gap-2">
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
              class="px-2.5 py-1 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums shrink-0 transition-colors"
              [class]="isWipOver ? 'bg-error-box text-on-error-box' : 'bg-surface text-muted'"
              [attr.aria-label]="'Comandas en etapa: ' + stageOrders.length + ' de límite ' + column.wipLimit">
              {{ stageOrders.length }} / {{ column.wipLimit }}
            </span>
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

  readonly orderDragStart = output<{ orderId: string }>();
  readonly orderDragHover = output<{ stage: OrderStage | null; targetOrderId: string | null }>();
  readonly orderDragDrop = output<{ stage: OrderStage; beforeOrderId: string | null }>();
  readonly orderDragEnd = output<void>();
  readonly advanceOrder = output<string>();
  readonly regressOrder = output<string>();
  readonly dispatchOrder = output<string>();
  readonly reorderOrder = output<{ orderId: string; direction: 'up' | 'down' }>();
  readonly inspectOrder = output<KanbanOrder>();

  readonly activeMobileStage = signal<string>('queue');

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
