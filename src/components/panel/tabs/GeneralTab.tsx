"use client";

import { CountryInfo } from "@/lib/types";
import { Users, MapPin, Ruler, Coins, Languages } from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function formatArea(n: number): string {
  return n.toLocaleString() + " km²";
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4 card-glow">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-accent-cyan">{icon}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-semibold text-text-primary font-[var(--font-heading)]">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-bg-card rounded-xl p-4 animate-pulse">
          <div className="h-3 w-20 bg-bg-elevated rounded mb-3" />
          <div className="h-5 w-32 bg-bg-elevated rounded" />
        </div>
      ))}
    </div>
  );
}

export default function GeneralTab({ info, loading }: { info: CountryInfo | null; loading: boolean }) {
  if (loading || !info) return <Skeleton />;

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Users size={16} />} label="Population" value={formatNumber(info.population)} />
        <StatCard icon={<Ruler size={16} />} label="Area" value={formatArea(info.area)} />
        <StatCard icon={<MapPin size={16} />} label="Capital" value={info.capital} />
        <StatCard
          icon={<Coins size={16} />}
          label="Currency"
          value={info.currencies[0] ? `${info.currencies[0].symbol} ${info.currencies[0].name}` : "N/A"}
        />
      </div>

      {/* Details */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">Region</span>
          <span className="text-sm text-text-primary">{info.region}</span>
        </div>
        <div className="border-t border-border-subtle" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">Subregion</span>
          <span className="text-sm text-text-primary">{info.subregion}</span>
        </div>
        <div className="border-t border-border-subtle" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-muted">Coordinates</span>
          <span className="text-sm text-text-secondary font-mono">
            {info.lat.toFixed(2)}°, {info.lng.toFixed(2)}°
          </span>
        </div>
      </div>

      {/* Languages */}
      {info.languages.length > 0 && (
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Languages size={16} className="text-accent-purple" />
            <span className="text-xs text-text-muted uppercase tracking-wider">Languages</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {info.languages.map((lang) => (
              <span
                key={lang}
                className="px-2.5 py-1 text-xs rounded-full bg-bg-elevated text-text-secondary border border-border-subtle"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
