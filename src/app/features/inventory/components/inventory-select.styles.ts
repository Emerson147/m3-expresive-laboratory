/**
 * Shared M3 Expressive Select styling helper for Inventory dialogs.
 * Implements `appearance: base-select` top-layer picker progressive enhancement
 * backed by M3 OKLCH surface/outline/typography tokens, with safe fallback for
 * engines without customizable `<select>` support.
 */
export const INVENTORY_SELECT_STYLES = `
  .m3-select {
    appearance: auto;
    inline-size: 100%;
    min-block-size: 44px;
    padding-inline: 0.75rem;
    padding-block: 0.625rem;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--md-sys-color-outline);
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-surface);
    font-family: var(--md-ref-typeface-plain);
    font-size: var(--md-sys-typescale-body-medium-size);
    line-height: var(--md-sys-typescale-body-medium-line-height);
    letter-spacing: var(--md-sys-typescale-body-medium-tracking);
    font-weight: 500;
    cursor: pointer;
    transition:
      border-color var(--md-sys-motion-duration-short3) var(--md-sys-motion-spring-fast-effects-curve),
      background-color var(--md-sys-motion-duration-short3) var(--md-sys-motion-spring-fast-effects-curve);
  }

  .m3-select:hover:not(:disabled) {
    border-color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container);
  }

  .m3-select:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  @supports (appearance: base-select) {
    .m3-select,
    .m3-select::picker(select) {
      appearance: base-select;
    }

    .m3-select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .m3-select::picker-icon {
      flex-shrink: 0;
      color: var(--md-sys-color-on-surface-variant);
      transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate);
    }

    .m3-select:open::picker-icon {
      transform: rotate(180deg);
    }

    .m3-select::picker(select) {
      margin-block-start: 0.25rem;
      padding: 0.375rem;
      border-radius: var(--md-sys-shape-corner-large);
      border: 1px solid var(--md-sys-color-outline-variant);
      background-color: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface);
      box-shadow: var(--md-sys-elevation-level2);
      min-inline-size: anchor-size(inline);
      opacity: 1;
      transform: translateY(0) scale(1);
      transition:
        opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
        transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
        display var(--md-sys-motion-duration-short4) allow-discrete,
        overlay var(--md-sys-motion-duration-short4) allow-discrete;
    }

    @starting-style {
      .m3-select::picker(select):popover-open {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
      }
    }

    .m3-select option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding-inline: 0.75rem;
      padding-block: 0.5rem;
      border-radius: var(--md-sys-shape-corner-small);
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-body-medium-size);
      cursor: pointer;
      transition: background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
    }

    .m3-select option:hover:not(:disabled),
    .m3-select option:focus-visible:not(:disabled) {
      background-color: color-mix(in oklch, var(--md-sys-color-on-surface) 8%, transparent);
    }

    .m3-select option:checked {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-weight: 600;
    }

    .m3-select option::checkmark {
      color: var(--md-sys-color-primary);
      font-weight: 700;
    }

    .m3-select option:disabled {
      color: color-mix(in oklch, var(--md-sys-color-on-surface) 38%, transparent);
      cursor: not-allowed;
    }
  }

  /* Filled M3 Select Wrapper matching <m3-text-field variant="filled"> 58px geometry */
  /* Scoped name (.inv-filled-select) avoids colliding with global _text-field.css .m3-select-field */
  .inv-filled-select {
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
    background-image: none;
    box-shadow: inset 0 1px 2px color-mix(in srgb, var(--md-sys-color-shadow) 5%, transparent);
    transition:
      background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard),
      border-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard),
      box-shadow var(--md-sys-motion-duration-medium1, 250ms) var(--md-sys-motion-easing-standard);
  }

  .inv-filled-select:hover {
    background-color: var(--md-sys-color-surface-container);
    border-color: color-mix(in oklch, var(--md-sys-color-outline) 60%, var(--md-sys-color-outline-variant));
  }

  .inv-filled-select:focus-within {
    background-color: var(--md-sys-color-surface-container-lowest);
    border-color: var(--md-sys-color-primary);
    box-shadow:
      0 0 0 3.5px color-mix(in oklch, var(--md-sys-color-primary) 20%, transparent),
      inset 0 1px 1px color-mix(in srgb, var(--md-sys-color-shadow) 3%, transparent);
  }

  .inv-filled-select__label {
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
    transition: color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard);
  }

  .inv-filled-select:focus-within .inv-filled-select__label {
    color: var(--md-sys-color-primary);
  }

  .inv-filled-select .m3-select {
    box-sizing: border-box;
    min-inline-size: 0;
    min-block-size: 56px;
    padding-block: 22px 8px;
    padding-inline: 18px 12px;
    border: none;
    border-radius: inherit;
    background-color: transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: var(--md-sys-typescale-body-medium-font, inherit);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    font-weight: var(--md-sys-typescale-body-medium-emphasized-weight, 500);
  }

  .inv-filled-select .m3-select:hover:not(:disabled) {
    border-color: transparent;
    background-color: transparent;
  }

  .inv-filled-select .m3-select:focus-visible {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .m3-select,
    .m3-select::picker-icon,
    .m3-select::picker(select),
    .m3-select option,
    .inv-filled-select,
    .inv-filled-select__label {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .m3-select,
    .m3-select::picker(select),
    .inv-filled-select {
      border-color: ButtonText;
      background-color: Field;
      color: FieldText;
    }

    .inv-filled-select .m3-select:focus-visible {
      outline: 3px solid Highlight;
    }
  }
`;

