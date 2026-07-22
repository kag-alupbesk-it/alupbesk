export default function ContactDetail({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="material-symbols-outlined text-secondary">
        {icon}
      </span>
      <div>
        <div className="font-bold mb-1">{title}</div>
        <p className="text-label-sm text-primary-fixed-dim">{text}</p>
      </div>
    </div>
  );
}
