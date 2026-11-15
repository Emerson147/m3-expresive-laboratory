---
name: m3-expressive-ui
description: Comprehensive architectural and engineering reference for Material 3 (M3) Expressive user interfaces. Use when designing, building, or refactoring web components with OKLCH color science, dynamic seed theming, Bento Grid layouts, container transform shape morphing, Stage Recess depth, and native View Transitions API orchestration without stacking context bugs or input lag.
---

# Material 3 (M3) Expressive — Architecture & Implementation Guide

This skill encapsulates the foundational principles, CSS architecture, token formulas, and View Transitions mechanics required to build production-grade Material 3 Expressive interfaces.

---

## 1. Core Philosophy: M3 Expressive vs. Classic M3

M3 Expressive departs from rigid, sterile enterprise layouts through:

1. **Dynamic Color Science (OKLCH)**: Perceptually uniform lightness across the color spectrum, preventing luminance distortion when shifting hues.
2. **Spring Physics & Expressive Motion**: Non-linear physics (`cubic-bezier(0.05, 0.7, 0.1, 1)` and spring curves) instead of generic linear/ease transitions.
3. **Fluid Shape Morphing**: Elements dynamically transition between bounded pill (`h/2`) and squircle radii on interactive controls, and uniform $N=180$ SVG spline polygons on `<m3-loading-indicator>`.
4. **Bento Grid Hierarchy**: Asymmetric modular cards prioritizing content density and focal points over uniform repetition.
5. **Depth via Stage Recess**: Modal dialogs do not simply cover content with a dark scrim; the entire underlying stage scales down and blurs into a recess layer.

---

## 2. 3-Tier Color Tokens & OKLCH Dynamic Theming

### Architecture & Vibrant Expressive Progression

Tokens flow strictly through **3 tiers** (`src/styles/_token.css`): **Reference (`--md-ref-*`: palette & typefaces) $\to$ System (`--md-sys-*`: semantic roles, shape, motion, elevation, state opacities) $\to$ Component (`--md-comp-*`) & Tailwind v4 `@theme`**.

Standard HSL and RGB suffer from perceptual non-uniformity: Hue 60° (Yellow) appears much brighter than Hue 240° (Blue) at identical lightness percentages. OKLCH guarantees constant perceived luminance:

$$\text{oklch}(\text{Lightness} \quad \text{Chroma} \quad \text{Hue})$$

### 8 Surfaces, 12 Fixed Roles, Extended Semantics & 3 Contrast Levels

```css
/* src/styles/_token.css (simplified; references flow through --md-ref-palette-* → --md-sys-color-*) */
:root {
  --seed-hue: 275; /* Dynamic user seed in degrees (0 - 360) */

  /* Vibrant Expressive Surface Progression (8 Ordered Surfaces)
     Light chroma grows 0.005 → 0.022 | Dark chroma grows 0.014 → 0.030 */
  --md-sys-color-surface-dim: oklch(84% 0.020 var(--seed-hue));
  --md-sys-color-surface: oklch(98% 0.005 var(--seed-hue));
  --md-sys-color-surface-container-lowest: /* Peak inset surface (_token.css) */;
  --md-sys-color-surface-container-low: oklch(96% 0.008 var(--seed-hue));
  --md-sys-color-surface-container: oklch(93% 0.012 var(--seed-hue));
  --md-sys-color-surface-container-high: oklch(90% 0.018 var(--seed-hue));
  --md-sys-color-surface-container-highest: oklch(86% 0.022 var(--seed-hue));
  --md-sys-color-surface-bright: /* High-emphasis canvas (_token.css) */;
}

.dark {
  --md-sys-color-surface-dim: oklch(10% 0.014 var(--seed-hue));
  --md-sys-color-surface: oklch(12% 0.016 var(--seed-hue));
  --md-sys-color-surface-container-low: oklch(15% 0.018 var(--seed-hue));
  --md-sys-color-surface-container: oklch(18% 0.022 var(--seed-hue));
  --md-sys-color-surface-container-high: oklch(22% 0.026 var(--seed-hue));
  --md-sys-color-surface-container-highest: oklch(27% 0.030 var(--seed-hue));
}
```

* **12 Theme-Invariant Fixed Roles**: `--md-sys-color-{primary,secondary,tertiary}-fixed`, `*-fixed-dim`, `--md-sys-color-on-*-fixed`, and `*-fixed-variant` keep constant lightness/chroma across Light and Dark modes (use for persistent badges and media overlays).
* **Extended Semantic Roles**: OKLCH-harmonized `success` / `warning` roles (`--md-sys-color-success*`, `--md-sys-color-warning*`) alongside `error`.
* **3 Contrast Levels + Forced Colors**: Switch `standard | medium | high` via `ThemeService.setContrastLevel(level)` to tighten surface/text/border separation; pair with `@media (forced-colors: active)` OS high-contrast fallbacks.

### Circular Reveal Dark Mode

Trigger a circular clip-path reveal using View Transitions:

```typescript
toggleThemeMode(event?: MouseEvent): void {
  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = (document as any).startViewTransition(() => {
    this.isDarkMode.update(dark => !dark);
    document.documentElement.classList.toggle('dark', this.isDarkMode());
  });

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 380,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
}
```

---

## 3. Layout Architecture: Bento Grid & Responsive Navigation

### Bento Grid & Layout Archetypes

En lugar de imponer rígidamente una "Hero Card" decorativa de 7 columnas (que hace que cualquier sistema parezca una landing page genérica y arruina la densidad de datos), la composición debe adaptarse al **arquetipo funcional del dominio**:

#### 1. Arquetipo Operativo / Split-Pane (POS, Inventario Multidimensional, Gestores)

* **Objetivo**: Maximizar la velocidad de captura, selección y edición de datos sin scrolls innecesarios ni elementos decorativos que resten espacio.
* **Estructura**:
  * **Panel Maestro / Filtros / Catálogo (Left)**: `lg:col-span-4 xl:col-span-3`, selección rápida con chips, búsqueda y cards compactas.
  * **Canvas de Trabajo / Matriz / Registro (Right)**: `lg:col-span-8 xl:col-span-9`, área activa para matrices 2D, tablas reactivas o tickets de cobro.
  * **Densidad**: Alta; tipografía compacta (`text-sm`, `font-mono` para métricas), celdas semánticas y acciones directas.

#### 2. Arquetipo Analítico / Mission Control (Telemetría, Finanzas, Logística)

* **Objetivo**: Visión holística de KPIs críticos y detección instantánea de anomalías.
* **Estructura**:
  * **Ribbon Superior de KPIs**: 3 o 4 tarjetas métricas compactas (`grid-cols-2 md:grid-cols-4`), con indicadores de progreso ondulantes M3 para ratios de salud.
  * **Bento Asimétrico de Telemetría**: Gráfico de flujo en tiempo real (`lg:col-span-8`) + Feed de alertas o eventos vivos (`lg:col-span-4`).

#### 3. Arquetipo Canvas Inmersivo (Product Studio, Diseñadores, Flujos)

* **Objetivo**: Foco absoluto en la creación y previsualización.
* **Estructura**: 2 columnas simétricas o 60/40 (Configurador interactivo a la izquierda + Live Canvas reactivo a la derecha), con escape rápido (`Esc` key) y persistencia atómica.

#### 4. Arquetipo Showcase / Overview

* **Objetivo**: Resumen ejecutivo y bienvenida.
* **Estructura**: Único arquetipo donde tiene sentido una tarjeta focal de cabecera (`hero-mesh-m3`), acompañada de accesos rápidos modulados.

### Navigation Styles (Rail vs. Dock vs. Tunnel)

- **Rail**: Fixed vertical sidebar (`w-20 md:w-64 border-r border-outline-sub bg-surface-low p-4`) for desktop workflows.
* **Tunnel**: Minimal text-based, high-typographic focus for distraction-free reading.
* **Floating Dock**: Floating pill pinned to the bottom (`fixed bottom-5 inset-x-0 mx-auto w-fit z-30`).

> [!IMPORTANT]
> When encapsulating navigation inside an Angular component or Web Component, use `host: { class: 'contents' }`. If the custom element wrapper generates an intermediate CSS box, it will break flexbox column distributions and containing blocks for `position: fixed`.

---

## 4. The View Transitions API & Container Transform

The View Transitions API (`document.startViewTransition`) snapshots the DOM before and after state changes, synthesizing smooth morphing animations.

### The Stacking Context Trap (Top-Layer Promotion Bug)

Any element with an assigned `view-transition-name` is lifted out of standard document stacking into the browser's `::view-transition` top layer:

```
::view-transition
 └── ::view-transition-group(root)
      └── ::view-transition-image-pair(root)
           ├── ::view-transition-old(root)
           └── ::view-transition-new(root)
 └── ::view-transition-group(my-element)  <-- RENDERS ABOVE ROOT & BACKDROP!
```

**The Bug:** If you assign static `view-transition-name: hero-transform` to an element, Chromium creates a dedicated `::view-transition-group`. When a modal or backdrop opens inside `root`, `::view-transition-group(my-element)` is rendered **above** the backdrop, breaking visual elevation.

**The Golden Architecture Rule:**
**NEVER** declare persistent static `view-transition-name` in CSS or templates for non-active elements. Bind the name **dynamically and contextually**:

```html
<!-- Only the trigger or dialog currently transitioning owns the name -->
<button 
  id="trigger-btn"
  (click)="openDialog('menu')"
  [class.invisible]="isDialogOpen && activeTrigger === 'menu'"
  [style.view-transition-name]="!isDialogOpen && activeTrigger === 'menu' ? 'dialog-transform' : null">
  ...
</button>

<div 
  id="dialog-container"
  [style.view-transition-name]="isDialogOpen ? 'dialog-transform' : null">
  ...
</div>
```

### Zero-Latency DOM Mutation

1. **Never** block the `startViewTransition` callback with `requestAnimationFrame` or `setTimeout`.
2. Synchronously apply state mutations via signals:

```typescript
runViewTransition(mutation: () => void, onFinished?: () => void): void {
  if (document.startViewTransition) {
    const transition = document.startViewTransition(() => {
      mutation();
      this.cdr.detectChanges(); // Synchronous DOM paint
    });

    transition.finished?.finally(() => {
      onFinished?.();
      this.cdr.detectChanges();
    });
    return;
  }
  mutation();
  onFinished?.();
}
```

### The 3-Filter Motion Playbook (CSS Transitions vs. View Transitions)

Always evaluate these 3 filters before writing animation code:

1. **Filter 1 — DOM Lifecycle**:
   * **Node stays alive in same component** (Card expand, FAB morph, inline drawer): Use **CSS Transitions** with bounded explicit dimensions + `overflow-hidden`, or CSS Grid `grid-rows-[0fr]` &harr; `grid-rows-[1fr]` + `[attr.inert]`. Do NOT use `startViewTransition` for local same-tree state.
   * **DOM tree is destroyed & rebuilt** (Route change, overlay modal teleported to root): Use **View Transitions API** (`view-transition-name`) to morph GPU snapshots across detached DOM nodes.
2. **Filter 2 — Physics Family & M3 Transition Context (`src/styles/_motion.css`)**:
   * **Begins & Ends On-Screen / Recoverable** (`hero-transform`, inline expand): Use `--md-sys-motion-easing-emphasized` (10-stop `linear(...)` curve) with asymmetric durations (`500ms` `long2` expand &harr; `250ms` `medium1` return), or **Spatial** spring tokens (`damping: 0.9`). Never pair `emphasized-accelerate` when the returning snapshot lands visible on a card slot.
   * **Enters vs. Permanent Exit** (`dialog-transform`, dismissed overlays): Pair `--md-sys-motion-easing-emphasized-decelerate` (`400ms` `medium4`) with `--md-sys-motion-easing-emphasized-accelerate` (`200ms` `short4`).
   * **Effects (`damping: 1.0`, critical zero-bounce)**: Changes color, opacity, or shadow (`--md-sys-motion-spring-*-effects-curve`, `150ms`–`300ms`). Never bounce optical properties.
3. **Filter 3 — Zero Magic Numbers & Compositor-Only Ambient Motion**:
   * Strictly consume `--md-sys-motion-duration-*` (`short1` 50ms &rarr; `extra-long4` 1000ms) and `--md-sys-motion-easing-*` so `@media (prefers-reduced-motion: reduce)` works globally.
   * For Gemini-style ambient blurred aurora backgrounds (`.m3-aurora-glow`), render circular `closest-side` multi-stop OKLCH radial clouds (`.m3-aurora-orb-1..3`) inside `<div class="m3-aurora-layer" aria-hidden="true">` — **never** on `::before`/`::after` of `.card-interactive`/`.state-layer` hosts (which reserve `::before` for `currentColor` overlays). Keep the surface consistent across morphed Container Transform pairs (Hero Card &harr; Hero Modal), animate **only** compositor `transform` + `opacity`, pause on `html.vt-running`, and set `animation: none` under `prefers-reduced-motion`.

### Stage Recess + View Transitions Coordination Checklist
* **Keep Origin Slot Mounted**: Hide expanded card sources via `[class.invisible]` + `[attr.aria-hidden]` instead of `@if` to prevent Bento grid shifts and stagger replays on return.
* **Prevent Blurry Stage Snapshots**: Set `html.vt-running #app-stage { transition: none !important; }` and freeze background ambient loops during active View Transitions.
* **Isolate Hero Return Timing**: Scope Hero close overrides to `html.vt-hero.vt-exiting:not(.theme-transition)` so dark-mode circular reveals remain intact, preserve opaque container background/border on `::view-transition-group(hero-transform)`, lock snapshot aspect ratio (`object-fit: none; object-position: top left; width: 100%; height: 100%`), and route focus to the revealed modal heading (`tabindex="-1"`).

### ⚠️ CRITICAL: CSS Transition Layout Traps (Zero-Glitch Container Transform)

When animating local containers with CSS (`transition-all`), **two silent CSS traps destroy M3 fluidity**:

1. **The `max-width: none` Horizontal Explosion Trap**:
   * **Never** pair `w-full max-w-md` (expanded) with `w-72` (collapsed, where `max-width` is implicitly `none`). On collapse at $t = 0\text{ms}$, `max-width` instantly snaps to `none` while `width` still interpolates from `100%`, causing the card to **explode horizontally across the entire parent** before shrinking.
   * **Fix**: Pin `max-w-full` invariants in static `class` and animate strictly bounded explicit dimensions (`w-72` &harr; `w-[448px]`, `h-16` &harr; `h-48`).
2. **The `height: auto` Snap & Blank Void Trap**:
   * CSS cannot interpolate `height: auto`, and unmounting child content synchronously via `@if` on close leaves a huge hollow box collapsing for `500ms` (`long2`).
   * **Fix**: Keep detail content inside `overflow-hidden` and cross-fade its opacity asymmetrically (`100ms` `short2` with `0ms` delay on collapse; `300ms` `medium2` with `80ms` delay on expand):

```html
<div
  (click)="toggleExpanded()"
  class="cursor-pointer overflow-hidden border select-none max-w-full transition-all"
  [class]="expanded()
    ? 'w-[448px] h-48 p-4 bg-surface-box rounded-m3-xl border-primary shadow-lg'
    : 'w-72 h-16 p-3 bg-surface-high rounded-m3-lg border-outline-sub shadow-xs'"
  style="transition-duration: var(--md-sys-motion-duration-long2); transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate);">
  <!-- Persistent Header stays in DOM -->
  <div class="flex items-center justify-between gap-2">...</div>

  <!-- Secondary Details fade asymmetrically without hollow ghosting -->
  <div
    class="mt-3.5 transition-opacity"
    [style.transition-duration]="expanded() ? 'var(--md-sys-motion-duration-medium2)' : 'var(--md-sys-motion-duration-short2)'"
    [style.transition-delay]="expanded() ? '80ms' : '0ms'"
    [class]="expanded() ? 'opacity-100' : 'opacity-0 pointer-events-none'">
    ...
  </div>
</div>
```

### Reusable Token-Backed Motion Classes (`src/styles/_motion.css`)

Do not duplicate inline `style="transition-duration: var(...)"` across feature components. Compose Tailwind transition properties (`transition-all`, `transition-colors`, `transition-transform`) with these centralized classes:

* `.m3-transition-fast` (`short3` 150ms + `fast-effects`): Search bars, chips, filter tabs, pill controls.
* `.m3-transition-standard` (`short4` 200ms + `standard`): Dense POS/enterprise product cards and high-frequency actions.
* `.m3-transition-emphasized` (`medium2` 300ms + `emphasized-decelerate`): Featured hover zooms and surface reveals.
* `.m3-transition-spatial` (`long2` 500ms + `emphasized-decelerate`): Container Transforms and large spatial morphs.
* `.m3-anim-spring-pop`: Expressive Fast Spatial Spring (`350ms` overshoot) for cart badges, steppers, and sale confirmation badges.
* `.m3-anim-item-in`: Subtle upward reveal (`short4` 200ms) for incoming cart/list rows.
* `.m3-anim-lateral`: Unison peer slide (`medium1` 250ms) for payment/tab panels.
* `.m3-anim-fade-through`: Clean cross-scale swap (`medium1` 250ms) for empty states, discounts, and root switches.

### The 6 Canonical M3 Transition Patterns

1. **Container Transform** (`long2` 500ms enter / `medium1` 250ms return + `emphasized`): Persistent outer surface morphs cleanly into detail state and settles smoothly back into its origin slot.
2. **Forward & Backward** (`medium2` 300ms + `emphasized-decelerate`): Horizontal directional slide + fade (`m3ForwardIn` / `m3BackwardIn`) across hierarchical levels.
3. **Lateral** (`medium1` 250ms + `standard`): Peer tabs sliding in strict unison without fade (`m3LateralIn`).
4. **Top Level (Fade Through)** (`medium1` 250ms + `standard`): Unrelated root destinations cross-fading cleanly with subtle `92% -> 100%` scale (`m3FadeThroughIn`), zero horizontal swipe.
5. **Enter & Exit** (`short4` 200ms / `medium1` 250ms): Directional emergence from physical device edges (`m3EnterFromTop`, `m3EnterFromBottom`).
6. **Skeleton Loaders** (`extra-long2` 800ms shimmer + `m3FadeIn`): Pre-sized layout placeholders ensuring zero Cumulative Layout Shift (`CLS = 0.00`).

---

## 5. The Stage Recess Depth Pattern

Instead of simply dimming the background with a flat black overlay, M3 Expressive shifts the entire background layer into the background depth plane:

```css
.stage-normal {
  filter: blur(0px) brightness(1);
  transform: scale(1);
  transition: 
    filter 320ms cubic-bezier(0.05, 0.7, 0.1, 1),
    transform 320ms cubic-bezier(0.05, 0.7, 0.1, 1),
    border-radius 320ms cubic-bezier(0.05, 0.7, 0.1, 1);
}

.stage-recessed {
  filter: blur(6px) brightness(0.72);
  transform: scale(0.988);
  border-radius: 24px;
  pointer-events: none;
  user-select: none;
  transition: 
    filter 320ms cubic-bezier(0.05, 0.7, 0.1, 1),
    transform 320ms cubic-bezier(0.05, 0.7, 0.1, 1),
    border-radius 320ms cubic-bezier(0.05, 0.7, 0.1, 1);
}
```

### ⚠️ CRITICAL: The Stacking Context Trap (Filter Rasterization)

Applying CSS `filter: blur(...)` to a container element (`#app-stage`) forces the browser to establish a **new containing block** and rasterize the entire subtree into a single off-screen bitmap:
* **The Consequence**: Any modal dialog rendered inside child routes (`<router-outlet>`) will be rasterized with `blur(6px)`, rendering dialog forms and buttons completely illegible. Setting `position: fixed` or `z-index: 99999` on child modals CANNOT escape ancestor `filter` clipping!
* **The Architectural Solution**:
  1. Do NOT apply `.stage-recessed` to `#app-stage` for feature-level modal dialogs residing inside routed components.
  2. Modals must render their own overlay with `backdrop-filter: blur(8px)` and `background-color: oklch(0% 0 0 / 0.7)`. The overlay blurs the background dynamically, while the dialog surface retains 100% vector sharpness.

---

## 6. Foundations: Interaction, State Layers & Adaptive Layout

### Universal State Layer Engine

Never use raw `:hover { opacity }` or `:hover { background }`. In M3, state layers project a `currentColor` overlay (`on-*` on Filled/Tonal buttons, `primary` on Outlined/Text, **neutral `on-surface` on interactive Cards** to keep nested badges untinted):
* **Hover**: 8% opacity (`var(--md-sys-state-hover-state-layer-opacity)`)
* **Focus**: 10% opacity (`var(--md-sys-state-focus-state-layer-opacity)`) + dual focus ring
* **Pressed**: 12% opacity (`var(--md-sys-state-pressed-state-layer-opacity)`) + spring scaling (`scale(0.975)`)
* **Dragged / Disabled**: 16% dragged (`--md-sys-state-dragged-state-layer-opacity`); disabled `0.38` content / `0.12` container (`--md-sys-state-disabled-*`)
* **Touch Target & Spacing**: 48×48dp minimum accessible hitbox via `.touch-target-48` (`min-inline-size` / `min-block-size: 48px`) + minimum **8dp gap** (`.touch-gap-8`) between adjacent hitboxes. Use `touch-action: pan-y` on horizontal swipes (never `none` if vertical scroll matters).
* **Focus Ring & Forced Colors**: `.focus-ring-m3:focus-visible` uses a dual `box-shadow` plus an `@media (forced-colors: active)` **`outline: 3px solid Highlight`** fallback (never `outline: none` + `box-shadow` alone, or focus disappears in High Contrast Mode).
* **WCAG Contrast, Color Independence & Accessible Forms**: Enforce `≥ 4.5:1` contrast for normal text and `≥ 3:1` for large text, icons, and component borders; never denote errors/states by color alone (always pair with icon + text). Use `<label for>`, place hints above inputs via `aria-describedby`, and sync `aria-invalid="true"` with `:user-invalid` after interaction (never prematurely on load).
* **Keyboard & Reduced Motion**: Use Roving Tabindex (`tabindex="0"` active, `-1` siblings, Arrow keys within groups), native `<dialog>.showModal()` / `inert` overlays, `aria-live="polite"`, sequential headings (`h1 → h2 → h3`), and `@media (prefers-reduced-motion: reduce)`.
* **Content & Bidirectionality (LTR / RTL)**: Size buttons with `min-inline-size` / `fit-content` to tolerate `+35%` text expansion and use native `Intl` formatters. Author spacing with CSS logical properties (`inline-start`, `ps-*`, `pe-*`, `border-s-*`), mirroring directional icons (`arrow_back`) in RTL but never clocks or checkmarks.

### Parts of Layout, Adaptive Design & Window Size Classes

Every Material 3 layout separates **Navigation Components** (Bar `<600dp`, Rail `80dp` `600–1199dp`, Persistent/Standard Drawer `220–360dp` `≥1200dp`) from the **Body Region**:
* **Body Anatomy (`parts-of-layout`)**: Pair a **Fixed Pane** (`320–412dp`) with a **Flexible Pane** (`1fr`) separated by a **`24dp` Spacer** (containing an optional `48×48dp` **Drag Handle** hit target for user split resizing) and bounded by **`16dp` (Compact) / `24dp` (Medium+) Margins**. On foldables, align the Spacer with the **Fold (Hinge)** so content is never clipped.
* **Adaptive Design (`adaptive-design`)**: Go beyond scaling proportions (Responsive) by restructuring layouts via **Show & Hide** (reveal secondary panes at `Expanded+`), **Levitate** (sheets/floating pills over canvas), and **Reflow** (`row` ↔ `column` stack + grid column counts). Prefer CSS `@container (inline-size)` (`container-type: inline-size`) for component/window-level adaptation.

Material 3 Expressive (`AdaptiveLayoutService`) categorizes viewports into **5 Width Breakpoints** (`16dp` outer margin in Compact, `24dp` in Medium+):
* **Compact (< 600dp)**: 1 pane, `16dp` margin/spacer $\to$ Bottom Navigation Bar / Floating Dock.
* **Medium (600dp – 839dp)**: 1–2 panes, `24dp` margin/spacer $\to$ Navigation Rail.
* **Expanded (840dp – 1199dp)**: 2 panes $\to$ Rail / Modal Drawer (*List-Detail*, *Supporting Pane*, *Feed*).
* **Large (1200dp – 1599dp)**: 2 wide panes $\to$ Expanded Rail / Persistent Drawer + 12-col Bento.
* **Extra-Large (≥ 1600dp)**: 2–3 panes $\to$ Persistent Drawer + multi-pane workspace.
* **Height Breakpoints**: `compact (<480dp)`, `medium (480–899dp)`, `expanded (≥900dp)`.

---

## 7. Component Checklist for Extensibility

When porting or creating new M3 Expressive components:
* [ ] **State Separation**: Business logic and metrics belong in `@Injectable({ providedIn: 'root' })` services (`ThemeService`, `TaskService`, `AdaptiveLayoutService`), never in template logic.
* [ ] **CSS Box Isolation**: Use `host: { class: 'contents' }` or `host: { class: 'block col-span-12' }` on custom components to prevent CSS grid/flex layout clipping.
* [ ] **State Layers**: Interactive elements must include `.state-layer` and `.focus-ring-m3`.
* [ ] **Bounded Pill Shape Morphing**: Animate corner morphs using bounded half-height (`h/2`) component tokens (`24px/20px ↔ 12px/10px` via `--md-comp-button-shape-pill`, `16px ↔ 8px` via `--md-comp-chip-shape-pill`) + `--md-sys-motion-spring-expressive-fast-spatial`. **Anti-pattern**: never animate `border-radius` from `9999px` (`rounded-full`)—CSS interpolates numerically from `9999` down to `h/2` before corners start moving (~1s dead-zone).
* [ ] **Dynamic View Transitions**: Always control `view-transition-name` with an `activeTransition` signal state.
* [ ] **Disabled Opacity Separation**: Never apply parent `opacity: 0.38` on filled/chip containers (which compounds `12%` background into `4.5%`). Set container/border via `12%` `on-surface` and content ink independently via `38%` `on-surface`.
* [ ] **Zero Nested Interactives**: Composite chips (`<m3-chip [removable]="true">`) use `.m3-chip-composite` with two sibling `<button>` elements rather than nesting `role="button"` inside `<button>`.
* [ ] **Web Popover Distinction**: Use `popover="auto"` for light-dismiss menus (`<m3-split-button>`) and `popover="manual"` + `role="status"` + `aria-live="polite"` for `<m3-snackbar>`, animated via `transition-behavior: allow-discrete`, `overlay`, and `@starting-style` with `'popover' in HTMLElement.prototype` feature detection.

---

## 8. Canonical Component Implementations: Buttons

### The 80/20 Rule for Components

4 core components solve 80% of application interfaces: Buttons, Cards, Chips, and Text Fields.

### Button Variants, Extended Controls & Hierarchy

- `filled`: High emphasis. Only one per flow/dialog for final commit ("Save", "Create").
* `tonal`: Medium-high emphasis. Secondary priority companion without competing ("Edit").
* `elevated`: Medium emphasis with elevation level 1 $\to$ 2. Used over complex or patterned backgrounds.
* `outlined`: Medium emphasis. Neutral structured secondary action ("Filter", "Options").
* `text`: Low emphasis. Minimal visual footprint ("Cancel", "Dismiss").
* **5-Tier Scale**: `xs` (28px), `sm` (32px), `md` (40px), `lg` (48px), `xl` (56px) in `<m3-button>`.
* **Toggle (`[toggle]="true"`)**: Exposes `aria-pressed` and morphs corners from pill (`24px`) to square (`12px`) when selected.
* **Button Groups (`<m3-button-group>`)**: Supports `standard` (8px gap) and `connected` (2px gap, active item morphs to `24px` pill — replaces deprecated Segmented Buttons).
* **Split Button (`<m3-split-button>`)**: Connected primary action + chevron trigger opening a Top-Layer `[popover="auto"]` menu.
* **FAB / Extended FAB (`<m3-fab>`)**: Level 3 $\to$ 4 elevation in `sm`/`md`/`lg` or Extended (`label` input).

### Standard Angular Consumption

```html
<!-- Dialog Action Pairing -->
<m3-button variant="text" (action)="cancel()">Cancelar</m3-button>
<m3-button variant="filled" icon="check" (action)="save()">Guardar</m3-button>

<!-- Task Card Secondary Action -->
<m3-button variant="outlined" size="sm" icon="edit" (action)="editTask(task)">Editar</m3-button>
<m3-button [iconOnly]="true" variant="text" size="sm" icon="delete" (action)="deleteTask(task.id)" />
```

### Card Variants & Hierarchy

- `elevated`: `surface-container-low` with level 1 $\to$ 2 elevation. Focal widgets, summaries, or cards over subtle backgrounds.
* `filled`: `surface-container-highest` with flat tonal contrast. Repeatable list cards and dense dashboards.
* `outlined`: `surface` with 1px `outline-variant` boundary. Structural grouping, settings panels, or cards inside other containers.
* **Dynamic Theme vs. Semantic Color**: Rely on `--seed-hue` surface roles by default instead of arbitrary hex overrides. Use `[tone]="'primary' | 'secondary' | 'tertiary' | 'error'"` when semantic emphasis is required (`--md-comp-*-card-*` tokens in `_card.css`), and `[disabled]="true"` for non-interactive disabled cards.
* **Never nest interactive controls inside `[interactive]="true"` cards**: Whole-card action uses `role="button"`; place `<m3-button>` or links only inside `[interactive]="false"` container cards.

```html
<m3-card variant="elevated" tone="primary" [interactive]="true" (action)="openSummary()">
  ...
</m3-card>

<m3-card variant="filled" [interactive]="false" customClass="flex items-center justify-between">
  <span>{{ task.title }}</span>
  <m3-button variant="outlined" size="sm" icon="edit" (action)="editTask(task)">Editar</m3-button>
</m3-card>
```

### Chip Types & Hierarchy

- `filter`: Selection with `check` icon and bounded shape morphing from `16px` (`--md-comp-chip-shape-pill`) to `8px` squircle (`_chip.css`), avoiding the `9999px` dead-zone.
* `assist`: Contextual action trigger with leading icon.
* `input`: User tag entity with trailing remove (`cancel`) icon.
* `suggestion`: System recommendation pill.

```html
<m3-chip type="filter" [selected]="isActive()" count="5" (action)="toggle()">Filtro</m3-chip>
<m3-chip type="input" [removable]="true" (remove)="removeTag()">Tag</m3-chip>
```

### Text Field Variants & Hierarchy (The 4th Pillar)

- `filled`: High visual prominence (`surface-container-low` + bottom indicator). Best for **dialogs (`<dialog>`), brief modals, and compact single-focus actions**.
* `outlined`: Lower visual weight (transparent background + `1.5px outline-variant`). Best for **long multi-field forms** and inputs placed over filled surfaces.
* **Modern Affixes & Password Reveal**: `[prefix]` / `[suffix]` are wired into `aria-describedby` (`${id}-prefix`/`-suffix`) while keeping labels floated; opt-in `[passwordToggle]="true"` adds an accessible `aria-pressed` visibility button.
* **Deferred Validation, Autofill & Auto-Grow**: Native `[required]`, `[pattern]`, `[minlength]`, `[enterkeyhint]`, `[name]`, `[readonly]`, and `[showValidState]` pair `:user-invalid` / `:user-valid` / `:autofill` with blur/invalid tracking. `[autoGrow]="true"` enables CSS `field-sizing: content` (`width: 100%`, `min-block-size: 3lh`, `max-block-size: 10lh`). Leading icons stay geometrically static (color transition only per M3); `@starting-style` animates helper/trailing controls and `m3FieldErrorNudge` signals invalid errors behind `prefers-reduced-motion`.

```html
<!-- Filled modal/dialog input with inline affixes -->
<m3-text-field
  variant="filled"
  label="Monto"
  type="number"
  inputMode="decimal"
  prefix="S/"
  suffix="PEN"
  [clearable]="true"
  [(value)]="amount" />

<!-- Outlined multiline textarea with CSS field-sizing auto-grow -->
<m3-text-field 
  variant="outlined" 
  label="Notas técnicas" 
  icon="description" 
  [multiline]="true" 
  [autoGrow]="true"
  [maxlength]="250" 
  [(value)]="taskNotes" 
  supportingText="Criterios y arquitectura" />
```

---

## 9. Canonical Component Implementations: Progress Indicators & Loading

### M3 Expressive Anatomy & Wave Physics (Image 4 & 5 Specifications)

- **Linear Progress (`m3-linear-progress`)**:
  * **Disjoint Track Anatomy & `40dp` Floor**: Uses `--m3-progress-track` (`secondary-container` default per M3 Progress spec) for the inactive track, never passing underneath the active wave. Enforces `min-width: 40px` (`Math.max(40, ...)` floor) and mirrors horizontally under `dir="rtl"`. Flat determinate mode renders at least a circular dot (`min-width: strokeWidth`) at `1%` progress, omits leading gaps at `0%`, and uses `clip-path` to maintain a transparent `4dp` gap before buffer bars. Stop indicator dot stays fixed at canonical `4dp` (`stopDotRadius: 2` for `md`/`lg`, `1` for `sm`; concentric at `containerWidth - strokeRadius`, with `circle.m3-linear-progress-stop` resetting CSS `transform: none` so wavy SVG alignment never shifts), remaining visible up to `98%` (hide via `[showStop]="false"` only when surrounding container contrast is `>= 3:1`).
  * **Wavy Variant (`[wavy]="true"`)**:
    * **Official M3 Wave Metrics**: Standard (`md`, `4dp` stroke) uses `wavelength = 40dp`, `amplitude = 3dp`, `containerHeight = 10px`. Thick (`lg`, `8dp` stroke) uses `wavelength = 40dp`, `amplitude = 3dp`, `containerHeight = 14px` (or expands dynamically if custom `[amplitude]` is passed).
    * **Living Wave Motion & Battery Efficiency**: Driven by continuous traveling wave physics $y(x, t) = y_{center} + A(p) \cdot \sin(2\pi x / \lambda - \phi)$. Reactive `effect()` runs `requestAnimationFrame` ONLY when `[wavy]="true"`, `!paused()`, motion is enabled, and progress is active (`isIndeterminate()` or `0 < value < 100`). Supports optional `[amplitude]`, `[wavelength]`, `[speed]`, `[paused]`, and `[blueprint]` engineering overlays.
    * **Cap-Edge Gap & Boundary Attenuation**: Coordinates account for rounded cap overhang (`2 * strokeRadius + gap`), and `evaluateWaveAmplitudeEnvelope` (`progress-motion.util.ts`) ramps amplitude cleanly on `[0, 0.10]` and `[0.95, 1.0]`.
    * **Indeterminate & Reduced Motion**: Uses M3 dual-pulse cubic-bezier grow/shrink kinematics (`1.8s` cycle) via `evalCubicBezier` in `progress-motion.util.ts` with disjoint prefix/middle/suffix `4dp` tracks; freezes cleanly at `0.55` under `prefers-reduced-motion: reduce`, while flat indeterminate preserves a visible static bar (`left: 20%; right: 45%`).
* **Circular Progress (`m3-circular-progress`)**:
  * **Flexible `24dp–240dp` Scaling**: Presets `sm` (`24px`, viewBox `strokeWidth = 5.2` -> `~2.6px` rendered, keep `[wavy]="false"`), `md` (`40px` flat canonical -> `48px` wavy, `amplitude: 1.6dp`, `lobes: 9`), `lg` (`56px`, `amplitude: 1.9`, `lobes: 10`), or custom `[diameter]` clamped `18..240dp`. When custom `[wavelength]` is passed, `computeCircularWaveQuantization` computes $N = \max(1, \text{round}(2\pi R_0 / \lambda_{\text{circ}}))$ ($\lambda_{\text{circ}} = \max(8, 0.375 \cdot \lambda) = 15\text{dp}$ at $\lambda = 40\text{dp}$) for seamless $C^1$ wraparound. Supports `[amplitude]`, `[speed]`, `[paused]`, `[blueprint]`. Indeterminate wavy expands/contracts (`28deg <-> 298deg` over `1.4s`) with `C^0` continuous spin, and flat indeterminate synchronizes `m3CircularDash` (`-113.1px`) + `m3CircularTrackDash` (`4dp` disjoint gap) seamlessly in CSS.
  * **Button Loading Integration**: Accepts `color="inherit"` (`currentColor`) + `[showTrack]="false"` inside `<m3-button [loading]="true">` for `>= 3:1` accessible button-inline spinners without Material icon font rotation.
  * **Cap-Compensated `4dp` Gap**: Round stroke caps protrude `strokeWidth / 2` on each tip, so both flat `trackDashArray`/`trackDashOffset` and wavy `gapAngle` reserve `effectiveGap = gapLength + strokeWidth` (plus `shouldRenderTrack()` hides degenerate `0px` tracks when remaining arc drops below `2 * effectiveGap`). At `0%` determinate, active indicator hides to prevent orphan caps.
  * **Wavy Variant (`[wavy]="true"`) & `four-color`**: Reserved for indeterminate mode (`[value]="null"`), cycling vivid `primary -> secondary -> tertiary -> color-mix(in oklch, primary 52%, tertiary)` tokens instead of dark ink.
* **Shape-Morphing Loading Indicator (`m3-loading-indicator`)**:
  * Dedicated to short indeterminate waits (`200ms – 5s`), pull-to-refresh gestures, and busy surfaces. Default `md` container is `48dp` with a `38dp` active polygon (`38/48` optical ratio) and semantic `role="progressbar"` with contextual action+object `aria-label`.
  * Supports numeric `[diameter]` clamped `24–240dp` (`effectiveDiameterDp` / `effectiveShapeDp` keeping the exact `38/48` optical ratio across bare and `[contained]` modes), determinate `[progress]` in `[0, 1]` (morphing `Circle +18deg -> SoftBurst` with `aria-valuenow/min/max` for pull-to-refresh drag gestures), and `[paused]` to freeze spring motion cleanly without resetting pose.
  * Outside-NgZone spring RAF spline morphing (`dampingRatio = 0.6`, `stiffness = 200`, `650ms` intervals paired with `+90deg` spring quarter-turns and `4666ms` baseline rotation) across all 7 canonical M3 shapes: `SoftBurst -> Cookie9 -> Pentagon -> Pill -> Sunny -> Cookie4 -> Oval` (`M3_SOFT_BURST_PATH`, `M3_COOKIE9_PATH`, `M3_PENTAGON_PATH`, `M3_PILL_PATH`, `M3_SUNNY_PATH`, `M3_COOKIE4_PATH`, `M3_OVAL_PATH`; plus `M3_CIRCLE_PATH`).
  * **Uniform $N = 180$ Cubic Bézier Segment Rule**: Every SVG path uses `M3_LOADING_SEGMENT_COUNT = 180` closed Catmull-Rom `C` segments centered at `(24, 24)` (`viewBox="0 0 48 48"`), avoiding Chromium SMIL `keySplines > 1` rejections. Cancels RAF and freezes on `Pentagon` when `prefers-reduced-motion: reduce` is active (determinate `[progress]` retains gesture shape without spin).
  * Supports `[contained]="true"` (`primary-container` with `on-primary-container` fill, scaling with `sm`/`md`/`lg` or `[diameter]`) and floating pill extension `[elevated]="true"` (`surface-container-high` wrapping any diameter via auto padding).
* **Skeleton / Shimmer (`.m3-skeleton`, `.m3-skeleton-shimmer`)**:
  * Zero-layout-shift placeholders with OKLCH reflective wave gradient.

### Standard Angular Consumption

```html
<!-- Indeterminate wavy linear progress -->
<m3-linear-progress [wavy]="true" />

<!-- Determinate wavy linear progress with buffer and live wave flow -->
<m3-linear-progress [wavy]="true" [value]="progressPercent" [buffer]="bufferPercent" size="lg" color="primary" />

<!-- Wavy circular progress with disjoint smooth track -->
<m3-circular-progress [wavy]="true" size="md" [value]="uploadPercent" />

<!-- Shape-morphing loading indicator (Contained Pull-to-refresh + Custom Diameter) -->
<m3-loading-indicator [diameter]="48" [progress]="pullProgressOrNull" [contained]="true" color="primary" ariaLabel="Actualizando contenido..." />
```

---

## 10. Floating Action Buttons (FAB) & Extended Actions

The primary high-emphasis action on a screen:
* **Standard FAB**: 56×56dp container, `rounded-2xl` (16dp), elevation level 3 $\to$ 4 on hover.
* **Small FAB**: 40×40dp container, `rounded-xl` (12dp), elevation level 2 $\to$ 3.
* **Large FAB**: 96×96dp container, `rounded-3xl` (28dp), prominent icon (36dp).
* **Extended FAB**: 56dp height, auto width, icon + text label, `rounded-2xl` (16dp). Shrinks into standard circular/squircle FAB on scroll down and expands on scroll up.
* **Surface Pairing**: Standard is `primary-container` with `on-primary-container`. High-contrast variant uses `tertiary-container` or `primary`.

```html
<!-- Extended FAB with fluid collapse on scroll -->
<button class="m3-fab-extended">
  <span class="material-symbols-rounded">add</span>
  <span>Nueva Operación</span>
</button>
```

---

## 11. Selection Controls & Inputs: Switches, Sliders, Checkboxes

### Switches

- Track: 52×32dp pill (`rounded-full`), `surface-container-highest` when off, `primary` when on.
* Thumb: 16×16dp when unselected, morphs to 24×24dp when selected, with optional iconography (check / close).
* Physics: Non-linear spring transition `cubic-bezier(0.34, 1.4, 0.64, 1)` on toggle.

### Sliders (Continuous & Discrete)

- Active Track & Inactive Track separated by M3 Expressive disjoint gap.
* Value Indicator: Tear-drop or rounded pill popup bubble hovering above the thumb during drag.
* Centered / Bi-directional Slider: Origin starts at 0 or center, expanding outward in either direction.

### Checkboxes & Radio Buttons

- 40×40dp minimum target hitbox with 18×18dp active graphic.
* Checkbox morphs with SVG stroke draw animation on checked state.
* Radio uses inner circular scale pop with spring physics.

---

## 12. Containment & Overlays: Dialogs, Sheets & Scrims

### Basic & Confirmation Dialogs

- **Surface**: `surface-container-high`, `rounded-3xl` (28dp padding & corners).
* **Backdrop**: Must use `backdrop-filter: blur(8px)` with `oklch(0% 0 0 / 0.65)` scrim.
* **Never** let ancestor containers apply `filter: blur(...)` to avoid rasterizing the dialog surface (Stacking Context Trap).
* **Action Buttons**: Aligned to bottom-right; `text` for cancel, `filled` for primary commit.

### Bottom Sheets & Side Sheets

- **Bottom Sheet**: Compact & Medium viewports (< 840dp). Drag handle at top (32×4dp pill), rounded top corners (28dp), dismissible via swipe down.
* **Side Sheet**: Expanded viewports (≥ 840dp). Fixed width (360dp – 400dp), docked to trailing edge with `surface-container-low` background.

---

## 13. Canonical Navigation Suite

Material 3 Expressive dynamically switches navigation patterns based on Window Size Classes:

1. **Compact (< 600dp)**: **Bottom Navigation Bar**
   * 80dp height pinned to viewport bottom.
   * 3 to 5 destinations.
   * Active destination receives an active indicator pill (32×64dp, `primary-container` fill).
2. **Medium (600dp – 839dp)**: **Navigation Rail (Collapsed)**
   * 80dp fixed vertical rail on leading edge.
   * Centered destinations with top FAB anchor.
3. **Expanded (≥ 840dp)**: **Navigation Rail (Expanded) or Modal Drawer**
   * 256dp – 280dp expanded sidebar with labels, badges, and group headers.
4. **Tabs**:
   * **Primary Tabs**: Integrated with top app bars; active indicator is an animated bottom underline with rounded caps.
   * **Secondary Tabs**: Segmented container pills for sub-filtering within a card or panel.

---

## 14. Canonical Master Scales & Token Laws Reference

### Fonts, Applying Type & 30-Style Dual Typography (`_token.css`, `_typography.css`)

* **Reference Typefaces**: `--md-ref-typeface-brand` & `--md-ref-typeface-plain` map to `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` (kept as two independent tokens so Plain UI text can swap without altering components); `--md-ref-typeface-mono` maps to `ui-monospace, 'Cascadia Code', 'Fira Code', monospace` with `tabular-nums`.
* **Applying Type Rules**: Size in `rem` to respect OS/browser zoom; apply `text-wrap: balance` on Display/Headline; apply `text-wrap: pretty` and `40ch–75ch` (max `80ch`) line measure on Body.
* **Dual Typescales (`.text-*` Baseline / `.text-*-emphasized` Expressive)**:

| Role | Level | Size (`px` / `rem`) | Line Height | Tracking | Weight (Base / Emph) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | L / M / S | 57 / 45 / 36px (`3.5625 / 2.8125 / 2.25rem`) | 64 / 52 / 44px | -0.25 / 0 / 0 | `400 / 800`, `400 / 800`, `400 / 700` |
| **Headline** | L / M / S | 32 / 28 / 24px (`2 / 1.75 / 1.5rem`) | 40 / 36 / 32px | 0 / 0 / 0 | `400 / 700`, `400 / 700`, `400 / 600` |
| **Title** | L / M / S | 22 / 16 / 14px (`1.375 / 1 / 0.875rem`) | 28 / 24 / 20px | 0 / +0.15 / +0.1 | `400 / 700`, `500 / 700`, `500 / 700` |
| **Body** | L / M / S | 16 / 14 / 12px (`1 / 0.875 / 0.75rem`) | 24 / 20 / 16px | +0.5 / +0.25 / +0.4 | `400 / 500` |
| **Label** | L / M / S | 14 / 12 / 11px (`0.875 / 0.75 / 0.6875rem`) | 20 / 16 / 16px | +0.1 / +0.5 / +0.5 | `500 / 700` |

### 10-Step Shape Corner Scale & Overview Principles (`_shape.css`)

* `none`: `0px` | `extra-small`: `4px` | `small`: `8px` | `medium`: `12px` | `large`: `16px`
* `large-increased`: **`20px` (M3E)** | `extra-large`: `28px` | `extra-large-increased`: **`32px` (M3E)** | `extra-extra-large`: **`48px` (M3E)** | `full`: `9999px` (static pills/circles ONLY — never for animated CSS `border-radius` morphing)
* **3 Shape Principles**: (1) **Attention Hierarchy** (pills stand out inside organic cards without thick borders), (2) **Optical Concentricity** ($R_{\text{outer}} \approx R_{\text{inner}} + \text{padding}$), (3) **Geometry as Visual Haptics** (Bounded `h/2` Corner Morphing on Web/Desktop + $N=180$ Polygon Spline Morphing on `<m3-loading-indicator>`).

### Elevation (`0dp → 12dp`), Applying Elevation & State Layers (`_elevation.css`, `_interaction.css`)

Shadows compute dynamically via `color-mix(in oklch, var(--md-sys-color-shadow) ..., transparent)` paired with tonal surface containers:

* **Level 0 (`0dp`)**: `none` $\to$ `surface` / `surface-container-highest` (Tonal containment before shadows)
* **Level 1 (`1dp`)**: `28% ambient + 16% key` $\to$ `surface-container-low` (Elevated cards/buttons at rest)
* **Level 2 (`3dp`)**: `36% ambient + 20% key` $\to$ `surface-container` (Elevated hover, menus, on-scroll App Bar)
* **Level 3 (`6dp`)**: `44% ambient + 28% key` $\to$ `surface-container-high` (FAB at rest, Modal Dialogs with Scrim)
* **Level 4 (`8dp`)**: `52% ambient + 36% key` $\to$ `surface-container-high` (FAB hover, dragged cards — `+1`/drag delta)
* **Level 5 (`12dp`)**: `60% ambient + 44% key` $\to$ `surface-container-highest` (Expanded Hero surfaces)

* **Applying Elevation**: Prefer `0dp` tonal surface separation for static Bento cards; elevate to `Level 2` (`3dp`) on scroll/overlap; signal hover/drag with a `+1` level lift.
* **Interaction State Layers (`--md-sys-state-*`)**: `hover-state-layer-opacity`: `0.08` (`8%`), `focus`: `0.10` (`10%`), `pressed`: `0.12` (`12%`), `dragged`: `0.16` (`16%`), `disabled-content`: `0.38` (`38%`), `disabled-container`: `0.12` (`12%`).
* **Hover Ink Rule (`currentColor`)**: Filled/Tonal controls tint with `on-*`; Outlined/Text buttons tint with `primary`; interactive Cards MUST use **neutral `on-surface`** (`8%`) so nested semantic badges preserve their true color.
