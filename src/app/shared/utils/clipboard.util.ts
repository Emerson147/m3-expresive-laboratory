import { isPlatformBrowser } from '@angular/common';

export interface ClipboardCopyPayload {
  readonly text: string;
  readonly message: string;
}

/**
 * Copies text to the browser clipboard when running in a browser context with
 * Clipboard API support, invoking `onResult` with either `successMessage` or a
 * localized error/fallback notice.
 */
export function copyTextWithFeedback(
  platformId: object,
  text: string,
  successMessage: string,
  onResult: (message: string) => void
): void {
  if (!isPlatformBrowser(platformId) || !navigator?.clipboard?.writeText) {
    onResult('Portapapeles no disponible en este entorno');
    return;
  }

  navigator.clipboard.writeText(text).then(
    () => onResult(successMessage),
    () => onResult('No se pudo copiar al portapapeles')
  );
}
