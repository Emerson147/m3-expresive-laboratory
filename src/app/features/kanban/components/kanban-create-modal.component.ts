import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  output,
  input,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateOrderDto,
  OrderCategory,
  OrderPriority
} from '../../../core/kanban/kanban.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3RadioGroupComponent, M3RadioOption } from '../../../shared/components/radio/radio.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { KANBAN_SELECT_STYLES } from './kanban-expressive.styles';

const PRIORITY_OPTIONS: M3RadioOption[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

@Component({
  selector: 'app-kanban-create-modal',
  standalone: true,
  imports: [FormsModule, M3ButtonComponent, M3RadioGroupComponent, M3TextFieldComponent],
  encapsulation: ViewEncapsulation.None,
  styles: [KANBAN_SELECT_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 bg-scrim backdrop-blur-md flex items-center justify-center p-4 sm:p-6 m3-dialog-backdrop"
      (click)="closed.emit()">

      <div
        id="kanban-create-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kds-create-title"
        [style.view-transition-name]="isDialogTransitionActive() ? 'dialog-transform' : null"
        [class.shadow-m3-level3]="!isDialogTransitionActive()"
        class="w-full max-w-lg max-h-[92vh] overflow-y-auto m3-scrollbar bg-surface-box rounded-m3-xl p-6 sm:p-7 m3-dialog-surface text-main flex flex-col gap-5"
        (click)="$event.stopPropagation()">

        <!-- Dialog Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-m3-full bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">receipt_long</span>
            </div>
            <div class="min-w-0">
              <h2
                #modalHeading
                id="kds-create-title"
                tabindex="-1"
                class="text-title-lg font-bold tracking-tight focus:outline-none">
                Nueva Comanda
              </h2>
              <p class="text-label-md text-muted truncate">Ingreso directo a cola operativa KDS</p>
            </div>
          </div>

          <m3-button
            variant="text"
            size="sm"
            [iconOnly]="true"
            icon="close"
            ariaLabel="Cerrar formulario de nueva comanda"
            (action)="closed.emit()" />
        </div>

        <!-- Unified M3 Filled Form with Deferred Post-Interaction Validation -->
        <form (ngSubmit)="onFormSubmit()" novalidate class="flex flex-col gap-5">
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

          <!-- Mutually Exclusive 4-Option Priority Selector (< 6 options -> Radio Group) -->
          <div class="p-4 rounded-m3-lg bg-surface-low">
            <m3-radio-group
              legend="Prioridad de Atención"
              name="kdsCreatePriority"
              orientation="horizontal"
              [options]="priorityOptions"
              [(value)]="priority" />
          </div>

          <!-- Station & SLA Target Selectors (Matching 58px M3 Filled Field Geometry) -->
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
                <option value="kitchen">Cocina Caliente</option>
                <option value="cold_chain">Cadena de Frío</option>
                <option value="express">Delivery Express</option>
                <option value="dispatch">Despacho</option>
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
                <option value="10">10 min · Express</option>
                <option value="15">15 min · Estándar</option>
                <option value="20">20 min · Elaborado</option>
                <option value="25">25 min · Banquete</option>
              </select>
            </div>
          </div>

          <!-- Consistent Filled Multiline Auto-Grow Textarea -->
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

          <!-- Dialog Footer (Submit button stays enabled; validation feedback appears post-attempt) -->
          <div class="flex items-center justify-end touch-gap-8 pt-1">
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
        </form>
      </div>
    </div>
  `
})
export class KanbanCreateModalComponent {
  readonly isDialogTransitionActive = input<boolean>(false);

  readonly closed = output<void>();
  readonly submitted = output<CreateOrderDto>();

  readonly priorityOptions = PRIORITY_OPTIONS;

  readonly tableOrClient = signal<string>('Mesa 7 · Barra Lounge');
  readonly priority = signal<string>('high');
  readonly category = signal<OrderCategory>('kitchen');
  readonly prepTimeTargetMin = signal<number>(15);
  readonly specialInstructions = signal<string>('Preparar en Wok 1 con picante moderado.');

  readonly tableTouched = signal<boolean>(false);
  readonly submitAttempted = signal<boolean>(false);

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

  private readonly modalHeading = viewChild<ElementRef<HTMLHeadingElement>>('modalHeading');
  private readonly tableField = viewChild<M3TextFieldComponent>('tableField');

  constructor() {
    afterNextRender(() => {
      this.modalHeading()?.nativeElement.focus({ preventScroll: true });
    });
  }

  onTableValueChange(nextValue: string): void {
    this.tableOrClient.set(nextValue);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as OrderCategory;
    this.category.set(value);
  }

  onSlaTargetChange(event: Event): void {
    const parsed = Number((event.target as HTMLSelectElement).value);
    this.prepTimeTargetMin.set(Number.isFinite(parsed) && parsed > 0 ? parsed : 15);
  }

  onFormSubmit(): void {
    this.submitAttempted.set(true);
    const trimmedTable = this.tableOrClient().trim();
    if (trimmedTable.length < 2) {
      this.tableField()?.focus();
      return;
    }

    this.submitted.emit({
      tableOrClient: trimmedTable,
      priority: this.priority() as OrderPriority,
      category: this.category(),
      prepTimeTargetMin: this.prepTimeTargetMin(),
      specialInstructions: this.specialInstructions().trim() || undefined
    });
  }
}
