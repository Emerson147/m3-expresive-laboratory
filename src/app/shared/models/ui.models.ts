export type TriggerMode = 'fab-header' | 'bento-center' | 'menu-bottom-left' | 'task-card';
export type AppSection = 'overview' | 'agenda' | 'design-system' | 'pos' | 'inventory' | 'telemetry' | 'kanban' | 'campus' | 'clinic';
export type NavStyle = 'rail' | 'dock' | 'tunnel';
export type DialogView = 'menu-main' | 'menu-appearance' | 'task-form';
export type TransitionType = 'section' | 'nav' | 'hero' | 'dialog' | null;

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
  { path: 'motion', route: '/design-system/motion', icon: 'animation', label: 'Paso 4: Motion & Transitions', navLabel: '4. Motion' }
];
