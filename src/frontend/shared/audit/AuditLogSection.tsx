"use client";

import { useEffect, useState, useCallback } from "react";
import type { AuditLog } from "@/backend/modules/audit/auditStore";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import type { MessageKey } from "@/frontend/shared/i18n/translations";

const roleLabelKeys: Record<string, MessageKey> = {
  pelanggan: "roleCustomer",
  marketing: "roleMarketing",
  gudang: "roleWarehouse",
  keuangan: "roleFinance",
  proyek: "roleProject",
  field: "roleField",
  produksi: "roleProduction",
  manager: "roleManager",
  owner: "roleOwner",
  drafter: "roleDrafter",
};

const actionLabelKeys: Record<string, MessageKey> = {
  CREATE: "auditCreate",
  EDIT: "auditEdit",
  UPLOAD: "auditUpload",
  DELETE: "auditDelete",
};

export default function AuditLogSection({
  apiEndpoint,
  descriptionKey = "auditLogDescription",
}: {
  apiEndpoint: string;
  descriptionKey?: MessageKey;
}) {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(apiEndpoint);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      } else {
        setError(json.error?.message ?? t("auditLoadFailed"));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auditLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t("activityHistory")}</h1>
          <p className="text-sm text-on-surface/60 mt-1">{t(descriptionKey)}</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            void fetchLogs();
          }}
          className="px-4 py-2 bg-secondary text-primary font-bold rounded-xl text-xs hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          {t("auditRefresh")}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="rounded-2xl border border-outline/20 bg-surface-container overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container-high border-b border-outline/20 text-xs font-bold uppercase tracking-wider text-on-surface/70">
              <tr>
                <th className="px-6 py-4">{t("auditTime")}</th>
                <th className="px-6 py-4">{t("auditUser")}</th>
                <th className="px-6 py-4">{t("managerRole")}</th>
                <th className="px-6 py-4">{t("auditAction")}</th>
                <th className="px-6 py-4">{t("auditTarget")}</th>
                <th className="px-6 py-4">{t("auditDetails")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface/50">
                    {t("auditLoading")}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface/50">
                    {t("auditNoEntries")}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-on-surface/70 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString(language === "en" ? "en-US" : "id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{log.userName}</div>
                      <div className="text-xs text-on-surface/50">{log.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-secondary/10 text-secondary">
                        {roleLabelKeys[log.role.toLowerCase()]
                          ? t(roleLabelKeys[log.role.toLowerCase()])
                          : log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          log.action === "CREATE"
                            ? "bg-green-500/10 text-green-400"
                            : log.action === "EDIT"
                            ? "bg-blue-500/10 text-blue-400"
                            : log.action === "UPLOAD"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {actionLabelKeys[log.action] ? t(actionLabelKeys[log.action]) : log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{log.target}</td>
                    <td className="px-6 py-4 text-on-surface/70">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
