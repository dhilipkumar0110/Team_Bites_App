import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DashboardService, MyOrderDto } from '../../../core/services/dashboard-service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent {
  private sessionService = inject(DashboardService);

  readonly orders = signal<MyOrderDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadOrders();
  }
  loadOrders() {
    this.sessionService.getMyOrders().subscribe({
      next: (res) => {
        console.log('Orders:', res);

        this.orders.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.isLoading.set(false);
      }
    });
  }
}
