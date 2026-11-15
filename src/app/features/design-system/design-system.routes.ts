import { Routes } from '@angular/router';
import { DesignSystemComponent } from './design-system.component';

/** Nested lazy routes for the 4-step M3 Design System Laboratory. */
export const DESIGN_SYSTEM_ROUTES: Routes = [
  {
    path: '',
    component: DesignSystemComponent,
    children: [
      { path: '', redirectTo: 'styles', pathMatch: 'full' },
      {
        path: 'styles',
        data: {
          labTitle: 'Paso 1: Styles',
          labSubtitle: 'Superficies OKLCH en 5 niveles, shape morphing y escala tipográfica M3'
        },
        loadComponent: () => import('./pages/styles-lab.component').then(m => m.StylesLabComponent)
      },
      {
        path: 'foundations',
        data: {
          labTitle: 'Paso 2: Foundations',
          labSubtitle: 'Capas de estado con currentColor, touch targets 48×48dp y Window Size Classes'
        },
        loadComponent: () => import('./pages/foundations-lab.component').then(m => m.FoundationsLabComponent)
      },
      {
        path: 'components',
        data: {
          labTitle: 'Paso 3: Components (80/20)',
          labSubtitle: 'Catálogo atómico M3: buttons, cards, chips, text fields, progress y skeleton'
        },
        loadComponent: () => import('./pages/components-lab.component').then(m => m.ComponentsLabComponent)
      },
      {
        path: 'motion',
        data: {
          labTitle: 'Paso 4: Motion & Transitions',
          labSubtitle: 'Asimetría perceptual, resortes disjuntos, 6 patrones canónicos y playbook CSS'
        },
        loadComponent: () => import('./pages/motion-lab.component').then(m => m.MotionLabComponent)
      },
      {
        path: 'playbook',
        data: {
          labTitle: 'Paso 5: Biblia M3 (De Cero a Sistema)',
          labSubtitle: 'Qué copiar, cómo armar sistemas reales desde cero y oráculo estricto Google M3 + Web'
        },
        loadComponent: () => import('./pages/playbook-lab.component').then(m => m.PlaybookLabComponent)
      },
      { path: '**', redirectTo: 'styles' }
    ]
  }
];
