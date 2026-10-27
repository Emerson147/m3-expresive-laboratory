import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./features/overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/agenda/agenda.component').then(m => m.AgendaComponent)
  },
  {
    path: 'design-system',
    loadComponent: () =>
      import('./features/design-system/design-system.component').then(m => m.DesignSystemComponent)
  },
  {
    path: 'pos',
    loadComponent: () =>
      import('./features/pos/pos.component').then(m => m.PosComponent)
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory.component').then(m => m.InventoryComponent)
  },
  {
    path: 'telemetry',
    loadComponent: () =>
      import('./features/telemetry/telemetry.component').then(m => m.TelemetryComponent)
  },
  {
    path: 'kanban',
    loadComponent: () =>
      import('./features/kanban/kanban.component').then(m => m.KanbanComponent)
  },
  {
    path: 'campus',
    loadComponent: () =>
      import('./features/campus/campus.component').then(m => m.CampusComponent)
  },
  {
    path: 'clinic',
    loadComponent: () =>
      import('./features/clinic/clinic.component').then(m => m.ClinicComponent)
  },
  {
    path: '**',
    redirectTo: 'overview'
  }
];
