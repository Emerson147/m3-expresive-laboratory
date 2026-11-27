import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { SaleLedgerRecord } from '../../../core/sales/sales-ledger.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3RadioGroupComponent, M3RadioOption } from '../../../shared/components/radio/radio.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const VOID_REASON_PRESETS: M3RadioOption[] = [
  { value: 'Error en método de pago o monto cobrado', label: 'Error de cobro', description: 'Diferencia entre monto marcado y voucher POS/Yape' },
  { value: 'Cliente devolvió pedido o cambió de orden', label: 'Devolución de cliente', description: 'Reemplazo antes o después de entrega' },
  { value: 'Comprobante duplicado en turno activo', label: 'Duplicado de caja', description: 'Emisión doble en la misma mesa o pedido' }
];

/**
 * Always-mounted Top-Layer native `<m3-dialog>` for issuing a Credit Note / Voiding a sale.
 * Enforces M3 Rules: Filled TextFields inside dialogs, deferred `:user-invalid` validation,
 * single-owner `dialog-transform` morph, and single Filled confirmation CTA.
 */
@Component({
  selector: 'app-sales-void-dialog',
  standalone: true,
  imports: [M3ButtonComponent, M3DialogComponent, M3RadioGroupComponent, M3TextFieldComponent],
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-dialog
      variant="expressive"
      tone="error"
      icon="receipt_long"
      headline="Emitir Nota de Crédito"
      [ariaDescription]="record() ? 'Anulación fiscal de ' + record()!.saleId + ' por S/ ' + record()!.total.toFixed(2) : 'Anulación fiscal de comprobante'"
      [open]="open()"
      [managedClose]="managedClose()"
      [viewTransitionName]="viewTransitionName()"
      (openChange)="onOpenChange($event)"
      (closeRequested)="closeRequested.emit()">
      <form (submit)="submitVoid($event)" class="space-y-4">
        <m3-radio-group
          legend="Motivo estándar SUNAT"
          [options]="reasonPresets"
          [value]="selectedPreset()"
          (valueChange)="onPresetSelected($event)" />

        <m3-text-field
          label="Sustento detallado para auditoría (mín. 5 chars)"
          variant="filled"
          [multiline]="true"
          [autoGrow]="true"
          [required]="true"
          [minlength]="5"
          [value]="customReason()"
          [errorText]="validationError()"
          (valueChange)="onReasonInput($event)" />
      </form>

      <div dialog-actions class="flex flex-wrap items-center justify-end gap-2">
        <m3-button variant="text" (action)="closeRequested.emit()">
          Cancelar
        </m3-button>
        <m3-button
          variant="filled"
          icon="delete_forever"
          (action)="onConfirmClick()">
          Confirmar Nota Crédito
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class SalesVoidDialogComponent {
  readonly open = input.required<boolean>();
  readonly record = input<SaleLedgerRecord | null>(null);
  readonly managedClose = input<boolean>(false);
  readonly viewTransitionName = input<string | null>(null);

  readonly openChange = output<boolean>();
  readonly closeRequested = output<void>();
  readonly confirmVoid = output<string>();

  readonly reasonPresets = VOID_REASON_PRESETS;
  readonly selectedPreset = signal<string>(VOID_REASON_PRESETS[0].value);
  readonly customReason = signal<string>(VOID_REASON_PRESETS[0].value);
  readonly validationError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.open()) {
        const defaultReason = VOID_REASON_PRESETS[0].value;
        this.selectedPreset.set(defaultReason);
        this.customReason.set(defaultReason);
        this.validationError.set(null);
      }
    });
  }

  onPresetSelected(val: string): void {
    this.selectedPreset.set(val);
    this.customReason.set(val);
    this.validationError.set(null);
  }

  onReasonInput(val: string): void {
    this.customReason.set(val);
    if (val.trim().length >= 5) {
      this.validationError.set(null);
    }
  }

  onOpenChange(nextOpen: boolean): void {
    this.openChange.emit(nextOpen);
    if (!nextOpen) {
      this.closeRequested.emit();
    }
  }

  submitVoid(event: Event): void {
    event.preventDefault();
    this.onConfirmClick();
  }

  onConfirmClick(): void {
    const clean = this.customReason().trim();
    if (clean.length < 5) {
      this.validationError.set('Ingresa un motivo válido de al menos 5 caracteres.');
      return;
    }
    this.validationError.set(null);
    this.confirmVoid.emit(clean);
  }
}
