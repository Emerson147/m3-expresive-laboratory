import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
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

      <form (ngSubmit)="submitCustomer()" novalidate class="space-y-4">
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
            #docField
            variant="filled"
            inputMode="numeric"
            [label]="docType() === 'RUC' ? 'RUC de la Empresa (11 dígitos)' : 'DNI del Cliente (8 dígitos)'"
            [placeholder]="docType() === 'RUC' ? '20601234567' : '72345678'"
            icon="badge"
            [maxlength]="docType() === 'RUC' ? 11 : 8"
            [(value)]="docNumber"
            (inputBlur)="docTouched.set(true)"
            [errorText]="docError()"
            [supportingText]="docType() === 'RUC' ? 'Ingresá 11 dígitos numéricos del RUC.' : 'Ingresá 8 dígitos numéricos del DNI.'" />

          <m3-text-field
            #nameField
            variant="filled"
            [label]="docType() === 'RUC' ? 'Razón Social' : 'Nombre Completo'"
            [placeholder]="docType() === 'RUC' ? 'CORPORACIÓN ALIMENTARIA S.A.C.' : 'Carlos Mendoza Rojas'"
            icon="person"
            [(value)]="customerName"
            (inputBlur)="nameTouched.set(true)"
            [errorText]="nameError()"
            [supportingText]="docType() === 'RUC' ? 'Razón social registrada para facturación.' : 'Nombre completo o Clientes Varios.'" />
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
  private readonly docField = viewChild<M3TextFieldComponent>('docField');
  private readonly nameField = viewChild<M3TextFieldComponent>('nameField');

  readonly initialCustomer = input.required<PosCustomer>();
  readonly close = output<void>();
  readonly save = output<PosCustomer>();

  readonly docType = signal<'DNI' | 'RUC'>('DNI');
  readonly docNumber = signal<string>('');
  readonly customerName = signal<string>('');
  readonly docTouched = signal<boolean>(false);
  readonly nameTouched = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);

  private readonly docErrorRaw = computed<string | null>(() => {
    const value = this.docNumber().trim();
    if (!value) {
      return 'Ingresá el número de documento.';
    }
    if (this.docType() === 'RUC') {
      return /^\d{11}$/.test(value) ? null : 'El RUC debe tener exactamente 11 dígitos.';
    }
    return /^\d{8}$/.test(value) ? null : 'El DNI debe tener exactamente 8 dígitos.';
  });

  private readonly nameErrorRaw = computed<string | null>(() => {
    return this.customerName().trim().length >= 2
      ? null
      : 'Ingresá el nombre o razón social del cliente.';
  });

  readonly docError = computed<string | null>(() =>
    this.docTouched() || this.submitted() ? this.docErrorRaw() : null
  );

  readonly nameError = computed<string | null>(() =>
    this.nameTouched() || this.submitted() ? this.nameErrorRaw() : null
  );

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
    this.docTouched.set(false);
    this.submitted.set(false);

    const currentDoc = this.docNumber().trim();
    const currentName = this.customerName().trim();

    if (type === 'RUC') {
      if (!currentDoc || currentDoc === '00000000' || currentDoc === '72345678') {
        this.docNumber.set('20601234567');
      }
      if (!currentName || currentName === 'Clientes Varios' || currentName === 'Carlos Mendoza Rojas') {
        this.customerName.set('INVERSIONES GASTRONOMICAS S.A.C.');
      }
      return;
    }

    if (!currentDoc || currentDoc === '20601234567') {
      this.docNumber.set('00000000');
    }
    if (
      !currentName ||
      currentName === 'INVERSIONES GASTRONOMICAS S.A.C.' ||
      currentName === 'EMPRESA GASTRONOMICA S.A.C.'
    ) {
      this.customerName.set('Clientes Varios');
    }
  }

  submitCustomer(): void {
    this.submitted.set(true);
    if (this.docErrorRaw()) {
      this.docField()?.focus();
      return;
    }
    if (this.nameErrorRaw()) {
      this.nameField()?.focus();
      return;
    }

    const type = this.docType();
    this.save.emit({
      docType: type,
      docNumber: this.docNumber().trim(),
      name: this.customerName().trim(),
      isCompany: type === 'RUC'
    });
  }
}

