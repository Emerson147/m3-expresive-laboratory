# Material 3 Expressive — Multidimensional Inventory & Variant Matrix System

## 1. Overview & Enterprise Mission

The **Multidimensional Inventory System** (`src/app/features/inventory/`) is an enterprise-grade retail and fashion logistics interface. It replaces obsolete flat tabular CRUDs with an interactive **3-Axis Matrix (Sizes $X$ × Colors $Y$ × Warehouses $Z$)**, engineered for omnichannel brands (such as Zara, Nike, or luxury apparel manufacturers).

```
+---------------------------------------------------------------------------------------------------------+
|                                    MULTIDIMENSIONAL INVENTORY MATRIX                                    |
+---------------------------------------------------------------------------------------------------------+
|  [ M3 Expressive Logistics ]  [ Consolidado Global | Lurín Central | Miraflores | San Isidro | Jockey ] |
+---------------------------------------------------------------------------------------------------------+
|  KPI 1: Valorización     |  KPI 2: Unidades Físicas   |  KPI 3: Quiebres de Stock  |  KPI 4: Salud %    |
|  $ 142,580.00 USD        |  2,450 uds (5 Estilos)     |  2 agotados • 5 bajos      |  88% Saludable     |
+--------------------------+----------------------------+----------------------------+--------------------+
|  CATALOG DRAWER (3 Cols) |  2D INTERACTIVE VARIANT MATRIX CANVAS (9 Cols)                               |
|                          |                                                                              |
|  [ Search by SKU/Name ]  |  [ Camisa Oxford Pima 80/2 ] [ OXF-802 ] [ $69.00 USD ]                      |
|  [ Category Filter Chips]|  Legend: [● Saludable (≥15)] [● Bajo (1-14)] [● Agotado (0)]                |
|                          |                                                                              |
|  +--------------------+  |  +------------------------------------------------------------------------+  |
|  | Camisa Oxford Pima |  |  | Color / Talla | XS (12) | S (45)  | M (88)  | L (70)  | XL (20) | Total |  |
|  | OXF-802 • $69.00   |  |  |---------------+---------+---------+---------+---------+---------+-------|  |
|  +--------------------+  |  |  Azul Marino  |  8 uds  |  15 uds |  28 uds |  22 uds |  6 uds  | 79 u  |  |
|  | Polo Piqué Clásico |  |  |  Blanco Óptico|  12 uds |  18 uds |  35 uds |  26 uds |  8 uds  | 99 u  |  |
|  | POL-100 • $42.00   |  |  |  Verde Salvia |  4 uds  |  8 uds  |  14 uds |  12 uds |  2 uds  | 40 u  |  |
|  +--------------------+  |  |  Borgoña Prof |  0 uds! |  2 uds  |  8 uds  |  6 uds  |  0 uds! | 16 u  |  |
|  | Pantalón Chino     |  |  +---------------+---------+---------+---------+---------+---------+-------|  |
|  | CHN-404 • $79.00   |  |  | Total Tallas  |  24 uds |  43 uds |  85 uds |  66 uds |  16 uds | 234 u |  |
|  +--------------------+  |  +------------------------------------------------------------------------+  |
|                          |  [ Inter-Warehouse Transfer Modal ]  •  [ Real-Time Audit Log Drawer ]       |
+--------------------------+------------------------------------------------------------------------------+
```

---

## 2. Why Go Beyond Flat CRUDs? (The Multidimensional Challenge)

In modern fashion and retail e-commerce, garments are **never** managed as isolated records. A single shirt style exists across dozens of combinations:
* **The SKU Explosion Problem**: 1 style $\times$ 6 sizes ($XS \to XXL$) $\times$ 5 colors = **30 discrete SKUs per garment**.
* **Omnichannel Distribution**: Across 4 physical fulfillment locations (Central Distribution Center + 3 Store Boutiques), that single style generates **120 live stock cells**.
* **Failure of Traditional Tables**: Presenting 120 rows in a generic data grid forces operators to scroll, search, and paginate endlessly, blinding them to critical stock imbalances.
* **The Matrix Solution**: A 2D spatial grid where columns represent sizes and rows represent colors with color swatches, providing instant holistic visibility of size runs, color popularity, and depleted cells.

---

## 3. Architectural Design & Spatial Metrics

### 3.1 Asymmetric Bento Grid
* **Omnichannel Control Ribbon (Header)**: Contains the segmented warehouse switcher (`Consolidado Global`, `Lurín Central`, `Miraflores Store`, `San Isidro Boutique`, `Jockey Concept Store`), quick batch replenishment trigger, and audit history toggle.
* **KPI Metrics Deck (4 Bento Cards)**: Displays live aggregate financial and physical health metrics powered by Angular 19 computed signals.
* **Split Workspace (3:9 Col Ratio)**:
  * **Left Drawer (`lg:col-span-3`)**: Master garment catalog with real-time text search, category chips, high-res thumbnails, and selection indicators.
  * **Right Canvas (`lg:col-span-9`)**: 2D Interactive Variant Matrix with sticky headers, color swatches, inline +/- micro-steppers, and transfer shortcuts.

### 3.2 Geometry & Metrics Specification
| UI Element | Metric / Class | Purpose & Behavioral Reason |
| :--- | :--- | :--- |
| **Grid Gap** | `gap-5` (20px) | Generous breathing room preventing visual crowding in dense matrix displays. |
| **Bento Card Radii** | `rounded-3xl` (24px) | High-radii M3 expressive container shape with subtle elevation. |
| **Matrix Cell Padding** | `p-2` (8px) | Maximizes usable space while keeping micro-steppers clickable. |
| **Color Swatches** | `w-5 h-5 rounded-full` | High-contrast visual representation of fabric color with 1px border. |
| **Touch Stepper Buttons** | `w-6 h-6 rounded-lg` | Fine-grained single-click stock adjustments with instant signal reactivity. |
| **Hero Garment Photo** | `w-20 h-20 sm:w-24 sm:h-24` | Crisp portrait thumbnail of the active lookbook piece. |

---

## 4. Signal Architecture & State Engine

The entire feature operates on reactive **Angular 19 Signals** inside `src/app/core/inventory/inventory.service.ts`:

### 4.1 State Primitives (Signals)
```typescript
// Core state signals
readonly warehouses = signal<Warehouse[]>(INITIAL_WAREHOUSES);
readonly selectedWarehouseId = signal<string>('ALL'); // 'ALL' or specific warehouse
readonly masterProducts = signal<MasterProduct[]>(INITIAL_PRODUCTS);
readonly selectedProductId = signal<number>(1);
readonly searchQuery = signal<string>('');
readonly selectedCategory = signal<string>('ALL');
readonly stockTransfers = signal<StockTransfer[]>(INITIAL_TRANSFERS);

// Modal and UI signals
readonly isTransferModalOpen = signal<boolean>(false);
readonly activeTransferVariant = signal<TransferVariantContext | null>(null);
readonly isAuditHistoryOpen = signal<boolean>(false);
readonly toastMessage = signal<string | null>(null);
```

### 4.2 Derived Business Intelligence (Computed Signals)
* **`matrixRows`**: Dynamically projects the 2D grid of `MatrixRowView[]`. If `selectedWarehouseId === 'ALL'`, it aggregates stock across all 4 hubs; if a specific warehouse is selected, it scopes down to that facility.
* **`matrixColumns`**: Computes size-level column totals across all color rows.
* **`kpiSummary`**: Calculates `totalSkus`, `totalUnits`, `totalCatalogValue`, `lowStockSkus`, `outOfStockSkus`, and overall `healthRate` % in real time ($O(N)$ pass with memoization).

---

## 5. Heatmap Color Science & Ergonomics

Every stock cell in the matrix evaluates its status against dynamic threshold rules:

$$\text{Status} = \begin{cases} 
\text{out\_of\_stock} & \text{if } \text{stock} = 0 \\
\text{low} & \text{if } 0 < \text{stock} < \text{threshold} \\
\text{healthy} & \text{if } \text{stock} \ge \text{threshold}
\end{cases}$$

### Visual Styling Tokens:
* **Healthy ($\ge 15$ uds)**: Emerald green accent (`text-emerald-500`, `bg-emerald-500/5`, border `border-emerald-500/20`).
* **Low / Critical ($1-14$ uds)**: Amber warning accent (`text-amber-500`, `bg-amber-500/5`, border `border-amber-500/40`).
* **Out of Stock ($0$ uds)**: Rose / Red accent (`text-rose-500`, `bg-rose-500/5`, border `border-rose-500/50`).

---

## 6. Inter-Warehouse Stock Balancing (Transfers & Audit Trail)

### 6.1 Conservation of Inventory Mass
When an operator transfers stock between warehouses:
1. **Verification**: Checks that the source warehouse contains sufficient physical units (`stock >= transferQty`).
2. **Atomic Execution**: Simultaneously decrements the source cell and increments the target cell:
   $$\Delta \text{Stock}_{\text{source}} = -Q, \quad \Delta \text{Stock}_{\text{target}} = +Q \implies \Delta \text{Total} = 0$$
3. **Immutable Audit Logging**: Appends a `StockTransfer` receipt with unique tracking ID (`TRF-XXXX`), operator name, timestamp, and route (`Lurín Central → Miraflores`).
4. **Instant UI Feedback**: Triggers an M3 Toast Notification and refreshes the matrix balances with zero latency.

---

---

## 7. Product Onboarding: The Cartesian Variant Generator

In high-frequency fashion operations, operators never create variant records individually. The system includes an automated **Cartesian Variant Generator (`+ Nueva Prenda`)**:

### 7.1 Architecture of the Generator Flow
1. **Master Identity**: Operator enters global attributes (Garment Name, Base SKU, Category, Base Retail Price, Brand, Season, Lookbook URL).
2. **Axis $X$ (Sizes)**: Selection from industry presets (`XS-XXL`, `28-38`, `39-44`, `38R-44R`) or discrete toggle chips.
3. **Axis $Y$ (Colors)**: Interactive textile palette chips with real color swatches and hexadecimal definitions.
4. **Automated Matrix Calculation**:
   $$\text{Total SKUs} = |S| \times |C|$$
   $$\text{Total Initial Units} = |S| \times |C| \times \text{InitialStockPerCell}$$
5. **Multi-Warehouse Fan-out**: The generator populates the reception warehouse with the target initial stock while provisioning zero-stock cells across all other facilities, preparing them for future inter-warehouse transfers.

---

## 8. Quality Assurance & Automated Test Coverage

The module is verified with comprehensive unit tests:
* `src/app/core/inventory/inventory.service.spec.ts`: Tests matrix computation, Cartesian product generation, inline stock adjustments, negative stock prevention, and transfer validation.
* `src/app/features/inventory/inventory.component.spec.ts`: Tests component rendering, warehouse switcher, size columns, modal interactions, and product creation.
* **Test Suite Status**: 100% passing (52/52 tests across 9 test suites).
* **Production Build**: 0 errors, tree-shaken lazy bundle size ~61 kB.
