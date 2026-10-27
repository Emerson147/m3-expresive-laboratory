import {
  Component,
  inject,
  signal,
  computed,
  HostListener,
  OnInit,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../../core/kanban/kanban.service';
import { ThemeService } from '../../core/theme/theme.service';
import { KanbanOrder, KanbanFilter, OrderStage, OrderPriority, OrderCategory } from '../../core/kanban/kanban.models';
import { M3LinearProgressComponent } from '../../shared/components/progress/linear-progress.component';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    M3LinearProgressComponent,
    M3ButtonComponent,
    M3ChipComponent,
    M3TextFieldComponent
  ],
  host: {
    class: 'flex-1 h-full flex flex-col min-h-0 overflow-hidden select-none'
  },
  template: `
    <div class="flex-1 h-full flex flex-col min-h-0 p-3 sm:p-4 gap-3 bg-surface text-main overflow-hidden">

      <!-- =====================================================================
           1. HEADER: KANBAN OPERATIVO / KDS & CONTROLES DE COCINA
           ===================================================================== -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-outline-sub shrink-0">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-m3-md bg-primary text-on-primary grid place-items-center font-bold text-sm shadow-xs">
              <span class="material-symbols-rounded text-lg">view_kanban</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Kanban Operativo & KDS</h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
              En Vivo
            </span>
          </div>
          <p class="text-xs text-muted">
            Kitchen & Dispatch Display System · Control de flujo y auditoría de tiempos en tiempo real.
          </p>
        </div>

        <div class="flex items-center flex-wrap gap-2.5">
          <!-- Kitchen Real-time Clock -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-low border border-outline-sub text-xs font-mono font-bold text-main shadow-2xs">
            <span class="material-symbols-rounded text-sm text-primary">schedule</span>
            <span>{{ currentClock() }}</span>
          </div>

          <!-- Buzzer Alert Toggle -->
          <button 
            type="button" 
            (click)="toggleBuzzer()"
            class="btn-m3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-low border border-outline-sub text-xs text-muted hover:text-main cursor-pointer"
            [title]="buzzerEnabled() ? 'Timbre de comanda activo' : 'Timbre silenciado'">
            <span class="material-symbols-rounded text-base" [class.text-amber-500]="buzzerEnabled()" [class.text-muted]="!buzzerEnabled()">
              {{ buzzerEnabled() ? 'notifications_active' : 'notifications_off' }}
            </span>
            <span class="hidden sm:inline font-medium">{{ buzzerEnabled() ? 'Buzzer ON' : 'Silencio' }}</span>
          </button>

          <!-- Quick Order Button -->
          <m3-button 
            variant="filled" 
            size="sm" 
            icon="add" 
            (action)="openCreateOrderModal()">
            Nueva Comanda
          </m3-button>
        </div>
      </header>

      <!-- =====================================================================
           2. BENTO KPI STRIP (MÉTRICAS OPERACIONALES ZEN)
           ===================================================================== -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
        <!-- KPI 1: Active Orders -->
        <div class="p-3 rounded-2xl bg-surface-low border border-outline-sub transition-colors">
          <div class="flex items-center justify-between text-muted mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Comandas Activas</span>
            <span class="material-symbols-rounded text-base">receipt_long</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold font-mono text-main">{{ kanbanService.kpis().totalActive }}</span>
            <span class="text-[11px] text-muted">en proceso</span>
          </div>
        </div>

        <!-- KPI 2: Avg Prep Time -->
        <div class="p-3 rounded-2xl bg-surface-low border border-outline-sub transition-colors">
          <div class="flex items-center justify-between text-muted mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Tiempo Promedio</span>
            <span class="material-symbols-rounded text-base">timer</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold font-mono text-main">{{ kanbanService.kpis().avgPrepTimeMin }}m</span>
            <span class="text-[11px] text-muted">meta &le; 15m</span>
          </div>
        </div>

        <!-- KPI 3: SLA Alerts -->
        <div 
          class="p-3 rounded-2xl bg-surface-low border transition-colors"
          [class.border-rose-500/40]="kanbanService.kpis().slaBreachCount > 0"
          [class.border-outline-sub]="kanbanService.kpis().slaBreachCount === 0">
          <div class="flex items-center justify-between text-muted mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider" [class.text-rose-500]="kanbanService.kpis().slaBreachCount > 0">Alertas SLA</span>
            <span class="material-symbols-rounded text-base" [class.text-rose-500]="kanbanService.kpis().slaBreachCount > 0">warning</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold font-mono" [class.text-rose-500]="kanbanService.kpis().slaBreachCount > 0" [class.text-main]="kanbanService.kpis().slaBreachCount === 0">
              {{ kanbanService.kpis().slaBreachCount }}
            </span>
            <span class="text-[11px]" [class.text-rose-500]="kanbanService.kpis().slaBreachCount > 0" [class.text-muted]="kanbanService.kpis().slaBreachCount === 0">
              {{ kanbanService.kpis().slaBreachCount > 0 ? 'atención requerida' : 'al día' }}
            </span>
          </div>
        </div>

        <!-- KPI 4: Throughput -->
        <div class="p-3 rounded-2xl bg-surface-low border border-outline-sub transition-colors">
          <div class="flex items-center justify-between text-muted mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Despacho / Hora</span>
            <span class="material-symbols-rounded text-base">speed</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold font-mono text-main">{{ kanbanService.kpis().throughputPerHour }}</span>
            <span class="text-[11px] text-muted">tickets/h</span>
          </div>
        </div>
      </section>

      <!-- =====================================================================
           3. FILTER CHIPS BAR
           ===================================================================== -->
      <section class="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <m3-chip 
          [selected]="kanbanService.activeFilter() === 'all'" 
          (action)="kanbanService.setFilter('all')">
          Todos ({{ kanbanService.orders().length }})
        </m3-chip>

        <m3-chip 
          icon="local_fire_department" 
          [selected]="kanbanService.activeFilter() === 'urgent'" 
          (action)="kanbanService.setFilter('urgent')">
          Urgentes / Riesgo SLA
        </m3-chip>

        <m3-chip 
          icon="skillet" 
          [selected]="kanbanService.activeFilter() === 'kitchen'" 
          (action)="kanbanService.setFilter('kitchen')">
          Cocina Caliente
        </m3-chip>

        <m3-chip 
          icon="ac_unit" 
          [selected]="kanbanService.activeFilter() === 'cold_chain'" 
          (action)="kanbanService.setFilter('cold_chain')">
          Cadena de Frío
        </m3-chip>

        <m3-chip 
          icon="delivery_dining" 
          [selected]="kanbanService.activeFilter() === 'express'" 
          (action)="kanbanService.setFilter('express')">
          Delivery Express
        </m3-chip>
      </section>

      <!-- =====================================================================
           4. KANBAN INTERACTIVE BOARD (ESTILO ZEN M3 EXPRESSIVE)
           ===================================================================== -->
      <main class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 h-full overflow-hidden">
        @for (column of kanbanService.columns; track column.id) {
          <div 
            class="flex flex-col h-full max-h-full rounded-2xl bg-surface-low border border-outline-sub overflow-hidden transition-all duration-200"
            [class.border-primary]="kanbanService.dragOverStage() === column.id"
            [class.border-dashed]="kanbanService.dragOverStage() === column.id"
            [class.border-2]="kanbanService.dragOverStage() === column.id"
            [class.bg-primary-box/20]="kanbanService.dragOverStage() === column.id"
            [class.shadow-lg]="kanbanService.dragOverStage() === column.id"
            [class.scale-[0.99]]="kanbanService.dragOverStage() === column.id"
            (dragover)="kanbanService.onDragOver(column.id, $event)"
            (dragleave)="kanbanService.onDragLeave(column.id)"
            (drop)="kanbanService.onDrop(column.id, $event)">

            <!-- Column Header (PINNED AT TOP) -->
            <div class="shrink-0 p-3 border-b border-outline-sub flex items-center justify-between bg-surface-container/30">
              <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-rounded text-base text-muted shrink-0">{{ column.icon }}</span>
                <div class="min-w-0">
                  <h3 class="text-xs font-bold tracking-wider text-main uppercase truncate">{{ column.title }}</h3>
                </div>
              </div>

              <!-- Column WIP Capacity Badge -->
              <span 
                class="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 transition-colors"
                [ngClass]="kanbanService.getOrdersByStage(column.id).length > column.wipLimit ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' : 'bg-surface-high text-muted border border-outline-sub/60'">
                {{ kanbanService.getOrdersByStage(column.id).length }} / {{ column.wipLimit }}
              </span>
            </div>

            <!-- Column Body: Dropzone & Order Cards (SCROLLS INTERNALLY) -->
            <div class="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5 m3-scrollbar">
              @if (kanbanService.getOrdersByStage(column.id).length === 0) {
                <!-- Empty State Dropzone -->
                <div class="flex-1 min-h-[160px] flex flex-col items-center justify-center p-6 border border-dashed border-outline-sub/60 rounded-xl text-center text-muted">
                  <span class="material-symbols-rounded text-3xl mb-1 opacity-40">{{ column.icon }}</span>
                  <p class="text-xs font-medium">Sin comandas activas</p>
                  <p class="text-[10px] opacity-70 mt-0.5">Arrastrá un pedido aquí</p>
                </div>
              } @else {
                <!-- Draggable Order Cards -->
                @for (order of kanbanService.getOrdersByStage(column.id); track order.id) {
                  <article 
                    [draggable]="true"
                    (dragstart)="kanbanService.onDragStart(order.id, $event)"
                    (dragend)="kanbanService.onDragEnd()"
                    [style.view-transition-name]="kanbanService.activeTransitionOrderId() === order.id ? 'kanban-card-active' : null"
                    [class.opacity-40]="kanbanService.draggedOrderId() === order.id"
                    [class.scale-[0.96]]="kanbanService.draggedOrderId() === order.id"
                    [class.rotate-[1.5deg]]="kanbanService.draggedOrderId() === order.id"
                    [class.shadow-xl]="kanbanService.draggedOrderId() === order.id"
                    [class.ring-2]="order.elapsedMinutes >= order.prepTimeTargetMin && order.stage !== 'ready'"
                    [class.ring-rose-500/60]="order.elapsedMinutes >= order.prepTimeTargetMin && order.stage !== 'ready'"
                    [class.bg-rose-500/[0.04]]="order.elapsedMinutes >= order.prepTimeTargetMin && order.stage !== 'ready'"
                    class="p-3.5 rounded-2xl bg-surface-high shadow-xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:bg-surface-high/90 relative group shrink-0 active:scale-[0.98]">
                    
                    <!-- Card Top Row: Ticket #, Channel & Priority Badge -->
                    <div class="flex items-center justify-between gap-2 mb-2.5">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="font-mono font-bold text-sm text-main shrink-0">{{ order.ticketNumber }}</span>
                        <span class="text-xs px-2.5 py-0.5 rounded-full bg-surface-low/80 text-main font-semibold flex items-center gap-1 min-w-0 border border-outline-sub/30">
                          <span class="material-symbols-rounded text-[13px] shrink-0 text-muted">{{ getChannelIcon(order.channel) }}</span>
                          <span class="truncate">{{ order.tableOrClient }}</span>
                        </span>
                      </div>

                      <!-- Priority Indicator (Zen: Only colored if high/urgent) -->
                      <span 
                        class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                        [ngClass]="getPriorityBadgeClass(order.priority)">
                        {{ order.priority }}
                      </span>
                    </div>

                    <!-- SLA Progress Bar & Elapsed Time -->
                    @if (order.stage === 'ready') {
                      <!-- Completed state: No progress bar needed, clean status badge -->
                      <div class="mb-2 flex items-center justify-between text-xs">
                        <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                          <span class="material-symbols-rounded text-sm">check_circle</span>
                          Listo ({{ order.elapsedMinutes }}m)
                        </span>
                      </div>
                    } @else {
                      <!-- Active preparation: Countdown & Linear Progress -->
                      <div class="mb-2.5 space-y-1">
                        <div class="flex items-center justify-between text-xs text-muted">
                          <span class="font-mono text-[11px]">{{ order.elapsedMinutes }}m / {{ order.prepTimeTargetMin }}m</span>

                          @if (order.elapsedMinutes >= order.prepTimeTargetMin) {
                            <span class="text-[10px] font-bold text-rose-500 font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/25">
                              +{{ order.elapsedMinutes - order.prepTimeTargetMin }}m SLA
                            </span>
                          } @else {
                            <span class="text-[10px] text-muted/70 font-mono">
                              {{ Math.max(0, order.prepTimeTargetMin - order.elapsedMinutes) }}m rest.
                            </span>
                          }
                        </div>

                        <m3-linear-progress 
                          [value]="Math.min(100, (order.elapsedMinutes / order.prepTimeTargetMin) * 100)" 
                          [color]="getProgressColor(order)" />
                      </div>
                    }

                    <!-- Order Items Summary (Kitchen Focus - No Prices) -->
                    <div class="space-y-1 mb-2.5">
                      @for (item of order.items; track item.id) {
                        <div class="flex items-baseline gap-2 text-xs">
                          <span class="font-mono font-bold text-main/90 shrink-0 w-5">{{ item.quantity }}x</span>
                          <span class="text-main font-medium truncate">{{ item.name }}</span>
                        </div>
                      }
                      @if (order.specialInstructions) {
                        @if (order.specialInstructions.toLowerCase().includes('alérg') || order.specialInstructions.toLowerCase().includes('alerg')) {
                          <div class="mt-1.5 flex items-start gap-1.5 text-[11px] text-rose-500 bg-rose-500/10 border-l-2 border-rose-500 pl-2 pr-1.5 py-1 rounded-r">
                            <span class="material-symbols-rounded text-sm shrink-0 mt-0.5">warning</span>
                            <span class="font-semibold leading-tight truncate">{{ order.specialInstructions }}</span>
                          </div>
                        } @else {
                          <div class="mt-1 flex items-center gap-1 text-[11px] text-muted italic">
                            <span class="material-symbols-rounded text-[13px] shrink-0 opacity-70">note</span>
                            <span class="truncate">{{ order.specialInstructions }}</span>
                          </div>
                        }
                      }
                    </div>

                    <!-- Card Footer: Items Count & Unified Action Capsule -->
                    <div class="pt-2 border-t border-outline-sub/30 flex items-center justify-between text-xs">
                      <span class="text-[11px] text-muted font-medium font-mono">
                        {{ order.items.length }} {{ order.items.length === 1 ? 'ítem' : 'ítems' }}
                      </span>

                      <!-- Unified Action Capsule -->
                      <div class="flex items-center bg-surface-low border border-outline-sub/40 rounded-full p-0.5 shadow-2xs">
                        <!-- 1-Click Regress Button (if not in queue) -->
                        @if (column.id !== 'queue') {
                          <button 
                            type="button"
                            (click)="kanbanService.regressOrder(order.id); $event.stopPropagation()"
                            class="w-6 h-6 rounded-full text-muted hover:text-main hover:bg-surface-high grid place-items-center transition-colors cursor-pointer"
                            title="Regresar a etapa previa">
                            <span class="material-symbols-rounded text-sm">arrow_back</span>
                          </button>
                        }

                        <!-- Inspect Button -->
                        <button 
                          type="button"
                          (click)="kanbanService.openOrderInspection(order); $event.stopPropagation()"
                          class="px-2 h-6 rounded-full text-[11px] font-medium text-muted hover:text-main hover:bg-surface-high flex items-center gap-1 transition-colors cursor-pointer"
                          title="Inspeccionar ticket y detalles">
                          <span class="material-symbols-rounded text-[13px]">receipt_long</span>
                          <span>Ticket</span>
                        </button>

                        <!-- 1-Click Advance Button (if not in ready) -->
                        @if (column.id !== 'ready') {
                          <button 
                            type="button"
                            (click)="kanbanService.advanceOrder(order.id); $event.stopPropagation()"
                            class="w-6 h-6 rounded-full bg-primary text-on-primary hover:opacity-90 grid place-items-center shadow-xs transition-opacity cursor-pointer"
                            title="Avanzar a siguiente etapa">
                            <span class="material-symbols-rounded text-sm">arrow_forward</span>
                          </button>
                        }
                      </div>
                    </div>
                  </article>
                }
              }
            </div>
          </div>
        }
      </main>

      <!-- =====================================================================
           5. MODAL: DETALLE E INSPECCIÓN DE TICKET (ESTILO M3 EXPRESSIVE)
           ===================================================================== -->
      @if (kanbanService.isInspectionOpen() && kanbanService.selectedOrder(); as order) {
        <div 
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 m3-dialog-backdrop"
          (click)="kanbanService.closeOrderInspection()">
          
          <div 
            class="w-full max-w-xl bg-surface-box border border-outline-sub rounded-m3-xl p-6 shadow-2xl overflow-hidden m3-dialog-surface text-main"
            (click)="$event.stopPropagation()">

            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-primary-box text-on-primary-box grid place-items-center">
                  <span class="material-symbols-rounded text-lg">receipt_long</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-lg font-bold tracking-tight">Comanda {{ order.ticketNumber }}</h2>
                    <span class="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" [ngClass]="getPriorityBadgeClass(order.priority)">
                      {{ order.priority }}
                    </span>
                  </div>
                  <p class="text-xs text-muted">{{ order.tableOrClient }} · Ingreso {{ order.createdAt }}</p>
                </div>
              </div>

              <button 
                type="button"
                (click)="kanbanService.closeOrderInspection()" 
                class="btn-m3 p-2 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer">
                <span class="material-symbols-rounded text-xl">close</span>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="space-y-4 py-4 max-h-[60vh] overflow-y-auto m3-scrollbar">
              <!-- Stage Progress Pipeline -->
              <div class="p-3 rounded-2xl bg-surface-low border border-outline-sub space-y-2">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-muted">Pipeline Operativo</span>
                <div class="grid grid-cols-4 gap-2 text-center text-xs">
                  <div class="p-2 rounded-xl transition-colors" [class.bg-primary]="order.stage === 'queue'" [class.text-on-primary]="order.stage === 'queue'" [class.bg-surface]="order.stage !== 'queue'">
                    <span class="material-symbols-rounded block text-sm">inbox</span>
                    <span class="text-[10px] font-medium">Entrada</span>
                  </div>
                  <div class="p-2 rounded-xl transition-colors" [class.bg-amber-500]="order.stage === 'prep'" [class.text-white]="order.stage === 'prep'" [class.bg-surface]="order.stage !== 'prep'">
                    <span class="material-symbols-rounded block text-sm">skillet</span>
                    <span class="text-[10px] font-medium">Cocina</span>
                  </div>
                  <div class="p-2 rounded-xl transition-colors" [class.bg-purple-500]="order.stage === 'qa'" [class.text-white]="order.stage === 'qa'" [class.bg-surface]="order.stage !== 'qa'">
                    <span class="material-symbols-rounded block text-sm">fact_check</span>
                    <span class="text-[10px] font-medium">Calidad</span>
                  </div>
                  <div class="p-2 rounded-xl transition-colors" [class.bg-emerald-500]="order.stage === 'ready'" [class.text-white]="order.stage === 'ready'" [class.bg-surface]="order.stage !== 'ready'">
                    <span class="material-symbols-rounded block text-sm">check_circle</span>
                    <span class="text-[10px] font-medium">Despacho</span>
                  </div>
                </div>
              </div>

              <!-- Operational Details: Staff & SLA -->
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="p-3 rounded-xl bg-surface-low border border-outline-sub">
                  <span class="text-muted block text-[11px]">Responsable Asignado</span>
                  <span class="font-semibold text-main">{{ order.assignedStaff || 'Sin asignar' }}</span>
                </div>
                <div class="p-3 rounded-xl bg-surface-low border border-outline-sub">
                  <span class="text-muted block text-[11px]">Tiempo Transcurrido vs SLA</span>
                  <span class="font-mono font-bold" [class.text-rose-500]="order.elapsedMinutes >= order.prepTimeTargetMin">
                    {{ order.elapsedMinutes }} min / Meta: {{ order.prepTimeTargetMin }} min
                  </span>
                </div>
              </div>

              <!-- Special Instructions Callout -->
              @if (order.specialInstructions) {
                <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-2 text-xs">
                  <span class="material-symbols-rounded text-lg shrink-0">warning</span>
                  <div>
                    <span class="font-bold block">Instrucción Especial:</span>
                    <span>{{ order.specialInstructions }}</span>
                  </div>
                </div>
              }

              <!-- Items Breakdown Table -->
              <div class="space-y-2">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-muted">Detalle de Platos y Bebidas</span>
                <div class="border border-outline-sub rounded-2xl overflow-hidden divide-y divide-outline-sub">
                  @for (item of order.items; track item.id) {
                    <div class="p-3 flex items-center justify-between text-xs bg-surface-low/50">
                      <div>
                        <div class="font-semibold text-main">
                          <span class="font-mono text-primary font-bold mr-1">{{ item.quantity }}x</span>
                          {{ item.name }}
                        </div>
                        @if (item.notes) {
                          <span class="text-[11px] text-muted italic flex items-center gap-1 mt-0.5">
                            <span class="material-symbols-rounded text-xs">edit_note</span>
                            {{ item.notes }}
                          </span>
                        }
                      </div>
                      <div class="text-right font-mono">
                        <span class="font-semibold">S/ {{ (item.price * item.quantity).toFixed(2) }}</span>
                        <span class="block text-[10px] text-muted">(S/ {{ item.price.toFixed(2) }} c/u)</span>
                      </div>
                    </div>
                  }
                </div>

                <!-- Total Amount Line -->
                <div class="flex items-baseline justify-between p-3 rounded-xl bg-surface-high font-mono">
                  <span class="font-bold text-xs uppercase tracking-wider text-muted">Total de Comanda:</span>
                  <span class="text-lg font-black text-primary">S/ {{ order.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Modal Footer Controls -->
            <div class="flex items-center justify-between pt-5 border-t border-outline-sub mt-2">
              <m3-button 
                variant="text" 
                (action)="kanbanService.closeOrderInspection()">
                Cerrar
              </m3-button>

              <div class="flex items-center gap-2">
                @if (order.stage !== 'queue') {
                  <m3-button 
                    variant="outlined" 
                    icon="arrow_back" 
                    (action)="kanbanService.regressOrder(order.id); kanbanService.closeOrderInspection()">
                    Regresar
                  </m3-button>
                }
                @if (order.stage !== 'ready') {
                  <m3-button 
                    variant="filled" 
                    icon="check" 
                    (action)="kanbanService.advanceOrder(order.id); kanbanService.closeOrderInspection()">
                    Avanzar Etapa
                  </m3-button>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- =====================================================================
           6. MODAL: CREAR COMANDA RÁPIDA (CON CONTRASTE Y ESTILO M3 AUTÉNTICO)
           ===================================================================== -->
      @if (isCreateModalOpen()) {
        <div 
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 m3-dialog-backdrop"
          (click)="closeCreateModal()">
          
          <div 
            class="w-full max-w-md bg-surface-box border border-outline-sub rounded-m3-xl p-6 shadow-2xl overflow-hidden m3-dialog-surface text-main"
            (click)="$event.stopPropagation()">

            <!-- Dialog Header -->
            <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-primary-box text-on-primary-box grid place-items-center">
                  <span class="material-symbols-rounded text-lg">receipt_long</span>
                </div>
                <h2 class="text-lg font-bold">Nueva Comanda</h2>
              </div>
              <button 
                type="button"
                (click)="closeCreateModal()" 
                class="btn-m3 p-2 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer">
                <span class="material-symbols-rounded text-xl">close</span>
              </button>
            </div>

            <!-- Form Body with authentic M3 Expressive Components -->
            <div class="space-y-4 pt-4">
              <!-- Mesa o Canal (M3 Text Field) -->
              <m3-text-field 
                variant="filled"
                label="Mesa o Canal de Pedido"
                placeholder="Ej. Mesa 7 · Barra Lounge"
                icon="table_restaurant"
                [clearable]="true"
                [maxlength]="50"
                [(ngModel)]="newOrderTable"
                supportingText="Identificador del comensal o canal de entrega" />

              <!-- Prioridad y Categoría en 2 columnas con m3-select-field -->
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">Prioridad</label>
                  <select [(ngModel)]="newOrderPriority" class="m3-select-field">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">Categoría</label>
                  <select [(ngModel)]="newOrderCategory" class="m3-select-field">
                    <option value="kitchen">Cocina Caliente</option>
                    <option value="cold_chain">Cadena de Frío</option>
                    <option value="express">Delivery Express</option>
                    <option value="dispatch">Despacho</option>
                  </select>
                </div>
              </div>

              <!-- Instrucciones Especiales (M3 Text Field Multiline) -->
              <m3-text-field 
                variant="outlined"
                label="Instrucciones para Cocina"
                placeholder="Especificaciones de cocción, alérgenos o empaque..."
                icon="description"
                [multiline]="true"
                [rows]="2"
                [maxlength]="200"
                [(ngModel)]="newOrderInstructions"
                supportingText="Notas críticas visibles para cocineros y despachadores" />
            </div>

            <!-- Dialog Footer -->
            <div class="flex items-center justify-end gap-2.5 pt-5 border-t border-outline-sub mt-4">
              <m3-button 
                variant="text" 
                (action)="closeCreateModal()">
                Cancelar
              </m3-button>
              <m3-button 
                variant="filled" 
                icon="check" 
                (action)="submitNewOrder()">
                Crear Comanda
              </m3-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class KanbanComponent implements OnInit, OnDestroy {
  readonly kanbanService = inject(KanbanService);
  readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly Math = Math;

  // Kitchen Live Clock & Buzzer State
  readonly currentClock = signal<string>('22:38:00');
  readonly buzzerEnabled = this.kanbanService.buzzerEnabled;
  private clockIntervalId?: any;

  // Create Order Modal State
  readonly isCreateModalOpen = signal<boolean>(false);
  newOrderTable = 'Mesa 7 · Barra Lounge';
  newOrderPriority: OrderPriority = 'high';
  newOrderCategory: OrderCategory = 'kitchen';
  newOrderInstructions = 'Preparar en Wok 1 con picante moderado.';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateClock();
      this.clockIntervalId = setInterval(() => this.updateClock(), 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
    }
  }

  private updateClock(): void {
    this.currentClock.set(
      new Date().toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );
  }

  toggleBuzzer(): void {
    this.kanbanService.toggleBuzzer();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.kanbanService.isInspectionOpen()) {
      this.kanbanService.closeOrderInspection();
    }
    if (this.isCreateModalOpen()) {
      this.closeCreateModal();
    }
  }

  getChannelIcon(channel: 'dine_in' | 'takeout' | 'delivery'): string {
    switch (channel) {
      case 'dine_in': return 'table_restaurant';
      case 'takeout': return 'takeout_dining';
      case 'delivery': return 'delivery_dining';
    }
  }

  getPriorityBadgeClass(priority: OrderPriority): string {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/25';
      case 'high':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/25';
      case 'medium':
        return 'bg-surface-high text-muted border border-outline-sub/60';
      case 'low':
        return 'bg-surface-high text-muted/70 border border-outline-sub/40';
    }
  }

  getProgressColor(order: KanbanOrder): 'primary' | 'secondary' | 'error' {
    if (order.elapsedMinutes >= order.prepTimeTargetMin) {
      return 'error';
    }
    if (order.elapsedMinutes >= order.prepTimeTargetMin * 0.75) {
      return 'secondary';
    }
    return 'primary';
  }

  openCreateOrderModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitNewOrder(): void {
    this.kanbanService.createOrder({
      tableOrClient: this.newOrderTable,
      priority: this.newOrderPriority,
      category: this.newOrderCategory,
      specialInstructions: this.newOrderInstructions,
      prepTimeTargetMin: 15,
      totalAmount: 64.00,
      items: [
        { id: `i-${Date.now()}`, name: 'Ceviche Mixto con Chicharrón', quantity: 1, category: this.newOrderCategory, price: 48.00 },
        { id: `i-${Date.now()}-2`, name: 'Maracuyá Sour', quantity: 1, category: 'kitchen', price: 16.00 }
      ]
    });
    this.closeCreateModal();
  }
}
