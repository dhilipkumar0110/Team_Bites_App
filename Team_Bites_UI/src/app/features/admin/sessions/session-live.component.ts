import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-session-live',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './session-live.component.html',
  styleUrl: './session-live.component.scss',
})
export class SessionLiveComponent {
  private readonly mock = inject(MockDataService);

  get session() {
    return this.mock.getActiveSession();
  }

  get responses() {
    const s = this.session;
    if (!s) return [];
    return this.mock.sessionResponses[s.id] ?? [];
  }
}
