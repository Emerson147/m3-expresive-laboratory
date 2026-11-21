import { getCategoryMeta, TaskDueBucket, TaskItem, TaskPriority } from '../../../core/tasks/task.service';

export interface PriorityVisualMeta {
  readonly badgeClass: string;
  readonly icon: string;
  readonly label: string;
}

const PRIORITY_META: Record<TaskPriority, PriorityVisualMeta> = {
  Alta: {
    badgeClass: 'bg-error-box text-on-error-box',
    icon: 'priority_high',
    label: 'Alta'
  },
  Media: {
    badgeClass: 'bg-warning-box text-on-warning-box',
    icon: 'flag',
    label: 'Media'
  },
  Baja: {
    badgeClass: 'bg-sec-box text-on-sec-box',
    icon: 'low_priority',
    label: 'Baja'
  }
};

const BUCKET_META: Record<TaskDueBucket, { readonly icon: string; readonly subtitle: string }> = {
  Hoy: {
    icon: 'today',
    subtitle: 'Bloques prioritarios para la jornada actual'
  },
  Mañana: {
    icon: 'upcoming',
    subtitle: 'Preparación próxima para el día siguiente'
  },
  'Esta semana': {
    icon: 'date_range',
    subtitle: 'Planificación abierta del sprint semanal'
  }
};

export function getPriorityMeta(priority: TaskPriority, completed = false): PriorityVisualMeta {
  if (completed) {
    return {
      badgeClass: 'bg-success-box text-on-success-box',
      icon: 'done_all',
      label: 'Completada'
    };
  }
  return PRIORITY_META[priority];
}

export function getBucketHeaderMeta(bucket: TaskDueBucket): { readonly icon: string; readonly subtitle: string } {
  return BUCKET_META[bucket];
}

export function getTaskCategoryVisual(category: string) {
  return getCategoryMeta(category);
}

export function getSubtaskCompletionSummary(task: TaskItem): { done: number; total: number; percent: number } {
  const total = task.subtasks.length;
  if (total === 0) return { done: 0, total: 0, percent: task.completed ? 100 : 0 };
  const done = task.subtasks.filter(st => st.done).length;
  return { done, total, percent: Math.round((done / total) * 100) };
}

export function formatFocusBlocks(count: number, singularSuffix = '', pluralSuffix = singularSuffix): string {
  const isOne = count === 1;
  const noun = isOne ? 'bloque' : 'bloques';
  const suffix = isOne ? singularSuffix : pluralSuffix;
  return suffix ? `${count} ${noun} ${suffix}` : `${count} ${noun}`;
}

/** Prevents form Enter submission while an IME composition session is active. */
export function preventEnterDuringComposition(event: Event): void {
  if ('isComposing' in event && (event as KeyboardEvent).isComposing) {
    event.preventDefault();
  }
}
