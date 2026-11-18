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

  /* Interactive KPI summary tiles (concentric 16px inside 32px/16px-padded container -> 12px active) */
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

  @media (prefers-reduced-motion: reduce) {
    .agenda-kpi-btn,
    .agenda-task-tile {
      transition: background-color 1ms linear, color 1ms linear;
      transform: none !important;
    }
  }

  @media (forced-colors: active) {
    .agenda-kpi-btn[aria-pressed='true'],
    .agenda-task-tile.is-selected {
      border: 2px solid Highlight;
    }
  }
`;
