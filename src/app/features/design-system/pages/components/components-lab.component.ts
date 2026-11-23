import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { M3ButtonAnchorComponent, M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { ClipboardCopyPayload, copyTextWithFeedback } from '../../../../shared/utils/clipboard.util';
import { ComponentsActionsSectionComponent } from './components-actions-section.component';
import { ComponentsContainmentInputsSectionComponent } from './components-containment-inputs-section.component';
import { ComponentsControlsOverlaysSectionComponent } from './components-controls-overlays-section.component';
import { ComponentsProgressSectionComponent } from './components-progress-section.component';
import { COMPONENT_PILLAR_SPECS, ComponentPillarSpec } from './components-specs.data';

type ComponentsSectionFilter = 'all' | 'actions' | 'containment' | 'progress' | 'controls';

/**
 * Interactive orchestrator for Step 3 (Components — 11 Official M3 Pillars).
 * Features unified elevated studio bar, collapsible 11-pillar quick map with jump-to-section,
 * clean section filtering, and shared Top-Layer Snackbar feedback.
 */
@Component({
  selector: 'app-components-lab',
  standalone: true,
  imports: [
    RouterLink,
    M3ButtonAnchorComponent,
    M3ButtonComponent,
    M3CardComponent,
    M3ChipComponent,
    M3SnackbarComponent,
    ComponentsActionsSectionComponent,
    ComponentsContainmentInputsSectionComponent,
    ComponentsProgressSectionComponent,
    ComponentsControlsOverlaysSectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- COMPONENTS STUDIO HEADER + FILTROS + MAPA DE 11 PILARES COLAPSABLE -->
      <m3-card variant="elevated" padding="md" customClass="space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">widgets</span>
              Paso 3 • Components Studio (m3.material.io/components)
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Los 11 Pilares Oficiales M3 (Actions, Containment, Inputs, Progress &amp; Overlays)
            </h2>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              Los componentes consumen los tokens OKLCH y State Layers de <strong>Styles</strong> y las reglas espaciales/WCAG de <strong>Foundations</strong>. Probá acá cada pieza real del kit con controles en vivo y snippets listos para copiar.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
            <m3-button
              variant="outlined"
              size="sm"
              icon="map"
              [toggle]="true"
              [(selected)]="showPillarMap">
              Mapa 11 Pilares
            </m3-button>
            <a m3-button variant="tonal" size="sm" icon="architecture" routerLink="/design-system/foundations">
              Foundations
            </a>
            <a m3-button variant="filled" size="sm" icon="menu_book" routerLink="/design-system/playbook">
              Biblia M3
            </a>
          </div>
        </div>

        @if (showPillarMap()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-outline-sub m3-anim-item-in">
            @for (spec of componentPillars; track spec.id) {
              <m3-card
                [interactive]="true"
                variant="outlined"
                surface="low"
                padding="sm"
                shape="lg"
                customClass="flex flex-col justify-between space-y-1.5 text-start"
                (action)="jumpToPillar(spec)">
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-main">{{ spec.name }}</span>
                  </div>
                  <div class="text-[10px] font-mono text-primary break-words">{{ spec.selectorOrCss }}</div>
                </div>
                <p class="text-[11px] text-muted leading-snug">{{ spec.keyRule }}</p>
              </m3-card>
            }
          </div>
        }

        <nav aria-label="Filtrar pilares de Components" class="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-sub/60">
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

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'actions') {
        <app-components-actions-section
          (notify)="triggerActionSnackbar($event)"
          (copyText)="copyTextToClipboard($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'containment') {
        <app-components-containment-inputs-section
          (notify)="triggerActionSnackbar($event)"
          (copyText)="copyTextToClipboard($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'progress') {
        <app-components-progress-section
          (copyText)="copyTextToClipboard($event)" />
      }

      @if (selectedSectionFilter() === 'all' || selectedSectionFilter() === 'controls') {
        <app-components-controls-overlays-section
          [snackbarUndoCount]="snackbarUndoCount()"
          (notify)="triggerActionSnackbar($event)"
          (copyText)="copyTextToClipboard($event)" />
      }

      <m3-snackbar
        [message]="snackbarMessage()"
        actionLabel="Deshacer"
        [(open)]="snackbarOpen"
        (action)="onSnackbarUndo()" />
    </div>
  `
})
export class ComponentsLabComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly componentPillars = COMPONENT_PILLAR_SPECS;
  readonly showPillarMap = signal<boolean>(false);
  readonly selectedSectionFilter = signal<ComponentsSectionFilter>('all');

  readonly sectionFilterOptions: readonly { id: ComponentsSectionFilter; label: string }[] = [
    { id: 'all', label: 'Todos los Pilares (11)' },
    { id: 'actions', label: '1. Buttons & FAB' },
    { id: 'containment', label: '2. Cards, Chips & Inputs' },
    { id: 'progress', label: '3. Progress & Loading' },
    { id: 'controls', label: '4. Selection & Overlays' }
  ];

  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('Preferencias Web M3 guardadas');
  readonly snackbarUndoCount = signal<number>(0);

  jumpToPillar(spec: ComponentPillarSpec): void {
    const filterMap: Record<ComponentPillarSpec['id'], ComponentsSectionFilter> = {
      'all-buttons': 'actions',
      cards: 'containment',
      chips: 'containment',
      'text-fields': 'containment',
      'loading-indicator': 'progress',
      'progress-indicators': 'progress',
      switch: 'controls',
      'selection-controls': 'controls',
      slider: 'controls',
      tabs: 'controls',
      overlays: 'controls'
    };
    this.selectedSectionFilter.set(filterMap[spec.id]);
  }

  triggerActionSnackbar(msg: string): void {
    this.snackbarMessage.set(msg);
    this.snackbarOpen.set(true);
  }

  onSnackbarUndo(): void {
    this.snackbarUndoCount.update(c => c + 1);
  }

  copyTextToClipboard(payload: ClipboardCopyPayload): void {
    copyTextWithFeedback(this.platformId, payload.text, payload.message, (msg) =>
      this.triggerActionSnackbar(msg)
    );
  }
}
