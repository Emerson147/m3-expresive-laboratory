import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterStatus, TASK_CATEGORIES } from '../../../core/tasks/task.service';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3ChipComponent } from '../../../shared/components/chip/chip.component';

@Component({
  selector: 'app-agenda-filters-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3ButtonComponent, M3ChipComponent],
  template: `
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <!-- Landmark <search> nativo -->
        <search class="flex-1 min-w-0 max-w-md">
          <div class="relative flex items-center bg-surface-low rounded-full px-3.5 min-h-[44px] focus-within:ring-2 focus-within:ring-primary transition-shadow">
            <span class="material-symbols-rounded text-lg text-muted shrink-0 mr-2" aria-hidden="true">
              search
            </span>
            <label for="agenda-search-input" class="sr-only">Buscar actividades por título, categoría o nota</label>
            <input
              id="agenda-search-input"
              type="search"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              enterkeyhint="search"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Buscar tarea, módulo o nota..."
              class="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-main placeholder:text-muted" />
            @if (searchQuery()) {
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                (click)="searchChange.emit('')"
                class="btn-m3 p-1.5 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer shrink-0">
                <span class="material-symbols-rounded text-base" aria-hidden="true">close</span>
              </button>
            }
          </div>
        </search>

        <div class="flex items-center gap-2 shrink-0">
          <m3-button
            variant="filled"
            size="md"
            icon="add"
            (action)="createTask.emit()">
            Nueva Actividad
          </m3-button>
        </div>
      </div>

      <!-- Filtros por estado y categoría -->
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
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

        <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por categoría">
          <button
            type="button"
            [attr.aria-pressed]="categoryFilter() === 'all'"
            (click)="categoryChange.emit('all')"
            [class]="categoryFilter() === 'all'
              ? 'bg-sec-box text-on-sec-box font-semibold'
              : 'bg-surface-low text-muted hover:text-main hover:bg-surface-high'"
            class="agenda-pill-toggle focus-ring-m3 px-3 py-1 text-xs cursor-pointer">
            Todas las áreas
          </button>

          @for (cat of categories; track cat.name) {
            @let active = categoryFilter() === cat.name;
            <button
              type="button"
              [attr.aria-pressed]="active"
              (click)="categoryChange.emit(active ? 'all' : cat.name)"
              [class]="active
                ? 'bg-sec-box text-on-sec-box font-semibold'
                : 'bg-surface-low text-muted hover:text-main hover:bg-surface-high'"
              class="agenda-pill-toggle focus-ring-m3 px-3 py-1 text-xs inline-flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-rounded text-sm shrink-0" aria-hidden="true">{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class AgendaFiltersBarComponent {
  readonly categories = TASK_CATEGORIES;

  readonly searchQuery = input.required<string>();
  readonly filterStatus = input.required<FilterStatus>();
  readonly categoryFilter = input.required<string>();
  readonly totalCount = input.required<number>();
  readonly pendingCount = input.required<number>();
  readonly completedCount = input.required<number>();

  readonly searchChange = output<string>();
  readonly statusChange = output<FilterStatus>();
  readonly categoryChange = output<string>();
  readonly createTask = output<void>();

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchChange.emit(target?.value ?? '');
  }
}
