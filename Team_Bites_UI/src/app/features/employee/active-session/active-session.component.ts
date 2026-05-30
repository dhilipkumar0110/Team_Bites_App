import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, MenuItemDto, SessionDto } from '../../../core/services/dashboard-service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './active-session.component.html',
  styleUrl: './active-session.component.scss',
})
export class ActiveSessionComponent {
  private sessionService = inject(DashboardService);

  session: SessionDto | null = null;
  menuItems: MenuItemDto[] = [];

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

        // 🔥 Call menu API with sessionId
        return this.sessionService.getMenu(this.session.sessionId);
      })

    ).subscribe({
      next: (menu) => {
        if (!menu) return;
        this.menuItems = menu;
      },
      error: (err) => {
        console.error('Error loading active session menu', err);
      }
    });
  }

  // 🔹 Show only first 4 items
  get menuPreview(): MenuItemDto[] {
    return this.menuItems.slice(0, 4);
  }

  // 🔹 Total count
  get menuCount(): number {
    return this.menuItems.length;
  }
}
