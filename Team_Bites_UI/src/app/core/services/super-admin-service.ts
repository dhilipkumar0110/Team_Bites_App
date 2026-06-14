import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateCompanyRequest {
  name: string;
  plan: string;
  adminEmail: string;
}

export interface CompanyDto {
  id: string;
  name: string;
  planName: string;
  seats: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminServices {

  private baseUrl = 'https://localhost:7129/api/superadmin'; // change to your API URL

  constructor(private http: HttpClient) {}

  createCompany(request: CreateCompanyRequest): Observable<CompanyDto> {
    return this.http.post<CompanyDto>(`${this.baseUrl}/companies`, request);
  }

   getCompanies(): Observable<CompanyDto[]> {
    return this.http.get<CompanyDto[]>(
      `${this.baseUrl}/companies`
    );
  }
}