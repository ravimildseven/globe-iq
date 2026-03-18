"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { CountryCentroid } from "@/lib/countries-geo";
import InfoPanel from "@/components/panel/InfoPanel";
import AmbientSound from "@/components/ui/AmbientSound";
import { Globe2, Search, Plus, Minus, Sun, Moon } from "lucide-react";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
        <p className="text-sm text-text-muted">Loading globe...</p>
      </div>
    </div>
  ),
});

function getTimeOfDay(): { label: string; icon: React.ReactNode } {
  const hour = new Date().getUTCHours();
  // Show a rough indication based on UTC
  if (hour >= 6 && hour < 18) {
    return { label: "Day side facing you", icon: <Sun size={12} className="text-accent-amber" /> };
  }
  return { label: "Night side facing you", icon: <Moon size={12} className="text-accent-blue" /> };
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

  const timeInfo = getTimeOfDay();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-bg-primary">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-9 h-9 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <Globe2 size={20} className="text-accent-blue" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-[var(--font-heading)] text-text-primary tracking-tight">
              Globe IQ
            </h1>
            <p className="text-[11px] text-text-muted -mt-0.5">World Intelligence Dashboard</p>
          </div>
        </div>

        {/* Hint */}
        {!selectedCountry && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-bg-card/80 backdrop-blur-sm border border-border-subtle rounded-full pointer-events-none">
            <Search size={14} className="text-text-muted" />
            <span className="text-xs text-text-muted">Click any country dot to explore</span>
          </div>
        )}
      </header>

      {/* Globe */}
      <div className={`w-full h-full transition-all duration-500 ${selectedCountry ? "sm:pr-[440px]" : ""}`}>
        <Globe
          selectedCountry={selectedCountry}
          onCountrySelect={handleCountrySelect}
          zoomDelta={zoomDelta}
          onZoomHandled={handleZoomHandled}
        />
      </div>

      {/* Right side controls — Zoom + Sound */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 pointer-events-auto">
        {/* Zoom In */}
        <button
          onClick={() => setZoomDelta(1)}
          className="w-10 h-10 rounded-lg bg-bg-card/80 backdrop-blur-sm border border-border-subtle hover:border-hud-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
          title="Zoom in"
        >
          <Plus size={18} />
        </button>
        {/* Zoom Out */}
        <button
          onClick={() => setZoomDelta(-1)}
          className="w-10 h-10 rounded-lg bg-bg-card/80 backdrop-blur-sm border border-border-subtle hover:border-hud-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
          title="Zoom out"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Country Panel */}
      {selectedCountry && (
        <InfoPanel country={selectedCountry} onClose={handleClose} />
      )}

      {/* Bottom bar — status + sun indicator + ambient sound */}
      <div className="absolute bottom-4 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4">
          {/* Live status */}
          <div className="flex items-center gap-2">
            <span className="relative w-2 h-2 rounded-full bg-accent-green pulse-dot" />
            <span className="text-[11px] text-text-muted">
              {selectedCountry ? `Viewing ${selectedCountry.name}` : "Interactive · Drag to rotate · Click to select"}
            </span>
          </div>
          {/* Sun/time indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-card/60 border border-border-subtle">
            {timeInfo.icon}
            <span className="text-[10px] text-text-muted">{timeInfo.label}</span>
          </div>
        </div>

        {/* Ambient sound toggle */}
        <div className="pointer-events-auto">
          <AmbientSound />
        </div>
      </div>
    </main>
  );
}
