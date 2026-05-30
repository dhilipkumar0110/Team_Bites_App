import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { MenuItem } from '../../../core/models/app.models';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.scss',
})
export class MenuManagementComponent {
  private readonly fb = inject(FormBuilder);
  readonly mock = inject(MockDataService);

  readonly showForm = signal(false);

  readonly form = this.fb.nonNullable.group({
    dishName: ['', Validators.required],
    category: ['Biryani', Validators.required],
    type: ['Veg' as MenuItem['type'], Validators.required],
    description: [''],
  });

  addDish(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.mock.menuItems.push({
      id: 'm' + Date.now(),
      dishName: v.dishName,
      category: v.category,
      type: v.type,
      description: v.description || undefined,
    });
    this.form.reset({ category: 'Biryani', type: 'Veg' });
    this.showForm.set(false);
  }
}
