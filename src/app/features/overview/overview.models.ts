import { TaskDueBucket, TaskPriority } from '../../core/tasks/task.service';
import { M3ProgressColor } from '../../shared/components/progress';

export type PulseTone = 'primary' | 'success' | 'warning' | 'error';

export type OverviewModuleFilter = 'all' | 'alerts' | 'stable';

export type OverviewHeroMorphOwner = 'card' | 'detail';

export type OverviewQuickTaskMorphTarget = 'button' | 'dialog';

export interface OverviewQuickTaskDraft {
  readonly title: string;
  readonly category: string;
  readonly dueBucket: TaskDueBucket;
  readonly priority: TaskPriority;
}

export interface ModulePulseCard {
  readonly section: string;
  readonly title: string;
  readonly route: string;
  readonly icon: string;
  readonly iconBgClass: string;
  readonly headline: string;
  readonly detail: string;
  readonly statusLabel: string;
  readonly statusIcon: string;
  readonly statusTone: PulseTone;
  readonly hasAlert: boolean;
  readonly alertCount: number;
  readonly healthPercent: number;
  readonly healthLabel: string;
  readonly healthColor: M3ProgressColor;
}

export interface OverviewHeroMetric {
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly icon: string;
  readonly toneClass: string;
}

export const PULSE_BADGE_CLASSES: Record<PulseTone, string> = {
  primary: 'bg-primary-box text-on-primary-box',
  success: 'bg-success-box text-on-success-box',
  warning: 'bg-warning-box text-on-warning-box',
  error: 'bg-error-box text-on-error-box'
};

export function moduleBadgeClass(tone: PulseTone): string {
  return PULSE_BADGE_CLASSES[tone];
}

export function priorityBadgeClass(priority: TaskPriority, completed: boolean): string {
  if (completed) return 'bg-surface-high text-muted';
  if (priority === 'Alta') return 'bg-error-box text-on-error-box';
  if (priority === 'Media') return 'bg-warning-box text-on-warning-box';
  return 'bg-surface-high text-muted';
}
