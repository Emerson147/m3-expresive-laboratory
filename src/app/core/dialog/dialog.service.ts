import { ApplicationRef, computed, inject, Injectable, signal } from '@angular/core';
import { DialogView, NavStyle, TransitionType, TriggerMode } from '../../shared/models/ui.models';
import { TaskItem, TaskPriority, TaskService } from '../tasks/task.service';
import { ThemeService } from '../theme/theme.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly taskService = inject(TaskService);
  private readonly themeService = inject(ThemeService);

  readonly isDialogOpen = signal<boolean>(false);
  readonly activeTrigger = signal<TriggerMode | null>(null);
  readonly dialogView = signal<DialogView>('task-form');
  readonly isHeroExpanded = signal<boolean>(false);
  readonly activeTransition = signal<TransitionType>(null);
  readonly activeTaskId = signal<number | null>(null);
  readonly navStyle = signal<NavStyle>('rail');

  // Draft form state
  readonly draftTitle = signal<string>('');
  readonly draftCategory = signal<string>('Frontend Angular');
  readonly draftDate = signal<string>('Hoy');
  readonly draftPriority = signal<TaskPriority>('Alta');
  readonly draftNotes = signal<string>('');

  openFrom(trigger: TriggerMode): void {
    this.activeTransition.set('dialog');
    this.activeTaskId.set(null);
    this.resetDraftForm();
    this.dialogView.set(trigger === 'menu-bottom-left' ? 'menu-main' : 'task-form');
    this.activeTrigger.set(trigger);

    // Synchronize DOM so trigger element gets view-transition-name before snapshot
    this.appRef.tick();

    this.runViewTransition(
      () => this.isDialogOpen.set(true),
      () => this.activeTransition.set(null)
    );
  }

  openTaskCard(task: TaskItem): void {
    this.activeTransition.set('dialog');
    this.activeTrigger.set('task-card');
    this.activeTaskId.set(task.id);
    this.dialogView.set('task-form');
    this.draftTitle.set(task.title);
    this.draftCategory.set(task.category);
    this.draftDate.set(task.dateLabel);
    this.draftPriority.set(task.priority);
    this.draftNotes.set(task.notes);

    // Synchronize DOM so the clicked task card gets view-transition-name: dialog-transform
    this.appRef.tick();

    this.runViewTransition(
      () => this.isDialogOpen.set(true),
      () => this.activeTransition.set(null)
    );
  }

  closeDialog(): void {
    this.activeTransition.set('dialog');
    this.appRef.tick();

    this.runViewTransition(
      () => {
        this.isDialogOpen.set(false);
      },
      () => {
        this.activeTransition.set(null);
        this.activeTrigger.set(null);
        this.activeTaskId.set(null);
        this.resetDraftForm();
      }
    );
  }

  toggleHeroDetail(expand: boolean): void {
    this.activeTransition.set('hero');
    this.appRef.tick();

    this.runViewTransition(
      () => this.isHeroExpanded.set(expand),
      () => this.activeTransition.set(null)
    );
  }

  morphDialogInternalView(targetView: DialogView, moveCenter = false): void {
    this.activeTransition.set('dialog');
    this.appRef.tick();

    this.runViewTransition(
      () => {
        if (moveCenter) {
          this.activeTrigger.set('bento-center');
          this.resetDraftForm();
        }
        this.dialogView.set(targetView);
      },
      () => this.activeTransition.set(null)
    );
  }

  saveTask(): void {
    const title = this.draftTitle().trim();
    if (!title) return;

    this.taskService.saveTask(
      {
        title,
        category: this.draftCategory(),
        dateLabel: this.draftDate(),
        priority: this.draftPriority(),
        notes: this.draftNotes()
      },
      this.activeTaskId()
    );

    this.closeDialog();
  }

  deleteActiveTask(): void {
    const id = this.activeTaskId();
    if (id !== null) {
      this.taskService.deleteTask(id);
      this.closeDialog();
    }
  }

  setNavStyle(style: NavStyle): void {
    if (this.navStyle() === style) return;
    this.activeTransition.set('nav');
    this.appRef.tick();

    this.runViewTransition(
      () => this.navStyle.set(style),
      () => this.activeTransition.set(null)
    );
  }

  private resetDraftForm(): void {
    this.draftTitle.set('');
    this.draftCategory.set('Frontend Angular');
    this.draftDate.set('Hoy');
    this.draftPriority.set('Alta');
    this.draftNotes.set('');
  }

  private runViewTransition(update: () => void, cleanup: () => void): void {
    const doc = document as any;
    if (typeof doc !== 'undefined' && typeof doc.startViewTransition === 'function') {
      const transition = doc.startViewTransition(() => {
        update();
        this.appRef.tick();
      });
      transition.finished.finally(() => {
        cleanup();
        this.appRef.tick();
      });
    } else {
      update();
      this.appRef.tick();
      cleanup();
    }
  }
}
