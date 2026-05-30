import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { MenuItem } from '../../../core/models/app.models';
import { DashboardService, MenuItemDto } from '../../../core/services/dashboard-service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.scss',
})
export class MenuManagementComponent {
  private readonly fb = inject(FormBuilder);
  //readonly mock = inject(MockDataService);

  readonly showForm = signal(false);
  private sessionService = inject(DashboardService);
  menuItems: MenuItemDto[] = [];

  readonly form = this.fb.nonNullable.group({
    dishName: ['', Validators.required],
    category: ['Biryani', Validators.required],
    type: ['Veg' as MenuItem['type'], Validators.required],
    description: [''],
  });
  
  ngOnInit(): void {
      this.sessionService.getMenu().subscribe((menuItems: MenuItemDto[]) => {
      this.menuItems = menuItems;
    });
  }

  addDish(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const request = {
    dishName: v.dishName,
    category: v.category,
    type: v.type,
    description: v.description || ''
  };

  this.sessionService.createMenuItem(request).subscribe({
    next: (res) => {
      console.log('Menu item created:', res);

      this.form.reset({
        category: 'Biryani',
        type: 'Veg'
      });

      this.showForm.set(false);

      this.sessionService.getMenu().subscribe((menuItems: MenuItemDto[]) => {
      this.menuItems = menuItems;
    });
    },
    error: (err : any) => {
      console.error('Create menu failed', err);
      alert(err.error?.message || 'Failed to create menu item');
    }
  });
  }
}
