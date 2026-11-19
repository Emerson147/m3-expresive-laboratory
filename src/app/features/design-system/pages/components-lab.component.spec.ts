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

  it('should render all 6 M3 official component pillars plus Web Switch and Snackbar', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Las 5 Variantes Canónicas');
    expect(el.textContent).toContain('Toggle Buttons, Button Groups');
    expect(el.textContent).toContain('Cards: ¿Dónde, Cómo, Por Qué y Cuándo Cambiar de Color?');
    expect(el.textContent).toContain('Los 4 Tipos Canónicos de Chips');
    expect(el.textContent).toContain('Text Fields Modernos: Filled (Diálogos) vs Outlined (Formularios)');
    expect(el.textContent).toContain('Loading Indicator vs. Progress Indicator');
    expect(el.textContent).toContain('M3 Switch');
    expect(el.textContent).toContain('Snackbar');
    expect(el.textContent).toContain('Linear & Circular Progress Indicators');
    expect(el.textContent).toContain('Carga Determinada (0% → 100%) con Aplanamiento Final');
    expect(el.textContent).toContain('1. Linear Wavy Progress Indicator');
    expect(el.textContent).toContain('2. Circular Wavy Progress Indicator');
    expect(el.textContent).toContain('Parámetros Matemáticos en Tiempo Real');
    expect(el.textContent).toContain('Ecuaciones & Telemetría A(p)');
  });

  it('should render semantic Card tone controls, Outlined variant example, and never nest buttons inside interactive cards', () => {
    const nestedInCard = fixture.nativeElement.querySelectorAll('m3-card[role="button"] button');
    expect(nestedInCard.length).toBe(0);
    expect(fixture.nativeElement.querySelector('m3-card.m3-card-elevated')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('m3-card.m3-card-filled')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('m3-card.m3-card-outlined')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('m3-card.m3-card-tone-primary')).toBeTruthy();
  });

  it('should contain zero nested interactive elements inside removable input chips', () => {
    const nested = fixture.nativeElement.querySelectorAll('m3-chip button button, m3-chip button [role="button"]');
    expect(nested.length).toBe(0);

    const removeButtons = fixture.nativeElement.querySelectorAll('button.m3-chip-remove');
    expect(removeButtons.length).toBe(3);
  });

  it('should render expressive ButtonGroup, SplitButton, FAB, Switch, and Snackbar triggers', () => {
    expect(fixture.nativeElement.querySelector('m3-button-group')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('m3-split-button')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('m3-fab')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('m3-switch')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('m3-snackbar')).toBeTruthy();

    component.triggerActionSnackbar('Guardado');
    fixture.detectChanges();
    expect(component.snackbarOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.m3-snackbar')?.textContent).toContain('Guardado');
  });

  it('should control unified Linear and Circular progress components via Blueprint, Pause, A(p) ramp presets, and wave sliders', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('g.m3-progress-blueprint')).toBeNull();

    component.toggleProgressBlueprint();
    component.toggleProgressPaused();
    fixture.detectChanges();

    // Blueprint renders directly on unified Linear (4 wavy bars) and Circular (3 wavy circles) indicators
    expect(el.querySelectorAll('g.m3-progress-blueprint').length).toBe(7);
    expect(el.textContent).toContain('Reanudar Onda');

    component.applyWaveProgressPreset(4);
    fixture.detectChanges();
    expect(component.waveEnvelope().factor).toBeCloseTo(0.4, 2);
    expect(component.waveEffectiveAmplitude()).toBeCloseTo(1.2, 2);

    component.demoProgressAmplitude.set(6.0);
    component.demoProgressWavelength.set(28);
    fixture.detectChanges();
    expect(component.labLinearStdRef()?.containerHeight()).toBe(16);
    expect(component.labCircularMdRef()?.waveLobes()).toBeGreaterThan(8);

    component.resetWaveDefaults();
    fixture.detectChanges();
    expect(component.demoProgressValue()).toBe(65);
    expect(component.demoProgressAmplitude()).toBe(3.0);
    expect(component.demoProgressWavelength()).toBe(40);
    expect(component.demoProgressSpeed()).toBe(40);
  });

  it('should render essential selection controls, slider, tabs, native dialog, and Biblia M3 shortcut link', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="/design-system/playbook"]')).toBeTruthy();
    expect(el.querySelectorAll('m3-checkbox').length).toBeGreaterThanOrEqual(4);
    expect(el.querySelectorAll('m3-radio-group').length).toBeGreaterThanOrEqual(2);
    expect(el.querySelectorAll('m3-radio').length).toBeGreaterThanOrEqual(6);
    expect(el.querySelector('m3-slider')).toBeTruthy();

    // Composable <m3-radio> error state renders accessible alert feedback
    component.demoRadioError.set(true);
    fixture.detectChanges();
    expect(el.querySelector('m3-radio-group [role="alert"]')?.textContent).toContain('Selecciona un canal de entrega habilitado');
    expect(el.querySelector('m3-tabs')).toBeTruthy();
    expect(el.querySelector('m3-dialog')).toBeTruthy();

    // Master tri-state starts indeterminate because demoCheckboxAudit is true and demoCheckboxBackup is false
    expect(component.demoCheckboxIndeterminate()).toBe(true);
    component.toggleDemoCheckboxMaster();
    fixture.detectChanges();
    expect(component.demoCheckboxMaster()).toBe(true);
    expect(component.demoCheckboxIndeterminate()).toBe(false);

    // Open and close native dialog specimen
    component.demoDialogOpen.set(true);
    fixture.detectChanges();
    const nativeDialog = el.querySelector('dialog.m3-dialog');
    expect(nativeDialog?.hasAttribute('open')).toBe(true);

    component.onDemoDialogClosed('confirm');
    fixture.detectChanges();
    expect(component.demoDialogLastClose()).toBe('confirm');
  });
});

