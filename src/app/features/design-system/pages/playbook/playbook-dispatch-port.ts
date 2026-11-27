export type DispatchStatus = 'pending' | 'approved' | 'paused';

export type DispatchAdapterProfile = 'fast-ok' | 'slow-ok' | 'flaky-503';

export interface DispatchOrder {
  readonly id: string;
  readonly code: string;
  readonly client: string;
  readonly destination: string;
  readonly batchWeightKg: number;
  readonly status: DispatchStatus;
  readonly syncing?: boolean;
}

export interface PipelineTraceEntry {
  readonly id: number;
  readonly timestamp: string;
  readonly phase: 'UI Optimistic' | 'Port Dispatch' | 'Adapter Commit' | 'Rollback' | 'Undo';
  readonly detail: string;
  readonly tone: 'primary' | 'success' | 'warning' | 'error';
}

export interface AdapterBehaviorConfig {
  readonly id: DispatchAdapterProfile;
  readonly label: string;
  readonly latencyMs: number;
  readonly shouldFail: boolean;
  readonly description: string;
}

export const DISPATCH_ADAPTER_PROFILES: readonly AdapterBehaviorConfig[] = [
  {
    id: 'fast-ok',
    label: 'Adapter Edge (120ms)',
    latencyMs: 120,
    shouldFail: false,
    description: 'Responde 200 OK casi al instante y confirma la mutación optimista.'
  },
  {
    id: 'slow-ok',
    label: 'Adapter 3G Lento (850ms)',
    latencyMs: 850,
    shouldFail: false,
    description: 'Simula latencia alta: la UI ya respondió en t=0ms mientras espera confirmación.'
  },
  {
    id: 'flaky-503',
    label: 'Adapter Inestable (Error 503)',
    latencyMs: 220,
    shouldFail: true,
    description: 'Falla al confirmar en backend y fuerza Rollback automático al snapshot previo.'
  }
];

export const INITIAL_DISPATCH_ORDERS: readonly DispatchOrder[] = [
  {
    id: 'ord-901',
    code: 'LOTE-901',
    client: 'Red Logística Norte',
    destination: 'Centro Hub A1',
    batchWeightKg: 420,
    status: 'pending'
  },
  {
    id: 'ord-902',
    code: 'LOTE-902',
    client: 'Farmacia Central',
    destination: 'Cadena Frío B4',
    batchWeightKg: 185,
    status: 'approved'
  },
  {
    id: 'ord-903',
    code: 'LOTE-903',
    client: 'Distribuidora Sur',
    destination: 'Puerto Terminal C2',
    batchWeightKg: 640,
    status: 'paused'
  }
];

/**
 * Domain Port contract separating feature UI state from transport/persistence details.
 * UI components inject this abstract contract instead of coupling directly to HttpClient.
 */
export abstract class DispatchGatewayPort {
  abstract persistOrderStatus(
    orderId: string,
    nextStatus: DispatchStatus,
    profile: DispatchAdapterProfile
  ): Promise<void>;
}

/**
 * Parameterized concrete Adapter implementing DispatchGatewayPort for sandbox/live demos.
 * In production, a sibling HttpDispatchAdapter replaces this provider via DI without touching UI code.
 */
export class ConfigurableDispatchAdapter extends DispatchGatewayPort {
  override persistOrderStatus(
    _orderId: string,
    _nextStatus: DispatchStatus,
    profile: DispatchAdapterProfile
  ): Promise<void> {
    const config =
      DISPATCH_ADAPTER_PROFILES.find((item) => item.id === profile) ?? DISPATCH_ADAPTER_PROFILES[0];

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.shouldFail) {
          reject(new Error(`503 Service Unavailable (${config.label})`));
          return;
        }
        resolve();
      }, config.latencyMs);
    });
  }
}
