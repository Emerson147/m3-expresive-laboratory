# Material 3 Expressive — 3D Matrix Inventory Atelier & Workbench

## 1. Overview & Spatial Workbench Architecture

The **3D Inventory Matrix** module (`src/app/features/inventory/`) is structured as a full-viewport **Material 3 Expressive Workbench**. It models retail stock across three axes — **Size ($X$) $\times$ Color ($Y$) $\times$ Warehouse ($Z$)** — without outer wireframe card borders, separating hierarchy strictly through OKLCH tonal surfaces, concentric M3 corner radii (`rounded-m3-lg-inc` `20px`, `rounded-m3-xl` `28px`, `rounded-m3-xl-inc` `32px`), deterministic linear progress indicators (`<m3-linear-progress [wavy]="false">`), spring shape morphing, and native View Transitions.

> **Scope note**: Warehouse stock balances, transfer ledger entries, and master products run in client memory via `InventoryService` for M3 Design System experimentation. Connect API persistence and ERP sync endpoints before production deployment.

```
< 1024px (Mobile / Medium Split-Pane + FAB)     >= 1024px (Full-Viewport Workbench, xl Docked Side Sheet)
┌───────────────────────────────────────────┐   ┌──────────────────────────────────────────────────────────┐
│ Command Rail · Warehouses · Audit · CTA   │   │ Tonal Command Rail (Warehouses · Batch · Audit · Create) │
│ Compact 3-Metric Tonal Strip              │   ├───────────────────┬─────────────────────┬────────────────┤
│ [ Catálogo (N)   │   Matriz 2D (SKU)   ]  │   │ Stock Health Bar  │ Valuation Metric    │ Alert Pills    │
│ Active pane scrolls naturally + <m3-fab>  │   ├──────────────┬────┴─────────────────────┼────────────────┤
│ Trailing Modal Side Sheet (< 1280px)      │   │ Catalog Rail │ Calm Garment Hero + Legend │ Docked M3      │
└───────────────────────────────────────────┘   │ Search/Chips │ 2D Matrix Grid (y-scroll)  │ Side Sheet     │
                                                │ Morph Cards  │ Inline - / Transfer / +    │ (xl:split)     │
                                                └──────────────┴────────────────────────────┴────────────────┘
```

---

## 2. Module & File Architecture

### Domain State & Models (`src/app/core/inventory/`)
- **`inventory.models.ts`**: Strong TypeScript contracts for `Warehouse`, `MasterProduct`, `ProductColor`, `CreateMasterProductDto`, `StockTransfer`, `MatrixRowView`, `MatrixColumnSummary`, `InventoryKpiSummary`, and `STANDARD_COLORS`.
- **`inventory.service.ts`**: Reactive Signal store computing `filteredProducts`, `selectedProduct`, `matrixRows`, `matrixColumns`, `kpiSummary`, dynamic `activeLowThreshold`, View Transition product phasing (`transitioningProductId`, `transitionPhase`), inline cell stock adjustments (`adjustStock`, `batchReplenishLowStock`), atomic transfers (`executeTransfer`), and Cartesian product generation (`createMasterProduct`).

### Presentation Shell & Expressive Components (`src/app/features/inventory/`)
- **`inventory.component.ts`**: Uses `ViewEncapsulation.None` with `INVENTORY_EXPRESSIVE_STYLES` (scoped under `.inv-*`) as a bounded `flex-1 min-h-0 flex flex-col lg:overflow-hidden` workbench:
  - Holds `alertsOnlyMode` signal synchronized directly with the Matrix `Solo alertas` `<m3-switch>` (single authoritative control).
  - Applies `lg:flex flex-col` and `lg:h-full lg:min-h-0` on both `<app-inventory-catalog>` and `<app-inventory-matrix>` inside a `lg:flex-1 lg:min-h-0` container (avoiding `lg:block`, which broke `.min-h-0` flex height clamping and clipped lower color rows).
  - Drives transient catalog FLIP transitions (`isCatalogFlipActive`) during category filter switches and resets (`onCategoryChange`, `clearCatalogFilters`), ensuring catalog items never carry persistent `view-transition-name` values when idle so modal scrims never suffer stacking-context overlap.
  - Manages `< lg` WAI-ARIA split-pane tabs (`#inv-tab-catalog`, `#inv-tab-matrix`), responsive `<m3-fab>` product creation trigger (`createMorphOwner`: `'header' | 'fab' | 'modal'`), `StageOverlayService` portaling, and focus capture/restore on `Escape`.
- **`components/inventory-expressive.styles.ts`**: Exports scoped `.inv-workbench`, `.inv-scroll-pane` (`scrollbar-gutter: stable`, `overscroll-behavior: contain`), `::view-transition-group(.inv-catalog-item)` FLIP enter/exit rules, `.inv-catalog-card` radius morphs, calm `.inv-matrix-cell` spring hover (`translateY(-1px)`, `var(--radius-m3-lg-inc, 20px)`, `level1`), `.inv-side-sheet-*` `@starting-style` + `allow-discrete` slide-in transitions, `.inv-swatch-tile` corner morphs (`12px -> 28px`), and `prefers-reduced-motion` / `forced-colors` fallbacks.
- **`components/inventory-header.component.ts`**:
  - Tonal **Command Rail** with static `inventory_2` emblem, concise subtitle (`sm:text-headline-sm-emphasized`), active warehouse `<m3-button-group>`, batch replenish, audit drawer toggle, and `+ Nueva Prenda` `dialog-transform` trigger (without decorative infinite `<m3-loading-indicator>` or wavy progress loops).
  - **Compact 3-Metric Tonal Strip**: Consolidated health readout with deterministic `<m3-linear-progress [wavy]="false" size="sm">`, tonal inventory valuation card (`bg-surface-high`), and concentric alert breakdown pills (`Agotados` / `Bajos`).
- **`components/inventory-catalog.component.ts`**: Bounded-flex independent-scroll drawer (`host: { class: 'flex flex-col min-h-0' }`, `bg-surface-low`) with flattened search (`<m3-text-field variant="outlined">`) and category `m3-chip` filters directly on `bg-surface-low`, compact `w-14 h-14` thumbnails, miniature textile swatch dots, and shape-morphing product buttons (`16px -> 20px -> 28px`) wired conditionally to `inv-card-*` (`view-transition-class: inv-catalog-item`).
- **`components/inventory-matrix.component.ts`**:
  - Bounded-flex container (`host: { class: 'flex flex-col gap-3 min-h-0' }`) with a calm `bg-surface-low` garment hero housing product identity, the single authoritative `Solo alertas` `<m3-switch>`, inline `Ajuste:` label, and threshold pill legend (`Saludable (≥...)`, `Bajo (1-...)`, `Sin Stock (0)`).
  - Concentric scrollable matrix (`inv-scroll-pane`) with opaque `bg-surface-high` sticky headers, `.inv-matrix-cell` tiles (`text-title-lg-emphasized` stock values, stagger reveal `@keyframes inv-matrix-reveal`, inline `-` / `sync_alt` / `+` buttons), without decorative cell meter bars or redundant footers.
- **`components/inventory-audit-drawer.component.ts`**: Responsive M3 Side Sheet with calm `bg-surface` header + static `local_shipping` icon pill (`rounded-s-m3-xl` overlay scrim on `< xl`, dissolving via `xl:contents` into a docked 3rd workbench column on `>= xl`, animated with `@starting-style` + `transition-behavior: allow-discrete`). Inside, semantic `<table class="audit-table">` adapts via `@container (inline-size < 640px)` into stacked Expressive route cards.
- **`components/inventory-select.styles.ts`**: Shared `.m3-select` styles with `@supports (appearance: base-select)` top-layer `::picker(select)` popovers.

### Modal Dialog Suite (Portaled via `StageOverlayService`)
Both dialogs align their host shell (`rounded-m3-xl` `28px`, `bg-surface-box`, plain `bg-scrim` backdrop, and `[class.shadow-m3-level3]="!isDialogTransitionActive()"`) with `src/styles.css` `::view-transition-group(dialog-transform)` rules so View Transition snapshots match exact geometry without exposing an outer rectangular ghost border during morph animations.
1. **`components/inventory-transfer-modal.component.ts`**: Calm `bg-surface` header strip, `<m3-text-field variant="filled">` quantity/operator inputs, `.m3-select` warehouse selectors, and a **Live Before $\rightarrow$ After Route Simulator** projecting post-dispatch origin/destination stock levels with linear progress indicators.
2. **`components/inventory-create-modal.component.ts`**: Dual-column **Product Studio** aligned with the Transfer modal's divider-free tonal layering (`bg-surface-box` canvas, floating `bg-surface rounded-m3-xl` header and configurator capsules, `bg-surface-low rounded-m3-lg-inc` nested preview/telemetry tiles, organic footer without edge-to-edge rules), `<m3-text-field variant="filled">` controls, duplicate-SKU validation, `.inv-swatch-tile` corner-morph lookbook/color selectors (`12px -> 28px`), `m3-chip` size toggles, and right-aligned Initial Batch Reception + live 2D matrix/valuation projection balancing the grid without a mid-modal scrollbar.

---

## 3. Core M3 Expressive & Motion Patterns

### 3.1 Tonal Layering Over Wireframes
Outer containers avoid unnecessary wireframe boxing and nested card-in-card clutter, differentiating functional regions using calm surface roles (`bg-surface` $\rightarrow$ `bg-surface-low` $\rightarrow$ `bg-surface-high` / `bg-surface-box`) and concentric corner math ($R_{\text{inner}} \approx R_{\text{outer}} - \text{padding}$).

### 3.2 View Transition & Stacking Discipline
- **`dialog-transform` Snapshot Alignment**: Header CTA, mobile `<m3-fab>`, and matrix `sync_alt` cell buttons pass single-owner ownership through `appRef.tick()` to the active dialog and clean up on close/`Escape`. Dialog containers match `--md-sys-shape-corner-extra-large` (`rounded-m3-xl`, `28px`) and `--md-sys-color-surface-container` (`bg-surface-box`), deferring `shadow-m3-level3` until `!isDialogTransitionActive()` so box-shadow ink overflow never enlarges `object-fit: none` snapshots into an extra outer frame.
- **Transient Catalog FLIP**: Cards bind `view-transition-name: inv-card-*` strictly while `isCatalogFlipActive()` is `true` for category changes/resets, preventing permanent stacking contexts over modal backdrops.
- **Native Intrinsic & Entry/Exit Choreography**: `.inv-workbench` enables `interpolate-size: allow-keywords`, and `.inv-side-sheet-*` uses `@starting-style` + `transition-behavior: allow-discrete` for GPU-composited entry/exit without layout jumps.

### 3.3 Bounded Flex Scroll Architecture
Desktop split panes (`#inv-panel-catalog` and `#inv-panel-matrix`) must retain `lg:flex flex-col lg:h-full lg:min-h-0` (never `lg:block`) inside `#app-stage`'s `overflow-hidden` container so inner `.overflow-y-auto` scroll regions remain bounded and scrollable regardless of row count (e.g., multi-color matrices).

---

## 4. Quality Assurance & Automated Test Coverage

- `src/app/core/inventory/inventory.service.spec.ts` (**12 tests**): Verifies warehouse switching, consolidated vs. facility thresholds, Cartesian SKU creation, inline adjustments, non-negative bounds, and inter-warehouse mass-conserving transfers.
- `src/app/features/inventory/inventory.component.spec.ts` (**13 tests**): Verifies semantic 2D matrix structure, legend threshold updates, empty filter reset, accessible transfer/create dialogs with duplicate-SKU validation and live Before/After projections, `< lg` split-pane WAI-ARIA tabs and compact auto-switch, mobile `<m3-fab>` trigger, deterministic `<m3-linear-progress>` without decorative wavy/loading loops, single authoritative `Solo alertas` switch dimming healthy cells, `lg:flex flex-col` bounded pane layout, aligned `rounded-m3-xl` + `bg-surface-box` + `shadow-m3-level3` dialog containers, idle zero-stacking catalog View Transition cleanup, and container-query Side Sheet rendering.
- **Full Suite Verification (`npx ng test --watch=false` / `npx ng build --configuration=development`)**: **31 / 31 test files passing (209 / 209 tests)**, `0` skipped, and clean development bundle build (`inventory-component` lazy chunk, `0` errors).
