import { Component, signal } from '@angular/core';

/**
 * Laboratory page for Step 1 (Styles): OKLCH tonal surfaces, shape tokens, and typography roles.
 */
@Component({
  selector: 'app-styles-lab',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- TARJETAS INTERACTIVAS PASO 1 -->
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

      <!-- REGLAS DE ARQUITECTURA DE ESTILOS -->
      <div class="bg-surface-box border border-outline-sub p-6 rounded-m3-xl shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-1.5">
          <div class="text-xs font-bold text-primary flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base">contrast</span>
            1. Jerarquía sin Sombras Pesadas
          </div>
          <p class="text-[11px] text-muted leading-relaxed">
            La profundidad visual nace del salto tonal entre <code class="font-mono text-main">surface-lowest</code> y <code class="font-mono text-main">surface-highest</code>. En modo oscuro, la elevación aclara la superficie en lugar de oscurecerla.
          </p>
        </div>

        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-1.5">
          <div class="text-xs font-bold text-primary flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base">tune</span>
            2. Emparejamiento Obligatorio on-*
          </div>
          <p class="text-[11px] text-muted leading-relaxed">
            Cada contenedor semántico (<code class="font-mono text-main">bg-primary-box</code>) exige su color de tinta pareado (<code class="font-mono text-main">text-on-primary-box</code>) para sostener el contraste al cambiar de tema dinámico.
          </p>
        </div>

        <div class="p-4 rounded-m3-lg bg-surface-low border border-outline-sub space-y-1.5">
          <div class="text-xs font-bold text-primary flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base">rounded_corner</span>
            3. Geometría como Feedback
          </div>
          <p class="text-[11px] text-muted leading-relaxed">
            El cambio de <code class="font-mono text-main">rounded-m3-full</code> a <code class="font-mono text-main">rounded-m3-md</code> comunica cambio de estado sin añadir bordes ni badges redundantes.
          </p>
        </div>
      </div>
    </div>
  `
})
export class StylesLabComponent {
  readonly isMorphed = signal<boolean>(false);

  toggleMorph(): void {
    this.isMorphed.update(v => !v);
  }
}
