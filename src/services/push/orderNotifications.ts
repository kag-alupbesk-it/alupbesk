import type { LocalOrder, OrderStatus } from "@/services/orders";
import { sendPushToRoles } from "./send";

interface Recipient {
  role: string;
  url: string;
}

const STATUS_RECIPIENTS: Record<OrderStatus, Recipient[]> = {
  pending: [
    { role: "marketing", url: "/admin/marketing" },
    { role: "manager", url: "/admin/manager" },
    { role: "owner", url: "/admin/owner" },
  ],
  submitted_to_manager: [
    { role: "manager", url: "/admin/manager" },
    { role: "owner", url: "/admin/owner" },
  ],
  confirmed: [
    { role: "marketing", url: "/admin/marketing" },
    { role: "owner", url: "/admin/owner" },
  ],
  rejected_by_manager: [{ role: "marketing", url: "/admin/marketing" }],
  processing: [
    { role: "marketing", url: "/admin/marketing" },
    { role: "owner", url: "/admin/owner" },
  ],
  completed: [
    { role: "marketing", url: "/admin/marketing" },
    { role: "owner", url: "/admin/owner" },
  ],
  cancelled: [{ role: "marketing", url: "/admin/marketing" }],
};

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "Pesanan baru masuk dan menunggu konfirmasi.",
  submitted_to_manager: "Pesanan baru diajukan dan menunggu persetujuan.",
  confirmed: "Pesanan telah disetujui/dikonfirmasi.",
  rejected_by_manager: "Pesanan ditolak oleh manajer.",
  processing: "Pesanan sedang diproses.",
  completed: "Pesanan telah selesai diproses.",
  cancelled: "Pesanan dibatalkan.",
};

export function notifyOrderStatusChange(order: LocalOrder, status: OrderStatus): void {
  const recipients = STATUS_RECIPIENTS[status];
  if (!recipients || recipients.length === 0) return;
  const customerName = order.customer?.name?.trim() || "Pelanggan";
  for (const recipient of recipients) {
    void sendPushToRoles([recipient.role], {
      title: "Pembaruan Pesanan",
      body: `${customerName} — ${STATUS_MESSAGES[status]}`,
      url: recipient.url,
    });
  }
}