import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreateCompanyRequest, SuperAdminServices } from '../../../core/services/super-admin-service';

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
  private readonly superAdminService = inject(SuperAdminServices);

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

    const request: CreateCompanyRequest = {
      name: this.form.controls.name.value,
      plan: this.form.controls.plan.value,
      adminEmail: this.form.controls.adminEmail.value
    };
    
     this.superAdminService.createCompany(request).subscribe({
      next: (response) => {
        console.log('Company created successfully', response);

        this.saved.set(true);
        setTimeout(() => {
          this.router.navigate(['/super-admin/companies']);
        }, 1200);
      },
      error: (error) => {
        console.error('Failed to create company', error);

      }
    });

    setTimeout(() => this.router.navigate(['/super-admin/companies']), 1200);
  }
}
