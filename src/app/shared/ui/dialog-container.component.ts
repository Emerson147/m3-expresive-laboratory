import { Component, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskPriority } from '../../core/tasks/task.service';
import { ThemeService } from '../../core/theme/theme.service';
import { DialogView, NavStyle, TriggerMode } from '../models/ui.models';
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
        style="view-transition-name: dialog-transform;"
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
              <div class="flex items-center gap-2.5 pt-1">
                @for (t of themeService.themes; track t.hue) {
                  <button 
                    (click)="themeService.setThemeHue(t.hue)" 
                    [class.ring-2]="themeService.currentHue() === t.hue"
                    [class.rounded-m3-md]="themeService.currentHue() === t.hue" 
                    [class.rounded-full]="themeService.currentHue() !== t.hue"
                    class="btn-m3 w-8 h-8 ring-offset-2 ring-offset-surface-box ring-primary cursor-pointer"
                    [style.background-color]="'oklch(65% 0.16 ' + t.hue + ')'">
                  </button>
                }
              </div>
            </div>

            <div class="space-y-2 pt-1">
              <label class="text-xs font-semibold text-muted uppercase tracking-wider">Navegación</label>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  (click)="navStyleChange.emit('rail')"
                  [class]="navStyle() === 'rail' ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-high text-muted hover:text-main'"
                  class="btn-m3 py-2 px-2.5 rounded-m3-md text-xs cursor-pointer">
                  Clásica
                </button>
                <button 
                  (click)="navStyleChange.emit('dock')"
                  [class]="navStyle() === 'dock' ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-high text-muted hover:text-main'"
                  class="btn-m3 py-2 px-2.5 rounded-m3-md text-xs cursor-pointer">
                  Dock
                </button>
                <button 
                  (click)="navStyleChange.emit('tunnel')"
                  [class]="navStyle() === 'tunnel' ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-high text-muted hover:text-main'"
                  class="btn-m3 py-2 px-2.5 rounded-m3-md text-xs cursor-pointer">
                  Tunnel
                </button>
              </div>
            </div>
          </div>
        }

        <!-- VISTA C: FORMULARIO DE CREACIÓN / EDICIÓN DE TAREA -->
        @if (dialogView() === 'task-form') {
          <div class="space-y-5 overflow-y-auto px-1">
            <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-primary-box text-on-primary-box grid place-items-center">
                  <span class="material-symbols-rounded text-lg">
                    {{ activeTaskId() !== null ? 'edit_calendar' : 'event' }}
                  </span>
                </div>
                <h2 class="text-lg font-bold">
                  {{ activeTaskId() !== null ? 'Editar Tarea' : 'Nueva Tarea' }}
                </h2>
              </div>
              <button 
                (click)="closeDialog.emit()" 
                class="btn-m3 p-2 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer">
                <span class="material-symbols-rounded text-xl">close</span>
              </button>
            </div>

            <div class="space-y-4">
              <m3-text-field 
                variant="filled"
                label="Título de la tarea"
                placeholder="Ej. Revisión arquitectónica de DenRaf"
                icon="edit_note"
                [clearable]="true"
                [maxlength]="80"
                [ngModel]="draftTitle()" 
                (ngModelChange)="draftTitle.set($event)"
                supportingText="Define el objetivo con claridad" />

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">Fecha</label>
                  <select 
                    [ngModel]="draftDate()" 
                    (ngModelChange)="draftDate.set($event)"
                    class="m3-select-field">
                    <option value="Hoy">Hoy</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Esta semana">Esta semana</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-muted uppercase tracking-wider pl-1">Prioridad</label>
                  <select 
                    [ngModel]="draftPriority()" 
                    (ngModelChange)="draftPriority.set($event)"
                    class="m3-select-field">
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <m3-text-field 
                variant="outlined"
                label="Notas de apoyo"
                placeholder="Detalles sobre entidades, puertos y adaptadores..."
                icon="description"
                [multiline]="true"
                [rows]="3"
                [maxlength]="300"
                [ngModel]="draftNotes()" 
                (ngModelChange)="draftNotes.set($event)"
                supportingText="Especificaciones y contexto técnico" />
            </div>
          </div>

          <div class="flex items-center justify-between pt-5 border-t border-outline-sub mt-4">
            @if (activeTaskId() !== null) {
              <m3-button 
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
                variant="text" 
                (action)="closeDialog.emit()">
                Cancelar
              </m3-button>
              <m3-button 
                variant="filled" 
                icon="check"
                (action)="saveTask.emit()">
                Guardar
              </m3-button>
            </div>
          </div>
        }

      </div>
    }
  `
})
export class DialogContainerComponent {
  readonly themeService = inject(ThemeService);

  readonly isDialogOpen = input.required<boolean>();
  readonly activeTrigger = input<TriggerMode | null>(null);
  readonly dialogView = input.required<DialogView>();
  readonly navStyle = input.required<NavStyle>();
  readonly activeTaskId = input<number | null>(null);

  readonly draftTitle = model<string>('');
  readonly draftCategory = model<string>('Frontend Angular');
  readonly draftDate = model<string>('Hoy');
  readonly draftPriority = model<TaskPriority>('Alta');
  readonly draftNotes = model<string>('');

  readonly closeDialog = output<void>();
  readonly saveTask = output<void>();
  readonly deleteTask = output<void>();
  readonly morphView = output<{ targetView: DialogView; moveCenter?: boolean }>();
  readonly navStyleChange = output<NavStyle>();
}
