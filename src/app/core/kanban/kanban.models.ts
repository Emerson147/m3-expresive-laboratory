export type OrderStage = 'queue' | 'prep' | 'qa' | 'ready';

export const ORDER_STAGES: readonly OrderStage[] = ['queue', 'prep', 'qa', 'ready'];

/** Narrows an arbitrary DOM dataset string into a valid OrderStage. */
export function parseOrderStage(value: string | undefined | null): OrderStage | null {
  return ORDER_STAGES.includes(value as OrderStage) ? (value as OrderStage) : null;
}

export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type OrderCategory = 'kitchen' | 'dispatch' | 'cold_chain' | 'express';

export type OrderChannel = 'dine_in' | 'takeout' | 'delivery';

export type KanbanFilter = 'all' | 'urgent' | 'kitchen' | 'cold_chain' | 'express';

export type KanbanStageTone = 'primary' | 'warning' | 'tertiary' | 'success';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category: OrderCategory;
  price: number;
  notes?: string;
}

export interface KanbanOrder {
  id: string; // e.g. 'ORD-4821'
  ticketNumber: string; // e.g. '#4821'
  tableOrClient: string; // e.g. 'Mesa 4 · Salón Principal'
  channel: OrderChannel;
  category: OrderCategory;
  priority: OrderPriority;
  stage: OrderStage;
  items: OrderItem[];
  totalAmount: number;
  prepTimeTargetMin: number;
  elapsedMinutes: number;
  assignedStaff?: string;
  specialInstructions?: string;
  createdAt: string;
}

export interface KanbanColumn {
  id: OrderStage;
  title: string;
  subtitle: string;
  icon: string;
  tone: KanbanStageTone;
  wipLimit: number;
}

export interface KanbanKpiSummary {
  totalActive: number;
  avgPrepTimeMin: number;
  slaBreachCount: number;
  throughputPerHour: number;
  wipExceededColumns: number;
  readyCount: number;
  onTimeRatePercent: number;
}

export interface KanbanFilterCounts {
  all: number;
  urgent: number;
  kitchen: number;
  cold_chain: number;
  express: number;
}

export interface CreateOrderItemDto {
  name: string;
  quantity: number;
  category?: OrderCategory;
  price: number;
  notes?: string;
}

export interface CreateOrderDto {
  tableOrClient: string;
  channel?: OrderChannel;
  category?: OrderCategory;
  priority?: OrderPriority;
  prepTimeTargetMin?: number;
  assignedStaff?: string;
  specialInstructions?: string;
  items?: CreateOrderItemDto[];
  totalAmount?: number;
}

/** Returns true when an active (non-ready) order has reached or exceeded its SLA target time. */
export function isOrderSlaBreached(order: KanbanOrder): boolean {
  return order.stage !== 'ready' && order.elapsedMinutes >= order.prepTimeTargetMin;
}

/** Returns true when an active order is at >= 75% of its SLA target without yet breaching. */
export function isOrderSlaNearBreach(order: KanbanOrder): boolean {
  return (
    order.stage !== 'ready' &&
    !isOrderSlaBreached(order) &&
    order.elapsedMinutes >= order.prepTimeTargetMin * 0.75
  );
}

/** Computes clamped 0-100 progress percentage of elapsed minutes against prep target. */
export function getOrderSlaProgressPercent(order: KanbanOrder): number {
  if (order.prepTimeTargetMin <= 0) return 100;
  return Math.min(100, Math.round((order.elapsedMinutes / order.prepTimeTargetMin) * 100));
}

/** Computes remaining minutes before SLA breach (0 once breached). */
export function getOrderRemainingMinutes(order: KanbanOrder): number {
  return Math.max(0, order.prepTimeTargetMin - order.elapsedMinutes);
}

/** Pure filter predicate shared between board filtering and reactive chip counters. */
export function matchesKanbanFilter(order: KanbanOrder, filter: KanbanFilter): boolean {
  switch (filter) {
    case 'urgent':
      return order.priority === 'urgent' || order.elapsedMinutes >= order.prepTimeTargetMin;
    case 'kitchen':
      return order.category === 'kitchen';
    case 'cold_chain':
      return order.category === 'cold_chain';
    case 'express':
      return order.category === 'express' || order.channel === 'delivery';
    case 'all':
    default:
      return true;
  }
}

/** Case-insensitive search predicate over ticket metadata, staff, notes, and dishes. */
export function matchesKanbanSearch(order: KanbanOrder, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  if (
    order.id.toLowerCase().includes(q) ||
    order.ticketNumber.toLowerCase().includes(q) ||
    order.tableOrClient.toLowerCase().includes(q) ||
    (order.assignedStaff?.toLowerCase().includes(q) ?? false) ||
    (order.specialInstructions?.toLowerCase().includes(q) ?? false)
  ) {
    return true;
  }

  return order.items.some(item => item.name.toLowerCase().includes(q));
}
