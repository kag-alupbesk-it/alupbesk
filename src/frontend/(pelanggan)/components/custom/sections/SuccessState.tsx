import Link from "next/link";
import { customStyles as styles } from "../style";

export default function SuccessState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <section className={styles.success}>
      <span className="material-symbols-outlined text-[56px] text-emerald-400 mb-5">
        check_circle
      </span>

      <h2 className="text-[24px] font-bold text-on-surface mb-3">
        Permintaan Terkirim!
      </h2>

      <p className="text-on-surface/50 text-sm max-w-md">
        Tim kami akan menghubungi Anda melalui WhatsApp dalam 1x24 jam kerja.
      </p>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onReset}
          className="px-6 py-3 border border-outline/30 text-on-surface rounded-xl"
        >
          Request Lagi
        </button>

        <Link
          href="/"
          className="px-6 py-3 bg-secondary text-primary rounded-xl font-bold"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </section>
  );
}
