# Material 3 Expressive — Complete Styles & Design Tokens Architecture

> **Authoritative Engineering Reference**: Translation of official [m3.material.io/styles](https://m3.material.io/styles) design specifications into production-grade CSS, OKLCH color science, and Tailwind CSS v4 utilities.

---

## 1. Architectural Philosophy: The Design-to-Code Bridge

The official Material Design documentation (`m3.material.io`) provides design theories, abstract DP coordinates, and Figma tokens, but omits modern web implementations. 

This architecture establishes a **three-tier token pipeline**:
1. **Reference Tokens**: Raw color spaces, curves, and mathematical scales.
2. **System Tokens (`md-sys-*`)**: Semantic roles (`primary`, `surface-container-high`, `shape-corner-extra-large`, `motion-easing-emphasized`).
3. **Component Utilities**: Framework classes (`bg-primary`, `rounded-m3-xl`, `text-display-md`, `ease-m3-emphasized`).

```
┌─────────────────────────┐
│ Reference (OKLCH, ms)   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ System Tokens (md-sys)  │  -->  src/styles/_token.css, _shape.css, _motion.css, etc.
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Tailwind v4 / Utilities │  -->  @theme in src/styles.css
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ UI Components (Angular) │  -->  Buttons, Cards, Modals, Rails
└─────────────────────────┘
```

---

## 2. Color System: Dynamic OKLCH Engine

### The Problem with HSL/RGB
In standard HSL, different hues at the same lightness level (50%) produce wildly different perceived brightness. Yellow is blinding; blue is dark. This breaks automated accessibility.

### The OKLCH Solution
OKLCH separates Lightness ($L$), Chroma ($C$), and Hue ($H$) uniformly. Changing `--seed-hue` alters the brand color across the entire application without distorting contrast ratios.

```css
:root {
  --seed-hue: 275;       /* 0° to 360° (e.g., 275 = Iris, 235 = Blue, 155 = Sage) */
  --seed-chroma: 0.16;   /* Harmonic chromatic saturation */

  --secondary-hue: calc(var(--seed-hue) + 10);
  --tertiary-hue: calc(var(--seed-hue) + 65);
  --error-hue: 25;       /* Alert red/coral */
}
```

### Complete Surface & Container Hierarchy

M3 Expressive eliminated flat backgrounds in favor of 5 progressive container levels:

| Role Token | Light Theme OKLCH | Dark Theme OKLCH | Usage & Purpose |
| :--- | :--- | :--- | :--- |
| `--md-sys-color-surface-dim` | `oklch(90% 0.015 H)` | `oklch(10% 0.014 H)` | Dimmed app stage / recessed plane |
| `--md-sys-color-surface` | `oklch(98% 0.005 H)` | `oklch(12% 0.016 H)` | Default application background |
| `--md-sys-color-surface-bright` | `oklch(99% 0.003 H)` | `oklch(20% 0.020 H)` | High-contrast raised panels |
| `--md-sys-color-surface-container-lowest` | `oklch(100% 0 0)` | `oklch(8% 0.012 H)` | Lowest visual card layer |
| `--md-sys-color-surface-container-low` | `oklch(96% 0.008 H)` | `oklch(15% 0.018 H)` | Navigation Rail / Sidebar background |
| `--md-sys-color-surface-container` | `oklch(93% 0.012 H)` | `oklch(18% 0.022 H)` | Default Card & List surface (`bg-surface-box`) |
| `--md-sys-color-surface-container-high` | `oklch(90% 0.018 H)` | `oklch(22% 0.026 H)` | Active inputs, hovered items, menus |
| `--md-sys-color-surface-container-highest`| `oklch(86% 0.022 H)` | `oklch(27% 0.030 H)` | Promoted dialogs, chips, high emphasis |

### Accent Roles (Primary, Secondary, Tertiary, Error)

| Semantic Role | Light OKLCH | Dark OKLCH | Description |
| :--- | :--- | :--- | :--- |
| `primary` | `oklch(42% C H)` | `oklch(78% C H)` | Key interactive elements (FAB, primary buttons) |
| `on-primary` | `oklch(100% 0 0)` | `oklch(16% 0.06 H)` | Text and icons on primary surface |
| `primary-container` | `oklch(90% 0.06 H)` | `oklch(30% 0.10 H)` | Low-emphasis action backgrounds |
| `on-primary-container` | `oklch(20% 0.08 H)` | `oklch(92% 0.04 H)` | Text on primary container |
| `secondary` | `oklch(45% 0.05 H2)` | `oklch(80% 0.05 H2)` | Navigation pills, filter chips |
| `tertiary` | `oklch(45% 0.12 H3)` | `oklch(80% 0.13 H3)` | Expressive accent, badges, highlights |
| `error` | `oklch(50% 0.22 25)` | `oklch(78% 0.16 25)` | Destructive actions, validation errors |

---

## 3. Shape System: Corner Radii & Squircles

M3 Expressive uses shape as a semantic state indicator (shape morphing). A button is rounded-full when idle, but morphs to rounded-m3-md when active or checked.

| Token Name | Value | Tailwind v4 Utility | Typical Component Usage |
| :--- | :--- | :--- | :--- |
| `--md-sys-shape-corner-none` | `0px` | `rounded-m3-none` | Full-bleed banners, dividers |
| `--md-sys-shape-corner-extra-small` | `4px` | `rounded-m3-xs` | Badges, snackbars |
| `--md-sys-shape-corner-small` | `8px` | `rounded-m3-sm` | Small chips, tooltips |
| `--md-sys-shape-corner-medium` | `12px` | `rounded-m3-md` | Buttons, text fields, active checkboxes |
| `--md-sys-shape-corner-large` | `16px` | `rounded-m3-lg` | Standard cards, action sheets |
| `--md-sys-shape-corner-extra-large` | `28px` | `rounded-m3-xl` | Hero cards, modal dialogs, drawers |
| `--md-sys-shape-corner-full` | `9999px` | `rounded-m3-full` | FABs, pill buttons, search bars |

---

## 4. Motion System: Curves & Durations

### Easing Physics Curves
Never use CSS `ease` or `linear` for layout transforms. M3 relies on non-linear deceleration:

```css
/* Flagship Emphasized Decelerate (Used for Container Transform and Dialogs) */
--md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);

/* Expressive Spring Feedback (Used for button taps and micro-interactions) */
--md-sys-motion-easing-spring: cubic-bezier(0.34, 1.4, 0.64, 1);

/* Standard Decelerate (Used for simple fades and exits) */
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
```

### Durations Scale

```css
--md-sys-motion-duration-short1: 50ms;
--md-sys-motion-duration-short2: 100ms;
--md-sys-motion-duration-short3: 150ms;
--md-sys-motion-duration-short4: 200ms;  /* Micro-interactions, ripples */

--md-sys-motion-duration-medium1: 250ms; /* Container morphing start */
--md-sys-motion-duration-medium2: 300ms; /* Card and sheet expansions */
--md-sys-motion-duration-medium4: 400ms;

--md-sys-motion-duration-long2: 500ms;   /* Full page view transitions */
```

---

## 5. Typography Scale: 15 Canonical Tokens

All typography classes follow the official M3 font scale:

| Category | Token Class | Font Size | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `.text-display-lg` | 57px (3.5625rem) | 64px (4rem) | `-0.025em` | 800 |
| | `.text-display-md` | 45px (2.8125rem) | 52px (3.25rem) | `-0.020em` | 800 |
| | `.text-display-sm` | 36px (2.25rem) | 44px (2.75rem) | `-0.015em` | 700 |
| **Headline** | `.text-headline-lg` | 32px (2rem) | 40px (2.5rem) | `-0.015em` | 700 |
| | `.text-headline-md` | 28px (1.75rem) | 36px (2.25rem) | `-0.010em` | 700 |
| | `.text-headline-sm` | 24px (1.5rem) | 32px (2rem) | `-0.005em` | 600 |
| **Title** | `.text-title-lg` | 22px (1.375rem) | 28px (1.75rem) | `-0.005em` | 600 |
| | `.text-title-md` | 16px (1rem) | 24px (1.5rem) | `+0.010em` | 600 |
| | `.text-title-sm` | 14px (0.875rem) | 20px (1.25rem) | `+0.010em` | 600 |
| **Body** | `.text-body-lg` | 16px (1rem) | 24px (1.5rem) | `+0.015em` | 400 |
| | `.text-body-md` | 14px (0.875rem) | 20px (1.25rem) | `+0.015em` | 400 |
| | `.text-body-sm` | 12px (0.75rem) | 16px (1rem) | `+0.020em` | 400 |
| **Label** | `.text-label-lg` | 14px (0.875rem) | 20px (1.25rem) | `+0.010em` | 600 |
| | `.text-label-md` | 12px (0.75rem) | 16px (1rem) | `+0.035em` | 600 |
| | `.text-label-sm` | 11px (0.6875rem) | 16px (1rem) | `+0.040em` | 600 |

---

## 6. How to Replicate in Future Projects

To use this exact token architecture in another project (Angular, React, Vue, Next.js, or HTML):
1. Copy the files in `src/styles/`:
   - `_token.css` (OKLCH colors & roles)
   - `_shape.css` (Corner tokens)
   - `_motion.css` (Curves & durations)
   - `_elevation.css` (Tonal elevation & shadows)
   - `_typography.css` (15 M3 typography classes)
2. Import them into your main stylesheet:
   ```css
   @import "./styles/_token.css";
   @import "./styles/_shape.css";
   @import "./styles/_motion.css";
   @import "./styles/_elevation.css";
   @import "./styles/_typography.css";
   ```
3. Map to Tailwind CSS `@theme` or use directly via CSS variables (`var(--md-sys-color-primary)`, `var(--md-sys-shape-corner-extra-large)`, etc.).
