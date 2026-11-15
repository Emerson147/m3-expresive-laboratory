/**
 * Agenda Module — Scoped Material 3 Expressive Styles & Motion Tokens
 *
 * Uses `--md-sys-*` OKLCH tokens from `_token.css`, bounded pill/squircle morphing
 * (never `9999px` dead-zones), clean surface layering without wireframe chrome,
 * and full `prefers-reduced-motion` + `forced-colors` fallbacks.
 */
export const AGENDA_EXPRESSIVE_CSS = /* css */ `
  .agenda-workbench {
    interpolate-size: allow-keywords;
  }

  /* Interactive KPI summary tiles (bounded 24px -> 16px hover -> 12px active) */
  .agenda-kpi-btn {
    border-radius: 24px;
    min-height: 44px;
    transition:
      border-radius 260ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .agenda-kpi-btn:hover:not(:disabled) {
    border-radius: var(--md-sys-shape-corner-large, 16px);
  }

  .agenda-kpi-btn[aria-pressed='true'] {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }

  .agenda-kpi-btn:active:not(:disabled) {
    transform: scale(0.985);
  }

  /* Task cards in grouped agenda list (neutral surface hierarchy + bounded corner morph) */
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
    border-radius: 24px;
  }

  /* Bounded h/2 pill morphing for inline inspector toggles */
  .agenda-pill-toggle {
    border-radius: 18px;
    min-height: 36px;
    transition:
      border-radius 240ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 140ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .agenda-pill-toggle:hover:not(:disabled) {
    border-radius: 14px;
  }

  .agenda-pill-toggle[aria-checked='true'],
  .agenda-pill-toggle[aria-pressed='true'] {
    border-radius: 10px;
  }

  .agenda-pill-toggle:active:not(:disabled) {
    transform: scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    .agenda-kpi-btn,
    .agenda-task-tile,
    .agenda-pill-toggle {
      transition: background-color 1ms linear, color 1ms linear;
      transform: none !important;
    }
  }

  @media (forced-colors: active) {
    .agenda-kpi-btn[aria-pressed='true'],
    .agenda-task-tile.is-selected,
    .agenda-pill-toggle[aria-checked='true'],
    .agenda-pill-toggle[aria-pressed='true'] {
      border: 2px solid Highlight;
    }
  }
`;
