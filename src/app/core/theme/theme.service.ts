import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export interface ThemeOption {
  readonly name: string;
  readonly hue: number;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { name: 'Iris Google (Default)', hue: 275 },
  { name: 'Azul Google', hue: 235 },
  { name: 'Verde Salvia Pixel', hue: 155 },
  { name: 'Terracota / Coral', hue: 25 },
  { name: 'Ámbar Cálido', hue: 50 },
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly isDarkMode = signal<boolean>(false);
  readonly currentHue = signal<number>(275);
  readonly themes = THEME_OPTIONS;

  setThemeHue(hue: number): void {
    this.currentHue.set(hue);
    this.document.documentElement.style.setProperty('--seed-hue', hue.toString());
  }

  toggleThemeMode(event?: MouseEvent): void {
    const nextDark = !this.isDarkMode();
    if (this.hasViewTransitions() && event) {
      this.runNativeThemeTransition(nextDark, event);
      return;
    }
    if (event) {
      this.runRippleThemeTransition(nextDark, event);
      return;
    }
    this.applyThemeState(nextDark);
  }

  private applyThemeState(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    if (isDark) {
      this.document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.document.documentElement.removeAttribute('data-theme');
    }
  }

  private getRadialGeometry(event: MouseEvent): { x: number; y: number; endRadius: number } {
    const { clientX: x, clientY: y } = event;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    return { x, y, endRadius };
  }

  private runNativeThemeTransition(nextDark: boolean, event: MouseEvent): void {
    const { x, y, endRadius } = this.getRadialGeometry(event);
    const docEl = this.document.documentElement;

    docEl.style.setProperty('--theme-x', `${x}px`);
    docEl.style.setProperty('--theme-y', `${y}px`);
    docEl.style.setProperty('--theme-r', `${endRadius}px`);
    docEl.classList.add('theme-transition');

    const transition = (this.document as any).startViewTransition(() => {
      this.applyThemeState(nextDark);
    });

    transition?.finished?.finally(() => {
      docEl.classList.remove('theme-transition');
    });
  }

  private runRippleThemeTransition(nextDark: boolean, event: MouseEvent): void {
    const { x, y, endRadius } = this.getRadialGeometry(event);
    const ripple = this.document.createElement('div');
    ripple.className = 'fixed inset-0 pointer-events-none z-[9999]';
    ripple.style.backgroundColor = nextDark
      ? 'oklch(12% 0.016 var(--seed-hue))'
      : 'oklch(98% 0.005 var(--seed-hue))';
    this.document.body.appendChild(ripple);

    this.applyThemeState(nextDark);

    const anim = ripple.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
      ],
      { duration: 450, easing: 'cubic-bezier(0.2, 0, 0, 1)' }
    );
    anim.onfinish = () => ripple.remove();
  }

  hasViewTransitions(): boolean {
    return typeof (this.document as any).startViewTransition === 'function';
  }
}
