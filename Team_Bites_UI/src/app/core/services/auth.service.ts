import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, Observable, of, tap, throwError } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest, UserRole } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

const TOKEN_KEY = 'teambites_token';
const USER_KEY = 'teambites_user';

const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  'superadmin@teambites.com': {
    password: 'demo123',
    user: {
      id: 'u0',
      name: 'Platform Admin',
      email: 'superadmin@teambites.com',
      role: 'SuperAdmin',
    },
  },
  'admin@keysoftware.com': {
    password: 'demo123',
    user: {
      id: 'u1',
      name: 'Priya Sharma',
      email: 'admin@keysoftware.com',
      role: 'CompanyAdmin',
      companyId: 'c1',
      companyName: 'Key Software Inc',
    },
  },
  'employee@keysoftware.com': {
    password: 'demo123',
    user: {
      id: 'e1',
      name: 'Dhilip Sagadevan',
      email: 'employee@keysoftware.com',
      role: 'Employee',
      companyId: 'c1',
      companyName: 'Key Software Inc',
    },
  },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(this.loadUser());
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly role = computed(() => this.userSignal()?.role ?? null);

  private baseUrl = 'https://localhost:7129/api';

  constructor(private router: Router, private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const entry = DEMO_USERS[credentials.email.toLowerCase()];
      // if (!entry || entry.password !== credentials.password) {
      //   return throwError(() => new Error('Invalid email or password')).pipe(delay(400));
      // }
      // const token = btoa(JSON.stringify({ sub: entry.user.id, role: entry.user.role }));
      // const response: AuthResponse = { token, user: entry.user };
      // return of(response).pipe(
      //   delay(500),
      //   tap((res) => this.persistSession(res))
      // );

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((res) => this.persistSession(res)),
      catchError((err) => {
        const message = err.error?.message || 'Login failed';
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(...roles: UserRole[]): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }

  getDefaultRoute(): string {
    switch (this.role()) {
      case 'SuperAdmin':
        return '/super-admin/companies';
      case 'CompanyAdmin':
        return '/admin/dashboard';
      case 'Employee':
        return '/employee/active';
      default:
        return '/login';
    }
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.userSignal.set(res.user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
