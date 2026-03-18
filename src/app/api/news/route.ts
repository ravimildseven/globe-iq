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

// ─── GNews rate-limit state (module-level — persists for process lifetime) ────
// When GNews returns 429, we skip it for the rest of the day.
let gnewsRateLimitedUntil = 0; // Unix timestamp (ms)

function isGNewsRateLimited(): boolean {
  return Date.now() < gnewsRateLimitedUntil;
}

// GNews topics that are valid for their API
// "nation" returns US-centric news so we map it to "world" for international
const GNEWS_TOPIC_MAP: Record<string, string> = {
  general:       "",          // No topic — pure search
  nation:        "world",     // Maps to world news for international countries
  business:      "business",
  technology:    "technology",
  health:        "health",
  science:       "science",
  entertainment: "entertainment",
  sports:        "sports",
};

// ─── GNews fetcher ────────────────────────────────────────────────────────────
async function fetchGNews(
  country: string,
  category: string
): Promise<{ articles: Article[]; rateLimited: boolean; noKey: boolean }> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return { articles: [], rateLimited: false, noKey: true };
  if (isGNewsRateLimited()) return { articles: [], rateLimited: true, noKey: false };

  try {
    const topic = GNEWS_TOPIC_MAP[category] ?? "";
    const q     = encodeURIComponent(`"${country}"`);
    const url   =
      `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&apikey=${apiKey}` +
      (topic ? `&topic=${topic}` : "");

    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5-min Next.js cache — GNews free has 12h delay anyway
    });

    // Rate limited
    if (res.status === 429) {
      gnewsRateLimitedUntil = Date.now() + 24 * 60 * 60 * 1000; // skip for 24h
      console.warn("[GlobeIQ] GNews daily quota exhausted — switching to RSS fallback");
      return { articles: [], rateLimited: true, noKey: false };
    }

    // Auth / other error
    if (!res.ok) {
      console.error(`[GlobeIQ] GNews error ${res.status}`);
      return { articles: [], rateLimited: false, noKey: false };
    }

    const data = await res.json();

    // GNews returns articles even when 0 (totalArticles: 0 with info message)
    const raw: any[] = data.articles ?? [];

    const articles: Article[] = raw
      .filter((a) => a.title && a.url)
      .map((a) => ({
        title:       a.title?.trim() ?? "",
        summary:     a.description?.trim() ?? "",
        source:      a.source?.name ?? "",
        publishedAt: a.publishedAt ?? "",
        url:         a.url ?? "",
        // Proxy image through our API to bypass hotlinking protection
        imageUrl:    a.image ? `/api/proxy-image?url=${encodeURIComponent(a.image)}` : undefined,
        category,
      }));

    return { articles, rateLimited: false, noKey: false };
  } catch (err) {
    console.error("[GlobeIQ] GNews fetch failed:", err);
    return { articles: [], rateLimited: false, noKey: false };
  }
}

// ─── RSS helpers ──────────────────────────────────────────────────────────────
function between(xml: string, tag: string): string {
  const open  = `<${tag}`;
  const close = `</${tag}>`;
  const s = xml.indexOf(open);
  if (s === -1) return "";
  const contentStart = xml.indexOf(">", s) + 1;
  const e = xml.indexOf(close, contentStart);
  if (e === -1) return "";
  return xml.substring(contentStart, e).trim();
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ─── Google News RSS fetcher (fallback) ───────────────────────────────────────
const RSS_TOPIC_SUFFIX: Record<string, string> = {
  nation:        " government OR politics OR election",
  business:      " economy OR finance OR market OR GDP",
  technology:    " technology OR AI OR digital OR startup",
  science:       " science OR research OR discovery",
  health:        " health OR medicine OR hospital",
  sports:        " sport OR football OR cricket OR Olympics",
  entertainment: " entertainment OR culture OR film OR music",
};

async function fetchGoogleNewsRss(country: string, category: string): Promise<Article[]> {
  try {
    const suffix        = RSS_TOPIC_SUFFIX[category] ?? "";
    const enrichedQuery = `${country}${suffix}`;
    const url =
      `https://news.google.com/rss/search?q=${encodeURIComponent(enrichedQuery)}&hl=en&gl=US&ceid=US:en`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "GlobeIQ/2.0 (+https://github.com/ravimildseven/globe-iq)",
      },
      next: { revalidate: 120 }, // 2-min cache — near real-time
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

        // Google News RSS rarely includes images — try anyway
        const imgMatch = item.match(/url=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/i);
        const rawImage = imgMatch?.[1];
        // Proxy if found
        const imageUrl = rawImage
          ? `/api/proxy-image?url=${encodeURIComponent(rawImage)}`
          : undefined;

        return {
          title:       title.replace(/\s+-\s+[^-]+$/, "").trim(), // strip "- Source Name" suffix
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
export async function GET(request: NextRequest) {
  const country  = request.nextUrl.searchParams.get("country");
  const category = request.nextUrl.searchParams.get("category") || "general";

  if (!country) {
    return NextResponse.json({ error: "Missing country parameter" }, { status: 400 });
  }

  // 1. Try GNews
  const gnews = await fetchGNews(country, category);

  if (gnews.noKey) {
    // No API key — go straight to RSS
    const articles = await fetchGoogleNewsRss(country, category);
    return NextResponse.json({
      articles,
      source:    articles.length > 0 ? "rss" : "none",
      sourceLabel: "Google News RSS",
      realTime:  true,
      info:      "Set GNEWS_API_KEY in .env.local for richer news",
    } satisfies NewsResponse);
  }

  if (gnews.rateLimited) {
    // Rate limited — fall back to RSS and tell frontend
    const articles = await fetchGoogleNewsRss(country, category);
    return NextResponse.json({
      articles,
      source:    articles.length > 0 ? "rss" : "none",
      sourceLabel: "Google News RSS (GNews quota reached)",
      realTime:  true,
      rateLimited: true,
      info:      "GNews daily quota exhausted. Resets at midnight UTC. Using RSS until then.",
    } satisfies NewsResponse);
  }

  if (gnews.articles.length > 0) {
    return NextResponse.json({
      articles:  gnews.articles,
      source:    "gnews",
      sourceLabel: "GNews API",
      realTime:  false, // Free plan: 12h delay
      info:      "GNews free plan: ~12h delay. Upgrade for real-time.",
    } satisfies NewsResponse);
  }

  // GNews returned 0 results — fall back to RSS
  const rssArticles = await fetchGoogleNewsRss(country, category);
  return NextResponse.json({
    articles:  rssArticles,
    source:    rssArticles.length > 0 ? "rss" : "none",
    sourceLabel: "Google News RSS",
    realTime:  true,
    info:      "GNews returned no results for this query — using RSS.",
  } satisfies NewsResponse);
}

// ─── Shared response type ─────────────────────────────────────────────────────
interface NewsResponse {
  articles:    Article[];
  source:      NewsSource;
  sourceLabel: string;
  realTime:    boolean;
  rateLimited?: boolean;
  info?:       string;
}
