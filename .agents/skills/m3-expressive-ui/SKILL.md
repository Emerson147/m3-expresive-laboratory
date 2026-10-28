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
3. **Fluid Shape Morphing**: Elements dynamically transition between sharp and squircle radii (`rounded-full` $\leftrightarrow$ `rounded-2xl` $\leftrightarrow$ `rounded-md`) based on active state.
4. **Bento Grid Hierarchy**: Asymmetric modular cards prioritizing content density and focal points over uniform repetition.
5. **Depth via Stage Recess**: Modal dialogs do not simply cover content with a dark scrim; the entire underlying stage scales down and blurs into a recess layer.

---

## 2. Color Tokens & OKLCH Dynamic Theming

### Why OKLCH?

Standard HSL and RGB suffer from perceptual non-uniformity: Hue 60° (Yellow) appears much brighter than Hue 240° (Blue) at identical lightness percentages. OKLCH guarantees constant perceived luminance:

$$\text{oklch}(\text{Lightness} \quad \text{Chroma} \quad \text{Hue})$$

### Surface and Tone Palette Mapping

```css
:root {
  --seed-hue: 250; /* Dynamic user seed in degrees (0 - 360) */

  /* Light Theme Surfaces & Tones */
  --md-sys-color-primary: oklch(52% 0.22 var(--seed-hue));
  --md-sys-color-on-primary: oklch(99% 0.02 var(--seed-hue));
  --md-sys-color-primary-container: oklch(92% 0.08 var(--seed-hue));
  --md-sys-color-on-primary-container: oklch(25% 0.16 var(--seed-hue));

  --md-sys-color-surface: oklch(98% 0.01 var(--seed-hue));
  --md-sys-color-surface-dim: oklch(93% 0.02 var(--seed-hue));
  --md-sys-color-surface-container: oklch(95% 0.02 var(--seed-hue));
  --md-sys-color-surface-container-high: oklch(91% 0.03 var(--seed-hue));
}

.dark {
  /* Dark Theme Surfaces & Tones (Inverted luminance with dialed-down chroma) */
  --md-sys-color-primary: oklch(78% 0.14 var(--seed-hue));
  --md-sys-color-on-primary: oklch(18% 0.08 var(--seed-hue));
  --md-sys-color-primary-container: oklch(34% 0.12 var(--seed-hue));
  --md-sys-color-on-primary-container: oklch(92% 0.04 var(--seed-hue));

  --md-sys-color-surface: oklch(13% 0.02 var(--seed-hue));
  --md-sys-color-surface-dim: oklch(9% 0.02 var(--seed-hue));
  --md-sys-color-surface-container: oklch(19% 0.025 var(--seed-hue));
  --md-sys-color-surface-container-high: oklch(24% 0.03 var(--seed-hue));
}
```

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

Never use raw `:hover { opacity }` or `:hover { background }`. In M3, state layers project an overlay of `currentColor` without altering the base background color:
* **Hover**: 8% opacity (`var(--md-sys-state-hover-opacity)`)
* **Focus**: 10% opacity (`var(--md-sys-state-focus-opacity)`) + dual focus ring
* **Pressed**: 12% opacity (`var(--md-sys-state-pressed-opacity)`) + spring scaling (`scale(0.975)`)
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
* [ ] **Shape Morphing**: Use Tailwind shape transitions (`transition-all duration-300 rounded-full hover:rounded-m3-md`).
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

- `filter`: Selection with `check` icon and organic shape morphing from `full` to `medium` (12px squircle).
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
  * Continuous GPU spline morphing between 4 canonical geometric states: Rounded Pentagon $\leftrightarrow$ Squircle $\leftrightarrow$ 4-Petal Clover $\leftrightarrow$ Circle.
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

## 14. Canonical Master Scales Reference

### Typography Scale (15 Roles)

| Role | Level | Size | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Large / Med / Small | 57 / 45 / 36px | 64 / 52 / 44px | -0.25 / 0 / 0 | Regular (400) |
| **Headline** | Large / Med / Small | 32 / 28 / 24px | 40 / 36 / 32px | 0 / 0 / 0 | Regular (400) |
| **Title** | Large / Med / Small | 22 / 16 / 14px | 28 / 24 / 20px | 0 / 0.15 / 0.1 | Medium / SemiBold |
| **Body** | Large / Med / Small | 16 / 14 / 12px | 24 / 20 / 16px | 0.5 / 0.25 / 0.4 | Regular (400) |
| **Label** | Large / Med / Small | 14 / 12 / 11px | 20 / 16 / 16px | 0.1 / 0.5 / 0.5 | Medium (500) |

### Shape Corner Scale

- `none`: 0dp
* `extra-small`: 4dp
* `small`: 8dp
* `medium`: 12dp
* `large`: 16dp
* `extra-large`: 28dp
* `full`: 9999px (Pill / Circle)

### Elevation & Surface Tone Levels

- **Level 0**: 0dp shadow $\to$ `surface`
* **Level 1**: 1dp shadow + 5% primary tint $\to$ `surface-container-low`
* **Level 2**: 3dp shadow + 8% primary tint $\to$ `surface-container`
* **Level 3**: 6dp shadow + 11% primary tint $\to$ `surface-container-high`
* **Level 4**: 8dp shadow + 12% primary tint $\to$ `surface-container-highest`
* **Level 5**: 12dp shadow + 14% primary tint $\to$ `surface-bright`
