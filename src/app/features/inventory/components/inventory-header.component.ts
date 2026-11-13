import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { InventoryKpiSummary, Warehouse } from '../../../core/inventory/inventory.models';
import { M3LinearProgressComponent } from '../../../shared/components/progress';

@Component({
  selector: 'app-inventory-header',
  standalone: true,
  imports: [M3LinearProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <header class="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-outline-sub shrink-0">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary text-on-primary">
              M3 Expressive • Logistics
            </span>
            <span class="text-xs font-mono text-muted">
              v2.4 Omnichannel Matrix
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-main tracking-tight flex flex-wrap items-center gap-3">
            Matriz Multidimensional de Stock
            <span class="text-sm font-semibold text-muted bg-surface-box px-3 py-1 rounded-full border border-outline-sub">
              {{ activeWarehouseName() }}
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-muted">
            Control de inventario en 3 ejes: Talla (X) × Color (Y) × Almacén (Z) con balanceo en tiempo real
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <div
            role="tablist"
            aria-label="Selector de almacenes"
            class="flex items-center p-1 rounded-2xl bg-surface-box border border-outline-sub shadow-2xs overflow-x-auto max-w-full">
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="selectedWarehouseId() === 'ALL'"
              (click)="selectWarehouse.emit('ALL')"
              [class.bg-sec-box]="selectedWarehouseId() === 'ALL'"
              [class.text-on-sec-box]="selectedWarehouseId() === 'ALL'"
              [class.font-bold]="selectedWarehouseId() === 'ALL'"
              class="px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer text-muted hover:text-main">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">hub</span>
                Consolidado
              </span>
            </button>

            @for (wh of warehouses(); track wh.id) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="selectedWarehouseId() === wh.id"
                (click)="selectWarehouse.emit(wh.id)"
                [class.bg-sec-box]="selectedWarehouseId() === wh.id"
                [class.text-on-sec-box]="selectedWarehouseId() === wh.id"
                [class.font-bold]="selectedWarehouseId() === wh.id"
                class="px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer text-muted hover:text-main">
                <span class="flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm" aria-hidden="true">
                    {{ wh.type === 'central' ? 'warehouse' : 'storefront' }}
                  </span>
                  {{ wh.name.replace('Almacén ', '').replace('Store ', '') }}
                </span>
              </button>
            }
          </div>

          <button
            type="button"
            (click)="openCreate.emit()"
            class="btn-m3 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:brightness-110">
            <span class="material-symbols-rounded text-base" aria-hidden="true">add_circle</span>
            <span>+ Nueva Prenda</span>
          </button>

          <button
            type="button"
            (click)="batchReplenish.emit()"
            class="btn-m3 px-3.5 py-2 rounded-xl bg-surface-box hover:bg-surface-high border border-outline-sub text-main text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer transition-all">
            <span class="material-symbols-rounded text-base text-primary" aria-hidden="true">add_box</span>
            <span>Reabastecer Lote</span>
          </button>

          <button
            type="button"
            [attr.aria-expanded]="isAuditHistoryOpen()"
            (click)="toggleAuditHistory.emit()"
            [class.bg-primary]="isAuditHistoryOpen()"
            [class.text-on-primary]="isAuditHistoryOpen()"
            class="btn-m3 px-3.5 py-2 rounded-xl bg-surface-box hover:bg-surface-high border border-outline-sub text-main text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer transition-all">
            <span class="material-symbols-rounded text-base" aria-hidden="true">history</span>
            <span>Movimientos ({{ transfersCount() }})</span>
          </button>
        </div>
      </header>

      <section aria-label="Indicadores de inventario" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Valorización Activa</span>
            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">monetization_on</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight font-mono">
              \${{ kpiSummary().totalCatalogValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[11px] text-muted flex items-center gap-1 mt-1">
              <span class="text-emerald-500 font-bold flex items-center">
                <span class="material-symbols-rounded text-sm" aria-hidden="true">trending_up</span> +8.5%
              </span>
              <span>vs mes anterior</span>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Unidades en Almacén</span>
            <div class="w-8 h-8 rounded-full bg-secondary/10 text-secondary grid place-items-center">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">inventory_2</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight font-mono">
              {{ kpiSummary().totalUnits.toLocaleString() }} <span class="text-xs font-normal text-muted">uds</span>
            </div>
            <div class="text-[11px] text-muted flex items-center gap-1 mt-1">
              <span>Distribuidas en {{ kpiSummary().totalSkus }} SKUs</span>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Quiebres & Riesgo</span>
            <div class="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 grid place-items-center">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">warning</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight flex items-center gap-2">
              <span class="text-rose-500 font-mono">{{ kpiSummary().outOfStockSkus }}</span>
              <span class="text-xs text-muted font-normal">agotados</span>
              <span class="text-xs text-muted font-normal">•</span>
              <span class="text-amber-500 font-mono">{{ kpiSummary().lowStockSkus }}</span>
              <span class="text-xs text-muted font-normal">bajos</span>
            </div>
            <div class="text-[11px] text-muted flex items-center gap-1 mt-1">
              <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true"></span>
              <span>Requieren reposición en tienda</span>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Salud de Variantes</span>
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center">
              <span class="material-symbols-rounded text-lg" aria-hidden="true">verified</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight font-mono flex items-center gap-2">
              <span>{{ kpiSummary().healthRate }}%</span>
              <span
                [class]="kpiSummary().healthRate >= 80 ? 'text-xs px-2 py-0.5 rounded-full font-sans font-bold bg-emerald-500/10 text-emerald-500' : 'text-xs px-2 py-0.5 rounded-full font-sans font-bold bg-amber-500/10 text-amber-500'">
                {{ kpiSummary().healthRate >= 80 ? 'Óptimo' : 'En Atención' }}
              </span>
            </div>
            <div class="mt-2.5">
              <m3-linear-progress
                [value]="kpiSummary().healthRate"
                [wavy]="true"
                size="md"
                color="primary"
                ariaLabel="Tasa de salud de variantes" />
            </div>
          </div>
        </div>
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

  readonly selectWarehouse = output<string>();
  readonly openCreate = output<void>();
  readonly batchReplenish = output<void>();
  readonly toggleAuditHistory = output<void>();
}
