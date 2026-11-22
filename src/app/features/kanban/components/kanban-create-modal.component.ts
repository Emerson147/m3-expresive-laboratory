import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  KANBAN_MENU_PRESETS,
  OrderCategory,
  OrderPriority
} from '../../../core/kanban/kanban.models';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { KANBAN_SELECT_STYLES } from './kanban-expressive.styles';

const PRIORITY_GROUP_OPTIONS: readonly M3ButtonGroupOption[] = [
  { id: 'low', label: 'Baja', icon: 'low_priority' },
  { id: 'medium', label: 'Media', icon: 'schedule' },
  { id: 'high', label: 'Alta', icon: 'priority_high' },
  { id: 'urgent', label: 'Urgente', icon: 'local_fire_department' }
];

@Component({
  selector: 'app-kanban-create-modal',
  standalone: true,
  imports: [
    FormsModule,
    M3DialogComponent,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3TextFieldComponent
  ],
  styles: [KANBAN_SELECT_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="basic"
      size="lg"
      [open]="open()"
      [managedClose]="true"
      [showCloseButton]="false"
      headline="Nueva Comanda"
      [viewTransitionName]="viewTransitionName()"
      customClass="kds-create-dialog"
      (closeRequested)="closed.emit()">

      <div id="kanban-create-dialog" class="flex flex-col flex-1 min-h-0 overflow-hidden">
        <!-- Floating Tonal Header -->
        <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-2.5 shrink-0">
        <header class="bg-surface rounded-m3-xl p-4 flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-xl" aria-hidden="true">receipt_long</span>
            </div>
            <div class="min-w-0">
              <h3 id="kds-create-title" class="text-title-lg-emphasized text-main leading-tight">
                Nueva Comanda
              </h3>
              <p class="text-label-md text-muted truncate mt-0.5">
                Ingreso directo a cola operativa KDS
              </p>
            </div>
          </div>

          <m3-button
            variant="text"
            size="sm"
            [iconOnly]="true"
            icon="close"
            ariaLabel="Cerrar formulario de nueva comanda"
            (action)="closed.emit()" />
        </header>
      </div>

      <!-- Structured Form Shell (Non-shrinking scrollable body + fixed footer) -->
      <form
        (ngSubmit)="onFormSubmit()"
        novalidate
        class="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div class="px-5 sm:px-6 py-2.5 flex-1 min-h-0 overflow-y-auto m3-scrollbar space-y-4">
          <m3-text-field
            #tableField
            [id]="'kds-create-table'"
            name="tableOrClient"
            variant="filled"
            label="Mesa o Canal de Pedido"
            placeholder="Ej. Mesa 7 · Barra Lounge"
            icon="table_restaurant"
            autocomplete="off"
            enterkeyhint="next"
            [required]="true"
            [minlength]="2"
            [maxlength]="50"
            [clearable]="true"
            [showValidState]="true"
            [value]="tableOrClient()"
            [isError]="tableErrorMessage() !== null"
            [errorText]="tableErrorMessage()"
            supportingText="Obligatorio · Mínimo 2 caracteres"
            (valueChange)="onTableValueChange($event)"
            (inputBlur)="tableTouched.set(true)"
            (clear)="onTableValueChange('')" />

          <!-- Connected Priority Selector (<m3-button-group variant="connected">) -->
          <div class="p-3.5 sm:p-4 rounded-m3-xl bg-surface-low space-y-2.5">
            <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block">
              Prioridad de Atención
            </span>
            <m3-button-group
              class="kds-priority-group-host"
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Prioridad de Atención"
              customClass="kds-priority-group"
              [options]="priorityGroupOptions"
              [value]="selectedPriorityGroup()"
              (selectionChange)="onPrioritySelectionChange($event)" />
          </div>

          <!-- Station & SLA Target Selectors -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="kds-filled-select-wrap">
              <label for="kds-create-category" class="kds-filled-select-label">
                Estación / Categoría
              </label>
              <select
                id="kds-create-category"
                name="category"
                class="kds-select"
                [value]="category()"
                (change)="onCategoryChange($event)">
                <option value="kitchen" [selected]="category() === 'kitchen'">Cocina Caliente</option>
                <option value="cold_chain" [selected]="category() === 'cold_chain'">Cadena de Frío</option>
                <option value="express" [selected]="category() === 'express'">Delivery Express</option>
                <option value="dispatch" [selected]="category() === 'dispatch'">Despacho</option>
              </select>
            </div>

            <div class="kds-filled-select-wrap">
              <label for="kds-create-sla" class="kds-filled-select-label">
                Meta SLA Cocina
              </label>
              <select
                id="kds-create-sla"
                name="prepTimeTargetMin"
                class="kds-select"
                [value]="prepTimeTargetMin()"
                (change)="onSlaTargetChange($event)">
                <option value="10" [selected]="prepTimeTargetMin() === 10">10 min · Express</option>
                <option value="15" [selected]="prepTimeTargetMin() === 15">15 min · Estándar</option>
                <option value="20" [selected]="prepTimeTargetMin() === 20">20 min · Elaborado</option>
                <option value="25" [selected]="prepTimeTargetMin() === 25">25 min · Banquete</option>
              </select>
            </div>
          </div>

          <!-- Interactive Menu Dish Composer -->
          <div class="p-3.5 sm:p-4 rounded-m3-xl bg-surface-low space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <div>
                <span class="text-label-sm-emphasized uppercase tracking-wider text-muted block">
                  Composición de Platos
                </span>
                <span class="text-label-sm text-muted">
                  Si dejás en 0, se asigna el menú predeterminado de la estación.
                </span>
              </div>
              <span class="font-mono tabular-nums text-label-md-emphasized px-2.5 py-1 rounded-m3-full bg-primary-box text-on-primary-box shrink-0">
                {{ totalUnitsCount() }} uds · S/ {{ composedTotal().toFixed(2) }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              @for (dish of menuPresets; track dish.id) {
                @let qty = itemQuantities()[dish.id] || 0;
                <div
                  [class]="'p-2 rounded-m3-lg flex items-center justify-between gap-2 transition-colors ' + (qty > 0 ? 'bg-primary-box/35' : 'bg-surface')">
                  <div class="min-w-0">
                    <span class="text-body-sm font-medium text-main block truncate">{{ dish.name }}</span>
                    <span class="text-label-sm font-mono tabular-nums text-muted">S/ {{ dish.price.toFixed(2) }}</span>
                  </div>

                  <div class="inline-flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      (click)="adjustDishQty(dish.id, -1)"
                      [disabled]="qty <= 0"
                      [attr.aria-label]="'Quitar ' + dish.name"
                      class="w-7 h-7 rounded-m3-full bg-surface-high grid place-items-center text-main disabled:opacity-30 state-layer focus-ring-m3">
                      <span class="material-symbols-rounded text-base" aria-hidden="true">remove</span>
                    </button>
                    <span class="w-6 text-center font-mono tabular-nums text-label-md-emphasized">{{ qty }}</span>
                    <button
                      type="button"
                      (click)="adjustDishQty(dish.id, 1)"
                      [attr.aria-label]="'Agregar ' + dish.name"
                      class="w-7 h-7 rounded-m3-full bg-primary text-on-primary grid place-items-center state-layer focus-ring-m3">
                      <span class="material-symbols-rounded text-base" aria-hidden="true">add</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Filled Multiline Auto-Grow Textarea -->
          <m3-text-field
            [id]="'kds-create-instructions'"
            name="specialInstructions"
            variant="filled"
            label="Instrucciones para Cocina"
            placeholder="Especificaciones de cocción, alérgenos o empaque..."
            icon="description"
            [multiline]="true"
            [autoGrow]="true"
            [rows]="2"
            [maxlength]="200"
            [value]="specialInstructions()"
            (valueChange)="specialInstructions.set($event)"
            supportingText="Notas críticas visibles para cocineros y despachadores" />
        </div>

        <!-- Pinned Divider-Free Dialog Footer -->
        <footer class="px-5 sm:px-6 pt-3 pb-5 sm:pb-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span class="text-label-md font-mono tabular-nums text-muted">
            @if (totalUnitsCount() > 0) {
              Total estimado: <strong class="text-main">S/ {{ composedTotal().toFixed(2) }}</strong>
            } @else {
              Menú automático de estación
            }
          </span>

          <div class="flex items-center touch-gap-8 ml-auto">
            <m3-button
              type="button"
              variant="text"
              (action)="closed.emit()">
              Cancelar
            </m3-button>
            <m3-button
              type="submit"
              variant="filled"
              icon="check">
              Crear Comanda
            </m3-button>
          </div>
        </footer>
      </form>
      </div>
    </m3-dialog>
  `
})
export class KanbanCreateModalComponent {
  readonly open = input<boolean>(false);
  readonly viewTransitionName = input<string | null>(null);

  readonly closed = output<void>();
  readonly submitted = output<CreateOrderDto>();

  readonly priorityGroupOptions = [...PRIORITY_GROUP_OPTIONS];
  readonly menuPresets = KANBAN_MENU_PRESETS;

  readonly tableOrClient = signal<string>('Mesa 7 · Barra Lounge');
  readonly priority = signal<OrderPriority>('high');
  readonly category = signal<OrderCategory>('kitchen');
  readonly prepTimeTargetMin = signal<number>(15);
  readonly specialInstructions = signal<string>('Preparar en Wok 1 con picante moderado.');
  readonly itemQuantities = signal<Record<string, number>>({
    'menu-lomo': 1,
    'menu-chicha': 1
  });

  readonly tableTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);
  private wasOpen = false;

  readonly selectedPriorityGroup = computed<string[]>(() => [this.priority()]);

  readonly selectedItemsDto = computed<CreateOrderItemDto[]>(() => {
    const counts = this.itemQuantities();
    const list: CreateOrderItemDto[] = [];
    for (const preset of this.menuPresets) {
      const qty = counts[preset.id] || 0;
      if (qty > 0) {
        list.push({
          name: preset.name,
          quantity: qty,
          category: preset.category,
          price: preset.price
        });
      }
    }
    return list;
  });

  readonly totalUnitsCount = computed(() =>
    this.selectedItemsDto().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly composedTotal = computed(() =>
    Math.round(
      this.selectedItemsDto().reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100
  );

  readonly tableErrorMessage = computed<string | null>(() => {
    if (!this.tableTouched() && !this.submitAttempted()) {
      return null;
    }
    const trimmed = this.tableOrClient().trim();
    if (trimmed.length === 0) {
      return 'Ingresá una mesa o canal para emitir la comanda.';
    }
    if (trimmed.length < 2) {
      return 'Ingresá al menos 2 caracteres para identificar la mesa o canal.';
    }
    return null;
  });

  private readonly tableField = viewChild<M3TextFieldComponent>('tableField');

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        untracked(() => {
          this.tableTouched.set(false);
          this.submitAttempted.set(false);
          this.tableOrClient.set('Mesa 7 · Barra Lounge');
          this.priority.set('high');
          this.category.set('kitchen');
          this.prepTimeTargetMin.set(15);
          this.specialInstructions.set('Preparar en Wok 1 con picante moderado.');
          this.itemQuantities.set({ 'menu-lomo': 1, 'menu-chicha': 1 });
        });
      }
      this.wasOpen = isOpen;
    });
  }

  onTableValueChange(nextValue: string): void {
    this.tableOrClient.set(nextValue);
  }

  onPrioritySelectionChange(selected: string[]): void {
    const next = selected[0];
    if (next === 'low' || next === 'medium' || next === 'high' || next === 'urgent') {
      this.priority.set(next);
    }
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as OrderCategory;
    this.category.set(value);
  }

  onSlaTargetChange(event: Event): void {
    const parsed = Number((event.target as HTMLSelectElement).value);
    this.prepTimeTargetMin.set(Number.isFinite(parsed) && parsed > 0 ? parsed : 15);
  }

  adjustDishQty(dishId: string, delta: 1 | -1): void {
    this.itemQuantities.update(prev => {
      const current = prev[dishId] || 0;
      const next = Math.max(0, Math.min(20, current + delta));
      return { ...prev, [dishId]: next };
    });
  }

  onFormSubmit(): void {
    this.submitAttempted.set(true);
    const trimmedTable = this.tableOrClient().trim();
    if (trimmedTable.length < 2) {
      this.tableField()?.focus();
      return;
    }

    const customItems = this.selectedItemsDto();
    this.submitted.emit({
      tableOrClient: trimmedTable,
      priority: this.priority(),
      category: this.category(),
      prepTimeTargetMin: this.prepTimeTargetMin(),
      specialInstructions: this.specialInstructions().trim() || undefined,
      items: customItems.length > 0 ? customItems : undefined,
      totalAmount: customItems.length > 0 ? this.composedTotal() : undefined
    });
  }
}
