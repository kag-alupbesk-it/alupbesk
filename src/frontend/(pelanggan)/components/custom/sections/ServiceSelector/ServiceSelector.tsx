import { customStyles as styles } from "../../style/style";
import { services } from "../data/data";
import type { CustomRequestForm } from "@/frontend/(pelanggan)/types/types";

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
            {service.desc}
          </p>
        </button>
      ))}
    </div>
  );
}
