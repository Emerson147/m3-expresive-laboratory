import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TelemetryComponent } from './telemetry.component';
import { TelemetryService } from '../../core/telemetry/telemetry.service';
import { ThemeService } from '../../core/theme/theme.service';

describe('TelemetryComponent', () => {
  let component: TelemetryComponent;
  let fixture: ComponentFixture<TelemetryComponent>;
  let telemetryService: TelemetryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelemetryComponent],
      providers: [TelemetryService, ThemeService]
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryComponent);
    component = fixture.componentInstance;
    telemetryService = TestBed.inject(TelemetryService);
    fixture.detectChanges();
  });

  it('should create the telemetry component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Mission Control header and KPIs', () => {
    const el = fixture.nativeElement;
    const title = el.querySelector('h1');
    expect(title?.textContent).toContain('Panel de Monitoreo de Despachos y Flotas');

    const kpiCards = el.querySelectorAll('section div.rounded-3xl');
    expect(kpiCards.length).toBeGreaterThanOrEqual(4);
  });

  it('should update seed hue when slider moves', () => {
    const themeService = TestBed.inject(ThemeService);
    component.onHueChange(180);
    expect(themeService.currentHue()).toBe(180);
  });

  it('should select vehicle when clicked', () => {
    component.telemetryService.selectVehicle('TRK-912');
    fixture.detectChanges();
    expect(component.telemetryService.selectedVehicleId()).toBe('TRK-912');
  });

  it('should open and close inspect modal', () => {
    const vehicle = telemetryService.vehicles()[0];
    telemetryService.openInspectModal(vehicle);
    fixture.detectChanges();

    expect(telemetryService.isInspectModalOpen()).toBe(true);

    component.onEscapePress();
    fixture.detectChanges();
    expect(telemetryService.isInspectModalOpen()).toBe(false);
  });

  it('should open assign route modal with selected vehicle data and submit dispatch', () => {
    telemetryService.selectVehicle('TRK-884');
    fixture.detectChanges();

    component.onAssignRouteClick();
    fixture.detectChanges();

    expect(telemetryService.isAssignModalOpen()).toBe(true);
    expect(component.assignFormVehicleId).toBe('TRK-884');

    component.assignFormDestination = 'Terminal San Bartolo';
    component.onSubmitAssignRoute();
    fixture.detectChanges();

    expect(telemetryService.isAssignModalOpen()).toBe(false);
    const updated = telemetryService.vehicles().find(v => v.id === 'TRK-884');
    expect(updated?.destination).toBe('Terminal San Bartolo');
  });
});
