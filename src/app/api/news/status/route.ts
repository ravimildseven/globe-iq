import { NextResponse } from "next/server";

/**
 * GET /api/news/status
 * Verifies GNews API key is valid and returns quota / source health info.
 */
export async function GET() {
  const apiKey = process.env.GNEWS_API_KEY;

  // ── GNews check ──────────────────────────────────────────────────────────
  let gnewsStatus: "ok" | "rate_limited" | "invalid_key" | "no_key" | "error" = "no_key";
  let gnewsMessage = "No API key configured";
  let gnewsArticleCount = 0;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=world&lang=en&max=1&apikey=${apiKey}`,
        { cache: "no-store" } // always fresh for a status check
      );

      if (res.status === 429) {
        gnewsStatus  = "rate_limited";
        gnewsMessage = "Daily quota exhausted (100 req/day on free plan). Resets at midnight UTC.";
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        gnewsStatus  = "invalid_key";
        gnewsMessage = `API key rejected by GNews (HTTP ${res.status})`;
      } else if (!res.ok) {
        gnewsStatus  = "error";
        gnewsMessage = `Unexpected GNews error: HTTP ${res.status}`;
      } else {
        const data       = await res.json();
        gnewsArticleCount = data.totalArticles ?? 0;
        gnewsStatus  = "ok";
        gnewsMessage =
          data.information?.realTimeArticles?.message
            ? "⚠️  Free plan: ~12 hour delay on articles. Upgrade at gnews.io for real-time."
            : "✅  API key valid and active";
      }
    } catch (err: any) {
      gnewsStatus  = "error";
      gnewsMessage = `Network error: ${err?.message ?? "unknown"}`;
    }
  }

  // ── RSS check ─────────────────────────────────────────────────────────────
  let rssStatus: "ok" | "error" = "ok";
  let rssMessage = "Available";

  try {
    const rssRes = await fetch(
      "https://news.google.com/rss/search?q=world&hl=en&gl=US&ceid=US:en",
      { cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    if (!rssRes.ok) {
      rssStatus  = "error";
      rssMessage = `HTTP ${rssRes.status}`;
    }
  } catch {
    rssStatus  = "error";
    rssMessage = "Unreachable";
  }

  return NextResponse.json({
    gnews: {
      status:       gnewsStatus,
      message:      gnewsMessage,
      hasKey:       !!apiKey,
      articleCount: gnewsArticleCount,
    },
    rss: {
      status:  rssStatus,
      message: rssMessage,
    },
    activeSource:
      gnewsStatus === "ok"           ? "gnews"
      : gnewsStatus === "rate_limited" ? "rss (gnews quota hit)"
      : "rss",
    checkedAt: new Date().toISOString(),
  });
}
