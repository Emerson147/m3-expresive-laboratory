import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import {
  KanbanOrder,
  OrderCategory,
  OrderChannel,
  OrderPriority,
  OrderStage,
  getOrderItemProgress,
  getOrderRemainingMinutes,
  getOrderSlaProgressPercent,
  isOrderBlocked,
  isOrderSlaBreached,
  isOrderSlaNearBreach,
  parseOrderStage
} from '../../../core/kanban/kanban.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LinearProgressComponent, M3ProgressColor } from '../../../shared/components/progress';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [M3ButtonComponent, M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      #cardRoot
      (pointerdown)="onCardPointerDown($event)"
      [class]="'kds-ticket-card p-4 sm:p-5 flex flex-col gap-3.5 relative ' + cardSurfaceClass()"
      [class.is-sla-breached]="isSlaBreached()"
      [class.is-blocked]="isBlocked()"
      [class.is-dragging]="isDragging()"
      [class.is-reorder-target]="isReorderTarget()"
      [style.view-transition-name]="isTransitioning() ? 'kanban-card-active' : null">

      <!-- Header Row: Keyboard Grip Handle + Full-Card Mouse Drag, Ticket #, Channel Pill & OKLCH Priority -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <!-- Keyboard & Touch Grip Handle (Full card also supports mouse drag-and-drop) -->
          <button
            type="button"
            (keydown)="onHandleKeydown($event)"
            [attr.aria-label]="'Mover comanda ' + order().ticketNumber + '. Arrastrá la tarjeta o usá las flechas para cambiar etapa u orden'"
            title="Arrastrar tarjeta o usar flechas (\u2190 \u2192 etapa, \u2191 \u2193 orden)"
            class="kds-drag-handle touch-target-48 state-layer focus-ring-m3 w-9 h-9 -ms-1.5 rounded-m3-md text-muted hover:text-main hover:bg-surface grid place-items-center shrink-0"
            [class.is-dragging]="isDragging()">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">drag_indicator</span>
          </button>

          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-title-md-emphasized tabular-nums text-main">
                {{ order().ticketNumber }}
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full bg-surface text-label-sm font-medium text-muted">
                <span class="material-symbols-rounded text-[14px]" aria-hidden="true">{{ channelIcon() }}</span>
                <span>{{ categoryLabel() }}</span>
              </span>
            </div>
            <p class="text-body-sm font-medium text-main truncate mt-0.5">
              {{ order().tableOrClient }}
            </p>
          </div>
        </div>

        <span
          [class]="'inline-flex items-center gap-1 text-label-sm-emphasized uppercase tracking-wider px-2.5 py-1 rounded-m3-full shrink-0 ' + priorityBadgeClass()">
          @if (order().priority === 'urgent' || order().priority === 'high') {
            <span class="material-symbols-rounded text-[14px]" aria-hidden="true">
              {{ order().priority === 'urgent' ? 'local_fire_department' : 'priority_high' }}
            </span>
          }
          <span>{{ priorityLabel() }}</span>
        </span>
      </div>

      <!-- Blocked / Hold Banner (if paused) -->
      @if (isBlocked()) {
        <div class="kds-blocked-note flex items-start gap-2 text-label-md bg-tertiary-box text-on-tertiary-box px-3.5 py-2">
          <span class="material-symbols-rounded text-base shrink-0 mt-0.5" aria-hidden="true">pause_circle</span>
          <div class="min-w-0">
            <span class="font-bold uppercase tracking-wider text-[11px] block">En espera</span>
            <span class="font-medium leading-snug block">{{ order().blockedReason }}</span>
          </div>
        </div>
      }

      <!-- SLA / Elapsed Progress (Flat deterministic M3 bar inside repeatable lists) -->
      @if (order().stage === 'ready') {
        <div class="flex items-center justify-between gap-2 px-3 py-2 rounded-m3-md bg-success-box text-on-success-box text-label-md-emphasized font-mono tabular-nums">
          <span class="inline-flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base" aria-hidden="true">check_circle</span>
            <span>Listo para entrega ({{ order().elapsedMinutes }}m)</span>
          </span>
          @if (order().assignedStaff) {
            <span class="text-label-sm font-sans font-medium truncate">{{ order().assignedStaff }}</span>
          }
        </div>
      } @else {
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-label-sm font-mono tabular-nums">
            <span class="text-muted font-medium">
              {{ order().elapsedMinutes }}m / {{ order().prepTimeTargetMin }}m meta
            </span>

            @if (isSlaBreached()) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-sm bg-error-box text-on-error-box font-bold">
                <span class="material-symbols-rounded text-[13px]" aria-hidden="true">warning</span>
                <span>+{{ order().elapsedMinutes - order().prepTimeTargetMin }}m SLA</span>
              </span>
            } @else {
              <span [class]="isNearBreach() ? 'text-warning font-bold' : 'text-muted'">
                {{ remainingMinutes() }}m rest.
              </span>
            }
          </div>

          <m3-linear-progress
            [value]="slaProgressPercent()"
            [wavy]="false"
            size="md"
            [color]="progressColor()"
            [ariaLabel]="'Tiempo de preparación comanda ' + order().ticketNumber" />
        </div>
      }

      <!-- Kitchen Order Items List (Surfaces critical prep notes & live dish readiness) -->
      <ul role="list" class="space-y-1.5 list-none m-0 p-0">
        @for (item of order().items; track item.id) {
          <li class="flex items-start gap-2 text-body-sm">
            @if (item.done) {
              <span
                class="material-symbols-rounded text-[17px] text-success shrink-0 mt-0.5"
                aria-hidden="true">
                check_circle
              </span>
            } @else {
              <span class="font-mono font-bold tabular-nums text-primary shrink-0 min-w-[1.5rem]">
                {{ item.quantity }}x
              </span>
            }

            <div class="min-w-0 flex-1">
              <span
                [class]="'font-medium block truncate ' + (item.done ? 'line-through text-muted opacity-70' : 'text-main')">
                {{ item.done ? item.quantity + 'x ' + item.name : item.name }}
              </span>
              @if (item.notes && !item.done) {
                <span class="block text-label-sm text-primary font-medium leading-snug mt-0.5">
                  {{ item.notes }}
                </span>
              }
            </div>
          </li>
        }
      </ul>

      <!-- Allergy or Special Kitchen Callout -->
      @if (order().specialInstructions) {
        @if (isAllergyNote()) {
          <div class="kds-allergy-note flex items-start gap-2 text-label-md bg-error-box text-on-error-box px-3.5 py-2">
            <span class="material-symbols-rounded text-base shrink-0 mt-0.5" aria-hidden="true">warning</span>
            <span class="font-semibold leading-snug">{{ order().specialInstructions }}</span>
          </div>
        } @else {
          <div class="flex items-start gap-2 text-label-md bg-surface text-muted px-3 py-2 rounded-m3-md">
            <span class="material-symbols-rounded text-base shrink-0 mt-0.5" aria-hidden="true">edit_note</span>
            <span class="leading-snug">{{ order().specialInstructions }}</span>
          </div>
        }
      }

      <!-- Kitchen Footer Metadata & Touch-Friendly Actions (48dp touch targets) -->
      <div class="pt-1 flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-2 text-label-sm text-muted font-mono tabular-nums">
          <span>
            {{ order().items.length }} {{ order().items.length === 1 ? 'ítem' : 'ítems' }} · {{ order().createdAt }}
          </span>
          @if (itemProgress().done > 0) {
            <span class="px-2 py-0.5 rounded-m3-full bg-success-box/70 text-on-success-box font-semibold">
              {{ itemProgress().done }}/{{ itemProgress().total }} listos
            </span>
          } @else if (order().assignedStaff && order().assignedStaff !== 'Asignación pendiente') {
            <span class="font-sans truncate max-w-[140px]">{{ order().assignedStaff }}</span>
          }
        </div>

        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center touch-gap-8 shrink-0">
            @if (order().stage !== 'queue') {
              <m3-button
                [iconOnly]="true"
                variant="outlined"
                size="sm"
                icon="arrow_back"
                [ariaLabel]="'Regresar comanda ' + order().ticketNumber + ' a etapa anterior'"
                (action)="regress.emit(order().id)" />
            }

            <m3-button
              [id]="'trigger-ticket-' + order().id"
              variant="tonal"
              size="sm"
              icon="receipt_long"
              [morph]="true"
              [invisible]="isInspectOriginInvisible()"
              [viewTransitionName]="isInspectOriginActive() ? 'dialog-transform' : null"
              [ariaLabel]="'Inspeccionar ticket ' + order().ticketNumber"
              (action)="inspect.emit(order())">
              Ticket
            </m3-button>
          </div>

          <div class="flex items-center shrink-0">
            @if (order().stage !== 'ready') {
              <m3-button
                [iconOnly]="true"
                variant="filled"
                size="sm"
                icon="arrow_forward"
                [ariaLabel]="'Avanzar comanda ' + order().ticketNumber + ' a siguiente etapa'"
                (action)="advance.emit(order().id)" />
            } @else {
              <m3-button
                variant="filled"
                size="sm"
                icon="done_all"
                [ariaLabel]="'Entregar y cerrar comanda ' + order().ticketNumber"
                (action)="dispatch.emit(order().id)">
                Entregar
              </m3-button>
            }
          </div>
        </div>
      </div>
    </article>
  `
})
export class KanbanCardComponent {
  readonly order = input.required<KanbanOrder>();
  readonly isDragging = input<boolean>(false);
  readonly isReorderTarget = input<boolean>(false);
  readonly isTransitioning = input<boolean>(false);
  readonly activeInspectTrigger = input<string | null>(null);
  readonly isInspectModalOpen = input<boolean>(false);
  readonly inspectMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly dragStart = output<{ orderId: string }>();
  readonly dragHover = output<{ stage: OrderStage | null; targetOrderId: string | null }>();
  readonly dragDrop = output<{ stage: OrderStage; beforeOrderId: string | null }>();
  readonly dragEnd = output<void>();
  readonly advance = output<string>();
  readonly regress = output<string>();
  readonly dispatch = output<string>();
  readonly reorder = output<'up' | 'down'>();
  readonly inspect = output<KanbanOrder>();

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cardRoot = viewChild<ElementRef<HTMLElement>>('cardRoot');
  private activeDragCleanup: (() => void) | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.activeDragCleanup?.();
    });
  }

  readonly isSlaBreached = computed(() => isOrderSlaBreached(this.order()));
  readonly isNearBreach = computed(() => isOrderSlaNearBreach(this.order()));
  readonly isBlocked = computed(() => isOrderBlocked(this.order()));
  readonly slaProgressPercent = computed(() => getOrderSlaProgressPercent(this.order()));
  readonly remainingMinutes = computed(() => getOrderRemainingMinutes(this.order()));
  readonly itemProgress = computed(() => getOrderItemProgress(this.order()));

  readonly isInspectOriginActive = computed(() => {
    const triggerId = `ticket-${this.order().id}`;
    return this.inspectMorphOwner() === 'trigger' && this.activeInspectTrigger() === triggerId;
  });

  readonly isInspectOriginInvisible = computed(() => {
    const triggerId = `ticket-${this.order().id}`;
    return this.isInspectModalOpen() && this.activeInspectTrigger() === triggerId;
  });

  readonly isAllergyNote = computed(() => {
    const note = this.order().specialInstructions?.toLowerCase() ?? '';
    return note.includes('alérg') || note.includes('alerg');
  });

  readonly cardSurfaceClass = computed(() => 'bg-surface-high hover:bg-surface-highest');

  readonly channelIcon = computed(() => {
    const map: Record<OrderChannel, string> = {
      dine_in: 'table_restaurant',
      takeout: 'takeout_dining',
      delivery: 'delivery_dining'
    };
    return map[this.order().channel];
  });

  readonly categoryLabel = computed(() => {
    const map: Record<OrderCategory, string> = {
      kitchen: 'Caliente',
      cold_chain: 'Frío',
      express: 'Express',
      dispatch: 'Despacho'
    };
    return map[this.order().category];
  });

  readonly priorityLabel = computed(() => {
    const map: Record<OrderPriority, string> = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return map[this.order().priority];
  });

  readonly priorityBadgeClass = computed(() => {
    const map: Record<OrderPriority, string> = {
      urgent: 'bg-error-box text-on-error-box',
      high: 'bg-warning-box text-on-warning-box',
      medium: 'bg-sec-box text-on-sec-box',
      low: 'bg-surface text-muted'
    };
    return map[this.order().priority];
  });

  readonly progressColor = computed<M3ProgressColor>(() => {
    if (this.isSlaBreached()) return 'error';
    if (this.isNearBreach()) return 'secondary';
    return 'primary';
  });

  onCardPointerDown(event: PointerEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!event.isPrimary || event.button !== 0) return;

    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest('button:not(.kds-drag-handle), a, input, select, textarea')) {
      return;
    }

    // Preserve natural touch scroll on card body; touch drag initiates from the 48dp grip handle.
    const isHandleOrigin = Boolean(target?.closest('.kds-drag-handle'));
    if (event.pointerType !== 'mouse' && !isHandleOrigin) {
      return;
    }

    const cardEl = this.cardRoot()?.nativeElement;
    if (!cardEl) return;

    this.activeDragCleanup?.();

    const doc = this.document;
    const win = doc.defaultView;
    const rect = cardEl.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const offsetX = Math.max(12, Math.min(startX - rect.left, Math.max(12, rect.width - 12)));
    const offsetY = Math.max(12, Math.min(startY - rect.top, Math.max(12, rect.height - 12)));

    let hasEnteredDrag = false;
    let ghostEl: HTMLElement | null = null;
    let lastStage: OrderStage | null = null;
    let lastTargetOrderId: string | null = null;

    const spawnFloatingGhost = (clientX: number, clientY: number): HTMLElement => {
      const clone = cardEl.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      clone.style.removeProperty('view-transition-name');
      clone.classList.remove('is-dragging', 'is-reorder-target', 'hover:bg-surface-highest');
      clone.classList.add('kds-floating-drag-ghost');
      if (this.isSlaBreached()) {
        clone.classList.add('is-sla-breached');
      }
      if (rect.width > 0) {
        clone.style.width = `${rect.width}px`;
      }
      if (rect.height > 0) {
        clone.style.height = `${rect.height}px`;
      }
      clone.style.transform = `translate3d(${clientX - offsetX}px, ${clientY - offsetY}px, 0) scale(1.015)`;
      doc.body.appendChild(clone);
      return clone;
    };

    const resolveHitTarget = (
      clientX: number,
      clientY: number
    ): { stage: OrderStage | null; targetOrderId: string | null } => {
      const hitEl =
        typeof doc.elementFromPoint === 'function' ? doc.elementFromPoint(clientX, clientY) : null;
      const laneEl = hitEl?.closest<HTMLElement>('[data-kanban-lane]') ?? null;
      const rawStage = laneEl?.dataset['stage'] ?? laneEl?.id?.replace('kds-lane-', '');
      const stage = parseOrderStage(rawStage);
      const ticketEl = hitEl?.closest<HTMLElement>('[data-order-id]') ?? null;
      const targetOrderId = stage ? (ticketEl?.dataset['orderId'] ?? null) : null;
      return { stage, targetOrderId };
    };

    const cleanup = () => {
      doc.removeEventListener('pointermove', onPointerMove);
      doc.removeEventListener('pointerup', onPointerUp);
      doc.removeEventListener('pointercancel', onPointerCancel);
      doc.removeEventListener('keydown', onEscapeKeydown);
      win?.removeEventListener('blur', onWindowBlur);
      doc.documentElement.classList.remove('kds-pointer-dragging');
      ghostEl?.remove();
      ghostEl = null;
      if (this.activeDragCleanup === cleanup) {
        this.activeDragCleanup = null;
      }
    };

    const finishDrag = (commitDrop: boolean, endEvent?: PointerEvent) => {
      cleanup();
      if (!hasEnteredDrag) return;

      let finalStage = lastStage;
      let finalTargetOrderId = lastTargetOrderId;
      if (commitDrop && endEvent) {
        const resolved = resolveHitTarget(endEvent.clientX, endEvent.clientY);
        finalStage = resolved.stage;
        finalTargetOrderId = resolved.targetOrderId;
      }

      this.ngZone.run(() => {
        if (commitDrop && finalStage) {
          this.dragDrop.emit({ stage: finalStage, beforeOrderId: finalTargetOrderId });
        } else {
          this.dragEnd.emit();
        }
      });
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;

      if (!hasEnteredDrag) {
        if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 5) {
          return;
        }
        hasEnteredDrag = true;
        doc.documentElement.classList.add('kds-pointer-dragging');
        win?.getSelection()?.removeAllRanges();
        ghostEl = spawnFloatingGhost(moveEvent.clientX, moveEvent.clientY);
        this.ngZone.run(() => {
          this.dragStart.emit({ orderId: this.order().id });
        });
      }

      if (ghostEl) {
        ghostEl.style.transform = `translate3d(${moveEvent.clientX - offsetX}px, ${moveEvent.clientY - offsetY}px, 0) scale(1.015)`;
      }

      const { stage, targetOrderId } = resolveHitTarget(moveEvent.clientX, moveEvent.clientY);
      if (stage !== lastStage || targetOrderId !== lastTargetOrderId) {
        lastStage = stage;
        lastTargetOrderId = targetOrderId;
        this.ngZone.run(() => {
          this.dragHover.emit({ stage, targetOrderId });
        });
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== event.pointerId) return;
      finishDrag(true, upEvent);
    };

    const onPointerCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId !== event.pointerId) return;
      finishDrag(false);
    };

    const onEscapeKeydown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') {
        keyEvent.preventDefault();
        finishDrag(false);
      }
    };

    const onWindowBlur = () => {
      finishDrag(false);
    };

    this.activeDragCleanup = cleanup;
    this.ngZone.runOutsideAngular(() => {
      doc.addEventListener('pointermove', onPointerMove, { passive: true });
      doc.addEventListener('pointerup', onPointerUp);
      doc.addEventListener('pointercancel', onPointerCancel);
      doc.addEventListener('keydown', onEscapeKeydown);
      win?.addEventListener('blur', onWindowBlur);
    });
  }

  onHandleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.order().stage !== 'ready') {
        this.advance.emit(this.order().id);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.order().stage !== 'queue') {
        this.regress.emit(this.order().id);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.reorder.emit('up');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.reorder.emit('down');
    }
  }
}
