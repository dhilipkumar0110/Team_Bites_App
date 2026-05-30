import { Component, inject, signal } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, DishSummaryDto, SessionDto } from '../../../core/services/dashboard-service';
import { of, switchMap } from 'rxjs';

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

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.sessionService.getRecentSessions().pipe(

      switchMap((sessions) => {
        if (!sessions || sessions.length === 0) {
          return of(null);
        }
        this.session =
          sessions.find(s => s.status === 'Open') ?? sessions[0];

        if (!this.session) {
          return of(null);
        }
        return this.sessionService.getSessionSummary(this.session.sessionId);
      })

    ).subscribe({
      next: (res) => {
        if (!res) return;
        this.summary = res;
      },
      error: (err) => {
        console.error('Error loading summary', err);
      }
    });
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
    if (s) {
      s.status = 'Closed';
      this.closed.set(true);
    }
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
