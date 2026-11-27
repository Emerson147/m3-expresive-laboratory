import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { PlaybookLabComponent } from './playbook-lab.component';

describe('PlaybookLabComponent', () => {
  async function setup(): Promise<{
    fixture: ComponentFixture<PlaybookLabComponent>;
    host: HTMLElement;
  }> {
    await TestBed.configureTestingModule({
      imports: [PlaybookLabComponent],
      providers: [provideRouter([])],
      deferBlockBehavior: DeferBlockBehavior.Manual
    }).compileComponents();

    const fixture = TestBed.createComponent(PlaybookLabComponent);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  function findButtonByText(root: ParentNode, textMatch: string): HTMLButtonElement | undefined {
    return Array.from(root.querySelectorAll('button')).find((btn) =>
      (btn.textContent ?? '').includes(textMatch)
    ) as HTMLButtonElement | undefined;
  }

  it('removes redundant step navigation from hero/layers, renders real layer contracts + runtime pillars, and enforces M3 DOM hygiene', async () => {
    const { host } = await setup();

    // No duplicate step buttons in Playbook Hero header or inside Architecture Layer cards
    const heroCard = host.querySelector('m3-card')!;
    expect(heroCard.querySelectorAll('a[m3-button]').length).toBe(0);
    expect(host.querySelectorAll('#playbook-architecture a[m3-button]').length).toBe(0);

    // Unidirectional dependency chain + Contracts + 3 Runtime Pillars
    expect(host.textContent).toContain('Regla de Dependencia Unidireccional');
    expect(host.textContent).toContain('Exporta (Contrato):');
    expect(host.textContent).toContain('Prohibido:');
    expect(host.textContent).toContain('Ports & Adapters en core/');
    expect(host.textContent).toContain('Zoneless + @defer Chunks + Virtualización CDK');
    expect(host.textContent).toContain('Optimistic UI + Dirty Guards + vercel.json SPA');

    // Host layout & M3 motion hygiene
    expect(host.querySelector('app-playbook-architecture-section')?.classList.contains('block')).toBe(true);
    expect(host.querySelector('app-playbook-examples-section')?.classList.contains('block')).toBe(true);
    expect(host.querySelector('app-playbook-inspector-section')?.classList.contains('block')).toBe(true);
    expect(host.querySelector('.transition-all')).toBeNull();
    expect(host.querySelector('.animate-pulse')).toBeNull();
    expect(host.querySelectorAll('div[role="button"]').length).toBe(0);
    expect(host.querySelectorAll('m3-card[role="button"] button').length).toBe(0);
  });

  it('tracks checklist progress and copies the Vercel SPA starter snippet with Snackbar feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });

    try {
      const { fixture, host } = await setup();
      const archEl = host.querySelector('#playbook-architecture')!;

      expect(archEl.textContent).toContain('3 / 6 listos (50%)');
      const checkboxes = Array.from(
        archEl.querySelectorAll('m3-checkbox input[type="checkbox"]')
      ) as HTMLInputElement[];
      expect(checkboxes.length).toBe(6);

      checkboxes[2].click();
      fixture.detectChanges();
      expect(archEl.textContent).toContain('4 / 6 listos (67%)');

      findButtonByText(archEl, 'Copiar código')!.click();
      await Promise.resolve();
      fixture.detectChanges();

      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText.mock.calls[0][0]).toContain('dist/m3-expressive-ui/browser');
      expect(host.querySelector('m3-snackbar [role="status"]')?.textContent).toContain(
        'Configuración vercel.json copiada'
      );
    } finally {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      } else {
        delete (navigator as { clipboard?: Clipboard }).clipboard;
      }
    }
  });

  it('runs Scenario 1 (Clean Ports & Optimistic UI) with instant update, Snackbar Undo, and automatic Rollback on 503', async () => {
    vi.useFakeTimers();
    try {
      const { fixture, host } = await setup();
      const examplesEl = host.querySelector('#playbook-examples')!;

      // Initial pending batch LOTE-901 -> click Aprobar
      expect(examplesEl.textContent).toContain('LOTE-901');
      findButtonByText(examplesEl, 'Aprobar')!.click();
      fixture.detectChanges();

      // Immediate t=0ms optimistic badge appears before Adapter resolves
      expect(examplesEl.textContent).toContain('Optimistic • Esperando Port...');

      await vi.advanceTimersByTimeAsync(150);
      fixture.detectChanges();
      expect(host.querySelector('m3-snackbar [role="status"]')?.textContent).toContain(
        'LOTE-901 guardado como Aprobado'
      );

      // Click Snackbar Undo
      const undoBtn = findButtonByText(host.querySelector('m3-snackbar')!, 'Deshacer')!;
      undoBtn.click();
      fixture.detectChanges();
      expect(examplesEl.textContent).toContain('Undo');

      // Switch to flaky 503 Adapter and test automatic Rollback
      findButtonByText(examplesEl, 'Adapter Inestable (Error 503)')!.click();
      fixture.detectChanges();

      findButtonByText(examplesEl, 'Aprobar')!.click();
      fixture.detectChanges();
      expect(examplesEl.textContent).toContain('Optimistic • Esperando Port...');

      await vi.advanceTimersByTimeAsync(250);
      fixture.detectChanges();
      expect(examplesEl.textContent).toContain('Rollback');
      expect(host.querySelector('m3-snackbar [role="status"]')?.textContent).toContain(
        'se revirtió el cambio optimista'
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('runs Scenario 2 (@defer + CDK Virtual Scroll) and Scenario 3 (Resilient States + Dirty Guard Modal)', async () => {
    const { fixture, host } = await setup();
    const examplesEl = host.querySelector('#playbook-examples')!;
    const scenarioTabs = Array.from(
      examplesEl.querySelectorAll('[aria-label="Escenarios avanzados de arquitectura Angular y M3"] [role="tab"]')
    ) as HTMLButtonElement[];
    expect(scenarioTabs.length).toBe(3);

    // Scenario 2: @placeholder -> @defer Complete with 2,500 virtualized rows
    scenarioTabs[1].click();
    fixture.detectChanges();
    expect(examplesEl.querySelector('.m3-skeleton.m3-skeleton-shimmer')).toBeTruthy();
    expect(examplesEl.querySelector('app-playbook-defer-payload')).toBeNull();

    findButtonByText(examplesEl, 'Cargar Panel Pesado')!.click();
    fixture.detectChanges();
    const deferBlocks = await fixture.getDeferBlocks();
    expect(deferBlocks.length).toBe(1);
    await deferBlocks[0].render(DeferBlockState.Complete);
    fixture.detectChanges();

    const deferPayload = examplesEl.querySelector('app-playbook-defer-payload')!;
    expect(deferPayload).toBeTruthy();
    expect(deferPayload.textContent).toContain('2,500');
    findButtonByText(deferPayload, 'Errores 503')!.click();
    fixture.detectChanges();
    expect(deferPayload.textContent).toContain('250');

    // Scenario 3: Preserves typed draft under Error 500 and opens native Dirty Guard Dialog
    scenarioTabs[2].click();
    fixture.detectChanges();
    expect(examplesEl.textContent).toContain('Sincronizado (Clean)');

    const routeInput = examplesEl.querySelector('m3-text-field input') as HTMLInputElement;
    routeInput.value = '/api/v3/custom';
    routeInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(examplesEl.textContent).toContain('Cambios sin guardar (Dirty)');

    findButtonByText(examplesEl, 'Error 500 (Conservar Form)')!.click();
    fixture.detectChanges();
    expect(examplesEl.querySelector('[role="alert"]')?.textContent).toContain('Error 500');
    expect((examplesEl.querySelector('m3-text-field input') as HTMLInputElement).value).toBe('/api/v3/custom');

    findButtonByText(examplesEl, 'Intentar Cerrar Editor')!.click();
    fixture.detectChanges();
    const dialog = examplesEl.querySelector('m3-dialog dialog')!;
    expect(dialog.textContent).toContain('¿Descartar cambios sin guardar?');

    findButtonByText(examplesEl, 'Descartar Cambios')!.click();
    fixture.detectChanges();
    expect(examplesEl.textContent).toContain('Sincronizado (Clean)');
  });

  it('upgrades Oracle (6 Sacred Questions + Architecture rules), Vercel Troubleshooter, and 4 Advanced Blueprints', async () => {
    const { fixture, host } = await setup();
    const inspectorEl = host.querySelector('#playbook-inspector')!;
    const inspTabs = Array.from(
      inspectorEl.querySelectorAll('[aria-label="Secciones de Oráculo, Inspector de Fallas y Recetas"] [role="tab"]')
    ) as HTMLButtonElement[];
    expect(inspTabs.length).toBe(3);

    // Tab 1: 6 Sacred Questions + Architecture & Speed category filter
    expect(inspectorEl.textContent).toContain('Las 6 Preguntas Sagradas');
    findButtonByText(inspectorEl, '5. Arquitectura, Speed & Deploy')!.click();
    fixture.detectChanges();
    expect(inspectorEl.textContent).toContain('Deploy Vercel SPA');
    expect(inspectorEl.textContent).toContain('CdkVirtualScrollViewport');

    // Tab 2: Vercel / Architecture troubleshooting filter
    inspTabs[1].click();
    fixture.detectChanges();
    findButtonByText(inspectorEl, '5. Arquitectura & Vercel')!.click();
    fixture.detectChanges();
    expect(inspectorEl.textContent).toContain('error 404');
    expect(inspectorEl.textContent).toContain('límite de 1MB');

    // Tab 3: 4 Advanced Blueprints
    inspTabs[2].click();
    fixture.detectChanges();
    expect(inspectorEl.textContent).toContain('Receta 1: Clean Port & Adapter');
    findButtonByText(inspectorEl, '@defer + Virtual')!.click();
    fixture.detectChanges();
    expect(inspectorEl.textContent).toContain('cdk-virtual-scroll-viewport');
  });
});
