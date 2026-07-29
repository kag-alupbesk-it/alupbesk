import { customStyles as styles } from "../style";
import { steps, productionCapacities } from "./data";

export default function RequestSidebar({
  isValid,
  onSubmit,
}: {
  isValid: boolean;
  onSubmit: () => void;
}) {
  return (
    <aside className={styles.sidebar}>
      <section className={styles.panel}>
        <h2 className="text-[13px] font-semibold text-white/70 mb-4">
          Alur Request Custom
        </h2>

        {steps.map((step, index) => (
          <div
            key={step}
            className="flex gap-3 mb-4"
          >
            <span className="size-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold grid place-items-center">
              {index + 1}
            </span>

            <div>
              <p className="text-[12px] font-bold text-white">
                {step}
              </p>

              <p className="text-[11px] text-white/40">
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
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">
          Kapasitas Produksi
        </p>

        {productionCapacities.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between text-[12px] mb-2"
          >
            <span className="text-white/40">
              {label}
            </span>

            <span className="text-white/80">
              {value}
            </span>
          </div>
        ))}
      </section>
    </aside>
  );
}
