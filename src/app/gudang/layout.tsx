import { SidebarProvider } from "@/frontend/(gudang)/components/layout/SidebarProvider";
import Sidebar from "@/frontend/(gudang)/components/layout/Sidebar";
import GudangShell from "@/frontend/(gudang)/components/layout/GudangShell";

export const metadata = {
  title: "Gudang Inventaris | ALUPBESK",
};

export default function GudangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="manager-dark flex min-h-screen bg-primary-container">
        <Sidebar />
        <GudangShell>{children}</GudangShell>
      </div>
    </SidebarProvider>
  );
}
