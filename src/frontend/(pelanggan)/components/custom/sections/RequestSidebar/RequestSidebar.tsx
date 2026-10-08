import { useCallback } from "react";
import { contentApi } from "@/services/api/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { customStyles as styles } from "../../style/style";

interface CustomSidebarContent {
  steps: string[];
  capacities: { label: string; value: string }[];
}

export default function RequestSidebar({
  isValid,
  onSubmit,
}: {
  isValid: boolean;
  onSubmit: () => void;
}) {
  const loadContent = useCallback(async (): Promise<CustomSidebarContent> => {
    const [stepsContent, capacityContent] = await Promise.all([
      contentApi.getSiteContent("custom_steps"),
      contentApi.getSiteContent("custom_capacities"),
    ]);

    const steps = stepsContent.value.steps;
    const capacities = capacityContent.value.capacities;

    return {
      steps: Array.isArray(steps) ? steps.filter((step): step is string => typeof step === "string") : [],
      capacities: Array.isArray(capacities)
        ? capacities.filter((item): item is { label: string; value: string } =>
            typeof item === "object" &&
            item !== null &&
            "label" in item &&
            "value" in item &&
            typeof item.label === "string" &&
            typeof item.value === "string",
          )
        : [],
    };
  }, []);
  const { data: content, loading, error } = usePollingResource<CustomSidebarContent>(
    loadContent,
    { steps: [], capacities: [] },
  );

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
          <div
            key={step}
            className="flex gap-3 mb-4"
          >
            <span className="size-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold grid place-items-center">
              {index + 1}
            </span>

            <div>
              <p className="text-[12px] font-bold text-on-surface">
                {step}
              </p>

              <p className="text-[11px] text-on-surface/40">
                Tim kami mendampingi kebutuhan Anda.
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={onSubmit}
          disabled={!isValid}
          className={styles.button}
        >
          <span className="material-symbols-outlined">
            send
          </span>

          Kirim Request via WA
        </button>
      </section>

      <section className={styles.panel}>
        <p className="text-[11px] font-bold text-on-surface/40 uppercase tracking-widest mb-3">
          Kapasitas Produksi
        </p>

        {content.capacities.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between text-[12px] mb-2"
          >
            <span className="text-on-surface/40">
              {label}
            </span>

            <span className="text-on-surface/80">
              {value}
            </span>
          </div>
        ))}
      </section>
    </aside>
  );
}
