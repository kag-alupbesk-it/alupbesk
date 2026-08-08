"use client";

import { Sidebar } from "./layout";
import { KasSection } from "./kas";

export default function Components() {
  return (
    <div className="flex min-h-screen bg-primary">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <main className="flex-1">
          <KasSection />
        </main>
      </div>
    </div>
  );
}
