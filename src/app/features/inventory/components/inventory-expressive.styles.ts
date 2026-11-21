/**
 * Scoped Material 3 Expressive styles for the Inventory Atelier & Workbench.
 * Loaded via ViewEncapsulation.None on InventoryComponent so @starting-style,
 * View Transitions pseudo-elements, container queries, and native <m3-dialog>
 * customizations work cleanly without leaking outside `.inv-*` or editing global styles.
 */
export const INVENTORY_EXPRESSIVE_STYLES = /* css */ `
  .inv-workbench {
    interpolate-size: allow-keywords;
  }

  .inv-header-shell {
    container-type: inline-size;
  }

  .inv-scroll-pane {
    scrollbar-gutter: stable;
    overscroll-behavior: contain;
  }

  /* ── View Transitions choreography (Catalog FLIP + Hero lockups) ─────────── */
  ::view-transition {
    pointer-events: none;
  }

  .inv-catalog-item {
    view-transition-class: inv-catalog-item;
  }

  .inv-hero-title {
    width: fit-content;
    max-width: 100%;
  }

  ::view-transition-group(.inv-catalog-item) {
    animation-duration: 320ms;
    animation-timing-function: var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
  }

  ::view-transition-old(.inv-catalog-item):only-child {
    animation: inv-flip-exit 220ms var(--md-sys-motion-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15)) both;
  }

  ::view-transition-new(.inv-catalog-item):only-child {
    animation: inv-flip-enter 340ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)) both;
  }

  @keyframes inv-flip-exit {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.92);
    }
  }

  @keyframes inv-flip-enter {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.94);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ── Shape Morphing Catalog Cards ────────────────────────────────────────── */
  .inv-catalog-card {
    border-radius: var(--radius-m3-lg, 16px);
    transition:
      transform 280ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      border-radius 280ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      background-color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow 260ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
  }

  .inv-catalog-card:hover {
    border-radius: var(--radius-m3-lg-inc, 20px);
    transform: translateY(-1px);
  }

  .inv-catalog-card:active {
    transform: scale(0.985);
    border-radius: var(--radius-m3-md, 12px);
  }

  .inv-catalog-card.is-selected {
    border-radius: var(--radius-m3-xl, 28px);
  }

  /* ── Matrix Header & Summary Container Adaptation ────────────────────────── */
  @container (inline-size < 740px) {
    .inv-matrix-summary-layout {
      flex-direction: column;
      align-items: stretch;
    }

    .inv-matrix-summary-controls {
      justify-content: space-between;
    }
  }

  /* ── Organic Expressive Matrix Cells ─────────────────────────────────────── */
  .inv-matrix-cell {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-m3-lg, 16px);
    transition:
      transform 280ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      border-radius 280ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      background-color 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      opacity 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow 220ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .inv-matrix-cell:hover {
    transform: translateY(-1px);
    border-radius: var(--radius-m3-lg-inc, 20px);
    box-shadow: var(--shadow-m3-level1, 0 2px 8px rgba(0, 0, 0, 0.06));
  }

  .inv-matrix-cell:active {
    transform: scale(0.98);
    border-radius: var(--radius-m3-md, 12px);
  }

  .inv-matrix-revealed .inv-matrix-cell {
    animation: inv-matrix-reveal 360ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)) both;
    animation-delay: min(calc(var(--cell-index, 0) * 18ms), 220ms);
  }

  @keyframes inv-matrix-reveal {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ── M3 Expressive Side Sheet (Docked 2xl / Trailing Scrim < 2xl) ────────── */
  .inv-side-sheet-scrim {
    transition:
      opacity 260ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
      display 260ms allow-discrete;
  }

  @starting-style {
    .inv-side-sheet-scrim {
      opacity: 0;
    }
  }

  .inv-side-sheet-panel {
    transition:
      transform 340ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
      opacity 260ms var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
      display 340ms allow-discrete;
  }

  @starting-style {
    .inv-side-sheet-panel {
      opacity: 0;
      transform: translateX(28px) scale(0.98);
    }
  }

  /* ── Native Top-Layer <m3-dialog> Shells (Product Studio & Transfer) ─────── */
  dialog.m3-dialog.inv-studio-dialog {
    width: min(64rem, calc(100vw - 1.5rem));
    max-width: min(64rem, calc(100vw - 1.5rem));
    background-color: var(--md-sys-color-surface-container);
  }

  dialog.m3-dialog.inv-transfer-dialog {
    width: min(36rem, calc(100vw - 2rem));
    max-width: min(36rem, calc(100vw - 2rem));
    background-color: var(--md-sys-color-surface-container);
  }

  dialog.m3-dialog.inv-studio-dialog > .m3-dialog-inner,
  dialog.m3-dialog.inv-transfer-dialog > .m3-dialog-inner {
    padding: 0;
    gap: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.inv-studio-dialog > .m3-dialog-inner > h2,
  dialog.m3-dialog.inv-transfer-dialog > .m3-dialog-inner > h2 {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    margin: 0;
  }

  dialog.m3-dialog.inv-studio-dialog > .m3-dialog-inner > .m3-dialog-body,
  dialog.m3-dialog.inv-transfer-dialog > .m3-dialog-inner > .m3-dialog-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.inv-studio-dialog > .m3-dialog-inner > .m3-dialog-footer,
  dialog.m3-dialog.inv-transfer-dialog > .m3-dialog-inner > .m3-dialog-footer {
    padding: 0.75rem 1.5rem 1.25rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  /* ── Studio Swatch Corner Morph (12px -> 28px) ───────────────────────────── */
  .inv-swatch-tile {
    border-radius: var(--radius-m3-md, 12px);
    transition:
      transform 280ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      border-radius 320ms var(--md-sys-motion-spring-expressive-fast-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
      background-color 200ms ease,
      box-shadow 220ms ease;
  }

  .inv-swatch-tile:hover {
    transform: translateY(-1px) scale(1.02);
    border-radius: var(--radius-m3-lg-inc, 20px);
  }

  .inv-swatch-tile[aria-pressed="true"],
  .inv-swatch-tile.is-selected {
    border-radius: var(--radius-m3-xl, 28px);
    transform: scale(1.03);
  }

  /* ── Accessibility & Reduced Motion ──────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .inv-catalog-card,
    .inv-matrix-cell,
    .inv-side-sheet-scrim,
    .inv-side-sheet-panel,
    .inv-swatch-tile {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-delay: 0ms !important;
      transform: none !important;
    }

    ::view-transition-group(.inv-catalog-item),
    ::view-transition-old(.inv-catalog-item):only-child,
    ::view-transition-new(.inv-catalog-item):only-child {
      animation-duration: 0.01ms !important;
    }
  }

  @media (forced-colors: active) {
    .inv-catalog-card,
    .inv-matrix-cell,
    .inv-swatch-tile,
    .inv-side-sheet-panel {
      border: 1px solid CanvasText;
    }

    .inv-catalog-card.is-selected,
    .inv-swatch-tile.is-selected {
      outline: 2px solid Highlight;
    }
  }
`;
