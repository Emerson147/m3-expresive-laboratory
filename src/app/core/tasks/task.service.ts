import { computed, Injectable, signal } from '@angular/core';

export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type FilterStatus = 'all' | 'pending' | 'completed';
export type TaskDueBucket = 'Hoy' | 'Mañana' | 'Esta semana';
export type TaskCategory =
  | 'Frontend Angular'
  | 'Backend Spring'
  | 'Design System'
  | 'Clínica & Ops'
  | 'Personal';

export interface TaskCategoryMeta {
  readonly name: TaskCategory;
  readonly icon: string;
  readonly tone: 'primary' | 'secondary' | 'tertiary';
}

export const TASK_CATEGORIES: readonly TaskCategoryMeta[] = [
  { name: 'Frontend Angular', icon: 'code_blocks', tone: 'primary' },
  { name: 'Backend Spring', icon: 'dns', tone: 'secondary' },
  { name: 'Design System', icon: 'palette', tone: 'tertiary' },
  { name: 'Clínica & Ops', icon: 'medical_services', tone: 'primary' },
  { name: 'Personal', icon: 'person', tone: 'secondary' }
];

export const TASK_DUE_BUCKETS: readonly TaskDueBucket[] = ['Hoy', 'Mañana', 'Esta semana'];
export const TASK_PRIORITIES: readonly TaskPriority[] = ['Alta', 'Media', 'Baja'];
export const TASK_DURATIONS: readonly number[] = [15, 25, 45, 60];

export interface TaskSubtask {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
}

export interface TaskItem {
  readonly id: number;
  readonly title: string;
  readonly category: string;
  readonly dueBucket: TaskDueBucket;
  readonly timeSlot: string;
  readonly dateLabel: string;
  readonly durationMinutes: number;
  readonly priority: TaskPriority;
  readonly notes: string;
  readonly subtasks: readonly TaskSubtask[];
  readonly focusSessionsCompleted: number;
  readonly completed: boolean;
}

export interface TaskDraft {
  readonly title: string;
  readonly category: string;
  readonly dateLabel: string;
  readonly dueBucket?: TaskDueBucket;
  readonly timeSlot?: string;
  readonly durationMinutes?: number;
  readonly priority: TaskPriority;
  readonly notes: string;
}

export interface TaskGroup {
  readonly bucket: TaskDueBucket;
  readonly items: readonly TaskItem[];
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  Alta: 0,
  Media: 1,
  Baja: 2
};

const BUCKET_RANK: Record<TaskDueBucket, number> = {
  Hoy: 0,
  Mañana: 1,
  'Esta semana': 2
};

export function formatTimeSlot12h(timeSlot: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeSlot.trim());
  if (!match) return timeSlot.trim();

  const hours24 = Number(match[1]);
  const minutes = match[2];
  if (Number.isNaN(hours24) || hours24 < 0 || hours24 > 23) return timeSlot.trim();

  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
}

export function formatTaskDateLabel(dueBucket: TaskDueBucket, timeSlot: string): string {
  const cleanSlot = timeSlot.trim();
  if (!cleanSlot) return dueBucket;
  return `${dueBucket}, ${formatTimeSlot12h(cleanSlot)}`;
}

export function normalizeDueBucket(raw: string | undefined): TaskDueBucket {
  if (!raw) return 'Hoy';
  const lower = raw.toLowerCase();
  if (lower.includes('mañana')) return 'Mañana';
  if (lower.includes('semana')) return 'Esta semana';
  return 'Hoy';
}

export function normalizeTimeSlot(rawTime: string | undefined, fallbackDateLabel?: string): string {
  const trimmed = rawTime?.trim() ?? '';
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const amPmMatch = /(\d{1,2}):(\d{2})\s*(am|pm)/i.exec(fallbackDateLabel ?? '');
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const mins = amPmMatch[2];
    const period = amPmMatch[3].toLowerCase();
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${mins}`;
  }

  return '';
}

export function getCategoryMeta(category: string): TaskCategoryMeta {
  return (
    TASK_CATEGORIES.find(c => c.name === category) ?? {
      name: 'Personal',
      icon: 'bookmark',
      tone: 'secondary'
    }
  );
}

const INITIAL_TASKS: readonly TaskItem[] = [
  {
    id: 1,
    title: 'Revisión arquitectónica de DenRaf (Hexagonal + DDD)',
    category: 'Backend Spring',
    dueBucket: 'Hoy',
    timeSlot: '10:30',
    dateLabel: formatTaskDateLabel('Hoy', '10:30'),
    durationMinutes: 45,
    priority: 'Alta',
    notes: 'Validar puertos de salida en Spring Boot y adaptadores de persistencia JPA sin filtrar entidades al dominio.',
    subtasks: [
      { id: 'st-1-1', title: 'Auditar interfaces de repositorio en dominio', done: true },
      { id: 'st-1-2', title: 'Verificar mappers DTO en capa de aplicación', done: true }
    ],
    focusSessionsCompleted: 2,
    completed: true
  },
  {
    id: 2,
    title: 'Refinar Container Transform con View Transitions API',
    category: 'Frontend Angular',
    dueBucket: 'Hoy',
    timeSlot: '16:00',
    dateLabel: formatTaskDateLabel('Hoy', '16:00'),
    durationMinutes: 25,
    priority: 'Alta',
    notes: 'Aislar grupos de transición y verificar que dialog-transform no promueva nodos ocultos al Top Layer.',
    subtasks: [
      { id: 'st-2-1', title: 'Validar retorno de transición en card -> dialog', done: true },
      { id: 'st-2-2', title: 'Chequear prefers-reduced-motion en fallback CSS', done: false },
      { id: 'st-2-3', title: 'Correr suite Vitest de DialogService', done: false }
    ],
    focusSessionsCompleted: 1,
    completed: false
  },
  {
    id: 3,
    title: 'Calibrar tokens OKLCH de triaje y saturación Dark Mode',
    category: 'Clínica & Ops',
    dueBucket: 'Hoy',
    timeSlot: '18:15',
    dateLabel: formatTaskDateLabel('Hoy', '18:15'),
    durationMinutes: 25,
    priority: 'Alta',
    notes: 'Validar contraste >= 4.5:1 entre bg-error-box y texto en Nivel Alta y Nivel Contraste Alto.',
    subtasks: [
      { id: 'st-3-1', title: 'Comprobar modo alto contraste en tokens NEWS2', done: false },
      { id: 'st-3-2', title: 'Probar rotación del Seed Hue en Azul y Ámbar', done: false }
    ],
    focusSessionsCompleted: 0,
    completed: false
  },
  {
    id: 4,
    title: 'Definir escala tipográfica Plus Jakarta Sans',
    category: 'Design System',
    dueBucket: 'Mañana',
    timeSlot: '09:30',
    dateLabel: formatTaskDateLabel('Mañana', '09:30'),
    durationMinutes: 25,
    priority: 'Media',
    notes: 'Ajustar pesos y tracking negativo para cabeceras Display M3 y asegurar tabular-nums en KPIs.',
    subtasks: [
      { id: 'st-4-1', title: 'Aplicar text-wrap: balance en titulares Hero', done: true },
      { id: 'st-4-2', title: 'Validar expansión +35% en botones de formulario', done: false }
    ],
    focusSessionsCompleted: 0,
    completed: false
  },
  {
    id: 5,
    title: 'Reestructurar métricas de stock crítico por almacén',
    category: 'Frontend Angular',
    dueBucket: 'Esta semana',
    timeSlot: '11:00',
    dateLabel: formatTaskDateLabel('Esta semana', '11:00'),
    durationMinutes: 45,
    priority: 'Media',
    notes: 'Unificar señales de umbral mínimo con el Centro de Comando y revisar accesibilidad de filtros.',
    subtasks: [],
    focusSessionsCompleted: 0,
    completed: false
  },
  {
    id: 6,
    title: 'Archivar retrospectiva semanal y notas de sprint',
    category: 'Personal',
    dueBucket: 'Esta semana',
    timeSlot: '',
    dateLabel: 'Esta semana',
    durationMinutes: 15,
    priority: 'Baja',
    notes: 'Resumir aprendizajes clave de tokens M3 Expressive y limpiar ramas locales obsoletas.',
    subtasks: [],
    focusSessionsCompleted: 1,
    completed: true
  }
];

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  readonly tasks = signal<readonly TaskItem[]>(INITIAL_TASKS);
  readonly filterStatus = signal<FilterStatus>('all');
  readonly searchQuery = signal<string>('');
  readonly categoryFilter = signal<string>('all');
  readonly priorityFilter = signal<TaskPriority | 'all'>('all');
  readonly selectedTaskId = signal<number | null>(INITIAL_TASKS[1]?.id ?? INITIAL_TASKS[0]?.id ?? null);

  readonly completedCount = computed(() => this.tasks().filter(t => t.completed).length);
  readonly pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);
  readonly highPriorityPendingCount = computed(
    () => this.tasks().filter(t => !t.completed && t.priority === 'Alta').length
  );
  readonly todayPendingCount = computed(
    () => this.tasks().filter(t => !t.completed && t.dueBucket === 'Hoy').length
  );
  readonly totalFocusSessions = computed(() =>
    this.tasks().reduce((sum, t) => sum + t.focusSessionsCompleted, 0)
  );
  readonly totalPendingMinutes = computed(() =>
    this.tasks()
      .filter(t => !t.completed)
      .reduce((sum, t) => sum + t.durationMinutes, 0)
  );
  readonly completionRate = computed(() => {
    const total = this.tasks().length;
    return total ? Math.round((this.completedCount() / total) * 100) : 0;
  });

  readonly filteredTasks = computed(() => {
    const status = this.filterStatus();
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.categoryFilter();
    const priority = this.priorityFilter();

    return this.tasks()
      .filter(task => {
        if (status === 'pending' && task.completed) return false;
        if (status === 'completed' && !task.completed) return false;
        if (category !== 'all' && task.category !== category) return false;
        if (priority !== 'all' && task.priority !== priority) return false;

        if (query) {
          const haystack = `${task.title} ${task.category} ${task.notes} ${task.dateLabel}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const bucketDiff = BUCKET_RANK[a.dueBucket] - BUCKET_RANK[b.dueBucket];
        if (bucketDiff !== 0) return bucketDiff;
        const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        if (a.timeSlot && b.timeSlot) return a.timeSlot.localeCompare(b.timeSlot);
        if (a.timeSlot) return -1;
        if (b.timeSlot) return 1;
        return b.id - a.id;
      });
  });

  readonly groupedFilteredTasks = computed<readonly TaskGroup[]>(() => {
    const visible = this.filteredTasks();
    const groups: TaskGroup[] = [];
    for (const bucket of TASK_DUE_BUCKETS) {
      const items = visible.filter(t => t.dueBucket === bucket);
      if (items.length > 0) {
        groups.push({ bucket, items });
      }
    }
    return groups;
  });

  readonly selectedTask = computed<TaskItem | null>(() => {
    const all = this.tasks();
    if (all.length === 0) return null;
    const targetId = this.selectedTaskId();
    const exact = targetId !== null ? all.find(t => t.id === targetId) : undefined;
    if (exact) return exact;
    const filteredFirst = this.filteredTasks()[0];
    return filteredFirst ?? all[0] ?? null;
  });

  readonly availableCategories = computed(() => {
    const known = new Set<string>(TASK_CATEGORIES.map(c => c.name));
    for (const t of this.tasks()) {
      if (t.category.trim()) known.add(t.category.trim());
    }
    return Array.from(known);
  });

  selectTask(id: number | null): void {
    this.selectedTaskId.set(id);
  }

  setFilter(status: FilterStatus): void {
    this.filterStatus.set(status);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter.set(category);
  }

  setPriorityFilter(priority: TaskPriority | 'all'): void {
    this.priorityFilter.set(priority);
  }

  resetAllFilters(): void {
    this.filterStatus.set('all');
    this.searchQuery.set('');
    this.categoryFilter.set('all');
    this.priorityFilter.set('all');
  }

  saveTask(draft: TaskDraft, editingId: number | null): TaskItem {
    const title = draft.title.trim() || 'Nueva actividad M3 Expressive';
    const dueBucket = draft.dueBucket ?? normalizeDueBucket(draft.dateLabel);
    const timeSlot = normalizeTimeSlot(draft.timeSlot, draft.dateLabel);
    const dateLabel = formatTaskDateLabel(dueBucket, timeSlot);
    const durationMinutes =
      draft.durationMinutes && draft.durationMinutes > 0 ? draft.durationMinutes : 25;
    const cleanCategory = draft.category.trim() || 'Frontend Angular';

    if (editingId !== null) {
      let updatedItem: TaskItem | null = null;
      this.tasks.update(list =>
        list.map(t => {
          if (t.id !== editingId) return t;
          updatedItem = {
            ...t,
            title,
            category: cleanCategory,
            dueBucket,
            timeSlot,
            dateLabel,
            durationMinutes,
            priority: draft.priority,
            notes: draft.notes.trim()
          };
          return updatedItem;
        })
      );
      if (updatedItem) {
        this.selectedTaskId.set(editingId);
        return updatedItem;
      }
    }

    const created: TaskItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title,
      category: cleanCategory,
      dueBucket,
      timeSlot,
      dateLabel,
      durationMinutes,
      priority: draft.priority,
      notes: draft.notes.trim() || 'Registrado desde Agenda M3 Expressive.',
      subtasks: [],
      focusSessionsCompleted: 0,
      completed: false
    };
    this.tasks.update(prev => [created, ...prev]);
    this.selectedTaskId.set(created.id);
    return created;
  }

  updateTaskFields(
    id: number,
    patch: Partial<
      Pick<TaskItem, 'title' | 'category' | 'dueBucket' | 'timeSlot' | 'durationMinutes' | 'priority' | 'notes'>
    >
  ): void {
    this.tasks.update(list =>
      list.map(task => {
        if (task.id !== id) return task;
        const dueBucket = patch.dueBucket ?? task.dueBucket;
        const timeSlot = patch.timeSlot !== undefined ? patch.timeSlot.trim() : task.timeSlot;
        return {
          ...task,
          ...patch,
          title: patch.title !== undefined ? patch.title.trim() || task.title : task.title,
          dueBucket,
          timeSlot,
          dateLabel: formatTaskDateLabel(dueBucket, timeSlot)
        };
      })
    );
  }

  deleteTask(id: number): void {
    const remaining = this.tasks().filter(t => t.id !== id);
    this.tasks.set(remaining);
    if (this.selectedTaskId() === id) {
      this.selectedTaskId.set(remaining[0]?.id ?? null);
    }
  }

  toggleCompleted(id: number): void {
    this.tasks.update(list =>
      list.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  }

  addSubtask(taskId: number, rawTitle: string): void {
    const title = rawTitle.trim();
    if (!title) return;

    const subtask: TaskSubtask = {
      id: `st-${taskId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      done: false
    };

    this.tasks.update(list =>
      list.map(task =>
        task.id === taskId ? { ...task, subtasks: [...task.subtasks, subtask] } : task
      )
    );
  }

  toggleSubtask(taskId: number, subtaskId: string): void {
    this.tasks.update(list =>
      list.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(st =>
                st.id === subtaskId ? { ...st, done: !st.done } : st
              )
            }
          : task
      )
    );
  }

  removeSubtask(taskId: number, subtaskId: string): void {
    this.tasks.update(list =>
      list.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(st => st.id !== subtaskId)
            }
          : task
      )
    );
  }

  recordFocusSession(taskId: number): void {
    this.tasks.update(list =>
      list.map(task =>
        task.id === taskId
          ? { ...task, focusSessionsCompleted: task.focusSessionsCompleted + 1 }
          : task
      )
    );
  }
}
