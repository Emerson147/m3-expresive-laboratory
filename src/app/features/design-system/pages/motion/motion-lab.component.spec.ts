import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { MotionLabComponent } from './motion-lab.component';
import { CANONICAL_EASINGS, MOTION_THEATER_SETS } from './motion-specs.data';

describe('MotionLabComponent', () => {
  async function setup(): Promise<{
    fixture: ComponentFixture<MotionLabComponent>;
    host: HTMLElement;
  }> {
    await TestBed.configureTestingModule({
      imports: [MotionLabComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(MotionLabComponent);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  function findButtonByText(root: ParentNode, textMatch: string): HTMLButtonElement | undefined {
    return Array.from(root.querySelectorAll('button')).find(btn =>
      (btn.textContent ?? '').includes(textMatch)
    ) as HTMLButtonElement | undefined;
  }

  it('renders M3 Kit primitives with block hosts and zero .transition-all, nested interactive controls, or .animate-pulse', async () => {
    const { host } = await setup();

    expect(host.querySelector('m3-card')).toBeTruthy();
    expect(host.querySelector('m3-button')).toBeTruthy();
    expect(host.querySelector('m3-button-group')).toBeTruthy();
    expect(host.querySelector('m3-tabs')).toBeTruthy();
    expect(host.querySelector('m3-chip')).toBeTruthy();
    expect(host.querySelector('m3-switch')).toBeTruthy();
    expect(host.querySelector('m3-snackbar')).toBeTruthy();

    expect(host.querySelector('app-motion-physics-section')?.classList.contains('block')).toBe(true);
    expect(host.querySelector('app-motion-patterns-section')?.classList.contains('block')).toBe(true);
    expect(host.querySelector('app-motion-theater-tokens-section')?.classList.contains('block')).toBe(true);
    expect(host.querySelector('app-motion-playbook-a11y-section')?.classList.contains('block')).toBe(true);

    expect(host.querySelector('.transition-all')).toBeNull();
    expect(host.querySelectorAll('div[role="button"]').length).toBe(0);
    expect(host.querySelectorAll('m3-card[role="button"] button, m3-card[role="button"] a').length).toBe(0);
    expect(host.querySelector('.animate-pulse')).toBeNull();
  });

  it('switches Pillar 1 asymmetry with bounded h/2 corners (zero 9999px) and Morph button', async () => {
    const { fixture, host } = await setup();

    expect(host.textContent).toContain('long2 • 500ms');
    expect(host.textContent).toContain('medium1 • 250ms');

    const panelBtn = findButtonByText(host, 'Panel En Pantalla');
    expect(panelBtn).toBeTruthy();
    expect(panelBtn!.style.borderRadius).toBe('16px');
    panelBtn!.click();
    fixture.detectChanges();
    expect(panelBtn!.style.borderRadius).toBe('24px');

    const morphBtn = findButtonByText(host, 'Guardar (Pill 9999px)');
    expect(morphBtn).toBeTruthy();
    morphBtn!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('Squircle 12px');

    const disposableBtn = findButtonByText(host, 'Descartable (400ms / 200ms)');
    expect(disposableBtn).toBeTruthy();
    disposableBtn!.click();
    fixture.detectChanges();

    expect(host.textContent).toContain('medium4 • 400ms');
    expect(host.textContent).toContain('short4 • 200ms');
  });

  it('switches Pillar 2 springs, target marker, slow-mo 3x, and disables linear() under Standard scheme', async () => {
    const { fixture, host } = await setup();

    expect(host.textContent).toContain('Meta 100%');
    expect(host.textContent).toContain('Damping 0.6 • Stiffness 800');
    const linearBtn = findButtonByText(host, 'linear() Multi-Rebote');
    expect(linearBtn).toBeTruthy();
    expect(linearBtn!.disabled).toBe(false);

    findButtonByText(host, 'Ver en Cámara Lenta (3x)')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('1050ms (3x)');

    const standardSpringBtn = host.querySelector(
      'm3-button-group [aria-label="Estilo del resorte"] button:nth-child(2)'
    ) as HTMLButtonElement | null;
    expect(standardSpringBtn).toBeTruthy();
    standardSpringBtn!.click();
    fixture.detectChanges();

    expect(host.textContent).toContain('Damping 0.9 • Stiffness 1400');
    const linearBtnAfterStandard = findButtonByText(host, 'linear() Multi-Rebote');
    expect(linearBtnAfterStandard!.disabled).toBe(true);
  });

  it('navigates all Pattern tabs including bidirectional Lateral, Enter/Exit inert toggle, Skeleton shimmer, and Stagger cascade', async () => {
    const { fixture, host } = await setup();

    const tabs = Array.from(host.querySelectorAll('m3-tabs [role="tab"]')) as HTMLButtonElement[];
    expect(tabs.length).toBe(7);

    // Tab 3: Lateral directional tracking
    tabs[2].click();
    fixture.detectChanges();
    findButtonByText(host, 'Hardware')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('Avanza →');
    findButtonByText(host, 'General')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('← Retrocede');

    // Tab 5: Enter & Exit keeps inert/aria-hidden transition clean
    tabs[4].click();
    fixture.detectChanges();
    const sheetBtn = findButtonByText(host, 'Abrir Bottom Sheet')!;
    const sheetPanel = Array.from(host.querySelectorAll('#motion-patterns div[aria-hidden]')).find(el =>
      (el.textContent ?? '').includes('Sheet de Acciones')
    ) as HTMLElement | undefined;
    expect(sheetPanel).toBeTruthy();
    expect(sheetPanel!.getAttribute('aria-hidden')).toBe('true');
    expect(sheetPanel!.hasAttribute('inert')).toBe(true);
    sheetBtn.click();
    fixture.detectChanges();
    expect(sheetPanel!.getAttribute('aria-hidden')).toBe('false');
    expect(sheetPanel!.hasAttribute('inert')).toBe(false);

    // Tab 6: Skeleton loader uses .m3-skeleton without .animate-pulse
    tabs[5].click();
    fixture.detectChanges();
    findButtonByText(host, 'Simular Carga Asíncrona (2s)')!.click();
    fixture.detectChanges();
    expect(host.querySelector('.m3-skeleton.m3-skeleton-shimmer')).toBeTruthy();
    expect(host.querySelector('.animate-pulse')).toBeNull();

    // Tab 7: Stagger cascade + real View Transitions card->detail expansion
    tabs[6].click();
    fixture.detectChanges();
    expect(host.textContent).toContain('+120ms');
    const bentoVtCard = Array.from(host.querySelectorAll('m3-card[role="button"]')).find(c =>
      (c.textContent ?? '').includes('Bento Telemetría')
    ) as HTMLElement | undefined;
    expect(bentoVtCard).toBeTruthy();
    bentoVtCard!.click();
    fixture.detectChanges();
    expect(bentoVtCard!.textContent).toContain('vt-name: hero-detail');
    expect(host.textContent).toContain('VISTA EXPANDIDA');
    expect(host.textContent).toContain('12.1 ms latency');
    findButtonByText(host, 'Volver a Grilla')!.click();
    fixture.detectChanges();
    expect(host.textContent).not.toContain('VISTA EXPANDIDA');
  });

  it('validates easing × duration pairings, 3x slow-mo track, slides 1000ms carousel, and keeps calibrated SVG curve specs', async () => {
    const { fixture, host } = await setup();

    expect(MOTION_THEATER_SETS.emphasized.cards.length).toBe(3);
    expect(CANONICAL_EASINGS.length).toBeGreaterThanOrEqual(10);
    for (const card of MOTION_THEATER_SETS.emphasized.cards) {
      expect(card.svgCurve.startsWith('M ')).toBe(true);
    }

    const durationGroup = host.querySelector('#motion-theater [aria-label="16 Tokens Oficiales de Duración"]');
    expect(durationGroup).toBeTruthy();

    findButtonByText(durationGroup!, 'short1 • 50ms')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('Advertencia: Curva Larga en Duración Corta');

    findButtonByText(durationGroup!, 'long2 • 500ms')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('Emparejamiento M3 Canónico Válido');

    findButtonByText(host, 'Ver en 3x Lento')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('1500ms = 3x');

    // Advance 1000ms Hero Carousel slide
    expect(host.textContent).toContain('Slide 1 / 3');
    findButtonByText(host, 'Siguiente Escena')!.click();
    fixture.detectChanges();
    expect(host.textContent).toContain('Slide 2 / 3');
  });

  it('covers 3 Silent Traps, native popover @starting-style surface, Reduced Motion switch, filtering, and Snackbar copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const previousClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });

    try {
      const { fixture, host } = await setup();

      expect(host.textContent).toContain('Las 3 Trampas Silenciosas');
      expect(host.textContent).toContain('Trampa 3: Ghosting');
      expect(host.textContent).toContain('html.vt-running');
      expect(host.textContent).toContain('.m3-aurora-orb');
      expect(host.textContent).toContain('transition-property: transform, opacity;');

      const popoverDemo = host.querySelector('[id="motion-top-layer-demo"][popover="auto"]');
      expect(popoverDemo).toBeTruthy();
      expect(popoverDemo!.classList.contains('m3-popover-surface')).toBe(true);

      // Toggle Reduced Motion simulator switch
      const a11ySwitch = host.querySelector('#motion-playbook m3-switch button[role="switch"]') as HTMLButtonElement | null;
      expect(a11ySwitch).toBeTruthy();
      a11ySwitch!.click();
      fixture.detectChanges();
      expect(host.textContent).toContain('Calm Fade (150ms');

      // Expand 5-pillar map
      findButtonByText(host, 'Mapa 5 Pilares')!.click();
      fixture.detectChanges();
      expect(host.textContent).toContain('2. Springs Spatial vs Effects');

      // Trigger copy token -> calls clipboard.writeText and opens Snackbar status notification
      findButtonByText(host, 'Copiar Tokens CSS')!.click();
      await Promise.resolve();
      fixture.detectChanges();
      expect(writeText).toHaveBeenCalledTimes(1);
      const snackbar = host.querySelector('m3-snackbar [role="status"]');
      expect(snackbar?.textContent).toContain('copiados al portapapeles');

      // Section filtering isolates requested section
      findButtonByText(host, '3. Patrones + Ejemplos')!.click();
      fixture.detectChanges();
      expect(host.querySelector('app-motion-patterns-section')).toBeTruthy();
      expect(host.querySelector('app-motion-physics-section')).toBeNull();
    } finally {
      if (previousClipboard) {
        Object.defineProperty(navigator, 'clipboard', previousClipboard);
      } else {
        delete (navigator as unknown as Record<string, unknown>)['clipboard'];
      }
    }
  });
});
