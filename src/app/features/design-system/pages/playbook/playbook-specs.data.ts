import { M3TabItem } from '../../../../shared/components/tabs/tabs.component';

export type PlaybookSourceBadge =
  | 'Google M3 Oficial'
  | 'Estándar Web / WCAG'
  | 'Arquitectura M3E Web'
  | 'Ingeniería Angular / Vercel';

export type PlaybookModuleId = 'styles' | 'foundations' | 'components' | 'motion';

export type PlaybookCategory =
  | 'all'
  | 'styles'
  | 'foundations'
  | 'selection'
  | 'buttons'
  | 'progress'
  | 'inputs-cards'
  | 'navigation-tabs'
  | 'overlays'
  | 'motion'
  | 'architecture-perf';

export type PlaybookTroubleshootLayer = PlaybookModuleId | 'architecture';

export interface PlaybookLayerCard {
  readonly id: string;
  readonly step: string;
  readonly moduleBadge: string;
  readonly title: string;
  readonly buildingMetaphor: string;
  readonly ownsContract: string;
  readonly consumesRule: string;
  readonly forbiddenRule: string;
  readonly copyRule: string;
  readonly files: readonly string[];
}

export interface PlaybookRuntimePillar {
  readonly id: string;
  readonly badge: string;
  readonly icon: string;
  readonly title: string;
  readonly whyItMatters: string;
  readonly concreteStandard: string;
  readonly repoGapOrStatus: string;
}

export interface PlaybookChecklistItem {
  readonly id: string;
  readonly layer: '1. Styles' | '2. Foundations' | '3. Components' | '4. Motion' | '5. Core & Vercel';
  readonly title: string;
  readonly whyItMatters: string;
  readonly path: string;
  readonly required: boolean;
}

export interface PlaybookSacredQuestion {
  readonly number: string;
  readonly question: string;
  readonly explanation: string;
  readonly answerMap: readonly { readonly condition: string; readonly pick: string }[];
}

export interface PlaybookDecisionRule {
  readonly id: string;
  readonly component: string;
  readonly category: Exclude<PlaybookCategory, 'all'>;
  readonly moduleRef?: PlaybookModuleId;
  readonly sourceBadge: PlaybookSourceBadge;
  readonly buildingAnalogy: string;
  readonly useWhen: string;
  readonly avoidWhen: string;
  readonly technicalWhy: string;
  readonly repoFile: string;
  readonly snippet: string;
}

export interface PlaybookBlueprint {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly summary: string;
  readonly componentsUsed: readonly string[];
  readonly strictRules: readonly string[];
  readonly codeSnippet: string;
}

export interface PlaybookTroubleshootItem {
  readonly id: string;
  readonly layer: PlaybookTroubleshootLayer;
  readonly layerLabel: string;
  readonly route?: string;
  readonly routeLabel?: string;
  readonly symptom: string;
  readonly cause: string;
  readonly fixRule: string;
  readonly fixSnippet: string;
}

export const PLAYBOOK_DEPENDENCY_FLOW: readonly {
  readonly step: string;
  readonly label: string;
  readonly summary: string;
}[] = [
  { step: '1. Styles', label: 'Tokens OKLCH', summary: 'CSS puro (variables y superficies). Cero dependencias.' },
  { step: '2. Foundations', label: 'Layout & WCAG', summary: 'Breakpoints, targets 48dp, foco Highlight y RTL.' },
  { step: '3. Shared M3', label: 'UI Desacoplada', summary: 'Componentes M3 puros (inputs/outputs, cero lógica de negocio).' },
  { step: '4. Motion', label: 'Bisagras & Capas', summary: 'Spatial vs Effects, Top Layer seguro y View Transitions.' },
  { step: '5. Core & Features', label: 'Ports + @defer + Vercel', summary: 'Puertos/Adaptadores, chunks diferidos y rewrites SPA.' }
];

export const PLAYBOOK_LAYERS: readonly PlaybookLayerCard[] = [
  {
    id: 'capa-1-styles',
    step: 'Capa 1 • Styles',
    moduleBadge: 'Pintura y Materiales',
    title: 'Tokens OKLCH, Forma, Elevación y Tipografía (src/styles/)',
    buildingMetaphor:
      'Catálogo central de pintura y acabados: cambiar un --seed-hue o nivel de contraste actualiza todo el edificio al mismo tiempo.',
    ownsContract: 'Exporta las 3 capas de variables (--md-ref-* → --md-sys-* → --md-comp-*), 8 superficies OKLCH y State Layers.',
    consumesRule: 'Base hoja: NO importa Angular, TypeScript ni reglas de componentes.',
    forbiddenRule: 'Prohibido escribir colores hex (#ff0000) o --md-ref-palette-* directo en pantallas de features/.',
    copyRule: 'Copia obligatoria al 100% en cualquier repo nuevo.',
    files: [
      'src/styles/m3-expressive.css (entry point)',
      'src/styles/_token.css + _theme.css',
      'src/styles/_shape.css + _elevation.css',
      'src/styles/_typography.css + _interaction.css'
    ]
  },
  {
    id: 'capa-2-foundations',
    step: 'Capa 2 • Foundations',
    moduleBadge: 'Planos y Reglamento',
    title: 'Breakpoints M3, Ergonomía 48dp y Accesibilidad (core/layout/)',
    buildingMetaphor:
      'Reglamento estructural de pasillos y puertas: asegura que ningún control quede inaccesible de móvil a monitor grande.',
    ownsContract: 'Exporta AdaptiveLayoutService (5 Window Size Classes), .touch-target-48, .focus-ring-m3 y utilidades RTL.',
    consumesRule: 'Consume únicamente Capa 1 (tokens de espacio, interacción y foco Highlight).',
    forbiddenRule: 'Prohibido outline: none sin forced-colors, targets <48dp o márgenes físicos ml-*/mr-* en vistas i18n.',
    copyRule: 'Copia AdaptiveLayoutService + _interaction.css + Shell base.',
    files: [
      'src/app/core/layout/adaptive-layout.service.ts',
      'src/styles/_interaction.css (.touch-target-48)',
      'src/styles/_interaction.css (.focus-ring-m3)',
      'src/app/shared/ui/navigation.component.ts'
    ]
  },
  {
    id: 'capa-3-components',
    step: 'Capa 3 • Components',
    moduleBadge: 'Mobiliario Certificado',
    title: 'Biblioteca Pura de UI M3 (src/app/shared/components/)',
    buildingMetaphor:
      'Mobiliario industrial prefabricado y certificado: colocas piezas listas con ARIA y estado táctil sin construir controles artesanales.',
    ownsContract: 'Exporta M3Button, M3Card, M3Chip, M3TextField, M3Switch, M3Checkbox, M3RadioGroup, M3Slider, M3Tabs, M3Dialog, M3Snackbar y Progress.',
    consumesRule: 'Consume Capas 1 y 2. Recibe datos por input() y notifica eventos por output() o model().',
    forbiddenRule: 'Prohibido inyectar servicios de negocio (PosService, HttpClient) dentro de shared/components/ o anidar botones en cards interactivas.',
    copyRule: 'Copia shared/components/ completo junto con src/styles/_*.css.',
    files: [
      'src/app/shared/components/{button,card,chip,text-field}/',
      'src/app/shared/components/{switch,checkbox,radio,slider}/',
      'src/app/shared/components/{tabs,dialog,snackbar,progress}/',
      'src/app/shared/utils/clipboard.util.ts'
    ]
  },
  {
    id: 'capa-4-motion',
    step: 'Capa 4 • Motion & Orquestación',
    moduleBadge: 'Bisagras y Tránsito',
    title: 'Física Temporal, View Transitions y Top Layer (_motion.css + core/)',
    buildingMetaphor:
      'Bisagras hidráulicas y puertas entre ambientes: calibran velocidad perceptible, continuidad visual y evitan bloqueos de foco.',
    ownsContract: 'Exporta resortes Spatial vs Effects, asimetría on-screen (500ms/250ms), ThemeService y Dialog/StageOverlayService.',
    consumesRule: 'Orquesta estados de UI entre Shared M3 y Features usando signals y view-transition-name dinámico.',
    forbiddenRule: 'Prohibido .transition-all, .animate-pulse, bordes 9999px animados o filter: blur() sobre ancestros de modales.',
    copyRule: 'Copia _motion.css, _overlays.css y core/{theme,dialog}/.',
    files: [
      'src/styles/_motion.css + _overlays.css',
      'src/app/core/theme/theme.service.ts',
      'src/app/core/dialog/{dialog,stage-overlay}.service.ts',
      'src/app/app.config.ts (RouteTransitionCoordinator)'
    ]
  }
];

export const PLAYBOOK_RUNTIME_PILLARS: readonly PlaybookRuntimePillar[] = [
  {
    id: 'pillar-clean-ports',
    badge: 'Arquitectura Desacoplada',
    icon: 'hub',
    title: 'Ports & Adapters en core/ (Clean Architecture Real)',
    whyItMatters:
      'Si tu componente inyecta HttpClient o servicios mock acoplados, cambiar de backend o testear flujos complejos obliga a reescribir pantallas.',
    concreteStandard:
      'El dominio define un Port (abstract class o InjectionToken) y core/ provee Adapters intercambiables (REST, LocalStorage, Mock).',
    repoGapOrStatus: 'Siguiente paso en tus features/: abstraer core/{pos,clinic,telemetry}/ detrás de Ports tipados.'
  },
  {
    id: 'pillar-angular-speed',
    badge: 'Velocidad de Runtime',
    icon: 'speed',
    title: 'Zoneless + @defer Chunks + Virtualización CDK',
    whyItMatters:
      'Aunque Angular ya corra sin zone.js, renderizar 2,000 nodos DOM juntos o cargar librerías pesadas en el bundle inicial hunde el INP y el LCP.',
    concreteStandard:
      'Combina OnPush + signals, divide vistas pesadas con @defer (on viewport/interaction) y virtualiza tablas largas con CdkVirtualScrollViewport.',
    repoGapOrStatus: 'Activos hoy: Zoneless + PreloadAllModules. Pendientes de adoptar en features/: @defer y Virtual Scroll.'
  },
  {
    id: 'pillar-resilience-vercel',
    badge: 'Resiliencia & Vercel SPA',
    icon: 'cloud_done',
    title: 'Optimistic UI + Dirty Guards + vercel.json SPA',
    whyItMatters:
      'Las apps reales sufren latencia, errores 503 y recargas en rutas profundas (/design-system/playbook o /pos) que devuelven 404 sin config.',
    concreteStandard:
      'Muta en t=0ms con snapshot para Rollback en Snackbar, protege formularios con Dialog de cambios sin guardar y fija outputDirectory + rewrites en vercel.json.',
    repoGapOrStatus: 'Configurado ahora: /vercel.json apuntando a dist/m3-expressive-ui/browser con fallback SPA a /index.html.'
  }
];

export const PLAYBOOK_CHECKLIST: readonly PlaybookChecklistItem[] = [
  {
    id: 'chk-index',
    layer: '1. Styles',
    title: 'Configurar src/index.html (Plus Jakarta Sans, Material Symbols Rounded y color-scheme)',
    whyItMatters: 'Evita que los íconos aparezcan como texto plano ("close") y activa soporte Claro/Oscuro nativo del navegador.',
    path: 'src/index.html',
    required: true
  },
  {
    id: 'chk-styles',
    layer: '1. Styles',
    title: 'Copiar src/styles/ completo e importar ./styles/m3-expressive.css en src/styles.css',
    whyItMatters: 'Garantiza el orden de cascada OKLCH desde _token.css hasta _overlays.css y _theme.css.',
    path: 'src/styles/m3-expressive.css',
    required: true
  },
  {
    id: 'chk-foundations',
    layer: '2. Foundations',
    title: 'Copiar AdaptiveLayoutService + usar .touch-target-48 y .focus-ring-m3 en controles propios',
    whyItMatters: 'Asegura breakpoints M3 (Compact → Extra-Large), targets táctiles de 48×48dp y foco Highlight accesible.',
    path: 'src/app/core/layout/ + _interaction.css',
    required: true
  },
  {
    id: 'chk-components',
    layer: '3. Components',
    title: 'Copiar src/app/shared/components/ completo sin acoplarlo a servicios de negocio',
    whyItMatters: 'Mantiene reutilizable todo el catálogo M3 (ARIA, ControlValueAccessor, Top Layer) en cualquier dominio.',
    path: 'src/app/shared/components/',
    required: true
  },
  {
    id: 'chk-core',
    layer: '4. Motion',
    title: 'Conectar ThemeService, DialogService y Motion (_motion.css + RouteTransitionCoordinator)',
    whyItMatters: 'Habilita revelado circular oscuro, conmutación standard/expressive y modales sin filtro borroso heredado.',
    path: 'src/app/core/{theme,dialog}/ + app.config.ts',
    required: true
  },
  {
    id: 'chk-deploy',
    layer: '5. Core & Vercel',
    title: 'Definir Ports en core/, aplicar @defer/Virtual Scroll y configurar vercel.json + budgets',
    whyItMatters: 'Evita errores 404 al recargar rutas SPA en Vercel, protege el presupuesto <1MB inicial y desacopla APIs.',
    path: 'vercel.json + angular.json + src/app/core/',
    required: true
  }
];

export const PLAYBOOK_SACRED_QUESTIONS: readonly PlaybookSacredQuestion[] = [
  {
    number: '1',
    question: '¿Cuánto tiempo esperará el usuario?',
    explanation: 'Cada rango de espera exige un indicador distinto para evitar parpadeos o incertidumbre.',
    answerMap: [
      { condition: '< 200ms', pick: 'Nada (evita destellos innecesarios).' },
      { condition: '200ms – 5s sin %', pick: '<m3-loading-indicator> (morphing 7 formas).' },
      { condition: '> 5s o con % real', pick: '<m3-linear-progress> o <m3-circular-progress>.' }
    ]
  },
  {
    number: '2',
    question: '¿Dispara comando o guarda selección?',
    explanation: 'Separar acciones inmediatas de selecciones aplazadas evita formularios ambiguos.',
    answerMap: [
      { condition: 'Ejecuta acción ya', pick: 'Filled / Tonal / Outlined / Split / FAB.' },
      { condition: 'Activa ON/OFF al instante', pick: '<m3-switch> (sin botón Guardar).' },
      { condition: 'Marca para confirmar luego', pick: '<m3-checkbox> o <m3-radio-group>.' }
    ]
  },
  {
    number: '3',
    question: '¿Cuántas opciones visibles existen?',
    explanation: 'Mostrar opciones cuando son pocas acelera el escaneo; colapsarlas evita ruido cuando abundan.',
    answerMap: [
      { condition: '1 ajuste binario', pick: '<m3-switch>.' },
      { condition: '2 – 5 excluyentes', pick: '<m3-radio-group> o Button Group.' },
      { condition: '6 o más opciones', pick: '.m3-select-field.' }
    ]
  },
  {
    number: '4',
    question: '¿Cuántos puntos compiten por atención?',
    explanation: 'La jerarquía visual se rompe en cuanto varios botones gritan al mismo nivel.',
    answerMap: [
      { condition: '1 acción principal', pick: '1 solo Filled Button o FAB visible por sección.' },
      { condition: 'Acciones de apoyo', pick: 'Tonal u Outlined.' },
      { condition: 'Secundaria / Cancelar', pick: 'Text Button.' }
    ]
  },
  {
    number: '5',
    question: '¿Anima geometría o solo apariencia?',
    explanation: 'Spatial tolera resorte acotado; Effects exige amortiguación crítica 1.0 sin rebotes.',
    answerMap: [
      { condition: 'Tamaño / posición / radio', pick: 'Spatial en px acotados (24px ↔ 16px, nunca 9999px).' },
      { condition: 'Color / sombra / opacidad', pick: 'Effects (Damping 1.0 • 150ms–300ms).' },
      { condition: 'Modal / cambio de ruta', pick: 'View Transitions o <m3-dialog> showModal().' }
    ]
  },
  {
    number: '6',
    question: '¿Dónde vive la lógica y cuándo se carga?',
    explanation: 'Un sistema veloz aísla infraestructura y difiere código que el usuario aún no abrió.',
    answerMap: [
      { condition: 'API / persistencia', pick: 'Port (abstract/InjectionToken) + Adapter en core/.' },
      { condition: 'Gráfico o panel pesado', pick: '@defer (on viewport/interaction) + .m3-skeleton.' },
      { condition: 'Lista > 100 filas', pick: 'cdk-virtual-scroll-viewport + OnPush.' }
    ]
  }
];

export const PLAYBOOK_CATEGORY_FILTERS: readonly { id: PlaybookCategory; label: string }[] = [
  { id: 'all', label: 'Todo el Oráculo' },
  { id: 'styles', label: '1. Styles & Color' },
  { id: 'foundations', label: '2. Foundations & A11y' },
  { id: 'selection', label: '3. Selección' },
  { id: 'buttons', label: '3. Botones & Chips' },
  { id: 'progress', label: '3. Carga & Skeleton' },
  { id: 'inputs-cards', label: '3. Inputs & Cards' },
  { id: 'navigation-tabs', label: '3. Tabs & Nav' },
  { id: 'overlays', label: '3. Dialog & Popover' },
  { id: 'motion', label: '4. Motion & Trampas' },
  { id: 'architecture-perf', label: '5. Arquitectura, Speed & Deploy' }
];

export const PLAYBOOK_DECISION_RULES: readonly PlaybookDecisionRule[] = [
  {
    id: 'rule-oklch-tokens',
    component: 'Pipeline de 3 Capas OKLCH (Reference → System → Component)',
    category: 'styles',
    moduleRef: 'styles',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'En vez de pintar paredes con códigos de fábrica, pides "muro principal" y todo cambia coherente con la paleta.',
    useWhen: 'Siempre al estilizar superficies o roles: bg-surface-box, bg-primary-box, text-main, border-outline-sub o variables --md-sys-color-*.',
    avoidWhen: 'Escribir hexadecimales sueltos (#ffffff, #1e293b) o tokens --md-ref-palette-* directo en páginas de negocio.',
    technicalWhy: 'Permite que ThemeService soporte Light, Dark y Contrast High (≥7:1) cambiando solo el atributo raíz sin reescribir CSS.',
    repoFile: 'src/styles/_token.css',
    snippet: ':root { --seed-hue: 255; --seed-chroma: 0.14; } /* Consume bg-surface-box / text-primary */'
  },
  {
    id: 'rule-elevation-statelayers',
    component: 'Elevación Tonal (0dp) vs Sombra (+dp) & State Layers (8/10/12/16%)',
    category: 'styles',
    moduleRef: 'styles',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Primero diferencias zonas por el tono del piso (0dp); solo agregas sombra cuando una pieza realmente flota encima.',
    useWhen: 'Nivel 0 tonal para Bento estático; Level 1→2 en Cards/Botones elevados; Level 3 para FAB y Modales con .state-layer currentColor.',
    avoidWhen: 'Bajar toda la opacidad de la tarjeta en :hover { opacity: 0.8 } o pisar ::before del .state-layer con glows.',
    technicalWhy: 'Las sombras mezclan color-mix(in oklch, var(--md-sys-color-shadow) ...) y el velo ::before protege el contraste del texto interior.',
    repoFile: 'src/styles/_elevation.css + _interaction.css',
    snippet: '<button type="button" class="m3-btn m3-btn-tonal state-layer focus-ring-m3">Acción</button>'
  },
  {
    id: 'rule-foundations-layout',
    component: '5 Breakpoints Adaptativos & Anatomía de Cuerpo (320-412dp + 24dp Spacer)',
    category: 'foundations',
    moduleRef: 'foundations',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'En móvil apilas los ambientes en una sola columna; en monitor amplio separas el maestro del detalle con un pasillo fijo de 24dp.',
    useWhen: 'Paneles maestro-detalle y dashboards que deben mutar entre Compact (<600dp Bar), Medium (Rail 80dp) y Expanded+ (Drawer/Multi-pane).',
    avoidWhen: 'Encoger tablas gigantes a la fuerza en móvil o poner sidebars fijos de 260px que aplasten el contenido en teléfonos.',
    technicalWhy: 'AdaptiveLayoutService expone windowSizeClass() y Chrome adaptativo junto con container queries @container (inline-size).',
    repoFile: 'src/app/core/layout/adaptive-layout.service.ts',
    snippet: 'readonly layout = inject(AdaptiveLayoutService); // layout.windowSizeClass()'
  },
  {
    id: 'rule-foundations-ergonomics',
    component: 'Target Táctil 48×48dp (.touch-target-48), Foco WCAG & Propiedades Lógicas RTL',
    category: 'foundations',
    moduleRef: 'foundations',
    sourceBadge: 'Estándar Web / WCAG',
    buildingAnalogy: 'Ningún picaporte mide 5 milímetros y la señalética se espeja si el edificio se lee de derecha a izquierda.',
    useWhen: 'En todo botón icon-only, link compacto o componente custom: mínimo 48×48dp de hitbox + brecha 8dp + ps-*/pe-* lógicos.',
    avoidWhen: 'Usar outline: none sin @media (forced-colors: active) o márgenes físicos ml-*/left-* que rompen idioma RTL.',
    technicalWhy: '.focus-ring-m3 garantiza fallback outline: 3px solid Highlight en Windows High Contrast y tolera +35% de expansión i18n.',
    repoFile: 'src/styles/_interaction.css',
    snippet: 'class="state-layer focus-ring-m3 touch-target-48 ps-4 pe-3 text-start"'
  },
  {
    id: 'rule-switch',
    component: '<m3-switch> (Toggle binario inmediato)',
    category: 'selection',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Interruptor de pared: al tocarlo, el cambio entra en vigor al instante sin botón Guardar.',
    useWhen: 'Ajustes de estado binario ON/OFF que surten efecto inmediato (notificaciones, modo oscuro, auto-respaldo).',
    avoidWhen: 'El usuario aún debe pulsar "Guardar" al final de un formulario, o para seleccionar filas a borrar.',
    technicalWhy: '52×32dp con halo circular de 40dp solo en el thumb. Separa aria-labelledby (<label>) de aria-describedby.',
    repoFile: 'src/app/shared/components/switch/switch.component.ts',
    snippet: '<m3-switch label="Alertas" description="En tiempo real" iconMode="selected" [(checked)]="alerts" />'
  },
  {
    id: 'rule-checkbox',
    component: '<m3-checkbox> (Selección múltiple + Tri-state)',
    category: 'selection',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Lista de verificación en planilla: puedes marcar varias casillas y confirmar todas juntas después.',
    useWhen: 'Elegir 0, 1 o varias opciones antes de guardar, seleccionar filas en tablas (indeterminate) o aceptar términos.',
    avoidWhen: 'El cambio aplica al instante sin botón Guardar (usa Switch) o solo vale elegir 1 entre varias (usa Radio).',
    technicalWhy: 'Caja 18×18dp dentro de blanco táctil 48×48dp sobre <input type="checkbox"> nativo con estado indeterminate.',
    repoFile: 'src/app/shared/components/checkbox/checkbox.component.ts',
    snippet: '<m3-checkbox label="Acepto términos" [indeterminate]="partial()" [(checked)]="accepted" />'
  },
  {
    id: 'rule-radio-vs-select',
    component: '<m3-radio-group> vs .m3-select-field',
    category: 'selection',
    moduleRef: 'components',
    sourceBadge: 'Estándar Web / WCAG',
    buildingAnalogy: 'Si hay 3 muestras de piso las exhibes en mostrador; si hay 50 las guardas en un archivador desplegable.',
    useWhen: '<m3-radio-group> para 2 a 5 opciones mutuamente excluyentes que conviene comparar de un vistazo.',
    avoidWhen: 'Cuando hay 6 o más opciones: cambia a .m3-select-field en _text-field.css.',
    technicalWhy: '<fieldset> + <legend> + <input type="radio"> garantizan navegación por flechas sin ARIA manual frágil.',
    repoFile: 'src/app/shared/components/radio/radio.component.ts',
    snippet: '<m3-radio-group legend="Plan" [options]="plans" [(value)]="selectedPlan" />'
  },
  {
    id: 'rule-slider',
    component: '<m3-slider> (Continuo / Discreto con Stop Dots)',
    category: 'selection',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Regulador graduado con topes para calibrar porcentaje o límite sin escribir decimales.',
    useWhen: 'Rangos numéricos continuos o por saltos discretos (zoom, descuento %, brillo, volumen).',
    avoidWhen: 'Ingresar importes exactos con centavos o DNI (usa <m3-text-field>).',
    technicalWhy: 'Nativo sobre <input type="range"> con brecha discontinua en la manija vertical, stop dots y bubble indicador.',
    repoFile: 'src/app/shared/components/slider/slider.component.ts',
    snippet: '<m3-slider label="Descuento" unit="%" size="sm" [step]="5" [showStops]="true" [(value)]="discount" />'
  },
  {
    id: 'rule-buttons-hierarchy',
    component: 'Jerarquía de Botones (Filled / Tonal / Outlined / Text / Split / FAB)',
    category: 'buttons',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Una puerta principal bien visible por sala; si todas compiten igual, nadie distingue la salida correcta.',
    useWhen: 'Filled/FAB o Split Button para la acción primaria única; Tonal/Outlined para apoyo; Text para Cancelar.',
    avoidWhen: 'Poner dos o más botones Filled compitiendo lado a lado o meter botones dentro de Cards con [interactive]="true".',
    technicalWhy: 'Combina ≥48dp táctil, Corner Morphing espacial (24px ↔ 12px) y Split Menu nativo con popover="auto".',
    repoFile: 'src/app/shared/components/button/button.component.ts',
    snippet: '<m3-button variant="filled" icon="save" (action)="save()">Guardar</m3-button>'
  },
  {
    id: 'rule-chips',
    component: '<m3-chip> (Assist / Filter / Input / Suggestion)',
    category: 'buttons',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Etiquetas imantadas en tablero para filtrar o etiquetar al vuelo.',
    useWhen: 'Filtros rápidos sobre listas/tablas (filter), etiquetas removibles (input) o sugerencias contextuales.',
    avoidWhen: 'Usar Chips para reemplazar navegación principal de secciones o acciones primarias de guardado.',
    technicalWhy: 'Input chip removible separa dos botones hermanos dentro de .m3-chip-composite (cero controles anidados) y escucha (action).',
    repoFile: 'src/app/shared/components/chip/chip.component.ts',
    snippet: '<m3-chip type="filter" [selected]="onlyActive()" (action)="toggleFilter()">Solo activos</m3-chip>'
  },
  {
    id: 'rule-loading-vs-progress',
    component: 'Loading (< 5s) vs Progress Wavy (> 5s / %)',
    category: 'progress',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Un giro corto para esperas breves; barra con porcentaje real para procesos largos.',
    useWhen: '<m3-loading-indicator> en operaciones rápidas sin % (200ms–5s); <m3-linear-progress [wavy]="true"> si supera 5s o tiene %.',
    avoidWhen: 'Mostrar indicadores en respuestas <200ms o usar .animate-pulse en lugar de .m3-skeleton.m3-skeleton-shimmer.',
    technicalWhy: 'Loading corre 7 splines de 180 segmentos fuera de NgZone; Linear Progress mantiene stop dot 4dp de contraste.',
    repoFile: 'src/app/shared/components/progress/loading-indicator.component.ts',
    snippet: '<m3-loading-indicator [contained]="true" ariaLabel="Sincronizando..." />'
  },
  {
    id: 'rule-text-fields',
    component: '<m3-text-field> (Outlined vs Filled + :user-invalid)',
    category: 'inputs-cards',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Casillas con borde nítido en planillas extensas; cajas rellenas dentro de modales breves.',
    useWhen: 'Outlined en formularios largos multipaso; Filled dentro de diálogos modales compactos o buscadores sobre superficie limpia.',
    avoidWhen: 'Mostrar rojo de error antes de que el usuario interactúe o meter instrucciones largas dentro del <label>.',
    technicalWhy: 'Soporta :user-invalid diferido, auto-grow con field-sizing: content y enlaza prefix/suffix/error vía aria-describedby.',
    repoFile: 'src/app/shared/components/text-field/text-field.component.ts',
    snippet: '<m3-text-field label="Correo" type="email" variant="outlined" [clearable]="true" [(value)]="email" />'
  },
  {
    id: 'rule-cards',
    component: '<m3-card> (Elevated / Filled / Outlined — Cero anidamiento WCAG)',
    category: 'inputs-cards',
    moduleRef: 'components',
    sourceBadge: 'Estándar Web / WCAG',
    buildingAnalogy: 'Si toda la bandeja es clicable, no le atornilles otro botón encima: separa bandeja estática y botón hijo.',
    useWhen: 'Outlined en grids densos (6+ cards); Filled para agrupar bloques; Elevated para resúmenes clave; [interactive]="true" SOLO si no hay botones hijos.',
    avoidWhen: 'Activar [interactive]="true" (role="button") en una card que ya contiene <m3-button> o enlaces adentro.',
    technicalWhy: 'Evita controles interactivos anidados inválidos en accesibilidad y protege el foco de teclado.',
    repoFile: 'src/app/shared/components/card/card.component.ts',
    snippet: '<m3-card variant="outlined" [interactive]="false">...<m3-button>Acción</m3-button></m3-card>'
  },
  {
    id: 'rule-tabs-nav',
    component: '<m3-tabs> (Primary 3dp / Secondary 2dp) + Navigation Bar / Rail',
    category: 'navigation-tabs',
    moduleRef: 'components',
    sourceBadge: 'Google M3 Oficial',
    buildingAnalogy: 'Los pasillos principales son el Rail/Bar; las divisiones dentro de una oficina son Tabs.',
    useWhen: 'Primary tabs debajo de top app bars; Secondary dentro de cards/paneles. Bar (<600dp) y Rail/Drawer en pantallas anchas.',
    avoidWhen: 'Usar <m3-tabs> como menú global de toda la aplicación o replicar enlaces que ya existen en el Rail.',
    technicalWhy: 'Roving Tabindex automático (0 solo en activo, -1 en hermanos) + navegación por flechas RTL/LTR.',
    repoFile: 'src/app/shared/components/tabs/tabs.component.ts',
    snippet: '<m3-tabs variant="secondary" [tabs]="tabs" [(value)]="activeTab" />'
  },
  {
    id: 'rule-dialog-vs-popover',
    component: '<m3-dialog> (.showModal) vs Popover (@starting-style) vs <m3-snackbar>',
    category: 'overlays',
    moduleRef: 'components',
    sourceBadge: 'Estándar Web / WCAG',
    buildingAnalogy: 'Dialog cierra la puerta para confirmar algo crítico; Popover se descarta al tocar afuera; Snackbar informa abajo con opción Deshacer.',
    useWhen: '<m3-dialog> para confirmaciones/Dirty Guards; popover="auto" para menús; <m3-snackbar actionLabel="Deshacer"> para confirmaciones/reversión.',
    avoidWhen: 'Poner filter: blur() en un ancestro de modales hijos, crear traps JS manuales o poner popover="manual" en el host <m3-snackbar>.',
    technicalWhy: 'Top Layer nativo + transition-behavior: allow-discrete animan desde display: none sin pelear contra z-index.',
    repoFile: 'src/app/shared/components/dialog/dialog.component.ts',
    snippet: '<m3-snackbar [message]="msg()" actionLabel="Deshacer" (action)="undo()" [(open)]="open" />'
  },
  {
    id: 'rule-motion-physics-traps',
    component: 'Motion M3: Spatial vs Effects, Radios Acotados y Cero .transition-all',
    category: 'motion',
    moduleRef: 'motion',
    sourceBadge: 'Arquitectura M3E Web',
    buildingAnalogy: 'Bisagras con torque calibrado: apertura amplia (500ms), retorno suave (250ms), sin zonas muertas de 9999px.',
    useWhen: 'Dimensiones acotadas en px (24px ↔ 16px, max-w-full), transition-property explícita, Spatial para movimiento y Effects (1.0) para color.',
    avoidWhen: 'Usar rounded-full (9999px) en morfeos de borde, transition-all, animar height: auto o usar infinite alternate frenético.',
    technicalWhy: '9999px genera ~1s de zona muerta visual; max-width: none explota el ancho en t=0ms al colapsar; html[data-motion-scheme="standard"] conmuta todo globalmente.',
    repoFile: 'src/styles/_motion.css',
    snippet: 'style="transition-property: width, height, border-radius;" [style.border-radius]="open ? \'16px\' : \'24px\'"'
  },
  {
    id: 'rule-ports-adapters',
    component: 'Clean Architecture: Ports (abstract / InjectionToken) + Adapters en core/',
    category: 'architecture-perf',
    sourceBadge: 'Ingeniería Angular / Vercel',
    buildingAnalogy: 'En la pared instalas un enchufe estándar (Port); hoy conectas Mock/Local, mañana REST o GraphQL (Adapter) sin romper el muro.',
    useWhen: 'En todo acceso a datos, pagos, autenticación o telemetría dentro de features/: define el contrato abstracto y provee el Adapter vía DI.',
    avoidWhen: 'Inyectar HttpClient directo en componentes de presentación o acoplar reglas de negocio dentro de shared/components/.',
    technicalWhy: 'Desacopla UI de transporte, permite tests ultrarrápidos sin red real y soporta migración de APIs en un solo punto.',
    repoFile: 'src/app/features/design-system/pages/playbook/playbook-dispatch-port.ts',
    snippet: '{ provide: DispatchGatewayPort, useClass: HttpDispatchAdapter }'
  },
  {
    id: 'rule-defer-virtual',
    component: '@defer (on viewport/interaction) + CdkVirtualScrollViewport',
    category: 'architecture-perf',
    sourceBadge: 'Ingeniería Angular / Vercel',
    buildingAnalogy: 'No descargas todo el mobiliario pesado del edificio en la puerta el día uno: lo subes al piso justo cuando alguien abre esa sala.',
    useWhen: 'Subárboles pesados (@defer para gráficos, editores, CDK) y listados >100 filas (cdk-virtual-scroll-viewport + itemSize fijo).',
    avoidWhen: 'Renderizar @for con 1,000+ tarjetas complejas en el DOM inicial o importar el componente pesado fuera del @defer.',
    technicalWhy: 'Divide chunks JS independientes bajo el presupuesto de 1MB en angular.json y mantiene ~10-16 nodos DOM activos en scroll.',
    repoFile: 'src/app/features/design-system/pages/playbook/playbook-defer-payload.component.ts',
    snippet: '@defer (when deferActivated(); prefetch on hover) { <app-heavy-panel /> } @placeholder { <div class="m3-skeleton m3-skeleton-shimmer h-64"></div> }'
  },
  {
    id: 'rule-optimistic-rollback',
    component: 'Optimistic UI + Snapshot Rollback (vs Bloqueo Modal)',
    category: 'architecture-perf',
    sourceBadge: 'Ingeniería Angular / Vercel',
    buildingAnalogy: 'Anotas la orden en la pizarra al instante para seguir operando, pero guardas copia por si el camión falla y toca revertir.',
    useWhen: 'Acciones frecuentes y reversibles (aprobar lote, marcar favorito, mover estado Kanban) con fallback en Snackbar.',
    avoidWhen: 'Cobros bancarios o borrados destructivos irreversibles (usa confirmación explícita en <m3-dialog> + loading).',
    technicalWhy: 'Reduce la latencia percibida a 0ms manteniendo consistencia de datos mediante restauración inmutable del snapshot en catch().',
    repoFile: 'src/app/features/design-system/pages/playbook/playbook-examples-section.component.ts',
    snippet: 'const prev = orders(); orders.update(...); port.save().catch(() => orders.set(prev));'
  },
  {
    id: 'rule-vercel-spa',
    component: 'Deploy Vercel SPA (@angular/build:application + Rewrites)',
    category: 'architecture-perf',
    sourceBadge: 'Ingeniería Angular / Vercel',
    buildingAnalogy: 'Si el guardia de entrada (CDN Vercel) no conoce las habitaciones internas, sin un mapa hacia index.html devuelve puerta cerrada (404).',
    useWhen: 'En toda app Angular client-side con <base href="/"> y rutas de path (/pos, /design-system/playbook) subida a Vercel.',
    avoidWhen: 'Asumir que Vercel redirige solo a index.html sin vercel.json o apuntar a dist/ en vez de dist/<proyecto>/browser.',
    technicalWhy: 'Angular v18+ con @angular/build:application emite archivos estáticos en dist/m3-expressive-ui/browser y exige rewrites "(.*)" -> /index.html.',
    repoFile: 'vercel.json + angular.json',
    snippet: '{ "outputDirectory": "dist/m3-expressive-ui/browser", "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }'
  }
];

export const PLAYBOOK_BLUEPRINT_TABS: M3TabItem[] = [
  { id: 'ports', label: 'Ports & Adapters', icon: 'hub', panelId: 'bp-panel-ports' },
  { id: 'defer', label: '@defer + Virtual', icon: 'speed', panelId: 'bp-panel-defer' },
  { id: 'optimistic', label: 'Optimistic + Undo', icon: 'undo', panelId: 'bp-panel-optimistic' },
  { id: 'dirty-guard', label: 'Dirty Guard Modal', icon: 'shield', panelId: 'bp-panel-dirty' }
];

export const PLAYBOOK_BLUEPRINTS: readonly PlaybookBlueprint[] = [
  {
    id: 'ports',
    title: 'Receta 1: Clean Port & Adapter con InjectionToken / abstract class',
    icon: 'hub',
    summary:
      'La vista inyecta únicamente el Port abstracto; cambiar entre API real, local o simulador se decide en providers sin tocar HTML ni componentes M3.',
    componentsUsed: ['abstract class Port', 'InjectionToken', 'Adapter Injectable', 'Signal Store en Feature'],
    strictRules: [
      'Dependencia hacia adentro: Feature UI → Port abstracto ← Adapter HTTP/Mock.',
      'La UI nunca conoce URLs, headers HTTP ni DTOs crudos de backend.',
      'Ideal para testear con TestBed sobrescribiendo un único provider en memoria.'
    ],
    codeSnippet: `export abstract class DispatchGatewayPort {
  abstract saveStatus(id: string, status: Status): Promise<void>;
}

@Component({
  providers: [{ provide: DispatchGatewayPort, useClass: HttpDispatchAdapter }]
})
export class DispatchPageComponent {
  private readonly gateway = inject(DispatchGatewayPort);
}`
  },
  {
    id: 'defer',
    title: 'Receta 2: Carga Diferida (@defer) + Lista Virtualizada (@angular/cdk/scrolling)',
    icon: 'speed',
    summary:
      'Saca módulos pesados del bundle inicial con @defer + skeleton sin salto (CLS 0.00) y recicla nodos DOM al scrollear miles de filas.',
    componentsUsed: ['@defer (on viewport)', '@placeholder', '.m3-skeleton-shimmer', 'cdk-virtual-scroll-viewport'],
    strictRules: [
      'El componente hijo diferido NO debe referenciarse estáticamente fuera del bloque @defer.',
      'Mantén siempre altura explícita en @placeholder y en cdk-virtual-scroll-viewport para evitar CLS.',
      'Usa itemSize fijo + track por ID único para reciclar nodos a 120 FPS.'
    ],
    codeSnippet: `@defer (on viewport; prefetch on idle) {
  <cdk-virtual-scroll-viewport itemSize="56" class="h-80">
    <div *cdkVirtualFor="let row of rows(); trackBy: trackById" class="h-14">
      {{ row.title }}
    </div>
  </cdk-virtual-scroll-viewport>
} @placeholder (minimum 250ms) {
  <div class="h-80 m3-skeleton m3-skeleton-shimmer rounded-m3-lg"></div>
}`
  },
  {
    id: 'optimistic',
    title: 'Receta 3: Mutación Optimista en t=0ms + Rollback y Snackbar Undo',
    icon: 'undo',
    summary:
      'Responde al clic en 0ms guardando una instantánea previa: si falla el servidor revierte atómicamente; si triunfa ofrece Deshacer en Snackbar.',
    componentsUsed: ['Signal Snapshot', 'DispatchGatewayPort', '<m3-snackbar actionLabel>', 'Rollbacks'],
    strictRules: [
      'Nunca mutes arrays in-place antes de guardar copia: usa shallow/immutable snapshot previo.',
      'Si catch() se dispara, restaura el snapshot exacto y notifica el motivo claro.',
      'Reserva bloqueo modal solo para pagos o borrados irreversibles.'
    ],
    codeSnippet: `async toggleApprove(id: string): Promise<void> {
  const previous = this.orders();
  this.orders.update(list => list.map(o => o.id === id ? { ...o, status: 'approved' } : o));
  try {
    await this.gateway.saveStatus(id, 'approved');
    this.openUndoSnackbar(previous);
  } catch {
    this.orders.set(previous); // Rollback exacto
  }
}`
  },
  {
    id: 'dirty-guard',
    title: 'Receta 4: Resiliencia de Estado + Dirty Form Guard con <m3-dialog>',
    icon: 'shield',
    summary:
      'Ante un error de red mantiene intacto lo que escribió el usuario y protege contra cierres accidentales mediante <dialog>.showModal().',
    componentsUsed: ['<m3-text-field variant="outlined">', '<m3-dialog variant="expressive">', '<m3-linear-progress [wavy]="true">'],
    strictRules: [
      'El nodo del formulario permanece montado o en signal aun cuando ocurra un error HTTP 500.',
      'No mostrar errores antes de interactuar (:user-invalid automático en <m3-text-field>).',
      'Compara valor actual vs baseline para habilitar confirmación modal al descartar.'
    ],
    codeSnippet: `requestClose(): void {
  if (!this.isDirty()) { this.resetDraft(); return; }
  this.dirtyGuardDialogOpen.set(true); // Abre <m3-dialog> Top-Layer nativo
}

// @if (netState() === 'error') { banner arriba SIN destruir el <form> }`
  }
];

export const PLAYBOOK_TROUBLESHOOTING: readonly PlaybookTroubleshootItem[] = [
  {
    id: 'ts-vercel-404',
    layer: 'architecture',
    layerLabel: '5. Vercel / Deploy',
    symptom: 'En Vercel la página principal (/) abre, pero al recargar F5 en /design-system/playbook o /pos sale error 404.',
    cause: 'Falta vercel.json en la raíz con rewrites SPA hacia /index.html, o outputDirectory no apunta a dist/m3-expressive-ui/browser.',
    fixRule: 'Agrega vercel.json con outputDirectory: "dist/m3-expressive-ui/browser" y rewrite universal "/(.*)" → "/index.html".',
    fixSnippet: '{ "outputDirectory": "dist/m3-expressive-ui/browser", "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }'
  },
  {
    id: 'ts-bundle-scroll-lag',
    layer: 'architecture',
    layerLabel: '5. Velocidad / Bundle',
    symptom: 'El bundle inicial supera el límite de 1MB o una tabla larga con cientos de filas traba el scroll en móvil.',
    cause: 'Se importan vistas pesadas de forma eager sin @defer, o se renderizan >100 nodos complejos en DOM con @for tradicional.',
    fixRule: 'Envuelve paneles pesados en @defer (on viewport/interaction) + @placeholder skeleton y virtualiza listas con CdkVirtualScrollViewport.',
    fixSnippet: '@defer (on interaction) { <app-heavy-grid /> } @placeholder { <div class="h-64 m3-skeleton m3-skeleton-shimmer"></div> }'
  },
  {
    id: 'ts-optimistic-data-loss',
    layer: 'architecture',
    layerLabel: '5. Arquitectura / Estado',
    symptom: 'Cuando falla una petición HTTP, la UI queda en estado inconsistente o borra todo lo que el usuario había llenado.',
    cause: 'Se mutó el estado sin snapshot para Rollback o un @if (error) desmontó el <form> en lugar de mostrar un banner de reintento.',
    fixRule: 'Guarda snapshot previo antes de mutación optimista y mantén el estado del formulario en signals detrás de un Port desacoplado.',
    fixSnippet: 'const snapshot = items(); try { await port.save(); } catch { items.set(snapshot); }'
  },
  {
    id: 'ts-icons-text',
    layer: 'styles',
    layerLabel: '1. Styles (index.html)',
    route: '/design-system/styles',
    routeLabel: 'Revisar 1. Styles',
    symptom: 'Los íconos salen escritos como palabras ("close", "analytics", "favorite") en vez de dibujarse.',
    cause: 'Faltan las etiquetas <link> de Material Symbols Rounded (opsz,wght,FILL,GRAD) o falló la carga de fuentes en index.html.',
    fixRule: 'Verifica en tu nuevo repo el bloque <link> de Material Symbols Rounded y Plus Jakarta Sans en src/index.html.',
    fixSnippet: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0" />'
  },
  {
    id: 'ts-colors-import',
    layer: 'styles',
    layerLabel: '1. Styles (m3-expressive.css)',
    route: '/design-system/styles',
    routeLabel: 'Revisar 1. Styles',
    symptom: 'Las tarjetas no tienen color OKLCH o los chips/botones ignoran el --seed-hue y Modo Oscuro.',
    cause: 'No se importó src/styles/m3-expressive.css en el src/styles.css destino o se alteró el orden de cascada.',
    fixRule: 'Importa @import "./styles/m3-expressive.css"; primero en tu src/styles.css y copia src/styles/ completo.',
    fixSnippet: '@import "./styles/m3-expressive.css";'
  },
  {
    id: 'ts-9999-delay',
    layer: 'motion',
    layerLabel: '4. Motion (Forma)',
    route: '/design-system/motion',
    routeLabel: 'Revisar 4. Motion',
    symptom: 'Al expandir un botón o tarjeta píldora, los bordes tardan casi 1 segundo en empezar a cambiar.',
    cause: 'Usaste rounded-full (9999px) hacia 16px/28px: CSS interpola de 9999 hasta h/2 sin efecto visual perceptible.',
    fixRule: 'Reemplaza rounded-full por el radio acotado h/2 (ej. 24px ↔ 16px) usando tokens --md-comp-*-shape-pill.',
    fixSnippet: '[style.border-radius]="expanded() ? \'16px\' : \'24px\'" /* Nunca 9999px animado */'
  },
  {
    id: 'ts-maxwidth-explode',
    layer: 'motion',
    layerLabel: '4. Motion (Trampa CSS)',
    route: '/design-system/motion',
    routeLabel: 'Revisar 4. Motion',
    symptom: 'Al cerrar un Container Transform local, la caja pega un latigazo a lo ancho (100%) o queda un hueco vacío encogiéndose.',
    cause: 'Mezclaste w-full con ancho fijo (max-width: none salta en t=0ms) o usaste .transition-all y @if removiendo el contenido.',
    fixRule: 'Fija max-w-full invariante, interpola px ↔ px (ej. 288px ↔ 420px), usa transition-property explícita y opacidad short2.',
    fixSnippet: 'class="max-w-full overflow-hidden" [style.width]="open ? \'420px\' : \'288px\'" style="transition-property: width, height, border-radius;"'
  },
  {
    id: 'ts-dialog-blurry',
    layer: 'foundations',
    layerLabel: '2. Foundations / Overlays',
    route: '/design-system/foundations',
    routeLabel: 'Revisar 2. Foundations',
    symptom: 'El diálogo modal sale borroso, recortado o tapado por la barra lateral aunque tenga z-index: 99999.',
    cause: 'Un ancestro tiene filter: blur() (.stage-recessed) o overflow: hidden, atrapando position: fixed.',
    fixRule: 'Usa <m3-dialog> respaldado por <dialog>.showModal() o [popover="auto"] (.m3-popover-surface) en el Top Layer nativo.',
    fixSnippet: '<m3-dialog variant="expressive" headline="Confirmar" [(open)]="dlgOpen">...</m3-dialog>'
  },
  {
    id: 'ts-nested-card-button',
    layer: 'components',
    layerLabel: '3. Components (WCAG)',
    route: '/design-system/components',
    routeLabel: 'Revisar 3. Components',
    symptom: 'Al hacer clic en un botón dentro de una Card se dispara también la Card, o WCAG falla por controles anidados.',
    cause: 'Activaste [interactive]="true" (role="button" en toda la card) teniendo botones o chips hijos.',
    fixRule: 'Deja la card con [interactive]="false" si contiene acciones hijas, o quita botones internos si toda la card navega.',
    fixSnippet: '<m3-card variant="outlined" [interactive]="false">...<m3-button (action)="edit()">Editar</m3-button></m3-card>'
  },
  {
    id: 'ts-chip-click',
    layer: 'components',
    layerLabel: '3. Components (API)',
    route: '/design-system/components',
    routeLabel: 'Revisar 3. Components',
    symptom: 'El <m3-chip> o <m3-split-button> se ve bien en pantalla, pero hacer clic no ejecuta tu método.',
    cause: 'Binding al nombre incorrecto de output: <m3-chip> emite (action) y <m3-split-button> emite (primaryAction)/(itemAction).',
    fixRule: 'Conecta (action) en M3ChipComponent / M3ButtonComponent / M3CardComponent y (primaryAction)/(itemAction) en Split Button.',
    fixSnippet: '<m3-chip type="filter" [selected]="active()" (action)="toggle()">Filtro</m3-chip>'
  }
];

export const PLAYBOOK_STARTER_SNIPPETS = {
  copyScript: `# Desde tu repo semilla hacia un proyecto Angular nuevo (Kit Portable):
cp -r src/styles/ ../nuevo-cliente/src/styles/
echo '@import "./styles/m3-expressive.css";' > ../nuevo-cliente/src/styles.css
cp -r src/app/shared/components/ ../nuevo-cliente/src/app/shared/components/
mkdir -p ../nuevo-cliente/src/app/shared/utils ../nuevo-cliente/src/app/shared/models
cp src/app/shared/utils/clipboard.util.ts ../nuevo-cliente/src/app/shared/utils/
cp -r src/app/core/{theme,layout,dialog} ../nuevo-cliente/src/app/core/
cp vercel.json ../nuevo-cliente/vercel.json`,
  stylesOrder: `/* En src/styles.css del proyecto destino basta importar el entry point portable: */
@import "./styles/m3-expressive.css";

/* Orden interno garantizado dentro de src/styles/m3-expressive.css: */
@import "tailwindcss";
@import "./_token.css";
@import "./_shape.css";
@import "./_motion.css";
@import "./_elevation.css";
@import "./_typography.css";
@import "./_interaction.css";
@import "./_button.css"; ... @import "./_overlays.css";
@import "./_theme.css";`,
  indexHtml: `<meta name="color-scheme" content="light dark">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0" />`,
  vercelJson: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/m3-expressive-ui/browser",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`
} as const;
