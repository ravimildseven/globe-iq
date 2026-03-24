"use client";

import { useState, useCallback, useMemo, useEffect, useRef, forwardRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { CountryCentroid, countryCentroids } from "@/lib/countries-geo";
import { flagEmoji } from "@/lib/flag";
import InfoPanel from "@/components/panel/InfoPanel";
import TerritoryPanel from "@/components/panel/TerritoryPanel";
import { Territory, TERRITORY_BY_CODE } from "@/lib/territoriesData";
import AmbientSound from "@/components/ui/AmbientSound";
import CountrySearch from "@/components/search/CountrySearch";
import AboutPanel from "@/components/ui/AboutPanel";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LayersPanel, { LayerId } from "@/components/ui/LayersPanel";
import GlobalDashboard from "@/components/ui/GlobalDashboard";
import { Globe2, Plus, Minus, Shuffle } from "lucide-react";
import HomeCountrySelector from "@/components/ui/HomeCountrySelector";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SpiralDemo } from "@/components/ui/spiral-demo";
import { playSelectSound, playDeselectSound, playZoomSound, playLayerToggleSound } from "@/lib/sound-effects";
import { MarketData, marketHex, marketOpacity, COUNTRY_INDEX } from "@/lib/marketIndices";
import { getExchangeStatuses, openMarketCount, ExchangeStatus } from "@/lib/market-hours";
import { conflictsDatabase } from "@/lib/conflicts-data";
import { getCountryTimezone } from "@/lib/country-timezones";
import { POPULATION_DENSITY, densityColor } from "@/lib/population-data";
import { GDP_PER_CAPITA, gdpColor } from "@/lib/gdp-per-capita";
import { HDI, hdiColor } from "@/lib/hdi-data";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-accent-amber/20 border-t-accent-amber animate-spin" />
          <div className="absolute inset-2 rounded-full border border-accent-amber/10 border-t-accent-amber/40 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          <Globe2 size={18} className="absolute inset-0 m-auto text-accent-amber/60" />
        </div>
        <p className="text-sm text-text-muted tracking-wide">Initialising Globe IQ…</p>
      </div>
    </div>
  ),
});

/* ── Starfield: 120 pseudo-random stars ──────────────────── */
/* Starfield accepts a ref so the parent can apply a CSS translate for parallax */
const Starfield = forwardRef<HTMLDivElement>(function Starfield(_, ref) {
  const stars = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => {
      const seed = i * 137.508;
      const x = ((seed * 9301 + 49297) % 233280) / 233280 * 100;
      const y = ((seed * 7 + 11) % 97) / 97 * 100;
      const size = ((seed * 3 + 1) % 5) < 3 ? 1 : 1.5;
      const dur = 2 + ((seed * 13) % 4);
      const delay = (seed * 0.07) % 5;
      return { x, y, size, dur, delay, key: i };
    }), []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden style={{ willChange: "transform" }}>
      {stars.map(s => (
        <div
          key={s.key}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            ["--dur" as string]: `${s.dur}s`,
            ["--delay" as string]: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

/* ── Ambient gradient blobs ──────────────────────────────── */
function AmbientBlobs({ theme }: { theme: "dark" | "light" }) {
  const isLight = theme === "light";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Top-left */}
      <div className="blob" style={{
        width: 600, height: 600,
        top: "-15%", left: "-10%",
        background: isLight
          ? "radial-gradient(circle, rgba(100,180,230,0.12) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        ["--dur" as string]: "22s",
        ["--delay" as string]: "0s",
      }} />
      {/* Bottom-right */}
      <div className="blob" style={{
        width: 500, height: 500,
        bottom: "-10%", right: "-8%",
        background: isLight
          ? "radial-gradient(circle, rgba(245,180,100,0.09) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
        ["--dur" as string]: "18s",
        ["--delay" as string]: "6s",
      }} />
      {/* Center-top */}
      <div className="blob" style={{
        width: 400, height: 400,
        top: "5%", left: "40%",
        background: isLight
          ? "radial-gradient(circle, rgba(130,200,240,0.08) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
        ["--dur" as string]: "25s",
        ["--delay" as string]: "12s",
      }} />
    </div>
  );
}

/* ── Helpers for overlay colours ─────────────────────────── */
function parseUtcOffset(utcLabel: string): number {
  const m = utcLabel.match(/UTC([+-])(\d+)(?::(\d+))?/);
  if (!m) return 0;
  const sign = m[1] === "+" ? 1 : -1;
  return sign * (parseInt(m[2]) + parseInt(m[3] || "0") / 60);
}

function timezoneHex(offset: number): string {
  // Map −12 → +14 to hue 220° → 0° (blue → green → yellow → red)
  const t = Math.max(0, Math.min(1, (offset + 12) / 26));
  const hue = Math.round(220 - t * 220);
  return `hsl(${hue}, 80%, 55%)`;
}

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => setThemeMounted(true), []);
  // Use "dark" on SSR; swap to real theme only after client hydration
  const globeTheme = themeMounted && resolvedTheme === "light" ? "light" : "dark";

  const [selectedCountry, setSelectedCountry]   = useState<CountryCentroid | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [flyToTarget, setFlyToTarget]           = useState<CountryCentroid | null>(null);
  const [flyHome, setFlyHome]                 = useState(false);
  const [zoomDelta, setZoomDelta] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [marketData, setMarketData] = useState<MarketData>({});
  const [recentCountries, setRecentCountries] = useState<CountryCentroid[]>([]);
  const [activeLayer, setActiveLayer] = useState<LayerId | null>(null);

  // Hydrate recent history from localStorage after mount
  useEffect(() => {
    try {
      const codes: string[] = JSON.parse(localStorage.getItem("globe-iq:recent") ?? "[]");
      const countries = codes
        .map(code => countryCentroids.find(c => c.code === code))
        .filter((c): c is CountryCentroid => !!c);
      setRecentCountries(countries);
    } catch { /* ignore parse errors */ }
  }, []);

  // Escape key — dismiss search beacon without opening panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && flyToTarget && !selectedCountry) {
        setFlyToTarget(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flyToTarget, selectedCountry]);

  // Starfield parallax — ref + direct DOM mutation avoids 60fps React re-renders
  const starfieldRef = useRef<HTMLDivElement>(null);
  const handleCameraMove = useCallback((az: number, el: number) => {
    if (starfieldRef.current) {
      starfieldRef.current.style.transform =
        `translate(${(az * 22).toFixed(1)}px, ${(el * 14).toFixed(1)}px)`;
    }
  }, []);

  // Fetch market data on mount, refresh every 5 minutes
  useEffect(() => {
    const fetchMarkets = () =>
      fetch("/api/markets")
        .then(r => r.ok ? r.json() : {})
        .then((d: MarketData) => setMarketData(d))
        .catch(() => {});
    fetchMarkets();
    const id = setInterval(fetchMarkets, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Market overlay — grey baseline for all known exchanges, overwritten with live data
  const marketColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    const out: Record<string, { hex: string; opacity: number }> = {};
    // Grey fill for all countries with a tracked exchange (no data yet / unavailable)
    for (const code of Object.keys(COUNTRY_INDEX)) {
      out[code] = { hex: "#64748B", opacity: 0.15 };
    }
    // Overwrite with live market data
    for (const [code, q] of Object.entries(marketData)) {
      out[code] = { hex: marketHex(q.changePercent), opacity: marketOpacity(q.changePercent) };
    }
    return out;
  }, [marketData]);

  // Conflict overlay — worst conflict per country
  const conflictColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    const out: Record<string, { hex: string; opacity: number }> = {};
    for (const [code, conflicts] of Object.entries(conflictsDatabase)) {
      const worst = conflicts.reduce((best, c) => {
        const score = (c.status === "active" ? 4 : c.status === "ceasefire" ? 2 : 1)
                    + (c.severity === "high" ? 3 : c.severity === "medium" ? 1 : 0);
        const bScore = (best.status === "active" ? 4 : best.status === "ceasefire" ? 2 : 1)
                     + (best.severity === "high" ? 3 : best.severity === "medium" ? 1 : 0);
        return score > bScore ? c : best;
      });
      if (worst.status === "active" && worst.severity === "high") {
        out[code] = { hex: "#EF4444", opacity: 0.42 };
      } else if (worst.status === "active") {
        out[code] = { hex: "#F97316", opacity: 0.38 };
      } else if (worst.status === "ceasefire") {
        out[code] = { hex: "#EAB308", opacity: 0.32 };
      } else {
        out[code] = { hex: "#94A3B8", opacity: 0.25 };
      }
    }
    return out;
  }, []);

  // Population density overlay
  const populationColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    const out: Record<string, { hex: string; opacity: number }> = {};
    for (const [code, density] of Object.entries(POPULATION_DENSITY)) {
      out[code] = densityColor(density);
    }
    return out;
  }, []);

  // Timezone overlay — computed once from static data
  const timezoneColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    const out: Record<string, { hex: string; opacity: number }> = {};
    for (const c of countryCentroids) {
      const tz = getCountryTimezone(c.code);
      if (tz) {
        const offset = parseUtcOffset(tz.utcLabel);
        out[c.code] = { hex: timezoneHex(offset), opacity: 0.45 };
      }
    }
    return out;
  }, []);

  // GDP per capita overlay — static data
  const gdpColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    const out: Record<string, { hex: string; opacity: number }> = {};
    for (const [code, gdp] of Object.entries(GDP_PER_CAPITA)) {
      out[code] = gdpColor(gdp);
    }
    return out;
  }, []);

  // HDI overlay — static data
  const hdiColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    const out: Record<string, { hex: string; opacity: number }> = {};
    for (const [code, hdi] of Object.entries(HDI)) {
      out[code] = hdiColor(hdi);
    }
    return out;
  }, []);

  // Earthquake overlay — lazy-loaded from USGS when layer is activated
  const [earthquakeFeatures, setEarthquakeFeatures] = useState<
    { geometry: { coordinates: [number, number] }; properties: { mag: number } }[]
  >([]);

  useEffect(() => {
    if (activeLayer !== "earthquakes") return;
    fetch("/api/earthquakes")
      .then(r => r.ok ? r.json() : [])
      .then(setEarthquakeFeatures)
      .catch(() => {});
  }, [activeLayer]);

  const earthquakeColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    if (!earthquakeFeatures.length) return {};
    const maxMag: Record<string, number> = {};
    for (const f of earthquakeFeatures) {
      const [lng, lat] = f.geometry.coordinates;
      const mag = f.properties.mag;
      if (!mag || mag < 0) continue;
      // Find nearest country centroid within ~20° (~2000 km)
      let best: string | null = null;
      let bestDistSq = 400; // 20² — max threshold
      for (const c of countryCentroids) {
        const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
        if (d < bestDistSq) { bestDistSq = d; best = c.code; }
      }
      if (!best) continue;
      if (!maxMag[best] || mag > maxMag[best]) maxMag[best] = mag;
    }
    const out: Record<string, { hex: string; opacity: number }> = {};
    for (const [code, mag] of Object.entries(maxMag)) {
      out[code] = mag >= 7.0 ? { hex: "#7F1D1D", opacity: 0.65 }
               : mag >= 6.0 ? { hex: "#EF4444", opacity: 0.55 }
               : mag >= 5.5 ? { hex: "#F97316", opacity: 0.45 }
               : mag >= 5.0 ? { hex: "#EAB308", opacity: 0.38 }
               :               { hex: "#FDE68A", opacity: 0.30 };
    }
    return out;
  }, [earthquakeFeatures]);

  // Pick overlay colours based on active layer
  const overlayColors = useMemo(() => {
    if (activeLayer === "market")      return marketColors;
    if (activeLayer === "conflicts")   return conflictColors;
    if (activeLayer === "population")  return populationColors;
    if (activeLayer === "timezones")   return timezoneColors;
    if (activeLayer === "gdp")         return gdpColors;
    if (activeLayer === "hdi")         return hdiColors;
    if (activeLayer === "earthquakes") return earthquakeColors;
    return undefined;
  }, [activeLayer, marketColors, conflictColors, populationColors, timezoneColors, gdpColors, hdiColors, earthquakeColors]);

  const nightLightsMode = activeLayer === "nightlights";

  const handleTerritorySelect = useCallback((territory: Territory) => {
    playSelectSound();
    setFlyToTarget(null);
    setSelectedCountry(null);
    setSelectedTerritory(territory);
  }, []);

  const handleCountrySelect = useCallback((country: CountryCentroid) => {
    playSelectSound();
    setFlyToTarget(null);         // clear search beacon
    setSelectedTerritory(null);
    setSelectedCountry(country);
    setRecentCountries(prev => {
      const next = [country, ...prev.filter(c => c.code !== country.code)].slice(0, 5);
      try { localStorage.setItem("globe-iq:recent", JSON.stringify(next.map(c => c.code))); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Expose test helpers on window so Playwright tests can open the panel
  // without relying on WebGL raycasting in headless mode.
  useEffect(() => {
    (window as any).__globeiq = { selectCountry: handleCountrySelect, centroids: countryCentroids };
    return () => { delete (window as any).__globeiq; };
  }, [handleCountrySelect]);

  // Search → fly only; no panel, no sound. User clicks the country to open details.
  const handleSearchFly = useCallback((country: CountryCentroid) => {
    setFlyToTarget(country);
  }, []);

  const handleRandomCountry = useCallback(() => {
    const country = countryCentroids[Math.floor(Math.random() * countryCentroids.length)];
    handleCountrySelect(country);
  }, [handleCountrySelect]);

  const handleClose = useCallback(() => {
    playDeselectSound();
    setSelectedCountry(null);
    setSelectedTerritory(null);
    setFlyToTarget(null);
    setFlyHome(true);           // pull camera back to home distance
  }, []);

  const handleZoomHandled = useCallback(() => {
    setZoomDelta(0);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg-primary hud-scan">
      {/* ── Splash Screen Overlay ── */}
      {showSplash && (
        <div className="absolute inset-0 z-[100]">
          <SpiralDemo onEnter={() => setShowSplash(false)} />
        </div>
      )}

      {/* ── Deep space background ── */}
      <Starfield ref={starfieldRef} />
      <AmbientBlobs theme={globeTheme} />

      {/* ── Header ── */}
      <header className="absolute top-0 left-0 right-0 z-40 px-6 pt-5 pb-3 flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <BrandLogo />

        {/* Right — theme toggle + sound */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <ThemeToggle />
          <AmbientSound />
        </div>
      </header>

      {/* ── Globe ── */}
      <div className={`absolute inset-0 transition-all duration-500 ${(selectedCountry || selectedTerritory) ? "sm:right-[440px]" : ""}`}>
        <Globe
          selectedCountry={selectedCountry}
          onCountrySelect={handleCountrySelect}
          onTerritorySelect={handleTerritorySelect}
          flyToTarget={flyToTarget}
          flyHome={flyHome}
          onFlyHomeDone={() => setFlyHome(false)}
          zoomDelta={zoomDelta}
          onZoomHandled={handleZoomHandled}
          theme={globeTheme}
          overlayColors={overlayColors}
          nightLightsMode={nightLightsMode}
          activeLayer={activeLayer}
          onCameraMove={handleCameraMove}
        />
      </div>

      {/* ── Left sidebar: zoom controls + layers button ── */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => { playZoomSound(); setZoomDelta(1); }}
          className="zoom-btn w-9 h-9 glass rounded-t-xl rounded-b-lg glow-amber flex items-center justify-center text-text-muted hover:text-accent-amber"
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
        <div className="w-px h-3 bg-border mx-auto" />
        <button
          onClick={() => { playZoomSound(); setZoomDelta(-1); }}
          className="zoom-btn w-9 h-9 glass rounded-t-lg rounded-b-xl glow-amber flex items-center justify-center text-text-muted hover:text-accent-amber"
          title="Zoom out"
        >
          <Minus size={16} />
        </button>

        {/* Separator */}
        <div className="w-px h-4 bg-border mx-auto" />

        {/* Layers toggle */}
        <LayersPanel activeLayer={activeLayer} onLayerChange={(id) => { playLayerToggleSound(); setActiveLayer(id); }} />

        {/* Global Dashboard */}
        <GlobalDashboard />
      </div>

      {/* ── Mobile beacon dismiss pill (Escape unavailable on touch) ── */}
      {flyToTarget && !selectedCountry && (
        <div className="sm:hidden absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in fade-in duration-200">
          <button
            onClick={() => setFlyToTarget(null)}
            className="flex items-center gap-2 glass rounded-full pl-3 pr-2 py-1.5
                       border border-border text-xs text-text-muted
                       hover:text-text-primary transition-colors"
          >
            <span>{flagEmoji(flyToTarget.code)}</span>
            <span className="font-medium text-text-primary">{flyToTarget.name}</span>
            <span className="text-text-muted/50">· tap globe to explore</span>
            <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-bg-elevated text-text-muted">✕</span>
          </button>
        </div>
      )}

      {/* ── Country info panel ── */}
      {selectedCountry && (
        <InfoPanel
          country={selectedCountry}
          onClose={handleClose}
          marketData={marketData}
        />
      )}

      {/* ── Territory panel ── */}
      {selectedTerritory && !selectedCountry && (
        <TerritoryPanel
          territory={selectedTerritory}
          onClose={handleClose}
          onParentCountryClick={(code) => {
            const parent = countryCentroids.find(c => c.code === code);
            if (parent) handleCountrySelect(parent);
          }}
        />
      )}

      {/* ── Bottom search dock — floating above HUD bar ── */}
      <div className="fixed left-1/2 -translate-x-1/2 z-40
                      flex flex-col items-center gap-2 pointer-events-none"
           style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>

        {/* Recently viewed chips */}
        {recentCountries.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[480px] pointer-events-auto">
            {recentCountries.map(c => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c)}
                title={c.name}
                className="flex items-center gap-1.5 glass rounded-full px-2.5 py-1
                           border border-border hover:border-accent-amber/40
                           text-text-muted hover:text-text-primary transition-colors
                           hover:shadow-[0_0_8px_rgba(245,158,11,0.12)]"
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>{flagEmoji(c.code)}</span>
                <span className="hidden sm:block text-[11px] font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search pill + random-country button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <HomeCountrySelector />
          <CountrySearch onSelect={handleSearchFly} onTerritorySelect={handleTerritorySelect} />

          <button
            onClick={handleRandomCountry}
            title="Explore a random country"
            aria-label="Explore a random country"
            className="w-9 h-9 glass rounded-full border border-border
                       hover:border-accent-amber/40 flex items-center justify-center
                       text-text-muted hover:text-accent-amber transition-colors
                       hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            <Shuffle size={15} />
          </button>
        </div>
      </div>

      {/* ── Bottom HUD status bar ── */}
      <div className="fixed left-6 right-6 z-40 flex items-center justify-between pointer-events-none"
           style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
        {/* Live status */}
        <div className="flex items-center gap-2 glass rounded-full px-3.5 py-1.5">
          <span className="relative w-1.5 h-1.5 rounded-full bg-accent-green pulse-dot" />
          <span className="text-[11px] text-text-muted">
            {selectedCountry
              ? `Viewing · ${selectedCountry.name}`
              : selectedTerritory
                ? `Viewing · ${selectedTerritory.name}`
                : activeLayer
                ? `Layer · ${activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1)}`
                : "Live · Drag to rotate · Click to explore"}
          </span>
        </div>

        {/* About + market hours pill + UTC clock */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <AboutPanel />
          <MarketHoursPill />
          <UTCClock />
        </div>
      </div>
    </main>
  );
}

/* ── Market Hours Pill ───────────────────────────────────── */
function MarketHoursPill() {
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<ExchangeStatus[]>(() => getExchangeStatuses());
  const count = openMarketCount();

  useEffect(() => {
    const id = setInterval(() => setStatuses(getExchangeStatuses()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative hidden sm:flex">
      <button
        onClick={() => setOpen(v => !v)}
        className="glass rounded-full px-3.5 py-1.5 flex items-center gap-2"
        aria-label="Market hours"
      >
        <span className={`relative w-1.5 h-1.5 rounded-full ${count > 0 ? "bg-accent-green pulse-dot" : "bg-text-muted"}`} />
        <span className="text-[11px] text-text-muted font-mono">
          {count}<span className="text-text-muted/50">/6 open</span>
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Popover */}
          <div className="absolute bottom-9 right-0 z-50 glass rounded-xl border border-border p-3 w-64
                          animate-in fade-in slide-in-from-bottom-2 duration-150">
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-2.5">
              Market Hours
            </p>
            <div className="space-y-2">
              {statuses.map(s => {
                const dotColor =
                  s.status === "open"  ? "bg-accent-green pulse-dot" :
                  s.status === "pre"   ? "bg-accent-amber" :
                  s.status === "post"  ? "bg-accent-amber" :
                                         "bg-accent-red";
                const badgeColor =
                  s.status === "open"  ? "bg-accent-green/10 text-accent-green" :
                  s.status === "pre"   ? "bg-accent-amber/10 text-accent-amber" :
                  s.status === "post"  ? "bg-accent-amber/10 text-accent-amber" :
                                         "bg-accent-red/10 text-accent-red";
                const badgeLabel =
                  s.status === "open" ? "Open" :
                  s.status === "pre"  ? "Pre" :
                  s.status === "post" ? "Post" : "Closed";
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                    <span className="text-xs text-text-secondary flex-1 min-w-0 truncate">{s.name}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                    {s.note && (
                      <span className="text-[10px] text-text-muted whitespace-nowrap">{s.note}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Live UTC clock ──────────────────────────────────────── */
function UTCClock() {
  // Initialize null so SSR and first client render both produce the same
  // placeholder — avoids the hydration mismatch from Date() differing.
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = time ? String(time.getUTCHours()).padStart(2, "0")   : "--";
  const mm = time ? String(time.getUTCMinutes()).padStart(2, "0") : "--";
  const ss = time ? String(time.getUTCSeconds()).padStart(2, "0") : "--";

  return (
    <div className="glass rounded-full px-3.5 py-1.5 flex items-center gap-2 hidden sm:flex">
      <span className="w-1 h-1 rounded-full bg-accent-amber" />
      <span className="text-[11px] text-text-muted font-mono tracking-widest">
        {hh}:{mm}:{ss} <span className="text-text-muted/50">UTC</span>
      </span>
    </div>
  );
}
