import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ComponentsLabComponent } from './components-lab.component';

describe('ComponentsLabComponent', () => {
  let component: ComponentsLabComponent;
  let fixture: ComponentFixture<ComponentsLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsLabComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentsLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const findButton = (root: ParentNode, text: string): HTMLButtonElement | undefined =>
    Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.includes(text));

  it('renders all 4 section pillars using M3 Expressive tabs, switches, cards, and block hosts', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Las 5 Variantes Canónicas');
    expect(el.textContent).toContain('Toggle Buttons, Button Groups');
    expect(el.textContent).toContain('Cards: ¿Dónde, Cómo, Por Qué y Cuándo Cambiar de Color?');
    expect(el.textContent).toContain('1. Linear Wavy Progress Indicator');
    expect(el.textContent).toContain('M3 Switch');
    expect(el.textContent).toContain('Snackbar');

    expect(el.querySelectorAll('m3-tabs').length).toBeGreaterThanOrEqual(3);
    expect(el.querySelector('app-components-actions-section')?.classList.contains('block')).toBe(true);
    expect(el.querySelector('app-components-containment-inputs-section')?.classList.contains('block')).toBe(true);
    expect(el.querySelector('app-components-progress-section')?.classList.contains('block')).toBe(true);
    expect(el.querySelector('app-components-controls-overlays-section')?.classList.contains('block')).toBe(true);

    // Collapsible 11-pillar map opens and filters to target section
    findButton(el, 'Mapa 11 Pilares')!.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('All Buttons');
    const sliderPillarCard = Array.from(el.querySelectorAll('m3-card[role="button"]')).find((c) =>
      c.textContent?.includes('Slider Expressive')
    ) as HTMLElement;
    expect(sliderPillarCard).toBeTruthy();
    sliderPillarCard.click();
    fixture.detectChanges();
    expect(component.selectedSectionFilter()).toBe('controls');
  });

  it('renders semantic Card tone controls via M3 ButtonGroup/Chips/Switch, Chips tabs, and TextField tabs with zero nested interactive controls', () => {
    const el = fixture.nativeElement as HTMLElement;
    const containEl = el.querySelector('app-components-containment-inputs-section')!;

    expect(containEl.querySelectorAll('m3-card[role="button"] button').length).toBe(0);
    expect(containEl.querySelector('m3-card.m3-card-elevated')).toBeTruthy();
    expect(containEl.querySelector('m3-card.m3-card-filled')).toBeTruthy();
    expect(containEl.querySelector('m3-card.m3-card-outlined')).toBeTruthy();
    expect(containEl.querySelector('m3-card.m3-card-tone-primary')).toBeTruthy();

    // Switch to Tab 2: Chips (4 Tipos) and verify removable input chips have zero nested interactive buttons
    findButton(containEl, 'Chips (4 Tipos)')!.click();
    fixture.detectChanges();
    expect(containEl.textContent).toContain('Los 4 Tipos Canónicos de Chips');
    expect(containEl.querySelectorAll('m3-chip button button, m3-chip button [role="button"]').length).toBe(0);
    expect(containEl.querySelectorAll('button.m3-chip-remove').length).toBe(3);

    // Switch to Tab 3: Text Fields Modernos
    findButton(containEl, 'Text Fields Modernos')!.click();
    fixture.detectChanges();
    expect(containEl.textContent).toContain('Text Fields Modernos: Filled (Diálogos) vs Outlined (Formularios)');
    expect(containEl.querySelectorAll('m3-text-field').length).toBeGreaterThanOrEqual(6);
  });

  it('renders expressive Actions M3 switches, ButtonGroup, SplitButton, FAB, and Snackbar', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-components-actions-section m3-switch #actions-loading-switch')).toBeTruthy();
    expect(el.querySelector('m3-button-group')).toBeTruthy();
    expect(el.querySelector('m3-split-button')).toBeTruthy();
    expect(el.querySelector('m3-fab')).toBeTruthy();
    expect(el.querySelector('m3-switch')).toBeTruthy();
    expect(el.querySelector('m3-snackbar')).toBeTruthy();

    component.triggerActionSnackbar('Guardado');
    fixture.detectChanges();
    expect(component.snackbarOpen()).toBe(true);
    expect(el.querySelector('.m3-snackbar')?.textContent).toContain('Guardado');
  });

  it('controls unified Linear and Circular progress indicators, Loading Indicator tab, and Umbrales matrix tab', () => {
    const el = fixture.nativeElement as HTMLElement;
    const progressEl = el.querySelector('app-components-progress-section')!;
    expect(progressEl.querySelector('g.m3-progress-blueprint')).toBeNull();

    // Toggle Blueprint and Pause buttons (M3 toggle buttons)
    findButton(progressEl, 'Modo Blueprint (Cotas)')!.click();
    findButton(progressEl, 'Pausar Onda')!.click();
    fixture.detectChanges();

    expect(progressEl.querySelectorAll('g.m3-progress-blueprint').length).toBe(7);
    expect(progressEl.textContent).toContain('Reanudar Onda');

    // Preset 4% attenuates amplitude envelope A(p) = 0.4
    findButton(progressEl, '4% (Rampa inicio)')!.click();
    fixture.detectChanges();
    expect(progressEl.textContent).toContain('A(p) = 0.40');

    // Real <m3-slider> adjusts wavelength cleanly and Reset restores M3 defaults
    expect(progressEl.querySelectorAll('m3-slider').length).toBe(4);
    const wavelengthRange = progressEl.querySelector('m3-slider #lab-wavelength') as HTMLInputElement;
    expect(wavelengthRange).toBeTruthy();
    wavelengthRange.value = '52';
    wavelengthRange.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(progressEl.querySelector('pre')?.textContent).toContain('[wavelength]="52"');

    findButton(progressEl, 'Defaults M3')!.click();
    fixture.detectChanges();
    expect(progressEl.querySelector('pre')?.textContent).toContain('[value]="65"');

    // Switch to Tab 2: Loading Indicator (<5s)
    findButton(progressEl, 'Loading Indicator (<5s)')!.click();
    fixture.detectChanges();
    expect(progressEl.querySelector('app-components-loading-panel')).toBeTruthy();
    expect(progressEl.querySelector('m3-loading-indicator')).toBeTruthy();
    expect(progressEl.textContent).toContain('Secuencia Canónica M3');

    // Switch to Tab 3: Umbrales & Guía
    findButton(progressEl, 'Umbrales & Guía')!.click();
    fixture.detectChanges();
    expect(progressEl.textContent).toContain('Glosario Maestro M3 Expressive');
    expect(progressEl.textContent).toContain('200ms – 5s');
  });

  it('renders selection controls, slider, tabs, native dialog, and copies Switch iconMode & Progress snippets', async () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="/design-system/playbook"]')).toBeTruthy();
    expect(el.querySelectorAll('m3-checkbox').length).toBeGreaterThanOrEqual(4);
    expect(el.querySelectorAll('m3-radio-group').length).toBeGreaterThanOrEqual(2);
    expect(el.querySelectorAll('m3-radio').length).toBeGreaterThanOrEqual(6);
    expect(el.querySelector('m3-dialog')).toBeTruthy();

    const controlsEl = el.querySelector('app-components-controls-overlays-section') as HTMLElement;

    // Composable <m3-radio> error switch renders accessible alert feedback
    const radioErrorSwitch = controlsEl.querySelector('m3-switch #controls-radio-error') as HTMLButtonElement;
    expect(radioErrorSwitch).toBeTruthy();
    radioErrorSwitch.click();
    fixture.detectChanges();
    expect(controlsEl.querySelector('m3-radio-group [role="alert"]')?.textContent).toContain(
      'Selecciona un canal de entrega habilitado'
    );

    // Master tri-state checkbox starts indeterminate and toggles to checked
    const masterCheckbox = controlsEl.querySelector('m3-checkbox input[type="checkbox"]') as HTMLInputElement;
    expect(masterCheckbox.indeterminate).toBe(true);
    masterCheckbox.click();
    fixture.detectChanges();
    expect(masterCheckbox.checked).toBe(true);
    expect(masterCheckbox.indeterminate).toBe(false);

    // Open and dismiss native dialog specimen via UI buttons
    findButton(controlsEl, 'Abrir M3 Dialog (showModal)')!.click();
    fixture.detectChanges();
    const nativeDialog = controlsEl.querySelector('dialog.m3-dialog');
    expect(nativeDialog?.hasAttribute('open')).toBe(true);
    findButton(controlsEl, 'Confirmar')!.click();
    fixture.detectChanges();
    expect(controlsEl.textContent).toContain('confirm');

    // Progress RTL + Stop switch updates snippet cleanly
    const progressEl = el.querySelector('app-components-progress-section')!;
    const stopSwitch = progressEl.querySelector('m3-switch #lab-progress-stop') as HTMLButtonElement;
    stopSwitch.click();
    findButton(progressEl, 'RTL')!.click();
    fixture.detectChanges();

    const progressPre = progressEl.querySelector('pre')?.textContent ?? '';
    expect(progressPre).toContain('[showStop]="false"');
    expect(progressPre).toContain('dir="rtl"');
    expect(progressPre).not.toContain('showStopIndicator');

    // Switch iconMode M3 ButtonGroup reflects in clipboard snippet
    const iconModeGroup = controlsEl.querySelector('m3-button-group [aria-label="Modo de ícono para Switch M3"]');
    expect(iconModeGroup).toBeTruthy();
    findButton(iconModeGroup!, 'Selected')!.click();
    fixture.detectChanges();

    const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true
    });

    try {
      findButton(controlsEl, 'Copiar Switch')!.click();
      await Promise.resolve();
      fixture.detectChanges();

      expect(writeTextSpy).toHaveBeenCalledTimes(1);
      expect(writeTextSpy.mock.calls[0][0]).toContain('iconMode="selected"');
      expect(component.snackbarOpen()).toBe(true);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(navigator, 'clipboard', originalDescriptor);
      } else {
        delete (navigator as { clipboard?: Clipboard }).clipboard;
      }
    }
  });
});
