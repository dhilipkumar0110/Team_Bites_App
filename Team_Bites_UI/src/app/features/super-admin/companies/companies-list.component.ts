import { DatePipe, LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [RouterLink, DatePipe, LowerCasePipe],
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.scss',
})
export class CompaniesListComponent {
  readonly companies = inject(MockDataService).companies;

  get enterpriseCount(): number {
    return this.companies.filter((c) => c.plan === 'Enterprise').length;
  }

  get totalSeats(): number {
    return this.companies.reduce((sum, c) => sum + c.seats, 0);
  }
}
