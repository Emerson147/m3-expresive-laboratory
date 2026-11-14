import { ComponentFixture, TestBed } from '@angular/core/testing';
import { M3SnackbarComponent } from './snackbar.component';

describe('M3SnackbarComponent', () => {
  let component: M3SnackbarComponent;
  let fixture: ComponentFixture<M3SnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [M3SnackbarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(M3SnackbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'Cambios guardados correctamente');
    fixture.componentRef.setInput('actionLabel', 'Deshacer');
    fixture.componentRef.setInput('durationMs', 0);
    fixture.detectChanges();
  });

  it('should configure manual popover with status live region', () => {
    const el = fixture.nativeElement.querySelector('.m3-snackbar') as HTMLElement;
    expect(el.getAttribute('popover')).toBe('manual');
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });

  it('should emit action and close when action button is clicked while open', () => {
    let actionFired = false;
    let dismissedFired = false;
    component.action.subscribe(() => (actionFired = true));
    component.dismissed.subscribe(() => (dismissedFired = true));

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const actionBtn = fixture.nativeElement.querySelector('.m3-snackbar-action') as HTMLButtonElement;
    actionBtn.click();
    fixture.detectChanges();

    expect(actionFired).toBe(true);
    expect(dismissedFired).toBe(true);
    expect(component.open()).toBe(false);
  });

  it('should close when close icon button is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.m3-snackbar-close') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(component.open()).toBe(false);
  });
});

