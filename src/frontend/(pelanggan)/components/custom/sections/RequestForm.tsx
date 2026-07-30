import { customStyles as styles } from "../style";
import type { CustomRequestForm } from "@/frontend/(pelanggan)/types";

export default function RequestForm({
  form,
  setForm,
}: {
  form: CustomRequestForm;
  setForm: (form: CustomRequestForm) => void;
}) {
  const update = (
    key: keyof CustomRequestForm,
    value: string
  ) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  return (
    <section className={styles.form}>
      <h2 className="text-[13px] font-semibold text-on-surface/70">
        Data Pemesan
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {(
          [
            ["nama", "Nama Lengkap *", "John Doe"],
            ["perusahaan", "Nama Perusahaan", "PT Contoh Indonesia"],
            ["email", "Email", "john@perusahaan.com"],
            ["telp", "No. WhatsApp *", "+62 812 3456 7890"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <label
            key={key}
            className="space-y-1.5 block"
          >
            <span className={styles.label}>
              {label}
            </span>

            <input
              type={key === "email" ? "email" : "text"}
              className={styles.field}
              placeholder={placeholder}
              value={form[key]}
              onChange={(event) =>
                update(key, event.target.value)
              }
            />
          </label>
        ))}
      </div>

      <h2 className="text-[13px] font-semibold text-on-surface/70 pt-2">
        Detail Kebutuhan
      </h2>

      <label className="space-y-1.5 block">
        <span className={styles.label}>
          Deskripsi Kebutuhan *
        </span>

        <textarea
          className={`${styles.field} resize-none`}
          rows={4}
          placeholder="Jelaskan kebutuhan Anda secara detail..."
          value={form.deskripsi}
          onChange={(event) =>
            update("deskripsi", event.target.value)
          }
        />
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        {(
          [
            ["dimensi", "Dimensi / Ukuran", "500x500x1000mm"],
            ["kuantitas", "Kuantitas", "10 unit"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <label
            key={key}
            className="space-y-1.5 block"
          >
            <span className={styles.label}>
              {label}
            </span>

            <input
              className={styles.field}
              placeholder={placeholder}
              value={form[key]}
              onChange={(event) =>
                update(key, event.target.value)
              }
            />
          </label>
        ))}

        <label className="space-y-1.5 block">
          <span className={styles.label}>
            Target Deadline
          </span>

          <input
            type="date"
            className={styles.field}
            value={form.deadline}
            onChange={(event) =>
              update("deadline", event.target.value)
            }
          />
        </label>
      </div>
    </section>
  );
}
