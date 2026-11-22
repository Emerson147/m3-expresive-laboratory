import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  NgZone,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { CreateOrderDto, KanbanOrder } from '../../core/kanban/kanban.models';
import { KANBAN_STAFF_OPTIONS, KanbanService } from '../../core/kanban/kanban.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TextFieldComponent } from '../../shared/components/text-field/text-field.component';
import { KanbanBoardComponent } from './components/kanban-board.component';
import { KanbanCreateModalComponent } from './components/kanban-create-modal.component';
import { KANBAN_EXPRESSIVE_STYLES } from './components/kanban-expressive.styles';
import { KanbanHeaderComponent } from './components/kanban-header.component';
import { KanbanInspectModalComponent } from './components/kanban-inspect-modal.component';
import { KanbanKpiStripComponent } from './components/kanban-kpi-strip.component';
import { KanbanOpsDialogComponent } from './components/kanban-ops-dialog.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    M3ChipComponent,
    M3SnackbarComponent,
    M3TextFieldComponent,
    KanbanHeaderComponent,
    KanbanKpiStripComponent,
    KanbanBoardComponent,
    KanbanInspectModalComponent,
    KanbanCreateModalComponent,
    KanbanOpsDialogComponent
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [KANBAN_EXPRESSIVE_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface text-main'
  },
  template: `
    <div [class]="workbenchClass()">

      <!-- Accessible Live Announcements for Stage Transitions & New Orders -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ kanbanService.liveAnnouncement() }}
      </div>

      <!-- 1. Kitchen Command Rail -->
      <app-kanban-header
        [currentClock]="currentClock()"
        [buzzerEnabled]="buzzerEnabled()"
        [isLiveActive]="kanbanService.isLiveSimulationActive()"
        [allDayCount]="allDayUnitsCount()"
        [historyCount]="kanbanService.closedHistory().length"
        [isCreateOriginActive]="kanbanService.createMorphOwner() === 'trigger' && kanbanService.activeCreateTrigger() === 'create-order'"
        [isCreateOriginInvisible]="isCreateModalOpen() && kanbanService.activeCreateTrigger() === 'create-order'"
        (toggleBuzzer)="toggleBuzzer()"
        (toggleLive)="kanbanService.toggleLiveSimulation()"
        (openAllDay)="openOpsDialog('allday')"
        (openHistory)="openOpsDialog('history')"
        (createOrder)="openCreateOrderModal()" />

      <!-- 2. Analytical KDS KPI Strip -->
      <app-kanban-kpi-strip [kpi]="kanbanService.kpis()" />

      <!-- 3. Filter Chips & Unified M3 Filled Search -->
      <section
        aria-label="Filtros y búsqueda de comandas"
        class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div role="group" aria-label="Filtrar comandas por estación o urgencia" class="flex items-center flex-wrap gap-2">
          <m3-chip
            type="filter"
            [selected]="kanbanService.activeFilter() === 'all'"
            [count]="kanbanService.filterCounts().all"
            (action)="kanbanService.setFilter('all')">
            Todos
          </m3-chip>

          <m3-chip
            type="filter"
            icon="local_fire_department"
            [selected]="kanbanService.activeFilter() === 'urgent'"
            [count]="kanbanService.filterCounts().urgent"
            (action)="kanbanService.setFilter('urgent')">
            Urgentes / SLA
          </m3-chip>

          <m3-chip
            type="filter"
            icon="skillet"
            [selected]="kanbanService.activeFilter() === 'kitchen'"
            [count]="kanbanService.filterCounts().kitchen"
            (action)="kanbanService.setFilter('kitchen')">
            Cocina Caliente
          </m3-chip>

          <m3-chip
            type="filter"
            icon="ac_unit"
            [selected]="kanbanService.activeFilter() === 'cold_chain'"
            [count]="kanbanService.filterCounts().cold_chain"
            (action)="kanbanService.setFilter('cold_chain')">
            Cadena de Frío
          </m3-chip>

          <m3-chip
            type="filter"
            icon="delivery_dining"
            [selected]="kanbanService.activeFilter() === 'express'"
            [count]="kanbanService.filterCounts().express"
            (action)="kanbanService.setFilter('express')">
            Delivery Express
          </m3-chip>
        </div>

        <search class="w-full lg:w-80 shrink-0 block">
          <m3-text-field
            [id]="'kds-ticket-search'"
            name="ticketSearch"
            variant="filled"
            type="search"
            label="Buscar comanda"
            placeholder="#ticket, mesa, chef o plato..."
            icon="search"
            enterkeyhint="search"
            [clearable]="true"
            [value]="kanbanService.searchQuery()"
            (valueChange)="kanbanService.setSearchQuery($event)"
            (clear)="kanbanService.setSearchQuery('')" />
        </search>
      </section>

      <!-- 4. Adaptive Kanban KDS Board -->
      <app-kanban-board
        [columns]="kanbanService.effectiveColumns()"
        [ordersByStage]="kanbanService.ordersByStage()"
        [draggedOrderId]="kanbanService.draggedOrderId()"
        [dragOverStage]="kanbanService.dragOverStage()"
        [dragOverOrderId]="kanbanService.dragOverOrderId()"
        [activeTransitionOrderId]="kanbanService.activeTransitionOrderId()"
        [isBoardFlipActive]="kanbanService.isBoardFlipActive()"
        [activeInspectTrigger]="kanbanService.activeInspectTrigger()"
        [isInspectModalOpen]="kanbanService.isInspectionOpen()"
        [inspectMorphOwner]="kanbanService.inspectMorphOwner()"
        [hasActiveSearchOrFilter]="kanbanService.activeFilter() !== 'all' || kanbanService.searchQuery().trim().length > 0"
        (orderDragStart)="kanbanService.onDragStart($event.orderId)"
        (orderDragHover)="kanbanService.updateDragTarget($event.stage, $event.targetOrderId)"
        (orderDragDrop)="kanbanService.commitDragDrop($event.stage, $event.beforeOrderId)"
        (orderDragEnd)="kanbanService.onDragEnd()"
        (advanceOrder)="kanbanService.advanceOrder($event)"
        (regressOrder)="kanbanService.regressOrder($event)"
        (dispatchOrder)="kanbanService.dispatchOrder($event)"
        (reorderOrder)="kanbanService.reorderOrderInStage($event.orderId, $event.direction)"
        (inspectOrder)="onInspectOrder($event)"
        (adjustWip)="kanbanService.adjustWipLimit($event.stage, $event.delta)"
        (sortStage)="kanbanService.sortStageByUrgency($event)"
        (clearFilters)="kanbanService.clearSearchAndFilters()" />

      <!-- 5. Portaled Always-Mounted Native Top-Layer Dialogs -->
      <ng-template #kanbanModalsTemplate>
        <app-kanban-inspect-modal
          [open]="kanbanService.isInspectionOpen()"
          [order]="kanbanService.selectedOrder()"
          [staffOptions]="staffOptions"
          [viewTransitionName]="kanbanService.inspectMorphOwner() === 'modal' ? 'dialog-transform' : null"
          (closed)="kanbanService.closeOrderInspection()"
          (advance)="kanbanService.advanceOrder($event)"
          (regress)="kanbanService.regressOrder($event)"
          (moveStage)="kanbanService.moveOrder($event.orderId, $event.stage)"
          (dispatch)="kanbanService.dispatchOrder($event)"
          (cancelOrder)="kanbanService.cancelOrder($event)"
          (assignStaff)="kanbanService.assignOrderStaff($event.orderId, $event.staff)"
          (toggleItem)="kanbanService.toggleOrderItemDone($event.orderId, $event.itemId)"
          (setBlocked)="kanbanService.setOrderBlocked($event.orderId, $event.reason)" />

        <app-kanban-create-modal
          [open]="isCreateModalOpen()"
          [viewTransitionName]="kanbanService.createMorphOwner() === 'modal' ? 'dialog-transform' : null"
          (closed)="closeCreateModal()"
          (submitted)="onCreateOrderSubmit($event)" />

        <app-kanban-ops-dialog
          [open]="kanbanService.isOpsModalOpen()"
          [activeTab]="kanbanService.opsModalTab()"
          [allDayDishes]="kanbanService.allDaySummary()"
          [closedHistory]="kanbanService.closedHistory()"
          (tabChange)="kanbanService.opsModalTab.set($event)"
          (closed)="kanbanService.closeOpsModal()"
          (filterByDish)="onFilterByAllDayDish($event)"
          (restoreOrder)="kanbanService.restoreClosedOrder($event)" />
      </ng-template>

      <!-- Fallback Local Host When App Stage Portal Host Is Absent (e.g. Isolated Tests) -->
      @if (!stageOverlay.hasExternalHost()) {
        <ng-container [ngTemplateOutlet]="kanbanModalsTemplate" />
      }

      <!-- Top-Layer Feedback Snackbar with Undo Action -->
      <m3-snackbar
        [open]="kanbanService.toastMessage() !== null"
        [message]="kanbanService.toastMessage() ?? ''"
        [actionLabel]="kanbanService.canUndoLastRemoval() ? 'Deshacer' : null"
        (action)="kanbanService.undoLastRemoval()"
        (dismissed)="kanbanService.dismissToast()" />
    </div>
  `
})
export class KanbanComponent implements OnInit {
  readonly kanbanService = inject(KanbanService);
  readonly stageOverlay = inject(StageOverlayService);
  private readonly adaptiveLayout = inject(AdaptiveLayoutService);
  readonly staffOptions = KANBAN_STAFF_OPTIONS;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly kanbanModalsTemplate = viewChild<TemplateRef<unknown>>('kanbanModalsTemplate');

  // Kitchen Live Clock & Delegated Service Signals
  readonly currentClock = signal<string>('22:38:00');
  readonly buzzerEnabled = this.kanbanService.buzzerEnabled;
  readonly isCreateModalOpen = this.kanbanService.isCreateModalOpen;
  readonly allDayUnitsCount = computed(() =>
    this.kanbanService.allDaySummary().reduce((sum, dish) => sum + dish.totalQty, 0)
  );
  readonly isAnyModalOpen = computed(
    () =>
      this.kanbanService.isInspectionOpen() ||
      this.isCreateModalOpen() ||
      this.kanbanService.isOpsModalOpen()
  );

  readonly workbenchClass = computed(() =>
    this.adaptiveLayout.isCompact()
      ? 'kds-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 space-y-5 m3-scrollbar'
      : 'kds-workbench flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-7 pb-24 space-y-6 lg:space-y-7 m3-scrollbar'
  );

  private modalReturnFocusEl: HTMLElement | null = null;
  private wasAnyModalOpen = false;
  private isDestroyed = false;

  constructor() {
    effect(() => {
      const tpl = this.kanbanModalsTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    effect(() => {
      const anyOpen = this.isAnyModalOpen();
      this.stageOverlay.setOverlayOpen(anyOpen);

      if (anyOpen) {
        this.wasAnyModalOpen = true;
        return;
      }

      if (this.wasAnyModalOpen) {
        this.wasAnyModalOpen = false;
        const target = this.modalReturnFocusEl;
        this.modalReturnFocusEl = null;
        if (isPlatformBrowser(this.platformId) && target) {
          afterNextRender(
            () => {
              if (!this.isDestroyed && this.document.contains(target) && typeof target.focus === 'function') {
                target.focus({ preventScroll: true });
              }
            },
            { injector: this.injector }
          );
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      const tpl = this.kanbanModalsTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.updateClock();
    this.ngZone.runOutsideAngular(() => {
      const timerId = setInterval(() => {
        this.ngZone.run(() => this.updateClock());
      }, 1000);
      this.destroyRef.onDestroy(() => clearInterval(timerId));
    });
  }

  private updateClock(): void {
    this.currentClock.set(
      new Date().toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );
  }

  private captureActiveFocus(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const active = this.document.activeElement;
    this.modalReturnFocusEl = active instanceof HTMLElement ? active : null;
  }

  toggleBuzzer(): void {
    this.kanbanService.toggleBuzzer();
  }

  onInspectOrder(order: KanbanOrder): void {
    this.captureActiveFocus();
    this.kanbanService.openOrderInspection(order, `ticket-${order.id}`);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.kanbanService.isOpsModalOpen()) {
      this.kanbanService.closeOpsModal();
      return;
    }
    if (this.kanbanService.isInspectionOpen()) {
      this.kanbanService.closeOrderInspection();
      return;
    }
    if (this.isCreateModalOpen()) {
      this.closeCreateModal();
      return;
    }
    if (this.kanbanService.toastMessage() !== null) {
      this.kanbanService.dismissToast();
    }
  }

  openOpsDialog(tab: 'allday' | 'history'): void {
    this.captureActiveFocus();
    this.kanbanService.openOpsModal(tab);
  }

  onFilterByAllDayDish(dishName: string): void {
    this.kanbanService.setSearchQuery(dishName);
    this.kanbanService.closeOpsModal();
  }

  openCreateOrderModal(): void {
    this.captureActiveFocus();
    this.kanbanService.openCreateModal('create-order');
  }

  closeCreateModal(): void {
    this.kanbanService.closeCreateModal();
  }

  onCreateOrderSubmit(dto: CreateOrderDto): void {
    this.kanbanService.createOrder(dto);
    this.closeCreateModal();
  }
}
