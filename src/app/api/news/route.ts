import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Article {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  category?: string;
}

export type NewsSource = "gnews" | "rss" | "rate_limited" | "none";

interface NewsResponse {
  articles:     Article[];
  source:       NewsSource;
  sourceLabel:  string;
  realTime:     boolean;
  rateLimited?: boolean;
  info?:        string;
}

// ─── GNews rate-limit tracker (module-level, persists per process) ────────────
let gnewsRateLimitedUntil = 0;
function isGNewsRateLimited() { return Date.now() < gnewsRateLimitedUntil; }

// ─── Category → search keywords ───────────────────────────────────────────────
// These are embedded INTO the search query so both GNews /search
// and Google News RSS actually filter — instead of a silently-ignored ?topic= param.
const CATEGORY_KEYWORDS: Record<string, string> = {
  general:       "",   // pure country search
  nation:        "politics OR government OR election OR parliament OR president OR minister OR policy",
  business:      "economy OR business OR market OR finance OR stock OR trade OR GDP OR investment",
  technology:    "technology OR tech OR AI OR software OR startup OR digital OR innovation OR cyber",
  health:        "health OR medicine OR hospital OR disease OR vaccine OR medical OR healthcare",
  science:       "science OR research OR space OR climate OR discovery OR study OR environment",
  entertainment: "entertainment OR film OR music OR culture OR art OR cinema OR celebrity",
  sports:        "sport OR cricket OR football OR tennis OR Olympics OR match OR tournament OR athlete",
};

// ─── GNews fetcher ────────────────────────────────────────────────────────────
async function fetchGNews(
  country: string,
  category: string,
): Promise<{ articles: Article[]; rateLimited: boolean; noKey: boolean }> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return { articles: [], rateLimited: false, noKey: true };
  if (isGNewsRateLimited()) return { articles: [], rateLimited: true, noKey: false };

  try {
    const keywords = CATEGORY_KEYWORDS[category] ?? "";

    // Embed keywords directly in query — GNews /search ignores &topic= on free plan
    // Format: "Country" (keyword1 OR keyword2 OR ...)
    const rawQ = keywords
      ? `"${country}" (${keywords})`
      : `"${country}"`;

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(rawQ)}&lang=en&max=10&apikey=${apiKey}`;

    const res = await fetch(url, { next: { revalidate: 300 } });

    if (res.status === 429) {
      gnewsRateLimitedUntil = Date.now() + 24 * 60 * 60 * 1000;
      console.warn("[GlobeIQ] GNews daily quota exhausted — switching to RSS");
      return { articles: [], rateLimited: true, noKey: false };
    }
    if (!res.ok) {
      console.error(`[GlobeIQ] GNews HTTP ${res.status}`);
      return { articles: [], rateLimited: false, noKey: false };
    }

    const data       = await res.json();
    const raw: any[] = data.articles ?? [];

    return {
      articles: raw
        .filter((a) => a.title && a.url)
        .map((a) => ({
          title:       a.title.trim(),
          summary:     a.description?.trim() ?? "",
          source:      a.source?.name ?? "",
          publishedAt: a.publishedAt ?? "",
          url:         a.url,
          imageUrl:    a.image ? `/api/proxy-image?url=${encodeURIComponent(a.image)}` : undefined,
          category,
        })),
      rateLimited: false,
      noKey: false,
    };
  } catch (err) {
    console.error("[GlobeIQ] GNews error:", err);
    return { articles: [], rateLimited: false, noKey: false };
  }
}

// ─── RSS helpers ──────────────────────────────────────────────────────────────
function between(xml: string, tag: string): string {
  const s = xml.indexOf(`<${tag}`);
  if (s === -1) return "";
  const cs = xml.indexOf(">", s) + 1;
  const e  = xml.indexOf(`</${tag}>`, cs);
  if (e === -1) return "";
  return xml.substring(cs, e).trim();
}
function stripCdata(s: string) { return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim(); }
function stripHtml(s: string)  { return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }

// ─── Google News RSS fetcher ───────────────────────────────────────────────────
async function fetchGoogleNewsRss(country: string, category: string): Promise<Article[]> {
  try {
    const keywords = CATEGORY_KEYWORDS[category] ?? "";

    // Build a proper Google News boolean query
    // e.g.  India (economy OR business OR market)
    const q = keywords ? `${country} (${keywords})` : country;

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`;

    const res = await fetch(url, {
      headers: { "User-Agent": "GlobeIQ/2.0 (+https://github.com/ravimildseven/globe-iq)" },
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];

    const xml   = await res.text();
    const items = xml.split("<item>").slice(1, 13);

    return items
      .map((item): Article => {
        const title   = stripCdata(between(item, "title"));
        const link    = between(item, "link");
        const pubDate = between(item, "pubDate");
        const source  = stripCdata(between(item, "source"));
        const desc    = stripHtml(stripCdata(between(item, "description")));
        const imgMatch = item.match(/url=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/i);
        const imageUrl = imgMatch
          ? `/api/proxy-image?url=${encodeURIComponent(imgMatch[1])}`
          : undefined;
        return {
          title:       title.replace(/\s+-\s+[^-]+$/, "").trim(),
          summary:     desc.slice(0, 220),
          source,
          publishedAt: pubDate,
          url:         link,
          imageUrl,
          category,
        };
      })
      .filter((a) => a.title.length > 5);
  } catch {
    return [];
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
// ?country=India&category=business&prefer=auto|gnews|rss
export async function GET(request: NextRequest) {
  const country  = request.nextUrl.searchParams.get("country");
  const category = request.nextUrl.searchParams.get("category") || "general";
  // "prefer" lets the user force a specific source from the UI
  const prefer   = request.nextUrl.searchParams.get("prefer") || "auto"; // auto | gnews | rss

  if (!country) return NextResponse.json({ error: "Missing country" }, { status: 400 });

  // ── Force RSS ──────────────────────────────────────────────────────────────
  if (prefer === "rss") {
    const articles = await fetchGoogleNewsRss(country, category);
    return NextResponse.json({
      articles,
      source:      articles.length > 0 ? "rss" : "none",
      sourceLabel: "Google News RSS",
      realTime:    true,
      info:        "Real-time · 2-minute cache · No API key required",
    } satisfies NewsResponse);
  }

  // ── Try GNews (auto or forced) ─────────────────────────────────────────────
  const gnews = await fetchGNews(country, category);

  if (gnews.noKey) {
    const articles = await fetchGoogleNewsRss(country, category);
    return NextResponse.json({
      articles,
      source:      articles.length > 0 ? "rss" : "none",
      sourceLabel: "Google News RSS",
      realTime:    true,
      info:        "No GNews API key — using RSS. Set GNEWS_API_KEY for richer news.",
    } satisfies NewsResponse);
  }

  if (gnews.rateLimited) {
    const articles = await fetchGoogleNewsRss(country, category);
    return NextResponse.json({
      articles,
      source:      articles.length > 0 ? "rss" : "none",
      sourceLabel: "Google News RSS",
      realTime:    true,
      rateLimited: true,
      info:        "GNews 100/day quota reached — auto-switched to RSS. Resets midnight UTC.",
    } satisfies NewsResponse);
  }

  if (gnews.articles.length > 0) {
    return NextResponse.json({
      articles:    gnews.articles,
      source:      "gnews",
      sourceLabel: "GNews API",
      realTime:    false,
      info:        "GNews free plan · ~12h article delay · 100 req/day",
    } satisfies NewsResponse);
  }

  // GNews key present but 0 results — fall back to RSS
  const rssArticles = await fetchGoogleNewsRss(country, category);
  return NextResponse.json({
    articles:    rssArticles,
    source:      rssArticles.length > 0 ? "rss" : "none",
    sourceLabel: "Google News RSS",
    realTime:    true,
    info:        "GNews returned 0 results for this category — using RSS.",
  } satisfies NewsResponse);
}
