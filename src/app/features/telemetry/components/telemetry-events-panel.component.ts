import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { LiveTelemetryEvent } from '../../../core/telemetry/telemetry.models';

@Component({
  selector: 'app-telemetry-events-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col min-w-0'
  },
  template: `
    <section
      aria-label="Feed de alertas y eventos en vivo"
      class="bg-surface-low rounded-m3-xl p-5 sm:p-6 flex flex-col gap-4">

      <div class="flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div class="flex items-center gap-2 min-w-0">
          <span class="material-symbols-rounded text-primary text-lg shrink-0" aria-hidden="true">broadcast_on_home</span>
          <h3 class="text-title-sm-emphasized text-main truncate">Feed de Alertas y Eventos</h3>
        </div>

        <span
          [class]="'text-label-sm-emphasized font-mono px-2.5 py-0.5 rounded-m3-full shrink-0 ' +
            (isLiveTelemetryActive() ? 'bg-success-box text-on-success-box' : 'bg-surface-high text-muted')">
          {{ isLiveTelemetryActive() ? 'EN VIVO' : 'PAUSADO' }}
        </span>
      </div>

      <!-- Scope Switcher: All Fleet Events vs Selected Truck Focus -->
      <div
        role="group"
        aria-label="Alcance de eventos"
        class="grid grid-cols-2 gap-1.5 p-1 rounded-m3-full bg-surface shrink-0">
        <button
          type="button"
          [attr.aria-pressed]="eventScope() === 'all'"
          (click)="eventScope.set('all')"
          [class]="'min-h-[34px] px-3 rounded-m3-full text-label-sm-emphasized cursor-pointer m3-transition-fast focus-ring-m3 truncate ' +
            (eventScope() === 'all' ? 'bg-primary text-on-primary shadow-m3-level1' : 'text-muted hover:text-main hover:bg-surface-high')">
          Toda la flota ({{ events().length }})
        </button>
        <button
          type="button"
          [attr.aria-pressed]="eventScope() === 'selected'"
          (click)="eventScope.set('selected')"
          [class]="'min-h-[34px] px-3 rounded-m3-full text-label-sm-emphasized cursor-pointer m3-transition-fast focus-ring-m3 truncate ' +
            (eventScope() === 'selected' ? 'bg-primary text-on-primary shadow-m3-level1' : 'text-muted hover:text-main hover:bg-surface-high')">
          Solo {{ selectedVehicleId() }} ({{ selectedCount() }})
        </button>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Historial de eventos de telemetría"
        class="tel-scroll-pane max-h-[460px] overflow-y-auto m3-scrollbar flex flex-col gap-2.5 pr-1">
        @if (displayedEvents().length > 0) {
          @for (evt of displayedEvents(); track evt.id) {
            @let isFocused = evt.vehicleId === selectedVehicleId();
            <button
              type="button"
              (click)="selectVehicle.emit(evt.vehicleId)"
              [attr.aria-label]="'Enfocar ' + evt.vehicleId + ': ' + evt.message"
              [class]="'tel-event-card state-layer focus-ring-m3 w-full text-left p-3.5 rounded-m3-lg flex flex-col gap-2 cursor-pointer m3-transition-fast ' +
                (isFocused
                  ? 'bg-primary-box/55 text-main shadow-m3-level1'
                  : 'bg-surface hover:bg-surface-high text-main')">
              <div class="flex items-center justify-between gap-2 w-full">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span
                    [class]="'inline-flex items-center gap-1 px-2 py-0.5 rounded-m3-full text-label-sm-emphasized font-mono tabular-nums ' +
                      getEventBadgeClass(evt.type)">
                    <span class="material-symbols-rounded text-[13px]" aria-hidden="true">{{ getEventIcon(evt.type) }}</span>
                    <span>{{ evt.vehicleId }}</span>
                  </span>
                  @if (isFocused) {
                    <span class="text-label-sm text-primary font-medium truncate">• En foco</span>
                  }
                </div>

                <time class="text-label-sm font-mono tabular-nums text-muted shrink-0">
                  {{ evt.timestamp }}
                </time>
              </div>

              <p class="text-body-sm text-main leading-snug">
                {{ evt.message }}
              </p>
            </button>
          }
        } @else {
          <div class="py-8 px-4 text-center bg-surface rounded-m3-lg flex flex-col items-center gap-2">
            <span class="material-symbols-rounded text-3xl text-muted" aria-hidden="true">notifications_paused</span>
            <p class="text-title-sm-emphasized text-main">Sin alertas para {{ selectedVehicleId() }}</p>
            <p class="text-body-sm text-muted">
              Esta unidad opera sin incidencias recientes registradas.
            </p>
          </div>
        }
      </div>
    </section>
  `
})
export class TelemetryEventsPanelComponent {
  readonly events = input.required<LiveTelemetryEvent[]>();
  readonly selectedVehicleId = input.required<string>();
  readonly isLiveTelemetryActive = input.required<boolean>();

  readonly selectVehicle = output<string>();

  readonly eventScope = signal<'all' | 'selected'>('all');

  readonly selectedCount = computed(() => {
    const id = this.selectedVehicleId();
    return this.events().filter(e => e.vehicleId === id).length;
  });

  readonly displayedEvents = computed(() => {
    const list = this.events();
    if (this.eventScope() === 'selected') {
      const id = this.selectedVehicleId();
      return list.filter(e => e.vehicleId === id);
    }
    return list;
  });

  getEventBadgeClass(type: LiveTelemetryEvent['type']): string {
    switch (type) {
      case 'success':
        return 'bg-success-box text-on-success-box';
      case 'warning':
        return 'bg-warning-box text-on-warning-box';
      case 'error':
        return 'bg-error-box text-on-error-box';
      case 'info':
      default:
        return 'bg-primary-box text-on-primary-box';
    }
  }

  getEventIcon(type: LiveTelemetryEvent['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }
}
