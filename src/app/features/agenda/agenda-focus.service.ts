import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { TaskService } from '../../core/tasks/task.service';

export type FocusTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export const FOCUS_PRESETS: readonly number[] = [15, 25, 45];

@Injectable({
  providedIn: 'root'
})
export class AgendaFocusService {
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  readonly activeTaskId = signal<number | null>(null);
  readonly presetMinutes = signal<number>(25);
  readonly totalSeconds = signal<number>(25 * 60);
  readonly remainingSeconds = signal<number>(25 * 60);
  readonly status = signal<FocusTimerStatus>('idle');
  readonly announcement = signal<string>('');

  readonly progressPercent = computed(() => {
    const total = this.totalSeconds();
    if (total <= 0) return 0;
    const elapsed = total - this.remainingSeconds();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  });

  readonly formattedTime = computed(() => {
    const secs = Math.max(0, this.remainingSeconds());
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly statusLabel = computed(() => {
    switch (this.status()) {
      case 'running':
        return 'En curso';
      case 'paused':
        return 'Pausa';
      case 'completed':
        return 'Logrado';
      default:
        return 'Listo';
    }
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimerHandle());
  }

  /** Aligns an idle timer with the currently selected task without clobbering an active session. */
  syncIdleWithTask(taskId: number, durationMinutes: number): void {
    const st = this.status();
    if (st === 'running' || st === 'paused') return;

    const mins = durationMinutes > 0 ? durationMinutes : 25;
    this.activeTaskId.set(taskId);
    this.presetMinutes.set(mins);
    this.totalSeconds.set(mins * 60);
    this.remainingSeconds.set(mins * 60);
    if (st === 'completed') {
      this.status.set('idle');
    }
  }

  setDurationPreset(minutes: number, taskId: number | null): void {
    this.clearTimerHandle();
    const safeMinutes = Math.max(5, Math.min(120, minutes));
    this.activeTaskId.set(taskId);
    this.presetMinutes.set(safeMinutes);
    this.totalSeconds.set(safeMinutes * 60);
    this.remainingSeconds.set(safeMinutes * 60);
    this.status.set('idle');
    this.announcement.set(`Duración de enfoque ajustada a ${safeMinutes} minutos.`);
  }

  startOrResume(taskId: number, taskTitle?: string): void {
    const isDifferentTask = this.activeTaskId() !== null && this.activeTaskId() !== taskId;
    if (this.status() === 'completed' || isDifferentTask) {
      const mins = this.presetMinutes();
      this.totalSeconds.set(mins * 60);
      this.remainingSeconds.set(mins * 60);
    }

    this.activeTaskId.set(taskId);
    this.status.set('running');
    this.clearTimerHandle();

    if (typeof window !== 'undefined') {
      this.intervalHandle = setInterval(() => this.tick(), 1000);
    }

    const label = taskTitle ? ` para ${taskTitle}` : '';
    this.announcement.set(`Sesión de enfoque iniciada${label}.`);
  }

  /** Ensures the timer adopts a task's preset before starting or resuming focus. */
  startTaskSession(taskId: number, durationMinutes: number, taskTitle?: string): void {
    if (this.activeTaskId() !== taskId) {
      this.setDurationPreset(durationMinutes, taskId);
    }
    this.startOrResume(taskId, taskTitle);
  }

  recordTaskSession(taskId: number): void {
    if (this.activeTaskId() !== taskId) {
      this.activeTaskId.set(taskId);
    }
    this.completeSession();
  }

  getTaskFormattedTime(taskId: number, fallbackDurationMinutes: number): string {
    if (this.activeTaskId() === taskId) {
      return this.formattedTime();
    }
    return `${fallbackDurationMinutes.toString().padStart(2, '0')}:00`;
  }

  getTaskStatusLabel(taskId: number): string {
    if (this.activeTaskId() !== taskId) {
      return 'Listo';
    }
    return this.statusLabel();
  }

  getTaskProgressPercent(taskId: number): number {
    if (this.activeTaskId() !== taskId || this.status() === 'idle') {
      return 0;
    }
    if (this.status() === 'completed') {
      return 100;
    }
    const total = this.totalSeconds();
    if (total <= 0) return 0;
    const elapsed = Math.max(0, total - this.remainingSeconds());
    return Math.min(100, Number(((elapsed / total) * 100).toFixed(2)));
  }

  pause(): void {
    if (this.status() !== 'running') return;
    this.clearTimerHandle();
    this.status.set('paused');
    this.announcement.set(`Sesión de enfoque en pausa (${this.formattedTime()} restantes).`);
  }

  reset(durationMinutes?: number): void {
    this.clearTimerHandle();
    const mins = durationMinutes && durationMinutes > 0 ? durationMinutes : this.presetMinutes();
    this.presetMinutes.set(mins);
    this.totalSeconds.set(mins * 60);
    this.remainingSeconds.set(mins * 60);
    this.status.set('idle');
    this.announcement.set(`Temporizador reiniciado a ${mins} minutos.`);
  }

  completeSession(): void {
    this.clearTimerHandle();
    this.remainingSeconds.set(0);
    this.status.set('completed');
    const targetId = this.activeTaskId();
    if (targetId !== null) {
      this.taskService.recordFocusSession(targetId);
    }
    this.announcement.set('Bloque de enfoque completado y registrado.');
  }

  tick(): void {
    if (this.status() !== 'running') return;
    const next = this.remainingSeconds() - 1;
    if (next <= 0) {
      this.completeSession();
      return;
    }
    this.remainingSeconds.set(next);
  }

  private clearTimerHandle(): void {
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}
