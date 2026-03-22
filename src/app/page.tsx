"use client";

import { useState, useCallback, useMemo, useEffect, useRef, forwardRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { CountryCentroid, countryCentroids } from "@/lib/countries-geo";
import { flagEmoji } from "@/lib/flag";
import InfoPanel from "@/components/panel/InfoPanel";
import AmbientSound from "@/components/ui/AmbientSound";
import CountrySearch from "@/components/search/CountrySearch";
import AboutPanel from "@/components/ui/AboutPanel";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LayersPanel, { LayerId } from "@/components/ui/LayersPanel";
import { Globe2, Plus, Minus, Shuffle } from "lucide-react";
import { MarketData, marketHex, marketOpacity } from "@/lib/marketIndices";
import { conflictsDatabase } from "@/lib/conflicts-data";
import { getCountryTimezone } from "@/lib/country-timezones";
import { POPULATION_DENSITY, densityColor } from "@/lib/population-data";

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
  const globeTheme = resolvedTheme === "light" ? "light" : "dark";

  const [selectedCountry, setSelectedCountry] = useState<CountryCentroid | null>(null);
  const [zoomDelta, setZoomDelta] = useState(0);
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

  // Market overlay
  const marketColors = useMemo<Record<string, { hex: string; opacity: number }>>(() => {
    const out: Record<string, { hex: string; opacity: number }> = {};
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

  // Pick overlay colours based on active layer
  const overlayColors = useMemo(() => {
    if (activeLayer === "market")     return marketColors;
    if (activeLayer === "conflicts")  return conflictColors;
    if (activeLayer === "population") return populationColors;
    if (activeLayer === "timezones")  return timezoneColors;
    return undefined;
  }, [activeLayer, marketColors, conflictColors, populationColors, timezoneColors]);

  const nightLightsMode = activeLayer === "nightlights";

  const handleCountrySelect = useCallback((country: CountryCentroid) => {
    setSelectedCountry(country);
    setRecentCountries(prev => {
      const next = [country, ...prev.filter(c => c.code !== country.code)].slice(0, 5);
      try { localStorage.setItem("globe-iq:recent", JSON.stringify(next.map(c => c.code))); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleRandomCountry = useCallback(() => {
    const country = countryCentroids[Math.floor(Math.random() * countryCentroids.length)];
    handleCountrySelect(country);
  }, [handleCountrySelect]);

  const handleClose = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  const handleZoomHandled = useCallback(() => {
    setZoomDelta(0);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg-primary hud-scan">

      {/* ── Deep space background ── */}
      <Starfield ref={starfieldRef} />
      <AmbientBlobs theme={globeTheme} />

      {/* ── Header ── */}
      <header className="absolute top-0 left-0 right-0 z-40 px-6 pt-5 pb-3 flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative flex-shrink-0">
            <img
              src="/logo-icon.svg"
              alt="GlobeIQ"
              className="w-10 h-10 rounded-xl"
              draggable={false}
            />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-green border-2 border-bg-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary tracking-tight leading-none">
              Globe<span className="text-accent-amber">IQ</span>
            </h1>
            <p className="text-[10px] text-text-muted mt-0.5 tracking-widest uppercase">
              World Intelligence
            </p>
          </div>
        </div>

        {/* Right — theme toggle + sound */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <ThemeToggle />
          <AmbientSound />
        </div>
      </header>

      {/* ── Globe ── */}
      <div className={`absolute inset-0 transition-all duration-500 ${selectedCountry ? "sm:right-[440px]" : ""}`}>
        <Globe
          selectedCountry={selectedCountry}
          onCountrySelect={handleCountrySelect}
          zoomDelta={zoomDelta}
          onZoomHandled={handleZoomHandled}
          theme={globeTheme}
          overlayColors={overlayColors}
          nightLightsMode={nightLightsMode}
          onCameraMove={handleCameraMove}
        />
      </div>

      {/* ── Left sidebar: zoom controls + layers button ── */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setZoomDelta(1)}
          className="zoom-btn w-9 h-9 glass rounded-t-xl rounded-b-lg glow-amber flex items-center justify-center text-text-muted hover:text-accent-amber"
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
        <div className="w-px h-3 bg-border mx-auto" />
        <button
          onClick={() => setZoomDelta(-1)}
          className="zoom-btn w-9 h-9 glass rounded-t-lg rounded-b-xl glow-amber flex items-center justify-center text-text-muted hover:text-accent-amber"
          title="Zoom out"
        >
          <Minus size={16} />
        </button>

        {/* Separator */}
        <div className="w-px h-4 bg-border mx-auto" />

        {/* Layers toggle */}
        <LayersPanel activeLayer={activeLayer} onLayerChange={setActiveLayer} />
      </div>

      {/* ── Country info panel ── */}
      {selectedCountry && (
        <InfoPanel
          country={selectedCountry}
          onClose={handleClose}
          marketData={marketData}
        />
      )}

      {/* ── Bottom search dock — floating above HUD bar ── */}
      <div className="absolute bottom-[62px] left-1/2 -translate-x-1/2 z-40
                      flex flex-col items-center gap-2 pointer-events-none">

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
          <CountrySearch onSelect={handleCountrySelect} />
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
      <div className="absolute bottom-5 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Live status */}
        <div className="flex items-center gap-2 glass rounded-full px-3.5 py-1.5">
          <span className="relative w-1.5 h-1.5 rounded-full bg-accent-green pulse-dot" />
          <span className="text-[11px] text-text-muted">
            {selectedCountry
              ? `Viewing · ${selectedCountry.name}`
              : activeLayer
                ? `Layer · ${activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1)}`
                : "Live · Drag to rotate · Click to explore"}
          </span>
        </div>

        {/* About + UTC clock */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <AboutPanel />
          <UTCClock />
        </div>
      </div>
    </main>
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
