import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { ConsciousnessLevel } from '../../../core/clinic/clinic.models';
import {
  M3ButtonGroupComponent,
  M3ButtonGroupOption
} from '../../../shared/components/button/button-group.component';
import { M3SliderComponent } from '../../../shared/components/slider/slider.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';
import { CONSCIOUSNESS_OPTIONS } from './clinic-ui.tokens';

export type VitalNumericFieldKey = 'hr' | 'rr' | 'bpSys' | 'bpDia' | 'spo2' | 'temp';

interface VitalFieldConfig {
  key: VitalNumericFieldKey;
  label: string;
  suffix: string;
  inputMode: 'numeric' | 'decimal';
}

const VITAL_FIELD_CONFIGS: readonly VitalFieldConfig[] = [
  { key: 'hr', label: 'Frec. Cardíaca', suffix: 'bpm', inputMode: 'numeric' },
  { key: 'rr', label: 'Frec. Resp.', suffix: 'rpm', inputMode: 'numeric' },
  { key: 'spo2', label: 'SpO₂', suffix: '%', inputMode: 'numeric' },
  { key: 'bpSys', label: 'PA Sistólica', suffix: 'mmHg', inputMode: 'numeric' },
  { key: 'bpDia', label: 'PA Diastólica', suffix: 'mmHg', inputMode: 'numeric' },
  { key: 'temp', label: 'Temperatura', suffix: '°C', inputMode: 'decimal' }
];

const ACVPU_BUTTON_OPTIONS: M3ButtonGroupOption[] = CONSCIOUSNESS_OPTIONS.map((opt) => ({
  id: opt.id,
  label: opt.label
}));

@Component({
  selector: 'app-clinic-vitals-fields',
  imports: [M3TextFieldComponent, M3ButtonGroupComponent, M3SwitchComponent, M3SliderComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        @for (field of fieldConfigs; track field.key) {
          <m3-text-field
            class="block"
            variant="filled"
            [label]="field.label"
            type="number"
            [inputMode]="field.inputMode"
            [suffix]="field.suffix"
            [value]="readValue(field.key)"
            (valueChange)="writeValue(field.key, $event)"
          />
        }
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <div class="rounded-m3-lg bg-surface p-3 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-label-md-emphasized text-main">Nivel de Conciencia (ACVPU)</span>
            <span class="text-label-sm font-mono text-muted">{{ consciousnessLabel() }}</span>
          </div>
          <m3-button-group
            variant="connected"
            size="sm"
            selectionMode="single"
            ariaLabel="Nivel de conciencia ACVPU"
            customClass="clinic-connected-group"
            class="clinic-connected-group-host"
            [options]="acvpuOptions"
            [value]="[consciousness()]"
            (selectionChange)="onConsciousnessChange($event)"
          />
        </div>

        <div class="rounded-m3-lg bg-surface p-3 flex items-center justify-between gap-3">
          <m3-switch
            label="Oxígeno suplementario"
            description="Suma +2 pts al cálculo clínico NEWS2"
            iconMode="selected"
            [(checked)]="supplementalO2"
          />
        </div>
      </div>

      <div class="rounded-m3-lg bg-surface p-3.5">
        <m3-slider
          label="Escala visual análoga del dolor (EVA)"
          [min]="0"
          [max]="10"
          [step]="1"
          [showStops]="true"
          size="sm"
          unit="/10"
          [value]="painNumber()"
          (valueChange)="onPainSliderChange($event)"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicVitalsFieldsComponent {
  readonly hr = model.required<string>();
  readonly rr = model<string>('16');
  readonly bpSys = model.required<string>();
  readonly bpDia = model.required<string>();
  readonly spo2 = model.required<string>();
  readonly temp = model.required<string>();
  readonly pain = model.required<string>();
  readonly consciousness = model<ConsciousnessLevel>('A');
  readonly supplementalO2 = model<boolean>(false);

  protected readonly fieldConfigs = VITAL_FIELD_CONFIGS;
  protected readonly acvpuOptions = ACVPU_BUTTON_OPTIONS;

  protected consciousnessLabel(): string {
    return CONSCIOUSNESS_OPTIONS.find((c) => c.id === this.consciousness())?.description ?? 'Alerta';
  }

  protected painNumber(): number {
    const parsed = Number(this.pain());
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(10, Math.max(0, Math.round(parsed)));
  }

  protected onPainSliderChange(next: number): void {
    this.pain.set(String(Math.min(10, Math.max(0, Math.round(next)))));
  }

  protected onConsciousnessChange(selected: string[]): void {
    const first = selected[0] as ConsciousnessLevel | undefined;
    if (first) {
      this.consciousness.set(first);
    }
  }

  protected readValue(key: VitalNumericFieldKey): string {
    switch (key) {
      case 'hr':
        return this.hr();
      case 'rr':
        return this.rr();
      case 'bpSys':
        return this.bpSys();
      case 'bpDia':
        return this.bpDia();
      case 'spo2':
        return this.spo2();
      case 'temp':
        return this.temp();
    }
  }

  protected writeValue(key: VitalNumericFieldKey, value: string): void {
    switch (key) {
      case 'hr':
        this.hr.set(value);
        break;
      case 'rr':
        this.rr.set(value);
        break;
      case 'bpSys':
        this.bpSys.set(value);
        break;
      case 'bpDia':
        this.bpDia.set(value);
        break;
      case 'spo2':
        this.spo2.set(value);
        break;
      case 'temp':
        this.temp.set(value);
        break;
    }
  }
}
