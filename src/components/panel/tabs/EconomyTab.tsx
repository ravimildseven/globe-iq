"use client";

import { EconomyData } from "@/lib/types";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Package, Percent, Users, Minus } from "lucide-react";

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
        {trend === "up"   && <TrendingUp  size={13} className="text-accent-green mb-0.5" />}
        {trend === "down" && <TrendingDown size={13} className="text-accent-red mb-0.5" />}
        {trend === "neutral" && <Minus    size={13} className="text-text-muted mb-0.5" />}
      </div>
    </div>
  );
}

export default function EconomyTab({ data, countryName }: {
  data: EconomyData | null;
  countryName: string;
}) {
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

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        <KPICard icon={<DollarSign size={14} />} label="GDP"           value={data.gdp} />
        <KPICard icon={<DollarSign size={14} />} label="GDP / capita"  value={data.gdpPerCapita} />
        <KPICard icon={<Percent    size={14} />} label="Inflation"     value={data.inflation} />
        <KPICard icon={<Users      size={14} />} label="Unemployment"  value={data.unemployment} />
      </div>

      {/* Stock market card */}
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
    </div>
  );
}
