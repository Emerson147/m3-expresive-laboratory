import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import {
  MasterProduct,
  MatrixColumnSummary,
  MatrixRowView,
  Warehouse
} from '../../../core/inventory/inventory.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';

@Component({
  selector: 'app-inventory-matrix',
  standalone: true,
  imports: [M3ButtonComponent, M3SwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 min-h-0'
  },
  styles: [`
    .table-wrapper {
      overflow: auto;
      max-inline-size: 100%;
      max-block-size: min(540px, 70vh);
      container-type: inline-size;
      touch-action: pan-x pan-y;
    }

    @media (min-width: 1024px) {
      .table-wrapper {
        max-block-size: none;
      }
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

    @container (inline-size < 640px) {
      .inventory-matrix-table thead th:first-child,
      .inventory-matrix-table tbody th,
      .inventory-matrix-table tfoot th {
        min-inline-size: 8.5rem;
      }

      .inventory-matrix-table .m3-matrix-size-col {
        min-inline-size: 6.75rem;
      }
    }
  `],
  template: `
    <!-- Clean Editorial Garment Summary Strip -->
    <section
      aria-label="Resumen de modelo seleccionado"
      class="bg-surface-low rounded-m3-xl p-4 shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
      <div class="flex items-center gap-3.5 min-w-0">
        <div
          [style.view-transition-name]="transitionPhase() === 'after' ? 'product-hero-image' : null"
          class="w-16 h-16 sm:w-20 sm:h-20 rounded-m3-lg overflow-hidden bg-surface-high shrink-0 relative">
          @if (failedImages()[product().id]) {
            <div class="w-full h-full flex items-center justify-center">
              <span class="material-symbols-rounded text-muted text-2xl" aria-hidden="true">checkroom</span>
            </div>
          } @else {
            <img
              [src]="product().imageUrl"
              [alt]="product().name"
              width="80"
              height="80"
              (error)="markImageFailed(product().id)"
              class="block w-full h-full object-cover" />
          }
        </div>

        <div class="space-y-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded-m3-xs font-mono text-label-sm-emphasized bg-primary text-on-primary">
              {{ product().sku }}
            </span>
            <span class="text-label-md text-muted">{{ product().categoryLabel }}</span>
            <span class="text-muted text-label-sm" aria-hidden="true">·</span>
            <span class="text-label-md text-muted">{{ product().season }}</span>
          </div>

          <h2
            [style.view-transition-name]="transitionPhase() === 'after' ? 'product-hero-title' : null"
            class="inv-hero-title text-title-lg-emphasized sm:text-headline-sm-emphasized text-main">
            {{ product().name }}
          </h2>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-muted">
            <span>Marca: <strong class="text-main">{{ product().brand }}</strong></span>
            <span aria-hidden="true">·</span>
            <span>PVP: <strong class="text-main font-mono tabular-nums">\${{ product().basePrice.toFixed(2) }}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Total: <strong class="text-main font-mono tabular-nums">{{ totalUnitsInMatrix() }} uds</strong></span>
            <span aria-hidden="true">·</span>
            <span>Ajuste: <strong class="text-main">{{ targetAdjustmentWarehouseName() }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Single Authoritative Matrix Controls & Legend -->
      <div class="flex flex-wrap items-center justify-between xl:justify-end gap-3 shrink-0">
        <div class="flex flex-wrap items-center gap-2.5 bg-surface px-3 py-1.5 rounded-m3-full">
          <span class="flex items-center gap-1.5 text-label-sm-emphasized text-muted">
            <span class="w-2 h-2 rounded-m3-full bg-success" aria-hidden="true"></span>
            Saludable (≥{{ activeLowThreshold() }})
          </span>
          <span class="flex items-center gap-1.5 text-label-sm-emphasized text-muted">
            <span class="w-2 h-2 rounded-m3-full bg-warning" aria-hidden="true"></span>
            Bajo (1-{{ lowRangeUpper() }})
          </span>
          <span class="flex items-center gap-1.5 text-label-sm-emphasized text-muted">
            <span class="w-2 h-2 rounded-m3-full bg-error" aria-hidden="true"></span>
            Sin Stock (0)
          </span>
        </div>

        <div class="rounded-m3-full bg-surface px-3 py-1">
          <m3-switch
            label="Solo alertas"
            [withIcons]="true"
            [(checked)]="alertsOnlyMode" />
        </div>
      </div>
    </section>

    <!-- Scrollable 2D Matrix Workspace (Bounded Flex Height) -->
    <section
      aria-label="Matriz interactiva de color por talla"
      class="flex-1 min-h-0 flex flex-col bg-surface-low rounded-m3-xl p-2.5">

      <div
        [class]="'table-wrapper inv-scroll-pane flex-1 min-h-0 rounded-m3-lg bg-surface m3-scrollbar ' +
          (transitionPhase() === 'after' ? 'inv-matrix-revealed' : '')">
        <table class="inventory-matrix-table text-left">
          <caption class="sr-only">
            Matriz de stock por color y talla para {{ product().name }} ({{ product().sku }})
          </caption>
          <thead>
            <tr class="bg-surface-high">
              <th
                scope="col"
                class="p-3 text-label-md-emphasized text-muted uppercase tracking-wider w-44 bg-surface-high rounded-ss-m3-lg">
                Color / Talla
              </th>
              @for (col of columns(); track col.size) {
                <th scope="col" class="m3-matrix-size-col p-2.5 text-center min-w-[126px] bg-surface-high">
                  <div class="flex flex-col items-center gap-0.5">
                    <span class="text-title-sm-emphasized text-main font-mono">{{ col.size }}</span>
                    <span class="text-label-sm font-mono tabular-nums text-muted">
                      {{ col.totalStock }} uds
                    </span>
                  </div>
                </th>
              }
              <th scope="col" class="p-3 text-right text-label-md-emphasized text-muted uppercase tracking-wider min-w-[112px] bg-surface-high rounded-se-m3-lg">
                Total Fila
              </th>
            </tr>
          </thead>

          <tbody>
            @for (row of rows(); track row.color.code; let rowIdx = $index) {
              <tr class="transition-colors m3-transition-fast hover:bg-surface-low/50">
                <th
                  scope="row"
                  class="p-3 bg-surface text-left font-normal">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-5 h-5 rounded-m3-full shrink-0"
                      [style.background-color]="row.color.hex"
                      [style.border]="row.color.border ? '1px solid ' + row.color.border : '1px solid color-mix(in oklch, var(--md-sys-color-outline) 28%, transparent)'"
                      aria-hidden="true">
                    </div>
                    <div class="min-w-0">
                      <div class="text-label-lg-emphasized text-main leading-tight truncate">{{ row.color.name }}</div>
                      <div class="text-label-sm font-mono text-muted">{{ row.color.code }}</div>
                    </div>
                  </div>
                </th>

                @for (cell of row.cells; track cell.variantSku; let colIdx = $index) {
                  <td class="p-1.5 text-center align-top">
                    <div
                      class="m3-matrix-cell inv-matrix-cell group/cell px-2 py-2"
                      [style.--cell-index]="rowIdx * columns().length + colIdx"
                      [class.m3-matrix-cell-healthy]="cell.status === 'healthy'"
                      [class.m3-matrix-cell-low]="cell.status === 'low'"
                      [class.m3-matrix-cell-out]="cell.status === 'out_of_stock'"
                      [class.opacity-40]="alertsOnlyMode() && cell.status === 'healthy'">

                      <div class="text-label-sm font-mono text-muted truncate">
                        {{ cell.variantSku }}
                      </div>

                      <div class="flex items-center justify-center gap-1.5 my-1">
                        <span
                          [class.text-success]="cell.status === 'healthy'"
                          [class.text-warning]="cell.status === 'low'"
                          [class.text-error]="cell.status === 'out_of_stock'"
                          class="text-title-lg-emphasized font-mono tabular-nums">
                          {{ cell.stock }}
                        </span>
                        @if (cell.reserved > 0) {
                          <span
                            class="text-label-sm font-mono tabular-nums text-muted bg-surface px-1.5 rounded-m3-full"
                            [title]="cell.reserved + ' unidades reservadas'">
                            -{{ cell.reserved }}
                          </span>
                        }
                      </div>

                      <div class="flex items-center justify-center gap-1 opacity-90 group-hover/cell:opacity-100 focus-within:opacity-100 transition-opacity m3-transition-fast">
                        <m3-button
                          variant="text"
                          size="xs"
                          [iconOnly]="true"
                          icon="remove"
                          [disabled]="cell.stock === 0"
                          [ariaLabel]="'Restar 1 unidad de ' + product().name + ' ' + row.color.name + ' talla ' + cell.size"
                          (action)="adjustStock.emit({ variantSku: cell.variantSku, delta: -1 })" />

                        <m3-button
                          variant="tonal"
                          size="xs"
                          [iconOnly]="true"
                          icon="sync_alt"
                          [invisible]="hiddenTransferOriginSku() === cell.variantSku"
                          [viewTransitionName]="activeTransferOriginSku() === cell.variantSku ? 'dialog-transform' : null"
                          [ariaLabel]="'Transferir ' + product().name + ' ' + row.color.name + ' talla ' + cell.size"
                          (action)="openTransfer.emit({ variantSku: cell.variantSku, size: cell.size, colorName: row.color.name })" />

                        <m3-button
                          variant="text"
                          size="xs"
                          [iconOnly]="true"
                          icon="add"
                          [ariaLabel]="'Sumar 1 unidad de ' + product().name + ' ' + row.color.name + ' talla ' + cell.size"
                          (action)="adjustStock.emit({ variantSku: cell.variantSku, delta: 1 })" />
                      </div>
                    </div>
                  </td>
                }

                <td class="p-3 text-right font-mono tabular-nums bg-surface-low/50">
                  <div class="text-title-sm-emphasized text-main">{{ row.totalStock }} <span class="text-body-sm text-muted font-sans">uds</span></div>
                  @if (row.totalReserved > 0) {
                    <div class="text-label-sm text-muted font-sans">{{ row.totalReserved }} reservadas</div>
                  }
                </td>
              </tr>
            }
          </tbody>

          <tfoot>
            <tr class="bg-surface-high font-mono tabular-nums">
              <th
                scope="row"
                class="p-3 text-label-md-emphasized text-main uppercase bg-surface-high text-left font-sans rounded-es-m3-lg">
                Total Global Tallas
              </th>
              @for (col of columns(); track col.size) {
                <td class="p-2.5 text-center">
                  <span class="text-label-lg-emphasized text-main">{{ col.totalStock }}</span>
                </td>
              }
              <td class="p-3 text-right rounded-ee-m3-lg">
                <span class="text-title-md-emphasized text-primary">
                  {{ totalUnitsInMatrix() }} uds
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
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
  readonly activeTransferOriginSku = input<string | null>(null);
  readonly hiddenTransferOriginSku = input<string | null>(null);

  readonly alertsOnlyMode = model<boolean>(false);

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
      return 'Almacén Central Lurín (por defecto)';
    }
    const wh = this.warehouses().find(w => w.id === whId);
    return wh ? wh.name : whId;
  });

  markImageFailed(productId: number): void {
    this.failedImages.update(prev => ({ ...prev, [productId]: true }));
  }
}
