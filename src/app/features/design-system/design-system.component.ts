import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DialogService } from '../../core/dialog/dialog.service';
import { DESIGN_SYSTEM_STEPS } from '../../shared/models/ui.models';

/** Shell component for the Design System Laboratory providing child route outlet and dock-mode fallback switcher. */
@Component({
  selector: 'app-design-system-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-4">
      <!-- Fallback switcher rendered when floating Dock, compact Bar, or Top Focus Strip hides the sidebar submenu -->
      @if (dialogService.effectiveChrome() === 'dock' || dialogService.effectiveChrome() === 'bar' || dialogService.effectiveChrome() === 'tunnel') {
        <nav aria-label="Pasos del Design System" class="flex flex-wrap items-center gap-2 p-1.5 rounded-m3-xl bg-surface-low w-fit max-w-full">
          @for (step of labSteps; track step.path) {
            <a
              [routerLink]="step.path"
              routerLinkActive
              #rla="routerLinkActive"
              [ariaCurrentWhenActive]="'page'"
              [class]="
                (rla.isActive
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-box text-muted hover:text-main') +
                ' state-layer focus-ring-m3 touch-target-48 px-3.5 py-2 rounded-m3-lg text-label-md flex items-center gap-1.5 cursor-pointer no-underline transition-colors'
              ">
              <span class="material-symbols-rounded text-base shrink-0" aria-hidden="true">{{ step.icon }}</span>
              <span class="sm:hidden">{{ step.navLabel }}</span>
              <span class="hidden sm:inline">{{ step.label }}</span>
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
