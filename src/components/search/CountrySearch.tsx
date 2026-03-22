"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, MapPin } from "lucide-react";
import { countryCentroids, CountryCentroid } from "@/lib/countries-geo";
import { flagEmoji } from "@/lib/flag";

// ─── Region label lookup ──────────────────────────────────────────────────────
const REGION: Record<string, string> = {
  AF:"South Asia",AL:"Southern Europe",DZ:"North Africa",AO:"Central Africa",
  AM:"Caucasus",AR:"South America",AU:"Oceania",AT:"Central Europe",
  AZ:"Caucasus",BD:"South Asia",BE:"Western Europe",BR:"South America",
  BG:"Eastern Europe",BF:"West Africa",KH:"Southeast Asia",CM:"Central Africa",
  CA:"North America",CL:"South America",CN:"East Asia",CO:"South America",
  CD:"Central Africa",HR:"Southern Europe",CU:"Caribbean",CZ:"Central Europe",
  DK:"Northern Europe",EC:"South America",EG:"North Africa",ET:"East Africa",
  FI:"Northern Europe",FR:"Western Europe",GE:"Caucasus",DE:"Western Europe",
  GH:"West Africa",GR:"Southern Europe",HU:"Central Europe",IN:"South Asia",
  ID:"Southeast Asia",IR:"Middle East",IQ:"Middle East",IE:"Northern Europe",
  IL:"Middle East",IT:"Southern Europe",JP:"East Asia",JO:"Middle East",
  KZ:"Central Asia",KE:"East Africa",KP:"East Asia",KR:"East Asia",KW:"Middle East",
  LA:"Southeast Asia",LB:"Middle East",LY:"North Africa",MY:"Southeast Asia",
  MX:"North America",MA:"North Africa",MM:"Southeast Asia",ML:"West Africa",
  MZ:"East Africa",NP:"South Asia",NL:"Western Europe",NZ:"Oceania",
  NE:"West Africa",NG:"West Africa",NO:"Northern Europe",PK:"South Asia",
  PS:"Middle East",PA:"Central America",PE:"South America",PH:"Southeast Asia",
  PL:"Eastern Europe",PT:"Southern Europe",QA:"Middle East",RO:"Eastern Europe",
  RU:"Eastern Europe",SA:"Middle East",RS:"Southern Europe",SG:"Southeast Asia",
  ZA:"Southern Africa",ES:"Southern Europe",LK:"South Asia",SD:"North Africa",
  SE:"Northern Europe",CH:"Central Europe",SY:"Middle East",TW:"East Asia",
  TH:"Southeast Asia",TD:"Central Africa",TR:"Western Asia",UA:"Eastern Europe",
  AE:"Middle East",GB:"Northern Europe",US:"North America",UZ:"Central Asia",
  VE:"South America",VN:"Southeast Asia",YE:"Middle East",ZW:"Southern Africa",
  BY:"Eastern Europe",TN:"North Africa",TZ:"East Africa",UG:"East Africa",
  SO:"East Africa",BO:"South America",ZM:"Southern Africa",
};

interface CountrySearchProps {
  onSelect: (country: CountryCentroid) => void;
}

export default function CountrySearch({ onSelect }: CountrySearchProps) {
  const [open, setOpen]               = useState(false);
  const [query, setQuery]             = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef    = useRef<HTMLInputElement>(null);
  const listRef     = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLButtonElement | null>(null);

  // ─── Filter results ─────────────────────────────────────────────────────────
  const results = query.trim().length === 0
    ? countryCentroids.slice(0, 10)
    : countryCentroids
        .filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase() === query.toLowerCase()
        )
        .slice(0, 10);

  // ─── ⌘K / Ctrl+K shortcut ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // ─── Focus input on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  // ─── Scroll highlighted item into view ─────────────────────────────────────
  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  // ─── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlighted]) handleSelect(results[highlighted]);
    }
  }, [results, highlighted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback((country: CountryCentroid) => {
    onSelect(country);
    setOpen(false);
    setQuery("");
  }, [onSelect]);

  return (
    <>
      {/* ── Trigger pill ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search countries (⌘K)"
        className="flex items-center gap-2 glass rounded-full px-3.5 py-1.5
                   text-text-muted hover:text-text-primary transition-colors
                   border border-border hover:border-accent-amber/40
                   hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] group"
      >
        <Search size={13} className="text-accent-amber/70 group-hover:text-accent-amber transition-colors" />
        <span className="text-[11px] tracking-wide sm:hidden">Search</span>
        <span className="text-[11px] tracking-wide hidden sm:block">Search countries</span>
        <kbd className="hidden sm:flex items-center gap-0.5 ml-1 px-1.5 py-0.5
                        rounded-md text-[9px] font-mono text-text-muted/70 leading-none"
             style={{ background: "var(--search-kbd-bg)", border: "1px solid var(--search-kbd-border)" }}>
          ⌘K
        </kbd>
      </button>

      {/* ── Modal (portalled to body so fixed positioning is always viewport-relative) */}
      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* Search panel — CSS media query moves it to top on touch devices */}
          <div
            className="search-modal fixed left-1/2 -translate-x-1/2 z-[70]
                       w-[520px] max-w-[calc(100vw-16px)]
                       animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Country search"
          >
            <div
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "var(--search-bg)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid var(--search-border)",
                boxShadow: "var(--search-shadow)",
              }}
            >
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: "1px solid var(--search-divider)" }}>
                <Search size={16} className="text-accent-amber/60 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search any country…"
                  className="flex-1 bg-transparent text-sm text-text-primary
                             outline-none placeholder:text-text-muted/40
                             caret-accent-amber"
                  autoComplete="off"
                  spellCheck={false}
                  inputMode="search"
                  enterKeyHint="go"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); setHighlighted(0); inputRef.current?.focus(); }}
                    className="text-text-muted/50 hover:text-text-muted transition-colors"
                    tabIndex={-1}
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd
                  className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[10px]
                             font-mono text-text-muted/50 leading-none"
                  style={{ background: "var(--search-kbd-bg)", border: "1px solid var(--search-kbd-border)" }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results list */}
              <div ref={listRef} className="overflow-y-auto overscroll-contain" style={{ maxHeight: "min(340px, 50dvh)" }}>
                {results.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <MapPin size={20} className="text-text-muted/30" />
                    <p className="text-sm text-text-muted/50">No countries found for "{query}"</p>
                  </div>
                ) : (
                  results.map((country, i) => {
                    const isActive = i === highlighted;
                    return (
                      <button
                        key={country.code}
                        ref={isActive ? highlightRef : null}
                        onClick={() => handleSelect(country)}
                        onMouseEnter={() => setHighlighted(i)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left
                                   transition-all duration-100 relative"
                        style={{
                          background: isActive ? "rgba(245,158,11,0.08)" : "transparent",
                          borderLeft: isActive
                            ? "2px solid rgba(245,158,11,0.8)"
                            : "2px solid transparent",
                        }}
                      >
                        {/* Flag */}
                        <span className="text-xl w-7 flex-shrink-0 text-center leading-none">
                          {flagEmoji(country.code)}
                        </span>

                        {/* Name + region */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-tight transition-colors ${
                            isActive ? "text-accent-amber" : "text-text-primary"
                          }`}>
                            {country.name}
                          </p>
                          {REGION[country.code] && (
                            <p className="text-[10px] text-text-muted/60 mt-0.5 leading-tight">
                              {REGION[country.code]}
                            </p>
                          )}
                        </div>

                        {/* Code badge */}
                        <span
                          className={`flex-shrink-0 text-[10px] font-mono px-1.5 py-0.5
                                      rounded-md border transition-colors ${
                            isActive
                              ? "text-accent-amber/80 border-accent-amber/30 bg-accent-amber/5"
                              : "text-text-muted/50"
                          }`}
                          style={!isActive ? { borderColor: "var(--search-kbd-border)" } : undefined}
                        >
                          {country.code}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer hint — keyboard shortcuts hidden on mobile */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderTop: "1px solid var(--search-divider)" }}
              >
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-text-muted/50">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded font-mono text-[9px]"
                         style={{ background: "var(--search-kbd-bg)", border: "1px solid var(--search-kbd-border)" }}>↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded font-mono text-[9px]"
                         style={{ background: "var(--search-kbd-bg)", border: "1px solid var(--search-kbd-border)" }}>↵</kbd>
                    select
                  </span>
                </div>
                <span className="text-[10px] text-text-muted/30 sm:text-right w-full sm:w-auto text-center">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </>
  );
}
