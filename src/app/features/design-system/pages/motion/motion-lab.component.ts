import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { M3ButtonAnchorComponent, M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { ClipboardCopyPayload, copyTextWithFeedback } from '../../../../shared/utils/clipboard.util';
import { MotionPatternsSectionComponent } from './motion-patterns-section.component';
import { MotionPhysicsSectionComponent } from './motion-physics-section.component';
import { MotionPlaybookA11ySectionComponent } from './motion-playbook-a11y-section.component';
import { MotionTheaterTokensSectionComponent } from './motion-theater-tokens-section.component';

type MotionSectionFilter = 'all' | 'physics' | 'patterns' | 'theater' | 'playbook';

interface MotionPillarSummary {
  readonly id: string;
  readonly filter: MotionSectionFilter;
  readonly anchorId: string;
  readonly title: string;
  readonly tokens: string;
  readonly summary: string;
}

const MOTION_PILLARS: readonly MotionPillarSummary[] = [
  {
    id: 'p1',
    filter: 'physics',
    anchorId: 'motion-physics',
    title: '1. Asimetría Perceptual',
    tokens: 'medium4 (400ms) / long2 (500ms) ↔ medium1 (250ms)',
    summary: 'Entradas suaves y salidas ágiles; elementos en pantalla jamás frenan bruscamente al regresar.'
  },
  {
    id: 'p2',
    filter: 'physics',
    anchorId: 'motion-physics',
    title: '2. Springs Spatial vs Effects',
    tokens: 'Spatial ζ = 0.6/0.9 • Effects ζ = 1.0',
    summary: 'Posición y radio rebotan con intención; color, opacidad y elevación mantienen damping 1.0.'
  },
  {
    id: 'p3',
    filter: 'patterns',
    anchorId: 'motion-patterns',
    title: '3. 6 Patrones + Stagger',
    tokens: 'Container • Forward/Back • Lateral • Fade • Skeleton',
    summary: 'Coreografías espaciales por jerarquía real + ejemplo vivo de Cascada Stagger y View Transitions.'
  },
  {
    id: 'p4',
    filter: 'theater',
    anchorId: 'motion-theater',
    title: '4. Teatro SVG y 16 Tokens',
    tokens: 'short1 (50ms) → extra-long4 (1000ms) + 10 Easings',
    summary: 'Curvas Emphasized/Standard calibradas, pista horizontal y validador automático easing × duración.'
  },
  {
    id: 'p5',
    filter: 'playbook',
    anchorId: 'motion-playbook',
    title: '5. Playbook VT, Trampas & A11y',
    tokens: '@starting-style • 3 Trampas • Calm Fade 150ms',
    summary: '3 filtros de decisión, solución a max-width/height/ghosting y degradación accesible sin cortes de 1ms.'
  }
];

/**
 * Interactive orchestrator for Step 4 (Motion & Transitions Studio).
 * Provides an elevated M3 studio header, collapsible 5-pillar map,
 * clean section filtering, autonomous interactive child labs, and shared Snackbar feedback.
 */
@Component({
  selector: 'app-motion-lab',
  standalone: true,
  imports: [
    RouterLink,
    M3ButtonAnchorComponent,
    M3ButtonComponent,
    M3CardComponent,
    M3ChipComponent,
    M3SnackbarComponent,
    MotionPhysicsSectionComponent,
    MotionPatternsSectionComponent,
    MotionTheaterTokensSectionComponent,
    MotionPlaybookA11ySectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- MOTION STUDIO HEADER + MAPA COLAPSABLE + FILTROS -->
      <m3-card variant="elevated" padding="md" customClass="space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span class="material-symbols-rounded text-base" aria-hidden="true">animation</span>
              Paso 4 • Motion &amp; Transitions Studio (m3.material.io/styles/motion)
            </div>
            <h2 class="text-title-lg-emphasized text-main">
              Física Expressive, Patrones Canónicos, 16 Duraciones y Playbook de View Transitions
            </h2>
            <p class="text-xs text-muted max-w-4xl leading-relaxed">
              El movimiento M3 da vida y claridad espacial a los componentes usando física real de resortes, asimetría perceptual y cero números mágicos. Probá cada simulador y hacé clic en tokens o snippets para copiarlos listos para producción.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
            <m3-button
              variant="outlined"
              size="sm"
              icon="map"
              [toggle]="true"
              [(selected)]="showPillarMap">
              Mapa 5 Pilares
            </m3-button>
            <a m3-button variant="tonal" size="sm" icon="widgets" routerLink="/design-system/components">
              Components
            </a>
            <a m3-button variant="filled" size="sm" icon="menu_book" routerLink="/design-system/playbook">
              Biblia M3
            </a>
          </div>
        </div>

        @if (showPillarMap()) {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 pt-3 border-t border-outline-sub m3-anim-item-in">
            @for (pillar of pillars; track pillar.id) {
              <m3-card
                [interactive]="true"
                variant="outlined"
                surface="low"
                padding="sm"
                shape="lg"
                customClass="flex flex-col justify-between space-y-1.5 text-start"
                (action)="jumpToPillar(pillar)">
                <div class="space-y-1">
                  <span class="text-xs font-bold text-main block">{{ pillar.title }}</span>
                  <div class="text-[10px] font-mono text-primary break-words">{{ pillar.tokens }}</div>
                </div>
                <p class="text-[11px] text-muted leading-snug">{{ pillar.summary }}</p>
              </m3-card>
            }
          </div>
        }

        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-sub" role="group" aria-label="Filtrar secciones de Motion">
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'all'"
            (action)="activeSection.set('all')">
            Todos los Casos (5)
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'physics'"
            (action)="activeSection.set('physics')">
            1-2. Física &amp; Springs
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'patterns'"
            (action)="activeSection.set('patterns')">
            3. Patrones + Ejemplos
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'theater'"
            (action)="activeSection.set('theater')">
            4. Teatro &amp; 16 Tokens
          </m3-chip>
          <m3-chip
            type="filter"
            [selected]="activeSection() === 'playbook'"
            (action)="activeSection.set('playbook')">
            5. Playbook &amp; A11y
          </m3-chip>
        </div>
      </m3-card>

      @if (activeSection() === 'all' || activeSection() === 'physics') {
        <app-motion-physics-section (copyToken)="handleCopy($event)" />
      }

      @if (activeSection() === 'all' || activeSection() === 'patterns') {
        <app-motion-patterns-section (copyToken)="handleCopy($event)" />
      }

      @if (activeSection() === 'all' || activeSection() === 'theater') {
        <app-motion-theater-tokens-section (copyToken)="handleCopy($event)" />
      }

      @if (activeSection() === 'all' || activeSection() === 'playbook') {
        <app-motion-playbook-a11y-section (copyToken)="handleCopy($event)" />
      }

      <m3-snackbar
        [open]="snackbarOpen()"
        [message]="snackbarMessage()"
        [dismissible]="true"
        (openChange)="snackbarOpen.set($event)" />
    </div>
  `
})
export class MotionLabComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly activeSection = signal<MotionSectionFilter>('all');
  readonly showPillarMap = signal<boolean>(false);
  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');
  readonly pillars = MOTION_PILLARS;

  jumpToPillar(pillar: MotionPillarSummary): void {
    this.activeSection.set(pillar.filter);
    if (typeof document !== 'undefined') {
      requestAnimationFrame(() => {
        const el = document.getElementById(pillar.anchorId);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  handleCopy(payload: ClipboardCopyPayload): void {
    copyTextWithFeedback(this.platformId, payload.text, payload.message, (msg) => {
      this.snackbarMessage.set(msg);
      this.snackbarOpen.set(true);
    });
  }
}
