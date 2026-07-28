import Sidebar from "./_components/Sidebar";
import { SidebarProvider } from "./_components/SidebarProvider";
import ManagerShell from "./_components/ManagerShell";

export const metadata = {
  title: "Manager Dashboard | ALUPBESK",
};

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="manager-dark flex min-h-screen bg-primary-container">
        <Sidebar />
        <ManagerShell>{children}</ManagerShell>
      </div>
    </SidebarProvider>
  );
}
