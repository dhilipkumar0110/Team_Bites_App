import { Injectable } from '@angular/core';
import {
  AuditLog,
  BillingPlan,
  Company,
  DishSummary,
  Employee,
  EmployeeOrder,
  MenuItem,
  OrderSession,
  SessionResponse,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly companies: Company[] = [
    {
      id: 'c1',
      name: 'Key Software Inc',
      plan: 'Growth',
      createdAt: '2024-08-12',
      adminEmail: 'admin@keysoftware.com',
      seats: 48,
    },
    {
      id: 'c2',
      name: 'Northwind Labs',
      plan: 'Starter',
      createdAt: '2025-01-03',
      adminEmail: 'ops@northwind.io',
      seats: 12,
    },
    {
      id: 'c3',
      name: 'Contoso Digital',
      plan: 'Enterprise',
      createdAt: '2025-03-18',
      adminEmail: 'hr@contoso.com',
      seats: 120,
    },
  ];

  readonly billingPlans: BillingPlan[] = [
    { plan: 'Starter', seats: 15, renewalDate: '2025-06-15', monthlyAmount: 49 },
    { plan: 'Growth', seats: 50, renewalDate: '2025-06-22', monthlyAmount: 149 },
    { plan: 'Enterprise', seats: 200, renewalDate: '2025-07-01', monthlyAmount: 399 },
  ];

  readonly auditLogs: AuditLog[] = [
    {
      id: 'a1',
      action: 'Company created',
      user: 'Super Admin',
      company: 'Northwind Labs',
      timestamp: '2025-05-28T14:22:00',
    },
    {
      id: 'a2',
      action: 'Session closed',
      user: 'Priya Sharma',
      company: 'Key Software Inc',
      timestamp: '2025-05-27T18:45:00',
    },
    {
      id: 'a3',
      action: 'User invited',
      user: 'Rahul Mehta',
      company: 'Key Software Inc',
      timestamp: '2025-05-26T10:11:00',
    },
    {
      id: 'a4',
      action: 'Plan upgraded',
      user: 'Super Admin',
      company: 'Contoso Digital',
      timestamp: '2025-05-24T09:30:00',
    },
    {
      id: 'a5',
      action: 'Login failed (3x)',
      user: 'unknown@spam.com',
      company: '—',
      timestamp: '2025-05-23T22:01:00',
    },
  ];

  readonly menuItems: MenuItem[] = [
    {
      id: 'm1',
      dishName: 'Chicken Biryani',
      category: 'Biryani',
      type: 'Non-Veg',
      description: 'Hyderabadi style, served with raita',
    },
    {
      id: 'm2',
      dishName: 'Mutton Biryani',
      category: 'Biryani',
      type: 'Non-Veg',
      description: 'Slow-cooked dum biryani',
    },
    {
      id: 'm3',
      dishName: 'Veg Biryani',
      category: 'Biryani',
      type: 'Veg',
      description: 'Fragrant basmati with mixed vegetables',
    },
    {
      id: 'm4',
      dishName: 'Paneer Butter Masala',
      category: 'Curry',
      type: 'Veg',
      description: 'With butter naan combo option',
    },
    {
      id: 'm5',
      dishName: 'Chicken 65',
      category: 'Starters',
      type: 'Non-Veg',
      description: 'Spicy Andhra starter',
    },
    {
      id: 'm6',
      dishName: 'Gobi Manchurian',
      category: 'Starters',
      type: 'Veg',
    },
    {
      id: 'm7',
      dishName: 'Meals (South Indian)',
      category: 'Meals',
      type: 'Veg',
      description: 'Rice, sambar, rasam, poriyal, curd',
    },
    {
      id: 'm8',
      dishName: 'Egg Fried Rice',
      category: 'Rice',
      type: 'Non-Veg',
    },
  ];

  readonly employees: Employee[] = [
    { id: 'e1', name: 'Dhilip Sagadevan', email: 'dhilip@keysoftware.com', role: 'Employee', status: 'Active' },
    { id: 'e2', name: 'Priya Sharma', email: 'priya@keysoftware.com', role: 'CompanyAdmin', status: 'Active' },
    { id: 'e3', name: 'Rahul Mehta', email: 'rahul@keysoftware.com', role: 'Employee', status: 'Active' },
    { id: 'e4', name: 'Ananya Iyer', email: 'ananya@keysoftware.com', role: 'Employee', status: 'Invited' },
    { id: 'e5', name: 'Vikram Singh', email: 'vikram@keysoftware.com', role: 'Employee', status: 'Active' },
  ];

  sessions: OrderSession[] = [
    {
      id: 's1',
      title: 'May Team Lunch — Friday',
      deadline: '2025-05-30T12:00:00',
      status: 'Open',
      menuItemIds: ['m1', 'm2', 'm3', 'm5', 'm6', 'm7'],
      createdAt: '2025-05-28T09:00:00',
    },
    {
      id: 's2',
      title: 'April Month-end Treat',
      deadline: '2025-04-25T14:00:00',
      status: 'Closed',
      menuItemIds: ['m1', 'm3', 'm4'],
      createdAt: '2025-04-22T11:00:00',
    },
  ];

  readonly sessionResponses: Record<string, SessionResponse[]> = {
    s1: [
      {
        userId: 'e1',
        userName: 'Dhilip Sagadevan',
        submittedAt: '2025-05-28T10:15:00',
        items: [
          { dishName: 'Chicken Biryani', qty: 1 },
          { dishName: 'Chicken 65', qty: 1 },
        ],
      },
      {
        userId: 'e3',
        userName: 'Rahul Mehta',
        submittedAt: '2025-05-28T10:42:00',
        items: [
          { dishName: 'Mutton Biryani', qty: 1 },
          { dishName: 'Gobi Manchurian', qty: 1 },
        ],
      },
      {
        userId: 'e5',
        userName: 'Vikram Singh',
        submittedAt: '2025-05-28T11:05:00',
        items: [{ dishName: 'Veg Biryani', qty: 1 }],
      },
    ],
    s2: [],
  };

  readonly orderHistory: EmployeeOrder[] = [
    {
      id: 'o1',
      sessionId: 's2',
      sessionTitle: 'April Month-end Treat',
      orderedAt: '2025-04-24T13:20:00',
      items: [{ dishName: 'Chicken Biryani', qty: 1 }],
      status: 'Closed',
    },
    {
      id: 'o2',
      sessionId: 's1',
      sessionTitle: 'May Team Lunch — Friday',
      orderedAt: '2025-05-28T10:15:00',
      items: [
        { dishName: 'Chicken Biryani', qty: 1 },
        { dishName: 'Chicken 65', qty: 1 },
      ],
      status: 'Submitted',
    },
  ];

  getSessionSummary(sessionId: string): DishSummary[] {
    const responses = this.sessionResponses[sessionId] ?? [];
    const map = new Map<string, DishSummary>();

    for (const r of responses) {
      for (const item of r.items) {
        const menu = this.menuItems.find((m) => m.dishName === item.dishName);
        const existing = map.get(item.dishName);
        if (existing) {
          existing.totalQty += item.qty;
          if (!existing.orderedBy.includes(r.userName)) {
            existing.orderedBy.push(r.userName);
          }
        } else {
          map.set(item.dishName, {
            dishName: item.dishName,
            category: menu?.category ?? 'Other',
            type: menu?.type ?? 'Veg',
            totalQty: item.qty,
            orderedBy: [r.userName],
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
  }

  getActiveSession(): OrderSession | undefined {
    return this.sessions.find((s) => s.status === 'Open');
  }

  getMenuForSession(sessionId: string): MenuItem[] {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return [];
    return this.menuItems.filter((m) => session.menuItemIds.includes(m.id));
  }
}
