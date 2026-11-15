# Material 3 Expressive — Complete Styles & Design Tokens Architecture

> **Authoritative Engineering Reference**: Translation of official [m3.material.io/styles](https://m3.material.io/styles) design specifications into production-grade CSS, OKLCH color science, and Tailwind CSS v4 utilities.

---

## 1. Architectural Philosophy: The Design-to-Code Bridge

The official Material Design documentation (`m3.material.io`) provides design theories, abstract DP coordinates, and Figma tokens, and defines a **3-tier token taxonomy**:
1. **Reference Tokens (`--md-ref-*`)**: Context-agnostic raw primitives (`--md-ref-typeface-*` and `--md-ref-palette-*` tonal stops `0..100` calibrated from HCT Tone $L^*$ to OKLCH perceptual lightness $L\%$).
2. **System Tokens (`--md-sys-*`)**: Semantic roles (`--md-sys-color-*`, `--md-sys-shape-corner-*`, `--md-sys-motion-*`, `--md-sys-state-*`) that map Reference tokens to Light/Dark themes and Standard/Medium/High contrast levels.
3. **Component Tokens & Utilities (`--md-comp-*` / `@theme`)**: Component-scoped tokens and Tailwind CSS v4 utilities (`bg-primary`, `rounded-m3-xl`, `text-display-md`, `ease-m3-emphasized`).

```
┌──────────────────────────────┐
│ Reference (--md-ref-*)       │  -->  Typefaces + Tonal Palettes (T0..T100)
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ System Tokens (--md-sys-*)   │  -->  src/styles/_token.css, _shape.css, _motion.css, etc.
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ Tailwind v4 / Component Vars │  -->  @theme in src/styles.css & --md-comp-*
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ UI Components (Angular)      │  -->  Buttons, Cards, Modals, Rails
└──────────────────────────────┘
```

---

## 2. Color System: HCT-Calibrated Dynamic OKLCH Engine

### HCT Tone ($L^*$) to OKLCH ($L\%$) Calibration
M3's HCT color space uses CIE $L^*$ (`0..100`) for tone, whereas CSS `oklch()` uses Oklab cube-root lightness ($L\%$). Rather than passing raw HCT tone integers directly into `oklch()` (which makes dark mode surfaces too dark and crushes contrast), `--md-ref-palette-*` maps every M3 tone stop to its exact perceptual OKLCH lightness equivalent (`T4 → 16.4%`, `T6 → 18.8%`, `T10 → 22.4%`, `T12 → 24.1%`, `T17 → 28.4%`, `T20 → 31.0%`, `T22 → 32.8%`, `T24 → 34.5%`, `T30 → 39.7%`, `T40 → 48.3%`, `T50 → 56.9%`, `T60 → 65.5%`, `T80 → 82.8%`, `T87 → 88.8%`, `T90 → 91.4%`, `T92 → 93.1%`, `T94 → 94.8%`, `T96 → 96.6%`, `T98 → 98.3%`, `T100 → 100%`).

```css
:root {
  --seed-hue: 275;       /* 0° to 360° (e.g., 275 = Iris, 235 = Blue, 155 = Sage) */
  --seed-chroma: 0.16;   /* Harmonic chromatic saturation */

  --secondary-hue: calc(var(--seed-hue) + 10);
  --tertiary-hue: calc(var(--seed-hue) + 65);
  --error-hue: 25;       /* Alert red/coral */
  --success-hue: 150;    /* Extended M3 custom role: Emerald */
  --warning-hue: 75;     /* Extended M3 custom role: Amber */
}
```

### Complete Surface & Container Hierarchy

M3 Expressive uses 5 strictly ordered container levels plus `surface-dim` and `surface-bright`:

| Role Token | Light Ref (OKLCH) | Dark Ref (OKLCH) | Usage & Purpose |
| :--- | :--- | :--- | :--- |
| `--md-sys-color-surface-dim` | `neutral87` (`84% 0.020 H`) | `10% 0.014 H` | Dimmed app stage / recessed plane |
| `--md-sys-color-surface` | `neutral98` (`98% 0.005 H`) | `neutral6` (`12% 0.016 H`) | Default application background |
| `--md-sys-color-surface-bright` | `neutral99` (`99% 0.003 H`) | `neutral24` (`30% 0.028 H`) | High-contrast raised panels |
| `--md-sys-color-surface-container-lowest` | `neutral100` (`100% 0 0`) | `neutral4` (`8% 0.012 H`) | Lowest visual card layer |
| `--md-sys-color-surface-container-low` | `neutral96` (`96% 0.008 H`) | `neutral10` (`15% 0.018 H`) | Navigation Rail / Sidebar background |
| `--md-sys-color-surface-container` | `neutral94` (`93% 0.012 H`) | `neutral12` (`18% 0.022 H`) | Default Card & List surface (`bg-surface-box`) |
| `--md-sys-color-surface-container-high` | `neutral92` (`90% 0.018 H`) | `neutral17` (`22% 0.026 H`) | Active inputs, hovered items, menus |
| `--md-sys-color-surface-container-highest`| `neutral90` (`86% 0.022 H`) | `neutral22` (`27% 0.030 H`) | Promoted dialogs, chips, high emphasis |

### Accent, Fixed & Extended Semantic Roles

| Semantic Role | Light Ref | Dark Ref | Description |
| :--- | :--- | :--- | :--- |
| `primary` / `on-primary` | `primary40` / `primary100` | `primary80` / `primary20` | Key interactive elements (FAB, primary buttons) |
| `primary-container` / `on-primary-container` | `primary90` / `primary30` | `primary30` / `primary90` | Expressive vibrant container (Tone 30 on Tone 90) |
| `*-fixed` / `*-fixed-dim` | `Tone 90` / `Tone 80` | `Tone 90` / `Tone 80` | Theme-invariant containers across Light & Dark |
| `on-*-fixed` / `on-*-fixed-variant` | `Tone 10` / `Tone 30` | `Tone 10` / `Tone 30` | Content on theme-invariant Fixed containers |
| `secondary` / `tertiary` / `error` | `Tone 40` | `Tone 80` | Supporting, expressive, and alert accents |
| `success` / `warning` (Custom M3 Roles) | `Tone 40` | `Tone 80` | Harmonized operational status roles (`on-*`, `*-container`) |

### Contrast Levels (Standard, Medium, High)
`src/styles/_token.css` implements M3's 3 contrast levels:
- **Standard** (default): Canonical M3 Expressive tones.
- **Medium** (`[data-contrast="medium"]`): Boosts `on-*-container` to Tone 20 (Light) / Tone 95 (Dark) and strengthens `outline` to Tone 40 / Tone 70.
- **High** (`[data-contrast="high"]` or `@media (prefers-contrast: more)`): Pushes `on-*-container` to Tone 10 (Light) / Tone 98 (Dark) and `primary` to Tone 30 / Tone 90.
- **Forced Colors** (`@media (forced-colors: active)`): Maps semantic tokens to native OS system colors (`Canvas`, `CanvasText`, `Highlight`, `ButtonFace`, `GrayText`).

---

## 3. Shape System: 10-Step Corner Scale & Shape Morphing

M3 Expressive uses shape as a semantic state indicator (shape morphing) and expands the classic 7-step corner scale to **10 official tokens** (adding `20px`, `32px`, and `48px`):

| Token Name | Value | Tailwind v4 Utility | Typical Component Usage |
| :--- | :--- | :--- | :--- |
| `--md-sys-shape-corner-none` | `0px` | `rounded-m3-none` | Full-bleed banners, dividers |
| `--md-sys-shape-corner-extra-small` | `4px` | `rounded-m3-xs` | Badges, snackbars, checkboxes |
| `--md-sys-shape-corner-small` | `8px` | `rounded-m3-sm` | Small chips, tooltips, menus |
| `--md-sys-shape-corner-medium` | `12px` | `rounded-m3-md` | Active/morphed buttons & filter chips |
| `--md-sys-shape-corner-large` | `16px` | `rounded-m3-lg` | Standard cards, text fields |
| `--md-sys-shape-corner-large-increased` | `20px` | `rounded-m3-lg-inc` | **M3 Expressive**: Medium feature cards |
| `--md-sys-shape-corner-extra-large` | `28px` | `rounded-m3-xl` | Bento cards, modal dialogs, drawers |
| `--md-sys-shape-corner-extra-large-increased` | `32px` | `rounded-m3-xl-inc` | **M3 Expressive**: Expanded sheets & containers |
| `--md-sys-shape-corner-extra-extra-large` | `48px` | `rounded-m3-2xl` | **M3 Expressive**: Monumental Hero surfaces |
| `--md-sys-shape-corner-full` | `9999px` | `rounded-m3-full` | FABs, idle pill buttons, search bars |

---

## 4. Motion System: Easing, Spring Physics & 16 Durations

Google's M3 docs supply the design specification (`N/A` in CSS for 2-segment `Emphasized`); `src/styles/_motion.css` implements the complete executable web engine with automatic `@media (prefers-reduced-motion: reduce)` fallbacks. **Never write raw `300ms` or `ease-in-out` values in feature code.**

> **GM3 Expressive Note (Spring Physics)**: Google Material 3 Expressive migrates component interactions to physics-based Springs (`--md-sys-motion-spring-*` in Section 4.2), while the Easing + Duration system remains actively used for View Transitions API groups and legacy CSS transitions.

### 4.1 Easing Sets & Official Suggested Pairs
* **Emphasized Set** (Focal points, container transforms, asymmetric enter/exit):
  * `--md-sys-motion-easing-emphasized`: 10-stop `linear(...)` curve approximating the 2-segment Android path interpolator (rapid 22% acceleration takeoff + long 78% gentle deceleration settle).
  * `--md-sys-motion-easing-emphasized-decelerate`: `cubic-bezier(0.05, 0.7, 0.1, 1)` (Entering on-screen surfaces).
  * `--md-sys-motion-easing-emphasized-accelerate`: `cubic-bezier(0.3, 0, 0.8, 0.15)` (Permanent off-screen exits only — never use when a morph settles visible on an existing slot).
* **Standard Set** (Utilitarian, peer navigation, compact controls):
  * `--md-sys-motion-easing-standard`: `cubic-bezier(0.2, 0, 0, 1)`
  * `--md-sys-motion-easing-standard-decelerate`: `cubic-bezier(0, 0, 0, 1)`
  * `--md-sys-motion-easing-standard-accelerate`: `cubic-bezier(0.3, 0, 1, 1)`

| Transition Context | Easing Token | Canonical Duration | Reference Example |
| :--- | :--- | :--- | :--- |
| **Begins & ends on-screen** (and recoverable return) | `emphasized` | `500ms` (`long2`) expand / `250ms` (`medium1`) return | `hero-transform` Card &harr; Detail Modal, inline Container Transform |
| **Enters on-screen** | `emphasized-decelerate` | `400ms` (`medium4`) | Bottom sheets, drawers, `dialog-transform` open |
| **Permanent exit** | `emphasized-accelerate` | `200ms` (`short4`) | `dialog-transform` close, dismissed banners/chips |
| **Standard on-screen** | `standard` | `300ms` (`medium2`) | Peer tab switch, utility card reorder |
| **Standard enter / exit** | `standard-decelerate` / `-accelerate` | `250ms` (`medium1`) / `200ms` (`short4`) | Menus, tooltips, compact popovers |

### 4.2 Motion Physics: Spatial vs. Effects Springs
Material 3 divides spring physics into two disjoint families:
* **Spatial Family (`damping: 0.9`, underdamped)**: Animates geometry, position, scale, and width/height. Permits natural momentum overshoot.
* **Effects Family (`damping: 1.0`, critically damped)**: Animates optical properties (opacity, color, borders, elevation). Zero overshoot/bounce to prevent visual flickering.

| Family / Preset | Style | Curve Token (`--md-sys-motion-spring-*`) | Web Curve | Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Fast Spatial** | Expressive | `expressive-fast-spatial-curve` | `cubic-bezier(0.42, 1.67, 0.21, 0.9)` | `350ms` |
| **Default Spatial** | Expressive | `expressive-default-spatial-curve` | `cubic-bezier(0.38, 1.21, 0.22, 1)` | `500ms` |
| **Slow Spatial** | Expressive | `expressive-slow-spatial-curve` | `cubic-bezier(0.39, 1.29, 0.35, 0.98)` | `650ms` |
| **Fast / Default / Slow Spatial** | Standard | `standard-*-spatial-curve` | `cubic-bezier(0.27, 1.06, 0.18, 1)` | `350 / 500 / 750ms` |
| **Fast Effects** | Both | `*-fast-effects-curve` | `cubic-bezier(0.31, 0.94, 0.34, 1)` | `150ms` |
| **Default Effects** | Both | `*-default-effects-curve` | `cubic-bezier(0.34, 0.8, 0.34, 1)` | `200ms` |
| **Slow Effects** | Both | `*-slow-effects-curve` | `cubic-bezier(0.34, 0.88, 0.34, 1)` | `300ms` |

> **Architectural Distinction**: Use **Expressive** for focal moments (modals, expanding cards, FABs, celebratory feedback) and **Standard** (`+6%` overshoot) for dense, high-frequency enterprise workflows (POS grids, clinical tables, repeated filters) to prevent user fatigue.

### 4.3 Canonical 16 Duration Scale
```css
--md-sys-motion-duration-short1: 50ms;        /* Micro press */
--md-sys-motion-duration-short2: 100ms;       /* Fast exit cross-fade */
--md-sys-motion-duration-short3: 150ms;       /* Ripple / fast state layer */
--md-sys-motion-duration-short4: 200ms;       /* Controls, switches, rapid exits */

--md-sys-motion-duration-medium1: 250ms;      /* Lateral tabs, top-level fade-through */
--md-sys-motion-duration-medium2: 300ms;      /* Forward/backward hierarchical push */
--md-sys-motion-duration-medium3: 350ms;      /* Fast spatial spring */
--md-sys-motion-duration-medium4: 400ms;      /* Asymmetric surface enter, FAB -> Sheet */

--md-sys-motion-duration-long1: 450ms;        /* Medium-large transitions */
--md-sys-motion-duration-long2: 500ms;        /* Container Transform flagship (Card -> Detail) */
--md-sys-motion-duration-long3: 550ms;        /* Full-viewport container expand */
--md-sys-motion-duration-long4: 600ms;        /* Full-screen hierarchical transitions */

--md-sys-motion-duration-extra-long1: 700ms;  /* Stage recess choreography */
--md-sys-motion-duration-extra-long2: 800ms;  /* Skeleton -> resolved state shimmer */
--md-sys-motion-duration-extra-long3: 900ms;  /* Guided onboarding sequences */
--md-sys-motion-duration-extra-long4: 1000ms; /* Ambient carousel / splash screen exit */
```

---

## 5. Typography System: Fonts, Applying Type & 30-Style Dual Scale

### 5.1 Reference Typeface Tokens (`m3.material.io/styles/typography/fonts`)
M3 splits reference typefaces into two semantic role tokens plus monospace (`src/styles/_token.css`):
- **Brand (`--md-ref-typeface-brand`)**: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` — assigned to **Display** and **Headline** scales (`24px–57px`) with weights `400`, `600`, `700`, `800`.
- **Plain (`--md-ref-typeface-plain`)**: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` — assigned to **Title**, **Body**, and **Label** scales (`11px–22px`, weights `400`, `500`, `700`). Keeping `--md-ref-typeface-plain` separate from `--md-ref-typeface-brand` allows swapping the UI reading font (e.g., to `'Inter'` or `'Roboto'`) in `_token.css` without touching components.
- **Monospace (`--md-ref-typeface-mono`)**: `ui-monospace, 'Cascadia Code', 'Fira Code', monospace` — system monospace stack assigned to numeric KPIs, timers, and OKLCH token readouts with `tabular-nums` (zero extra webfont payload).

### 5.2 Applying Type (`m3.material.io/styles/typography/applying-type`)
- **Display & Headline**: Use `text-wrap: balance` to prevent single-word orphans on multi-line headers.
- **Title**: Medium-emphasis structural headers for Bento cards, dialogs, and App Bars without competing with Headline.
- **Body**: Sustained reading (`40ch–75ch` ideal line width, max `80ch`) with `text-wrap: pretty` and `rem` font sizes to honor OS/browser text scaling.
- **Label**: Utilitarian interactive text inside Buttons (`Label Large 14px`), Chips (`Label Large/Medium`), and badges (`Label Small 11px`).

### 5.3 Type Scale Tokens (`m3.material.io/styles/typography/type-scale-tokens`)
`src/styles/_typography.css` defines all `--md-sys-typescale-*` tokens (`-font`, `-size`, `-line-height`, `-tracking`, `-weight`, `-emphasized-weight`) and provides both `.text-*` (Baseline) and `.text-*-emphasized` (M3 Expressive Emphasized) utility classes:

| Category | Baseline / Emphasized Class | Size | Line Height | Tracking | Baseline Weight | Emphasized Weight |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `.text-display-lg` / `-emphasized` | 57px (3.5625rem) | 64px (4rem) | `-0.25px` | 400 | 800 |
| | `.text-display-md` / `-emphasized` | 45px (2.8125rem) | 52px (3.25rem) | `0px` | 400 | 800 |
| | `.text-display-sm` / `-emphasized` | 36px (2.25rem) | 44px (2.75rem) | `0px` | 400 | 700 |
| **Headline** | `.text-headline-lg` / `-emphasized` | 32px (2rem) | 40px (2.5rem) | `0px` | 400 | 700 |
| | `.text-headline-md` / `-emphasized` | 28px (1.75rem) | 36px (2.25rem) | `0px` | 400 | 700 |
| | `.text-headline-sm` / `-emphasized` | 24px (1.5rem) | 32px (2rem) | `0px` | 400 | 600 |
| **Title** | `.text-title-lg` / `-emphasized` | 22px (1.375rem) | 28px (1.75rem) | `0px` | 400 | 700 |
| | `.text-title-md` / `-emphasized` | 16px (1rem) | 24px (1.5rem) | `+0.15px` | 500 | 700 |
| | `.text-title-sm` / `-emphasized` | 14px (0.875rem) | 20px (1.25rem) | `+0.1px` | 500 | 700 |
| **Body** | `.text-body-lg` / `-emphasized` | 16px (1rem) | 24px (1.5rem) | `+0.5px` | 400 | 500 |
| | `.text-body-md` / `-emphasized` | 14px (0.875rem) | 20px (1.25rem) | `+0.25px` | 400 | 500 |
| | `.text-body-sm` / `-emphasized` | 12px (0.75rem) | 16px (1rem) | `+0.4px` | 400 | 500 |
| **Label** | `.text-label-lg` / `-emphasized` | 14px (0.875rem) | 20px (1.25rem) | `+0.1px` | 500 | 700 |
| | `.text-label-md` / `-emphasized` | 12px (0.75rem) | 16px (1rem) | `+0.5px` | 500 | 700 |
| | `.text-label-sm` / `-emphasized` | 11px (0.6875rem) | 16px (1rem) | `+0.5px` | 500 | 700 |

### 5.4 Shape Principles & Dual Shape Morphing (`m3.material.io/styles/shape/overview-principles`, `shape-morph`)
Three optical laws govern the 10-step shape scale (`0px`, `4px`, `8px`, `12px`, `16px`, `20px`, `28px`, `32px`, `48px`, `9999px`):
- **Geometric Attention Hierarchy**: High-radius interactive pills stand out cleanly inside rounded Bento containers (`16px–28px`) without heavy borders.
- **Optical Concentricity**: Nested controls match container geometry ($R_{\text{outer}} \approx R_{\text{inner}} + \text{padding}$, e.g. `28px` card with `16px` padding holds `12px` inner blocks).
- **Geometry as Visual Haptics**: On Web/Desktop, animated corner/polygon transitions communicate press and selection without hardware vibration.

M3 Expressive implements two distinct Shape Morph mechanisms:
1. **Corner Radius Morphing (Web/Desktop & Mobile)**: Interpolates `border-radius` on interaction using `--md-sys-motion-spring-expressive-fast-spatial`.
   - **Bounded Pill Radius Law (`h/2`)**: **Never animate `border-radius` from `9999px` (`rounded-full`)**, because CSS interpolates numerically from `9999px` down to `h/2` before any visual corner change occurs (~1s invisible dead-zone). Use bounded half-height component tokens instead:
     - **Buttons (`_button.css`)**: `--md-comp-button-shape-pill` (`24px` or `20px` on `40px` buttons $\leftrightarrow$ `12px`/`10px` on `:active`).
     - **Filter Chips (`_chip.css`)**: `--md-comp-chip-shape-pill` (`16px` on `32px` chips $\leftrightarrow$ `8px` on `.is-selected`).
     - **Interactive Cards**: `medium 12px` / `large 16px` $\leftrightarrow$ `extra-large 28px`.
2. **Polygon / Spline Path Morphing (Organic Shapes)**: Continuous SVG path interpolation across the 7 canonical M3 shapes (`SoftBurst` $\to$ `Cookie9` $\to$ `Pentagon` $\to$ `Pill` $\to$ `Sunny` $\to$ `Cookie4` $\to$ `Oval`) in `<m3-loading-indicator>` driven by M3 underdamped spring physics (`dampingRatio: 0.6, stiffness: 200` every `650ms` + `+90°` quarter-turn + `4666ms` continuous rotation).
   - **Uniform $N = 180$ Cubic Bézier Segment Rule**: Every SVG path (`M3_SOFT_BURST_PATH`, `M3_COOKIE9_PATH`, `M3_PENTAGON_PATH`, `M3_PILL_PATH`, `M3_SUNNY_PATH`, `M3_COOKIE4_PATH`, `M3_OVAL_PATH`, `M3_CIRCLE_PATH`) MUST be generated with the exact same `M3_LOADING_SEGMENT_COUNT = 180` cubic Bézier `C` commands centered at `(24, 24)` (`viewBox="0 0 48 48"`) via Catmull-Rom closed splines so spring vertex interpolation runs symmetrically outside NgZone without Chromium SMIL `keySplines > 1` spec rejections.

---

## 6. Elevation (0dp → 12dp), Applying Elevation & State Layer Opacities

### 6.1 Elevation System & Applying Elevation (`src/styles/_elevation.css` & `applying-elevation`)
Shadows use `color-mix(in oklch, var(--md-sys-color-shadow) ..., transparent)` so ambient and key shadows adapt automatically across themes:
- `level0` (`0dp`): `none` (`surface` / `surface-container-highest`) — **Tonal Containment first**: separate static Bento boxes via surface tones before adding shadows.
- `level1` (`1dp`): `surface-container-low` (Elevated cards & Elevated buttons at rest).
- `level2` (`3dp`): `surface-container` (Elevated cards on hover, menus, popovers, scrolled Top App Bar via **on-scroll / overlap trigger**).
- `level3` (`6dp`): `surface-container-high` (FAB at rest, modal dialogs with Stage Recess scrim).
- `level4` (`8dp`): `surface-container-high` (FAB on hover, dragged cards/items via **`+1` / drag elevation delta**).
- `level5` (`12dp`): `surface-container-highest` (Expanded Hero containers & top floating surfaces).

**Component Elevation Matrix (`Resting → Hover/Scroll → Pressed/Dragged`)**:
| Component | Tonal Surface | Resting | Hover / Scroll | Pressed / Dragged |
| :--- | :--- | :--- | :--- | :--- |
| **Filled & Outlined Cards / Bento** | `surface-container` / `highest` | `Level 0` (`0dp`) | `Level 1` (`1dp`) if interactive | `Level 3–4` (`6–8dp`) when dragged |
| **Elevated Card & Elevated Button** | `surface-container-low` | `Level 1` (`1dp`) | `Level 2` (`3dp`) | `Level 1` (`1dp`) press / `Level 4` drag |
| **Top App Bar / Sticky Header** | `surface` $\to$ `surface-container` | `Level 0` (`0dp`) | `Level 2` (`3dp`) on scroll | — |
| **Menus, Autocomplete & Popovers** | `surface-container` | `Level 2` (`3dp`) | `Level 2` (`3dp`) | — |
| **Floating Action Button (FAB)** | `primary-container` | `Level 3` (`6dp`) | `Level 4` (`8dp`) | `Level 3` (`6dp`) press |
| **Modal Dialog / Bottom Sheet** | `surface-container-high` | `Level 3` (`6dp`) + Scrim | `Level 3` (`6dp`) | `Level 5` (`12dp`) Hero expanded |

### 6.2 State Layer Opacities & Component Hover Recipes (`src/styles/_token.css` & `_interaction.css`)
- `--md-sys-state-hover-state-layer-opacity`: `0.08` (`8%`)
- `--md-sys-state-focus-state-layer-opacity`: `0.10` (`10%`)
- `--md-sys-state-pressed-state-layer-opacity`: `0.12` (`12%`)
- `--md-sys-state-dragged-state-layer-opacity`: `0.16` (`16%`)
- `--md-sys-state-disabled-content-opacity`: `0.38` (`38%`)
- `--md-sys-state-disabled-container-opacity`: `0.12` (`12%`)

**How Hover State Layers work per Component Role**:
- **Filled Button (`bg-primary`)**: `8%` of `on-primary` (`currentColor`) + shadow lift to `Level 1`.
- **Tonal Button (`bg-sec-box`)**: `8%` of `on-secondary-container`.
- **Outlined / Text Button (`transparent`)**: `8%` of `primary` tints the transparent surface.
- **Interactive Cards (`Elevated`, `Filled`, `Outlined`)**: `8%` of neutral `on-surface` (preserving inner semantic badge colors) + `+1` elevation level lift.
- **Filter Chips & List Items**: `8%` of `on-surface-variant` (unselected) or `on-secondary-container` (selected) + corner radius morph.

---

## 7. How to Replicate in Future Projects

To use this exact token architecture in another project (Angular, React, Vue, Next.js, or HTML):
1. Copy the files in `src/styles/`:
   - `_token.css` (OKLCH colors & roles)
   - `_shape.css` (Corner tokens)
   - `_motion.css` (Curves & durations)
   - `_elevation.css` (6-level tonal elevation & `color-mix` shadows + `applying-elevation`)
   - `_typography.css` (30 M3 dual typography classes: 15 Baseline + 15 Emphasized)
2. Import them into your main stylesheet:
   ```css
   @import "./styles/_token.css";
   @import "./styles/_shape.css";
   @import "./styles/_motion.css";
   @import "./styles/_elevation.css";
   @import "./styles/_typography.css";
   ```
3. Map to Tailwind CSS `@theme` or use directly via CSS variables (`var(--md-sys-color-primary)`, `var(--md-sys-shape-corner-extra-large)`, etc.).
