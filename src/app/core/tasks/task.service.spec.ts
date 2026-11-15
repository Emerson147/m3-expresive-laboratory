import { TestBed } from '@angular/core/testing';
import { formatTaskDateLabel, normalizeDueBucket, normalizeTimeSlot, TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('normalizes legacy date labels and formats 12h labels consistently', () => {
    expect(normalizeDueBucket('Mañana por la tarde')).toBe('Mañana');
    expect(normalizeDueBucket('Esta semana')).toBe('Esta semana');
    expect(normalizeDueBucket('Hoy, 10:30 AM')).toBe('Hoy');

    expect(normalizeTimeSlot('', 'Hoy, 04:15 PM')).toBe('16:15');
    expect(normalizeTimeSlot('09:05')).toBe('09:05');
    expect(formatTaskDateLabel('Hoy', '16:00')).toBe('Hoy, 04:00 PM');
  });

  it('groups filtered tasks by temporal horizon and filters by search, category, and priority', () => {
    const groups = service.groupedFilteredTasks();
    expect(groups.map(g => g.bucket)).toEqual(['Hoy', 'Mañana', 'Esta semana']);

    service.setPriorityFilter('Alta');
    service.setFilter('pending');
    expect(service.filteredTasks().every(t => !t.completed && t.priority === 'Alta')).toBe(true);

    service.resetAllFilters();
    service.setSearchQuery('Hexagonal');
    expect(service.filteredTasks().length).toBe(1);
    expect(service.filteredTasks()[0].category).toBe('Backend Spring');

    service.setCategoryFilter('Personal');
    expect(service.filteredTasks().length).toBe(0);
  });

  it('creates, updates, manages subtasks, records focus sessions, and cleans up selection on delete', () => {
    const created = service.saveTask(
      {
        title: 'Diseñar grilla Bento M3',
        category: 'Design System',
        dateLabel: 'Mañana',
        dueBucket: 'Mañana',
        timeSlot: '11:30',
        durationMinutes: 45,
        priority: 'Alta',
        notes: 'Aplicar superficies tonales OKLCH.'
      },
      null
    );

    expect(created.dateLabel).toBe('Mañana, 11:30 AM');
    expect(service.selectedTaskId()).toBe(created.id);

    service.addSubtask(created.id, 'Validar contraste Dark Mode');
    const withSub = service.tasks().find(t => t.id === created.id)!;
    expect(withSub.subtasks.length).toBe(1);
    expect(withSub.subtasks[0].done).toBe(false);

    service.toggleSubtask(created.id, withSub.subtasks[0].id);
    expect(service.tasks().find(t => t.id === created.id)!.subtasks[0].done).toBe(true);

    service.recordFocusSession(created.id);
    expect(service.tasks().find(t => t.id === created.id)!.focusSessionsCompleted).toBe(1);

    service.updateTaskFields(created.id, { dueBucket: 'Hoy', timeSlot: '14:00', priority: 'Media' });
    const updated = service.tasks().find(t => t.id === created.id)!;
    expect(updated.dateLabel).toBe('Hoy, 02:00 PM');
    expect(updated.priority).toBe('Media');

    service.deleteTask(created.id);
    expect(service.tasks().some(t => t.id === created.id)).toBe(false);
    expect(service.selectedTaskId()).not.toBe(created.id);
  });
});
