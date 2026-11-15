import {
  Injectable,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  NgZone,
  DestroyRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  KanbanOrder,
  KanbanColumn,
  KanbanFilter,
  KanbanFilterCounts,
  KanbanKpiSummary,
  OrderStage,
  OrderCategory,
  OrderItem,
  CreateOrderDto,
  CreateOrderItemDto,
  isOrderSlaBreached,
  matchesKanbanFilter,
  matchesKanbanSearch
} from './kanban.models';
import { StageOverlayService } from '../dialog/stage-overlay.service';

export const KANBAN_LIVE_TICK_MS = 30_000;

export const KANBAN_STAFF_OPTIONS: readonly string[] = [
  'Asignación pendiente',
  'Chef Carlos Ruiz',
  'Sous Chef Elena V.',
  'Itamae Kenji M.',
  'Control Calidad: M. Torres',
  'Despacho: Javier L.',
  'Mozo: Andrea S.'
];

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

export const KANBAN_COLUMNS: readonly KanbanColumn[] = [
  {
    id: 'queue',
    title: 'Cola de Entrada',
    subtitle: 'Ingreso & Comandas',
    icon: 'inbox',
    tone: 'primary',
    wipLimit: 6
  },
  {
    id: 'prep',
    title: 'En Preparación',
    subtitle: 'Wok, Cocina & Frío',
    icon: 'skillet',
    tone: 'warning',
    wipLimit: 4
  },
  {
    id: 'qa',
    title: 'Control Calidad',
    subtitle: 'Embalaje & Auditoría',
    icon: 'fact_check',
    tone: 'tertiary',
    wipLimit: 4
  },
  {
    id: 'ready',
    title: 'Listo Despacho',
    subtitle: 'Mesa & Courier',
    icon: 'check_circle',
    tone: 'success',
    wipLimit: 8
  }
];

const STAGE_ORDER: readonly OrderStage[] = ['queue', 'prep', 'qa', 'ready'];

const STAGE_TITLES: Record<OrderStage, string> = {
  queue: 'Cola de Entrada',
  prep: 'En Preparación',
  qa: 'Control Calidad',
  ready: 'Listo Despacho'
};

const DEFAULT_CATEGORY_ITEMS: Record<OrderCategory, { name: string; price: number }[]> = {
  kitchen: [
    { name: 'Lomo Saltado al Wok', price: 52.00 },
    { name: 'Chicha Morada Artesanal', price: 14.00 }
  ],
  cold_chain: [
    { name: 'Ceviche Mixto con Chicharrón', price: 48.00 },
    { name: 'Maracuyá Sour', price: 16.00 }
  ],
  express: [
    { name: 'Arroz Chaufa Amazónico', price: 42.00 },
    { name: 'Empaque Térmico Sellado', price: 6.00 }
  ],
  dispatch: [
    { name: 'Pollo a la Brasa 1/2', price: 38.00 },
    { name: 'Papas Rústicas Nativas', price: 16.00 }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stageOverlay = inject(StageOverlayService);

  private nextOrderSequence = 4829;
  private audioContext: AudioContext | null = null;

  // Core reactive state
  readonly orders = signal<KanbanOrder[]>(INITIAL_ORDERS);
  readonly activeFilter = signal<KanbanFilter>('all');
  readonly searchQuery = signal<string>('');
  readonly selectedOrderId = signal<string | null>(null);
  readonly isInspectionOpen = signal<boolean>(false);
  readonly isCreateModalOpen = signal<boolean>(false);

  // Modal & FLIP View Transition coordination
  readonly activeInspectTrigger = signal<string | null>(null);
  readonly activeCreateTrigger = signal<string | null>(null);
  readonly isModalTransitioning = signal<boolean>(false);
  readonly isBoardFlipActive = signal<boolean>(false);

  // Drag and Drop / Interactive state
  readonly draggedOrderId = signal<string | null>(null);
  readonly dragOverStage = signal<OrderStage | null>(null);
  readonly dragOverOrderId = signal<string | null>(null);
  readonly activeTransitionOrderId = signal<string | null>(null);
  readonly dispatchedCount = signal<number>(0);
  readonly buzzerEnabled = signal<boolean>(true);
  readonly isLiveSimulationActive = signal<boolean>(true);

  // User feedback notifications & assistive announcements
  readonly toastMessage = signal<string | null>(null);
  readonly liveAnnouncement = signal<string>('');

  // Static columns definition (pure domain data without Tailwind presentation strings)
  readonly columns: readonly KanbanColumn[] = KANBAN_COLUMNS;

  /** Reactive selected ticket linked to the live order list (stays synchronized on stage/SLA updates). */
  readonly selectedOrder = computed<KanbanOrder | null>(() => {
    const id = this.selectedOrderId();
    if (!id) return null;
    return this.orders().find(o => o.id === id) ?? null;
  });

  // Computed views
  readonly filteredOrders = computed(() => {
    const list = this.orders();
    const filter = this.activeFilter();
    const query = this.searchQuery();
    return list.filter(o => matchesKanbanFilter(o, filter) && matchesKanbanSearch(o, query));
  });

  /** Single-pass stage grouping to avoid redundant per-column filters during template checks. */
  readonly ordersByStage = computed<Record<OrderStage, KanbanOrder[]>>(() => {
    const grouped: Record<OrderStage, KanbanOrder[]> = {
      queue: [],
      prep: [],
      qa: [],
      ready: []
    };
    for (const order of this.filteredOrders()) {
      grouped[order.stage].push(order);
    }
    return grouped;
  });

  readonly filterCounts = computed<KanbanFilterCounts>(() => {
    const list = this.orders();
    return {
      all: list.length,
      urgent: list.filter(o => matchesKanbanFilter(o, 'urgent')).length,
      kitchen: list.filter(o => matchesKanbanFilter(o, 'kitchen')).length,
      cold_chain: list.filter(o => matchesKanbanFilter(o, 'cold_chain')).length,
      express: list.filter(o => matchesKanbanFilter(o, 'express')).length
    };
  });

  readonly kpis = computed<KanbanKpiSummary>(() => {
    const all = this.orders();
    const byStage = this.ordersByStage();
    const totalActive = all.filter(o => o.stage !== 'ready').length;
    const readyCount = all.length - totalActive;
    const slaBreachCount = all.filter(isOrderSlaBreached).length;
    const totalElapsed = all.reduce((acc, curr) => acc + curr.elapsedMinutes, 0);
    const avgPrepTimeMin = all.length ? Math.round((totalElapsed / all.length) * 10) / 10 : 0;
    const throughputPerHour = Math.round((readyCount + this.dispatchedCount()) * 4.2);
    const wipExceededColumns = this.columns.filter(col => byStage[col.id].length > col.wipLimit).length;
    const onTimeRatePercent = all.length
      ? Math.round(((all.length - slaBreachCount) / all.length) * 100)
      : 100;

    return {
      totalActive,
      avgPrepTimeMin,
      slaBreachCount,
      throughputPerHour,
      wipExceededColumns,
      readyCount,
      onTimeRatePercent
    };
  });

  constructor() {
    this.startLiveSimulation();
  }

  getOrdersByStage(stage: OrderStage): KanbanOrder[] {
    return this.ordersByStage()[stage];
  }

  setFilter(filter: KanbanFilter): void {
    if (this.activeFilter() === filter) return;
    this.isBoardFlipActive.set(true);
    this.stageOverlay.runViewTransition(
      () => this.activeFilter.set(filter),
      () => this.isBoardFlipActive.set(false),
      { rootClass: 'vt-board-flip' }
    );
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  toggleBuzzer(): void {
    this.buzzerEnabled.update(v => !v);
  }

  toggleLiveSimulation(): void {
    this.isLiveSimulationActive.update(v => !v);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
  }

  playKdsChime(type: 'created' | 'ready' | 'advance'): void {
    if (!isPlatformBrowser(this.platformId) || !this.buzzerEnabled()) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

  moveOrder(orderId: string, targetStage: OrderStage, beforeOrderId?: string): void {
    const current = this.orders().find(o => o.id === orderId);
    if (!current) return;

    const isSameStageReorder =
      current.stage === targetStage && Boolean(beforeOrderId) && beforeOrderId !== orderId;
    if (current.stage === targetStage && !isSameStageReorder) return;

    this.activeTransitionOrderId.set(orderId);
    this.isBoardFlipActive.set(true);

    if (current.stage !== targetStage) {
      this.playKdsChime(targetStage === 'ready' ? 'ready' : 'advance');
    }

    let statusMsg: string;
    if (isSameStageReorder) {
      statusMsg = `Comanda ${current.ticketNumber} reordenada en ${STAGE_TITLES[targetStage]}.`;
    } else if (targetStage === 'ready') {
      statusMsg = `Comanda ${current.ticketNumber} lista para despacho.`;
    } else {
      statusMsg = `Comanda ${current.ticketNumber} movida a ${STAGE_TITLES[targetStage]}.`;
    }

    this.stageOverlay.runViewTransition(
      () => {
        this.orders.update(list => this.applyOrderMove(list, orderId, targetStage, beforeOrderId));
        this.liveAnnouncement.set(statusMsg);
        this.toastMessage.set(statusMsg);
      },
      () => {
        this.activeTransitionOrderId.set(null);
        this.isBoardFlipActive.set(false);
      },
      { rootClass: 'vt-board-flip' }
    );
  }

  reorderOrderInStage(orderId: string, direction: 'up' | 'down'): void {
    const current = this.orders().find(o => o.id === orderId);
    if (!current) return;

    const stageOrders = this.ordersByStage()[current.stage];
    const currentIdx = stageOrders.findIndex(o => o.id === orderId);
    const partnerIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (currentIdx < 0 || partnerIdx < 0 || partnerIdx >= stageOrders.length) return;

    const partnerId = stageOrders[partnerIdx].id;
    const statusMsg = `Comanda ${current.ticketNumber} reordenada en ${STAGE_TITLES[current.stage]}.`;

    this.activeTransitionOrderId.set(orderId);
    this.isBoardFlipActive.set(true);

    this.stageOverlay.runViewTransition(
      () => {
        this.orders.update(list => {
          const idxA = list.findIndex(o => o.id === orderId);
          const idxB = list.findIndex(o => o.id === partnerId);
          if (idxA < 0 || idxB < 0) return list;
          const next = [...list];
          [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
          return next;
        });
        this.liveAnnouncement.set(statusMsg);
      },
      () => {
        this.activeTransitionOrderId.set(null);
        this.isBoardFlipActive.set(false);
      },
      { rootClass: 'vt-board-flip' }
    );
  }

  dispatchOrder(orderId: string): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    this.playKdsChime('ready');
    this.removeOrderFromBoard(
      orderId,
      `Comanda ${order.ticketNumber} entregada y cerrada del tablero.`,
      true
    );
  }

  cancelOrder(orderId: string): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    this.removeOrderFromBoard(orderId, `Comanda ${order.ticketNumber} anulada del flujo.`, false);
  }

  private removeOrderFromBoard(orderId: string, notice: string, countAsDispatched: boolean): void {
    this.isBoardFlipActive.set(true);

    this.stageOverlay.runViewTransition(
      () => {
        this.orders.update(list => list.filter(o => o.id !== orderId));
        if (countAsDispatched) {
          this.dispatchedCount.update(count => count + 1);
        }
        if (this.selectedOrderId() === orderId) {
          this.isInspectionOpen.set(false);
          this.selectedOrderId.set(null);
          this.stageOverlay.setOverlayOpen(this.isCreateModalOpen());
        }
        this.liveAnnouncement.set(notice);
        this.toastMessage.set(notice);
      },
      () => {
        this.isBoardFlipActive.set(false);
      },
      { rootClass: 'vt-board-flip' }
    );
  }

  assignOrderStaff(orderId: string, staff: string): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const cleanStaff = staff.trim() || 'Asignación pendiente';
    if (order.assignedStaff === cleanStaff) return;

    this.orders.update(list =>
      list.map(o => (o.id === orderId ? { ...o, assignedStaff: cleanStaff } : o))
    );
    const notice = `Responsable de ${order.ticketNumber}: ${cleanStaff}.`;
    this.liveAnnouncement.set(notice);
    this.toastMessage.set(notice);
  }

  private applyOrderMove(
    list: KanbanOrder[],
    orderId: string,
    targetStage: OrderStage,
    beforeOrderId?: string
  ): KanbanOrder[] {
    const moving = list.find(o => o.id === orderId);
    if (!moving) return list;

    const updated: KanbanOrder = { ...moving, stage: targetStage };
    const withoutMoving = list.filter(o => o.id !== orderId);

    if (beforeOrderId && beforeOrderId !== orderId) {
      const targetIndex = withoutMoving.findIndex(o => o.id === beforeOrderId);
      if (targetIndex >= 0) {
        const next = [...withoutMoving];
        next.splice(targetIndex, 0, updated);
        return next;
      }
    }

    return [...withoutMoving, updated];
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

  openOrderInspection(order: KanbanOrder, triggerId?: string): void {
    this.activeInspectTrigger.set(triggerId ?? `ticket-${order.id}`);
    this.isModalTransitioning.set(true);

    // Guard against bluring/inerting unportaled in-stage dialogs before Phase 3 external host portal is mounted.
    const shouldRecessStage = Boolean(this.stageOverlay.overlayTemplate());

    this.stageOverlay.runViewTransition(
      () => {
        this.selectedOrderId.set(order.id);
        this.isInspectionOpen.set(true);
        if (shouldRecessStage) {
          this.stageOverlay.setOverlayOpen(true);
        }
      },
      () => {
        this.isModalTransitioning.set(false);
      }
    );
  }

  closeOrderInspection(): void {
    if (!this.isInspectionOpen()) return;
    this.isModalTransitioning.set(true);

    const shouldSyncOverlay = Boolean(this.stageOverlay.overlayTemplate()) && !this.isCreateModalOpen();

    this.stageOverlay.runViewTransition(
      () => {
        this.isInspectionOpen.set(false);
        this.selectedOrderId.set(null);
        if (shouldSyncOverlay) {
          this.stageOverlay.setOverlayOpen(false);
        }
      },
      () => {
        this.isModalTransitioning.set(false);
        this.activeInspectTrigger.set(null);
      },
      { isExiting: true }
    );
  }

  openCreateModal(triggerId = 'create-order'): void {
    this.activeCreateTrigger.set(triggerId);
    this.isModalTransitioning.set(true);

    const shouldRecessStage = Boolean(this.stageOverlay.overlayTemplate());

    this.stageOverlay.runViewTransition(
      () => {
        this.isCreateModalOpen.set(true);
        if (shouldRecessStage) {
          this.stageOverlay.setOverlayOpen(true);
        }
      },
      () => {
        this.isModalTransitioning.set(false);
      }
    );
  }

  closeCreateModal(): void {
    if (!this.isCreateModalOpen()) return;
    this.isModalTransitioning.set(true);

    const shouldSyncOverlay = Boolean(this.stageOverlay.overlayTemplate()) && !this.isInspectionOpen();

    this.stageOverlay.runViewTransition(
      () => {
        this.isCreateModalOpen.set(false);
        if (shouldSyncOverlay) {
          this.stageOverlay.setOverlayOpen(false);
        }
      },
      () => {
        this.isModalTransitioning.set(false);
        this.activeCreateTrigger.set(null);
      },
      { isExiting: true }
    );
  }

  // Drag and Drop Event Handlers (shared across Pointer Events and HTML5 drag events)
  onDragStart(orderId: string, event?: DragEvent): void {
    this.draggedOrderId.set(orderId);
    if (event?.dataTransfer) {
      event.dataTransfer.setData('text/plain', orderId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  updateDragTarget(stage: OrderStage | null, targetOrderId?: string | null): void {
    if (this.dragOverStage() !== stage) {
      this.dragOverStage.set(stage);
    }
    const nextOrderTarget =
      stage && targetOrderId && targetOrderId !== this.draggedOrderId() ? targetOrderId : null;
    if (this.dragOverOrderId() !== nextOrderTarget) {
      this.dragOverOrderId.set(nextOrderTarget);
    }
  }

  commitDragDrop(
    targetStage: OrderStage | null,
    beforeOrderId?: string | null,
    fallbackOrderId?: string | null
  ): void {
    const orderId = this.draggedOrderId() || fallbackOrderId || null;
    this.dragOverStage.set(null);
    this.dragOverOrderId.set(null);
    this.draggedOrderId.set(null);

    if (orderId && targetStage) {
      this.moveOrder(orderId, targetStage, beforeOrderId ?? undefined);
    }
  }

  onDragOver(stage: OrderStage, event: DragEvent, targetOrderId?: string | null): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.updateDragTarget(stage, targetOrderId);
  }

  onDragLeave(stage: OrderStage, event?: DragEvent): void {
    const currentTarget = event?.currentTarget as HTMLElement | null;
    const related = event?.relatedTarget as Node | null;
    if (currentTarget && related && currentTarget.contains(related)) {
      return;
    }

    if (this.dragOverStage() === stage) {
      this.dragOverStage.set(null);
      this.dragOverOrderId.set(null);
    }
  }

  onDrop(targetStage: OrderStage, event: DragEvent, beforeOrderId?: string): void {
    event.preventDefault();
    const fallbackOrderId =
      !this.draggedOrderId() && typeof event.dataTransfer?.getData === 'function'
        ? event.dataTransfer.getData('text/plain')
        : null;
    this.commitDragDrop(targetStage, beforeOrderId, fallbackOrderId);
  }

  onDragEnd(): void {
    this.draggedOrderId.set(null);
    this.dragOverStage.set(null);
    this.dragOverOrderId.set(null);
  }

  createOrder(orderData: CreateOrderDto | Partial<KanbanOrder>): KanbanOrder {
    const seq = this.nextOrderSequence++;
    const id = `ORD-${seq}`;
    const category: OrderCategory = orderData.category || 'kitchen';
    const rawItems: readonly (CreateOrderItemDto | OrderItem)[] = orderData.items?.length
      ? orderData.items
      : DEFAULT_CATEGORY_ITEMS[category].map(preset => ({
          name: preset.name,
          quantity: 1,
          category,
          price: preset.price
        }));

    const items: OrderItem[] = rawItems.map((item, idx) => {
      const existingId = 'id' in item && typeof item.id === 'string' && item.id ? item.id : null;
      return {
        id: existingId ?? `item-${seq}-${idx + 1}`,
        name: item.name.trim() || 'Plato Especial del Chef',
        quantity: Math.max(1, Math.round(item.quantity || 1)),
        category: item.category || category,
        price: Math.max(0, Number(item.price) || 0),
        notes: item.notes?.trim() || undefined
      };
    });

    const computedTotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

    const newOrder: KanbanOrder = {
      id,
      ticketNumber: `#${seq}`,
      tableOrClient: orderData.tableOrClient?.trim() || 'Mesa 1 · General',
      channel: orderData.channel || (category === 'express' ? 'delivery' : 'dine_in'),
      category,
      priority: orderData.priority || 'medium',
      stage: 'queue',
      items,
      totalAmount: orderData.totalAmount ?? computedTotal,
      prepTimeTargetMin: orderData.prepTimeTargetMin || 15,
      elapsedMinutes: 0,
      assignedStaff: orderData.assignedStaff?.trim() || 'Asignación pendiente',
      specialInstructions: orderData.specialInstructions?.trim() || '',
      createdAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    };

    const notice = `Comanda ${newOrder.ticketNumber} (${newOrder.tableOrClient}) ingresada a Cola de Entrada.`;

    this.isBoardFlipActive.set(true);
    this.activeTransitionOrderId.set(newOrder.id);
    this.playKdsChime('created');

    this.stageOverlay.runViewTransition(
      () => {
        this.orders.update(list => [newOrder, ...list]);
        this.liveAnnouncement.set(notice);
        this.toastMessage.set(notice);
      },
      () => {
        this.activeTransitionOrderId.set(null);
        this.isBoardFlipActive.set(false);
      },
      { rootClass: 'vt-board-flip' }
    );

    return newOrder;
  }

  private startLiveSimulation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      const timerId = setInterval(() => {
        if (!this.isLiveSimulationActive()) return;

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
      }, KANBAN_LIVE_TICK_MS);

      this.destroyRef.onDestroy(() => clearInterval(timerId));
    });
  }
}
