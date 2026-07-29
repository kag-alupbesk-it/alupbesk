"use client";

import { Sidebar } from "./layout";
import { DashboardSection } from "./dashboard";
import { FinancialsSection } from "./financials";
import { UsersSection } from "./users";
import { InventorySection } from "./inventory";

export default function Components() {
  return (
    <div className="flex min-h-screen bg-primary">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <main className="flex-1">
          <DashboardSection />
        </main>
      </div>
    </div>
  );
}
