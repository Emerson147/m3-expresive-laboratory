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

type ClinicRightTab = 'beds' | 'detail' | 'admit';

@Component({
  selector: 'app-clinic-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col gap-2 min-h-0 overflow-hidden select-none">

      <!-- =====================================================================
           1. TOP HEADER & OPERATIONAL BAR
           ===================================================================== -->
      <header class="shrink-0 p-2.5 sm:p-3 rounded-2xl bg-surface-box border border-outline-sub shadow-xs flex items-center justify-between flex-wrap gap-2">
        
        <!-- Left: Branding & Status -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-surface-high border border-outline-sub text-primary grid place-items-center shadow-xs shrink-0">
            <span class="material-symbols-rounded text-xl">local_hospital</span>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-black tracking-tight text-main truncate">
                Estación de Emergencias & Triaje
              </h1>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-highest text-muted uppercase tracking-wider font-mono border border-outline-sub">
                MTS Manchester
              </span>
              <span class="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-highest text-muted uppercase tracking-wider font-mono border border-outline-sub">
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
          <div class="relative w-44 sm:w-56">
            <span class="material-symbols-rounded absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-base">search</span>
            <input
              type="text"
              placeholder="Buscar paciente, código o cama..."
              [ngModel]="clinicService.searchQuery()"
              (ngModelChange)="clinicService.setSearchQuery($event)"
              class="w-full pl-8 pr-3 py-1.5 rounded-full text-xs bg-surface-high border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <button
            type="button"
            (click)="activeTab.set('admit')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
            <span class="material-symbols-rounded text-base">person_add</span>
            <span>+ Nueva Admisión</span>
          </button>
        </div>
      </header>

      <!-- =====================================================================
           2. TOP BENTO KPI RIBBON (Sober & High Contrast)
           ===================================================================== -->
      <section class="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2">
        
        <!-- KPI 1: Casos Críticos (N1 & N2) -->
        <div class="p-2.5 rounded-2xl bg-surface-box border border-outline-sub flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">Casos Críticos N1/N2</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-xl sm:text-2xl font-black text-rose-500 font-mono">{{ clinicService.kpiSummary().criticalCases }}</span>
              <span class="text-xs text-muted">pacientes</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">
              {{ clinicService.kpiSummary().highRiskNews2Count }} con NEWS2 Crítico (≥ 7)
            </span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-surface-high border border-outline-sub text-rose-500 grid place-items-center">
            <span class="material-symbols-rounded text-lg">emergency</span>
          </div>
        </div>

        <!-- KPI 2: Casos Urgentes (N3) -->
        <div class="p-2.5 rounded-2xl bg-surface-box border border-outline-sub flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-amber-500 uppercase tracking-wider block">Casos Urgentes N3</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-xl sm:text-2xl font-black text-main font-mono">{{ clinicService.kpiSummary().urgentCases }}</span>
              <span class="text-xs text-muted">pacientes</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">Ventana de atención: ≤ 60 min</span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-surface-high border border-outline-sub text-amber-500 grid place-items-center">
            <span class="material-symbols-rounded text-lg">warning</span>
          </div>
        </div>

        <!-- KPI 3: Espera Promedio -->
        <div class="p-2.5 rounded-2xl bg-surface-box border border-outline-sub flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-muted uppercase tracking-wider block">Espera Promedio</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-xl sm:text-2xl font-black text-main font-mono">{{ clinicService.kpiSummary().avgWaitMinutes }}</span>
              <span class="text-xs text-muted">minutos</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">Meta asistencial: &lt; 30 min</span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-surface-high border border-outline-sub text-primary grid place-items-center">
            <span class="material-symbols-rounded text-lg">timer</span>
          </div>
        </div>

        <!-- KPI 4: Ocupación de Camas -->
        <div class="p-2.5 rounded-2xl bg-surface-box border border-outline-sub flex items-center justify-between">
          <div>
            <span class="text-[11px] font-semibold text-muted uppercase tracking-wider block">Ocupación de Camas</span>
            <div class="flex items-baseline gap-1.5 mt-0.5">
              <span class="text-xl sm:text-2xl font-black text-main font-mono">{{ clinicService.kpiSummary().occupiedBeds }}/{{ clinicService.kpiSummary().totalBeds }}</span>
              <span class="text-xs font-bold text-muted">({{ clinicService.kpiSummary().bedOccupancyPercent }}%)</span>
            </div>
            <span class="text-[10px] text-muted block mt-0.5">Shock Trauma: {{ clinicService.kpiSummary().shockTraumaOccupancy }} ocupadas</span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-surface-high border border-outline-sub text-muted grid place-items-center">
            <span class="material-symbols-rounded text-lg">bed</span>
          </div>
        </div>

      </section>

      <!-- =====================================================================
           3. MAIN ASYMMETRIC BENTO GRID (Left: 7 Cols, Right: 5 Cols)
           ===================================================================== -->
      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden">
        
        <!-- ===================================================================
             COLUMNA IZQUIERDA: COLA ACTIVA DE TRIAJE (7 / 12)
             =================================================================== -->
        <section class="lg:col-span-7 flex flex-col min-h-0 rounded-2xl bg-surface-box border border-outline-sub overflow-hidden shadow-xs">
          
          <!-- Triage Filter Bar -->
          <div class="p-2 border-b border-outline-sub shrink-0 flex items-center justify-between gap-1.5 overflow-x-auto bg-surface-low">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="font-bold text-main px-1 text-xs shrink-0 flex items-center gap-1">
                <span class="material-symbols-rounded text-sm text-primary">format_list_bulleted</span>
                <span>Pacientes ({{ clinicService.filteredPatients().length }})</span>
              </span>

              <!-- Filter Chips (Subtle & Clean) -->
              <button
                type="button"
                (click)="clinicService.setFilter('all')"
                [class.bg-surface-highest]="clinicService.activeFilter() === 'all'"
                [class.font-bold]="clinicService.activeFilter() === 'all'"
                class="px-2.5 py-1 rounded-full text-xs text-muted hover:text-main cursor-pointer transition-all">
                Todos
              </button>
              
              <button
                type="button"
                (click)="clinicService.setFilter('critical')"
                [class.bg-surface-highest]="clinicService.activeFilter() === 'critical'"
                [class.text-rose-500]="clinicService.activeFilter() === 'critical'"
                [class.font-bold]="clinicService.activeFilter() === 'critical'"
                class="px-2.5 py-1 rounded-full text-xs text-muted hover:text-main cursor-pointer transition-all">
                Críticos (N1/N2)
              </button>

              <button
                type="button"
                (click)="clinicService.setFilter('urgent')"
                [class.bg-surface-highest]="clinicService.activeFilter() === 'urgent'"
                [class.text-amber-500]="clinicService.activeFilter() === 'urgent'"
                [class.font-bold]="clinicService.activeFilter() === 'urgent'"
                class="px-2.5 py-1 rounded-full text-xs text-muted hover:text-main cursor-pointer transition-all">
                Urgentes (N3)
              </button>

              <button
                type="button"
                (click)="clinicService.setFilter('standard')"
                [class.bg-surface-highest]="clinicService.activeFilter() === 'standard'"
                [class.text-emerald-500]="clinicService.activeFilter() === 'standard'"
                [class.font-bold]="clinicService.activeFilter() === 'standard'"
                class="px-2.5 py-1 rounded-full text-xs text-muted hover:text-main cursor-pointer transition-all">
                Menores (N4/N5)
              </button>

              <button
                type="button"
                (click)="clinicService.setFilter('waiting')"
                [class.bg-surface-highest]="clinicService.activeFilter() === 'waiting'"
                [class.font-bold]="clinicService.activeFilter() === 'waiting'"
                class="px-2.5 py-1 rounded-full text-xs text-muted hover:text-main cursor-pointer transition-all">
                En Espera
              </button>
            </div>
          </div>

          <!-- Patients List Scroll Area (Calm, 90/10 Color Discipline) -->
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            @for (patient of clinicService.filteredPatients(); track patient.id) {
              <div
                (click)="onSelectPatient(patient)"
                [class]="getPatientCardBorderClass(patient)"
                class="p-2.5 rounded-xl border border-outline-sub hover:border-outline cursor-pointer transition-all duration-150 relative bg-surface-high/60">

                <!-- Subtle Emergency Protocol Indicator (No Pink Flash Flood) -->
                @if (patient.activeCode) {
                  <div class="mb-2 px-2.5 py-1.5 rounded-lg bg-surface-highest border border-outline-sub flex items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                      <span class="font-bold text-main truncate">{{ patient.activeCode.title }}</span>
                      <span class="text-[11px] text-muted truncate">• {{ patient.activeCode.windowLabel }}</span>
                    </div>
                    <div class="shrink-0 flex items-center gap-1 font-mono font-bold text-[11px] text-rose-500">
                      <span class="material-symbols-rounded text-xs">timer</span>
                      <span>{{ patient.activeCode.remainingMinutes }} min restantes</span>
                    </div>
                  </div>
                }

                <!-- Patient Top Line: Quiet Manchester Label + Ticket + Name + NEWS2 -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0 flex-wrap">
                    
                    <!-- Quiet Manchester Text Tag (No heavy saturated block) -->
                    <span [class]="getTriageTextClass(patient.triageLevel)" class="text-[11px] font-black uppercase tracking-wider">
                      {{ getTriageBadgeLabel(patient.triageLevel) }}
                    </span>

                    <span class="font-mono font-bold text-xs text-muted">{{ patient.ticketCode }}</span>
                    <span class="font-bold text-xs sm:text-sm text-main truncate">{{ patient.fullName }}</span>
                    <span class="text-[11px] text-muted">({{ patient.age }}a • {{ patient.gender }})</span>

                    <!-- NEWS2 Score Badge (Monochrome with subtle border) -->
                    <span
                      [class]="getNews2PillClass(patient.news2.riskLevel)"
                      class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                      NEWS2: {{ patient.news2.score }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0 text-xs">
                    <span class="text-muted font-mono text-[11px]">{{ patient.admissionTime }}</span>
                    <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-surface-highest text-muted border border-outline-sub/40">
                      {{ patient.waitingMinutes }} min
                    </span>
                  </div>
                </div>

                <!-- Chief Complaint -->
                <p class="text-xs text-main mt-1 leading-snug font-normal">
                  {{ patient.chiefComplaint }}
                </p>

                <!-- Vitals Row: Monochrome by default, alert only on threshold deviation -->
                <div class="flex items-center gap-1.5 flex-wrap mt-2 pt-1.5 border-t border-outline-sub/40 text-[11px]">
                  
                  <!-- Heart Rate -->
                  <div class="px-2 py-0.5 rounded-md bg-surface-highest border border-outline-sub/30 flex items-center gap-1 font-mono text-[11px]">
                    <span class="material-symbols-rounded text-xs" [class.text-rose-500]="patient.vitals.heartRate > 100 || patient.vitals.heartRate < 50" [class.text-muted]="!(patient.vitals.heartRate > 100 || patient.vitals.heartRate < 50)">favorite</span>
                    <span [class.text-rose-500]="patient.vitals.heartRate > 100 || patient.vitals.heartRate < 50" [class.font-bold]="patient.vitals.heartRate > 100 || patient.vitals.heartRate < 50">{{ patient.vitals.heartRate }} bpm</span>
                  </div>

                  <!-- Blood Pressure -->
                  <div class="px-2 py-0.5 rounded-md bg-surface-highest border border-outline-sub/30 flex items-center gap-1 font-mono text-[11px]">
                    <span class="material-symbols-rounded text-xs" [class.text-amber-500]="patient.vitals.bloodPressureSys > 140 || patient.vitals.bloodPressureSys < 90" [class.text-muted]="!(patient.vitals.bloodPressureSys > 140 || patient.vitals.bloodPressureSys < 90)">speed</span>
                    <span [class.text-amber-500]="patient.vitals.bloodPressureSys > 140 || patient.vitals.bloodPressureSys < 90" [class.font-bold]="patient.vitals.bloodPressureSys > 140 || patient.vitals.bloodPressureSys < 90">{{ patient.vitals.bloodPressureSys }}/{{ patient.vitals.bloodPressureDia }}</span>
                  </div>

                  <!-- SpO2 -->
                  <div class="px-2 py-0.5 rounded-md bg-surface-highest border border-outline-sub/30 flex items-center gap-1 font-mono text-[11px]">
                    <span class="material-symbols-rounded text-xs" [class.text-rose-500]="patient.vitals.oxygenSat < 94" [class.text-muted]="patient.vitals.oxygenSat >= 94">air</span>
                    <span [class.text-rose-500]="patient.vitals.oxygenSat < 94" [class.font-bold]="patient.vitals.oxygenSat < 94">{{ patient.vitals.oxygenSat }}% SpO2</span>
                  </div>

                  <!-- Temp -->
                  <div class="px-2 py-0.5 rounded-md bg-surface-highest border border-outline-sub/30 flex items-center gap-1 font-mono text-[11px]">
                    <span class="material-symbols-rounded text-xs" [class.text-amber-500]="patient.vitals.temperature >= 38.0 || patient.vitals.temperature <= 35.5" [class.text-muted]="!(patient.vitals.temperature >= 38.0 || patient.vitals.temperature <= 35.5)">device_thermostat</span>
                    <span [class.text-amber-500]="patient.vitals.temperature >= 38.0 || patient.vitals.temperature <= 35.5" [class.font-bold]="patient.vitals.temperature >= 38.0 || patient.vitals.temperature <= 35.5">{{ patient.vitals.temperature }}°C</span>
                  </div>

                  <!-- EVA Pain -->
                  <div class="px-2 py-0.5 rounded-md bg-surface-highest border border-outline-sub/30 text-muted flex items-center gap-1 font-mono text-[11px]">
                    <span>EVA {{ patient.vitals.painScale }}/10</span>
                  </div>

                  <!-- Bed Tag (Clean & Neutral) -->
                  <div class="ml-auto flex items-center gap-1">
                    @if (patient.bedAssignedId) {
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-surface-highest text-main border border-outline-sub flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-muted">bed</span>
                        <span>{{ patient.bedAssignedId }}</span>
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium text-amber-500 border border-amber-500/20 bg-surface-highest">
                        Sin Cama
                      </span>
                    }
                  </div>
                </div>

                <!-- Emergency Action & Contextual Controls (No Rainbow Skittles) -->
                <div class="flex items-center justify-between mt-2 pt-1.5 border-t border-outline-sub/30 text-xs">
                  
                  <!-- Left: Direct Action or Clean Reclassify Trigger -->
                  @if (!patient.bedAssignedId && (patient.triageLevel === 'resuscitation' || patient.triageLevel === 'emergency' || patient.news2.riskLevel === 'high')) {
                    <button
                      type="button"
                      (click)="onImmediateShockTrauma(patient.id, $event)"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-xs cursor-pointer transition-colors">
                      <span class="material-symbols-rounded text-xs">bolt</span>
                      <span>Asignar Shock Trauma Inmediato</span>
                    </button>
                  } @else {
                    <!-- Contextual Reclassification (Replaces 4 screaming dots) -->
                    <div class="relative">
                      @if (activeRetriageId() === patient.id) {
                        <div class="flex items-center gap-1 bg-surface-box p-1 rounded-lg border border-outline-sub">
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'resuscitation', $event)"
                            class="px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-500 hover:bg-surface-highest">
                            N1
                          </button>
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'emergency', $event)"
                            class="px-1.5 py-0.5 rounded text-[10px] font-bold text-orange-500 hover:bg-surface-highest">
                            N2
                          </button>
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'urgent', $event)"
                            class="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-500 hover:bg-surface-highest">
                            N3
                          </button>
                          <button
                            type="button"
                            (click)="applyRetriage(patient.id, 'standard', $event)"
                            class="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-500 hover:bg-surface-highest">
                            N4
                          </button>
                          <button
                            type="button"
                            (click)="activeRetriageId.set(null)"
                            class="material-symbols-rounded text-xs text-muted hover:text-main ml-1">
                            close
                          </button>
                        </div>
                      } @else {
                        <button
                          type="button"
                          (click)="toggleRetriage(patient.id, $event)"
                          class="px-2 py-0.5 rounded text-[11px] text-muted hover:text-main hover:bg-surface-highest border border-outline-sub/30 flex items-center gap-1 cursor-pointer transition-colors">
                          <span>Reclasificar</span>
                          <span class="material-symbols-rounded text-xs">expand_more</span>
                        </button>
                      }
                    </div>
                  }

                  <!-- Right: Bed Assignment / Discharge -->
                  <div class="flex items-center gap-1.5">
                    @if (!patient.bedAssignedId) {
                      <button
                        type="button"
                        (click)="openBedAssignment(patient, $event)"
                        class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-highest hover:bg-surface-box text-main border border-outline-sub cursor-pointer transition-colors">
                        Asignar Cama
                      </button>
                    }
                    <button
                      type="button"
                      (click)="onDischarge(patient.id, $event)"
                      class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-highest hover:bg-surface-box text-muted hover:text-main border border-outline-sub cursor-pointer transition-colors">
                      Alta Médica
                    </button>
                  </div>
                </div>

              </div>
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
        <section class="lg:col-span-5 flex flex-col min-h-0 rounded-2xl bg-surface-box border border-outline-sub overflow-hidden shadow-xs">
          
          <!-- Segmented Tab Header -->
          <div class="p-2 border-b border-outline-sub shrink-0 flex items-center justify-between gap-1 bg-surface-low">
            <div class="p-1 rounded-xl bg-surface-box border border-outline-sub flex items-center gap-1 w-full">
              <button
                type="button"
                (click)="activeTab.set('beds')"
                [class.bg-primary]="activeTab() === 'beds'"
                [class.text-on-primary]="activeTab() === 'beds'"
                [class.font-bold]="activeTab() === 'beds'"
                [class.text-muted]="activeTab() !== 'beds'"
                class="flex-1 py-1 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span class="material-symbols-rounded text-sm">bed</span>
                <span>Camas</span>
              </button>

              <button
                type="button"
                (click)="activeTab.set('detail')"
                [class.bg-primary]="activeTab() === 'detail'"
                [class.text-on-primary]="activeTab() === 'detail'"
                [class.font-bold]="activeTab() === 'detail'"
                [class.text-muted]="activeTab() !== 'detail'"
                class="flex-1 py-1 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span class="material-symbols-rounded text-sm">clinical_notes</span>
                <span>Ficha & NEWS2</span>
              </button>

              <button
                type="button"
                (click)="activeTab.set('admit')"
                [class.bg-primary]="activeTab() === 'admit'"
                [class.text-on-primary]="activeTab() === 'admit'"
                [class.font-bold]="activeTab() === 'admit'"
                [class.text-muted]="activeTab() !== 'admit'"
                class="flex-1 py-1 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span class="material-symbols-rounded text-sm">add</span>
                <span>Admisión</span>
              </button>
            </div>
          </div>

          <!-- TAB 1: MATRIZ DE CAMAS CRÍTICAS (Subtle & Dignified) -->
          @if (activeTab() === 'beds') {
            <div class="flex-1 overflow-y-auto p-2.5 space-y-2.5">
              
              <!-- Shock Trauma Unit -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Shock Trauma Bay</span>
                  </span>
                  <span class="text-[10px] text-muted font-mono">Alta Complejidad</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (bed of shockTraumaBeds(); track bed.id) {
                    <div
                      class="p-2.5 rounded-xl border border-outline-sub bg-surface-high/60 transition-all text-xs flex flex-col justify-between">
                      <div>
                        <div class="flex items-center justify-between">
                          <span class="font-mono font-bold text-sm text-main">{{ bed.id }}</span>
                          
                          <!-- Calm 6px Status Dot (No Neon Badges) -->
                          <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full" [class]="getBedDotClass(bed.status)"></span>
                            <span class="text-[10px] font-medium text-muted uppercase">
                              {{ getBedStatusLabel(bed.status) }}
                            </span>
                          </div>
                        </div>
                        <p class="font-semibold text-main mt-1 truncate">{{ bed.patientName ?? 'Disponible' }}</p>
                        <p class="text-[10px] text-muted truncate mt-0.5">{{ bed.equipment.join(' • ') }}</p>
                      </div>

                      <div class="mt-2 pt-2 border-t border-outline-sub/30 flex items-center justify-between">
                        @if (bed.status === 'available' && clinicService.selectedPatient() && !clinicService.selectedPatient()?.bedAssignedId) {
                          <button
                            type="button"
                            (click)="clinicService.assignBed(clinicService.selectedPatient()!.id, bed.id)"
                            class="w-full py-1 rounded-md text-[11px] font-bold bg-primary text-on-primary hover:opacity-90 cursor-pointer">
                            Asignar Paciente
                          </button>
                        } @else if (bed.status === 'cleaning') {
                          <button
                            type="button"
                            (click)="clinicService.setBedStatus(bed.id, 'available')"
                            class="w-full py-1 rounded-md text-[11px] font-medium bg-surface-highest hover:bg-surface-box text-main border border-outline-sub cursor-pointer">
                            Habilitar Cama
                          </button>
                        } @else if (bed.status === 'occupied') {
                          <button
                            type="button"
                            (click)="clinicService.setBedStatus(bed.id, 'cleaning')"
                            class="w-full py-1 rounded-md text-[10px] font-medium bg-surface-highest text-muted hover:text-main border border-outline-sub cursor-pointer">
                            Liberar para Limpieza
                          </button>
                        } @else {
                          <span class="text-[10px] text-muted italic">Lista para ingreso</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Observación Rápida -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    <span>Observación Rápida</span>
                  </span>
                  <span class="text-[10px] text-muted font-mono">4 Camas</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  @for (bed of observationBeds(); track bed.id) {
                    <div
                      class="p-2.5 rounded-xl border border-outline-sub bg-surface-high/60 transition-all text-xs flex flex-col justify-between">
                      <div>
                        <div class="flex items-center justify-between">
                          <span class="font-mono font-bold text-xs text-main">{{ bed.id }}</span>
                          <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full" [class]="getBedDotClass(bed.status)"></span>
                            <span class="text-[10px] text-muted uppercase">
                              {{ getBedStatusLabel(bed.status) }}
                            </span>
                          </div>
                        </div>
                        <p class="font-semibold text-main mt-1 truncate">{{ bed.patientName ?? 'Disponible' }}</p>
                      </div>

                      <div class="mt-2 pt-2 border-t border-outline-sub/30">
                        @if (bed.status === 'available' && clinicService.selectedPatient() && !clinicService.selectedPatient()?.bedAssignedId) {
                          <button
                            type="button"
                            (click)="clinicService.assignBed(clinicService.selectedPatient()!.id, bed.id)"
                            class="w-full py-1 rounded-md text-[10px] font-bold bg-primary text-on-primary hover:opacity-90 cursor-pointer">
                            Asignar
                          </button>
                        } @else if (bed.status === 'cleaning') {
                          <button
                            type="button"
                            (click)="clinicService.setBedStatus(bed.id, 'available')"
                            class="w-full py-1 rounded-md text-[10px] font-medium bg-surface-highest text-main border border-outline-sub cursor-pointer">
                            Habilitar
                          </button>
                        } @else {
                          <span class="text-[10px] text-muted">
                            {{ bed.status === 'occupied' ? 'Ocupada' : 'Disponible' }}
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Procedimientos & Sutura -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-bold text-main uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-muted"></span>
                    <span>Sala de Procedimientos</span>
                  </span>
                  <span class="text-[10px] text-muted font-mono">2 Box</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  @for (bed of procedureBeds(); track bed.id) {
                    <div
                      class="p-2.5 rounded-xl border border-outline-sub bg-surface-high/60 transition-all text-xs flex flex-col justify-between">
                      <div>
                        <div class="flex items-center justify-between">
                          <span class="font-mono font-bold text-xs text-main">{{ bed.id }}</span>
                          <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full" [class]="getBedDotClass(bed.status)"></span>
                            <span class="text-[10px] text-muted uppercase">
                              {{ getBedStatusLabel(bed.status) }}
                            </span>
                          </div>
                        </div>
                        <p class="font-semibold text-main mt-1 truncate">{{ bed.patientName ?? 'Disponible' }}</p>
                      </div>

                      <div class="mt-2 pt-2 border-t border-outline-sub/30">
                        @if (bed.status === 'available' && clinicService.selectedPatient() && !clinicService.selectedPatient()?.bedAssignedId) {
                          <button
                            type="button"
                            (click)="clinicService.assignBed(clinicService.selectedPatient()!.id, bed.id)"
                            class="w-full py-1 rounded-md text-[10px] font-bold bg-primary text-on-primary hover:opacity-90 cursor-pointer">
                            Asignar
                          </button>
                        } @else if (bed.status === 'cleaning') {
                          <button
                            type="button"
                            (click)="clinicService.setBedStatus(bed.id, 'available')"
                            class="w-full py-1 rounded-md text-[10px] font-medium bg-surface-highest text-main border border-outline-sub cursor-pointer">
                            Habilitar
                          </button>
                        } @else {
                          <span class="text-[10px] text-muted">Box habilitado</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

            </div>
          }

          <!-- TAB 2: DETALLE DE FICHA MÉDICA & SOPORTE A LA DECISIÓN CLÍNICA -->
          @if (activeTab() === 'detail') {
            @if (clinicService.selectedPatient(); as patient) {
              <div class="flex-1 overflow-y-auto p-3 space-y-2.5">
                
                <!-- Active Emergency Code Hero Alert -->
                @if (patient.activeCode) {
                  <div class="p-3 rounded-xl bg-surface-high border-l-4 border-l-rose-500 border border-outline-sub text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-black text-main flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>{{ patient.activeCode.title }}</span>
                      </span>
                      <span class="font-mono font-bold text-rose-500 text-xs">
                        {{ patient.activeCode.remainingMinutes }} min restantes
                      </span>
                    </div>

                    <p class="text-xs text-muted font-normal mt-1">
                      {{ patient.activeCode.protocolAction }}
                    </p>

                    <!-- Therapeutic Window Progress Track -->
                    <div class="mt-2">
                      <div class="flex justify-between text-[10px] text-muted mb-1 font-mono">
                        <span>Transcurrido: {{ patient.activeCode.elapsedMinutes }} min</span>
                        <span>Meta: ≤ {{ patient.activeCode.targetMinutes }} min</span>
                      </div>
                      <div class="w-full h-1.5 rounded-full bg-surface-highest overflow-hidden">
                        <div
                          class="h-full bg-rose-500 rounded-full transition-all duration-300"
                          [style.width.%]="(patient.activeCode.elapsedMinutes / patient.activeCode.targetMinutes) * 100">
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Patient Header Card -->
                <div class="p-3 rounded-xl bg-surface-high border border-outline-sub">
                  <div class="flex items-center justify-between">
                    <span [class]="getTriageTextClass(patient.triageLevel)" class="text-xs font-black uppercase">
                      {{ getTriageBadgeLabel(patient.triageLevel) }}
                    </span>
                    <span class="font-mono font-bold text-xs text-muted">Ingreso: {{ patient.admissionTime }} ({{ patient.waitingMinutes }} min)</span>
                  </div>

                  <h3 class="text-base font-black text-main mt-1">{{ patient.fullName }}</h3>
                  <p class="text-xs text-muted">{{ patient.ticketCode }} • {{ patient.age }} años • Sexo {{ patient.gender }}</p>

                  <div class="mt-2 pt-2 border-t border-outline-sub/50">
                    <span class="text-[10px] font-bold text-muted uppercase block">Motivo de Consulta Principal:</span>
                    <p class="text-xs text-main mt-0.5">{{ patient.chiefComplaint }}</p>
                  </div>
                </div>

                <!-- National Early Warning Score 2 (NEWS2) Analysis -->
                <div class="p-3 rounded-xl bg-surface-low border border-outline-sub text-xs">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="font-bold text-main flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-sm text-primary">analytics</span>
                      <span>Índice Clínico NEWS2</span>
                    </span>
                    <span class="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-surface-highest text-main border border-outline-sub" [class.text-rose-500]="patient.news2.riskLevel === 'high'">
                      Score: {{ patient.news2.score }} / 20
                    </span>
                  </div>

                  <p class="text-xs text-muted mt-1">{{ patient.news2.recommendation }}</p>

                  @if (patient.news2.triggers.length > 0) {
                    <div class="mt-2 pt-2 border-t border-outline-sub/40">
                      <span class="text-[10px] font-bold text-rose-500 uppercase block mb-1">Criterios de Alerta Detectados:</span>
                      <ul class="space-y-0.5">
                        @for (trigger of patient.news2.triggers; track trigger) {
                          <li class="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                            <span class="material-symbols-rounded text-xs">warning</span>
                            <span>{{ trigger }}</span>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </div>

                <!-- Signos Vitales con Rangos Fisiológicos -->
                <div class="p-3 rounded-xl bg-surface-low border border-outline-sub">
                  <span class="text-xs font-bold text-main uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <span class="material-symbols-rounded text-sm text-primary">vital_signs</span>
                    <span>Signos Vitales y Rangos</span>
                  </span>

                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="p-2 rounded-lg bg-surface-box border border-outline-sub">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Frecuencia Cardíaca</span>
                        <span>60 - 100 bpm</span>
                      </div>
                      <span class="text-base font-mono font-bold text-main block mt-0.5">{{ patient.vitals.heartRate }} bpm</span>
                    </div>

                    <div class="p-2 rounded-lg bg-surface-box border border-outline-sub">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Presión Arterial</span>
                        <span>120 / 80</span>
                      </div>
                      <span class="text-base font-mono font-bold text-main block mt-0.5">{{ patient.vitals.bloodPressureSys }}/{{ patient.vitals.bloodPressureDia }}</span>
                    </div>

                    <div class="p-2 rounded-lg bg-surface-box border border-outline-sub">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Saturación SpO2</span>
                        <span>≥ 95%</span>
                      </div>
                      <span class="text-base font-mono font-bold text-main block mt-0.5">{{ patient.vitals.oxygenSat }}%</span>
                    </div>

                    <div class="p-2 rounded-lg bg-surface-box border border-outline-sub">
                      <div class="flex justify-between items-center text-[10px] text-muted">
                        <span>Temperatura</span>
                        <span>36.5 - 37.5°C</span>
                      </div>
                      <span class="text-base font-mono font-bold text-main block mt-0.5">{{ patient.vitals.temperature }}°C</span>
                    </div>
                  </div>

                  <div class="mt-2 p-2 rounded-lg bg-surface-box border border-outline-sub flex items-center justify-between text-xs">
                    <span class="text-[10px] text-muted">Escala de Dolor (EVA):</span>
                    <span class="font-mono font-bold text-main">{{ patient.vitals.painScale }} / 10</span>
                  </div>
                </div>

                <!-- Alergias & Notas -->
                <div class="p-3 rounded-xl bg-surface-low border border-outline-sub space-y-2 text-xs">
                  <div>
                    <span class="text-[10px] font-bold text-muted uppercase block mb-1">Alergias Documentadas:</span>
                    @if (patient.allergies && patient.allergies.length > 0) {
                      <div class="flex items-center gap-1 flex-wrap">
                        @for (allergy of patient.allergies; track allergy) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-highest text-main border border-outline-sub">
                            {{ allergy }}
                          </span>
                        }
                      </div>
                    } @else {
                      <span class="text-muted italic">Sin alergias conocidas reportadas.</span>
                    }
                  </div>

                  @if (patient.notes) {
                    <div class="pt-2 border-t border-outline-sub/40">
                      <span class="text-[10px] font-bold text-muted uppercase block">Evolución / Indicaciones Clínicas:</span>
                      <p class="text-xs text-muted mt-0.5 italic">{{ patient.notes }}</p>
                    </div>
                  }
                </div>

                <!-- Patient Actions CTA -->
                <div class="flex items-center gap-2 pt-1">
                  @if (!patient.bedAssignedId) {
                    <button
                      type="button"
                      (click)="onImmediateShockTrauma(patient.id)"
                      class="flex-1 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-colors">
                      ⚡ Asignar a Shock Trauma Inmediato
                    </button>
                  } @else {
                    <button
                      type="button"
                      (click)="activeTab.set('beds')"
                      class="flex-1 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:opacity-90 cursor-pointer shadow-xs">
                      Cambiar Cama
                    </button>
                  }

                  <button
                    type="button"
                    (click)="onDischarge(patient.id)"
                    class="py-2 px-3 rounded-xl text-xs font-bold bg-surface-high hover:bg-surface-highest text-main border border-outline-sub cursor-pointer">
                    Alta Médica
                  </button>
                </div>

              </div>
            } @else {
              <div class="h-48 grid place-items-center text-center p-6 text-muted">
                <div>
                  <span class="material-symbols-rounded text-3xl mb-1 text-muted">person_search</span>
                  <p class="text-xs font-semibold">Selecciona un paciente para ver su ficha clínica y NEWS2</p>
                </div>
              </div>
            }
          }

          <!-- TAB 3: ADMISIÓN RÁPIDA DE EMERGENCIA -->
          @if (activeTab() === 'admit') {
            <div class="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              
              <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                <span class="font-bold text-main">Ingreso Rápido a Triaje</span>
                <span class="text-[10px] text-muted">MTS Protocol</span>
              </div>

              <!-- Full Name -->
              <div>
                <label class="block text-[11px] font-semibold text-muted mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  [(ngModel)]="newPatientName"
                  placeholder="Ej: Marcelo Quiroga"
                  class="w-full px-3 py-1.5 rounded-lg bg-surface-high border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:border-primary"
                />
              </div>

              <!-- Age & Gender -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] font-semibold text-muted mb-1">Edad (años):</label>
                  <input
                    type="number"
                    [(ngModel)]="newPatientAge"
                    placeholder="42"
                    class="w-full px-3 py-1.5 rounded-lg bg-surface-high border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-muted mb-1">Sexo:</label>
                  <select
                    [(ngModel)]="newPatientGender"
                    class="w-full px-2.5 py-1.5 rounded-lg bg-surface-high border border-outline-sub text-main focus:outline-none focus:border-primary">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Other">Otro</option>
                  </select>
                </div>
              </div>

              <!-- Manchester Triage Level -->
              <div>
                <label class="block text-[11px] font-semibold text-muted mb-1">Prioridad Manchester:</label>
                <div class="grid grid-cols-5 gap-1">
                  <button
                    type="button"
                    (click)="newPatientLevel = 'resuscitation'"
                    [class.ring-2]="newPatientLevel === 'resuscitation'"
                    class="py-1 rounded-md text-[10px] font-bold text-rose-500 bg-surface-high border border-outline-sub cursor-pointer ring-rose-400">
                    N1
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'emergency'"
                    [class.ring-2]="newPatientLevel === 'emergency'"
                    class="py-1 rounded-md text-[10px] font-bold text-orange-500 bg-surface-high border border-outline-sub cursor-pointer ring-orange-400">
                    N2
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'urgent'"
                    [class.ring-2]="newPatientLevel === 'urgent'"
                    class="py-1 rounded-md text-[10px] font-bold text-amber-500 bg-surface-high border border-outline-sub cursor-pointer ring-amber-300">
                    N3
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'standard'"
                    [class.ring-2]="newPatientLevel === 'standard'"
                    class="py-1 rounded-md text-[10px] font-bold text-emerald-500 bg-surface-high border border-outline-sub cursor-pointer ring-emerald-400">
                    N4
                  </button>
                  <button
                    type="button"
                    (click)="newPatientLevel = 'non_urgent'"
                    [class.ring-2]="newPatientLevel === 'non_urgent'"
                    class="py-1 rounded-md text-[10px] font-bold text-sky-500 bg-surface-high border border-outline-sub cursor-pointer ring-sky-400">
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
                  class="w-full px-3 py-1.5 rounded-lg bg-surface-high border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:border-primary resize-none">
                </textarea>
              </div>

              <!-- Quick Vitals Inputs -->
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-semibold text-muted mb-0.5">FC (bpm):</label>
                  <input type="number" [(ngModel)]="newVitalsHR" class="w-full px-2 py-1 rounded-md bg-surface-high border border-outline-sub text-main" />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-muted mb-0.5">PA Sistólica:</label>
                  <input type="number" [(ngModel)]="newVitalsSys" class="w-full px-2 py-1 rounded-md bg-surface-high border border-outline-sub text-main" />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-muted mb-0.5">SpO2 (%):</label>
                  <input type="number" [(ngModel)]="newVitalsSpO2" class="w-full px-2 py-1 rounded-md bg-surface-high border border-outline-sub text-main" />
                </div>
              </div>

              <div class="pt-2">
                <button
                  type="button"
                  (click)="submitAdmission()"
                  [disabled]="!newPatientName.trim() || !newPatientComplaint.trim()"
                  class="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs">
                  Admitir Paciente a Triaje
                </button>
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
    const baseBorder = isSelected ? 'border-primary ring-1 ring-primary/40' : 'border-outline-sub';

    switch (patient.triageLevel) {
      case 'resuscitation':
        return `border-l-4 border-l-rose-500 ${baseBorder}`;
      case 'emergency':
        return `border-l-4 border-l-orange-500 ${baseBorder}`;
      case 'urgent':
        return `border-l-4 border-l-amber-400 ${baseBorder}`;
      case 'standard':
        return `border-l-4 border-l-emerald-600 ${baseBorder}`;
      case 'non_urgent':
        return `border-l-4 border-l-sky-600 ${baseBorder}`;
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
      return 'bg-surface-highest text-rose-500 border border-rose-500/40';
    }
    if (risk === 'medium') {
      return 'bg-surface-highest text-orange-500 border border-orange-500/30';
    }
    return 'bg-surface-highest text-muted border border-outline-sub/30';
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
