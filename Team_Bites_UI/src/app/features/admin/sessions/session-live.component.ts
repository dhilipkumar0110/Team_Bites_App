import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, SessionDto, SessionResponseDto } from '../../../core/services/dashboard-service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-session-live',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './session-live.component.html',
  styleUrl: './session-live.component.scss',
})
export class SessionLiveComponent {
  private readonly mock = inject(MockDataService);
   private sessionService = inject(DashboardService);

  session: SessionDto | null = null;
  responses: SessionResponseDto[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.sessionService.getRecentSessions().pipe(

      switchMap((sessions) => {
        if (!sessions || sessions.length === 0) {
          return of(null);
        }

        // 🔥 Pick active session
        this.session =
          sessions.find(s => s.status === 'Open') ?? sessions[0];

        if (!this.session) {
          return of(null);
        }

        return this.sessionService.getSessionResponses(this.session.sessionId);
      })

    ).subscribe({
      next: (res) => {
        if (!res) return;
        this.responses = res;
      },
      error: (err) => {
        console.error('Error loading session live data', err);
      }
    });
  }
}
