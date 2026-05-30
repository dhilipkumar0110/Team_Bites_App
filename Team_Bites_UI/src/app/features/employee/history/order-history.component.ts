import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent {
  readonly orders = inject(MockDataService).orderHistory;
}
