export default function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-6 text-[12px] font-bold uppercase tracking-widest">
        {title}
      </h4>
      <ul className="space-y-4 text-label-sm text-on-surface-variant">
        {links.map(({ label, href }) => (
          <li key={`${label}-${href}`}>
            <a
              className="transition-colors hover:text-secondary"
              href={href}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
