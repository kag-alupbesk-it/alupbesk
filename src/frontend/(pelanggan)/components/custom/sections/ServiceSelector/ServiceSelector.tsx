"use client";

import { useCallback } from "react";
import { Wrench, CheckCircle2 } from "lucide-react";
import { customStyles as styles } from "../../style/style";
import { contentApi } from "@/services/api/index";
import type { CustomService } from "@/backend/modules/content/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import type { CustomRequestForm } from "@/frontend/(pelanggan)/types/types";

const fallbackServices: CustomService[] = [
  { id: "1", icon: "straighten", title: "Potong Custom", description: "Pemotongan presisi sesuai dimensi yang Anda tentukan.", sortOrder: 1, active: true, createdAt: new Date().toISOString() },
  { id: "2", icon: "design_services", title: "Desain Rangka", description: "Konsultasi dan desain rangka aluminium.", sortOrder: 2, active: true, createdAt: new Date().toISOString() },
  { id: "3", icon: "format_paint", title: "Finishing Custom", description: "Anodizing, powder coating, atau mill finish.", sortOrder: 3, active: true, createdAt: new Date().toISOString() },
  { id: "4", icon: "precision_manufacturing", title: "Fabrikasi Lengkap", description: "Dari desain hingga produk jadi siap pasang.", sortOrder: 4, active: true, createdAt: new Date().toISOString() },
];

export default function ServiceSelector({
  form,
  setForm,
}: {
  form: CustomRequestForm;
  setForm: (form: CustomRequestForm) => void;
}) {
  const loadServices = useCallback(() => contentApi.getServices(), []);
  const { data: services } = usePollingResource<CustomService[]>(loadServices, fallbackServices);

  const activeServices = (services.length > 0 ? services : fallbackServices).filter((service) => service.active);
  const selectedService = activeServices.find((s) => s.title === form.layanan);

  return (
    <div className="rounded-2xl border border-outline/20 bg-primary-container p-5 sm:p-6 space-y-5 shadow-sm transition-all hover:border-secondary/30">
      <div className="flex items-start gap-3 border-b border-outline/15 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Wrench size={18} />
        </div>
        <div>
          <h3 className="font-headline text-base font-bold text-on-surface">
            Pilih Layanan <span className="text-secondary">*</span>
          </h3>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            Pilih jenis pengerjaan aluminium atau konsultasi sesuai kebutuhan spesifik proyek Anda.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-semibold text-on-surface/80" htmlFor="custom-service-select">
          Jenis Layanan Utama <span className="text-secondary">*</span>
        </label>
        <div className="relative">
          <select
            id="custom-service-select"
            className={`${styles.field} cursor-pointer font-medium`}
            value={form.layanan}
            onChange={(e) =>
              setForm({
                ...form,
                layanan: e.target.value,
              })
            }
          >
            <option value="" disabled>
              -- Pilih jenis layanan --
            </option>
            {activeServices.map((service) => (
              <option key={service.title} value={service.title}>
                {service.title}
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-secondary/20 bg-secondary/5 p-3.5 text-on-surface animate-fadeIn">
            <CheckCircle2 size={16} className="text-secondary shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-bold text-secondary">{selectedService.title}:</strong>{" "}
              <span className="text-on-surface-variant">{selectedService.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
