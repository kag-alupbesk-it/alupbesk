"use client";

import { useState } from "react";
import * as s from "../../style/style";
import PartnersTab from "../PartnersTab/PartnersTab";
import FaqTab from "../FaqTab/FaqTab";
import ServicesTab from "../ServicesTab/ServicesTab";
import SiteContentTab from "../SiteContentTab/SiteContentTab";
import PortfolioTab from "../PortfolioTab/PortfolioTab";

type TabKey = "partners" | "faq" | "services" | "site" | "portfolio";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "partners", label: "Mitra", icon: "handshake" },
  { key: "faq", label: "FAQ", icon: "question_answer" },
  { key: "services", label: "Layanan", icon: "build" },
  { key: "site", label: "Konten Statis", icon: "edit_note" },
  { key: "portfolio", label: "Portofolio", icon: "folder_special" },
];

export default function KontenSection() {
  const [tab, setTab] = useState<TabKey>("partners");

  return (
    <div>
      <div className="px-10 pt-10">
        <h3 className={s.title}>Kelola Konten Website</h3>
        <p className={s.subtitle}>Kelola mitra, FAQ, layanan custom, konten statis, dan portofolio untuk halaman depan publik.</p>
        <nav className={`${s.tabs} mt-6`}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`${s.tabButton} ${tab === t.key ? s.tabActive : s.tabInactive}`}
            >
              <span className={`${s.icon} text-[16px] align-middle mr-1`}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      {tab === "partners" && <PartnersTab />}
      {tab === "faq" && <FaqTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "site" && <SiteContentTab />}
      {tab === "portfolio" && <PortfolioTab />}
    </div>
  );
}
