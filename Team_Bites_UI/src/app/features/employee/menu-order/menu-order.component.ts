import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

interface CartLine {
  dishId: string;
  dishName: string;
  type: 'Veg' | 'Non-Veg';
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

  readonly vegOnly = signal(false);
  readonly cart = signal<CartLine[]>([]);
  readonly submitted = signal(false);

  get session() {
    return this.mock.getActiveSession();
  }

  readonly menu = computed(() => {
    const s = this.session;
    if (!s) return [];
    let items = this.mock.getMenuForSession(s.id);
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
    this.submitted.set(true);
    setTimeout(() => this.router.navigate(['/employee/history']), 800);
  }
}
