import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    doc.documentElement.style.removeProperty('--seed-hue');
    doc.documentElement.style.removeProperty('--seed-chroma');
    doc.documentElement.removeAttribute('data-contrast');
    doc.documentElement.removeAttribute('data-motion-scheme');
    doc.documentElement.removeAttribute('data-theme');
  });

  it('updates --seed-hue and clamps --seed-chroma safely on :root', () => {
    service.setThemeHue(155);
    expect(service.currentHue()).toBe(155);
    expect(doc.documentElement.style.getPropertyValue('--seed-hue')).toBe('155');

    service.setSeedChroma(0.08);
    expect(service.seedChroma()).toBe(0.08);
    expect(doc.documentElement.style.getPropertyValue('--seed-chroma')).toBe('0.08');

    service.setSeedChroma(0.5);
    expect(service.seedChroma()).toBe(0.22);

    service.setSeedChroma(-0.1);
    expect(service.seedChroma()).toBe(0);

    service.setSeedChroma(Number.NaN);
    expect(service.seedChroma()).toBe(0);
  });

  it('toggles data-motion-scheme between M3 Expressive (default) and Minimalismo Zen Standard', () => {
    expect(service.motionScheme()).toBe('expressive');
    expect(doc.documentElement.getAttribute('data-motion-scheme')).toBeNull();

    service.setMotionScheme('standard');
    expect(service.motionScheme()).toBe('standard');
    expect(doc.documentElement.getAttribute('data-motion-scheme')).toBe('standard');

    service.setMotionScheme('expressive');
    expect(service.motionScheme()).toBe('expressive');
    expect(doc.documentElement.getAttribute('data-motion-scheme')).toBeNull();
  });

  it('toggles data-contrast attributes accurately', () => {
    service.setContrastLevel('high');
    expect(doc.documentElement.getAttribute('data-contrast')).toBe('high');

    service.setContrastLevel('standard');
    expect(doc.documentElement.getAttribute('data-contrast')).toBeNull();
  });
});
