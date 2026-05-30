export interface Company {
  id: string;
  name: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  createdAt: string;
  adminEmail: string;
  seats: number;
}

export interface BillingPlan {
  plan: string;
  seats: number;
  renewalDate: string;
  monthlyAmount: number;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  company: string;
  timestamp: string;
}

export interface MenuItem {
  id: string;
  dishName: string;
  category: string;
  type: 'Veg' | 'Non-Veg';
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Invited' | 'Inactive';
}

export interface OrderSession {
  id: string;
  title: string;
  deadline: string;
  status: 'Draft' | 'Open' | 'Closed';
  menuItemIds: string[];
  createdAt: string;
}

export interface SessionResponse {
  userId: string;
  userName: string;
  submittedAt: string;
  items: { dishName: string; qty: number }[];
}

export interface DishSummary {
  dishName: string;
  category: string;
  type: 'Veg' | 'Non-Veg';
  totalQty: number;
  orderedBy: string[];
}

export interface EmployeeOrder {
  id: string;
  sessionId: string;
  sessionTitle: string;
  orderedAt: string;
  items: { dishName: string; qty: number }[];
  status: 'Submitted' | 'Closed';
}
