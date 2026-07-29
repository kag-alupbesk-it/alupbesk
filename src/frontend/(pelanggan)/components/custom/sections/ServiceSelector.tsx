import { customStyles as styles } from "../style";
import { services } from "./data";
import type { CustomRequestForm } from "@/frontend/(pelanggan)/types";

export default function ServiceSelector({
  form,
  setForm,
}: {
  form: CustomRequestForm;
  setForm: (form: CustomRequestForm) => void;
}) {
  return (
    <div className={styles.services}>
      {services.map((service) => (
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
              : "border-white/10 bg-primary-container hover:border-white/25"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] mb-2 block ${
              form.layanan === service.title
                ? "text-secondary"
                : "text-white/40"
            }`}
          >
            {service.icon}
          </span>

          <p className="text-[13px] font-bold text-white mb-1">
            {service.title}
          </p>

          <p className="text-[11px] text-white/40">
            {service.desc}
          </p>
        </button>
      ))}
    </div>
  );
}
