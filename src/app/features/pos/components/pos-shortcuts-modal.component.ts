import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-pos-shortcuts-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [M3ButtonComponent, M3DialogComponent],
  host: {
    class: 'contents'
  },
  template: `
    <m3-dialog
      variant="expressive"
      size="sm"
      tone="primary"
      icon="keyboard"
      headline="Atajos de Teclado POS"
      subtitle="Operación rápida sin soltar el teclado"
      [open]="open()"
      [managedClose]="true"
      closeLabel="Cerrar ayuda de atajos"
      (closeRequested)="close.emit()">

      <div class="flex flex-col gap-2 text-xs">
        @for (shortcut of shortcuts; track shortcut.keys) {
          <div class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-m3-md bg-surface-low">
            <span class="font-medium text-main">{{ shortcut.label }}</span>
            <kbd class="px-2.5 py-0.5 rounded-m3-xs bg-surface-high text-main font-mono font-bold shrink-0">
              {{ shortcut.keys }}
            </kbd>
          </div>
        }
      </div>

      <div dialog-actions>
        <m3-button type="button" variant="filled" [morph]="true" (action)="close.emit()">Entendido</m3-button>
      </div>
    </m3-dialog>
  `
})
export class PosShortcutsModalComponent {
  readonly open = input<boolean>(false);
  readonly close = output<void>();

  readonly shortcuts = [
    { label: 'Enfocar buscador o lector de barras', keys: 'F2' },
    { label: 'Identificar Cliente / Empresa (RUC/DNI)', keys: 'F4' },
    { label: 'Abrir Pasarela de Cobro', keys: 'Ctrl + Enter' },
    { label: 'Cerrar modales o cancelar', keys: 'Esc' }
  ] as const;
}
