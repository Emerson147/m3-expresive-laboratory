# Material 3 Expressive — Point of Sale (POS) Feature Module

## 1. Overview & Terminal Mission

The **Point of Sale (POS)** module (`src/app/features/pos/`) is an interactive M3 Expressive commercial terminal designed for high-frequency retail and hospitality workflows. It demonstrates how **Google Material 3 Expressive** OKLCH color roles, shared M3 standalone primitives (`m3-card`, `m3-button`, `m3-chip`, `m3-text-field`, `m3-loading-indicator`), Stage Recess depth, and native View Transitions compose into a responsive transactional interface with Peruvian SUNAT fiscal calculations.

> **Scope note**: All catalog items, inventory counts, terminal card simulation, and sequential folios live in client memory (`PosService` signals) for Design System experimentation. Connect API persistence, payment SDKs, and an OSE/SUNAT integration layer before live store deployment.

```
< 1024px (Mobile / Tablet)                  >= 1024px (Desktop Cockpit)
┌───────────────────────────┐               ┌──────────────────────────┬─────────────────────┐
│ [ Menú (12) | Comanda (N) ]│              │ Menú · Turno · [Buscar]  │ Comanda #ORD-XXXX   │
├───────────────────────────┤               │ [Todos][Café][Sándwich…] │ [Mesa▾|Llevar|Deliv]│
│ Active pane fills viewport│               │ ┌──────┐ ┌──────┐ ┌────┐ │ [Boleta | Factura]  │
│ (independent vertical scroll)             │ │ Card │ │ Card │ │Card│ │ Cliente (DNI/RUC)   │
│                           │               │ └──────┘ └──────┘ └────┘ │ Líneas (lineId)     │
├───────────────────────────┤               │ ┌──────┐ ┌──────┐ ┌────┐ │ Descuento / IGV 18% │
│ Sticky CTA: Ver Comanda   │               │ │ Card │ │ Card │ │Card│ │ [Limpiar][Cobrar]   │
└───────────────────────────┘               └──────────────────────────┴─────────────────────┘
```

---

## 2. Module & File Architecture

### State & Domain
- **`src/app/core/pos/pos.service.ts`**: Reactive Angular Signal store managing catalog inventory, shift metadata (`shiftInfo`), `serviceChannel` (`dine-in` / `takeaway` / `delivery`), `availableTables`, sequential order/voucher counters (`ticketSequence`, `activeOrderCode`), variant-aware cart lines (`CartItem` with `lineId` and `unitPrice`), stock ceilings (`remainingStock`), SUNAT 18% IGV breakdown, and sale finalization.
- **`src/app/features/pos/pos-modifiers.data.ts`**: Category-specific recipe modifiers (`CATEGORY_MODIFIERS` for `bases` + `extras`) and M3 tonal fallback themes (`CATEGORY_FALLBACK_THEMES`) when product imagery fails to load.

### Presentation Container & Subcomponents
- **`src/app/features/pos/pos.component.ts`**: Orchestration shell handling:
  - Responsive `< lg` tab switcher (`mobilePane`: `'catalog' | 'ticket'`) and sticky bottom cart bar (`Ver Comanda`).
  - Desktop split grid (`lg:grid-cols-12`, catalog `lg:col-span-7 xl:col-span-8` + ticket `lg:col-span-5 xl:col-span-4`).
  - Window keyboard accelerators (`F2`, `F4`, `Ctrl + Enter`, `Escape`).
  - `StageOverlayService` integration (external modal portal host, `#app-stage` recess + `inert`, focus capture/restore, and exclusive `view-transition-name: dialog-transform` ownership).
- **`components/pos-catalog.component.ts`**: Catalog header with shift badge, `m3-text-field` SKU/text search, category `m3-chip` strip, density-tuned product cards, non-colliding stock/`qty x` badges, out-of-stock lockdown (`bg-error-box`), and inline card steppers.
- **`components/pos-ticket.component.ts`**: Active ticket header (`orderCode`), expandable inline `availableTables` picker on `Mesa`, voucher switcher (`Boleta` / `Factura`), customer summary card, variant-tracked line list (`track item.lineId`), quick discount selector, fiscal totals, and equal-height `Limpiar` + `Cobrar` actions.

### Modal Dialog Suite (Portaled Outside `#app-stage`)
1. **`components/pos-customizer-modal.component.ts`**: `<form (ngSubmit)>` recipe configurator computing live `calculatedPrice()` (base + extra surcharges), emitting `{ product, notes, unitPrice }`, and morphing via `dialog-transform` from the card's `Opciones` trigger.
2. **`components/pos-checkout-modal.component.ts`**: Multi-method gateway morphing from `Cobrar` (`Efectivo` with adaptive bill presets + additive `+10`/`+20` pills, `Yape / Plin` with QR & post-blur operation code validation, `Tarjeta` with `m3-loading-indicator` and GPU `.m3-aurora-glow`).
3. **`components/pos-receipt-modal.component.ts`**: 80mm-style monospaced thermal voucher rendering `B001-` / `F001-` series, channel/table metadata, customized `unitPrice` + `item.notes`, localized payment labels (`Efectivo`, `Yape / Plin`, `Tarjeta`), and `window.print()`.
4. **`components/pos-customer-modal.component.ts`**: Client DNI (`^\d{8}$`) / RUC (`^\d{11}$`) editor preserving typed values across document-type switches and validating strictly after interaction (`inputBlur` / submit attempt with automatic focus on the first invalid field).
5. **`components/pos-shortcuts-modal.component.ts`**: Keyboard accelerator reference dialog.

---

## 3. Core M3 Expressive & Business Logic Patterns

### 3.1 Variant Cart Lines & Stock Integrity
* Cart rows key by `lineId` (`productId::unitPrice::notes`) so customized items (e.g., espresso + almond milk extra) keep their adjusted `unitPrice` and coexist with standard rows of the same SKU.
* `PosCatalogComponent` and `PosTicketComponent` sum quantities across all lines matching a `product.id` to enforce `product.stock` limits on both `+` steppers and `Opciones`.
* `completeSale()` snapshots cart items, decrements catalog `stock`, increments `shiftInfo.salesCountToday`, and `newSale()` advances `ticketSequence`.

### 3.2 View Transitions & Overlay Layering
* Shared elements use `view-transition-name: dialog-transform` with an **exclusive single-owner contract**:
  * **Customizer flow**: catalog `Opciones` button (`invisible` while open) $\leftrightarrow$ Customizer dialog (`appRef.tick()` flushes before/after snapshots).
  * **Checkout flow**: ticket `Cobrar` button $\rightarrow$ Checkout dialog $\rightarrow$ Thermal Receipt $\rightarrow$ ticket `Cobrar`.
* When `document.startViewTransition` is unavailable or disabled, modals fall back cleanly to `.m3-dialog-backdrop` + `.m3-dialog-surface` over `bg-scrim`.

### 3.3 Ergonomics, Validation & Semantics
* Interactive pills, channel tabs, steppers, and shared `m3-button`s enforce $\ge 48\text{px}$ hit targets via `.touch-target-48`, `.state-layer`, and `.focus-ring-m3`.
* All status badges, surface tiers (`bg-surface`, `bg-surface-box`, `bg-surface-high`), and alert chips (`bg-warning-box`, `bg-error-box`, `bg-success-box`) resolve strictly through OKLCH `@theme` semantic tokens—zero ad-hoc classes added to `styles.css`.
* Form inputs (`PosCustomerModalComponent` and Yape approval code) follow **validate-after-interaction**: format hints remain visible in `supportingText`, errors surface only on `(inputBlur)` or form submission while syncing `aria-invalid`, and clear immediately once valid.

---

## 4. Peruvian Fiscal Compliance (SUNAT Rules)

Displayed item prices include 18% Peruvian IGV:

$$\text{Subtotal (Op. Gravada)} = \frac{\text{Total}}{1.18}, \qquad \text{IGV (18\%)} = \text{Total} - \text{Subtotal}$$

* **Boleta de Venta (`B001-XXXXXX`)**: Default consumer voucher (`DNI` 8 digits; defaults to `Clientes Varios` / `00000000`).
* **Factura Electrónica (`F001-XXXXXX`)**: Corporate voucher (`RUC` 11 digits). Switching to `factura` prompts default corporate info only if no company is currently set; switching back resets default company placeholders cleanly.

---

## 5. Operator Keyboard & Touch Shortcuts

| Shortcut / Trigger | Scope | Action |
| :--- | :--- | :--- |
| **`F2`** | No modal open | Focuses catalog search / barcode input |
| **`F4`** | Catalog or Customer modal | Opens or toggles Customer (`DNI`/`RUC`) modal |
| **`Ctrl + Enter`** | No modal open & cart non-empty | Opens Checkout payment gateway |
| **`Esc`** | Modal open / Search active | Closes topmost modal (or clears `searchQuery` when idle) |
| **Card tap / `Añadir`** | Product in stock | Adds 1 standard unit (blocked when `qty >= stock`) |
| **Card `Opciones`** | Product in stock | Opens Customizer modal (`Bases` + `Extras` + notes) |

---

## 6. Completed Sale Snapshot (`CompletedSale`)

`PosService.completeSale()` records the following strongly-typed structure ready to map to an API/OSE endpoint:

```typescript
export interface CompletedSale {
  saleId: string;                     // "B001-000842" | "F001-000842"
  orderCode?: string;                 // "#ORD-2026-0842"
  serviceChannel?: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;               // Present when serviceChannel === 'dine-in'
  date: Date;
  voucherType: 'boleta' | 'factura' | 'ticket';
  customer: PosCustomer;              // { docType: 'DNI' | 'RUC', docNumber, name, isCompany }
  items: CartItem[];                  // [{ lineId, product, unitPrice, quantity, notes? }]
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'yape' | 'card';
  cashReceived?: number;
  change?: number;
  yapeCode?: string;
}
```
