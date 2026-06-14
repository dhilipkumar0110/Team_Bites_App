import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmployeeDto {
  id: string;
  name: string;
  role: string;
  status: string;
}
export interface SessionResponseDto {
  userId: string;
  userName: string;
  submittedAt: string;
  items: { dishName: string; qty: number }[];
  // add other fields if needed
}
export interface SessionDto {
  sessionId: string;
  title: string;
  status: string;
  deadline: string;
  createdAt: string;
}

export interface MenuItemDto {
  id: string;
  dishName: string;
  category: string;
  type: string;
  description?: string;
}
export interface CreateSessionRequest {
  title: string;
  deadline: string;
  menuItemIds: string[];
}

export interface CreateMenuItemRequest {
  dishName: string;
  category: string;
  type: string;
  description?: string;
}

export interface DishSummaryDto {
  dishName: string;
  category: string;
  type: string;
  totalQty: number;
  orderedBy: string[];
}
export interface InviteRequest {
  name: string;
  email: string;
}

export interface OrderLineDto {
  menuItemId: string | null;   // was string, now nullable
  dishName: string;
  qty: number;
  isCustom: boolean;
  type?: string;
}

export interface OrdersListDto {
  dishName: string;
  qty: number;
}
export interface SubmitOrderRequest {
  sessionId: string;
  items: OrderLineDto[];
}

export interface MyOrderDto {
  id: string;
  sessionId: string;
  sessionTitle: string;
  orderedAt: string;
  items: OrdersListDto[];
  status: string;
}

export interface AcceptInviteResponse {
  name: string;
  email: string;
  token: string;
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = 'https://localhost:7129/api'; // change if needed

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(`${this.baseUrl}/users`);
  }

  getActiveSession(): Observable<SessionDto> {
    return this.http.get<SessionDto>(`${this.baseUrl}/sessions/getSessions`);
  }

  getMenu(sessionId?: string): Observable<MenuItemDto[]> {
    if (sessionId) {
      return this.http.get<MenuItemDto[]>(`${this.baseUrl}/menu?sessionId=${sessionId}`);
    }
    return this.http.get<MenuItemDto[]>(`${this.baseUrl}/menu`);
  }

  getSessionSummary(sessionId: string): Observable<DishSummaryDto[]> {
    return this.http.get<DishSummaryDto[]>(
      `${this.baseUrl}/sessions/${sessionId}/summary`
    );
  }

  getSessionResponses(sessionId: string): Observable<SessionResponseDto[]> {
    return this.http.get<SessionResponseDto[]>(
      `${this.baseUrl}/sessions/${sessionId}/responses`
    );
  }

  getRecentSessions(): Observable<SessionDto[]> {
    return this.http.get<SessionDto[]>(`${this.baseUrl}/sessions/recent`);
  }

  createSession(request: CreateSessionRequest): Observable<SessionDto> {
    return this.http.post<SessionDto>(`${this.baseUrl}/sessions`, request);
  }

  createMenuItem(request: CreateMenuItemRequest): Observable<MenuItemDto> {
    return this.http.post<MenuItemDto>(`${this.baseUrl}/menu`, request);
  }

  invite(request: InviteRequest): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(`${this.baseUrl}/auth/invite`, request);
  }

  submitOrder(request: SubmitOrderRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders`, request);
  }

  getMyOrders(): Observable<MyOrderDto[]> {
    return this.http.get<MyOrderDto[]>(`${this.baseUrl}/orders/my`);
  }

  acceptInvite(token: string): Observable<AcceptInviteResponse> {
    return this.http.post<AcceptInviteResponse>(
      `${this.baseUrl}/auth/accept-invite`,
      { token }
    );
  }

  resetPassword(payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/auth/reset-password`,
      payload
    );
  }

  closeSession(sessionId: string) {
    return this.http.put(
      `${this.baseUrl}/sessions/${sessionId}/close`,
      {}
    );
  }
}