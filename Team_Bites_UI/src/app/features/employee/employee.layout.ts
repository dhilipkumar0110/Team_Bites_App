import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, NavItem } from '../../shared/layout/app-shell.component';

const NAV: NavItem[] = [
  { label: 'Active session', route: '/employee/active', icon: '🎯' },
  { label: 'Order menu', route: '/employee/menu', icon: '🍽️' },
  { label: 'My orders', route: '/employee/history', icon: '📜' },
];

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [AppShellComponent, RouterOutlet],
  template: `
    <app-shell theme="employee" portalLabel="Team Member" [navItems]="nav">
      <router-outlet />
    </app-shell>
  `,
})
export class EmployeeLayoutComponent {
  readonly nav = NAV;
}
