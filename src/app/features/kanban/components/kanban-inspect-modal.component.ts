import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  input,
  output,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  KanbanOrder,
  OrderPriority,
  isOrderSlaBreached
} from '../../../core/kanban/kanban.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
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

@Component({
  selector: 'app-kanban-inspect-modal',
  standalone: true,
  imports: [CommonModule, M3ButtonComponent],
  encapsulation: ViewEncapsulation.None,
  styles: [KANBAN_SELECT_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 bg-scrim backdrop-blur-md flex items-center justify-center p-4 sm:p-6 m3-dialog-backdrop"
      (click)="closed.emit()">

      <div
        id="kanban-inspect-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kds-inspect-title"
        [style.view-transition-name]="isDialogTransitionActive() ? 'dialog-transform' : null"
        [class.shadow-m3-level3]="!isDialogTransitionActive()"
        class="w-full max-w-xl bg-surface-box rounded-m3-xl p-6 sm:p-7 overflow-hidden m3-dialog-surface text-main flex flex-col gap-5"
        (click)="$event.stopPropagation()">

        <!-- Dialog Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-m3-full bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">receipt_long</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center flex-wrap gap-2">
                <h2
                  #modalHeading
                  id="kds-inspect-title"
                  tabindex="-1"
                  class="text-title-lg font-bold tracking-tight focus:outline-none">
                  Comanda {{ order().ticketNumber }}
                </h2>
                <span
                  class="text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full uppercase tracking-wider"
                  [ngClass]="priorityBadgeClass()">
                  {{ priorityLabel() }}
                </span>
              </div>
              <p class="text-label-md text-muted truncate">
                {{ order().tableOrClient }} · Ingreso {{ order().createdAt }}
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
        </div>

        <!-- Scrollable Order Details (divider-free tonal hierarchy) -->
        <div class="space-y-4 max-h-[60vh] overflow-y-auto m3-scrollbar pr-1">
          <!-- Stage Pipeline -->
          <div class="p-4 rounded-m3-lg bg-surface-low space-y-2.5">
            <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block">
              Pipeline Operativo
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-label-sm">
              <div
                class="p-2.5 rounded-m3-md transition-colors"
                [class]="order().stage === 'queue' ? 'bg-primary text-on-primary' : 'bg-surface text-muted'">
                <span class="material-symbols-rounded block text-sm" aria-hidden="true">inbox</span>
                <span class="font-medium">Entrada</span>
              </div>
              <div
                class="p-2.5 rounded-m3-md transition-colors"
                [class]="order().stage === 'prep' ? 'bg-warning-box text-on-warning-box' : 'bg-surface text-muted'">
                <span class="material-symbols-rounded block text-sm" aria-hidden="true">skillet</span>
                <span class="font-medium">Cocina</span>
              </div>
              <div
                class="p-2.5 rounded-m3-md transition-colors"
                [class]="order().stage === 'qa' ? 'bg-tertiary-box text-on-tertiary-box' : 'bg-surface text-muted'">
                <span class="material-symbols-rounded block text-sm" aria-hidden="true">fact_check</span>
                <span class="font-medium">Calidad</span>
              </div>
              <div
                class="p-2.5 rounded-m3-md transition-colors"
                [class]="order().stage === 'ready' ? 'bg-success-box text-on-success-box' : 'bg-surface text-muted'">
                <span class="material-symbols-rounded block text-sm" aria-hidden="true">check_circle</span>
                <span class="font-medium">Despacho</span>
              </div>
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
                [value]="order().assignedStaff || 'Asignación pendiente'"
                (change)="onStaffChange($event)">
                @for (staff of resolvedStaffOptions(); track staff) {
                  <option [value]="staff">{{ staff }}</option>
                }
              </select>
            </div>
            <div class="p-3.5 rounded-m3-lg bg-surface-low flex flex-col justify-center">
              <span class="text-muted block text-label-sm">Tiempo Transcurrido vs SLA</span>
              <span class="font-mono tabular-nums font-bold" [class.text-error]="isBreached()">
                {{ order().elapsedMinutes }} min / Meta: {{ order().prepTimeTargetMin }} min
              </span>
            </div>
          </div>

          @if (order().specialInstructions) {
            <div class="p-3.5 rounded-m3-lg bg-warning-box text-on-warning-box flex items-start gap-2.5 text-body-sm">
              <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">warning</span>
              <div>
                <span class="font-bold block">Instrucción Especial:</span>
                <span>{{ order().specialInstructions }}</span>
              </div>
            </div>
          }

          <!-- Dishes Breakdown -->
          <div class="space-y-2.5">
            <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block">
              Detalle de Platos y Bebidas
            </span>
            <ul role="list" class="list-none m-0 p-2 rounded-m3-lg bg-surface-low space-y-1.5">
              @for (item of order().items; track item.id) {
                <li class="p-3 rounded-m3-md bg-surface flex items-center justify-between gap-3 text-body-sm">
                  <div class="min-w-0">
                    <div class="font-semibold text-main">
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
              <span class="text-lg font-black text-primary">S/ {{ order().totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Dialog Actions -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex items-center touch-gap-8">
            <m3-button
              variant="text"
              icon="delete_outline"
              customClass="text-error"
              ariaLabel="Anular y retirar comanda del tablero"
              (action)="onCancelOrder()">
              Anular
            </m3-button>
            <m3-button variant="text" (action)="closed.emit()">
              Cerrar
            </m3-button>
          </div>

          <div class="flex items-center touch-gap-8">
            @if (order().stage !== 'queue') {
              <m3-button
                variant="outlined"
                icon="arrow_back"
                (action)="onRegress()">
                Regresar
              </m3-button>
            }
            @if (order().stage !== 'ready') {
              <m3-button
                variant="filled"
                icon="check"
                (action)="onAdvance()">
                Avanzar Etapa
              </m3-button>
            } @else {
              <m3-button
                variant="filled"
                icon="done_all"
                (action)="onDispatch()">
                Entregar Comanda
              </m3-button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class KanbanInspectModalComponent {
  readonly order = input.required<KanbanOrder>();
  readonly isDialogTransitionActive = input<boolean>(false);
  readonly staffOptions = input<readonly string[]>(['Asignación pendiente']);

  readonly closed = output<void>();
  readonly advance = output<string>();
  readonly regress = output<string>();
  readonly dispatch = output<string>();
  readonly cancelOrder = output<string>();
  readonly assignStaff = output<{ orderId: string; staff: string }>();

  private readonly modalHeading = viewChild<ElementRef<HTMLHeadingElement>>('modalHeading');

  readonly isBreached = computed(() => isOrderSlaBreached(this.order()));
  readonly priorityBadgeClass = computed(() => PRIORITY_BADGE_CLASSES[this.order().priority]);
  readonly priorityLabel = computed(() => PRIORITY_LABELS[this.order().priority]);
  readonly resolvedStaffOptions = computed<string[]>(() => {
    const base = [...this.staffOptions()];
    const current = this.order().assignedStaff?.trim();
    if (current && !base.includes(current)) {
      return [current, ...base];
    }
    return base;
  });

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus({ preventScroll: true });
    });
  }

  onStaffChange(event: Event): void {
    const staff = (event.target as HTMLSelectElement).value;
    this.assignStaff.emit({ orderId: this.order().id, staff });
  }

  onRegress(): void {
    this.regress.emit(this.order().id);
    this.closed.emit();
  }

  onAdvance(): void {
    this.advance.emit(this.order().id);
    this.closed.emit();
  }

  onDispatch(): void {
    this.dispatch.emit(this.order().id);
  }

  onCancelOrder(): void {
    this.cancelOrder.emit(this.order().id);
  }
}
