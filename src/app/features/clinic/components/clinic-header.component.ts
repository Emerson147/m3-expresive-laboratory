import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { M3ButtonComponent } from '../../../shared/components/button/button.component';
import { M3TextFieldComponent } from '../../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-clinic-header',
  imports: [M3ButtonComponent, M3TextFieldComponent],
  host: { class: 'block shrink-0' },
  template: `
    <header
      class="rounded-m3-xl bg-surface-low px-4 sm:px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
    >
      <div class="flex items-start sm:items-center gap-3.5 min-w-0">
        <div
          class="w-11 h-11 rounded-m3-lg bg-primary-box text-on-primary-box grid place-items-center shrink-0"
          aria-hidden="true"
        >
          <span class="material-symbols-rounded text-[24px]">local_hospital</span>
        </div>

        <div class="min-w-0 space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-title-lg-emphasized text-main tracking-tight">
              Estación de Emergencias &amp; Triaje
            </h1>
            <span
              class="px-2.5 py-0.5 rounded-m3-full bg-surface text-muted text-label-sm-emphasized font-mono"
            >
              MTS Manchester
            </span>
            <span
              class="hidden sm:inline-flex px-2.5 py-0.5 rounded-m3-full bg-sec-box text-on-sec-box text-label-sm-emphasized font-mono"
            >
              NEWS2 / 20
            </span>
          </div>

          <p class="text-body-sm text-muted">
            Soporte a la Decisión Clínica · Monitoreo Hemodinámico y Gestión de Boxes
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 w-full xl:w-auto xl:justify-end">
        <!-- Guard Clock & Live Simulation Switch -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-m3-full bg-surface text-main text-label-md font-mono tabular-nums"
          aria-label="Reloj de guardia clínica"
        >
          <span class="material-symbols-rounded text-[17px] text-primary" aria-hidden="true">
            schedule
          </span>
          <span>{{ currentClock() }}</span>
        </div>

        <button
          type="button"
          (click)="toggleLive.emit()"
          [attr.aria-pressed]="isLiveMonitoring()"
          [class]="livePillClass()"
        >
          <span
            [class]="
              'w-2 h-2 rounded-full shrink-0 ' +
              (isLiveMonitoring() ? 'bg-success' : 'bg-muted')
            "
            aria-hidden="true"
          ></span>
          <span>{{ isLiveMonitoring() ? 'En Vivo' : 'Pausado' }}</span>
        </button>

        <m3-button
          id="clinic-header-history-btn"
          variant="tonal"
          size="sm"
          icon="history"
          [morph]="true"
          [invisible]="isHistoryOriginInvisible()"
          [viewTransitionName]="isHistoryOriginActive() ? 'dialog-transform' : null"
          (action)="openHistory.emit('clinic-header-history-btn')"
        >
          Bitácora ({{ historyCount() }})
        </m3-button>

        <search class="w-full sm:w-64">
          <m3-text-field
            variant="outlined"
            icon="search"
            label="Buscar paciente"
            placeholder="Nombre, TR, alergia o box..."
            autocomplete="off"
            [clearable]="true"
            [value]="searchQuery()"
            (valueChange)="searchChange.emit($event)"
            (clear)="searchChange.emit('')"
          />
        </search>

        <m3-button
          id="clinic-header-admit-btn"
          variant="filled"
          size="md"
          icon="person_add"
          [morph]="true"
          [invisible]="isAdmitOriginInvisible()"
          [viewTransitionName]="isAdmitOriginActive() ? 'dialog-transform' : null"
          (action)="openAdmission.emit('clinic-header-admit-btn')"
        >
          Nueva Admisión
        </m3-button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicHeaderComponent {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly searchQuery = input<string>('');
  readonly isLiveMonitoring = input<boolean>(false);
  readonly historyCount = input<number>(0);
  readonly activeDialogTrigger = input<string | null>(null);
  readonly isDialogOpen = input<boolean>(false);
  readonly dialogMorphOwner = input<'trigger' | 'modal' | null>(null);

  readonly searchChange = output<string>();
  readonly toggleLive = output<void>();
  readonly openHistory = output<string>();
  readonly openAdmission = output<string>();

  protected readonly currentClock = signal<string>(this.formatClock(new Date()));

  protected readonly isAdmitOriginActive = computed(
    () =>
      this.dialogMorphOwner() === 'trigger' &&
      this.activeDialogTrigger() === 'clinic-header-admit-btn'
  );

  protected readonly isAdmitOriginInvisible = computed(
    () =>
      this.isDialogOpen() &&
      this.activeDialogTrigger() === 'clinic-header-admit-btn'
  );

  protected readonly isHistoryOriginActive = computed(
    () =>
      this.dialogMorphOwner() === 'trigger' &&
      this.activeDialogTrigger() === 'clinic-header-history-btn'
  );

  protected readonly isHistoryOriginInvisible = computed(
    () =>
      this.isDialogOpen() &&
      this.activeDialogTrigger() === 'clinic-header-history-btn'
  );

  protected readonly livePillClass = computed(() =>
    'state-layer focus-ring-m3 inline-flex items-center gap-2 px-3 min-h-[36px] rounded-m3-full text-label-md-emphasized cursor-pointer transition-colors ' +
    (this.isLiveMonitoring()
      ? 'bg-success-box text-on-success-box'
      : 'bg-surface text-muted hover:bg-surface-high hover:text-main')
  );

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      let timerId: ReturnType<typeof setInterval> | null = null;
      this.zone.runOutsideAngular(() => {
        timerId = setInterval(() => {
          this.zone.run(() => this.currentClock.set(this.formatClock(new Date())));
        }, 1000);
      });
      this.destroyRef.onDestroy(() => {
        if (timerId !== null) clearInterval(timerId);
      });
    });
  }

  private formatClock(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }
}
