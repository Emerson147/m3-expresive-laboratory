import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PosCustomer } from '../../../core/pos/pos.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-pos-customer-modal',
  standalone: true,
  imports: [FormsModule, M3ButtonComponent, M3TextFieldComponent],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 bg-scrim z-40 m3-dialog-backdrop cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pos-customer-title"
      class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[460px] h-fit max-h-[calc(100vh-3rem)] bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-2xl z-50 space-y-4 m3-dialog-surface">

      <div class="flex items-center justify-between pb-2.5 border-b border-outline-sub">
        <h3
          #modalHeading
          id="pos-customer-title"
          tabindex="-1"
          class="font-bold text-base text-main outline-none">
          Identificación del Cliente
        </h3>
        <m3-button
          [iconOnly]="true"
          variant="text"
          size="sm"
          icon="close"
          ariaLabel="Cerrar identificación del cliente"
          (action)="close.emit()" />
      </div>

      <form (ngSubmit)="submitCustomer()" class="space-y-4">
        <div class="space-y-3">
          <div
            role="group"
            aria-label="Tipo de documento del cliente"
            class="grid grid-cols-2 gap-1.5 p-1 bg-surface-high rounded-full border border-outline-sub">
            <button
              type="button"
              [attr.aria-pressed]="docType() === 'DNI'"
              (click)="setDocType('DNI')"
              [class]="docType() === 'DNI' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 state-layer focus-ring-m3 py-2 rounded-full text-xs cursor-pointer">
              Persona Natural (DNI)
            </button>
            <button
              type="button"
              [attr.aria-pressed]="docType() === 'RUC'"
              (click)="setDocType('RUC')"
              [class]="docType() === 'RUC' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 state-layer focus-ring-m3 py-2 rounded-full text-xs cursor-pointer">
              Empresa Jurídica (RUC)
            </button>
          </div>

          <m3-text-field
            variant="filled"
            inputMode="numeric"
            [label]="docType() === 'RUC' ? 'RUC de la Empresa (11 dígitos)' : 'DNI del Cliente (8 dígitos)'"
            [placeholder]="docType() === 'RUC' ? '20601234567' : '72345678'"
            icon="badge"
            [maxlength]="docType() === 'RUC' ? 11 : 8"
            [(value)]="docNumber" />

          <m3-text-field
            variant="filled"
            [label]="docType() === 'RUC' ? 'Razón Social' : 'Nombre Completo'"
            [placeholder]="docType() === 'RUC' ? 'CORPORACIÓN ALIMENTARIA S.A.C.' : 'Carlos Mendoza Rojas'"
            icon="person"
            [(value)]="customerName" />
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-outline-sub">
          <m3-button variant="text" (action)="close.emit()">Cancelar</m3-button>
          <m3-button type="submit" variant="filled" icon="check" [morph]="true">
            Guardar Cliente
          </m3-button>
        </div>
      </form>
    </div>
  `
})
export class PosCustomerModalComponent {
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly initialCustomer = input.required<PosCustomer>();
  readonly close = output<void>();
  readonly save = output<PosCustomer>();

  readonly docType = signal<'DNI' | 'RUC'>('DNI');
  readonly docNumber = signal<string>('');
  readonly customerName = signal<string>('');

  constructor() {
    queueMicrotask(() => {
      const current = this.initialCustomer();
      this.docType.set(current.docType);
      this.docNumber.set(current.docNumber);
      this.customerName.set(current.name);
      this.modalHeading()?.nativeElement.focus();
    });
  }

  setDocType(type: 'DNI' | 'RUC'): void {
    this.docType.set(type);
    if (type === 'RUC' && this.docNumber().length <= 8) {
      this.docNumber.set('20601234567');
      this.customerName.set('EMPRESA GASTRONOMICA S.A.C.');
    } else if (type === 'DNI' && this.docNumber().length > 8) {
      this.docNumber.set('72345678');
      this.customerName.set('Carlos Mendoza Rojas');
    }
  }

  submitCustomer(): void {
    const type = this.docType();
    this.save.emit({
      docType: type,
      docNumber: this.docNumber().trim() || '00000000',
      name: this.customerName().trim() || 'Clientes Varios',
      isCompany: type === 'RUC'
    });
  }
}

