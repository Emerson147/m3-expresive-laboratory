import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { InventoryKpiSummary, Warehouse } from '../../../core/inventory/inventory.models';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ButtonGroupComponent, M3ButtonGroupOption } from '../../../shared/components/button/button-group.component';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

@Component({
  selector: 'app-inventory-header',
  standalone: true,
  imports: [M3ButtonComponent, M3ButtonGroupComponent, M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-2.5 shrink-0">
      <!-- Clean Editorial Command Rail -->
      <header class="bg-surface-low rounded-m3-xl px-4 py-3 sm:px-5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-xl" aria-hidden="true">inventory_2</span>
          </div>

          <div class="min-w-0">
            <h1 class="text-title-lg-emphasized sm:text-headline-sm-emphasized text-main flex flex-wrap items-center gap-2.5">
              <span class="truncate">Matriz Multidimensional de Stock</span>
              <span class="text-label-md-emphasized text-muted bg-surface px-2.5 py-0.5 rounded-m3-full">
                {{ activeWarehouseName() }}
              </span>
            </h1>
            <p class="text-label-md text-muted truncate mt-0.5">
              Control por talla, color y sede en tiempo real
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="overflow-x-auto max-w-full py-0.5">
            <m3-button-group
              variant="connected"
              selectionMode="single"
              size="sm"
              ariaLabel="Selector de almacenes"
              [options]="warehouseOptions()"
              [value]="[selectedWarehouseId()]"
              (selectionChange)="onWarehouseSelection($event)" />
          </div>

          <m3-button
            variant="tonal"
            size="sm"
            icon="add_box"
            (action)="batchReplenish.emit()">
            Reabastecer Lote
          </m3-button>

          <m3-button
            [variant]="isAuditHistoryOpen() ? 'filled' : 'tonal'"
            size="sm"
            icon="history"
            [toggle]="true"
            [selected]="isAuditHistoryOpen()"
            (action)="toggleAuditHistory.emit()">
            Movimientos ({{ transfersCount() }})
          </m3-button>

          <m3-button
            variant="filled"
            size="sm"
            icon="add_circle"
            [morph]="true"
            [invisible]="isCreateOriginInvisible()"
            [viewTransitionName]="isCreateOriginActive() ? 'dialog-transform' : null"
            (action)="openCreate.emit()">
            + Nueva Prenda
          </m3-button>
        </div>
      </header>

      <!-- Compact 3-Metric Tonal Strip (Zero Redundancy, Zero Wavy Noise) -->
      <section aria-label="Indicadores de inventario" class="grid grid-cols-1 md:grid-cols-3 gap-2.5 shrink-0">
        <!-- Valorización -->
        <article class="bg-surface-low rounded-m3-xl px-4 py-3 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-label-md text-muted">Valorización Activa</p>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-title-lg-emphasized font-mono tabular-nums text-main">
                \${{ formattedValuation() }}
              </span>
              <span class="text-label-sm-emphasized text-success flex items-center gap-0.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">trending_up</span>
                +8.5%
              </span>
            </div>
          </div>

          <div class="w-9 h-9 rounded-m3-lg bg-tertiary-box text-on-tertiary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-lg" aria-hidden="true">monetization_on</span>
          </div>
        </article>

        <!-- Existencias & Riesgo -->
        <article class="bg-surface-low rounded-m3-xl px-4 py-3 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-label-md text-muted">Existencias ({{ kpiSummary().totalSkus }} SKUs)</p>
            <p class="text-title-lg-emphasized font-mono tabular-nums text-main mt-0.5">
              {{ kpiSummary().totalUnits.toLocaleString() }}
              <span class="text-label-md font-sans text-muted font-normal">uds</span>
            </p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span class="px-2.5 py-1 rounded-m3-md bg-error-box text-on-error-box text-label-sm-emphasized font-mono tabular-nums">
              {{ kpiSummary().outOfStockSkus }} agotados
            </span>
            <span class="px-2.5 py-1 rounded-m3-md bg-warning-box text-on-warning-box text-label-sm-emphasized font-mono tabular-nums">
              {{ kpiSummary().lowStockSkus }} bajos
            </span>
          </div>
        </article>

        <!-- Salud de Catálogo (Flat Deterministic Progress) -->
        <article class="bg-surface-low rounded-m3-xl px-4 py-3 flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-baseline gap-2">
              <span class="text-label-md text-muted">Salud de Variantes</span>
              <span class="text-title-md-emphasized font-mono tabular-nums text-main">
                {{ kpiSummary().healthRate }}%
              </span>
            </div>

            <span
              [class]="kpiSummary().healthRate >= 80
                ? 'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full bg-success-box text-on-success-box'
                : 'text-label-sm-emphasized px-2.5 py-0.5 rounded-m3-full bg-warning-box text-on-warning-box'">
              {{ kpiSummary().healthRate >= 80 ? 'Óptimo' : 'En Atención' }}
            </span>
          </div>

          <m3-linear-progress
            [value]="kpiSummary().healthRate"
            [wavy]="false"
            size="sm"
            [color]="kpiSummary().healthRate >= 80 ? 'primary' : 'error'"
            ariaLabel="Tasa de salud de variantes" />
        </article>
      </section>
    </div>
  `
})
export class InventoryHeaderComponent {
  readonly warehouses = input.required<Warehouse[]>();
  readonly selectedWarehouseId = input.required<string>();
  readonly activeWarehouseName = input.required<string>();
  readonly kpiSummary = input.required<InventoryKpiSummary>();
  readonly transfersCount = input.required<number>();
  readonly isAuditHistoryOpen = input.required<boolean>();
  readonly isCreateOriginActive = input<boolean>(false);
  readonly isCreateOriginInvisible = input<boolean>(false);

  readonly selectWarehouse = output<string>();
  readonly openCreate = output<void>();
  readonly batchReplenish = output<void>();
  readonly toggleAuditHistory = output<void>();

  readonly warehouseOptions = computed<M3ButtonGroupOption[]>(() => [
    { id: 'ALL', label: 'Consolidado', icon: 'hub' },
    ...this.warehouses().map(wh => ({
      id: wh.id,
      label: wh.name.replace('Almacén ', '').replace('Store ', ''),
      icon: wh.type === 'central' ? 'warehouse' : 'storefront'
    }))
  ]);

  readonly formattedValuation = computed(() =>
    this.kpiSummary().totalCatalogValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );

  onWarehouseSelection(selectedIds: string[]): void {
    const selectedId = selectedIds[0];
    if (selectedId) {
      this.selectWarehouse.emit(selectedId);
    }
  }
}
