import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, MenuItemDto } from '../../../core/services/dashboard-service';
import { of, switchMap } from 'rxjs';

interface CartLine {
  dishId: string;
  dishName: string;
  type: string;
  qty: number;
}

@Component({
  selector: 'app-menu-order',
  standalone: true,
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

  readonly cartTotal = computed(() => this.cart().reduce((s, c) => s + c.qty, 0));

  submitOrder(): void {
    if (!this.cart().length || !this.session) return;

    const request = {
      sessionId: this.session.sessionId,

      // 🔥 Map your existing structure → API structure
      items: this.cart().map(item => ({
        menuItemId: item.dishId,   // ✅ mapping here
        qty: item.qty         // ✅ mapping here
      }))
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
