// Semua class Tailwind untuk fitur Jasa Custom.

export const customStyles = {
  page:
    "min-h-screen bg-primary",

  topbar:
    "sticky top-0 z-50 bg-primary-container border-b border-white/10 shadow-lg",

  topbarInner:
    "max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4",

  content:
    "max-w-5xl mx-auto px-4 md:px-8 py-12",

  grid:
    "grid lg:grid-cols-3 gap-8 items-start",

  main:
    "lg:col-span-2 space-y-6",

  services:
    "grid sm:grid-cols-2 gap-3 mb-2",

  service:
    "text-left p-4 rounded-xl border transition-all",

  form:
    "bg-primary-container rounded-2xl border border-white/10 p-6 space-y-4",

  field:
    "w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all",

  label:
    "text-[12px] font-semibold text-white/70",

  sidebar:
    "space-y-4",

  panel:
    "bg-primary-container rounded-2xl border border-white/10 p-6",

  button:
    "w-full mt-6 py-4 rounded-xl bg-secondary text-primary font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-[14px]",

  success:
    "flex flex-col items-center justify-center py-24 text-center",
} as const;