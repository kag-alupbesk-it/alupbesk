import Sidebar from "@/(owner)/components/Sidebar";

export const metadata = {
  title: "Owner Dashboard | ALUPBESK",
};

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="owner-dark flex min-h-screen bg-primary">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
