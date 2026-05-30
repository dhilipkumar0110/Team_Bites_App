import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-session.component.html',
  styleUrl: './create-session.component.scss',
})
export class CreateSessionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly mock = inject(MockDataService);
  private readonly router = inject(Router);

  readonly menuItems = this.mock.menuItems;
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    deadline: ['', Validators.required],
    menuIds: this.fb.nonNullable.control<string[]>([], Validators.required),
  });

  toggleMenu(id: string): void {
    const current = this.form.controls.menuIds.value;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    this.form.controls.menuIds.setValue(next);
  }

  isSelected(id: string): boolean {
    return this.form.controls.menuIds.value.includes(id);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.mock.sessions.unshift({
      id: 's' + Date.now(),
      title: v.title,
      deadline: new Date(v.deadline).toISOString(),
      status: 'Open',
      menuItemIds: v.menuIds,
      createdAt: new Date().toISOString(),
    });
    this.mock.sessionResponses['s' + Date.now()] = [];
    this.saved.set(true);
    setTimeout(() => this.router.navigate(['/admin/dashboard']), 1000);
  }
}
