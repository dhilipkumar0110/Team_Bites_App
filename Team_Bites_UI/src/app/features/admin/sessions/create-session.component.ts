import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, MenuItemDto } from '../../../core/services/dashboard-service';

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

  private sessionService = inject(DashboardService);
  //readonly menuItems = this.mock.menuItems;
  readonly saved = signal(false);
  menuItems : MenuItemDto[] = [];

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    deadline: ['', Validators.required],
    menuIds: this.fb.nonNullable.control<string[]>([], Validators.required),
  });

  ngOnInit(): void {
    this.sessionService.getMenu().subscribe((menuItems: MenuItemDto[]) => {
    this.menuItems = menuItems;
  });
  }

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
     const request = {
    title: v.title,
    deadline: new Date(v.deadline).toISOString(),
    menuItemIds: v.menuIds
  };
  
     this.sessionService.createSession(request).subscribe({
    next: (res) => {
      console.log('Session created:', res);

      this.saved.set(true);

      // navigate after success
      setTimeout(() => {
        this.router.navigate(['/admin/dashboard']);
      }, 1000);
    },
    error: (err : any) => {
      console.error('Create session failed', err);
      alert(err.error?.message || 'Failed to create session');
    }
  });
  }
}
