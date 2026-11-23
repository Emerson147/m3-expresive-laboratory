import { Routes } from '@angular/router';
import { DesignSystemComponent } from './design-system.component';

/** Nested lazy routes for the 5-step M3 Design System Laboratory. */
export const DESIGN_SYSTEM_ROUTES: Routes = [
  {
    path: '',
    component: DesignSystemComponent,
    children: [
      { path: '', redirectTo: 'styles', pathMatch: 'full' },
      {
        path: 'styles',
        title: 'Paso 1: Styles · M3 Expressive',
        data: {
          labTitle: 'Paso 1: Styles',
          labSubtitle: 'Superficies OKLCH en 8 niveles, shape morphing, elevación y 30 estilos tipográficos M3'
        },
        loadComponent: () => import('./pages/styles/styles-lab.component').then(m => m.StylesLabComponent)
      },
      {
        path: 'foundations',
        title: 'Paso 2: Foundations · M3 Expressive',
        data: {
          labTitle: 'Paso 2: Foundations',
          labSubtitle: 'Parts of Layout, Window Size Classes, touch targets 48×48dp, a11y y RTL'
        },
        loadComponent: () => import('./pages/foundations/foundations-lab.component').then(m => m.FoundationsLabComponent)
      },
      {
        path: 'components',
        title: 'Paso 3: Components · M3 Expressive',
        data: {
          labTitle: 'Paso 3: Components (80/20)',
          labSubtitle: 'Catálogo atómico M3: buttons, cards, chips, text fields, progress, loading y overlays'
        },
        loadComponent: () => import('./pages/components/components-lab.component').then(m => m.ComponentsLabComponent)
      },
      {
        path: 'motion',
        title: 'Paso 4: Motion & Transitions · M3 Expressive',
        data: {
          labTitle: 'Paso 4: Motion & Transitions',
          labSubtitle: 'Asimetría perceptual, resortes Spatial/Effects, 6 patrones canónicos y playbook CSS'
        },
        loadComponent: () => import('./pages/motion/motion-lab.component').then(m => m.MotionLabComponent)
      },
      {
        path: 'playbook',
        title: 'Paso 5: Biblia M3 · M3 Expressive',
        data: {
          labTitle: 'Paso 5: Biblia M3 (De Cero a Sistema)',
          labSubtitle: 'Qué copiar, cómo armar sistemas reales desde cero y oráculo estricto Google M3 + Web'
        },
        loadComponent: () => import('./pages/playbook/playbook-lab.component').then(m => m.PlaybookLabComponent)
      },
      { path: '**', redirectTo: 'styles' }
    ]
  }
];
