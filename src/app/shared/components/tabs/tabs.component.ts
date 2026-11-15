import { Component, ElementRef, computed, input, model, output, viewChildren } from '@angular/core';

export type M3TabVariant = 'primary' | 'secondary';

export interface M3TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  panelId?: string;
}

/**
 * Material 3 Tabs component implementing Primary (3dp rounded active bar, 48/64dp)
 * and Secondary (2dp full-tab active bar, 48dp) tabs with WAI-ARIA Roving Tabindex
 * and RTL-aware Arrow/Home/End keyboard navigation.
 */
@Component({
  selector: 'm3-tabs',
  standalone: true,
  host: {
    class: 'block w-full'
  },
  template: `
    <div
      role="tablist"
      [attr.aria-label]="ariaLabel()"
      [class]="tablistClasses()">
      @for (tab of tabs(); track tab.id; let i = $index) {
        <button
          #tabButton
          type="button"
          role="tab"
          class="m3-tab state-layer focus-ring-m3"
          [class.has-icon-stacked]="variant() === 'primary' && !!tab.icon"
          [id]="tabElementId(tab.id)"
          [disabled]="!!tab.disabled"
          [attr.aria-selected]="activeTabId() === tab.id"
          [attr.aria-controls]="tab.panelId || null"
          [attr.tabindex]="activeTabId() === tab.id ? 0 : -1"
          (click)="selectTab(tab)"
          (keydown)="onKeydown($event, i)">
          @if (tab.icon) {
            <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ tab.icon }}</span>
          }
          <span class="inline-flex items-center gap-1.5">
            <span>{{ tab.label }}</span>
            @if (tab.badge !== undefined && tab.badge !== null) {
              <span class="px-1.5 py-0.5 rounded-full bg-sec-box text-on-sec-box text-[10px] font-bold leading-none">
                {{ tab.badge }}
              </span>
            }
          </span>
          <span class="m3-tab-indicator" aria-hidden="true"></span>
        </button>
      }
    </div>
  `
})
export class M3TabsComponent {
  readonly tabs = input.required<M3TabItem[]>();
  readonly value = model<string>('');
  readonly variant = input<M3TabVariant>('primary');
  readonly ariaLabel = input<string>('Secciones');
  readonly idPrefix = input<string>('m3-tab');

  readonly tabChange = output<string>();

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  readonly activeTabId = computed(() => {
    const items = this.tabs();
    const current = this.value();
    if (current && items.some((t) => t.id === current && !t.disabled)) {
      return current;
    }
    return items.find((t) => !t.disabled)?.id ?? items[0]?.id ?? '';
  });

  readonly tablistClasses = computed(() =>
    this.variant() === 'secondary' ? 'm3-tablist m3-tablist-secondary' : 'm3-tablist m3-tablist-primary'
  );

  tabElementId(id: string): string {
    return `${this.idPrefix()}-${id}`;
  }

  selectTab(tab: M3TabItem): void {
    if (tab.disabled) return;
    if (this.value() !== tab.id) {
      this.value.set(tab.id);
      this.tabChange.emit(tab.id);
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const items = this.tabs();
    if (items.length === 0) return;

    const isRtl =
      typeof getComputedStyle === 'function' &&
      event.currentTarget instanceof HTMLElement &&
      getComputedStyle(event.currentTarget).direction === 'rtl';

    let step = 0;
    if (event.key === 'ArrowRight') step = isRtl ? -1 : 1;
    else if (event.key === 'ArrowLeft') step = isRtl ? 1 : -1;
    else if (event.key === 'Home') {
      event.preventDefault();
      this.focusFirstMatching(0, 1);
      return;
    } else if (event.key === 'End') {
      event.preventDefault();
      this.focusFirstMatching(items.length - 1, -1);
      return;
    } else {
      return;
    }

    event.preventDefault();
    const total = items.length;
    for (let offset = 1; offset <= total; offset++) {
      const candidateIndex = (index + step * offset + total) % total;
      const candidate = items[candidateIndex];
      if (candidate && !candidate.disabled) {
        this.activateByIndex(candidateIndex);
        return;
      }
    }
  }

  private focusFirstMatching(startIndex: number, step: 1 | -1): void {
    const items = this.tabs();
    for (let idx = startIndex; idx >= 0 && idx < items.length; idx += step) {
      if (!items[idx].disabled) {
        this.activateByIndex(idx);
        return;
      }
    }
  }

  private activateByIndex(index: number): void {
    const item = this.tabs()[index];
    if (!item) return;
    this.selectTab(item);
    this.tabButtons()[index]?.nativeElement.focus();
  }
}
