"use client";

import { useState, useEffect, useCallback } from "react";
import { EconomyData } from "@/lib/types";
import { MarketQuote } from "@/lib/marketIndices";
import { CommodityQuote } from "@/lib/commodities";
import { getExchangeStatuses, ExchangeStatus } from "@/lib/market-hours";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Package,
  Percent,
  Users,
  Minus,
  Globe2,
  Database,
  Activity,
  Clock,
  Flame,
} from "lucide-react";

// ─── Response type matching the API ─────────────────────────────────────────
interface EconomyResponse {
  data: EconomyData | null;
  source: "worldbank" | "static" | "none";
  sourceLabel: string;
  asOf: string;
}

// ─── Market Hours Section ────────────────────────────────────────────────────
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

function MarketHoursSection() {
  const [statuses, setStatuses] = useState<ExchangeStatus[]>(() => getExchangeStatuses());

  useEffect(() => {
    const id = setInterval(() => setStatuses(getExchangeStatuses()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={13} className="text-accent-cyan" />
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

// ─── KPI card ────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, trend }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4 card-glow">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-accent-cyan">{icon}</span>
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <p className="text-base font-bold text-text-primary leading-tight">{value}</p>
        {trend === "up"      && <TrendingUp  size={13} className="text-accent-green mb-0.5" />}
        {trend === "down"    && <TrendingDown size={13} className="text-accent-red mb-0.5" />}
        {trend === "neutral" && <Minus       size={13} className="text-text-muted mb-0.5" />}
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeletons() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-bg-card border border-border-subtle">
            <div className="skeleton h-2.5 w-16 rounded mb-3" />
            <div className="skeleton h-5 w-24 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4 bg-bg-card border border-border-subtle">
        <div className="skeleton h-2.5 w-20 rounded mb-3" />
        <div className="skeleton h-7 w-32 rounded" />
      </div>
    </div>
  );
}

// ─── Global Markets (commodities + crypto) ───────────────────────────────────
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

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
        <div className="skeleton h-2.5 w-28 rounded mb-3" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-4 w-full rounded mb-2" />
        ))}
      </div>
    );
  }
  if (!data.length) return null;

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={13} className="text-accent-amber" />
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
          Global Markets
        </span>
      </div>
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
    </div>
  );
}

// ─── Country → exchange mapping ──────────────────────────────────────────────
const COUNTRY_EXCHANGE: Record<string, string> = {
  US: "nyse", CA: "nyse",
  GB: "lse",  IE: "lse",
  JP: "tse",
  CN: "sse",  TW: "sse",
  IN: "bse",
  AU: "asx",  NZ: "asx",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function EconomyTab({
  countryCode,
  countryName,
  marketQuote,
}: {
  countryCode: string;
  countryName: string;
  marketQuote?: MarketQuote;
}) {
  const [loading, setLoading]   = useState(true);
  const [result, setResult]     = useState<EconomyResponse | null>(null);

  // ── Exchange status for this country's market ──────────────────────────
  const [mktStatus, setMktStatus] = useState<ExchangeStatus | null>(() => {
    const id = COUNTRY_EXCHANGE[countryCode.toUpperCase()];
    return id ? (getExchangeStatuses().find(s => s.id === id) ?? null) : null;
  });
  useEffect(() => {
    const id = COUNTRY_EXCHANGE[countryCode.toUpperCase()];
    if (!id) { setMktStatus(null); return; }
    const update = () => setMktStatus(getExchangeStatuses().find(s => s.id === id) ?? null);
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [countryCode]);

  const fetchEconomy = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/economy?code=${encodeURIComponent(countryCode)}`);
      if (!res.ok) throw new Error("fetch failed");
      const json: EconomyResponse = await res.json();
      setResult(json);
    } catch {
      setResult({ data: null, source: "none", sourceLabel: "No data", asOf: "" });
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    fetchEconomy();
  }, [fetchEconomy]);

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) return <Skeletons />;

  const data = result?.data ?? null;

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center">
          <BarChart3 size={22} className="text-text-muted" />
        </div>
        <div>
          <p className="text-sm text-text-secondary font-medium">Data not available</p>
          <p className="text-xs text-text-muted mt-1">Economy data pending for {countryName}</p>
        </div>
      </div>
    );
  }

  const stockTrend = data.stockChange?.startsWith("+") ? "up"
    : data.stockChange?.startsWith("-") ? "down" : "neutral";

  const isLive = result?.source === "worldbank";

  // Live market quote formatting
  const liveUp   = marketQuote && marketQuote.changePercent >= 0;
  const liveSign = liveUp ? "+" : "";
  const livePrice = marketQuote
    ? marketQuote.price >= 1000
      ? marketQuote.price.toLocaleString("en", { maximumFractionDigits: 2 })
      : marketQuote.price.toFixed(2)
    : null;

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard icon={<DollarSign size={14} />} label="GDP"          value={data.gdp} />
        <KPICard icon={<DollarSign size={14} />} label="GDP / capita" value={data.gdpPerCapita} />
        <KPICard icon={<Percent    size={14} />} label="Inflation"    value={data.inflation} />
        <KPICard icon={<Users      size={14} />} label="Unemployment" value={data.unemployment} />
      </div>

      {/* Live market index card */}
      {marketQuote ? (
        <div className={`bg-bg-card border rounded-xl p-4 card-glow ${
          liveUp ? "border-accent-green/30" : "border-accent-red/30"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Activity size={12} className={liveUp ? "text-accent-green" : "text-accent-red"} />
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
                {marketQuote.name}
              </span>
              <span className="text-[9px] text-text-muted/50 font-mono">{marketQuote.ticker}</span>
            </div>
            {mktStatus ? (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                mktStatus.status === "open"  ? "bg-accent-green/10 text-accent-green" :
                mktStatus.status === "pre"   ? "bg-accent-amber/10 text-accent-amber" :
                mktStatus.status === "post"  ? "bg-accent-amber/10 text-accent-amber" :
                                               "bg-accent-red/10 text-accent-red"
              }`}>
                {mktStatus.status === "open" ? "LIVE" :
                 mktStatus.status === "pre"  ? "PRE"  :
                 mktStatus.status === "post" ? "POST" : "CLOSED"}
              </span>
            ) : (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green font-medium">
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-text-primary font-mono">
              {livePrice}
              <span className="text-xs text-text-muted ml-1 font-sans">{marketQuote.currency}</span>
            </p>
            <span className={`flex items-center gap-1 text-sm font-bold ${
              liveUp ? "text-accent-green" : "text-accent-red"
            }`}>
              {liveUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {liveSign}{marketQuote.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-xl px-4 py-3 flex items-center gap-3">
          <BarChart3 size={14} className="text-text-muted flex-shrink-0" />
          <span className="text-xs text-text-muted">No live market data for {countryName}</span>
        </div>
      )}

      {/* Static stock market card (from economy DB) */}
      {data.stockIndex && (
        <div className={`bg-bg-card border rounded-xl p-4 card-glow ${
          stockTrend === "up"   ? "border-accent-green/25" :
          stockTrend === "down" ? "border-accent-red/25"   : "border-border-subtle"
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
              {data.stockIndex}
            </span>
            <span className={`flex items-center gap-1 text-sm font-bold font-mono ${
              stockTrend === "up"   ? "text-accent-green" :
              stockTrend === "down" ? "text-accent-red"   : "text-text-secondary"
            }`}>
              {stockTrend === "up"   && <TrendingUp  size={13} />}
              {stockTrend === "down" && <TrendingDown size={13} />}
              {data.stockChange}
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.stockValue}</p>
        </div>
      )}

      {/* Currency */}
      <div className="bg-bg-card border border-border-subtle rounded-xl px-4 py-3 flex items-center gap-3">
        <DollarSign size={16} className="text-accent-amber flex-shrink-0" />
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Currency</p>
          <p className="text-sm text-text-primary">{data.currency}</p>
        </div>
      </div>

      {/* Exports */}
      {data.mainExports.length > 0 && (
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-accent-purple" />
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
              Main Exports
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.mainExports.map(exp => (
              <span
                key={exp}
                className="px-2.5 py-1 text-[11px] rounded-full bg-bg-elevated text-text-secondary border border-border-subtle"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Global Markets — commodities & crypto */}
      <GlobalMarketsSection />

      {/* Market Hours */}
      <MarketHoursSection />

      {/* Source badge */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-indigo/5 border border-accent-indigo/15">
        {isLive
          ? <Globe2    size={13} className="text-accent-indigo flex-shrink-0" />
          : <Database  size={13} className="text-accent-indigo flex-shrink-0" />
        }
        <span className="text-[10px] text-text-muted">
          {result?.sourceLabel ?? ""}
          {result?.asOf ? ` · ${result.asOf}` : ""}
        </span>
      </div>
    </div>
  );
}
