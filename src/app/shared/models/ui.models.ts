export type TriggerMode = 'menu-bottom-left';
export type AppSection = 'overview' | 'agenda' | 'design-system' | 'pos' | 'inventory' | 'telemetry' | 'kanban' | 'campus' | 'clinic';
export type NavStyle = 'auto' | 'rail' | 'dock' | 'tunnel';
export type NavChromeMode = 'bar' | 'rail-collapsed' | 'rail-expanded' | 'tunnel' | 'dock';
export type NavGroupId = 'core' | 'workbenches';
export type AppShellMode = 'editorial' | 'workbench';
export type DialogView = 'menu-main' | 'menu-appearance';
export type TransitionType = 'section' | 'nav' | 'dialog' | null;

export interface AppNavGroup {
  readonly id: NavGroupId;
  readonly label: string;
}

export const APP_NAV_GROUPS: readonly AppNavGroup[] = [
  { id: 'core', label: 'Núcleo' },
  { id: 'workbenches', label: 'Operación' }
];

export interface AppNavDestination {
  readonly section: AppSection;
  readonly group: NavGroupId;
  readonly route: string;
  readonly icon: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly tunnelLabel?: string;
  readonly exact?: boolean;
  readonly compactPrimary?: boolean;
  readonly dockPinned?: boolean;
  readonly hasPendingBadge?: boolean;
  readonly keywords?: readonly string[];
}

export const APP_NAV_DESTINATIONS: readonly AppNavDestination[] = [
  {
    section: 'overview',
    group: 'core',
    route: '/overview',
    icon: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Inicio',
    tunnelLabel: 'Inicio',
    exact: true,
    compactPrimary: true,
    dockPinned: true,
    keywords: ['resumen', 'home', 'kpi']
  },
  {
    section: 'agenda',
    group: 'core',
    route: '/agenda',
    icon: 'event_upcoming',
    label: 'Agenda de Tareas',
    shortLabel: 'Agenda',
    tunnelLabel: 'Agenda',
    compactPrimary: true,
    dockPinned: true,
    hasPendingBadge: true,
    keywords: ['tareas', 'pendientes', 'calendario']
  },
  {
    section: 'design-system',
    group: 'core',
    route: '/design-system',
    icon: 'widgets',
    label: 'Design System',
    shortLabel: 'Sistema',
    compactPrimary: true,
    dockPinned: true,
    keywords: ['tokens', 'oklch', 'm3', 'componentes', 'motion']
  },
  {
    section: 'pos',
    group: 'workbenches',
    route: '/pos',
    icon: 'point_of_sale',
    label: 'Punto de Venta',
    shortLabel: 'POS',
    compactPrimary: true,
    dockPinned: true,
    keywords: ['caja', 'venta', 'ticket', 'yape']
  },
  {
    section: 'inventory',
    group: 'workbenches',
    route: '/inventory',
    icon: 'inventory_2',
    label: 'Inventario',
    shortLabel: 'Stock',
    keywords: ['almacen', 'productos', 'sku']
  },
  {
    section: 'telemetry',
    group: 'workbenches',
    route: '/telemetry',
    icon: 'sensors',
    label: 'Telemetría Viva',
    shortLabel: 'Flota',
    tunnelLabel: 'Telemetría',
    keywords: ['flota', 'gps', 'rutas', 'can-bus']
  },
  {
    section: 'kanban',
    group: 'workbenches',
    route: '/kanban',
    icon: 'view_kanban',
    label: 'Kanban KDS',
    shortLabel: 'KDS',
    keywords: ['cocina', 'tableros', 'pedidos']
  },
  {
    section: 'campus',
    group: 'workbenches',
    route: '/campus',
    icon: 'school',
    label: 'Campus',
    shortLabel: 'Campus',
    tunnelLabel: 'Campus Educativo',
    keywords: ['clases', 'alumnos', 'docente', 'asistencia']
  },
  {
    section: 'clinic',
    group: 'workbenches',
    route: '/clinic',
    icon: 'local_hospital',
    label: 'Clínica & Triaje',
    shortLabel: 'Triaje',
    dockPinned: true,
    keywords: ['news2', 'urgencias', 'boxes', 'shock trauma']
  }
];

const WORKBENCH_SECTIONS: ReadonlySet<AppSection> = new Set<AppSection>([
  'pos',
  'inventory',
  'telemetry',
  'kanban',
  'campus',
  'clinic'
]);

export function getShellModeForSection(section: AppSection): AppShellMode {
  return WORKBENCH_SECTIONS.has(section) ? 'workbench' : 'editorial';
}

/** Resolves effective navigation chrome from requested NavStyle and M3 viewport width breakpoints. */
export function resolveNavChrome(
  style: NavStyle,
  viewportWidth: number,
  manualRailExpanded: boolean | null = null
): NavChromeMode {
  if (viewportWidth < 600) {
    return style === 'dock' ? 'dock' : 'bar';
  }
  if (style === 'dock') return 'dock';
  if (style === 'tunnel') return 'tunnel';
  const isExpanded = manualRailExpanded ?? viewportWidth >= 1200;
  return isExpanded ? 'rail-expanded' : 'rail-collapsed';
}

export function detectSectionFromUrl(url: string): AppSection {
  return APP_NAV_DESTINATIONS.find(dest => url.includes(dest.route))?.section ?? 'overview';
}

export interface DesignSystemStepLink {
  path: string;
  route: string;
  icon: string;
  label: string;
  navLabel: string;
}

export const DESIGN_SYSTEM_STEPS: DesignSystemStepLink[] = [
  { path: 'styles', route: '/design-system/styles', icon: 'palette', label: 'Paso 1: Styles', navLabel: '1. Styles' },
  { path: 'foundations', route: '/design-system/foundations', icon: 'touch_app', label: 'Paso 2: Foundations', navLabel: '2. Foundations' },
  { path: 'components', route: '/design-system/components', icon: 'widgets', label: 'Paso 3: Components (80/20)', navLabel: '3. Components' },
  { path: 'motion', route: '/design-system/motion', icon: 'animation', label: 'Paso 4: Motion & Transitions', navLabel: '4. Motion' },
  { path: 'playbook', route: '/design-system/playbook', icon: 'menu_book', label: 'Paso 5: Biblia M3 (Cero a Sistema)', navLabel: '5. Biblia M3' }
];
