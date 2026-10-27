import { Injectable, signal, computed, inject, ApplicationRef, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  KanbanOrder, 
  KanbanColumn, 
  KanbanFilter, 
  KanbanKpiSummary, 
  OrderStage 
} from './kanban.models';

const INITIAL_ORDERS: KanbanOrder[] = [
  {
    id: 'ORD-4821',
    ticketNumber: '#4821',
    tableOrClient: 'Mesa 4 · Salón Principal',
    channel: 'dine_in',
    category: 'kitchen',
    priority: 'high',
    stage: 'queue',
    items: [
      { id: 'i1', name: 'Lomo Saltado Criollo Premium', quantity: 2, category: 'kitchen', price: 54.00, notes: 'Término medio, papas crocantes' },
      { id: 'i2', name: 'Ceviche Clásico Corvina', quantity: 1, category: 'cold_chain', price: 48.00, notes: 'Ají moderado, sin culantro' },
      { id: 'i3', name: 'Pisco Sour Tradicional', quantity: 2, category: 'kitchen', price: 32.00 }
    ],
    totalAmount: 188.00,
    prepTimeTargetMin: 18,
    elapsedMinutes: 3,
    assignedStaff: 'Chef Carlos Ruiz',
    specialInstructions: 'Comensal alérgico al maní y mariscos cruzados.',
    createdAt: '22:15'
  },
  {
    id: 'ORD-4822',
    ticketNumber: '#4822',
    tableOrClient: 'Delivery Express · Rappi Prime',
    channel: 'delivery',
    category: 'express',
    priority: 'medium',
    stage: 'queue',
    items: [
      { id: 'i4', name: 'Arroz con Mariscos al Wok', quantity: 1, category: 'kitchen', price: 46.00 },
      { id: 'i5', name: 'Causa Rellena de Pulpa de Cangrejo', quantity: 2, category: 'cold_chain', price: 38.00 }
    ],
    totalAmount: 122.00,
    prepTimeTargetMin: 15,
    elapsedMinutes: 4,
    assignedStaff: 'Sous Chef Elena V.',
    createdAt: '22:25'
  },
  {
    id: 'ORD-4823',
    ticketNumber: '#4823',
    tableOrClient: 'Mesa 12 · Terraza Exterior',
    channel: 'dine_in',
    category: 'cold_chain',
    priority: 'medium',
    stage: 'prep',
    items: [
      { id: 'i6', name: 'Tiradito de Atún Nikkei', quantity: 2, category: 'cold_chain', price: 42.00, notes: 'Salsa ponzu extra' },
      { id: 'i7', name: 'Maki Furai Rolls (10 pcs)', quantity: 2, category: 'cold_chain', price: 36.00 }
    ],
    totalAmount: 156.00,
    prepTimeTargetMin: 12,
    elapsedMinutes: 7,
    assignedStaff: 'Itamae Kenji M.',
    createdAt: '22:32'
  },
  {
    id: 'ORD-4824',
    ticketNumber: '#4824',
    tableOrClient: 'Mesa 8 · Salón VIP',
    channel: 'dine_in',
    category: 'kitchen',
    priority: 'urgent',
    stage: 'prep',
    items: [
      { id: 'i8', name: 'Seco de Asado de Tira con Frejoles', quantity: 2, category: 'kitchen', price: 58.00 },
      { id: 'i9', name: 'Chicha Morada Artesanal (Jarra)', quantity: 1, category: 'kitchen', price: 24.00 }
    ],
    totalAmount: 140.00,
    prepTimeTargetMin: 14,
    elapsedMinutes: 16,
    assignedStaff: 'Chef Carlos Ruiz',
    createdAt: '22:33'
  },
  {
    id: 'ORD-4825',
    ticketNumber: '#4825',
    tableOrClient: 'Takeout Pick-Up · Mostrador B',
    channel: 'takeout',
    category: 'dispatch',
    priority: 'high',
    stage: 'qa',
    items: [
      { id: 'i10', name: 'Pollo a la Brasa Imperial (Entero)', quantity: 1, category: 'kitchen', price: 68.00, notes: 'Cremas completas x2' },
      { id: 'i11', name: 'Papas Rústicas Nativas', quantity: 1, category: 'kitchen', price: 16.00 }
    ],
    totalAmount: 84.00,
    prepTimeTargetMin: 14,
    elapsedMinutes: 9,
    assignedStaff: 'Control Calidad: M. Torres',
    createdAt: '22:23'
  },
  {
    id: 'ORD-4826',
    ticketNumber: '#4826',
    tableOrClient: 'Mesa 2 · Barra Lounge',
    channel: 'dine_in',
    category: 'cold_chain',
    priority: 'medium',
    stage: 'qa',
    items: [
      { id: 'i12', name: 'Carpaccio de Pulpo al Olivo', quantity: 1, category: 'cold_chain', price: 39.00 },
      { id: 'i13', name: 'Chilcano de Maracuyá', quantity: 2, category: 'kitchen', price: 28.00 }
    ],
    totalAmount: 95.00,
    prepTimeTargetMin: 12,
    elapsedMinutes: 6,
    assignedStaff: 'Control Calidad: M. Torres',
    createdAt: '22:24'
  },
  {
    id: 'ORD-4827',
    ticketNumber: '#4827',
    tableOrClient: 'Motorizado 14 · PedidosYa',
    channel: 'delivery',
    category: 'express',
    priority: 'medium',
    stage: 'ready',
    items: [
      { id: 'i14', name: 'Tacu Tacu en Salsa de Mariscos', quantity: 1, category: 'kitchen', price: 52.00 },
      { id: 'i15', name: 'Suspiro a la Limeña Tradicional', quantity: 2, category: 'cold_chain', price: 18.00 }
    ],
    totalAmount: 88.00,
    prepTimeTargetMin: 20,
    elapsedMinutes: 13,
    assignedStaff: 'Despacho: Javier L.',
    createdAt: '22:19'
  },
  {
    id: 'ORD-4828',
    ticketNumber: '#4828',
    tableOrClient: 'Mesa 15 · Terraza Exterior',
    channel: 'dine_in',
    category: 'kitchen',
    priority: 'low',
    stage: 'ready',
    items: [
      { id: 'i16', name: 'Ají de Gallina Cremoso', quantity: 2, category: 'kitchen', price: 38.00 },
      { id: 'i17', name: 'Limonada Frozen Hierbaluisa', quantity: 2, category: 'kitchen', price: 16.00 }
    ],
    totalAmount: 108.00,
    prepTimeTargetMin: 15,
    elapsedMinutes: 14,
    assignedStaff: 'Mozo: Andrea S.',
    createdAt: '22:22'
  }
];

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'queue',
    title: 'Cola de Entrada',
    subtitle: 'Ingreso & Comandas',
    icon: 'inbox',
    accentClass: 'text-main bg-surface-high',
    accentBorderClass: 'border-outline-sub',
    badgeBgClass: 'bg-surface-high text-main border border-outline-sub/60',
    wipLimit: 6
  },
  {
    id: 'prep',
    title: 'En Preparación',
    subtitle: 'Wok, Cocina & Frío',
    icon: 'skillet',
    accentClass: 'text-main bg-surface-high',
    accentBorderClass: 'border-outline-sub',
    badgeBgClass: 'bg-surface-high text-main border border-outline-sub/60',
    wipLimit: 4
  },
  {
    id: 'qa',
    title: 'Control Calidad',
    subtitle: 'Embalaje & Auditoría',
    icon: 'fact_check',
    accentClass: 'text-main bg-surface-high',
    accentBorderClass: 'border-outline-sub',
    badgeBgClass: 'bg-surface-high text-main border border-outline-sub/60',
    wipLimit: 4
  },
  {
    id: 'ready',
    title: 'Listo Despacho',
    subtitle: 'Mesa & Courier',
    icon: 'check_circle',
    accentClass: 'text-main bg-surface-high',
    accentBorderClass: 'border-outline-sub',
    badgeBgClass: 'bg-surface-high text-main border border-outline-sub/60',
    wipLimit: 8
  }
];

const STAGE_ORDER: OrderStage[] = ['queue', 'prep', 'qa', 'ready'];

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  // Core reactive state
  readonly orders = signal<KanbanOrder[]>(INITIAL_ORDERS);
  readonly activeFilter = signal<KanbanFilter>('all');
  readonly selectedOrder = signal<KanbanOrder | null>(null);
  readonly isInspectionOpen = signal<boolean>(false);

  // Drag and Drop interactive state
  readonly draggedOrderId = signal<string | null>(null);
  readonly dragOverStage = signal<OrderStage | null>(null);
  readonly activeTransitionOrderId = signal<string | null>(null);
  readonly buzzerEnabled = signal<boolean>(true);

  private audioContext: AudioContext | null = null;

  // Static columns definition
  readonly columns: readonly KanbanColumn[] = KANBAN_COLUMNS;

  // Computed views
  readonly filteredOrders = computed(() => {
    const list = this.orders();
    const filter = this.activeFilter();

    switch (filter) {
      case 'urgent':
        return list.filter(o => o.priority === 'urgent' || o.elapsedMinutes >= o.prepTimeTargetMin);
      case 'kitchen':
        return list.filter(o => o.category === 'kitchen');
      case 'cold_chain':
        return list.filter(o => o.category === 'cold_chain');
      case 'express':
        return list.filter(o => o.category === 'express' || o.channel === 'delivery');
      case 'all':
      default:
        return list;
    }
  });

  readonly kpis = computed<KanbanKpiSummary>(() => {
    const all = this.orders();
    const totalActive = all.filter(o => o.stage !== 'ready').length;
    const slaBreachCount = all.filter(o => o.elapsedMinutes >= o.prepTimeTargetMin && o.stage !== 'ready').length;
    const totalElapsed = all.reduce((acc, curr) => acc + curr.elapsedMinutes, 0);
    const avgPrepTimeMin = all.length ? Math.round((totalElapsed / all.length) * 10) / 10 : 0;
    const throughputPerHour = Math.round(all.filter(o => o.stage === 'ready').length * 4.2);

    return {
      totalActive,
      avgPrepTimeMin,
      slaBreachCount,
      throughputPerHour
    };
  });

  constructor() {
    this.startLiveSimulation();
  }

  getOrdersByStage(stage: OrderStage): KanbanOrder[] {
    return this.filteredOrders().filter(o => o.stage === stage);
  }

  setFilter(filter: KanbanFilter): void {
    this.runViewTransition(() => {
      this.activeFilter.set(filter);
    });
  }

  toggleBuzzer(): void {
    this.buzzerEnabled.update(v => !v);
  }

  playKdsChime(type: 'created' | 'ready' | 'advance'): void {
    if (!isPlatformBrowser(this.platformId) || !this.buzzerEnabled()) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'suspended') {
        this.audioContext = new AudioCtx();
      }

      const ctx = this.audioContext;
      const now = ctx.currentTime;

      if (type === 'ready') {
        // Harmonic double chime (F5 -> A5: 698.46Hz -> 880Hz)
        this.playTone(ctx, 698.46, now, 0.28, 0.08);
        this.playTone(ctx, 880.00, now + 0.12, 0.45, 0.1);
      } else if (type === 'created') {
        // Warm bell chord (C5 -> G5: 523.25Hz -> 783.99Hz)
        this.playTone(ctx, 523.25, now, 0.22, 0.06);
        this.playTone(ctx, 783.99, now + 0.08, 0.35, 0.08);
      } else {
        // Subtle tactile tick (E5: 659.25Hz)
        this.playTone(ctx, 659.25, now, 0.12, 0.04);
      }
    } catch {
      // Audio playback policy silent fallback
    }
  }

  private playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, maxGain: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  moveOrder(orderId: string, targetStage: OrderStage): void {
    const current = this.orders().find(o => o.id === orderId);
    if (!current || current.stage === targetStage) return;

    this.activeTransitionOrderId.set(orderId);

    if (targetStage === 'ready') {
      this.playKdsChime('ready');
    } else {
      this.playKdsChime('advance');
    }

    this.runViewTransition(
      () => {
        this.orders.update(list =>
          list.map(order => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              stage: targetStage
            };
          })
        );
      },
      () => {
        this.activeTransitionOrderId.set(null);
      }
    );
  }

  advanceOrder(orderId: string): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const currentIndex = STAGE_ORDER.indexOf(order.stage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      this.moveOrder(orderId, STAGE_ORDER[currentIndex + 1]);
    }
  }

  regressOrder(orderId: string): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const currentIndex = STAGE_ORDER.indexOf(order.stage);
    if (currentIndex > 0) {
      this.moveOrder(orderId, STAGE_ORDER[currentIndex - 1]);
    }
  }

  openOrderInspection(order: KanbanOrder): void {
    this.selectedOrder.set(order);
    this.isInspectionOpen.set(true);
  }

  closeOrderInspection(): void {
    this.isInspectionOpen.set(false);
    this.selectedOrder.set(null);
  }

  // Drag and Drop Event Handlers
  onDragStart(orderId: string, event?: DragEvent): void {
    this.draggedOrderId.set(orderId);
    if (event?.dataTransfer) {
      event.dataTransfer.setData('text/plain', orderId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(stage: OrderStage, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.dragOverStage() !== stage) {
      this.dragOverStage.set(stage);
    }
  }

  onDragLeave(stage: OrderStage): void {
    if (this.dragOverStage() === stage) {
      this.dragOverStage.set(null);
    }
  }

  onDrop(targetStage: OrderStage, event: DragEvent): void {
    event.preventDefault();
    const orderId = this.draggedOrderId() || event.dataTransfer?.getData('text/plain');
    this.dragOverStage.set(null);
    this.draggedOrderId.set(null);

    if (orderId) {
      this.moveOrder(orderId, targetStage);
    }
  }

  onDragEnd(): void {
    this.draggedOrderId.set(null);
    this.dragOverStage.set(null);
  }

  createOrder(orderData: Partial<KanbanOrder>): void {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: KanbanOrder = {
      id,
      ticketNumber: `#${id.split('-')[1]}`,
      tableOrClient: orderData.tableOrClient || 'Mesa 1 · General',
      channel: orderData.channel || 'dine_in',
      category: orderData.category || 'kitchen',
      priority: orderData.priority || 'medium',
      stage: 'queue',
      items: orderData.items || [
        { id: 'new-1', name: 'Plato Especial del Chef', quantity: 1, category: 'kitchen', price: 45.00 }
      ],
      totalAmount: orderData.totalAmount || 45.00,
      prepTimeTargetMin: orderData.prepTimeTargetMin || 15,
      elapsedMinutes: 0,
      assignedStaff: 'Asignación pendiente',
      specialInstructions: orderData.specialInstructions || '',
      createdAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    };

    this.playKdsChime('created');
    this.runViewTransition(() => {
      this.orders.update(list => [newOrder, ...list]);
    });
  }

  private runViewTransition(update: () => void, cleanup?: () => void): void {
    const doc = typeof document !== 'undefined' ? (document as any) : null;
    if (doc && typeof doc.startViewTransition === 'function') {
      const transition = doc.startViewTransition(() => {
        update();
        this.appRef.tick();
      });
      transition.finished.finally(() => {
        cleanup?.();
        this.appRef.tick();
      });
    } else {
      update();
      cleanup?.();
    }
  }

  private startLiveSimulation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Simulate realistic minute tick every 30 seconds with a realistic ceiling
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.ngZone.run(() => {
          this.orders.update(list =>
            list.map(order => {
              if (order.stage === 'ready') return order;
              if (order.elapsedMinutes < order.prepTimeTargetMin + 3 && Math.random() > 0.65) {
                return {
                  ...order,
                  elapsedMinutes: order.elapsedMinutes + 1
                };
              }
              return order;
            })
          );
        });
      }, 30000);
    });
  }
}
