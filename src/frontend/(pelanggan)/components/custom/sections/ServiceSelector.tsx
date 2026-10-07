import { useCallback } from "react";
import { customStyles as styles } from "../style";
import { contentApi } from "@/services/api";
import type { CustomService } from "@/backend/modules/content";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import type { CustomRequestForm } from "@/frontend/(pelanggan)/types";

export default function ServiceSelector({
  form,
  setForm,
}: {
  form: CustomRequestForm;
  setForm: (form: CustomRequestForm) => void;
}) {
  const loadServices = useCallback(() => contentApi.getServices(), []);
  const { data: services, loading, error } = usePollingResource<CustomService[]>(loadServices, []);

  return (
    <div className={styles.services}>
      {loading && services.length === 0 ? (
        <p className="col-span-full text-sm text-on-surface/50">Memuat layanan...</p>
      ) : error && services.length === 0 ? (
        <p className="col-span-full text-sm text-on-surface/50">Pilihan layanan belum tersedia.</p>
      ) : services.filter((service) => service.active).map((service) => (
        <button
          key={service.title}
          type="button"
          onClick={() =>
            setForm({
              ...form,
              layanan: service.title,
            })
          }
          className={`${styles.service} ${
            form.layanan === service.title
              ? "border-secondary bg-secondary/10"
              : "border-outline/20 bg-primary-container hover:border-outline"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] mb-2 block ${
              form.layanan === service.title
                ? "text-secondary"
                : "text-on-surface/40"
            }`}
          >
            {service.icon}
          </span>

          <p className="text-[13px] font-bold text-on-surface mb-1">
            {service.title}
          </p>

          <p className="text-[11px] text-on-surface/40">
            {service.description}
          </p>
        </button>
      ))}
    </div>
  );
}
