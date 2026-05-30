import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { loginRedirectGuard } from './features/auth/login-redirect.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [loginRedirectGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'super-admin',
    canActivate: [authGuard, roleGuard('SuperAdmin')],
    loadComponent: () =>
      import('./features/super-admin/super-admin.layout').then((m) => m.SuperAdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'companies', pathMatch: 'full' },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/super-admin/companies/companies-list.component').then(
            (m) => m.CompaniesListComponent
          ),
      },
      {
        path: 'companies/new',
        loadComponent: () =>
          import('./features/super-admin/companies/create-company.component').then(
            (m) => m.CreateCompanyComponent
          ),
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./features/super-admin/billing/billing.component').then((m) => m.BillingComponent),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./features/super-admin/audit/audit-logs.component').then((m) => m.AuditLogsComponent),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('CompanyAdmin')],
    loadComponent: () =>
      import('./features/admin/admin.layout').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'sessions/new',
        loadComponent: () =>
          import('./features/admin/sessions/create-session.component').then(
            (m) => m.CreateSessionComponent
          ),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/admin/menu/menu-management.component').then(
            (m) => m.MenuManagementComponent
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/admin/employees/employees.component').then((m) => m.EmployeesComponent),
      },
      {
        path: 'sessions/live',
        loadComponent: () =>
          import('./features/admin/sessions/session-live.component').then(
            (m) => m.SessionLiveComponent
          ),
      },
      {
        path: 'sessions/summary',
        loadComponent: () =>
          import('./features/admin/sessions/session-summary.component').then(
            (m) => m.SessionSummaryComponent
          ),
      },
    ],
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard('Employee')],
    loadComponent: () =>
      import('./features/employee/employee.layout').then((m) => m.EmployeeLayoutComponent),
    children: [
      { path: '', redirectTo: 'active', pathMatch: 'full' },
      {
        path: 'active',
        loadComponent: () =>
          import('./features/employee/active-session/active-session.component').then(
            (m) => m.ActiveSessionComponent
          ),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./features/employee/menu-order/menu-order.component').then(
            (m) => m.MenuOrderComponent
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/employee/history/order-history.component').then(
            (m) => m.OrderHistoryComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
