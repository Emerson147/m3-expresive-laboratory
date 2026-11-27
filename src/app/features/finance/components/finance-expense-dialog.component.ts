import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import {
  CreateFinanceExpenseDto,
  FINANCE_EXPENSE_CATEGORY_META,
  FinanceExpenseCategory,
  FinanceExpenseRecurrence
} from '../../../core/finance/finance.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3RadioGroupComponent, M3RadioOption } from '../../../shared/components/radio/radio.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const RECURRENCE_OPTIONS: M3RadioOption[] = [
  {
    value: 'variable-event',
    label: 'Gasto variable puntual',
    description: 'Se imputa completo en la fecha registrada (insumos, compras, mantenimiento)'
  },
  {
    value: 'monthly-fixed',
    label: 'Costo fijo mensual',
    description: 'Se prorratea automáticamente entre Hoy (1/30), 7 días y 30 días'
  }
];

const CATEGORY_OPTIONS = (
  Object.keys(FINANCE_EXPENSE_CATEGORY_META) as FinanceExpenseCategory[]
).map((key) => ({
  value: key,
  label: FINANCE_EXPENSE_CATEGORY_META[key].label
}));

/**
 * Top-Layer native `<m3-dialog>` for registering operating expenses (fixed or variable).
 * Enforces M3 Filled TextFields inside dialogs and deferred inline validation.
 */
@Component({
  selector: 'app-finance-expense-dialog',
  standalone: true,
  imports: [M3ButtonComponent, M3DialogComponent, M3RadioGroupComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-dialog
      variant="expressive"
      tone="primary"
      icon="add_card"
      headline="Registrar Gasto Operativo"
      ariaDescription="Agrega un costo fijo mensual o gasto puntual al estado de resultados"
      [open]="open()"
      [managedClose]="managedClose()"
      [viewTransitionName]="viewTransitionName()"
      (openChange)="onOpenChange($event)"
      (closeRequested)="closeRequested.emit()">
      <form (submit)="onFormSubmit($event)" class="space-y-4">
        <m3-radio-group
          legend="Tipo de imputación contable"
          [options]="recurrenceOptions"
          [value]="recurrence()"
          (valueChange)="onRecurrenceChange($event)" />

        <m3-text-field
          label="Concepto del gasto"
          placeholder="Ej: Compra café en grano o mantenimiento"
          variant="filled"
          [required]="true"
          [minlength]="3"
          [value]="title()"
          [errorText]="titleError()"
          (valueChange)="onTitleChange($event)" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          <m3-text-field
            label="Monto (S/)"
            placeholder="0.00"
            variant="filled"
            type="number"
            inputMode="decimal"
            prefix="S/"
            [required]="true"
            [clearable]="true"
            [value]="amountText()"
            [errorText]="amountError()"
            (valueChange)="onAmountChange($event)" />

          <div class="space-y-1">
            <label for="finance-expense-category" class="text-label-sm-emphasized text-muted block">
              Categoría contable
            </label>
            <select
              id="finance-expense-category"
              class="m3-select-field w-full"
              [value]="category()"
              (change)="onCategorySelect($event)">
              @for (cat of categories; track cat.value) {
                <option [value]="cat.value">{{ cat.label }}</option>
              }
            </select>
          </div>
        </div>

        <m3-text-field
          label="Referencia o comprobante (opcional)"
          placeholder="Ej: F001-00412 / Recibo"
          variant="filled"
          [value]="receiptRef()"
          (valueChange)="receiptRef.set($event)" />
      </form>

      <div dialog-actions class="flex flex-wrap items-center justify-end gap-2">
        <m3-button variant="text" (action)="closeRequested.emit()">
          Cancelar
        </m3-button>
        <m3-button variant="filled" icon="check" (action)="submitExpense()">
          Guardar Gasto
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class FinanceExpenseDialogComponent {
  readonly open = input.required<boolean>();
  readonly managedClose = input<boolean>(false);
  readonly viewTransitionName = input<string | null>(null);

  readonly openChange = output<boolean>();
  readonly closeRequested = output<void>();
  readonly confirmExpense = output<CreateFinanceExpenseDto>();

  readonly recurrenceOptions = RECURRENCE_OPTIONS;
  readonly categories = CATEGORY_OPTIONS;

  readonly recurrence = signal<FinanceExpenseRecurrence>('variable-event');
  readonly category = signal<FinanceExpenseCategory>('supplies');
  readonly title = signal<string>('');
  readonly amountText = signal<string>('');
  readonly receiptRef = signal<string>('');

  readonly titleError = signal<string | null>(null);
  readonly amountError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.recurrence.set('variable-event');
        this.category.set('supplies');
        this.title.set('');
        this.amountText.set('');
        this.receiptRef.set('');
        this.titleError.set(null);
        this.amountError.set(null);
      }
    });
  }

  onRecurrenceChange(val: string): void {
    if (val === 'monthly-fixed' || val === 'variable-event') {
      this.recurrence.set(val);
    }
  }

  onTitleChange(val: string): void {
    this.title.set(val);
    if (val.trim().length >= 3) {
      this.titleError.set(null);
    }
  }

  onAmountChange(val: string): void {
    this.amountText.set(val);
    const parsed = Number(val);
    if (Number.isFinite(parsed) && parsed > 0) {
      this.amountError.set(null);
    }
  }

  onCategorySelect(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as FinanceExpenseCategory);
  }

  onOpenChange(isOpen: boolean): void {
    this.openChange.emit(isOpen);
    if (!isOpen) {
      this.closeRequested.emit();
    }
  }

  onFormSubmit(event: Event): void {
    event.preventDefault();
    this.submitExpense();
  }

  submitExpense(): void {
    const cleanTitle = this.title().trim();
    const parsedAmount = Number(this.amountText());

    let valid = true;
    if (cleanTitle.length < 3) {
      this.titleError.set('Ingresa un concepto de al menos 3 caracteres.');
      valid = false;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      this.amountError.set('Ingresa un monto mayor a S/ 0.00.');
      valid = false;
    }
    if (!valid) return;

    this.confirmExpense.emit({
      title: cleanTitle,
      category: this.category(),
      recurrence: this.recurrence(),
      amount: parsedAmount,
      receiptRef: this.receiptRef().trim() || undefined
    });
  }
}
