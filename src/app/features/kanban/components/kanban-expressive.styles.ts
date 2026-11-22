export const KANBAN_SELECT_STYLES = /* css */ `
  .kds-filled-select-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 58px;
    border-radius: var(--md-sys-shape-corner-large, 16px);
    background-color: var(--md-sys-color-surface-container-low);
    border: 1px solid var(--md-sys-color-outline-variant);
    transition:
      background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      border-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .kds-filled-select-wrap:hover {
    background-color: var(--md-sys-color-surface-container);
  }

  .kds-filled-select-wrap:focus-within {
    background-color: var(--md-sys-color-surface-container-lowest);
    border-color: var(--md-sys-color-primary);
    box-shadow: 0 0 0 3.5px color-mix(in oklch, var(--md-sys-color-primary) 20%, transparent);
  }

  .kds-filled-select-label {
    position: absolute;
    top: 9px;
    inset-inline-start: 16px;
    font-size: var(--md-sys-typescale-label-sm-size, 0.75rem);
    font-weight: 600;
    line-height: 1;
    color: var(--md-sys-color-on-surface-variant);
    pointer-events: none;
  }

  .kds-filled-select-wrap:focus-within .kds-filled-select-label {
    color: var(--md-sys-color-primary);
  }

  .kds-select {
    appearance: none;
    width: 100%;
    min-height: 58px;
    padding: 24px 36px 8px 16px;
    background: transparent;
    border: 0;
    border-radius: var(--md-sys-shape-corner-large, 16px);
    color: var(--md-sys-color-on-surface);
    font-family: inherit;
    font-size: var(--md-sys-typescale-body-lg-size, 0.9375rem);
    font-weight: 500;
    line-height: 1.35;
    cursor: pointer;
    outline: none;
  }

  @supports (appearance: base-select) {
    .kds-select,
    .kds-select::picker(select) {
      appearance: base-select;
    }

    .kds-select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 24px 14px 8px 16px;
    }

    .kds-select::picker-icon {
      color: var(--md-sys-color-on-surface-variant);
      margin-inline-start: auto;
      transition: transform var(--md-sys-motion-duration-short4, 200ms)
        var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .kds-select:open::picker-icon {
      transform: rotate(180deg);
      color: var(--md-sys-color-primary);
    }

    .kds-select::picker(select) {
      margin-block-start: 4px;
      padding: 6px;
      min-width: max(220px, anchor-size(width));
      border-radius: var(--md-sys-shape-corner-large, 16px);
      background-color: var(--md-sys-color-surface-container-high, var(--md-sys-color-surface-container));
      color: var(--md-sys-color-on-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      box-shadow: var(--md-sys-elevation-level2);
      opacity: 0;
      transform: translateY(-4px) scale(0.97);
      transition-property: opacity, transform, display, overlay;
      transition-duration: var(--md-sys-motion-duration-short4, 200ms);
      transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
      transition-behavior: allow-discrete;
    }

    .kds-select::picker(select):popover-open {
      opacity: 1;
      transform: translateY(0) scale(1);

      @starting-style {
        opacity: 0;
        transform: translateY(-4px) scale(0.97);
      }
    }

    .kds-select option {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 8px 12px;
      border-radius: var(--md-sys-shape-corner-medium, 12px);
      color: var(--md-sys-color-on-surface);
      font-weight: 500;
      cursor: pointer;
    }

    .kds-select option:hover:not(:disabled),
    .kds-select option:focus-visible:not(:disabled) {
      background-color: color-mix(in oklch, var(--md-sys-color-on-surface) 8%, transparent);
    }

    .kds-select option:checked {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-weight: 600;
    }

    .kds-select option::checkmark {
      color: var(--md-sys-color-on-secondary-container);
      font-weight: 700;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .kds-filled-select-wrap,
    .kds-select::picker-icon,
    .kds-select::picker(select) {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .kds-filled-select-wrap {
      border: 1px solid CanvasText;
    }

    .kds-filled-select-wrap:focus-within {
      outline: 2px solid Highlight;
    }
  }
`;

export const KANBAN_EXPRESSIVE_STYLES = /* css */ `
  .kds-workbench {
    interpolate-size: allow-keywords;
  }

  /* ── M3 Expressive Bounded Shape Morphing Cards ──────────────────────────── */
  .kds-kpi-card {
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    transition:
      background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .kds-ticket-card {
    border-radius: var(--md-sys-shape-corner-large, 16px);
    overflow: hidden;
    transition:
      border-radius var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      opacity var(--md-sys-motion-duration-short3, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .kds-ticket-card:hover:not(.is-dragging) {
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
    box-shadow: var(--md-sys-elevation-level1);
  }

  .kds-ticket-card.is-blocked:not(.is-sla-breached) {
    box-shadow:
      inset 4px 0 0 var(--md-sys-color-tertiary),
      var(--md-sys-elevation-level1);
  }

  .kds-ticket-card.is-sla-breached {
    box-shadow:
      inset 4px 0 0 var(--md-sys-color-error),
      var(--md-sys-elevation-level1);
  }

  .kds-ticket-card.is-sla-breached:hover:not(.is-dragging) {
    box-shadow:
      inset 4px 0 0 var(--md-sys-color-error),
      var(--md-sys-elevation-level2);
  }

  .kds-ticket-card.is-dragging {
    cursor: grabbing;
    opacity: 0.35;
    transform: scale(0.97);
    box-shadow: none;
  }

  .kds-ticket-card.is-sla-breached.is-dragging {
    box-shadow: inset 4px 0 0 var(--md-sys-color-error);
  }

  .kds-ticket-card.is-reorder-target {
    box-shadow:
      inset 0 3px 0 var(--md-sys-color-primary),
      var(--md-sys-elevation-level1);
  }

  .kds-ticket-card.is-sla-breached.is-reorder-target {
    box-shadow:
      inset 0 3px 0 var(--md-sys-color-primary),
      inset 4px 0 0 var(--md-sys-color-error),
      var(--md-sys-elevation-level1);
  }

  .kds-allergy-note {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    box-shadow: inset 4px 0 0 var(--md-sys-color-error);
  }

  .kds-blocked-note {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    box-shadow: inset 4px 0 0 var(--md-sys-color-tertiary);
  }

  /* ── In-DOM Floating Pointer Drag Ghost (Rounded Corners Without OS Rect Halo) */
  html.kds-pointer-dragging,
  html.kds-pointer-dragging * {
    cursor: grabbing !important;
    -webkit-user-select: none !important;
    user-select: none !important;
  }

  .kds-floating-drag-ghost {
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    z-index: 9999;
    pointer-events: none;
    overflow: hidden;
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
    background-color: var(--md-sys-color-surface-container-highest);
    box-shadow: var(--md-sys-elevation-level4);
    opacity: 0.96;
    will-change: transform;
    transition: none;
  }

  .kds-floating-drag-ghost.is-sla-breached {
    box-shadow:
      inset 4px 0 0 var(--md-sys-color-error),
      var(--md-sys-elevation-level4);
  }

  /* ── Dedicated Accessible Drag Handle (Pointer + Touch + Keyboard) ───────── */
  .kds-drag-handle {
    cursor: grab;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .kds-drag-handle.is-dragging {
    cursor: grabbing;
  }

  /* ── Column Lanes & Dropzone Feedback ────────────────────────────────────── */
  .kds-lane {
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    transition:
      background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      outline-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    outline: 2px dashed transparent;
    outline-offset: -2px;
  }

  .kds-lane.is-drop-target {
    background-color: color-mix(in oklch, var(--md-sys-color-primary) 10%, var(--md-sys-color-surface-container-low));
    outline-color: var(--md-sys-color-primary);
    box-shadow: var(--md-sys-elevation-level2);
  }

  .kds-lane-scroll {
    min-width: 0;
  }

  /* Tablet & Laptop Horizontal Scroll-Snap (4 spacious lanes until 2xl 1536px+) */
  @media (min-width: 768px) and (max-width: 1535px) {
    .kds-board-grid {
      scroll-snap-type: x proximity;
      overscroll-behavior-x: contain;
    }

    .kds-lane {
      scroll-snap-align: start;
      min-width: min(350px, 84vw);
    }
  }

  @media (prefers-reduced-motion: reduce) and (min-width: 768px) and (max-width: 1535px) {
    .kds-board-grid {
      scroll-behavior: auto;
    }
  }

  /* ── Top-Layer M3 Native Modal Dialog Shells (<m3-dialog>) ──────────────── */
  dialog.m3-dialog.kds-inspect-dialog {
    width: min(48rem, calc(100vw - 1.5rem));
    max-width: min(48rem, calc(100vw - 1.5rem));
    background-color: var(--md-sys-color-surface-container);
  }

  dialog.m3-dialog.kds-create-dialog,
  dialog.m3-dialog.kds-ops-dialog {
    width: min(46rem, calc(100vw - 1.5rem));
    max-width: min(46rem, calc(100vw - 1.5rem));
    background-color: var(--md-sys-color-surface-container);
  }

  dialog.m3-dialog.kds-inspect-dialog > .m3-dialog-inner,
  dialog.m3-dialog.kds-create-dialog > .m3-dialog-inner,
  dialog.m3-dialog.kds-ops-dialog > .m3-dialog-inner {
    padding: 0;
    gap: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.kds-inspect-dialog > .m3-dialog-inner > h2,
  dialog.m3-dialog.kds-create-dialog > .m3-dialog-inner > h2,
  dialog.m3-dialog.kds-ops-dialog > .m3-dialog-inner > h2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    margin: 0;
  }

  dialog.m3-dialog.kds-inspect-dialog > .m3-dialog-inner > .m3-dialog-body,
  dialog.m3-dialog.kds-create-dialog > .m3-dialog-inner > .m3-dialog-body,
  dialog.m3-dialog.kds-ops-dialog > .m3-dialog-inner > .m3-dialog-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.kds-inspect-dialog > .m3-dialog-inner > .m3-dialog-footer,
  dialog.m3-dialog.kds-create-dialog > .m3-dialog-inner > .m3-dialog-footer,
  dialog.m3-dialog.kds-ops-dialog > .m3-dialog-inner > .m3-dialog-footer {
    padding: 0;
    display: none;
  }

  /* Connected Priority Selector in Create Modal */
  m3-button-group.kds-priority-group-host {
    display: block !important;
    width: 100%;
  }

  .kds-priority-group {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
  }

  @media (min-width: 560px) {
    .kds-priority-group {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 3px;
    }

    .kds-priority-group .m3-btn {
      width: 100%;
      justify-content: center;
      padding-inline: 10px;
    }
  }

  /* ── Scoped View Transitions (Multi-Card Filter/Move FLIP) ───────────────── */
  /* Disable root snapshot & global fade-out/enter during board-only card FLIPs */
  html.vt-board-flip:not(.theme-transition) {
    view-transition-name: none;
  }

  html.vt-board-flip:not(.theme-transition)::view-transition {
    pointer-events: none;
  }

  html.vt-board-flip:not(.theme-transition)::view-transition-old(root) {
    display: none;
    animation: none;
  }

  html.vt-board-flip:not(.theme-transition)::view-transition-new(root) {
    animation: none;
  }

  .kds-ticket-item {
    view-transition-class: kds-ticket-item;
  }

  ::view-transition-group(.kds-ticket-item),
  ::view-transition-group(kanban-card-active) {
    animation-duration: var(--md-sys-motion-duration-medium2, 300ms);
    animation-timing-function: var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
    border-radius: var(--md-sys-shape-corner-large, 16px);
    overflow: hidden;
  }

  ::view-transition-old(.kds-ticket-item):only-child {
    animation: kds-flip-exit var(--md-sys-motion-duration-short4, 200ms)
      var(--md-sys-motion-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15)) both;
  }

  ::view-transition-new(.kds-ticket-item):only-child {
    animation: kds-flip-enter var(--md-sys-motion-duration-medium2, 300ms)
      var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)) both;
  }

  @keyframes kds-flip-exit {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.94);
    }
  }

  @keyframes kds-flip-enter {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ── Reduced Motion & High Contrast Fallbacks ────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .kds-live-dot,
    ::view-transition-group(.kds-ticket-item),
    ::view-transition-group(kanban-card-active),
    ::view-transition-old(.kds-ticket-item):only-child,
    ::view-transition-new(.kds-ticket-item):only-child {
      animation: none;
    }

    .kds-ticket-card,
    .kds-kpi-card,
    .kds-lane {
      transition-property: background-color, border-color, color;
      transform: none;
    }
  }

  @media (forced-colors: active) {
    .kds-kpi-card,
    .kds-lane,
    .kds-ticket-card {
      border: 1px solid CanvasText;
    }

    .kds-lane.is-drop-target {
      outline: 3px dashed Highlight;
    }
  }
`;
