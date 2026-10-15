import type { ContactMessageInput } from "@/backend/modules/contact/index";
import { request } from "./request";

export const contactApi = {
  createMessage: (input: ContactMessageInput) =>
    request<{ id: string; createdAt: string }>("/contact/messages", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  getMessages: () =>
    request<import("@/backend/modules/contact/index").ContactMessage[]>("/contact/messages"),
};
