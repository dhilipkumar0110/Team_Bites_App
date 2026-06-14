import { DatePipe, LowerCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { CompanyDto, SuperAdminServices } from '../../../core/services/super-admin-service';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [RouterLink, DatePipe, LowerCasePipe],
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.scss',
})
export class CompaniesListComponent implements OnInit {
  private readonly superAdminService = inject(SuperAdminServices);

  companies: CompanyDto[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;

    this.superAdminService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load companies', error);
        this.errorMessage = 'Failed to load companies';
        this.loading = false;
      }
    });
  }

  get enterpriseCount(): number {
    return this.companies.filter(c => c.planName === 'Enterprise').length;
  }

  get totalSeats(): number {
    return this.companies.reduce((sum, c) => sum + c.seats, 0);
  }
}
