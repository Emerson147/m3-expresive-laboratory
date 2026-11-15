# Material 3 Expressive — Live Telemetry (`Telemetría Viva`)

## 1. Overview & Mission Control Archetype

The **Live Telemetry** module (`src/app/features/telemetry/`) implements **Archetype 2: Analytical / Mission Control** using OKLCH dynamic theming, divider-free tonal layering (`bg-surface` $\rightarrow$ `bg-surface-low` $\rightarrow$ `bg-surface-box`), honest live-telemetry motion discipline, reactive SVG vector tracking, and portaled `StageOverlayService` dialogs with native View Transitions.

> **Scope note**: Vehicle fleet positions, CAN-BUS sensor readings, corridor waypoints, and alert logs run in client memory via `TelemetryService` (`TELEMETRY_REFRESH_INTERVAL_MS = 2000ms`) for M3 Expressive architecture demonstration. Wire WebSocket/SSE telemetry streams and dispatch persistence before production deployment.

```text
< 1024px (Mobile / Tablet Split Tabs)            >= 1024px (Airy Scrollable Mission Control Bento)
┌───────────────────────────────────────────┐    ┌──────────────────────────────────────────────────────────┐
│ Command Rail · Sync 2s · Switch · OKLCH   │    │ Command Rail (Live Switch · OKLCH Popover · Assign CTA)  │
│ 4 Tonal OKLCH KPIs (sm: 2x2)              │    ├──────────────┬──────────────┬──────────────┬─────────────┤
│ [ Flota & Unidad (N) │ Corredor & Alertas]│    │ SLA Rate     │ Flota en Ruta│ Cadena Frío  │ Riesgo SLA  │
│ Active pane scrolls smoothly              │    ├──────────────┴──────────────┴──────────────┬─────────────┤
└───────────────────────────────────────────┘    │ Focus Dispatch (Single Living Wavy Bar +   │ Vector Map  │
                                                 │ Scrubber + 6 Live CAN-BUS Sensor Tiles)    │ (Cubic Spl.)│
                                                 ├────────────────────────────────────────────┼─────────────┤
                                                 │ Filter <m3-chip> Bar + Morphing Fleet Grid │ Live Log    │
                                                 │ (Bounded max-h scroll, Inspect CTA)        │ (role="log")│
                                                 └────────────────────────────────────────────┴─────────────┘
```

---

## 2. Module & File Architecture

### Domain State & Geometry (`src/app/core/telemetry/`)
- **`telemetry.models.ts`**: Typed contracts for `Vehicle`, `CanBusTelemetry`, `LiveTelemetryEvent`, `CorridorWaypoint`, `CorridorVehicleMarker`, `ActiveCorridorSummary`, `TelemetryFilter`, `TelemetryFilterCounts`, `TelemetryKpiSummary`, `AssignRouteDto`, and `TelemetryExportPayload`.
- **`telemetry.service.ts`**: Reactive Angular Signals store computing `filteredVehicles`, `filterCounts`, `kpiSummary` (`slaRate`, `fleetUtilizationPercent`, `idleFleetCount`, `coldChainAvgTempC`, `coldChainMonitoredCount`, `delayedCount`, `averageSpeedKmh`), `evaluateCorridorSplinePoint()` coordinates mapped across both cubic-Bézier segments (`corridorMarkers`), live 2-second `setInterval` ticks cleaned up via `DestroyRef`, transient `isFleetFlipActive`, `StageOverlayService` modal transitions (`isModalTransitioning`), and JSON export (`buildTelemetryExportPayload`, `exportVehicleTelemetry`).

### Presentation Components (`src/app/features/telemetry/`)
- **`telemetry.component.ts`**: Bounded yet spacious `overflow-y-auto` M3 canvas (`space-y-5 lg:space-y-6`) orchestrating the header, KPI strip, `< lg` WAI-ARIA split-pane tabs (`#tel-tab-fleet`, `#tel-tab-corridor`), `<m3-snackbar>` notifications, `StageOverlayService` overlay mounting/unmounting, and trigger focus restoration on close/`Escape`.
- **`components/telemetry-expressive.styles.ts`**: Exports scoped `.tel-*` styles (`TELEMETRY_EXPRESSIVE_STYLES`) and shared dialog select styles (`TELEMETRY_SELECT_STYLES`), including transient `tel-fleet-item` View Transition FLIP rules, `.tel-kpi-card` / `.tel-fleet-card` corner morphs (`16px -> 20px -> 28px`), `[popover="auto"]` top-layer `@starting-style` + `allow-discrete` + `.\:popover-open` fallback rules, `accent-color` range controls with `@supports not` fallbacks, centered `.tel-corridor-pulse`, `.tel-filled-select` / `.tel-select` (`appearance: base-select`), `prefers-reduced-motion`, and `forced-colors` rules.
- **`components/telemetry-header.component.ts`**: Command rail featuring live sync status badge (`Sincronía cada 2s` / `En pausa`), `<m3-switch>` toggle, progressive top-layer `Calibración OKLCH` popover (`THEME_OPTIONS` swatches + Seed Hue slider), Dark Mode toggle button, and `Asignar Ruta` `dialog-transform` trigger.
- **`components/telemetry-kpi-strip.component.ts`**: 4 tonal `rounded-m3-xl` KPI capsules fed directly from `kpiSummary()` with flat deterministic `<m3-linear-progress [wavy]="false">` / `<m3-circular-progress [wavy]="false">` indicators.
- **`components/telemetry-focus-card.component.ts`**: Active unit telemetry card housing the accessible route progress scrubber (`setVehicleProgress`), the **single live wavy** `<m3-linear-progress [wavy]="true" [paused]="!isLiveTelemetryActive()" size="lg">`, 6 live CAN-BUS metrics, and its dedicated `focus-inspect-*` trigger.
- **`components/telemetry-fleet-panel.component.ts`**: Reactive `<m3-chip type="filter">` filter bar (`filterCounts()`), transient FLIP vehicle list (`ul.tel-scroll-pane`), separated selection `<button>` (`aria-pressed`), flat card progress bars, and sibling `<m3-button>` `Inspeccionar` footer actions.
- **`components/telemetry-corridor-panel.component.ts`**: Signal-driven cubic-Bézier SVG corridor map (`pathLength="100"` + `stroke-dasharray`) with clickable keyboard-accessible vehicle markers and `role="log"` live event stream.
- **`components/telemetry-inspect-modal.component.ts`**: Portaled CAN-BUS diagnostic dialog (`#telemetry-inspect-dialog`) with `#modalHeading` focus routing, inner scrollable telemetry summary + filtered unit log, deferred `shadow-m3-level3`, and functional JSON download + snackbar action.
- **`components/telemetry-assign-modal.component.ts`**: Portaled Route Dispatch modal (`#telemetry-assign-dialog`) with `.tel-filled-select` (`appearance: base-select`) unit/corridor pickers, `<m3-text-field variant="filled">` destination/driver inputs validating post-interaction/submission, and `<m3-button-group>` cargo protocol selection (`cold_chain`, `dry`, `pharma`).

---

## 3. Verification & Quality Coverage

- **`src/app/core/telemetry/telemetry.service.spec.ts`**: Unit tests covering reactive `filterCounts`, derived cold-chain/utilization KPIs, cubic-Bézier `corridorMarkers`, clamped `setVehicleProgress`, `exportVehicleTelemetry` JSON payload + event log + toast lifecycle, live simulation toggle, and synchronous FLIP flag reset.
- **`src/app/features/telemetry/telemetry.component.spec.ts`**: Integration tests verifying airy scrollable workbench layout, OKLCH `rounded-m3-xl` KPIs, single active `wavy` focus progress indicator, corridor SVG selection, `StageOverlayService` portaled Inspect/Assign dialogs, distinct `dialog-transform` trigger IDs, JSON export + focus restoration, deferred `<m3-text-field>` validation + `<m3-button-group>` dispatch submission, and `< lg` WAI-ARIA keyboard tab switching.
