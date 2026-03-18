"use client";

import { NewsArticle } from "@/lib/types";
import { ExternalLink, Clock } from "lucide-react";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function ArticleSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-bg-card rounded-xl p-4 animate-pulse">
          <div className="h-4 w-3/4 bg-bg-elevated rounded mb-2" />
          <div className="h-3 w-full bg-bg-elevated rounded mb-2" />
          <div className="h-3 w-1/3 bg-bg-elevated rounded" />
        </div>
      ))}
    </div>
  );
}

export default function NewsTab({
  articles,
  loading,
  countryName,
}: {
  articles: NewsArticle[];
  loading: boolean;
  countryName: string;
}) {
  if (loading) return <ArticleSkeleton />;

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
          <Clock size={24} className="text-text-muted" />
        </div>
        <p className="text-text-muted text-sm">No recent news found for {countryName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-bg-card border border-border-subtle rounded-xl p-4 hover:border-hud-border hover:card-glow transition-all group"
        >
          <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors leading-snug mb-1.5">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-xs text-text-muted leading-relaxed mb-2 line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              {article.source && (
                <span className="px-2 py-0.5 rounded bg-bg-elevated text-text-secondary">
                  {article.source}
                </span>
              )}
              {article.publishedAt && (
                <span>{timeAgo(article.publishedAt)}</span>
              )}
            </div>
            <ExternalLink size={12} className="text-text-muted group-hover:text-accent-blue transition-colors" />
          </div>
        </a>
      ))}
    </div>
  );
}
