export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-slate-100">{children}</div>;
}
