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
3. **Fluid Shape Morphing**: Elements dynamically transition between bounded pill (`h/2`) and squircle radii on interactive controls, and uniform $N=40$ SVG spline polygons on `<m3-loading-indicator>`.
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
   * For Gemini-style ambient blurred aurora backgrounds (`.m3-aurora-glow`), render circular `closest-side` multi-stop OKLCH radial clouds (`.m3-aurora-orb-1..3`) inside `<div class="m3-aurora-layer" aria-hidden="true">` — **never** on `::before`/`::after` of `.card-interactive`/`.state-layer` hosts (which reserve `::before` for `currentColor` overlays). Animate **only** compositor `transform` + `opacity`, pause on `html.vt-running`, provide `.is-aurora-paused`, and set `animation: none` under `prefers-reduced-motion`.

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
* **Touch Target**: 48×48dp minimum accessible hitbox via `.touch-target-48`.

### Window Size Classes

Material 3 breaks viewports into 3 canonical buckets:
* **Compact (< 600dp)**: Mobile phones $\to$ Bottom Navigation Bar / Floating Dock.
* **Medium (600dp – 839dp)**: Tablets & foldables $\to$ Navigation Rail.
* **Expanded (≥ 840dp)**: Desktop $\to$ Expanded Rail or Drawer + 12-column Bento Grid.

---

## 7. Component Checklist for Extensibility

When porting or creating new M3 Expressive components:
* [ ] **State Separation**: Business logic and metrics belong in `@Injectable({ providedIn: 'root' })` services (`ThemeService`, `TaskService`, `AdaptiveLayoutService`), never in template logic.
* [ ] **CSS Box Isolation**: Use `host: { class: 'contents' }` or `host: { class: 'block col-span-12' }` on custom components to prevent CSS grid/flex layout clipping.
* [ ] **State Layers**: Interactive elements must include `.state-layer` and `.focus-ring-m3`.
* [ ] **Bounded Pill Shape Morphing**: Animate corner morphs using bounded half-height (`h/2`) component tokens (`24px/20px ↔ 12px/10px` via `--md-comp-button-shape-pill`, `16px ↔ 8px` via `--md-comp-chip-shape-pill`) + `--md-sys-motion-spring-expressive-fast-spatial`. **Anti-pattern**: never animate `border-radius` from `9999px` (`rounded-full`)—CSS interpolates numerically from `9999` down to `h/2` before corners start moving (~1s dead-zone).
* [ ] **Dynamic View Transitions**: Always control `view-transition-name` with an `activeTransition` signal state.

---

## 8. Canonical Component Implementations: Buttons

### The 80/20 Rule for Components

4 core components solve 80% of application interfaces: Buttons, Cards, Chips, and Text Fields.

### Button Variants & Hierarchy

- `filled`: High emphasis. Only one per flow/dialog for final commit ("Save", "Create").
* `tonal`: Medium-high emphasis. Secondary priority companion without competing ("Edit").
* `elevated`: Medium emphasis with elevation level 1 $\to$ 2. Used over complex or patterned backgrounds.
* `outlined`: Medium emphasis. Neutral structured secondary action ("Filter", "Options").
* `text`: Low emphasis. Minimal visual footprint ("Cancel", "Dismiss").

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

- `elevated`: `surface-container-low` with level 1 $\to$ 2 elevation. Main focal surfaces.
* `filled`: `surface-container-highest` with flat tonal contrast. List rows and cards.
* `outlined`: `surface` with 1px `outline-variant` boundary. Structured neutral grouping.

```html
<m3-card 
  variant="filled" 
  [interactive]="true" 
  (action)="openTask(task)"
  customClass="flex items-center justify-between border border-outline-sub">
  ...
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

- `filled`: High emphasis. `surface-container-low` with subtle outline-variant border and soft OKLCH focus glow.
* `outlined`: Medium emphasis. Transparent background with 1.5px outline-variant border and soft OKLCH focus glow.
* **Modern Typography Scale**: Compact `0.875rem` (14px) input text with `0.45` placeholder opacity and `0.6875rem` (11px) micro-floating label (600 weight, 0.35px tracking).
* **Support & Validation**: Supporting helper text, dynamic character counter (`maxlength`), and error tokens (`var(--md-sys-color-error)`).

```html
<!-- Filled input with clearable action -->
<m3-text-field 
  variant="filled" 
  label="Título de la tarea" 
  icon="edit_note" 
  [clearable]="true" 
  [(value)]="taskTitle" 
  supportingText="Define el objetivo" />

<!-- Outlined multiline textarea with character counter -->
<m3-text-field 
  variant="outlined" 
  label="Notas técnicas" 
  icon="description" 
  [multiline]="true" 
  [rows]="3" 
  [maxlength]="250" 
  [(value)]="taskNotes" 
  supportingText="Criterios y arquitectura" />
```

---

## 9. Canonical Component Implementations: Progress Indicators & Loading

### M3 Expressive Anatomy & Wave Physics (Image 4 & 5 Specifications)

- **Linear Progress (`m3-linear-progress`)**:
  * **Disjoint Track Anatomy**: The track **never** passes underneath the active wave. The active wave indicator ends with a rounded cap, followed by a canonical **4dp gap**, followed by the inactive straight track. The inactive track extends all the way to the end of the container (`x2 = w - r`), and the **stop dot** sits **embedded directly inside the terminal cap** of the track line (`cx = w - r`, radius matching stroke radius), providing a solid colored terminus without a detached gap.
  * **Wavy Variant (`[wavy]="true"`)**:
    * **Wavelength**: Exactly **40dp** between adjacent wave peaks.
    * **Amplitude**: Exactly **3dp** from resting baseline to crest.
    * **Container Height**: **10dp** for standard (4dp stroke) and **14dp** for prominent (8dp stroke), preventing wave clipping.
    * **Living Wave Motion**: Driven by continuous traveling wave physics $y(x, t) = y_{center} + A(p) \cdot \sin(2\pi x / 40 - \phi)$. As the phase $\phi$ glides, both the **head** ($x = x_{active}$) and the **tail** ($x = 0$) bob up and down with smooth `stroke-linecap: round` caps.
    * **Boundary Attenuation**: Amplitude flattens smoothly to 0 at extreme edges ($p \le 0.05$ or $p \ge 0.98$) per the M3 `indicatorAmplitude` specification.
    * **Indeterminate**: A traveling wave slug (~35% width) glides across the bar, with inactive track dynamically drawn on uncompleted areas with 4dp gaps.
* **Circular Progress (`m3-circular-progress`)**:
  * Sizes: `sm` (24px), `md` (40px canonical standard), `lg` (56px expressive).
  * Dynamic stroke arc with non-linear spring deceleration and rounded caps (`stroke-linecap: round`).
  * **Wavy Variant (`[wavy]="true"`)**: Scalloped/fluted undulating circular wave perimeter. Inactive track is rendered as a **smooth circular arc** for the uncompleted portion, separated by a 4dp gap.
  * Flagship `four-color` cycle option.
* **Shape-Morphing Loading Indicator (`m3-loading-indicator`)**:
  * Distinct component from progress indicators; designed for pull-to-refresh and indeterminate page loading.
  * Continuous GPU spline morphing between 4 canonical geometric states: `M3_PENTAGON_PATH` (Rounded Pentagon) $\leftrightarrow$ `M3_SQUIRCLE_PATH` (Squircle) $\leftrightarrow$ `M3_COOKIE4_PATH` (4-Petal Clover) $\leftrightarrow$ `M3_CIRCLE_PATH` (Circle).
  * **Uniform $N = 40$ Cubic Bézier Segment Rule**: Every SVG path MUST be generated with `SEGMENT_COUNT = 40` ($\text{lcm}(4, 5, 8, 10)$) closed Catmull-Rom `C` segments centered at `(24, 24)` (`viewBox="0 0 48 48"`) so SMIL `<animate attributeName="d">` morphs symmetrically at 60fps without twisting.
  * Supports canonical 48x48dp container (`[contained]="true"`) in `primary-container` with `on-primary-container` fill, and elevated card mode (`[elevated]="true"`).
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

<!-- Shape-morphing loading indicator (Pull-to-refresh) -->
<m3-loading-indicator size="md" [contained]="true" color="primary" />
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
* **3 Shape Principles**: (1) **Attention Hierarchy** (pills stand out inside organic cards without thick borders), (2) **Optical Concentricity** ($R_{\text{outer}} \approx R_{\text{inner}} + \text{padding}$), (3) **Geometry as Visual Haptics** (Bounded `h/2` Corner Morphing on Web/Desktop + $N=40$ Polygon Spline Morphing on `<m3-loading-indicator>`).

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
