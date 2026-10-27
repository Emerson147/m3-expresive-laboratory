import { computed, Injectable, signal } from '@angular/core';

export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type FilterStatus = 'all' | 'pending' | 'completed';

export interface TaskItem {
  readonly id: number;
  readonly title: string;
  readonly category: string;
  readonly dateLabel: string;
  readonly priority: TaskPriority;
  readonly notes: string;
  readonly completed: boolean;
}

export interface TaskDraft {
  readonly title: string;
  readonly category: string;
  readonly dateLabel: string;
  readonly priority: TaskPriority;
  readonly notes: string;
}

const INITIAL_TASKS: readonly TaskItem[] = [
  {
    id: 1,
    title: 'Revisión arquitectónica de DenRaf (Hexagonal + DDD)',
    category: 'Backend Spring',
    dateLabel: 'Hoy, 10:30 AM',
    priority: 'Alta',
    notes: 'Validar puertos de salida en Spring Boot y adaptadores de persistencia.',
    completed: true
  },
  {
    id: 2,
    title: 'Refinar Container Transform con View Transitions API',
    category: 'Frontend Angular',
    dateLabel: 'Hoy, 04:00 PM',
    priority: 'Alta',
    notes: 'Aislar grupos de transición y aplicar desenfoque espacial al stage.',
    completed: false
  },
  {
    id: 3,
    title: 'Definir escala tipográfica Plus Jakarta Sans',
    category: 'Design System',
    dateLabel: 'Mañana',
    priority: 'Media',
    notes: 'Ajustar pesos y tracking negativo para cabeceras Display M3.',
    completed: false
  }
];

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  readonly tasks = signal<readonly TaskItem[]>(INITIAL_TASKS);
  readonly filterStatus = signal<FilterStatus>('all');

  readonly completedCount = computed(() => this.tasks().filter(t => t.completed).length);
  readonly pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);
  readonly completionRate = computed(() => {
    const total = this.tasks().length;
    return total ? Math.round((this.completedCount() / total) * 100) : 0;
  });

  readonly filteredTasks = computed(() => {
    const status = this.filterStatus();
    const all = this.tasks();
    if (status === 'pending') return all.filter(t => !t.completed);
    if (status === 'completed') return all.filter(t => t.completed);
    return all;
  });

  saveTask(draft: TaskDraft, editingId: number | null): void {
    const title = draft.title.trim() || 'Nueva actividad M3 Expressive';

    if (editingId !== null) {
      this.tasks.update(list =>
        list.map(t =>
          t.id === editingId
            ? {
                ...t,
                title,
                category: draft.category,
                dateLabel: draft.dateLabel,
                priority: draft.priority,
                notes: draft.notes.trim()
              }
            : t
        )
      );
    } else {
      const created: TaskItem = {
        id: Date.now(),
        title,
        category: draft.category,
        dateLabel: draft.dateLabel,
        priority: draft.priority,
        notes: draft.notes.trim() || 'Registrado desde contenedor expresivo.',
        completed: false
      };
      this.tasks.update(prev => [created, ...prev]);
    }
  }

  deleteTask(id: number): void {
    this.tasks.update(list => list.filter(t => t.id !== id));
  }

  toggleCompleted(id: number): void {
    this.tasks.update(list =>
      list.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  }

  setFilter(status: FilterStatus): void {
    this.filterStatus.set(status);
  }
}
