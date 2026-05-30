import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['employee@keysoftware.com', [Validators.required, Validators.email]],
    password: ['demo123', Validators.required],
  });

  readonly demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@teambites.com', color: 'super' },
    { role: 'Company Admin', email: 'admin@keysoftware.com', color: 'admin' },
    { role: 'Employee', email: 'employee@keysoftware.com', color: 'employee' },
  ];

  fillDemo(email: string): void {
    this.form.patchValue({ email, password: 'demo123' });
    this.error.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(this.auth.getDefaultRoute());
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message || 'Login failed');
      },
    });
  }
}
