import { NgTemplateOutlet } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { StageOverlayService } from '../../core/dialog/stage-overlay.service';
import { CreateFinanceExpenseDto } from '../../core/finance/finance.models';
import { FinanceLocalAdapter } from '../../core/finance/finance-local.adapter';
import { FinancePort } from '../../core/finance/finance.port';
import { FinanceService } from '../../core/finance/finance.service';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { getSalesPeriodSummaryLabel } from '../../core/sales/sales-ledger.models';
import { M3SnackbarComponent } from '../../shared/components/snackbar/snackbar.component';
import { FinanceExpenseDialogComponent } from './components/finance-expense-dialog.component';
import { FinanceExpenseListComponent } from './components/finance-expense-list.component';
import { FinanceHeaderComponent } from './components/finance-header.component';
import { FinanceKpiStripComponent } from './components/finance-kpi-strip.component';
import { FinancePnlWaterfallComponent } from './components/finance-pnl-waterfall.component';
import { FinanceSimulatorPanelComponent } from './components/finance-simulator-panel.component';

type ExpenseMorphOwner = 'header' | 'modal' | null;

/**
 * Finance & Profitability (P&L) smart container implementing the Analytical / Mission Control M3 archetype:
 * - Cross-domain reactive aggregation from live POS + Sales revenue vs SKU COGS & prorated OpEx
 * - Interactive Break-Even coverage + `<m3-slider>` What-If Margin Simulator
 * - Top-Layer `<m3-dialog>` expense logging via `StageOverlayService` + `m3-snackbar` Undo/Rollback
 */
@Component({
  selector: 'app-finance-page',
  standalone: true,
  providers: [
    { provide: FinancePort, useClass: FinanceLocalAdapter },
    FinanceService
  ],
  imports: [
    NgTemplateOutlet,
    M3SnackbarComponent,
    FinanceHeaderComponent,
    FinanceKpiStripComponent,
    FinancePnlWaterfallComponent,
    FinanceSimulatorPanelComponent,
    FinanceExpenseListComponent,
    FinanceExpenseDialogComponent
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
      <app-finance-header
        [periodFilter]="financeService.periodFilter()"
        [activeSalesCount]="financeService.pnlSummary().activeSalesCount"
        [igvLiability]="financeService.pnlSummary().igvLiability"
        [isDialogOriginActive]="expenseMorphOwner() === 'header'"
        [isDialogOriginInvisible]="isExpenseDialogOpen()"
        (periodChange)="financeService.setPeriodFilter($event)"
        (openAddExpense)="openExpenseDialog()" />

      <!-- 2. Analytical P&L KPI Ribbon -->
      <app-finance-kpi-strip
        [summary]="financeService.pnlSummary()"
        [periodLabel]="periodSummaryLabel()" />

      <!-- 3. Asymmetric Mission Control Bento (P&L Cascade + Expenses left | Break-Even + What-If Simulator right) -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div class="xl:col-span-8 min-w-0 space-y-6">
          <app-finance-pnl-waterfall
            [summary]="financeService.pnlSummary()"
            [periodLabel]="periodSummaryLabel()" />

          <app-finance-expense-list
            [expenses]="financeService.visibleExpenses()"
            [periodFilter]="financeService.periodFilter()"
            [periodLabel]="periodSummaryLabel()"
            [expenseFilter]="financeService.expenseFilter()"
            (filterChange)="financeService.setExpenseFilter($event)"
            (deleteExpense)="financeService.removeExpense($event)" />
        </div>

        <aside
          aria-label="Punto de equilibrio y simulador de rentabilidad"
          class="xl:col-span-4 xl:sticky xl:top-0 min-w-0">
          <app-finance-simulator-panel
            [summary]="financeService.pnlSummary()"
            [simulation]="financeService.simulation()"
            [simulated]="financeService.simulatedSummary()"
            [periodLabel]="periodSummaryLabel()"
            (simulationPatch)="financeService.updateSimulation($event)"
            (reset)="financeService.resetSimulation()" />
        </aside>
      </div>
    </div>

    <m3-snackbar
      [open]="snackbarOpen()"
      [message]="snackbarMessage()"
      [actionLabel]="snackbarActionLabel()"
      [dismissible]="true"
      (action)="onSnackbarAction()"
      (dismissed)="onSnackbarDismissed()" />

    <ng-template #financeModalsTemplate>
      <app-finance-expense-dialog
        [open]="isExpenseDialogOpen()"
        [managedClose]="stageOverlay.hasViewTransitions()"
        [viewTransitionName]="expenseMorphOwner() === 'modal' ? 'dialog-transform' : null"
        (closeRequested)="closeExpenseDialog()"
        (confirmExpense)="onConfirmExpense($event)" />
    </ng-template>

    @if (!stageOverlay.hasExternalHost()) {
      <ng-container [ngTemplateOutlet]="financeModalsTemplate" />
    }
  `
})
export class FinanceComponent implements OnInit {
  readonly financeService = inject(FinanceService);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);
  readonly stageOverlay = inject(StageOverlayService);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly financeModalsTemplate = viewChild<TemplateRef<unknown>>('financeModalsTemplate');

  readonly periodSummaryLabel = computed(() =>
    getSalesPeriodSummaryLabel(this.financeService.periodFilter())
  );

  readonly isExpenseDialogOpen = signal<boolean>(false);
  readonly expenseMorphOwner = signal<ExpenseMorphOwner>(null);

  readonly snackbarOpen = signal<boolean>(false);
  readonly snackbarMessage = signal<string>('');
  readonly snackbarActionLabel = signal<string | null>(null);
  private pendingSnackbarCallback: (() => void) | null = null;
  private isDestroyed = false;

  constructor() {
    effect(() => {
      const tpl = this.financeModalsTemplate();
      if (tpl && this.stageOverlay.hasExternalHost()) {
        this.stageOverlay.mountOverlayTemplate(tpl, this.injector);
      }
    });

    effect(() => {
      this.stageOverlay.setOverlayOpen(this.isExpenseDialogOpen());
    });

    effect(() => {
      const toast = this.financeService.toastRequest();
      if (!toast) return;
      this.pendingSnackbarCallback = toast.onAction ?? null;
      this.snackbarActionLabel.set(toast.actionLabel ?? null);
      this.snackbarMessage.set(toast.message);
      this.snackbarOpen.set(true);
    });

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      const tpl = this.financeModalsTemplate();
      if (tpl) {
        this.stageOverlay.unmountOverlayTemplate(tpl);
      }
      this.stageOverlay.setOverlayOpen(false);
    });
  }

  ngOnInit(): void {
    void this.financeService.loadFinancialData();
  }

  openExpenseDialog(): void {
    this.expenseMorphOwner.set('header');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isExpenseDialogOpen.set(true);
        this.expenseMorphOwner.set('modal');
      },
      () => {
        if (!this.isDestroyed) this.expenseMorphOwner.set(null);
      }
    );
  }

  closeExpenseDialog(): void {
    if (!this.isExpenseDialogOpen()) return;
    this.expenseMorphOwner.set('modal');
    this.appRef.tick();

    this.stageOverlay.runViewTransition(
      () => {
        this.isExpenseDialogOpen.set(false);
        this.expenseMorphOwner.set('header');
      },
      () => {
        if (!this.isDestroyed) this.expenseMorphOwner.set(null);
      },
      { isExiting: true }
    );
  }

  async onConfirmExpense(dto: CreateFinanceExpenseDto): Promise<void> {
    this.closeExpenseDialog();
    await this.financeService.addExpense(dto);
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
