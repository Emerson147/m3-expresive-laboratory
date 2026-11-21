import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3DialogComponent, M3DialogVariant } from './dialog.component';

@Component({
  standalone: true,
  imports: [M3DialogComponent],
  template: `
    <m3-dialog
      [variant]="variant()"
      headline="Host test"
      subtitle="Subtítulo"
      icon="info">
      <span dialog-header-extra class="projected-header-extra">Estado</span>
      <p class="projected-body">Contenido real proyectado</p>
      <button dialog-actions-start type="button">Eliminar</button>
      <button dialog-actions type="button">Confirmar</button>
    </m3-dialog>
  `
})
class DialogProjectionHostComponent {
  readonly variant = signal<M3DialogVariant>('expressive');
}

describe('M3DialogComponent', () => {
  let component: M3DialogComponent;
  let fixture: ComponentFixture<M3DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3DialogComponent, DialogProjectionHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3DialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('headline', 'Confirmar eliminación');
    fixture.componentRef.setInput('ariaDescription', 'Esta acción no se puede deshacer.');
    fixture.detectChanges();
  });

  it('should render native <dialog> wired to aria-labelledby and aria-describedby', () => {
    const dialog = fixture.nativeElement.querySelector('dialog.m3-dialog') as HTMLDialogElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-labelledby')).toBe(component.titleId);
    expect(dialog.getAttribute('aria-describedby')).toBe(component.descId);
    expect(dialog.getAttribute('closedby')).toBe('any');
  });

  it('should invoke showModal/open state when open signal toggles and dismiss cleanly', () => {
    const closedReasons: string[] = [];
    component.closed.subscribe((r) => closedReasons.push(r));

    component.open.set(true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog.m3-dialog') as HTMLDialogElement;
    expect(dialog.hasAttribute('open')).toBe(true);

    component.dismiss('confirm');
    fixture.detectChanges();

    expect(component.open()).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(closedReasons).toContain('confirm');
  });

  it('supports expressive variant with size, tone badge, subtitle, close button, and viewTransitionName', () => {
    fixture.componentRef.setInput('variant', 'expressive');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('tone', 'error');
    fixture.componentRef.setInput('icon', 'delete_sweep');
    fixture.componentRef.setInput('subtitle', 'Esta acción limpia los registros completados.');
    fixture.componentRef.setInput('viewTransitionName', 'dialog-transform');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog.m3-dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('m3-dialog-expressive')).toBe(true);
    expect(dialog.classList.contains('m3-dialog-lg')).toBe(true);
    expect(dialog.classList.contains('is-vt-managed')).toBe(true);
    expect(dialog.getAttribute('aria-describedby')).toBe(component.extraDescId);

    fixture.componentRef.setInput('ariaDescription', null);
    fixture.detectChanges();
    expect(dialog.getAttribute('aria-describedby')).toBe(component.descId);

    expect(dialog.style.getPropertyValue('view-transition-name')).toBe('dialog-transform');

    expect(fixture.nativeElement.querySelector('header .bg-error-box')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Esta acción limpia los registros completados.');

    const closeBtn = fixture.nativeElement.querySelector('header m3-button button') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    const bodyWrapper = fixture.nativeElement.querySelector('.m3-dialog-body') as HTMLElement;
    expect(bodyWrapper).toBeTruthy();
    expect(bodyWrapper.classList.contains('flex-1')).toBe(false);
    expect(bodyWrapper.classList.contains('flex-initial')).toBe(true);

    component.open.set(true);
    fixture.detectChanges();
    closeBtn.click();
    fixture.detectChanges();

    expect(component.open()).toBe(false);
  });

  it('preserves default and action slot projection across both expressive and basic variants', () => {
    const hostFixture = TestBed.createComponent(DialogProjectionHostComponent);
    hostFixture.detectChanges();

    const hostEl = hostFixture.nativeElement as HTMLElement;
    expect(hostEl.querySelector('.m3-dialog-body .projected-body')?.textContent?.trim()).toBe(
      'Contenido real proyectado'
    );
    expect(hostEl.querySelector('.m3-dialog-footer [dialog-actions-start]')?.textContent?.trim()).toBe(
      'Eliminar'
    );
    expect(hostEl.querySelector('.m3-dialog-footer [dialog-actions]')?.textContent?.trim()).toBe(
      'Confirmar'
    );
    expect(hostEl.querySelector('header .projected-header-extra')?.textContent?.trim()).toBe('Estado');

    hostFixture.componentInstance.variant.set('basic');
    hostFixture.detectChanges();
    expect(hostEl.querySelector('.m3-dialog-body .projected-body')?.textContent?.trim()).toBe(
      'Contenido real proyectado'
    );
    expect(hostEl.querySelector('.m3-dialog-footer [dialog-actions]')?.textContent?.trim()).toBe(
      'Confirmar'
    );
  });

  it('supports fullscreen size with GPU aurora orbs when aurora is enabled', () => {
    fixture.componentRef.setInput('variant', 'expressive');
    fixture.componentRef.setInput('size', 'fullscreen');
    fixture.componentRef.setInput('aurora', true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog.m3-dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('m3-dialog-fullscreen')).toBe(true);
    expect(dialog.classList.contains('hero-mesh-m3')).toBe(true);
    expect(dialog.classList.contains('m3-aurora-glow')).toBe(true);
    expect(dialog.querySelectorAll('.m3-aurora-orb').length).toBe(3);
  });

  it('defers close to closeRequested when managedClose is enabled so View Transitions can snapshot before closing', () => {
    const requested: string[] = [];
    component.closeRequested.subscribe(r => requested.push(r));
    fixture.componentRef.setInput('managedClose', true);
    component.open.set(true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog.m3-dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('closedby')).toBe('none');

    component.dismiss('escape');
    fixture.detectChanges();

    expect(requested).toEqual(['escape']);
    expect(component.open()).toBe(true);
    expect(dialog.hasAttribute('open')).toBe(true);

    component.open.set(false);
    fixture.detectChanges();
    expect(dialog.hasAttribute('open')).toBe(false);
  });
});
