export const portfolioStyles = {
  page: "min-h-screen bg-primary",

  content: "max-w-6xl mx-auto px-4 md:px-8 py-12 pt-28",

  header: "text-center mb-16",

  eyebrow: "text-secondary text-[11px] font-bold uppercase tracking-widest",

  heroTitle:
    "text-[36px] md:text-[48px] font-bold text-white mt-3 leading-tight",

  description:
    "text-white/50 text-[15px] mt-4 max-w-xl mx-auto",

  grid:
    "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20",

  card:
    "group bg-primary-container rounded-2xl border border-white/10 overflow-hidden hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",

  image:
    "relative aspect-video overflow-hidden",

  imageBackground:
    "w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500",

  overlay:
    "absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent",

  badges:
    "absolute top-3 left-3 flex gap-2 flex-wrap",

  industry:
    "bg-secondary text-primary text-[10px] font-bold px-2 py-1 rounded-full",

  year:
    "bg-black/50 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1 rounded-full",

  cardContent:
    "p-5",

  client:
    "text-[11px] text-white/40 mb-1",

  title:
    "text-[15px] font-bold text-white mb-3 leading-snug",

  tags:
    "flex flex-wrap gap-1.5 mb-4",

  tag:
    "text-[10px] text-secondary/70 bg-secondary/10 px-2 py-0.5 rounded-full font-medium",

  details:
    "space-y-2.5",

  label:
    "text-[10px] font-bold uppercase tracking-wider mb-1",

  challengeLabel:
    "text-white/30",

  resultLabel:
    "text-secondary/60",

  challenge:
    "text-[12px] text-white/60 leading-relaxed line-clamp-2",

  result:
    "text-[12px] text-white/70 leading-relaxed line-clamp-2",

  section:
    "mb-20",

  sectionHeader:
    "text-center mb-10",

  sectionTitle:
    "text-[28px] font-bold text-white mt-2",

  caseGrid:
    "grid md:grid-cols-2 gap-6",

  caseCard:
    "bg-primary-container rounded-2xl border border-white/10 p-6",

  caseClient:
    "flex items-start gap-4 mb-5",

  logo:
    "w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center flex-shrink-0",

  logoText:
    "text-secondary font-bold text-[14px]",

  clientName:
    "text-[13px] font-bold text-white",

  meta:
    "text-[11px] text-white/40",

  caseTitle:
    "text-[16px] font-bold text-white mb-3",

  caseDescription:
    "text-[13px] text-white/60 leading-relaxed mb-5",

  metrics:
    "grid grid-cols-3 gap-3 pt-4 border-t border-white/10",

  metric:
    "text-center",

  metricValue:
    "text-[20px] font-bold text-secondary",

  metricLabel:
    "text-[10px] text-white/40 leading-tight mt-0.5",

  cta:
    "bg-primary-container rounded-2xl border border-white/10 p-8 md:p-12 text-center",

  ctaTitle:
    "text-[24px] font-bold text-white mb-3",

  ctaButtons:
    "flex flex-col sm:flex-row gap-3 justify-center",

  primary:
    "px-8 py-3.5 bg-secondary text-primary font-bold rounded-xl hover:brightness-110 transition-all text-[14px]",

  secondary:
    "px-8 py-3.5 border border-white/20 text-white font-bold rounded-xl hover:border-white/40 transition-all text-[14px]",
} as const;
