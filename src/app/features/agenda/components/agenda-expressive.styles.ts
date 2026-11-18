/**
 * Agenda Module — Scoped Material 3 Expressive Styles & Motion Tokens
 *
 * Strictly reserved for domain layout/tile interactions consuming global `--md-sys-*`
 * tokens from `src/styles/`. Standard controls come from `src/app/shared/components/`.
 */
export const AGENDA_EXPRESSIVE_CSS = /* css */ `
  .agenda-workbench {
    interpolate-size: allow-keywords;
  }

  /* Interactive KPI summary tiles (concentric 16px inside container -> 12px active) */
  .agenda-kpi-btn {
    border-radius: var(--md-sys-shape-corner-large, 16px);
    min-height: 44px;
    transition:
      border-radius 260ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .agenda-kpi-btn:hover:not(:disabled) {
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  }

  .agenda-kpi-btn[aria-pressed='true'] {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }

  .agenda-kpi-btn:active:not(:disabled) {
    transform: scale(0.985);
  }

  /* Task cards in grouped agenda list (neutral surface hierarchy + concentric token morph) */
  .agenda-task-tile {
    border-radius: var(--md-sys-shape-corner-large, 16px);
    transition:
      border-radius 280ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .agenda-task-tile:hover {
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  }

  .agenda-task-tile.is-selected {
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  }

  /* In-place container morph (pill <-> expanded quick capture, bounded shape without 9999px deadzone) */
  .agenda-quick-morph {
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
    transition:
      border-radius 300ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      border-color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .agenda-quick-morph.is-expanded {
    border-radius: var(--md-sys-shape-corner-large, 16px);
  }

  /* Grid 0fr <-> 1fr in-place accordion reveal (zero height:auto snap, keeps DOM accessible) */
  .agenda-expand-grid {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 280ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
      opacity 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .agenda-expand-grid.is-open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .agenda-expand-inner {
    overflow: hidden;
    min-height: 0;
  }

  /* Focus Dock card matched to dialog-transform radius (28px) for zero-seam View Transitions */
  .agenda-focus-dock {
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    transition:
      border-color 260ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color 260ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow 260ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  @keyframes agendaPulseDot {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.45;
      transform: scale(0.8);
    }
  }

  .agenda-live-dot {
    animation: agendaPulseDot 1.6s var(--md-sys-motion-easing-standard, ease-in-out) infinite;
  }

  html.vt-running .agenda-live-dot {
    animation-play-state: paused !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .agenda-kpi-btn,
    .agenda-task-tile,
    .agenda-quick-morph,
    .agenda-expand-grid,
    .agenda-focus-dock {
      transition: background-color 1ms linear, color 1ms linear, opacity 1ms linear;
      transform: none !important;
    }

    .agenda-live-dot {
      animation: none !important;
      opacity: 1;
      transform: none;
    }
  }

  @media (forced-colors: active) {
    .agenda-kpi-btn[aria-pressed='true'],
    .agenda-task-tile.is-selected {
      border: 2px solid Highlight;
    }
  }
`;
