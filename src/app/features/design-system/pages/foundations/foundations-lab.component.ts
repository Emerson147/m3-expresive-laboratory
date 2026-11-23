import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { M3ButtonAnchorComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { ClipboardCopyPayload, copyTextWithFeedback } from '../../../../shared/utils/clipboard.util';
import { FoundationsA11yContentSectionComponent } from './foundations-a11y-content-section.component';
import { FoundationsErgonomicsSectionComponent } from './foundations-ergonomics-section.component';
import { FoundationsLayoutSectionComponent } from './foundations-layout-section.component';

type FoundationsSectionFilter = 'all' | 'case-1' | 'case-2' | 'case-3' | 'case-4';

/**
 * Interactive orchestrator for Step 2 (Foundations — Web Focused).
 * Provides unified case filtering, navigation link to Step 1 Styles, and shared
 * Top-Layer Snackbar feedback while keeping each Foundation pillar self-contained.
 */
@Component({
  selector: 'app-foundations-lab',
  standalone: true,
  imports: [
    RouterLink,
    M3ButtonAnchorComponent,
    M3CardComponent,
    M3ChipComponent,
    M3SnackbarComponent,
    FoundationsLayoutSectionComponent,
    FoundationsErgonomicsSectionComponent,
    FoundationsA11yContentSectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- FOUNDATIONS STUDIO HEADER + FILTRO DE CASOS -->
      <m3-card variant="elevated" padding="md" customClass="space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">architecture</span>
              Paso 2 • Foundations Studio (Adaptive · 48dp · WCAG 2.2 · Intl)
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Estructura Adaptativa, Ergonomía Táctil, Accesibilidad y Content Design
            </h2>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              Los <strong>Design Tokens</strong>, <strong>Color OKLCH</strong> y opacidades de <strong>State Layers</strong> viven en <strong>Styles</strong>. Acá dominás las leyes espaciales, de entrada, accesibilidad WAI-ARIA y lenguaje de interfaz usando nuestro propio kit M3 Expressive.
            </p>
          </div>

          <a
            m3-button
            variant="tonal"
            size="sm"
            icon="palette"
            routerLink="/design-system/styles"
            customClass="shrink-0 self-start lg:self-center">
            Ir a Styles (Tokens y Hovers)
          </a>
        </div>

        <nav aria-label="Secciones de Foundations" class="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-sub/60">
          @for (sec of sectionFilterOptions; track sec.id) {
            <m3-chip
              type="filter"
              [selected]="selectedSectionFilter() === sec.id"
              (action)="selectedSectionFilter.set(sec.id)">
              {{ sec.label }}
            </m3-chip>
          }
        </nav>
      </m3-card>

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-1') {
        <app-foundations-layout-section (copyRule)="handleCopyRequest($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-2') {
        <app-foundations-ergonomics-section (copyRule)="handleCopyRequest($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-3' || selectedSectionFilter() === 'case-4') {
        <app-foundations-a11y-content-section
          [showA11y]="selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-3'"
          [showContent]="selectedSectionFilter() === 'all' || selectedSectionFilter() === 'case-4'"
          (copyRule)="handleCopyRequest($event)" />
      }

      <m3-snackbar
        [message]="snackbarMessage()"
        [(open)]="snackbarOpen" />
    </div>
  `
})
export class FoundationsLabComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly selectedSectionFilter = signal<FoundationsSectionFilter>('all');
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');

  readonly sectionFilterOptions: readonly { id: FoundationsSectionFilter; label: string }[] = [
    { id: 'all', label: 'Todos los Casos (4)' },
    { id: 'case-1', label: '1. Layout & Breakpoints' },
    { id: 'case-2', label: '2. Ergonomía 48dp' },
    { id: 'case-3', label: '3. A11y WCAG' },
    { id: 'case-4', label: '4. Content Design' }
  ];

  handleCopyRequest(request: ClipboardCopyPayload): void {
    copyTextWithFeedback(this.platformId, request.text, request.message, (msg) => {
      this.snackbarMessage.set(msg);
      this.snackbarOpen.set(true);
    });
  }
}
