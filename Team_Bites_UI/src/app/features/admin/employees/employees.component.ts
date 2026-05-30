import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, EmployeeDto } from '../../../core/services/dashboard-service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent {
  private readonly fb = inject(FormBuilder);
  readonly invited = signal<string | null>(null);
  private sessionService = inject(DashboardService);

  readonly inviteForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  employees: EmployeeDto[] = [];

  ngOnInit(): void {
    this.sessionService.getEmployees().subscribe({
      next: (emp) => this.employees = emp,
      error: (err) => console.error('Employees error', err)
    });
  }

  invite(): void {
    if (this.inviteForm.invalid) return;

    const v = this.inviteForm.getRawValue();

    const request = {
      name: v.name,
      email: v.email
    };

    this.sessionService.invite(request).subscribe({
      next: (res) => {
        console.log('Invited:', res);

        this.employees.push(res);

        // show success
        this.invited.set(v.email);

        // reset form
        this.inviteForm.reset();

        setTimeout(() => this.invited.set(null), 3000);
      },
      error: (err) => {
        console.error('Invite failed', err);
        alert(err.error?.message || 'Failed to invite user');
      }
    });
  }
}
