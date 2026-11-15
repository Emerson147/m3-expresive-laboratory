import { M3TabItem } from '../../../shared/components/tabs/tabs.component';

export type PlaybookSourceBadge = 'Google M3 Oficial' | 'Estándar Web / WCAG' | 'Arquitectura M3E Web';

export type PlaybookCategory =
  | 'all'
  | 'selection'
  | 'buttons'
  | 'progress'
  | 'inputs-cards'
  | 'navigation-tabs'
  | 'overlays'
  | 'styles-motion';

export interface PlaybookLayerCard {
  id: string;
  step: string;
  title: string;
  metaphor5Years: string;
  whatLivesHere: string;
  copyRule: string;
  files: string[];
}

export interface PlaybookChecklistItem {
  id: string;
  layer: 'Capa 1: Styles' | 'Capa 2: Components' | 'Capa 3: Core' | 'Capa 4: Marca Cliente';
  title: string;
  why5Years: string;
  path: string;
  required: boolean;
}

export interface PlaybookSacredQuestion {
  number: string;
  question: string;
  kidExplanation: string;
  answerMap: { condition: string; pick: string }[];
}

export interface PlaybookDecisionRule {
  id: string;
  component: string;
  category: Exclude<PlaybookCategory, 'all'>;
  sourceBadge: PlaybookSourceBadge;
  kidAnalogy: string;
  useWhen: string;
  avoidWhen: string;
  technicalWhy: string;
  repoFile: string;
  snippet: string;
}

export interface PlaybookBlueprint {
  id: string;
  title: string;
  icon: string;
  summary5Years: string;
  componentsUsed: string[];
  strictRules: string[];
  codeSnippet: string;
}

export const PLAYBOOK_LAYERS: readonly PlaybookLayerCard[] = [
  {
    id: 'capa-1',
    step: 'Capa 1',
    title: 'La Pintura y los Bloques (src/styles/)',
    metaphor5Years:
      'Es la caja de crayones mágicos. Si cambias 1 solo crayón jefe (--seed-hue), toda la casa cambia de color sin pintar pared por pared.',
    whatLivesHere: 'Colores OKLCH adaptables, sombras, curvas de bordes, tipografía y animaciones CSS puras.',
    copyRule: 'SE COPIA COMPLETA al empezar cualquier cliente nuevo.',
    files: [
      'src/styles.css',
      'src/styles/_token.css',
      'src/styles/_shape.css',
      'src/styles/_motion.css',
      'src/styles/_interaction.css',
      'src/styles/_overlays.css'
    ]
  },
  {
    id: 'capa-2',
    step: 'Capa 2',
    title: 'Los Muebles Armados (src/app/shared/components/)',
    metaphor5Years:
      'Son sillas y mesas ya armadas y seguras. No tienes que cortar madera ni clavar botones nuevos cada vez que haces un cuarto.',
    whatLivesHere: 'Botones, Switch, Checkbox, Radio, Slider, Tabs, Text Field, Card, Progress, Loading, Dialog y Snackbar.',
    copyRule: 'COPIA la carpeta components/ completa y sus CSS hermanos (_button.css, _selection.css, _tabs.css, _dialog.css).',
    files: [
      'src/app/shared/components/button/',
      'src/app/shared/components/switch/',
      'src/app/shared/components/checkbox/',
      'src/app/shared/components/radio/',
      'src/app/shared/components/slider/',
      'src/app/shared/components/tabs/',
      'src/app/shared/components/dialog/',
      'src/app/shared/components/progress/'
    ]
  },
  {
    id: 'capa-3',
    step: 'Capa 3',
    title: 'La Electricidad y los Planos (src/app/core/)',
    metaphor5Years:
      'Es el interruptor de luz (día/noche) y la cinta métrica que sabe si estás viendo la casa en un celular chiquito o una tele gigante.',
    whatLivesHere: 'ThemeService (luz/oscuridad y color del cliente), AdaptiveLayoutService (Compact/Medium/Expanded) y DialogService.',
    copyRule: 'COPIA theme/, layout/ y dialog/ sin lógica de demos.',
    files: [
      'src/app/core/theme/theme.service.ts',
      'src/app/core/layout/adaptive-layout.service.ts',
      'src/app/core/dialog/dialog.service.ts',
      'src/app/core/dialog/stage-overlay.service.ts'
    ]
  },
  {
    id: 'capa-4',
    step: 'Capa 4',
    title: 'Las Habitaciones del Cliente (src/app/features/)',
    metaphor5Years:
      'Ahora sí armas el hospital, la tienda o la escuela del cliente poniendo adentro los muebles de la Capa 2, sin inventar botones raros.',
    whatLivesHere: 'Pantallas reales de negocio: POS, Pacientes, Inventario, Reportes. Consumen Capas 1, 2 y 3.',
    copyRule: 'NO se copia de los demos: aquí escribes las pantallas del cliente siguiendo las reglas del Oráculo.',
    files: [
      'src/app/features/<tu-modulo>/... (Pantallas del cliente)',
      'src/app/shared/ui/navigation.component.ts (Shell adaptable)'
    ]
  }
];

export const PLAYBOOK_CHECKLIST: readonly PlaybookChecklistItem[] = [
  {
    id: 'chk-index',
    layer: 'Capa 1: Styles',
    title: 'Configurar src/index.html (Plus Jakarta Sans, Material Symbols Rounded y color-scheme)',
    why5Years: 'Sin las fuentes y Material Symbols, tus íconos salen como palabras en inglés en lugar de dibujitos.',
    path: 'src/index.html',
    required: true
  },
  {
    id: 'chk-styles',
    layer: 'Capa 1: Styles',
    title: 'Copiar src/styles/ completo + src/styles.css (mantener orden de @import y @theme)',
    why5Years: 'Es la pintura OKLCH y las reglas de forma/movimiento. Si alteras el orden, el theme puede perder contraste.',
    path: 'src/styles.css + src/styles/_*.css',
    required: true
  },
  {
    id: 'chk-components',
    layer: 'Capa 2: Components',
    title: 'Copiar src/app/shared/components/ (los componentes esenciales 80/20)',
    why5Years: 'Aquí viven Switch, Checkbox, Radio, Slider, Tabs, Dialog, Buttons, Cards, TextField, Progress y Loading.',
    path: 'src/app/shared/components/',
    required: true
  },
  {
    id: 'chk-core',
    layer: 'Capa 3: Core',
    title: 'Copiar ThemeService, AdaptiveLayoutService y DialogService',
    why5Years: 'Controlan el modo claro/oscuro, el ancho de pantalla y la apertura segura de modales.',
    path: 'src/app/core/{theme,layout,dialog}/',
    required: true
  },
  {
    id: 'chk-shell',
    layer: 'Capa 3: Core',
    title: 'Adaptar navigation.component.ts y ui.models.ts a las rutas del cliente',
    why5Years: 'Te da Navigation Bar en celular y Navigation Rail en escritorio sin programar breakpoints a mano.',
    path: 'src/app/shared/ui/navigation.component.ts',
    required: true
  },
  {
    id: 'chk-brand',
    layer: 'Capa 4: Marca Cliente',
    title: 'Ajustar --seed-hue y --seed-chroma al color del cliente y limpiar rutas demo',
    why5Years: 'Pones el color oficial del negocio del cliente y borras los ejemplos del laboratorio que no necesites.',
    path: 'src/styles/_token.css',
    required: false
  }
];

export const PLAYBOOK_SACRED_QUESTIONS: readonly PlaybookSacredQuestion[] = [
  {
    number: '1',
    question: '¿Cuánto tiempo va a esperar el usuario?',
    kidExplanation: 'Si algo tarda menos de un parpadeo, no pongas rueditas que marean. Si tarda un poco o mucho, avisa distinto.',
    answerMap: [
      { condition: '< 200ms', pick: 'Nada (evita parpadeo visual / flash).' },
      { condition: '200ms – 5s sin %', pick: '<m3-loading-indicator> (7 formas con resorte).' },
      { condition: '> 5s o con % real', pick: '<m3-linear-progress> o <m3-circular-progress>.' }
    ]
  },
  {
    number: '2',
    question: '¿Es un botón de acción o una pregunta de elección?',
    kidExplanation: 'Un botón hace que pase algo YA ("Pagar"). Una elección dice cómo quieres algo ("Con queso" o "Modo oscuro").',
    answerMap: [
      { condition: 'Dispara una acción', pick: 'Filled / Tonal / Outlined / FAB según jerarquía.' },
      { condition: 'Prende o apaga AL INSTANTE', pick: '<m3-switch> (sin botón Guardar).' },
      { condition: 'Eliges para guardar después', pick: '<m3-checkbox> o <m3-radio-group>.' }
    ]
  },
  {
    number: '3',
    question: '¿Cuántas opciones tiene el usuario para elegir?',
    kidExplanation: 'Si solo hay 3 sabores de helado, muéstralos todos. Si hay 50 países, guárdalos en una lista desplegable.',
    answerMap: [
      { condition: '1 opción binaria inmediata', pick: '<m3-switch>.' },
      { condition: '2 – 5 opciones excluyentes', pick: '<m3-radio-group> o Button Group.' },
      { condition: '6 o más opciones', pick: '.m3-select-field (ahorra ruido visual).' }
    ]
  },
  {
    number: '4',
    question: '¿Cuántas cosas pueden brillar fuerte en esta pantalla?',
    kidExplanation: 'Si todo grita con luces de colores al mismo tiempo, nadie sabe dónde mirar ni qué apretar primero.',
    answerMap: [
      { condition: '1 acción estrella por vista', pick: 'Filled Button o FAB (máximo 1 Filled visible).' },
      { condition: 'Acciones de apoyo', pick: 'Tonal u Outlined (borde sutil).' },
      { condition: 'Acción suave / Cancelar', pick: 'Text Button.' }
    ]
  },
  {
    number: '5',
    question: '¿El aviso debe detener al usuario o dejarlo seguir trabajando?',
    kidExplanation: 'Si vas a borrar su cuenta, detén todo y pregunta. Si solo guardaste su foto, susurra abajo sin molestar.',
    answerMap: [
      { condition: 'Decisión obligatoria / crítica', pick: '<m3-dialog> (.showModal() nativo).' },
      { condition: 'Menú rápido que se cierra afuera', pick: 'popover="auto" (Escape + click afuera).' },
      { condition: 'Confirmación breve o "Deshacer"', pick: '<m3-snackbar> (popover="manual").' }
    ]
  }
];

export const PLAYBOOK_CATEGORY_FILTERS: readonly { id: PlaybookCategory; label: string }[] = [
  { id: 'all', label: 'Todo el Oráculo' },
  { id: 'selection', label: 'Selección (Switch / Check / Radio / Slider)' },
  { id: 'buttons', label: 'Botones y FAB' },
  { id: 'progress', label: 'Carga y Progreso' },
  { id: 'inputs-cards', label: 'Text Fields y Cards' },
  { id: 'navigation-tabs', label: 'Navegación y Tabs' },
  { id: 'overlays', label: 'Dialog y Overlays' },
  { id: 'styles-motion', label: 'Estilos OKLCH y Motion' }
];

export const PLAYBOOK_DECISION_RULES: readonly PlaybookDecisionRule[] = [
  {
    id: 'rule-switch',
    component: '<m3-switch> (Toggle binario inmediato)',
    category: 'selection',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'Como el apagador de la luz del cuarto: lo tocas y el foco ya prendió, no tienes que ir luego a apretar "Guardar luz".',
    useWhen: 'Ajustes de estado binario ON/OFF que surten efecto inmediato (notificaciones, modo oscuro, activar Wi-Fi).',
    avoidWhen: 'El usuario aún debe pulsar "Guardar" al final de un formulario, o para seleccionar ítems de una lista para borrar.',
    technicalWhy: '52×32dp con halo circular de 40dp solo en el thumb (nunca encoger el track). Separa aria-labelledby (<label>) de aria-describedby.',
    repoFile: 'src/app/shared/components/switch/switch.component.ts',
    snippet: '<m3-switch label="Alertas" description="En tiempo real" iconMode="selected" [(checked)]="alerts" />'
  },
  {
    id: 'rule-checkbox',
    component: '<m3-checkbox> (Selección múltiple + Tri-state)',
    category: 'selection',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'Como la lista del supermercado: tachas varias cosas que quieres llevar antes de pasar por la caja.',
    useWhen: 'Elegir 0, 1 o varias opciones a la vez, seleccionar filas de una tabla (con estado indeterminate), o aceptar términos antes de enviar.',
    avoidWhen: 'El cambio debe aplicarse al instante en ajustes del sistema (usa Switch) o cuando solo se puede elegir exactamente 1 entre varias (usa Radio).',
    technicalWhy: 'Caja visual 18×18dp dentro de un halo 40dp y blanco táctil 48×48dp sobre <input type="checkbox"> nativo con soporte indeterminate.',
    repoFile: 'src/app/shared/components/checkbox/checkbox.component.ts',
    snippet: '<m3-checkbox label="Acepto términos" [indeterminate]="partial()" [(checked)]="accepted" />'
  },
  {
    id: 'rule-radio-vs-select',
    component: '<m3-radio-group> vs .m3-select-field',
    category: 'selection',
    sourceBadge: 'Estándar Web / WCAG',
    kidAnalogy: 'Si solo tienes 3 gorras, ponlas sobre la mesa para verlas todas. Si tienes 30, guárdalas en una caja con etiqueta.',
    useWhen: '<m3-radio-group> cuando hay de 2 a 5 opciones mutuamente excluyentes que conviene comparar de un vistazo.',
    avoidWhen: 'Cuando tienes 6 o más opciones: cambia a .m3-select-field en _text-field.css. Nunca uses checkboxes cuando solo se vale elegir 1.',
    technicalWhy: '<fieldset> + <legend> + <input type="radio"> garantizan navegación con flechas del teclado gratis sin ARIA manual frágil.',
    repoFile: 'src/app/shared/components/radio/radio.component.ts',
    snippet: '<m3-radio-group legend="Plan" [options]="plans" [(value)]="selectedPlan" />'
  },
  {
    id: 'rule-slider',
    component: '<m3-slider> (Continuo / Discreto con Stop Dots)',
    category: 'selection',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'Como subir o bajar el volumen con una palanquita deslizante.',
    useWhen: 'Ajustar rangos numéricos continuos o con saltos claros (volumen, brillo, zoom, margen %, filtros de precio).',
    avoidWhen: 'Cuando el usuario necesita escribir un número exacto de muchos dígitos como un precio de factura $1,432.87 (usa Text Field).',
    technicalWhy: 'Nativo sobre <input type="range"> con tracks XS/SM/MD, brecha discontinua en la manija vertical, stop dots de 4dp y pill indicador.',
    repoFile: 'src/app/shared/components/slider/slider.component.ts',
    snippet: '<m3-slider label="Volumen" unit="%" size="sm" [step]="10" [showStops]="true" [(value)]="vol" />'
  },
  {
    id: 'rule-buttons-hierarchy',
    component: 'Jerarquía de Botones (Filled / Tonal / Outlined / Text / FAB)',
    category: 'buttons',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'En una obra de teatro solo hay 1 protagonista con foco de luz; si todos gritan igual, no entiendes la historia.',
    useWhen: 'Filled/FAB para la única acción principal; Tonal para acciones clave secundarias; Outlined para alternativas; Text para Cancelar.',
    avoidWhen: 'Poner dos o más botones Filled compitiendo lado a lado, o meter botones dentro de Cards clicables.',
    technicalWhy: 'Cumple ≥48dp táctil (touch-target extendido) y usa el principio M3 Corner Morphing en :active en vez de deformar tipografía.',
    repoFile: 'src/app/shared/components/button/button.component.ts',
    snippet: '<m3-button variant="filled" icon="save" (action)="save()">Guardar</m3-button>'
  },
  {
    id: 'rule-chips',
    component: '<m3-chip> (Assist / Filter / Input / Suggestion)',
    category: 'buttons',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'Son etiquetitas rápidas para filtrar tu mochila ("Rojos", "Grandes") o quitar un ingrediente que no quieres.',
    useWhen: 'Filtros rápidos sobre listas/tablas (filter), etiquetas removibles en buscadores (input) o sugerencias rápidas (suggestion).',
    avoidWhen: 'Usar Chips para navegar entre páginas principales del sistema (eso es Navigation o Tabs) o reemplazar botones principales.',
    technicalWhy: 'Prohibido anidar botones dentro de otros botones: el Input Chip usa wrapper visual y botones hermanos accesibles.',
    repoFile: 'src/app/shared/components/chip/chip.component.ts',
    snippet: '<m3-chip variant="filter" [(selected)]="onlyActive">Solo activos</m3-chip>'
  },
  {
    id: 'rule-loading-vs-progress',
    component: 'Loading (< 5s) vs Progress (> 5s / %)',
    category: 'progress',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'Si vas a buscar una pelota que está cerca, solo haces señas; si construyes un castillo de 10 pisos, enseñas cuántos pisos llevas.',
    useWhen: '<m3-loading-indicator> en esperas breves sin % (200ms–5s) o Pull-to-refresh; Progress Wavy lineal/circular si supera 5s o conoces el %.',
    avoidWhen: 'Poner animación si tarda < 200ms (parpadea), inventar porcentajes falsos, o cambiar de circular a lineal en medio de la misma carga.',
    technicalWhy: 'Loading corre 7 polígonos fuera de NgZone (spring 0.6/200). Progress lineal usa stop-dot 4dp para garantizar contraste ≥3:1.',
    repoFile: 'src/app/shared/components/progress/loading-indicator.component.ts',
    snippet: '<m3-loading-indicator [contained]="true" ariaLabel="Cargando orden..." />'
  },
  {
    id: 'rule-text-fields',
    component: '<m3-text-field> (Outlined vs Filled)',
    category: 'inputs-cards',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'En una hoja larga con muchas preguntas usa cajas con contorno para ver rápido cada pregunta; en una ventanita corta usa cajas rellenas.',
    useWhen: 'Outlined en formularios largos o multipaso sobre fondos claros; Filled dentro de diálogos, barras rápidas y filtros compactos.',
    avoidWhen: 'Mezclar Filled y Outlined dentro del mismo formulario, o meter errores e instrucciones largas dentro del propio <label>.',
    technicalWhy: 'Usa aria-describedby separado para supporting/error text y soporta :user-invalid sin regañar al usuario antes de que escriba.',
    repoFile: 'src/app/shared/components/text-field/text-field.component.ts',
    snippet: '<m3-text-field label="Correo" type="email" variant="outlined" [(value)]="email" />'
  },
  {
    id: 'rule-cards',
    component: '<m3-card> (Elevated / Filled / Outlined)',
    category: 'inputs-cards',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'Son charolas de distintos materiales: con sombra para destacar sobre mesa plana, con borde fino para ordenar muchas iguales.',
    useWhen: 'Outlined en grids densos de 6+ tarjetas repetidas; Filled para separar bloques de resumen; Elevated sobre fondo neutro con pocos ítems.',
    avoidWhen: 'Hacer toda la card clicable si adentro ya tiene botones de acción (anida elementos interactivos y rompe WCAG).',
    technicalWhy: 'Define superficie semántica OKLCH (surface-container-low / highest) y estado hover/focus sin mutar márgenes externos.',
    repoFile: 'src/app/shared/components/card/card.component.ts',
    snippet: '<m3-card variant="outlined" tone="default">...</m3-card>'
  },
  {
    id: 'rule-tabs',
    component: '<m3-tabs> (Primary 3dp vs Secondary 2dp)',
    category: 'navigation-tabs',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'Son separadores de un cuaderno: los grandes dividen materias (Matemáticas/Arte); los chicos dividen temas dentro de una materia.',
    useWhen: 'Primary (indicador 3dp redondeado) para vistas principales debajo del top bar; Secondary (indicador 2dp) dentro de cards o sub-paneles.',
    avoidWhen: 'Usar Tabs como navegación global de toda la app (usa Navigation Bar/Rail) o cuando tengas más de 5 pestañas difíciles de leer.',
    technicalWhy: 'Implementa Roving Tabindex (0 solo en activo, -1 en inactivos), Home/End y flechas conscientes de RTL con role="tablist".',
    repoFile: 'src/app/shared/components/tabs/tabs.component.ts',
    snippet: '<m3-tabs variant="primary" [tabs]="items" [(value)]="activeTab" />'
  },
  {
    id: 'rule-navigation',
    component: 'Navigation Bar (Móvil) vs Navigation Rail (Desktop)',
    category: 'navigation-tabs',
    sourceBadge: 'Google M3 Oficial',
    kidAnalogy: 'En teléfono pequeño los botones van abajo cerca de tu pulgar; en pantalla ancha se mudan al lado izquierdo para dejar espacio al centro.',
    useWhen: 'Navigation Bar en Compact (< 600px) con 3–5 destinos principales; Rail en Medium/Expanded con submenús desplegables accesibles.',
    avoidWhen: 'Meter 8 enlaces en una barra inferior de celular o dejar una Navigation Bar gigante flotando en monitores de escritorio.',
    technicalWhy: 'Impulsa el shell adaptativo mediante AdaptiveLayoutService usando inert en submenús cerrados para proteger el orden de foco.',
    repoFile: 'src/app/shared/ui/navigation.component.ts',
    snippet: 'AdaptiveLayoutService.windowSizeClass() // compact | medium | expanded'
  },
  {
    id: 'rule-dialog-vs-popover',
    component: '<m3-dialog> (<dialog>.showModal) vs Popover vs Snackbar',
    category: 'overlays',
    sourceBadge: 'Estándar Web / WCAG',
    kidAnalogy: '<dialog> cierra la puerta del cuarto hasta que respondas; popover="auto" es una nota que se va si tocas fuera; snackbar solo saluda abajo.',
    useWhen: '<m3-dialog> para confirmaciones destructivas/formularios modales; popover="auto" para menús; popover="manual" en <m3-snackbar>.',
    avoidWhen: 'Escribir focus traps manuales en JavaScript para modales, pelear con z-index: 99999, o cerrar un Snackbar con clic accidental afuera.',
    technicalWhy: 'showModal() aplica inert nativo al fondo, maneja Escape y Top Layer; @starting-style anima entrada/salida discreta a 60fps.',
    repoFile: 'src/app/shared/components/dialog/dialog.component.ts',
    snippet: '<m3-dialog #d headline="¿Eliminar registro?" [(open)]="confirmOpen">...</m3-dialog>'
  },
  {
    id: 'rule-oklch-motion',
    component: 'Semilla OKLCH, Esquema de Motion y Física de Resortes',
    category: 'styles-motion',
    sourceBadge: 'Arquitectura M3E Web',
    kidAnalogy: 'Con dos perillas globales cambiás la personalidad entera: más vibrante y elástica (Expressive) o más calma y sobria (Minimalismo Zen) sin tocar ningún botón.',
    useWhen: 'Al configurar la identidad del proyecto: ajusta --seed-hue / --seed-chroma (colores) y data-motion-scheme="standard" (cuando quieras Minimalismo Zen en vez de Expressive).',
    avoidWhen: 'Hardcodear tokens --md-sys-motion-spring-expressive-* dentro de controles reutilizables, inventar hex, usar transition: all o resetear animación a 1ms !important.',
    technicalWhy: 'Los componentes consumen el alias genérico --md-sys-motion-spring-fast-spatial; ThemeService.setMotionScheme("standard") + setSeedChroma() redefinen todo el framework desde <html> sin tocar componentes.',
    repoFile: 'src/styles/_motion.css',
    snippet: ':root { --seed-hue: 255; --seed-chroma: 0.14; } /* + html[data-motion-scheme="standard"] */'
  }
];

export const PLAYBOOK_BLUEPRINT_TABS: M3TabItem[] = [
  { id: 'crud', label: 'CRUD & Form', icon: 'edit_document', panelId: 'bp-panel-crud' },
  { id: 'settings', label: 'Preferencias', icon: 'tune', panelId: 'bp-panel-settings' },
  { id: 'pos', label: 'POS / Tabla', icon: 'point_of_sale', panelId: 'bp-panel-pos' },
  { id: 'modal', label: 'Modales Safe', icon: 'dialogs', panelId: 'bp-panel-modal' }
];

export const PLAYBOOK_BLUEPRINTS: readonly PlaybookBlueprint[] = [
  {
    id: 'crud',
    title: 'Receta 1: Formulario CRUD de Negocio (Cliente / Producto / Paciente)',
    icon: 'edit_document',
    summary5Years:
      'Cuando llenas una ficha larga para guardar datos nuevos: cajas con borde (Outlined), opciones cortas en Radio, largas en Select, y 1 solo botón principal Guardar.',
    componentsUsed: ['<m3-card variant="outlined">', '<m3-text-field variant="outlined">', '<m3-radio-group>', '<m3-checkbox>', '<m3-button variant="filled">', '<m3-snackbar>'],
    strictRules: [
      'Regla M3 Input: Formularios largos usan TextField Outlined (no mezcles Filled y Outlined en la misma tarjeta).',
      'Regla Web Forms: < 6 opciones usa <m3-radio-group>; 6 o más opciones usa .m3-select-field.',
      'Regla A11y: Nunca metas el error o ayuda dentro del <label>; el componente ya los enlaza vía aria-describedby.',
      'Regla Confirmación: Al guardar muestra <m3-snackbar popover="manual">; al eliminar pide confirmación en <m3-dialog>.'
    ],
    codeSnippet: `<m3-card variant="outlined">
  <form (submit)="onSave($event)" class="space-y-4">
    <m3-text-field label="Nombre del cliente" variant="outlined" [(value)]="name" />
    <m3-radio-group legend="Régimen" [options]="regimenOptions" [(value)]="regimen" />
    <m3-checkbox label="Emitir factura electrónica automática" [(checked)]="autoInvoice" />
    <div class="flex justify-end gap-2">
      <m3-button variant="text" (action)="reset()">Cancelar</m3-button>
      <m3-button variant="filled" icon="save" type="submit">Guardar ficha</m3-button>
    </div>
  </form>
</m3-card>`
  },
  {
    id: 'settings',
    title: 'Receta 2: Panel de Configuración y Preferencias Instantáneas',
    icon: 'tune',
    summary5Years:
      'Si estás en Ajustes del sistema, cada interruptor (Switch) y palanquita (Slider) funciona al momento sin obligarte a apretar un botón extra abajo.',
    componentsUsed: ['<m3-tabs variant="secondary">', '<m3-switch>', '<m3-slider>', '<m3-card variant="filled">', '<m3-snackbar>'],
    strictRules: [
      'Regla Switch vs Checkbox: Todo interruptor en Ajustes usa <m3-switch> y persiste el cambio al instante con feedback breve.',
      'Regla Switch Icon: Si la densidad visual es alta usa iconMode="selected" o "none"; si necesitas refuerzo ON/OFF usa iconMode="both".',
      'Regla Slider: Activa [showStops]="true" cuando hay pasos discretos (ej. pasos de 10% o 25%).',
      'Regla Tabs: Usa variant="secondary" (línea 2dp) para dividir sub-categorías de ajustes dentro de la página.'
    ],
    codeSnippet: `<m3-tabs variant="secondary" [tabs]="settingsTabs" [(value)]="section" />
<div class="space-y-4 p-4 bg-surface-box rounded-m3-xl border border-outline-sub">
  <m3-switch
    label="Respaldo automático"
    description="Sube copia cifrada cada cierre de caja"
    iconMode="selected"
    [(checked)]="autoBackup" />
  <m3-slider
    label="Límite máximo de descuento (%)"
    unit="%"
    size="sm"
    [min]="0" [max]="50" [step]="5" [showStops]="true"
    [(value)]="maxDiscount" />
</div>`
  },
  {
    id: 'pos',
    title: 'Receta 3: Pantalla Operativa Densa (POS / Inventario / Clínica)',
    icon: 'point_of_sale',
    summary5Years:
      'Para trabajar rápido todo el día: filtros con Chips arriba, Tabs para cambiar de vista, Loading morphing para cargas rápidas y Split Button para cobrar o imprimir.',
    componentsUsed: ['<m3-tabs variant="primary">', '<m3-chip variant="filter">', '<m3-loading-indicator>', '<m3-split-button>', '<m3-card variant="outlined">'],
    strictRules: [
      'Regla Espera: Latencia POS / consulta rápida (200ms–5s) usa <m3-loading-indicator [contained]="true">; descarga pesada > 5s usa <m3-linear-progress>.',
      'Regla Cards Densas: En catálogos de 10+ tarjetas usa variant="outlined" para no saturar con sombras.',
      'Regla Anidamiento WCAG: Nunca pongas botones dentro de una Card que ya tiene (click) completo.',
      'Regla Split Button: Acción primaria ("Cobrar") a la izquierda + flecha menu popover="auto" ("Cotizar / Ticket") a la derecha.'
    ],
    codeSnippet: `<m3-tabs variant="primary" [tabs]="posTabs" [(value)]="view" />
@if (loadingQuickSync()) {
  <m3-loading-indicator [contained]="true" ariaLabel="Sincronizando catálogo..." />
}
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  @for (item of items(); track item.id) {
    <m3-card variant="outlined">...</m3-card>
  }
</div>`
  },
  {
    id: 'modal',
    title: 'Receta 4: Diálogo Modal Seguro y Confirmaciones Críticas',
    icon: 'dialogs',
    summary5Years:
      'Cuando vas a hacer algo delicado (como anular una venta), abres una ventana que oscurece todo lo de atrás, atrapa el teclado solo ahí y se cierra con Escape.',
    componentsUsed: ['<m3-dialog>', '<m3-text-field variant="filled">', '<m3-button variant="text">', '<m3-button variant="filled">'],
    strictRules: [
      'Regla Modal Nativo: Usa siempre <m3-dialog> respaldado por <dialog>.showModal(); jamás crees traps JS manuales ni z-index: 9999.',
      'Regla TextField Modal: Dentro de diálogos compactos usa variant="filled" para diferenciarlo del fondo claro del documento.',
      'Regla Botones Modal: Acción destructiva/confirmar a la derecha (Filled) y cancelar a su izquierda (Text).'
    ],
    codeSnippet: `<m3-dialog
  #voidDlg
  headline="Anular comprobante #408"
  icon="warning"
  ariaDescription="Esta acción libera el stock y queda registrada en auditoría."
  [(open)]="voidOpen">
  <m3-text-field label="Motivo de anulación" variant="filled" [(value)]="reason" />
  <div dialog-actions>
    <m3-button variant="text" (action)="voidDlg.dismiss('cancel')">Cancelar</m3-button>
    <m3-button variant="filled" icon="delete" (action)="voidDlg.dismiss('confirm')">Anular</m3-button>
  </div>
</m3-dialog>`
  }
];

export const PLAYBOOK_STARTER_SNIPPETS = {
  indexHtml: `<meta name="color-scheme" content="light dark">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0" />`,
  stylesOrder: `@import "tailwindcss";
@import "./styles/_token.css";
@import "./styles/_shape.css";
@import "./styles/_motion.css";
@import "./styles/_elevation.css";
@import "./styles/_typography.css";
@import "./styles/_interaction.css";
@import "./styles/_button.css";
@import "./styles/_card.css";
@import "./styles/_chip.css";
@import "./styles/_text-field.css";
@import "./styles/_progress.css";
@import "./styles/_switch.css";
@import "./styles/_selection.css";
@import "./styles/_tabs.css";
@import "./styles/_dialog.css";
@import "./styles/_overlays.css";`,
  copyScript: `# Desde tu repo semilla hacia un proyecto Angular nuevo:
cp -r src/styles/ ../nuevo-cliente/src/styles/
cp src/styles.css ../nuevo-cliente/src/styles.css
cp -r src/app/shared/components/ ../nuevo-cliente/src/app/shared/components/
cp -r src/app/core/{theme,layout,dialog} ../nuevo-cliente/src/app/core/
# Luego en ../nuevo-cliente/src/styles/_token.css ajusta --seed-hue y --seed-chroma`
} as const;
