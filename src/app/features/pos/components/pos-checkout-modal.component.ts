import { Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentMethod, PosService } from '../../../core/pos/pos.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3LoadingIndicatorComponent } from '../../../shared/components/progress';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-pos-checkout-modal',
  standalone: true,
  imports: [FormsModule, M3ButtonComponent, M3TextFieldComponent, M3LoadingIndicatorComponent],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      [class.m3-dialog-backdrop]="!themeService.hasViewTransitions()"
      class="fixed inset-0 bg-scrim z-40 cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pos-checkout-title"
      [style.view-transition-name]="isSurfaceTransitionActive() ? 'dialog-transform' : null"
      [class.m3-dialog-surface]="!themeService.hasViewTransitions()"
      class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[500px] h-fit max-h-[calc(100vh-3rem)] bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-2xl z-50 flex flex-col justify-between overflow-y-auto">

      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
          <div>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Pasarela de Cobro</span>
            <h3
              #modalHeading
              id="pos-checkout-title"
              tabindex="-1"
              class="text-lg font-bold text-main outline-none">
              {{ posService.voucherType() === 'factura' ? 'Factura Electrónica' : 'Boleta de Venta' }}
            </h3>
          </div>
          <m3-button
            [iconOnly]="true"
            variant="text"
            size="sm"
            icon="close"
            ariaLabel="Cerrar pasarela de cobro"
            (action)="close.emit()" />
        </div>

        <div class="hero-mesh-m3 m3-aurora-glow border border-primary/25 text-main p-4 rounded-m3-lg flex items-center justify-between shadow-xs">
          <div class="m3-aurora-layer" aria-hidden="true">
            <span class="m3-aurora-orb m3-aurora-orb-1"></span>
            <span class="m3-aurora-orb m3-aurora-orb-2"></span>
            <span class="m3-aurora-orb m3-aurora-orb-3"></span>
          </div>
          <div class="relative z-10">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">Monto a Liquidar</div>
            <div class="text-3xl font-black font-mono text-primary">S/ {{ posService.total().toFixed(2) }}</div>
          </div>
          <div class="relative z-10 text-right text-xs text-main">
            <div class="font-bold">{{ posService.customer().name }}</div>
            <div class="font-mono text-xs text-muted">{{ posService.customer().docType }}: {{ posService.customer().docNumber }}</div>
            <div class="font-semibold text-[10px] mt-0.5 uppercase tracking-wide text-primary">
              Canal: {{ channelLabel() }}
            </div>
          </div>
        </div>

        <div class="space-y-1.5">
          <span class="text-[10px] font-semibold text-muted uppercase tracking-wider block">Método de Pago</span>
          <div
            role="group"
            aria-label="Método de pago"
            class="grid grid-cols-3 gap-2 p-1 bg-surface-high rounded-full border border-outline-sub">
            @for (method of paymentMethods; track method.id) {
              <button
                type="button"
                [attr.aria-pressed]="posService.paymentMethod() === method.id"
                (click)="posService.setPaymentMethod(method.id)"
                [class]="posService.paymentMethod() === method.id ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-main hover:bg-surface-highest'"
                class="btn-m3 state-layer focus-ring-m3 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 cursor-pointer text-xs">
                <span class="material-symbols-rounded text-base" aria-hidden="true">{{ method.icon }}</span>
                <span>{{ method.label }}</span>
              </button>
            }
          </div>
        </div>

        @if (posService.paymentMethod() === 'cash') {
          <div class="space-y-3 p-4 bg-surface-high/60 rounded-m3-lg border border-outline-sub m3-anim-lateral">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-main">Efectivo Recibido</span>
              <m3-button
                variant="text"
                size="sm"
                (action)="posService.setExactCash()">
                Monto Exacto
              </m3-button>
            </div>

            <m3-text-field
              variant="filled"
              type="number"
              inputMode="decimal"
              label="Monto entregado por cliente (S/)"
              icon="payments"
              [value]="cashDraft()"
              (valueChange)="onCashChange($event)" />

            <div class="flex items-center gap-2">
              @for (bill of [20, 50, 100]; track bill) {
                <m3-button
                  variant="outlined"
                  size="sm"
                  customClass="flex-1 font-mono"
                  (action)="posService.setQuickCash(bill)">
                  S/ {{ bill }}
                </m3-button>
              }
            </div>

            <div class="pt-2.5 border-t border-outline-sub flex items-center justify-between">
              <span class="text-xs font-semibold text-muted">Vuelto a Devolver:</span>
              @if (posService.change() >= 0) {
                <span class="text-xl font-black font-mono text-success inline-flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-lg leading-none" aria-hidden="true">check_circle</span>
                  <span>S/ {{ posService.change().toFixed(2) }}</span>
                </span>
              } @else {
                <span class="text-xs font-bold text-error inline-flex items-center gap-1">
                  <span class="material-symbols-rounded text-base leading-none" aria-hidden="true">error</span>
                  <span>Faltan S/ {{ absChange().toFixed(2) }}</span>
                </span>
              }
            </div>
          </div>
        }

        @if (posService.paymentMethod() === 'yape') {
          <div class="space-y-3 p-4 bg-surface-high/60 rounded-m3-lg border border-outline-sub text-center m3-anim-lateral">
            <div class="flex flex-col items-center justify-center space-y-1">
              <div class="w-32 h-32 bg-white p-2 rounded-m3-md border border-outline-sub grid place-items-center shadow-sm">
                <svg class="w-full h-full text-on-primary-fixed" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
                  <rect x="5" y="5" width="25" height="25" rx="3" />
                  <rect x="10" y="10" width="15" height="15" fill="white" />
                  <rect x="70" y="5" width="25" height="25" rx="3" />
                  <rect x="75" y="10" width="15" height="15" fill="white" />
                  <rect x="5" y="70" width="25" height="25" rx="3" />
                  <rect x="10" y="75" width="15" height="15" fill="white" />
                  <rect x="40" y="15" width="20" height="10" />
                  <rect x="40" y="35" width="20" height="20" />
                  <rect x="15" y="40" width="15" height="15" />
                  <rect x="70" y="40" width="15" height="15" />
                  <rect x="40" y="70" width="20" height="20" />
                  <rect x="70" y="70" width="20" height="20" />
                </svg>
              </div>
              <div class="text-xs font-mono font-bold text-main mt-0.5">Yape al: {{ posService.yapePhone() }}</div>
              <div class="text-[10px] text-muted">A nombre de: GASTRONOMIA PERU S.A.C.</div>
            </div>

            <m3-text-field
              variant="filled"
              label="Código de Aprobación (4 dígitos)"
              placeholder="Ej. 8492"
              inputMode="numeric"
              icon="verified"
              [maxlength]="6"
              [(value)]="posService.yapeCode"
              supportingText="Verificá los 4 dígitos mostrados en el celular del cliente" />
          </div>
        }

        @if (posService.paymentMethod() === 'card') {
          <div class="space-y-3 p-5 hero-mesh-m3 m3-aurora-glow rounded-m3-lg border border-primary/25 text-center m3-anim-lateral">
            <div class="m3-aurora-layer" aria-hidden="true">
              <span class="m3-aurora-orb m3-aurora-orb-1"></span>
              <span class="m3-aurora-orb m3-aurora-orb-2"></span>
              <span class="m3-aurora-orb m3-aurora-orb-3"></span>
            </div>
            <div class="relative z-10 flex justify-center">
              <m3-loading-indicator
                size="md"
                color="primary"
                [contained]="true"
                ariaLabel="Sincronizando terminal inalámbrico Izipay o Niubiz" />
            </div>
            <div class="relative z-10">
              <h4 class="font-bold text-sm text-main">Acercar o Insertar Tarjeta</h4>
              <p class="text-xs text-muted mt-0.5">Terminal inalámbrico Izipay / Niubiz sincronizado</p>
            </div>
            <div class="relative z-10 text-[10px] font-mono text-muted bg-surface-box/85 p-1.5 rounded-m3-sm border border-outline-sub">
              Terminal ID: POS-TID-88491 • Acepta Visa, Mastercard, Amex
            </div>
          </div>
        }
      </div>

      <div class="pt-3 border-t border-outline-sub flex items-center justify-end gap-2.5 mt-3">
        <m3-button variant="text" (action)="close.emit()">
          Cancelar
        </m3-button>
        <m3-button
          variant="filled"
          size="lg"
          icon="check_circle"
          [morph]="true"
          [disabled]="!posService.isPaymentValid()"
          (action)="saleConfirmed.emit()">
          Confirmar y Emitir Comprobante
        </m3-button>
      </div>
    </div>
  `
})
export class PosCheckoutModalComponent {
  readonly posService = inject(PosService);
  readonly themeService = inject(ThemeService);
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly channelLabel = input.required<string>();
  readonly isSurfaceTransitionActive = input<boolean>(false);
  readonly close = output<void>();
  readonly saleConfirmed = output<void>();

  readonly cashDraft = signal<string>('');

  readonly paymentMethods: readonly { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'cash', label: 'Efectivo', icon: 'payments' },
    { id: 'yape', label: 'Yape / Plin', icon: 'qr_code_2' },
    { id: 'card', label: 'Tarjeta', icon: 'credit_card' }
  ];

  constructor() {
    queueMicrotask(() => this.modalHeading()?.nativeElement.focus());

    effect(() => {
      const received = this.posService.cashReceived();
      const parsedDraft = parseFloat(this.cashDraft());
      if (Number.isNaN(parsedDraft) && received === 0 && this.cashDraft() === '') {
        return;
      }
      if (parsedDraft !== received) {
        this.cashDraft.set(received.toString());
      }
    });
  }

  onCashChange(raw: string): void {
    this.cashDraft.set(raw);
    const num = parseFloat(raw);
    this.posService.cashReceived.set(Number.isNaN(num) ? 0 : num);
  }

  absChange(): number {
    return Math.abs(this.posService.change());
  }
}

