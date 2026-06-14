import { Component, inject, signal } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, DishSummaryDto, SessionDto } from '../../../core/services/dashboard-service';
import { of, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';  // add this import


@Component({
  selector: 'app-session-summary',
  standalone: true,
  templateUrl: './session-summary.component.html',
  styleUrl: './session-summary.component.scss',
})
export class SessionSummaryComponent {
  private readonly mock = inject(MockDataService);
  readonly copied = signal(false);
  readonly closed = signal(false);
  session: SessionDto | null = null;
  summary: DishSummaryDto[] = [];
  private sessionService = inject(DashboardService);
  private readonly route = inject(ActivatedRoute);


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const sessionId = this.route.snapshot.queryParamMap.get('sessionId');

    if (sessionId) {
      // came from dashboard "View summary" — load that specific session
      this.sessionService.getRecentSessions().subscribe({
        next: (sessions) => {
          this.session = sessions.find(s => s.sessionId === sessionId) ?? null;
          if (!this.session) return;
          this.sessionService.getSessionSummary(sessionId).subscribe({
            next: (res) => this.summary = res ?? [],
            error: (err) => console.error('Error loading summary', err)
          });
        },
        error: (err) => console.error('Error loading sessions', err)
      });
    } else {
      // no sessionId — default to open/first session (existing behaviour)
      this.sessionService.getRecentSessions().pipe(
        switchMap((sessions) => {
          if (!sessions || sessions.length === 0) return of(null);
          this.session = sessions.find(s => s.status === 'Open') ?? sessions[0];
          if (!this.session) return of(null);
          return this.sessionService.getSessionSummary(this.session.sessionId);
        })
      ).subscribe({
        next: (res) => { if (res) this.summary = res; },
        error: (err) => console.error('Error loading summary', err)
      });
    }
  }

  get totalItems(): number {
    return this.summary.reduce((sum, d) => sum + d.totalQty, 0);
  }

  get exportText(): string {
    const lines = this.summary.map((d) => `${d.dishName}: ${d.totalQty}`);
    return `Team Bites Order Summary\n${'—'.repeat(24)}\n${lines.join('\n')}`;
  }

  copySummary(): void {
    navigator.clipboard.writeText(this.exportText).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  closeSession(): void {
    const s = this.session;
    if (!s) {
      return;
    }

    this.sessionService.closeSession(s.sessionId).subscribe({
      next: () => {
        s.status = 'Closed';
        this.closed.set(true);
      },
      error: (err) => {
        console.error('Failed to close session', err);
        alert('Failed to close session.');
      }
    });
  }

  exportCsv(): void {
    const header = 'Dish,Category,Type,Quantity,Ordered By\n';
    const rows = this.summary
      .map((d) =>
        `"${d.dishName}","${d.category}","${d.type}",${d.totalQty},"${d.orderedBy.join('; ')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-bites-order-summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
