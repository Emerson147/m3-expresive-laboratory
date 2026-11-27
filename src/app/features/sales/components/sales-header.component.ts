import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { M3ButtonAnchorComponent, M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3SwitchComponent } from '../../../shared/components/switch/switch.component';

/**
 * Command header for the Sales History & Audit workbench.
 * Keeps a single primary Filled CTA alongside tonal/outlined support controls and Port 503 toggle.
 */
@Component({
  selector: 'app-sales-header',
  standalone: true,
  imports: [RouterLink, M3ButtonAnchorComponent, M3ButtonComponent, M3SwitchComponent],
  host: { class: 'block shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-surface-low rounded-m3-xl px-4 py-4 sm:px-6 sm:py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0">
          <span class="material-symbols-rounded text-2xl" aria-hidden="true">receipt_long</span>
        </div>

        <div class="min-w-0">
          <span class="text-label-sm-emphasized uppercase tracking-wider text-primary block">
            Auditoría Fiscal &amp; SalesLedgerPort
          </span>
          <h1 class="text-title-lg-emphasized sm:text-headline-sm-emphasized text-main truncate mt-0.5">
            Historial de Ventas &amp; Comprobantes
          </h1>
          <p class="text-body-sm text-muted truncate">
            CAJA-01 · {{ totalCount() }} comprobantes registrados · {{ pendingCount() }} pendientes de conciliar
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center touch-gap-8 shrink-0">
        <div class="flex items-center px-3 py-1 rounded-m3-full bg-surface">
          <m3-switch
            label="Simular 503"
            iconMode="selected"
            [checked]="simulateError503()"
            ariaLabel="Simular error 503 en SalesLedgerPort para probar Rollback optimista"
            (changed)="toggleSimulate503.emit($event)" />
        </div>

        <a
          m3-button
          variant="tonal"
          size="sm"
          icon="point_of_sale"
          routerLink="/pos">
          Ir a POS
        </a>

        <m3-button
          variant="outlined"
          size="sm"
          icon="download"
          (action)="exportCsv.emit()">
          Exportar CSV
        </m3-button>

        <m3-button
          variant="filled"
          size="md"
          icon="task_alt"
          [disabled]="pendingCount() === 0 && selectedReconcilableCount() === 0"
          (action)="reconcileAction.emit()">
          {{
            selectedReconcilableCount() > 0
              ? 'Conciliar Lote (' + selectedReconcilableCount() + ')'
              : 'Conciliar Pendientes (' + pendingCount() + ')'
          }}
        </m3-button>
      </div>
    </header>
  `
})
export class SalesHeaderComponent {
  readonly totalCount = input<number>(0);
  readonly pendingCount = input<number>(0);
  readonly selectedReconcilableCount = input<number>(0);
  readonly simulateError503 = input<boolean>(false);

  readonly toggleSimulate503 = output<boolean>();
  readonly exportCsv = output<void>();
  readonly reconcileAction = output<void>();
}
