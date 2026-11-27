import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FINANCE_LATENCY_MS } from '../../core/finance/finance-local.adapter';
import { PosService } from '../../core/pos/pos.service';
import { SALES_LEDGER_LATENCY_MS } from '../../core/sales/sales-ledger-local.adapter';
import { FinanceComponent } from './finance.component';

describe('FinanceComponent', () => {
  async function setup(options?: { populateLivePos?: boolean }) {
    await TestBed.configureTestingModule({
      imports: [FinanceComponent],
      providers: [
        provideRouter([]),
        { provide: SALES_LEDGER_LATENCY_MS, useValue: 0 },
        { provide: FINANCE_LATENCY_MS, useValue: 0 }
      ]
    }).compileComponents();

    if (options?.populateLivePos) {
      const pos = TestBed.inject(PosService);
      pos.addToCart(pos.products()[0]); // Espresso S/ 8.50
      pos.setPaymentMethod('card');
      pos.completeSale();
    }

    const fixture = TestBed.createComponent(FinanceComponent);
    fixture.detectChanges();
    await fixture.componentInstance.financeService.loadFinancialData();
    fixture.detectChanges();

    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  function findButtonByText(root: ParentNode, text: string): HTMLButtonElement | undefined {
    return Array.from(root.querySelectorAll('button')).find((b) =>
      (b.textContent ?? '').includes(text)
    ) as HTMLButtonElement | undefined;
  }

  it('enforces M3 Expressive hygiene (0 .transition-all, single Filled CTA, deterministic gauges) and live POS integration', async () => {
    const { host } = await setup({ populateLivePos: true });

    expect(host.querySelector('.transition-all')).toBeNull();
    expect(host.querySelector('.animate-pulse')).toBeNull();
    expect(host.querySelectorAll('.m3-linear-wavy-svg').length).toBe(0);
    expect(host.textContent).toContain('Finanzas & Rentabilidad');
    expect(host.textContent).toContain('11 ventas activas');

    const filledOutsideDialog = Array.from(host.querySelectorAll('.m3-btn-filled')).filter(
      (btn) => !btn.closest('dialog')
    );
    expect(filledOutsideDialog.length).toBe(1);
    expect(filledOutsideDialog[0].textContent).toContain('Registrar Gasto');
  });

  it('recalculates P&L metrics across Hoy, 7 días, and 30 días', async () => {
    const { fixture, host } = await setup();

    expect(fixture.componentInstance.financeService.pnlSummary().activeSalesCount).toBe(10);

    findButtonByText(host, 'Hoy')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.financeService.periodFilter()).toBe('today');
    expect(fixture.componentInstance.financeService.pnlSummary().activeSalesCount).toBe(4);
    expect(host.textContent).toContain('Fijo prorrateado');
  });

  it('updates projected profit interactively via What-If Margin Simulator sliders and resets cleanly', async () => {
    const { fixture, host } = await setup();
    const baseNetProfit = fixture.componentInstance.financeService.pnlSummary().netProfit;

    const priceSlider = host.querySelector('#fin-sim-price-slider') as HTMLInputElement;
    expect(priceSlider).toBeTruthy();

    priceSlider.value = '20';
    priceSlider.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.financeService.simulatedSummary().isModified).toBe(true);
    expect(fixture.componentInstance.financeService.simulatedSummary().projectedNetProfit).toBeGreaterThan(
      baseNetProfit
    );

    findButtonByText(host, 'Restablecer')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.financeService.simulatedSummary().isModified).toBe(false);
  });

  it('registers a new expense via Top-Layer M3 Dialog and supports Snackbar Undo on delete', async () => {
    const { fixture, host } = await setup();
    const netBefore = fixture.componentInstance.financeService.pnlSummary().netProfit;

    findButtonByText(host, 'Registrar Gasto')!.click();
    fixture.detectChanges();

    const dialog = host.querySelector('app-finance-expense-dialog dialog') as HTMLDialogElement;
    expect(dialog).toBeTruthy();

    const inputs = Array.from(dialog.querySelectorAll('m3-text-field input')) as HTMLInputElement[];
    inputs[0].value = 'Reparación molino espresso';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '65';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    findButtonByText(dialog, 'Guardar Gasto')!.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(host.textContent).toContain('Reparación molino espresso');
    expect(fixture.componentInstance.financeService.pnlSummary().netProfit).toBeCloseTo(netBefore - 65, 2);

    const deleteBtn = host.querySelector(
      'button[aria-label="Eliminar gasto Reparación molino espresso"]'
    ) as HTMLButtonElement;
    deleteBtn.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.componentInstance.financeService.pnlSummary().netProfit).toBeCloseTo(netBefore, 2);
    const undoBtn = findButtonByText(host.querySelector('m3-snackbar')!, 'Deshacer')!;
    undoBtn.click();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.financeService.pnlSummary().netProfit).toBeCloseTo(netBefore - 65, 2);
  });
});
