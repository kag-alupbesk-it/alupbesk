import Sidebar from "./_components/Sidebar";
import { SidebarProvider } from "./_components/SidebarProvider";
import GudangShell from "./_components/GudangShell";

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