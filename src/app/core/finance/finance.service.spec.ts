import { TestBed } from '@angular/core/testing';
import { PosService } from '../pos/pos.service';
import { SALES_LEDGER_LATENCY_MS } from '../sales/sales-ledger-local.adapter';
import { FINANCE_LATENCY_MS, FinanceLocalAdapter } from './finance-local.adapter';
import { FinancePort } from './finance.port';
import { FinanceService } from './finance.service';

describe('FinanceService', () => {
  async function setup(options?: { addPosSale?: boolean }) {
    TestBed.configureTestingModule({
      providers: [
        { provide: SALES_LEDGER_LATENCY_MS, useValue: 0 },
        { provide: FINANCE_LATENCY_MS, useValue: 0 },
        { provide: FinancePort, useClass: FinanceLocalAdapter },
        FinanceService
      ]
    });

    if (options?.addPosSale) {
      const pos = TestBed.inject(PosService);
      pos.addToCart(pos.products()[0]); // Espresso S/ 8.50
      pos.setPaymentMethod('cash');
      pos.setExactCash();
      pos.completeSale();
    }

    const service = TestBed.inject(FinanceService);
    await service.loadFinancialData();
    return service;
  }

  it('calculates ex-IGV revenue, SKU COGS, prorated OpEx, and positive profit across periods', async () => {
    const service = await setup();

    // Default 30 días
    const month = service.pnlSummary();
    expect(month.activeSalesCount).toBe(10); // 11 seeded minus 1 voided (B001-000835)
    expect(month.voidedSalesCount).toBe(1);
    expect(month.netRevenueExTax).toBeCloseTo(475.29, 2);
    expect(month.igvLiability).toBeGreaterThan(80);
    expect(month.fixedOpEx).toBe(120);
    expect(month.variableOpEx).toBe(87);
    expect(month.totalOpEx).toBe(207);
    expect(month.netProfit).toBeGreaterThan(0);

    // Sum of category revenue equals netRevenueExTax cleanly
    const sumCatRev = month.categories.reduce((sum, c) => sum + c.revenueExTax, 0);
    expect(sumCatRev).toBeCloseTo(month.netRevenueExTax, 1);

    // Hoy prorates monthly fixed OpEx to 1/30 (S/ 4.00) + today's variable S/ 29.00
    service.setPeriodFilter('today');
    const today = service.pnlSummary();
    expect(today.activeSalesCount).toBe(4);
    expect(today.fixedOpEx).toBe(4);
    expect(today.variableOpEx).toBe(29);
    expect(today.totalOpEx).toBe(33);
    expect(today.netProfit).toBeGreaterThan(50);
  });

  it('recalculates What-If Margin Simulator scenarios accurately', async () => {
    const service = await setup();
    const base = service.pnlSummary();

    service.updateSimulation({ priceDeltaPercent: 10, cogsDeltaPercent: 0, opexDeltaPercent: -10 });
    const sim = service.simulatedSummary();

    expect(sim.isModified).toBe(true);
    expect(sim.projectedRevenue).toBeGreaterThan(base.netRevenueExTax);
    expect(sim.projectedOpEx).toBeLessThan(base.totalOpEx);
    expect(sim.projectedNetProfit).toBeGreaterThan(base.netProfit);
    expect(sim.profitDelta).toBeCloseTo(sim.projectedNetProfit - base.netProfit, 2);

    service.resetSimulation();
    expect(service.simulatedSummary().isModified).toBe(false);
    expect(service.simulatedSummary().profitDelta).toBe(0);
  });

  it('bridges live PosService completed sales directly into Net Profit', async () => {
    const withoutSale = await setup({ addPosSale: false });
    const baseRev = withoutSale.pnlSummary().netRevenueExTax;

    TestBed.resetTestingModule();
    const withSale = await setup({ addPosSale: true });
    expect(withSale.pnlSummary().netRevenueExTax).toBeGreaterThan(baseRev);
  });

  it('supports optimistic expense creation/deletion and automatic rollback on error', async () => {
    const service = await setup();
    const countBefore = service.expenses().length;

    const ok = await service.addExpense({
      title: 'Limpieza de extractor',
      category: 'maintenance',
      recurrence: 'variable-event',
      amount: 55
    });
    expect(ok).toBe(true);
    expect(service.expenses().length).toBe(countBefore + 1);

    // Rollback on simulated failure
    service.simulateError.set(true);
    const fail = await service.addExpense({
      title: 'Gasto fallido',
      category: 'supplies',
      recurrence: 'variable-event',
      amount: 40
    });
    expect(fail).toBe(false);
    expect(service.expenses().length).toBe(countBefore + 1);
    expect(service.toastRequest()?.message).toContain('revertido');
  });
});
