import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DialogService } from '../../core/dialog/dialog.service';
import { DESIGN_SYSTEM_STEPS } from '../../shared/models/ui.models';

/** Shell component for the Design System Laboratory providing child route outlet and dock-mode fallback switcher. */
@Component({
  selector: 'app-design-system-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="space-y-4">
      <!-- Fallback switcher rendered when floating Dock, compact Bar, or Top Focus Strip hides the sidebar submenu -->
      @if (dialogService.effectiveChrome() === 'dock' || dialogService.effectiveChrome() === 'bar' || dialogService.effectiveChrome() === 'tunnel') {
        <nav aria-label="Pasos del Design System" class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-m3-full bg-surface-low w-fit max-w-full">
          @for (step of labSteps; track step.path) {
            <a
              [routerLink]="step.path"
              routerLinkActive
              #rla="routerLinkActive"
              [class]="rla.isActive
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-box text-muted hover:text-main'"
              class="btn-m3 px-4 py-2 rounded-full text-xs flex items-center gap-1.5 cursor-pointer no-underline">
              <span class="material-symbols-rounded text-sm">{{ step.icon }}</span>
              <span>{{ step.label }}</span>
            </a>
          }
        </nav>
      }

      <router-outlet />
    </section>
  `
})
export class DesignSystemComponent {
  readonly dialogService = inject(DialogService);
  readonly labSteps = DESIGN_SYSTEM_STEPS;
}
