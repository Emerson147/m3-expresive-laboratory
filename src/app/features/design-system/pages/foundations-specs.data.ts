import { WindowHeightClass, WindowSizeClass } from '../../../core/layout/adaptive-layout.service';

export interface WidthBreakpointSpec {
  readonly id: WindowSizeClass;
  readonly label: string;
  readonly rangeDp: string;
  readonly marginDp: number;
  readonly spacerDp: number;
  readonly panesLabel: string;
  readonly navigationChrome: string;
  readonly sampleWidthPx: number;
  readonly devices: string;
  readonly appMapping: string;
}

export interface HeightBreakpointSpec {
  readonly id: WindowHeightClass;
  readonly label: string;
  readonly rangeDp: string;
  readonly devices: string;
  readonly layoutImpact: string;
}

export interface CanonicalLayoutSpec {
  readonly id: 'list-detail' | 'supporting-pane' | 'feed';
  readonly name: string;
  readonly docUrl: string;
  readonly summary: string;
  readonly compactBehavior: string;
  readonly expandedBehavior: string;
  readonly appRoutes: string;
}

export interface RtlIconRuleSpec {
  readonly icon: string;
  readonly label: string;
  readonly shouldMirror: boolean;
  readonly cssLogicalExample: string;
  readonly reason: string;
}

export interface InputModalitySpec {
  readonly id: 'touch' | 'pointer' | 'keyboard' | 'screen-reader';
  readonly icon: string;
  readonly title: string;
  readonly targetRule: string;
  readonly selectionPattern: string;
  readonly webPlatformRule: string;
}

export interface A11yFoundationSpec {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly m3Rule: string;
  readonly implementationDetail: string;
  readonly antiPattern: string;
}

export interface ContentDesignPair {
  readonly category: string;
  readonly badCopy: string;
  readonly goodCopy: string;
  readonly rationale: string;
}

export interface MaterialGlossaryTerm {
  readonly letter: string;
  readonly term: string;
  readonly category: 'Layout' | 'Interaction' | 'Accessibility' | 'Content' | 'Styles & Motion (Ref)';
  readonly definition: string;
  readonly whereUsed: string;
}

/* =====================================================================
   CASO 1: LAYOUT — 5 BREAKPOINTS, MARGINS, CANONICAL LAYOUTS & LTR/RTL
   ===================================================================== */

export const WIDTH_BREAKPOINT_5_SPECS: readonly WidthBreakpointSpec[] = [
  {
    id: 'compact',
    label: 'Compact',
    rangeDp: '< 600dp',
    marginDp: 16,
    spacerDp: 16,
    panesLabel: '1 panel',
    navigationChrome: 'Bottom Navigation Bar / Floating Dock',
    sampleWidthPx: 375,
    devices: 'Teléfonos en vertical, ventanas divididas angostas',
    appMapping: 'Modo Dock inferior + columna única en Agenda, POS y Clínica'
  },
  {
    id: 'medium',
    label: 'Medium',
    rangeDp: '600dp – 839dp',
    marginDp: 24,
    spacerDp: 24,
    panesLabel: '1 – 2 paneles',
    navigationChrome: 'Navigation Rail (80dp)',
    sampleWidthPx: 720,
    devices: 'Tablets en vertical, plegables desplegados, ventanas medias',
    appMapping: 'Navigation Rail lateral + tarjetas Bento en 2 columnas'
  },
  {
    id: 'expanded',
    label: 'Expanded',
    rangeDp: '840dp – 1199dp',
    marginDp: 24,
    spacerDp: 24,
    panesLabel: '2 paneles simultáneos',
    navigationChrome: 'Navigation Rail / Modal Drawer',
    sampleWidthPx: 1024,
    devices: 'Tablets en horizontal, laptops compactas',
    appMapping: 'List-Detail o Supporting Pane (ej. Catálogo POS + Ticket lateral)'
  },
  {
    id: 'large',
    label: 'Large (M3E)',
    rangeDp: '1200dp – 1599dp',
    marginDp: 24,
    spacerDp: 24,
    panesLabel: '2 paneles amplios',
    navigationChrome: 'Expanded Rail / Persistent Drawer (240dp+)',
    sampleWidthPx: 1366,
    devices: 'Notebooks estándar y monitores de escritorio',
    appMapping: 'Rail expandido con submenús + Grilla Bento de 12 columnas'
  },
  {
    id: 'extra-large',
    label: 'Extra-Large (M3E)',
    rangeDp: '≥ 1600dp',
    marginDp: 24,
    spacerDp: 24,
    panesLabel: '2 – 3 paneles',
    navigationChrome: 'Persistent Drawer + contenedor max-width acotado',
    sampleWidthPx: 1680,
    devices: 'Monitores ultrawide y estaciones de trabajo',
    appMapping: 'Tres paneles (Nav + Contenido principal + Panel de detalle/inspección)'
  }
];

export const HEIGHT_BREAKPOINT_3_SPECS: readonly HeightBreakpointSpec[] = [
  {
    id: 'compact',
    label: 'Compact Height',
    rangeDp: '< 480dp',
    devices: 'Teléfonos en horizontal (landscape)',
    layoutImpact: 'Evitar Top App Bars altos; mover navegación a Navigation Rail lateral para no devorar altura.'
  },
  {
    id: 'medium',
    label: 'Medium Height',
    rangeDp: '480dp – 899dp',
    devices: 'Teléfonos en vertical, laptops 13–14"',
    layoutImpact: 'Altura estándar operativa: barras compactas y scroll interno desacoplado por panel.'
  },
  {
    id: 'expanded',
    label: 'Expanded Height',
    rangeDp: '≥ 900dp',
    devices: 'Tablets en vertical y monitores grandes',
    layoutImpact: 'Permite cabeceras hero expresivas y paneles apilados sin ocultar controles primarios.'
  }
];

export const CANONICAL_LAYOUT_SPECS: readonly CanonicalLayoutSpec[] = [
  {
    id: 'list-detail',
    name: '1. List-Detail',
    docUrl: 'm3.material.io/foundations/layout/canonical-layouts/list-detail',
    summary: 'Divide una lista seleccionable y el detalle completo del ítem activo en dos paneles acoplados.',
    compactBehavior: 'Navegación en dos pasos: primero se muestra la lista (1 panel); al elegir un ítem abre el detalle.',
    expandedBehavior: 'Panel izquierdo (35%–40% ancho) con la lista + Spacer 24dp + Panel derecho (60%–65%) con el detalle.',
    appRoutes: 'Clínica & Triaje (cola de pacientes + ficha clínica), Agenda de Tareas'
  },
  {
    id: 'supporting-pane',
    name: '2. Supporting Pane',
    docUrl: 'm3.material.io/foundations/layout/canonical-layouts/supporting-pane',
    summary: 'Un foco de trabajo principal (~65–70%) acompañado por un panel auxiliar persistente de herramientas o resumen.',
    compactBehavior: 'El contenido principal ocupa el 100% y el panel auxiliar pasa a un Bottom Sheet o pestaña.',
    expandedBehavior: 'Área de trabajo principal a la izquierda + Spacer 24dp + Panel de soporte fijo a la derecha.',
    appRoutes: 'Punto de Venta POS (Catálogo 8 cols + Ticket 4 cols), Editor con propiedades'
  },
  {
    id: 'feed',
    name: '3. Feed (Bento / Collection Grid)',
    docUrl: 'm3.material.io/foundations/layout/canonical-layouts/feed',
    summary: 'Grilla responsiva adaptable de tarjetas de información homogéneas o modulares (Bento) que fluyen según columnas.',
    compactBehavior: '1 columna vertical apilada con margen externo de 16dp.',
    expandedBehavior: '2 a 4 columnas adaptables con márgenes/gutters de 24dp y tarjetas destacadas.',
    appRoutes: 'Dashboard Overview, Campus Académico, Inventario & Telemetría'
  }
];

export const RTL_ICON_RULES: readonly RtlIconRuleSpec[] = [
  {
    icon: 'arrow_back',
    label: 'Flechas de navegación',
    shouldMirror: true,
    cssLogicalExample: 'padding-inline-start: 1rem; margin-inline-end: 0.5rem;',
    reason: 'Representan dirección de lectura o avance/retroceso temporal; en RTL (árabe/hebreo) deben invertirse.'
  },
  {
    icon: 'format_list_bulleted',
    label: 'Listas / Texto alineado',
    shouldMirror: true,
    cssLogicalExample: 'text-align: start; border-inline-start: 3px solid;',
    reason: 'Indican alineación al inicio de línea (inline-start), no izquierda física.'
  },
  {
    icon: 'schedule',
    label: 'Relojes y tiempo',
    shouldMirror: false,
    cssLogicalExample: 'Siempre sentido horario sin transform: scaleX(-1)',
    reason: 'El movimiento de las agujas del reloj es universal independientemente del idioma.'
  },
  {
    icon: 'check_circle',
    label: 'Checkmarks y media play',
    shouldMirror: false,
    cssLogicalExample: 'No espejar ni invertir check / play_arrow',
    reason: 'Son convenciones simbólicas globales que pierden reconocimiento si se voltean.'
  }
];

/* =====================================================================
   CASO 2: INTERACTION — TOUCH TARGETS, 8DP SPACING, INPUTS & SELECTION
   ===================================================================== */

export const INPUT_MODALITY_SPECS: readonly InputModalitySpec[] = [
  {
    id: 'touch',
    icon: 'touch_app',
    title: 'Touch (Táctil)',
    targetRule: 'Hitbox mínimo 48×48dp (~9mm) con separación mínima ≥ 8dp entre controles adyacentes.',
    selectionPattern: 'Tap para activar; Long-press (mantener) para entrar a modo selección múltiple en listas.',
    webPlatformRule: 'Usar touch-action: pan-y en carruseles horizontales (nunca touch-action: none si hay scroll vertical).'
  },
  {
    id: 'pointer',
    icon: 'mouse',
    title: 'Mouse / Trackpad',
    targetRule: 'Mantiene hitboxes generosos (≥48dp en acciones clave, mín. WCAG 24×24px) + soporte de hover.',
    selectionPattern: 'Checkboxes visibles o revelados en hover y selección con clic + Shift.',
    webPlatformRule: 'El hover comunica interactividad previa, pero nunca puede ser el único medio para revelar acciones críticas.'
  },
  {
    id: 'keyboard',
    icon: 'keyboard',
    title: 'Teclado (Tab + Arrows)',
    targetRule: 'Todo control operable sin mouse con anillo visible :focus-visible (.focus-ring-m3).',
    selectionPattern: 'Tab entre grupos distintos; Flechas (←/→ o ↑/↓) con Roving Tabindex dentro de grupos; Space/Enter activa.',
    webPlatformRule: 'Enter actúa en keydown y Space en keyup (con preventDefault() para no scrollear la página).'
  },
  {
    id: 'screen-reader',
    icon: 'record_voice_over',
    title: 'Lectores de Pantalla / Voz',
    targetRule: 'Nombre accesible claro (aria-label en icon-only buttons) y estado anunciado (aria-pressed, aria-selected).',
    selectionPattern: 'Regiones aria-live="polite" anuncian selecciones o filtros aplicados sin robar el foco.',
    webPlatformRule: 'Preferir <button>, <a href>, <dialog> nativos antes que <div role="button">.'
  }
];

/* =====================================================================
   CASO 3: ACCESSIBILITY — KEYBOARD TRAVERSAL, LANDMARKS, ALT & MOTION
   ===================================================================== */

export const A11Y_FOUNDATION_SPECS: readonly A11yFoundationSpec[] = [
  {
    id: 'landmarks-headings',
    icon: 'account_tree',
    title: '1. Landmarks & Jerarquía de Headings',
    m3Rule: 'El orden del DOM debe coincidir con el flujo visual para lectores de pantalla.',
    implementationDetail: 'Usar <header>, <nav>, <main> y encabezados secuenciales (h1 → h2 → h3) sin saltos arbitrarios.',
    antiPattern: 'No simular títulos con <div class="text-2xl font-bold"> sin etiqueta de heading ni saltar de h1 a h4.'
  },
  {
    id: 'focus-order',
    icon: 'tab',
    title: '2. Orden de Foco & Modales Inertes',
    m3Rule: 'Al abrir un modal o panel, el foco inicial va al primer control relevante y queda contenido dentro.',
    implementationDetail: 'Usar <dialog>.showModal() o atributo inert en el fondo (#app-stage) y jamás usar tabindex > 0.',
    antiPattern: 'Dejar que Tab escape detrás del backdrop hacia botones ocultos o usar tabindex="5".'
  },
  {
    id: 'forced-colors',
    icon: 'contrast',
    title: '3. Forced Colors & Focus Ring',
    m3Rule: 'El indicador de foco debe sobrevivir a Windows High Contrast Mode.',
    implementationDetail: 'En _interaction.css, .focus-ring-m3:focus-visible agrega outline: 3px solid Highlight bajo @media (forced-colors: active).',
    antiPattern: 'Usar outline: none + box-shadow sin fallback, porque Windows High Contrast elimina box-shadow.'
  },
  {
    id: 'reduced-motion',
    icon: 'motion_photos_off',
    title: '4. Reduced Motion & Escala 200%',
    m3Rule: 'Respetar preferencias del sistema operativo en animación y zoom tipográfico.',
    implementationDetail: 'Tipografía en rem (Styles) + @media (prefers-reduced-motion: reduce) anulando scale/transiciones largas.',
    antiPattern: 'Bloquear el zoom del usuario o animar desplazamientos largos cuando reduced-motion está activo.'
  }
];

/* =====================================================================
   CASO 4: CONTENT DESIGN & GLOSARIO MATERIAL A–Z
   ===================================================================== */

export const CONTENT_DESIGN_PAIRS: readonly ContentDesignPair[] = [
  {
    category: 'Botones & CTAs',
    badCopy: 'Aceptar / Sí / Clic aquí',
    goodCopy: 'Guardar cambios / Eliminar tarea',
    rationale: 'M3 Content Design: usar verbos de acción concretos + sustantivo para que el usuario entienda la consecuencia sin leer todo el diálogo.'
  },
  {
    category: 'Mensajes de Error',
    badCopy: 'Error 422: Campo inválido.',
    goodCopy: 'Ingresá un correo válido (ej. nombre@empresa.com).',
    rationale: 'Explicar en lenguaje humano qué pasó y exactamente cómo corregirlo en el campo afectado.'
  },
  {
    category: 'Alt Text en Imágenes',
    badCopy: 'Imagen de una foto de un gráfico de barras',
    goodCopy: 'Ventas crecieron 20% en Q3 respecto a Q2 (o alt="" si es decorativo)',
    rationale: 'Sin muletillas ("Imagen de..."): describir el dato clave en gráficos y usar alt="" en adornos visuales.'
  },
  {
    category: 'Notificaciones & Toasts',
    badCopy: 'La operación solicitada ha sido procesada exitosamente por el servidor.',
    goodCopy: 'Tarea guardada en la agenda.',
    rationale: 'Directo al grano (3–6 palabras), sin voz pasiva ni jerga técnica innecesaria.'
  }
];

export const MATERIAL_AZ_GLOSSARY: readonly MaterialGlossaryTerm[] = [
  {
    letter: 'B',
    term: 'Breakpoint (Window Size Class)',
    category: 'Layout',
    definition: 'Umbral de ancho/alto de ventana donde la estructura del layout muta (Compact <600, Medium 600–839, Expanded 840–1199, Large 1200–1599, Extra-Large ≥1600dp).',
    whereUsed: 'AdaptiveLayoutService'
  },
  {
    letter: 'C',
    term: 'Canonical Layout',
    category: 'Layout',
    definition: 'Plantilla estructural probada de M3 para pantallas adaptativas: List-Detail, Supporting Pane y Feed.',
    whereUsed: 'POS (Supporting Pane), Clínica (List-Detail), Overview (Feed)'
  },
  {
    letter: 'F',
    term: 'Focus Ring & Roving Tabindex',
    category: 'Accessibility',
    definition: 'Anillo de alto contraste en :focus-visible (.focus-ring-m3) combinado con navegación por flechas dentro de un grupo único con un solo tab stop.',
    whereUsed: 'src/styles/_interaction.css'
  },
  {
    letter: 'I',
    term: 'Inert / Top Layer',
    category: 'Accessibility',
    definition: 'Aislamiento del DOM de fondo cuando se abre un modal para que teclado y lectores de pantalla no puedan salir del diálogo activo.',
    whereUsed: 'DialogService / HeroDetailModalComponent'
  },
  {
    letter: 'L',
    term: 'Logical Properties (LTR / RTL)',
    category: 'Layout',
    definition: 'Propiedades CSS independientes de dirección física (inline-start, block-end) que adaptan márgenes y bordes automáticamente a idiomas de derecha a izquierda.',
    whereUsed: 'Foundations Layout Lab'
  },
  {
    letter: 'M',
    term: 'Margin & Spacer (Gutter)',
    category: 'Layout',
    definition: 'Margin es el respiro externo respecto al borde de pantalla (16dp Compact / 24dp Medium+); Spacer es la separación entre paneles adyacentes.',
    whereUsed: 'AdaptiveLayoutService (marginDp / spacerDp)'
  },
  {
    letter: 'O',
    term: 'OKLCH & Seed Hue (Ref → Styles)',
    category: 'Styles & Motion (Ref)',
    definition: 'Espacio de color perceptualmente uniforme que garantiza luminancia estable al rotar el tono semilla (--seed-hue). Documentado en vivo en Styles • Caso 2.',
    whereUsed: 'Styles Lab + src/styles/_token.css'
  },
  {
    letter: 'P',
    term: 'Pane (Panel Estructural)',
    category: 'Layout',
    definition: 'Contenedor lógico que agrupa contenido dentro de un layout; según el Breakpoint se muestran 1, 2 o hasta 3 paneles simultáneos.',
    whereUsed: 'Canonical Layouts (POS / Clínica)'
  },
  {
    letter: 'S',
    term: 'Shape Morphing (Ref → Styles)',
    category: 'Styles & Motion (Ref)',
    definition: 'Deformación elástica de esquinas (radio acotado h/2) o polígonos SVG (SEGMENT_COUNT=40) para dar feedback táctil visual. Documentado en Styles • Caso 4.',
    whereUsed: '_button.css, _chip.css, <m3-loading-indicator>'
  },
  {
    letter: 'S',
    term: 'State Layer (Ref → Styles)',
    category: 'Styles & Motion (Ref)',
    definition: 'Velo translúcido currentColor en ::before (8% hover, 10% focus, 12% press, 16% drag). Documentado con 6 arquetipos en Styles • Caso 6.',
    whereUsed: 'Styles Lab + src/styles/_interaction.css'
  },
  {
    letter: 'T',
    term: 'Touch Target 48×48dp',
    category: 'Interaction',
    definition: 'Área mínima clickeable/táctil (~9mm) expandida vía ::after (.touch-target-48) incluso cuando el icono visual mide 24–28px, separada por ≥8dp de otros objetivos.',
    whereUsed: 'src/styles/_interaction.css + M3Button + M3Chip'
  }
];

