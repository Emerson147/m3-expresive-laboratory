import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, DestroyRef, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DialogService } from './core/dialog/dialog.service';
import { StageOverlayService } from './core/dialog/stage-overlay.service';
import { AdaptiveLayoutService } from './core/layout/adaptive-layout.service';
import { TaskService } from './core/tasks/task.service';
import { AppSection, detectSectionFromUrl, getShellModeForSection } from './shared/models/ui.models';
import { CommandPaletteComponent } from './shared/ui/command-palette.component';
import { DialogContainerComponent } from './shared/ui/dialog-container.component';
import { HeaderComponent } from './shared/ui/header.component';
import { HeroDetailModalComponent } from './shared/ui/hero-detail-modal.component';
import { NavigationComponent } from './shared/ui/navigation.component';

export type { AppSection, DialogView, NavChromeMode, NavStyle, TransitionType, TriggerMode } from './shared/models/ui.models';
export type { FilterStatus, TaskItem, TaskPriority } from './core/tasks/task.service';
export type { ThemeOption } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    NavigationComponent,
    HeaderComponent,
    HeroDetailModalComponent,
    DialogContainerComponent,
    CommandPaletteComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly adaptiveLayout = inject(AdaptiveLayoutService);
  readonly taskService = inject(TaskService);
  readonly dialogService = inject(DialogService);
  readonly stageOverlay = inject(StageOverlayService);

  private readonly routeStage = viewChild<ElementRef<HTMLElement>>('routeStage');
  private hasHandledInitialNavigation = false;
  private lastNavigatedUrl = '';

  readonly isCommandPaletteOpen = signal<boolean>(false);
  readonly currentSection = signal<AppSection>(detectSectionFromUrl(this.router.url));
  readonly routeMeta = signal<{ title?: string; subtitle?: string }>(this.readActiveRouteMeta());
  readonly shellMode = computed(() => getShellModeForSection(this.currentSection()));
  readonly isEditorialShell = computed(() => this.shellMode() === 'editorial');

  readonly stageClasses = computed(() => {
    const chrome = this.dialogService.effectiveChrome();
    const isVerticalStack = chrome === 'bar' || chrome === 'tunnel';
    const directionClass = isVerticalStack ? 'flex-col' : 'flex-row';
    const desktopFrame = chrome === 'bar' ? '' : ' md:p-2.5 md:gap-2.5';
    return `flex ${directionClass}${desktopFrame} h-full w-full overflow-hidden bg-surface-low`;
  });

  readonly mainClasses = computed(() => {
    const chrome = this.dialogService.effectiveChrome();
    const detachedSurface =
      chrome === 'bar'
        ? 'bg-surface'
        : 'bg-surface md:rounded-m3-xl forced-colors:border forced-colors:border-[CanvasText]';
    const dockPadding = chrome === 'dock' ? ' pb-24' : '';

    if (this.shellMode() === 'workbench') {
      return `${detachedSurface} flex-1 min-h-0 min-w-0 overflow-hidden p-2 md:p-3 flex flex-col${dockPadding}`;
    }

    const outerPadding = this.adaptiveLayout.isCompact() ? 'p-4' : 'p-6 md:p-8';
    const bottomPadding = chrome === 'dock' ? ' pb-28' : ' pb-12';
    return `${detachedSurface} m3-editorial-pane flex-1 min-h-0 min-w-0 overflow-y-auto ${outerPadding}${bottomPadding} space-y-6`;
  });

  constructor() {
    this.stageOverlay.registerHost();
    this.destroyRef.onDestroy(() => this.stageOverlay.unregisterHost());

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nextUrl = event.urlAfterRedirects;
        this.currentSection.set(detectSectionFromUrl(nextUrl));
        this.routeMeta.set(this.readActiveRouteMeta());

        if (this.hasHandledInitialNavigation && nextUrl !== this.lastNavigatedUrl) {
          const stageEl = this.routeStage()?.nativeElement;
          if (stageEl) {
            if (this.shellMode() === 'editorial') {
              stageEl.scrollTop = 0;
            }
            stageEl.focus({ preventScroll: true });
          }
        }

        this.hasHandledInitialNavigation = true;
        this.lastNavigatedUrl = nextUrl;
      });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      if (this.isStageModalActive()) return;
      event.preventDefault();
      this.isCommandPaletteOpen.update(open => !open);
    }
  }

  openCommandPalette(): void {
    if (this.isStageModalActive()) return;
    this.isCommandPaletteOpen.set(true);
  }

  navigateFromCommandPalette(route: string): void {
    void this.router.navigateByUrl(route);
  }

  openQuickTaskFromCommandPalette(): void {
    this.dialogService.openFrom('bento-center');
  }

  private isStageModalActive(): boolean {
    return (
      this.dialogService.isDialogOpen() ||
      this.dialogService.isHeroExpanded() ||
      this.stageOverlay.isOverlayOpen()
    );
  }

  private readActiveRouteMeta(): { title?: string; subtitle?: string } {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const data = route.snapshot.data;
    return {
      title: typeof data['labTitle'] === 'string' ? data['labTitle'] : undefined,
      subtitle: typeof data['labSubtitle'] === 'string' ? data['labSubtitle'] : undefined
    };
  }
}