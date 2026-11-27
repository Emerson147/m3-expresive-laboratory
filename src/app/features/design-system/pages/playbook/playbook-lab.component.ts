import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { ClipboardCopyPayload, copyTextWithFeedback } from '../../../../shared/utils/clipboard.util';
import { PlaybookArchitectureSectionComponent } from './playbook-architecture-section.component';
import {
  PlaybookExamplesSectionComponent,
  PlaybookToastRequest
} from './playbook-examples-section.component';
import { PlaybookInspectorSectionComponent } from './playbook-inspector-section.component';

type PlaybookSectionFilter = 'all' | 'architecture' | 'examples' | 'inspector';

/**
 * Interactive orchestrator for Step 5 ("Biblia M3 & Arquitectura"):
 * cleanly delegates step switching to the Shell Navigation Rail / Dock bar without header clutter,
 * unites architectural contracts + Clean Ports/Speed scenarios + strict Oracle/Diagnostic Inspector,
 * and exposes an actionable M3 Snackbar supporting Undo / Retry callbacks.
 */
@Component({
  selector: 'app-playbook-lab',
  standalone: true,
  imports: [
    M3CardComponent,
    M3ChipComponent,
    M3SnackbarComponent,
    PlaybookArchitectureSectionComponent,
    PlaybookExamplesSectionComponent,
    PlaybookInspectorSectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- HERO: RESUMEN DE BIBLIA Y FILTROS DE SECCIÓN (SIN BOTONES REDUNDANTES DE NAVEGACIÓN) -->
      <m3-card variant="elevated" padding="md" customClass="space-y-4">
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">menu_book</span>
              Paso 5 • Biblia M3, Arquitectura y Despliegue (De Cero a Producción)
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Contratos de 4 Capas, Escenarios Avanzados de Escala y Oráculo de Ingeniería
            </h2>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              Consulta los contratos estrictos entre capas, prueba en vivo <strong>Ports &amp; Adapters</strong>, <strong>&#64;defer + Virtual Scroll</strong> y <strong>Resiliencia de Estado</strong>, o diagnostica síntomas reales de UI, rendimiento y <strong>Vercel SPA</strong>.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0 self-start xl:self-center">
            <span class="px-3 py-1 rounded-m3-full bg-primary-box text-on-primary-box text-[11px] font-bold">
              M3 UI + Clean Core + Vercel SPA
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-sub" role="group" aria-label="Filtrar secciones de la Biblia M3">
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'all'"
            (action)="activeSection.set('all')">
            Todo el Manual (3)
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'architecture'"
            (action)="activeSection.set('architecture')">
            1. Contratos, Pilares &amp; Kit
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'examples'"
            (action)="activeSection.set('examples')">
            2. Escenarios Avanzados (3)
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'inspector'"
            (action)="activeSection.set('inspector')">
            3. Oráculo &amp; Diagnóstico
          </m3-chip>
        </div>
      </m3-card>

      @if (activeSection() === 'all' || activeSection() === 'architecture') {
        <app-playbook-architecture-section (copyToken)="handleCopy($event)" />
      }

      @if (activeSection() === 'all' || activeSection() === 'examples') {
        <app-playbook-examples-section
          (copyToken)="handleCopy($event)"
          (notify)="showActionToast($event)" />
      }

      @if (activeSection() === 'all' || activeSection() === 'inspector') {
        <app-playbook-inspector-section (copyToken)="handleCopy($event)" />
      }

      <m3-snackbar
        [message]="snackbarMessage()"
        [actionLabel]="snackbarActionLabel()"
        [(open)]="snackbarOpen"
        [dismissible]="true"
        (action)="handleSnackbarAction()"
        (dismissed)="clearPendingAction()" />
    </div>
  `
})
export class PlaybookLabComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly activeSection = signal<PlaybookSectionFilter>('all');
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');
  readonly snackbarActionLabel = signal<string | null>(null);
  private pendingSnackbarCallback: (() => void) | null = null;

  handleCopy(payload: ClipboardCopyPayload): void {
    copyTextWithFeedback(this.platformId, payload.text, payload.message, (msg) => {
      this.showActionToast({ message: msg });
    });
  }

  showActionToast(request: PlaybookToastRequest): void {
    this.pendingSnackbarCallback = request.onAction ?? null;
    this.snackbarActionLabel.set(request.actionLabel ?? null);
    this.snackbarMessage.set(request.message);
    this.snackbarOpen.set(true);
  }

  handleSnackbarAction(): void {
    const callback = this.pendingSnackbarCallback;
    this.pendingSnackbarCallback = null;
    this.snackbarActionLabel.set(null);
    callback?.();
  }

  clearPendingAction(): void {
    this.pendingSnackbarCallback = null;
    this.snackbarActionLabel.set(null);
  }
}
