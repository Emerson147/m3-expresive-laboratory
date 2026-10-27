# Material 3 Expressive — Complete Foundations & Interaction Architecture

> **Authoritative Engineering Reference**: Translation of official [m3.material.io/foundations](https://m3.material.io/foundations) specifications into production-grade CSS, accessibility standards, and reactive Angular signals.

---

## 1. Architectural Philosophy: The Laws of Interaction

While **Styles** define the static materials of your design system (tokens, colors, shapes), **Foundations** define the physical laws that govern user interaction:
- How surfaces respond to touch and cursor hover (**State Layers**).
- How the system ensures physical usability on mobile devices (**Touch Targets**).
- How keyboard and assistive technology navigate surfaces safely (**Dual Focus Rings**).
- How layout hierarchy adapts to different screen geometries (**Window Size Classes**).

---

## 2. Universal State Layer Engine

### The Problem with Ad-Hoc Hovers
Most web applications alter button colors on hover by modifying `background-color` or applying CSS `filter: brightness()`. This causes:
1. Loss of contrast compliance on colored backgrounds.
2. Inconsistent color tints when shifting between light and dark themes.
3. Repaint performance overhead.

### The M3 State Layer Solution
Material 3 applies a semi-transparent overlay using the element's designated `on-*` color (e.g., `on-primary` for primary buttons, `on-surface` for cards).

Using CSS `currentColor` on an isolated `::before` pseudo-element allows a single utility class (`.state-layer`) to automatically inherit the correct text ink for any element:

```css
.state-layer {
  position: relative;
  overflow: hidden;
  transition: transform 150ms var(--md-sys-motion-easing-spring);
}

.state-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms var(--md-sys-motion-easing-linear);
}

/* Official M3 Opacity Tokens */
.state-layer:hover::before {
  opacity: var(--md-sys-state-hover-opacity);   /* 0.08 (8%) */
}

.state-layer:focus-visible::before {
  opacity: var(--md-sys-state-focus-opacity);   /* 0.10 (10%) */
}

.state-layer:active {
  transform: scale(0.975);                      /* Spring tactile press */
}

.state-layer:active::before {
  opacity: var(--md-sys-state-pressed-opacity); /* 0.12 (12%) */
}
```

---

## 3. Accessibility Standards: Focus Rings & Touch Targets

### Dual Focus Ring (`.focus-ring-m3`)
Browsers defaults outlines clash with dark surfaces. M3 mandates a dual contour:
- **Inner ring**: Surface color (2px separation).
- **Outer ring**: Primary brand color (4px high-contrast stroke).

```css
.focus-ring-m3:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--md-sys-color-surface),
    0 0 0 4px var(--md-sys-color-primary);
}
```

### 48×48dp Minimum Touch Target (`.touch-target-48`)
Mobile human fingers have an average contact width of 10-12mm. Icons smaller than 48px must expand their touchable hitbox invisibly without distorting the visual layout:

```css
.touch-target-48 {
  position: relative;
}

.touch-target-48::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 48px;
  min-height: 48px;
  width: 100%;
  height: 100%;
}
```

---

## 4. Adaptive Layout: Window Size Classes

Material 3 categorizes all device viewports into 3 canonical **Window Size Classes**:

| Window Class | Breakpoint | Target Form Factor | Recommended Navigation Pattern |
| :--- | :--- | :--- | :--- |
| **Compact** | `< 600dp` | Mobile phones | Bottom Navigation Bar / Floating Dock |
| **Medium** | `600dp – 839dp` | Tablets, foldables | Navigation Rail |
| **Expanded** | `≥ 840dp` | Desktop, landscape tablets | Expanded Rail or Persistent Drawer |

### Reactive Implementation (`AdaptiveLayoutService`)

```typescript
import { computed, inject, Injectable, signal } from '@angular/core';

export type WindowSizeClass = 'compact' | 'medium' | 'expanded';

@Injectable({ providedIn: 'root' })
export class AdaptiveLayoutService {
  readonly windowWidth = signal<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  readonly windowSizeClass = computed<WindowSizeClass>(() => {
    const width = this.windowWidth();
    if (width < 600) return 'compact';
    if (width < 840) return 'medium';
    return 'expanded';
  });

  readonly isCompact = computed(() => this.windowSizeClass() === 'compact');
  readonly isMedium = computed(() => this.windowSizeClass() === 'medium');
  readonly isExpanded = computed(() => this.windowSizeClass() === 'expanded');
}
```

---

## 5. How to Replicate Foundations in Future Projects

1. **Include Interaction Styles**:
   - Add `src/styles/_interaction.css` containing `.state-layer`, `.focus-ring-m3`, and `.touch-target-48`.
2. **Apply State Layers**:
   - Replace manual hover classes with `class="state-layer focus-ring-m3 touch-target-48"`.
3. **Inject Adaptive Service**:
   - Provide `AdaptiveLayoutService` to dynamically switch between Dock and Rail navigation based on `isCompact()` or `isExpanded()`.
