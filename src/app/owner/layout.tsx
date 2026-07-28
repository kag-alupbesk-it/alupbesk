import Sidebar from "@/(owner)/components/Sidebar";
import { SidebarProvider } from "@/(owner)/components/SidebarProvider";
import OwnerShell from "@/(owner)/components/OwnerShell";

export const metadata = {
  title: "Owner Dashboard | ALUPBESK",
};

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="owner-dark flex min-h-screen bg-primary-container">
        <Sidebar />
        <OwnerShell>{children}</OwnerShell>
      </div>
    </SidebarProvider>
  );
}
