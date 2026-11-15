/**
 * Campus Module — Scoped Material 3 Expressive Styles & Motion Tokens
 *
 * Loaded with ViewEncapsulation.None on CampusComponent (matching Telemetry & Inventory)
 * using real `--md-sys-*` design tokens from `_token.css`, OKLCH tonal stepping,
 * bounded corner-radius shape morphing (never 9999px), and transient VT hooks.
 */
export const CAMPUS_EXPRESSIVE_CSS = /* css */ `
  .campus-workbench {
    interpolate-size: allow-keywords;
  }

  .campus-kpi-card {
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    transition:
      background-color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .campus-kpi-card:hover {
    transform: translateY(-1px);
  }

  .campus-kpi-btn {
    border-radius: 24px;
    min-height: 44px;
    transition:
      border-radius 260ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .campus-kpi-btn:hover:not(:disabled) {
    border-radius: var(--md-sys-shape-corner-large, 16px);
  }

  .campus-kpi-btn[aria-pressed='true'] {
    border-radius: 14px;
  }

  .campus-kpi-btn:active:not(:disabled) {
    transform: scale(0.985);
  }

  .campus-kpi-btn:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  .campus-surface-tile {
    border-radius: var(--md-sys-shape-corner-large, 16px);
    transition:
      border-radius 280ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .campus-surface-tile:hover:not(:disabled) {
    border-radius: 20px;
  }

  .campus-surface-tile.is-selected {
    border-radius: 24px;
  }

  .campus-surface-tile:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  /* Bounded h/2 pill morphing (40px height -> max 20px radius, never 9999px) */
  .campus-att-btn {
    border-radius: 10px;
    min-height: 40px;
    min-width: 40px;
    transition:
      border-radius 240ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 140ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .campus-att-btn:hover:not(:disabled) {
    border-radius: 14px;
  }

  .campus-att-btn[aria-pressed='true'] {
    border-radius: 20px;
  }

  .campus-att-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .campus-att-btn:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  /* Reserved exclusively for genuinely live in-progress class sessions */
  .campus-live-dot {
    position: relative;
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .campus-live-dot::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 7px;
    background: currentColor;
    opacity: 0.35;
    animation: campus-pulse-halo 2.2s var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)) infinite;
    pointer-events: none;
  }

  @keyframes campus-pulse-halo {
    0%, 100% {
      transform: scale(1);
      opacity: 0.45;
    }
    55% {
      transform: scale(1.75);
      opacity: 0;
    }
  }

  /* Transient View Transition hooks */
  .vt-role-stage {
    view-transition-name: campus-role-stage;
  }

  .vt-roster-active .campus-roster-row {
    view-transition-name: var(--roster-vt-name);
  }

  .vt-assignments-active .campus-assignment-item {
    view-transition-name: var(--assign-vt-name);
  }

  @media (prefers-reduced-motion: reduce) {
    .campus-kpi-card,
    .campus-kpi-btn,
    .campus-surface-tile,
    .campus-att-btn {
      transition: background-color 1ms linear, color 1ms linear;
      transform: none !important;
    }

    .campus-live-dot::after {
      animation: none;
      opacity: 0;
    }
  }

  @media (forced-colors: active) {
    .campus-kpi-btn[aria-pressed='true'],
    .campus-surface-tile.is-selected,
    .campus-att-btn[aria-pressed='true'] {
      border: 2px solid Highlight;
    }
  }
`;
