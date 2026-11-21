/**
 * Scoped Material 3 Expressive styles for Live Telemetry (Mission Control).
 * Loaded via ViewEncapsulation.None on TelemetryComponent so View Transitions
 * pseudo-elements, CSS Anchor Positioning popovers, Top-Layer dialogs, and
 * M3 shape morphs work cleanly without leaking outside `.tel-*`.
 */

/**
 * Shared M3 Expressive Filled Select styles for Live Telemetry dialogs.
 * Aligns 58px height and 16px corner radius with `<m3-text-field variant="filled">`
 * and progressively enhances `<select>` with `appearance: base-select` top-layer pickers.
 */
export const TELEMETRY_SELECT_STYLES = /* css */ `
  .tel-select {
    appearance: auto;
    inline-size: 100%;
    min-block-size: 48px;
    padding-inline: 0.75rem;
    padding-block: 0.625rem;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    border: 1px solid var(--md-sys-color-outline);
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-surface);
    font-family: var(--md-ref-typeface-plain, inherit);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    font-weight: 500;
    cursor: pointer;
    transition:
      border-color var(--md-sys-motion-duration-short3, 150ms) var(--md-sys-motion-spring-fast-effects-curve, cubic-bezier(0.2, 0, 0, 1)),
      background-color var(--md-sys-motion-duration-short3, 150ms) var(--md-sys-motion-spring-fast-effects-curve, cubic-bezier(0.2, 0, 0, 1));
  }

  .tel-select:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  @supports (appearance: base-select) {
    .tel-select,
    .tel-select::picker(select) {
      appearance: base-select;
    }

    .tel-select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .tel-select::picker-icon {
      flex-shrink: 0;
      color: var(--md-sys-color-on-surface-variant);
      transition: transform var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
    }

    .tel-select:open::picker-icon {
      transform: rotate(180deg);
    }

    .tel-select::picker(select) {
      margin-block-start: 0.25rem;
      padding: 0.375rem;
      border-radius: var(--md-sys-shape-corner-large, 16px);
      border: 1px solid var(--md-sys-color-outline-variant);
      background-color: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface);
      box-shadow: var(--md-sys-elevation-level-2);
      min-inline-size: anchor-size(inline);
      opacity: 1;
      transform: translateY(0) scale(1);
      transition:
        opacity var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
        transform var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
        display var(--md-sys-motion-duration-short4, 200ms) allow-discrete,
        overlay var(--md-sys-motion-duration-short4, 200ms) allow-discrete;
    }

    @starting-style {
      .tel-select::picker(select):popover-open {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
      }
    }

    .tel-select option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding-inline: 0.75rem;
      padding-block: 0.5rem;
      border-radius: var(--md-sys-shape-corner-small, 8px);
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      cursor: pointer;
      transition: background-color var(--md-sys-motion-duration-short2, 100ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .tel-select option:hover:not(:disabled),
    .tel-select option:focus-visible:not(:disabled) {
      background-color: color-mix(in oklch, var(--md-sys-color-on-surface) 8%, transparent);
    }

    .tel-select option:checked {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-weight: 600;
    }

    .tel-select option::checkmark {
      color: var(--md-sys-color-primary);
      font-weight: 700;
    }
  }

  /* Filled M3 Select Wrapper matching <m3-text-field variant="filled"> 58px geometry */
  .tel-filled-select {
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    min-inline-size: 0;
    inline-size: 100%;
    min-block-size: 58px;
    padding: 0;
    border-radius: var(--md-sys-shape-corner-large, 16px);
    border: 1px solid var(--md-sys-color-outline-variant);
    background-color: var(--md-sys-color-surface-container-low);
    box-shadow: inset 0 1px 2px color-mix(in srgb, var(--md-sys-color-shadow) 5%, transparent);
    transition:
      background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      border-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow var(--md-sys-motion-duration-medium1, 250ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .tel-filled-select:hover {
    background-color: var(--md-sys-color-surface-container);
    border-color: color-mix(in oklch, var(--md-sys-color-outline) 60%, var(--md-sys-color-outline-variant));
  }

  .tel-filled-select:focus-within {
    background-color: var(--md-sys-color-surface-container-lowest);
    border-color: var(--md-sys-color-primary);
    box-shadow:
      0 0 0 3.5px color-mix(in oklch, var(--md-sys-color-primary) 20%, transparent),
      inset 0 1px 1px color-mix(in srgb, var(--md-sys-color-shadow) 3%, transparent);
  }

  .tel-filled-select__label {
    position: absolute;
    inset-block-start: 11px;
    inset-inline-start: 18px;
    max-inline-size: calc(100% - 36px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    font-size: 0.6875rem;
    line-height: 1;
    font-weight: 600;
    letter-spacing: 0.35px;
    opacity: 0.85;
    color: var(--md-sys-color-on-surface-variant);
    transition: color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .tel-filled-select:focus-within .tel-filled-select__label {
    color: var(--md-sys-color-primary);
  }

  .tel-filled-select .tel-select {
    box-sizing: border-box;
    min-inline-size: 0;
    min-block-size: 56px;
    padding-block: 22px 8px;
    padding-inline: 18px 14px;
    border: none;
    border-radius: inherit;
    background-color: transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tel-filled-select .tel-select:focus-visible {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .tel-select,
    .tel-select::picker-icon,
    .tel-select::picker(select),
    .tel-select option,
    .tel-filled-select,
    .tel-filled-select__label {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .tel-select,
    .tel-select::picker(select),
    .tel-filled-select {
      border-color: ButtonText;
      background-color: Field;
      color: FieldText;
    }

    .tel-filled-select .tel-select:focus-visible {
      outline: 3px solid Highlight;
    }
  }
`;

export const TELEMETRY_EXPRESSIVE_STYLES = /* css */ `
  .tel-workbench {
    interpolate-size: allow-keywords;
  }

  .tel-scroll-pane {
    scrollbar-gutter: stable;
    overscroll-behavior: contain;
  }

  /* ── Transient View Transitions Choreography (Fleet Filter FLIP) ─────────── */
  .tel-fleet-item {
    view-transition-class: tel-fleet-item;
  }

  ::view-transition-group(.tel-fleet-item) {
    animation-duration: 300ms;
    animation-timing-function: var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
  }

  ::view-transition-old(.tel-fleet-item):only-child {
    animation: tel-flip-exit 200ms var(--md-sys-motion-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15)) both;
  }

  ::view-transition-new(.tel-fleet-item):only-child {
    animation: tel-flip-enter 320ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)) both;
  }

  @keyframes tel-flip-exit {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.93);
    }
  }

  @keyframes tel-flip-enter {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ── Tonal KPI Capsules ──────────────────────────────────────────────────── */
  .tel-kpi-card {
    border-radius: var(--radius-m3-xl, 28px);
    transition:
      background-color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 260ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1));
  }

  .tel-kpi-card:hover {
    transform: translateY(-1px);
  }

  /* ── Bounded Shape-Morphing Fleet Cards ──────────────────────────────────── */
  .tel-fleet-card {
    border-radius: var(--radius-m3-lg, 16px);
    transition:
      transform 280ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      border-radius 280ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      background-color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow 240ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
  }

  .tel-fleet-card:hover {
    border-radius: var(--radius-m3-lg-inc, 20px);
    transform: translateY(-1px);
  }

  .tel-fleet-card.is-selected {
    border-radius: var(--radius-m3-xl, 28px);
  }

  /* ── Top-Layer Theme Calibration Popover & CSS Anchor Positioning ────────── */
  .tel-calibration-trigger {
    anchor-name: --tel-calibration-trigger;
  }

  .tel-calibration-popover {
    padding: 16px;
    width: min(328px, calc(100vw - 24px));
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    border: 1px solid var(--md-sys-color-outline-variant);
    box-shadow: var(--md-sys-elevation-level-3);
    opacity: 0;
    transform: translateY(-6px) scale(0.96);
    transition-property: opacity, transform, display, overlay;
    transition-duration: 200ms;
    transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
    transition-behavior: allow-discrete;
  }

  @supports (position-area: block-end) {
    [popover].tel-calibration-popover {
      position: fixed;
      position-anchor: --tel-calibration-trigger;
      inset: auto;
      margin: 0;
      margin-block-start: 8px;
      position-area: block-end span-inline-start;
      position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    }
  }

  .tel-calibration-popover.is-fallback {
    position: fixed;
    margin: 0;
    z-index: 60;
    display: none;
  }

  :is(
    [popover].tel-calibration-popover:is(:popover-open, .\\:popover-open),
    .tel-calibration-popover.is-fallback-open
  ):where(:not([data-closing])) {
    display: block;
    opacity: 1;
    transform: translateY(0) scale(1);

    @starting-style {
      opacity: 0;
      transform: translateY(-6px) scale(0.96);
    }
  }

  /* ── Interactive Vector Corridor Nodes ───────────────────────────────────── */
  .tel-corridor-node {
    cursor: pointer;
    outline: none;
  }

  .tel-corridor-node:focus-visible .tel-corridor-dot {
    stroke: var(--md-sys-color-primary);
    stroke-width: 2.5px;
  }

  .tel-corridor-pulse {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* ── Native Top-Layer <m3-dialog> Shells (Inspect & Assign Route) ────────── */
  dialog.m3-dialog.tel-inspect-dialog {
    width: min(48rem, calc(100vw - 1.5rem));
    max-width: min(48rem, calc(100vw - 1.5rem));
    background-color: var(--md-sys-color-surface-container);
  }

  dialog.m3-dialog.tel-assign-dialog {
    width: min(42rem, calc(100vw - 1.5rem));
    max-width: min(42rem, calc(100vw - 1.5rem));
    background-color: var(--md-sys-color-surface-container);
  }

  dialog.m3-dialog.tel-inspect-dialog > .m3-dialog-inner,
  dialog.m3-dialog.tel-assign-dialog > .m3-dialog-inner {
    padding: 0;
    gap: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.tel-inspect-dialog > .m3-dialog-inner > h2,
  dialog.m3-dialog.tel-assign-dialog > .m3-dialog-inner > h2 {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    margin: 0;
  }

  dialog.m3-dialog.tel-inspect-dialog > .m3-dialog-inner > .m3-dialog-body,
  dialog.m3-dialog.tel-assign-dialog > .m3-dialog-inner > .m3-dialog-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.tel-inspect-dialog > .m3-dialog-inner > .m3-dialog-footer,
  dialog.m3-dialog.tel-assign-dialog > .m3-dialog-inner > .m3-dialog-footer {
    padding: 0;
    display: none;
  }

  /* ── Connected Full-Row Cargo Protocol Selector in Assign Modal ──────────── */
  m3-button-group.tel-cargo-group-host {
    display: block;
    width: 100%;
  }

  .tel-cargo-group {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  @media (min-width: 520px) {
    .tel-cargo-group {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 3px;
    }

    .tel-cargo-group .m3-btn {
      width: 100%;
      justify-content: center;
      padding-inline: 12px;
    }
  }

  /* ── Accessibility & Reduced Motion ──────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .tel-kpi-card,
    .tel-fleet-card,
    .tel-calibration-popover,
    .tel-corridor-pulse {
      transition-duration: 0.01ms !important;
      animation: none !important;
      animation-duration: 0.01ms !important;
      transform: none !important;
    }

    ::view-transition-group(.tel-fleet-item),
    ::view-transition-old(.tel-fleet-item):only-child,
    ::view-transition-new(.tel-fleet-item):only-child {
      animation-duration: 0.01ms !important;
    }
  }

  @media (forced-colors: active) {
    .tel-kpi-card,
    .tel-fleet-card,
    .tel-calibration-popover,
    .tel-event-card {
      border: 1px solid CanvasText;
    }
  }
`;
