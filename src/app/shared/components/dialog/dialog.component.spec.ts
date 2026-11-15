import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3DialogComponent } from './dialog.component';

describe('M3DialogComponent', () => {
  let component: M3DialogComponent;
  let fixture: ComponentFixture<M3DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3DialogComponent]
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
});
