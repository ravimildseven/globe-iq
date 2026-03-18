"use client";

import { useState, useEffect } from "react";
import { CountryInfo } from "@/lib/types";
import { Users, MapPin, Ruler, Coins, Languages, Globe2, Sun, Moon, Clock } from "lucide-react";
import {
  getCountryTimezone,
  formatLocalTime,
  getDayNight,
  getZoneCity,
} from "@/lib/country-timezones";

/* ── Formatting helpers ── */
function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

/* ── Live clock widget ────────────────────────────────────── */
function LocalClock({ countryCode }: { countryCode: string }) {
  const [now, setNow] = useState(() => new Date());
  const tzData = getCountryTimezone(countryCode);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!tzData) return null;

  const localTime  = formatLocalTime(now, tzData.primary);
  const dayNight   = getDayNight(now, tzData.primary);
  const zoneCity   = getZoneCity(tzData.primary);
  const isMultiTz  = tzData.all.length > 1;

  return (
    <div className="bg-bg-card border border-accent-amber/20 rounded-xl p-4 glow-amber">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-accent-amber" />
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
          Local Time
        </span>
        {isMultiTz && (
          <span className="ml-auto text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-bg-elevated border border-border-subtle">
            {tzData.all.length} zones
          </span>
        )}
      </div>

      {/* Main time display */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-text-primary font-mono tracking-tight leading-none">
              {localTime}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-accent-amber font-medium">{tzData.utcLabel}</span>
            <span className="text-text-muted/40 text-xs">·</span>
            <span className="text-xs text-text-muted">{zoneCity}</span>
          </div>
        </div>

        {/* Day/night icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          dayNight === "day"
            ? "bg-accent-amber/10 border border-accent-amber/20"
            : "bg-accent-indigo/10 border border-accent-indigo/20"
        }`}>
          {dayNight === "day"
            ? <Sun  size={22} className="text-accent-amber" />
            : <Moon size={22} className="text-accent-indigo" />
          }
        </div>
      </div>

      {/* Multiple timezones */}
      {isMultiTz && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <p className="text-[10px] text-text-muted mb-2 uppercase tracking-widest">All zones</p>
          <div className="grid grid-cols-2 gap-1.5">
            {tzData.all.slice(0, 6).map(tz => (
              <div key={tz} className="flex items-center justify-between px-2 py-1 rounded bg-bg-elevated">
                <span className="text-[10px] text-text-muted truncate">{getZoneCity(tz)}</span>
                <span className="text-[10px] font-mono text-text-secondary ml-1 flex-shrink-0">
                  {formatLocalTime(now, tz).slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
          {tzData.all.length > 6 && (
            <p className="text-[10px] text-text-muted mt-1.5 text-center">
              +{tzData.all.length - 6} more zones
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border card-glow ${
      accent
        ? "bg-accent-amber/5 border-accent-amber/20"
        : "bg-bg-card border-border-subtle"
    }`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={accent ? "text-accent-amber" : "text-accent-cyan"}>{icon}</span>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">{label}</span>
      </div>
      <p className="text-base font-bold text-text-primary leading-tight">{value}</p>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────── */
function Skeletons() {
  return (
    <div className="space-y-3">
      {/* Clock skeleton */}
      <div className="rounded-xl p-4 bg-bg-card border border-border-subtle">
        <div className="skeleton h-2.5 w-20 rounded mb-3" />
        <div className="skeleton h-8 w-36 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-bg-card border border-border-subtle">
            <div className="skeleton h-2.5 w-16 rounded mb-3" />
            <div className="skeleton h-5 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function GeneralTab({
  info,
  loading,
}: {
  info: CountryInfo | null;
  loading: boolean;
}) {
  if (loading || !info) return <Skeletons />;

  return (
    <div className="space-y-3">

      {/* ── Live local clock ── */}
      <LocalClock countryCode={info.code} />

      {/* ── KPI grid ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard icon={<Users  size={15} />} label="Population" value={fmt(info.population)} accent />
        <StatCard icon={<Ruler  size={15} />} label="Area"       value={info.area.toLocaleString() + " km²"} />
        <StatCard icon={<MapPin size={15} />} label="Capital"    value={info.capital} />
        <StatCard
          icon={<Coins size={15} />}
          label="Currency"
          value={info.currencies[0]
            ? `${info.currencies[0].symbol} ${info.currencies[0].name}`
            : "N/A"}
        />
      </div>

      {/* ── Detail rows ── */}
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

      {/* ── Languages ── */}
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

      {/* ── Source badge ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-indigo/5 border border-accent-indigo/15">
        <Globe2 size={13} className="text-accent-indigo flex-shrink-0" />
        <span className="text-[10px] text-text-muted">UN Member State · REST Countries API</span>
      </div>
    </div>
  );
}
