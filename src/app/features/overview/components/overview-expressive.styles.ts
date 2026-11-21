/**
 * Overview Module — Scoped Material 3 Expressive Motion, Springs & Shape Morphing
 *
 * Consumes `--md-sys-motion-*` and `--md-sys-shape-corner-*` tokens from `src/styles/`.
 * Strictly separates Spatial springs (underdamped rebound on transform / border-radius)
 * from Effects curves (critically damped `1.0` on color / shadow / opacity — zero optical bounce).
 */
export const OVERVIEW_EXPRESSIVE_CSS = /* css */ `
  /* 1. Interactive Link Pills & Container-Aware Live Agenda */
  .overview-link-pill {
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      background-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects),
      color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects);
  }

  .overview-link-pill:hover {
    transform: translateY(-1px);
  }

  .overview-link-pill:active {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    transform: scale(0.96);
  }

  .overview-agenda-container {
    container-type: inline-size;
  }

  /* 2. Hero Bento Mini-KPI Tiles — Concentric Spring Lift & Icon Rebound */
  .overview-hero-kpi-tile {
    border-radius: var(--md-sys-shape-corner-large, 16px);
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      background-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects),
      border-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects);
  }

  .overview-hero-kpi-tile:hover {
    transform: translateY(-2px);
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
    border-color: var(--md-sys-color-primary);
  }

  .overview-hero-kpi-icon {
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial);
  }

  .overview-hero-kpi-tile:hover .overview-hero-kpi-icon {
    transform: scale(1.08) rotate(-4deg);
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }

  /* 3. Agenda en Vivo Task Rows — Borderless Tonal Spring Morph + @container adaptation */
  .overview-agenda-row {
    border-radius: var(--md-sys-shape-corner-large, 16px);
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      background-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects),
      color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects);
  }

  .overview-agenda-row:hover {
    transform: translateY(-1px);
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  }

  .overview-agenda-row:active {
    transform: scale(0.99);
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }

  @container (max-width: 340px) {
    .overview-agenda-row {
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .overview-agenda-priority {
      margin-inline-start: 2.5rem;
    }
  }

  /* 4. Module Tonal Filled Bento Grid — Equal-Height Cards + @container + Stretched Link */
  .overview-modules-bento {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
    align-items: stretch;
  }

  @media (min-width: 768px) {
    .overview-modules-bento {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .overview-modules-bento {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .overview-module-slot {
    min-width: 0;
    height: 100%;
  }

  .overview-module-enter {
    animation: m3ContainerContentIn var(--md-sys-motion-spring-default-spatial-duration, 500ms) var(--md-sys-motion-spring-default-spatial) both;
  }

  .overview-module-card {
    position: relative;
    container-type: inline-size;
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      background-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects),
      box-shadow var(--md-sys-motion-spring-default-effects-duration, 200ms) var(--md-sys-motion-spring-default-effects);
  }

  .overview-module-stretched-link {
    outline: none;
  }

  .overview-module-stretched-link::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
  }

  .overview-module-card:has(.overview-module-stretched-link:hover),
  .overview-module-card:has(.overview-module-stretched-link:focus-visible) {
    --md-comp-filled-card-container-color: var(--md-sys-color-surface-container);
    transform: translateY(-3px);
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
    box-shadow: var(--md-sys-elevation-level1);
  }

  .overview-module-card:has(.overview-module-stretched-link:focus-visible) {
    outline: 2px solid transparent;
    box-shadow:
      0 0 0 2px var(--md-sys-color-surface),
      0 0 0 4px var(--md-sys-color-primary);
  }

  .overview-module-card:has(.overview-module-stretched-link:active) {
    transform: scale(0.982);
    border-radius: var(--md-sys-shape-corner-large, 16px);
    box-shadow: var(--md-sys-elevation-level0);
  }

  .overview-module-footer-pill {
    transition: background-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects);
  }

  .overview-module-card:has(.overview-module-stretched-link:hover) .overview-module-footer-pill,
  .overview-module-card:has(.overview-module-stretched-link:focus-visible) .overview-module-footer-pill {
    background-color: var(--md-sys-color-surface-container-high);
  }

  .overview-module-icon {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial);
  }

  .overview-module-card:has(.overview-module-stretched-link:hover) .overview-module-icon,
  .overview-module-card:has(.overview-module-stretched-link:focus-visible) .overview-module-icon {
    transform: scale(1.08) rotate(-3deg);
    border-radius: var(--md-sys-shape-corner-large, 16px);
  }

  .overview-module-arrow {
    transition: transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial);
  }

  .overview-module-card:has(.overview-module-stretched-link:hover) .overview-module-arrow,
  .overview-module-card:has(.overview-module-stretched-link:focus-visible) .overview-module-arrow {
    transform: translateX(4px);
  }

  @container (max-width: 280px) {
    .overview-module-header-band {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (forced-colors: active) {
    .overview-module-card:has(.overview-module-stretched-link:focus-visible) {
      outline: 3px solid Highlight;
      outline-offset: 2px;
      box-shadow: none;
    }
  }

  /* Respect user motion preferences: calm optical dissolves, zero spatial spring bounce */
  @media (prefers-reduced-motion: reduce) {
    .overview-link-pill,
    .overview-hero-kpi-tile,
    .overview-hero-kpi-icon,
    .overview-agenda-row,
    .overview-module-card,
    .overview-module-footer-pill,
    .overview-module-icon,
    .overview-module-arrow {
      transition: background-color 150ms linear, color 150ms linear, border-color 150ms linear, box-shadow 150ms linear;
      transform: none !important;
    }

    .overview-module-enter {
      animation: m3ReducedFadeIn 150ms linear both;
    }
  }
`;
