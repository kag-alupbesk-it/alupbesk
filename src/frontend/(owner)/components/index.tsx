"use client";

import { Sidebar } from "./layout/index";
import { OverviewSection } from "./dashboard/index";

export default function Components() {
  return (
    <div className="flex min-h-screen bg-primary">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <main className="flex-1">
          <OverviewSection />
        </main>
      </div>
    </div>
  );
}
