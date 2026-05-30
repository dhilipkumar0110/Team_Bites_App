import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, NavItem } from '../../shared/layout/app-shell.component';

const NAV: NavItem[] = [
  { label: 'Companies', route: '/super-admin/companies', icon: '🏢' },
  { label: 'Create company', route: '/super-admin/companies/new', icon: '➕' },
  { label: 'Billing & plans', route: '/super-admin/billing', icon: '💳' },
  { label: 'Audit logs', route: '/super-admin/logs', icon: '📋' },
];

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [AppShellComponent, RouterOutlet],
  template: `
    <app-shell theme="super-admin" portalLabel="Platform" [navItems]="nav">
      <router-outlet />
    </app-shell>
  `,
})
export class SuperAdminLayoutComponent {
  readonly nav = NAV;
}
