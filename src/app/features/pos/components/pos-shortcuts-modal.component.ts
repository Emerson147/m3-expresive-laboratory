import { Component, ElementRef, output, viewChild } from '@angular/core';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-pos-shortcuts-modal',
  standalone: true,
  imports: [M3ButtonComponent],
  host: {
    class: 'contents'
  },
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 bg-scrim z-40 m3-dialog-backdrop cursor-pointer"></div>

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pos-shortcuts-title"
      class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[420px] h-fit max-h-[calc(100vh-3rem)] bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-2xl z-50 space-y-4 m3-dialog-surface">

      <div class="flex items-center justify-between pb-2.5 border-b border-outline-sub">
        <div class="flex items-center gap-2">
          <span class="material-symbols-rounded text-primary text-xl" aria-hidden="true">keyboard</span>
          <h3
            #modalHeading
            id="pos-shortcuts-title"
            tabindex="-1"
            class="font-bold text-base text-main outline-none">
            Atajos de Teclado POS
          </h3>
        </div>
        <m3-button
          [iconOnly]="true"
          variant="text"
          size="sm"
          icon="close"
          ariaLabel="Cerrar ayuda de atajos"
          (action)="close.emit()" />
      </div>

      <div class="space-y-2 text-xs">
        @for (shortcut of shortcuts; track shortcut.keys) {
          <div class="flex items-center justify-between p-2.5 rounded-m3-md bg-surface-high">
            <span class="font-medium text-main">{{ shortcut.label }}</span>
            <kbd class="px-2.5 py-0.5 rounded-m3-xs bg-surface-box border border-outline-sub font-mono font-bold">
              {{ shortcut.keys }}
            </kbd>
          </div>
        }
      </div>

      <div class="pt-2 border-t border-outline-sub text-right">
        <m3-button variant="filled" [morph]="true" (action)="close.emit()">Entendido</m3-button>
      </div>
    </div>
  `
})
export class PosShortcutsModalComponent {
  private readonly modalHeading = viewChild<ElementRef<HTMLElement>>('modalHeading');

  readonly close = output<void>();

  readonly shortcuts = [
    { label: 'Enfocar buscador o lector de barras', keys: 'F2' },
    { label: 'Identificar Cliente / Empresa (RUC/DNI)', keys: 'F4' },
    { label: 'Abrir Pasarela de Cobro', keys: 'Ctrl + Enter' },
    { label: 'Cerrar modales o cancelar', keys: 'Esc' }
  ] as const;

  constructor() {
    queueMicrotask(() => this.modalHeading()?.nativeElement.focus());
  }
}

