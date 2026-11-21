import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PosCustomer } from '../../../core/pos/pos.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-pos-customer-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, M3ButtonComponent, M3ButtonGroupComponent, M3DialogComponent, M3TextFieldComponent],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="expressive"
      size="md"
      tone="secondary"
      icon="person_search"
      headline="Identificación del Cliente"
      subtitle="Comprobante electrónico DNI o RUC"
      [open]="open()"
      [managedClose]="true"
      closeLabel="Cerrar identificación del cliente"
      (closeRequested)="close.emit()">

      <form (ngSubmit)="submitCustomer()" novalidate class="flex flex-col gap-3.5">
        <div class="overflow-x-auto scrollbar-none py-2.5 -my-2.5 max-w-full">
          <m3-button-group
            variant="connected"
            size="sm"
            ariaLabel="Tipo de documento del cliente"
            [options]="docTypeOptions"
            [value]="[docType()]"
            (selectionChange)="onDocTypeSelect($event)" />
        </div>

        <m3-text-field
          #docField
          [id]="'pos-customer-doc'"
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
          [id]="'pos-customer-name'"
          variant="filled"
          [label]="docType() === 'RUC' ? 'Razón Social' : 'Nombre Completo'"
          [placeholder]="docType() === 'RUC' ? 'CORPORACIÓN ALIMENTARIA S.A.C.' : 'Carlos Mendoza Rojas'"
          icon="person"
          [(value)]="customerName"
          (inputBlur)="nameTouched.set(true)"
          [errorText]="nameError()"
          [supportingText]="docType() === 'RUC' ? 'Razón social registrada para facturación.' : 'Nombre completo o Clientes Varios.'" />
      </form>

      <div dialog-actions class="flex items-center justify-end gap-2.5">
        <m3-button type="button" variant="text" (action)="close.emit()">Cancelar</m3-button>
        <m3-button
          type="submit"
          variant="filled"
          icon="check"
          [morph]="true"
          (action)="submitCustomer()">
          Guardar Cliente
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class PosCustomerModalComponent {
  private readonly docField = viewChild<M3TextFieldComponent>('docField');
  private readonly nameField = viewChild<M3TextFieldComponent>('nameField');

  readonly open = input<boolean>(false);
  readonly initialCustomer = input.required<PosCustomer>();
  readonly close = output<void>();
  readonly save = output<PosCustomer>();

  readonly docTypeOptions: M3ButtonGroupOption[] = [
    { id: 'DNI', label: 'Persona Natural (DNI)', icon: 'person' },
    { id: 'RUC', label: 'Empresa Jurídica (RUC)', icon: 'domain' }
  ];

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
    effect(() => {
      if (!this.open()) return;
      const current = this.initialCustomer();
      this.docType.set(current.docType);
      this.docNumber.set(current.docNumber);
      this.customerName.set(current.name);
      this.docTouched.set(false);
      this.nameTouched.set(false);
      this.submitted.set(false);
    });
  }

  onDocTypeSelect(selected: string[]): void {
    const type = selected[0] as 'DNI' | 'RUC' | undefined;
    if (!type) return;
    this.setDocType(type);
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
