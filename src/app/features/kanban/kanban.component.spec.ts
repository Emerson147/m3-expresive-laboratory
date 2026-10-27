import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanComponent } from './kanban.component';
import { KanbanService } from '../../core/kanban/kanban.service';
import { ThemeService } from '../../core/theme/theme.service';

describe('KanbanComponent', () => {
  let component: KanbanComponent;
  let fixture: ComponentFixture<KanbanComponent>;
  let kanbanService: KanbanService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanComponent],
      providers: [KanbanService, ThemeService]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanComponent);
    component = fixture.componentInstance;
    kanbanService = TestBed.inject(KanbanService);
    fixture.detectChanges();
  });

  it('should create the kanban component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Kanban header and 4 columns', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('h1');
    expect(title?.textContent).toContain('Kanban Operativo');

    const columns = el.querySelectorAll('main > div');
    expect(columns.length).toBe(4);
  });

  it('should open and close ticket inspection modal', () => {
    const order = kanbanService.orders()[0];
    kanbanService.openOrderInspection(order);
    fixture.detectChanges();

    expect(kanbanService.isInspectionOpen()).toBe(true);

    component.onEscape();
    fixture.detectChanges();
    expect(kanbanService.isInspectionOpen()).toBe(false);
  });

  it('should open create order modal and submit new ticket', () => {
    component.openCreateOrderModal();
    expect(component.isCreateModalOpen()).toBe(true);

    const initialCount = kanbanService.orders().length;
    component.newOrderTable = 'Mesa 99 · VIP';
    component.submitNewOrder();

    expect(component.isCreateModalOpen()).toBe(false);
    expect(kanbanService.orders().length).toBe(initialCount + 1);
  });

  it('should toggle buzzer state in kanbanService', () => {
    expect(component.buzzerEnabled()).toBe(true);
    component.toggleBuzzer();
    expect(kanbanService.buzzerEnabled()).toBe(false);
    expect(component.buzzerEnabled()).toBe(false);
  });
});
