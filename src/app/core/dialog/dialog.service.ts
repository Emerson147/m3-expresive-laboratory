import { ApplicationRef, computed, inject, Injectable, signal } from '@angular/core';
import {
  DialogView,
  NavChromeMode,
  NavStyle,
  resolveNavChrome,
  TransitionType,
  TriggerMode
} from '../../shared/models/ui.models';
import { AdaptiveLayoutService } from '../layout/adaptive-layout.service';
import { StageOverlayService } from './stage-overlay.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly adaptiveLayout = inject(AdaptiveLayoutService);
  private readonly stageOverlay = inject(StageOverlayService);

  readonly isDialogOpen = signal<boolean>(false);
  readonly activeTrigger = signal<TriggerMode | null>(null);
  readonly dialogView = signal<DialogView>('menu-main');
  readonly activeTransition = signal<TransitionType>(null);
  readonly navStyle = signal<NavStyle>('auto');
  readonly isRailManuallyExpanded = signal<boolean | null>(null);

  /** Canonical M3 Expressive chrome mode resolved from NavStyle + AdaptiveLayoutService breakpoints. */
  readonly effectiveChrome = computed<NavChromeMode>(() =>
    resolveNavChrome(
      this.navStyle(),
      this.adaptiveLayout.windowWidth(),
      this.isRailManuallyExpanded()
    )
  );

  openFrom(trigger: TriggerMode = 'menu-bottom-left'): void {
    this.activeTransition.set('dialog');
    this.dialogView.set('menu-main');
    this.activeTrigger.set(trigger);

    // Synchronize DOM so the global shell trigger owns view-transition-name before snapshot
    this.appRef.tick();

    this.runViewTransition(
      () => this.isDialogOpen.set(true),
      () => this.activeTransition.set(null)
    );
  }

  closeDialog(): void {
    if (!this.isDialogOpen()) return;
    this.activeTransition.set('dialog');
    this.appRef.tick();

    this.runViewTransition(
      () => {
        this.isDialogOpen.set(false);
      },
      () => {
        this.activeTransition.set(null);
        this.activeTrigger.set(null);
      },
      true
    );
  }

  setNavStyle(style: NavStyle): void {
    if (this.navStyle() === style) return;
    if (style === 'auto') {
      this.isRailManuallyExpanded.set(null);
    }
    this.activeTransition.set('nav');
    this.appRef.tick();

    this.runViewTransition(
      () => this.navStyle.set(style),
      () => this.activeTransition.set(null)
    );
  }

  private runViewTransition(update: () => void, cleanup: () => void, isExiting = false): void {
    this.stageOverlay.runViewTransition(update, cleanup, { isExiting });
  }
}
