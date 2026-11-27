import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PosService } from '../../core/pos/pos.service';
import { SALES_LEDGER_LATENCY_MS } from '../../core/sales/sales-ledger-local.adapter';
import { SalesComponent } from './sales.component';

describe('SalesComponent', () => {
  async function setup(options?: { populateLivePos?: boolean }) {
    await TestBed.configureTestingModule({
      imports: [SalesComponent],
      providers: [
        provideRouter([]),
        { provide: SALES_LEDGER_LATENCY_MS, useValue: 0 }
      ],
      deferBlockBehavior: DeferBlockBehavior.Manual
    }).compileComponents();

    if (options?.populateLivePos) {
      const pos = TestBed.inject(PosService);
      pos.addToCart(pos.products()[0]);
      pos.setPaymentMethod('card');
      pos.completeSale();
    }

    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges();
    await fixture.componentInstance.salesService.loadInitialSales();
    fixture.detectChanges();

    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  function findButtonByText(root: ParentNode, text: string): HTMLButtonElement | undefined {
    return Array.from(root.querySelectorAll('button')).find((b) =>
      (b.textContent ?? '').includes(text)
    ) as HTMLButtonElement | undefined;
  }

  it('loads sales via SalesLedgerPort, bridges live POS sales, and enforces M3 hygiene (0 .transition-all, single Filled CTA)', async () => {
    const { host } = await setup({ populateLivePos: true });

    expect(host.querySelector('.transition-all')).toBeNull();
    expect(host.querySelector('.animate-pulse')).toBeNull();
    expect(host.querySelector('.sales-table-scroll[role="region"][tabindex="0"]')).toBeTruthy();
    expect(host.textContent).toContain('Historial de Ventas');
    expect(host.textContent).toContain('B001-000842');
    expect(host.textContent).toContain('POS');
    expect(host.textContent).not.toContain('Simular 503');
    expect(host.textContent).not.toContain('SalesLedgerPort');
    expect(host.textContent).not.toContain('@defer');

    // Single primary Filled CTA outside dialogs
    const filledOutsideDialog = Array.from(host.querySelectorAll('.m3-btn-filled')).filter(
      (btn) => !btn.closest('dialog')
    );
    expect(filledOutsideDialog.length).toBe(1);
  });

  it('filters sales ledger, KPI summary, and reconciliation counts across Hoy, 7 días, and 30 días', async () => {
    const { fixture, host } = await setup();

    // Default 30 días shows all 11 seeded records (4 pending)
    expect(fixture.componentInstance.salesService.periodFilter()).toBe('month');
    expect(fixture.componentInstance.salesService.periodScopedRecords().length).toBe(11);
    expect(fixture.componentInstance.salesService.fiscalSummary().pendingCount).toBe(4);
    expect(host.textContent).toContain('F001-000831');

    // Switch to 7 días -> 8 records, 3 pending
    findButtonByText(host, '7 días')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.salesService.periodFilter()).toBe('week');
    expect(fixture.componentInstance.salesService.periodScopedRecords().length).toBe(8);
    expect(fixture.componentInstance.salesService.fiscalSummary().pendingCount).toBe(3);

    // Switch to Hoy -> 4 records, 2 pending, older month record excluded
    findButtonByText(host, 'Hoy')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.salesService.periodFilter()).toBe('today');
    expect(fixture.componentInstance.salesService.periodScopedRecords().length).toBe(4);
    expect(fixture.componentInstance.salesService.fiscalSummary().pendingCount).toBe(2);
    expect(host.textContent).not.toContain('F001-000831');
  });

  it('supports ARIA column sorting, filtering, tri-state master checkbox, and bulk reconcile with Undo', async () => {
    const { fixture, host } = await setup();

    // Sort by Total flips aria-sort
    const totalSortBtn = findButtonByText(host, 'Total')!;
    const totalTh = totalSortBtn.closest('th')!;
    expect(totalTh.getAttribute('aria-sort')).toBe('none');
    totalSortBtn.click();
    fixture.detectChanges();
    expect(totalTh.getAttribute('aria-sort')).toBe('descending');

    // Filter Pending records cleanly
    findButtonByText(host, 'Pendientes')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('F001-000841');

    // Row selection triggers indeterminate master checkbox & contextual bulk bar
    const rowCheckboxes = Array.from(
      host.querySelectorAll('table tbody m3-checkbox input[type="checkbox"]')
    ) as HTMLInputElement[];
    expect(rowCheckboxes.length).toBeGreaterThan(1);

    rowCheckboxes[0].click();
    fixture.detectChanges();
    const masterCheckbox = host.querySelector(
      'table thead m3-checkbox input[type="checkbox"]'
    ) as HTMLInputElement;
    expect(masterCheckbox.indeterminate).toBe(true);
    expect(host.textContent).toContain('1 comprobante(s) seleccionados');

    // Bulk reconcile + Snackbar Undo
    findButtonByText(host, 'Conciliar seleccionados')!.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(host.querySelector('m3-snackbar [role="status"]')?.textContent).toContain('conciliados');
    const undoBtn = findButtonByText(host.querySelector('m3-snackbar')!, 'Deshacer')!;
    undoBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.salesService.fiscalSummary().pendingCount).toBe(4);
  });

  it('executes automatic snapshot Rollback when ledger adapter fails', async () => {
    const { fixture, host } = await setup();

    fixture.componentInstance.salesService.simulateError503.set(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.salesService.simulateError503()).toBe(true);

    const pendingBefore = fixture.componentInstance.salesService.fiscalSummary().pendingCount;
    const conciliarRowBtn = Array.from(host.querySelectorAll('table tbody button')).find((b) =>
      (b.textContent ?? '').includes('Conciliar')
    ) as HTMLButtonElement;

    conciliarRowBtn.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.componentInstance.salesService.fiscalSummary().pendingCount).toBe(pendingBefore);
    expect(host.querySelector('m3-snackbar [role="status"]')?.textContent).toContain('cambio revertido');
  });

  it('hydrates lazy @defer Fiscal Summary panel and voids a sale via Top-Layer M3 Dialog', async () => {
    const { fixture, host } = await setup();

    // @placeholder active initially -> render @defer Complete
    expect(host.querySelector('app-sales-fiscal-defer-panel')).toBeNull();
    expect(host.querySelector('.m3-skeleton.m3-skeleton-shimmer')).toBeTruthy();

    findButtonByText(host, 'Cargar Resumen Fiscal')!.click();
    fixture.detectChanges();
    const deferBlocks = await fixture.getDeferBlocks();
    await deferBlocks[0].render(DeferBlockState.Complete);
    fixture.detectChanges();

    const deferPanel = host.querySelector('app-sales-fiscal-defer-panel')!;
    expect(deferPanel).toBeTruthy();
    expect(deferPanel.textContent).toContain('Yape / Plin QR');

    // Open Credit Note modal & void selected sale
    findButtonByText(host, 'Emitir Nota Crédito')!.click();
    fixture.detectChanges();
    const dialog = host.querySelector('app-sales-void-dialog dialog') as HTMLDialogElement;
    expect(dialog).toBeTruthy();

    const voidBefore = fixture.componentInstance.salesService.fiscalSummary().voidedCount;
    findButtonByText(dialog, 'Confirmar Nota Crédito')!.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.componentInstance.salesService.fiscalSummary().voidedCount).toBe(voidBefore + 1);
  });
});
