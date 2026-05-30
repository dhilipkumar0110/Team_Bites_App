import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly mock = inject(MockDataService);
  readonly sessions = this.mock.sessions;
  readonly employees = this.mock.employees;
  readonly menuCount = this.mock.menuItems.length;

  get activeSession() {
    return this.mock.getActiveSession();
  }

  get submittedCount(): number {
    const session = this.activeSession;
    if (!session) return 0;
    return (this.mock.sessionResponses[session.id] ?? []).length;
  }

  get pendingCount(): number {
    const active = this.employees.filter((e) => e.status === 'Active' && e.role === 'Employee').length;
    return Math.max(0, active - this.submittedCount);
  }
}
