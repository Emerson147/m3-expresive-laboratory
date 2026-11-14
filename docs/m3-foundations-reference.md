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
Material 3 applies a semi-transparent overlay (`background-color: currentColor`) whose role depends on the container surface (`on-primary` for Filled buttons, `on-secondary-container` for Tonal/selected chips, `primary` for Outlined/Text buttons, and **neutral `on-surface` for interactive Cards** so nested semantic badges are never tinted).

Using CSS `currentColor` on an isolated `::before` pseudo-element allows a single utility class (`.state-layer`) in `src/styles/_interaction.css` to inherit the active ink automatically:

```css
.state-layer {
  position: relative;
  overflow: hidden;
  transition: transform var(--md-sys-motion-duration-short3, 150ms) var(--md-sys-motion-easing-spring);
}

.state-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short2, 100ms) var(--md-sys-motion-easing-linear);
}

/* Official M3 State Layer Opacity Tokens (_token.css & _interaction.css) */
.state-layer:hover::before {
  opacity: var(--md-sys-state-hover-state-layer-opacity, 0.08);   /* 8% */
}

.state-layer:focus-visible::before {
  opacity: var(--md-sys-state-focus-state-layer-opacity, 0.10);   /* 10% */
}

.state-layer:active {
  transform: scale(0.975);                                         /* Spring tactile press */
}

.state-layer:active::before {
  opacity: var(--md-sys-state-pressed-state-layer-opacity, 0.12); /* 12% */
}

.state-layer.is-dragged::before {
  opacity: var(--md-sys-state-dragged-state-layer-opacity, 0.16); /* 16% Dragged */
}
```

### Disabled State Opacities (`_token.css`)
- **Disabled Content (`--md-sys-state-disabled-content-opacity`)**: `0.38` (`38%`) for disabled text and icons.
- **Disabled Container (`--md-sys-state-disabled-container-opacity`)**: `0.12` (`12%`) `on-surface` mix for disabled fills and borders.

---

## 3. Accessibility, Focus Rings, Touch Targets & Input Ergonomics

### Dual Focus Ring (`.focus-ring-m3`) + Forced Colors Fallback
Browser default outlines clash with dark surfaces, while `box-shadow`-only rings vanish in Windows High Contrast Mode. M3 mandates a dual contour with a `@media (forced-colors: active)` fallback (`src/styles/_interaction.css`):

```css
.focus-ring-m3:focus-visible {
  outline: 2px solid transparent;
  box-shadow:
    0 0 0 2px var(--md-sys-color-surface),
    0 0 0 4px var(--md-sys-color-primary);
}

@media (forced-colors: active) {
  .focus-ring-m3:focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 2px;
    box-shadow: none;
  }
}
```

### 48×48dp Minimum Touch Target (`.touch-target-48`) & ≥ 8dp Target Spacing
Mobile human fingers have an average contact width of 7–10mm (`48×48dp`). Icons smaller than 48px expand their clickable hitbox invisibly using logical `min-inline-size` / `min-block-size` so larger controls still grow naturally, separated by at least **8dp** (`.touch-gap-8`) from neighboring targets:

```css
.touch-target-48 {
  position: relative;
  overflow: visible !important;
}

.touch-target-48::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  min-inline-size: 48px;
  min-block-size: 48px;
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  pointer-events: auto;
  z-index: 1;
}
```

### Input Modalities, Contrast & Web Form Validation (`:user-invalid`)
- **Web Touch & Pointers**: `48×48dp` target + `≥ 8dp` gap; use `touch-action: pan-y` on horizontal carousels and `@media (pointer: coarse)` for coarse inputs. Never hide critical actions behind invisible gestures.
- **WCAG Contrast & Color Independence**: Maintain `≥ 4.5:1` for normal text and `≥ 3:1` for large text, icons, and interactive UI boundaries/states (e.g., input borders). **Never** denote error/success with color alone — always pair color with an icon and text label.
- **Accessible Web Forms**: Associate `<label for="id">`, place helper hints **above** inputs via `aria-describedby` (preventing browser autocomplete popovers from covering hints), and synchronize `aria-invalid="true"` with `:user-invalid` on `blur`/`input` after interaction (`Baseline since 2023-11-02`) so errors never fire prematurely before typing finishes.
- **Keyboard**: `Tab` / `Shift+Tab` moves between groups; **Arrow keys (`←/→`) with Roving Tabindex** (`tabindex="0"` on active item, `-1` on siblings) navigate inside component groups (`radiogroup`, `tablist`, chip groups). `Enter` triggers on `keydown`, `Space` on `keyup` with `preventDefault()`.
- **Modals & Live Regions**: Isolate background DOM with `<dialog>.showModal()` or `inert`; announce selection changes politely via `aria-live="polite"`; never use `tabindex > 0`.
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` collapses `.state-layer` / `.focus-ring-m3` transition durations to `0.01ms` and removes `:active` scaling.

---

## 4. Adaptive Layout: Parts of Layout, Adaptive Design, 5 Breakpoints & LTR/RTL

### Parts of Layout (`m3.material.io/foundations/layout/layout-overview/parts-of-layout`)

Every Material 3 screen separates **Navigation Components** from the **Body Region**:

- **Navigation Components**:
  - **Navigation Bar / Bottom Bar** (`80dp` height on Compact `<600dp`, 3–5 top-level destinations).
  - **Navigation Rail** (`80dp` width on Medium/Expanded `600dp–1199dp`) or **Modal / Standard Drawer** (`220dp–360dp` on Large/Extra-Large `≥1200dp`). Never display Bottom Bar and Rail simultaneously.
- **Body Region**:
  - **Panes (Fixed vs Flexible)**: Structural subdivisions of the Body (`Fixed`: `320dp–412dp` or `35–40%` for lists/support; `Flexible`: `1fr` / `60–65%` absorbing window growth).
  - **Margins**: Outer spacing separating content from window edges (`16dp` on Compact, `24dp` on Medium+).
  - **Spacer**: `24dp` (`16dp` in Compact) visual gutter separating side-by-side panes cleanly without hard divider borders.
  - **Drag Handle**: `4dp × 48dp` visual pill inside a `48dp × 48dp` accessible hit target (`role="separator"`, keyboard `ArrowLeft`/`ArrowRight`, pointer capture) centered inside a Spacer so users can resize two panes (`30%–70%`).
  - **Columns & Fold (Hinge)**: `4` (Compact), `8` (Medium), or `12` (Expanded+) structural grid columns. On foldable dual-screen hardware, align the inter-pane `Spacer` directly over the `Fold` so critical text/actions are never split across the hinge.

### Adaptive Design Strategies (`m3.material.io/foundations/layout/layout-overview/adaptive-design`)

- **Responsive vs. Adaptive**: Responsive scales proportions only (stretching mobile cards across 1440px hurts scannability); **Adaptive** restructures panes, navigation chrome, density, and component slots dynamically across breakpoints and window sizes.
- **Show & Hide**: Keep secondary panes (Inspector, Ticket, Reviews) collapsed on Compact/Medium and reveal them persistently from `Expanded (≥840dp)`.
- **Levitate**: Elevate contextual controls or overlays (Modal Sheet, Dropdown, Floating Cart/Action Pill) above the primary flow when horizontal space is constrained or quick action access is needed.
- **Reflow**: Switch two-pane layouts from horizontal (`row`) to vertical (`column`) stack below `Expanded`, and adapt Feed columns `1 → 2 → 3 → 4`.
- **Container Queries (`size-aware-styling`)**: Use `container-type: inline-size` + `@container (min-width: ...)` on resizable panes/windows (`Baseline 2023`) alongside logical properties (`inline-size`, `padding-inline`) so embedded windows adapt strictly to their container width.

### 5 Width Breakpoints, Height Classes & Canonical Layouts

Material 3 Expressive categorizes viewports into **5 Width Breakpoints** and **3 Height Breakpoints** (`m3.material.io/foundations/layout/applying-layout/window-size-classes`):

| Width Breakpoint | Range (dp) | Outer Margin | Inter-Pane Spacer | Max Panes | Recommended Navigation Chrome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Compact** | `< 600dp` | `16dp` | `16dp` | `1` | Bottom Navigation Bar / Floating Dock |
| **Medium** | `600dp – 839dp` | `24dp` | `24dp` | `1–2` | Navigation Rail (`80dp`) |
| **Expanded** | `840dp – 1199dp` | `24dp` | `24dp` | `2` | Navigation Rail / Modal Drawer |
| **Large (M3E)** | `1200dp – 1599dp` | `24dp` | `24dp` | `2` | Expanded Rail / Persistent Drawer |
| **Extra-Large (M3E)** | `≥ 1600dp` | `24dp` | `24dp` | `2–3` | Persistent Drawer + bounded canvas |

- **Height Breakpoints**: `compact` (`< 480dp`, landscape phones $\to$ avoid tall top app bars), `medium` (`480dp – 899dp`), `expanded` (`≥ 900dp`).
- **3 Canonical Layouts**:
  1. **List-Detail**: Single-pane stack on `Compact`; coupled list (`35–40%`) + spacer + detail (`60–65%`) on `Expanded+` (used in Clínica & Agenda).
  2. **Supporting Pane**: Primary work pane (`~65–70%`) + persistent contextual pane (`~30–35%`) on `Expanded+` (used in POS Catalog + Ticket).
  3. **Feed**: Responsive multi-column card/Bento grid scaling `1 → 2 → 3–4` columns (used in Overview, Campus, Inventory).
- **Bidirectionality (LTR / RTL)**: Author layout spacing and borders using CSS Logical Properties (`padding-inline-start`, `margin-inline-end`, `border-inline-start`, Tailwind `ps-*`, `pe-*`, `border-s-*`, `text-start`). Mirror directional navigation icons (`arrow_back`, `chevron_right`) under `[dir="rtl"]`, **never** mirror universal symbols like clocks (`schedule`) or checkmarks (`check_circle`).

### Reactive Implementation (`AdaptiveLayoutService`)

```typescript
export type WindowSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large';
export type WindowHeightClass = 'compact' | 'medium' | 'expanded';

// Signals exposed by AdaptiveLayoutService (src/app/core/layout/adaptive-layout.service.ts):
layout.windowWidth();           // Live innerWidth
layout.windowHeight();          // Live innerHeight
layout.windowSizeClass();       // 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large'
layout.heightSizeClass();       // 'compact' | 'medium' | 'expanded'
layout.isExpandedOrLarger();    // true when width >= 840px
layout.marginDp();              // 16 (Compact) | 24 (Medium+)
layout.spacerDp();              // 16 (Compact) | 24 (Medium+)
layout.recommendedPanes();      // 1 | 2 | 3
layout.recommendedNavigation(); // Chrome string for active breakpoint
```

---

## 5. Web Content Design, Text Expansion (+35%) & Boundary vs. Styles

- **Action-Oriented UX Copy**: Buttons use specific verb + noun labels (`"Guardar cambios"` instead of `"Aceptar"`). Errors explain what happened and how to fix it.
- **Text Expansion Resilience & Native `Intl`**: Size buttons and tabs intrinsically (`min-inline-size` / `fit-content` rather than fixed widths) to tolerate `+30–40%` string expansion without clipping, and format currency/dates using native `Intl.NumberFormat` / `Intl.DateTimeFormat`.
- **Alt Text & Landmarks**: Wrap regions in `<header>`, `<nav>`, `<main>`; keep headings sequential (`h1 → h2 → h3`); give decorative media `alt=""` and describe key data points on charts without `"Imagen de..."` filler.
- **Separation from Styles Lab**: Detailed **Design Tokens**, **Customizing Material (OKLCH Seed & Contrast Levels)**, and **Interaction State Layer Opacities (`8% / 10% / 12% / 16%`)** live in [m3-styles-tokens-reference.md](file:///home/migattedev/Documentos/Sistemas/frontend/m3-expressive/m3-expressive-ui/docs/m3-styles-tokens-reference.md) and `/design-system/styles` to avoid duplication; `FoundationsLabComponent` (`foundations-specs.data.ts`) focuses exclusively on Web-relevant Foundations (Layout, Touch/Pointer/Keyboard Ergonomics, WCAG Contrast & Accessible Forms, and Content Design + i18n Resilience).

---

## 6. How to Replicate Foundations in Future Projects

1. **Include Interaction Styles**: Import `src/styles/_interaction.css` for `.state-layer`, `.focus-ring-m3` (with `forced-colors` fallback), `.touch-target-48`, `.touch-gap-8`, `.sr-only-m3`, and `prefers-reduced-motion`.
2. **Apply Foundations Classes**: Combine `class="state-layer focus-ring-m3 touch-target-48"` on compact interactive controls and maintain `≥ 8dp` gaps.
3. **Inject `AdaptiveLayoutService`**: Switch between Dock, Rail, and Persistent Drawer chrome and Canonical Layout panes using `windowSizeClass()`, `marginDp()`, and `recommendedPanes()`.
