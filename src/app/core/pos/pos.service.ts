import { computed, Injectable, signal } from '@angular/core';

export interface PosProduct {
  id: number;
  sku: string;
  name: string;
  category: 'coffee' | 'sandwiches' | 'pastries' | 'drinks';
  categoryLabel: string;
  price: number;
  icon: string;
  imageUrl: string;
  description: string;
  stock: number;
}

export interface CartItem {
  lineId: string;
  product: PosProduct;
  unitPrice: number;
  quantity: number;
  notes?: string;
}

function createCartLineId(productId: number, unitPrice: number, notes?: string): string {
  return `${productId}::${unitPrice.toFixed(2)}::${notes?.trim() ?? ''}`;
}

export interface PosCustomer {
  docType: 'DNI' | 'RUC';
  docNumber: string;
  name: string;
  email?: string;
  address?: string;
  isCompany: boolean;
}

export type PaymentMethod = 'cash' | 'yape' | 'card';
export type VoucherType = 'boleta' | 'factura' | 'ticket';

export interface CompletedSale {
  saleId: string;
  orderCode?: string;
  serviceChannel?: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  date: Date;
  voucherType: VoucherType;
  customer: PosCustomer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  yapeCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PosService {
  // 1. Catálogo Maestro de Productos con Imágenes Reales de Alta Definición
  readonly products = signal<PosProduct[]>([
    {
      id: 1,
      sku: 'COF-001',
      name: 'Café Espresso Doble',
      category: 'coffee',
      categoryLabel: 'Cafetería',
      price: 8.50,
      icon: 'coffee',
      imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=85',
      description: 'Extracción intensa con granos de origen Cusco 100% arábica',
      stock: 45
    },
    {
      id: 2,
      sku: 'COF-002',
      name: 'Cappuccino Italiano',
      category: 'coffee',
      categoryLabel: 'Cafetería',
      price: 12.00,
      icon: 'local_cafe',
      imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=85',
      description: 'Espresso con leche texturizada sedosa y cacao espolvoreado',
      stock: 38
    },
    {
      id: 3,
      sku: 'COF-003',
      name: 'Latte Vainilla',
      category: 'coffee',
      categoryLabel: 'Cafetería',
      price: 13.50,
      icon: 'emoji_food_beverage',
      imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=85',
      description: 'Leche vaporizada con jarabe natural de vainilla bourbon',
      stock: 29
    },
    {
      id: 4,
      sku: 'COF-004',
      name: 'Cold Brew Nitro',
      category: 'coffee',
      categoryLabel: 'Cafetería',
      price: 14.00,
      icon: 'water_drop',
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=85',
      description: 'Infusión en frío durante 18 horas servido con nitrógeno helado',
      stock: 20
    },
    {
      id: 5,
      sku: 'SND-001',
      name: 'Sandwich de Pavo Braseado',
      category: 'sandwiches',
      categoryLabel: 'Sandwiches',
      price: 18.50,
      icon: 'bakery_dining',
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85',
      description: 'Pechuga de pavo artesanal con lechuga fresca y salsa criolla',
      stock: 16
    },
    {
      id: 6,
      sku: 'SND-002',
      name: 'Ciabatta Caprese & Pesto',
      category: 'sandwiches',
      categoryLabel: 'Sandwiches',
      price: 16.00,
      icon: 'lunch_dining',
      imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=85',
      description: 'Mozzarella de búfala, tomate cherry y pesto genovés de albahaca',
      stock: 14
    },
    {
      id: 7,
      sku: 'SND-003',
      name: 'Croissant Jamón Serrano',
      category: 'sandwiches',
      categoryLabel: 'Sandwiches',
      price: 19.00,
      icon: 'breakfast_dining',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85',
      description: 'Masa hojaldrada con mantequilla pura y jamón serrano curado',
      stock: 12
    },
    {
      id: 8,
      sku: 'PST-001',
      name: 'Muffin de Arándanos Silvestres',
      category: 'pastries',
      categoryLabel: 'Pastelería',
      price: 9.50,
      icon: 'cookie',
      imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=85',
      description: 'Horneado a diario con arándanos frescos del valle de Cañete',
      stock: 22
    },
    {
      id: 9,
      sku: 'PST-002',
      name: 'Cinnamon Roll Glaseado',
      category: 'pastries',
      categoryLabel: 'Pastelería',
      price: 11.00,
      icon: 'cake',
      imageUrl: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=800&q=85',
      description: 'Espiral de canela de Saigón con glaseado cremoso de queso',
      stock: 18
    },
    {
      id: 10,
      sku: 'PST-003',
      name: 'Torta Selva Negra',
      category: 'pastries',
      categoryLabel: 'Pastelería',
      price: 14.50,
      icon: 'cake',
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=85',
      description: 'Bizcocho húmedo de chocolate con cerezas al kirsch y crema chantilly',
      stock: 9
    },
    {
      id: 11,
      sku: 'DRK-001',
      name: 'Limonada Zen con Menta & Jengibre',
      category: 'drinks',
      categoryLabel: 'Bebidas',
      price: 9.00,
      icon: 'glass_cup',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85',
      description: 'Extracto natural de limón criollo, hierbabuena fresca y toque de miel',
      stock: 35
    },
    {
      id: 12,
      sku: 'DRK-002',
      name: 'Kombucha de Maracuyá',
      category: 'drinks',
      categoryLabel: 'Bebidas',
      price: 13.00,
      icon: 'liquor',
      imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=85',
      description: 'Té fermentado probiótico natural gasificado artesanalmente',
      stock: 25
    }
  ]);

  // 2. Filtros y Búsqueda Reactiva
  readonly selectedCategory = signal<string>('all');
  readonly searchQuery = signal<string>('');

  readonly categories = [
    { id: 'all', label: 'Todos', icon: 'apps' },
    { id: 'coffee', label: 'Cafetería', icon: 'local_cafe' },
    { id: 'sandwiches', label: 'Sandwiches', icon: 'lunch_dining' },
    { id: 'pastries', label: 'Pastelería', icon: 'cookie' },
    { id: 'drinks', label: 'Bebidas', icon: 'glass_cup' }
  ];

  readonly filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.products().filter(prod => {
      const matchCat = cat === 'all' || prod.category === cat;
      const matchQuery = !query || 
        prod.name.toLowerCase().includes(query) || 
        prod.sku.toLowerCase().includes(query) ||
        prod.categoryLabel.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  });

  // 3. Contexto Operativo Empresarial (Turno, Canal y Mesa)
  readonly shiftInfo = signal({
    register: 'CAJA-01',
    shift: 'Turno Mañana',
    cashier: 'Carlos Mendoza',
    initialBalance: 350.00,
    status: 'Abierta',
    salesCountToday: 38,
    sunatOnline: true
  });

  readonly availableTables = [
    'Mesa 01',
    'Mesa 02',
    'Mesa 03',
    'Mesa 04',
    'Mesa 05',
    'Mesa 06',
    'Terraza 01',
    'Barra'
  ] as const;

  readonly serviceChannel = signal<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  readonly tableNumber = signal<string>('Mesa 04');
  readonly ticketSequence = signal<number>(842);
  readonly activeOrderCode = computed(
    () => `#ORD-2026-${String(this.ticketSequence()).padStart(4, '0')}`
  );

  // 4. Carrito Reactivo y Cálculos
  readonly cart = signal<CartItem[]>([]);
  readonly discountPercent = signal<number>(0);

  readonly cartCount = computed(() => 
    this.cart().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly grossTotal = computed(() => 
    this.cart().reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0)
  );

  readonly discount = computed(() => 
    Number((this.grossTotal() * (this.discountPercent() / 100)).toFixed(2))
  );

  readonly total = computed(() => 
    Math.max(0, Number((this.grossTotal() - this.discount()).toFixed(2)))
  );

  // Desglose fiscal peruano (IGV 18% incluido en precio de venta)
  readonly subtotal = computed(() => 
    Number((this.total() / 1.18).toFixed(2))
  );

  readonly tax = computed(() => 
    Number((this.total() - this.subtotal()).toFixed(2))
  );

  getItemQuantity(productId: number): number {
    return this.cart().reduce(
      (sum, item) => (item.product.id === productId ? sum + item.quantity : sum),
      0
    );
  }

  remainingStock(productId: number): number {
    const product = this.products().find(p => p.id === productId);
    if (!product) return 0;
    return Math.max(0, product.stock - this.getItemQuantity(productId));
  }

  // 4. Datos del Comprobante Fiscal y Cliente
  readonly voucherType = signal<VoucherType>('boleta');
  
  readonly defaultCustomer: PosCustomer = {
    docType: 'DNI',
    docNumber: '00000000',
    name: 'Clientes Varios',
    isCompany: false
  };

  readonly customer = signal<PosCustomer>(this.defaultCustomer);

  // 5. Checkout y Pasarela de Cobro
  readonly isCheckoutOpen = signal<boolean>(false);
  readonly paymentMethod = signal<PaymentMethod>('cash');
  readonly cashReceived = signal<number>(0);
  readonly yapePhone = signal<string>('984 512 876');
  readonly yapeCode = signal<string>('');
  readonly cardReference = signal<string>('');

  // Cálculo de vuelto reactivo
  readonly change = computed(() => {
    if (this.paymentMethod() !== 'cash') return 0;
    return Number((this.cashReceived() - this.total()).toFixed(2));
  });

  readonly isPaymentValid = computed(() => {
    if (this.cart().length === 0) return false;
    if (this.paymentMethod() === 'cash') {
      return this.cashReceived() >= this.total();
    }
    if (this.paymentMethod() === 'yape') {
      return this.yapeCode().trim().length >= 4;
    }
    if (this.paymentMethod() === 'card') {
      return true; // Simulación de terminal inalámbrico POS aprobado
    }
    return false;
  });

  // 6. Comprobante Emitido
  readonly lastCompletedSale = signal<CompletedSale | null>(null);
  readonly isReceiptOpen = signal<boolean>(false);

  // --- MÉTODOS DEL CARRITO ---
  addToCart(product: PosProduct): void {
    this.addToCartWithCustomization(product);
  }

  addToCartWithNotes(product: PosProduct, notes?: string): void {
    this.addToCartWithCustomization(product, notes, product.price);
  }

  addToCartWithCustomization(product: PosProduct, notes?: string, unitPrice?: number): void {
    const normalizedNotes = notes?.trim() || undefined;
    const effectivePrice = Number((unitPrice ?? product.price).toFixed(2));
    const lineId = createCartLineId(product.id, effectivePrice, normalizedNotes);

    this.cart.update(current => {
      const liveProduct = this.products().find(p => p.id === product.id) ?? product;
      const totalQty = current.reduce(
        (sum, item) => (item.product.id === product.id ? sum + item.quantity : sum),
        0
      );
      if (totalQty >= liveProduct.stock) {
        return current;
      }

      const existing = current.find(item => item.lineId === lineId);
      if (existing) {
        return current.map(item =>
          item.lineId === lineId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...current,
        {
          lineId,
          product: liveProduct,
          unitPrice: effectivePrice,
          quantity: 1,
          notes: normalizedNotes
        }
      ];
    });
  }

  updateLineQuantity(lineId: string, delta: number): void {
    if (delta === 0) return;

    this.cart.update(current => {
      const target = current.find(item => item.lineId === lineId);
      if (!target) return current;

      if (delta > 0) {
        const liveProduct = this.products().find(p => p.id === target.product.id) ?? target.product;
        const totalQty = current.reduce(
          (sum, item) => (item.product.id === target.product.id ? sum + item.quantity : sum),
          0
        );
        if (totalQty >= liveProduct.stock) {
          return current;
        }
        const cappedDelta = Math.min(delta, liveProduct.stock - totalQty);
        return current.map(item =>
          item.lineId === lineId ? { ...item, quantity: item.quantity + cappedDelta } : item
        );
      }

      return current
        .map(item => {
          if (item.lineId === lineId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }

  removeLine(lineId: string): void {
    this.cart.update(current => current.filter(item => item.lineId !== lineId));
  }

  updateQuantity(productId: number, delta: number): void {
    const current = this.cart();
    const target =
      current.find(
        item =>
          item.product.id === productId &&
          item.lineId === createCartLineId(productId, item.product.price)
      ) ?? [...current].reverse().find(item => item.product.id === productId);

    if (!target) return;
    this.updateLineQuantity(target.lineId, delta);
  }

  removeFromCart(productId: number): void {
    this.cart.update(current => current.filter(item => item.product.id !== productId));
  }

  updateItemNotes(productId: number, notes: string): void {
    const normalizedNotes = notes.trim() || undefined;
    this.cart.update(current =>
      current.map(item => {
        if (item.product.id !== productId) return item;
        return {
          ...item,
          notes: normalizedNotes,
          lineId: createCartLineId(item.product.id, item.unitPrice, normalizedNotes)
        };
      })
    );
  }

  setTableNumber(table: string): void {
    this.tableNumber.set(table);
  }

  clearCart(): void {
    this.cart.set([]);
    this.discountPercent.set(0);
    this.cashReceived.set(0);
    this.yapeCode.set('');
  }

  // --- CLIENTE Y COMPROBANTE ---
  setVoucherType(type: VoucherType): void {
    this.voucherType.set(type);
    if (type === 'factura' && !this.customer().isCompany) {
      this.customer.set({
        docType: 'RUC',
        docNumber: '20601234567',
        name: 'INVERSIONES GASTRONOMICAS S.A.C.',
        isCompany: true
      });
    } else if (type === 'boleta' && this.customer().isCompany) {
      this.customer.set(this.defaultCustomer);
    }
  }

  setCustomer(customer: PosCustomer): void {
    this.customer.set(customer);
  }

  // --- FLUJO DE COBRO ---
  openCheckout(): void {
    if (this.cart().length === 0) return;
    this.cashReceived.set(Math.ceil(this.total()));
    this.yapeCode.set('');
    this.isCheckoutOpen.set(true);
  }

  closeCheckout(): void {
    this.isCheckoutOpen.set(false);
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
    if (method === 'cash') {
      this.cashReceived.set(Math.ceil(this.total()));
    }
  }

  setQuickCash(amount: number): void {
    this.cashReceived.set(amount);
  }

  addQuickCash(amount: number): void {
    this.cashReceived.update(current => current + amount);
  }

  setExactCash(): void {
    this.cashReceived.set(this.total());
  }

  completeSale(): void {
    if (!this.isPaymentValid()) return;

    const soldItems = this.cart().map(item => ({ ...item }));
    const series = this.voucherType() === 'factura' ? 'F001' : 'B001';
    const folio = String(this.ticketSequence()).padStart(6, '0');
    const saleId = `${series}-${folio}`;
    const channel = this.serviceChannel();

    const sale: CompletedSale = {
      saleId,
      orderCode: this.activeOrderCode(),
      serviceChannel: channel,
      tableNumber: channel === 'dine-in' ? this.tableNumber() : undefined,
      date: new Date(),
      voucherType: this.voucherType(),
      customer: this.customer(),
      items: soldItems,
      subtotal: this.subtotal(),
      tax: this.tax(),
      discount: this.discount(),
      total: this.total(),
      paymentMethod: this.paymentMethod(),
      cashReceived: this.paymentMethod() === 'cash' ? this.cashReceived() : undefined,
      change: this.paymentMethod() === 'cash' ? this.change() : undefined,
      yapeCode: this.paymentMethod() === 'yape' ? this.yapeCode() : undefined
    };

    const soldQtyByProduct = new Map<number, number>();
    for (const item of soldItems) {
      soldQtyByProduct.set(
        item.product.id,
        (soldQtyByProduct.get(item.product.id) ?? 0) + item.quantity
      );
    }

    this.products.update(catalog =>
      catalog.map(product => {
        const soldQty = soldQtyByProduct.get(product.id);
        if (!soldQty) return product;
        return { ...product, stock: Math.max(0, product.stock - soldQty) };
      })
    );

    this.shiftInfo.update(info => ({
      ...info,
      salesCountToday: info.salesCountToday + 1
    }));

    this.lastCompletedSale.set(sale);
    this.isCheckoutOpen.set(false);
    this.isReceiptOpen.set(true);
  }

  newSale(): void {
    const hadCompletedSale = this.lastCompletedSale() !== null;
    this.clearCart();
    this.customer.set(this.defaultCustomer);
    this.voucherType.set('boleta');
    this.lastCompletedSale.set(null);
    this.isReceiptOpen.set(false);
    if (hadCompletedSale) {
      this.ticketSequence.update(seq => seq + 1);
    }
  }
}
