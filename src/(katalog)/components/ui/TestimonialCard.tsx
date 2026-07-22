export default function TestimonialCard({
  metric,
  title,
  quote,
  name,
  role,
}: {
  metric: string;
  title: string;
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <article className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl transition-all duration-300">
      <span className="material-symbols-outlined absolute top-6 right-6 text-7xl text-secondary opacity-20 pointer-events-none">
        format_quote
      </span>

      <div className="text-headline-h1 text-secondary font-bold mb-4">
        {metric}
      </div>
      <p className="text-headline-h3 text-white mb-6">{title}</p>

      <p className="text-body-md text-white/70 mb-8 italic">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-white/10" />
        <div>
          <div className="font-bold text-white">{name}</div>
          <div className="text-label-sm text-white/50">{role}</div>
        </div>
      </div>
    </article>
  );
}
