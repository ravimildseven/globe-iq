"use client";

import { EconomyData } from "@/lib/types";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Package, Percent, Users } from "lucide-react";

function KPICard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4 card-glow">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-accent-cyan">{icon}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-lg font-semibold text-text-primary font-[var(--font-heading)]">{value}</p>
        {trend === "up" && <TrendingUp size={14} className="text-accent-green mb-0.5" />}
        {trend === "down" && <TrendingDown size={14} className="text-accent-red mb-0.5" />}
      </div>
    </div>
  );
}

export default function EconomyTab({
  data,
  countryName,
}: {
  data: EconomyData | null;
  countryName: string;
}) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
          <BarChart3 size={24} className="text-text-muted" />
        </div>
        <p className="text-text-muted text-sm">Economy data not yet available for {countryName}</p>
        <p className="text-xs text-text-muted mt-1">Data is being curated for more countries</p>
      </div>
    );
  }

  const stockTrend = data.stockChange?.startsWith("+")
    ? "up"
    : data.stockChange?.startsWith("-")
    ? "down"
    : "neutral";

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard icon={<DollarSign size={16} />} label="GDP" value={data.gdp} />
        <KPICard icon={<DollarSign size={16} />} label="GDP per Capita" value={data.gdpPerCapita} />
        <KPICard icon={<Percent size={16} />} label="Inflation" value={data.inflation} />
        <KPICard icon={<Users size={16} />} label="Unemployment" value={data.unemployment} />
      </div>

      {/* Stock Market */}
      {data.stockIndex && (
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4 card-glow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted uppercase tracking-wider">{data.stockIndex}</span>
            <span
              className={`text-sm font-bold font-mono ${
                stockTrend === "up"
                  ? "text-accent-green"
                  : stockTrend === "down"
                  ? "text-accent-red"
                  : "text-text-secondary"
              }`}
            >
              {data.stockChange}
            </span>
          </div>
          <p className="text-2xl font-bold font-[var(--font-heading)] text-text-primary">
            {data.stockValue}
          </p>
        </div>
      )}

      {/* Currency */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-accent-amber" />
          <span className="text-xs text-text-muted uppercase tracking-wider">Currency</span>
        </div>
        <p className="text-sm text-text-primary">{data.currency}</p>
      </div>

      {/* Main Exports */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package size={16} className="text-accent-purple" />
          <span className="text-xs text-text-muted uppercase tracking-wider">Main Exports</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.mainExports.map((exp) => (
            <span
              key={exp}
              className="px-2.5 py-1 text-xs rounded-full bg-bg-elevated text-text-secondary border border-border-subtle"
            >
              {exp}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
