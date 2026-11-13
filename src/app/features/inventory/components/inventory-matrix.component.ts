import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  MasterProduct,
  MatrixColumnSummary,
  MatrixRowView,
  Warehouse
} from '../../../core/inventory/inventory.models';

@Component({
  selector: 'app-inventory-matrix',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .table-wrapper {
      overflow: auto;
      max-inline-size: 100%;
      max-block-size: min(560px, 72vh);
      container-type: inline-size;
    }

    .inventory-matrix-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .inventory-matrix-table thead {
      position: sticky;
      inset-block-start: 0;
      z-index: 20;
    }

    .inventory-matrix-table tbody th,
    .inventory-matrix-table tfoot th {
      position: sticky;
      inset-inline-start: 0;
      z-index: 10;
    }

    .inventory-matrix-table thead th:first-child {
      position: sticky;
      inset-inline-start: 0;
      z-index: 30;
    }
  `],
  template: `
    <div class="space-y-4">
      <div class="p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-surface-high border border-outline-sub shadow-sm shrink-0 grid place-items-center">
            @if (failedImages()[product().id]) {
              <span class="material-symbols-rounded text-muted text-3xl" aria-hidden="true">checkroom</span>
            } @else {
              <img
                [src]="product().imageUrl"
                [alt]="product().name"
                (error)="markImageFailed(product().id)"
                [style.view-transition-name]="transitionPhase() === 'after' ? 'product-hero-image' : null"
                class="w-full h-full object-cover" />
            }
          </div>
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-primary text-on-primary">
                {{ product().sku }}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface border border-outline-sub text-muted">
                {{ product().categoryLabel }}
              </span>
              <span class="text-xs text-muted font-medium">
                {{ product().season }}
              </span>
            </div>
            <h2
              [style.view-transition-name]="transitionPhase() === 'after' ? 'product-hero-title' : null"
              class="text-lg sm:text-xl font-black text-main tracking-tight">
              {{ product().name }}
            </h2>
            <div class="flex items-center gap-3 text-xs text-muted">
              <span>Marca: <strong class="text-main">{{ product().brand }}</strong></span>
              <span aria-hidden="true">•</span>
              <span>PVP Base: <strong class="text-main font-mono">\${{ product().basePrice.toFixed(2) }}</strong></span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:items-end gap-2 text-xs">
          <span class="text-[11px] font-bold text-muted uppercase tracking-wider">Estado de Salud Celular</span>
          <div class="flex flex-wrap items-center gap-3 bg-surface p-2 rounded-2xl border border-outline-sub">
            <span class="flex items-center gap-1.5 text-xs text-muted">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
              Saludable (≥{{ activeLowThreshold() }})
            </span>
            <span class="flex items-center gap-1.5 text-xs text-muted">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500" aria-hidden="true"></span>
              Bajo (1-{{ lowRangeUpper() }})
            </span>
            <span class="flex items-center gap-1.5 text-xs text-muted">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500" aria-hidden="true"></span>
              Sin Stock (0)
            </span>
          </div>
        </div>
      </div>

      <div class="rounded-3xl bg-surface-box border border-outline-sub shadow-2xs overflow-hidden">
        <div class="table-wrapper m3-scrollbar">
          <table class="inventory-matrix-table text-left">
            <caption class="sr-only">
              Matriz de stock por color y talla para {{ product().name }} ({{ product().sku }})
            </caption>
            <thead>
              <tr class="border-b border-outline-sub bg-surface">
                <th
                  scope="col"
                  class="p-3.5 text-xs font-bold text-muted uppercase tracking-wider w-48 bg-surface border-r border-outline-sub">
                  Color / Talla
                </th>
                @for (col of columns(); track col.size) {
                  <th scope="col" class="p-3.5 text-center min-w-[130px] bg-surface">
                    <div class="flex flex-col items-center">
                      <span class="text-sm font-black text-main font-mono">{{ col.size }}</span>
                      <span class="text-[11px] font-mono text-muted bg-surface-high px-2 py-0.5 rounded-full mt-0.5">
                        {{ col.totalStock }} uds
                      </span>
                    </div>
                  </th>
                }
                <th scope="col" class="p-3.5 text-right font-bold text-xs text-muted uppercase tracking-wider min-w-[120px] bg-surface">
                  Total Fila
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-outline-sub">
              @for (row of rows(); track row.color.code) {
                <tr class="hover:bg-surface/50 transition-colors">
                  <th
                    scope="row"
                    class="p-3.5 bg-surface-box border-r border-outline-sub text-left font-normal">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-5 h-5 rounded-full shadow-2xs shrink-0"
                        [style.background-color]="row.color.hex"
                        [style.border]="row.color.border ? '1px solid ' + row.color.border : '1px solid rgba(0,0,0,0.1)'"
                        aria-hidden="true">
                      </div>
                      <div>
                        <div class="text-xs font-bold text-main leading-tight">{{ row.color.name }}</div>
                        <div class="text-[10px] font-mono text-muted">{{ row.color.code }}</div>
                      </div>
                    </div>
                  </th>

                  @for (cell of row.cells; track cell.variantSku) {
                    <td class="p-2 text-center align-top">
                      <div
                        class="m3-matrix-cell group/cell"
                        [class.m3-matrix-cell-healthy]="cell.status === 'healthy'"
                        [class.m3-matrix-cell-low]="cell.status === 'low'"
                        [class.m3-matrix-cell-out]="cell.status === 'out_of_stock'">

                        <div class="text-[9px] font-mono text-muted truncate pb-0.5">
                          {{ cell.variantSku }}
                        </div>

                        <div class="flex items-center justify-center gap-1.5 my-1">
                          <span
                            [class.text-emerald-500]="cell.status === 'healthy'"
                            [class.text-amber-500]="cell.status === 'low'"
                            [class.text-rose-500]="cell.status === 'out_of_stock'"
                            class="text-lg font-black font-mono tracking-tight">
                            {{ cell.stock }}
                          </span>
                          @if (cell.reserved > 0) {
                            <span
                              class="text-[9px] font-mono text-muted bg-surface-high px-1 rounded"
                              [title]="cell.reserved + ' unidades reservadas'">
                              -{{ cell.reserved }}
                            </span>
                          }
                        </div>

                        <div class="flex items-center justify-center gap-1 pt-1 opacity-85 group-hover/cell:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button
                            type="button"
                            [attr.aria-label]="'Restar 1 unidad de ' + product().name + ' ' + row.color.name + ' talla ' + cell.size"
                            (click)="adjustStock.emit({ variantSku: cell.variantSku, delta: -1 })"
                            [disabled]="cell.stock === 0"
                            class="w-6 h-6 rounded-lg bg-surface border border-outline-sub text-muted hover:text-main hover:bg-surface-high grid place-items-center text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all">
                            -
                          </button>

                          <button
                            type="button"
                            [attr.aria-label]="'Transferir ' + product().name + ' ' + row.color.name + ' talla ' + cell.size"
                            (click)="openTransfer.emit({ variantSku: cell.variantSku, size: cell.size, colorName: row.color.name })"
                            class="h-6 px-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-all"
                            title="Transferir entre almacenes">
                            <span class="material-symbols-rounded text-xs" aria-hidden="true">sync_alt</span>
                          </button>

                          <button
                            type="button"
                            [attr.aria-label]="'Sumar 1 unidad de ' + product().name + ' ' + row.color.name + ' talla ' + cell.size"
                            (click)="adjustStock.emit({ variantSku: cell.variantSku, delta: 1 })"
                            class="w-6 h-6 rounded-lg bg-surface border border-outline-sub text-muted hover:text-main hover:bg-surface-high grid place-items-center text-xs font-bold cursor-pointer transition-all">
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                  }

                  <td class="p-3.5 text-right font-mono border-l border-outline-sub bg-surface/30">
                    <div class="text-sm font-black text-main">{{ row.totalStock }} <span class="text-xs font-normal text-muted">uds</span></div>
                    @if (row.totalReserved > 0) {
                      <div class="text-[10px] text-muted">{{ row.totalReserved }} reservadas</div>
                    }
                  </td>
                </tr>
              }
            </tbody>

            <tfoot>
              <tr class="bg-surface border-t-2 border-outline-sub font-mono">
                <th
                  scope="row"
                  class="p-3.5 text-xs font-bold text-main uppercase bg-surface border-r border-outline-sub text-left">
                  Total Global Tallas
                </th>
                @for (col of columns(); track col.size) {
                  <td class="p-3 text-center">
                    <span class="text-xs font-black text-main">{{ col.totalStock }}</span>
                  </td>
                }
                <td class="p-3.5 text-right">
                  <span class="text-base font-black text-primary">
                    {{ totalUnitsInMatrix() }} uds
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="p-3 rounded-2xl bg-surface-box/60 border border-outline-sub text-xs text-muted flex flex-wrap items-center justify-between gap-2">
        <span class="flex items-center gap-2">
          <span class="material-symbols-rounded text-primary text-base" aria-hidden="true">bolt</span>
          Matriz reactiva con Signals computadas • Edita stock con +/- o despacha entre sedes
        </span>
        <span class="font-mono text-[11px]">
          Almacén objetivo de ajuste: <strong>{{ targetAdjustmentWarehouseName() }}</strong>
        </span>
      </div>
    </div>
  `
})
export class InventoryMatrixComponent {
  readonly product = input.required<MasterProduct>();
  readonly rows = input.required<MatrixRowView[]>();
  readonly columns = input.required<MatrixColumnSummary[]>();
  readonly activeLowThreshold = input.required<number>();
  readonly selectedWarehouseId = input.required<string>();
  readonly warehouses = input.required<Warehouse[]>();
  readonly transitionPhase = input<'before' | 'after' | null>(null);

  readonly adjustStock = output<{ variantSku: string; delta: number }>();
  readonly openTransfer = output<{ variantSku: string; size: string; colorName: string }>();

  readonly failedImages = signal<Record<number, boolean>>({});

  readonly lowRangeUpper = computed(() => Math.max(1, this.activeLowThreshold() - 1));

  readonly totalUnitsInMatrix = computed<number>(() =>
    this.rows().reduce((acc, row) => acc + row.totalStock, 0)
  );

  readonly targetAdjustmentWarehouseName = computed<string>(() => {
    const whId = this.selectedWarehouseId();
    if (whId === 'ALL') {
      return 'Almacén Central Lurín (por defecto en vista consolidada)';
    }
    const wh = this.warehouses().find(w => w.id === whId);
    return wh ? wh.name : whId;
  });

  markImageFailed(productId: number): void {
    this.failedImages.update(prev => ({ ...prev, [productId]: true }));
  }
}
