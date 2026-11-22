/**
 * Clinic Module — Scoped Material 3 Expressive Styles & Motion Tokens
 *
 * Loaded with ViewEncapsulation.None on ClinicComponent using `--md-sys-*` design tokens,
 * OKLCH tonal progression, bounded corner-radius shape morphing (never 9999px),
 * native Top-Layer <m3-dialog> shells, and root-isolated vt-clinic-swap View Transitions.
 */
export const CLINIC_EXPRESSIVE_CSS = /* css */ `
  .clinic-workbench,
  dialog.m3-dialog.clinic-modal-dialog {
    --_s: var(--md-sys-motion-standard);
    --_p: var(--md-sys-motion-spring);
    --_m1: var(--md-sys-motion-duration-medium1);
  }
  .clinic-workbench { interpolate-size: allow-keywords; }
  .clinic-mts-n2 { background: color-mix(in oklch, var(--md-sys-color-error-container) 52%, var(--md-sys-color-warning-container)); color: var(--md-sys-color-on-error-container); }
  .clinic-mts-n2-dot { background: color-mix(in oklch, var(--md-sys-color-error) 60%, var(--md-sys-color-warning)); }
  .clinic-kpi-card { border-radius: var(--md-sys-shape-extra-large); transition: background-color .22s var(--_s), transform .22s var(--_s); &:hover { transform: translateY(-1px); } }
  .clinic-surface-tile, .clinic-chip-btn {
    transition: border-radius .26s var(--_p), background-color .2s var(--_s), color .2s var(--_s), box-shadow .2s var(--_s), transform .16s var(--_s);
  }
  .clinic-surface-tile {
    border-radius: var(--md-sys-shape-large);
    &:hover:not(:disabled) { border-radius: 20px; box-shadow: 0 2px 10px -4px color-mix(in oklch, var(--md-sys-color-on-surface) 14%, transparent); }
    &.state-layer:active:not(:disabled) { transform: scale(.992); }
    &.is-selected { border-radius: 24px; box-shadow: 0 2px 12px -4px color-mix(in oklch, var(--md-sys-color-primary) 26%, transparent); }
  }
  .clinic-chip-btn {
    border-radius: 12px; min-height: 44px; min-width: 44px;
    &:hover:not(:disabled) { border-radius: 16px; }
    &[aria-pressed='true'] { border-radius: 22px; }
    &:active:not(:disabled) { transform: scale(.95); }
  }
  dialog.m3-dialog.clinic-modal-dialog {
    --_dw: 42rem; --_dg: 1.5rem;
    width: min(var(--_dw), calc(100vw - var(--_dg)));
    max-width: min(var(--_dw), calc(100vw - var(--_dg)));
    background: var(--md-sys-color-surface-container);
    &.clinic-modal-sm { --_dw: 34rem; }
    &.clinic-modal-xl { --_dw: 74rem; --_dg: 2rem; }
    > .m3-dialog-inner {
      padding: 0; gap: 0; overflow: hidden;
      > h2 { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); margin: 0; }
      > .m3-dialog-body { padding: 0; display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow: hidden; }
      > .m3-dialog-footer { display: none; }
    }
  }
  .clinic-workbench .m3-btn-group .m3-btn-xs { gap: 6px; }
  m3-button-group.clinic-connected-group-host { display: block !important; width: 100%; }
  .clinic-connected-group { width: 100%; display: flex; flex-wrap: wrap; gap: 4px; }
  @media (min-width: 520px) {
    .clinic-connected-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 3px; }
    .clinic-connected-group .m3-btn { width: 100%; justify-content: center; padding-inline: 10px; }
  }
  .clinic-code-progress { --m3-progress-track: color-mix(in oklch, var(--md-sys-color-on-error-container) 22%, transparent); }
  .clinic-live-dot {
    position: relative; display: inline-block; width: .5rem; height: .5rem; border-radius: 4px; flex-shrink: 0;
    &::after {
      content: ''; position: absolute; inset: -3px; border-radius: 7px; background: currentColor; opacity: .35;
      animation: clinic-pulse-halo 2.2s var(--_s) infinite; pointer-events: none;
    }
  }
  @keyframes clinic-pulse-halo { 0%, 100% { transform: scale(1); opacity: .45; } 55% { transform: scale(1.75); opacity: 0; } }
  html.vt-clinic-swap:not(.theme-transition) {
    view-transition-name: none;
    &::view-transition { pointer-events: none; }
    &::view-transition-old(root) { display: none; animation: none; }
    &::view-transition-new(root) { animation: none; }
  }
  .clinic-chart-tab-thumb {
    position: absolute; inset-block: 0; left: 0; width: calc(100% / 3); border-radius: 24px;
    background: var(--md-sys-color-primary);
    box-shadow: 0 2px 8px -2px color-mix(in oklch, var(--md-sys-color-primary) 38%, transparent);
    pointer-events: none; transform: translateX(calc(var(--clinic-tab-index, 0) * 100%));
    transition: transform var(--_m1) var(--md-sys-motion-spring-standard-fast-spatial-curve);
  }
  :dir(rtl) .clinic-chart-tab-thumb { left: auto; right: 0; transform: translateX(calc(var(--clinic-tab-index, 0) * -100%)); }
  .clinic-chart-tab-btn {
    position: relative; z-index: 1; min-height: 44px; border-radius: 24px; border: 0; background: transparent;
    color: var(--md-sys-color-on-surface-variant); transition: color .18s var(--_s);
    &:hover:not([aria-selected='true']) { color: var(--md-sys-color-on-surface); }
    &[aria-selected='true'] { color: var(--md-sys-color-on-primary); }
  }
  @keyframes clinicLateralPrevIn { from { transform: translateX(-48px); } }
  @keyframes clinicFadeThroughA { from { opacity: 0; transform: scale(.96); } }
  @keyframes clinicFadeThroughB { from { opacity: 0; transform: scale(.96); } }
  .clinic-anim-lateral-next { animation: m3LateralIn var(--_m1) var(--_s) both; }
  .clinic-anim-lateral-prev { animation: clinicLateralPrevIn var(--_m1) var(--_s) both; }
  .clinic-anim-forward { animation: m3ForwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-emphasized) both; }
  .clinic-anim-backward { animation: m3BackwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-emphasized) both; }
  .clinic-anim-fade-a { animation: clinicFadeThroughA var(--_m1) var(--_s) both; }
  .clinic-anim-fade-b { animation: clinicFadeThroughB var(--_m1) var(--_s) both; }
  @media (prefers-reduced-motion: reduce) {
    .clinic-kpi-card, .clinic-surface-tile, .clinic-chip-btn { transition: background-color 1ms linear, color 1ms linear; transform: none !important; }
    .clinic-chart-tab-thumb { transition: transform 1ms linear; }
    .clinic-anim-lateral-next, .clinic-anim-lateral-prev { animation: none; }
    .clinic-anim-forward, .clinic-anim-backward, .clinic-anim-fade-a, .clinic-anim-fade-b { animation: m3ReducedFadeIn .15s linear both; }
    .clinic-live-dot::after { animation: none; opacity: 0; }
  }
  @media (forced-colors: active) {
    .clinic-surface-tile.is-selected, .clinic-chip-btn[aria-pressed='true'], .clinic-chart-tab-btn[aria-selected='true'] { border: 2px solid Highlight; }
  }
`;
