import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DialogService } from './core/dialog/dialog.service';
import { TaskService } from './core/tasks/task.service';
import { ThemeService } from './core/theme/theme.service';
import { AppSection } from './shared/models/ui.models';
import { DialogContainerComponent } from './shared/ui/dialog-container.component';
import { HeaderComponent } from './shared/ui/header.component';
import { HeroDetailModalComponent } from './shared/ui/hero-detail-modal.component';
import { NavigationComponent } from './shared/ui/navigation.component';

export type { AppSection, DialogView, NavStyle, TransitionType, TriggerMode } from './shared/models/ui.models';
export type { FilterStatus, TaskItem, TaskPriority } from './core/tasks/task.service';
export type { ThemeOption } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavigationComponent,
    HeaderComponent,
    HeroDetailModalComponent,
    DialogContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  readonly themeService = inject(ThemeService);
  readonly taskService = inject(TaskService);
  readonly dialogService = inject(DialogService);

  readonly currentSection = signal<AppSection>(this.detectSection(this.router.url));
  readonly routeMeta = signal<{ title?: string; subtitle?: string }>(this.readActiveRouteMeta());

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentSection.set(this.detectSection(event.urlAfterRedirects));
        this.routeMeta.set(this.readActiveRouteMeta());
      });
  }

  private readActiveRouteMeta(): { title?: string; subtitle?: string } {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const data = route.snapshot.data;
    return {
      title: typeof data['labTitle'] === 'string' ? data['labTitle'] : undefined,
      subtitle: typeof data['labSubtitle'] === 'string' ? data['labSubtitle'] : undefined
    };
  }

  private detectSection(url: string): AppSection {
    if (url.includes('/agenda')) return 'agenda';
    if (url.includes('/design-system')) return 'design-system';
    if (url.includes('/pos')) return 'pos';
    if (url.includes('/inventory')) return 'inventory';
    if (url.includes('/telemetry')) return 'telemetry';
    if (url.includes('/kanban')) return 'kanban';
    if (url.includes('/campus')) return 'campus';
    if (url.includes('/clinic')) return 'clinic';
    return 'overview';
  }
}