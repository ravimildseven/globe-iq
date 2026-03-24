"use client";

import { useState, useEffect } from "react";
import { getExchangeStatuses, openMarketCount, ExchangeStatus } from "@/lib/market-hours";
import { CommodityQuote } from "@/lib/commodities";
import { conflictsDatabase } from "@/lib/conflicts-data";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  X,
  BarChart2,
  Globe2,
  Swords,
  Activity,
} from "lucide-react";

// ─── Shared status helpers ────────────────────────────────────────────────────
function StatusDot({ status }: { status: ExchangeStatus["status"] }) {
  const color =
    status === "open"  ? "bg-accent-green" :
    status === "pre"   ? "bg-accent-amber" :
    status === "post"  ? "bg-accent-amber" :
                         "bg-accent-red";
  const pulse = status === "open" ? "pulse-dot" : "";
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${color} ${pulse}`} />;
}

function StatusBadge({ status }: { status: ExchangeStatus["status"] }) {
  const label =
    status === "open"  ? "Open" :
    status === "pre"   ? "Pre" :
    status === "post"  ? "Post" :
                         "Closed";
  const cls =
    status === "open"  ? "bg-accent-green/10 text-accent-green" :
    status === "pre"   ? "bg-accent-amber/10 text-accent-amber" :
    status === "post"  ? "bg-accent-amber/10 text-accent-amber" :
                         "bg-accent-red/10 text-accent-red";
  return (
    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${cls}`}>
      {label}
    </span>
  );
}

// ─── Market Hours ─────────────────────────────────────────────────────────────
function MarketHoursSection() {
  const [statuses, setStatuses] = useState<ExchangeStatus[]>(() => getExchangeStatuses());

  useEffect(() => {
    const id = setInterval(() => setStatuses(getExchangeStatuses()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Clock size={12} className="text-accent-cyan" />
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
          Market Hours
        </span>
      </div>
      <div className="space-y-2">
        {statuses.map(s => (
          <div key={s.id} className="flex items-center gap-2">
            <StatusDot status={s.status} />
            <span className="text-xs text-text-secondary flex-1 min-w-0 truncate">{s.name}</span>
            <StatusBadge status={s.status} />
            {s.note && (
              <span className="text-[10px] text-text-muted whitespace-nowrap">{s.note}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Global Markets (commodities + crypto) ────────────────────────────────────
function GlobalMarketsSection() {
  const [data, setData] = useState<CommodityQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commodities")
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Flame size={12} className="text-accent-amber" />
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
          Global Markets
        </span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-xs text-text-muted">No market data available</p>
      ) : (
        <div className="space-y-2.5">
          {data.map(c => {
            const up = c.changePercent >= 0;
            const sign = up ? "+" : "";
            const formattedPrice = c.price >= 10000
              ? c.price.toLocaleString("en", { maximumFractionDigits: 0 })
              : c.price >= 100
                ? c.price.toLocaleString("en", { maximumFractionDigits: 2 })
                : c.price.toFixed(2);
            return (
              <div key={c.ticker} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs text-text-primary font-medium">{c.name}</span>
                  <span className="text-[10px] text-text-muted ml-1.5">{c.unit}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-mono text-text-primary">{formattedPrice}</span>
                  <span className={`text-[11px] font-mono flex items-center gap-0.5 ${up ? "text-accent-green" : "text-accent-red"}`}>
                    {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {sign}{c.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Globe at a Glance ────────────────────────────────────────────────────────
function GlobeAtAGlance() {
  const openCount = openMarketCount();
  const conflictCount = Object.keys(conflictsDatabase).length;

  const stats = [
    { icon: <Globe2 size={12} className="text-accent-cyan" />, label: "Countries tracked", value: "195" },
    { icon: <Activity size={12} className="text-accent-green" />, label: "Markets open now", value: `${openCount} / 6` },
    { icon: <Swords size={12} className="text-accent-red" />, label: "Active conflicts", value: String(conflictCount) },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <BarChart2 size={12} className="text-accent-purple" />
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
          Globe at a Glance
        </span>
      </div>
      <div className="space-y-2">
        {stats.map(s => (
          <div key={s.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {s.icon}
              <span className="text-xs text-text-secondary truncate">{s.label}</span>
            </div>
            <span className="text-xs font-mono font-semibold text-text-primary flex-shrink-0">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function GlobalDashboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Global Dashboard"
        aria-label="Toggle global dashboard"
        className={`zoom-btn w-9 h-9 glass rounded-xl glow-amber flex items-center justify-center transition-colors
          ${open ? "text-accent-amber" : "text-text-muted hover:text-accent-amber"}`}
      >
        <BarChart2 size={15} />
      </button>

      {/* Panel — opens above the button */}
      {open && (
        <div className="absolute bottom-[44px] left-0 z-50 w-[260px] glass rounded-xl
                        border border-border shadow-[0_8px_40px_rgba(0,0,0,0.45)]
                        overflow-hidden hint-pop">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
            <div className="flex items-center gap-1.5">
              <BarChart2 size={12} className="text-accent-amber" />
              <span className="text-[11px] font-semibold text-text-primary tracking-wide">Global Dashboard</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={11} />
            </button>
          </div>

          {/* Sections */}
          <div className="p-3 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <GlobeAtAGlance />
            <div className="border-t border-border-subtle pt-3">
              <MarketHoursSection />
            </div>
            <div className="border-t border-border-subtle pt-3">
              <GlobalMarketsSection />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
