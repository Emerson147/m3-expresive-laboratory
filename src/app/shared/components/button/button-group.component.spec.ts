import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  M3ButtonGroupComponent,
  M3SplitButtonComponent
} from './button-group.component';
import { M3ButtonComponent } from './button.component';
import { M3FabComponent } from './fab.component';

@Component({
  standalone: true,
  imports: [M3ButtonGroupComponent, M3ButtonComponent],
  template: `
    <m3-button-group variant="standard" ariaLabel="Acciones proyectadas">
      <m3-button variant="filled">Primario</m3-button>
      <m3-button variant="tonal">Secundario</m3-button>
    </m3-button-group>
  `
})
class ProjectedButtonGroupHostComponent {}

describe('M3 Expressive Button Extensions (ButtonGroup, SplitButton, FAB)', () => {
  describe('M3ButtonGroupComponent', () => {
    let component: M3ButtonGroupComponent;
    let fixture: ComponentFixture<M3ButtonGroupComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [M3ButtonGroupComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(M3ButtonGroupComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('options', [
        { id: 'day', label: 'Día', icon: 'today' },
        { id: 'week', label: 'Semana', icon: 'date_range' },
        { id: 'month', label: 'Mes', icon: 'calendar_month' }
      ]);
      fixture.componentRef.setInput('value', ['week']);
      fixture.detectChanges();
    });

    it('should render connected group by default with aria-pressed states', () => {
      const group = fixture.nativeElement.querySelector('[role="group"]') as HTMLElement;
      expect(group.classList.contains('m3-btn-group-connected')).toBe(true);

      const buttons = Array.from(group.querySelectorAll('button')) as HTMLButtonElement[];
      expect(buttons.length).toBe(3);
      expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
      expect(buttons[1].classList.contains('is-selected')).toBe(true);
      expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    });

    it('should replace selection in single mode and toggle in multi mode', () => {
      const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
      buttons[0].click();
      fixture.detectChanges();
      expect(component.value()).toEqual(['day']);

      fixture.componentRef.setInput('selectionMode', 'multi');
      fixture.detectChanges();
      buttons[2].click();
      fixture.detectChanges();
      expect(component.value()).toEqual(['day', 'month']);
    });

    it('renders optional numeric/text badge inside option buttons', () => {
      fixture.componentRef.setInput('options', [
        { id: 'all', label: 'Todas', badge: 6 },
        { id: 'alerts', label: 'Alertas', badge: 2 }
      ]);
      fixture.detectChanges();

      const badges = fixture.nativeElement.querySelectorAll('.m3-btn-group-badge') as NodeListOf<HTMLElement>;
      expect(badges.length).toBe(2);
      expect(badges[0].textContent?.trim()).toBe('6');
      expect(badges[1].textContent?.trim()).toBe('2');
    });

    it('projects action buttons via ng-content when options array is empty', async () => {
      await TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [ProjectedButtonGroupHostComponent]
        })
        .compileComponents();

      const hostFixture = TestBed.createComponent(ProjectedButtonGroupHostComponent);
      hostFixture.detectChanges();

      const group = hostFixture.nativeElement.querySelector('[role="group"]') as HTMLElement;
      expect(group.classList.contains('m3-btn-group-standard')).toBe(true);
      expect(group.classList.contains('m3-btn-group-actions')).toBe(true);
      expect(group.querySelectorAll('button.m3-btn').length).toBe(2);
    });

    it('supports mixed iconOnly and narrow/wide expressive standard groups keeping icon when selected', () => {
      fixture.componentRef.setInput('variant', 'standard');
      fixture.componentRef.setInput('selectionMode', 'multi');
      fixture.componentRef.setInput('options', [
        { id: 'bt', label: 'Bluetooth', icon: 'bluetooth', iconOnly: true },
        { id: 'alarm', label: 'Alarma', icon: 'alarm', iconOnly: true, width: 'wide' },
        { id: 'focus', label: 'Focus', icon: 'do_not_disturb_on' },
        { id: 'torch', label: 'Linterna', icon: 'flashlight_on', iconOnly: true, width: 'narrow' },
        { id: 'wifi', label: 'Wi-Fi', icon: 'wifi', iconOnly: true }
      ]);
      fixture.componentRef.setInput('value', ['wifi']);
      fixture.detectChanges();

      const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
      expect(buttons.length).toBe(5);
      expect(buttons[0].getAttribute('aria-label')).toBe('Bluetooth');
      expect(buttons[0].classList.contains('m3-group-item-icon-only')).toBe(true);
      expect(buttons[1].classList.contains('m3-group-width-wide')).toBe(true);
      expect(buttons[2].getAttribute('aria-label')).toBeNull();
      expect(buttons[3].classList.contains('m3-group-width-narrow')).toBe(true);
      expect(buttons[4].classList.contains('is-selected')).toBe(true);
      expect(buttons[4].querySelector('.material-symbols-rounded')?.textContent?.trim()).toBe('wifi');
    });
  });

  describe('M3SplitButtonComponent', () => {
    let component: M3SplitButtonComponent;
    let fixture: ComponentFixture<M3SplitButtonComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [M3SplitButtonComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(M3SplitButtonComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('label', 'Guardar');
      fixture.componentRef.setInput('menuItems', [
        { id: 'draft', label: 'Guardar borrador', icon: 'edit_note' },
        { id: 'export', label: 'Exportar PDF', icon: 'picture_as_pdf' }
      ]);
      fixture.detectChanges();
    });

    it('should emit primaryAction when leading button is clicked', () => {
      let fired = false;
      component.primaryAction.subscribe(() => (fired = true));

      const leading = fixture.nativeElement.querySelector('.m3-split-btn-leading') as HTMLButtonElement;
      leading.click();
      expect(fired).toBe(true);
    });

    it('should open popover menu and emit itemAction when a menu item is clicked', () => {
      let selectedItem = '';
      component.itemAction.subscribe((id) => (selectedItem = id));

      const trigger = fixture.nativeElement.querySelector('.m3-split-btn-trailing') as HTMLButtonElement;
      trigger.click();
      fixture.detectChanges();

      expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
      const menuItem = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLButtonElement;
      menuItem.click();
      expect(selectedItem).toBe('draft');
    });
  });

  describe('M3FabComponent', () => {
    let component: M3FabComponent;
    let fixture: ComponentFixture<M3FabComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [M3FabComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(M3FabComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should apply standard size class and switch to extended class when label is provided', () => {
      const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(btn.classList.contains('m3-fab-md')).toBe(true);
      expect(btn.classList.contains('m3-fab-extended')).toBe(false);

      fixture.componentRef.setInput('label', 'Nueva orden');
      fixture.detectChanges();
      expect(btn.classList.contains('m3-fab-extended')).toBe(true);
      expect(btn.textContent).toContain('Nueva orden');
    });
  });
});

