export default function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h4 className="mb-6 text-[12px] font-bold uppercase tracking-widest">
        {title}
      </h4>
      <ul className="space-y-4 text-label-sm text-primary-fixed-dim">
        {links.map((link) => (
          <li key={link}>
            <a
              className="transition-colors hover:text-secondary-fixed-dim"
              href={link === "FAQ" ? "#faq" : "#"}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
