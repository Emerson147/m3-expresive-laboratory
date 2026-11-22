import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import {
  KANBAN_BLOCK_REASONS,
  KanbanOrder,
  OrderPriority,
  OrderStage,
  getOrderItemProgress,
  isOrderBlocked,
  isOrderSlaBreached
} from '../../../core/kanban/kanban.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { KANBAN_SELECT_STYLES } from './kanban-expressive.styles';

const PRIORITY_BADGE_CLASSES: Record<OrderPriority, string> = {
  urgent: 'bg-error-box text-on-error-box',
  high: 'bg-warning-box text-on-warning-box',
  medium: 'bg-sec-box text-on-sec-box',
  low: 'bg-surface-high text-muted'
};

const PRIORITY_LABELS: Record<OrderPriority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
};

const STAGE_TILES: readonly {
  id: OrderStage;
  label: string;
  icon: string;
  activeClass: string;
}[] = [
  { id: 'queue', label: 'Entrada', icon: 'inbox', activeClass: 'bg-primary text-on-primary' },
  { id: 'prep', label: 'Cocina', icon: 'skillet', activeClass: 'bg-warning-box text-on-warning-box' },
  { id: 'qa', label: 'Calidad', icon: 'fact_check', activeClass: 'bg-tertiary-box text-on-tertiary-box' },
  { id: 'ready', label: 'Despacho', icon: 'check_circle', activeClass: 'bg-success-box text-on-success-box' }
];

@Component({
  selector: 'app-kanban-inspect-modal',
  standalone: true,
  imports: [M3DialogComponent, M3ButtonComponent, M3CheckboxComponent],
  styles: [KANBAN_SELECT_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open() && !!order()"
      [managedClose]="true"
      [showCloseButton]="false"
      [headline]="dialogHeadline()"
      [viewTransitionName]="viewTransitionName()"
      customClass="kds-inspect-dialog"
      (closeRequested)="closed.emit()">

      @if (order(); as activeOrder) {
        <div id="kanban-inspect-dialog" class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <!-- Floating Expressive Header -->
          <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
          <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
                <span class="material-symbols-rounded text-xl" aria-hidden="true">receipt_long</span>
              </div>

              <div class="min-w-0">
                <div class="flex items-center flex-wrap gap-2">
                  <h3
                    id="kds-inspect-title"
                    class="text-title-lg-emphasized text-main leading-tight">
                    Comanda {{ activeOrder.ticketNumber }}
                  </h3>
                  <span
                    [class]="'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full uppercase tracking-wider ' + priorityBadgeClass()">
                    {{ priorityLabel() }}
                  </span>
                  @if (isBlocked()) {
                    <span class="text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full bg-tertiary-box text-on-tertiary-box inline-flex items-center gap-1">
                      <span class="material-symbols-rounded text-[13px]" aria-hidden="true">pause_circle</span>
                      En espera
                    </span>
                  }
                </div>
                <p class="text-label-md text-muted truncate mt-0.5">
                  {{ activeOrder.tableOrClient }} · Ingreso {{ activeOrder.createdAt }}
                </p>
              </div>
            </div>

            <m3-button
              variant="text"
              size="sm"
              [iconOnly]="true"
              icon="close"
              ariaLabel="Cerrar inspección de ticket"
              (action)="closed.emit()" />
          </header>
        </div>

        <!-- Scrollable Order Details -->
        <div #inspectScrollBody class="px-5 sm:px-6 py-3 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-4">
          <!-- Direct Stage Jump Pipeline -->
          <div class="p-4 rounded-m3-xl bg-surface-low space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                Pipeline Operativo (Clic para saltar etapa)
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-label-sm">
              @for (tile of stageTiles; track tile.id) {
                @let isCurrent = activeOrder.stage === tile.id;
                <button
                  type="button"
                  [disabled]="isCurrent"
                  [attr.aria-current]="isCurrent ? 'step' : null"
                  [attr.aria-label]="'Mover comanda a etapa ' + tile.label"
                  (click)="onStageJump(activeOrder.id, tile.id)"
                  [class]="'p-2.5 rounded-m3-md transition-colors state-layer focus-ring-m3 ' + (isCurrent ? tile.activeClass : 'bg-surface text-muted hover:bg-surface-high hover:text-main')">
                  <span class="material-symbols-rounded block text-base mx-auto" aria-hidden="true">{{ tile.icon }}</span>
                  <span class="font-medium block mt-0.5">{{ tile.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Station Metadata & Operational Assignment -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
            <div class="kds-filled-select-wrap">
              <label for="kds-inspect-staff" class="kds-filled-select-label">
                Responsable Asignado
              </label>
              <select
                id="kds-inspect-staff"
                name="assignedStaff"
                class="kds-select"
                [value]="activeOrder.assignedStaff || 'Asignación pendiente'"
                (change)="onStaffChange(activeOrder.id, $event)">
                @for (staff of resolvedStaffOptions(); track staff) {
                  <option
                    [value]="staff"
                    [selected]="staff === (activeOrder.assignedStaff || 'Asignación pendiente')">
                    {{ staff }}
                  </option>
                }
              </select>
            </div>
            <div class="p-3.5 rounded-m3-lg bg-surface-low flex flex-col justify-center">
              <span class="text-muted block text-label-sm">Tiempo Transcurrido vs SLA</span>
              <span [class]="'font-mono tabular-nums font-bold ' + (isBreached() ? 'text-error' : 'text-main')">
                {{ activeOrder.elapsedMinutes }} min / Meta: {{ activeOrder.prepTimeTargetMin }} min
              </span>
            </div>
          </div>

          <!-- Hold / Blocked Controls -->
          <div class="p-4 rounded-m3-xl bg-surface-low space-y-2.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                Estado Operativo de Cocina
              </span>

              @if (isBlocked()) {
                <m3-button
                  variant="tonal"
                  size="sm"
                  icon="play_arrow"
                  (action)="setBlocked.emit({ orderId: activeOrder.id, reason: null })">
                  Reanudar Comanda
                </m3-button>
              } @else {
                <m3-button
                  variant="outlined"
                  size="sm"
                  icon="pause_circle"
                  (action)="showHoldPicker.set(!showHoldPicker())">
                  {{ showHoldPicker() ? 'Cancelar espera' : 'Poner en espera' }}
                </m3-button>
              }
            </div>

            @if (isBlocked()) {
              <div class="p-3 rounded-m3-md bg-tertiary-box text-on-tertiary-box flex items-center gap-2 text-body-sm font-medium">
                <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">pause_circle</span>
                <span>Motivo activo: {{ activeOrder.blockedReason }}</span>
              </div>
            } @else if (showHoldPicker()) {
              <div class="flex flex-wrap gap-2 pt-1">
                @for (reason of blockReasons; track reason) {
                  <button
                    type="button"
                    (click)="applyHoldReason(activeOrder.id, reason)"
                    class="px-3 py-1.5 rounded-m3-full bg-surface text-label-sm font-medium text-main hover:bg-tertiary-box hover:text-on-tertiary-box state-layer focus-ring-m3 transition-colors">
                    {{ reason }}
                  </button>
                }
              </div>
            }
          </div>

          @if (activeOrder.specialInstructions) {
            <div class="p-3.5 rounded-m3-lg bg-warning-box text-on-warning-box flex items-start gap-2.5 text-body-sm">
              <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">warning</span>
              <div>
                <span class="font-bold block">Instrucción Especial:</span>
                <span>{{ activeOrder.specialInstructions }}</span>
              </div>
            </div>
          }

          <!-- Interactive Dish Checklist -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-label-sm-emphasized uppercase tracking-wider text-muted">
                Checklist de Platos y Bebidas
              </span>
              <span class="text-label-sm font-mono tabular-nums px-2.5 py-0.5 rounded-m3-full bg-surface-high text-main font-semibold">
                {{ itemProgress().done }} / {{ itemProgress().total }} listos
              </span>
            </div>

            <ul role="list" class="list-none p-2.5 rounded-m3-xl bg-surface-low flex flex-col gap-2">
              @for (item of activeOrder.items; track item.id) {
                <li class="p-3 rounded-m3-md bg-surface flex items-center justify-between gap-3 text-body-sm">
                  <div class="flex items-center gap-3 min-w-0">
                    <m3-checkbox
                      [checked]="!!item.done"
                      [ariaLabel]="'Marcar ' + item.name + ' como listo'"
                      (changed)="toggleItem.emit({ orderId: activeOrder.id, itemId: item.id })" />

                    <div class="min-w-0">
                      <div
                        [class]="'font-semibold ' + (item.done ? 'line-through text-muted opacity-70' : 'text-main')">
                        <span class="font-mono text-primary font-bold mr-1">{{ item.quantity }}x</span>
                        {{ item.name }}
                      </div>
                      @if (item.notes) {
                        <span class="text-label-sm text-muted italic flex items-center gap-1 mt-0.5">
                          <span class="material-symbols-rounded text-xs" aria-hidden="true">edit_note</span>
                          {{ item.notes }}
                        </span>
                      }
                    </div>
                  </div>
                  <div class="text-right font-mono tabular-nums shrink-0">
                    <span class="font-semibold">S/ {{ (item.price * item.quantity).toFixed(2) }}</span>
                    <span class="block text-label-sm text-muted">(S/ {{ item.price.toFixed(2) }} c/u)</span>
                  </div>
                </li>
              }
            </ul>

            <div class="flex items-baseline justify-between p-3.5 rounded-m3-lg bg-surface-high font-mono tabular-nums">
              <span class="font-bold text-label-sm uppercase tracking-wider text-muted">
                Total de Comanda:
              </span>
              <span class="text-lg font-black text-primary">S/ {{ activeOrder.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Pinned Divider-Free Dialog Footer with Safe Two-Step Cancel -->
        <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center touch-gap-8">
            @if (!confirmCancel()) {
              <m3-button
                variant="text"
                icon="delete_outline"
                customClass="text-error"
                ariaLabel="Anular y retirar comanda del tablero"
                (action)="confirmCancel.set(true)">
                Anular
              </m3-button>
            } @else {
              <div class="flex items-center gap-1.5 bg-error-box/45 px-2.5 py-1 rounded-m3-full">
                <span class="text-label-sm font-semibold text-error px-1">¿Confirmar anulación?</span>
                <m3-button
                  variant="text"
                  size="sm"
                  (action)="confirmCancel.set(false)">
                  No
                </m3-button>
                <m3-button
                  variant="filled"
                  size="sm"
                  icon="delete_forever"
                  customClass="bg-error text-on-error"
                  ariaLabel="Confirmar anulación definitiva de comanda"
                  (action)="onConfirmCancel(activeOrder.id)">
                  Confirmar
                </m3-button>
              </div>
            }

            <m3-button variant="text" (action)="closed.emit()">
              Cerrar
            </m3-button>
          </div>

          <div class="flex items-center touch-gap-8 ml-auto">
            @if (activeOrder.stage !== 'queue') {
              <m3-button
                variant="outlined"
                icon="arrow_back"
                (action)="onRegress(activeOrder.id)">
                Regresar
              </m3-button>
            }
            @if (activeOrder.stage !== 'ready') {
              <m3-button
                variant="filled"
                icon="check"
                (action)="onAdvance(activeOrder.id)">
                Avanzar Etapa
              </m3-button>
            } @else {
              <m3-button
                variant="filled"
                icon="done_all"
                (action)="onDispatch(activeOrder.id)">
                Entregar Comanda
              </m3-button>
            }
          </div>
        </footer>
        </div>
      }
    </m3-dialog>
  `
})
export class KanbanInspectModalComponent {
  readonly open = input<boolean>(false);
  readonly order = input<KanbanOrder | null>(null);
  readonly viewTransitionName = input<string | null>(null);
  readonly staffOptions = input<readonly string[]>(['Asignación pendiente']);

  readonly closed = output<void>();
  readonly advance = output<string>();
  readonly regress = output<string>();
  readonly moveStage = output<{ orderId: string; stage: OrderStage }>();
  readonly dispatch = output<string>();
  readonly cancelOrder = output<string>();
  readonly assignStaff = output<{ orderId: string; staff: string }>();
  readonly toggleItem = output<{ orderId: string; itemId: string }>();
  readonly setBlocked = output<{ orderId: string; reason: string | null }>();

  readonly stageTiles = STAGE_TILES;
  readonly blockReasons = KANBAN_BLOCK_REASONS;

  readonly confirmCancel = signal<boolean>(false);
  readonly showHoldPicker = signal<boolean>(false);
  private readonly injector = inject(Injector);
  private readonly inspectScrollBody = viewChild<ElementRef<HTMLElement>>('inspectScrollBody');
  private wasOpen = false;

  readonly dialogHeadline = computed(() => {
    const activeOrder = this.order();
    return activeOrder ? `Comanda ${activeOrder.ticketNumber}` : 'Detalle de Comanda';
  });

  readonly isBreached = computed(() => {
    const activeOrder = this.order();
    return activeOrder ? isOrderSlaBreached(activeOrder) : false;
  });

  readonly isBlocked = computed(() => {
    const activeOrder = this.order();
    return activeOrder ? isOrderBlocked(activeOrder) : false;
  });

  readonly itemProgress = computed(() => {
    const activeOrder = this.order();
    return activeOrder ? getOrderItemProgress(activeOrder) : { done: 0, total: 0, percent: 0 };
  });

  readonly priorityBadgeClass = computed(() => {
    const activeOrder = this.order();
    return activeOrder ? PRIORITY_BADGE_CLASSES[activeOrder.priority] : PRIORITY_BADGE_CLASSES.medium;
  });

  readonly priorityLabel = computed(() => {
    const activeOrder = this.order();
    return activeOrder ? PRIORITY_LABELS[activeOrder.priority] : PRIORITY_LABELS.medium;
  });

  readonly resolvedStaffOptions = computed<string[]>(() => {
    const base = [...this.staffOptions()];
    const current = this.order()?.assignedStaff?.trim();
    if (current && !base.includes(current)) {
      return [current, ...base];
    }
    return base;
  });

  constructor() {
    effect(() => {
      const isOpen = this.open() && Boolean(this.order());
      if (isOpen && !this.wasOpen) {
        untracked(() => {
          this.confirmCancel.set(false);
          this.showHoldPicker.set(false);
          afterNextRender(
            () => {
              const scrollEl = this.inspectScrollBody()?.nativeElement;
              if (scrollEl) {
                scrollEl.scrollTop = 0;
              }
            },
            { injector: this.injector }
          );
        });
      }
      this.wasOpen = isOpen;
    });
  }

  onStageJump(orderId: string, stage: OrderStage): void {
    this.moveStage.emit({ orderId, stage });
  }

  applyHoldReason(orderId: string, reason: string): void {
    this.setBlocked.emit({ orderId, reason });
    this.showHoldPicker.set(false);
  }

  onStaffChange(orderId: string, event: Event): void {
    const staff = (event.target as HTMLSelectElement).value;
    this.assignStaff.emit({ orderId, staff });
  }

  onRegress(orderId: string): void {
    this.regress.emit(orderId);
    this.closed.emit();
  }

  onAdvance(orderId: string): void {
    this.advance.emit(orderId);
    this.closed.emit();
  }

  onDispatch(orderId: string): void {
    this.dispatch.emit(orderId);
  }

  onConfirmCancel(orderId: string): void {
    this.confirmCancel.set(false);
    this.cancelOrder.emit(orderId);
  }
}
