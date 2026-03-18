"use client";

import { CountryInfo } from "@/lib/types";
import { Users, MapPin, Ruler, Coins, Languages, Globe2 } from "lucide-react";

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function StatCard({ icon, label, value, accent = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`relative rounded-xl p-4 overflow-hidden border transition-all ${
      accent
        ? "bg-accent-amber/5 border-accent-amber/20"
        : "bg-bg-card border-border-subtle"
    } card-glow`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={accent ? "text-accent-amber" : "text-accent-cyan"}>{icon}</span>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">{label}</span>
      </div>
      <p className="text-base font-bold text-text-primary leading-tight">{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 bg-bg-card border border-border-subtle">
      <div className="skeleton h-2.5 w-16 rounded mb-3" />
      <div className="skeleton h-5 w-24 rounded" />
    </div>
  );
}

export default function GeneralTab({ info, loading }: { info: CountryInfo | null; loading: boolean }) {
  if (loading || !info) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="rounded-xl p-4 bg-bg-card border border-border-subtle space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              {i > 0 && <div className="border-t border-border-subtle mb-3" />}
              <div className="flex justify-between">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-3 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard icon={<Users size={15} />}  label="Population" value={fmt(info.population)} accent />
        <StatCard icon={<Ruler size={15} />}  label="Area"       value={info.area.toLocaleString() + " km²"} />
        <StatCard icon={<MapPin size={15} />} label="Capital"    value={info.capital} />
        <StatCard
          icon={<Coins size={15} />}
          label="Currency"
          value={info.currencies[0] ? `${info.currencies[0].symbol} ${info.currencies[0].name}` : "N/A"}
        />
      </div>

      {/* Detail rows */}
      <div className="bg-bg-card border border-border-subtle rounded-xl divide-y divide-border-subtle overflow-hidden">
        {[
          { label: "Region",    value: info.region },
          { label: "Subregion", value: info.subregion },
          { label: "Coords",    value: `${info.lat.toFixed(2)}°, ${info.lng.toFixed(2)}°`, mono: true },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-text-muted">{row.label}</span>
            <span className={`text-xs text-text-primary ${row.mono ? "font-mono text-text-secondary" : ""}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Languages */}
      {info.languages.length > 0 && (
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Languages size={14} className="text-accent-purple" />
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
              Official Languages
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.languages.map(lang => (
              <span
                key={lang}
                className="px-2.5 py-1 text-[11px] rounded-full bg-bg-elevated text-text-secondary border border-border-subtle"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* UN member badge */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-indigo/5 border border-accent-indigo/15">
        <Globe2 size={14} className="text-accent-indigo flex-shrink-0" />
        <span className="text-xs text-text-muted">UN Member State · REST Countries API</span>
      </div>
    </div>
  );
}
