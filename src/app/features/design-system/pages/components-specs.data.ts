export interface ComponentPillarSpec {
  readonly id:
    | 'all-buttons'
    | 'cards'
    | 'chips'
    | 'text-fields'
    | 'loading-indicator'
    | 'progress-indicators'
    | 'switch'
    | 'selection-controls'
    | 'slider'
    | 'tabs'
    | 'overlays';
  readonly name: string;
  readonly category: 'Actions' | 'Containment & Selection' | 'Text Inputs' | 'Communication & Feedback';
  readonly docUrl: string;
  readonly selectorOrCss: string;
  readonly keyRule: string;
  readonly webNotes: string;
}

export interface LoadingTimingRule {
  readonly windowLabel: string;
  readonly componentToUse: string;
  readonly variant: string;
  readonly why: string;
}

export interface ButtonEmphasisSpec {
  readonly kind: string;
  readonly role: string;
  readonly containerToken: string;
  readonly shapeRule: string;
  readonly useWhen: string;
}

export interface WebA11yFixSpec {
  readonly component: string;
  readonly issueFixed: string;
  readonly standardApplied: string;
}

export interface CardGuidelineSpec {
  readonly variant: string;
  readonly tokens: string;
  readonly whyUseIt: string;
  readonly whereToUse: string;
  readonly avoidWhen: string;
}

export interface TextFieldContextSpec {
  readonly context: string;
  readonly variantToUse: string;
  readonly rationale: string;
  readonly modernWebPattern: string;
}

export const COMPONENT_PILLAR_SPECS: ComponentPillarSpec[] = [
  {
    id: 'all-buttons',
    name: 'All Buttons (Common, Toggle, Group, Split, FAB)',
    category: 'Actions',
    docUrl: 'https://m3.material.io/components/all-buttons',
    selectorOrCss: '<m3-button>, <m3-button-group>, <m3-split-button>, <m3-fab>',
    keyRule: '5 énfasis (Filled -> Text), escala XS..XL, Toggle Pill <-> 12px Square y Connected Groups en lugar de Segmented Buttons.',
    webNotes: 'La opacidad disabled separa 12% contenedor y 38% tinta on-surface sin multiplicar opacidades padre.'
  },
  {
    id: 'cards',
    name: 'Cards (Elevated, Filled, Outlined)',
    category: 'Containment & Selection',
    docUrl: 'https://m3.material.io/components/cards/overview',
    selectorOrCss: '<m3-card variant="elevated|filled|outlined">',
    keyRule: 'Cada card agrupa un tema único y acción coherente; elevation level 1->2 en elevated o tono/borde sin sombra.',
    webNotes: 'Cuando es interactive=true usa role="button" y activa con click, Enter o keyup.space (bloqueando scroll en keydown).'
  },
  {
    id: 'chips',
    name: 'Chips (Assist, Filter, Input, Suggestion)',
    category: 'Containment & Selection',
    docUrl: 'https://m3.material.io/components/chips/overview',
    selectorOrCss: '<m3-chip type="filter|assist|input|suggestion">',
    keyRule: 'Filter chip morfa su radio de 16px píldora a 8px squircle al seleccionarse y expone aria-pressed.',
    webNotes: 'Input chip removable separa dos botones hermanos dentro de .m3-chip-composite: cero controles interactivos anidados.'
  },
  {
    id: 'text-fields',
    name: 'Text Fields (Filled & Outlined + Autofill)',
    category: 'Text Inputs',
    docUrl: 'https://m3.material.io/components/text-fields/overview',
    selectorOrCss: '<m3-text-field variant="filled|outlined">',
    keyRule: 'Etiqueta flotante obligatoria, supporting/error text enlazado con aria-describedby y contraste >= 3:1 en bordes e iconos.',
    webNotes: 'Soporta ControlValueAccessor, autocomplete nativo del navegador y outline Highlight en @media (forced-colors: active).'
  },
  {
    id: 'loading-indicator',
    name: 'Loading Indicator (< 5s Morphing Polygons)',
    category: 'Communication & Feedback',
    docUrl: 'https://m3.material.io/components/loading-indicator/overview',
    selectorOrCss: '<m3-loading-indicator size="sm|md|lg" [diameter]="24..240" [progress]="0..1|null" [contained]="..." [elevated]="..." [paused]="...">',
    keyRule: 'Reservado para esperas indeterminadas cortas de 200ms a 5s (pull-to-refresh, handshake de terminal POS). Escala oficial [diameter] de 24dp a 240dp (base 48dp / figura activa 38dp = ratio 38/48); [progress] 0..1 morphing Circle (+18°) → SoftBurst para arrastre táctil; role="progressbar" con aria-label acción+objeto y aria-valuenow solo en modo determinado.',
    webNotes: 'Ciclo canónico de 7 polígonos M3 (SoftBurst -> Cookie9 -> Pentagon -> Pill -> Sunny -> Cookie4 -> Oval) a N=180 splines cúbicos SVG, conducido por física de resorte real (0.6 / 200) a 650ms por paso + 90° discretos y giro base de 4666ms fuera de NgZone (soporta [paused] y se congela bajo prefers-reduced-motion).'
  },
  {
    id: 'progress-indicators',
    name: 'Progress Indicators (> 5s Linear & Circular Wavy)',
    category: 'Communication & Feedback',
    docUrl: 'https://m3.material.io/components/progress-indicators/overview',
    selectorOrCss: '<m3-linear-progress>, <m3-circular-progress>',
    keyRule: 'Para esperas > 5s; Linear soporta mínimo 40dp, punto mínimo visible al 1%, stop indicator fijo de 4dp concéntrico (obligatorio si contraste < 3:1) y espejo RTL (`dir="rtl"`). Circular escala 24dp–240dp (`[diameter]`), mantiene `sm` (24dp) plano y usa `color="inherit"` dentro de `<m3-button [loading]>`.',
    webNotes: 'Sin huecos falsos en 0%, wave `lg` oficial M3 (alto 14px, amplitud 3dp, longitud 40dp), envolvente A(p) 0.10/0.95, `four-color` exclusivo de indeterminado, `[blueprint]` / `[paused]` para inspección y fallback estático bajo prefers-reduced-motion.'
  },
  {
    id: 'switch',
    name: 'Switch (3 Modos + Halo 40dp)',
    category: 'Containment & Selection',
    docUrl: 'https://m3.material.io/components/switch/overview',
    selectorOrCss: '<m3-switch [iconMode]="\'none\'|\'selected\'|\'both\'" [(checked)]="...">',
    keyRule: 'Ajuste binario inmediato sin botón Guardar; thumb morfa 16→24→28dp con ícono 16dp y halo circular 40dp sobre el thumb (sin encoger el track).',
    webNotes: 'button role="switch", aria-labelledby separado de aria-describedby, blanco 48dp, CVA con setDisabledState y forced-colors.'
  },
  {
    id: 'selection-controls',
    name: 'Checkbox (Tri-state) & Radio (1–5)',
    category: 'Containment & Selection',
    docUrl: 'https://m3.material.io/components/checkbox/overview',
    selectorOrCss: '<m3-checkbox [indeterminate]="...">, <m3-radio-group [options]="...">',
    keyRule: 'Checkbox (18×18dp, radio 2dp) para multi-selección o padre-hijo indeterminate; Radio (20dp) para 1–5 opciones excluyentes visibles antes de pasar a <select>.',
    webNotes: '<input type="checkbox|radio"> nativo en target 48dp + halo 40dp, fieldset/legend y navegación por flechas nativa.'
  },
  {
    id: 'slider',
    name: 'Slider Expressive (Track Disjunto)',
    category: 'Containment & Selection',
    docUrl: 'https://m3.material.io/components/sliders/overview',
    selectorOrCss: '<m3-slider size="xs|sm|md" [showStops]="true" [(value)]="...">',
    keyRule: 'Track activo e inactivo separados por brecha 6px, handle vertical 4×44dp (2dp al arrastrar), stop dots 4dp y burbuja de valor.',
    webNotes: 'Envuelve <input type="range"> nativo preservando teclado Arrow/Home/End/PageUp y aria-valuetext.'
  },
  {
    id: 'tabs',
    name: 'Tabs (Primary 3dp & Secondary 2dp)',
    category: 'Containment & Selection',
    docUrl: 'https://m3.material.io/components/tabs/overview',
    selectorOrCss: '<m3-tabs variant="primary|secondary" [tabs]="..." [(value)]="...">',
    keyRule: 'Primary (48/64dp, barra 3dp ajustada al texto) para vistas principales; Secondary (48dp, barra 2dp ancho total) para sub-vistas dentro de tarjetas.',
    webNotes: 'role="tablist"/role="tab" con Roving Tabindex (0 activo / -1 inactivos) y ArrowLeft/ArrowRight sensible a RTL.'
  },
  {
    id: 'overlays',
    name: 'Native Dialog & Top-Layer Popovers',
    category: 'Communication & Feedback',
    docUrl: 'https://m3.material.io/components/dialogs/overview',
    selectorOrCss: '<m3-dialog>, <m3-snackbar>, [popover="auto|manual"]',
    keyRule: 'Dialog básico (28dp, 280–560dp, surface-container-high) sobre <dialog>.showModal(); Snackbar usa popover="manual" y Split Menu popover="auto".',
    webNotes: 'Top Layer nativo del navegador con closedby="any", inert automático fuera del dialog, @starting-style y transition-behavior: allow-discrete.'
  }
];

export const LOADING_TIMING_SPECS: LoadingTimingRule[] = [
  {
    windowLabel: '< 200ms',
    componentToUse: 'Ningún indicador visual',
    variant: 'Transición directa / Optimistic UI',
    why: 'Evita parpadeos visuales ("spinner flash") en respuestas instantáneas de caché o señales locales.'
  },
  {
    windowLabel: '200ms – 5s',
    componentToUse: '<m3-loading-indicator>',
    variant: 'Default (uncontained) / Contained',
    why: 'Muestra actividad expresiva y continua mediante morphing orgánico cuando no existe porcentaje medible.'
  },
  {
    windowLabel: '> 5s',
    componentToUse: '<m3-linear-progress> / <m3-circular-progress>',
    variant: 'Determinate, Wavy o Indeterminate',
    why: 'Comunica progreso real (0–100%), buffer y tiempo restante percibido con barra plana u ondulada + stop dot 4dp.'
  }
];

export const BUTTON_EMPHASIS_SPECS: ButtonEmphasisSpec[] = [
  {
    kind: 'Filled',
    role: 'Acción principal única de la vista',
    containerToken: 'primary / on-primary',
    shapeRule: 'Pill 24px -> Pressed 12px',
    useWhen: 'Guardar formulario, Enviar pedido, Confirmar pago.'
  },
  {
    kind: 'Tonal',
    role: 'Acción secundaria importante sin competir con Filled',
    containerToken: 'secondary-container / on-secondary-container',
    shapeRule: 'Pill 24px -> Pressed 12px',
    useWhen: 'Añadir ítem, Filtrar avanzado, Abrir panel auxiliar.'
  },
  {
    kind: 'Toggle Button',
    role: 'Estado activo/inactivo persistente',
    containerToken: 'surface-high <-> primary | inverse',
    shapeRule: 'Pill (Off) <-> 12px Square (On)',
    useWhen: 'Vista compacta, Modo edición, Favorito/Anclar.'
  },
  {
    kind: 'Connected Group',
    role: 'Selector exclusivo o múltiple que reemplaza Segmented Buttons',
    containerToken: 'surface-low <-> secondary-container',
    shapeRule: 'Extremos 24px, juntas 8px; activo -> Pill 24px',
    useWhen: 'Cambio de período (Día/Semana/Mes) o modos de vista.'
  },
  {
    kind: 'Split Button',
    role: 'Acción primaria + menú desplegable adjunto',
    containerToken: '2px gap entre acción y trigger chevron',
    shapeRule: 'Chevron gira 180° y dispara popover="auto"',
    useWhen: 'Guardar / Guardar borrador / Exportar PDF.'
  },
  {
    kind: 'FAB / Extended FAB',
    role: 'Acción constructiva flotante clave de la pantalla',
    containerToken: 'primary|secondary|tertiary-container (Level 3)',
    shapeRule: '12px (sm) / 16px (md/extended) / 28px (lg)',
    useWhen: 'Crear nuevo registro, Nueva consulta, Redactar.'
  }
];

export const WEB_A11Y_FIX_SPECS: WebA11yFixSpec[] = [
  {
    component: 'M3Button & M3Chip :disabled',
    issueFixed: 'Parent opacity: 0.38 multiplicaba el fondo 12% a ~4.5%, perdiendo legibilidad.',
    standardApplied: 'Color on-surface al 38% en contenido e independiente fondo/borde al 12%.'
  },
  {
    component: 'M3Chip [removable]',
    issueFixed: 'Un <span role="button"> vivía anidado dentro del <button> principal.',
    standardApplied: 'Div .m3-chip-composite con dos <button> hermanos reales: tab order válido.'
  },
  {
    component: 'M3Card [interactive]',
    issueFixed: 'Space disparaba en keydown causando repetición accidental o scroll.',
    standardApplied: 'preventDefault() en keydown.space y activación canónica en keyup.space.'
  },
  {
    component: 'Overlays & Inputs',
    issueFixed: 'Faltaban focus-ring-m3 en clear/toggles, forced-colors en select y timer cleanup.',
    standardApplied: 'focus-ring-m3 universal, @media (forced-colors: active) y DestroyRef.'
  }
];

export const CARD_GUIDELINE_SPECS: CardGuidelineSpec[] = [
  {
    variant: 'Elevated',
    tokens: 'surface-container-low + Level 1 -> 2',
    whyUseIt: 'Separa visualmente del fondo mediante sombra cuando hay contenido heterogéneo o imágenes detrás.',
    whereToUse: 'Tarjetas destacadas de catálogo, KPIs accionables principales o dashboards con múltiples capas.',
    avoidWhen: 'No apilar 20 cards elevated juntas con sombra pesada; satura la vista.'
  },
  {
    variant: 'Filled',
    tokens: 'surface-container-highest (0dp)',
    whyUseIt: 'Crea separación tonal suave sin sombras ni bordes duros, ideal para densidad alta.',
    whereToUse: 'Bento Grids, paneles internos, configuraciones o listas agrupadas dentro de surface-low.',
    avoidWhen: 'No usarla si el fondo padre ya comparte el mismo tono neutral sin contraste.'
  },
  {
    variant: 'Outlined',
    tokens: 'surface + 1px outline-variant (0dp)',
    whyUseIt: 'Delimita con precisión estructural sin añadir peso de sombra ni relleno oscuro.',
    whereToUse: 'Formularios comparativos, tablas en tarjetas, comparativas técnicas y estados seleccionables.',
    avoidWhen: 'Evitar anidamiento múltiple de bordes dentro de otros bordes sin respiro (spacing).'
  }
];

export const TEXT_FIELD_CONTEXT_SPECS: TextFieldContextSpec[] = [
  {
    context: 'Diálogos (<dialog> / Modales breves)',
    variantToUse: 'Filled (Mayor énfasis)',
    rationale: 'Sobre superficies elevadas (dialog / drawer) el contenedor relleno resalta de inmediato qué 1 a 3 datos debe completar el usuario.',
    modernWebPattern: '[prefix]/[suffix] con aria-describedby + enterkeyhint="done" + popover/modal focus.'
  },
  {
    context: 'Formularios largos / Grillas densas',
    variantToUse: 'Outlined (Menor ruido visual)',
    rationale: 'Cuando conviven 5 o más campos en pantalla, el borde fino evita bloques grises pesados y simplifica el escaneo vertical.',
    modernWebPattern: ':user-invalid diferido tras blur/submit + autocomplete + autoGrow (field-sizing: content).'
  },
  {
    context: 'Credenciales y Seguridad',
    variantToUse: 'Filled u Outlined + [passwordToggle]',
    rationale: 'Permite verificar caracteres escritos sin errores a ciegas, exponiendo role="button", aria-pressed y aria-label dinámico.',
    modernWebPattern: 'autocomplete="current-password|new-password" + minlength/pattern nativo.'
  }
];


