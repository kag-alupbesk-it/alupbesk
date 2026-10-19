import { useCallback } from "react";
import { contentApi } from "@/services/api/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { customStyles as styles } from "../../style/style";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

interface CustomSidebarContent {
  steps: string[];
}

export default function RequestSidebar({
  isValid,
  onSubmit,
  checking,
  itemsCount,
  hasName,
  hasPhone,
  hasService,
  hasDescription,
  hasDeadline,
}: {
  isValid: boolean;
  onSubmit: () => void;
  checking: boolean;
  itemsCount: number;
  hasName: boolean;
  hasPhone: boolean;
  hasService: boolean;
  hasDescription: boolean;
  hasDeadline: boolean;
}) {
  const { language } = useLanguage();
  const loadContent = useCallback(async (): Promise<CustomSidebarContent> => {
    const stepsContent = await contentApi.getSiteContent("custom_steps");

    const stepsValue = stepsContent.value.id && typeof stepsContent.value.id === "object"
      ? (stepsContent.value[language] as typeof stepsContent.value | undefined) ?? stepsContent.value.id as typeof stepsContent.value
      : stepsContent.value;
    const steps = stepsValue.steps;

    return {
      steps: Array.isArray(steps) ? steps.filter((step): step is string => typeof step === "string") : [],
    };
  }, [language]);
  const { data: content, loading, error } = usePollingResource<CustomSidebarContent>(
    loadContent,
    { steps: [] },
  );

  const checklist: [boolean, string][] = [
    [hasService, "Pilih jenis layanan"],
    [hasName, "Nama lengkap terisi"],
    [hasPhone, "Nomor WhatsApp terisi"],
    [itemsCount > 0, "Minimal satu item spesifikasi"],
    [hasDeadline, "Target deadline ditentukan"],
    [hasDescription, "Deskripsi kebutuhan lengkap"],
  ];

  return (
    <aside className={styles.sidebar}>
      <section className={styles.panel}>
        <h2 className="text-[13px] font-semibold text-on-surface/70 mb-4">
          Alur Request Custom
        </h2>

        {loading && content.steps.length === 0 ? (
          <p className="mb-4 text-xs text-on-surface/50">Memuat alur layanan...</p>
        ) : error && content.steps.length === 0 ? (
          <p className="mb-4 text-xs text-on-surface/50">Alur layanan belum tersedia.</p>
        ) : content.steps.map((step, index) => (
          <div key={step} className="flex gap-3 mb-4">
            <span className="size-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold grid place-items-center">
              {index + 1}
            </span>
            <div>
              <p className="text-[12px] font-bold text-on-surface">{step}</p>
              <p className="text-[11px] text-on-surface/40">Tim kami mendampingi kebutuhan Anda.</p>
            </div>
          </div>
        ))}

        <div className="border-t border-outline/15 pt-4 mt-2">
          <h3 className="text-[11px] font-bold text-on-surface/70 mb-3">Checklist sebelum kirim</h3>
          <div className="space-y-2.5">
            {checklist.map(([ready, label]) => (
              <div key={label} className="flex items-center gap-2.5 text-[11px]">
                <span className={`size-4 rounded-full grid place-items-center ${ready ? "bg-emerald-400/15 text-emerald-300" : "bg-surface-container text-on-surface/40"}`}>
                  {ready ? (
                    <span className="material-symbols-outlined !text-[11px]">check</span>
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className={ready ? "text-on-surface/70" : "text-on-surface/40"}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={!isValid || checking}
          className={styles.button}
        >
          <span className="material-symbols-outlined">
            send
          </span>

          {checking ? "Mengirim..." : "Kirim Request via WA"}
        </button>
      </section>
    </aside>
  );
}
