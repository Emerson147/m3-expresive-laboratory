import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppSection } from '../models/ui.models';
import { CommandPaletteComponent } from './command-palette.component';

@Component({
  standalone: true,
  imports: [CommandPaletteComponent],
  template: `
    <app-command-palette
      [isOpen]="isOpen()"
      [currentSection]="section()"
      (closed)="onClosed()"
      (navigate)="onNavigate($event)"
      (openQuickTask)="onOpenQuickTask()" />
  `
})
class TestHostComponent {
  readonly isOpen = signal(false);
  readonly section = signal<AppSection>('overview');
  closedCalls = 0;
  navigatedRoutes: string[] = [];
  quickTaskCalls = 0;

  onClosed(): void {
    this.closedCalls += 1;
    this.isOpen.set(false);
  }

  onNavigate(route: string): void {
    this.navigatedRoutes.push(route);
  }

  onOpenQuickTask(): void {
    this.quickTaskCalls += 1;
  }
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('CommandPaletteComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  function setup(initiallyOpen = true) {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.isOpen.set(initiallyOpen);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const dialog = compiled.querySelector('dialog.m3-command-dialog') as HTMLDialogElement;
    const input = compiled.querySelector('#command-palette-input') as HTMLInputElement;
    return { fixture, host: fixture.componentInstance, compiled, dialog, input };
  }

  it('opens native modal dialog safely with <search> landmark and closedby="any"', () => {
    const { compiled, dialog, input } = setup(true);

    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('closedby')).toBe('any');
    expect(dialog.open || dialog.hasAttribute('open')).toBe(true);
    expect(compiled.querySelector('search')).toBeTruthy();
    expect(input.getAttribute('type')).toBe('search');
  });

  it('filters items across Módulos, Design System, and Acciones for clínica, oklch, and tema', () => {
    const { fixture, compiled, input } = setup(true);

    input.value = 'clínica';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Clínica & Triaje');

    input.value = 'oklch';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(compiled.textContent).toContain('OKLCH');

    input.value = 'tema';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Modo');
  });

  it('shows empty state when query has no matches', () => {
    const { fixture, compiled, input } = setup(true);

    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Sin coincidencias para "zzzz-no-existe"');
  });

  it('navigates highlighted item with ArrowDown + Enter and closes cleanly', async () => {
    const { fixture, host, dialog, input } = setup(true);
    const paletteComp = fixture.debugElement.children[0].componentInstance as CommandPaletteComponent;

    expect(paletteComp.activeIndex()).toBe(0);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    fixture.detectChanges();
    expect(paletteComp.activeIndex()).toBe(1);

    const expectedLabel = paletteComp.filteredItems()[1].label;
    expect(expectedLabel).toBeTruthy();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    await flushMicrotasks();
    fixture.detectChanges();

    expect(host.closedCalls).toBe(1);
    expect(host.isOpen()).toBe(false);
    expect(host.navigatedRoutes.length).toBe(1);
    expect(dialog.open || dialog.hasAttribute('open')).toBe(false);
  });

  it('closes on native cancel event or backdrop click without throwing when showModal/close are absent', async () => {
    const { fixture, host, dialog } = setup(false);

    // Force a mock dialog without showModal/close to verify progressive fallback
    Object.defineProperty(dialog, 'showModal', { value: undefined, configurable: true });
    Object.defineProperty(dialog, 'close', { value: undefined, configurable: true });

    host.isOpen.set(true);
    fixture.detectChanges();
    expect(dialog.hasAttribute('open')).toBe(true);

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await flushMicrotasks();
    fixture.detectChanges();

    expect(host.closedCalls).toBe(1);
    expect(dialog.hasAttribute('open')).toBe(false);

    host.isOpen.set(true);
    fixture.detectChanges();
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushMicrotasks();
    fixture.detectChanges();

    expect(host.closedCalls).toBe(2);
    expect(dialog.hasAttribute('open')).toBe(false);
  });
});
