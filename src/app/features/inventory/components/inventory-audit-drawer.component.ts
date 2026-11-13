import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StockTransfer, Warehouse } from '../../../core/inventory/inventory.models';

@Component({
  selector: 'app-inventory-audit-drawer',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-label="Libro mayor de transferencias y auditoría"
      class="rounded-3xl bg-surface-box border border-outline-sub shadow-sm p-5 space-y-4 m3-anim-item-in">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-rounded text-primary text-2xl" aria-hidden="true">local_shipping</span>
          <div>
            <h3 class="text-base font-bold text-main">Libro Mayor de Transferencias & Auditoría de Stock</h3>
            <p class="text-xs text-muted">Trazabilidad inmutable de movimientos inter-almacenes con operador responsable</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Cerrar historial de movimientos"
          (click)="close.emit()"
          class="w-8 h-8 rounded-full bg-surface hover:bg-surface-high border border-outline-sub grid place-items-center text-muted hover:text-main cursor-pointer">
          <span class="material-symbols-rounded text-base" aria-hidden="true">close</span>
        </button>
      </div>

      <div class="overflow-x-auto m3-scrollbar">
        <table class="w-full text-left text-xs border-separate border-spacing-0">
          <caption class="sr-only">Movimientos recientes entre almacenes</caption>
          <thead class="border-b border-outline-sub text-muted font-bold uppercase text-[10px]">
            <tr>
              <th scope="col" class="py-2.5 px-3 border-b border-outline-sub">Código Movimiento</th>
              <th scope="col" class="py-2.5 px-3 border-b border-outline-sub">Fecha / Hora</th>
              <th scope="col" class="py-2.5 px-3 border-b border-outline-sub">Prenda & Variante</th>
              <th scope="col" class="py-2.5 px-3 border-b border-outline-sub">Ruta de Transferencia</th>
              <th scope="col" class="py-2.5 px-3 text-center border-b border-outline-sub">Cantidad</th>
              <th scope="col" class="py-2.5 px-3 border-b border-outline-sub">Operador</th>
            </tr>
          </thead>
          <tbody class="font-mono">
            @for (trf of transfers(); track trf.id) {
              <tr class="hover:bg-surface/50">
                <th scope="row" class="py-2.5 px-3 font-bold text-primary border-b border-outline-sub text-left">
                  {{ trf.id }}
                </th>
                <td class="py-2.5 px-3 text-muted font-sans border-b border-outline-sub">{{ trf.date | date:'short' }}</td>
                <td class="py-2.5 px-3 font-sans border-b border-outline-sub">
                  <span class="font-bold text-main">{{ trf.productName }}</span>
                  <span class="text-xs text-muted block">{{ trf.variantSku }} ({{ trf.colorName }} / {{ trf.size }})</span>
                </td>
                <td class="py-2.5 px-3 font-sans border-b border-outline-sub">
                  <span class="text-xs text-muted">{{ getWarehouseName(trf.fromWarehouseId) }}</span>
                  <span class="material-symbols-rounded text-xs mx-1 text-primary align-middle" aria-hidden="true">arrow_forward</span>
                  <span class="text-xs font-semibold text-main">{{ getWarehouseName(trf.toWarehouseId) }}</span>
                </td>
                <td class="py-2.5 px-3 text-center border-b border-outline-sub">
                  <span class="px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                    +{{ trf.quantity }} uds
                  </span>
                </td>
                <td class="py-2.5 px-3 font-sans text-muted border-b border-outline-sub">{{ trf.operator }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class InventoryAuditDrawerComponent {
  readonly transfers = input.required<StockTransfer[]>();
  readonly warehouses = input.required<Warehouse[]>();
  readonly close = output<void>();

  getWarehouseName(whId: string): string {
    const wh = this.warehouses().find(w => w.id === whId);
    return wh ? wh.name : whId;
  }
}
