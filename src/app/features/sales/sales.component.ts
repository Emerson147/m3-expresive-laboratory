import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { SalesLedgerLocalAdapter } from '../../core/sales/sales-ledger-local.adapter';
import { SaleLedgerRecord } from '../../core/sales/sales-ledger.models';
import { SalesLedgerPort } from '../../core/sales/sales-ledger.port';
import { SalesLedgerService } from '../../core/sales/sales-ledger.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3CardComponent } from '../../shared/components/card/card.component';
import { M3LoadingIndicatorComponent } from '../../shared/components/progress';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { M3TabItem, M3TabsComponent } from '../../shared/components/tabs/tabs.component';
import { copyTextWithFeedback } from '../../shared/utils/clipboard.util';
import { SalesDetailSheetComponent } from './components/sales-detail-sheet.component';
import { SalesFiscalDeferPanelComponent } from './components/sales-fiscal-defer-panel.component';
import { SalesHeaderComponent, getSalesPeriodSummaryLabel } from './components/sales-header.component';
import { SalesKpiStripComponent } from './components/sales-kpi-strip.component';
import { SalesTableComponent } from './components/sales-table.component';
import { SalesVoidDialogComponent } from './components/sales-void-dialog.component';

type SalesMobilePane = 'ledger' | 'detail';
type VoidMorphOwner = 'detail' | 'modal' | null;

/**
 * Full-featured Sales History & Audit Ledger module demonstrating the complete M3 Expressive Bible:
 * - Clean Architecture DI (`SalesLedgerPort` -> `SalesLedgerLocalAdapter` bridged with live `PosService`)
 * - Accessible Enterprise Data Table (`aria-sort`, tri-state `m3-checkbox`, `.m3-select-field`, mobile cards)
 * - List-Detail composition with canonical `24dp` (`gap-6`) spacer & mobile `< xl` `m3-tabs`
 * - Optimistic UI + immutable snapshot Rollback + actionable `m3-snackbar` Undo/Retry
 * - Lazy `@defer` chunk boundary for Shift Fiscal Analytics + `StageOverlayService` Top-Layer Void Dialog
 */
@Component({
  selector: 'app-sales-page',
  standalone: true,
  providers: [
    { provide: SalesLedgerPort, useClass: SalesLedgerLocalAdapter },
    SalesLedgerService
  ],
  imports: [
    NgTemplateOutlet,
    M3ButtonComponent,
    M3CardComponent,
    M3LoadingIndicatorComponent,
    M3SnackbarComponent,
    M3TabsComponent,
    SalesHeaderComponent,
    SalesKpiStripComponent,
    SalesTableComponent,
    SalesDetailSheetComponent,
    SalesFiscalDeferPanelComponent,
    SalesVoidDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-surface text-main'
  },
  template: `
    <div
      [class]="adaptiveLayout.isCompact()
        ? 'flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 gap-5 m3-scrollbar'
        : 'flex-1 min-h-0 flex flex-col h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 gap-6 m3-scrollbar'">

      <!-- 1. Command Header -->
      <app-sales-header
        [totalCount]="salesService.periodScopedRecords().length"
        [pendingCount]="salesService.fiscalSummary().pendingCount"
        [selectedReconcilableCount]="salesService.selectedReconcilableIds().length"
        [periodFilter]="salesService.periodFilter()"
        (periodChange)="salesService.setPeriodFilter($event)"
        (exportCsv)="onExportCsv()"
        (reconcileAction)="salesService.bulkReconcilePending()" />

      <!-- 2. Analytical Fiscal KPI Strip -->
      <app-sales-kpi-strip
        [summary]="salesService.fiscalSummary()"
        [periodLabel]="periodSummaryLabel()" />

      <!-- 3. Adaptive Mobile/Tablet Split-Pane Switcher (< xl) -->
      <div class="xl:hidden shrink-0 rounded-m3-lg overflow-hidden bg-surface-low">
        <m3-tabs
          variant="secondary"
          idPrefix="sales-mobile-tab"
          ariaLabel="Vistas de historial y detalle de comprobante"
          [tabs]="mobileTabs()"
          [value]="mobilePane()"
          (tabChange)="onMobileTabChange($event)" />
      </div>

      <!-- 4. Canonical List-Detail Workspace (24dp spacer = gap-6) -->
      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_370px] gap-6 items-start">
        <div [class]="(mobilePane() === 'ledger' ? 'block' : 'hidden') + ' xl:block min-w-0'">
          <app-sales-table
            [records]="salesService.sortedRecords()"
            [selectedIds]="salesService.selectedIds()"
            [selectedRecordId]="salesService.selectedRecord()?.id ?? null"
            [isAllSelected]="salesService.isAllVisibleSelected()"
            [isSomeSelected]="salesService.isSomeVisibleSelected()"
            [selectedVisibleCount]="salesService.selectedVisibleCount()"
            [selectedReconcilableCount]="salesService.selectedReconcilableIds().length"
            [isLoading]="salesService.isLoading()"
            [searchQuery]="salesService.searchQuery()"
            [statusFilter]="salesService.statusFilter()"
            [paymentFilter]="salesService.paymentFilter()"
            [voucherFilter]="salesService.voucherFilter()"
            [sortField]="salesService.sortField()"
            [sortDirection]="salesService.sortDirection()"
            (searchChange)="salesService.searchQuery.set($event)"
            (statusFilterChange)="salesService.statusFilter.set($event)"
            (paymentFilterChange)="salesService.paymentFilter.set($event)"
            (voucherFilterChange)="salesService.voucherFilter.set($event)"
            (sortChange)="salesService.toggleSort($event)"
            (toggleRow)="salesService.toggleRowSelection($event)"
            (toggleAll)="salesService.toggleAllVisibleSelection()"
            (clearSelection)="salesService.clearSelection()"
            (bulkReconcile)="salesService.bulkReconcilePending()"
            (toggleReconcile)="salesService.toggleReconcile($event)"
            (inspectRow)="onInspectRow($event)"
            (resetFilters)="salesService.resetFilters()" />
        </div>

        <aside
          aria-label="Detalle del comprobante seleccionado"
          [class]="(mobilePane() === 'detail' ? 'block' : 'hidden') + ' xl:block xl:sticky xl:top-0 min-w-0'">
          <app-sales-detail-sheet
            [record]="salesService.selectedRecord()"
            [isVoidOriginActive]="voidMorphOwner() === 'detail'"
            [isVoidOriginInvisible]="isVoidDialogOpen()"
            (copyReceipt)="onCopyReceipt($event)"
            (toggleReconcile)="salesService.toggleReconcile($event)"
            (requestVoid)="openVoidDialog($event)" />
        </aside>
      </div>

      <!-- 5. @defer Lazy Shift Fiscal Breakdown -->
      <section aria-label="Cierre fiscal diferido">
        @defer (when fiscalReportExpanded(); prefetch on hover) {
          <app-sales-fiscal-defer-panel
            [summary]="salesService.fiscalSummary()"
            [periodLabel]="periodSummaryLabel()" />
        } @loading (minimum 200ms) {
          <m3-card variant="outlined" surface="low" padding="lg" customClass="flex items-center justify-center gap-3 min-h-36">
            <m3-loading-indicator [contained]="true" ariaLabel="Calculando arqueo de caja..." />
            <span class="text-xs font-medium text-muted">Calculando arqueo de caja y medios de pago...</span>
          </m3-card>
        } @placeholder {
          <m3-card variant="outlined" surface="low" padding="md" shape="xl" customClass="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <span class="px-2.5 py-0.5 rounded-m3-full bg-surface-high text-main text-[10px] font-bold uppercase tracking-wider">
                  Arqueo Bajo Demanda · {{ periodSummaryLabel() }}
                </span>
                <h2 class="text-title-sm-emphasized text-main">
                  Consolidado por Medio de Pago &amp; Cuadre SUNAT
                </h2>
              </div>

              <m3-button
                variant="tonal"
                size="sm"
                icon="analytics"
                (action)="fiscalReportExpanded.set(true)">
                Cargar Resumen Fiscal
              </m3-button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-hidden="true">
              <div class="h-20 rounded-m3-lg m3-skeleton m3-skeleton-shimmer"></div>
              <div class="h-20 rounded-m3-lg m3-skeleton m3-skeleton-shimmer"></div>
              <div class="h-20 rounded-m3-lg m3-skeleton m3-skeleton-shimmer"></div>
            </div>
          </m3-card>
        }
      </section>
    </div>

    <!-- Actionable M3 Snackbar (Supports Undo & Retry from Port Rollbacks) -->
    <m3-snackbar
      [open]="snackbarOpen()"
      [message]="snackbarMessage()"
      [actionLabel]="snackbarActionLabel()"
      [dismissible]="true"
      (action)="onSnackbarAction()"
      (dismissed)="onSnackbarDismissed()" />

    <!-- Top-Layer Portal Modal Host -->
    <ng-template #salesModalsTemplate>
      <app-sales-void-dialog
        [open]="isVoidDialogOpen()"
        [record]="voidTargetRecord()"
        [managedClose]="stageOverlay.hasViewTransitions()"
        [viewTransitionName]="voidMorphOwner() === 'modal' ? 'dialog-transform' : null"
        (closeRequested)="closeVoidDialog()"
        (confirmVoid)="onConfirmVoid($event)" />
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="salesModalsTemplate" />
    }
  `
})
export class SalesComponent implements OnInit {
  readonly salesService = inject(SalesLedgerService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);
  readonly stageOverlay = inject(StageOverlayService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly salesModalsTemplate = viewChild<TemplateRef<unknown>>('salesModalsTemplate');

  readonly mobilePane = signal<SalesMobilePane>('ledger');
  readonly fiscalReportExpanded = signal<boolean>(false);

  readonly isVoidDialogOpen = signal<boolean>(false);
  readonly voidTargetRecord = signal<SaleLedgerRecord | null>(null);
  readonly voidMorphOwner = signal<VoidMorphOwner>(null);

  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');
  readonly snackbarActionLabel = signal<string | null>(null);
  private pendingSnackbarCallback: (() => void) | null = null;
  private isDestroyed = false;

  readonly periodSummaryLabel = computed(() =>
    getSalesPeriodSummaryLabel(this.salesService.periodFilter())
  );

  readonly mobileTabs = computed<M3TabItem[]>(() => [
    {
      id: 'ledger',
      label: `Tabla (${this.salesService.sortedRecords().length})`,
      icon: 'table_rows'
    },
    {
      id: 'detail',
      label: this.salesService.selectedRecord()?.saleId ?? 'Detalle',
      icon: 'receipt_long'
    }
  ]);

  constructor() {
    effect(() => {
      const tpl = this.salesModalsTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    effect(() => {
      this.stageOverlay.setOverlayOpen(this.isVoidDialogOpen());
    });

    effect(() => {
      const toast = this.salesService.toastRequest();
      if (!toast) return;
      this.pendingSnackbarCallback = toast.onAction ?? null;
      this.snackbarActionLabel.set(toast.actionLabel ?? null);
      this.snackbarMessage.set(toast.message);
      this.snackbarOpen.set(true);
    });

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      const tpl = this.salesModalsTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });
  }

  ngOnInit(): void {
    void this.salesService.loadInitialSales();
  }

  onMobileTabChange(tabId: string): void {
    if (tabId === 'ledger' || tabId === 'detail') {
      this.mobilePane.set(tabId);
    }
  }

  onInspectRow(row: SaleLedgerRecord): void {
    this.salesService.selectRowForDetail(row.id);
    if (this.adaptiveLayout.windowWidth() < 1280) {
      this.mobilePane.set('detail');
    }
  }

  openVoidDialog(record: SaleLedgerRecord): void {
    this.voidTargetRecord.set(record);
    this.voidMorphOwner.set('detail');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isVoidDialogOpen.set(true);
        this.voidMorphOwner.set('modal');
      },
      () => {
        if (!this.isDestroyed) this.voidMorphOwner.set(null);
      }
    );
  }

  closeVoidDialog(): void {
    if (!this.isVoidDialogOpen()) return;
    this.voidMorphOwner.set('modal');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isVoidDialogOpen.set(false);
        this.voidMorphOwner.set('detail');
      },
      () => {
        if (!this.isDestroyed) {
          this.voidMorphOwner.set(null);
          this.voidTargetRecord.set(null);
        }
      },
      { isExiting: true }
    );
  }

  async onConfirmVoid(reason: string): Promise<void> {
    const target = this.voidTargetRecord();
    this.closeVoidDialog();
    if (!target) return;
    await this.salesService.voidSale(target, reason);
  }

  onCopyReceipt(record: SaleLedgerRecord): void {
    const summary = `${record.saleId} | ${record.customerName} | S/ ${record.total.toFixed(2)} | ${record.status}`;
    copyTextWithFeedback(this.platformId, summary, `Comprobante ${record.saleId} copiado`, (msg) => {
      this.salesService.toastRequest.set({ message: msg });
    });
  }

  onExportCsv(): void {
    const csv = this.salesService.buildCsvExport();
    if (
      isPlatformBrowser(this.platformId) &&
      typeof URL !== 'undefined' &&
      typeof URL.createObjectURL === 'function'
    ) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const href = URL.createObjectURL(blob);
      const anchor = this.document.createElement('a');
      anchor.href = href;
      anchor.download = 'historial-ventas-m3.csv';
      anchor.click();
      URL.revokeObjectURL(href);
    }
    this.salesService.toastRequest.set({
      message: `CSV exportado (${this.salesService.sortedRecords().length} filas)`
    });
  }

  onSnackbarAction(): void {
    const cb = this.pendingSnackbarCallback;
    this.pendingSnackbarCallback = null;
    this.snackbarActionLabel.set(null);
    cb?.();
  }

  onSnackbarDismissed(): void {
    this.snackbarOpen.set(false);
    this.pendingSnackbarCallback = null;
    this.snackbarActionLabel.set(null);
  }
}
