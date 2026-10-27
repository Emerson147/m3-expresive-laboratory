import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosProduct, PosService, VoucherType } from '../../core/pos/pos.service';
import { ThemeService } from '../../core/theme/theme.service';
import { M3ButtonComponent } from '../../shared/components/button/button.component';
import { M3ChipComponent } from '../../shared/components/chip/chip.component';
import { M3TextFieldComponent } from '../../shared/components/text-field/text-field.component';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    M3ButtonComponent,
    M3ChipComponent,
    M3TextFieldComponent
  ],
  host: {
    class: 'flex-1 h-full min-h-0 flex flex-col overflow-hidden'
  },
  template: `
    <!-- =========================================================================
         LAYOUT PRINCIPAL (VIEWPORT FIJO: CATÁLOGO SCROLLEABLE + TICKET ANCLADO)
         ========================================================================= -->
    <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch h-full overflow-hidden">

      <!-- =====================================================================
           1. PANEL IZQUIERDO: CATÁLOGO TÁCTIL (8 COLS) - SCROLL INTERNO ESPACIOSO
           ===================================================================== -->
      <section class="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-0 space-y-3 overflow-hidden">

        <!-- CABECERA DEL CATÁLOGO: TÍTULO "MENÚ" + BUSCADOR INTEGRADO + BOTÓN ATAJOS -->
        <div class="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-black text-main tracking-tight">Menú</h2>
            <span class="text-xs font-mono font-bold text-muted px-2.5 py-0.5 rounded-full bg-surface-box border border-outline-sub shadow-2xs">
              {{ posService.filteredProducts().length }} productos
            </span>
          </div>

          <!-- Buscador compacto con botón de atajos contextual -->
          <div class="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
            <div class="relative flex-1">
              <span class="material-symbols-rounded absolute left-3 top-2 text-lg text-muted pointer-events-none">search</span>
              <input 
                id="pos-search-input"
                type="text"
                [ngModel]="posService.searchQuery()"
                (ngModelChange)="posService.searchQuery.set($event)"
                placeholder="Buscar alimentos, bebidas o SKU... [F2]"
                class="w-full text-xs pl-9 pr-9 py-2 rounded-xl bg-surface-box border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-2xs" />
              @if (posService.searchQuery()) {
                <button 
                  type="button" 
                  (click)="posService.searchQuery.set('')" 
                  class="absolute right-2.5 top-2 text-muted hover:text-main cursor-pointer">
                  <span class="material-symbols-rounded text-base">close</span>
                </button>
              } @else {
                <span class="material-symbols-rounded absolute right-2.5 top-2 text-base text-muted/50 pointer-events-none">qr_code_scanner</span>
              }
            </div>

            <!-- Botón Atajos: reubicado de forma limpia y contextual -->
            <button 
              type="button" 
              (click)="toggleShortcutsModal(true)"
              title="Atajos de teclado (F2, F4, Ctrl+Enter, Esc)"
              class="btn-m3 h-8.5 px-3 rounded-xl bg-surface-box hover:bg-surface-high text-main border border-outline-sub flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0 active:scale-95">
              <span class="material-symbols-rounded text-base text-primary">keyboard</span>
              <span class="text-xs font-bold hidden md:inline">Atajos</span>
            </button>
          </div>
        </div>

        <!-- CHIPS DE FILTRO RÁPIDO DE CATEGORÍAS -->
        <div class="shrink-0 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          @for (cat of posService.categories; track cat.id) {
            <m3-chip 
              type="filter" 
              [selected]="posService.selectedCategory() === cat.id"
              [icon]="cat.icon"
              (action)="posService.selectedCategory.set(cat.id)">
              {{ cat.label }}
            </m3-chip>
          }
        </div>

        <!-- GRILLA DE PRODUCTOS ESPACIOSA (3 COLUMNAS CON FOTOS DE ALTA DEFINICIÓN) -->
        <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar p-1 pr-1.5 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (product of posService.filteredProducts(); track product.id) {
              @let qty = posService.getItemQuantity(product.id);
              @let theme = getCategoryTheme(product.category);

              <div 
                (click)="posService.addToCart(product)"
                [class.ring-2]="qty > 0"
                [class.ring-inset]="qty > 0"
                [class.ring-primary]="qty > 0"
                [class.border-primary]="qty > 0"
                class="group relative flex flex-col justify-between rounded-2xl bg-surface-box border border-outline-sub hover:border-outline hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out cursor-pointer select-none overflow-hidden active:scale-[0.985]"
                [ngClass]="qty > 0 ? 'bg-primary/10 shadow-sm' : 'shadow-2xs'">

                <!-- BADGE FLOTANTE DE CANTIDAD EN ORDEN ACTIVA -->
                @if (qty > 0) {
                  <div class="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-mono font-black shadow-lg flex items-center gap-1.5 z-20 animate-in zoom-in-75">
                    <span class="material-symbols-rounded text-sm">shopping_bag</span>
                    <span>{{ qty }}x</span>
                  </div>
                }

                <!-- FOTOGRAFÍA REAL DEL PRODUCTO (240PX PROPORCIÓN RETRATO ESTILO AURA ATELIER) -->
                <div class="relative w-full h-60 bg-surface-high overflow-hidden shrink-0 rounded-t-2xl">
                  @if (!imageFailed[product.id]) {
                    <img 
                      [src]="product.imageUrl" 
                      [alt]="product.name" 
                      (error)="imageFailed[product.id] = true"
                      loading="lazy"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  } @else {
                    <!-- Fallback cromático vectorial con icono -->
                    <div 
                      [class]="theme.bg + ' ' + theme.text"
                      class="w-full h-full grid place-items-center">
                      <span class="material-symbols-rounded text-6xl">{{ product.icon }}</span>
                    </div>
                  }

                  <!-- Gradient overlay rico y nítido para legibilidad perfecta sin glassmorfismo -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none"></div>

                  <!-- Header superior sobre la foto: Categoría y Stock en chips sólidos de alto contraste -->
                  <div class="absolute top-2.5 inset-x-2.5 flex items-center justify-between text-xs text-white z-10">
                    <span class="px-2.5 py-0.5 rounded-full bg-zinc-950/85 font-bold text-[10px] uppercase tracking-wider border border-white/15 shadow-xs">
                      {{ product.categoryLabel }}
                    </span>
                    <span 
                      [class]="product.stock <= 20 ? 'bg-amber-600 text-white font-black' : 'bg-zinc-950/85 text-white/90 font-semibold'"
                      class="px-2.5 py-0.5 rounded-full font-mono text-[10px] border border-white/15 shadow-xs">
                      {{ product.stock }} disp.
                    </span>
                  </div>

                  <!-- Footer inferior sobre la foto: SKU y Precio Grande (Completamente Despejado) -->
                  <div class="absolute bottom-2.5 inset-x-3 z-10">
                    <span class="text-[10px] font-mono text-white/80 font-bold tracking-wider uppercase block">
                      {{ product.sku }}
                    </span>
                    <div class="font-mono font-black text-2xl text-white tracking-tight leading-none mt-0.5 drop-shadow-md">
                      S/ {{ product.price.toFixed(2) }}
                    </div>
                  </div>
                </div>

                <!-- CONTENIDO DEL PRODUCTO: LIMPIO CON DOBLE BOTONERA TÁCTIL -->
                <div class="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 class="font-extrabold text-sm text-main group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                      {{ product.name }}
                    </h4>
                    <!-- Especificación de origen/receta única sin repetir la categoría -->
                    <p class="text-xs text-muted line-clamp-1 mt-0.5 font-normal">
                      {{ product.description }}
                    </p>
                  </div>

                  <!-- FOOTER CON ACCIONES TÁCTILES DOBLES: OPCIONES + AÑADIR/STEPPER -->
                  <div class="flex items-center gap-2 pt-2 border-t border-outline-sub/60">
                    <!-- Botón Opciones Secundario -->
                    <button 
                      type="button" 
                      title="Personalizar receta o notas"
                      (click)="$event.stopPropagation(); openCustomizeModal(product)"
                      class="btn-m3 flex-1 text-xs font-bold py-2 px-3 rounded-full bg-surface-high hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-main border border-outline-sub flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all">
                      <span class="material-symbols-rounded text-sm text-primary">tune</span>
                      <span>Opciones</span>
                    </button>

                    @if (qty > 0) {
                      <!-- Stepper Táctil Activo en Tono Primario -->
                      <div class="flex items-center gap-1 bg-primary text-on-primary rounded-full p-1 shadow-xs" (click)="$event.stopPropagation()">
                        <button 
                          type="button" 
                          title="Restar cantidad"
                          (click)="posService.updateQuantity(product.id, -1)"
                          class="btn-m3 w-7 h-7 rounded-full hover:bg-black/20 text-on-primary grid place-items-center cursor-pointer transition-colors">
                          <span class="material-symbols-rounded text-sm font-bold">remove</span>
                        </button>
                        <span class="text-xs font-mono font-bold w-5 text-center">{{ qty }}</span>
                        <button 
                          type="button" 
                          title="Sumar cantidad"
                          (click)="posService.updateQuantity(product.id, 1)"
                          class="btn-m3 w-7 h-7 rounded-full hover:bg-black/20 text-on-primary grid place-items-center cursor-pointer transition-colors">
                          <span class="material-symbols-rounded text-sm font-bold">add</span>
                        </button>
                      </div>
                    } @else {
                      <!-- Botón Añadir Primario Directo -->
                      <button 
                        type="button" 
                        title="Agregar a la comanda"
                        (click)="$event.stopPropagation(); posService.addToCart(product)"
                        class="btn-m3 flex-1 text-xs font-bold py-2 px-3 rounded-full bg-primary text-on-primary hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all">
                        <span class="material-symbols-rounded text-sm font-bold">shopping_bag</span>
                        <span>Añadir</span>
                      </button>
                    }
                  </div>
                </div>

              </div>
            } @empty {
              <div class="col-span-full p-12 text-center bg-surface-box border border-outline-sub rounded-2xl space-y-2">
                <span class="material-symbols-rounded text-4xl text-muted">search_off</span>
                <h4 class="font-bold text-base">No se encontraron productos</h4>
                <p class="text-xs text-muted">Revisá el término de búsqueda o cambiá de categoría.</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- =====================================================================
           2. PANEL DERECHO: TICKET FISCAL Y COMANDA (4 COLS) - CURVAS PERFECTAS
           ===================================================================== -->
      <section class="lg:col-span-5 xl:col-span-4 flex flex-col h-full min-h-0 overflow-hidden">
        <div class="flex flex-col h-full min-h-0 bg-surface-box border border-outline-sub rounded-2xl shadow-xl overflow-hidden">
          
          <!-- A. CABECERA FIJA DEL TICKET (ESTILO BOLETERA COMERCIAL CON CURVAS LIMPIAS) -->
          <div class="shrink-0 p-3.5 bg-surface-high border-b border-outline-sub space-y-2.5 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-primary text-xl">receipt_long</span>
                <div>
                  <h3 class="font-black text-xs tracking-tight text-main">Comanda Comercial</h3>
                  <div class="text-[10px] font-mono text-muted uppercase">Ticket #ORD-2026-0842</div>
                </div>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-primary-box text-on-primary-box text-xs font-mono font-bold">
                {{ posService.cartCount() }} ítems
              </span>
            </div>

            <!-- SELECTOR DE CANAL DE SERVICIO (PILL DENTRO DE PILL CONCÉNTRICO) -->
            <div class="grid grid-cols-3 gap-1 p-1 bg-surface-box rounded-full border border-outline-sub text-xs">
              <button 
                type="button"
                (click)="setChannel('dine-in')"
                [class]="posService.serviceChannel() === 'dine-in' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 py-1.5 px-2 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 truncate text-xs">
                <span class="material-symbols-rounded text-sm">restaurant</span>
                <span>{{ posService.tableNumber() }}</span>
              </button>
              <button 
                type="button"
                (click)="setChannel('takeaway')"
                [class]="posService.serviceChannel() === 'takeaway' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 py-1.5 px-2 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 truncate text-xs">
                <span class="material-symbols-rounded text-sm">shopping_bag</span>
                <span>Llevar</span>
              </button>
              <button 
                type="button"
                (click)="setChannel('delivery')"
                [class]="posService.serviceChannel() === 'delivery' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 py-1.5 px-2 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 truncate text-xs">
                <span class="material-symbols-rounded text-sm">two_wheeler</span>
                <span>Delivery</span>
              </button>
            </div>

            <!-- SELECTOR BOLETA / FACTURA (PILL DENTRO DE PILL CONCÉNTRICO) -->
            <div class="grid grid-cols-2 gap-1 p-1 bg-surface-box rounded-full border border-outline-sub">
              <button 
                type="button"
                (click)="posService.setVoucherType('boleta')"
                [class]="posService.voucherType() === 'boleta' ? 'bg-sec-box text-on-sec-box font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 py-1.5 rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150">
                <span class="material-symbols-rounded text-sm">person</span>
                Boleta de Venta
              </button>
              <button 
                type="button"
                (click)="posService.setVoucherType('factura')"
                [class]="posService.voucherType() === 'factura' ? 'bg-sec-box text-on-sec-box font-bold shadow-xs' : 'text-muted hover:text-main'"
                class="btn-m3 py-1.5 rounded-full text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150">
                <span class="material-symbols-rounded text-sm">domain</span>
                Factura SUNAT
              </button>
            </div>

            <!-- DATOS DEL CLIENTE / EMPRESA CON ATAJO F4 -->
            <div class="flex items-center justify-between text-xs px-3 py-2 bg-surface-box rounded-xl border border-outline-sub">
              <div class="min-w-0 flex-1 pr-2">
                <div class="font-bold text-main truncate text-xs">{{ posService.customer().name }}</div>
                <div class="text-[11px] text-muted font-mono">{{ posService.customer().docType }}: {{ posService.customer().docNumber }}</div>
              </div>
              <button 
                type="button"
                (click)="toggleCustomerModal(true)"
                class="btn-m3 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 text-xs cursor-pointer transition-colors">
                Editar [F4]
              </button>
            </div>
          </div>

          <!-- B. STREAM DE ÍTEMS CON SCROLL INTERNO (NUNCA EXPULSA EL TOTAL) -->
          <div class="flex-1 min-h-0 overflow-y-auto m3-scrollbar p-3.5 space-y-2.5">
            @for (item of posService.cart(); track item.product.id) {
              <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-outline-sub/60 last:border-b-0 last:pb-0">
                <div class="min-w-0 flex-1">
                  <h5 class="font-bold text-xs text-main truncate">{{ item.product.name }}</h5>
                  <div class="text-[11px] text-muted font-mono mt-0.5">
                    S/ {{ item.product.price.toFixed(2) }} c/u
                  </div>
                  @if (item.notes) {
                    <div class="text-[10px] text-primary italic mt-0.5 bg-primary/5 px-1.5 py-0.5 rounded w-fit">
                      Obs: {{ item.notes }}
                    </div>
                  }
                </div>

                <!-- CONTROLES DE CANTIDAD (- / QTY / +) -->
                <div class="flex items-center gap-1 bg-surface-high rounded-full px-2 py-0.5 border border-outline-sub shrink-0">
                  <button 
                    type="button"
                    (click)="posService.updateQuantity(item.product.id, -1)"
                    class="btn-m3 w-5 h-5 rounded-full grid place-items-center text-muted hover:text-main cursor-pointer">
                    <span class="material-symbols-rounded text-xs">remove</span>
                  </button>
                  <span class="text-xs font-mono font-bold w-4 text-center">{{ item.quantity }}</span>
                  <button 
                    type="button"
                    (click)="posService.updateQuantity(item.product.id, 1)"
                    class="btn-m3 w-5 h-5 rounded-full grid place-items-center text-muted hover:text-main cursor-pointer">
                    <span class="material-symbols-rounded text-xs">add</span>
                  </button>
                </div>

                <!-- SUBTOTAL POR ÍTEM Y ELIMINAR -->
                <div class="text-right shrink-0">
                  <div class="font-mono font-bold text-xs text-main">
                    S/ {{ (item.product.price * item.quantity).toFixed(2) }}
                  </div>
                  <button 
                    type="button" 
                    title="Quitar ítem"
                    (click)="posService.removeFromCart(item.product.id)"
                    class="text-[10px] text-error hover:underline cursor-pointer block mt-0.5">
                    Quitar
                  </button>
                </div>
              </div>
            } @empty {
              <div class="py-14 text-center space-y-2 text-muted">
                <span class="material-symbols-rounded text-3xl">shopping_cart</span>
                <p class="text-xs font-medium">No hay productos en la comanda.</p>
                <p class="text-[11px]">Tocá una tarjeta del catálogo para sumarlo.</p>
              </div>
            }
          </div>

          <!-- C. FOOTER FISCAL ANCLADO Y CON CURVAS TOTALMENTE LIMPIAS (ROUNDED-B-2XL) -->
          <div class="shrink-0 p-3.5 bg-surface-box border-t border-outline-sub space-y-2.5 rounded-b-2xl">
            
            <!-- PASTILLAS DE DESCUENTO RÁPIDO -->
            <div class="flex items-center justify-between text-xs gap-1.5">
              <span class="text-[11px] text-muted font-semibold">Descuento:</span>
              <div class="flex items-center gap-1">
                @for (pct of [0, 5, 10, 15]; track pct) {
                  <button 
                    type="button"
                    (click)="posService.discountPercent.set(pct)"
                    [class]="posService.discountPercent() === pct ? 'bg-primary text-on-primary font-bold shadow-xs' : 'bg-surface-high text-muted hover:text-main'"
                    class="btn-m3 px-2.5 py-0.5 rounded-full text-[11px] font-mono cursor-pointer transition-colors">
                    {{ pct === 0 ? '0%' : '-' + pct + '%' }}
                  </button>
                }
              </div>
            </div>

            <!-- LÍNEAS DE TOTALES FISCALES PERUANAS -->
            <div class="space-y-1 text-xs pt-1 border-t border-outline-sub/60">
              <div class="flex items-center justify-between text-muted text-xs">
                <span>Subtotal (Base Imponible)</span>
                <span class="font-mono">S/ {{ posService.subtotal().toFixed(2) }}</span>
              </div>
              @if (posService.discount() > 0) {
                <div class="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold text-xs">
                  <span>Descuento Aplicado ({{ posService.discountPercent() }}%)</span>
                  <span class="font-mono">- S/ {{ posService.discount().toFixed(2) }}</span>
                </div>
              }
              <div class="flex items-center justify-between text-muted text-xs">
                <span>IGV (18% Fiscal SUNAT)</span>
                <span class="font-mono">S/ {{ posService.tax().toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between font-black text-main pt-1.5 border-t border-outline-sub">
                <span class="text-sm">Total a Liquidar</span>
                <span class="text-primary text-2xl font-mono tracking-tight font-black">S/ {{ posService.total().toFixed(2) }}</span>
              </div>
            </div>

            <!-- BOTONES DE ACCIÓN: LIMPIAR Y COBRAR (ENTER) CON BORDES REDONDEADOS FLUIDOS -->
            <div class="flex items-center gap-2 pt-1">
              <m3-button 
                variant="outlined" 
                size="md" 
                icon="delete_sweep" 
                [disabled]="posService.cart().length === 0"
                (action)="posService.clearCart()">
                Limpiar
              </m3-button>

              <button 
                type="button"
                [disabled]="posService.cart().length === 0"
                (click)="openCheckoutModal()"
                class="btn-m3 flex-1 font-black shadow-md rounded-full py-3 px-5 bg-primary text-on-primary disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-95 transition-all text-sm">
                <span class="material-symbols-rounded text-xl">payments</span>
                <span>Cobrar S/ {{ posService.total().toFixed(2) }} [Enter]</span>
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>

    <!-- =========================================================================
         MODAL 1: CHECKOUT & PASARELA DE COBRO (STAGE RECESS & CONTAINER TRANSFORM)
         ========================================================================= -->
    @if (posService.isCheckoutOpen()) {
      <div (click)="closeCheckoutModal()" class="fixed -inset-10 min-h-screen min-w-screen bg-black/65 backdrop-blur-md z-40 m3-dialog-backdrop cursor-pointer"></div>

      <div 
        class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[500px] h-fit max-h-[calc(100vh-3rem)] bg-surface-box border border-outline-sub p-6 rounded-3xl shadow-2xl z-50 flex flex-col justify-between overflow-y-auto m3-dialog-surface">
        
        <div class="space-y-4">
          <!-- CABECERA DE COBRO -->
          <div class="flex items-center justify-between pb-3 border-b border-outline-sub">
            <div>
              <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Pasarela de Cobro</span>
              <h3 class="text-lg font-bold text-main">
                {{ posService.voucherType() === 'factura' ? 'Factura Electrónica' : 'Boleta de Venta' }}
              </h3>
            </div>
            <button 
              type="button"
              (click)="closeCheckoutModal()" 
              class="btn-m3 p-1 rounded-full hover:bg-surface-high text-muted hover:text-main cursor-pointer active:scale-95 transition-all">
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>

          <!-- TOTAL DESTACADO -->
          <div class="p-4 bg-primary-box text-on-primary-box rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-wider opacity-80">Monto a Liquidar</div>
              <div class="text-3xl font-black font-mono">S/ {{ posService.total().toFixed(2) }}</div>
            </div>
            <div class="text-right text-xs opacity-90">
              <div class="font-bold">{{ posService.customer().name }}</div>
              <div class="font-mono text-xs">{{ posService.customer().docType }}: {{ posService.customer().docNumber }}</div>
              <div class="font-semibold text-[10px] mt-0.5 uppercase tracking-wide">
                Canal: {{ posService.serviceChannel() === 'dine-in' ? posService.tableNumber() : (posService.serviceChannel() === 'takeaway' ? 'Para Llevar' : 'Delivery') }}
              </div>
            </div>
          </div>

          <!-- MÉTODOS DE PAGO DISPONIBLES (PILLS) -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-muted uppercase tracking-wider">Método de Pago</label>
            <div class="grid grid-cols-3 gap-2 p-1 bg-surface-high rounded-full border border-outline-sub">
              <button 
                type="button"
                (click)="posService.setPaymentMethod('cash')"
                [class]="posService.paymentMethod() === 'cash' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-main hover:bg-surface-highest'"
                class="btn-m3 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs">
                <span class="material-symbols-rounded text-base">payments</span>
                <span>Efectivo</span>
              </button>

              <button 
                type="button"
                (click)="posService.setPaymentMethod('yape')"
                [class]="posService.paymentMethod() === 'yape' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-main hover:bg-surface-highest'"
                class="btn-m3 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs">
                <span class="material-symbols-rounded text-base">qr_code_2</span>
                <span>Yape / Plin</span>
              </button>

              <button 
                type="button"
                (click)="posService.setPaymentMethod('card')"
                [class]="posService.paymentMethod() === 'card' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-main hover:bg-surface-highest'"
                class="btn-m3 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs">
                <span class="material-symbols-rounded text-base">credit_card</span>
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          <!-- 1. DETALLE EFECTIVO: VUELTO Y BILLETES RÁPIDOS -->
          @if (posService.paymentMethod() === 'cash') {
            <div class="space-y-3 p-4 bg-surface-high/60 rounded-2xl border border-outline-sub">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-main">Monto Entregado por Cliente</label>
                <button 
                  type="button"
                  (click)="posService.setExactCash()"
                  class="btn-m3 text-xs text-primary font-bold hover:underline cursor-pointer">
                  Monto Exacto
                </button>
              </div>

              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-base text-muted">S/</span>
                <input 
                  type="number"
                  step="0.50"
                  [value]="posService.cashReceived()"
                  (input)="onCashInput($any($event.target).value)"
                  class="w-full pl-9 pr-3 py-2.5 bg-surface-box border border-outline-sub rounded-xl font-mono text-lg font-bold text-main focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <!-- BOTONES DE BILLETES COMERCIALES PERUANOS (20, 50, 100) -->
              <div class="flex items-center gap-2">
                @for (bill of [20, 50, 100]; track bill) {
                  <button 
                    type="button"
                    (click)="posService.setQuickCash(bill)"
                    class="btn-m3 flex-1 py-1.5 bg-surface-box hover:bg-surface-highest border border-outline-sub rounded-xl text-xs font-mono font-bold text-main cursor-pointer shadow-xs">
                    S/ {{ bill }}
                  </button>
                }
              </div>

              <!-- CÁLCULO DE VUELTO O ALERTA DE MONTO INSUFICIENTE -->
              <div class="pt-2.5 border-t border-outline-sub flex items-center justify-between">
                <span class="text-xs font-semibold text-muted">Vuelto a Devolver:</span>
                @if (posService.change() >= 0) {
                  <span class="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    S/ {{ posService.change().toFixed(2) }}
                  </span>
                } @else {
                  <span class="text-xs font-bold text-error">
                    Faltan S/ {{ Math.abs(posService.change()).toFixed(2) }}
                  </span>
                }
              </div>
            </div>
          }

          <!-- 2. DETALLE YAPE / PLIN: QR Y CÓDIGO DE VALIDACIÓN -->
          @if (posService.paymentMethod() === 'yape') {
            <div class="space-y-3 p-4 bg-surface-high/60 rounded-2xl border border-outline-sub text-center">
              <div class="flex flex-col items-center justify-center space-y-1">
                <div class="w-32 h-32 bg-white p-2 rounded-xl border border-outline-sub grid place-items-center shadow-sm">
                  <svg class="w-full h-full text-[#742284]" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="25" height="25" rx="3" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="70" y="5" width="25" height="25" rx="3" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="5" y="70" width="25" height="25" rx="3" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="40" y="15" width="20" height="10" />
                    <rect x="40" y="35" width="20" height="20" />
                    <rect x="15" y="40" width="15" height="15" />
                    <rect x="70" y="40" width="15" height="15" />
                    <rect x="40" y="70" width="20" height="20" />
                    <rect x="70" y="70" width="20" height="20" />
                  </svg>
                </div>
                <div class="text-xs font-mono font-bold text-main mt-0.5">Yape al: {{ posService.yapePhone() }}</div>
                <div class="text-[10px] text-muted">A nombre de: GASTRONOMIA PERU S.A.C.</div>
              </div>

              <m3-text-field 
                variant="filled"
                label="Código de Aprobación (4 dígitos)"
                placeholder="Ej. 8492"
                icon="verified"
                [maxlength]="6"
                [(value)]="posService.yapeCode"
                supportingText="Verificá los 4 dígitos mostrados en el celular del cliente" />
            </div>
          }

          <!-- 3. DETALLE TARJETA POS: CONTACTLESS / CHIP -->
          @if (posService.paymentMethod() === 'card') {
            <div class="space-y-2 p-5 bg-surface-high/60 rounded-2xl border border-outline-sub text-center">
              <div class="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary grid place-items-center animate-pulse">
                <span class="material-symbols-rounded text-2xl">contactless</span>
              </div>
              <div>
                <h4 class="font-bold text-sm text-main">Acercar o Insertar Tarjeta</h4>
                <p class="text-xs text-muted mt-0.5">Terminal inalámbrico Izipay / Niubiz sincronizado</p>
              </div>
              <div class="text-[10px] font-mono text-muted bg-surface-box p-1.5 rounded-lg border border-outline-sub">
                Terminal ID: POS-TID-88491 • Acepta Visa, Mastercard, Amex
              </div>
            </div>
          }
        </div>

        <!-- BOTÓN FINAL DE CONFIRMACIÓN -->
        <div class="pt-3 border-t border-outline-sub flex items-center justify-end gap-2.5 mt-3">
          <m3-button variant="text" (action)="posService.closeCheckout()">
            Cancelar
          </m3-button>
          <m3-button 
            variant="filled" 
            size="lg" 
            icon="check_circle"
            [disabled]="!posService.isPaymentValid()"
            customClass="rounded-full px-5"
            (action)="posService.completeSale()">
            Confirmar y Emitir Comprobante
          </m3-button>
        </div>
      </div>
    }

    <!-- =========================================================================
         MODAL 2: TICKET TÉRMICO EMITIDO (IMPRESIÓN FÍSICA ESC/POS)
         ========================================================================= -->
    @if (posService.isReceiptOpen() && posService.lastCompletedSale(); as sale) {
      <div (click)="posService.newSale()" class="fixed -inset-10 min-h-screen min-w-screen bg-black/65 backdrop-blur-md z-40 m3-dialog-backdrop cursor-pointer"></div>

      <div class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[400px] h-fit max-h-[calc(100vh-3rem)] bg-white text-zinc-900 border border-zinc-300 p-6 rounded-3xl shadow-2xl z-50 overflow-y-auto font-mono text-xs space-y-3.5 m3-dialog-surface">
        
        <!-- CABECERA DE TICKET FISCAL -->
        <div class="text-center space-y-0.5 border-b border-dashed border-zinc-400 pb-2.5">
          <div class="text-sm font-black tracking-tight">EXPRESSIVE CAFÉ & BISTRO</div>
          <div class="text-[10px]">R.U.C. 20601234567</div>
          <div class="text-[10px]">Av. Larco 450, Miraflores - Lima</div>
          <div class="text-[10px] font-bold mt-1">
            {{ sale.voucherType === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA' }}
          </div>
          <div class="text-xs font-black">{{ sale.saleId }}</div>
        </div>

        <!-- METADATOS DE VENTA -->
        <div class="space-y-0.5 border-b border-dashed border-zinc-400 pb-2 text-[10px]">
          <div class="flex justify-between">
            <span>FECHA: {{ sale.date | date:'dd/MM/yyyy HH:mm' }}</span>
            <span>CAJA: 01</span>
          </div>
          <div class="flex justify-between">
            <span>CLIENTE: {{ sale.customer.name }}</span>
          </div>
          <div class="flex justify-between">
            <span>{{ sale.customer.docType }}: {{ sale.customer.docNumber }}</span>
            <span>CANAL: {{ posService.serviceChannel() === 'dine-in' ? posService.tableNumber() : (posService.serviceChannel() === 'takeaway' ? 'Llevar' : 'Delivery') }}</span>
          </div>
        </div>

        <!-- TABLA DE PRODUCTOS -->
        <div class="space-y-1 border-b border-dashed border-zinc-400 pb-2">
          <div class="flex justify-between font-bold text-[9px] uppercase text-zinc-600">
            <span class="w-6">CANT</span>
            <span class="flex-1">DESCRIPCIÓN</span>
            <span class="w-14 text-right">TOTAL</span>
          </div>
          @for (item of sale.items; track item.product.id) {
            <div class="flex justify-between text-[10px]">
              <span class="w-6 font-bold">{{ item.quantity }}</span>
              <span class="flex-1 truncate pr-2">{{ item.product.name }}</span>
              <span class="w-14 text-right">S/ {{ (item.product.price * item.quantity).toFixed(2) }}</span>
            </div>
          }
        </div>

        <!-- TOTALES Y DESGLOSE SUNAT -->
        <div class="space-y-0.5 text-[10px]">
          <div class="flex justify-between">
            <span>OP. GRAVADA:</span>
            <span>S/ {{ sale.subtotal.toFixed(2) }}</span>
          </div>
          @if (sale.discount > 0) {
            <div class="flex justify-between font-bold">
              <span>DESCUENTO:</span>
              <span>- S/ {{ sale.discount.toFixed(2) }}</span>
            </div>
          }
          <div class="flex justify-between">
            <span>I.G.V. (18%):</span>
            <span>S/ {{ sale.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm font-black pt-1 border-t border-zinc-400">
            <span>TOTAL A PAGAR:</span>
            <span>S/ {{ sale.total.toFixed(2) }}</span>
          </div>

          <!-- FORMA DE PAGO -->
          <div class="pt-1.5 border-t border-dashed border-zinc-400 space-y-0.5 text-[9px] text-zinc-700">
            <div class="flex justify-between">
              <span>FORMA DE PAGO:</span>
              <span class="uppercase font-bold">{{ sale.paymentMethod }}</span>
            </div>
            @if (sale.paymentMethod === 'cash') {
              <div class="flex justify-between">
                <span>IMPORTE RECIBIDO:</span>
                <span>S/ {{ sale.cashReceived?.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold">
                <span>VUELTO:</span>
                <span>S/ {{ sale.change?.toFixed(2) }}</span>
              </div>
            }
            @if (sale.paymentMethod === 'yape') {
              <div class="flex justify-between">
                <span>CÓD. OPERACIÓN:</span>
                <span>{{ sale.yapeCode }}</span>
              </div>
            }
          </div>
        </div>

        <!-- PIE DE TICKET SUNAT CON REPRESENTACIÓN QR -->
        <div class="text-center pt-1.5 space-y-0.5 text-[9px] text-zinc-600 border-t border-dashed border-zinc-400">
          <div>Representación impresa de Comprobante Electrónico</div>
          <div>Autorizado mediante Resolución de Superintendencia SUNAT</div>
          <div class="font-bold">¡GRACIAS POR SU COMPRA!</div>
        </div>

        <!-- BOTONES DE ACCIÓN: IMPRIMIR Y NUEVA VENTA -->
        <div class="pt-3 border-t border-zinc-300 flex items-center justify-between gap-2.5">
          <button 
            type="button" 
            (click)="printReceipt()" 
            class="btn-m3 flex-1 py-2 rounded-full bg-zinc-800 hover:bg-zinc-950 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-xs">
            <span class="material-symbols-rounded text-sm">print</span>
            <span>Imprimir</span>
          </button>
          <button 
            type="button" 
            (click)="posService.newSale()" 
            class="btn-m3 flex-1 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-xs">
            <span class="material-symbols-rounded text-sm">add_shopping_cart</span>
            <span>Nueva Venta</span>
          </button>
        </div>

      </div>
    }

    <!-- =========================================================================
         MODAL 3: EDICIÓN DE CLIENTE (PERSONA DNI VS EMPRESA RUC)
         ========================================================================= -->
    @if (isCustomerModalOpen) {
      <div (click)="toggleCustomerModal(false)" class="fixed -inset-10 min-h-screen min-w-screen bg-black/65 backdrop-blur-md z-40 m3-dialog-backdrop cursor-pointer"></div>

      <div class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[460px] h-fit max-h-[calc(100vh-3rem)] bg-surface-box border border-outline-sub p-6 rounded-3xl shadow-2xl z-50 space-y-4 m3-dialog-surface">
        <div class="flex items-center justify-between pb-2.5 border-b border-outline-sub">
          <h3 class="font-bold text-base text-main">Identificación del Cliente</h3>
          <button 
            type="button"
            (click)="toggleCustomerModal(false)" 
            class="btn-m3 p-1 rounded-full text-muted hover:text-main cursor-pointer active:scale-95 transition-all">
            <span class="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-1.5 p-1 bg-surface-high rounded-full border border-outline-sub">
            <button 
              type="button"
              (click)="setCustomerType('DNI')"
              [class]="editCustomerDocType === 'DNI' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 py-2 rounded-full text-xs cursor-pointer transition-colors active:scale-95">
              Persona Natural (DNI)
            </button>
            <button 
              type="button"
              (click)="setCustomerType('RUC')"
              [class]="editCustomerDocType === 'RUC' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
              class="btn-m3 py-2 rounded-full text-xs cursor-pointer transition-colors active:scale-95">
              Empresa Jurídica (RUC)
            </button>
          </div>

          <m3-text-field 
            variant="filled"
            [label]="editCustomerDocType === 'RUC' ? 'RUC de la Empresa (11 dígitos)' : 'DNI del Cliente (8 dígitos)'"
            [placeholder]="editCustomerDocType === 'RUC' ? '20601234567' : '72345678'"
            icon="badge"
            [maxlength]="editCustomerDocType === 'RUC' ? 11 : 8"
            [(value)]="editCustomerDocNumber" />

          <m3-text-field 
            variant="filled"
            [label]="editCustomerDocType === 'RUC' ? 'Razón Social' : 'Nombre Completo'"
            [placeholder]="editCustomerDocType === 'RUC' ? 'CORPORACIÓN ALIMENTARIA S.A.C.' : 'Carlos Mendoza Rojas'"
            icon="person"
            [(value)]="editCustomerName" />
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-outline-sub">
          <m3-button variant="text" (action)="toggleCustomerModal(false)">Cancelar</m3-button>
          <m3-button variant="filled" icon="check" customClass="rounded-full px-5" (action)="saveCustomer()">Guardar Cliente</m3-button>
        </div>
      </div>
    }

    <!-- =========================================================================
         MODAL 4: AYUDA DE ATAJOS DE TECLADO EMPRESARIALES
         ========================================================================= -->
    @if (isShortcutsModalOpen) {
      <div (click)="toggleShortcutsModal(false)" class="fixed -inset-10 min-h-screen min-w-screen bg-black/65 backdrop-blur-md z-40 m3-dialog-backdrop cursor-pointer"></div>

      <div class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[420px] h-fit max-h-[calc(100vh-3rem)] bg-surface-box border border-outline-sub p-6 rounded-3xl shadow-2xl z-50 space-y-4 m3-dialog-surface">
        <div class="flex items-center justify-between pb-2.5 border-b border-outline-sub">
          <div class="flex items-center gap-2">
            <span class="material-symbols-rounded text-primary text-xl">keyboard</span>
            <h3 class="font-bold text-base text-main">Atajos de Teclado POS</h3>
          </div>
          <button 
            type="button"
            (click)="toggleShortcutsModal(false)" 
            class="btn-m3 p-1 rounded-full text-muted hover:text-main cursor-pointer">
            <span class="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-high">
            <span class="font-medium text-main">Enfocar buscador o lector de barras</span>
            <kbd class="px-2.5 py-0.5 rounded-md bg-surface-box border border-outline-sub font-mono font-bold">F2</kbd>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-high">
            <span class="font-medium text-main">Identificar Cliente / Empresa (RUC/DNI)</span>
            <kbd class="px-2.5 py-0.5 rounded-md bg-surface-box border border-outline-sub font-mono font-bold">F4</kbd>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-high">
            <span class="font-medium text-main">Abrir Pasarela de Cobro</span>
            <kbd class="px-2.5 py-0.5 rounded-md bg-surface-box border border-outline-sub font-mono font-bold">Ctrl + Enter</kbd>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-high">
            <span class="font-medium text-main">Cerrar modales o cancelar</span>
            <kbd class="px-2.5 py-0.5 rounded-md bg-surface-box border border-outline-sub font-mono font-bold">Esc</kbd>
          </div>
        </div>

        <div class="pt-2 border-t border-outline-sub text-right">
          <m3-button variant="filled" customClass="rounded-full px-5" (action)="toggleShortcutsModal(false)">Entendido</m3-button>
        </div>
      </div>
    }

    <!-- =========================================================================
         MODAL 5: PERSONALIZACIÓN GASTRONÓMICA REESTRUCTURADA (FOTO COMPLETA + M3 SURFACE)
         ========================================================================= -->
    @if (customizingProduct) {
      <div (click)="closeCustomizeModal()" class="fixed -inset-10 min-h-screen min-w-screen bg-black/65 backdrop-blur-md z-40 m3-dialog-backdrop cursor-pointer"></div>

      <div class="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-[520px] h-fit max-h-[92vh] bg-surface-box border border-outline-sub rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col m3-dialog-surface">
        
        <!-- 1. VITRINA FOTOGRÁFICA HERO (100% VISIBLE, SIN TEXTOS ENCIMA QUE TAPEN EL PRODUCTO) -->
        <div class="relative w-full h-64 sm:h-72 bg-zinc-950 overflow-hidden shrink-0">
          <img 
            [src]="customizingProduct.imageUrl" 
            [alt]="customizingProduct.name" 
            class="w-full h-full object-cover object-center transition-transform duration-500 ease-out hover:scale-105" />
          
          <!-- Sutil gradiente solo en la parte superior para dar contraste a los botones flotantes -->
          <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

          <!-- Chip de categoría flotante superior izquierdo -->
          <div class="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20 shadow-md">
            <span class="material-symbols-rounded text-sm text-primary">{{ customizingProduct.icon }}</span>
            <span>{{ customizingProduct.categoryLabel }}</span>
          </div>

          <!-- Botón cerrar flotante superior derecho -->
          <button 
            type="button"
            (click)="closeCustomizeModal()" 
            title="Cerrar personalización"
            class="btn-m3 absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-white grid place-items-center cursor-pointer border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md">
            <span class="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <!-- 2. IDENTIFICACIÓN Y PRECIO DEL PRODUCTO (SEPARADO, NÍTIDO Y CON ELEVADA LEGIBILIDAD) -->
        <div class="px-6 pt-4 pb-3 border-b border-outline-sub bg-surface-box shrink-0">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
                  {{ customizingProduct.sku }}
                </span>
                <span class="text-xs text-muted/60">•</span>
                <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {{ customizingProduct.stock }} disponibles
                </span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-main tracking-tight leading-tight">
                {{ customizingProduct.name }}
              </h3>
              <p class="text-xs text-muted leading-relaxed line-clamp-1">
                {{ customizingProduct.description }}
              </p>
            </div>

            <div class="text-right shrink-0">
              <span class="text-[10px] font-mono text-muted uppercase font-bold tracking-wider block">Total Receta</span>
              <div class="text-2xl sm:text-3xl font-mono font-black text-primary tracking-tight leading-none mt-1">
                S/ {{ calculatedModalPrice.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 3. CUERPO SCROLLABLE DE MODIFICADORES Y OPCIONES -->
        <div class="p-6 space-y-4 overflow-y-auto m3-scrollbar max-h-[calc(88vh-23rem)]">
          <!-- SECCIÓN A: BASE O TIPO (SINGLE SELECTION) -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-main block uppercase tracking-wide">
              {{ customizingProduct.category === 'coffee' ? 'Seleccionar Tipo de Leche / Base' : (customizingProduct.category === 'sandwiches' ? 'Seleccionar Tipo de Pan' : 'Presentación') }}
            </label>
            <div class="grid grid-cols-2 gap-2">
              @for (base of getBaseOptionsFor(customizingProduct.category); track base.id) {
                <button 
                  type="button"
                  (click)="selectedBaseOption = base.label"
                  [class]="selectedBaseOption === base.label ? 'bg-primary text-on-primary font-bold shadow-xs border-primary' : 'bg-surface-high hover:bg-surface-highest text-main border-outline-sub'"
                  class="btn-m3 py-2 px-3 rounded-xl border text-xs text-left flex items-center justify-between cursor-pointer transition-colors active:scale-95">
                  <span class="truncate">{{ base.name }}</span>
                  <span class="font-mono text-[11px] opacity-85 shrink-0 ml-1">{{ base.extraPrice > 0 ? '+S/ ' + base.extraPrice.toFixed(2) : 'Incl.' }}</span>
                </button>
              }
            </div>
          </div>

          <!-- SECCIÓN B: EXTRAS Y ADICIONALES (MULTI SELECTION) -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-main block uppercase tracking-wide">
              Extras y Adicionales
            </label>
            <div class="flex flex-wrap gap-2">
              @for (extra of getExtrasFor(customizingProduct.category); track extra.id) {
                <button 
                  type="button"
                  (click)="toggleExtra(extra.label)"
                  [class]="isExtraSelected(extra.label) ? 'bg-primary-box text-on-primary-box border-primary font-bold shadow-xs' : 'bg-surface-high hover:bg-surface-highest text-main border-outline-sub'"
                  class="btn-m3 py-1.5 px-3 rounded-full border text-xs flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95">
                  <span class="material-symbols-rounded text-sm font-bold">
                    {{ isExtraSelected(extra.label) ? 'check' : 'add' }}
                  </span>
                  <span>{{ extra.name }}</span>
                  @if (extra.extraPrice > 0) {
                    <span class="font-mono text-[11px] font-bold opacity-80">(+S/ {{ extra.extraPrice.toFixed(2) }})</span>
                  }
                </button>
              }
            </div>
          </div>

          <!-- SECCIÓN C: INDICACIONES PARA COCINA O BARRA -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-main block uppercase tracking-wide">
              Indicaciones para Cocina / Barra
            </label>
            <div class="relative">
              <span class="material-symbols-rounded absolute left-3 top-2.5 text-base text-muted pointer-events-none">edit_note</span>
              <input 
                type="text"
                [(ngModel)]="customizeNotes"
                placeholder="Ej. Sin azúcar, bien caliente, salsa aparte..."
                class="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-high border border-outline-sub text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
            </div>
          </div>
        </div>

        <!-- 4. FOOTER DE ACCIONES AGRUPADAS (M3 ACTION ROW: CANCELAR & AÑADIR A LA DERECHA) -->
        <div class="p-4 bg-surface-high/60 border-t border-outline-sub flex items-center justify-end gap-3 shrink-0 rounded-b-3xl">
          <button 
            type="button"
            (click)="closeCustomizeModal()" 
            class="btn-m3 py-2 px-4 rounded-full text-xs font-bold text-muted hover:text-main hover:bg-surface-highest transition-colors cursor-pointer active:scale-95">
            Cancelar
          </button>
          <button 
            type="button"
            (click)="addCustomizedToCart()"
            class="btn-m3 py-2.5 px-5 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all">
            <span class="material-symbols-rounded text-base font-bold">shopping_bag</span>
            <span>Añadir a Comanda (S/ {{ calculatedModalPrice.toFixed(2) }})</span>
          </button>
        </div>
      </div>
    }
  `
})
export class PosComponent {
  readonly posService = inject(PosService);
  readonly themeService = inject(ThemeService);

  readonly Math = Math;

  imageFailed: Record<number, boolean> = {};

  isCustomerModalOpen = false;
  isShortcutsModalOpen = false;
  editCustomerDocType: 'DNI' | 'RUC' = 'DNI';
  editCustomerDocNumber = '';
  editCustomerName = '';

  // Estado de personalización y modificadores estilo boutique
  customizingProduct: PosProduct | null = null;
  selectedBaseOption = '';
  selectedExtras: string[] = [];
  customizeNotes = '';



  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      event.preventDefault();
      const el = document.querySelector('#pos-search-input input') as HTMLInputElement | null;
      el?.focus();
    } else if (event.key === 'F4') {
      event.preventDefault();
      this.toggleCustomerModal(!this.isCustomerModalOpen);
    } else if (event.key === 'Escape') {
      if (this.customizingProduct) this.closeCustomizeModal();
      if (this.isCustomerModalOpen) this.toggleCustomerModal(false);
      if (this.isShortcutsModalOpen) this.toggleShortcutsModal(false);
      if (this.posService.isCheckoutOpen()) this.closeCheckoutModal();
      if (this.posService.isReceiptOpen()) this.posService.isReceiptOpen.set(false);
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      if (!this.posService.isCheckoutOpen() && this.posService.cart().length > 0) {
        this.openCheckoutModal();
      }
    }
  }

  openCustomizeModal(product: PosProduct): void {
    this.customizingProduct = product;
    const bases = this.getBaseOptionsFor(product.category);
    this.selectedBaseOption = bases.length > 0 ? bases[0].label : '';
    this.selectedExtras = [];
    this.customizeNotes = '';
  }

  closeCustomizeModal(): void {
    this.customizingProduct = null;
  }

  openCheckoutModal(): void {
    this.posService.openCheckout();
  }

  closeCheckoutModal(): void {
    this.posService.closeCheckout();
  }

  toggleExtra(extraLabel: string): void {
    const idx = this.selectedExtras.indexOf(extraLabel);
    if (idx >= 0) {
      this.selectedExtras.splice(idx, 1);
    } else {
      this.selectedExtras.push(extraLabel);
    }
  }

  isExtraSelected(extraLabel: string): boolean {
    return this.selectedExtras.includes(extraLabel);
  }

  getBaseOptionsFor(category: string): { id: string; name: string; label: string; extraPrice: number }[] {
    if (category === 'coffee') {
      return [
        { id: 'whole', name: 'Leche Entera', label: 'Leche Entera (Std)', extraPrice: 0 },
        { id: 'lactose_free', name: 'Deslactosada', label: 'Deslactosada (+S/ 1.00)', extraPrice: 1.00 },
        { id: 'oat', name: 'Leche de Avena', label: 'Leche de Avena (+S/ 2.50)', extraPrice: 2.50 },
        { id: 'almond', name: 'Almendras', label: 'Leche de Almendras (+S/ 2.50)', extraPrice: 2.50 }
      ];
    } else if (category === 'sandwiches') {
      return [
        { id: 'ciabatta', name: 'Pan Ciabatta', label: 'Pan Ciabatta (Std)', extraPrice: 0 },
        { id: 'sourdough', name: 'Masa Madre', label: 'Masa Madre (+S/ 1.50)', extraPrice: 1.50 },
        { id: 'brioche', name: 'Pan Brioche', label: 'Pan Brioche (+S/ 2.00)', extraPrice: 2.00 },
        { id: 'integral', name: 'Pan Integral', label: 'Pan Integral (+S/ 1.00)', extraPrice: 1.00 }
      ];
    } else {
      return [
        { id: 'standard', name: 'Porción Normal', label: 'Porción Estándar (Std)', extraPrice: 0 },
        { id: 'warmed', name: 'Calentar al Horno', label: 'Calentar al Horno (Std)', extraPrice: 0 }
      ];
    }
  }

  getExtrasFor(category: string): { id: string; name: string; label: string; extraPrice: number }[] {
    if (category === 'coffee') {
      return [
        { id: 'extra_shot', name: 'Extra Shot', label: 'Extra Shot (+S/ 3.00)', extraPrice: 3.00 },
        { id: 'vanilla', name: 'Jarabe Vainilla', label: 'Jarabe Vainilla (+S/ 1.50)', extraPrice: 1.50 },
        { id: 'no_sugar', name: 'Sin Azúcar', label: 'Sin Azúcar', extraPrice: 0 },
        { id: 'hot', name: 'Bien Caliente', label: 'Bien Caliente', extraPrice: 0 }
      ];
    } else if (category === 'sandwiches') {
      return [
        { id: 'extra_cheese', name: 'Queso Extra', label: 'Queso Extra (+S/ 3.00)', extraPrice: 3.00 },
        { id: 'toasted', name: 'Doble Tostado', label: 'Doble Tostado', extraPrice: 0 },
        { id: 'no_onion', name: 'Sin Cebolla', label: 'Sin Cebolla', extraPrice: 0 },
        { id: 'sauce_aside', name: 'Salsas Aparte', label: 'Salsas Aparte', extraPrice: 0 }
      ];
    } else {
      return [
        { id: 'to_share', name: 'Para Compartir', label: 'Para Compartir', extraPrice: 0 },
        { id: 'ice', name: 'Con Hielo', label: 'Con Hielo', extraPrice: 0 },
        { id: 'eco', name: 'Empaque Llevar', label: 'Empaque Para Llevar', extraPrice: 0 }
      ];
    }
  }

  get calculatedModalPrice(): number {
    if (!this.customizingProduct) return 0;
    let total = this.customizingProduct.price;
    const baseOpt = this.getBaseOptionsFor(this.customizingProduct.category).find(b => b.label === this.selectedBaseOption);
    if (baseOpt) total += baseOpt.extraPrice;

    const extras = this.getExtrasFor(this.customizingProduct.category);
    for (const label of this.selectedExtras) {
      const found = extras.find(e => e.label === label);
      if (found) total += found.extraPrice;
    }
    return total;
  }

  addCustomizedToCart(): void {
    if (!this.customizingProduct) return;
    const parts: string[] = [];
    if (this.selectedBaseOption && !this.selectedBaseOption.includes('(Std)')) {
      const baseOpt = this.getBaseOptionsFor(this.customizingProduct.category).find(b => b.label === this.selectedBaseOption);
      if (baseOpt) parts.push(baseOpt.name);
    }
    for (const label of this.selectedExtras) {
      const found = this.getExtrasFor(this.customizingProduct.category).find(e => e.label === label);
      if (found) parts.push(found.name);
    }
    if (this.customizeNotes.trim()) {
      parts.push(`"${this.customizeNotes.trim()}"`);
    }
    const notes = parts.join(' • ');

    this.posService.addToCartWithNotes(this.customizingProduct, notes);
    this.closeCustomizeModal();
  }

  getCategoryTheme(cat: string): { bg: string; text: string; border: string } {
    switch (cat) {
      case 'coffee':
        return {
          bg: 'bg-amber-500/15',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-500/30'
        };
      case 'sandwiches':
        return {
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-500/30'
        };
      case 'pastries':
        return {
          bg: 'bg-rose-500/15',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-500/30'
        };
      case 'drinks':
      default:
        return {
          bg: 'bg-sky-500/15',
          text: 'text-sky-700 dark:text-sky-300',
          border: 'border-sky-500/30'
        };
    }
  }

  setChannel(channel: 'dine-in' | 'takeaway' | 'delivery'): void {
    this.posService.serviceChannel.set(channel);
  }

  toggleShortcutsModal(open: boolean): void {
    this.isShortcutsModalOpen = open;
  }

  onCashInput(val: string): void {
    const num = parseFloat(val);
    this.posService.cashReceived.set(isNaN(num) ? 0 : num);
  }

  toggleCustomerModal(open: boolean): void {
    if (open) {
      const current = this.posService.customer();
      this.editCustomerDocType = current.docType;
      this.editCustomerDocNumber = current.docNumber;
      this.editCustomerName = current.name;
    }
    this.isCustomerModalOpen = open;
  }

  setCustomerType(type: 'DNI' | 'RUC'): void {
    this.editCustomerDocType = type;
    if (type === 'RUC' && this.editCustomerDocNumber.length <= 8) {
      this.editCustomerDocNumber = '20601234567';
      this.editCustomerName = 'EMPRESA GASTRONOMICA S.A.C.';
    } else if (type === 'DNI' && this.editCustomerDocNumber.length > 8) {
      this.editCustomerDocNumber = '72345678';
      this.editCustomerName = 'Carlos Mendoza Rojas';
    }
  }

  saveCustomer(): void {
    const name = this.editCustomerName.trim() || 'Clientes Varios';
    const docNumber = this.editCustomerDocNumber.trim() || '00000000';
    this.posService.setCustomer({
      docType: this.editCustomerDocType,
      docNumber,
      name,
      isCompany: this.editCustomerDocType === 'RUC'
    });
    this.toggleCustomerModal(false);
  }

  printReceipt(): void {
    window.print();
  }
}
