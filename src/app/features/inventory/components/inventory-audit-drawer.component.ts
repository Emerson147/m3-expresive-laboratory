import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { StockTransfer, Warehouse } from '../../../core/inventory/inventory.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-inventory-audit-drawer',
  standalone: true,
  imports: [DatePipe, M3ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block 2xl:min-h-0'
  },
  styles: [`
    .audit-table-wrapper {
      container-type: inline-size;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .audit-table {
      inline-size: 100%;
      border-collapse: separate;
      border-spacing: 0;
      --audit-label-2: "Fecha";
      --audit-label-3: "Prenda";
      --audit-label-4: "Ruta";
      --audit-label-5: "Cantidad";
      --audit-label-6: "Operador";
    }

    @container (inline-size < 640px) {
      .audit-table,
      .audit-table thead,
      .audit-table tbody,
      .audit-table tr,
      .audit-table th,
      .audit-table td {
        display: block;
      }

      .audit-table thead {
        display: none;
      }

      .audit-table tbody tr {
        margin-block-end: 0.625rem;
        border-radius: var(--radius-m3-lg-inc, 20px);
        background-color: var(--color-surface);
        box-shadow: var(--shadow-m3-level1);
        overflow: hidden;
        transition: transform 240ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1));
      }

      .audit-table tbody tr:hover {
        transform: translateY(-1px);
        background-color: var(--color-surface-high);
      }

      .audit-table tbody th {
        background-color: var(--color-surface-high);
        padding: 0.625rem 0.875rem;
      }

      .audit-table tbody td {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        text-align: end;
        padding: 0.5rem 0.875rem;
      }

      .audit-table tbody td::before {
        font-family: var(--md-ref-typeface-plain);
        font-size: var(--md-sys-typescale-label-small-size);
        font-weight: 700;
        color: var(--md-sys-color-on-surface-variant);
        text-align: start;
        flex-shrink: 0;
      }

      .audit-table tbody td:nth-child(2)::before {
        content: var(--audit-label-2) ": " / var(--audit-label-2);
      }
      .audit-table tbody td:nth-child(3)::before {
        content: var(--audit-label-3) ": " / var(--audit-label-3);
      }
      .audit-table tbody td:nth-child(4)::before {
        content: var(--audit-label-4) ": " / var(--audit-label-4);
      }
      .audit-table tbody td:nth-child(5)::before {
        content: var(--audit-label-5) ": " / var(--audit-label-5);
      }
      .audit-table tbody td:nth-child(6)::before {
        content: var(--audit-label-6) ": " / var(--audit-label-6);
      }
    }
  `],
  template: `
    <!-- Responsive M3 Side Sheet: Scrim Modal < 2xl, Docked Split Column >= 2xl -->
    <div
      (click)="onScrimClick($event)"
      class="inv-side-sheet-scrim fixed inset-0 z-40 bg-scrim/45 backdrop-blur-xs flex justify-end 2xl:contents">
      <aside
        aria-labelledby="inventory-audit-heading"
        class="inv-side-sheet-panel w-full max-w-[400px] 2xl:w-[390px] 2xl:max-w-none h-full 2xl:h-auto 2xl:max-h-[calc(100dvh-2.5rem)] bg-surface-low rounded-s-m3-xl 2xl:rounded-m3-xl-inc shadow-m3-level3 2xl:shadow-m3-level1 p-4 flex flex-col gap-3.5 min-h-0">

        <!-- Side Sheet Editorial Header -->
        <div class="bg-surface rounded-m3-lg-inc p-3.5 flex items-start justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-m3-md bg-primary-box text-on-primary-box grid place-items-center shrink-0">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">local_shipping</span>
            </div>
            <div class="min-w-0">
              <h2 id="inventory-audit-heading" class="text-title-md-emphasized text-main leading-tight">
                Libro Mayor de Movimientos
              </h2>
              <p class="text-label-sm text-muted mt-0.5">
                Trazabilidad entre sedes
              </p>
            </div>
          </div>

          <m3-button
            [iconOnly]="true"
            variant="text"
            size="xs"
            icon="close"
            ariaLabel="Cerrar historial de movimientos"
            (action)="close.emit()" />
        </div>

        <!-- Telemetry Pill Strip -->
        <div class="grid grid-cols-2 gap-2 shrink-0">
          <div class="bg-surface rounded-m3-lg-inc px-3 py-2 flex items-center justify-between">
            <span class="text-label-sm text-muted">Despachos</span>
            <span class="text-title-sm-emphasized font-mono tabular-nums text-main">{{ transfers().length }}</span>
          </div>
          <div class="bg-surface rounded-m3-lg-inc px-3 py-2 flex items-center justify-between">
            <span class="text-label-sm text-muted">Movidas</span>
            <span class="text-title-sm-emphasized font-mono tabular-nums text-primary">+{{ totalMovedUnits() }} uds</span>
          </div>
        </div>

        <!-- Scrollable Responsive Audit Table (renders as Expressive Route Cards in Side Sheet) -->
        <div class="audit-table-wrapper inv-scroll-pane flex-1 min-h-0 m3-scrollbar pe-0.5">
          <table class="audit-table text-left text-body-sm">
            <caption class="sr-only">Movimientos recientes entre almacenes</caption>
            <thead class="text-muted text-label-sm-emphasized uppercase">
              <tr>
                <th scope="col" class="py-2 px-3">Código Movimiento</th>
                <th scope="col" class="py-2 px-3">Fecha / Hora</th>
                <th scope="col" class="py-2 px-3">Prenda & Variante</th>
                <th scope="col" class="py-2 px-3">Ruta de Transferencia</th>
                <th scope="col" class="py-2 px-3 text-center">Cantidad</th>
                <th scope="col" class="py-2 px-3">Operador</th>
              </tr>
            </thead>
            <tbody class="font-mono">
              @for (trf of transfers(); track trf.id) {
                <tr>
                  <th scope="row" class="text-label-md-emphasized text-primary text-left">
                    <span class="flex items-center justify-between gap-2">
                      <span>{{ trf.id }}</span>
                      <span class="material-symbols-rounded text-base text-muted" aria-hidden="true">local_shipping</span>
                    </span>
                  </th>
                  <td class="text-label-md text-muted font-sans">{{ trf.date | date:'short' }}</td>
                  <td class="font-sans">
                    <div class="text-end">
                      <span class="text-label-lg-emphasized text-main block">{{ trf.productName }}</span>
                      <span class="text-label-sm text-muted block font-mono">{{ trf.variantSku }} ({{ trf.colorName }} / {{ trf.size }})</span>
                    </div>
                  </td>
                  <td class="font-sans">
                    <span class="inline-flex flex-wrap items-center justify-end gap-1">
                      <span class="text-body-sm text-muted">{{ getWarehouseName(trf.fromWarehouseId) }}</span>
                      <span class="material-symbols-rounded text-xs text-primary align-middle" aria-hidden="true">arrow_forward</span>
                      <span class="text-label-md-emphasized text-main">{{ getWarehouseName(trf.toWarehouseId) }}</span>
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="px-2.5 py-0.5 rounded-m3-full text-label-md-emphasized tabular-nums bg-primary-box text-on-primary-box">
                      +{{ trf.quantity }} uds
                    </span>
                  </td>
                  <td class="font-sans text-body-sm text-muted">{{ trf.operator }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center text-muted py-6 font-sans">
                    Sin movimientos registrados en este turno.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  `
})
export class InventoryAuditDrawerComponent {
  readonly transfers = input.required<StockTransfer[]>();
  readonly warehouses = input.required<Warehouse[]>();
  readonly close = output<void>();

  readonly totalMovedUnits = computed<number>(() =>
    this.transfers().reduce((acc, trf) => acc + trf.quantity, 0)
  );

  onScrimClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  getWarehouseName(whId: string): string {
    const wh = this.warehouses().find(w => w.id === whId);
    return wh ? wh.name : whId;
  }
}
