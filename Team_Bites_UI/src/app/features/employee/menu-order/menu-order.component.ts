import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, MenuItemDto } from '../../../core/services/dashboard-service';
import { of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';


interface CartLine {
  dishId: string;
  dishName: string;
  type: string;
  qty: number;
}

interface CustomCartLine {
  dishId: string;     // generated UUID so each custom dish is uniquely trackable
  dishName: string;
  type: 'Veg' | 'Non-Veg';
  qty: number;
}

@Component({
  selector: 'app-menu-order',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './menu-order.component.html',
  styleUrl: './menu-order.component.scss',
})
export class MenuOrderComponent {
  private readonly mock = inject(MockDataService);
  private readonly router = inject(Router);

  private sessionService = inject(DashboardService);

  readonly vegOnly = signal(false);
  readonly cart = signal<CartLine[]>([]);
  readonly submitted = signal(false);
  readonly menuItems = signal<MenuItemDto[]>([]);

  session: any = null;

    readonly customCart  = signal<CustomCartLine[]>([]);
  readonly customError = signal<string | null>(null);

   customDishName = '';
  customDishType: 'Veg' | 'Non-Veg' = 'Non-Veg';



  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.sessionService.getRecentSessions().pipe(

      switchMap((sessions) => {
        if (!sessions || sessions.length === 0) return of(null);

        // 🔥 pick active session
        this.session =
          sessions.find(s => s.status === 'Open') ?? sessions[0];

        if (!this.session) return of(null);

        // 🔥 get menu for session
        return this.sessionService.getMenu(this.session.sessionId);
      })

    ).subscribe({
      next: (menu) => {
        if (!menu) return;
        this.menuItems.set(menu);
      },
      error: (err) => {
        console.error('Error loading menu', err);
      }
    });
  }

  readonly menu = computed(() => {
     let items = this.menuItems(); // ✅ call signal

  if (!items || items.length === 0) return [];

  if (this.vegOnly()) {
    items = items.filter((m) => m.type === 'Veg');
  }

  return items;
  });

  readonly categories = computed(() => {
    const cats = new Set(this.menu().map((m) => m.category));
    return Array.from(cats);
  });

  itemsByCategory(cat: string) {
    return this.menu().filter((m) => m.category === cat);
  }

  getQty(dishId: string): number {
    return this.cart().find((c) => c.dishId === dishId)?.qty ?? 0;
  }

  changeQty(dishId: string, dishName: string, type: 'Veg' | 'Non-Veg', delta: number): void {
    const current = [...this.cart()];
    const idx = current.findIndex((c) => c.dishId === dishId);
    if (idx >= 0) {
      const next = current[idx].qty + delta;
      if (next <= 0) current.splice(idx, 1);
      else current[idx] = { ...current[idx], qty: next };
    } else if (delta > 0) {
      current.push({ dishId, dishName, type, qty: 1 });
    }
    this.cart.set(current);
  }

  readonly cartTotal = computed(() =>
    this.cart().reduce((s, c) => s + c.qty, 0) +
    this.customCart().reduce((s, c) => s + c.qty, 0)
  );

  addCustomDish(): void {
    const name = this.customDishName.trim();
    if (!name) return;
 
    // Prevent duplicate custom dish names (case-insensitive)
    const duplicate = this.customCart()
      .some(c => c.dishName.toLowerCase() === name.toLowerCase());
 
    if (duplicate) {
      this.customError.set(`"${name}" is already in your order.`);
      setTimeout(() => this.customError.set(null), 3000);
      return;
    }
 
    this.customCart.update(list => [
      ...list,
      {
        dishId:   crypto.randomUUID(),  // client-side unique id
        dishName: name,
        type:     this.customDishType,
        qty:      1
      }
    ]);
 
    // Reset input
    this.customDishName = '';
    this.customError.set(null);
  }
 
  changeCustomQty(dishId: string, delta: number): void {
    this.customCart.update(list => {
      const updated = list.map(c =>
        c.dishId === dishId ? { ...c, qty: c.qty + delta } : c
      );
      return updated.filter(c => c.qty > 0);  // remove if qty hits 0
    });
  }
 
  removeCustomDish(dishId: string): void {
    this.customCart.update(list => list.filter(c => c.dishId !== dishId));
  }

  submitOrder(): void {
    if (!this.cart().length || !this.session) return;

     const regularItems = this.cart().map(item => ({
      menuItemId: item.dishId,
      dishName:   item.dishName,
      qty:        item.qty,
      isCustom:   false
    }));
 
    const customItems = this.customCart().map(item => ({
      menuItemId: null,           // no menu ID — admin sees this as a special request
      dishName:   item.dishName,
      qty:        item.qty,
      isCustom:   true,
      type:       item.type
    }));
 
    const request = {
      sessionId: this.session.sessionId,
      items:     [...regularItems, ...customItems]
    };
 

    this.sessionService.submitOrder(request).subscribe({

      next: () => {
        console.log('Order submitted successfully');

        this.submitted.set(true);

        setTimeout(() => {
          this.router.navigate(['/employee/history']);
        }, 800);
      },
      error: (err) => {
        console.error('Order submission failed', err);
        alert(err.error?.message || 'Failed to submit order');
      }
    });
  }
}
