import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.scss',
})
export class CreateCompanyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    plan: ['Growth', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.set(true);
    setTimeout(() => this.router.navigate(['/super-admin/companies']), 1200);
  }
}
