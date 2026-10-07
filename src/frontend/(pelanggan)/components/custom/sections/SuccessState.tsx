import Link from "next/link";
import { customStyles as styles } from "../style";

export default function SuccessState({
  onReset,
  whatsappHref,
}: {
  onReset: () => void;
  whatsappHref: string | null;
}) {
  return (
    <section className={styles.success}>
      <span className="material-symbols-outlined text-[56px] text-emerald-400 mb-5">
        check_circle
      </span>

      <h2 className="text-[24px] font-bold text-on-surface mb-3">
        Permintaan Tersimpan!
      </h2>

      <p className="text-on-surface/50 text-sm max-w-md">
        Permintaan tersimpan. Anda dapat melanjutkan percakapan dengan tim kami melalui WhatsApp.
      </p>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onReset}
          className="px-6 py-3 border border-outline/30 text-on-surface rounded-xl"
        >
          Request Lagi
        </button>

        <Link
          href="/catalog"
          className="px-6 py-3 bg-secondary text-primary rounded-xl font-bold"
        >
          Kembali ke Beranda
        </Link>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-secondary text-primary rounded-xl font-bold"
          >
            Chat via WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}
