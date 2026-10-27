import { TestBed } from '@angular/core/testing';
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

  it('should initialize with orders and 4 columns', () => {
    expect(service.orders().length).toBeGreaterThan(0);
    expect(service.columns.length).toBe(4);
    expect(service.columns.map(c => c.id)).toEqual(['queue', 'prep', 'qa', 'ready']);
  });

  it('should compute KPIs accurately', () => {
    const kpis = service.kpis();
    expect(kpis.totalActive).toBeGreaterThan(0);
    expect(kpis.avgPrepTimeMin).toBeGreaterThan(0);
    expect(kpis.throughputPerHour).toBeGreaterThanOrEqual(0);
  });

  it('should filter orders by priority and category', () => {
    service.setFilter('urgent');
    const urgentOrders = service.filteredOrders();
    expect(urgentOrders.every(o => o.priority === 'urgent' || o.elapsedMinutes >= o.prepTimeTargetMin)).toBe(true);

    service.setFilter('kitchen');
    const kitchenOrders = service.filteredOrders();
    expect(kitchenOrders.every(o => o.category === 'kitchen')).toBe(true);

    service.setFilter('all');
    expect(service.filteredOrders().length).toBe(service.orders().length);
  });

  it('should advance and regress order stage sequentially', () => {
    const testOrder = service.orders().find(o => o.stage === 'queue');
    expect(testOrder).toBeDefined();
    if (!testOrder) return;

    service.advanceOrder(testOrder.id);
    let updated = service.orders().find(o => o.id === testOrder.id);
    expect(updated?.stage).toBe('prep');

    service.advanceOrder(testOrder.id);
    updated = service.orders().find(o => o.id === testOrder.id);
    expect(updated?.stage).toBe('qa');

    service.regressOrder(testOrder.id);
    updated = service.orders().find(o => o.id === testOrder.id);
    expect(updated?.stage).toBe('prep');
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

  it('should open and close order inspection modal', () => {
    const order = service.orders()[0];
    service.openOrderInspection(order);
    expect(service.isInspectionOpen()).toBe(true);
    expect(service.selectedOrder()?.id).toBe(order.id);

    service.closeOrderInspection();
    expect(service.isInspectionOpen()).toBe(false);
    expect(service.selectedOrder()).toBeNull();
  });
});
