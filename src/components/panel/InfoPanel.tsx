"use client";

import { useState, useEffect, useRef } from "react";
import { X, Globe2, Newspaper, TrendingUp, Swords, ChevronRight } from "lucide-react";
import { CountryCentroid } from "@/lib/countries-geo";
import { TabId, CountryInfo } from "@/lib/types";
import { conflictsDatabase } from "@/lib/conflicts-data";
import GeneralTab from "./tabs/GeneralTab";
import NewsTab from "./tabs/NewsTab";
import EconomyTab from "./tabs/EconomyTab";
import ConflictsTab from "./tabs/ConflictsTab";

interface InfoPanelProps {
  country: CountryCentroid;
  onClose: () => void;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "general",   label: "Overview",  icon: <Globe2 size={14} /> },
  { id: "news",      label: "News",      icon: <Newspaper size={14} /> },
  { id: "economy",   label: "Economy",   icon: <TrendingUp size={14} /> },
  { id: "conflicts", label: "Conflicts", icon: <Swords size={14} /> },
];

export default function InfoPanel({ country, onClose }: InfoPanelProps) {
  const [activeTab, setActiveTab]       = useState<TabId>("general");
  const [countryInfo, setCountryInfo]   = useState<CountryInfo | null>(null);
  const [loadingInfo, setLoadingInfo]   = useState(true);
  const tabRefs                         = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  /* ── Fetch country facts ── */
  useEffect(() => {
    setLoadingInfo(true);
    setCountryInfo(null);
    setActiveTab("general");

    fetch(`https://restcountries.com/v3.1/alpha/${country.code}`)
      .then(r => r.json())
      .then(data => {
        const c = data[0];
        if (!c) return;
        const currencies = c.currencies
          ? Object.values(c.currencies as Record<string, { name: string; symbol: string }>)
              .map(cur => ({ name: cur.name, symbol: cur.symbol }))
          : [];
        const languages = c.languages
          ? Object.values(c.languages as Record<string, string>)
          : [];
        setCountryInfo({
          name: c.name?.common || country.name,
          code: country.code,
          capital: c.capital?.[0] || "N/A",
          region: c.region || "N/A",
          subregion: c.subregion || "N/A",
          population: c.population || 0,
          area: c.area || 0,
          flag: c.flag || "",
          flagUrl: `https://flagcdn.com/w160/${country.code.toLowerCase()}.png`,
          currencies,
          languages,
          lat: country.lat,
          lng: country.lng,
        });
      })
      .catch(() =>
        setCountryInfo({
          name: country.name,
          code: country.code,
          capital: "N/A",
          region: "N/A",
          subregion: "N/A",
          population: 0,
          area: 0,
          flag: "",
          flagUrl: "",
          currencies: [],
          languages: [],
          lat: country.lat,
          lng: country.lng,
        })
      )
      .finally(() => setLoadingInfo(false));
  }, [country]);

  /* ── Sliding tab indicator ── */
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);

  const hasConflicts = (conflictsDatabase[country.code]?.length ?? 0) > 0;

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className="overlay-enter fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
        onClick={onClose}
      />

      <aside className="panel-enter fixed right-0 top-0 h-full w-full sm:w-[440px] z-50 flex flex-col">

        {/* ── Gradient hero header ── */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ minHeight: 120 }}>
          {/* BG gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-elevated) 60%, var(--color-bg-card) 100%)",
            }}
          />
          {/* Accent glow top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }}
          />
          {/* Flag blurred backdrop */}
          {countryInfo?.flagUrl && (
            <img
              src={countryInfo.flagUrl}
              alt=""
              className="absolute right-0 top-0 h-full w-32 object-cover opacity-[0.06] blur-sm"
              draggable={false}
            />
          )}

          {/* Content */}
          <div className="relative px-5 pt-5 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Flag + emoji */}
              <div className="relative flex-shrink-0">
                {countryInfo?.flagUrl ? (
                  <img
                    src={countryInfo.flagUrl}
                    alt={`${countryInfo.name} flag`}
                    className="w-14 h-10 rounded-md object-cover shadow-lg border border-border"
                  />
                ) : (
                  <div className="w-14 h-10 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-2xl">
                    {countryInfo?.flag || "🌍"}
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div>
                <h2 className="text-lg font-bold text-text-primary leading-tight">
                  {loadingInfo ? (
                    <span className="skeleton inline-block w-32 h-5 rounded" />
                  ) : (
                    countryInfo?.name || country.name
                  )}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {loadingInfo ? (
                    <span className="skeleton inline-block w-24 h-3.5 rounded" />
                  ) : (
                    <>
                      <span className="text-xs text-text-muted">{countryInfo?.capital}</span>
                      {countryInfo?.region && (
                        <>
                          <ChevronRight size={10} className="text-text-muted/40" />
                          <span className="text-xs text-text-muted">{countryInfo.region}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 glass rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Tabs (pill style) ── */}
        <div className="relative px-4 py-2 border-b border-border-subtle bg-bg-card flex-shrink-0">
          <div className="flex gap-1 relative">
            {/* Background indicator pill */}
            <div
              className="tab-indicator absolute top-0.5 bottom-0.5 bg-bg-elevated rounded-lg"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
            {tabs.map(tab => (
              <button
                key={tab.id}
                ref={el => { tabRefs.current[tab.id] = el; }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors z-10 ${
                  activeTab === tab.id
                    ? "text-accent-amber"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "conflicts" && hasConflicts && (
                  <span className="ml-0.5 w-2 h-2 rounded-full bg-accent-red flex items-center justify-center pulse-dot" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ background: "linear-gradient(180deg, var(--color-bg-card) 0%, var(--color-bg-primary) 100%)" }}
        >
          {activeTab === "general"   && <GeneralTab   info={countryInfo}  loading={loadingInfo} />}
          {activeTab === "news"      && <NewsTab       articles={[]}       loading={false}        countryName={country.name} />}
          {activeTab === "economy"   && <EconomyTab    countryCode={country.code} countryName={country.name} />}
          {activeTab === "conflicts" && <ConflictsTab  countryCode={country.code} countryName={country.name} />}
        </div>

        {/* ── Bottom edge accent ── */}
        <div
          className="flex-shrink-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)" }}
        />
      </aside>
    </>
  );
}
