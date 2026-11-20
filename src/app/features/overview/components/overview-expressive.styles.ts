/**
 * Overview Module — Scoped Material 3 Expressive Motion, Springs & Shape Morphing
 *
 * Consumes `--md-sys-motion-*` and `--md-sys-shape-corner-*` tokens from `src/styles/`.
 * Strictly separates Spatial springs (underdamped rebound on transform / border-radius)
 * from Effects curves (critically damped `1.0` on color / shadow / opacity — zero optical bounce).
 */
export const OVERVIEW_EXPRESSIVE_CSS = /* css */ `
  /* 1. Interactive Pill Links (Ver Agenda / Design System M3) — M3 Spring Corner Morph */
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

  .overview-link-arrow {
    transition: transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial);
  }

  .overview-link-pill:hover .overview-link-arrow {
    transform: translateX(3px);
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

  /* 3. Agenda en Vivo Task Rows — Borderless Tonal Spring Morph */
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

  /* 4. Module Outlined Cards — Spatial Spring Morph (28px -> 20px -> 16px press) + Arrow Spring */
  .overview-module-enter {
    animation: m3ContainerContentIn var(--md-sys-motion-spring-default-spatial-duration, 500ms) var(--md-sys-motion-spring-default-spatial) both;
  }

  .overview-module-link .overview-module-card {
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects),
      background-color var(--md-sys-motion-spring-fast-effects-duration, 150ms) var(--md-sys-motion-spring-fast-effects),
      box-shadow var(--md-sys-motion-spring-default-effects-duration, 200ms) var(--md-sys-motion-spring-default-effects);
  }

  .overview-module-link:hover .overview-module-card,
  .overview-module-link:focus-visible .overview-module-card {
    transform: translateY(-3px);
    border-radius: var(--md-sys-shape-corner-large-increased, 20px);
    border-color: var(--md-sys-color-outline);
    box-shadow: var(--md-sys-elevation-level1);
  }

  .overview-module-link:active .overview-module-card {
    transform: scale(0.982);
    border-radius: var(--md-sys-shape-corner-large, 16px);
    box-shadow: var(--md-sys-elevation-level0);
  }

  .overview-module-icon {
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    transition:
      transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial),
      border-radius var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial);
  }

  .overview-module-link:hover .overview-module-icon,
  .overview-module-link:focus-visible .overview-module-icon {
    transform: scale(1.08) rotate(-3deg);
    border-radius: var(--md-sys-shape-corner-large, 16px);
  }

  .overview-module-arrow {
    transition: transform var(--md-sys-motion-spring-fast-spatial-duration, 350ms) var(--md-sys-motion-spring-fast-spatial);
  }

  .overview-module-link:hover .overview-module-arrow,
  .overview-module-link:focus-visible .overview-module-arrow {
    transform: translateX(4px);
  }

  /* Respect user motion preferences: calm optical dissolves, zero spatial spring bounce */
  @media (prefers-reduced-motion: reduce) {
    .overview-link-pill,
    .overview-link-arrow,
    .overview-hero-kpi-tile,
    .overview-hero-kpi-icon,
    .overview-agenda-row,
    .overview-module-link .overview-module-card,
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
