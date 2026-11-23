export interface TheaterCardSpec {
  id: string;
  role: string;
  title: string;
  token: string;
  css: string;
  android: string;
  durationToken: string;
  durationMs: number;
  animName: string;
  animationType: 'decelerate' | 'onscreen' | 'accelerate';
  why: string;
  when: string;
  svgCurve: string;
  svgArea: string;
}

export interface TheaterSetSpec {
  title: string;
  description: string;
  cards: TheaterCardSpec[];
}

export interface CanonicalEasingSpec {
  name: string;
  label: string;
  category: 'Emphasized' | 'Standard' | 'Legacy';
  token: string;
  curve: string;
  cssVar: string;
  android: string;
  flutter: string;
  ios: string;
  svgCurve: string;
  svgArea: string;
  usage: string;
}

export interface CanonicalDurationSpec {
  name: string;
  ms: number;
  category: 'Short' | 'Medium' | 'Long' | 'Extra Long';
  usage: string;
}

export type SpringStyle = 'expressive' | 'standard';
export type SpringSpeed = 'fast' | 'default' | 'slow';

export interface SpringCurveSpec {
  curve: string;
  duration: number;
  token: string;
}

export interface ModernWebMotionPrimitiveSpec {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly summary: string;
  readonly rule: string;
  readonly snippet: string;
}

export const MOTION_THEATER_SETS: Record<'emphasized' | 'standard', TheaterSetSpec> = {
  emphasized: {
    title: 'Emphasized Easing Set',
    description:
      'Conjunto principal de M3 Expressive. Brinda carácter y aceleración pronunciada para guiar la atención del usuario.',
    cards: [
      {
        id: 'emphasized-decelerate',
        role: 'Entrada a Pantalla',
        title: 'Emphasized Decelerate',
        token: 'md.sys.motion.easing.emphasized.decelerate',
        css: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        android: 'PathInterpolator(0.05f, 0.7f, 0.1f, 1f)',
        durationToken: 'medium4 (400ms) / long2 (500ms)',
        durationMs: 450,
        animName: 'm3TheaterDecelerate',
        animationType: 'decelerate',
        why: 'Comienza a alta velocidad para dar feedback inmediato y desacelera suavemente para que el ojo asimile el contenido sin frenazos bruscos.',
        when: 'Modales, diálogos, drawers laterales, bottom sheets y menús principales.',
        svgCurve: 'M 5 80 C 11.5 31, 18 10, 135 10',
        svgArea: 'M 5 80 C 11.5 31, 18 10, 135 10 L 135 80 Z'
      },
      {
        id: 'emphasized',
        role: 'En Pantalla (Continuidad)',
        title: 'Emphasized (On-Screen)',
        token: 'md.sys.motion.easing.emphasized',
        css: 'linear(0, 0.015 4.2%, 0.073 9%, 0.194 13.4%, 0.4 16.7%, 0.573 18.8%, 0.715 22.3%, 0.858 31.8%, 0.95 49.7%, 0.988 70.8%, 1)',
        android: 'pathInterpolator(M 0,0 C 0.05, 0, 0.133, 0.06 ...)',
        durationToken: 'long2 (500ms) / medium1 (250ms)',
        durationMs: 500,
        animName: 'm3TheaterOnScreen',
        animationType: 'onscreen',
        why: 'Despegue rápido en el primer 22% y frenado prolongado y sedoso en el 78% final. Regla M3 para todo elemento que inicia y termina visible en pantalla.',
        when: 'Container Transform (abrir 500ms / volver 250ms), expansión de cards, morphing en pantalla y drawers recuperables.',
        svgCurve: 'M 5 80 C 11.5 80, 22.3 75.8, 26.6 52 C 32 22.6, 37.5 10, 135 10',
        svgArea: 'M 5 80 C 11.5 80, 22.3 75.8, 26.6 52 C 32 22.6, 37.5 10, 135 10 L 135 80 Z'
      },
      {
        id: 'emphasized-accelerate',
        role: 'Salida Permanente',
        title: 'Emphasized Accelerate',
        token: 'md.sys.motion.easing.emphasized.accelerate',
        css: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
        android: 'PathInterpolator(0.3f, 0f, 0.8f, 0.15f)',
        durationToken: 'short4 (200ms) / short3 (150ms)',
        durationMs: 200,
        animName: 'm3TheaterAccelerate',
        animationType: 'accelerate',
        why: 'Arranca lento y termina a velocidad máxima fuera del marco para comunicar descarte definitivo. Nunca usarla si el elemento vuelve a reposar en pantalla.',
        when: 'Cierre de diálogos descartables, dismiss de snackbars/banners (no para retorno de Hero/Cards).',
        svgCurve: 'M 5 80 C 44 80, 109 69.5, 135 10',
        svgArea: 'M 5 80 C 44 80, 109 69.5, 135 10 L 135 80 Z'
      }
    ]
  },
  standard: {
    title: 'Standard Easing Set',
    description:
      'Conjunto utilitario y sobrio. Minimiza la distracción visual en interfaces densas y acciones repetitivas de alta frecuencia.',
    cards: [
      {
        id: 'standard-decelerate',
        role: 'Entrada Utilitaria',
        title: 'Standard Decelerate',
        token: 'md.sys.motion.easing.standard.decelerate',
        css: 'cubic-bezier(0, 0, 0, 1)',
        android: 'PathInterpolator(0f, 0f, 0f, 1f)',
        durationToken: 'medium1 (250ms) / medium2 (300ms)',
        durationMs: 250,
        animName: 'm3TheaterDecelerate',
        animationType: 'decelerate',
        why: 'Entrada directa sin aceleración previa. Ideal para componentes compactos donde la inercia dramática sería exagerada.',
        when: 'Tooltips, popovers, menús desplegables, select dropdowns.',
        svgCurve: 'M 5 80 C 5 80, 5 10, 135 10',
        svgArea: 'M 5 80 C 5 80, 5 10, 135 10 L 135 80 Z'
      },
      {
        id: 'standard',
        role: 'En Pantalla (Utilitario)',
        title: 'Standard (On-Screen)',
        token: 'md.sys.motion.easing.standard',
        css: 'cubic-bezier(0.2, 0, 0, 1)',
        android: 'PathInterpolator(0.2f, 0f, 0f, 1f)',
        durationToken: 'short4 (200ms) / medium1 (250ms)',
        durationMs: 200,
        animName: 'm3TheaterOnScreen',
        animationType: 'onscreen',
        why: 'Curva equilibrada sin sobrepaso elástico. Mueve elementos rápidamente manteniendo la interfaz controlada.',
        when: 'Micro-interacciones simples, hover states, switches, focus rings.',
        svgCurve: 'M 5 80 C 31 80, 5 10, 135 10',
        svgArea: 'M 5 80 C 31 80, 5 10, 135 10 L 135 80 Z'
      },
      {
        id: 'standard-accelerate',
        role: 'Salida Utilitaria',
        title: 'Standard Accelerate',
        token: 'md.sys.motion.easing.standard.accelerate',
        css: 'cubic-bezier(0.3, 0, 1, 1)',
        android: 'PathInterpolator(0.3f, 0f, 1f, 1f)',
        durationToken: 'short3 (150ms) / short4 (200ms)',
        durationMs: 150,
        animName: 'm3TheaterAccelerate',
        animationType: 'accelerate',
        why: 'Salida limpia y predecible. Cierra elementos secundarios de forma instantánea sin retrasos perceptibles.',
        when: 'Ocultar tooltips, cerrar menús emergentes, descartar chips.',
        svgCurve: 'M 5 80 C 44 80, 135 10, 135 10',
        svgArea: 'M 5 80 C 44 80, 135 10, 135 10 L 135 80 Z'
      }
    ]
  }
};

export const CANONICAL_EASINGS: CanonicalEasingSpec[] = [
  {
    name: 'emphasized',
    label: 'Emphasized',
    category: 'Emphasized',
    token: 'md.sys.motion.easing.emphasized',
    curve: 'linear(0, 0.015 4.2%, 0.073 9%, 0.194 13.4%, 0.4 16.7%, 0.573 18.8%, 0.715 22.3%, 0.858 31.8%, 0.95 49.7%, 0.988 70.8%, 1)',
    cssVar: '--md-sys-motion-easing-emphasized',
    android: 'PathInterpolator(M 0,0 C 0.05, 0, 0.133, 0.06, 0.166, 0.4 C 0.208, 0.82, 0.25, 1, 1, 1)',
    flutter: 'Curves.easeInOutCubicEmphasized',
    ios: 'ControlPoints:0.2f:0.0f:0.0f:1.0f (Fallback)',
    svgCurve: 'M 15 55 C 18.5 55, 24.3 52.6, 26.6 39 C 29.6 22.2, 32.5 15, 85 15',
    svgArea: 'M 15 55 C 18.5 55, 24.3 52.6, 26.6 39 C 29.6 22.2, 32.5 15, 85 15 L 85 55 Z',
    usage: 'Transiciones que inician y terminan en pantalla (500ms abrir / 250ms regresar).'
  },
  {
    name: 'emphasized-decelerate',
    label: 'Emphasized Decelerate',
    category: 'Emphasized',
    token: 'md.sys.motion.easing.emphasized.decelerate',
    curve: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    cssVar: '--md-sys-motion-easing-emphasized-decelerate',
    android: 'PathInterpolator(0.05f, 0.7f, 0.1f, 1f)',
    flutter: 'Cubic(0.05, 0.7, 0.1, 1.0)',
    ios: 'ControlPoints:0.05f:0.7f:0.1f:1.0f',
    svgCurve: 'M 15 55 C 18.5 27, 22 15, 85 15',
    svgArea: 'M 15 55 C 18.5 27, 22 15, 85 15 L 85 55 Z',
    usage: 'Entrada a pantalla con frenado suave (diálogos, drawers, cards expandidas).'
  },
  {
    name: 'emphasized-accelerate',
    label: 'Emphasized Accelerate',
    category: 'Emphasized',
    token: 'md.sys.motion.easing.emphasized.accelerate',
    curve: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    cssVar: '--md-sys-motion-easing-emphasized-accelerate',
    android: 'PathInterpolator(0.3f, 0f, 0.8f, 0.15f)',
    flutter: 'Cubic(0.3, 0.0, 0.8, 0.15)',
    ios: 'ControlPoints:0.3f:0.0f:0.8f:0.15f',
    svgCurve: 'M 15 55 C 36 55, 71 49, 85 15',
    svgArea: 'M 15 55 C 36 55, 71 49, 85 15 L 85 55 Z',
    usage: 'Salida de pantalla rápida para elementos descartados (dismiss, cerrar modal).'
  },
  {
    name: 'standard',
    label: 'Standard',
    category: 'Standard',
    token: 'md.sys.motion.easing.standard',
    curve: 'cubic-bezier(0.2, 0, 0, 1)',
    cssVar: '--md-sys-motion-easing-standard',
    android: 'PathInterpolator(0.2f, 0f, 0f, 1f)',
    flutter: 'Cubic(0.2, 0.0, 0, 1.0)',
    ios: 'ControlPoints:0.2f:0.0f:0.0f:1.0f',
    svgCurve: 'M 15 55 C 29 55, 15 15, 85 15',
    svgArea: 'M 15 55 C 29 55, 15 15, 85 15 L 85 55 Z',
    usage: 'Transición utilitaria sobria para elementos en pantalla.'
  },
  {
    name: 'standard-decelerate',
    label: 'Standard Decelerate',
    category: 'Standard',
    token: 'md.sys.motion.easing.standard.decelerate',
    curve: 'cubic-bezier(0, 0, 0, 1)',
    cssVar: '--md-sys-motion-easing-standard-decelerate',
    android: 'PathInterpolator(0f, 0f, 0f, 1f)',
    flutter: 'Cubic(0, 0, 0, 1)',
    ios: 'ControlPoints:0.0f:0.0f:0.0f:1.0f',
    svgCurve: 'M 15 55 C 15 55, 15 15, 85 15',
    svgArea: 'M 15 55 C 15 55, 15 15, 85 15 L 85 55 Z',
    usage: 'Entrada directa sin aceleración inicial para elementos pequeños (popovers).'
  },
  {
    name: 'standard-accelerate',
    label: 'Standard Accelerate',
    category: 'Standard',
    token: 'md.sys.motion.easing.standard.accelerate',
    curve: 'cubic-bezier(0.3, 0, 1, 1)',
    cssVar: '--md-sys-motion-easing-standard-accelerate',
    android: 'PathInterpolator(0.3f, 0f, 1f, 1f)',
    flutter: 'Cubic(0.3, 0.0, 1.0, 1.0)',
    ios: 'ControlPoints:0.3f:0.0f:1.0f:1.0f',
    svgCurve: 'M 15 55 C 36 55, 85 15, 85 15',
    svgArea: 'M 15 55 C 36 55, 85 15, 85 15 L 85 55 Z',
    usage: 'Salida utilitaria compacta para descartar elementos secundarios rápido.'
  },
  {
    name: 'legacy',
    label: 'Legacy',
    category: 'Legacy',
    token: 'md.sys.motion.easing.legacy',
    curve: 'cubic-bezier(0.4, 0, 0.2, 1)',
    cssVar: '--md-sys-motion-easing-legacy',
    android: 'PathInterpolator(0.4f, 0f, 0.2f, 1f)',
    flutter: 'Curves.fastOutSlowIn',
    ios: 'ControlPoints:0.4f:0.0f:0.2f:1.0f',
    svgCurve: 'M 15 55 C 43 55, 29 15, 85 15',
    svgArea: 'M 15 55 C 43 55, 29 15, 85 15 L 85 55 Z',
    usage: 'Curva Material 2 clásica de transición simétrica.'
  },
  {
    name: 'legacy-decelerate',
    label: 'Legacy Decelerate',
    category: 'Legacy',
    token: 'md.sys.motion.easing.legacy.decelerate',
    curve: 'cubic-bezier(0, 0, 0.2, 1)',
    cssVar: '--md-sys-motion-easing-legacy-decelerate',
    android: 'PathInterpolator(0f, 0f, 0.2f, 1f)',
    flutter: 'Curves.decelerate',
    ios: 'ControlPoints:0.0f:0.0f:0.2f:1.0f',
    svgCurve: 'M 15 55 C 15 55, 29 15, 85 15',
    svgArea: 'M 15 55 C 15 55, 29 15, 85 15 L 85 55 Z',
    usage: 'Desaceleración clásica de Material 2.'
  },
  {
    name: 'legacy-accelerate',
    label: 'Legacy Accelerate',
    category: 'Legacy',
    token: 'md.sys.motion.easing.legacy.accelerate',
    curve: 'cubic-bezier(0.4, 0, 1, 1)',
    cssVar: '--md-sys-motion-easing-legacy-accelerate',
    android: 'PathInterpolator(0.4f, 0f, 1f, 1f)',
    flutter: 'Curves.fastInSlowOut',
    ios: 'ControlPoints:0.4f:0.0f:1.0f:1.0f',
    svgCurve: 'M 15 55 C 43 55, 85 15, 85 15',
    svgArea: 'M 15 55 C 43 55, 85 15, 85 15 L 85 55 Z',
    usage: 'Aceleración clásica de Material 2.'
  },
  {
    name: 'linear',
    label: 'Linear',
    category: 'Legacy',
    token: 'md.sys.motion.easing.linear',
    curve: 'cubic-bezier(0, 0, 1, 1)',
    cssVar: '--md-sys-motion-easing-linear',
    android: 'LinearInterpolator()',
    flutter: 'Curves.linear',
    ios: 'kCAMediaTimingFunctionLinear',
    svgCurve: 'M 15 55 L 85 15',
    svgArea: 'M 15 55 L 85 15 L 85 55 Z',
    usage: 'Velocidad constante para opacidad pura y rotaciones continuas.'
  }
];

export const CANONICAL_DURATIONS: CanonicalDurationSpec[] = [
  { name: 'short1', ms: 50, category: 'Short', usage: 'Desvanecimiento de icono' },
  { name: 'short2', ms: 100, category: 'Short', usage: 'Hover y micro-interacción' },
  { name: 'short3', ms: 150, category: 'Short', usage: 'Tooltips y popovers' },
  { name: 'short4', ms: 200, category: 'Short', usage: 'Salida de modales / dismiss' },
  { name: 'medium1', ms: 250, category: 'Medium', usage: 'Expansión de menú' },
  { name: 'medium2', ms: 300, category: 'Medium', usage: 'Shared axis horizontal' },
  { name: 'medium3', ms: 350, category: 'Medium', usage: 'Morphing de botones' },
  { name: 'medium4', ms: 400, category: 'Medium', usage: 'Entrada de diálogos M3' },
  { name: 'long1', ms: 450, category: 'Long', usage: 'Container Transform grande' },
  { name: 'long2', ms: 500, category: 'Long', usage: 'Hero expansion completa' },
  { name: 'long3', ms: 550, category: 'Long', usage: 'Handoff de vistas complejas' },
  { name: 'long4', ms: 600, category: 'Long', usage: 'Transición entre módulos' },
  { name: 'extra-long1', ms: 700, category: 'Extra Long', usage: 'Stage recessing lento' },
  { name: 'extra-long2', ms: 800, category: 'Extra Long', usage: 'Skeleton a contenido' },
  { name: 'extra-long3', ms: 900, category: 'Extra Long', usage: 'Secuencias guiadas' },
  { name: 'extra-long4', ms: 1000, category: 'Extra Long', usage: 'Splash screen exit' }
];

export const SPRING_PHYSICS_BY_SPEED: Record<
  SpringStyle,
  Record<
    SpringSpeed,
    { spatial: { damping: number; stiffness: number }; effects: { damping: number; stiffness: number } }
  >
> = {
  expressive: {
    fast: { spatial: { damping: 0.6, stiffness: 800 }, effects: { damping: 1.0, stiffness: 3800 } },
    default: { spatial: { damping: 0.8, stiffness: 380 }, effects: { damping: 1.0, stiffness: 1600 } },
    slow: { spatial: { damping: 0.8, stiffness: 200 }, effects: { damping: 1.0, stiffness: 800 } }
  },
  standard: {
    fast: { spatial: { damping: 0.9, stiffness: 1400 }, effects: { damping: 1.0, stiffness: 3800 } },
    default: { spatial: { damping: 0.9, stiffness: 700 }, effects: { damping: 1.0, stiffness: 1600 } },
    slow: { spatial: { damping: 0.9, stiffness: 300 }, effects: { damping: 1.0, stiffness: 800 } }
  }
};

export const SPRING_WEB_CURVES: Record<
  SpringStyle,
  { spatial: Record<SpringSpeed, SpringCurveSpec>; effects: Record<SpringSpeed, SpringCurveSpec> }
> = {
  expressive: {
    spatial: {
      fast: { curve: 'cubic-bezier(0.42, 1.67, 0.21, 0.90)', duration: 350, token: 'Expressive fast spatial' },
      default: { curve: 'cubic-bezier(0.38, 1.21, 0.22, 1.00)', duration: 500, token: 'Expressive default spatial' },
      slow: { curve: 'cubic-bezier(0.39, 1.29, 0.35, 0.98)', duration: 650, token: 'Expressive slow spatial' }
    },
    effects: {
      fast: { curve: 'cubic-bezier(0.31, 0.94, 0.34, 1.00)', duration: 150, token: 'Expressive fast effects' },
      default: { curve: 'cubic-bezier(0.34, 0.80, 0.34, 1.00)', duration: 200, token: 'Expressive default effects' },
      slow: { curve: 'cubic-bezier(0.34, 0.88, 0.34, 1.00)', duration: 300, token: 'Expressive slow effects' }
    }
  },
  standard: {
    spatial: {
      fast: { curve: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)', duration: 350, token: 'Standard fast spatial' },
      default: { curve: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)', duration: 500, token: 'Standard default spatial' },
      slow: { curve: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)', duration: 750, token: 'Standard slow spatial' }
    },
    effects: {
      fast: { curve: 'cubic-bezier(0.31, 0.94, 0.34, 1.00)', duration: 150, token: 'Standard fast effects' },
      default: { curve: 'cubic-bezier(0.34, 0.80, 0.34, 1.00)', duration: 200, token: 'Standard default effects' },
      slow: { curve: 'cubic-bezier(0.34, 0.88, 0.34, 1.00)', duration: 300, token: 'Standard slow effects' }
    }
  }
};

export const SPRING_EXPRESSIVE_FAST_SPATIAL_LINEAR =
  'linear(0, 0.233 6%, 0.633 12%, 0.937 18%, 1.099 26%, 1.085 34%, 1.024 43%, 0.99 54%, 0.995 68%, 1.001 84%, 1)';

export const MODERN_WEB_MOTION_PRIMITIVES: readonly ModernWebMotionPrimitiveSpec[] = [
  {
    id: 'starting-style-top-layer',
    badge: 'CSS Top Layer',
    title: '@starting-style + allow-discrete + overlay',
    summary: 'Anima entradas y salidas nativas desde display: none en <dialog> y [popover] sin timers JS ni nodos fantasmas.',
    rule: 'Declara @starting-style al final de la regla activa e incluye overlay y display con allow-discrete para preservar el fade de cierre.',
    snippet: `.m3-sheet-popover {
  transition: opacity 250ms var(--md-sys-motion-easing-emphasized-decelerate),
              transform 250ms var(--md-sys-motion-easing-emphasized-decelerate),
              display 250ms allow-discrete,
              overlay 250ms allow-discrete;
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}
.m3-sheet-popover:popover-open {
  opacity: 1;
  transform: translateY(0) scale(1);
  @starting-style {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
}`
  },
  {
    id: 'linear-spring-oscillation',
    badge: 'Physics in CSS',
    title: 'linear() Multi-Rebote vs cubic-bezier()',
    summary: 'cubic-bezier() solo soporta 2 puntos de control (máximo un sobrepaso). linear() captura rebote + contra-ajuste amortiguado real.',
    rule: 'Reserva --md-sys-motion-spring-expressive-fast-spatial-linear para elementos focales en reposo; nunca en salidas descartables.',
    snippet: `.hero-fab {
  transition: transform 350ms var(--md-sys-motion-spring-expressive-fast-spatial-linear);
}`
  },
  {
    id: 'directional-vt-router',
    badge: 'View Transitions',
    title: 'Directional Step VT vs Top-Level Fade-Through',
    summary: 'onViewTransitionCreated distingue pasos secuenciales (Shared-Axis X forward/backward) de cambios globales (Clean Fade-Through).',
    rule: 'Separa salida rápida (short3) de entrada retardada (medium1 + short2 delay) para evitar fantasmas superpuestos.',
    snippet: `withViewTransitions({
  onViewTransitionCreated: classifyNavigationTransition
})`
  },
  {
    id: 'reduced-motion-calm-fade',
    badge: 'WCAG A11y',
    title: 'prefers-reduced-motion: Fade Sutil vs 1ms Trap',
    summary: 'Aplicar * { animation-duration: 1ms !important } provoca cortes bruscos y pisa fades accesibles en overlays y snackbars.',
    rule: 'Colapsa traslaciones y rebotes espaciales a linear(), conserva disolvencias suaves de 150ms y congela loops infinitos (.m3-aurora-orb).',
    snippet: `@media (prefers-reduced-motion: reduce) {
  .m3-anim-spring-pop {
    animation: m3ReducedFadeIn 150ms linear both;
  }
  .m3-aurora-orb {
    animation: none !important;
  }
}`
  }
];

export interface ApplyingTransitionPrincipleSpec {
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly tokenHint: string;
}

export const APPLYING_TRANSITIONS_PRINCIPLES: readonly ApplyingTransitionPrincipleSpec[] = [
  {
    number: 1,
    title: '1. Accesibilidad Universal',
    body: 'Respeta prefers-reduced-motion: reemplaza traslaciones por desvanecimientos sutiles de 150ms sin efectos decorativos.',
    tokenHint: '@media (prefers-reduced-motion: reduce)'
  },
  {
    number: 2,
    title: '2. Consistencia Sistémica',
    body: 'Mismo tipo de transición y token para la misma acción en toda la app. Aumenta la previsibilidad operativa.',
    tokenHint: '.m3-transition-standard | .m3-transition-emphasized'
  },
  {
    number: 3,
    title: '3. Layouts Estables (Skeletons)',
    body: 'Fija las dimensiones físicas antes de que carguen los datos para evitar empujar elementos en pantalla (CLS = 0.00).',
    tokenHint: '.m3-skeleton.m3-skeleton-shimmer'
  },
  {
    number: 4,
    title: '4. Cero Jump-Cuts',
    body: 'Evita cortes secos e instantáneos salvo en herramientas de pura velocidad repetitiva para usuarios expertos.',
    tokenHint: 'short3 (150ms) mínimo visual'
  },
  {
    number: 5,
    title: '5. Modelo Espacial Coherente',
    body: 'Los elementos emergen desde su origen físico real: navigation drawers desde el borde lateral, sheets desde abajo.',
    tokenHint: 'transform-origin + m3EnterFromBottom'
  },
  {
    number: 6,
    title: '6. Dirección Unificada',
    body: 'Los elementos secundarios se agrupan y viajan a lo largo del mismo eje de movimiento sin direcciones cruzadas.',
    tokenHint: 'm3ForwardIn / m3BackwardIn'
  },
  {
    number: 7,
    title: '7. Clean Fades (Sin Cross-Fade Sucio)',
    body: 'Desvanece por completo el contenido saliente antes de entrar el nuevo para evitar capas semitransparentes superpuestas.',
    tokenHint: 'short2 exit + short2 delay'
  },
  {
    number: 8,
    title: '8. Estilo Sobrio y Concentrado',
    body: 'La navegación frecuente debe ser ágil y precisa, reservando resortes expresivos para hitos o elementos focales.',
    tokenHint: 'Standard ζ = 0.9 vs Expressive ζ = 0.6'
  }
] as const;

export interface MotionPlaybookFilterSpec {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly ruleLeftLabel: string;
  readonly ruleLeftText: string;
  readonly ruleRightLabel: string;
  readonly ruleRightText: string;
  readonly tokens: string;
}

export const MOTION_PLAYBOOK_FILTERS: readonly MotionPlaybookFilterSpec[] = [
  {
    id: 'dom-lifecycle',
    badge: 'Filtro 1',
    title: 'Ciclo de Vida del DOM',
    ruleLeftLabel: 'Nodo Persistente (CSS Transitions)',
    ruleLeftText: 'Si la tarjeta, drawer o FAB sigue vivo dentro del mismo componente: usá dimensiones acotadas + overflow-hidden o Grid 0fr ↔ 1fr.',
    ruleRightLabel: 'DOM Destruido (View Transitions API)',
    ruleRightText: 'Si cambia la ruta o un diálogo salta al Top Layer: enlazá view-transition-name dinámico para morfar snapshots GPU sin congelar el hilo.',
    tokens: 'document.startViewTransition() | grid-rows-[0fr..1fr]'
  },
  {
    id: 'physics-family',
    badge: 'Filtro 2',
    title: 'Familia Física (Spatial vs Effects)',
    ruleLeftLabel: 'Spatial (Con Rebote Controlado)',
    ruleLeftText: 'Mueve o cambia tamaño/radio: Expressive ζ = 0.6–0.8 para hitos focales; Standard ζ = 0.9 para tablas y flujos densos.',
    ruleRightLabel: 'Effects (Damping 1.0 • Cero Rebote)',
    ruleRightText: 'Color, opacidad, elevación y state-layer jamás deben oscilar ni sobrepasarse: siempre curvas de frenado puro (150ms–300ms).',
    tokens: '--md-sys-motion-spring-*-spatial vs *-effects'
  },
  {
    id: 'compositor-tokens',
    badge: 'Filtro 3',
    title: 'Cero Números Mágicos y GPU Segura',
    ruleLeftLabel: 'Tokens Centralizados en _motion.css',
    ruleLeftText: 'Prohibido hardcodear ms sueltos o cubic-bezier en componentes de negocio; así [data-motion-scheme="standard"] y reduce funcionan globalmente.',
    ruleRightLabel: 'Solo Propiedades de Compositor + Freeze VT',
    ruleRightText: 'Orbs ambientales (.m3-aurora-orb) animan solo transform + opacity, se pausan con html.vt-running y respetan prefers-reduced-motion.',
    tokens: '--md-sys-motion-duration-* + html.vt-running'
  }
] as const;

export interface ContainerTransformTrapSpec {
  readonly id: string;
  readonly title: string;
  readonly problem: string;
  readonly solution: string;
  readonly snippet: string;
}

export const CONTAINER_TRANSFORM_TRAPS: readonly ContainerTransformTrapSpec[] = [
  {
    id: 'trap-max-width',
    title: 'Trampa 1: Explosión Horizontal (max-width: none)',
    problem: 'Combinar w-full max-w-md (abierto) con w-72 (cerrado, max-width implícito none) hace que al cerrar en t=0ms el ancho explote al 100% del padre.',
    solution: 'Fijá max-w-full de forma invariable e interpolá únicamente anchos explícitos acotados (ej. w-72 ↔ w-[448px]) con transition-property explícita.',
    snippet: 'class="max-w-full overflow-hidden" style="transition-property: width, height, border-radius;"'
  },
  {
    id: 'trap-height-auto',
    title: 'Trampa 2: Salto Seco y Hueco Vacío (height: auto)',
    problem: 'CSS no puede interpolar height: auto sin Saltos, y desmontar contenido con @if al cerrar deja una caja hueca encogiéndose durante 500ms.',
    solution: 'Usá alturas explícitas acotadas (h-16 ↔ h-48) o Grid 0fr ↔ 1fr y desvanecé el contenido interno en 100ms (0ms delay) antes que el contenedor.',
    snippet: 'transition-duration: var(--md-sys-motion-duration-short2); /* contenido sale primero */'
  },
  {
    id: 'trap-ghosting',
    title: 'Trampa 3: Ghosting por Pseudo-elemento ::before',
    problem: 'En hosts .state-layer/.card-interactive, ::before ya está reservado para el velo currentColor de Hover/Focus/Pressed; pisarlo rompe el feedback y produce halos sucios.',
    solution: 'Colocá glows o auroras ambientales (.m3-aurora-orb) en <div class="m3-aurora-layer" aria-hidden="true"> hijo y congelalas durante html.vt-running.',
    snippet: '<div class="m3-aurora-layer" aria-hidden="true"><span class="m3-aurora-orb m3-aurora-orb-1"></span></div>'
  }
] as const;

export interface MotionAppliedRecipeSpec {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly timing: string;
  readonly why: string;
  readonly snippet: string;
}

export const MOTION_APPLIED_RECIPES: readonly MotionAppliedRecipeSpec[] = [
  {
    id: 'recipe-button-morph',
    badge: 'Controls',
    title: 'M3 Button & Chip Shape Morphing',
    timing: '350ms fast-spatial + 150ms fast-effects',
    why: 'Desacoplá el tamaño/radio elástico (spatial) del color de relleno (effects damping 1.0) para tacto vivo sin parpadeo cromático.',
    snippet: `transition:
  border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial),
  transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial),
  background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects);`
  },
  {
    id: 'recipe-stagger-waterfall',
    badge: 'Lists & Bento',
    title: 'Cascada Stagger (--stagger-index × 40ms)',
    timing: '200ms short4 + top 240ms cap',
    why: 'Ordena la lectura en listas y grillas Bento; capeá siempre el retraso total (~240ms max) para no frenar listas largas.',
    snippet: `.m3-stagger-row {
  animation: m3ContainerContentIn var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate) both;
  animation-delay: calc(min(var(--stagger-index, 0), 6) * 40ms);
}`
  },
  {
    id: 'recipe-vt-dynamic',
    badge: 'View Transitions',
    title: 'Origen Dinámico view-transition-name',
    timing: '500ms long2 open ↔ 250ms medium1 return',
    why: 'Nunca fijes view-transition-name estático en listas: asignalo solo al trigger activo para no romper el stacking context del backdrop.',
    snippet: `[style.view-transition-name]="activeItemId() === item.id ? 'hero-detail' : null"`
  }
] as const;
