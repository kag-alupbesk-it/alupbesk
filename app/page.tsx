import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Alupbesk
          </span>
          <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            Beta
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Website kami sedang dalam tahap pengembangan.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Kami sedang membangun pengalaman baru untuk{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">
              Company Profile
            </span>
            ,{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">
              Katalog Produk
            </span>
            , dan{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">
              Partner & Kerja Sama
            </span>
            . Terima kasih atas kesabaran Anda.
          </p>

          <ul className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Struktur project & desain sistem — selesai
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Halaman depan (front-end) — dalam pengerjaan
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              Sistem backend & ERP — belum dimulai
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[180px]"
            href="mailto:info@alupbesk.com"
          >
            Hubungi Kami
          </a>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[180px]"
            href="/"
          >
            Muat Ulang
          </Link>
        </div>
      </main>
    </div>
  );
}
