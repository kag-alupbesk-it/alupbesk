"use client";

import { useState } from "react";
import { Sidebar } from "./layout";
import {
  DashboardSection,
  FinancialsSection,
  UsersSection,
  InventorySection,
  ReportsSection,
} from "./sections";

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
