import { TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { KanbanComponent } from './kanban.component';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { KanbanService } from '../../core/kanban/kanban.service';
import { ThemeService } from '../../core/theme/theme.service';

describe('KanbanComponent', () => {
  let component: KanbanComponent;
  let fixture: ComponentFixture<KanbanComponent>;
  let kanbanService: KanbanService;
  let stageOverlay: StageOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanComponent],
      providers: [KanbanService, StageOverlayService, ThemeService]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanComponent);
    component = fixture.componentInstance;
    kanbanService = TestBed.inject(KanbanService);
    stageOverlay = TestBed.inject(StageOverlayService);
    fixture.detectChanges();
  });

  afterEach(() => {
    kanbanService.dismissToast();
    stageOverlay.unregisterHost();
    fixture.destroy();
  });

  it('should create the kanban component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Kanban header, 4 OKLCH KPI cards, primary mobile M3 tabs, and 4 lanes without nested <main>', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('h1');
    expect(title?.textContent).toContain('Kanban Operativo');

    expect(el.querySelectorAll('main').length).toBe(0);

    const kpiCards = el.querySelectorAll('.kds-kpi-card');
    expect(kpiCards.length).toBe(4);

    const mobileTabs = el.querySelectorAll('app-kanban-board m3-tabs button[role="tab"]');
    expect(mobileTabs.length).toBe(4);

    const lanes = el.querySelectorAll('section[aria-label="Tablero Kanban Operativo KDS"] [data-kanban-lane]');
    expect(lanes.length).toBe(4);
  });

  it('should avoid clamped lane heights or inner lane vertical scrollbars so the whole workbench scrolls naturally', () => {
    const el = fixture.nativeElement as HTMLElement;
    const workbench = el.querySelector('.kds-workbench') as HTMLElement | null;
    expect(workbench?.className).toContain('overflow-y-auto');

    const lanes = Array.from(el.querySelectorAll('[data-kanban-lane]'));
    for (const lane of lanes) {
      expect(lane.className).not.toContain('max-h-[calc(100vh-280px)]');
      expect(lane.className).not.toContain('max-h-[680px]');
      expect(lane.className).not.toContain('overflow-hidden');
    }

    const laneBodies = Array.from(el.querySelectorAll('.kds-lane-scroll'));
    expect(laneBodies.length).toBe(4);
    for (const body of laneBodies) {
      expect(body.className).not.toContain('overflow-y-auto');
    }
  });

  it('should support full-card rounded pointer drag preview, clean inset SLA indicator, and 48dp keyboard grip', () => {
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('article.kds-ticket-card') as NodeListOf<HTMLElement>;
    expect(cards.length).toBeGreaterThan(0);
    // Avoid native HTML5 draggable OS bitmaps that render rectangular corners over rounded cards
    expect(cards[0].draggable).toBe(false);

    // Breached SLA card (#ORD-4824) uses inset CSS class rather than jagged border-s-4
    const breachedCard = el.querySelector('[data-order-id="ORD-4824"] article.kds-ticket-card') as HTMLElement | null;
    expect(breachedCard?.classList.contains('is-sla-breached')).toBe(true);
    expect(breachedCard?.className).not.toContain('border-s-4');

    const createPointer = (type: string, x: number, y: number): PointerEvent => {
      const evt = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: x,
        clientY: y
      }) as PointerEvent;
      Object.defineProperties(evt, {
        pointerId: { value: 1, configurable: true },
        pointerType: { value: 'mouse', configurable: true },
        isPrimary: { value: true, configurable: true }
      });
      return evt;
    };

    const prepLane = el.querySelector('#kds-lane-prep') as HTMLElement | null;
    expect(prepLane).toBeTruthy();

    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(prepLane as Element);

    try {
      const firstQueueOrder = kanbanService.ordersByStage().queue[0];
      const firstCard = el.querySelector(
        `[data-order-id="${firstQueueOrder.id}"] article.kds-ticket-card`
      ) as HTMLElement;

      firstCard.dispatchEvent(createPointer('pointerdown', 20, 20));
      document.dispatchEvent(createPointer('pointermove', 60, 60));
      fixture.detectChanges();

      const ghost = document.body.querySelector('.kds-floating-drag-ghost') as HTMLElement | null;
      expect(ghost).toBeTruthy();
      expect(document.documentElement.classList.contains('kds-pointer-dragging')).toBe(true);
      expect(kanbanService.draggedOrderId()).toBe(firstQueueOrder.id);
      expect(kanbanService.dragOverStage()).toBe('prep');

      document.dispatchEvent(createPointer('pointerup', 60, 60));
      fixture.detectChanges();

      expect(document.body.querySelector('.kds-floating-drag-ghost')).toBeNull();
      expect(document.documentElement.classList.contains('kds-pointer-dragging')).toBe(false);
      expect(kanbanService.orders().find(o => o.id === firstQueueOrder.id)?.stage).toBe('prep');
    } finally {
      document.elementFromPoint = originalElementFromPoint;
    }

    const handles = el.querySelectorAll('.kds-drag-handle');
    expect(handles.length).toBeGreaterThan(0);
    expect(handles[0].classList.contains('touch-target-48')).toBe(true);

    const [topQueueOrder, nextQueueOrder] = kanbanService.ordersByStage().queue;
    if (topQueueOrder && nextQueueOrder) {
      const firstHandle = el.querySelector(
        `[aria-label*="${topQueueOrder.ticketNumber}"]`
      ) as HTMLButtonElement | null;
      expect(firstHandle).toBeTruthy();

      firstHandle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
      expect(kanbanService.ordersByStage().queue[0].id).toBe(nextQueueOrder.id);

      firstHandle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      fixture.detectChanges();

      const updated = kanbanService.orders().find(o => o.id === topQueueOrder.id);
      expect(updated?.stage).toBe('prep');
    }
  });

  it('should render reactive filter chip counts and filter tickets via filled M3 search field', () => {
    const el = fixture.nativeElement as HTMLElement;
    const chipsText = el.querySelector('section[aria-label="Filtros y búsqueda de comandas"]')?.textContent;
    expect(chipsText).toContain('Todos');
    expect(chipsText).toContain('8');

    const searchInput = el.querySelector('m3-text-field input[type="search"]') as HTMLInputElement;
    expect(searchInput).toBeTruthy();
    searchInput.value = '#4824';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(kanbanService.filteredOrders().length).toBe(1);
    expect(kanbanService.filteredOrders()[0].id).toBe('ORD-4824');
  });

  it('should open and close ticket inspection modal with Escape while syncing stageOverlay', () => {
    const order = kanbanService.orders()[0];
    kanbanService.openOrderInspection(order);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(kanbanService.isInspectionOpen()).toBe(true);
    expect(stageOverlay.isOverlayOpen()).toBe(true);
    expect(el.querySelector('#kanban-inspect-dialog')).toBeTruthy();

    component.onEscape();
    fixture.detectChanges();
    expect(kanbanService.isInspectionOpen()).toBe(false);
    expect(stageOverlay.isOverlayOpen()).toBe(false);
  });

  it('should defer validation until submit, block invalid table input, and submit valid M3 controls', () => {
    component.openCreateOrderModal();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(component.isCreateModalOpen()).toBe(true);
    expect(el.querySelector('#kanban-create-dialog')).toBeTruthy();

    // Deferred feedback: no invalid error shown immediately on modal open
    expect(el.querySelector('#kanban-create-dialog .m3-text-field.is-error')).toBeNull();

    // Verify all text fields inside create modal use unified filled variant
    const outlinedFields = el.querySelectorAll('#kanban-create-dialog .m3-text-field-outlined');
    expect(outlinedFields.length).toBe(0);

    // Clear Mesa/Canal input (unique ID on inner <input>, not duplicate on host) and attempt submit
    expect(el.querySelectorAll('#kds-create-table').length).toBe(1);
    const tableInput = el.querySelector('#kds-create-table') as HTMLInputElement;
    expect(tableInput.tagName).toBe('INPUT');
    tableInput.value = '';
    tableInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const initialCount = kanbanService.orders().length;
    const submitBtn = el.querySelector('#kanban-create-dialog button[type="submit"]') as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();

    expect(component.isCreateModalOpen()).toBe(true);
    expect(kanbanService.orders().length).toBe(initialCount);
    expect(el.querySelector('#kanban-create-dialog .m3-text-field.is-error')).toBeTruthy();
    expect(el.querySelector('#kanban-create-dialog')?.textContent).toContain(
      'Ingresá una mesa o canal para emitir la comanda.'
    );

    // Fill valid table, choose urgent button via <m3-button-group> & cold_chain category, then submit
    tableInput.value = 'Mesa 99 · VIP';
    tableInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const priorityButtons = Array.from(
      el.querySelectorAll('#kanban-create-dialog .kds-priority-group button')
    ) as HTMLButtonElement[];
    const urgentBtn = priorityButtons.find(btn => btn.textContent?.includes('Urgente'));
    expect(urgentBtn).toBeTruthy();
    urgentBtn?.click();
    fixture.detectChanges();

    const categorySelect = el.querySelector('#kds-create-category') as HTMLSelectElement;
    categorySelect.value = 'cold_chain';
    categorySelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    submitBtn.click();
    fixture.detectChanges();

    expect(component.isCreateModalOpen()).toBe(false);
    expect(kanbanService.orders().length).toBe(initialCount + 1);
    const created = kanbanService.orders()[0];
    expect(created.tableOrClient).toBe('Mesa 99 · VIP');
    expect(created.priority).toBe('urgent');
    expect(created.category).toBe('cold_chain');
  });

  it('should mount modals into StageOverlayService when an external host is registered', () => {
    stageOverlay.registerHost();
    fixture.detectChanges();

    component.openCreateOrderModal();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    // Inline fallback inside KanbanComponent must stay empty when external host is active
    expect(el.querySelector('#kanban-create-dialog')).toBeNull();
    const mountedTpl: TemplateRef<unknown> | null = stageOverlay.overlayTemplate();
    expect(mountedTpl).toBeTruthy();
    expect(stageOverlay.isOverlayOpen()).toBe(true);
  });

  it('should toggle buzzer switch state in kanbanService and avoid duplicate dark mode toggle in header', () => {
    expect(component.buzzerEnabled()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-kanban-header [aria-label*="modo oscuro"], app-kanban-header [aria-label*="modo claro"]')).toBeNull();

    const buzzerSwitch = el.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(buzzerSwitch).toBeTruthy();

    buzzerSwitch.click();
    fixture.detectChanges();

    expect(kanbanService.buzzerEnabled()).toBe(false);
    expect(component.buzzerEnabled()).toBe(false);
  });

  it('should allow dispatching ready orders with snackbar Undo, Dish checklist, Stage Jump, Hold reason, and two-step Anular', () => {
    const el = fixture.nativeElement as HTMLElement;
    const readyOrder = kanbanService.ordersByStage().ready[0];
    const dispatchBtn = el.querySelector(
      `[aria-label="Entregar y cerrar comanda ${readyOrder.ticketNumber}"]`
    ) as HTMLButtonElement | null;
    expect(dispatchBtn).toBeTruthy();

    dispatchBtn?.click();
    fixture.detectChanges();
    expect(kanbanService.orders().some(o => o.id === readyOrder.id)).toBe(false);
    expect(kanbanService.dispatchedCount()).toBe(1);
    expect(kanbanService.canUndoLastRemoval()).toBe(true);

    // Undo via snackbar action restores ticket
    const snackbarUndoBtn = el.querySelector('m3-snackbar .m3-snackbar-action') as HTMLButtonElement | null;
    expect(snackbarUndoBtn?.textContent).toContain('Deshacer');
    snackbarUndoBtn?.click();
    fixture.detectChanges();
    expect(kanbanService.orders().some(o => o.id === readyOrder.id)).toBe(true);

    const inspectTarget = kanbanService.ordersByStage().queue[0];
    kanbanService.openOrderInspection(inspectTarget);
    fixture.detectChanges();

    const inspectDialog = el.querySelector('dialog.m3-dialog.kds-inspect-dialog[open]') as HTMLDialogElement | null;
    expect(inspectDialog).toBeTruthy();

    const staffSelect = el.querySelector('#kds-inspect-staff') as HTMLSelectElement;
    expect(staffSelect).toBeTruthy();
    if (inspectTarget.assignedStaff) {
      expect(staffSelect.value).toBe(inspectTarget.assignedStaff);
    }
    staffSelect.value = 'Chef Carlos Ruiz';
    staffSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(kanbanService.orders().find(o => o.id === inspectTarget.id)?.assignedStaff).toBe('Chef Carlos Ruiz');

    // Toggle first dish checkbox inside inspect dialog
    const dishCheck = el.querySelector('#kanban-inspect-dialog m3-checkbox input[type="checkbox"]') as HTMLInputElement | null;
    expect(dishCheck).toBeTruthy();
    dishCheck?.click();
    fixture.detectChanges();
    expect(kanbanService.orders().find(o => o.id === inspectTarget.id)?.items[0].done).toBe(true);

    // Jump stage directly to QA inside inspect modal pipeline
    const qaJumpBtn = el.querySelector(
      '#kanban-inspect-dialog [aria-label="Mover comanda a etapa Calidad"]'
    ) as HTMLButtonElement | null;
    expect(qaJumpBtn).toBeTruthy();
    qaJumpBtn?.click();
    fixture.detectChanges();
    expect(kanbanService.orders().find(o => o.id === inspectTarget.id)?.stage).toBe('qa');

    // Safe two-step Anular requires confirmation click before deleting
    const cancelStep1 = el.querySelector(
      '#kanban-inspect-dialog [aria-label="Anular y retirar comanda del tablero"]'
    ) as HTMLButtonElement | null;
    expect(cancelStep1).toBeTruthy();
    cancelStep1?.click();
    fixture.detectChanges();
    expect(kanbanService.orders().some(o => o.id === inspectTarget.id)).toBe(true);

    const cancelStep2 = el.querySelector(
      '#kanban-inspect-dialog [aria-label="Confirmar anulación definitiva de comanda"]'
    ) as HTMLButtonElement | null;
    expect(cancelStep2).toBeTruthy();
    cancelStep2?.click();
    fixture.detectChanges();

    expect(kanbanService.orders().some(o => o.id === inspectTarget.id)).toBe(false);
    expect(kanbanService.isInspectionOpen()).toBe(false);
  });

  it('should support All-Day & Recall ops dialog, editable lane WIP limits, and empty search recovery', () => {
    const el = fixture.nativeElement as HTMLElement;

    // Open All-Day dialog from Header
    const allDayBtn = el.querySelector(
      'app-kanban-header [aria-label="Abrir resumen consolidado All-Day de cocina"]'
    ) as HTMLButtonElement | null;
    expect(allDayBtn).toBeTruthy();
    allDayBtn?.click();
    fixture.detectChanges();

    const opsDialog = el.querySelector('dialog.m3-dialog.kds-ops-dialog[open]') as HTMLDialogElement | null;
    expect(opsDialog).toBeTruthy();
    expect(opsDialog?.textContent).toContain('Lomo Saltado');

    // Click first consolidated dish to filter the board and close dialog
    const firstDishBtn = opsDialog?.querySelector('ul button') as HTMLButtonElement | null;
    expect(firstDishBtn).toBeTruthy();
    firstDishBtn?.click();
    fixture.detectChanges();

    expect(kanbanService.isOpsModalOpen()).toBe(false);
    expect(kanbanService.searchQuery().length).toBeGreaterThan(0);

    // Search non-existent text shows empty banner and reset button
    kanbanService.setSearchQuery('ZZZZ_NO_EXISTE');
    fixture.detectChanges();
    const resetBtn = el.querySelector('app-kanban-board m3-button') as HTMLElement | null;
    expect(el.textContent).toContain('No hay comandas que coincidan con el filtro');
    expect(resetBtn).toBeTruthy();

    kanbanService.clearSearchAndFilters();
    fixture.detectChanges();
    expect(kanbanService.searchQuery()).toBe('');

    // Adjust WIP stepper directly in Cola de Entrada lane header
    const decWipBtn = el.querySelector(
      '[aria-label="Reducir límite WIP de Cola de Entrada"]'
    ) as HTMLButtonElement | null;
    expect(decWipBtn).toBeTruthy();
    decWipBtn?.click();
    fixture.detectChanges();
    expect(kanbanService.effectiveColumns().find(c => c.id === 'queue')?.wipLimit).toBe(5);
  });
});
