"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  useHomeCountry,
  SUPPORTED_HOME_COUNTRIES,
  HOME_COUNTRY_LABELS,
  type HomeCountryCode,
} from "@/lib/homeCountry";

export default function HomeCountrySelector() {
  const { homeCountry, setHomeCountry } = useHomeCountry();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = HOME_COUNTRY_LABELS[homeCountry];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5
                   text-text-muted hover:text-text-primary transition-colors
                   border border-border hover:border-accent-amber/40
                   hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] text-[11px]"
        title="Set your home country for travel comparisons"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="tracking-wide hidden sm:inline">From {current.label}</span>
        <span className="tracking-wide sm:hidden">{current.label}</span>
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-[80] rounded-xl overflow-hidden
                     border border-border shadow-2xl"
          style={{
            background: "var(--search-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            minWidth: 180,
          }}
        >
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-[9px] text-text-muted uppercase tracking-widest font-medium">
              Your home country
            </p>
          </div>
          {SUPPORTED_HOME_COUNTRIES.map(code => {
            const info = HOME_COUNTRY_LABELS[code];
            const isActive = code === homeCountry;
            return (
              <button
                key={code}
                onClick={() => { setHomeCountry(code as HomeCountryCode); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm
                            transition-colors ${
                  isActive
                    ? "bg-accent-amber/10 text-accent-amber"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <span className="text-base leading-none">{info.flag}</span>
                <span className="flex-1 text-xs">{info.label}</span>
                {isActive && (
                  <span className="text-[9px] font-mono text-accent-amber/60">{code}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
