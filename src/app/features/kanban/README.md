# Kanban Operativo (KDS) — M3 Expressive Reference Module

Container-presentational Kitchen Display System (KDS) workbench designed as a readable blueprint for building dense real-time operational boards with Material 3 Expressive tokens, OKLCH tonal surfaces, and modern Web Platform primitives.

## Architecture & File Map

| Layer | File | Responsibility |
| :--- | :--- | :--- |
| Domain Models | `src/app/core/kanban/kanban.models.ts` | Stage, priority, category, SLA calculation helpers (`isOrderSlaBreached`, `isOrderSlaNearBreach`, `getOrderSlaProgressPercent`), and pure filter predicates (`matchesKanbanFilter`, `matchesKanbanSearch`). |
| State Service | `src/app/core/kanban/kanban.service.ts` | Reactive Signal store (`KanbanService`), `ordersByStage`, KPI derivations, Web Audio KDS chime, live simulation timer (`KANBAN_LIVE_TICK_MS`), cross-column + same-column DnD reordering, ready-order dispatch/cancellation, staff assignment, scoped `vt-board-flip` View Transitions, and modal lifecycle. |
| Smart Container | `src/app/features/kanban/kanban.component.ts` | Orchestrates `KanbanService`, `AdaptiveLayoutService`, and `StageOverlayService` external modal portal (`#kanbanModalsTemplate` + `@if (!stageOverlay.hasExternalHost())` test fallback), Escape handling, and focus capture/restoration. |
| Command Header | `src/app/features/kanban/components/kanban-header.component.ts` | Focused top rail with live KDS clock, live simulation toggle (`En Vivo` / `Pausado`), `<m3-switch iconMode="selected">` buzzer control, and `dialog-transform` CTA for ticket creation (without duplicating global theme controls). |
| Analytical Strip | `src/app/features/kanban/components/kanban-kpi-strip.component.ts` | 4 bounded expressive KPI cards (`bg-surface-low`, `bg-warning-box`, `bg-primary-box`, `bg-error-box` / `bg-success-box`) with tabular numerals. |
| Responsive Board | `src/app/features/kanban/components/kanban-board.component.ts` | `<m3-tabs variant="primary">` single-lane switcher under `md`, tablet horizontal `scroll-snap-type: x proximity` (`md`–`lg`), and 4-column desktop grid (`xl+`) with `[data-kanban-lane]` / `[data-order-id]` hit targets. |
| Ticket Card | `src/app/features/kanban/components/kanban-card.component.ts` | Divider-free tonal ticket card supporting full-card Pointer Events dragging with a floating `.kds-floating-drag-ghost` clone (`pointerdown` >= 5px, ignoring action buttons, touch-scroll safe outside the grip), inset `.is-sla-breached` / `.kds-allergy-note` accents, `48dp` `.touch-target-48` keyboard grip (`ArrowLeft`/`ArrowRight` stage move, `ArrowUp`/`ArrowDown` column reorder), SLA bar, and ready `Entregar` dispatch CTA. |
| Inspect Dialog | `src/app/features/kanban/components/kanban-inspect-modal.component.ts` | Portaled ticket inspection dialog (`#kanban-inspect-dialog`) with `dialog-transform` View Transition binding, deferred `shadow-m3-level3`, `#modalHeading` focus capture, live staff selector (`#kds-inspect-staff`), and stage/dispatch/cancellation actions. |
| Create Dialog | `src/app/features/kanban/components/kanban-create-modal.component.ts` | Portaled `<form (ngSubmit)="onFormSubmit()" novalidate>` using strictly uniform `<m3-text-field variant="filled">`, `<m3-radio-group>` for 4 priority options, `<select class="kds-select">` with `appearance: base-select`, and deferred post-interaction validation. |
| Expressive Styles | `src/app/features/kanban/components/kanban-expressive.styles.ts` | Exports `KANBAN_SELECT_STYLES` and `KANBAN_EXPRESSIVE_STYLES` (shape morphing, `.kds-floating-drag-ghost`, `html.vt-board-flip` root isolation, View Transition FLIP keyframes, `prefers-reduced-motion`, and `forced-colors` fallbacks). |

## Design & Layout Rules Applied

1. **Single Airy Canvas Scroll (No Cramped Lane Traps)**
   - `.kds-workbench` in `KanbanComponent` owns vertical scrolling (`overflow-y-auto h-full`, `AdaptiveLayoutService`-driven padding and `lg:space-y-7`), while `app-kanban-board` uses `shrink-0` and `.kds-lane` / `.kds-lane-scroll` expand to full content height without `max-h-[calc(...)]` or inner lane vertical scrollbars.
2. **External Overlay Portal & Stage Recess (`StageOverlayService`)**
   - Modals mount outside `#app-stage` via `stageOverlay.mountOverlayTemplate(tpl, injector)` so background content receives `.stage-recessed` and `inert` cleanly while `[style.view-transition-name]="'dialog-transform'"` morphs from trigger to dialog (`shadow-m3-level3` deferred until `!isDialogTransitionActive()`).
3. **Playbook-Compliant Form Controls**
   - **No Mixed Text-Field Variants**: Every `<m3-text-field>` across the search bar and create form uses `variant="filled"` with `[id]` bound as an Angular input (preventing duplicate host DOM IDs).
   - **Radio vs Select**: Priority has 4 mutually exclusive choices (`low`, `medium`, `high`, `urgent`), rendered with `<m3-radio-group>` instead of a `<select>`; Station Category and SLA Target use `.kds-filled-select-wrap` + `appearance: base-select` aligned to `58px` filled field geometry.
   - **Deferred Validation**: Submit (`type="submit"`) remains enabled; invalid feedback displays only after blur or submit attempt (`isError` + `errorText` + auto-focus on `#kds-create-table`).
4. **Pure OKLCH Semantic Tokens & Divider-Free Layering**
   - Zero raw palette classes (`emerald-*`, `amber-*`, `slate-*`, `rounded-2xl`, `bg-black`), separated instead by surface steps (`bg-surface`, `bg-surface-low`, `bg-surface-box`, `bg-surface-high`) and semantic containers (`bg-primary-box`, `bg-warning-box`, `bg-tertiary-box`, `bg-success-box`, `bg-error-box`).

## Verification

Targeted suites live in:
- `src/app/core/kanban/kanban.service.spec.ts`
- `src/app/features/kanban/kanban.component.spec.ts`

Run both suites without watch mode:

```bash
npx ng test --watch=false --include src/app/core/kanban/kanban.service.spec.ts --include src/app/features/kanban/kanban.component.spec.ts
```
