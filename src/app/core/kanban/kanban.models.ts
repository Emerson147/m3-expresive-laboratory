export type OrderStage = 'queue' | 'prep' | 'qa' | 'ready';

export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type OrderCategory = 'kitchen' | 'dispatch' | 'cold_chain' | 'express';

export type KanbanFilter = 'all' | 'urgent' | 'kitchen' | 'cold_chain' | 'express';

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
  tableOrClient: string; // e.g. 'Mesa 4 · Salón A' | 'Delivery Express · UberEats'
  channel: 'dine_in' | 'takeout' | 'delivery';
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
  accentClass: string;
  accentBorderClass: string;
  badgeBgClass: string;
  wipLimit: number;
}

export interface KanbanKpiSummary {
  totalActive: number;
  avgPrepTimeMin: number;
  slaBreachCount: number;
  throughputPerHour: number;
}
