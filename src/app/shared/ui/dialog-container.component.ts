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
import { ContrastLevel, MotionScheme, ThemeService } from '../../core/theme/theme.service';
import { DialogView, NavStyle, TransitionType, TriggerMode } from '../models/ui.models';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../components/button/button-group.component';
import { M3ButtonComponent } from '../components/button/button.component';
import { M3SwitchComponent } from '../components/switch/switch.component';
import { M3TextFieldComponent } from '../components/text-field/text-field.component';

@Component({
  selector: 'app-dialog-container',
  standalone: true,
  imports: [
    FormsModule,
    M3ButtonComponent,
    M3ButtonGroupComponent,
    M3SwitchComponent,
    M3TextFieldComponent
  ],
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
        [class.sm:w-[408px]]="activeTrigger() === 'menu-bottom-left'" 
        [class.inset-0]="activeTrigger() === 'bento-center' || activeTrigger() === 'task-card'"
        [class.m-auto]="activeTrigger() === 'bento-center' || activeTrigger() === 'task-card'"
        [class.sm:w-[600px]]="activeTrigger() === 'bento-center' || activeTrigger() === 'task-card'"
        [class.w-[calc(100%-2rem)]]="true"
        [class.m3-container-enter]="!themeService.hasViewTransitions()"
        class="fixed h-fit max-h-[calc(100dvh-2rem)] bg-surface-box border border-outline-sub/60 forced-colors:border-[CanvasText] p-6 sm:p-7 flex flex-col justify-between shadow-m3-level4 z-50 rounded-m3-xl overflow-hidden">

        <!-- VISTA A & B UNIFICADAS: CENTRO DE PERSONALIZACIÓN M3 EXPRESSIVE -->
        @if (dialogView() === 'menu-main' || dialogView() === 'menu-appearance') {
          <div class="flex flex-col min-h-0 gap-3.5 overflow-y-auto m3-scrollbar pr-0.5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-10 h-10 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
                  <span class="material-symbols-rounded text-xl" aria-hidden="true">palette</span>
                </span>
                <div class="min-w-0">
                  <h2 class="font-bold text-base tracking-tight text-main leading-tight">
                    Opciones del Sistema
                  </h2>
                  <p class="text-[11px] font-mono text-primary truncate mt-0.5">
                    {{ adaptiveLayout.windowSizeClass() }} · {{ adaptiveLayout.windowWidth() }}dp
                  </p>
                </div>
              </div>

              <m3-button
                [iconOnly]="true"
                variant="text"
                size="sm"
                icon="close"
                ariaLabel="Cerrar opciones del sistema"
                (action)="closeDialog.emit()" />
            </div>

            <!-- Modo Oscuro / Claro con <m3-switch> -->
            <div
              (click)="captureThemeSwitchEvent($event)"
              class="bg-surface rounded-m3-lg px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-8 h-8 rounded-m3-md bg-sec-box text-on-sec-box grid place-items-center shrink-0">
                  <span class="material-symbols-rounded text-base" aria-hidden="true">
                    {{ themeService.isDarkMode() ? 'dark_mode' : 'light_mode' }}
                  </span>
                </span>
                <div class="min-w-0">
                  <span class="block text-sm font-semibold text-main leading-tight">
                    Modo {{ themeService.isDarkMode() ? 'Oscuro' : 'Claro' }}
                  </span>
                  <span class="block text-[11px] text-muted truncate">
                    Superficies OKLCH adaptativas
                  </span>
                </div>
              </div>

              <m3-switch
                [checked]="themeService.isDarkMode()"
                ariaLabel="Alternar modo oscuro o claro"
                (changed)="onDarkModeSwitchChanged()" />
            </div>

            <!-- Color Semilla + Croma OKLCH -->
            <div class="bg-surface rounded-m3-lg p-3.5 space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-muted uppercase tracking-wider">Color Semilla</span>
                  <span class="text-[11px] font-mono text-primary font-semibold">
                    {{ themeService.currentHue() }}°
                  </span>
                </div>
                <div class="flex items-center justify-between gap-2 pt-0.5" role="group" aria-label="Color semilla del tema">
                  @for (t of themeService.themes; track t.hue) {
                    @let selectedHue = themeService.currentHue() === t.hue;
                    <button
                      type="button"
                      (click)="themeService.setThemeHue(t.hue)"
                      [attr.aria-label]="'Color semilla ' + t.name"
                      [attr.aria-pressed]="selectedHue"
                      [class.ring-2]="selectedHue"
                      [class.rounded-m3-md]="selectedHue"
                      [class.rounded-full]="!selectedHue"
                      class="btn-m3 focus-ring-m3 w-9 h-9 ring-offset-2 ring-offset-surface ring-primary grid place-items-center cursor-pointer transition-all duration-200"
                      style="forced-color-adjust: none"
                      [style.background-color]="'oklch(65% 0.16 ' + t.hue + ')'">
                      @if (selectedHue) {
                        <span class="material-symbols-rounded text-base text-white drop-shadow-xs" aria-hidden="true">check</span>
                      }
                    </button>
                  }
                </div>
              </div>

              <div class="space-y-1.5 pt-2 border-t border-outline-sub/50">
                <span class="block text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Saturación OKLCH
                </span>
                <m3-button-group
                  variant="connected"
                  size="xs"
                  ariaLabel="Intensidad cromática OKLCH"
                  [options]="chromaOptions"
                  [value]="[themeService.seedChroma().toString()]"
                  (selectionChange)="onChromaSelect($event)" />
              </div>
            </div>

            <!-- Contraste M3 y Física Motion desde <m3-button-group> -->
            <div class="bg-surface rounded-m3-lg p-3.5 space-y-3">
              <div class="space-y-1.5">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">contrast</span>
                  Contraste M3
                </span>
                <m3-button-group
                  variant="connected"
                  size="xs"
                  ariaLabel="Nivel de contraste M3"
                  [options]="contrastOptions"
                  [value]="[themeService.contrastLevel()]"
                  (selectionChange)="onContrastSelect($event)" />
              </div>

              <div class="space-y-1.5 pt-2 border-t border-outline-sub/50">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm text-primary" aria-hidden="true">animation</span>
                  Física de Movimiento
                </span>
                <m3-button-group
                  variant="connected"
                  size="xs"
                  ariaLabel="Esquema de movimiento"
                  [options]="motionOptions"
                  [value]="[themeService.motionScheme()]"
                  (selectionChange)="onMotionSelect($event)" />
              </div>
            </div>

            <!-- Navegación Adaptativa desde <m3-button-group> -->
            <div class="bg-surface rounded-m3-lg p-3.5 space-y-2">
              <span class="block text-xs font-semibold text-muted uppercase tracking-wider">
                Navegación Adaptativa
              </span>
              <m3-button-group
                variant="standard"
                size="sm"
                ariaLabel="Estilo de navegación"
                [options]="navOptions"
                [value]="[navStyle()]"
                (selectionChange)="onNavSelect($event)" />
            </div>
          </div>
        }

        <!-- VISTA C: FORMULARIO DE CREACIÓN / EDICIÓN DE TAREA CON <m3-button-group> Y <m3-text-field> -->
        @if (dialogView() === 'task-form') {
          <form (ngSubmit)="submitTaskForm()" novalidate class="flex flex-col min-h-0 flex-1">
            <div class="space-y-5 overflow-y-auto overflow-x-hidden pr-1 pb-2 m3-scrollbar">
              <div class="flex items-start justify-between gap-3 pb-4 border-b border-outline-sub">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
                    <span class="material-symbols-rounded text-xl" aria-hidden="true">
                      {{ activeTaskId() !== null ? 'edit_calendar' : 'event' }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <h2 class="text-title-lg-emphasized text-main">
                      {{ activeTaskId() !== null ? 'Editar Tarea' : 'Nueva Tarea' }}
                    </h2>
                    <p class="text-body-sm text-muted mt-0.5">
                      {{ activeTaskId() !== null ? 'Ajusta horizonte temporal, prioridad y notas de seguimiento.' : 'Define objetivo, bloque temporal y prioridad de ejecución.' }}
                    </p>
                  </div>
                </div>
                <m3-button
                  [iconOnly]="true"
                  variant="text"
                  size="sm"
                  icon="close"
                  ariaLabel="Cerrar formulario"
                  (action)="onCancelTaskForm()" />
              </div>

              <div class="space-y-5">
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
                  [value]="draftTitle()"
                  (valueChange)="onTitleModelChange($event)"
                  (inputBlur)="validateTitleOnBlur()"
                  supportingText="Define el objetivo con claridad" />

                <fieldset class="space-y-2 border-0 p-0 m-0">
                  <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
                    Categoría
                  </legend>
                  <m3-button-group
                    variant="standard"
                    size="sm"
                    ariaLabel="Categoría de tarea"
                    [options]="categoryOptions"
                    [value]="[draftCategory()]"
                    (selectionChange)="onCategorySelect($event)" />
                </fieldset>

                <!-- CONTENEDOR TONAL PARA PROGRAMACIÓN Y PRIORIDAD SIN SOLAPAMIENTO -->
                <div class="bg-surface-low rounded-m3-lg p-4 sm:p-5 space-y-4">
                  <fieldset class="space-y-2 border-0 p-0 m-0">
                    <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
                      Bloque / Día
                    </legend>
                    <m3-button-group
                      variant="connected"
                      size="sm"
                      ariaLabel="Día programado"
                      [options]="dueBucketOptions"
                      [value]="[draftDate()]"
                      (selectionChange)="onDateSelect($event)" />
                  </fieldset>

                  <fieldset class="space-y-2 border-0 p-0 m-0">
                    <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
                      Prioridad
                    </legend>
                    <m3-button-group
                      variant="connected"
                      size="sm"
                      ariaLabel="Prioridad de tarea"
                      [options]="priorityOptions"
                      [value]="[draftPriority()]"
                      (selectionChange)="onPrioritySelect($event)" />
                  </fieldset>

                  <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-1">
                    <div class="sm:col-span-5">
                      <m3-text-field
                        [id]="'dialog-task-time'"
                        variant="filled"
                        type="time"
                        label="Hora sugerida"
                        placeholder="HH:mm"
                        icon="schedule"
                        [value]="draftTimeSlot()"
                        (valueChange)="draftTimeSlot.set($event)" />
                    </div>

                    <fieldset class="sm:col-span-7 space-y-2 border-0 p-0 m-0">
                      <legend class="text-label-md-emphasized text-muted uppercase tracking-wider">
                        Bloque de enfoque
                      </legend>
                      <m3-button-group
                        variant="connected"
                        size="sm"
                        ariaLabel="Duración en minutos"
                        [options]="durationOptions"
                        [value]="[draftDuration().toString()]"
                        (selectionChange)="onDurationSelect($event)" />
                    </fieldset>
                  </div>
                </div>

                <m3-text-field
                  variant="filled"
                  label="Notas de apoyo"
                  placeholder="Detalles sobre entidades, puertos y adaptadores..."
                  icon="description"
                  [multiline]="true"
                  [autoGrow]="true"
                  [rows]="3"
                  [maxlength]="300"
                  [value]="draftNotes()"
                  (valueChange)="draftNotes.set($event)"
                  supportingText="Especificaciones y contexto técnico" />
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 pt-4 border-t border-outline-sub mt-4 shrink-0">
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

              <div class="flex items-center gap-3">
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

  readonly categoryOptions: M3ButtonGroupOption[] = TASK_CATEGORIES.map(c => ({
    id: c.name,
    label: c.name,
    icon: c.icon
  }));

  readonly dueBucketOptions: M3ButtonGroupOption[] = TASK_DUE_BUCKETS.map(b => ({
    id: b,
    label: b
  }));

  readonly priorityOptions: M3ButtonGroupOption[] = TASK_PRIORITIES.map(p => ({
    id: p,
    label: p,
    icon: p === 'Alta' ? 'priority_high' : p === 'Media' ? 'flag' : 'low_priority'
  }));

  readonly durationOptions: M3ButtonGroupOption[] = TASK_DURATIONS.map(d => ({
    id: d.toString(),
    label: `${d}m`
  }));

  readonly navOptions: M3ButtonGroupOption[] = [
    { id: 'auto', label: 'Auto (M3)', icon: 'auto_awesome' },
    { id: 'rail', label: 'Rail', icon: 'view_sidebar' },
    { id: 'dock', label: 'Dock', icon: 'dock_to_bottom' },
    { id: 'tunnel', label: 'Focus Bar', icon: 'center_focus_strong' }
  ];

  readonly chromaOptions: M3ButtonGroupOption[] = [
    { id: '0.08', label: 'Suave' },
    { id: '0.16', label: 'Expressive' },
    { id: '0.22', label: 'Vibrante' }
  ];

  readonly motionOptions: M3ButtonGroupOption[] = [
    { id: 'expressive', label: 'Expresivo', icon: 'animation' },
    { id: 'standard', label: 'Estándar', icon: 'speed' }
  ];

  readonly contrastOptions: M3ButtonGroupOption[] = [
    { id: 'standard', label: 'Estándar' },
    { id: 'medium', label: 'Medio' },
    { id: 'high', label: 'Alto' }
  ];

  private lastThemePointerEvent: MouseEvent | undefined;

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
    if (view === 'menu-appearance' || view === 'menu-main') return 'Opciones del Sistema';
    return this.activeTaskId() !== null ? 'Editar Tarea' : 'Nueva Tarea';
  }

  captureThemeSwitchEvent(event: MouseEvent): void {
    this.lastThemePointerEvent = event;
  }

  onDarkModeSwitchChanged(): void {
    this.themeService.toggleThemeMode(this.lastThemePointerEvent);
    this.lastThemePointerEvent = undefined;
  }

  onChromaSelect(selected: string[]): void {
    const val = Number(selected[0]);
    if (Number.isFinite(val)) this.themeService.setSeedChroma(val);
  }

  onContrastSelect(selected: string[]): void {
    const lvl = selected[0] as ContrastLevel | undefined;
    if (lvl) this.themeService.setContrastLevel(lvl);
  }

  onMotionSelect(selected: string[]): void {
    const scheme = selected[0] as MotionScheme | undefined;
    if (scheme) this.themeService.setMotionScheme(scheme);
  }

  onNavSelect(selected: string[]): void {
    const style = selected[0] as NavStyle | undefined;
    if (style) this.navStyleChange.emit(style);
  }

  onCategorySelect(selected: string[]): void {
    if (selected[0]) this.draftCategory.set(selected[0]);
  }

  onDateSelect(selected: string[]): void {
    const bucket = selected[0] as TaskDueBucket | undefined;
    if (bucket) this.draftDate.set(bucket);
  }

  onPrioritySelect(selected: string[]): void {
    const prio = selected[0] as TaskPriority | undefined;
    if (prio) this.draftPriority.set(prio);
  }

  onDurationSelect(selected: string[]): void {
    const mins = Number(selected[0]);
    if (!Number.isNaN(mins) && mins > 0) this.draftDuration.set(mins);
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
