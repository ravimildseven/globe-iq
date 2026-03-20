"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { CountryCentroid } from "@/lib/countries-geo";
import InfoPanel from "@/components/panel/InfoPanel";
import AmbientSound from "@/components/ui/AmbientSound";
import CountrySearch from "@/components/search/CountrySearch";
import { Globe2, Plus, Minus } from "lucide-react";

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
function Starfield() {
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
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
}

/* ── Ambient gradient blobs ──────────────────────────────── */
function AmbientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Top-left — deep indigo */}
      <div className="blob" style={{
        width: 600, height: 600,
        top: "-15%", left: "-10%",
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        ["--dur" as string]: "22s",
        ["--delay" as string]: "0s",
      }} />
      {/* Bottom-right — amber warmth */}
      <div className="blob" style={{
        width: 500, height: 500,
        bottom: "-10%", right: "-8%",
        background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
        ["--dur" as string]: "18s",
        ["--delay" as string]: "6s",
      }} />
      {/* Center-top — subtle blue */}
      <div className="blob" style={{
        width: 400, height: 400,
        top: "5%", left: "40%",
        background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
        ["--dur" as string]: "25s",
        ["--delay" as string]: "12s",
      }} />
    </div>
  );
}

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCentroid | null>(null);
  const [zoomDelta, setZoomDelta] = useState(0);

  const handleCountrySelect = useCallback((country: CountryCentroid) => {
    setSelectedCountry(country);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  const handleZoomHandled = useCallback(() => {
    setZoomDelta(0);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg-primary hud-scan">

      {/* ── Deep space background ── */}
      <Starfield />
      <AmbientBlobs />

      {/* ── Header ── */}
      <header className="absolute top-0 left-0 right-0 z-40 px-6 pt-5 pb-3 flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative w-10 h-10 rounded-xl glass glow-amber flex items-center justify-center">
            <Globe2 size={20} className="text-accent-amber" />
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

        {/* Centre — country search */}
        <div className="pointer-events-auto">
          <CountrySearch onSelect={handleCountrySelect} />
        </div>

        {/* Right — sound */}
        <div className="pointer-events-auto">
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
        />
      </div>

      {/* ── Zoom controls (left sidebar pill) ── */}
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
      </div>

      {/* ── Country info panel ── */}
      {selectedCountry && (
        <InfoPanel country={selectedCountry} onClose={handleClose} />
      )}

      {/* ── Bottom HUD status bar ── */}
      <div className="absolute bottom-5 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Live status */}
        <div className="flex items-center gap-2 glass rounded-full px-3.5 py-1.5">
          <span className="relative w-1.5 h-1.5 rounded-full bg-accent-green pulse-dot" />
          <span className="text-[11px] text-text-muted">
            {selectedCountry
              ? `Viewing · ${selectedCountry.name}`
              : "Live · Drag to rotate · Click to explore"}
          </span>
        </div>

        {/* UTC clock */}
        <UTCClock />
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
