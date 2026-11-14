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

export type LayoutPartId =
  | 'nav-bar'
  | 'nav-rail-drawer'
  | 'body-region'
  | 'pane'
  | 'margin'
  | 'spacer'
  | 'drag-handle'
  | 'column-fold';

export interface LayoutPartSpec {
  readonly id: LayoutPartId;
  readonly name: string;
  readonly region: 'Navigation Components' | 'Body Region' | 'Hardware / Hinge';
  readonly sizingRule: string;
  readonly role: string;
  readonly designRule: string;
  readonly exampleInApp: string;
}

export interface AdaptiveStrategySpec {
  readonly id: 'show-hide' | 'levitate' | 'reflow' | 'responsive-vs-adaptive' | 'fold-continuity';
  readonly name: string;
  readonly badge: string;
  readonly problem: string;
  readonly m3Rule: string;
  readonly triggerBreakpoint: string;
  readonly webImplementation: string;
}

/* =====================================================================
   CASO 1: LAYOUT — PARTS OF LAYOUT, ADAPTIVE DESIGN, 5 BREAKPOINTS & LTR/RTL
   ===================================================================== */

export const PARTS_OF_LAYOUT_SPECS: readonly LayoutPartSpec[] = [
  {
    id: 'nav-bar',
    name: 'Navigation Bar / Bottom Bar',
    region: 'Navigation Components',
    sizingRule: 'Alto 80dp (bar) • Ancho 100% (Compact <600dp)',
    role: 'Contenedor de destinos principales al alcance del pulgar en pantallas estrechas.',
    designRule: 'Usar entre 3 y 5 destinos de nivel superior. Nunca mezclar con Navigation Rail visible simultáneamente.',
    exampleInApp: 'Mobile Dock inferior en vista Compact (<600px).',
  },
  {
    id: 'nav-rail-drawer',
    name: 'Navigation Rail / Drawer',
    region: 'Navigation Components',
    sizingRule: 'Rail 80dp ancho • Modal/Standard Drawer 220dp–360dp',
    role: 'Ancla lateral de navegación persistente o colapsable en Medium, Expanded, Large y Extra-Large.',
    designRule: 'Desde Medium (≥600dp) la barra inferior muta a Rail lateral. En Large/Extra-Large puede expandirse a Standard Drawer.',
    exampleInApp: 'AppShell Sidebar colapsable (rail ↔ drawer) y Shrine sidebar en ventana desktop.',
  },
  {
    id: 'body-region',
    name: 'Body Region',
    region: 'Body Region',
    sizingRule: 'Ocupa todo el área restante fuera del chrome de navegación',
    role: 'Alberga los paneles de contenido (panes), grillas, cards y acciones contextuales.',
    designRule: 'Nunca queda pegado al borde físico: siempre respeta Margins externos (16dp Compact, 24dp Medium+).',
    exampleInApp: 'Área principal de Clínicas, POS, Campus y Simulador Shrine.',
  },
  {
    id: 'pane',
    name: 'Panes (Fixed vs Flexible)',
    region: 'Body Region',
    sizingRule: 'Fixed (ej. 320dp–412dp o 35–40%) + Flexible (1fr / 60–65%)',
    role: 'Subdivisiones funcionales del Body (ej. Lista + Detalle, o Trabajo + Panel de Soporte).',
    designRule: 'Combiná un Pane fijo para lectura escaneable (lista o resumen) con un Pane flexible que absorba el crecimiento de ventana.',
    exampleInApp: 'POS Catalog (Flexible) + Ticket (Fixed 360dp) / Shrine Media + Product Detail.',
  },
  {
    id: 'margin',
    name: 'Margins (Outer Spacing)',
    region: 'Body Region',
    sizingRule: '16dp en Compact (<600dp) • 24dp en Medium+ (≥600dp)',
    role: 'Espacio visual de respiro entre los bordes de pantalla/navegación y el contenido del Body.',
    designRule: 'Usar propiedades lógicas (`padding-inline`, `margin-inline`) para mantener simetría en RTL.',
    exampleInApp: 'Marco interior de 16px/24px alrededor de los paneles.',
  },
  {
    id: 'spacer',
    name: 'Spacer (24dp Gutter)',
    region: 'Body Region',
    sizingRule: '16dp–24dp (estándar M3 = 24dp entre panes contiguos)',
    role: 'Separación física y semántica entre dos Panes visibles lado a lado.',
    designRule: 'En diseños multipane evita bordes duros; un Spacer de 24dp con color `surface` separa sin ruido visual.',
    exampleInApp: 'Canal vertical entre Pane 1 y Pane 2 (y contenedor del Drag Handle).',
  },
  {
    id: 'drag-handle',
    name: 'Drag Handle (Split Resizer)',
    region: 'Body Region',
    sizingRule: 'Píldora visual 4dp × 48dp dentro de un hit target de 48dp × 48dp',
    role: 'Control táctil y de puntero alojado en el centro del Spacer para redimensionar dos Panes.',
    designRule: 'Debe cumplir WCAG touch target (48dp mínimo), soportar teclado (flechas ←/→) y mostrar affordance al hover/focus.',
    exampleInApp: 'Divisor arrastrable entre Lista/Galería y Detalle (30%–70%).',
  },
  {
    id: 'column-fold',
    name: 'Columns & Fold (Hinge)',
    region: 'Hardware / Hinge',
    sizingRule: '4 cols (Compact) • 8 cols (Medium) • 12 cols (Expanded+) • Fold ≥ 24dp',
    role: 'Grilla estructural del contenido y alineación segura alrededor de bisagras en foldables.',
    designRule: 'Nunca partas texto o botones críticos sobre un Fold; alineá un Spacer sobre la bisagra (`env(fold-left)` / Flex split).',
    exampleInApp: 'Grilla Bento 12 cols y modo Dual-Screen Fold en el simulador.',
  },
];

export const ADAPTIVE_STRATEGIES_SPECS: readonly AdaptiveStrategySpec[] = [
  {
    id: 'responsive-vs-adaptive',
    name: 'Responsive vs Adaptive',
    badge: 'Principio Core',
    problem: 'Estirar tarjetas de móvil al 100% de un monitor de 1440px destruye la legibilidad (Responsive ingenuo).',
    m3Rule: 'Responsive solo escala proporciones; Adaptive reestructura panes, densidad y navegación según el espacio disponible.',
    triggerBreakpoint: 'Todos los cambios entre 5 Width Breakpoints',
    webImplementation: '@container (inline-size) + CSS Grid / Flex multipane.',
  },
  {
    id: 'show-hide',
    name: '1. Show & Hide',
    badge: 'Estrategia Multipane',
    problem: 'Un panel secundario (Soporte, Filtros o Ticket) satura una pantalla Compact.',
    m3Rule: 'Mantené oculto o bajo demanda el panel secundario en Compact/Medium y mostralo persistente desde Expanded (≥840dp).',
    triggerBreakpoint: 'Oculto en Compact (<600dp) → Visible en Expanded+ (≥840dp)',
    webImplementation: '@container (min-width: 840px) + Angular @if / signal.',
  },
  {
    id: 'levitate',
    name: '2. Levitate',
    badge: 'Overlay & Floating Chrome',
    problem: 'El carrito, filtros rápidos o acciones clave deben estar accesibles sin robar espacio al flujo principal.',
    m3Rule: 'Elevá un elemento sobre la superficie (Modal Sheet, Dropdown, Floating Pill o FAB extendido) en anchos reducidos o acciones rápidas.',
    triggerBreakpoint: 'Compact / Medium (Sheet) ↔ Floating Pill contextual en Desktop',
    webImplementation: 'Popover / Dialog top-layer + elevation-3 / floating action pill.',
  },
  {
    id: 'reflow',
    name: '3. Reflow',
    badge: 'Reordenamiento Espacial',
    problem: 'Contenido horizontal (foto + detalle, o grilla 3 cols) no cabe en paralelo en una ventana estrecha.',
    m3Rule: 'Reacomodá el flujo de horizontal (`row`) a apilado vertical (`column`) debajo de Expanded, o variá columnas 3 → 2 → 1.',
    triggerBreakpoint: 'Stack vertical (<840dp) ↔ Lado a lado (≥840dp)',
    webImplementation: '@container (min-width: 840px) { flex-direction: row }.',
  },
  {
    id: 'fold-continuity',
    name: '4. Fold Continuity',
    badge: 'Foldables / Dual-Pane',
    problem: 'Al desplegar un teléfono plegable o dividir ventana, una tarjeta cruzada por la bisagra queda cortada.',
    m3Rule: 'Alineá el Spacer del layout exactamente con la bisagra (Fold) para convertir cada mitad física en un Pane limpio.',
    triggerBreakpoint: 'Medium / Expanded en dispositivos plegables',
    webImplementation: 'Spacer central + CSS Dual-Pane split libre de texto en el eje medio.',
  },
];

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
    title: 'Touch Web (Coarse Pointer)',
    targetRule: 'Hitbox mínimo 48×48dp (~9mm) con separación ≥ 8dp (.touch-target-48 / .touch-gap-8).',
    selectionPattern: 'Tap explícito sobre controles o checkboxes visibles; nunca ocultar acciones esenciales detrás de gestos invisibles.',
    webPlatformRule: 'Usar touch-action: pan-y en carruseles horizontales y @media (pointer: coarse) para ampliar controles táctiles.'
  },
  {
    id: 'pointer',
    icon: 'mouse',
    title: 'Mouse / Trackpad',
    targetRule: 'Mantiene hitboxes generosos (≥48dp en acciones clave, mín. WCAG 24×24px) + soporte de hover.',
    selectionPattern: 'State Layer al hover (8%) y selección directa / múltiple con clic + Shift.',
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
   CASO 3: ACCESSIBILITY — WEB A11Y (WCAG 2.2, CONTRASTE, FORMULARIOS, TECLADO)
   ===================================================================== */

export const A11Y_FOUNDATION_SPECS: readonly A11yFoundationSpec[] = [
  {
    id: 'contrast-color',
    icon: 'visibility',
    title: '1. Contraste WCAG & No Solo Color',
    m3Rule: 'Texto normal ≥ 4.5:1; texto grande, íconos y bordes interactivos ≥ 3:1. Jamás comunicar estado solo con color.',
    implementationDetail: 'Todo error o éxito combina color semántico con ícono explícito y texto descriptivo visible.',
    antiPattern: 'Pintar solo el borde de un input en rojo sin mensaje ni ícono (invisible para daltonismo y forced-colors).'
  },
  {
    id: 'accessible-forms',
    icon: 'fact_check',
    title: '2. Formularios Web (:user-invalid + ARIA)',
    m3Rule: 'Etiquetar con <label for>, ubicar ayudas sobre el campo y validar recién tras la interacción real.',
    implementationDetail: 'Enlazar ayuda/error con aria-describedby y sincronizar aria-invalid="true" con :user-invalid al blur/input.',
    antiPattern: 'Usar placeholder como label o disparar errores rojos antes de que el usuario termine de escribir.'
  },
  {
    id: 'landmarks-headings',
    icon: 'account_tree',
    title: '3. Landmarks & Jerarquía de Headings',
    m3Rule: 'El orden del DOM debe coincidir con el flujo visual para lectores de pantalla.',
    implementationDetail: 'Usar <header>, <nav>, <main> y encabezados secuenciales (h1 → h2 → h3) sin saltos arbitrarios.',
    antiPattern: 'No simular títulos con <div class="text-2xl font-bold"> sin etiqueta de heading ni saltar de h1 a h4.'
  },
  {
    id: 'focus-order',
    icon: 'tab',
    title: '4. Orden de Foco & Modales Inertes',
    m3Rule: 'Al abrir un modal o panel, el foco inicial va al primer control relevante y queda contenido dentro.',
    implementationDetail: 'Usar <dialog>.showModal() o atributo inert en el fondo (#app-stage) y jamás usar tabindex > 0.',
    antiPattern: 'Dejar que Tab escape detrás del backdrop hacia botones ocultos o usar tabindex="5".'
  },
  {
    id: 'forced-colors',
    icon: 'contrast',
    title: '5. Forced Colors & Focus Ring',
    m3Rule: 'El indicador de foco debe sobrevivir a Windows High Contrast Mode.',
    implementationDetail: 'En _interaction.css, .focus-ring-m3:focus-visible agrega outline: 3px solid Highlight bajo @media (forced-colors: active).',
    antiPattern: 'Usar outline: none + box-shadow sin fallback, porque Windows High Contrast elimina box-shadow.'
  },
  {
    id: 'reduced-motion',
    icon: 'motion_photos_off',
    title: '6. Reduced Motion & Escala 200%',
    m3Rule: 'Respetar preferencias del sistema operativo en animación y zoom tipográfico.',
    implementationDetail: 'Tipografía en rem (Styles) + @media (prefers-reduced-motion: reduce) anulando scale/transiciones largas.',
    antiPattern: 'Bloquear el zoom del usuario o animar desplazamientos largos cuando reduced-motion está activo.'
  }
];

/* =====================================================================
   CASO 4: CONTENT DESIGN & LOCALIZACIÓN WEB (EXPANSIÓN +35% & INTL)
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
    category: 'Tolerancia i18n (+35%) & Intl',
    badCopy: 'width: 96px fijo + formateo manual dd/mm/yyyy con strings.',
    goodCopy: 'min-inline-size + fit-content + Intl.NumberFormat / DateTimeFormat.',
    rationale: 'Los textos en botones pueden crecer 30–40% según dispositivo o idioma; usar tamaño intrínseco y API Intl nativa evita cortes.'
  }
];

