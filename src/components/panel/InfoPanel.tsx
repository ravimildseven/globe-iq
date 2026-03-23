"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Globe2, Newspaper, TrendingUp, Swords, ChevronRight, ChevronDown,
  Users, Building2, Ruler, Languages, Plane,
} from "lucide-react";
import { CountryCentroid } from "@/lib/countries-geo";
import { TabId, CountryInfo } from "@/lib/types";
import { conflictsDatabase } from "@/lib/conflicts-data";
import { MarketData } from "@/lib/marketIndices";
import GeneralTab from "./tabs/GeneralTab";
import TravelTab from "./tabs/TravelTab";
import NewsTab from "./tabs/NewsTab";
import EconomyTab from "./tabs/EconomyTab";
import ConflictsTab from "./tabs/ConflictsTab";
import SummaryStrip from "./SummaryStrip";

interface InfoPanelProps {
  country: CountryCentroid;
  onClose: () => void;
  marketData?: MarketData;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "general",   label: "Overview",  icon: <Globe2     size={14} /> },
  { id: "news",      label: "News",      icon: <Newspaper  size={14} /> },
  { id: "economy",   label: "Economy",   icon: <TrendingUp size={14} /> },
  { id: "conflicts", label: "Conflicts", icon: <Swords     size={14} /> },
  { id: "travel",    label: "Travel",    icon: <Plane      size={14} /> },
];

/* ── Number formatters ── */
function fmtPop(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return n.toString();
}
function fmtArea(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return n.toLocaleString();
}

export default function InfoPanel({ country, onClose, marketData }: InfoPanelProps) {
  const [activeTab, setActiveTab]       = useState<TabId>("general");
  const [countryInfo, setCountryInfo]   = useState<CountryInfo | null>(null);
  const [loadingInfo, setLoadingInfo]   = useState(true);
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const tabRefs                         = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabBarRef                       = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  /* ── Wikipedia: hero image + extract ── */
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroLoaded, setHeroLoaded]     = useState(false);
  const [wikiExtract, setWikiExtract]   = useState("");

  useEffect(() => {
    setHeroImageUrl("");
    setHeroLoaded(false);
    setWikiExtract("");

    const title = encodeURIComponent(country.name.replace(/ /g, "_"));
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const imgUrl = data.thumbnail?.source ?? "";
        if (imgUrl) setHeroImageUrl(imgUrl);
        if (data.extract) setWikiExtract(data.extract);
      })
      .catch(() => {});
  }, [country]);

  /* ── Fetch country facts from REST Countries ── */
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
  const showPhoto    = heroImageUrl && heroLoaded;

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className="overlay-enter fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
        onClick={onClose}
      />

      <aside className="panel-enter fixed right-0 top-0 h-[100dvh] sm:h-full w-full sm:w-[440px] z-50 flex flex-col bg-bg-card">

        {/* Safe-area spacer — iOS status bar pushes content down on mobile */}
        <div className="sm:hidden flex-shrink-0" style={{ height: "env(safe-area-inset-top, 0px)" }} />

        {/* ── Hero section ── */}
        <div
          className="relative overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{ height: heroCollapsed ? 0 : 170 }}
        >

          {/* Base gradient — always rendered */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, var(--color-bg-card) 0%, var(--color-bg-elevated) 60%, var(--color-bg-card) 100%)",
            }}
          />

          {/* Accent top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }}
          />

          {/* Hero photo */}
          {heroImageUrl && (
            <img
              src={heroImageUrl}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${heroLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setHeroLoaded(true)}
              onError={() => setHeroImageUrl("")}
              draggable={false}
            />
          )}

          {/* Photo gradient overlay — ensures bottom text is readable */}
          {showPhoto && (
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)" }}
            />
          )}

          {/* Flag blurred backdrop (only when no photo) */}
          {!showPhoto && countryInfo?.flagUrl && (
            <img
              src={countryInfo.flagUrl}
              alt=""
              className="absolute right-0 top-0 h-full w-32 object-cover opacity-[0.06] blur-sm"
              draggable={false}
            />
          )}

          {/* Close button — always top-right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 z-10 w-11 h-11 glass rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Country info — anchored to bottom of hero */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4 pt-10 flex items-end gap-3">
            {/* Flag */}
            <div className="flex-shrink-0">
              {countryInfo?.flagUrl ? (
                <img
                  src={countryInfo.flagUrl}
                  alt={`${countryInfo.name} flag`}
                  className={`w-14 h-10 rounded-md object-cover shadow-lg ${
                    showPhoto ? "border border-white/25" : "border border-border"
                  }`}
                />
              ) : (
                <div className="w-14 h-10 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-2xl">
                  {countryInfo?.flag || "🌍"}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="min-w-0">
              <h2 className={`text-lg font-bold leading-tight drop-shadow-sm truncate ${showPhoto ? "text-white" : "text-text-primary"}`}>
                {loadingInfo
                  ? <span className="skeleton inline-block w-32 h-5 rounded" />
                  : countryInfo?.name || country.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {loadingInfo
                  ? <span className="skeleton inline-block w-24 h-3.5 rounded" />
                  : (
                    <>
                      <span className={`text-xs ${showPhoto ? "text-white/70" : "text-text-muted"}`}>
                        {countryInfo?.capital}
                      </span>
                      {countryInfo?.region && (
                        <>
                          <ChevronRight size={10} className={showPhoto ? "text-white/35" : "text-text-muted/40"} />
                          <span className={`text-xs ${showPhoto ? "text-white/70" : "text-text-muted"}`}>
                            {countryInfo.region}
                          </span>
                        </>
                      )}
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero collapse toggle ── */}
        <button
          onClick={() => setHeroCollapsed(c => !c)}
          className="flex items-center justify-center gap-1 w-full py-1 text-text-muted/40 hover:text-text-muted/70 transition-colors bg-bg-card border-b border-border/30 flex-shrink-0"
          aria-label={heroCollapsed ? "Expand hero" : "Collapse hero"}
        >
          <ChevronDown
            size={13}
            className={`transition-transform duration-300 ${heroCollapsed ? "rotate-180" : ""}`}
          />
          <span className="text-[9px] uppercase tracking-widest font-medium">
            {heroCollapsed ? "Show photo" : "Hide photo"}
          </span>
        </button>

        {/* ── Quick Facts ribbon ── */}
        {countryInfo && !loadingInfo ? (
          <div className="flex items-stretch border-b border-border-subtle bg-bg-elevated/40 divide-x divide-border-subtle flex-shrink-0">
            {[
              { icon: <Users     size={11} />, label: "Pop.",     value: fmtPop(countryInfo.population) },
              { icon: <Ruler     size={11} />, label: "Area km²", value: fmtArea(countryInfo.area) },
              { icon: <Building2 size={11} />, label: "Capital",  value: countryInfo.capital },
              { icon: <Languages size={11} />, label: "Language", value: countryInfo.languages[0] || "N/A" },
            ].map(item => (
              <div key={item.label} className="flex-1 flex flex-col items-center justify-center py-2 px-1 gap-0.5 min-w-0">
                <span className="text-accent-cyan/70">{item.icon}</span>
                <span className="text-[8px] text-text-muted uppercase tracking-wide leading-none">{item.label}</span>
                <span className="text-[10px] font-semibold text-text-primary truncate w-full text-center px-0.5 leading-tight">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Ribbon skeleton */
          <div className="flex border-b border-border-subtle bg-bg-elevated/40 divide-x divide-border-subtle flex-shrink-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 py-3 flex flex-col items-center gap-1.5">
                <div className="skeleton h-2 w-6 rounded" />
                <div className="skeleton h-3 w-10 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── Summary strip: chips + news headlines ── */}
        <SummaryStrip
          countryInfo={countryInfo}
          countryCode={country.code}
          countryName={country.name}
          marketQuote={marketData?.[country.code]}
        />

        {/* ── Tabs ── */}
        <div
          ref={tabBarRef}
          className="relative px-4 py-2 border-b border-border-subtle bg-bg-card flex-shrink-0 overflow-x-scroll scrollbar-hide"
          onWheel={e => {
            const el = tabBarRef.current;
            if (!el) return;
            // Let native horizontal swipe pass through; map vertical delta to horizontal scroll
            if (e.deltaX !== 0) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          }}
        >
          <div className="flex gap-1 relative flex-nowrap">
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
          {activeTab === "general"   && <GeneralTab   info={countryInfo}  loading={loadingInfo} wikiExtract={wikiExtract} />}
          {activeTab === "news"      && <NewsTab       articles={[]}       loading={false}        countryName={country.name} />}
          {activeTab === "economy"   && <EconomyTab    countryCode={country.code} countryName={country.name} marketQuote={marketData?.[country.code]} />}
          {activeTab === "conflicts" && <ConflictsTab  countryCode={country.code} countryName={country.name} />}
          {activeTab === "travel"    && <TravelTab     countryCode={country.code} />}
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
