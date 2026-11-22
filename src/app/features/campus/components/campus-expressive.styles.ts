/**
 * Campus Module — Scoped Material 3 Expressive Styles & Motion Tokens
 *
 * Loaded with ViewEncapsulation.None on CampusComponent using `--md-sys-*` design tokens,
 * OKLCH tonal stepping, bounded corner-radius shape morphing (never 9999px),
 * native Top-Layer <m3-dialog> shells, and root-isolated vt-campus-swap View Transitions.
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

  /* Bounded h/2 pill morphing (44px height -> max 22px radius, never 9999px) */
  .campus-att-btn {
    border-radius: 12px;
    min-height: 44px;
    min-width: 44px;
    transition:
      border-radius 240ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 140ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .campus-att-btn:hover:not(:disabled) {
    border-radius: 16px;
  }

  .campus-att-btn[aria-pressed='true'] {
    border-radius: 22px;
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

  /* ── Top-Layer M3 Native Modal Dialog Shells (<m3-dialog>) ─────────────── */
  dialog.m3-dialog.campus-modal-dialog {
    width: min(38rem, calc(100vw - 1.5rem));
    max-width: min(38rem, calc(100vw - 1.5rem));
    background-color: var(--md-sys-color-surface-container);
  }

  dialog.m3-dialog.campus-modal-dialog > .m3-dialog-inner {
    padding: 0;
    gap: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.campus-modal-dialog > .m3-dialog-inner > h2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    margin: 0;
  }

  dialog.m3-dialog.campus-modal-dialog > .m3-dialog-inner > .m3-dialog-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.campus-modal-dialog > .m3-dialog-inner > .m3-dialog-footer {
    padding: 0;
    display: none;
  }

  /* Full-width connected button-group containers inside Campus modals */
  m3-button-group.campus-connected-group-host {
    display: block !important;
    width: 100%;
  }

  .campus-connected-group {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  @media (min-width: 520px) {
    .campus-connected-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
      gap: 3px;
    }

    .campus-connected-group .m3-btn {
      width: 100%;
      justify-content: center;
      padding-inline: 10px;
    }
  }

  /* ── Scoped View Transitions (Suppress root cross-fade flicker) ────────── */
  html.vt-campus-swap:not(.theme-transition) {
    view-transition-name: none;
  }

  html.vt-campus-swap:not(.theme-transition)::view-transition {
    pointer-events: none;
  }

  html.vt-campus-swap:not(.theme-transition)::view-transition-old(root) {
    display: none;
    animation: none;
  }

  html.vt-campus-swap:not(.theme-transition)::view-transition-new(root) {
    animation: none;
  }

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
