import { ContrastLevel } from '../../../../core/theme/theme.service';

export interface StylesCopyRequest {
  text: string;
  message: string;
}

export type ForcedStateMode = 'live' | 'hover' | 'focus' | 'pressed' | 'dragged' | 'disabled';
export type TypeCategoryFilter = 'all' | 'display' | 'headline' | 'title' | 'body' | 'label';
export type StylesCaseFilter = 'all' | 'case-1' | 'case-2' | 'case-3' | 'case-4' | 'case-5' | 'case-6';

export function buildPortableThemeCssSnippet(
  hue: number,
  chroma: number,
  isDarkMode: boolean,
  contrast: ContrastLevel
): string {
  const chromaFormatted = Number(chroma).toFixed(2);
  const rootAttrs: string[] = [];
  if (isDarkMode) rootAttrs.push('data-theme="dark"');
  if (contrast !== 'standard') rootAttrs.push(`data-contrast="${contrast}"`);

  const htmlAttrComment =
    rootAttrs.length > 0
      ? `/* <html ${rootAttrs.join(' ')}> */\n`
      : '';

  return `${htmlAttrComment}@import "./styles/m3-expressive.css";

:root {
  --seed-hue: ${Math.round(hue)};
  --seed-chroma: ${chromaFormatted};
}`;
}
