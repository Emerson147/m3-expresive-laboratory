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
        svgCurve: 'M 5 80 C 15 25, 25 10, 135 10',
        svgArea: 'M 5 80 C 15 25, 25 10, 135 10 L 135 80 Z'
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
        svgCurve: 'M 5 80 C 30 75, 35 45, 70 20 C 90 10, 115 10, 135 10',
        svgArea: 'M 5 80 C 30 75, 35 45, 70 20 C 90 10, 115 10, 135 10 L 135 80 Z'
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
        svgCurve: 'M 5 80 C 45 80, 105 70, 135 10',
        svgArea: 'M 5 80 C 45 80, 105 70, 135 10 L 135 80 Z'
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
        svgCurve: 'M 5 80 C 5 15, 5 10, 135 10',
        svgArea: 'M 5 80 C 5 15, 5 10, 135 10 L 135 80 Z'
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
        svgCurve: 'M 5 80 C 30 80, 5 10, 135 10',
        svgArea: 'M 5 80 C 30 80, 5 10, 135 10 L 135 80 Z'
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
        svgCurve: 'M 5 80 C 45 80, 135 10, 135 10',
        svgArea: 'M 5 80 C 45 80, 135 10, 135 10 L 135 80 Z'
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
    svgCurve: 'M 15 55 C 25 55, 35 15, 85 15',
    svgArea: 'M 15 55 C 25 55, 35 15, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 18 18, 45 15, 85 15',
    svgArea: 'M 15 55 C 18 18, 45 15, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 45 55, 75 50, 85 15',
    svgArea: 'M 15 55 C 45 55, 75 50, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 30 55, 20 15, 85 15',
    svgArea: 'M 15 55 C 30 55, 20 15, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 15 15, 40 15, 85 15',
    svgArea: 'M 15 55 C 15 15, 40 15, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 40 55, 85 15, 85 15',
    svgArea: 'M 15 55 C 40 55, 85 15, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 35 55, 25 15, 85 15',
    svgArea: 'M 15 55 C 35 55, 25 15, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 20 20, 50 15, 85 15',
    svgArea: 'M 15 55 C 20 20, 50 15, 85 15 L 85 55 Z',
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
    svgCurve: 'M 15 55 C 45 55, 80 20, 85 15',
    svgArea: 'M 15 55 C 45 55, 80 20, 85 15 L 85 55 Z',
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
  SpringSpeed,
  { spatial: { damping: number; stiffness: number }; effects: { damping: number; stiffness: number } }
> = {
  fast: { spatial: { damping: 0.9, stiffness: 1400 }, effects: { damping: 1.0, stiffness: 3800 } },
  default: { spatial: { damping: 0.9, stiffness: 700 }, effects: { damping: 1.0, stiffness: 1600 } },
  slow: { spatial: { damping: 0.9, stiffness: 300 }, effects: { damping: 1.0, stiffness: 800 } }
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
