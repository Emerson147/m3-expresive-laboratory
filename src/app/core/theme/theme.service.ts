import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type ContrastLevel = 'standard' | 'medium' | 'high';
export type MotionScheme = 'expressive' | 'standard';

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
  readonly seedChroma = signal<number>(0.16);
  readonly contrastLevel = signal<ContrastLevel>('standard');
  readonly motionScheme = signal<MotionScheme>('expressive');
  readonly themes = THEME_OPTIONS;

  setThemeHue(hue: number): void {
    this.currentHue.set(hue);
    this.document.documentElement.style.setProperty('--seed-hue', hue.toString());
  }

  setSeedChroma(chroma: number): void {
    if (!Number.isFinite(chroma)) return;
    const clamped = Math.min(0.22, Math.max(0, Number(chroma.toFixed(3))));
    this.seedChroma.set(clamped);
    this.document.documentElement.style.setProperty('--seed-chroma', clamped.toString());
  }

  setContrastLevel(level: ContrastLevel): void {
    this.contrastLevel.set(level);
    if (level === 'standard') {
      this.document.documentElement.removeAttribute('data-contrast');
    } else {
      this.document.documentElement.setAttribute('data-contrast', level);
    }
  }

  setMotionScheme(scheme: MotionScheme): void {
    this.motionScheme.set(scheme);
    if (scheme === 'standard') {
      this.document.documentElement.setAttribute('data-motion-scheme', 'standard');
    } else {
      this.document.documentElement.removeAttribute('data-motion-scheme');
    }
  }

  toggleThemeMode(event?: MouseEvent): void {
    const nextDark = !this.isDarkMode();
    if (this.prefersReducedMotion() || !event) {
      this.applyThemeState(nextDark);
      return;
    }
    if (this.hasViewTransitions()) {
      this.runNativeThemeTransition(nextDark, event);
      return;
    }
    this.runRippleThemeTransition(nextDark, event);
  }

  private prefersReducedMotion(): boolean {
    return !!this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
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

    transition?.finished
      ?.finally(() => {
        docEl.classList.remove('theme-transition');
      })
      .catch(() => {});
  }

  private runRippleThemeTransition(nextDark: boolean, event: MouseEvent): void {
    const { x, y, endRadius } = this.getRadialGeometry(event);
    const ripple = this.document.createElement('div');
    ripple.className = 'fixed inset-0 pointer-events-none z-[9999]';

    this.applyThemeState(nextDark);
    ripple.style.backgroundColor = 'var(--md-sys-color-surface)';
    this.document.body.appendChild(ripple);

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
