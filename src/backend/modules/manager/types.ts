export interface FinancialCard { label: string; value: string; change: string; positive: boolean; bars: number[]; }
export interface Registration {
  id: string;
  profileId: string;
  name: string;
  email: string;
  dept: string;
  requestedRole: string;
  date: string;
  initial: string;
  status: "pending" | "approved" | "rejected";
}
export interface Activity { time: string; text: string; tag?: string; highlight?: boolean; system?: boolean; }
export interface SystemStatus { serverGudang: string; dbLatency: string; }
export interface DashboardData { financialCards: FinancialCard[]; registrations: Registration[]; activities: Activity[]; systemStatus: SystemStatus; }

export interface Metric { label: string; value: string; sub: string | null; icon: string | null; isProgress?: boolean; }
export interface Statement { period: string; revenue: string; profit: string; margin: string; }
export interface Expense { label: string; value: string; pct: number; color: string; }
export interface BarData { value: number; label?: string; }
export interface FinancialsData { metrics: Metric[]; statements: Statement[]; expenses: Expense[]; barChart: BarData[]; donut: { value: number; label: string; color: string }[]; }

export interface InventoryItem { id: string; sku: string; name: string; variant: string; category: string; icon: string; stock: number; threshold: number; status: string; }
export interface InventoryData { items: InventoryItem[]; filters: string[]; }

export interface UserItem { id: string; name: string; email: string; dept: string; role: string; status: string; active: boolean; }
export interface UsersData { users: UserItem[]; }
