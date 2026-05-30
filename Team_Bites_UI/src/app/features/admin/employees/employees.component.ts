import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent {
  private readonly fb = inject(FormBuilder);
  readonly employees = inject(MockDataService).employees;
  readonly invited = signal<string | null>(null);

  readonly inviteForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  invite(): void {
    if (this.inviteForm.invalid) return;
    const v = this.inviteForm.getRawValue();
    this.employees.push({
      id: 'e' + Date.now(),
      name: v.name,
      email: v.email,
      role: 'Employee',
      status: 'Invited',
    });
    this.invited.set(v.email);
    this.inviteForm.reset();
    setTimeout(() => this.invited.set(null), 3000);
  }
}
