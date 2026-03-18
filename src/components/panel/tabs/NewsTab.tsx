"use client";

import { useState, useEffect } from "react";
import { NewsArticle } from "@/lib/types";
import { ExternalLink, Clock, Newspaper, Image as ImageIcon, Zap } from "lucide-react";

const CATEGORIES = [
  { id: "general",       label: "All",     emoji: "🌐" },
  { id: "nation",        label: "Politics", emoji: "🏛️" },
  { id: "business",      label: "Business", emoji: "📈" },
  { id: "technology",    label: "Tech",    emoji: "💡" },
  { id: "health",        label: "Health",  emoji: "🏥" },
  { id: "science",       label: "Science", emoji: "🔬" },
  { id: "entertainment", label: "Culture", emoji: "🎭" },
];

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
  return Date.now() - new Date(dateStr).getTime() < 3_600_000; // < 1 hour
}

/* ── Article card ────────────────────────────────────────── */
function ArticleCard({ article }: { article: NewsArticle & { imageUrl?: string } }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = article.imageUrl && !imgError;
  const recent   = isRecent(article.publishedAt);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-bg-card border border-border-subtle rounded-xl overflow-hidden hover:border-accent-amber/30 hover:bg-bg-elevated transition-all"
    >
      {/* Image */}
      {hasImage && (
        <div className="relative w-full h-36 overflow-hidden bg-bg-elevated">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {/* Gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 via-transparent to-transparent" />
          {/* LIVE badge */}
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
        {/* No-image LIVE badge */}
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

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {article.source && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-amber/10 text-accent-amber/80 border border-accent-amber/15 truncate max-w-[120px]">
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

/* ── Skeletons ───────────────────────────────────────────── */
function ArticleSkeleton({ withImage }: { withImage: boolean }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border-subtle overflow-hidden">
      {withImage && <div className="skeleton w-full h-36" />}
      <div className="p-3.5">
        <div className="skeleton h-4 w-4/5 rounded mb-2.5" />
        <div className="skeleton h-3 w-full rounded mb-1.5" />
        <div className="skeleton h-3 w-2/3 rounded mb-3" />
        <div className="flex gap-2">
          <div className="skeleton h-3 w-16 rounded-full" />
          <div className="skeleton h-3 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Main NewsTab ─────────────────────────────────────────── */
export default function NewsTab({
  countryName,
}: {
  articles: NewsArticle[];
  loading: boolean;
  countryName: string;
}) {
  const [activeCategory, setActiveCategory] = useState("general");
  const [articles, setArticles]             = useState<(NewsArticle & { imageUrl?: string })[]>([]);
  const [loading, setLoading]               = useState(true);

  // Fetch whenever country or category changes
  useEffect(() => {
    setLoading(true);
    setArticles([]);
    fetch(`/api/news?country=${encodeURIComponent(countryName)}&category=${activeCategory}`)
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [countryName, activeCategory]);

  const withImages = articles.filter(a => (a as any).imageUrl);
  const anyImages  = withImages.length > 0;

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
                : "bg-bg-card border-border-subtle text-text-muted hover:text-text-secondary hover:border-border"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Live indicator ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="relative w-1.5 h-1.5 rounded-full bg-accent-green pulse-dot" />
          <span className="text-[10px] text-text-muted">
            {loading ? "Fetching…" : `${articles.length} stories · Live`}
          </span>
        </div>
        <span className="text-[10px] text-text-muted">Google News RSS</span>
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="space-y-2.5">
          <ArticleSkeleton withImage={true} />
          {[...Array(4)].map((_, i) => <ArticleSkeleton key={i} withImage={false} />)}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center">
            <Newspaper size={22} className="text-text-muted" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">No stories found</p>
            <p className="text-xs text-text-muted mt-1">
              Try a different category or check back soon
            </p>
          </div>
        </div>
      )}

      {/* ── Article list ── */}
      {!loading && articles.length > 0 && (
        <div className="space-y-2.5">
          {articles.map((article, i) => (
            <ArticleCard key={i} article={article} />
          ))}
          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 pt-1 pb-2">
            <ImageIcon size={11} className="text-text-muted" />
            <span className="text-[10px] text-text-muted">
              {anyImages ? `${withImages.length} with images · ` : ""}
              Powered by Google News RSS
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
