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
    </div>
  `
})
export class TokenShowcaseComponent {
  readonly layoutService = inject(AdaptiveLayoutService);

  readonly activeTab = signal<'components' | 'foundations' | 'styles'>('components');
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

