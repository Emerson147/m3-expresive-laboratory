# Material 3 (M3) Expressive — Components Architecture Reference

## 1. Architectural Scope: The 6 Official M3 Pillars + Essential Web Extensions

All UI components in this system align with `m3.material.io/components` across **6 official interactive pillars** plus **2 essential Web platform primitives** (`Switch` and `Top-Layer Overlays`):

1. **All Buttons (`m3.material.io/components/all-buttons`)**: Common buttons (`filled`, `tonal`, `elevated`, `outlined`, `text`), 5-tier scale (`xs`..`xl`), expressive **Toggle** buttons (`aria-pressed`, pill $\leftrightarrow$ 12px square), **Button Groups** (Standard & Connected replacing deprecated Segmented Buttons), **Split Buttons**, and **FAB / Extended FAB**.
2. **Cards (`m3.material.io/components/cards/overview`)**: `elevated`, `filled`, and `outlined` containers with `keydown.space` scroll guard and `keyup.space` activation.
3. **Chips (`m3.material.io/components/chips/overview`)**: `filter` (`16px` $\leftrightarrow$ `8px` morph + `aria-pressed`), `assist`, `input` (sibling `<button>` remove action — zero nested interactive controls), and `suggestion`.
4. **Text Fields (`m3.material.io/components/text-fields/overview`)**: `filled` and `outlined` floating-label inputs with `ControlValueAccessor`, `autocomplete` autofill passthrough, `aria-describedby` error wiring, and High Contrast `forced-colors` outlines on `<select>`.
5. **Loading Indicator (`m3.material.io/components/loading-indicator/overview`)**: Short-wait indeterminate spring-physics polygon morphing (`200ms – 5s`, `role="progressbar"`), default & contained pill variants.
6. **Progress Indicators (`m3.material.io/components/progress-indicators/overview`)**: Sustained processes (`> 5s`) with linear/circular flat or sinusoidal **Wavy** tracks, disjoint 4dp gap, and terminal 4dp stop dot.
7. **Switch & Top-Layer Popover Overlays (Web Extensions)**: Semantic `<m3-switch>` (`role="switch"`, `48dp` target, morphing thumb) + Top-Layer `<m3-snackbar popover="manual">` and `<m3-split-button>` `[popover="auto"]` menu with `@starting-style` and `transition-behavior: allow-discrete`.

---

## 2. Button Anatomical Hierarchy

In M3 Expressive, a button is never a single styled `<button>` tag. It is an orchestration of **4 decoupled layers**:

```
┌────────────────────────────────────────────────────────┐
│  4. Hitbox & Focus Ring Layer (48x48dp, Dual-ring)     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  3. State Layer (::before currentColor 8%/10%/12%)│  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  2. Label & Icon (label-large, tracking)   │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │  1. Container (OKLCH, Tonal Surface) │  │  │  │
│  │  │  └──────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

1. **Container**: Color token depending on emphasis level (Filled, Tonal, Elevated, Outlined, Text).
2. **Label & Icon**: Typography token `label-large` (14px, medium weight, 0.1px tracking).
3. **State Layer**: Pseudo-element `::before` using `currentColor` without hue shifts.
4. **Touch Target & Focus Ring**: Minimum 48x48dp hitbox via `.touch-target-48` and WCAG AA dual ring via `.focus-ring-m3`.

---

## 3. The 5 Canonical Variants

| Variant | Emphasis | Container Color | Text / Icon Color | Elevation | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Filled** | High | `var(--md-sys-color-primary)` | `var(--md-sys-color-on-primary)` | 0dp (1dp hover) | Primary action in a flow ("Save", "Confirm", "Submit"). |
| **Tonal** | Medium-High | `var(--md-sys-color-secondary-container)` | `var(--md-sys-color-on-secondary-container)` | 0dp (1dp hover) | Secondary high-priority actions that must not compete with Filled. |
| **Elevated** | Medium (Depth) | `var(--md-sys-color-surface-container-low)` | `var(--md-sys-color-primary)` | 1dp (2dp hover) | When visual contrast against complex patterned or image backgrounds is needed. |
| **Outlined** | Medium | `transparent` (1px outline) | `var(--md-sys-color-primary)` | 0dp | Alternative paths, cancel/secondary dialog triggers. |
| **Text** | Low | `transparent` | `var(--md-sys-color-primary)` | 0dp | Dialog dismiss, card supplementary actions, minimal visual weight. |

---

## 4. Angular Standalone Component: `<m3-button>`

### Component API

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'm3-button',
  standalone: true,
  host: { class: 'contents' } // Zero layout side-effects on parents
})
export class M3ButtonComponent {
  readonly variant = input<M3ButtonVariant>('filled'); // 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text'
  readonly size = input<M3ButtonSize>('md');          // 'xs' (28px) | 'sm' (32px) | 'md' (40px) | 'lg' (48px) | 'xl' (56px)
  readonly toggle = input<boolean>(false);            // Exposes aria-pressed and morphs pill <-> 12px square
  readonly selected = model<boolean>(false);
  readonly icon = input<string | null>(null);         // Material Symbol name
  readonly iconTrailing = input<boolean>(false);
  readonly iconOnly = input<boolean>(false);
  readonly morph = input<boolean>(false);             // Expressive squircle morph on hover
  readonly disabled = input<boolean>(false);          // Independent 12% container / 38% ink opacity
  readonly loading = input<boolean>(false);           // Retains container dimensions with spin loader
  readonly ariaLabel = input<string | null>(null);
  
  readonly action = output<MouseEvent>();
}
```

#### Button Groups, Split Button & FAB
* **`<m3-button-group>`** (`src/app/shared/components/button/button-group.component.ts`): Supports `variant="connected"` (2px divider gap, active item morphs to `24px` pill; officially replaces M3 Segmented Buttons) and `variant="standard"` (8px gap), in `single` or `multi` selection modes.
* **`<m3-split-button>`** (`src/app/shared/components/button/button-group.component.ts`): Pairs a primary pill-left button with a chevron menu trigger (`aria-haspopup="menu"`, `aria-expanded`) that opens a `popover="auto"` top-layer menu with progressive fallback.
* **`<m3-fab>`** (`src/app/shared/components/button/fab.component.ts`): Standard (`sm` 40px, `md` 56px, `lg` 96px) and Extended (`[label]` set, 56px height) Floating Action Buttons with Level 3 $\to$ 4 elevation.

### Usage Examples

#### 1. Primary Action with Leading Icon
```html
<m3-button variant="filled" icon="add" (action)="createTask()">
  Nueva Tarea
</m3-button>
```

#### 2. Secondary Tonal Action with Shape Morphing
```html
<m3-button variant="tonal" icon="edit" [morph]="true" (action)="editTask()">
  Editar Tarea
</m3-button>
```

#### 3. Responsive Loading State (Without Layout Shift)
```html
<m3-button variant="filled" icon="send" [loading]="isSubmitting()">
  Guardar Cambios
</m3-button>
```

#### 4. Icon-Only Action (Touch Target 48dp)
```html
<m3-button 
  [iconOnly]="true" 
  variant="outlined" 
  icon="filter_list" 
  ariaLabel="Filtrar tareas" 
  (action)="toggleFilters()" />
```

---

## 5. Pure CSS Fallback

For micro-frontends or frameworks without Angular (e.g. Astro, Vanilla HTML, React):

```html
<button class="m3-btn m3-btn-filled state-layer focus-ring-m3 touch-target-48">
  <span class="material-symbols-rounded">add</span>
  <span>Guardar</span>
</button>
```

---

## 6. Material 3 Cards Architecture

### The 3 Canonical Card Variants

| Variant | Container Surface | Elevation (Rest $\to$ Hover) | Border | When & Why to Use |
| :--- | :--- | :--- | :--- | :--- |
| **Elevated** | `surface-container-low` | Level 1 $\to$ Level 2 | None | Visual separation from the canvas without a harsh border. Best for hero summaries, key widgets, or cards over patterned/busy backgrounds. |
| **Filled** | `surface-container-highest` | 0dp (Level 1 on hover) | None | Subtle tonal grouping without heavy drop shadows. Best for repeatable list items, settings tiles, and dense grid cards. |
| **Outlined** | `surface` | 0dp (Level 1 on hover) | `1px solid outline-variant` | Clean structural framing at visual parity with surrounding content. Best for forms, metadata panels, or secondary options. |

### Dynamic Theme Tokens vs. Semantic Color Overrides (`[tone]`)

* **Default cards do NOT need hardcoded color overrides**: All three variants read from semantic surface roles (`surface-container-low`, `surface-container-highest`, `surface`, `outline-variant`), which derive automatically from `--seed-hue` in both Light and Dark modes (`src/styles/_token.css`).
* **Semantic Emphasis (`[tone]`)**: When a card communicates system intent or status (feature highlight, confirmation, warning/error summary), pass `[tone]="'primary' | 'secondary' | 'tertiary' | 'error'"`. This swaps `--md-comp-*-card-container-color` (and `--md-comp-outlined-card-outline-color` / `color: var(--md-sys-color-on-*-container)`) in `src/styles/_card.css` so theme switching stays 100% harmonious.
* **Disabled State (`[disabled]`)**: Sets `aria-disabled="true"`, blocks click/keyboard activation, and applies `12%` container / `38%` `on-surface` ink opacity tokens.

### M3 Card Don'ts (Strict Rules)

1. **No nested interactive controls inside `[interactive]="true"` cards**: Since interactive cards expose `role="button"` + `tabindex="0"`, placing `<m3-button>` or links inside breaks HTML semantics and screen-reader navigation. Use `[interactive]="false"` whenever a card contains local action buttons.
2. **Don't mix random backgrounds/shadows inside one collection**: Keep sibling cards within the same grid consistent in variant and radius, escalating only the single hero/promo card when deliberate hierarchy is needed.
3. **Never clamp narrow grids with oversized padding**: Prefer scrollable rows or dedicated detail views over packing multi-column tables inside cramped cards.

### Angular `<m3-card>` Component API

```typescript
import { Component, input, output } from '@angular/core';

export type M3CardTone = 'default' | 'primary' | 'secondary' | 'tertiary' | 'error';

@Component({
  selector: 'm3-card',
  standalone: true
})
export class M3CardComponent {
  readonly variant = input<M3CardVariant>('elevated'); // 'elevated' | 'filled' | 'outlined'
  readonly interactive = input<boolean>(false);         // Adds state layer, focus ring, tabindex="0", and role="button"
  readonly disabled = input<boolean>(false);            // Sets aria-disabled="true" and suppresses click/key activation
  readonly tone = input<M3CardTone>('default');         // 'default' | 'primary' | 'secondary' | 'tertiary' | 'error'
  readonly padding = input<M3CardPadding>('md');        // 'none' | 'sm' (16px) | 'md' (20px) | 'lg' (24px) | 'xl' (32px)
  readonly shape = input<M3CardShape>('xl');            // 'md' (12px) | 'lg' (16px) | 'xl' (28px squircle)
  readonly customClass = input<string>('');
  
  readonly action = output<MouseEvent | KeyboardEvent>();
}
```

### Usage Patterns

#### 1. Pure Action Card (Entire Surface Clickable)
```html
<m3-card
  variant="elevated"
  tone="primary"
  [interactive]="true"
  padding="md"
  (action)="openSummary()">
  <div>Ver reporte mensual</div>
</m3-card>
```

#### 2. Container Card with Local Action Buttons (`[interactive]="false"`)
```html
<m3-card 
  variant="filled" 
  [interactive]="false" 
  padding="md"
  customClass="flex items-center justify-between">
  
  <div>{{ task.title }}</div>
  <m3-button variant="outlined" size="sm" icon="edit" (action)="editTask(task)">Editar</m3-button>
</m3-card>
```

---

## 7. Material 3 Chips Architecture

### The 4 Canonical Chip Types

| Type | Interactive Purpose | Selected State Behavior | Leading Icon |
| :--- | :--- | :--- | :--- |
| **Filter** | Toggling view filters & search facets. | Fills with `secondary-container`, text `on-secondary-container`, **morphs corners from bounded pill (`16px`) to `8px` squircle** (`_chip.css`). | Shows dynamic `check` icon when active. |
| **Assist** | Smart contextual actions (e.g. "Add to calendar", "Share"). | Stateless action trigger; remains outlined/transparent. | Material Symbol representing intent. |
| **Input** | User-created entities (tags, email recipients, criteria). | Represents an entity in the UI. | Optional leading icon; trailing `cancel` remove icon. |
| **Suggestion** | System or AI recommendations. | Discrete tonal background; triggers query or prompt. | Sparkle (`auto_awesome`) or topic icon. |

### Angular `<m3-chip>` Component API

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'm3-chip',
  standalone: true,
  host: { class: 'contents' }
})
export class M3ChipComponent {
  readonly type = input<M3ChipType>('filter');      // 'filter' | 'assist' | 'input' | 'suggestion'
  readonly selected = input<boolean>(false);       // Adds checkmark, aria-pressed on filter, morphs 16px -> 8px
  readonly icon = input<string | null>(null);      // Leading icon
  readonly removable = input<boolean>(false);      // Renders .m3-chip-composite with sibling remove <button>
  readonly removeLabel = input<string>('Quitar');
  readonly count = input<number | string | null>(null); // Counter badge (e.g. 5)
  readonly disabled = input<boolean>(false);
  
  readonly action = output<MouseEvent>();
  readonly remove = output<Event>();
}
```

> [!IMPORTANT]
> **WCAG & HTML Conformance**: When `removable()` is `true`, `<m3-chip>` switches into `.m3-chip-composite` holding two **sibling** `<button>` controls (`.m3-chip-primary` + `.m3-chip-remove`), preventing nested interactive elements while keeping `m3-chip button` queries valid. Disabled chips apply `38%` `on-surface` ink color independently of the `12%` background/border opacity.

### Usage Examples

#### 1. Filter Chips with Count Badge
```html
<m3-chip 
  type="filter" 
  [selected]="status() === 'pending'" 
  [count]="pendingCount()"
  (action)="setStatus('pending')">
  Pendientes
</m3-chip>
```

#### 2. Input Chips with Remove Action
```html
<m3-chip 
  type="input" 
  [removable]="true" 
  (remove)="removeTag(tag)">
  {{ tag }}
</m3-chip>
```

---

## 7. M3 Text Fields / Inputs Architecture (The 4th Pillar)

### The 2 Canonical Variants & UI Context Guidelines

| Variant | Visual Surface | Indicator / Border | Primary Context | Why M3 Recommends It |
| :--- | :--- | :--- | :--- | :--- |
| **Filled** | `var(--md-sys-color-surface-container-low)` | Subtle bottom indicator $\to$ `2px primary` active indicator on focus | **Dialogs (`<dialog>`), brief modals, quick search / POS inputs** | High visual prominence guides focus quickly across 1–3 brief fields inside elevated dialog surfaces. |
| **Outlined** | `transparent` | `1.5px outline-variant` $\to$ `2px primary` boundary ring on focus | **Long / multi-field forms, cards with filled backgrounds** | Lighter visual footprint prevents heavy "wall of boxes" fatigue when stacking 4+ form controls. |

### Anatomy & Modern Web Capabilities

```
┌──────────────────────────────────────────────────────────────────────┐
│  M3 Text Field Container                                             │
│  ┌──────────┐ ┌────────┐ ┌───────────────────────┐ ┌────────┐ ┌────┐ │
│  │ Leading  │ │ Prefix │ │ Floating Label        │ │ Suffix │ │Tail│ │
│  │ Icon     │ │ ("S/") │ │ Input / Textarea      │ │ ("PEN")│ │Slot│ │
│  └──────────┘ └────────┘ └───────────────────────┘ └────────┘ └────┘ │
│  ══════════════════════════════════════════════════════════════════  │  <- Active Indicator (Filled)
└──────────────────────────────────────────────────────────────────────┘
   Supporting Text / Validation Message                     Counter (24/80)
```

1. **Floating Label**: Smoothly transitions from resting (`0.875rem`, 14px, 70% opacity) to top micro position (`0.6875rem`, 11px, 600 weight, 0.35px tracking) using `var(--md-sys-motion-easing-emphasized)` when focused, populated, or paired with `[prefix]`.
2. **Inline Prefix & Suffix (`[prefix]`, `[suffix]`)**: Positioned cleanly on the control baseline and automatically wired into `aria-describedby` (`${id}-prefix`, `${id}-suffix`) so assistive technology announces currency or unit context.
3. **Accessible Password Reveal (`[passwordToggle]="true"`)**: Renders an opt-in `<button type="button">` with `aria-pressed` and dynamic `'Mostrar contraseña'` / `'Ocultar contraseña'` labels, without unexpectedly mutating trailing buttons on legacy inputs.
4. **Deferred Constraint Validation (`:user-invalid` / `:user-valid`)**: Supports native `[required]`, `[pattern]`, `[minlength]`, `[enterkeyhint]`, and `[showValidState]`, while holding error styling/ARIA sync until user interaction (`blur`, form submit / `invalid`) so empty initial forms never flash errors on load.
5. **Auto-Grow Multiline (`[autoGrow]="true"`)**: Enables CSS `field-sizing: content` with explicit `width: 100%` (preventing horizontal collapse), `min-block-size: 3lh`, `max-block-size: 10lh`, and `resize: none`.
6. **Disabled & Read-Only Separation (`[disabled]` vs `[readonly]`)**: `.is-disabled` applies independent `12%` surface/outline and `38%` `on-surface` ink tokens; `.is-readonly` keeps the field focusable/selectable (dashed low-contrast container) while preventing edits and clear-button deletion.
7. **Autofill & Expressive Micro-Motion**: Stable `[name]` + `:autofill` float guard keeps password managers working seamlessly; leading icons shift color cleanly per M3 specs without scaling, `@starting-style` animates trailing action buttons & helper/error rows, and invalid errors trigger a single `m3FieldErrorNudge` (all gated behind `@media (prefers-reduced-motion: reduce)`).

### Angular `<m3-text-field>` Component API

```typescript
import { Component, input, model, output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'm3-text-field',
  standalone: true
})
export class M3TextFieldComponent implements ControlValueAccessor {
  readonly variant = input<M3TextFieldVariant>('filled'); // 'filled' | 'outlined'
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly inputMode = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);     // Native browser autofill hint
  readonly name = input<string | null>(null);             // Stable form field name for autofill
  readonly icon = input<string | null>(null);             // Leading icon
  readonly prefix = input<string | null>(null);           // Inline prefix (e.g. 'S/', '@')
  readonly suffix = input<string | null>(null);           // Inline suffix (e.g. 'PEN', 'kg')
  readonly trailingIcon = input<string | null>(null);     // Trailing icon
  readonly clearable = input<boolean>(false);             // One-tap clear button
  readonly passwordToggle = input<boolean>(false);        // Accessible password reveal toggle
  readonly supportingText = input<string | null>(null);   // Helper message
  readonly errorText = input<string | null>(null);        // Validation error
  readonly isError = input<boolean>(false);
  readonly required = input<boolean>(false);              // Native constraint validation
  readonly pattern = input<string | null>(null);
  readonly minlength = input<number | null>(null);
  readonly enterkeyhint = input<string | null>(null);     // Virtual keyboard action hint
  readonly autoGrow = input<boolean>(false);              // CSS field-sizing: content multiline
  readonly showValidState = input<boolean>(false);        // Highlights :user-valid after interaction
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);              // Focusable & selectable non-editable field
  readonly multiline = input<boolean>(false);            // Multi-line textarea mode
  readonly rows = input<number>(3);
  readonly maxlength = input<number | null>(null);        // Character counter

  readonly value = model<string>('');                     // Two-way signal binding
  readonly clear = output<void>();
}
```

### Usage Examples

#### 1. Dialog / Quick Checkout (`filled` + Prefix & Suffix)
```html
<m3-text-field
  variant="filled"
  label="Monto a cobrar"
  type="number"
  inputMode="decimal"
  prefix="S/"
  suffix="PEN"
  enterkeyhint="done"
  [clearable]="true"
  [(value)]="amount"
  supportingText="Dialog context: Filled highlights the primary entry." />
```

#### 2. Long Registration Form (`outlined` + `:user-invalid` + `[passwordToggle]`)
```html
<m3-text-field 
  variant="outlined"
  label="Contraseña"
  type="password"
  autocomplete="new-password"
  icon="lock"
  [required]="true"
  [minlength]="8"
  [passwordToggle]="true"
  [showValidState]="true"
  [(value)]="password"
  supportingText="Mínimo 8 caracteres" />
```

#### 3. Auto-Growing Multiline Textarea (`field-sizing: content`)
```html
<m3-text-field 
  variant="outlined"
  label="Descripción del requerimiento"
  icon="description"
  [multiline]="true"
  [autoGrow]="true"
  [maxlength]="250"
  [(value)]="taskNotes"
  supportingText="Crece automáticamente entre 3 y 10 líneas" />
```

---

## 8. Loading Indicator vs. Progress Indicators (Timing & Wavy Spec)

| Latency Window | Component | Variant & Rules |
| :--- | :--- | :--- |
| **`< 200ms`** | None | Skip spinners to avoid flicker on instant local updates. |
| **`200ms – 5s`** | `<m3-loading-indicator>` | Spring-physics RAF morphing outside NgZone (`dampingRatio: 0.6, stiffness: 200`, `650ms`/step + `+90°` quarter-turns + `4666ms` baseline spin, `N = 180` Catmull-Rom segments across the 7 canonical M3 shapes: `SoftBurst -> Cookie9 -> Pentagon -> Pill -> Sunny -> Cookie4 -> Oval`). Supports `[diameter]` clamped `24–240dp` preserving the `38/48` optical shape ratio, `[progress]` (`0..1` determinate pull-to-refresh `Circle +18° -> SoftBurst` with `aria-valuenow/min/max`), and `[paused]`. Freezes cleanly to static `Pentagon` under `prefers-reduced-motion: reduce`. Use `[contained]="true"` (`primary-container` / `on-primary-container`) over imagery, or custom floating pill `[elevated]="true"` for pull-to-refresh. |
| **`> 5s`** | `<m3-linear-progress>` / `<m3-circular-progress>` | Determinate (`[value]`, optional `[buffer]`) or indeterminate dual-bar/dual-pulse over `secondary-container` track (mirrored automatically under `dir="rtl"`, `40dp` minimum width). Renders at least a circular dot at `1%` progress, a concentric `4dp` stop indicator (`circle.m3-linear-progress-stop` un-transformed in wavy SVGs; omit only at `>= 3:1` container contrast via `[showStop]="false"`), official wavy metrics (`40dp` wavelength & `3dp` amplitude across `4dp` / `10px` `md` and `8dp` / `14px` `lg`), and M3 `0.10 / 0.95` `A(p)` ramp attenuation. Circular supports `[diameter]` (`24–240dp`), defaults to `40dp` flat / `48dp` wavy (`md`, `1.6dp` amp, `15dp` circular wavelength quantized into integer `N` lobes), thickens `24px (sm)` flat for compact UI, and accepts `color="inherit"` (`currentColor`, trackless inside `<m3-button [loading]="true">`). Both expose optional `[amplitude]`, `[wavelength]`, `[speed]`, `[paused]`, and `[blueprint]` for live geometry tuning/inspection. `four-color` is reserved for indeterminate states; RAF runs only when `[wavy]="true"` and active (`!paused()`), with static fallbacks under `prefers-reduced-motion: reduce`. |

---

## 9. Web Selection & Top-Layer Overlays (`<m3-switch>` & `<m3-snackbar>`)

### `<m3-switch>` (`src/app/shared/components/switch/switch.component.ts`, `src/styles/_switch.css`)
* Renders `<button type="button" role="switch" [attr.aria-checked]="checked()">` with `.touch-target-48`, `.focus-ring-m3`, and `ControlValueAccessor` + `model<boolean>`.
* Track dimensions `52x32dp`; thumb morphs from `16x16dp` (or `24dp` with icons) to `24x24dp` selected and `28x28dp` while pressed.

### `<m3-snackbar>` & Menu Popovers (`src/app/shared/components/snackbar/snackbar.component.ts`, `src/styles/_overlays.css`)
* **Snackbar (`popover="manual"`)**: Never uses light-dismiss so toast notifications stay readable until dismissed (`durationMs` timer cleaned with `DestroyRef`, or explicit close control with `popovertargetaction="hide"`), paired with `role="status"` + `aria-live="polite"`.
* **Menu Popover (`popover="auto"`)**: Used by `<m3-split-button>` for native `Esc` / outside-click dismissal, syncing `aria-expanded` on toggle.
* **Top-Layer Transitions**: Animated with `transition-property: opacity, transform, display, overlay`, `transition-behavior: allow-discrete`, `@starting-style`, `[popover]:is(:popover-open, .\:popover-open)`, `@media (prefers-reduced-motion: reduce)`, and progressive `'popover' in HTMLElement.prototype` guards.

