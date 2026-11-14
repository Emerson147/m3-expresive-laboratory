import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  M3ButtonGroupComponent,
  M3SplitButtonComponent
} from './button-group.component';
import { M3FabComponent } from './fab.component';

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

