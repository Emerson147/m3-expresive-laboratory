import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { M3ButtonSize } from './button.component';

export interface M3ButtonGroupOption {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface M3SplitMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

let nextOverlaySeq = 0;

@Component({
  selector: 'm3-button-group',
  standalone: true,
  host: {
    class: 'inline-block max-w-full'
  },
  template: `
    <div
      role="group"
      [attr.aria-label]="ariaLabel()"
      [class]="groupClasses()">
      @for (option of options(); track option.id) {
        <button
          type="button"
          [disabled]="option.disabled || disabled()"
          [attr.aria-pressed]="isSelected(option.id)"
          [class]="itemClasses(option.id)"
          (click)="onSelect(option)">
          @if (isSelected(option.id)) {
            <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">check</span>
          } @else if (option.icon) {
            <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">{{ option.icon }}</span>
          }
          <span class="truncate">{{ option.label }}</span>
        </button>
      }
    </div>
  `
})
export class M3ButtonGroupComponent {
  /** Standard (8dp gap) or Connected (2px inner divider replacing deprecated Segmented Buttons) */
  readonly variant = input<'standard' | 'connected'>('connected');
  readonly selectionMode = input<'single' | 'multi'>('single');
  readonly size = input<M3ButtonSize>('md');
  readonly options = input<M3ButtonGroupOption[]>([]);
  readonly value = model<string[]>([]);
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string>('Button group');

  readonly selectionChange = output<string[]>();

  readonly groupClasses = computed(() =>
    this.variant() === 'standard'
      ? 'm3-btn-group m3-btn-group-standard'
      : 'm3-btn-group m3-btn-group-connected'
  );

  isSelected(id: string): boolean {
    return this.value().includes(id);
  }

  itemClasses(id: string): string {
    const selected = this.isSelected(id);
    const baseVariant =
      this.variant() === 'standard'
        ? selected
          ? 'm3-btn-filled'
          : 'm3-btn-tonal'
        : 'm3-group-item';

    const classes = [
      'm3-btn',
      'm3-btn-toggle',
      'state-layer',
      'focus-ring-m3',
      'touch-target-48',
      `m3-btn-${this.size()}`,
      baseVariant
    ];

    if (selected) {
      classes.push('is-selected');
    }

    return classes.join(' ');
  }

  onSelect(option: M3ButtonGroupOption): void {
    if (this.disabled() || option.disabled) return;
    const current = this.value();
    let next: string[];

    if (this.selectionMode() === 'single') {
      next = [option.id];
    } else {
      next = current.includes(option.id)
        ? current.filter((item) => item !== option.id)
        : [...current, option.id];
    }

    this.value.set(next);
    this.selectionChange.emit(next);
  }
}

@Component({
  selector: 'm3-split-button',
  standalone: true,
  host: {
    class: 'inline-block relative'
  },
  template: `
    <div class="m3-split-btn">
      <button
        type="button"
        [disabled]="disabled()"
        [class]="leadingClasses()"
        (click)="onPrimaryClick()">
        @if (icon()) {
          <span class="material-symbols-rounded text-lg shrink-0" aria-hidden="true">{{ icon() }}</span>
        }
        <span>{{ label() }}</span>
      </button>

      <button
        type="button"
        [disabled]="disabled()"
        [attr.aria-label]="menuAriaLabel()"
        [attr.aria-haspopup]="'menu'"
        [attr.aria-expanded]="menuOpen()"
        [attr.aria-controls]="popoverId"
        [class]="trailingClasses()"
        (click)="toggleMenu($event)">
        <span class="material-symbols-rounded text-lg m3-split-btn-chevron" aria-hidden="true">
          expand_more
        </span>
      </button>

      <div
        #menuEl
        [id]="popoverId"
        popover="auto"
        role="menu"
        class="m3-popover-menu"
        [class.is-fallback]="!supportsNativePopover"
        [class.is-fallback-open]="!supportsNativePopover && menuOpen()"
        (toggle)="onNativeToggle($event)">
        @for (item of menuItems(); track item.id) {
          <button
            type="button"
            role="menuitem"
            [disabled]="item.disabled || disabled()"
            class="m3-popover-item state-layer focus-ring-m3"
            (click)="selectMenuItem(item)">
            @if (item.icon) {
              <span class="material-symbols-rounded text-lg text-muted shrink-0" aria-hidden="true">{{ item.icon }}</span>
            }
            <span class="truncate">{{ item.label }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class M3SplitButtonComponent {
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input.required<string>();
  readonly icon = input<string | null>(null);
  readonly variant = input<'filled' | 'tonal' | 'outlined'>('filled');
  readonly size = input<M3ButtonSize>('md');
  readonly menuItems = input<M3SplitMenuItem[]>([]);
  readonly disabled = input<boolean>(false);
  readonly menuAriaLabel = input<string>('Más opciones');

  readonly primaryAction = output<void>();
  readonly itemAction = output<string>();

  readonly popoverId = `m3-split-menu-${++nextOverlaySeq}`;
  readonly menuOpen = signal<boolean>(false);
  readonly menuEl = viewChild<ElementRef<HTMLElement>>('menuEl');

  /** Progressive detection per Baseline Popover spec */
  readonly supportsNativePopover =
    typeof HTMLElement !== 'undefined' &&
    'popover' in HTMLElement.prototype &&
    typeof HTMLElement.prototype.showPopover === 'function';

  constructor() {
    if (!this.supportsNativePopover && typeof document !== 'undefined') {
      const onDocClick = (event: MouseEvent) => {
        if (this.menuOpen() && !this.hostEl.nativeElement.contains(event.target as Node)) {
          this.menuOpen.set(false);
        }
      };
      const onDocKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.menuOpen()) {
          this.menuOpen.set(false);
        }
      };
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onDocKey);
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onDocKey);
      });
    }
  }

  readonly leadingClasses = computed(() =>
    [
      'm3-btn',
      'm3-split-btn-leading',
      'state-layer',
      'focus-ring-m3',
      'touch-target-48',
      `m3-btn-${this.variant()}`,
      `m3-btn-${this.size()}`,
      this.icon() ? 'has-icon-leading' : ''
    ]
      .filter(Boolean)
      .join(' ')
  );

  readonly trailingClasses = computed(() =>
    [
      'm3-btn',
      'm3-split-btn-trailing',
      'state-layer',
      'focus-ring-m3',
      'touch-target-48',
      `m3-btn-${this.variant()}`,
      `m3-btn-${this.size()}`
    ].join(' ')
  );

  onPrimaryClick(): void {
    if (!this.disabled()) {
      this.primaryAction.emit();
    }
  }

  toggleMenu(event: MouseEvent): void {
    if (this.disabled()) return;
    const menu = this.menuEl()?.nativeElement;

    if (this.supportsNativePopover && menu && typeof menu.togglePopover === 'function') {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.inset = 'auto';
      menu.style.top = `${Math.round(rect.bottom + 6)}px`;
      menu.style.right = `${Math.max(12, Math.round(window.innerWidth - rect.right))}px`;
      menu.togglePopover();
    } else {
      this.menuOpen.update((v) => !v);
    }
  }

  onNativeToggle(event: Event): void {
    const toggleEvent = event as Event & { newState?: string };
    this.menuOpen.set(toggleEvent.newState === 'open');
  }

  selectMenuItem(item: M3SplitMenuItem): void {
    if (item.disabled || this.disabled()) return;
    this.itemAction.emit(item.id);
    this.closeMenu();
  }

  closeMenu(): void {
    const menu = this.menuEl()?.nativeElement;
    if (this.supportsNativePopover && menu && typeof menu.hidePopover === 'function') {
      try {
        menu.hidePopover();
      } catch {
        this.menuOpen.set(false);
      }
    } else {
      this.menuOpen.set(false);
    }
  }
}

