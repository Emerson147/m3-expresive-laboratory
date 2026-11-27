import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { M3ButtonComponent } from '../../../../shared/components/button/button.component';
import { M3CardComponent } from '../../../../shared/components/card/card.component';
import { M3ChipComponent } from '../../../../shared/components/chip/chip.component';
import { M3DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { M3LinearProgressComponent, M3LoadingIndicatorComponent } from '../../../../shared/components/progress';
import { M3RadioGroupComponent, M3RadioOption } from '../../../../shared/components/radio/radio.component';
import { M3SliderComponent } from '../../../../shared/components/slider/slider.component';
import { M3TabItem, M3TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { M3TextFieldComponent } from '../../../../shared/components/text-field/text-field.component';
import { PlaybookDeferPayloadComponent } from './playbook-defer-payload.component';
import {
  ConfigurableDispatchAdapter,
  DISPATCH_ADAPTER_PROFILES,
  DispatchAdapterProfile,
  DispatchGatewayPort,
  DispatchOrder,
  DispatchStatus,
  INITIAL_DISPATCH_ORDERS,
  PipelineTraceEntry
} from './playbook-dispatch-port';

type AdvancedScenarioId = 'optimistic-ports' | 'perf-defer' | 'state-resilience';
type OperationalNetState = 'ready' | 'fast-loading' | 'slow-progress' | 'error-500' | 'empty';

export interface PlaybookToastRequest {
  readonly message: string;
  readonly actionLabel?: string | null;
  readonly onAction?: () => void;
}

interface RouteConfigDraft {
  readonly routeName: string;
  readonly fallbackTarget: string;
  readonly strategy: string;
  readonly timeoutSec: number;
}

const INITIAL_ROUTE_DRAFT: RouteConfigDraft = {
  routeName: '/api/v2/dispatch',
  fallbackTarget: '/index.html',
  strategy: 'edge-cache',
  timeoutSec: 15
};

const STRATEGY_RADIO_OPTIONS: M3RadioOption[] = [
  { value: 'edge-cache', label: 'Edge Cache First', description: 'Respuesta rápida con revalidación en segundo plano' },
  { value: 'network-strict', label: 'Network Strict', description: 'Consistencia fuerte sin stale cache' },
  { value: 'circuit-breaker', label: 'Circuit Breaker', description: 'Aísla fallos 503 hacia adapter de respaldo' }
];

const STATUS_BADGE_MAP: Record<DispatchStatus, { label: string; cssClass: string }> = {
  pending: { label: 'Pendiente', cssClass: 'bg-surface-high text-main' },
  approved: { label: 'Aprobado', cssClass: 'bg-success-box text-on-success-box' },
  paused: { label: 'Pausado', cssClass: 'bg-warning-box text-on-warning-box' }
};

/**
 * Advanced architectural scenarios intentionally complementary to the repo's feature demos:
 * 1) Clean Ports & Adapters + Optimistic UI + Rollback / Undo via Snackbar
 * 2) Real Angular `@defer` chunk splitting + `@angular/cdk/scrolling` virtualization (2,500 rows)
 * 3) Resilient Multi-State Orchestration (`<5s`, `>5s`, `500`, `empty`) + `:user-invalid` + Dirty Guard Modal
 */
@Component({
  selector: 'app-playbook-examples-section',
  standalone: true,
  providers: [{ provide: DispatchGatewayPort, useClass: ConfigurableDispatchAdapter }],
  imports: [
    M3ButtonComponent,
    M3CardComponent,
    M3ChipComponent,
    M3DialogComponent,
    M3LinearProgressComponent,
    M3LoadingIndicatorComponent,
    M3RadioGroupComponent,
    M3SliderComponent,
    M3TabsComponent,
    M3TextFieldComponent,
    PlaybookDeferPayloadComponent
  ],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <m3-card id="playbook-examples" variant="outlined" padding="md" customClass="space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-sub pb-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span class="material-symbols-rounded text-base" aria-hidden="true">architecture</span>
            Escenarios Avanzados de Arquitectura &amp; Velocidad
          </div>
          <h3 class="text-title-md-emphasized text-main">
            Patrones de Producción que No Están en los Módulos Demo: Ports, &#64;defer, Virtualización y Resiliencia
          </h3>
          <p class="text-xs text-muted max-w-4xl leading-relaxed">
            En lugar de repetir pantallas como POS o Telemetría, aquí practicas las 3 técnicas de ingeniería que vuelven rápido, mantenible y seguro a cualquier sistema complejo sobre M3 Expressive.
          </p>
        </div>

        <span class="px-3 py-1 rounded-m3-full bg-sec-box text-on-sec-box text-xs font-bold shrink-0 self-start lg:self-center">
          DI Port + &#64;defer + Top Layer
        </span>
      </div>

      <m3-tabs
        variant="secondary"
        idPrefix="playbook-ex"
        ariaLabel="Escenarios avanzados de arquitectura Angular y M3"
        [tabs]="scenarioTabs"
        [(value)]="activeScenario" />

      @switch (activeScenario()) {
        <!-- ESCENARIO 1: PORTS & ADAPTERS + OPTIMISTIC UI + ROLLBACK -->
        @case ('optimistic-ports') {
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div class="xl:col-span-7 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-primary">
                    1. Inyección de Dependencias (Port Abstracto) + Mutación en t=0ms
                  </span>
                  <h4 class="text-sm font-bold text-main">
                    Cambia el Adapter en vivo sin tocar el componente UI
                  </h4>
                </div>
                <m3-button variant="text" size="xs" icon="restart_alt" (action)="resetDispatchDemo()">
                  Restablecer lotes
                </m3-button>
              </div>

              <!-- Selector de Adapter concreto detrás del mismo DispatchGatewayPort -->
              <div class="p-3 bg-surface-low rounded-m3-lg border border-outline-sub space-y-2">
                <div class="flex flex-wrap gap-2" role="group" aria-label="Seleccionar Adapter detrás de DispatchGatewayPort">
                  @for (prof of adapterProfiles; track prof.id) {
                    <m3-chip
                      type="filter"
                      [selected]="activeProfile() === prof.id"
                      (action)="activeProfile.set(prof.id)">
                      {{ prof.label }}
                    </m3-chip>
                  }
                </div>
                <p class="text-[11px] text-muted">{{ selectedProfileMeta().description }}</p>
              </div>

              @if (hasPendingSync()) {
                <m3-linear-progress
                  [value]="null"
                  [wavy]="true"
                  color="primary"
                  ariaLabel="Sincronizando cambio optimista contra el Port" />
              }

              <!-- Lista de órdenes interactivas sin anidar interactivos en card -->
              <div class="space-y-2.5">
                @for (order of orders(); track order.id) {
                  <m3-card variant="outlined" surface="low" padding="sm" shape="lg" customClass="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="space-y-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs font-mono font-bold text-primary">{{ order.code }}</span>
                        <span [class]="'px-2 py-0.5 rounded-m3-full text-[10px] font-bold ' + statusMeta(order.status).cssClass">
                          {{ statusMeta(order.status).label }}
                        </span>
                        @if (order.syncing) {
                          <span class="px-2 py-0.5 rounded-m3-full bg-primary-box text-on-primary-box text-[10px] font-mono font-bold">
                            Optimistic • Esperando Port...
                          </span>
                        }
                      </div>
                      <div class="text-xs font-bold text-main">{{ order.client }}</div>
                      <div class="text-[11px] text-muted">
                        {{ order.destination }} • {{ order.batchWeightKg }} kg
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 shrink-0">
                      <m3-button
                        variant="tonal"
                        size="xs"
                        icon="check_circle"
                        [disabled]="!!order.syncing || order.status === 'approved'"
                        (action)="triggerStatusTransition(order, 'approved')">
                        Aprobar
                      </m3-button>
                      <m3-button
                        variant="outlined"
                        size="xs"
                        icon="pause_circle"
                        [disabled]="!!order.syncing || order.status === 'paused'"
                        (action)="triggerStatusTransition(order, 'paused')">
                        Pausar
                      </m3-button>
                    </div>
                  </m3-card>
                }
              </div>
            </div>

            <!-- Panel derecho: Bitácora en vivo del flujo UI -> Port -> Adapter -->
            <m3-card variant="filled" surface="high" padding="md" shape="xl" customClass="xl:col-span-5 space-y-4">
              <div class="space-y-1">
                <div class="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Trazabilidad Clean Architecture en Vivo
                </div>
                <h4 class="text-sm font-bold text-main">Bitácora: UI Optimista → Port → Commit / Rollback</h4>
                <p class="text-[11px] text-muted leading-relaxed">
                  Prueba pasar a <strong>Adapter Inestable (Error 503)</strong> y aprobar un lote: verás cambiar el estado al instante y revertirse automáticamente al snapshot previo cuando el Adapter rechaza la operación.
                </p>
              </div>

              <div class="space-y-2 max-h-64 overflow-y-auto pr-1 m3-scrollbar">
                @if (traceLog().length === 0) {
                  <div class="p-4 rounded-m3-md bg-surface-box border border-outline-sub text-xs text-muted text-center">
                    Pulsa "Aprobar" o "Pausar" en cualquier lote para observar el pipeline desacoplado.
                  </div>
                } @else {
                  @for (entry of traceLog(); track entry.id) {
                    <div class="p-2.5 rounded-m3-md bg-surface-box border border-outline-sub space-y-1">
                      <div class="flex items-center justify-between gap-2 text-[10px] font-mono">
                        <span [class]="traceBadgeClass(entry.tone)">{{ entry.phase }}</span>
                        <span class="text-muted">{{ entry.timestamp }}</span>
                      </div>
                      <p class="text-[11px] text-main leading-snug">{{ entry.detail }}</p>
                    </div>
                  }
                }
              </div>

              <div class="p-3 rounded-m3-md bg-surface-box border border-outline-sub text-[11px] text-muted leading-snug">
                <strong class="text-main">Contrato usado:</strong> <code class="font-mono text-primary">inject(DispatchGatewayPort)</code>. El componente jamás sabe si habla con memoria local, Fetch REST o GraphQL.
              </div>
            </m3-card>
          </div>
        }

        <!-- ESCENARIO 2: @DEFER + CDK VIRTUAL SCROLL (2,500 FILAS) -->
        @case ('perf-defer') {
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div class="xl:col-span-8 space-y-4">
              <div class="space-y-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-primary">
                  2. Code Splitting Real (&#64;defer) + Virtualización DOM (2,500 Eventos)
                </span>
                <h4 class="text-sm font-bold text-main">
                  El módulo pesado y &#64;angular/cdk/scrolling solo cargan cuando el usuario lo pide
                </h4>
              </div>

              @defer (when deferActivated(); prefetch on hover) {
                <app-playbook-defer-payload />
              } @loading (minimum 200ms) {
                <m3-card variant="outlined" surface="low" padding="lg" customClass="h-80 flex flex-col items-center justify-center gap-3">
                  <m3-loading-indicator [contained]="true" ariaLabel="Cargando módulo virtualizado..." />
                  <p class="text-xs font-medium text-muted">
                    Descargando chunk &#64;defer e inicializando CdkVirtualScrollViewport...
                  </p>
                </m3-card>
              } @placeholder {
                <m3-card variant="outlined" surface="low" padding="md" customClass="space-y-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="space-y-1">
                      <span class="px-2.5 py-0.5 rounded-m3-full bg-surface-high text-main text-[10px] font-bold uppercase tracking-wider">
                        &#64;placeholder Activo • 0 Nodos de Tabla en Bundle Inicial
                      </span>
                      <h5 class="text-sm font-bold text-main">
                        Panel pesado en espera (2,500 registros + CDK Scrolling)
                      </h5>
                      <p class="text-xs text-muted">
                        Pasa el cursor para prefetch silencioso o haz clic para montar el chunk diferido con CLS 0.00.
                      </p>
                    </div>

                    <m3-button variant="filled" icon="download" (action)="activateDefer()">
                      Cargar Panel Pesado (&#64;defer)
                    </m3-button>
                  </div>

                  <div class="space-y-2.5" aria-hidden="true">
                    <div class="h-12 w-full rounded-m3-md m3-skeleton m3-skeleton-shimmer"></div>
                    <div class="h-12 w-full rounded-m3-md m3-skeleton m3-skeleton-shimmer"></div>
                    <div class="h-12 w-full rounded-m3-md m3-skeleton m3-skeleton-shimmer"></div>
                  </div>
                </m3-card>
              } @error {
                <m3-card variant="outlined" tone="error" padding="md" customClass="space-y-2">
                  <p class="text-xs font-bold text-error">No se pudo descargar el chunk diferido.</p>
                  <m3-button variant="outlined" icon="refresh" (action)="activateDefer()">Reintentar carga</m3-button>
                </m3-card>
              }
            </div>

            <m3-card variant="filled" surface="high" padding="md" shape="xl" customClass="xl:col-span-4 space-y-3.5">
              <div class="text-[11px] font-bold uppercase tracking-wider text-primary">
                Por Qué Esta Técnica Escala
              </div>
              <h4 class="text-sm font-bold text-main">Impacto en LCP, INP y Bundle Budget</h4>

              <div class="space-y-2.5 text-xs leading-relaxed">
                <div class="p-3 rounded-m3-md bg-surface-box border border-outline-sub space-y-1">
                  <div class="font-bold text-main">1. Presupuesto &lt; 1MB en angular.json</div>
                  <p class="text-[11px] text-muted">
                    Al aislar <code class="font-mono text-primary">PlaybookDeferPayloadComponent</code> dentro de <code class="font-mono">&#64;defer</code>, su código y CDK Scrolling salen del bundle inicial (<code class="font-mono">main.js</code>).
                  </p>
                </div>

                <div class="p-3 rounded-m3-md bg-surface-box border border-outline-sub space-y-1">
                  <div class="font-bold text-main">2. Memoria DOM Constante (O(1))</div>
                  <p class="text-[11px] text-muted">
                    Renderizar 2,500 filas con <code class="font-mono">&#64;for</code> crearía ~15,000 nodos HTML. Con <code class="font-mono">itemSize="56"</code> solo existen ~8–12 filas recicladas mientras navegas.
                  </p>
                </div>

                <div class="p-3 rounded-m3-md bg-surface-box border border-outline-sub space-y-1">
                  <div class="font-bold text-main">3. Cero Salto de Layout (CLS = 0.00)</div>
                  <p class="text-[11px] text-muted">
                    El bloque <code class="font-mono">&#64;placeholder</code> usa <code class="font-mono">.m3-skeleton-shimmer</code> con altura reservada antes de hidratar la tabla real.
                  </p>
                </div>
              </div>
            </m3-card>
          </div>
        }

        <!-- ESCENARIO 3: RESILIENCIA MULTI-ESTADO + VALIDACIÓN DIFERIDA + DIRTY GUARD MODAL -->
        @case ('state-resilience') {
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div class="xl:col-span-7 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-primary">
                    3. Orquestación de Estados Reales + Dirty Form Guard
                  </span>
                  <h4 class="text-sm font-bold text-main">
                    Simula latencias y errores 500 sin perder datos del usuario
                  </h4>
                </div>

                <span
                  [class]="
                    isDraftDirty()
                      ? 'px-2.5 py-0.5 rounded-m3-full bg-warning-box text-on-warning-box text-[10px] font-bold'
                      : 'px-2.5 py-0.5 rounded-m3-full bg-success-box text-on-success-box text-[10px] font-bold'
                  ">
                  {{ isDraftDirty() ? 'Cambios sin guardar (Dirty)' : 'Sincronizado (Clean)' }}
                </span>
              </div>

              <!-- Selector de estado de red -->
              <div class="flex flex-wrap gap-2" role="group" aria-label="Simular estado operativo de red">
                <m3-chip type="filter" [selected]="netState() === 'ready'" (action)="netState.set('ready')">
                  Ready
                </m3-chip>
                <m3-chip type="filter" [selected]="netState() === 'fast-loading'" (action)="netState.set('fast-loading')">
                  Carga &lt;5s (Loading)
                </m3-chip>
                <m3-chip type="filter" [selected]="netState() === 'slow-progress'" (action)="netState.set('slow-progress')">
                  Proceso &gt;5s (Wavy %)
                </m3-chip>
                <m3-chip type="filter" [selected]="netState() === 'error-500'" (action)="netState.set('error-500')">
                  Error 500 (Conservar Form)
                </m3-chip>
                <m3-chip type="filter" [selected]="netState() === 'empty'" (action)="netState.set('empty')">
                  Empty State
                </m3-chip>
              </div>

              <!-- Feedback de estado sin destruir el formulario -->
              @if (netState() === 'fast-loading') {
                <div class="p-3 rounded-m3-lg bg-surface-low border border-outline-sub flex items-center gap-3">
                  <m3-loading-indicator [contained]="true" [diameter]="36" ariaLabel="Validando regla en servidor..." />
                  <div class="text-xs text-main">
                    <strong>Operación corta (&lt; 5s):</strong> usa <code class="font-mono text-primary">&lt;m3-loading-indicator&gt;</code> sin bloquear el borrador.
                  </div>
                </div>
              } @else if (netState() === 'slow-progress') {
                <div class="p-3 rounded-m3-lg bg-surface-low border border-outline-sub space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-main">Desplegando reglas en Edge Nodes... (68%)</span>
                    <span class="font-mono text-primary">Progreso &gt; 5s</span>
                  </div>
                  <m3-linear-progress [value]="68" [wavy]="true" color="primary" ariaLabel="Progreso de despliegue en Edge" />
                </div>
              } @else if (netState() === 'error-500') {
                <div class="p-3 rounded-m3-lg bg-error-box/40 border border-error/40 flex flex-wrap items-center justify-between gap-3" role="alert">
                  <div class="flex items-start gap-2 text-xs text-main">
                    <span class="material-symbols-rounded text-error text-base mt-0.5" aria-hidden="true">error</span>
                    <div>
                      <strong>Error 500 al guardar:</strong> tus cambios en <code class="font-mono">{{ routeName() }}</code> siguen intactos abajo. Nunca uses <code class="font-mono">&#64;if (error)</code> para destruir el formulario.
                    </div>
                  </div>
                  <m3-button variant="outlined" size="xs" icon="refresh" (action)="netState.set('ready')">
                    Reintentar
                  </m3-button>
                </div>
              }

              @if (netState() === 'empty') {
                <m3-card variant="filled" surface="low" padding="lg" customClass="text-center space-y-3">
                  <span class="material-symbols-rounded text-3xl text-primary" aria-hidden="true">alt_route</span>
                  <h5 class="text-sm font-bold text-main">Todavía no hay reglas configuradas en este entorno</h5>
                  <p class="text-xs text-muted max-w-md mx-auto">
                    Regla M3 Empty State: un mensaje claro + una sola acción primaria visible (<code class="font-mono">Filled Button</code>).
                  </p>
                  <m3-button variant="filled" icon="add" (action)="netState.set('ready')">
                    Crear Primera Regla de Ruteo
                  </m3-button>
                </m3-card>
              } @else {
                <m3-card variant="outlined" surface="low" padding="md" shape="lg" customClass="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <m3-text-field
                      label="Patrón de ruta (mín. 4 chars)"
                      variant="outlined"
                      [required]="true"
                      [minlength]="4"
                      [clearable]="true"
                      supportingText="Error diferido: aparece solo tras interactuar (:user-invalid)"
                      [(value)]="routeName" />

                    <m3-text-field
                      label="Destino fallback SPA"
                      variant="outlined"
                      [required]="true"
                      [(value)]="fallbackTarget" />
                  </div>

                  <m3-radio-group
                    legend="Estrategia de Resiliencia (2-5 opciones → RadioGroup)"
                    [options]="strategyOptions"
                    [(value)]="strategy" />

                  <m3-slider
                    label="Timeout máximo antes de Circuit Breaker"
                    unit="s"
                    size="sm"
                    [min]="5"
                    [max]="30"
                    [step]="5"
                    [showStops]="true"
                    [(value)]="timeoutSec" />

                  <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-outline-sub">
                    <m3-button variant="text" icon="close" (action)="requestCloseEditor()">
                      Intentar Cerrar Editor
                    </m3-button>

                    <m3-button variant="filled" icon="save" (action)="saveDraft()">
                      Guardar Configuración
                    </m3-button>
                  </div>
                </m3-card>
              }
            </div>

            <!-- Explicación lateral -->
            <m3-card variant="filled" surface="high" padding="md" shape="xl" customClass="xl:col-span-5 space-y-3.5">
              <div class="text-[11px] font-bold uppercase tracking-wider text-primary">
                Prueba de Campo Recomendada
              </div>
              <h4 class="text-sm font-bold text-main">Cómo verificar la resiliencia paso a paso</h4>

              <ol class="space-y-2 text-xs text-muted list-decimal ps-4 leading-relaxed">
                <li>Edita <strong class="text-main">Patrón de ruta</strong> o mueve el slider (el estado pasa a <strong class="text-main">Dirty</strong>).</li>
                <li>Activa <strong class="text-main">Error 500</strong> arriba: comprueba que el banner de alerta aparece sin borrar lo que escribiste.</li>
                <li>Pulsa <strong class="text-main">Intentar Cerrar Editor</strong>: se abre el <code class="font-mono text-primary">&lt;m3-dialog&gt;</code> nativo (<code class="font-mono">showModal()</code>) protegiendo los datos en el Top Layer.</li>
              </ol>

              <div class="p-3 rounded-m3-md bg-surface-box border border-outline-sub text-[11px] text-main leading-snug">
                <strong>Sin Trampa de Blur:</strong> porque usa el <code class="font-mono">Top Layer</code> del navegador, aunque el layout tenga <code class="font-mono">Stage Recess</code> o contenedores con scroll, el modal permanece nítido y enfocado.
              </div>
            </m3-card>
          </div>
        }
      }

      <!-- DIALOGO TOP LAYER NATIVO PARA DIRTY GUARD -->
      <m3-dialog
        variant="expressive"
        tone="primary"
        icon="warning"
        headline="¿Descartar cambios sin guardar?"
        ariaDescription="Editaste la configuración de ruteo. Si cierras ahora perderás los ajustes locales que aún no se guardaron."
        [(open)]="dirtyDialogOpen">
        <div class="p-3 rounded-m3-md bg-surface-low border border-outline-sub text-xs text-main space-y-1">
          <div><strong>Ruta actual:</strong> <code class="font-mono text-primary">{{ routeName() }}</code></div>
          <div><strong>Estrategia:</strong> {{ strategy() }} ({{ timeoutSec() }}s)</div>
        </div>

        <div dialog-actions>
          <m3-button variant="text" (action)="dirtyDialogOpen.set(false)">Seguir Editando</m3-button>
          <m3-button variant="filled" icon="delete_sweep" (action)="confirmDiscardDirty()">Descartar Cambios</m3-button>
        </div>
      </m3-dialog>
    </m3-card>
  `
})
export class PlaybookExamplesSectionComponent {
  private readonly gateway = inject(DispatchGatewayPort);

  readonly copyToken = output<{ text: string; message: string }>();
  readonly notify = output<PlaybookToastRequest>();

  readonly activeScenario = signal<AdvancedScenarioId>('optimistic-ports');
  readonly scenarioTabs: M3TabItem[] = [
    { id: 'optimistic-ports', label: '1. Clean Ports + Optimistic Rollback', icon: 'hub' },
    { id: 'perf-defer', label: '2. @defer + Virtual Scroll (2,500)', icon: 'speed' },
    { id: 'state-resilience', label: '3. Estados + Dirty Guard Modal', icon: 'shield' }
  ];

  // --- SCENARIO 1 STATE (Ports & Optimistic UI) ---
  readonly adapterProfiles = DISPATCH_ADAPTER_PROFILES;
  readonly activeProfile = signal<DispatchAdapterProfile>('fast-ok');
  readonly orders = signal<readonly DispatchOrder[]>(INITIAL_DISPATCH_ORDERS);
  readonly traceLog = signal<readonly PipelineTraceEntry[]>([]);
  private traceCounter = 0;

  readonly selectedProfileMeta = computed(
    () =>
      DISPATCH_ADAPTER_PROFILES.find((item) => item.id === this.activeProfile()) ??
      DISPATCH_ADAPTER_PROFILES[0]
  );

  readonly hasPendingSync = computed(() => this.orders().some((item) => !!item.syncing));

  // --- SCENARIO 2 STATE (@defer) ---
  readonly deferActivated = signal<boolean>(false);

  // --- SCENARIO 3 STATE (Multi-State + Dirty Guard) ---
  readonly netState = signal<OperationalNetState>('ready');
  readonly strategyOptions = STRATEGY_RADIO_OPTIONS;
  readonly savedDraft = signal<RouteConfigDraft>(INITIAL_ROUTE_DRAFT);
  readonly routeName = signal<string>(INITIAL_ROUTE_DRAFT.routeName);
  readonly fallbackTarget = signal<string>(INITIAL_ROUTE_DRAFT.fallbackTarget);
  readonly strategy = signal<string>(INITIAL_ROUTE_DRAFT.strategy);
  readonly timeoutSec = signal<number>(INITIAL_ROUTE_DRAFT.timeoutSec);
  readonly dirtyDialogOpen = signal<boolean>(false);

  readonly isDraftDirty = computed(() => {
    const base = this.savedDraft();
    return (
      this.routeName() !== base.routeName ||
      this.fallbackTarget() !== base.fallbackTarget ||
      this.strategy() !== base.strategy ||
      this.timeoutSec() !== base.timeoutSec
    );
  });

  statusMeta(status: DispatchStatus): { label: string; cssClass: string } {
    return STATUS_BADGE_MAP[status];
  }

  traceBadgeClass(tone: PipelineTraceEntry['tone']): string {
    const base = 'px-2 py-0.5 rounded-m3-full font-bold';
    if (tone === 'success') return `${base} bg-success-box text-on-success-box`;
    if (tone === 'warning') return `${base} bg-warning-box text-on-warning-box`;
    if (tone === 'error') return `${base} bg-error-box text-on-error-box`;
    return `${base} bg-primary-box text-on-primary-box`;
  }

  async triggerStatusTransition(order: DispatchOrder, nextStatus: DispatchStatus): Promise<void> {
    const snapshot = this.orders().map((item) => ({ ...item, syncing: false }));
    const profile = this.activeProfile();

    this.orders.update((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, status: nextStatus, syncing: true } : item
      )
    );
    this.appendTrace(
      'UI Optimistic',
      `${order.code} cambió a "${STATUS_BADGE_MAP[nextStatus].label}" en t=0ms`,
      'primary'
    );
    this.appendTrace(
      'Port Dispatch',
      `DispatchGatewayPort.persistOrderStatus(${order.code}) vía ${this.selectedProfileMeta().label}`,
      'warning'
    );

    try {
      await this.gateway.persistOrderStatus(order.id, nextStatus, profile);
      this.orders.update((current) =>
        current.map((item) => (item.id === order.id ? { ...item, syncing: false } : item))
      );
      this.appendTrace(
        'Adapter Commit',
        `Confirmación 200 OK recibida para ${order.code}`,
        'success'
      );
      this.notify.emit({
        message: `${order.code} guardado como ${STATUS_BADGE_MAP[nextStatus].label}`,
        actionLabel: 'Deshacer',
        onAction: () => this.undoSnapshot(snapshot, order.code)
      });
    } catch {
      this.orders.set(snapshot);
      this.appendTrace(
        'Rollback',
        `Falla 503 en ${order.code}: restaurado snapshot previo sin corrupción`,
        'error'
      );
      this.notify.emit({
        message: `Error 503 en ${order.code}: se revirtió el cambio optimista`,
        actionLabel: 'Reintentar',
        onAction: () => {
          void this.triggerStatusTransition(order, nextStatus);
        }
      });
    }
  }

  resetDispatchDemo(): void {
    this.orders.set(INITIAL_DISPATCH_ORDERS);
    this.traceLog.set([]);
  }

  activateDefer(): void {
    this.deferActivated.set(true);
  }

  saveDraft(): void {
    const nextSaved: RouteConfigDraft = {
      routeName: this.routeName(),
      fallbackTarget: this.fallbackTarget(),
      strategy: this.strategy(),
      timeoutSec: this.timeoutSec()
    };
    this.savedDraft.set(nextSaved);
    this.netState.set('ready');
    this.notify.emit({ message: 'Regla de ruteo guardada correctamente' });
  }

  requestCloseEditor(): void {
    if (!this.isDraftDirty()) {
      this.notify.emit({ message: 'Editor limpio: cierre permitido sin pérdida de datos' });
      return;
    }
    this.dirtyDialogOpen.set(true);
  }

  confirmDiscardDirty(): void {
    const base = this.savedDraft();
    this.routeName.set(base.routeName);
    this.fallbackTarget.set(base.fallbackTarget);
    this.strategy.set(base.strategy);
    this.timeoutSec.set(base.timeoutSec);
    this.dirtyDialogOpen.set(false);
    this.netState.set('ready');
    this.notify.emit({ message: 'Cambios locales descartados de forma segura' });
  }

  private undoSnapshot(snapshot: readonly DispatchOrder[], code: string): void {
    this.orders.set(snapshot);
    this.appendTrace('Undo', `Deshacer vía Snackbar restauró estado previo de ${code}`, 'primary');
  }

  private appendTrace(
    phase: PipelineTraceEntry['phase'],
    detail: string,
    tone: PipelineTraceEntry['tone']
  ): void {
    const now = new Date();
    const pad = (v: number): string => String(v).padStart(2, '0');
    const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const entry: PipelineTraceEntry = {
      id: ++this.traceCounter,
      timestamp,
      phase,
      detail,
      tone
    };
    this.traceLog.update((prev) => [entry, ...prev].slice(0, 12));
  }
}
