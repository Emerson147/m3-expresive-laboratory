import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { DialogService } from '../../core/dialog/dialog.service';
import { ThemeService } from '../../core/theme/theme.service';
import {
  APP_NAV_DESTINATIONS,
  AppSection,
  DESIGN_SYSTEM_STEPS,
  NavStyle
} from '../models/ui.models';
import { closeTopLayerDialog } from './top-layer.utils';

export interface CommandPaletteItem {
  readonly id: string;
  readonly group: 'Módulos' | 'Design System' | 'Acciones';
  readonly label: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly keywords: string;
  readonly badge?: string;
  readonly isActive?: boolean;
  readonly execute: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  host: {
    class: 'contents'
  },
  template: `
    <dialog
      #paletteDialog
      class="m3-dialog m3-command-dialog shadow-m3-level4 text-main"
      closedby="any"
      aria-labelledby="command-palette-title"
      (cancel)="onNativeCancel($event)"
      (close)="onNativeClose()"
      (click)="onBackdropClick($event)">
      <div class="flex flex-col max-h-[min(560px,calc(100dvh-48px))]">
        <h2 id="command-palette-title" class="sr-only">Navegación rápida y comandos del sistema</h2>

        <search class="px-4 py-3 bg-surface-box flex items-center gap-3">
          <span class="material-symbols-rounded text-xl text-primary shrink-0" aria-hidden="true">
            search
          </span>
          <label for="command-palette-input" class="sr-only">Buscar módulo, laboratorio o acción</label>
          <input
            #searchInput
            id="command-palette-input"
            type="search"
            autocomplete="off"
            [value]="query()"
            (input)="onQueryInput($event)"
            (keydown)="onInputKeydown($event)"
            placeholder="Ir a módulo, paso del Design System o acción..."
            class="flex-1 min-w-0 bg-transparent border-0 outline-none text-body-md text-main placeholder:text-muted" />
          <kbd class="px-2 py-0.5 rounded-m3-sm bg-surface-high text-muted text-[11px] font-mono shrink-0">
            ESC
          </kbd>
        </search>

        <div class="overflow-y-auto p-2.5 space-y-3 m3-scrollbar" role="region" aria-label="Resultados de navegación">
          @let items = filteredItems();
          @if (items.length === 0) {
            <div class="py-10 px-4 text-center space-y-2">
              <span class="material-symbols-rounded text-3xl text-muted" aria-hidden="true">
                travel_explore
              </span>
              <p class="text-body-md font-semibold text-main">Sin coincidencias para "{{ query() }}"</p>
              <p class="text-body-sm text-muted">
                Prueba con "clínica", "pos", "oklch", "dock" o "tema".
              </p>
            </div>
          } @else {
            @for (group of groupedResults(); track group.name) {
              <section class="space-y-1">
                <p class="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {{ group.name }}
                </p>
                <ul role="list" class="list-none m-0 p-0 space-y-0.5">
                  @for (entry of group.entries; track entry.item.id) {
                    @let isHighlighted = activeIndex() === entry.flatIndex;
                    <li>
                      <button
                        type="button"
                        (mouseenter)="activeIndex.set(entry.flatIndex)"
                        (click)="runItem(entry.item)"
                        [class]="isHighlighted
                          ? 'bg-sec-box text-on-sec-box'
                          : 'text-main hover:bg-surface-high'"
                        class="btn-m3 w-full px-3 py-2.5 rounded-m3-lg flex items-center justify-between gap-3 text-left cursor-pointer">
                        <span class="flex items-center gap-3 min-w-0">
                          <span
                            [class]="isHighlighted ? 'bg-surface-lowest/80 text-primary' : 'bg-surface text-muted'"
                            class="w-8 h-8 rounded-m3-md grid place-items-center shrink-0">
                            <span class="material-symbols-rounded text-lg" aria-hidden="true">
                              {{ entry.item.icon }}
                            </span>
                          </span>
                          <span class="min-w-0">
                            <span class="block text-body-sm font-semibold truncate">
                              {{ entry.item.label }}
                            </span>
                            <span class="block text-[11px] text-muted truncate">
                              {{ entry.item.subtitle }}
                            </span>
                          </span>
                        </span>

                        <span class="flex items-center gap-2 shrink-0">
                          @if (entry.item.isActive) {
                            <span class="px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-semibold">
                              Actual
                            </span>
                          } @else if (entry.item.badge) {
                            <span class="px-2 py-0.5 rounded-m3-full bg-surface text-muted text-[10px] font-mono">
                              {{ entry.item.badge }}
                            </span>
                          }
                          <span class="material-symbols-rounded text-base opacity-60" aria-hidden="true">
                            keyboard_return
                          </span>
                        </span>
                      </button>
                    </li>
                  }
                </ul>
              </section>
            }
          }
        </div>

        <footer class="px-4 py-2 bg-surface-box/70 flex items-center justify-between text-[11px] text-muted">
          <span class="flex items-center gap-3">
            <span><kbd class="font-mono">↑↓</kbd> navegar</span>
            <span><kbd class="font-mono">↵</kbd> ejecutar</span>
          </span>
          <span class="font-mono">{{ items.length }} comandos</span>
        </footer>
      </div>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandPaletteComponent {
  private readonly themeService = inject(ThemeService);
  private readonly dialogService = inject(DialogService);

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('paletteDialog');
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly isOpen = input.required<boolean>();
  readonly currentSection = input<AppSection>('overview');

  readonly closed = output<void>();
  readonly navigate = output<string>();
  readonly openQuickTask = output<void>();

  readonly query = signal<string>('');
  readonly activeIndex = signal<number>(0);

  readonly allItems = computed<readonly CommandPaletteItem[]>(() => {
    const activeSection = this.currentSection();

    const moduleItems: CommandPaletteItem[] = APP_NAV_DESTINATIONS.map((dest) => ({
      id: `nav-${dest.section}`,
      group: 'Módulos',
      label: dest.label,
      subtitle: dest.group === 'core' ? `Núcleo · ${dest.route}` : `Workbench · ${dest.route}`,
      icon: dest.icon,
      keywords: [dest.label, dest.shortLabel, dest.tunnelLabel ?? '', ...(dest.keywords ?? [])]
        .join(' ')
        .toLowerCase(),
      isActive: activeSection === dest.section,
      execute: () => this.navigate.emit(dest.route)
    }));

    const dsItems: CommandPaletteItem[] = DESIGN_SYSTEM_STEPS.map((step) => ({
      id: `ds-${step.path}`,
      group: 'Design System',
      label: step.label,
      subtitle: step.route,
      icon: step.icon,
      keywords: `design system biblia m3 ${step.label} ${step.navLabel} ${step.path}`.toLowerCase(),
      execute: () => this.navigate.emit(step.route)
    }));

    const navLabels: Record<NavStyle, string> = {
      auto: 'Auto (M3)',
      rail: 'Rail Lateral',
      dock: 'Dock Curado',
      tunnel: 'Focus Bar (Tunnel)'
    };

    const actionItems: CommandPaletteItem[] = [
      {
        id: 'action-toggle-theme',
        group: 'Acciones',
        label: this.themeService.isDarkMode() ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro',
        subtitle: 'Alternar luminancia OKLCH del sistema',
        icon: this.themeService.isDarkMode() ? 'light_mode' : 'dark_mode',
        keywords: 'tema oscuro claro dark light mode apariencia',
        execute: () => this.themeService.toggleThemeMode()
      },
      {
        id: 'action-new-task',
        group: 'Acciones',
        label: 'Nueva tarea rápida',
        subtitle: 'Abrir formulario de creación de tarea',
        icon: 'add_task',
        keywords: 'crear nueva tarea agenda pendiente',
        execute: () => this.openQuickTask.emit()
      },
      ...(['auto', 'rail', 'dock', 'tunnel'] as const).map((style) => ({
        id: `action-nav-${style}`,
        group: 'Acciones' as const,
        label: `Modo de navegación: ${navLabels[style]}`,
        subtitle: 'Cambiar disposición adaptativa del shell',
        icon: style === 'dock' ? 'dock_to_bottom' : style === 'tunnel' ? 'web_asset' : 'side_navigation',
        keywords: `navegacion chrome ${style} ${navLabels[style]}`.toLowerCase(),
        badge: this.dialogService.navStyle() === style ? 'Activo' : undefined,
        execute: () => this.dialogService.setNavStyle(style)
      }))
    ];

    return [...moduleItems, ...dsItems, ...actionItems];
  });

  readonly filteredItems = computed<readonly CommandPaletteItem[]>(() => {
    const term = this.query().trim().toLowerCase();
    const items = this.allItems();
    if (!term) return items;

    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term) ||
        item.keywords.includes(term)
    );
  });

  readonly groupedResults = computed(() => {
    const groups: {
      name: CommandPaletteItem['group'];
      entries: { item: CommandPaletteItem; flatIndex: number }[];
    }[] = [];

    const order: readonly CommandPaletteItem['group'][] = ['Módulos', 'Design System', 'Acciones'];
    const flat = this.filteredItems();

    for (const groupName of order) {
      const entries = flat
        .map((item, flatIndex) => ({ item, flatIndex }))
        .filter((entry) => entry.item.group === groupName);
      if (entries.length > 0) {
        groups.push({ name: groupName, entries });
      }
    }

    return groups;
  });

  constructor() {
    effect(() => {
      const shouldOpen = this.isOpen();
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;

      if (shouldOpen) {
        this.query.set('');
        this.activeIndex.set(0);

        if (!dialog.open && !dialog.hasAttribute('open')) {
          if (typeof dialog.showModal === 'function') {
            try {
              dialog.showModal();
            } catch {
              dialog.setAttribute('open', '');
            }
          } else {
            dialog.setAttribute('open', '');
          }
        }

        queueMicrotask(() => {
          this.searchInputRef()?.nativeElement.focus();
        });
      } else if (dialog.open || dialog.hasAttribute('open')) {
        void closeTopLayerDialog(dialog);
      }
    });
  }

  protected onQueryInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.query.set(target?.value ?? '');
    this.activeIndex.set(0);
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const total = this.filteredItems().length;
    if (total === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => (i + 1) % total);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => (i - 1 + total) % total);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.activeIndex.set(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.activeIndex.set(total - 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = this.filteredItems()[this.activeIndex()];
      if (selected) {
        this.runItem(selected);
      }
    }
  }

  protected runItem(item: CommandPaletteItem): void {
    void this.finishAndExecute(item);
  }

  private async finishAndExecute(item: CommandPaletteItem): Promise<void> {
    await closeTopLayerDialog(this.dialogRef()?.nativeElement);
    if (this.isOpen()) {
      this.closed.emit();
    }
    item.execute();
  }

  protected onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (dialog && event.target === dialog) {
      this.requestClose();
    }
  }

  protected onNativeCancel(event: Event): void {
    event.preventDefault();
    this.requestClose();
  }

  protected onNativeClose(): void {
    if (this.isOpen()) {
      this.closed.emit();
    }
  }

  requestClose(): void {
    void closeTopLayerDialog(this.dialogRef()?.nativeElement).then(() => {
      if (this.isOpen()) {
        this.closed.emit();
      }
    });
  }
}
