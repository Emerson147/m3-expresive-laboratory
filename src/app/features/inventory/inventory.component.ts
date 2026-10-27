import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { M3LinearProgressComponent } from '../../shared/components/progress';
import { InventoryService } from '../../core/inventory/inventory.service';
import {
  CreateMasterProductDto,
  MasterProduct,
  ProductColor,
  SIZE_PRESETS,
  STANDARD_COLORS
} from '../../core/inventory/inventory.models';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, M3LinearProgressComponent],
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface'
  },
  template: `
    <!-- =========================================================================
         CONTENEDOR PRINCIPAL: SCROLL VERTICAL FLUIDO CON TOKENS M3 EXPRESSIVE
         ========================================================================= -->
    <div class="flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 py-4 space-y-5">

      <!-- =====================================================================
           1. CONTROL STRIP SUPERIOR: TÍTULO, SELECTOR DE HUB & ACCIONES RÁPIDAS
           ===================================================================== -->
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
          <h1 class="text-2xl sm:text-3xl font-black text-main tracking-tight flex items-center gap-3">
            Matriz Multidimensional de Stock
            <span class="text-sm font-semibold text-muted bg-surface-box px-3 py-1 rounded-full border border-outline-sub">
              {{ inventoryService.activeWarehouse().name }}
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-muted">
            Control de inventario en 3 ejes: Talla (X) × Color (Y) × Almacén (Z) con balanceo en tiempo real
          </p>
        </div>

        <!-- Acciones globales & Selector de Almacenes -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Segmented Warehouse Switcher -->
          <div class="flex items-center p-1 rounded-2xl bg-surface-box border border-outline-sub shadow-2xs overflow-x-auto max-w-full">
            <button
              type="button"
              (click)="inventoryService.setWarehouse('ALL')"
              [class.bg-sec-box]="inventoryService.selectedWarehouseId() === 'ALL'"
              [class.text-on-sec-box]="inventoryService.selectedWarehouseId() === 'ALL'"
              [class.font-bold]="inventoryService.selectedWarehouseId() === 'ALL'"
              class="px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer text-muted hover:text-main">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm">hub</span>
                Consolidado
              </span>
            </button>

            @for (wh of inventoryService.warehouses(); track wh.id) {
              <button
                type="button"
                (click)="inventoryService.setWarehouse(wh.id)"
                [class.bg-sec-box]="inventoryService.selectedWarehouseId() === wh.id"
                [class.text-on-sec-box]="inventoryService.selectedWarehouseId() === wh.id"
                [class.font-bold]="inventoryService.selectedWarehouseId() === wh.id"
                class="px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer text-muted hover:text-main">
                <span class="flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm">
                    {{ wh.type === 'central' ? 'warehouse' : 'storefront' }}
                  </span>
                  {{ wh.name.replace('Almacén ', '').replace('Store ', '') }}
                </span>
              </button>
            }
          </div>

          <!-- Botones de Acción -->
          <button
            type="button"
            (click)="openCreateModal()"
            class="btn-m3 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:brightness-110">
            <span class="material-symbols-rounded text-base">add_circle</span>
            <span>+ Nueva Prenda</span>
          </button>

          <button
            type="button"
            (click)="inventoryService.batchReplenishLowStock()"
            class="btn-m3 px-3.5 py-2 rounded-xl bg-surface-box hover:bg-surface-high border border-outline-sub text-main text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer transition-all">
            <span class="material-symbols-rounded text-base text-primary">add_box</span>
            <span>Reabastecer Lote</span>
          </button>

          <button
            type="button"
            (click)="inventoryService.toggleAuditHistory()"
            [class.bg-primary]="inventoryService.isAuditHistoryOpen()"
            [class.text-on-primary]="inventoryService.isAuditHistoryOpen()"
            class="btn-m3 px-3.5 py-2 rounded-xl bg-surface-box hover:bg-surface-high border border-outline-sub text-main text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer transition-all">
            <span class="material-symbols-rounded text-base">history</span>
            <span>Movimientos ({{ inventoryService.stockTransfers().length }})</span>
          </button>
        </div>
      </header>

      <!-- =====================================================================
           2. BENTO RIBBON DE MÉTRICAS (KPIs CLAVE)
           ===================================================================== -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        <!-- KPI 1: Valorización de Inventario -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Valorización Activa</span>
            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center">
              <span class="material-symbols-rounded text-lg">monetization_on</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight font-mono">
              \${{ inventoryService.kpiSummary().totalCatalogValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div class="text-[11px] text-muted flex items-center gap-1 mt-1">
              <span class="text-emerald-500 font-bold flex items-center">
                <span class="material-symbols-rounded text-sm">trending_up</span> +8.5%
              </span>
              <span>vs mes anterior</span>
            </div>
          </div>
        </div>

        <!-- KPI 2: Unidades Físicas -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Unidades en Almacén</span>
            <div class="w-8 h-8 rounded-full bg-secondary/10 text-secondary grid place-items-center">
              <span class="material-symbols-rounded text-lg">inventory_2</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight font-mono">
              {{ inventoryService.kpiSummary().totalUnits.toLocaleString() }} <span class="text-xs font-normal text-muted">uds</span>
            </div>
            <div class="text-[11px] text-muted flex items-center gap-1 mt-1">
              <span>Distribuidas en {{ inventoryService.kpiSummary().totalSkus }} SKUs</span>
            </div>
          </div>
        </div>

        <!-- KPI 3: Alertas de Quiebre & Stock Crítico -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Quiebres & Riesgo</span>
            <div class="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 grid place-items-center">
              <span class="material-symbols-rounded text-lg">warning</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight flex items-center gap-2">
              <span class="text-rose-500 font-mono">{{ inventoryService.kpiSummary().outOfStockSkus }}</span>
              <span class="text-xs text-muted font-normal">agotados</span>
              <span class="text-xs text-muted font-normal">•</span>
              <span class="text-amber-500 font-mono">{{ inventoryService.kpiSummary().lowStockSkus }}</span>
              <span class="text-xs text-muted font-normal">bajos</span>
            </div>
            <div class="text-[11px] text-muted flex items-center gap-1 mt-1">
              <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Requieren reposición en tienda</span>
            </div>
          </div>
        </div>

        <!-- KPI 4: Tasa de Salud Omnicanal -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col justify-between transition-all hover:border-primary/40">
          <div class="flex items-center justify-between text-muted text-xs font-medium">
            <span>Salud de Variantes</span>
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center">
              <span class="material-symbols-rounded text-lg">verified</span>
            </div>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black text-main tracking-tight font-mono flex items-center gap-2">
              <span>{{ inventoryService.kpiSummary().healthRate }}%</span>
              <span
                [class]="inventoryService.kpiSummary().healthRate >= 80 ? 'text-xs px-2 py-0.5 rounded-full font-sans font-bold bg-emerald-500/10 text-emerald-500' : 'text-xs px-2 py-0.5 rounded-full font-sans font-bold bg-amber-500/10 text-amber-500'">
                {{ inventoryService.kpiSummary().healthRate >= 80 ? 'Óptimo' : 'En Atención' }}
              </span>
            </div>
            <!-- M3 Expressive Living Wave Progress -->
            <div class="mt-2.5">
              <m3-linear-progress
                [value]="inventoryService.kpiSummary().healthRate"
                [wavy]="true"
                size="md"
                color="primary"
                ariaLabel="Tasa de salud de variantes" />
            </div>
          </div>
        </div>
      </section>

      <!-- =====================================================================
           3. SECCIÓN SPLIT: CATÁLOGO DE PRENDAS (IZQUIERDA) + MATRIZ 2D (DERECHA)
           ===================================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        <!-- ===================================================================
             3.1 PANEL IZQUIERDO: SELECTOR DE MODELOS / ESTILOS (4 COLS)
             =================================================================== -->
        <div class="lg:col-span-4 xl:col-span-3 space-y-3.5">
          <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-main uppercase tracking-wider">Prendas & Modelos</h2>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-semibold text-muted">
                  {{ inventoryService.filteredProducts().length }} estilos
                </span>
                <button
                  type="button"
                  (click)="openCreateModal()"
                  class="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">add_circle</span>
                  Nuevo
                </button>
              </div>
            </div>

            <!-- Buscador de modelos -->
            <div class="relative">
              <span class="material-symbols-rounded absolute left-3 top-2.5 text-base text-muted pointer-events-none">search</span>
              <input
                type="text"
                [ngModel]="inventoryService.searchQuery()"
                (ngModelChange)="inventoryService.setSearchQuery($event)"
                placeholder="Buscar por SKU, nombre..."
                class="w-full text-xs pl-8 pr-8 py-2 rounded-xl bg-surface border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              @if (inventoryService.searchQuery()) {
                <button
                  type="button"
                  (click)="inventoryService.setSearchQuery('')"
                  class="absolute right-2.5 top-2 text-muted hover:text-main cursor-pointer">
                  <span class="material-symbols-rounded text-sm">close</span>
                </button>
              }
            </div>

            <!-- Filtros de categoría chips -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              @for (cat of categories; track cat.id) {
                <button
                  type="button"
                  (click)="inventoryService.setCategory(cat.id)"
                  [class.bg-primary]="inventoryService.selectedCategory() === cat.id"
                  [class.text-on-primary]="inventoryService.selectedCategory() === cat.id"
                  [class.bg-surface]="inventoryService.selectedCategory() !== cat.id"
                  [class.text-muted]="inventoryService.selectedCategory() !== cat.id"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-outline-sub transition-all cursor-pointer hover:text-main">
                  {{ cat.label }}
                </button>
              }
            </div>
          </div>

          <!-- Lista de Productos Master Cards -->
          <div class="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            @for (prod of inventoryService.filteredProducts(); track prod.id) {
              <div
                (click)="inventoryService.selectProduct(prod.id)"
                [style.view-transition-name]="'product-card-' + prod.id"
                [class]="inventoryService.selectedProductId() === prod.id ? 'p-3 rounded-2xl bg-primary/10 border-2 border-primary cursor-pointer transition-all flex gap-3 items-center group shadow-md' : 'p-3 rounded-2xl bg-surface-box border border-outline-sub cursor-pointer transition-all hover:border-primary/50 flex gap-3 items-center group'">
                <!-- Miniatura -->
                <div class="w-16 h-16 rounded-xl overflow-hidden bg-surface-high shrink-0 border border-outline-sub relative">
                  <img
                    [src]="prod.imageUrl"
                    [alt]="prod.name"
                    [style.view-transition-name]="inventoryService.transitionPhase() === 'before' && inventoryService.transitioningProductId() === prod.id ? 'product-hero-image' : null"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {{ prod.sku }}
                    </span>
                    <span class="text-[10px] text-muted truncate">{{ prod.brand }}</span>
                  </div>
                  <h3 
                    [style.view-transition-name]="inventoryService.transitionPhase() === 'before' && inventoryService.transitioningProductId() === prod.id ? 'product-hero-title' : null"
                    class="text-xs font-bold text-main truncate mt-0.5 group-hover:text-primary transition-colors">
                    {{ prod.name }}
                  </h3>
                  <div class="flex items-center justify-between mt-1 text-[11px]">
                    <span class="font-mono font-bold text-main">\${{ prod.basePrice.toFixed(2) }}</span>
                    <div class="flex items-center gap-1">
                      <span class="text-[10px] text-muted">{{ prod.availableColors.length }} cols</span>
                      <span class="text-[10px] text-muted">•</span>
                      <span class="text-[10px] text-muted">{{ prod.availableSizes.length }} tallas</span>
                    </div>
                  </div>
                </div>

                <!-- Active check indicator -->
                @if (inventoryService.selectedProductId() === prod.id) {
                  <span class="material-symbols-rounded text-primary text-xl shrink-0">
                    arrow_forward_ios
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- ===================================================================
             3.2 PANEL DERECHO: MATRIZ 2D MULTIDIMENSIONAL (8 COLS)
             =================================================================== -->
        <div class="lg:col-span-8 xl:col-span-9 space-y-4">

          <!-- FICHA DEL MODELO SELECCIONADO (BANNER HERO COMPACTO CON SHARED ELEMENT) -->
          <div class="p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-surface-high border border-outline-sub shadow-sm shrink-0">
                <img
                  [src]="inventoryService.selectedProduct().imageUrl"
                  [alt]="inventoryService.selectedProduct().name"
                  [style.view-transition-name]="inventoryService.transitionPhase() === 'after' ? 'product-hero-image' : null"
                  class="w-full h-full object-cover" />
              </div>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-primary text-on-primary">
                    {{ inventoryService.selectedProduct().sku }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface border border-outline-sub text-muted">
                    {{ inventoryService.selectedProduct().categoryLabel }}
                  </span>
                  <span class="text-xs text-muted font-medium">
                    {{ inventoryService.selectedProduct().season }}
                  </span>
                </div>
                <h2 
                  [style.view-transition-name]="inventoryService.transitionPhase() === 'after' ? 'product-hero-title' : null"
                  class="text-lg sm:text-xl font-black text-main tracking-tight">
                  {{ inventoryService.selectedProduct().name }}
                </h2>
                <div class="flex items-center gap-3 text-xs text-muted">
                  <span>Marca: <strong class="text-main">{{ inventoryService.selectedProduct().brand }}</strong></span>
                  <span>•</span>
                  <span>PVP Base: <strong class="text-main font-mono">\${{ inventoryService.selectedProduct().basePrice.toFixed(2) }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Leyenda de colores del Heatmap celular -->
            <div class="flex flex-col sm:items-end gap-2 text-xs">
              <span class="text-[11px] font-bold text-muted uppercase tracking-wider">Estado de Salud Celular</span>
              <div class="flex items-center gap-3 bg-surface p-2 rounded-2xl border border-outline-sub">
                <span class="flex items-center gap-1.5 text-xs text-muted">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Saludable (≥15)
                </span>
                <span class="flex items-center gap-1.5 text-xs text-muted">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Bajo (1-14)
                </span>
                <span class="flex items-center gap-1.5 text-xs text-muted">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Sin Stock (0)
                </span>
              </div>
            </div>
          </div>

          <!-- =================================================================
               TABLA / GRILLA MATRICIAL 2D (TALLA vs COLOR)
               ================================================================= -->
          <div class="rounded-3xl bg-surface-box border border-outline-sub shadow-2xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-left">
                <!-- CABECERA: TALLAS (COLUMNAS X) -->
                <thead>
                  <tr class="border-b border-outline-sub bg-surface/80">
                    <th class="p-3.5 text-xs font-bold text-muted uppercase tracking-wider w-48 sticky left-0 bg-surface z-10">
                      Color / Talla
                    </th>
                    @for (col of inventoryService.matrixColumns(); track col.size) {
                      <th class="p-3.5 text-center min-w-[130px]">
                        <div class="flex flex-col items-center">
                          <span class="text-sm font-black text-main font-mono">{{ col.size }}</span>
                          <span class="text-[11px] font-mono text-muted bg-surface-high px-2 py-0.5 rounded-full mt-0.5">
                            {{ col.totalStock }} uds
                          </span>
                        </div>
                      </th>
                    }
                    <th class="p-3.5 text-right font-bold text-xs text-muted uppercase tracking-wider min-w-[120px]">
                      Total Fila
                    </th>
                  </tr>
                </thead>

                <!-- CUERPO: COLORES (FILAS Y) -->
                <tbody class="divide-y divide-outline-sub">
                  @for (row of inventoryService.matrixRows(); track row.color.code) {
                    <tr class="hover:bg-surface/50 transition-colors">
                      <!-- Cabecera de Fila (Color Swatch + Nombre) -->
                      <td class="p-3.5 sticky left-0 bg-surface-box z-10 border-r border-outline-sub">
                        <div class="flex items-center gap-2.5">
                          <div 
                            class="w-5 h-5 rounded-full shadow-2xs shrink-0"
                            [style.background-color]="row.color.hex"
                            [style.border]="row.color.border ? '1px solid ' + row.color.border : '1px solid rgba(0,0,0,0.1)'">
                          </div>
                          <div>
                            <div class="text-xs font-bold text-main leading-tight">{{ row.color.name }}</div>
                            <div class="text-[10px] font-mono text-muted">{{ row.color.code }}</div>
                          </div>
                        </div>
                      </td>

                      <!-- Celdas de Stock Interactivas -->
                      @for (cell of row.cells; track cell.variantSku) {
                        <td class="p-2 text-center align-top">
                          <div 
                            class="m3-matrix-cell group/cell"
                            [class.m3-matrix-cell-healthy]="cell.status === 'healthy'"
                            [class.m3-matrix-cell-low]="cell.status === 'low'"
                            [class.m3-matrix-cell-out]="cell.status === 'out_of_stock'">

                            <!-- SKU Micro-tag -->
                            <div class="text-[9px] font-mono text-muted truncate pb-0.5">
                              {{ cell.variantSku }}
                            </div>

                            <!-- Número de Stock Principal -->
                            <div class="flex items-center justify-center gap-1.5 my-1">
                              <span 
                                [class.text-emerald-500]="cell.status === 'healthy'"
                                [class.text-amber-500]="cell.status === 'low'"
                                [class.text-rose-500]="cell.status === 'out_of_stock'"
                                class="text-lg font-black font-mono tracking-tight">
                                {{ cell.stock }}
                              </span>
                              @if (cell.reserved > 0) {
                                <span class="text-[9px] font-mono text-muted bg-surface-high px-1 rounded" title="Reservadas">
                                  -{{ cell.reserved }}
                                </span>
                              }
                            </div>

                            <!-- Botones Micro-stepper en hover / focus -->
                            <div class="flex items-center justify-center gap-1 pt-1 opacity-80 group-hover/cell:opacity-100 transition-opacity">
                              <button
                                type="button"
                                (click)="inventoryService.adjustStock(cell.variantSku, -1)"
                                [disabled]="cell.stock === 0"
                                class="w-6 h-6 rounded-lg bg-surface border border-outline-sub text-muted hover:text-main hover:bg-surface-high grid place-items-center text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all">
                                -
                              </button>

                              <button
                                type="button"
                                (click)="inventoryService.openTransferModal(cell.variantSku, cell.size, row.color.name)"
                                class="h-6 px-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-all"
                                title="Transferir entre almacenes">
                                <span class="material-symbols-rounded text-xs">sync_alt</span>
                              </button>

                              <button
                                type="button"
                                (click)="inventoryService.adjustStock(cell.variantSku, 1)"
                                class="w-6 h-6 rounded-lg bg-surface border border-outline-sub text-muted hover:text-main hover:bg-surface-high grid place-items-center text-xs font-bold cursor-pointer transition-all">
                                +
                              </button>
                            </div>
                          </div>
                        </td>
                      }

                      <!-- Total Fila (Color) -->
                      <td class="p-3.5 text-right font-mono border-l border-outline-sub bg-surface/30">
                        <div class="text-sm font-black text-main">{{ row.totalStock }} <span class="text-xs font-normal text-muted">uds</span></div>
                        @if (row.totalReserved > 0) {
                          <div class="text-[10px] text-muted">{{ row.totalReserved }} reservadas</div>
                        }
                      </td>
                    </tr>
                  }
                </tbody>

                <!-- PIE: TOTALES GENERALES -->
                <tfoot>
                  <tr class="bg-surface/90 border-t-2 border-outline-sub font-mono">
                    <td class="p-3.5 text-xs font-bold text-main uppercase sticky left-0 bg-surface">
                      Total Global Tallas
                    </td>
                    @for (col of inventoryService.matrixColumns(); track col.size) {
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

          <!-- NOTA TÉCNICA DE RENDIMIENTO M3 -->
          <div class="p-3 rounded-2xl bg-surface-box/60 border border-outline-sub text-xs text-muted flex items-center justify-between">
            <span class="flex items-center gap-2">
              <span class="material-symbols-rounded text-primary text-base">bolt</span>
              Matriz reactiva con Angular 19 Signals computadas • Actualizaciones directas sin re-renderizado global
            </span>
            <span class="font-mono text-[11px]">
              Almacén objetivo de ajuste: <strong>{{ targetAdjustmentWarehouseName() }}</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- =====================================================================
           4. HISTORIAL DE TRANSFERENCIAS & AUDITORÍA (DRAWER DESPLEGABLE)
           ===================================================================== -->
      @if (inventoryService.isAuditHistoryOpen()) {
        <section class="rounded-3xl bg-surface-box border border-outline-sub shadow-sm p-5 space-y-4 animate-in fade-in duration-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-rounded text-primary text-2xl">local_shipping</span>
              <div>
                <h3 class="text-base font-bold text-main">Libro Mayor de Transferencias & Auditoría de Stock</h3>
                <p class="text-xs text-muted">Trazabilidad inmutable de movimientos inter-almacenes con operador responsable</p>
              </div>
            </div>
            <button
              type="button"
              (click)="inventoryService.toggleAuditHistory()"
              class="w-8 h-8 rounded-full bg-surface hover:bg-surface-high border border-outline-sub grid place-items-center text-muted hover:text-main cursor-pointer">
              <span class="material-symbols-rounded text-base">close</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-outline-sub text-muted font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-2.5 px-3">Código Movimiento</th>
                  <th class="py-2.5 px-3">Fecha / Hora</th>
                  <th class="py-2.5 px-3">Prenda & Variante</th>
                  <th class="py-2.5 px-3">Ruta de Transferencia</th>
                  <th class="py-2.5 px-3 text-center">Cantidad</th>
                  <th class="py-2.5 px-3">Operador</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-sub font-mono">
                @for (trf of inventoryService.stockTransfers(); track trf.id) {
                  <tr class="hover:bg-surface/50">
                    <td class="py-2.5 px-3 font-bold text-primary">{{ trf.id }}</td>
                    <td class="py-2.5 px-3 text-muted font-sans">{{ trf.date | date:'short' }}</td>
                    <td class="py-2.5 px-3 font-sans">
                      <span class="font-bold text-main">{{ trf.productName }}</span>
                      <span class="text-xs text-muted block">{{ trf.variantSku }} ({{ trf.colorName }} / {{ trf.size }})</span>
                    </td>
                    <td class="py-2.5 px-3 font-sans">
                      <span class="text-xs text-muted">{{ getWarehouseName(trf.fromWarehouseId) }}</span>
                      <span class="material-symbols-rounded text-xs mx-1 text-primary align-middle">arrow_forward</span>
                      <span class="text-xs font-semibold text-main">{{ getWarehouseName(trf.toWarehouseId) }}</span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                        +{{ trf.quantity }} uds
                      </span>
                    </td>
                    <td class="py-2.5 px-3 font-sans text-muted">{{ trf.operator }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

    </div>

    <!-- =========================================================================
         5. MODAL DE TRANSFERENCIA INTER-ALMACÉN (M3 DIALOG)
         ========================================================================= -->
    @if (inventoryService.isTransferModalOpen() && inventoryService.activeTransferVariant()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm m3-dialog-backdrop">
        <div 
          class="w-full max-w-lg rounded-3xl bg-surface-box border border-outline-sub shadow-2xl p-6 space-y-5 m3-dialog-surface">
          
          <!-- Encabezado del Diálogo -->
          <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary text-on-primary grid place-items-center">
                <span class="material-symbols-rounded text-xl">swap_horiz</span>
              </div>
              <div>
                <h3 class="text-lg font-black text-main">Transferencia Inter-Almacén</h3>
                <p class="text-xs text-muted">Mover unidades físicas entre centros logísticos</p>
              </div>
            </div>
            <button
              type="button"
              (click)="inventoryService.closeTransferModal()"
              class="w-8 h-8 rounded-full bg-surface hover:bg-surface-high border border-outline-sub grid place-items-center text-muted hover:text-main cursor-pointer">
              <span class="material-symbols-rounded text-base">close</span>
            </button>
          </div>

          <!-- Variante Seleccionada Card -->
          <div class="p-3.5 rounded-2xl bg-surface border border-outline-sub flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-surface-high overflow-hidden shrink-0 border border-outline-sub">
              <img
                [src]="inventoryService.selectedProduct().imageUrl"
                [alt]="inventoryService.selectedProduct().name"
                class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-main truncate">
                {{ inventoryService.activeTransferVariant()?.productName }}
              </div>
              <div class="text-[11px] font-mono text-muted flex items-center gap-2 mt-0.5">
                <span class="text-primary font-bold">{{ inventoryService.activeTransferVariant()?.variantSku }}</span>
                <span>•</span>
                <span>Color: {{ inventoryService.activeTransferVariant()?.colorName }}</span>
                <span>•</span>
                <span>Talla: {{ inventoryService.activeTransferVariant()?.size }}</span>
              </div>
            </div>
          </div>

          <!-- Rutas: Almacén Origen -> Almacén Destino -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-muted uppercase tracking-wider">Almacén Origen</label>
              <select
                [(ngModel)]="transferFromWh"
                class="w-full text-xs p-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                @for (wh of inventoryService.warehouses(); track wh.id) {
                  <option [value]="wh.id">{{ wh.name }}</option>
                }
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-muted uppercase tracking-wider">Almacén Destino</label>
              <select
                [(ngModel)]="transferToWh"
                class="w-full text-xs p-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                @for (wh of inventoryService.warehouses(); track wh.id) {
                  <option [value]="wh.id" [disabled]="wh.id === transferFromWh">{{ wh.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Cantidad a Transferir con Steppers y Presets -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <label class="font-bold text-muted uppercase tracking-wider">Cantidad de Unidades</label>
              <span class="text-muted">
                Disponible en origen: <strong class="text-main font-mono">{{ getSourceStock() }} uds</strong>
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="transferQty = Math.max(1, transferQty - 1)"
                class="w-10 h-10 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high grid place-items-center text-sm cursor-pointer">
                -
              </button>
              <input
                type="number"
                [(ngModel)]="transferQty"
                min="1"
                [max]="getSourceStock()"
                class="flex-1 text-center font-mono font-black text-lg py-2 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary" />
              <button
                type="button"
                (click)="transferQty = Math.min(getSourceStock(), transferQty + 1)"
                class="w-10 h-10 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high grid place-items-center text-sm cursor-pointer">
                +
              </button>
            </div>

            <!-- Quick Presets -->
            <div class="flex items-center gap-2 pt-1">
              <button
                type="button"
                (click)="transferQty = 5"
                class="px-2.5 py-1 rounded-lg text-xs bg-surface border border-outline-sub text-muted hover:text-main cursor-pointer">
                +5 uds
              </button>
              <button
                type="button"
                (click)="transferQty = 10"
                class="px-2.5 py-1 rounded-lg text-xs bg-surface border border-outline-sub text-muted hover:text-main cursor-pointer">
                +10 uds
              </button>
              <button
                type="button"
                (click)="transferQty = getSourceStock()"
                class="px-2.5 py-1 rounded-lg text-xs bg-surface border border-outline-sub text-muted hover:text-main cursor-pointer">
                Todo ({{ getSourceStock() }})
              </button>
            </div>
          </div>

          <!-- Operador Responsable -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-muted uppercase tracking-wider">Operador de Despacho</label>
            <input
              type="text"
              [(ngModel)]="transferOperator"
              placeholder="Nombre del encargado (ej. Juan Pérez)"
              class="w-full text-xs px-3 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <!-- Acciones del Modal -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline-sub">
            <button
              type="button"
              (click)="inventoryService.closeTransferModal()"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-surface-high cursor-pointer transition-all">
              Cancelar
            </button>
            <button
              type="button"
              (click)="submitTransfer()"
              [disabled]="transferQty <= 0 || transferQty > getSourceStock() || transferFromWh === transferToWh"
              class="btn-m3 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
              <span class="material-symbols-rounded text-base">local_shipping</span>
              Confirmar Despacho
            </button>
          </div>

        </div>
      </div>
    }

    <!-- =========================================================================
         7. PRODUCT STUDIO: ALTA DE MODELO & GENERADOR MATRICIAL (M3 EXPRESSIVE)
         ========================================================================= -->
    @if (inventoryService.isCreateModalOpen()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md m3-dialog-backdrop">
        <div 
          class="w-full max-w-5xl h-[90vh] max-h-[840px] flex flex-col rounded-[32px] bg-surface-box border border-outline-sub shadow-2xl overflow-hidden m3-dialog-surface">
          
          <!-- Encabezado del Product Studio -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-outline-sub shrink-0 bg-surface/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary text-on-primary grid place-items-center shadow-xs">
                <span class="material-symbols-rounded text-xl">auto_awesome</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-black text-main tracking-tight">Product Studio • Alta de Modelo</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    Generador 2D
                  </span>
                </div>
                <p class="text-xs text-muted">Configura el estilo base y proyecta en tiempo real la cuadrícula de variantes</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-outline-sub text-xs font-mono font-bold text-muted">
                <span>{{ selectedSizes.length }} Tallas</span>
                <span>×</span>
                <span>{{ selectedColors.length }} Colores</span>
                <span>=</span>
                <span class="text-primary">{{ selectedSizes.length * selectedColors.length }} Variantes</span>
              </div>

              <button
                type="button"
                (click)="inventoryService.closeCreateModal()"
                class="w-9 h-9 rounded-full bg-surface hover:bg-surface-high border border-outline-sub grid place-items-center text-muted hover:text-main cursor-pointer transition-all">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
          </div>

          <!-- CUERPO SPLIT (2 COLUMNAS): CONFIGURADOR (7 COLS) + LIVE MATRIX PREVIEW (5 COLS) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 min-h-0 flex-1 overflow-hidden">
            
            <!-- ===================================================================
                 COLUMNA IZQUIERDA (7 COLS): CONFIGURADOR DE PRENDA & ATRIBUTOS
                 =================================================================== -->
            <div class="lg:col-span-7 overflow-y-auto p-5 sm:p-6 space-y-5 m3-scrollbar">

              <!-- BLOQUE 1: IDENTIDAD MASTER -->
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">1</span>
                  <span>Identidad de Prenda</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-muted">Nombre del Modelo *</label>
                    <input
                      type="text"
                      [(ngModel)]="newProductName"
                      placeholder="ej. Sobrecamisa Pana Heavyweight"
                      class="w-full text-xs px-3 py-2.5 rounded-xl bg-surface border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>

                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-muted">SKU Base *</label>
                    <input
                      type="text"
                      [(ngModel)]="newProductSku"
                      placeholder="ej. OVS-700"
                      class="w-full text-xs px-3 py-2.5 font-mono uppercase rounded-xl bg-surface border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary font-bold" />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2.5 pt-1">
                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-muted">Categoría</label>
                    <select
                      [(ngModel)]="newProductCategory"
                      (ngModelChange)="onCategoryChange($event)"
                      class="w-full text-xs px-2.5 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium">
                      <option value="shirts">Camisería Fina</option>
                      <option value="polos">Polos Piqué</option>
                      <option value="pants">Pantalones Chinos</option>
                      <option value="jackets">Casacas & Outerwear</option>
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-muted">PVP Base ($ USD)</label>
                    <input
                      type="number"
                      [(ngModel)]="newProductPrice"
                      min="1"
                      step="0.5"
                      class="w-full text-xs px-2.5 py-2.5 font-mono font-bold rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>

                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-muted">Marca</label>
                    <input
                      type="text"
                      [(ngModel)]="newProductBrand"
                      class="w-full text-xs px-2.5 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                </div>

                <!-- Presets Rápidos de Lookbook -->
                <div class="space-y-1.5 pt-1">
                  <label class="text-[11px] font-bold text-muted">Foto de Lookbook (Selector Rápido)</label>
                  <div class="grid grid-cols-5 gap-2">
                    @for (preset of lookbookPresets; track preset.label) {
                      <button
                        type="button"
                        (click)="newProductImageUrl = preset.url"
                        [class.border-primary]="newProductImageUrl === preset.url"
                        [class.ring-2]="newProductImageUrl === preset.url"
                        [class.ring-primary]="newProductImageUrl === preset.url"
                        class="h-14 rounded-xl overflow-hidden border border-outline-sub cursor-pointer relative group transition-all">
                        <img [src]="preset.url" [alt]="preset.label" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span class="absolute inset-x-0 bottom-0 text-[8px] font-bold text-white bg-black/60 py-0.5 truncate px-1 text-center">
                          {{ preset.label }}
                        </span>
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- BLOQUE 2: EJE X - TALLAS CONTEXTUALES -->
              <div class="space-y-2.5 pt-4 border-t border-outline-sub">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">2</span>
                    <span>Eje X: Curva de Tallas ({{ selectedSizes.length }} activas)</span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      (click)="selectAllSizes()"
                      class="text-[11px] font-bold text-primary hover:underline cursor-pointer">
                      Todas
                    </button>
                    <span class="text-muted text-xs">•</span>
                    <button
                      type="button"
                      (click)="selectCoreCurve()"
                      class="text-[11px] font-bold text-muted hover:text-main cursor-pointer">
                      Curva Central
                    </button>
                  </div>
                </div>

                <!-- Chips de tallas contextuales -->
                <div class="flex flex-wrap gap-2">
                  @for (size of contextualSizes; track size) {
                    <button
                      type="button"
                      (click)="toggleSize(size)"
                      [class.bg-primary]="selectedSizes.includes(size)"
                      [class.text-on-primary]="selectedSizes.includes(size)"
                      [class.border-primary]="selectedSizes.includes(size)"
                      [class.shadow-xs]="selectedSizes.includes(size)"
                      [class.bg-surface]="!selectedSizes.includes(size)"
                      [class.text-muted]="!selectedSizes.includes(size)"
                      class="px-4 py-2 rounded-xl text-xs font-mono font-bold border border-outline-sub cursor-pointer transition-all hover:scale-105">
                      {{ size }}
                    </button>
                  }
                </div>
              </div>

              <!-- BLOQUE 3: EJE Y - PALETA TEXTIL -->
              <div class="space-y-2.5 pt-4 border-t border-outline-sub">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">3</span>
                    <span>Eje Y: Paleta Textil ({{ selectedColors.length }} colores activos)</span>
                  </div>
                </div>

                <!-- Swatches de tela refinados -->
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  @for (col of standardColors; track col.code) {
                    <button
                      type="button"
                      (click)="toggleColor(col)"
                      [class]="isColorSelected(col) ? 'p-2.5 rounded-xl border-2 border-primary bg-primary/10 text-left flex items-center gap-2.5 cursor-pointer shadow-xs group transition-all' : 'p-2.5 rounded-xl border border-outline-sub text-left flex items-center gap-2.5 cursor-pointer hover:border-primary/50 transition-all group'">
                      <div 
                        class="w-6 h-6 rounded-full shadow-2xs shrink-0 grid place-items-center transition-transform group-hover:scale-110"
                        [style.background-color]="col.hex"
                        [style.border]="col.border ? '1.5px solid ' + col.border : '1.5px solid rgba(0,0,0,0.12)'">
                        @if (isColorSelected(col)) {
                          <span 
                            [class.text-white]="col.hex !== '#FFFFFF' && col.hex !== '#F8FAFC'"
                            [class.text-black]="col.hex === '#FFFFFF' || col.hex === '#F8FAFC'"
                            class="material-symbols-rounded text-sm font-black">
                            check
                          </span>
                        }
                      </div>
                      <div class="min-w-0">
                        <div class="text-xs font-bold text-main leading-tight truncate">{{ col.name }}</div>
                        <div class="text-[10px] font-mono text-muted">{{ col.code }}</div>
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- BLOQUE 4: RECEPCIÓN INICIAL -->
              <div class="space-y-3 pt-4 border-t border-outline-sub">
                <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <span class="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px]">4</span>
                  <span>Recepción del Primer Lote</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-muted">Almacén de Entrada</label>
                    <select
                      [(ngModel)]="targetWarehouseId"
                      class="w-full text-xs px-3 py-2.5 rounded-xl bg-surface border border-outline-sub text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium">
                      @for (wh of inventoryService.warehouses(); track wh.id) {
                        <option [value]="wh.id">{{ wh.name }}</option>
                      }
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[11px] font-bold text-muted">Stock por Variante (uds)</label>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="initialStockPerCell = Math.max(0, initialStockPerCell - 5)"
                        class="w-9 h-9 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high grid place-items-center text-xs cursor-pointer">
                        -5
                      </button>
                      <input
                        type="number"
                        [(ngModel)]="initialStockPerCell"
                        min="0"
                        class="flex-1 text-center font-mono font-black text-sm py-2 rounded-xl bg-surface border border-outline-sub text-main" />
                      <button
                        type="button"
                        (click)="initialStockPerCell = initialStockPerCell + 5"
                        class="w-9 h-9 rounded-xl bg-surface border border-outline-sub text-main font-bold hover:bg-surface-high grid place-items-center text-xs cursor-pointer">
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- ===================================================================
                 COLUMNA DERECHA (5 COLS): LIVE STUDIO PREVIEW & MATRIX CANVAS
                 =================================================================== -->
            <div class="lg:col-span-5 bg-surface/80 p-5 sm:p-6 border-t lg:border-t-0 lg:border-l border-outline-sub flex flex-col justify-between overflow-y-auto m3-scrollbar space-y-4">
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-muted uppercase tracking-wider">Live Matrix Canvas</span>
                  <span class="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Vista en Tiempo Real
                  </span>
                </div>

                <!-- LOOKBOOK HERO CARD -->
                <div class="p-3.5 rounded-2xl bg-surface-box border border-outline-sub shadow-xs flex items-center gap-3.5">
                  <div class="w-20 h-20 rounded-xl overflow-hidden bg-surface-high border border-outline-sub shrink-0">
                    <img [src]="newProductImageUrl" [alt]="newProductName" class="w-full h-full object-cover" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {{ newProductSku || 'SKU-000' }}
                      </span>
                      <span class="text-[10px] text-muted truncate">{{ newProductCategoryLabel }}</span>
                    </div>
                    <h4 class="text-sm font-black text-main truncate mt-0.5">
                      {{ newProductName || 'Nombre de la Prenda' }}
                    </h4>
                    <div class="text-xs font-mono font-bold text-main mt-1">
                      \${{ (newProductPrice || 0).toFixed(2) }} <span class="text-[10px] font-normal text-muted">USD</span>
                    </div>
                  </div>
                </div>

                <!-- MATRIZ 2D PROYECTADA EN VIVO -->
                <div class="rounded-2xl bg-surface-box border border-outline-sub overflow-hidden shadow-2xs">
                  <div class="p-2.5 bg-surface border-b border-outline-sub flex items-center justify-between text-[11px] font-bold text-muted">
                    <span>Estructura 2D de la Prenda</span>
                    <span class="font-mono text-primary">{{ selectedSizes.length }} × {{ selectedColors.length }} = {{ selectedSizes.length * selectedColors.length }} celdas</span>
                  </div>

                  <div class="overflow-x-auto max-h-56">
                    <table class="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr class="border-b border-outline-sub bg-surface/50 text-[10px] text-muted font-bold font-mono">
                          <th class="p-2">Color</th>
                          @for (sz of selectedSizes; track sz) {
                            <th class="p-2 text-center">{{ sz }}</th>
                          }
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-outline-sub font-mono">
                        @for (col of selectedColors; track col.code) {
                          <tr class="hover:bg-surface/30">
                            <td class="p-2">
                              <div class="flex items-center gap-1.5">
                                <div 
                                  class="w-3.5 h-3.5 rounded-full shrink-0" 
                                  [style.background-color]="col.hex"
                                  [style.border]="col.border ? '1px solid ' + col.border : '1px solid rgba(0,0,0,0.1)'">
                                </div>
                                <span class="text-[10px] font-bold text-main font-sans truncate max-w-[80px]">{{ col.name }}</span>
                              </div>
                            </td>
                            @for (sz of selectedSizes; track sz) {
                              <td class="p-1.5 text-center">
                                <span class="px-2 py-0.5 rounded-lg bg-surface border border-outline-sub text-main font-bold block text-[10px]">
                                  {{ initialStockPerCell }}
                                </span>
                              </td>
                            }
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- IMPACTO FINANCIERO Y UNIDADES DEL LOTE -->
              <div class="p-4 rounded-2xl bg-surface-box border border-outline-sub space-y-2">
                <div class="text-[11px] font-bold text-muted uppercase tracking-wider">Balance Inicial del Lote</div>
                <div class="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div class="text-[10px] text-muted">Unidades a Ingresar</div>
                    <div class="text-lg font-black text-main font-mono">
                      {{ previewBatchUnits }} <span class="text-xs font-normal text-muted">uds</span>
                    </div>
                  </div>
                  <div>
                    <div class="text-[10px] text-muted">Valorización Lote</div>
                    <div class="text-lg font-black text-primary font-mono">
                      \${{ previewBatchValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- FOOTER DE ACCIÓN CON FEEDBACK -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-outline-sub bg-surface shrink-0">
            <div class="text-xs text-muted flex items-center gap-1.5">
              <span class="material-symbols-rounded text-primary text-base">check_circle</span>
              <span>Recepción inmediata de <strong>{{ previewBatchUnits }} unidades</strong> en <strong>{{ getWarehouseName(targetWarehouseId) }}</strong></span>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="inventoryService.closeCreateModal()"
                class="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-surface-high cursor-pointer transition-all">
                Cancelar
              </button>
              <button
                type="button"
                (click)="submitCreateProduct()"
                [disabled]="!newProductName.trim() || !newProductSku.trim() || selectedSizes.length === 0 || selectedColors.length === 0"
                class="btn-m3 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
                <span class="material-symbols-rounded text-base">rocket_launch</span>
                <span>Generar y Abrir en Matriz</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    }

    <!-- =========================================================================
         8. TOAST FEEDBACK NOTIFICATION
         ========================================================================= -->
    @if (inventoryService.toastMessage()) {
      <div 
        class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-surface-box border border-primary text-main shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
        <span class="material-symbols-rounded text-primary text-xl">check_circle</span>
        <span class="text-xs font-semibold">{{ inventoryService.toastMessage() }}</span>
      </div>
    }
  `
})
export class InventoryComponent {
  readonly inventoryService = inject(InventoryService);
  protected readonly Math = Math;

  readonly categories = [
    { id: 'ALL', label: 'Todos' },
    { id: 'shirts', label: 'Camisas' },
    { id: 'polos', label: 'Polos' },
    { id: 'pants', label: 'Pantalones' },
    { id: 'jackets', label: 'Casacas' }
  ];

  // Transfer modal fields
  transferFromWh = 'WH-CENTRAL';
  transferToWh = 'WH-MIRAFLORES';
  transferQty = 5;
  transferOperator = 'Carlos M.';

  // Product Studio / Cartesian Generator fields
  readonly sizePresets = SIZE_PRESETS;
  readonly standardColors = STANDARD_COLORS;

  readonly lookbookPresets = [
    { label: 'Camisa', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85' },
    { label: 'Polo', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=85' },
    { label: 'Pantalón', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=85' },
    { label: 'Casaca', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=85' },
    { label: 'Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=85' }
  ];

  readonly categorySizeMap: Record<string, string[]> = {
    shirts: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    polos: ['S', 'M', 'L', 'XL', 'XXL'],
    pants: ['28', '30', '32', '34', '36', '38'],
    jackets: ['S', 'M', 'L', 'XL', 'XXL']
  };

  newProductName = '';
  newProductSku = '';
  newProductCategory = 'shirts';
  newProductCategoryLabel = 'Camisería Fina';
  newProductBrand = 'Sartorial Lima';
  newProductSeason = 'Temporada 2026';
  newProductPrice = 69.0;
  newProductImageUrl = this.lookbookPresets[0].url;
  selectedSizes: string[] = ['S', 'M', 'L', 'XL'];
  selectedColors: ProductColor[] = [STANDARD_COLORS[0], STANDARD_COLORS[1], STANDARD_COLORS[2]];
  initialStockPerCell = 15;
  targetWarehouseId = 'WH-CENTRAL';

  get contextualSizes(): string[] {
    return this.categorySizeMap[this.newProductCategory] || ['S', 'M', 'L', 'XL'];
  }

  get previewBatchUnits(): number {
    return this.selectedSizes.length * this.selectedColors.length * this.initialStockPerCell;
  }

  get previewBatchValuation(): number {
    return this.previewBatchUnits * (Number(this.newProductPrice) || 0);
  }

  readonly totalUnitsInMatrix = computed<number>(() => {
    return this.inventoryService.matrixRows().reduce((acc, row) => acc + row.totalStock, 0);
  });

  readonly targetAdjustmentWarehouseName = computed<string>(() => {
    const whId = this.inventoryService.selectedWarehouseId();
    if (whId === 'ALL') {
      return 'Almacén Central Lurín (por defecto en vista consolidada)';
    }
    const wh = this.inventoryService.warehouses().find(w => w.id === whId);
    return wh ? wh.name : whId;
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.inventoryService.isCreateModalOpen()) {
      this.inventoryService.closeCreateModal();
    }
    if (this.inventoryService.isTransferModalOpen()) {
      this.inventoryService.closeTransferModal();
    }
  }

  openCreateModal(): void {
    this.resetCreateForm();
    this.inventoryService.openCreateModal();
  }

  onCategoryChange(cat: string): void {
    const map: Record<string, string> = {
      shirts: 'Camisería Fina',
      polos: 'Esenciales Urbanos',
      pants: 'Sastrería Casual',
      jackets: 'Outerwear Premium'
    };
    this.newProductCategoryLabel = map[cat] || 'Moda Textil';

    // Contextually switch sizes and default photo based on category
    const available = this.categorySizeMap[cat] || ['S', 'M', 'L', 'XL'];
    this.selectedSizes = [...available];

    if (cat === 'shirts') this.newProductImageUrl = this.lookbookPresets[0].url;
    else if (cat === 'polos') this.newProductImageUrl = this.lookbookPresets[1].url;
    else if (cat === 'pants') this.newProductImageUrl = this.lookbookPresets[2].url;
    else if (cat === 'jackets') this.newProductImageUrl = this.lookbookPresets[3].url;
  }

  selectAllSizes(): void {
    this.selectedSizes = [...this.contextualSizes];
  }

  selectCoreCurve(): void {
    if (this.newProductCategory === 'pants') {
      this.selectedSizes = ['30', '32', '34'];
    } else {
      this.selectedSizes = ['S', 'M', 'L'];
    }
  }

  toggleSize(size: string): void {
    if (this.selectedSizes.includes(size)) {
      if (this.selectedSizes.length > 1) {
        this.selectedSizes = this.selectedSizes.filter(s => s !== size);
      }
    } else {
      this.selectedSizes = [...this.selectedSizes, size];
    }
  }

  toggleColor(color: ProductColor): void {
    const exists = this.selectedColors.some(c => c.code === color.code);
    if (exists) {
      if (this.selectedColors.length > 1) {
        this.selectedColors = this.selectedColors.filter(c => c.code !== color.code);
      }
    } else {
      this.selectedColors = [...this.selectedColors, color];
    }
  }

  isColorSelected(color: ProductColor): boolean {
    return this.selectedColors.some(c => c.code === color.code);
  }

  resetCreateForm(): void {
    this.newProductName = '';
    this.newProductSku = '';
    this.newProductCategory = 'shirts';
    this.newProductCategoryLabel = 'Camisería Fina';
    this.newProductBrand = 'Sartorial Lima';
    this.newProductSeason = 'Temporada 2026';
    this.newProductPrice = 69.0;
    this.newProductImageUrl = this.lookbookPresets[0].url;
    this.selectedSizes = ['S', 'M', 'L', 'XL'];
    this.selectedColors = [STANDARD_COLORS[0], STANDARD_COLORS[1], STANDARD_COLORS[2]];
    this.initialStockPerCell = 15;
    this.targetWarehouseId = 'WH-CENTRAL';
  }

  submitCreateProduct(): void {
    this.inventoryService.createMasterProduct({
      name: this.newProductName,
      sku: this.newProductSku,
      category: this.newProductCategory,
      categoryLabel: this.newProductCategoryLabel,
      brand: this.newProductBrand,
      season: this.newProductSeason,
      basePrice: this.newProductPrice,
      imageUrl: this.newProductImageUrl,
      sizes: this.selectedSizes,
      colors: this.selectedColors,
      initialStockPerCell: this.initialStockPerCell,
      targetWarehouseId: this.targetWarehouseId
    });
  }

  getWarehouseName(whId: string): string {
    const wh = this.inventoryService.warehouses().find(w => w.id === whId);
    return wh ? wh.name : whId;
  }

  getSourceStock(): number {
    const active = this.inventoryService.activeTransferVariant();
    if (!active) return 0;
    const prod = this.inventoryService.selectedProduct();
    const cell = prod.cells.find(
      c => c.variantSku === active.variantSku && c.warehouseId === this.transferFromWh
    );
    return cell ? cell.stock : 0;
  }

  submitTransfer(): void {
    const active = this.inventoryService.activeTransferVariant();
    if (!active) return;

    this.inventoryService.executeTransfer(
      this.transferFromWh,
      this.transferToWh,
      active.variantSku,
      this.transferQty,
      this.transferOperator
    );
  }
}
