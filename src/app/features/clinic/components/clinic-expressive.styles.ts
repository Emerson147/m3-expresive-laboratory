/**
 * Clinic Module — Scoped Material 3 Expressive Styles & Motion Tokens
 *
 * Loaded with ViewEncapsulation.None on ClinicComponent using genuine `--md-sys-*`
 * design tokens from `_token.css`, OKLCH tonal progression, bounded corner morphing
 * (never 9999px), single live halo reserved strictly for active emergency codes,
 * and transient View Transition hooks with full reduced-motion / forced-colors parity.
 */
export const CLINIC_EXPRESSIVE_CSS = /* css */ `
  .clinic-workbench {
    interpolate-size: allow-keywords;
  }

  /* Dynamic OKLCH N2 (Emergency) role harmonized across Light, Dark, and Seed Hue */
  .clinic-mts-n2 {
    background-color: color-mix(
      in oklch,
      var(--md-sys-color-error-container) 52%,
      var(--md-sys-color-warning-container)
    );
    color: var(--md-sys-color-on-error-container);
  }

  .clinic-mts-n2-dot {
    background-color: color-mix(
      in oklch,
      var(--md-sys-color-error) 60%,
      var(--md-sys-color-warning)
    );
  }

  /* Interactive KPI command cards (bounded 24px -> 16px hover -> 14px active) */
  .clinic-kpi-btn {
    border-radius: 24px;
    min-height: 44px;
    transition:
      border-radius 260ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .clinic-kpi-btn:hover:not(:disabled) {
    border-radius: var(--md-sys-shape-corner-large, 16px);
  }

  .clinic-kpi-btn[aria-pressed='true'] {
    border-radius: 14px;
  }

  .clinic-kpi-btn:active:not(:disabled) {
    transform: scale(0.985);
  }

  .clinic-kpi-btn:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  /* Selectable clinical cards (patient queue rows & bed matrix tiles) */
  .clinic-surface-tile {
    border-radius: var(--md-sys-shape-corner-large, 16px);
    transition:
      border-radius 280ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .clinic-surface-tile:hover:not(:disabled) {
    border-radius: 20px;
  }

  .clinic-surface-tile.is-selected {
    border-radius: 24px;
  }

  .clinic-surface-tile:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  /* Bounded h/2 pill morphing for N1..N5 retriage & discrete form chips */
  .clinic-chip-btn {
    border-radius: 10px;
    min-height: 40px;
    min-width: 40px;
    transition:
      border-radius 240ms var(--md-sys-motion-spring-fast-spatial, cubic-bezier(0.42, 1.67, 0.21, 0.90)),
      background-color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 140ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .clinic-chip-btn:hover:not(:disabled) {
    border-radius: 14px;
  }

  .clinic-chip-btn[aria-pressed='true'] {
    border-radius: 20px;
  }

  .clinic-chip-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .clinic-chip-btn:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  /* Safe viewport centering container for portaled dialogs */
  .clinic-modal-stage {
    display: flex;
    align-items: safe center;
    justify-content: safe center;
  }

  /* High-contrast inactive track for linear progress inside bg-error-box */
  .clinic-code-progress {
    --m3-progress-track: rgba(128, 24, 24, 0.22);
    --m3-progress-track: color-mix(in oklch, var(--md-sys-color-on-error-container) 22%, transparent);
  }

  /* Reserved strictly for active emergency codes (Código Infarto, ACV, Anafilaxia) */
  .clinic-live-dot {
    position: relative;
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .clinic-live-dot::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 7px;
    background: currentColor;
    opacity: 0.35;
    animation: clinic-pulse-halo 2.2s var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)) infinite;
    pointer-events: none;
  }

  @keyframes clinic-pulse-halo {
    0%, 100% {
      transform: scale(1);
      opacity: 0.45;
    }
    55% {
      transform: scale(1.75);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .clinic-kpi-btn,
    .clinic-surface-tile,
    .clinic-chip-btn {
      transition: background-color 1ms linear, color 1ms linear;
      transform: none !important;
    }

    .clinic-live-dot::after {
      animation: none;
      opacity: 0;
    }
  }

  @media (forced-colors: active) {
    .clinic-kpi-btn[aria-pressed='true'],
    .clinic-surface-tile.is-selected,
    .clinic-chip-btn[aria-pressed='true'] {
      border: 2px solid Highlight;
    }
  }
`;
