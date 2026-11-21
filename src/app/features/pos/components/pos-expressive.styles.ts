/**
 * POS Module — Scoped Material 3 Expressive Styles & Adaptive Container Rules
 *
 * Strictly scoped to domain layout, @container responsive reflow, product card tonal states,
 * and native <m3-dialog> overrides for edge-to-edge hero media & thermal receipt presentation.
 */
export const POS_EXPRESSIVE_CSS = /* css */ `
  .pos-catalog-pane,
  .pos-ticket-pane {
    container-type: inline-size;
  }

  /* Adaptive product card grid governed by actual catalog container width */
  .pos-catalog-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  @container (min-width: 440px) {
    .pos-catalog-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @container (min-width: 760px) {
    .pos-catalog-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  /* Product card smooth surface hover without hard outlined borders */
  .pos-product-card {
    transition:
      background-color 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 180ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .pos-product-card:not(.is-selected):not(.is-out-of-stock):hover {
    --md-comp-filled-card-container-color: var(--md-sys-color-surface-container);
    box-shadow: var(--md-sys-elevation-level-1);
  }

  /* Full-width M3 Connected Button Groups in POS Ticket header */
  .pos-ticket-pane m3-button-group:has(.pos-ticket-group) {
    display: block;
    width: 100%;
  }

  .pos-ticket-pane .m3-btn-group.pos-ticket-group {
    display: flex;
    width: 100%;
  }

  .pos-ticket-pane .m3-btn-group.pos-ticket-group > .m3-group-item {
    flex: 1 1 0%;
    min-width: 0;
    --_m3-item-px: 10px;
  }

  /* Compact ticket line adaptation when right pane narrows (< 340px) */
  @container (max-width: 340px) {
    .pos-ticket-line-row {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .pos-ticket-line-controls {
      width: 100%;
      justify-content: space-between;
    }
  }

  /* Customizer modal: full-bleed product photography inside native <dialog>.showModal() */
  dialog.m3-dialog.pos-customizer-dialog > .m3-dialog-inner {
    padding: 0;
    gap: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.pos-customizer-dialog > .m3-dialog-inner > h2 {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    margin: 0;
  }

  dialog.m3-dialog.pos-customizer-dialog > .m3-dialog-inner > .m3-dialog-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  dialog.m3-dialog.pos-customizer-dialog > .m3-dialog-inner > .m3-dialog-footer {
    padding: 1rem 1.5rem;
    background-color: color-mix(in oklch, var(--md-sys-color-surface-container-high) 65%, transparent);
    border-top: 1px solid color-mix(in oklch, var(--md-sys-color-outline-variant) 65%, transparent);
  }

  /* Thermal 80mm receipt modal: crisp print-safe white slip inside native Top Layer */
  dialog.m3-dialog.pos-receipt-dialog {
    width: min(400px, calc(100vw - 2rem));
    background-color: oklch(99% 0.002 90);
    color: oklch(20% 0.01 260);
    border: 1px solid color-mix(in oklch, var(--md-sys-color-outline-variant) 65%, transparent);
  }

  dialog.m3-dialog.pos-receipt-dialog > .m3-dialog-inner {
    gap: 0.75rem;
  }

  dialog.m3-dialog.pos-receipt-dialog > .m3-dialog-inner > h2 {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    margin: 0;
  }

  dialog.m3-dialog.pos-receipt-dialog > .m3-dialog-inner > .m3-dialog-body {
    color: oklch(20% 0.01 260);
  }

  dialog.m3-dialog.pos-receipt-dialog > .m3-dialog-inner > .m3-dialog-footer {
    padding-top: 0.75rem;
    border-top: 1px solid oklch(84% 0.008 260);
  }

  dialog.m3-dialog.pos-receipt-dialog .pos-receipt-dashed {
    border-bottom: 1px dashed oklch(70% 0.01 260);
  }

  dialog.m3-dialog.pos-receipt-dialog .pos-receipt-dashed-top {
    border-top: 1px dashed oklch(70% 0.01 260);
  }

  dialog.m3-dialog.pos-receipt-dialog .pos-receipt-ink-muted {
    color: oklch(42% 0.012 260);
  }

  dialog.m3-dialog.pos-receipt-dialog .pos-receipt-ink-soft {
    color: oklch(34% 0.012 260);
  }

  @media print {
    html:has(dialog.pos-receipt-dialog[open]),
    body:has(dialog.pos-receipt-dialog[open]) {
      height: auto !important;
      overflow: visible !important;
      background: #ffffff !important;
    }

    body:has(dialog.pos-receipt-dialog[open]) #app-stage,
    body:has(dialog.pos-receipt-dialog[open]) app-dialog-container,
    body:has(dialog.pos-receipt-dialog[open]) app-command-palette {
      display: none !important;
    }

    dialog.m3-dialog.pos-receipt-dialog::backdrop {
      display: none !important;
      background: transparent !important;
    }

    dialog.m3-dialog.pos-receipt-dialog[open] {
      position: static !important;
      width: 80mm !important;
      max-width: 100% !important;
      max-height: none !important;
      margin: 0 auto !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: #ffffff !important;
      color: #000000 !important;
      overflow: visible !important;
    }

    dialog.m3-dialog.pos-receipt-dialog > .m3-dialog-inner {
      max-height: none !important;
      padding: 4mm !important;
    }

    dialog.m3-dialog.pos-receipt-dialog > .m3-dialog-inner > .m3-dialog-body {
      overflow: visible !important;
      padding-right: 0 !important;
    }

    dialog.m3-dialog.pos-receipt-dialog > .m3-dialog-inner > .m3-dialog-footer {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pos-product-card {
      transition: background-color 1ms linear, opacity 1ms linear;
      transform: none !important;
    }
  }
`;

