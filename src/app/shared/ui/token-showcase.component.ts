import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdaptiveLayoutService } from '../../core/layout/adaptive-layout.service';
import { M3ButtonComponent } from '../components/button/button.component';
import { M3CardComponent } from '../components/card/card.component';
import { M3ChipComponent } from '../components/chip/chip.component';
import { M3TextFieldComponent } from '../components/text-field/text-field.component';
import { M3CircularProgressComponent, M3LinearProgressComponent, M3LoadingIndicatorComponent } from '../components/progress';

@Component({
  selector: 'app-token-showcase',
  standalone: true,
  imports: [
    M3ButtonComponent, 
    M3CardComponent, 
    M3ChipComponent, 
    M3TextFieldComponent, 
    M3LinearProgressComponent, 
    M3CircularProgressComponent,
    M3LoadingIndicatorComponent,
    FormsModule
  ],
  host: {
    class: 'block col-span-1 lg:col-span-12'
  },
  template: `
    <div class="space-y-4 pt-2">
      <!-- SELECTOR DE PASO / TAB -->
      <div class="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-outline-sub">
        <div class="flex items-center gap-2">

         <button 
            (click)="activeTab.set('styles')"
            [class]="activeTab() === 'styles' 
              ? 'bg-primary text-on-primary font-bold shadow-xs' 
              : 'bg-surface-box text-muted hover:text-main'"
            class="btn-m3 px-4 py-2 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-rounded text-sm">palette</span>
            Paso 1: Styles
          </button>

            <button 
            (click)="activeTab.set('foundations')"
            [class]="activeTab() === 'foundations' 
              ? 'bg-primary text-on-primary font-bold shadow-xs' 
              : 'bg-surface-box text-muted hover:text-main'"
            class="btn-m3 px-4 py-2 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-rounded text-sm">touch_app</span>
            Paso 2: Foundations
          </button>

          <button 
            (click)="activeTab.set('components')"
            [class]="activeTab() === 'components' 
              ? 'bg-primary text-on-primary font-bold shadow-xs' 
              : 'bg-surface-box text-muted hover:text-main'"
            class="btn-m3 px-4 py-2 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-rounded text-sm">widgets</span>
            Paso 3: Components (80/20)
          </button>

          <button 
            (click)="activeTab.set('motion')"
            [class]="activeTab() === 'motion' 
              ? 'bg-primary text-on-primary font-bold shadow-xs' 
              : 'bg-surface-box text-muted hover:text-main'"
            class="btn-m3 px-4 py-2 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-rounded text-sm">animation</span>
            Paso 4: Motion & Transitions
          </button>

        </div>

        <div class="text-xs text-muted flex items-center gap-2">
          <span>Clase de ventana:</span>
          <span class="px-2.5 py-0.5 rounded-full bg-surface-high font-mono font-bold text-main">
            {{ layoutService.windowSizeClass().toUpperCase() }} ({{ layoutService.windowWidth() }}px)
          </span>
        </div>
      </div>

      <!-- VISTA PASO 3: COMPONENTS (BOTONES CANÓNICOS M3 Y VARIACIONES) -->
      @if (activeTab() === 'components') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 1. LAS 5 VARIANTES CANÓNICAS -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">smart_button</span>
                Components • Jerarquía Visual
              </div>
              <h3 class="text-title-md font-bold text-main">Las 5 Variantes Canónicas</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Tokens de superficie y roles semánticos según el nivel de énfasis requerido.
              </p>
            </div>

            <div class="flex flex-col gap-3 pt-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">1. Filled (High)</span>
                <m3-button variant="filled" icon="add" (action)="incrementClicks()">
                  Filled Button
                </m3-button>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">2. Tonal (Medium-High)</span>
                <m3-button variant="tonal" icon="edit" (action)="incrementClicks()">
                  Tonal Button
                </m3-button>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">3. Elevated (Depth)</span>
                <m3-button variant="elevated" icon="cloud_upload" (action)="incrementClicks()">
                  Elevated Button
                </m3-button>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">4. Outlined (Border)</span>
                <m3-button variant="outlined" icon="tune" (action)="incrementClicks()">
                  Outlined Button
                </m3-button>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">5. Text (Low)</span>
                <m3-button variant="text" icon="close" (action)="incrementClicks()">
                  Text Button
                </m3-button>
              </div>
            </div>

            <div class="pt-3 border-t border-outline-sub flex items-center justify-between text-xs text-muted">
              <span>Clics registrados:</span>
              <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high">
                {{ buttonClicks() }}
              </span>
            </div>
          </div>

          <!-- 2. TAMAÑOS Y SHAPE MORPHING EXPRESIVO -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">animation</span>
                Components • Expresión y Escala
              </div>
              <h3 class="text-title-md font-bold text-main">Tamaños y Shape Morphing</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Escala dimensional estándar (32px, 40px, 48px) y transiciones elásticas en hover.
              </p>
            </div>

            <div class="space-y-4 pt-1">
              <!-- Small -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">Small (32px)</span>
                <m3-button size="sm" variant="tonal" icon="star" (action)="incrementClicks()">
                  Small Button
                </m3-button>
              </div>

              <!-- Medium (Standard) -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">Medium (40px)</span>
                <m3-button size="md" variant="filled" icon="check_circle" (action)="incrementClicks()">
                  Medium Standard
                </m3-button>
              </div>

              <!-- Large -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted font-mono">Large (48px)</span>
                <m3-button size="lg" variant="elevated" icon="rocket_launch" (action)="incrementClicks()">
                  Large Button
                </m3-button>
              </div>

              <!-- Expressive Shape Morphing -->
              <div class="p-3 bg-surface-high rounded-m3-lg border border-outline-sub space-y-2">
                <span class="text-xs font-semibold text-main block">Expressive Morphing Hover</span>
                <p class="text-[11px] text-muted">Pasa el mouse: el radio muta de píldora a squircle sin saltos de layout:</p>
                <div class="flex items-center justify-center pt-1">
                  <m3-button variant="filled" [morph]="true" icon="auto_awesome" (action)="incrementClicks()">
                    Pasa el cursor sobre mí
                  </m3-button>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm text-primary">info</span>
              <span>48px mantiene la escala táctil WCAG AAA.</span>
            </div>
          </div>

          <!-- 3. ESTADOS REACTIVOS E ICON-ONLY -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">toggle_on</span>
                Components • Estados y Variaciones
              </div>
              <h3 class="text-title-md font-bold text-main">Loading, Disabled & Icon-Only</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Control dinámico de feedback sin romper el ancho de las cajas.
              </p>
            </div>

            <div class="space-y-4 pt-1">
              <!-- Toggles de estado -->
              <div class="flex items-center gap-2 pb-2">
                <button 
                  (click)="buttonLoading.update(v => !v)"
                  [class]="buttonLoading() ? 'bg-primary text-on-primary font-bold' : 'bg-surface-high text-muted'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">progress_activity</span>
                  {{ buttonLoading() ? 'Cargando: SÍ' : 'Cargando: NO' }}
                </button>

                <button 
                  (click)="buttonDisabled.update(v => !v)"
                  [class]="buttonDisabled() ? 'bg-primary text-on-primary font-bold' : 'bg-surface-high text-muted'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">block</span>
                  {{ buttonDisabled() ? 'Deshabilitado: SÍ' : 'Deshabilitado: NO' }}
                </button>
              </div>

              <!-- Botón reactivo que reacciona a los toggles -->
              <div class="flex items-center justify-between p-3 bg-surface-high rounded-m3-lg border border-outline-sub">
                <span class="text-xs text-muted font-mono">Reactivo:</span>
                <m3-button 
                  variant="filled" 
                  icon="send" 
                  [loading]="buttonLoading()" 
                  [disabled]="buttonDisabled()"
                  (action)="incrementClicks()">
                  Enviar Tarea
                </m3-button>
              </div>

              <!-- Icon-Only Buttons -->
              <div class="space-y-2">
                <span class="text-xs font-semibold text-main block">Variantes Icon-Only (Touch Target 48dp)</span>
                <div class="flex items-center justify-around gap-2 p-2 bg-surface-high rounded-m3-lg border border-outline-sub">
                  <m3-button [iconOnly]="true" variant="filled" icon="bookmark" ariaLabel="Guardar" (action)="incrementClicks()" />
                  <m3-button [iconOnly]="true" variant="tonal" icon="share" ariaLabel="Compartir" (action)="incrementClicks()" />
                  <m3-button [iconOnly]="true" variant="elevated" icon="favorite" ariaLabel="Favorito" (action)="incrementClicks()" />
                  <m3-button [iconOnly]="true" variant="outlined" icon="filter_list" ariaLabel="Filtrar" (action)="incrementClicks()" />
                  <m3-button [iconOnly]="true" variant="text" icon="more_vert" ariaLabel="Más opciones" (action)="incrementClicks()" />
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center gap-1.5">
              <span class="material-symbols-rounded text-sm text-primary">verified</span>
              <span>Totalmente encapsulado con <code>currentColor</code>.</span>
            </div>
          </div>

          <!-- 4. LAS 3 VARIANTES DE CARDS M3 -->
          <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub">
            <div class="flex items-center justify-between pb-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base text-primary">view_quilt</span>
                  Components • Superficies de Tarjetas M3
                </div>
                <h3 class="text-title-md font-bold text-main">Las 3 Variantes Canónicas de Cards</h3>
              </div>
              <div class="text-xs text-muted flex items-center gap-1.5">
                <span>Clics en tarjetas:</span>
                <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high">
                  {{ cardClicks() }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- 1. ELEVATED CARD -->
              <m3-card 
                variant="elevated" 
                [interactive]="true" 
                padding="lg"
                (action)="incrementCardClicks()"
                customClass="flex flex-col justify-between min-h-[190px]">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-primary uppercase tracking-wider">Elevated Card</span>
                    <span class="material-symbols-rounded text-lg text-primary">layers</span>
                  </div>
                  <h4 class="text-base font-bold text-main mt-1">Superficie Flotante</h4>
                  <p class="text-xs text-muted mt-1.5 leading-relaxed">
                    Usa <code>surface-container-low</code> con sombra Level 1. Al pasar el cursor escala a Level 2.
                  </p>
                </div>
                <div class="pt-4 flex items-center justify-between text-xs text-muted">
                  <span class="font-mono text-[11px]">elevation: level 1 &rarr; 2</span>
                  <m3-button variant="tonal" size="sm" icon="touch_app" (action)="$event.stopPropagation(); incrementCardClicks()">
                    Acción
                  </m3-button>
                </div>
              </m3-card>

              <!-- 2. FILLED CARD -->
              <m3-card 
                variant="filled" 
                [interactive]="true" 
                padding="lg"
                (action)="incrementCardClicks()"
                customClass="flex flex-col justify-between min-h-[190px] border border-outline-sub">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-muted uppercase tracking-wider">Filled Card</span>
                    <span class="material-symbols-rounded text-lg text-muted">crop_din</span>
                  </div>
                  <h4 class="text-base font-bold text-main mt-1">Contenedor Tonal</h4>
                  <p class="text-xs text-muted mt-1.5 leading-relaxed">
                    Usa <code>surface-container-highest</code>. Proporciona distinción visual plana sin sombras.
                  </p>
                </div>
                <div class="pt-4 flex items-center justify-between text-xs text-muted">
                  <span class="font-mono text-[11px]">elevation: 0dp</span>
                  <m3-button variant="outlined" size="sm" icon="arrow_forward" (action)="$event.stopPropagation(); incrementCardClicks()">
                    Abrir
                  </m3-button>
                </div>
              </m3-card>

              <!-- 3. OUTLINED CARD -->
              <m3-card 
                variant="outlined" 
                [interactive]="true" 
                padding="lg"
                (action)="incrementCardClicks()"
                customClass="flex flex-col justify-between min-h-[190px]">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-muted uppercase tracking-wider">Outlined Card</span>
                    <span class="material-symbols-rounded text-lg text-muted">border_all</span>
                  </div>
                  <h4 class="text-base font-bold text-main mt-1">Límite Estructurado</h4>
                  <p class="text-xs text-muted mt-1.5 leading-relaxed">
                    Fondo <code>surface</code> delimitado por un borde de 1px en <code>outline-variant</code> que resalta en hover.
                  </p>
                </div>
                <div class="pt-4 flex items-center justify-between text-xs text-muted">
                  <span class="font-mono text-[11px]">border: 1px outline</span>
                  <m3-button variant="text" size="sm" icon="open_in_new" (action)="$event.stopPropagation(); incrementCardClicks()">
                    Explorar
                  </m3-button>
                </div>
              </m3-card>
            </div>
          </div>

          <!-- 5. LOS 4 TIPOS CANÓNICOS DE CHIPS M3 -->
          <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub">
            <div class="flex items-center justify-between pb-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base text-primary">label</span>
                  Components • M3 Chips & Filtros
                </div>
                <h3 class="text-title-md font-bold text-main">Los 4 Tipos Canónicos de Chips</h3>
              </div>
              <div class="text-xs text-muted flex items-center gap-1.5">
                <span>Filtro activo:</span>
                <span class="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-surface-high uppercase">
                  {{ demoFilter() }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- 1. Filter Chips -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider block">1. Filter Chips</span>
                  <p class="text-[11px] text-muted mt-0.5">Selección con checkmark y morphing a squircle:</p>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <m3-chip 
                    type="filter" 
                    [selected]="demoFilter() === 'ux'" 
                    count="8"
                    (action)="setDemoFilter('ux')">
                    UX Design
                  </m3-chip>
                  <m3-chip 
                    type="filter" 
                    [selected]="demoFilter() === 'code'" 
                    count="14"
                    (action)="setDemoFilter('code')">
                    Frontend
                  </m3-chip>
                  <m3-chip 
                    type="filter" 
                    [selected]="demoFilter() === 'qa'" 
                    count="3"
                    (action)="setDemoFilter('qa')">
                    Testing
                  </m3-chip>
                </div>
              </div>

              <!-- 2. Assist Chips -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider block">2. Assist Chips</span>
                  <p class="text-[11px] text-muted mt-0.5">Atajos de acción inteligente y disparadores:</p>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <m3-chip type="assist" icon="event" (action)="incrementClicks()">
                    Agendar reunión
                  </m3-chip>
                  <m3-chip type="assist" icon="share" (action)="incrementClicks()">
                    Compartir
                  </m3-chip>
                  <m3-chip type="assist" icon="bookmark" (action)="incrementClicks()">
                    Guardar
                  </m3-chip>
                </div>
              </div>

              <!-- 3. Input Chips -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider block">3. Input Chips</span>
                  <p class="text-[11px] text-muted mt-0.5">Entidades removibles por el usuario:</p>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  @for (tag of inputTags(); track tag) {
                    <m3-chip type="input" [removable]="true" (remove)="removeTag(tag)">
                      {{ tag }}
                    </m3-chip>
                  }
                  @if (inputTags().length === 0) {
                    <button (click)="resetTags()" class="text-xs text-primary font-semibold hover:underline">
                      Restaurar tags
                    </button>
                  }
                </div>
              </div>

              <!-- 4. Suggestion Chips -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider block">4. Suggestion Chips</span>
                  <p class="text-[11px] text-muted mt-0.5">Sugerencias dinámicas del sistema:</p>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <m3-chip type="suggestion" icon="auto_awesome" (action)="incrementClicks()">
                    Resumir con IA
                  </m3-chip>
                  <m3-chip type="suggestion" icon="translate" (action)="incrementClicks()">
                    Traducir
                  </m3-chip>
                </div>
              </div>
            </div>
          </div>

          <!-- 6. M3 TEXT FIELDS / INPUTS (LOS 2 ESTILOS CANÓNICOS: FILLED & OUTLINED) -->
          <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub">
            <div class="flex items-center justify-between pb-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base text-primary">edit_square</span>
                  Components • Campos de Texto M3 (El 4to Pilar)
                </div>
                <h3 class="text-title-md font-bold text-main">Filled & Outlined Text Fields</h3>
                <p class="text-xs text-muted mt-1 leading-relaxed">
                  Floating labels con motion fluido, active indicator expandible, iconografía y soporte para multiline y validación.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- 1. Filled Text Field -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider block">1. Filled (Superficie Tonal)</span>
                  <p class="text-[11px] text-muted mt-0.5">Active indicator de 1px a 2px primario en focus:</p>
                </div>
                <div class="pt-1">
                  <m3-text-field 
                    variant="filled"
                    label="Nombre Completo"
                    placeholder="Ej. Alex Johnson"
                    icon="person"
                    [clearable]="true"
                    [(value)]="demoFilledText"
                    supportingText="Campo con floating label reactivo" />
                </div>
                <div class="text-[11px] font-mono text-muted truncate">
                  Valor: "{{ demoFilledText() }}"
                </div>
              </div>

              <!-- 2. Outlined Text Field -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider block">2. Outlined (Contorno)</span>
                  <p class="text-[11px] text-muted mt-0.5">Borde delimitador de 1px a 2px con contador:</p>
                </div>
                <div class="pt-1">
                  <m3-text-field 
                    variant="outlined"
                    label="Correo Electrónico"
                    placeholder="usuario@dominio.com"
                    icon="mail"
                    [maxlength]="40"
                    [(value)]="demoOutlinedText"
                    supportingText="Formato corporativo requerido" />
                </div>
                <div class="text-[11px] font-mono text-muted truncate">
                  Valor: "{{ demoOutlinedText() || '(vacío)' }}"
                </div>
              </div>

              <!-- 3. Validation & Error State -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-error uppercase tracking-wider block">3. Error / Validación</span>
                  <p class="text-[11px] text-muted mt-0.5">Tokens semánticos de error y trailing icon:</p>
                </div>
                <div class="pt-1">
                  <m3-text-field 
                    variant="filled"
                    label="Contraseña"
                    type="password"
                    icon="lock"
                    [errorText]="demoErrorText() ? 'La clave debe tener al menos 8 caracteres' : null"
                    [(value)]="demoPasswordText"
                    supportingText="Mínimo 8 caracteres" />
                </div>
                <div class="flex items-center justify-between pt-1">
                  <button 
                    (click)="toggleDemoError()" 
                    class="text-[11px] text-primary font-semibold hover:underline cursor-pointer">
                    {{ demoErrorText() ? 'Quitar error' : 'Simular error' }}
                  </button>
                  <span class="text-[11px] font-mono text-muted">
                    {{ demoErrorText() ? 'isError: true' : 'isError: false' }}
                  </span>
                </div>
              </div>

              <!-- 4. Multiline Textarea -->
              <div class="bg-surface-box border border-outline-sub p-4 rounded-m3-lg space-y-3 shadow-xs">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wider block">4. Multiline (Área de Texto)</span>
                  <p class="text-[11px] text-muted mt-0.5">Textarea integrado con contador de caracteres:</p>
                </div>
                <div class="pt-1">
                  <m3-text-field 
                    variant="outlined"
                    label="Descripción de la Tarea"
                    placeholder="Describe los criterios de aceptación..."
                    icon="notes"
                    [multiline]="true"
                    [rows]="3"
                    [maxlength]="120"
                    [(value)]="demoMultilineText"
                    supportingText="Detalles técnicos de arquitectura" />
                </div>
              </div>
            </div>
          </div>

          <!-- 7. M3 PROGRESS INDICATORS & LOADING STATES (LINEAR, CIRCULAR & SKELETON) -->
          <div class="col-span-1 md:col-span-3 pt-6 border-t border-outline-sub">
            <div class="flex items-center justify-between pb-3 flex-wrap gap-2">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-0.5">
                  <span class="material-symbols-rounded text-base text-primary">hourglass_empty</span>
                  Components • Indicadores de Progreso & Carga M3
                </div>
                <h3 class="text-title-md font-bold text-main">Linear & Circular Progress Indicators</h3>
                <p class="text-xs text-muted mt-0.5">
                  Motion expresivo de M3, curvas no-lineales (emphasized decel), tracks con esquinas redondeadas y estados determinate/indeterminate.
                </p>
              </div>

              <!-- Interactive Controls for Progress -->
              <div class="flex items-center gap-2 flex-wrap bg-surface-high p-1.5 rounded-full border border-outline-sub">
                <!-- Mode: Indeterminate vs Determinate -->
                <button
                  (click)="toggleProgressMode()"
                  [class]="demoProgressIndeterminate() ? 'bg-primary text-on-primary' : 'text-muted hover:text-main'"
                  class="btn-m3 text-[11px] font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1">
                  <span class="material-symbols-rounded text-xs">all_inclusive</span>
                  {{ demoProgressIndeterminate() ? 'Indeterminate' : 'Determinate' }}
                </button>

                <!-- Shape: Wavy vs Classic -->
                <button
                  (click)="toggleProgressWavy()"
                  [class]="demoProgressWavy() ? 'bg-primary text-on-primary' : 'text-muted hover:text-main'"
                  class="btn-m3 text-[11px] font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1">
                  <span class="material-symbols-rounded text-xs">waves</span>
                  {{ demoProgressWavy() ? 'Ondas (Wavy)' : 'Recto (Classic)' }}
                </button>

                @if (!demoProgressIndeterminate()) {
                  <div class="flex items-center gap-2 px-2 text-xs text-muted">
                    <span class="font-mono text-[11px]">{{ demoProgressValue() }}%</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      [value]="demoProgressValue()" 
                      (input)="onProgressSliderChange($event)"
                      class="w-24 accent-primary cursor-pointer" />
                  </div>
                }

                <div class="flex items-center gap-1 pl-1 border-l border-outline-sub">
                  <button 
                    (click)="demoProgressColor.set('primary')"
                    [class.ring-2]="demoProgressColor() === 'primary'"
                    class="w-4 h-4 rounded-full bg-primary ring-offset-1 ring-primary transition-all cursor-pointer"
                    title="Primary"></button>
                  <button 
                    (click)="demoProgressColor.set('secondary')"
                    [class.ring-2]="demoProgressColor() === 'secondary'"
                    class="w-4 h-4 rounded-full bg-secondary ring-offset-1 ring-secondary transition-all cursor-pointer"
                    title="Secondary"></button>
                  <button 
                    (click)="demoProgressColor.set('tertiary')"
                    [class.ring-2]="demoProgressColor() === 'tertiary'"
                    class="w-4 h-4 rounded-full bg-tertiary ring-offset-1 ring-tertiary transition-all cursor-pointer"
                    title="Tertiary"></button>
                  <button 
                    (click)="demoProgressColor.set('error')"
                    [class.ring-2]="demoProgressColor() === 'error'"
                    class="w-4 h-4 rounded-full bg-error ring-offset-1 ring-error transition-all cursor-pointer"
                    title="Error"></button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <!-- 1. LINEAR PROGRESS (CANONICAL & EXPRESSIVE) -->
              <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
                <div>
                  <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    <span class="material-symbols-rounded text-base text-primary">linear_scale</span>
                    Linear Progress
                  </div>
                  <h4 class="text-title-sm font-bold text-main">Barras Lineales M3</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">
                    Soporte para modo determinado con stop-dot canónico, buffer y tracking infinito dual-bar.
                  </p>
                </div>

                <div class="space-y-4 pt-1">
                  <!-- Standard Track (4px) -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs">
                      <span class="font-mono text-muted">Estándar (4px)</span>
                      <span class="font-mono text-muted">{{ demoProgressIndeterminate() ? 'Loop' : demoProgressValue() + '%' }}</span>
                    </div>
                    <m3-linear-progress 
                      [value]="demoProgressIndeterminate() ? null : demoProgressValue()"
                      [color]="demoLinearColor()"
                      [wavy]="demoProgressWavy()"
                      size="md" />
                  </div>

                  <!-- Expressive Large Bar (8px) with Buffer -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs">
                      <span class="font-mono text-muted">Expressive Pill (8px) + Buffer</span>
                      <span class="font-mono text-muted">{{ demoProgressIndeterminate() ? 'Dual-bar' : 'Buf ' + demoProgressBuffer() + '%' }}</span>
                    </div>
                    <m3-linear-progress 
                      [value]="demoProgressIndeterminate() ? null : demoProgressValue()"
                      [buffer]="demoProgressIndeterminate() ? null : demoProgressBuffer()"
                      [color]="demoLinearColor()"
                      [wavy]="demoProgressWavy()"
                      size="lg" />
                  </div>

                  <!-- Thin Bar (2px) -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs">
                      <span class="font-mono text-muted">Compact / Subtitle (2px)</span>
                      <span class="font-mono text-muted">sm</span>
                    </div>
                    <m3-linear-progress 
                      [value]="demoProgressIndeterminate() ? null : demoProgressValue()"
                      [color]="demoLinearColor()"
                      [wavy]="demoProgressWavy()"
                      size="sm" />
                  </div>
                </div>

                <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center justify-between">
                  <span>Esquinas: <code>corner-full</code></span>
                  <span class="font-mono font-bold text-primary">role="progressbar"</span>
                </div>
              </div>

              <!-- 2. CIRCULAR PROGRESS (STANDARD & 4-COLOR) -->
              <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
                <div>
                  <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    <span class="material-symbols-rounded text-base text-primary">progress_activity</span>
                    Circular Progress
                  </div>
                  <h4 class="text-title-sm font-bold text-main">Indicadores Circulares</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">
                    Arco SVG de aceleración no-lineal con curvatura de trazo y soporte M3 Four-Color.
                  </p>
                </div>

                <div class="flex items-center justify-around py-3">
                  <!-- Small (24px) -->
                  <div class="flex flex-col items-center gap-2">
                    <m3-circular-progress 
                      size="sm"
                      [value]="demoProgressIndeterminate() ? null : demoProgressValue()"
                      [color]="demoProgressColor()"
                      [wavy]="demoProgressWavy()" />
                    <span class="text-[11px] font-mono text-muted">24px (sm)</span>
                  </div>

                  <!-- Medium Standard (40px) -->
                  <div class="flex flex-col items-center gap-2">
                    <m3-circular-progress 
                      size="md"
                      [value]="demoProgressIndeterminate() ? null : demoProgressValue()"
                      [color]="demoProgressColor()"
                      [wavy]="demoProgressWavy()" />
                    <span class="text-[11px] font-mono text-muted">40px (md)</span>
                  </div>

                  <!-- Large (56px) -->
                  <div class="flex flex-col items-center gap-2">
                    <m3-circular-progress 
                      size="lg"
                      [value]="demoProgressIndeterminate() ? null : demoProgressValue()"
                      [color]="demoProgressColor()"
                      [wavy]="demoProgressWavy()" />
                    <span class="text-[11px] font-mono text-muted">56px (lg)</span>
                  </div>

                  <!-- Four-Color Flagship -->
                  <div class="flex flex-col items-center gap-2">
                    <m3-circular-progress 
                      size="md"
                      [wavy]="demoProgressWavy()"
                      color="four-color" />
                    <span class="text-[11px] font-mono text-primary font-bold">Four-Color</span>
                  </div>
                </div>

                <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center justify-between">
                  <span>Animación: <code>stroke-dasharray</code></span>
                  <span class="font-mono text-muted">GPU 60fps</span>
                </div>
              </div>

              <!-- 3. M3 EXPRESSIVE SKELETON & SHIMMER LOADING -->
              <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                      <span class="material-symbols-rounded text-base text-primary">blur_linear</span>
                      Content Placeholders
                    </div>
                    <button 
                      (click)="toggleSkeleton()"
                      class="text-[11px] text-primary font-bold hover:underline cursor-pointer">
                      {{ demoSkeletonLoaded() ? 'Ver Skeleton' : 'Ver Contenido' }}
                    </button>
                  </div>
                  <h4 class="text-title-sm font-bold text-main">Skeleton Shimmer</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">
                    Gradientes de onda reflectante en OKLCH sin layout-shifts durante la carga.
                  </p>
                </div>

                <div class="p-4 bg-surface-high rounded-m3-lg border border-outline-sub">
                  @if (!demoSkeletonLoaded()) {
                    <!-- Skeleton State -->
                    <div class="space-y-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 m3-skeleton m3-skeleton-circle m3-skeleton-shimmer shrink-0"></div>
                        <div class="space-y-1.5 flex-1">
                          <div class="h-3.5 w-3/4 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                          <div class="h-2.5 w-1/2 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                        </div>
                      </div>
                      <div class="space-y-1.5 pt-1">
                        <div class="h-3 w-full m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                        <div class="h-3 w-4/5 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                      </div>
                    </div>
                  } @else {
                    <!-- Loaded State -->
                    <div class="space-y-3 animate-in fade-in duration-200">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary-box text-on-primary-box flex items-center justify-center font-bold text-sm shrink-0">
                          M3
                        </div>
                        <div class="flex-1 min-w-0">
                          <h5 class="text-sm font-bold text-main truncate">Material 3 Expressive</h5>
                          <p class="text-xs text-muted truncate">Sistema de diseño completado</p>
                        </div>
                      </div>
                      <p class="text-xs text-muted leading-relaxed">
                        Componentes reactivos basados en Signals de Angular, tokens OKLCH y Motion System.
                      </p>
                    </div>
                  }
                </div>

                <div class="pt-3 border-t border-outline-sub text-xs text-muted flex items-center justify-between">
                  <span>Efecto: <code>.m3-skeleton-shimmer</code></span>
                  <span class="text-primary font-mono text-[11px]">Zero Layout Shift</span>
                </div>
              </div>
            </div>

            <!-- 4. M3 EXPRESSIVE SHAPE-MORPHING LOADING INDICATOR & PULL-TO-REFRESH -->
            <div class="mt-6 bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs">
              <div class="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-outline-sub">
                <div>
                  <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    <span class="material-symbols-rounded text-base text-primary">interests</span>
                    Material 3 Expressive • Shape Morphing Loading Indicator
                  </div>
                  <h4 class="text-title-md font-bold text-main">Loading Indicator vs. Progress Indicator</h4>
                  <p class="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                    A diferencia del progreso porcentual, el <strong>Loading Indicator</strong> de M3 Expressive muta orgánicamente su geometría entre pentágono redondeado, squircle, flor de 4 pétalos y círculo, con rotación continua acelerada. Diseñado para <em>Pull-to-refresh</em> y feedback de carga no determinista.
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <m3-button 
                    variant="tonal" 
                    icon="refresh" 
                    (action)="triggerPhotosRefresh()">
                    Simular Pull-to-Refresh
                  </m3-button>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
                <!-- Left: Morphing Showcase Across Sizes & Roles -->
                <div class="lg:col-span-7 space-y-5">
                  <div class="space-y-2">
                    <span class="text-xs font-bold text-main uppercase tracking-wider">Morfología y Escala Dimensional</span>
                    <p class="text-xs text-muted">Interpolación de splines cúbicos acelerada por GPU con cero recálculo de layout:</p>
                  </div>

                  <div class="flex items-center justify-around p-6 bg-surface-high rounded-m3-lg border border-outline-sub">
                    <!-- Small (32px) -->
                    <div class="flex flex-col items-center gap-2.5">
                      <m3-loading-indicator size="sm" [color]="demoProgressColor()" />
                      <span class="text-[11px] font-mono text-muted">sm (32px)</span>
                    </div>

                    <!-- Medium (48px) - Canonical -->
                    <div class="flex flex-col items-center gap-2.5">
                      <m3-loading-indicator size="md" [color]="demoProgressColor()" />
                      <span class="text-[11px] font-mono text-primary font-bold">md (48px) Canónico</span>
                    </div>

                    <!-- Large (64px) - Hero -->
                    <div class="flex flex-col items-center gap-2.5">
                      <m3-loading-indicator size="lg" [color]="demoProgressColor()" />
                      <span class="text-[11px] font-mono text-muted">lg (64px) Hero</span>
                    </div>

                    <!-- Contained / Surface Pill -->
                    <div class="flex flex-col items-center gap-2.5">
                      <m3-loading-indicator size="sm" [contained]="true" [color]="demoProgressColor()" />
                      <span class="text-[11px] font-mono text-muted">Contained Pill</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-3 text-xs text-muted">
                    <div class="p-3 bg-surface rounded-m3-md border border-outline-sub">
                      <span class="font-bold text-main block mb-0.5">1. Pentágono Suave</span>
                      <span class="text-[11px]">5 vértices redondeados con tensión orgánica.</span>
                    </div>
                    <div class="p-3 bg-surface rounded-m3-md border border-outline-sub">
                      <span class="font-bold text-main block mb-0.5">2. Squircle M3</span>
                      <span class="text-[11px]">Transición armónica a curvatura continua.</span>
                    </div>
                    <div class="p-3 bg-surface rounded-m3-md border border-outline-sub">
                      <span class="font-bold text-main block mb-0.5">3. Trébol Floral</span>
                      <span class="text-[11px]">Expansión expresiva de 4 lóbulos simétricos.</span>
                    </div>
                  </div>
                </div>

                <!-- Right: Realistic Photos Mockup Replicating Google M3 Specification -->
                <div class="lg:col-span-5 flex justify-center">
                  <div class="w-72 bg-surface-lowest border-2 border-outline-sub rounded-[36px] p-3 shadow-lg space-y-3 relative overflow-hidden">
                    <!-- Status Bar -->
                    <div class="flex items-center justify-between px-3 text-[11px] font-bold text-muted">
                      <span>9:30</span>
                      <div class="flex items-center gap-1.5">
                        <span class="material-symbols-rounded text-xs">signal_cellular_alt</span>
                        <span class="material-symbols-rounded text-xs">wifi</span>
                        <span class="material-symbols-rounded text-xs">battery_full</span>
                      </div>
                    </div>

                    <!-- App Bar (Photos) -->
                    <div class="flex items-center justify-between px-2 pt-1">
                      <h5 class="text-base font-bold text-main tracking-tight">Photos</h5>
                      <div class="flex items-center gap-2">
                        <button class="p-1 rounded-full text-muted hover:text-main">
                          <span class="material-symbols-rounded text-lg">more_vert</span>
                        </button>
                        <div class="w-7 h-7 rounded-full bg-secondary-box text-on-secondary-box font-bold text-xs flex items-center justify-center">
                          A
                        </div>
                      </div>
                    </div>

                    <!-- App Canvas / Feed Simulation -->
                    <div class="h-48 bg-surface-low rounded-m3-xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-outline-sub/60">
                      @if (demoPhotosRefreshing()) {
                        <!-- Pull-to-refresh shape-morphing active loader -->
                        <div class="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                          <m3-loading-indicator size="md" [color]="demoProgressColor()" />
                          <span class="text-[11px] font-semibold text-muted tracking-wide">Actualizando...</span>
                        </div>
                      } @else {
                        <div class="flex flex-col items-center gap-2 text-center">
                          <span class="material-symbols-rounded text-3xl text-primary">photo_library</span>
                          <span class="text-xs font-bold text-main">Galería al día</span>
                          <span class="text-[11px] text-muted">Toca "Simular Pull-to-Refresh" para ver la animación</span>
                        </div>
                      }
                    </div>

                    <div class="text-center text-[10px] text-muted pb-1">
                      Pull-to-refresh interaction • M3 Expressive
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- VISTA PASO 2: FOUNDATIONS (INTERACCIÓN, STATE LAYERS, TOUCH TARGETS, ADAPTIVE) -->
      @if (activeTab() === 'foundations') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 1. STATE LAYERS & DUAL FOCUS RING -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">layers</span>
                Foundations • Capas de Estado
              </div>
              <h3 class="text-title-md font-bold text-main">Motor Universal State Layer</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Usa <code class="text-primary font-mono text-[11px]">currentColor</code> en <code class="font-mono text-[11px]">::before</code>. Pasa el cursor, mantén presionado o presiona <kbd class="px-1.5 py-0.5 bg-surface-high rounded text-[10px] font-mono">Tab</kbd>.
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex flex-col gap-2">
                <button class="state-layer focus-ring-m3 w-full py-2.5 px-4 rounded-full bg-primary text-on-primary font-semibold text-xs flex items-center justify-between cursor-pointer shadow-xs">
                  <span>Hover 8% • Press 12%</span>
                  <span class="material-symbols-rounded text-base">touch_app</span>
                </button>
                <button class="state-layer focus-ring-m3 w-full py-2.5 px-4 rounded-full bg-sec-box text-on-sec-box font-semibold text-xs flex items-center justify-between cursor-pointer shadow-xs">
                  <span>Secondary Container</span>
                  <span class="material-symbols-rounded text-base">check_circle</span>
                </button>
                <button class="state-layer focus-ring-m3 w-full py-2.5 px-4 rounded-full bg-tertiary-box text-on-tertiary-box font-semibold text-xs flex items-center justify-between cursor-pointer shadow-xs">
                  <span>Tertiary Container</span>
                  <span class="material-symbols-rounded text-base">star</span>
                </button>
              </div>

              <p class="text-[11px] text-muted italic">
                El color de tinta cambia solo; la capa de estado se adapta sin tocar el fondo.
              </p>
            </div>
          </div>

          <!-- 2. TOUCH TARGETS (48x48dp) -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">ads_click</span>
                Foundations • Accesibilidad Táctil
              </div>
              <h3 class="text-title-md font-bold text-main">Touch Target 48×48dp</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                El botón mide solo 28px visuales, pero su área táctil invisible cumple la norma de 48px.
              </p>
            </div>

            <div class="space-y-4">
              <div class="p-4 bg-surface-low rounded-m3-lg border border-outline-sub flex items-center justify-between">
                <div class="relative py-4 px-6 flex items-center justify-center">
                  <!-- Botón compacto de 28px con hitbox de 48px -->
                  <button 
                    (click)="hitboxClicks.update(c => c + 1)"
                    [class.touch-target-debug]="showHitbox()"
                    title="Haz clic incluso alrededor del círculo dentro del recuadro"
                    class="touch-target-48 state-layer focus-ring-m3 w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center cursor-pointer shadow-xs">
                    <span class="material-symbols-rounded text-sm">touch_app</span>
                  </button>

                  @if (showHitbox()) {
                    <span class="absolute -bottom-1 text-[9px] font-mono text-primary font-bold">
                      Hitbox 48×48px
                    </span>
                  }
                </div>

                <div class="text-right">
                  <div class="text-xs text-muted">Clics detectados:</div>
                  <div class="text-2xl font-bold font-mono text-primary">{{ hitboxClicks() }}</div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-1">
                <button 
                  (click)="showHitbox.update(v => !v)"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-high text-main hover:bg-outline-sub/30 cursor-pointer">
                  {{ showHitbox() ? 'Ocultar Hitbox' : 'Ver Hitbox Invisible' }}
                </button>
                <span class="text-[11px] text-muted">WCAG 2.2 AAA</span>
              </div>
            </div>
          </div>

          <!-- 3. WINDOW SIZE CLASSES -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">devices</span>
                Foundations • Diseño Adaptativo
              </div>
              <h3 class="text-title-md font-bold text-main">Window Size Classes M3</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Clasificación canónica de la pantalla en tiempo real con Angular Signals.
              </p>
            </div>

            <div class="space-y-3">
              <div class="p-3 bg-surface-low rounded-m3-lg border border-outline-sub space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted">Clase activa:</span>
                  @if (layoutService.isCompact()) {
                    <span class="px-2.5 py-1 rounded-full bg-error-box text-on-error-box text-xs font-bold uppercase">
                      Compact (&lt;600px)
                    </span>
                  } @else if (layoutService.isMedium()) {
                    <span class="px-2.5 py-1 rounded-full bg-sec-box text-on-sec-box text-xs font-bold uppercase">
                      Medium (600–839px)
                    </span>
                  } @else {
                    <span class="px-2.5 py-1 rounded-full bg-primary-box text-on-primary-box text-xs font-bold uppercase">
                      Expanded (≥840px)
                    </span>
                  }
                </div>

                <div class="flex items-center justify-between text-xs">
                  <span class="text-muted">Navegación M3 sugerida:</span>
                  <span class="font-semibold text-main">
                    {{ layoutService.isCompact() ? 'Dock / Bottom Bar' : 'Navigation Rail' }}
                  </span>
                </div>
              </div>

              <p class="text-[11px] text-muted leading-relaxed">
                Cambia el tamaño del navegador o abre la consola para ver mutar el valor instantáneamente.
              </p>
            </div>
          </div>
        </div>
      }

      <!-- VISTA PASO 1: STYLES (TOKENS) -->
      @if (activeTab() === 'styles') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 1. SURFACES & TONAL ELEVATION -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">layers</span>
                Elevación Tonal (Paso 1)
              </div>
              <h3 class="text-title-md font-bold text-main">Superficies M3</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Sin sombras duras. 5 niveles de contenedores con saturación calibrada en OKLCH.
              </p>
            </div>

            <div class="space-y-1.5">
              <div class="bg-surface-lowest border border-outline-sub/30 p-2.5 rounded-m3-sm text-xs flex items-center justify-between">
                <span class="font-medium">Container Lowest</span>
                <span class="text-[11px] text-muted font-mono">100% / 8% L</span>
              </div>
              <div class="bg-surface-low border border-outline-sub/30 p-2.5 rounded-m3-sm text-xs flex items-center justify-between">
                <span class="font-medium">Container Low</span>
                <span class="text-[11px] text-muted font-mono">96% / 15% L</span>
              </div>
              <div class="bg-surface-box border border-outline-sub/40 p-2.5 rounded-m3-sm text-xs flex items-center justify-between">
                <span class="font-medium">Container Standard</span>
                <span class="text-[11px] text-muted font-mono">93% / 18% L</span>
              </div>
              <div class="bg-surface-high border border-outline-sub/50 p-2.5 rounded-m3-sm text-xs flex items-center justify-between">
                <span class="font-medium">Container High</span>
                <span class="text-[11px] text-muted font-mono">90% / 22% L</span>
              </div>
              <div class="bg-surface-highest border border-outline-sub/60 p-2.5 rounded-m3-sm text-xs flex items-center justify-between">
                <span class="font-medium">Container Highest</span>
                <span class="text-[11px] text-muted font-mono">86% / 27% L</span>
              </div>
            </div>
          </div>

          <!-- 2. SHAPE MORPHING & SPRING PHYSICS -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">animation</span>
                Formas y Física (Paso 1)
              </div>
              <h3 class="text-title-md font-bold text-main">Shape Morphing & Spring</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Transiciones orgánicas con curva <code class="text-primary font-mono text-[11px]">ease-m3-spring</code> y radios squircle.
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div class="text-center p-2 bg-surface-high rounded-m3-xs border border-outline-sub text-[11px] flex-1">
                  <span class="block font-bold">4px</span>
                  <span class="text-muted text-[10px]">xs</span>
                </div>
                <div class="text-center p-2 bg-surface-high rounded-m3-sm border border-outline-sub text-[11px] flex-1">
                  <span class="block font-bold">8px</span>
                  <span class="text-muted text-[10px]">sm</span>
                </div>
                <div class="text-center p-2 bg-surface-high rounded-m3-md border border-outline-sub text-[11px] flex-1">
                  <span class="block font-bold">12px</span>
                  <span class="text-muted text-[10px]">md</span>
                </div>
                <div class="text-center p-2 bg-surface-high rounded-m3-lg border border-outline-sub text-[11px] flex-1">
                  <span class="block font-bold">16px</span>
                  <span class="text-muted text-[10px]">lg</span>
                </div>
                <div class="text-center p-2 bg-surface-high rounded-m3-xl border border-outline-sub text-[11px] flex-1">
                  <span class="block font-bold">28px</span>
                  <span class="text-muted text-[10px]">xl</span>
                </div>
              </div>

              <button 
                (click)="toggleMorph()"
                [class]="isMorphed() ? 'rounded-m3-md bg-sec-box text-on-sec-box' : 'rounded-m3-full bg-primary text-on-primary'"
                class="btn-m3 w-full py-3 px-4 font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                <span class="material-symbols-rounded text-base">
                  {{ isMorphed() ? 'change_history' : 'radio_button_checked' }}
                </span>
                <span>{{ isMorphed() ? 'Squircle M3 (12px)' : 'Píldora Completa (Full)' }}</span>
              </button>
            </div>
          </div>

          <!-- 3. ROLES SEMÁNTICOS & TIPOGRAFÍA -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                <span class="material-symbols-rounded text-base text-primary">text_fields</span>
                Semántica y Tipografía (Paso 1)
              </div>
              <h3 class="text-title-md font-bold text-main">Roles & Escala</h3>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                15 tokens de escala tipográfica y roles de color armónicos con contraste garantizado.
              </p>
            </div>

            <div class="space-y-2.5">
              <div class="p-3 bg-surface-low border border-outline-sub rounded-m3-lg space-y-1">
                <div class="text-title-lg font-bold text-main leading-tight">Title Large (22px)</div>
                <div class="text-body-sm text-muted">Body Small (12px) con tracking compensado.</div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="p-2 rounded-m3-md bg-primary-box text-on-primary-box text-center text-xs font-semibold">
                  Primary Box
                </div>
                <div class="p-2 rounded-m3-md bg-tertiary-box text-on-tertiary-box text-center text-xs font-semibold">
                  Tertiary Box
                </div>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-m3-md bg-error-box text-on-error-box text-xs font-semibold">
                <span class="flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-base">error</span>
                  Rol Error M3
                </span>
                <span class="text-[11px] font-mono opacity-80">Hue 25°</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- VISTA PASO 4: MOTION & TRANSITIONS (M3 EXPRESSIVE) -->
      @if (activeTab() === 'motion') {
        <div class="space-y-6">
          <!-- BANNER INTRODUCTORIO DE MOTION -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                <span class="material-symbols-rounded text-base text-primary">animation</span>
                Material 3 Expressive • Sistema de Movimiento
              </div>
              <h2 class="text-xl font-extrabold text-main tracking-tight">Física de Movimiento, Easing y Asimetría Canónica</h2>
              <p class="text-xs text-muted max-w-3xl leading-relaxed">
                El movimiento en M3 Expressive no es decorativo: es un canal de información semántica y jerarquía espacial. Se fundamenta en tres pilares: asimetría perceptual de entrada vs. salida, física de resortes disjuntos (Spatial vs. Effects) y los cuatro patrones canónicos de transición.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-full bg-primary-box text-on-primary-box text-xs font-bold font-mono">
                Jetpack Compose MotionScheme
              </span>
              <span class="px-3 py-1 rounded-full bg-surface-high text-main text-xs font-bold font-mono">
                View Transitions API
              </span>
            </div>
          </div>

          <!-- GRID DE 2 COLUMNAS: ASIMETRÍA + FÍSICA DE RESORTES -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- PILAR 1: ASIMETRÍA DE ENTRADA VS SALIDA -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-5 shadow-xs">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                    <span class="material-symbols-rounded text-base text-primary">swap_horiz</span>
                    Pilar 1 • Asimetría Perceptual
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold"
                    [class]="demoAsymmetryOpen() ? 'bg-primary-box text-on-primary-box' : 'bg-surface-high text-muted'">
                    {{ demoAsymmetryOpen() ? 'Abierto (400ms)' : 'Cerrado (200ms)' }}
                  </span>
                </div>

                <h3 class="text-title-md font-bold text-main">Entrada Desacelerada vs. Salida Acelerada</h3>
                <p class="text-xs text-muted leading-relaxed">
                  En M3, <strong>la entrada y la salida jamás comparten la misma duración ni curva</strong>. Cuando una superficie entra, el cerebro requiere tiempo para registrar la nueva información visual (400ms con desaceleración). Al salir, el usuario ya tomó la decisión consciente de cerrar; demorarlo genera fricción perceptiva (200ms con aceleración).
                </p>

                <!-- TOKENS COMPARATIVOS -->
                <div class="grid grid-cols-2 gap-3 pt-1">
                  <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub space-y-1">
                    <div class="text-[11px] font-bold text-primary flex items-center gap-1">
                      <span class="material-symbols-rounded text-sm">login</span>
                      Entrada (Entering)
                    </div>
                    <div class="font-mono text-xs font-bold text-main">medium4 • 400ms</div>
                    <div class="text-[10px] text-muted font-mono leading-tight">emphasized-decelerate<br>cubic-bezier(0.05, 0.7, 0.1, 1)</div>
                  </div>

                  <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub space-y-1">
                    <div class="text-[11px] font-bold text-primary flex items-center gap-1">
                      <span class="material-symbols-rounded text-sm">logout</span>
                      Salida (Exiting)
                    </div>
                    <div class="font-mono text-xs font-bold text-main">short4 • 200ms</div>
                    <div class="text-[10px] text-muted font-mono leading-tight">emphasized-accelerate<br>cubic-bezier(0.3, 0, 0.8, 0.15)</div>
                  </div>
                </div>

                <!-- PLAYGROUND INTERACTIVO DE ASIMETRÍA -->
                <div class="pt-2">
                  <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                    <!-- CONTENEDOR ASIMÉTRICO EN VIVO (MISMA ARQUITECTURA DE CAJA ACOTADA) -->
                    <div 
                      (click)="toggleAsymmetryDemo()"
                      [style.transition-duration]="demoAsymmetryOpen() ? 'var(--md-sys-motion-duration-medium4)' : 'var(--md-sys-motion-duration-short4)'"
                      [style.transition-timing-function]="demoAsymmetryOpen() ? 'var(--md-sys-motion-easing-emphasized-decelerate)' : 'var(--md-sys-motion-easing-emphasized-accelerate)'"
                      [class]="demoAsymmetryOpen() 
                        ? 'w-[384px] h-36 p-4 bg-surface-box text-main border-primary rounded-m3-xl shadow-lg' 
                        : 'w-56 h-10 px-4 bg-primary text-on-primary border-transparent rounded-full shadow-xs'"
                      class="cursor-pointer overflow-hidden border select-none max-w-full transition-all text-center">
                      @if (!demoAsymmetryOpen()) {
                        <div class="h-full flex items-center justify-center gap-2 text-xs font-bold">
                          <span class="material-symbols-rounded text-base">open_in_full</span>
                          <span>Abrir Superficie (400ms)</span>
                        </div>
                      } @else {
                        <div class="space-y-2 text-left" style="animation: m3ContainerContentIn 250ms var(--md-sys-motion-easing-emphasized-decelerate) both;">
                          <div class="flex items-center justify-between border-b border-outline-sub pb-1.5">
                            <span class="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                              <span class="material-symbols-rounded text-sm">notifications</span>
                              Superficie Revelada
                            </span>
                            <span class="material-symbols-rounded text-base text-muted hover:text-main">close</span>
                          </div>
                          <p class="text-xs text-muted leading-relaxed">
                            Desaceleración suave al entrar (400ms) para asimilar la info; al cerrar, salida acelerada e instantánea (200ms).
                          </p>
                          <div class="text-[10px] font-mono text-primary font-bold">Clic para cerrar acelerado (200ms)</div>
                        </div>
                      }
                    </div>

                    <!-- BARRA DE TIEMPO VISUAL -->
                    <div class="w-full max-w-xs mt-4 pt-2 border-t border-outline-sub flex items-center justify-between text-[10px] font-mono text-muted">
                      <span>Curva activa:</span>
                      <span class="font-bold text-main">
                        {{ demoAsymmetryOpen() ? 'emphasized-decelerate (400ms)' : 'emphasized-accelerate (200ms)' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-[11px] text-muted flex items-center gap-1.5 pt-2 border-t border-outline-sub">
                <span class="material-symbols-rounded text-sm text-primary">info</span>
                <span>Configurado en <code class="font-mono text-main">src/styles/_motion.css</code> y en <code class="font-mono text-main">html.vt-exiting</code>.</span>
              </div>
            </div>

            <!-- PILAR 2: RESORTES DISJUNTOS: SPATIAL VS EFFECTS -->
            <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl flex flex-col justify-between space-y-5 shadow-xs">
              <div class="space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                    <span class="material-symbols-rounded text-base text-primary">all_inclusive</span>
                    Pilar 2 • Motion Physics & Web Spring Curves
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <!-- SELECTOR DE ESTILO (EXPRESSIVE VS STANDARD) -->
                    <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                      <button 
                        (click)="setSpringStyle('expressive')"
                        [class]="demoSpringStyle() === 'expressive' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                        class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                        Expressive
                      </button>
                      <button 
                        (click)="setSpringStyle('standard')"
                        [class]="demoSpringStyle() === 'standard' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                        class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                        Standard
                      </button>
                    </div>

                    <button 
                      (click)="triggerSpringDemo()"
                      class="btn-m3 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <span class="material-symbols-rounded text-sm">play_arrow</span>
                      Disparar Pulso
                    </button>
                  </div>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 class="text-title-md font-bold text-main">Física Espacial vs. Amortiguación de Efectos</h3>
                    <p class="text-xs text-muted leading-relaxed mt-0.5">
                      Especificación canónica Material 3: los resortes combinan amortiguación (&zeta;) y rigidez (k). En Web, Google traduce resortes a curvas <code class="font-mono text-primary font-bold">cubic-bezier</code> de alta fidelidad.
                    </p>
                  </div>

                  <!-- SELECTOR DE VELOCIDAD -->
                  <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                    <button 
                      (click)="setSpringSpeed('fast')"
                      [class]="demoSpringSpeed() === 'fast' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                      Fast ({{ activeSpringSpecs().style === 'expressive' ? '350ms' : '350ms' }})
                    </button>
                    <button 
                      (click)="setSpringSpeed('default')"
                      [class]="demoSpringSpeed() === 'default' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                      Default (500ms)
                    </button>
                    <button 
                      (click)="setSpringSpeed('slow')"
                      [class]="demoSpringSpeed() === 'slow' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                      class="btn-m3 px-2.5 py-1 rounded-full text-[11px] cursor-pointer">
                      Slow ({{ activeSpringSpecs().style === 'expressive' ? '650ms' : '750ms' }})
                    </button>
                  </div>
                </div>

                <!-- COMPARATIVA DE RESORTES INTERACTIVOS -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <!-- SPATIAL SPRING -->
                  <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-1.5">
                        <div class="text-xs font-bold text-primary flex items-center gap-1.5">
                          <span class="material-symbols-rounded text-base">crop_free</span>
                          Familia Espacial (Spatial)
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-mono font-bold">
                          &zeta; = {{ activeSpringSpecs().spatial.damping }} (Subamortiguado)
                        </span>
                      </div>
                      <p class="text-[11px] text-muted leading-relaxed">
                        Posición, escala, ancho y geometrías. Permite sobrepaso elástico natural (momentum) sin vibración residual.
                      </p>
                    </div>

                    <!-- ELEMENTO ANIMADO SPATIAL -->
                    <div class="h-28 bg-surface-high rounded-m3-md flex items-center justify-center overflow-hidden relative cursor-pointer"
                      (click)="triggerSpringDemo()">
                      @for (trigger of [demoSpringCount()]; track trigger) {
                        <div 
                          class="w-14 h-14 rounded-m3-md bg-primary text-on-primary flex flex-col items-center justify-center font-bold text-xs shadow-md select-none"
                          [style.animation]="demoSpringCount() > 0 
                            ? ('m3SpringScale ' + activeSpringSpecs().spatial.duration + 'ms ' + activeSpringSpecs().spatial.curve + ' both') 
                            : 'none'">
                          <span class="material-symbols-rounded text-xl">transform</span>
                          <span class="text-[9px] font-mono font-normal">Rebote</span>
                        </div>
                      }
                    </div>

                    <!-- ESPECIFICACIONES TÉCNICAS SPATIAL -->
                    <div class="space-y-1.5 pt-1 border-t border-outline-sub text-[11px]">
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Android / Compose:</span>
                        <span class="font-mono font-bold text-main">Damping {{ activeSpringSpecs().spatial.damping }} • Stiffness {{ activeSpringSpecs().spatial.stiffness }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Web Curve Token:</span>
                        <span class="font-mono text-primary font-bold">{{ activeSpringSpecs().spatial.token }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-muted">CSS Easing & Timing:</span>
                        <span class="font-mono text-[10px] text-main">{{ activeSpringSpecs().spatial.curve }} • {{ activeSpringSpecs().spatial.duration }}ms</span>
                      </div>
                    </div>
                  </div>

                  <!-- EFFECTS SPRING -->
                  <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-1.5">
                        <div class="text-xs font-bold text-tertiary flex items-center gap-1.5">
                          <span class="material-symbols-rounded text-base">palette</span>
                          Familia Efectos (Effects)
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-surface-high text-muted text-[10px] font-mono font-bold">
                          &zeta; = {{ activeSpringSpecs().effects.damping }} (Crítico / 0 Rebote)
                        </span>
                      </div>
                      <p class="text-[11px] text-muted leading-relaxed">
                        Color, opacidad, elevación y blur. <strong>Prohibido rebotar:</strong> la oscilación en propiedades ópticas fatiga la retina y genera flickering.
                      </p>
                    </div>

                    <!-- ELEMENTO ANIMADO EFFECTS -->
                    <div class="h-28 bg-surface-high rounded-m3-md flex items-center justify-center overflow-hidden relative cursor-pointer"
                      (click)="triggerSpringDemo()">
                      @for (trigger of [demoSpringCount()]; track trigger) {
                        <div 
                          class="w-14 h-14 rounded-m3-md flex flex-col items-center justify-center font-bold text-xs shadow-xs select-none"
                          [style.animation]="demoSpringCount() > 0 
                            ? ('m3SpringEffects ' + activeSpringSpecs().effects.duration + 'ms ' + activeSpringSpecs().effects.curve + ' both') 
                            : 'none'"
                          style="background-color: var(--color-tertiary); color: var(--color-on-tertiary);">
                          <span class="material-symbols-rounded text-xl">contrast</span>
                          <span class="text-[9px] font-mono font-normal">Suave</span>
                        </div>
                      }
                    </div>

                    <!-- ESPECIFICACIONES TÉCNICAS EFFECTS -->
                    <div class="space-y-1.5 pt-1 border-t border-outline-sub text-[11px]">
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Android / Compose:</span>
                        <span class="font-mono font-bold text-main">Damping {{ activeSpringSpecs().effects.damping }} • Stiffness {{ activeSpringSpecs().effects.stiffness }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Web Curve Token:</span>
                        <span class="font-mono text-tertiary font-bold">{{ activeSpringSpecs().effects.token }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-muted">CSS Easing & Timing:</span>
                        <span class="font-mono text-[10px] text-main">{{ activeSpringSpecs().effects.curve }} • {{ activeSpringSpecs().effects.duration }}ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- CRITERIO DE DECISIÓN ARQUITECTÓNICA: EXPRESSIVE VS STANDARD -->
                <div class="p-3.5 rounded-m3-lg bg-surface-high/60 border border-outline-sub space-y-2.5">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-1.5 text-xs font-bold text-main">
                      <span class="material-symbols-rounded text-base text-primary">menu_book</span>
                      <span>Laboratorio Teórico: ¿Cuándo usar Expressive vs. Standard?</span>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-outline-sub text-muted font-bold">
                      M3 Decision Matrix
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <!-- EXPRESSIVE CARD -->
                    <div class="p-3 rounded-m3-md bg-surface border space-y-1.5 transition-colors"
                      [class.border-primary]="demoSpringStyle() === 'expressive'"
                      [class.border-outline-sub]="demoSpringStyle() !== 'expressive'">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-primary flex items-center gap-1">
                          <span class="material-symbols-rounded text-sm">auto_awesome</span>
                          Expressive (Carisma y Deleite)
                        </span>
                        <span class="font-mono text-[10px] text-primary font-bold">y₁ = 1.67 (+67%)</span>
                      </div>
                      <p class="text-[11px] text-muted leading-relaxed">
                        <strong>Para momentos de foco cognitivo:</strong> modales, drawers, cards expandibles (Container Transform), botones de acción flotante (FAB) o celebraciones de tareas. Transmite inercia física, peso elástico y respuesta viva.
                      </p>
                    </div>

                    <!-- STANDARD CARD -->
                    <div class="p-3 rounded-m3-md bg-surface border space-y-1.5 transition-colors"
                      [class.border-primary]="demoSpringStyle() === 'standard'"
                      [class.border-outline-sub]="demoSpringStyle() !== 'standard'">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-main flex items-center gap-1">
                          <span class="material-symbols-rounded text-sm">speed</span>
                          Standard (Utilitario e Invisible)
                        </span>
                        <span class="font-mono text-[10px] text-muted font-bold">y₁ = 1.06 (+6%)</span>
                      </div>
                      <p class="text-[11px] text-muted leading-relaxed">
                        <strong>Para interfaces densas y alta frecuencia:</strong> tablas de inventario, grillas de datos enterprise, dropdowns continuos y campos de texto. Evita la fatiga visual de rebotes repetitivos mientras mantiene fluidez sin fricción.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-[11px] text-muted flex items-center justify-between pt-2 border-t border-outline-sub flex-wrap gap-2">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm text-primary">verified</span>
                  <span>M3 Web Spec: Curvas <code class="font-mono text-main">cubic-bezier</code> con sobrepaso en eje Y (&gt; 1.0) para inercia real en navegador.</span>
                </div>
                <div class="font-mono text-[10px] text-muted">
                  Tokens activos: --md-sys-motion-spring-{{ demoSpringStyle() }}-{{ demoSpringSpeed() }}-spatial
                </div>
              </div>
            </div>

          </div>

          <!-- PILAR 3: LOS 6 PATRONES CANÓNICOS DE TRANSICIÓN M3 (GOOGLE SPEC) -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  <span class="material-symbols-rounded text-base text-primary">alt_route</span>
                  Pilar 3 • Los 6 Patrones Canónicos de Transición M3
                </div>
                <h3 class="text-title-md font-bold text-main">Taxonomía Oficial de Transiciones y Modelo Mental</h3>
                <p class="text-xs text-muted max-w-2xl leading-relaxed mt-0.5">
                  Material 3 define exactamente 6 patrones canónicos para conectar elementos y vistas, guiando la orientación cognitiva sin generar fricción perceptiva.
                </p>
              </div>

              <!-- SELECTOR DE LOS 6 PATRONES -->
              <div class="flex flex-wrap items-center gap-1.5 p-1 bg-surface-high rounded-full border border-outline-sub">
                <button 
                  (click)="setPattern('container')"
                  [class]="demoActivePattern() === 'container' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">open_in_new</span>
                  1. Container Transform
                </button>
                <button 
                  (click)="setPattern('forward-backward')"
                  [class]="demoActivePattern() === 'forward-backward' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">swap_horiz</span>
                  2. Forward & Backward
                </button>
                <button 
                  (click)="setPattern('lateral')"
                  [class]="demoActivePattern() === 'lateral' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">view_column</span>
                  3. Lateral
                </button>
                <button 
                  (click)="setPattern('top-level')"
                  [class]="demoActivePattern() === 'top-level' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">layers</span>
                  4. Top Level
                </button>
                <button 
                  (click)="setPattern('enter-exit')"
                  [class]="demoActivePattern() === 'enter-exit' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">open_in_browser</span>
                  5. Enter & Exit
                </button>
                <button 
                  (click)="setPattern('skeleton')"
                  [class]="demoActivePattern() === 'skeleton' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                  class="btn-m3 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-rounded text-sm">hourglass_empty</span>
                  6. Skeleton Loaders
                </button>
              </div>
            </div>

            <!-- DETALLE Y PLAYGROUND DEL PATRÓN ACTIVO -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              
              <!-- COLUMNA IZQUIERDA: EL POR QUÉ, PARA QUÉ Y CÓMO USARLO -->
              <div class="lg:col-span-1 p-5 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-4 shadow-xs">
                
                <!-- 1. CONTAINER TRANSFORM -->
                @if (demoActivePattern() === 'container') {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                        Máxima Expresividad M3
                      </span>
                      <span class="text-[10px] font-mono text-muted">long2 (500ms)</span>
                    </div>

                    <h4 class="text-sm font-bold text-main">Container Transform</h4>
                    
                    <div class="space-y-1.5 text-xs">
                      <div>
                        <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                        <p class="text-muted leading-relaxed">
                          Porque mantener el <strong>contenedor físico persistente</strong> (con su radio, sombra y color) evita que el cerebro sufra un corte abrupto. El usuario jamás pierde el foco de origen.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                        <p class="text-muted leading-relaxed">
                          Para momentos de héroe y jerarquías poco profundas: expandir un elemento para ver su detalle completo y colapsarlo de regreso al mismo lugar.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                        <p class="text-muted leading-relaxed">
                          Cards de productos, listas de tareas, barras de búsqueda que expanden resultados, FABs que se abren como sheets.
                        </p>
                      </div>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                      <div class="text-primary font-bold flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs">check_circle</span>
                        <span>Do: Usar View Transitions API en Web (GPU-accelerated).</span>
                      </div>
                      <div class="text-muted flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-error">cancel</span>
                        <span>Don't: No encadenar en jerarquías profundas (pantalla 1&rarr;2&rarr;3&rarr;4).</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- 2. FORWARD AND BACKWARD -->
                @if (demoActivePattern() === 'forward-backward' || demoActivePattern() === 'shared-axis') {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                        Jerarquía Consecutiva
                      </span>
                      <span class="text-[10px] font-mono text-muted">medium2 (300ms)</span>
                    </div>

                    <h4 class="text-sm font-bold text-main">Forward and Backward</h4>

                    <div class="space-y-1.5 text-xs">
                      <div>
                        <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                        <p class="text-muted leading-relaxed">
                          Comunica con claridad matemática si el usuario está <strong>avanzando o retrocediendo</strong> en el árbol de la aplicación.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                        <p class="text-muted leading-relaxed">
                          Para navegar entre pantallas de niveles consecutivos (ej: de la bandeja de entrada a un correo individual).
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                        <p class="text-muted leading-relaxed">
                          Ítems de listas, botones de flujo "Siguiente/Atrás", tarjetas que abren vistas hijas. En Android se combina con un fade sutil para no recorrer toda la pantalla.
                        </p>
                      </div>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                      <div class="text-primary font-bold flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs">check_circle</span>
                        <span>Do: Invertir la dirección exactamente al regresar (Backward).</span>
                      </div>
                      <div class="text-muted flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-error">cancel</span>
                        <span>Don't: No usar para navegar entre pestañas al mismo nivel (usar Lateral).</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- 3. LATERAL -->
                @if (demoActivePattern() === 'lateral') {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                        Pares Homogéneos
                      </span>
                      <span class="text-[10px] font-mono text-muted">medium1 (250ms)</span>
                    </div>

                    <h4 class="text-sm font-bold text-main">Lateral</h4>

                    <div class="space-y-1.5 text-xs">
                      <div>
                        <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                        <p class="text-muted leading-relaxed">
                          Al mover el contenido en <strong>estricto unísono sin fade</strong>, le indica al usuario que todos los elementos son pares iguales que habitan en el mismo plano horizontal.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                        <p class="text-muted leading-relaxed">
                          Insinúa y responde directamente al gesto táctil de <em>swipe</em> continuo entre secciones hermanas.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                        <p class="text-muted leading-relaxed">
                          Tabs (pestañas), carruseles de fotos, colecciones de productos en carrusel horizontal.
                        </p>
                      </div>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                      <div class="text-primary font-bold flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs">check_circle</span>
                        <span>Do: Deslizar en bloque unificado sin desvanecimiento.</span>
                      </div>
                      <div class="text-muted flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-error">cancel</span>
                        <span>Don't: No agregar fade (rompe la sensación de swipe y confunde con jerarquía).</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- 4. TOP LEVEL -->
                @if (demoActivePattern() === 'top-level' || demoActivePattern() === 'fade-through') {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                        Destinos de Primer Nivel
                      </span>
                      <span class="text-[10px] font-mono text-muted">short4 (200ms)</span>
                    </div>

                    <h4 class="text-sm font-bold text-main">Top Level (Fade Through)</h4>

                    <div class="space-y-1.5 text-xs">
                      <div>
                        <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                        <p class="text-muted leading-relaxed">
                          Los módulos principales de una app (ej: Dashboard vs Flotas vs Configuración) <strong>no tienen relación física ni espacial entre sí</strong>. Deslizarlos engañaría al usuario haciéndole creer que Configuración está "a la derecha".
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                        <p class="text-muted leading-relaxed">
                          Para alternar entre pantallas principales sin crear expectativas de arrastre gestual.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                        <p class="text-muted leading-relaxed">
                          Navigation Bar inferior, Navigation Rail lateral, Navigation Drawer de escritorio.
                        </p>
                      </div>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                      <div class="text-primary font-bold flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs">check_circle</span>
                        <span>Do: Fade-out rápido del viejo, luego fade-in del nuevo escalando a 100%.</span>
                      </div>
                      <div class="text-muted flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-error">cancel</span>
                        <span>Don't: Nunca usar deslizamiento lateral (conflictuaría con carruseles internos).</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- 5. ENTER AND EXIT -->
                @if (demoActivePattern() === 'enter-exit' || demoActivePattern() === 'fade') {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                        Entorno y Contexto
                      </span>
                      <span class="text-[10px] font-mono text-muted">short3 (150ms) / medium4</span>
                    </div>

                    <h4 class="text-sm font-bold text-main">Enter and Exit</h4>

                    <div class="space-y-1.5 text-xs">
                      <div>
                        <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                        <p class="text-muted leading-relaxed">
                          El cerebro humano asimila objetos contextuales según su <strong>borde físico de origen</strong>: lo que está arriba baja, lo que está abajo emerge.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                        <p class="text-muted leading-relaxed">
                          Para introducir componentes sin romper el flujo de la pantalla principal.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                        <p class="text-muted leading-relaxed">
                          <strong>Dentro de pantalla:</strong> Menús desplegables, snackbars, time pickers, tooltips.<br>
                          <strong>Fuera de pantalla:</strong> Bottom sheets, side sheets coplanares, app bars.
                        </p>
                      </div>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                      <div class="text-primary font-bold flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs">check_circle</span>
                        <span>Do: Expandir alejándose del borde del dispositivo más próximo.</span>
                      </div>
                      <div class="text-muted flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-error">cancel</span>
                        <span>Don't: Evitar cross-fade lento que superponga capas semitransparentes sucias.</span>
                      </div>
                    </div>
                  </div>
                }

                <!-- 6. SKELETON LOADERS -->
                @if (demoActivePattern() === 'skeleton') {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                        Estabilización de Layout
                      </span>
                      <span class="text-[10px] font-mono text-muted">1500ms shimmer</span>
                    </div>

                    <h4 class="text-sm font-bold text-main">Skeleton Loaders</h4>

                    <div class="space-y-1.5 text-xs">
                      <div>
                        <strong class="text-primary block text-[11px] uppercase tracking-wider">¿Por qué existe?</strong>
                        <p class="text-muted leading-relaxed">
                          Los "jump cuts" (contenido que aparece de golpe y empuja la UI) desorientan la visión y provocan clics erróneos (Cumulative Layout Shift). El esqueleto fija la estructura antes de que lleguen los datos.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Para qué sirve?</strong>
                        <p class="text-muted leading-relaxed">
                          Para una transición suave y continua desde el estado de espera asíncrona hacia la UI funcional definitiva.
                        </p>
                      </div>

                      <div class="pt-1">
                        <strong class="text-main block text-[11px] uppercase tracking-wider">¿Cuándo y cómo usarlo?</strong>
                        <p class="text-muted leading-relaxed">
                          Al lanzar una pantalla, recargar feeds o aplicar filtros pesados en tablas enterprise.
                        </p>
                      </div>
                    </div>

                    <div class="p-2.5 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1 text-[11px]">
                      <div class="text-primary font-bold flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs">check_circle</span>
                        <span>Do: Pulso diagonal arriba-izquierda a abajo-derecha, fade-in suave al cargar.</span>
                      </div>
                      <div class="text-muted flex items-center gap-1">
                        <span class="material-symbols-rounded text-xs text-error">cancel</span>
                        <span>Don't: Prohibido que el contenido haga pop-in desplazando botones o textos.</span>
                      </div>
                    </div>
                  </div>
                }

                <div class="text-[10px] font-mono text-muted pt-2 border-t border-outline-sub flex items-center justify-between">
                  <span>M3 Spec: Transitions</span>
                  <span class="text-primary font-bold">Legacy Curve + Durations</span>
                </div>
              </div>

              <!-- COLUMNA DERECHA: PLAYGROUND INTERACTIVO EN VIVO -->
              <div class="lg:col-span-2 p-6 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-center items-center min-h-[300px] relative overflow-hidden shadow-xs">
                
                <!-- 1. PLAYGROUND: CONTAINER TRANSFORM -->
                @if (demoActivePattern() === 'container') {
                  <div class="w-full flex flex-col items-center justify-center gap-4">
                    <div class="w-full h-52 grid place-items-center">
                      <div 
                        (click)="toggleContainerDemo()"
                        class="cursor-pointer overflow-hidden border select-none max-w-full transition-all"
                        [class]="demoContainerExpanded() 
                          ? 'w-[448px] h-48 p-4 bg-surface-box text-main rounded-m3-xl border-primary shadow-lg' 
                          : 'w-72 h-16 p-3 bg-surface-high hover:bg-surface-box text-main rounded-m3-lg border-outline-sub shadow-xs'"
                        style="transition-duration: var(--md-sys-motion-duration-long2); transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate);">

                        <!-- ELEMENTO PERSISTENTE: CABECERA QUE ACOMPAÑA LA TRANSFORMACIÓN -->
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2.5 min-w-0">
                            <span 
                              class="w-9 h-9 shrink-0 rounded-full grid place-items-center transition-colors"
                              style="transition-duration: var(--md-sys-motion-duration-medium2);"
                              [class]="demoContainerExpanded() 
                                ? 'bg-primary text-on-primary shadow-sm' 
                                : 'bg-primary-box text-on-primary-box'">
                              <span class="material-symbols-rounded text-base">local_shipping</span>
                            </span>
                            <div class="min-w-0">
                              <div class="text-xs font-bold truncate">
                                {{ demoContainerExpanded() ? 'Telemetría • TRK-884' : 'Unidad TRK-884' }}
                              </div>
                              <div class="text-[10px] text-muted font-mono truncate">
                                {{ demoContainerExpanded() ? 'Corredor Logístico Sur' : 'En Tránsito • 84 km/h' }}
                              </div>
                            </div>
                          </div>

                          <span 
                            [class]="demoContainerExpanded() ? 'bg-surface-high text-main hover:bg-outline-sub' : 'bg-primary text-on-primary shadow-xs'"
                            class="px-2.5 py-1 shrink-0 rounded-full text-[10px] font-bold transition-colors">
                            {{ demoContainerExpanded() ? 'Cerrar' : 'Expandir' }}
                          </span>
                        </div>

                        <!-- CONTENIDO SECUNDARIO CON FADE ASIMÉTRICO M3 (SIN HUECOS VACÍOS) -->
                        <div 
                          class="mt-3.5 space-y-2.5 transition-opacity"
                          [style.transition-duration]="demoContainerExpanded() ? 'var(--md-sys-motion-duration-medium2)' : 'var(--md-sys-motion-duration-short2)'"
                          [style.transition-delay]="demoContainerExpanded() ? '80ms' : '0ms'"
                          [class]="demoContainerExpanded() ? 'opacity-100' : 'opacity-0 pointer-events-none'">
                          <div class="grid grid-cols-3 gap-2 text-center">
                            <div class="p-2 rounded-m3-md bg-surface border border-outline-sub">
                              <div class="text-[10px] text-muted uppercase font-bold">Batería</div>
                              <div class="text-xs font-mono font-bold text-primary">94%</div>
                            </div>
                            <div class="p-2 rounded-m3-md bg-surface border border-outline-sub">
                              <div class="text-[10px] text-muted uppercase font-bold">Presión</div>
                              <div class="text-xs font-mono font-bold text-main">32.4 PSI</div>
                            </div>
                            <div class="p-2 rounded-m3-md bg-surface border border-outline-sub">
                              <div class="text-[10px] text-muted uppercase font-bold">Carga</div>
                              <div class="text-xs font-mono font-bold text-tertiary">1,420 kg</div>
                            </div>
                          </div>

                          <div class="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-outline-sub/60">
                            <span>Clic en cualquier parte para volver al origen</span>
                            <span class="font-mono text-primary font-bold">long2 • 500ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="text-[11px] font-mono text-muted flex items-center gap-2">
                      <span class="font-bold text-main">Física activa:</span>
                      <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-bold">
                        {{ demoContainerExpanded() ? 'Expansión (288px → 448px • long2 500ms)' : 'Colapso Simétrico (448px → 288px • long2 500ms)' }}
                      </span>
                    </div>
                  </div>
                }

                <!-- 2. PLAYGROUND: FORWARD AND BACKWARD -->
                @if (demoActivePattern() === 'forward-backward' || demoActivePattern() === 'shared-axis') {
                  <div class="w-full max-w-md space-y-4">
                    <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                      <span class="text-xs font-bold text-main flex items-center gap-1.5">
                        <span class="material-symbols-rounded text-sm text-primary">account_tree</span>
                        Nivel Jerárquico: {{ demoHierarchicalView() === 'list' ? 'Nivel 1 (Lista de Auditorías)' : 'Nivel 2 (Detalle Inspección)' }}
                      </span>

                      <div class="flex items-center gap-1.5">
                        <button 
                          (click)="navigateToHierarchicalList()"
                          [disabled]="demoHierarchicalView() === 'list'"
                          class="btn-m3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer border border-outline-sub disabled:opacity-40 disabled:cursor-not-allowed">
                          <span class="material-symbols-rounded text-sm">arrow_back</span>
                          <span>Regresar</span>
                        </button>
                        <button 
                          (click)="navigateToHierarchicalDetail()"
                          [disabled]="demoHierarchicalView() === 'detail'"
                          class="btn-m3 px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed">
                          <span>Avanzar</span>
                          <span class="material-symbols-rounded text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                    <!-- PANTALLA JERÁRQUICA ANIMADA -->
                    <div class="h-36 bg-surface-high rounded-m3-lg p-4 border border-outline-sub flex items-center justify-center overflow-hidden relative">
                      @for (k of [demoHierarchicalKey()]; track k) {
                        <div 
                          class="w-full"
                          [style.animation]="demoHierarchicalDirection() === 'forward' 
                            ? 'm3ForwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate) both' 
                            : 'm3BackwardIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate) both'">
                          @if (demoHierarchicalView() === 'list') {
                            <div class="space-y-2">
                              <div class="text-xs font-bold text-main">Auditorías Operativas de Flota (Nivel 1)</div>
                              <div (click)="navigateToHierarchicalDetail()" class="p-2 rounded bg-surface border border-outline-sub flex items-center justify-between cursor-pointer hover:border-primary">
                                <div class="flex items-center gap-2">
                                  <span class="material-symbols-rounded text-primary text-sm">verified_user</span>
                                  <span class="text-xs font-medium">Unidad TRK-884 • Sensor Presión</span>
                                </div>
                                <span class="material-symbols-rounded text-muted text-sm">chevron_right</span>
                              </div>
                            </div>
                          } @else {
                            <div class="space-y-2">
                              <div class="flex items-center justify-between">
                                <span class="text-xs font-bold text-primary">Inspección de Unidad TRK-884 (Nivel 2)</span>
                                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border text-muted">Aprobado</span>
                              </div>
                              <p class="text-xs text-muted leading-tight">
                                Telemetría calibrada con OKLCH y resortes subamortiguados &zeta;=0.9.
                              </p>
                              <div class="text-[10px] font-mono text-muted">Presiona 'Regresar' para probar el retroceso en sentido inverso.</div>
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                      <span>Dirección activa:</span>
                      <span class="font-bold text-main">
                        {{ demoHierarchicalDirection() === 'forward' ? 'Forward (Slide +36px + Fade In)' : 'Backward (Slide -36px + Fade In)' }}
                      </span>
                    </div>
                  </div>
                }

                <!-- 3. PLAYGROUND: LATERAL -->
                @if (demoActivePattern() === 'lateral') {
                  <div class="w-full max-w-md space-y-4">
                    <!-- TABS HOMOGÉNEOS -->
                    <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                      <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                        <button 
                          (click)="setLateralTab('general')"
                          [class]="demoLateralTab() === 'general' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                          class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                          General
                        </button>
                        <button 
                          (click)="setLateralTab('telemetry')"
                          [class]="demoLateralTab() === 'telemetry' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                          class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                          Telemetría
                        </button>
                        <button 
                          (click)="setLateralTab('hardware')"
                          [class]="demoLateralTab() === 'hardware' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                          class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                          Hardware
                        </button>
                      </div>
                      <span class="text-[10px] font-mono text-muted font-bold">medium1 (250ms)</span>
                    </div>

                    <!-- CONTENEDOR LATERAL EN UNÍSONO -->
                    <div class="h-32 bg-surface-high rounded-m3-lg p-4 border border-outline-sub flex items-center justify-center overflow-hidden relative">
                      @for (k of [demoLateralCount()]; track k) {
                        <div 
                          class="w-full text-center space-y-1.5"
                          style="animation: m3LateralIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard) both;">
                          <div class="text-xs font-bold text-main uppercase tracking-wider">
                            Pestaña Par: {{ demoLateralTab().toUpperCase() }}
                          </div>
                          <p class="text-xs text-muted leading-relaxed">
                            @if (demoLateralTab() === 'general') {
                              Visión panorámica de la unidad. Deslizamiento en unísono estricto sin fade.
                            } @else if (demoLateralTab() === 'telemetry') {
                              Gráficas de velocidad y presión. Mismo plano de jerarquía peer-to-peer.
                            } @else {
                              Módulos de sensorica IoT y controladores integrados en bus CAN.
                            }
                          </p>
                        </div>
                      }
                    </div>

                    <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                      <span>Mecánica:</span>
                      <span class="font-bold text-main">Slide en Unísono (Sin Fade ni Parallax)</span>
                    </div>
                  </div>
                }

                <!-- 4. PLAYGROUND: TOP LEVEL (FADE THROUGH) -->
                @if (demoActivePattern() === 'top-level' || demoActivePattern() === 'fade-through') {
                  <div class="w-full max-w-md space-y-4">
                    <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                      <span class="text-xs font-bold text-main">Barra de Navegación Principal</span>
                      <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                        <button 
                          (click)="setTopLevelDest('dashboard')"
                          [class]="demoTopLevelDest() === 'dashboard' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                          class="btn-m3 px-2.5 py-1 rounded-full text-xs cursor-pointer">
                          Dashboard
                        </button>
                        <button 
                          (click)="setTopLevelDest('fleet')"
                          [class]="demoTopLevelDest() === 'fleet' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                          class="btn-m3 px-2.5 py-1 rounded-full text-xs cursor-pointer">
                          Flotas
                        </button>
                        <button 
                          (click)="setTopLevelDest('settings')"
                          [class]="demoTopLevelDest() === 'settings' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                          class="btn-m3 px-2.5 py-1 rounded-full text-xs cursor-pointer">
                          Ajustes
                        </button>
                      </div>
                    </div>

                    <!-- CONTENEDOR FADE THROUGH -->
                    <div class="h-32 bg-surface-high rounded-m3-lg p-4 border border-outline-sub flex items-center justify-center overflow-hidden relative">
                      @for (k of [demoTopLevelCount()]; track k) {
                        <div 
                          class="text-center space-y-1 w-full"
                          style="animation: m3FadeThroughIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-standard) both;">
                          <div class="text-sm font-bold text-main flex items-center justify-center gap-1.5">
                            <span class="material-symbols-rounded text-primary text-base">
                              {{ demoTopLevelDest() === 'dashboard' ? 'dashboard' : (demoTopLevelDest() === 'fleet' ? 'commute' : 'settings') }}
                            </span>
                            <span>Módulo: {{ demoTopLevelDest() === 'dashboard' ? 'Dashboard' : (demoTopLevelDest() === 'fleet' ? 'Flotas' : 'Ajustes') }}</span>
                          </div>
                          <p class="text-xs text-muted max-w-xs mx-auto">
                            Transición desacoplada. Fade-out rápido del módulo saliente y fade-in con escalado sutil 92% &rarr; 100% del nuevo.
                          </p>
                        </div>
                      }
                    </div>

                    <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                      <span>M3 Rule:</span>
                      <span class="font-bold text-main">Sin Deslizamiento Espacial (Evita Falso Swipe)</span>
                    </div>
                  </div>
                }

                <!-- 5. PLAYGROUND: ENTER AND EXIT -->
                @if (demoActivePattern() === 'enter-exit' || demoActivePattern() === 'fade') {
                  <div class="w-full max-w-md space-y-4">
                    <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                      <span class="text-xs font-bold text-main">Disparadores Direccionales</span>
                      <div class="flex items-center gap-2">
                        <button 
                          (click)="toggleEnterExitMenu()"
                          class="btn-m3 px-2.5 py-1 rounded-full bg-surface-high hover:bg-surface-box border border-outline-sub text-xs font-bold text-main flex items-center gap-1 cursor-pointer">
                          <span class="material-symbols-rounded text-sm">menu_open</span>
                          <span>{{ demoEnterExitMenuOpen() ? 'Cerrar Menú' : 'Menú Superior' }}</span>
                        </button>
                        <button 
                          (click)="toggleEnterExitSnackbar()"
                          class="btn-m3 px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs">
                          <span class="material-symbols-rounded text-sm">vertical_align_top</span>
                          <span>{{ demoEnterExitSnackbarOpen() ? 'Ocultar Sheet' : 'Bottom Sheet' }}</span>
                        </button>
                      </div>
                    </div>

                    <!-- CONTENEDOR ENTER & EXIT -->
                    <div class="h-36 bg-surface-high rounded-m3-lg p-3 border border-outline-sub flex flex-col justify-between overflow-hidden relative">
                      <!-- MENÚ SUPERIOR (EXPANDE HACIA ABAJO) -->
                      <div class="h-14 flex items-start justify-center">
                        @if (demoEnterExitMenuOpen()) {
                          <div 
                            class="px-3 py-1.5 rounded-m3-md bg-surface-box border border-primary text-main text-xs font-semibold shadow-md flex items-center gap-2"
                            style="animation: m3EnterFromTop var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate) both;">
                            <span class="material-symbols-rounded text-primary text-sm">tune</span>
                            <span>Menú desplegado desde el borde superior</span>
                          </div>
                        } @else {
                          <span class="text-[10px] text-muted font-mono">Borde Superior (Haz clic en 'Menú Superior')</span>
                        }
                      </div>

                      <!-- BOTTOM SHEET / SNACKBAR (EMERGE HACIA ARRIBA) -->
                      <div class="h-14 flex items-end justify-center">
                        @if (demoEnterExitSnackbarOpen()) {
                          <div 
                            class="px-3 py-1.5 rounded-m3-md bg-primary text-on-primary text-xs font-semibold shadow-md flex items-center gap-2"
                            style="animation: m3EnterFromBottom var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate) both;">
                            <span class="material-symbols-rounded text-sm">check_circle</span>
                            <span>Bottom Sheet emergiendo desde la base</span>
                          </div>
                        } @else {
                          <span class="text-[10px] text-muted font-mono">Borde Inferior (Haz clic en 'Bottom Sheet')</span>
                        }
                      </div>
                    </div>

                    <div class="text-[10px] font-mono text-muted flex items-center justify-between">
                      <span>Modelo Espacial:</span>
                      <span class="font-bold text-main">Expansión guiada desde los bordes físicos</span>
                    </div>
                  </div>
                }

                <!-- 6. PLAYGROUND: SKELETON LOADERS -->
                @if (demoActivePattern() === 'skeleton') {
                  <div class="w-full max-w-md space-y-4">
                    <div class="flex items-center justify-between pb-1 border-b border-outline-sub">
                      <span class="text-xs font-bold text-main flex items-center gap-1.5">
                        <span class="material-symbols-rounded text-sm text-primary">hourglass_bottom</span>
                        Estabilización sin Jump-Cuts
                      </span>
                      <button 
                        (click)="triggerSkeletonSim()"
                        [disabled]="demoSkeletonSimulated()"
                        class="btn-m3 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-40">
                        <span class="material-symbols-rounded text-sm">autorenew</span>
                        <span>Simular Carga de Red (2s)</span>
                      </button>
                    </div>

                    <!-- TARJETA SKELETON VS FINAL DATA -->
                    <div class="h-36 bg-surface rounded-m3-lg p-3.5 border border-outline-sub flex flex-col justify-between overflow-hidden relative shadow-xs">
                      @if (demoSkeletonSimulated()) {
                        <!-- ESTADO SKELETON (ESTRUCTURA IDÉNTICA PARA CERO DESPLAZAMIENTO) -->
                        <div class="space-y-2.5 animate-pulse">
                          <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-full m3-skeleton m3-skeleton-circle m3-skeleton-shimmer shrink-0"></div>
                            <div class="space-y-1.5 flex-1">
                              <div class="h-3.5 w-3/5 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                              <div class="h-2.5 w-2/5 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                            </div>
                          </div>
                          <div class="h-2.5 w-full m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                          <div class="h-2.5 w-4/5 m3-skeleton m3-skeleton-pill m3-skeleton-shimmer"></div>
                        </div>
                      } @else {
                        <!-- ESTADO FINAL CON DATOS (FADE IN SUAVE SOBRE EL ESQUELETO) -->
                        <div class="space-y-2.5" style="animation: m3FadeIn var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate) both;">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2.5">
                              <span class="w-9 h-9 rounded-full bg-primary text-on-primary grid place-items-center shadow-xs">
                                <span class="material-symbols-rounded text-base">analytics</span>
                              </span>
                              <div>
                                <h5 class="text-xs font-bold text-main">Diagnóstico Motor • TRK-884</h5>
                                <div class="text-[10px] text-muted font-mono">100% Nominal • Cero Fricción</div>
                              </div>
                            </div>
                            <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[9px] font-bold">Activo</span>
                          </div>
                          <p class="text-xs text-muted leading-tight">
                            El layout se mantuvo 100% estable durante la transición de carga, sin salto de píxeles ni popping de elementos.
                          </p>
                        </div>
                      }

                      <div class="text-[10px] font-mono text-muted flex items-center justify-between pt-1 border-t border-outline-sub">
                        <span>Estado: {{ demoSkeletonSimulated() ? 'Cargando datos con shimmer...' : 'Datos renderizados con fade-in' }}</span>
                        <span class="text-primary font-bold">CLS = 0.00</span>
                      </div>
                    </div>
                  </div>
                }

              </div>
            </div>

            <!-- M3 APPLYING TRANSITIONS: LOS 8 PRINCIPIOS DE CALIDAD DE GOOGLE -->
            <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-primary text-base">verified</span>
                  <h4 class="text-xs font-bold text-main uppercase tracking-wider">
                    Applying Transitions • Los 8 Principios de Calidad de Google
                  </h4>
                </div>
                <span class="text-[10px] font-mono text-muted">m3.material.io/styles/motion/transitions/applying-transitions</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">1. Accesibilidad Universal</span>
                  <p class="text-[11px] text-muted leading-tight">
                    Respeta <code class="font-mono text-primary">prefers-reduced-motion</code>: reemplaza traslaciones por desvanecimientos sutiles sin efectos decorativos.
                  </p>
                </div>
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">2. Consistencia Sistémica</span>
                  <p class="text-[11px] text-muted leading-tight">
                    Mismo tipo de transición para la misma acción en toda la app. Aumenta la previsibilidad operativa.
                  </p>
                </div>
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">3. Layouts Estables (Skeletons)</span>
                  <p class="text-[11px] text-muted leading-tight">
                    Fija las dimensiones físicas antes de que carguen los datos para evitar empujar elementos en pantalla.
                  </p>
                </div>
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">4. Cero Jump-Cuts</span>
                  <p class="text-[11px] text-muted leading-tight">
                    Evita cortes secos e instantáneos salvo en herramientas de pura velocidad donde el usuario sea experto.
                  </p>
                </div>
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">5. Modelo Espacial Coherente</span>
                  <p class="text-[11px] text-muted leading-tight">
                    Los elementos emergen desde su origen físico real: drawers desde los laterales, sheets desde abajo.
                  </p>
                </div>
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">6. Dirección Unificada</span>
                  <p class="text-[11px] text-muted leading-tight">
                    Los elementos secundarios se agrupan y viajan a lo largo del mismo eje de movimiento.
                  </p>
                </div>
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">7. Clean Fades (Sin Cross-Fade)</span>
                  <p class="text-[11px] text-muted leading-tight">
                    Desvanece por completo el contenido saliente antes de entrar el nuevo para evitar capas semitransparentes sucias.
                  </p>
                </div>
                <div class="p-3 rounded-m3-md bg-surface-high border border-outline-sub/60 space-y-1">
                  <span class="font-bold text-main text-[11px] block">8. Estilo Sobrio</span>
                  <p class="text-[11px] text-muted leading-tight">
                    La navegación frecuente debe ser ágil y sobria, sin resortes elásticos exagerados que causen fatiga.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- PILAR 4: ESCALA CANÓNICA DE EASING Y DURACIÓN M3 -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-7">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  <span class="material-symbols-rounded text-base text-primary">timer</span>
                  Pilar 4 • Tokens Canónicos de Easing & Duración M3
                </div>
                <h3 class="text-title-md font-bold text-main">Laboratorio Oficial de Easing y Escala de 16 Tiempos</h3>
                <p class="text-xs text-muted leading-relaxed mt-0.5">
                  Material Design 3 establece que <strong>la duración nunca se elige de forma aislada</strong>: la dirección y el contexto dictan si el elemento entra desacelerando, sale acelerando o se transforma en pantalla.
                </p>
              </div>

              <!-- SELECTOR DE CONJUNTO OFICIAL (EMPHASIZED VS STANDARD) -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 bg-surface-high p-1 rounded-full border border-outline-sub">
                  <button 
                    (click)="setTheaterSet('emphasized')"
                    [class]="demoTheaterSet() === 'emphasized' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                    class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                    Emphasized Set
                  </button>
                  <button 
                    (click)="setTheaterSet('standard')"
                    [class]="demoTheaterSet() === 'standard' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-muted hover:text-main'"
                    class="btn-m3 px-3 py-1 rounded-full text-xs cursor-pointer">
                    Standard Set
                  </button>
                </div>

                <button 
                  (click)="triggerTheater()"
                  class="btn-m3 px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <span class="material-symbols-rounded text-sm">play_arrow</span>
                  <span>Disparar Teatro</span>
                </button>
              </div>
            </div>

            <!-- TEATRO VISUAL DE MOVIMIENTO (RÉPLICA EXACTA DE LA DOCUMENTACIÓN OFICIAL DE GOOGLE) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-main uppercase tracking-wider">{{ motionTheaterSpecs().title }}</h4>
                  <p class="text-[11px] text-muted">{{ motionTheaterSpecs().description }}</p>
                </div>
                <span class="text-[10px] font-mono text-muted">Clic en cualquier tarjeta para probar individualmente</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                @for (c of motionTheaterSpecs().cards; track c.id) {
                  <div 
                    (click)="setEasing(c.id); triggerTheater()"
                    class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3 flex flex-col justify-between hover:border-primary/50 transition-all cursor-pointer shadow-xs select-none">
                    
                    <!-- ENCABEZADO DE TARJETA -->
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [class]="c.animationType === 'decelerate' 
                          ? 'bg-primary-box text-on-primary-box' 
                          : (c.animationType === 'accelerate' ? 'bg-surface-high text-main font-bold border border-outline-sub' : 'bg-primary/10 text-primary')">
                        {{ c.role }}
                      </span>
                      <span class="text-[10px] font-mono text-muted">{{ c.durationToken }}</span>
                    </div>

                    <!-- VISOR GRÁFICO SVG + PISTA VERTICAL (MODELO GOOGLE M3) -->
                    <div class="h-32 bg-surface-high/60 rounded-m3-md p-3 border border-outline-sub flex items-center justify-between overflow-hidden relative">
                      <!-- GRÁFICA VECTORIAL DE LA CURVA -->
                      <div class="w-3/4 h-full flex flex-col justify-between">
                        <svg class="w-full h-24 overflow-visible" viewBox="0 0 140 90">
                          <!-- ÁREA RELLENA SUAVE -->
                          <path [attr.d]="c.svgArea" class="fill-primary/15" />
                          <!-- TRAZO DE LA CURVA -->
                          <path [attr.d]="c.svgCurve" fill="none" stroke="currentColor" class="text-primary" stroke-width="3" stroke-linecap="round" />
                        </svg>
                        <div class="flex items-center justify-between text-[9px] font-mono text-muted pt-1">
                          <span>0s (Inicio)</span>
                          <span>Tiempo &rarr;</span>
                          <span>100% (Meta)</span>
                        </div>
                      </div>

                      <!-- CANAL VERTICAL CON EL PUCK EN MOVIMIENTO -->
                      <div class="w-10 h-full bg-surface rounded-full border border-outline-sub p-1 flex justify-center relative overflow-hidden">
                        @for (play of [demoTheaterPlayCount()]; track play) {
                          <div 
                            class="w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center font-bold text-xs shadow-md absolute"
                            [style.animation]="c.animName + ' ' + c.durationMs + 'ms ' + c.css + ' both'">
                            <span class="material-symbols-rounded text-sm">
                              {{ c.animationType === 'decelerate' ? 'north' : (c.animationType === 'accelerate' ? 'south' : 'swap_vert') }}
                            </span>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- TÍTULO Y RAZÓN ARQUITECTÓNICA (POR QUÉ Y CUÁNDO) -->
                    <div class="space-y-2 text-xs">
                      <div>
                        <h5 class="text-xs font-bold text-main">{{ c.title }}</h5>
                        <p class="text-[11px] text-muted leading-relaxed mt-0.5">{{ c.why }}</p>
                      </div>

                      <div class="p-2 rounded-m3-md bg-surface-high text-[10px] space-y-1 border border-outline-sub/60">
                        <div><strong class="text-main">¿Cuándo usarlo?:</strong> <span class="text-muted">{{ c.when }}</span></div>
                      </div>
                    </div>

                    <!-- ESPECIFICACIONES TÉCNICAS (CSS & ANDROID) -->
                    <div class="pt-2 border-t border-outline-sub text-[10px] font-mono space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-muted">CSS:</span>
                        <span class="text-primary font-bold truncate max-w-[170px]">{{ c.css }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-muted">Android:</span>
                        <span class="text-main truncate max-w-[170px]">{{ c.android }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- ESCALA DE 16 DURACIONES OFICIALES M3 -->
            <div class="space-y-2.5 pt-2 border-t border-outline-sub">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-main uppercase tracking-wider">
                    Escala Canónica de 16 Duraciones (50ms — 1000ms)
                  </h4>
                  <p class="text-[11px] text-muted">Haz clic en un token de tiempo para poner a prueba su velocidad con la curva activa</p>
                </div>
                <div class="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary-box text-on-primary-box">
                  Activo: {{ demoSelectedDurationName() }} ({{ demoSelectedDuration() }}ms)
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                @for (d of canonicalDurations; track d.name) {
                  <button 
                    (click)="testDuration(d.name, d.ms)"
                    [class]="demoSelectedDurationName() === d.name 
                      ? 'border-primary ring-2 ring-primary/30 bg-primary-box/20' 
                      : 'border-outline-sub hover:border-outline bg-surface'"
                    class="btn-m3 p-2.5 rounded-m3-md border text-left flex flex-col justify-between space-y-1 cursor-pointer transition-all">
                    <div class="flex items-center justify-between">
                      <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-muted">{{ d.category }}</span>
                      <span class="text-xs font-mono font-bold text-primary">{{ d.ms }}ms</span>
                    </div>
                    <div class="font-mono text-xs font-bold text-main truncate">{{ d.name }}</div>
                    <div class="text-[10px] text-muted truncate leading-tight">{{ d.usage }}</div>
                  </button>
                }
              </div>
            </div>

            <!-- PISTA DE TELEMETRÍA CINÉTICA EN VIVO -->
            <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-main flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-sm text-primary">speed</span>
                    Pista de Velocidad: {{ demoSelectedDurationName() }} ({{ demoSelectedDuration() }}ms) + {{ activeEasingSpec().label }}
                  </span>
                </div>

                <button 
                  (click)="testDuration(demoSelectedDurationName(), demoSelectedDuration())"
                  class="btn-m3 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1">
                  <span class="material-symbols-rounded text-sm">replay</span>
                  <span>Re-disparar Pista</span>
                </button>
              </div>

              <!-- PISTA DE CARRERA DUAL (BARRA + PUCK FÍSICO) -->
              <div class="space-y-2">
                <!-- BARRA DE RELLENO -->
                <div class="h-3 w-full bg-surface-high rounded-full overflow-hidden relative border border-outline-sub p-0.5">
                  @for (run of [demoDurationRunId()]; track run) {
                    <div 
                      class="h-full bg-primary rounded-full shadow-xs"
                      [style.animation]="'m3DurationTrack ' + demoSelectedDuration() + 'ms ' + activeEasingSpec().curve + ' forwards'">
                    </div>
                  }
                </div>

                <!-- PUCK CINÉTICO (MUESTRA VISUALMENTE ACELERACIÓN Y DESACELERACIÓN) -->
                <div class="h-8 w-full bg-surface-high/40 rounded-m3-md relative overflow-hidden border border-outline-sub flex items-center px-1">
                  @for (run of [demoDurationRunId()]; track run) {
                    <div 
                      class="absolute w-7 h-7 rounded-full bg-primary text-on-primary grid place-items-center shadow-md select-none"
                      [style.animation]="'m3PuckMove ' + demoSelectedDuration() + 'ms ' + activeEasingSpec().curve + ' forwards'">
                      <span class="material-symbols-rounded text-sm">arrow_forward</span>
                    </div>
                  }
                </div>
              </div>

              <!-- EVALUACIÓN DE MARIDAJE M3 -->
              <div class="pt-2 border-t border-outline-sub flex items-center justify-between text-[11px] flex-wrap gap-2">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-rounded text-sm"
                    [class.text-primary]="easingDurationPairingStatus().valid"
                    [class.text-muted]="!easingDurationPairingStatus().valid">
                    {{ easingDurationPairingStatus().valid ? 'verified' : 'lightbulb' }}
                  </span>
                  <span class="font-semibold text-main">{{ easingDurationPairingStatus().text }}</span>
                </div>
                <div class="font-mono text-[10px] text-muted">
                  CSS: transition: all var({{ activeEasingSpec().cssVar }}) var(--md-sys-motion-duration-{{ demoSelectedDurationName() }});
                </div>
              </div>
            </div>

            <!-- 4 CASOS CANÓNICOS OFICIALES GOOGLE M3 (SHORT, MEDIUM, LONG, EXTRA LONG) -->
            <div class="space-y-3 pt-4 border-t border-outline-sub">
              <div>
                <span class="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Material 3 Motion Specs • 4 Casos Canónicos Oficiales
                </span>
                <p class="text-[11px] text-muted mt-0.5">
                  Google prescribe 4 arquetipos esenciales de escala y momentum. Haz clic en cada ejemplo para interactuar con la animación en vivo:
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- CASO 1: SHORT (200ms) - SELECTION CONTROLS -->
                <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                        1. Short (200ms)
                      </span>
                      <span class="text-[10px] font-mono text-primary font-bold">Standard</span>
                    </div>
                    <h5 class="text-xs font-bold text-main pt-1">Selection Controls</h5>
                    <p class="text-[11px] text-muted leading-relaxed">
                      "Selection controls have a short duration of 200ms with Standard easing."
                    </p>
                  </div>

                  <!-- DEMO INTERACTIVA SWITCH M3 -->
                  <div class="h-24 bg-surface-high/60 rounded-m3-md p-3 border border-outline-sub grid place-items-center">
                    <button 
                      (click)="toggleCanonicalSelection()"
                      class="w-14 h-8 rounded-full p-1 cursor-pointer transition-colors relative flex items-center border"
                      [class]="demoCanonicalSelection() ? 'bg-primary border-primary justify-end' : 'bg-surface-high border-outline justify-start'"
                      style="transition-duration: var(--md-sys-motion-duration-short4); transition-timing-function: var(--md-sys-motion-easing-standard);">
                      <div 
                        class="w-6 h-6 rounded-full shadow-sm flex items-center justify-center transition-all"
                        [class]="demoCanonicalSelection() ? 'bg-on-primary text-primary scale-100' : 'bg-outline text-surface scale-85'"
                        style="transition-duration: var(--md-sys-motion-duration-short4); transition-timing-function: var(--md-sys-motion-easing-standard);">
                        <span class="material-symbols-rounded text-xs font-bold">
                          {{ demoCanonicalSelection() ? 'check' : 'close' }}
                        </span>
                      </div>
                    </button>
                  </div>

                  <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                    <div class="truncate"><strong class="text-main">Token:</strong> short4 (200ms)</div>
                    <div class="truncate"><strong class="text-main">Easing:</strong> standard</div>
                  </div>
                </div>

                <!-- CASO 2: MEDIUM (400ms) - FAB TO SHEET -->
                <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                        2. Medium (400ms)
                      </span>
                      <span class="text-[10px] font-mono text-primary font-bold">Emphasized</span>
                    </div>
                    <h5 class="text-xs font-bold text-main pt-1">FAB Expanding into Sheet</h5>
                    <p class="text-[11px] text-muted leading-relaxed">
                      "A FAB expanding into a Sheet uses a 400ms duration with Emphasized easing."
                    </p>
                  </div>

                  <!-- DEMO INTERACTIVA FAB MORPHING -->
                  <div class="h-24 bg-surface-high/60 rounded-m3-md p-2 border border-outline-sub grid place-items-center overflow-hidden">
                    <div 
                      (click)="toggleCanonicalFabSheet()"
                      class="cursor-pointer overflow-hidden shadow-md flex items-center justify-center transition-all"
                      [class]="demoCanonicalFabSheet() 
                        ? 'w-full h-16 rounded-m3-md bg-surface-box border border-primary/40 px-3 py-1' 
                        : 'w-10 h-10 rounded-full bg-primary text-on-primary'"
                      style="transition-duration: var(--md-sys-motion-duration-medium4); transition-timing-function: var(--md-sys-motion-easing-emphasized);">
                      @if (demoCanonicalFabSheet()) {
                        <div class="w-full flex items-center justify-between text-xs">
                          <div class="flex items-center gap-1.5 truncate">
                            <span class="material-symbols-rounded text-primary text-sm">tune</span>
                            <span class="font-bold text-main text-[11px] truncate">Sheet de Acciones</span>
                          </div>
                          <span class="material-symbols-rounded text-muted text-xs hover:text-main">close</span>
                        </div>
                      } @else {
                        <span class="material-symbols-rounded text-base">add</span>
                      }
                    </div>
                  </div>

                  <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                    <div class="truncate"><strong class="text-main">Token:</strong> medium4 (400ms)</div>
                    <div class="truncate"><strong class="text-main">Easing:</strong> emphasized</div>
                  </div>
                </div>

                <!-- CASO 3: LONG (500ms) - CARD TO FULL SCREEN -->
                <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-box text-on-primary-box">
                        3. Long (500ms)
                      </span>
                      <span class="text-[10px] font-mono text-primary font-bold">Emphasized Decel</span>
                    </div>
                    <h5 class="text-xs font-bold text-main pt-1">Card Expanding to Full Screen</h5>
                    <p class="text-[11px] text-muted leading-relaxed">
                      "A Card expanding to full screen uses a long 500ms duration with Emphasized easing."
                    </p>
                  </div>

                  <!-- DEMO INTERACTIVA CARD TRANSFORM -->
                  <div class="h-24 bg-surface-high/60 rounded-m3-md p-2 border border-outline-sub grid place-items-center overflow-hidden">
                    <div 
                      (click)="toggleCanonicalCardExpanded()"
                      class="cursor-pointer overflow-hidden border shadow-sm transition-all"
                      [class]="demoCanonicalCardExpanded() 
                        ? 'w-full h-20 rounded-m3-md bg-surface border-primary p-2' 
                        : 'w-24 h-12 rounded-m3-sm bg-surface-box border-outline-sub p-1.5'"
                      style="transition-duration: var(--md-sys-motion-duration-long2); transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate);">
                      <div class="flex items-center gap-1.5">
                        <span class="material-symbols-rounded text-primary text-xs">dashboard</span>
                        <span class="font-bold text-main text-[10px] truncate">
                          {{ demoCanonicalCardExpanded() ? 'Vista Detallada' : 'Bento Card' }}
                        </span>
                      </div>
                      @if (demoCanonicalCardExpanded()) {
                        <p class="text-[9px] text-muted mt-1 leading-tight">
                          Transformación de contenedor fluida a 500ms.
                        </p>
                      }
                    </div>
                  </div>

                  <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                    <div class="truncate"><strong class="text-main">Token:</strong> long2 (500ms)</div>
                    <div class="truncate"><strong class="text-main">Easing:</strong> emphasized-decelerate</div>
                  </div>
                </div>

                <!-- CASO 4: EXTRA LONG (1000ms) - AMBIENT CAROUSEL -->
                <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub flex flex-col justify-between space-y-3 shadow-xs">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-high text-main border border-outline-sub">
                        4. Extra Long (1000ms)
                      </span>
                      <span class="text-[10px] font-mono text-primary font-bold">Emphasized</span>
                    </div>
                    <h5 class="text-xs font-bold text-main pt-1">Ambient Carousel Slide</h5>
                    <p class="text-[11px] text-muted leading-relaxed">
                      "An ambient carousel auto-advance uses an extra long 1000ms duration with emphasized easing."
                    </p>
                  </div>

                  <!-- DEMO INTERACTIVA CAROUSEL SLIDE -->
                  <div class="h-24 bg-surface-high/60 rounded-m3-md p-2 border border-outline-sub flex flex-col justify-between overflow-hidden">
                    <div class="h-10 w-full overflow-hidden relative rounded-m3-xs border border-outline-sub/60 bg-surface">
                      <div 
                        class="h-full flex transition-transform"
                        [style.transform]="'translateX(-' + (demoCanonicalCarouselIndex() * 100) + '%)'"
                        style="transition-duration: var(--md-sys-motion-duration-extra-long4); transition-timing-function: var(--md-sys-motion-easing-emphasized);">
                        <div class="min-w-full h-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          Slide 1: Ambient A
                        </div>
                        <div class="min-w-full h-full bg-secondary/10 flex items-center justify-center text-[10px] font-bold text-secondary">
                          Slide 2: Ambient B
                        </div>
                        <div class="min-w-full h-full bg-tertiary/10 flex items-center justify-center text-[10px] font-bold text-tertiary">
                          Slide 3: Ambient C
                        </div>
                      </div>
                    </div>

                    <button 
                      (click)="nextCanonicalCarousel()"
                      class="btn-m3 w-full py-1 text-[10px] font-bold rounded-full bg-surface-box hover:bg-surface-high border border-outline-sub text-main flex items-center justify-center gap-1 cursor-pointer">
                      <span class="material-symbols-rounded text-xs">play_arrow</span>
                      <span>Avanzar Slide (1000ms)</span>
                    </button>
                  </div>

                  <div class="text-[10px] font-mono text-muted space-y-0.5 pt-1 border-t border-outline-sub">
                    <div class="truncate"><strong class="text-main">Token:</strong> extra-long4 (1000ms)</div>
                    <div class="truncate"><strong class="text-main">Easing:</strong> emphasized</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARPETAS DE TOKENS OFICIALES (RÉPLICA DE TOKENS & SPECS DE GOOGLE M3) -->
            <div class="space-y-4 pt-4 border-t border-outline-sub">
              <!-- CARPETA 1: EASING TOKENS (10 TOKENS) -->
              <div class="rounded-m3-lg bg-surface border border-outline-sub overflow-hidden shadow-xs">
                <button 
                  (click)="toggleEasingFolder()"
                  class="w-full p-4 flex items-center justify-between hover:bg-surface-high/40 transition-colors cursor-pointer text-left">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-rounded text-primary text-base">folder_open</span>
                    <span class="font-bold text-main text-xs uppercase tracking-wider">Easing Tokens (10 Curvas Oficiales M3)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono text-muted">Emphasized • Standard • Legacy • Linear</span>
                    <span class="material-symbols-rounded text-muted text-sm transition-transform" [class.rotate-180]="demoEasingFolderOpen()">
                      expand_more
                    </span>
                  </div>
                </button>

                @if (demoEasingFolderOpen()) {
                  <div class="p-4 pt-0 border-t border-outline-sub/60 space-y-3">
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
                      @for (e of canonicalEasings; track e.name) {
                        <div 
                          (click)="setEasing(e.name)"
                          [class]="demoSelectedEasing() === e.name ? 'border-primary ring-2 ring-primary/30 bg-primary-box/15' : 'border-outline-sub hover:border-outline bg-surface-box'"
                          class="p-2.5 rounded-m3-md border flex flex-col justify-between space-y-2 cursor-pointer transition-all">
                          <!-- GRÁFICA VECTORIAL MINIATURA -->
                          <div class="h-16 w-full bg-surface-high/60 rounded-m3-xs relative overflow-hidden flex items-center justify-center p-1">
                            <svg class="w-full h-full overflow-visible" viewBox="0 0 100 70">
                              <path [attr.d]="e.svgArea" class="fill-primary/20" />
                              <path [attr.d]="e.svgCurve" fill="none" stroke="currentColor" class="text-primary" stroke-width="2.5" stroke-linecap="round" />
                              <circle cx="85" cy="15" r="4" class="fill-primary" />
                            </svg>
                          </div>
                          <div>
                            <div class="font-bold text-[11px] text-main truncate">{{ e.label }}</div>
                            <div class="text-[9px] font-mono text-muted truncate">{{ e.token }}</div>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- TABLA MULTIPLATAFORMA DEL TOKEN SELECCIONADO -->
                    <div class="mt-3 p-3 rounded-m3-md bg-surface-high/40 border border-outline-sub text-[11px] space-y-2">
                      <div class="flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-main">Especificación Multiplataforma:</span>
                          <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box font-mono font-bold text-[10px]">
                            {{ activeEasingSpec().label }}
                          </span>
                        </div>
                        <span class="text-[10px] font-mono text-muted">{{ activeEasingSpec().token }}</span>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] font-mono pt-1">
                        <div class="p-2 rounded bg-surface border border-outline-sub/60">
                          <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">Android</span>
                          <span class="text-main truncate block mt-0.5">{{ activeEasingSpec().android }}</span>
                        </div>
                        <div class="p-2 rounded bg-surface border border-outline-sub/60">
                          <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">CSS Web</span>
                          <span class="text-primary font-bold truncate block mt-0.5">{{ activeEasingSpec().curve }}</span>
                        </div>
                        <div class="p-2 rounded bg-surface border border-outline-sub/60">
                          <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">Flutter</span>
                          <span class="text-main truncate block mt-0.5">{{ activeEasingSpec().flutter }}</span>
                        </div>
                        <div class="p-2 rounded bg-surface border border-outline-sub/60">
                          <span class="text-muted block text-[9px] uppercase tracking-wider font-sans font-bold">iOS</span>
                          <span class="text-main truncate block mt-0.5">{{ activeEasingSpec().ios }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- PLAYBOOK MAESTRO: CÓMO, DÓNDE, PARA QUÉ, POR QUÉ Y EL TRUCO REAL -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  <span class="material-symbols-rounded text-base text-primary">architecture</span>
                  Playbook de Ejecución • Guía Maestra para Proyectos Reales
                </div>
                <h3 class="text-title-md font-bold text-main">El Truco Real: Cómo, Dónde, Para Qué y Por Qué Aplicar Motion M3</h3>
                <p class="text-xs text-muted max-w-3xl leading-relaxed mt-0.5">
                  Google provee la especificación conceptual en m3.material.io (marcando incluso <code class="font-mono text-primary">CSS: N/A</code> en curvas compuestas). Este motor traduce esos conceptos en 3 reglas operativas y 2 leyes de CSS para construir sistemas como POS, Clínica o Inventario sin fallas visuales.
                </p>
              </div>
              <span class="px-3 py-1 rounded-full bg-primary-box text-on-primary-box text-[11px] font-bold font-mono shrink-0">
                Regla de los 3 Filtros
              </span>
            </div>

            <!-- LOS 3 FILTROS DE DECISIÓN ARQUITECTÓNICA -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- FILTRO 1: DÓNDE Y POR QUÉ (CSS VS VIEW TRANSITIONS) -->
              <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-2.5 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                      Filtro 1 • Ciclo de Vida del DOM
                    </span>
                    <span class="material-symbols-rounded text-primary text-base">account_tree</span>
                  </div>
                  <h4 class="text-xs font-bold text-main">¿Dónde usar CSS Transitions vs. View Transitions API?</h4>
                  <div class="text-[11px] text-muted space-y-1.5 leading-relaxed">
                    <p>
                      <strong class="text-main">CSS Transitions (Mismo componente):</strong> Cuando el nodo permanece vivo en el árbol DOM (expandir una card, FAB &rarr; barra, acordeón). <span class="text-primary font-semibold">Por qué:</span> Interpola en GPU de forma sincrónica sin capturar snapshots.
                    </p>
                    <p>
                      <strong class="text-main">View Transitions API (Ruptura DOM):</strong> En cambios de ruta o modales en overlay global donde el origen se destruye. <span class="text-primary font-semibold">Por qué:</span> Único mecanismo nativo que conecta elementos que no coexisten mediante <code class="font-mono text-main">view-transition-name</code>.
                    </p>
                  </div>
                </div>
                <div class="pt-2 border-t border-outline-sub text-[10px] font-mono text-muted">
                  Regla: Mismo DOM &rarr; CSS • Distinto DOM &rarr; ViewTransition
                </div>
              </div>

              <!-- FILTRO 2: PARA QUÉ (SPATIAL VS EFFECTS) -->
              <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-2.5 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                      Filtro 2 • Física de Propiedades
                    </span>
                    <span class="material-symbols-rounded text-primary text-base">all_inclusive</span>
                  </div>
                  <h4 class="text-xs font-bold text-main">¿Para qué elegir Spatial vs. Effects?</h4>
                  <div class="text-[11px] text-muted space-y-1.5 leading-relaxed">
                    <p>
                      <strong class="text-main">Spatial (&zeta; = 0.9, Subamortiguado):</strong> Para mover geometría (posición, ancho, alto, escala). Usa <code class="font-mono text-primary">Expressive</code> en momentos focales (modales, hero cards) y <code class="font-mono text-main">Standard</code> (+6%) en tablas densas para evitar fatiga visual.
                    </p>
                    <p>
                      <strong class="text-main">Effects (&zeta; = 1.0, Crítico):</strong> Para cambios ópticos (color, opacidad, sombras, bordes). <span class="text-primary font-semibold">Por qué:</span> Cero rebote; oscilar la luminosidad provoca parpadeo y cansancio ocular.
                    </p>
                  </div>
                </div>
                <div class="pt-2 border-t border-outline-sub text-[10px] font-mono text-muted">
                  Regla: Tamaño/Lugar &rarr; Spatial • Color/Luz &rarr; Effects
                </div>
              </div>

              <!-- FILTRO 3: CÓMO CABLEARLO (CERO NÚMEROS MÁGICOS) -->
              <div class="p-4 rounded-m3-lg bg-surface border border-outline-sub space-y-2.5 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded-full bg-primary-box text-on-primary-box text-[10px] font-bold">
                      Filtro 3 • Arquitectura de Tokens
                    </span>
                    <span class="material-symbols-rounded text-primary text-base">css</span>
                  </div>
                  <h4 class="text-xs font-bold text-main">¿Cómo usarlo en el día a día sin deuda técnica?</h4>
                  <div class="text-[11px] text-muted space-y-1.5 leading-relaxed">
                    <p>
                      <strong class="text-main">Prohibidos valores manuales:</strong> Nunca escribas <code class="font-mono text-error">duration-300</code> o <code class="font-mono text-error">ease-out</code> a mano en los módulos de negocio.
                    </p>
                    <p>
                      <strong class="text-main">Consumo de tokens:</strong> Referencia siempre <code class="font-mono text-primary">var(--md-sys-motion-*)</code> desde <code class="font-mono text-main">_motion.css</code>. <span class="text-primary font-semibold">Por qué:</span> Garantiza coherencia en todo el sistema y soporte automático de accesibilidad (<code class="font-mono">prefers-reduced-motion</code>).
                    </p>
                  </div>
                </div>
                <div class="pt-2 border-t border-outline-sub text-[10px] font-mono text-muted">
                  Archivo maestro: src/styles/_motion.css
                </div>
              </div>
            </div>

            <!-- LAS 2 TRAMPAS SILENCIOSAS DE CSS (CERO GLITCHES) -->
            <div class="p-4 rounded-m3-lg bg-surface-high/60 border border-outline-sub space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-rounded text-error text-base">warning</span>
                  <h4 class="text-xs font-bold text-main uppercase tracking-wider">
                    Las 2 Trampas Silenciosas de CSS en Container Transform (Por Qué a Veces Falla la Fluidez)
                  </h4>
                </div>
                <span class="text-[10px] font-mono text-primary font-bold">Leyes Cero-Glitches Verificadas</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub space-y-2">
                  <div class="font-bold text-main flex items-center justify-between">
                    <span>Trampa 1: La Explosión Horizontal (<code class="font-mono text-error">max-width: none</code>)</span>
                    <span class="text-[10px] font-mono text-error font-bold">Anti-Patrón</span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">
                    <strong>El error:</strong> Mezclar <code class="font-mono text-main">w-full max-w-md</code> al expandir con <code class="font-mono text-main">w-72</code> al colapsar. Al cerrar, el navegador quita <code class="font-mono">max-width</code> a <code class="font-mono">none</code> en 0ms mientras <code class="font-mono">width</code> aún interpola desde <code class="font-mono">100%</code>, haciendo que la tarjeta se estire al máximo ancho antes de achicarse.
                  </p>
                  <div class="p-2 rounded bg-surface-high border border-outline-sub/70 text-[10px] font-mono text-primary">
                    Solución: Dejar max-w-full fijo en el HTML e interpolar anchos numéricos explícitos (w-72 &harr; w-[448px]).
                  </div>
                </div>

                <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub space-y-2">
                  <div class="font-bold text-main flex items-center justify-between">
                    <span>Trampa 2: El Hueco Fantasma (<code class="font-mono text-error">height: auto</code> + <code class="font-mono text-error">&#64;if</code>)</span>
                    <span class="text-[10px] font-mono text-error font-bold">Anti-Patrón</span>
                  </div>
                  <p class="text-[11px] text-muted leading-relaxed">
                    <strong>El error:</strong> CSS no puede interpolar <code class="font-mono">height: auto</code>. Además, desmontar el contenido interno con <code class="font-mono">&#64;if</code> en el milisegundo 0 mientras la caja tarda 500ms (<code class="font-mono">long2</code>) en encogerse deja una superficie vacía contrayéndose en pantalla.
                  </p>
                  <div class="p-2 rounded bg-surface-high border border-outline-sub/70 text-[10px] font-mono text-primary">
                    Solución: Alturas explícitas (h-16 &harr; h-48) + overflow-hidden + fade-out asimétrico rápido (100ms short2, delay 0ms).
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PILAR 5: ACCESIBILIDAD Y REDUCED MOTION -->
          <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="space-y-1 max-w-2xl">
              <div class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                <span class="material-symbols-rounded text-base text-primary">accessibility_new</span>
                Accesibilidad Universal • WCAG 2.2 SC 2.3.3
              </div>
              <h3 class="text-base font-bold text-main">Respeto por Prefers-Reduced-Motion</h3>
              <p class="text-xs text-muted leading-relaxed">
                El sistema detecta automáticamente cuando el usuario tiene configurado <code class="font-mono text-primary">&#64;media (prefers-reduced-motion: reduce)</code> en su sistema operativo. En ese instante, todas las animaciones, resortes y transiciones de vista colapsan instantáneamente a <strong>1ms</strong> para garantizar confort vestibular absoluto sin romper la lógica funcional del sistema.
              </p>
            </div>

            <div class="p-3.5 rounded-m3-md bg-surface border border-outline-sub text-xs space-y-1 shrink-0 font-mono">
              <div class="text-muted text-[10px] uppercase font-bold tracking-wider">Regla CSS en _motion.css</div>
              <div class="text-main font-bold">&#64;media (prefers-reduced-motion)</div>
              <div class="text-primary text-[11px]">* {{ '{' }} animation-duration: 1ms !important; {{ '}' }}</div>
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class TokenShowcaseComponent {
  readonly layoutService = inject(AdaptiveLayoutService);

  readonly activeTab = signal<'components' | 'foundations' | 'styles' | 'motion'>('components');
  readonly isMorphed = signal<boolean>(false);
  readonly showHitbox = signal<boolean>(false);
  readonly hitboxClicks = signal<number>(0);

  // Paso 3: Component states
  readonly buttonClicks = signal<number>(0);
  readonly buttonLoading = signal<boolean>(false);
  readonly buttonDisabled = signal<boolean>(false);
  readonly cardClicks = signal<number>(0);
  readonly demoFilter = signal<'ux' | 'code' | 'qa'>('code');
  readonly inputTags = signal<string[]>(['Angular', 'OKLCH', 'Material 3']);

  // Paso 4: Motion & Transitions State
  readonly demoAsymmetryOpen = signal<boolean>(false);
  readonly demoSpringCount = signal<number>(0);
  readonly demoSpringStyle = signal<'expressive' | 'standard'>('expressive');
  readonly demoSpringSpeed = signal<'fast' | 'default' | 'slow'>('fast');
  readonly demoContainerExpanded = signal<boolean>(false);
  readonly demoActivePattern = signal<
    'container' | 'forward-backward' | 'lateral' | 'top-level' | 'enter-exit' | 'skeleton' | 'shared-axis' | 'fade-through' | 'fade'
  >('container');

  // M3 6 Patrones Canónicos State
  readonly demoHierarchicalView = signal<'list' | 'detail'>('list');
  readonly demoHierarchicalDirection = signal<'forward' | 'backward'>('forward');
  readonly demoHierarchicalKey = signal<number>(1);
  readonly demoLateralTab = signal<'general' | 'telemetry' | 'hardware'>('general');
  readonly demoLateralCount = signal<number>(1);
  readonly demoTopLevelDest = signal<'dashboard' | 'fleet' | 'settings'>('dashboard');
  readonly demoTopLevelCount = signal<number>(1);
  readonly demoEnterExitMenuOpen = signal<boolean>(false);
  readonly demoEnterExitSnackbarOpen = signal<boolean>(false);
  readonly demoSkeletonSimulated = signal<boolean>(false);

  readonly demoSharedAxisStep = signal<number>(1);
  readonly demoSharedAxisDimension = signal<'X' | 'Y' | 'Z'>('X');
  readonly demoSharedAxisKey = signal<number>(1);
  readonly demoFadeThroughTab = signal<'A' | 'B'>('A');
  readonly demoFadeThroughCount = signal<number>(1);
  readonly demoFadeVisible = signal<boolean>(true);
  readonly demoSelectedDurationName = signal<string>('medium4');
  readonly demoSelectedDuration = signal<number>(400);
  readonly demoSelectedEasing = signal<string>('emphasized-decelerate');
  readonly demoDurationRunning = signal<boolean>(false);
  readonly demoDurationRunId = signal<number>(1);
  readonly demoTheaterSet = signal<'emphasized' | 'standard'>('emphasized');
  readonly demoTheaterPlayCount = signal<number>(1);

  // 4 Casos Canónicos Oficiales de Google M3
  readonly demoCanonicalSelection = signal<boolean>(true);
  readonly demoCanonicalFabSheet = signal<boolean>(false);
  readonly demoCanonicalCardExpanded = signal<boolean>(false);
  readonly demoCanonicalCarouselIndex = signal<number>(0);
  readonly demoEasingFolderOpen = signal<boolean>(true);
  readonly demoDurationFolderOpen = signal<boolean>(false);

  readonly motionTheaterSpecs = computed(() => {
    const set = this.demoTheaterSet();
    if (set === 'emphasized') {
      return {
        title: 'Emphasized Easing Set',
        description: 'Conjunto principal de M3 Expressive. Brinda carácter y aceleración pronunciada para guiar la atención del usuario.',
        cards: [
          {
            id: 'emphasized-decelerate',
            role: 'Entrada a Pantalla',
            title: 'Emphasized Decelerate',
            token: 'md.sys.motion.easing.emphasized.decelerate',
            css: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
            android: 'PathInterpolator(0.05f, 0.7f, 0.1f, 1f)',
            durationToken: 'medium4 (400ms) / long2 (500ms)',
            durationMs: 450,
            animName: 'm3TheaterDecelerate',
            animationType: 'decelerate',
            why: 'Comienza a alta velocidad para dar feedback inmediato y desacelera suavemente para que el ojo asimile el contenido sin frenazos bruscos.',
            when: 'Modales, diálogos, drawers laterales, bottom sheets y menús principales.',
            svgCurve: 'M 5 80 C 15 25, 25 10, 135 10',
            svgArea: 'M 5 80 C 15 25, 25 10, 135 10 L 135 80 Z'
          },
          {
            id: 'emphasized',
            role: 'En Pantalla (Continuidad)',
            title: 'Emphasized (On-Screen)',
            token: 'md.sys.motion.easing.emphasized',
            css: 'cubic-bezier(0.2, 0, 0, 1)',
            android: 'pathInterpolator(M 0,0 C 0.05, 0, 0.133, 0.06 ...)',
            durationToken: 'medium2 (300ms) / medium4 (400ms)',
            durationMs: 400,
            animName: 'm3TheaterOnScreen',
            animationType: 'onscreen',
            why: 'Acelera y desacelera dentro del campo visual. Al no aparecer ni desaparecer, mantiene la continuidad cognitiva sin sobresaltos.',
            when: 'Container Transform, morphing de tamaño en botones, expansión de cards.',
            svgCurve: 'M 5 80 C 30 75, 35 45, 70 20 C 90 10, 115 10, 135 10',
            svgArea: 'M 5 80 C 30 75, 35 45, 70 20 C 90 10, 115 10, 135 10 L 135 80 Z'
          },
          {
            id: 'emphasized-accelerate',
            role: 'Salida de Pantalla',
            title: 'Emphasized Accelerate',
            token: 'md.sys.motion.easing.emphasized.accelerate',
            css: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
            android: 'PathInterpolator(0.3f, 0f, 0.8f, 0.15f)',
            durationToken: 'short4 (200ms) / short3 (150ms)',
            durationMs: 200,
            animName: 'm3TheaterAccelerate',
            animationType: 'accelerate',
            why: 'Arranca con una inercia sutil y se precipita velozmente fuera del marco. El usuario ya tomó la decisión de descartar y no quiere esperar.',
            when: 'Cierre de modales, dismiss de notificaciones, colapso de superficies.',
            svgCurve: 'M 5 80 C 45 80, 105 70, 135 10',
            svgArea: 'M 5 80 C 45 80, 105 70, 135 10 L 135 80 Z'
          }
        ]
      };
    } else {
      return {
        title: 'Standard Easing Set',
        description: 'Conjunto utilitario y sobrio. Minimiza la distracción visual en interfaces densas y acciones repetitivas de alta frecuencia.',
        cards: [
          {
            id: 'standard-decelerate',
            role: 'Entrada Utilitaria',
            title: 'Standard Decelerate',
            token: 'md.sys.motion.easing.standard.decelerate',
            css: 'cubic-bezier(0, 0, 0, 1)',
            android: 'PathInterpolator(0f, 0f, 0f, 1f)',
            durationToken: 'medium1 (250ms) / medium2 (300ms)',
            durationMs: 250,
            animName: 'm3TheaterDecelerate',
            animationType: 'decelerate',
            why: 'Entrada directa sin aceleración previa. Ideal para componentes compactos donde la inercia dramática sería exagerada.',
            when: 'Tooltips, popovers, menús desplegables, select dropdowns.',
            svgCurve: 'M 5 80 C 5 15, 5 10, 135 10',
            svgArea: 'M 5 80 C 5 15, 5 10, 135 10 L 135 80 Z'
          },
          {
            id: 'standard',
            role: 'En Pantalla (Utilitario)',
            title: 'Standard (On-Screen)',
            token: 'md.sys.motion.easing.standard',
            css: 'cubic-bezier(0.2, 0, 0, 1)',
            android: 'PathInterpolator(0.2f, 0f, 0f, 1f)',
            durationToken: 'short4 (200ms) / medium1 (250ms)',
            durationMs: 200,
            animName: 'm3TheaterOnScreen',
            animationType: 'onscreen',
            why: 'Curva equilibrada sin sobrepaso elástico. Mueve elementos rápidamente manteniendo la interfaz controlada.',
            when: 'Micro-interacciones simples, hover states, switches, focus rings.',
            svgCurve: 'M 5 80 C 30 80, 5 10, 135 10',
            svgArea: 'M 5 80 C 30 80, 5 10, 135 10 L 135 80 Z'
          },
          {
            id: 'standard-accelerate',
            role: 'Salida Utilitaria',
            title: 'Standard Accelerate',
            token: 'md.sys.motion.easing.standard.accelerate',
            css: 'cubic-bezier(0.3, 0, 1, 1)',
            android: 'PathInterpolator(0.3f, 0f, 1f, 1f)',
            durationToken: 'short3 (150ms) / short4 (200ms)',
            durationMs: 150,
            animName: 'm3TheaterAccelerate',
            animationType: 'accelerate',
            why: 'Salida limpia y predecible. Cierra elementos secundarios de forma instantánea sin retrasos perceptibles.',
            when: 'Ocultar tooltips, cerrar menús emergentes, descartar chips.',
            svgCurve: 'M 5 80 C 45 80, 135 10, 135 10',
            svgArea: 'M 5 80 C 45 80, 135 10, 135 10 L 135 80 Z'
          }
        ]
      };
    }
  });

  readonly canonicalEasings: Array<{
    name: string;
    label: string;
    category: 'Emphasized' | 'Standard' | 'Legacy';
    token: string;
    curve: string;
    cssVar: string;
    android: string;
    flutter: string;
    ios: string;
    svgCurve: string;
    svgArea: string;
    usage: string;
  }> = [
    {
      name: 'emphasized',
      label: 'Emphasized',
      category: 'Emphasized',
      token: 'md.sys.motion.easing.emphasized',
      curve: 'cubic-bezier(0.2, 0, 0, 1)',
      cssVar: '--md-sys-motion-easing-emphasized',
      android: 'PathInterpolator(M 0,0 C 0.05, 0, 0.133, 0.06, 0.166, 0.4 C 0.208, 0.82, 0.25, 1, 1, 1)',
      flutter: 'Curves.easeInOutCubicEmphasized',
      ios: 'ControlPoints:0.2f:0.0f:0.0f:1.0f (Fallback)',
      svgCurve: 'M 15 55 C 25 55, 35 15, 85 15',
      svgArea: 'M 15 55 C 25 55, 35 15, 85 15 L 85 55 Z',
      usage: 'Transformaciones de elementos en pantalla (insignia expresiva M3).'
    },
    {
      name: 'emphasized-decelerate',
      label: 'Emphasized Decelerate',
      category: 'Emphasized',
      token: 'md.sys.motion.easing.emphasized.decelerate',
      curve: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      cssVar: '--md-sys-motion-easing-emphasized-decelerate',
      android: 'PathInterpolator(0.05f, 0.7f, 0.1f, 1f)',
      flutter: 'Cubic(0.05, 0.7, 0.1, 1.0)',
      ios: 'ControlPoints:0.05f:0.7f:0.1f:1.0f',
      svgCurve: 'M 15 55 C 18 18, 45 15, 85 15',
      svgArea: 'M 15 55 C 18 18, 45 15, 85 15 L 85 55 Z',
      usage: 'Entrada a pantalla con frenado suave (diálogos, drawers, cards expandidas).'
    },
    {
      name: 'emphasized-accelerate',
      label: 'Emphasized Accelerate',
      category: 'Emphasized',
      token: 'md.sys.motion.easing.emphasized.accelerate',
      curve: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      cssVar: '--md-sys-motion-easing-emphasized-accelerate',
      android: 'PathInterpolator(0.3f, 0f, 0.8f, 0.15f)',
      flutter: 'Cubic(0.3, 0.0, 0.8, 0.15)',
      ios: 'ControlPoints:0.3f:0.0f:0.8f:0.15f',
      svgCurve: 'M 15 55 C 45 55, 75 50, 85 15',
      svgArea: 'M 15 55 C 45 55, 75 50, 85 15 L 85 55 Z',
      usage: 'Salida de pantalla rápida para elementos descartados (dismiss, cerrar modal).'
    },
    {
      name: 'standard',
      label: 'Standard',
      category: 'Standard',
      token: 'md.sys.motion.easing.standard',
      curve: 'cubic-bezier(0.2, 0, 0, 1)',
      cssVar: '--md-sys-motion-easing-standard',
      android: 'PathInterpolator(0.2f, 0f, 0f, 1f)',
      flutter: 'Cubic(0.2, 0.0, 0, 1.0)',
      ios: 'ControlPoints:0.2f:0.0f:0.0f:1.0f',
      svgCurve: 'M 15 55 C 30 55, 20 15, 85 15',
      svgArea: 'M 15 55 C 30 55, 20 15, 85 15 L 85 55 Z',
      usage: 'Transición utilitaria sobria para elementos en pantalla.'
    },
    {
      name: 'standard-decelerate',
      label: 'Standard Decelerate',
      category: 'Standard',
      token: 'md.sys.motion.easing.standard.decelerate',
      curve: 'cubic-bezier(0, 0, 0, 1)',
      cssVar: '--md-sys-motion-easing-standard-decelerate',
      android: 'PathInterpolator(0f, 0f, 0f, 1f)',
      flutter: 'Cubic(0, 0, 0, 1)',
      ios: 'ControlPoints:0.0f:0.0f:0.0f:1.0f',
      svgCurve: 'M 15 55 C 15 15, 40 15, 85 15',
      svgArea: 'M 15 55 C 15 15, 40 15, 85 15 L 85 55 Z',
      usage: 'Entrada directa sin aceleración inicial para elementos pequeños (popovers).'
    },
    {
      name: 'standard-accelerate',
      label: 'Standard Accelerate',
      category: 'Standard',
      token: 'md.sys.motion.easing.standard.accelerate',
      curve: 'cubic-bezier(0.3, 0, 1, 1)',
      cssVar: '--md-sys-motion-easing-standard-accelerate',
      android: 'PathInterpolator(0.3f, 0f, 1f, 1f)',
      flutter: 'Cubic(0.3, 0.0, 1.0, 1.0)',
      ios: 'ControlPoints:0.3f:0.0f:1.0f:1.0f',
      svgCurve: 'M 15 55 C 40 55, 85 15, 85 15',
      svgArea: 'M 15 55 C 40 55, 85 15, 85 15 L 85 55 Z',
      usage: 'Salida utilitaria compacta para descartar elementos secundarios rápido.'
    },
    {
      name: 'legacy',
      label: 'Legacy',
      category: 'Legacy',
      token: 'md.sys.motion.easing.legacy',
      curve: 'cubic-bezier(0.4, 0, 0.2, 1)',
      cssVar: '--md-sys-motion-easing-legacy',
      android: 'PathInterpolator(0.4f, 0f, 0.2f, 1f)',
      flutter: 'Curves.fastOutSlowIn',
      ios: 'ControlPoints:0.4f:0.0f:0.2f:1.0f',
      svgCurve: 'M 15 55 C 35 55, 25 15, 85 15',
      svgArea: 'M 15 55 C 35 55, 25 15, 85 15 L 85 55 Z',
      usage: 'Curva Material 2 clásica de transición simétrica.'
    },
    {
      name: 'legacy-decelerate',
      label: 'Legacy Decelerate',
      category: 'Legacy',
      token: 'md.sys.motion.easing.legacy.decelerate',
      curve: 'cubic-bezier(0, 0, 0.2, 1)',
      cssVar: '--md-sys-motion-easing-legacy-decelerate',
      android: 'PathInterpolator(0f, 0f, 0.2f, 1f)',
      flutter: 'Curves.decelerate',
      ios: 'ControlPoints:0.0f:0.0f:0.2f:1.0f',
      svgCurve: 'M 15 55 C 20 20, 50 15, 85 15',
      svgArea: 'M 15 55 C 20 20, 50 15, 85 15 L 85 55 Z',
      usage: 'Desaceleración clásica de Material 2.'
    },
    {
      name: 'legacy-accelerate',
      label: 'Legacy Accelerate',
      category: 'Legacy',
      token: 'md.sys.motion.easing.legacy.accelerate',
      curve: 'cubic-bezier(0.4, 0, 1, 1)',
      cssVar: '--md-sys-motion-easing-legacy-accelerate',
      android: 'PathInterpolator(0.4f, 0f, 1f, 1f)',
      flutter: 'Curves.fastInSlowOut',
      ios: 'ControlPoints:0.4f:0.0f:1.0f:1.0f',
      svgCurve: 'M 15 55 C 45 55, 80 20, 85 15',
      svgArea: 'M 15 55 C 45 55, 80 20, 85 15 L 85 55 Z',
      usage: 'Aceleración clásica de Material 2.'
    },
    {
      name: 'linear',
      label: 'Linear',
      category: 'Legacy',
      token: 'md.sys.motion.easing.linear',
      curve: 'cubic-bezier(0, 0, 1, 1)',
      cssVar: '--md-sys-motion-easing-linear',
      android: 'LinearInterpolator()',
      flutter: 'Curves.linear',
      ios: 'kCAMediaTimingFunctionLinear',
      svgCurve: 'M 15 55 L 85 15',
      svgArea: 'M 15 55 L 85 15 L 85 55 Z',
      usage: 'Velocidad constante para opacidad pura y rotaciones continuas.'
    }
  ];

  readonly activeEasingSpec = computed(() => {
    return this.canonicalEasings.find(e => e.name === this.demoSelectedEasing()) ?? this.canonicalEasings[0];
  });

  readonly easingDurationPairingStatus = computed(() => {
    const easing = this.demoSelectedEasing();
    const duration = this.demoSelectedDuration();

    if (easing === 'emphasized-decelerate') {
      if (duration === 400 || duration === 500) {
        return { valid: true, text: 'Maridaje Canónico Óptimo (M3: Entrada a pantalla con medium4 o long2)' };
      }
      return { valid: false, text: 'M3 recomienda medium4 (400ms) o long2 (500ms) para decelerate' };
    }
    if (easing === 'emphasized-accelerate') {
      if (duration === 200 || duration === 150) {
        return { valid: true, text: 'Maridaje Canónico Óptimo (M3: Salida rápida con short4 o short3)' };
      }
      return { valid: false, text: 'M3 recomienda short4 (200ms) o short3 (150ms) para accelerate' };
    }
    if (easing === 'emphasized' || easing === 'standard') {
      if (duration >= 250 && duration <= 400) {
        return { valid: true, text: 'Maridaje Canónico Óptimo (M3: Transición interna en pantalla)' };
      }
      return { valid: false, text: 'M3 recomienda 250ms - 400ms (medium) para morphing en pantalla' };
    }
    return { valid: true, text: 'Configuración libre de laboratorio' };
  });

  readonly activeSpringSpecs = computed(() => {
    const style = this.demoSpringStyle();
    const speed = this.demoSpringSpeed();

    const spatialPhysics = {
      fast: { damping: 0.9, stiffness: 1400 },
      default: { damping: 0.9, stiffness: 700 },
      slow: { damping: 0.9, stiffness: 300 }
    }[speed];

    const effectsPhysics = {
      fast: { damping: 1.0, stiffness: 3800 },
      default: { damping: 1.0, stiffness: 1600 },
      slow: { damping: 1.0, stiffness: 800 }
    }[speed];

    const webCurves = {
      expressive: {
        spatial: {
          fast: { curve: 'cubic-bezier(0.42, 1.67, 0.21, 0.90)', duration: 350, token: 'Expressive fast spatial' },
          default: { curve: 'cubic-bezier(0.38, 1.21, 0.22, 1.00)', duration: 500, token: 'Expressive default spatial' },
          slow: { curve: 'cubic-bezier(0.39, 1.29, 0.35, 0.98)', duration: 650, token: 'Expressive slow spatial' }
        },
        effects: {
          fast: { curve: 'cubic-bezier(0.31, 0.94, 0.34, 1.00)', duration: 150, token: 'Expressive fast effects' },
          default: { curve: 'cubic-bezier(0.34, 0.80, 0.34, 1.00)', duration: 200, token: 'Expressive default effects' },
          slow: { curve: 'cubic-bezier(0.34, 0.88, 0.34, 1.00)', duration: 300, token: 'Expressive slow effects' }
        }
      },
      standard: {
        spatial: {
          fast: { curve: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)', duration: 350, token: 'Standard fast spatial' },
          default: { curve: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)', duration: 500, token: 'Standard default spatial' },
          slow: { curve: 'cubic-bezier(0.27, 1.06, 0.18, 1.00)', duration: 750, token: 'Standard slow spatial' }
        },
        effects: {
          fast: { curve: 'cubic-bezier(0.31, 0.94, 0.34, 1.00)', duration: 150, token: 'Standard fast effects' },
          default: { curve: 'cubic-bezier(0.34, 0.80, 0.34, 1.00)', duration: 200, token: 'Standard default effects' },
          slow: { curve: 'cubic-bezier(0.34, 0.88, 0.34, 1.00)', duration: 300, token: 'Standard slow effects' }
        }
      }
    }[style];

    return {
      style,
      speed,
      spatial: {
        ...spatialPhysics,
        ...webCurves.spatial[speed]
      },
      effects: {
        ...effectsPhysics,
        ...webCurves.effects[speed]
      }
    };
  });

  readonly canonicalDurations: Array<{ name: string; ms: number; category: 'Short' | 'Medium' | 'Long' | 'Extra Long'; usage: string }> = [
    { name: 'short1', ms: 50, category: 'Short', usage: 'Desvanecimiento de icono' },
    { name: 'short2', ms: 100, category: 'Short', usage: 'Hover y micro-interacción' },
    { name: 'short3', ms: 150, category: 'Short', usage: 'Tooltips y popovers' },
    { name: 'short4', ms: 200, category: 'Short', usage: 'Salida de modales / dismiss' },
    { name: 'medium1', ms: 250, category: 'Medium', usage: 'Expansión de menú' },
    { name: 'medium2', ms: 300, category: 'Medium', usage: 'Shared axis horizontal' },
    { name: 'medium3', ms: 350, category: 'Medium', usage: 'Morphing de botones' },
    { name: 'medium4', ms: 400, category: 'Medium', usage: 'Entrada de diálogos M3' },
    { name: 'long1', ms: 450, category: 'Long', usage: 'Container Transform grande' },
    { name: 'long2', ms: 500, category: 'Long', usage: 'Hero expansion completa' },
    { name: 'long3', ms: 550, category: 'Long', usage: 'Handoff de vistas complejas' },
    { name: 'long4', ms: 600, category: 'Long', usage: 'Transición entre módulos' },
    { name: 'extra-long1', ms: 700, category: 'Extra Long', usage: 'Stage recessing lento' },
    { name: 'extra-long2', ms: 800, category: 'Extra Long', usage: 'Skeleton a contenido' },
    { name: 'extra-long3', ms: 900, category: 'Extra Long', usage: 'Secuencias guiadas' },
    { name: 'extra-long4', ms: 1000, category: 'Extra Long', usage: 'Splash screen exit' },
  ];

  toggleAsymmetryDemo(): void {
    this.demoAsymmetryOpen.update(v => !v);
  }

  toggleContainerDemo(): void {
    this.demoContainerExpanded.update(v => !v);
  }

  triggerSpringDemo(): void {
    this.demoSpringCount.update(c => c + 1);
  }

  setSpringSpeed(speed: 'fast' | 'default' | 'slow'): void {
    this.demoSpringSpeed.set(speed);
    this.triggerSpringDemo();
  }

  setSpringStyle(style: 'expressive' | 'standard'): void {
    this.demoSpringStyle.set(style);
    this.triggerSpringDemo();
  }

  setPattern(
    pattern: 'container' | 'forward-backward' | 'lateral' | 'top-level' | 'enter-exit' | 'skeleton' | 'shared-axis' | 'fade-through' | 'fade'
  ): void {
    this.demoActivePattern.set(pattern);
  }

  // Métodos de los 6 Patrones Canónicos M3
  navigateToHierarchicalDetail(): void {
    this.demoHierarchicalDirection.set('forward');
    this.demoHierarchicalView.set('detail');
    this.demoHierarchicalKey.update(k => k + 1);
  }

  navigateToHierarchicalList(): void {
    this.demoHierarchicalDirection.set('backward');
    this.demoHierarchicalView.set('list');
    this.demoHierarchicalKey.update(k => k + 1);
  }

  setLateralTab(tab: 'general' | 'telemetry' | 'hardware'): void {
    this.demoLateralTab.set(tab);
    this.demoLateralCount.update(c => c + 1);
  }

  setTopLevelDest(dest: 'dashboard' | 'fleet' | 'settings'): void {
    this.demoTopLevelDest.set(dest);
    this.demoTopLevelCount.update(c => c + 1);
  }

  toggleEnterExitMenu(): void {
    this.demoEnterExitMenuOpen.update(v => !v);
  }

  toggleEnterExitSnackbar(): void {
    this.demoEnterExitSnackbarOpen.update(v => !v);
  }

  triggerSkeletonSim(): void {
    this.demoSkeletonSimulated.set(true);
    setTimeout(() => {
      this.demoSkeletonSimulated.set(false);
    }, 2000);
  }

  setSharedAxisDimension(dim: 'X' | 'Y' | 'Z'): void {
    this.demoSharedAxisDimension.set(dim);
    this.demoSharedAxisKey.update(k => k + 1);
  }

  prevSharedAxisStep(): void {
    this.demoSharedAxisStep.update(s => (s === 1 ? 3 : s - 1));
    this.demoSharedAxisKey.update(k => k + 1);
  }

  nextSharedAxisStep(): void {
    this.demoSharedAxisStep.update(s => (s % 3) + 1);
    this.demoSharedAxisKey.update(k => k + 1);
  }

  toggleFadeThrough(): void {
    this.demoFadeThroughTab.update(t => t === 'A' ? 'B' : 'A');
    this.demoFadeThroughCount.update(c => c + 1);
  }

  toggleFadeDemo(): void {
    this.demoFadeVisible.update(v => !v);
  }

  testDuration(name: string, ms: number): void {
    this.demoSelectedDurationName.set(name);
    this.demoSelectedDuration.set(ms);
    this.demoDurationRunId.update(id => id + 1);
  }

  setEasing(name: string): void {
    this.demoSelectedEasing.set(name);
    this.demoDurationRunId.update(id => id + 1);
  }

  triggerTheater(): void {
    this.demoTheaterPlayCount.update(c => c + 1);
  }

  setTheaterSet(set: 'emphasized' | 'standard'): void {
    this.demoTheaterSet.set(set);
    this.triggerTheater();
  }

  // Métodos de los 4 Casos Canónicos Oficiales de Google M3
  toggleCanonicalSelection(): void {
    this.demoCanonicalSelection.update(v => !v);
  }

  toggleCanonicalFabSheet(): void {
    this.demoCanonicalFabSheet.update(v => !v);
  }

  toggleCanonicalCardExpanded(): void {
    this.demoCanonicalCardExpanded.update(v => !v);
  }

  nextCanonicalCarousel(): void {
    this.demoCanonicalCarouselIndex.update(i => (i + 1) % 3);
  }

  toggleEasingFolder(): void {
    this.demoEasingFolderOpen.update(v => !v);
  }

  toggleDurationFolder(): void {
    this.demoDurationFolderOpen.update(v => !v);
  }

  // Text Fields Demo State
  readonly demoFilledText = signal<string>('Alex Johnson');
  readonly demoOutlinedText = signal<string>('');
  readonly demoPasswordText = signal<string>('mypass');
  readonly demoErrorText = signal<boolean>(true);
  readonly demoMultilineText = signal<string>('Validar puertos y adaptadores en arquitectura hexagonal.');

  // Progress & Loading Demo State
  // Progress & Loading Demo State
  readonly demoProgressValue = signal<number>(68);
  readonly demoProgressBuffer = signal<number>(85);
  readonly demoProgressIndeterminate = signal<boolean>(false);
  readonly demoProgressWavy = signal<boolean>(true);
  readonly demoProgressColor = signal<'primary' | 'secondary' | 'tertiary' | 'error' | 'four-color'>('primary');
  readonly demoSkeletonLoaded = signal<boolean>(false);
  readonly demoPhotosRefreshing = signal<boolean>(true);

  readonly demoLinearColor = computed<'primary' | 'secondary' | 'tertiary' | 'error'>(() => {
    const col = this.demoProgressColor();
    return col === 'four-color' ? 'primary' : col;
  });

  toggleProgressMode(): void {
    this.demoProgressIndeterminate.update(v => !v);
  }

  toggleProgressWavy(): void {
    this.demoProgressWavy.update(v => !v);
  }

  toggleSkeleton(): void {
    this.demoSkeletonLoaded.update(v => !v);
  }

  triggerPhotosRefresh(): void {
    this.demoPhotosRefreshing.set(true);
    setTimeout(() => {
      this.demoPhotosRefreshing.set(false);
    }, 2800);
  }

  onProgressSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.demoProgressValue.set(val);
    this.demoProgressBuffer.set(Math.min(100, val + 15));
  }

  toggleDemoError(): void {
    this.demoErrorText.update(v => !v);
  }

  toggleMorph(): void {
    this.isMorphed.update(v => !v);
  }

  incrementClicks(): void {
    this.buttonClicks.update(c => c + 1);
  }

  incrementCardClicks(): void {
    this.cardClicks.update(c => c + 1);
  }

  setDemoFilter(filter: 'ux' | 'code' | 'qa'): void {
    this.demoFilter.set(filter);
  }

  removeTag(tag: string): void {
    this.inputTags.update(tags => tags.filter(t => t !== tag));
  }

  resetTags(): void {
    this.inputTags.set(['Angular', 'OKLCH', 'Material 3']);
  }
}

