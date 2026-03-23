"use client";

import { X, Users, Ruler, Building2, Coins, Languages, ChevronRight } from "lucide-react";
import { Territory } from "@/lib/territoriesData";
import { flagEmoji } from "@/lib/flag";

interface TerritoryPanelProps {
  territory: Territory;
  onClose: () => void;
  onParentCountryClick: (code: string) => void;
}

export default function TerritoryPanel({ territory, onClose, onParentCountryClick }: TerritoryPanelProps) {
  const facts = [
    { icon: <Users size={11} />,     label: "Population", value: territory.population },
    { icon: <Ruler size={11} />,     label: "Area",        value: territory.area },
    { icon: <Building2 size={11} />, label: "Capital",     value: territory.capital },
    { icon: <Coins size={11} />,     label: "Currency",    value: territory.currency },
    { icon: <Languages size={11} />, label: "Language",    value: territory.languages[0] },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="overlay-enter fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
        onClick={onClose}
      />

      <aside className="panel-enter fixed right-0 top-0 h-[100dvh] sm:h-full w-full sm:w-[440px] z-50 flex flex-col bg-bg-card">

        {/* Safe-area spacer */}
        <div className="sm:hidden flex-shrink-0" style={{ height: "env(safe-area-inset-top, 0px)" }} />

        {/* ── Hero ── */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 170 }}>

          {/* Amber-tinted gradient base */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #1a1208 0%, #231a08 50%, #1a1208 100%)",
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 z-10 w-11 h-11 glass rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Territory badge + name anchored to bottom */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4 pt-10 flex items-end gap-3">
            {/* Flag emoji */}
            <div className="flex-shrink-0 w-14 h-10 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-3xl">
              {territory.flag}
            </div>

            {/* Name + status */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-text-primary leading-tight truncate">
                  {territory.name}
                </h2>
                {/* Territory badge */}
                <span className="flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/20">
                  Territory
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {territory.status}
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick facts ── */}
        <div className="flex items-stretch border-b border-border-subtle bg-bg-elevated/40 divide-x divide-border-subtle flex-shrink-0">
          {facts.map(item => (
            <div key={item.label} className="flex-1 flex flex-col items-center justify-center py-2 px-1 gap-0.5 min-w-0">
              <span className="text-accent-amber/70">{item.icon}</span>
              <span className="text-[8px] text-text-muted uppercase tracking-wide leading-none">{item.label}</span>
              <span className="text-[10px] font-semibold text-text-primary truncate w-full text-center px-0.5 leading-tight">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
          style={{ background: "linear-gradient(180deg, var(--color-bg-card) 0%, var(--color-bg-primary) 100%)" }}
        >

          {/* Languages list */}
          {territory.languages.length > 1 && (
            <section>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-2">
                Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {territory.languages.map(lang => (
                  <span
                    key={lang}
                    className="text-xs px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-text-secondary"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Political status details */}
          <section>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-2">
              Political Status
            </p>
            <div className="glass rounded-xl border border-border p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Classification</span>
                <span className="text-xs font-medium text-text-secondary">{territory.status}</span>
              </div>
              <div className="h-px bg-border-subtle" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Administering power</span>
                <span className="text-xs font-medium text-text-secondary">{territory.parentCountry}</span>
              </div>
            </div>
          </section>

          {/* Parent country link */}
          <section>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-2">
              Administered By
            </p>
            <button
              onClick={() => onParentCountryClick(territory.parentCode)}
              className="w-full flex items-center gap-3 glass rounded-xl border border-border px-4 py-3
                         hover:border-accent-amber/40 hover:shadow-[0_0_12px_rgba(245,158,11,0.12)]
                         transition-all group text-left"
            >
              <span className="text-2xl flex-shrink-0">
                {flagEmoji(territory.parentCode)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary group-hover:text-accent-amber transition-colors">
                  {territory.parentCountry}
                </p>
                <p className="text-xs text-text-muted">Open country profile</p>
              </div>
              <ChevronRight size={14} className="text-text-muted group-hover:text-accent-amber transition-colors flex-shrink-0" />
            </button>
          </section>
        </div>

        {/* Bottom accent */}
        <div
          className="flex-shrink-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)" }}
        />
      </aside>
    </>
  );
}
