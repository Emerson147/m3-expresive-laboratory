# Material 3 (M3) Expressive — Master Architectural Manual & Usage Guide

This is the definitive engineering reference for developing, extending, and assembling applications within this Material 3 Expressive laboratory.

---

## 0. The Philosophy of M3 Expressive: Conservation of Matter & Physicality

> **The Universal Axiom**: *"Matter cannot be created or destroyed; it can only be transformed."* — Antoine Lavoisier.

In classic enterprise user interfaces, new surfaces appear out of thin air: a button is clicked, and a dialog jumps onto the screen with a harsh `display: none` $\to$ `display: block` jump-cut. This forces an instantaneous cognitive reset on the user's brain: *Where did this white box come from? Where did my active workflow go?*

Material 3 Expressive rejects visual jump-cuts in favor of **strict spatial continuity**. Every element on screen possesses physical presence, mass, and depth.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE PHYSICALITY TRIAD                           │
├──────────────────────────┬───────────────────────┬─────────────────────┤
│ 1. Continuity of Matter  │ 2. Spatial Depth (Z)  │ 3. Energy of Shapes │
│ Elements morph directly  │ Background recedes    │ Radii reflect state │
│ from source to target.   │ into distance plane.  │ from action to rest │
└──────────────────────────┴───────────────────────┴─────────────────────┘
```

### 0.1 Container Transform: Zero Orphan Elements
* **The Problem**: Orphaned modal dialogs and abrupt page transitions disorient users and make interfaces feel cheap and sterile.
* **The M3 Law**: When an interaction initiates a new surface (e.g. creating a task or inspecting an item), the **origin element itself expands, reshapes, and becomes the new container**. When dismissed, the matter compresses back to its origin.
* **Why the View Transitions API**: Hand-crafted JavaScript animations using `getBoundingClientRect()` or CSS absolute coordinates choke the browser's main thread, causing dropped frames (jank). By pairing Angular Signals with native `document.startViewTransition`, the browser captures GPU-accelerated texture snapshots of the before-and-after states and computes seamless spring-based geometric morphing at 60/120 FPS.

### 0.2 Stage Recess: Physical Depth vs. Flat Scrims
* **The Problem**: Legacy UI modals slap an opaque flat black sheet (`background: rgba(0,0,0,0.6)`) over the entire screen, signaling to the user that the background application has vanished or died.
* **The M3 Law**: In three-dimensional reality, when an object is held close to your eyes, the background does not disappear; it naturally **moves out of focus and recedes**.
* **The Implementation**:
  ```css
  .stage-recessed {
    filter: blur(5px) brightness(0.75);
    transform: scale(0.988);
    border-radius: 24px;
    pointer-events: none;
    user-select: none;
  }
  ```
  Instead of covering the page with a flat sheet, the entire underlying stage (`#app-stage`) is stepped back along the Z-axis, creating genuine optical hierarchy while assuring the user that the system state is preserved.

### 0.3 Shape Morphing: Geometry as an Energy State
* **The Problem**: Static corner radii treat borders as meaningless decoration.
* **The M3 Law**: Corner radii communicate physical tension and user readiness via two mechanisms:
  * **Corner Radius Morphing (Web/Desktop & Mobile)**: Elements interpolate smoothly between a resting bounded pill radius (`h/2`, e.g. `24px`/`20px` on Buttons via `--md-comp-button-shape-pill` or `16px` on Filter Chips via `--md-comp-chip-shape-pill`) and a squircle (`12px`/`10px` or `8px`) using `--md-sys-motion-spring-expressive-fast-spatial`. Never animate from `9999px` (`rounded-full`)—CSS interpolates `9999 → h/2` invisibly (~1s lag) before visible corners appear.
  * **Organic Polygon Spline Morphing (`<m3-loading-indicator>`)**: Continuously morphs across Rounded Pentagon $\leftrightarrow$ Squircle $\leftrightarrow$ 4-Petal Clover $\leftrightarrow$ Circle using uniform `SEGMENT_COUNT = 40` cubic Bézier `C` segments centered at `(24, 24)`.

### 0.4 OKLCH Color Science: Perceptual Uniformity
* **The Problem**: Standard RGB and HSL color models are physically flawed. The human eye is vastly more sensitive to green and yellow wavelengths than blue. In HSL, an identical Lightness value of `50%` creates a blinding yellow but an illegible, murky blue, destroying automated WCAG accessibility.
* **The M3 Law**: OKLCH is built upon the CIELAB color space, designed to map colors strictly according to human perceptual lightness. 
* **The Result**: A single user-selected `--seed-hue` degree (0° to 360°) automatically synthesizes all tonal containers (`surface-container-low`, `surface-box`, `surface-high`) and accent roles with mathematical contrast guarantees.

### 0.5 Decoupled Architecture: Why Core Services Manage State
* **The Problem**: If individual components handled their own modal triggers, backdrop styling, and route detection, the UI would suffer from race conditions, visual leaks, and conflicting stacking contexts.
* **The M3 Law**: Business logic and spatial orchestration live in singleton root services (`ThemeService`, `TaskService`, `DialogService`, `AdaptiveLayoutService`). Components are pure, dumb presentation layers (Container/Presentational pattern) that simply emit events: *"Open matter from my trigger ID"*. The central service and shell synchronize the DOM and GPU snapshot in a single atomic tick.

### 0.6 Daily Operational Workflow: The 4-Step Mental Model (How to Use This Bible)

When sitting down to build a new screen, feature, or complete enterprise application (POS, ERP, CRM, Analytics), follow this strict 4-step mental sequence:

```
┌────────────────────────────────────────────────────────────────────────┐
│               THE 4-STEP OPERATIONAL EXECUTION WORKFLOW                │
├─────────────────┬───────────────────┬──────────────────┬───────────────┤
│ Step 1: Surface │ Step 2: Assemble  │ Step 3: Connect  │ Step 4: Route │
│ Pick container  │ 4 Canonical atoms │ Core Signals     │ 3-Step Recipe │
│ level (Sec 2.1) │ (80/20 Rule, S.4) │ & State (Sec 3)  │ (Section 6)   │
└─────────────────┴───────────────────┴──────────────────┴───────────────┘
```

1. **Step 1: The Surface Question (Pick your container)**
   * **Golden Rule**: *Never invent an arbitrary hex code or generic gray (`#f3f4f6`, `#1e293b`).*
   * Look up Section 2.1:
     * Full-page backdrop $\to$ `bg-surface`
     * Standard product card or table row $\to$ `bg-surface-box`
     * Floating toolbar, active input, or hovered row $\to$ `bg-surface-high`
     * Foreground dialog or promoted card $\to$ `bg-surface-highest`
     * Dimmed canvas plane behind dialogs $\to$ `bg-surface-dim`

2. **Step 2: Assemble with the 4 Canonical Atoms (The 80/20 Rule)**
   * **Golden Rule**: *Do not write ad-hoc CSS for common controls. 80% of any commercial system is assembled using only 4 components:*
     * **To trigger action/commit**: `<m3-button>` (Filled for commitment, Outlined/Text for cancel).
     * **To group data/products**: `<m3-card>` (Elevated for KPIs/metrics, Filled for list items).
     * **To filter/categorize**: `<m3-chip>` (Filter for category tabs, Input for removable tags).
     * **To capture user input**: `<m3-text-field>` (Filled for search bars, Outlined for forms).
   * Copy the exact HTML snippets from Section 4 and plug in your reactive bindings.

3. **Step 3: Connect State to Core Services (Signals)**
   * **Golden Rule**: *Keep component templates dumb. Never manage modal backdrops or layout calculations locally.*
     * Data and metrics? Read from or update your service signals (e.g. `TaskService`).
     * Modal trigger with physical transformation? Call `dialogService.openFrom(triggerId)`.
     * Responsive layout breakpoints? Read `adaptiveLayout.windowSizeClass()`.

4. **Step 4: Register the Module in the Global Shell (Cookbook Recipe)**
   * **Golden Rule**: *Follow the 3-step blueprint in Section 6:*
     1. Place the component in `src/app/features/{module-name}/`.
     2. Add the lazy route in `src/app/app.routes.ts`.
     3. Add the navigation item in `src/app/shared/ui/navigation.component.ts`.
   * The new module instantly inherits Stage Recess depth, 60 FPS View Transitions, circular dark mode, and OKLCH color science automatically.

### 0.7 Motion Execution Playbook: The 3-Filter Rule & Zero-Glitch CSS Laws

Before writing any transition or animation in a feature module, apply this 3-filter engineering checklist:

1. **Filter 1 — DOM Lifecycle (Does the source element survive?)**:
   * **Survives in the same component tree** (e.g., Card expand, FAB &rarr; Bar, Accordion): Use **CSS Transitions** with `overflow-hidden` and bounded geometric dimensions. Do NOT trigger `startViewTransition` for local same-component state.
   * **Destroyed & replaced** (e.g., Route change `/inventory` &rarr; `/inventory/42`, or global Overlay Dialog): Use the **View Transitions API** (`dialog-transform`, `hero-transform`) so the GPU morphs snapshots across disjoint DOM trees.
2. **Filter 2 — Physics Family (Geometry vs. Optics in `src/styles/_motion.css`)**:
   * **Spatial (Size / Position / Shape)**:
     * *Begins & Ends On-Screen / Recoverable* (`hero-transform`, inline expand): Use `--md-sys-motion-easing-emphasized` (10-stop `linear(...)` curve) with asymmetric timing — longer expansion (`--md-sys-motion-duration-long2`, `500ms`) and crisp return (`--md-sys-motion-duration-medium1`, `250ms`), or Expressive Spatial springs ($\zeta = 0.9$). **Never** use `emphasized-accelerate` when returning to an on-screen slot; its slow start + hard terminal velocity slams visibly into place.
     * *Enters vs. Permanent Exit* (`dialog-transform`, snackbars, dismissed overlays): Pair `--md-sys-motion-easing-emphasized-decelerate` (`medium4`, `400ms`) on enter with `--md-sys-motion-easing-emphasized-accelerate` (`short4`, `200ms`) on permanent discard.
   * **Effects (Color / Opacity / Border)**: Use `--md-sys-motion-spring-*-effects-curve` ($\zeta = 1.0$, zero bounce) or `--md-sys-motion-easing-standard`.
   * *Note (GM3 Expressive)*: Google's Expressive update moves interactive physics toward Springs (`md.sys.motion.spring.*` in `_motion.css`), while Duration + Easing pairs remain first-class for View Transitions & CSS state transforms.
3. **Filter 3 — Zero Magic Numbers**:
   * Always reference `var(--md-sys-motion-*)`. Never hardcode `300ms` or `ease-in-out`, so `@media (prefers-reduced-motion: reduce)` works globally without extra code.

#### ⚠️ Critical CSS Layout Traps (Never Repeat)
* **The `max-width: none` Explosion Trap**: NEVER toggle `w-full max-w-md` in the expanded state against `w-72` (which has `max-width: none`) in the collapsed state. At $t = 0\text{ms}$ on collapse, the browser snaps `max-width` to `none` while `width` still interpolates from `100%`, causing the card to **explode horizontally across the parent container** before shrinking.
  * **Fix**: Keep `max-w-full` invariant in static `class`, and interpolate pure explicit numeric widths (`w-72` &harr; `w-[448px]`) and heights (`h-16` &harr; `h-48`) — or use CSS Grid `grid-rows-[0fr]` &harr; `grid-rows-[1fr]` with `[attr.inert]` for intrinsic-height accordion/detail drawers.
* **The `height: auto` Snap & Blank Void Trap**: CSS `transition: all` cannot interpolate `height: auto`. Removing inner DOM nodes via `@if` at $t = 0\text{ms}$ while shrinking a tall container over `500ms` leaves an empty hollow void collapsing on screen.
  * **Fix**: Keep inner content mounted inside `overflow-hidden` and fade it out asynchronously using `--md-sys-motion-duration-short2` (`100ms`, `0ms` delay) on collapse while fading in over `medium2` (`300ms`, slight delay) on expansion.

#### View Transitions + Stage Recess Production Checklist
* **Keep the origin Bento card mounted**: Hide the source card with `[class.invisible]` + `[attr.aria-hidden]` instead of `@if`, preserving grid layout stability and preventing entrance-animation replays on return.
* **Freeze stage transitions during snapshot**: Apply `html.vt-running #app-stage { transition: none !important; }` (and pause ambient loops via `html.vt-running .m3-aurora-orb { animation-play-state: paused !important; }`) so the browser never snapshots intermediate Stage Recess blur or running keyframe drift.
* **Scope root return timing cleanly**: Gate Hero close duration (`250ms` `emphasized`) with `html.vt-hero.vt-exiting:not(.theme-transition)` so dark-mode circular reveal transitions (`html.theme-transition`) remain untouched.
* **Preserve opaque surface + prevent text rubber-banding**: Set opaque `--md-sys-color-surface-container`, border, and elevation on `::view-transition-group(hero-transform)`, plus `object-fit: none; object-position: top left; width: 100%; height: 100%;` on `old`/`new` hero snapshots.
* **Route keyboard focus explicitly**: Focus the destination heading (`tabindex="-1"`) on modal open and bind `Escape` with idempotent service guards (`closeDialog()` / `toggleHeroDetail()`).

#### GPU-Composited Ambient Aurora Layers (`.m3-aurora-glow` + `.m3-aurora-layer`)
* Never animate `filter: blur(...)` or `background-position` per frame, and **never** attach aurora layers to `::before`/`::after` on `.card-interactive` or `.state-layer` hosts (those pseudo-elements carry `background-color: currentColor` state overlays).
* Render circular `closest-side` multi-stop OKLCH radial gradients (`.m3-aurora-orb-1..3`, fading smoothly to `transparent 100%` without hard edges) inside `<div class="m3-aurora-layer" aria-hidden="true">` under `overflow: hidden; isolation: isolate`, animate strictly `transform` and `opacity` on the GPU compositor (`.is-aurora-ambient` &harr; `.is-aurora-thinking`), expose `.is-aurora-paused`, and disable animations cleanly under `@media (prefers-reduced-motion: reduce)`.

---

## 1. System Architecture & Directory Blueprint

The project follows Clean Modular Architecture with strict separation between **Core** (state & cross-cutting concerns), **Features** (isolated routed views), and **Shared** (canonical atomic components and shell UI).

```
src/app/
├── core/                                # SINGLE SOURCE OF TRUTH (Services & State)
│   ├── dialog/dialog.service.ts         # Modal dialog coordination & View Transitions
│   ├── layout/adaptive-layout.service.ts# Window size classes (Compact/Medium/Expanded)
│   ├── tasks/task.service.ts            # Signal-based store for tasks, filtering & metrics
│   └── theme/theme.service.ts           # OKLCH seed hue engine & circular theme reveal
│
├── features/                            # ROUTED FEATURE MODULES (Lazy Loaded)
│   ├── overview/overview.component.ts   # Bento Grid Dashboard & Hero focal surface
│   ├── agenda/agenda.component.ts       # Task management list with shape morphing
│   └── design-system/                   # Live component & token workshop
│
├── shared/                              # REUSABLE ENTERPRISE ASSETS
│   ├── components/                      # THE 4 CANONICAL ATOMS (80/20 Rule)
│   │   ├── button/button.component.ts   # 5 variants (filled, tonal, elevated, outlined, text)
│   │   ├── card/card.component.ts       # 3 variants (elevated, filled, outlined)
│   │   ├── chip/chip.component.ts       # 4 types (filter, assist, input, suggestion)
│   │   └── text-field/                  # 2 variants (filled, outlined) + ControlValueAccessor
│   ├── models/ui.models.ts              # Semantic union types, triggers & nav modes
│   └── ui/                              # SHELL INFRASTRUCTURE
│       ├── header.component.ts          # Reactive top-bar with theme swatches & FAB
│       ├── navigation.component.ts      # Rail, Dock & Tunnel adaptive navigation
│       ├── dialog-container.component.ts# Transformable modal & options menu
│       └── hero-detail-modal.component.ts# Fullscreen expandable hero modal
│
├── app.routes.ts                        # Lazy route declarations + withViewTransitions()
├── app.config.ts                        # Root providers & browser error listeners
├── app.html                             # Stage Recess shell (~47 lines)
├── app.ts                               # Route detection and shell coordinator
└── styles.css                           # Tailwind CSS v4 `@theme` & system tokens
```

---

## 2. Design Tokens & Styling Architecture

Styles are organized in a 3-tier M3 pyramid: **Reference Tokens (`--md-ref-*`) $\to$ System Tokens (`--md-sys-*`) $\to$ Component Tokens (`--md-comp-*`) & Tailwind v4 `@theme`**.

### 2.1 Color System: 8 Surfaces, 12 Fixed Roles & 3 Contrast Levels (`src/styles/_token.css`)
Never use arbitrary gray or hex values. Semantic container surfaces follow HCT-to-OKLCH Vibrant Expressive chroma progression:

| Token / Utility | Role | Light OKLCH | Dark OKLCH | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `bg-surface-dim` | Recessed stage | `oklch(84% 0.020 H)` | `oklch(10% 0.014 H)` | `#app-stage` recessed backdrop / dim plane |
| `bg-surface` | Base canvas | `oklch(98% 0.005 H)` | `oklch(12% 0.016 H)` | Default page background |
| `surface-container-lowest` | Purest inset | `—` (`_token.css`) | `—` (`_token.css`) | Deepest inset cards on Light, lowest layer on Dark |
| `bg-surface-low` | Subtle elevation | `oklch(96% 0.008 H)` | `oklch(15% 0.018 H)` | Navigation Rail, sidebars |
| `bg-surface-box` | Standard card | `oklch(93% 0.012 H)` | `oklch(18% 0.022 H)` | Default card & metric containers |
| `bg-surface-high` | Raised surface | `oklch(90% 0.018 H)` | `oklch(22% 0.026 H)` | Hover states, active inputs, popovers |
| `bg-surface-highest` | Promoted card | `oklch(86% 0.022 H)` | `oklch(27% 0.030 H)` | Dialogs, chips, high-emphasis items |
| `surface-bright` | Highlighted canvas | `—` (`_token.css`) | `—` (`_token.css`) | High-emphasis bright surface variant |

* **12 Theme-Invariant Fixed Roles**: `--md-sys-color-{primary,secondary,tertiary}-fixed`, `*-fixed-dim`, `--md-sys-color-on-*-fixed`, and `*-fixed-variant` keep constant luminance/tone across Light and Dark modes (ideal for persistent badges and media overlays).
* **3 Accessibility Contrast Levels**: Switching `standard | medium | high` (`ThemeService.setContrastLevel()`) scales border contrast, outline thickness, and text luminance separation, paired with `@media (forced-colors: active)` OS high-contrast fallbacks.

### 2.2 Semantic & Extended Accent Roles
* `bg-primary text-on-primary`: Main commitments, FAB buttons, active toggles.
* `bg-primary-box text-on-primary-box`: Primary containers, badge highlights.
* `bg-sec-box text-on-sec-box`: Navigation active items, filter chips.
* `bg-tertiary-box text-on-tertiary-box`: Expressive badges, high-priority status.
* **Extended Semantic Roles (`--md-sys-color-success*`, `--md-sys-color-warning*`)**: Dedicated M3-harmonized OKLCH roles (`success`, `on-success`, `success-container`, `on-success-container`, `warning`, `on-warning`, `warning-container`, `on-warning-container`) beyond `error`.
* `text-main` / `text-muted`: Main text (`on-surface`) vs secondary text (`on-surface-variant`).
* `border-outline-sub`: 1px subtle boundary (`outline-variant`).

### 2.3 Expressive Shapes, Dual Typography, Applying Elevation & State Layers
* **10-Step Shape Corner Scale (`_shape.css`)**: `none` (`0px`), `xs` (`4px`), `sm` (`8px`), `md` (`12px`), `lg` (`16px`), **`lg-inc` (`20px`, M3E)**, `xl` (`28px`), **`xl-inc` (`32px`, M3E)**, **`2xl` (`48px`, M3E)**, and `full` (`9999px` for static pills/circles).
* **Bounded Pill Morph Law (`_button.css`, `_chip.css`)**: Animated corner morphs MUST use bounded half-height (`h/2`) component tokens (`24px`/`20px` $\leftrightarrow$ `12px`/`10px` on Buttons; `16px` $\leftrightarrow$ `8px` on Filter Chips) instead of `9999px` so spring morphs fire immediately without a ~1s invisible interpolation dead-zone.
* **Dual Typography (`_token.css`, `_typography.css`)**: Separates `--md-ref-typeface-brand` (`Plus Jakarta Sans`), `--md-ref-typeface-plain` (currently mapped to `Plus Jakarta Sans`, swappable in one token), and `--md-ref-typeface-mono` (`ui-monospace, 'Cascadia Code', 'Fira Code', monospace`). Provides **30 Dual Typescale classes** (15 Baseline `.text-*` + 15 Emphasized `.text-*-emphasized`) sized in `rem`, using `text-wrap: balance` (Display/Headline) and `text-wrap: pretty` (Body, `40ch–75ch`, max `80ch`).
* **Applying Elevation (`0dp → 12dp`, `_elevation.css`)**: Shadows derive from `color-mix(in oklch, var(--md-sys-color-shadow) ..., transparent)`. Prefer `Level 0` (`0dp`) tonal surface containment first, activate `Level 2` (`3dp`) on scroll/overlap, and apply `+1` elevation delta on hover/drag.
* **State Layers (`--md-sys-state-*`)**: `hover` (`0.08`), `focus` (`0.10`), `pressed` (`0.12`), `dragged` (`0.16`), `disabled-content` (`0.38`), and `disabled-container` (`0.12`). Interactive cards use neutral `on-surface` `8%` overlays so nested semantic badges keep their true color.

---

## 3. Core Services API

All services are `@Injectable({ providedIn: 'root' })` and expose Angular **Signals** (`computed`, `signal`, `model`).

### 3.1 `ThemeService` (`src/app/core/theme/theme.service.ts`)
Controls dynamic OKLCH color science, active theme hue, contrast level, and dark mode toggles.

```typescript
import { inject } from '@angular/core';
import { ThemeService } from './core/theme/theme.service';

const theme = inject(ThemeService);

// Signals & State
theme.isDarkMode();        // boolean (true = dark, false = light)
theme.currentHue();         // number (e.g. 275)
theme.contrastLevel();      // 'standard' | 'medium' | 'high'
theme.themes;               // Array of preset themes ({ name: 'Iris', hue: 275 }, etc.)

// Methods
theme.setThemeHue(235);           // Switches dynamic seed color to Blue
theme.setContrastLevel('high');   // Switches contrast tier ('standard' | 'medium' | 'high')
theme.toggleThemeMode(event);     // Smooth circular clip-path reveal (60/120 FPS)
```

### 3.2 `TaskService` (`src/app/core/tasks/task.service.ts`)
Reactive in-memory store for task items and KPI metrics.

```typescript
import { inject } from '@angular/core';
import { TaskService } from './core/tasks/task.service';

const taskService = inject(TaskService);

// Signals
taskService.tasks();          // TaskItem[]
taskService.pendingCount();   // number
taskService.completedCount(); // number
taskService.completionRate(); // number (0 to 100 percentage)
taskService.filterStatus();   // 'all' | 'pending' | 'completed'
taskService.filteredTasks();  // TaskItem[] automatically filtered

// Mutations
taskService.setFilter('pending');
taskService.toggleCompleted(taskId);
taskService.saveTask({ title, category, dateLabel, priority, notes }, optionalEditId);
taskService.deleteTask(taskId);
```

### 3.3 `DialogService` (`src/app/core/dialog/dialog.service.ts`)
Central coordinator for dialogs, bottom menus, draft form signals, and native View Transitions.

```typescript
import { inject } from '@angular/core';
import { DialogService } from './core/dialog/dialog.service';

const dialogService = inject(DialogService);

// Signals
dialogService.isDialogOpen();     // boolean
dialogService.activeTrigger();    // 'fab-header' | 'bento-center' | 'menu-bottom-left' | 'task-card' | null
dialogService.dialogView();       // 'task-form' | 'menu-main' | 'menu-appearance'
dialogService.navStyle();         // 'rail' | 'dock' | 'tunnel'

// Draft Form Signals (Two-Way Binding)
dialogService.draftTitle;         // WritableSignal<string>
dialogService.draftPriority;      // WritableSignal<TaskPriority>

// Actions
dialogService.openFrom('bento-center'); // Opens dialog morphing from trigger
dialogService.openTaskCard(task);       // Opens dialog morphing from specific card
dialogService.closeDialog();            // Dismisses modal and cleans up active trigger
dialogService.setNavStyle('dock');      // Switches global shell layout
```

### 3.4 `AdaptiveLayoutService` (`src/app/core/layout/adaptive-layout.service.ts`)
Monitors browser resizing and categorizes screens according to official M3 Window Size Classes.

```typescript
import { inject } from '@angular/core';
import { AdaptiveLayoutService } from './core/layout/adaptive-layout.service';

const layout = inject(AdaptiveLayoutService);

layout.windowWidth();       // Current window width in px
layout.windowSizeClass();   // 'compact' (< 600px) | 'medium' (600 - 839px) | 'expanded' (>= 840px)
```

---

## 4. Canonical UI Components (The 80/20 Rule)

Import these standalone components into your feature pages:

```typescript
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3CardComponent } from '../../shared/components/card/card.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../shared/components/text-field/text-field.component';
```

### 4.1 `<m3-button>` (Buttons)
* **Variants**: `'filled'` (high emphasis), `'tonal'` (medium-high), `'elevated'` (surface depth), `'outlined'` (neutral boundary), `'text'` (low emphasis).
* **Sizes**: `'sm'` (32px), `'md'` (40px standard), `'lg'` (48px).

```html
<!-- Primary action with leading icon -->
<m3-button variant="filled" icon="add" (action)="handleCreate()">
  Nuevo Registro
</m3-button>

<!-- Secondary tonal button with squircle shape morph on hover -->
<m3-button variant="tonal" icon="edit" [morph]="true" (action)="handleEdit()">
  Editar
</m3-button>

<!-- Outlined action with trailing icon -->
<m3-button variant="outlined" size="sm" icon="arrow_forward" [iconTrailing]="true" routerLink="/agenda">
  Continuar
</m3-button>

<!-- Accessible icon-only button (48dp touch target guaranteed) -->
<m3-button [iconOnly]="true" variant="text" size="sm" icon="delete" ariaLabel="Eliminar" (action)="remove()" />
```

### 4.2 `<m3-card>` (Cards)
* **Variants**: `'elevated'` (floating with level 1 $\to$ 2 shadow), `'filled'` (tonal container surface), `'outlined'` (1px outline border).
* **Padding**: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`.

```html
<!-- Standard interactive list card -->
<m3-card 
  variant="filled" 
  [interactive]="true" 
  padding="md"
  (action)="selectItem(item)"
  customClass="flex items-center justify-between border border-outline-sub">
  
  <div>
    <h3 class="font-bold text-base">{{ item.name }}</h3>
    <p class="text-xs text-muted">{{ item.description }}</p>
  </div>
  
  <span class="text-primary font-mono font-bold">$120.00</span>
</m3-card>

<!-- Elevated focal card -->
<m3-card variant="elevated" padding="lg">
  <h4 class="text-title-md font-bold">Métricas Diarias</h4>
  <p class="text-sm text-muted">Resumen financiero consolidado</p>
</m3-card>
```

### 4.3 `<m3-chip>` (Chips)
* **Types**: `'filter'` (toggles selection + squircle morph), `'assist'` (smart intent action), `'input'` (removable tag), `'suggestion'` (recommendation).

```html
<!-- Filter chip with dynamic count badge -->
<m3-chip 
  type="filter" 
  [selected]="activeCategory() === 'pos'" 
  count="12"
  (action)="setCategory('pos')">
  Puntos de Venta
</m3-chip>

<!-- Removable input tag -->
<m3-chip 
  type="input" 
  [removable]="true" 
  (remove)="deleteFilter('almacen')">
  Almacén Central
</m3-chip>
```

### 4.4 `<m3-text-field>` (Inputs & Textareas)
* **Variants**: `'filled'` (subtle container recess + focus glow), `'outlined'` (transparent + 1.5px border).
* Implements Angular `ControlValueAccessor` and exposes two-way model `[(value)]`.

```html
<!-- Filled text input with clear button and character limit -->
<m3-text-field 
  variant="filled"
  label="Código de Producto"
  placeholder="Ej. PROD-994"
  icon="qr_code"
  [clearable]="true"
  [maxlength]="20"
  [(value)]="productSku"
  supportingText="Escanea o escribe el SKU" />

<!-- Outlined multiline textarea with character counter -->
<m3-text-field 
  variant="outlined"
  label="Observaciones de venta"
  placeholder="Detalles sobre entrega..."
  icon="notes"
  [multiline]="true"
  [rows]="3"
  [maxlength]="250"
  [(value)]="saleNotes"
  supportingText="Información interna para despacho" />
```

---

## 5. Shell Components & Stage Recess Depth

The global layout in `src/app/app.html` implements the **Stage Recess Depth Pattern**:

```
#app-stage (Navigation + Header + <router-outlet />)
  │
  ├── Normal State: filter: blur(0px) scale(1)
  └── Recessed State: filter: blur(5px) scale(0.988) brightness(0.75) pointer-events: none
        ▲
        └─ Active when dialogService.isDialogOpen() || dialogService.isHeroExpanded()
```

* `<app-header>`: Displays contextual title based on `currentSection()`, theme switch, seed palette swatches, and the header `+` FAB.
* `<app-navigation>`: Renders Navigation Rail (Desktop), Tunnel (Distraction-free), or Floating Dock (Mobile/Compact) dynamically.
* `<app-dialog-container>`: Houses the transformable modal. It automatically binds to `DialogService` draft signals.

---

## 6. How to Build a New Feature Module (Step-by-Step Blueprint)

Follow this 3-step blueprint to create any new enterprise feature (e.g., POS de Ventas, ERP Inventario, Tickets de Soporte).

### Step 1: Create the Feature Component
Create `src/app/features/pos/pos.component.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3CardComponent } from '../../shared/components/card/card.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [
    M3ButtonComponent,
    M3CardComponent,
    M3ChipComponent,
    M3TextFieldComponent
  ],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- PANEL IZQUIERDO: CATÁLOGO Y BUSCADOR (8 COLS) -->
      <section class="lg:col-span-8 space-y-4">
        <m3-text-field 
          variant="filled" 
          label="Buscar producto o escanear código" 
          icon="search" 
          [clearable]="true"
          [(value)]="searchQuery" />

        <div class="flex items-center gap-2 pb-1">
          <m3-chip type="filter" [selected]="selectedCategory() === 'all'" (action)="selectedCategory.set('all')">Todos</m3-chip>
          <m3-chip type="filter" [selected]="selectedCategory() === 'bebidas'" (action)="selectedCategory.set('bebidas')">Bebidas</m3-chip>
          <m3-chip type="filter" [selected]="selectedCategory() === 'alimentos'" (action)="selectedCategory.set('alimentos')">Alimentos</m3-chip>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          @for (prod of products(); track prod.id) {
            <m3-card variant="filled" [interactive]="true" padding="md" (action)="addToCart(prod)">
              <div class="space-y-1">
                <span class="text-xs text-muted font-mono">{{ prod.sku }}</span>
                <h4 class="font-bold text-sm">{{ prod.name }}</h4>
                <div class="text-lg font-bold text-primary pt-1">{{ prod.price | currency }}</div>
              </div>
            </m3-card>
          }
        </div>
      </section>

      <!-- PANEL DERECHO: TICKET DE VENTA (4 COLS) -->
      <section class="lg:col-span-4">
        <m3-card variant="elevated" padding="lg" customClass="space-y-4 border border-outline-sub">
          <div class="flex items-center justify-between pb-2 border-b border-outline-sub">
            <h3 class="font-bold text-base">Ticket de Venta</h3>
            <span class="text-xs text-muted">Mesa 04</span>
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            @for (item of cart(); track item.id) {
              <div class="flex items-center justify-between text-sm py-1">
                <span>{{ item.qty }}x {{ item.name }}</span>
                <span class="font-mono font-bold">{{ item.total | currency }}</span>
              </div>
            }
          </div>

          <div class="pt-4 border-t border-outline-sub space-y-3">
            <div class="flex justify-between text-base font-extrabold">
              <span>Total a Cobrar</span>
              <span class="text-primary text-xl font-mono">{{ cartTotal() | currency }}</span>
            </div>

            <m3-button variant="filled" size="lg" icon="point_of_sale" customClass="w-full" (action)="checkout()">
              Cobrar Venta
            </m3-button>
          </div>
        </m3-card>
      </section>
    </div>
  `
})
export class PosComponent {
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('all');
  readonly products = signal([
    { id: 1, sku: 'SKU-101', name: 'Café Espresso Doble', price: 3.50 },
    { id: 2, sku: 'SKU-102', name: 'Sandwich Artesanal', price: 7.20 },
    { id: 3, sku: 'SKU-103', name: 'Agua Mineral 500ml', price: 2.00 }
  ]);
  readonly cart = signal([
    { id: 1, qty: 2, name: 'Café Espresso Doble', total: 7.00 }
  ]);
  readonly cartTotal = signal(7.00);

  addToCart(prod: any) { /* Cart logic */ }
  checkout() { /* Checkout flow */ }
}
```

### Step 2: Register the Route
Add the path in `src/app/app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', loadComponent: () => import('./features/overview/overview.component').then(m => m.OverviewComponent) },
  { path: 'agenda', loadComponent: () => import('./features/agenda/agenda.component').then(m => m.AgendaComponent) },
  { path: 'design-system', loadComponent: () => import('./features/design-system/design-system.component').then(m => m.DesignSystemComponent) },
  { 
    path: 'pos', 
    loadComponent: () => import('./features/pos/pos.component').then(m => m.PosComponent) 
  },
  { path: '**', redirectTo: 'overview' }
];
```

### Step 3: Add Navigation Item
Add the link in `src/app/shared/ui/navigation.component.ts`:

```html
<a 
  routerLink="/pos"
  routerLinkActive="bg-sec-box text-on-sec-box font-semibold shadow-xs"
  class="btn-m3 w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-left cursor-pointer text-muted hover:bg-surface-high hover:text-main">
  <span class="material-symbols-rounded text-xl">point_of_sale</span>
  <span class="hidden md:inline text-sm">Punto de Venta</span>
</a>
```

And update `src/app/app.ts` section detector:
```typescript
private detectSection(url: string): AppSection {
  if (url.includes('/agenda')) return 'agenda';
  if (url.includes('/design-system')) return 'design-system';
  if (url.includes('/pos')) return 'pos';
  return 'overview';
}
```

And update `src/app/shared/ui/header.component.ts` title mapping:
```html
@if (currentSection() === 'pos') {
  Punto de Venta (POS)
}
```

That is all. The module inherits Stage Recess depth, OKLCH dynamic theming, shape morphing, dark mode circular reveal, and native View Transitions with zero layout bugs.
