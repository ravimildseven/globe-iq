"use client";

import { useState, useEffect, useRef } from "react";
import { X, Globe2, Newspaper, TrendingUp, Swords } from "lucide-react";
import { CountryCentroid } from "@/lib/countries-geo";
import { TabId, CountryInfo, NewsArticle, EconomyData, ConflictData } from "@/lib/types";
import { conflictsDatabase } from "@/lib/conflicts-data";
import { economyDatabase } from "@/lib/economy-data";
import GeneralTab from "./tabs/GeneralTab";
import NewsTab from "./tabs/NewsTab";
import EconomyTab from "./tabs/EconomyTab";
import ConflictsTab from "./tabs/ConflictsTab";

interface InfoPanelProps {
  country: CountryCentroid;
  onClose: () => void;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Globe2 size={16} /> },
  { id: "news", label: "News", icon: <Newspaper size={16} /> },
  { id: "economy", label: "Economy", icon: <TrendingUp size={16} /> },
  { id: "conflicts", label: "Conflicts", icon: <Swords size={16} /> },
];

export default function InfoPanel({ country, onClose }: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingNews, setLoadingNews] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Fetch country info from REST Countries API
  useEffect(() => {
    setLoadingInfo(true);
    setCountryInfo(null);
    setActiveTab("general");

    fetch(`https://restcountries.com/v3.1/alpha/${country.code}`)
      .then((res) => res.json())
      .then((data) => {
        const c = data[0];
        if (!c) return;

        const currencies = c.currencies
          ? Object.values(c.currencies as Record<string, { name: string; symbol: string }>).map((cur) => ({
              name: cur.name,
              symbol: cur.symbol,
            }))
          : [];

        const languages = c.languages ? Object.values(c.languages as Record<string, string>) : [];

        setCountryInfo({
          name: c.name?.common || country.name,
          code: country.code,
          capital: c.capital?.[0] || "N/A",
          region: c.region || "N/A",
          subregion: c.subregion || "N/A",
          population: c.population || 0,
          area: c.area || 0,
          flag: c.flag || "",
          currencies,
          languages,
          lat: country.lat,
          lng: country.lng,
        });
      })
      .catch(() => {
        setCountryInfo({
          name: country.name,
          code: country.code,
          capital: "N/A",
          region: "N/A",
          subregion: "N/A",
          population: 0,
          area: 0,
          flag: "",
          currencies: [],
          languages: [],
          lat: country.lat,
          lng: country.lng,
        });
      })
      .finally(() => setLoadingInfo(false));
  }, [country]);

  // Fetch news when tab changes
  useEffect(() => {
    if (activeTab !== "news") return;
    setLoadingNews(true);
    fetch(`/api/news?country=${encodeURIComponent(country.name)}`)
      .then((res) => res.json())
      .then((data) => setNews(data.articles || []))
      .catch(() => setNews([]))
      .finally(() => setLoadingNews(false));
  }, [activeTab, country.name]);

  // Update tab indicator position
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab]);

  const economy: EconomyData | null = economyDatabase[country.code] || null;
  const conflicts: ConflictData[] = conflictsDatabase[country.code] || [];

  return (
    <div className="panel-enter fixed right-0 top-0 h-full w-full sm:w-[440px] bg-bg-primary/95 backdrop-blur-xl border-l border-border-subtle z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{countryInfo?.flag || "🌍"}</span>
          <div>
            <h2 className="text-xl font-semibold font-[var(--font-heading)] text-text-primary">
              {countryInfo?.name || country.name}
            </h2>
            <p className="text-sm text-text-muted">
              {countryInfo?.capital !== "N/A" ? countryInfo?.capital : ""}{" "}
              {countryInfo?.region ? `· ${countryInfo.region}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="relative px-5 border-b border-border-subtle">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm transition-colors relative ${
                activeTab === tab.id
                  ? "text-accent-blue"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "conflicts" && conflicts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-accent-red/20 text-accent-red">
                  {conflicts.length}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Animated indicator */}
        <div
          className="tab-indicator absolute bottom-0 h-0.5 bg-accent-blue rounded-full"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "general" && (
          <GeneralTab info={countryInfo} loading={loadingInfo} />
        )}
        {activeTab === "news" && (
          <NewsTab articles={news} loading={loadingNews} countryName={country.name} />
        )}
        {activeTab === "economy" && (
          <EconomyTab data={economy} countryName={country.name} />
        )}
        {activeTab === "conflicts" && (
          <ConflictsTab conflicts={conflicts} countryName={country.name} />
        )}
      </div>
    </div>
  );
}
