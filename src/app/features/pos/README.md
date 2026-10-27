# Material 3 Expressive — Point of Sale (POS) Feature Module

## 1. Overview & Terminal Mission

The **Point of Sale (POS)** feature module (`src/app/features/pos/`) is an enterprise-grade, high-frequency commercial interface engineered for modern retail, hospitality, and fast-casual gastronomy. It demonstrates how to apply **Google Material 3 Expressive** design tokens, OKLCH perceptual color science, and tactile ergonomics to a mission-critical checkout flow.

```
+---------------------------------------------------------------------------------------+
|                                    POS WORKSPACE                                      |
+---------------------------------------------------+-----------------------------------+
|  CATALOG & EXPLORATION (8 Cols / 66.6% Surface)   | FISCAL ORDER STREAM (4 Cols)      |
|                                                   |                                   |
|  [ Menú Title ] [ Search / F2 ] [ Atajos ]        |  [ Comanda #ORD-0842 ] [ 4 items] |
|  [ Category Filter Chips: All, Coffee, Food... ]  |  [ Dine-In / Takeaway / Delivery ]|
|                                                   |  [ Boleta / Factura Switcher ]    |
|  +--------------+  +--------------+               |  [ Customer / RUC Identification ]|
|  | Product Card |  | Product Card |               |  -------------------------------  |
|  | S/ 12.00     |  | S/ 8.50      |               |  Itemized Cart Stream             |
|  +--------------+  +--------------+               |  - Espresso x2 (S/ 17.00)         |
|  +--------------+  +--------------+               |  - Ciabatta x1 (S/ 16.50)         |
|  | Product Card |  | Product Card |               |  -------------------------------  |
|  | S/ 14.00     |  | S/ 18.00     |               |  Subtotal (Op. Gravada): S/ 28.39 |
|  +--------------+  +--------------+               |  IGV (18% SUNAT):        S/  5.11 |
|                                                   |  TOTAL A COBRAR:         S/ 33.50 |
|                                                   |  [ COBRAR PEDIDO (Enter) ]        |
+---------------------------------------------------+-----------------------------------+
```

---

## 2. Architectural Design & Spatial Metrics

### 2.1 The Asymmetric Bento Grid (8:4 Spatial Ratio)
* **Viewport Lockdown**: The module operates in a fixed 100% viewport height (`h-full min-h-0 overflow-hidden`), eliminating page-level window scrolling.
* **Left Panel (`lg:col-span-8` / ~66.6%)**: Tactile discovery territory. Contains the content-first header, quick filter pills, and a 3-column responsive card grid with independent vertical scrolling (`overflow-y-auto m3-scrollbar`).
* **Right Panel (`lg:col-span-4` / ~33.3%)**: Sticky fiscal order ledger. Pinned action buttons and tax summaries remain permanently visible above the fold regardless of ticket length.

### 2.2 Geometry & Metrics Specification
| UI Element | Metric / Class | Purpose & Behavioral Reason |
| :--- | :--- | :--- |
| **Outer Grid Gap** | `gap-4` (16px) | Balances spatial separation without wasting touch real estate. |
| **Product Card Radii** | `rounded-2xl` (16px) | M3 medium container shape; creates organic visual hierarchy. |
| **Dialog Radii** | `rounded-3xl` (24px) | M3 extra-large dialog surface conforming to container transform specs. |
| **Product Photo Height** | `h-60` (240px) | High-definition portrait proportion showcases food art clearly. |
| **Customizer Hero Photo** | `h-64 sm:h-72` (256–288px) | Unobstructed full-bleed showcase preserving 100% cup/saucer geometry. |
| **Touch Targets** | $\ge 44 \times 44\text{px}$ | Adheres to Fitts's Law ($T = a + b \log_2(2D/W)$) for zero miss-clicks. |
| **Action Bar Elevation** | `shadow-md`, `active:scale-95` | Haptic-like visual feedback with hardware-accelerated GPU transforms. |

---

## 3. What the Feature Contains

### 3.1 Files & Component Structure
* **`pos.component.ts`**: The main presentation container managing catalog rendering, local keyboard bindings, and modal visibility states.
* **`src/app/core/pos/pos.service.ts`**: The reactive singleton state engine powering the entire POS lifecycle using Angular Signals.
* **`src/app/core/pos/pos.models.ts`**: Strict TypeScript interfaces for products, modifiers, cart items, customer fiscal entities, and sales receipts.

### 3.2 Dialog & Modal Architecture
The feature encapsulates **5 specialized modal layers**:

1. **Modal 1: Checkout Gateway (`posService.isCheckoutOpen`)**
   * Multi-rail payment gateway:
     * **Cash (`cash`)**: Quick denomination pills (`Exacto`, `S/ 20`, `S/ 50`, `S/ 100`) with instant reactive change computation.
     * **Digital Wallet (`yape`)**: Dynamic QR code with brand color validation and mandatory 4-digit operation code input.
     * **POS Card Terminal (`card`)**: Contactless / chip emulation with simulated terminal status.
2. **Modal 2: Thermal ESC/POS Receipt (`posService.isReceiptOpen`)**
   * Monospaced fiscal voucher (`80mm` / `font-mono`) with dashed dividers, SUNAT tax breakdown, and native `window.print()` trigger.
3. **Modal 3: Fiscal Customer Switcher (`isCustomerModalOpen`)**
   * Toggles between **Persona Natural (DNI)** (8 numeric digits) and **Empresa Jurídica (RUC)** (11 digits, auto-fills business credentials).
4. **Modal 4: Keyboard Shortcuts Reference (`isShortcutsModalOpen`)**
   * High-contrast cheat sheet for cashier keyboard productivity.
5. **Modal 5: Gastronomy Customizer (`customizingProduct`)**
   * Tailored product recipe builder:
     * **Showcase Hero**: 100% visible photograph without dark gradient obscuration.
     * **Typographic Info Block**: Dedicated SKU, stock, title, description, and live recipe price.
     * **Modifier Selectors**: Segmented pills for milk/bread bases, multi-select chips for extras, and kitchen note input.
     * **Ergonomic Action Row**: Aligned `Cancelar` and `Añadir a Comanda` on the bottom right.

---

## 4. State Management Engine (`PosService`)

All commercial logic is completely isolated from Angular templates and lives in `PosService` using **Angular 19+ Signals**:

```typescript
// Writable Signals (State)
readonly products = signal<PosProduct[]>(CATALOG);
readonly cart = signal<CartItem[]>([]);
readonly searchQuery = signal<string>('');
readonly selectedCategory = signal<string>('all');
readonly serviceChannel = signal<ServiceChannel>('dine-in');
readonly voucherType = signal<VoucherType>('boleta');
readonly customer = signal<PosCustomer>(DEFAULT_CUSTOMER);
readonly paymentMethod = signal<PaymentMethod>('cash');
readonly cashReceived = signal<number>(0);
readonly discountPercent = signal<number>(0);

// Computed Signals (Reactive Derivations)
readonly filteredProducts = computed(() => ...);
readonly grossTotal = computed(() => this.cart().reduce((acc, i) => acc + (i.product.price * i.quantity), 0));
readonly subtotal = computed(() => +(this.grossTotal() / 1.18).toFixed(2));
readonly tax = computed(() => +(this.grossTotal() - this.subtotal()).toFixed(2));
readonly total = computed(() => +(this.grossTotal() * (1 - this.discountPercent() / 100)).toFixed(2));
readonly change = computed(() => Math.max(0, +(this.cashReceived() - this.total()).toFixed(2)));
readonly isPaymentValid = computed(() => ...);
```

---

## 5. Peruvian Fiscal Compliance (SUNAT Rules)

Prices displayed to consumers are **tax-inclusive** (Precios con IGV incluido):

$$\text{Subtotal (Operación Gravada)} = \frac{\text{Total}}{1.18}$$

$$\text{IGV (18\% SUNAT)} = \text{Total} - \text{Subtotal}$$

* **Boleta de Venta**: Default document for end-consumers (`docType: 'DNI'`, 8 digits). Fallback: `Clientes Varios` (`00000000`).
* **Factura Electrónica**: Required for corporate tax deductions (`docType: 'RUC'`, 11 digits starting with `10`, `15`, `20`).

---

## 6. Performance Engineering & Anti-Pattern Eliminating

During the architectural evolution of this module, three major anti-patterns were identified and surgically eliminated:

### 6.1 The "Feature Bloat" Header Trap
* **The Defect**: Placing simulated register statuses ("Terminal POS", "SUNAT OK", "Fondo S/ 350.00") in a top fixed bar stole 60px of vertical space, crowding product cards.
* **The Fix**: Eradicated the generic status bar. Shifted to a **Content-First Header**: bold **"Menú"** title, item count pill, and compact search bar with `[F2]` on a single horizontal row, maximizing vertical product density.

### 6.2 View Transition Snapshot Collision (Delay / Double-Click Bug)
* **The Defect**: Assigning `view-transition-name: dialog-transform` dynamically via `appRef.tick()` caused Chromium to encounter duplicate transition names when the modal appeared while the button still existed in the DOM. Chromium aborted the transition, stalled the microtask queue, and swallowed the first click.
* **The Fix**: Replaced artificial `appRef.tick()` and `view-transition-name` with direct synchronous signal mutations. Entrance animations are powered by GPU-accelerated CSS springs (`.m3-dialog-backdrop` and `.m3-dialog-surface` with `cubic-bezier(0.05, 0.7, 0.1, 1)`), achieving **sub-millisecond instant response on single click**.

### 6.3 Mini-Photos in Ticket Stream Anti-Pattern
* **The Defect**: Adding thumbnail photos to the cart stream doubles row height from 32px to 64px, forcing cashiers to scroll constantly on medium-sized orders.
* **The Fix**: Maintained a clean, high-density typographic order ledger. The catalog left panel is for *visual discovery*; the ticket right panel is for *auditing and rapid scanning*.

---

## 7. Operator Guide: Keyboard & Touch Shortcuts

| Shortcut / Trigger | Action | Target / UI Response |
| :--- | :--- | :--- |
| **`F2`** | Focus Search | Highlights the search input / barcode scanner instantly. |
| **`F4`** | Toggle Customer | Opens DNI / RUC customer identification dialog. |
| **`Ctrl + Enter`** | Open Checkout | Triggers the payment gateway if cart has at least 1 item. |
| **`Esc`** | Dismiss / Close | Closes any open modal or clears pending dialog state. |
| **Card Tap** | Direct Add | Adds 1 unit of product to cart and illuminates stepper. |
| **Card `Opciones`** | Customizer | Opens Modal 5 for recipe modifications (milk, extras, notes). |
| **Card `-` / `+`** | Fast Stepper | Updates quantity directly on the card without switching focus. |

---

## 8. Integration Protocol: Connecting to an Enterprise Backend

To transmit completed sales to an ERP, backend service (NestJS, Go, Spring Boot), or SUNAT electronic billing OSE, dispatch the following validated payload:

```typescript
interface CompletedSalePayload {
  saleId: string;                     // e.g. "ORD-2026-0842"
  date: string;                       // ISO 8601 string
  voucherType: 'boleta' | 'factura';
  serviceChannel: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;               // e.g. "Mesa 04"
  customer: {
    docType: 'DNI' | 'RUC';
    docNumber: string;
    name: string;
  };
  items: Array<{
    productId: number;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;                 // (unitPrice * quantity) / 1.18
    tax: number;                      // (unitPrice * quantity) - subtotal
    notes?: string;                   // Custom recipe modifications
  }>;
  taxSummary: {
    grossTotal: number;
    subtotal: number;
    tax: number;
    discount: number;
    finalTotal: number;
  };
  payment: {
    method: 'cash' | 'yape' | 'card';
    cashReceived?: number;
    change?: number;
    yapeCode?: string;
  };
}
```
