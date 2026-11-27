import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';

type AuditSeverity = 'all' | 'ok' | 'warn' | 'error';

export interface VirtualAuditEvent {
  readonly id: string;
  readonly index: number;
  readonly service: string;
  readonly region: string;
  readonly latencyMs: number;
  readonly severity: Exclude<AuditSeverity, 'all'>;
  readonly severityLabel: string;
  readonly badgeClass: string;
}

const SERVICES = [
  'auth-gateway',
  'orders-port',
  'billing-adapter',
  'telemetry-stream',
  'stock-ledger',
  'cache-edge'
] as const;

const REGIONS = ['us-east-1', 'sa-east-1', 'eu-west-1'] as const;

function buildVirtualDataset(count: number): readonly VirtualAuditEvent[] {
  const out: VirtualAuditEvent[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const mod = i % 10;
    const severity: Exclude<AuditSeverity, 'all'> =
      mod === 0 ? 'error' : mod <= 2 ? 'warn' : 'ok';
    const badgeClass =
      severity === 'error'
        ? 'bg-error-box text-on-error-box'
        : severity === 'warn'
          ? 'bg-warning-box text-on-warning-box'
          : 'bg-success-box text-on-success-box';
    const severityLabel =
      severity === 'error' ? '503 ERR' : severity === 'warn' ? 'LATENCIA' : '200 OK';

    out[i] = {
      id: `evt-${i + 1}`,
      index: i + 1,
      service: SERVICES[i % SERVICES.length],
      region: REGIONS[i % REGIONS.length],
      latencyMs: severity === 'error' ? 1420 : severity === 'warn' ? 480 + (i % 120) : 34 + (i % 45),
      severity,
      severityLabel,
      badgeClass
    };
  }
  return out;
}

const AUDIT_DATASET = buildVirtualDataset(2500);

/**
 * Lazy-loaded payload component intentionally mounted ONLY inside `@defer` so Angular splits
 * `@angular/cdk/scrolling` and the 2,500-row virtualized table out of the initial bundle.
 */
@Component({
  selector: 'app-playbook-defer-payload',
  standalone: true,
  imports: [ScrollingModule, M3CardComponent, M3ChipComponent],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-[10px] font-bold uppercase tracking-wider">
            Chunk &#64;defer Cargado en Memoria
          </span>
          <h5 class="text-sm font-bold text-main mt-1.5">
            Viewport Virtualizado: {{ filteredEvents().length.toLocaleString() }} registros en memoria
          </h5>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span class="px-2.5 py-1 rounded-m3-md bg-surface-box border border-outline-sub text-main">
            Registros totales: <strong>{{ filteredEvents().length }}</strong>
          </span>
          <span class="px-2.5 py-1 rounded-m3-md bg-primary-box text-on-primary-box font-bold">
            Ventana DOM: ~8–12 nodos activos
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar eventos virtualizados">
        <m3-chip type="filter" [selected]="severity() === 'all'" (action)="severity.set('all')">
          Todos (2,500)
        </m3-chip>
        <m3-chip type="filter" [selected]="severity() === 'ok'" (action)="severity.set('ok')">
          200 OK
        </m3-chip>
        <m3-chip type="filter" [selected]="severity() === 'warn'" (action)="severity.set('warn')">
          Latencia Alta
        </m3-chip>
        <m3-chip type="filter" [selected]="severity() === 'error'" (action)="severity.set('error')">
          Errores 503
        </m3-chip>
      </div>

      <cdk-virtual-scroll-viewport
        itemSize="56"
        minBufferPx="224"
        maxBufferPx="448"
        class="h-72 w-full rounded-m3-lg border border-outline-sub bg-surface-box m3-scrollbar"
        aria-label="Registro virtualizado de 2500 eventos">
        <div
          *cdkVirtualFor="let evt of filteredEvents(); trackBy: trackByEventId"
          class="vrow-item h-14 px-3.5 border-b border-outline-sub flex items-center justify-between gap-3">
          <div class="min-w-0 flex items-center gap-3">
            <span class="text-[10px] font-mono text-muted w-12 shrink-0">#{{ evt.index }}</span>
            <div class="min-w-0">
              <div class="text-xs font-bold text-main truncate">{{ evt.service }}</div>
              <div class="text-[10px] font-mono text-muted">{{ evt.region }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2.5 shrink-0">
            <span class="text-xs font-mono text-main tabular-nums">{{ evt.latencyMs }}ms</span>
            <span [class]="'px-2 py-0.5 rounded-m3-full text-[10px] font-bold ' + evt.badgeClass">
              {{ evt.severityLabel }}
            </span>
          </div>
        </div>
      </cdk-virtual-scroll-viewport>
    </m3-card>
  `
})
export class PlaybookDeferPayloadComponent {
  readonly severity = signal<AuditSeverity>('all');

  readonly filteredEvents = computed(() => {
    const sev = this.severity();
    if (sev === 'all') {
      return AUDIT_DATASET;
    }
    return AUDIT_DATASET.filter((item) => item.severity === sev);
  });

  trackByEventId(_index: number, item: VirtualAuditEvent): string {
    return item.id;
  }
}
