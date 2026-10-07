import { getLocalOrders } from "@/services/orders";
import { getCustomRequests } from "@/backend/modules/custom";
import { getRoleRequests } from "@/backend/modules/roleRequests";
import { formatRp, fmtDate, fmtTime, isRevenueStatus, periodDays, withinDays } from "../helpers";
import type { Activity, DashboardData, FinancialCard, Registration, SystemStatus } from "../types";
import { getSystemStatus } from "./getSystemStatus";
import { revenueOf } from "./revenueOf";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  submitted_to_manager: "Diajukan ke Manajer",
  confirmed: "Dikonfirmasi",
  rejected_by_manager: "Ditolak",
  cancelled: "Dibatalkan",
  processing: "Diproses",
  completed: "Selesai",
};

export async function getDashboardData(
  period = "monthly",
  includeRoleRequests = false,
): Promise<DashboardData> {
  const orders = getLocalOrders();
  const customs = getCustomRequests();
  const days = periodDays(period);
  const now = Date.now();
  const windowMs = days * 86400000;

  const current = orders.filter((order) => withinDays(order.createdAt, now, days));
  const previous = orders.filter((order) => {
    const at = new Date(order.createdAt).getTime();
    return at > now - windowMs * 2 && at <= now - windowMs;
  });

  const currRevenue = revenueOf(current);
  const prevRevenue = revenueOf(previous);
  const revenueChange = prevRevenue > 0 ? Math.round(((currRevenue - prevRevenue) / prevRevenue) * 100) : currRevenue > 0 ? 100 : 0;

  const pending = current.filter((order) => order.status === "pending" || order.status === "submitted_to_manager").length;

  const bucketRevenue = (index: number): number => {
    const start = now - (5 - index) * (windowMs / 5);
    const end = now - (5 - index - 1) * (windowMs / 5);
    return orders.filter((order) => {
      const at = new Date(order.createdAt).getTime();
      return at >= start && at < end;
    }).reduce((sum, order) => (isRevenueStatus(order.status) ? sum + order.total : sum), 0);
  };
  const bucketValues = [0, 1, 2, 3, 4].map(bucketRevenue);
  const maxBucket = Math.max(...bucketValues, 1);
  const bars = bucketValues.map((value) => Math.round((value / maxBucket) * 10) / 10);
  const financialCards: FinancialCard[] = [
    { label: "Total Pendapatan", value: formatRp(currRevenue), change: `${revenueChange}%`, positive: revenueChange >= 0, bars },
    { label: "Pesanan Masuk", value: String(current.length), change: `${current.length >= previous.length ? "+" : "-"}${Math.abs(current.length - previous.length)}`, positive: current.length >= previous.length, bars },
    { label: "Menunggu Konfirmasi", value: String(pending), change: pending > 0 ? "Perlu tindakan" : "Semua clear", positive: pending === 0, bars },
  ];

  const roleRequests = includeRoleRequests ? await getRoleRequests() : [];
  const registrations: Registration[] = roleRequests.slice(0, 10).map((request) => ({
    id: request.id,
    profileId: request.profileId,
    name: request.name,
    email: request.email,
    dept: request.department,
    requestedRole: request.requestedRole,
    date: fmtDate(request.createdAt),
    initial: (request.name.trim()[0] ?? "?").toUpperCase(),
    status: "pending",
  }));

  const activities: Activity[] = [
    ...orders.map((order) => ({
      at: new Date(order.createdAt).getTime(),
      time: fmtTime(order.createdAt),
      text: `Pesanan ${order.id} dari ${order.customer.name}`,
      tag: ORDER_STATUS_LABEL[order.status] ?? order.status,
      highlight: order.status === "confirmed" || order.status === "completed",
    })),
    ...customs.map((request) => ({
      at: new Date(request.createdAt).getTime(),
      time: fmtTime(request.createdAt),
      text: `Permintaan custom dari ${request.nama}`,
      tag: request.layanan,
      highlight: false,
    })),
  ].sort((left, right) => right.at - left.at).slice(0, 8).map((entry) => ({
    time: entry.time,
    text: entry.text,
    tag: entry.tag,
    highlight: entry.highlight,
  }));

  const systemStatus: SystemStatus = await getSystemStatus();

  return { financialCards, registrations, activities, systemStatus };
}
