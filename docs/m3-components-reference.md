# Material 3 (M3) Expressive — Components Architecture: Buttons Reference

## 1. Architectural Philosophy: The 80/20 Rule

Material 3 defines more than 18 distinct component specifications. Attempting to implement all 18 before shipping produces high cognitive load, redundant code, and maintenance friction.

In enterprise architecture, the **Pareto Principle (80/20 rule)** applies: **4 core components satisfy ~80% of application interfaces**:
1. **Buttons**: User action, transactional triggers, navigation intents.
2. **Cards**: Bento grid containers, content hierarchy, elevation surfaces.
3. **Chips**: Dynamic filters, choice tags, contextual metadata.
4. **Text Fields / Inputs**: Data collection, validation feedback.

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
  readonly size = input<M3ButtonSize>('md');          // 'sm' (32px) | 'md' (40px) | 'lg' (48px)
  readonly icon = input<string | null>(null);         // Material Symbol name
  readonly iconTrailing = input<boolean>(false);
  readonly iconOnly = input<boolean>(false);
  readonly morph = input<boolean>(false);             // Expressive squircle morph on hover
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);           // Retains container dimensions with spin loader
  readonly ariaLabel = input<string | null>(null);
  
  readonly action = output<MouseEvent>();
}
```

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

| Variant | Container Surface | Elevation (Rest $\to$ Hover) | Border | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Elevated** | `surface-container-low` | Level 1 $\to$ Level 2 | None | Primary focal surfaces, dashboard summaries, cards requiring separation from flat backgrounds. |
| **Filled** | `surface-container-highest` | 0dp (Level 1 on hover) | None | High-density lists (e.g. task items, table rows), subtle tonal grouping. |
| **Outlined** | `surface` | 0dp (Level 1 on hover) | `1px solid outline-variant` | Clean structural grouping, settings sections, cards requiring explicit boundaries. |

### Angular `<m3-card>` Component API

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'm3-card',
  standalone: true
})
export class M3CardComponent {
  readonly variant = input<M3CardVariant>('elevated'); // 'elevated' | 'filled' | 'outlined'
  readonly interactive = input<boolean>(false);         // Adds state layer, focus ring, tabindex="0", and role="button"
  readonly padding = input<M3CardPadding>('md');        // 'none' | 'sm' (16px) | 'md' (20px) | 'lg' (24px) | 'xl' (32px)
  readonly shape = input<M3CardShape>('xl');            // 'md' (12px) | 'lg' (16px) | 'xl' (28px squircle)
  readonly customClass = input<string>('');
  
  readonly action = output<MouseEvent | KeyboardEvent>();
}
```

### Usage in Enterprise Task Lists
```html
<m3-card 
  variant="filled" 
  [interactive]="true" 
  padding="md"
  (action)="openTask(task)"
  customClass="flex items-center justify-between border border-outline-sub">
  
  <div>{{ task.title }}</div>
  <m3-button variant="outlined" size="sm" icon="edit" (action)="editTask(task)">Editar</m3-button>
</m3-card>
```

---

## 7. Material 3 Chips Architecture

### The 4 Canonical Chip Types

| Type | Interactive Purpose | Selected State Behavior | Leading Icon |
| :--- | :--- | :--- | :--- |
| **Filter** | Toggling view filters & search facets. | Fills with `secondary-container`, text `on-secondary-container`, **morphs corners from full to medium (12px)**. | Shows dynamic `check` icon when active. |
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
  readonly selected = input<boolean>(false);       // Active state (adds checkmark + morphs corners on filter)
  readonly icon = input<string | null>(null);      // Leading icon
  readonly removable = input<boolean>(false);      // Trailing remove button for input chips
  readonly count = input<number | string | null>(null); // Counter badge (e.g. 5)
  readonly disabled = input<boolean>(false);
  
  readonly action = output<MouseEvent>();
  readonly remove = output<Event>();
}
```

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

### The 2 Canonical Variants

| Variant | Visual Surface | Indicator / Border | Resting Height | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Filled** | `var(--md-sys-color-surface-container-highest)` | 1px bottom border $\to$ 2px `primary` active indicator line on focus | 56dp | High-emphasis forms, modal dialogs, search inputs with visual anchor. |
| **Outlined** | `transparent` | 1px `outline` $\to$ 2px `primary` boundary ring on focus | 56dp | Dense forms, secondary inputs, cards or surfaces with existing backgrounds. |

### Anatomy & Decoupled Layers

```
┌────────────────────────────────────────────────────────┐
│  M3 Text Field Container                               │
│  ┌──────────┐ ┌───────────────────────────┐ ┌────────┐ │
│  │ Leading  │ │ Floating Label (motion)   │ │Trailing│ │
│  │ Icon     │ │ Input / Textarea          │ │Slot    │ │
│  └──────────┘ └───────────────────────────┘ └────────┘ │
│  ════════════════════════════════════════════════════  │  <- Active Indicator (Filled)
└────────────────────────────────────────────────────────┘
   Supporting Text (Helper / Error)           Counter (24/80)
```

1. **Floating Label**: Smoothly transitions from resting (`0.875rem`, 14px, 70% opacity) to top micro position (`0.6875rem`, 11px, 600 weight, 0.35px tracking) using `var(--md-sys-motion-easing-emphasized)` when focused or populated.
2. **Compact SaaS Input Scale**: Input text rendered at clean `0.875rem` (14px) with subtle `0.45` placeholder opacity and balanced vertical padding (`20px 16px 6px 16px`).
3. **Active Indicator / Border**: Expands dynamically on focus with primary color without causing layout shift.
3. **Leading / Trailing Icons**: Material Symbols for contextual intent (`person`, `mail`, `lock`, `visibility`, `cancel`).
4. **Validation & Error State**: Seamlessly sets `is-error`, paints label/border/indicator in `var(--md-sys-color-error)` and reveals trailing error icon.
5. **Two-Way Binding & Reactive Forms**: Fully implements Angular `ControlValueAccessor` while exposing modern signal model `[(value)]`.

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
  readonly icon = input<string | null>(null);             // Leading icon
  readonly trailingIcon = input<string | null>(null);     // Trailing icon
  readonly clearable = input<boolean>(false);             // One-tap clear button
  readonly supportingText = input<string | null>(null);   // Helper message
  readonly errorText = input<string | null>(null);        // Validation error
  readonly isError = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly multiline = input<boolean>(false);            // Multi-line textarea mode
  readonly rows = input<number>(3);
  readonly maxlength = input<number | null>(null);        // Character counter

  readonly value = model<string>('');                     // Two-way signal binding
  readonly clear = output<void>();
}
```

### Usage Examples

#### 1. Filled Input with Clear Button
```html
<m3-text-field 
  variant="filled"
  label="Nombre completo"
  placeholder="Ej. Alex Johnson"
  icon="person"
  [clearable]="true"
  [(value)]="userName"
  supportingText="Introduce nombre y apellido" />
```

#### 2. Outlined Input with Character Counter
```html
<m3-text-field 
  variant="outlined"
  label="Correo electrónico"
  type="email"
  icon="mail"
  [maxlength]="50"
  [(value)]="userEmail"
  supportingText="Correo corporativo" />
```

#### 3. Multiline Textarea
```html
<m3-text-field 
  variant="outlined"
  label="Descripción del requerimiento"
  icon="description"
  [multiline]="true"
  [rows]="4"
  [maxlength]="250"
  [(value)]="taskNotes"
  supportingText="Especificaciones técnicas y criterios de aceptación" />
```
