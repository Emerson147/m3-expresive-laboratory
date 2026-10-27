import {
  Component,
  inject,
  signal,
  computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TelemetryService } from '../../core/telemetry/telemetry.service';
import { ThemeService } from '../../core/theme/theme.service';
import { Vehicle, TelemetryFilter } from '../../core/telemetry/telemetry.models';
import { M3LinearProgressComponent } from '../../shared/components/progress/linear-progress.component';
import { M3CircularProgressComponent } from '../../shared/components/progress/circular-progress.component';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';

@Component({
  selector: 'app-telemetry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    M3LinearProgressComponent,
    M3CircularProgressComponent,
    M3ButtonComponent,
    M3ChipComponent
  ],
  host: {
    class: 'flex-1 h-full flex flex-col min-h-0 overflow-hidden select-none'
  },
  template: `
    <div class="flex-1 h-full overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-5 bg-surface text-main">

      <!-- =====================================================================
           1. HEADER: MISSION CONTROL & SEED HUE CONTROLLER
           ===================================================================== -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline-sub shrink-0">
        <div class="space-y-1">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"></span>
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-primary">AETHER FLEET • MISSION CONTROL</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-medium hidden sm:inline">M3 Expressive v3.2</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-main flex items-center gap-2">
            Panel de Monitoreo de Despachos y Flotas
          </h1>
          <p class="text-xs sm:text-sm text-muted">
            Corredor Panamericana & Hub Callao • Actualización síncrona cada 1.5s
          </p>
        </div>

        <!-- Controls: Dynamic Seed Hue, Dark Mode, Action Button -->
        <div class="flex items-center flex-wrap gap-3">
          <!-- Seed Hue Slider -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-box border border-outline-sub text-xs">
            <span class="material-symbols-rounded text-sm text-primary">palette</span>
            <span class="font-mono text-muted hidden sm:inline">Seed Hue:</span>
            <input 
              type="range" 
              min="0" 
              max="360" 
              [ngModel]="themeService.currentHue()" 
              (ngModelChange)="onHueChange($event)"
              class="w-20 sm:w-28 accent-primary h-1.5 bg-surface-high rounded-full cursor-pointer" />
            <span class="font-mono font-bold text-main w-8 text-right">{{ themeService.currentHue() }}°</span>
          </div>

          <!-- Theme Mode Toggle Button -->
          <button
            type="button"
            (click)="themeService.toggleThemeMode($event)"
            title="Alternar Modo Oscuro / Claro"
            class="w-9 h-9 rounded-full bg-surface-box hover:bg-surface-high border border-outline-sub grid place-items-center text-main transition-colors cursor-pointer">
            <span class="material-symbols-rounded text-base">
              {{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>

          <!-- Primary Commit Action Button with Container Transform -->
          <m3-button 
            id="trigger-assign-route"
            variant="filled" 
            size="md" 
            icon="add_road"
            [invisible]="telemetryService.isAssignModalOpen() && telemetryService.activeAssignTrigger() === 'assign-route'"
            [viewTransitionName]="!telemetryService.isAssignModalOpen() && telemetryService.activeAssignTrigger() === 'assign-route' ? 'dialog-transform' : null"
            (action)="onAssignRouteClick()">
            Asignar Ruta
          </m3-button>
        </div>
      </header>

      <!-- =====================================================================
           2. RIBBON DE 4 KPIS MODULARES (ANALYTICAL MISSION CONTROL ARCHETYPE)
           ===================================================================== -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        
        <!-- KPI 1: SLA Cumplimiento -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub flex flex-col justify-between shadow-xs hover:border-outline transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted tracking-wide uppercase">Cumplimiento SLA</span>
            <span class="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center">
              <span class="material-symbols-rounded text-base">verified</span>
            </span>
          </div>
          <div class="mt-2.5">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-main">{{ telemetryService.kpiSummary().slaRate }}%</span>
              <span class="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-sans">+2.4%</span>
            </div>
            <div class="mt-2">
              <m3-linear-progress 
                [value]="telemetryService.kpiSummary().slaRate" 
                [wavy]="true" 
                size="md" 
                color="primary" 
                ariaLabel="Ratio de cumplimiento SLA" />
            </div>
            <div class="mt-1 flex justify-between text-[11px] text-muted font-mono">
              <span>Onda 40dp • Gap 4dp</span>
              <span>Meta: 92%</span>
            </div>
          </div>
        </div>

        <!-- KPI 2: Flota en Tránsito con Indicador Circular Festoneado (Scalloped Wavy) -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub flex flex-col justify-between shadow-xs hover:border-outline transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted tracking-wide uppercase">Flota en Tránsito</span>
            <span class="w-7 h-7 rounded-full bg-primary-box text-on-primary-box grid place-items-center">
              <span class="material-symbols-rounded text-base">local_shipping</span>
            </span>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-main">{{ telemetryService.kpiSummary().activeFleetCount }}</span>
                <span class="text-sm font-semibold text-muted">/ {{ telemetryService.kpiSummary().totalFleetCount }} u.</span>
              </div>
              <p class="text-xs text-muted mt-0.5">6 en muelle de carga</p>
            </div>
            <!-- M3 Wavy Circular Progress -->
            <div class="shrink-0">
              <m3-circular-progress 
                [value]="87.5" 
                [wavy]="true" 
                size="md" 
                color="primary" 
                ariaLabel="Capacidad de flota en ruta" />
            </div>
          </div>
        </div>

        <!-- KPI 3: Cadena de Frío Sensor -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub flex flex-col justify-between shadow-xs hover:border-outline transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted tracking-wide uppercase">Cadena de Frío</span>
            <span class="w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-500 grid place-items-center">
              <span class="material-symbols-rounded text-base">ac_unit</span>
            </span>
          </div>
          <div class="mt-2.5">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-main">{{ telemetryService.kpiSummary().coldChainHealth }}%</span>
              <span class="text-xs font-mono font-bold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded-full">-18.4°C</span>
            </div>
            <div class="mt-2">
              <m3-linear-progress 
                [value]="telemetryService.kpiSummary().coldChainHealth" 
                [wavy]="true" 
                size="md" 
                color="primary" 
                ariaLabel="Estado de cadena de frío" />
            </div>
            <div class="mt-1 flex justify-between text-[11px] text-muted font-mono">
              <span>Atenuación p &gt; 0.98</span>
              <span>A(p) = 3dp</span>
            </div>
          </div>
        </div>

        <!-- KPI 4: Riesgo de Demora -->
        <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub flex flex-col justify-between shadow-xs hover:border-outline transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted tracking-wide uppercase">Riesgo de Demora</span>
            <span class="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 grid place-items-center">
              <span class="material-symbols-rounded text-base">warning</span>
            </span>
          </div>
          <div class="mt-2.5">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-500">{{ telemetryService.kpiSummary().delayedCount }}</span>
              <span class="text-xs font-semibold text-amber-500">Críticos</span>
            </div>
            <div class="mt-2">
              <m3-linear-progress 
                [value]="(telemetryService.kpiSummary().delayedCount / telemetryService.kpiSummary().activeFleetCount) * 100" 
                [wavy]="false" 
                size="sm" 
                color="error" 
                ariaLabel="Riesgo de demora" />
            </div>
            <div class="mt-1 flex justify-between text-[11px] text-muted font-mono">
              <span>Latencia CAN: 16ms</span>
              <span>Vel. media: {{ telemetryService.kpiSummary().averageSpeedKmh }} km/h</span>
            </div>
          </div>
        </div>
      </section>

      <!-- =====================================================================
           3. FILTROS & CONTROL DE TELEMETRÍA VIVA (CHIP STRIP)
           ===================================================================== -->
      <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-box border border-outline-sub">
        <div class="flex items-center flex-wrap gap-2">
          <span class="text-xs font-bold text-muted uppercase tracking-wider mr-1">Filtrar:</span>
          
          <m3-chip 
            type="filter" 
            [selected]="telemetryService.currentFilter() === 'all'" 
            count="6"
            (action)="telemetryService.setFilter('all')">
            Todas las Unidades
          </m3-chip>

          <m3-chip 
            type="filter" 
            [selected]="telemetryService.currentFilter() === 'in_transit'" 
            count="4"
            (action)="telemetryService.setFilter('in_transit')">
            En Tránsito
          </m3-chip>

          <m3-chip 
            type="filter" 
            [selected]="telemetryService.currentFilter() === 'risk_sla'" 
            count="2"
            (action)="telemetryService.setFilter('risk_sla')">
            Riesgo SLA
          </m3-chip>

          <m3-chip 
            type="filter" 
            [selected]="telemetryService.currentFilter() === 'cold_chain'" 
            count="3"
            (action)="telemetryService.setFilter('cold_chain')">
            Cadena de Frío
          </m3-chip>
        </div>

        <!-- Live Ticker Toggle Switch -->
        <div class="flex items-center gap-2.5 px-3 py-1 rounded-full bg-surface border border-outline-sub">
          <span class="text-xs font-medium text-muted">Telemetría Viva (60Hz)</span>
          <button 
            type="button" 
            role="switch"
            [attr.aria-checked]="telemetryService.isLiveTelemetryActive()"
            (click)="telemetryService.toggleLiveTelemetry()"
            class="w-10 h-6 rounded-full transition-colors relative cursor-pointer"
            [class]="telemetryService.isLiveTelemetryActive() ? 'bg-primary' : 'bg-surface-high border border-outline-sub'">
            <span 
              class="w-4 h-4 rounded-full bg-on-primary absolute top-1 transition-transform"
              [class]="telemetryService.isLiveTelemetryActive() ? 'right-1' : 'left-1'">
            </span>
          </button>
        </div>
      </section>

      <!-- =====================================================================
           4. WORKSTAGE BENTO: TELEMETRÍA DETALLADA (IZQUIERDA) + CORREDOR & FEED (DERECHA)
           ===================================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        <!-- ===================================================================
             4.1 COLUMNA IZQUIERDA: CALIBRADOR DE ONDA + LISTA DE VEHÍCULOS (8 COLS)
             =================================================================== -->
        <div class="lg:col-span-8 space-y-4">

          <!-- CARD PRINCIPAL: TELEMETRÍA DEL VEHÍCULO SELECCIONADO (CALIBRADOR DE ONDA M3) -->
          <div class="p-5 rounded-3xl bg-surface-box border border-outline-sub shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-sub">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-primary">waves</span>
                  <h2 class="text-base font-bold text-main">
                    Telemetría de Progreso del Despacho Seleccionado
                  </h2>
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                    {{ telemetryService.selectedVehicle().id }}
                  </span>
                </div>
                <p class="text-xs text-muted">
                  Física M3 Expressive: &lambda; = 40dp • A = 3dp • Pista disjunta con gap 4dp • Stop Dot embebido en w - r
                </p>
              </div>

              <!-- Simular Progreso con slider interactivo -->
              <div class="flex items-center gap-2 self-start sm:self-auto bg-surface px-3 py-1.5 rounded-full border border-outline-sub text-xs">
                <span class="text-muted font-mono">Simular p:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  [ngModel]="telemetryService.selectedVehicle().progressPercent"
                  (ngModelChange)="onProgressManualChange($event)"
                  class="w-24 sm:w-32 accent-primary h-1.5 bg-surface-high rounded-full cursor-pointer" />
                <span class="font-mono font-bold w-10 text-right">{{ telemetryService.selectedVehicle().progressPercent }}%</span>
              </div>
            </div>

            <!-- Gran Barra Wavy M3 Expressive (Prominent 8px / Size LG) -->
            <div class="py-2">
              <m3-linear-progress 
                [value]="telemetryService.selectedVehicle().progressPercent" 
                [wavy]="true" 
                size="lg" 
                color="primary" 
                ariaLabel="Progreso de entrega del despacho" />
            </div>

            <!-- Telemetry Metrics Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-mono">
              <div class="p-2.5 rounded-2xl bg-surface border border-outline-sub">
                <span class="text-muted block text-[11px]">Amplitud A(p):</span>
                <span class="font-bold text-primary">3.00dp</span>
              </div>
              <div class="p-2.5 rounded-2xl bg-surface border border-outline-sub">
                <span class="text-muted block text-[11px]">Longitud &lambda;:</span>
                <span class="font-bold text-primary">40.0dp</span>
              </div>
              <div class="p-2.5 rounded-2xl bg-surface border border-outline-sub">
                <span class="text-muted block text-[11px]">Disjoint Gap:</span>
                <span class="font-bold text-primary">4.0dp</span>
              </div>
              <div class="p-2.5 rounded-2xl bg-surface border border-outline-sub">
                <span class="text-muted block text-[11px]">Stop Dot cx:</span>
                <span class="font-bold text-primary">w - r</span>
              </div>
            </div>
          </div>

          <!-- GRID DE TARJETAS DE VEHÍCULOS DE LA FLOTA (FLIP REORDERING) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (v of telemetryService.filteredVehicles(); track v.id) {
              <div 
                (click)="telemetryService.selectVehicle(v.id)"
                [style.view-transition-name]="!telemetryService.activeInspectTrigger() && !telemetryService.activeAssignTrigger() ? ('vehicle-card-' + v.id) : null"
                class="p-4 rounded-3xl bg-surface-box border transition-all cursor-pointer relative hover:shadow-md"
                [class]="telemetryService.selectedVehicleId() === v.id ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-outline-sub hover:border-outline'">
                
                <!-- Vehicle Header -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-2xl bg-primary-box text-on-primary-box grid place-items-center">
                      <span class="material-symbols-rounded text-lg">local_shipping</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono font-black text-sm text-main">{{ v.id }}</span>
                        <span class="text-[11px] font-mono text-muted">({{ v.plate }})</span>
                      </div>
                      <p class="text-xs text-muted truncate max-w-[160px]">{{ v.origin }} &rarr; {{ v.destination }}</p>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <span 
                    [class]="getStatusBadgeClass(v.status)"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
                    {{ getStatusLabel(v.status) }}
                  </span>
                </div>

                <!-- Metrics Strip -->
                <div class="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-outline-sub text-[11px]">
                  <div>
                    <span class="text-muted block">Operador</span>
                    <span class="font-semibold text-main truncate block">{{ v.driver }}</span>
                  </div>
                  <div>
                    <span class="text-muted block">Velocidad</span>
                    <span class="font-mono font-bold text-main">{{ v.speedKmh }} km/h</span>
                  </div>
                  <div>
                    <span class="text-muted block">Térmico</span>
                    <span class="font-mono font-bold" [class]="v.cargoTempC < 0 ? 'text-cyan-500' : 'text-main'">
                      {{ v.cargoTempC }}°C
                    </span>
                  </div>
                </div>

                <!-- Linear Progress with Status Color -->
                <div class="mt-3.5 space-y-1">
                  <div class="flex justify-between text-[11px] font-mono">
                    <span class="text-muted">Progreso de Entrega</span>
                    <span class="font-bold text-main">{{ v.progressPercent }}%</span>
                  </div>
                  <m3-linear-progress 
                    [value]="v.progressPercent" 
                    [wavy]="true" 
                    size="md" 
                    [color]="getProgressColorByStatus(v.status)" 
                    [ariaLabel]="'Progreso de ' + v.id" />
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-between mt-3 pt-2">
                  <span class="text-[11px] font-mono text-muted">ETA: {{ v.etaMinutes }}m</span>
                  <button 
                    type="button"
                    [id]="'inspect-trigger-' + v.id"
                    (click)="onInspectClick($event, v)"
                    [class.invisible]="telemetryService.isInspectModalOpen() && telemetryService.activeInspectTrigger() === ('inspect-' + v.id)"
                    [style.view-transition-name]="!telemetryService.isInspectModalOpen() && telemetryService.activeInspectTrigger() === ('inspect-' + v.id) ? 'dialog-transform' : null"
                    class="btn-m3 text-xs font-semibold px-3 py-1 rounded-full bg-surface-high hover:bg-primary-box hover:text-on-primary-box transition-colors flex items-center gap-1 cursor-pointer">
                    <span class="material-symbols-rounded text-sm">visibility</span>
                    <span>Inspeccionar</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ===================================================================
             4.2 COLUMNA DERECHA: CORREDOR VECTORIAL & FEED DE ALERTAS (4 COLS)
             =================================================================== -->
        <div class="lg:col-span-4 space-y-4">
          
          <!-- CORREDOR GEOSPACIAL VECTORIAL (SVG MAP) -->
          <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-sm space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-outline-sub">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-primary text-lg">route</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-main">Telemetría del Corredor Activo</h3>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">LIVE GPS</span>
            </div>

            <p class="text-[11px] text-muted">
              Vector geoespacial • Callao &rarr; Lurín &rarr; Chilca
            </p>

            <!-- Interactive SVG Vector Corridor -->
            <div class="relative w-full h-44 bg-surface rounded-2xl border border-outline-sub p-2 overflow-hidden">
              <svg class="w-full h-full" viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Grid Guide Lines -->
                <line x1="0" y1="35" x2="320" y2="35" stroke="currentColor" stroke-opacity="0.05" stroke-dasharray="3 3" />
                <line x1="0" y1="70" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.05" stroke-dasharray="3 3" />
                <line x1="0" y1="105" x2="320" y2="105" stroke="currentColor" stroke-opacity="0.05" stroke-dasharray="3 3" />

                <!-- The Highway Corridor Spline -->
                <path 
                  d="M 20 100 C 70 120, 100 30, 160 50 C 220 70, 260 110, 300 40" 
                  stroke="var(--m3-progress-container, var(--md-sys-color-primary-container))" 
                  stroke-width="5" 
                  stroke-linecap="round" />

                <!-- Active Traversed Segment -->
                <path 
                  d="M 20 100 C 70 120, 100 30, 160 50" 
                  stroke="var(--m3-progress-active, var(--md-sys-color-primary))" 
                  stroke-width="5" 
                  stroke-linecap="round" />

                <!-- Waypoint 1: Hub Callao -->
                <circle cx="20" cy="100" r="5" fill="var(--md-sys-color-primary)" />
                <text x="20" y="122" font-size="8" font-family="monospace" fill="currentColor" opacity="0.6">HUB CALLAO</text>

                <!-- Waypoint 2: TRK-912 -->
                <circle cx="95" cy="58" r="4.5" fill="var(--md-sys-color-error)" />
                <text x="75" y="50" font-size="8" font-family="monospace" fill="currentColor" opacity="0.7">TRK-912</text>

                <!-- Waypoint 3: TRK-884 (Selected & Pulsing) -->
                <circle cx="160" cy="50" r="9" fill="var(--md-sys-color-primary)" opacity="0.25" class="animate-ping" />
                <circle cx="160" cy="50" r="6" fill="var(--md-sys-color-primary)" />
                <text x="135" y="36" font-size="8" font-weight="bold" font-family="monospace" fill="var(--md-sys-color-primary)">TRK-884 (ACTIVO)</text>

                <!-- Waypoint 4: TRK-108 -->
                <circle cx="240" cy="98" r="4.5" fill="var(--md-sys-color-tertiary)" />
                <text x="225" y="116" font-size="8" font-family="monospace" fill="currentColor" opacity="0.7">TRK-108</text>

                <!-- Waypoint 5: Planta Sur -->
                <circle cx="300" cy="40" r="5" fill="var(--md-sys-color-outline)" />
                <text x="270" y="30" font-size="8" font-family="monospace" fill="currentColor" opacity="0.6">PLANTA SUR</text>
              </svg>
            </div>

            <div class="flex justify-between items-center text-[11px] font-mono text-muted">
              <span>Vel. Media Corredor: 64.8 km/h</span>
              <button 
                type="button"
                id="trigger-corridor-inspect"
                (click)="onInspectCorridorClick()"
                [class.invisible]="telemetryService.isInspectModalOpen() && telemetryService.activeInspectTrigger() === 'corridor-inspect'"
                [style.view-transition-name]="!telemetryService.isInspectModalOpen() && telemetryService.activeInspectTrigger() === 'corridor-inspect' ? 'dialog-transform' : null"
                class="text-primary font-bold hover:underline cursor-pointer">
                Haz clic para telemetría
              </button>
            </div>
          </div>

          <!-- FEED DE TELEMETRÍA Y ALERTAS EN VIVO (LIVE STREAM) -->
          <div class="p-4 rounded-3xl bg-surface-box border border-outline-sub shadow-sm space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-outline-sub">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-primary text-lg">broadcast_on_home</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-main">Feed de Telemetría y Alertas</h3>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">EN VIVO</span>
            </div>

            <div class="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              @for (evt of telemetryService.liveEvents(); track evt.id) {
                <div class="p-2.5 rounded-2xl bg-surface border border-outline-sub text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-mono font-bold text-primary">{{ evt.vehicleId }}</span>
                    <span class="text-[10px] font-mono text-muted">{{ evt.timestamp }}</span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">{{ evt.message }}</p>
                </div>
              }
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- =========================================================================
         5. MODAL DE INSPECCIÓN CAN-BUS (CONTAINER TRANSFORM & STAGE RECESS DEPTH)
         ========================================================================= -->
    @if (telemetryService.isInspectModalOpen() && telemetryService.inspectedVehicle()) {
      <!-- Backdrop: sibling of dialog to prevent stacking context rasterization -->
      <div 
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        (click)="telemetryService.closeInspectModal()"></div>

      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          id="telemetry-inspect-dialog"
          style="view-transition-name: dialog-transform;"
          [class.m3-container-enter]="!themeService.hasViewTransitions()"
          class="w-full max-w-xl rounded-3xl bg-surface-box border border-outline-sub shadow-2xl p-6 space-y-5 pointer-events-auto overflow-hidden"
          (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="flex items-start justify-between pb-3 border-b border-outline-sub">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-primary-box text-on-primary-box grid place-items-center text-2xl">
                <span class="material-symbols-rounded">sensors</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-black text-main">Diagnóstico CAN-BUS</h3>
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                    {{ telemetryService.inspectedVehicle()!.id }}
                  </span>
                </div>
                <p class="text-xs text-muted">
                  Placa: {{ telemetryService.inspectedVehicle()!.plate }} • Operador: {{ telemetryService.inspectedVehicle()!.driver }}
                </p>
              </div>
            </div>

            <button 
              type="button"
              (click)="telemetryService.closeInspectModal()"
              class="w-8 h-8 rounded-full bg-surface-high hover:bg-surface-highest grid place-items-center text-muted hover:text-main cursor-pointer">
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>

          <!-- Live Progress Wave of this vehicle -->
          <div class="p-3.5 rounded-2xl bg-surface border border-outline-sub space-y-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-muted">Progreso de Despacho</span>
              <span class="font-bold text-main">{{ telemetryService.inspectedVehicle()!.progressPercent }}%</span>
            </div>
            <m3-linear-progress 
              [value]="telemetryService.inspectedVehicle()!.progressPercent" 
              [wavy]="true" 
              size="md" 
              color="primary" />
          </div>

          <!-- CAN-BUS Telemetry Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div class="p-3 rounded-2xl bg-surface border border-outline-sub space-y-1">
              <span class="text-muted text-[10px] block">Régimen Motor</span>
              <span class="font-bold text-main text-base">{{ telemetryService.inspectedVehicle()!.telemetry.engineRpm }} RPM</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface border border-outline-sub space-y-1">
              <span class="text-muted text-[10px] block">Nivel Combustible</span>
              <span class="font-bold text-main text-base">{{ telemetryService.inspectedVehicle()!.telemetry.fuelLevelPercent }}%</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface border border-outline-sub space-y-1">
              <span class="text-muted text-[10px] block">Voltaje Batería</span>
              <span class="font-bold text-main text-base">{{ telemetryService.inspectedVehicle()!.telemetry.batteryVolts }} V</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface border border-outline-sub space-y-1">
              <span class="text-muted text-[10px] block">Presión Neumáticos</span>
              <span class="font-bold text-main text-base">{{ telemetryService.inspectedVehicle()!.telemetry.tirePressurePsi }} PSI</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface border border-outline-sub space-y-1">
              <span class="text-muted text-[10px] block">Temp. Cabina</span>
              <span class="font-bold text-main text-base">{{ telemetryService.inspectedVehicle()!.telemetry.cabinTempC }}°C</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface border border-outline-sub space-y-1">
              <span class="text-muted text-[10px] block">Temp. Carga</span>
              <span class="font-bold text-base" [class]="telemetryService.inspectedVehicle()!.telemetry.cargoTempC < 0 ? 'text-cyan-500' : 'text-main'">
                {{ telemetryService.inspectedVehicle()!.telemetry.cargoTempC }}°C
              </span>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-outline-sub">
            <m3-button variant="text" (action)="telemetryService.closeInspectModal()">
              Cerrar
            </m3-button>
            <m3-button variant="filled" icon="download" (action)="telemetryService.closeInspectModal()">
              Exportar Telemetría
            </m3-button>
          </div>
        </div>
      </div>
    }

    <!-- =========================================================================
         6. MODAL DE ASIGNAR RUTA (CONTAINER TRANSFORM & STAGE RECESS DEPTH)
         ========================================================================= -->
    @if (telemetryService.isAssignModalOpen()) {
      <!-- Backdrop as sibling -->
      <div 
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        (click)="telemetryService.closeAssignModal()"></div>

      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          id="telemetry-assign-dialog"
          style="view-transition-name: dialog-transform;"
          [class.m3-container-enter]="!themeService.hasViewTransitions()"
          class="w-full max-w-lg rounded-3xl bg-surface-box border border-outline-sub shadow-2xl p-6 space-y-5 pointer-events-auto overflow-hidden"
          (click)="$event.stopPropagation()">

          <!-- Modal Header -->
          <div class="flex items-start justify-between pb-3 border-b border-outline-sub">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-primary-box text-on-primary-box grid place-items-center text-2xl">
                <span class="material-symbols-rounded">add_road</span>
              </div>
              <div>
                <h3 class="text-lg font-black text-main">Asignar Nueva Ruta</h3>
                <p class="text-xs text-muted">Configuración de corredor logístico y despacho</p>
              </div>
            </div>

            <button 
              type="button"
              (click)="telemetryService.closeAssignModal()"
              class="w-8 h-8 rounded-full bg-surface-high hover:bg-surface-highest grid place-items-center text-muted hover:text-main cursor-pointer">
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>

          <!-- Form Inputs -->
          <div class="space-y-4 text-xs">
            <!-- Vehicle Select -->
            <div class="space-y-1.5">
              <label class="font-bold text-main block">Unidad de Flota</label>
              <select 
                [(ngModel)]="assignFormVehicleId" 
                class="w-full p-2.5 rounded-2xl bg-surface border border-outline-sub text-main font-mono text-xs focus:border-primary focus:outline-none">
                @for (v of telemetryService.vehicles(); track v.id) {
                  <option [value]="v.id">{{ v.id }} • {{ v.plate }} ({{ v.driver }}) - {{ v.destination }}</option>
                }
              </select>
            </div>

            <!-- Corridor Select -->
            <div class="space-y-1.5">
              <label class="font-bold text-main block">Corredor Logístico</label>
              <select 
                [(ngModel)]="assignFormCorridor" 
                class="w-full p-2.5 rounded-2xl bg-surface border border-outline-sub text-main text-xs focus:border-primary focus:outline-none">
                <option value="Corredor Panamericana Sur">Corredor Panamericana Sur (Callao → Lurín → Chilca)</option>
                <option value="Corredor Carretera Central">Corredor Carretera Central (Planta Huachipa → Puerto Callao)</option>
                <option value="Corredor Industrial Norte">Corredor Industrial Norte (Terminal Ventanilla → Ancón)</option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Destination text -->
              <div class="space-y-1.5">
                <label class="font-bold text-main block">Destino Final</label>
                <input 
                  type="text" 
                  [(ngModel)]="assignFormDestination" 
                  placeholder="Ej. CD Lurín Km 40"
                  class="w-full p-2.5 rounded-2xl bg-surface border border-outline-sub text-main text-xs focus:border-primary focus:outline-none" />
              </div>

              <!-- Operator name -->
              <div class="space-y-1.5">
                <label class="font-bold text-main block">Conductor / Operador</label>
                <input 
                  type="text" 
                  [(ngModel)]="assignFormDriver" 
                  placeholder="Nombre del conductor"
                  class="w-full p-2.5 rounded-2xl bg-surface border border-outline-sub text-main text-xs focus:border-primary focus:outline-none" />
              </div>
            </div>

            <!-- Cargo Type / Protocol -->
            <div class="space-y-1.5">
              <label class="font-bold text-main block">Protocolo de Carga</label>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  (click)="assignFormCargoType = 'cold_chain'"
                  [class]="assignFormCargoType === 'cold_chain' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold' : 'bg-surface border-outline-sub text-muted'"
                  class="p-2.5 rounded-2xl border text-center transition-colors cursor-pointer">
                  <span class="material-symbols-rounded text-base block mb-0.5">ac_unit</span>
                  <span class="text-[11px] block">Frío (-18°C)</span>
                </button>
                <button 
                  type="button" 
                  (click)="assignFormCargoType = 'dry'"
                  [class]="assignFormCargoType === 'dry' ? 'bg-primary-box border-primary text-on-primary-box font-bold' : 'bg-surface border-outline-sub text-muted'"
                  class="p-2.5 rounded-2xl border text-center transition-colors cursor-pointer">
                  <span class="material-symbols-rounded text-base block mb-0.5">inventory_2</span>
                  <span class="text-[11px] block">Seca General</span>
                </button>
                <button 
                  type="button" 
                  (click)="assignFormCargoType = 'pharma'"
                  [class]="assignFormCargoType === 'pharma' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-surface border-outline-sub text-muted'"
                  class="p-2.5 rounded-2xl border text-center transition-colors cursor-pointer">
                  <span class="material-symbols-rounded text-base block mb-0.5">vaccines</span>
                  <span class="text-[11px] block">Farma (2-8°C)</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-outline-sub">
            <m3-button variant="text" (action)="telemetryService.closeAssignModal()">
              Cancelar
            </m3-button>
            <m3-button variant="filled" icon="check_circle" (action)="onSubmitAssignRoute()">
              Confirmar Despacho
            </m3-button>
          </div>

        </div>
      </div>
    }
  `
})
export class TelemetryComponent {
  readonly telemetryService = inject(TelemetryService);
  readonly themeService = inject(ThemeService);

  // Assign route form state
  assignFormVehicleId = 'TRK-884';
  assignFormCorridor = 'Corredor Panamericana Sur';
  assignFormDestination = 'CD Callao Muelle Sur';
  assignFormDriver = 'Lucía Paredes';
  assignFormCargoType = 'cold_chain';

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.telemetryService.isInspectModalOpen()) {
      this.telemetryService.closeInspectModal();
    } else if (this.telemetryService.isAssignModalOpen()) {
      this.telemetryService.closeAssignModal();
    }
  }

  onHueChange(hue: number): void {
    this.themeService.setThemeHue(Number(hue));
  }

  onProgressManualChange(val: number): void {
    const sel = this.telemetryService.selectedVehicle();
    if (!sel) return;
    this.telemetryService.vehicles.update(list => {
      return list.map(v => v.id === sel.id ? { ...v, progressPercent: Number(val) } : v);
    });
  }

  onInspectClick(event: MouseEvent, vehicle: Vehicle): void {
    event.stopPropagation();
    this.telemetryService.openInspectModal(vehicle, 'inspect-' + vehicle.id);
  }

  onInspectCorridorClick(): void {
    this.telemetryService.openInspectModal(this.telemetryService.selectedVehicle(), 'corridor-inspect');
  }

  onAssignRouteClick(): void {
    const sel = this.telemetryService.selectedVehicle();
    if (sel) {
      this.assignFormVehicleId = sel.id;
      this.assignFormCorridor = sel.corridor;
      this.assignFormDestination = sel.destination;
      this.assignFormDriver = sel.driver;
      this.assignFormCargoType = sel.cargoTempC < 0 ? 'cold_chain' : 'dry';
    }
    this.telemetryService.openAssignModal('assign-route');
  }

  onSubmitAssignRoute(): void {
    const cargoLabel = this.assignFormCargoType === 'cold_chain'
      ? 'Cadena de Frío (-18°C)'
      : this.assignFormCargoType === 'pharma'
        ? 'Insumos Médicos (2-8°C)'
        : 'Carga Seca General';

    this.telemetryService.assignNewRoute({
      vehicleId: this.assignFormVehicleId,
      corridor: this.assignFormCorridor,
      destination: this.assignFormDestination,
      driver: this.assignFormDriver,
      cargoType: cargoLabel
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'optimal':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'delayed':
      case 'critical':
        return 'bg-amber-500/10 text-amber-500';
      case 'cold_chain_warning':
        return 'bg-cyan-500/10 text-cyan-500';
      default:
        return 'bg-surface-high text-main';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'optimal':
        return 'Óptimo';
      case 'delayed':
        return 'Riesgo SLA';
      case 'critical':
        return 'Crítico';
      case 'cold_chain_warning':
        return 'Cadena Frío';
      default:
        return 'En Ruta';
    }
  }

  getProgressColorByStatus(status: string): 'primary' | 'secondary' | 'tertiary' | 'error' {
    switch (status) {
      case 'optimal':
        return 'primary';
      case 'delayed':
      case 'critical':
        return 'error';
      case 'cold_chain_warning':
        return 'secondary';
      default:
        return 'primary';
    }
  }
}
