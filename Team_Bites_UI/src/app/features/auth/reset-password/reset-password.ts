import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators, ReactiveFormsModule  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard-service';

type State = 'form' | 'success' | 'error';

// Custom validator: passwords must match
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newPassword')?.value ?? '';
  const cpw = group.get('confirmPassword')?.value ?? '';
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private sessionService = inject(DashboardService);

  // ── Signals ───────────────────────────────────────────────────────────────
  state = signal<State>('form');
  submitting = signal(false);
  apiError = signal<string | null>(null);
  userName = signal<string>('');

  // Token from query params — carried from accept-invite step
  private token = '';

  // Eye toggles
  showNew = false;
  showConfirm = false;

  // ── Form ──────────────────────────────────────────────────────────────────
  form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordMatchValidator }
  );

  // ── Password strength ──────────────────────────────────────────────────────
  private pw = computed(() => this.form.get('newPassword')?.value ?? '');

  ruleLength = computed(() => this.pw().length >= 8);
  ruleUpper = computed(() => /[A-Z]/.test(this.pw()));
  ruleLower = computed(() => /[a-z]/.test(this.pw()));
  ruleNumber = computed(() => /\d/.test(this.pw()));

  strength = computed<'weak' | 'fair' | 'strong'>(() => {
    const score = [this.ruleLength(), this.ruleUpper(), this.ruleLower(), this.ruleNumber()]
      .filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score === 3) return 'fair';
    return 'strong';
  });

  strengthWidth = computed(() => {
    const map = { weak: '33%', fair: '66%', strong: '100%' } as const;
    return map[this.strength()];
  });

  strengthLabel = computed(() => {
    const map = { weak: 'Weak', fair: 'Fair', strong: 'Strong' } as const;
    return map[this.strength()];
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.userName.set(this.route.snapshot.queryParamMap.get('name') ?? '');

    if (!this.token) {
      this.state.set('error');
      this.apiError.set('No reset token found. Please use the link from your invite email.');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.apiError.set(null);

    const { newPassword, confirmPassword } = this.form.getRawValue();

    if (!newPassword || !confirmPassword) {
      this.apiError.set('Password is required');
      return;
    }

    const payload = {
      token: this.token,
      newPassword,
      confirmPassword
    };

    this.submitting.set(true);

    this.sessionService.resetPassword(payload).subscribe({
      next: () => {
        this.state.set('success');

        // Navigate after animation
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },

      error: (err) => {
        this.submitting.set(false);

        this.apiError.set(
          err.error?.message ?? 'Something went wrong. Please try again.'
        );
      }
    });
  }
}
