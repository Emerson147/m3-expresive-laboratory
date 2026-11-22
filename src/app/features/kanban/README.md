# Kanban Operativo (KDS) — M3 Expressive Reference Module

Container-presentational Kitchen Display System (KDS) workbench designed as a readable blueprint for building dense real-time operational boards with Material 3 Expressive tokens, OKLCH tonal surfaces, and modern Web Platform primitives.

## Architecture & File Map

| Layer | File | Responsibility |
| :--- | :--- | :--- |
| Domain Models | `src/app/core/kanban/kanban.models.ts` | Stage, priority, category, SLA calculation helpers (`isOrderSlaBreached`, `isOrderSlaNearBreach`, `getOrderSlaProgressPercent`), completion/hold helpers (`getOrderItemProgress`, `isOrderBlocked`), `KANBAN_BLOCK_REASONS`, `KANBAN_MENU_PRESETS`, and pure filter predicates (`matchesKanbanFilter`, `matchesKanbanSearch`). |
| State Service | `src/app/core/kanban/kanban.service.ts` | Reactive Signal store (`KanbanService`), `ordersByStage`, `effectiveColumns`, `allDaySummary`, `closedHistory`, KPI derivations, Web Audio KDS chime, live simulation timer (`KANBAN_LIVE_TICK_MS`), cross-column + same-column DnD reordering, editable WIP limits, SLA urgency sort, dish checklist toggle, hold/block state, undo/recall recovery, modal-aware `runBoardMutation(...)` (`vt-board-flip` + `ApplicationRef.tick()`), and strict single-owner `dialog-transform` signals (`inspectMorphOwner`, `createMorphOwner`). |
| Smart Container | `src/app/features/kanban/kanban.component.ts` | Orchestrates `KanbanService`, `AdaptiveLayoutService`, and `StageOverlayService` external modal portal (`#kanbanModalsTemplate` + `@if (!stageOverlay.hasExternalHost())` test fallback), `<search>` landmark, `<m3-snackbar actionLabel="Deshacer">`, Escape handling, and focus capture/restoration. |
| Command Header | `src/app/features/kanban/components/kanban-header.component.ts` | Focused top rail with live KDS clock, live simulation toggle (`En Vivo` / `Pausado`), `<m3-switch iconMode="selected">` buzzer control, quick triggers for **All-Day** and **Historial**, and `dialog-transform` CTA for ticket creation (without duplicating global theme controls). |
| Analytical Strip | `src/app/features/kanban/components/kanban-kpi-strip.component.ts` | 4 balanced expressive KPI cards with tabular numerals and matching baseline footer rhythm. |
| Responsive Board | `src/app/features/kanban/components/kanban-board.component.ts` | `<m3-tabs variant="primary">` single-lane switcher under `md`, tablet/laptop horizontal `scroll-snap-type: x proximity` (`md`–`1535px`), 4-column desktop grid (`2xl+`), inline lane WIP steppers (`- / +`), 1-click **Ordenar SLA** action, empty-filter recovery banner, and `[data-kanban-lane]` / `[data-order-id]` hit targets. |
| Ticket Card | `src/app/features/kanban/components/kanban-card.component.ts` | Divider-free tonal ticket card supporting Pointer Events dragging with `.kds-floating-drag-ghost`, inset `.is-sla-breached` / `.is-blocked` / `.kds-allergy-note` accents, item prep notes (`item.notes`), completion badges (`done/total listos`), `48dp` `.touch-target-48` keyboard grip (`ArrowLeft`/`ArrowRight` stage move, `ArrowUp`/`ArrowDown` column reorder), SLA bar, and ready `Entregar` dispatch CTA. |
| Inspect Dialog | `src/app/features/kanban/components/kanban-inspect-modal.component.ts` | Always-mounted native `<m3-dialog>` (`kds-inspect-dialog`) with single-owner `dialog-transform` morph, direct Stage Jump pipeline buttons, live staff selector (`#kds-inspect-staff`), hold/resume reason picker, interactive `<m3-checkbox>` dish checklist, and two-step inline confirmation for ticket cancellation. |
| Create Dialog | `src/app/features/kanban/components/kanban-create-modal.component.ts` | Always-mounted native `<m3-dialog>` (`kds-create-dialog`) with `<form>` using `<m3-text-field variant="filled">`, connected `<m3-button-group variant="connected">` priority selector, `<select class="kds-select">` with `appearance: base-select`, interactive dish quantity composer (`KANBAN_MENU_PRESETS`), live total preview, and reopen state reset (`wasOpen`). |
| Ops Dialog | `src/app/features/kanban/components/kanban-ops-dialog.component.ts` | Tabbed native `<m3-dialog>` (`kds-ops-dialog`) combining consolidated **All-Day Cocina** dish totals (click to filter board) and **Historial / Recall** recovery for closed tickets. |
| Expressive Styles | `src/app/features/kanban/components/kanban-expressive.styles.ts` | Exports `KANBAN_SELECT_STYLES` and `KANBAN_EXPRESSIVE_STYLES` (scoped Top-Layer `<m3-dialog>` layout shells, shape morphing, `.kds-floating-drag-ghost`, `.kds-drag-handle`, `html.vt-board-flip` root isolation, View Transition FLIP keyframes, `prefers-reduced-motion`, and `forced-colors` fallbacks). |

## Design & Layout Rules Applied

1. **Single Airy Canvas Scroll (No Cramped Lane Traps)**
   - `.kds-workbench` in `KanbanComponent` owns vertical scrolling (`overflow-y-auto h-full`, `AdaptiveLayoutService`-driven padding and `lg:space-y-7`), while `app-kanban-board` uses `shrink-0` and `.kds-lane` / `.kds-lane-scroll` expand naturally without clamped heights or inner lane vertical scrollbars.
2. **Native Top-Layer Dialogs & Coordinated Stage Transitions**
   - Modals render via `<m3-dialog>` (`showModal()`) inside `#kanbanModalsTemplate` so `StageOverlayService` blurs/inerts `#app-stage` cleanly while strict single-owner `inspectMorphOwner` / `createMorphOwner` prevent duplicate `view-transition-name: dialog-transform` snapshots.
   - `KanbanService.runBoardMutation(...)` suppresses background `vt-board-flip` snapshots whenever a modal is already covering the board so `::view-transition` card groups never paint above an open Top-Layer `<dialog>`.
3. **Playbook-Compliant Form Controls**
   - **Uniform Text-Field Variant**: Every `<m3-text-field>` across `<search>` and create form uses `variant="filled"` with `[id]` bound as an Angular input.
   - **Connected Group vs Select**: Priority uses `<m3-button-group variant="connected">` instead of cramped inline radios; Station Category and SLA Target use `.kds-filled-select-wrap` + `appearance: base-select` aligned to `58px` filled field geometry.
   - **Deferred Validation**: Submit (`type="submit"`) remains enabled; invalid feedback displays only after blur or submit attempt (`isError` + `errorText` + auto-focus on `#kds-create-table`).
4. **Pure OKLCH Semantic Tokens & Divider-Free Layering**
   - Separated exclusively by tonal surface steps (`bg-surface`, `bg-surface-low`, `bg-surface-box`, `bg-surface-high`) and semantic containers (`bg-primary-box`, `bg-warning-box`, `bg-tertiary-box`, `bg-success-box`, `bg-error-box`).

## Verification

Targeted suites live in:
- `src/app/core/kanban/kanban.service.spec.ts`
- `src/app/features/kanban/kanban.component.spec.ts`

Run both suites without watch mode:

```bash
npx ng test --watch=false --include src/app/core/kanban/kanban.service.spec.ts --include src/app/features/kanban/kanban.component.spec.ts
```
