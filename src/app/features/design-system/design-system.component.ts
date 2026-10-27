import { Component } from '@angular/core';
import { TokenShowcaseComponent } from '../../shared/ui/token-showcase.component';

@Component({
  selector: 'app-design-system-page',
  standalone: true,
  imports: [TokenShowcaseComponent],
  template: `
    <section class="space-y-4">
      <app-token-showcase />
    </section>
  `
})
export class DesignSystemComponent {}
