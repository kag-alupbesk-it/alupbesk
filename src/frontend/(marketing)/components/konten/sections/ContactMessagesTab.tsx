"use client";

import { useCallback } from "react";
import type { ContactMessage } from "@/backend/modules/contact";
import { contactApi } from "@/services/api";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function ContactMessagesTab() {
  const loadMessages = useCallback(() => contactApi.getMessages(), []);
  const { data: messages, loading, error } = usePollingResource<ContactMessage[]>(
    loadMessages,
    [],
  );

  if (loading && messages.length === 0) {
    return <div className="px-10 py-8 text-sm text-on-surface/50">Memuat pesan masuk...</div>;
  }

  if (error && messages.length === 0) {
    return <div role="alert" className="px-10 py-8 text-sm text-red-400">{error}</div>;
  }

  if (messages.length === 0) {
    return <div className="px-10 py-8 text-sm text-on-surface/50">Belum ada pesan masuk.</div>;
  }

  return (
    <section className="space-y-4 px-10 py-8" aria-label="Pesan kontak masuk">
      {messages.map((message) => (
        <article
          key={message.id}
          className="rounded-xl border border-outline/20 bg-surface-container p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-on-surface">{message.name}</h4>
              <p className="mt-1 text-xs text-on-surface/50">
                {message.email || "Email tidak dicantumkan"} · {message.category}
              </p>
            </div>
            <time className="text-xs text-on-surface/40" dateTime={message.createdAt}>
              {dateFormatter.format(new Date(message.createdAt))}
            </time>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm text-on-surface/75">
            {message.message}
          </p>
        </article>
      ))}
    </section>
  );
}
