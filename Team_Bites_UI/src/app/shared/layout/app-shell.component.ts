import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);

  theme = input.required<'super-admin' | 'company-admin' | 'employee'>();
  navItems = input.required<NavItem[]>();
  portalLabel = input('Portal');

  readonly user = this.auth.user;

  readonly initials = computed(() => {
    const name = this.user()?.name ?? '?';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  readonly roleLabel = computed(() => {
    const map: Record<UserRole, string> = {
      SuperAdmin: 'Super Admin',
      CompanyAdmin: 'Company Admin',
      Employee: 'Employee',
    };
    const r = this.user()?.role;
    return r ? map[r] : '';
  });

  logout(): void {
    this.auth.logout();
  }
}
