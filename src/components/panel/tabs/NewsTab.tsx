"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsArticle } from "@/lib/types";
import {
  ExternalLink, Clock, Newspaper, Zap, RefreshCw,
  Wifi, WifiOff, AlertTriangle, CheckCircle2, Info,
} from "lucide-react";

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "general",       label: "All",      emoji: "🌐" },
  { id: "nation",        label: "Politics", emoji: "🏛️" },
  { id: "business",      label: "Business", emoji: "📈" },
  { id: "technology",    label: "Tech",     emoji: "💡" },
  { id: "health",        label: "Health",   emoji: "🏥" },
  { id: "science",       label: "Science",  emoji: "🔬" },
  { id: "entertainment", label: "Culture",  emoji: "🎭" },
];

// ─── API response shape ──────────────────────────────────────────────────────
interface NewsResponse {
  articles:     (NewsArticle & { imageUrl?: string })[];
  source:       "gnews" | "rss" | "rate_limited" | "none";
  sourceLabel:  string;
  realTime:     boolean;
  rateLimited?: boolean;
  info?:        string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isRecent(dateStr: string): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 3_600_000; // < 1h
}

// ─── Source badge ─────────────────────────────────────────────────────────────
function SourceBadge({
  source, sourceLabel, realTime, rateLimited, info,
}: Pick<NewsResponse, "source" | "sourceLabel" | "realTime" | "rateLimited" | "info">) {
  const [showInfo, setShowInfo] = useState(false);

  const isGnews   = source === "gnews";
  const isRss     = source === "rss";
  const isLimited = rateLimited;

  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(v => !v)}
        className={`flex items-center gap-1.5 text-[10px] rounded-full px-2 py-0.5 border transition-all ${
          isGnews   ? "bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo" :
          isLimited ? "bg-accent-amber/10  border-accent-amber/20  text-accent-amber"  :
          isRss     ? "bg-accent-green/10  border-accent-green/20  text-accent-green"  :
                      "bg-bg-elevated      border-border-subtle     text-text-muted"
        }`}
        title="Click for source info"
      >
        {isGnews   && <CheckCircle2  size={9} />}
        {isLimited && <AlertTriangle size={9} />}
        {isRss     && <Wifi          size={9} />}
        {!isGnews && !isRss && !isLimited && <WifiOff size={9} />}
        {sourceLabel}
        <Info size={8} className="opacity-60" />
      </button>

      {/* Info popover */}
      {showInfo && info && (
        <div className="absolute right-0 top-6 z-50 w-56 p-3 rounded-xl bg-bg-card border border-border shadow-xl shadow-black/50 text-[10px] text-text-secondary leading-relaxed">
          {isLimited && (
            <p className="text-accent-amber font-semibold mb-1">⚠️ Quota reached</p>
          )}
          {info}
          {isGnews && (
            <p className="mt-2 text-text-muted">
              Free plan: 100 req/day · ~12h delay ·{" "}
              <a href="https://gnews.io/change-plan" target="_blank" rel="noopener noreferrer"
                 className="text-accent-indigo underline">Upgrade</a>
            </p>
          )}
          {isRss && realTime && (
            <p className="mt-1 text-accent-green">✅ Near real-time (2-min cache)</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Article image with proxy fallback ──────────────────────────────────────
function ArticleImage({ imageUrl, title }: { imageUrl: string; title: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  return (
    <div className="relative w-full h-36 overflow-hidden bg-bg-elevated flex-shrink-0">
      {status === "error" ? (
        <div className="w-full h-full flex items-center justify-center">
          <Newspaper size={24} className="text-text-muted opacity-30" />
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            status === "ok"
              ? "opacity-90 group-hover:opacity-100 group-hover:scale-[1.02]"
              : "opacity-0"
          }`}
          /* Suppress Referer header → prevents publisher hotlink blocks */
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={()  => setStatus("ok")}
          onError={() => setStatus("error")}
          loading="lazy"
        />
      )}
      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-card/70 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Article card ────────────────────────────────────────────────────────────
function ArticleCard({ article }: { article: NewsArticle & { imageUrl?: string } }) {
  const hasImage = !!article.imageUrl;
  const recent   = isRecent(article.publishedAt);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-bg-card border border-border-subtle rounded-xl overflow-hidden hover:border-accent-amber/30 hover:bg-bg-elevated transition-all"
    >
      {/* Image (proxied) */}
      {hasImage && (
        <div className="relative">
          <ArticleImage imageUrl={article.imageUrl!} title={article.title} />
          {recent && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-red/90 backdrop-blur-sm">
              <Zap size={9} className="text-white" fill="white" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3.5">
        {!hasImage && recent && (
          <div className="flex items-center gap-1 mb-2">
            <Zap size={10} className="text-accent-red" fill="currentColor" />
            <span className="text-[9px] font-bold text-accent-red uppercase tracking-wider">Breaking</span>
          </div>
        )}

        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-amber transition-colors leading-snug mb-2">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-xs text-text-muted leading-relaxed mb-2.5 line-clamp-2">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {article.source && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-amber/10 text-accent-amber/80 border border-accent-amber/15 truncate max-w-[130px]">
                {article.source}
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1 text-[10px] text-text-muted flex-shrink-0">
                <Clock size={9} />
                {timeAgo(article.publishedAt)}
              </span>
            )}
          </div>
          <ExternalLink size={11} className="text-text-muted group-hover:text-accent-amber transition-colors flex-shrink-0" />
        </div>
      </div>
    </a>
  );
}

// ─── Skeletons ───────────────────────────────────────────────────────────────
function Skeletons() {
  return (
    <div className="space-y-2.5">
      {/* First card with image placeholder */}
      <div className="bg-bg-card rounded-xl border border-border-subtle overflow-hidden">
        <div className="skeleton w-full h-36" />
        <div className="p-3.5 space-y-2">
          <div className="skeleton h-4 w-4/5 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-bg-card rounded-xl border border-border-subtle p-3.5 space-y-2">
          <div className="skeleton h-4 w-4/5 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Status check panel ──────────────────────────────────────────────────────
function StatusPanel({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news/status", { cache: "no-store" })
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ error: "Status check failed" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-bg-card border border-accent-indigo/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-primary">News Source Status</span>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xs">✕</button>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
      )}

      {!loading && status && !status.error && (
        <div className="space-y-2.5 text-xs">
          {/* GNews row */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-bg-elevated">
            <span className={`mt-0.5 flex-shrink-0 ${
              status.gnews.status === "ok"           ? "text-accent-green" :
              status.gnews.status === "rate_limited" ? "text-accent-amber" :
              status.gnews.status === "no_key"       ? "text-text-muted"  : "text-accent-red"
            }`}>
              {status.gnews.status === "ok"           ? "✅" :
               status.gnews.status === "rate_limited" ? "⚠️" :
               status.gnews.status === "no_key"       ? "🔑" : "❌"}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary mb-0.5">
                GNews API{" "}
                <span className="font-normal text-text-muted capitalize">({status.gnews.status.replace("_", " ")})</span>
              </p>
              <p className="text-text-muted leading-snug">{status.gnews.message}</p>
              {!status.gnews.hasKey && (
                <p className="text-accent-amber mt-1">
                  Set <code className="bg-bg-card px-1 rounded">GNEWS_API_KEY</code> in .env.local
                </p>
              )}
            </div>
          </div>

          {/* RSS row */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-bg-elevated">
            <span className={status.rss.status === "ok" ? "text-accent-green" : "text-accent-red"}>
              {status.rss.status === "ok" ? "✅" : "❌"}
            </span>
            <div>
              <p className="font-semibold text-text-primary mb-0.5">
                Google News RSS <span className="font-normal text-text-muted">({status.rss.status})</span>
              </p>
              <p className="text-text-muted">{status.rss.message} · Near real-time (2-min cache)</p>
            </div>
          </div>

          {/* Active source */}
          <div className="text-text-muted pt-1 border-t border-border-subtle">
            <span className="text-accent-amber font-medium">Active:</span>{" "}
            {status.activeSource} ·{" "}
            Checked at {new Date(status.checkedAt).toLocaleTimeString()}
          </div>
        </div>
      )}

      {!loading && status?.error && (
        <p className="text-xs text-accent-red">{status.error}</p>
      )}
    </div>
  );
}

// ─── Main NewsTab ─────────────────────────────────────────────────────────────
export default function NewsTab({
  countryName,
}: {
  articles: NewsArticle[];
  loading: boolean;
  countryName: string;
}) {
  const [activeCategory, setActiveCategory] = useState("general");
  const [response, setResponse]             = useState<NewsResponse | null>(null);
  const [loading, setLoading]               = useState(true);
  const [showStatus, setShowStatus]         = useState(false);

  const fetchNews = useCallback(() => {
    setLoading(true);
    setResponse(null);
    fetch(`/api/news?country=${encodeURIComponent(countryName)}&category=${activeCategory}`)
      .then(r => r.json())
      .then(setResponse)
      .catch(() => setResponse(null))
      .finally(() => setLoading(false));
  }, [countryName, activeCategory]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const articles   = response?.articles ?? [];
  const source     = response?.source ?? "rss";
  const sourceLabel = response?.sourceLabel ?? "Google News RSS";
  const realTime   = response?.realTime ?? true;
  const rateLimited = response?.rateLimited ?? false;
  const info       = response?.info;

  return (
    <div className="space-y-3">

      {/* ── Category filter pills ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeCategory === cat.id
                ? "bg-accent-amber/15 border-accent-amber/40 text-accent-amber"
                : "bg-bg-card border-border-subtle text-text-muted hover:text-text-secondary"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between">
        {/* Live dot + count */}
        <div className="flex items-center gap-1.5">
          <span className={`relative w-1.5 h-1.5 rounded-full pulse-dot ${
            rateLimited ? "bg-accent-amber" : "bg-accent-green"
          }`} />
          <span className="text-[10px] text-text-muted">
            {loading ? "Fetching…" : `${articles.length} stories`}
          </span>
        </div>

        {/* Right side — source badge + refresh + verify */}
        <div className="flex items-center gap-2">
          {!loading && response && (
            <SourceBadge
              source={source}
              sourceLabel={sourceLabel}
              realTime={realTime}
              rateLimited={rateLimited}
              info={info}
            />
          )}
          <button
            onClick={fetchNews}
            className="text-text-muted hover:text-text-primary transition-colors"
            title="Refresh news"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowStatus(v => !v)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
              showStatus
                ? "bg-accent-indigo/15 border-accent-indigo/30 text-accent-indigo"
                : "bg-bg-card border-border-subtle text-text-muted hover:text-text-secondary"
            }`}
            title="Verify API sources"
          >
            Verify
          </button>
        </div>
      </div>

      {/* ── Rate limit warning ── */}
      {rateLimited && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-accent-amber/8 border border-accent-amber/20">
          <AlertTriangle size={14} className="text-accent-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-accent-amber">GNews quota reached (100/day)</p>
            <p className="text-[10px] text-text-muted mt-0.5">
              Switched to Google News RSS · Real-time · Resets at midnight UTC
            </p>
          </div>
        </div>
      )}

      {/* ── Status panel ── */}
      {showStatus && <StatusPanel onClose={() => setShowStatus(false)} />}

      {/* ── Skeletons ── */}
      {loading && <Skeletons />}

      {/* ── Empty ── */}
      {!loading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center">
            <Newspaper size={22} className="text-text-muted" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">No stories found</p>
            <p className="text-xs text-text-muted mt-1">Try a different category</p>
          </div>
          <button
            onClick={fetchNews}
            className="text-xs px-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Article list ── */}
      {!loading && articles.length > 0 && (
        <div className="space-y-2.5">
          {articles.map((article, i) => (
            <ArticleCard key={i} article={article} />
          ))}
          <p className="text-center text-[10px] text-text-muted pb-2">
            {articles.filter(a => (a as any).imageUrl).length} with images ·{" "}
            {sourceLabel}
          </p>
        </div>
      )}
    </div>
  );
}
