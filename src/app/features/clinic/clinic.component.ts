import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicService } from '../../core/clinic/clinic.service';
import {
  BedStatus,
  EmergencyBed,
  News2RiskLevel,
  PatientTriageRecord,
  TriageFilter,
  TriageLevel
} from '../../core/clinic/clinic.models';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3CardComponent } from '../../shared/components/card/card.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';
import { M3LinearProgressComponent } from '../../shared/components/progress';

type ClinicRightTab = 'beds' | 'detail' | 'admit';

@Component({
  selector: 'app-clinic-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    M3ButtonComponent,
    M3CardComponent,
    M3ChipComponent,
    M3LinearProgressComponent
  ],
  template: `
    <div class="h-full flex flex-col gap-3 min-h-0 overflow-hidden select-none bg-surface text-main">

      <!-- =====================================================================
           1. TOP HEADER & OPERATIONAL BAR (Clean M3 Surface)
           ===================================================================== -->
      <header class="shrink-0 p-3 sm:p-4 rounded-3xl bg-surface-box shadow-2xs flex items-center justify-between flex-wrap gap-3">
        
        <!-- Left: Branding & Status -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 rounded-2xl bg-primary-box text-on-primary-box grid place-items-center shadow-2xs shrink-0">
            <span class="material-symbols-rounded text-2xl">local_hospital</span>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-base sm:text-lg font-black tracking-tight text-main truncate">
                Estación de Emergencias & Triaje
              </h1>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-highest text-muted uppercase tracking-wider font-mono">
                MTS Manchester
              </span>
              <span class="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-highest text-muted uppercase tracking-wider font-mono">
                NEWS2 Activo
              </span>
            </div>
            <p class="text-xs text-muted truncate">
              Soporte a la Decisión Clínica • Monitoreo Hemodinámico en Tiempo Real
            </p>
          </div>
        </div>

        <!-- Center/Right: Quick Search & New Admission CTA -->
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div class="relative w-48 sm:w-60">
            <span class="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-muted text-base pointer-events-none">search</span>
            <input
              type="text"
              placeholder="Buscar paciente, código o cama..."
              [ngModel]="clinicService.searchQuery()"
              (ngModelChange)="clinicService.setSearchQuery($event)"
              class="w-full pl-9 pr-3 py-2 rounded-full text-xs bg-surface-high text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-2xs"
            />
          </div>

          <m3-button
            variant="filled"
            size="sm"
            icon="person_add"
            (action)="activeTab.set('admit')">
            + Nueva Admisión
          </m3-button>
        </div>
      </header>

      <!-- =====================================================================
           2. TOP BENTO KPI RIBBON (M3 Canonical Elevated Cards - Bright & Crisp)
           ===================================================================== -->
      <section class="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <!-- KPI 1: Casos Críticos (N1 & N2) -->
        <m3-card
          variant="elevated"
          padding="md"
          shape="xl"
          customClass="flex items-center justify-between transition-all hover:bg-surface-high/40">
          <div>
            <span class="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">Casos Críticos N1/N2</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-2xl sm:text-3xl font-black text-rose-500 font-mono">{{ clinicService.kpiSummary().criticalCases }}</span>
              <span class="text-xs text-muted">pacientes</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">
              {{ clinicService.kpiSummary().highRiskNews2Count }} con NEWS2 Crítico (≥ 7)
            </span>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-rose-500/12 text-rose-500 grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-xl">emergency</span>
          </div>
        </m3-card>

        <!-- KPI 2: Casos Urgentes (N3) -->
        <m3-card
          variant="elevated"
          padding="md"
          shape="xl"
          customClass="flex items-center justify-between transition-all hover:bg-surface-high/40">
          <div>
            <span class="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">Casos Urgentes N3</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-2xl sm:text-3xl font-black text-main font-mono">{{ clinicService.kpiSummary().urgentCases }}</span>
              <span class="text-xs text-muted">pacientes</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">Ventana de atención: ≤ 60 min</span>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-amber-500/12 text-amber-500 grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-xl">warning</span>
          </div>
        </m3-card>

        <!-- KPI 3: Espera Promedio -->
        <m3-card
          variant="elevated"
          padding="md"
          shape="xl"
          customClass="flex items-center justify-between transition-all hover:bg-surface-high/40">
          <div>
            <span class="text-[11px] font-bold text-muted uppercase tracking-wider block">Espera Promedio</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-2xl sm:text-3xl font-black text-main font-mono">{{ clinicService.kpiSummary().avgWaitMinutes }}</span>
              <span class="text-xs text-muted">minutos</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">Meta asistencial: &lt; 30 min</span>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-primary-box text-on-primary-box grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-xl">timer</span>
          </div>
        </m3-card>

        <!-- KPI 4: Ocupación de Camas -->
        <m3-card
          variant="elevated"
          padding="md"
          shape="xl"
          customClass="flex items-center justify-between transition-all hover:bg-surface-high/40">
          <div>
            <span class="text-[11px] font-bold text-muted uppercase tracking-wider block">Ocupación de Camas</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-2xl sm:text-3xl font-black text-main font-mono">{{ clinicService.kpiSummary().occupiedBeds }}/{{ clinicService.kpiSummary().totalBeds }}</span>
              <span class="text-xs font-bold text-muted">({{ clinicService.kpiSummary().bedOccupancyPercent }}%)</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">Shock Trauma: {{ clinicService.kpiSummary().shockTraumaOccupancy }} ocupadas</span>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-surface-highest text-muted grid place-items-center shrink-0">
            <span class="material-symbols-rounded text-xl">bed</span>
          </div>
        </m3-card>

      </section>

      <!-- =====================================================================
           3. MAIN ASYMMETRIC BENTO GRID (Left: 7 Cols, Right: 5 Cols)
           ===================================================================== -->
      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        
        <!-- ===================================================================
             COLUMNA IZQUIERDA: COLA ACTIVA DE TRIAJE (7 / 12)
             =================================================================== -->
        <section class="lg:col-span-7 flex flex-col min-h-0 rounded-3xl bg-surface-box shadow-2xs overflow-hidden">
          
          <!-- Triage Filter Bar (M3 Canonical Filter Chips) -->
          <div class="p-3 bg-surface-low/60 shrink-0 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="font-bold text-main px-1 text-xs shrink-0 flex items-center gap-1.5">
                <span class="material-symbols-rounded text-base text-primary">format_list_bulleted</span>
                <span>Pacientes</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-high text-muted">
                  {{ clinicService.filteredPatients().length }}
                </span>
              </span>

              <!-- Filter Chips (M3 Shared Component) -->
              <m3-chip
                type="filter"
                [selected]="clinicService.activeFilter() === 'all'"
                [count]="clinicService.patients().length"
                (action)="clinicService.setFilter('all')">
                Todos
              </m3-chip>

              <m3-chip
                type="filter"
                [selected]="clinicService.activeFilter() === 'critical'"
                [count]="clinicService.kpiSummary().criticalCases"
                (action)="clinicService.setFilter('critical')">
                Críticos (N1/N2)
              </m3-chip>

              <m3-chip
                type="filter"
                [selected]="clinicService.activeFilter() === 'urgent'"
                [count]="clinicService.kpiSummary().urgentCases"
                (action)="clinicService.setFilter('urgent')">
                Urgentes (N3)
              </m3-chip>

              <m3-chip
                type="filter"
                [selected]="clinicService.activeFilter() === 'standard'"
                (action)="clinicService.setFilter('standard')">
                Menores (N4/N5)
              </m3-chip>

              <m3-chip
                type="filter"
                [selected]="clinicService.activeFilter() === 'waiting'"
                [count]="waitingCount()"
                (action)="clinicService.setFilter('waiting')">
                En Espera
              </m3-chip>
            </div>
          </div>

          <!-- Patients List Scroll Area (M3 Expressive Elevated Cards Feed) -->
          <div class="flex-1 overflow-y-auto p-3 space-y-3 m3-scrollbar">
            @for (patient of clinicService.filteredPatients(); track patient.id) {
              @let isCritical = patient.triageLevel === 'resuscitation' || patient.triageLevel === 'emergency';

              <m3-card
                variant="elevated"
                [interactive]="true"
                padding="md"
                shape="xl"
                [customClass]="getPatientCardBorderClass(patient) + ' group relative space-y-3 cursor-pointer select-none'"
                (action)="onSelectPatient(patient)">

                <!-- 1. PRIORITY HEADER STRIP (Tonal Containers) -->
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  
                  <!-- Left: Manchester Level Tonal Container + Ticket Code -->
                  <div class="flex items-center gap-2">
                    <span
                      [class]="getTriageBadgeContainerClass(patient.triageLevel)"
                      class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full" [class]="getTriageDotClass(patient.triageLevel)"></span>
                      <span>{{ getTriageBadgeLabel(patient.triageLevel) }}</span>
                    </span>

                    <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-surface-highest text-muted">
                      {{ patient.ticketCode }}
                    </span>
                  </div>

                  <!-- Right: Bed Status & Elapsed Wait Latency -->
                  <div class="flex items-center gap-2 ml-auto text-xs">
                    @if (patient.bedAssignedId) {
                      <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface-highest text-main flex items-center gap-1.5">
                        <span class="material-symbols-rounded text-sm text-primary">bed</span>
                        <span>{{ patient.bedAssignedId }}</span>
                      </span>
                    } @else {
                      <span
                        [class]="isCritical ? 'text-rose-500 bg-rose-500/15 font-black' : 'text-amber-500 bg-amber-500/15 font-bold'"
                        class="px-2.5 py-0.5 rounded-full text-[11px] font-mono flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs">error</span>
                        <span>Sin Cama</span>
                      </span>
                    }

                    <span class="px-2.5 py-0.5 rounded-full text-xs font-mono text-muted bg-surface-low flex items-center gap-1">
                      <span class="material-symbols-rounded text-xs">schedule</span>
                      <span>{{ patient.admissionTime }} ({{ patient.waitingMinutes }}m)</span>
                    </span>
                  </div>
                </div>

                <!-- 2. ACTIVE CLINICAL CODE PROTOCOL BANNER (Filled Urgent Tonal Surface) -->
                @if (patient.activeCode) {
                  <div class="p-3 rounded-2xl bg-rose-500/12 flex flex-col gap-2">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                        <span class="font-black text-xs text-main truncate tracking-tight">{{ patient.activeCode.title }}</span>
                        <span class="text-xs text-muted truncate hidden sm:inline">• {{ patient.activeCode.windowLabel }}</span>
                      </div>
                      <div class="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-black text-xs shadow-xs">
                        <span class="material-symbols-rounded text-xs">timer</span>
                        <span>{{ patient.activeCode.remainingMinutes }} min restantes</span>
                      </div>
                    </div>
                    
                    <!-- M3 Linear Progress Engine for acute window -->
                    <m3-linear-progress
                      [value]="(patient.activeCode.elapsedMinutes / patient.activeCode.targetMinutes) * 100"
                      [wavy]="false"
                      color="error"
                      size="sm">
                    </m3-linear-progress>
                  </div>
                }

                <!-- 3. PATIENT IDENTITY & CHIEF COMPLAINT -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-baseline gap-2 min-w-0">
                      <h3 class="text-base font-black text-main tracking-tight truncate group-hover:text-primary transition-colors">
                        {{ patient.fullName }}
                      </h3>
                      <span class="text-xs text-muted font-medium shrink-0">
                        {{ patient.age }}a • {{ patient.gender === 'M' ? 'Masc.' : (patient.gender === 'F' ? 'Fem.' : 'Otro') }}
                      </span>
                    </div>

                    <!-- NEWS2 Score Chip -->
                    <span
                      [class]="getNews2PillClass(patient.news2.riskLevel)"
                      class="px-2.5 py-0.5 rounded-full text-xs font-mono font-black shrink-0 flex items-center gap-1">
                      NEWS2 {{ patient.news2.score }}
                    </span>
                  </div>

                  <p class="text-xs text-muted leading-relaxed line-clamp-2">
                    <span class="font-bold text-main/80">Motivo:</span> {{ patient.chiefComplaint }}
                  </p>
                </div>

                <!-- 4. BIOMETRIC VITALS STRIP (5 Smooth Filled Containers) -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  
                  <!-- Cell 1: HR -->
                  <div
                    [class]="patient.vitals.heartRate > 110 || patient.vitals.heartRate < 50 ? 'bg-rose-500/15 text-rose-500' : 'bg-surface-low text-main'"
                    class="p-2.5 rounded-2xl flex flex-col justify-between transition-colors">
                    <div class="flex items-center justify-between text-[10px] text-muted">
                      <span class="font-bold">FC</span>
                      <span class="material-symbols-rounded text-xs">favorite</span>
                    </div>
                    <div class="mt-1">
                      <div class="text-sm sm:text-base font-mono font-black tracking-tight leading-none">
                        {{ patient.vitals.heartRate }} <span class="text-[10px] font-normal text-muted">bpm</span>
                      </div>
                      <span class="text-[9px] text-muted font-mono block mt-0.5">pulso</span>
                    </div>
                  </div>

                  <!-- Cell 2: BP -->
                  <div
                    [class]="patient.vitals.bloodPressureSys > 160 || patient.vitals.bloodPressureSys < 90 ? 'bg-rose-500/15 text-rose-500' : 'bg-surface-low text-main'"
                    class="p-2.5 rounded-2xl flex flex-col justify-between transition-colors">
                    <div class="flex items-center justify-between text-[10px] text-muted">
                      <span class="font-bold">PA</span>
                      <span class="material-symbols-rounded text-xs">speed</span>
                    </div>
                    <div class="mt-1">
                      <div class="text-sm sm:text-base font-mono font-black tracking-tight leading-none">
                        {{ patient.vitals.bloodPressureSys }}/{{ patient.vitals.bloodPressureDia }}
                      </div>
                      <span class="text-[9px] text-muted font-mono block mt-0.5">mmHg</span>
                    </div>
                  </div>

                  <!-- Cell 3: SpO2 -->
                  <div
                    [class]="patient.vitals.oxygenSat < 93 ? 'bg-rose-500/15 text-rose-500' : 'bg-surface-low text-main'"
                    class="p-2.5 rounded-2xl flex flex-col justify-between transition-colors">
                    <div class="flex items-center justify-between text-[10px] text-muted">
                      <span class="font-bold">SpO2</span>
                      <span class="material-symbols-rounded text-xs">air</span>
                    </div>
                    <div class="mt-1">
                      <div class="text-sm sm:text-base font-mono font-black tracking-tight leading-none">
                        {{ patient.vitals.oxygenSat }}<span class="text-[10px] font-normal text-muted">%</span>
                      </div>
                      <span class="text-[9px] text-muted font-mono block mt-0.5">oxígeno</span>
                    </div>
                  </div>

                  <!-- Cell 4: Temperature -->
                  <div
                    [class]="patient.vitals.temperature >= 38.5 ? 'bg-amber-500/15 text-amber-500' : 'bg-surface-low text-main'"
                    class="p-2.5 rounded-2xl flex flex-col justify-between transition-colors">
                    <div class="flex items-center justify-between text-[10px] text-muted">
                      <span class="font-bold">TEMP</span>
                      <span class="material-symbols-rounded text-xs">device_thermostat</span>
                    </div>
                    <div class="mt-1">
                      <div class="text-sm sm:text-base font-mono font-black tracking-tight leading-none">
                        {{ patient.vitals.temperature }}<span class="text-[10px] font-normal text-muted">°C</span>
                      </div>
                      <span class="text-[9px] text-muted font-mono block mt-0.5">axilar</span>
                    </div>
                  </div>

                  <!-- Cell 5: EVA Pain Scale -->
                  <div
                    [class]="patient.vitals.painScale >= 7 ? 'bg-amber-500/15 text-amber-500' : 'bg-surface-low text-main'"
                    class="p-2.5 rounded-2xl flex flex-col justify-between transition-colors">
                    <div class="flex items-center justify-between text-[10px] text-muted">
                      <span class="font-bold">EVA</span>
                      <span class="material-symbols-rounded text-xs">sentiment_dissatisfied</span>
                    </div>
                    <div class="mt-1">
                      <div class="text-sm sm:text-base font-mono font-black tracking-tight leading-none">
                        {{ patient.vitals.painScale }}<span class="text-[10px] font-normal text-muted">/10</span>
                      </div>
                      <span class="text-[9px] text-muted font-mono block mt-0.5">dolor</span>
                    </div>
                  </div>

                </div>

                <!-- 5. TACTILE ACTION BAR (M3 Button Shared Components) -->
                <div class="pt-1 flex items-center justify-between gap-2 flex-wrap text-xs">
                  
                  <!-- Left: Immediate Critical Bed CTA or Reclassify Selector -->
                  @if (!patient.bedAssignedId && (patient.triageLevel === 'resuscitation' || patient.triageLevel === 'emergency' || patient.news2.riskLevel === 'high')) {
                    <m3-button
                      variant="filled"
                      size="sm"
                      icon="bolt"
                      customClass="bg-rose-600 hover:bg-rose-700 text-white font-black"
                      (action)="onImmediateShockTrauma(patient.id, $event)">
                      Asignar Shock Trauma Inmediato
                    </m3-button>
                  } @else {
                    <div class="relative">
                      @if (activeRetriageId() === patient.id) {
                        <div class="flex items-center gap-1 p-1 rounded-full bg-surface-highest shadow-sm animate-in zoom-in-95" (click)="$event.stopPropagation()">
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'resuscitation', $event)"
                            class="px-2.5 py-1 rounded-full text-xs font-black text-rose-500 hover:bg-surface-box transition-colors">
                            N1
                          </button>
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'emergency', $event)"
                            class="px-2.5 py-1 rounded-full text-xs font-black text-orange-500 hover:bg-surface-box transition-colors">
                            N2
                          </button>
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'urgent', $event)"
                            class="px-2.5 py-1 rounded-full text-xs font-black text-amber-500 hover:bg-surface-box transition-colors">
                            N3
                          </button>
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'standard', $event)"
                            class="px-2.5 py-1 rounded-full text-xs font-black text-emerald-500 hover:bg-surface-box transition-colors">
                            N4
                          </button>
                          <button
                            type="button"
                            (click)="activeRetriageId.set(null); $event.stopPropagation()"
                            class="material-symbols-rounded text-sm text-muted hover:text-main px-1.5 cursor-pointer">
                            close
                          </button>
                        </div>
                      } @else {
                        <m3-button
                          variant="tonal"
                          size="sm"
                          icon="swap_vert"
                          (action)="toggleRetriage(patient.id, $event)">
                          Reclasificar
                        </m3-button>
                      }
                    </div>
                  }

                  <!-- Right: Bed Assignment / Discharge Buttons -->
                  <div class="flex items-center gap-2 ml-auto">
                    @if (!patient.bedAssignedId) {
                      <m3-button
                        variant="tonal"
                        size="sm"
                        icon="bed"
                        (action)="openBedAssignment(patient, $event)">
                        Asignar Cama
                      </m3-button>
                    }
                    <m3-button
                      variant="text"
                      size="sm"
                      (action)="onDischarge(patient.id, $event)">
                      Alta Médica
                    </m3-button>
                  </div>
                </div>

              </m3-card>
            } @empty {
              <div class="h-48 grid place-items-center text-center p-6 text-muted">
                <div>
                  <span class="material-symbols-rounded text-3xl mb-1 text-muted">health_and_safety</span>
                  <p class="text-xs font-semibold">No se encontraron pacientes con este filtro</p>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- ===================================================================
             COLUMNA DERECHA: MATRIZ DE CAMAS & FICHA CLÍNICA / ADMISIÓN (5 / 12)
             =================================================================== -->
        <section class="lg:col-span-5 flex flex-col min-h-0 rounded-3xl bg-surface-box shadow-2xs overflow-hidden">
          
          <!-- Segmented Tab Header (Clean M3 Pill Switcher) -->
          <div class="p-3 bg-surface-low/60 shrink-0">
            <div class="p-1 rounded-full bg-surface-high flex items-center gap-1 w-full shadow-2xs">
              <button
                type="button"
                (click)="activeTab.set('beds')"
                [class.bg-primary]="activeTab() === 'beds'"
                [class.text-on-primary]="activeTab() === 'beds'"
                [class.font-bold]="activeTab() === 'beds'"
                [class.shadow-xs]="activeTab() === 'beds'"
                [class.text-muted]="activeTab() !== 'beds'"
                class="flex-1 py-1.5 rounded-full text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span class="material-symbols-rounded text-sm">bed</span>
                <span>Camas</span>
              </button>

              <button
                type="button"
                (click)="activeTab.set('detail')"
                [class.bg-primary]="activeTab() === 'detail'"
                [class.text-on-primary]="activeTab() === 'detail'"
                [class.font-bold]="activeTab() === 'detail'"
                [class.shadow-xs]="activeTab() === 'detail'"
                [class.text-muted]="activeTab() !== 'detail'"
                class="flex-1 py-1.5 rounded-full text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span class="material-symbols-rounded text-sm">clinical_notes</span>
                <span>Ficha & NEWS2</span>
              </button>

              <button
                type="button"
                (click)="activeTab.set('admit')"
                [class.bg-primary]="activeTab() === 'admit'"
                [class.text-on-primary]="activeTab() === 'admit'"
                [class.font-bold]="activeTab() === 'admit'"
                [class.shadow-xs]="activeTab() === 'admit'"
                [class.text-muted]="activeTab() !== 'admit'"
                class="flex-1 py-1.5 rounded-full text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span class="material-symbols-rounded text-sm">add</span>
                <span>Admisión</span>
              </button>
            </div>
          </div>

          <!-- TAB 1: MATRIZ DE CAMAS CRÍTICAS (M3 Elevated Cards & Buttons) -->
          @if (activeTab() === 'beds') {
            <div class="flex-1 overflow-y-auto p-3 space-y-4 m3-scrollbar">
              
              <!-- Shock Trauma Unit -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-main uppercase tracking-wider flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Shock Trauma Bay</span>
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/12 text-rose-500">
                    Alta Complejidad
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  @for (bed of shockTraumaBeds(); track bed.id) {
                    <m3-card
                      variant="elevated"
                      padding="sm"
                      shape="xl"
                      customClass="hover:bg-surface-high/40 transition-all text-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div class="flex items-center justify-between">
                          <span class="font-mono font-black text-sm text-main flex items-center gap-1.5">
                            <span class="material-symbols-rounded text-base text-primary">local_hospital</span>
                            <span>{{ bed.id }}</span>
                          </span>
                          
                          <span
                            [class]="bed.status === 'occupied' ? 'bg-rose-500/15 text-rose-500' : (bed.status === 'cleaning' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500')"
                            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {{ getBedStatusLabel(bed.status) }}
                          </span>
                        </div>
                        <p class="font-bold text-main mt-1.5 text-xs truncate">{{ bed.patientName ?? 'Disponible para ingreso' }}</p>
                        <div class="flex items-center gap-1 flex-wrap mt-1">
                          @for (eq of bed.equipment; track eq) {
                            <span class="px-2 py-0.5 rounded-full bg-surface-box text-[9px] font-mono text-muted">
                              {{ eq }}
                            </span>
                          }
                        </div>
                      </div>

                      <div class="pt-1 flex items-center justify-between">
                        @if (bed.status === 'available' && clinicService.selectedPatient() && !clinicService.selectedPatient()?.bedAssignedId) {
                          <m3-button
                            variant="filled"
                            size="sm"
                            customClass="w-full font-black"
                            (action)="clinicService.assignBed(clinicService.selectedPatient()!.id, bed.id)">
                            Asignar Paciente
                          </m3-button>
                        } @else if (bed.status === 'cleaning') {
                          <m3-button
                            variant="tonal"
                            size="sm"
                            customClass="w-full font-bold"
                            (action)="clinicService.setBedStatus(bed.id, 'available')">
                            Habilitar Cama
                          </m3-button>
                        } @else if (bed.status === 'occupied') {
                          <m3-button
                            variant="text"
                            size="sm"
                            customClass="w-full font-semibold text-muted hover:text-main"
                            (action)="clinicService.setBedStatus(bed.id, 'cleaning')">
                            Liberar para Limpieza
                          </m3-button>
                        } @else {
                          <span class="text-[10px] text-muted italic flex items-center gap-1">
                            <span class="material-symbols-rounded text-xs text-emerald-500">check_circle</span>
                            <span>Lista para ingreso crítico</span>
                          </span>
                        }
                      </div>
                    </m3-card>
                  }
                </div>
              </div>

              <!-- Observación Rápida -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-main uppercase tracking-wider flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span>Observación Rápida</span>
                  </span>
                  <span class="text-[10px] text-muted font-mono font-bold">4 Camas</span>
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  @for (bed of observationBeds(); track bed.id) {
                    <m3-card
                      variant="elevated"
                      padding="sm"
                      shape="xl"
                      customClass="hover:bg-surface-high/40 transition-all text-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div class="flex items-center justify-between">
                          <span class="font-mono font-bold text-xs text-main flex items-center gap-1">
                            <span class="material-symbols-rounded text-sm text-primary">bed</span>
                            <span>{{ bed.id }}</span>
                          </span>
                          <span
                            [class]="bed.status === 'occupied' ? 'bg-rose-500/15 text-rose-500' : (bed.status === 'cleaning' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500')"
                            class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                            {{ getBedStatusLabel(bed.status) }}
                          </span>
                        </div>
                        <p class="font-medium text-main mt-1.5 text-xs truncate">{{ bed.patientName ?? 'Libre' }}</p>
                      </div>

                      <div class="pt-1">
                        @if (bed.status === 'available' && clinicService.selectedPatient() && !clinicService.selectedPatient()?.bedAssignedId) {
                          <m3-button
                            variant="filled"
                            size="sm"
                            customClass="w-full font-bold"
                            (action)="clinicService.assignBed(clinicService.selectedPatient()!.id, bed.id)">
                            Asignar
                          </m3-button>
                        } @else if (bed.status === 'occupied') {
                          <m3-button
                            variant="text"
                            size="sm"
                            customClass="w-full text-muted hover:text-main"
                            (action)="clinicService.setBedStatus(bed.id, 'cleaning')">
                            Liberar
                          </m3-button>
                        } @else if (bed.status === 'cleaning') {
                          <m3-button
                            variant="tonal"
                            size="sm"
                            customClass="w-full"
                            (action)="clinicService.setBedStatus(bed.id, 'available')">
                            Listo
                          </m3-button>
                        }
                      </div>
                    </m3-card>
                  }
                </div>
              </div>

              <!-- Sala de Procedimientos -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-main uppercase tracking-wider flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Tópico & Procedimientos</span>
                  </span>
                  <span class="text-[10px] text-muted font-mono font-bold">2 Camas</span>
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  @for (bed of procedureBeds(); track bed.id) {
                    <m3-card
                      variant="elevated"
                      padding="sm"
                      shape="xl"
                      customClass="hover:bg-surface-high/40 transition-all text-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div class="flex items-center justify-between">
                          <span class="font-mono font-bold text-xs text-main flex items-center gap-1">
                            <span class="material-symbols-rounded text-sm text-primary">healing</span>
                            <span>{{ bed.id }}</span>
                          </span>
                          <span
                            [class]="bed.status === 'occupied' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'"
                            class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                            {{ getBedStatusLabel(bed.status) }}
                          </span>
                        </div>
                        <p class="font-medium text-main mt-1.5 text-xs truncate">{{ bed.patientName ?? 'Disponible' }}</p>
                      </div>

                      <div class="pt-1">
                        @if (bed.status === 'available' && clinicService.selectedPatient() && !clinicService.selectedPatient()?.bedAssignedId) {
                          <m3-button
                            variant="filled"
                            size="sm"
                            customClass="w-full font-bold"
                            (action)="clinicService.assignBed(clinicService.selectedPatient()!.id, bed.id)">
                            Asignar
                          </m3-button>
                        } @else if (bed.status === 'occupied') {
                          <m3-button
                            variant="text"
                            size="sm"
                            customClass="w-full text-muted hover:text-main"
                            (action)="clinicService.setBedStatus(bed.id, 'cleaning')">
                            Liberar
                          </m3-button>
                        }
                      </div>
                    </m3-card>
                  }
                </div>
              </div>

            </div>
          }

          <!-- TAB 2: DETALLE DEL PACIENTE & PROTOCOLOS NEWS2 (M3 Elevated Cards) -->
          @if (activeTab() === 'detail') {
            @if (clinicService.selectedPatient(); as patient) {
              <div class="flex-1 overflow-y-auto p-4 space-y-4 m3-scrollbar">
                
                <!-- Acute Protocol Alert Banner -->
                @if (patient.activeCode) {
                  <div class="p-4 rounded-3xl bg-rose-500/12 shadow-2xs text-xs space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="font-black text-main flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                        <span class="text-sm">{{ patient.activeCode.title }}</span>
                      </span>
                      <span class="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-black text-xs shadow-xs">
                        {{ patient.activeCode.remainingMinutes }} min restantes
                      </span>
                    </div>

                    <p class="text-xs text-muted font-normal">
                      {{ patient.activeCode.protocolAction }}
                    </p>

                    <!-- Therapeutic Window Progress Track -->
                    <div class="space-y-1">
                      <div class="flex justify-between text-[10px] text-muted font-mono">
                        <span>Transcurrido: {{ patient.activeCode.elapsedMinutes }} min</span>
                        <span>Meta: ≤ {{ patient.activeCode.targetMinutes }} min</span>
                      </div>
                      <m3-linear-progress
                        [value]="(patient.activeCode.elapsedMinutes / patient.activeCode.targetMinutes) * 100"
                        [wavy]="false"
                        color="error"
                        size="sm">
                      </m3-linear-progress>
                    </div>
                  </div>
                }

                <!-- Patient Header Card -->
                <m3-card variant="elevated" padding="md" shape="xl" customClass="space-y-2">
                  <div class="flex items-center justify-between">
                    <span [class]="getTriageBadgeContainerClass(patient.triageLevel)" class="px-3 py-1 rounded-full text-xs font-black uppercase">
                      {{ getTriageBadgeLabel(patient.triageLevel) }}
                    </span>
                    <span class="font-mono font-bold text-xs text-muted">Ingreso: {{ patient.admissionTime }} ({{ patient.waitingMinutes }} min)</span>
                  </div>

                  <h3 class="text-lg font-black text-main">{{ patient.fullName }}</h3>
                  <p class="text-xs text-muted">{{ patient.ticketCode }} • {{ patient.age }} años • Sexo {{ patient.gender }}</p>

                  <div class="pt-2">
                    <span class="text-[10px] font-bold text-muted uppercase block mb-1">Motivo de Consulta Principal:</span>
                    <p class="text-xs text-main bg-surface-low p-3 rounded-2xl leading-relaxed">{{ patient.chiefComplaint }}</p>
                  </div>
                </m3-card>

                <!-- National Early Warning Score 2 (NEWS2) Analysis -->
                <m3-card variant="elevated" padding="md" shape="xl" customClass="text-xs space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-main flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-base text-primary">analytics</span>
                      <span class="text-xs font-black uppercase tracking-wider">Índice Clínico NEWS2</span>
                    </span>
                    <span class="px-3 py-1 rounded-full font-mono font-black text-xs shadow-2xs" [class]="getNews2PillClass(patient.news2.riskLevel)">
                      Score: {{ patient.news2.score }} / 20
                    </span>
                  </div>

                  <p class="text-xs text-muted">{{ patient.news2.recommendation }}</p>

                  @if (patient.news2.triggers.length > 0) {
                    <div class="pt-1">
                      <span class="text-[10px] font-bold text-rose-500 uppercase block mb-1">Criterios de Alerta Detectados:</span>
                      <ul class="space-y-1">
                        @for (trigger of patient.news2.triggers; track trigger) {
                          <li class="flex items-center gap-1.5 text-xs text-rose-500 font-medium bg-rose-500/10 px-2.5 py-1 rounded-xl">
                            <span class="material-symbols-rounded text-sm">warning</span>
                            <span>{{ trigger }}</span>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </m3-card>

                <!-- Signos Vitales con Rangos Fisiológicos -->
                <m3-card variant="elevated" padding="md" shape="xl" customClass="space-y-3">
                  <span class="text-xs font-black text-main uppercase tracking-wider flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-base text-primary">vital_signs</span>
                    <span>Signos Vitales y Rangos</span>
                  </span>

                  <div class="grid grid-cols-2 gap-2.5 text-xs">
                    <div class="p-3 rounded-2xl bg-surface-low">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Frecuencia Cardíaca</span>
                        <span>60 - 100 bpm</span>
                      </div>
                      <span class="text-lg font-mono font-black text-main block mt-1">{{ patient.vitals.heartRate }} bpm</span>
                    </div>

                    <div class="p-3 rounded-2xl bg-surface-low">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Presión Arterial</span>
                        <span>120 / 80</span>
                      </div>
                      <span class="text-lg font-mono font-black text-main block mt-1">{{ patient.vitals.bloodPressureSys }}/{{ patient.vitals.bloodPressureDia }}</span>
                    </div>

                    <div class="p-3 rounded-2xl bg-surface-low">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Saturación SpO2</span>
                        <span>≥ 95%</span>
                      </div>
                      <span class="text-lg font-mono font-black text-main block mt-1">{{ patient.vitals.oxygenSat }}%</span>
                    </div>

                    <div class="p-3 rounded-2xl bg-surface-low">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Temperatura</span>
                        <span>36.5 - 37.5°C</span>
                      </div>
                      <span class="text-lg font-mono font-black text-main block mt-1">{{ patient.vitals.temperature }}°C</span>
                    </div>
                  </div>

                  <div class="p-3 rounded-2xl bg-surface-low flex items-center justify-between text-xs">
                    <span class="text-xs text-muted font-medium">Escala de Dolor (EVA):</span>
                    <span class="font-mono font-black text-main text-sm">{{ patient.vitals.painScale }} / 10</span>
                  </div>
                </m3-card>

                <!-- Alergias & Notas -->
                <m3-card variant="elevated" padding="md" shape="xl" customClass="space-y-2 text-xs">
                  <div>
                    <span class="text-[10px] font-bold text-muted uppercase block mb-1">Alergias Documentadas:</span>
                    @if (patient.allergies && patient.allergies.length > 0) {
                      <div class="flex items-center gap-1.5 flex-wrap">
                        @for (allergy of patient.allergies; track allergy) {
                          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-highest text-main">
                            {{ allergy }}
                          </span>
                        }
                      </div>
                    } @else {
                      <span class="text-muted italic">Sin alergias conocidas reportadas.</span>
                    }
                  </div>

                  @if (patient.notes) {
                    <div class="pt-2">
                      <span class="text-[10px] font-bold text-muted uppercase block mb-1">Evolución / Indicaciones Clínicas:</span>
                      <p class="text-xs text-muted italic bg-surface-low p-3 rounded-2xl">{{ patient.notes }}</p>
                    </div>
                  }
                </m3-card>

                <!-- Patient Actions CTA -->
                <div class="flex items-center gap-2 pt-2">
                  @if (!patient.bedAssignedId) {
                    <m3-button
                      variant="filled"
                      size="md"
                      icon="bolt"
                      customClass="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black"
                      (action)="onImmediateShockTrauma(patient.id)">
                      ⚡ Asignar a Shock Trauma Inmediato
                    </m3-button>
                  } @else {
                    <m3-button
                      variant="filled"
                      size="md"
                      customClass="flex-1 font-bold"
                      (action)="activeTab.set('beds')">
                      Cambiar Cama
                    </m3-button>
                  }

                  <m3-button
                    variant="tonal"
                    size="md"
                    customClass="font-bold"
                    (action)="onDischarge(patient.id)">
                    Alta Médica
                  </m3-button>
                </div>

              </div>
            } @else {
              <div class="h-48 grid place-items-center text-center p-6 text-muted">
                <div>
                  <span class="material-symbols-rounded text-4xl mb-1 text-muted">person_search</span>
                  <p class="text-xs font-semibold">Selecciona un paciente para ver su ficha clínica y NEWS2</p>
                </div>
              </div>
            }
          }

          <!-- TAB 3: ADMISIÓN RÁPIDA DE EMERGENCIA (Clean Inputs) -->
          @if (activeTab() === 'admit') {
            <div class="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs m3-scrollbar">
              
              <div class="flex items-center justify-between pb-1">
                <span class="font-black text-sm text-main">Ingreso Rápido a Triaje</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-highest text-muted">MTS Protocol</span>
              </div>

              <!-- Full Name -->
              <div>
                <label class="block text-[11px] font-semibold text-muted mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  [(ngModel)]="newPatientName"
                  placeholder="Ej: Marcelo Quiroga"
                  class="w-full px-3.5 py-2 rounded-2xl bg-surface-high text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              <!-- Age & Gender -->
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-semibold text-muted mb-1">Edad (años):</label>
                  <input
                    type="number"
                    [(ngModel)]="newPatientAge"
                    placeholder="42"
                    class="w-full px-3.5 py-2 rounded-2xl bg-surface-high text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-muted mb-1">Sexo:</label>
                  <select
                    [(ngModel)]="newPatientGender"
                    class="w-full px-3 py-2 rounded-2xl bg-surface-high text-main focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Other">Otro</option>
                  </select>
                </div>
              </div>

              <!-- Manchester Triage Level -->
              <div>
                <label class="block text-[11px] font-semibold text-muted mb-1.5">Prioridad Manchester:</label>
                <div class="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    (click)="newPatientLevel = 'resuscitation'"
                    [class.ring-2]="newPatientLevel === 'resuscitation'"
                    class="py-2 rounded-2xl text-xs font-black text-rose-500 bg-surface-high cursor-pointer ring-rose-400 shadow-2xs">
                    N1
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'emergency'"
                    [class.ring-2]="newPatientLevel === 'emergency'"
                    class="py-2 rounded-2xl text-xs font-black text-orange-500 bg-surface-high cursor-pointer ring-orange-400 shadow-2xs">
                    N2
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'urgent'"
                    [class.ring-2]="newPatientLevel === 'urgent'"
                    class="py-2 rounded-2xl text-xs font-black text-amber-500 bg-surface-high cursor-pointer ring-amber-300 shadow-2xs">
                    N3
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'standard'"
                    [class.ring-2]="newPatientLevel === 'standard'"
                    class="py-2 rounded-2xl text-xs font-black text-emerald-500 bg-surface-high cursor-pointer ring-emerald-400 shadow-2xs">
                    N4
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'non_urgent'"
                    [class.ring-2]="newPatientLevel === 'non_urgent'"
                    class="py-2 rounded-2xl text-xs font-black text-sky-500 bg-surface-high cursor-pointer ring-sky-400 shadow-2xs">
                    N5
                  </button>
                </div>
              </div>

              <!-- Chief Complaint -->
              <div>
                <label class="block text-[11px] font-semibold text-muted mb-1">Motivo de Consulta:</label>
                <textarea
                  [(ngModel)]="newPatientComplaint"
                  rows="2"
                  placeholder="Descripción de síntomas agudos y tiempo de evolución..."
                  class="w-full px-3.5 py-2 rounded-2xl bg-surface-high text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none shadow-2xs">
                </textarea>
              </div>

              <!-- Quick Vitals Inputs -->
              <div class="grid grid-cols-3 gap-2.5">
                <div>
                  <label class="block text-[10px] font-semibold text-muted mb-1">FC (bpm):</label>
                  <input type="number" [(ngModel)]="newVitalsHR" class="w-full px-3 py-1.5 rounded-xl bg-surface-high text-main shadow-2xs focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-muted mb-1">PA Sistólica:</label>
                  <input type="number" [(ngModel)]="newVitalsSys" class="w-full px-3 py-1.5 rounded-xl bg-surface-high text-main shadow-2xs focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-muted mb-1">SpO2 (%):</label>
                  <input type="number" [(ngModel)]="newVitalsSpO2" class="w-full px-3 py-1.5 rounded-xl bg-surface-high text-main shadow-2xs focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div class="pt-2">
                <m3-button
                  variant="filled"
                  size="md"
                  customClass="w-full font-bold"
                  [disabled]="!newPatientName.trim() || !newPatientComplaint.trim()"
                  (action)="submitAdmission()">
                  Admitir Paciente a Triaje
                </m3-button>
              </div>

            </div>
          }

        </section>

      </div>

    </div>
  `
})
export class ClinicComponent {
  readonly clinicService = inject(ClinicService);

  readonly activeTab = signal<ClinicRightTab>('beds');
  readonly activeRetriageId = signal<string | null>(null);

  // Bed group computed signals
  readonly shockTraumaBeds = computed(() =>
    this.clinicService.beds().filter(b => b.area === 'shock_trauma')
  );

  readonly observationBeds = computed(() =>
    this.clinicService.beds().filter(b => b.area === 'observation')
  );

  readonly procedureBeds = computed(() =>
    this.clinicService.beds().filter(b => b.area === 'procedure')
  );

  readonly waitingCount = computed(() =>
    this.clinicService.patients().filter(p => !p.bedAssignedId).length
  );

  // Form model for new admission
  newPatientName = '';
  newPatientAge = 40;
  newPatientGender: 'M' | 'F' | 'Other' = 'M';
  newPatientLevel: TriageLevel = 'urgent';
  newPatientComplaint = '';
  newVitalsHR = 80;
  newVitalsSys = 120;
  newVitalsDia = 80;
  newVitalsSpO2 = 98;
  newVitalsTemp = 36.6;
  newVitalsPain = 3;

  onSelectPatient(patient: PatientTriageRecord): void {
    this.clinicService.selectPatient(patient);
    this.activeTab.set('detail');
  }

  toggleRetriage(patientId: string, event: Event): void {
    event.stopPropagation();
    this.activeRetriageId.update(current => (current === patientId ? null : patientId));
  }

  applyRetriage(patientId: string, level: TriageLevel, event: Event): void {
    event.stopPropagation();
    this.clinicService.updateTriageLevel(patientId, level);
    this.activeRetriageId.set(null);
  }

  // Backward compatible for tests
  onQuickRetriage(patientId: string, level: TriageLevel, event: Event): void {
    this.applyRetriage(patientId, level, event);
  }

  openBedAssignment(patient: PatientTriageRecord, event: Event): void {
    event.stopPropagation();
    this.clinicService.selectPatient(patient);
    this.activeTab.set('beds');
  }

  onImmediateShockTrauma(patientId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.clinicService.assignImmediateShockTrauma(patientId);
  }

  onDischarge(patientId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.clinicService.dischargePatient(patientId);
  }

  submitAdmission(): void {
    if (!this.newPatientName.trim() || !this.newPatientComplaint.trim()) return;

    this.clinicService.admitPatient({
      fullName: this.newPatientName.trim(),
      age: this.newPatientAge,
      gender: this.newPatientGender,
      triageLevel: this.newPatientLevel,
      chiefComplaint: this.newPatientComplaint.trim(),
      vitals: {
        heartRate: this.newVitalsHR,
        bloodPressureSys: this.newVitalsSys,
        bloodPressureDia: this.newVitalsDia,
        oxygenSat: this.newVitalsSpO2,
        temperature: this.newVitalsTemp,
        painScale: this.newVitalsPain
      }
    });

    this.newPatientName = '';
    this.newPatientComplaint = '';
    this.activeTab.set('detail');
  }

  getPatientCardBorderClass(patient: PatientTriageRecord): string {
    const isSelected = this.clinicService.selectedPatient()?.id === patient.id;
    if (isSelected) {
      return 'ring-2 ring-primary bg-primary-box/25 shadow-xs';
    }
    return 'hover:bg-surface-high/40';
  }

  getTriageBadgeContainerClass(level: TriageLevel): string {
    switch (level) {
      case 'resuscitation':
        return 'bg-rose-500/15 text-rose-500';
      case 'emergency':
        return 'bg-orange-500/15 text-orange-500';
      case 'urgent':
        return 'bg-amber-500/15 text-amber-500';
      case 'standard':
        return 'bg-emerald-500/15 text-emerald-500';
      case 'non_urgent':
        return 'bg-sky-500/15 text-sky-500';
    }
  }

  getTriageDotClass(level: TriageLevel): string {
    switch (level) {
      case 'resuscitation':
        return 'bg-rose-500 animate-pulse';
      case 'emergency':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-amber-500';
      case 'standard':
        return 'bg-emerald-500';
      case 'non_urgent':
        return 'bg-sky-500';
    }
  }

  getTriageTextClass(level: TriageLevel): string {
    switch (level) {
      case 'resuscitation':
        return 'text-rose-500';
      case 'emergency':
        return 'text-orange-500';
      case 'urgent':
        return 'text-amber-500';
      case 'standard':
        return 'text-emerald-500';
      case 'non_urgent':
        return 'text-sky-500';
    }
  }

  getTriageBadgeLabel(level: TriageLevel): string {
    switch (level) {
      case 'resuscitation':
        return 'N1 • Resucitación';
      case 'emergency':
        return 'N2 • Emergencia';
      case 'urgent':
        return 'N3 • Urgente';
      case 'standard':
        return 'N4 • Poco Urgente';
      case 'non_urgent':
        return 'N5 • No Urgente';
    }
  }

  getNews2PillClass(risk: News2RiskLevel): string {
    if (risk === 'high') {
      return 'bg-rose-600 text-white font-mono font-black shadow-xs';
    }
    if (risk === 'medium') {
      return 'bg-amber-500/20 text-amber-500 font-mono font-black';
    }
    return 'bg-surface-highest text-muted font-mono font-semibold';
  }

  getBedDotClass(status: BedStatus): string {
    switch (status) {
      case 'occupied':
        return 'bg-rose-500';
      case 'cleaning':
        return 'bg-amber-500';
      case 'available':
        return 'bg-emerald-500';
    }
  }

  getBedStatusLabel(status: BedStatus): string {
    switch (status) {
      case 'occupied':
        return 'Ocupada';
      case 'cleaning':
        return 'Desinfección';
      case 'available':
        return 'Disponible';
    }
  }
}
