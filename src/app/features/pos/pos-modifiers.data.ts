import { PosProduct } from '../../core/pos/pos.service';

export interface PosModifierOption {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly extraPrice: number;
}

export interface PosCategoryModifiers {
  readonly baseLabel: string;
  readonly bases: readonly PosModifierOption[];
  readonly extras: readonly PosModifierOption[];
}

export interface PosCategoryFallbackTheme {
  readonly bg: string;
  readonly text: string;
  readonly border: string;
}

const DEFAULT_CATEGORY_MODIFIERS: PosCategoryModifiers = {
  baseLabel: 'Presentación',
  bases: [
    { id: 'standard', name: 'Porción Normal', label: 'Porción Estándar (Std)', extraPrice: 0 },
    { id: 'warmed', name: 'Calentar al Horno', label: 'Calentar al Horno (Std)', extraPrice: 0 }
  ],
  extras: [
    { id: 'to_share', name: 'Para Compartir', label: 'Para Compartir', extraPrice: 0 },
    { id: 'ice', name: 'Con Hielo', label: 'Con Hielo', extraPrice: 0 },
    { id: 'eco', name: 'Empaque Llevar', label: 'Empaque Para Llevar', extraPrice: 0 }
  ]
};

export const CATEGORY_MODIFIERS: Record<PosProduct['category'], PosCategoryModifiers> = {
  coffee: {
    baseLabel: 'Seleccionar Tipo de Leche / Base',
    bases: [
      { id: 'whole', name: 'Leche Entera', label: 'Leche Entera (Std)', extraPrice: 0 },
      { id: 'lactose_free', name: 'Deslactosada', label: 'Deslactosada (+S/ 1.00)', extraPrice: 1.00 },
      { id: 'oat', name: 'Leche de Avena', label: 'Leche de Avena (+S/ 2.50)', extraPrice: 2.50 },
      { id: 'almond', name: 'Almendras', label: 'Leche de Almendras (+S/ 2.50)', extraPrice: 2.50 }
    ],
    extras: [
      { id: 'extra_shot', name: 'Extra Shot', label: 'Extra Shot (+S/ 3.00)', extraPrice: 3.00 },
      { id: 'vanilla', name: 'Jarabe Vainilla', label: 'Jarabe Vainilla (+S/ 1.50)', extraPrice: 1.50 },
      { id: 'no_sugar', name: 'Sin Azúcar', label: 'Sin Azúcar', extraPrice: 0 },
      { id: 'hot', name: 'Bien Caliente', label: 'Bien Caliente', extraPrice: 0 }
    ]
  },
  sandwiches: {
    baseLabel: 'Seleccionar Tipo de Pan',
    bases: [
      { id: 'ciabatta', name: 'Pan Ciabatta', label: 'Pan Ciabatta (Std)', extraPrice: 0 },
      { id: 'sourdough', name: 'Masa Madre', label: 'Masa Madre (+S/ 1.50)', extraPrice: 1.50 },
      { id: 'brioche', name: 'Pan Brioche', label: 'Pan Brioche (+S/ 2.00)', extraPrice: 2.00 },
      { id: 'integral', name: 'Pan Integral', label: 'Pan Integral (+S/ 1.00)', extraPrice: 1.00 }
    ],
    extras: [
      { id: 'extra_cheese', name: 'Queso Extra', label: 'Queso Extra (+S/ 3.00)', extraPrice: 3.00 },
      { id: 'toasted', name: 'Doble Tostado', label: 'Doble Tostado', extraPrice: 0 },
      { id: 'no_onion', name: 'Sin Cebolla', label: 'Sin Cebolla', extraPrice: 0 },
      { id: 'sauce_aside', name: 'Salsas Aparte', label: 'Salsas Aparte', extraPrice: 0 }
    ]
  },
  pastries: DEFAULT_CATEGORY_MODIFIERS,
  drinks: DEFAULT_CATEGORY_MODIFIERS
};

export const CATEGORY_FALLBACK_THEMES: Record<PosProduct['category'], PosCategoryFallbackTheme> = {
  coffee: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30'
  },
  sandwiches: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30'
  },
  pastries: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/30'
  },
  drinks: {
    bg: 'bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-500/30'
  }
};

