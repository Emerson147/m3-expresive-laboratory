import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { StageOverlayService } from '../dialog/stage-overlay.service';
import { KanbanService } from './kanban.service';

describe('KanbanService', () => {
  let service: KanbanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KanbanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with orders and 4 domain-clean columns', () => {
    expect(service.orders().length).toBeGreaterThan(0);
    expect(service.columns.length).toBe(4);
    expect(service.columns.map(c => c.id)).toEqual(['queue', 'prep', 'qa', 'ready']);
    expect(service.columns.map(c => c.tone)).toEqual(['primary', 'warning', 'tertiary', 'success']);
  });

  it('should compute KPIs and filter counts accurately', () => {
    const kpis = service.kpis();
    expect(kpis.totalActive).toBeGreaterThan(0);
    expect(kpis.avgPrepTimeMin).toBeGreaterThan(0);
    expect(kpis.throughputPerHour).toBeGreaterThanOrEqual(0);
    expect(kpis.wipExceededColumns).toBeGreaterThanOrEqual(0);
    expect(kpis.readyCount).toBe(2);
    expect(kpis.onTimeRatePercent).toBeGreaterThan(0);

    const counts = service.filterCounts();
    expect(counts.all).toBe(service.orders().length);
    expect(counts.kitchen).toBeGreaterThan(0);
    expect(counts.cold_chain).toBeGreaterThan(0);
    expect(counts.express).toBeGreaterThan(0);
  });

  it('should filter orders by priority, category, and search query via ordersByStage', () => {
    service.setFilter('urgent');
    const urgentOrders = service.filteredOrders();
    expect(urgentOrders.every(o => o.priority === 'urgent' || o.elapsedMinutes >= o.prepTimeTargetMin)).toBe(true);

    service.setFilter('kitchen');
    const kitchenOrders = service.filteredOrders();
    expect(kitchenOrders.every(o => o.category === 'kitchen')).toBe(true);
    expect(service.ordersByStage().queue).toEqual(service.getOrdersByStage('queue'));

    service.setFilter('all');
    service.setSearchQuery('Lomo');
    expect(service.filteredOrders().some(o => o.id === 'ORD-4821')).toBe(true);
    expect(service.filteredOrders().length).toBe(1);

    service.setSearchQuery('');
    expect(service.filteredOrders().length).toBe(service.orders().length);
  });

  it('should advance and regress order stage sequentially with toast and live announcements', () => {
    const testOrder = service.orders().find(o => o.stage === 'queue');
    expect(testOrder).toBeDefined();
    if (!testOrder) return;

    service.advanceOrder(testOrder.id);
    let updated = service.orders().find(o => o.id === testOrder.id);
    expect(updated?.stage).toBe('prep');
    expect(service.toastMessage()).toContain(testOrder.ticketNumber);
    expect(service.liveAnnouncement()).toContain('En Preparación');

    service.advanceOrder(testOrder.id);
    updated = service.orders().find(o => o.id === testOrder.id);
    expect(updated?.stage).toBe('qa');

    service.regressOrder(testOrder.id);
    updated = service.orders().find(o => o.id === testOrder.id);
    expect(updated?.stage).toBe('prep');
  });

  it('should create sequential orders computing total from custom or category items', () => {
    const first = service.createOrder({
      tableOrClient: 'Mesa 10 · Terraza',
      category: 'cold_chain',
      priority: 'high',
      items: [
        { name: 'Tiradito Nikkei', quantity: 2, price: 40.00 },
        { name: 'Chilcano Clásico', quantity: 1, price: 25.00 }
      ]
    });
    const second = service.createOrder({
      tableOrClient: 'Delivery #90',
      category: 'express',
      priority: 'urgent'
    });

    expect(first.id).toBe('ORD-4829');
    expect(first.ticketNumber).toBe('#4829');
    expect(first.totalAmount).toBe(105);
    expect(second.id).toBe('ORD-4830');
    expect(second.channel).toBe('delivery');
    expect(second.items.length).toBeGreaterThan(0);
    expect(service.toastMessage()).toContain('#4830');
  });

  it('should handle drag-and-drop state lifecycle', () => {
    const orderId = 'ORD-4821';
    service.onDragStart(orderId);
    expect(service.draggedOrderId()).toBe(orderId);

    const mockEvent = {
      preventDefault: () => {},
      dataTransfer: { dropEffect: 'none' }
    } as unknown as DragEvent;

    service.onDragOver('ready', mockEvent);
    expect(service.dragOverStage()).toBe('ready');

    service.onDrop('ready', mockEvent);
    expect(service.draggedOrderId()).toBeNull();
    expect(service.dragOverStage()).toBeNull();

    const moved = service.orders().find(o => o.id === orderId);
    expect(moved?.stage).toBe('ready');
  });

  it('should keep selectedOrder live when moving while inspection is open and reset on close', () => {
    const order = service.orders()[0];
    service.openOrderInspection(order);
    expect(service.isInspectionOpen()).toBe(true);
    expect(service.selectedOrder()?.id).toBe(order.id);

    service.advanceOrder(order.id);
    expect(service.selectedOrder()?.stage).toBe('prep');

    service.closeOrderInspection();
    expect(service.isInspectionOpen()).toBe(false);
    expect(service.selectedOrder()).toBeNull();
  });

  it('should manage create modal open/close and live simulation toggle', () => {
    service.openCreateModal('btn-new');
    expect(service.isCreateModalOpen()).toBe(true);
    expect(service.activeCreateTrigger()).toBe('btn-new');

    service.closeCreateModal();
    expect(service.isCreateModalOpen()).toBe(false);

    expect(service.isLiveSimulationActive()).toBe(true);
    service.toggleLiveSimulation();
    expect(service.isLiveSimulationActive()).toBe(false);
  });

  it('should prevent dragleave flicker over child elements and support same-stage reordering', () => {
    const child = document.createElement('div');
    const lane = document.createElement('div');
    lane.appendChild(child);

    service.onDragStart('ORD-4822');
    service.onDragOver('queue', {
      preventDefault: () => {},
      dataTransfer: { dropEffect: 'none' }
    } as unknown as DragEvent, 'ORD-4821');

    expect(service.dragOverStage()).toBe('queue');
    expect(service.dragOverOrderId()).toBe('ORD-4821');

    service.onDragLeave('queue', {
      currentTarget: lane,
      relatedTarget: child
    } as unknown as DragEvent);
    expect(service.dragOverStage()).toBe('queue');

    service.onDrop('queue', {
      preventDefault: () => {},
      dataTransfer: { getData: () => 'ORD-4822' }
    } as unknown as DragEvent, 'ORD-4821');

    expect(service.ordersByStage().queue.map(o => o.id)).toEqual(['ORD-4822', 'ORD-4821']);

    service.reorderOrderInStage('ORD-4822', 'down');
    expect(service.ordersByStage().queue.map(o => o.id)).toEqual(['ORD-4821', 'ORD-4822']);
  });

  it('should dispatch ready orders, assign staff, and cancel orders cleanly', () => {
    const target = service.orders()[0];
    service.openOrderInspection(target);

    service.assignOrderStaff(target.id, 'Sous Chef Elena V.');
    expect(service.selectedOrder()?.assignedStaff).toBe('Sous Chef Elena V.');

    const readyOrder = service.ordersByStage().ready[0];
    const beforeCount = service.orders().length;
    service.dispatchOrder(readyOrder.id);

    expect(service.orders().length).toBe(beforeCount - 1);
    expect(service.dispatchedCount()).toBe(1);
    expect(service.orders().some(o => o.id === readyOrder.id)).toBe(false);

    service.cancelOrder(target.id);
    expect(service.orders().some(o => o.id === target.id)).toBe(false);
    expect(service.isInspectionOpen()).toBe(false);
  });

  it('should handle pointer drag helpers updateDragTarget and commitDragDrop', () => {
    service.onDragStart('ORD-4821');
    service.updateDragTarget('prep', 'ORD-4823');
    expect(service.dragOverStage()).toBe('prep');
    expect(service.dragOverOrderId()).toBe('ORD-4823');

    service.commitDragDrop('prep', 'ORD-4823');
    expect(service.draggedOrderId()).toBeNull();
    expect(service.dragOverStage()).toBeNull();
    expect(service.dragOverOrderId()).toBeNull();
    expect(service.ordersByStage().prep.map(o => o.id)[0]).toBe('ORD-4821');
  });

  it('should scope board transitions with vt-board-flip rootClass so global root fades never blink', () => {
    const stageOverlay = TestBed.inject(StageOverlayService);
    const spy = vi.spyOn(stageOverlay, 'runViewTransition');

    service.reorderOrderInStage('ORD-4821', 'down');
    service.moveOrder('ORD-4821', 'prep');
    service.setFilter('kitchen');
    service.setFilter('all');
    service.createOrder({ tableOrClient: 'Mesa 55', category: 'kitchen', priority: 'high' });
    const readyOrder = service.ordersByStage().ready[0];
    service.dispatchOrder(readyOrder.id);

    expect(spy).toHaveBeenCalledTimes(6);
    for (const call of spy.mock.calls) {
      expect(call[2]).toEqual({ rootClass: 'vt-board-flip' });
    }
  });
});
