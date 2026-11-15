let cachedDisplayTransitionSupport: boolean | undefined;

/** Feature detection for the native Popover API. */
export function supportsNativePopover(): boolean {
  return (
    typeof HTMLElement !== 'undefined' &&
    'popover' in HTMLElement.prototype &&
    typeof HTMLElement.prototype.showPopover === 'function'
  );
}

/**
 * Probes whether transitioning `display` from `block` to `none` with `allow-discrete`
 * genuinely keeps `display: block` mid-transition rather than dropping to `none`.
 */
export function canTransitionDisplay(): boolean {
  if (cachedDisplayTransitionSupport !== undefined) return cachedDisplayTransitionSupport;
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) {
    return false;
  }
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete')) {
    cachedDisplayTransitionSupport = false;
    return false;
  }

  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  cachedDisplayTransitionSupport = getComputedStyle(probe).display === 'block';
  probe.remove();
  return cachedDisplayTransitionSupport;
}

/** Checks whether CSS top-layer exit transitions (`overlay` + `allow-discrete` display) are active. */
export function supportsTopLayerExit(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.CSS?.supports?.('overlay', 'auto')) && canTransitionDisplay();
}

/**
 * Closes a native modal `<dialog>` cleanly: relies on CSS `overlay` + `allow-discrete` when
 * supported, or animates `[data-closing]` via `getAnimations()` before invoking `.close()`.
 */
export async function closeTopLayerDialog(dialog: HTMLDialogElement | undefined): Promise<void> {
  if (!dialog || (!dialog.open && !dialog.hasAttribute('open'))) return;

  if (!supportsTopLayerExit()) {
    dialog.setAttribute('data-closing', '');
    const animations =
      typeof dialog.getAnimations === 'function' ? dialog.getAnimations({ subtree: true }) : [];
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((animation) => animation.finished)),
        new Promise<void>((resolve) => setTimeout(resolve, 400))
      ]);
    }
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
  }

  if (typeof dialog.close === 'function') {
    try {
      if (dialog.open) dialog.close();
      else dialog.removeAttribute('open');
    } catch {
      dialog.removeAttribute('open');
    }
  } else {
    dialog.removeAttribute('open');
  }
}

/** Dismisses a native `[popover="auto"]` element or updates its non-native fallback state. */
export function dismissPopover(
  popoverEl: HTMLElement | undefined,
  closeFallback?: () => void
): void {
  if (supportsNativePopover() && popoverEl?.matches(':popover-open')) {
    popoverEl.hidePopover();
  }
  closeFallback?.();
}
