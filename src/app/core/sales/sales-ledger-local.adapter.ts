import { InjectionToken, Injectable, inject } from '@angular/core';
import { CompletedSale, PosService } from '../pos/pos.service';
import { SaleLedgerRecord, SaleLedgerStatus } from './sales-ledger.models';
import { SalesLedgerPort } from './sales-ledger.port';

export const SALES_LEDGER_LATENCY_MS = new InjectionToken<number>('SALES_LEDGER_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 85
});

const SEEDED_SALES_HISTORY: readonly SaleLedgerRecord[] = [
  {
    id: 'sale-seed-841',
    saleId: 'F001-000841',
    orderCode: '#ORD-2026-0841',
    dateIso: '2026-11-26T21:48:00.000Z',
    voucherType: 'factura',
    customerName: 'INVERSIONES GASTRONOMICAS S.A.C.',
    customerDoc: 'RUC 20601234567',
    channel: 'dine-in',
    tableNumber: 'Mesa 04',
    paymentMethod: 'card',
    items: [
      { sku: 'SND-003', name: 'Croissant Jamón Serrano', quantity: 2, unitPrice: 19.0, lineTotal: 38.0 },
      { sku: 'COF-004', name: 'Cold Brew Nitro', quantity: 2, unitPrice: 14.0, lineTotal: 28.0 }
    ],
    subtotal: 55.93,
    tax: 10.07,
    discount: 0,
    total: 66.0,
    status: 'pending',
    cashier: 'Carlos Mendoza'
  },
  {
    id: 'sale-seed-840',
    saleId: 'B001-000840',
    orderCode: '#ORD-2026-0840',
    dateIso: '2026-11-26T21:31:00.000Z',
    voucherType: 'boleta',
    customerName: 'Valeria Quispe Paredes',
    customerDoc: 'DNI 72849103',
    channel: 'takeaway',
    paymentMethod: 'yape',
    yapeCode: 'YP-948201',
    items: [
      { sku: 'COF-002', name: 'Cappuccino Italiano', quantity: 2, unitPrice: 12.0, lineTotal: 24.0 },
      { sku: 'PST-002', name: 'Cinnamon Roll Glaseado', quantity: 1, unitPrice: 11.0, lineTotal: 11.0 }
    ],
    subtotal: 29.66,
    tax: 5.34,
    discount: 0,
    total: 35.0,
    status: 'pending',
    cashier: 'Carlos Mendoza'
  },
  {
    id: 'sale-seed-839',
    saleId: 'B001-000839',
    orderCode: '#ORD-2026-0839',
    dateIso: '2026-11-26T21:12:00.000Z',
    voucherType: 'boleta',
    customerName: 'Público General',
    customerDoc: 'DNI 00000000',
    channel: 'dine-in',
    tableNumber: 'Terraza 01',
    paymentMethod: 'cash',
    items: [
      { sku: 'SND-001', name: 'Sandwich de Pavo Braseado', quantity: 1, unitPrice: 18.5, lineTotal: 18.5 },
      { sku: 'DRK-001', name: 'Limonada Zen con Menta & Jengibre', quantity: 1, unitPrice: 9.0, lineTotal: 9.0 }
    ],
    subtotal: 23.31,
    tax: 4.19,
    discount: 0,
    total: 27.5,
    status: 'reconciled',
    cashier: 'Carlos Mendoza'
  },
  {
    id: 'sale-seed-838',
    saleId: 'F001-000838',
    orderCode: '#ORD-2026-0838',
    dateIso: '2026-11-26T20:45:00.000Z',
    voucherType: 'factura',
    customerName: 'ESTUDIO ANDINO ARQUITECTURA E.I.R.L.',
    customerDoc: 'RUC 20548811209',
    channel: 'delivery',
    paymentMethod: 'yape',
    yapeCode: 'YP-948154',
    items: [
      { sku: 'COF-003', name: 'Latte Vainilla', quantity: 4, unitPrice: 13.5, lineTotal: 54.0 },
      { sku: 'PST-003', name: 'Torta Selva Negra', quantity: 2, unitPrice: 14.5, lineTotal: 29.0 }
    ],
    subtotal: 66.82,
    tax: 12.03,
    discount: 4.15,
    total: 78.85,
    status: 'reconciled',
    cashier: 'Lucía Fernández'
  },
  {
    id: 'sale-seed-837',
    saleId: 'T001-000837',
    orderCode: '#ORD-2026-0837',
    dateIso: '2026-11-26T20:19:00.000Z',
    voucherType: 'ticket',
    customerName: 'Diego Salcedo Rojas',
    customerDoc: 'DNI 45912044',
    channel: 'takeaway',
    paymentMethod: 'card',
    items: [
      { sku: 'COF-001', name: 'Café Espresso Doble', quantity: 2, unitPrice: 8.5, lineTotal: 17.0 },
      { sku: 'PST-001', name: 'Muffin de Arándanos Silvestres', quantity: 1, unitPrice: 9.5, lineTotal: 9.5 }
    ],
    subtotal: 22.46,
    tax: 4.04,
    discount: 0,
    total: 26.5,
    status: 'pending',
    cashier: 'Lucía Fernández'
  },
  {
    id: 'sale-seed-836',
    saleId: 'B001-000836',
    orderCode: '#ORD-2026-0836',
    dateIso: '2026-11-26T19:50:00.000Z',
    voucherType: 'boleta',
    customerName: 'Andrea Huamán Torres',
    customerDoc: 'DNI 70194822',
    channel: 'dine-in',
    tableNumber: 'Mesa 02',
    paymentMethod: 'yape',
    yapeCode: 'YP-948088',
    items: [
      { sku: 'SND-002', name: 'Ciabatta Caprese & Pesto', quantity: 2, unitPrice: 16.0, lineTotal: 32.0 },
      { sku: 'DRK-002', name: 'Kombucha de Maracuyá', quantity: 2, unitPrice: 13.0, lineTotal: 26.0 }
    ],
    subtotal: 49.15,
    tax: 8.85,
    discount: 0,
    total: 58.0,
    status: 'reconciled',
    cashier: 'Carlos Mendoza'
  },
  {
    id: 'sale-seed-835',
    saleId: 'B001-000835',
    orderCode: '#ORD-2026-0835',
    dateIso: '2026-11-26T19:22:00.000Z',
    voucherType: 'boleta',
    customerName: 'Público General',
    customerDoc: 'DNI 00000000',
    channel: 'takeaway',
    paymentMethod: 'cash',
    items: [
      { sku: 'COF-004', name: 'Cold Brew Nitro', quantity: 1, unitPrice: 14.0, lineTotal: 14.0 }
    ],
    subtotal: 11.86,
    tax: 2.14,
    discount: 0,
    total: 14.0,
    status: 'voided',
    cashier: 'Carlos Mendoza',
    voidReason: 'Cliente solicitó cambio por bebida caliente antes de preparación'
  },
  {
    id: 'sale-seed-834',
    saleId: 'F001-000834',
    orderCode: '#ORD-2026-0834',
    dateIso: '2026-11-26T18:54:00.000Z',
    voucherType: 'factura',
    customerName: 'NEXUS CLOUD PERU S.A.C.',
    customerDoc: 'RUC 20608832114',
    channel: 'delivery',
    paymentMethod: 'card',
    items: [
      { sku: 'SND-003', name: 'Croissant Jamón Serrano', quantity: 3, unitPrice: 19.0, lineTotal: 57.0 },
      { sku: 'COF-002', name: 'Cappuccino Italiano', quantity: 3, unitPrice: 12.0, lineTotal: 36.0 }
    ],
    subtotal: 78.81,
    tax: 14.19,
    discount: 0,
    total: 93.0,
    status: 'reconciled',
    cashier: 'Lucía Fernández'
  },
  {
    id: 'sale-seed-833',
    saleId: 'B001-000833',
    orderCode: '#ORD-2026-0833',
    dateIso: '2026-11-26T18:20:00.000Z',
    voucherType: 'boleta',
    customerName: 'Mateo Herrera Chávez',
    customerDoc: 'DNI 47812093',
    channel: 'dine-in',
    tableNumber: 'Barra',
    paymentMethod: 'cash',
    items: [
      { sku: 'COF-001', name: 'Café Espresso Doble', quantity: 1, unitPrice: 8.5, lineTotal: 8.5 },
      { sku: 'PST-003', name: 'Torta Selva Negra', quantity: 1, unitPrice: 14.5, lineTotal: 14.5 }
    ],
    subtotal: 19.49,
    tax: 3.51,
    discount: 0,
    total: 23.0,
    status: 'reconciled',
    cashier: 'Carlos Mendoza'
  },
  {
    id: 'sale-seed-832',
    saleId: 'T001-000832',
    orderCode: '#ORD-2026-0832',
    dateIso: '2026-11-26T17:42:00.000Z',
    voucherType: 'ticket',
    customerName: 'Sofía Paredes León',
    customerDoc: 'DNI 74129834',
    channel: 'takeaway',
    paymentMethod: 'yape',
    yapeCode: 'YP-947902',
    items: [
      { sku: 'COF-003', name: 'Latte Vainilla', quantity: 2, unitPrice: 13.5, lineTotal: 27.0 }
    ],
    subtotal: 22.88,
    tax: 4.12,
    discount: 0,
    total: 27.0,
    status: 'pending',
    cashier: 'Lucía Fernández'
  }
];

function mapCompletedPosSale(sale: CompletedSale, index: number): SaleLedgerRecord {
  const dateObj = sale.date instanceof Date ? sale.date : new Date(sale.date);
  return {
    id: `pos-live-${sale.saleId}-${index}`,
    saleId: sale.saleId,
    orderCode: sale.orderCode ?? '#ORD-LIVE',
    dateIso: dateObj.toISOString(),
    voucherType: sale.voucherType,
    customerName: sale.customer.name,
    customerDoc: `${sale.customer.docType} ${sale.customer.docNumber}`,
    channel: sale.serviceChannel ?? 'dine-in',
    tableNumber: sale.tableNumber,
    paymentMethod: sale.paymentMethod,
    yapeCode: sale.yapeCode,
    items: sale.items.map((item) => ({
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: Number((item.unitPrice * item.quantity).toFixed(2))
    })),
    subtotal: sale.subtotal,
    tax: sale.tax,
    discount: sale.discount,
    total: sale.total,
    status: 'pending',
    cashier: 'Caja Activa POS',
    fromLivePos: true
  };
}

/**
 * Local/POS-bridged Adapter implementing `SalesLedgerPort`.
 * Merges live completed POS tickets with historical shift records without coupling UI to storage.
 */
@Injectable({
  providedIn: 'root'
})
export class SalesLedgerLocalAdapter extends SalesLedgerPort {
  private readonly posService = inject(PosService);
  private readonly latencyMs = inject(SALES_LEDGER_LATENCY_MS);

  override loadSales(): Promise<readonly SaleLedgerRecord[]> {
    const liveRecords = this.posService
      .completedSales()
      .map((sale, idx) => mapCompletedPosSale(sale, idx));

    const existingSaleIds = new Set(liveRecords.map((r) => r.saleId));
    const merged = [
      ...liveRecords,
      ...SEEDED_SALES_HISTORY.filter((seed) => !existingSaleIds.has(seed.saleId))
    ];

    return this.delay(merged);
  }

  override async updateSaleStatus(
    _id: string,
    _nextStatus: SaleLedgerStatus,
    simulateError: boolean,
    _reason?: string
  ): Promise<void> {
    await this.delay(undefined);
    if (simulateError) {
      throw new Error('503 SUNAT / Gateway temporalmente no disponible');
    }
  }

  override async bulkReconcile(_ids: readonly string[], simulateError: boolean): Promise<void> {
    await this.delay(undefined);
    if (simulateError) {
      throw new Error('503 Error al conciliar lote de comprobantes');
    }
  }

  private delay<T>(value: T): Promise<T> {
    if (this.latencyMs <= 0) {
      return Promise.resolve(value);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(value), this.latencyMs);
    });
  }
}
