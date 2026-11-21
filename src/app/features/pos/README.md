# Material 3 Expressive — Point of Sale (POS) Feature Module

## 1. Overview & Terminal Mission

The **Point of Sale (POS)** module (`src/app/features/pos/`) is an interactive M3 Expressive commercial terminal designed for high-frequency retail and hospitality workflows. It demonstrates how **Google Material 3 Expressive** OKLCH color roles, shared M3 standalone primitives (`m3-card`, `m3-button`, `m3-button-group`, `m3-tabs`, `m3-chip`, `m3-text-field`, `m3-dialog`, `m3-loading-indicator`), Stage Recess depth, CSS Container Queries, and native View Transitions compose into a responsive transactional interface with Peruvian SUNAT fiscal calculations.

> **Scope note**: All catalog items, inventory counts, terminal card simulation, SUNAT authorization delay, and sequential folios live in client memory (`PosService` signals and UI orchestration) for Design System experimentation. Connect API persistence, payment SDKs, and an OSE/SUNAT integration layer before live store deployment.

```
< 1024px (Mobile / Tablet)                  >= 1024px (Desktop Cockpit)
┌───────────────────────────┐               ┌──────────────────────────┬─────────────────────┐
│ <m3-tabs> Menú | Comanda  │               │ Menú · Turno · <search>  │ Comanda #ORD-XXXX   │
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
- **`src/app/features/pos/pos.component.ts`**: `OnPush` orchestration shell loading `POS_EXPRESSIVE_CSS` (`ViewEncapsulation.None`), handling:
  - Responsive `< lg` M3 Secondary Tabs (`<m3-tabs>`, `mobilePane`: `'catalog' | 'ticket'`) and sticky bottom cart bar (`Ver Comanda`).
  - Desktop split grid (`lg:grid-cols-12`, catalog `lg:col-span-7 xl:col-span-8` + ticket `lg:col-span-5 xl:col-span-4`).
  - Window keyboard accelerators (`F2`, `F4`, `Ctrl + Enter`, `Escape`).
  - `StageOverlayService` integration (external modal portal host, `#app-stage` recess + `inert`, focus restore, and exclusive `view-transition-name: dialog-transform` ownership).
- **`components/pos-expressive.styles.ts`**: Scoped CSS rules defining `container-type: inline-size` on `.pos-catalog-pane` and `.pos-ticket-pane`, `@container` product grid & narrow ticket line adaptation, `.pos-ticket-group` full-width connected controls, `.pos-customizer-dialog` full-bleed hero layout, `.pos-receipt-dialog` thermal styling, and `@media print` 80mm receipt isolation.
- **`components/pos-catalog.component.ts`**: Catalog header with shift badge, `<search>` + filled `m3-text-field` SKU/text search, tonal `Atajos` trigger, category `m3-chip` strip, tonal filled `m3-card` tiles (highlighting `tone="primary"` when queued), stock status badges, and inline card steppers.
- **`components/pos-ticket.component.ts`**: Active ticket panel (`m3-card variant="filled" surface="low"`), full-width `m3-button-group` controls for service channel (with inline expandable `availableTables` picker) and voucher type (`Boleta` / `Factura`), tonal customer summary card, variant-tracked line list (`track item.lineId`), `m3-button-group` discount selector, fiscal totals, and tonal `Limpiar` + filled `Cobrar` actions.

### Native `<m3-dialog>` Modal Suite (Portaled Outside `#app-stage`)
1. **`components/pos-customizer-modal.component.ts`**: `<m3-dialog variant="basic" customClass="pos-customizer-dialog">` preserving edge-to-edge hero photography, elevated `bg-surface-low` base/milk tiles, `m3-chip` extras, notes input, and `dialog-transform` morphing from `Opciones`.
2. **`components/pos-checkout-modal.component.ts`**: `<m3-dialog variant="expressive">` multi-method payment gateway morphing from `Cobrar` (`m3-button-group` for `Efectivo`, `Yape / Plin`, `Tarjeta`; `elevated` quick-cash bills + `tonal` additives; live SUNAT issuing stage powered by 72dp `four-color` `<m3-loading-indicator>` and button `[loading]` state before transitioning to the receipt).
3. **`components/pos-receipt-modal.component.ts`**: `<m3-dialog variant="basic" customClass="pos-receipt-dialog">` 80mm monospaced thermal voucher rendering `B001-` / `F001-` series, channel/table metadata, customized `unitPrice` + `item.notes`, localized payment labels (`Efectivo`, `Yape / Plin`, `Tarjeta`), and clean `@media print` paper output via `window.print()`.
4. **`components/pos-customer-modal.component.ts`**: `<m3-dialog variant="expressive">` client `DNI` (`^\d{8}$`) / `RUC` (`^\d{11}$`) editor with connected `m3-button-group`, preserving manual inputs across switches and validating strictly after interaction (`inputBlur` / submit attempt).
5. **`components/pos-shortcuts-modal.component.ts`**: `<m3-dialog variant="expressive">` keyboard accelerator reference dialog.

---

## 3. Core M3 Expressive & Business Logic Patterns

### 3.1 Variant Cart Lines & Stock Integrity
* Cart rows key by `lineId` (`productId::unitPrice::notes`) so customized items (e.g., espresso + almond milk extra) keep their adjusted `unitPrice` and coexist with standard rows of the same SKU.
* `PosCatalogComponent` and `PosTicketComponent` sum quantities across all lines matching a `product.id` to enforce `product.stock` limits on both `+` steppers and `Opciones`.
* `completeSale()` snapshots cart items, decrements catalog `stock`, increments `shiftInfo.salesCountToday`, and `newSale()` advances `ticketSequence`.

### 3.2 View Transitions & Top-Layer Dialog Layering
* Shared elements use `view-transition-name: dialog-transform` with an **exclusive single-owner contract**:
  * **Customizer flow**: catalog `Opciones` button (`invisible` while open) $\leftrightarrow$ Customizer `<m3-dialog [managedClose]="true">` (`appRef.tick()` flushes before/after snapshots).
  * **Checkout flow**: ticket `Cobrar` button $\rightarrow$ Checkout `<m3-dialog>` $\rightarrow$ SUNAT `<m3-loading-indicator>` authorization $\rightarrow$ Thermal Receipt `<m3-dialog>` $\rightarrow$ ticket `Cobrar`.

### 3.3 Ergonomics, Validation & Semantics
* Interactive controls enforce $\ge 48\text{px}$ hit targets via `.touch-target-48`, `.state-layer`, and `.focus-ring-m3`, avoiding outlined clutter across dense cards and action rows.
* All status badges, surface tiers (`bg-surface`, `bg-surface-low`, `bg-surface-box`, `bg-surface-high`), and alert chips (`bg-warning-box`, `bg-error-box`, `bg-success-box`) resolve through OKLCH `@theme` semantic tokens.
* Form inputs (`PosCustomerModalComponent` and Yape approval code) follow **validate-after-interaction**: format hints remain visible in `supportingText`, errors surface on `(inputBlur)` or form submission while syncing `aria-invalid`, and clear once valid.

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
| **`Esc`** | Modal open / Search active | Closes topmost `<m3-dialog>` (blocked during SUNAT emission) or clears `searchQuery` when idle |
| **Card tap / `Añadir`** | Product in stock | Adds 1 standard unit (blocked when `qty >= stock`) |
| **Card `Opciones`** | Product in stock | Opens Customizer dialog (`Bases` + `Extras` + notes) |

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
