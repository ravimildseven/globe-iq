"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Radio,
} from "lucide-react";
import type { ConflictData } from "@/lib/types";
import type { Article } from "@/app/api/news/route";

// ─── Types ─────────────────────────────────────────────────────────────────
interface ConflictsApiResponse {
  conflicts:   ConflictData[];
  recentNews:  Article[];
  asOf:        string;
}

// ─── Config maps ───────────────────────────────────────────────────────────
const statusConfig = {
  active:    { color: "text-accent-red",   bg: "bg-accent-red/10",   border: "border-accent-red/25",   label: "Active",    dot: "bg-accent-red",   pulse: true  },
  ceasefire: { color: "text-accent-amber", bg: "bg-accent-amber/10", border: "border-accent-amber/25", label: "Ceasefire", dot: "bg-accent-amber", pulse: false },
  frozen:    { color: "text-accent-blue",  bg: "bg-accent-blue/10",  border: "border-accent-blue/25",  label: "Frozen",    dot: "bg-accent-blue",  pulse: false },
};

const severityConfig = {
  high:   { dot: "bg-red-500",    label: "High",   textColor: "text-red-400"   },
  medium: { dot: "bg-amber-400",  label: "Medium", textColor: "text-amber-400" },
  low:    { dot: "bg-zinc-500",   label: "Low",    textColor: "text-zinc-400"  },
};

const typeConfig = {
  "war":            { icon: <Flame size={15} />,         label: "War"               },
  "civil-conflict": { icon: <AlertTriangle size={15} />, label: "Civil Conflict"    },
  "tension":        { icon: <Shield size={15} />,        label: "Tension"           },
  "disputed":       { icon: <Shield size={15} />,        label: "Disputed Territory" },
};

// ─── Skeleton loader ───────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4 space-y-2 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-4 bg-bg-elevated rounded w-40" />
        <div className="h-5 bg-bg-elevated rounded-full w-16" />
      </div>
      <div className="h-3 bg-bg-elevated rounded w-28" />
      <div className="h-3 bg-bg-elevated rounded w-full" />
      <div className="h-3 bg-bg-elevated rounded w-5/6" />
      <div className="flex gap-1.5 pt-1">
        <div className="h-4 bg-bg-elevated rounded-full w-16" />
        <div className="h-4 bg-bg-elevated rounded-full w-20" />
      </div>
    </div>
  );
}

// ─── News article card ─────────────────────────────────────────────────────
function NewsCard({ article }: { article: Article }) {
  const date = article.publishedAt
    ? (() => {
        try {
          return new Date(article.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day:   "numeric",
          });
        } catch {
          return article.publishedAt;
        }
      })()
    : "";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-bg-elevated/40 hover:bg-bg-elevated border border-border-subtle transition-colors group"
    >
      {/* Publisher logo / favicon */}
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.source}
          className="w-6 h-6 rounded object-cover flex-shrink-0 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary leading-snug line-clamp-2 group-hover:text-text-primary transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-text-muted">{article.source}</span>
          {date && (
            <>
              <span className="text-[10px] text-text-muted/40">·</span>
              <span className="text-[10px] text-text-muted">{date}</span>
            </>
          )}
        </div>
      </div>

      <ExternalLink size={11} className="flex-shrink-0 text-text-muted/40 group-hover:text-accent-amber/70 transition-colors mt-0.5" />
    </a>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ConflictsTab({
  countryCode,
  countryName,
}: {
  countryCode: string;
  countryName: string;
}) {
  const [data, setData]       = useState<ConflictsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/conflicts?code=${encodeURIComponent(countryCode)}&country=${encodeURIComponent(countryName)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ConflictsApiResponse>;
      })
      .then((d) => setData(d))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [countryCode, countryName]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <AlertTriangle size={24} className="text-accent-red/60" />
        <p className="text-xs text-text-muted">Failed to load conflict data.</p>
      </div>
    );
  }

  const conflicts  = data?.conflicts  ?? [];
  const recentNews = data?.recentNews ?? [];
  const asOf       = data?.asOf       ?? "";

  // ── Empty state ──────────────────────────────────────────────────────────
  if (conflicts.length === 0 && recentNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent-green/8 border border-accent-green/20 flex items-center justify-center">
          <CheckCircle2 size={24} className="text-accent-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">No active conflicts</p>
          <p className="text-xs text-text-muted mt-1">{countryName} has no tracked conflicts</p>
        </div>
        {asOf && (
          <p className="text-[10px] text-text-muted/50 mt-2">Data verified · {asOf}</p>
        )}
      </div>
    );
  }

  // ── Main content ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Conflict cards */}
      {conflicts.length > 0 && (
        <div className="space-y-3">
          {conflicts.map((conflict, i) => {
            const status   = statusConfig[conflict.status];
            const type     = typeConfig[conflict.type];
            const severity = conflict.severity ? severityConfig[conflict.severity] : null;

            return (
              <div
                key={i}
                className={`bg-bg-card border ${status.border} rounded-xl p-4 card-glow`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex-shrink-0 ${status.color}`}>{type.icon}</span>
                    <h3 className="text-sm font-semibold text-text-primary leading-snug">
                      {conflict.name}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Severity dot */}
                    {severity && (
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-elevated border border-border-subtle"
                        title={`Severity: ${severity.label}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${severity.dot} flex-shrink-0`} />
                        <span className={severity.textColor}>{severity.label}</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.bg} ${status.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot} relative ${status.pulse ? "pulse-dot" : ""}`}
                      />
                      {status.label}
                    </div>
                  </div>
                </div>

                {/* Type + Year */}
                <p className="text-[11px] text-text-muted mb-2">
                  {type.label} · Since {conflict.startYear}
                </p>

                {/* Description */}
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  {conflict.description}
                </p>

                {/* Parties */}
                {conflict.parties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {conflict.parties.map((party) => (
                      <span
                        key={party}
                        className="px-2 py-0.5 text-[10px] rounded-full bg-bg-elevated text-text-muted border border-border-subtle"
                      >
                        {party}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Live Reports section */}
      {recentNews.length > 0 && (
        <div>
          {/* Section header */}
          <div className="flex items-center gap-2 mb-2.5">
            <Radio size={13} className="text-accent-red" />
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Live Reports
            </span>
            <span className="flex-1 h-px bg-border-subtle" />
          </div>

          <div className="space-y-1.5">
            {recentNews.map((article, i) => (
              <NewsCard key={i} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {asOf && (
        <p className="text-[10px] text-text-muted/50 text-center pt-1">
          Data verified · {asOf}
        </p>
      )}
    </div>
  );
}
