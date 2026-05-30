import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './active-session.component.html',
  styleUrl: './active-session.component.scss',
})
export class ActiveSessionComponent {
  private readonly mock = inject(MockDataService);

  get session() {
    return this.mock.getActiveSession();
  }

  get menuPreview() {
    const s = this.session;
    if (!s) return [];
    return this.mock.getMenuForSession(s.id).slice(0, 4);
  }

  get mockMenuCount(): number {
    const s = this.session;
    if (!s) return 0;
    return this.mock.getMenuForSession(s.id).length;
  }
}
