export interface TokenAnatomyExample {
  readonly id: string;
  readonly label: string;
  readonly category: 'Color' | 'Typography' | 'Shape' | 'Elevation' | 'State';
  readonly refToken: string;
  readonly refValue: string;
  readonly sysToken: string;
  readonly compOrThemeToken: string;
  readonly segments: {
    readonly prefix: string;
    readonly tier: string;
    readonly family: string;
    readonly role: string;
  };
  readonly whyItMatters: string;
}

export interface TonalPaletteFamily {
  readonly id: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutral-variant' | 'error' | 'success' | 'warning';
  readonly name: string;
  readonly hueFormula: string;
  readonly chromaNote: string;
  readonly stops: readonly number[];
}

export interface SurfaceTierSpec {
  readonly name: string;
  readonly sysToken: string;
  readonly tailwindClass: string;
  readonly refLight: string;
  readonly oklchLight: string;
  readonly refDark: string;
  readonly oklchDark: string;
  readonly usage: string;
}

export interface TypefaceFontSpec {
  readonly id: 'brand' | 'plain' | 'mono';
  readonly roleName: string;
  readonly refToken: string;
  readonly fontFamily: string;
  readonly assignedScales: string;
  readonly weightsAvailable: readonly { readonly token: string; readonly weight: number; readonly label: string }[];
  readonly rationale: string;
  readonly sampleGlyphs: string;
}

export interface ApplyingTypeRuleSpec {
  readonly category: 'display' | 'headline' | 'title' | 'body' | 'label';
  readonly title: string;
  readonly icon: string;
  readonly typefaceUsed: 'Brand (Plus Jakarta Sans)' | 'Plain (Plus Jakarta Sans)';
  readonly measureAndWrap: string;
  readonly whenToUse: string;
  readonly avoid: string;
  readonly uiExamples: string;
}

export interface TypescaleSpec {
  readonly category: 'display' | 'headline' | 'title' | 'body' | 'label';
  readonly scale: 'lg' | 'md' | 'sm';
  readonly tokenKey: string;
  readonly label: string;
  readonly typeface: 'Brand' | 'Plain';
  readonly sizePx: string;
  readonly sizeRem: string;
  readonly lineHeightPx: string;
  readonly lineHeightRem: string;
  readonly trackingPx: string;
  readonly baselineWeight: number;
  readonly emphasizedWeight: number;
  readonly baselineClass: string;
  readonly emphasizedClass: string;
  readonly whereToApply: string;
  readonly sampleText: string;
}

export interface ShapeCornerSpec {
  readonly id: string;
  readonly name: string;
  readonly sysToken: string;
  readonly tailwindVar: string;
  readonly value: string;
  readonly isExpressiveNew: boolean;
  readonly usage: string;
}

export interface ShapePrincipleSpec {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly docUrl: string;
  readonly summary: string;
  readonly webApplication: string;
}

export interface ShapeMorphMechanismSpec {
  readonly id: 'corner-morph' | 'polygon-morph';
  readonly badge: string;
  readonly title: string;
  readonly platformScope: string;
  readonly howItWorks: string;
  readonly cssOrSvgTech: string;
  readonly canonicalComponents: readonly string[];
}

export interface ElevationLevelSpec {
  readonly level: number;
  readonly dp: string;
  readonly sysToken: string;
  readonly pairedSurface: string;
  readonly shadowMix: string;
  readonly usage: string;
}

export interface ApplyingElevationPrincipleSpec {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly why: string;
  readonly howToApply: string;
}

export interface ComponentElevationMatrixRow {
  readonly component: string;
  readonly surfaceToken: string;
  readonly restingLevel: string;
  readonly hoverOrFocusLevel: string;
  readonly activeOrDraggedLevel: string;
  readonly reason: string;
}

export interface StateOpacitySpec {
  readonly state: string;
  readonly sysToken: string;
  readonly value: string;
  readonly percentage: string;
  readonly usage: string;
}

export interface StateLayerComponentRecipe {
  readonly id: string;
  readonly componentName: string;
  readonly containerRole: string;
  readonly stateLayerColorRole: string;
  readonly hoverEffect: string;
  readonly focusEffect: string;
  readonly pressEffect: string;
}

export const TOKEN_ANATOMY_EXAMPLES: readonly TokenAnatomyExample[] = [
  {
    id: 'color-primary-container',
    label: 'Color • Primary Container',
    category: 'Color',
    refToken: '--md-ref-palette-primary90 (Light) / --md-ref-palette-primary30 (Dark)',
    refValue: 'oklch(90% 0.06 var(--seed-hue)) / oklch(30% 0.10 var(--seed-hue))',
    sysToken: '--md-sys-color-primary-container',
    compOrThemeToken: '--color-primary-box (bg-primary-box)',
    segments: {
      prefix: 'md',
      tier: 'sys',
      family: 'color',
      role: 'primary-container'
    },
    whyItMatters:
      'El componente pide un "contenedor de énfasis primario" sin saber si el tema es claro, oscuro o de alto contraste. Cambiar entre Light y Dark reasigna automáticamente T90 ↔ T30.'
  },
  {
    id: 'type-headline-md',
    label: 'Typography • Headline Medium',
    category: 'Typography',
    refToken: '--md-ref-typeface-brand + --md-ref-typeface-weight-bold',
    refValue: "'Plus Jakarta Sans' • 400 (Baseline) / 700 (Emphasized)",
    sysToken: '--md-sys-typescale-headline-medium-size (1.75rem / 28px)',
    compOrThemeToken: '.text-headline-md / .text-headline-md-emphasized',
    segments: {
      prefix: 'md',
      tier: 'sys',
      family: 'typescale',
      role: 'headline-medium-size'
    },
    whyItMatters:
      'Separa la fuente física (--md-ref-typeface-brand) de la jerarquía editorial. Permite alternar entre Baseline (400) y Emphasized (700) en M3 Expressive.'
  },
  {
    id: 'shape-xl-increased',
    label: 'Shape • Extra Large Increased (M3 Expressive)',
    category: 'Shape',
    refToken: '32px geometric primitive',
    refValue: '32px',
    sysToken: '--md-sys-shape-corner-extra-large-increased',
    compOrThemeToken: '--radius-m3-xl-inc (rounded-m3-xl-inc)',
    segments: {
      prefix: 'md',
      tier: 'sys',
      family: 'shape',
      role: 'corner-extra-large-increased'
    },
    whyItMatters:
      'Nuevo escalón de 32px introducido en M3 Expressive entre extra-large (28px) y extra-extra-large (48px) para sheets y contenedores expandidos.'
  },
  {
    id: 'elevation-level2',
    label: 'Elevation • Level 2 (3dp)',
    category: 'Elevation',
    refToken: '--md-sys-color-shadow',
    refValue: 'oklch(0% 0 0 / 0.25 Light | 0.65 Dark)',
    sysToken: '--md-sys-elevation-level2',
    compOrThemeToken: '--md-sys-elevation-level2 (.m3-card-elevated:hover) / --shadow-m3-level2',
    segments: {
      prefix: 'md',
      tier: 'sys',
      family: 'elevation',
      role: 'level2'
    },
    whyItMatters:
      'En lugar de usar rgba(0,0,0,0.09) estático, la sombra mezcla --md-sys-color-shadow con color-mix(in oklch), adaptando su densidad en modo oscuro.'
  },
  {
    id: 'state-disabled',
    label: 'State • Disabled Content & Container',
    category: 'State',
    refToken: 'WCAG / M3 interaction primitive (0.38 / 0.12)',
    refValue: '0.38 (content) / 0.12 (container)',
    sysToken: '--md-sys-state-disabled-content-opacity',
    compOrThemeToken: '.m3-btn:disabled / .m3-chip:disabled / .m3-text-field.is-disabled',
    segments: {
      prefix: 'md',
      tier: 'sys',
      family: 'state',
      role: 'disabled-content-opacity'
    },
    whyItMatters:
      'Centraliza la opacidad de estados inactivos (38% texto/icono y 12% contenedor) sin repetir números mágicos en botones, chips e inputs.'
  }
];

export const TONAL_PALETTE_FAMILIES: readonly TonalPaletteFamily[] = [
  {
    id: 'primary',
    name: 'Primary',
    hueFormula: 'var(--seed-hue)',
    chromaNote: 'Croma expresivo pico 0.16 en tonos medios (T40–T80)',
    stops: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]
  },
  {
    id: 'secondary',
    name: 'Secondary',
    hueFormula: 'calc(var(--seed-hue) + 10)',
    chromaNote: 'Croma armónico moderado (0.04–0.05) para filtros y navegación',
    stops: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]
  },
  {
    id: 'tertiary',
    name: 'Tertiary',
    hueFormula: 'calc(var(--seed-hue) + 65)',
    chromaNote: 'Acento complementario vivo (+65°) con croma 0.12–0.13',
    stops: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]
  },
  {
    id: 'neutral',
    name: 'Neutral (Surfaces)',
    hueFormula: 'var(--seed-hue)',
    chromaNote: 'Incluye los tonos intermedios de superficie M3: 4, 6, 12, 17, 22, 24, 87, 92, 94, 96',
    stops: [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100]
  },
  {
    id: 'neutral-variant',
    name: 'Neutral Variant (Outlines)',
    hueFormula: 'var(--seed-hue)',
    chromaNote: 'Croma 0.015–0.020 para bordes (outline), divisores y texto secundario',
    stops: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]
  },
  {
    id: 'error',
    name: 'Error',
    hueFormula: '25° (Coral / Red)',
    chromaNote: 'Semántica universal de alerta crítica (croma 0.22 en T40 / 0.16 en T80)',
    stops: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]
  },
  {
    id: 'success',
    name: 'Success (Custom M3)',
    hueFormula: '155° (Emerald)',
    chromaNote: 'Rol semántico extendido según guía M3 Advanced Custom Colors',
    stops: [10, 20, 30, 40, 80, 90, 100]
  },
  {
    id: 'warning',
    name: 'Warning (Custom M3)',
    hueFormula: '65° (Amber)',
    chromaNote: 'Rol semántico extendido para SLA, stock bajo y advertencias operativas',
    stops: [10, 20, 30, 40, 80, 90, 100]
  }
];

export const SURFACE_HIERARCHY_SPECS: readonly SurfaceTierSpec[] = [
  {
    name: 'Surface Container Lowest',
    sysToken: '--md-sys-color-surface-container-lowest',
    tailwindClass: 'bg-surface-lowest',
    refLight: 'neutral100',
    oklchLight: '100% 0 0',
    refDark: 'neutral4',
    oklchDark: '8% 0.012 H',
    usage: 'Capa profunda mínima, inputs enfocados y pozos visuales'
  },
  {
    name: 'Surface Bright',
    sysToken: '--md-sys-color-surface-bright',
    tailwindClass: 'bg-surface-bright',
    refLight: 'neutral99',
    oklchLight: '99% 0.003 H',
    refDark: 'neutral24',
    oklchDark: '30% 0.028 H',
    usage: 'Superficie más luminosa en Dark Mode para modales y paneles destacados'
  },
  {
    name: 'Surface (Default Canvas)',
    sysToken: '--md-sys-color-surface',
    tailwindClass: 'bg-surface',
    refLight: 'neutral98',
    oklchLight: '98% 0.005 H',
    refDark: 'neutral6',
    oklchDark: '12% 0.016 H',
    usage: 'Lienzo base de toda la aplicación (#app-stage)'
  },
  {
    name: 'Surface Container Low',
    sysToken: '--md-sys-color-surface-container-low',
    tailwindClass: 'bg-surface-low',
    refLight: 'neutral96',
    oklchLight: '96% 0.008 H',
    refDark: 'neutral10',
    oklchDark: '15% 0.018 H',
    usage: 'Navigation Rail, sidebars y tarjetas Elevated (Level 1)'
  },
  {
    name: 'Surface Container',
    sysToken: '--md-sys-color-surface-container',
    tailwindClass: 'bg-surface-box',
    refLight: 'neutral94',
    oklchLight: '93% 0.012 H',
    refDark: 'neutral12',
    oklchDark: '18% 0.022 H',
    usage: 'Contenedor estándar de tarjetas KPI, paneles Bento y listas'
  },
  {
    name: 'Surface Container High',
    sysToken: '--md-sys-color-surface-container-high',
    tailwindClass: 'bg-surface-high',
    refLight: 'neutral92',
    oklchLight: '90% 0.018 H',
    refDark: 'neutral17',
    oklchDark: '22% 0.026 H',
    usage: 'Controles interactivos internos, diálogos y estados hover'
  },
  {
    name: 'Surface Container Highest',
    sysToken: '--md-sys-color-surface-container-highest',
    tailwindClass: 'bg-surface-highest',
    refLight: 'neutral90',
    oklchLight: '86% 0.022 H',
    refDark: 'neutral22',
    oklchDark: '27% 0.030 H',
    usage: 'Tarjetas variante Filled, chips de sugerencia y máximo contraste tonal'
  },
  {
    name: 'Surface Dim',
    sysToken: '--md-sys-color-surface-dim',
    tailwindClass: 'bg-surface-dim',
    refLight: 'neutral87',
    oklchLight: '84% 0.020 H',
    refDark: 'literal dark (10% L < neutral6)',
    oklchDark: '10% 0.014 H',
    usage: 'Plano atenuado exterior / Stage Recess en modo claro y oscuro'
  }
];

/* =====================================================================
   CASO 3: TYPOGRAPHY — FONTS, APPLYING TYPE & 30-STYLE DUAL TYPE SCALE
   ===================================================================== */

export const TYPEFACE_FONT_SPECS: readonly TypefaceFontSpec[] = [
  {
    id: 'brand',
    roleName: 'Brand Typeface (Expresiva / Editorial)',
    refToken: '--md-ref-typeface-brand',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    assignedScales: 'Display (L/M/S) & Headline (L/M/S)',
    weightsAvailable: [
      { token: '--md-ref-typeface-weight-regular', weight: 400, label: 'Regular (Baseline)' },
      { token: '--md-ref-typeface-weight-semibold', weight: 600, label: 'SemiBold (Headline S Emp.)' },
      { token: '--md-ref-typeface-weight-bold', weight: 700, label: 'Bold (Headline L/M Emp.)' },
      { token: '--md-ref-typeface-weight-extrabold', weight: 800, label: 'ExtraBold (Display Emp.)' }
    ],
    rationale:
      'Según m3.material.io/styles/typography/fonts, el token Brand proyecta la personalidad visual en tamaños grandes (24px–57px) donde las aperturas geométricas lucen con nitidez.',
    sampleGlyphs: 'Aa Bb Cc 123 — Diseño Expresivo'
  },
  {
    id: 'plain',
    roleName: 'Plain Typeface (Lectura & UI Funcional)',
    refToken: '--md-ref-typeface-plain',
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    assignedScales: 'Title (L/M/S), Body (L/M/S) & Label (L/M/S)',
    weightsAvailable: [
      { token: '--md-ref-typeface-weight-regular', weight: 400, label: 'Regular (Body Baseline)' },
      { token: '--md-ref-typeface-weight-medium', weight: 500, label: 'Medium (Title/Label Base & Body Emp.)' },
      { token: '--md-ref-typeface-weight-bold', weight: 700, label: 'Bold (Title & Label Emphasized)' }
    ],
    rationale:
      'Asignada a escalas funcionales (11px–22px). En _token.css este proyecto mapea Plain a Plus Jakarta Sans para cohesión editorial, manteniendo el token desacoplado para poder cambiarla por Inter o Roboto desde un solo punto.',
    sampleGlyphs: 'Aa Bb Cc 123 — Legibilidad Operativa'
  },
  {
    id: 'mono',
    roleName: 'Monospace Typeface (Telemetría & Tokens)',
    refToken: '--md-ref-typeface-mono',
    fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
    assignedScales: 'KPIs numéricos, precios POS, relojes SLA y código',
    weightsAvailable: [
      { token: '400', weight: 400, label: 'Regular' },
      { token: '700', weight: 700, label: 'Bold (tabular-nums)' }
    ],
    rationale:
      'Stack monospace del sistema sin descargas externas extra; garantiza ancho fijo tabular para que contadores en vivo, precios y tokens OKLCH no provoquen jitter horizontal.',
    sampleGlyphs: '0123456789 • oklch(42% 0.16 275)'
  }
];

export const APPLYING_TYPE_RULES: readonly ApplyingTypeRuleSpec[] = [
  {
    category: 'display',
    title: '1. Display (57px / 45px / 36px)',
    icon: 'format_size',
    typefaceUsed: 'Brand (Plus Jakarta Sans)',
    measureAndWrap: 'text-wrap: balance • Máximo 1 a 2 líneas cortas',
    whenToUse: 'Reservado para cifras Hero, cabeceras de bienvenida en pantallas anchas (Expanded ≥840dp) o momentos de impacto emocional.',
    avoid: 'Nunca usar en párrafos, diálogos modales ni en listas repetitivas.',
    uiExamples: 'Banner Hero del Dashboard, contador gigante de facturación o puntaje.'
  },
  {
    category: 'headline',
    title: '2. Headline (32px / 28px / 24px)',
    icon: 'title',
    typefaceUsed: 'Brand (Plus Jakarta Sans)',
    measureAndWrap: 'text-wrap: balance • Salto de línea armónico sin viudas',
    whenToUse: 'Encabezados primarios de página y títulos de secciones Bento principales que estructuran el recorrido visual.',
    avoid: 'Evitar usar más de dos niveles de Headline simultáneos en una misma tarjeta.',
    uiExamples: 'Título principal de vista ("Fundamentos M3", "Agenda de Tareas"), cabecera de modal grande.'
  },
  {
    category: 'title',
    title: '3. Title (22px / 16px / 14px)',
    icon: 'subtitles',
    typefaceUsed: 'Plain (Plus Jakarta Sans)',
    measureAndWrap: '1 línea o truncado limpio • Peso 500 (Baseline) / 700 (Emphasized)',
    whenToUse: 'Subdivisiones de jerarquía media: cabeceras de tarjetas operativas, Top App Bars, diálogos de confirmación y cabeceras de grupos.',
    avoid: 'No necesita puntuación final (punto) cuando actúa como rótulo de contenedor.',
    uiExamples: 'Títulos de tarjetas en Kanban KDS, nombres de productos en POS, cabecera de Navigation Drawer.'
  },
  {
    category: 'body',
    title: '4. Body (16px / 14px / 12px)',
    icon: 'subject',
    typefaceUsed: 'Plain (Plus Jakarta Sans)',
    measureAndWrap: 'text-wrap: pretty • Ancho ideal de lectura: 40ch a 75ch (máx 80ch)',
    whenToUse: 'Bloques de lectura sostenida, descripciones técnicas, celdas de tabla, notas clínicas y texto dentro de inputs (Body Large/Medium).',
    avoid: 'Nunca superar los 80 caracteres por línea ni usar texto justificado sin guionado.',
    uiExamples: 'Descripciones de tareas, notas de triaje clínico, supporting text de formularios (Body Small 12px).'
  },
  {
    category: 'label',
    title: '5. Label (14px / 12px / 11px)',
    icon: 'label',
    typefaceUsed: 'Plain (Plus Jakarta Sans)',
    measureAndWrap: 'nowrap • Tracking abierto (+0.1px a +0.5px) para nitidez utilitaria',
    whenToUse: 'Texto funcional dentro de componentes interactivos: botones, chips, badges de estado, destinos del Navigation Rail y etiquetas flotantes.',
    avoid: 'No usar para párrafos de más de una oración.',
    uiExamples: 'Botones M3 (Label Large 14px), Filter Chips, Badges de prioridad (Label Small 11px).'
  }
];

export const TYPESCALES_30_SPECS: readonly TypescaleSpec[] = [
  {
    category: 'display',
    scale: 'lg',
    tokenKey: 'display-large',
    label: 'Display Large',
    typeface: 'Brand',
    sizePx: '57px',
    sizeRem: '3.5625rem',
    lineHeightPx: '64px',
    lineHeightRem: '4rem',
    trackingPx: '-0.25px',
    baselineWeight: 400,
    emphasizedWeight: 800,
    baselineClass: 'text-display-lg',
    emphasizedClass: 'text-display-lg-emphasized',
    whereToApply: 'Cifras Hero monumentales y portadas en pantallas Expanded',
    sampleText: 'Expressive 57'
  },
  {
    category: 'display',
    scale: 'md',
    tokenKey: 'display-medium',
    label: 'Display Medium',
    typeface: 'Brand',
    sizePx: '45px',
    sizeRem: '2.8125rem',
    lineHeightPx: '52px',
    lineHeightRem: '3.25rem',
    trackingPx: '0px',
    baselineWeight: 400,
    emphasizedWeight: 800,
    baselineClass: 'text-display-md',
    emphasizedClass: 'text-display-md-emphasized',
    whereToApply: 'Titulares destacados de impacto y métricas principales',
    sampleText: 'Dynamic Color 45'
  },
  {
    category: 'display',
    scale: 'sm',
    tokenKey: 'display-small',
    label: 'Display Small',
    typeface: 'Brand',
    sizePx: '36px',
    sizeRem: '2.25rem',
    lineHeightPx: '44px',
    lineHeightRem: '2.75rem',
    trackingPx: '0px',
    baselineWeight: 400,
    emphasizedWeight: 700,
    baselineClass: 'text-display-sm',
    emphasizedClass: 'text-display-sm-emphasized',
    whereToApply: 'Hero Card principal en vistas operativas y resúmenes',
    sampleText: 'Spatial Motion 36'
  },
  {
    category: 'headline',
    scale: 'lg',
    tokenKey: 'headline-large',
    label: 'Headline Large',
    typeface: 'Brand',
    sizePx: '32px',
    sizeRem: '2rem',
    lineHeightPx: '40px',
    lineHeightRem: '2.5rem',
    trackingPx: '0px',
    baselineWeight: 400,
    emphasizedWeight: 700,
    baselineClass: 'text-headline-lg',
    emphasizedClass: 'text-headline-lg-emphasized',
    whereToApply: 'Encabezado principal de pantalla (App Header / Page Title)',
    sampleText: 'Arquitectura de Tokens M3 (32px)'
  },
  {
    category: 'headline',
    scale: 'md',
    tokenKey: 'headline-medium',
    label: 'Headline Medium',
    typeface: 'Brand',
    sizePx: '28px',
    sizeRem: '1.75rem',
    lineHeightPx: '36px',
    lineHeightRem: '2.25rem',
    trackingPx: '0px',
    baselineWeight: 400,
    emphasizedWeight: 700,
    baselineClass: 'text-headline-md',
    emphasizedClass: 'text-headline-md-emphasized',
    whereToApply: 'Títulos de bloques Bento y paneles analíticos',
    sampleText: 'Jerarquía Tonal en 5 Contenedores (28px)'
  },
  {
    category: 'headline',
    scale: 'sm',
    tokenKey: 'headline-small',
    label: 'Headline Small',
    typeface: 'Brand',
    sizePx: '24px',
    sizeRem: '1.5rem',
    lineHeightPx: '32px',
    lineHeightRem: '2rem',
    trackingPx: '0px',
    baselineWeight: 400,
    emphasizedWeight: 600,
    baselineClass: 'text-headline-sm',
    emphasizedClass: 'text-headline-sm-emphasized',
    whereToApply: 'Cabeceras de diálogos modales (M3 Basic Dialog) y drawers',
    sampleText: 'Contraste Perceptual OKLCH (24px)'
  },
  {
    category: 'title',
    scale: 'lg',
    tokenKey: 'title-large',
    label: 'Title Large',
    typeface: 'Plain',
    sizePx: '22px',
    sizeRem: '1.375rem',
    lineHeightPx: '28px',
    lineHeightRem: '1.75rem',
    trackingPx: '0px',
    baselineWeight: 400,
    emphasizedWeight: 700,
    baselineClass: 'text-title-lg',
    emphasizedClass: 'text-title-lg-emphasized',
    whereToApply: 'Top App Bar, cabeceras de tarjetas medianas y secciones',
    sampleText: 'Cabecera de Tarjeta Bento o Modal (22px)'
  },
  {
    category: 'title',
    scale: 'md',
    tokenKey: 'title-medium',
    label: 'Title Medium',
    typeface: 'Plain',
    sizePx: '16px',
    sizeRem: '1rem',
    lineHeightPx: '24px',
    lineHeightRem: '1.5rem',
    trackingPx: '+0.15px',
    baselineWeight: 500,
    emphasizedWeight: 700,
    baselineClass: 'text-title-md',
    emphasizedClass: 'text-title-md-emphasized',
    whereToApply: 'Ítems principales de lista, subtítulos de tarjeta y tabs',
    sampleText: 'Subtítulo de Sección Operativa y Paneles (16px)'
  },
  {
    category: 'title',
    scale: 'sm',
    tokenKey: 'title-small',
    label: 'Title Small',
    typeface: 'Plain',
    sizePx: '14px',
    sizeRem: '0.875rem',
    lineHeightPx: '20px',
    lineHeightRem: '1.25rem',
    trackingPx: '+0.1px',
    baselineWeight: 500,
    emphasizedWeight: 700,
    baselineClass: 'text-title-sm',
    emphasizedClass: 'text-title-sm-emphasized',
    whereToApply: 'Agrupadores de menú lateral, cabeceras de tabla y sub-paneles',
    sampleText: 'Título Compacto de Agrupación y Tabla (14px)'
  },
  {
    category: 'body',
    scale: 'lg',
    tokenKey: 'body-large',
    label: 'Body Large',
    typeface: 'Plain',
    sizePx: '16px',
    sizeRem: '1rem',
    lineHeightPx: '24px',
    lineHeightRem: '1.5rem',
    trackingPx: '+0.5px',
    baselineWeight: 400,
    emphasizedWeight: 500,
    baselineClass: 'text-body-lg',
    emphasizedClass: 'text-body-lg-emphasized',
    whereToApply: 'Lectura editorial principal y texto ingresado en Text Fields grandes',
    sampleText: 'Lectura principal de párrafos extensos con interlineado de 24px y tracking abierto (+0.5px).'
  },
  {
    category: 'body',
    scale: 'md',
    tokenKey: 'body-medium',
    label: 'Body Medium',
    typeface: 'Plain',
    sizePx: '14px',
    sizeRem: '0.875rem',
    lineHeightPx: '20px',
    lineHeightRem: '1.25rem',
    trackingPx: '+0.25px',
    baselineWeight: 400,
    emphasizedWeight: 500,
    baselineClass: 'text-body-md',
    emphasizedClass: 'text-body-md-emphasized',
    whereToApply: 'Párrafos secundarios en tarjetas, listas densas y diálogos',
    sampleText: 'Texto operativo estándar en tarjetas, tablas densas y campos de entrada M3 (14px).'
  },
  {
    category: 'body',
    scale: 'sm',
    tokenKey: 'body-small',
    label: 'Body Small',
    typeface: 'Plain',
    sizePx: '12px',
    sizeRem: '0.75rem',
    lineHeightPx: '16px',
    lineHeightRem: '1rem',
    trackingPx: '+0.4px',
    baselineWeight: 400,
    emphasizedWeight: 500,
    baselineClass: 'text-body-sm',
    emphasizedClass: 'text-body-sm-emphasized',
    whereToApply: 'Supporting text de inputs, notas al pie y timestamps secundarios',
    sampleText: 'Texto de soporte, notas al pie y contadores de caracteres en inputs (12px).'
  },
  {
    category: 'label',
    scale: 'lg',
    tokenKey: 'label-large',
    label: 'Label Large',
    typeface: 'Plain',
    sizePx: '14px',
    sizeRem: '0.875rem',
    lineHeightPx: '20px',
    lineHeightRem: '1.25rem',
    trackingPx: '+0.1px',
    baselineWeight: 500,
    emphasizedWeight: 700,
    baselineClass: 'text-label-lg',
    emphasizedClass: 'text-label-lg-emphasized',
    whereToApply: 'Texto dentro de Botones M3, Filter Chips y Navigation Rail expandido',
    sampleText: 'Botón Estándar • Filter Chip • Navigation Item (14px)'
  },
  {
    category: 'label',
    scale: 'md',
    tokenKey: 'label-medium',
    label: 'Label Medium',
    typeface: 'Plain',
    sizePx: '12px',
    sizeRem: '0.75rem',
    lineHeightPx: '16px',
    lineHeightRem: '1rem',
    trackingPx: '+0.5px',
    baselineWeight: 500,
    emphasizedWeight: 700,
    baselineClass: 'text-label-md',
    emphasizedClass: 'text-label-md-emphasized',
    whereToApply: 'Etiquetas en Navigation Bar móvil, Chips compactos y Floating Labels',
    sampleText: 'Badge Semántico • Floating Label Flotado • Botón Compacto (12px)'
  },
  {
    category: 'label',
    scale: 'sm',
    tokenKey: 'label-small',
    label: 'Label Small',
    typeface: 'Plain',
    sizePx: '11px',
    sizeRem: '0.6875rem',
    lineHeightPx: '16px',
    lineHeightRem: '1rem',
    trackingPx: '+0.5px',
    baselineWeight: 500,
    emphasizedWeight: 700,
    baselineClass: 'text-label-sm',
    emphasizedClass: 'text-label-sm-emphasized',
    whereToApply: 'Badges numéricos, indicadores de estado KDS y metadatos compactos',
    sampleText: 'TELEMETRÍA • METADATA COMPACTA • KDS TAG (11PX)'
  }
];

/* =====================================================================
   CASO 4: SHAPE — 10-STEP SCALE, OVERVIEW PRINCIPLES & SHAPE MORPH
   ===================================================================== */

export const SHAPE_CORNER_10_SPECS: readonly ShapeCornerSpec[] = [
  {
    id: 'none',
    name: 'None',
    sysToken: '--md-sys-shape-corner-none',
    tailwindVar: 'rounded-m3-none',
    value: '0px',
    isExpressiveNew: false,
    usage: 'Banners a sangre completa, divisores rectos'
  },
  {
    id: 'xs',
    name: 'Extra Small',
    sysToken: '--md-sys-shape-corner-extra-small',
    tailwindVar: 'rounded-m3-xs',
    value: '4px',
    isExpressiveNew: false,
    usage: 'Checkboxes, tooltips compactos, snackbars'
  },
  {
    id: 'sm',
    name: 'Small',
    sysToken: '--md-sys-shape-corner-small',
    tailwindVar: 'rounded-m3-sm',
    value: '8px',
    isExpressiveNew: false,
    usage: 'Chips compactos, badges cuadrados, menús contextuales'
  },
  {
    id: 'md',
    name: 'Medium',
    sysToken: '--md-sys-shape-corner-medium',
    tailwindVar: 'rounded-m3-md',
    value: '12px',
    isExpressiveNew: false,
    usage: 'Estado morfeado (active/selected) de botones y filter chips'
  },
  {
    id: 'lg',
    name: 'Large',
    sysToken: '--md-sys-shape-corner-large',
    tailwindVar: 'rounded-m3-lg',
    value: '16px',
    isExpressiveNew: false,
    usage: 'Text fields expresivos, tarjetas KPI compactas, FAB mediano'
  },
  {
    id: 'lg-inc',
    name: 'Large Increased',
    sysToken: '--md-sys-shape-corner-large-increased',
    tailwindVar: 'rounded-m3-lg-inc',
    value: '20px',
    isExpressiveNew: true,
    usage: 'M3 Expressive: tarjetas medianas e ítems destacados de galería'
  },
  {
    id: 'xl',
    name: 'Extra Large',
    sysToken: '--md-sys-shape-corner-extra-large',
    tailwindVar: 'rounded-m3-xl',
    value: '28px',
    isExpressiveNew: false,
    usage: 'Tarjetas Bento principales, modales de diálogo, bottom sheets'
  },
  {
    id: 'xl-inc',
    name: 'Extra Large Increased',
    sysToken: '--md-sys-shape-corner-extra-large-increased',
    tailwindVar: 'rounded-m3-xl-inc',
    value: '32px',
    isExpressiveNew: true,
    usage: 'M3 Expressive: contenedores expandidos y sheets de foco'
  },
  {
    id: '2xl',
    name: 'Extra Extra Large',
    sysToken: '--md-sys-shape-corner-extra-extra-large',
    tailwindVar: 'rounded-m3-2xl',
    value: '48px',
    isExpressiveNew: true,
    usage: 'M3 Expressive: superficies Hero monumentales y contenedores inmersivos'
  },
  {
    id: 'full',
    name: 'Full (Pill)',
    sysToken: '--md-sys-shape-corner-full',
    tailwindVar: 'rounded-m3-full',
    value: '9999px',
    isExpressiveNew: false,
    usage: 'Botones en reposo, píldoras del Navigation Rail, barras de búsqueda'
  }
];

export const SHAPE_PRINCIPLES_SPECS: readonly ShapePrincipleSpec[] = [
  {
    id: 'hierarchy',
    icon: 'filter_center_focus',
    title: '1. Dirigir la Atención por Contraste Geométrico',
    docUrl: 'm3.material.io/styles/shape/overview-principles',
    summary:
      'Cuando todas las tarjetas usan radios orgánicos (16px–28px), un botón en píldora (h/2 acotado para morfeo instantáneo) o un chip seleccionado en squircle (8px–12px) destaca inmediatamente sin requerir bordes pesados.',
    webApplication: 'Píldoras Full para acciones primarias frente a contenedores Bento en Extra Large (28px).'
  },
  {
    id: 'optical-nesting',
    icon: 'rounded_corner',
    title: '2. Concentricidad Óptica (Inner + Padding = Outer)',
    docUrl: 'm3.material.io/styles/shape/overview-principles',
    summary:
      'Para evitar que las esquinas internas se vean pellizcadas dentro de una tarjeta padre, el radio exterior debe armonizar con el radio interior más el padding (R_outer ≈ R_inner + padding).',
    webApplication: 'Tarjeta Bento (28px) con padding de 16px aloja controles internos de 12px (Medium).'
  },
  {
    id: 'state-feedback',
    icon: 'animation',
    title: '3. La Geometría como Háptica Visual (Shape Morph)',
    docUrl: 'm3.material.io/styles/shape/shape-morph',
    summary:
      'En lugar de depender solo del cambio de color, M3 Expressive deforma el radio del contenedor al interactuar para transmitir tensión física y confirmar selección incluso a usuarios con daltonismo.',
    webApplication: 'En Web/Desktop reemplaza la vibración háptica del teléfono mediante transiciones elásticas de border-radius.'
  }
];

export const SHAPE_MORPH_MECHANISMS_SPECS: readonly ShapeMorphMechanismSpec[] = [
  {
    id: 'corner-morph',
    badge: 'Web, Desktop & Mobile • Interacción Diaria',
    title: 'Mecanismo A: Corner Radius Morphing (Tensión de Esquinas)',
    platformScope: 'Universal (esencial en Web/Desktop donde no existe vibración háptica física)',
    howItWorks:
      'Interpola border-radius usando resortes espaciales (--md-sys-motion-spring-expressive-fast-spatial). LEY CRÍTICA: nunca animar desde full (9999px) porque CSS interpola numéricamente desde 9999 hasta h/2 generando ~1s de zona muerta visual; siempre usar el radio acotado h/2 (--md-comp-button-shape-pill: 24px ↔ --md-sys-shape-corner-medium: 12px; --md-comp-chip-shape-pill: 16px ↔ --md-sys-shape-corner-small: 8px).',
    cssOrSvgTech:
      'Bounded h/2 CSS border-radius (24px ↔ 12px, 16px ↔ 8px) + var(--md-sys-motion-spring-expressive-fast-spatial)',
    canonicalComponents: [
      'Botones M3 & Button Groups (Píldora acotada 24px → 12px al instante sin dead-zone de 9999px)',
      'Filter Chips & Input Chips (Píldora acotada 16px → 8px al seleccionarse en _chip.css)',
      'Tarjetas Interactivas & Kanban (Large 16px → Extra Large 28px al expandir o arrastrar)',
      'FAB a Extended FAB o Diálogo (Container Transform)'
    ]
  },
  {
    id: 'polygon-morph',
    badge: 'Secuencia Canónica M3E • 7 Polígonos + Circle',
    title: 'Mecanismo B: Polygon / Spline Path Morphing (Geometría Orgánica)',
    platformScope: 'Loading Indicators (<m3-loading-indicator>) y Pull-to-Refresh',
    howItWorks:
      'La biblioteca M3 completa define 35 formas conceptuales, pero por YAGNI en sistemas reales cargamos únicamente las 7 figuras canónicas del Loading Indicator (SoftBurst → Cookie9 → Pentagon convexo → Pill estadio +45° → Sunny → Cookie4 ±45° → Oval +45°) más Circle (+18°) para arrastre determinado. Interpola cada 650ms con física de resorte real (0.6 / 200), +90° por paso y rotación base de 4666ms a N = 180 segmentos Cubic Bézier C fuera de NgZone.',
    cssOrSvgTech:
      'Catmull-Rom Closed Spline de N=180 segmentos C centrados en (24,24) + Spring Physics RAF fuera de NgZone (<m3-loading-indicator>)',
    canonicalComponents: [
      'Loading Indicator (<m3-loading-indicator>) con M3_SOFT_BURST_PATH, M3_COOKIE9_PATH, M3_PENTAGON_PATH, M3_PILL_PATH, M3_SUNNY_PATH, M3_COOKIE4_PATH y M3_OVAL_PATH',
      'Contenedores de Avatar o insignias de celebración (Hero Badges)'
    ]
  }
];

/* =====================================================================
   CASO 5: ELEVATION — 6 LEVELS & APPLYING ELEVATION (WHY / WHEN / HOW)
   ===================================================================== */

export const ELEVATION_6_SPECS: readonly ElevationLevelSpec[] = [
  {
    level: 0,
    dp: '0dp',
    sysToken: '--md-sys-elevation-level0',
    pairedSurface: 'surface / surface-container-highest (Filled)',
    shadowMix: 'none',
    usage: 'Lienzo base, tarjetas Outlined y tarjetas Filled sin sombra'
  },
  {
    level: 1,
    dp: '1dp',
    sysToken: '--md-sys-elevation-level1',
    pairedSurface: 'surface-container-low',
    shadowMix: '28% ambient + 16% key (--md-sys-color-shadow)',
    usage: 'Tarjetas Elevated en reposo, botones Elevated, chips elevados'
  },
  {
    level: 2,
    dp: '3dp',
    sysToken: '--md-sys-elevation-level2',
    pairedSurface: 'surface-container',
    shadowMix: '36% ambient + 20% key (--md-sys-color-shadow)',
    usage: 'Tarjetas Elevated en hover, menús desplegables, barras en scroll'
  },
  {
    level: 3,
    dp: '6dp',
    sysToken: '--md-sys-elevation-level3',
    pairedSurface: 'surface-container-high',
    shadowMix: '44% ambient + 28% key (--md-sys-color-shadow)',
    usage: 'FAB en reposo, diálogos modales, date pickers'
  },
  {
    level: 4,
    dp: '8dp',
    sysToken: '--md-sys-elevation-level4',
    pairedSurface: 'surface-container-high',
    shadowMix: '52% ambient + 36% key (--md-sys-color-shadow)',
    usage: 'FAB en hover, tarjetas arrastradas (dragged state)'
  },
  {
    level: 5,
    dp: '12dp',
    sysToken: '--md-sys-elevation-level5',
    pairedSurface: 'surface-container-highest',
    shadowMix: '60% ambient + 44% key (--md-sys-color-shadow)',
    usage: 'Superficies flotantes críticas y contenedores expandidos al frente'
  }
];

export const APPLYING_ELEVATION_PRINCIPLES: readonly ApplyingElevationPrincipleSpec[] = [
  {
    id: 'tonal-first',
    icon: 'contrast',
    title: '1. ¿Por qué Tono antes que Sombra? (Containment a 0dp)',
    why: 'En M3, abusar de las sombras ensucia las grillas densas y pierde contraste en Modo Oscuro.',
    howToApply:
      'Para agrupar contenido estático en un mismo plano, usá Level 0 (0dp) y diferenciá las cajas exclusivamente con los 5 contenedores tonales (surface-container-lowest → highest) o un borde outline-variant.'
  },
  {
    id: 'scroll-overlap',
    icon: 'swap_vert',
    title: '2. ¿Cuándo activar Sombra? (Superposición y Scroll)',
    why: 'La sombra existe para indicar que una superficie puede deslizarse por debajo de otra o que flota temporalmente sobre el lienzo.',
    howToApply:
      'Una Top App Bar nace en Level 0 (0dp), pero sube a Level 2 (3dp) apenas el contenido hace scroll por debajo. Los menús, popovers y diálogos nacen en Level 2 o Level 3 porque ocluyen el plano base.'
  },
  {
    id: 'interactive-delta',
    icon: 'touch_app',
    title: '3. ¿Cómo comunicar Interacción? (Delta de Elevación)',
    why: 'El cambio de altitud al pasar el mouse o arrastrar le confirma al cerebro qué tarjeta está despegando del lienzo.',
    howToApply:
      'Combiná siempre el velo State Layer (8% hover) con un salto de +1 nivel en hover (Level 1 → Level 2 en Cards/Buttons, Level 3 → Level 4 en FAB) y hasta Level 4 (8dp) durante Drag & Drop.'
  }
];

export const COMPONENT_ELEVATION_MATRIX: readonly ComponentElevationMatrixRow[] = [
  {
    component: 'Filled & Outlined Cards / Paneles Bento',
    surfaceToken: 'surface-container / highest',
    restingLevel: 'Level 0 (0dp)',
    hoverOrFocusLevel: 'Level 1 (1dp) si es interactiva',
    activeOrDraggedLevel: 'Level 3–4 (6–8dp) en Drag',
    reason: 'Separación limpia por color tonal; solo proyecta sombra si el usuario puede abrirla o arrastrarla.'
  },
  {
    component: 'Elevated Card & Elevated Button',
    surfaceToken: 'surface-container-low',
    restingLevel: 'Level 1 (1dp)',
    hoverOrFocusLevel: 'Level 2 (3dp)',
    activeOrDraggedLevel: 'Level 1 (1dp) Press / Level 4 Drag',
    reason: 'Destaca sobre fondos complejos; sube a 3dp en hover y vuelve a 1dp al presionar (simulando empuje físico).'
  },
  {
    component: 'Top App Bar / Sticky Header',
    surfaceToken: 'surface → surface-container',
    restingLevel: 'Level 0 (0dp)',
    hoverOrFocusLevel: 'Level 2 (3dp) en Scroll (On-Scroll)',
    activeOrDraggedLevel: '—',
    reason: 'Evita líneas divisorias permanentes; solo se eleva cuando el contenido pasa por debajo.'
  },
  {
    component: 'Menus, Autocomplete & Popovers',
    surfaceToken: 'surface-container',
    restingLevel: 'Level 2 (3dp)',
    hoverOrFocusLevel: 'Level 2 (3dp)',
    activeOrDraggedLevel: '—',
    reason: 'Flota inmediatamente sobre inputs y botones sin requerir un scrim oscuro de fondo.'
  },
  {
    component: 'Floating Action Button (FAB)',
    surfaceToken: 'primary-container',
    restingLevel: 'Level 3 (6dp)',
    hoverOrFocusLevel: 'Level 4 (8dp)',
    activeOrDraggedLevel: 'Level 3 (6dp) al presionar',
    reason: 'Acción flotante persistente por encima del contenido y de las tarjetas Elevated.'
  },
  {
    component: 'Modal Dialog / Bottom Sheet',
    surfaceToken: 'surface-container-high',
    restingLevel: 'Level 4 (8dp, fallback Level 3) + Scrim',
    hoverOrFocusLevel: 'Level 4 (8dp)',
    activeOrDraggedLevel: 'Level 5 (12dp) en Hero Expandido',
    reason: 'Bloquea el plano inferior mediante Stage Recess / Scrim y concentra todo el foco cognitivo.'
  }
];

/* =====================================================================
   CASO 6: STATE LAYERS (--md-sys-state-*) & HOVER RECIPES BY COMPONENT
   ===================================================================== */

export const STATE_OPACITY_SPECS: readonly StateOpacitySpec[] = [
  {
    state: 'Hover',
    sysToken: '--md-sys-state-hover-state-layer-opacity',
    value: '0.08',
    percentage: '8%',
    usage: 'Velo currentColor al pasar el puntero sobre controles interactivos'
  },
  {
    state: 'Focus',
    sysToken: '--md-sys-state-focus-state-layer-opacity',
    value: '0.10',
    percentage: '10%',
    usage: 'Velo de foco combinado con el anillo dual .focus-ring-m3'
  },
  {
    state: 'Pressed (Active)',
    sysToken: '--md-sys-state-pressed-state-layer-opacity',
    value: '0.12',
    percentage: '12%',
    usage: 'Contacto físico activo + micro-compresión elástica scale(0.975)'
  },
  {
    state: 'Dragged',
    sysToken: '--md-sys-state-dragged-state-layer-opacity',
    value: '0.16',
    percentage: '16%',
    usage: 'Tarjetas Kanban o elementos en arrastre activo (.is-dragged)'
  },
  {
    state: 'Disabled Content',
    sysToken: '--md-sys-state-disabled-content-opacity',
    value: '0.38',
    percentage: '38%',
    usage: 'Opacidad oficial M3 para texto e iconos deshabilitados'
  },
  {
    state: 'Disabled Container',
    sysToken: '--md-sys-state-disabled-container-opacity',
    value: '0.12',
    percentage: '12%',
    usage: 'Mezcla de on-surface al 12% para fondos y bordes deshabilitados'
  }
];

export const STATE_LAYER_COMPONENT_RECIPES: readonly StateLayerComponentRecipe[] = [
  {
    id: 'filled-btn',
    componentName: '1. Botón Filled (Énfasis Alto)',
    containerRole: 'bg-primary (--md-sys-color-primary)',
    stateLayerColorRole: 'on-primary (currentColor)',
    hoverEffect: '8% de on-primary sobre primary (aclara sutilmente en Light, oscurece en Dark) + Level 1 shadow',
    focusEffect: '10% de on-primary + anillo dual .focus-ring-m3',
    pressEffect: '12% de on-primary + scale(0.975) + morph a squircle 12px'
  },
  {
    id: 'tonal-btn',
    componentName: '2. Botón Tonal (Énfasis Medio)',
    containerRole: 'bg-sec-box (--md-sys-color-secondary-container)',
    stateLayerColorRole: 'on-secondary-container (currentColor)',
    hoverEffect: '8% de on-secondary-container sobre secondary-container',
    focusEffect: '10% de on-secondary-container + anillo de foco',
    pressEffect: '12% de on-secondary-container + scale(0.975)'
  },
  {
    id: 'outlined-text-btn',
    componentName: '3. Botón Outlined / Text',
    containerRole: 'transparent (+ border outline)',
    stateLayerColorRole: 'primary (currentColor)',
    hoverEffect: '8% de primary tiñe el fondo transparente con el color semilla',
    focusEffect: '10% de primary + borde primary',
    pressEffect: '12% de primary + scale(0.975)'
  },
  {
    id: 'interactive-card',
    componentName: '4. Tarjeta Interactiva (Elevated / Filled / Outlined)',
    containerRole: 'surface-container-low / highest / surface',
    stateLayerColorRole: 'on-surface (currentColor neutro)',
    hoverEffect: '8% de on-surface (hover neutro que no contamina badges internos) + salto Level 1 → Level 2',
    focusEffect: '10% de on-surface + anillo .focus-ring-m3',
    pressEffect: '12% de on-surface + retorno a Level 1 / 16% en Dragged'
  },
  {
    id: 'filter-chip',
    componentName: '5. Filter Chip (Reposo vs. Seleccionado)',
    containerRole: 'transparent → secondary-container',
    stateLayerColorRole: 'on-surface-variant → on-secondary-container',
    hoverEffect: '8% del texto activo + pre-visualización de borde',
    focusEffect: '10% state layer + focus ring',
    pressEffect: '12% state layer + Shape Morph instantáneo (píldora acotada 16px → 8px)'
  },
  {
    id: 'list-nav-item',
    componentName: '6. Fila de Lista / Ítem de Navegación',
    containerRole: 'transparent → surface-container-high',
    stateLayerColorRole: 'on-surface (currentColor)',
    hoverEffect: '8% de on-surface sobre toda la fila clickeable sin alterar iconos semánticos',
    focusEffect: '10% de on-surface + indicador lateral o focus ring',
    pressEffect: '12% de on-surface'
  }
];
