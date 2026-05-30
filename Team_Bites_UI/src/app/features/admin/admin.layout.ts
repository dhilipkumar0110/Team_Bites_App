import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, NavItem } from '../../shared/layout/app-shell.component';

const NAV: NavItem[] = [
  { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
  { label: 'Create session', route: '/admin/sessions/new', icon: '📅' },
  { label: 'Manage menu', route: '/admin/menu', icon: '📋' },
  { label: 'Employees', route: '/admin/employees', icon: '👥' },
  { label: 'Live responses', route: '/admin/sessions/live', icon: '⚡' },
  { label: 'Order summary', route: '/admin/sessions/summary', icon: '🧾' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AppShellComponent, RouterOutlet],
  template: `
    <app-shell theme="company-admin" portalLabel="Company Admin" [navItems]="nav">
      <router-outlet />
    </app-shell>
  `,
})
export class AdminLayoutComponent {
  readonly nav = NAV;
}
