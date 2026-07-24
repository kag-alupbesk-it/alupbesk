import { customStyles as styles } from "./style";
import type { CustomRequestForm } from "./types";

const services = [
  {
    icon: "straighten",
    title: "Potong Custom",
    desc: "Pemotongan presisi sesuai dimensi yang Anda tentukan.",
  },
  {
    icon: "design_services",
    title: "Desain Rangka",
    desc: "Konsultasi dan desain rangka aluminium.",
  },
  {
    icon: "format_paint",
    title: "Finishing Custom",
    desc: "Anodizing, powder coating, atau mill finish.",
  },
  {
    icon: "precision_manufacturing",
    title: "Fabrikasi Lengkap",
    desc: "Dari desain hingga produk jadi siap pasang.",
  },
];

// Function untuk memilih jenis layanan custom.
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