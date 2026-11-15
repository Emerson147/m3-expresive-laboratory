import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

export type VitalFieldKey = 'hr' | 'bpSys' | 'bpDia' | 'spo2' | 'temp' | 'pain';

interface VitalFieldConfig {
  key: VitalFieldKey;
  label: string;
  suffix: string;
  inputMode: 'numeric' | 'decimal';
}

const VITAL_FIELD_CONFIGS: readonly VitalFieldConfig[] = [
  { key: 'hr', label: 'FC', suffix: 'bpm', inputMode: 'numeric' },
  { key: 'bpSys', label: 'PA Sistólica', suffix: 'mmHg', inputMode: 'numeric' },
  { key: 'bpDia', label: 'PA Diastólica', suffix: 'mmHg', inputMode: 'numeric' },
  { key: 'spo2', label: 'SpO2', suffix: '%', inputMode: 'numeric' },
  { key: 'temp', label: 'Temp', suffix: '°C', inputMode: 'decimal' },
  { key: 'pain', label: 'Dolor EVA', suffix: '/ 10', inputMode: 'numeric' }
];

@Component({
  selector: 'app-clinic-vitals-fields',
  imports: [M3TextFieldComponent],
  host: { class: 'block' },
  template: `
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicVitalsFieldsComponent {
  readonly hr = model.required<string>();
  readonly bpSys = model.required<string>();
  readonly bpDia = model.required<string>();
  readonly spo2 = model.required<string>();
  readonly temp = model.required<string>();
  readonly pain = model.required<string>();

  protected readonly fieldConfigs = VITAL_FIELD_CONFIGS;

  protected readValue(key: VitalFieldKey): string {
    switch (key) {
      case 'hr':
        return this.hr();
      case 'bpSys':
        return this.bpSys();
      case 'bpDia':
        return this.bpDia();
      case 'spo2':
        return this.spo2();
      case 'temp':
        return this.temp();
      case 'pain':
        return this.pain();
    }
  }

  protected writeValue(key: VitalFieldKey, value: string): void {
    switch (key) {
      case 'hr':
        this.hr.set(value);
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
      case 'pain':
        this.pain.set(value);
        break;
    }
  }
}
