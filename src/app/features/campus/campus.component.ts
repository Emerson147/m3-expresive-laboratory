import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampusService } from '../../core/campus/campus.service';
import { ThemeService } from '../../core/theme/theme.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3LinearProgressComponent } from '../../shared/components/progress/linear-progress.component';
import { SubjectCategory } from '../../core/campus/campus.models';

@Component({
  selector: 'app-campus-page',
  standalone: true,
  imports: [
    CommonModule, 
    M3ButtonComponent, 
    M3LinearProgressComponent
  ],
  template: `
    <div class="h-full flex flex-col gap-3 min-h-0 overflow-hidden select-none">
      
      <!-- =====================================================================
           1. TOP HEADER & M3 EXPRESSIVE SEGMENTED ROLE SWITCHER
           ===================================================================== -->
      <header class="shrink-0 p-3 sm:p-3.5 rounded-3xl bg-surface-box border border-outline-sub shadow-xs flex items-center justify-between flex-wrap gap-2.5">
        
        <!-- Left: Branding & Period Tag -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-primary text-on-primary grid place-items-center shadow-xs shrink-0">
            <span class="material-symbols-rounded text-xl">school</span>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-black tracking-tight text-main truncate">Campus Académico</h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box uppercase tracking-wider font-mono">
                2026-II
              </span>
            </div>
            <p class="text-xs text-muted truncate">Gestión Curricular y Aprendizaje Multimodal M3</p>
          </div>
        </div>

        <!-- Center / Right: Role Switcher & Live Controls -->
        <div class="flex items-center gap-2">
          
          <!-- Segmented Pill Switcher (Estudiante / Docente) -->
          <div class="p-1 rounded-full bg-surface-low border border-outline-sub flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              (click)="campusService.switchRole('student')"
              [class.bg-primary]="campusService.currentRole() === 'student'"
              [class.text-on-primary]="campusService.currentRole() === 'student'"
              [class.shadow-xs]="campusService.currentRole() === 'student'"
              [class.font-bold]="campusService.currentRole() === 'student'"
              [class.text-muted]="campusService.currentRole() !== 'student'"
              class="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:text-main">
              <span class="material-symbols-rounded text-sm">school</span>
              <span>Estudiante</span>
            </button>

            <button
              type="button"
              (click)="campusService.switchRole('teacher')"
              [class.bg-primary]="campusService.currentRole() === 'teacher'"
              [class.text-on-primary]="campusService.currentRole() === 'teacher'"
              [class.shadow-xs]="campusService.currentRole() === 'teacher'"
              [class.font-bold]="campusService.currentRole() === 'teacher'"
              [class.text-muted]="campusService.currentRole() !== 'teacher'"
              class="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:text-main">
              <span class="material-symbols-rounded text-sm">co_present</span>
              <span>Docente</span>
            </button>
          </div>

          <!-- Campus Connection State -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-low border border-outline-sub text-xs font-mono font-medium text-muted">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Sincronizado</span>
          </div>

          <!-- Theme Dark/Light Mode Toggle -->
          <button
            type="button"
            (click)="themeService.toggleThemeMode($event)"
            title="Alternar Modo Oscuro / Claro"
            class="w-8 h-8 rounded-full bg-surface-low hover:bg-surface-high border border-outline-sub grid place-items-center text-main transition-colors cursor-pointer">
            <span class="material-symbols-rounded text-base">
              {{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
        </div>
      </header>

      <!-- =====================================================================
           2. VISTA ESTUDIANTE (MINIMALISMO ZEN M3 EXPRESSIVE)
           ===================================================================== -->
      @if (campusService.currentRole() === 'student') {
        <main class="flex-1 min-h-0 overflow-y-auto m3-scrollbar flex flex-col gap-3 pr-1">
          
          <!-- 2.1 HERO CARD: CLASE EN CURSO AHORA (ÚNICO PUNTO FOCAL) -->
          @if (campusService.activeClass(); as activeCls) {
            <section class="p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub relative overflow-hidden group shadow-xs hover:border-primary/40 transition-all">
              
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                <div class="space-y-1.5 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Sesión en curso
                    </span>
                    <span class="text-[11px] font-mono font-bold text-muted bg-surface-low px-2 py-0.5 rounded-full border border-outline-sub">
                      {{ activeCls.code }}
                    </span>
                  </div>

                  <h2 class="text-xl sm:text-2xl font-black text-main tracking-tight truncate">
                    {{ activeCls.subject }}
                  </h2>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span class="flex items-center gap-1 font-medium text-main">
                      <span class="material-symbols-rounded text-base text-primary">meeting_room</span>
                      {{ activeCls.room }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-rounded text-base text-primary">person</span>
                      {{ activeCls.teacherName }}
                    </span>
                    <span class="flex items-center gap-1 font-mono font-semibold">
                      <span class="material-symbols-rounded text-base text-primary">schedule</span>
                      {{ activeCls.timeRange }}
                    </span>
                  </div>
                </div>

                <!-- Session Progress & Direct Entrance -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
                  <div class="w-full sm:w-40 space-y-1">
                    <div class="flex justify-between text-[11px] font-mono text-muted">
                      <span>Progreso sesión</span>
                      <span class="font-bold text-main">{{ activeCls.progressPercent }}%</span>
                    </div>
                    <m3-linear-progress [value]="activeCls.progressPercent" [wavy]="true" size="md" color="primary" />
                    <span class="text-[10px] text-muted block text-right font-mono">35m restantes</span>
                  </div>

                  <m3-button variant="filled" size="sm" icon="video_call">
                    Ingresar a Clase
                  </m3-button>
                </div>
              </div>
            </section>
          }

          <!-- 2.2 ASYMMETRIC BENTO GRID -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
            
            <!-- Bento Col 1: Horario de la Jornada (7 Cols) -->
            <section class="lg:col-span-7 p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub flex flex-col gap-3 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-lg text-primary">calendar_month</span>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-main">Horario de Hoy</h3>
                </div>
                <span class="text-[11px] font-mono text-muted bg-surface-low px-2 py-0.5 rounded-full border border-outline-sub">
                  Martes 27 Octubre
                </span>
              </div>

              <div class="flex flex-col gap-2">
                @for (cls of campusService.schedule(); track cls.id) {
                  <article 
                    class="p-3 rounded-2xl bg-surface-low border border-outline-sub hover:border-outline hover:-translate-y-0.5 transition-all flex items-center justify-between gap-3"
                    [class.ring-2]="cls.isActiveNow"
                    [class.ring-primary/40]="cls.isActiveNow"
                    [class.bg-primary/[0.03]]="cls.isActiveNow">
                    
                    <div class="flex items-center gap-3 min-w-0">
                      <div 
                        class="w-9 h-9 rounded-xl grid place-items-center shrink-0 shadow-2xs"
                        [ngClass]="getCategoryBadgeClass(cls.category)">
                        <span class="material-symbols-rounded text-lg">{{ getCategoryIcon(cls.category) }}</span>
                      </div>

                      <div class="min-w-0 space-y-0.5">
                        <div class="flex items-center gap-2">
                          <span class="text-xs sm:text-sm font-bold text-main truncate">{{ cls.subject }}</span>
                          <span class="text-[10px] font-mono text-muted px-1.5 py-0.2 rounded bg-surface-box border border-outline-sub">
                            {{ cls.code }}
                          </span>
                        </div>
                        <p class="text-xs text-muted truncate">{{ cls.room }} · {{ cls.teacherName }}</p>
                      </div>
                    </div>

                    <div class="text-right shrink-0">
                      <span class="text-xs font-mono font-bold text-main block">{{ cls.timeRange }}</span>
                      @if (cls.isActiveNow) {
                        <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-wide flex items-center justify-end gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          En curso
                        </span>
                      } @else {
                        <span class="text-[10px] text-muted">Próxima</span>
                      }
                    </div>
                  </article>
                }
              </div>
            </section>

            <!-- Bento Col 2: Rendimiento Curricular & Standing (5 Cols) -->
            @if (campusService.studentMetrics(); as metric) {
              <section class="lg:col-span-5 p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub flex flex-col justify-between gap-3 shadow-xs">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-lg text-primary">workspace_premium</span>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-main">Rendimiento Académico</h3>
                  </div>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">star</span>
                    {{ metric.classStanding }}
                  </span>
                </div>

                <!-- High-Impact Clean Metric Cards -->
                <div class="grid grid-cols-2 gap-2.5">
                  <div class="p-3.5 rounded-2xl bg-surface-low border border-outline-sub flex flex-col justify-between space-y-1">
                    <span class="text-xs font-medium text-muted">Promedio Ponderado</span>
                    <div class="flex items-baseline gap-1">
                      <span class="text-2xl sm:text-3xl font-black font-mono text-main">{{ metric.currentGpa }}</span>
                      <span class="text-xs text-muted font-mono">/ 20</span>
                    </div>
                    <span class="text-[10px] font-bold text-emerald-500 font-mono">Excelente</span>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-surface-low border border-outline-sub flex flex-col justify-between space-y-1">
                    <span class="text-xs font-medium text-muted">Asistencia Global</span>
                    <div class="flex items-baseline gap-0.5">
                      <span class="text-2xl sm:text-3xl font-black font-mono text-emerald-500">{{ metric.attendanceRate }}</span>
                      <span class="text-xs font-bold text-emerald-500 font-mono">%</span>
                    </div>
                    <span class="text-[10px] text-muted font-mono">Sin inasistencias críticas</span>
                  </div>
                </div>

                <!-- Career Credits Progression -->
                <div class="p-3 rounded-2xl bg-surface-low border border-outline-sub space-y-1.5">
                  <div class="flex justify-between text-xs">
                    <span class="text-muted font-medium">Créditos de Carrera</span>
                    <span class="font-mono font-bold text-main">{{ metric.approvedCredits }} / {{ metric.totalCredits }} (88.7%)</span>
                  </div>
                  <m3-linear-progress [value]="(metric.approvedCredits / metric.totalCredits) * 100" [wavy]="true" size="md" color="primary" />
                </div>
              </section>
            }

            <!-- Bento Col 3: Entregas y Rúbricas (7 Cols) -->
            <section class="lg:col-span-7 p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub flex flex-col gap-3 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-lg text-primary">assignment_turned_in</span>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-main">Entregas & Tareas</h3>
                </div>
                <span class="text-xs font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                  {{ campusService.pendingAssignmentsCount() }} pendientes
                </span>
              </div>

              <div class="flex flex-col gap-2">
                @for (asg of campusService.assignments(); track asg.id) {
                  <article 
                    class="p-3 rounded-2xl bg-surface-low border border-outline-sub flex items-center justify-between gap-3 transition-all"
                    [class.border-rose-500/40]="asg.urgency === 'urgent' && asg.submissionStatus === 'pending'"
                    [class.bg-rose-500/[0.02]]="asg.urgency === 'urgent' && asg.submissionStatus === 'pending'">
                    
                    <div class="min-w-0 space-y-0.5">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span 
                          class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0"
                          [ngClass]="asg.urgency === 'urgent' && asg.submissionStatus === 'pending' ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' : asg.urgency === 'graded' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-surface-box text-muted border border-outline-sub'">
                          {{ asg.dueDate }}
                        </span>
                        <span class="text-xs sm:text-sm font-bold text-main truncate">{{ asg.title }}</span>
                      </div>
                      <p class="text-xs text-muted">{{ asg.subject }}</p>
                    </div>

                    <div class="shrink-0">
                      @if (asg.submissionStatus === 'pending') {
                        <button
                          type="button"
                          (click)="campusService.submitAssignment(asg.id)"
                          class="btn-m3 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold cursor-pointer shadow-xs hover:opacity-90 flex items-center gap-1 active:scale-[0.98]">
                          <span class="material-symbols-rounded text-sm">upload_file</span>
                          <span>Entregar</span>
                        </button>
                      } @else if (asg.submissionStatus === 'submitted') {
                        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                          <span class="material-symbols-rounded text-sm">check_circle</span>
                          Enviado
                        </span>
                      } @else {
                        <span class="text-xs font-mono font-black text-primary px-2.5 py-1 rounded-full bg-primary-box text-on-primary-box shadow-2xs">
                          {{ asg.score }}
                        </span>
                      }
                    </div>
                  </article>
                }
              </div>
            </section>

            <!-- Bento Col 4: Avisos Oficiales del Campus (5 Cols) -->
            <section class="lg:col-span-5 p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub flex flex-col gap-3 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-lg text-primary">campaign</span>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-main">Avisos del Decanato</h3>
                </div>
                <span class="material-symbols-rounded text-base text-muted">notifications_active</span>
              </div>

              <div class="flex flex-col gap-2">
                @for (ann of campusService.announcements(); track ann.id) {
                  <article class="p-3 rounded-2xl bg-surface-low border border-outline-sub space-y-1">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-primary-box text-on-primary-box font-mono">
                        {{ ann.tag }}
                      </span>
                      <span class="text-[10px] text-muted font-mono">{{ ann.date }}</span>
                    </div>
                    <h4 class="text-xs font-bold text-main leading-snug">{{ ann.title }}</h4>
                    <p class="text-[11px] text-muted leading-relaxed line-clamp-2">{{ ann.summary }}</p>
                    <span class="text-[10px] font-medium text-muted/70 block pt-0.5">Por: {{ ann.publisher }}</span>
                  </article>
                }
              </div>
            </section>

          </div>

        </main>
      }

      <!-- =====================================================================
           3. VISTA DOCENTE (CONTROL DE CÁTEDRA & ASISTENCIA EN 2D COMPACTO)
           ===================================================================== -->
      @if (campusService.currentRole() === 'teacher') {
        <main class="flex-1 min-h-0 overflow-y-auto m3-scrollbar flex flex-col gap-3 pr-1">
          
          <!-- 3.1 HERO CARD: SESIÓN DOCENTE ACTIVA CON 4 MODULAR KPIS -->
          @if (campusService.teacherClass(); as tCls) {
            <section class="p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub shadow-xs space-y-3.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-on-primary shadow-2xs">
                      Cátedra Activa
                    </span>
                    <span class="text-xs font-mono font-semibold text-muted bg-surface-low px-2 py-0.5 rounded-full border border-outline-sub">
                      {{ tCls.timeRange }}
                    </span>
                  </div>
                  <h2 class="text-lg sm:text-xl font-black text-main tracking-tight truncate">{{ tCls.subject }}</h2>
                  <p class="text-xs text-muted">{{ tCls.room }}</p>
                </div>

                <!-- Bulk Action -->
                <div class="shrink-0">
                  <m3-button 
                    variant="tonal" 
                    size="sm" 
                    icon="done_all" 
                    (action)="campusService.markAllPresent()">
                    Marcar Todos Presentes
                  </m3-button>
                </div>
              </div>

              <!-- 4 Modular KPI Cards Ribbon (Contraste Alto) -->
              @if (campusService.rosterSummary(); as summary) {
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div 
                    (click)="campusService.setRosterFilter('all')"
                    class="p-3 rounded-2xl bg-surface-low border border-outline-sub hover:border-outline cursor-pointer transition-all flex flex-col justify-between"
                    [class.ring-2]="campusService.rosterFilter() === 'all'"
                    [class.ring-primary]="campusService.rosterFilter() === 'all'">
                    <span class="text-[11px] font-bold text-muted uppercase tracking-wider">Matriculados</span>
                    <span class="text-2xl font-black font-mono text-main mt-1">{{ summary.total }}</span>
                  </div>

                  <div 
                    (click)="campusService.setRosterFilter('present')"
                    class="p-3 rounded-2xl bg-surface-low border border-outline-sub hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between"
                    [class.ring-2]="campusService.rosterFilter() === 'present'"
                    [class.ring-emerald-500]="campusService.rosterFilter() === 'present'">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Presentes</span>
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <span class="text-2xl font-black font-mono text-emerald-500 mt-1">{{ summary.present }}</span>
                  </div>

                  <div 
                    (click)="campusService.setRosterFilter('late')"
                    class="p-3 rounded-2xl bg-surface-low border border-outline-sub hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between"
                    [class.ring-2]="campusService.rosterFilter() === 'late'"
                    [class.ring-amber-500]="campusService.rosterFilter() === 'late'">
                    <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Tardanzas</span>
                    <span class="text-2xl font-black font-mono text-amber-500 mt-1">{{ summary.late }}</span>
                  </div>

                  <div 
                    (click)="campusService.setRosterFilter('atRisk')"
                    class="p-3 rounded-2xl bg-rose-500/[0.06] border border-rose-500/30 hover:border-rose-500 cursor-pointer transition-all flex flex-col justify-between"
                    [class.ring-2]="campusService.rosterFilter() === 'atRisk'"
                    [class.ring-rose-500]="campusService.rosterFilter() === 'atRisk'">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-bold text-rose-500 uppercase tracking-wider">En Riesgo</span>
                      <span class="material-symbols-rounded text-sm text-rose-500">warning</span>
                    </div>
                    <span class="text-2xl font-black font-mono text-rose-500 mt-1">{{ summary.atRisk }}</span>
                  </div>
                </div>
              }
            </section>
          }

          <!-- 3.2 BENTO DOCENTE -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
            
            <!-- Bento Col 1: Roster de Asistencia en Grilla 2D Compacta (7 Cols) -->
            <section class="lg:col-span-7 p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub flex flex-col gap-3 shadow-xs">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-lg text-primary">fact_check</span>
                  <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-main">Lista de Asistencia en Vivo</h3>
                    <p class="text-[11px] text-muted">Pasa lista en 1 toque por estudiante</p>
                  </div>
                </div>

                <!-- Filter indicator -->
                <span class="text-xs font-mono font-medium text-muted bg-surface-low px-2 py-0.5 rounded-full border border-outline-sub">
                  Mostrando: {{ campusService.filteredRoster().length }} alumnos
                </span>
              </div>

              <!-- 2-COLUMN COMPACT STUDENT GRID (CERO ESPACIO MUERTO) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                @for (student of campusService.filteredRoster(); track student.id) {
                  <article 
                    class="p-3 rounded-2xl bg-surface-low border border-outline-sub hover:border-outline transition-all flex items-center justify-between gap-2.5"
                    [class.border-rose-500/40]="student.atRisk"
                    [class.bg-rose-500/[0.02]]="student.atRisk">
                    
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="w-8 h-8 rounded-xl bg-primary-box text-on-primary-box font-bold text-xs grid place-items-center shrink-0 shadow-2xs">
                        {{ student.studentName.charAt(0) }}
                      </div>
                      <div class="min-w-0 space-y-0.5">
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-main truncate">{{ student.studentName }}</span>
                          @if (student.atRisk) {
                            <span class="material-symbols-rounded text-sm text-rose-500 shrink-0" title="Asistencia crítica (<80%)">warning</span>
                          }
                        </div>
                        <span class="text-[10px] font-mono text-muted block">{{ student.studentCode }} · {{ student.overallAttendance }}%</span>
                      </div>
                    </div>

                    <!-- 3-Way Segmented Tactile Status Toggles -->
                    <div class="flex items-center gap-0.5 shrink-0 p-0.5 rounded-xl bg-surface-box border border-outline-sub">
                      <button
                        type="button"
                        (click)="campusService.setAttendance(student.id, 'present')"
                        [class.bg-emerald-500]="student.status === 'present'"
                        [class.text-white]="student.status === 'present'"
                        [class.font-bold]="student.status === 'present'"
                        [class.shadow-2xs]="student.status === 'present'"
                        [class.text-muted]="student.status !== 'present'"
                        class="w-7 h-7 rounded-lg text-xs grid place-items-center transition-all duration-150 cursor-pointer hover:bg-emerald-500/20 active:scale-95"
                        title="Presente">
                        P
                      </button>

                      <button
                        type="button"
                        (click)="campusService.setAttendance(student.id, 'late')"
                        [class.bg-amber-500]="student.status === 'late'"
                        [class.text-white]="student.status === 'late'"
                        [class.font-bold]="student.status === 'late'"
                        [class.shadow-2xs]="student.status === 'late'"
                        [class.text-muted]="student.status !== 'late'"
                        class="w-7 h-7 rounded-lg text-xs grid place-items-center transition-all duration-150 cursor-pointer hover:bg-amber-500/20 active:scale-95"
                        title="Tardanza">
                        T
                      </button>

                      <button
                        type="button"
                        (click)="campusService.setAttendance(student.id, 'absent')"
                        [class.bg-rose-500]="student.status === 'absent'"
                        [class.text-white]="student.status === 'absent'"
                        [class.font-bold]="student.status === 'absent'"
                        [class.shadow-2xs]="student.status === 'absent'"
                        [class.text-muted]="student.status !== 'absent'"
                        class="w-7 h-7 rounded-lg text-xs grid place-items-center transition-all duration-150 cursor-pointer hover:bg-rose-500/20 active:scale-95"
                        title="Falta">
                        F
                      </button>
                    </div>
                  </article>
                }
              </div>
            </section>

            <!-- Bento Col 2: Cola de Calificación & Herramientas de Cátedra (5 Cols) -->
            <div class="lg:col-span-5 flex flex-col gap-3">
              
              <!-- Cola de Calificación -->
              <section class="p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub flex flex-col gap-3 shadow-xs">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-lg text-primary">rate_review</span>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-main">Por Calificar</h3>
                  </div>
                  <span class="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box">
                    {{ campusService.pendingGradingCount() }} pendientes
                  </span>
                </div>

                <div class="flex flex-col gap-2">
                  @for (grd of campusService.gradingQueue(); track grd.id) {
                    <article class="p-3 rounded-2xl bg-surface-low border border-outline-sub flex items-center justify-between gap-3">
                      <div class="min-w-0 space-y-0.5">
                        <span class="text-xs sm:text-sm font-bold text-main truncate block">{{ grd.studentName }}</span>
                        <p class="text-xs text-muted truncate">{{ grd.assignmentTitle }}</p>
                        <span class="text-[10px] text-muted font-mono">{{ grd.submittedAt }}</span>
                      </div>

                      <div class="shrink-0">
                        @if (grd.status === 'pending') {
                          <button
                            type="button"
                            (click)="campusService.markGradingReviewed(grd.id)"
                            class="btn-m3 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold cursor-pointer shadow-xs hover:opacity-90 active:scale-[0.98]">
                            Calificar
                          </button>
                        } @else {
                          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                            <span class="material-symbols-rounded text-sm">done_all</span>
                            Revisado
                          </span>
                        }
                      </div>
                    </article>
                  }
                </div>
              </section>

              <!-- Herramientas Rápidas de Cátedra -->
              <section class="p-4 sm:p-5 rounded-3xl bg-surface-box border border-outline-sub flex flex-col gap-3 shadow-xs">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-lg text-primary">hub</span>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-main">Acciones de Aula</h3>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    class="btn-m3 p-3 rounded-2xl bg-surface-low border border-outline-sub text-left hover:border-primary/50 hover:-translate-y-0.5 transition-all cursor-pointer space-y-1 active:scale-[0.98]">
                    <div class="w-7 h-7 rounded-xl bg-primary-box text-on-primary-box grid place-items-center">
                      <span class="material-symbols-rounded text-base">send</span>
                    </div>
                    <span class="text-xs font-bold text-main block">Aviso a Clase</span>
                    <span class="text-[10px] text-muted block leading-tight">Push a los 32 alumnos</span>
                  </button>

                  <button 
                    type="button"
                    class="btn-m3 p-3 rounded-2xl bg-surface-low border border-outline-sub text-left hover:border-primary/50 hover:-translate-y-0.5 transition-all cursor-pointer space-y-1 active:scale-[0.98]">
                    <div class="w-7 h-7 rounded-xl bg-primary-box text-on-primary-box grid place-items-center">
                      <span class="material-symbols-rounded text-base">download</span>
                    </div>
                    <span class="text-xs font-bold text-main block">Descargar Acta</span>
                    <span class="text-[10px] text-muted block leading-tight">Exportar PDF / Excel</span>
                  </button>
                </div>
              </section>

            </div>

          </div>

        </main>
      }

    </div>
  `
})
export class CampusComponent {
  readonly campusService = inject(CampusService);
  readonly themeService = inject(ThemeService);

  getCategoryIcon(category: SubjectCategory): string {
    switch (category) {
      case 'stem': return 'science';
      case 'humanities': return 'menu_book';
      case 'arts': return 'palette';
      case 'sports': return 'fitness_center';
    }
  }

  getCategoryBadgeClass(category: SubjectCategory): string {
    switch (category) {
      case 'stem':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30';
      case 'humanities':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      case 'arts':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30';
      case 'sports':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    }
  }
}
