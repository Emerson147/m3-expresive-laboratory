import { Component, inject, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import {
  TASK_CATEGORIES,
  TASK_DUE_BUCKETS,
  TASK_DURATIONS,
  TASK_PRIORITIES,
  TaskDueBucket,
  TaskPriority
} from '../../core/tasks/task.service';
import { ContrastLevel, ThemeService } from '../../core/theme/theme.service';
import { DialogView, NavStyle, TransitionType, TriggerMode } from '../models/ui.models';
import { M3ButtonComponent } from '../components/button/button.component';
import { M3TextFieldComponent } from '../components/text-field/text-field.component';

@Component({
  selector: 'app-dialog-container',
  standalone: true,
  imports: [FormsModule, M3ButtonComponent, M3TextFieldComponent],
  host: {
    class: 'contents'
  },
  template: `
    @if (isDialogOpen()) {
      <div (click)="closeDialog.emit()" class="fixed inset-0 z-40"></div>

      <div 
        id="dialog-container" 
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="dialogAriaLabel()"
        [style.view-transition-name]="isDialogOpen() && activeTransition() === 'dialog' ? 'dialog-transform' : null"
        [class.top-4]="activeTrigger() === 'fab-header'" 
        [class.right-4]="activeTrigger() === 'fab-header'"
        [class.sm:w-[420px]]="activeTrigger() === 'fab-header'"
        [class.bottom-4]="activeTrigger() === 'menu-bottom-left'" 
        [class.left-4]="activeTrigger() === 'menu-bottom-left'"
        [class.w-80]="activeTrigger() === 'menu-bottom-left'" 
        [class.inset-0]="activeTrigger() === 'bento-center' || activeTrigger() === 'task-card'"
        [class.m-auto]="activeTrigger() === 'bento-center' || activeTrigger() === 'task-card'"
        [class.sm:w-[440px]]="activeTrigger() === 'bento-center' || activeTrigger() === 'task-card'"
        [class.w-[calc(100%-2rem)]]="activeTrigger() !== 'menu-bottom-left'"
        [class.m3-container-enter]="!themeService.hasViewTransitions()"
        class="fixed h-fit max-h-[calc(100vh-2rem)] bg-surface-box border border-outline-sub p-6 flex flex-col justify-between shadow-2xl z-50 rounded-m3-xl overflow-hidden">

        <!-- VISTA A: MENÚ DE OPCIONES -->
        @if (dialogView() === 'menu-main') {
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-rounded text-lg text-primary">tune</span>
                <h3 class="font-bold text-base tracking-tight">Opciones del Sistema</h3>
              </div>
              <button 
                (click)="closeDialog.emit()" 
                class="btn-m3 p-1 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>

            <div class="space-y-1">
              <button 
                (click)="morphView.emit({ targetView: 'task-form', moveCenter: true })"
                class="btn-m3 w-full text-left px-3 py-2.5 rounded-m3-md hover:bg-surface-high flex items-center gap-3 text-sm cursor-pointer">
                <span class="material-symbols-rounded text-lg text-primary">add_task</span>
                Nueva tarea rápida
              </button>
              <button 
                (click)="morphView.emit({ targetView: 'menu-appearance' })"
                class="btn-m3 w-full text-left px-3 py-2.5 rounded-m3-md hover:bg-surface-high flex items-center justify-between text-sm cursor-pointer">
                <span class="flex items-center gap-3">
                  <span class="material-symbols-rounded text-lg text-primary">palette</span>
                  Apariencia y navegación
                </span>
                <span class="material-symbols-rounded text-sm text-muted">chevron_right</span>
              </button>
              <button 
                (click)="themeService.toggleThemeMode($event)"
                class="btn-m3 w-full text-left px-3 py-2.5 rounded-m3-md hover:bg-surface-high flex items-center gap-3 text-sm cursor-pointer">
                <span class="material-symbols-rounded text-lg">
                  {{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}
                </span>
                Cambiar a modo {{ themeService.isDarkMode() ? 'Claro' : 'Oscuro' }}
              </button>
            </div>
          </div>
        }

        <!-- VISTA B: SUB-MENÚ DE APARIENCIA -->
        @if (dialogView() === 'menu-appearance') {
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
              <button 
                (click)="morphView.emit({ targetView: 'menu-main' })"
                class="btn-m3 flex items-center gap-1.5 text-sm font-bold text-main cursor-pointer">
                <span class="material-symbols-rounded text-lg">arrow_back</span>
                Apariencia
              </button>
              <button 
                (click)="closeDialog.emit()" 
                class="btn-m3 p-1 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold text-muted uppercase tracking-wider">Color Semilla</label>
              <div class="flex items-center gap-2.5 pt-1" role="group" aria-label="Color semilla del tema">
                @for (t of themeService.themes; track t.hue) {
                  <button
                    type="button"
                    (click)="themeService.setThemeHue(t.hue)"
                    [attr.aria-label]="'Color semilla ' + t.name"
                    [attr.aria-pressed]="themeService.currentHue() === t.hue"
                    [class.ring-2]="themeService.currentHue() === t.hue"
                    [class.rounded-m3-md]="themeService.currentHue() === t.hue"
                    [class.rounded-full]="themeService.currentHue() !== t.hue"
                    class="btn-m3 w-8 h-8 ring-offset-2 ring-offset-surface-box ring-primary grid place-items-center cursor-pointer"
                    style="forced-color-adjust: none"
                    [style.background-color]="'oklch(65% 0.16 ' + t.hue + ')'">
                    @if (themeService.currentHue() === t.hue) {
                      <span class="material-symbols-rounded text-base text-white drop-shadow-xs" aria-hidden="true">check</span>
                    }
                  </button>
                }
              </div>
            </div>

            <div class="space-y-2 pt-1">
              <label class="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">contrast</span>
                Contraste M3
              </label>
              <div
                role="group"
                aria-label="Nivel de contraste M3"
                class="grid grid-cols-3 gap-1.5 bg-surface-high p-1 rounded-m3-full">
                @for (lvl of contrastLevels; track lvl.id) {
                  <button
                    type="button"
                    (click)="themeService.setContrastLevel(lvl.id)"
                    [attr.aria-pressed]="themeService.contrastLevel() === lvl.id"
                    [class]="themeService.contrastLevel() === lvl.id
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'text-muted hover:text-main'"
                    class="btn-m3 py-1.5 px-2.5 rounded-m3-full text-xs cursor-pointer">
                    {{ lvl.label }}
                  </button>
                }
              </div>
            </div>

            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs font-semibold text-muted uppercase tracking-wider">Navegación</label>
                <span class="text-[11px] font-mono text-primary">{{ adaptiveLayout.windowSizeClass() }} ({{ adaptiveLayout.windowWidth() }}dp)</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                @for (opt of navStyleOptions; track opt.value) {
                  <button
                    (click)="navStyleChange.emit(opt.value)"
                    [class]="navStyle() === opt.value ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-high text-muted hover:text-main'"
                    class="btn-m3 py-2 px-2.5 rounded-m3-md text-xs cursor-pointer">
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- VISTA C: FORMULARIO DE CREACIÓN / EDICIÓN DE TAREA -->
        @if (dialogView() === 'task-form') {
          <form (ngSubmit)="submitTaskForm()" novalidate class="flex flex-col min-h-0 flex-1">
            <div class="space-y-4 overflow-y-auto px-1 pb-2 m3-scrollbar">
              <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-primary-box text-on-primary-box grid place-items-center shrink-0">
                    <span class="material-symbols-rounded text-lg" aria-hidden="true">
                      {{ activeTaskId() !== null ? 'edit_calendar' : 'event' }}
                    </span>
                  </div>
                  <h2 class="text-lg font-bold">
                    {{ activeTaskId() !== null ? 'Editar Tarea' : 'Nueva Tarea' }}
                  </h2>
                </div>
                <button 
                  type="button"
                  aria-label="Cerrar formulario"
                  (click)="onCancelTaskForm()" 
                  class="btn-m3 p-2 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer">
                  <span class="material-symbols-rounded text-xl" aria-hidden="true">close</span>
                </button>
              </div>

              <div class="space-y-4">
                <m3-text-field 
                  #taskTitleField
                  variant="filled"
                  label="Título de la tarea"
                  placeholder="Ej. Revisión arquitectónica de DenRaf"
                  icon="edit_note"
                  [required]="true"
                  [clearable]="true"
                  [maxlength]="80"
                  enterkeyhint="done"
                  [errorText]="titleValidationError()"
                  [ngModel]="draftTitle()" 
                  (ngModelChange)="onTitleModelChange($event)"
                  (inputBlur)="validateTitleOnBlur()"
                  [ngModelOptions]="{ standalone: true }"
                  supportingText="Define el objetivo con claridad" />

                <!-- Categoría visible (<= 5 opciones, radiogroup accesible) -->
                <fieldset class="space-y-1.5 border-0 p-0 m-0">
                  <legend class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">
                    Categoría
                  </legend>
                  <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Categoría de tarea">
                    @for (cat of taskCategories; track cat.name) {
                      @let isSelected = draftCategory() === cat.name;
                      <button
                        type="button"
                        role="radio"
                        [attr.aria-checked]="isSelected"
                        (click)="draftCategory.set(cat.name)"
                        [class]="isSelected
                          ? 'bg-primary-box text-on-primary-box font-semibold rounded-[12px]'
                          : 'bg-surface-high text-muted hover:text-main rounded-[18px]'"
                        class="btn-m3 focus-ring-m3 min-h-[34px] px-3 py-1 text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200">
                        <span class="material-symbols-rounded text-sm shrink-0" aria-hidden="true">
                          {{ isSelected ? 'check' : cat.icon }}
                        </span>
                        <span>{{ cat.name }}</span>
                      </button>
                    }
                  </div>
                </fieldset>

                <!-- Bloque temporal y Prioridad en pills visibles (forms rule: < 6 choices) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <fieldset class="space-y-1.5 border-0 p-0 m-0">
                    <legend class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">
                      Bloque / Día
                    </legend>
                    <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Día programado">
                      @for (bucket of taskDueBuckets; track bucket) {
                        @let isSelected = draftDate() === bucket;
                        <button
                          type="button"
                          role="radio"
                          [attr.aria-checked]="isSelected"
                          (click)="draftDate.set(bucket)"
                          [class]="isSelected
                            ? 'bg-sec-box text-on-sec-box font-semibold rounded-[10px]'
                            : 'bg-surface-high text-muted hover:text-main rounded-[16px]'"
                          class="btn-m3 focus-ring-m3 min-h-[34px] px-2.5 py-1 text-xs inline-flex items-center gap-1 cursor-pointer transition-all duration-200">
                          <span class="material-symbols-rounded text-sm shrink-0" aria-hidden="true">
                            {{ isSelected ? 'check' : 'event' }}
                          </span>
                          <span>{{ bucket }}</span>
                        </button>
                      }
                    </div>
                  </fieldset>

                  <fieldset class="space-y-1.5 border-0 p-0 m-0">
                    <legend class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">
                      Prioridad
                    </legend>
                    <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Prioridad de tarea">
                      @for (prio of taskPriorities; track prio) {
                        @let isSelected = draftPriority() === prio;
                        <button
                          type="button"
                          role="radio"
                          [attr.aria-checked]="isSelected"
                          (click)="draftPriority.set(prio)"
                          [class]="priorityOptionClass(prio, isSelected)"
                          class="btn-m3 focus-ring-m3 min-h-[34px] px-2.5 py-1 text-xs inline-flex items-center gap-1 cursor-pointer transition-all duration-200">
                          <span class="material-symbols-rounded text-sm shrink-0" aria-hidden="true">
                            {{ prio === 'Alta' ? 'priority_high' : prio === 'Media' ? 'flag' : 'low_priority' }}
                          </span>
                          <span>{{ prio }}</span>
                        </button>
                      }
                    </div>
                  </fieldset>
                </div>

                <!-- Hora y duración estimada -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  <div class="space-y-1.5">
                    <label for="dialog-task-time" class="block text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">
                      Hora sugerida
                    </label>
                    <input
                      id="dialog-task-time"
                      type="time"
                      [ngModel]="draftTimeSlot()"
                      (ngModelChange)="draftTimeSlot.set($event)"
                      [ngModelOptions]="{ standalone: true }"
                      class="w-full min-h-[38px] px-3 rounded-m3-md bg-surface-high text-main text-sm font-mono focus-ring-m3 border border-outline-sub" />
                  </div>

                  <fieldset class="space-y-1.5 border-0 p-0 m-0">
                    <legend class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">
                      Bloque de enfoque
                    </legend>
                    <div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Duración en minutos">
                      @for (mins of taskDurations; track mins) {
                        @let isSelected = draftDuration() === mins;
                        <button
                          type="button"
                          role="radio"
                          [attr.aria-checked]="isSelected"
                          (click)="draftDuration.set(mins)"
                          [class]="isSelected
                            ? 'bg-primary text-on-primary font-semibold rounded-[10px]'
                            : 'bg-surface-high text-muted hover:text-main rounded-[16px]'"
                          class="btn-m3 focus-ring-m3 min-h-[38px] px-2.5 py-1 text-xs font-mono cursor-pointer transition-all duration-200">
                          {{ mins }}m
                        </button>
                      }
                    </div>
                  </fieldset>
                </div>

                <m3-text-field 
                  variant="outlined"
                  label="Notas de apoyo"
                  placeholder="Detalles sobre entidades, puertos y adaptadores..."
                  icon="description"
                  [multiline]="true"
                  [autoGrow]="true"
                  [rows]="2"
                  [maxlength]="300"
                  [ngModel]="draftNotes()" 
                  (ngModelChange)="draftNotes.set($event)"
                  [ngModelOptions]="{ standalone: true }"
                  supportingText="Especificaciones y contexto técnico" />
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-outline-sub mt-3 shrink-0">
              @if (activeTaskId() !== null) {
                <m3-button 
                  type="button"
                  variant="tonal" 
                  size="sm" 
                  icon="delete"
                  (action)="deleteTask.emit()">
                  Eliminar
                </m3-button>
              } @else {
                <div></div>
              }

              <div class="flex items-center gap-2.5">
                <m3-button 
                  type="button"
                  variant="text" 
                  (action)="onCancelTaskForm()">
                  Cancelar
                </m3-button>
                <m3-button 
                  type="submit"
                  variant="filled" 
                  icon="check">
                  Guardar
                </m3-button>
              </div>
            </div>
          </form>
        }

      </div>
    }
  `
})
export class DialogContainerComponent {
  readonly themeService = inject(ThemeService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);
  private readonly taskTitleField = viewChild<M3TextFieldComponent>('taskTitleField');

  readonly taskCategories = TASK_CATEGORIES;
  readonly taskDueBuckets = TASK_DUE_BUCKETS;
  readonly taskPriorities = TASK_PRIORITIES;
  readonly taskDurations = TASK_DURATIONS;

  readonly navStyleOptions: readonly { value: NavStyle; label: string }[] = [
    { value: 'auto', label: 'Auto (M3)' },
    { value: 'rail', label: 'Rail' },
    { value: 'dock', label: 'Dock' },
    { value: 'tunnel', label: 'Focus Bar' }
  ];

  readonly contrastLevels: readonly { id: ContrastLevel; label: string }[] = [
    { id: 'standard', label: 'Estándar' },
    { id: 'medium', label: 'Medio' },
    { id: 'high', label: 'Alto' }
  ];

  readonly isDialogOpen = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly activeTransition = input<TransitionType>(null);
  readonly dialogView = input.required<DialogView>();
  readonly navStyle = input.required<NavStyle>();
  readonly activeTaskId = input<number | null>(null);

  readonly draftTitle = model<string>('');
  readonly draftCategory = model<string>('Frontend Angular');
  readonly draftDate = model<string>('Hoy');
  readonly draftTimeSlot = model<string>('10:00');
  readonly draftDuration = model<number>(25);
  readonly draftPriority = model<TaskPriority>('Alta');
  readonly draftNotes = model<string>('');

  readonly titleValidationError = signal<string | null>(null);

  readonly closeDialog = output<void>();
  readonly saveTask = output<void>();
  readonly deleteTask = output<void>();
  readonly morphView = output<{ targetView: DialogView; moveCenter?: boolean }>();
  readonly navStyleChange = output<NavStyle>();

  dialogAriaLabel(): string {
    const view = this.dialogView();
    if (view === 'menu-appearance') return 'Apariencia y navegación';
    if (view === 'menu-main') return 'Opciones del Sistema';
    return this.activeTaskId() !== null ? 'Editar Tarea' : 'Nueva Tarea';
  }

  priorityOptionClass(prio: TaskPriority, selected: boolean): string {
    if (!selected) return 'bg-surface-high text-muted hover:text-main rounded-[16px]';
    if (prio === 'Alta') return 'bg-error-box text-on-error-box font-semibold rounded-[10px]';
    if (prio === 'Media') return 'bg-warning-box text-on-warning-box font-semibold rounded-[10px]';
    return 'bg-tertiary-box text-on-tertiary-box font-semibold rounded-[10px]';
  }

  onTitleModelChange(val: string): void {
    this.draftTitle.set(val);
    if (this.titleValidationError() && val.trim()) {
      this.titleValidationError.set(null);
    }
  }

  validateTitleOnBlur(): void {
    if (!this.draftTitle().trim()) {
      this.titleValidationError.set('Ingresa un título para identificar la actividad.');
    }
  }

  onCancelTaskForm(): void {
    this.titleValidationError.set(null);
    this.closeDialog.emit();
  }

  submitTaskForm(): void {
    if (!this.draftTitle().trim()) {
      this.titleValidationError.set('El título es obligatorio para guardar la tarea.');
      this.taskTitleField()?.focus();
      return;
    }
    this.titleValidationError.set(null);
    this.saveTask.emit();
  }
}
