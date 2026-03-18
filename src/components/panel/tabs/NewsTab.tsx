"use client";

import { NewsArticle } from "@/lib/types";
import { ExternalLink, Clock, Newspaper } from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ArticleSkeleton() {
  return (
    <div className="space-y-2.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-bg-card rounded-xl p-4 border border-border-subtle">
          <div className="skeleton h-4 w-4/5 rounded mb-2.5" />
          <div className="skeleton h-3 w-full rounded mb-1.5" />
          <div className="skeleton h-3 w-2/3 rounded mb-3" />
          <div className="flex gap-2">
            <div className="skeleton h-3 w-16 rounded-full" />
            <div className="skeleton h-3 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsTab({ articles, loading, countryName }: {
  articles: NewsArticle[];
  loading: boolean;
  countryName: string;
}) {
  if (loading) return <ArticleSkeleton />;

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center">
          <Newspaper size={22} className="text-text-muted" />
        </div>
        <div>
          <p className="text-sm text-text-secondary font-medium">No recent news</p>
          <p className="text-xs text-text-muted mt-1">Nothing found for {countryName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-bg-card border border-border-subtle rounded-xl p-4 hover:border-accent-amber/30 hover:bg-bg-elevated transition-all"
        >
          {/* Title */}
          <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-amber transition-colors leading-snug mb-2">
            {article.title}
          </h3>

          {/* Summary */}
          {article.summary && (
            <p className="text-xs text-text-muted leading-relaxed mb-2.5 line-clamp-2">
              {article.summary}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {article.source && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-amber/10 text-accent-amber/80 border border-accent-amber/15">
                  {article.source}
                </span>
              )}
              {article.publishedAt && (
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock size={10} />
                  {timeAgo(article.publishedAt)}
                </span>
              )}
            </div>
            <ExternalLink size={12} className="text-text-muted group-hover:text-accent-amber transition-colors" />
          </div>
        </a>
      ))}
    </div>
  );
}
