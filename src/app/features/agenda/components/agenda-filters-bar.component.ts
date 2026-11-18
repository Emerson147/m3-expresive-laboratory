import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterStatus, TASK_CATEGORIES } from '../../../core/tasks/task.service';
import {
  M3SplitButtonComponent,
  M3SplitMenuItem
} from '../../../shared/components/button/button-group.component';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

export type AgendaTaskPresetId = 'deep-45' | 'review-25' | 'quick-15';

@Component({
  selector: 'app-agenda-filters-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    M3ButtonComponent,
    M3ChipComponent,
    M3SplitButtonComponent,
    M3SwitchComponent,
    M3TextFieldComponent
  ],
  host: {
    class: 'block w-full min-w-0'
  },
  template: `
    <div class="space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Landmark <search> sobre <m3-text-field> oficial -->
        <search class="flex-1 min-w-0 lg:max-w-lg">
          <m3-text-field
            [id]="'agenda-search-input'"
            variant="filled"
            type="search"
            label="Buscar actividades"
            placeholder="Título, categoría o nota..."
            icon="search"
            enterkeyhint="search"
            [clearable]="true"
            [value]="searchQuery()"
            (valueChange)="searchChange.emit($event)" />
        </search>

        <div class="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0">
          <!-- Switch binario inmediato (Biblia M3: sin Guardar, iconMode="selected" en barras densas) -->
          <div class="px-3.5 py-1.5 rounded-m3-lg bg-surface-low">
            <m3-switch
              label="Solo Hoy"
              iconMode="selected"
              [checked]="onlyToday()"
              (changed)="onlyTodayChange.emit($event)" />
          </div>

          @if (completedCount() > 0) {
            <m3-button
              variant="text"
              size="sm"
              icon="cleaning_services"
              (action)="requestClearCompleted.emit()">
              Limpiar completadas ({{ completedCount() }})
            </m3-button>
          }

          <!-- Único CTA primario 'filled' de la vista con plantillas vía Split Button y Container Transform -->
          <div class="hidden md:inline-flex shrink-0">
            <m3-split-button
              label="Nueva Actividad"
              icon="add"
              variant="filled"
              size="md"
              menuAriaLabel="Plantillas rápidas de actividad"
              [menuItems]="presetMenuItems"
              [invisible]="isDialogOpen() && activeOriginKey() === 'agenda-split-create'"
              [viewTransitionName]="isDialogTransitioning() && !isDialogOpen() && activeOriginKey() === 'agenda-split-create' ? 'dialog-transform' : null"
              (primaryAction)="createTask.emit()"
              (itemAction)="onPresetItemAction($event)" />
          </div>
        </div>
      </div>

      <!-- Chips unificados de estado y categoría con respiro horizontal y vertical -->
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 pt-0.5">
        <div class="flex flex-wrap items-center gap-2.5" role="group" aria-label="Filtrar por estado">
          <m3-chip
            type="filter"
            [selected]="filterStatus() === 'all'"
            [count]="totalCount()"
            (action)="statusChange.emit('all')">
            Todas
          </m3-chip>

          <m3-chip
            type="filter"
            [selected]="filterStatus() === 'pending'"
            [count]="pendingCount()"
            (action)="statusChange.emit('pending')">
            Pendientes
          </m3-chip>

          <m3-chip
            type="filter"
            [selected]="filterStatus() === 'completed'"
            [count]="completedCount()"
            (action)="statusChange.emit('completed')">
            Completadas
          </m3-chip>
        </div>

        <div class="flex flex-wrap items-center gap-2.5" role="group" aria-label="Filtrar por categoría">
          <m3-chip
            type="filter"
            icon="apps"
            [selected]="categoryFilter() === 'all'"
            (action)="categoryChange.emit('all')">
            Todas las áreas
          </m3-chip>

          @for (cat of categories; track cat.name) {
            @let active = categoryFilter() === cat.name;
            <m3-chip
              type="filter"
              [icon]="cat.icon"
              [selected]="active"
              (action)="categoryChange.emit(active ? 'all' : cat.name)">
              {{ cat.name }}
            </m3-chip>
          }
        </div>
      </div>
    </div>
  `
})
export class AgendaFiltersBarComponent {
  readonly categories = TASK_CATEGORIES;

  readonly presetMenuItems: M3SplitMenuItem[] = [
    { id: 'deep-45', label: 'Deep Work (45m · Prioridad Alta)', icon: 'bolt' },
    { id: 'review-25', label: 'Revisión técnica (25m)', icon: 'rate_review' },
    { id: 'quick-15', label: 'Seguimiento rápido (15m)', icon: 'schedule_send' }
  ];

  readonly searchQuery = input.required<string>();
  readonly filterStatus = input.required<FilterStatus>();
  readonly categoryFilter = input.required<string>();
  readonly onlyToday = input<boolean>(false);
  readonly totalCount = input.required<number>();
  readonly pendingCount = input.required<number>();
  readonly completedCount = input.required<number>();
  readonly isDialogOpen = input<boolean>(false);
  readonly isDialogTransitioning = input<boolean>(false);
  readonly activeOriginKey = input<string | null>(null);

  readonly searchChange = output<string>();
  readonly statusChange = output<FilterStatus>();
  readonly categoryChange = output<string>();
  readonly onlyTodayChange = output<boolean>();
  readonly requestClearCompleted = output<void>();
  readonly createTask = output<void>();
  readonly createPreset = output<AgendaTaskPresetId>();

  onPresetItemAction(id: string): void {
    this.createPreset.emit(id as AgendaTaskPresetId);
  }
}
