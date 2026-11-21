import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentMethod, PosService } from '../../../core/pos/pos.service';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { M3LoadingIndicatorComponent } from '../../../shared/components/progress';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

const CHECKOUT_EMIT_DELAY_MS = 950;

@Component({
  selector: 'app-pos-checkout-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3DialogComponent,
    M3TextFieldComponent,
    M3LoadingIndicatorComponent
  ],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="expressive"
      size="md"
      tone="primary"
      icon="point_of_sale"
      [headline]="posService.voucherType() === 'factura' ? 'Factura Electrónica' : 'Boleta de Venta'"
      [subtitle]="isProcessing() ? 'Emitiendo comprobante electrónico ante SUNAT' : 'Pasarela de Cobro'"
      [open]="open()"
      [managedClose]="true"
      [closeOnBackdrop]="!isProcessing()"
      [showCloseButton]="!isProcessing()"
      [viewTransitionName]="viewTransitionName()"
      closeLabel="Cerrar pasarela de cobro"
      (closeRequested)="onCloseRequest()">

      <div class="flex flex-col gap-4">
        <div class="hero-mesh-m3 m3-aurora-glow text-main p-4 rounded-m3-lg flex items-center justify-between gap-3">
          <div class="m3-aurora-layer" aria-hidden="true">
            <span class="m3-aurora-orb m3-aurora-orb-1"></span>
            <span class="m3-aurora-orb m3-aurora-orb-2"></span>
            <span class="m3-aurora-orb m3-aurora-orb-3"></span>
          </div>
          <div class="relative z-10">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-muted">Monto a Liquidar</div>
            <div class="text-3xl font-black font-mono text-primary tabular-nums">S/ {{ posService.total().toFixed(2) }}</div>
          </div>
          <div class="relative z-10 text-right text-xs text-main">
            <div class="font-bold">{{ posService.customer().name }}</div>
            <div class="font-mono text-xs text-muted">{{ posService.customer().docType }}: {{ posService.customer().docNumber }}</div>
            <div class="font-semibold text-[10px] mt-0.5 uppercase tracking-wide text-primary">
              Canal: {{ channelLabel() }}
            </div>
          </div>
        </div>

        @if (isProcessing()) {
          <div
            role="status"
            aria-live="polite"
            class="hero-mesh-m3 m3-aurora-glow rounded-m3-lg p-6 text-center flex flex-col items-center gap-4 m3-anim-fade-through">
            <div class="m3-aurora-layer" aria-hidden="true">
              <span class="m3-aurora-orb m3-aurora-orb-1"></span>
              <span class="m3-aurora-orb m3-aurora-orb-2"></span>
              <span class="m3-aurora-orb m3-aurora-orb-3"></span>
            </div>

            <div class="relative z-10 flex justify-center">
              <m3-loading-indicator
                [diameter]="72"
                color="four-color"
                [contained]="true"
                ariaLabel="Autorizando cobro y emitiendo comprobante electrónico ante SUNAT" />
            </div>

            <div class="relative z-10 flex flex-col gap-1 max-w-sm">
              <h4 class="text-title-sm-emphasized text-main m-0">
                Procesando cobro y emisión SUNAT
              </h4>
              <p class="text-body-sm text-muted m-0">
                {{ processingDetailText() }}
              </p>
            </div>

            <div class="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/85 text-label-sm font-mono text-primary">
              <span>{{ activeMethodLabel() }}</span>
              <span>•</span>
              <span class="tabular-nums font-bold">S/ {{ posService.total().toFixed(2) }}</span>
            </div>
          </div>
        } @else {
          <div class="flex flex-col gap-1.5">
            <span class="text-label-sm uppercase tracking-wider text-muted font-semibold">Método de Pago</span>
            <div class="overflow-x-auto scrollbar-none py-2.5 -my-2.5 max-w-full">
              <m3-button-group
                variant="connected"
                size="sm"
                ariaLabel="Método de pago"
                [options]="paymentOptions"
                [value]="[posService.paymentMethod()]"
                (selectionChange)="onPaymentSelect($event)" />
            </div>
          </div>

          @if (posService.paymentMethod() === 'cash') {
            <div class="flex flex-col gap-3 p-4 bg-surface-low rounded-m3-lg m3-anim-lateral">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-main">Efectivo Recibido</span>
                <m3-button
                  variant="text"
                  size="sm"
                  (action)="posService.setExactCash()">
                  Monto Exacto
                </m3-button>
              </div>

              <m3-text-field
                [id]="'pos-checkout-cash'"
                variant="filled"
                type="number"
                inputMode="decimal"
                label="Monto entregado por cliente (S/)"
                icon="payments"
                [value]="cashDraft()"
                (valueChange)="onCashChange($event)" />

              <div class="flex flex-wrap items-center gap-2">
                @for (bill of quickCashBills(); track bill) {
                  <m3-button
                    variant="elevated"
                    size="sm"
                    customClass="flex-1 font-mono"
                    (action)="posService.setQuickCash(bill)">
                    S/ {{ bill }}
                  </m3-button>
                }
                @for (extra of [10, 20]; track extra) {
                  <m3-button
                    variant="tonal"
                    size="sm"
                    customClass="font-mono"
                    (action)="posService.addQuickCash(extra)">
                    +{{ extra }}
                  </m3-button>
                }
              </div>

              <div class="pt-2.5 border-t border-outline-sub/50 flex items-center justify-between">
                <span class="text-xs font-semibold text-muted">Vuelto a Devolver:</span>
                @if (posService.change() >= 0) {
                  <span class="text-xl font-black font-mono text-success tabular-nums inline-flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-lg leading-none" aria-hidden="true">check_circle</span>
                    <span>S/ {{ posService.change().toFixed(2) }}</span>
                  </span>
                } @else {
                  <span class="text-xs font-bold text-error tabular-nums inline-flex items-center gap-1">
                    <span class="material-symbols-rounded text-base leading-none" aria-hidden="true">error</span>
                    <span>Faltan S/ {{ absChange().toFixed(2) }}</span>
                  </span>
                }
              </div>
            </div>
          }

          @if (posService.paymentMethod() === 'yape') {
            <div class="flex flex-col gap-3 p-4 bg-surface-low rounded-m3-lg text-center m3-anim-lateral">
              <div class="flex flex-col items-center justify-center gap-1">
                <div class="w-32 h-32 bg-surface-lowest p-2 rounded-m3-md grid place-items-center shadow-sm">
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
                [id]="'pos-checkout-yape'"
                variant="filled"
                label="Código de Aprobación (4-6 dígitos)"
                placeholder="Ej. 8492"
                inputMode="numeric"
                icon="verified"
                [maxlength]="6"
                [(value)]="posService.yapeCode"
                (inputBlur)="yapeTouched.set(true)"
                [errorText]="yapeError()"
                supportingText="Verificá los 4 a 6 dígitos mostrados en el celular del cliente" />
            </div>
          }

          @if (posService.paymentMethod() === 'card') {
            <div class="flex flex-col gap-3 p-5 hero-mesh-m3 m3-aurora-glow rounded-m3-lg text-center m3-anim-lateral">
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
              <div class="relative z-10 text-[10px] font-mono text-muted bg-surface/85 px-2.5 py-1.5 rounded-m3-sm">
                Terminal ID: POS-TID-88491 • Acepta Visa, Mastercard, Amex
              </div>
            </div>
          }
        }
      </div>

      <div dialog-actions class="flex items-center justify-end gap-2.5">
        <m3-button
          type="button"
          variant="text"
          [disabled]="isProcessing()"
          (action)="onCloseRequest()">
          Cancelar
        </m3-button>
        <m3-button
          type="button"
          variant="filled"
          size="lg"
          icon="check_circle"
          [morph]="true"
          [loading]="isProcessing()"
          [disabled]="!posService.isPaymentValid() || isProcessing()"
          (action)="onConfirmClick()">
          {{ isProcessing() ? 'Emitiendo comprobante...' : 'Confirmar y Emitir Comprobante' }}
        </m3-button>
      </div>
    </m3-dialog>
  `
})
export class PosCheckoutModalComponent {
  readonly posService = inject(PosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input<boolean>(false);
  readonly channelLabel = input.required<string>();
  readonly viewTransitionName = input<string | null>(null);
  readonly close = output<void>();
  readonly saleConfirmed = output<void>();
  readonly processingChange = output<boolean>();

  readonly cashDraft = signal<string>('');
  readonly yapeTouched = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  private confirmTimerId: ReturnType<typeof setTimeout> | null = null;

  readonly paymentOptions: M3ButtonGroupOption[] = [
    { id: 'cash', label: 'Efectivo', icon: 'payments' },
    { id: 'yape', label: 'Yape / Plin', icon: 'qr_code_2' },
    { id: 'card', label: 'Tarjeta', icon: 'credit_card' }
  ];

  readonly activeMethodLabel = computed(() => {
    const method = this.posService.paymentMethod();
    if (method === 'cash') return 'Efectivo';
    if (method === 'yape') return 'Yape / Plin';
    return 'Tarjeta';
  });

  readonly processingDetailText = computed(() => {
    const voucherLabel =
      this.posService.voucherType() === 'factura'
        ? 'Factura Electrónica (F001)'
        : 'Boleta de Venta (B001)';
    return `Validando pago y emitiendo ${voucherLabel} ante SUNAT...`;
  });

  readonly quickCashBills = computed<readonly number[]>(() => {
    const minNeeded = Math.ceil(this.posService.total());
    const candidates = [10, 20, 50, 100, 200].filter(bill => bill >= minNeeded);
    if (candidates.length >= 3) {
      return candidates.slice(0, 3);
    }
    const roundedTen = Math.ceil(minNeeded / 10) * 10;
    const roundedFifty = Math.ceil(minNeeded / 50) * 50;
    const unique = Array.from(new Set([...candidates, roundedTen, roundedFifty, minNeeded + 50]))
      .sort((a, b) => a - b);
    return unique.slice(0, 3);
  });

  readonly yapeError = computed<string | null>(() => {
    if (!this.yapeTouched()) return null;
    const code = this.posService.yapeCode().trim();
    if (!code) {
      return 'Ingresá el código de aprobación de Yape o Plin.';
    }
    if (code.length < 4 || !/^\d+$/.test(code)) {
      return 'El código debe contener al menos 4 dígitos numéricos.';
    }
    return null;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearConfirmTimer());

    effect(() => {
      if (this.open()) {
        this.yapeTouched.set(false);
      } else {
        this.clearConfirmTimer();
        this.setProcessing(false);
      }
    });

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

  onPaymentSelect(selected: string[]): void {
    if (this.isProcessing()) return;
    const method = selected[0] as PaymentMethod | undefined;
    if (!method) return;
    this.yapeTouched.set(false);
    this.posService.setPaymentMethod(method);
  }

  onCashChange(raw: string): void {
    this.cashDraft.set(raw);
    const num = parseFloat(raw);
    this.posService.cashReceived.set(Number.isNaN(num) ? 0 : num);
  }

  onCloseRequest(): void {
    if (this.isProcessing()) return;
    this.close.emit();
  }

  onConfirmClick(): void {
    if (!this.posService.isPaymentValid() || this.isProcessing()) return;
    this.setProcessing(true);
    this.clearConfirmTimer();
    this.confirmTimerId = setTimeout(() => {
      this.confirmTimerId = null;
      this.setProcessing(false);
      this.saleConfirmed.emit();
    }, CHECKOUT_EMIT_DELAY_MS);
  }

  absChange(): number {
    return Math.abs(this.posService.change());
  }

  private setProcessing(value: boolean): void {
    if (this.isProcessing() === value) return;
    this.isProcessing.set(value);
    this.processingChange.emit(value);
  }

  private clearConfirmTimer(): void {
    if (this.confirmTimerId !== null) {
      clearTimeout(this.confirmTimerId);
      this.confirmTimerId = null;
    }
  }
}
