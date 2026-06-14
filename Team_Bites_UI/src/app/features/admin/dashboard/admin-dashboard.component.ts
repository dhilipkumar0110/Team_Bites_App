import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, EmployeeDto, MenuItemDto, SessionDto, SessionResponseDto } from '../../../core/services/dashboard-service';
import { forkJoin, of, switchMap } from 'rxjs';
import { LoaderService } from '../../../core/services/loader-service';
import { Loader } from "../../../shared/loader/loader";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, Loader],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})

export class AdminDashboardComponent {

  private readonly service = inject(DashboardService);
   private readonly loader = inject(LoaderService);
  private readonly mock = inject(MockDataService);
  //readonly sessions = this.mock.sessions;
  // readonly employees = this.mock.employees;
  // readonly menuCount = this.mock.menuItems.length;
  employees: EmployeeDto[] = [];
  sessions: SessionDto[] = [];
  menuItems: MenuItemDto[] = [];
  responses: SessionResponseDto[] = [];

  get activeSession() {
    return this.sessions.find(s => s.status === 'Open');
  }
get menuCount(): number {
    return this.menuItems.length;
  }
 get submittedCount(): number {
  return this.menuItems.length;
}

  get pendingCount(): number {
    const activeEmployees = this.employees.filter(
    e => e.status === 'Active' && e.role === 'Employee'
  ).length;

  return Math.max(0, activeEmployees - this.submittedCount);
  }

  ngOnInit() {
  this.loadData();
}

loadData() {
  this.loader.show();
   this.service.getEmployees().subscribe({
      next: (emp) => this.employees = emp,
      error: (err) => console.error('Employees error', err)
    });

    // ✅ 2. Sessions → THEN call menu API
    this.service.getRecentSessions().pipe(

      switchMap(sessions => {
        this.sessions = sessions;
        this.loader.hide();

        if (!sessions || sessions.length === 0) {
          return of(null);
        }

        const selectedSession =
          sessions.find(s => s.status === 'Open') ?? sessions[0];

        console.log('Selected Session:', selectedSession);

        return forkJoin({
          menu: this.service.getMenu(selectedSession.sessionId)
          //responses: this.service.getSessionResponses(selectedSession.id)
        });
      })

    ).subscribe({
      next: (result) => {
        if (!result) return;

        console.log('Menu API Result:', result.menu);

        this.menuItems = result.menu;
        this.loader.hide();
      },
      error: (err) => {
        console.error('Dashboard error', err);
      }
    });
  }

}
